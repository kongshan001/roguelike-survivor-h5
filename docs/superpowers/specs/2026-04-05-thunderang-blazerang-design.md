# 设计规格书：进化武器 雷霆回旋(Thunderang) + 烈焰回旋(Blazerang)

> 版本: v1.5.0+ | 策划 Agent | Drive #21
> 状态: 设计完成，待前端实现
> 前置: Boomerang 基础武器已实现 (v1.5.0), CFG 常量已就绪

---

## 1. 设计概述

回旋镖(Boomerang)作为第7种基础武器已在 v1.5.0 实现完毕。本规格书定义其两条进化路线的前端实现方案：雷霆回旋(Thunderang)和烈焰回旋(Blazerang)。两个进化武器的 CFG 常量、进化路线注册、WEAPONS 条目均已存在于 config.js 中，唯一缺失的是 registry.js 中的武器类实现和 WEAPON_CLASSES 映射注册。

本规格书输出前端可直接实现的完整类设计，包含 update 逻辑、draw 渲染、与现有系统的集成方式，以及数值平衡分析。

### 前置条件检查

| 条目 | 状态 | 说明 |
|------|------|------|
| CFG.WEAPONS.thunderang | 已存在 | config.js:38 |
| CFG.WEAPONS.blazerang | 已存在 | config.js:39 |
| CFG.EVOLUTIONS 回旋镖路线 | 已存在 | config.js:48-49 |
| CFG.BOOMERANG.thunderang | 已存在 | config.js:285-286 |
| CFG.BOOMERANG.blazerang | 已存在 | config.js:287-289 |
| Boomerang 类实现 | 已完成 | registry.js:843-970 |
| WEAPON_CLASSES 注册 | **缺失** | 需新增 thunderang/blazerang 映射 |

---

## 2. 雷霆回旋 (Thunderang) 类设计

### 2.1 设计定位

雷霆回旋 = 回旋镖的追踪双程 + 闪电的随机链式电击。它是所有进化武器中对单体 DPS 最高的（约35），定位为"单体爆发 + 连锁"型武器。4枚回旋镖以几乎全向追踪(75度偏转角)投掷，每次命中40%概率触发闪电链，飞出和飞回各判定一次。

### 2.2 数值表

| 属性 | 数值 | 对比基础回旋镖Lv3 |
|------|------|-----------------|
| 投掷数量 | 4 | +1 (3->4) |
| 飞出速度 | 350 px/s | +30 (320->350) |
| 飞回速度 | 380 px/s | +20 (360->380) |
| 命中伤害 | 7 | +2 (5->7) |
| 最大飞行距离 | 400 px | +50 (350->400) |
| 投掷间隔 | 0.8s | -0.2 (1.0->0.8) |
| 穿透 | 3 | +1 (2->3) |
| 追踪偏转角 | 1.31 rad (75度) | +0.26 (1.05->1.31) |
| 弧线曲率 | 0.15 | -0.05 (0.2->0.15, 更直) |
| 闪电链概率 | 40%/次命中 | 新增 |
| 闪电链范围 | 120 px | 新增 |
| 闪电链目标数 | 2 | 新增 |
| 闪电链伤害 | 8 | 新增 |
| 闪电链层数 | 2 (衰减50%) | 新增 |

### 2.3 类结构

Thunderang 继承 Weapon 基类（maxLevel=1），其核心结构与 Boomerang 相似但增加了闪电链效果。关键差异：

1. **投射物数量更多(4)**，追踪更强(75度)，路径更直(0.15曲率)
2. **命中时触发闪电链**：复用 Lightning 类的链式逻辑
3. **双程闪电判定**：飞出命中和飞回命中各独立判定闪电链

```js
export class Thunderang extends Weapon {
  constructor(owner) {
    super('thunderang', owner);
    this.projectiles = [];
    this.effects = [];  // 闪电视觉效果
  }
  get maxLevel() { return 1; }
}
```

### 2.4 update 逻辑

**核心流程**：与 Boomerang 的 update 逻辑高度相似，差异点：

1. 从 `CFG.BOOMERANG.thunderang` 读取参数（而非 `CFG.BOOMERANG.levels[level]`）
2. 每次命中敌人时，有 40% 概率触发闪电链
3. 闪电链：从被命中敌人位置开始，向 120px 范围内随机 2 个敌人释放电击（伤害 8），每个电击目标再向 120px 范围内寻找下一个目标（最多 2 层链，伤害衰减 50%）
4. 飞出命中和飞回命中各自独立判定闪电链（同一回旋镖可触发多次闪电）
5. 闪电视觉效果存储在 `this.effects[]` 中用于 draw 渲染

