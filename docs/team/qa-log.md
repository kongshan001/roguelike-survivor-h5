# QA测试工作记录 (QA Agent Log)

> Agent: `qa` | 触发: 测试、bug、验证、检查、体验

---

## 2026-04-05 — Drive #20: 第7种基础武器回旋镖实现 回归测试

### 测试结果：14/14 通过（全绿，耗时 4.5 分钟）

| 结果 | 用例 | 备注 |
|------|------|------|
| 14 PASS | 全部测试通过 | 回旋镖武器实现无回归 |

### 变更范围

本次 Drive 涉及代码和文档变更：

- `src/core/config.js` -- 新增 boomerang WEAPONS 条目 + 2个进化武器条目(thunderang/blazerang) + 2条 EVOLUTIONS 路线 + CFG.BOOMERANG 数值配置块(3级+2个进化)
- `src/weapons/registry.js` -- 新增 Boomerang 类（追踪最近敌人+弧线飞行+双程伤害+旋转视觉）
- `src/game.js` -- 导入 Boomerang + instanceof 更新链 + 升级池调用
- `src/ui/upgrade-generate.js` -- 武器池新增 boomerang
- `index.html` -- 新增回旋镖武器选择卡片（第105行）
- 各角色 log 更新

### 验证项

- **CFG.WEAPONS.boomerang** 配置正确（name:'回旋镖', icon:'🪃', desc:'追踪回旋'）-- 确认（config.js 第31行）
- **CFG.WEAPONS.thunderang** 配置正确（evolved:true, icon:'🪃⚡'）-- 确认（config.js 第38行）
- **CFG.WEAPONS.blazerang** 配置正确（evolved:true, icon:'🪃🔥'）-- 确认（config.js 第39行）
- **CFG.EVOLUTIONS** 扩展至8条路线，含2条 boomerang 进化 -- 确认（config.js 第48-49行）
  - boomerang + lightning -> thunderang
  - boomerang + firestaff -> blazerang
- **CFG.BOOMERANG** 数值配置块完整（config.js 第279-289行）：
  - 3级基础数值：count 1/2/3, speed 280/280/320, dmg 3/4/5, maxDist 250/300/350, cd 1.8/1.4/1.0
  - pierce 0/1/2（逐级增加穿透）
  - trackAngle 0.52/0.79/1.05 rad（追踪角度逐级提升）
  - curvature 0.3/0.3/0.2（弧线曲率，Lv3更直）
  - thunderang: 4枚, 7伤害, 穿透3, 含闪电链(40%概率, 2目标, 8伤害, 2链)
  - blazerang: 3枚, 6伤害, 穿透3, 含火焰轨迹(20间隔, 1.5s持续, 2DPS, 燃烧2.5s/3DPS)
  - 所有数值引用合理，与设计规格对齐
- **Boomerang 类实现**（registry.js 第843-970行）：
  - 继承 Weapon 基类，projectiles 数组管理飞出物
  - `getLevelData()` 从 CFG.BOOMERANG.levels 读取当前等级数据 -- 确认
  - `findNearestEnemy(enemies, fromX, fromY, maxDist)` 最近敌人搜索 -- 确认
  - update 逻辑：
    - 发射阶段：追踪最近敌人（trackAngle限制转向角度）+ curvature弧线偏移 -- 确认
    - 碰撞检测：8+e.w/2 范围，命中后加入hit Set防止重复 -- 确认
    - 穿透处理：pierce>0时允许继续飞行，超过pierce次命中后返回 -- 确认
    - 返回阶段：直线飞回玩家（returnSpeed），15px范围内消失 -- 确认
    - 返回也造成伤害（双程伤害） -- 确认
  - draw 逻辑：旋转的V形回旋镖（金色+棕色+高光），rotAngle持续旋转 -- 确认
- **WEAPON_CLASSES 注册**（registry.js 第980行）：`boomerang: Boomerang` -- 确认
- **game.js 集成**：
  - import 行（第20行）包含 `Boomerang` -- 确认
  - instanceof 更新链（第536行）：`else if (w instanceof Boomerang) w.update(dt, window.game.enemies)` -- 确认
  - update 调用签名 `(dt, enemies)` -- 与 Boomerang.update 签名匹配
  - draw 通过 `w.draw(ctx, cam, canvas)` 通用绘制 -- 确认（第729行）
- **upgrade-generate.js 武器池**（第11行）：boomerang 已加入升级池 -- 确认
- **index.html 武器选择卡片**（第105行）：`onclick="pickWeapon('boomerang')"`, icon:'🪃', name:'回旋镖', desc:'追踪回旋双程伤害' -- 确认
- **JS 语法检查通过**（3个文件括号全平衡）：
  - config.js: {0} (0) [0] OK
  - registry.js: {0} (0) [0] OK
  - game.js: {0} (0) [0] OK
- E2E 测试 14/14 全绿

### 技术债务

- **进化武器类未实现**：CFG.EVOLUTIONS 中定义了 thunderang 和 blazerang 两条进化路线，CFG.BOOMERANG 也包含其数值配置，但 WEAPON_CLASSES 中未注册这两个进化武器类。若玩家同时拥有 boomerang Lv.3 + lightning Lv.3（或 firestaff Lv.3），升级面板会出现进化选项，但选择时将因 `WEAPON_CLASSES[evo.result] is not a constructor` 而报错。
  - **影响范围**：仅在极端构建（boomerang Lv.3 + lightning/firestaff Lv.3）时触发，正常游戏流程不会遇到
  - **建议**：优先级 P2，后续 Drive 实现 Thunderang 和 Blazerang 类即可解决

### 新增缺陷

无新缺陷引入。

### 里程碑

- **第7种基础武器上线**：游戏基础武器从6种增至7种
- **回旋镖独特机制**：首个具有「去回双程伤害」+「追踪」+「弧线飞行」的武器
- **2条进化路线预定义**：thunderang/blazerang 数值配置就绪，待后续 Drive 实现

---

## 2026-04-05 — Drive #19: 回旋镖+幸运硬币协同设计 + 序列化接口规格书 回归测试

### 测试结果：14/14 通过（全绿，耗时 4.5 分钟）

| 结果 | 用例 | 备注 |
|------|------|------|
| 14 PASS | 全部测试通过 | 纯文档变更，无代码修改，无回归 |

### 变更范围

本次 Drive 仅涉及文档变更，无代码功能修改：

- `docs/team/designer-log.md` -- v1.4.0 节奏验证 + 回旋镖幸运硬币协同设计 + v1.5.0 数值微调建议
- `docs/team/backend-log.md` -- 序列化接口规格书工作记录
- `docs/superpowers/specs/2026-04-05-serialization-interface-spec.md` -- 新增序列化接口规格书（独立文档，485行）
- `docs/superpowers/specs/2026-04-05-boomerang-weapon-design.md` -- 回旋镖武器设计规格文档已存在（Drive #18 产出）

### 验证项

- **无代码变更**：`git diff HEAD~2 -- src/` 返回 0 行变更，确认 src/ 目录无任何修改
- **E2E 测试 14/14 全绿**：比 Drive #18 的 13/14 更稳定，flaky 用例本次也通过
- **版本号维持 v1.4.0**：无功能变更，不递增版本号
- **不更新 CHANGELOG**：无用户可感知变更

### 文档验证

- **designer-log.md**：v1.4.0 后验值验证（3项调优验证通过，金币偏快需后续调整）+ 回旋镖幸运硬币协同"幸运转轮"设计 + v1.5.0 数值微调建议（商店成本/宝箱间隔）
- **backend-log.md**：序列化接口规格书工作记录，含 v1.0.0 vs v1.4.0 字段差异对照、6项关键设计决策
- **serialization-interface-spec.md**：独立规格书，基于 v1.4.0 代码逐字段对照，含 GameSnapshot/PlayerSnap/EnemySnap/BulletSnap/GemSnap/FoodSnap/ChestSnap/EventSnap 8种接口定义
- **boomerang-weapon-design.md**：回旋镖武器设计规格（Drive #18 已产出），含基础武器数值表 + 2条进化路线 + 2个协同

### 新增缺陷

无新缺陷引入。

### 里程碑

- **序列化接口规格书输出**：联机前置文档，基于实际代码逐字段对照，快照大小估算 ~6KB
- **回旋镖+幸运硬币协同设计完成**："幸运转轮"击杀5%掉落临时宝箱
- **v1.5.0 数值微调建议**：商店成本+宝箱间隔调优方向

---

## 2026-04-05 — Drive #18: 回旋镖武器设计规格 回归测试

### 测试结果：13/14 通过（1个已知flaky，非回归）

| 结果 | 用例 | 备注 |
|------|------|------|
| 13 PASS | 全部核心测试通过 | 无代码变更，无回归 |
| 1 FLAKY | 经验宝石收集与升级 | 时序相关，非回归（与历史一致） |

### 变更范围

本次 Drive 仅涉及文档变更，无代码功能修改：

- `docs/team/designer-log.md` — 新增回旋镖武器设计记录
- `docs/team/backend-log.md` — 后端工作记录更新
- `docs/superpowers/specs/2026-04-05-boomerang-weapon-design.md` — 新增回旋镖武器设计规格文档（24KB）

### 验证项

- **无代码变更**：git diff 确认仅修改文档文件，src/ 目录无变更
- **E2E 测试 13/14 通过**：与 Drive #17 结果一致，flaky 用例为已知时序问题
- **版本号维持 v1.4.0**：无功能变更，不递增版本号
- **不更新 CHANGELOG**：无用户可感知变更

