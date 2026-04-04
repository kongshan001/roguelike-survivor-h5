# ES Module 拆分实施计划 — v1.0.0

> 日期: 2026-04-04
> 设计文档: docs/superpowers/specs/2026-04-04-es-module-refactor-design.md
> 原则: 每步可测试，不破坏游戏，逐步迁移

## 前置条件

- [x] 设计文档已确认
- [x] 用户选择: src/目录 + 参数注入 + 细粒度拆分

## 实施阶段

### Phase 1: 基础层（纯函数/纯数据，零依赖）

无风险层：这些模块不依赖任何其他模块，是纯函数或纯数据。

**Step 1.1: 创建目录结构 + core/math.js**
- 创建 `src/`, `src/core/`, `src/audio/`, `src/entities/`, `src/weapons/`, `src/systems/`, `src/ui/`
- 提取 `V` 类 + `rand()`, `randInt()`, `clamp()`, `dist()` → `src/core/math.js`
- export: `{ V, rand, randInt, clamp, dist }`

**Step 1.2: core/config.js**
- 提取 `CFG` 常量对象 → `src/core/config.js`
- 包含: MAP_W, MAP_H, GAME_TIME, PLAYER_SIZE, PICKUP_RANGE, EXP_TABLE, ENEMY_TYPES, WEAPONS, PASSIVES, EVOLUTIONS, DIFFICULTY, CHARACTERS, SFX, SCREEN_SHAKE, COMBO, DASH, DASH_BTN, HUD_WEAPONS, WAVE_PROGRESS, CHEST, FOOD, GEM_FLY_SPEED, MAX_BULLETS, CVV
- export: `{ CFG }`

**Step 1.3: core/save.js**
- 提取 `Save` 对象 → `src/core/save.js`
- export: `{ Save }`

**验证点 1**: 在 index.html 中添加 `<script type="module">` 测试 import，确认模块加载正常。不改动原有代码。

### Phase 2: 独立系统层

**Step 2.1: audio/sfx.js**
- 提取 `SFX` 对象 → `src/audio/sfx.js`
- 提取 `screenShake()` 函数 → `src/audio/sfx.js`
- 提取 `playerCrits()` 函数 → `src/audio/sfx.js`
- import: `{ CFG }` from config
- export: `{ SFX, screenShake, playerCrits }`

**Step 2.2: systems/camera.js**
- 提取 `Camera` 类 → `src/systems/camera.js`
- import: 无（w2s 接收 shake 参数）
- export: `{ Camera }`

**Step 2.3: systems/damage-text.js**
- 提取伤害飘字逻辑 → `src/systems/damage-text.js`
- export: `{ updateDmgTexts, drawDmgTexts }` 或封装为 `DamageTextSystem` 类

### Phase 3: 实体层

**Step 3.1: entities/gem.js + entities/food.js + entities/chest.js**
- 提取 `Gem` 类 → `src/entities/gem.js`
- 提取 `Food` 类 → `src/entities/food.js`
- 提取 `Chest` 类 → `src/entities/chest.js`
- 各自 import: `{ CFG }`, `{ V, dist }` 按需
- 参数注入: 构造函数接收 difficulty/cfg 等

**Step 3.2: entities/enemy.js**
- 提取 `Enemy` 类 → `src/entities/enemy.js`
- import: `{ CFG }`, `{ V, dist }`, `{ SFX }`
- 参数注入: `Enemy(cfg, type, difficulty, elapsed)`
- 包含所有 7 种敌人类型的行为（boss/ghost/elite 等）
- export: `{ Enemy }`

**Step 3.3: entities/player.js**
- 提取 `Player` 类 → `src/entities/player.js`
- import: `{ CFG }`, `{ V }`, `{ SFX }`, `{ screenShake }`
- 参数注入: `Player(cfg, charConfig, difficulty)`
- export: `{ Player }`

### Phase 4: 武器层

**Step 4.1: weapons/weapon.js（基类）**
- 提取 `Weapon` 基类 → `src/weapons/weapon.js`
- export: `{ Weapon }`

