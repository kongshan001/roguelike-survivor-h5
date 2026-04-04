// ===== Input System =====

export const keys = {};
export const joystickInput = { x: 0, y: 0 };

export const isMobile = 'ontouchstart' in window;

let joystickEl, knobEl, dashBtnEl;
let joyTouchId = null;

export function initInput() {
  joystickEl = document.getElementById('joystick');
  knobEl = document.getElementById('joystick-knob');
  dashBtnEl = document.getElementById('dash-btn');

  document.addEventListener('keydown', e => {
    keys[e.key.toLowerCase()] = true;
    // Space and Escape/P handlers are set externally via callbacks
    if (e.code === 'Space') e.preventDefault();
  });
  document.addEventListener('keyup', e => { keys[e.key.toLowerCase()] = false; });

  if (isMobile) {
    joystickEl.style.display = 'block';
    dashBtnEl.style.display = 'block';
  }

  dashBtnEl.addEventListener('touchstart', e => {
    e.preventDefault();
    e.stopPropagation();
    if (_onDash) _onDash();
  }, { passive: false });

  joystickEl.addEventListener('touchstart', e => {
    e.preventDefault();
    const t = e.changedTouches[0];
    joyTouchId = t.identifier;
    handleJoyMove(t);
  }, { passive: false });

  joystickEl.addEventListener('touchmove', e => {
    e.preventDefault();
    for (const t of e.changedTouches) {
      if (t.identifier === joyTouchId) handleJoyMove(t);
    }
  }, { passive: false });

  joystickEl.addEventListener('touchend', e => {
    for (const t of e.changedTouches) {
      if (t.identifier === joyTouchId) {
        joyTouchId = null;
        joystickInput.x = 0;
        joystickInput.y = 0;
        knobEl.style.transform = 'translate(-50%,-50%)';
      }
    }
  });

  document.addEventListener('keydown', e => {
    if (e.code === 'Space' && _onDash) { e.preventDefault(); _onDash(); }
    if ((e.key === 'Escape' || e.key.toLowerCase() === 'p') && _onPause) { e.preventDefault(); _onPause(); }
  });
}

let _onDash = null;
let _onPause = null;

export function setDashCallback(fn) { _onDash = fn; }
export function setPauseCallback(fn) { _onPause = fn; }

export function showJoystick(show) {
  if (!isMobile) return;
  joystickEl.style.display = show ? 'block' : 'none';
  dashBtnEl.style.display = show ? 'flex' : 'none';
}

function handleJoyMove(touch) {
  const rect = joystickEl.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  let dx = touch.clientX - cx, dy = touch.clientY - cy;
  const maxR = rect.width / 2 - 18;
  const d = Math.hypot(dx, dy);
  if (d > maxR) { dx = dx / d * maxR; dy = dy / d * maxR; }
  joystickInput.x = dx / maxR;
  joystickInput.y = dy / maxR;
  knobEl.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
}

export function getInput() {
  let x = 0, y = 0;
  if (keys['w'] || keys['arrowup']) y = -1;
  if (keys['s'] || keys['arrowdown']) y = 1;
  if (keys['a'] || keys['arrowleft']) x = -1;
  if (keys['d'] || keys['arrowright']) x = 1;
  if (joystickInput.x || joystickInput.y) {
    x = joystickInput.x;
    y = joystickInput.y;
  }
  const l = Math.hypot(x, y);
  if (l > 1) { x /= l; y /= l; }
  return { x, y };
}
