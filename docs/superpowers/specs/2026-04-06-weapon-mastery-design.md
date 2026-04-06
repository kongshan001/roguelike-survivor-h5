# v2.3 Weapon Mastery System Design Specification

> Drive #28+ | Designer Agent | 2026-04-06
> Status: Design specification complete, awaiting frontend implementation

---

## 1. Design Overview

### 1.1 Problem Statement

The current game has 8 base weapons, each with 3 levels of in-session upgrades, plus 8 evolution weapons. After 30-50 sessions, a player has tried every weapon multiple times. There is no long-term progression tied to individual weapons -- a player's first knife kill feels identical to their 500th. The shop's `weaponDmg` upgrade applies globally to all weapons, so there is no incentive to "main" a specific weapon.

Competitor analysis identifies DRG: Survivor's Weapon Mastery system as the most effective long-term retention mechanism in the survivor-like genre (rated 4/5 for retention impact in our research). However, it was also criticized as "too Grindy" -- requiring hundreds of kills per stage across 3 stages. Our design must capture the "I'm getting better with this weapon" feeling without the grind fatigue.

### 1.2 Design Goal

Introduce a Weapon Mastery system that:
- Tracks per-weapon usage across sessions (kills, damage dealt, time equipped)
- Awards permanent incremental bonuses at 3 mastery tiers per weapon
- Keeps total grind reasonable (15-30 sessions to master one weapon)
- Integrates with existing Save/Shop/Achievement systems
- Avoids power creep: mastery bonuses are meaningful but not dominant

### 1.3 Core Design Principles

1. **Cross-session accumulation**: Mastery progress persists across sessions via Save. Every session with a weapon makes progress, even failed ones.
2. **3 tiers per weapon**: Bronze / Silver / Gold, each requiring specific milestones. Not "kill 500 enemies" but contextual goals tied to each weapon's identity.
3. **Modest bonuses**: Each tier gives a small permanent bonus to that weapon. All 3 tiers combined are comparable to one shop upgrade level. Mastery does not replace the shop -- it complements it.
4. **Discovery-friendly**: The first tier is easy (1-3 sessions), giving immediate positive feedback. The second tier takes 5-10 sessions. The third tier is a long-term goal (15-30 sessions).
5. **Weapon identity**: Each weapon's mastery goals reflect its unique identity. Knife mastery rewards precision (high hit count). Blizzard mastery rewards CC duration. Boomerang mastery rewards return hits.

---

## 2. Mastery System Architecture

### 2.1 Tracking Data

Each weapon tracks 3 cumulative stats across sessions:

| Stat | Description | Tracked In |
|------|-------------|-----------|
| `kills` | Total enemies killed by this weapon | game.js (enemy death) |
| `timeEquipped` | Total seconds this weapon was equipped | game.js (per-frame dt accumulation) |
| `specialHits` | Weapon-specific special event count | weapon registry (per-weapon) |

### 2.2 Mastery Tiers

All 8 base weapons share the same 3-tier structure but with different thresholds:

| Tier | Name | Color | Icon | Threshold Pattern | Bonus Pattern |
|------|------|-------|------|-------------------|---------------|
| 1 | Bronze | `#cd7f32` | I | ~50 kills + ~3 min equipped | +5% damage |
| 2 | Silver | `#c0c0c0` | II | ~200 kills + ~10 min equipped | +10% damage + weapon-specific perk |
| 3 | Gold | `#ffd700` | III | ~500 kills + ~25 min equipped + special challenge | +15% damage + enhanced weapon-specific perk |

### 2.3 Why This Structure

- **Kill thresholds (50/200/500)**: At ~30 kills/session (average), Bronze takes ~2 sessions, Silver ~7 sessions, Gold ~17 sessions. This is far less grindy than DRG's 200/500/1000 per tier.
- **Time thresholds**: Prevents "farm low-level enemies" exploits. You must actually play with the weapon for meaningful time.
- **Special challenge at Gold**: Each weapon has a unique Gold-tier requirement that tests mastery of that weapon's mechanics. This is the "skill gate" that makes mastery feel earned, not just time-invested.

---

## 3. Per-Weapon Mastery Specifications

### 3.1 Weapon Mastery Table

