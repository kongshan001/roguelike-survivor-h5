# ES Module 拆分设计 — v1.0.0

> 日期: 2026-04-04
> 版本: v0.20.0 → v1.0.0
> 角色: 前端 Agent（架构决策需策划/QA确认）

## 背景

当前 `index.html` 为 2633 行单文件（HTML+CSS+JS），包含 48 个函数/类。随版本迭代持续增长，带来：
- Git 冲突风险高（所有改动集中在同一文件）
- 无模块作用域，全局变量污染
- 调试困难（无法按模块定位问题）

## 目标

将单 HTML 拆分为 ~25 个 ES Module 文件，零构建工具，浏览器原生 `<script type="module">` 加载。

## 目录结构

```
src/
├── main.js                 # 入口：import各模块，启动游戏
├── core/
│   ├── config.js           # CFG 全部常量（纯数据，零依赖）
│   ├── math.js             # V类 + rand/clamp/dist（纯函数）
│   └── save.js             # Save 存档系统
├── audio/
│   └── sfx.js              # SFX 音效系统 + screenShake + playerCrits
├── entities/
│   ├── player.js           # Player 类
│   ├── enemy.js            # Enemy 类（含所有类型的生成/行为逻辑）
│   ├── gem.js              # Gem 宝石
│   ├── food.js             # Food 食物
│   └── chest.js            # Chest 宝箱
├── weapons/
│   ├── weapon.js           # Weapon 基类
│   ├── holy-water.js       # HolyWater + ThunderHolyWater
│   ├── knife.js            # Knife + FireKnife
│   ├── lightning.js        # Lightning
│   ├── bible.js            # Bible + HolyDomain
│   ├── fire-staff.js       # FireStaff
│   ├── frost-aura.js       # FrostAura + Blizzard
│   └── registry.js         # WEAPON_CLASSES 注册表 + generateUpgrades
├── systems/
│   ├── camera.js           # Camera 类
│   ├── spawner.js          # getSpawnRate 敌人生成
│   └── damage-text.js      # 伤害飘字
├── ui/
│   ├── scenes.js           # showScene + 7个场景切换
│   ├── hud.js              # HUD Canvas渲染
│   ├── input.js            # 键盘/摇杆/触控
│   └── upgrade-panel.js    # 升级面板
└── game.js                 # Game 状态对象 + 主循环 loop()
```

## 参数注入方案

### 原则
- **消除全局变量**：`game`/`selectedChar`/`selectedDiff` 不再作为全局变量
- **构造函数注入**：依赖通过构造函数参数传入，存为实例属性
- **方法参数传递**：临时依赖通过方法参数传入

### 关键注入点

| 类 | 注入参数 | 替代全局 |
|----|---------|---------|
| Player | `cfg, charConfig, difficulty` | `CFG, selectedChar, selectedDiff` |
| Enemy | `cfg, type, difficulty, elapsed` | `CFG, ENEMY_TYPES, game.difficulty` |
| Camera | 构造时无参数，`w2s(wx,wy,canvas,shake)` | `game.shake` |
| Weapon | `owner, cfg` | `game.player` |
| SFX | 无变化（单例） | — |
| Game | `cfg, save, sfx, camera, spawner, ...` | 所有全局 |

### 全局变量迁移

| 原全局变量 | 迁移到 | 说明 |
|-----------|--------|------|
| `game` | `Game` 实例属性 | 主状态对象 |
| `selectedChar` | `Game.selectedChar` | 角色选择状态 |
| `selectedDiff` | `Game.selectedDiff` | 难度选择状态 |
| `canvas/ctx/mmCanvas/mmCtx` | `Game` 构造时获取 | Canvas 引用 |
| `key/joystickInput` | `Input` 模块 | 输入状态 |
| `joystickEl/knobEl/dashBtnEl` | `Input` 模块 | DOM 引用 |

## HTML 变化

```html
<!-- index.html 只保留 ~250行 HTML+CSS -->
<script type="module" src="src/main.js"></script>
```

- HTML 结构和 CSS 样式完全不变
- 所有 JS 从 `<script>` 内联改为 `src/main.js` 入口
- `onclick` 属性改为 `window.xxx` 导出或事件委托

## E2E 测试兼容性

- `http-server` 原生支持 ES Module（正确 MIME type）
- DOM 选择器不受影响
- 测试命令不变
- `serve` 命令不变

## 版本号

架构变更为主版本号：**v1.0.0**

## 依赖关系

```
main.js → game.js → {camera, spawner, entities, weapons, audio, ui}
                     camera → core/math
                     spawner → core/config, entities/enemy
                     entities → core/config, core/math, audio
                     weapons → core/config, core/math, entities
                     audio → core/config
                     ui → core/config, core/save, weapons/registry
```

所有依赖单向指向 core 层，无循环依赖。

## 风险与缓解

| 风险 | 缓解 |
|------|------|
| 拆分后功能回归 | 每个阶段拆分后运行 `npm test` |
| onclick 全局函数失效 | 使用 `window.xxx` 导出或改为 addEventListener |
| 模块加载顺序 | ES Module 静态分析保证顺序 |
| http-server 缓存 | 已有 `-c-1` 禁用缓存 |