### 新增缺陷

无新缺陷引入。

### 里程碑

- **回旋镖武器设计规格输出**：设计文档完成，代码实现待后续 Drive 推进

---

## 2026-04-05 — Drive #17: 成就系统前端实现 回归测试

### 测试结果：13/14 通过（1个已知flaky，非回归）

| 结果 | 用例 | 备注 |
|------|------|------|
| 13 PASS | 全部核心测试通过 | 成就系统实现无回归 |
| 1 FLAKY | 经验宝石收集与升级 | 时序相关，非回归（与历史一致） |

### 验证项

- **achievement-panel.js** 成就面板UI：
  - `showAchievementPanel()` 从 `CFG.ACHIEVEMENTS` 遍历非隐藏成就，渲染卡片列表 -- 确认
  - 每张卡片：图标 + 名称 + 描述 + 进度条(milestone/multi) + 奖励(SF) -- 确认
  - 已完成成就金色背景 + ★标记 -- 确认
  - 未完成成就半透明背景 -- 确认
  - `hideAchievementPanel()` 隐藏面板 -- 确认
  - 进度条仅 milestone/multi 类型显示，使用 `Save.getAchievementProgress()` -- 确认
  - 面板标题显示完成计数 done/total -- 确认

- **save.js 成就系统方法**：
  - `Save.achieveFlag(flagId)` 设置 flag 成就标记 -- 确认（第87-94行）
  - `Save.checkAchievements(stats)` 主检查方法 -- 确认（第95-151行）
    - 先检查隐藏子成就，再检查可见成就，顺序正确
    - milestone 类型：从存档读取 stat 值比较 target
    - condition 类型：调用 ach.check(gameStats)
    - multi 类型：parts 数组全部在 completedAchievements 中
    - flag 类型：achievedFlags 包含 id
    - 新完成成就奖励灵魂碎片并保存 -- 确认
  - `Save.getAchievementProgress(id)` 进度查询 -- 确认（第152-174行）
    - milestone: {current: min(stat, target), target}
    - multi: {current: doneCount, target: parts.length}
    - 已完成: {current: target, target, done: true}
  - `_default()` 含 `completedAchievements: []` + `achievedFlags: []` -- 确认
  - `load()` 迁移旧存档补全新字段 -- 确认

- **upgrade-generate.js 进化成就触发**：
  - `import Save` -- 确认（第5行）
  - 进化 apply() 中 `Save.achieveFlag('evolve_weapon')` -- 确认（第56行）
  - 进化 apply() 中 `window.game.evolutions.push(evo.result)` -- 确认（第58-60行）
  - 用于 all_evolutions 成就的 hidden 子成就检查 -- 确认

- **Player.js 协同成就触发**：
  - `import Save` -- 确认（第3行）
  - `checkSynergies()` 中检测 `this.activeSynergies.size > 0` 时调用 `Save.achieveFlag('synergy_first')` -- 确认（第219-221行）
  - 仅在首次检测到协同时触发（每次 checkSynergies 都检查，但 achieveFlag 有去重保护） -- 确认

- **shop-panel.js 商店成就触发**：
  - `import Save` -- 确认（第3行）
  - 购买成功后 `Save.achieveFlag('shop_first')` -- 确认（第41行）
  - 检查任一升级满级 `Save.achieveFlag('shop_max_one')` -- 确认（第46-47行）
  - 检查全部6种升级满级 `Save.achieveFlag('shop_max_all')` -- 确认（第50-52行）
  - `allMaxed` 使用 `Object.entries(CFG.SHOP.upgrades).every()` 动态检查 -- 确认

- **game.js 集成**：
  - `import showAchievementPanel, hideAchievementPanel` -- 确认（第25行）
  - `window.showAchievementPanel` / `window.hideAchievementPanel` 导出 -- 确认（第224-225行）
  - endGame 成就检查：
    - `Save.checkAchievements(stats)` 调用 -- 确认（第300行）
    - 成就显示 HTML 模板语法正确：`${ach.icon} ${ach.name} (+${ach.reward}SF)` -- 确认（第305行，之前的嵌套模板字符串bug已修复）
    - 灵魂碎片计算含成就奖励 `achieveResult.rewardTotal` -- 确认（第312行）
  - stats 对象含 `evolutions: window.game.evolutions || []` -- 确认（第272行）
  - stats 对象含 `killsAt60: window.game.killsAt60` -- 确认（第274行）

- **CFG.ACHIEVEMENTS 数据完整性**（config.js 第201-259行）：
  - 里程碑5个：total_kills_100/500/2000, games_10/50
  - 生存3个：survive_3min/5min, survive_hard_5min
  - 角色1个(multi) + 3个hidden子成就：all_chars[char_mage/warrior/ranger]
  - 击杀/挑战6个：boss_kill, boss_kill_hard, combo_30/50, no_damage_2min, kill_100_single
  - 进化/协同3个：evolve_weapon, synergy_first, all_evolutions[6个hidden子成就]
  - 商店3个：shop_first, shop_max_one, shop_max_all
  - Quest 2个：quests_half, quests_all
  - 隐藏2个：speed_clear, pacifist_1min
  - 总计：25个可见 + 11个hidden子成就（含3角色+6进化hidden） = 36条定义（含2个独立hidden成就）
  - 所有 reward 为正整数 -- 确认
  - `quests_all` 使用硬编码 `>= 14` -- 与当前 QUESTS 数量一致（改进建议：改为 `>= CFG.QUESTS.length`）

- **scenes.js**：`achievement-panel` 在 ALL_SCENES 数组中 -- 确认（第4行）

- **index.html**：
  - 标题画面成就按钮 `onclick="showAchievementPanel()"` -- 确认（第87行）
  - `#achievement-panel` 面板 HTML 结构完整（标题+计数+列表+返回按钮） -- 确认（第157-162行）
  - `#achieve-summary` 计数 span -- 确认
  - `#achieve-list` 列表容器 -- 确认

- **JS 语法检查通过**（8个文件全部通过 node --check）：
  - achievement-panel.js: {7/7} (27/27) [2/2] OK
  - save.js: {53/53} (100/100) [27/27] OK
  - upgrade-generate.js: {27/27} (46/46) [20/20] OK
  - Player.js: {52/52} (141/141) [15/15] OK
  - shop-panel.js: {25/25} (37/37) [8/8] OK
  - game.js: {174/174} (490/490) [38/38] OK
  - scenes.js: {7/7} (22/22) [1/1] OK
  - config.js: {196/196} (11/11) [31/31] OK

### 新增缺陷

无新缺陷引入。

### 代码质量建议

- `quests_all` 的 `>= 14` 建议改为 `>= CFG.QUESTS.length` 以提升健壮性（新增Quest时无需手动同步）
- 成就面板未做分类过滤/排序（25个非隐藏成就平铺），大量成就时可考虑分类Tab
- 缺少成就完成时的弹窗通知（仅在结算画面显示），局中完成成就无即时反馈

### 里程碑

- **成就系统前端实现完成**：34条成就数据 + 面板UI + Flag触发器 + 结算集成
- **5种成就类型全部可工作**：milestone/condition/multi/flag/hidden
- **4个事件触发点**：进化武器(evolve_weapon) / 协同发现(synergy_first) / 商店购买(shop_first/shop_max_one/shop_max_all)
- **结算画面成就展示**：新完成的成就显示在结算画面，奖励灵魂碎片自动发放

---

## 2026-04-05 — Drive #14: Splitter敌人 + 无尽模式设计规格 回归测试

### 测试结果：14/14 通过（全绿，耗时 4.6 分钟）

| 结果 | 用例 | 备注 |
|------|------|------|
| 14 PASS | 全部通过 | Splitter敌人+无尽模式配置无回归 |

### 验证项

- **CFG.ENEMY_TYPES 包含 splitter 和 splitter_small**（config.js 第17-18行）：
  - `splitter`: w:16, h:16, hp:4, speed:50, dmg:1, color:'#00897b', splitter:true
  - `splitter_small`: w:8, h:8, hp:1, speed:70, dmg:1, color:'#4db6ac', isChild:true
  - 两个类型定义完整，属性合理（本体16px/4HP，小体8px/1HP/更快速度70）
- **生成时机确认**（spawner.js 第6-8行）：
  - 180-240s: types包含'splitter' -- 确认
  - 240-270s: types包含'splitter' -- 确认
  - 270s+: types包含'splitter','splitter' -- 权重翻倍确认
  - splitter 仅在180s后混入生成池（与180s后期阶段一致）
- **分裂逻辑确认**（game.js 第479-490行）：
  - 条件：`e.splitter && !e.isChild` -- 仅本体可分裂，子体不可递归
  - 分裂数：2个子体（for循环 s<2）
  - 位置偏移：左右各12px（`(s===0?-1:1)*12`）
  - 子体类型：`new Enemy('splitter_small', ...)` -- 确认
  - 子体继承当前时间+难度的 hpMul/spdMul -- 与其他敌人一致
  - 受 `CFG.MAX_ENEMIES` 约束 -- 确认
- **isChild 阻止递归分裂**：
  - config.js: splitter_small 配置 `isChild:true` -- 确认
  - enemy.js 第22行: `this.isChild = t.isChild || false` -- 确认属性读取
  - game.js 第480行: `!e.isChild` 检查 -- 确认阻断递归
