# 策划竞品调研报告

## 调研背景

**调研时间**：2026-04-04
**调研目的**：深度分析当前市场上热门的吸血鬼幸存者类（Survivor-like / Bullet Heaven / Auto Battler）游戏产品，提炼优秀设计模式，为本项目"肉鸽幸存者"（H5 Canvas 2D 像素风）的后续迭代提供方向性指导。
**调研范围**：8款核心竞品 + 2款补充竞品，覆盖 Steam / 移动端 / Web 平台。
**项目现状**：本项目当前版本 v1.2.0，已实现 6种基础武器、4条进化路线、7种敌人、3角色、3难度、连击系统、屏幕震动、波次进度提示、协同系统(12种)、Quest挑战(10个)、永久货币+局外升级商店等完整玩法循环。

---

## 竞品分析

### 1. Vampire Survivors（吸血鬼幸存者）

**基本信息**：开发商 Poncle（Luca Galante），2022年正式发行，Steam 估算销量 ~1030万份，营收约 $3730万。移动端免费，无广告无内购。

#### 核心循环设计

- **单局时长**：15-30分钟（远超本项目5分钟），支持无限模式
- **成长曲线**：经验值驱动升级，每级 3选1（武器/被动/属性），局内成长感极强
- **节奏控制**：通过敌人生成密度和类型的阶段性递增（每1-5分钟引入新敌人类型）创造"先轻松后紧迫"的弧线
- **局外进度**：角色解锁（50+角色）、武器图鉴、成就系统、Secrets（隐藏要素）

#### 武器/技能设计

- **武器数量**：100+种基础武器，数量庞大
- **进化系统**：核心机制 -- 基础武器满级(8级) + 特定被动道具 → 开宝箱时触发进化为强化武器。被动道具不消耗（仅进化时消耗），可重新获取
- **Union系统**：两个满级武器合成为一个更强武器（区别于进化）
- **被动+被动进化**：甚至被动道具之间可以组合（如4个被动合成为1个超级被动）
- **Arcana系统**：另一层Build定制，修改武器/被动受影响的规则
- **Inventory限制**：6武器+6被动，迫使玩家做取舍决策，是Build深度的主要来源
- **协同性**：某些武器组合产生意外强力效果（如King Bible + Spinach + Laurel的无敌Build）

#### 敌人/关卡设计

- **关卡数量**：15+个独立Stage + Challenge Stage
- **敌人种类**：数量极多，涵盖基础/精英/Boss/隐藏Boss
- **Boss机制**：巨型Boss + 多种攻击模式，非简单的数值放大
- **难度曲线**：时间递增 + Death（红死神）作为硬性时间限制
- **Hyper模式**：全局加速模式，满足追求快节奏的玩家

#### 商业化与留存

- **定价策略**：$4.99（从$2.99涨起），移动端完全免费
- **DLC策略**：6个DLC，价格$1.99-$3.99，部分免费。总拥有成本~$15-20
- **反掠夺式商业化**：无微交易、无战斗通行证、无FOMO机制。创作者 Luca Galante 明确拒绝掠夺式变现
- **留存驱动**：持续免费内容更新（Chaos Roadmap 2025）、海量解锁内容、"再来一局"循环
- **DLC再激活**：每次DLC发布带回大量流失玩家

#### 创新机制

- **零操控深度 + 零决策疲劳**：纯自动攻击 + 定期做 3选1决策，极低门槛
- **Secrets文化**：大量隐藏角色/武器/Stage，社区协作解谜，形成社交驱动力
- **Castlevania联动**：Ode to Castlevania DLC 证明IP联动是这个品类的有效增长手段

#### 对本项目的启示

| 优点 | 缺点/局限 |
|------|----------|
| 极简操作+深度Build | 武器数量多但同质化严重 |
| 进化系统创造"追目标"感 | 15分钟局时长对H5不友好 |
| 低价格+免费更新赢得口碑 | 无移动端变现（我们H5必须考虑） |
| Secrets形成社区粘性 | 后期内容量过大，无法追赶 |

---

### 2. Brotato

**基本信息**：开发商 blobfish（solo dev），Godot引擎，Steam估算销量 ~710万份，营收约$2230万。后被 Evil Empire（Dead Cells团队）接手持续开发。

#### 核心循环设计

- **单局时长**：波次制，每波20-60秒，共若干波（单局约10-20分钟）
- **成长曲线**：波次间隙在商店购买武器/道具，局内成长 + 波次间决策
- **节奏控制**：波次制创造自然的"战斗-休息-商店"节奏，比连续生存更结构化
- **局外进度**：角色解锁（40+）、难度阶梯（0-5 Danger Level）

