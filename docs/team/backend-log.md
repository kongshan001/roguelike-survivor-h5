# 后端程序工作记录 (Backend Agent Log)

> Agent: `backend` | 触发: 联机、后端、服务器、网络、同步、multiplayer

---

## 当前优先级

| 优先级 | 事项 | 状态 |
|--------|------|------|
| P0 | 联机技术调研报告（网络同步/协议/服务器/部署） | ✅ 已完成 |
| P1 | 联机架构设计规格书（半授权状态同步 + WebSocket + Node.js） | ✅ 设计规格书完成 |
| P1 | 网络协议详细规格书（消息定义/快照格式/断线重连） | ✅ Drive #11 完成 |
| P1 | 联机前置任务清单（前端 1 页精简清单） | ✅ Drive #15 已输出 |
| P1 | Player 拆分方案设计（LocalPlayer / RemotePlayer 接口抽象） | 🔨 设计完成待评审，待前端实现 |
| P1 | 可序列化状态接口设计（游戏状态快照格式） | 🔨 设计完成待评审，待前端实现 |
| P2 | 服务器 MVP 原型（2人同房间联机） | ⏳ 已评估，阻塞于 P1 前端实现 |
| P2 | Docker 容器化部署方案 | 待评估（低优先级） |

---

## 2026-04-06 -- Drive #18: 状态确认，v1.4.0 联机影响复查

### 背景

v1.4.0 前端提交（`7771b5b`）完成成就系统实现，包含以下文件变更：

- 新增 `src/ui/achievement-panel.js`（成就面板 UI）
- `src/core/save.js` 扩展（achieveFlag / checkAchievements / getAchievementProgress）
- `src/game.js` 新增 `evolutions[]`、`killsAt60` 统计字段，endGame() 新增成就检查流程
- `src/entities/Player.js` 新增 `import Save`，checkSynergies() 中触发 `achieveFlag('synergy_first')`

前端本轮另有回旋镖武器设计规格，但代码实现不完整已回滚，不产生联机影响。

### 一、v1.4.0 变更对联机架构的影响

**结论：无新增影响，与 Drive #17 评估一致。**

Drive #17 已在规格层面逐项评估成就系统对联机的影响（序列化接口、服务器端逻辑、Player 拆分），本次确认实际代码实现与设计规格对齐，无意外变更。

逐项复查：

| 变更项 | Drive #17 评估 | Drive #18 代码验证 | 结论 |
|--------|---------------|-------------------|------|
| Save.achieveFlag in Player.js | 拆分时保留在 LocalPlayer | 确认：Player.js import Save，checkSynergies() 调用 | 无新增风险 |
| game.js 新增 evolutions[] | 各客户端独立追踪 | 确认：beginGame() 初始化空数组 | 无序列化负担 |
| game.js 新增 killsAt60 | 各客户端独立追踪 | 确认：loop() 中 elapsed < 60 条件累加 | 无序列化负担 |
| endGame() 成就检查 | 纯客户端逻辑 | 确认：调用 Save.checkAchievements(stats) | 无服务器需求 |

### 二、阻塞状态复查（连续第 6 次）

| 后端产出物 | 状态 | 前端依赖 |
|-----------|------|---------|
| 联机技术调研报告 | 完成 | 无 |
| 联机架构设计规格书 | 完成 | 无 |
| 网络协议详细规格书 | 完成 | 无 |
| 联机前置任务清单 | 完成 | 无（已交付前端参考） |
| Player 拆分方案 | 设计完成 | 前端评审 + 实现 |
| 可序列化状态接口 | 设计完成 | 前端评审 + 实现 |
| 服务器 MVP 原型 | 评估完成 | 依赖上述两项前端实现 |

前端当前版本 v1.4.0，迭代重心：成就系统实现 + 回旋镖设计规格。Player 拆分仍未排入前端迭代计划。

### 三、可推进方向评估

| 方向 | 可行性 | 结论 |
|------|--------|------|
| 服务器 MVP 提前编码 | 低 | 序列化格式未冻结，编码后大概率返工 |
| 新技术调研 | 低 | Drive #12 已全面评估，行业无重大变化 |
| 服务器端单元测试框架 | 低 | 服务器代码尚未编写，无测试对象 |
| Docker 部署方案细化 | 中 | 可推进但不紧急，MVP 阶段本地开发即可 |
| 联机测试用例设计 | 中 | 可设计但无法运行验证，价值有限 |

### 决策记录

- v1.4.0 成就系统代码与 Drive #17 规格评估完全对齐，无意外发现
- Player.js 引入 Save 模块这一事实再次确认：拆分时需注意 achieveFlag 调用归属 LocalPlayer（Drive #17 已记录，本 drive 维持该提醒）
- 连续第 6 次阻塞确认。联机前置任务清单（Drive #15 产出）仍然有效，可供前端随时排入计划
- 不强行制造工作项。后端设计产出物已完备，等待前端实现窗口
- 前端回旋镖武器代码回滚对联机无影响（代码不存在，无评估对象）

---

## 2026-04-06 -- Drive #17: 成就系统对联机架构的影响评估

### 背景

前端 v1.3.0 完成了成就系统实现（尚未提交），涉及以下文件变更：

| 变更项 | 涉及文件 | 具体内容 |
|--------|---------|---------|
| 成就面板 UI | 新增 `src/ui/achievement-panel.js` | 纯 UI 模块，读取 CFG.ACHIEVEMENTS 渲染进度 |
| Save 扩展 | `src/core/save.js` | 新增 achieveFlag()、checkAchievements()、getAchievementProgress() |
| 游戏统计 | `src/game.js` | endGame() 新增 evolutions/completedQuestsCount/killsAt60 统计 |
| 杀敌计时 | `src/game.js` loop() | 新增 killsAt60 追踪（前 60s 杀敌数） |
| 协同触发 | `src/entities/Player.js` | checkSynergies() 新增 achieveFlag('synergy_first') |
| 场景注册 | `src/ui/scenes.js` | ALL_SCENES 新增 'achievement-panel' |

