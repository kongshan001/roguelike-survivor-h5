// ===== Chest Entity =====
export class Chest {
  constructor(x, y) {
    this.x = x; this.y = y; this.w = 20; this.h = 16; this.opened = false;
    this.t = Math.random() * Math.PI * 2;
    this._noGoldShown = false;
  }
  draw(ctx, cam, canvas) {
    if (this.opened) return;
    const s = cam.w2s(this.x, this.y, canvas);
    const x = s.x - this.w / 2, y = s.y - this.h / 2;
    this.t += 0.03;
    const glow = Math.sin(this.t) * 0.3 + 0.7;
    ctx.fillStyle = `rgba(255,193,7,${glow})`;
    ctx.fillRect(x, y, this.w, this.h);
    ctx.fillStyle = '#ff8f00';
    ctx.fillRect(x, y, this.w, 4);
    ctx.fillStyle = '#ffd54f';
    ctx.fillRect(x + 8, y + 4, 4, 5);
    ctx.fillStyle = '#5d4037';
    ctx.fillRect(x + 9, y + 6, 2, 2);
    ctx.fillStyle = `rgba(255,235,59,${glow * 0.6})`;
    ctx.fillRect(x - 2, y - 3, 3, 2);
    ctx.fillRect(x + this.w - 1, y - 3, 3, 2);
    ctx.fillStyle = '#ffd54f';
    ctx.font = 'bold 9px monospace'; ctx.textAlign = 'center';
    ctx.fillText('20💰', s.x, y - 5);
  }
}
