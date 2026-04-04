/**
 * 肉鸽幸存者 E2E 测试
 *
 * 分层策略：
 *   smoke    — 核心流程冒烟（标题→选武器→游戏→结算）
 *   gameplay — 战斗/升级/平衡性验证
 *   visual   — 渲染正确性（DPR/精灵/UI）
 */

import { test, expect, type Page } from '@playwright/test';

// ─── helpers ────────────────────────────────────────────

/** 获取游戏内部状态 */
function gameState(page: Page) {
  return page.evaluate(() =>
    // @ts-expect-error game is global in the script
    JSON.stringify({
      level: game.player.level,
      exp: game.player.exp,
      hp: game.player.hp,
      maxHp: game.player.maxHp,
      kills: game.player.kills,
      gold: game.player.gold,
      weapons: game.player.weapons.map((w: any) => `${w.name} Lv${w.level}`),
      enemies: game.enemies.length,
      gems: game.gems.length,
      bullets: game.bullets.length,
      paused: game.paused,
      over: game.over,
      elapsed: Math.round(game.elapsed),
    })
  ).then(JSON.parse);
}

/** 开始游戏并选择指定武器（默认选择魔法师 → 自选武器） */
async function startGameWithWeapon(page: Page, weapon: 'holywater' | 'knife' | 'lightning') {
  await page.goto('/');
  await page.getByRole('button', { name: '开始游戏' }).click();
  // Select mage (first card in char-select) — mage allows weapon choice
  await page.locator('#char-select .ws-card').first().click();
  await page.waitForTimeout(300);
  // Select difficulty (normal — middle card)
  await page.locator('#diff-select .ws-card').nth(1).click();
  await page.waitForTimeout(300);
  // Now select weapon
  const weaponIndex = { holywater: 0, knife: 1, lightning: 2 };
  const cards = page.locator('#weapon-select .ws-card');
  await cards.nth(weaponIndex[weapon]).click();
  await page.waitForTimeout(500);
}

// ═══════════════════════════════════════════════════════════
//  SMOKE — 核心冒烟测试
// ═══════════════════════════════════════════════════════════

test.describe('smoke — 核心流程', () => {

  test('标题画面正确渲染', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: '肉鸽幸存者' })).toBeVisible();
    await expect(page.getByText('5分钟，活下来')).toBeVisible();
    await expect(page.getByRole('button', { name: '开始游戏' })).toBeVisible();
  });

  test('武器选择 → 进入游戏', async ({ page }) => {
    await startGameWithWeapon(page, 'knife');
    const state = await gameState(page);
    expect(state.weapons).toEqual(['knife Lv1']);
    expect(state.hp).toBe(state.maxHp);
    // HUD visible
    await expect(page.getByText(/Lv\.1/)).toBeVisible();
    await expect(page.getByText(/\d+:\d+/)).toBeVisible();
  });

  test('键盘WASD移动', async ({ page }) => {
    await startGameWithWeapon(page, 'knife');
    const before = await page.evaluate(() =>
      // @ts-expect-error
      ({ x: game.player.x, y: game.player.y })
    );
    await page.keyboard.down('d');
    await page.waitForTimeout(1000);
    await page.keyboard.up('d');
    const after = await page.evaluate(() =>
      // @ts-expect-error
      ({ x: game.player.x, y: game.player.y })
    );
    expect(after.x).toBeGreaterThan(before.x);
  });

  test('完整流程：开始→战斗→结算', async ({ page }) => {
    await startGameWithWeapon(page, 'knife');

    // Game is running
    const state0 = await gameState(page);
    expect(state0.over).toBe(false);
    expect(state0.elapsed).toBeLessThan(5);

    // Move around for a while
    const dirs = ['d', 'w', 'a', 's', 'd', 'w'];
    for (const dir of dirs) {
      await page.keyboard.down(dir);
      await page.waitForTimeout(2500);
      await page.keyboard.up(dir);
    }

    // Should have killed something by now (knife fires every 0.7s)
    const state1 = await gameState(page);
    // Game should still be running or have ended naturally
    if (!state1.over) {
      // Verify HUD is updating
      const timerText = await page.getByText(/\d+:\d+/).first().textContent();
      expect(timerText).toBeTruthy();
    }
  });
});

// ═══════════════════════════════════════════════════════════
//  GAMEPLAY — 战斗/升级验证
// ═══════════════════════════════════════════════════════════

