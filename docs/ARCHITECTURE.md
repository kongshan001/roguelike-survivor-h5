# 肉鸽幸存者 — 项目架构设计

> 版本: v1.2.1 | 最后更新: 2026-04-05 | 架构迭代: #3

---

## 1. 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| 渲染 | Canvas 2D + DPR适配 | 纯fillRect像素风，零外部图片 |
| 模块 | ES6 Modules (native) | 零构建工具，浏览器原生import |
| 音频 | Web Audio API | 8-bit程序化音效生成 |
| 输入 | Keyboard + Touch Joystick | 桌面键盘 + 移动端虚拟摇杆 |
| 存储 | localStorage | JSON序列化，版本号迁移 |
| 测试 | Playwright E2E | 14个测试用例，CI自动运行 |

---

## 2. 目录结构

```
h5_demo/
├── index.html                      # 唯一HTML入口（UI + CSS + module加载）
├── src/
│   ├── main.js                     # 入口：import './game.js'
│   ├── game.js                     # 主循环 + 游戏状态 + 渲染 (~800行)
│   │
│   ├── core/                       # 核心基础设施
│   │   ├── config.js               # CFG常量表（武器/敌人/升级/任务/商店）
│   │   ├── math.js                 # V向量类 + 工具函数
│   │   └── save.js                 # localStorage持久化系统
│   │
│   ├── entities/                   # 游戏实体
│   │   ├── Player.js               # 玩家（移动/伤害/协同/连击）
│   │   ├── enemy.js                # 敌人（7种类型 + Boss AI）
│   │   ├── gem.js                  # 经验宝石
│   │   ├── food.js                 # 治疗食物
│   │   └── chest.js                # 宝箱（金币购买）
│   │
│   ├── weapons/                    # 武器系统
│   │   └── registry.js             # 12个武器类（6基础+6进化）
│   │
│   ├── systems/                    # 引擎系统
│   │   ├── camera.js               # DPR感知相机（w2s/s2w投影）
│   │   ├── spawner.js              # 出兵节奏曲线
│   │   └── damage-text.js          # 浮动伤害数字
│   │
│   ├── audio/                      # 音频
│   │   └── sfx.js                  # 音效 + 屏幕震动 + 暴击判定
│   │
│   └── ui/                         # UI面板
│       ├── input.js                # 输入管理（键盘+摇杆+Dash）
│       ├── scenes.js               # 场景切换管理
│       ├── hud.js                  # HUD渲染（Canvas绘制）
│       ├── upgrade-panel.js        # 升级选择面板
│       ├── upgrade-generate.js     # 升级选项池生成
│       ├── quest-panel.js          # 挑战任务面板
│       └── shop-panel.js           # 永久升级商店
│
├── tests/
│   └── smoke.test.ts               # Playwright E2E测试
│
└── docs/                           # 文档系统
    ├── ARCHITECTURE.md             # 本文件
    ├── VERSION                     # 版本号
    ├── CHANGELOG.md                # 变更记录
    └── team/                       # 各角色工作记录
```

---

## 3. 模块依赖关系

```
                    index.html
                        │
                    src/main.js
                        │
                    src/game.js  ◄── 全局调度中心
                   ╱    │    ╲
        ┌─────────╱─────┼─────╲──────────┐
        │        ╱      │      ╲          │
    entities  weapons  systems  ui      core
        │        │       │      │        │
        └────────┴───────┴──────┴────────┘
                          │
                    core/config.js  ◄── 所有模块共享
                    core/math.js
                    core/save.js
```

### 详细依赖图

