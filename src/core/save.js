// ===== Save System =====
import { CFG } from './config.js';

export const Save = {
  _default() {
    return {
      version: CFG.SAVE.version,
      bestScore: 0, bestTime: 0, totalKills: 0, gamesPlayed: 0, bestCombo: 0,
      completedQuests: [],
      completedAchievements: [],
      achievedFlags: [],
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
      if (!d.completedQuests) d.completedQuests = [];
      if (!d.completedAchievements) d.completedAchievements = [];
      if (!d.achievedFlags) d.achievedFlags = [];
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
  },
  // --- Achievement System ---
  achieveFlag(flagId) {
    const d = this.load();
    if (!d.achievedFlags) d.achievedFlags = [];
    if (!d.achievedFlags.includes(flagId)) {
      d.achievedFlags.push(flagId);
      this.save(d);
    }
  },
  checkAchievements(gameStats) {
    const d = this.load();
    if (!d.completedAchievements) d.completedAchievements = [];
    if (!d.achievedFlags) d.achievedFlags = [];

    const newlyCompleted = [];

    // First: check hidden sub-achievements (for multi-type parents)
    for (const [id, ach] of Object.entries(CFG.ACHIEVEMENTS)) {
      if (!ach.hidden) continue;
      if (d.completedAchievements.includes(id)) continue;
      if (ach.check && ach.check(gameStats)) {
        d.completedAchievements.push(id);
      }
    }

    // Then: check visible achievements
    for (const [id, ach] of Object.entries(CFG.ACHIEVEMENTS)) {
      if (ach.hidden) continue;
      if (d.completedAchievements.includes(id)) continue;

      let completed = false;

      if (ach.type === 'milestone') {
        const current = d[ach.check.stat] || 0;
        completed = current >= ach.check.target;
      } else if (ach.type === 'condition') {
        completed = ach.check(gameStats);
      } else if (ach.type === 'multi') {
        completed = ach.parts.every(partId => {
          return d.completedAchievements.includes(partId);
        });
      } else if (ach.type === 'flag') {
        completed = d.achievedFlags.includes(id);
      }

      if (completed) {
        d.completedAchievements.push(id);
        newlyCompleted.push(id);
      }
    }

    // Award soul fragments for newly completed achievements
    let rewardTotal = 0;
    for (const aid of newlyCompleted) {
      const ach = CFG.ACHIEVEMENTS[aid];
      if (ach && ach.reward) {
        rewardTotal += ach.reward;
      }
    }
    if (rewardTotal > 0) {
      d.soulFragments = (d.soulFragments || 0) + rewardTotal;
    }

    this.save(d);
    return { newlyCompleted, rewardTotal };
  },
  getAchievementProgress(id) {
    const d = this.load();
    const ach = CFG.ACHIEVEMENTS[id];
    if (!ach) return { current: 0, target: 1, done: false };

    if (d.completedAchievements && d.completedAchievements.includes(id)) {
      return { current: ach.type === 'multi' ? ach.parts.length : 1,
               target: ach.type === 'multi' ? ach.parts.length : 1, done: true };
    }

    if (ach.type === 'milestone') {
      const current = d[ach.check.stat] || 0;
      return { current: Math.min(current, ach.check.target), target: ach.check.target, done: false };
    }
    if (ach.type === 'multi') {
      let doneCount = 0;
      for (const partId of ach.parts) {
        if (d.completedAchievements && d.completedAchievements.includes(partId)) doneCount++;
      }
      return { current: doneCount, target: ach.parts.length, done: false };
    }
    return { current: 0, target: 1, done: false };
  }
};
