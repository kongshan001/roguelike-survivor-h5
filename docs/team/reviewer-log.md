# 审核人工作记录

---

## 当前优先级

| 优先级 | 事项 | 目标角色 | 状态 |
|--------|------|----------|------|
| P0 | game.js 245-246行重复调用 showJoystick(true) | frontend | 待修复 |
| P0 | game.js 主循环臃肿 940行，职责过多需拆分 | frontend | 评估中 |
| P1 | registry.js 回旋镖系三子类大量重复飞行/返回/追踪逻辑 | frontend | 待重构 |
| P1 | game.js 伤害文本渲染与 game.js:914-924 和 damage-text.js 双重实现 | frontend | 待统一 |
| P1 | 多处硬编码数值未引用 CFG 常量 | frontend | 待修复 |
| P1 | 升级面板音效按钮文案错误 | frontend | 待修复 |
| P1 | E2E 测试敌人上限断言使用 50 而非 CFG.MAX_ENEMIES(70) | qa | 待修复 |
| P2 | ARCHITECTURE.md 目录结构缺少 skill-panel.js / achievement-panel.js | frontend | 待更新 |
| P2 | damage-text.js 模块导出但 game.js 未使用其函数 | frontend | 待清理 |
| P2 | Camera.w2s 每次调用读取 devicePixelRatio，应缓存 | frontend | 待优化 |

---

## 2026-04-06 -- 首次全项目审核 v1.6.2

### Critical（必须修复）

1. **game.js:245-246 重复调用 `showJoystick(true)`** -> @frontend -- `src/game.js:245-246` -- 连续两行完全相同的 `if (isMobile) showJoystick(true);`，属复制粘贴遗留，会导致移动端摇杆初始化重复执行。

2. **升级面板音效按钮文案错误** -> @frontend -- `src/game.js:104` -- `soundBtnEl.textContent = SFX.enabled ? '🔊 音效：关' : '🔇 音效：关'`，两个分支都显示"关"，SFX.enabled=true 时应显示"音效：开"。

3. **game.js 主循环过于庞大** -> @frontend -- `src/game.js` 全文 945 行 -- 单文件承担了：游戏状态管理、主循环（update + render）、敌人击杀逻辑（含宝石/食物/协同效果掉落）、子弹碰撞、宝箱交互、无尽模式 Boss 生成、结算统计、标题画面逻辑。击杀逻辑（534-643行）单段 110 行，包含了宝石掉落、金币计算、协同判定、食物掉落、分裂虫逻辑，可读性极差，应拆分为独立模块（如 `systems/kill-handler.js`）。

4. **E2E 测试敌人上限断言错误** -> @qa -- `tests/smoke.test.ts:231` -- `expect(state.enemies).toBeLessThanOrEqual(50)` 但 `CFG.MAX_ENEMIES = 70`，断言值与实际配置不一致，可能导致超出 50 但仍在 70 上限内的合法状态被误报为失败。

5. **ARCHITECTURE.md 目录结构与代码不同步** -> @frontend -- `docs/ARCHITECTURE.md:36-50` -- 目录结构缺少 `src/ui/skill-panel.js` 和 `src/ui/achievement-panel.js`，且第 37 行描述 registry.js 为"12个武器类（6基础+6进化）"但实际为 15 个类（7基础+8进化）。架构文档的模块依赖图（第 86-87 行）也缺少 `skill-panel.js` 和 `achievement-panel.js` 节点。

### Medium（建议优化）

6. **回旋镖系三子类代码大量重复** -> @frontend -- `src/weapons/registry.js` Boomerang(854-989), Thunderang(992-1159), Blazerang(1162-1340) -- 三者共享几乎完全相同的飞行逻辑：发射（找最近敌人 + 发射角度）、追踪（trackAngle 偏转 + curvature 弧线）、返回（计算方向 + 返回速度）、碰撞检测（AABB 判定 + hit set）。Thunderang 和 Blazerang 的 update 方法分别有 ~95 行和 ~135 行，其中 70%+ 为重复代码。建议将飞行/返回/追踪逻辑提取到 `BoomerangBase` 中间基类或混入。

7. **伤害文本系统双重实现** -> @frontend -- `src/systems/damage-text.js` 导出 `updateDmgTexts()` 和 `drawDmgTexts()`，但 `src/game.js:914-924` 直接内联实现了完全相同的逻辑（遍历 dmgTexts、递减 life、上移 y、渲染文字），且 `damage-text.js` 从未被 import。要么使用该模块替代内联代码，要么删除此模块。

