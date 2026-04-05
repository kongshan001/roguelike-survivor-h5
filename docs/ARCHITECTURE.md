# 肉鸽幸存者 — 项目架构设计

> 版本: v1.2.1 | 最后更新: 2026-04-05 | 架构迭代: #4

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
├── index.html                      # HTML入口（UI + CSS + module加载）
├── src/
│   ├── main.js                     # 入口：import game.js
│   ├── game.js                     # 主循环 + 游戏状态 + 渲染
│   ├── core/                       # 核心基础设施
│   │   ├── config.js               # CFG常量表
│   │   ├── math.js                 # V向量类 + 工具函数
│   │   └── save.js                 # localStorage持久化
│   ├── entities/                   # 游戏实体
│   │   ├── Player.js               # 玩家（移动/伤害/协同/连击）
│   │   ├── enemy.js                # 敌人（7种类型 + Boss AI）
│   │   ├── gem.js / food.js / chest.js
│   ├── weapons/
│   │   └── registry.js             # 12个武器类（6基础+6进化）
│   ├── systems/
│   │   ├── camera.js               # DPR感知相机
│   │   ├── spawner.js              # 出兵节奏
│   │   └── damage-text.js          # 浮动伤害数字
│   ├── audio/
│   │   └── sfx.js                  # 音效 + 屏幕震动 + 暴击
│   └── ui/
│       ├── input.js / scenes.js / hud.js
│       ├── upgrade-panel.js / upgrade-generate.js
│       ├── quest-panel.js / shop-panel.js
├── tests/
│   └── smoke.test.ts               # Playwright E2E
└── docs/
    ├── ARCHITECTURE.md             # 本文件
    ├── VERSION / CHANGELOG.md
    └── team/                       # 工作记录
```

---

## 3. 模块依赖关系

```mermaid
graph TD
    HTML[index.html] --> MAIN[src/main.js]
    MAIN --> GAME[src/game.js]

    GAME --> CFG[src/core/config.js]
    GAME --> MATH[src/core/math.js]
    GAME --> SAVE[src/core/save.js]
    GAME --> SFX[src/audio/sfx.js]
    GAME --> CAM[src/systems/camera.js]
    GAME --> SPAWN[src/systems/spawner.js]
    GAME --> DTXT[src/systems/damage-text.js]
    GAME --> PLAYER[src/entities/Player.js]
    GAME --> ENEMY[src/entities/enemy.js]
    GAME --> GEM[src/entities/gem.js]
    GAME --> FOOD[src/entities/food.js]
    GAME --> CHEST[src/entities/chest.js]
    GAME --> WREG[src/weapons/registry.js]
    GAME --> INPUT[src/ui/input.js]
    GAME --> SCENES[src/ui/scenes.js]
    GAME --> HUD[src/ui/hud.js]
    GAME --> UPANEL[src/ui/upgrade-panel.js]
    GAME --> QPANEL[src/ui/quest-panel.js]
    GAME --> SPANEL[src/ui/shop-panel.js]

    UPANEL --> UGEN[src/ui/upgrade-generate.js]
    UGEN --> CFG
    UGEN --> MATH
    UGEN --> WREG

    QPANEL --> CFG
    QPANEL --> SAVE
    SPANEL --> CFG
    SPANEL --> SAVE

    PLAYER --> CFG
    PLAYER --> MATH
    ENEMY --> CFG
    ENEMY --> MATH
    WREG --> CFG
    WREG --> MATH
    SFX --> CFG
    DTXT --> CAM
    SCENES --> INPUT

    classDef core fill:#1a237e,stroke:#4fc3f7,color:#fff
    classDef entity fill:#2e7d32,stroke:#66bb6a,color:#fff
    classDef weapon fill:#b71c1c,stroke:#ef5350,color:#fff
    classDef system fill:#4a148c,stroke:#ce93d8,color:#fff
    classDef ui fill:#e65100,stroke:#ff9100,color:#fff
    classDef audio fill:#004d40,stroke:#4db6ac,color:#fff

    class CFG,MATH,SAVE core
    class PLAYER,ENEMY,GEM,FOOD,CHEST entity
    class WREG weapon
    class CAM,SPAWN,DTXT system
    class INPUT,SCENES,HUD,UPANEL,UGEN,QPANEL,SPANEL ui
    class SFX audio