### 一、对联机架构的影响评估

**结论：无影响。** 成就系统是纯客户端 localStorage 逻辑，不涉及任何网络传输或服务器端状态。

逐项分析：

| 成就系统组件 | 数据存储 | 网络传输 | 联机影响 |
|-------------|---------|---------|---------|
| completedAchievements | localStorage | 无 | 各客户端独立追踪，互不干扰 |
| achievedFlags | localStorage | 无 | 同上 |
| 成就检查逻辑 | 纯客户端函数 | 无 | Save.checkAchievements() 基于本地 stats 运行 |
| 灵魂碎片奖励 | localStorage | 无 | 各客户端独立计算 |

### 二、对序列化接口的影响

**PlayerState 快照格式**：无新增字段。成就系统的核心数据（completedAchievements、achievedFlags）存储在 Save（localStorage）中，不属于 Player 运行时状态。序列化接口中的 `gold`、`level`、`weapons` 等字段不受影响。

**ServerSnapshot 格式**：无需修改。成就检查发生在 endGame() 时，使用的是单局游戏统计（kills、elapsed、evolutions 等），这些统计通过事件聚合在本地计算，不需要跨网络同步。

### 三、对服务器端逻辑的影响

**无新增服务器端需求。** 理由：

1. 成就是 PvE 个人追踪，非竞技排名，不需要服务器端验证
2. 成就奖励（soulFragments）是单机经济资源，联机时各客户端独立拥有
3. 成就检查函数（Save.checkAchievements）引用 CFG.ACHIEVEMENTS 配置 + 本地统计数据，是纯客户端计算
4. 如果未来需要"全球成就"或排行榜功能，那是独立的后端服务（独立于联机房间服务器），当前不纳入 MVP 范围

### 四、新增字段的未来考虑

`game.js` 新增了两个运行时字段：

- `evolutions: []` -- 记录本局武器进化历史，用于 condition 类型成就检查
- `killsAt60: number` -- 前 60s 杀敌数，用于"和平主义者"类成就

这两个字段在联机场景下的处理：

| 字段 | 联机处理方式 | 理由 |
|------|------------|------|
| evolutions | 各客户端独立追踪 | 武器进化是玩家个人选择，不需要同步 |
| killsAt60 | 各客户端独立追踪 | 基于 elapsed < 60 的判断是本地逻辑 |

### 五、Player.js 的 Save 引入

Player.js 新增了 `import { Save } from '../core/save.js'`，在 checkSynergies() 中调用 `Save.achieveFlag('synergy_first')`。

**对联机改造的影响**：RemotePlayer 在联机时不需要调用 Save.achieveFlag()（远程玩家的成就由远程客户端自己追踪）。拆分为 LocalPlayer/RemotePlayer 时，achieveFlag 调用保留在 LocalPlayer 中即可。这是一个需要注意但不是阻塞的点。

### 阻塞状态复查（连续第 5 次）

| 后端产出物 | 状态 | 前端依赖 |
|-----------|------|---------|
| 联机技术调研报告 | 完成 | 无 |
| 联机架构设计规格书 | 完成 | 无 |
| 网络协议详细规格书 | 完成 | 无 |
| 联机前置任务清单 | 完成 | 无（已交付前端参考） |
| Player 拆分方案 | 设计完成 | 前端评审 + 实现 |
| 可序列化状态接口 | 设计完成 | 前端评审 + 实现 |
| 服务器 MVP 原型 | 评估完成 | 依赖上述两项前端实现 |

前端当前迭代重心（v1.3.0）：成就系统实现（已完成，待提交）。Player 拆分仍未排入前端迭代计划。

### 决策记录

- 成就系统对联机架构零影响，纯客户端 localStorage 逻辑，无需任何后端适配
- Player.js 引入 Save 模块需在拆分时注意：achieveFlag 调用保留在 LocalPlayer，RemotePlayer 不需要
- 后端仍处于设计完成、等待前端实现阶段，无新的高价值后端工作可推进
- 连续第 5 次阻塞确认，联机前置任务清单（Drive #15 产出）仍然有效，随时可供前端排入计划

---

## 2026-04-06 -- Drive #16: 节奏平衡调优对联机架构的影响评估

### 背景

前端 Drive #16 完成了三组节奏平衡调优（EXP_TABLE 前期加速、金币经济重构、spawner 过渡阶段），涉及 `config.js`、`game.js`、`spawner.js` 三个文件。本次评估这些变更对联机架构（序列化字段、确定性计算、服务器端逻辑复现）的影响。

### 变更摘要

| 变更项 | 涉及文件 | 具体内容 |
|--------|---------|---------|
| EXP_TABLE 前期加速 | config.js | 前9级阈值降低15-20%，15级全表更新 |
| 金币经济重构 | config.js + game.js | 新增 CFG.GOLD 常量块（perKill:3, gemToGold:true），金币计算从硬编码改为引用常量 |
| spawner 过渡阶段 | spawner.js | 新增 120-150s 过渡阶段，密度跳跃分两步 |

### 一、对序列化接口的影响

**PlayerState 快照格式**：无结构性变更。现有设计中的 `gold` 字段已覆盖。新增的 `CFG.GOLD` 常量块是纯配置，不涉及快照字段变化。

**EnemyState 快照格式**：无变更。spawner 过渡阶段只影响生成频率和类型，不影响敌人实体的序列化字段。

**快照大小影响**：可忽略。EXP_TABLE 变化不影响运行时快照体积。金币计算逻辑变更在服务器端复现即可，不增加传输数据量。