8. **多处硬编码数值未引用 CFG** -> @frontend -- 具体位置：
   - `src/entities/enemy.js:30` -- 远程敌人保持距离 `250` 和 `150` 应提取为 `CFG.ENEMY_TYPES[type].keepDist` / `fleeDist`
   - `src/entities/enemy.js:36` -- 敌人子弹速度 `120` 应提取为 `CFG.ENEMY_TYPES[type].bulletSpeed`
   - `src/entities/enemy.js:44` -- 精英子弹伤害 `1.5` 和子弹属性（w:6, h:6, life:3）硬编码
   - `src/entities/enemy.js:80` -- Boss 弹幕子弹属性（vx/vy 速度 100/80, life 2/3, dmg 1）全部硬编码
   - `src/game.js:452` -- 无尽模式 maxEnemies 计算公式直接内联，应提取为 `CFG.ENDLESS` 下的配置方法或常量
   - `src/game.js:671` -- 子弹颜色 `b.color === '#ffd54f'` 作为玩家/敌对判定标识，脆弱且不直观，应改为 `b.friendly` 布尔标记

9. **Camera.w2s 每帧每调用读取 devicePixelRatio** -> @frontend -- `src/systems/camera.js:10` -- 每帧被调用数百次（每个敌人、宝石、子弹、武器特效各调 1-3 次），每次都执行 `window.devicePixelRatio || 1`。应在 resize 事件中缓存 DPR 值到 Camera 实例属性。

10. **Bible.hitTimers 内存泄漏风险** -> @frontend -- `src/weapons/registry.js:184-186` -- 清理逻辑 `for (const [e] of this.hitTimers) { if (!enemies.includes(e)) this.hitTimers.delete(e); }` 使用 `enemies.includes(e)` 是 O(n) 操作，且在敌人数量多时每帧执行。当敌人被击杀后引用从 game.enemies 移除但 GC 未回收时，WeakRef/复活引用问题可能导致 hitTimers 增长。FlameBible(771-773) 也有相同问题。

11. **Player._regenTimer 初始化逻辑问题** -> @frontend -- `src/entities/Player.js:132-141` -- `_regenTimer` 初始为 0，所以 `if (this._regenTimer > 0)` 首次为 false，意味着没有 regen 被动时不会进入分支，但首次获得 regen 被动时 `_regenTimer` 仍为 0 直到 `upgrade-generate.js:43` 设置。如果玩家通过其他方式（如将来新增的道具）获得 regen，计时器不会被初始化。

12. **game.js endGame 函数中重复调用 Save.load()** -> @frontend -- `src/game.js:298,312,315,328,360` -- `endGame()` 内多次调用 `Save.load()` 从 localStorage 读取数据，每次都解析 JSON。应一次读取、复用引用。第 360 行 `const completedQuestsCount = (Save.load().completedQuests || []).length` 在第 328 行之后，完全可以用已有变量。

13. **game.js 局部变量遮蔽外层变量** -> @frontend -- `src/game.js:459` -- `const dc2 = CFG.DIFFICULTY[window.game.difficulty]` 与第 456 行的 `dc` 完全相同，冗余声明；`src/ui/shop-panel.js:45` -- 函数参数遮蔽外层 `u` 和 `su` 变量。

14. **测试缺少关键场景覆盖** -> @qa -- `tests/smoke.test.ts` -- 以下场景无覆盖：
   - 冲刺（Dash）系统：Space 键闪避 + 无敌帧验证
   - Boss 出现和击杀流程
   - 无尽模式（endless）
   - 回旋镖武器（boomerang）
   - 进化系统（武器进化触发和替换）
   - 宝箱交互（购买和奖励）
   - 暂停/继续
   - 协同系统
   - 商店和成就面板
   - 幽灵（ghost）/分裂虫（splitter）敌人特殊行为
   - 连击系统（combo milestone）

15. **测试时序依赖导致 flaky** -> @qa -- `tests/smoke.test.ts` -- 多个测试使用 `waitForTimeout` 固定等待然后断言状态（如 `balance -- 数值平衡` 全组、`BUG-001` 等），在 CI 环境中受机器性能影响。建议：
   - 使用 `page.waitForFunction()` 轮询条件而非固定等待
   - 平衡测试改为验证"在 N 秒内至少达到 Lv3"而非"移动 M 秒后检查等级"

### Low（锦上添花）

16. **V 类 norm() 分配临时对象** -> @frontend -- `src/core/math.js:8` -- `norm()` 每次调用创建新 V 对象，在热路径（如每帧创建子弹方向向量）中产生 GC 压力。建议提供 `normInPlace()` 变体或使用内联计算。

17. **升级面板 reroll 后可能生成重复选项** -> @frontend -- `src/ui/upgrade-panel.js:46-49` -- reroll 调用 `generateUpgrades()` 生成新随机池，但没有任何机制防止生成与之前相同的选项。用户体验上，花一次 reroll 可能得到完全一样的选择。

18. **敌人生成位置可能过于密集** -> @frontend -- `src/game.js:464` -- 生成位置使用 `player.x + cos(angle) * rand(250, 400)`，多敌人同一帧生成时可能出现在极近位置（角度相近 + 距离相近），导致瞬间视觉堆叠。建议对同批生成的敌人角度做均匀分布。

19. **食物图标使用 emoji 在不同平台渲染不一致** -> @art -- `src/core/config.js:64-70` -- 食物类型使用 emoji（🍖🍇🧀🍞）作为图标，在 Canvas 中通过 `fillText` 绘制。不同操作系统/浏览器对 emoji 的渲染大小和对齐方式不同，可能导致视觉不一致。与项目"像素风 fillRect 绘制"的规范冲突。

