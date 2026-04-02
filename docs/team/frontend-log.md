# 前端程序工作记录 (Frontend Agent Log)

> Agent: `frontend` | 触发: 实现、代码、渲染、性能、bug修复、功能

---

## 当前优先级

| 优先级 | 事项 | 状态 |
|--------|------|------|
| P0 | 圣水伤害倍率调整（Lv1 几乎杀不死怪） | 待启动 |
| P1 | 对象池优化（子弹/宝石复用，减少GC） | 待启动 |
| P1 | 音效系统（Web Audio API，8bit风格） | 规划中 |
| P2 | localStorage 存档（最高分记录） | 待评估 |
| P2 | PWA 离线支持（Service Worker缓存） | 待评估 |

---

## 2026-04-03 — v0.3.0 Bug修复与特效

### 成果
- **[BUG FIX] 宝石收集系统重写**
  - 根因：玩家移动后宝石超出 pickupRange 永远无法收集
  - 方案：所有宝石始终向玩家漂移（40~250px/s），近距离加速吸入
- **[BUG FIX] DPR渲染偏移**
  - 根因：`Camera.w2s()` 返回物理像素，DPR transform 导致双重缩放
  - 方案：`w2s()` 改为返回逻辑像素，移除所有 `/dpr` 除法
- **[FEATURE] 受伤反馈**：红屏闪烁 0.3s + 敌人死亡💀漂浮文字
- **[PERF] 地面渲染**：~2000 draw calls → ~3（单次fillRect + 网格线）

### 技术债务
- Lightning 每帧重建锯齿线段，大量 `Math.random()` 调用
- `enemies.splice()` O(n) 删除，敌人多时有性能隐患
- `showUpgrade` 直接操作 DOM，未与游戏状态解耦

---

## 2026-04-03 — v0.2.0 数值调参

### 成果
- 响应QA反馈调整 CONFIG 常量（HP/速度/冷却/生成间隔），纯数值修改无结构变更

---

## 2026-04-02 — v0.1.0 初始实现

### 成果
- Canvas 2D 游戏引擎（~800行 JS）
  - `requestAnimationFrame` 主循环，dt上限50ms防跳帧
  - 相机 lerp 0.1 平滑跟随，网格地面+地图边界
  - AABB矩形碰撞检测，无敌帧闪烁
- 4种武器：HolyWater(角度旋转)/Knife(CD发射)/Lightning(定时选取)/Bible(范围检测)
- 4种敌人AI：僵尸(追踪)/蝙蝠(快速)/骷髅(距离保持+射击)/Boss(双阶段)
- HTML覆盖层UI：HUD/摇杆/升级面板/场景切换
- 移动端适配：DPR缩放 + touch-action:none + 虚拟摇杆
- 小地图：独立60×60 Canvas

### 架构
```
index.html
├── <style>      — 全局CSS + UI组件
├── <canvas#c>   — 游戏画布
├── <div#ui>     — HTML覆盖层
└── <script>     — CFG → V → Camera → Input → Player → Enemy → Gem → Weapons → Upgrade → Spawner → UI → Scenes → Game Loop
```