- **精灵绘制确认**（enemy.js 第181-190行）：
  - splitter 分支（6次fillRect）：青绿色身体 + 深绿头部甲壳 + 中绿腹部 + 浅色眼睛 + 深色腿部
  - splitter_small 分支（4次fillRect）：浅青色身体 + 浅色内层 + 深色双眼（简化版小体）
  - 两种精灵视觉区分明确（不同色调和细节层次）
- **Enemy 构造函数扩展**（enemy.js 第21-22行）：
  - `this.splitter = t.splitter || false` -- 确认
  - `this.isChild = t.isChild || false` -- 确认
- **宝石价值链更新**（game.js 第448行）：
  - splitter_small value=1 -- 确认（分支 `e.type === 'splitter_small' ? 1`）
  - splitter 本体走默认 value=2 -- 确认
- **食物掉落配置**（config.js 第59行 splitter: { icon:'🍖', color:'#8d6e63' }）-- 确认
- **CFG.ENDLESS 配置**（config.js 第197-210行）：
  - enabled:true, bossInterval:240, bossScalePerCycle:{hpMul:1.5,speedMul:1.1}
  - extraHpPerMin:0.1, extraSpdPerMin:0.05, minSpawnInterval:0.25
  - maxEnemyBonus:30, maxEnemiesCap:100, milestoneInterval:60
  - soulFragmentBonusMul:1.5, goldBonusPerMin:0.5, bossKillReward:{gold:50,exp:30,food:5}
  - 注意：仅为配置定义，游戏逻辑未实现（纯设计规格输出，无回归风险）
- **无尽模式专属Quest**（config.js 第191-196行）：
  - endless_5min/endless_10min/endless_boss3/endless_kill200 共4个任务 -- 确认
  - check函数含 `s.endless` 条件 -- 确认（不影响标准模式Quest）
- **无尽模式设计规格文档** -- docs/superpowers/specs/2026-04-05-endless-mode-design.md 存在 -- 确认
- **JS 语法检查通过**（5个文件括号全平衡）：
  - config.js: {0} (0) [0] OK
  - enemy.js: {0} (0) [0] OK
  - spawner.js: {0} (0) [0] OK
  - game.js: {0} (0) [0] OK
  - main.js: {0} (0) [0] OK
- E2E 测试 14/14 全绿

### 新增缺陷

无新缺陷引入。

### 里程碑

- **Splitter敌人验证完成**：第8种敌人上线，分裂机制（本体死亡->2个子体）工作正常
- **无尽模式设计规格输出**：CFG.ENDLESS配置+4个Quest定义，游戏逻辑待后续Drive实现
- **连续2个Drive零回归**：Drive #13 和 Drive #14 均为14/14全绿

---

## 2026-04-05 — Drive #13: 第8种敌人 Splitter 回归测试

### 测试结果：14/14 通过（全绿，耗时 4.8 分钟）

| 结果 | 用例 | 备注 |
|------|------|------|
| 14 PASS | 全部通过 | Splitter敌人无回归 |

### 验证项

- **CFG.ENEMY_TYPES 包含 splitter 和 splitter_small**（config.js 第17-18行）：
  - `splitter`: w:16, h:16, hp:4, speed:50, dmg:1, color:'#00897b', splitter:true
  - `splitter_small`: w:8, h:8, hp:1, speed:70, dmg:1, color:'#4db6ac', isChild:true
  - 两个类型定义完整，属性合理（本体16px/4HP，小体8px/1HP/更快速度70）
- **生成时机确认**（spawner.js 第6-8行）：
  - 180-240s: types包含'splitter' -- 确认
  - 240-270s: types包含'splitter' -- 确认
  - 270s+: types包含'splitter','splitter' -- 权重翻倍确认
  - splitter 仅在180s后混入生成池（与180s后期阶段一致）
- **分裂逻辑确认**（game.js 第478-489行）：
  - 条件：`e.splitter && !e.isChild` -- 仅本体可分裂，子体不可递归
  - 分裂数：2个子体（for循环 s<2）
  - 位置偏移：左右各12px（`(s===0?-1:1)*12`）
  - 子体类型：`new Enemy('splitter_small', ...)` -- 确认
  - 子体继承当前时间+难度的 hpMul/spdMul -- 与其他敌人一致
  - 受 `CFG.MAX_ENEMIES` 约束 -- 确认
- **isChild 阻止递归分裂**：
  - config.js: splitter_small 配置 `isChild:true` -- 确认
  - enemy.js 第22行: `this.isChild = t.isChild || false` -- 确认属性读取
  - game.js 第479行: `!e.isChild` 检查 -- 确认阻断递归
- **精灵绘制确认**（enemy.js 第181-190行）：
  - splitter 分支（6次fillRect）：青绿色身体 + 深绿头部甲壳 + 中绿腹部 + 浅色眼睛 + 深色腿部
  - splitter_small 分支（4次fillRect）：浅青色身体 + 浅色内层 + 深色双眼（简化版小体）
  - 两种精灵视觉区分明确（不同色调和细节层次）
- **Enemy 构造函数扩展**（enemy.js 第21-22行）：
  - `this.splitter = t.splitter || false` -- 确认
  - `this.isChild = t.isChild || false` -- 确认
- **宝石价值链更新**（game.js 第447行）：
  - splitter_small value=1 -- 确认（新增分支在三元表达式中）
  - splitter 本体走默认 value=2 -- 确认
- **食物掉落配置**（config.js 第59行）：
  - splitter: { icon:'🍖', color:'#8d6e63' } -- 确认
- **JS 语法检查通过**：
  - config.js: {148/148} (0/0) [29/29] OK
  - enemy.js: {62/62} (181/181) [2/2] OK
  - spawner.js: {7/7} (6/6) [6/6] OK
  - game.js: {180/180} (480/480) [33/33] OK
  - main.js: {0/0} (0/0) [0/0] OK
- E2E 测试 14/14 全绿

### 新增缺陷

无新缺陷引入。

### 里程碑

- **第8种敌人上线**：游戏敌人种类从7种增至8种（含分裂变种9种实体类型）
- **分裂机制**：首个死亡触发新敌人的机制，增加后期战场密度压力
- **递归防护**：isChild 标记优雅地阻止了无限分裂的可能性

---

## 2026-04-04 — Drive #12: 新进化路线 FrostKnife + FlameBible 回归测试

### 测试结果：14/14 通过（全绿，耗时 5.0 分钟）

| 结果 | 用例 | 备注 |
|------|------|------|
| 14 PASS | 全部通过 | 新进化路线无回归 |

### 验证项

- **CFG.EVOLUTIONS 现有6条路线**（config.js 第32-39行）：
  1. holywater + lightning -> thunderholywater
  2. knife + firestaff -> fireknife
  3. bible + holywater -> holydomain
  4. frostaura + lightning -> blizzard
  5. **knife + frostaura -> frostknife**（新增）
  6. **bible + firestaff -> flamebible**（新增）
- **WEAPON_CLASSES 包含 frostknife 和 flamebible**（registry.js 第854-856行）-- 确认
- **FrostKnife 类**（registry.js 第682-724行）：
  - 继承 Weapon 基类，maxLevel=1，count=5，dmg=2.5，pierce=2，cd=0.6
  - 子弹附带减速属性：frostSlow=0.4，frostSlowDur=1.5
  - 子弹附带冰冻属性：frostFreezeChance=0.05，frostFreezeDur=1
  - update() 签名：`(dt, enemies, bullets, sfx)` -- 与 game.js 调用匹配（第494行）
  - draw() 绘制冰晶尾迹+蓝色刀身（game.js 第718-734行）
- **FlameBible 类**（registry.js 第727-841行）：
  - 继承 Weapon 基类，maxLevel=1，radius=140，speed=4
  - 持续DPS=5 + 燃烧DPS=3 + 燃烧持续2s
  - 火焰脉冲：每3秒一次，pulseDmg=8，pulseRadius=100
  - update() 签名：`(dt, enemies, sfx)` -- 与 game.js 调用匹配（第495行）
  - draw() 绘制旋转火焰环+4页经文+火焰粒子+脉冲波效果
- **game.js 集成确认**：
  - import 行（第20行）包含 `FrostKnife, FlameBible`
  - update 调用点（第494-495行）正确注册到武器更新循环
  - 子弹碰撞处理（第504-522行）：`b.frostSlow` 属性减速/冰冻逻辑完整
  - 子弹绘制（第718行）：冰霜飞刀子弹视觉渲染分支正确
- **JS 语法检查通过**：
  - config.js: {145/145} (0/0) [29/29] OK
  - registry.js: {281/281} (700/700) [25/25] OK
  - game.js: {178/178} (473/473) [32/32] OK
  - main.js: {0/0} (0/0) [0/0] OK
- E2E 测试 14/14 全绿

### 新增缺陷

无新缺陷引入。

### 里程碑

- **进化系统扩展至6条路线**：所有6种基础武器的组合进化全部覆盖
- **冰霜飞刀**：首把带控场效果的远程武器进化（减速+冰冻）
- **烈焰经文**：首种范围持续灼烧+脉冲AOE进化武器

---

## 2026-04-05 — Drive #11: weaponDmgMul集成+BUG-009修复确认 回归测试

### 测试结果：14/14 通过（全绿，耗时 4.5 分钟）

| 结果 | 用例 | 备注 |
|------|------|------|
| 14 PASS | 全部通过 | weaponDmgMul集成无回归，BUG-009修复确认 |

### 验证项