20. **Save 版本迁移策略过于简单** -> @frontend -- `src/core/save.js:30` -- `if (d.version !== CFG.SAVE.version) return this._default()` 直接丢弃旧版本存档。未来版本迭代时应实现增量迁移而非重置。

21. **window.game 全局状态模式** -> @backend -- `src/game.js:48` -- `window.game = null` 作为全局游戏状态，被 4 个文件共 227 处引用。当前对联机构架扩展不友好：难以支持多实例、状态同步、服务端渲染验证。建议评估依赖注入或事件总线模式。

### 按角色汇总建议

#### -> 策划 (designer)

- **数值平衡审计**：当前 EXP_TABLE 前 9 级阈值经过调优（降低 15-20%），但后期 Lv10-14（108/132/160/195/240）跨度较大（Lv13->14 需 240 经验），建议验证后期升级频率是否满意
- **武器差异化**：6 种基础武器特色鲜明（环绕/投射/闪电/AOE/锥形/光环），但进化武器中 FireKnife 和 FrostKnife 高度相似（都是多发投射+穿透），建议增加机制差异（如 FrostKnife 的冰墙或 FireKnife 的爆炸）
- **被动 maxStack=3 累积效果**：LuckyCoin 每 stack +50% 暴伤 +15% 金币，3 叠 = +150% 暴伤 +45% 金币，效果极强。建议评估与其他被动满叠效果的平衡性对比
- **难度曲线**：Easy 的 `spawnIntervalMul:1.4` 和 Hard 的 `spawnIntervalMul:0.7` 差距为 2 倍，但 Hard 的 `enemyHpMul:1.5` + `enemyDmgMul:1.5` 叠加后整体难度跳跃约为 Easy 的 3.4 倍，曲线较陡
- **无尽模式数值**：`extraHpPerMin: 0.1` 即每分钟敌人 HP +10%，10 分钟后 HP x2，20 分钟后 x3。结合 `bossScalePerCycle.hpMul: 1.5`（每轮 Boss HP x1.5），第 3 轮 Boss HP = 200 x 1.5^3 x (1 + 16*0.1) = 2700，可能过高

#### -> 前端 (frontend)

- **立即修复**：game.js:245-246 重复 showJoystick 调用；game.js:104 音效按钮文案
- **高优先级重构**：将 game.js 击杀逻辑拆分为 `systems/kill-handler.js`；将回旋镖系公共逻辑提取到基类
- **清理**：删除或启用 `damage-text.js`；消除 `endGame()` 中重复的 `Save.load()` 调用
- **硬编码清理**：将 enemy.js 中的远程射击参数提取到 CFG；将子弹敌我判定改为布尔标记
- **性能**：缓存 DPR 到 Camera 实例；评估 Bible.hitTimers 清理策略改用 WeakSet
- **架构文档**：同步 ARCHITECTURE.md 目录结构和武器数量描述

#### -> 美术 (art)

- **食物视觉规范**：当前食物使用 emoji fillText（非 fillRect 像素风），与项目视觉规范不一致。建议改为 fillRect 绘制的像素风食物图标
- **敌人颜色一致性**：ghost 敌人使用 `#b0bec5`（蓝灰）和 `#eceff1`（亮灰），在深色地面 `#2e7d32` 上辨识度偏低，建议增加边缘高亮或轮廓线
- **Boss Phase 区分度**：Phase 1/2/3 的颜色变化（红->橙->品红）在快速战斗中可能不够明显，建议增加体形变化（如 Phase 3 时宽度+4px）或添加视觉标记

#### -> QA (qa)

- **修复 E2E 断言**：`smoke.test.ts:231` 敌人上限 50 应改为 70（`CFG.MAX_ENEMIES`）
- **扩展测试覆盖**：新增 Dash、Boss、无尽模式、进化、宝箱、暂停、协同系统、回旋镖、连击、商店成就等场景
- **消除 flaky 测试**：用 `waitForFunction` 替代固定 `waitForTimeout`，减少 CI 环境依赖
- **测试辅助**：新增 `setGameState()` helper 用于直接设置游戏状态（如直接触发 Boss、设置特定武器组合），减少等待时间

#### -> 后端 (backend)

- **全局状态耦合**：`window.game` 全局对象 227 处引用，对联机架构中的状态同步和确定性模拟构成障碍。建议评估引入状态管理层（如事件溯源或 Command 模式）
- **缺少确定性随机**：当前使用 `Math.random()`，联机模式下无法保证两端一致。建议评估引入 seeded PRNG
- **缺少帧同步基础**：主循环使用 `requestAnimationFrame` + 可变 dt，联机模式需要固定时间步（Fixed Timestep）。`src/game.js:395` 的 `Math.min(dt, 0.05)` 是时间步上限但不是固定步长
- **缺少序列化层**：游戏状态（window.game）直接包含类实例、函数引用、DOM 引用等，无法直接序列化。需要提取纯数据 DTO 层
