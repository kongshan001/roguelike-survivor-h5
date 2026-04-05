# 网络协议详细规格书

> 版本: 1.0 | 日期: 2026-04-04 | 状态: 设计完成待评审
> 前置依赖: `multiplayer-architecture-design.md`

## 1. 设计目标

本文档细化联机架构规格书中的网络协议部分，定义完整的前后端通信接口，使前端和后端可独立开发并对接。

**设计原则**：
- 消息类型最小化，MVP 只定义必需消息
- 所有消息使用 JSON 格式（MVP 阶段）
- 服务器端无状态消息处理（每条消息独立可解析）
- 客户端序列号递增，服务器可检测丢包/乱序

---

## 2. 连接生命周期

```
客户端                              服务器
  │                                   │
  │──── WebSocket 握手 ──────────────→│
  │                                   │
  │──── join ────────────────────────→│  加入/创建房间
  │←─── room_info ───────────────────│  返回房间状态
  │                                   │
  │──── ready ───────────────────────→│  准备就绪
  │←─── player_ready ────────────────│  广播某人准备
  │                                   │
  │←─── countdown ───────────────────│  3秒倒计时
  │←─── game_start ──────────────────│  游戏开始
  │                                   │
  │──── input ───────────────────────→│  每帧输入（~60Hz）
  │←─── snapshot ────────────────────│  状态快照（10Hz）
  │  ...  持续交换 ...                │
  │                                   │
  │←─── game_over ───────────────────│  游戏结束
  │                                   │
  │──── leave ───────────────────────→│  离开房间
  │──── WebSocket 关闭 ─────────────→│
```

---

## 3. 消息格式规范

### 3.1 通用包装

所有消息遵循统一格式：

```typescript
interface NetMsg {
  type: string;       // 消息类型标识
  seq: number;        // 序列号（客户端发送时递增，服务器原样返回）
  ts: number;         // 发送方时间戳（ms，performance.now() 或 Date.now()）
  data: object;       // 消息载荷
}
```

**序列号规则**：
- 客户端维护本地递增计数器 `_seq`，每发送一条消息 +1
- 服务器响应时可引用客户端序列号（用于 ack）
- 服务器广播的 snapshot 自身携带 `_serverSeq`，客户端用于检测跳帧

### 3.2 消息类型总表

| 方向 | type | 频率 | 说明 |
|------|------|------|------|
| C→S | `join` | 一次性 | 加入/创建房间 |
| C→S | `ready` | 一次性 | 准备就绪 |
| C→S | `input` | ~60Hz | 玩家输入 |
| C→S | `upgrade_pick` | 按需 | 升级选择 |
| C→S | `pause` | 按需 | 暂停请求 |
| C→S | `ping` | 1Hz | 延迟测量 |
| C→S | `leave` | 一次性 | 主动离开 |
| S→C | `room_info` | 事件 | 房间状态更新 |
| S→C | `player_ready` | 事件 | 某人准备 |
| S→C | `countdown` | 事件 | 倒计时通知 |
| S→C | `game_start` | 一次性 | 游戏开始 |
| S→C | `snapshot` | 10Hz | 游戏状态快照 |
| S→C | `game_over` | 一次性 | 游戏结束 |
| S→C | `disconnect` | 事件 | 某人断线 |
| S→C | `reconnect` | 事件 | 某人重连 |
| S→C | `error` | 事件 | 错误通知 |
| S→C | `pong` | 1Hz | 延迟回复 |

---

## 4. 客户端→服务器消息定义

### 4.1 join — 加入/创建房间

```typescript
{
  type: "join",
  seq: 1,
  ts: 1712200000000,
  data: {
    roomId?: string,    // 空 = 创建新房间，有值 = 加入指定房间
    playerName: string, // 玩家昵称
    charId: string,     // 角色ID（保留，MVP 固定值）
  }
}
```

**服务器处理**：
- `roomId` 为空：创建新房间，生成 6 位房间号
- `roomId` 有值：查找房间，检查是否可加入（未满 + 未在游戏中）
- 成功：回复 `room_info`
- 失败：回复 `error`（code: ROOM_NOT_FOUND / ROOM_FULL / ROOM_IN_PROGRESS）

