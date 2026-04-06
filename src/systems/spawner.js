// ===== Enemy Spawner =====
export function getSpawnRate(elapsed, endless) {
  // Standard 5-minute progression
  if (elapsed < 60)  return { interval: 2.0, count: 2, types: ['zombie'] };
  if (elapsed < 120) return { interval: 1.5, count: 2, types: ['zombie', 'bat'] };
  if (elapsed < 150) return { interval: 1.2, count: 2, types: ['zombie', 'bat', 'skeleton'] };
  if (elapsed < 180) return { interval: 1.0, count: 3, types: ['zombie', 'bat', 'skeleton', 'ghost'] };
  if (elapsed < 240) return { interval: 0.7, count: 3, types: ['zombie', 'bat', 'skeleton', 'ghost', 'elite_skeleton', 'splitter'] };
  if (elapsed < 270) return { interval: 0.5, count: 4, types: ['zombie', 'bat', 'skeleton', 'ghost', 'elite_skeleton', 'splitter'] };
  
  // Endless mode scaling beyond 4:30
  if (endless) {
    const mins = elapsed / 60;
    const scale = Math.min(mins / 5, 4); // Cap at 4x intensity
    const interval = Math.max(0.25, 0.4 - scale * 0.05);
    const count = Math.min(8, 4 + Math.floor(scale));
    const types = ['zombie', 'bat', 'skeleton', 'ghost', 'elite_skeleton', 'splitter', 'splitter'];
    return { interval, count, types };
  }
  
  return { interval: 0.4, count: 4, types: ['zombie', 'bat', 'skeleton', 'ghost', 'elite_skeleton', 'splitter', 'splitter'] };
}