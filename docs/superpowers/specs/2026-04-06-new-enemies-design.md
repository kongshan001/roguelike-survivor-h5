# v2.1 新敌人设计规格 -- 护盾型(ShieldBearer) + 自爆型(Exploder)

> Drive #26 | 策划 Agent | 2026-04-06
> 状态: 设计规格完成，待前端实现

---

## 1. 设计概述

当前8种敌人(含Boss和splitter_small)覆盖了以下生态位：

| 生态位 | 代表敌人 |
|--------|---------|
| 近战追踪(慢速高HP) | 僵尸 |
| 快速冲锋(低HP) | 蝙蝠 |
| 远程射击(固定CD) | 骷髅 |
| 高耐久远程(扇形弹幕) | 精英骷髅 |
| Boss(多阶段) | 骨龙 |
| 闪烁减伤+瞬移 | 幽灵 |
| 死亡分裂 | 分裂虫 |

缺少的两个生态位：

1. **"正面防御"** -- 需要绕背或环绕攻击才能高效击杀的坦克型敌人。当前所有敌人都是"从哪个方向打都一样"，护盾型引入方向性判断，与环绕武器(圣水/圣经)天然协同。
2. **"距离管理"** -- 接近或死亡时产生AOE爆炸，迫使玩家保持距离或利用冲刺闪避。当前没有"靠近有代价"的敌人，自爆型引入位置风险评估。

---

## 2. 护盾型 (ShieldBearer)

### 2.1 核心概念

护盾型是一个举着盾牌缓慢接近玩家的坦克型敌人。**正面投射物被盾牌挡住**（伤害减半），只有从侧面或背面攻击才能造成全额伤害。这创造了"绕背攻击"的策略维度。

### 2.2 数值表

| 属性 | 数值 | 对比参考 |
|------|------|---------|
| 类型ID | `shieldbearer` | - |
| 尺寸 | 18x18 | 与精英骷髅同大 |
| 血量 | 8 HP | 低于精英骷髅(12)，高于僵尸(3) |
| 移速 | 25 px/s | 略快于骷髅(20)，慢于僵尸(40) |
| 伤害 | 1 (接触) | 标准 |
| 盾牌减伤 | 正面60度扇形内伤害x0.3 | 核心机制 |
| 盾牌方向 | 面朝玩家(实时跟踪) | 始终面向威胁 |
| 宝石价值 | 3 | 中等 |
| 食物掉落 | 肉类 | 继承重装敌人设定 |

### 2.3 CFG.ENEMY_TYPES 新增常量

```js
shieldbearer: {
  w:18, h:18, hp:8, speed:25, dmg:1, color:'#546e7a',
  shielded:true, shieldArc: Math.PI/3, shieldDmgMul: 0.3,
  gemValue:3, foodType:'meat'
}
```

### 2.4 盾牌机制详细规格

#### 盾牌方向判定

盾牌始终面朝玩家方向，实时跟踪。判定逻辑：

```
shieldAngle = atan2(player.y - enemy.y, player.x - enemy.x)  // 面朝玩家
attackAngle = atan2(bullet.vy, bullet.vx)  // 子弹飞行方向
angleDiff = abs(normalizeAngle(attackAngle - shieldAngle))  // 归一化到[-PI, PI]

if (angleDiff < shieldArc / 2) {
  // 正面攻击 -> 减伤
  finalDmg = dmg * shieldDmgMul
} else {
  // 侧面/背面攻击 -> 全额伤害
  finalDmg = dmg
}
```

#### 盾牌视觉