### 二、对确定性计算的影响

**金币计算变更为确定性友好**：这是一个正面改进。

变更前的金币计算是：
```js
window.game.player.gold += 10 + comboGold;
```
硬编码常量 `10`，服务器端复现时需要匹配这个 magic number。

变更后：
```js
window.game.player.gold += CFG.GOLD.perKill + comboGold + goldFromGem;
```
全部引用 `CFG` 常量，服务器端 import 同一份 `config.js` 即可获得相同计算逻辑。

**gemVal 变量提取**：宝石价值计算（基于敌人类型的条件分支）现在提取为 `gemVal` 变量，同时用于金币计算和宝石掉落。这意味着服务器端复现金币计算时，也需要同步复现这个条件分支。当前逻辑是纯函数式的（输入敌人类型，输出数值），适合提取为共享函数。

**评估结论**：金币计算变更为确定性友好。CFG 常量引用模式使得服务器端可以直接 import 同一份配置，消除 magic number 不一致风险。

### 三、对服务器端逻辑复现的影响

| 逻辑 | 变更前 | 变更后 | 服务器端影响 |
|------|--------|--------|------------|
| 金币奖励 | `gold += 10 + comboGold` | `gold += CFG.GOLD.perKill + comboGold + goldFromGem` | 需新增 CFG.GOLD 引用 + gemVal 条件分支 |
| 宝石掉落价值 | 内联条件分支 | 提取为 `gemVal` 变量复用 | 逻辑不变，但代码结构更清晰 |
| 敌人生成 | 120-180s 直接跳变 | 新增 120-150s 过渡 | spawner 需同步更新 |

**spawner 过渡阶段**：服务器端的 `getSpawnRate()` 函数需要与客户端保持一致。由于 spawner 是纯函数（输入 elapsed，输出配置），服务器端 import 同一份 `spawner.js` 即可。这是 ES Module 架构的一个优势 -- 服务器端可以直接复用前端模块。

### 四、对网络协议规格书的影响

网络协议规格书（`docs/superpowers/specs/2026-04-04-network-protocol-spec.md`）中定义的快照格式无需修改：
- `PlayerSnap` 中的 `gold` 字段已覆盖金币数据
- `EventSnap` 中的 `kill` 事件类型不受影响
- 快照大小估算（~5KB/100ms）不受影响

### 五、风险评估

| 风险项 | 等级 | 说明 | 缓解措施 |
|--------|------|------|---------|
| 服务器端金币计算不一致 | 低 | CFG 常量引用消除了 magic number 风险 | 服务器 import 同一份 config.js |
| spawner 不同步 | 低 | 过渡阶段为纯配置变更 | 服务器 import 同一份 spawner.js |
| gemVal 条件分支遗漏 | 低 | 纯函数式逻辑，易于提取 | 建议未来提取为 `src/shared/gem-value.js` 共享函数 |

### 结论

**本轮平衡调优对联机架构无阻塞影响**。具体评估：

1. **序列化接口**：无结构性变更，快照格式无需修改
2. **确定性计算**：正面改进。CFG 常量引用消除了硬编码 magic number，使服务器端复现更可靠
3. **服务器端逻辑**：金币计算和 spawner 过渡阶段需要服务器端同步，但由于是纯配置/纯函数逻辑，服务器 import 同一份前端模块即可，无需额外编码
4. **网络协议**：无需修改

### 阻塞状态复查（连续第 4 次）

| 后端产出物 | 状态 | 前端依赖 |
|-----------|------|---------|
| 联机技术调研报告 | 完成 | 无 |
| 联机架构设计规格书 | 完成 | 无 |
| 网络协议详细规格书 | 完成 | 无 |
| 联机前置任务清单 | 完成 | 无（已交付前端参考） |
| Player 拆分方案 | 设计完成 | 前端评审 + 实现 |
| 可序列化状态接口 | 设计完成 | 前端评审 + 实现 |
| 服务器 MVP 原型 | 评估完成 | 依赖上述两项前端实现 |

前端当前迭代重心（v1.2.4 -> v1.3.0）：成就系统 UI + 无尽模式实现 + 网格空间哈希。Player 拆分仍未排入前端迭代计划。

### 决策记录
- 本轮平衡调优将金币硬编码改为 CFG 常量引用，是联机确定性的正面改进
- spawner 新增过渡阶段为纯配置变更，ES Module 架构允许服务器端直接复用
- 建议：未来金币计算中的 gemVal 条件分支可提取为独立共享函数 `src/shared/gem-value.js`，前端和服务器端共用，避免条件分支不一致
- 后端仍处于设计完成、等待前端实现阶段，无新的高价值后端工作可推进

---

## 2026-04-05 -- Drive #15: 联机前置任务清单 + 新系统影响评估

### 成果
- 输出联机前置任务精简清单 `docs/superpowers/specs/2026-04-05-multiplayer-prerequisites-checklist.md`
- 评估无尽模式、成就系统对联机架构的影响，结论：无阻塞影响
- 连续第 3 次阻塞状态确认，但本次采取了主动行动（输出前端清单）降低前端排入计划的认知成本

### 联机前置任务清单 (面向前端，1 页精简版)

清单文件: `docs/superpowers/specs/2026-04-05-multiplayer-prerequisites-checklist.md`

| 任务 | 内容 | 预估代码量 |
|------|------|-----------|
| 任务 1 | Player 拆分: PlayerBase + LocalPlayer + RemotePlayer | ~150 行 |
| 任务 2 | 序列化接口: snapshot() + applySnapshot() | ~80 行 |
| 任务 3 | game.js 状态解耦: 收敛 beginGame() 状态对象 | ~80 行 |

