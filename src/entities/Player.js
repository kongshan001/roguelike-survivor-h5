// ===== Player Entity =====
import { CFG } from '../core/config.js';
import { V, rand, clamp, dist } from '../core/math.js';

export class Player {
  constructor(charId = 'mage') {
    const ch = CFG.CHARACTERS[charId];
    this.x = CFG.MAP_W / 2;
    this.y = CFG.MAP_H / 2;
    this.w = CFG.PLAYER_SIZE;
    this.h = CFG.PLAYER_SIZE;
    this.hp = ch.hp;
    this.maxHp = ch.hp;
    this.speed = ch.speed;
    this.level = 1;
    this.exp = 0;
    this.pickupRange = CFG.PICKUP_RANGE;
    this.armor = 0;
    this.invTimer = 0;
    this.kills = 0;
    this.gold = 0;
    this.weapons = [];
    this.passives = {};
    this.expBonus = ch.expBonus || 0;
    this.critChance = 0;
    this._regenTimer = 0;
    this.facingAngle = 0;
    this._speedBoost = 0;
    this._speedBoostTimer = 0;
    this.charId = charId;

    // Combo system
    this._combo = 0;
    this._comboTimer = 0;
    this._bestCombo = 0;

    // Dash system
    this._dashCD = 0;
    this._dashing = false;
    this._dashTimer = 0;
    this._dashDir = { x: 0, y: 0 };
    this._afterimages = [];

    // Synergy system
    this.activeSynergies = new Set();
    this._isMoving = false;

    // Quest tracking
    this._damageTaken = 0;

    // External callbacks (set by game layer)
    this.onSFX = null;        // (id) => void
    this.onScreenShake = null; // (type) => void
    this.onCritCheck = null;   // () => bool
    this.getDifficulty = null; // () => string
    this.getExpMul = null;     // () => number
  }

  // ----- Combo -----
  get combo() { return this._combo; }
  get comboTimer() { return this._comboTimer; }
  get bestCombo() { return this._bestCombo; }

  incrementCombo() {
    this._combo++;
    this._comboTimer = CFG.COMBO.timeout;
    if (this._combo > this._bestCombo) this._bestCombo = this._combo;
    return this._combo;
  }

  comboGold() {
    return this._combo >= CFG.COMBO.goldThreshold ? 1 : 0;
  }

  comboExpBonus() {
    return 1 + Math.min(this._combo * CFG.COMBO.expBonusRate, CFG.COMBO.maxBonus);
  }

  // ----- Update -----
  update(dt, input) {
    // Speed boost decay
    if (this._speedBoostTimer > 0) {
      this._speedBoostTimer -= dt;
      if (this._speedBoostTimer <= 0) this._speedBoost = 0;
    }

    // Dash cooldown tick
    if (this._dashCD > 0) this._dashCD -= dt;

    // Afterimage fade
    for (let i = this._afterimages.length - 1; i >= 0; i--) {
      this._afterimages[i].alpha -= dt * 4;
      if (this._afterimages[i].alpha <= 0) this._afterimages.splice(i, 1);
    }

    // Dashing movement
    if (this._dashing) {
      this._dashTimer -= dt;
      const dashSpd = this.speed * CFG.DASH.speedMult;
      this.x += this._dashDir.x * dashSpd * dt;
      this.y += this._dashDir.y * dashSpd * dt;
      if (this._afterimages.length < CFG.DASH.afterimages) {
        this._afterimages.push({ x: this.x, y: this.y, alpha: 0.6 });
      }
      if (this._dashTimer <= 0) {
        this._dashing = false;
        this._dashCD = CFG.DASH.cooldown;
      }
      this._clampToMap();
      if (this.invTimer > 0) this.invTimer -= dt;
      return;
    }

    // Normal movement
    const spd = this.speed * (1 + this._speedBoost);
    this._isMoving = !!(input.x || input.y);
    if (this._isMoving) {
      this.x += input.x * spd * dt;
      this.y += input.y * spd * dt;
      this.facingAngle = Math.atan2(input.y, input.x);
    }
    this._clampToMap();

    // Invincibility timer
    if (this.invTimer > 0) this.invTimer -= dt;

    // Regen passive
    if (this._regenTimer > 0) {
      this._regenTimer -= dt;
      // Synergy: boots_regen — moving doubles regen speed
      let regenSpeedMul = 1;
      if (this.activeSynergies.has('boots_regen') && this._isMoving) regenSpeedMul = CFG.SYNERGIES.boots_regen.movingRegenSpeedMul;
      if (this._regenTimer <= 0 && this.hp < this.maxHp) {
        this.hp = Math.min(this.hp + 1, this.maxHp);
        const stacks = this.passives.regen || 0;
        this._regenTimer = ([5, 4, 3][stacks - 1] || 3) / regenSpeedMul;
      }
    }

    // Combo timer decay
    if (this._comboTimer > 0) {
      this._comboTimer -= dt;
      if (this._comboTimer <= 0) this._combo = 0;
    }
  }