```
game.js
  ├── core/config.js        (CFG)
  ├── core/math.js          (V, rand, clamp, dist, distSq, aabbOverlap)
  ├── core/save.js          (Save)
  ├── audio/sfx.js          (SFX, screenShake, playerCrits)
  ├── systems/camera.js     (Camera)
  ├── systems/spawner.js    (getSpawnRate)
  ├── entities/Player.js    (Player)
  ├── entities/enemy.js     (Enemy)
  ├── entities/gem.js       (Gem)
  ├── entities/food.js      (Food)
  ├── entities/chest.js     (Chest)
  ├── ui/input.js           (initInput, getInput, isMobile)
  ├── ui/scenes.js          (showScene)
  ├── ui/hud.js             (drawHUD)
  ├── ui/upgrade-panel.js   (showUpgrade, generateUpgrades)
  ├── ui/quest-panel.js     (showQuestPanel, hideQuestPanel)
  ├── ui/shop-panel.js      (showShopPanel, hideShopPanel)
  └── weapons/registry.js   (WEAPON_CLASSES + 12个武器类)

upgrade-panel.js → upgrade-generate.js → config.js + math.js + registry.js
quest-panel.js   → config.js + save.js
shop-panel.js    → config.js + save.js
enemy.js         → config.js + math.js
Player.js        → config.js + math.js
sfx.js           → config.js
damage-text.js   → camera.js
```

---

## 4. 游戏主循环架构

```
requestAnimationFrame(loop)
    │
    ├── Δt 计算（上限50ms防跳帧）
    │
    ├── ═══ UPDATE（非暂停时） ═══
    │   ├── elapsed += dt
    │   ├── Boss生成检查（270s）
    │   ├── 输入处理 → player.update(dt, input)
    │   ├── camera.follow(player) → camera.update(dt)
    │   ├── 敌人生成（spawner → enemy数组）
    │   ├── 宝箱生成
    │   ├── 敌人更新循环
    │   │   └── enemy.update(dt, player, bullets)
    │   ├── 碰撞检测
    │   │   ├── 玩家 vs 敌人 → takeDamage
    │   │   └── 敌人 vs 子弹 → hurt(applyDmg)
    │   ├── 武器更新循环
    │   │   └── weapon.update(dt, enemies, bullets, sfx, critFn)
    │   ├── 子弹更新 + 出界清理
    │   ├── 宝石更新（磁吸+拾取+经验+升级检查）
    │   └── 食物更新
    │
    └── ═══ RENDER ═══
        ├── 地面（地图+网格线批量绘制）
        ├── 宝石/食物/宝箱
        ├── 敌人（+状态特效：burn/frost/frozen）
        ├── 玩家（+冲刺残影）
        ├── 武器视觉效果
        ├── 子弹
        ├── 伤害数字
        ├── 屏幕闪光/震动
        └── HUD（计时器/等级/金币/HP/经验条/协同）
```

---

## 5. 数据流

### 5.1 游戏流程

```
标题画面 → 角色选择 → 难度选择 → 武器选择 → 游戏主循环 → 结算
                │                          │              │
            charId              shopUpgrades应用    Quest检查 + SF结算
            difficulty          weaponDmgMul       Save.record
```

### 5.2 升级数据流

```
player.addExp(gemValue)
    → exp >= EXP_TABLE[level] → levelUp = true
    → generateUpgrades(player) → 3个选项
    → showUpgrade(choices, game) → 面板暂停游戏
    → 玩家选择 → choice.apply()
        → 新武器/武器升级/被动道具/进化武器
        → player.checkSynergies() → 更新activeSynergies
    → 恢复游戏
```

### 5.3 伤害数据流

```
weapon.update() 创建子弹/范围伤害
    → bullet.hit(enemy) 或 area.hit(enemy)
    → enemy.hurt(dmg, isCrit)
        → 暴击判定: critChance × weaponBonus
        → 伤害 = base × weaponDmgMul × critMul
        → hp -= dmg, 伤害数字浮出
    → hp <= 0 → 死亡
        → kills++, combo++
        → 掉落gem + food
        → screenShake
        → 协同触发 (crit_boots飞刀, magnet_crit额外宝石)
        → Boss击杀 → endGame(true)
```

### 5.4 存档数据流

```
┌─────────────────────────────────────────────┐
│ localStorage 'roguelike_survivor_save'      │
│ {                                           │
│   version: 1,                               │
│   bestScore, bestTime, totalKills,          │
│   gamesPlayed, bestCombo,                   │
│   completedQuests: [...],                   │
│   soulFragments: 0,                         │
│   shopUpgrades: {maxhp:0, speed:0, ...},   │
│   characters: {mage:{}, warrior:{}, ranger:{}}│
│ }                                           │
└──────────────┬──────────────────────────────┘
               │
    ┌──────────┼──────────┐
    ▼          ▼          ▼
 beginGame   endGame    面板UI
 (读取应用)  (写入记录)  (读写展示)
```