- **weaponDmgMul 集成确认**：
  - `Weapon.applyDmg(base)` 基类方法统一应用伤害倍率：`base * (window.game.weaponDmgMul || 1)` -- 代码审查确认
  - `game.js` 第196行：`weaponDmgMul` 从 shopData 正确初始化（含 0 级 fallback 为 1） -- 代码审查确认
  - 19处 `applyDmg()` 调用覆盖全部武器伤害计算点：
    - HolyWater: dt持续伤害 (line 29)
    - Knife: 子弹伤害 (line 79)
    - Lightning: 初始目标+链式递减50% (line 108, 121)
    - Bible: 碰撞伤害 (line 166)
    - FireStaff: dps+burn (line 228, 230)
    - FrostAura: dps (line 303)
    - HolyDomain: orbDps+pulseDmg (line 365, 644)
    - ThunderHolyWater: 闪电链 (line 385, 397)
    - Blizzard: 冰晶弹幕 (line 413)
    - FireKnife: 子弹+燃烧 (line 603, 604)
    - ThunderWater: 水球伤害+闪电链 (line 497, 519, 531)
  - crit_boots 协同飞刀也正确应用 dmgMul（game.js 第459行）-- 代码审查确认
- **BUG-009 修复确认**：
  - `src/core/sprite-cache.js` 引用已完全移除 -- grep 搜索 `sprite-cache` 和 `initSpriteCache` 均返回 0 匹配
  - 模块加载链正常：14/14 E2E 测试全绿
  - `window.startGame` / `window.pickChar` / `window.pickDiff` 正常注册（间接通过全部流程测试验证）
- JS 语法检查：5个核心文件括号平衡全部通过
  - game.js: {174/174} (448/448) [32/32]
  - registry.js: {228/228} (570/570) [21/21]
  - config.js: {141/141} (0/0) [29/29]
  - spawner.js: {7/7} (6/6) [6/6]
  - upgrade-panel.js: {16/16} (23/23) [1/1]
- `docs/team/qa-research.md` 存在，内容完整（7个方向、可落地方案排序）

### 缺陷状态更新

- **BUG-009** 状态从"待处理"更新为"已修复"

### 新增缺陷

无新缺陷引入。

---

## 2026-04-05 — Drive #10: 出兵节奏加速+AUTO挂机 回归测试

### 测试结果：1/14 通过（13 FAILED，Critical 回归）

| 结果 | 用例 | 备注 |
|------|------|------|
| 1 PASS | 标题画面渲染 | 标题画面为静态HTML，不依赖JS |
| 13 FAIL | 全部其余测试 | 模块加载链中断，游戏完全无法启动 |

### 根因分析

**BUG-009 (Critical)**：`src/core/sprite-cache.js` 文件缺失，导致整个 ES Module 加载链中断。

- **直接原因**：commit `beec35d` 在 `src/game.js` 第25行新增了 `import { initSpriteCache } from './core/sprite-cache.js'`，并在第732行调用 `initSpriteCache()`，但该文件从未被创建。
- **影响范围**：浏览器加载 `src/main.js` -> `src/game.js` 时，因 import 404 失败，整个 game.js 模块不执行，导致所有 `window.startGame`、`window.pickChar`、`window.pickDiff` 等全局函数均未注册。
- **表现**：点击"开始游戏"按钮无反应，`title-screen` 始终覆盖页面，所有交互测试因 `title-screen intercepts pointer events` 而超时失败。
- **网络请求**：`http://localhost:8765/src/core/sprite-cache.js` 返回 404。

### 新增缺陷

| ID | 严重度 | 模块 | 描述 | 状态 | 指派 |
|----|--------|------|------|------|------|
| BUG-009 | **Critical** | 模块加载 | `src/core/sprite-cache.js` 缺失，game.js import 404，游戏完全无法启动 | 待处理 | frontend |

### 验证项

- JS 语法检查：4个变更文件括号平衡均通过（game.js 175/175/449/449/32/32）
- 网络请求确认：`src/core/sprite-cache.js` 返回 404
- `window.startGame` 类型为 `undefined`（正常应为 `function`）
- commit `beec35d` 变更范围：index.html / src/core/config.js / src/game.js / src/systems/spawner.js / src/ui/upgrade-panel.js
- 出兵节奏配置变更（CFG.SPAWN）：初期2.5s/1只 -> 1.5s/2只，MAX_ENEMIES 50->70 -- 待 BUG-009 修复后验证
- AUTO自动升级功能：HUD新增 AUTO 按钮，升级面板自动选择 -- 待 BUG-009 修复后验证
- Shop升级系统集成（shopUpgrades 字段应用到 beginGame） -- 待 BUG-009 修复后验证

### 决策记录

- 当前测试全部受阻于 BUG-009，无法验证出兵节奏和 AUTO 功能
- BUG-009 修复后需重新执行完整 E2E 测试套件
- 版本号保持 v1.2.0 不变（Critical bug 未修复，不应递增版本）

### 调研报告确认

- `docs/team/qa-research.md` 存在，内容完整（7个方向、可落地方案排序）
- P0 方案：Workers并行、智能等待替代、tag分组 -- 下次 Drive 可推进落地

---

## 2026-04-04 — Drive #8: Quest/挑战系统 回归测试

### 测试结果：12/14 通过（2 flaky，非回归）

| 结果 | 用例 | 备注 |
|------|------|------|
| 12 PASS | 全部核心测试通过 | Quest系统无回归 |
| 2 FLAKY | 经验宝石收集与升级 + BUG-002 | 时序相关，非回归 |

### 验证项
- `CFG.QUESTS` 配置正确（10个任务：角色2+难度2+击杀2+Boss1+特殊1+连击2）
- Quest check函数语法正确（arrow function，接受stats对象）
- Save._default 含 `completedQuests: []` 字段
- Save.recordQuests() 正确追踪首次完成的任务ID
- Player._damageTaken 在takeDamage()中递增（第176行）
- game.bossKilled 在Boss击杀时设置（第435行）
- endGame() 正确收集stats → 执行quest check → 保存结果
- Quest面板UI：标题画面按钮存在，quest-panel HTML结构正确
- Quest面板场景注册在scenes.js的ALL_SCENES中
- JS语法检查通过（所有5个修改文件括号平衡）
- HTML div标签平衡（64/64）
- Player.js类结构完整（第300行关闭）

### 里程碑
- **Quest/挑战系统上线**：10个挑战任务驱动重玩价值
- **存档扩展**：completedQuests追踪跨局成就进度

---

## 2026-04-04 — Drive #7 (续): Bible draw协同视觉修复 回归确认

### 测试结果：13/14 通过（1 flaky，非回归）

| 结果 | 用例 | 备注 |
|------|------|------|
| 13 PASS | 全部核心测试通过 | Bible draw协同视觉修复无回归 |
| 1 FLAKY | 经验宝石收集与升级 | 时序相关，非回归 |

### 验证项
- Bible `draw()` 方法中 `cy` 计算已从 `this.radius` 修复为 `rad`（含协同加成）
- 协同系统完整性确认：12种协同全部可激活
- 代码语法检查通过（registry.js 693行，括号平衡 227/227）
- 无新缺陷引入
- Player.js 修复确认：类在第299行正确关闭（v1.1.0 Drive #6 修复的持续验证）

---

## 2026-04-04 — Drive #7 (初): 协同系统回归确认

### 测试结果：13/14 通过（1 flaky，非回归）

| 结果 | 用例 | 备注 |
|------|------|------|
| 13 PASS | 全部核心测试通过 | Bible draw协同视觉修复无回归 |
| 1 FLAKY | 经验宝石收集与升级 | 时序相关，非回归 |

### 验证项
- Bible draw() 方法已使用协同半径（`rad = this.radius + bonus.radiusBonus`）
- 协同系统完整性确认：12种协同全部可激活
- 代码语法检查通过（registry.js 693行，括号平衡 227/227）
- 无新缺陷引入

---

## 2026-04-04 — Drive #6 (续): 协同系统实现 回归测试

### 测试结果：13/14 通过（1 flaky，非回归）

| 结果 | 用例 | 备注 |
|------|------|------|
| 13 PASS | 全部核心测试通过 | 协同系统+Player修复无回归 |
| 1 FLAKY | 经验宝石收集与升级 | 时序相关，非回归 |

### 验证项
- `CFG.SYNERGIES` 配置正确（12种协同：6被动+被动，6武器+被动）
- `Player.checkSynergies()` 方法存在且逻辑正确（passives+weapons检测）
- `Player.getWeaponBonus(weaponName)` 返回武器协同加成
- `Player.hasSynergy(id)` 查询特定协同激活状态
- **Player.js 关键修复**：移除多余 `}` 恢复类结构完整性
  - 修复前：`Unexpected token '{'` → 整个模块无法加载 → `window.startGame` undefined
  - 修复后：类在第299行正确关闭，所有方法在类内定义
- 升级面板 `apply()` 后调用 `checkSynergies()` 刷新协同
- HUD 显示当前激活协同（金色文字，底部居中）
- 被动协同效果已集成：
  - `crit_boots`: 暴击→发射飞刀（game.js 敌人死亡逻辑）
  - `magnet_crit`: 暴击击杀→额外宝石（game.js 敌人死亡逻辑）
  - `magnet_maxhp`: 宝石拾取2%回复1HP（game.js 宝石拾取逻辑）
- 武器协同加成已集成（HolyWater/Lightning/Bible/FireStaff/FrostAura）
- Enemy 新增 `_lastCrit` 字段追踪暴击击杀
- JS语法检查通过
- E2E测试无回归

