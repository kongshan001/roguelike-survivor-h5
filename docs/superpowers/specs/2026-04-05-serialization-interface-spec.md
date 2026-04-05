# 序列化接口规格书 (Serialization Interface Specification)

> 版本: 1.0 | 日期: 2026-04-05 | 状态: 设计完成待评审
> 前置依赖: `multiplayer-architecture-design.md`, `network-protocol-spec.md`
> 目标读者: 前端 Agent（实现）, 后端 Agent（服务器端复用）

## 1. 设计目标

将 `window.game` 的运行时状态转化为纯数据格式（JSON-safe），满足：

1. **无函数引用** -- 所有回调、类方法不进入快照
2. **无循环引用** -- 可被 `JSON.stringify` 序列化
3. **无 DOM 引用** -- 服务器端无需浏览器环境即可反序列化
4. **精度控制** -- 坐标整数化、浮点数精度统一
5. **体积控制** -- 只传输必需字段，省略纯视觉/纯本地状态

本规格书基于 v1.4.0 代码库实际字段逐项对照编写，确保与当前代码一致。

## 2. 新增文件

```
src/systems/serialize.js    -- 快照生成 + 反序列化（约 80-100 行）
```

## 3. 快照格式定义

### 3.1 GameSnapshot (顶层)

```typescript
interface GameSnapshot {
  elapsed: number;            // 游戏经过时间 (秒, 2位小数)
  difficulty: string;         // "normal" | "hard" | "endless"
  bossSpawned: boolean;
  bossKilled: boolean;
  players: PlayerSnap[];      // 当前: 1人, 联机后: 2-4人
  enemies: EnemySnap[];
  bullets: BulletSnap[];
  gems: GemSnap[];
  foods: FoodSnap[];
  chests: ChestSnap[];
  events: EventSnap[];        // 本 tick 事件队列
}
```

### 3.2 PlayerSnap

对照 `src/entities/Player.js` 构造函数所有字段：

```typescript
interface PlayerSnap {
  id: string;                 // 单机: "local", 联机: 服务器分配
  charId: string;             // "mage" | "warrior" | "ranger"
  x: number; y: number;      // 整数像素坐标
  hp: number; maxHp: number;
  speed: number;
  level: number; exp: number;
  gold: number;
  pickupRange: number;
  armor: number;
  kills: number;
  critChance: number;
  expBonus: number;
  facingAngle: number;        // 2位小数
  // Weapons
  weapons: WeaponSnap[];
  // Passives
  passives: Record<string, number>;
  // Dash state
  dashing: boolean;
  dashCD: number;             // 冲刺冷却剩余 (秒, 1位小数)
  // Combo state
  combo: number;
  comboTimer: number;
  bestCombo: number;
  // Status
  invTimer: number;           // 无敌剩余 (秒, 2位小数)
  speedBoost: number;         // 加速百分比
  speedBoostTimer: number;    // 加速剩余
  // Synergy
  activeSynergies: string[];  // Set -> Array
  // Quest tracking
  damageTaken: number;        // _damageTaken
}

interface WeaponSnap {
  name: string;               // "holywater" | "knife" | ... | "flamebible"
  level: number;              // 1-3 (进化武器为 1)
  timer: number;              // 武器内部计时器 (2位小数)
}
```

**不序列化的 Player 字段**（纯视觉/回调/本地状态）:

| 字段 | 原因 |
|------|------|
| `w, h` | 固定值，由 CFG.PLAYER_SIZE 决定 |
| `onSFX` | 函数引用 |
| `onScreenShake` | 函数引用 |
| `onCritCheck` | 函数引用 |
| `getDifficulty` | 函数引用 |
| `getExpMul` | 函数引用 |
| `_afterimages` | 纯视觉，dash 残影 |
| `_dashDir` | 可从 facingAngle 推导 |
| `_dashTimer` | 与 dashing 状态关联，不独立传输 |
| `_isMoving` | 纯本地计算 |

