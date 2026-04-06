# v2.3 Secrets/Hidden Content System Design Specification

> Drive #28 | Designer Agent | 2026-04-06
> Status: Design specification complete, awaiting frontend implementation

---

## 1. Design Overview

### 1.1 Problem Statement

The current game has no hidden or discoverable content. Everything is visible from the start: 3 characters, 8 weapons, 8 evolutions, 21 synergies, all quests and achievements are listed openly. After 10-15 sessions, players have seen everything the game has to offer. There is no mystery, no discovery, and no community discussion catalyst.

Competitor analysis shows Vampire Survivors' Secrets system is one of its most powerful community engagement drivers -- hidden characters, hidden weapons, and hidden stages that require specific conditions to unlock, creating collaborative puzzle-solving and social media buzz. This is the single most effective "free marketing" mechanic in the survivor-like genre.

### 1.2 Design Goal

Introduce a Secrets system that:
- Hides specific unlockable content behind non-obvious conditions
- Creates "aha!" discovery moments when conditions are met
- Drives community discussion and wiki/guide creation
- Rewards deep system mastery (not just grinding)
- Uses existing systems (Save, achievement flags, UI overlays) -- zero new subsystems

### 1.3 Core Design Principle

**Secrets are cosmetic + minor gameplay variants, NOT power-creep content.** A secret character is an alternative skin/stats variant of an existing character, not a strictly better one. A secret weapon skin is a visual variant, not a new weapon. This ensures secrets are exciting to discover but not mandatory for competitive play.

---

## 2. Secrets Definition

### 2.1 Secret List (6 Secrets)

| # | Secret ID | Name | Type | Unlock Condition | Reward |
|---|-----------|------|------|-----------------|--------|
| 1 | `shadow_mage` | 暗影法师 | Character Variant | Evolve all 8 weapons at least once (all_evolutions achievement) | Dark-themed mage variant (purple+black color scheme, starts with lightning instead of weapon choice) |
| 2 | `golden_knife` | 黄金飞刀 | Weapon Skin | Kill 200 enemies in a single session with knife as only weapon | Knife projectiles change to golden color with sparkle trail |
| 3 | `ghost_hunter` | 幽灵猎手 | Title | Kill 50 ghosts in a single session | Permanent "Ghost Hunter" title displayed on title screen |
| 4 | `speed_demon` | 速度恶魔 | Title | Clear the game in under 3 minutes (speed_clear achievement) | Permanent "Speed Demon" title with flame effect |
| 5 | `boss_slayer` | Boss屠戮者 | Badge | Kill 5 Bosses across all sessions (endless mode counts) | Golden skull badge icon on HUD |
| 6 | `pacifist` | 和平主义者 | Badge | Survive first 60 seconds with 0 kills (pacifist_1min achievement) | White dove badge icon on HUD + enemies avoid player for first 10 seconds of each run |

### 2.2 Secret Categories

| Category | Count | Description |
|----------|-------|-------------|
| Character Variant | 1 | Alternative character with different visual + starting weapon |
| Weapon Skin | 1 | Visual-only weapon change |
| Title | 2 | Permanent title displayed on title screen |
| Badge | 2 | HUD icon displayed during gameplay |

---

## 3. Detailed Secret Specifications

### 3.1 Secret #1: Shadow Mage (暗影法师)

**Type:** Character Variant (unlocked as 4th character option)

**Unlock Condition:** Complete `all_evolutions` achievement (evolve all 8 weapon types at least once across all sessions). This is the300 soul fragments reward achievement, making the shadow mage the "ultimate completionist" reward.

**Reward:** A new character selectable from the character selection screen:

| Attribute | Shadow Mage | Comparison to Mage |
|-----------|-------------|-------------------|
| Name | 暗影法师 | - |
| Icon | `shadow` (purple+black) | - |
| HP | 6 | Lower than mage (8) |
| Speed | 180 | Higher than mage (160) |
| Start Weapon | Lightning (fixed) | Mage chooses weapon |
| Visual | Purple+black robe, glowing eyes | Blue robe |
| Description | "暗影之力，闪电之源" | - |

