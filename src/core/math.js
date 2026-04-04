// ===== Math Utilities & Vec2 =====
export class V {
  constructor(x = 0, y = 0) { this.x = x; this.y = y }
  add(v) { return new V(this.x + v.x, this.y + v.y) }
  sub(v) { return new V(this.x - v.x, this.y - v.y) }
  scale(s) { return new V(this.x * s, this.y * s) }
  len() { return Math.hypot(this.x, this.y) }
  norm() { const l = this.len(); return l > 0 ? this.scale(1 / l) : new V() }
  dist(v) { return this.sub(v).len() }
  clone() { return new V(this.x, this.y) }
}

export function rand(a, b) { return a + Math.random() * (b - a) }
export function randInt(a, b) { return Math.floor(rand(a, b + 1)) }
export function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v }
export function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y) }