### 3.3 EnemySnap

对照 `src/entities/enemy.js` 构造函数所有字段：

```typescript
interface EnemySnap {
  id: string;                 // 服务器分配唯一ID, 单机: type_index
  type: string;               // "zombie"|"bat"|"skeleton"|"elite_skeleton"|
                               // "ghost"|"splitter"|"splitter_small"|"boss"
  x: number; y: number;      // 整数像素坐标
  w: number; h: number;       // 碰撞尺寸
  hp: number; maxHp: number;  // hp: 1位小数, maxHp: 整数
  speed: number;              // 原始速度 (1位小数)
  dmg: number;                // 碰撞伤害 (整数)
  color: string;              // 颜色标识 (用于渲染)
  isBoss: boolean;
  ranged: boolean;
  // Boss state
  phase: number;              // Boss阶段 (1-3)
  chargeTimer: number;        // 冲锋计时
  charging: boolean;          // 是否正在冲锋
  sprayTimer: number;         // 弹幕计时
  spiralAngle: number;       // 螺旋弹幕角度
  // Ghost state
  phShiftActive: boolean;     // 幽灵是否处于相位转移
  hasTeleported: boolean;     // 幽灵是否已瞬移
  teleportCD: number;         // 瞬移冷却
  // Splitter state
  splitter: boolean;
  isChild: boolean;
  // Status effects
  frozen: number;             // 冰冻剩余 (秒, 2位小数)
  slow: number;               // 减速百分比 (0-1, 2位小数)
  burn: { dmg: number; t: number } | null;
  hitCD: number;              // 碰撞冷却
}
```

**不序列化的 Enemy 字段**:

| 字段 | 原因 |
|------|------|
| `phaseShift` | 固定属性，由 type 决定 (CFG.ENEMY_TYPES) |
| `teleport` | 同上 |
| `phShiftTimer` | 内部计时器，phShiftActive 已足够 |
| `_lastCrit` | 单次伤害事件标记，不跨 tick 保持 |
| `_onCritText` | 函数引用 |

### 3.4 BulletSnap

对照代码中所有 `bullets.push({...})` 调用，子弹为纯数据对象（非类实例），字段来源:

- 玩家武器: `registry.js` (Knife, FireKnife, FrostKnife, crit_boots synergy)
- 敌人射击: `enemy.js` (Skeleton, EliteSkeleton, Boss)
- 远程协同: `game.js` (crit_boots onCritKnife)

```typescript
interface BulletSnap {
  id: string;                 // 服务器分配, 单机: index
  x: number; y: number;      // 浮点坐标 (2位小数)
  vx: number; vy: number;    // 速度向量 (整数)
  w: number; h: number;       // 碰撞尺寸 (整数)
  dmg: number;                // 伤害 (1位小数)
  life: number;               // 剩余生命 (秒, 2位小数)
  color: string;              // 颜色标识
  // Optional fields
  pierce?: number;            // 穿透次数 (玩家武器)
  burnDmg?: number;           // 燃烧伤害 (FireKnife)
  burnDur?: number;           // 燃烧持续时间 (FireKnife)
  frostSlow?: number;         // 冰冻减速 (FrostKnife)
  frostSlowDur?: number;      // 减速持续时间
  frostFreezeChance?: number; // 冰冻概率
  frostFreezeDur?: number;    // 冰冻持续时间
  owner?: string;             // 所属 (联机时区分敌我子弹)
  hit?: number;               // hit Set 大小 (非引用), 联机时用 pierce 剩余代替
}
```

**关键序列化问题**: 子弹的 `hit` 字段是 `Set<Enemy>` 引用，不可序列化。处理方案:

- 单机: 不序列化 `hit`，反序列化时创建空 Set
- 联机: 服务器端子弹不使用 `hit: Set`，改用 `pierceLeft: number` 记录剩余穿透次数

### 3.5 GemSnap