**Design Rationale:**
- Requires the most grind-heavy achievement (all 8 evolutions) as gate -- this is an "endgame" secret
- NOT strictly better than mage: trades HP for speed, loses weapon choice
- Visual differentiation is striking (dark purple vs blue)
- Lightning start weapon creates a unique early-game experience
- Unlocks AFTER the player has experienced all weapon content, giving the replay a fresh start

**Implementation:**
- `CFG.CHARACTERS` add `shadow` entry
- Character select screen: Shadow Mage card appears (with sparkle animation) when `Save.completedAchievements` includes `all_evolutions`
- Card is hidden (shows `???` with lock icon) until unlocked
- On unlock: toast notification "Secret Discovered: Shadow Mage!"

### 3.2 Secret #2: Golden Knife (黄金飞刀)

**Type:** Weapon Skin (visual variant for Knife weapon)

**Unlock Condition:** Kill 200 enemies in a single session where knife is the ONLY weapon equipped (no second weapon). This requires intentional single-weapon challenge play.

**Tracking:** New gameStats field `knifeOnlyKills`. Incremented when:
1. Player has exactly 1 weapon equipped
2. That weapon is `knife`
3. An enemy dies

Check at end of session: `gameStats.knifeOnlyKills >= 200`

**Reward:** All knife projectiles (including FrostKnife and FireKnife) display as golden color (`#ffd700`) with a sparkle trail (small white particles following projectile path).

**Design Rationale:**
- 200 kills with only knife is a significant challenge -- knife is the weakest AOE weapon
- Forces mastery of single-weapon positioning and dodging
- Purely cosmetic -- no damage/stat changes
- Applies to all knife variants (base, frost, fire), maximizing visual impact
- "Golden weapon" is a classic gaming trope players understand immediately

**Implementation:**
- `Save.secrets` array: track `golden_knife` unlocked
- Knife/FrostKnife/FireKnife draw methods: check `Save.secrets.includes('golden_knife')` for color override
- Trail particles: add `sparkle` type to knife projectile trail

### 3.3 Secret #3: Ghost Hunter (幽灵猎手)

**Type:** Title (displayed on title screen profile area)

**Unlock Condition:** Kill 50 ghosts in a single session. Ghosts appear after 180s and are semi-rare (weight 1), making this a dedicated hunting challenge.

**Tracking:** New gameStats field `ghostKills`. Incremented when enemy type is `ghost`.

Check at end of session: `gameStats.ghostKills >= 50`

**Reward:** Permanent title "幽灵猎手" displayed below player name on title screen. Title text in ghost-blue color (`#b0bec5`).

**Design Rationale:**
- Ghosts are the most mechanically unique enemy (phase shift + teleport), requiring specific strategies
- 50 ghosts in one 5-minute session is very hard (ghosts spawn at weight 1 from 180s, ~5-8 ghosts/minute at peak)
- May require endless mode to achieve (more time = more ghosts)
- Title is a "bragging rights" reward that other players can see in future multiplayer

**Implementation:**
- `Save.secrets` array: track `ghost_hunter` unlocked
- Title screen: if `Save.secrets.includes('ghost_hunter')`, display title text below character name

### 3.4 Secret #4: Speed Demon (速度恶魔)

**Type:** Title (displayed on title screen profile area)

**Unlock Condition:** Kill the Boss in under 3 minutes (180 seconds elapsed). This is the same condition as the `speed_clear` hidden achievement.

**Reward:** Permanent title "速度恶魔" displayed below player name on title screen. Title text in flame-red color (`#ff6e00`) with subtle flame animation (alpha pulse).

**Design Rationale:**
- Reuses existing `speed_clear` achievement condition (boss killed + elapsed <= 180)
- The speed_clear achievement already exists as hidden, so this secret doubles down on the discovery moment
- 3-minute Boss kill requires aggressive early-game strategy (fast leveling, immediate combat)
- Title + flame effect makes the discovery feel "legendary"

**Implementation:**
- `Save.secrets` array: track `speed_demon` unlocked
- Unlock condition: reuse `gameStats.bossKilled && gameStats.elapsed <= 180` from achievement check
- Title screen: if unlocked, display title with flame-red color and alpha pulse animation

### 3.5 Secret #5: Boss Slayer (Boss屠戮者)

**Type:** Badge (HUD icon during gameplay)

**Unlock Condition:** Kill 5 Bosses total across all sessions. Endless mode Boss kills count toward this total.

