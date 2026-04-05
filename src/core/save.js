// ===== Save System =====
import { CFG } from './config.js';

export const Save = {
  _default() {
    return {
      version: CFG.SAVE.version,
      bestScore: 0, bestTime: 0, totalKills: 0, gamesPlayed: 0, bestCombo: 0,
      completedQuests: [],
      soulFragments: 0,
      shopUpgrades: { maxhp: 0, speed: 0, pickup: 0, expbonus: 0, weaponDmg: 0, gold: 0 },
      characters: {
        mage: { bestScore: 0, bestTime: 0 },
        warrior: { bestScore: 0, bestTime: 0 },
        ranger: { bestScore: 0, bestTime: 0 }
      }
    };
  },
  load() {
    try {
      const raw = localStorage.getItem(CFG.SAVE.key);
      if (!raw) return this._default();
      const d = JSON.parse(raw);
      if (d.version !== CFG.SAVE.version) return this._default();
      // Migrate: ensure new fields exist on old saves
      if (d.soulFragments === undefined) d.soulFragments = 0;
      if (!d.shopUpgrades) d.shopUpgrades = { maxhp: 0, speed: 0, pickup: 0, expbonus: 0, weaponDmg: 0, gold: 0 };
      return d;
    } catch (e) { return this._default(); }
  },
  save(data) {
    try { localStorage.setItem(CFG.SAVE.key, JSON.stringify(data)); } catch (e) {}
  },
  record(kills, time, charId, bestCombo) {
    const d = this.load();
    d.gamesPlayed++;
    d.totalKills += kills;
    let newBest = false;
    if (kills > d.bestScore) { d.bestScore = kills; newBest = true; }
    if (bestCombo > d.bestCombo) d.bestCombo = bestCombo;
    if (time > d.bestTime) { d.bestTime = time; }
    if (charId && d.characters[charId]) {
      if (kills > d.characters[charId].bestScore) d.characters[charId].bestScore = kills;
      if (time > d.characters[charId].bestTime) d.characters[charId].bestTime = time;
    }
    this.save(d);
    return { data: d, newBest };
  },
  recordQuests(newQuestIds) {
    const d = this.load();
    if (!d.completedQuests) d.completedQuests = [];
    const firstTime = [];
    for (const id of newQuestIds) {
      if (!d.completedQuests.includes(id)) {
        d.completedQuests.push(id);
        firstTime.push(id);
      }
    }
    this.save(d);
    return { data: d, firstTime };
  },
  addSoulFragments(amount) {
    const d = this.load();
    d.soulFragments = (d.soulFragments || 0) + amount;
    this.save(d);
    return d.soulFragments;
  },
  buyShopUpgrade(key) {
    const d = this.load();
    const u = CFG.SHOP.upgrades[key];
    if (!u) return false;
    const level = d.shopUpgrades[key] || 0;
    if (level >= u.maxLevel) return false;
    const cost = u.costs[level];
    if ((d.soulFragments || 0) < cost) return false;
    d.soulFragments -= cost;
    d.shopUpgrades[key] = level + 1;
    this.save(d);
    return true;
  }
};