- 身体：灰蓝色(#546e7a)方块体
- 盾牌：深灰色(#37474f)半圆盾板，位于面朝方向前方
- 盾牌反光：浅灰色(#90a4ae)高光条
- 受击时：如果被正面攻击(减伤)，盾牌闪白色；如果被背面攻击(全额)，身体闪红色

#### 环绕武器的天然克制

| 武器 | 与护盾型交互 |
|------|------------|
| 圣水(环绕) | 球体在旋转过程中经过护盾型背面时造成全额伤害，天然克制 |
| 圣经(旋转) | 同上，旋转经过背面时全额伤害 |
| 飞刀(直线投射) | 正面飞来被减伤，需要走位创造侧面角度 |
| 闪电(随机) | 闪电从天而降，不受盾牌方向限制，全额伤害 |
| 火焰法杖(锥形) | 正面被减伤，需要侧身接近 |
| 冰冻光环(范围) | 范围效果不受方向限制，全额伤害 |
| 回旋镖(追踪) | 飞出时正面减伤，飞回时从背后命中全额伤害 |
| 暴风雪/圣光领域等进化武器 | 范围型攻击，全额伤害 |

**设计意图**：环绕型武器(圣水/圣经)是护盾型的最佳克制。飞刀/火焰法杖等直线武器需要走位技巧。闪电/冰冻/范围型武器完全忽略盾牌。这增加了武器选择的策略深度。

### 2.5 生成时机与权重

- **首次出现时间**：180秒（3分钟，与幽灵/骷髅同期）
- **生成权重**：1（稀有，与幽灵同级）
- **Boss阶段(270s+)**：权重提升到2
- **生成池对照**：zombie:4 / bat:3 / skeleton:2 / ghost:1 / elite_skeleton:1 / splitter:1 / **shieldbearer:1**

### 2.6 与现有系统的交互

| 系统 | 交互 |
|------|------|
| 暴击系统 | 暴击伤害先算减伤再暴击: `critDmg = (dmg * shieldDmgMul) * critMul` |
| 冲刺闪避 | 穿过护盾型到背后输出 -> 冲刺绕背策略 |
| 冰冻光环 | 冰冻后护盾型停止转动，盾牌固定方向 -> 可以从背面安全输出 |
| 连击系统 | 8HP需要2-3次命中，连击窗口维持 |
| 分裂虫 | 护盾型与分裂虫同时出现时，清怪优先级决策(先杀分裂虫防分裂 vs 先杀护盾型防挡路) |
| 灵魂/金币经济 | 3宝石价值 = 金币 3+3=6金币，中等收益 |

### 2.7 WAVE_PROGRESS 更新

在 `CFG.WAVE_PROGRESS.stages` 的 180s 阶段 enemies 列表新增"护盾兵"预告。

---

## 3. 自爆型 (Exploder)

### 3.1 核心概念

自爆型是一个闪烁红光、体型膨胀的敌人。它比其他敌人更快地冲向玩家，**接近玩家一定距离时或死亡时产生AOE爆炸**。玩家需要保持距离或利用冲刺闪避来规避爆炸。冲刺闪避系统天然克制自爆型。

### 3.2 数值表

| 属性 | 数值 | 对比参考 |
|------|------|---------|
| 类型ID | `exploder` | - |
| 尺寸 | 14x14 | 与蝙蝠同大 |
| 血量 | 3 HP | 与僵尸相同 |
| 移速 | 65 px/s | 快于僵尸(40)，慢于蝙蝠(80) |
| 伤害 | 1 (接触) | 标准 |
| 爆炸触发距离 | 40px (接近玩家时) | 约拾取范围 |
| 爆炸半径 | 80px | 大于接触距离 |
| 爆炸伤害 | 3 (AOE) | 高于单次接触(1) |
| 自爆速度 | 100 px/s (触发后冲刺) | 1.5x正常速度 |
| 宝石价值 | 2 | 中等 |
| 食物掉落 | 无 | 爆炸消耗了躯体 |

### 3.3 CFG.ENEMY_TYPES 新增常量

```js
exploder: {
  w:14, h:14, hp:3, speed:65, dmg:1, color:'#e65100',
  exploder:true, explodeTriggerDist:40, explodeRadius:80, explodeDmg:3,
  explodeChargeSpeed:100, explodeFuseTime:0.6,
  gemValue:2, foodType:null
}
```

### 3.4 爆炸机制详细规格

#### 爆炸触发

两种触发方式：

1. **接近触发**：当 exploder 与玩家距离 <= `explodeTriggerDist`(40px) 时，进入"蓄力状态"
   - 蓄力时长：0.6秒（`explodeFuseTime`）
   - 蓄力期间：移速从65提升到100（`explodeChargeSpeed`），体型脉动放大1.2x，颜色从橙色渐变为亮红
   - 蓄力结束：在当前位置爆炸，产生80px范围AOE，3伤害

2. **死亡触发**：当 exploder 被击杀时（HP<=0）
   - 在死亡位置产生80px范围AOE，3伤害
   - 死亡爆炸无蓄力延迟（即死即爆），但爆炸范围不变
   - 这意味着击杀自爆型时需要保持距离，否则会吃到爆炸

#### 爆炸范围判定

```
distToPlayer = distance(exploder, player)
if (distToPlayer <= explodeRadius) {
  player.takeDamage(explodeDmg)  // 3 HP
}
```

爆炸同时伤害范围内的其他敌人（友军伤害），造成1点伤害。这让自爆型在密集敌群中击杀它会产生连锁反应。

#### 爆炸视觉

- 蓄力期间：身体脉动（sin波缩放1.0-1.2），颜色从 `#e65100` 渐变为 `#ff1744`
- 蓄力最后0.2秒：白色闪烁预警
- 爆炸效果：橙红色圆形扩散(80px)，alpha从1.0衰减到0（持续0.3秒）
- 爆炸粒子：8个橙色碎片向外飞散

### 3.5 行为设计

1. **追踪**：像僵尸一样追踪玩家，但速度更快(65px/s)
2. **接近蓄力**：距离 <= 40px 时进入蓄力状态，0.6秒后爆炸
3. **死亡爆炸**：被击杀时立即爆炸（无蓄力延迟）
4. **友军伤害**：爆炸对范围内其他敌人造成1点伤害（可引发连锁爆炸）
5. **冲刺克制**：冲刺闪避期间无敌，可以在蓄力时冲刺穿过规避爆炸

### 3.6 连锁爆炸

如果自爆型A的爆炸杀死了范围内的自爆型B，自爆型B也会立即爆炸。这创造了连锁反应的可能：

```
// 在爆炸伤害判定中
for (const enemy of game.enemies) {
  if (enemy === this) continue;
  const d = dist(explosionCenter, enemy);
  if (d <= this.explodeRadius) {
    enemy.hp -= 1;  // 友军伤害1点
    if (enemy.hp <= 0 && enemy.type === 'exploder') {
      // 连锁爆炸 -- B也会爆炸
      triggerExplosion(enemy);
    }
  }
}
```

连锁爆炸需要多个自爆型密集排列，在实际游戏中不太常见但极具新闻价值（玩家会截图分享"5连爆"）。

### 3.7 生成时机与权重

- **首次出现时间**：180秒（3分钟，与幽灵/护盾型同期）
- **生成权重**：1（稀有，与幽灵同级）
- **Boss阶段(270s+)**：权重提升到2
- **生成池对照**：zombie:4 / bat:3 / skeleton:2 / ghost:1 / elite_skeleton:1 / splitter:1 / shieldbearer:1 / **exploder:1**

### 3.8 与现有系统的交互

| 系统 | 交互 |
|------|------|
| 冲刺闪避 | 冲刺无敌帧可规避爆炸 -> 冲刺是最佳反制手段 |
| 冰冻光环 | 冰冻可暂停蓄力计时器 -> 冻住后远距离击杀，安全爆炸 |
| 火焰法杖 | 点燃DOT可能杀死自爆型 -> 需要保持距离 |
| 闪电 | 随机电击可能意外击杀远处自爆型 -> 爆炸不伤害玩家(距离远) |
| 连击系统 | 爆炸友军伤害击杀其他敌人也计入连击 |
| 护甲被动 | 爆炸伤害3被护甲抵消1 -> 2伤害，护甲有效 |
| 食物系统 | 自爆型不掉落食物(foodType:null) -> 爆炸消耗了躯体 |
| 圣水/圣经 | 环绕武器在自爆型接近前就击杀 -> 如果距离太近爆炸仍会伤到玩家 |
| 回旋镖 | 远距离追踪击杀 -> 爆炸不影响玩家(距离远) |

### 3.9 WAVE_PROGRESS 更新

在 `CFG.WAVE_PROGRESS.stages` 的 180s 阶段 enemies 列表新增"自爆虫"预告。

---

## 4. CFG 常量汇总

### 4.1 CFG.ENEMY_TYPES 新增

```js
// 护盾型 -- 正面减伤坦克
shieldbearer: {
  w:18, h:18, hp:8, speed:25, dmg:1, color:'#546e7a',
  shielded:true, shieldArc: Math.PI/3, shieldDmgMul: 0.3,
  gemValue:3, foodType:'meat'
},

// 自爆型 -- 接近/死亡爆炸
exploder: {
  w:14, h:14, hp:3, speed:65, dmg:1, color:'#e65100',
  exploder:true, explodeTriggerDist:40, explodeRadius:80, explodeDmg:3,
  explodeChargeSpeed:100, explodeFuseTime:0.6,
  gemValue:2, foodType:null
}
```

### 4.2 CFG.FOOD.types 新增

```js
shieldbearer: { icon:'🍖', color:'#8d6e63' },
// exploder: 无食物掉落(foodType:null)
```

### 4.3 WAVE_PROGRESS.stages 更新

```js
// 180s 阶段 enemies 更新为:
{ time:180, name:'后期', icon:'🟠', color:'#ff9100', enemies:['骷髅','幽灵','护盾兵','自爆虫'] },
```

---

## 5. spawner.js 修改要点

### 5.1 180s+ 阶段新增 shieldbearer 和 exploder

```js
// 当前:
if (elapsed < 240) return { interval: 0.7, count: 3, types: ['zombie', 'bat', 'skeleton', 'ghost', 'elite_skeleton', 'splitter'] };

// 修改为:
if (elapsed < 240) return { interval: 0.7, count: 3, types: ['zombie', 'bat', 'skeleton', 'ghost', 'elite_skeleton', 'splitter', 'shieldbearer', 'exploder'] };
```

### 5.2 270s+ 阶段同样新增

```js
// 当前:
return { interval: 0.4, count: 4, types: ['zombie', 'bat', 'skeleton', 'ghost', 'elite_skeleton', 'splitter', 'splitter'] };

// 修改为:
return { interval: 0.4, count: 4, types: ['zombie', 'bat', 'skeleton', 'ghost', 'elite_skeleton', 'splitter', 'splitter', 'shieldbearer', 'exploder'] };
```

### 5.3 无尽模式

```js
// Endless types 数组新增:
const types = ['zombie', 'bat', 'skeleton', 'ghost', 'elite_skeleton', 'splitter', 'splitter', 'shieldbearer', 'exploder'];
```

---

## 6. enemy.js 修改要点

### 6.1 护盾型 (ShieldBearer) 实现

#### constructor 扩展

```js
// Enemy constructor 中新增:
this.shielded = t.shielded || false;
this.shieldArc = t.shieldArc || 0;
this.shieldDmgMul = t.shieldDmgMul || 1;
```

#### update() 新增护盾型行为

护盾型使用标准 `moveToward()` 行为（无特殊AI），特殊之处在于 `hurt()` 中的方向判定。

#### hurt() 修改 -- 盾牌减伤

```js
hurt(dmg, isCrit, bulletX, bulletY) {
  // 盾牌减伤判定
  if (this.shielded && bulletX !== undefined) {
    const angleToAttacker = Math.atan2(bulletY - this.y, bulletX - this.x);
    const shieldFacing = Math.atan2(player.y - this.y, player.x - this.x);
    let angleDiff = angleToAttacker - shieldFacing;
    // 归一化到[-PI, PI]
    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
    if (Math.abs(angleDiff) < this.shieldArc / 2) {
      // 正面攻击 -> 减伤
      dmg = Math.ceil(dmg * this.shieldDmgMul);
      this._shieldBlocked = true;  // 视觉标记：盾牌挡住了
    }
  }
  // ... 其余伤害逻辑不变
}
```

**注意**：需要将子弹/攻击来源坐标传入 `hurt()` 方法。环绕武器(圣水/圣经)的碰撞判定中，攻击来源坐标就是球体/书页的位置，而不是玩家位置。这确保了环绕武器经过护盾型背面时确实造成全额伤害。

对于非方向性伤害（闪电/冰冻光环/暴风雪等范围效果），不传入 bulletX/bulletY，盾牌减伤不生效。

#### draw() 新增护盾型精灵

```
护盾型 (18x18):
- 身体: 灰蓝色(#546e7a) 方块
- 头盔: 深灰(#37474f) 顶部3px条
- 眼睛: 白色(#fff) 2x2点
- 盾牌: 深灰色(#37474f) 半圆形，位于面朝方向前方
- 盾牌高光: 浅灰(#90a4ae) 条纹
- 盾牌被击中时: 白色闪烁0.1秒
```

### 6.2 自爆型 (Exploder) 实现

#### constructor 扩展

```js
// Enemy constructor 中新增:
this.exploder = t.exploder || false;
this.explodeTriggerDist = t.explodeTriggerDist || 0;
this.explodeRadius = t.explodeRadius || 0;
this.explodeDmg = t.explodeDmg || 0;
this.explodeChargeSpeed = t.explodeChargeSpeed || 0;
this.explodeFuseTime = t.explodeFuseTime || 0;
this._fusing = false;      // 是否正在蓄力
this._fuseTimer = 0;       // 蓄力计时器
this._exploded = false;    // 是否已爆炸(防止重复触发)
```

#### update() 新增自爆型行为

```js
if (this.type === 'exploder') {
  const d = dist(this, player);
  if (d <= this.explodeTriggerDist && !this._fusing && !this._exploded) {
    this._fusing = true;
    this._fuseTimer = this.explodeFuseTime;
  }
  if (this._fusing) {
    this._fuseTimer -= dt;
    // 蓄力期间加速冲向玩家
    const spd = this.explodeChargeSpeed * (this._slow ? 1 - this._slow : 1);
    const dx = player.x - this.x, dy = player.y - this.y;
    const l = Math.hypot(dx, dy);
    if (l > 1) { this.x += dx/l * spd * dt; this.y += dy/l * spd * dt; }
    if (this._fuseTimer <= 0) {
      this._explode(game);
      return;
    }
  } else {
    this.moveToward(player, dt);
  }
}
```

#### _explode() 方法

```js
_explode(game) {
  if (this._exploded) return;
  this._exploded = true;
  this.hp = 0;  // 标记死亡
  
  // 对玩家造成伤害
  const d = dist(this, game.player);
  if (d <= this.explodeRadius && !game.player._invincible) {
    game.player.takeDamage(this.explodeDmg);
  }
  
  // 友军伤害
  for (const enemy of game.enemies) {
    if (enemy === this || enemy._exploded) continue;
    const ed = dist(this, enemy);
    if (ed <= this.explodeRadius) {
      enemy.hp -= 1;
      if (enemy.hp <= 0 && enemy.type === 'exploder' && !enemy._exploded) {
        // 连锁爆炸
        enemy._explode(game);
      }
    }
  }
  
  // 视觉效果：爆炸粒子
  game._explosionEffects = game._explosionEffects || [];
  game._explosionEffects.push({
    x: this.x, y: this.y,
    radius: this.explodeRadius,
    timer: 0.3, duration: 0.3
  });
  
  // 音效
  if (game.sfx) game.sfx.play('explosion');
}
```

#### hurt() 修改 -- 死亡爆炸

```js
// 在 hurt() 方法的末尾（hp -= dmg 之后），检查 exploder 死亡
if (this.hp <= 0 && this.type === 'exploder' && !this._exploded) {
  this._explode(game);  // 死亡时爆炸
}
```

#### draw() 新增自爆型精灵

```
自爆型 (14x14):
- 身体: 橙色(#e65100) 方块
- 核心: 亮橙(#ff9800) 中心圆形
- 眼睛: 黄色(#ffeb3b) 2x2点
- 蓄力脉动: sin波缩放1.0-1.2x
- 蓄力颜色渐变: #e65100 -> #ff1744
- 蓄力最后0.2s: 白色闪烁
```

#### 爆炸效果渲染

```js
// 在 game.js 渲染循环中
if (game._explosionEffects) {
  for (const e of game._explosionEffects) {
    if (e.timer <= 0) continue;
    const alpha = e.timer / e.duration;
    const s = cam.w2s(e.x, e.y, canvas);
    const r = e.radius;
    ctx.beginPath();
    ctx.arc(s.x, s.y, r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,87,34,${alpha * 0.5})`;
    ctx.fill();
    ctx.strokeStyle = `rgba(255,152,0,${alpha})`;
    ctx.lineWidth = 3;
    ctx.stroke();
  }
}
```

---

## 7. 数值平衡分析

### 7.1 护盾型平衡

| 场景 | 计算 | 结论 |
|------|------|------|
| 飞刀正面Lv3(5dmg) | 5*0.3=1.5=2(取整) | 需要4次正面击杀(8HP) |
| 飞刀背面Lv3(5dmg) | 5*1.0=5 | 需要2次背面击杀 |
| 圣水球体(经过背面) | 全额伤害 | 环绕武器天然克制 |
| 闪电(无视盾牌) | 全额伤害 | 闪电天然克制 |
| 冰冻后(盾牌固定) | 冰冻期间盾牌方向锁定，可绕背 | 冰冻+绕背策略 |

**结论**：护盾型对直线投射武器(飞刀/火焰法杖/回旋镖飞出)是显著威胁，但对环绕武器(圣水/圣经)和范围武器(闪电/冰冻/暴风雪)完全被克制。这增加了武器选择的策略深度。

### 7.2 自爆型平衡

| 场景 | 计算 | 结论 |
|------|------|------|
| 远距离击杀 | 爆炸80px，玩家在80px外 | 安全，爆炸不影响玩家 |
| 近距离击杀(40px内) | 玩家在爆炸范围内 | 吃到3点爆炸伤害 |
| 冲刺规避 | 蓄力0.6s，冲刺0.15s | 蓄力开始后冲刺可完全规避 |
| 护甲3叠(减伤3) | 3-3=0伤害 | 护甲完全抵消爆炸伤害 |
| 冰冻后远距离击杀 | 冰冻暂停蓄力 | 最佳策略：冰冻->后退->击杀 |
| 连锁爆炸(2个) | 80px范围重叠 | 总伤害3+3=6(如果都在范围内) |

**结论**：自爆型的3点爆炸伤害在护甲保护下可控(3-3=0)，冲刺闪避提供0.15秒无敌窗口完全规避。冰冻+远距离击杀是最佳策略。自爆型对低HP角色(游侠6HP)威胁最大。

### 7.3 整体平衡影响

新敌人引入后，生成池从7种扩展到9种普通敌人。权重分布：

| 敌人 | 权重(0-180s) | 权重(180-270s) | 权重(270s+) |
|------|-------------|---------------|------------|
| zombie | 4 | 4 | 4 |
| bat | 3 | 3 | 3 |
| skeleton | - | 2 | 2 |
| ghost | - | 1 | 1 |
| elite_skeleton | - | 1 | 2 |
| splitter | - | 1 | 2 |
| **shieldbearer** | - | **1** | **2** |
| **exploder** | - | **1** | **2** |

新增2种敌人不会改变早期(0-180s)的体验，仅在3分钟后混入，与幽灵/骷髅同期。权重1(稀有)确保它们不会主导战场，但每次出现都需要不同的应对策略。

---

## 8. 伤害路由修改清单

### 8.1 hurt() 方法签名扩展

当前签名: `hurt(dmg, isCrit)`
建议签名: `hurt(dmg, isCrit, sourceX, sourceY)`

`sourceX/sourceY` 是攻击来源坐标（子弹位置/球体位置），用于盾牌方向判定。如果未提供(undefined)，盾牌减伤不生效（适用于范围效果武器）。

### 8.2 各武器调用点修改

| 武器 | 调用点 | 需要传入source |
|------|--------|--------------|
| Knife | 子弹碰撞时 | `bullet.x, bullet.y` |
| HolyWater | 球体碰撞时 | `ball.x, ball.y` |
| Lightning | 电击时 | 不传(无方向性) |
| Bible | 碰撞检测时 | `page.x, page.y` |
| FireStaff | 碰撞+点燃时 | `this.x, this.y`(锥形中心) |
| FrostAura | 范围伤害时 | 不传(无方向性) |
| Boomerang | 碰撞时 | `boomerang.x, boomerang.y` |
| 所有进化武器 | 同上对应位置 | 同上 |

---

## 9. 实现要点清单

| # | 文件 | 修改内容 |
|---|------|---------|
| 1 | config.js | CFG.ENEMY_TYPES 新增 shieldbearer + exploder |
| 2 | config.js | CFG.FOOD.types 新增 shieldbearer |
| 3 | config.js | CFG.WAVE_PROGRESS.stages 180s 阶段 enemies 新增"护盾兵"+"自爆虫" |
| 4 | enemy.js | constructor 新增 shielded/exploder 相关字段 |
| 5 | enemy.js | update() 新增 exploder AI(接近蓄力+爆炸) |
| 6 | enemy.js | hurt() 扩展签名(sourceX/sourceY) + 盾牌减伤判定 |
| 7 | enemy.js | hurt() 新增 exploder 死亡爆炸判定 |
| 8 | enemy.js | 新增 _explode() 方法(范围判定+友军伤害+连锁) |
| 9 | enemy.js | draw() 新增 shieldbearer 精灵(含盾牌方向绘制) |
| 10 | enemy.js | draw() 新增 exploder 精灵(含蓄力脉动) |
| 11 | spawner.js | 180s+/270s+/endless 生成池新增 shieldbearer + exploder |
| 12 | registry.js | 各武器 hurt() 调用点传入 sourceX/sourceY |
| 13 | game.js | 爆炸效果渲染(_explosionEffects) |
| 14 | game.js | 爆炸音效触发 |
| 15 | game.js | 分裂虫分裂逻辑中处理 exploder 不分裂(确认) |

---

## 10. 设计决策记录

1. **护盾型选择60度扇形**：太小(30度)盾牌几乎没有保护作用；太大(120度)环绕武器也无法绕背。60度(正面1/6圆)让直线武器被减伤70%，但环绕武器经过侧面/背面时全额伤害，平衡点合适。

2. **护盾减伤70%而非100%**：100%减免会让飞刀完全无法正面击杀，过于极端。70%减免让正面攻击仍能造成30%伤害（飞刀Lv3=5*0.3=1.5取整2），紧急情况下正面也能打，只是效率低。

3. **护盾型HP设为8**：低于精英骷髅(12)因为护盾型不需要像精英那样用高HP拖延战斗。8HP让飞刀正面需要4次击杀(低效)，背面只需2次(高效)，差异明显。

4. **护盾型移速25px/s(很慢)**：护盾型是"移动路障"而非"追杀者"。慢速让玩家有时间绕背，也防止护盾型过快贴近造成无处可绕的困境。

5. **自爆型爆炸触发距离40px**：小于拾取范围(35px)但接近，意味着玩家几乎要"碰到"自爆型才会触发。这给玩家足够的反应空间(看到自爆型接近时开始后退)。

6. **自爆型蓄力时间0.6秒**：太短(0.2s)玩家无法反应；太长(1.5s)自爆型完全无害。0.6s给玩家足够时间冲刺闪避(冲刺持续0.15s + 冲刺后移开)或后退。

7. **自爆型死亡爆炸无延迟**：与蓄力爆炸不同，死亡爆炸是即时的。这创造了"距离管理"策略 -- 远距离击杀自爆型时爆炸不影响玩家，近距离击杀时爆炸会伤到玩家。

8. **自爆型友军伤害1点**：不设置太高(3点)避免连锁爆炸过于强力导致"敌军自杀"反而帮了玩家。1点友军伤害足够让低HP敌人(蝙蝠1HP/幽灵2HP)被波及，但不会让整个敌群自毁。

9. **连锁爆炸机制**：是"惊喜时刻"而非核心机制。实际游戏中2-3个自爆型密集排列的情况很少见，但偶尔发生时会产生极高话题性的片段。

10. **自爆型不掉食物**：设定上"爆炸消耗了躯体"。游戏性上防止玩家故意引诱自爆型自杀来获取食物。

11. **两种敌人同时在180s出现**：与幽灵/骷髅同期，3分钟是游戏从"轻松"转为"有压力"的转折点。两种新敌人各有不同的应对策略(护盾型=绕背，自爆型=保持距离)，丰富了中后期的战斗决策。

12. **不修改Boss行为**：护盾型和自爆型不与Boss产生特殊交互。Boss阶段(270s+)仅增加这两种敌人的权重(1->2)，不改变Boss本身的行为模式。

13. **不设计护盾型Boss变体**：护盾型+自爆型的组合已经提供了足够的策略深度，不需要"带盾牌的Boss"或"会爆炸的Boss"变体。这些留给未来v2.2多关卡系统的新Boss设计。

14. **hurt()签名扩展而非新增方法**：使用 `sourceX/sourceY` 可选参数扩展现有 `hurt()` 方法，而非新增 `hurtWithSource()` 方法。最小化API变更，向后兼容(不传source的行为不变)。