**总计约 300-400 行新增/修改代码**。三项任务完成后，后端即可启动服务器 MVP 编码。

### 新系统对联机架构的影响评估

| 新系统 | 影响范围 | 评估结论 |
|--------|---------|---------|
| 无尽模式 | 序列化接口 | 快照新增 3 个字段（endless, bossCycleIndex, bossKillCount），成本可忽略 |
| 无尽模式 | 服务器端逻辑 | Boss 周期生成 + 动态 MAX_ENEMIES + 递增难度需服务器复现，属于服务器 MVP Phase 2 工作 |
| 成就系统 | 联机架构 | 纯客户端逻辑（基于 localStorage），联机时各客户端独立追踪，无服务器需求 |
| 无尽模式 + 联机 | 性能 | 无尽模式最大 100 敌人 + 多人快照 ~5KB/100ms，带宽预算内可承受 |

### 阻塞状态复查（连续第 3 次）

| 后端产出物 | 状态 | 前端依赖 |
|-----------|------|---------|
| 联机技术调研报告 | 完成 | 无 |
| 联机架构设计规格书 | 完成 | 无 |
| 网络协议详细规格书 | 完成 | 无 |
| 联机前置任务清单 | 完成 | 无（已交付前端参考） |
| Player 拆分方案 | 设计完成 | 前端评审 + 实现 |
| 可序列化状态接口 | 设计完成 | 前端评审 + 实现 |
| 服务器 MVP 原型 | 评估完成 | 依赖上述两项前端实现 |

前端当前迭代重心（v1.2.3 -> v1.3.0）：成就系统 + 无尽模式实现。Player 拆分仍未排入前端迭代计划。

### 服务器端确定性物理/碰撞检测方案 -- 预研结论

前端 P1 计划中的"网格空间哈希碰撞检测"和"固定时间步游戏循环"恰好是联机服务器端的性能和确定性基础。当前评估：

1. **碰撞检测服务器端复用**: 前端实现空间哈希后，碰撞检测逻辑（AABB + 精确距离判断）可抽取为纯函数，服务器端 import 使用。当前 Enemy/Player 的碰撞在 `game.js` 的主循环中内联实现，联机时需提取为独立模块 `src/systems/collision.js`。

2. **固定时间步的确定性意义**: 前端实现固定时间步后，服务器端使用相同的时间步（100ms tick）可保证双方逻辑对齐。这是半授权状态同步中服务器验证伤害/死亡的必要条件。

3. **结论**: 暂不需要独立调研。等前端完成这两项 P1 后，后端在服务器 MVP 中直接复用即可。

### 决策记录
- Drive #14 承诺"若前端仍无联机计划，主动撰写精简清单" -- 本次已兑现
- 清单控制在 1 页以内，3 个任务、表格化、含代码量和验收标准，降低前端评估成本
- 无尽模式/成就系统不阻塞联机前置任务，前端可在任意迭代窗口插入联机准备工作
- 服务器端确定性物理方案等前端空间哈希落地后再评估，避免重复调研

---

## 2026-04-05 -- Drive #14: 阻塞状态复查 + 联机设计文档对齐检查

### 成果
- 确认后端所有设计产出物状态未变，仍处于等待前端实现阶段
- 检查 v1.2.1 -> v1.2.2 期间的前端工作：分裂虫敌人（Drive #14）、ARCHITECTURE.md 文档（Mermaid UML），均未涉及 Player 拆分或序列化接口
- 评估前端当前 P1 迭代方向：网格空间哈希碰撞检测 + 固定时间步游戏循环，联机相关工作未排入前端计划
- 对齐检查：新增的 ARCHITECTURE.md 与后端联机架构规格书无冲突

### 阻塞状态复查（连续第2次）

| 后端产出物 | 状态 | 前端依赖 |
|-----------|------|---------|
| 联机技术调研报告 | 完成 | 无 |
| 联机架构设计规格书 | 完成 | 无 |
| 网络协议详细规格书 | 完成 | 无 |
| Player 拆分方案 | 设计完成 | 前端评审 + 实现 LocalPlayer/RemotePlayer |
| 可序列化状态接口 | 设计完成 | 前端评审 + 实现 snapshot()/applySnapshot() |
| 服务器 MVP 原型 | 评估完成 | 依赖上述两项前端实现 |

前端当前迭代重心：分裂虫实现(v1.2.2) + 网格空间哈希 + 固定时间步。Player 拆分仍未排入前端迭代计划。

### 可推进方向评估

| 方向 | 可行性 | 结论 |
|------|--------|------|
| 服务器 MVP 提前编码 | 低 | 前端序列化格式未冻结，编码后大概率返工 |
| 新技术调研 | 低 | Drive #12 已全面评估，行业无重大变化 |
| 服务器端单元测试框架 | 中 | 可提前搭建，但不紧急；MVP 阶段可用手动集成测试代替 |
| 联机测试用例设计 | 中 | 可设计但无法运行验证，价值有限 |
| Docker 部署方案细化 | 中 | 可推进但不紧急 |

### Drive #13 承诺的后续行动复查
Drive #13 提出："若前端仍无联机相关计划，可考虑主动编写服务器端单元测试框架"。
**结论**：当前仍不启动。理由 -- 服务器端代码尚未编写（~500行 MVP），没有可测试的代码。单元测试框架应随服务器 MVP 同步搭建，而非独立先行。

### 结论
后端联机设计工作已全部完成（调研 -> 架构 -> 协议 -> 拆分方案 -> 序列化接口），当前连续第2次确认无新的高价值后端工作可推进。下一步行动仍取决于前端 Agent 将 Player 拆分和序列化接口排入迭代计划。

