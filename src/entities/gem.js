// ===== Gem Entity =====
import { dist } from '../core/math.js';

export class Gem {
  constructor(x, y, value) {
    this.x = x; this.y = y; this.value = value;
    this.t = Math.random() * Math.PI * 2;
  }
  draw(ctx, cam, canvas) {
    const s = cam.w2s(this.x, this.y, canvas);
    this.t += 0.05;
    const glow = Math.sin(this.t) * 0.3 + 0.7;
    ctx.fillStyle = `rgba(156,39,176,${glow})`;
    ctx.fillRect(s.x - 3, s.y - 3, 6, 6);
    ctx.fillStyle = `rgba(206,147,216,${glow})`;
    ctx.fillRect(s.x - 1, s.y - 1, 2, 2);
  }
}
