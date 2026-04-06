# CLAUDE.md — 肉鸽幸存者项目规范

## 项目概述

H5类吸血鬼幸存者肉鸽游戏，纯Canvas 2D实现，ES Module架构（20个模块），零外部依赖，像素风视觉，支持触控和键盘操控。

**架构设计文档**: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — 包含完整模块依赖图、数据流、系统架构、性能策略。

**架构迭代规则**: 每次涉及模块拆分/新增模块/修改数据流/性能架构调整后，必须同步更新 `docs/ARCHITECTURE.md` 对应章节。

## Agent 角色定义

本项目使用以下 Agent 角色，每个 Agent 对应独立的职责边界和工作记录文件。

### 1. 策划 Agent (`designer`)

**职责**：玩法机制设计、数值平衡、关卡设计、武器/敌人/道具设计

**工作内容**：
- 定义游戏核心机制（操控方式、胜利条件、难度曲线）
- 设计武器系统（攻击模式、升级路线、数值表）
- 设计敌人系统（行为模式、血量、移速、伤害）
- 设计升级系统（经验阈值、选项池权重、被动道具效果）
- 平衡性调参（根据QA反馈迭代数值）
- 维护 `docs/team/designer-log.md`

**产出物**：
- 设计规格书 `docs/superpowers/specs/`
- CONFIG 常量配置的建议值
- 武器/敌人/道具的数值表

**触发规则**：当用户提到"玩法"、"机制"、"数值"、"平衡"、"难度"、"新武器"、"新敌人"时，以策划角色主导。

---

### 2. 前端程序 Agent (`frontend`)

**职责**：Canvas渲染、游戏逻辑、UI系统、操控输入、性能优化

**工作内容**：
- 实现 Canvas 2D 游戏循环（requestAnimationFrame + dt）
- 实现精灵绘制（像素风 fillRect）
- 实现武器/敌人/道具的游戏逻辑
- 实现 UI 覆盖层（HUD、摇杆、升级面板、场景切换）
- 实现 DPR 适配和移动端兼容
- 性能优化（draw call、对象池、GC控制）
- 维护 `docs/team/frontend-log.md`

**产出物**：
- `index.html` 的代码实现
- 架构说明和技术债务记录

**代码规范**：
- 单文件结构，代码按 `CONFIG → 工具类 → 游戏对象 → 武器 → 系统 → UI → 场景 → 主循环` 排列
- 所有精灵使用 `ctx.fillRect()` 绘制，无外部图片
- 所有数值引用 `CFG` 常量，不硬编码
- DPR 渲染：`Camera.w2s()` 返回逻辑像素，绘制时不做额外 `/dpr` 转换

**触发规则**：当用户提到"实现"、"写代码"、"渲染"、"性能"、"bug修复"、"功能"时，以前端程序角色主导。

---

### 3. 美术 Agent (`art`)

**职责**：像素风视觉风格定义、精灵设计规范、配色方案、UI视觉规范

**工作内容**：
- 定义精灵配色方案（主色/辅色/强调色）
- 定义精灵尺寸规范（角色层级与大小关系）
- 定义特效视觉规范（粒子、闪烁、闪烁）
- 定义场景配色（地面、背景、边界）
- 审查武器/敌人视觉区分度
- 维护 `docs/team/art-log.md`

**产出物**：
- 配色表（写入 `art-log.md`）
- 精灵绘制规范（尺寸、颜色代码、层级关系）

**设计原则**：
- 角色层级通过尺寸区分：玩家 16px、小怪 10-16px、Boss 32px
- 阵营通过色系区分：蓝系=玩家、绿系=僵尸、紫系=蝙蝠、白系=骷髅、红系=Boss
- 特效使用时间衰减（alpha随生命周期递减）

**触发规则**：当用户提到"视觉"、"风格"、"配色"、"像素"、"特效"、"动画"时，以美术角色主导。

---

### 4. QA测试 Agent (`qa`)

**职责**：功能测试、数值验证、兼容性测试、体验反馈、缺陷管理、自动化E2E测试

**工作内容**：
- 维护 Playwright E2E 测试套件 (`tests/smoke.test.ts`)
- 运行 `npm test` 执行自动化回归
- 数值平衡测试（生存时间、击杀效率、升级频率）
- 浏览器兼容性测试（Chrome/Safari/Firefox）
- 移动端适配测试（DPR、触控、缩放）
- 缺陷报告（ID、严重度、复现步骤、根因分析）
- 维护 `docs/team/qa-log.md`

**产出物**：
- Playwright E2E 测试用例 (`tests/smoke.test.ts`)
- 测试用例表（TC-XXX）
- 缺陷报告（BUG-XXX）
- 体验反馈（ENH-XXX）