```typescript
interface GemSnap {
  x: number; y: number;      // 整数像素坐标
  value: number;              // 经验值 (整数)
}
```

**不序列化**: `t` (动画计时器，纯视觉)

### 3.6 FoodSnap

```typescript
interface FoodSnap {
  x: number; y: number;      // 整数像素坐标
  icon: string;               // emoji 图标
  color: string;              // 颜色
  age: number;                // 存在时间 (秒, 1位小数)
}
```

### 3.7 ChestSnap

```typescript
interface ChestSnap {
  x: number; y: number;      // 整数像素坐标
  opened: boolean;
}
```

**不序列化**: `t` (动画计时器), `_noGoldShown` (纯 UI 状态)

### 3.8 EventSnap

```typescript
interface EventSnap {
  type: "kill" | "damage" | "heal" | "pickup" | "levelup" |
        "boss_spawn" | "boss_kill";
  targetId: string;           // 目标实体 ID
  sourceId?: string;          // 来源实体 ID
  value?: number;             // 数值 (伤害/经验/恢复量)
  weapon?: string;            // 武器名 (击杀/伤害事件)
  enemyType?: string;         // 敌人类型 (击杀事件，用于掉落计算)
}
```

## 4. 序列化函数设计

### 4.1 snapshot() -- 生成快照

```js
// src/systems/serialize.js

/**
 * 从 window.game 生成纯数据快照。
 * @param {object} game - window.game 对象
 * @returns {GameSnapshot} JSON-safe 纯数据对象
 */
export function snapshot(game) {
  return {
    elapsed: Math.round(game.elapsed * 100) / 100,
    difficulty: game.difficulty,
    bossSpawned: game.bossSpawned,
    bossKilled: game.bossKilled,
    players: [playerSnap(game.player)],
    enemies: game.enemies.map((e, i) => enemySnap(e, i)),
    bullets: game.bullets.map((b, i) => bulletSnap(b, i)),
    gems: game.gems.map(gemSnap),
    foods: game.foods.map(foodSnap),
    chests: game.chests.map(chestSnap),
    events: [],  // 由 game 层收集后填入
  };
}

function playerSnap(p) {
  return {
    id: 'local',
    charId: p.charId,
    x: Math.round(p.x),
    y: Math.round(p.y),
    hp: p.hp,
    maxHp: p.maxHp,
    speed: p.speed,
    level: p.level,
    exp: p.exp,
    gold: p.gold,
    pickupRange: p.pickupRange,
    armor: p.armor,
    kills: p.kills,
    critChance: p.critChance,
    expBonus: p.expBonus,
    facingAngle: Math.round(p.facingAngle * 100) / 100,
    weapons: p.weapons.map(w => ({
      name: w.name,
      level: w.level,
      timer: Math.round(w.timer * 100) / 100,
    })),
    passives: { ...p.passives },
    dashing: p._dashing,
    dashCD: Math.round(p._dashCD * 10) / 10,
    combo: p._combo,
    comboTimer: Math.round(p._comboTimer * 10) / 10,
    bestCombo: p._bestCombo,
    invTimer: Math.round(p.invTimer * 100) / 100,
    speedBoost: p._speedBoost,
    speedBoostTimer: Math.round(p._speedBoostTimer * 10) / 10,
    activeSynergies: [...p.activeSynergies],
    damageTaken: p._damageTaken,
  };
}

function enemySnap(e, index) {
  return {
    id: `${e.type}_${index}`,       // 单机: 类型_索引; 联机: 服务器分配
    type: e.type,
    x: Math.round(e.x),
    y: Math.round(e.y),
    w: e.w, h: e.h,
    hp: Math.round(e.hp * 10) / 10,
    maxHp: e.maxHp,
    speed: Math.round(e.speed * 10) / 10,
    dmg: e.dmg,
    color: e.color,
    isBoss: e.isBoss,
    ranged: e.ranged,
    phase: e.isBoss ? e.phase : undefined,
    charging: e.isBoss ? e.charging : undefined,
    frozen: e._frozen ? Math.round(e._frozen * 100) / 100 : 0,
    slow: e._slow ? Math.round(e._slow * 100) / 100 : 0,
    burn: e._burn ? { dmg: e._burn.dmg, t: Math.round(e._burn.t * 10) / 10 } : null,
    splitter: e.splitter,
    isChild: e.isChild,
    hitCD: Math.round(e.hitCD * 10) / 10,
    phShiftActive: e.phShiftActive,
    hasTeleported: e.hasTeleported,
    teleportCD: Math.round(e.teleportCD * 10) / 10,
  };
}

function bulletSnap(b, index) {
  const snap = {
    id: `b_${index}`,
    x: Math.round(b.x * 100) / 100,
    y: Math.round(b.y * 100) / 100,
    vx: Math.round(b.vx),
    vy: Math.round(b.vy),
    w: b.w, h: b.h,
    dmg: Math.round(b.dmg * 10) / 10,
    life: Math.round(b.life * 100) / 100,
    color: b.color,
  };
  // Optional fields -- 仅在有值时包含
  if (b.pierce) snap.pierce = b.pierce;
  if (b.burnDmg) snap.burnDmg = b.burnDmg;
  if (b.burnDur) snap.burnDur = b.burnDur;
  if (b.frostSlow) snap.frostSlow = b.frostSlow;
  if (b.frostSlowDur) snap.frostSlowDur = b.frostSlowDur;
  if (b.frostFreezeChance) snap.frostFreezeChance = b.frostFreezeChance;
  if (b.frostFreezeDur) snap.frostFreezeDur = b.frostFreezeDur;
  // hit: Set<Enemy> -- 不序列化，反序列化时创建空 Set
  return snap;
}

function gemSnap(g) {
  return { x: Math.round(g.x), y: Math.round(g.y), value: g.value };
}

function foodSnap(f) {
  return { x: Math.round(f.x), y: Math.round(f.y), icon: f.icon, color: f.color, age: Math.round(f.age * 10) / 10 };
}

function chestSnap(c) {
  return { x: Math.round(c.x), y: Math.round(c.y), opened: c.opened };
}
```

