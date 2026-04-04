# QA 测试效率调研报告

**调研日期**：2026-04-04
**调研角色**：QA Agent
**当前状态**：14 个 E2E 测试用例，全部通过，运行耗时约 5 分钟
**技术栈**：Playwright 1.51 + TypeScript + GitHub Actions CI

---

## 调研背景

当前项目测试体系基于 Playwright E2E 测试，分为 smoke / gameplay / balance / regression 四个层级，共 14 个用例。全量运行约 5 分钟，CI 通过 GitHub Actions 在 ubuntu-latest 上单线程串行执行。

随着游戏功能迭代（当前 v0.20.0），测试用例将持续增长，5 分钟的运行时间会进一步膨胀。本报告旨在调研 7 个方向的外部技术方案，为后续测试效率提升提供决策依据。

---

## 1. Playwright 高级特性

### 1.1 并行执行优化

#### Workers 并行

Playwright 支持通过 `workers` 配置实现单机多进程并行测试。每个 worker 是独立的浏览器进程，互不干扰。

```typescript
// playwright.config.ts
export default defineConfig({
  workers: process.env.CI ? 4 : '50%',  // CI 用 4 个 worker，本地用 50% CPU 核心
  fullyParallel: true,                   // 所有测试并行执行
});
```

**适用性分析**：当前 14 个用例串行运行约 5 分钟。启用 4 workers 理论上可将耗时降至 1.5-2 分钟。但需注意：
- 游戏测试存在大量 `waitForTimeout` 等待（如等待击杀、等待升级），并行后 CPU 和内存开销增大
- `fullyParallel: true` 要求测试之间完全独立，当前用例已满足此条件

#### Sharding 分片

Playwright 原生支持将测试集分割到多台机器上并行执行：

```bash
# 在 CI 中分 2 片执行
npx playwright test --shard=1/2
npx playwright test --shard=2/2
```

GitHub Actions 中的用法：

```yaml
jobs:
  test:
    strategy:
      matrix:
        shard: [1, 2]
    steps:
      - run: npx playwright test --shard=${{ matrix.shard }}/2
```

执行后通过 `npx playwright merge-reports` 合并报告。

**适用性分析**：当用例超过 30 个时，sharding 收益明显。当前 14 个用例暂不需要，但值得提前规划。

