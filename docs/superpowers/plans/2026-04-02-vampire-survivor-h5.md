# H5类吸血鬼幸存者肉鸽游戏 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建一个纯Canvas 2D的类吸血鬼幸存者H5游戏，单HTML文件，零外部依赖，支持触控和键盘操作。

**Architecture:** 单HTML文件 (`index.html`)，内含全部CSS和JS。Canvas 2D渲染，requestAnimationFrame驱动游戏循环，逻辑更新与渲染分离。相机跟随玩家，敌人相对视口生成。所有精灵用像素方块绘制。

**Tech Stack:** HTML5 Canvas 2D, 原生JavaScript (ES6+), CSS3

---

## File Structure

```
index.html          # 唯一文件，包含全部游戏代码
  <style>           # 全屏Canvas + UI覆盖层样式
  <canvas>          # 游戏画布
  <div#ui>          # HUD、摇杆、升级面板等HTML覆盖层
  <script>          # 全部游戏逻辑
    常量配置 (CONFIG)
    工具函数 (utils)
    向量类 (Vec2)
    游戏对象 (Player, Enemy, Bullet, Gem)
    武器系统 (WeaponBase, HolyWater, Knife, Lightning, Bible)
    升级系统 (UpgradeSystem)
    生成系统 (Spawner)
    UI管理 (UIManager)
    场景管理 (SceneManager, TitleScene, GameScene, ResultScene)
    输入管理 (InputManager)
    主游戏类 (Game)
    初始化
```

---

### Task 1: HTML骨架 + Canvas全屏 + 基础游戏循环

**Files:**
- Create: `index.html`

- [ ] **Step 1: 创建基础HTML文件，包含Canvas和游戏循环**

创建 `index.html`，包含：
- 全屏Canvas（CSS `width:100%; height:100%`，`touch-action:none`）
- requestAnimationFrame 游戏循环框架
- Canvas自适应窗口resize
- 基础CONFIG常量对象（画布尺寸、游戏时长等）
- 清屏+填充深绿色背景作为游戏地面

在浏览器打开 `index.html` 应看到一个全屏深绿色画面，控制台无报错。

- [ ] **Step 2: 验证游戏循环运行**

打开浏览器DevTools控制台，确认requestAnimationFrame在持续运行（可临时添加FPS计数器显示在左上角）。然后移除FPS调试代码。

---

### Task 2: Vec2向量类 + 相机系统

**Files:**
- Modify: `index.html` — 在 `<script>` 中CONFIG后面添加

- [ ] **Step 1: 实现Vec2类和相机系统**

添加内容：
- `Vec2` 类：`add`, `sub`, `scale`, `length`, `normalize`, `dist`, `clone` 方法
- `Camera` 类：`x, y` 位置，`follow(target)` 方法（平滑跟随），`worldToScreen(x,y)` 和 `screenToWorld(x,y)` 转换方法
- 地面绘制：使用相机偏移绘制网格线（32px间距），形成可感知移动的地面参考

在浏览器中应看到绿色背景上的网格线。

- [ ] **Step 2: 验证**

确认网格线随相机移动而偏移（可临时用键盘控制相机位置测试），然后移除测试代码。

---

### Task 3: 玩家角色 + 键盘输入

**Files:**
- Modify: `index.html`

- [ ] **Step 1: 实现玩家对象和键盘输入**

添加内容：
- `InputManager` 类：追踪 `keys` 对象（WASD和方向键），`getDirection()` 返回归一化移动方向Vec2
- `Player` 类：`x, y, w, h, speed, hp, maxHp, level, exp` 属性；`update(dt, input)` 方法处理移动（限制在地图边界内）；`draw(ctx, camera)` 方法绘制蓝色像素方块角色（16×16，带简单像素帽子造型）
- 在游戏循环中连接：读取input方向 → 更新player → camera跟随player → 绘制player
- 绘制地图边界（浅色矩形，如800×800区域）

WASD/方向键应能移动蓝色方块角色，相机跟随，网格背景随移动。

- [ ] **Step 2: 验证移动和边界**

确认角色不能移出地图边界，移动速度合适（约150px/s），相机平滑跟随。

---

### Task 4: 虚拟摇杆（触控）

**Files:**
- Modify: `index.html`

- [ ] **Step 1: 实现HTML覆盖层虚拟摇杆**

在Canvas上方添加HTML摇杆覆盖层：
- 外圈：80px直径半透明圆，固定在左下角（距底部60px，距左20px）
- 内圈：30px直径实心圆，可拖拽
- 触控事件：`touchstart` 记录起始位置，`touchmove` 计算偏移（限制在外圈范围内），`touchend` 回到中心
- 将摇杆偏移转换为方向Vec2，传给Player的update
- 键盘和摇杆输入合并：任一有输入则使用

