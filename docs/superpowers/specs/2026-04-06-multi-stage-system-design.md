# v2.2 Multi-Stage System Design Specification

> Drive #27 | Designer Agent | 2026-04-06
> Status: Design specification complete, awaiting frontend implementation

---

## 1. Design Overview

### 1.1 Problem Statement

The current game has a single infinite wasteland map. Every play session uses identical ground colors, identical enemy compositions, and the same Boss (Bone Dragon). After 20+ sessions, players experience content fatigue -- there is no variety in setting or atmosphere. Competitor analysis shows VS (15+ stages), Halls of Torment (multiple stages), and DRG: Survivor (zone-based maps) all use distinct environments to drive replay variety.

### 1.2 Design Goal

Introduce 3 distinct Stages, each with:
- Unique visual identity (ground color, decorative elements, atmosphere)
- Exclusive enemy types that only appear in that Stage
- An exclusive Boss with unique mechanics
- Stage-specific generation pool adjustments (different enemy weights/timing)

### 1.3 Core Design Principle

**Stages are primarily a visual + enemy-composition differentiator, NOT a gameplay-system differentiator.** The core 5-minute survival loop, upgrade panel, evolution system, synergy system, shop, quests, and achievements all function identically across Stages. This minimizes implementation complexity while maximizing perceived content variety.

---

## 2. Stage Definitions

### 2.1 Stage Overview

| Stage | ID | Name | Ground Color | Atmosphere | Exclusive Enemies | Exclusive Boss |
|-------|-----|------|-------------|-----------|-------------------|----------------|
| 1 | `wasteland` | 荒原 | `#2d2d2d` | Gray-green wasteland | (none -- uses all existing) | 骨龙 (Bone Dragon, existing) |
| 2 | `graveyard` | 墓园 | `#1a1a2e` | Dark blue-gray with tombstones | 护盾骷髅 (ShieldSkeleton) / 自爆蝙蝠 (ExploderBat) | 暗影骑士 (ShadowKnight) |
| 3 | `volcano` | 火山 | `#2e1a1a` | Dark red with lava cracks | 熔岩史莱姆 (LavaSlime) / 火焰蝙蝠 (FireBat) | 炎魔 (FlameLord) |

### 2.2 Design Rationale for Each Stage

**Stage 1 (Wasteland):** Default stage, identical to current gameplay. Zero changes required. Acts as the "tutorial" stage for new players. All existing enemies spawn as they do now.

**Stage 2 (Graveyard):** Darker, more oppressive atmosphere. Exclusive enemies are defensive (ShieldSkeleton) and aggressive (ExploderBat), creating a "careful positioning" tactical environment. The Shadow Knight boss tests sustained combat endurance.

**Stage 3 (Volcano):** Red-hued, hostile environment. Exclusive enemies are area-denial (LavaSlime) and pursuit-pressure (FireBat), creating an "always moving" tactical environment. The Flame Lord boss tests burst damage and positioning.

---

## 3. Stage Selection Flow

### 3.1 UI Flow Change

Current flow:
```
Title -> Character Select -> Difficulty Select -> Game
```

New flow:
```
Title -> Character Select -> Stage Select (NEW) -> Difficulty Select -> Game
```

Stage Select is inserted between Character Select and Difficulty Select. This placement lets players first choose their hero, then decide which battlefield to enter, and finally set the challenge level.

### 3.2 Stage Selection Interface

**Layout:** 3 stage cards using existing `.ws-card` CSS class (reused from weapon select and character select).

**Card Content:**
```
[Stage Icon] Stage Name
Stage Description
Difficulty Indicator
Locked/Unlocked Status
```

**Unlock Conditions:**

| Stage | Unlock Condition | Rationale |
|-------|-----------------|-----------|
| 荒原 (Wasteland) | Default (always available) | New players start here |
| 墓园 (Graveyard) | Defeat Bone Dragon in Wasteland (any difficulty) | Proves basic competence |
| 火山 (Volcano) | Defeat Shadow Knight in Graveyard (any difficulty) | Sequential progression |

**Lock Display:** Locked stages show a lock icon and the unlock condition as gray text. Card background is dimmed (opacity 0.5).