  // ----- Dash -----
  dash() {
    if (this._dashing || this._dashCD > 0) return false;
    this._dashing = true;
    this._dashTimer = CFG.DASH.duration;
    this.invTimer = CFG.DASH.duration;
    this._dashDir = {
      x: Math.cos(this.facingAngle),
      y: Math.sin(this.facingAngle)
    };
    this._afterimages = [];
    this._playSFX('dash');
    return true;
  }

  // ----- Damage -----
  takeDamage(d) {
    if (this.invTimer > 0 || this._dashing) return false;
    const diffKey = this.getDifficulty ? this.getDifficulty() : 'normal';
    const dMul = CFG.DIFFICULTY[diffKey].enemyDmgMul;
    let armorVal = this.armor;
    // Synergy: armor_maxhp — armor effect doubled
    if (this.activeSynergies.has('armor_maxhp')) armorVal *= 2;
    // Synergy: armor_regen — low HP temp armor bonus
    if (this.activeSynergies.has('armor_regen') && this.hp / this.maxHp <= CFG.SYNERGIES.armor_regen.lowHpThreshold) {
      armorVal += CFG.SYNERGIES.armor_regen.tempArmorBonus;
    }
    const realDmg = Math.max(1, Math.ceil(d * dMul) - armorVal);
    this.hp -= realDmg;
    this._damageTaken++;
    this.invTimer = CFG.INVINCIBLE_TIME;
    this._shakeScreen('hurt');
    this._playSFX('hit');
    return true;
  }

  // ----- Experience -----
  addExp(amount) {
    const expMul = this.getExpMul ? this.getExpMul() : 1;
    const bonus = 1 + (this.expBonus || 0);
    this.exp += Math.ceil(amount * bonus * expMul);
    while (this.level < CFG.EXP_TABLE.length && this.exp >= CFG.EXP_TABLE[this.level]) {
      this.exp -= CFG.EXP_TABLE[this.level];
      this.level++;
      return true; // level up
    }
    return false;
  }

  // ----- Synergy System -----
  checkSynergies() {
    this.activeSynergies.clear();
    if (!CFG.SYNERGIES) return;
    for (const [id, syn] of Object.entries(CFG.SYNERGIES)) {
      const req = syn.req;
      if (req.passives) {
        // Passive+passive synergy
        if (req.passives.every(p => (this.passives[p] || 0) > 0)) {
          this.activeSynergies.add(id);
        }
      } else if (req.weapon && req.passive) {
        // Weapon+passive synergy
        const hasWeapon = this.weapons.some(w => w.name === req.weapon);
        const hasPassive = (this.passives[req.passive] || 0) > 0;
        if (hasWeapon && hasPassive) {
          this.activeSynergies.add(id);
        }
      }
    }
  }

  getWeaponBonus(weaponName) {
    const bonus = {};
    if (!CFG.SYNERGIES) return bonus;
    for (const id of this.activeSynergies) {
      const syn = CFG.SYNERGIES[id];
      if (syn.weaponBonus && syn.req.weapon === weaponName) {
        Object.assign(bonus, syn.weaponBonus);
      }
    }
    return bonus;
  }

  hasSynergy(id) {
    return this.activeSynergies.has(id);
  }