#### 武器/技能设计

- **双持系统**：核心创新 -- 同时装备最多6把武器（不同于VS的6武器槽），允许混搭
- **武器合成**：两把相同类型武器合成更高Tier版本
- **武器回收**：不需要的武器可回收为资源
- **Build多样性**：
  - 近战/远程/混合路线
  - 每个角色有独特被动影响Build方向
  - New Dawn DLC 新增 Vorpal Sword（百分比秒杀武器）和 Ban System（禁用不想要的选项）
- **商店决策**：波次间购买/出售/合成武器，策略深度高于VS的3选1

#### 敌人/关卡设计

- **波次制**：固定波次，每波敌人类型固定而非随机生成
- **Boss波**：特定波次出现Boss
- **难度阶梯**：0-5 Danger Level，每级需要用前一难度解锁
- **敌人类型**：多样化，但整体数量少于VS

#### 商业化与留存

- **定价**：买断制（~$5）
- **DLC**：Abyssal Terrors（付费），New Dawn（免费更新）
- **社区**：96%好评率，玩家自制Tier List持续活跃
- **留存**：40+角色+难度阶梯，持续数月的内容量
- **Evil Empire接手**：专业团队持续更新，保证长期运营

#### 创新机制

- **波次制商店**：将"什么时候做决策"从随机（VS的升级时）变为确定性（波次间隙），降低RNG对Build的影响
- **双持6武器**：极大增加Build自由度
- **Ban System**：允许玩家禁用特定选项，减少"垃圾选项"污染升级池

#### 对本项目的启示

| 优点 | 缺点/局限 |
|------|----------|
| 波次制节奏更结构化 | 商店系统增加开发复杂度 |
| 双持系统Build自由度极高 | 角色数量多但部分同质化 |
| Ban System解决"垃圾选项"问题 | 波次制vs连续生存是根本性差异 |
| Godot单文件成功先例 | 后期由外部团队接手，说明单人维护困难 |

---

### 3. Halls of Torment

**基本信息**：开发商 Chasing Carrots，Godot引擎，Steam销量超100万份，营收约$500万，96%好评率。预渲染90年代复古RPG美学。

#### 核心循环设计

- **单局时长**：10-15分钟
- **成长曲线**：等级升级3选1 + 装备掉落系统（RPG装备词缀）
- **节奏控制**：类VS连续生存，但装备掉落创造"打Boss→看掉落→决定是否替换"的迷你循环
- **局外进度**：Torment Shards（局外永久升级货币），每次失败也能积累资源

#### 武器/技能设计

- **装备系统**：独特 -- 武器和装备有随机词缀（RPG式），如+10%攻击速度、+15%暴击
- **角色差异**：每个角色有独特主动技能（非纯自动）
- **Build方向**：装备词缀决定Build方向（暴击流、攻速流、AOE流等）

#### 敌人/关卡设计

- **关卡结构**：多个独立Stage，各有独特敌人组合
- **视觉风格**：预渲染90年代暗黑风，与VS的像素风形成差异化
- **Boss机制**：固定Boss + 特殊机制

#### 商业化与留存

- **定价**：买断制（~$5）
- **DLC**：Prelude免费试玩版作为引流
- **留存**：Torment Shards永久升级 + 装备收集 + Quest系统
- **短局友好**：支持短时间和长时间游玩

#### 创新机制

- **RPG装备词缀**：将ARPG的装备系统引入Survivor-like，增加Build深度
- **预渲染美学**：不是像素风也不是3D，用90年代预渲染风格建立独特视觉辨识度
- **Quest系统**：给玩家明确目标（如"用角色X击败Boss Y"），增加重玩动力

#### 对本项目的启示

| 优点 | 缺点/局限 |
|------|----------|
| RPG装备系统增加Build深度 | 装备词缀系统复杂度高 |
| Quest系统引导重玩 | 视觉风格独特但受众较窄 |
| Torment Shards让失败也有收获 | 上手门槛比VS高 |
| Godot技术栈验证 | 装备系统不适合短局（5分钟） |

---

### 4. Deep Rock Galactic: Survivor

**基本信息**：开发商 Funday Games，基于 Deep Rock Galactic IP，融入Survivor-like机制。

#### 核心循环设计

- **单局时长**：20-30分钟（Deep Dive模式更长）
- **成长曲线**：局内升级 + 局外永久Meta Upgrades（Credits/Resources购买）
- **节奏控制**：分区探索 -- 地图分为多个区域，每个区域有明确目标（采矿/击杀），创造"探索→战斗→推进"的节奏
- **局外进度**：双重系统 -- Meta Upgrades（全局被动）+ Weapon Masteries（武器专属）