### 决策记录
- 不强行制造工作项，避免产出低价值文档或先行编码后返工
- 连续 2 次阻塞确认，若 Drive #15 仍无变化，考虑：(1) 主动为前端撰写一份精简的"联机前置任务清单"（1页以内），降低前端排入计划的认知成本；(2) 或保持等待
- 前端优先推进网格哈希 + 固定时间步是合理决策，这两项恰好也是联机服务器端的性能基础

---

## 2026-04-04 — Drive #13: 阻塞状态确认，无新后端工作可推进

### 成果
- 确认后端所有设计产出物状态未变，仍处于等待前端实现阶段
- 检查近期 git 提交（v1.2.0 -> v1.2.1），前端工作集中在武器进化路线扩展和热路径性能优化，未涉及 Player 拆分或序列化接口
- 评估是否有新的后端技术工作可推进，结论：无

### 阻塞状态复查

| 后端产出物 | 状态 | 前端依赖 |
|-----------|------|---------|
| 联机技术调研报告 | 完成 | 无 |
| 联机架构设计规格书 | 完成 | 无 |
| 网络协议详细规格书 | 完成 | 无 |
| Player 拆分方案 | 设计完成 | 前端评审 + 实现 LocalPlayer/RemotePlayer |
| 可序列化状态接口 | 设计完成 | 前端评审 + 实现 snapshot()/applySnapshot() |
| 服务器 MVP 原型 | 评估完成 | 依赖上述两项前端实现 |

前端当前迭代重心：武器系统扩展（进化路线）+ 性能优化。Player 拆分尚未排入前端迭代计划。

### 可推进方向评估

| 方向 | 可行性 | 结论 |
|------|--------|------|
| 服务器 MVP 提前编码 | 低 | 前端序列化格式未冻结，编码后大概率返工 |
| 新技术调研（WebTransport 等） | 低 | Drive #12 已评估，无新变化 |
| 联机测试用例设计 | 中 | 可提前设计，但无实际运行环境验证，价值有限 |
| Docker 部署方案细化 | 中 | 可推进但不紧急，MVP 阶段本地开发即可 |

### 结论
后端联机设计工作已全部完成（调研 -> 架构 -> 协议 -> 拆分方案 -> 序列化接口），当前无新的高价值后端工作可推进。下一步行动仍取决于前端 Agent 将 Player 拆分和序列化接口排入迭代计划。

### 决策记录
- 不强行制造工作项，避免产出低价值文档
- 保持阻塞状态透明，等待前端迭代规划中纳入联机准备工作
- Drive #14 时再次复查，若前端仍无联机相关计划，可考虑主动编写服务器端单元测试框架

---

## 2026-04-04 — Drive #12: 联机设计全景检查与阻塞确认

### 成果
- 全面审查后端联机设计产出物，确认所有设计阶段工作已完成
- 评估新技术方向（WebTransport 等），确认无新的高价值调研项
- 更新优先级状态，明确当前阻塞点

### 设计产出物全景

| 产出物 | 文件 | 状态 |
|--------|------|------|
| 联机技术调研报告 | `docs/team/backend-research.md` | ✅ 完成 |
| 联机架构设计规格书 | `docs/superpowers/specs/2026-04-04-multiplayer-architecture-design.md` | ✅ 完成 |
| 网络协议详细规格书 | `docs/superpowers/specs/2026-04-04-network-protocol-spec.md` | ✅ 完成 |
| Player 拆分方案设计 | backend-log.md 内嵌 | ✅ 完成，待前端评审实现 |
| 可序列化状态接口设计 | backend-log.md 内嵌 | ✅ 完成，待前端评审实现 |

### 新技术方向评估

| 方向 | 评估结论 | 理由 |
|------|---------|------|
| WebTransport 替代 WebSocket | 暂不纳入 | Safari 支持有限（需 iOS 16.4+），H5 游戏需广泛兼容；本项目是 PvE 肉鸽，10Hz 快照对延迟不敏感，WebSocket 完全够用 |
| 服务器端渲染优化（SSR for Game） | 不适用 | 本项目是 Canvas 2D，无 DOM 渲染，不存在 SSR 场景 |
| WebCodecs 二进制序列化 | 过早 | MVP 用 JSON 即可，等带宽成为瓶颈再考虑 |
| SharedArrayBuffer 多线程 | 低优先级 | 主循环单线程足够，性能瓶颈在 draw call 不在逻辑 |

### 当前阻塞分析

后端联机工作处于**设计完成、等待前端实现**的阶段。具体依赖链路：

```
后端设计产出（全部完成）
  │
  ├── Player 拆分方案 ──→ 前端评审 + 实现 LocalPlayer/RemotePlayer
  ├── 序列化接口设计 ──→ 前端评审 + 实现 snapshot()/applySnapshot()
  ├── 网络协议规格 ──→ 前端评审 + 实现客户端网络层
  │
  └── 全部前端实现完成 ──→ 后端启动服务器 MVP 编码
```

**后端当前无阻塞项需要推进。** 下一步行动取决于前端 Agent 的 P1 实现进度。

### 决策记录
- 不强制寻找新工作项，避免产出低价值调研文档
- WebTransport 在 Safari 兼容性改善后可重新评估（预计 2027 年）
- 服务器 MVP 原型代码量已评估（~500行），技术方案明确，可随时启动

---

## 2026-04-04 — Drive #11: 网络协议详细规格书

### 成果
- 完成网络协议详细规格书 `docs/superpowers/specs/2026-04-04-network-protocol-spec.md`
- 补充联机架构规格书中缺失的协议细节，覆盖 11 个章节

### 规格书内容概要

