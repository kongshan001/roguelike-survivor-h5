// ===== Enemy Entity =====
import { CFG } from '../core/config.js';
import { V, rand, clamp, dist } from '../core/math.js';

export class Enemy {
  constructor(type, x, y, hpMul, spdMul) {
    const t = CFG.ENEMY_TYPES[type];
    this.type = type; this.x = x; this.y = y;
    this.w = t.w; this.h = t.h;
    this.hp = Math.ceil(t.hp * hpMul); this.maxHp = this.hp;
    this.speed = t.speed * spdMul; this.dmg = t.dmg;
    this.color = t.color; this.isBoss = t.isBoss || false;
    this.ranged = t.ranged || false;
    this.shootTimer = t.shootCD || 0;
    this.hitCD = 0;
    this.phase = 1; this.chargeTimer = 0; this.charging = false; this.chargeDir = null;
    this.sprayTimer = 0; this.spiralAngle = 0;
    this.phaseShift = t.phaseShift || false; this.teleport = t.teleport || false;
    this.phShiftTimer = 0; this.phShiftActive = false;
    this.hasTeleported = false; this.teleportCD = 0;
  }
  update(dt, player, bullets) {
    if (this.hitCD > 0) this.hitCD -= dt;
    if (this._frozen && this._frozen > 0) { this._frozen -= dt; return; }
    if (this._slowTimer && this._slowTimer > 0) { this._slowTimer -= dt; if (this._slowTimer <= 0) this._slow = 0; }
    if (this.ranged) {
      const d = dist(this, player);
      if (d > 250) { this.moveToward(player, dt); }
      else if (d < 150) { this.moveAway(player, dt); }
      this.shootTimer -= dt;
      if (this.shootTimer <= 0) {
        const tInfo = CFG.ENEMY_TYPES[this.type] || CFG.ENEMY_TYPES.skeleton;
        this.shootTimer = tInfo.shootCD || 2;
        const dir = new V(player.x - this.x, player.y - this.y).norm();
        if (tInfo.elite) {
          const baseAngle = Math.atan2(dir.y, dir.x);
          for (let a = -1; a <= 1; a++) {
            const ang = baseAngle + a * 0.26;
            bullets.push({ x: this.x, y: this.y, vx: Math.cos(ang) * 100, vy: Math.sin(ang) * 100, w: 6, h: 6, dmg: 1.5, life: 2.5, color: '#ff5252' });
          }
        } else {
          bullets.push({ x: this.x, y: this.y, vx: dir.x * 120, vy: dir.y * 120, w: 6, h: 6, dmg: 1, life: 3, color: '#ef5350' });
        }
      }
    } else if (this.isBoss) {
      this.updateBoss(dt, player, bullets);
    } else if (this.type === 'ghost') {
      this.updateGhost(dt, player);
    } else {
      this.moveToward(player, dt);
    }
  }
  updateBoss(dt, player, bullets) {
    if (this.hp <= this.maxHp / 2 && this.phase === 1) { this.phase = 2; this.sprayTimer = 0; }
    if (this.hp <= this.maxHp * 0.25 && this.phase < 3) { this.phase = 3; this.spiralAngle = 0; }
    if (this.phase === 1) {
      this.moveToward(player, dt);
    } else if (this.phase === 2) {
      this.chargeTimer -= dt;
      if (this.chargeTimer <= 0 && !this.charging) {
        this.charging = true; this.chargeTimer = 1.5;
        this.chargeDir = new V(player.x - this.x, player.y - this.y).norm();
      }
      if (this.charging) {
        this.x += this.chargeDir.x * this.speed * 3 * dt;
        this.y += this.chargeDir.y * this.speed * 3 * dt;
        this.chargeTimer -= dt;
        if (this.chargeTimer <= 0) { this.charging = false; this.chargeTimer = 2; }
      } else {
        this.moveToward(player, dt * 0.5);
      }
      this.sprayTimer -= dt;
      if (this.sprayTimer <= 0) {
        this.sprayTimer = 3;
        for (let i = 0; i < 8; i++) {
          const a = Math.PI * 2 / 8 * i;
          bullets.push({ x: this.x, y: this.y, vx: Math.cos(a) * 100, vy: Math.sin(a) * 100, w: 8, h: 8, dmg: 1, life: 2, color: '#ff5252' });
        }
      }
    } else if (this.phase === 3) {
      this.moveToward(player, dt * 1.5);
      this.sprayTimer -= dt;
      if (this.sprayTimer <= 0) {
        this.sprayTimer = 2;
        for (let i = 0; i < 16; i++) {
          const a = this.spiralAngle + Math.PI * 2 / 16 * i;
          bullets.push({ x: this.x, y: this.y, vx: Math.cos(a) * 80, vy: Math.sin(a) * 80, w: 8, h: 8, dmg: 1, life: 3, color: '#ff1744' });
        }
        this.spiralAngle += dt * 1.5;
      }
    }
  }
  moveToward(target, dt) {
    const dx = target.x - this.x, dy = target.y - this.y;
    const l = Math.hypot(dx, dy);
    const spd = this.speed * (this._slow ? 1 - this._slow : 1);
    if (l > 1) { this.x += dx / l * spd * dt; this.y += dy / l * spd * dt; }
  }
  updateGhost(dt, player) {
    this.phShiftTimer -= dt;
    if (this.phShiftTimer <= 0) {
      this.phShiftActive = !this.phShiftActive;
      this.phShiftTimer = this.phShiftActive ? 1 : 2;
    }
    if (this.teleport && this.hp === 1 && !this.hasTeleported) {
      this.hasTeleported = true;
      const away = Math.atan2(this.y - player.y, this.x - player.x);
      const offset = (Math.random() - 0.5) * Math.PI / 3;
      const d = rand(80, 120);
      this.x = player.x - Math.cos(away + offset) * d;
      this.y = player.y - Math.sin(away + offset) * d;
      this.x = clamp(this.x, 10, CFG.MAP_W - 10);
      this.y = clamp(this.y, 10, CFG.MAP_H - 10);
      this.teleportCD = 0.5;
    }
    if (this.teleportCD > 0) this.teleportCD -= dt;
    this.moveToward(player, dt);
  }
  hurt(dmg, isCrit) {
    if (this.type === 'ghost') {
      if (this.teleportCD > 0) return;
      if (this.phShiftActive) dmg = Math.max(0, Math.floor(dmg * 0.5));
    }
    if (isCrit) dmg *= 2;
    this.hp -= dmg;
    this._lastCrit = !!isCrit;
    if (isCrit) {
      // Crit float text handled by game layer via callback
      if (this._onCritText) this._onCritText(this.x, this.y - 10, dmg);
    }
  }
  moveAway(target, dt) {
    const dx = this.x - target.x, dy = this.y - target.y;
    const l = Math.hypot(dx, dy);
    const spd = this.speed * (this._slow ? 1 - this._slow : 1);
    if (l > 1) { this.x += dx / l * spd * dt; this.y += dy / l * spd * dt; }
  }
  draw(ctx, cam, canvas) {
    const s = cam.w2s(this.x, this.y, canvas);
    const x = s.x - this.w / 2, y = s.y - this.h / 2;
    if (this.type === 'zombie') {
      ctx.fillStyle = '#4caf50'; ctx.fillRect(x, y, this.w, this.h);
      ctx.fillStyle = '#2e7d32'; ctx.fillRect(x + 2, y + 2, 4, 4); ctx.fillRect(x + 10, y + 2, 4, 4);
      ctx.fillStyle = '#1b5e20'; ctx.fillRect(x + 4, y + 8, 8, 4);
      ctx.fillStyle = '#000'; ctx.fillRect(x + 4, y + 4, 2, 2); ctx.fillRect(x + 10, y + 4, 2, 2);
    } else if (this.type === 'bat') {
      ctx.fillStyle = '#ab47bc'; ctx.fillRect(x, y, this.w, this.h);
      ctx.fillStyle = '#7b1fa2';
      ctx.fillRect(x - 4, y + 2, 5, 5); ctx.fillRect(x + this.w - 1, y + 2, 5, 5);
      ctx.fillStyle = '#9c27b0';
      ctx.fillRect(x - 3, y + 3, 3, 3); ctx.fillRect(x + this.w, y + 3, 3, 3);
      ctx.fillStyle = '#ffeb3b'; ctx.fillRect(x + 2, y + 3, 3, 3); ctx.fillRect(x + 9, y + 3, 3, 3);
      ctx.fillStyle = '#000'; ctx.fillRect(x + 3, y + 4, 1, 1); ctx.fillRect(x + 10, y + 4, 1, 1);
    } else if (this.type === 'skeleton') {
      ctx.fillStyle = '#e0e0e0'; ctx.fillRect(x + 3, y, this.w - 6, this.h);
      ctx.fillStyle = '#bdbdbd'; ctx.fillRect(x + 1, y + 2, 4, 10); ctx.fillRect(x + 9, y + 2, 4, 10);
      ctx.fillStyle = '#212121'; ctx.fillRect(x + 4, y + 2, 2, 3); ctx.fillRect(x + 8, y + 2, 2, 3);
      ctx.fillStyle = '#4e342e'; ctx.fillRect(x + 12, y + 4, 3, 8);
    } else if (this.type === 'elite_skeleton') {
      ctx.fillStyle = '#b71c1c'; ctx.fillRect(x + 4, y, this.w - 8, this.h);
      ctx.fillStyle = '#880e4f'; ctx.fillRect(x + 2, y + 2, 4, 12); ctx.fillRect(x + 12, y + 2, 4, 12);
      ctx.fillStyle = '#ff1744'; ctx.fillRect(x + 5, y + 3, 3, 3); ctx.fillRect(x + 10, y + 3, 3, 3);
      ctx.fillStyle = '#000'; ctx.fillRect(x + 6, y + 4, 1, 1); ctx.fillRect(x + 11, y + 4, 1, 1);
      ctx.fillStyle = '#5d4037'; ctx.fillRect(x + 14, y + 3, 4, 10);
      ctx.fillStyle = '#ffd54f'; ctx.fillRect(x + 5, y - 3, 3, 3); ctx.fillRect(x + 10, y - 3, 3, 3); ctx.fillRect(x + 7, y - 4, 4, 2);
    } else if (this.type === 'ghost') {
      let alpha = 1;
      if (this.phShiftActive) {
        alpha = 0.2 + Math.sin(Date.now() * 0.02) * 0.15;
      }
      ctx.globalAlpha = alpha;
      ctx.fillStyle = '#b0bec5'; ctx.fillRect(x, y, this.w, this.h);
      ctx.fillStyle = '#eceff1'; ctx.fillRect(x + 2, y + 2, this.w - 4, this.h - 4);
      ctx.fillStyle = '#263238'; ctx.fillRect(x + 2, y + 3, 3, 3); ctx.fillRect(x + 7, y + 3, 3, 3);
      ctx.fillStyle = '#546e7a'; ctx.fillRect(x + 3, y + 8, 2, 2); ctx.fillRect(x + 7, y + 8, 2, 2);
      ctx.fillStyle = '#90a4ae';
      ctx.fillRect(x + 1, y + this.h, 3, 3); ctx.fillRect(x + 8, y + this.h, 3, 3);
      ctx.globalAlpha = 1;
    } else if (this.type === 'boss') {
      let bodyColor, innerColor, wingColor, eyeColor, hornColor;
      if (this.phase === 3) {
        const pulse = Math.sin(Date.now() * 0.008) * 0.3 + 0.7;
        bodyColor = `rgba(136,14,79,${pulse})`; innerColor = '#880e4f';
        wingColor = '#ad1457'; eyeColor = '#ff1744'; hornColor = '#d50000';
      } else if (this.phase === 2) {
        bodyColor = '#e65100'; innerColor = '#bf360c';
        wingColor = '#d84315'; eyeColor = '#ff6d00'; hornColor = '#ff3d00';
      } else {
        bodyColor = '#d32f2f'; innerColor = '#b71c1c';
        wingColor = '#c62828'; eyeColor = '#ffeb3b'; hornColor = '#ff6f00';
      }
      ctx.fillStyle = bodyColor; ctx.fillRect(x, y, this.w, this.h);
      ctx.fillStyle = innerColor; ctx.fillRect(x + 2, y + 2, 28, 28);
      ctx.fillStyle = hornColor; ctx.fillRect(x + 2, y - 6, 4, 8); ctx.fillRect(x + 26, y - 6, 4, 8);
      ctx.fillStyle = wingColor; ctx.fillRect(x - 8, y + 6, 10, 16); ctx.fillRect(x + 30, y + 6, 10, 16);
      ctx.fillStyle = eyeColor; ctx.fillRect(x + 8, y + 8, 5, 5); ctx.fillRect(x + 19, y + 8, 5, 5);
      ctx.fillStyle = '#000'; ctx.fillRect(x + 10, y + 10, 2, 2); ctx.fillRect(x + 21, y + 10, 2, 2);
      ctx.fillStyle = '#fff'; ctx.fillRect(x + 8, y + 20, 16, 4);
      if (this.phase === 3) {
        ctx.fillStyle = '#ff6d00'; ctx.fillRect(x + 9, y + 24, 3, 3); ctx.fillRect(x + 15, y + 24, 3, 3); ctx.fillRect(x + 21, y + 24, 3, 3);
      }
      ctx.fillStyle = '#000'; ctx.fillRect(x + 10, y + 20, 2, 4); ctx.fillRect(x + 14, y + 20, 2, 4); ctx.fillRect(x + 18, y + 20, 2, 4); ctx.fillRect(x + 22, y + 20, 2, 4);
      ctx.fillStyle = '#333'; ctx.fillRect(x, y - 12, this.w, 6);
      ctx.fillStyle = '#f44336'; ctx.fillRect(x, y - 12, this.w * (this.hp / this.maxHp), 6);
      ctx.fillStyle = '#fff'; ctx.font = 'bold 8px monospace'; ctx.textAlign = 'center';
      ctx.fillText(`HP:${Math.ceil(this.hp / this.maxHp * 100)}%`, x + this.w / 2, y - 14);
    }
    if (!this.isBoss && this.hp < this.maxHp) {
      const bw = this.w;
      ctx.fillStyle = '#333'; ctx.fillRect(x, y - 5, bw, 3);
      ctx.fillStyle = this.color; ctx.fillRect(x, y - 5, bw * (this.hp / this.maxHp), 3);
    }
  }
}