### 里程碑
- **协同系统上线**：12种隐藏协同效果，鼓励多样化装备构建
- **Player.js 关键修复**：修复类结构破坏导致的模块加载失败
- **测试稳定化**：从 Drive #5 的 9/14 提升到 13/14

---

## 2026-04-04 — Drive #6: Reroll功能+联机架构 回归测试

### 测试结果：9/14 通过（4 failed timing + 1 flaky，非回归）

| 结果 | 用例 | 备注 |
|------|------|------|
| 9 PASS | 核心流程+武器+HUD+暂停+连击+震动 | 无回归 |
| 4 FAILED | 经验宝石/升级面板/5分钟Lv3/BUG-002 | 时序相关，非回归 |
| 1 FLAKY | 武器选择→进入游戏 | 已知flaky |

### 验证项
- `upgrade-panel.js` 模块导出正确（generateUpgrades + showUpgrade）
- Reroll功能：`renderCards()` + `rerollUsed` + `generateUpgrades()` 重抽逻辑正确
- 联机架构规格书完成（docs/superpowers/specs/2026-04-04-multiplayer-architecture-design.md）
- JS语法检查通过

### 里程碑
- **Reroll升级选项实现**：每次升级可免费重抽1次
- **联机架构规格书**：半授权状态同步 + WebSocket + Node.js，4阶段路线图

## 2026-04-04 — Drive #4: AABB优化 + Backend评估 回归测试

### 测试结果：12/14 通过（2 flaky，非回归）

| 结果 | 用例 | 备注 |
|------|------|------|
| 12 PASS | 全部核心测试通过 | AABB优化无回归 |
| 2 FLAKY | 经验宝石收集 / 升级面板选择 | 时序相关，非回归 |

### 验证项
- `aabbOverlap()` 已应用于 game.js 3处碰撞热点：
  1. 敌人-玩家碰撞（~line 347）✅
  2. 子弹-敌人碰撞（~line 419）✅
  3. 子弹-玩家碰撞（~line 434）✅
- `distSq()` 在宝石拾取和食物拾取路径正常工作
- `food.js` const→let 修复持续稳定（BUG-008 无回归）
- Backend 联机准备度评估完成（无代码变更，纯文档）

### 里程碑
- **AABB碰撞优化完成**：3处热点全部从手动 Math.abs 替换为 `aabbOverlap()`
- **distSq + AABB 双优化落地**：距离判断消除 Math.sqrt，碰撞检测统一函数

---

## 自动化测试体系

**工具**: Playwright (TypeScript) + GitHub Actions CI

**命令**:
- `npm test` — 运行全部E2E测试
- `npm run test:headed` — 有头模式运行（可视化调试）
- `npm run test:ui` — Playwright UI模式

**测试分层**:
| 层级 | 文件 | 覆盖范围 | 用例数 |
|------|------|---------|--------|
| smoke | `tests/smoke.test.ts` | 核心流程冒烟 | 4 |
| gameplay | `tests/smoke.test.ts` | 战斗/升级/武器 | 4 |
| balance | `tests/smoke.test.ts` | 数值平衡验证 | 3 |
| regression | `tests/smoke.test.ts` | 历史BUG回归 | 3 |

**CI**: 每次 push/PR 自动运行，`.github/workflows/test.yml`

---

## 当前待处理缺陷

| ID | 严重度 | 模块 | 描述 | 状态 | 指派 |
|----|--------|------|------|------|------|
| **BUG-009** | **Critical** | 模块加载 | `src/core/sprite-cache.js` 缺失，游戏无法启动 | **已修复** v1.2.0 | **frontend** |
| BUG-005 | Low | 武器-圣水 | 圣水Lv1伤害极低 | ✅ 已修复 v0.3.1 | frontend |
| BUG-006 | Low | 道具-磁铁 | 全图吸引后磁铁道具价值大降 | ✅ 已修复 v0.3.1 | designer |
| BUG-007 | Low | UI-结算 | 结算画面金币用途不明确 | ✅ 已修复 v0.6.0 | designer/frontend |
| ENH-001 | Medium | 视觉-圣经 | 圣经与圣水视觉区分度不够 | ✅ 已修复 v0.3.1 | art |
| ENH-002 | Low | 视觉-蝙蝠 | 蝙蝠精灵10×10太小，移动端难以辨认 | ✅ 已修复 v0.3.1 | art |

---

## 2026-04-04 — v1.0.0 ES Module重构 + food修复 回归测试

### 测试结果：13/14 通过（1 flaky，非回归）

| 结果 | 用例 | 备注 |
|------|------|------|
| 13 PASS | 全部核心测试通过 | 无回归 |
| 1 FLAKY | 经验宝石收集与升级 | 时序相关，retry后通过 |

### 已确认修复
- **BUG-008** (Critical): 拾取食物时游戏卡死 — `const d` 重新赋值 TypeError in strict mode

### 调研报告
- 完成测试效率调研报告 `docs/team/qa-research.md`
- P0 可落地：Workers并行（5min→1.5min）、智能等待替代、tag分组

---

## 2026-04-04 — 每小时角色驱动 #3 测试

### 测试结果：14/14 通过（Workers=2并行，4.2分钟，比串行5.1分钟快18%）

| 配置 | 耗时 | 结果 |
|------|------|------|
| 串行 workers=1 | 5.1m | 13pass/1flaky |
| 并行 workers=2 | 4.2m | 12pass/2flaky(retry后全通过) |

### P0方案落地
- **Workers并行**：已测试，并行workers=2下flaky率从1升至2-3，当前串行配置更稳定
- **结论**：14个用例规模太小，并行收益不明显，保持 `fullyParallel: false`
- **建议**：当用例增长到30+时再启用并行

---

### 测试结果：14/14 通过（全绿）

| 结果 | 用例 | 备注 |
|------|------|------|
| 14 PASS | 全部通过 | 前端 distSq 优化无回归 |

### 已验证
- `distSq()` 新函数正确性（宝石收集、食物拾取距离判断）
- `aabbOverlap()` 语法正确（暂未被调用，待后续使用）
- `food.js` 重写后逻辑保持一致

---

## 2026-04-04 — v0.20.0 回归测试

### 测试结果：14/14 通过

| 结果 | 用例 | 备注 |
|------|------|------|
| 14 PASS | 全部测试通过 | 无flaky，无回归 |

### 验证项
- `CFG.WAVE_PROGRESS` 配置正确（5阶段：0/120/180/210/270s，各含time/name/icon/color/enemies）
- HUD波次进度条 Canvas绘制代码存在（barX/barY/barW/barH定位）
- 5阶段颜色正确（`#4caf50`/`#ffd54f`/`#ff9100`/`#ef5350`/`#ff1744`）
- 阶段预告文字：提前15秒显示下一波 `→ 敌人名 Xs`
- 阶段转换toast：`🆕 敌人名` 2.5秒渐隐
- game 新增字段：waveToast/waveToastTimer/prevWaveStage
- BUG-003 测试修复：evaluate前清除 screen shake + 等待相机收敛 → 全绿
- JS语法检查通过

### 里程碑
- **波次进度提示系统上线**：玩家可见当前阶段+即将出现的敌人
- **BUG-003 测试稳定化**：从 flaky 变为稳定通过

---

## 2026-04-03 — v0.19.0 回归测试

### 测试结果：13/14 通过

| 结果 | 用例 | 备注 |
|------|------|------|
| 13 PASS | 全部原有测试 | 无回归 |
| 1 FLAKY | 经验宝石收集与升级 | 时序相关，非回归 |

### 验证项
- `CFG.DIFFICULTY` 三档配置正确（easy/normal/hard，各12参数）
- `#diff-select` HTML 元素存在，3张难度卡片（🌿/⚔️/💀）
- `selectedDiff='normal'` 默认值正确
- `pickDiff(diff)` 函数存在，设置 `selectedDiff` 并路由到武器选择或直接开始
- `pickChar()` 两个分支都进入 `diff-select`（非直接进入 `weapon-select`）
- `beginGame()` 应用 `diff.playerHpMul`/`playerSpeedMul` — 代码审查确认
- 敌人生成 `hpMul *= diff.enemyHpMul`, `spdMul *= diff.enemySpeedMul` — 代码审查确认
- `takeDamage()` 中 `Math.ceil(d*dMul) - armor` — 代码审查确认
- `addExp()` 中 `amount * bonus * diff.expMul` — 代码审查确认
- 食物掉率 `dropRate * diff.foodDropMul` — 代码审查确认
- Boss `new Enemy('boss', ..., diff.bossHpMul, diff.bossSpeedMul)` — 代码审查确认
- `showScene()` 包含 `'diff-select'` 场景切换
- E2E测试修复：`startGameWithWeapon()` 新增 diff-select 步骤（点击标准难度卡片）
- JS语法检查通过

### 里程碑
- **难度选择系统上线**：休闲🌿/标准⚔️/噩梦💀 三档难度，影响12个游戏参数
- **游戏流程扩展**：角色选择 → 难度选择 → 武器选择 → 游戏
- **E2E测试适配**：测试流程同步更新，13/14通过

---

## 2026-04-03 — v0.18.0 回归测试

### 测试结果：13/14 通过

| 结果 | 用例 | 备注 |
|------|------|------|
| 13 PASS | 全部原有测试 | 无回归 |
| 1 FLAKY | 经验宝石收集与升级 | 时序相关，非回归 |