| 章节 | 内容 |
|------|------|
| 连接生命周期 | 完整的 WebSocket 消息交互时序图 |
| 消息格式规范 | 通用包装 NetMsg + 序列号规则 + 17 种消息类型总表 |
| C→S 消息定义 | join / ready / input / upgrade_pick / ping 各字段详细定义 + 服务器验证规则 |
| S→C 消息定义 | room_info / game_start / snapshot / game_over / error 完整结构 |
| 快照格式 | PlayerSnap / EnemySnap / BulletSnap / PickupSnap / EventSnap 全部实体序列化格式 |
| 断线重连 | 检测机制 + 重连流程 + 重连策略（固定 2s 间隔，30s 超时） |
| 服务器游戏循环 | 100ms tick 内各阶段时序分配 |
| 客户端插值策略 | InterpBuffer 实现 + 渲染延迟 100ms + MVP 简化预测（位置覆盖） |
| 带宽预算 | 上行 ~3KB/s / 下行 ~50KB/s 每客户端 |
| 协议版本 | URL 参数版本检查 + 后向兼容策略 |
| 决策记录 | 9 项技术决策及理由 |

### 关键设计决策

1. **input ~30Hz（有变化时发送）**：平衡响应性和带宽，比每帧发送节省 50%
2. **snapshot 10Hz + 5KB/快照**：PvE 场景足够，50KB/s 下行在移动网络可接受
3. **渲染延迟 100ms**：插值缓冲 3 个快照，画面平滑
4. **MVP 客户端预测用位置覆盖而非重模拟**：简化实现，PvE 偶发纠正可接受
5. **断线重连 30s 超时**：短局游戏（5分钟），不宜过长等待
6. **新增 BulletSnap / PickupSnap**：架构规格书遗漏了子弹和掉落物的同步格式

### 快照大小详细估算（2人 + 30敌人 + 20子弹 + 15掉落物）

| 组件 | 数量 | 单条 | 小计 |
|------|------|------|------|
| PlayerSnap | 2 | ~200B | 400B |
| EnemySnap | 30 | ~80B | 2400B |
| BulletSnap | 20 | ~60B | 1200B |
| PickupSnap | 15 | ~40B | 600B |
| EventSnap | 5 | ~50B | 250B |
| 包头 + 其他 | - | - | 150B |
| **总计** | | | **~5KB** |

### 与架构规格书的差异

架构规格书中的 `ServerSnapshot` 只有 `players / enemies / events` 三个数组。本次协议规格书补充了：
- `bullets: BulletSnap[]` — 子弹状态（武器 projectile 同步必需）
- `pickups: PickupSnap[]` — 掉落物（宝石/食物/宝箱）
- `serverSeq` — 服务器快照序号（检测跳帧）
- 完整的 `EventSnap` 类型扩展（kill/damage/heal/pickup/levelup/boss_spawn/boss_kill）
- 错误码体系（8 种标准错误码）

### 决策记录
- 协议规格书是前后端对接的核心契约，越早定义清楚越能减少协同成本
- 快照格式相比架构规格书有扩展（新增 bullets/pickups），前端评估时需注意字段变化
- MVP 阶段不做 Delta Compression，快照 5KB/100ms 在 JSON 格式下完全可接受
- 断线重连设计已包含在协议规格中，服务器 MVP 实现时应一并支持

---

## 2026-04-04 — Drive #10: 联机技术栈迭代进展评估

### 成果
- 梳理联机技术栈整体进展，评估 P2 服务器 MVP 原型的就绪度
- 确认 P2 前置依赖关系，更新优先级状态

### 联机技术栈迭代进展总览

| 模块 | 技术选型 | 方案状态 | 阻塞情况 |
|------|---------|---------|---------|
| 同步模式 | 半授权状态同步 | ✅ 选型确定 | 无 |
| 传输协议 | WebSocket (ws) | ✅ 选型确定 | 无 |
| 服务器框架 | Node.js + ws 自建 | ✅ 选型确定 | 无 |
| 序列化 | JSON (MVP) | ✅ 选型确定 | 无 |
| 部署 | Docker + Fly.io | ✅ 选型确定 | 无 |
| Player 拆分 | LocalPlayer / RemotePlayer | 🔨 设计完成 | 待前端评审实现 |
| 可序列化状态 | ServerSnapshot 格式 | 🔨 设计完成 | 待前端评审实现 |
| 服务器 MVP | 房间 + 握手 + 状态广播 | ✅ 已评估 | 依赖 P1 前端实现 |
| Docker 部署 | Dockerfile + CI/CD | 待评估 | 低优先级 |

### P2 服务器 MVP 原型评估

**评估结论**：P2 服务器 MVP 原型技术方案已明确（Node.js + ws，~500行代码），但存在前置依赖，不宜立即启动编码。

**前置依赖分析**：

1. **Player 拆分（P1）必须先完成前端实现**
   - 服务器 MVP 的客户端对接需要 RemotePlayer 类
   - 服务器广播的 snapshot 需要客户端有反序列化和插值能力
   - 如果前端未实现拆分，服务器 MVP 无法端到端联调

2. **可序列化状态接口（P1）必须先完成前端实现**
   - 服务器端的游戏循环（敌人生成、碰撞检测）依赖与客户端一致的状态格式
   - 快照格式的字段对齐需要前后端同步确认
   - `snapshot()` / `applySnapshot()` 函数需要前后端配合测试

**依赖链路**：
```
P1 设计完成 → P1 前端实现 → P2 服务器 MVP → P2 端到端联调
     ✅             ⏳              ✅ 评估通过          ⏳
```

**服务器 MVP 原型技术方案摘要**（已评估，可随时启动）：

| 组件 | 方案 | 预估代码量 |
|------|------|-----------|
| WebSocket 服务器 | ws 库，单进程 | ~100行 |
| 房间管理 | 内存 Map，LOBBY/PLAYING/RESULT 状态机 | ~150行 |
| 游戏循环 | setInterval 100ms，敌人生成 + 状态广播 | ~150行 |
| 协议处理 | JSON 消息解析 + 验证 | ~100行 |
| **合计** | | **~500行** |