```

---

## 4. 游戏主循环

```mermaid
flowchart TD
    RAF[requestAnimationFrame] --> DT["Δt = min(time-last, 50ms)"]
    DT --> PAUSED{paused?}

    PAUSED -->|Yes| RENDER
    PAUSED -->|No| UPDATE

    subgraph UPDATE["⏱ UPDATE"]
        direction TB
        ELAPSED["elapsed += dt"]
        BOSS_CHK{elapsed ≥ 270s<br/>boss未生成?}
        BOSS_CHK -->|Yes| SPAWN_BOSS["生成Boss<br/>screenFlash + shake"]
        BOSS_CHK -->|No| INPUT_PROC

        SPAWN_BOSS --> INPUT_PROC
        INPUT_PROC["getInput() → {x,y}"]
        INPUT_PROC --> P_UPDATE["player.update(dt, input)"]
        P_UPDATE --> CAM_FOLLOW["camera.follow(player)<br/>camera.update(dt)"]

        CAM_FOLLOW --> SPAWN_CHK["spawnTimer -= dt"]
        SPAWN_CHK --> ENEMY_SPAWN["生成敌人<br/>getSpawnRate(elapsed)"]
        ENEMY_SPAWN --> CHEST_SPAWN["宝箱生成检查"]

        CHEST_SPAWN --> ENEMY_UPD["敌人.update(dt, player)"]
        ENEMY_UPD --> COLLISION["碰撞检测<br/>玩家vs敌人 / 子弹vs敌人"]
        COLLISION --> WEAPON_UPD["武器.update(dt, enemies)"]
        WEAPON_UPD --> BULLET_UPD["子弹.update(dt)"]
        BULLET_UPD --> GEM_UPD["宝石拾取 + 经验<br/>升级检查"]
        GEM_UPD --> FOOD_UPD["食物拾取"]
    end

    subgraph RENDER["🎨 RENDER"]
        direction TB
        CLEAR["清屏 #1a1a2e"]
        CLEAR --> GROUND["地图网格"]
        GROUND --> DROPS["宝石/食物/宝箱"]
        DROPS --> ENEMIES["敌人 + 状态特效"]
        ENEMIES --> PLAYER_DRAW["玩家 + Dash残影"]
        PLAYER_DRAW --> WEAPON_FX["武器视觉"]
        WEAPON_FX --> BULLETS["子弹"]
        BULLETS --> DMG_TXT["伤害数字"]
        DMG_TXT --> SCREEN_FX["屏幕闪光/震动"]
        SCREEN_FX --> HUD_DRAW["HUD绘制"]
    end

    UPDATE --> RENDER
    RENDER --> RAF
```

---

## 5. 游戏状态机

```mermaid
stateDiagram-v2
    [*] --> TitleScreen: 页面加载

    TitleScreen --> CharSelect: startGame()
    CharSelect --> DiffSelect: pickChar(id)
    DiffSelect --> WeaponSelect: pickDiff() <br/> (mage)
    DiffSelect --> WeaponSelect: pickDiff() <br/> (warrior/ranger 自动武器)
    WeaponSelect --> GameLoop: beginGame(weapon)

    GameLoop --> GameLoop: 主循环 running
    GameLoop --> Paused: togglePause() / 升级面板
    Paused --> GameLoop: resumeGame() / 选择升级

    GameLoop --> Victory: Boss击杀
    GameLoop --> Defeat: player.hp ≤ 0<br/>或时间耗尽
    GameLoop --> Defeat: elapsed ≥ 300s

    Victory --> ResultScreen: endGame(true)
    Defeat --> ResultScreen: endGame(false)
    ResultScreen --> TitleScreen: restartGame()

    state GameLoop {
        [*] --> Update
        Update --> Render
        Render --> Update
    }
```

---

## 6. 数据流

### 6.1 升级数据流

```mermaid
sequenceDiagram
    participant Gem as 宝石
    participant Player as Player
    participant UGen as upgrade-generate
    participant UPanel as upgrade-panel
    participant Game as game.js

    Gem->>Player: addExp(value)
    Player->>Player: exp >= EXP_TABLE[level]
    Player-->>Game: return true (升级)

    Game->>UGen: generateUpgrades(player)
    UGen->>UGen: 收集可选项池<br/>(新武器/升级/被动/进化)
    UGen-->>Game: choices[3]

    Game->>UPanel: showUpgrade(choices, game)
    Note over Game,UPanel: game.paused = true

    UPanel->>UPanel: 渲染3张升级卡片
    Note over UPanel: 玩家点击选择
    UPanel->>Player: choice.apply()
    Player->>Player: checkSynergies()
    UPanel->>Game: game.paused = false