#### 武器/技能设计

- **Weapon Masteries**：核心创新 -- 每把武器有3阶段精通任务，完成后永久强化该武器
- **Carry Weapon概念**：玩家集中投资一把主力武器，其他为辅助
- **武器种类**：继承DRG IP的特色武器（钻机、炮台、冰冻手雷等）
- **CC（控制）协同**：冰冻/减速/击退等控制效果是Build核心，非单纯堆伤害

#### 敌人/关卡设计

- **分区地图**：非无限平地，有走廊/房间/矿道等地形
- **敌人种类**：继承DRG IP的虫族敌人
- **难度曲线**：多层难度系统（Hazard 1-5 + Deep Dive）

#### 商业化与留存

- **定价**：买断制
- **留存**：IP粉丝基础 + Mastery系统 + Meta Upgrades
- **社区**：受益于DRG已有社区

#### 创新机制

- **Weapon Mastery系统**：将"精通一把武器"作为长期目标，而非简单的"全收集"
- **分区地图探索**：打破Survivor-like的"原地刷怪"范式
- **双轨局外进度**：Meta Upgrades（通用）+ Mastery（武器专属）两层成长

#### 对本项目的启示

| 优点 | 缺点/局限 |
|------|----------|
| Mastery系统给长期目标 | 地图系统开发量巨大 |
| 分区地图增加策略深度 | 局时长偏长（20-30分钟） |
| CC协同让控场有意义 | 依赖IP，独立项目难复制 |
| 双轨局外进度设计优秀 | Mastery被玩家批评过于Grindy |

---

### 5. Soulstone Survivors

**基本信息**：定位为"Diablo meets Vampire Survivors"的Action Roguelite。

#### 核心循环设计

- **单局时长**：15-25分钟
- **成长曲线**：快节奏升级，强调"game-breaking builds"
- **节奏控制**：主动技能+自动攻击的混合模式，玩家参与度高于纯自动
- **局外进度**：Skill Chains系统 + 角色解锁

#### 武器/技能设计

- **Active Skills**：手动激活的技能（非纯自动），增加操控深度
- **Skill Chains**：技能链系统，技能之间可以产生连锁效果
- **Class系统**：每个Class有专属技能池和武器（如Paladin的Crit+Multicast、Necromancer的召唤）
- **Build自由度**：极高的Build自由度，可以创造"闪电放屁野蛮人"等荒诞但强力的组合
- **Status Effects**：丰富的状态效果系统（冰冻、燃烧、中毒、感电等）

#### 敌人/关卡设计

- **Titan Hunt**：特殊Boss战模式
- **敌人种类**：多样化，配合状态效果系统
- **难度系统**：多层次难度

#### 商业化与留存

- **定价**：买断制（Early Access）
- **留存**：海量Skill组合 + Class解锁 + 成就

#### 创新机制

- **主动技能系统**：在VS框架内加入ARPG式主动技能，玩家操控参与度更高
- **Skill Chains**：技能连锁创造意外的强力组合
- **"Diablo深度"**：比VS更接近ARPG的Build深度

#### 对本项目的启示

| 优点 | 缺点/局限 |
|------|----------|
| 主动技能增加操控深度 | 增加操控复杂度可能劝退休闲玩家 |
| Skill Chains增加Build发现感 | 技能系统开发量大 |
| Class差异化做得好 | "game-breaking" builds可能影响平衡 |
| 状态效果系统丰富 | 主动技能不适合移动端虚拟摇杆操作 |

---

### 6. Bio Prototype（生物原型）

**基本信息**：定位为"Roguelike & Skill Customizing Rhapsody"，Brotato式波次制。24角色、80+器官（技能模块）。

#### 核心循环设计

- **单局时长**：10-15分钟（波次制）
- **成长曲线**：波次间隙选择器官/技能模块，模块化组装角色能力
- **节奏控制**：Brotato式波次制 + 波次间隙决策
- **局外进度**：角色解锁

#### 武器/技能设计

- **Visual Programming**：核心创新 -- 用可视化编程方式自定义技能行为（类似节点编程）
- **器官系统**：收集敌人器官，将其转化为能力模块
- **80+器官/效果**：海量可组合的能力模块
- **24角色**：每个角色有独特基础技能
- **Build深度**：被评价为"令人眼花缭乱的自定义"和"复杂的武器升级系统"