### 4.2 applySnapshot() -- 反序列化到 RemotePlayer

```js
/**
 * 将服务器快照推入 RemotePlayer 的插值缓冲区。
 * @param {RemotePlayer} remotePlayer - 远程玩家实例
 * @param {PlayerSnap} snap - 服务器快照中的玩家数据
 */
export function applySnapshot(remotePlayer, snap) {
  remotePlayer._targetState = snap;
  remotePlayer._interpBuffer.push({
    ...snap,
    _recvTime: performance.now(),
  });
  // 保留最近 3 个快照用于插值
  if (remotePlayer._interpBuffer.length > 3) {
    remotePlayer._interpBuffer.shift();
  }
}
```

### 4.3 restoreBullets() -- 从快照恢复子弹

```js
/**
 * 从快照恢复子弹对象数组（含 hit Set）。
 * @param {BulletSnap[]} snaps
 * @returns {object[]} 子弹对象数组
 */
export function restoreBullets(snaps) {
  return snaps.map(s => ({
    ...s,
    hit: new Set(),  // 重建空 Set
  }));
}
```

## 5. 对现有代码的改动清单

| 文件 | 改动 | 代码量 |
|------|------|--------|
| `src/systems/serialize.js` | 新建 | ~100 行 |
| `src/entities/enemy.js` | 构造函数末尾添加 `this._netId = null;` | 1 行 |
| `src/game.js` | 导入 serialize; beginGame() 可选暴露 `_snapshot()` | ~3 行 |

**不改动的文件**:
- `Player.js` -- serialize() 作为独立函数而非方法，不侵入 Player 类
- `gem.js` / `food.js` / `chest.js` -- 纯数据实体，无需改动
- `weapons/registry.js` -- 武器序列化通过 WeaponSnap.name 映射回类，无需侵入

