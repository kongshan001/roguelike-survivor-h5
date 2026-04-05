# 设计规格书：无尽模式 (Endless Mode)

> 版本: v1.2.2+ | 策划 Agent | Drive #14
> 状态: 设计完成，待前端实现

---

## 1. 设计概述

当前游戏固定5分钟一局，270秒Boss登场后30秒内击杀即胜利，否则失败。玩家在5分钟内通常只能将1-2种武器升至满级，很难体验完整的进化+协同Build。**无尽模式**在击败Boss后解锁，允许玩家继续游戏直到死亡，难度持续递增。无尽模式的核心价值：

- 让玩家完整体验进化+协同Build（6种进化武器需要更长的发育时间）
- 提供无上限的挑战目标（最远存活时间、最高击杀数）
- 与Quest系统联动（无尽模式专属挑战任务）
- 与商店系统联动（更长局 = 更多灵魂碎片）
- 几乎零新系统开销（复用现有生成/难度/进化机制）

## 2. 解锁条件

**击败Boss一次后解锁无尽模式。**

- 解锁标记存储在 `Save.data.endlessUnlocked`
- 默认 `false`，首次击败Boss后设为 `true`
- 标题画面"选择难度"步骤中，已解锁无尽模式的玩家可看到额外选项

### 解锁逻辑

```
endGame(true) 中:
  if (game.bossKilled) {
    const d = Save.load();
    if (!d.endlessUnlocked) {
      d.endlessUnlocked = true;
      Save.save(d);
    }
  }
```

## 3. 模式选择流程

当前流程: 角色选择 -> 难度选择 -> 武器选择(如有) -> 游戏
修改后: 角色选择 -> 难度选择+模式选择 -> 武器选择(如有) -> 游戏

### UI 变更

难度选择界面 (`#diff-select`) 新增第4张卡片（无尽模式），位于三档难度下方或右侧。

```
+--------------------------------------------------+
|              选择难度 & 模式                        |
|                                                    |
|  [休闲]  [标准]  [噩梦]                            |
|                                                    |
|  [∞ 无尽模式]  (灰色锁定 / 已解锁高亮)              |
|   击败Boss后解锁，难度无限递增                      |
+--------------------------------------------------+
```

**无尽模式卡片状态：**
- 未解锁：灰色 + 锁图标 + "击败Boss后解锁"
- 已解锁：紫金色边框 + ∞ 图标 + "挑战无上限"

## 4. CFG 常量

```js
ENDLESS: {
  enabled: true,
  // Boss 周期（秒）— 无尽模式中每240秒出现一个新Boss
  bossInterval: 240,
  // 每个Boss周期的HP/速度递增倍率
  bossScalePerCycle: { hpMul: 1.5, speedMul: 1.1 },
  // 敌人属性递增（每分钟额外倍率，叠加在基础难度之上）
  // 基础: hpMul = (1 + minutes * 0.2), 无尽额外: minutes * endlessExtraHpPerMin
  extraHpPerMin: 0.1,
  extraSpdPerMin: 0.05,
  // 生成速率递减下限（秒，不再更快）
  minSpawnInterval: 0.25,
  // 最大敌人数量递增（每分钟+2，上限）
  maxEnemyBonus: 30,
  maxEnemiesCap: 100,
  // 波次里程碑提示（每60秒）
  milestoneInterval: 60,
  // 无尽模式专属奖励倍率（灵魂碎片）
  soulFragmentBonusMul: 1.5,
  // 击杀奖励：每分钟游戏时间，击杀金币+1
  goldBonusPerMin: 0.5,
  // Boss击杀奖励
  bossKillReward: { gold: 50, exp: 30, food: 5 },
}
```

## 5. 核心机制变更

### 5.1 时间限制

- **标准/休闲/噩梦**：300秒硬上限，不变
- **无尽模式**：无时间上限，`GAME_TIME` 检查跳过

**实现点 (game.js):**

```js
// 当前:
if (window.game.elapsed >= CFG.GAME_TIME && !window.game.won) {
  endGame(false); return;
}

// 修改后:
if (!window.game.endless && window.game.elapsed >= CFG.GAME_TIME && !window.game.won) {
  endGame(false); return;
}
```

### 5.2 Boss 周期生成

