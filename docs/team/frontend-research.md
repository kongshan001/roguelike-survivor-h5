# 前端技术调研报告

> 调研日期：2026-04-04
> 调研角色：前端技术研究员
> 版本：v1.0.0

---

## 调研背景

**当前项目技术栈**：HTML5 Canvas 2D，ES Module 模块化，零构建工具，像素风视觉

**当前架构状态**：
- 已从单 HTML 文件迁移到 ES Module 模块化结构（`src/` 目录）
- 入口文件 `src/main.js` → 核心模块 `src/game.js`（主循环 + 全局状态）
- 模块分层：`core/`（config, math, save）、`entities/`（Player, Enemy, Gem, Food, Chest）、`weapons/`（registry + 10种武器）、`systems/`（camera, spawner, damage-text）、`ui/`（input, scenes, hud, upgrade-panel）、`audio/`（sfx）
- 已实现对象池（子弹/宝石复用，v0.12.0）
- 已实现 DPR 适配（Camera.w2s 逻辑像素）
- 游戏参数集中在 `CFG` 常量配置中
- 使用 `requestAnimationFrame` + delta-time 驱动主循环
- UI 覆盖层使用 DOM 元素（HUD、升级面板、暂停菜单等）
- 已有 Web Audio API 合成音效系统

**当前性能特征**：
- 最大同屏敌人数 `MAX_ENEMIES: 50`，子弹数 `MAX_BULLETS: 100`
- 地图尺寸 `2400x2400` 像素
- 精灵使用 `ctx.fillRect()` 绘制，无外部图片
- 碰撞检测为 O(n*m) 暴力遍历

---

## 1. 框架与架构设计

### 1.1 Entity-Component-System (ECS) 模式

**核心概念**：

| 概念 | 描述 | 类比（当前项目） |
|------|------|------------------|
| Entity | 仅是一个唯一 ID，无逻辑无数据 | 当前各类对象实例（player, enemy, gem） |
| Component | 纯数据容器（position, velocity, health） | 当前分散在各个 class 的属性 |
| System | 逻辑处理器，遍历具有特定组件的实体 | 当前分散在 game.js 主循环和各模块中 |

**ECS 的核心优势**：

1. **数据与逻辑分离**：组件只有数据，系统只有逻辑，职责清晰
2. **组合优于继承**：通过组合组件创建实体类型，而非深层继承链
3. **缓存友好**：连续内存布局（SoA - Struct of Arrays）比离散对象（AoS - Array of Structs）对 CPU 缓存更友好
4. **热插拔**：运行时动态增删组件，实现状态切换（如"冰冻"只需加一个 FrozenComponent）

**适用性评估**：

当前项目实体类型有限（Player、6种Enemy、Bullet、Gem、Food、Chest），每个实体的属性差异较大（Boss有特殊行为、幽灵有穿墙/瞬移），ECS 的收益需要权衡：

- **优点**：代码组织更清晰，升级/维护更容易，支持运行时动态行为组合
- **缺点**：引入 ECS 框架有学习曲线，对当前 ~19 个源文件的规模可能过度设计
- **建议**：不引入完整 ECS 框架，但**借鉴 ECS 的数据驱动思想**——将实体数据与逻辑分离，使用普通对象（plain object）作为数据容器，系统函数操作数据

**参考实现思路**：

```javascript
// 借鉴 ECS 思想，不引入框架
// 实体 = 普通 ID + 组件数据
const entities = [];

function createEnemy(type, x, y) {
  return {
    id: nextId++,
    type,
    pos: { x, y },
    vel: { x: 0, y: 0 },
    hp: CFG.ENEMY_TYPES[type].hp,
    // ...其他数据
  };
}

// 系统 = 操作特定数据的函数
function movementSystem(entities, dt) {
  for (const e of entities) {
    if (e.pos && e.vel) {
      e.pos.x += e.vel.x * dt;
      e.pos.y += e.vel.y * dt;
    }
  }
}
```

### 1.2 状态管理模式

**三种方案的对比**：

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|----------|
| **全局 game 对象**（当前） | 简单直接，访问方便 | 状态分散，难以追踪变化 | 小型项目 |
| **集中式状态树**（类 Redux） | 可预测，可序列化，便于调试 | 每帧更新性能开销大，样板代码多 | UI 重但逻辑轻的游戏 |
| **游戏专用状态机** | 状态转换明确，适合场景/角色状态管理 | 需要额外设计 | 状态驱动的游戏 |

**建议**：当前项目使用全局 `window.game` 对象管理状态是合理的。可改进的方向：
- 将 game 状态拆分为**子系统状态**（combatState, uiState, audioState）
- 引入**有限状态机（FSM）**管理游戏流程（Title → Difficulty → Character → Weapon → Playing → Paused → Result）
- 避免在 game 对象上存储临时变量，用局部变量或子系统管理

### 1.3 ES Module 模块化最佳实践

**当前状态**：项目已迁移到 ES Module，模块分层清晰。

**最佳实践建议**：

1. **循环依赖检测**：使用 `--trace-resolve` 或 ESLint 的 `import/no-cycle` 规则检测循环引用
2. **桶文件（Barrel Export）**：`weapons/registry.js` 已在做这件事，其他目录可参考
3. **模块职责单一化**：当前 `game.js` 仍然承担过多职责（主循环 + 状态 + 逻辑），可进一步拆分
4. **Tree-shaking 友好**：使用命名导出而非默认导出，便于未来引入打包工具时消除无用代码
5. **动态导入**：对于非即时需要的功能（如音效模块），可使用 `import()` 延迟加载

