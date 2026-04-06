# 后端联机技术调研报告

## 调研背景

**项目**：肉鸽幸存者（H5 Canvas 2D 像素风吸血鬼幸存者类游戏）
**当前状态**：单机模式，纯前端实现（HTML5 + Canvas 2D + ES Module），零后端依赖
**目标**：为游戏规划多人联机架构，支持 2-4 人实时协作或对战
**约束**：小团队开发、H5 平台、需兼顾移动端与桌面端

### 当前项目架构概览

```
index.html (入口)
src/
  main.js          → 入口引导
  game.js          → 游戏状态、主循环、场景管理
  core/
    config.js      → CFG 常量配置
    math.js        → 向量/随机/距离工具
    save.js        → localStorage 存档
  entities/
    Player.js      → 玩家实体（移动、血量、武器、被动道具）
    enemy.js       → 敌人实体（6种类型 + Boss）
    gem.js         → 经验宝石
    food.js        → 食物掉落
    chest.js       → 宝箱
  weapons/
    registry.js    → 武器注册表（10种武器）
  systems/
    camera.js      → 摄像机系统
    spawner.js     → 敌人生成系统
    damage-text.js → 伤害数字
  ui/
    scenes.js      → 场景切换
    input.js       → 输入系统（键盘 + 虚拟摇杆）
    hud.js         → HUD 绘制
    upgrade-panel.js → 升级面板
  audio/
    sfx.js         → 音效系统
```

**关键特征**：
- 游戏状态集中在 `window.game` 对象（player、enemies、bullets、gems、effects 等）
- 实体系统为简单对象/类（非 ECS），通过数组管理
- 使用 `requestAnimationFrame` + `dt` 驱动主循环
- 所有数值引用 `CFG` 常量
- 地图大小 2400x2400，最大敌人数量 50，最大子弹数量 100

---

## 1. 网络同步方案

### 1.1 状态同步（State Synchronization）

**原理**：服务器维护权威游戏状态。客户端发送输入操作，服务器处理输入、更新世界状态，然后定期向所有客户端广播状态快照（位置、血量、分数等）。客户端接收后更新本地显示。

```
Client A ──input──→ Server ──state──→ Client B
Client B ──input──→ Server ──state──→ Client A
                    ↓
              权威游戏状态
```

**优点**：
- 防作弊能力强：服务器是唯一权威，客户端无法篡改游戏逻辑
- 对客户端差异容忍度高：不需要跨浏览器浮点数一致性
- 容易实现后加入/观战：客户端只需加载最新状态快照
- 适合大量实体的场景（如肉鸽幸存者的百个敌人）

**缺点**：
- 带宽消耗较大：需要定期传输完整/增量状态快照
- 实现复杂度中等偏高：需要 Delta Compression、插值、预测等辅助机制
- 服务器计算压力大：需要运行完整游戏模拟

**适用场景**：FPS、MOBA、MMO、动作类游戏

### 1.2 帧同步（Lockstep / Frame Synchronization）

**原理**：所有客户端运行相同的确定性模拟。每帧只传输玩家输入（数个字节），每个客户端从相同初始状态出发，执行相同逻辑，得到相同结果。

```
Client A ──input──→ Client B (模拟相同逻辑)
Client B ──input──→ Client A (模拟相同逻辑)
```

**优点**：
- 带宽极低：每帧仅传输输入数据（几字节）
- 服务器计算压力小：不需要运行游戏模拟，只需转发输入
- 回放系统天然支持：记录输入即可完整回放

**缺点**：
- 对确定性要求极高：浮点数计算必须跨平台一致
- JavaScript 浮点数行为在 V8/SpiderMonkey/JavaScriptCore 之间可能存在微小差异
- 所有客户端必须等待最慢的客户端（延迟取决于最慢玩家）
- 防作弊能力弱：修改客户端可绕过逻辑校验
- 需要使用定点数运算或整数运算替代浮点数

**适用场景**：RTS、回合制策略、格斗游戏

### 1.3 混合方案

现代游戏常采用混合方案：

- **Rollback Netcode**（GGPO）：帧同步 + 输入预测。发生预测错误时回滚并重新模拟。格斗游戏广泛使用。
- **半授权模型**：服务器验证关键状态（伤害计算、得分、物品掉落），客户端预测移动和视觉效果。
- **区域授权**：将世界划分为区域，每个区域的授权客户端负责该区域的状态。

### 1.4 辅助技术

#### 客户端预测（Client-Side Prediction）

客户端在发送输入后不等待服务器确认，立即在本地模拟操作结果（如移动角色）。当服务器权威状态返回时，客户端对比预测与实际结果，如有差异则纠正（Server Reconciliation）。

```
客户端：输入 → 立即预测移动 → 收到服务器状态 → 对比 → 纠正（如有偏差）
```

这是 Gabriel Gambetta 经典论文《Fast-Paced Multiplayer》系列的核心技术，被广泛应用于现代多人游戏。

#### 服务器和解（Server Reconciliation）

服务器维护每个客户端的输入序列号。当客户端收到服务器状态更新时，用该更新替换本地状态，然后重新模拟所有尚未被服务器确认的输入，从而平滑地纠正预测偏差。

#### 延迟补偿（Lag Compensation）

服务器在处理客户端的操作时，"回退"游戏世界到该客户端发出操作时的状态。例如，客户端在 t=100ms 时点击射击，网络延迟 50ms，服务器在 t=150ms 收到请求，但会回退世界到 t=100ms 的状态来判定是否命中。