**启动条件**：
- 前端完成 Player 拆分（LocalPlayer + RemotePlayer）
- 前端完成序列化接口（snapshot / applySnapshot）
- 前端评估规格书无重大修改需求

### 决策记录
- P2 服务器 MVP 技术可行性无问题，阻塞点纯粹是前后端协同的顺序依赖
- 不提前启动服务器编码，避免前端实现拆分时格式变更导致返工
- Docker 部署方案保持低优先级，MVP 阶段本地开发即可
- 联机技术栈全线选型已确定（半授权状态同步 + WebSocket + Node.js + JSON + Fly.io），后续迭代只需在既定框架内深化

---

## 2026-04-04 — Drive #6: 联机架构设计规格书

### 成果
- 完成联机架构设计规格书 `docs/superpowers/specs/2026-04-04-multiplayer-architecture-design.md`
- 覆盖8大章节：架构概览、技术栈、网络协议、前端改造、房间系统、实现路线图、风险评估、决策记录

### 关键设计决策
1. **半授权状态同步**：服务器验证伤害/死亡/升级，客户端本地预测
2. **10Hz 快照同步**：~1.5KB/快照 × 10 = ~15KB/s/玩家
3. **Player 拆分**：LocalPlayer + RemotePlayer，共享 PlayerBase
4. **房间状态机**：LOBBY → PLAYING → RESULT
5. **4阶段实现**：~1400行新增代码

### 实现路线图

| 阶段 | 内容 | 预估 |
|------|------|------|
| Phase 1 | Player 拆分 + 序列化 | ~300行 |
| Phase 2 | WebSocket 服务器 MVP | ~500行 |
| Phase 3 | 状态同步 + 远程渲染 | ~400行 |
| Phase 4 | 验证 + 防作弊 | ~200行 |

### 决策记录
- 半授权而非帧同步：JS浮点不确定
- ws 而非 Colyseus：联机需求简单，自建灵活
- JSON 而非二进制：MVP优先可读性
- Fly.io 部署：边缘节点 + WebSocket + 免费额度

---

## 2026-04-04 — Drive #4: 联机准备度快速评估

### 成果
- 完成代码库联机准备度评估（game.js / Player.js / camera.js）
- 确认 LocalPlayer/RemotePlayer 拆分方案仍然适用

### 评估结果

| 文件 | 耦合度 | 联机改造复杂度 | 说明 |
|------|--------|---------------|------|
| game.js | HIGH | HIGH | window.game 单例，全局状态紧耦合 |
| Player.js | MEDIUM | LOW-MEDIUM | 回调模式可扩展，类结构较干净 |
| camera.js | LOW | LOW | 单目标跟随，易扩展为多目标 |

### 结论
- LocalPlayer/RemotePlayer 设计方向正确，Player 回调模式天然支持远程扩展
- **主要瓶颈**：game.js 全局状态重构，非 Player 架构问题
- 序列化接口设计可用，快照格式合理（~1.5KB/快照）
- 建议下一步：先重构 game.js 为可序列化状态，再做 Player 拆分

---

## 2026-04-04 — 联机技术调研

### 成果
- 完成联机全栈技术调研报告 `docs/team/backend-research.md`
- 覆盖7大方向：网络同步、协议、服务器框架、架构模式、部署、防作弊、对当前项目影响

### 关键决策
1. **网络同步**：半授权状态同步（服务器验证关键逻辑，客户端本地预测）
   - 帧同步不适合 JS（浮点确定性难保证）
   - 状态同步务实，Coherence.io 已有 VS 网络化成功案例
2. **协议**：WebSocket (ws库)，MVP 阶段足够
3. **服务器**：Node.js + ws 自建（团队已有 JS 技能，联机需求简单2-4人）
4. **部署**：Docker + Fly.io（全球边缘节点、WebSocket 支持）
5. **对前端影响**：需拆分 Player 为 Local/Remote，抽取可序列化状态接口

### 技术选型总结

| 决策项 | 推荐方案 | 理由 | 备选 |
|--------|----------|------|------|
| 同步模式 | 半授权状态同步 | JS浮点不确定，状态同步更务实 | Colyseus |
| 传输协议 | WebSocket (ws) | 全浏览器支持、成熟稳定 | WebTransport |
| 服务器框架 | Node.js + ws 自建 | 技能栈复用、轻量灵活 | Colyseus/Nakama |
| 部署平台 | Fly.io | 边缘节点、WebSocket、自动扩缩 | Railway/Render |
| 序列化 | 自定义二进制协议 | 轻量、可控 | FlatBuffers |

### 技术债务 / 风险
- 前端 `game.js` 全局状态耦合度高，联机前需重构为可序列化状态
- `window.game` 引用模式不利于多实例（服务器端需要无 DOM 环境）
- 碰撞检测和伤害计算需抽取为纯函数（可在服务器端复用）

---

## 2026-04-04 — Player 拆分方案设计

### 设计方案：LocalPlayer / RemotePlayer 接口抽象

**目标**：将当前 Player 类拆分为可复用基类 + 本地/远程子类，为联机做准备。

**接口设计**：

