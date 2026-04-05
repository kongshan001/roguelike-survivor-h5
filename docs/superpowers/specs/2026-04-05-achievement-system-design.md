# 成就系统设计规格 (Achievement System)

**版本**: v1.3.0
**日期**: 2026-04-05
**设计者**: Designer Agent (Drive #15)
**优先级**: P1

---

## 1. 设计概述

成就系统是跨局长期里程碑追踪机制，记录玩家在整个游戏生涯中达成的目标。与 Quest 系统（单局目标，一次性完成）不同，成就是累计型进度追踪，覆盖"首次体验""精通挑战""收集完成"三层目标，驱动多周目重玩。

**核心价值**：
- Quest 提供"这局要做什么"（短期目标），Achievement 提供"我玩到了什么程度"（长期里程碑）
- 成就进度条给玩家"离完成还有多远"的感知，驱动再玩一局
- 与 Quest/商店/角色系统联动，形成完整的目标-奖励-成长闭环

**设计原则**：
- 成就奖励灵魂碎片（而非新内容），与商店经济系统统一
- 进度型成就显示进度条（如"击杀500只敌人：342/500"）
- 前端可复用 Quest 面板的 UI 组件，降低开发量

---

## 2. CFG.ACHIEVEMENTS 常量表

```js
ACHIEVEMENTS: {
  // === 里程碑类 ===
  total_kills_100:   { name:'百战之士',   icon:'⚔️',  desc:'累计击杀100只敌人',     type:'milestone', check:{stat:'totalKills',target:100},   reward:30 },
  total_kills_500:   { name:'屠戮先锋',   icon:'💀',  desc:'累计击杀500只敌人',     type:'milestone', check:{stat:'totalKills',target:500},   reward:80 },
  total_kills_2000:  { name:'杀戮之王',   icon:'👑',  desc:'累计击杀2000只敌人',    type:'milestone', check:{stat:'totalKills',target:2000},  reward:200 },
  games_10:          { name:'初出茅庐',   icon:'🎮',  desc:'游玩10局',             type:'milestone', check:{stat:'gamesPlayed',target:10},    reward:20 },
  games_50:          { name:'身经百战',   icon:'🏆',  desc:'游玩50局',             type:'milestone', check:{stat:'gamesPlayed',target:50},    reward:60 },

  // === 生存类 ===
  survive_3min:      { name:'三分钟幸存者', icon:'⏱', desc:'标准难度存活3分钟',     type:'condition', reward:30,
    check: s => s.difficulty === 'normal' && s.elapsed >= 180 },
  survive_5min:      { name:'五分钟大师',  icon:'🌟',  desc:'标准难度存活5分钟(通关)', type:'condition', reward:80,
    check: s => s.difficulty === 'normal' && s.elapsed >= 300 },
  survive_hard_5min: { name:'噩梦幸存者',  icon:'💀',  desc:'噩梦难度存活5分钟',     type:'condition', reward:150,
    check: s => s.difficulty === 'hard' && s.elapsed >= 300 },

  // === 角色类 ===
  all_chars:         { name:'全能冒险者',  icon:'🎭',  desc:'使用全部3个角色通关',   type:'multi',     reward:100,
    parts: ['char_mage','char_warrior','char_ranger'] },
  char_mage:         { hidden:true, check: s => s.charId === 'mage'    && s.elapsed >= 300 },
  char_warrior:      { hidden:true, check: s => s.charId === 'warrior' && s.elapsed >= 300 },
  char_ranger:       { hidden:true, check: s => s.charId === 'ranger'  && s.elapsed >= 300 },

  // === 击杀类 ===
  boss_kill:         { name:'屠龙者',     icon:'🐲',  desc:'击败Boss',            type:'condition', reward:50,
    check: s => s.bossKilled },
  boss_kill_hard:    { name:'噩梦征服者',  icon:'🔥',  desc:'噩梦难度击败Boss',     type:'condition', reward:150,
    check: s => s.difficulty === 'hard' && s.bossKilled },
  combo_30:          { name:'连击风暴',    icon:'🌪',  desc:'单局达成30连击',       type:'condition', reward:60,
    check: s => s.bestCombo >= 30 },
  combo_50:          { name:'连击之神',    icon:'⚡',  desc:'单局达成50连击',       type:'condition', reward:120,
    check: s => s.bestCombo >= 50 },
  no_damage_2min:    { name:'完美闪避',    icon:'✨',  desc:'不受伤存活2分钟',      type:'condition', reward:100,
    check: s => s.elapsed >= 120 && s.damageTaken === 0 },
  kill_100_single:   { name:'百人斩',     icon:'💯',  desc:'单局击杀100只敌人',     type:'condition', reward:80,
    check: s => s.kills >= 100 },

  // === 进化/协同类 ===
  evolve_weapon:     { name:'第一次进化',  icon:'🧬',  desc:'首次进化武器',         type:'flag', reward:40 },
  synergy_first:     { name:'协同发现',    icon:'🔗',  desc:'首次触发协同效果',      type:'flag', reward:40 },
  all_evolutions:    { name:'进化大师',    icon:'💎',  desc:'完成全部6种武器进化',   type:'multi', reward:300,
    parts: ['evo_thunderholywater','evo_fireknife','evo_holydomain','evo_blizzard','evo_frostknife','evo_flamebible'] },
  evo_thunderholywater: { hidden:true, check: s => s.evolutions && s.evolutions.includes('thunderholywater') },
  evo_fireknife:        { hidden:true, check: s => s.evolutions && s.evolutions.includes('fireknife') },
  evo_holydomain:       { hidden:true, check: s => s.evolutions && s.evolutions.includes('holydomain') },
  evo_blizzard:         { hidden:true, check: s => s.evolutions && s.evolutions.includes('blizzard') },
  evo_frostknife:       { hidden:true, check: s => s.evolutions && s.evolutions.includes('frostknife') },
  evo_flamebible:       { hidden:true, check: s => s.evolutions && s.evolutions.includes('flamebible') },

  // === 商店/经济类 ===
  shop_first:        { name:'初次投资',    icon:'🏪',  desc:'首次购买商店升级',      type:'flag', reward:20 },
  shop_max_one:      { name:'专精之路',    icon:'📈',  desc:'将任一商店升级买满3级', type:'flag', reward:60 },
  shop_max_all:      { name:'全面发展',    icon:'🌟',  desc:'将全部6种商店升级买满', type:'flag', reward:300 },

  // === Quest 类 ===
  quests_half:       { name:'挑战新星',    icon:'🌟',  desc:'完成一半Quest(7个)',    type:'condition', reward:50,
    check: s => (s.completedQuestsCount || 0) >= 7 },
  quests_all:        { name:'挑战大师',    icon:'👑',  desc:'完成全部Quest',        type:'condition', reward:150,
    check: s => (s.completedQuestsCount || 0) >= CFG.QUESTS.length },

  // === 隐藏成就 ===
  speed_clear:       { name:'速度与激情',  icon:'🏎',  desc:'在3分钟内击败Boss',     type:'condition', reward:100,
    check: s => s.bossKilled && s.elapsed <= 180, hidden:true },
  pacifist_1min:     { name:'和平主义者',  icon:'🕊',  desc:'前1分钟不击杀任何敌人存活', type:'condition', reward:80,
    check: s => s.elapsed >= 60 && s.killsAt60 === 0, hidden:true },
}
```

---

## 3. 成就类型详解

### 3.1 里程碑类 (type: 'milestone')

基于跨局累计统计数据的阈值检测。

| 字段 | 说明 |
|------|------|
| `check.stat` | Save 中的统计字段名（如 `totalKills`, `gamesPlayed`） |
| `check.target` | 目标数值 |
| 进度显示 | `Save.load()[stat] / target` 百分比 |

**进度计算**：`progress = Math.min(Save.load()[stat] || 0, target) / target`

**已有的可追踪统计字段**：
- `totalKills` -- 累计击杀
- `gamesPlayed` -- 游玩局数
- `bestScore` -- 最高单局击杀
- `bestTime` -- 最长存活时间
- `bestCombo` -- 最高连击
- `completedQuests.length` -- 已完成Quest数
- `soulFragments` -- 当前灵魂碎片余额

### 3.2 条件类 (type: 'condition')

基于单局游戏状态的函数式检查，与 Quest 的 check 函数机制完全相同。

| 字段 | 说明 |
|------|------|
| `check` | 函数 `(gameStats) => boolean` |
| 进度显示 | 无进度条（二态：达成/未达成） |

**gameStats 对象**（与 Quest 共享相同的数据包）：
```js
{
  charId, kills, difficulty, elapsed,
  bossKilled, damageTaken, bestCombo,
  completedQuestsCount,  // 新增：当前已完成Quest总数
  evolutions,            // 新增：本局完成的进化武器ID列表
  killsAt60              // 新增：前60秒击杀数（pacifist成就）
}
```

### 3.3 多部件类 (type: 'multi')

由多个子成就组合而成的复合成就。当所有子成就都达成时，父成就自动完成。

| 字段 | 说明 |
|------|------|
| `parts` | 子成就ID列表 |
| 子成就 | `hidden:true` 的独立成就，不出现在成就列表中 |
| 进度显示 | `已达成子项 / 总子项数` |

**示例**：`all_chars` 需要 `char_mage` + `char_warrior` + `char_ranger` 三个子成就全部达成。

### 3.4 标记类 (type: 'flag')

由特定游戏事件触发的布尔标记，不在结算时检查，而是在事件发生时即时设置。

| 触发时机 | 说明 |
|---------|------|
| 武器进化时 | `evolve_weapon` -- 任意武器进化完成 |
| 协同触发时 | `synergy_first` -- 首次 checkSynergies() 发现新协同 |
| 商店购买时 | `shop_first` -- 首次 buyShopUpgrade() |
| 商店满级时 | `shop_max_one` -- 任意升级达到 maxLevel |

**实现方式**：在 Save 中维护 `achievedFlags: Set<string>`，事件触发时检查并添加。

---

## 4. 成就数据存储 (Save 扩展)

### 4.1 Save._default() 新增字段

```js
{
  // ...现有字段...
  completedAchievements: [],    // 已完成成就ID列表
  achievedFlags: [],            // 已触发的flag标记列表
}
```

### 4.2 Save 新增方法

```js
// 结算时批量检查条件/里程碑/多部件成就
static checkAchievements(gameStats) {
  const d = Save.load();
  if (!d.completedAchievements) d.completedAchievements = [];
  if (!d.achievedFlags) d.achievedFlags = [];

  const newlyCompleted = [];

  for (const [id, ach] of Object.entries(CFG.ACHIEVEMENTS)) {
    // 跳过隐藏子成就（由父成就间接检查）
    if (ach.hidden) continue;
    // 跳过已完成
    if (d.completedAchievements.includes(id)) continue;

    let completed = false;

    if (ach.type === 'milestone') {
      const current = d[ach.check.stat] || 0;
      completed = current >= ach.check.target;
    }
    else if (ach.type === 'condition') {
      completed = ach.check(gameStats);
    }
    else if (ach.type === 'multi') {
      completed = ach.parts.every(partId => {
        const part = CFG.ACHIEVEMENTS[partId];
        if (!part) return false;
        // 检查是否有任何一局满足子条件（需要记录跨局状态）
        return d.completedAchievements.includes(partId);
      });
    }
    else if (ach.type === 'flag') {
      completed = d.achievedFlags.includes(id);
    }

    if (completed) {
      d.completedAchievements.push(id);
      newlyCompleted.push(id);
    }
  }

  // 也标记达成的隐藏子成就
  for (const [id, ach] of Object.entries(CFG.ACHIEVEMENTS)) {
    if (!ach.hidden) continue;
    if (d.completedAchievements.includes(id)) continue;
    if (ach.check && ach.check(gameStats)) {
      d.completedAchievements.push(id);
    }
  }

  Save.save(d);
  return newlyCompleted;
}

// 游戏事件触发时设置flag
static achieveFlag(flagId) {
  const d = Save.load();
  if (!d.achievedFlags) d.achievedFlags = [];
  if (!d.achievedFlags.includes(flagId)) {
    d.achievedFlags.push(flagId);
    Save.save(d);
  }
}

// 获取成就进度
static getAchievementProgress(id) {
  const d = Save.load();
  const ach = CFG.ACHIEVEMENTS[id];
  if (!ach) return { current: 0, target: 1, done: false };

  if (d.completedAchievements && d.completedAchievements.includes(id)) {
    return { current: ach.type === 'multi' ? ach.parts.length : 1,
             target: ach.type === 'multi' ? ach.parts.length : 1, done: true };
  }

  if (ach.type === 'milestone') {
    const current = d[ach.check.stat] || 0;
    return { current: Math.min(current, ach.check.target), target: ach.check.target, done: false };
  }
  if (ach.type === 'multi') {
    let done = 0;
    for (const partId of ach.parts) {
      if (d.completedAchievements && d.completedAchievements.includes(partId)) done++;
    }
    return { current: done, target: ach.parts.length, done: false };
  }
  return { current: 0, target: 1, done: false };
}
```

---

## 5. 成就检查时机

| 时机 | 检查类型 | 说明 |
|------|---------|------|
| 结算画面 (endGame) | milestone / condition / multi / flag | 主检查点，传入 gameStats |
| 武器进化完成时 | flag (`evolve_weapon`) | 即时触发 |
| checkSynergies() 发现新协同时 | flag (`synergy_first`) | 即时触发 |
| buyShopUpgrade() 成功时 | flag (`shop_first` / `shop_max_one` / `shop_max_all`) | 即时触发 |

---

## 6. 成就 UI 设计

### 6.1 成就面板

复用 Quest 面板的 CSS 样式结构，作为独立面板或在 Quest 面板中添加 Tab 切换。

**布局方案**：Quest 面板增加 Tab 切换（"挑战" / "成就"），两个 Tab 共享同一面板容器。

**成就卡片**：

| 元素 | 说明 |
|------|------|
| 图标 | 成就 icon（emoji） |
| 名称 | 成就 name |
| 描述 | 成就 desc |
| 进度条 | 里程碑/多部件类显示进度，条件类不显示 |
| 奖励 | 灵魂碎片数量 |
| 完成标记 | 已完成显示金色 `★` + 绿色背景 |

**进度条样式**：
```
[████████░░░░░░] 342/500
```
- 高度: 4px
- 背景: `rgba(255,255,255,0.1)`
- 填充: `#ffd54f` 金色
- 文字: 右侧 `current/target` 小字

**隐藏成就**：
- 未达成时显示 `??? 神秘成就`（灰色，问号图标）
- 达成后正常显示

### 6.2 标题画面入口

在标题画面的 Quest 按钮 (`quest-btn`) 旁增加一个 Achievement 按钮 (`achieve-btn`)，或者将 Quest 面板升级为双 Tab 面板。

**推荐方案**：双 Tab -- 减少按钮数量，统一面板入口。

### 6.3 结算画面成就通知

结算画面在 Quest 完成通知下方，新增成就完成通知：

```
★ 成就达成: 百战之士 +30💎
★ 成就达成: 第一次进化 +40💎
```

颜色：金色文字 `#ffd54f`，与 Quest 的绿色通知区分。

---

## 7. 前端实现要点清单

### 7.1 config.js
- [ ] 新增 `CFG.ACHIEVEMENTS` 对象（约25个成就定义）

### 7.2 save.js
- [ ] `_default()` 新增 `completedAchievements: []` 和 `achievedFlags: []`
- [ ] 新增迁移逻辑：旧存档补全新字段
- [ ] 新增 `checkAchievements(gameStats)` 方法
- [ ] 新增 `achieveFlag(flagId)` 方法
- [ ] 新增 `getAchievementProgress(id)` 方法

### 7.3 game.js
- [ ] `endGame()` 中调用 `Save.checkAchievements(stats)` 传入扩展后的 gameStats
- [ ] gameStats 新增字段：`completedQuestsCount`, `evolutions`, `killsAt60`
- [ ] 结算画面新增成就完成通知 HTML
- [ ] 追踪 `game.killsAt60`：elapsed < 60 时记录击杀数

### 7.4 武器进化触发
- [ ] 进化完成时调用 `Save.achieveFlag('evolve_weapon')`
- [ ] 进化完成时记录 `game.evolutions.push(resultWeaponId)` 用于 all_evolutions 检查

### 7.5 协同触发
- [ ] `checkSynergies()` 首次发现新协同时调用 `Save.achieveFlag('synergy_first')`

### 7.6 商店触发
- [ ] `buyShopUpgrade()` 成功时调用 `Save.achieveFlag('shop_first')`
- [ ] 升级达到 maxLevel 时调用 `Save.achieveFlag('shop_max_one')`
- [ ] 全部6种升级满级时调用 `Save.achieveFlag('shop_max_all')`

### 7.7 quest-panel.js (升级为双 Tab 面板)
- [ ] 新增 "成就" Tab
- [ ] 渲染成就列表（进度条 + 隐藏成就显示）
- [ ] 切换 Tab 逻辑

### 7.8 index.html
- [ ] Quest 面板 HTML 新增 Tab 按钮

---

## 8. 成就完整列表 (25个)

### 8.1 里程碑类 (5个)

| ID | 名称 | 条件 | 奖励 |
|----|------|------|------|
| total_kills_100 | 百战之士 | 累计击杀100 | 30 |
| total_kills_500 | 屠戮先锋 | 累计击杀500 | 80 |
| total_kills_2000 | 杀戮之王 | 累计击杀2000 | 200 |
| games_10 | 初出茅庐 | 游玩10局 | 20 |
| games_50 | 身经百战 | 游玩50局 | 60 |

### 8.2 生存类 (3个)

| ID | 名称 | 条件 | 奖励 |
|----|------|------|------|
| survive_3min | 三分钟幸存者 | 标准难度存活3分钟 | 30 |
| survive_5min | 五分钟大师 | 标准难度通关 | 80 |
| survive_hard_5min | 噩梦幸存者 | 噩梦难度通关 | 150 |

### 8.3 角色类 (1个复合 = 3个隐藏子成就)

| ID | 名称 | 条件 | 奖励 |
|----|------|------|------|
| all_chars | 全能冒险者 | 3角色全部通关 | 100 |

### 8.4 击杀/挑战类 (6个)

| ID | 名称 | 条件 | 奖励 |
|----|------|------|------|
| boss_kill | 屠龙者 | 击败Boss | 50 |
| boss_kill_hard | 噩梦征服者 | 噩梦难度击败Boss | 150 |
| combo_30 | 连击风暴 | 30连击 | 60 |
| combo_50 | 连击之神 | 50连击 | 120 |
| no_damage_2min | 完美闪避 | 不受伤存活2分钟 | 100 |
| kill_100_single | 百人斩 | 单局击杀100 | 80 |

### 8.5 进化/协同类 (3个)

| ID | 名称 | 条件 | 奖励 |
|----|------|------|------|
| evolve_weapon | 第一次进化 | 任意武器进化 | 40 |
| synergy_first | 协同发现 | 首次触发协同 | 40 |
| all_evolutions | 进化大师 | 完成6种进化 | 300 |

### 8.6 商店/经济类 (3个)

| ID | 名称 | 条件 | 奖励 |
|----|------|------|------|
| shop_first | 初次投资 | 首次商店购买 | 20 |
| shop_max_one | 专精之路 | 任一升级满级 | 60 |
| shop_max_all | 全面发展 | 全部升级满级 | 300 |

### 8.7 Quest类 (2个)

| ID | 名称 | 条件 | 奖励 |
|----|------|------|------|
| quests_half | 挑战新星 | 完成7个Quest | 50 |
| quests_all | 挑战大师 | 完成全部Quest | 150 |

### 8.8 隐藏成就 (2个)

| ID | 名称 | 条件 | 奖励 |
|----|------|------|------|
| speed_clear | 速度与激情 | 3分钟内击败Boss | 100 |
| pacifist_1min | 和平主义者 | 前1分钟不击杀存活 | 80 |

---

## 9. 数值平衡分析

### 9.1 成就总奖励

| 类别 | 数量 | 总奖励(碎片) |
|------|------|------------|
| 里程碑 | 5 | 390 |
| 生存 | 3 | 260 |
| 角色 | 1 | 100 |
| 击杀/挑战 | 6 | 560 |
| 进化/协同 | 3 | 380 |
| 商店/经济 | 3 | 380 |
| Quest | 2 | 200 |
| 隐藏 | 2 | 180 |
| **合计** | **25** | **2450** |

### 9.2 与商店经济的平衡

- 商店全买满需要 810 灵魂碎片
- 成就总奖励 2450 灵魂碎片 -- 但这是跨数十局的长期积累
- 预估达成率：
  - 游玩5局后：约解锁5-8个成就，获得约200-300碎片
  - 游玩20局后：约解锁12-15个成就，获得约800-1200碎片
  - 游玩50局后：约解锁18-22个成就，获得约1500-2000碎片
  - 100%完成：约需60-80局（取决于技术水平）

### 9.3 成就解锁节奏

| 时间节点 | 预期解锁 | 典型新成就 |
|---------|---------|-----------|
| 第1局 | 2-3个 | 初出茅庐, 三分钟幸存者 |
| 第3-5局 | +3-5个 | 第一次进化, 屠龙者, 初次投资 |
| 第10局 | +3-4个 | 百战之士, 五分钟大师, 协同发现 |
| 第20局 | +3-5个 | 屠戮先锋, 完美闪避, 噩梦征服者 |
| 第50局 | +4-6个 | 身经百战, 杀戮之王, 进化大师 |
| 第80局 | +2-3个 | 全面发展, 挑战大师 |

---

## 10. 与现有系统的交互

### 10.1 Quest 系统
- 成就与 Quest 共享 gameStats 数据包
- Quest 完成数被成就追踪（quests_half / quests_all）
- 建议共享同一面板（Tab 切换），统一入口

### 10.2 商店系统
- shop_max_all 需要在 `buyShopUpgrade()` 中检查全部6种升级是否满级
- 商店满级需要 810 碎片，加上成就奖励约 2450，实际需要约50局才能全满
- 成就奖励的碎片通过 `Save.addSoulFragments()` 直接入账

### 10.3 进化系统
- all_evolutions 需要跨局追踪已完成的进化
- 每局进化完成时记录到 `game.evolutions[]`
- 结算时 gameStats 包含 `evolutions` 数组
- Save 中通过 completedAchievements 隐式追踪（子成就 evo_xxx 被标记为已完成）

### 10.4 无尽模式
- 成就系统不依赖无尽模式（标准5分钟局即可完成大部分成就）
- 未来可新增无尽专属成就（如 "无尽征途" -- 无尽存活10分钟）

---

## 11. 存档迁移

旧存档需要补全新字段：

```js
// 在 Save.load() 迁移逻辑中新增：
if (!d.completedAchievements) d.completedAchievements = [];
if (!d.achievedFlags) d.achievedFlags = [];
```

---

## 12. 不做什么

- **不做每日成就重置**：5分钟轻量游戏不适合日活压力设计
- **不做成就解锁新角色/新武器**：所有内容通过现有系统获取，成就只奖励碎片
- **不做成就分享**：H5 平台分享功能需单独设计，不在本版本范围
- **不做成就进度实时HUD**：成就检查只在结算和事件触发时，不在游戏循环中
- **不做排行榜**：需要后端支持，不在当前范围
