// ===== Enemy Spawner =====
export function getSpawnRate(elapsed) {
  if (elapsed < 60)  return { interval: 2.0, count: 2, types: ['zombie'] };
  if (elapsed < 120) return { interval: 1.5, count: 2, types: ['zombie', 'bat'] };
  if (elapsed < 180) return { interval: 1.0, count: 3, types: ['zombie', 'bat', 'skeleton', 'ghost'] };
  if (elapsed < 240) return { interval: 0.7, count: 3, types: ['zombie', 'bat', 'skeleton', 'ghost', 'elite_skeleton', 'splitter'] };
  if (elapsed < 270) return { interval: 0.5, count: 4, types: ['zombie', 'bat', 'skeleton', 'ghost', 'elite_skeleton', 'splitter'] };
  return { interval: 0.4, count: 4, types: ['zombie', 'bat', 'skeleton', 'ghost', 'elite_skeleton', 'splitter', 'splitter'] };
}