**Stage Select Config:**

```js
STAGES: {
  wasteland: {
    name: '荒原', icon: '🏜', desc: '灰绿的死寂之地',
    groundColor: '#2d2d2d',
    groundDecoColor: '#353535',
    groundDecoType: 'dots', // scattered dots pattern
    unlockCondition: null, // always unlocked
    exclusiveEnemies: [],
    exclusiveBoss: 'boss', // default bone dragon
    bossSpawnTime: 270,
  },
  graveyard: {
    name: '墓园', icon: '🪦', desc: '黑暗中潜伏的守卫',
    groundColor: '#1a1a2e',
    groundDecoColor: '#222240',
    groundDecoType: 'crosses', // tombstone crosses
    unlockCondition: { type: 'boss_kill', stage: 'wasteland' },
    exclusiveEnemies: ['shield_skeleton', 'exploder_bat'],
    exclusiveBoss: 'shadow_knight',
    bossSpawnTime: 270,
  },
  volcano: {
    name: '火山', icon: '🌋', desc: '熔岩与烈焰的炼狱',
    groundColor: '#2e1a1a',
    groundDecoColor: '#3a2020',
    groundDecoType: 'cracks', // lava crack lines
    unlockCondition: { type: 'boss_kill', stage: 'graveyard' },
    exclusiveEnemies: ['lava_slime', 'fire_bat'],
    exclusiveBoss: 'flame_lord',
    bossSpawnTime: 270,
  },
}
```

---

## 4. Stage-Exclusive Enemies

### 4.1 Design Principle

Each Stage adds 2 exclusive enemies to the global spawn pool. These enemies replace certain generic enemies in the spawn pool at specific time windows, giving each Stage a distinct combat flavor. Exclusive enemies use existing systems (hp scaling, difficulty multipliers, food drops, gem drops) and require no new subsystems.

### 4.2 Graveyard Exclusive Enemies

#### 4.2.1 ShieldSkeleton (护盾骷髅)

**Concept:** A skeleton carrying a rectangular shield. The shield blocks damage from the front (60-degree arc centered on facing direction), requiring players to maneuver to the side or behind for full damage. This is a simplified version of the ShieldBearer concept from Drive #26, adapted for the multi-stage system.

| Attribute | Value | Comparison |
|-----------|-------|------------|
| Type ID | `shield_skeleton` | - |
| Size | 14x14 | Same as regular skeleton |
| HP | 6 | Higher than skeleton (5) |
| Speed | 20 px/s | Same as skeleton |
| Damage | 1 (contact) | Standard |
| Shield | Front 60-degree arc, damage x0.3 | Core mechanic |
| Shield direction | Faces player (real-time tracking) | Always faces threat |
| Gem value | 3 | Medium |
| Food drop | Cheese | Skeleton family |

**Shield Mechanic:**
- Calculate angle from enemy to player: `angleToPlayer = atan2(player.y - enemy.y, player.x - enemy.x)`
- Calculate angle of incoming damage source (projectile origin or player position)
- If damage source is within +/-30 degrees of enemy's facing direction (the 60-degree arc): damage x0.3
- Otherwise (side or rear): full damage
- Visual: Blue semi-transparent rectangle in front of sprite, oriented toward player

**Shield visual:** A 10x4 blue rectangle (`#42a5f5`) drawn in front of the skeleton, rotated toward the player. When blocking, the shield briefly flashes white (0.1s).