### 1.4 架构演进方向

**短期（当前规模）**：保持现有模块化结构，逐步将 `game.js` 拆分为更细粒度的系统模块

**中期（功能扩展期）**：
- 引入事件总线（Event Bus）解耦系统间通信
- 引入场景管理器（SceneManager）统一管理游戏状态流转
- 数据驱动实体定义（从代码中提取到 JSON 配置）

**长期（架构升级期）**：
- 如需引入复杂实体组合，考虑轻量 ECS 架构
- 如需引入构建工具，考虑 Vite（零配置支持 ES Module 开发）

---

## 2. 核心算法

### 2.1 空间分区算法

当前项目碰撞检测为 O(n*m) 暴力遍历（50 敌人 x 100 子弹 = 5000 次检测/帧），在当前规模下性能尚可，但随着功能扩展会成为瓶颈。

**三种主流方案对比**：

| 算法 | 时间复杂度 | 优点 | 缺点 | 适用场景 |
|------|-----------|------|------|----------|
| **网格划分（Grid/Spatial Hash）** | O(1) 查询 | 实现简单，查询快速，适合动态场景 | 固定分辨率，大小差异大的对象需多层网格 | **首选方案**：敌人/子弹尺寸相近 |
| **四叉树（Quadtree）** | O(log n) 查询 | 自适应细分，适合不均匀分布 | 插入/删除开销大，需频繁重建 | 大地图、对象分布不均匀 |
| **松散四叉树（Loose Quadtree）** | O(log n) 查询 | 减少边界穿越问题，查询更稳定 | 实现复杂度高于普通四叉树 | 对象频繁跨越单元格边界 |

**推荐方案：网格空间哈希（Spatial Hash Grid）**

对于当前项目：
- 所有实体尺寸相近（10-32px），用固定大小的网格即可
- 实体每帧移动，需要高效的插入/删除，网格 O(1) 更适合
- 实现简单，几十行代码即可完成

```javascript
// 网格空间哈希核心思路
class SpatialGrid {
  constructor(cellSize, mapW, mapH) {
    this.cellSize = cellSize;
    this.cols = Math.ceil(mapW / cellSize);
    this.rows = Math.ceil(mapH / cellSize);
    this.grid = new Array(this.cols * this.rows);
  }

  clear() {
    for (let i = 0; i < this.grid.length; i++) this.grid[i] = null;
  }

  _key(col, row) { return row * this.cols + col; }

  insert(entity) {
    const cx = Math.floor(entity.x / this.cellSize);
    const cy = Math.floor(entity.y / this.cellSize);
    const key = this._key(cx, cy);
    // 链表式插入
    entity._next = this.grid[key];
    this.grid[key] = entity;
  }

  query(x, y, radius) {
    const results = [];
    const minC = Math.floor((x - radius) / this.cellSize);
    const maxC = Math.floor((x + radius) / this.cellSize);
    const minR = Math.floor((y - radius) / this.cellSize);
    const maxR = Math.floor((y + radius) / this.cellSize);
    for (let r = minR; r <= maxR; r++) {
      for (let c = minC; c <= maxC; c++) {
        let e = this.grid[this._key(c, r)];
        while (e) { results.push(e); e = e._next; }
      }
    }
    return results;
  }
}
```

**网格大小选择**：建议 `cellSize = 64`（约为最大实体尺寸的 2 倍），一张 2400x2400 的地图产生 37x37 = 1369 个单元格，内存开销极小。

### 2.2 碰撞检测优化

**当前瓶颈分析**：
- 暴力遍历：50 敌人 x 100 子弹 = 5000 次/帧
- 加上拾取检测（宝石、食物、宝箱）、范围伤害（圣水、冰冻光环），总计约 8000-10000 次检测/帧
- 每次 `dist()` 计算涉及 2 次减法 + 2 次乘法 + 1 次 Math.sqrt

**优化策略（按收益排序）**：

| 策略 | 预期收益 | 实现难度 | 说明 |
|------|---------|---------|------|
| **空间哈希网格** | 碰撞检测减少 80-95% | 低 | 先过滤不可能碰撞的远距离实体 |
| **AABB 先行判断** | 避免 sqrt 调用 | 极低 | 先比较 x/y 轴距离，再计算实际距离 |
| **距离平方比较** | 消除 sqrt | 极低 | `dx*dx + dy*dy < r*r` 代替 `dist() < r` |

**分离轴定理（SAT）**：当前项目使用矩形碰撞（`fillRect` 精灵），简单的 AABB 碰撞（矩形重叠检测）已足够，无需引入 SAT 的复杂度。SAT 适用于旋转矩形或凸多边形碰撞。

**Sweep and Prune / BVH**：这些是 3D 引擎的主流方案，对于 2D 像素风游戏属于过度设计。空间哈希网格是最佳选择。

### 2.3 对象池模式

**当前实现状态**：v0.12.0 已实现子弹/宝石的对象池复用。

**进一步优化的方向**：

1. **池化粒子的 SoA 布局**：

```javascript
// AoS（当前风格）— 缓存不友好
const particles = [{ x, y, vx, vy, life, color }, ...];

// SoA（优化后）— 缓存友好
class ParticlePool {
  constructor(max) {
    this.x = new Float32Array(max);
    this.y = new Float32Array(max);
    this.vx = new Float32Array(max);
    this.vy = new Float32Array(max);
    this.life = new Float32Array(max);
    this.active = new Uint8Array(max);
    this.count = 0;
    this.max = max;
  }
}
```