- 标准5分钟模式：270秒出现1个Boss（不变）
- 无尽模式：270秒出现第1个Boss，之后每240秒出现1个新Boss
- 每个新Boss的HP = `baseHp * bossScalePerCycle.hpMul ^ cycleIndex * difficulty.bossHpMul`
- 每个新Boss的速度 = `baseSpeed * bossScalePerCycle.speedMul ^ cycleIndex * difficulty.bossSpeedMul`

**Boss周期表（标准难度无尽模式）：**

| Boss # | 出现时间 | HP | 速度 |
|--------|---------|-----|------|
| 1 | 4:30 (270s) | 200 | 30 |
| 2 | 8:30 (510s) | 300 | 33 |
| 3 | 12:30 (750s) | 450 | 36.3 |
| 4 | 16:30 (990s) | 675 | 40 |
| 5 | 20:30 (1230s) | 1013 | 44 |

**实现点 (game.js Boss生成):**

```js
// 当前:
if (window.game.elapsed >= 270 && !window.game.bossSpawned) { ... }

// 修改后:
const isEndless = window.game.endless;
if (!isEndless) {
  // 标准模式: 270s 出现唯一Boss
  if (window.game.elapsed >= 270 && !window.game.bossSpawned) {
    spawnBoss(0); // cycle 0
  }
} else {
  // 无尽模式: 270s 出现第1个, 之后每240s出现新的
  const firstBossTime = 270;
  if (window.game.elapsed >= firstBossTime) {
    const cycleIndex = Math.floor((window.game.elapsed - firstBossTime) / CFG.ENDLESS.bossInterval);
    const nextBossTime = firstBossTime + cycleIndex * CFG.ENDLESS.bossInterval;
    if (window.game.elapsed >= nextBossTime && window.game.bossCycleIndex < cycleIndex) {
      spawnBoss(cycleIndex);
    }
  }
}
```

**game state 新增字段:**
```js
{
  // ...existing...
  endless: false,           // 是否无尽模式
  bossCycleIndex: -1,       // 当前Boss周期（-1=未出现, 0=第1个Boss, ...）
  bossKillCount: 0,         // 无尽模式中击杀的Boss数量
}
```

### 5.3 难度递增

无尽模式使用与标准/休闲/噩梦相同的难度乘数基础，但额外叠加时间递增。

**敌人属性递增公式:**

```
// 当前(标准5分钟):
hpMul = (1 + minutes * 0.2) * difficulty.enemyHpMul
spdMul = (1 + minutes * 0.1) * difficulty.enemySpeedMul

// 无尽模式(在5分钟后继续递增):
hpMul = (1 + minutes * (0.2 + CFG.ENDLESS.extraHpPerMin)) * difficulty.enemyHpMul
spdMul = (1 + minutes * (0.1 + CFG.ENDLESS.extraSpdPerMin)) * difficulty.enemySpeedMul
```

**数值验证（标准难度，无尽模式10分钟时）:**
- 敌人HP倍率: (1 + 10 * 0.3) * 1.0 = 4.0x（当前5分钟 = 2.0x，合理递增）
- 敌人速度倍率: (1 + 10 * 0.15) * 1.0 = 2.5x（当前5分钟 = 1.5x，可应对）
- 僵尸HP: 3 * 4.0 = 12 HP（可击杀，但需要更多命中）
- 精英骷髅HP: 12 * 4.0 = 48 HP（高威胁，需要进化武器）

**数值验证（标准难度，无尽模式20分钟时）:**
- 敌人HP倍率: (1 + 20 * 0.3) * 1.0 = 7.0x
- 僵尸HP: 3 * 7.0 = 21 HP（极高，需要满级武器）
- Boss(第5个) HP: 200 * 1.5^4 = 1013 HP（极高，需要协同Build）

### 5.4 生成速率递增

**当前生成间隔 (getSpawnRate):**
- 0-60s: 2.0s
- 60-120s: 1.5s
- 120-180s: 1.0s
- 180-240s: 0.7s
- 240-270s: 0.5s
- 270+s: 0.4s

**无尽模式生成间隔（5分钟后继续递减）:**

