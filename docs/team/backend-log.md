# 后端程序工作记录 (Backend Agent Log)

> Agent: `backend` | 触发: 联机、后端、服务器、网络、同步、multiplayer

---

## 当前优先级

| 优先级 | 事项 | 状态 |
|--------|------|------|
| P0 | 联机技术调研报告（网络同步/协议/服务器/部署） | ✅ 已完成 |
| P1 | 联机架构设计规格书（半授权状态同步 + WebSocket + Node.js） | 待启动 |
| P1 | Player 拆分方案设计（LocalPlayer / RemotePlayer 接口抽象） | 🔨 设计完成待评审 |
| P1 | 可序列化状态接口设计（游戏状态快照格式） | 待启动 |
| P2 | 服务器 MVP 原型（2人同房间联机） | 待评估 |
| P2 | Docker 容器化部署方案 | 待评估 |

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