**update 伪代码**：

```
每帧:
  1. timer -= dt
  2. 若 timer <= 0:
     a. timer = CFG.BOOMERANG.thunderang.cd  // 0.8s
     b. 从玩家位置投掷 4 枚回旋镖
     c. 每枚追踪最近的敌人（4枚分追最近的4个不同敌人，不足则重复目标）
  3. 更新每枚回旋镖:
     a. 飞出阶段:
        - 追踪微调(1.31 rad/s)
        - 弧线偏移(0.15)
        - 碰撞检测 + 伤害(7) + 穿透(3)
        - 命中时: 40%概率触发闪电链
     b. 飞回阶段:
        - 直线飞回(returnSpeed=380)
        - 碰撞检测 + 伤害(7)（使用独立的 returnHitSet）
        - 命中时: 40%概率触发闪电链
     c. 到达玩家 -> 移除
```

**闪电链触发函数**（应抽取为独立方法，可被 Thunderang 和 Lightning/ThunderHolyWater/Blizzard 复用）：

```
triggerLightningChain(sourceX, sourceY, enemies, hitSet):
  cfg = CFG.BOOMERANG.thunderang.lightning
  if Math.random() > cfg.chance: return  // 40%概率
  let prev = {x: sourceX, y: sourceY}
  let chainHitSet = new Set(hitSet)  // 不重复电击已被穿透的敌人
  for chain = 0 to cfg.chains:  // 2层链
    在 cfg.range(120px) 内找最近的未命中敌人
    if 找到:
      伤害 = cfg.dmg * (chain == 0 ? 1 : cfg.decay^chain)  // 8, 4
      敌人.hurt(伤害)
      chainHitSet.add(敌人)
      this.effects.push({x0:prev.x, y0:prev.y, x1:敌人.x, y1:敌人.y, t:0.2})
      prev = 敌人
    else: break
```

### 2.5 draw 渲染

**回旋镖本体**：与基础 Boomerang 的 V 字形渲染相同，但颜色改为蓝金配色。

