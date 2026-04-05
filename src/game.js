// ===== Game State & Main Loop =====
import { CFG } from './core/config.js';
import { V, rand, randInt, clamp, dist, distSq, aabbOverlap } from './core/math.js';
import { Save } from './core/save.js';
import { SFX, screenShake, playerCrits } from './audio/sfx.js';
import { Camera } from './systems/camera.js';
import { Player } from './entities/Player.js';
import { Enemy } from './entities/enemy.js';
import { Gem } from './entities/gem.js';
import { Food } from './entities/food.js';
import { Chest } from './entities/chest.js';
import { getSpawnRate } from './systems/spawner.js';
import { initInput, getInput, isMobile, showJoystick } from './ui/input.js';
import { showScene } from './ui/scenes.js';
import { showUpgrade, generateUpgrades } from './ui/upgrade-panel.js';
import { WEAPON_CLASSES } from './weapons/registry.js';
import {
  HolyWater, Knife, Lightning, Bible, FireStaff,
  FrostAura, Blizzard, ThunderHolyWater,
  FireKnife, HolyDomain,
} from './weapons/registry.js';
import { drawHUD } from './ui/hud.js';
import { showQuestPanel, hideQuestPanel } from './ui/quest-panel.js';
import { showShopPanel, hideShopPanel } from './ui/shop-panel.js';

// Export game state globally for test access
window.game = null;

export function getGame() { return window.game; }

const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');
const mmCanvas = document.getElementById('minimap');
const mmCtx = mmCanvas.getContext('2d');

let selectedChar = null;
let selectedDiff = 'normal';
window.autoUpgrade = false;