**Interaction with existing weapons:**
- Holy Water / Bible (orbiting): Natural counter -- orbiting weapons attack from all angles, frequently hitting the unshielded rear
- Knife (projectile from player direction): Blocked if player is in front arc
- Lightning (random strike): Bypasses shield entirely (lightning comes from above, not player direction)
- Boomerang (tracks then returns): Outgoing path may be blocked, return path likely hits rear
- Fire Staff (cone from player direction): Partially blocked if player is in front arc
- Frost Aura (radius centered on player): Bypasses shield (it's an area effect, not directional)

**Spawn timing:** 180s+, mixed into spawn pool. Weight: 1 (same as ghost/elite_skeleton).

#### 4.2.2 ExploderBat (自爆蝙蝠)

**Concept:** A bat that charges at the player, and upon reaching close range (or upon death), explodes in a small AOE. Creates "proximity danger" pressure, encouraging players to eliminate bats at range or use dash to escape.

| Attribute | Value | Comparison |
|-----------|-------|------------|
| Type ID | `exploder_bat` | - |
| Size | 12x12 | Smaller than regular bat (14) |
| HP | 2 | Same as bat |
| Speed | 70 px/s | Slower than bat (80) |
| Damage | 1 (contact) + 2 (explosion) | Explosion is the threat |
| Explosion radius | 50 px | Small AOE |
| Explosion trigger | Death OR within 25px of player | Double trigger |
| Gem value | 2 | Medium |
| Food drop | None | Balances explosion threat |

**Explosion Mechanic:**
- On death (HP <= 0): Create an explosion at current position, 50px radius, 2 damage to player if in range
- On proximity (within 25px of player): Same explosion, then remove enemy (counts as kill)
- Explosion visual: Orange circle expanding from 0 to 50px radius over 0.15s, then fading
- Explosion does NOT damage other enemies (simplifies implementation)
- Dash invincibility frames block explosion damage

**Interaction with existing weapons:**
- Knife / Boomerang (ranged): Ideal -- kill at range, no explosion threat
- Holy Water / Bible (close orbit): Risky -- kills trigger explosion near player
- Lightning (random): Good -- often kills before bat reaches player
- Frost Aura (slow + freeze): Excellent -- frozen exploder bats can be safely killed at distance
- Dash: Natural counter -- dash through the bat to trigger explosion behind you

**Spawn timing:** 120s+, mixed into spawn pool. Weight: 2 (moderately common, replaces some bat spawns).

### 4.3 Volcano Exclusive Enemies

#### 4.3.1 LavaSlime (熔岩史莱姆)

**Concept:** A slow-moving slime that leaves a damaging lava trail behind it. Creates persistent ground hazards that restrict player movement space. Forces "path management" tactical thinking.

| Attribute | Value | Comparison |
|-----------|-------|------------|
| Type ID | `lava_slime` | - |
| Size | 16x16 | Same as zombie |
| HP | 4 | Medium |
| Speed | 30 px/s | Slower than zombie (40) |
| Damage | 1 (contact) | Standard |
| Lava trail | Leaves 1 trail point per 0.5s, each lasts 4s | Core mechanic |
| Lava trail damage | 1 DPS per trail point | Area denial |
| Max trail points | 12 | Prevents screen coverage |
| Gem value | 2 | Medium |
| Food drop | Meat | Standard |

**Lava Trail Mechanic:**
- Every 0.5 seconds, the lava slime drops a trail point at its current position
- Each trail point is a 20x20 area that lasts 4 seconds
- Player standing on a trail point takes 1 DPS per point overlapped
- Trail points fade from orange to dark red as they age (visual indicator of remaining duration)
- Trail points do NOT damage enemies (simplifies implementation)

**Interaction with existing weapons:**
- All weapons work normally against LavaSlime (it's just a slow enemy)
- The strategic challenge is positioning: killing the slime near you creates lava under you
- Dash: Can dash through lava trails without taking damage (invincibility frames)
- Frost Aura: Can freeze the slime, stopping trail generation temporarily

**Spawn timing:** 60s+ (early, creates immediate environmental hazard). Weight: 1 (same as zombie initially).

#### 4.3.2 FireBat (火焰蝙蝠)

**Concept:** A bat that ignites on contact. When it hits the player, it applies a burn DOT (same system as Fire Staff burn). Creates "sustained damage" pressure -- even after killing the bat, the player takes burn damage for several seconds.

| Attribute | Value | Comparison |
|-----------|-------|------------|
| Type ID | `fire_bat` | - |
| Size | 14x14 | Same as regular bat |
| HP | 2 | Same as bat |
| Speed | 85 px/s | Slightly faster than bat (80) |
| Damage | 1 (contact) | Standard |
| Burn | On contact, apply 2 DPS burn for 2.5 seconds | Core mechanic |
| Gem value | 1 | Standard |
| Food drop | None | Balances burn threat |

**Burn Mechanic:**
- On contact with player, apply `player._burn = { dps: 2, duration: 2.5 }`
- Uses the same `_burn` system as Fire Staff's burn effect
- If already burning, refreshes duration (does not stack DPS)
- Burn visual: Player sprite flashes orange, small flame particles rise

**Interaction with existing weapons:**
- Armor passive: Reduces burn damage (burn DPS reduced by armor value)
- Regen passive: Helps recover from burn damage over time
- Dash invincibility: Does NOT prevent burn (burn is applied on contact, contact happens)
- Kill before contact: Prevents burn entirely -- ranged weapons preferred

**Spawn timing:** 120s+, mixed into spawn pool. Weight: 2 (replaces regular bat spawns in volcano).

---

## 5. Stage-Exclusive Bosses

### 5.1 Design Principle

Each Stage has a unique Boss with 3 phases. Bosses reuse the existing Boss framework (multi-phase, bullet patterns, HP scaling with difficulty) but with distinct mechanics and visuals. The existing Bone Dragon boss remains unchanged for Wasteland.

### 5.2 Shadow Knight (暗影骑士) -- Graveyard Boss

**Concept:** A dark-armored knight that alternates between aggressive melee charges and defensive shield phases. Tests player positioning and timing.

| Attribute | Value | Comparison to Bone Dragon |
|-----------|-------|--------------------------|
| Type ID | `shadow_knight` | - |
| Size | 28x28 | Smaller than Bone Dragon (32) |
| HP | 250 | Higher than Bone Dragon (200) |
| Speed | 45 px/s | Faster than Bone Dragon (30) |
| Damage | 2 (contact) | Same |
| Phases | 3 | Same structure |

**Phase 1 (100%-50% HP): Charge + Slash**
- Charges toward player at 1.5x speed (67 px/s) every 3 seconds
- On reaching player proximity (40px), performs a wide slash (60px arc, 3 damage)
- Between charges, slowly walks toward player at base speed
- Visual: Dark purple armor (`#4a148c`), glowing red eyes, greatsword

**Phase 2 (50%-25% HP): Shield Wall + Summon**
- Raises shield (front 90-degree arc, damage x0.15 -- very strong block)
- Every 5 seconds, summons 2 regular skeletons at its position
- Moves toward player at 0.7x speed (31 px/s) while shielded
- Visual: Shield glows blue-purple, summoning animation (purple particles rise from ground)

**Phase 3 (25%-0% HP): Shadow Dash + Blade Storm**
- Performs rapid shadow dashes (3 consecutive, each 100px distance) every 4 seconds
- Each dash damages player on contact (2 damage per dash)
- Between dash sequences, releases 8-directional blade projectiles (speed 120 px/s, damage 1.5, lifetime 2s)
- No shield in Phase 3 (full damage from all directions)
- Visual: Armor becomes deeper purple with black particle trail, eyes glow brighter red

**Spawn timing:** 270s (same as Bone Dragon)

### 5.3 Flame Lord (炎魔) -- Volcano Boss

**Concept:** A massive fire demon that creates persistent lava zones and fires explosive projectiles. Tests burst damage and spatial awareness.

| Attribute | Value | Comparison to Bone Dragon |
|-----------|-------|--------------------------|
| Type ID | `flame_lord` | - |
| Size | 30x30 | Similar to Bone Dragon (32) |
| HP | 300 | Highest of all bosses |
| Speed | 30 px/s | Same as Bone Dragon |
| Damage | 2 (contact) | Same |
| Phases | 3 | Same structure |

**Phase 1 (100%-50% HP): Fireball Barrage**
- Fires 3 fireballs toward player every 2 seconds
- Fireball speed: 100 px/s, damage: 2, size: 8x8, lifetime: 3s
- Fireballs leave a small lava patch (30px radius, lasts 3s, 1 DPS) on impact
- Slowly walks toward player between barrages
- Visual: Deep red body (`#b71c1c`), orange flame crown, fire particles float upward

**Phase 2 (50%-25% HP): Lava Pools + Charge**
- Every 4 seconds, creates a lava pool at player's current position (70px radius, lasts 5s, 2 DPS)
- After creating pool, immediately charges toward player at 2x speed (60 px/s)
- Contact damage during charge: 3
- Continues firing 3 fireballs between charges
- Visual: Body brightens to orange-red, lava pools glow and pulse

**Phase 3 (25%-0% HP): Inferno + Ring of Fire**
- Releases 16-directional ring of fire every 3 seconds (speed 80 px/s, damage 1.5, lifetime 2.5s)
- Creates lava pool at own position every 5 seconds (traps melee range)
- Movement speed increases to 1.5x (45 px/s) -- relentless pursuit
- No more fireballs (replaced by ring of fire)
- Visual: Body becomes white-hot center with red edges, flame particles dense

**Spawn timing:** 270s (same as Bone Dragon)

---

## 6. Stage-Specific Spawn Pool Adjustments

### 6.1 Design Principle

Each Stage uses the same spawn timing intervals (0-60s, 60-120s, etc.) but modifies the enemy TYPE POOL. Exclusive enemies are added to the pool, and certain generic enemies may have adjusted weights. This creates distinct combat flavor without changing the pacing system.

### 6.2 Spawn Pool by Stage

**Wasteland (no changes):**
```
0-60s:   zombie (weight 4)
60-120s: zombie (4), bat (3)
120-150s: zombie (4), bat (3), skeleton (2)
150-180s: zombie (4), bat (3), skeleton (2), ghost (1)
180-240s: zombie (4), bat (3), skeleton (2), ghost (1), elite_skeleton (1), splitter (1)
240-270s: zombie (3), bat (3), skeleton (2), ghost (1), elite_skeleton (1), splitter (2)
270s+:   zombie (3), bat (3), skeleton (2), ghost (1), elite_skeleton (2), splitter (2)
```

**Graveyard (replace some bat with exploder_bat, add shield_skeleton):**
```
0-60s:   zombie (4)
60-120s: zombie (4), bat (2), exploder_bat (1)
120-150s: zombie (4), bat (2), exploder_bat (1), skeleton (2)
150-180s: zombie (4), bat (2), exploder_bat (1), skeleton (2), ghost (1)
180-240s: zombie (3), bat (2), exploder_bat (1), skeleton (2), ghost (1), shield_skeleton (1), elite_skeleton (1), splitter (1)
240-270s: zombie (3), bat (1), exploder_bat (2), skeleton (2), ghost (1), shield_skeleton (1), elite_skeleton (1), splitter (2)
270s+:   zombie (3), bat (1), exploder_bat (2), skeleton (2), ghost (1), shield_skeleton (1), elite_skeleton (2), splitter (2)
```

**Volcano (replace some zombie with lava_slime, some bat with fire_bat):**
```
0-60s:   zombie (3), lava_slime (1)
60-120s: zombie (3), lava_slime (1), bat (2), fire_bat (1)
120-150s: zombie (3), lava_slime (1), bat (2), fire_bat (1), skeleton (2)
150-180s: zombie (3), lava_slime (1), bat (1), fire_bat (2), skeleton (2), ghost (1)
180-240s: zombie (2), lava_slime (2), bat (1), fire_bat (2), skeleton (2), ghost (1), elite_skeleton (1), splitter (1)
240-270s: zombie (2), lava_slime (2), bat (1), fire_bat (2), skeleton (2), ghost (1), elite_skeleton (1), splitter (2)
270s+:   zombie (2), lava_slime (2), bat (1), fire_bat (2), skeleton (2), ghost (1), elite_skeleton (2), splitter (2)
```

### 6.3 Spawner.js Implementation Approach

The `getSpawnRate(elapsed, endless)` function needs a `stage` parameter to determine the type pool.

```js
// New signature:
export function getSpawnRate(elapsed, endless, stage) {
  // ...existing interval/count logic (unchanged)...
  // Replace static types array with stage-aware pool
  const types = getStagePool(elapsed, stage || 'wasteland');
  return { interval, count, types };
}

function getStagePool(elapsed, stage) {
  // Return array of enemy type strings based on stage and elapsed time
  // Each type appears in the array a number of times equal to its weight
}
```

---

## 7. CFG.ENEMY_TYPES Additions

```js
// Graveyard exclusive
shield_skeleton: {
  w:14, h:14, hp:6, speed:20, dmg:1, color:'#78909c',
  shielded:true, shieldArc:60, shieldDmgMul:0.3,
  gemValue:3, foodType:'cheese'
},
exploder_bat: {
  w:12, h:12, hp:2, speed:70, dmg:1, color:'#ff6e40',
  exploder:true, explosionRadius:50, explosionDmg:2, explosionTrigger:25,
  gemValue:2, foodType:null
},

// Volcano exclusive
lava_slime: {
  w:16, h:16, hp:4, speed:30, dmg:1, color:'#e65100',
  lavaTrail:true, trailInterval:0.5, trailDuration:4, trailDps:1, maxTrails:12,
  gemValue:2, foodType:'meat'
},
fire_bat: {
  w:14, h:14, hp:2, speed:85, dmg:1, color:'#ff3d00',
  burnOnContact:true, burnDps:2, burnDur:2.5,
  gemValue:1, foodType:null
},

// Bosses
shadow_knight: {
  w:28, h:28, hp:250, speed:45, dmg:2, color:'#4a148c',
  isBoss:true
},
flame_lord: {
  w:30, h:30, hp:300, speed:30, dmg:2, color:'#b71c1c',
  isBoss:true
},
```

---

## 8. Save System Extensions

### 8.1 New Fields

```js
// Save._default() additions:
{
  // ...existing fields...
  stageUnlocked: {
    wasteland: true,   // always unlocked
    graveyard: false,
    volcano: false,
  },
  stageStats: {
    wasteland: { bestTime: 0, bossKilled: false },
    graveyard: { bestTime: 0, bossKilled: false },
    volcano:   { bestTime: 0, bossKilled: false },
  },
}
```

### 8.2 Unlock Logic

On Boss kill in endGame():
```js
// After boss killed, check if this unlocks next stage
const stageOrder = ['wasteland', 'graveyard', 'volcano'];
const currentIdx = stageOrder.indexOf(game.stage);
const nextStage = stageOrder[currentIdx + 1];
if (nextStage && !save.stageUnlocked[nextStage]) {
  save.stageUnlocked[nextStage] = true;
  // Show unlock notification on result screen
}
```

---

## 9. Quest Extensions

### 9.1 New Stage-Related Quests

Add 4 new quests to CFG.QUESTS:

```js
{ id:'graveyard_clear', name:'暗夜守墓人', icon:'🪦', desc:'在墓园击败暗影骑士',
  check: s => s.stage === 'graveyard' && s.bossKilled, reward:200 },
{ id:'volcano_clear', name:'烈焰征服者', icon:'🌋', desc:'在火山击败炎魔',
  check: s => s.stage === 'volcano' && s.bossKilled, reward:300 },
{ id:'all_stages', name:'世界探索者', icon:'🌍', desc:'在全部3个Stage击败Boss',
  check: s => s.stagesCleared && s.stagesCleared.length >= 3, reward:400 },
{ id:'volcano_hard', name:'炼狱之主', icon:'🔥', desc:'噩梦难度在火山击败炎魔',
  check: s => s.stage === 'volcano' && s.difficulty === 'hard' && s.bossKilled, reward:500 },
```

### 9.2 gameStats Extension

The `gameStats` object passed to quest check functions needs a new field:

```js
{
  // ...existing fields...
  stage: game.stage,       // current stage ID
  stagesCleared: save.stagesCleared || [], // array of stage IDs with boss killed
}
```

---

## 10. Achievement Extensions

### 10.1 New Stage-Related Achievements

Add to CFG.ACHIEVEMENTS:

```js
// Stage exploration
all_stages: { name:'世界征服者', icon:'🌍', desc:'在全部Stage击败Boss', type:'multi', reward:200,
  parts: ['stage_wasteland','stage_graveyard','stage_volcano'] },
stage_wasteland: { hidden:true, check: s => s.stage === 'wasteland' && s.bossKilled },
stage_graveyard: { hidden:true, check: s => s.stage === 'graveyard' && s.bossKilled },
stage_volcano:   { hidden:true, check: s => s.stage === 'volcano' && s.bossKilled },
```

---

## 11. Visual Specification

### 11.1 Ground Colors and Decoration

| Stage | Ground Base | Deco Color | Deco Type | Deco Density |
|-------|------------|-----------|-----------|-------------|
| Wasteland | `#2d2d2d` | `#353535` | Small dots (2x2px) | 1 per 80x80 area |
| Graveyard | `#1a1a2e` | `#222240` | Cross shapes (6x6px) | 1 per 120x120 area |
| Volcano | `#2e1a1a` | `#4a2020` | Crack lines (variable length) | 1 per 100x100 area |

### 11.2 Exclusive Enemy Colors

| Enemy | Primary Color | Secondary Color | Size |
|-------|-------------|----------------|------|
| ShieldSkeleton | `#78909c` (gray-blue body) | `#42a5f5` (shield) | 14x14 + shield rect |
| ExploderBat | `#ff6e40` (orange body) | `#ffab40` (pulsing core) | 12x12 |
| LavaSlime | `#e65100` (orange body) | `#bf360c` (trail spots) | 16x16 |
| FireBat | `#ff3d00` (red-orange) | `#ff6e40` (flame particles) | 14x14 |
| ShadowKnight | `#4a148c` (purple armor) | `#e53935` (eye glow) | 28x28 |
| FlameLord | `#b71c1c` (dark red body) | `#ff6f00` (crown flames) | 30x30 |

### 11.3 Boss Visual Design

**ShadowKnight:**
- 28x28 dark purple rectangular body
- Red glowing eyes (2x2 pixels each, `#e53935`)
- Greatsword: 16x4 gray rectangle extending from body side
- Phase 2: Blue-purple shield overlay on front half
- Phase 3: Black particle trail behind movement

**FlameLord:**
- 30x30 dark red body with rounded top
- Orange flame crown: 3-5 pixels above head, animated flickering
- Fire particles constantly rising from body
- Phase 2: Body brightens, lava pools visible on ground
- Phase 3: White-hot center, red edges, dense fire particles

---

## 12. Implementation Points

### 12.1 Files to Modify

| # | File | Change | Lines (est.) |
|---|------|--------|-------------|
| 1 | config.js | CFG.STAGES + 6 new ENEMY_TYPES + 4 new QUESTS + 3 new ACHIEVEMENTS | ~80 |
| 2 | save.js | stageUnlocked + stageStats fields + migration | ~25 |
| 3 | spawner.js | getSpawnRate(elapsed, endless, stage) + getStagePool() | ~50 |
| 4 | enemy.js | 4 new enemy sprites + shield/explosion/lava/burn mechanics | ~100 |
| 5 | game.js | stage selection flow + boss spawning per stage + unlock logic | ~60 |
| 6 | scenes.js | Add 'stage-select' to ALL_SCENES | ~5 |
| 7 | index.html | Stage select HTML section | ~30 |
| 8 | hud.js | Wave progress stage name shows current stage | ~5 |
| **Total** | | | **~355** |

### 12.2 Priority Implementation Order

1. CFG.STAGES config + save extensions (foundation)
2. Stage select UI (HTML + scene management)
3. Stage-aware spawner (getStagePool)
4. 4 exclusive enemy implementations (enemy.js)
5. 2 new boss implementations (game.js / enemy.js)
6. Quest + Achievement additions (config.js)
7. Unlock logic (game.js / save.js)

---

## 13. Numerical Balance Analysis

### 13.1 Enemy HP Comparison (at 5:00, standard difficulty, hpMul=2.0)

| Enemy | Base HP | At 5:00 | DPS to Kill (base DPS ~10) | Time to Kill |
|-------|---------|---------|--------------------------|-------------|
| Zombie | 3 | 6 | 10 | 0.6s |
| Bat | 1 | 2 | 10 | 0.2s |
| Skeleton | 5 | 10 | 10 | 1.0s |
| ShieldSkeleton | 6 | 12 | 10 (front) / 10 (rear) | 1.2s (rear) / 4.0s (front) |
| ExploderBat | 2 | 4 | 10 | 0.4s |
| LavaSlime | 4 | 8 | 10 | 0.8s |
| FireBat | 2 | 4 | 10 | 0.4s |
| Elite Skeleton | 12 | 24 | 10 | 2.4s |
| Boss (Bone Dragon) | 200 | 200 | 20 | 10s |
| Shadow Knight | 250 | 250 | 20 | 12.5s |
| Flame Lord | 300 | 300 | 20 | 15s |

### 13.2 Boss Kill Time Analysis

| Boss | HP | Standard DPS (~20) | Hard HP | Hard DPS (~15) | Kill Time (Standard) | Kill Time (Hard) |
|------|-----|-------------------|---------|---------------|---------------------|-----------------|
| Bone Dragon | 200 | 20 | 400 | 15 | ~10s | ~27s |
| Shadow Knight | 250 | 20 | 500 | 15 | ~12.5s | ~33s |
| Flame Lord | 300 | 20 | 600 | 15 | ~15s | ~40s |

**Assessment:** Flame Lord at 300 HP with hard mode (600 HP) may take 40 seconds to kill with typical dual-weapon Lv3 DPS. This is within acceptable range -- players have ~30 seconds of Boss engagement window (270s spawn to 300s game end). For hard mode, players need stronger builds (evolved weapons) to kill in time, which is the intended design.

### 13.3 Stage Difficulty Progression

| Stage | Threat Type | Difficulty Feel | Strategic Skill Tested |
|-------|-----------|----------------|----------------------|
| Wasteland | Quantity (many generic enemies) | Overwhelm | AOE efficiency |
| Graveyard | Quality (shielded/exploding enemies) | Tactical positioning | Directional awareness |
| Volcano | Environment (lava trails, burn DOT) | Spatial management | Constant movement |

---

## 14. Design Decisions

1. **3 Stages, not more:** Three stages cover the minimum needed for meaningful variety (default / dark / fire). Each stage introduces a distinct tactical challenge. More stages can be added later via the same CFG.STAGES framework.

2. **Sequential unlock (Wasteland -> Graveyard -> Volcano):** Creates a sense of progression. Players must demonstrate competence at each stage before unlocking the next. Avoids overwhelming new players with choices.

3. **2 exclusive enemies per stage:** Enough to create distinct combat flavor without overwhelming the spawn pool. Each pair covers one "positioning" enemy (ShieldSkeleton/LavaSlime) and one "pressure" enemy (ExploderBat/FireBat).

4. **Bosses reuse 3-phase structure:** The existing Boss phase system (100%-50%-25%) is proven and well-understood. New bosses differentiate through mechanics (charge+summon vs fireball+lava), not structural changes.

5. **Shield uses directional damage check, not a separate HP pool:** Simpler to implement and more intuitive. Players see a visible shield direction and can react accordingly. No need for a separate "shield HP" system.

6. **Lava trail points are time-limited (4s) and count-limited (12):** Prevents screen coverage from becoming overwhelming. 12 points at 20x20px each = 4800 sq px, which is about 0.1% of the visible area -- safe for performance.

7. **Explosion does not damage other enemies:** Simplifies implementation and avoids unintended enemy chain-reactions that would make Graveyard easier than intended.

8. **FireBat burn uses existing _burn system:** Reuses the Fire Staff burn infrastructure. No new DOT system needed.

9. **Stage select is a separate screen, not a tab:** Clear visual separation. Uses the same card-based UI as character/weapon/difficulty selects for consistency.

10. **Ground decoration is simple geometric shapes:** Maintains pixel-art aesthetic. No sprite images needed. Dots/crosses/cracks are drawn with fillRect calls during ground rendering.

11. **All Stages share the same 5-minute timer, upgrade system, evolution system, and synergy system:** The multi-stage system is a content multiplier, not a systems multiplier. This is the key architectural decision that keeps implementation cost manageable.

12. **Endless mode works with all Stages:** The ENDLESS difficulty option is available for any unlocked Stage. Each Stage's endless mode uses that Stage's exclusive enemies and boss (with cycling boss as per endless spec).

13. **Quest and Achievement additions are additive:** New quests/achievements use existing check function infrastructure. No new check types needed.

14. **ShieldSkeleton is a simplified ShieldBearer:** The ShieldBearer concept from Drive #26 is implemented as ShieldSkeleton for Graveyard. The core shield mechanic (directional damage reduction) is the same, but the name and lore are adapted to the graveyard theme.