| 元素 | 规格 |
|------|------|
| V字形 | 金色(#ffc107) + 棕色(#795548) |
| 电弧缠绕 | 蓝色(#ffeb3b) 2px 线段在 V 字周围 |
| 旋转速度 | 12 rad/s (与基础相同) |

**闪电链效果**：复用 Lightning/ThunderHolyWater 的闪电渲染逻辑。

```
for (const e of this.effects):
  e.t -= dt
  if e.t <= 0: 移除
  绘制: 锯齿状黄色线段 from (e.x0, e.y0) to (e.x1, e.y1)
  strokeStyle: rgba(255,235,59, ${e.t * 5})
  lineWidth: 2
  4段中间点随机偏移 +-14px
```

**命中特效**：敌人位置显示黄色星星粒子（复用通用粒子系统或简单 fillRect）。

### 2.6 与 Boomerang 基类的代码复用

Thunderang 和 Blazerang 的核心飞行逻辑（追踪微调、弧线偏移、飞回）与基础 Boomerang 几乎相同。建议以下复用策略：

1. **抽取共享方法**：将 `findNearestEnemy`、飞出阶段追踪逻辑、飞回阶段逻辑抽取到 Boomerang 类中作为 protected 方法，Thunderang/Blazerang 继承 Boomerang
2. **或者**：Thunderang/Blazerang 各自独立实现（代码重复但类结构更清晰，推荐此方案以保持与现有进化武器风格一致）

推荐方案2，理由：现有进化武器（ThunderHolyWater/FireKnife/Blizzard 等）全部独立实现，不继承基础武器类。保持一致的风格便于维护。

---

## 3. 烈焰回旋 (Blazerang) 类设计

### 3.1 设计定位

烈焰回旋 = 回旋镖的弧线飞行 + 火焰法杖的点燃与持续伤害。3枚回旋镖沿弧线飞行，飞行路径每20px留下一个火焰点（持续1.5秒），接触火焰的敌人受到持续伤害。命中敌人点燃2.5秒。定位为"穿透 + 区域控制"型武器 -- 回旋镖的飞行轨迹本身成为持续伤害区域。

### 3.2 数值表

| 属性 | 数值 | 对比基础回旋镖Lv3 |
|------|------|-----------------|
| 投掷数量 | 3 | 不变 |
| 飞出速度 | 330 px/s | +10 (320->330) |
| 飞回速度 | 360 px/s | 不变 |
| 命中伤害 | 6 | +1 (5->6) |
| 最大飞行距离 | 380 px | +30 (350->380) |
| 投掷间隔 | 0.8s | -0.2 (1.0->0.8) |
| 穿透 | 3 | +1 (2->3) |
| 追踪偏转角 | 1.05 rad (60度) | 不变 |
| 弧线曲率 | 0.2 | 不变 |
| 火焰轨迹间隔 | 20 px | 新增 |
| 火焰轨迹持续 | 1.5s | 新增 |
| 火焰轨迹DPS | 2/s | 新增 |
| 最大火焰点数 | 20 | 新增 |
| 点燃持续 | 2.5s | 新增 |
| 点燃DPS | 3/s | 新增 |

### 3.3 类结构

```js
export class Blazerang extends Weapon {
  constructor(owner) {
    super('blazerang', owner);
    this.projectiles = [];
    this.trails = [];  // 火焰轨迹点
  }
  get maxLevel() { return 1; }
}
```

### 3.4 update 逻辑

**核心流程**：与 Boomerang 相似 + 火焰轨迹系统。

1. 从 `CFG.BOOMERANG.blazerang` 读取参数
2. 投掷 3 枚回旋镖
3. 飞行阶段：每飞行 20px 距离在当前位置留下一个火焰轨迹点
4. 火焰轨迹点：持续 1.5 秒后消失，每秒对接触的敌人造成 2 伤害
5. 命中敌人时：造成 6 伤害 + 点燃 2.5 秒（3 DPS）
6. 飞回阶段：同样留下火焰轨迹
7. 最大同时存在 20 个火焰轨迹点（超出时移除最旧的）

**火焰轨迹系统详细逻辑**：

```
trail = {
  x, y,          // 位置
  life: 1.5,     // 剩余生命(秒)
  hitCD: new Map() // 每个敌人的伤害冷却(避免每帧多次伤害)
}

每帧更新 trails:
  for trail in this.trails:
    trail.life -= dt
    if trail.life <= 0: 移除
    for enemy in enemies:
      if |trail.x - enemy.x| < 12 + enemy.w/2 && |trail.y - enemy.y| < 12 + enemy.h/2:
        if !trail.hitCD.has(enemy) || trail.hitCD.get(enemy) <= 0:
          enemy.hurt(this.applyDmg(CFG.BOOMERANG.blazerang.flame.trailDps * dt))
          trail.hitCD.set(enemy, 0.5)  // 每0.5秒判定一次
        else:
          trail.hitCD.set(enemy, trail.hitCD.get(enemy) - dt)
```

**轨迹生成时机**：

```
在回旋镖飞行时:
  p.trailDist += speed * dt  // 累计飞行距离
  if p.trailDist >= CFG.BOOMERANG.blazerang.flame.trailInterval:  // 20px
    this.trails.push({x: p.x, y: p.y, life: trailDur, hitCD: new Map()})
    p.trailDist = 0
    if this.trails.length > CFG.BOOMERANG.blazerang.flame.maxTrails:  // 20
      this.trails.shift()  // 移除最旧的
```

**点燃效果**：

```
命中敌人时:
  enemy.hurt(this.applyDmg(6))  // 直接伤害
  if !enemy._burn: enemy._burn = {dmg: 0, t: 0}
  enemy._burn.dmg = this.applyDmg(CFG.BOOMERANG.blazerang.flame.burnDps)  // 3
  enemy._burn.t = CFG.BOOMERANG.blazerang.flame.burnDur  // 2.5
```

### 3.5 draw 渲染

**回旋镖本体**：橙红色V字形。

| 元素 | 规格 |
|------|------|
| V字形主色 | 橙红色(#ff6d00) |
| V字边色 | 深红(#bf360c) |
| 旋转速度 | 12 rad/s |

**火焰轨迹点**：

```
for trail in this.trails:
  alpha = trail.life / 1.5  // 随生命衰减
  s = cam.w2s(trail.x, trail.y, canvas)
  // 外圈
  ctx.fillStyle = rgba(255, 87, 34, alpha * 0.4)
  ctx.fillRect(s.x - 5, s.y - 5, 10, 10)
  // 内核
  ctx.fillStyle = rgba(255, 152, 0, alpha * 0.7)
  ctx.fillRect(s.x - 3, s.y - 3, 6, 6)
  // 亮点
  ctx.fillStyle = rgba(255, 235, 59, alpha * 0.5)
  ctx.fillRect(s.x - 1, s.y - 1, 2, 2)
```

**命中火焰爆发**：命中敌人时在敌人位置产生 3-4 个橙色粒子向外扩散（简单实现为 3-4 个 fillRect，随机偏移 + alpha 衰减）。

### 3.6 性能考量

火焰轨迹系统可能产生大量碰撞检测（每帧 20 个轨迹点 x 最多 100 个敌人 = 2000 次检测）。优化策略：

1. **轨迹点碰撞使用距离预检**：先检查 `Math.abs(dx) < threshold`（AABB 快速排除），再精确检查
2. **伤害冷却**：每个轨迹点对每个敌人有 0.5 秒冷却（hitCD Map），减少 hurt 调用频率
3. **最大轨迹点数 20**：硬上限，超出时移除最旧的
4. **轨迹点间距 20px**：不是每帧生成，而是每飞行 20px 生成一个

---

## 4. 两个进化武器的对比

| 维度 | 雷霆回旋 (Thunderang) | 烈焰回旋 (Blazerang) |
|------|---------------------|---------------------|
| 投掷数量 | 4 | 3 |
| 命中伤害 | 7 | 6 |
| 追踪能力 | 75度(几乎全向) | 60度(同基础Lv3) |
| 核心特殊效果 | 闪电链(40%/120px/2链) | 火焰轨迹(20px间隔/1.5s/2DPS) |
| 额外伤害来源 | 闪电链8+4=12/触发 | 点燃3/s*2.5=7.5/命中 + 轨迹2/s*面积 |
| 对单体DPS | ~35 (7*2*2/0.8s + 闪电链) | ~30 (6*2*2/0.8s + 点燃) |
| 对群体DPS | 中等(闪电链最多2*2=4额外目标) | 高(火焰轨迹覆盖面积伤害) |
| 定位 | 单体爆发+连锁 | 穿透+区域控制 |
| 最佳场景 | Boss/精英密集区域 | 狭窄通道/敌人密集路径 |

---

## 5. 实现要点清单

### 5.1 registry.js

| # | 修改内容 | 说明 |
|---|---------|------|
| 1 | 新增 Thunderang 类 | 继承 Weapon，maxLevel=1 |
| 2 | 新增 Blazerang 类 | 继承 Weapon，maxLevel=1 |
| 3 | Thunderang 构造函数 | projectiles=[], effects=[] |
| 4 | Thunderang.update() | 飞行逻辑(同Boomerang) + 闪电链触发 |
| 5 | Thunderang.triggerLightning() | 闪电链伤害+效果记录 |
| 6 | Thunderang.draw() | 蓝金回旋镖 + 闪电视觉效果 |
| 7 | Blazerang 构造函数 | projectiles=[], trails=[] |
| 8 | Blazerang.update() | 飞行逻辑(同Boomerang) + 轨迹生成 + 轨迹伤害 |
| 9 | Blazerang.updateTrails() | 轨迹点生命周期管理 + 碰撞伤害 |
| 10 | Blazerang.draw() | 橙红回旋镖 + 火焰轨迹渲染 |
| 11 | WEAPON_CLASSES 新增 | thunderang: Thunderang, blazerang: Blazerang |

### 5.2 无需修改的文件

| 文件 | 说明 |
|------|------|
| config.js | CFG 常量已就绪，无需修改 |
| upgrade-generate.js | 进化逻辑通过 EVOLUTIONS 配置自动处理 |
| game.js | 武器实例化通过 WEAPON_CLASSES 自动处理 |
| hud.js | 武器图标通过 CFG.WEAPONS 自动显示 |
| scenes.js | 无变更 |

### 5.3 与 Boomerang 飞行逻辑的代码复用

建议在 Thunderang/Blazerang 中直接复制 Boomerang 的核心飞行逻辑（约50行），差异部分按本规格书修改。不采用继承方式，理由：

1. 现有 6 个进化武器全部独立实现，不继承基础武器
2. Boomerang 的 getLevelData() 接口与进化武器的固定参数接口不同
3. 保持代码风格一致比减少重复更重要

**Thunderang 飞行逻辑差异点**（相对 Boomerang）：

| 差异 | Boomerang | Thunderang |
|------|-----------|-----------|
| 参数来源 | `CFG.BOOMERANG.levels[this.level]` | `CFG.BOOMERANG.thunderang` |
| 命中后额外逻辑 | 无 | `this.triggerLightning(e.x, e.y, enemies)` |
| 闪电视觉效果 | 无 | `this.effects[]` 管理 + draw 渲染 |

**Blazerang 飞行逻辑差异点**（相对 Boomerang）：

| 差异 | Boomerang | Blazerang |
|------|-----------|-----------|
| 参数来源 | `CFG.BOOMERANG.levels[this.level]` | `CFG.BOOMERANG.blazerang` |
| 命中后额外逻辑 | 无 | 点燃效果(`enemy._burn`) |
| 飞行中额外逻辑 | 无 | 每20px生成火焰轨迹点 |
| 额外更新逻辑 | 无 | `this.updateTrails(dt, enemies)` |
| 额外渲染逻辑 | 无 | 火焰轨迹点渲染 |

---

## 6. 数值平衡分析

### 6.1 进化武器 DPS 完整对比（更新后）

| 进化武器 | 对单体DPS | 对群体DPS(5目标) | 伤害来源 |
|---------|----------|-----------------|---------|
| 雷暴圣水 | ~25 | ~30 | 环绕持续+闪电链 |
| 火焰飞刀 | ~30 | ~35 | 高频穿透+DOT |
| 圣光领域 | ~20+脉冲12/4s | ~25 | 范围持续+脉冲 |
| 暴风雪 | ~15+闪电8/2s | ~30 | 控场+闪电链+冰晶 |
| 冰霜飞刀 | ~22 | ~25 | 减速穿透 |
| 烈焰经文 | ~25+脉冲8/3s | ~30 | 范围灼烧+脉冲 |
| **雷霆回旋** | **~35** | **~25** | **双程高伤+闪电链** |
| **烈焰回旋** | **~30** | **~40** | **双程穿透+火焰轨迹+点燃** |

### 6.2 雷霆回旋 DPS 详算

| 来源 | 计算 | DPS |
|------|------|-----|
| 回旋镖直接命中(双程) | 7 dmg * 2程 * 4枚 / 0.8s CD = 70 | 70 |
| 实际命中率修正(~50%) | 70 * 0.5 = 35 | 35 |
| 闪电链(40%触发) | 8+4=12伤害 * 0.4概率 * 2次命中/枚 * 4枚 / 0.8s | ~19.2 |
| 闪电链命中修正(~70%) | 19.2 * 0.7 = 13.4 | 13.4 |
| **总计** | | **~48 (理论), ~35 (实际)** |

**平衡评估**：雷霆回旋是单体DPS最高的进化武器(35)，但：(1)依赖追踪命中率（密集场景miss多）；(2)闪电链是概率触发（40%），不稳定；(3)对群体效率低于烈焰经文/暴风雪。定位合理 -- "Boss/精英杀手"的进化升级。

### 6.3 烈焰回旋 DPS 详算

| 来源 | 计算 | DPS |
|------|------|-----|
| 回旋镖直接命中(双程) | 6 * 2 * 3 / 0.8 = 45 | 45 |
| 实际命中率修正(~50%) | 45 * 0.5 = 22.5 | 22.5 |
| 点燃DOT(命中时) | 3/s * 2.5s = 7.5/命中, 6命中/0.8s = 56.25 | ~28 (修正后) |
| 火焰轨迹(面积) | 2/s * 20点 * 覆盖率 ~30% | ~12 |
| **总计** | | **~62 (理论), ~30 (实际)** |

**平衡评估**：烈焰回旋的群体DPS(~40)是所有进化武器中最高的，来自火焰轨迹的面积伤害。但单体DPS(~30)处于中等水平。平衡合理 -- 牺牲单体爆发换取区域控制能力。

### 6.4 对5分钟标准局的影响

| 维度 | 分析 |
|------|------|
| 获取时机 | 最早在~3:20（两个武器满级），~3:30完成进化 |
| 可用时间 | 仅剩~90秒（3:30到5:00） |
| 替代选择 | 获取雷霆回旋/烈焰回旋意味着放弃了其他6条进化路线之一 |
| 体验影响 | 丰富了后期Build选择，不影响前期平衡 |

### 6.5 对无尽模式的影响

| 维度 | 分析 |
|------|------|
| 雷霆回旋 | 10分钟后敌人HP~4x，闪电链的固定伤害8开始乏力，但主伤害7*2=14/命中仍有价值 |
| 烈焰回旋 | 点燃的百分比潜力（如果未来点燃改为最大HP%）+ 火焰轨迹的面积控制始终有效 |
| Boss击杀 | 雷霆回旋仍是Boss战最优选择之一 |

---

## 7. CFG 常量引用（已存在，无需修改）

以下常量已在 config.js 中定义，前端实现时直接引用。

### 7.1 CFG.BOOMERANG.thunderang

```js
thunderang: { count:4, speed:350, returnSpeed:380, dmg:7, maxDist:400, cd:0.8, pierce:3,
  trackAngle:1.31, curvature:0.15,
  lightning:{ chance:0.4, range:120, targets:2, dmg:8, chains:2, decay:0.5 } }
```

### 7.2 CFG.BOOMERANG.blazerang

```js
blazerang:  { count:3, speed:330, returnSpeed:360, dmg:6, maxDist:380, cd:0.8, pierce:3,
  trackAngle:1.05, curvature:0.2,
  flame:{ trailInterval:20, trailDur:1.5, trailDps:2, maxTrails:20, burnDur:2.5, burnDps:3 } }
```

---

## 8. 设计决策记录

1. **为什么雷霆回旋用闪电链而非AOE**：闪电链保留了闪电武器的核心体验（随机电击的不可预测性），与追踪结合后形成"追踪->命中->连锁"的三段效果。纯AOE会与暴风雪/圣光领域重叠。

2. **为什么烈焰回旋用火焰轨迹而非范围DOT**：火焰轨迹创造了"移动的区域控制"效果 -- 回旋镖飞过的路径成为临时危险区域。这是全新攻击维度，不与任何现有武器重叠。而且弧线飞行路径的火焰轨迹在视觉上非常有辨识度。

3. **为什么雷霆回旋投掷4枚而烈焰回旋只投3枚**：雷霆回旋的闪电链已提供群体伤害（每次命中可连锁2个额外目标），4枚回旋镖提供更多闪电链触发机会。烈焰回旋的火焰轨迹已提供面积伤害，3枚足够覆盖路径，过多回旋镖会导致轨迹点过多影响性能。

4. **为什么雷霆回旋的曲率更低(0.15)**：更直的飞行路径意味着更精准地到达目标，闪电链的触发更可靠。烈焰回旋保持基础曲率(0.2)，因为弧线路径的火焰轨迹覆盖面积更大。

5. **为什么两个进化武器的CD都是0.8s**：基础回旋镖Lv3的CD是1.0s，进化后降低到0.8s是合理的进化回报（+25%投掷频率）。不降到更低以避免性能问题（太多活跃投射物+特效）。

6. **为什么烈焰回旋的轨迹点上限20**：20个轨迹点，每个约10x10px，总覆盖面积约2000px^2。配合0.5秒伤害冷却，每秒最多40次伤害判定（20点 x 2次/秒），性能可控。

7. **为什么不用继承Boomerang类**：现有6个进化武器全部独立实现（ThunderHolyWater不继承HolyWater，FireKnife不继承Knife，Blizzard不继承FrostAura）。保持一致的风格比减少代码重复更重要。

8. **为什么火焰轨迹的DPS只有2/s**：火焰轨迹是"被动"伤害 -- 玩家不需要瞄准，回旋镖飞过的地方自动产生。低DPS(2/s)补偿了它的零操作成本和面积覆盖。与火焰法杖的锥形DPS(7/s)相比，轨迹DPS只是补充伤害。

9. **为什么点燃持续2.5s而非更长**：2.5秒点燃意味着在回旋镖的0.8s投掷间隔内，点燃不会完全消失（2.5 > 0.8*3=2.4），3次命中几乎可以维持持续点燃。更长（如4s）会导致"点燃永不断"的无脑效果。

10. **对无尽模式的平衡影响**：两个进化武器在无尽模式中都有价值 -- 雷霆回旋是后期Boss战的核心选择（最高单体DPS），烈焰回旋在敌人密度极高时提供优秀的面积控制。它们不会打破无尽模式的平衡，因为无尽模式的敌人HP持续增长（每分钟+10%），到20分钟时HP约x7，DPS优势会被逐渐稀释。

11. **与协同系统的交互**：两个进化武器不直接参与新的协同组合（进化武器不参与Synergy）。但玩家可能同时持有回旋镖+磁铁的"磁力回旋"协同，进化后如果回旋镖被替换为雷霆回旋/烈焰回旋，协同将失效（因为协同检查的是 'boomerang' 武器ID，而进化武器ID是 'thunderang'/'blazerang'）。这是设计预期 -- 进化是Build的终点，失去前期协同换取更强的进化武器是核心权衡。但前端的升级面板实现需要注意：进化时移除两个满级武器，添加进化武器，此时应重新检查协同。