### 4.2 ready — 准备就绪

```typescript
{
  type: "ready",
  seq: 5,
  ts: 1712200001000,
  data: {
    weaponName: string  // 初始武器选择
  }
}
```

**服务器处理**：
- 标记该玩家为 ready
- 广播 `player_ready` 给房间内所有人
- 检查是否所有人已准备 → 是则广播 `countdown`

### 4.3 input — 玩家输入（核心高频消息）

```typescript
{
  type: "input",
  seq: 120,
  ts: 1712200002500,
  data: {
    dx: number,         // 移动方向 X（-1, 0, 1 或归一化向量）
    dy: number,         // 移动方向 Y
    dash: boolean,      // 是否冲刺
    facing: number,     // 朝向角度（弧度）
  }
}
```

**发送策略**：
- 客户端每帧（~16ms）发送一次，约 60Hz
- 如果输入未变化（dx=0, dy=0, dash=false），可跳过发送以节省带宽
- 服务器收到后更新玩家输入缓冲区，在游戏循环 tick 中消费

**带宽估算**：
- JSON 格式: ~80-120 bytes/条
- 60条/秒 * 100B = ~6 KB/s 上行（可接受）
- 优化：仅在有输入变化时发送，平均约 2-3 KB/s

**服务器验证**：
- 检查 `dx, dy` 归一化：`Math.sqrt(dx*dx + dy*dy) <= 1.0 + 0.01`
- 检查 `facing` 范围：`0 <= facing < 2 * Math.PI`
- 检查 `dash` 冷却（根据上次 dash 时间 + CFG.DASH_CD）

### 4.4 upgrade_pick — 升级选择

```typescript
{
  type: "upgrade_pick",
  seq: 300,
  ts: 1712200050000,
  data: {
    choiceIdx: number   // 选择的升级选项索引（0-2）
  }
}
```

**服务器处理**：
- 验证 choiceIdx 在服务器当前提供的选项范围内
- 应用升级（武器升级 / 新武器 / 被动道具）
- 后续 snapshot 中体现升级后的状态

### 4.5 ping — 延迟测量

```typescript
{
  type: "ping",
  seq: 500,
  ts: 1712200003000,
  data: {}  // 空，服务器原样返回 ts
}
```

客户端计算 RTT：`rtt = Date.now() - pong.ts`

---

## 5. 服务器→客户端消息定义

### 5.1 room_info — 房间信息

```typescript
{
  type: "room_info",
  seq: 0,
  ts: 1712200000050,
  data: {
    roomId: string,
    state: "LOBBY" | "PLAYING" | "RESULT",
    players: [
      {
        id: string,          // 服务器分配的玩家唯一ID
        name: string,
        charId: string,
        ready: boolean,
        isHost: boolean,
        connected: boolean,
      }
    ],
    maxPlayers: number,     // 默认 4
    hostId: string,
  }
}
```

### 5.2 game_start — 游戏开始

```typescript
{
  type: "game_start",
  seq: 0,
  ts: 1712200004000,
  data: {
    seed: number,           // 随机种子（服务器生成，客户端用于确定性随机）
    difficulty: string,     // 难度
    mapSize: number,        // 地图大小（如 2400）
    players: [              // 所有玩家的初始状态
      {
        id: string,
        x: number,          // 出生点
        y: number,
        charId: string,
        weapon: string,     // 初始武器
      }
    ],
    yourId: string,         // 你自己的 ID（区分 LocalPlayer / RemotePlayer）
  }
}
```

**客户端处理**：
- `yourId` 用于创建 `LocalPlayer`（自己）和 `RemotePlayer`（其他人）
- 用 `seed` 初始化本地随机数生成器（用于特效等纯视觉随机）

### 5.3 snapshot — 游戏状态快照（核心高频消息）

