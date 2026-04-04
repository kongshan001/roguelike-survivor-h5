// ===== Quest Panel UI =====
import { CFG } from '../core/config.js';
import { Save } from '../core/save.js';

export function showQuestPanel() {
  const d = Save.load();
  const completed = d.completedQuests || [];
  const list = document.getElementById('quest-list');
  list.innerHTML = '';
  for (const q of CFG.QUESTS) {
    const done = completed.includes(q.id);
    const card = document.createElement('div');
    card.style.cssText = `padding:10px 14px;border-radius:8px;font-family:monospace;display:flex;align-items:center;gap:10px;${done ? 'background:rgba(102,187,106,0.15);border:1px solid rgba(102,187,106,0.4)' : 'background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.15)'}`;
    card.innerHTML = `
      <span style="font-size:24px">${q.icon}</span>
      <div style="flex:1">
        <div style="font-size:13px;font-weight:bold;color:${done ? '#66bb6a' : '#ccc'}">${q.name} ${done ? '✅' : ''}</div>
        <div style="font-size:11px;color:#999;margin-top:2px">${q.desc}</div>
      </div>
      <div style="font-size:11px;color:#ffd54f">${q.reward}💰</div>`;
    list.appendChild(card);
  }
  document.getElementById('quest-panel').style.display = 'flex';
}

export function hideQuestPanel() {
  document.getElementById('quest-panel').style.display = 'none';
}
