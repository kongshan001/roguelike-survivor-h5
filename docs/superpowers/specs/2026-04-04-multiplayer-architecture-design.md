# 联机架构设计规格书

> 版本: 1.0 | 日期: 2026-04-04 | 状态: 设计完成待评审

## 1. 架构概览

**模式**: 半授权状态同步 (Semi-Authoritative State Sync)

```
Client A ←→ WebSocket Server ←→ Client B
  │              │                │
  ├─ LocalInput  ├─ Authority     ├─ LocalInput
  ├─ Prediction  ├─ Validation    ├─ Prediction
  └─ Rendering   └─ Broadcasting  └─ Rendering
```

**核心原则**:
- 服务器验证关键逻辑（伤害、死亡、升级），客户端本地预测
- 100ms 同步间隔，PvE 游戏可接受
- 2-4 人同房间，房间内敌人共享

## 2. 服务器技术栈

| 组件 | 技术选型 | 理由 |
|------|---------|------|
| 运行时 | Node.js 20+ | 与前端共享 JS 技能栈 |
| WebSocket | ws (npm) | 成熟稳定，全浏览器支持 |
| 状态管理 | 内存 + 定时快照 | 2-4人房间无需数据库 |
| 部署 | Docker + Fly.io | 边缘节点，WebSocket 友好 |
| 序列化 | JSON（MVP）→ 自定义二进制（优化） | MVP 用 JSON，后期优化 |

## 3. 网络协议

### 3.1 消息格式

```typescript
// 通用消息包装
interface NetMsg {
  type: string;      // 消息类型
  seq: number;       // 序列号（客户端递增）
  t: number;         // 客户端时间戳 ms
  data: any;         // 载荷
}
```

### 3.2 客户端→服务器消息

| type | 频率 | data | 说明 |
|------|------|------|------|
| `input` | 每帧 | `{ dx, dy, dash, facing }` | 玩家输入 |
| `ready` | 一次性 | `{ charId, weaponName }` | 准备就绪 |
| `upgrade_pick` | 按需 | `{ choiceIdx }` | 升级选择 |
| `pause` | 按需 | `{ paused: bool }` | 暂停状态 |

### 3.3 服务器→客户端消息

| type | 频率 | data | 说明 |
|------|------|------|------|
| `snapshot` | 10Hz | `ServerSnapshot` | 游戏状态快照 |
| `room_info` | 一次性 | `{ roomId, players[] }` | 房间信息 |
| `game_start` | 一次性 | `{ seed, difficulty }` | 游戏开始 |
| `game_over` | 一次性 | `{ won, stats }` | 游戏结束 |

### 3.4 快照格式（~1.5KB）

```typescript
interface ServerSnapshot {
  t: number;              // elapsed ms
  players: PlayerState[];
  enemies: EnemyState[];  // 仅屏幕范围内
  events: GameEvent[];    // 事件队列
}

interface PlayerState {
  id: string;
  x: number; y: number;
  hp: number; maxHp: number;
  level: number; gold: number;
  weapons: string[];       // 武器名列表
  passives: Record<string, number>;
  combo: number;
  dashing: boolean;
}

interface EnemyState {
  id: string; type: string;
  x: number; y: number;
  hp: number; maxHp: number;
  frozen: number; slow: number;
}

interface GameEvent {
  type: 'kill' | 'damage' | 'pickup' | 'levelup';
  target: string;          // 玩家/敌人 ID
  value?: number;
}
```

## 4. 前端改造方案

### 4.1 Player 拆分

```
PlayerBase (abstract)
├── x, y, w, h, hp, maxHp
├── weapons[], passives{}
├── draw(ctx, cam, canvas)
└── serialize() → PlayerState

LocalPlayer extends PlayerBase
├── input handling (WASD/摇杆)
├── dash(), takeDamage()
├── update(dt, input)      // 本地物理
└── _predictedState        // 客户端预测

RemotePlayer extends PlayerBase
├── _targetState           // 从快照插值
├── _interpBuffer[]        // 最近3个快照
├── update(dt)             // 插值更新
└── draw(ctx, cam, canvas) // 不同颜色标识
```

### 4.2 game.js 改造

```javascript
// Before: 单人
window.game.player = new Player(charId);

// After: 多人
window.game.players = [
  new LocalPlayer(charId),   // 自己
  new RemotePlayer(p2data),  // 其他玩家
];
```

**关键改动**:
1. `window.game.player` → `window.game.localPlayer` + `window.game.remotePlayers[]`
2. 敌人碰撞/武器目标遍历 `players[]`
3. Camera 支持多目标（取所有玩家包围盒中心）
4. HUD 每个玩家独立绘制

### 4.3 同步流程

```
帧 N:
1. LocalPlayer.update(dt, input)    // 本地预测
2. 发送 input 到服务器               // 含 seq=N
3. 接收 snapshot (可能是 N-2 的)     // 服务器确认
4. 对比预测 vs 快照                  // 一致则继续
5. 如有差异：修正 RemotePlayer 位置   // 插值平滑
```

## 5. 房间系统

```
状态机: LOBBY → PLAYING → RESULT

LOBBY:
- 房主创建房间 → 获得 roomId
- 其他玩家输入 roomId 加入
- 所有人点击准备 → 倒计时3秒 → PLAYING

PLAYING:
- 服务器运行 Authoritative 游戏循环
- 管理敌人生成（所有玩家共享敌人池）
- 验证伤害/击杀/升级
- 广播快照 10Hz

RESULT:
- Boss 击杀 或 5分钟结束 → RESULT
- 显示每个人的统计 → 返回 LOBBY
```

## 6. 实现路线图

| 阶段 | 内容 | 预估代码量 |
|------|------|-----------|
| Phase 1 | Player 拆分 + 序列化接口 | ~300行 |
| Phase 2 | WebSocket 服务器 MVP（房间+握手） | ~500行 |
| Phase 3 | 状态同步 + 远程玩家渲染 | ~400行 |
| Phase 4 | 伤害验证 + 防作弊基础 | ~200行 |
| **总计** | | **~1400行** |

## 7. 风险评估

| 风险 | 概率 | 影响 | 缓解 |
|------|------|------|------|
| JS 浮点不确定性 | 高 | 中 | 服务器端 Math.round() 容差 |
| 网络抖动 | 中 | 低 | 插值缓冲区（3帧）平滑 |
| game.js 重构回归 | 中 | 高 | E2E 测试覆盖 |
| 移动端 WS 兼容 | 低 | 高 | 所有现代浏览器支持 WebSocket |

## 8. 决策记录

- **为什么半授权而非帧同步**: JS 浮点运算不可确定性，帧同步需要确定性模拟
- **为什么 10Hz 而非 60Hz**: PvE 不需要精确同步，10Hz 够用且带宽低
- **为什么 ws 而非 Colyseus**: 联机需求简单（2-4人），自建更灵活
- **为什么 JSON 而非二进制**: MVP 阶段优先可读性，后期再优化
- **为什么 Fly.io**: 全球边缘节点 + WebSocket 支持 + 免费额度够 MVP