```typescript
{
  type: "snapshot",
  seq: 0,
  ts: 1712200004100,            // 服务器时间戳
  data: {
    serverSeq: 41,              // 服务器快照序号（每 100ms +1）
    t: 1000,                    // 游戏经过时间（ms）
    players: PlayerSnap[],      // 所有玩家状态
    enemies: EnemySnap[],       // 可见敌人状态
    bullets: BulletSnap[],      // 活跃子弹
    pickups: PickupSnap[],      // 掉落物（宝石/食物/宝箱）
    events: EventSnap[],        // 本 tick 发生的事件
  }
}

interface PlayerSnap {
  id: string;
  x: number; y: number;        // 整数像素坐标
  hp: number; maxHp: number;
  level: number; exp: number; nextExp: number;
  gold: number;
  weapons: WeaponSnap[];
  passives: Record<string, number>;  // { "speedboots": 2, "armor": 1 }
  facing: number;               // 朝向（弧度，2位小数）
  dashing: boolean;
  combo: number;
  invuln: number;               // 无敌剩余时间 ms
}

interface WeaponSnap {
  name: string;
  level: number;
  timer: number;                // 武器计时器（百分之一秒精度）
}

interface EnemySnap {
  id: string;                   // 唯一 ID（服务器分配）
  type: string;                 // "zombie" | "bat" | "skeleton" | "boss_zombie" | ...
  x: number; y: number;
  hp: number; maxHp: number;
  w: number; h: number;         // 碰撞尺寸
  frozen: number;               // 冰冻剩余 ms
  slow: number;                 // 减速百分比 0-1
  burn: { dmg: number; t: number } | null;  // 燃烧状态
  flash: number;                // 受击闪白剩余 ms
}

interface BulletSnap {
  id: string;                   // 唯一 ID
  x: number; y: number;
  vx: number; vy: number;      // 速度向量
  dmg: number;
  life: number;                 // 剩余生命 ms
  color: string;                // 颜色标识
  owner: string;                // 所属玩家 ID
  pierce: number;               // 穿透次数
  burnDmg?: number;
  burnDur?: number;
}

interface PickupSnap {
  id: string;
  type: "gem" | "food" | "chest";
  x: number; y: number;
  value: number;                // gem: 经验值, food: 恢复量, chest: 无
  age: number;                  // 存在时间 ms（用于超时清理）
  opened?: boolean;             // chest 专用
}

interface EventSnap {
  type: "kill" | "damage" | "heal" | "pickup" | "levelup" | "boss_spawn" | "boss_kill";
  targetId: string;             // 事件目标（玩家/敌人 ID）
  sourceId?: string;            // 事件来源（谁造成的）
  value?: number;               // 数值（伤害量/经验值/恢复量）
  weapon?: string;              // 武器名（击杀/伤害事件）
}
```

**快照大小估算**（典型场景：2人 + 30敌人 + 20子弹 + 15掉落物）：

| 组件 | 数量 | 单条大小 | 小计 |
|------|------|---------|------|
| PlayerSnap x2 | 2 | ~200B | 400B |
| EnemySnap | 30 | ~80B | 2400B |
| BulletSnap | 20 | ~60B | 1200B |
| PickupSnap | 15 | ~40B | 600B |
| EventSnap | 5 | ~50B | 250B |
| 包头 + 其他 | - | - | 150B |
| **总计** | | | **~5KB** |

**优化方向**（后续版本，不在 MVP 中）：
- Delta Compression：仅发送变化部分，预计减少 60-80%
- 字段名缩短：`{ "p": [{ "i":"p1", "x":100 }] }` 减少约 40%
- 切换 MessagePack 二进制：减少约 30%

### 5.4 game_over — 游戏结束

```typescript
{
  type: "game_over",
  seq: 0,
  ts: 1712200300000,
  data: {
    won: boolean,               // 是否击败最终 Boss
    survivalTime: number,       // 生存时间 ms
    players: [
      {
        id: string,
        kills: number,
        damageDealt: number,
        damageTaken: number,
        level: number,
        gold: number,
        survived: boolean,      // 是否存活到最后
      }
    ]
  }
}
```

### 5.5 error — 错误通知

```typescript
{
  type: "error",
  seq: 0,
  ts: 1712200000050,
  data: {
    code: string,               // 错误码
    message: string,            // 人类可读消息
  }
}
```