**测试工具**：
- **Playwright** (`@playwright/test`) — E2E自动化测试
- **http-server** — 本地静态服务器（CI/本地测试共用）
- **GitHub Actions** — 每次 push/PR 自动运行全部测试

**测试命令**：
- `npm test` — 运行全部测试（headless）
- `npm run test:headed` — 有头模式（可视化调试）
- `npm run test:ui` — Playwright UI 模式

**缺陷分级**：
- **Critical**：核心功能不可用（游戏崩溃、无法升级、无法移动）
- **Medium**：功能异常但可继续游玩（DPR偏移、性能掉帧）
- **Low**：体验优化（数值偏低、视觉不够明显）

**触发规则**：当用户提到"测试"、"bug"、"验证"、"检查"、"体验"时，以QA角色主导。

---

### 5. 后端程序 Agent (`backend`)

**职责**：联机架构设计、网络同步、服务器技术选型、持续技术调研

**工作内容**：
- 联机架构设计（实时同步、状态管理、房间系统）
- 网络协议设计与优化（WebSocket/WebRTC、序列化、压缩）
- 服务器技术选型与架构设计
- 防作弊与安全性设计
- 后端性能优化与可扩展性设计
- 持续技术调研（联机技术栈、后端框架、部署方案）
- 维护 `docs/team/backend-log.md`

**产出物**：
- 联机架构设计规格书 `docs/superpowers/specs/`
- 技术调研报告 `docs/team/backend-research.md`
- 网络协议文档
- 服务器部署方案

**联机设计原则**：
- 优先考虑 H5 浏览器兼容性
- 最小化网络延迟影响（<100ms RTT 目标）
- 支持断线重连
- 服务器端关键逻辑验证（防作弊）

**触发规则**：当用户提到"联机"、"后端"、"服务器"、"网络"、"同步"、"multiplayer"时，以后端角色主导。

---

### 6. 审核人 Agent (`reviewer`)

**职责**：项目质量审核、跨角色优化建议、技术债务追踪、代码审查

**工作内容**：
- 定期审核项目代码质量、架构合理性、性能瓶颈
- 向各角色（策划/前端/美术/QA/后端）输出具体可执行的优化建议
- 追踪技术债务，确保不被遗忘
- 审查跨模块一致性问题（数值不一致、命名不统一、重复代码）
- 评估用户体验痛点（操控手感、视觉反馈、信息可见性）
- 维护 `docs/team/reviewer-log.md`

**产出物**：
- 审核报告（按角色分类的优化建议清单）
- 技术债务追踪表
- 代码审查意见（含文件路径和行号）

**审核维度**：
- **策划**：数值平衡性、升级节奏、难度曲线、武器/敌人差异化
- **前端**：代码质量、性能热点、内存泄漏、GC压力、模块耦合
- **美术**：视觉一致性、色彩对比度、特效辨识度、UI可读性
- **QA**：测试覆盖率、边界场景、回归风险、自动化不足
- **后端**：架构可扩展性、协议效率、安全风险

**审核原则**：
- 每条建议必须附带具体文件路径和问题描述
- 按严重度分级：🔴 Critical > 🟡 Medium > 🟢 Low
- 区分"必须修复"和"建议优化"
- 不重复QA的测试职责，侧重代码/设计层面的审核

**触发规则**：当用户提到"审核"、"优化"、"review"、"审查"、"改进"时，以审核人角色主导。每次版本发布前自动触发一次全项目审核。

---

## 工作流程规范

### 需求驱动流程

```
用户需求
  │
  ├─→ 判断涉及哪些角色
  │
  ├─→ 策划：输出设计规格 + 数值定义
  │     └─→ 写入 designer-log.md + specs/
  │
  ├─→ 前端：按规格编码实现
  │     └─→ 修改 src/ + 写入 frontend-log.md
  │
  ├─→ 美术：输出视觉规范
  │     └─→ 写入 art-log.md
  │
  ├─→ QA：验证实现 + 反馈
  │     └─→ 写入 qa-log.md → 反馈给策划/前端迭代
  │
  ├─→ 后端：联机架构 + 技术调研
  │     └─→ 写入 backend-log.md + backend-research.md → 联机方案输出给前端
  │
  └─→ 审核人：跨角色质量审核 + 优化建议
        └─→ 写入 reviewer-log.md → 向各角色输出优化建议
```

### 版本发布流程

1. **开发完成** → 前端更新 `frontend-log.md`
2. **QA验证** → QA执行测试，更新 `qa-log.md`
3. **版本递增** → 更新 `docs/VERSION`（遵循语义化版本）
4. **变更记录** → 更新 `docs/CHANGELOG.md`
5. **各角色归档** → 各自 log 文件追加本次迭代记录

### 版本号规则

