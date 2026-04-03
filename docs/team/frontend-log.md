# 前端程序工作记录 (Frontend Agent Log)

> Agent: `frontend` | 触发: 实现、代码、渲染、性能、bug修复、功能

---

## 当前优先级

| 优先级 | 事项 | 状态 |
|--------|------|------|
| P0 | 圣水伤害倍率调整（Lv1 几乎杀不死怪） | ✅ 已完成 v0.3.1 |
| P1 | 对象池优化（子弹/宝石复用，减少GC） | 待启动 |
| P1 | 音效系统（Web Audio API，8bit风格） | 规划中 |
| P2 | localStorage 存档（最高分记录） | 待评估 |
| P2 | PWA 离线支持（Service Worker缓存） | 待评估 |

---

## 2026-04-03 — v0.4.1 食物回血系统

### 成果
- **食物回血系统**：敌人死亡概率掉落食物，玩家拾取后回复1HP
  - `CFG.FOOD`: 掉落率10%，回复1HP，同屏上限8，存活15s，Boss必掉3个
  - `Food` 类：与宝石共用吸引/漂移机制，近距离吸入
  - 掉落逻辑集成在敌人死亡处理中
  - 拾取时显示 `❤️+1` 漂浮文字
  - 最后3秒渐隐消失

### 代码结构
- `Food` 类位于 `Gem` 类之后，独立模块
- 掉落调用：`game.enemies` 死亡循环中，宝石掉落后
- 更新循环：与宝石循环并列
- 绘制：在宝石之后

---

## 2026-04-03 — v0.4.0 武器进化系统

### 成果
- **武器进化系统 MVP**
  - 配置：`CFG.EVOLUTIONS` 数组定义进化路线（a + b + 满级 → result）
  - 首条路线：圣水 Lv.3 + 闪电 Lv.3 → 雷暴圣水
  - 进化选项在升级面板中以「进化」金色标签显示（badgeColor `#ff9100`）
  - 选择后移除两个基础武器，添加进化武器实例
- **ThunderHolyWater 类**
  - 继承圣水旋转机制（3球，60px半径，连续伤害）
  - 每2秒每个球向250px内最近敌人释放链式闪电（伤害6，3链，50%衰减）
  - 闪电视觉效果：锯齿线段 + 时间衰减（复用 Lightning 的渲染风格）
  - 球体视觉：水蓝色 + 黄色电火花高光（区别于普通圣水）
- **代码结构**
  - `CFG.EVOLUTIONS` 配置驱动，后续新增进化路线只需添加数组条目
  - `generateUpgrades()` 新增进化检测逻辑
  - `WEAPON_CLASSES` 注册新类

### 技术债务
- `ThunderHolyWater` 使用 `Math.random()` 渲染闪电锯齿，每帧计算量大
- 进化武器目前硬编码类引用，后续需改为配置驱动

---

## 2026-04-03 — v0.3.3 火焰法杖武器实现

### 成果
- **新武器：火焰法杖 (FireStaff)**
  - 锥形火焰范围持续伤害，朝玩家面朝方向释放
  - Lv1: 80px宽/100px射程, 3 DPS
  - Lv2: 100px宽/130px射程, 5 DPS
  - Lv3: 120px宽/160px射程, 7 DPS + 点燃2s(2/s)
  - 仅通过升级获取，不在初始武器选择中
- **面朝方向追踪**：Player 新增 `facingAngle` 属性，随移动输入实时更新
- **视觉效果**：径向渐变锥形火焰（橙→红），内层黄色亮核
- **点燃机制**：Lv3 被烧到的敌人离开锥形区域后仍受持续伤害2秒

### 技术细节
- 锥形判定：`atan2` 计算角度差，±30° 扇形（60° 总张角）
- 燃烧跟踪：`enemy._burn={dmg,t}` 对象，帧计时衰减
- 渐变绘制：`createRadialGradient` + `arc` 扇形路径

---

## 2026-04-03 — v0.3.2 Boss三阶段实现

### 成果
- **Boss Phase 3 螺旋弹幕**
  - 触发：Boss HP < 25% 时进入 Phase 3
  - 行为：1.5倍速追踪 + 16方向螺旋弹幕（/2s），弹幕旋转偏移
  - 子弹参数：速度 80px/s，存活 3s，伤害 1
  - Enemy 构造函数新增 `this.spiralAngle=0`
- **Boss 出场警告**
  - 顶部红色渐变警告条 "⚠ BOSS来了 ⚠"，持续3秒
  - Boss生成时触发红屏闪烁 0.5s
- **Boss HP 百分比显示**
  - 血条上方显示 `HP:XX%` 白色文字，8px monospace
  - 实时更新，玩家可清晰判断Boss剩余血量

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