移动端触控和PC键盘均可控制角色移动。

- [ ] **Step 2: 移动端验证**

在手机浏览器打开（或Chrome DevTools模拟触摸），确认摇杆可拖拽、角色响应移动。

---

### Task 5: 敌人系统 — 僵尸

**Files:**
- Modify: `index.html`

- [ ] **Step 1: 实现Enemy基类和僵尸**

添加内容：
- `Enemy` 基类：`x, y, w, h, hp, maxHp, speed, damage, type` 属性；`update(dt, player)` 方法（朝玩家移动）；`draw(ctx, camera)` 方法（绘制对应颜色方块+血条）
- 僵尸子类/配置：绿色16×16方块，speed=40，hp=3，damage=1
- 对象池：`enemies` 数组，上限50
- 简单生成器：在视口外随机位置（距玩家200-400px）定时生成僵尸，初始每2秒1个
- 碰撞检测：矩形碰撞，僵尸碰到玩家时造成伤害（每1秒1次），玩家有短暂无敌帧（0.5秒）

僵尸从四周缓慢走向玩家，碰到玩家时扣血。玩家有无敌帧闪烁效果。

- [ ] **Step 2: 验证**

确认僵尸正常追踪、碰撞扣血、无敌帧生效。玩家血量为0时在控制台打印"Game Over"。

---

### Task 6: 武器系统 — 圣水（环绕）

**Files:**
- Modify: `index.html`

- [ ] **Step 1: 实现圣水武器**

添加内容：
- `Bullet` 类：`x, y, w, h, damage, lifetime` 属性；`update(dt)`, `draw(ctx, camera)`
- `WeaponBase` 基类：`level, owner, cooldown, timer` 属性；`update(dt)` 和 `fire()` 方法
- `HolyWater` 武器：绕玩家旋转的水球
  - Lv1: 1个水球，伤害1/帧，旋转半径50px
  - 属性：`angle, radius, damage, count`
  - `update(dt)`: 角度递增，水球位置 = 玩家位置 + 旋转偏移
  - 碰撞：水球与敌人矩形碰撞检测，击中敌人扣hp，击杀产生经验宝石
- `Gem` 类（经验宝石）：`x, y, value` 属性，小型闪烁的紫色方块，静止不动

圣水自动在玩家身边旋转，碰到的僵尸受伤。僵尸死亡掉落紫色经验宝石。

- [ ] **Step 2: 验证**

确认水球旋转、碰撞、僵尸死亡、宝石掉落。

---

### Task 7: 武器系统 — 飞刀（投射）

**Files:**
- Modify: `index.html`

- [ ] **Step 1: 实现飞刀武器**

添加内容：
- `Knife` 武器：向最近敌人投掷飞刀
  - Lv1: 1把/次，CD 1s，伤害2
  - `fire()`: 找最近敌人，计算方向，创建Bullet飞向目标
  - Bullet飞刀：小型黄色方块，直线飞行，命中第一个敌人后消失
  - `bullets` 数组管理，上限100
- `findNearestEnemy(x, y)` 工具函数

飞刀自动瞄准最近僵尸投掷，命中后消失。

- [ ] **Step 2: 验证**

确认飞刀自动射击、追踪、命中消失。

---

### Task 8: 武器系统 — 闪电（自动电击）

**Files:**
- Modify: `index.html`

- [ ] **Step 1: 实现闪电武器**

添加内容：
- `Lightning` 武器：周期性随机电击敌人
  - Lv1: 1道/2s，伤害5
  - `fire()`: 随机选一个屏幕内敌人，造成直接伤害
  - 视觉效果：在目标位置绘制黄色锯齿线段（从玩家到敌人），持续0.2秒
  - `lightningEffects` 数组存储视觉效果，按lifetime衰减

闪电周期性随机电击僵尸，有锯齿闪电视觉效果。

- [ ] **Step 2: 验证**

确认闪电随机命中、伤害正确、视觉效果显示。

---

### Task 9: 武器系统 — 圣经（大范围旋转）

**Files:**
- Modify: `index.html`

- [ ] **Step 1: 实现圣经武器**

添加内容：
- `Bible` 武器：玩家周围大范围旋转攻击
  - Lv1: 半径80px的旋转区域，伤害1/帧
  - 视觉：白色半透明矩形在玩家周围旋转（模拟翻开的书页）
  - `update(dt)`: 更新旋转角度，检测范围内的所有敌人造成伤害（每个敌人每0.3秒受伤一次，用hitTimer追踪）
  - 与圣水类似但范围更大、速度较慢