```js
// spawner.js 修改
export function getSpawnRate(elapsed, endless) {
  if (!endless) {
    // 现有逻辑不变
    if (elapsed < 60)  return { interval: 2.0, count: 2, types: ['zombie'] };
    // ...existing...
    return { interval: 0.4, count: 4, types: [...] };
  }
  // 无尽模式: 前5分钟复用标准逻辑
  if (elapsed < 270) return getSpawnRate(elapsed, false);
  // 5分钟后: 间隔继续递减, 数量继续增加
  const minutes = elapsed / 60;
  const interval = Math.max(CFG.ENDLESS.minSpawnInterval, 0.4 - (minutes - 4.5) * 0.03);
  const count = Math.min(8, 4 + Math.floor((minutes - 4.5) * 0.5));
  // 敌人池: 5分钟后所有类型 + Boss周期时增加splitter权重
  const types = ['zombie', 'bat', 'skeleton', 'ghost', 'elite_skeleton', 'splitter', 'splitter'];
  return { interval, count, types };
}
```

**生成间隔递减表（无尽模式，270s+）:**

| 时间 | 间隔 | 数量 | 说明 |
|------|------|------|------|
| 4:30 | 0.40s | 4 | 与标准模式相同 |
| 6:00 | 0.35s | 5 | 开始加速 |
| 8:00 | 0.29s | 5 | Boss周期 |
| 10:00 | 0.25s | 6 | 达到间隔下限 |
| 12:00 | 0.25s | 6 | Boss周期 |
| 15:00 | 0.25s | 7 | 数量继续增加 |
| 20:00 | 0.25s | 8 | 数量上限 |

### 5.5 MAX_ENEMIES 递增

```js
// 当前: CFG.MAX_ENEMIES = 70 (硬上限)
// 无尽模式: 每分钟+2，上限100
const effectiveMax = endless
  ? Math.min(CFG.ENDLESS.maxEnemiesCap, CFG.MAX_ENEMIES + Math.floor(minutes * 2))
  : CFG.MAX_ENEMIES;
```

| 时间 | 最大敌人数 | 说明 |
|------|-----------|------|
| 0-5min | 70 | 标准 |
| 10min | 90 | 显著增加 |
| 15min | 100 | 达到上限 |

### 5.6 击杀奖励递增

```js
// 当前: player.gold += 10 + comboGold
// 无尽模式:
const goldBase = 10 + Math.floor(minutes * CFG.ENDLESS.goldBonusPerMin);
player.gold += goldBase + comboGold;
```

**金币递增表:**

| 时间 | 基础金币/击杀 | 5连击额外 |
|------|-------------|----------|
| 0-5min | 10 | +1 |
| 10min | 15 | +1 |
| 15min | 17 | +1 |
| 20min | 20 | +1 |

## 6. 胜利/失败条件

| 模式 | 胜利 | 失败 |
|------|------|------|
| 标准/休闲/噩梦 | 击败Boss | HP<=0 或 时间到(300s) |
| 无尽模式 | **无胜利条件** | HP<=0 |

**结算画面变更（无尽模式）：**
- 标题: "💀 英雄倒下"（始终失败画面，无胜利画面）
- 统计内容:
  - 存活时间（核心指标）
  - 击杀数
  - Boss击杀数（新增）
  - 最高连击
  - 获得灵魂碎片
- 新纪录标记: 存活时间超过历史最佳时显示 "🆕新纪录!"

## 7. 结算灵魂碎片

```js
// 标准模式:
const earnedSF = Math.floor(player.gold * 0.3 * goldMul) + questReward;

// 无尽模式:
const earnedSF = Math.floor(player.gold * 0.3 * goldMul * CFG.ENDLESS.soulFragmentBonusMul) + questReward;
```

无尽模式 1.5x 灵魂碎片倍率补偿更长局的游戏时间投入。

**碎片收益预估（标准难度无尽模式）：**

| 存活时间 | 约击杀数 | 约金币 | 基础碎片 | 1.5x后 | 对比标准5分钟局 |
|---------|---------|-------|---------|--------|--------------|
| 5min | ~60 | ~600 | 180 | 270 | 约2x |
| 10min | ~150 | ~2000 | 600 | 900 | 约7x |
| 15min | ~250 | ~4000 | 1200 | 1800 | 约14x |
| 20min | ~350 | ~6000 | 1800 | 2700 | 约20x |

更长局的碎片收益指数级增长，但难度也指数级增长。10分钟是平均高手的极限，20分钟需要完美协同Build。

## 8. 波次进度提示适配

**当前 CFG.WAVE_PROGRESS.stages 仅覆盖5分钟。**