#### 敌人/关卡设计

- **波次制**：固定波次
- **敌人类型**：多样化实验生物
- **器官掉落**：击败敌人获得其器官，是Build获取方式之一

#### 商业化与留存

- **定价**：买断制，曾限时免费推广
- **留存**：海量器官组合 + 角色解锁
- **平台**：Steam

#### 创新机制

- **可视化编程式技能自定义**：这个品类中最极致的自定义系统，允许玩家像拼积木一样组装技能
- **器官收集**：将"击杀敌人"与"获取新能力"直接关联

#### 对本项目的启示

| 优点 | 缺点/局限 |
|------|----------|
| 极致的Build自由度 | 复杂度过高劝退新玩家 |
| 器官系统概念新颖 | 可视化编程UI开发量巨大 |
| 波次制+模块化有参考价值 | "令人困惑的升级系统"是常见负面评价 |
| 角色数量多 | 角色间平衡困难 |

---

### 7. Spirit Hunters: Infinite Horde

**基本信息**：Vampire Survivors-inspired horde survival roguelite，约40小时全成就。

#### 核心循环设计

- **单局时长**：15-25分钟
- **成长曲线**：VS式经验升级 + 宠物系统
- **节奏控制**：VS式连续生存
- **局外进度**：资源收集 → 解锁能力/宠物/角色

#### 武器/技能设计

- **Pet系统**：每个宠物有独特的局内效果/技能
- **Build构建**：收集资源 → 制作创造性Build → 用资源解锁更多能力
- **被动能力**：大量被动技能

#### 敌人/关卡设计

- **关卡**：多地图
- **敌人**：标准Survivor-like敌人类型
- **难度**：社区反馈早期/中期成长过慢

#### 商业化与留存

- **定价**：买断制
- **留存**：收集系统 + 成就
- **负面评价**：被普遍认为"缺乏个性"、"太过VS模仿"

#### 创新机制

- **Pet系统**：每个宠物提供独特局内机制，增加Build多样性

#### 对本项目的启示

| 优点 | 缺点/局限 |
|------|----------|
| Pet系统增加Build维度 | "没有个性"是最致命问题 |
| 完成度不错（40小时） | 成长曲线过慢被广泛批评 |
| 基础体验流畅 | 缺乏差异化导致被遗忘 |
| — | 缺少令人印象深刻的创新点 |

---

### 8. 20 Minutes Till Dawn

**基本信息**：以Synergy（协同）系统为核心的Survivor-like，极简视觉风格。

#### 核心循环设计

- **单局时长**：20分钟（固定时间，标题即说明）
- **成长曲线**：升级选择天赋，天赋之间存在协同效果
- **节奏控制**：明确倒计时创造紧迫感
- **局外进度**：角色解锁 + 难度阶梯

#### 武器/技能设计

- **Synergy系统**：核心创新 -- 选择特定升级组合解锁隐藏的Synergy效果（13+种）
  - Weapon类：Gun Mastery + Mini Clip → 强化射击
  - Elemental类：Frost + Fire → Frost Fire
  - Summon类：召唤物流派
- **手动射击+移动**：非纯自动攻击，需要手动瞄准
- **流派多样性**：射击流、元素流、召唤流等明确分支

#### 敌人/关卡设计

- **明确时间限制**：20分钟，与VS的"活到死"不同
- **Boss战**：有明确Boss机制

#### 商业化与留存

- **定价**：买断制（低价）
- **留存**：角色解锁 + Synergy收集 + 难度阶梯
- **移动端**：有移动端版本

#### 创新机制

- **Synergy系统**：最经典的"升级组合解锁隐藏效果"设计，Build深度远超简单的3选1
- **手动瞄准**：增加操控参与度，同时保持简单

#### 对本项目的启示

| 优点 | 缺点/局限 |
|------|----------|
| Synergy系统是最佳Build深度方案 | 手动瞄准对移动端不友好 |
| 20分钟固定时长节奏好 | 视觉过于简约 |
| Synergy发现感极强 | 角色数量较少 |
| 移动端版本已验证可行性 | — |

---

### 补充竞品

#### HoloCure（Save the Fans!）

- Hololive同人Survivor-like，免费游戏
- **核心创新**：Weapon Collab系统（武器融合），高度发达的角色差异化
- **留存驱动**：IP粉丝情感 + 大量角色 + 免费策略
- **启示**：角色差异化（独特主动技能+专属武器）比纯数量更重要

#### Rogue: Genesia