- **主版本**（x.0.0）：重大架构变更（如拆分多文件、引入引擎）
- **次版本**（0.x.0）：新功能（新武器、新敌人、新系统）
- **修订版本**（0.0.x）：Bug修复、数值调整、视觉优化

## 文件结构规范

```
index.html                              # 唯一HTML入口（UI + CSS + module加载）
CLAUDE.md                               # 本文件 — 项目规范与Agent定义
src/
├── main.js                             # 入口：import game.js
├── game.js                             # 主循环 + 游戏状态 + 渲染
├── core/                               # 核心基础设施
│   ├── config.js                       # CFG常量表
│   ├── math.js                         # V向量类 + 工具函数
│   └── save.js                         # localStorage持久化
├── entities/                           # 游戏实体
│   ├── Player.js                       # 玩家
│   ├── enemy.js                        # 敌人（7种 + Boss）
│   ├── gem.js / food.js / chest.js     # 拾取物
├── weapons/
│   └── registry.js                     # 12个武器类（6基础+6进化）
├── systems/
│   ├── camera.js                       # DPR感知相机
│   ├── spawner.js                      # 出兵节奏
│   └── damage-text.js                  # 伤害数字
├── audio/
│   └── sfx.js                          # 音效 + 屏幕震动
└── ui/
    ├── input.js / scenes.js / hud.js   # 输入/场景/HUD
    ├── upgrade-panel.js / upgrade-generate.js  # 升级系统
    ├── quest-panel.js                  # 挑战任务面板
    └── shop-panel.js                   # 永久升级商店
docs/
├── ARCHITECTURE.md                     # ⭐ 架构设计文档（模块依赖/数据流/性能策略）
├── VERSION                             # 版本号（单行）
├── CHANGELOG.md                        # 版本变更记录
├── superpowers/
│   ├── specs/                          # 设计规格书
│   └── plans/                          # 实现计划
└── team/
    ├── designer-log.md / frontend-log.md / art-log.md / qa-log.md / backend-log.md / reviewer-log.md
    ├── designer-research.md / frontend-research.md / qa-research.md / backend-research.md
tests/
└── smoke.test.ts                       # Playwright E2E测试
```

## 各角色 Log 文件格式规范

每个 log 文件遵循统一结构：

```markdown
# [角色名]工作记录

---

## 当前优先级

| 优先级 | 事项 | 状态 |
|--------|------|------|
| P0     | xxx  | 进行中 |
| P1     | xxx  | 待启动 |
| P2     | xxx  | 待评估 |

---

## YYYY-MM-DD — 版本标题

### 成果
- 具体做了什么

### 决策记录 / 技术债务 / 反思
- 为什么这样做
- 遗留了什么问题
```

**规则**：
- 按时间倒序排列（最新在最前）
- 每次版本迭代必须追加一条记录
- 优先级表始终反映当前最新状态
- P0 = 阻塞性问题，P1 = 当前迭代目标，P2 = 未来规划

## 约定

- 策划定义数值，前端引用 `CFG` 常量，QA验证实际效果——三方共同对齐
- 所有 bug 修复必须在 QA log 中有对应条目（复现→根因→验证）
- 数值调整必须在 designer log 中记录决策原因
- 视觉变更必须在 art log 中更新配色表
- 前端不得擅自修改游戏数值，须与策划确认

## 远程仓库同步规则

远程仓库：`origin` → `https://github.com/kongshan001/roguelike-survivor-h5.git`，主分支 `main`。

**每个角色在完成以下工作后，必须将变更提交并推送到 GitHub 远程仓库：**

- 策划：设计规格书（`docs/superpowers/specs/`）更新后推送
- 前端：代码实现（`index.html`）和 `docs/team/frontend-log.md` 更新后推送
- 美术：视觉规范（`docs/team/art-log.md`）更新后推送
- QA：测试报告和缺陷记录（`docs/team/qa-log.md`）更新后推送
- 后端：联机技术方案和调研报告（`docs/team/backend-log.md`、`docs/team/backend-research.md`）更新后推送
- 审核人：审核报告和优化建议（`docs/team/reviewer-log.md`）更新后推送
- 审核人：审核报告和优化建议（`docs/team/reviewer-log.md`）更新后推送
- 版本发布：`docs/VERSION`、`docs/CHANGELOG.md` 更新后推送
- 所有角色 log 文件更新后均须推送

**提交流程**：

1. `git add` 相关变更文件（不使用 `git add -A`，按需暂存）
2. `git commit` — 使用规范的 commit message，注明角色和变更内容（如 `docs(designer): 新增武器系统设计规格`）
3. `git push origin main` — 推送到远程

**commit message 格式**：`<type>(<scope>): <description>`

- type: `feat` / `fix` / `docs` / `style` / `refactor` / `chore`
- scope: `designer` / `frontend` / `art` / `qa` / `backend` / `reviewer` / `release`
