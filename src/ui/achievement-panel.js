// ===== Achievement Panel UI =====
import { CFG } from '../core/config.js';
import { Save } from '../core/save.js';

export function showAchievementPanel() {
  const d = Save.load();
  const completed = d.completedAchievements || [];
  const list = document.getElementById('achieve-list');
  list.innerHTML = '';

  let totalCount = 0;
  let doneCount = 0;

  for (const [id, ach] of Object.entries(CFG.ACHIEVEMENTS)) {
    if (ach.hidden) continue;
    totalCount++;

    const isDone = completed.includes(id);
    if (isDone) doneCount++;

    const card = document.createElement('div');
    const bgColor = isDone
      ? 'background:rgba(255,213,79,0.12);border:1px solid rgba(255,213,79,0.4)'
      : 'background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.15)';
    card.style.cssText = 'padding:10px 14px;border-radius:8px;font-family:monospace;display:flex;align-items:center;gap:10px;' + bgColor;

    // Build progress bar HTML for milestone/multi types
    let progressHtml = '';
    const prog = Save.getAchievementProgress(id);
    if (!isDone && (ach.type === 'milestone' || ach.type === 'multi')) {
      const pct = prog.target > 0 ? Math.min(100, Math.floor((prog.current / prog.target) * 100)) : 0;
      progressHtml = '<div style="margin-top:4px">'
        + '<div style="width:100%;height:4px;background:rgba(255,255,255,0.1);border-radius:2px;overflow:hidden">'
        + '<div style="width:' + pct + '%;height:100%;background:#ffd54f;border-radius:2px"></div>'
        + '</div>'
        + '<div style="font-size:10px;color:#888;margin-top:2px">' + prog.current + '/' + prog.target + '</div>'
        + '</div>';
    }

    // Non-hidden achievements: always show name/desc/icon
    // Done achievements show star marker
    const iconText = ach.icon || '?';
    const checkMark = isDone ? ' <span style="color:#ffd54f">\u2605</span>' : '';
    const rewardColor = isDone ? '#66bb6a' : '#ffd54f';
    const nameColor = isDone ? '#ffd54f' : '#ccc';

    card.innerHTML =
      '<span style="font-size:24px">' + iconText + '</span>'
      + '<div style="flex:1">'
      + '<div style="font-size:13px;font-weight:bold;color:' + nameColor + '">' + ach.name + checkMark + '</div>'
      + '<div style="font-size:11px;color:#999;margin-top:2px">' + (ach.desc || '') + '</div>'
      + progressHtml
      + '</div>'
      + '<div style="font-size:11px;color:' + rewardColor + '">' + (ach.reward || 0) + '\u{1F48E}</div>';

    list.appendChild(card);
  }

  document.getElementById('achieve-summary').textContent = doneCount + '/' + totalCount;
  document.getElementById('achievement-panel').style.display = 'flex';
}

export function hideAchievementPanel() {
  document.getElementById('achievement-panel').style.display = 'none';
}