2. **结构化对象池**：为不同类型的对象建立独立池（EnemyPool、BulletPool、GemPool、ParticlePool），避免类型检查开销
3. **预分配策略**：游戏启动时一次性分配所有池的内存，避免运行时扩容

**GC 压力分析**：现代 JS 引擎的 GC 通常只占运行时间的 5% 以下。但对于 60fps 游戏来说，一次 GC 暂停可能导致掉帧。对象池的核心价值不是减少 GC 总时间，而是**消除不可预测的 GC 暂停**。

### 2.4 路径搜索与避障算法

**当前实现**：所有敌人直线追踪玩家位置（`moveToward(player.x, player.y)`），无路径搜索。

**简化避障方案（适合大量敌人）**：

| 方案 | 复杂度 | 适用场景 | 说明 |
|------|--------|---------|------|
| **转向行为（Steering Behavior）** | O(n) | 追踪+避障+分离 | 每个敌人计算合力方向：seek + separation + obstacle avoidance |
| **流场（Flow Field）** | O(W*H) 一次 + O(1) 查询 | 大量敌人追踪同一目标 | 预计算到目标的最优方向场，每个敌人查表移动 |
| **势场法（Potential Field）** | O(n*m) | 简单动态避障 | 玩家产生引力，障碍产生斥力 |
| **A*/JPS** | O(n log n) | 复杂地图寻路 | 当前无障碍物，不需要 |

**推荐方案：转向行为（Steering Behavior）**

对于当前项目：
- 无障碍物，不需要路径搜索
- 敌人只需要追踪玩家，加入 **separation**（避免重叠）即可大幅提升视觉质量
- 实现简单：每个邻居在重叠时施加一个排斥力

```javascript
// Separation: 避免敌人重叠
function separationForce(enemy, neighbors) {
  let fx = 0, fy = 0;
  for (const other of neighbors) {
    const dx = enemy.x - other.x;
    const dy = enemy.y - other.y;
    const d = Math.sqrt(dx * dx + dy * dy);
    if (d < SEPARATION_RADIUS && d > 0) {
      fx += dx / d / d;  // 距离越近，排斥力越大
      fy += dy / d / d;
    }
  }
  return { fx, fy };
}
```

**流场（Flow Field）**：如果未来引入障碍物地形，Flow Field 是大量敌人寻路的最优方案——只需计算一次方向场，所有敌人查表移动，性能与敌人数量无关。

---

## 3. 图形学与渲染优化

### 3.1 离屏 Canvas 缓存策略

**核心原理**：Canvas-to-Canvas 的 `drawImage()` 比重复绘制路径快得多。将静态内容预渲染到离屏 Canvas，每帧直接贴图。

**三种缓存策略**：

| 策略 | 描述 | 适用场景 |
|------|------|---------|
| **精灵缓存** | 每个 `fillRect` 精灵预渲染到小 Canvas | 精灵绘制复杂、重复使用多 |
| **地图缓存** | 整个地图背景预渲染到大 Canvas | 地图背景不变 |
| **UI 元素缓存** | HUD 组件预渲染 | HUD 不频繁变化 |

**对当前项目的分析**：

当前精灵使用 `ctx.fillRect()` 绘制，单次调用开销极低（<1 微秒）。离屏缓存的开销（drawImage + Canvas 对象创建）可能反而更高。**因此，不建议对当前的 fillRect 精灵做离屏缓存**。

**建议缓存的场景**：
- 如果未来精灵绘制复杂化（多层 fillRect + 轮廓 + 阴影），则缓存有价值
- 小地图（60x60px）可考虑缓存，减少每帧重绘开销
- 复杂 UI 覆盖（如果有大量 DOM 重排）考虑用 Canvas 替代

### 3.2 WebGL 与 Canvas 2D 混合渲染

**性能对比**：

| 维度 | Canvas 2D | WebGL |
|------|-----------|-------|
| 初始化时间 | ~15ms | ~40ms |
| 大量对象持续渲染 | CPU 瓶颈 | GPU 加速，高上限 |
| API 复杂度 | 简单 | 复杂（着色器、缓冲区） |
| 兼容性 | 100% | 97%+（极老设备可能不支持） |
| draw call 优化 | 有限 | 批量渲染、实例化 |

**混合方案**：使用 WebGL 作为渲染后端，Canvas 2D API 作为前端（类似 Pixi.js 的方案）

**对当前项目的评估**：
- 当前 fillRect 精灵 + 50 敌人的规模，Canvas 2D 完全够用
- WebGL 的收益在**数百个以上同屏对象**时才明显
- 引入 WebGL 意味着重写整个渲染管线，成本极高

**建议**：保持 Canvas 2D。如果未来性能瓶颈出现在渲染层（而非逻辑层），再考虑：
1. 引入 Pixi.js 作为渲染层（自动 WebGL 降级 Canvas 2D）
2. 或自行封装一个轻量 WebGL 2D 渲染器

### 3.3 精灵图集（Sprite Atlas）

**概念**：将多个小精灵合并到一张大图（图集），通过 `drawImage(atlas, sx, sy, sw, sh, dx, dy, dw, dh)` 裁剪绘制。

**优势**：
- 减少纹理切换开销（GPU 只需绑定一次纹理）
- draw call 合批：相同图集的绘制可连续执行
- 便于动画帧管理（行 = 实体类型，列 = 动画帧）