- Deck-building + Survivor-like 融合
- **核心创新**：用卡牌构建代替传统升级，Roguelike深度更高
- **启示**：Deck-building机制可以显著增加策略深度，但开发复杂度高

---

## 优秀设计提炼

### 一、武器/Build系统设计模式总结

| 模式 | 代表作 | 深度 | 门槛 | 开发量 |
|------|--------|------|------|--------|
| **进化/合成** | Vampire Survivors | ★★★★ | ★★ | ★★ |
| **双持+商店** | Brotato | ★★★★★ | ★★★ | ★★★ |
| **Synergy协同** | 20 Minutes Till Dawn | ★★★★ | ★★ | ★★ |
| **模块化组装** | Bio Prototype | ★★★★★ | ★★★★★ | ★★★★ |
| **装备词缀** | Halls of Torment | ★★★★ | ★★★ | ★★★ |
| **Weapon Mastery** | DRG: Survivor | ★★★ | ★★ | ★★★ |
| **主动技能+链** | Soulstone Survivors | ★★★★★ | ★★★★ | ★★★★ |
| **Collab融合** | HoloCure | ★★★★ | ★★ | ★★★ |

**关键发现**：
1. **Synergy系统（20MtD式）** 是性价比最高的Build深度方案 -- 实现简单、发现感强、玩家理解成本低
2. **进化/合成系统（VS式）** 是本品类最经典的设计，玩家已有认知基础
3. **模块化组装（Bio Prototype式）** 深度最高但门槛也最高，不适合轻量化H5
4. **主动技能系统** 增加操控深度但与移动端虚拟摇杆冲突

### 二、节奏控制设计模式总结

| 模式 | 代表作 | 特点 |
|------|--------|------|
| **连续生存** | VS / 本项目 | 简单直接，适合短局 |
| **波次制** | Brotato / Bio Prototype | "战斗-休息-决策"结构化节奏 |
| **分区探索** | DRG: Survivor | 策略性最高但开发量大 |
| **固定倒计时** | 20 Minutes Till Dawn | 紧迫感明确 |

**关键发现**：
- 本项目的5分钟短局 + 连续生存模式是合理的，但需要更明显的"阶段感"
- 波次间隙的"休息窗口"（如Brotato商店）可以降低认知负荷

### 三、局外进度系统设计模式总结

| 模式 | 代表作 | 留存效果 | 开发量 |
|------|--------|---------|--------|
| **角色解锁** | 所有竞品 | ★★★ | ★★ |
| **永久货币升级** | DRG: Survivor / Halls of Torment | ★★★★ | ★★ |
| **Mastery精通** | DRG: Survivor | ★★★★ | ★★★ |
| **Quest任务** | Halls of Torment | ★★★ | ★★ |
| **成就/Secrets** | VS | ★★★★ | ★★ |
| **装备收集** | Halls of Torment | ★★★★ | ★★★ |

**关键发现**：
- **永久货币升级**（局内获取货币→局外购买永久buff）是最通用的留存方案
- **Quest系统**（"用角色X完成Y目标"）是低成本高回报的重玩驱动
- **Secrets/隐藏要素** 利用社区协作创造社交驱动力

### 四、商业化模式总结

| 模式 | 代表作 | 收入规模 | 优势 |
|------|--------|---------|------|
| **低价买断+DLC** | VS / Brotato | $37M+ / $22M+ | 口碑极佳 |
| **免费+无广告（移动端）** | VS移动端 | 间接驱动Steam销量 | 最大用户量 |
| **买断+免费更新** | Halls of Torment | $5M+ | 持续口碑 |
| **免费+IP** | HoloCure | 0（同人） | 最大传播 |

**关键发现**：
- Vampire Survivors的反掠夺式商业化（低价+免费更新+无微交易）赢得了巨大口碑和销量
- H5平台的商业化需要考虑：广告（激励视频）、小游戏平台分成、内购（皮肤/角色）
- "免费游玩+可选付费"可能是H5的最佳策略

### 五、"差异化"成功/失败案例

| 策略 | 成功案例 | 失败案例 |
|------|---------|---------|
| **视觉差异化** | Halls of Torment（预渲染90年代风） | Spirit Hunters（被认为"没有个性"） |
| **机制差异化** | Brotato（波次制+双持）/ 20MtD（Synergy） | 直接模仿VS的竞品 |
| **IP差异化** | DRG: Survivor / HoloCure | 无IP的VS clones |
| **平台差异化** | VS移动端（免费吃掉所有用户） | 仅在Steam发行的VS-like |