---

## 6. 系统架构

### 6.1 武器系统

```
              Weapon (基类)
                │ applyDmg(base) → base × weaponDmgMul
     ┌──────────┼──────────┐
  基础武器×6    进化武器×6
     │              │
  HolyWater    ThunderHolyWater  (holywater+lightning)
  Knife        FireKnife         (knife+firestaff)
  Bible        HolyDomain        (bible+holywater)
  FireStaff    FlameBible        (bible+firestaff)
  FrostAura    Blizzard          (frostaura+lightning)
  Lightning    FrostKnife        (knife+frostaura)
```

### 6.2 协同系统

```
Player.activeSynergies: Set<string>
    │
    ├── 被动+被动 (6种)
    │   crit_boots      → 暴击发射飞刀
    │   armor_maxhp     → 护甲效果翻倍
    │   magnet_crit     → 暴击额外宝石
    │   boots_regen     → 移动时再生翻倍
    │   armor_regen     → 低HP临时护甲+3
    │   magnet_maxhp    → 宝石2%回血
    │
    └── 武器+被动 (6种)
        holywater_maxhp → 半径+30%
        knife_crit      → 飞刀可暴击
        lightning_magnet→ 链+1,射程+50
        bible_boots     → 速度×1.5,范围+20
        firestaff_armor → 锥形+40px,点燃+1s
        frost_regen     → 冰冻+5%/s,冰冻+0.5s
```

### 6.3 出兵节奏

```
时间轴 (0 ────────────── 300s)
│僵尸│ │+蝙蝠│ │+骷髅幽灵│ │+精英+分裂虫│ │Boss│
│2s/2│ │1.5s/2│ │1.0s/3│ │0.7s/3│0.5s/4│0.4s/4│
└─────┴──────┴────────┴──────────┴──────┘
     60s      120s      180s       240s    270s
```

---

## 7. UI架构

```
                    ┌─────────┐
                    │ scenes  │ ←── 场景管理器
                    │.showScene│
                    └────┬────┘
         ┌───────┬───────┼───────┬───────┐
         ▼       ▼       ▼       ▼       ▼
    title   char/diff  game   upgrade  result
    screen  /weapon    HUD    panel    screen
         │              │       │
    ┌────┤         ┌────┤    ┌──┤
    │    │         │    │    │  │
  quest shop    minimap hud │  reroll
  panel panel            │
                    pause menu
```

**场景列表**: title-screen, char-select, diff-select, weapon-select, upgrade-panel, result-screen, quest-panel, shop-panel

**HUD**: Canvas绘制（计时器/等级/金币/HP/经验条/协同），HTML覆盖层（暂停/Auto按钮）

---

## 8. 性能架构

| 优化项 | 策略 | 影响 |
|--------|------|------|
| 碰撞检测 | distSq替代sqrt + AABB先行 | 消除sqrt调用 |
| Gem循环 | 内联dx/dy归一化，零对象分配 | -6000对象/秒GC压力 |
| 敌人特效 | w2s缓存（3次→1次） | -66% w2s调用 |
| 网格线 | 批量path单次stroke | -50% draw call |
| W/H | 变量缓存，仅resize更新 | 消除DOM属性读取 |
| MAX_ENEMIES | 70（原50） | 需关注性能边界 |

---

## 9. 架构决策记录

| 日期 | 决策 | 原因 |
|------|------|------|
| 2026-04-02 | 单HTML文件起步 | 快速原型，零构建依赖 |
| 2026-04-04 | ES Module模块化拆分 | 2633行→20个模块，可维护性 |
| 2026-04-04 | window.game全局状态 | E2E测试访问 + 跨模块通信 |
| 2026-04-04 | 纯Canvas HUD | 避免DOM与Canvas混合渲染的复杂性 |
| 2026-04-04 | HTML overlay面板 | 复用CSS样式，与暂停菜单一致 |
| 2026-04-04 | localStorage存档 | H5游戏标准方案，无服务器依赖 |
| 2026-04-04 | Playwright E2E | 无需导出函数，通过DOM+window验证 |
| 2026-04-05 | 内联数学替代new V() | 消除热路径GC压力 |