#### 插值与外插值（Interpolation / Extrapolation）

- **插值（Interpolation）**：客户端使用过去的状态快照进行平滑渲染，在两个已知状态之间线性/球面插值。引入少量渲染延迟（通常 50-100ms），但画面平滑。
- **外插值（Extrapolation）**：当没有新的状态数据到达时，根据上一个已知状态的运动趋势预测未来位置。如果预测错误则突然纠正（"瞬移"现象）。

### 1.5 方案推荐：肉鸽幸存者适合状态同步

**理由**：

1. **大量实体场景**：游戏中有大量敌人（最大50个）、子弹、宝石、特效等，帧同步要求所有客户端精确模拟每个实体的行为，JS 的浮点数不确定性和性能开销都难以接受
2. **动作导向**：游戏节奏快，需要即时反馈，客户端预测 + 状态同步比帧同步的等待延迟体验更好
3. **跨浏览器兼容**：状态同步不要求浮点数确定性，天然兼容所有浏览器引擎
4. **防作弊需求**：肉鸽幸存者的升级、道具、伤害等数值需要服务器验证
5. **联机模式简单**：2-4人协作，不需要帧同步的低带宽优势
6. **已有案例**：Coherence.io 团队成功将 Vampire Survivors 转为网络多人模式，采用的就是状态同步方案

**推荐架构**：半授权状态同步
- 服务器运行完整游戏模拟（敌人生成、AI 行为、碰撞检测、伤害计算）
- 客户端预测玩家移动（立即响应输入）
- 服务器定期广播增量状态快照（20Hz 即可满足需求）
- 客户端对其他玩家和敌人使用插值平滑

---

## 2. 网络协议

### 2.1 传输层协议对比

| 特性 | WebSocket | WebRTC DataChannel | WebTransport |
|------|-----------|-------------------|--------------|
| **底层协议** | TCP | SCTP over DTLS over UDP | HTTP/3 (QUIC/UDP) |
| **延迟** | 低（但受 TCP 队头阻塞影响） | 超低（UDP 基础） | 超低（QUIC 无队头阻塞） |
| **可靠性** | 可靠（TCP 保证） | 可配置（可靠/不可靠） | 可配置（流可靠，数据报不可靠） |
| **架构** | 客户端 ↔ 服务器 | 点对点（需信令服务器） | 客户端 ↔ 服务器 |
| **NAT 穿越** | 不需要（服务器中转） | 需要 STUN/TURN 服务器 | 不需要（服务器中转） |
| **浏览器支持** | 全平台 | 全平台 | Chrome/Edge 完整，Firefox 部分 |
| **连接建立** | 一次 HTTP 握手 | ICE 协商（较慢） | 一次 QUIC 握手 |
| **二进制支持** | 是 | 是 | 是 |
| **适用延迟** | 30-100ms | 10-50ms | 10-50ms |

### 2.2 WebSocket

**优势**：
- 浏览器原生支持，API 简单成熟
- 大量框架支持（Socket.IO、ws、uWebSockets.js）
- 无需额外基础设施（NAT 穿透等）
- 调试工具丰富

**劣势**：
- 基于 TCP，存在队头阻塞问题（一个丢包阻塞所有后续包）
- 对于需要丢包容忍的实时游戏，TCP 的可靠重传会增加延迟
- 不支持不可靠传输模式

**适用**：回合制、休闲多人、不需要极致低延迟的游戏

### 2.3 WebRTC DataChannel

**优势**：
- 基于 UDP，延迟最低
- 支持不可靠/无序传输模式，适合游戏状态更新
- P2P 架构，减少服务器中转延迟
- Geckos.io 封装了 WebRTC，简化了客户端-服务器模式的使用

**劣势**：
- 连接建立复杂（ICE、STUN、TURN）
- 需要额外的信令服务器
- NAT 穿透不保证 100% 成功（需要 TURN 中继兜底）
- API 复杂，调试困难
- P2P 模式下无权威服务器，防作弊困难

### 2.4 WebTransport（新兴方案）

**优势**：
- 基于 HTTP/3 (QUIC)，UDP 基础，无队头阻塞
- 同时支持可靠流和不可靠数据报
- 客户端-服务器架构（不需要 NAT 穿透）
- API 比 WebRTC 简单
- IETF 标准推进中（2025 年 2 月更新至 draft-09）

**劣势**：
- 浏览器支持尚不完整（Safari 支持有限）
- 服务器端实现较少（需要 HTTP/3 支持）
- 生态不成熟，框架少
- 长期前景取决于浏览器支持

### 2.5 序列化方案对比

| 方案 | 编码速度 | 解码速度 | 载荷大小 | 零拷贝 | Schema | 适用场景 |
|------|---------|---------|---------|--------|--------|---------|
| **JSON** | 慢 | 慢 | 大（文本） | 否 | 无 | 开发调试、简单协议 |
| **MessagePack** | 快 | 快 | 中等 | 否 | 无 | JSON 替代、快速迁移 |
| **Protocol Buffers** | 中 | 中 | 小 | 否 | 有（.proto） | API 通信、跨语言 |
| **FlatBuffers** | 快 | 最快 | 中 | 是 | 有（.fbs） | 实时游戏、低延迟 |
| **自定义二进制** | 最快 | 最快 | 最小 | 是 | 无 | 极致优化 |

**针对本项目推荐**：

