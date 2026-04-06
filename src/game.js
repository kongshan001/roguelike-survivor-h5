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
  FireKnife, HolyDomain, FrostKnife, FlameBible, Boomerang,
  Thunderang, Blazerang,
} from './weapons/registry.js';
import { drawHUD } from './ui/hud.js';
import { showQuestPanel, hideQuestPanel } from './ui/quest-panel.js';
import { updateSkillPanel, showSkillToggle, hideSkillToggle } from './ui/skill-panel.js';

// Endless mode boss spawn helper
function spawnEndlessBoss(hpScale, spdScale) {
  const bd = CFG.DIFFICULTY[window.game.difficulty];
  window.game.screenFlash = 0.5;
  screenShake('boss', window.game);
  SFX.play('boss');
  const bw = document.getElementById('boss-warning');
  if (bw) { bw.style.display = 'block'; setTimeout(() => { if(bw) bw.style.display = 'none'; }, 3000); }
  const angle = Math.random() * Math.PI * 2;
  const hpMul = (bd.bossHpMul || 1) * hpScale;
  const spdMul = (bd.bossSpeedMul || 1) * spdScale;
  window.game.enemies.push(new Enemy('boss',
    window.game.player.x + Math.cos(angle) * 300,
    window.game.player.y + Math.sin(angle) * 300,
    hpMul, spdMul));
}