| Weapon | Bronze (50 kills, 3min) | Silver (200 kills, 10min) | Gold (500 kills, 25min, +special) | Silver Perk | Gold Perk (enhanced) |
|--------|------------------------|--------------------------|----------------------------------|-------------|---------------------|
| HolyWater | +5% dmg | +10% dmg, +8% orb speed | +15% dmg, orb count +1 (base) | Orbs rotate 8% faster | +1 orb even at Lv1 (2 orbs) |
| Knife | +5% dmg | +10% dmg, +10% projectile speed | +15% dmg, pierce +1 (all levels), 100 one-target kills | Knives fly 10% faster | All levels gain +1 pierce |
| Lightning | +5% dmg | +10% dmg, +1 chain | +15% dmg, +2 chains, 50 multi-kills (2+ enemies hit within 0.5s) | Lightning chains +1 | Lightning chains +2 total |
| Bible | +5% dmg | +10% dmg, +10% range | +15% dmg, +15% range, 200 close-range kills (enemy within 50px) | Bible range +10% | Bible range +15% |
| FireStaff | +5% dmg | +10% dmg, burn duration +0.5s | +15% dmg, burn duration +1s, 300 burn kills (enemy dies while burning) | Burn lasts 0.5s longer | Burn lasts 1s longer |
| FrostAura | +5% dmg | +10% dmg, freeze chance +3%/s | +15% dmg, freeze chance +5%/s, 100 freeze kills (enemy dies while frozen) | Freeze chance +3%/s | Freeze chance +5%/s |
| Boomerang | +5% dmg | +10% dmg, +15% tracking angle | +15% dmg, +25% tracking angle, 200 return hits (hit on return flight) | Track angle +15% | Track angle +25% |
| PoisonMist* | +5% dmg | +10% dmg, max stacks +1 | +15% dmg, max stacks +2, 200 max-stack kills (kill at max stacks) | Max poison stacks +1 | Max poison stacks +2 |

*PoisonMist mastery is designed but will be active once the weapon is implemented.

### 3.2 Special Challenge Definitions

| Weapon | Gold Special Challenge | Counter Name | Description |
|--------|----------------------|--------------|-------------|
| HolyWater | N/A (time-based only) | - | HolyWater has no special challenge; it's the "accessible" mastery |
| Knife | `oneTargetKills: 100` | knife_oneTarget | Kill 100 enemies that were the only enemy within 100px radius (isolated targets = precision) |
| Lightning | `multiKills: 50` | lightning_multi | Hit 2+ enemies with the same lightning strike 50 times (chain mastery) |
| Bible | `closeKills: 200` | bible_close | Kill 200 enemies within 50px of the player (close-range danger play) |
| FireStaff | `burnKills: 300` | firestaff_burn | Kill 300 enemies while they are actively burning (DOT mastery) |
| FrostAura | `freezeKills: 100` | frost_freeze | Kill 100 enemies while they are frozen (CC timing mastery) |
| Boomerang | `returnHits: 200` | boomerang_return | Hit 200 enemies with boomerang return flight (positioning mastery) |
| PoisonMist | `maxStackKills: 200` | poison_maxStack | Kill 200 enemies at max poison stacks (sustained DPS mastery) |

### 3.3 Mastery Bonus Mechanics

Mastery bonuses are **permanent** and **applied automatically** when the weapon is equipped:

```
weaponDamage = baseDmg * (game.weaponDmgMul || 1) * (1 + masteryDmgBonus)
```

- `masteryDmgBonus` = 0.05 (Bronze) / 0.15 (Silver) / 0.30 (Gold)
- Weapon-specific perks are applied as additional modifiers in the weapon's update logic
- Mastery bonuses stack with shop `weaponDmg` (multiplicative, not additive)
- Mastery bonuses apply to BOTH base and evolved forms of the weapon

---

## 4. CFG Constants