白色矩形在玩家身边大范围旋转，碰到的敌人受伤。

- [ ] **Step 2: 验证**

确认圣经旋转、范围伤害正确。

---

### Task 10: 经验 + 升级系统

**Files:**
- Modify: `index.html`

- [ ] **Step 1: 实现经验收集和等级提升**

添加内容：
- 玩家拾取经验宝石：当玩家距离宝石 < pickupRange（默认30px）时收集
- 经验值累加，达到阈值升级
  - 升级阈值：[10, 15, 22, 30, 40, 52, 66, 82, 100, 120, ...]
  - 每次升级：`level++`, `exp = 0`, 触发升级事件
- `UpgradeSystem` 类：
  - 维护可用升级池：4种武器 + 3种被动
  - `generateChoices()`: 从池中随机选3个合法选项（新武器/武器升级/被动道具）
  - 选项数据结构：`{ type: 'weapon'|'passive', name, description, apply() }`

击杀敌人 → 掉宝石 → 收集 → 经验满 → 生成3个升级选项。

- [ ] **Step 2: 验证**

确认经验收集、升级触发、选项生成正确。

---

### Task 11: 升级选择UI

**Files:**
- Modify: `index.html`

- [ ] **Step 1: 实现升级选择面板**

添加HTML覆盖层：
- 半透明黑色遮罩（`position:fixed; inset:0; background:rgba(0,0,0,0.7)`）
- 居中面板：标题"LEVEL UP!" + 3张选项卡
  - 每张卡：图标 + 名称 + 描述 + 类型标签
  - 点击后调用选项的 `apply()` 方法，关闭面板，恢复游戏
- 升级时设 `game.paused = true`，选择后设 `false`
- 武器升级apply：增加武器level，更新属性（count/damage/range/speed等）
- 被动道具apply：修改玩家属性（speed/armor/pickupRange等）

升级时游戏暂停，显示3个选项卡，点击后应用效果并继续。

- [ ] **Step 2: 验证**

确认升级暂停、选项显示、点击应用、游戏继续。武器实际属性是否改变（伤害/数量等）。

---

### Task 12: 被动道具效果

**Files:**
- Modify: `index.html`

- [ ] **Step 1: 实现被动道具系统**

确保以下被动道具的apply效果正确：
- 疾风靴：`player.speed *= 1.15`（最多叠加3次，在apply中检查次数）
- 护甲：`player.armor += 1`（最多3），受伤时 `damage = max(1, damage - player.armor)`
- 磁铁：`player.pickupRange += 30`（最多3）

宝石吸取动画：当宝石在pickupRange内时，宝石向玩家位置移动（速度200px/s），而非瞬间收集。

- [ ] **Step 2: 验证**

确认三种被动效果：移速提升可感知、受伤减少、拾取范围增大且有吸附效果。

---

### Task 13: 更多敌人 — 蝙蝠 + 骷髅弓手

**Files:**
- Modify: `index.html`

- [ ] **Step 1: 添加蝙蝠和骷髅弓手**

添加敌人类型配置：
- 蝙蝠：紫色10×10方块，speed=80，hp=1，damage=1
  - 行为：直线快速冲向玩家（预判玩家移动方向）
- 骷髅弓手：白色14×14方块，speed=20，hp=5，damage=1
  - 行为：保持距离（距玩家150-250px），每2秒向玩家射出一枚骨箭（红色小方块，speed=120）
  - 敌方子弹：`enemyBullets` 数组管理，与玩家碰撞检测

更新生成器，根据时间解锁敌人类型。

- [ ] **Step 2: 验证**

确认蝙蝠快速冲锋、骷髅保持距离并射击、骨箭碰撞伤害。

---

### Task 14: Boss — 骨龙

**Files:**
- Modify: `index.html`

- [ ] **Step 1: 实现骨龙Boss**

添加内容：
- 骨龙：红色32×32方块，hp=200，speed=30，damage=2
  - 出现条件：游戏时间 >= 4:30
  - 行为模式1：缓慢追踪玩家（前50%血量）
  - 行为模式2：快速冲锋+周围发射弹幕（后50%血量），每3秒发射8方向弹幕
  - 视觉：比普通敌人大2倍，有简单像素龙角造型
  - 血条：在Boss头顶显示大型血条
- Boss击杀：掉落大量经验宝石（value=50），触发胜利条件

- [ ] **Step 2: 验证**

确认Boss出现、两阶段行为、弹幕、击杀后胜利。

