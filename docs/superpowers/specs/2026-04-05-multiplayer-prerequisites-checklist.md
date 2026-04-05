# 联机前置任务清单 (Multiplayer Prerequisites for Frontend)

> 版本: 1.0 | 日期: 2026-04-05 | 后端 Agent | Drive #15
> 目标读者: 前端 Agent
> 用途: 前端将联机准备排入迭代计划时的最小化参考清单

---

## 概述

后端联机设计已全部完成（架构规格书 + 协议规格书 + Player 拆分方案 + 序列化接口）。服务器 MVP 原型依赖前端完成以下 3 项前置任务。预计前端新增/修改代码量约 300-400 行。

---

## 任务 1: Player 拆分 -- LocalPlayer / RemotePlayer (约 150 行)

**目标**: 将 `src/entities/Player.js` 拆分为三层结构。

```
Player.js (保留，改为 PlayerBase)
  -- 共享逻辑: x/y/hp/weapons/passives/facingAngle/draw()
  -- 新增: serialize() 方法（纯数据输出）

LocalPlayer.js (新建)
  -- 继承 PlayerBase
  -- 独占: input handling, dash(), takeDamage(), combo, addExp/levelUp
  -- 独占: _predictedState（客户端预测）

RemotePlayer.js (新建)
  -- 继承 PlayerBase
  -- 独占: _interpBuffer[], _targetState, update(dt) 插值逻辑
  -- 无输入处理，无本地决策
```

**改动范围**:
- `Player.js` -- 抽取输入/本地逻辑到 LocalPlayer，保留共享逻辑
- `LocalPlayer.js` -- 新建
- `RemotePlayer.js` -- 新建
- `game.js` -- `new Player(...)` 改为 `new LocalPlayer(...)`

**验收标准**: 单机模式行为零回归。RemotePlayer 可实例化（暂不使用）。

---

## 任务 2: 序列化接口 -- snapshot() / applySnapshot() (约 80 行)

**目标**: 新建 `src/systems/serialize.js`，提供游戏状态的纯数据快照。

**核心函数**:

```js
// snapshot(game) -> ServerSnapshot 纯数据对象
// 包含: players[], enemies[], bullets[], gems[], foods[], chests[], elapsed
// 所有数值 Math.round 或保留2位小数

// applySnapshot(remotePlayer, snap) -> void
// 将快照推入 RemotePlayer 的插值缓冲区
```

**快照字段参考** (完整定义见 `backend-log.md` "可序列化状态接口设计" 章节):

| 实体 | 必需字段 |
|------|---------|
| Player | id, x, y, hp, maxHp, level, exp, gold, weapons[{name,level,timer}], passives{}, facingAngle, dashing, combo |
| Enemy | id, type, x, y, hp, maxHp, w, h, frozen, slow, burn |
| Bullet | x, y, vx, vy, dmg, life, color, pierce, burnDmg, burnDur |
| Gem | x, y, value |
| Food | x, y, icon, age |
| Chest | x, y, opened |

**改动范围**:
- `src/systems/serialize.js` -- 新建
- `Enemy` 类 -- 新增 `_netId` 字段（可延迟到联机阶段分配）
- `game.js` -- 可选添加 `game._snapshot = () => snapshot(game)` 辅助

**验收标准**: `snapshot(window.game)` 返回合法 JSON，无函数引用、无循环引用。

---

## 任务 3: game.js 全局状态解耦 (约 80 行)

**目标**: 将 `window.game` 的游戏状态（enemies, bullets, gems 等）整理为可提取的 state 对象，为服务器端复用做准备。

**改动范围**:
- `game.js` -- 将散落在函数体内的状态初始化收敛到 `beginGame()` 的显式 state 对象
- 保持 `window.game` 全局引用不变（渐进式重构，不破坏现有结构）

**验收标准**: 游戏状态可通过 `beginGame()` 参数或 `window.game` 的属性列表一目了然地枚举。

---

## 任务优先级建议

| 顺序 | 任务 | 依赖 | 预估 |
|------|------|------|------|
| 1 | Player 拆分 | 无 | 150 行 |
| 2 | 序列化接口 | 任务 1（Player.serialize） | 80 行 |
| 3 | game.js 状态解耦 | 无（可与任务 1 并行） | 80 行 |

三项任务完成后，后端即可启动服务器 MVP 编码 + 端到端联调。

---

## 详细设计参考

| 文档 | 位置 |
|------|------|
| Player 拆分方案 | `docs/team/backend-log.md` "Player 拆分方案设计" 章节 |
| 序列化接口设计 | `docs/team/backend-log.md` "可序列化状态接口设计" 章节 |
| 联机架构规格书 | `docs/superpowers/specs/2026-04-04-multiplayer-architecture-design.md` |
| 网络协议规格书 | `docs/superpowers/specs/2026-04-04-network-protocol-spec.md` |

---

## 无尽模式/成就系统的联机影响说明

v1.2.3 新增的无尽模式和成就系统（设计规格已完成，待前端实现）对联机架构有以下影响:

1. **无尽模式 -- 快照字段扩展**: 序列化接口需新增 `endless: boolean`, `bossCycleIndex: number`, `bossKillCount: number` 三个字段。这些是游戏模式标记，序列化成本可忽略不计。

2. **无尽模式 -- 服务器端复杂度**: 无尽模式的 Boss 周期生成、动态 MAX_ENEMIES、递增难度公式需要在服务器端复现。这是联机 Phase 2（服务器 MVP）的工作，不影响前端前置任务。

3. **成就系统 -- 纯客户端**: 成就检查和存储完全基于 `Save.data`（localStorage），不涉及实时同步。多人联机时每个客户端独立追踪成就即可，无服务器端需求。

**结论**: 无尽模式和成就系统不影响前端联机前置任务的排期和内容。序列化接口预留 `endless/bossCycleIndex/bossKillCount` 三个字段即可。
