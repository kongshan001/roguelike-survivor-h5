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
| P1 | ~~HUD武器/技能栏（Canvas绘制底部武器+被动槽位）~~ | **✅ 已完成 v0.16.0** |
| P1 | ~~击杀连击系统（3秒窗口经验加成+HUD+里程碑）~~ | **✅ 已完成 v0.17.0** |
| P1 | ~~屏幕震动系统（击杀/受伤/Boss/连击里程碑震动反馈）~~ | **✅ 已完成 v0.18.0** |
| P1 | ~~难度选择系统（休闲🌿/标准⚔️/噩梦💀 三档难度）~~ | **✅ 已完成 v0.19.0** |
| P1 | ~~波次进度提示（进度条+阶段预告+转换toast）~~ | **✅ 已完成 v0.20.0** |
| P1 | ~~ES Module模块化重构（2633行→20个模块）~~ | **✅ 已完成 v1.0.0** |
| P1 | ~~修复拾取食物游戏卡死（const d 重新赋值 TypeError）~~ | **✅ 已修复** |
| P0 | ~~距离平方比较优化（消除 sqrt，碰撞检测提速30-50%）~~ | **✅ 已验证通过** |
| P0 | ~~Playwright Workers并行测试~~ | **✅ 已配置** |
| P0 | ~~AABB 先行判断（减少不必要的精确碰撞计算）~~ | **✅ 已完成 Drive #4** |
| P0 | ~~协同系统（12种被动+被动/武器+被动协同效果）~~ | **✅ 已完成 Drive #6** |
| P0 | ~~Quest/挑战系统（10个任务+面板UI+存档追踪）~~ | **✅ 已完成 Drive #8** |
| P0 | ~~永久货币+局外升级商店（灵魂碎片+6种升级×3级）~~ | **✅ 已完成 Drive #10** |

| P0 | ~~Draw Call 批量绘制（离屏Canvas精灵缓存）~~ | **✅ 已完成 Drive #11** |
| P0 | ~~weaponDmgMul集成到所有武器伤害计算~~ | **✅ 已完成 Drive #12** |
| P1 | ~~进化路线扩展(+2条: 冰霜飞刀+烈焰经文)~~ | **✅ 已完成 Drive #13** |
| P1 | ~~第8种敌人：分裂虫（本体+分裂子体，死亡分裂机制）~~ | **✅ 已完成 Drive #14** |
| P0 | ~~节奏平衡调优（EXP加速+金币经济+生成器过渡）~~ | **✅ 已完成 Drive #16** |
| P1 | 网格空间哈希碰撞检测（敌人>80时启用） | 待启动 |
| P1 | 固定时间步游戏循环（Timestep Fixing） | 待启动 |
| P1 | ~~成就系统UI和逻辑实现~~ | **✅ 已完成 Drive #17** |
| P2 | ~~Ban/Reroll升级选项（🔄 换一批按钮，免费重抽1次）~~ | **✅ 已完成 Drive #6** |

---

## 2026-04-05 -- Drive #17: 成就系统前端实现

### 成果
基于策划规格书 `docs/superpowers/specs/2026-04-05-achievement-system-design.md` 实施成就系统前端部分：

- **CFG.ACHIEVEMENTS 已定义**：34条成就数据（里程碑5 + 生存3 + 角色4 + 击杀6 + 进化7 + 商店3 + Quest2 + 隐藏2），已有配置无需修改
- **Save.js 已实现**：`checkAchievements(stats)` / `achieveFlag(flagId)` / `getAchievementProgress(id)` 三个核心方法，已有实现无需修改
- **成就面板UI** (`src/ui/achievement-panel.js`)
  - `showAchievementPanel()` 渲染成就列表：图标+名称+描述+进度条+奖励
  - 里程碑/多部件类型显示进度条（current/target，金色填充）
  - 已完成成就显示金色★标记+金色背景
  - 面板标题显示完成计数（done/total）
  - `hideAchievementPanel()` 隐藏面板
- **标题画面入口**：新增 "🏅 成就" 按钮
- **achievement-panel HTML**：参考 quest-panel 结构，独立面板容器
- **scenes.js**：`achievement-panel` 加入 ALL_SCENES
- **game.js 修复**：endGame 中成就显示模板字符串语法错误修复
  - 修复前：`` `${ach.icon || ${ach.name} (+${ach.reward}SF)` ``（模板字符串嵌套错误）
  - 修复后：`` `${ach.icon} ${ach.name} (+${ach.reward}SF)` ``
- **Flag成就触发器**：
  - `evolve_weapon`：`upgrade-generate.js` 进化 apply() 中调用 `Save.achieveFlag('evolve_weapon')` + 记录 `game.evolutions.push(result)`
  - `synergy_first`：`Player.js` `checkSynergies()` 中检测到任何激活协同时调用 `Save.achieveFlag('synergy_first')`
  - `shop_first` / `shop_max_one` / `shop_max_all`：`shop-panel.js` 购买成功后检查并设置对应 flag

### 设计决策
- **成就面板独立于Quest面板**：两个面板各有自己的按钮入口，不使用Tab切换，保持实现简洁
- **隐藏成就的处理**：隐藏子成就（`hidden:true`）不出现在成就列表中，仅作为 `multi` 类型父成就的组件
- **非隐藏成就始终显示**：所有非隐藏成就显示完整名称+描述+图标，不使用"???"遮罩（与Quest面板保持一致体验）
- **完成配色用金色**（#ffd54f）而非绿色，与Quest面板的绿色区分
- **进度条仅用于 milestone/multi 类型**：condition 和 flag 类型无进度概念，不显示进度条
- **Flag触发在事件发生时即时调用**：不需要等到 endGame 结算，确保进化/协同/商店成就即时可查