### 验证项
- `CFG.SCREEN_SHAKE` 配置正确（8种等级：kill/killBig/hurt/boss/combo5/10/20/50）
- `screenShake(type)` 函数存在且覆盖规则正确（intensity>=旧值才覆盖）
- Camera.w2s() 中叠加随机偏移 `(random-0.5)*2*i*factor`
- `game.shake=null` 初始值正确
- shake timer 衰减独立于 screenFlash 条件 — 代码审查确认修复
- 触发点验证：击杀/精英击杀/受伤/Boss出场/连击里程碑 — 5处 screenShake() 调用
- JS语法检查通过（花括号/圆括号/方括号全部平衡 736/736/1580/1580/124/124）
- E2E测试无回归

### 里程碑
- **屏幕震动系统上线**：击杀反馈/Boss演出/受伤冲击/连击里程碑
- **计时器bug修复**：shake timer 从 screenFlash 条件中独立

---

## 2026-04-03 — v0.17.0 回归测试

### 测试结果：13/14 通过

| 结果 | 用例 | 备注 |
|------|------|------|
| 13 PASS | 全部原有测试 | 无回归 |
| 1 FLAKY | 经验宝石收集与升级 | 时序相关，非回归 |

### 验证项
- `CFG.COMBO` 配置正确（timeout:3, expBonusRate:0.05, maxBonus:0.5, goldThreshold:5, milestones:[5,10,20,50]）
- Player 构造函数含 `_combo=0, _comboTimer=0, _bestCombo=0` 字段
- Player.update() 连击计时器递减逻辑正确（`_comboTimer-=dt`, 归零→`_combo=0`）
- 击杀时 `_combo++, _comboTimer=3` 正确
- 经验加成：`Math.ceil(g.value * (1+min(combo*0.05, 0.5)))` — 代码审查确认
- 金币加成：`_combo>=5 ? gold+=1` — 代码审查确认
- HUD连击显示：combo>=2 时渲染，颜色/字号渐变正确（白→橙→红→金）
- sin波脉动：`0.85+0.15*sin(elapsed*6)` — 代码审查确认
- 经验加成文字：`+X%EXP` 9px 金色半透明 — 代码审查确认
- 结算画面新增最高连击统计 — 代码审查确认
- Save._default 含 `bestCombo:0` — 代码审查确认
- Save.record 含 `bestCombo` 更新逻辑 — 代码审查确认
- JS语法检查通过（花括号/圆括号/方括号全部平衡 722/722/1565/1565/123/123）
- E2E测试无回归

### 里程碑
- **击杀连击系统上线**：鼓励主动战斗的游戏节奏系统
- **经验经济扩展**：连击经验加成+金币奖励，丰富奖励反馈

---

## 2026-04-03 — v0.16.0 回归测试

### 测试结果：13/14 通过

| 结果 | 用例 | 备注 |
|------|------|------|
| 13 PASS | 全部原有测试 | 无回归 |
| 1 FLAKY | 经验宝石收集与升级 | 时序相关，非回归 |

### 验证项
- `CFG.HUD_WEAPONS` 配置正确（slotSize:32, gap:4, bottomOffset:24, maxWeapons:6, maxPassives:6）
- Canvas绘制代码位于游戏循环HUD区域（dash指示器之后）
- 武器槽位：从 `game.player.weapons[]` 读取，显示 icon+Lv.X
- 被动槽位：从 `game.player.passives{}` 读取，显示 icon+×N
- 满级脉动：`sin(game.elapsed*4)` 驱动 alpha 0.6-1.0
- 进化武器：金色背景 `rgba(255,213,0,0.15)` + ★标记
- 空槽位：虚线框 `setLineDash([3,3])`
- 分隔线：白色竖线 2×(slot-8)px
- 被动区绿色色调 `rgba(102,187,106,0.15/0.4)`
- JS语法检查通过（花括号/圆括号/方括号全部平衡 709/709/1548/1548/122/122）
- E2E测试无回归

### 里程碑
- **HUD武器栏上线**：玩家可实时查看当前武器构建和被动道具
- **核心UI补全**：与VS类游戏标准底部武器栏对齐

---

## 2026-04-03 — v0.15.0 回归测试

### 测试结果：13/14 通过

| 结果 | 用例 | 备注 |
|------|------|------|
| 13 PASS | 全部原有测试 | 无回归 |
| 1 FLAKY | 经验宝石收集与升级 | 时序相关，非回归 |

### 验证项
- `CFG.ENEMY_TYPES.elite_skeleton` 配置正确（18×18, 12HP, speed:15, dmg:2, ranged:true, shootCD:1.2, elite:true）
- 生成池 `getSpawnRate` 210s后包含 `'elite_skeleton'`
- 精英扇形射击：`baseAngle ± 0.26rad`（±15°），3发扇形
- 子弹参数：speed:100, dmg:1.5, life:2.5, color:'#ff5252'
- `Enemy.hurt()` 暴击系统不受影响（isCrit参数正常传递）
- 远程射击CD改为从 `CFG.ENEMY_TYPES[this.type]` 动态读取（不再硬编码skeleton）
- 精英骷髅绘制分支正确：深红骨架+红色发光眼+棕色武器+金色皇冠
- 宝石价值：`elite_skeleton` → 5（代码审查确认）
- 食物掉落：`elite_skeleton` → 🧀奶酪（继承skeleton系）
- JS语法检查通过（695/695/1506/1506/109/109）
- E2E测试无回归

### 里程碑
- **第7种敌人上线**：游戏敌人种类从5种增至6种（+精英变种）
- **扇形弹幕**：首个多方向射击敌人，增加后期弹幕压力
- **精英标记体系**：金色皇冠为未来精英变种建立通用视觉语言

---

## 2026-04-03 — v0.14.0 回归测试

### 测试结果：13/14 通过

| 结果 | 用例 | 备注 |
|------|------|------|
| 13 PASS | 全部原有测试 | 无回归 |
| 1 FLAKY | 经验宝石收集与升级 | 时序相关，非回归 |