无尽模式需要扩展阶段表。建议方案：5分钟前使用现有阶段表，5分钟后使用无尽专属阶段。

**无尽模式阶段表:**

| 时间 | 阶段名 | 颜色 | 说明 |
|------|--------|------|------|
| 0-4:30 | (复用现有) | | |
| 4:30-8:30 | Boss周期I | `#ff1744` | Boss+全类型 |
| 8:30-12:30 | Boss周期II | `#d50000` | 更强Boss+全类型 |
| 12:30+ | 深渊 | `#880e4f` | 难度无上限 |

**HUD 适配:**
- 计时器改为 `MM:SS` 格式（当前 `M:SS` 只能显示个位数分钟）
- 进度条: 无尽模式不显示进度条（无终点），改为显示"当前阶段名"
- Boss倒计时: 显示"下一个Boss: X:XX"

## 9. Boss 击杀奖励

无尽模式中击败Boss给予额外奖励：

```js
// Boss死亡时:
if (game.endless) {
  const reward = CFG.ENDLESS.bossKillReward;
  player.gold += reward.gold;
  // 5个食物掉落（而非标准3个）
  for (let f = 0; f < reward.food; f++) {
    game.foods.push(new Food(boss.x + rand(-15, 15), boss.y + rand(-15, 15), 'boss'));
  }
  // 30经验宝石
  for (let g = 0; g < 5; g++) {
    game.gems.push(new Gem(boss.x + rand(-12, 12), boss.y + rand(-12, 12), 6));
  }
  game.bossKillCount++;
}
```

## 10. 与现有系统的交互

### 10.1 武器系统
- 无尽模式不影响武器数值和进化逻辑
- 更长的发育时间让玩家有机会完成多个进化
- 协同系统在更长局中发挥更大价值（6个被动+2个进化武器在10分钟时完全可能）

### 10.2 敌人系统
- 所有8种敌人在无尽模式中持续出现
- 敌人属性持续递增但不会出现新类型
- 分裂虫在高难度下分裂体更难清除

### 10.3 商店系统
- 无尽模式 1.5x 灵魂碎片倍率直接作用于商店收入
- 每局更高碎片收入加速局外升级

### 10.4 Quest系统
- 新增无尽模式专属Quest（见下节）
- 现有Quest（击杀数、连击、Boss击杀）在无尽模式中更容易完成

### 10.5 存档扩展

```js
// Save._default() 新增字段:
{
  // ...existing...
  endlessUnlocked: false,   // 无尽模式是否已解锁
  bestEndlessTime: 0,       // 最长无尽存活时间（秒）
  bestEndlessKills: 0,      // 最高无尽击杀数
  bestEndlessBossKills: 0,  // 最高无尽Boss击杀数
}
```

## 11. 无尽模式专属 Quest

```js
// CFG.QUESTS 新增:
{ id: 'endless_5min',  name: '无尽征途', icon: '∞',
  desc: '无尽模式存活5分钟',
  check: s => s.endless && s.elapsed >= 300,
  reward: 150 },
{ id: 'endless_10min', name: '不朽传说', icon: '⏱',
  desc: '无尽模式存活10分钟',
  check: s => s.endless && s.elapsed >= 600,
  reward: 300 },
{ id: 'endless_boss3', name: '连斩三龙', icon: '🐲',
  desc: '单局无尽模式击杀3个Boss',
  check: s => s.endless && s.bossKillCount >= 3,
  reward: 400 },
{ id: 'endless_kill200', name: '无尽屠戮', icon: '💀',
  desc: '单局无尽模式击杀200个敌人',
  check: s => s.endless && s.kills >= 200,
  reward: 250 },
```

**Quest check 扩展 -- stats 对象新增字段:**
```js
const stats = {
  // ...existing...
  endless: window.game.endless,
  bossKillCount: window.game.bossKillCount || 0,
};
```

## 12. 实现要点清单

### config.js
1. 新增 `CFG.ENDLESS` 常量块
2. 新增4个无尽Quest到 `CFG.QUESTS`

### save.js
3. `_default()` 新增 `endlessUnlocked`, `bestEndlessTime`, `bestEndlessKills`, `bestEndlessBossKills`
4. `record()` 方法新增无尽模式最佳记录更新逻辑
5. 存档迁移: 旧存档补全新字段