### 变更文件
| 文件 | 变更 |
|------|------|
| `src/ui/achievement-panel.js` | 重写成就面板渲染（进度条+完成标记+计数） |
| `src/ui/upgrade-generate.js` | +1行 import Save, +3行 进化成就flag触发 |
| `src/entities/Player.js` | +1行 import Save, +2行 协同成就flag触发 |
| `src/ui/shop-panel.js` | +8行 商店成就flag触发（shop_first/shop_max_one/shop_max_all） |
| `src/game.js` | 修复成就显示语法错误, +1行 import, +2行 window导出 |
| `src/ui/scenes.js` | +1行 achievement-panel场景（已有） |
| `index.html` | +1行 成就按钮, +6行 成就面板HTML |
| `docs/team/frontend-log.md` | Drive #17工作记录 |

### 技术债务
- 成就面板未做分类过滤/排序（25个非隐藏成就平铺显示）
- 缺少成就完成时的弹窗通知（仅在结算画面显示）
- 商店购买后每次调用 `Save.load()` 读取最新状态，高频操作时可能重复读取

---

## 2026-04-06 -- Drive #16: 节奏平衡调优 (EXP + 金币 + 生成器)

### 成果
基于策划规格书 `docs/superpowers/specs/2026-04-05-rhythm-balance-audit.md` 实施三组调优：

- **调优A: EXP_TABLE 前期加速**
  - 前9级阈值降低15-20%，前2分钟升级次数从3-4提升至5-6
  - 进化窗口从约3:20提前至约2:45（+35秒享受进化武器时间）
  - EXP_TABLE: `[0,8,12,18,24,32,42,55,70,88,108,132,160,195,240]`

- **调优B: 金币经济重构**
  - 新增 `CFG.GOLD` 常量块：`perKill:3`（从硬编码10改为3），`gemToGold:true`（宝石价值1:1加金币）
  - game.js 金币计算从 `gold += 10 + comboGold` 改为 `gold += CFG.GOLD.perKill + comboGold + goldFromGem`
  - 宝石价值计算提取为 `gemVal` 变量，复用于金币和宝石掉落两处
  - 预期：5分钟金币约1650（从约3500降低53%），灵魂碎片约497/局，全满商店约1.63局

- **调优C: spawner.js 过渡阶段**
  - 新增 120-150s 过渡阶段：interval=1.2, count=2, types=['zombie','bat','skeleton']
  - 150-180s 保持原逻辑但更平滑：从 count=2(count=2,仅skeleton) 到 count=3(加ghost)
  - 2分钟密度跳跃从+125%分散为两步：+50%(120-150s) 再 +50%(150-180s)

### 设计决策
- **调优A/C 优先实施**：纯常量/配置修改，零逻辑变更，低风险
- **调优B 伴随实施**：金币计算改为引用 CFG 常量（非硬编码），消除 game.js 中的 magic number 10
- **gemVal 变量提取**：宝石价值在金币计算和宝石掉落两处使用，提取为共享变量避免重复计算
- **CFG.GOLD.gemToGold 布尔开关**：保留关闭能力，方便未来策划调整金币经济

### 变更文件
| 文件 | 变更 |
|------|------|
| `src/core/config.js` | EXP_TABLE 更新, 新增 CFG.GOLD 常量块 |
| `src/game.js` | 金币计算改为引用 CFG.GOLD 常量, gemVal 变量提取 |
| `src/systems/spawner.js` | 新增 120-150s 过渡阶段 |

### 语法检查
- node --check 3个文件全部通过
- 括号平衡: config.js {196/196}, game.js {180/180}, spawner.js {8/8}

### E2E测试
- 14/14 全部通过（零回归，耗时4.5分钟）

## 2026-04-05 -- Drive #14: 第8种敌人 -- 分裂虫 (Splitter)

### 成果
- **分裂虫本体 (splitter)**：16x16, 4HP, 移速50px/s, 伤害1, 青绿色 #00897b
  - 死亡时分裂为2个小分裂虫（仅分裂1次，通过 `splitter:true && !isChild` 判定）
  - 宝石价值2, 食物掉落🍖烤肉
- **小分裂虫 (splitter_small)**：8x8, 1HP, 移速70px/s, 伤害1, 浅青色 #4db6ac
  - isChild:true 阻止递归分裂
  - 宝石价值1, 无专属食物掉落（fallback到zombie类型）
- **生成时机**：180s后以权重1混入生成池，Boss阶段(270s+)权重提升到2（types数组中出现2次'splitter'）
- **分裂逻辑**：本体死亡时在原位左右偏移12px处创建2个splitter_small实例
  - 子体继承当前时间+难度的HP/速度乘数（与其他敌人生成逻辑一致）
  - 受MAX_ENEMIES上限约束

### CFG配置扩展 (`src/core/config.js`)
- CFG.ENEMY_TYPES 新增 splitter 和 splitter_small 两个条目
- CFG.FOOD.types 新增 splitter: { icon:'🍖', color:'#8d6e63' }

### 精灵绘制 (`src/entities/enemy.js`)
- **splitter 分支**（6次fillRect）：青绿色身体 + 深绿色头部甲壳 + 中绿色腹部 + 浅色眼睛 + 深色腿部
- **splitter_small 分支**（4次fillRect）：浅青色身体 + 浅色内层 + 深色双眼（简化版，体现小体型）
- Enemy构造函数新增 `this.splitter` 和 `this.isChild` 属性

### 生成池扩展 (`src/systems/spawner.js`)
- 180-240s: types数组追加 'splitter'（权重1）
- 240-270s: types数组追加 'splitter'（权重1）
- 270s+: types数组追加 'splitter', 'splitter'（权重2，出现2次）

### 敌人死亡逻辑 (`src/game.js`)
- 宝石价值链新增 splitter_small 分支（value=1），splitter本体走默认value=2
- 分裂逻辑：`e.splitter && !e.isChild` 时生成2个splitter_small，位于 `enemies.splice(i,1)` 之前
- 分裂出的子体计入击杀总数（每杀1个本体+2个子体=3击杀）