- **MVP 阶段**：使用 JSON。开发效率最高，调试方便。游戏载荷量小（2-4人 + 50敌人），JSON 性能够用。
- **优化阶段**：切换到自定义二进制协议或 MessagePack。肉鸽幸存者的状态数据结构简单且固定（位置 x/y、血量、类型 ID），自定义二进制协议可以用最少的字节表达：
  - 玩家状态：`[id:1B][x:2B][y:2B][hp:1B][facing:1B]` = 7 字节/玩家
  - 敌人状态：`[type:1B][x:2B][y:2B][hp:1B]` = 6 字节/敌人
  - 50 个敌人 = 300 字节，加上 4 个玩家 = 328 字节/快照，远小于 JSON（约 2-4KB）
- **长期方案**：如果需要跨语言支持（如迁移到 Go/Rust 服务器），考虑 Protocol Buffers。

### 2.6 Delta Compression（增量更新）

**原理**：不发送完整状态快照，只发送与上一快照相比发生变化的部分。

**实现方式**：
1. 服务器记录上一次发送给每个客户端的快照编号
2. 新快照与旧快照对比，只传输变化的字段
3. 客户端根据基础快照 + 增量数据重建完整状态

**效果**：带宽节省 60-90%，尤其适用于大量实体中只有少量变化的情况。

**肉鸽幸存者场景**：50 个敌人中，每帧通常只有 20-30 个发生位移/受伤变化，增量压缩可将每帧数据从 300+ 字节压缩到 100 字节以内。

### 2.7 协议推荐

| 阶段 | 传输协议 | 序列化 | 理由 |
|------|---------|--------|------|
| **MVP** | WebSocket (ws 库) | JSON | 开发速度最快，生态最成熟 |
| **优化** | WebSocket + 二进制帧 | MessagePack 或自定义二进制 | 平衡性能与开发成本 |
| **极致** | WebTransport 或 WebRTC (geckos.io) | 自定义二进制 + Delta Compression | 追求最低延迟 |

---

## 3. 服务器框架

### 3.1 Node.js 方案

#### Socket.IO

- **特点**：最流行的实时通信库，自动降级（WebSocket → 长轮询），内置房间/命名空间机制
- **优势**：API 简单，自动重连，房间系统开箱即用，社区资源丰富
- **劣势**：协议开销较大（比原生 WebSocket 多约 40% 载荷），自动降级机制增加复杂度，不适合高频小包（游戏场景）
- **适用**：聊天、回合制游戏、对延迟不敏感的应用

#### ws（原生 WebSocket）

- **特点**：轻量级、高性能的 WebSocket 服务器库
- **优势**：极简 API、最低协议开销、内存占用小、每秒可处理数十万消息
- **劣势**：功能精简（无房间、无自动重连），需要自己实现游戏层逻辑
- **适用**：追求极致性能和控制的场景

#### Colyseus

- **特点**：专为 HTML5 多人游戏设计的 Node.js 服务器框架
- **核心特性**：
  - 内置状态同步（Schema-based，自动 delta 同步）
  - 房间系统（创建/加入/匹配/销毁）
  - 客户端 SDK（JavaScript、Unity、Godot、Defold）
  - TypeScript 优先
- **优势**：开箱即用的游戏服务器功能，自动 delta 同步减少手动编码，活跃的社区
- **劣势**：学习曲线（需理解 Schema/Room/State 抽象），定制性受框架约束
- **适用**：快速搭建 HTML5 多人游戏

#### Geckos.io

- **特点**：基于 WebRTC 的 UDP 通信框架，专为实时游戏设计
- **优势**：UDP 级延迟、快照插值库、简单 API
- **劣势**：WebRTC 连接建立较慢、部分网络环境需要 TURN 中继、社区较小
- **适用**：对延迟极度敏感的快节奏游戏（FPS、竞速）

#### uWebSockets.js

- **特点**：基于 C/C++ (uSockets) 的高性能 WebSocket 库
- **优势**：性能极强（官方基准测试声称比 ws 快 10 倍以上），内存占用极低
- **劣势**：需要编译原生模块，部署环境受限
- **适用**：高并发 WebSocket 服务器

### 3.2 Go 方案

#### Nakama（Heroic Labs）

- **特点**：开源分布式游戏服务器（Apache 2.0 协议）
- **核心功能**：
  - 用户认证（邮箱/社交/OAuth/设备 ID）
  - 实时多人（基于 Socket 的状态同步）
  - 匹配系统（基于技能/段位）
  - 排行榜
  - 聊天系统（频道/私聊/群聊）
  - 数据存储（玩家数据、游戏状态持久化）
  - 服务器逻辑扩展（TypeScript/JavaScript、Lua、Go）
- **优势**：
  - 功能全面，开箱即用
  - 水平扩展设计
  - 多引擎 SDK（Unity、Unreal、Godot、JavaScript）
  - Docker 自托管免费
- **劣势**：
  - 框架约束较大，定制困难
  - 企业版功能收费
  - 学习成本（需掌握 Nakama API 和数据模型）
  - 对肉鸽幸存者这种简单游戏可能过重

### 3.3 Rust 方案

#### Bevy Renet

- **特点**：基于 Bevy 游戏引擎的网络库
- **优势**：性能极高、内存安全
- **劣势**：需要 Rust 专业知识，与 H5 前端不直接兼容，需要额外适配层

### 3.4 框架推荐

| 场景 | 推荐框架 | 理由 |
|------|---------|------|
| **快速 MVP（推荐）** | **Node.js + ws** | 团队已有 JS/TS 技能，轻量灵活，可完全控制架构 |
| **快速 MVP（替代）** | **Colyseus** | 开箱即用的房间和状态同步，但引入框架依赖 |
| **长期方案** | **Nakama** | 功能全面（认证、匹配、排行榜），适合规模化 |
| **极致延迟** | **Geckos.io** | UDP 传输，但增加了部署复杂度 |

