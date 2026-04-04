// ===== Food Entity =====
import { CFG } from '../core/config.js';
import { V, dist, distSq } from '../core/math.js';

export class Food {
  constructor(x, y, enemyType) {
    const ft = CFG.FOOD.types[enemyType] || CFG.FOOD.types.zombie;
    this.x = x; this.y = y; this.icon = ft.icon; this.color = ft.color;
    this.lifetime = CFG.FOOD.lifetime; this.age = 0;
  }
  update(dt, player, game) {
    this.age += dt;
    if (this.age >= this.lifetime) return false;
    let ds = distSq(this, player);
    const dir = new V(player.x - this.x, player.y - this.y).norm();
    const prSq = player.pickupRange * player.pickupRange;
    if (ds < prSq) {
      this.x += dir.x * CFG.GEM_FLY_SPEED * dt;
      this.y += dir.y * CFG.GEM_FLY_SPEED * dt;
      ds = distSq(this, player);
      if (ds < 144) { // 12*12
        const wasFull = player.hp >= player.maxHp;
        player.hp = Math.min(player.hp + CFG.FOOD.healAmount, player.maxHp);
        if (wasFull) {
          game.dmgTexts.push({ x: player.x, y: player.y - 20, text: '💚', life: 0.6 });
        } else {
          game.dmgTexts.push({ x: player.x, y: player.y - 20, text: '❤️+1', life: 0.8 });
        }
        return 'picked';
      }
    } else {
      const d = Math.sqrt(ds);
      const spd = 30 + 40 * (1 - Math.min(d / 800, 1));
      this.x += dir.x * spd * dt;
      this.y += dir.y * spd * dt;
    }
    return true;
  }
  draw(ctx, cam, canvas) {
    const s = cam.w2s(this.x, this.y, canvas);
    const alpha = this.lifetime - this.age < 3 ? (this.lifetime - this.age) / 3 : 1;
    ctx.globalAlpha = alpha;
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(this.icon, s.x, s.y);
    ctx.globalAlpha = 1;
  }
}