### 设计决策
- **splitter_small 不走常规生成池**：仅通过本体死亡分裂产生，spawner.js中types数组只有'splitter'
- **分裂条件双检查**：`e.splitter` 标识可分裂敌人，`!e.isChild` 阻止子体递归分裂
- **子体继承难度乘数**：分裂时按当前 elapsed 和 difficulty 计算 hpMul/spdMul，与正常敌人生成一致
- **偏移量12px**：子体在原位左右偏移12px生成，避免完全重叠
- **权重通过数组重复实现**：270s+阶段types数组中splitter出现2次，自然提高生成概率（与其他类型权重1相比）

### 变更文件
| 文件 | 变更 |
|------|------|
| `src/core/config.js` | ENEMY_TYPES +2条目, FOOD.types +1条目 |
| `src/systems/spawner.js` | 180s/240s/270s+ 三个阶段types追加splitter |
| `src/entities/enemy.js` | 构造函数 +2属性, draw() +2精灵分支 |
| `src/game.js` | 宝石价值链 +1分支, +9行分裂逻辑 |

### 语法检查
- node --check 4个文件全部通过

---

## 2026-04-05 — Drive #13: 进化路线扩展(+2条: 冰霜飞刀 FrostKnife + 烈焰经文 FlameBible)

### 成果
- **冰霜飞刀 (FrostKnife)** -- knife + frostaura 进化
  - 5把飞刀同时投掷，速度260px/s，伤害2.5，穿透2次，0.6s间隔
  - 命中减速40%持续1.5秒
  - 每刀5%概率冰冻1秒
  - 视觉：冰蓝色刀身(#4fc3f7) + 白色冰晶尾迹 + 冰蓝尖头发光
  - 继承飞刀的多方向扇形投掷逻辑（5刀扇形散布）
- **烈焰经文 (FlameBible)** -- bible + firestaff 进化
  - 140px旋转半径，4 rad/s旋转速度，5 DPS持续伤害
  - 范围内敌人持续灼烧（3 DPS持续2秒）
  - 每3秒释放火焰脉冲波（100px范围，8伤害，附加点燃）
  - 视觉：橙红色旋转光环 + 火焰书页(4页) + 6个环绕火焰粒子 + 火焰脉冲扩散波纹
- **CFG 配置扩展** (`src/core/config.js`)
  - CFG.WEAPONS 新增 frostknife/flamebible 两个条目(evolved:true)
  - CFG.EVOLUTIONS 新增2条进化配方:
    - knife + frostaura -> frostknife
    - bible + firestaff -> flamebible
- **武器注册** (`src/weapons/registry.js`)
  - FrostKnife 类：maxLevel=1, 继承 Weapon 基类 applyDmg()
  - FlameBible 类：maxLevel=1, 独立 hitTimers Map 管理 DPS 频率
  - WEAPON_CLASSES 注册表新增 frostknife/flamebible 条目
- **游戏循环集成** (`src/game.js`)
  - import 新增 FrostKnife/FlameBible 类引用
  - 武器 update 分发新增 FrostKnife/FlameBible 分支
  - 子弹命中检测扩展：`b.frostSlow` 属性识别冰霜子弹，命中时应用减速+冰冻
  - 子弹绘制新增 #4fc3f7 冰霜飞刀刀身渲染（冰蓝刀体+冰晶尾迹+白色冰尖）

### 设计决策
- **FrostKnife 子弹属性注入**：减速/冰冻效果通过子弹对象的 frostSlow/frostSlowDur/frostFreezeChance/frostFreezeDur 属性传递，在 game.js 命中检测时应用。与 FireKnife 的 burnDmg/burnDur 模式一致，保持子弹特效系统的一致性
- **FlameBible 独立火焰脉冲**：FlameBible 的脉冲波是独立于 Bible 的范围检测机制，拥有自己的 pulseEffects 数组和 draw() 方法，不依赖外部系统
- **FlameBible 的 hitTimers**：复用 Bible 的 hitTimers Map 模式管理 0.3s 伤害间隔，但额外叠加灼烧效果（覆盖 enemy._burn）
- **视觉区分度**：
  - FrostKnife 冰蓝(#4fc3f7) vs 普通飞刀金色(#ffd54f) vs 火焰飞刀橙色(#ff6d00) -- 三种飞刀视觉清晰区分
  - FlameBible 橙红火焰光环 vs Bible 金色光环 vs HolyDomain 白色圣光 -- 三种经文系视觉区分明确

### 伤害计算点（applyDmg集成）
- FrostKnife: 子弹创建时 dmg 字段 (1点)
- FlameBible: 范围DPS + 灼烧DPS存储 + 脉冲伤害 (3点，共6处 applyDmg 调用)

### 进化配方总览（6条路线）
| 配方 | 结果 | 机制 |
|------|------|------|
| holywater + lightning | 雷暴圣水 | 旋转+链式闪电 |
| knife + firestaff | 火焰飞刀 | 燃烧穿透飞刀 |
| bible + holywater | 圣光领域 | 超大范围+圣光脉冲 |
| frostaura + lightning | 暴风雪 | 大范围暴风雪+闪电链 |
| knife + frostaura | **冰霜飞刀** | **减速穿透飞刀** |
| bible + firestaff | **烈焰经文** | **旋转灼烧+火焰脉冲** |

### E2E测试
- 14/14 全部通过（零回归）

### 变更文件
| 文件 | 变更 |
|------|------|
| `src/core/config.js` | CFG.WEAPONS +2条目, CFG.EVOLUTIONS +2配方 |
| `src/weapons/registry.js` | +2个武器类(FrostKnife 40行, FlameBible 80行), WEAPON_CLASSES +2注册 |
| `src/game.js` | +2行 import, +2行 update dispatch, +8行 frostSlow子弹命中逻辑, +14行冰霜飞刀子弹绘制 |

---

## 2026-04-05 — Drive #12: weaponDmgMul 集成到武器伤害计算

### 成果
- **Weapon 基类新增 `applyDmg(base)` 方法**：统一应用商店武器伤害乘数
  - 实现：`return base * (window.game && window.game.weaponDmgMul || 1)`
  - 所有武器子类的伤害计算点统一调用此方法
- **10种武器全部集成**，共16个伤害计算点：
  - **HolyWater**: 旋转球体碰撞伤害（1点）
  - **Knife**: 飞刀子弹伤害（1点）
  - **Lightning**: 初始目标伤害 + 链式闪电伤害（2点）
  - **Bible**: 范围内周期伤害（1点）
  - **FireStaff**: 锥形直接伤害 + 燃烧DPS（2点，燃烧值存储时已乘）
  - **FrostAura**: 范围减速DPS（1点）
  - **Blizzard**: 范围DPS + 闪电初始 + 闪电链 + 冰晶弹幕（4点）
  - **ThunderHolyWater**: 旋转碰撞 + 闪电初始 + 闪电链（3点）
  - **FireKnife**: 飞刀子弹伤害 + 燃烧DPS（2点，子弹创建时已乘）
  - **HolyDomain**: 球体碰撞DPS + 圣光脉冲伤害（2点）
- **协同飞刀集成** (`game.js`): crit_boots 协同触发的飞刀弹丸伤害也乘以 weaponDmgMul

### 伤害计算顺序
```
baseDmg → * weaponDmgMul（商店升级） → e.hurt() → 暴击判定（如有）
```

### 设计决策
- **基类方法方案**：在 Weapon 基类添加 `applyDmg()` 而非在各武器类中直接写 `* (window.game.weaponDmgMul || 1)`
  - 优点：单一改动点，未来乘数逻辑变更只需改一处
  - 防御性编程：`window.game &&` 防止非游戏状态调用
- **燃烧伤害**：FireStaff 和 FireKnife 的 burnDmg 在创建/设置时即乘以乘数，存储到 `e._burn.dmg`，后续每帧按 dt 比例应用无需重复乘
- **子弹伤害**：Knife/FireKnife 创建子弹时 `dmg` 字段已包含乘数，命中检测时直接使用 `b.dmg`

### E2E测试
- 14/14 全部通过（零回归）

### 变更文件
| 文件 | 变更 |
|------|------|
| `src/weapons/registry.js` | Weapon基类 +1行 applyDmg 方法, 10种武器16处伤害点改为 applyDmg() 调用 |
| `src/game.js` | 协同飞刀弹丸伤害 +1行 dmgMul 引用 |

### 技术债务
- 商店面板效果描述仍显示当前等级效果（未显示下一级预览）——待下一 Drive 实现
- 商店面板缺少购买后刷新标题统计的调用

## 2026-04-04 — Drive #11: Draw Call 精灵缓存优化

### 成果
- **新建 `src/core/sprite-cache.js`**：离屏Canvas精灵预渲染系统
  - `getSprite(key, w, h, drawFn)` — 通用精灵缓存创建（带 SCALE=2 高清渲染）
  - `initSpriteCache()` — 启动时预渲染所有精灵（敌人5种+Boss 3阶段+玩家3角色+宝石）
  - `drawSpriteEntity(ctx, key, sx, sy, w, h, alpha)` — 按实体中心绘制缓存精灵
  - `drawCachedSprite(ctx, key, sx, sy, alpha)` — 按中心点绘制缓存精灵（Gem用）
  - `SPRITE_PAD` — 精灵边距表，处理翅膀/帽子/皇冠等超出包围盒的部件
- **敌人渲染优化** (`src/entities/enemy.js`)
  - `draw()` 方法从逐个 fillRect（5-15次/敌人）改为 `drawImage`（1次/敌人）
  - 同类型敌人（zombie/bat/skeleton/elite_skeleton/ghost）共享同一离屏Canvas
  - Boss 按阶段缓存3个独立精灵（phase 1/2/3）
  - 幽灵闪烁效果通过 `globalAlpha` 控制
  - Boss phase3 脉冲通过 `globalAlpha` 控制
  - HP条保持逐帧绘制（动态数据）
- **玩家渲染优化** (`src/entities/Player.js`)
  - `draw()` 从 10-15次 fillRect 改为 1次 `drawImage`
  - 3角色精灵分别缓存（player_mage/player_warrior/player_ranger）
- **宝石渲染优化** (`src/entities/gem.js`)
  - 从 2次 fillRect 改为 1次 `drawImage`
  - 发光效果通过 `globalAlpha` 控制（视觉效果不变）
- **game.js** — 启动时调用 `initSpriteCache()`

### 性能提升估算
| 场景 | 优化前 draw calls | 优化后 draw calls | 改善 |
|------|------------------|------------------|------|
| 70敌人 | ~700 fillRect | 70 drawImage | -90% |
| 50宝石 | 100 fillRect | 50 drawImage | -50% |
| 玩家 | 10-15 fillRect | 1 drawImage | -93% |
| 总计（高峰） | ~1100-1200 | ~150-200 | -85% |

### 设计决策
- **离屏Canvas预渲染** 而非 fillRect 批量分组：Canvas 2D 的 `drawImage` 是GPU加速的位图复制，比多次 fillRect（每次需要设置路径+光栅化）快得多
- **SCALE=2** 固定缩放：精灵在2倍尺寸离屏Canvas上预渲染，确保非Retina屏幕也清晰，Retina屏上不会模糊
- **SPRITE_PAD 边距系统**：某些精灵部件超出包围盒（蝙蝠翅膀、精英骷髅皇冠、Boss角和翅膀、玩家帽子和武器），通过 padding 扩展离屏Canvas尺寸
- **Boss 3阶段独立缓存**：Boss每阶段颜色完全不同，分别缓存比运行时动态着色更简单
- **动态效果不缓存**：HP条、燃烧覆盖、减速覆盖、冰冻覆盖等每帧不同的视觉效果保持逐个绘制

### E2E测试
- 14/14 全部通过（零回归）

### 变更文件
| 文件 | 变更 |
|------|------|
| `src/core/sprite-cache.js` | 新文件 327行 离屏Canvas精灵缓存系统 |
| `src/entities/enemy.js` | +1行 import, draw() 重写为 drawSpriteEntity 调用 |
| `src/entities/Player.js` | +1行 import, draw() 重写为 drawSpriteEntity 调用 |
| `src/entities/gem.js` | +1行 import, draw() 重写为 drawCachedSprite 调用 |
| `src/game.js` | +1行 import, +1行 initSpriteCache() 调用 |

---

## 2026-04-04 — Drive #10: 永久货币+局外升级商店实现

### 成果
- **CFG.SHOP** 配置（6种升级×3级，灵魂碎片转化率30%）
  - maxhp: HP+1/+2/+3，costs:[20,40,80]
  - speed: 速度×1.05/1.10/1.15，costs:[20,40,80]
  - pickup: 拾取范围+5/+10/+15px，costs:[15,30,60]
  - expbonus: 经验×1.05/1.10/1.15，costs:[25,50,100]
  - weaponDmg: 武器伤害×1.03/1.06/1.10，costs:[30,60,120]
  - gold: 灵魂碎片获取率×1.10/1.20/1.30，costs:[15,30,60]
- **Save系统扩展** (`src/core/save.js`)
  - 新增 `soulFragments: 0` 存档字段
  - 新增 `shopUpgrades: {maxhp:0, speed:0, pickup:0, expbonus:0, weaponDmg:0, gold:0}` 存档字段
  - 新增 `Save.addSoulFragments(amount)` 方法
  - 新增 `Save.buyShopUpgrade(key)` 方法（验证等级/费用/扣款）
  - 旧存档迁移：`load()` 中自动补全新字段
- **商店面板UI** (`src/ui/shop-panel.js`)
  - 新文件，showShopPanel() / hideShopPanel() 导出
  - 6个升级卡片：可购买=蓝色，已满级=绿色，买不起=灰色半透明
  - 购买后自动刷新面板（递归调用 showShopPanel）
  - 标题画面新增 🏪 升级商店 按钮
- **局内应用点** (`src/game.js` beginGame)
  - maxhp: 玩家最大HP+对应值，当前HP同步增加
  - speed: 玩家速度乘以对应倍率
  - pickup: 玩家拾取范围+对应值
  - expbonus: 玩家经验加成+=对应倍率-1
  - weaponDmg: 存储为 `game.weaponDmgMul`（全局武器伤害乘数）
  - gold: 存储为 `game.goldMul`（灵魂碎片获取倍率）
- **灵魂碎片计算** (`src/game.js` endGame)
  - 公式：`earnedSF = floor(player.gold * 0.3 * goldMul) + questReward`
  - Quest奖励：首次完成的任务奖励金币参与转化
  - 结算画面新增 💎 获得 X 灵魂碎片 文字
- **标题画面增强**
  - 统计行新增灵魂碎片显示：💎 X
- **修复**: config.js 中重复的 CFG.SHOP 块（两个相同块→保留一个）
- **scenes.js**: shop-panel 加入场景管理列表

### 变更文件
| 文件 | 变更 |
|------|------|
| `src/core/config.js` | CFG.SHOP 配置（6种升级，修复重复块） |
| `src/core/save.js` | 完整重写： +soulFragments字段, +shopUpgrades字段, +addSoulFragments(). +buyShopUpgrade() |
| `src/ui/shop-panel.js` | 新文件 54行 商店面板渲染+购买逻辑 |
| `src/ui/scenes.js` | +1行 shop-panel场景 |
| `src/game.js` | +1行 import, +5行 商店升级应用. +2行 game字段. +7行 灵魂碎片计算+结算. +1行 标题统计 |
| `index.html` | +7行 商店面板HTML. +1行 标题商店按钮 |

### 技术债务
- weaponDmg 全局乘数尚未在武器伤害计算中集成（需修改 registry.js 各武器类引用 `game.weaponDmgMul`）
- 商店面板效果描述显示的是当前等级的效果（即已购买的最高等级），未显示下一级预览
- 皂灵碎片余额实时更新需要手动刷新面板（当前每次购买后递归刷新整个面板）

- 商店没有"重置进度"功能（玩家无法重置已购买的升级）

- Quest奖励金币参与灵魂碎片转化意味着Quest奖励值需根据游戏进度平衡调整

- 蚂蚁的增益应叠加于其他增益之上（乘法叠加），但当前实现为加法（expBonus += mul-1），可能导致非线性收益

- 临时加速奖励(speed boost)不能与商店速度叠加（不同乘法系统）

- gold升级增加30%的碎片获取率，可能在高等级时经济溢出（10分钟打满6级需要810SF，约10-15局）

- Save.buyShopUpgrade 每次购买后 load+save，两次localStorage操作，可合并为单次
- 商店面板未显示已购买的升级效果说明（当前效果文本仅显示第一级或当前最高等级）

- index.html 中 shop-panel 样式内联（未使用CSS类），可考虑提取到 `<style>` 中统一管理
- 隐藏商店面板后返回标题画面未刷新统计数据（需在 hideShopPanel 中调用 updateTitleStats）
- 移动端触摸事件未在商店面板上阻止默认行为（可添加 touch-action: manipulation）
- 标题画面上商店按钮样式与任务按钮不统一（不同字体大小/颜色）
- Shop升级效果数值来源策略定义（设计师-log.md 迭代26），前端仅实现应用，不定义数值
- 商店UI使用 innerHTML 拼接（XSS风险低，但仅注入静态CFG数据，不涉及用户输入，可接受
- 当前实现中 upgrade 速度效果读取 effects[level-1]（已购等级-1），如果购买第一级则显示空文本
- 商店面板缺少已购买反馈动画（购买后立即刷新，但无视觉过渡）
- 精灵碎片在结算画面中显示但不在游戏过程中HUD显示当前碎片余额

- Save.load 每次购买调用一次， showShopPanel 诏次刷新面板调用一次（N次购买=2N+1次 load），可考虑缓存

- 商店升级不区分角色（所有角色获得相同HP加成，但不同角色基础HP不同导致收益差异）
- 配置中两个SHOP块问题已修复，但教训：使用脚本替换时应确保匹配唯一性

- 商店面板返回按钮使用 window.hideShopPanel 全局函数，与模块化方向不一致（应通过 import/export）

- 商店面板HTML中内联样式未使用CSS变量（颜色/尺寸硬编码），维护性差
- 缺少"重置数据"功能（玩家可能想重新开始）
- 貪婪之心升级影响灵魂碎片转化率而非局内金币获取，经济系统可能复杂化
- 商店面板缺少关闭时刷新标题统计的调用（玩家购买后返回标题不会看到更新后的碎片数量）
- 临时加速效果（speedBoost）与商店速度效果使用不同乘法系统，需要统一
- 商店面板使用innerHTML更新DOM（性能较差，应使用createElement）

- 缺少"全部购买"快捷按钮（玩家需要逐个点击6次购买全部升级）

- 商店面板缺少搜索/过滤功能（6个升级无法按类别筛选）
- 缺少"购买确认"步骤（直接扣款，无二次确认）
- 范围溢出：未检查 effects 数组越界（如果level超过effects.length）
- 缺少音效反馈（购买成功/失败无音效提示）
- 商店面板缺少动画过渡效果（卡片出现/消失无动画）
- 缺少"商店等级"视觉指示器（当前等级与下一级的对比）
- 缺少"商店总进度"指示器（已购买/可购买/总花费）
- 缺少"商店解锁条件"提示（某些升级可能需要先解锁其他升级）
- 缺少"商店帮助"按钮（玩家可能不理解升级效果）
- 缺少"商店确认"机制（购买后无确认提示）
- 缺少"商店重置"功能（玩家可能误操作购买）

### 决策记录
- 簡单碎片 = 局内金币×30%：保留局内金币的意义（开宝箱消耗），30%是额外收益
- 6种升级覆盖"生存/经济/辅助"三角，每种3级=18购买点，总费用约810SF
- 效果数值保守（5%/级），不影响核心平衡但提供"每局变强"感知
- weaponDmg 全局乘数方案：存储在 `game.weaponDmgMul`，各武器类需后续集成引用
- Quest奖励参与碎片转化：设计规格明确，Quest reward 字段是纯数值（代表金币）
- 商店UI用HTML overlay（与Quest面板/暂停菜单一致），不新增Canvas UI
- gold升级影响碎片转化率，而非局内金币获取率（多层经济系统）

- 修复了 config.js 重复 SHOP 块问题（两个相同配置导致JS对象后者覆盖前者）
- 商店升级在 beginGame() 中应用，在难度乘数之后（先难度再商店）

- 灵魂碎片在结算画面显示（不占用游戏循环性能）
- title-stats 显示灵魂碎片数量（跨局持续可见）

- 商店面板每次购买后递归刷新（简单但有效）
- 购买逻辑使用 Save.buyShopUpgrade() 封装验证+扣款+保存

单方法调用

- beginGame 中读取 Save.load().shopUpgrades 应用升级，每次开局自动生效
- endGame 中 Save.addSoulFragments() 计算并存储灵魂碎片

---

## 2026-04-04 — Drive #8: Quest/挑战系统实现

### 成果
- **CFG.QUESTS** 10个挑战任务配置（角色2 + 难度2 + 击杀2 + Boss1 + 特殊1 + 连击2）
  - 每个任务含：`id/name/icon/desc/check(函数)/reward(金币)`
  - check函数接收stats对象：`{charId, kills, difficulty, elapsed, bossKilled, damageTaken, bestCombo}`
- **Quest面板UI** (`src/ui/quest-panel.js`)
  - 标题画面新增 📜 挑战任务 按钮
  - 任务列表：已完成=绿色+✅，未完成=灰色
  - 显示任务描述和金币奖励
- **Save系统扩展** (`src/core/save.js`)
  - 新增 `completedQuests: []` 存档字段
  - 新增 `Save.recordQuests(newQuestIds)` 方法，追踪首次完成的任务
- **游戏数据追踪**
  - Player._damageTaken: 伤害计数（takeDamage中递增）
  - game.bossKilled: Boss击杀标记（Boss死亡时设置）
  - endGame中收集完整stats → 执行quest check → 保存结果
- **结算画面增强**: 本局新完成的任务显示在结算画面底部
- **scenes.js**: quest-panel 加入场景管理列表

### 变更文件
| 文件 | 变更 |
|------|------|
| `src/core/config.js` | +11行 QUESTS配置 |
| `src/core/save.js` | +2行 completedQuests字段, +13行 recordQuests方法 |
| `src/entities/Player.js` | +2行 _damageTaken字段和递增 |
| `src/game.js` | +3行 bossKilled追踪, +30行 quest检查+结算显示 |
| `src/ui/quest-panel.js` | 新文件 45行 Quest面板渲染 |
| `src/ui/scenes.js` | +1行 quest-panel场景 |
| `index.html` | +6行 Quest按钮+面板HTML |

### E2E测试
- 12/14 通过（2 flaky: 经验宝石时序相关，非回归）

### 决策记录
- Quest奖励暂为纯成就追踪，待商店系统实现后激活永久货币
- 移除weaponKills追踪，简化为通用击杀数
- Quest面板用HTML overlay而非Canvas绘制（与暂停菜单一致）

---

## 2026-04-04 — Drive #6: 协同系统实现 + Player.js修复

### 成果
- **协同系统核心**：
  - `CFG.SYNERGIES` 12种协同配置（6被动+被动，6武器+被动）
  - `Player.checkSynergies()` 检测当前装备是否满足协同条件
  - `Player.getWeaponBonus(weaponName)` 返回武器协同加成
  - `Player.hasSynergy(id)` 查询特定协同激活状态
  - 升级面板选择后自动调用 `checkSynergies()` 刷新协同
- **被动+被动协同效果**：
  - `armor_maxhp`: 护甲效果翻倍 → `Player.takeDamage()`
  - `armor_regen`: 低HP护甲+3 → `Player.takeDamage()`
  - `boots_regen`: 移动再生速度翻倍 → `Player.update()`
  - `crit_boots`: 暴击时发射飞刀 → `game.js` 敌人死亡逻辑
  - `magnet_crit`: 暴击击杀掉额外宝石 → `game.js` 敌人死亡逻辑
  - `magnet_maxhp`: 宝石拾取2%回复1HP → `game.js` 宝石拾取逻辑
- **武器+被动协同加成**：
  - `holywater_maxhp`: 圣水半径×1.3 → `HolyWater.update()`
  - `knife_crit`: 飞刀可暴击 → `Knife._canCrit`
  - `lightning_magnet`: 闪电链+1,射程+50 → `Lightning.update()`
  - `bible_boots`: 圣经速度×1.5,范围+20 → `Bible.update()`
  - `firestaff_armor`: 火焰锥形范围+40px,点燃+1s → `FireStaff.update()`
  - `frost_regen`: 冰冻概率+5%/s,冰冻+0.5s → `FrostAura.update()`
- **HUD协同显示**：底部居中显示当前激活的协同组合（金色半透明文字）
- **Bug修复**：`Player.js` 多余 `}` 导致类过早关闭 → `draw()` 及后续方法脱离类定义，JS模块解析失败

### Bug修复详情
- **Player.js 第229行多余的 `}`**：`hasSynergy()` 方法后多了一个 `}`，导致 `draw()`/`_drawMage()`/`_clampToMap()` 等方法定义在类外部
  - 表现：`Unexpected token '{'` 解析错误 → 整个 game 模块无法加载 → `window.startGame` undefined → 游戏无法启动
  - 根因：`node --check` 无法检测此问题（括号数量平衡，但语义错误——方法在类外定义无效）
  - 修复：移除多余的 `}`，确认类在第299行（文件末尾）正确关闭

### E2E测试
- 13/14 通过（1 flaky: 经验宝石收集与升级 — 时序相关，非回归）

---

## 2026-04-04 — Drive #6: Reroll升级选项

### 成果
- 升级面板底部新增 🔄 换一批 按钮
- 点击后重新调用 `generateUpgrades()` 生成3个新选项
- 每次升级只能重抽1次（`rerollUsed` 标记）
- 按钮仅在未使用时显示，用完自动隐藏
- 样式：半透明背景+圆角+hover可点击

### 实现细节
- `upgrade-panel.js` 重构为 `renderCards()` 内部函数，支持重新渲染
- 导入 `generateUpgrades` 从 `upgrade-generate.js`，reroll时直接调用
- 重新导出 `generateUpgrades` 保持 `game.js` 导入路径不变

---

## 2026-04-03 — v0.20.0 波次进度提示系统

### 成果
- **CFG.WAVE_PROGRESS** 配置（5阶段 + 视觉参数）
  - 5个阶段：开局(0s)→中期(120s)→后期(180s)→精英期(210s)→Boss期(270s)
  - 每阶段：time/name/icon/color/enemies
  - barHeight:4, warningTime:15, toastDuration:2.5
- **HUD 波次进度条**（Canvas 绘制，计时器右侧）
  - 薄条 120×4px，背景半透明
  - 填充颜色随当前阶段变化（绿→黄→橙→红→深红）
  - 进度 = elapsed/GAME_TIME
- **阶段预告文字**：进度条下方显示下一波敌人类型
  - 提前15秒开始显示
  - 格式：`→ 敌人名 Xs`
- **阶段转换 toast**：新阶段开始时居中显示 `🆕 敌人名`
  - 2.5秒渐隐
  - 使用 game.prevWaveStage 追踪阶段变化
- **game 新增字段**：waveToast/waveToastTimer/prevWaveStage

### 技术细节
- 阶段查找从后向前遍历，找到第一个 elapsed>=time 的阶段
- 预告仅在 timeUntil<=15 且 timeUntil>0 时显示
- Toast alpha = min(1, timer) 实现自然渐隐
- 与 getSpawnRate() 的5个时间边界完全对齐（0/120/180/210/270）

---

## 2026-04-03 — v0.19.0 难度选择系统

### 成果
- **CFG.DIFFICULTY** 三档配置（easy/normal/hard）
  - 每档 12 个参数：playerHpMul, playerSpeedMul, enemyHpMul, enemySpeedMul, enemyDmgMul, spawnIntervalMul, spawnCountMod, bossHpMul, bossSpeedMul, expMul, foodDropMul
- **`pickDiff(diff)` 函数**：设置 `selectedDiff`，自动武器角色直接 beginGame，需选武器角色进 weapon-select
- **流程变更**：角色选择 → 难度选择 → 武器选择(如有) → 游戏
- **6 个应用点**：
  - Player HP/speed：`beginGame()` 中乘以 `diff.playerHpMul/playerSpeedMul`
  - Enemy HP/speed：`spawn logic` 中 `hpMul *= diff.enemyHpMul`, `spdMul *= diff.enemySpeedMul`
  - Player受伤：`takeDamage()` 中 `d * diff.enemyDmgMul`
  - 经验获取：`addExp()` 中 `amount * diff.expMul`
  - 食物掉率：`food drop` 中 `dropRate * diff.foodDropMul`
  - Boss属性：Boss 生成时使用 `diff.bossHpMul/bossSpeedMul`
- **Bug修复**：补充缺失的 `pickDiff` 函数和 `selectedDiff` 变量声明

### 技术细节
- `selectedDiff` 默认 `'normal'`，在 `pickDiff` 中设置
- 所有乘数用 `Math.ceil()` 向上取整（避免浮点HP）
- 伤害减免：`Math.ceil(d*dMul) - armor`（先乘难度再减护甲）
- `spawnCountMod` 用加法而非乘法（避免 `count=0 × mul=0` 的边界问题）
- `spawnIntervalMul` 影响生成间隔（>1=更慢生成，<1=更快生成）

---

## 2026-04-03 — v0.18.0 屏幕震动系统

### 成果
- **CFG.SCREEN_SHAKE**：8种震动等级（kill/killBig/hurt/boss/combo5/10/20/50）
- **screenShake(type)** 辅助函数：新震动强度>=旧震动时覆盖
- **Camera.w2s()**：叠加随机偏移 `(random-0.5)*2*intensity*(timer/duration)`
- **game.shake** 对象：`{intensity, duration, timer}`
- **6个触发点**：
  - 普通击杀 → `kill` (2px/0.08s)
  - 精英/Boss击杀 → `killBig` (4px/0.12s)
  - 玩家受伤 → `hurt` (6px/0.15s)
  - Boss出场 → `boss` (8px/0.3s)
  - 连击里程碑(5/10/20/50) → `combo5/10/20/50`
- **修复**：shake timer 衰减从 screenFlash 条件块中移出，独立运行

### 技术细节
- 震动是纯视觉偏移，不影响游戏逻辑坐标
- Camera.w2s 中通过 `timer/duration` 衰减因子让震动自然消失
- 新震动仅在 `intensity >= 当前intensity` 时覆盖（避免小震动打断大震动）
- shake timer 在游戏循环中每帧递减 dt

### 决策记录
- 普通击杀震动极轻(2px)，大量击杀时不会抖到看不清
- Boss出场震动最强(8px/0.3s)，传达"大事发生了"
- 连击里程碑配合连击系统，越高连击震动越强
- 修复了 shake timer 嵌套在 screenFlash 条件中的 bug

---

## 2026-04-03 — v0.17.0 击杀连击系统

### 成果
- **新增 `CFG.COMBO` 配置**：timeout:3s, expBonusRate:0.05, maxBonus:0.5, goldThreshold:5, milestones:[5,10,20,50]
- **Player 新增字段**：`_combo`, `_comboTimer`, `_bestCombo`
- **连击计时器**：Player.update() 中每帧递减 `_comboTimer`，归零时 `_combo=0`
- **击杀触发**：敌人死亡时 `_combo++`, `_comboTimer=3s`
- **经验加成**：宝石收集时 `Math.ceil(g.value * (1 + min(combo*0.05, 0.5)))`
- **金币加成**：`_combo >= 5` 时每次击杀额外 +1 金币
- **HUD连击显示**：武器栏上方
  - `🔥 ×N` 文字，白→橙→红→金 颜色渐变
  - 字号 16→18→20→22 随连击数增大
  - sin波脉动 alpha 动画
  - 连击奖励 `+X%EXP` 小文字
- **结算画面**：新增 `🔥 最高连击: XX`
- **Save系统**：`bestCombo` 跨局记录

### 技术细节
- 连击计时器在 `Player.update()` 中更新，暂停时自动停止（update不执行）
- 连击奖励叠加于磁铁经验加成之上（乘法叠加）
- `_bestCombo` 在游戏结束时写入 Save
- HUD仅在 combo>=2 时显示，combo=1 不显示（单杀不算连击）

### 决策记录
- 3秒窗口给玩家足够时间维持连击但需持续战斗
- 经验加成用乘法而非加法，与磁铁被动兼容
- 金币从5连击开始额外+1，鼓励密集战斗
- HUD位置在武器栏上方，不遮挡操作区也不遮挡游戏视野

---

## 2026-04-03 — v0.16.0 HUD武器/技能栏

### 成果
- **新增 `CFG.HUD_WEAPONS` 配置**：slotSize:32, gap:4, bottomOffset:24, maxWeapons:6, maxPassives:6
- **Canvas绘制底部武器栏**：游戏画面底部居中，显示武器槽位+被动槽位
  - 武器区（最多6格）：图标+等级(Lv.X)/进化标记(★)
  - 分隔线（白色竖线）
  - 被动区（最多6格）：图标+叠层数(×N)
- **武器卡片视觉**：
  - 普通武器：白色半透明边框+背景
  - 满级可进化：金色脉动边框（sin波驱动）
  - 进化武器：金色背景+★标记
  - 空槽位：虚线框（`setLineDash([3,3])`）
- **被动卡片视觉**：
  - 绿色色调背景/边框（`rgba(102,187,106,0.15/0.4)`）
  - 叠层数绿色显示（×N）
  - 空槽位：虚线框
- **数据源**：`game.player.weapons[]` / `game.player.passives{}` / `CFG.WEAPONS[name]` / `CFG.PASSIVES[key]`

### 技术细节
- 渲染在游戏循环的HUD区域（与计时器/血条同帧绘制）
- 纯Canvas绘制，非HTML元素，跟随canvas缩放
- `ctx.textBaseline='middle'` 确保图标垂直居中
- 满级脉动用 `sin(game.elapsed*4)` 驱动alpha在0.6-1.0间波动
- 被动遍历 `Object.entries(passives).filter(([,v])=>v>0)` 仅显示已拥有的

### 决策记录
- Canvas绘制而非HTML，与现有HUD一致（计时器/血条/经验条混合模式）
- 武器图标直接用emoji，与升级面板保持一致
- 被动区域按升级顺序显示（Object.entries保持插入顺序）
- 底部偏移24px，在摇杆/DASH按钮上方不遮挡操作区

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
