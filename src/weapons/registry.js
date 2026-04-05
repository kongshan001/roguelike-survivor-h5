// ===== Weapon Classes & Registry =====
import { CFG } from '../core/config.js';
import { V, rand, randInt, dist } from '../core/math.js';

// --- Base Weapon ---
class Weapon {
  constructor(name, owner) { this.name = name; this.owner = owner; this.level = 1; this.timer = 0; }
  get maxLevel() { return 3; }
  /** Apply shop weaponDmg upgrade multiplier to base damage */
  applyDmg(base) { return base * (window.game && window.game.weaponDmgMul || 1); }
}

// --- HolyWater ---
export class HolyWater extends Weapon {
  constructor(owner) { super('holywater', owner); this.angle = 0; this.radius = 50; }
  get count() { return this.level; }
  get dmg() { return this.level >= 2 ? 2 : 1.5; }
  update(dt, enemies) {
    this.angle += dt * 3;
    const bonus = this.owner.getWeaponBonus ? this.owner.getWeaponBonus('holywater') : {};
    const r = (this.level >= 3 ? 60 : this.radius) * (bonus.radiusMul || 1);
    for (let i = 0; i < this.count; i++) {
      const a = this.angle + Math.PI * 2 / this.count * i;
      const bx = this.owner.x + Math.cos(a) * r;
      const by = this.owner.y + Math.sin(a) * r;
      for (let j = enemies.length - 1; j >= 0; j--) {
        const e = enemies[j];
        if (Math.abs(bx - e.x) < (12 + e.w / 2) && Math.abs(by - e.y) < (12 + e.h / 2)) {
          e.hurt(this.applyDmg(this.dmg * dt * 15));
        }
      }
    }
  }
  draw(ctx, cam, canvas) {
    const r = this.level >= 3 ? 60 : this.radius;
    for (let i = 0; i < this.count; i++) {
      const a = this.angle + Math.PI * 2 / this.count * i;
      const bx = this.owner.x + Math.cos(a) * r;
      const by = this.owner.y + Math.sin(a) * r;
      const s = cam.w2s(bx, by, canvas);
      ctx.fillStyle = '#29b6f6';
      ctx.fillRect(s.x - 5, s.y - 5, 10, 10);
      ctx.fillStyle = '#0288d1';
      ctx.fillRect(s.x - 3, s.y - 3, 6, 6);
      ctx.fillStyle = '#b3e5fc';
      ctx.fillRect(s.x - 1, s.y - 1, 2, 2);
    }
  }
}

// --- Knife ---
export class Knife extends Weapon {
  constructor(owner) { super('knife', owner); this.cd = 0.7; }
  get count() { return this.level; }
  get dmg() { return this.level >= 2 ? 2.6 : 2; }
  get pierce() { return this.level >= 3 ? 1 : 0; }
  get _canCrit() {
    const bonus = this.owner.getWeaponBonus ? this.owner.getWeaponBonus('knife') : {};
    return !!bonus.canCrit;
  }
  update(dt, enemies, bullets, sfx) {
    this.timer -= dt;
    if (this.timer <= 0) {
      this.timer = this.cd;
      let nearest = null, nd = Infinity;
      for (const e of enemies) {
        const d = dist(this.owner, e);
        if (d < nd) { nd = d; nearest = e; }
      }
      if (nearest) {
        if (sfx) sfx('knife');
        for (let i = 0; i < this.count; i++) {
          const dir = new V(nearest.x - this.owner.x, nearest.y - this.owner.y).norm();
          const spread = i > 0 ? (i % 2 === 1 ? 0.15 : -0.15) : 0;
          const cos = Math.cos(spread), sin = Math.sin(spread);
          const dx = dir.x * cos - dir.y * sin;
          const dy = dir.x * sin + dir.y * cos;
          if (bullets.length < CFG.MAX_BULLETS) {
            bullets.push({ x: this.owner.x, y: this.owner.y, vx: dx * 250, vy: dy * 250, w: 4, h: 4, dmg: this.applyDmg(this.dmg), life: 1.5, color: '#ffd54f', pierce: this.pierce, hit: new Set() });
          }
        }
      }
    }
  }
}

// --- Lightning ---
export class Lightning extends Weapon {
  constructor(owner) { super('lightning', owner); this.cd = 2; this.timer = 0; this.effects = []; }
  get dmg() { return this.level >= 2 ? 6 : 5; }
  get chains() { return this.level >= 3 ? 2 : this.level >= 2 ? 1 : 0; }
  get bolts() { return this.level >= 3 ? 2 : 1; }
  update(dt, enemies, sfx, playerCritsFn) {
    this.timer -= dt;
    for (let i = this.effects.length - 1; i >= 0; i--) {
      this.effects[i].t -= dt;
      if (this.effects[i].t <= 0) this.effects.splice(i, 1);
    }
    if (this.timer <= 0) {
      this.timer = this.cd;
      const bonus = this.owner.getWeaponBonus ? this.owner.getWeaponBonus('lightning') : {};
      const range = 400 + (bonus.rangeBonus || 0);
      const extraChains = bonus.extraChains || 0;
      const screenEnemies = enemies.filter(e => dist(this.owner, e) < range);
      for (let b = 0; b < this.bolts && screenEnemies.length > 0; b++) {
        const idx = randInt(0, screenEnemies.length - 1);
        const target = screenEnemies[idx];
        target.hurt(this.applyDmg(this.dmg), playerCritsFn ? playerCritsFn() : false);
        if (sfx) sfx('lightning');
        this.effects.push({ x0: this.owner.x, y0: this.owner.y, x1: target.x, y1: target.y, t: 0.2 });
        let prev = target;
        const hit = new Set([target]);
        for (let c = 0; c < this.chains + extraChains; c++) {
          let next = null, nd = Infinity;
          for (const e of enemies) {
            if (hit.has(e)) continue;
            const d = dist(prev, e);
            if (d < 150 && d < nd) { nd = d; next = e; }
          }
          if (next) {
            next.hurt(this.applyDmg(this.dmg * 0.5));
            hit.add(next);
            this.effects.push({ x0: prev.x, y0: prev.y, x1: next.x, y1: next.y, t: 0.2 });
            prev = next;
          }
        }
      }
    }
  }
  draw(ctx, cam, canvas) {
    for (const e of this.effects) {
      const s0 = cam.w2s(e.x0, e.y0, canvas);
      const s1 = cam.w2s(e.x1, e.y1, canvas);
      ctx.strokeStyle = `rgba(255,235,59,${e.t * 5})`;
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(s0.x, s0.y);
      const steps = 4;
      for (let i = 1; i <= steps; i++) {
        const t = i / steps;
        ctx.lineTo(s0.x + (s1.x - s0.x) * t + (Math.random() - 0.5) * 16,
                    s0.y + (s1.y - s0.y) * t + (Math.random() - 0.5) * 16);
      }
      ctx.lineTo(s1.x, s1.y);
      ctx.stroke();
    }
  }
}