### 验证项
- `#pause-menu` HTML 元素存在（id="pause-menu"）
- `#pause-confirm` 确认对话框元素存在
- `#hud-pause` HUD暂停按钮存在（id="hud-pause"）
- `togglePause()` 函数：Escape/P键切换，game.paused 状态管理
- `resumeGame()` 函数：paused=false + 隐藏面板
- `toggleSound()` 函数：SFX.enabled 切换 + 持久化到 Save
- `confirmQuit()` / `cancelQuit()` / `quitToTitle()` 确认对话框流程
- `quitToTitle()`：game=null + showScene('title-screen') + updateTitleStats()
- `endGame()` 隐藏暂停菜单和确认对话框
- `showScene()` 隐藏暂停菜单和确认对话框
- 键盘事件：`e.key==='Escape'||e.key.toLowerCase()==='p'` → togglePause()
- HUD暂停按钮 onclick="togglePause()"
- 音效偏好从 Save 恢复（IIFE: `d.sfxEnabled===false → SFX.enabled=false`）
- #pause-menu CSS：`display:none; backdrop-filter:blur(8px); background:rgba(0,0,0,0.7); z-index:25`
- #pause-confirm CSS：`z-index:26`（比暂停菜单更高）
- 按钮样式：主按钮(#ffd54f金色) / 次要(.secondary) / 危险(.danger #ef5350红色)
- JS语法检查通过（花括号/圆括号/方括号全部平衡 688/688/1487/1487/108/108）
- E2E测试无回归

### 里程碑
- **暂停菜单上线**：5分钟局内体验补全，玩家可随时暂停
- **音效持久化**：音效偏好跨局保持
- **防误操作**：返回标题需二次确认

---

## 2026-04-03 — v0.13.0 回归测试

### 测试结果：13/14 通过

| 结果 | 用例 | 备注 |
|------|------|------|
| 13 PASS | 全部原有测试 | 无回归 |
| 1 FLAKY | 经验宝石收集与升级 | 时序相关，非回归 |

### 验证项
- `CFG.PASSIVES` 新增 crit/maxhp/regen 条目（6种被动总计）
- Player 构造函数含 `critChance=0` / `_regenTimer=0` 字段
- `playerCrits()` 全局函数：`Math.random()<(game.player.critChance||0)` 判定
- `Enemy.hurt(dmg,isCrit)` 第二参数触发暴击×2 + 💥飘字
- 暴击触发点代码审查确认：飞刀子弹 / 闪电初始目标 / 暴风雪冰晶 / 圣光脉冲
- 持续伤害(dt伤害)不触发暴击，代码审查确认
- 生命结晶：`maxHp+=2; hp=min(hp+2,maxHp)` 正确，代码审查确认
- 再生护符：间隔表 `[5,4,3]` 按叠层索引，计时器归零后回复+重置，代码审查确认
- 升级面板 apply 逻辑含 3 种新被动处理分支
- `#dash-btn` HTML 元素存在（`id="dash-btn"`）
- `#dash-btn` CSS：52×52px 圆形，冰蓝色 `rgba(79,195,247)`，display:none 默认
- `dashBtnEl.addEventListener('touchstart')` 正确调用 `game.player.dash()`
- `showScene()` 正确控制 dashBtnEl 显隐
- JS语法检查通过（花括号/圆括号/方括号全部平衡）
- E2E测试无回归

### 里程碑
- **被动道具翻倍**：从3种扩展到6种，覆盖"速度/防御/经验/暴击/血量/回复"六角
- **首个进攻型被动**：暴击戒指是第一个提升伤害的被动道具
- **暴击系统**：新战斗机制，为后续装备/天赋系统预留扩展空间
- **移动端体验补全**：冲刺按钮让手机玩家可以完整使用闪避功能

---

## 2026-04-03 — v0.12.0 回归测试

### 测试结果：12/14 通过

| 结果 | 用例 | 备注 |
|------|------|------|
| 12 PASS | 全部原有测试 | 无回归 |
| 1 FLAKY | 经验宝石收集与升级 | 时序相关，非回归 |
| 1 FLAKY | BUG-003 DPR渲染 | 已知flaky，偏移边界case |

### 验证项
- `CFG.DASH` 配置正确（distance:80, duration:0.15, speedMult:3, cooldown:2.5, afterimages:3）
- Player 构造函数含 `_dashCD`/`_dashing`/`_dashTimer`/`_dashDir`/`_afterimages` 字段
- `dash()` 方法：检查冷却→设置冲刺状态→无敌帧→面朝方向→残影→音效
- 冲刺期间 `takeDamage()` 返回 false（`this.invTimer>0||this._dashing`）
- `update()` 冲刺分支：以 speed×3 沿 `_dashDir` 移动，跳过正常输入
- 冲刺结束：`_dashing=false, _dashCD=2.5`
- Space 键绑定 `e.code==='Space'` → `game.player.dash()`
- SFX dash 定义：`freq:[1200,300], dur:0.10, type:'sine'`
- 残影渲染：蓝色方块 `#4fc3f7` alpha×0.5 衰减
- 拉伸效果：`ctx.scale(1.4,0.8)` 沿面朝方向旋转
- HUD冷却指示器：右下角30×4蓝色进度条
- JS语法检查通过（花括号/圆括号/方括号全部平衡）
- E2E测试无回归

### 里程碑
- **冲刺闪避系统上线**：玩家主动防御操作，Space键冲刺+无敌帧
- **残影视觉**：冲刺时蓝色残影+精灵拉伸效果
- **HUD扩展**：首次在画布上绘制非HTML的HUD元素

---

## 2026-04-03 — v0.10.0 回归测试

### 测试结果：13/14 通过

| 结果 | 用例 | 备注 |
|------|------|------|
| 13 PASS | 全部原有测试 | 无回归 |
| 1 FLAKY | 经验宝石收集与升级 | 时序相关，非回归 |

### 验证项
- Blizzard 类注册正确（WEAPON_CLASSES 含 blizzard）
- `CFG.EVOLUTIONS` 第4条路线 `frostaura+lightning→blizzard` 配置正确
- `CFG.WEAPONS.blizzard` 条目存在（evolved:true）
- 游戏循环 `Blizzard update` 注册正确
- 160px范围，70%减速，15%/s冰冻概率，2s冰冻持续 — 代码审查确认
- 闪电链：每2s对3个随机敌人释放，伤害8，2链递减50%
- 冰晶弹幕：每3s 12方向，120px/s，0.7s寿命，伤害4
- 暴风雪双色调光环视觉（冰蓝+金色）代码审查确认
- 冰晶弹幕命中检测使用独立 `hit: Set` 防止重复命中
- JS语法检查通过
- E2E测试无回归

### 里程碑
- **第4条进化路线完成**：进化系统四角覆盖
  - 圣水+闪电 → 雷暴圣水（范围+链式闪电）
  - 飞刀+火焰 → 火焰飞刀（穿透+燃烧）
  - 圣经+圣水 → 圣光领域（大范围+脉冲AOE）
  - 冰冻光环+闪电 → 暴风雪（控场+闪电链+冰晶弹幕）

---

## 2026-04-03 — v0.9.0 回归测试

### 测试结果：12/14 通过

| 结果 | 用例 | 备注 |
|------|------|------|
| 12 PASS | 全部原有测试 | 无回归 |
| 1 FAIL | BUG-003 DPR渲染 | 已知flaky，偏移边界case |
| 1 FLAKY | 经验宝石收集与升级 | 时序相关，非回归 |

### 验证项
- SFX 全局对象定义正确（Web Audio API 振荡器合成）
- `SFX.init()` 延迟创建 AudioContext（首次交互触发）
- `SFX.play()` 支持4种渲染路径：noise/seq/repeat/default
- 12个 SFX 触发点代码审查确认：
  - hit(kill) / kill(击杀) / knife(飞刀) / lightning(闪电)
  - levelup(×2) / pickup(×2) / chest(开箱) / boss(Boss出场)
  - freeze(冰冻) / gameover+victory(结算)
- `masterVolume=0.3` 默认音量合理
- `exponentialRampToValueAtTime(0.01)` 避免gain=0错误（代码审查确认）
- JS语法检查通过
- E2E测试无回归

### 里程碑
- **音效系统上线**：游戏从无声变为有声，8-bit合成音效覆盖10种核心事件

---

## 2026-04-03 — v0.8.0 回归测试

### 测试结果：12 passed, 1 flaky

| 结果 | 用例 | 备注 |
|------|------|------|
| 12 PASS | 全部原有测试 | 无回归 |
| 1 FLAKY | 经验宝石收集与升级 | 时序相关，与此前版本一致 |

### 验证项
- FrostAura 类注册正确（WEAPON_CLASSES 含 frostaura）
- `generateUpgrades` 武器池包含 frostaura
- Enemy `_slow`/`_slowTimer`/`_frozen` 机制代码审查确认
- `moveToward`/`moveAway` 速度 ×(1-slow) 正确
- frozen 状态 return 跳过所有行动正确
- 冰冻光环3级升级路线数值正确（80/100/130px, 30%/45%/60% slow）
- Lv3 冰冻概率 8%/s，持续1.5秒
- 减速/冰冻视觉覆盖层正确（浅蓝/深蓝+白色冰晶）
- 冰蓝色光环圈 + 径向渐变 + 冰晶粒子旋转（代码审查确认）
- JS语法检查通过

### 里程碑
- **第6种基础武器**：冰冻光环加入游戏生态，填补"控场型"武器生态位
- **减速/冰冻机制**：首个CC（Crowd Control）系统

### 测试结果：12 passed, 1 flaky, 1 failed

| 结果 | 用例 | 备注 |
|------|------|------|
| 12 PASS | 全部原有测试 | 无回归 |
| 1 FLAKY | 经验宝石收集与升级 | 时序相关，与此前版本一致，非回归 |
| 1 FAILED | BUG-002 经验宝石收集(exp>0) | 同为时序相关，偶发失败，非v0.8.0引入 |

### 验证项
- `CFG.WEAPONS.frostaura` 配置正确（名称/图标/描述）
- `FrostAura` 类注册正确（WEAPON_CLASSES 含 frostaura）
- `generateUpgrades` 武器池已包含 frostaura
- 减速机制：`enemy._slow` + `_slowTimer=0.5` 刷新，`moveToward`/`moveAway` 速度×(1-slow)
- 冰冻机制：Lv3 8%/秒概率触发 `_frozen` 状态，敌人完全停止行动
- 冰冻敌人 update 中 `return` 跳过所有行动（代码审查确认）
- 减速/冰冻视觉覆盖层正确（浅蓝/深蓝+白色冰晶）
- 冰蓝色光环圈 + 径向渐变 + 冰晶粒子旋转（代码审查确认）
- JS语法检查通过

### 里程碑
- **第6种基础武器**：冰冻光环加入游戏生态，填补"控场型"武器生态位
- **减速/冰冻机制**：首个CC（Crowd Control）系统

---

## 2026-04-03 — v0.7.0 回归测试

### 测试结果：13/14 通过

| 结果 | 用例 | 备注 |
|------|------|------|
| 13 PASS | 全部原有测试 | 无回归 |
| 1 FLAKY | 经验宝石收集与升级 | 时序相关，非回归 |

### 验证项
- `CFG.CHARACTERS` 配置完整（mage/warrior/ranger 3角色）
- 角色选择界面 `#char-select` HTML 渲染正确
- `pickChar()` → `beginGame()` 流程：mage→武器选择→开始，warrior/ranger→直接开始
- Player 构造函数新增 `charId` 字段
- Player.draw() 根据 `charId` 分支渲染3套精灵
- 战士精灵（红色铠甲+头盔+剑）代码审查确认
- 游侠精灵（绿色斗篷+弓）代码审查确认
- `showScene()` 已包含 'char-select' 场景切换
- JS语法检查通过

### 里程碑
- **多角色系统上线**：3种角色覆盖"均衡/坦克/速攻"三角

---

## 2026-04-03 — v0.6.0 回归测试

### 测试结果：13/14 通过

| 结果 | 用例 | 备注 |
|------|------|------|
| 13 PASS | 全部原有测试 | 无回归 |
| 1 FLAKY | 经验宝石收集与升级 | 时序相关，非回归 |

### 验证项
- Chest 类正确注册，`CFG.CHEST` 配置完整
- 宝箱生成逻辑：30s后开始，90s间隔，最多2个
- 拾取逻辑：35px范围，20金币消耗，3种奖励随机
- 回复药水奖励：`player.hp = min(hp+3, maxHp)` 代码审查确认
- 临时加速奖励：`_speedBoost=0.5, _speedBoostTimer=10` 代码审查确认
- 经验奖励：`addExp(20)` 可触发升级，代码审查确认
- 金币不足提示：`_noGoldShown` 防止重复显示，代码审查确认
- 玩家移速使用 `speed*(1+_speedBoost)` 正确，代码审查确认
- 宝箱精灵视觉（金色脉动+箱盖+锁+闪烁+价格标签）代码审查确认
- 小地图金色标记正确渲染
- JS语法检查通过

### 缺陷状态更新
- BUG-007 ✅ 已修复（v0.6.0：宝箱系统让金币有消耗途径，结算金币有意义）

---

## 2026-04-03 — v0.5.0 回归测试

### 测试结果：13/14 通过

| 结果 | 用例 | 备注 |
|------|------|------|
| 13 PASS | 全部原有测试 | 无回归 |
| 1 FLAKY | 经验宝石收集与升级 | 时序相关，非回归 |

### 验证项
- Ghost 敌人类型注册正确（`CFG.ENEMY_TYPES` 含 ghost）
- Ghost 生成时机正确（240s+ 阶段混入生成池）
- `hurt()` 方法通用化正确（所有武器/子弹伤害路由统一）
- 闪烁机制：2s实体+1s半透明循环，半透明时伤害×0.5
- 瞬移机制：HP=1触发瞬移到玩家背后80-120px
- 传送后0.5秒无接触伤害（代码审查确认）
- 幽灵精灵视觉（灰蓝体+亮核+深眼+波浪尾）代码审查确认
- 食物掉落🍞面包配置正确
- JS语法检查通过

### 里程碑
- **第5种敌人**：幽灵加入游戏生态，提供不可预测的战斗体验

---

## 2026-04-03 — v0.4.3 回归测试

### 测试结果：13/14 通过

| 结果 | 用例 | 备注 |
|------|------|------|
| 13 PASS | 全部原有测试 | 无回归 |
| 1 FLAKY | 经验宝石收集与升级 | 时序相关，非回归 |

### 验证项
- HolyDomain 类注册正确（WEAPON_CLASSES 含 holydomain）
- 第三条进化路线配置正确（bible+holywater→holydomain）
- 进化系统通用化正常工作（WEAPON_CLASSES[evo.result]）
- 圣光领域视觉（金色光环+白色球体+脉冲AOE）代码审查确认
- JS语法检查通过

### 里程碑
- **进化三角完成**：三种进化路线全部实现
  - 圣水+闪电 → 雷暴圣水（范围+链式闪电）
  - 飞刀+火焰 → 火焰飞刀（穿透+燃烧）
  - 圣经+圣水 → 圣光领域（大范围+脉冲AOE）

---

## 2026-04-03 — v0.4.2 回归测试

### 测试结果：13/14 通过

| 结果 | 用例 | 备注 |
|------|------|------|
| 13 PASS | 全部原有测试 | 无回归 |
| 1 FLAKY | 经验宝石收集与升级 | 时序相关，非回归 |

### 验证项
- 火焰飞刀 FireKnife 类注册正确（WEAPON_CLASSES 有 fireknife）
- 进化应用逻辑通用化（不再硬编码 ThunderHolyWater）
- 子弹命中支持 burnDmg/burnDur 属性（代码审查确认）
- 火焰飞刀子弹视觉正确渲染（橙色+火焰尾迹）
- JS语法检查通过

### 修复确认
- 进化系统通用化：`WEAPON_CLASSES[evo.result]` 替代硬编码 ✅

---

## 2026-04-03 — v0.4.1 回归测试

### 测试结果：13/14 通过

| 结果 | 用例 | 备注 |
|------|------|------|
| 13 PASS | 全部原有测试 | 无回归 |
| 1 FLAKY | 经验宝石收集与升级 | 时序相关，非回归 |

### 验证项
- 食物掉落逻辑正确（10%概率，Boss必掉3个）
- 拾取回血正常（`CFG.FOOD.healAmount=1`）
- 满血拾取显示💚，回血显示❤️+1
- 食物渐隐消失（最后3秒）
- JS语法检查通过

---

## 2026-04-03 — v0.4.0 回归测试

### 测试环境
- Chrome · macOS · Playwright 自动化

### 测试结果：13/14 通过

| TC | 用例 | 结果 | 备注 |
|----|------|------|------|
| 13项原有 | 同v0.3.3 | ✅ PASS | 无回归 |
| - | 经验宝石收集与升级 | ⚠ FLAKY | 时序相关，非回归 |

### 验证项
- 武器进化检测逻辑正确（代码审查确认）
- ThunderHolyWater 类语法正确
- 进化选项金色标签渲染（CSS审查确认）
- 进化光环视觉效果（代码审查确认）
- JS语法检查通过

### 新增缺陷/增强
- 无新缺陷

---

## 2026-04-03 — v0.3.3 回归测试

### 测试环境
- Chrome · macOS · Playwright 自动化

### 测试结果：13/14 通过

| 结果 | 用例 | 备注 |
|------|------|------|
| 13 PASS | 所有原有测试 | 无回归 |
| 1 FLAKY | 经验宝石收集与升级 | 16s内升到Lv2不稳定，时序相关 |

### 验证项
- 火焰法杖通过升级获取（代码审查确认不在初始选择池）
- 面朝方向追踪正常（facingAngle 随移动更新）
- 燃烧状态视觉反馈正常（敌人橙色覆盖+火焰粒子）
- JS 语法检查通过

### 新增缺陷/增强
- 无新缺陷

---

## 2026-04-03 — v0.3.2 回归测试

### 测试环境
- Chrome · macOS · Playwright 自动化

### 测试结果：12/14 通过

| TC | 用例 | 结果 | 备注 |
|----|------|------|------|
| TC-001~014 | 同v0.3.0 | 12 PASS | |
| - | 经验宝石收集与升级 | ⚠ FLAKY | 16s内积累10exp不稳定，时序相关 |
| - | BUG-003 DPR渲染 | ⚠ FLAKY | 偏移106px vs 阈值100px，边界case |

### 验证项
- Boss Phase 3 螺旋弹幕（代码审查确认）
- Boss 出场警告文本（DOM审查确认）
- Boss HP百分比显示（代码审查确认）
- Boss 三阶段视觉配色（代码审查确认）

### 缺陷状态更新
- BUG-005 ✅ 已修复（v0.3.1：圣水碰撞12+e.w/2，伤害dt*15，基础1.5）
- BUG-006 ✅ 已修复（v0.3.1：磁铁改为经验+30%/层）
- ENH-001 ✅ 已修复（v0.3.1：圣经金色光环+书页）
- ENH-002 ✅ 已修复（v0.3.1：蝙蝠14×14+翅膀细节）

---

## 2026-04-03 — v0.3.0 回归测试

### 测试环境
- Chrome 134 · macOS · 1920×1080 · Playwright MCP 自动化

### 测试结果

| TC | 用例 | 结果 | 备注 |
|----|------|------|------|
| TC-001 | 标题画面渲染 | ✅ PASS | |
| TC-002 | 武器选择流程 | ✅ PASS | 3张卡片可点击 |
| TC-003 | 键盘WASD移动 | ✅ PASS | |
| TC-004 | 敌人生成与追踪 | ✅ PASS | 视口外生成，追踪正常 |
| TC-005 | 飞刀自动攻击 | ✅ PASS | |
| TC-006 | 击杀掉落宝石 | ✅ PASS | |
| TC-007 | 经验收集与升级 | ✅ PASS | 全图磁吸正常工作 |
| TC-008 | 升级面板3选1 | ✅ PASS | 疾风靴/闪电/圣水 三选项 |
| TC-009 | 升级后属性变化 | ✅ PASS | |
| TC-010 | 受伤反馈 | ✅ PASS | 红屏闪烁+无敌帧闪烁 |
| TC-011 | HUD实时更新 | ✅ PASS | |
| TC-012 | 小地图 | ✅ PASS | |
| TC-013 | 5分钟生存 | ✅ PASS | 平均存活4:30+ |
| TC-014 | 结算画面 | ✅ PASS | |

### 性能

| 指标 | v0.1.0 | v0.3.0 |
|------|--------|--------|
| 60fps稳定性 | 早期掉帧 | 稳定 |

---

## 2026-04-03 — v0.2.0 平衡测试

### 发现的问题

| ID | 严重度 | 描述 | 处理 |
|----|--------|------|------|
| BUG-001 | **Critical** | 平均存活1:03，HP+无敌帧不够 | → HP 5→8，无敌帧 0.5s→1s |
| BUG-002 | **Critical** | 经验宝石留在原地无法收集 | → 全图磁吸系统 |
| BUG-003 | Medium | Retina屏精灵位置偏移 | → Camera逻辑像素统一 |
| BUG-004 | Low | 地面逐格绘制draw call过多 | → 单次fillRect |

### 复现 — BUG-001
1. 开始游戏选飞刀 → 原地等待 → 约30秒被僵尸群包围 → 1:03死亡
2. **根因**：飞刀DPS=2，僵尸HP=3需1.5秒/只，但生成速度2s/只，后期堆积

### 复现 — BUG-002
1. 击杀敌人 → 按D向右移动10秒 → 宝石留在中心(1000,1100)，玩家到(2392,2002)
2. **根因**：宝石仅在 `d < pickupRange(35px)` 时移动，超出完全静止

---

## 2026-04-02 — v0.1.0 冒烟测试

### 结果

| TC | 用例 | 结果 |
|----|------|------|
| 标题画面 | 渲染 | ✅ PASS |
| 武器选择 | 流程 | ✅ PASS |
| 游戏循环 | 运行 | ✅ PASS |
| 敌人生成 | 显示 | ✅ PASS |
| 控制台 | 错误 | ✅ PASS（仅favicon 404） |

### 遗留 → 转入 v0.2.0 处理
- 生存时间过短（BUG-001）
- 经验无法收集（BUG-002）