```

### 6.2 伤害数据流

```mermaid
sequenceDiagram
    participant Weapon as 武器
    participant Bullet as 子弹/范围
    participant Enemy as Enemy
    participant Game as game.js
    participant SFX as 音效系统

    Weapon->>Bullet: 创建子弹/范围效果
    Weapon->>Weapon: update(dt, enemies)

    loop 每个敌人
        Bullet->>Enemy: 碰撞检测 (distSq)
        alt 命中
            Weapon->>Weapon: applyDmg(base)
            Note right of Weapon: dmg = base × weaponDmgMul
            Bullet->>Enemy: hurt(dmg, isCrit)
            Enemy->>Enemy: hp -= dmg
            Enemy->>SFX: 触发协同效果
        end
    end

    alt enemy.hp ≤ 0
        Enemy->>Game: 移除敌人
        Game->>Game: kills++, combo++
        Game->>Game: 掉落gem/food
        Game->>SFX: screenShake('kill')
        alt isCrit + hasSynergy('crit_boots')
            Game->>Game: 额外飞刀子弹
        end
        alt isCrit + hasSynergy('magnet_crit')
            Game->>Game: 额外宝石掉落
        end
        alt Boss死亡
            Game->>Game: endGame(true)
        end
    end
```

### 6.3 存档数据流

```mermaid
flowchart LR
    subgraph localStorage["localStorage"]
        SAVE_DATA["roguelike_survivor_save<br/>{version, bestScore, soulFragments,<br/>completedQuests, shopUpgrades, ...}"]
    end

    subgraph Read["读取路径"]
        BEGIN["beginGame()"] --> SHOP_APPLY["应用shopUpgrades<br/>+HP +速度 +拾取范围 +经验"]
        TITLE["updateTitleStats()"] --> SHOW["显示最佳记录"]
        QPANEL["quest-panel"] --> SHOW_Q["显示已完成任务"]
        SPANEL["shop-panel"] --> SHOW_S["显示升级等级+费用"]
    end

    subgraph Write["写入路径"]
        END_GAME["endGame()"] --> QUEST_CHK["检查Quest完成"]
        QUEST_CHK --> SOUL_CALC["计算灵魂碎片<br/>gold × 30% × goldMul + questReward"]
        SOUL_CALC --> SAVE_WRITE["Save.save()"]
        BUY["购买商店升级"] --> VALIDATE["验证等级/费用/扣款"]
        VALIDATE --> SAVE_WRITE
    end

    SAVE_DATA --> Read
    Write --> SAVE_DATA
```

---

## 7. 类图

### 7.1 实体类

```mermaid
classDiagram
    class Player {
        +float x, y
        +int hp, maxHp
        +float speed, pickupRange
        +int level, exp, kills, gold
        +Weapon[] weapons
        +object passives
        +Set activeSynergies
        +int _combo, _bestCombo
        +int _damageTaken
        +update(dt, input)
        +takeDamage(d) bool
        +addExp(amount) bool
        +checkSynergies()
        +getWeaponBonus(weaponName) object
        +hasSynergy(id) bool
        +dash() bool
        +draw(ctx, cam, canvas)
    }

    class Enemy {
        +float x, y
        +int hp, maxHp
        +float speed
        +string type
        +bool isBoss
        +update(dt, player, bullets)
        +hurt(dmg, isCrit)
        +draw(ctx, cam, canvas)
    }

    class Gem {
        +float x, y
        +int value
        +draw(ctx, cam, canvas)
    }

    class Food {
        +float x, y
        +float lifetime
        +update(dt, player, game)
        +draw(ctx, cam, canvas)
    }

    class Chest {
        +float x, y
        +bool opened
        +draw(ctx, cam, canvas)
    }

    Player --> Gem : 拾取获得经验
    Player --> Food : 拾取恢复HP
    Player --> Chest : 金币购买奖励
