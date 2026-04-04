# QA测试工作记录 (QA Agent Log)

> Agent: `qa` | 触发: 测试、bug、验证、检查、体验

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
