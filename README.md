# 🎮 肉鸽幸存者

> 5分钟，活下来。

H5 类吸血鬼幸存者肉鸽游戏，纯 Canvas 2D 实现，零外部依赖，像素风视觉，支持触控和键盘操控。

**在线体验**: https://kongshan001.github.io/roguelike-survivor-h5/

> 💡 **国内访问提示**: 如遇访问困难，可使用 Vercel 镜像：https://roguelike-survivor-h5.vercel.app（需自备梯子）

---

## ✨ 特性

- **3个角色** — 魔法师(均衡)、战士(坦克)、游侠(速攻)
- **6种基础武器** — 圣水/飞刀/闪电/圣经/火焰法杖/冰冻光环
- **6种进化武器** — 双武器组合进化，大幅强化
- **12种协同效果** — 被动+被动/武器+被动，隐藏加成
- **7种敌人** — 僵尸/蝙蝠/骷髅/幽灵/精英骷髅/分裂虫/Boss
- **3档难度** — 休闲/标准/噩梦
- **10个挑战任务** — 跨局成就追踪
- **永久升级商店** — 灵魂碎片局外强化
- **AUTO挂机** — 自动选择升级，解放双手
- **移动端适配** — 虚拟摇杆+触控Dash

---

## 🚀 快速开始

```bash
# 安装依赖
npm install

# 启动本地服务器
npm run serve
# 浏览器打开 http://localhost:8765
```

> **注意**: 由于使用 ES6 Modules，不支持直接双击 `index.html` 打开（浏览器会因 CORS 策略阻止 `file://` 协议的模块加载）。必须通过 HTTP 服务器访问。

---

## 🎮 操作方式

| 操作 | 键盘 | 触控 |
|------|------|------|
| 移动 | WASD / 方向键 | 左侧虚拟摇杆 |
| 冲刺 | Shift / Space | 右侧 DASH 按钮 |
| 暂停 | Esc / P | 右上角 ⏸ 按钮 |
| 自动升级 | 点击 HUD 的 AUTO 按钮 | 同左 |

---

## 🛠 技术栈

| 技术 | 用途 |
|------|------|
| Canvas 2D | 游戏渲染（纯 fillRect 像素风） |
| ES6 Modules | 模块化架构，零构建工具 |
| Web Audio API | 8-bit 程序化音效 |
| localStorage | 存档持久化 |
| Playwright | E2E 自动化测试 |

---

## 📁 项目结构

```
src/
├── main.js                 # 入口
├── game.js                 # 主循环 + 游戏状态 + 渲染
├── core/                   # config.js / math.js / save.js
├── entities/               # Player / Enemy / Gem / Food / Chest
├── weapons/                # registry.js（12个武器类）
├── systems/                # camera / spawner / damage-text
├── audio/                  # sfx.js（音效+屏幕震动）
└── ui/                     # input / scenes / hud / panels
```

详细架构设计见 [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)。

---

## 🧪 测试

```bash
npm test              # 运行全部测试（headless）
npm run test:headed   # 可视化模式
npm run test:ui       # Playwright UI 模式
```

14 个 E2E 测试覆盖：核心流程、战斗升级、数值平衡、历史缺陷回归。

---

## 📊 版本历史

| 版本 | 里程碑 |
|------|--------|
| v0.1~0.5 | 核心玩法（移动/攻击/敌人/升级） |
| v0.6~0.9 | 武器系统（6武器+进化）+ 宝箱 |
| v1.0.0 | ES Module 模块化重构（2633行→20模块） |
| v1.1.0 | 协同系统（12种协同） |
| v1.2.0 | Quest 挑战任务 + 永久升级商店 |

完整变更记录见 [docs/CHANGELOG.md](docs/CHANGELOG.md)。

---

## 📄 License

MIT