**对当前项目的适用性**：
- 当前没有外部图片，所有精灵用 `fillRect` 绘制
- 如果保持像素风 fillRect，图集没有意义
- **如果未来引入像素风精灵图**（预渲染的像素图），图集是必须的

**替代方案**：将 fillRect 精灵预渲染到一张离屏 Canvas 图集上，然后用 drawImage 裁剪绘制。这样可以在保持像素风的同时利用图集的批量渲染优势。

### 3.4 脏矩形渲染（Dirty Rectangle Rendering）

**原理**：只重绘画面中发生变化的区域（脏矩形），不变的区域保持原样。

**实现方式**：
1. 每帧跟踪所有发生变化的位置，记录脏矩形
2. 合并重叠的脏矩形
3. 使用 `ctx.clip()` 限制绘制区域到脏矩形
4. 清除并重绘脏矩形区域

**对当前项目的评估**：
- 当前游戏画面**几乎每帧都在变化**（玩家移动、敌人移动、子弹飞行、粒子效果）
- 脏矩形覆盖率可能接近 100%，优化收益有限
- 实现脏矩形合并算法有一定复杂度

**结论**：当前项目不适合脏矩形渲染。原因：动作游戏的画面变化率太高。脏矩形更适合 UI 应用或回合制游戏。

### 3.5 requestAnimationFrame 调度优化

**当前实现**：`requestAnimationFrame` + delta-time

**优化策略**：

1. **固定时间步（Fixed Timestep）**：

```javascript
const FIXED_DT = 1 / 60;  // 固定 60fps 逻辑帧率
let accumulator = 0;

function gameLoop(timestamp) {
  const dt = (timestamp - lastTime) / 1000;
  lastTime = timestamp;
  accumulator += dt;

  // 固定步长更新逻辑，确保物理一致性
  while (accumulator >= FIXED_DT) {
    update(FIXED_DT);  // 逻辑更新用固定 dt
    accumulator -= FIXED_DT;
  }

  render(accumulator / FIXED_DT);  // 渲染用插值
  requestAnimationFrame(gameLoop);
}
```

**好处**：
- 物理和碰撞逻辑不受帧率波动影响
- 避免低帧率下穿墙、碰撞丢失等问题
- 渲染帧可用插值实现平滑显示

2. **帧率自适应降级**：
- 监测最近 30 帧的平均 dt
- 如果持续超帧（dt > 20ms），降低同屏敌人数或关闭粒子效果
- 避免在低端设备上卡死

### 3.6 Draw Call 优化策略

**当前问题**：每个精灵单独调用 `fillRect()`，每次可能设置不同的 `fillStyle`，导致频繁的渲染状态切换。

**优化方向**：

| 策略 | 描述 | 预期收益 |
|------|------|---------|
| **按颜色/类型排序** | 相同 fillStyle 的 fillRect 连续执行 | 减少状态切换 |
| **批量路径绘制** | 用 `beginPath()` + 多个 `rect()` + 一次 `fill()` | 合并 draw call |
| **减少 save/restore** | 避免不必要的 ctx 状态保存恢复 | 减少栈操作 |
| **整数坐标** | 使用 `Math.round()` 或位运算 `(x \| 0)` | 避免子像素渲染 |

**推荐立即实施的优化**：

```javascript
// 按 color 分组批量绘制（减少 fillStyle 切换）
function drawEntities(entities) {
  // 按颜色分组
  const groups = new Map();
  for (const e of entities) {
    const color = e.color;
    if (!groups.has(color)) groups.set(color, []);
    groups.get(color).push(e);
  }

  // 每种颜色一次 fill
  for (const [color, list] of groups) {
    ctx.fillStyle = color;
    ctx.beginPath();
    for (const e of list) {
      const [sx, sy] = Camera.w2s(e.x, e.y);
      ctx.rect(sx - e.w/2, sy - e.h/2, e.w, e.h);
    }
    ctx.fill();
  }
}
```

---

## 4. Web 性能技术

### 4.1 Web Workers 并行计算

**核心能力**：Web Workers 在独立线程中运行 JavaScript，不阻塞主线程。

**游戏中的适用场景**：

| 场景 | 适合 Offload | 说明 |
|------|:-----------:|------|
| AI 决策（大量敌人的目标选择、行为评估） | 是 | 纯计算，无 DOM 依赖 |
| 碰撞检测 | 是 | 纯数学运算，结果传回主线程 |
| 路径搜索 | 是 | A*/Flow Field 计算 |
| 粒子模拟 | 是 | 位置/速度更新 |
| 渲染 | 见 4.2 | 需要 OffscreenCanvas |
| 游戏逻辑 | 否 | 需要同步状态，延迟不可控 |

**通信开销**：Worker 与主线程通过 `postMessage` 通信，数据需要序列化/反序列化（结构化克隆）。对于大量数据，使用 `Transferable`（ArrayBuffer 转移所有权）可避免复制开销。

**对当前项目的评估**：
- 当前规模（50 敌人、100 子弹），主线程完全能处理
- 引入 Worker 的主要成本：通信延迟（约 0.5-2ms/message）、代码复杂度增加
- **不建议立即引入**，但在未来敌人数量突破 200+ 时可考虑

### 4.2 OffscreenCanvas 在 Worker 中渲染

**能力**：将 Canvas 的所有权转移到 Worker，在 Worker 中直接绘制，渲染结果自动合成到页面上。

