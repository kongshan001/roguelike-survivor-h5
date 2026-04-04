// ===== Enemy Spawner =====
export function getSpawnRate(elapsed) {
  if (elapsed < 120) return { interval: 2.5, count: 1, types: ['zombie'] };
  if (elapsed < 180) return { interval: 2, count: 2, types: ['zombie', 'bat'] };
  if (elapsed < 210) return { interval: 1.2, count: 2, types: ['zombie', 'bat', 'skeleton', 'ghost'] };
  if (elapsed < 270) return { interval: 0.8, count: 3, types: ['zombie', 'bat', 'skeleton', 'ghost', 'elite_skeleton'] };
  return { interval: 0.5, count: 3, types: ['zombie', 'bat', 'skeleton', 'ghost', 'elite_skeleton'] };
}