**最终推荐**：**Node.js + ws + 自定义游戏逻辑**

理由：
1. 项目前端已用 JS/TS，团队技能栈统一
2. 肉鸽幸存者联机需求简单（2-4 人房间），不需要重型框架
3. 完全控制服务器逻辑，便于针对游戏特性优化
4. 后续可以逐步引入 Redis（匹配）、PostgreSQL（持久化）等组件

---

## 4. 架构模式

### 4.1 授权模型

#### Authoritative Server（授权服务器）

服务器是游戏状态的唯一权威。所有游戏逻辑（移动、碰撞、伤害、AI）在服务器执行。客户端只负责渲染和发送输入。

```
客户端 → 发送输入 → 服务器（运行游戏逻辑）→ 广播状态 → 所有客户端（渲染）
```

**优点**：防作弊最强，状态一致性保证
**缺点**：服务器计算压力大，开发工作量大

#### Semi-Authoritative Server（半授权服务器）

服务器验证关键操作（伤害、升级、物品获取），客户端负责非关键操作（移动预测、视觉效果）。

**推荐**：肉鸽幸存者采用半授权模型
- 服务器验证：伤害计算、经验获取、升级选择、Boss 生成、碰撞检测
- 客户端预测：玩家移动、特效渲染、UI 动画
- 服务器定时校准玩家位置（防止速度作弊）

#### Non-Authoritative Server（非授权服务器）

服务器仅转发数据，客户端自行计算所有逻辑。

**不推荐**：极易作弊，仅适用于信任环境（局域网）。

### 4.2 服务器类型

| 类型 | 描述 | 优点 | 缺点 |
|------|------|------|------|
| **Dedicated Server** | 独立服务器进程，无玩家客户端 | 稳定、公平、防作弊 | 运营成本高 |
| **Listen Server** | 一个客户端同时充当服务器 | 成本低 | 主机优势、主机断线全部断线 |
| **P2P** | 无中心服务器，点对点通信 | 无服务器成本 | NAT 问题、同步困难、防作弊差 |

**推荐**：Dedicated Server（容器化部署，按需启动/销毁）

### 4.3 房间服务器设计

```
┌──────────────────────────────────────────────┐
│                  Master Server               │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐     │
│  │  Auth     │ │  Match   │ │  Lobby   │     │
│  │  Service  │ │  Service │ │  Service │     │
│  └──────────┘ └──────────┘ └──────────┘     │
│         │           │           │             │
│         └─────┬─────┴─────┬─────┘             │
│               │           │                   │
│  ┌────────────▼──┐  ┌─────▼──────────┐       │
│  │ Room Server 1 │  │ Room Server 2  │ ...   │
│  │ (游戏实例 A)  │  │ (游戏实例 B)   │       │
│  └───────────────┘  └────────────────┘       │
│               │           │                   │
│         ┌─────▼───────────▼──────┐            │
│         │   Redis (状态/队列)    │            │
│         └────────────────────────┘            │
│         ┌────────────────────────┐            │
│         │   PostgreSQL (持久化)   │            │
│         └────────────────────────┘            │
└──────────────────────────────────────────────┘
```

**房间生命周期**：

```
创建 → 等待玩家 → 满员/准备 → 游戏进行 → 游戏结束 → 销毁
  │                          │
  └── 超时未满员 → 销毁       └── 玩家断线 → 等待重连/超时销毁
```

**房间数据结构**：

```javascript
{
  id: "room_abc123",
  state: "waiting" | "playing" | "finished",
  maxPlayers: 4,
  players: [
    { id: "p1", name: "玩家1", charId: "mage", ready: true, connected: true },
    { id: "p2", name: "玩家2", charId: "warrior", ready: true, connected: true }
  ],
  difficulty: "normal",
  hostId: "p1",
  createdAt: 1712200000,
  gameSnapshot: null  // 游戏进行中存储状态
}
```

### 4.4 匹配系统设计

#### 简单匹配（MVP 阶段）

```
玩家点击"快速匹配" → 加入匹配队列 → 满足人数条件（2-4人）→ 创建房间
```

使用 Redis 队列实现：

```
RPUSH match_queue { playerId, rating, timestamp }
LPOP match_queue → 取出匹配玩家
```

#### ELO/段位匹配（进阶阶段）

```
1. 计算玩家 ELO 分数（基于胜率、生存时间、击杀数）
2. 匹配时优先匹配 ELO 接近的玩家（±100 分范围内）
3. 等待超时后扩大匹配范围（±200 → ±300 → 全范围）
```

### 4.5 大厅系统设计

```
┌─────────────────────────────────────────┐
│            大厅界面 (Lobby)              │
│                                         │
│  [创建房间]  [快速匹配]  [邀请码加入]    │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ 房间列表：                       │    │
│  │ 🏠 房间A  2/4人  标准难度  🔓    │    │
│  │ 🏠 房间B  3/4人  噩梦难度  🔒    │    │
│  │ 🏠 房间C  1/4人  休闲难度  🔓    │    │
│  └─────────────────────────────────┘    │
└─────────────────────────────────────────┘
```

---

## 5. 部署方案

### 5.1 推荐部署架构