// --- Bible ---
export class Bible extends Weapon {
  constructor(owner) { super('bible', owner); this.angle = 0; this.hitTimers = new Map(); }
  get radius() { return this.level >= 3 ? 120 : this.level >= 2 ? 104 : 80; }
  get dmg() { return this.level >= 3 ? 2 : 1; }
  get speed() { return this.level >= 2 ? 3.6 : 3; }
  update(dt, enemies) {
    const bonus = this.owner.getWeaponBonus ? this.owner.getWeaponBonus('bible') : {};
    const spd = this.speed * (bonus.speedMul || 1);
    const rad = this.radius + (bonus.radiusBonus || 0);
    this.angle += dt * spd;
    for (const e of enemies) {
      const d = dist(this.owner, e);
      if (d < rad) {
        if (!this.hitTimers.has(e)) this.hitTimers.set(e, 0);
        const ht = this.hitTimers.get(e);
        if (ht <= 0) {
          e.hurt(this.applyDmg(this.dmg));
          this.hitTimers.set(e, 0.3);
        } else {
          this.hitTimers.set(e, ht - dt);
        }
      }
    }
    for (const [e] of this.hitTimers) {
      if (!enemies.includes(e)) this.hitTimers.delete(e);
    }
  }
  draw(ctx, cam, canvas) {
    const s = cam.w2s(this.owner.x, this.owner.y, canvas);
    const bonus = this.owner.getWeaponBonus ? this.owner.getWeaponBonus('bible') : {};
    const rad = this.radius + (bonus.radiusBonus || 0);
    ctx.strokeStyle = `rgba(255,193,7,${0.3 + Math.sin(this.angle * 2) * 0.15})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(s.x, s.y, rad, 0, Math.PI * 2);
    ctx.stroke();
    for (let i = 0; i < 2; i++) {
      const a = this.angle + Math.PI * i;
      const cx = s.x + Math.cos(a) * rad * 0.6;
      const cy = s.y + Math.sin(a) * rad * 0.6;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(a + Math.PI / 2);
      ctx.fillStyle = '#ffc107';
      ctx.fillRect(-14, -5, 28, 10);
      ctx.fillStyle = '#ff8f00';
      ctx.fillRect(-14, -5, 28, 2);
      ctx.fillRect(-14, 3, 28, 2);
      ctx.fillStyle = '#5d4037';
      ctx.fillRect(-10, -1, 20, 1);
      ctx.fillRect(-10, 1, 16, 1);
      ctx.restore();
    }
  }
}

// --- FireStaff ---
export class FireStaff extends Weapon {
  constructor(owner) { super('firestaff', owner); }
  get coneWidth() { return this.level >= 3 ? 120 : this.level >= 2 ? 100 : 80; }
  get coneRange() { return this.level >= 3 ? 160 : this.level >= 2 ? 130 : 100; }
  get dps() { return this.level >= 3 ? 7 : this.level >= 2 ? 5 : 3; }
  get burnDps() { return this.level >= 3 ? 2 : 0; }
  update(dt, enemies) {
    const bonus = this.owner.getWeaponBonus ? this.owner.getWeaponBonus('firestaff') : {};
    const angle = this.owner.facingAngle;
    const range = this.coneRange + (bonus.coneBonus || 0);
    const burnDurBonus = bonus.burnDurBonus || 0;
    const halfArc = Math.PI / 6;
    for (const e of enemies) {
      const dx = e.x - this.owner.x, dy = e.y - this.owner.y;
      const d = Math.hypot(dx, dy);
      if (d < range && d > 1) {
        const ea = Math.atan2(dy, dx);
        let diff = ea - angle;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        if (Math.abs(diff) < halfArc) {
          e.hurt(this.applyDmg(this.dps * dt));
          if (!e._burn) e._burn = { dmg: 0, t: 0 };
          if (this.burnDps > 0) { e._burn.dmg = this.applyDmg(this.burnDps); e._burn.t = 2 + burnDurBonus; }
        }
      }
    }
    for (const e of enemies) {
      if (e._burn && e._burn.t > 0) {
        if (!this._isInCone(e)) { e.hurt(e._burn.dmg * dt); }
        e._burn.t -= dt;
        if (e._burn.t <= 0) e._burn = null;
      }
    }
  }
  _isInCone(e) {
    const dx = e.x - this.owner.x, dy = e.y - this.owner.y;
    const d = Math.hypot(dx, dy);
    if (d >= this.coneRange || d < 1) return false;
    let diff = Math.atan2(dy, dx) - this.owner.facingAngle;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    return Math.abs(diff) < Math.PI / 6;
  }
  draw(ctx, cam, canvas) {
    const s = cam.w2s(this.owner.x, this.owner.y, canvas);
    const angle = this.owner.facingAngle;
    const range = this.coneRange;
    const halfArc = Math.PI / 6;
    const grad = ctx.createRadialGradient(s.x, s.y, 5, s.x, s.y, range);
    grad.addColorStop(0, 'rgba(255,152,0,0.5)');
    grad.addColorStop(0.6, 'rgba(255,87,34,0.3)');
    grad.addColorStop(1, 'rgba(255,87,34,0)');
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.moveTo(s.x, s.y);
    ctx.arc(s.x, s.y, range, angle - halfArc, angle + halfArc);
    ctx.closePath(); ctx.fill();
    const grad2 = ctx.createRadialGradient(s.x, s.y, 3, s.x, s.y, range * 0.4);
    grad2.addColorStop(0, 'rgba(255,235,59,0.6)');
    grad2.addColorStop(1, 'rgba(255,152,0,0)');
    ctx.fillStyle = grad2;
    ctx.beginPath(); ctx.moveTo(s.x, s.y);
    ctx.arc(s.x, s.y, range * 0.4, angle - halfArc * 0.7, angle + halfArc * 0.7);
    ctx.closePath(); ctx.fill();
    const tipCount = this.level + 2;
    for (let i = 0; i < tipCount; i++) {
      const t = 0.4 + 0.6 * i / tipCount;
      const a = angle - halfArc + halfArc * 2 * i / tipCount;
      const flicker = rand(0.7, 1.0);
      const r = range * t * flicker;
      const tx = s.x + Math.cos(a) * r;
      const ty = s.y + Math.sin(a) * r;
      ctx.fillStyle = `rgba(255,${Math.floor(rand(100, 200))},0,${0.4 * flicker})`;
      ctx.fillRect(tx - 2, ty - 2, 4, 4);
      ctx.fillStyle = `rgba(255,235,59,${0.3 * flicker})`;
      ctx.fillRect(tx - 1, ty - 1, 2, 2);
    }
  }
}

// --- FrostAura ---
export class FrostAura extends Weapon {
  constructor(owner) { super('frostaura', owner); this.pulseTimer = 0; }
  get radius() { return this.level >= 3 ? 130 : this.level >= 2 ? 100 : 80; }
  get slow() { return this.level >= 3 ? 0.6 : this.level >= 2 ? 0.45 : 0.3; }
  get dps() { return this.level >= 3 ? 2 : this.level >= 2 ? 1.5 : 1; }
  get freezeChance() { return this.level >= 3 ? 0.08 : 0; }
  get freezeDur() { return this.level >= 3 ? 1.5 : 0; }
  update(dt, enemies, sfx) {
    this.pulseTimer += dt;
    const bonus = this.owner.getWeaponBonus ? this.owner.getWeaponBonus('frostaura') : {};
    const freezeBonus = bonus.freezeBonus || 0;
    const freezeDurBonus = bonus.freezeDurBonus || 0;
    for (const e of enemies) {
      const d = dist(this.owner, e);
      if (d < this.radius) {
        e.hurt(this.applyDmg(this.dps * dt));
        if (!e._slow || e._slow < this.slow) e._slow = this.slow;
        e._slowTimer = 0.5;
        const totalFreezeChance = this.freezeChance + freezeBonus;
        if (totalFreezeChance > 0 && Math.random() < totalFreezeChance * dt) {
          e._frozen = this.freezeDur + freezeDurBonus;
          if (sfx) sfx('freeze');
        }
      }
    }
  }
  draw(ctx, cam, canvas) {
    const s = cam.w2s(this.owner.x, this.owner.y, canvas);
    const r = this.radius;
    const pulse = Math.sin(this.pulseTimer * 2) * 0.15 + 0.35;
    ctx.strokeStyle = `rgba(144,202,249,${pulse})`;
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(s.x, s.y, r, 0, Math.PI * 2); ctx.stroke();
    const grad = ctx.createRadialGradient(s.x, s.y, 5, s.x, s.y, r);
    grad.addColorStop(0, 'rgba(179,229,252,0.15)');
    grad.addColorStop(0.7, 'rgba(144,202,249,0.08)');
    grad.addColorStop(1, 'rgba(144,202,249,0)');
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.arc(s.x, s.y, r, 0, Math.PI * 2); ctx.fill();
    if (this.pulseTimer % 2 < 0.1) {
      const pr = r * 1.3;
      ctx.strokeStyle = `rgba(179,229,252,${0.5 - this.pulseTimer % 2 * 0.25})`;
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(s.x, s.y, pr, 0, Math.PI * 2); ctx.stroke();
    }
    for (let i = 0; i < 3; i++) {
      const a = this.pulseTimer * 0.5 + Math.PI * 2 / 3 * i;
      const pr = r * 0.7;
      const px = s.x + Math.cos(a) * pr;
      const py = s.y + Math.sin(a) * pr;
      ctx.fillStyle = `rgba(255,255,255,${0.3 + Math.sin(this.pulseTimer * 3 + i) * 0.2})`;
      ctx.fillRect(px - 1, py - 1, 3, 3);
    }
  }
}

// --- Blizzard (evolved) ---
export class Blizzard extends Weapon {
  constructor(owner) { super('blizzard', owner); this.angle = 0; this.lightningTimer = 0; this.shardTimer = 0; this.pulseTimer = 0; this.effects = []; this.shards = []; }
  get maxLevel() { return 1; }
  get radius() { return 160; }
  get slow() { return 0.7; }
  get dps() { return 3; }
  get freezeChance() { return 0.15; }
  get freezeDur() { return 2; }
  get lightningCD() { return 2; }
  get lightningDmg() { return 8; }
  get lightningChains() { return 2; }
  get shardCD() { return 3; }
  get shardDmg() { return 4; }
  get shardCount() { return 12; }
  update(dt, enemies, sfx, playerCritsFn) {
    this.angle += dt * 2;
    this.pulseTimer += dt;
    for (const e of enemies) {
      const d = dist(this.owner, e);
      if (d < this.radius) {
        e.hurt(this.applyDmg(this.dps * dt));
        if (!e._slow || e._slow < this.slow) e._slow = this.slow;
        e._slowTimer = 0.5;
        if (this.freezeChance > 0 && Math.random() < this.freezeChance * dt) {
          e._frozen = this.freezeDur;
          if (sfx) sfx('freeze');
        }
      }
    }
    this.lightningTimer -= dt;
    for (let i = this.effects.length - 1; i >= 0; i--) {
      this.effects[i].t -= dt;
      if (this.effects[i].t <= 0) this.effects.splice(i, 1);
    }
    if (this.lightningTimer <= 0) {
      this.lightningTimer = this.lightningCD;
      const nearEnemies = enemies.filter(e => dist(this.owner, e) < this.radius);
      for (let b = 0; b < 3 && nearEnemies.length > 0; b++) {
        const idx = randInt(0, nearEnemies.length - 1);
        const target = nearEnemies[idx];
        target.hurt(this.applyDmg(this.lightningDmg));
        this.effects.push({ x0: this.owner.x, y0: this.owner.y, x1: target.x, y1: target.y, t: 0.2 });
        const hit = new Set([target]);
        let prev = target;
        for (let c = 0; c < this.lightningChains; c++) {
          let next = null, nd = Infinity;
          for (const e of enemies) {
            if (hit.has(e)) continue;
            const d = dist(prev, e);
            if (d < 150 && d < nd) { nd = d; next = e; }
          }
          if (next) {
            next.hurt(this.applyDmg(this.lightningDmg * 0.5));
            hit.add(next);
            this.effects.push({ x0: prev.x, y0: prev.y, x1: next.x, y1: next.y, t: 0.2 });
            prev = next;
          }
        }
      }
    }
    this.shardTimer -= dt;
    for (let i = this.shards.length - 1; i >= 0; i--) {
      const s = this.shards[i];
      s.x += s.vx * dt; s.y += s.vy * dt; s.life -= dt;
      if (s.life <= 0) { this.shards.splice(i, 1); continue; }
      for (const e of enemies) {
        if (s.hit.has(e)) continue;
        if (Math.abs(s.x - e.x) < (6 + e.w / 2) && Math.abs(s.y - e.y) < (6 + e.h / 2)) {
          e.hurt(this.applyDmg(this.shardDmg), playerCritsFn ? playerCritsFn() : false);
          s.hit.add(e);
          break;
        }
      }
    }
    if (this.shardTimer <= 0) {
      this.shardTimer = this.shardCD;
      for (let i = 0; i < this.shardCount; i++) {
        const a = Math.PI * 2 / this.shardCount * i;
        this.shards.push({ x: this.owner.x, y: this.owner.y, vx: Math.cos(a) * 120, vy: Math.sin(a) * 120, life: 0.7, hit: new Set() });
      }
    }
  }
  draw(ctx, cam, canvas) {
    const s = cam.w2s(this.owner.x, this.owner.y, canvas);
    const r = this.radius;
    const pulse = Math.sin(this.pulseTimer * 2) * 0.15 + 0.35;
    ctx.strokeStyle = `rgba(100,181,246,${pulse})`;
    ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(s.x, s.y, r, 0, Math.PI * 2); ctx.stroke();
    const grad = ctx.createRadialGradient(s.x, s.y, 5, s.x, s.y, r);
    grad.addColorStop(0, 'rgba(179,229,252,0.2)');
    grad.addColorStop(0.6, 'rgba(144,202,249,0.1)');
    grad.addColorStop(1, 'rgba(100,181,246,0)');
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.arc(s.x, s.y, r, 0, Math.PI * 2); ctx.fill();
    const flashPulse = Math.sin(this.pulseTimer * 8) * 0.5 + 0.5;
    if (flashPulse > 0.7) {
      ctx.fillStyle = `rgba(255,235,59,${(flashPulse - 0.7) * 0.3})`;
      ctx.beginPath(); ctx.arc(s.x, s.y, r * 0.3, 0, Math.PI * 2); ctx.fill();
    }
    for (let i = 0; i < 6; i++) {
      const a = this.pulseTimer * 0.8 + Math.PI * 2 / 6 * i;
      const px = s.x + Math.cos(a) * r * 0.6;
      const py = s.y + Math.sin(a) * r * 0.6;
      ctx.fillStyle = `rgba(255,255,255,${0.3 + Math.sin(this.pulseTimer * 3 + i) * 0.2})`;
      ctx.fillRect(px - 1, py - 1, 3, 3);
    }
    ctx.strokeStyle = `rgba(255,215,0,${pulse * 0.7})`;
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(s.x, s.y, r + 12, 0, Math.PI * 2); ctx.stroke();
    for (const e of this.effects) {
      const s0 = cam.w2s(e.x0, e.y0, canvas);
      const s1 = cam.w2s(e.x1, e.y1, canvas);
      ctx.strokeStyle = `rgba(255,235,59,${e.t * 5})`;
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(s0.x, s0.y);
      for (let i = 1; i <= 4; i++) {
        const t = i / 4;
        ctx.lineTo(s0.x + (s1.x - s0.x) * t + (Math.random() - 0.5) * 14,
                    s0.y + (s1.y - s0.y) * t + (Math.random() - 0.5) * 14);
      }
      ctx.lineTo(s1.x, s1.y); ctx.stroke();
    }
    for (const sh of this.shards) {
      const ss = cam.w2s(sh.x, sh.y, canvas);
      const alpha = sh.life / 0.7;
      ctx.fillStyle = `rgba(179,229,252,${alpha})`;
      ctx.fillRect(ss.x - 3, ss.y - 3, 6, 6);
      ctx.fillStyle = `rgba(255,255,255,${alpha * 0.7})`;
      ctx.fillRect(ss.x - 1, ss.y - 1, 2, 2);
    }
  }
}

// --- ThunderHolyWater (evolved) ---
export class ThunderHolyWater extends Weapon {
  constructor(owner) { super('thunderholywater', owner); this.angle = 0; this.lightningTimer = 0; this.effects = []; }
  get maxLevel() { return 1; }
  get count() { return 3; }
  get radius() { return 60; }
  get dmg() { return 1.5; }
  get lightningDmg() { return 6; }
  get chains() { return 3; }
  get lightningCD() { return 2; }
  update(dt, enemies) {
    this.angle += dt * 3;
    for (let i = 0; i < this.count; i++) {
      const a = this.angle + Math.PI * 2 / this.count * i;
      const bx = this.owner.x + Math.cos(a) * this.radius;
      const by = this.owner.y + Math.sin(a) * this.radius;
      for (const e of enemies) {
        if (Math.abs(bx - e.x) < (12 + e.w / 2) && Math.abs(by - e.y) < (12 + e.h / 2)) {
          e.hurt(this.applyDmg(this.dmg * dt * 15));
        }
      }
    }
    this.lightningTimer -= dt;
    for (let i = this.effects.length - 1; i >= 0; i--) {
      this.effects[i].t -= dt;
      if (this.effects[i].t <= 0) this.effects.splice(i, 1);
    }
    if (this.lightningTimer <= 0) {
      this.lightningTimer = this.lightningCD;
      const nearEnemies = enemies.filter(e => dist(this.owner, e) < 250);
      for (let i = 0; i < this.count && nearEnemies.length > 0; i++) {
        const a = this.angle + Math.PI * 2 / this.count * i;
        const bx = this.owner.x + Math.cos(a) * this.radius;
        const by = this.owner.y + Math.sin(a) * this.radius;
        let nearest = null, nd = Infinity;
        for (const e of nearEnemies) {
          const d = Math.hypot(bx - e.x, by - e.y);
          if (d < nd) { nd = d; nearest = e; }
        }
        if (nearest) {
          nearest.hurt(this.applyDmg(this.lightningDmg));
          this.effects.push({ x0: bx, y0: by, x1: nearest.x, y1: nearest.y, t: 0.2 });
          const hit = new Set([nearest]);
          let prev = nearest;
          for (let c = 0; c < this.chains; c++) {
            let next = null; nd = Infinity;
            for (const e of enemies) {
              if (hit.has(e)) continue;
              const d = dist(prev, e);
              if (d < 150 && d < nd) { nd = d; next = e; }
            }
            if (next) {
              next.hurt(this.applyDmg(this.lightningDmg * 0.5));
              hit.add(next);
              this.effects.push({ x0: prev.x, y0: prev.y, x1: next.x, y1: next.y, t: 0.2 });
              prev = next;
            }
          }
        }
      }
    }
  }
  draw(ctx, cam, canvas) {
    const r = this.radius;
    for (let i = 0; i < this.count; i++) {
      const a = this.angle + Math.PI * 2 / this.count * i;
      const bx = this.owner.x + Math.cos(a) * r;
      const by = this.owner.y + Math.sin(a) * r;
      const s = cam.w2s(bx, by, canvas);
      ctx.fillStyle = 'rgba(255,235,59,0.3)';
      ctx.fillRect(s.x - 8, s.y - 8, 16, 16);
      ctx.fillStyle = '#29b6f6'; ctx.fillRect(s.x - 5, s.y - 5, 10, 10);
      ctx.fillStyle = '#0288d1'; ctx.fillRect(s.x - 3, s.y - 3, 6, 6);
      ctx.fillStyle = '#ffeb3b'; ctx.fillRect(s.x - 1, s.y - 1, 2, 2);
    }
    for (const e of this.effects) {
      const s0 = cam.w2s(e.x0, e.y0, canvas);
      const s1 = cam.w2s(e.x1, e.y1, canvas);
      ctx.strokeStyle = `rgba(255,235,59,${e.t * 5})`;
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(s0.x, s0.y);
      for (let i = 1; i <= 4; i++) {
        const t = i / 4;
        ctx.lineTo(s0.x + (s1.x - s0.x) * t + (Math.random() - 0.5) * 14,
                    s0.y + (s1.y - s0.y) * t + (Math.random() - 0.5) * 14);
      }
      ctx.lineTo(s1.x, s1.y); ctx.stroke();
    }
    const cs = cam.w2s(this.owner.x, this.owner.y, canvas);
    const pulse = Math.sin(Date.now() * 0.004) * 0.15 + 0.35;
    ctx.strokeStyle = `rgba(255,145,0,${pulse})`;
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(cs.x, cs.y, r + 10, 0, Math.PI * 2); ctx.stroke();
  }
}

// --- FireKnife (evolved) ---
export class FireKnife extends Weapon {
  constructor(owner) { super('fireknife', owner); this.timer = 0; }
  get maxLevel() { return 1; }
  get count() { return 5; }
  get dmg() { return 3; }
  get pierce() { return 2; }
  get burnDps() { return 3; }
  get burnDur() { return 2; }
  get cd() { return 0.5; }
  update(dt, enemies, bullets) {
    this.timer -= dt;
    if (this.timer <= 0) {
      this.timer = this.cd;
      let nearest = null, nd = Infinity;
      for (const e of enemies) {
        const d = dist(this.owner, e);
        if (d < nd) { nd = d; nearest = e; }
      }
      if (nearest) {
        for (let i = 0; i < this.count; i++) {
          const dir = new V(nearest.x - this.owner.x, nearest.y - this.owner.y).norm();
          const spread = i > 0 ? (i % 2 === 1 ? 0.12 : -0.12) * (Math.ceil(i / 2)) : 0;
          const cos = Math.cos(spread), sin = Math.sin(spread);
          const dx = dir.x * cos - dir.y * sin;
          const dy = dir.x * sin + dir.y * cos;
          if (bullets.length < CFG.MAX_BULLETS) {
            bullets.push({ x: this.owner.x, y: this.owner.y, vx: dx * 280, vy: dy * 280,
              w: 6, h: 4, dmg: this.applyDmg(this.dmg), life: 1.8, color: '#ff6d00', pierce: this.pierce, hit: new Set(),
              burnDmg: this.applyDmg(this.burnDps), burnDur: this.burnDur });
          }
        }
      }
    }
  }
}

// --- HolyDomain (evolved) ---
export class HolyDomain extends Weapon {
  constructor(owner) { super('holydomain', owner); this.angle = 0; this.pulseTimer = 0; this.pulseEffects = []; }
  get maxLevel() { return 1; }
  get radius() { return 130; }
  get orbCount() { return 4; }
  get orbDps() { return 2.5; }
  get pulseInterval() { return 4; }
  get pulseDmg() { return 12; }
  get pulseRadius() { return 200; }
  update(dt, enemies, sfx, playerCritsFn) {
    this.angle += dt * 4;
    for (let i = 0; i < this.orbCount; i++) {
      const a = this.angle + Math.PI * 2 / this.orbCount * i;
      const bx = this.owner.x + Math.cos(a) * this.radius;
      const by = this.owner.y + Math.sin(a) * this.radius;
      for (const e of enemies) {
        if (Math.abs(bx - e.x) < (14 + e.w / 2) && Math.abs(by - e.y) < (14 + e.h / 2)) {
          e.hurt(this.applyDmg(this.orbDps * dt));
        }
      }
    }
    this.pulseTimer -= dt;
    for (let i = this.pulseEffects.length - 1; i >= 0; i--) {
      this.pulseEffects[i].t -= dt;
      if (this.pulseEffects[i].t <= 0) this.pulseEffects.splice(i, 1);
    }
    if (this.pulseTimer <= 0) {
      this.pulseTimer = this.pulseInterval;
      for (const e of enemies) {
        const d = dist(this.owner, e);
        if (d < this.pulseRadius) {
          e.hurt(this.applyDmg(this.pulseDmg), playerCritsFn ? playerCritsFn() : false);
        }
      }
      this.pulseEffects.push({ x: this.owner.x, y: this.owner.y, t: 0.5, r: this.pulseRadius });
    }
  }
  draw(ctx, cam, canvas) {
    const s = cam.w2s(this.owner.x, this.owner.y, canvas);
    const pulse = Math.sin(Date.now() * 0.004) * 0.15 + 0.35;
    ctx.strokeStyle = `rgba(255,215,0,${pulse})`;
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(s.x, s.y, this.radius + 10, 0, Math.PI * 2); ctx.stroke();
    for (let i = 0; i < this.orbCount; i++) {
      const a = this.angle + Math.PI * 2 / this.orbCount * i;
      const bx = this.owner.x + Math.cos(a) * this.radius;
      const by = this.owner.y + Math.sin(a) * this.radius;
      const os = cam.w2s(bx, by, canvas);
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.fillRect(os.x - 10, os.y - 10, 20, 20);
      ctx.fillStyle = '#e0e0ff';
      ctx.fillRect(os.x - 6, os.y - 6, 12, 12);
      ctx.fillStyle = '#bbdefb';
      ctx.fillRect(os.x - 4, os.y - 4, 8, 8);
      ctx.fillStyle = '#fff';
      ctx.fillRect(os.x - 2, os.y - 2, 4, 4);
    }
    for (const p of this.pulseEffects) {
      const ps = cam.w2s(p.x, p.y, canvas);
      const alpha = p.t * 2;
      ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(ps.x, ps.y, p.r * (1 - p.t * 0.5), 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = `rgba(255,255,200,${alpha * 0.15})`;
      ctx.beginPath(); ctx.arc(ps.x, ps.y, p.r * (1 - p.t * 0.5), 0, Math.PI * 2); ctx.fill();
    }
  }
}

// --- FrostKnife (evolved: knife + frostaura) ---
export class FrostKnife extends Weapon {
  constructor(owner) { super('frostknife', owner); this.timer = 0; }
  get maxLevel() { return 1; }
  get count() { return 5; }
  get dmg() { return 2.5; }
  get pierce() { return 2; }
  get cd() { return 0.6; }
  get slowAmount() { return 0.4; }
  get slowDur() { return 1.5; }
  get freezeChance() { return 0.05; }
  get freezeDur() { return 1; }
  update(dt, enemies, bullets, sfx) {
    this.timer -= dt;
    if (this.timer <= 0) {
      this.timer = this.cd;
      let nearest = null, nd = Infinity;
      for (const e of enemies) {
        const d = dist(this.owner, e);
        if (d < nd) { nd = d; nearest = e; }
      }
      if (nearest) {
        if (sfx) sfx('knife');
        for (let i = 0; i < this.count; i++) {
          const dir = new V(nearest.x - this.owner.x, nearest.y - this.owner.y).norm();
          const spread = i > 0 ? (i % 2 === 1 ? 0.12 : -0.12) * (Math.ceil(i / 2)) : 0;
          const cos = Math.cos(spread), sin = Math.sin(spread);
          const dx = dir.x * cos - dir.y * sin;
          const dy = dir.x * sin + dir.y * cos;
          if (bullets.length < CFG.MAX_BULLETS) {
            bullets.push({
              x: this.owner.x, y: this.owner.y,
              vx: dx * 260, vy: dy * 260,
              w: 6, h: 4, dmg: this.applyDmg(this.dmg), life: 1.8,
              color: '#4fc3f7', pierce: this.pierce, hit: new Set(),
              frostSlow: this.slowAmount, frostSlowDur: this.slowDur,
              frostFreezeChance: this.freezeChance, frostFreezeDur: this.freezeDur
            });
          }
        }
      }
    }
  }
}

// --- FlameBible (evolved: bible + firestaff) ---
export class FlameBible extends Weapon {
  constructor(owner) { super('flamebible', owner); this.angle = 0; this.hitTimers = new Map(); this.pulseTimer = 0; this.pulseEffects = []; }
  get maxLevel() { return 1; }
  get radius() { return 140; }
  get speed() { return 4; }
  get dps() { return 5; }
  get burnDps() { return 3; }
  get burnDur() { return 2; }
  get pulseCD() { return 3; }
  get pulseDmg() { return 8; }
  get pulseRadius() { return 100; }
  update(dt, enemies, sfx) {
    this.angle += dt * this.speed;
    // Continuous DPS + burn for enemies within radius
    for (const e of enemies) {
      const d = dist(this.owner, e);
      if (d < this.radius) {
        if (!this.hitTimers.has(e)) this.hitTimers.set(e, 0);
        const ht = this.hitTimers.get(e);
        if (ht <= 0) {
          e.hurt(this.applyDmg(this.dps));
          // Apply burn
          if (!e._burn) e._burn = { dmg: 0, t: 0 };
          e._burn.dmg = this.applyDmg(this.burnDps);
          e._burn.t = this.burnDur;
          this.hitTimers.set(e, 0.3);
        } else {
          this.hitTimers.set(e, ht - dt);
        }
      }
    }
    // Clean up stale hit timers
    for (const [e] of this.hitTimers) {
      if (!enemies.includes(e)) this.hitTimers.delete(e);
    }
    // Fire pulse every 3 seconds
    this.pulseTimer -= dt;
    for (let i = this.pulseEffects.length - 1; i >= 0; i--) {
      this.pulseEffects[i].t -= dt;
      if (this.pulseEffects[i].t <= 0) this.pulseEffects.splice(i, 1);
    }
    if (this.pulseTimer <= 0) {
      this.pulseTimer = this.pulseCD;
      for (const e of enemies) {
        const d = dist(this.owner, e);
        if (d < this.pulseRadius) {
          e.hurt(this.applyDmg(this.pulseDmg));
          // Pulse also applies burn
          if (!e._burn) e._burn = { dmg: 0, t: 0 };
          e._burn.dmg = this.applyDmg(this.burnDps);
          e._burn.t = this.burnDur;
        }
      }
      this.pulseEffects.push({ x: this.owner.x, y: this.owner.y, t: 0.4, r: this.pulseRadius });
      if (sfx) sfx('lightning');
    }
  }
  draw(ctx, cam, canvas) {
    const s = cam.w2s(this.owner.x, this.owner.y, canvas);
    const r = this.radius;
    // Rotating flame ring
    const pulse = Math.sin(this.angle * 2) * 0.15 + 0.5;
    ctx.strokeStyle = `rgba(255,87,34,${pulse})`;
    ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(s.x, s.y, r, 0, Math.PI * 2); ctx.stroke();
    // Inner glow
    const grad = ctx.createRadialGradient(s.x, s.y, 10, s.x, s.y, r);
    grad.addColorStop(0, 'rgba(255,152,0,0.15)');
    grad.addColorStop(0.6, 'rgba(255,87,34,0.08)');
    grad.addColorStop(1, 'rgba(255,87,34,0)');
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.arc(s.x, s.y, r, 0, Math.PI * 2); ctx.fill();
    // Rotating book pages (4 pages like Bible, but fire-colored)
    for (let i = 0; i < 4; i++) {
      const a = this.angle + Math.PI / 2 * i;
      const cx = s.x + Math.cos(a) * r * 0.6;
      const cy = s.y + Math.sin(a) * r * 0.6;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(a + Math.PI / 2);
      ctx.fillStyle = '#ff6d00';
      ctx.fillRect(-14, -5, 28, 10);
      ctx.fillStyle = '#ff9100';
      ctx.fillRect(-14, -5, 28, 2);
      ctx.fillRect(-14, 3, 28, 2);
      ctx.fillStyle = '#ffeb3b';
      ctx.fillRect(-10, -1, 20, 1);
      ctx.fillRect(-10, 1, 16, 1);
      ctx.restore();
    }
    // Fire particles orbiting
    for (let i = 0; i < 6; i++) {
      const a = this.angle * 1.5 + Math.PI * 2 / 6 * i;
      const pr = r * 0.8;
      const px = s.x + Math.cos(a) * pr;
      const py = s.y + Math.sin(a) * pr;
      ctx.fillStyle = `rgba(255,${Math.floor(rand(100, 200))},0,${0.4 + Math.sin(this.angle * 3 + i) * 0.2})`;
      ctx.fillRect(px - 2, py - 2, 4, 4);
      ctx.fillStyle = `rgba(255,235,59,${0.3 + Math.sin(this.angle * 3 + i) * 0.15})`;
      ctx.fillRect(px - 1, py - 1, 2, 2);
    }
    // Fire pulse wave effects
    for (const p of this.pulseEffects) {
      const ps = cam.w2s(p.x, p.y, canvas);
      const alpha = p.t * 2.5;
      const expandR = p.r * (1.3 - p.t * 0.8);
      ctx.strokeStyle = `rgba(255,87,34,${alpha})`;
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(ps.x, ps.y, expandR, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = `rgba(255,152,0,${alpha * 0.1})`;
      ctx.beginPath(); ctx.arc(ps.x, ps.y, expandR, 0, Math.PI * 2); ctx.fill();
    }
  }
}

// --- Boomerang ---
export class Boomerang extends Weapon {
  constructor(owner) {
    super('boomerang', owner);
    this.projectiles = [];
  }
  getLevelData() {
    return CFG.BOOMERANG.levels[this.level] || CFG.BOOMERANG.levels[1];
  }
  findNearestEnemy(enemies, fromX, fromY, maxDist) {
    let best = null, bestD = maxDist * maxDist;
    for (const e of enemies) {
      if (e.hp <= 0) continue;
      const d = (e.x - fromX) ** 2 + (e.y - fromY) ** 2;
      if (d < bestD) { bestD = d; best = e; }
    }
    return best;
  }
  update(dt, enemies) {
    const data = this.getLevelData();
    this.timer -= dt;
    if (this.timer <= 0) {
      this.timer = data.cd;
      const bonus = this.owner.getWeaponBonus ? this.owner.getWeaponBonus('boomerang') : {};
      const count = data.count + (bonus.extraCount || 0);
      for (let i = 0; i < count; i++) {
        const target = this.findNearestEnemy(enemies, this.owner.x, this.owner.y, data.maxDist * 2);
        let angle;
        if (target) {
          angle = Math.atan2(target.y - this.owner.y, target.x - this.owner.x);
        } else {
          angle = Math.random() * Math.PI * 2;
        }
        this.projectiles.push({
          x: this.owner.x, y: this.owner.y,
          vx: Math.cos(angle) * data.speed,
          vy: Math.sin(angle) * data.speed,
          returning: false,
          dist: 0,
          hit: new Set(),
          angle: angle,
          rotAngle: 0,
          trail: [],
        });
      }
    }
    // Update projectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.rotAngle += dt * 12;
      if (!p.returning) {
        // Outgoing: track nearest enemy
        const trackRad = data.trackAngle * dt;
        const tgt = this.findNearestEnemy(enemies, p.x, p.y, 200);
        if (tgt) {
          const desired = Math.atan2(tgt.y - p.y, tgt.x - p.x);
          let diff = desired - Math.atan2(p.vy, p.vx);
          while (diff > Math.PI) diff -= Math.PI * 2;
          while (diff < -Math.PI) diff += Math.PI * 2;
          const turn = Math.sign(diff) * Math.min(Math.abs(diff), trackRad);
          const curAngle = Math.atan2(p.vy, p.vx) + turn;
          const spd = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
          p.vx = Math.cos(curAngle) * spd;
          p.vy = Math.sin(curAngle) * spd;
        }
        // Add curvature offset (slight sideways drift)
        const perpX = -p.vy * data.curvature * dt;
        const perpY = p.vx * data.curvature * dt;
        p.x += (p.vx + perpX) * dt;
        p.y += (p.vy + perpY) * dt;
        p.dist += Math.sqrt(p.vx * p.vx + p.vy * p.vy) * dt;
        // Check max distance
        if (p.dist >= data.maxDist) { p.returning = true; }
        // Check enemies
        for (const e of enemies) {
          if (e.hp <= 0 || p.hit.has(e)) continue;
          if (Math.abs(p.x - e.x) < (8 + e.w / 2) && Math.abs(p.y - e.y) < (8 + e.h / 2)) {
            e.hurt(this.applyDmg(data.dmg));
            p.hit.add(e);
            if (data.pierce > 0 && p.hit.size <= data.pierce) continue;
            if (!data.pierce) { p.returning = true; break; }
          }
        }
      } else {
        // Returning: fly back to player
        const dx = this.owner.x - p.x, dy = this.owner.y - p.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 15) {
          this.projectiles.splice(i, 1); continue;
        }
        const retSpd = data.returnSpeed || data.speed * 1.15;
        p.vx = dx / d * retSpd;
        p.vy = dy / d * retSpd;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        // Return trip also damages enemies
        for (const e of enemies) {
          if (e.hp <= 0 || p.hit.has(e)) continue;
          if (Math.abs(p.x - e.x) < (8 + e.w / 2) && Math.abs(p.y - e.y) < (8 + e.h / 2)) {
            e.hurt(this.applyDmg(data.dmg));
            p.hit.add(e);
          }
        }
      }
    }
  }
  draw(ctx, cam, canvas) {
    for (const p of this.projectiles) {
      const s = cam.w2s(p.x, p.y, canvas);
      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.rotate(p.rotAngle);
      // V-shape boomerang (12x6)
      ctx.fillStyle = '#ffc107'; // gold
      ctx.fillRect(-6, -1, 5, 2);
      ctx.fillRect(1, -1, 5, 2);
      ctx.fillRect(-6, -3, 2, 2);
      ctx.fillRect(4, -3, 2, 2);
      ctx.fillStyle = '#795548'; // wood brown
      ctx.fillRect(-4, 0, 3, 1);
      ctx.fillRect(1, 0, 3, 1);
      ctx.fillStyle = '#fff8e1'; // highlight
      ctx.fillRect(-3, -2, 1, 1);
      ctx.fillRect(3, -2, 1, 1);
      ctx.restore();
    }
  }
}

// --- Thunderang (evolved: boomerang + lightning) ---
export class Thunderang extends Weapon {
  constructor(owner) {
    super('thunderang', owner);
    this.projectiles = [];
    this.effects = [];
  }
  get maxLevel() { return 1; }
  findNearestEnemy(enemies, fromX, fromY, maxDist) {
    let best = null, bestD = maxDist * maxDist;
    for (const e of enemies) {
      if (e.hp <= 0) continue;
      const d = (e.x - fromX) ** 2 + (e.y - fromY) ** 2;
      if (d < bestD) { bestD = d; best = e; }
    }
    return best;
  }
  triggerLightningChain(sourceX, sourceY, enemies, excludeHit) {
    const cfg = CFG.BOOMERANG.thunderang.lightning;
    if (Math.random() > cfg.chance) return;
    const chainHitSet = new Set(excludeHit);
    let prev = { x: sourceX, y: sourceY };
    for (let chain = 0; chain < cfg.chains; chain++) {
      let next = null, nd = Infinity;
      for (const e of enemies) {
        if (e.hp <= 0 || chainHitSet.has(e)) continue;
        const d = (e.x - prev.x) ** 2 + (e.y - prev.y) ** 2;
        if (d < cfg.range * cfg.range && d < nd) { nd = d; next = e; }
      }
      if (next) {
        const dmgMul = chain === 0 ? 1 : cfg.decay ** chain;
        next.hurt(this.applyDmg(cfg.dmg * dmgMul));
        chainHitSet.add(next);
        this.effects.push({ x0: prev.x, y0: prev.y, x1: next.x, y1: next.y, t: 0.2 });
        prev = next;
      } else break;
    }
  }
  update(dt, enemies) {
    const data = CFG.BOOMERANG.thunderang;
    this.timer -= dt;
    // Decay lightning effects
    for (let i = this.effects.length - 1; i >= 0; i--) {
      this.effects[i].t -= dt;
      if (this.effects[i].t <= 0) this.effects.splice(i, 1);
    }
    if (this.timer <= 0) {
      this.timer = data.cd;
      // Find up to 'count' different nearest enemies
      const targets = [];
      const used = new Set();
      for (let i = 0; i < data.count; i++) {
        let best = null, bestD = Infinity;
        for (const e of enemies) {
          if (e.hp <= 0 || used.has(e)) continue;
          const d = (e.x - this.owner.x) ** 2 + (e.y - this.owner.y) ** 2;
          if (d < data.maxDist * 4 * data.maxDist * 4 && d < bestD) { bestD = d; best = e; }
        }
        if (best) { targets.push(best); used.add(best); }
        else break;
      }
      for (let i = 0; i < data.count; i++) {
        const target = targets[i] || targets[0] || null;
        let angle;
        if (target) {
          angle = Math.atan2(target.y - this.owner.y, target.x - this.owner.x);
        } else {
          angle = Math.random() * Math.PI * 2;
        }
        this.projectiles.push({
          x: this.owner.x, y: this.owner.y,
          vx: Math.cos(angle) * data.speed,
          vy: Math.sin(angle) * data.speed,
          returning: false,
          dist: 0,
          hit: new Set(),
          returnHit: new Set(),
          angle, rotAngle: 0,
        });
      }
    }
    // Update projectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.rotAngle += dt * 12;
      if (!p.returning) {
        const trackRad = data.trackAngle * dt;
        const tgt = this.findNearestEnemy(enemies, p.x, p.y, 200);
        if (tgt) {
          const desired = Math.atan2(tgt.y - p.y, tgt.x - p.x);
          let diff = desired - Math.atan2(p.vy, p.vx);
          while (diff > Math.PI) diff -= Math.PI * 2;
          while (diff < -Math.PI) diff += Math.PI * 2;
          const turn = Math.sign(diff) * Math.min(Math.abs(diff), trackRad);
          const curAngle = Math.atan2(p.vy, p.vx) + turn;
          const spd = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
          p.vx = Math.cos(curAngle) * spd;
          p.vy = Math.sin(curAngle) * spd;
        }
        const perpX = -p.vy * data.curvature * dt;
        const perpY = p.vx * data.curvature * dt;
        p.x += (p.vx + perpX) * dt;
        p.y += (p.vy + perpY) * dt;
        p.dist += Math.sqrt(p.vx * p.vx + p.vy * p.vy) * dt;
        if (p.dist >= data.maxDist) { p.returning = true; }
        for (const e of enemies) {
          if (e.hp <= 0 || p.hit.has(e)) continue;
          if (Math.abs(p.x - e.x) < (8 + e.w / 2) && Math.abs(p.y - e.y) < (8 + e.h / 2)) {
            e.hurt(this.applyDmg(data.dmg));
            p.hit.add(e);
            this.triggerLightningChain(e.x, e.y, enemies, p.hit);
            if (data.pierce > 0 && p.hit.size <= data.pierce) continue;
            if (!data.pierce) { p.returning = true; break; }
          }
        }
      } else {
        const dx = this.owner.x - p.x, dy = this.owner.y - p.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 15) { this.projectiles.splice(i, 1); continue; }
        p.vx = dx / d * data.returnSpeed;
        p.vy = dy / d * data.returnSpeed;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        for (const e of enemies) {
          if (e.hp <= 0 || p.returnHit.has(e)) continue;
          if (Math.abs(p.x - e.x) < (8 + e.w / 2) && Math.abs(p.y - e.y) < (8 + e.h / 2)) {
            e.hurt(this.applyDmg(data.dmg));
            p.returnHit.add(e);
            this.triggerLightningChain(e.x, e.y, enemies, p.returnHit);
          }
        }
      }
    }
  }
  draw(ctx, cam, canvas) {
    for (const p of this.projectiles) {
      const s = cam.w2s(p.x, p.y, canvas);
      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.rotate(p.rotAngle);
      // Gold V-shape with blue electric arcs
      ctx.fillStyle = '#ffc107';
      ctx.fillRect(-6, -1, 5, 2);
      ctx.fillRect(1, -1, 5, 2);
      ctx.fillRect(-6, -3, 2, 2);
      ctx.fillRect(4, -3, 2, 2);
      ctx.fillStyle = '#795548';
      ctx.fillRect(-4, 0, 3, 1);
      ctx.fillRect(1, 0, 3, 1);
      ctx.fillStyle = '#fff8e1';
      ctx.fillRect(-3, -2, 1, 1);
      ctx.fillRect(3, -2, 1, 1);
      // Electric arc wrapping
      const flicker = Math.random() * 0.6 + 0.4;
      ctx.fillStyle = `rgba(255,235,59,${flicker})`;
      ctx.fillRect(-7, -4 + Math.random() * 2, 2, 1);
      ctx.fillRect(5, -4 + Math.random() * 2, 2, 1);
      ctx.fillRect(-2, -5, 4, 1);
      ctx.restore();
    }
    // Lightning chain effects
    for (const e of this.effects) {
      const s0 = cam.w2s(e.x0, e.y0, canvas);
      const s1 = cam.w2s(e.x1, e.y1, canvas);
      ctx.strokeStyle = `rgba(255,235,59,${e.t * 5})`;
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(s0.x, s0.y);
      const steps = 4;
      for (let i = 1; i <= steps; i++) {
        const t = i / steps;
        ctx.lineTo(s0.x + (s1.x - s0.x) * t + (Math.random() - 0.5) * 14,
                    s0.y + (s1.y - s0.y) * t + (Math.random() - 0.5) * 14);
      }
      ctx.lineTo(s1.x, s1.y);
      ctx.stroke();
    }
  }
}

// --- Blazerang (evolved: boomerang + firestaff) ---
export class Blazerang extends Weapon {
  constructor(owner) {
    super('blazerang', owner);
    this.projectiles = [];
    this.trails = [];
  }
  get maxLevel() { return 1; }
  findNearestEnemy(enemies, fromX, fromY, maxDist) {
    let best = null, bestD = maxDist * maxDist;
    for (const e of enemies) {
      if (e.hp <= 0) continue;
      const d = (e.x - fromX) ** 2 + (e.y - fromY) ** 2;
      if (d < bestD) { bestD = d; best = e; }
    }
    return best;
  }
  update(dt, enemies) {
    const data = CFG.BOOMERANG.blazerang;
    const flame = data.flame;
    this.timer -= dt;
    if (this.timer <= 0) {
      this.timer = data.cd;
      const targets = [];
      const used = new Set();
      for (let i = 0; i < data.count; i++) {
        let best = null, bestD = Infinity;
        for (const e of enemies) {
          if (e.hp <= 0 || used.has(e)) continue;
          const d = (e.x - this.owner.x) ** 2 + (e.y - this.owner.y) ** 2;
          if (d < data.maxDist * 4 * data.maxDist * 4 && d < bestD) { bestD = d; best = e; }
        }
        if (best) { targets.push(best); used.add(best); }
        else break;
      }
      for (let i = 0; i < data.count; i++) {
        const target = targets[i] || targets[0] || null;
        let angle;
        if (target) {
          angle = Math.atan2(target.y - this.owner.y, target.x - this.owner.x);
        } else {
          angle = Math.random() * Math.PI * 2;
        }
        this.projectiles.push({
          x: this.owner.x, y: this.owner.y,
          vx: Math.cos(angle) * data.speed,
          vy: Math.sin(angle) * data.speed,
          returning: false,
          dist: 0,
          trailDist: 0,
          hit: new Set(),
          returnHit: new Set(),
          angle, rotAngle: 0,
        });
      }
    }
    // Update projectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.rotAngle += dt * 12;
      if (!p.returning) {
        const trackRad = data.trackAngle * dt;
        const tgt = this.findNearestEnemy(enemies, p.x, p.y, 200);
        if (tgt) {
          const desired = Math.atan2(tgt.y - p.y, tgt.x - p.x);
          let diff = desired - Math.atan2(p.vy, p.vx);
          while (diff > Math.PI) diff -= Math.PI * 2;
          while (diff < -Math.PI) diff += Math.PI * 2;
          const turn = Math.sign(diff) * Math.min(Math.abs(diff), trackRad);
          const curAngle = Math.atan2(p.vy, p.vx) + turn;
          const spd = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
          p.vx = Math.cos(curAngle) * spd;
          p.vy = Math.sin(curAngle) * spd;
        }
        const perpX = -p.vy * data.curvature * dt;
        const perpY = p.vx * data.curvature * dt;
        const stepX = (p.vx + perpX) * dt;
        const stepY = (p.vy + perpY) * dt;
        p.x += stepX;
        p.y += stepY;
        const stepDist = Math.sqrt(stepX * stepX + stepY * stepY);
        p.dist += stepDist;
        // Generate fire trail
        p.trailDist += stepDist;
        if (p.trailDist >= flame.trailInterval) {
          p.trailDist = 0;
          this.trails.push({ x: p.x, y: p.y, life: flame.trailDur, hitCD: new Map() });
          if (this.trails.length > flame.maxTrails) this.trails.shift();
        }
        if (p.dist >= data.maxDist) { p.returning = true; }
        for (const e of enemies) {
          if (e.hp <= 0 || p.hit.has(e)) continue;
          if (Math.abs(p.x - e.x) < (8 + e.w / 2) && Math.abs(p.y - e.y) < (8 + e.h / 2)) {
            e.hurt(this.applyDmg(data.dmg));
            p.hit.add(e);
            // Apply burn
            if (!e._burn) e._burn = { dmg: 0, t: 0 };
            e._burn.dmg = this.applyDmg(flame.burnDps);
            e._burn.t = flame.burnDur;
            if (data.pierce > 0 && p.hit.size <= data.pierce) continue;
            if (!data.pierce) { p.returning = true; break; }
          }
        }
      } else {
        const dx = this.owner.x - p.x, dy = this.owner.y - p.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 15) { this.projectiles.splice(i, 1); continue; }
        p.vx = dx / d * data.returnSpeed;
        p.vy = dy / d * data.returnSpeed;
        const stepX = p.vx * dt;
        const stepY = p.vy * dt;
        p.x += stepX;
        p.y += stepY;
        // Return trip also generates trail
        p.trailDist += Math.sqrt(stepX * stepX + stepY * stepY);
        if (p.trailDist >= flame.trailInterval) {
          p.trailDist = 0;
          this.trails.push({ x: p.x, y: p.y, life: flame.trailDur, hitCD: new Map() });
          if (this.trails.length > flame.maxTrails) this.trails.shift();
        }
        // Return trip damage + burn
        for (const e of enemies) {
          if (e.hp <= 0 || p.returnHit.has(e)) continue;
          if (Math.abs(p.x - e.x) < (8 + e.w / 2) && Math.abs(p.y - e.y) < (8 + e.h / 2)) {
            e.hurt(this.applyDmg(data.dmg));
            p.returnHit.add(e);
            if (!e._burn) e._burn = { dmg: 0, t: 0 };
            e._burn.dmg = this.applyDmg(flame.burnDps);
            e._burn.t = flame.burnDur;
          }
        }
      }
    }
    // Update fire trails
    for (let i = this.trails.length - 1; i >= 0; i--) {
      const trail = this.trails[i];
      trail.life -= dt;
      if (trail.life <= 0) { this.trails.splice(i, 1); continue; }
      for (const e of enemies) {
        if (e.hp <= 0) continue;
        if (Math.abs(trail.x - e.x) < (12 + e.w / 2) && Math.abs(trail.y - e.y) < (12 + e.h / 2)) {
          if (!trail.hitCD.has(e) || trail.hitCD.get(e) <= 0) {
            e.hurt(this.applyDmg(flame.trailDps * 0.5)); // 0.5s tick interval
            trail.hitCD.set(e, 0.5);
          } else {
            trail.hitCD.set(e, trail.hitCD.get(e) - dt);
          }
        }
      }
    }
  }
  draw(ctx, cam, canvas) {
    // Fire trails
    for (const trail of this.trails) {
      const alpha = trail.life / CFG.BOOMERANG.blazerang.flame.trailDur;
      const s = cam.w2s(trail.x, trail.y, canvas);
      ctx.fillStyle = `rgba(255,87,34,${alpha * 0.4})`;
      ctx.fillRect(s.x - 5, s.y - 5, 10, 10);
      ctx.fillStyle = `rgba(255,152,0,${alpha * 0.7})`;
      ctx.fillRect(s.x - 3, s.y - 3, 6, 6);
      ctx.fillStyle = `rgba(255,235,59,${alpha * 0.5})`;
      ctx.fillRect(s.x - 1, s.y - 1, 2, 2);
    }
    // Boomerangs
    for (const p of this.projectiles) {
      const s = cam.w2s(p.x, p.y, canvas);
      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.rotate(p.rotAngle);
      // Orange-red V-shape
      ctx.fillStyle = '#ff6d00';
      ctx.fillRect(-6, -1, 5, 2);
      ctx.fillRect(1, -1, 5, 2);
      ctx.fillRect(-6, -3, 2, 2);
      ctx.fillRect(4, -3, 2, 2);
      ctx.fillStyle = '#bf360c';
      ctx.fillRect(-4, 0, 3, 1);
      ctx.fillRect(1, 0, 3, 1);
      ctx.fillStyle = '#ffeb3b';
      ctx.fillRect(-3, -2, 1, 1);
      ctx.fillRect(3, -2, 1, 1);
      // Fire glow
      ctx.fillStyle = `rgba(255,87,34,${0.3 + Math.random() * 0.3})`;
      ctx.fillRect(-7, -2, 1, 1);
      ctx.fillRect(6, -2, 1, 1);
      ctx.restore();
    }
  }
}

// ===== Weapon Registry =====
export const WEAPON_CLASSES = {
  holywater: HolyWater,
  knife: Knife,
  lightning: Lightning,
  bible: Bible,
  firestaff: FireStaff,
  frostaura: FrostAura,
  boomerang: Boomerang,
  thunderholywater: ThunderHolyWater,
  fireknife: FireKnife,
  holydomain: HolyDomain,
  blizzard: Blizzard,
  frostknife: FrostKnife,
  flamebible: FlameBible,
  thunderang: Thunderang,
  blazerang: Blazerang,
};