---

### Task 15: 难度缩放系统

**Files:**
- Modify: `index.html`

- [ ] **Step 1: 实现基于时间的难度缩放**

更新生成器逻辑：
- `getDifficulty(elapsed)` 函数，根据已过时间返回：
  - `spawnInterval`: 从2s递减到0.5s
  - `spawnCount`: 从1递增到4
  - `hpMultiplier`: 每分钟+0.2（1.0 → 1.8）
  - `speedMultiplier`: 每分钟+0.1（1.0 → 1.4）
  - `allowedTypes`: 按时间解锁敌人类型
- 新生成的敌人属性乘以对应multiplier

- [ ] **Step 2: 验证**

确认难度随时间递增，后期敌人更多更强。

---

### Task 16: HUD界面

**Files:**
- Modify: `index.html`

- [ ] **Step 1: 实现顶部HUD和底部经验条**

HTML覆盖层UI：
- 顶部HUD条：
  - 左：倒计时 `MM:SS` 格式
  - 中：等级显示 `Lv.X`
  - 右：血条（红色心形或条形）
- 底部经验条：全宽紫色条，显示当前经验百分比
- 右上小地图：60×60 Canvas或div，绿色点表示敌人，蓝色点表示玩家，红色点表示Boss
  - 每帧更新小地图内容

- [ ] **Step 2: 验证**

确认所有HUD元素正确显示和实时更新。

---

### Task 17: 标题画面

**Files:**
- Modify: `index.html`

- [ ] **Step 1: 实现标题画面和初始武器选择**

添加场景管理：
- `TitleScene`：显示游戏标题（像素风大字）、"开始游戏"按钮
  - 点击后进入武器选择
- 武器选择：显示3个武器选项（圣水/飞刀/闪电），点击选择后进入 `GameScene`
  - 初始选中武器设为Lv1加入玩家武器列表
- `GameScene`：主游戏循环
- `ResultScene`：结算画面

- [ ] **Step 2: 验证**

确认标题→选武器→进入游戏的完整流程。

---

### Task 18: 结算画面

**Files:**
- Modify: `index.html`

- [ ] **Step 1: 实现结算画面**

游戏结束时（血量归零 或 5分钟到+Boss击杀）进入 `ResultScene`：
- 胜利：显示"胜利!" + 金色星星动画
- 失败：显示"失败" + 灰色调
- 统计数据：击杀数、存活时间、获得金币（金币=击杀数×10）
- "再来一局" 按钮：重置所有状态，回到标题画面
- `resetGame()` 函数：清空所有数组、重置玩家属性、重置时间

- [ ] **Step 2: 验证**

确认胜利/失败都能正确显示结算，"再来一局"可重开。

---

### Task 19: 像素风视觉优化

**Files:**
- Modify: `index.html`

- [ ] **Step 1: 优化所有精灵的像素风绘制**

为每个角色绘制详细的像素风造型（用fillRect逐像素绘制）：
- 玩家魔法师：蓝色袍子+尖帽+白色面部，16×16
- 僵尸：绿色身体+暗色补丁，16×16
- 蝙蝠：紫色翅膀展开，10×10
- 骷髅弓手：白色骨架+弓，14×14
- 骨龙：红色大型+角+翼，32×32
- 圣水：蓝色旋转球+水花
- 飞刀：黄色小刀形状
- 闪电：黄色锯齿线段
- 圣经：白色矩形书页

添加 `imageSmoothingEnabled = false` 保持像素锐利。

- [ ] **Step 2: 验证**

确认所有角色有清晰的像素风造型，在移动端不会模糊。

---

### Task 20: 最终调优 + 移动端适配

**Files:**
- Modify: `index.html`

- [ ] **Step 1: 数值平衡和移动端适配**

数值调优：
- 玩家初始血量：5
- 各武器伤害/CD确认合理
- 升级选项权重调整：确保每次升级都有3个可选选项
- 经验值阈值递增曲线测试（确保5分钟能升到约8-10级）

移动端适配：
- 禁止页面滚动（`overflow:hidden`, `touch-action:none`）
- 禁止双击缩放（`touch-action:manipulation`）
- Canvas分辨率匹配设备像素比（`devicePixelRatio`）
- 竖屏时Canvas居中，两侧留黑

- [ ] **Step 2: 完整游戏测试**

从标题到结算完整走一遍，确认：
- 所有4种武器都能获取和升级
- 3种被动道具效果正确
- Boss正常出现和行为
- 胜利/失败条件正确
- 虚拟摇杆和键盘都能操作
- 性能流畅（无明显卡顿）