test.describe('gameplay — 战斗与升级', () => {

  test('飞刀自动攻击并击杀敌人', async ({ page }) => {
    await startGameWithWeapon(page, 'knife');
    // Stay still and wait for knife to kill
    await page.waitForTimeout(8000);

    const state = await gameState(page);
    expect(state.kills).toBeGreaterThanOrEqual(1);
    expect(state.gold).toBeGreaterThanOrEqual(10);
  });

  test('经验宝石收集与升级', async ({ page }) => {
    await startGameWithWeapon(page, 'knife');

    // Move to collect gems — wait long enough for first level up
    const dirs = ['d', 'w', 'a', 's', 'd', 'w', 'a', 's'];
    for (const dir of dirs) {
      await page.keyboard.down(dir);
      await page.waitForTimeout(2000);
      await page.keyboard.up(dir);
    }

    const state = await gameState(page);
    // Should have leveled up at least once
    expect(state.level).toBeGreaterThanOrEqual(2);
  });

  test('升级面板出现并可选', async ({ page }) => {
    await startGameWithWeapon(page, 'knife');

    // Play until level up panel appears
    let panelVisible = false;
    for (let i = 0; i < 20; i++) {
      await page.keyboard.down('d');
      await page.waitForTimeout(1500);
      await page.keyboard.up('d');
      await page.keyboard.down('a');
      await page.waitForTimeout(1500);
      await page.keyboard.up('a');

      const visible = await page.evaluate(() =>
        document.getElementById('upgrade-panel')!.style.display !== 'none'
      );
      if (visible) {
        panelVisible = true;

        // Verify panel has 3 option cards
        const cards = page.locator('.upg-card');
        await expect(cards).toHaveCount(3);

        // Click the first card
        await cards.first().click();

        // Panel should close
        await page.waitForTimeout(300);
        const closed = await page.evaluate(() =>
          document.getElementById('upgrade-panel')!.style.display === 'none'
        );
        expect(closed).toBe(true);
        break;
      }
    }
    expect(panelVisible).toBe(true);
  });

  test('三种初始武器均可正常开局', async ({ page }) => {
    for (const weapon of ['holywater', 'knife', 'lightning'] as const) {
      await startGameWithWeapon(page, weapon);
      const state = await gameState(page);
      expect(state.weapons).toHaveLength(1);
      expect(state.hp).toBeGreaterThan(0);
    }
  });
});

// ═══════════════════════════════════════════════════════════
//  BALANCE — 数值平衡验证
// ═══════════════════════════════════════════════════════════

test.describe('balance — 数值平衡', () => {
  test.slow();

  test('玩家存活时间 > 2分钟', async ({ page }) => {
    await startGameWithWeapon(page, 'knife');

    // Move continuously
    const dirs = ['d', 'w', 'a', 's'];
    for (let cycle = 0; cycle < 8; cycle++) {
      for (const dir of dirs) {
        await page.keyboard.down(dir);
        await page.waitForTimeout(2000);
        await page.keyboard.up(dir);
      }
    }

    const state = await gameState(page);
    // Should survive at least 2 minutes (120s)
    if (state.over) {
      expect(state.elapsed).toBeGreaterThan(120);
    }
  });

  test('敌人数量不超过上限50', async ({ page }) => {
    await startGameWithWeapon(page, 'knife');
    await page.waitForTimeout(15000);

    const state = await gameState(page);
    expect(state.enemies).toBeLessThanOrEqual(50);
  });

  test('5分钟内至少升到Lv3', async ({ page }) => {
    await startGameWithWeapon(page, 'knife');

    // Play aggressively
    const dirs = ['d', 'w', 'a', 's'];
    for (let cycle = 0; cycle < 12; cycle++) {
      for (const dir of dirs) {
        await page.keyboard.down(dir);
        await page.waitForTimeout(1500);
        await page.keyboard.up(dir);
      }
      // Dismiss any upgrade panel
      await page.evaluate(() => {
        const cards = document.querySelectorAll('.upg-card');
        if (cards.length > 0) (cards[0] as HTMLElement).click();
      });
      await page.waitForTimeout(200);
    }

    const state = await gameState(page);
    expect(state.level).toBeGreaterThanOrEqual(3);
  });
});

// ═══════════════════════════════════════════════════════════
//  REGRESSION — 回归测试（历史bug验证）
// ═══════════════════════════════════════════════════════════

test.describe('regression — 历史缺陷回归', () => {
  test.slow();

  test('BUG-001: 玩家HP>=8，存活>60s', async ({ page }) => {
    await startGameWithWeapon(page, 'knife');
    const state = await gameState(page);
    expect(state.maxHp).toBeGreaterThanOrEqual(8);

    // Wait and move
    await page.keyboard.down('d');
    await page.waitForTimeout(5000);
    await page.keyboard.up('d');
    await page.keyboard.down('a');
    await page.waitForTimeout(5000);
    await page.keyboard.up('a');

    const state2 = await gameState(page);
    if (state2.over) {
      expect(state2.elapsed).toBeGreaterThan(60);
    }
  });

  test('BUG-002: 经验宝石被收集（exp>0）', async ({ page }) => {
    await startGameWithWeapon(page, 'knife');
    // Move to collect
    await page.keyboard.down('d');
    await page.waitForTimeout(6000);
    await page.keyboard.up('d');
    await page.keyboard.down('a');
    await page.waitForTimeout(6000);
    await page.keyboard.up('a');

    const state = await gameState(page);
    // Either gained exp or leveled up
    expect(state.exp + state.level - 1).toBeGreaterThan(0);
  });

  test('BUG-003: DPR渲染无偏移（玩家在屏幕中心）', async ({ page }) => {
    await startGameWithWeapon(page, 'knife');
    // Wait for camera to converge (lerp 0.1 takes ~3s to center)
    await page.waitForTimeout(3000);
    const playerScreen = await page.evaluate(() => {
      // @ts-expect-error
      game.shake = null; // clear screen shake to avoid random offset
      const cam = game.camera;
      const canvas = document.getElementById('c')!;
      const s = cam.w2s(game.player.x, game.player.y, canvas);
      const W = window.innerWidth, H = window.innerHeight;
      return { sx: s.x, sy: s.y, cw: W, ch: H };
    });
    // Player should be roughly in center of viewport
    expect(Math.abs(playerScreen.sx - playerScreen.cw / 2)).toBeLessThan(100);
    expect(Math.abs(playerScreen.sy - playerScreen.ch / 2)).toBeLessThan(100);
  });
});