**浏览器支持**：Chrome/Edge 完全支持，Firefox 部分支持（仅 WebGL context），Safari 16.4+ 支持。

**限制**：
- 不支持 `ctx.getContext('2d')` + `ctx.drawImage()` 嵌套
- Canvas 一旦 transferControlToOffscreen，主线程无法再操作
- 多 Canvas 场景下，每个 Canvas 需要独立 Worker

**对当前项目的评估**：
- 需要考虑兼容性（Safari 较新版本才支持）
- 对于像素风 fillRect 游戏，OffscreenCanvas 的收益有限
- **作为中期规划**，可在粒子系统上尝试 Worker + OffscreenCanvas

### 4.3 WebAssembly (Wasm) 加速

**适用场景**：将计算密集型算法用 Rust/C++ 编译为 Wasm，获得接近原生的执行速度。

**现实评估**：

| 维度 | JavaScript | Wasm |
|------|-----------|------|
| 数值计算速度 | 基准 | 2-10x 更快 |
| JS↔Wasm 互操作开销 | - | 每次调用约 50-200ns |
| Canvas API 调用 | 原生支持 | 需要通过 JS 桥接，**反而更慢** |
| 开发复杂度 | 低 | 需要 Rust/C++ 工具链 |

**关键发现**：Wasm 的性能优势在**纯计算**上体现，但通过 `web-sys` 调用 Canvas 2D API 时，由于 JS↔Wasm 桥接开销，性能可能**反而不如纯 JavaScript**。只有当大量计算逻辑可以完全在 Wasm 中完成（如物理模拟、碰撞检测），仅将最终结果传回 JS 时，Wasm 才有优势。

**建议**：当前项目不需要引入 Wasm。计算规模太小（50 敌人），JS 的 JIT 编译器足以应对。Wasm 适合的场景是：粒子数 > 10000、物理模拟 > 1000 个刚体、大地图路径搜索。

### 4.4 requestIdleCallback 利用空闲时间

**能力**：在浏览器空闲时执行低优先级任务，不阻塞关键渲染帧。

**游戏中的适用场景**：
- 预生成精灵缓存
- 异步加载/解析配置数据
- 预计算下一波敌人的属性
- 非关键的 UI 更新（统计数据显示）

**注意**：游戏运行时主线程通常不空闲（每帧都有 update + render），requestIdleCallback 主要在菜单/加载场景有用。

### 4.5 Performance API 监控

**关键 API**：

```javascript
// 帧率监控
const frameTimes = [];
function monitorFPS(timestamp) {
  frameTimes.push(timestamp);
  if (frameTimes.length > 60) frameTimes.shift();
  if (frameTimes.length > 1) {
    const avg = (frameTimes[frameTimes.length-1] - frameTimes[0]) / (frameTimes.length - 1);
    const fps = 1000 / avg;
    // 可在开发模式显示 FPS
  }
}

// 性能标记
performance.mark('update-start');
updateLogic(dt);
performance.mark('update-end');
performance.measure('update', 'update-start', 'update-end');
const measure = performance.getEntriesByName('update')[0];
console.log(`Update: ${measure.duration.toFixed(2)}ms`);
```

**建议**：在开发版本中添加 Performance 面板（可切换显示），实时监控 FPS、update 耗时、render 耗时、实体数量、GC 暂停（通过 `PerformanceObserver` 监测 `gc` 事件）。

---

## 5. 移动端优化

### 5.1 触摸事件优化

**当前实现**：项目已有虚拟摇杆和 DASH 按钮，触摸输入基本完善。

**进一步优化**：

| 优化点 | 方法 | 说明 |
|--------|------|------|
| **Passive Listeners** | `addEventListener('touchstart', handler, { passive: true })` | 告知浏览器不会调用 preventDefault，避免阻塞滚动合成 |
| **减少事件频率** | 使用 `requestAnimationFrame` 节流 touchmove | 不在每个 touchmove 事件中更新，而是在下一帧统一处理 |
| **touch-action CSS** | `touch-action: none` 防止默认手势 | 项目已在 html/body 上设置 |
| **Pointer Events** | 考虑从 touch events 迁移到 pointer events | 统一鼠标/触摸/笔输入，减少代码复杂度 |

**注意事项**：
- 游戏中的触摸事件**不应**设为 passive（因为可能需要 preventDefault 阻止默认行为）
- 但菜单/按钮的触摸事件可以设为 passive
- 项目已设置 `touch-action: none`，这是游戏 Canvas 的标准做法

### 5.2 GPU 合成层提示

**原理**：通过 CSS 属性提示浏览器将元素提升为独立的 GPU 合成层，使变换（transform、opacity）不触发重排/重绘。

**适用属性**：
- `will-change: transform` — 提示浏览器该元素会变换
- `transform: translateZ(0)` — 强制创建合成层（hack 方式，不推荐）

**对当前项目的建议**：
- Canvas 元素本身已在 GPU 合成层上
- DOM UI 元素（HUD、升级面板）可添加 `will-change: transform, opacity`
- **注意**：`will-change` 应该谨慎使用，过多合成层会消耗 GPU 内存

```css
#hud { will-change: transform; }
.upg-card { will-change: transform, opacity; }
```

### 5.3 内存管理

**移动端内存压力**：移动设备内存有限（低端设备可能只有 2-4GB 总内存，分给浏览器不到 1GB）。

**优化策略**：