```
┌─────────────────────────────────────────────────────┐
│                   CDN (静态资源)                      │
│              index.html / assets                     │
│          Cloudflare / Vercel / Netlify               │
└─────────────────────┬───────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────┐
│              负载均衡器 (Nginx / LB)                  │
│           wss://game.example.com                     │
└────────┬──────────┬──────────┬──────────────────────┘
         │          │          │
    ┌────▼───┐ ┌───▼────┐ ┌──▼─────┐
    │ Game   │ │ Game   │ │ Game   │  ← Docker 容器
    │ Server │ │ Server │ │ Server │    (每个运行 N 个房间)
    │ (Node) │ │ (Node) │ │ (Node) │
    └────┬───┘ └───┬────┘ └──┬─────┘
         │         │         │
    ┌────▼─────────▼─────────▼─────┐
    │     Redis (状态/会话/队列)     │
    └──────────────┬───────────────┘
                   │
    ┌──────────────▼───────────────┐
    │   PostgreSQL (用户/排行/存档)  │
    └──────────────────────────────┘
```

### 5.2 Docker 容器化

```dockerfile
# Dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
EXPOSE 2567
CMD ["node", "server.js"]
```

**每个容器运行多个房间实例**（而非一个容器一个房间），资源利用率更高。

### 5.3 Kubernetes 编排

- **Agones**：Google 开源的 Kubernetes 游戏服务器编排框架
  - 专门解决游戏服务器生命周期管理（按需启动/自动扩缩/优雅关闭）
  - 支持 Dedicated Server 模型
  - 与 Kubernetes 深度集成

- **弹性伸缩策略**：
  - HPA (Horizontal Pod Autoscaler) 基于连接数/房间数自动扩缩
  - 预留缓冲容器（始终有空闲房间可用，新玩家无需等待容器启动）

### 5.4 边缘计算

| 方案 | 特点 | 适用性 |
|------|------|--------|
| **Cloudflare Workers** | 全球 300+ 节点、V8 隔离、无冷启动 | 适合匹配/大厅等轻量逻辑 |
| **Deno Deploy** | 全球边缘、原生 TypeScript | 适合轻量游戏服务器 |
| **Fly.io** | 全球边缘、Docker 部署、持久卷 | **最适合游戏服务器**（支持 TCP/UDP） |

**推荐**：Fly.io 作为游戏服务器宿主
- Docker 部署，与开发环境一致
- 全球边缘节点，延迟低
- 支持 TCP/UDP/WebSocket
- 自动扩缩容
- 免费额度足够开发/测试

### 5.5 全球部署策略

```
亚太区：东京/新加坡节点  → 亚服玩家
美洲区：美西/美东节点    → 美服玩家
欧洲区：法兰克福节点     → 欧服玩家
```

- 玩家登录时根据 IP/延迟自动选择最近区域
- 跨区匹配时选择中间区域或主机所在区域
- MVP 阶段只需部署单个区域（国内：阿里云/腾讯云）

---

## 6. 防作弊

### 6.1 核心原则：Never Trust the Client

所有关键游戏逻辑必须在服务器端验证。客户端只负责渲染和收集输入。

### 6.2 服务器端验证清单

| 验证项 | 实现方式 | 优先级 |
|--------|---------|--------|
| **移动速度** | 服务器校验每帧位移距离 ≤ 最大速度 * dt + 容差 | P0 |
| **伤害计算** | 服务器执行碰撞检测和伤害公式 | P0 |
| **经验/升级** | 服务器计算击杀奖励、经验值、升级选项 | P0 |
| **碰撞检测** | 服务器执行子弹-敌人、敌人-玩家碰撞 | P0 |
| **武器攻击** | 服务器验证攻击范围、冷却时间 | P1 |
| **拾取物品** | 服务器验证拾取距离 | P1 |
| **Boss/精英生成** | 服务器控制生成时机和位置 | P1 |

### 6.3 通信安全

- **传输层**：WSS (WebSocket over TLS)，加密所有通信
- **应用层**：
  - 会话 Token 认证（JWT，短有效期 + 刷新机制）
  - 消息序列号（防重放攻击）
  - 速率限制（每秒最大消息数）

### 6.4 速率限制与异常检测

```javascript
// 服务器端：移动速率检查
function validateMovement(player, newPos, dt) {
  const maxSpeed = CFG.PLAYER_SPEED * 1.2; // 20% 容差
  const dx = newPos.x - player.x;
  const dy = newPos.y - player.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const maxDist = maxSpeed * dt;

  if (distance > maxDist) {
    // 可能作弊：速度过快
    return { valid: false, corrected: { x: player.x, y: player.y } };
  }
  return { valid: true };
}
```

### 6.5 数据包完整性

- 使用序列号检测丢包和乱序
- 关键操作（升级、购买）使用确认-应答机制
- 服务器检测到异常行为时记录日志并逐步惩罚（警告 → 限制 → 封禁）

### 6.6 防作弊策略分层

```
第1层：服务器验证（所有关键操作）
第2层：速率限制 + 异常检测（统计模型）
第3层：行为分析（检测异常模式，如完美回避、异常击杀率）
第4层：社区举报 + 人工审核
```

---

## 7. 联机实施路线图

### 7.1 对当前项目的影响分析

#### 前端代码改造需求

