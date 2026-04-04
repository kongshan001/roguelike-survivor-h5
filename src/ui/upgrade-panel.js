// ===== Upgrade Panel =====
export { generateUpgrades } from './upgrade-generate.js';

export function showUpgrade(choices, game) {
  const panel = document.getElementById('upgrade-panel');
  const cards = document.getElementById('upg-cards');
  cards.innerHTML = '';
  for (const c of choices) {
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
      panel.style.display = 'none';
      game.paused = false;
    };
    cards.appendChild(card);
  }
  panel.style.display = 'flex';
  game.paused = true;
}
