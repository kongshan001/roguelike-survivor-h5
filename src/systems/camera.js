// ===== Camera =====
export class Camera {
  constructor() { this.x = 0; this.y = 0; this.tx = 0; this.ty = 0 }
  follow(p) { this.tx = p.x; this.ty = p.y }
  update(dt) {
    this.x += (this.tx - this.x) * 0.1;
    this.y += (this.ty - this.y) * 0.1;
  }
  w2s(wx, wy, canvas, shake) {
    const dpr = window.devicePixelRatio || 1;
    let sx = wx - this.x + canvas.width / (2 * dpr);
    let sy = wy - this.y + canvas.height / (2 * dpr);
    if (shake && shake.timer > 0) {
      const f = shake.timer / shake.duration;
      const i = shake.intensity * f;
      sx += (Math.random() - 0.5) * 2 * i;
      sy += (Math.random() - 0.5) * 2 * i;
    }
    return { x: sx, y: sy };
  }
  s2w(sx, sy, canvas) {
    const dpr = window.devicePixelRatio || 1;
    return { x: sx + this.x - canvas.width / (2 * dpr), y: sy + this.y - canvas.height / (2 * dpr) };
  }
}