```

### 7.2 武器类层次

```mermaid
classDiagram
    class WeaponBase {
        <<abstract>>
        +string name
        +Player owner
        +int level
        +float timer
        +update(dt, enemies, bullets, sfx)
        +applyDmg(base) float
        +draw(ctx, cam, canvas)
    }

    class HolyWater {
        +旋转水球攻击
    }
    class Knife {
        +自动瞄准飞刀
    }
    class Lightning {
        +链式闪电
    }
    class Bible {
        +环绕范围伤害
    }
    class FireStaff {
        +锥形火焰+点燃
    }
    class FrostAura {
        +冰冻减速光环
    }

    class ThunderHolyWater {
        +旋转+链式闪电
        note: holywater ∩ lightning
    }
    class FireKnife {
        +穿透飞刀+燃烧
        note: knife ∩ firestaff
    }
    class HolyDomain {
        +超大范围+脉冲
        note: bible ∩ holywater
    }
    class Blizzard {
        +暴风雪+闪电链
        note: frostaura ∩ lightning
    }
    class FrostKnife {
        +减速穿透飞刀
        note: knife ∩ frostaura
    }
    class FlameBible {
        +旋转灼烧+火焰脉冲
        note: bible ∩ firestaff
    }

    WeaponBase <|-- HolyWater
    WeaponBase <|-- Knife
    WeaponBase <|-- Lightning
    WeaponBase <|-- Bible
    WeaponBase <|-- FireStaff
    WeaponBase <|-- FrostAura

    WeaponBase <|-- ThunderHolyWater
    WeaponBase <|-- FireKnife
    WeaponBase <|-- HolyDomain
    WeaponBase <|-- Blizzard
    WeaponBase <|-- FrostKnife
    WeaponBase <|-- FlameBible

    HolyWater ..|> ThunderHolyWater : 进化
    Lightning ..|> ThunderHolyWater : 进化
    Knife ..|> FireKnife : 进化
    FireStaff ..|> FireKnife : 进化
    Bible ..|> HolyDomain : 进化
    FrostAura ..|> Blizzard : 进化
    Knife ..|> FrostKnife : 进化
    FrostAura ..|> FrostKnife : 进化
    Bible ..|> FlameBible : 进化
    FireStaff ..|> FlameBible : 进化
```

---

## 8. UI场景流转

```mermaid
flowchart LR
    TITLE["🏷️ 标题画面<br/>#title-screen"] --> CHAR["🧙 角色选择<br/>#char-select"]
    CHAR --> DIFF["⚔️ 难度选择<br/>#diff-select"]
    DIFF --> WEAPON["🗡 武器选择<br/>#weapon-select"]
    WEAPON --> GAME["🎮 游戏主循环<br/>Canvas + HUD"]

    GAME --> |升级| UPGRADE["⬆ 升级面板<br/>#upgrade-panel"]
    UPGRADE --> |选择| GAME
    GAME --> |暂停| PAUSE["⏸ 暂停菜单<br/>#pause-menu"]
    PAUSE --> |继续| GAME
    GAME --> |结束| RESULT["🏆 结算画面<br/>#result-screen"]
    RESULT --> |再来| TITLE

    TITLE --> |📜 任务| QUEST["📜 挑战任务<br/>#quest-panel"]
    QUEST --> |返回| TITLE
    TITLE --> |🏪 商店| SHOP["🏪 升级商店<br/>#shop-panel"]
    SHOP --> |返回| TITLE

    style TITLE fill:#1a237e,stroke:#4fc3f7,color:#fff
    style GAME fill:#2e7d32,stroke:#66bb6a,color:#fff
    style UPGRADE fill:#e65100,stroke:#ff9100,color:#fff
    style RESULT fill:#b71c1c,stroke:#ef5350,color:#fff
