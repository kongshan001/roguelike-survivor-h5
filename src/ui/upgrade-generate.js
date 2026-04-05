// ===== Upgrade Generation =====
import { CFG } from '../core/config.js';
import { randInt } from '../core/math.js';
import { WEAPON_CLASSES } from '../weapons/registry.js';
import { Save } from '../core/save.js';

export function generateUpgrades(player) {
  const pool = [];
  // New weapons
  const owned = new Set(player.weapons.map(w => w.name));
  for (const name of ['holywater', 'knife', 'lightning', 'bible', 'firestaff', 'frostaura', 'boomerang']) {
    if (!owned.has(name)) {
      const wc = CFG.WEAPONS[name];
      pool.push({ type: 'weapon', icon: wc.icon, name: wc.name, desc: wc.desc,
        badge: '新武器', badgeColor: '#4fc3f7',
        apply: () => { player.weapons.push(new WEAPON_CLASSES[name](player)); } });
    }
  }
  // Weapon upgrades
  for (const w of player.weapons) {
    if (w.level < w.maxLevel) {
      const wc = CFG.WEAPONS[w.name];
      pool.push({ type: 'upgrade', icon: wc.icon, name: `${wc.name} Lv.${w.level + 1}`,
        desc: '伤害/效果提升',
        badge: '升级', badgeColor: '#ffd54f',
        apply: () => { w.level++; } });
    }
  }
  // Passives
  for (const [key, pc] of Object.entries(CFG.PASSIVES)) {
    const stacks = player.passives[key] || 0;
    if (stacks < pc.maxStack) {
      pool.push({ type: 'passive', icon: pc.icon, name: pc.name, desc: pc.desc,
        badge: '被动', badgeColor: '#66bb6a',
        apply: () => {
          player.passives[key] = (player.passives[key] || 0) + 1;
          if (key === 'speedboots') player.speed *= 1.15;
          if (key === 'armor') player.armor += 1;
          if (key === 'magnet') player.expBonus = (player.expBonus || 0) + 0.3;
          if (key === 'crit') player.critChance = (player.critChance || 0) + 0.08;
          if (key === 'maxhp') { player.maxHp += 2; player.hp = Math.min(player.hp + 2, player.maxHp); }
          if (key === 'regen') { player._regenTimer = [5, 4, 3][(player.passives[key] || 1) - 1] || 3; }
          if (key === 'luckycoin') { player.critDmgBonus += CFG.PASSIVES.luckycoin.critDmgBonus; player.goldDropBonus += CFG.PASSIVES.luckycoin.goldDropBonus; }
        } });
    }
  }
  // Evolutions
  for (const evo of CFG.EVOLUTIONS) {
    const wA = player.weapons.find(w => w.name === evo.a && w.level >= w.maxLevel);
    const wB = player.weapons.find(w => w.name === evo.b && w.level >= w.maxLevel);
    if (wA && wB) {
      pool.push({ type: 'evolution', icon: evo.icon, name: evo.name, desc: evo.desc,
        badge: '进化', badgeColor: '#ff9100',
        apply: () => {
          player.weapons = player.weapons.filter(w => w !== wA && w !== wB);
          player.weapons.push(new WEAPON_CLASSES[evo.result](player));
          Save.achieveFlag('evolve_weapon');
          if (window.game) {
            if (!window.game.evolutions) window.game.evolutions = [];
            window.game.evolutions.push(evo.result);
          }
        } });
    }
  }
  // Shuffle and pick 3
  for (let i = pool.length - 1; i > 0; i--) {
    const j = randInt(0, i);
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, 3);
}
