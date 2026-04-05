// ===== Shop Panel UI =====
import { CFG } from '../core/config.js';
import { Save } from '../core/save.js';

export function showShopPanel() {
  const d = Save.load();
  const sf = d.soulFragments || 0;
  const su = d.shopUpgrades || {};
  const list = document.getElementById('shop-list');
  list.innerHTML = '';

  for (const [key, u] of Object.entries(CFG.SHOP.upgrades)) {
    const level = su[key] || 0;
    const maxed = level >= u.maxLevel;
    const cost = maxed ? 0 : u.costs[level];
    const canBuy = !maxed && sf >= cost;
    const card = document.createElement('div');
    card.style.cssText = `padding:10px 14px;border-radius:8px;font-family:monospace;display:flex;align-items:center;gap:10px;${maxed ? 'background:rgba(102,187,106,0.15);border:1px solid rgba(102,187,106,0.4)' : canBuy ? 'background:rgba(79,195,247,0.15);border:1px solid rgba(79,195,247,0.4);cursor:pointer' : 'background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.15);opacity:0.7'}`;

    let effectText = '';
    const eff = u.effects[level > 0 ? level - 1 : 0];
    if (eff) {
      if (eff.hp) effectText = `HP+${eff.hp}`;
      else if (eff.speedMul) effectText = `speed x${eff.speedMul}`;
      else if (eff.range) effectText = `range+${eff.range}px`;
      else if (eff.mul) effectText = `x${eff.mul}`;
    }

    card.innerHTML = `
      <span style="font-size:24px">${u.icon}</span>
      <div style="flex:1">
        <div style="font-size:13px;font-weight:bold;color:${maxed ? '#66bb6a' : '#ccc'}">${u.name} ${maxed ? 'MAX' : 'Lv.' + level + '/' + u.maxLevel}</div>
        <div style="font-size:11px;color:#999;margin-top:2px">${effectText}</div>
      </div>
      <div style="font-size:12px;color:${maxed ? '#66bb6a' : canBuy ? '#ffd54f' : '#666'}">${maxed ? 'Done' : cost + ' SF'}</div>`;

    if (canBuy) {
      card.onclick = () => {
        if (Save.buyShopUpgrade(key)) {
          // Achievement: shop_first
          Save.achieveFlag('shop_first');
          // Achievement: shop_max_one — any upgrade reaches max level
          const d = Save.load();
          const su = d.shopUpgrades || {};
          const u = CFG.SHOP.upgrades[key];
          if (su[key] >= u.maxLevel) {
            Save.achieveFlag('shop_max_one');
          }
          // Achievement: shop_max_all — all 6 upgrades at max level
          const allMaxed = Object.entries(CFG.SHOP.upgrades).every(([k, v]) => (su[k] || 0) >= v.maxLevel);
          if (allMaxed) {
            Save.achieveFlag('shop_max_all');
          }
          showShopPanel();
        }
      };
    }
    list.appendChild(card);
  }

  document.getElementById('shop-sf').textContent = sf;
  document.getElementById('shop-panel').style.display = 'flex';
}

export function hideShopPanel() {
  document.getElementById('shop-panel').style.display = 'none';
}