**关键发现**：
- Spirit Hunters的教训表明，在这个品类中"没有差异化=被遗忘"
- 差异化不需要全面创新，一个足够突出的差异点即可（Brotato的波次制、20MtD的Synergy）

---

## 对本项目的启示与建议

### 当前项目优势评估

| 维度 | 当前状态 | 与竞品对比 |
|------|---------|-----------|
| 武器系统 | 6种基础+4种进化 | 少于竞品（VS 100+、Brotato 40+），但质量集中 |
| 敌人种类 | 7种（含Boss） | 偏少，但每种有独特机制 |
| 角色系统 | 3角色 | 少于竞品（VS 50+、Brotato 40+） |
| 进化系统 | 4条路线 | 是核心差异化点，但数量少 |
| Build深度 | 武器升级+进化+被动叠层 | 低于竞品的Synergy/Mastery系统 |
| 局外进度 | localStorage存档 | 远低于竞品的永久升级/Quest系统 |
| 节奏控制 | 5阶段波次进度 | 已有，但比竞品的波次制缺少"休息窗口" |
| 视觉风格 | 像素风Canvas 2D | 与Halls of Torment的差异化方向一致 |
| 移动端适配 | 摇杆+冲刺按钮 | 优于多数竞品（很多PC-only） |
| 单局时长 | 5分钟 | 独特定位，竞品普遍10-30分钟 |

### 可吸收的优秀设计（优先级排序）

#### P0 -- 立即可行，高ROI

| 序号 | 设计 | 来源 | 理由 | 预估工作量 |
|------|------|------|------|-----------|
| 1 | **Synergy协同系统** | 20 Minutes Till Dawn | 最高性价比的Build深度方案。当前进化系统已实现"武器+武器→新武器"，在此基础上增加"被动+被动→隐藏加成"和"武器+被动→特殊效果"，用少量开发量极大增加Build深度 | 2-3天 |
| 2 | **Quest/挑战系统** | Halls of Torment | "用战士在噩梦难度击杀50只骷髅"等明确目标驱动重玩，开发量极低（主要是配置数据），留存效果显著 | 1-2天 |
| 3 | **永久货币+局外升级** | DRG: Survivor / Halls of Torment | 当前localStorage只存统计，增加"金币跨局累积→购买永久buff"的局外升级系统，让每次游玩都有进步感 | 2-3天 |
| 4 | **进化路线扩展** | Vampire Survivors | 当前4条进化路线偏少，增加到6-8条（覆盖所有基础武器组合），是核心内容的直接增长 | 3-5天 |

#### P1 -- 短期规划（1-2个版本）

| 序号 | 设计 | 来源 | 理由 | 预估工作量 |
|------|------|------|------|-----------|
| 5 | **新基础武器×2** | 竞品通用 | 当前6种基础武器限制了Build空间，新增2种（如：回旋镖=回旋追踪、毒雾=持续伤害区）将进化组合从C(6,2)=15扩展到C(8,2)=28 | 3-4天 |
| 6 | **新敌人类型** | 竞品通用 | 增加"分裂型"（死亡分裂为2个小体）和"护盾型"（需先破盾）两种敌人，增加战斗策略 | 2-3天 |
| 7 | **Ban/Reroll系统** | Brotato | 允许玩家花费金币重roll升级选项或禁用特定武器/被动，减少"垃圾选项"挫败感 | 1-2天 |
| 8 | **成就系统** | VS / Halls of Torment | 明确的成就列表（"首次进化武器""单局击杀200""3角色全部通关"等），增加目标感 | 1-2天 |
| 9 | **新角色×2** | HoloCure | 从3角色扩展到5角色，每个新角色有独特初始武器+专属被动 | 3-4天 |

#### P2 -- 中期规划（3-6个版本）

| 序号 | 设计 | 来源 | 理由 | 预估工作量 |
|------|------|------|------|-----------|
| 10 | **多关卡系统** | VS / Halls of Torment | 当前只有一张无限地图，新增2-3个Stage（沙漠/墓地/火山），各有独特敌人和Boss | 5-7天 |
| 11 | **Secrets/隐藏要素** | VS | 隐藏角色/武器/Stage，需要特定条件解锁，利用社区协作创造社交驱动力 | 2-3天 |
| 12 | **Pet/伙伴系统** | Spirit Hunters | 跟随玩家的小型战斗伙伴，有独特AI和技能，增加Build维度 | 3-4天 |
| 13 | **无限模式** | VS | 5分钟通关后解锁无限模式（无时间限制），满足硬核玩家 | 1-2天 |

#### P3 -- 长期规划