**错误码定义**：

| code | 说明 | 处理建议 |
|------|------|---------|
| ROOM_NOT_FOUND | 房间不存在 | 提示用户重新输入 |
| ROOM_FULL | 房间已满 | 提示用户换房间 |
| ROOM_IN_PROGRESS | 游戏进行中 | 提示用户换房间 |
| NOT_IN_ROOM | 未加入房间 | 前端检查状态 |
| INVALID_INPUT | 输入验证失败 | 忽略，可能是作弊 |
| RATE_LIMITED | 消息频率过高 | 降低发送频率 |
| KICKED | 被踢出 | 回到主菜单 |
| SERVER_ERROR | 服务器内部错误 | 重试或回主菜单 |

---

## 6. 断线重连设计

### 6.1 机制概述

```
客户端断线 → 服务器保留房间状态 30秒 → 客户端重连 → 补发快照 → 继续游戏
                                    ↓ 30秒超时
                               将玩家标记为离开 → 广播 disconnect
```

### 6.2 断线检测

- 服务器：心跳超时（5秒未收到任何消息 → 标记为断线）
- 客户端：WebSocket `onclose` / `onerror` 事件

### 6.3 重连流程

```typescript
// 客户端重连时发送
{
  type: "join",
  seq: 1,
  ts: 1712200010000,
  data: {
    roomId: "ABC123",           // 之前的房间号
    playerName: "Player1",
    charId: "mage",
    reconnect: true,            // 标记为重连
    playerId: "p_abc123",       // 之前的玩家 ID（客户端本地缓存）
  }
}

// 服务器验证后回复
{
  type: "room_info",
  seq: 0,
  ts: 1712200010050,
  data: {
    roomId: "ABC123",
    state: "PLAYING",
    isReconnect: true,
    // ... 正常 room_info 数据
  }
}

// 紧接着发送完整快照（非增量）
{
  type: "snapshot",
  data: {
    fullSync: true,             // 标记为全量同步（非 delta）
    // ... 完整游戏状态
  }
}
```

### 6.4 客户端重连策略

```typescript
// 指数退避重连
const RECONNECT_DELAYS = [1000, 2000, 4000, 8000, 16000]; // 最多 5 次
// 总计最长等待 31 秒 < 30 秒超时 → 需要调整
// 实际策略：快速重连，固定间隔 2 秒，最多 15 次（共 30 秒）
```

---

## 7. 服务器游戏循环时序

```
服务器 tick = 100ms (10Hz)

0ms    00ms   收集所有客户端 input（过去 100ms 累积）
       10ms   处理移动（应用 input，碰撞检测）
       20ms   处理武器（冷却、生成子弹）
       30ms   处理子弹移动 + 碰撞检测
       40ms   处理敌人 AI + 移动
       50ms   处理碰撞（敌人-玩家，子弹-敌人）
       60ms   处理伤害/死亡/掉落
       70ms   生成新敌人（根据难度曲线）
       80ms   生成快照（序列化完整状态）
       90ms   广播快照给所有客户端
100ms  ─── 下一个 tick ───
```

**关键点**：
- 输入缓冲：客户端 input 到达时间不固定，服务器在 tick 边界统一消费
- 快照一致性：快照在 tick 末尾生成，保证状态已完全更新
- 事件队列：本 tick 发生的事件（击杀、拾取、升级）附在快照中一起发送

---

## 8. 客户端插值策略

### 8.1 远程玩家插值

```
快照到达时间线：
  S0 ──────── S1 ──────── S2 ──────── S3
  t=0        t=100      t=200      t=300

客户端渲染时间线（延迟 100ms）：
              R0 ──────── R1 ──────── R2
              t=100      t=200      t=300

渲染时刻 t=150：
  在 S1(t=100) 和 S2(t=200) 之间线性插值
  alpha = (150 - 100) / (200 - 100) = 0.5
  position = lerp(S1.pos, S2.pos, 0.5)
```

### 8.2 插值缓冲区实现

