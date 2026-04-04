// ===== Scene Management =====
import { isMobile } from './input.js';

const ALL_SCENES = ['title-screen', 'char-select', 'diff-select', 'weapon-select', 'upgrade-panel', 'result-screen'];

export function showScene(id) {
  ALL_SCENES.forEach(s => {
    document.getElementById(s).style.display = s === id ? 'flex' : 'none';
  });
  const show = id === 'weapon-select' || id === 'char-select' || id === 'title-screen' || id === 'result-screen';
  document.getElementById('hud').style.display = show ? 'none' : 'flex';
  document.getElementById('exp-bar-wrap').style.display = show ? 'none' : 'block';
  document.getElementById('minimap').style.display = show ? 'none' : 'block';
  if (isMobile) {
    document.getElementById('joystick').style.display = show ? 'none' : 'block';
    document.getElementById('dash-btn').style.display = show ? 'none' : 'flex';
  }
  document.getElementById('pause-menu').style.display = 'none';
  document.getElementById('pause-confirm').style.display = 'none';
}

export function showGameHUD() {
  document.getElementById('hud').style.display = 'flex';
  document.getElementById('exp-bar-wrap').style.display = 'block';
  document.getElementById('minimap').style.display = 'block';
  if (isMobile) {
    document.getElementById('joystick').style.display = 'block';
    document.getElementById('dash-btn').style.display = 'flex';
  }
}

export function hideGameHUD() {
  document.getElementById('hud').style.display = 'none';
  document.getElementById('exp-bar-wrap').style.display = 'none';
  document.getElementById('minimap').style.display = 'none';
}