| 模块 | 改造内容 | 工作量 |
|------|---------|--------|
| **game.js** | 抽取游戏状态管理为可序列化接口，分离本地/远程状态 | 大 |
| **Player.js** | 拆分为 LocalPlayer（含输入处理）和 RemotePlayer（仅渲染+插值） | 中 |
| **enemy.js** | 客户端侧敌人由服务器状态驱动，不做本地 AI 计算 | 中 |
| **weapons/** | 武器逻辑需要双端运行：客户端预测 + 服务器权威 | 大 |
| **spawner.js** | 敌人生成逻辑移至服务器端 | 中 |
| **input.js** | 输入系统需要增加"发送到服务器"通道 | 小 |
| **camera.js** | 摄像机需要支持跟随本地玩家和观战模式 | 小 |
| **scenes.js** | 新增大厅/房间/匹配 UI 场景 | 中 |
| **save.js** | 扩展为服务器端存档 + 本地缓存 | 中 |

#### 游戏逻辑抽象需求

1. **状态序列化**：所有游戏状态需要可序列化为可传输格式
2. **输入/输出分离**：将玩家输入（移动方向、操作命令）与游戏逻辑解耦
3. **确定性随机**：随机种子由服务器分发，确保所有客户端生成相同结果
4. **时间同步**：客户端与服务器时间对齐（NTP-like 机制）

#### 当前 ES Module 架构的兼容性

**优势**：
- ES Module 天然支持代码拆分，可以分离单机/联机模块
- 模块化结构便于替换渲染层、输入层
- `CFG` 常量系统便于服务器/客户端共享配置

**需要调整**：
- `window.game` 全局状态需要封装为可同步的状态对象
- 回调模式（`p.onSFX`、`p.onScreenShake`）需要改为事件系统
- 实体数组管理需要增加序列化/反序列化接口

### 7.2 建议的代码架构重构

```
src/
  shared/              ← 新增：服务器/客户端共享
    config.js          ← 从 core/config.js 移动
    constants.js       ← 新增：协议常量、消息类型
    types.js           ← 新增：类型定义
  core/
    state.js           ← 新增：可序列化状态管理
    network.js         ← 新增：网络连接管理
    sync.js            ← 新增：状态同步逻辑（插值/预测）
  entities/
    Player.js          → 拆分为 LocalPlayer + RemotePlayer
    enemy.js           → 改为服务器状态驱动
  network/             ← 新增：网络模块
    client.js          ← 客户端网络层
    protocol.js        ← 消息协议定义
    prediction.js      ← 客户端预测 + 和解
```

---

## 技术选型推荐

| 决策项 | 推荐方案 | 理由 | 备选方案 |
|--------|----------|------|----------|
| **网络同步** | 半授权状态同步 | 适合大量实体、防作弊、JS 无需确定性 | 完全授权状态同步 |
| **传输协议** | WebSocket (ws) | 成熟稳定、全浏览器支持、开发成本低 | WebTransport (长期) |
| **序列化** | JSON (MVP) → MessagePack (优化) | 开发效率优先，逐步优化 | 自定义二进制协议 |
| **服务器框架** | Node.js + ws | 团队 JS 技能栈、轻量灵活 | Colyseus (快速搭建) |
| **数据库** | Redis + PostgreSQL | Redis 做实时状态/队列，PG 做持久化 | SQLite (MVP 阶段) |
| **部署** | Docker + Fly.io | 边缘部署、自动扩缩、免费额度充足 | Docker + 阿里云 (国内) |
| **授权模型** | 半授权服务器 | 平衡延迟与防作弊 | 完全授权 (更安全) |
| **匹配系统** | Redis 队列 | 简单高效 | Nakama (功能全面) |
| **房间模型** | Dedicated Server | 稳定公平、防作弊 | Listen Server (低成本) |
| **防作弊** | 服务器验证关键操作 | 实现简单、效果好 | 行为分析 + 机器学习 (长期) |

---

## 分阶段实施计划

### Phase 1：基础联机 MVP（预计 4-6 周）

**目标**：2 人可以在同一房间实时游戏

**前端改造**：
1. 抽取游戏状态为可序列化接口（`state.js`）
2. 实现网络客户端模块（`network/client.js`）
3. 拆分 Player 为 LocalPlayer / RemotePlayer
4. 新增简单房间 UI（创建/加入/房间号）

**服务器搭建**：
1. Node.js + ws 搭建基础服务器
2. 房间管理（创建/加入/销毁）
3. 玩家位置同步（广播）
4. 基础游戏循环（服务器端敌人生成 + 位置同步）

**网络协议**：
- WebSocket + JSON
- 消息类型：`join`、`input`、`state`、`leave`

**里程碑**：2 名玩家可以在同一地图看到对方并各自移动，敌人同步可见。

### Phase 2：完善体验（预计 6-8 周）

**目标**：完整的多人协作游戏体验

**功能完善**：
1. 客户端预测 + 服务器和解（移动预测）
2. 插值系统（远程玩家和敌人平滑移动）
3. 伤害计算服务器验证
4. 经验/升级系统服务器验证
5. 武器攻击服务器验证
6. 断线重连机制
7. 房间聊天
8. 大厅/匹配界面

**性能优化**：
1. JSON → MessagePack 二进制序列化
2. Delta Compression 增量状态更新
3. 服务器端区域划分（只同步视野内的实体）

**里程碑**：4 人可以完整进行一局联机游戏，包括武器升级、Boss 战、胜负结算。

### Phase 3：规模化（预计 8-12 周）

**目标**：支持数百在线玩家、多区域部署

**基础设施**：
1. Docker 容器化 + Kubernetes 编排
2. Redis 集群（匹配队列 + 会话状态）
3. PostgreSQL（用户系统 + 排行榜 + 历史记录）
4. JWT 认证系统
5. 用户注册/登录

**匹配系统**：
1. 基于技能的匹配（ELO 评分）
2. 房间列表/过滤
3. 好友邀请码

**防作弊加强**：
1. 速率限制与异常检测
2. 行为分析基线
3. 举报系统

**部署优化**：
1. 多区域部署（国内/亚太/欧美）
2. 自动扩缩容
3. 监控告警（Prometheus + Grafana）

**里程碑**：游戏可以稳定支持数百在线玩家，具备完整的大厅/匹配/排行系统。

---

## 附录：参考来源

### 网络同步
- [Gabriel Gambetta — Fast-Paced Multiplayer 系列文章](https://www.gabrielgambetta.com/client-side-prediction-server-reconciliation.html)
- [Coherence.io — Building Vampire Survivors Online Multiplayer Co-Op](https://coherence.io/blog/tradecraft/vampire-survivors-online-coop-case-study)
- [Unity DOTS Multiplayer Vampire Survivors 原型](https://www.reddit.com/r/unity/comments/1qoh13k/we_built_a_multiplayer_vampire_survivorsstyle/)

### 网络协议
- [WebRTC vs WebSockets for Multiplayer Games (Rune Blog)](https://developers.rune.ai/blog/webrtc-vs-websockets-for-multiplayer-games)
- [DataChannel vs WebTransport vs WebSockets 对比](https://medium.com/@justin.edgewoods/datachannel-vs-webtransport-vs-websockets-when-to-use-each-63bb932821e5)
- [WebTransport API — MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/API/WebTransport_API)
- [WebTransport IETF Draft (draft-09)](https://datatracker.ietf.org/doc/draft-ietf-webtrans-overview/09/)
- [Evaluating Browser-Based Networking for Real-Time Multiplayer Games (NSDI 2025)](https://aaron.gember-jacobson.com/docs/nsdi2025browser-networking.pdf)

### 服务器框架
- [Colyseus 官方文档](https://docs.colyseus.io/learn)
- [Geckos.io — HTML5 Multiplayer Games over UDP](https://geckos.io/)
- [Socket.IO 官方站点](https://socket.io/)
- [Nakama by Heroic Labs](https://heroiclabs.com/)

### 序列化
- [FlatBuffers vs Protobuf vs MessagePack Benchmark](https://medium.com/@the_atomic_architect/your-api-isnt-slow-your-payload-is-protobuf-vs-messagepack-vs-cbor-vs-flatbuffers-benchmarked-ca6d0193477c)
- [FlatBuffers 官方基准测试](https://flatbuffers.dev/benchmarks/)

### 架构模式
- [Design a Simple Real-Time Matchmaking Service](https://yashh21.medium.com/designing-a-simple-real-time-matchmaking-service-architecture-implementation-96e10f095ce1)
- [How to Build Matchmaking Systems with Redis](https://oneuptime.com/blog/post/2026-01-21-redis-matchmaking-systems/view)
- [AccelByte — Game Matchmaking Architecture: Scaling to One Million Players](https://accelbyte.io/blog/scaling-matchmaking-to-one-million-players)
- [Game Server Architecture Basics](https://techtidesolutions.com/blog/game-server-architecture-basics/)

### 部署
- [Scaling Dedicated Game Servers with Kubernetes (Game Developer)](https://www.gamedeveloper.com/programming/scaling-dedicated-game-servers-with-kubernetes-part-1-containerising-and-deploying)
- [Agones — Kubernetes Game Server Scaling (CNCF)](https://agones.dev/)
- [Docker and Kubernetes Deployment for Game Server Hosting](https://www.varidata.com/blog-en/docker-and-kubernetes-deployment-for-game-server-hosting/)

### 防作弊
- [Securing Game Code in 2025: Modern Anti-Cheat Techniques](https://medium.com/@lzysoul/securing-game-code-in-2025-modern-anti-cheat-techniques-and-best-practices-e2e0f6f14173)
- [A Systematic Review of Technical Defenses Against Software Cheating (arXiv)](https://arxiv.org/html/2512.21377v1)
- [How to Secure Online Games in 2025 (Genieee)](https://genieee.com/blogs/securing-online-games/)
- [Creating an Anti-Cheat in an Online Web Game (StackOverflow)](https://stackoverflow.com/questions/70203830/creating-an-anti-cheat-in-an-online-web-game)

---

## 附录 B: 无尽模式联机适配分析 (Drive #24, 2026-04-06)

### B.1 概述

无尽模式（Endless Mode）是 v1.7.0 前端新增的游戏模式，取消了5分钟时间限制，引入Boss周期生成、动态敌群上限（100个）、出兵节奏持续加速等机制。本节分析无尽模式对联机架构的影响。

### B.2 快照带宽分析

| 场景 | 敌人数 | 快照大小(10Hz) | 下行带宽 | 是否在预算内 |
|------|--------|--------------|---------|------------|
| 标准模式(5min) | 30-70 | ~6-7KB | ~60-70KB/s | 是 |
| 无尽模式(10min) | 70-90 | ~10-14KB | ~100-140KB/s | **超预算** |
| 无尽模式(20min+) | 100(上限) | ~16KB | ~160KB/s | **严重超预算** |

预算基准：Drive #11 估算下行 50KB/s（移动网络友好）。

### B.3 带宽优化方案：视野范围裁剪

**原理**：只同步玩家摄像机视野范围内（加缓冲区）的实体。

```
视野范围：屏幕宽高 + 200px 缓冲区（约 800x600 + 200 = 1000x800 逻辑像素）
地图大小：2400x2400

同步比例 = 视野面积 / 地图面积 = (1000*800) / (2400*2400) = 13.9%
即：100个敌人中平均只有 ~14 个需要同步
```

**实际效果估算**：

| 场景 | 同步敌人数 | 快照大小 | 下行带宽 |
|------|-----------|---------|---------|
| 无尽后期(100敌人) + 视野裁剪 | ~15-25 | ~4-6KB | ~40-60KB/s |

视野裁剪将无尽后期带宽从 160KB/s 降至 ~50KB/s，回到预算范围内。

**实现要点**：

```typescript
// 服务器端：视野范围过滤
function filterByViewport(entities: Entity[], playerPos: Position, viewportW: number, viewportH: number, buffer: number = 200): Entity[] {
  const halfW = (viewportW / 2) + buffer;
  const halfH = (viewportH / 2) + buffer;
  return entities.filter(e =>
    Math.abs(e.x - playerPos.x) < halfW &&
    Math.abs(e.y - playerPos.y) < halfH
  );
}
```

注意事项：
- 多人联机时，服务器对每个客户端发送不同的裁剪后快照（基于各自的玩家位置）
- Boss 由于体型大且重要，应始终同步（即使不在视野内）
- 宝石/食物/宝箱等拾取物同样裁剪

### B.4 无尽模式房间生命周期

```
LOBBY
  |
  v
PLAYING (无尽模式)
  |
  +-- 所有玩家死亡 -> RESULT
  +-- 达到60分钟硬上限 -> 强制RESULT
  +-- 最后玩家断线 -> 30s倒计时 -> 销毁
  |
  +-- 每60s: 保存checkpoint (用于断线重连)
  v
RESULT (显示无尽统计: 存活时间/击杀/Boss击杀)
  |
  v
销毁房间
```

checkpoint 数据结构：

```typescript
interface EndlessCheckpoint {
  elapsed: number;          // 服务器时间（秒）
  bossCycleIndex: number;
  bossKillCount: number;
  players: PlayerSnap[];    // 所有玩家快照
  enemyCount: number;       // 用于恢复参考
  difficultyScale: {        // 当前难度缩放因子
    enemyHpMul: number;
    enemySpdMul: number;
    bossHpMul: number;
  };
  spawnRate: {              // 当前出兵参数
    interval: number;
    count: number;
  };
}
```

### B.5 断线重连策略

无尽模式断线重连比标准模式更复杂：

| 阶段 | 标准模式 | 无尽模式 |
|------|---------|---------|
| 重连窗口 | 30s | 30s（不变） |
| 状态恢复 | 最新快照即可 | 需完整快照（100敌人可能很大） |
| 数据量 | ~7KB | ~15KB |
| 传输时间 | <1s | <1s（30s窗口内充裕） |

重连流程：

1. 客户端发送 `reconnect` + `roomId` + `playerId`
2. 服务器验证房间存在且玩家属于该房间
3. 服务器发送当前完整快照（含所有敌人/子弹/掉落物）
4. 客户端调用 `applySnapshot()` 完整还原
5. 恢复正常10Hz增量快照

关键差异：无尽模式的完整快照约15KB，但30s窗口（300KB可传输量）内绰绰有余。

### B.6 服务器端 spawner 驱动

无尽模式的 spawner 需要 100% 由服务器驱动，原因：

1. 敌人数量大（100个），客户端本地生成会导致不同步
2. 出兵位置使用 Math.random()，需要服务器端统一随机源
3. 难度缩放公式（指数增长）需服务器端权威计算

服务器端 spawner 实现（复用前端代码）：

```typescript
// 服务器端 import 前端 spawner.js
import { getSpawnRate } from '../src/systems/spawner.js';

function serverSpawn(gameState: ServerGameState, dt: number) {
  const rate = getSpawnRate(gameState.elapsed, gameState.endless);
  gameState.spawnTimer -= dt;
  if (gameState.spawnTimer <= 0 && gameState.enemies.length < getMaxEnemies(gameState.elapsed, gameState.endless)) {
    gameState.spawnTimer = rate.interval * CFG.DIFFICULTY[gameState.difficulty].spawnIntervalMul;
    // 使用服务器端随机源生成敌人
    for (let i = 0; i < rate.count; i++) {
      const enemy = createEnemy(rate.types, gameState);
      gameState.enemies.push(enemy);
      gameState.events.push({ type: 'enemy_spawn', enemy: enemyToSnap(enemy) });
    }
  }
}
```

### B.7 技术选型影响

无尽模式对 Drive #12 确定的技术选型无影响：

| 选型项 | 原决策 | 无尽模式影响 | 结论 |
|--------|--------|------------|------|
| 同步模式 | 半授权状态同步 | 无变化 | 维持 |
| 传输协议 | WebSocket (ws) | 无变化（带宽可通过视野裁剪控制） | 维持 |
| 序列化 | JSON (MVP) | 无变化（优化后仍可考虑二进制） | 维持 |
| 服务器框架 | Node.js + ws | 无变化 | 维持 |
| 部署 | Docker + Fly.io | 需考虑长时间运行容器的内存管理 | 维持，增加60分钟硬上限 |

### B.8 决策记录

- 无尽模式不改变技术栈选型，但要求视野裁剪作为联机 MVP 的必要优化
- 60分钟房间硬上限是资源管理的关键保障
- 断线重连使用完整快照而非 checkpoint 差量，因为 15KB 在 30s 窗口内传输无压力
- 存档验证延后至全球排行榜阶段