## 6. Enemy ID 方案

单机阶段敌人不需要网络 ID。联机阶段由服务器分配。

```
单机: 无 ID (序列化时用 type_index 临时标识)
联机: 服务器在创建敌人时分配 "e_序号" 唯一 ID
      客户端收到后存储在 e._netId
```

过渡方案: 在 Enemy 构造函数末尾添加 `this._netId = null;`，序列化时优先使用 `_netId`。

## 7. 快照大小估算 (v1.4.0 代码对照)

基于当前实际字段，重新估算：

| 组件 | 数量 | 单条大小 | 小计 |
|------|------|---------|------|
| PlayerSnap | 1 | ~350B | 350B |
| EnemySnap (普通) | 25 | ~100B | 2500B |
| EnemySnap (Boss) | 1 | ~150B | 150B |
| BulletSnap | 15 | ~80B | 1200B |
| GemSnap | 30 | ~30B | 900B |
| FoodSnap | 10 | ~40B | 400B |
| ChestSnap | 2 | ~30B | 60B |
| EventSnap | 5 | ~50B | 250B |
| 包头 + 其他 | - | - | 200B |
| **总计** | | | **~6KB** |

相比 Drive #11 估算的 ~5KB，增长约 1KB，原因是：
- PlayerSnap 增加了 synergy/quest/boost 等字段 (+100B)
- EnemySnap 增加了 ghost/boss/splitter 专用字段 (+20B/enemy)
- BulletSnap 增加了 frost 系列可选字段 (+10B)

**评估**: 6KB/100ms = 60KB/s 下行，仍在可接受范围内。

## 8. 验收标准

前端实现此规格的验收标准：

1. `snapshot(window.game)` 返回合法 JSON -- `JSON.stringify(snapshot(window.game))` 不抛异常
2. 快照中无函数引用 -- 所有字段为 string/number/boolean/array/object/null
3. 快照中无循环引用 -- 可被 `JSON.parse(JSON.stringify(...))` 往返
4. 单机游戏运行后，在任意帧调用 `snapshot()` 不影响游戏行为
5. `applySnapshot()` 可推入 RemotePlayer（若已实现 RemotePlayer 类）

## 9. 与网络协议规格书的对齐

本规格书是 `network-protocol-spec.md` 第 5.3 节 snapshot 消息的完整实现方案。差异说明：

| 协议规格书定义 | 本规格书 | 差异原因 |
|--------------|---------|---------|
| PlayerSnap.invuln (ms) | PlayerSnap.invTimer (s) | 与代码实际单位一致 |
| BulletSnap.owner | 可选字段 | 单机无 owner 概念 |
| PlayerSnap.nextExp | 未包含 | 可从 CFG.EXP_TABLE[level] 推导 |
| EnemySnap.flash | 未包含 | 纯视觉状态，不跨 tick 保持 |

这些差异在联机实现时可统一：协议规格书是网络传输格式，本规格书是代码层序列化格式，二者通过映射函数转换。

## 10. 决策记录

| 决策 | 选择 | 理由 | 备选 |
|------|------|------|------|
| 序列化函数 vs 方法 | 独立函数 | 不侵入现有类，最小改动 | Player.prototype.snapshot() |
| 精度策略 | 坐标整数化, 浮点2位 | 肉鸽游戏精度要求低 | 全精度 (浪费带宽) |
| hit: Set 处理 | 不序列化 | Set 含对象引用，不可 JSON | 转 ID 数组 (增加复杂度) |
| 敌人 ID | 单机无ID, 联机服务器分配 | 避免单机阶段引入不必要概念 | 单机也分配 |
| 可选字段策略 | 仅在有值时包含 | 减少传输量 | 总是包含 (简化反序列化) |
| 快照包含 Synergy | 是 | Synergy 影响伤害/减速/掉落计算 | 仅在联机时包含 |