### game.js
6. `beginGame()` 新增 `endless: selectedMode === 'endless'` 到 game state
7. `beginGame()` 新增 `bossCycleIndex: -1, bossKillCount: 0` 到 game state
8. 时间限制检查: `if (!window.game.endless && ...)` 条件包裹
9. Boss生成逻辑: 无尽模式使用周期生成
10. 生成速率: `getSpawnRate()` 传入 `endless` 参数
11. MAX_ENEMIES: 无尽模式动态计算
12. 敌人HP/速度乘数: 无尽模式额外递增
13. 击杀金币: 无尽模式递增基础值
14. Boss击杀奖励: 无尽模式额外奖励
15. 结算逻辑: 无尽模式使用无尽专属记录 + 1.5x碎片倍率

### spawner.js
16. `getSpawnRate(elapsed, endless)` 扩展参数，无尽模式独立逻辑

### Player.js
17. 无变更（Boss击杀计数在game层处理）

### upgrade-generate.js
18. 无变更（升级生成逻辑不受模式影响）

### scenes.js / index.html
19. 难度选择界面新增无尽模式卡片
20. 计时器格式: 无尽模式使用 `MM:SS`

### hud.js
21. 进度条: 无尽模式隐藏进度条，显示阶段名+Boss倒计时

## 13. 数值平衡总结

| 维度 | 标准5分钟 | 无尽10分钟 | 无尽20分钟 |
|------|---------|-----------|-----------|
| 僵尸HP | 6 (3*2.0x) | 12 (3*4.0x) | 21 (3*7.0x) |
| 精英骷髅HP | 24 (12*2.0x) | 48 (12*4.0x) | 84 (12*7.0x) |
| Boss HP | 200 | 450 (第3个) | 1013 (第5个) |
| 生成间隔 | 0.4s | 0.25s | 0.25s |
| 每次生成 | 4 | 6 | 8 |
| 最大敌人数 | 70 | 90 | 100 |
| 基础金币/击杀 | 10 | 15 | 20 |
| 灵魂碎片(预估) | 180 | 900 | 2700 |

**核心平衡约束:**
- 10分钟时敌人数值约为5分钟的2倍，但玩家此时应有2个满级武器+1个进化武器+3-4个被动+2-3个协同，DPS约为5分钟时的4-5倍
- 20分钟时敌人数值约为5分钟的3.5倍，但玩家理论上可以拥有3个进化武器+6个被动满叠+6个协同+满级商店buff，DPS约为10-15倍
- 持续到20分钟需要完美的协同Build选择和操作技巧
- 大多数玩家在8-12分钟之间自然结束，这是一个健康的局时长范围

## 14. 设计决策记录

1. **为什么用"击败Boss解锁"而非默认开放**: 让玩家先体验标准5分钟模式的核心循环，理解Boss机制后再挑战无尽模式。门槛低（Boss在休闲难度下很容易），但提供了明确的进度感。

2. **为什么Boss周期240秒而非更短**: 240秒给玩家足够时间在两个Boss之间稳定发育、开宝箱、拾取宝石。180秒太紧凑（Boss刚死新Boss就来），300秒太松散（缺乏压力节奏）。

3. **为什么碎片倍率1.5x而非更高**: 无尽10分钟局碎片约900，是标准5分钟局180的5倍。1.5x只是额外加成，实际碎片主要来自更长局的更多击杀金币累积。过高倍率会破坏商店经济平衡。

4. **为什么不设计新敌人/武器给无尽模式**: 无尽模式的价值在于"用现有工具面对无限挑战"，不需要新内容。所有现有系统（进化、协同、连击、商店、冲刺）在更长局中自然展现更深层策略。

5. **为什么MAX_ENEMIES上限100而非更高**: 100个同屏敌人已经接近Canvas 2D性能极限。超过100会导致帧率下降，影响游戏体验。生成间隔下限0.25s和最大8个/波配合100上限是合理的密度天花板。

6. **为什么用递增公式而非阶段表**: 递增公式（每分钟+0.1 HP倍率）是平滑曲线，不会出现"突然变难"的断裂感。阶段表适用于固定时长的模式（5分钟），递增公式适用于无上限模式。

7. **为什么不加"重置Build"功能**: 无尽模式的核心是"一个Build走到底"的决策压力。如果允许重置，就失去了"每次选择都重要"的策略感。
