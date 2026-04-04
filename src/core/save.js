// ===== Save System =====
import { CFG } from './config.js';

export const Save = {
  _default() {
    return {
      version: CFG.SAVE.version,
      bestScore: 0, bestTime: 0, totalKills: 0, gamesPlayed: 0, bestCombo: 0,
      completedQuests: [],
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
  }
};