```js
// ===== CFG.WEAPON_MASTERY 新增 =====
WEAPON_MASTERY: {
  weapons: {
    holywater: {
      tiers: [
        { name: 'Bronze', color: '#cd7f32', kills: 50, time: 180, dmgBonus: 0.05 },
        { name: 'Silver', color: '#c0c0c0', kills: 200, time: 600, dmgBonus: 0.10, perk: { orbSpeedMul: 1.08 } },
        { name: 'Gold',   color: '#ffd700', kills: 500, time: 1500, dmgBonus: 0.15, perk: { orbSpeedMul: 1.08, extraOrb: 1 } },
      ]
    },
    knife: {
      tiers: [
        { name: 'Bronze', color: '#cd7f32', kills: 50, time: 180, dmgBonus: 0.05 },
        { name: 'Silver', color: '#c0c0c0', kills: 200, time: 600, dmgBonus: 0.10, perk: { projSpeedMul: 1.10 } },
        { name: 'Gold',   color: '#ffd700', kills: 500, time: 1500, dmgBonus: 0.15, perk: { projSpeedMul: 1.10, pierceBonus: 1 }, special: { oneTargetKills: 100 } },
      ]
    },
    lightning: {
      tiers: [
        { name: 'Bronze', color: '#cd7f32', kills: 50, time: 180, dmgBonus: 0.05 },
        { name: 'Silver', color: '#c0c0c0', kills: 200, time: 600, dmgBonus: 0.10, perk: { extraChains: 1 } },
        { name: 'Gold',   color: '#ffd700', kills: 500, time: 1500, dmgBonus: 0.15, perk: { extraChains: 2 }, special: { multiKills: 50 } },
      ]
    },
    bible: {
      tiers: [
        { name: 'Bronze', color: '#cd7f32', kills: 50, time: 180, dmgBonus: 0.05 },
        { name: 'Silver', color: '#c0c0c0', kills: 200, time: 600, dmgBonus: 0.10, perk: { radiusMul: 1.10 } },
        { name: 'Gold',   color: '#ffd700', kills: 500, time: 1500, dmgBonus: 0.15, perk: { radiusMul: 1.15 }, special: { closeKills: 200 } },
      ]
    },
    firestaff: {
      tiers: [
        { name: 'Bronze', color: '#cd7f32', kills: 50, time: 180, dmgBonus: 0.05 },
        { name: 'Silver', color: '#c0c0c0', kills: 200, time: 600, dmgBonus: 0.10, perk: { burnDurBonus: 0.5 } },
        { name: 'Gold',   color: '#ffd700', kills: 500, time: 1500, dmgBonus: 0.15, perk: { burnDurBonus: 1.0 }, special: { burnKills: 300 } },
      ]
    },
    frostaura: {
      tiers: [
        { name: 'Bronze', color: '#cd7f32', kills: 50, time: 180, dmgBonus: 0.05 },
        { name: 'Silver', color: '#c0c0c0', kills: 200, time: 600, dmgBonus: 0.10, perk: { freezeBonus: 0.03 } },
        { name: 'Gold',   color: '#ffd700', kills: 500, time: 1500, dmgBonus: 0.15, perk: { freezeBonus: 0.05 }, special: { freezeKills: 100 } },
      ]
    },
    boomerang: {
      tiers: [
        { name: 'Bronze', color: '#cd7f32', kills: 50, time: 180, dmgBonus: 0.05 },
        { name: 'Silver', color: '#c0c0c0', kills: 200, time: 600, dmgBonus: 0.10, perk: { trackAngleMul: 1.15 } },
        { name: 'Gold',   color: '#ffd700', kills: 500, time: 1500, dmgBonus: 0.15, perk: { trackAngleMul: 1.25 }, special: { returnHits: 200 } },
      ]
    },
    poisonmist: {
      tiers: [
        { name: 'Bronze', color: '#cd7f32', kills: 50, time: 180, dmgBonus: 0.05 },
        { name: 'Silver', color: '#c0c0c0', kills: 200, time: 600, dmgBonus: 0.10, perk: { maxStackBonus: 1 } },
        { name: 'Gold',   color: '#ffd700', kills: 500, time: 1500, dmgBonus: 0.15, perk: { maxStackBonus: 2 }, special: { maxStackKills: 200 } },
      ]
    },
  }
}
```

---

## 5. Save System Extension

### 5.1 Save._default() New Fields

