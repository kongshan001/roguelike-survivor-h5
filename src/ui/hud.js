// ===== HUD Canvas Rendering =====
import { CFG } from '../core/config.js';

export function drawHUD(ctx, W, H, dt, game) {
  const player = game.player;

  // Timer
  const remaining = Math.max(0, CFG.GAME_TIME - game.elapsed);
  const rm = Math.floor(remaining / 60), rs = Math.floor(remaining % 60);
  document.getElementById('hud-timer').textContent = `${rm}:${rs.toString().padStart(2, '0')}`;
  document.getElementById('hud-level').textContent = `Lv.${player.level}`;
  document.getElementById('hud-gold').textContent = `\u{1F4B0} ${player.gold}`;

  // HP
  let hpHtml = '';
  for (let i = 0; i < player.maxHp; i++) {
    hpHtml += i < player.hp ? '<span style="color:#ef5350">\u2765</span>' : '<span style="color:#555">\u2764</span>';
  }
  document.getElementById('hud-hp').innerHTML = hpHtml;

  // Exp bar
  const nextExp = player.level < CFG.EXP_TABLE.length ? CFG.EXP_TABLE[player.level] : 999;
  document.getElementById('exp-bar').style.width = `${(player.exp / nextExp * 100).toFixed(1)}%`;

}

export function drawMinimap(mmCtx, game) {
  mmCtx.fillStyle = 'rgba(0,0,0,0,0.6)';
  mmCtx.fillRect(0, 0, 60, 60);
  const mmScale = 60 / CFG.MAP_W;
  // Enemies
  mmCtx.fillStyle = '#ef5350';
  for (const e of game.enemies) {
    const mx = e.x * mmScale, my = e.y * mmScale;
    const sz = e.isBoss ? 3 : 1;
    mmCtx.fillRect(mx - sz / 2, my - sz / 2, sz, sz);
  }
  // Chests
  mmCtx.fillStyle = '#ffd54f';
  for (const ch of game.chests) {
    const mx = ch.x * mmScale, my = ch.y * mmScale;
    mmCtx.fillRect(mx - 1, my - 1, 2, 2);
  }
  // Player
  mmCtx.fillStyle = '#4fc3f7';
  const px = game.player.x * mmScale, py = game.player.y * mmScale;
  mmCtx.fillRect(px - 2, py - 2, 4, 4);
}

