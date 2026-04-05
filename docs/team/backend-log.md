# 后端程序工作记录 (Backend Agent Log)

> Agent: `backend` | 触发: 联机、后端、服务器、网络、同步、multiplayer

---

## 当前优先级

| 优先级 | 事项 | 状态 |
|--------|------|------|
| P0 | 联机技术调研报告（网络同步/协议/服务器/部署） | ✅ 已完成 |
| P1 | 联机架构设计规格书（半授权状态同步 + WebSocket + Node.js） | ✅ 设计规格书完成 |
| P1 | 网络协议详细规格书（消息定义/快照格式/断线重连） | ✅ Drive #11 完成 |
| P1 | Player 拆分方案设计（LocalPlayer / RemotePlayer 接口抽象） | 🔨 设计完成待评审，待前端实现 |
| P1 | 可序列化状态接口设计（游戏状态快照格式） | 🔨 设计完成待评审，待前端实现 |
| P2 | 服务器 MVP 原型（2人同房间联机） | ✅ 已评估，前置依赖 P1 前端实现 |
| P2 | Docker 容器化部署方案 | 待评估 |

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