```js
// Save._default() 新增
weaponMastery: {
  holywater:  { kills: 0, time: 0, tier: 0, specials: {} },
  knife:      { kills: 0, time: 0, tier: 0, specials: {} },
  lightning:  { kills: 0, time: 0, tier: 0, specials: {} },
  bible:      { kills: 0, time: 0, tier: 0, specials: {} },
  firestaff:  { kills: 0, time: 0, tier: 0, specials: {} },
  frostaura:  { kills: 0, time: 0, tier: 0, specials: {} },
  boomerang:  { kills: 0, time: 0, tier: 0, specials: {} },
  poisonmist: { kills: 0, time: 0, tier: 0, specials: {} },
}
```

### 5.2 Session Tracking (game.js)

Each frame, for each equipped weapon:

```js
// Per-frame tracking
for (const w of player.weapons) {
  if (w.name && !w.evolved) {  // Only track base weapons
    sessionMastery[w.name].time += dt;
  }
}
```

On enemy kill, credit the killing weapon:

```js
// In enemy death logic
if (killingWeapon && !killingWeapon.evolved) {
  const baseName = killingWeapon.name;  // or map evolved -> base
  sessionMastery[baseName].kills++;
}
```

On session end, merge session data into Save:

```js
// In endGame()
const d = Save.load();
for (const [weapon, sessData] of Object.entries(sessionMastery)) {
  if (!d.weaponMastery[weapon]) d.weaponMastery[weapon] = { kills:0, time:0, tier:0, specials:{} };
  d.weaponMastery[weapon].kills += sessData.kills;
  d.weaponMastery[weapon].time += sessData.time;
  // Merge specials
  for (const [key, val] of Object.entries(sessData.specials || {})) {
    d.weaponMastery[weapon].specials[key] = (d.weaponMastery[weapon].specials[key] || 0) + val;
  }
  // Check tier promotion
  d.weaponMastery[weapon].tier = Save.checkMasteryTier(weapon, d.weaponMastery[weapon]);
}
Save.save(d);
```

### 5.3 Mastery Tier Check

```js
Save.checkMasteryTier(weaponId, mData) {
  const tiers = CFG.WEAPON_MASTERY.weapons[weaponId].tiers;
  let achieved = 0;
  for (let i = 0; i < tiers.length; i++) {
    const t = tiers[i];
    if (mData.kills >= t.kills && mData.time >= t.time) {
      if (t.special) {
        // Check special requirements
        let specialMet = true;
        for (const [key, target] of Object.entries(t.special)) {
          if ((mData.specials[key] || 0) < target) { specialMet = false; break; }
        }
        if (specialMet) achieved = i + 1;
      } else {
        achieved = i + 1;
      }
    }
  }
  return achieved;
}
```

### 5.4 Mastery Bonus Application

```js
// In beginGame() or weapon construction
function getMasteryBonus(weaponId) {
  const d = Save.load();
  const m = d.weaponMastery && d.weaponMastery[weaponId];
  if (!m) return { dmgBonus: 0, perks: {} };
  const tiers = CFG.WEAPON_MASTERY.weapons[weaponId].tiers;
  let dmgBonus = 0;
  let perks = {};
  for (let i = 0; i < Math.min(m.tier, tiers.length); i++) {
    dmgBonus += tiers[i].dmgBonus;
    if (tiers[i].perk) Object.assign(perks, tiers[i].perk);
  }
  return { dmgBonus, perks };
}

// In Weapon.applyDmg()
applyDmg(base) {
  const shopMul = (window.game && window.game.weaponDmgMul) || 1;
  const mastery = this.masteryBonus || { dmgBonus: 0 };
  return base * shopMul * (1 + mastery.dmgBonus);
}
```

---

## 6. UI Design

### 6.1 Mastery Panel (New Tab in Skill Panel)

The existing skill-panel.js already shows weapon details. Add a "Mastery" tab:

| Element | Description |
|---------|-------------|
| Weapon list | 8 base weapons, each showing current tier icon + name |
| Tier progress bar | Shows kills progress (current/next tier threshold) |
| Tier name + color | Bronze/Silver/Gold with corresponding color |
| Perk preview | "Next tier: +10% damage, +8% orb speed" |
| Special challenge | Gold tier only: "Return hits: 87/200" |
| Total mastery stats | "Kills: 347 | Time: 12:30 | Tier: Silver II" |

### 6.2 In-Game HUD Enhancement