**参考**：
- [Optimizing Test Runtime: Playwright Sharding vs Workers](https://currents.dev/posts/optimizing-test-runtime-playwright-sharding-vs-workers)
- [Playwright Sharding: Complete Guide](https://testdino.com/blog/playwright-sharding/)
- [How to Configure Playwright Parallel Execution (2026)](https://oneuptime.com/blog/post/2026-01-28-playwright-parallel-execution/view)

### 1.2 视觉回归测试

Playwright 内置 `toHaveScreenshot()` 方法，支持截图对比和像素级 diff：

```typescript
test('标题画面无视觉回归', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveScreenshot('title.png', {
    maxDiffPixelRatio: 0.01,  // 允许 1% 像素差异
    animations: 'disabled',    // 禁用动画以避免截图不一致
  });
});
```

首次运行时自动生成基线截图存入 `__screenshots__/` 目录，后续运行自动对比。失败时生成 diff 图（红色高亮差异区域）。

**对 Canvas 游戏的适用性**：
- 非常适合验证标题画面、武器选择界面、结算界面等静态 UI
- 游戏内 Canvas 画面因动画和随机性极高，需冻结游戏状态后截图
- 可配合 `page.evaluate()` 暂停游戏循环后截图

**第三方工具对比**：

| 工具 | 特点 | 适用场景 |
|------|------|----------|
| Playwright 内置 | 零额外依赖，像素 diff | 基础视觉回归 |
| Applitools Eyes | AI 视觉识别，忽略无关变化 | 复杂 UI 对比 |
| Percy (BrowserStack) | 团队协作审查，响应式对比 | 团队规模较大时 |
| Chromatic | Storybook 深度集成 | 组件库项目 |

**推荐**：使用 Playwright 内置方案即可满足需求，无需引入第三方工具。

**参考**：
- [Playwright Official Docs - Screenshots](https://playwright.dev/docs/test-snapshots)
- [Playwright Trace Viewer](https://playwright.dev/docs/trace-viewer)

### 1.3 网络拦截与 Mock

Playwright 通过 `page.route()` 提供完整的网络拦截能力：

```typescript
// 拦截 API 请求并返回 Mock 数据
await page.route('**/api/**', route => {
  route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ score: 9999 }),
  });
});

// 模拟网络延迟
await page.route('**/api/**', async route => {
  await new Promise(r => setTimeout(r, 3000));  // 3s 延迟
  await route.continue();
});

// 模拟断网
await page.route('**/api/**', route => route.abort());
```

**对本项目的适用性**：
- 当前游戏为纯单机离线运行，无 API 调用，网络拦截暂时不适用
- 如果未来加入排行榜、存档云同步等在线功能，此能力将变得关键
- 可用于模拟资源加载失败（如字体、音频加载异常）的场景测试

**参考**：
- [Playwright Official Docs - Mock](https://playwright.dev/docs/mock)
- [The Playwright Network Mocking Playbook](https://currents.dev/posts/the-playwright-network-mocking-playbook)
- [Playwright Network Interception (2026)](https://oneuptime.com/blog/post/2026-02-02-playwright-network-interception/view)

### 1.4 录制回放 (Codegen)

Playwright Codegen 是内置的交互录制工具，可自动生成测试代码：

```bash
# 录制并生成 TypeScript 代码
npx playwright codegen --target=typescript http://localhost:8765

# 录制特定设备（移动端模拟）
npx playwright codegen --device="iPhone 13" http://localhost:8765
```

**适用性**：
- 快速生成新测试的骨架代码，特别适合复杂操作序列
- 可录制移动端触控操作，转换为等效的 Playwright API 调用
- 生成的代码通常需要手动调整（添加断言、优化等待策略）
- 不适合直接生成游戏测试（游戏操作需要精确时序控制）

### 1.5 Trace Viewer 高级用法

Trace Viewer 是 Playwright 最强大的调试工具之一，支持"时间旅行"调试：

```typescript
// playwright.config.ts — 配置 trace 采集策略
use: {
  trace: 'on-first-retry',  // 仅在首次重试时记录 trace（节省存储）
  // 其他选项：'on' | 'off' | 'retain-on-failure'
},
```

Trace Viewer 功能：
- **时间线浏览**：逐步回放每个测试操作
- **DOM 快照**：每步操作前的完整 DOM 状态
- **网络日志**：所有 HTTP 请求和响应
- **控制台日志**：浏览器 console 输出
- **截图叠加**：操作时的视觉状态

**高级用法**：

```bash
# CI 中采集 trace，本地分析
npx playwright test                    # CI 执行
npx playwright show-trace trace.zip    # 本地分析

# 编程方式采集自定义数据
await page.context().tracing.start({
  screenshots: true,
  snapshots: true,
  sources: true,
});
```

**适用性**：当前配置已启用 `trace: 'retain-on-failure'`，但可以进一步利用：
- 对 balance 层测试启用完整 trace，辅助数值分析
- 在 CI 中自动上传 trace 作为 artifact

**参考**：
- [Playwright Official Docs - Trace Viewer](https://playwright.dev/docs/trace-viewer)
- [The Ultimate Guide to Playwright Trace Viewer](https://momentic.ai/blog/the-ultimate-guide-to-playwright-trace-viewer-master-time-travel-debugging)

### 1.6 测试标签与分组

Playwright 支持 `tag` 和嵌套 `describe` 进行测试分组：

```typescript
// 使用 tag 标记
test('标题画面 @smoke', { tag: ['@smoke', '@visual'] }, async ({ page }) => {
  // ...
});

// 按标签过滤执行
// npx playwright test --grep @smoke
// npx playwright test --grep-invert @slow

// 嵌套 describe
test.describe('战斗系统', () => {
  test.describe('飞刀', () => {
    test('自动攻击', async ({ page }) => { /* ... */ });
    test('升级伤害', async ({ page }) => { /* ... */ });
  });
  test.describe('圣水', () => {
    test('范围攻击', async ({ page }) => { /* ... */ });
  });
});

// 在配置中按标签设置超时
export default defineConfig({
  projects: [
    {
      name: 'smoke',
      testMatch: /smoke/,
      timeout: 15_000,
    },
    {
      name: 'balance',
      testMatch: /balance/,
      timeout: 120_000,
      retries: 2,
    },
  ],
});
```

**适用性**：当前测试已通过 `describe` 分层，但可以进一步引入 `tag` 实现更灵活的过滤执行，例如 CI 中只运行 `@smoke`，完整测试仅在 nightly build 中执行。

---

## 2. AI 辅助测试

### 2.1 AI 自动生成测试用例

2025-2026 年主流 AI 测试工具：

| 工具 | 核心能力 | 定价模式 |
|------|----------|----------|
| **QA Wolf** | 自然语言生成 Playwright 代码，AI 自愈选择器 | 按测试数量计费 |
| **Mabl** | AI 自动发现回归、自愈测试、低代码 | 企业订阅 |
| **Testim** | AI 自愈选择器、视觉验证 | 免费层 + 企业版 |
| **Virtuoso QA** | 自然语言编写测试、自愈、跨浏览器 | 企业订阅 |
| **Katalon** | AI 推荐、自愈、智能等待 | 免费层 + 企业版 |

**对本项目的适用性**：
- 上述工具多为 SaaS 服务，与本项目的单 HTML 文件架构有集成难度
- 更实际的方案是使用 LLM（如 Claude）辅助编写测试代码，基于游戏设计规格自动生成参数化测试用例
- 可建立 prompt 模板：输入 CFG 配置 -> 输出对应断言代码

### 2.2 智能等待策略

当前测试大量使用 `page.waitForTimeout()` 硬编码等待，这是测试缓慢的主要原因之一。智能等待替代方案：

```typescript
// 当前：硬编码等待
await page.waitForTimeout(8000);  // 等待击杀

// 改进：轮询等待游戏状态
async function waitForKills(page: Page, minKills: number, timeout = 15000) {
  await page.waitForFunction(
    (min) => {
      // @ts-expect-error
      return game.player.kills >= min;
    },
    minKills,
    { timeout }
  );
}

// 改进：等待升级面板出现
async function waitForUpgradePanel(page: Page, timeout = 30000) {
  await page.waitForFunction(
    () => document.getElementById('upgrade-panel')!.style.display !== 'none',
    { timeout }
  );
}
```

**收益分析**：
- `waitForFunction()` 在条件满足时立即返回，不再盲目等待
- 预计可将 gameplay 和 balance 层测试耗时缩短 40-60%
- 需要重构现有测试中的 `waitForTimeout` 调用

### 2.3 AI 辅助缺陷分析

当测试失败时，AI 可辅助进行：
- **自动分类**：根据错误信息自动归类（渲染问题、超时问题、数值问题）
- **根因推荐**：结合 trace 信息和代码变更历史，推荐可能的原因
- **修复建议**：生成修复代码片段

**落地方案**：在 GitHub Actions 中集成 AI 分析步骤：
1. 测试失败时自动采集 trace + 截图 + 日志
2. 调用 LLM API 分析失败原因
3. 自动在 PR 中评论分析结果

### 2.4 自愈测试 (Self-Healing Tests)

自愈测试是指当 UI 结构变化导致选择器失效时，工具自动尝试替代选择器，而不是直接报错。

**Playwright 原生的健壮选择器策略**：
- 优先使用 `getByRole()` / `getByText()`（语义选择器）
- 避免 CSS class 选择器（易变）
- 使用 `data-testid` 作为最后手段

**当前项目评估**：
- 已使用 `getByRole('button', { name: '开始游戏' })` 等语义选择器，具备一定自愈能力
- `.ws-card`、`.upg-card` 等 class 选择器有脆弱风险
- 建议：为关键交互元素添加 `data-testid` 属性

### 2.5 大语言模型在游戏测试中的应用前景

根据 2025 年学术研究（arXiv:2509.22170），LLM Agent 在游戏测试中的应用方向：

1. **AI Bot 自动游玩**：LLM 理解游戏规则后，通过推理生成操作序列，自动探索游戏内容
2. **异常检测**：LLM 分析游戏录像，识别不符合预期的行为
3. **测试用例生成**：根据游戏设计文档自动生成参数化测试矩阵
4. **平衡性分析**：LLM 分析大量对局数据，识别数值不平衡问题

**现实可行性**：
- 对于本项目，最实际的落地路径是用 LLM 生成参数化测试用例
- AI Bot 自动游玩在 Canvas 游戏中需配合截图理解能力，复杂度较高
- 可作为中长期探索方向

**参考**：
- [Leveraging LLM Agents for Automated Video Game Testing (arXiv)](https://arxiv.org/html/2509.22170v1)
- [12 Best AI Testing Tools in 2026 (QA Wolf)](https://www.qawolf.com/blog/the-12-best-ai-testing-tools-in-2026)
- [Best AI Testing Tools 2026 (Virtuoso)](https://www.virtuosoqa.com/post/best-ai-testing-tools)

---

## 3. CI/CD 集成优化

### 3.1 GitHub Actions 矩阵测试

当前 CI 仅在 ubuntu-latest + chromium 上运行。矩阵测试可扩展到多浏览器：

```yaml
jobs:
  test:
    strategy:
      matrix:
        browser: [chromium, firefox, webkit]
        shard: [1, 2]
    steps:
      - run: npx playwright test --project=${{ matrix.browser }} --shard=${{ matrix.shard }}/2
```

**浏览器优先级评估**：

| 浏览器 | 市场份额 | 优先级 | 备注 |
|--------|----------|--------|------|
| Chromium | ~65% | P0 | 主要测试目标 |
| WebKit (Safari) | ~18% | P1 | iOS 用户核心浏览器 |
| Firefox | ~3% | P2 | 低优先级 |

**推荐**：短期只跑 Chromium；中期加入 WebKit（覆盖 iOS Safari）；长期按需加 Firefox。

### 3.2 增量测试

只运行受代码变更影响的测试，减少 CI 执行时间。

**方案一：基于 Git diff 的选择性执行**

```yaml
- name: Detect changed files
  id: changes
  run: |
    if [[ "${{ github.event_name }}" == "pull_request" ]]; then
      CHANGED=$(git diff --name-only origin/main...HEAD)
      if echo "$CHANGED" | grep -q "index.html"; then
        echo "run_tests=true" >> $GITHUB_OUTPUT
      else
        echo "run_tests=false" >> $GITHUB_OUTPUT
      fi
    else
      echo "run_tests=true" >> $GITHUB_OUTPUT
    fi

- name: Run tests
  if: steps.changes.outputs.run_tests == 'true'
  run: npx playwright test
```

**方案二：基于 tag 的选择性执行**

```yaml
# PR 只跑 smoke + regression
- run: npx playwright test --grep "@smoke|@regression"

# main 分支跑全量
- run: npx playwright test
  if: github.ref == 'refs/heads/main'
```

**适用性**：本项目是单 HTML 文件，任何修改都可能影响全局，增量测试收益有限。建议使用 tag 过滤方式，PR 只跑快速测试。

### 3.3 测试缓存优化

当前 CI 每次执行都要重新安装依赖和浏览器，约占总时间的 30-40%。

```yaml
steps:
  - name: Cache node_modules
    uses: actions/cache@v4
    with:
      path: node_modules
      key: ${{ runner.os }}-node-${{ hashFiles('package-lock.json') }}
      restore-keys: |
        ${{ runner.os }}-node-

  - name: Cache Playwright browsers
    uses: actions/cache@v4
    with:
      path: ~/.cache/ms-playwright
      key: ${{ runner.os }}-playwright-${{ hashFiles('package-lock.json') }}
```

**注意**：根据 Grafana 团队的经验反馈，GitHub Actions 公共 runner 可能已内置部分缓存，手动缓存 npm 依赖有时反而更慢。建议实测对比。

**参考**：
- [How To Speed Up Playwright Tests: 7 Tips From Experts](https://currents.dev/posts/how-to-speed-up-playwright-tests)
- [How to Speed Up GitHub Actions Runners](https://namespace.so/blog/how-to-speed-up-github-actions-runners)

### 3.4 PR 自动检查

增强 PR 质量门禁：

```yaml
name: PR Quality Gate
on: pull_request

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npx playwright install --with-deps chromium

      # 快速冒烟测试
      - name: Smoke tests
        run: npx playwright test --grep @smoke

      # 测试报告发布为 PR 评论
      - name: Report
        if: always()
        uses: actions/github-script@v7
        with:
          script: |
            // 读取测试结果并评论到 PR
```

### 3.5 测试报告自动发布

```yaml
- name: Publish test report
  if: always()
  uses: actions/upload-artifact@v4
  with:
    name: playwright-report
    path: tests/report/

- name: Deploy report to GitHub Pages
  if: failure()
  uses: peaceiris/actions-gh-pages@v3
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    publish_dir: tests/report/
```

---

## 4. 性能测试自动化

### 4.1 Lighthouse CI 集成

Lighthouse 主要审计页面加载性能（FCP、LCP、CLS、TBT 等指标），适合测量游戏首次加载体验：

```bash
# 安装
npm install -D @lhci/cli

# 执行
npx lhci autorun --config=lighthouserc.js
```

配置文件：

```javascript
// lighthouserc.js
module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:8765/'],
      startServerCommand: 'npx http-server . -p 8765 -c-1 --silent',
    },
    assert: {
      assertions: {
        'first-contentful-paint': ['warn', { maxNumericValue: 2000 }],
        'interactive': ['warn', { maxNumericValue: 3000 }],
        'total-blocking-time': ['error', { maxNumericValue: 200 }],
      },
    },
  },
};
```

**局限**：Lighthouse 不适合测量 Canvas 游戏运行时性能（FPS、内存），需要补充自定义方案。

### 4.2 Web Vitals 自动化测试

通过 Playwright 采集 Core Web Vitals：

```typescript
test('Core Web Vitals 达标', async ({ page }) => {
  await page.goto('/');

  const metrics = await page.evaluate(() => {
    return new Promise((resolve) => {
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        resolve(entries.map(e => ({
          name: e.name,
          duration: e.duration,
          startTime: e.startTime,
        })));
      }).observe({ type: 'largest-contentful-paint', buffered: true });
    });
  });

  // 验证 LCP < 2s
  // ...
});
```

**参考**：
- [Automating Web Vitals Testing with Playwright](https://medium.com/@lahirukavikara/automating-web-vitals-testing-with-playwright-and-html-reports-a50a3234bcab)
- [Playwright Performance Testing (Checkly)](https://checklyhq.com/docs/learn/playwright/performance)

### 4.3 帧率自动化测试

Canvas 游戏最关键的性能指标是 FPS。通过 Playwright 自动采集：

```typescript
test('游戏运行 FPS >= 30', async ({ page }) => {
  await startGameWithWeapon(page, 'knife');

  // 注入 FPS 计数器
  await page.evaluate(() => {
    (window as any).__fpsLog = [];
    let lastTime = performance.now();
    let frameCount = 0;
    const measure = () => {
      frameCount++;
      const now = performance.now();
      if (now - lastTime >= 1000) {
        (window as any).__fpsLog.push(frameCount);
        frameCount = 0;
        lastTime = now;
      }
      requestAnimationFrame(measure);
    };
    requestAnimationFrame(measure);
  });

  // 运行 10 秒
  await page.waitForTimeout(10000);

  // 采集 FPS 数据
  const fpsLog: number[] = await page.evaluate(() => (window as any).__fpsLog);
  const avgFps = fpsLog.reduce((a, b) => a + b, 0) / fpsLog.length;
  const minFps = Math.min(...fpsLog);

  expect(avgFps).toBeGreaterThanOrEqual(30);
  expect(minFps).toBeGreaterThanOrEqual(15);  // 最低帧率不低于 15
});
```

**适用性**：高优先级。FPS 是 Canvas 游戏用户体验的核心指标，当前没有任何自动化监控。

### 4.4 内存泄漏检测

通过 Chrome DevTools Protocol 采集堆快照：

```typescript
test('长时间运行无内存泄漏', async ({ page }) => {
  await startGameWithWeapon(page, 'knife');

  // 采集初始堆大小
  const heapBefore = await page.evaluate(() =>
    (performance as any).memory.usedJSHeapSize
  );

  // 运行 5 分钟
  const dirs = ['d', 'w', 'a', 's'];
  for (let cycle = 0; cycle < 30; cycle++) {
    for (const dir of dirs) {
      await page.keyboard.down(dir);
      await page.waitForTimeout(2500);
      await page.keyboard.up(dir);
    }
  }

  // 采集结束堆大小
  const heapAfter = await page.evaluate(() =>
    (performance as any).memory.usedJSHeapSize
  );

  // 堆增长不超过 50MB
  const heapGrowth = (heapAfter - heapBefore) / 1024 / 1024;
  expect(heapGrowth).toBeLessThan(50);
});
```

**适用性**：中等优先级。游戏运行 5 分钟的内存稳定性对移动端尤为重要。

### 4.5 长时间运行稳定性测试

模拟完整游戏流程（5 分钟对局），验证无崩溃、无异常退出：

```typescript
test('完整 5 分钟对局稳定运行', async ({ page }) => {
  await startGameWithWeapon(page, 'knife');

  // 记录开始时间
  const startTime = Date.now();

  // 持续操作直到游戏结束或 5 分钟
  while (Date.now() - startTime < 300000) {  // 5 分钟
    const state = await gameState(page);
    if (state.over) break;

    // 移动 + 关闭升级面板
    await page.keyboard.down('d');
    await page.waitForTimeout(2000);
    await page.keyboard.up('d');
    await page.evaluate(() => {
      const cards = document.querySelectorAll('.upg-card');
      if (cards.length > 0) (cards[0] as HTMLElement).click();
    });
  }

  const state = await gameState(page);
  expect(state.over || state.elapsed >= 280).toBe(true);
});
```

---

## 5. 移动端测试

### 5.1 BrowserStack / Sauce Labs 云测平台

BrowserStack 已于 2025 年支持 Playwright 在真实 iOS 设备上运行 Safari 测试。

**BrowserStack + Playwright 配置示例**：

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  projects: [
    {
      name: 'BrowserStack iPhone 13',
      use: {
        connectOptions: {
          wsEndpoint: 'wss://cdp.browserstack.com/playwright?caps=...',
        },
      },
    },
  ],
});
```

**费用考量**：
- BrowserStack Automate 起步价约 $39/月
- Sauce Labs 类似价位
- 对于本项目，免费方案（Playwright 设备模拟）可能已足够

### 5.2 设备模拟（免费方案）

Playwright 内置设备描述符，可模拟移动端：

```typescript
import { devices } from '@playwright/test';

export default defineConfig({
  projects: [
    {
      name: 'iPhone 13',
      use: { ...devices['iPhone 13'] },
    },
    {
      name: 'Pixel 5',
      use: { ...devices['Pixel 5'] },
    },
  ],
});
```

模拟触控操作：

```typescript
test('移动端触控摇杆', async ({ page }) => {
  await page.goto('/');
  // 模拟触控
  const canvas = page.locator('#c');
  const box = await canvas.boundingBox();
  if (box) {
    await page.touchscreen.tap(box.x + 100, box.y + box.height - 80);
  }
});
```

**适用性**：
- 设备模拟可覆盖 DPR 缩放、视口尺寸、userAgent 等方面
- 无法测试真实触控延迟和 GPU 性能差异
- 建议先用设备模拟，发现特定设备问题后再上云测

### 5.3 响应式测试自动化

多分辨率截图对比：

```typescript
const viewports = [
  { name: 'iPhone SE', width: 375, height: 667 },
  { name: 'iPhone 13', width: 390, height: 844 },
  { name: 'iPad', width: 768, height: 1024 },
  { name: 'Desktop', width: 1920, height: 1080 },
];

for (const vp of viewports) {
  test(`标题画面 - ${vp.name}`, async ({ page }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto('/');
    await expect(page).toHaveScreenshot(`title-${vp.name}.png`);
  });
}
```

### 5.4 移动端性能测试

```typescript
test('iPhone SE 上 FPS >= 20', async ({ browser }) => {
  const context = await browser.newContext({
    ...devices['iPhone SE'],
  });
  const page = await context.newPage();

  await startGameWithWeapon(page, 'knife');

  // 注入 FPS 计数器（同 4.3）
  // ... 采集并验证 FPS
  // 低端设备阈值可降低到 20 FPS
});
```

**参考**：
- [Playwright Mobile Testing on Real Devices (2026)](https://testdino.com/blog/playwright-mobile-testing/)
- [BrowserStack Playwright Mobile Automation](https://www.browserstack.com/guide/playwright-mobile-automation)
- [BrowserStack Enables Playwright on Real iOS Safari](https://www.devopsdigest.com/browserstack-enables-playwright-testing-on-real-ios-devices-with-safari)

---

## 6. 质量门禁体系

### 6.1 代码覆盖率

由于本项目是单 HTML 文件（无模块化构建），传统 Istanbul 覆盖率采集需要特殊处理。

**方案一：V8 原生覆盖率 + c8**

```typescript
// playwright.config.ts
export default defineConfig({
  use: {
    collectCoverage: true,  // Playwright 1.51+ 支持
  },
});
```

```bash
# 运行测试并生成覆盖率
npx playwright test
npx c8 report --reporter=text --reporter=html
```

**方案二：Playwright Coverage API**

```typescript
test('覆盖核心函数', async ({ page }) => {
  const coverage = await page.coverage.startJSCoverage();
  await page.goto('/');
  // ... 执行测试操作
  const jsCoverage = await page.coverage.stopJSCoverage();

  // 生成 Istanbul 格式报告
  // 需配合 monocart-coverage-reports 或 @bgotink/playwright-coverage
});
```

**挑战**：
- 单 HTML 文件中所有 JS 代码内联，V8 覆盖率能工作但报告粒度粗
- 无构建步骤意味着无法使用 babel-plugin-istanbul 做源码级插桩
- 覆盖率数据解读需要与测试用例关联

**推荐方案**：使用 `monocart-coverage-reports`，它支持 V8 覆盖率并输出 Istanbul 兼容报告。

**参考**：
- [How To Measure Code Coverage in Playwright Tests](https://currents.dev/posts/how-to-measure-code-coverage-in-playwright-tests)
- [Playwright Coverage API Official Docs](https://playwright.dev/docs/api/class-coverage)
- [monocart-coverage-reports](https://gist.github.com/cenfun/0754c23f03d1aa541b4467920ab4d09f)

### 6.2 静态分析

```bash
# ESLint 安装
npm install -D eslint @eslint/js

# 针对游戏代码的自定义规则（检测硬编码数值）
# 示例：禁止在测试文件中使用魔术数字
```

**适用性**：单 HTML 文件项目的静态分析收益有限。更实际的是：
- 对测试文件做 lint，确保测试代码质量
- 添加 `eslint-plugin-playwright` 校验测试最佳实践

### 6.3 PR 自动检查清单

通过 GitHub Actions 在 PR 中自动生成检查清单：

```yaml
name: PR Checklist
on: pull_request

jobs:
  checklist:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Check version bump
        run: |
          if git diff origin/main...HEAD --name-only | grep -q "index.html"; then
            if ! git diff origin/main...HEAD --name-only | grep -q "docs/VERSION"; then
              echo "::warning::index.html changed but VERSION not bumped"
            fi
          fi

      - name: Check designer log
        run: |
          if git diff origin/main...HEAD --name-only | grep -q "index.html"; then
            if ! git diff origin/main...HEAD --name-only | grep -q "docs/team/designer-log.md"; then
              echo "::warning::Code changed but designer-log.md not updated"
            fi
          fi
```

### 6.4 质量仪表盘

通过 GitHub Actions + GitHub Pages 搭建简易质量仪表盘：

```yaml
# 收集指标并写入 JSON
- name: Collect metrics
  if: always()
  run: |
    echo '{
      "date": "'$(date +%Y-%m-%d)'",
      "total_tests": 14,
      "passed": 14,
      "failed": 0,
      "duration_seconds": 300,
      "version": "'$(cat docs/VERSION)'"
    }' > metrics.json
```

长期可考虑集成 [Currents.dev](https://currents.dev) 或 [Allure Report](https://allurereport.org/) 获得更丰富的测试报告和历史趋势。

### 6.5 Git Hooks 集成

```bash
# 安装 husky + lint-staged
npm install -D husky lint-staged

# pre-commit hook：只跑 smoke 测试
npx husky init
echo "npx playwright test --grep @smoke" > .husky/pre-commit
```

**注意**：pre-commit 跑测试会显著增加提交时间，建议只跑最快的 smoke 测试（< 30s）。

---

## 7. 游戏特有测试

### 7.1 数值平衡自动化验证

使用参数化测试验证不同武器、难度、角色下的数值平衡：

```typescript
// 参数化武器测试
const weapons = ['holywater', 'knife', 'lightning'] as const;

for (const weapon of weapons) {
  test(`${weapon} 击杀效率合理`, async ({ page }) => {
    await startGameWithWeapon(page, weapon);
    await page.waitForTimeout(10000);

    const state = await gameState(page);
    expect(state.kills).toBeGreaterThanOrEqual(1);  // 10 秒内至少 1 杀
    expect(state.hp).toBeGreaterThan(0);              // 仍然存活
  });
}

// 参数化难度测试
const difficulties = [
  { index: 0, name: 'easy', minSurvival: 180 },
  { index: 1, name: 'normal', minSurvival: 120 },
  { index: 2, name: 'hard', minSurvival: 60 },
];

for (const diff of difficulties) {
  test(`难度 ${diff.name} 最低存活 ${diff.minSurvival}s`, async ({ page }) => {
    // 选择指定难度进行游戏
    // 验证存活时间
  });
}
```

**蒙特卡洛模拟**：通过多次运行同一测试（不同随机种子），统计分布结果：

```typescript
test('knife 10 次运行平均击杀 >= 5', async ({ page }) => {
  const killCounts: number[] = [];

  for (let run = 0; run < 10; run++) {
    await startGameWithWeapon(page, 'knife');
    await page.waitForTimeout(15000);
    const state = await gameState(page);
    killCounts.push(state.kills);
    // 重置游戏
    await page.evaluate(() => location.reload());
  }

  const avgKills = killCounts.reduce((a, b) => a + b, 0) / killCounts.length;
  expect(avgKills).toBeGreaterThanOrEqual(5);
});
```

### 7.2 游戏录像回放系统

通过确定性随机种子实现游戏回放：

```typescript
// 注入固定随机种子
test('确定性回放：固定种子产生相同结果', async ({ page }) => {
  await page.goto('/');

  // 覆盖 Math.random 为确定性版本
  await page.evaluate(() => {
    let seed = 12345;
    const originalRandom = Math.random;
    Math.random = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };
  });

  await startGameWithWeapon(page, 'knife');

  // 记录操作序列
  const actions = [
    { dir: 'd', duration: 2000 },
    { dir: 'w', duration: 1500 },
    { dir: 'a', duration: 2000 },
  ];

  for (const action of actions) {
    await page.keyboard.down(action.dir);
    await page.waitForTimeout(action.duration);
    await page.keyboard.up(action.dir);
  }

  const state1 = await gameState(page);

  // 重放：使用相同种子和操作序列
  await page.evaluate(() => location.reload());
  // ... 重复相同操作

  const state2 = await gameState(page);

  // 验证确定性：两次结果应该完全一致
  expect(state2.kills).toBe(state1.kills);
  expect(state2.level).toBe(state1.level);
  expect(Math.abs(state2.elapsed - state1.elapsed)).toBeLessThan(1);
});
```

**前置条件**：需要游戏代码使用可替换的随机数生成器，而非直接调用 `Math.random()`。

### 7.3 模糊测试 (Fuzz Testing)

向游戏输入大量随机操作，检测是否会崩溃或产生异常状态：

```typescript
test('模糊测试：随机操作不崩溃', async ({ page }) => {
  await startGameWithWeapon(page, 'knife');

  const keys = ['w', 'a', 's', 'd', ' ', 'Enter', 'Escape'];
  let crashed = false;

  // 30 秒随机操作
  const startTime = Date.now();
  while (Date.now() - startTime < 30000) {
    try {
      const randomKey = keys[Math.floor(Math.random() * keys.length)];
      await page.keyboard.down(randomKey);
      await page.waitForTimeout(Math.random() * 500);
      await page.keyboard.up(randomKey);

      // 检查游戏状态是否合法
      const state = await gameState(page);
      expect(state.hp).toBeGreaterThanOrEqual(0);
      expect(state.enemies).toBeLessThanOrEqual(50);
    } catch (e) {
      crashed = true;
      break;
    }
  }

  expect(crashed).toBe(false);
});
```

**适用性**：中高优先级。模糊测试能发现很多边界 case 和异常处理缺陷。

### 7.4 自动化探索测试 (Bot AI)

编写简单的 Bot AI 自动游玩游戏，验证完整流程可达性：

```typescript
test('Bot AI 自动游玩完成完整对局', async ({ page }) => {
  await startGameWithWeapon(page, 'knife');

  // Bot 策略：不断朝敌人密度最高方向移动
  while (true) {
    const state = await gameState(page);
    if (state.over) break;

    // 获取敌人方向，朝最近的敌人移动
    const direction = await page.evaluate(() => {
      // @ts-expect-error
      const player = game.player;
      // @ts-expect-error
      const enemies = game.enemies;
      if (enemies.length === 0) return 'd';

      let nearest = enemies[0];
      let minDist = Infinity;
      for (const e of enemies) {
        const dist = Math.hypot(e.x - player.x, e.y - player.y);
        if (dist < minDist) { minDist = dist; nearest = e; }
      }

      const dx = nearest.x - player.x;
      const dy = nearest.y - player.y;
      if (Math.abs(dx) > Math.abs(dy)) return dx > 0 ? 'd' : 'a';
      return dy > 0 ? 's' : 'w';
    });

    await page.keyboard.down(direction);
    await page.waitForTimeout(500);
    await page.keyboard.up(direction);

    // 自动关闭升级面板
    await page.evaluate(() => {
      const cards = document.querySelectorAll('.upg-card');
      if (cards.length > 0) (cards[0] as HTMLElement).click();
    });
  }

  // 验证游戏正常结束
  const finalState = await gameState(page);
  expect(finalState.over).toBe(true);
  expect(finalState.elapsed).toBeGreaterThan(30);  // 至少存活 30 秒
});
```

**参考**：
- [Testing Games with AI Bots (Game Developer)](https://www.gamedeveloper.com/programming/testing-games-with-ai-bots)
- [Automated Game Testing (Eidos-Montreal)](https://www.eidosmontreal.com/news/automated-game-testing/)
- [Future of Game Testing: Trends & Innovations](https://www.testingxperts.com/blog/future-of-game-testing)

---

## 可落地方案（按优先级排序）

| 优先级 | 方案 | 预期收益 | 实现难度 | 落地时间 |
|--------|------|----------|----------|----------|
| **P0** | 智能等待替代 waitForTimeout | 测试耗时减少 40-60% | 低 | 0.5 天 |
| **P0** | Workers 并行执行 | 测试耗时减少 50-70% | 极低 | 10 分钟 |
| **P0** | 测试 tag 分组 + PR 只跑 smoke | PR 反馈速度提升 80% | 低 | 0.5 天 |
| **P1** | FPS 自动化测试 | 监控核心性能指标 | 中 | 1 天 |
| **P1** | 测试 tag 标注所有用例 | 灵活过滤执行 | 低 | 0.5 天 |
| **P1** | 模糊测试用例 | 发现边界 case | 低 | 0.5 天 |
| **P1** | Bot AI 自动游玩测试 | 覆盖完整流程 | 中 | 1 天 |
| **P1** | Playwright 浏览器缓存优化 | CI 耗时减少 20-30% | 低 | 0.5 天 |
| **P2** | 视觉回归测试（标题/选择界面） | 防止 UI 无意变更 | 中 | 1 天 |
| **P2** | 参数化武器/难度测试 | 覆盖率翻倍 | 中 | 1 天 |
| **P2** | 内存泄漏检测测试 | 移动端稳定性保障 | 中 | 1 天 |
| **P2** | GitHub Actions 多浏览器矩阵 | 跨浏览器兼容性 | 中 | 1 天 |
| **P2** | 测试报告自动发布为 PR 评论 | 可视化测试结果 | 中 | 1 天 |
| **P3** | 移动端设备模拟测试 | 多设备覆盖 | 中 | 1 天 |
| **P3** | 确定性随机种子回放 | 可复现的数值验证 | 高 | 2 天 |
| **P3** | 代码覆盖率采集 | 覆盖率趋势监控 | 中 | 1 天 |
| **P3** | Lighthouse CI 集成 | 页面加载性能监控 | 低 | 0.5 天 |
| **P4** | BrowserStack 云测 | 真机测试 | 低（但需付费） | 0.5 天 |
| **P4** | LLM 辅助测试生成 | 提升编写效率 | 中 | 探索性 |
| **P4** | 质量仪表盘 | 长期趋势可视化 | 中 | 2 天 |
| **P4** | Sharding 分片（多机并行） | 大测试集加速 | 中 | 1 天 |

---

## 短期可落地（本迭代）

### 1. 启用 Workers 并行（10 分钟配置变更）

修改 `playwright.config.ts`：

```typescript
export default defineConfig({
  fullyParallel: true,
  workers: process.env.CI ? 4 : '50%',
  // ...
});
```

### 2. 智能等待替代（0.5 天）

创建 `tests/helpers.ts`，封装 `waitForKills`、`waitForLevelUp`、`waitForUpgradePanel` 等智能等待函数，逐步替换现有 `waitForTimeout` 调用。

### 3. Tag 分组 + PR 快速检查（0.5 天）

为所有测试添加 tag 标注，修改 CI 配置使 PR 只跑 `@smoke` + `@regression`。

### 4. FPS 自动化测试（1 天）

新增 FPS 采集和验证测试用例，作为 balance 层的扩展。

**预期总体收益**：测试耗时从 5 分钟降至 1.5 分钟以内，PR 反馈时间降至 30 秒以内，新增 FPS 性能监控能力。

---

## 中期规划（1-2 个迭代）

1. **视觉回归测试**：为标题画面、角色选择、武器选择、结算界面添加截图对比
2. **参数化测试矩阵**：覆盖所有武器 x 所有难度的组合验证
3. **模糊测试 + Bot AI 测试**：提升边界 case 覆盖率
4. **内存泄漏检测**：长时间运行稳定性验证
5. **CI 缓存优化**：减少 CI 冷启动时间
6. **多浏览器矩阵**：加入 WebKit（Safari）测试
7. **移动端设备模拟**：iPhone / iPad / Android 基础覆盖
8. **测试报告自动发布**：PR 评论 + HTML 报告 artifact

---

## 长期规划

1. **确定性随机种子回放系统**：需要前端配合改造随机数生成器
2. **代码覆盖率体系**：配合项目可能的模块化拆分
3. **BrowserStack 真机云测**：按需投入
4. **LLM 辅助测试**：利用 LLM 自动生成参数化测试矩阵
5. **Sharding 分片**：测试用例超过 50 个时启用
6. **质量仪表盘**：持续追踪测试通过率、缺陷密度、覆盖率趋势
7. **Lighthouse CI**：页面加载性能基线监控

---

## 附录：参考来源

### Playwright 官方文档
- [Playwright Test Parallelism](https://playwright.dev/docs/test-parallel)
- [Playwright Trace Viewer](https://playwright.dev/docs/trace-viewer)
- [Playwright Coverage API](https://playwright.dev/docs/api/class-coverage)
- [Playwright Mock APIs](https://playwright.dev/docs/mock)
- [Playwright Screenshots](https://playwright.dev/docs/test-snapshots)

### 并行执行与优化
- [Optimizing Test Runtime: Sharding vs Workers (Currents.dev)](https://currents.dev/posts/optimizing-test-runtime-playwright-sharding-vs-workers)
- [Playwright Sharding Complete Guide (TestDino)](https://testdino.com/blog/playwright-sharding/)
- [How To Speed Up Playwright Tests: 7 Tips (Currents.dev)](https://currents.dev/posts/how-to-speed-up-playwright-tests)
- [How to Speed Up GitHub Actions Runners (Namespace)](https://namespace.so/blog/how-to-speed-up-github-actions-runners)
- [Playwright Parallel Execution (OneUptime 2026)](https://oneuptime.com/blog/post/2026-01-28-playwright-parallel-execution/view)

### 视觉回归与调试
- [The Ultimate Guide to Playwright Trace Viewer (Momentic)](https://momentic.ai/blog/the-ultimate-guide-to-playwright-trace-viewer-master-time-travel-debugging)
- [Playwright Debugging Guide (TestGrid)](https://testgrid.io/blog/playwright-debug/)

### AI 辅助测试
- [12 Best AI Testing Tools 2026 (QA Wolf)](https://www.qawolf.com/blog/the-12-best-ai-testing-tools-in-2026)
- [Best AI Testing Tools 2026 (Virtuoso)](https://www.virtuosoqa.com/post/best-ai-testing-tools)
- [Leveraging LLM Agents for Automated Video Game Testing (arXiv)](https://arxiv.org/html/2509.22170v1)
- [LLMs for Game Development: Automated Code Generation (STAF 2025)](https://conf.researchr.org/details/staf-2025/llm4se-2025-papers/2/Large-Language-Models-for-Game-Development-A-Survey-on-Automated-Code-Generation)

### 性能测试
- [Lighthouse CI (Unlighthouse)](https://unlighthouse.dev/learn-lighthouse/lighthouse-ci)
- [Playwright Performance Testing (Checkly)](https://checklyhq.com/docs/learn/playwright/performance)
- [Automating Web Vitals Testing with Playwright (Medium)](https://medium.com/@lahirukavikara/automating-web-vitals-testing-with-playwright-and-html-reports-a50a3234bcab)

### 移动端测试
- [Playwright Mobile Testing on Real Devices 2026 (TestDino)](https://testdino.com/blog/playwright-mobile-testing/)
- [BrowserStack Playwright Mobile Automation 2026](https://www.browserstack.com/guide/playwright-mobile-automation)
- [BrowserStack Enables Playwright on Real iOS Safari](https://www.devopsdigest.com/browserstack-enables-playwright-testing-on-real-ios-devices-with-safari)

### 代码覆盖率
- [How To Measure Code Coverage in Playwright Tests (Currents.dev)](https://currents.dev/posts/how-to-measure-code-coverage-in-playwright-tests)
- [monocart-coverage-reports (GitHub Gist)](https://gist.github.com/cenfun/0754c23f03d1aa541b4467920ab4d09f)
- [Playwright Coverage with V8 vs Istanbul (dev.to)](https://dev.to/stevez/v8-coverage-vs-istanbul-performance-and-accuracy-3ei8)

### 游戏特有测试
- [Testing Games with AI Bots (Game Developer)](https://www.gamedeveloper.com/programming/testing-games-with-ai-bots)
- [Automated Game Testing (Eidos-Montreal)](https://www.eidosmontreal.com/news/automated-game-testing/)
- [Future of Game Testing (TestingXperts)](https://www.testingxperts.com/blog/future-of-game-testing)
- [Antithesis: Deterministic Fuzz Testing](https://sqlsync.dev/posts/antithesis-driven-testing/)

### 网络拦截与 Mock
- [The Playwright Network Mocking Playbook (Currents.dev)](https://currents.dev/posts/the-playwright-network-mocking-playbook)
- [Playwright Network Interception 2026 (OneUptime)](https://oneuptime.com/blog/post/2026-02-02-playwright-network-interception/view)

### CI/CD 集成
- [End-to-End Testing with Playwright and GitHub Actions (Builder.io)](https://www.builder.io/blog/end-to-end-testing-with-playwright-and-github-actions)
- [Testing Workflows with GitHub Actions (OneUptime)](https://oneuptime.com/blog/post/2026-01-26-testing-workflows-github-actions/view)