```typescript
class InterpBuffer {
  private buffer: Snap[] = [];   // 最近 3 个快照
  private renderDelay = 100;     // 渲染延迟 ms

  push(snap: Snap) {
    this.buffer.push(snap);
    if (this.buffer.length > 3) this.buffer.shift();
  }

  getInterpolated(now: number): State | null {
    if (this.buffer.length < 2) return this.buffer[0] || null;

    const renderTime = now - this.renderDelay;
    // 找到 renderTime 前后的两个快照
    let s0 = this.buffer[this.buffer.length - 2];
    let s1 = this.buffer[this.buffer.length - 1];

    if (renderTime >= s1.ts) return s1;  // 外插（无新数据）
    if (renderTime <= s0.ts) return s0;  // 太旧

    const alpha = (renderTime - s0.ts) / (s1.ts - s0.ts);
    return lerp(s0, s1, alpha);
  }
}
```

### 8.3 本地玩家预测

```
1. 客户端发送 input(seq=N)
2. 立即在本地应用 input → LocalPlayer.update(dt, input)
3. 服务器回复 snapshot(seq <= N)
4. 如果服务器确认的位置与本地预测一致 → 继续
5. 如果不一致 → 用服务器位置纠正，重新模拟 seq+1 到当前的所有 input
```

MVP 简化：不做步骤 5 的重模拟，直接用服务器位置覆盖。肉鸽幸存者 PvE 场景下偶发的轻微位置纠正可接受。

---

## 9. 带宽与性能预算

### 9.1 每客户端带宽

| 方向 | 消息类型 | 频率 | 单条大小 | 带宽 |
|------|---------|------|---------|------|
| 上行 | input | 30Hz（有变化时） | ~100B | ~3 KB/s |
| 上行 | ping | 1Hz | ~50B | ~0.05 KB/s |
| 下行 | snapshot | 10Hz | ~5KB | ~50 KB/s |
| 下行 | 其他 | 偶发 | ~200B | ~0.1 KB/s |
| **上行合计** | | | | **~3 KB/s** |
| **下行合计** | | | | **~50 KB/s** |

### 9.2 服务器带宽（4 人房间）

| 指标 | 值 |
|------|-----|
| 上行总带宽 | 4 * 3 = 12 KB/s |
| 下行总带宽 | 4 * 50 = 200 KB/s |
| 每房间总计 | ~212 KB/s |
| 50 房间并发 | ~10 MB/s |
| Fly.io 免费额度 | 160 GB/月 |
| 免费额度支撑 | ~160GB / 212KB = ~208 小时（单房间持续运行） |

**结论**：MVP 阶段带宽充裕，4 人房间 50KB/s 下行完全在移动网络可接受范围内。

---

## 10. 协议版本与兼容性

### 10.1 版本号

```typescript
// 客户端连接时通过 URL 参数传递版本
ws://server.com/game?v=1&roomId=ABC123
```

- 服务器检查客户端版本，不匹配则拒绝连接
- MVP 版本号: `v=1`

### 10.2 后向兼容策略

- 新增字段：客户端忽略未知字段，服务器用默认值填充缺失字段
- 新增消息类型：旧客户端忽略未知 type
- 删除字段：先标记为 deprecated，下个版本移除

---

## 11. 决策记录

| 决策 | 选择 | 理由 | 备选 |
|------|------|------|------|
| 序列化格式 | JSON | MVP 可读性优先 | MessagePack |
| input 发送频率 | ~30Hz（有变化时） | 平衡响应性和带宽 | 60Hz / 10Hz |
| snapshot 频率 | 10Hz | PvE 够用 | 20Hz |
| 渲染延迟 | 100ms | 插值平滑所需 | 50ms / 200ms |
| 断线重连超时 | 30秒 | 短局游戏不宜太长 | 60秒 |
| 重连策略 | 固定 2s 间隔 | 简单可靠 | 指数退避 |
| 客户端预测 | 位置覆盖（MVP） | 简化实现 | 重模拟 |
| 错误码 | 字符串枚举 | 可读性 | 数字码 |
| 版本检查 | URL 参数 | 简单直接 | 握手消息 |
