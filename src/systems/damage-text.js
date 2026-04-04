// ===== Damage Text System =====

export function updateDmgTexts(texts, dt) {
  for (let i = texts.length - 1; i >= 0; i--) {
    texts[i].life -= dt;
    if (texts[i].life <= 0) { texts.splice(i, 1); }
  }
}

export function drawDmgTexts(ctx, texts, cam, canvas, dt) {
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (let i = texts.length - 1; i >= 0; i--) {
    const t = texts[i];
    t.y -= 30 * dt;
    t.life -= dt;
    if (t.life <= 0) { texts.splice(i, 1); continue; }
    const s = cam.w2s(t.x, t.y, canvas);
    ctx.font = 'bold 12px monospace';
    ctx.fillStyle = `rgba(255,82,82,${Math.min(1, t.life * 3)})`;
    ctx.fillText(t.text, s.x, s.y);
  }
}