**Tracking:** New save field `totalBossKills`. Incremented each time a Boss dies (in any mode).

Check: `Save.totalBossKills >= 5`

**Reward:** A golden skull badge icon displayed on the top-left of HUD during gameplay. Badge is a small (16x16) golden skull (`#ffd700`) with subtle glow animation.

**Design Rationale:**
- Cross-session cumulative goal (not single-session)
- Endless mode is the primary way to farm Boss kills (Boss spawns every 240s)
- 5 Bosses = roughly 2-3 endless mode runs or many standard runs
- Badge is visible during gameplay, creating social proof and community curiosity ("what's that icon?")
- Simple to track: just increment a counter on Boss death

**Implementation:**
- `Save.totalBossKills` field (default 0)
- On Boss death: `Save.totalBossKills++`
- HUD rendering: if `Save.totalBossKills >= 5`, draw golden skull badge at top-left

### 3.6 Secret #6: Pacifist (和平主义者)

**Type:** Badge (HUD icon during gameplay + gameplay modifier)

**Unlock Condition:** Survive the first 60 seconds of a session with 0 kills. This is the same condition as the `pacifist_1min` hidden achievement.

**Reward:** A white dove badge icon displayed on HUD. Additionally, for every future session, enemies have a 20% larger avoidance radius during the first 10 seconds (enemies start spawning farther from player), giving a "peaceful start" bonus.

**Design Rationale:**
- Reuses existing `pacifist_1min` achievement condition
- The gameplay modifier (larger enemy avoidance radius for 10 seconds) is a subtle but meaningful permanent upgrade
- Thematically consistent: achieving peace is rewarded with more peace
- The modifier is minor (10 seconds only) and does not affect balance
- White dove icon is universally understood as a peace symbol

**Implementation:**
- `Save.secrets` array: track `pacifist` unlocked
- Unlock condition: reuse `pacifist_1min` achievement condition
- HUD: if unlocked, draw white dove badge
- Spawner modification: if secret unlocked, for first 10 seconds of each run, add 20% to minimum spawn distance from player

---

## 4. CFG.SECRETS Configuration

```js
SECRETS: {
  shadow_mage: {
    name: '暗影法师', type: 'character', icon: '🌑',
    desc: '暗影之力，闪电之源',
    condition: 'all_evolutions', // references achievement ID
    reward: { characterId: 'shadow' },
    discoverToast: '发现隐藏角色: 暗影法师!'
  },
  golden_knife: {
    name: '黄金飞刀', type: 'weapon_skin', icon: '✨',
    desc: '黄金飞刀特效',
    condition: { stat: 'knifeOnlyKills', target: 200 },
    reward: { weaponSkin: 'knife', skinId: 'golden' },
    discoverToast: '发现隐藏武器皮肤: 黄金飞刀!'
  },
  ghost_hunter: {
    name: '幽灵猎手', type: 'title', icon: '👻',
    desc: '幽灵猎手称号',
    condition: { stat: 'ghostKills', target: 50 },
    reward: { title: '幽灵猎手', titleColor: '#b0bec5' },
    discoverToast: '发现隐藏称号: 幽灵猎手!'
  },
  speed_demon: {
    name: '速度恶魔', type: 'title', icon: '🔥',
    desc: '速度恶魔称号',
    condition: 'speed_clear', // references achievement condition
    reward: { title: '速度恶魔', titleColor: '#ff6e00', animated: true },
    discoverToast: '发现隐藏称号: 速度恶魔!'
  },
  boss_slayer: {
    name: 'Boss屠戮者', type: 'badge', icon: '💀',
    desc: 'Boss屠戮者徽章',
    condition: { saveStat: 'totalBossKills', target: 5 },
    reward: { badge: 'golden_skull', badgeColor: '#ffd700' },
    discoverToast: '发现隐藏徽章: Boss屠戮者!'
  },
  pacifist: {
    name: '和平主义者', type: 'badge', icon: '🕊',
    desc: '和平主义者徽章 + 宁静开局',
    condition: 'pacifist_1min', // references achievement condition
    reward: { badge: 'white_dove', badgeColor: '#ffffff', gameplayBonus: 'peaceful_start' },
    discoverToast: '发现隐藏徽章: 和平主义者!'
  },
}
```

---

## 5. Save Extensions