| 序号 | 设计 | 来源 | 理由 |
|------|------|------|------|
| 14 | **Weapon Mastery** | DRG: Survivor | 每种武器有精通任务，完成永久强化 |
| 15 | **装备词缀系统** | Halls of Torment | RPG式随机装备掉落 |
| 16 | **主动技能系统** | Soulstone Survivors | 手动释放的大招，增加操控深度 |
| 17 | **Deck-building元素** | Rogue: Genesia | 卡牌构建代替传统升级 |
| 18 | **IP联动/主题活动** | VS Castlevania DLC | 限时主题活动吸引新玩家 |

### 差异化方向建议

基于竞品分析，本项目的差异化应围绕以下三个核心展开：

#### 差异化方向一："5分钟极致浓缩"

这是本项目最独特的定位。所有竞品的单局时长都是10-30分钟，没有一个将"5分钟"作为核心定位。

**具体策略**：
- 5分钟内必须有完整的"成长→高潮→Boss→结算"弧线
- 节奏比竞品更快，每分钟都有明确的变化
- 适合"等公交/排队/休息间隙"的碎片化场景
- 营销口号方向："5分钟，从零到英雄"

#### 差异化方向二："Synergy驱动的Build发现"

当前进化系统是"武器+武器→更强武器"的单一路径。引入Synergy系统后，进化系统升级为：

- **武器进化**（现有）：武器A满级 + 武器B满级 → 进化武器
- **被动协同**（新增）：被动X + 被动Y → 隐藏效果（如：暴击戒指+疾风靴 → "风之锋刃"：暴击时发射额外飞刀）
- **武器+被动协同**（新增）：武器A + 被动X → 特殊效果（如：圣水+生命结晶 → 圣水球体变大30%）

这种分层协同系统让玩家每次游玩都有"发现新组合"的惊喜感。

#### 差异化方向三："H5原生，移动端优先"

绝大多数竞品都是PC-first（Steam），移动端是移植版。本项目从第一天就是H5+移动端优先设计：

- 虚拟摇杆+自动攻击+一键冲刺的操控方案
- 触控友好的UI（大按钮、清晰文字）
- 快速加载（单HTML文件/ES Module，无大资源）
- 适合微信小游戏/H5平台分发

### 短期可实现 vs 长期规划的功能拆分

#### 短期（v1.1 - v1.5，约2-4周）

| 版本 | 功能 | 优先级 |
|------|------|--------|
| v1.1 | Synergy协同系统（被动+被动、武器+被动） | P0 |
| v1.1 | Quest/挑战系统（5-10个基础Quest） | P0 |
| v1.2 | 永久货币+局外升级商店（3-5个可购买的永久buff） | P0 |
| v1.2 | 进化路线扩展（+2条新进化路线） | P0 |
| v1.3 | Ban/Reroll系统（升级面板重roll） | P1 |
| v1.3 | 成就系统（10-15个成就） | P1 |
| v1.4 | 2种新基础武器 + 对应进化路线 | P1 |
| v1.4 | 2种新敌人（分裂型+护盾型） | P1 |
| v1.5 | 2个新角色（各有独特机制） | P1 |
| v1.5 | 无限模式（通关后解锁） | P1 |

#### 中期（v2.0 - v3.0，约1-3个月）

| 版本 | 功能 | 优先级 |
|------|------|--------|
| v2.0 | 多关卡系统（2-3个Stage + Stage选择界面） | P2 |
| v2.0 | 新Boss（每个Stage专属Boss） | P2 |
| v2.1 | Secrets/隐藏要素系统 | P2 |
| v2.1 | Pet/伙伴系统 | P2 |
| v2.2 | 赛季/主题活动框架 | P2 |

#### 长期（v4.0+，3个月以上）

| 版本 | 功能 | 优先级 |
|------|------|--------|
| v4.0 | Weapon Mastery精通系统 | P3 |
| v4.0 | 装备词缀系统 | P3 |
| v5.0 | 主动技能系统 | P3 |
| v5.0 | Deck-building元素 | P3 |

---

## 附录：调研来源

