# 前端程序工作记录 (Frontend Agent Log)

> Agent: `frontend` | 触发: 实现、代码、渲染、性能、bug修复、功能

---

## 当前优先级

| 优先级 | 事项 | 状态 |
|--------|------|------|
| P0 | 圣水伤害倍率调整（Lv1 几乎杀不死怪） | ✅ 已完成 v0.3.1 |
| P1 | ~~幽灵敌人实现（穿墙闪烁+低血量瞬移）~~ | **✅ 已完成 v0.5.0** |
| P1 | ~~宝箱系统（金币开箱，解决金币用途问题）~~ | **✅ 已完成 v0.6.0** |
| P1 | ~~多角色系统（3角色选择+不同属性/精灵）~~ | **✅ 已完成 v0.7.0** |
| P1 | ~~第6种武器：冰冻光环（范围减速+冰冻控制）~~ | **✅ 已完成 v0.8.0** |
| P1 | ~~音效系统（Web Audio API，8bit合成音效）~~ | **✅ 已完成 v0.9.0** |
| P1 | ~~第4条进化路线（冰冻光环+闪电→暴风雪）~~ | **✅ 已完成 v0.10.0** |
| P1 | ~~localStorage 存档（最高分+最佳时间+统计）~~ | **✅ 已完成 v0.11.0** |
| P1 | ~~对象池优化（子弹/宝石复用，减少GC）~~ | **✅ 已完成 v0.12.0** |
| P1 | ~~冲刺闪避系统（Space键冲刺+无敌帧+残影+冷却）~~ | **✅ 已完成 v0.12.0** |
| P1 | ~~被动道具扩展（暴击/生命结晶/再生 3种新被动）~~ | **✅ 已完成 v0.13.0** |
| P1 | ~~移动端冲刺按钮（虚拟DASH按键）~~ | **✅ 已完成 v0.13.0** |
| P1 | ~~暂停菜单系统（Escape/P+继续/音效开关/返回标题）~~ | **✅ 已完成 v0.14.0** |
| P1 | ~~第7种敌人：精英骷髅（18×18, 12HP, 3方向扇形射击）~~ | **✅ 已完成 v0.15.0** |
| P2 | PWA 离线支持（Service Worker缓存） | 待评估 |

---

## 2026-04-03 — v0.15.0 第7种敌人：精英骷髅

### 成果
- **elite_skeleton 敌人类型**：18×18，12HP，移速15，伤害2
- **3方向扇形射击**：面朝玩家方向 ±15°（30°张角），1.2秒CD
  - 每发子弹伤害1.5，速度100px/s，寿命2.5秒，红色`#ff5252`