**Step 4.2: weapons/holy-water.js + knife.js + lightning.js**
- `HolyWater` + `ThunderHolyWater` → `src/weapons/holy-water.js`
- `Knife` + `FireKnife` → `src/weapons/knife.js`
- `Lightning` → `src/weapons/lightning.js`
- 各自 import: `{ Weapon }`, `{ CFG }`, `{ V, dist }` 按需

**Step 4.3: weapons/bible.js + fire-staff.js + frost-aura.js**
- `Bible` + `HolyDomain` → `src/weapons/bible.js`
- `FireStaff` → `src/weapons/fire-staff.js`
- `FrostAura` + `Blizzard` → `src/weapons/frost-aura.js`

**Step 4.4: weapons/registry.js**
- 提取 `WEAPON_CLASSES` + `generateUpgrades()` → `src/weapons/registry.js`
- import: 所有武器类
- export: `{ WEAPON_CLASSES, generateUpgrades }`

### Phase 5: UI 层

**Step 5.1: ui/input.js**
- 提取键盘/摇杆/触控输入 → `src/ui/input.js`
- export: `{ initInput, getInput }`

**Step 5.2: ui/scenes.js**
- 提取 `showScene()` + 7个场景切换 → `src/ui/scenes.js`
- export: `{ showScene }`

**Step 5.3: ui/upgrade-panel.js**
- 提取升级面板渲染逻辑 → `src/ui/upgrade-panel.js`
- export: `{ showUpgrade }`

**Step 5.4: ui/hud.js**
- 提取 HUD Canvas 绘制 → `src/ui/hud.js`
- export: `{ drawHUD }`

### Phase 6: 游戏主体 + 入口

**Step 6.1: systems/spawner.js**
- 提取 `getSpawnRate()` → `src/systems/spawner.js`
- export: `{ getSpawnRate }`

**Step 6.2: systems/wave-progress.js**
- 提取波次进度提示逻辑 → `src/systems/wave-progress.js`
- export: `{ updateWaveProgress, drawWaveProgress }`

**Step 6.3: game.js**
- 提取 `Game` 状态对象 + `loop()` → `src/game.js`
- import: 所有模块
- 参数注入: 构造 Game 对象时注入所有依赖
- export: `{ Game }`

**Step 6.4: main.js（入口）**
- 创建入口文件 → `src/main.js`
- import: `{ Game }`, `{ CFG }`, `{ Save }`, `{ SFX }`, `{ initInput }`, `{ showScene }`
- 初始化各系统，启动游戏
- 处理 `onclick` 全局函数导出（`window.startGame`, `window.pickWeapon` 等）

**Step 6.5: 清理 index.html**
- 删除内联 `<script>` 中的所有 JS 代码
- 添加 `<script type="module" src="src/main.js"></script>`
- HTML 和 CSS 完全保留

### Phase 7: 验证与版本发布

**Step 7.1: 运行 E2E 测试**
- `npm test` 验证 14 个用例全部通过
- 修复任何回归问题

**Step 7.2: 更新文档**
- 更新 `docs/VERSION` → `1.0.0`
- 更新 `docs/CHANGELOG.md`
- 更新 `docs/team/frontend-log.md`
- 更新 `CLAUDE.md` 文件结构规范

**Step 7.3: Git 提交推送**
- `feat(frontend): ES Module 架构重构 v1.0.0`

## 风险控制

每个 Phase 完成后运行 `npm test`，出现回归立即修复再继续。Phase 1-4 可以渐进式迁移（新文件与旧代码共存），Phase 6 是切换点。

## onclick 处理策略

HTML 中的 `onclick="startGame()"` 等调用需要访问全局函数。在 main.js 中：

```javascript
// main.js
import { startGame, pickChar, pickDiff, pickWeapon, togglePause, ... } from './game.js';

// 导出给 HTML onclick 使用
window.startGame = startGame;
window.pickChar = pickChar;
window.pickDiff = pickDiff;
window.pickWeapon = pickWeapon;
window.togglePause = togglePause;
// ...
```

或者更好的方式：改为 `addEventListener` 绑定，移除所有 `onclick` 属性。推荐后者但可分步进行。