### Vampire Survivors
- [Weapon Evolution Chart incl. DLC (as of Update 1.14) - Reddit](https://www.reddit.com/r/VampireSurvivors/comments/1oilkha/weapon_evolution_chart_incl_dlc_as_of_update_114/)
- [Evolution - Vampire Survivors Official Wiki](https://vampire.survivors.wiki/w/Evolution)
- [Vampire Survivors Update Roadmap - Game Rant](https://gamerant.com/vampire-survivors-updates-roadmap-new-content-2025/)
- [Flipping the Script on Predatory Monetization - YouTube](https://www.youtube.com/watch?v=zlxGuQyyB2w)
- [Vampire Survivors Creator Interview - Yahoo](https://www.yahoo.com/tech/selling-millions-copies-vampire-survivors-103051610.html)

### Brotato
- [Brotato Weapons Guide 2025 - Brotato Builds](https://brotato-builds.com/weapons)
- [Brotato: New Dawn - Rogueliker](https://rogueliker.com/brotato-new-dawn/)
- [Brotato Player Count - Tracker Network](https://tracker.gg/population/steam/1942280)
- [Brotato Guide - Rogueliker](https://rogueliker.com/brotato-guide/)

### Halls of Torment
- [Game Mechanics Wiki - Halls of Torment Fandom](https://hot.fandom.com/wiki/Game_Mechanics)
- [Halls of Torment Review - DJMMT](https://djmmtgamechangerdoc.wordpress.com/2025/11/04/halls-of-torment-review-8-10/)
- [Technical Learnings - Godot Fest 2025](https://media.ccc.de/v/godotfest2025-a-peek-under-the-hood-technical-learnings-from-halls-of-torment)
- [Halls of Torment Steam Stats - Sensor Tower](https://app.sensortower.com/vgi/game/halls-of-torment)

### Deep Rock Galactic: Survivor
- [Survivor: Masteries - Official DRG Wiki](https://deeprockgalactic.wiki.gg/wiki/Survivor:Masteries)
- [Survivor: Meta Upgrades - Official DRG Wiki](https://deeprockgalactic.wiki.gg/wiki/Survivor:Meta_Upgrades)
- [Game Systems and Progression - AntMag.NET](https://www.antmag.net/guide/deep-rock-galactic-survivor/game-systems-and-progress)

### Soulstone Survivors
- [Active Skill - Soulstone Survivors Wiki](https://soulstone-survivors.fandom.com/wiki/Active_Skill)
- [Soulstone Survivors on Reddit - Action Roguelite](https://www.reddit.com/r/Games/comments/wihgyu/soulstone_survivors_game_smithing_action/)
- [Category: Mechanics - Soulstone Survivors Wiki](https://soulstone-survivors.fandom.com/wiki/Category:Mechanics)

### Bio Prototype
- [Bioprototype on Steam](https://store.steampowered.com/app/3689520/Bioprototype/)
- [Bio Prototype - Survivors-likes List](https://survivorslikes.com/videogame/bio-prototype/)
- [Bioprototype Returns to Steam - Rogueliker](https://rogueliker.com/bioprototype-has-returned-to-steam/)

### Spirit Hunters: Infinite Horde
- [Spirit Hunters Review - Seasoned Gaming](https://seasonedgaming.com/2023/07/21/review-spirit-hunters-infinite-horde-unending-spirit/)
- [Spirit Hunters Steam Community Reviews](https://steamcommunity.com/app/1914580/reviews/?browsefilter=toprated)
- [Spirit Hunters Review - Missi the Achievement Huntress](https://www.missitheachievementhuntress.com/spirit-hunters-infinite-horde-review/)

### 20 Minutes Till Dawn
- [All Synergies Guide - GameRant](https://gamerant.com/20-minutes-till-dawn-synergies-upgrade-combinations/)
- [Synergies - 20 Minutes Till Dawn Wiki](https://20-minutes-till-dawn.fandom.com/wiki/Synergies)
- [Synergies Cheat Sheet - Reddit](https://www.reddit.com/r/20MinutesTillDawn/comments/174162w/i_created_a_quick_cheat_sheet_for_all_of_the/)

### HoloCure
- [HoloCure: Setting the Standard - SuperJump Magazine](https://www.superjumpmagazine.com/holocure-setting-the-standard-for-fan-made-games/)
- [Introduction to HoloCure and Weapon Collab Guide](https://vchavcha.com/en/free-resources/holocure-intro-collab/)
- [HoloCure Game Mechanics Wiki](https://holocure.fandom.com/wiki/Category:Game_Mechanics)

### 行业趋势
- [Bullet Heavens: Games Like Vampire Survivors - Rogueliker](https://rogueliker.com/bullet-heaven-games-like-vampire-survivors/)
- [Best Bullet Heaven Games - RogueRanker](https://rogueranker.com/best-bullet-heaven-games/)
- [Survivors-likes Database - SurvivorsLikes.com](https://survivorslikes.com/)
- [8 Insane New Bullet Heaven Games 2026 - YouTube](https://www.youtube.com/watch?v=oj9hLzD8iLg)