When a weapon reaches a new mastery tier during gameplay:
- Gold toast notification: "HolyWater mastery: Silver II!"
- The weapon slot in HUD flashes with the tier color briefly (0.5s)

### 6.3 Title Screen Integration

- The existing skill panel button now includes a "Mastery" tab
- Mastery progress is visible from the title screen without entering a game

---

## 7. Achievement Integration

### 7.1 New Achievements

Add 2 mastery-related achievements to CFG.ACHIEVEMENTS:

```js
mastery_first:  { name:'First Mastery', icon:'I', desc:'Reach Bronze tier with any weapon', type:'flag', reward:50 },
mastery_gold:   { name:'Weapon Grandmaster', icon:'III', desc:'Reach Gold tier with any weapon', type:'flag', reward:200 },
mastery_all:    { name:'Master of Arms', icon:'III', desc:'Reach Gold tier with all 8 base weapons', type:'multi', reward:500,
  parts: ['mastery_gold_holywater','mastery_gold_knife','mastery_gold_lightning','mastery_gold_bible',
          'mastery_gold_firestaff','mastery_gold_frostaura','mastery_gold_boomerang','mastery_gold_poisonmist'] },
```

### 7.2 Achievement Flag Triggers

In Save.checkMasteryTier, when tier changes:
- If first weapon reaches Bronze: `achieveFlag('mastery_first')`
- If first weapon reaches Gold: `achieveFlag('mastery_gold')`
- Each individual weapon reaching Gold: `achieveFlag('mastery_gold_{weaponId}')`

---

## 8. Balance Analysis

### 8.1 Power Budget

| Source | Damage Bonus | Scope | Persistence |
|--------|-------------|-------|-------------|
| Shop weaponDmg Lv3 | +10% (x1.10) | All weapons | Permanent |
| Mastery Bronze | +5% (x1.05) | One weapon | Permanent |
| Mastery Silver | +15% cumulative (x1.15) | One weapon | Permanent |
| Mastery Gold | +30% cumulative (x1.30) | One weapon | Permanent |
| Shop + Gold Mastery | x1.10 * x1.30 = x1.43 | One weapon | Permanent |

**Analysis**: A fully mastered weapon with shop Lv3 deals 43% more damage than base. This is meaningful but not dominant -- it takes 15-30 sessions to achieve. A player with no mastery and shop Lv3 still deals 10% more with all weapons. The mastery system rewards weapon loyalty without making unmastered weapons useless.

### 8.2 Weapon-Specific Perk Balance

| Weapon | Silver Perk Impact | Gold Perk Impact | Balance Assessment |
|--------|-------------------|-----------------|-------------------|
| HolyWater | +8% orb speed = ~8% more hits/s | +1 orb at Lv1 (2 instead of 1) | Moderate: early game boost, irrelevant at Lv3 (already 3 orbs) |
| Knife | +10% proj speed = faster reach | +1 pierce all levels | Strong: pierce is knife's core limitation, +1 is meaningful |
| Lightning | +1 chain = more targets | +2 chains total | Moderate: chain bonus is lightning's identity, rewards investment |
| Bible | +10% range = more coverage | +15% range | Moderate: bible is already large, range bonus is convenience |
| FireStaff | +0.5s burn = more DOT ticks | +1.0s burn | Moderate: DOT extension means more total burn damage |
| FrostAura | +3% freeze chance | +5% freeze chance | Moderate: CC improvement matches frost identity |
| Boomerang | +15% tracking = more reliable | +25% tracking | Moderate: tracking is boomerang's core, rewards mastery |
| PoisonMist | +1 max stack = higher DPS ceiling | +2 max stacks | Moderate: stack ceiling directly increases DPS potential |

**Conclusion**: All perks are moderate and weapon-appropriate. None create a situation where mastered + unmastered weapons diverge by more than ~50% effective DPS.

### 8.3 Session Economy Impact

Mastery bonuses increase kill speed, which increases gold and experience income. At Gold tier with one weapon:

- Kill speed increase: ~30% (damage) + perk effect
- Gold per session increase: ~20-30% (faster kills = more kills)
- Experience per session increase: ~20-30%
- Soul fragments per session increase: ~20-30%

This is acceptable -- a player who has invested 15-30 sessions into one weapon deserves a modest efficiency improvement. It does not break the shop economy (which takes ~3 sessions to fill at current rates).