```

---

## 9. 系统架构

### 9.1 协同系统

```mermaid
graph LR
    subgraph 被动×被动
        CR["crit + speedboots<br/>🔪 风之锋刃"] --> CK["暴击→飞刀"]
        AM["armor + maxhp<br/>🛡 铁壁之心"] --> AD["护甲翻倍"]
        MC["magnet + crit<br/>💎 贪婪之魂"] --> BG["暴击→额外宝石"]
        BR["speedboots + regen<br/>🏃 生命奔流"] --> MR["移动再生×2"]
        AR["armor + regen<br/>💪 钢铁堡垒"] --> LA["低HP护甲+3"]
        MM["magnet + maxhp<br/>🔮 命运齿轮"] --> GH["宝石2%回血"]
    end

    subgraph 武器×被动
        HW["holywater+maxhp<br/>⛪ 圣水膨胀"] --> RB["半径+30%"]
        KN["knife+crit<br/>🗡 致命飞刀"] --> CC["可暴击"]
        LM["lightning+magnet<br/>⚡ 过载闪电"] --> EC["链+1 射程+50"]
        BB["bible+speedboots<br/>🔥 烈焰圣经"] --> SR["速度×1.5 范围+20"]
        FA["firestaff+armor<br/>🌋 熔岩法杖"] --> CB["锥形+40px 点燃+1s"]
        FR["frostaura+regen<br/>❄️ 极寒光环"] --> FF["冰冻+5%/s +0.5s"]
    end
```

### 9.2 出兵节奏

```mermaid
gantt
    title 出兵节奏（300秒）
    dateFormat X
    axisFormat %s秒

    section 僵尸
    生成   :0, 300

    section 蝙蝠
    生成   :60, 300

    section 骷髅+幽灵
    生成   :120, 300

    section 精英+分裂虫
    生成   :180, 300

    section Boss
    生成   :270, 300
```

---

## 10. 性能架构

```mermaid
flowchart TD
    subgraph 热路径["🔥 每帧热路径优化"]
        GEM_OPT["宝石循环<br/>❌ new V() 每帧100+次<br/>✅ 内联dx/dy归一化"]
        SQRT_OPT["距离计算<br/>❌ Math.sqrt(ds)/1000<br/>✅ ds/1000000"]
        W2S_OPT["敌人特效<br/>❌ w2s调用3次/敌人/帧<br/>✅ 缓存1次共享"]
        GRID_OPT["网格线<br/>❌ 每条线独立stroke<br/>✅ 批量path单次stroke"]
        WH_OPT["W/H<br/>❌ innerWidth每帧读取<br/>✅ 变量缓存resize更新"]
    end

    subgraph 策略["持续优化方向"]
        POOL["对象池<br/>子弹/宝石复用"]
        HASH["空间哈希<br/>敌人>80时启用"]
        FIXED["固定时间步<br/>Timestep Fixing"]
    end

    GEM_OPT --> IMPACT["预估: -6000对象/秒GC"]
    SQRT_OPT --> IMPACT2["预估: -100+sqrt调用/帧"]
    W2S_OPT --> IMPACT3["预估: -66% w2s调用"]
    GRID_OPT --> IMPACT4["预估: -50% draw call"]
```

---

## 11. 架构决策记录

| # | 日期 | 决策 | 原因 | 替代方案 |
|---|------|------|------|---------|
| ADR-1 | 04-02 | 单HTML文件起步 | 快速原型，零依赖 | 直接模块化 |
| ADR-2 | 04-04 | ES Module拆分 | 2633行→20模块 | Webpack打包 |
| ADR-3 | 04-04 | window.game全局 | E2E测试+跨模块通信 | 依赖注入 |
| ADR-4 | 04-04 | Canvas HUD | 避免DOM/Canvas混合 | DOM HUD |
| ADR-5 | 04-04 | HTML overlay面板 | 复用CSS，一致性好 | 全Canvas UI |
| ADR-6 | 04-04 | localStorage | H5标准方案 | IndexedDB |
| ADR-7 | 04-04 | Playwright E2E | 无需导出函数 | Jest单元测试 |
| ADR-8 | 04-05 | 内联数学替代new V() | 消除热路径GC | 对象池 |

---

## 12. 架构迭代规则

每次涉及以下变更时，**必须同步更新本文档对应章节**：

| 变更类型 | 更新章节 | 示例 |
|---------|---------|------|
| 新增/删除模块 | §2 目录结构 + §3 依赖图 | 新增 src/core/pool.js |
| 修改模块依赖 | §3 依赖图 + §5 数据流 | weapon拆分为独立文件 |
| 新增/修改系统 | §9 系统架构 | 新增协同类型 |
| 修改游戏流程 | §4 主循环 + §6 状态机 | 新增中间结算画面 |
| UI场景变更 | §8 UI流转 | 新增设置面板 |
| 性能架构调整 | §10 性能架构 | 引入对象池 |
| 技术决策 | §11 决策记录 | 替换存储方案 |