```
IPlayer (接口)
├── x, y, w, h              // 位置/尺寸
├── hp, maxHp                // 生命
├── weapons: Weapon[]        // 武器列表
├── passives: object         // 被动道具
├── facingAngle: number      // 朝向
├── serialize(): object      // 序列化为网络传输格式
└── draw(ctx, cam, canvas)   // 渲染

LocalPlayer extends Player
├── input handling (WASD/摇杆)
├── dash() / takeDamage()    // 本地操作
├── combo system             // 连击（本地计算）
├── addExp() / levelUp       // 经验/升级（本地→同步给服务器）
└── _predictedState          // 客户端预测状态

RemotePlayer extends Player
├── interpolated position    // 插值位置（平滑远程移动）
├── _targetState             // 从服务器收到的目标状态
├── _interpBuffer[]          // 插值缓冲区（最近2-3个快照）
├── update(dt)               // 插值更新（不处理输入）
└── draw(ctx, cam, canvas)   // 渲染（可选不同颜色标识）
```

**序列化格式**：

```js
// 每100ms同步一次的最小状态包
{
  id: 'player_1',           // 玩家ID
  t: 12345,                 // 时间戳(ms)
  p: { x: 512, y: 384 },   // 位置
  a: 1.57,                  // 朝向角度
  hp: 6,                    // 当前HP
  w: ['holywater',3,0.5],   // [武器名, 等级, 计时器]
  s: { speedboots:2, armor:1 } // 被动
}
// 预计大小: ~120 bytes/包 × 10次/秒 = 1.2 KB/s/玩家
```

**对现有代码的影响**：

1. `Player.js` → 改名为 `LocalPlayer.js`，抽取共享逻辑到 `PlayerBase.js`
2. 新增 `RemotePlayer.js`（插值渲染 + 状态接收）
3. `game.js` 中 `window.game.player` 类型改为 `PlayerBase`
4. 武器的 `this.owner` 引用不变（Owner 接口兼容）

**决策记录**：
- 为什么用继承而非组合：当前 Player 类职责清晰，继承改动最小
- 为什么插值而非预测：肉鸽幸存者对精度要求低，插值实现简单且效果足够
- 同步频率100ms：肉鸽幸存者是PvE，100ms延迟可接受（< RTT阈值）

---

## 2026-04-04 — 可序列化状态接口设计

### 设计目标
将 `window.game` 的非序列化结构（函数引用、DOM引用、循环引用）转化为可在网络上传输的纯数据格式，为联机做准备。

### 状态快照格式

```ts
// 服务器端最小状态（每100ms广播一次）
interface ServerSnapshot {
  t: number;              // elapsed time (ms)
  players: PlayerState[];
  enemies: EnemyState[];
  bullets: BulletState[];
  gems: GemState[];
  foods: FoodState[];
  chests: ChestState[];
}

interface PlayerState {
  id: string;
  x: number; y: number;
  hp: number; maxHp: number;
  level: number; exp: number;
  gold: number;
  weapons: { name: string; level: number; timer: number }[];
  passives: Record<string, number>;
  facingAngle: number;
  dashing: boolean;
  combo: number;
}

interface EnemyState {
  id: string;     // 唯一标识（新增字段）
  type: string;
  x: number; y: number;
  hp: number; maxHp: number;
  w: number; h: number;
  frozen: number;  // >0 = 冰冻剩余时间
  slow: number;    // 减速百分比
  burn: { dmg: number; t: number } | null;
}

interface BulletState {
  x: number; y: number;
  vx: number; vy: number;
  dmg: number; life: number;
  color: string;
  pierce: number;
  burnDmg?: number; burnDur?: number;
}
```

### 序列化函数设计

```js
// src/systems/serialize.js
export function snapshot(game) {
  return {
    t: Math.round(game.elapsed * 1000),
    players: [playerState(game.player)],
    enemies: game.enemies.map(enemyState),
    bullets: game.bullets.map(bulletState),
    gems: game.gems.map(g => ({ x: g.x, y: g.y, value: g.value })),
    foods: game.foods.map(f => ({ x: f.x, y: f.y, icon: f.icon, age: f.age })),
    chests: game.chests.map(c => ({ x: c.x, y: c.y, opened: c.opened })),
  };
}

function playerState(p) {
  return {
    id: 'local', x: Math.round(p.x), y: Math.round(p.y),
    hp: p.hp, maxHp: p.maxHp, level: p.level, exp: p.exp, gold: p.gold,
    weapons: p.weapons.map(w => ({ name: w.name, level: w.level, timer: Math.round(w.timer * 100) })),
    passives: { ...p.passives },
    facingAngle: Math.round(p.facingAngle * 100) / 100,
    dashing: p._dashing, combo: p._combo,
  };
}

function enemyState(e) {
  return {
    id: e._netId || e.type + '_' + e.x.toFixed(0),
    type: e.type, x: Math.round(e.x), y: Math.round(e.y),
    hp: Math.round(e.hp * 10) / 10, maxHp: e.maxHp, w: e.w, h: e.h,
    frozen: e._frozen || 0, slow: e._slow || 0,
    burn: e._burn ? { dmg: e._burn.dmg, t: Math.round(e._burn.t * 10) / 10 } : null,
  };
}
```

### 反序列化（RemotePlayer专用）

```js
export function applySnapshot(remotePlayer, snap) {
  remotePlayer._targetState = snap;
  remotePlayer._interpBuffer.push({ ...snap, _time: performance.now() });
  if (remotePlayer._interpBuffer.length > 3) remotePlayer._interpBuffer.shift();
}
```

### 对现有代码的改造点
1. `Enemy` 类新增 `_netId` 字段（服务器分配唯一ID）
2. `window.game` 新增 `_serialize()` 方法（调用 `snapshot()`）
3. 新增 `src/systems/serialize.js` 模块
4. 敌人/子弹/宝石类需确保所有状态字段可序列化（无函数引用）

### 预估快照大小
- 10敌人 × ~60B + 1玩家 × ~200B + 20子弹 × ~50B + 30宝石 × ~20B ≈ **~1.5KB/快照**
- 10快照/秒 × 1.5KB = **~15KB/s/玩家**，4人 = ~60KB/s 总带宽