| 策略 | 描述 | 当前项目状态 |
|------|------|-------------|
| **对象池** | 复用对象减少 GC 压力 | 已实现子弹/宝石池 |
| **数组长度管理** | 避免数组无限增长，设最大长度 | MAX_ENEMIES: 50, MAX_BULLETS: 100 |
| **纹理内存控制** | 使用离屏 Canvas 时注意总像素数 | 无离屏 Canvas |
| **移除不可见实体** | 视口外的实体简化更新或暂停 | 可优化 |
| **事件监听器清理** | 避免重复添加监听器 | 需检查 |

**视口外实体优化**：对于视野外的敌人，可以：
- 降低更新频率（每 3 帧更新一次位置）
- 简化 AI 决策（不做复杂计算）
- 不渲染（当前已通过 Camera.w2s 裁剪实现）

### 5.4 帧率自适应策略

**目标**：在低端设备上保持可玩的帧率，而非强求 60fps。

**分级策略**：

| 检测指标 | 降级措施 |
|---------|---------|
| 平均 FPS < 45 | 关闭粒子效果 |
| 平均 FPS < 30 | 减少最大敌人数（50 → 30） |
| 平均 FPS < 20 | 降低地图尺寸或简化精灵 |
| 内存压力高 | 缩小对象池大小 |

**实现框架**：

```javascript
class PerformanceScaler {
  constructor() {
    this.frameTimes = [];
    this.qualityLevel = 2;  // 2=高, 1=中, 0=低
  }

  recordFrame(dt) {
    this.frameTimes.push(dt);
    if (this.frameTimes.length > 120) this.frameTimes.shift();
  }

  evaluate() {
    if (this.frameTimes.length < 60) return;
    const avg = this.frameTimes.reduce((a, b) => a + b) / this.frameTimes.length;
    const fps = 1000 / avg;

    if (fps < 20 && this.qualityLevel > 0) this.qualityLevel--;
    else if (fps > 55 && this.qualityLevel < 2) this.qualityLevel++;
  }
}
```

---

## 6. 游戏专用技术

### 6.1 粒子系统设计

**当前状态**：项目已有基础的视觉效果（伤害数字、屏幕震动），但无独立的粒子系统。

**粒子系统架构设计**：

```
Emitter（发射器）
  ├── 位置/方向/发射速率
  └── ParticlePool（粒子池）
        ├── SoA 数据布局（Float32Array）
        └── 预分配最大粒子数

Renderer（渲染器）
  ├── 按颜色/纹理批量绘制
  └── Alpha 衰减（生命周期映射）
```

**性能要点**：

| 技术点 | 描述 | 重要性 |
|--------|------|--------|
| **SoA 数据布局** | 用 Float32Array 存储位置/速度/生命 | 高（缓存友好） |
| **固定大小池** | 预分配，环形缓冲区覆盖最老粒子 | 高（零 GC） |
| **颜色批量绘制** | 相同颜色粒子合批 | 中（减少 fillStyle 切换） |
| **LOD 渲染** | 远处粒子简化绘制（更小的 rect） | 低（当前视口不大） |

**Canvas 2D 的 GPU Instancing 限制**：Canvas 2D API 没有原生 GPU instancing 能力。要实现 GPU 级别的粒子渲染，需要切换到 WebGL 的 `drawArraysInstanced()`。对于像素风游戏，Canvas 2D 的 fillRect 批量绘制已足够处理数百个粒子。

### 6.2 屏幕后处理效果

**适合像素风的后处理效果**：

| 效果 | 描述 | 实现方式 | 性能影响 |
|------|------|---------|---------|
| **扫描线（Scanlines）** | CRT 显示器效果 | 隔行降低亮度 | 极低 |
| **色差（Chromatic Aberration）** | RGB 通道微小偏移 | RGB 通道分别偏移绘制 | 低 |
| **晕影（Vignette）** | 画面边缘变暗 | 径向渐变覆盖 | 低 |
| **Bloom（辉光）** | 亮区光晕扩散 | 多层模糊叠加 | 中-高 |
| **CRT 弯曲** | 屏幕边缘弯曲 | WebGL 着色器 | 需 WebGL |

**纯 Canvas 2D 实现方案**：

```javascript
// 扫描线效果（极低成本）
function drawScanlines(ctx, w, h) {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
  for (let y = 0; y < h; y += 4) {
    ctx.fillRect(0, y, w, 1);
  }
}

// 晕影效果
function drawVignette(ctx, w, h) {
  const gradient = ctx.createRadialGradient(w/2, h/2, w*0.3, w/2, h/2, w*0.7);
  gradient.addColorStop(0, 'rgba(0,0,0,0)');
  gradient.addColorStop(1, 'rgba(0,0,0,0.4)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, w, h);
}
```

**Bloom 效果的挑战**：真正的 Bloom 需要高斯模糊，Canvas 2D 没有原生模糊 API（`ctx.filter = 'blur()'` 兼容性差且性能不佳）。可行的方案是：
- 多层半透明叠加模拟辉光（Phaser RetroZone 的三遍渲染法）
- 或使用 WebGL 后处理管线

**建议**：扫描线 + 晕影可以低成本实现，增强像素风复古感。Bloom 暂不建议，性能成本过高。

### 6.3 音频优化

**当前实现**：Web Audio API 合成 8-bit 音效。

**优化方向**：

| 方向 | 描述 | 优先级 |
|------|------|--------|
| **Audio Sprites** | 将多个音效合并为一个 AudioBuffer，通过偏移播放 | 中 |
| **AudioContext 复用** | 全局一个 AudioContext，所有音效共享 | 高（当前应已实现） |
| **音效池** | 复用 AudioBufferSourceNode，避免频繁创建 | 中 |
| **空间音频** | 根据声源距离调节音量/pan | 低 |
| **Audio Worklet** | 自定义音频处理节点 | 低（当前合成音效够用） |