### 5.1 New Save Fields

```js
// In Save._default():
{
  // ...existing fields...
  secrets: [],           // Array of unlocked secret IDs
  totalBossKills: 0,     // Cumulative Boss kills across all sessions
}
```

### 5.2 New gameStats Fields (per-session, used for condition checks)

```js
// In game.js gameStats:
{
  // ...existing fields...
  knifeOnlyKills: 0,     // Kills while knife is the only weapon
  ghostKills: 0,         // Ghost kills this session
}
```

---

## 6. Secret Discovery Flow

### 6.1 Check Timing

Secrets are checked at two times:

1. **End of session (endGame)**: Check all stat-based secrets (golden_knife, ghost_hunter)
2. **Achievement check time**: Secrets that share conditions with achievements (shadow_mage via all_evolutions, speed_demon via speed_clear, pacifist via pacifist_1min) are checked alongside achievements
3. **Boss death**: boss_slayer is checked immediately when any Boss dies (cross-session cumulative)

### 6.2 Discovery Toast

When a secret is first discovered:
- Game pauses briefly (0.5s freeze, similar to achievement discovery)
- A special golden-bordered toast appears at screen center:
  ```
  ==================
  SECRET DISCOVERED!
  [Secret Name]
  [Secret Description]
  ==================
  ```
- Toast is golden-bordered (not the usual white/blue achievement border)
- Toast lasts 3 seconds (longer than normal toasts)
- A unique sound effect plays (ascending mystery chord: E4-G4-B4-E5, 0.4s)

### 6.3 Secret Collection UI

**Location:** Title screen, accessible via a "Secrets" button (lock icon) next to the Quest button.

**Panel:** Same panel structure as Quest panel, but with a distinct golden border.

**Display:**
- Unlocked secrets: Show name, icon, and brief description. Golden text on dark background.
- Locked secrets: Show `???` with lock icon. Gray text.
- No hints for locked secrets (the community must discover conditions through experimentation)

**Total progress:** "Secrets: X/6" counter at top of panel.

---

## 7. CFG.CHARACTERS Extension

```js
CHARACTERS: {
  // ...existing entries...
  shadow: {
    name: '暗影法师', icon: '🌑', hp: 6, speed: 180,
    desc: '暗影之力，闪电之源',
    startWeapon: 'lightning',
    secret: true,  // only visible when unlocked
    colors: {
      body: '#4a148c',      // deep purple
      detail: '#e040fb',    // magenta accent
      eyes: '#ff1744',      // glowing red eyes
    }
  }
}
```

---

## 8. Implementation Points

| # | File | Change |
|---|------|--------|
| 1 | config.js | Add `CFG.SECRETS` configuration object |
| 2 | config.js | Add `shadow` to `CFG.CHARACTERS` |
| 3 | save.js | Add `secrets: []` and `totalBossKills: 0` to `_default()` |
| 4 | save.js | Add `checkSecrets(gameStats)` method (similar to `checkAchievements`) |
| 5 | game.js | Add `knifeOnlyKills` and `ghostKills` to gameStats |
| 6 | game.js | On enemy kill: track knifeOnlyKills (if weapons.length===1 && weapons[0]==='knife'), ghostKills (if enemy.type==='ghost') |
| 7 | game.js | On Boss kill: increment `Save.totalBossKills`, check `boss_slayer` secret |
| 8 | game.js | In endGame: call `Save.checkSecrets(gameStats)` alongside `Save.checkAchievements(gameStats)` |
| 9 | game.js | Secret discovery toast rendering (golden border, special SFX) |
| 10 | scenes.js | Character select: show/hide shadow mage card based on `Save.secrets` |
| 11 | scenes.js | Title screen: show title text if secrets unlocked |
| 12 | hud.js | Draw badges (golden skull, white dove) if secrets unlocked |
| 13 | hud.js | Draw title below player name on title screen |
| 14 | spawner.js | If pacifist secret unlocked, +20% minimum spawn distance for first 10 seconds |
| 15 | registry.js | Knife/FrostKnife/FireKnife: check golden knife skin for color override |
| 16 | scenes.js | Secrets panel: new panel or tab in Quest panel |
| 17 | sfx.js | New `secret` sound effect: ascending mystery chord |

**Estimated implementation: ~100-120 lines across 8 files.**

