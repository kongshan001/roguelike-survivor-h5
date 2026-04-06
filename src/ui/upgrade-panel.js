// ===== Upgrade Panel =====
import { generateUpgrades } from './upgrade-generate.js';
import { updateSkillPanel } from './skill-panel.js';
export { generateUpgrades };

export function showUpgrade(choices, game) {
  // Auto-upgrade: immediately pick first option
  if (window.autoUpgrade && choices.length > 0) {
    choices[0].apply();
    game.player.checkSynergies();
    updateSkillPanel();
    return;
  }

  const panel = document.getElementById('upgrade-panel');
  const cards = document.getElementById('upg-cards');
  let rerollUsed = false;

  function renderCards(pool) {
    cards.innerHTML = '';
    for (const c of pool) {
      const card = document.createElement('div');
      card.className = 'upg-card';
      const bgRgb = c.badgeColor === '#4fc3f7' ? '79,195,247'
        : c.badgeColor === '#ffd54f' ? '255,213,79'
          : c.badgeColor === '#ff9100' ? '255,145,0'
            : '102,187,106';
      card.style.background = `rgba(${bgRgb},0.15)`;
      card.style.border = `2px solid ${c.badgeColor}`;
      card.innerHTML = `<div class="icon">${c.icon}</div><div class="name" style="color:${c.badgeColor}">${c.name}</div><div class="desc">${c.desc}</div><div class="badge" style="background:${c.badgeColor};color:#1a1a2e">${c.badge}</div>`;
      card.onclick = () => {
        c.apply();
        game.player.checkSynergies();
        updateSkillPanel();
        panel.style.display = 'none';
        game.paused = false;
      };
      cards.appendChild(card);
    }
    // Reroll button
    const rerollBtn = document.createElement('button');
    rerollBtn.textContent = '🔄 换一批';
    rerollBtn.style.cssText = 'margin-top:10px;padding:8px 24px;border:1px solid rgba(255,255,255,0.3);border-radius:8px;background:rgba(255,255,255,0.08);color:#ccc;cursor:pointer;font-size:14px;';
    if (rerollUsed) rerollBtn.style.display = 'none';
    rerollBtn.onclick = () => {
      rerollUsed = true;
      const newPool = generateUpgrades(game.player);
      renderCards(newPool);
    };
    cards.appendChild(rerollBtn);
  }

  renderCards(choices);
  panel.style.display = 'flex';
  game.paused = true;
}