**Audio Worklet 的现实状况**：
- Audio Worklet 规范在实践中存在显著的兼容性和稳定性问题
- 对于当前的合成音效（简单的 OscillatorNode + GainNode），Audio Worklet 没有优势
- Audio Worklet 适用于自定义 DSP 效果（如实时混响、滤波器），当前项目不需要

**移动端音频延迟**：Android 上的 Web Audio 延迟约 330ms（Chrome），这是一个已知的浏览器层面问题，无法在应用层面解决。建议：
- 将音效设计为"反馈型"（击中、拾取）而非"预判型"（需要精确同步的节拍）
- 接受移动端音效延迟是平台限制

---

## 优化方向建议（按优先级排序）

| 优先级 | 优化方向 | 预期收益 | 实现难度 | 适用场景 |
|--------|----------|----------|----------|----------|
| P0 | 距离平方比较（消除 sqrt） | 碰撞检测提速 30-50% | 极低 | 立即可做 |
| P0 | AABB 先行判断 | 减少不必要的精确碰撞计算 | 极低 | 立即可做 |
| P0 | Draw Call 批量绘制（按颜色分组） | 渲染性能提升 20-40% | 低 | 立即可做 |
| P0 | Performance API 监控面板 | 开发效率提升 | 低 | 开发阶段 |
| P1 | 网格空间哈希碰撞检测 | 碰撞检测减少 80-95% | 中 | 敌人 > 80 时 |
| P1 | 对象池 SoA 布局（TypedArray） | 粒子系统性能提升 | 中 | 引入粒子系统时 |
| P1 | 固定时间步游戏循环 | 物理一致性、低帧率可玩性 | 中 | 需要时 |
| P1 | 敌人 separation 转向行为 | 视觉质量提升、减少重叠 | 低 | 下次迭代 |
| P2 | 离屏 Canvas 精灵缓存 | 复杂精灵渲染优化 | 中 | 精灵复杂化时 |
| P2 | 帧率自适应降级 | 低端设备可玩性 | 中 | 用户反馈卡顿时 |
| P2 | 后处理效果（扫描线/晕影） | 视觉风格增强 | 低 | 美术需求时 |
| P2 | 视口外实体 LOD 更新 | CPU 性能优化 | 低 | 大地图+多敌人 |
| P3 | Web Worker 碰撞检测 | 主线程释放 30-50% CPU | 高 | 敌人 > 200 时 |
| P3 | WebGL 渲染后端 | 渲染性能上限大幅提升 | 极高 | 需要大量粒子/精灵 |
| P3 | Wasm 加速核心算法 | 计算密集场景 2-10x 提速 | 高 | 物理模拟/AI |
| P3 | 事件总线解耦系统 | 代码架构优化 | 中 | 架构重构时 |
| P3 | 场景管理器 FSM | 状态管理规范化 | 中 | 架构重构时 |

---

## 当前项目可落地项

以下优化可立即实施，无需架构变更：

### 1. 距离平方比较

将所有 `dist(a, b) < radius` 替换为 `distSq(a, b) < radius * radius`，消除 `Math.sqrt()` 调用。影响范围：碰撞检测、拾取范围、武器命中判断。

### 2. AABB 先行判断

在精确碰撞前先用 x/y 轴距离快速排除不可能碰撞的对象：

```javascript
function canCollide(a, b) {
  const dx = Math.abs(a.x - b.x);
  const dy = Math.abs(a.y - b.y);
  const maxD = a.w/2 + b.w/2;  // 或其他合适的阈值
  return dx < maxD && dy < maxD;
}
```

### 3. Draw Call 批量绘制

将渲染循环中的逐个 fillRect 改为按颜色分组批量绘制。这是 Canvas 2D 渲染优化的最佳实践。

### 4. Performance 面板

添加开发模式下的 FPS/帧时间监控，使用 `performance.mark/measure` 追踪各系统耗时。

### 5. GPU 合成层提示

为 UI 元素添加 `will-change: transform` CSS 属性。

---

## 中期规划项（1-2 个迭代后实施）

### 1. 网格空间哈希碰撞检测

当同屏实体数量增长到 80+ 时，暴力遍历将成为性能瓶颈。实现空间哈希网格可将碰撞检测从 O(n*m) 降至 O(n)。

### 2. 粒子系统

独立的粒子系统模块，使用 SoA TypedArray 布局 + 固定大小对象池。用于：击杀爆炸效果、升级光环、Boss 登场特效、拾取反馈。

### 3. 敌人转向行为（Steering Behavior）

引入 separation 力避免敌人重叠，提升视觉质量和游戏体验。

### 4. 固定时间步游戏循环

引入 fixed timestep + accumulator 模式，确保物理一致性，改善低帧率设备上的游戏体验。

### 5. 游戏状态机（FSM）

将 game.js 中的状态管理重构为明确的有限状态机，规范 Title → Difficulty → Character → Weapon → Playing → Paused → Result 的流转。

---

## 长期规划项（架构级变更）

### 1. ECS 架构迁移

当实体类型超过 15 种、组件组合复杂度高时，考虑引入轻量 ECS 架构。不使用第三方库，自行实现基于普通对象的最小 ECS。

### 2. WebGL 渲染后端