---

## 9. Implementation Points

| # | File | Change | Est. Lines |
|---|------|--------|-----------|
| 1 | config.js | CFG.WEAPON_MASTERY full config | ~60 |
| 2 | config.js | CFG.ACHIEVEMENTS: 3 new mastery achievements | ~10 |
| 3 | save.js | weaponMastery field in _default() | ~10 |
| 4 | save.js | Migration for old saves | ~3 |
| 5 | save.js | checkMasteryTier() method | ~20 |
| 6 | save.js | updateMastery() merge session data | ~20 |
| 7 | save.js | getMasteryBonus() for beginGame | ~15 |
| 8 | game.js | sessionMastery tracking per frame | ~10 |
| 9 | game.js | Weapon kill credit in enemy death | ~8 |
| 10 | game.js | endGame() mastery merge + toast | ~15 |
| 11 | game.js | beginGame() apply mastery to weapons | ~10 |
| 12 | registry.js | Weapon.applyDmg() include mastery bonus | ~3 |
| 13 | registry.js | Per-weapon special tracking (return hits, burn kills, etc.) | ~25 |
| 14 | skill-panel.js | Mastery tab UI | ~40 |
| 15 | scenes.js | Mastery toast on tier up | ~10 |
| **Total** | **15 files** | | **~259 lines** |

---

## 10. Design Decisions

### 10.1 Decision Log

1. **3 tiers (Bronze/Silver/Gold) rather than 5 or more**: DRG: Survivor uses 3 tiers. This is the "sweet spot" -- enough progression to feel meaningful, not so many that it feels like an endless grind. Each tier has a distinct color and identity.

2. **Kill thresholds 50/200/500**: At average 30 kills/session, Bronze takes ~2 sessions, Silver ~7, Gold ~17. This is intentionally less grindy than DRG's 200/500/1000. Players should reach Bronze in their first 2-3 sessions with a weapon (immediate reward), and Gold within 2-3 weeks of regular play.

3. **Special challenge only at Gold tier**: Silver is achievable through normal play (kills + time). Gold requires intentional skill -- hitting enemies on return flight, killing frozen enemies, etc. This makes Gold feel "earned" rather than "ground."

4. **Mastery bonuses apply to evolved forms**: If you master Knife, FireKnife also benefits. This is important because evolved weapons are the endgame -- if mastery only applied to base forms, it would feel useless in the second half of a session.

5. **Mastery damage is multiplicative with shop weaponDmg**: `base * shopMul * (1 + mastery)`. This means shop upgrades and mastery are independently valuable. If they were additive, the combination would be weaker and feel less impactful.

6. **No mastery for evolved weapons**: Only 8 base weapons have mastery tracks. Evolved weapons inherit their base weapon's mastery. This keeps the system at 8 tracks (manageable) rather than 16 (overwhelming).

7. **Time tracking prevents "cheese" strategies**: Without time tracking, a player could kill 500 low-HP bats in a single endless session. The time requirement (25 min total for Gold) means the player must genuinely use the weapon across multiple sessions.

8. **HolyWater has no special challenge**: It is the "accessible" weapon. Its Gold tier is purely kill + time based, making it the easiest to master. This is intentional -- new players often start with HolyWater, and early mastery success encourages continued engagement.

9. **Mastery UI is a tab in skill-panel, not a new panel**: The skill panel already shows weapon details. Adding a "Mastery" tab reuses existing UI patterns and keeps the interface count low.

10. **PoisonMist mastery is pre-designed**: Even though PoisonMist is not yet implemented, its mastery track is designed alongside the others. This ensures consistency when the weapon is added, and the Save structure is ready.

11. **No mastery reset option**: Once earned, mastery is permanent. This matches the game's philosophy of permanent progression (shop upgrades, achievements, etc.).

---

## 11. Future Expansion

- **v2.4+**: When new base weapons are added, their mastery tracks follow the same pattern (50/200/500 kills + weapon-specific special).
- **v2.4+**: Pet/Companion system could have its own mastery tracks (following the same Save structure).
- **v2.5+**: "Prestige" system -- after Gold on all 8 weapons, reset all mastery for a cosmetic reward + 5% global damage bonus. This is a potential endgame goal for hardcore players.
