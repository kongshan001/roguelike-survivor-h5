// ===== Skill Display Panel =====
import { CFG } from '../core/config.js';

let _visible = false;

export function toggleSkillPanel() {
  _visible = !_visible;
  const panel = document.getElementById('skill-panel');
  panel.style.display = _visible ? 'flex' : 'none';
  if (_visible) updateSkillPanel();
}

export function hideSkillPanel() {
  _visible = false;
  document.getElementById('skill-panel').style.display = 'none';
}

export function showSkillToggle() {
  document.getElementById('skill-toggle').style.display = 'flex';
}

export function hideSkillToggle() {
  document.getElementById('skill-toggle').style.display = 'none';
  hideSkillPanel();
}

export function updateSkillPanel() {
  const panel = document.getElementById('skill-panel');
  if (!panel || !_visible) return;
  const g = window.game;
  if (!g) return;
  const p = g.player;

  let html = '';

  // Weapons section
  if (p.weapons.length > 0) {
    html += '<div class="sk-section"><div class="sk-title">武器</div>';
    for (const w of p.weapons) {
      const wc = CFG.WEAPONS[w.name];
      if (!wc) continue;
      const isEvolved = wc.evolved;
      const maxLvl = w.maxLevel;
      const lvlColor = isEvolved ? '#ff9100' : (w.level >= maxLvl ? '#66bb6a' : '#4fc3f7');
      const lvlText = isEvolved ? 'MAX' : `Lv.${w.level}/${maxLvl}`;
      const detail = getWeaponDetail(w);
      html += `<div class="sk-row">
        <span class="sk-icon">${wc.icon}</span>
        <div class="sk-info">
          <div class="sk-name">${wc.name}</div>
          <div class="sk-detail">${detail}</div>
        </div>
        <span class="sk-lvl" style="color:${lvlColor}">${lvlText}</span>
      </div>`;
    }
    html += '</div>';
  }

  // Passives section
  const passiveKeys = Object.keys(p.passives).filter(k => (p.passives[k] || 0) > 0);
  if (passiveKeys.length > 0) {
    html += '<div class="sk-section"><div class="sk-title">被动</div>';
    for (const key of passiveKeys) {
      const stacks = p.passives[key];
      const pc = CFG.PASSIVES[key];
      if (!pc) continue;
      const detail = getPassiveDetail(key, stacks);
      const maxed = stacks >= pc.maxStack;
      const lvlColor = maxed ? '#66bb6a' : '#aaa';
      html += `<div class="sk-row">
        <span class="sk-icon">${pc.icon}</span>
        <div class="sk-info">
          <div class="sk-name">${pc.name}</div>
          <div class="sk-detail">${detail}</div>
        </div>
        <span class="sk-lvl" style="color:${lvlColor}">x${stacks}</span>
      </div>`;
    }
    html += '</div>';
  }

  // Class passive
  const ch = CFG.CHARACTERS[p.charId];
  if (ch && ch.classPassive) {
    html += '<div class="sk-section"><div class="sk-title">职业</div>';
    html += `<div class="sk-row">
      <span class="sk-icon">${ch.classPassive.icon}</span>
      <div class="sk-info">
        <div class="sk-name">${ch.classPassive.name}</div>
        <div class="sk-detail">${ch.classPassive.desc}</div>
      </div>
      <span class="sk-lvl" style="color:#7c4dff">固有</span>
    </div>`;
    html += '</div>';
  }

  // Synergies
  if (p.activeSynergies && p.activeSynergies.size > 0) {
    html += '<div class="sk-section"><div class="sk-title">协同</div>';
    for (const id of p.activeSynergies) {
      const syn = CFG.SYNERGIES[id];
      if (!syn) continue;
      html += `<div class="sk-row">
        <span class="sk-icon">${syn.icon}</span>
        <div class="sk-info">
          <div class="sk-name">${syn.name}</div>
          <div class="sk-detail">${syn.desc}</div>
        </div>
      </div>`;
    }
    html += '</div>';
  }

  if (!html) html = '<div style="color:#555;text-align:center;padding:8px">暂无技能</div>';

  panel.innerHTML = html;
}

function getWeaponDetail(w) {
  const name = w.name;
  try {
    if (name === 'holywater') {
      return `${w.count}球 r${w.level >= 3 ? 60 : w.radius} 伤害${w.dmg}`;
    }
    if (name === 'knife') return `${w.count}刀 穿透${w.pierce} 伤害${w.dmg}`;
    if (name === 'lightning') return `伤害${w.dmg} ${w.bolts}链${w.chains}连`;
    if (name === 'bible') return `r${w.radius} 伤害${w.dmg} 速度${w.speed}`;
    if (name === 'firestaff') return `伤害${w.dps} 燃烧${w.burnDps || 0}`;
    if (name === 'frostaura') return `r${w.radius} 减速${Math.round(w.slow * 100)}% 伤害${w.dps}`;
    if (name === 'boomerang') {
      const d = w.getLevelData();
      return `${d.count}镖 伤害${d.dmg} 穿透${d.pierce}`;
    }
    // Evolved
    if (name === 'blizzard') return `r${w.radius} 伤害${w.dps} 冰冻${Math.round(w.freezeChance * 100)}%`;
    if (name === 'thunderholywater') return `${w.count}球 闪电${w.lightningDmg}`;
    if (name === 'fireknife') return `${w.count}刀 穿透${w.pierce} 燃烧${w.burnDps}`;
    if (name === 'holydomain') return `${w.orbCount}球 r${w.radius} 脉冲${w.pulseDmg}`;
    if (name === 'frostknife') return `${w.count}刀 穿透${w.pierce} 减速${Math.round(w.slowAmount * 100)}%`;
    if (name === 'flamebible') return `r${w.radius} 伤害${w.dps} 燃烧${w.burnDps}`;
    if (name === 'thunderang') return `${CFG.BOOMERANG.thunderang.count}镖 闪电链`;
    if (name === 'blazerang') return `${CFG.BOOMERANG.blazerang.count}镖 火焰轨迹`;
  } catch (e) { /* fallback */ }
  return '';
}

function getPassiveDetail(key, stacks) {
  if (key === 'speedboots') return `移速+${stacks * 15}%`;
  if (key === 'armor') return `受伤-${stacks}`;
  if (key === 'magnet') return `经验+${stacks * 30}%`;
  if (key === 'crit') return `暴击+${stacks * 8}%`;
  if (key === 'maxhp') return `HP+${stacks * 2}`;
  if (key === 'regen') {
    const intervals = [5, 4, 3];
    const interval = intervals[Math.min(stacks - 1, 2)];
    return `每${interval}秒+1HP`;
  }
  if (key === 'luckycoin') return `暴伤+${stacks * 50}% 金币+${stacks * 15}%`;
  return CFG.PASSIVES[key]?.desc || '';
}

// Expose to global for onclick
window.toggleSkillPanel = toggleSkillPanel;