// ===== Canvas resize =====
function resize() {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  canvas.style.width = window.innerWidth + 'px';
  canvas.style.height = window.innerHeight + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
window.addEventListener('resize', resize);
resize();

// ===== Pause system =====
const pauseMenuEl = document.getElementById('pause-menu');
const soundBtnEl = document.getElementById('sound-btn');

const confirmEl = document.getElementById('pause-confirm');

function togglePause() {
  if (!window.game || window.game.over) return;
  if (window.game.paused && pauseMenuEl.style.display === 'flex') {
    resumeGame();
  } else if (!window.game.paused) {
    window.game.paused = true;
    pauseMenuEl.style.display = 'flex';
    updateSoundBtn();
  }
}
window.togglePause = togglePause;

window.resumeGame = resumeGame;

function resumeGame() {
  if (!window.game) return;
  window.game.paused = false;
  pauseMenuEl.style.display = 'none';
  confirmEl.style.display = 'none';
}
window.resumeGame = resumeGame;

function updateSoundBtn() {
  soundBtnEl.textContent = SFX.enabled ? '🔊 音效：关' : '🔇 音效：关';
}
window.updateSoundBtn = updateSoundBtn;

function toggleSound() {
  SFX.enabled = !SFX.enabled;
  updateSoundBtn();
  const d = Save.load(); d.sfxEnabled = SFX.enabled; Save.save(d);
}
window.toggleSound = toggleSound;

function confirmQuit() {
  confirmEl.style.display = 'flex';
}
window.confirmQuit = confirmQuit;

function cancelQuit() {
  confirmEl.style.display = 'none';
}
window.cancelQuit = cancelQuit;

function quitToTitle() {
  window.game = null;
  pauseMenuEl.style.display = 'none';
  confirmEl.style.display = 'none';
  showScene('title-screen');
  updateTitleStats();
}
window.quitToTitle = quitToTitle;

// Restore SFX preference
(function () { const d = Save.load(); if (d.sfxEnabled === false) SFX.enabled = false; })();

// ===== Game flow functions =====
window.startGame = function startGame() {
  SFX.init();
  showScene('char-select');
};
window.startGame = startGame;

window.pickDiff = function pickDiff(diff) {
  selectedDiff = diff;
  if (selectedChar._autoWeapon) {
    beginGame(selectedChar._autoWeapon);
  } else {
    showScene('weapon-select');
  }
};
window.pickDiff = pickDiff;

window.pickChar = function pickChar(charId) {
  const ch = CFG.CHARACTERS[charId];
  selectedChar = { id: charId, ...ch };
  if (ch.chooseWeapon) {
    showScene('diff-select');
  } else {
    showScene('diff-select');
    selectedChar._autoWeapon = ch.startWeapon;
  }
};
window.pickChar = pickChar;

window.pickWeapon = function pickWeapon(name) {
  beginGame(name);
};
window.pickWeapon = pickWeapon;

function beginGame(weaponName) {
  const ch = selectedChar;
  const p = new Player(ch.id);
  const diff = CFG.DIFFICULTY[selectedDiff];
  p.hp = Math.ceil(p.hp * diff.playerHpMul);
  p.maxHp = p.hp;
  p.speed = Math.round(p.speed * diff.playerSpeedMul);

  // Apply shop upgrades
  const shopData = Save.load().shopUpgrades || {};
  const pu = CFG.SHOP.upgrades;
  if (shopData.maxhp > 0) { const eff = pu.maxhp.effects[shopData.maxhp - 1]; p.maxHp += eff.hp; p.hp += eff.hp; }
  if (shopData.speed > 0) { p.speed = Math.round(p.speed * pu.speed.effects[shopData.speed - 1].speedMul); }
  if (shopData.pickup > 0) { p.pickupRange += pu.pickup.effects[shopData.pickup - 1].range; }
  if (shopData.expbonus > 0) { p.expBonus += (pu.expbonus.effects[shopData.expbonus - 1].mul - 1); }

  // Wire callbacks
  p.onSFX = (id) => SFX.play(id);
  p.onScreenShake = (type) => screenShake(type, window.game);
  p.getDifficulty = () => window.game.difficulty;
  p.getExpMul = () => CFG.DIFFICULTY[window.game.difficulty].expMul;

  p.weapons.push(new WEAPON_CLASSES[weaponName](p));

  window.game = {
    player: p,
    camera: new Camera(),
    enemies: [],
    bullets: [],
    gems: [],
    foods: [],
    chests: [],
    effects: [],
    dmgTexts: [],
    screenFlash: 0,
    elapsed: 0,
    paused: false,
    over: false,
    won: false,
    bossSpawned: false,
    bossKilled: false,
    spawnTimer: 0,
    chestTimer: CFG.CHEST.spawnInterval,
    shake: null,
    difficulty: selectedDiff,
    waveToast: null,
    waveToastTimer: 0,
    prevWaveStage: -1,
    weaponDmgMul: shopData.weaponDmg > 0 ? pu.weaponDmg.effects[shopData.weaponDmg - 1].mul : 1,
    goldMul: shopData.gold > 0 ? pu.gold.effects[shopData.gold - 1].mul : 1,
  };
  showScene(null);
  document.getElementById('hud').style.display = 'flex';
  document.getElementById('exp-bar-wrap').style.display = 'block';
  document.getElementById('minimap').style.display = 'block';
  if (isMobile) showJoystick(true);
  if (isMobile) showJoystick(true);
}

window.beginGame = beginGame;

function restartGame() {
  showScene('title-screen');
  updateTitleStats();
}
window.restartGame = restartGame;
window.showQuestPanel = showQuestPanel;
window.hideQuestPanel = hideQuestPanel;
window.showShopPanel = showShopPanel;
window.hideShopPanel = hideShopPanel;

window.toggleAutoUpgrade = function toggleAutoUpgrade() {
  window.autoUpgrade = !window.autoUpgrade;
  const btn = document.getElementById('hud-auto');
  if (autoUpgrade) {
    btn.style.background = 'rgba(79,195,247,0.25)';
    btn.style.borderColor = '#4fc3f7';
    btn.style.color = '#4fc3f7';
    btn.textContent = 'AUTO✓';
  } else {
    btn.style.background = 'rgba(255,255,255,0.08)';
    btn.style.borderColor = 'rgba(255,255,255,0.2)';
    btn.style.color = '#888';
    btn.textContent = 'AUTO';
  }
};
window.toggleAutoUpgrade = toggleAutoUpgrade;

function updateTitleStats() {
  const d = Save.load();
  const el = document.getElementById('title-stats');
  if (!el) return;
  if (d.gamesPlayed === 0) { el.textContent = ''; return; }
  const bm = Math.floor(d.bestTime / 60), bs = Math.floor(d.bestTime % 60);
  const sf = d.soulFragments || 0;
  el.innerHTML = `🏆 ${d.bestScore}杀 | ⏱ ${bm}:${bs.toString().padStart(2, '0')} | 🎮 ${d.gamesPlayed}局 | 💎 ${sf}`;
}
window.updateTitleStats = updateTitleStats;

function endGame(won) {
  window.game.over = true;
  window.game.won = won;
  pauseMenuEl.style.display = 'none';
  confirmEl.style.display = 'none';
  SFX.play(won ? 'victory' : 'gameover');
  const saveResult = Save.record(window.game.player.kills, window.game.elapsed, window.game.player.charId, window.game.player._bestCombo);

  // Quest checking
  const stats = {
    charId: window.game.player.charId,
    kills: window.game.player.kills,
    difficulty: window.game.difficulty,
    elapsed: window.game.elapsed,
    bossKilled: window.game.bossKilled,
    damageTaken: window.game.player._damageTaken,
    bestCombo: window.game.player._bestCombo
  };
  const newlyCompleted = CFG.QUESTS.filter(q => q.check(stats)).map(q => q.id);
  const questResult = newlyCompleted.length > 0 ? Save.recordQuests(newlyCompleted) : { firstTime: [] };

  document.getElementById('result-title').textContent = won ? '🏆 胜利! 🏆' : '💀 失败';
  document.getElementById('result-title').style.color = won ? '#ffd54f' : '#ef5350';
  const m = Math.floor(window.game.elapsed / 60), s = Math.floor(window.game.elapsed % 60);
  const bestM = Math.floor(saveResult.data.bestTime / 60), bestS = Math.floor(saveResult.data.bestTime % 60);
  const newTag = saveResult.newBest ? ' 🆕新纪录!' : '';

  // Build quest completion text
  let questHtml = '';
  let questReward = 0;
  if (questResult.firstTime.length > 0) {
    const questNames = questResult.firstTime.map(id => {
      const q = CFG.QUESTS.find(qq => qq.id === id);
      if (q) questReward += q.reward;
      return q ? `${q.icon} ${q.name} (+${q.reward}SF)` : id;
    }).join('<br>');
    questHtml = `<br><br>--- 📜 新任务完成 ---<br>${questNames}`;
  }

  // Soul fragment calculation
  const goldRate = window.game.goldMul || 1;
  const earnedSF = Math.floor(window.game.player.gold * CFG.SHOP.soulFragmentRate * goldRate) + questReward;
  Save.addSoulFragments(earnedSF);

  document.getElementById('result-stats').innerHTML =
    `击杀: ${window.game.player.kills}${newTag}<br>存活: ${m}:${s.toString().padStart(2, '0')}<br>金币: ${window.game.player.gold}<br>🔥 最高连击: ${window.game.player._bestCombo}<br><br>--- 最佳记录 ---<br>最高击杀: ${saveResult.data.bestScore}<br>最长存活: ${bestM}:${bestS.toString().padStart(2, '0')}<br>总游玩: ${saveResult.data.gamesPlayed}局<br><br>💎 获得 ${earnedSF} 灵魂碎片${questHtml}`;
  setTimeout(() => showScene('result-screen'), 500);
}
window.endGame = endGame;

// ===== Main Loop =====
let lastTime = 0;
function loop(time) {
  requestAnimationFrame(loop);
  if (!window.game || window.game.over) {
    if (!window.game) {
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    lastTime = time;
    return;
  }
  const dt = Math.min((time - lastTime) / 1000, 0.05);
  lastTime = time;

  if (!window.game.paused) {
    window.game.elapsed += dt;

    // Check time
    if (window.game.elapsed >= CFG.GAME_TIME && !window.game.won) {
      endGame(false); return;
    }
    // Boss spawn
    if (window.game.elapsed >= 270 && !window.game.bossSpawned) {
      window.game.bossSpawned = true;
      window.game.screenFlash = 0.5;
      screenShake('boss', window.game);
      SFX.play('boss');
      const bw = document.getElementById('boss-warning');
      bw.style.display = 'block';
      setTimeout(() => { bw.style.display = 'none'; }, 3000);
      const angle = Math.random() * Math.PI * 2;
      const bd = CFG.DIFFICULTY[window.game.difficulty];
      window.game.enemies.push(new Enemy('boss',
        window.game.player.x + Math.cos(angle) * 300,
        window.game.player.y + Math.sin(angle) * 300,
        bd.bossHpMul, bd.bossSpeedMul));
    }

    // Input
    const input = getInput();
    window.game.player.update(dt, input);
    window.game.camera.follow(window.game.player);
    window.game.camera.update(dt);

    // Spawn
    const rate = getSpawnRate(window.game.elapsed);
    window.game.spawnTimer -= dt;
    if (window.game.spawnTimer <= 0 && window.game.enemies.length < CFG.MAX_ENEMIES) {
      window.game.spawnTimer = rate.interval * CFG.DIFFICULTY[window.game.difficulty].spawnIntervalMul;
      const minutes = window.game.elapsed / 60;
      const dc = CFG.DIFFICULTY[window.game.difficulty];
      const hpMul = (1 + minutes * 0.2) * dc.enemyHpMul;
      const spdMul = (1 + minutes * 0.1) * dc.enemySpeedMul;
      const dc2 = CFG.DIFFICULTY[window.game.difficulty];
      for (let i = 0; i < Math.max(1, rate.count + dc2.spawnCountMod) && window.game.enemies.length < CFG.MAX_ENEMIES; i++) {
        const type = rate.types[randInt(0, rate.types.length - 1)];
        const angle = Math.random() * Math.PI * 2;
        const d = rand(250, 400);
        window.game.enemies.push(new Enemy(type,
          window.game.player.x + Math.cos(angle) * d,
          window.game.player.y + Math.sin(angle) * d,
          hpMul, spdMul));
      }
    }
    // Chest spawn
    if (window.game.elapsed > 30) {
      window.game.chestTimer -= dt;
      if (window.game.chestTimer <= 0 && window.game.chests.length < CFG.CHEST.maxChests) {
        window.game.chestTimer = CFG.CHEST.spawnInterval;
        const angle = Math.random() * Math.PI * 2;
        const d = rand(CFG.CHEST.spawnMinRange, CFG.CHEST.spawnMaxRange);
        const cx = window.game.player.x + Math.cos(angle) * d;
        const cy = window.game.player.y + Math.sin(angle) * d;
        window.game.chests.push(new Chest(clamp(cx, 20, CFG.MAP_W - 20), clamp(cy, 20, CFG.MAP_H - 20)));
      }
    }
    // Chest pickup
    for (let i = window.game.chests.length - 1; i >= 0; i--) {
      const ch = window.game.chests[i];
      if (!ch.opened) {
        const d = dist(ch, window.game.player);
        if (d < CFG.CHEST.pickupRange) {
          if (window.game.player.gold >= CFG.CHEST.cost) {
            window.game.player.gold -= CFG.CHEST.cost;
            ch.opened = true;
            SFX.play('chest');
            const reward = CFG.CHEST.rewards[randInt(0, CFG.CHEST.rewards.length - 1)];
            if (reward.type === 'heal') {
              window.game.player.hp = Math.min(window.game.player.hp + reward.value, window.game.player.maxHp);
              window.game.dmgTexts.push({ x: ch.x, y: ch.y - 10, text: `${reward.icon} ${reward.desc}`, life: 1.2 });
            } else if (reward.type === 'speed') {
              window.game.player._speedBoost = reward.value;
              window.game.player._speedBoostTimer = reward.duration;
              window.game.dmgTexts.push({ x: ch.x, y: ch.y - 10, text: `${reward.icon} ${reward.desc}`, life: 1.2 });
            } else if (reward.type === 'exp') {
              if (window.game.player.addExp(reward.value)) {
                SFX.play('levelup');
                const choices = generateUpgrades(window.game.player);
                if (choices.length > 0) showUpgrade(choices, window.game);
              }
              window.game.dmgTexts.push({ x: ch.x, y: ch.y - 10, text: `${reward.icon} ${reward.desc}`, life: 1.2 });
            }
            window.game.chests.splice(i, 1);
          } else {
            if (!ch._noGoldShown) {
              ch._noGoldShown = true;
              window.game.dmgTexts.push({ x: ch.x, y: ch.y - 10, text: '💰不足', life: 0.8 });
            }
          }
        } else {
          ch._noGoldShown = false;
        }
      }
    }
    // Update enemies
    for (const e of window.game.enemies) {
      e.update(dt, window.game.player, window.game.bullets);
      if (e.hitCD <= 0 && !(e.type === 'ghost' && e.teleportCD > 0)) {
        if (aabbOverlap(e.x, e.y, e.w, e.h, window.game.player.x, window.game.player.y, window.game.player.w, window.game.player.h)) {
          if (window.game.player.takeDamage(e.dmg)) {
            e.hitCD = 1;
            window.game.screenFlash = 0.2;
            if (window.game.player.hp <= 0) { endGame(false); return; }
          }
        }
      }
    }
    // Remove dead enemies
    for (let i = window.game.enemies.length - 1; i >= 0; i--) {
      const e = window.game.enemies[i];
      if (e.hp <= 0) {
        window.game.player.kills++;
        screenShake(e.type === 'elite_skeleton' || e.isBoss ? 'killBig' : 'kill', window.game);
        // Combo
        window.game.player._combo++;
        window.game.player._comboTimer = CFG.COMBO.timeout;
        if (window.game.player._combo > window.game.player._bestCombo) window.game.player._bestCombo = window.game.player._combo;
        if (CFG.COMBO.milestones.includes(window.game.player._combo)) {
          const m = window.game.player._combo;
          const shakeType = m >= 50 ? 'combo50' : m >= 20 ? 'combo20' : m >= 10 ? 'combo10' : 'combo5';
          screenShake(shakeType, window.game);
        }
        const comboGold = window.game.player.comboGold();
        window.game.player.gold += 10 + comboGold;
        SFX.play('kill');
        window.game.dmgTexts.push({ x: e.x, y: e.y - 10, text: '💀', life: 0.8 });
        // Drop gems
        const val = e.isBoss ? 50 : (e.type === 'skeleton' ? 3 : e.type === 'ghost' ? 2 : e.type === 'bat' ? 1 : e.type === 'elite_skeleton' ? 5 : 2);
        const count = e.isBoss ? 8 : 1;
        for (let g = 0; g < count; g++) {
          window.game.gems.push(new Gem(e.x + rand(-10, 10), e.y + rand(-10, 10), val / count | 0 || 1));
        }
        // Synergy: magnet_crit — crit kills drop bonus gem
        if (e._lastCrit && window.game.player.hasSynergy('magnet_crit')) {
          const bv = CFG.SYNERGIES.magnet_crit.bonusGemValue;
          window.game.gems.push(new Gem(e.x + rand(-8, 8), e.y + rand(-8, 8), bv));
        }
        // Synergy: crit_boots — crit spawns knife projectile
        if (e._lastCrit && window.game.player.hasSynergy('crit_boots')) {
          const kb = CFG.SYNERGIES.crit_boots.onCritKnife;
          const ang = Math.atan2(e.y - window.game.player.y, e.x - window.game.player.x);
          const dmgMul = window.game.weaponDmgMul || 1;
          window.game.bullets.push({
            x: window.game.player.x, y: window.game.player.y, w: 6, h: 6,
            vx: Math.cos(ang) * kb.speed, vy: Math.sin(ang) * kb.speed,
            dmg: Math.ceil(e.dmg * kb.dmgMul * dmgMul) || 1, life: kb.life,
            color: '#4fc3f7', hit: new Set()
          });
        }
        // Drop food
        if (window.game.foods.length < CFG.FOOD.maxFood) {
          const fDrop = CFG.FOOD.dropRate * CFG.DIFFICULTY[window.game.difficulty].foodDropMul;
          const foodCount = e.isBoss ? CFG.FOOD.bossDropCount : (Math.random() < fDrop ? 1 : 0);
          for (let f = 0; f < foodCount; f++) {
            window.game.foods.push(new Food(e.x + rand(-12, 12), e.y + rand(-12, 12), e.type));
          }
        }
        if (e.isBoss && window.game.elapsed >= 270) { window.game.bossKilled = true; endGame(true); return; }
        window.game.enemies.splice(i, 1);
      }
    }
    // Update weapons
    const pCrits = () => playerCrits(window.game.player);
    for (const w of window.game.player.weapons) {
      if (w instanceof HolyWater) w.update(dt, window.game.enemies);
            else if (w instanceof Knife) w.update(dt, window.game.enemies, window.game.bullets, (id) => SFX.play(id));
            else if (w instanceof Lightning) w.update(dt, window.game.enemies, (id) => SFX.play(id), pCrits);
            else if (w instanceof Bible) w.update(dt, window.game.enemies);
            else if (w instanceof FireStaff) w.update(dt, window.game.enemies);
            else if (w instanceof FrostAura) w.update(dt, window.game.enemies, (id) => SFX.play(id));
            else if (w instanceof Blizzard) w.update(dt, window.game.enemies, (id) => SFX.play(id), pCrits);
            else if (w instanceof ThunderHolyWater) w.update(dt, window.game.enemies);
            else if (w instanceof FireKnife) w.update(dt, window.game.enemies, window.game.bullets);
            else if (w instanceof HolyDomain) w.update(dt, window.game.enemies, (id) => SFX.play(id), pCrits);
    }
    // Update bullets
    for (let i = window.game.bullets.length - 1; i >= 0; i--) {
      const b = window.game.bullets[i];
      b.x += b.vx * dt; b.y += b.vy * dt; b.life -= dt;
      if (b.life <= 0 || b.x < 0 || b.x > CFG.MAP_W || b.y < 0 || b.y > CFG.MAP_H) {
        window.game.bullets.splice(i, 1); continue;
      }
      if (b.color === '#ffd54f' || b.burnDmg) {
        for (let j = window.game.enemies.length - 1; j >= 0; j--) {
          const e = window.game.enemies[j];
          if (b.hit && b.hit.has(e)) continue;
          if (aabbOverlap(b.x, b.y, b.w, b.h, e.x, e.y, e.w, e.h)) {
            e.hurt(b.dmg, pCrits());
            if (b.burnDmg) {
              if (!e._burn) e._burn = { dmg: 0, t: 0 };
              e._burn.dmg = b.burnDmg;
              e._burn.t = b.burnDur || 2;
            }
            if (b.hit) b.hit.add(e);
            if (!b.pierce || b.hit.size > b.pierce) {
              window.game.bullets.splice(i, 1);
            }
            break;
          }
        }
      } else {
        if (aabbOverlap(b.x, b.y, b.w, b.h, window.game.player.x, window.game.player.y, window.game.player.w, window.game.player.h)) {
          if (window.game.player.takeDamage(b.dmg)) {
            window.game.bullets.splice(i, 1);
            window.game.screenFlash = 0.3;
            if (window.game.player.hp <= 0) { endGame(false); return; }
          }
        }
      }
    }
    // Gems (use distSq for hot-path comparisons)
    const PR = window.game.player.pickupRange;
    for (let i = window.game.gems.length - 1; i >= 0; i--) {
      const g = window.game.gems[i];
      let ds = distSq(g, window.game.player);
      const dir = new V(window.game.player.x - g.x, window.game.player.y - g.y).norm();
      if (ds < PR * PR) {
        g.x += dir.x * CFG.GEM_FLY_SPEED * dt;
        g.y += dir.y * CFG.GEM_FLY_SPEED * dt;
        ds = distSq(g, window.game.player);
        if (ds < 144) { // 12*12
          const comboBonus = window.game.player.comboExpBonus();
          if (window.game.player.addExp(Math.ceil(g.value * comboBonus))) {
            SFX.play('levelup');
            const choices = generateUpgrades(window.game.player);
            if (choices.length > 0) showUpgrade(choices, window.game);
          }
          // Synergy: magnet_maxhp — gem pickup 2% chance heal 1HP
          if (window.game.player.hasSynergy('magnet_maxhp') && Math.random() < CFG.SYNERGIES.magnet_maxhp.gemHealChance) {
            if (window.game.player.hp < window.game.player.maxHp) {
              window.game.player.hp = Math.min(window.game.player.hp + 1, window.game.player.maxHp);
            }
          }
          SFX.play('pickup');
          window.game.gems.splice(i, 1);
        }
      } else {
        const d = Math.sqrt(ds);
        const spd = 40 + 60 * (1 - Math.min(d / 1000, 1));
        g.x += dir.x * spd * dt;
        g.y += dir.y * spd * dt;
      }
    }
    // Foods
    for (let i = window.game.foods.length - 1; i >= 0; i--) {
      const result = window.game.foods[i].update(dt, window.game.player, window.game);
      if (result === false || result === 'picked') {
        window.game.foods.splice(i, 1);
      }
    }
  }

  // ===== DRAW =====
  const W = window.innerWidth, H = window.innerHeight;
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, 0, W, H);

  // Ground
  const cam = window.game.camera;
  const gridSize = 32;
  const gs = cam.w2s(0, 0, canvas);
  const ge = cam.w2s(CFG.MAP_W, CFG.MAP_H, canvas);
  const mapX = gs.x, mapY = gs.y, mapW = ge.x - gs.x, mapH = ge.y - gs.y;
  ctx.fillStyle = '#2e7d32';
  ctx.fillRect(mapX, mapY, mapW, mapH);
  // Grid lines
  ctx.strokeStyle = 'rgba(0,0,0,0.08)';
  ctx.lineWidth = 0.5;
  const startX = Math.floor((cam.x - W / 2) / gridSize) * gridSize;
  const startY = Math.floor((cam.y - H / 2) / gridSize) * gridSize;
  for (let gx = startX; gx < cam.x + W / 2 + gridSize; gx += gridSize) {
    if (gx >= 0 && gx <= CFG.MAP_W) {
      const s = cam.w2s(gx, 0, canvas);
      ctx.beginPath(); ctx.moveTo(s.x, 0); ctx.lineTo(s.x, H); ctx.stroke();
    }
  }
  for (let gy = startY; gy < cam.y + H / 2 + gridSize; gy += gridSize) {
    if (gy >= 0 && gy <= CFG.MAP_H) {
      const s = cam.w2s(0, gy, canvas);
      ctx.beginPath(); ctx.moveTo(0, s.y); ctx.lineTo(W, s.y); ctx.stroke();
    }
  }
  // Map boundary
  ctx.strokeStyle = 'rgba(255,255,255,0.15)';
  ctx.lineWidth = 2;
  ctx.strokeRect(mapX, mapY, mapW, mapH);
  ctx.imageSmoothingEnabled = false;

  // Gems
  for (const g of window.game.gems) g.draw(ctx, cam, canvas);
  // Foods
  for (const f of window.game.foods) f.draw(ctx, cam, canvas);
  // Chests
  for (const ch of window.game.chests) ch.draw(ctx, cam, canvas);
  // Enemies
  for (const e of window.game.enemies) {
    e.draw(ctx, cam, canvas);
    // Burn effect overlay
    if (e._burn && e._burn.t > 0) {
      const bs = cam.w2s(e.x, e.y, canvas);
      const flicker = Math.sin(Date.now() * 0.015) * 0.2 + 0.5;
      ctx.fillStyle = `rgba(255,87,34,${flicker})`;
      ctx.fillRect(bs.x - e.w / 2, bs.y - e.h / 2, e.w, e.h);
      for (let p = 0; p < 2; p++) {
        const fx = bs.x + rand(-e.w / 2, e.w / 2);
        const fy = bs.y - e.h / 2 - rand(2, 8);
        ctx.fillStyle = `rgba(255,${152 + Math.floor(rand(0, 80))},0,${flicker})`;
        ctx.fillRect(fx, fy, 2, 3);
      }
    }
    // Frost slow overlay
    if (e._slow && e._slow > 0) {
      const bs = cam.w2s(e.x, e.y, canvas);
      ctx.fillStyle = 'rgba(144,202,249,0.25)';
      ctx.fillRect(bs.x - e.w / 2, bs.y - e.h / 2, e.w, e.h);
    }
    // Frozen overlay
    if (e._frozen && e._frozen > 0) {
      const bs = cam.w2s(e.x, e.y, canvas);
      ctx.fillStyle = 'rgba(179,229,252,0.5)';
      ctx.fillRect(bs.x - e.w / 2 - 1, bs.y - e.h / 2 - 1, e.w + 2, e.h + 2);
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.fillRect(bs.x - e.w / 2 - 1, bs.y - e.h / 2 - 2, 3, 2);
      ctx.fillRect(bs.x + e.w / 2 - 2, bs.y - e.h / 2 - 2, 3, 2);
    }
  }
  // Dash afterimages
  for (const ai of window.game.player._afterimages) {
    const as = cam.w2s(ai.x, ai.y, canvas);
    ctx.globalAlpha = ai.alpha * 0.5;
    ctx.fillStyle = '#4fc3f7';
    ctx.fillRect(as.x - window.game.player.w / 2, as.y - window.game.player.h / 2, window.game.player.w, window.game.player.h);
    ctx.globalAlpha = 1;
  }
  // Player
  if (window.game.player._dashing) {
    ctx.save();
    const s = cam.w2s(window.game.player.x, window.game.player.y, canvas);
    ctx.translate(s.x, s.y);
    ctx.rotate(window.game.player.facingAngle);
    ctx.scale(1.4, 0.8);
    ctx.rotate(-window.game.player.facingAngle);
    ctx.translate(-s.x, -s.y);
    window.game.player.draw(ctx, cam, canvas);
    ctx.restore();
  } else {
    window.game.player.draw(ctx, cam, canvas);
  }
  // Weapon visuals
  for (const w of window.game.player.weapons) {
    if (w.draw) w.draw(ctx, cam, canvas);
  }
  // Bullets
  for (const b of window.game.bullets) {
    const s = cam.w2s(b.x, b.y, canvas);
    if (b.color === '#ffd54f') {
      ctx.fillStyle = '#ffd54f';
      ctx.save();
      const angle = Math.atan2(b.vy, b.vx);
      ctx.translate(s.x, s.y);
      ctx.rotate(angle);
      ctx.fillRect(-6, -1, 12, 3);
      ctx.fillRect(4, -2, 4, 4);
      ctx.restore();
    } else if (b.color === '#ff6d00') {
      ctx.save();
      const angle = Math.atan2(b.vy, b.vx);
      ctx.translate(s.x, s.y);
      ctx.rotate(angle);
      ctx.fillStyle = 'rgba(255,87,34,0.5)';
      ctx.fillRect(-12, -2, 8, 4);
      ctx.fillStyle = 'rgba(255,152,0,0.4)';
      ctx.fillRect(-10, -1, 6, 2);
      ctx.fillStyle = '#ff6d00';
      ctx.fillRect(-6, -1.5, 12, 3);
      ctx.fillStyle = '#ff9100';
      ctx.fillRect(4, -2.5, 5, 5);
      ctx.fillStyle = '#ffeb3b';
      ctx.fillRect(7, -1, 3, 2);
      ctx.restore();
    } else {
      ctx.fillStyle = b.color;
      ctx.fillRect(s.x - b.w / 2, s.y - b.h / 2, b.w, b.h);
    }
  }
  // Damage texts
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  for (let i = window.game.dmgTexts.length - 1; i >= 0; i--) {
    const t = window.game.dmgTexts[i];
    t.y -= 30 * dt; t.life -= dt;
    if (t.life <= 0) { window.game.dmgTexts.splice(i, 1); continue; }
    const s = cam.w2s(t.x, t.y, canvas);
    ctx.font = 'bold 12px monospace';
    ctx.fillStyle = `rgba(255,82,82,${Math.min(1, t.life * 3)})`;
    ctx.fillText(t.text, s.x, s.y);
  }
  // Screen flash
  if (window.game.screenFlash > 0) {
    window.game.screenFlash -= dt;
    ctx.fillStyle = `rgba(255,0,0,${window.game.screenFlash * 0.4})`;
    ctx.fillRect(0, 0, W, H);
  }
  // Screen shake timer
  if (window.game.shake && window.game.shake.timer > 0) window.game.shake.timer -= dt;
  // HUD
  drawHUD(ctx, W, H, dt, window.game);
}

requestAnimationFrame(loop);
lastTime = 0;
loop(performance.now());

// ===== INIT =====
initInput();
showScene('title-screen');
updateTitleStats();