  // ----- Drawing -----
  draw(ctx, cam, canvas) {
    if (this.invTimer > 0 && Math.floor(this.invTimer * 10) % 2 === 0) return;
    const s = cam.w2s(this.x, this.y, canvas);
    const x = s.x - this.w / 2, y = s.y - this.h / 2;
    const c = this.charId || 'mage';

    if (c === 'mage') {
      this._drawMage(ctx, x, y);
    } else if (c === 'warrior') {
      this._drawWarrior(ctx, x, y);
    } else if (c === 'ranger') {
      this._drawRanger(ctx, x, y);
    }
  }

  _drawMage(ctx, x, y) {
    ctx.fillStyle = '#1a237e'; ctx.fillRect(x + 2, y - 6, 12, 6);
    ctx.fillRect(x + 4, y - 10, 8, 4); ctx.fillRect(x + 5, y - 12, 6, 2);
    ctx.fillStyle = '#1565c0'; ctx.fillRect(x + 2, y, 12, 10);
    ctx.fillRect(x + 1, y + 10, 14, 4);
    ctx.fillStyle = '#ffe0b2'; ctx.fillRect(x + 5, y + 1, 6, 4);
    ctx.fillStyle = '#000'; ctx.fillRect(x + 6, y + 2, 2, 2);
    ctx.fillRect(x + 9, y + 2, 2, 2);
    ctx.fillStyle = '#795548'; ctx.fillRect(x + 14, y - 2, 2, 16);
    ctx.fillStyle = '#ffd54f'; ctx.fillRect(x + 13, y - 4, 4, 3);
  }

  _drawWarrior(ctx, x, y) {
    ctx.fillStyle = '#b71c1c'; ctx.fillRect(x + 1, y - 8, 14, 8);
    ctx.fillRect(x + 3, y - 10, 10, 3);
    ctx.fillStyle = '#ffd54f'; ctx.fillRect(x + 4, y - 4, 8, 2);
    ctx.fillStyle = '#d32f2f'; ctx.fillRect(x + 1, y, 14, 10);
    ctx.fillRect(x, y + 10, 16, 4);
    ctx.fillStyle = '#5d4037'; ctx.fillRect(x + 2, y + 8, 12, 2);
    ctx.fillStyle = '#ffe0b2'; ctx.fillRect(x + 5, y + 1, 6, 4);
    ctx.fillStyle = '#000'; ctx.fillRect(x + 6, y + 2, 2, 2);
    ctx.fillRect(x + 9, y + 2, 2, 2);
    ctx.fillStyle = '#9e9e9e'; ctx.fillRect(x + 14, y - 4, 2, 14);
    ctx.fillStyle = '#5d4037'; ctx.fillRect(x + 13, y + 6, 4, 3);
    ctx.fillStyle = '#e0e0e0'; ctx.fillRect(x + 14, y - 6, 2, 3);
  }

  _drawRanger(ctx, x, y) {
    ctx.fillStyle = '#1b5e20'; ctx.fillRect(x + 2, y - 6, 12, 6);
    ctx.fillRect(x + 3, y - 8, 10, 3);
    ctx.fillStyle = '#2e7d32'; ctx.fillRect(x + 2, y, 12, 10);
    ctx.fillRect(x + 1, y + 10, 14, 4);
    ctx.fillStyle = '#ffe0b2'; ctx.fillRect(x + 5, y + 1, 6, 4);
    ctx.fillStyle = '#000'; ctx.fillRect(x + 6, y + 2, 2, 2);
    ctx.fillRect(x + 9, y + 2, 2, 2);
    ctx.fillStyle = '#795548'; ctx.fillRect(x + 14, y - 2, 2, 14);
    ctx.fillStyle = '#bdbdbd'; ctx.fillRect(x + 15, y - 2, 1, 14);
  }

  // ----- Helpers -----
  _clampToMap() {
    this.x = clamp(this.x, this.w / 2, CFG.MAP_W - this.w / 2);
    this.y = clamp(this.y, this.h / 2, CFG.MAP_H - this.h / 2);
  }

  _playSFX(id) {
    if (this.onSFX) this.onSFX(id);
  }

  _shakeScreen(type) {
    if (this.onScreenShake) this.onScreenShake(type);
  }
}