import { showShopPanel, hideShopPanel } from './ui/shop-panel.js';
import { showAchievementPanel, hideAchievementPanel } from './ui/achievement-panel.js';

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
let _W = window.innerWidth, _H = window.innerHeight;
function resize() {
  const dpr = window.devicePixelRatio || 1;
  _W = window.innerWidth; _H = window.innerHeight;
  canvas.width = _W * dpr;
  canvas.height = _H * dpr;
  canvas.style.width = _W + 'px';
  canvas.style.height = _H + 'px';
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


function updateEndlessUnlock() {
  const d = Save.load();
  const card = document.getElementById('endless-card');
  if (!card) return;
  if (d.endlessUnlocked) {
    card.style.opacity = '1';
    card.style.pointerEvents = 'auto';
  }
}
window.updateEndlessUnlock = updateEndlessUnlock;

window.pickChar = function pickChar(charId) {
  const ch = CFG.CHARACTERS[charId];
  selectedChar = { id: charId, ...ch };
  updateEndlessUnlock();
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
    endless: selectedDiff === 'endless',
    bossCycleIndex: 0,
    bossKillCount: 0,
    waveToast: null,
    waveToastTimer: 0,
    prevWaveStage: -1,
    weaponDmgMul: shopData.weaponDmg > 0 ? pu.weaponDmg.effects[shopData.weaponDmg - 1].mul : 1,
    goldMul: shopData.gold > 0 ? pu.gold.effects[shopData.gold - 1].mul : 1,
    evolutions: [],
    killsAt60: 0,
  };
  showScene(null);
  document.getElementById('hud').style.display = 'flex';
  document.getElementById('exp-bar-wrap').style.display = 'block';
  document.getElementById('minimap').style.display = 'block';
  showSkillToggle();
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
window.showAchievementPanel = showAchievementPanel;
window.hideAchievementPanel = hideAchievementPanel;

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
  hideSkillToggle();
  pauseMenuEl.style.display = 'none';
  confirmEl.style.display = 'none';
  SFX.play(won ? 'victory' : 'gameover');
  const saveResult = Save.record(window.game.player.kills, window.game.elapsed, window.game.player.charId, window.game.player._bestCombo);

  // Unlock endless mode on first boss kill (standard mode win)
  if (won && !window.game.endless) {
    const sd = Save.load();
    if (!sd.endlessUnlocked) {
      sd.endlessUnlocked = true;
      Save.save(sd);
    }
  }

  // Endless record tracking
  if (window.game.endless) {
    const sd = Save.load();
    if (window.game.elapsed > (sd.bestEndlessTime || 0)) sd.bestEndlessTime = window.game.elapsed;
    if (window.game.player.kills > (sd.bestEndlessKills || 0)) sd.bestEndlessKills = window.game.player.kills;
    if ((window.game.bossKillCount || 0) > (sd.bestEndlessBossKills || 0)) sd.bestEndlessBossKills = window.game.bossKillCount || 0;
    Save.save(sd);
  }

  // Quest checking
  const stats = {
    charId: window.game.player.charId,
    kills: window.game.player.kills,
    difficulty: window.game.difficulty,
    elapsed: window.game.elapsed,
    bossKilled: window.game.bossKilled,
    damageTaken: window.game.player._damageTaken,
    bestCombo: window.game.player._bestCombo,
    evolutions: window.game.evolutions || [],
    completedQuestsCount: (Save.load().completedQuests || []).length,
    killsAt60: window.game.killsAt60,
    endless: window.game.endless,
    bossKillCount: window.game.bossKillCount || 0
  };
  const newlyCompleted = CFG.QUESTS.filter(q => q.check(stats)).map(q => q.id);
  const questResult = newlyCompleted.length > 0 ? Save.recordQuests(newlyCompleted) : { firstTime: [] };

  if (window.game.endless) {
    document.getElementById('result-title').textContent = '💀 无尽模式结束';
    document.getElementById('result-title').style.color = '#ce93d8';
  } else {
    document.getElementById('result-title').textContent = won ? '🏆 胜利! 🏆' : '💀 失败';
    document.getElementById('result-title').style.color = won ? '#ffd54f' : '#ef5350';
  }
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
    questHtml = '<br><br>--- 📜 新任务完成 ---<br>' + questNames;
  }

  // Achievement checking
  const completedQuestsCount = (Save.load().completedQuests || []).length;
  stats.completedQuestsCount = completedQuestsCount;
  const achieveResult = Save.checkAchievements(stats);
  let achieveHtml = '';
  if (achieveResult.newlyCompleted.length > 0) {
    const achieveNames = achieveResult.newlyCompleted.map(aid => {
      const ach = CFG.ACHIEVEMENTS[aid];
      return ach ? `${ach.icon} ${ach.name} (+${ach.reward}SF)` : aid;
    }).join('<br>');
    achieveHtml = '<br><br>--- ★ 成就达成 ---<br>' + achieveNames;
  }

  // Soul fragment calculation
  const goldRate = window.game.goldMul || 1;
  const earnedSF = Math.floor(window.game.player.gold * CFG.SHOP.soulFragmentRate * goldRate) + questReward + achieveResult.rewardTotal;
  Save.addSoulFragments(earnedSF);

  document.getElementById('result-stats').innerHTML =
    (window.game.endless ? '♾ 无尽模式<br>击杀: ' + window.game.player.kills + '&nbsp;&nbsp;存活: ' + m + ':' + s.toString().padStart(2, '0') + '&nbsp;&nbsp;连击: ' + window.game.player._bestCombo + '<br>Boss击杀: ' + (window.game.bossKillCount || 0) + '&nbsp;&nbsp;金币: ' + window.game.player.gold : '击杀: ' + window.game.player.kills + newTag + '&nbsp;&nbsp;存活: ' + m + ':' + s.toString().padStart(2, '0') + '&nbsp;&nbsp;连击: ' + window.game.player._bestCombo) + '<br>金币: ' + window.game.player.gold + '&nbsp;&nbsp;💎 +' + earnedSF + ' 灵魂碎片' + questHtml + achieveHtml;
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

    // Check time (endless mode has no time limit)
    if (!window.game.endless && window.game.elapsed >= CFG.GAME_TIME && !window.game.won) {
      endGame(false); return;
    }
    // Boss spawn
    if (!window.game.endless) {
      // Standard: single boss at 4:30
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
    } else {
      // Endless: first boss at 4:30, then periodic
      if (window.game.elapsed >= 270 && !window.game.bossSpawned) {
        window.game.bossSpawned = true;
        window.game.bossCycleIndex = 0;
        window.game.bossKilled = false;
        spawnEndlessBoss(1.0, 1.0);
      } else if (window.game.bossSpawned && window.game.bossKilled) {
        const timeSinceFirst = window.game.elapsed - 270;
        const nextCycle = Math.floor(timeSinceFirst / CFG.ENDLESS.bossInterval);
        if (nextCycle > window.game.bossCycleIndex) {
          const hpScale = Math.pow(CFG.ENDLESS.bossScalePerCycle.hpMul, nextCycle);
          const spdScale = Math.pow(CFG.ENDLESS.bossScalePerCycle.speedMul, nextCycle);
          window.game.bossCycleIndex = nextCycle;
          window.game.bossKilled = false;
          spawnEndlessBoss(hpScale, spdScale);
        }
      }
    }

    // Input
    const input = getInput();
    window.game.player.update(dt, input);
    window.game.camera.follow(window.game.player);
    window.game.camera.update(dt);

    // Spawn
    const rate = getSpawnRate(window.game.elapsed, window.game.endless);
    window.game.spawnTimer -= dt;
    const maxEnemies = window.game.endless ? Math.min(CFG.MAX_ENEMIES + Math.floor((window.game.elapsed - 270) / 60) * (CFG.ENDLESS.maxEnemyBonus / 5), CFG.ENDLESS.maxEnemiesCap) : CFG.MAX_ENEMIES;
    if (window.game.spawnTimer <= 0 && window.game.enemies.length < maxEnemies) {
      window.game.spawnTimer = rate.interval * CFG.DIFFICULTY[window.game.difficulty].spawnIntervalMul;
      const minutes = window.game.elapsed / 60;
      const dc = CFG.DIFFICULTY[window.game.difficulty];
      const hpMul = (1 + minutes * 0.2) * dc.enemyHpMul;
      const spdMul = (1 + minutes * 0.1) * dc.enemySpeedMul;
      const dc2 = CFG.DIFFICULTY[window.game.difficulty];
      for (let i = 0; i < Math.max(1, rate.count + dc2.spawnCountMod) && window.game.enemies.length < maxEnemies; i++) {
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
        // Track kills in first 60 seconds for pacifist achievement
        if (window.game.elapsed < 60) {
          window.game.killsAt60 = window.game.player.kills;
        }
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
        const gemVal = e.isBoss? 50 : (e.type === 'skeleton' ? 3 : e.type === 'ghost' ? 2 : e.type === 'bat' ? 1 : e.type === 'elite_skeleton' ? 5 : e.type === 'splitter_small' ? 1 : 2);
        const goldFromGem = CFG.GOLD.gemToGold ? gemVal : 0;
        // Apply goldDropBonus from lucky coin passive
        const goldMul = 1 + (window.game.player.goldDropBonus || 0);
        let goldEarned = CFG.GOLD.perKill + comboGold + Math.ceil(goldFromGem * goldMul);
        // apply crit_luckycoin synergy: crit kills double gold
        if (e._lastCrit && window.game.player.hasSynergy('crit_luckycoin')) {
          goldEarned *= 2;
        }
        window.game.player.gold += goldEarned;
        SFX.play('kill');
        window.game.dmgTexts.push({ x: e.x, y: e.y - 10, text: '💀', life: 0.8 });
        // Synergy: firestaff_luckycoin — burned enemies drop extra gem value
        let gemValExtra = 0;
        if (e._burn && e._burn.t > 0 && window.game.player.hasSynergy('firestaff_luckycoin')) {
          gemValExtra = CFG.SYNERGIES.firestaff_luckycoin.weaponBonus.burnGemBonus;
        }
        // Drop gems
        let gemValFinal = gemVal + gemValExtra;
        // Mark frozen status for gems from frostaura_luckycoin synergy
        const frozenKilled = !!(e._frozen && e._frozen > 0);
        const count = e.isBoss ? 8 : 1;
        for (let g = 0; g < count; g++) {
          const newGem = new Gem(e.x + rand(-10, 10), e.y + rand(-10, 10), gemValFinal / count | 0 || 1);
          newGem._fromFrozen = frozenKilled;
          if (frozenKilled && window.game.player.hasSynergy('frostaura_luckycoin')) {
            newGem._frozenPullBonus = CFG.SYNERGIES.frostaura_luckycoin.weaponBonus.frozenGemPullBonus;
          }
          window.game.gems.push(newGem);
        }
        // Synergy: magnet_crit — crit kills drop bonus gem
        if (e._lastCrit && window.game.player.hasSynergy('magnet_crit')) {
          const bv = CFG.SYNERGIES.magnet_crit.bonusGemValue;
          window.game.gems.push(new Gem(e.x + rand(-8, 8), e.y + rand(-8, 8), bv));
        }
        // Synergy: holywater_luckycoin — holy water kills drop extra gold
        if (window.game.player.hasSynergy('holywater_luckycoin')) {
          const bonus = CFG.SYNERGIES.holywater_luckycoin.weaponBonus.killGoldBonus;
          const hasHolyWater = window.game.player.weapons.some(w => w.name === 'holywater' || w.name === 'thunderholywater');
          if (hasHolyWater) {
            window.game.player.gold += bonus;
          }
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
        if (e.isBoss) {
          window.game.bossKilled = true;
          if (window.game.endless) {
            window.game.bossKillCount++;
            // Boss kill rewards in endless
            window.game.player.gold += CFG.ENDLESS.bossKillReward.gold;
            // Drop extra food
            for (let fi = 0; fi < CFG.ENDLESS.bossKillReward.food; fi++) {
              window.game.foods.push(new Food(e.x + rand(-12, 12), e.y + rand(-12, 12), 'boss'));
            }
          } else {
            endGame(true); return;
          }
        }
        // Splitter: split into 2 small splitters on death
        if (e.splitter && !e.isChild && window.game.enemies.length < CFG.MAX_ENEMIES) {
          const minutes = window.game.elapsed / 60;
          const dc = CFG.DIFFICULTY[window.game.difficulty];
          const hpMul = (1 + minutes * 0.2) * dc.enemyHpMul;
          const spdMul = (1 + minutes * 0.1) * dc.enemySpeedMul;
          for (let s = 0; s < 2 && window.game.enemies.length < CFG.MAX_ENEMIES; s++) {
            const offset = (s === 0 ? -1 : 1) * 12;
            const child = new Enemy('splitter_small', e.x + offset, e.y, hpMul, spdMul);
            window.game.enemies.push(child);
          }
        }
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
            else if (w instanceof FrostKnife) w.update(dt, window.game.enemies, window.game.bullets, (id) => SFX.play(id));
            else if (w instanceof FlameBible) w.update(dt, window.game.enemies, (id) => SFX.play(id));
            else if (w instanceof Boomerang) w.update(dt, window.game.enemies);
            else if (w instanceof Thunderang) w.update(dt, window.game.enemies);
            else if (w instanceof Blazerang) w.update(dt, window.game.enemies);
    }
    // Update bullets
    for (let i = window.game.bullets.length - 1; i >= 0; i--) {
      const b = window.game.bullets[i];
      b.x += b.vx * dt; b.y += b.vy * dt; b.life -= dt;
      if (b.life <= 0 || b.x < 0 || b.x > CFG.MAP_W || b.y < 0 || b.y > CFG.MAP_H) {
        window.game.bullets.splice(i, 1); continue;
      }
      if (b.color === '#ffd54f' || b.burnDmg || b.frostSlow) {
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
            if (b.frostSlow) {
              if (!e._slow || e._slow < b.frostSlow) e._slow = b.frostSlow;
              e._slowTimer = b.frostSlowDur;
              if (b.frostFreezeChance > 0 && Math.random() < b.frostFreezeChance) {
                e._frozen = b.frostFreezeDur;
                SFX.play('freeze');
              }
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
    // Gems (use distSq for hot-path comparisons, no object allocation)
    const PR = window.game.player.pickupRange;
    const _px = window.game.player.x, _py = window.game.player.y;
    const PR2 = PR * PR;
    for (let i = window.game.gems.length - 1; i >= 0; i--) {
      const g = window.game.gems[i];
      let dx = _px - g.x, dy = _py - g.y;
      let ds = dx * dx + dy * dy;
      const dInv = ds > 0 ? 1 / Math.sqrt(ds) : 0;
      const nx = dx * dInv, ny = dy * dInv;
      if (ds < PR2) {
        // frostaura_luckycoin: gems from frozen enemies have extended pull range
        let pullRange = PR;
        if (g._frozenPullBonus) pullRange += g._frozenPullBonus;
        g.x += nx * CFG.GEM_FLY_SPEED * dt;
        g.y += ny * CFG.GEM_FLY_SPEED * dt;
        dx = _px - g.x; dy = _py - g.y;
        ds = dx * dx + dy * dy;
        const pullRangeSq = pullRange * pullRange;
        if (ds < pullRangeSq) { // pullRange*pullRange
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
        const spd = 40 + 60 * (1 - Math.min(ds / 1000000, 1)); // ds/1000² instead of sqrt(ds)/1000
        g.x += nx * spd * dt;
        g.y += ny * spd * dt;
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
  const W = _W, H = _H;
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
  // Grid lines (batched into single path)
  ctx.strokeStyle = 'rgba(0,0,0,0.08)';
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  const startX = Math.floor((cam.x - W / 2) / gridSize) * gridSize;
  const startY = Math.floor((cam.y - H / 2) / gridSize) * gridSize;
  for (let gx = startX; gx < cam.x + W / 2 + gridSize; gx += gridSize) {
    if (gx >= 0 && gx <= CFG.MAP_W) {
      const s = cam.w2s(gx, 0, canvas);
      ctx.moveTo(s.x, 0); ctx.lineTo(s.x, H);
    }
  }
  for (let gy = startY; gy < cam.y + H / 2 + gridSize; gy += gridSize) {
    if (gy >= 0 && gy <= CFG.MAP_H) {
      const s = cam.w2s(0, gy, canvas);
      ctx.moveTo(0, s.y); ctx.lineTo(W, s.y);
    }
  }
  ctx.stroke();
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
    // Cache w2s for effects (avoid 3x redundant calls)
    const _hasFx = (e._burn && e._burn.t > 0) || (e._slow && e._slow > 0) || (e._frozen && e._frozen > 0);
    if (_hasFx) {
      const bs = cam.w2s(e.x, e.y, canvas);
      // Burn effect overlay
      if (e._burn && e._burn.t > 0) {
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
        ctx.fillStyle = 'rgba(144,202,249,0.25)';
        ctx.fillRect(bs.x - e.w / 2, bs.y - e.h / 2, e.w, e.h);
      }
      // Frozen overlay
      if (e._frozen && e._frozen > 0) {
        ctx.fillStyle = 'rgba(179,229,252,0.5)';
        ctx.fillRect(bs.x - e.w / 2 - 1, bs.y - e.h / 2 - 1, e.w + 2, e.h + 2);
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.fillRect(bs.x - e.w / 2 - 1, bs.y - e.h / 2 - 2, 3, 2);
        ctx.fillRect(bs.x + e.w / 2 - 2, bs.y - e.h / 2 - 2, 3, 2);
      }
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
    } else if (b.color === '#4fc3f7' && b.frostSlow) {
      // FrostKnife ice blade
      ctx.save();
      const angle = Math.atan2(b.vy, b.vx);
      ctx.translate(s.x, s.y);
      ctx.rotate(angle);
      // Ice crystal trail
      ctx.fillStyle = 'rgba(179,229,252,0.4)';
      ctx.fillRect(-12, -2, 8, 4);
      ctx.fillStyle = 'rgba(144,202,249,0.3)';
      ctx.fillRect(-10, -1, 6, 2);
      // Blade body
      ctx.fillStyle = '#4fc3f7';
      ctx.fillRect(-6, -1.5, 12, 3);
      ctx.fillStyle = '#81d4fa';
      ctx.fillRect(4, -2.5, 5, 5);
      // Ice tip glow
      ctx.fillStyle = '#e1f5fe';
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