---

## 9. Balance Analysis

### 9.1 Power Level Assessment

| Secret | Gameplay Impact | Power Level |
|--------|----------------|-------------|
| Shadow Mage | HP-2, Speed+20, fixed weapon | Slightly different, NOT stronger |
| Golden Knife | Visual only | Zero power impact |
| Ghost Hunter | Visual only (title) | Zero power impact |
| Speed Demon | Visual only (title) | Zero power impact |
| Boss Slayer | Visual only (badge) | Zero power impact |
| Pacifist | +20% spawn distance for 10 seconds | Very minor positive, does not affect DPS or survivability after first 10 seconds |

**Conclusion:** No secret provides a meaningful power advantage. The strongest gameplay effect (pacifist's peaceful start) only affects the first 10 seconds when enemies are weakest anyway. Shadow Mage is a side-grade (trade HP for speed). All other secrets are cosmetic.

### 9.2 Discovery Difficulty Assessment

| Secret | Estimated Sessions to Discover | Intended Audience |
|--------|-------------------------------|-----------------|
| Shadow Mage | 40-60 (requires all 8 evolutions) | Completionist players |
| Golden Knife | 5-10 (requires dedicated knife-only run) | Challenge seekers |
| Ghost Hunter | 15-20 (requires ghost-heavy endless run) | Hunter-type players |
| Speed Demon | 10-20 (requires aggressive speedrun) | Speedrunners |
| Boss Slayer | 3-5 (5 Boss kills cumulative) | Regular players |
| Pacifist | 3-5 (requires deliberate passive start) | Pacifist/explorer players |

**Spread:** Each secret targets a different player archetype, ensuring broad appeal.

### 9.3 Community Engagement Prediction

- **Shadow Mage**: "How do you unlock the dark character?" -- Wiki/guide creation
- **Golden Knife**: "I saw someone with golden knives, how?" -- Social media sharing
- **Ghost Hunter/Speed Demon**: "What titles exist and how to get them?" -- Forum discussion
- **Boss Slayer/Pacifist badges**: "What does that icon mean?" -- In-person/stream curiosity
- The `???` display in Secrets panel with NO hints is intentional -- it drives community collaboration

---

## 10. Design Decisions

1. **6 secrets, not more**: Enough variety (4 types) to feel substantial, few enough that each discovery feels special. VS has 30+ secrets which can feel overwhelming; 6 is curated quality.

2. **No power-creep**: Every secret is either cosmetic or a side-grade. This is the most critical design constraint -- secrets should never feel mandatory. VS follows this principle (Gains Boros is fun, not required).

3. **Reuse achievement conditions**: speed_demon and pacifist share conditions with existing hidden achievements, reducing implementation complexity and creating a "double discovery" moment.

4. **Shadow Mage as ultimate reward**: Requiring all_evolutions (the grindiest achievement) gates this behind true completion. The variant is a side-grade, so it is a prestige reward, not a power reward.

5. **Golden Knife via knife-only challenge**: This is a natural "challenge run" that players already attempt for fun. Making it an official secret rewards self-imposed challenges.

6. **No hints for locked secrets**: The `???` display with zero information is intentional. This forces community discussion and wiki creation, which is the core value proposition of a Secrets system. If we showed hints, players would just "checklist" through them.

7. **Golden toast border vs achievement blue border**: Visual distinction ensures players immediately recognize "this is something special, not just an achievement."

8. **boss_slayer is cross-session cumulative**: This makes it the easiest secret to unlock passively, serving as a "first secret" for casual players and establishing the system's existence.

9. **Pacifist gives a gameplay bonus**: The +20% spawn distance for 10 seconds is thematically appropriate (peace = space) and just significant enough to be noticeable without affecting balance.

10. **Secret panel shares UI with Quest panel**: Reduced development cost. The golden border distinguishes it visually.

---

## 11. Future Expansion (v2.4+)

When the multi-stage system is implemented, additional stage-related secrets can be added:
- "Clear all 3 stages on Nightmare difficulty" -> Secret Stage variant (dark mode color scheme)
- "Kill 100 volcano enemies" -> "Flame Walker" title
- "Beat Shadow Knight without taking damage" -> "Shadow Master" badge

These are documented here for future reference but are NOT part of the current v2.3 scope.