当渲染性能成为瓶颈（数百个同屏实体、大量粒子），考虑引入 WebGL 作为渲染后端。方案选择：
- 引入 Pixi.js（最简单，自动降级 Canvas 2D）
- 自行封装轻量 WebGL 2D 渲染器（更灵活）

### 3. Web Worker 并行化

当逻辑计算成为瓶颈（敌人 > 200、复杂 AI），将碰撞检测和 AI 计算迁移到 Web Worker。使用 Transferable ArrayBuffer 避免数据复制开销。

### 4. 构建工具引入

如果项目规模继续增长，考虑引入 Vite 作为开发服务器和构建工具：
- 开发时 ES Module 热更新
- 生产时 Tree-shaking + 代码压缩
- 支持未来引入 TypeScript

---

## 附录：参考来源

### 架构与设计模式
- [The Entity-Component-System pattern - JavaScript for Games](https://jsforgames.com/ecs/)
- [An Entity Component System in JavaScript - Kartones' Blog](https://blog.kartones.net/post/ecs-in-javascript/)
- [The Entity-Component-System Design Pattern - UMLBoard](https://www.umlboard.com/design-patterns/entity-component-system.html)
- [Game Development Patterns and Architectures in JavaScript - GitNation](https://gitnation.com/contents/game-development-patterns-and-architectures-in-javascript)
- [Best Practice Tips for Writing Your JS Modules - DEV Community](https://dev.to/ndesmic/best-practice-tips-for-writing-your-js-modules-40o5)

### 空间分区与碰撞
- [Quadtree vs Spatial Hashing - Visualization](https://zufallsgenerator.github.io/2014/01/26/visually-comparing-algorithms)
- [When is a quadtree preferable over spatial hashing? - GameDev StackExchange](https://gamedev.stackexchange.com/questions/69776/when-is-a-quadtree-preferable-over-spatial-hashing)
- [Efficient Collision Detection Using QuadTrees - Medium](https://medium.com/@ahmetturkgenc10/efficient-collision-detection-using-quadtrees-in-game-development-c4e94370bda3)
- [Spatial Hash Grids & Tales from Game Development - SimonDev (YouTube)](https://www.youtube.com/watch?v=z0YFFg_nBjw)

### Canvas 渲染优化
- [Optimising HTML5 Canvas Rendering - AG Grid Blog](https://blog.ag-grid.com/optimising-html5-canvas-rendering-best-practices-and-techniques/)
- [Optimizing Canvas - MDN Web Docs](https://developer.mozilla.org/en-US/Web/API/Canvas_API/Tutorial/Optimizing_canvas)
- [How to Optimize Canvas Performance for Cross-Device (2025-2026)](https://docs.bswen.com/blog/2026-02-21-canvas-performance-optimization/)
- [OffscreenCanvas - Speed Up Your Canvas Operations - web.dev](https://web.dev/articles/offscreen-canvas)

### Web 性能
- [Static Memory JavaScript with Object Pools - web.dev](https://web.dev/articles/speed-static-mem-pools)
- [Boost Front-End Performance in 2025 with OffscreenCanvas - Medium](https://javascript.plainenglish.io/boost-front-end-performance-in-2025-with-offscreencanvas-a37251d8b5d6)
- [Using Web Workers and OffscreenCanvas for Smooth Rendering - Medium](https://medium.com/@lightxdesign55/using-web-workers-and-offscreencanvas-for-smooth-rendering-in-javascript-1c9df43fdb52)
- [Rustwasm vs JavaScript Canvas2D Performance - StackOverflow](https://stackoverflow.com/questions/78943557/rustwasm-web-sys-vs-javascript-canvas2d-performance-issue)

### 移动端优化
- [Use Passive Listeners to Improve Scrolling Performance - Chrome Developers](https://developer.chrome.com/docs/lighthouse/best-practices/uses-passive-event-listeners)
- [Best Practices of Building Mobile-Friendly HTML5 Games - Gamedev.js](https://gamedevjs.com/articles/best-practices-of-building-mobile-friendly-html5-games/)
- [HTML5 Techniques for Optimizing Mobile Performance - web.dev](https://web.dev/articles/mobile-optimization-and-performance)

### WebGL 与渲染对比
- [SVG vs Canvas vs WebGL: Benchmarked - SVG Genie (2025)](https://www.svggenie.com/blog/svg-vs-canvas-vs-webgl-performance-2025)
- [A Look at 2D vs WebGL Canvas Performance - semi/signal](https://semisignal.com/a-look-at-2d-vs-webgl-canvas-performance/)

### 后处理效果
- [WebGL CRT Shader - Matt Sephton (2026)](https://blog.gingerbeardman.com/2026/01/04/webgl-crt-shader/)
- [Retro CRT Shader - Babylon.js](https://babylonjs.medium.com/retro-crt-shader-a-post-processing-effect-study-1cb3f783afbc)
- [Pixel Manipulation with Canvas - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Pixel_manipulation_with_canvas)

### 音频
- [Web Audio API - MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [AudioWorklet Issues - GitHub WebAudio/web-audio-api #2632](https://github.com/WebAudio/web-audio-api/issues/2632)
- [WebAudio High Latency on Android - Chromium Bug #40103372](https://issues.chromium.org/issues/40103372)
- [Awesome WebAudio - GitHub](https://github.com/notthetup/awesome-webaudio)

### 游戏循环
- [JavaScript Game Loop In-Depth Explanation](https://maliut.space/p/javascript-game-loop/)