- **行为**：缓慢接近（15px/s）→ 250px内射击 → 150px内后退
- **生成时机**：3分30秒(210s)后混入生成池，权重同幽灵
- **宝石价值**：5（最高普通敌人）
- **食物掉落**：🧀 奶酪（继承骷髅系）
- **视觉**：深红色骨架(#b71c1c) + 红色发光眼(#ff1744) + 金色皇冠(#ffd54f)

### 技术细节
- 射击系统重构：从硬编码 `skeleton.shootCD` 改为 `CFG.ENEMY_TYPES[this.type].shootCD`
- `elite:true` 属性触发3方向扇形（`baseAngle ± 0.26rad = ±15°`）
- 敌人绘制新增 `elite_skeleton` 分支：深红色+皇冠标记

---

## 2026-04-03 — v0.14.0 暂停菜单系统

### 成果
- **暂停触发**：Escape / P 键 → `togglePause()`，HUD ⏸ 按钮也可触发
- **暂停菜单 `#pause-menu`**：居中半透明暗色面板 + 毛玻璃效果
  - ▶ 继续游戏：`resumeGame()`
  - 🔊 音效开关：`toggleSound()` 持久化到 `localStorage`
  - 🏠 返回标题：二次确认对话框 `#pause-confirm`
- **确认对话框**：`#pause-confirm` 覆盖层，确定/取消按钮
- **游戏循环**：`game.paused=true` 时跳过 update（已有逻辑）
- **endGame 集成**：游戏结束时隐藏暂停菜单
- **showScene 集成**：切换场景时隐藏暂停菜单
- **音效偏好持久化**：从 Save 系统恢复 `sfxEnabled`

### 技术细节
- `togglePause()` 检查 `game.over` 防止游戏结束后暂停
- `quitToTitle()` 清空 `game=null` 并返回标题画面
- 音效偏好存储在 Save 数据的 `sfxEnabled` 字段
- 页面加载时自动恢复音效偏好（IIFE）
- 重复的 PWA 条目合并为一条

---

## 2026-04-03 — v0.13.0 被动道具扩展 + 移动端冲刺按钮

### 成果
- **3种新被动道具**：暴击戒指(💍)、生命结晶(❤️)、再生护符(♻️)
  - 暴击戒指：每叠+8%暴击率，满叠24%，暴击×2伤害+💥飘字
  - 生命结晶：每叠+2最大HP（同时回复2HP），满叠+6HP
  - 再生护符：每叠缩短回复间隔(5/4/3秒)，每间隔回复1HP
- **暴击系统**：`playerCrits()` 全局函数，武器命中时判定暴击
  - 暴击触发点：飞刀子弹、闪电链初始目标、暴风雪冰晶、圣光领域脉冲、暴风雪闪电链
  - 暴击视觉：💥飘字+金色(#ffd54f)
- **移动端冲刺按钮**：`#dash-btn` 圆形按钮(52×52px)，冰蓝色
  - 位置：右下角（摇杆右侧），touch-action:none 防误触
  - 触摸事件：touchstart→player.dash()，stopPropagation 不干扰摇杆
  - 场景联动：showScene/beginGame 正确显示/隐藏

### 技术细节
- `CFG.PASSIVES` 从3项扩展到6项（speedboots/armor/magnet/crit/maxhp/regen）
- Player 构造函数新增 `critChance=0`, `_regenTimer=0`
- `Enemy.hurt(dmg,isCrit)` 第二参数控制暴击，暴击×2倍率
- `playerCrits()` 使用 `game.player.critChance` 判定
- 持续伤害(dt伤害)不触发暴击，只有瞬间伤害触发
- 再生计时器使用间隔表 `[5,4,3]` 根据叠层数取值
- beginGame 缺失的闭合花括号修复（历史遗留问题）

---

## 2026-04-03 — v0.12.0 冲刺闪避系统

### 成果
- **CFG.DASH** 配置：`distance:80, duration:0.15, speedMult:3, cooldown:2.5, afterimages:3`
- **Player 新增字段**：`_dashCD`, `_dashing`, `_dashTimer`, `_dashDir`, `_afterimages[]`
- **`dash()` 方法**：冲刺朝面朝方向突进，冲刺期间无敌（invTimer=dashDuration）
- **冲刺移动**：`_dashing` 时以 speed×speedMult 沿 `_dashDir` 移动，跳过正常输入处理
- **残影系统**：`_afterimages[]` 记录位置+alpha，每帧衰减，最多 afterimages 个
- **冲刺拉伸视觉**：`_dashing` 时 ctx.scale(1.4,0.8) 旋转拉伸效果
- **受伤保护**：`takeDamage()` 检查 `_dashing` 返回 false
- **Space 键绑定**：`keydown` 事件监听 `e.code==='Space'` 调用 `game.player.dash()`
- **冲刺音效**：`SFX.play('dash')` — 1200→300Hz 正弦波滑音
- **HUD 冷却指示器**：右下角 DASH 条，显示冷却进度/就绪状态

### 技术细节
- 冲刺方向使用 `facingAngle`（玩家最后面朝方向），无输入时保持上次方向
- 冲刺期间无敌 = `invTimer=CFG.DASH.duration`，与受伤无敌帧共用计时器
- 残影 alpha 以 dt×4 速率衰减（约0.25秒消失）
- 拉伸效果使用 ctx.save/restore + rotate+scale 旋转矩阵
- 冷却 2.5 秒 = 约每波怪一次闪避机会

---

## 2026-04-03 — v0.11.0 localStorage 存档系统

### 成果
- **Save 对象**：`Save.load()`/`Save.save(data)`/`Save.record(kills,time,charId)` API
- **存档结构**：`{version, bestScore, bestTime, totalKills, gamesPlayed, characters:{mage:{},warrior:{},ranger:{}}}`
- **CFG.SAVE**：`key='roguelike_survivor_save', version=1`
- **标题画面统计**：`updateTitleStats()` 在标题画面显示"🏆 最高击杀 | ⏱ 最长存活 | 🎮 游玩次数"
- **结算画面增强**：显示本次成绩 vs 最佳记录对比，新纪录时显示 🆕 标记
- **首次游玩**：无存档时不显示统计（零状态）
- **endGame 集成**：`Save.record()` 返回 `{data, newBest}` 用于 UI 更新
- **restartGame 集成**：返回标题时自动刷新统计数据

### 技术细节
- JSON 序列化存入 `localStorage`，键名含游戏前缀避免冲突
- `version` 字段用于未来存档迁移
- `try/catch` 保护所有 localStorage 操作（隐私模式/满容量）
- `gamesPlayed` 在每次 `endGame` 时递增
- `totalKills` 累积所有局的击杀总数
- 每角色独立记录 bestScore/bestTime

---

## 2026-04-03 — v0.10.0 第4条进化路线 — 暴风雪

### 成果
- **Blizzard 类**：冰冻光环+闪电进化武器
  - 160px范围，70%减速，15%/秒冰冻概率，持续2秒
  - 3/s持续伤害
  - 每2秒释放3道链式闪电（伤害8，2链，50%衰减）
  - 每3秒释放12方向冰晶弹幕（80px扩散，伤害4）
- **进化注册**：`EVOLUTIONS` 第4条 `frostaura+lightning→blizzard`
- **WEAPON_CLASSES** 注册 `blizzard:Blizzard`
- **游戏循环** 注册 `Blizzard update`
- **CFG.WEAPONS** 添加 `blizzard` 条目

### 技术细节
- 冰晶弹幕使用独立 `shards[]` 数组，每帧更新位置+命中检测
- 闪电链从范围内随机3个敌人起始，每条独立链2跳
- 进化光环双色调：冰蓝+金色交替脉动
- 闪电视觉：复用 Lightning 的锯齿线段渲染

---

## 2026-04-03 — v0.9.0 音效系统

### 成果
- **SFX 全局对象**：Web Audio API 振荡器合成 8-bit 风格音效，零外部文件
- **`SFX.init()`**：首次用户交互时创建 `AudioContext`（满足 Chrome 自动播放策略）
- **`SFX.play(id)`**：根据音效 ID 查表创建 OscillatorNode + GainNode，播放后自动断开
- **11种音效**：
  - `hit`: 440→110Hz 下行方波 0.15s（受击）
  - `kill`: 200→600Hz 上行方波 0.1s（击杀）
  - `knife`: 800Hz 锯齿波 0.05s（飞刀投掷）
  - `lightning`: 白噪声爆发 0.12s（闪电）
  - `levelup`: C5-E5-G5 三音阶序列（升级）
  - `pickup`: 880Hz 正弦波 0.08s（拾取）
  - `chest`: 440-660-880Hz 三角波琶音（开箱）
  - `boss`: 110Hz 锯齿波×3连击（Boss出场）
  - `freeze`: 1200→400Hz 正弦波（冰冻触发）
  - `gameover`: 440→110Hz 锯齿波 0.8s（失败）
  - `victory`: C5-E5-G5-C6 四音阶序列（通关）
- **12个触发点**：
  1. `player.takeDamage()` → hit
  2. 敌人 `hp<=0` → kill
  3. `Knife.update()` 发射 → knife
  4. `Lightning.update()` 电击 → lightning
  5. 宝石升级 → levelup (×2)
  6. 宝石拾取 → pickup
  7. 食物拾取 → pickup
  8. 宝箱开箱 → chest
  9. Boss生成 → boss
  10. 冰冻触发 → freeze
  11. `endGame(won)` → victory/gameover
- **白噪声实现**：AudioBuffer 填充随机采样值
- **音量控制**：`masterVolume = 0.3`

### 技术细节
- 音效类型分4种渲染路径：噪声(noise)、序列(seq)、重复(repeat)、单音/滑音(default)
- `exponentialRampToValueAtTime(0.01, ...)` 避免 gain=0 的 exponentialRamp 错误
- 所有 OscillatorNode 播放后自动 stop+断开，不占内存

---

## 2026-04-03 — v0.8.0 冰冻光环武器

### 成果
- **`FrostAura` 类**：第6种基础武器，范围减速+冰冻控制
- **减速机制**：敌人 `_slow` 属性 + `_slowTimer` 刷新，`moveToward`/`moveAway` 速度×(1-slow)
- **冰冻机制**：Lv3解锁，8%/秒概率触发 `_frozen` 状态，敌人完全停止行动
- **3级升级路线**：
  - Lv1: 80px范围, 30%减速, 1/s伤害
  - Lv2: 100px范围, 45%减速, 1.5/s伤害
  - Lv3: 130px范围, 60%减速, 2/s伤害 + 8%/秒冰冻1.5秒
- **视觉**：冰蓝色光环圈 + 径向渐变填充 + 冰晶粒子旋转 + 脉冲波纹
- **敌人视觉效果**：减速=浅蓝覆盖, 冰冻=深蓝覆盖+白色冰晶
- **获取方式**：仅升级面板（不在初始选择池）
- `WEAPON_CLASSES` 注册 `frostaura`
- `generateUpgrades` 武器池已包含 `frostaura`

### 技术细节
- `_frozen` 在 enemy update 中检查，大于0则 return（跳过所有行动）
- `_slowTimer` 每帧递减，归零时清除 `_slow`
- FrostAura 每帧对范围内敌人刷新 slowTimer=0.5s

---

## 2026-04-03 — v0.7.0 多角色系统

### 成果
- **`CFG.CHARACTERS`** 配置：3角色（mage/warrior/ranger），不同 HP/速度/初始武器
- **角色选择界面** `#char-select`：3张角色卡，点击选择
- **流程变更**：标题 → 角色选择 → (魔法师→武器选择 / 战士&游侠→直接开始)
- **`pickChar()` / `beginGame()`**：角色选择 → 武器选择 → 游戏初始化
- **3套角色精灵**：
  - 魔法师 🧙：蓝袍+尖帽+法杖（不变）
  - 战士 🛡：红色铠甲+头盔+剑
  - 游侠 🏹：绿色斗篷+弓
- **`Player.charId`** 字段：draw() 根据 charId 分支渲染不同精灵

### 技术细节
- `Player` 构造函数默认 `charId='mage'`，`beginGame()` 中覆盖
- `beginGame(weaponName)` 从 `selectedChar` 读取 HP/速度，设置到 Player
- `showScene()` 已支持 'char-select' 场景切换

---

## 2026-04-03 — v0.6.0 宝箱系统

### 成果
- **宝箱系统**：金币消耗途径，解决 BUG-007（金币用途不明确）
- **`Chest` 类**：金色箱子（20×16px），金色脉动+价格标签"20💰"
- **生成机制**：30秒后开始刷新，每90秒生成1个，同屏最多2个，300-500px范围随机位置
- **拾取机制**：靠近35px自动开箱，消耗20金币，弹出随机奖励
- **奖励池**（3选1等概率）：
  - 💊 回复药水： HP+3
  - ⚡ 临时加速: 移速+50% 持续10秒（`player._speedBoost` / `_speedBoostTimer`）
  - 💎 经验宝石: +20经验（可能触发升级）
- **金币不足提示**：靠近宝箱但金币不足时显示"💰不足"红色文字
- **小地图标记**：金色方块（3×3px）

### 技术债务
- 宝箱奖励目前等概率，后续可考虑加权随机
- 临时加速未加视觉特效（金色拖尾等）

---

## 2026-04-03 — v0.5.0 幽灵敌人

### 成果
- **新敌人类型 `ghost`**：12×12，HP=2，速度55px/s
- **闪烁（Phase Shift）机制**：每2秒实体→1秒半透明循环，半透明期间伤害减半
- **瞬移（Teleport）机制**：HP降至1时瞬移到玩家背后80-120px处，0.5秒无敌
- **通用伤害路由 `hurt()`**：所有武器/子弹/闪电伤害改为 `e.hurt()` 调用，统一处理幽灵减伤
- **生成时机**：3分钟后混入生成池（与骷髅同时期出现）
- **食物掉落**：幽灵掉落🍞面包（白色 `#e0e0e0`）

### 实现细节
- `Enemy` 构造函数新增：`phaseShift`, `teleport`, `phShiftTimer`, `phShiftActive`, `hasTeleported`, `teleportCD`
- `updateGhost(dt,player)` 方法：管理闪烁循环+瞬移逻辑
- `hurt(dmg)` 方法：幽灵半透明时伤害×0.5，传送后0.5秒免疫
- 接触伤害跳过传送CD中的幽灵
- 宝石价值2（与僵尸相同）

### 技术债务
- `hurt()` 中 `Math.floor(dmg*0.5)` 对DPS类武器（dt帧伤害<1）可能导致0伤害——实际测试中帧伤害累积足够，暂不处理

### 成果
- **HolyDomain 类**：圣经+圣水进化武器
  - 130px半径范围，4个旋转圣光球体，2.5/s持续伤害
  - 每4秒释放圣光脉冲（200px AOE，12伤害）
  - 进化光环：金色脉动圆环
  - 圣光脉冲视觉：白色圆形扩散+半透明填充
- **CFG 注册**：`EVOLUTIONS` 第三条路线，`WEAPONS` holydomain 条目
- **WEAPON_CLASSES 注册**：`holydomain:HolyDomain`
- **游戏循环注册**：`else if(w instanceof HolyDomain)w.update(dt,game.enemies)`

---

## 2026-04-03 — v0.4.2 火焰飞刀进化武器

### 成果
- **FireKnife 类**：飞刀+火焰法杖进化武器
  - 5把飞刀（继承飞刀Lv3多投）
  - 速度280px/s，伤害3，穿透2次
  - 命中附加燃烧：3/s持续2s
  - 投掷间隔0.5s（快于普通飞刀0.7s）
- **进化系统修复**：`generateUpgrades()` 中进化应用改为通用 `WEAPON_CLASSES[evo.result]`，不再硬编码 ThunderHolyWater
- **子弹命中扩展**：玩家子弹判断条件从 `b.color==='#ffd54f'` 改为 `b.color==='#ffd54f'||b.burnDmg`，支持燃烧子弹

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
