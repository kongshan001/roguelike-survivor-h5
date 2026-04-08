(() => {
  // src/core/config.js
  var CFG = {
    MAP_W: 2400,
    MAP_H: 2400,
    GAME_TIME: 300,
    PLAYER_SPEED: 160,
    PLAYER_HP: 8,
    PLAYER_SIZE: 16,
    PICKUP_RANGE: 35,
    GEM_FLY_SPEED: 250,
    INVINCIBLE_TIME: 1,
    GOLD: {
      perKill: 3,
      gemToGold: true
    },
    MAX_ENEMIES: 70,
    MAX_BULLETS: 100,
    EXP_TABLE: [0, 8, 12, 18, 24, 32, 42, 55, 70, 88, 108, 132, 160, 195, 240],
    ENEMY_TYPES: {
      zombie: { w: 16, h: 16, hp: 3, speed: 40, dmg: 1, color: "#4caf50" },
      bat: { w: 14, h: 14, hp: 1, speed: 80, dmg: 1, color: "#ab47bc" },
      skeleton: { w: 14, h: 14, hp: 5, speed: 20, dmg: 1, color: "#e0e0e0", ranged: true, shootCD: 2 },
      elite_skeleton: { w: 18, h: 18, hp: 12, speed: 15, dmg: 2, color: "#b71c1c", ranged: true, shootCD: 1.2, elite: true },
      boss: { w: 32, h: 32, hp: 200, speed: 30, dmg: 2, color: "#f44336", isBoss: true },
      ghost: { w: 12, h: 12, hp: 2, speed: 55, dmg: 1, color: "#b0bec5", phaseShift: true, teleport: true },
      splitter: { w: 16, h: 16, hp: 4, speed: 50, dmg: 1, color: "#00897b", splitter: true },
      splitter_small: { w: 8, h: 8, hp: 1, speed: 70, dmg: 1, color: "#4db6ac", isChild: true }
    },
    WEAPONS: {
      holywater: { name: "\u5723\u6C34", icon: "\u{1F4A7}", desc: "\u73AF\u7ED5\u65CB\u8F6C" },
      knife: { name: "\u98DE\u5200", icon: "\u{1F5E1}", desc: "\u81EA\u52A8\u6295\u63B7" },
      lightning: { name: "\u95EA\u7535", icon: "\u26A1", desc: "\u968F\u673A\u7535\u51FB" },
      bible: { name: "\u5723\u7ECF", icon: "\u{1F4D6}", desc: "\u8303\u56F4\u65CB\u8F6C" },
      firestaff: { name: "\u706B\u7130\u6CD5\u6756", icon: "\u{1F525}", desc: "\u9525\u5F62\u706B\u7130" },
      frostaura: { name: "\u51B0\u51BB\u5149\u73AF", icon: "\u2744\uFE0F", desc: "\u8303\u56F4\u51CF\u901F" },
      boomerang: { name: "\u56DE\u65CB\u9556", icon: "\u{1FA83}", desc: "\u8FFD\u8E2A\u56DE\u65CB" },
      blizzard: { name: "\u66B4\u98CE\u96EA", icon: "\u2744\uFE0F\u26A1", desc: "\u5927\u8303\u56F4\u66B4\u98CE\u96EA+\u95EA\u7535\u94FE", evolved: true },
      thunderholywater: { name: "\u96F7\u66B4\u5723\u6C34", icon: "\u26A1\u{1F4A7}", desc: "\u65CB\u8F6C+\u94FE\u5F0F\u95EA\u7535", evolved: true },
      fireknife: { name: "\u706B\u7130\u98DE\u5200", icon: "\u{1F525}\u{1F5E1}", desc: "\u71C3\u70E7\u7A7F\u900F\u98DE\u5200", evolved: true },
      holydomain: { name: "\u5723\u5149\u9886\u57DF", icon: "\u{1F4D6}\u{1F4A7}", desc: "\u8D85\u5927\u8303\u56F4+\u5723\u5149\u8109\u51B2", evolved: true },
      frostknife: { name: "\u51B0\u971C\u98DE\u5200", icon: "\u2744\uFE0F\u{1F5E1}", desc: "\u51CF\u901F\u7A7F\u900F\u98DE\u5200", evolved: true },
      flamebible: { name: "\u70C8\u7130\u7ECF\u6587", icon: "\u{1F525}\u{1F4D6}", desc: "\u65CB\u8F6C\u707C\u70E7+\u706B\u7130\u8109\u51B2", evolved: true },
      thunderang: { name: "\u96F7\u9706\u56DE\u65CB", icon: "\u{1FA83}\u26A1", desc: "\u8FFD\u8E2A+\u95EA\u7535\u94FE", evolved: true },
      blazerang: { name: "\u70C8\u7130\u56DE\u65CB", icon: "\u{1FA83}\u{1F525}", desc: "\u8FFD\u8E2A+\u706B\u7130\u8F68\u8FF9", evolved: true }
    },
    EVOLUTIONS: [
      { a: "holywater", b: "lightning", result: "thunderholywater", name: "\u96F7\u66B4\u5723\u6C34", icon: "\u26A1\u{1F4A7}", desc: "\u65CB\u8F6C+\u94FE\u5F0F\u95EA\u7535" },
      { a: "knife", b: "firestaff", result: "fireknife", name: "\u706B\u7130\u98DE\u5200", icon: "\u{1F525}\u{1F5E1}", desc: "\u71C3\u70E7\u7A7F\u900F\u98DE\u5200" },
      { a: "bible", b: "holywater", result: "holydomain", name: "\u5723\u5149\u9886\u57DF", icon: "\u{1F4D6}\u{1F4A7}", desc: "\u8D85\u5927\u8303\u56F4+\u5723\u5149\u8109\u51B2" },
      { a: "frostaura", b: "lightning", result: "blizzard", name: "\u66B4\u98CE\u96EA", icon: "\u2744\uFE0F\u26A1", desc: "\u5927\u8303\u56F4\u66B4\u98CE\u96EA+\u95EA\u7535\u94FE" },
      { a: "knife", b: "frostaura", result: "frostknife", name: "\u51B0\u971C\u98DE\u5200", icon: "\u2744\uFE0F\u{1F5E1}", desc: "\u51CF\u901F\u7A7F\u900F\u98DE\u5200" },
      { a: "bible", b: "firestaff", result: "flamebible", name: "\u70C8\u7130\u7ECF\u6587", icon: "\u{1F525}\u{1F4D6}", desc: "\u65CB\u8F6C\u707C\u70E7+\u706B\u7130\u8109\u51B2" },
      { a: "boomerang", b: "lightning", result: "thunderang", name: "\u96F7\u9706\u56DE\u65CB", icon: "\u{1FA83}\u26A1", desc: "\u8FFD\u8E2A+\u95EA\u7535\u94FE" },
      { a: "boomerang", b: "firestaff", result: "blazerang", name: "\u70C8\u7130\u56DE\u65CB", icon: "\u{1FA83}\u{1F525}", desc: "\u8FFD\u8E2A+\u706B\u7130\u8F68\u8FF9" }
    ],
    PASSIVES: {
      speedboots: { name: "\u75BE\u98CE\u9774", icon: "\u{1F462}", desc: "\u79FB\u52A8\u901F\u5EA6+15%", maxStack: 3 },
      armor: { name: "\u62A4\u7532", icon: "\u{1F6E1}", desc: "\u53D7\u4F24\u51CF\u5C11+1", maxStack: 3 },
      magnet: { name: "\u78C1\u94C1", icon: "\u{1F9F2}", desc: "\u7ECF\u9A8C\u83B7\u53D6+30%", maxStack: 3 },
      crit: { name: "\u66B4\u51FB\u6212\u6307", icon: "\u{1F48D}", desc: "\u66B4\u51FB\u7387+8%", maxStack: 3 },
      maxhp: { name: "\u751F\u547D\u7ED3\u6676", icon: "\u2764\uFE0F", desc: "\u6700\u5927HP+2", maxStack: 3 },
      regen: { name: "\u518D\u751F\u62A4\u7B26", icon: "\u267B\uFE0F", desc: "\u6BCF5\u79D2\u56DE\u590D1HP", maxStack: 3 },
      luckycoin: {
        name: "\u5E78\u8FD0\u786C\u5E01",
        icon: "\u{1FA99}",
        desc: "\u66B4\u51FB\u4F24\u5BB3+50%\uFF0C\u91D1\u5E01+15%",
        maxStack: 3,
        critDmgBonus: 0.5,
        goldDropBonus: 0.15
      }
    },
    FOOD: {
      dropRate: 0.1,
      healAmount: 1,
      maxFood: 8,
      lifetime: 15,
      bossDropCount: 3,
      types: {
        zombie: { icon: "\u{1F356}", color: "#8d6e63" },
        bat: { icon: "\u{1F347}", color: "#ab47bc" },
        skeleton: { icon: "\u{1F9C0}", color: "#ffd54f" },
        boss: { icon: "\u{1F356}", color: "#8d6e63" },
        ghost: { icon: "\u{1F35E}", color: "#e0e0e0" },
        elite_skeleton: { icon: "\u{1F9C0}", color: "#ffd54f" },
        splitter: { icon: "\u{1F356}", color: "#8d6e63" }
      }
    },
    CHEST: {
      cost: 20,
      spawnInterval: 90,
      maxChests: 2,
      spawnMinRange: 300,
      spawnMaxRange: 500,
      pickupRange: 30,
      rewards: [
        { type: "heal", icon: "\u{1F48A}", value: 3, desc: "\u56DE\u590D3HP" },
        { type: "speed", icon: "\u26A1", value: 0.5, duration: 10, desc: "\u79FB\u901F+50% 10\u79D2" },
        { type: "exp", icon: "\u{1F48E}", value: 20, desc: "+20\u7ECF\u9A8C" }
      ]
    },
    COMBO: {
      timeout: 3,
      expBonusRate: 0.05,
      maxBonus: 0.5,
      goldThreshold: 5,
      milestones: [5, 10, 20, 50]
    },
    SCREEN_SHAKE: {
      kill: { intensity: 2, duration: 0.08 },
      killBig: { intensity: 4, duration: 0.12 },
      hurt: { intensity: 6, duration: 0.15 },
      boss: { intensity: 8, duration: 0.3 },
      combo5: { intensity: 3, duration: 0.1 },
      combo10: { intensity: 5, duration: 0.15 },
      combo20: { intensity: 7, duration: 0.2 },
      combo50: { intensity: 10, duration: 0.25 }
    },
    DIFFICULTY: {
      easy: {
        name: "\u4F11\u95F2",
        icon: "\u{1F33F}",
        desc: "\u654C\u4EBA\u66F4\u5F31\uFF0C\u9002\u5408\u65B0\u624B",
        color: "#66bb6a",
        playerHpMul: 1.25,
        playerSpeedMul: 1,
        enemyHpMul: 0.7,
        enemySpeedMul: 0.8,
        enemyDmgMul: 0.75,
        spawnIntervalMul: 1.4,
        spawnCountMod: -1,
        bossHpMul: 0.6,
        bossSpeedMul: 0.8,
        expMul: 1.3,
        foodDropMul: 1.5
      },
      normal: {
        name: "\u6807\u51C6",
        icon: "\u2694\uFE0F",
        desc: "\u6807\u51C6\u96BE\u5EA6\uFF0C\u5E73\u8861\u4F53\u9A8C",
        color: "#ffd54f",
        playerHpMul: 1,
        playerSpeedMul: 1,
        enemyHpMul: 1,
        enemySpeedMul: 1,
        enemyDmgMul: 1,
        spawnIntervalMul: 1,
        spawnCountMod: 0,
        bossHpMul: 1,
        bossSpeedMul: 1,
        expMul: 1,
        foodDropMul: 1
      },
      endless: {
        name: "\u65E0\u5C3D",
        icon: "\u267E",
        desc: "\u51FB\u8D25Boss\u540E\u89E3\u9501\uFF0C\u6C38\u65E0\u6B62\u5883",
        color: "#ce93d8",
        playerHpMul: 1,
        playerSpeedMul: 1,
        enemyHpMul: 1,
        enemySpeedMul: 1,
        enemyDmgMul: 1,
        spawnIntervalMul: 1,
        spawnCountMod: 0,
        bossHpMul: 1,
        bossSpeedMul: 1,
        expMul: 1,
        foodDropMul: 1
      },
      hard: {
        name: "\u5669\u68A6",
        icon: "\u{1F480}",
        desc: "\u6781\u9650\u6311\u6218\uFF0C\u771F\u6B63\u7684\u8003\u9A8C",
        color: "#ef5350",
        playerHpMul: 0.75,
        playerSpeedMul: 0.9,
        enemyHpMul: 1.5,
        enemySpeedMul: 1.3,
        enemyDmgMul: 1.5,
        spawnIntervalMul: 0.7,
        spawnCountMod: 1,
        bossHpMul: 2,
        bossSpeedMul: 1.3,
        expMul: 0.8,
        foodDropMul: 0.6
      }
    },
    DASH: {
      distance: 80,
      duration: 0.15,
      speedMult: 3,
      cooldown: 2.5,
      afterimages: 3
    },
    HUD_WEAPONS: {
      slotSize: 32,
      gap: 4,
      bottomOffset: 24,
      maxWeapons: 6,
      maxPassives: 6
    },
    SAVE: {
      key: "roguelike_survivor_save",
      version: 1
    },
    CHARACTERS: {
      mage: { name: "\u9B54\u6CD5\u5E08", icon: "\u{1F9D9}", hp: 8, speed: 160, desc: "\u5747\u8861\u578B\uFF0C\u81EA\u9009\u521D\u59CB\u6B66\u5668", chooseWeapon: true, colors: { hat: "#1a237e", body: "#1565c0", skin: "#ffe0b2", staff: "#795548", gem: "#ffd54f" } },
      warrior: { name: "\u6218\u58EB", icon: "\u{1F6E1}", hp: 12, speed: 140, desc: "\u9AD8\u8840\u91CF\u5766\u514B\uFF0C\u521D\u59CB\u98DE\u5200", startWeapon: "knife", colors: { hat: "#b71c1c", body: "#d32f2f", skin: "#ffe0b2", sword: "#9e9e9e", hilt: "#5d4037" } },
      ranger: { name: "\u6E38\u4FA0", icon: "\u{1F3F9}", hp: 6, speed: 190, desc: "\u9AD8\u901F\u4F4E\u8840\uFF0C\u521D\u59CB\u5723\u6C34", startWeapon: "holywater", colors: { hood: "#1b5e20", body: "#2e7d32", skin: "#ffe0b2", bow: "#795548", string: "#bdbdbd" } }
    },
    WAVE_PROGRESS: {
      stages: [
        { time: 0, name: "\u5F00\u5C40", icon: "\u{1F7E2}", color: "#4caf50", enemies: ["\u50F5\u5C38"] },
        { time: 120, name: "\u4E2D\u671F", icon: "\u{1F7E1}", color: "#ffd54f", enemies: ["\u8759\u8760"] },
        { time: 180, name: "\u540E\u671F", icon: "\u{1F7E0}", color: "#ff9100", enemies: ["\u9AB7\u9AC5", "\u5E7D\u7075"] },
        { time: 210, name: "\u7CBE\u82F1\u671F", icon: "\u{1F534}", color: "#ef5350", enemies: ["\u7CBE\u82F1\u9AB7\u9AC5"] },
        { time: 270, name: "Boss\u671F", icon: "\u{1F480}", color: "#ff1744", enemies: ["\u{1F480} Boss!"] }
      ],
      warningTime: 15,
      toastDuration: 2.5,
      barHeight: 4
    },
    SYNERGIES: {
      // 被动+被动
      crit_boots: {
        name: "\u98CE\u4E4B\u950B\u5203",
        icon: "\u{1F52A}",
        req: { passives: ["crit", "speedboots"] },
        desc: "\u66B4\u51FB\u65F6\u53D1\u5C04\u98DE\u5200",
        onCritKnife: { dmgMul: 0.5, speed: 250, life: 1 }
      },
      armor_maxhp: {
        name: "\u94C1\u58C1\u4E4B\u5FC3",
        icon: "\u{1F6E1}",
        req: { passives: ["armor", "maxhp"] },
        desc: "\u62A4\u7532\u6548\u679C\u7FFB\u500D",
        armorDouble: true
      },
      magnet_crit: {
        name: "\u8D2A\u5A6A\u4E4B\u9B42",
        icon: "\u{1F48E}",
        req: { passives: ["magnet", "crit"] },
        desc: "\u66B4\u51FB\u989D\u5916\u6389\u843D\u5B9D\u77F3",
        bonusGemValue: 2
      },
      boots_regen: {
        name: "\u751F\u547D\u5954\u6D41",
        icon: "\u{1F3C3}",
        req: { passives: ["speedboots", "regen"] },
        desc: "\u79FB\u52A8\u65F6\u518D\u751F\u901F\u5EA6\u7FFB\u500D",
        movingRegenSpeedMul: 2
      },
      armor_regen: {
        name: "\u94A2\u94C1\u5821\u5792",
        icon: "\u{1F4AA}",
        req: { passives: ["armor", "regen"] },
        desc: "\u4F4EHP\u65F6\u62A4\u7532+3",
        lowHpThreshold: 0.3,
        tempArmorBonus: 3
      },
      magnet_maxhp: {
        name: "\u547D\u8FD0\u9F7F\u8F6E",
        icon: "\u{1F52E}",
        req: { passives: ["magnet", "maxhp"] },
        desc: "\u62FE\u53D6\u5B9D\u77F32%\u56DE\u590D1HP",
        gemHealChance: 0.02
      },
      // 武器+被动
      holywater_maxhp: {
        name: "\u5723\u6C34\u81A8\u80C0",
        icon: "\u26EA",
        req: { weapon: "holywater", passive: "maxhp" },
        desc: "\u5723\u6C34\u7403\u4F53\u534A\u5F84+30%",
        weaponBonus: { radiusMul: 1.3 }
      },
      knife_crit: {
        name: "\u81F4\u547D\u98DE\u5200",
        icon: "\u{1F5E1}",
        req: { weapon: "knife", passive: "crit" },
        desc: "\u98DE\u5200\u53EF\u66B4\u51FB",
        weaponBonus: { canCrit: true }
      },
      lightning_magnet: {
        name: "\u8FC7\u8F7D\u95EA\u7535",
        icon: "\u26A1",
        req: { weapon: "lightning", passive: "magnet" },
        desc: "\u95EA\u7535\u94FE+1\uFF0C\u5C04\u7A0B+50",
        weaponBonus: { extraChains: 1, rangeBonus: 50 }
      },
      bible_boots: {
        name: "\u70C8\u7130\u5723\u7ECF",
        icon: "\u{1F525}",
        req: { weapon: "bible", passive: "speedboots" },
        desc: "\u5723\u7ECF\u901F\u5EA6\xD71.5\uFF0C\u8303\u56F4+20",
        weaponBonus: { speedMul: 1.5, radiusBonus: 20 }
      },
      firestaff_armor: {
        name: "\u7194\u5CA9\u6CD5\u6756",
        icon: "\u{1F30B}",
        req: { weapon: "firestaff", passive: "armor" },
        desc: "\u9525\u5F62\u8303\u56F4+40px\uFF0C\u70B9\u71C3+1s",
        weaponBonus: { coneBonus: 40, burnDurBonus: 1 }
      },
      frost_regen: {
        name: "\u6781\u5BD2\u5149\u73AF",
        icon: "\u2744\uFE0F",
        req: { weapon: "frostaura", passive: "regen" },
        desc: "\u51B0\u51BB\u6982\u7387+5%/s\uFF0C\u51B0\u51BB+0.5s",
        weaponBonus: { freezeBonus: 0.05, freezeDurBonus: 0.5 }
      },
      // Lucky coin synergies (Drive #23)
      crit_luckycoin: {
        name: "\u547D\u8FD0\u8D4C\u5F92",
        icon: "\u{1F3B2}",
        req: { passives: ["crit", "luckycoin"] },
        desc: "\u66B4\u51FB\u65F6\u91D1\u5E01\u6389\u843D\u7FFB\u500D",
        critGoldDouble: true
      },
      holywater_luckycoin: {
        name: "\u5723\u6C34\u70BC\u91D1",
        icon: "\u{1F9EA}",
        req: { weapon: "holywater", passive: "luckycoin" },
        desc: "\u5723\u6C34\u51FB\u6740\u989D\u5916\u6389\u843D1\u91D1\u5E01",
        weaponBonus: { killGoldBonus: 1 }
      },
      firestaff_luckycoin: {
        name: "\u70BC\u91D1\u70C8\u7130",
        icon: "\u{1F511}",
        req: { weapon: "firestaff", passive: "luckycoin" },
        desc: "\u70B9\u71C3\u654C\u4EBA\u5B9D\u77F3\u4EF7\u503C+1",
        weaponBonus: { burnGemBonus: 1 }
      },
      frostaura_luckycoin: {
        name: "\u51B0\u971C\u62FE\u8352",
        icon: "\u2744\uFE0F",
        req: { weapon: "frostaura", passive: "luckycoin" },
        desc: "\u51B0\u51BB\u654C\u4EBA\u5B9D\u77F3\u5438\u5F15\u8303\u56F4+30px",
        weaponBonus: { frozenGemPullBonus: 30 }
      },
      // Boomerang synergies (Drive #23)
      boomerang_magnet: {
        name: "\u78C1\u529B\u56DE\u65CB",
        icon: "\u{1FA83}\u{1F9F2}",
        req: { weapon: "boomerang", passive: "magnet" },
        desc: "\u56DE\u65CB\u9556\u98DE\u884C\u8DEF\u5F84\u5438\u5F15\u5B9D\u77F3",
        weaponBonus: { flightPullRange: 30 }
      },
      boomerang_crit: {
        name: "\u81F4\u547D\u56DE\u65CB",
        icon: "\u{1FA83}\u{1F48D}",
        req: { weapon: "boomerang", passive: "crit" },
        desc: "\u56DE\u65CB\u9556\u53EF\u66B4\u51FB",
        weaponBonus: { canCrit: true, critSizeBonus: 1.2, critPierceBonus: 1 }
      }
    },
    SHOP: {
      soulFragmentRate: 0.3,
      upgrades: {
        maxhp: { name: "\u751F\u547D\u5F3A\u5316", icon: "\u2764\uFE0F", maxLevel: 3, costs: [20, 40, 80], effects: [{ hp: 1 }, { hp: 2 }, { hp: 3 }] },
        speed: { name: "\u901F\u5EA6\u8BAD\u7EC3", icon: "\u{1F45F}", maxLevel: 3, costs: [20, 40, 80], effects: [{ speedMul: 1.05 }, { speedMul: 1.1 }, { speedMul: 1.15 }] },
        pickup: { name: "\u62FE\u53D6\u7CBE\u901A", icon: "\u{1F4E1}", maxLevel: 3, costs: [15, 30, 60], effects: [{ range: 5 }, { range: 10 }, { range: 15 }] },
        expbonus: { name: "\u77E5\u8BC6\u6C72\u53D6", icon: "\u{1F4DA}", maxLevel: 3, costs: [25, 50, 100], effects: [{ mul: 1.05 }, { mul: 1.1 }, { mul: 1.15 }] },
        weaponDmg: { name: "\u6B66\u5668\u7CBE\u901A", icon: "\u2694\uFE0F", maxLevel: 3, costs: [30, 60, 120], effects: [{ mul: 1.03 }, { mul: 1.06 }, { mul: 1.1 }] },
        gold: { name: "\u8D2A\u5A6A\u4E4B\u5FC3", icon: "\u{1F4B0}", maxLevel: 3, costs: [15, 30, 60], effects: [{ mul: 1.1 }, { mul: 1.2 }, { mul: 1.3 }] }
      }
    },
    UPGRADE_REROLL: {
      maxReroll: 1
    },
    QUESTS: [
      { id: "warrior_30", name: "\u6218\u58EB\u4E4B\u9053", icon: "\u{1F6E1}", desc: "\u7528\u6218\u58EB\u51FB\u674030\u53EA\u654C\u4EBA", check: (s) => s.charId === "warrior" && s.kills >= 30, reward: 50 },
      { id: "ranger_30", name: "\u7BAD\u65E0\u865A\u53D1", icon: "\u{1F3F9}", desc: "\u7528\u6E38\u4FA0\u51FB\u674030\u53EA\u654C\u4EBA", check: (s) => s.charId === "ranger" && s.kills >= 30, reward: 50 },
      { id: "hard_survive", name: "\u52C7\u8005\u65E0\u60E7", icon: "\u{1F480}", desc: "\u5669\u68A6\u96BE\u5EA6\u5B58\u6D3B2\u5206\u949F", check: (s) => s.difficulty === "hard" && s.elapsed >= 120, reward: 100 },
      { id: "hard_boss", name: "\u5669\u68A6\u5F81\u670D\u8005", icon: "\u{1F451}", desc: "\u5669\u68A6\u96BE\u5EA6\u51FB\u8D25Boss", check: (s) => s.difficulty === "hard" && s.bossKilled, reward: 200 },
      { id: "kill_50", name: "\u5C60\u622E\u8005", icon: "\u2694\uFE0F", desc: "\u5355\u5C40\u51FB\u674050\u4E2A\u654C\u4EBA", check: (s) => s.kills >= 50, reward: 75 },
      { id: "kill_100", name: "\u767E\u4EBA\u65A9", icon: "\u{1F4AF}", desc: "\u5355\u5C40\u51FB\u6740100\u4E2A\u654C\u4EBA", check: (s) => s.kills >= 100, reward: 150 },
      { id: "kill_boss", name: "\u5C60\u9F99\u8005", icon: "\u{1F432}", desc: "\u51FB\u8D25\u9AA8\u9F99Boss", check: (s) => s.bossKilled, reward: 100 },
      { id: "no_damage", name: "\u5B8C\u7F8E\u95EA\u907F", icon: "\u2728", desc: "\u4E0D\u53D7\u4F24\u5B58\u6D3B1\u5206\u949F", check: (s) => s.elapsed >= 60 && s.damageTaken === 0, reward: 120 },
      { id: "combo_20", name: "\u8FDE\u51FB\u5927\u5E08", icon: "\u{1F525}", desc: "\u8FBE\u621020\u8FDE\u51FB", check: (s) => s.bestCombo >= 20, reward: 100 },
      { id: "combo_50", name: "\u8FDE\u51FB\u4E4B\u738B", icon: "\u{1F4A5}", desc: "\u8FBE\u621050\u8FDE\u51FB", check: (s) => s.bestCombo >= 50, reward: 200 },
      // Endless mode quests
      { id: "endless_5min", name: "\u65E0\u5C3D\u5F81\u9014", icon: "\u267E", desc: "\u65E0\u5C3D\u6A21\u5F0F\u5B58\u6D3B5\u5206\u949F", check: (s) => s.endless && s.elapsed >= 300, reward: 150 },
      { id: "endless_10min", name: "\u4E0D\u673D\u4F20\u8BF4", icon: "\u23F1", desc: "\u65E0\u5C3D\u6A21\u5F0F\u5B58\u6D3B10\u5206\u949F", check: (s) => s.endless && s.elapsed >= 600, reward: 300 },
      { id: "endless_boss3", name: "\u8FDE\u65A9\u4E09\u9F99", icon: "\u{1F432}", desc: "\u5355\u5C40\u65E0\u5C3D\u51FB\u67403\u4E2ABoss", check: (s) => s.endless && s.bossKillCount >= 3, reward: 400 },
      { id: "endless_kill200", name: "\u65E0\u5C3D\u5C60\u622E", icon: "\u{1F480}", desc: "\u5355\u5C40\u65E0\u5C3D\u51FB\u6740200\u654C\u4EBA", check: (s) => s.endless && s.kills >= 200, reward: 250 }
    ],
    ACHIEVEMENTS: {
      // === Milestone ===
      total_kills_100: { name: "\u767E\u6218\u4E4B\u58EB", icon: "\u2694\uFE0F", desc: "\u7D2F\u8BA1\u51FB\u6740100\u53EA\u654C\u4EBA", type: "milestone", check: { stat: "totalKills", target: 100 }, reward: 30 },
      total_kills_500: { name: "\u5C60\u622E\u5148\u950B", icon: "\u{1F480}", desc: "\u7D2F\u8BA1\u51FB\u6740500\u53EA\u654C\u4EBA", type: "milestone", check: { stat: "totalKills", target: 500 }, reward: 80 },
      total_kills_2000: { name: "\u6740\u622E\u4E4B\u738B", icon: "\u{1F451}", desc: "\u7D2F\u8BA1\u51FB\u67402000\u53EA\u654C\u4EBA", type: "milestone", check: { stat: "totalKills", target: 2e3 }, reward: 200 },
      games_10: { name: "\u521D\u51FA\u8305\u5E90", icon: "\u{1F3AE}", desc: "\u6E38\u73A910\u5C40", type: "milestone", check: { stat: "gamesPlayed", target: 10 }, reward: 20 },
      games_50: { name: "\u8EAB\u7ECF\u767E\u6218", icon: "\u{1F3C6}", desc: "\u6E38\u73A950\u5C40", type: "milestone", check: { stat: "gamesPlayed", target: 50 }, reward: 60 },
      // === Survival ===
      survive_3min: {
        name: "\u4E09\u5206\u949F\u5E78\u5B58\u8005",
        icon: "\u23F1",
        desc: "\u6807\u51C6\u96BE\u5EA6\u5B58\u6D3B3\u5206\u949F",
        type: "condition",
        reward: 30,
        check: (s) => s.difficulty === "normal" && s.elapsed >= 180
      },
      survive_5min: {
        name: "\u4E94\u5206\u949F\u5927\u5E08",
        icon: "\u{1F31F}",
        desc: "\u6807\u51C6\u96BE\u5EA6\u5B58\u6D3B5\u5206\u949F(\u901A\u5173)",
        type: "condition",
        reward: 80,
        check: (s) => s.difficulty === "normal" && s.elapsed >= 300
      },
      survive_hard_5min: {
        name: "\u5669\u68A6\u5E78\u5B58\u8005",
        icon: "\u{1F480}",
        desc: "\u5669\u68A6\u96BE\u5EA6\u5B58\u6D3B5\u5206\u949F",
        type: "condition",
        reward: 150,
        check: (s) => s.difficulty === "hard" && s.elapsed >= 300
      },
      // === Character (multi) ===
      all_chars: {
        name: "\u5168\u80FD\u5192\u9669\u8005",
        icon: "\u{1F3AD}",
        desc: "\u4F7F\u7528\u5168\u90E83\u4E2A\u89D2\u8272\u901A\u5173",
        type: "multi",
        reward: 100,
        parts: ["char_mage", "char_warrior", "char_ranger"]
      },
      char_mage: { hidden: true, check: (s) => s.charId === "mage" && s.elapsed >= 300 },
      char_warrior: { hidden: true, check: (s) => s.charId === "warrior" && s.elapsed >= 300 },
      char_ranger: { hidden: true, check: (s) => s.charId === "ranger" && s.elapsed >= 300 },
      // === Kill/Challenge ===
      boss_kill: {
        name: "\u5C60\u9F99\u8005",
        icon: "\u{1F432}",
        desc: "\u51FB\u8D25Boss",
        type: "condition",
        reward: 50,
        check: (s) => s.bossKilled
      },
      boss_kill_hard: {
        name: "\u5669\u68A6\u5F81\u670D\u8005",
        icon: "\u{1F525}",
        desc: "\u5669\u68A6\u96BE\u5EA6\u51FB\u8D25Boss",
        type: "condition",
        reward: 150,
        check: (s) => s.difficulty === "hard" && s.bossKilled
      },
      combo_30: {
        name: "\u8FDE\u51FB\u98CE\u66B4",
        icon: "\u{1F32A}",
        desc: "\u5355\u5C40\u8FBE\u621030\u8FDE\u51FB",
        type: "condition",
        reward: 60,
        check: (s) => s.bestCombo >= 30
      },
      combo_50: {
        name: "\u8FDE\u51FB\u4E4B\u795E",
        icon: "\u26A1",
        desc: "\u5355\u5C40\u8FBE\u621050\u8FDE\u51FB",
        type: "condition",
        reward: 120,
        check: (s) => s.bestCombo >= 50
      },
      no_damage_2min: {
        name: "\u5B8C\u7F8E\u95EA\u907F",
        icon: "\u2728",
        desc: "\u4E0D\u53D7\u4F24\u5B58\u6D3B2\u5206\u949F",
        type: "condition",
        reward: 100,
        check: (s) => s.elapsed >= 120 && s.damageTaken === 0
      },
      kill_100_single: {
        name: "\u767E\u4EBA\u65A9",
        icon: "\u{1F4AF}",
        desc: "\u5355\u5C40\u51FB\u6740100\u53EA\u654C\u4EBA",
        type: "condition",
        reward: 80,
        check: (s) => s.kills >= 100
      },
      // === Evolution/Synergy ===
      evolve_weapon: { name: "\u7B2C\u4E00\u6B21\u8FDB\u5316", icon: "\u{1F9EC}", desc: "\u9996\u6B21\u8FDB\u5316\u6B66\u5668", type: "flag", reward: 40 },
      synergy_first: { name: "\u534F\u540C\u53D1\u73B0", icon: "\u{1F517}", desc: "\u9996\u6B21\u89E6\u53D1\u534F\u540C\u6548\u679C", type: "flag", reward: 40 },
      all_evolutions: {
        name: "\u8FDB\u5316\u5927\u5E08",
        icon: "\u{1F48E}",
        desc: "\u5B8C\u6210\u5168\u90E88\u79CD\u6B66\u5668\u8FDB\u5316",
        type: "multi",
        reward: 300,
        parts: ["evo_thunderholywater", "evo_fireknife", "evo_holydomain", "evo_blizzard", "evo_frostknife", "evo_flamebible", "evo_thunderang", "evo_blazerang"]
      },
      evo_thunderholywater: { hidden: true, check: (s) => s.evolutions && s.evolutions.includes("thunderholywater") },
      evo_fireknife: { hidden: true, check: (s) => s.evolutions && s.evolutions.includes("fireknife") },
      evo_holydomain: { hidden: true, check: (s) => s.evolutions && s.evolutions.includes("holydomain") },
      evo_blizzard: { hidden: true, check: (s) => s.evolutions && s.evolutions.includes("blizzard") },
      evo_frostknife: { hidden: true, check: (s) => s.evolutions && s.evolutions.includes("frostknife") },
      evo_flamebible: { hidden: true, check: (s) => s.evolutions && s.evolutions.includes("flamebible") },
      evo_thunderang: { hidden: true, check: (s) => s.evolutions && s.evolutions.includes("thunderang") },
      evo_blazerang: { hidden: true, check: (s) => s.evolutions && s.evolutions.includes("blazerang") },
      // === Shop/Economy ===
      shop_first: { name: "\u521D\u6B21\u6295\u8D44", icon: "\u{1F3EA}", desc: "\u9996\u6B21\u8D2D\u4E70\u5546\u5E97\u5347\u7EA7", type: "flag", reward: 20 },
      shop_max_one: { name: "\u4E13\u7CBE\u4E4B\u8DEF", icon: "\u{1F4C8}", desc: "\u5C06\u4EFB\u4E00\u5546\u5E97\u5347\u7EA7\u4E70\u6EE13\u7EA7", type: "flag", reward: 60 },
      shop_max_all: { name: "\u5168\u9762\u53D1\u5C55", icon: "\u{1F31F}", desc: "\u5C06\u5168\u90E86\u79CD\u5546\u5E97\u5347\u7EA7\u4E70\u6EE1", type: "flag", reward: 300 },
      // === Quest ===
      quests_half: {
        name: "\u6311\u6218\u65B0\u661F",
        icon: "\u{1F31F}",
        desc: "\u5B8C\u6210\u4E00\u534AQuest",
        type: "condition",
        reward: 50,
        check: (s) => (s.completedQuestsCount || 0) >= Math.ceil(CFG.QUESTS.length / 2)
      },
      quests_all: {
        name: "\u6311\u6218\u5927\u5E08",
        icon: "\u{1F451}",
        desc: "\u5B8C\u6210\u5168\u90E8Quest",
        type: "condition",
        reward: 150,
        check: (s) => (s.completedQuestsCount || 0) >= CFG.QUESTS.length
      },
      // === Hidden ===
      speed_clear: {
        name: "\u901F\u5EA6\u4E0E\u6FC0\u60C5",
        icon: "\u{1F3CE}",
        desc: "\u57283\u5206\u949F\u5185\u51FB\u8D25Boss",
        type: "condition",
        reward: 100,
        check: (s) => s.bossKilled && s.elapsed <= 180,
        hidden: true
      },
      pacifist_1min: {
        name: "\u548C\u5E73\u4E3B\u4E49\u8005",
        icon: "\u{1F54A}",
        desc: "\u524D1\u5206\u949F\u4E0D\u51FB\u6740\u4EFB\u4F55\u654C\u4EBA\u5B58\u6D3B",
        type: "condition",
        reward: 80,
        check: (s) => s.elapsed >= 60 && s.killsAt60 === 0,
        hidden: true
      }
    },
    ENDLESS: {
      enabled: true,
      bossInterval: 240,
      bossScalePerCycle: { hpMul: 1.5, speedMul: 1.1 },
      extraHpPerMin: 0.1,
      extraSpdPerMin: 0.05,
      minSpawnInterval: 0.25,
      maxEnemyBonus: 30,
      maxEnemiesCap: 100,
      milestoneInterval: 60,
      soulFragmentBonusMul: 1.5,
      goldBonusPerMin: 0.5,
      bossKillReward: { gold: 50, exp: 30, food: 5 }
    },
    BOOMERANG: {
      levels: {
        1: { count: 1, speed: 280, returnSpeed: 320, dmg: 3, maxDist: 250, cd: 1.8, pierce: 0, trackAngle: 0.52, curvature: 0.3 },
        2: { count: 2, speed: 280, returnSpeed: 320, dmg: 4, maxDist: 300, cd: 1.4, pierce: 1, trackAngle: 0.79, curvature: 0.3 },
        3: { count: 3, speed: 320, returnSpeed: 360, dmg: 5, maxDist: 350, cd: 1, pierce: 2, trackAngle: 1.05, curvature: 0.2 }
      },
      thunderang: {
        count: 4,
        speed: 350,
        returnSpeed: 380,
        dmg: 7,
        maxDist: 400,
        cd: 0.8,
        pierce: 3,
        trackAngle: 1.31,
        curvature: 0.15,
        lightning: { chance: 0.4, range: 120, targets: 2, dmg: 8, chains: 2, decay: 0.5 }
      },
      blazerang: {
        count: 3,
        speed: 330,
        returnSpeed: 360,
        dmg: 6,
        maxDist: 380,
        cd: 0.8,
        pierce: 3,
        trackAngle: 1.05,
        curvature: 0.2,
        flame: { trailInterval: 20, trailDur: 1.5, trailDps: 2, maxTrails: 20, burnDur: 2.5, burnDps: 3 }
      }
    }
  };

  // src/core/math.js
  var V = class _V {
    constructor(x = 0, y = 0) {
      this.x = x;
      this.y = y;
    }
    add(v) {
      return new _V(this.x + v.x, this.y + v.y);
    }
    sub(v) {
      return new _V(this.x - v.x, this.y - v.y);
    }
    scale(s) {
      return new _V(this.x * s, this.y * s);
    }
    len() {
      return Math.hypot(this.x, this.y);
    }
    norm() {
      const l = this.len();
      return l > 0 ? this.scale(1 / l) : new _V();
    }
    dist(v) {
      return this.sub(v).len();
    }
    clone() {
      return new _V(this.x, this.y);
    }
  };
  function rand(a, b) {
    return a + Math.random() * (b - a);
  }
  function randInt(a, b) {
    return Math.floor(rand(a, b + 1));
  }
  function clamp(v, lo, hi) {
    return v < lo ? lo : v > hi ? hi : v;
  }
  function dist(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
  }
  function distSq(a, b) {
    const dx = a.x - b.x, dy = a.y - b.y;
    return dx * dx + dy * dy;
  }
  function aabbOverlap(ax, ay, aw, ah, bx, by, bw, bh) {
    return Math.abs(ax - bx) < (aw + bw) / 2 && Math.abs(ay - by) < (ah + bh) / 2;
  }

  // src/core/save.js
  var Save = {
    _default() {
      return {
        version: CFG.SAVE.version,
        bestScore: 0,
        bestTime: 0,
        totalKills: 0,
        gamesPlayed: 0,
        bestCombo: 0,
        completedQuests: [],
        completedAchievements: [],
        achievedFlags: [],
        soulFragments: 0,
        shopUpgrades: { maxhp: 0, speed: 0, pickup: 0, expbonus: 0, weaponDmg: 0, gold: 0 },
        endlessUnlocked: false,
        bestEndlessTime: 0,
        bestEndlessKills: 0,
        bestEndlessBossKills: 0,
        characters: {
          mage: { bestScore: 0, bestTime: 0 },
          warrior: { bestScore: 0, bestTime: 0 },
          ranger: { bestScore: 0, bestTime: 0 }
        }
      };
    },
    load() {
      try {
        const raw = localStorage.getItem(CFG.SAVE.key);
        if (!raw) return this._default();
        const d = JSON.parse(raw);
        if (d.version !== CFG.SAVE.version) return this._default();
        if (d.soulFragments === void 0) d.soulFragments = 0;
        if (!d.shopUpgrades) d.shopUpgrades = { maxhp: 0, speed: 0, pickup: 0, expbonus: 0, weaponDmg: 0, gold: 0 };
        if (!d.completedQuests) d.completedQuests = [];
        if (!d.completedAchievements) d.completedAchievements = [];
        if (!d.achievedFlags) d.achievedFlags = [];
        if (d.endlessUnlocked === void 0) d.endlessUnlocked = false;
        if (!d.bestEndlessTime) d.bestEndlessTime = 0;
        if (!d.bestEndlessKills) d.bestEndlessKills = 0;
        if (!d.bestEndlessBossKills) d.bestEndlessBossKills = 0;
        return d;
      } catch (e) {
        return this._default();
      }
    },
    save(data) {
      try {
        localStorage.setItem(CFG.SAVE.key, JSON.stringify(data));
      } catch (e) {
      }
    },
    record(kills, time, charId, bestCombo) {
      const d = this.load();
      d.gamesPlayed++;
      d.totalKills += kills;
      let newBest = false;
      if (kills > d.bestScore) {
        d.bestScore = kills;
        newBest = true;
      }
      if (bestCombo > d.bestCombo) d.bestCombo = bestCombo;
      if (time > d.bestTime) {
        d.bestTime = time;
      }
      if (charId && d.characters[charId]) {
        if (kills > d.characters[charId].bestScore) d.characters[charId].bestScore = kills;
        if (time > d.characters[charId].bestTime) d.characters[charId].bestTime = time;
      }
      this.save(d);
      return { data: d, newBest };
    },
    recordQuests(newQuestIds) {
      const d = this.load();
      if (!d.completedQuests) d.completedQuests = [];
      const firstTime = [];
      for (const id of newQuestIds) {
        if (!d.completedQuests.includes(id)) {
          d.completedQuests.push(id);
          firstTime.push(id);
        }
      }
      this.save(d);
      return { data: d, firstTime };
    },
    addSoulFragments(amount) {
      const d = this.load();
      d.soulFragments = (d.soulFragments || 0) + amount;
      this.save(d);
      return d.soulFragments;
    },
    buyShopUpgrade(key) {
      const d = this.load();
      const u = CFG.SHOP.upgrades[key];
      if (!u) return false;
      const level = d.shopUpgrades[key] || 0;
      if (level >= u.maxLevel) return false;
      const cost = u.costs[level];
      if ((d.soulFragments || 0) < cost) return false;
      d.soulFragments -= cost;
      d.shopUpgrades[key] = level + 1;
      this.save(d);
      return true;
    },
    // --- Achievement System ---
    achieveFlag(flagId) {
      const d = this.load();
      if (!d.achievedFlags) d.achievedFlags = [];
      if (!d.achievedFlags.includes(flagId)) {
        d.achievedFlags.push(flagId);
        this.save(d);
      }
    },
    checkAchievements(gameStats) {
      const d = this.load();
      if (!d.completedAchievements) d.completedAchievements = [];
      if (!d.achievedFlags) d.achievedFlags = [];
      const newlyCompleted = [];
      for (const [id, ach] of Object.entries(CFG.ACHIEVEMENTS)) {
        if (!ach.hidden) continue;
        if (d.completedAchievements.includes(id)) continue;
        if (ach.check && ach.check(gameStats)) {
          d.completedAchievements.push(id);
        }
      }
      for (const [id, ach] of Object.entries(CFG.ACHIEVEMENTS)) {
        if (ach.hidden) continue;
        if (d.completedAchievements.includes(id)) continue;
        let completed = false;
        if (ach.type === "milestone") {
          const current = d[ach.check.stat] || 0;
          completed = current >= ach.check.target;
        } else if (ach.type === "condition") {
          completed = ach.check(gameStats);
        } else if (ach.type === "multi") {
          completed = ach.parts.every((partId) => {
            return d.completedAchievements.includes(partId);
          });
        } else if (ach.type === "flag") {
          completed = d.achievedFlags.includes(id);
        }
        if (completed) {
          d.completedAchievements.push(id);
          newlyCompleted.push(id);
        }
      }
      let rewardTotal = 0;
      for (const aid of newlyCompleted) {
        const ach = CFG.ACHIEVEMENTS[aid];
        if (ach && ach.reward) {
          rewardTotal += ach.reward;
        }
      }
      if (rewardTotal > 0) {
        d.soulFragments = (d.soulFragments || 0) + rewardTotal;
      }
      this.save(d);
      return { newlyCompleted, rewardTotal };
    },
    getAchievementProgress(id) {
      const d = this.load();
      const ach = CFG.ACHIEVEMENTS[id];
      if (!ach) return { current: 0, target: 1, done: false };
      if (d.completedAchievements && d.completedAchievements.includes(id)) {
        return {
          current: ach.type === "multi" ? ach.parts.length : 1,
          target: ach.type === "multi" ? ach.parts.length : 1,
          done: true
        };
      }
      if (ach.type === "milestone") {
        const current = d[ach.check.stat] || 0;
        return { current: Math.min(current, ach.check.target), target: ach.check.target, done: false };
      }
      if (ach.type === "multi") {
        let doneCount = 0;
        for (const partId of ach.parts) {
          if (d.completedAchievements && d.completedAchievements.includes(partId)) doneCount++;
        }
        return { current: doneCount, target: ach.parts.length, done: false };
      }
      return { current: 0, target: 1, done: false };
    }
  };

  // src/audio/sfx.js
  var SFX = {
    ctx: null,
    vol: 0.3,
    enabled: true,
    init() {
      if (this.ctx) return;
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    },
    play(id) {
      if (!this.enabled || !this.ctx) return;
      const defs = {
        hit: { freq: [440, 110], dur: 0.15, type: "square" },
        kill: { freq: [200, 600], dur: 0.1, type: "square" },
        knife: { freq: 800, dur: 0.05, type: "sawtooth" },
        lightning: { noise: true, dur: 0.12 },
        levelup: { freq: [523, 659, 784], dur: 0.1, type: "square", seq: true },
        pickup: { freq: 880, dur: 0.08, type: "sine" },
        chest: { freq: [440, 660, 880], dur: 0.08, type: "triangle", seq: true },
        boss: { freq: 110, dur: 0.15, type: "sawtooth", repeat: 3 },
        freeze: { freq: [1200, 400], dur: 0.15, type: "sine" },
        gameover: { freq: [440, 110], dur: 0.8, type: "sawtooth" },
        victory: { freq: [523, 659, 784, 1047], dur: 0.12, type: "square", seq: true },
        dash: { freq: [1200, 300], dur: 0.1, type: "sine" }
      };
      const d = defs[id];
      if (!d) return;
      const now = this.ctx.currentTime;
      if (d.noise) {
        const bufSize = this.ctx.sampleRate * d.dur;
        const buf = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
        const src = this.ctx.createBufferSource();
        src.buffer = buf;
        const g = this.ctx.createGain();
        g.gain.setValueAtTime(this.vol * 0.5, now);
        g.gain.exponentialRampToValueAtTime(0.01, now + d.dur);
        src.connect(g);
        g.connect(this.ctx.destination);
        src.start(now);
        src.stop(now + d.dur);
      } else if (d.seq) {
        for (let i = 0; i < d.freq.length; i++) {
          const osc = this.ctx.createOscillator();
          const g = this.ctx.createGain();
          osc.type = d.type;
          osc.frequency.setValueAtTime(d.freq[i], now + i * d.dur);
          g.gain.setValueAtTime(this.vol, now + i * d.dur);
          g.gain.exponentialRampToValueAtTime(0.01, now + i * d.dur + d.dur * 0.9);
          osc.connect(g);
          g.connect(this.ctx.destination);
          osc.start(now + i * d.dur);
          osc.stop(now + i * d.dur + d.dur);
        }
      } else if (d.repeat) {
        for (let i = 0; i < d.repeat; i++) {
          const osc = this.ctx.createOscillator();
          const g = this.ctx.createGain();
          osc.type = d.type;
          osc.frequency.setValueAtTime(d.freq, now + i * d.dur * 1.5);
          g.gain.setValueAtTime(this.vol, now + i * d.dur * 1.5);
          g.gain.exponentialRampToValueAtTime(0.01, now + i * d.dur * 1.5 + d.dur);
          osc.connect(g);
          g.connect(this.ctx.destination);
          osc.start(now + i * d.dur * 1.5);
          osc.stop(now + i * d.dur * 1.5 + d.dur);
        }
      } else {
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = d.type;
        if (Array.isArray(d.freq)) {
          osc.frequency.setValueAtTime(d.freq[0], now);
          osc.frequency.exponentialRampToValueAtTime(d.freq[1], now + d.dur);
        } else {
          osc.frequency.setValueAtTime(d.freq, now);
        }
        g.gain.setValueAtTime(this.vol, now);
        g.gain.exponentialRampToValueAtTime(0.01, now + d.dur);
        osc.connect(g);
        g.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + d.dur);
      }
    }
  };
  function screenShake(type, game) {
    const cfg = CFG.SCREEN_SHAKE[type];
    if (!cfg || !game) return;
    if (!game.shake || cfg.intensity >= game.shake.intensity) {
      game.shake = { intensity: cfg.intensity, duration: cfg.duration, timer: cfg.duration };
    }
  }
  function playerCrits(player) {
    if (!player) return false;
    return Math.random() < (player.critChance || 0);
  }

  // src/systems/camera.js
  var Camera = class {
    constructor() {
      this.x = 0;
      this.y = 0;
      this.tx = 0;
      this.ty = 0;
    }
    follow(p) {
      this.tx = p.x;
      this.ty = p.y;
    }
    update(dt) {
      this.x += (this.tx - this.x) * 0.1;
      this.y += (this.ty - this.y) * 0.1;
    }
    w2s(wx, wy, canvas2, shake) {
      const dpr = window.devicePixelRatio || 1;
      let sx = wx - this.x + canvas2.width / (2 * dpr);
      let sy = wy - this.y + canvas2.height / (2 * dpr);
      if (shake && shake.timer > 0) {
        const f = shake.timer / shake.duration;
        const i = shake.intensity * f;
        sx += (Math.random() - 0.5) * 2 * i;
        sy += (Math.random() - 0.5) * 2 * i;
      }
      return { x: sx, y: sy };
    }
    s2w(sx, sy, canvas2) {
      const dpr = window.devicePixelRatio || 1;
      return { x: sx + this.x - canvas2.width / (2 * dpr), y: sy + this.y - canvas2.height / (2 * dpr) };
    }
  };

  // src/entities/Player.js
  var Player = class {
    constructor(charId = "mage") {
      const ch = CFG.CHARACTERS[charId];
      this.x = CFG.MAP_W / 2;
      this.y = CFG.MAP_H / 2;
      this.w = CFG.PLAYER_SIZE;
      this.h = CFG.PLAYER_SIZE;
      this.hp = ch.hp;
      this.maxHp = ch.hp;
      this.speed = ch.speed;
      this.level = 1;
      this.exp = 0;
      this.pickupRange = CFG.PICKUP_RANGE;
      this.armor = 0;
      this.invTimer = 0;
      this.kills = 0;
      this.gold = 0;
      this.weapons = [];
      this.passives = {};
      this.expBonus = ch.expBonus || 0;
      this.critChance = 0;
      this._regenTimer = 0;
      this.facingAngle = 0;
      this._speedBoost = 0;
      this._speedBoostTimer = 0;
      this.charId = charId;
      this._combo = 0;
      this._comboTimer = 0;
      this._bestCombo = 0;
      this._dashCD = 0;
      this._dashing = false;
      this._dashTimer = 0;
      this._dashDir = { x: 0, y: 0 };
      this._afterimages = [];
      this.activeSynergies = /* @__PURE__ */ new Set();
      this._isMoving = false;
      this.critDmgBonus = 0;
      this.goldDropBonus = 0;
      this._damageTaken = 0;
      this.onSFX = null;
      this.onScreenShake = null;
      this.onCritCheck = null;
      this.getDifficulty = null;
      this.getExpMul = null;
    }
    // ----- Combo -----
    get combo() {
      return this._combo;
    }
    get comboTimer() {
      return this._comboTimer;
    }
    get bestCombo() {
      return this._bestCombo;
    }
    incrementCombo() {
      this._combo++;
      this._comboTimer = CFG.COMBO.timeout;
      if (this._combo > this._bestCombo) this._bestCombo = this._combo;
      return this._combo;
    }
    comboGold() {
      return this._combo >= CFG.COMBO.goldThreshold ? 1 : 0;
    }
    comboExpBonus() {
      return 1 + Math.min(this._combo * CFG.COMBO.expBonusRate, CFG.COMBO.maxBonus);
    }
    // ----- Update -----
    update(dt, input) {
      if (this._speedBoostTimer > 0) {
        this._speedBoostTimer -= dt;
        if (this._speedBoostTimer <= 0) this._speedBoost = 0;
      }
      if (this._dashCD > 0) this._dashCD -= dt;
      for (let i = this._afterimages.length - 1; i >= 0; i--) {
        this._afterimages[i].alpha -= dt * 4;
        if (this._afterimages[i].alpha <= 0) this._afterimages.splice(i, 1);
      }
      if (this._dashing) {
        this._dashTimer -= dt;
        const dashSpd = this.speed * CFG.DASH.speedMult;
        this.x += this._dashDir.x * dashSpd * dt;
        this.y += this._dashDir.y * dashSpd * dt;
        if (this._afterimages.length < CFG.DASH.afterimages) {
          this._afterimages.push({ x: this.x, y: this.y, alpha: 0.6 });
        }
        if (this._dashTimer <= 0) {
          this._dashing = false;
          this._dashCD = CFG.DASH.cooldown;
        }
        this._clampToMap();
        if (this.invTimer > 0) this.invTimer -= dt;
        return;
      }
      const spd = this.speed * (1 + this._speedBoost);
      this._isMoving = !!(input.x || input.y);
      if (this._isMoving) {
        this.x += input.x * spd * dt;
        this.y += input.y * spd * dt;
        this.facingAngle = Math.atan2(input.y, input.x);
      }
      this._clampToMap();
      if (this.invTimer > 0) this.invTimer -= dt;
      if (this._regenTimer > 0) {
        this._regenTimer -= dt;
        let regenSpeedMul = 1;
        if (this.activeSynergies.has("boots_regen") && this._isMoving) regenSpeedMul = CFG.SYNERGIES.boots_regen.movingRegenSpeedMul;
        if (this._regenTimer <= 0 && this.hp < this.maxHp) {
          this.hp = Math.min(this.hp + 1, this.maxHp);
          const stacks = this.passives.regen || 0;
          this._regenTimer = ([5, 4, 3][stacks - 1] || 3) / regenSpeedMul;
        }
      }
      if (this._comboTimer > 0) {
        this._comboTimer -= dt;
        if (this._comboTimer <= 0) this._combo = 0;
      }
    }
    // ----- Dash -----
    dash() {
      if (this._dashing || this._dashCD > 0) return false;
      this._dashing = true;
      this._dashTimer = CFG.DASH.duration;
      this.invTimer = CFG.DASH.duration;
      this._dashDir = {
        x: Math.cos(this.facingAngle),
        y: Math.sin(this.facingAngle)
      };
      this._afterimages = [];
      this._playSFX("dash");
      return true;
    }
    // ----- Damage -----
    takeDamage(d) {
      if (this.invTimer > 0 || this._dashing) return false;
      const diffKey = this.getDifficulty ? this.getDifficulty() : "normal";
      const dMul = CFG.DIFFICULTY[diffKey].enemyDmgMul;
      let armorVal = this.armor;
      if (this.activeSynergies.has("armor_maxhp")) armorVal *= 2;
      if (this.activeSynergies.has("armor_regen") && this.hp / this.maxHp <= CFG.SYNERGIES.armor_regen.lowHpThreshold) {
        armorVal += CFG.SYNERGIES.armor_regen.tempArmorBonus;
      }
      const realDmg = Math.max(1, Math.ceil(d * dMul) - armorVal);
      this.hp -= realDmg;
      this._damageTaken++;
      this.invTimer = CFG.INVINCIBLE_TIME;
      this._shakeScreen("hurt");
      this._playSFX("hit");
      return true;
    }
    // ----- Experience -----
    addExp(amount) {
      const expMul = this.getExpMul ? this.getExpMul() : 1;
      const bonus = 1 + (this.expBonus || 0);
      this.exp += Math.ceil(amount * bonus * expMul);
      while (this.level < CFG.EXP_TABLE.length && this.exp >= CFG.EXP_TABLE[this.level]) {
        this.exp -= CFG.EXP_TABLE[this.level];
        this.level++;
        return true;
      }
      return false;
    }
    // ----- Synergy System -----
    checkSynergies() {
      const prevCount = this.activeSynergies.size;
      this.activeSynergies.clear();
      if (!CFG.SYNERGIES) return;
      for (const [id, syn] of Object.entries(CFG.SYNERGIES)) {
        const req = syn.req;
        if (req.passives) {
          if (req.passives.every((p) => (this.passives[p] || 0) > 0)) {
            this.activeSynergies.add(id);
          }
        } else if (req.weapon && req.passive) {
          const hasWeapon = this.weapons.some((w) => w.name === req.weapon);
          const hasPassive = (this.passives[req.passive] || 0) > 0;
          if (hasWeapon && hasPassive) {
            this.activeSynergies.add(id);
          }
        }
      }
      if (this.activeSynergies.size > 0) {
        Save.achieveFlag("synergy_first");
      }
    }
    getWeaponBonus(weaponName) {
      const bonus = {};
      if (!CFG.SYNERGIES) return bonus;
      for (const id of this.activeSynergies) {
        const syn = CFG.SYNERGIES[id];
        if (syn.weaponBonus && syn.req.weapon === weaponName) {
          Object.assign(bonus, syn.weaponBonus);
        }
      }
      return bonus;
    }
    hasSynergy(id) {
      return this.activeSynergies.has(id);
    }
    // ----- Drawing -----
    draw(ctx2, cam, canvas2) {
      if (this.invTimer > 0 && Math.floor(this.invTimer * 10) % 2 === 0) return;
      const s = cam.w2s(this.x, this.y, canvas2);
      const x = s.x - this.w / 2, y = s.y - this.h / 2;
      const c = this.charId || "mage";
      if (c === "mage") {
        this._drawMage(ctx2, x, y);
      } else if (c === "warrior") {
        this._drawWarrior(ctx2, x, y);
      } else if (c === "ranger") {
        this._drawRanger(ctx2, x, y);
      }
    }
    _drawMage(ctx2, x, y) {
      ctx2.fillStyle = "#1a237e";
      ctx2.fillRect(x + 2, y - 6, 12, 6);
      ctx2.fillRect(x + 4, y - 10, 8, 4);
      ctx2.fillRect(x + 5, y - 12, 6, 2);
      ctx2.fillStyle = "#1565c0";
      ctx2.fillRect(x + 2, y, 12, 10);
      ctx2.fillRect(x + 1, y + 10, 14, 4);
      ctx2.fillStyle = "#ffe0b2";
      ctx2.fillRect(x + 5, y + 1, 6, 4);
      ctx2.fillStyle = "#000";
      ctx2.fillRect(x + 6, y + 2, 2, 2);
      ctx2.fillRect(x + 9, y + 2, 2, 2);
      ctx2.fillStyle = "#795548";
      ctx2.fillRect(x + 14, y - 2, 2, 16);
      ctx2.fillStyle = "#ffd54f";
      ctx2.fillRect(x + 13, y - 4, 4, 3);
    }
    _drawWarrior(ctx2, x, y) {
      ctx2.fillStyle = "#b71c1c";
      ctx2.fillRect(x + 1, y - 8, 14, 8);
      ctx2.fillRect(x + 3, y - 10, 10, 3);
      ctx2.fillStyle = "#ffd54f";
      ctx2.fillRect(x + 4, y - 4, 8, 2);
      ctx2.fillStyle = "#d32f2f";
      ctx2.fillRect(x + 1, y, 14, 10);
      ctx2.fillRect(x, y + 10, 16, 4);
      ctx2.fillStyle = "#5d4037";
      ctx2.fillRect(x + 2, y + 8, 12, 2);
      ctx2.fillStyle = "#ffe0b2";
      ctx2.fillRect(x + 5, y + 1, 6, 4);
      ctx2.fillStyle = "#000";
      ctx2.fillRect(x + 6, y + 2, 2, 2);
      ctx2.fillRect(x + 9, y + 2, 2, 2);
      ctx2.fillStyle = "#9e9e9e";
      ctx2.fillRect(x + 14, y - 4, 2, 14);
      ctx2.fillStyle = "#5d4037";
      ctx2.fillRect(x + 13, y + 6, 4, 3);
      ctx2.fillStyle = "#e0e0e0";
      ctx2.fillRect(x + 14, y - 6, 2, 3);
    }
    _drawRanger(ctx2, x, y) {
      ctx2.fillStyle = "#1b5e20";
      ctx2.fillRect(x + 2, y - 6, 12, 6);
      ctx2.fillRect(x + 3, y - 8, 10, 3);
      ctx2.fillStyle = "#2e7d32";
      ctx2.fillRect(x + 2, y, 12, 10);
      ctx2.fillRect(x + 1, y + 10, 14, 4);
      ctx2.fillStyle = "#ffe0b2";
      ctx2.fillRect(x + 5, y + 1, 6, 4);
      ctx2.fillStyle = "#000";
      ctx2.fillRect(x + 6, y + 2, 2, 2);
      ctx2.fillRect(x + 9, y + 2, 2, 2);
      ctx2.fillStyle = "#795548";
      ctx2.fillRect(x + 14, y - 2, 2, 14);
      ctx2.fillStyle = "#bdbdbd";
      ctx2.fillRect(x + 15, y - 2, 1, 14);
    }
    // ----- Helpers -----
    _clampToMap() {
      this.x = clamp(this.x, this.w / 2, CFG.MAP_W - this.w / 2);
      this.y = clamp(this.y, this.h / 2, CFG.MAP_H - this.h / 2);
    }
    _playSFX(id) {
      if (this.onSFX) this.onSFX(id);
    }
    _shakeScreen(type) {
      if (this.onScreenShake) this.onScreenShake(type);
    }
  };

  // src/entities/enemy.js
  var Enemy = class {
    constructor(type, x, y, hpMul, spdMul) {
      const t = CFG.ENEMY_TYPES[type];
      this.type = type;
      this.x = x;
      this.y = y;
      this.w = t.w;
      this.h = t.h;
      this.hp = Math.ceil(t.hp * hpMul);
      this.maxHp = this.hp;
      this.speed = t.speed * spdMul;
      this.dmg = t.dmg;
      this.color = t.color;
      this.isBoss = t.isBoss || false;
      this.ranged = t.ranged || false;
      this.shootTimer = t.shootCD || 0;
      this.hitCD = 0;
      this.phase = 1;
      this.chargeTimer = 0;
      this.charging = false;
      this.chargeDir = null;
      this.sprayTimer = 0;
      this.spiralAngle = 0;
      this.phaseShift = t.phaseShift || false;
      this.teleport = t.teleport || false;
      this.phShiftTimer = 0;
      this.phShiftActive = false;
      this.hasTeleported = false;
      this.teleportCD = 0;
      this.splitter = t.splitter || false;
      this.isChild = t.isChild || false;
    }
    update(dt, player, bullets) {
      if (this.hitCD > 0) this.hitCD -= dt;
      if (this._frozen && this._frozen > 0) {
        this._frozen -= dt;
        return;
      }
      if (this._slowTimer && this._slowTimer > 0) {
        this._slowTimer -= dt;
        if (this._slowTimer <= 0) this._slow = 0;
      }
      if (this.ranged) {
        const d = dist(this, player);
        if (d > 250) {
          this.moveToward(player, dt);
        } else if (d < 150) {
          this.moveAway(player, dt);
        }
        this.shootTimer -= dt;
        if (this.shootTimer <= 0) {
          const tInfo = CFG.ENEMY_TYPES[this.type] || CFG.ENEMY_TYPES.skeleton;
          this.shootTimer = tInfo.shootCD || 2;
          const dir = new V(player.x - this.x, player.y - this.y).norm();
          if (tInfo.elite) {
            const baseAngle = Math.atan2(dir.y, dir.x);
            for (let a = -1; a <= 1; a++) {
              const ang = baseAngle + a * 0.26;
              bullets.push({ x: this.x, y: this.y, vx: Math.cos(ang) * 100, vy: Math.sin(ang) * 100, w: 6, h: 6, dmg: 1.5, life: 2.5, color: "#ff5252" });
            }
          } else {
            bullets.push({ x: this.x, y: this.y, vx: dir.x * 120, vy: dir.y * 120, w: 6, h: 6, dmg: 1, life: 3, color: "#ef5350" });
          }
        }
      } else if (this.isBoss) {
        this.updateBoss(dt, player, bullets);
      } else if (this.type === "ghost") {
        this.updateGhost(dt, player);
      } else {
        this.moveToward(player, dt);
      }
    }
    updateBoss(dt, player, bullets) {
      if (this.hp <= this.maxHp / 2 && this.phase === 1) {
        this.phase = 2;
        this.sprayTimer = 0;
      }
      if (this.hp <= this.maxHp * 0.25 && this.phase < 3) {
        this.phase = 3;
        this.spiralAngle = 0;
      }
      if (this.phase === 1) {
        this.moveToward(player, dt);
      } else if (this.phase === 2) {
        this.chargeTimer -= dt;
        if (this.chargeTimer <= 0 && !this.charging) {
          this.charging = true;
          this.chargeTimer = 1.5;
          this.chargeDir = new V(player.x - this.x, player.y - this.y).norm();
        }
        if (this.charging) {
          this.x += this.chargeDir.x * this.speed * 3 * dt;
          this.y += this.chargeDir.y * this.speed * 3 * dt;
          this.chargeTimer -= dt;
          if (this.chargeTimer <= 0) {
            this.charging = false;
            this.chargeTimer = 2;
          }
        } else {
          this.moveToward(player, dt * 0.5);
        }
        this.sprayTimer -= dt;
        if (this.sprayTimer <= 0) {
          this.sprayTimer = 3;
          for (let i = 0; i < 8; i++) {
            const a = Math.PI * 2 / 8 * i;
            bullets.push({ x: this.x, y: this.y, vx: Math.cos(a) * 100, vy: Math.sin(a) * 100, w: 8, h: 8, dmg: 1, life: 2, color: "#ff5252" });
          }
        }
      } else if (this.phase === 3) {
        this.moveToward(player, dt * 1.5);
        this.sprayTimer -= dt;
        if (this.sprayTimer <= 0) {
          this.sprayTimer = 2;
          for (let i = 0; i < 16; i++) {
            const a = this.spiralAngle + Math.PI * 2 / 16 * i;
            bullets.push({ x: this.x, y: this.y, vx: Math.cos(a) * 80, vy: Math.sin(a) * 80, w: 8, h: 8, dmg: 1, life: 3, color: "#ff1744" });
          }
          this.spiralAngle += dt * 1.5;
        }
      }
    }
    moveToward(target, dt) {
      const dx = target.x - this.x, dy = target.y - this.y;
      const l = Math.hypot(dx, dy);
      const spd = this.speed * (this._slow ? 1 - this._slow : 1);
      if (l > 1) {
        this.x += dx / l * spd * dt;
        this.y += dy / l * spd * dt;
      }
    }
    updateGhost(dt, player) {
      this.phShiftTimer -= dt;
      if (this.phShiftTimer <= 0) {
        this.phShiftActive = !this.phShiftActive;
        this.phShiftTimer = this.phShiftActive ? 1 : 2;
      }
      if (this.teleport && this.hp === 1 && !this.hasTeleported) {
        this.hasTeleported = true;
        const away = Math.atan2(this.y - player.y, this.x - player.x);
        const offset = (Math.random() - 0.5) * Math.PI / 3;
        const d = rand(80, 120);
        this.x = player.x - Math.cos(away + offset) * d;
        this.y = player.y - Math.sin(away + offset) * d;
        this.x = clamp(this.x, 10, CFG.MAP_W - 10);
        this.y = clamp(this.y, 10, CFG.MAP_H - 10);
        this.teleportCD = 0.5;
      }
      if (this.teleportCD > 0) this.teleportCD -= dt;
      this.moveToward(player, dt);
    }
    hurt(dmg, isCrit) {
      if (this.type === "ghost") {
        if (this.teleportCD > 0) return;
        if (this.phShiftActive) dmg = Math.max(0, Math.floor(dmg * 0.5));
      }
      if (isCrit) dmg *= 2;
      this.hp -= dmg;
      this._lastCrit = !!isCrit;
      if (isCrit) {
        if (this._onCritText) this._onCritText(this.x, this.y - 10, dmg);
      }
    }
    moveAway(target, dt) {
      const dx = this.x - target.x, dy = this.y - target.y;
      const l = Math.hypot(dx, dy);
      const spd = this.speed * (this._slow ? 1 - this._slow : 1);
      if (l > 1) {
        this.x += dx / l * spd * dt;
        this.y += dy / l * spd * dt;
      }
    }
    draw(ctx2, cam, canvas2) {
      const s = cam.w2s(this.x, this.y, canvas2);
      const x = s.x - this.w / 2, y = s.y - this.h / 2;
      if (this.type === "zombie") {
        ctx2.fillStyle = "#4caf50";
        ctx2.fillRect(x, y, this.w, this.h);
        ctx2.fillStyle = "#2e7d32";
        ctx2.fillRect(x + 2, y + 2, 4, 4);
        ctx2.fillRect(x + 10, y + 2, 4, 4);
        ctx2.fillStyle = "#1b5e20";
        ctx2.fillRect(x + 4, y + 8, 8, 4);
        ctx2.fillStyle = "#000";
        ctx2.fillRect(x + 4, y + 4, 2, 2);
        ctx2.fillRect(x + 10, y + 4, 2, 2);
      } else if (this.type === "bat") {
        ctx2.fillStyle = "#ab47bc";
        ctx2.fillRect(x, y, this.w, this.h);
        ctx2.fillStyle = "#7b1fa2";
        ctx2.fillRect(x - 4, y + 2, 5, 5);
        ctx2.fillRect(x + this.w - 1, y + 2, 5, 5);
        ctx2.fillStyle = "#9c27b0";
        ctx2.fillRect(x - 3, y + 3, 3, 3);
        ctx2.fillRect(x + this.w, y + 3, 3, 3);
        ctx2.fillStyle = "#ffeb3b";
        ctx2.fillRect(x + 2, y + 3, 3, 3);
        ctx2.fillRect(x + 9, y + 3, 3, 3);
        ctx2.fillStyle = "#000";
        ctx2.fillRect(x + 3, y + 4, 1, 1);
        ctx2.fillRect(x + 10, y + 4, 1, 1);
      } else if (this.type === "skeleton") {
        ctx2.fillStyle = "#e0e0e0";
        ctx2.fillRect(x + 3, y, this.w - 6, this.h);
        ctx2.fillStyle = "#bdbdbd";
        ctx2.fillRect(x + 1, y + 2, 4, 10);
        ctx2.fillRect(x + 9, y + 2, 4, 10);
        ctx2.fillStyle = "#212121";
        ctx2.fillRect(x + 4, y + 2, 2, 3);
        ctx2.fillRect(x + 8, y + 2, 2, 3);
        ctx2.fillStyle = "#4e342e";
        ctx2.fillRect(x + 12, y + 4, 3, 8);
      } else if (this.type === "elite_skeleton") {
        ctx2.fillStyle = "#b71c1c";
        ctx2.fillRect(x + 4, y, this.w - 8, this.h);
        ctx2.fillStyle = "#880e4f";
        ctx2.fillRect(x + 2, y + 2, 4, 12);
        ctx2.fillRect(x + 12, y + 2, 4, 12);
        ctx2.fillStyle = "#ff1744";
        ctx2.fillRect(x + 5, y + 3, 3, 3);
        ctx2.fillRect(x + 10, y + 3, 3, 3);
        ctx2.fillStyle = "#000";
        ctx2.fillRect(x + 6, y + 4, 1, 1);
        ctx2.fillRect(x + 11, y + 4, 1, 1);
        ctx2.fillStyle = "#5d4037";
        ctx2.fillRect(x + 14, y + 3, 4, 10);
        ctx2.fillStyle = "#ffd54f";
        ctx2.fillRect(x + 5, y - 3, 3, 3);
        ctx2.fillRect(x + 10, y - 3, 3, 3);
        ctx2.fillRect(x + 7, y - 4, 4, 2);
      } else if (this.type === "ghost") {
        let alpha = 1;
        if (this.phShiftActive) {
          alpha = 0.2 + Math.sin(Date.now() * 0.02) * 0.15;
        }
        ctx2.globalAlpha = alpha;
        ctx2.fillStyle = "#b0bec5";
        ctx2.fillRect(x, y, this.w, this.h);
        ctx2.fillStyle = "#eceff1";
        ctx2.fillRect(x + 2, y + 2, this.w - 4, this.h - 4);
        ctx2.fillStyle = "#263238";
        ctx2.fillRect(x + 2, y + 3, 3, 3);
        ctx2.fillRect(x + 7, y + 3, 3, 3);
        ctx2.fillStyle = "#546e7a";
        ctx2.fillRect(x + 3, y + 8, 2, 2);
        ctx2.fillRect(x + 7, y + 8, 2, 2);
        ctx2.fillStyle = "#90a4ae";
        ctx2.fillRect(x + 1, y + this.h, 3, 3);
        ctx2.fillRect(x + 8, y + this.h, 3, 3);
        ctx2.globalAlpha = 1;
      } else if (this.type === "splitter") {
        ctx2.fillStyle = "#00897b";
        ctx2.fillRect(x, y, this.w, this.h);
        ctx2.fillStyle = "#004d40";
        ctx2.fillRect(x + 2, y + 2, 5, 5);
        ctx2.fillRect(x + 9, y + 2, 5, 5);
        ctx2.fillStyle = "#00695c";
        ctx2.fillRect(x + 1, y + 9, 14, 4);
        ctx2.fillStyle = "#b2dfdb";
        ctx2.fillRect(x + 3, y + 3, 2, 2);
        ctx2.fillRect(x + 11, y + 3, 2, 2);
        ctx2.fillStyle = "#004d40";
        ctx2.fillRect(x + 5, y + 10, 3, 2);
        ctx2.fillRect(x + 10, y + 10, 3, 2);
      } else if (this.type === "splitter_small") {
        ctx2.fillStyle = "#4db6ac";
        ctx2.fillRect(x, y, this.w, this.h);
        ctx2.fillStyle = "#80cbc4";
        ctx2.fillRect(x + 1, y + 1, this.w - 2, this.h - 2);
        ctx2.fillStyle = "#004d40";
        ctx2.fillRect(x + 2, y + 2, 2, 2);
        ctx2.fillRect(x + 5, y + 2, 2, 2);
      } else if (this.type === "boss") {
        let bodyColor, innerColor, wingColor, eyeColor, hornColor;
        if (this.phase === 3) {
          const pulse = Math.sin(Date.now() * 8e-3) * 0.3 + 0.7;
          bodyColor = `rgba(136,14,79,${pulse})`;
          innerColor = "#880e4f";
          wingColor = "#ad1457";
          eyeColor = "#ff1744";
          hornColor = "#d50000";
        } else if (this.phase === 2) {
          bodyColor = "#e65100";
          innerColor = "#bf360c";
          wingColor = "#d84315";
          eyeColor = "#ff6d00";
          hornColor = "#ff3d00";
        } else {
          bodyColor = "#d32f2f";
          innerColor = "#b71c1c";
          wingColor = "#c62828";
          eyeColor = "#ffeb3b";
          hornColor = "#ff6f00";
        }
        ctx2.fillStyle = bodyColor;
        ctx2.fillRect(x, y, this.w, this.h);
        ctx2.fillStyle = innerColor;
        ctx2.fillRect(x + 2, y + 2, 28, 28);
        ctx2.fillStyle = hornColor;
        ctx2.fillRect(x + 2, y - 6, 4, 8);
        ctx2.fillRect(x + 26, y - 6, 4, 8);
        ctx2.fillStyle = wingColor;
        ctx2.fillRect(x - 8, y + 6, 10, 16);
        ctx2.fillRect(x + 30, y + 6, 10, 16);
        ctx2.fillStyle = eyeColor;
        ctx2.fillRect(x + 8, y + 8, 5, 5);
        ctx2.fillRect(x + 19, y + 8, 5, 5);
        ctx2.fillStyle = "#000";
        ctx2.fillRect(x + 10, y + 10, 2, 2);
        ctx2.fillRect(x + 21, y + 10, 2, 2);
        ctx2.fillStyle = "#fff";
        ctx2.fillRect(x + 8, y + 20, 16, 4);
        if (this.phase === 3) {
          ctx2.fillStyle = "#ff6d00";
          ctx2.fillRect(x + 9, y + 24, 3, 3);
          ctx2.fillRect(x + 15, y + 24, 3, 3);
          ctx2.fillRect(x + 21, y + 24, 3, 3);
        }
        ctx2.fillStyle = "#000";
        ctx2.fillRect(x + 10, y + 20, 2, 4);
        ctx2.fillRect(x + 14, y + 20, 2, 4);
        ctx2.fillRect(x + 18, y + 20, 2, 4);
        ctx2.fillRect(x + 22, y + 20, 2, 4);
        ctx2.fillStyle = "#333";
        ctx2.fillRect(x, y - 12, this.w, 6);
        ctx2.fillStyle = "#f44336";
        ctx2.fillRect(x, y - 12, this.w * (this.hp / this.maxHp), 6);
        ctx2.fillStyle = "#fff";
        ctx2.font = "bold 8px monospace";
        ctx2.textAlign = "center";
        ctx2.fillText(`HP:${Math.ceil(this.hp / this.maxHp * 100)}%`, x + this.w / 2, y - 14);
      }
      if (!this.isBoss && this.hp < this.maxHp) {
        const bw = this.w;
        ctx2.fillStyle = "#333";
        ctx2.fillRect(x, y - 5, bw, 3);
        ctx2.fillStyle = this.color;
        ctx2.fillRect(x, y - 5, bw * (this.hp / this.maxHp), 3);
      }
    }
  };

  // src/entities/gem.js
  var Gem = class {
    constructor(x, y, value) {
      this.x = x;
      this.y = y;
      this.value = value;
      this.t = Math.random() * Math.PI * 2;
    }
    draw(ctx2, cam, canvas2) {
      const s = cam.w2s(this.x, this.y, canvas2);
      this.t += 0.05;
      const glow = Math.sin(this.t) * 0.3 + 0.7;
      ctx2.fillStyle = `rgba(156,39,176,${glow})`;
      ctx2.fillRect(s.x - 3, s.y - 3, 6, 6);
      ctx2.fillStyle = `rgba(206,147,216,${glow})`;
      ctx2.fillRect(s.x - 1, s.y - 1, 2, 2);
    }
  };

  // src/entities/food.js
  var Food = class {
    constructor(x, y, enemyType) {
      const ft = CFG.FOOD.types[enemyType] || CFG.FOOD.types.zombie;
      this.x = x;
      this.y = y;
      this.icon = ft.icon;
      this.color = ft.color;
      this.lifetime = CFG.FOOD.lifetime;
      this.age = 0;
    }
    update(dt, player, game) {
      this.age += dt;
      if (this.age >= this.lifetime) return false;
      let ds = distSq(this, player);
      const dir = new V(player.x - this.x, player.y - this.y).norm();
      const prSq = player.pickupRange * player.pickupRange;
      if (ds < prSq) {
        this.x += dir.x * CFG.GEM_FLY_SPEED * dt;
        this.y += dir.y * CFG.GEM_FLY_SPEED * dt;
        ds = distSq(this, player);
        if (ds < 144) {
          const wasFull = player.hp >= player.maxHp;
          player.hp = Math.min(player.hp + CFG.FOOD.healAmount, player.maxHp);
          if (wasFull) {
            game.dmgTexts.push({ x: player.x, y: player.y - 20, text: "\u{1F49A}", life: 0.6 });
          } else {
            game.dmgTexts.push({ x: player.x, y: player.y - 20, text: "\u2764\uFE0F+1", life: 0.8 });
          }
          return "picked";
        }
      } else {
        const d = Math.sqrt(ds);
        const spd = 30 + 40 * (1 - Math.min(d / 800, 1));
        this.x += dir.x * spd * dt;
        this.y += dir.y * spd * dt;
      }
      return true;
    }
    draw(ctx2, cam, canvas2) {
      const s = cam.w2s(this.x, this.y, canvas2);
      const alpha = this.lifetime - this.age < 3 ? (this.lifetime - this.age) / 3 : 1;
      ctx2.globalAlpha = alpha;
      ctx2.font = "14px sans-serif";
      ctx2.textAlign = "center";
      ctx2.textBaseline = "middle";
      ctx2.fillText(this.icon, s.x, s.y);
      ctx2.globalAlpha = 1;
    }
  };

  // src/entities/chest.js
  var Chest = class {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.w = 20;
      this.h = 16;
      this.opened = false;
      this.t = Math.random() * Math.PI * 2;
      this._noGoldShown = false;
    }
    draw(ctx2, cam, canvas2) {
      if (this.opened) return;
      const s = cam.w2s(this.x, this.y, canvas2);
      const x = s.x - this.w / 2, y = s.y - this.h / 2;
      this.t += 0.03;
      const glow = Math.sin(this.t) * 0.3 + 0.7;
      ctx2.fillStyle = `rgba(255,193,7,${glow})`;
      ctx2.fillRect(x, y, this.w, this.h);
      ctx2.fillStyle = "#ff8f00";
      ctx2.fillRect(x, y, this.w, 4);
      ctx2.fillStyle = "#ffd54f";
      ctx2.fillRect(x + 8, y + 4, 4, 5);
      ctx2.fillStyle = "#5d4037";
      ctx2.fillRect(x + 9, y + 6, 2, 2);
      ctx2.fillStyle = `rgba(255,235,59,${glow * 0.6})`;
      ctx2.fillRect(x - 2, y - 3, 3, 2);
      ctx2.fillRect(x + this.w - 1, y - 3, 3, 2);
      ctx2.fillStyle = "#ffd54f";
      ctx2.font = "bold 9px monospace";
      ctx2.textAlign = "center";
      ctx2.fillText("20\u{1F4B0}", s.x, y - 5);
    }
  };

  // src/systems/spawner.js
  function getSpawnRate(elapsed, endless) {
    if (elapsed < 60) return { interval: 2, count: 2, types: ["zombie"] };
    if (elapsed < 120) return { interval: 1.5, count: 2, types: ["zombie", "bat"] };
    if (elapsed < 150) return { interval: 1.2, count: 2, types: ["zombie", "bat", "skeleton"] };
    if (elapsed < 180) return { interval: 1, count: 3, types: ["zombie", "bat", "skeleton", "ghost"] };
    if (elapsed < 240) return { interval: 0.7, count: 3, types: ["zombie", "bat", "skeleton", "ghost", "elite_skeleton", "splitter"] };
    if (elapsed < 270) return { interval: 0.5, count: 4, types: ["zombie", "bat", "skeleton", "ghost", "elite_skeleton", "splitter"] };
    if (endless) {
      const mins = elapsed / 60;
      const scale = Math.min(mins / 5, 4);
      const interval = Math.max(0.25, 0.4 - scale * 0.05);
      const count = Math.min(8, 4 + Math.floor(scale));
      const types = ["zombie", "bat", "skeleton", "ghost", "elite_skeleton", "splitter", "splitter"];
      return { interval, count, types };
    }
    return { interval: 0.4, count: 4, types: ["zombie", "bat", "skeleton", "ghost", "elite_skeleton", "splitter", "splitter"] };
  }

  // src/ui/input.js
  var keys = {};
  var joystickInput = { x: 0, y: 0 };
  var isMobile = "ontouchstart" in window;
  var joystickEl;
  var knobEl;
  var dashBtnEl;
  var joyTouchId = null;
  function initInput() {
    joystickEl = document.getElementById("joystick");
    knobEl = document.getElementById("joystick-knob");
    dashBtnEl = document.getElementById("dash-btn");
    document.addEventListener("keydown", (e) => {
      keys[e.key.toLowerCase()] = true;
      if (e.code === "Space") e.preventDefault();
    });
    document.addEventListener("keyup", (e) => {
      keys[e.key.toLowerCase()] = false;
    });
    if (isMobile) {
      joystickEl.style.display = "block";
      dashBtnEl.style.display = "block";
    }
    dashBtnEl.addEventListener("touchstart", (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (_onDash) _onDash();
    }, { passive: false });
    joystickEl.addEventListener("touchstart", (e) => {
      e.preventDefault();
      const t = e.changedTouches[0];
      joyTouchId = t.identifier;
      handleJoyMove(t);
    }, { passive: false });
    joystickEl.addEventListener("touchmove", (e) => {
      e.preventDefault();
      for (const t of e.changedTouches) {
        if (t.identifier === joyTouchId) handleJoyMove(t);
      }
    }, { passive: false });
    joystickEl.addEventListener("touchend", (e) => {
      for (const t of e.changedTouches) {
        if (t.identifier === joyTouchId) {
          joyTouchId = null;
          joystickInput.x = 0;
          joystickInput.y = 0;
          knobEl.style.transform = "translate(-50%,-50%)";
        }
      }
    });
    document.addEventListener("keydown", (e) => {
      if (e.code === "Space" && _onDash) {
        e.preventDefault();
        _onDash();
      }
      if ((e.key === "Escape" || e.key.toLowerCase() === "p") && _onPause) {
        e.preventDefault();
        _onPause();
      }
    });
  }
  var _onDash = null;
  var _onPause = null;
  function showJoystick(show) {
    if (!isMobile) return;
    joystickEl.style.display = show ? "block" : "none";
    dashBtnEl.style.display = show ? "flex" : "none";
  }
  function handleJoyMove(touch) {
    const rect = joystickEl.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    let dx = touch.clientX - cx, dy = touch.clientY - cy;
    const maxR = rect.width / 2 - 18;
    const d = Math.hypot(dx, dy);
    if (d > maxR) {
      dx = dx / d * maxR;
      dy = dy / d * maxR;
    }
    joystickInput.x = dx / maxR;
    joystickInput.y = dy / maxR;
    knobEl.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
  }
  function getInput() {
    let x = 0, y = 0;
    if (keys["w"] || keys["arrowup"]) y = -1;
    if (keys["s"] || keys["arrowdown"]) y = 1;
    if (keys["a"] || keys["arrowleft"]) x = -1;
    if (keys["d"] || keys["arrowright"]) x = 1;
    if (joystickInput.x || joystickInput.y) {
      x = joystickInput.x;
      y = joystickInput.y;
    }
    const l = Math.hypot(x, y);
    if (l > 1) {
      x /= l;
      y /= l;
    }
    return { x, y };
  }

  // src/ui/skill-panel.js
  var _visible = false;
  function toggleSkillPanel() {
    _visible = !_visible;
    const panel = document.getElementById("skill-panel");
    panel.style.display = _visible ? "flex" : "none";
    if (_visible) updateSkillPanel();
  }
  function hideSkillPanel() {
    _visible = false;
    document.getElementById("skill-panel").style.display = "none";
  }
  function showSkillToggle() {
    document.getElementById("skill-toggle").style.display = "flex";
  }
  function hideSkillToggle() {
    document.getElementById("skill-toggle").style.display = "none";
    hideSkillPanel();
  }
  function updateSkillPanel() {
    const panel = document.getElementById("skill-panel");
    if (!panel || !_visible) return;
    const g = window.game;
    if (!g) return;
    const p = g.player;
    let html = "";
    if (p.weapons.length > 0) {
      html += '<div class="sk-section"><div class="sk-title">\u6B66\u5668</div>';
      for (const w of p.weapons) {
        const wc = CFG.WEAPONS[w.name];
        if (!wc) continue;
        const isEvolved = wc.evolved;
        const maxLvl = w.maxLevel;
        const lvlColor = isEvolved ? "#ff9100" : w.level >= maxLvl ? "#66bb6a" : "#4fc3f7";
        const lvlText = isEvolved ? "MAX" : `Lv.${w.level}/${maxLvl}`;
        const detail = getWeaponDetail(w);
        html += `<div class="sk-row">
        <span class="sk-icon">${wc.icon}</span>
        <div class="sk-info">
          <div class="sk-name">${wc.name}</div>
          <div class="sk-detail">${detail}</div>
        </div>
        <span class="sk-lvl" style="color:${lvlColor}">${lvlText}</span>
      </div>`;
      }
      html += "</div>";
    }
    const passiveKeys = Object.keys(p.passives).filter((k) => (p.passives[k] || 0) > 0);
    if (passiveKeys.length > 0) {
      html += '<div class="sk-section"><div class="sk-title">\u88AB\u52A8</div>';
      for (const key of passiveKeys) {
        const stacks = p.passives[key];
        const pc = CFG.PASSIVES[key];
        if (!pc) continue;
        const detail = getPassiveDetail(key, stacks);
        const maxed = stacks >= pc.maxStack;
        const lvlColor = maxed ? "#66bb6a" : "#aaa";
        html += `<div class="sk-row">
        <span class="sk-icon">${pc.icon}</span>
        <div class="sk-info">
          <div class="sk-name">${pc.name}</div>
          <div class="sk-detail">${detail}</div>
        </div>
        <span class="sk-lvl" style="color:${lvlColor}">x${stacks}</span>
      </div>`;
      }
      html += "</div>";
    }
    const ch = CFG.CHARACTERS[p.charId];
    if (ch && ch.classPassive) {
      html += '<div class="sk-section"><div class="sk-title">\u804C\u4E1A</div>';
      html += `<div class="sk-row">
      <span class="sk-icon">${ch.classPassive.icon}</span>
      <div class="sk-info">
        <div class="sk-name">${ch.classPassive.name}</div>
        <div class="sk-detail">${ch.classPassive.desc}</div>
      </div>
      <span class="sk-lvl" style="color:#7c4dff">\u56FA\u6709</span>
    </div>`;
      html += "</div>";
    }
    if (p.activeSynergies && p.activeSynergies.size > 0) {
      html += '<div class="sk-section"><div class="sk-title">\u534F\u540C</div>';
      for (const id of p.activeSynergies) {
        const syn = CFG.SYNERGIES[id];
        if (!syn) continue;
        html += `<div class="sk-row">
        <span class="sk-icon">${syn.icon}</span>
        <div class="sk-info">
          <div class="sk-name">${syn.name}</div>
          <div class="sk-detail">${syn.desc}</div>
        </div>
      </div>`;
      }
      html += "</div>";
    }
    if (!html) html = '<div style="color:#555;text-align:center;padding:8px">\u6682\u65E0\u6280\u80FD</div>';
    panel.innerHTML = html;
  }
  function getWeaponDetail(w) {
    const name = w.name;
    try {
      if (name === "holywater") {
        return `${w.count}\u7403 r${w.level >= 3 ? 60 : w.radius} \u4F24\u5BB3${w.dmg}`;
      }
      if (name === "knife") return `${w.count}\u5200 \u7A7F\u900F${w.pierce} \u4F24\u5BB3${w.dmg}`;
      if (name === "lightning") return `\u4F24\u5BB3${w.dmg} ${w.bolts}\u94FE${w.chains}\u8FDE`;
      if (name === "bible") return `r${w.radius} \u4F24\u5BB3${w.dmg} \u901F\u5EA6${w.speed}`;
      if (name === "firestaff") return `\u4F24\u5BB3${w.dps} \u71C3\u70E7${w.burnDps || 0}`;
      if (name === "frostaura") return `r${w.radius} \u51CF\u901F${Math.round(w.slow * 100)}% \u4F24\u5BB3${w.dps}`;
      if (name === "boomerang") {
        const d = w.getLevelData();
        return `${d.count}\u9556 \u4F24\u5BB3${d.dmg} \u7A7F\u900F${d.pierce}`;
      }
      if (name === "blizzard") return `r${w.radius} \u4F24\u5BB3${w.dps} \u51B0\u51BB${Math.round(w.freezeChance * 100)}%`;
      if (name === "thunderholywater") return `${w.count}\u7403 \u95EA\u7535${w.lightningDmg}`;
      if (name === "fireknife") return `${w.count}\u5200 \u7A7F\u900F${w.pierce} \u71C3\u70E7${w.burnDps}`;
      if (name === "holydomain") return `${w.orbCount}\u7403 r${w.radius} \u8109\u51B2${w.pulseDmg}`;
      if (name === "frostknife") return `${w.count}\u5200 \u7A7F\u900F${w.pierce} \u51CF\u901F${Math.round(w.slowAmount * 100)}%`;
      if (name === "flamebible") return `r${w.radius} \u4F24\u5BB3${w.dps} \u71C3\u70E7${w.burnDps}`;
      if (name === "thunderang") return `${CFG.BOOMERANG.thunderang.count}\u9556 \u95EA\u7535\u94FE`;
      if (name === "blazerang") return `${CFG.BOOMERANG.blazerang.count}\u9556 \u706B\u7130\u8F68\u8FF9`;
    } catch (e) {
    }
    return "";
  }
  function getPassiveDetail(key, stacks) {
    if (key === "speedboots") return `\u79FB\u901F+${stacks * 15}%`;
    if (key === "armor") return `\u53D7\u4F24-${stacks}`;
    if (key === "magnet") return `\u7ECF\u9A8C+${stacks * 30}%`;
    if (key === "crit") return `\u66B4\u51FB+${stacks * 8}%`;
    if (key === "maxhp") return `HP+${stacks * 2}`;
    if (key === "regen") {
      const intervals = [5, 4, 3];
      const interval = intervals[Math.min(stacks - 1, 2)];
      return `\u6BCF${interval}\u79D2+1HP`;
    }
    if (key === "luckycoin") return `\u66B4\u4F24+${stacks * 50}% \u91D1\u5E01+${stacks * 15}%`;
    return CFG.PASSIVES[key]?.desc || "";
  }
  window.toggleSkillPanel = toggleSkillPanel;

  // src/ui/scenes.js
  var ALL_SCENES = ["title-screen", "char-select", "diff-select", "weapon-select", "upgrade-panel", "result-screen", "quest-panel", "shop-panel", "achievement-panel"];
  function showScene(id) {
    ALL_SCENES.forEach((s) => {
      document.getElementById(s).style.display = s === id ? "flex" : "none";
    });
    const show = id === "weapon-select" || id === "char-select" || id === "title-screen" || id === "result-screen";
    document.getElementById("hud").style.display = show ? "none" : "flex";
    document.getElementById("skill-toggle").style.display = show ? "none" : "flex";
    document.getElementById("exp-bar-wrap").style.display = show ? "none" : "block";
    document.getElementById("minimap").style.display = show ? "none" : "block";
    if (isMobile) {
      document.getElementById("joystick").style.display = show ? "none" : "block";
      document.getElementById("dash-btn").style.display = show ? "none" : "flex";
    }
    document.getElementById("pause-menu").style.display = "none";
    document.getElementById("pause-confirm").style.display = "none";
  }

  // src/weapons/registry.js
  var Weapon = class {
    constructor(name, owner) {
      this.name = name;
      this.owner = owner;
      this.level = 1;
      this.timer = 0;
    }
    get maxLevel() {
      return 3;
    }
    /** Apply shop weaponDmg upgrade multiplier to base damage */
    applyDmg(base) {
      return base * (window.game && window.game.weaponDmgMul || 1);
    }
    /** Find nearest alive enemy within maxDist (uses distSq, no sqrt) */
    findNearestEnemy(enemies, fromX, fromY, maxDist) {
      let best = null, bestD = maxDist * maxDist;
      for (const e of enemies) {
        if (e.hp <= 0) continue;
        const d = (e.x - fromX) ** 2 + (e.y - fromY) ** 2;
        if (d < bestD) {
          bestD = d;
          best = e;
        }
      }
      return best;
    }
  };
  var HolyWater = class extends Weapon {
    constructor(owner) {
      super("holywater", owner);
      this.angle = 0;
      this.radius = 50;
    }
    get count() {
      return this.level;
    }
    get dmg() {
      return this.level >= 2 ? 2 : 1.5;
    }
    update(dt, enemies) {
      this.angle += dt * 3;
      const bonus = this.owner.getWeaponBonus ? this.owner.getWeaponBonus("holywater") : {};
      const r = (this.level >= 3 ? 60 : this.radius) * (bonus.radiusMul || 1);
      for (let i = 0; i < this.count; i++) {
        const a = this.angle + Math.PI * 2 / this.count * i;
        const bx = this.owner.x + Math.cos(a) * r;
        const by = this.owner.y + Math.sin(a) * r;
        for (let j = enemies.length - 1; j >= 0; j--) {
          const e = enemies[j];
          if (Math.abs(bx - e.x) < 12 + e.w / 2 && Math.abs(by - e.y) < 12 + e.h / 2) {
            e.hurt(this.applyDmg(this.dmg * dt * 15));
          }
        }
      }
    }
    draw(ctx2, cam, canvas2) {
      const r = this.level >= 3 ? 60 : this.radius;
      for (let i = 0; i < this.count; i++) {
        const a = this.angle + Math.PI * 2 / this.count * i;
        const bx = this.owner.x + Math.cos(a) * r;
        const by = this.owner.y + Math.sin(a) * r;
        const s = cam.w2s(bx, by, canvas2);
        ctx2.fillStyle = "#29b6f6";
        ctx2.fillRect(s.x - 5, s.y - 5, 10, 10);
        ctx2.fillStyle = "#0288d1";
        ctx2.fillRect(s.x - 3, s.y - 3, 6, 6);
        ctx2.fillStyle = "#b3e5fc";
        ctx2.fillRect(s.x - 1, s.y - 1, 2, 2);
      }
    }
  };
  var Knife = class extends Weapon {
    constructor(owner) {
      super("knife", owner);
      this.cd = 0.7;
    }
    get count() {
      return this.level;
    }
    get dmg() {
      return this.level >= 2 ? 2.6 : 2;
    }
    get pierce() {
      return this.level >= 3 ? 1 : 0;
    }
    get _canCrit() {
      const bonus = this.owner.getWeaponBonus ? this.owner.getWeaponBonus("knife") : {};
      return !!bonus.canCrit;
    }
    update(dt, enemies, bullets, sfx) {
      this.timer -= dt;
      if (this.timer <= 0) {
        this.timer = this.cd;
        let nearest = null, nd = Infinity;
        for (const e of enemies) {
          const d = dist(this.owner, e);
          if (d < nd) {
            nd = d;
            nearest = e;
          }
        }
        if (nearest) {
          if (sfx) sfx("knife");
          for (let i = 0; i < this.count; i++) {
            const dir = new V(nearest.x - this.owner.x, nearest.y - this.owner.y).norm();
            const spread = i > 0 ? i % 2 === 1 ? 0.15 : -0.15 : 0;
            const cos = Math.cos(spread), sin = Math.sin(spread);
            const dx = dir.x * cos - dir.y * sin;
            const dy = dir.x * sin + dir.y * cos;
            if (bullets.length < CFG.MAX_BULLETS) {
              bullets.push({ x: this.owner.x, y: this.owner.y, vx: dx * 250, vy: dy * 250, w: 4, h: 4, dmg: this.applyDmg(this.dmg), life: 1.5, color: "#ffd54f", pierce: this.pierce, hit: /* @__PURE__ */ new Set() });
            }
          }
        }
      }
    }
  };
  var Lightning = class extends Weapon {
    constructor(owner) {
      super("lightning", owner);
      this.cd = 2;
      this.timer = 0;
      this.effects = [];
    }
    get dmg() {
      return this.level >= 2 ? 6 : 5;
    }
    get chains() {
      return this.level >= 3 ? 2 : this.level >= 2 ? 1 : 0;
    }
    get bolts() {
      return this.level >= 3 ? 2 : 1;
    }
    update(dt, enemies, sfx, playerCritsFn) {
      this.timer -= dt;
      for (let i = this.effects.length - 1; i >= 0; i--) {
        this.effects[i].t -= dt;
        if (this.effects[i].t <= 0) this.effects.splice(i, 1);
      }
      if (this.timer <= 0) {
        this.timer = this.cd;
        const bonus = this.owner.getWeaponBonus ? this.owner.getWeaponBonus("lightning") : {};
        const range = 400 + (bonus.rangeBonus || 0);
        const extraChains = bonus.extraChains || 0;
        const screenEnemies = enemies.filter((e) => dist(this.owner, e) < range);
        for (let b = 0; b < this.bolts && screenEnemies.length > 0; b++) {
          const idx = randInt(0, screenEnemies.length - 1);
          const target = screenEnemies[idx];
          target.hurt(this.applyDmg(this.dmg), playerCritsFn ? playerCritsFn() : false);
          if (sfx) sfx("lightning");
          this.effects.push({ x0: this.owner.x, y0: this.owner.y, x1: target.x, y1: target.y, t: 0.2 });
          let prev = target;
          const hit = /* @__PURE__ */ new Set([target]);
          for (let c = 0; c < this.chains + extraChains; c++) {
            let next = null, nd = Infinity;
            for (const e of enemies) {
              if (hit.has(e)) continue;
              const d = dist(prev, e);
              if (d < 150 && d < nd) {
                nd = d;
                next = e;
              }
            }
            if (next) {
              next.hurt(this.applyDmg(this.dmg * 0.5));
              hit.add(next);
              this.effects.push({ x0: prev.x, y0: prev.y, x1: next.x, y1: next.y, t: 0.2 });
              prev = next;
            }
          }
        }
      }
    }
    draw(ctx2, cam, canvas2) {
      for (const e of this.effects) {
        const s0 = cam.w2s(e.x0, e.y0, canvas2);
        const s1 = cam.w2s(e.x1, e.y1, canvas2);
        ctx2.strokeStyle = `rgba(255,235,59,${e.t * 5})`;
        ctx2.lineWidth = 2;
        ctx2.beginPath();
        ctx2.moveTo(s0.x, s0.y);
        const steps = 4;
        for (let i = 1; i <= steps; i++) {
          const t = i / steps;
          ctx2.lineTo(
            s0.x + (s1.x - s0.x) * t + (Math.random() - 0.5) * 16,
            s0.y + (s1.y - s0.y) * t + (Math.random() - 0.5) * 16
          );
        }
        ctx2.lineTo(s1.x, s1.y);
        ctx2.stroke();
      }
    }
  };
  var Bible = class extends Weapon {
    constructor(owner) {
      super("bible", owner);
      this.angle = 0;
      this.hitTimers = /* @__PURE__ */ new Map();
    }
    get radius() {
      return this.level >= 3 ? 120 : this.level >= 2 ? 104 : 80;
    }
    get dmg() {
      return this.level >= 3 ? 2 : 1;
    }
    get speed() {
      return this.level >= 2 ? 3.6 : 3;
    }
    update(dt, enemies) {
      const bonus = this.owner.getWeaponBonus ? this.owner.getWeaponBonus("bible") : {};
      const spd = this.speed * (bonus.speedMul || 1);
      const rad = this.radius + (bonus.radiusBonus || 0);
      this.angle += dt * spd;
      for (const e of enemies) {
        const d = dist(this.owner, e);
        if (d < rad) {
          if (!this.hitTimers.has(e)) this.hitTimers.set(e, 0);
          const ht = this.hitTimers.get(e);
          if (ht <= 0) {
            e.hurt(this.applyDmg(this.dmg));
            this.hitTimers.set(e, 0.3);
          } else {
            this.hitTimers.set(e, ht - dt);
          }
        }
      }
      for (const [e] of this.hitTimers) {
        if (!enemies.includes(e)) this.hitTimers.delete(e);
      }
    }
    draw(ctx2, cam, canvas2) {
      const s = cam.w2s(this.owner.x, this.owner.y, canvas2);
      const bonus = this.owner.getWeaponBonus ? this.owner.getWeaponBonus("bible") : {};
      const rad = this.radius + (bonus.radiusBonus || 0);
      ctx2.strokeStyle = `rgba(255,193,7,${0.3 + Math.sin(this.angle * 2) * 0.15})`;
      ctx2.lineWidth = 3;
      ctx2.beginPath();
      ctx2.arc(s.x, s.y, rad, 0, Math.PI * 2);
      ctx2.stroke();
      for (let i = 0; i < 2; i++) {
        const a = this.angle + Math.PI * i;
        const cx = s.x + Math.cos(a) * rad * 0.6;
        const cy = s.y + Math.sin(a) * rad * 0.6;
        ctx2.save();
        ctx2.translate(cx, cy);
        ctx2.rotate(a + Math.PI / 2);
        ctx2.fillStyle = "#ffc107";
        ctx2.fillRect(-14, -5, 28, 10);
        ctx2.fillStyle = "#ff8f00";
        ctx2.fillRect(-14, -5, 28, 2);
        ctx2.fillRect(-14, 3, 28, 2);
        ctx2.fillStyle = "#5d4037";
        ctx2.fillRect(-10, -1, 20, 1);
        ctx2.fillRect(-10, 1, 16, 1);
        ctx2.restore();
      }
    }
  };
  var FireStaff = class extends Weapon {
    constructor(owner) {
      super("firestaff", owner);
    }
    get coneWidth() {
      return this.level >= 3 ? 120 : this.level >= 2 ? 100 : 80;
    }
    get coneRange() {
      return this.level >= 3 ? 160 : this.level >= 2 ? 130 : 100;
    }
    get dps() {
      return this.level >= 3 ? 7 : this.level >= 2 ? 5 : 3;
    }
    get burnDps() {
      return this.level >= 3 ? 2 : 0;
    }
    update(dt, enemies) {
      const bonus = this.owner.getWeaponBonus ? this.owner.getWeaponBonus("firestaff") : {};
      const angle = this.owner.facingAngle;
      const range = this.coneRange + (bonus.coneBonus || 0);
      const burnDurBonus = bonus.burnDurBonus || 0;
      const halfArc = Math.PI / 6;
      for (const e of enemies) {
        const dx = e.x - this.owner.x, dy = e.y - this.owner.y;
        const d = Math.hypot(dx, dy);
        if (d < range && d > 1) {
          const ea = Math.atan2(dy, dx);
          let diff = ea - angle;
          while (diff > Math.PI) diff -= Math.PI * 2;
          while (diff < -Math.PI) diff += Math.PI * 2;
          if (Math.abs(diff) < halfArc) {
            e.hurt(this.applyDmg(this.dps * dt));
            if (!e._burn) e._burn = { dmg: 0, t: 0 };
            if (this.burnDps > 0) {
              e._burn.dmg = this.applyDmg(this.burnDps);
              e._burn.t = 2 + burnDurBonus;
            }
          }
        }
      }
      for (const e of enemies) {
        if (e._burn && e._burn.t > 0) {
          if (!this._isInCone(e)) {
            e.hurt(e._burn.dmg * dt);
          }
          e._burn.t -= dt;
          if (e._burn.t <= 0) e._burn = null;
        }
      }
    }
    _isInCone(e) {
      const dx = e.x - this.owner.x, dy = e.y - this.owner.y;
      const d = Math.hypot(dx, dy);
      if (d >= this.coneRange || d < 1) return false;
      let diff = Math.atan2(dy, dx) - this.owner.facingAngle;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      return Math.abs(diff) < Math.PI / 6;
    }
    draw(ctx2, cam, canvas2) {
      const s = cam.w2s(this.owner.x, this.owner.y, canvas2);
      const angle = this.owner.facingAngle;
      const range = this.coneRange;
      const halfArc = Math.PI / 6;
      const grad = ctx2.createRadialGradient(s.x, s.y, 5, s.x, s.y, range);
      grad.addColorStop(0, "rgba(255,152,0,0.5)");
      grad.addColorStop(0.6, "rgba(255,87,34,0.3)");
      grad.addColorStop(1, "rgba(255,87,34,0)");
      ctx2.fillStyle = grad;
      ctx2.beginPath();
      ctx2.moveTo(s.x, s.y);
      ctx2.arc(s.x, s.y, range, angle - halfArc, angle + halfArc);
      ctx2.closePath();
      ctx2.fill();
      const grad2 = ctx2.createRadialGradient(s.x, s.y, 3, s.x, s.y, range * 0.4);
      grad2.addColorStop(0, "rgba(255,235,59,0.6)");
      grad2.addColorStop(1, "rgba(255,152,0,0)");
      ctx2.fillStyle = grad2;
      ctx2.beginPath();
      ctx2.moveTo(s.x, s.y);
      ctx2.arc(s.x, s.y, range * 0.4, angle - halfArc * 0.7, angle + halfArc * 0.7);
      ctx2.closePath();
      ctx2.fill();
      const tipCount = this.level + 2;
      for (let i = 0; i < tipCount; i++) {
        const t = 0.4 + 0.6 * i / tipCount;
        const a = angle - halfArc + halfArc * 2 * i / tipCount;
        const flicker = rand(0.7, 1);
        const r = range * t * flicker;
        const tx = s.x + Math.cos(a) * r;
        const ty = s.y + Math.sin(a) * r;
        ctx2.fillStyle = `rgba(255,${Math.floor(rand(100, 200))},0,${0.4 * flicker})`;
        ctx2.fillRect(tx - 2, ty - 2, 4, 4);
        ctx2.fillStyle = `rgba(255,235,59,${0.3 * flicker})`;
        ctx2.fillRect(tx - 1, ty - 1, 2, 2);
      }
    }
  };
  var FrostAura = class extends Weapon {
    constructor(owner) {
      super("frostaura", owner);
      this.pulseTimer = 0;
    }
    get radius() {
      return this.level >= 3 ? 130 : this.level >= 2 ? 100 : 80;
    }
    get slow() {
      return this.level >= 3 ? 0.6 : this.level >= 2 ? 0.45 : 0.3;
    }
    get dps() {
      return this.level >= 3 ? 2 : this.level >= 2 ? 1.5 : 1;
    }
    get freezeChance() {
      return this.level >= 3 ? 0.08 : 0;
    }
    get freezeDur() {
      return this.level >= 3 ? 1.5 : 0;
    }
    update(dt, enemies, sfx) {
      this.pulseTimer += dt;
      const bonus = this.owner.getWeaponBonus ? this.owner.getWeaponBonus("frostaura") : {};
      const freezeBonus = bonus.freezeBonus || 0;
      const freezeDurBonus = bonus.freezeDurBonus || 0;
      for (const e of enemies) {
        const d = dist(this.owner, e);
        if (d < this.radius) {
          e.hurt(this.applyDmg(this.dps * dt));
          if (!e._slow || e._slow < this.slow) e._slow = this.slow;
          e._slowTimer = 0.5;
          const totalFreezeChance = this.freezeChance + freezeBonus;
          if (totalFreezeChance > 0 && Math.random() < totalFreezeChance * dt) {
            e._frozen = this.freezeDur + freezeDurBonus;
            if (sfx) sfx("freeze");
          }
        }
      }
    }
    draw(ctx2, cam, canvas2) {
      const s = cam.w2s(this.owner.x, this.owner.y, canvas2);
      const r = this.radius;
      const pulse = Math.sin(this.pulseTimer * 2) * 0.15 + 0.35;
      ctx2.strokeStyle = `rgba(144,202,249,${pulse})`;
      ctx2.lineWidth = 3;
      ctx2.beginPath();
      ctx2.arc(s.x, s.y, r, 0, Math.PI * 2);
      ctx2.stroke();
      const grad = ctx2.createRadialGradient(s.x, s.y, 5, s.x, s.y, r);
      grad.addColorStop(0, "rgba(179,229,252,0.15)");
      grad.addColorStop(0.7, "rgba(144,202,249,0.08)");
      grad.addColorStop(1, "rgba(144,202,249,0)");
      ctx2.fillStyle = grad;
      ctx2.beginPath();
      ctx2.arc(s.x, s.y, r, 0, Math.PI * 2);
      ctx2.fill();
      if (this.pulseTimer % 2 < 0.1) {
        const pr = r * 1.3;
        ctx2.strokeStyle = `rgba(179,229,252,${0.5 - this.pulseTimer % 2 * 0.25})`;
        ctx2.lineWidth = 2;
        ctx2.beginPath();
        ctx2.arc(s.x, s.y, pr, 0, Math.PI * 2);
        ctx2.stroke();
      }
      for (let i = 0; i < 3; i++) {
        const a = this.pulseTimer * 0.5 + Math.PI * 2 / 3 * i;
        const pr = r * 0.7;
        const px = s.x + Math.cos(a) * pr;
        const py = s.y + Math.sin(a) * pr;
        ctx2.fillStyle = `rgba(255,255,255,${0.3 + Math.sin(this.pulseTimer * 3 + i) * 0.2})`;
        ctx2.fillRect(px - 1, py - 1, 3, 3);
      }
    }
  };
  var Blizzard = class extends Weapon {
    constructor(owner) {
      super("blizzard", owner);
      this.angle = 0;
      this.lightningTimer = 0;
      this.shardTimer = 0;
      this.pulseTimer = 0;
      this.effects = [];
      this.shards = [];
    }
    get maxLevel() {
      return 1;
    }
    get radius() {
      return 160;
    }
    get slow() {
      return 0.7;
    }
    get dps() {
      return 3;
    }
    get freezeChance() {
      return 0.15;
    }
    get freezeDur() {
      return 2;
    }
    get lightningCD() {
      return 2;
    }
    get lightningDmg() {
      return 8;
    }
    get lightningChains() {
      return 2;
    }
    get shardCD() {
      return 3;
    }
    get shardDmg() {
      return 4;
    }
    get shardCount() {
      return 12;
    }
    update(dt, enemies, sfx, playerCritsFn) {
      this.angle += dt * 2;
      this.pulseTimer += dt;
      for (const e of enemies) {
        const d = dist(this.owner, e);
        if (d < this.radius) {
          e.hurt(this.applyDmg(this.dps * dt));
          if (!e._slow || e._slow < this.slow) e._slow = this.slow;
          e._slowTimer = 0.5;
          if (this.freezeChance > 0 && Math.random() < this.freezeChance * dt) {
            e._frozen = this.freezeDur;
            if (sfx) sfx("freeze");
          }
        }
      }
      this.lightningTimer -= dt;
      for (let i = this.effects.length - 1; i >= 0; i--) {
        this.effects[i].t -= dt;
        if (this.effects[i].t <= 0) this.effects.splice(i, 1);
      }
      if (this.lightningTimer <= 0) {
        this.lightningTimer = this.lightningCD;
        const nearEnemies = enemies.filter((e) => dist(this.owner, e) < this.radius);
        for (let b = 0; b < 3 && nearEnemies.length > 0; b++) {
          const idx = randInt(0, nearEnemies.length - 1);
          const target = nearEnemies[idx];
          target.hurt(this.applyDmg(this.lightningDmg));
          this.effects.push({ x0: this.owner.x, y0: this.owner.y, x1: target.x, y1: target.y, t: 0.2 });
          const hit = /* @__PURE__ */ new Set([target]);
          let prev = target;
          for (let c = 0; c < this.lightningChains; c++) {
            let next = null, nd = Infinity;
            for (const e of enemies) {
              if (hit.has(e)) continue;
              const d = dist(prev, e);
              if (d < 150 && d < nd) {
                nd = d;
                next = e;
              }
            }
            if (next) {
              next.hurt(this.applyDmg(this.lightningDmg * 0.5));
              hit.add(next);
              this.effects.push({ x0: prev.x, y0: prev.y, x1: next.x, y1: next.y, t: 0.2 });
              prev = next;
            }
          }
        }
      }
      this.shardTimer -= dt;
      for (let i = this.shards.length - 1; i >= 0; i--) {
        const s = this.shards[i];
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        s.life -= dt;
        if (s.life <= 0) {
          this.shards.splice(i, 1);
          continue;
        }
        for (const e of enemies) {
          if (s.hit.has(e)) continue;
          if (Math.abs(s.x - e.x) < 6 + e.w / 2 && Math.abs(s.y - e.y) < 6 + e.h / 2) {
            e.hurt(this.applyDmg(this.shardDmg), playerCritsFn ? playerCritsFn() : false);
            s.hit.add(e);
            break;
          }
        }
      }
      if (this.shardTimer <= 0) {
        this.shardTimer = this.shardCD;
        for (let i = 0; i < this.shardCount; i++) {
          const a = Math.PI * 2 / this.shardCount * i;
          this.shards.push({ x: this.owner.x, y: this.owner.y, vx: Math.cos(a) * 120, vy: Math.sin(a) * 120, life: 0.7, hit: /* @__PURE__ */ new Set() });
        }
      }
    }
    draw(ctx2, cam, canvas2) {
      const s = cam.w2s(this.owner.x, this.owner.y, canvas2);
      const r = this.radius;
      const pulse = Math.sin(this.pulseTimer * 2) * 0.15 + 0.35;
      ctx2.strokeStyle = `rgba(100,181,246,${pulse})`;
      ctx2.lineWidth = 4;
      ctx2.beginPath();
      ctx2.arc(s.x, s.y, r, 0, Math.PI * 2);
      ctx2.stroke();
      const grad = ctx2.createRadialGradient(s.x, s.y, 5, s.x, s.y, r);
      grad.addColorStop(0, "rgba(179,229,252,0.2)");
      grad.addColorStop(0.6, "rgba(144,202,249,0.1)");
      grad.addColorStop(1, "rgba(100,181,246,0)");
      ctx2.fillStyle = grad;
      ctx2.beginPath();
      ctx2.arc(s.x, s.y, r, 0, Math.PI * 2);
      ctx2.fill();
      const flashPulse = Math.sin(this.pulseTimer * 8) * 0.5 + 0.5;
      if (flashPulse > 0.7) {
        ctx2.fillStyle = `rgba(255,235,59,${(flashPulse - 0.7) * 0.3})`;
        ctx2.beginPath();
        ctx2.arc(s.x, s.y, r * 0.3, 0, Math.PI * 2);
        ctx2.fill();
      }
      for (let i = 0; i < 6; i++) {
        const a = this.pulseTimer * 0.8 + Math.PI * 2 / 6 * i;
        const px = s.x + Math.cos(a) * r * 0.6;
        const py = s.y + Math.sin(a) * r * 0.6;
        ctx2.fillStyle = `rgba(255,255,255,${0.3 + Math.sin(this.pulseTimer * 3 + i) * 0.2})`;
        ctx2.fillRect(px - 1, py - 1, 3, 3);
      }
      ctx2.strokeStyle = `rgba(255,215,0,${pulse * 0.7})`;
      ctx2.lineWidth = 2;
      ctx2.beginPath();
      ctx2.arc(s.x, s.y, r + 12, 0, Math.PI * 2);
      ctx2.stroke();
      for (const e of this.effects) {
        const s0 = cam.w2s(e.x0, e.y0, canvas2);
        const s1 = cam.w2s(e.x1, e.y1, canvas2);
        ctx2.strokeStyle = `rgba(255,235,59,${e.t * 5})`;
        ctx2.lineWidth = 2;
        ctx2.beginPath();
        ctx2.moveTo(s0.x, s0.y);
        for (let i = 1; i <= 4; i++) {
          const t = i / 4;
          ctx2.lineTo(
            s0.x + (s1.x - s0.x) * t + (Math.random() - 0.5) * 14,
            s0.y + (s1.y - s0.y) * t + (Math.random() - 0.5) * 14
          );
        }
        ctx2.lineTo(s1.x, s1.y);
        ctx2.stroke();
      }
      for (const sh of this.shards) {
        const ss = cam.w2s(sh.x, sh.y, canvas2);
        const alpha = sh.life / 0.7;
        ctx2.fillStyle = `rgba(179,229,252,${alpha})`;
        ctx2.fillRect(ss.x - 3, ss.y - 3, 6, 6);
        ctx2.fillStyle = `rgba(255,255,255,${alpha * 0.7})`;
        ctx2.fillRect(ss.x - 1, ss.y - 1, 2, 2);
      }
    }
  };
  var ThunderHolyWater = class extends Weapon {
    constructor(owner) {
      super("thunderholywater", owner);
      this.angle = 0;
      this.lightningTimer = 0;
      this.effects = [];
    }
    get maxLevel() {
      return 1;
    }
    get count() {
      return 3;
    }
    get radius() {
      return 60;
    }
    get dmg() {
      return 1.5;
    }
    get lightningDmg() {
      return 6;
    }
    get chains() {
      return 3;
    }
    get lightningCD() {
      return 2;
    }
    update(dt, enemies) {
      this.angle += dt * 3;
      for (let i = 0; i < this.count; i++) {
        const a = this.angle + Math.PI * 2 / this.count * i;
        const bx = this.owner.x + Math.cos(a) * this.radius;
        const by = this.owner.y + Math.sin(a) * this.radius;
        for (const e of enemies) {
          if (Math.abs(bx - e.x) < 12 + e.w / 2 && Math.abs(by - e.y) < 12 + e.h / 2) {
            e.hurt(this.applyDmg(this.dmg * dt * 15));
          }
        }
      }
      this.lightningTimer -= dt;
      for (let i = this.effects.length - 1; i >= 0; i--) {
        this.effects[i].t -= dt;
        if (this.effects[i].t <= 0) this.effects.splice(i, 1);
      }
      if (this.lightningTimer <= 0) {
        this.lightningTimer = this.lightningCD;
        const nearEnemies = enemies.filter((e) => dist(this.owner, e) < 250);
        for (let i = 0; i < this.count && nearEnemies.length > 0; i++) {
          const a = this.angle + Math.PI * 2 / this.count * i;
          const bx = this.owner.x + Math.cos(a) * this.radius;
          const by = this.owner.y + Math.sin(a) * this.radius;
          let nearest = null, nd = Infinity;
          for (const e of nearEnemies) {
            const d = Math.hypot(bx - e.x, by - e.y);
            if (d < nd) {
              nd = d;
              nearest = e;
            }
          }
          if (nearest) {
            nearest.hurt(this.applyDmg(this.lightningDmg));
            this.effects.push({ x0: bx, y0: by, x1: nearest.x, y1: nearest.y, t: 0.2 });
            const hit = /* @__PURE__ */ new Set([nearest]);
            let prev = nearest;
            for (let c = 0; c < this.chains; c++) {
              let next = null;
              nd = Infinity;
              for (const e of enemies) {
                if (hit.has(e)) continue;
                const d = dist(prev, e);
                if (d < 150 && d < nd) {
                  nd = d;
                  next = e;
                }
              }
              if (next) {
                next.hurt(this.applyDmg(this.lightningDmg * 0.5));
                hit.add(next);
                this.effects.push({ x0: prev.x, y0: prev.y, x1: next.x, y1: next.y, t: 0.2 });
                prev = next;
              }
            }
          }
        }
      }
    }
    draw(ctx2, cam, canvas2) {
      const r = this.radius;
      for (let i = 0; i < this.count; i++) {
        const a = this.angle + Math.PI * 2 / this.count * i;
        const bx = this.owner.x + Math.cos(a) * r;
        const by = this.owner.y + Math.sin(a) * r;
        const s = cam.w2s(bx, by, canvas2);
        ctx2.fillStyle = "rgba(255,235,59,0.3)";
        ctx2.fillRect(s.x - 8, s.y - 8, 16, 16);
        ctx2.fillStyle = "#29b6f6";
        ctx2.fillRect(s.x - 5, s.y - 5, 10, 10);
        ctx2.fillStyle = "#0288d1";
        ctx2.fillRect(s.x - 3, s.y - 3, 6, 6);
        ctx2.fillStyle = "#ffeb3b";
        ctx2.fillRect(s.x - 1, s.y - 1, 2, 2);
      }
      for (const e of this.effects) {
        const s0 = cam.w2s(e.x0, e.y0, canvas2);
        const s1 = cam.w2s(e.x1, e.y1, canvas2);
        ctx2.strokeStyle = `rgba(255,235,59,${e.t * 5})`;
        ctx2.lineWidth = 2;
        ctx2.beginPath();
        ctx2.moveTo(s0.x, s0.y);
        for (let i = 1; i <= 4; i++) {
          const t = i / 4;
          ctx2.lineTo(
            s0.x + (s1.x - s0.x) * t + (Math.random() - 0.5) * 14,
            s0.y + (s1.y - s0.y) * t + (Math.random() - 0.5) * 14
          );
        }
        ctx2.lineTo(s1.x, s1.y);
        ctx2.stroke();
      }
      const cs = cam.w2s(this.owner.x, this.owner.y, canvas2);
      const pulse = Math.sin(Date.now() * 4e-3) * 0.15 + 0.35;
      ctx2.strokeStyle = `rgba(255,145,0,${pulse})`;
      ctx2.lineWidth = 2;
      ctx2.beginPath();
      ctx2.arc(cs.x, cs.y, r + 10, 0, Math.PI * 2);
      ctx2.stroke();
    }
  };
  var FireKnife = class extends Weapon {
    constructor(owner) {
      super("fireknife", owner);
      this.timer = 0;
    }
    get maxLevel() {
      return 1;
    }
    get count() {
      return 5;
    }
    get dmg() {
      return 3;
    }
    get pierce() {
      return 2;
    }
    get burnDps() {
      return 3;
    }
    get burnDur() {
      return 2;
    }
    get cd() {
      return 0.5;
    }
    update(dt, enemies, bullets) {
      this.timer -= dt;
      if (this.timer <= 0) {
        this.timer = this.cd;
        let nearest = null, nd = Infinity;
        for (const e of enemies) {
          const d = dist(this.owner, e);
          if (d < nd) {
            nd = d;
            nearest = e;
          }
        }
        if (nearest) {
          for (let i = 0; i < this.count; i++) {
            const dir = new V(nearest.x - this.owner.x, nearest.y - this.owner.y).norm();
            const spread = i > 0 ? (i % 2 === 1 ? 0.12 : -0.12) * Math.ceil(i / 2) : 0;
            const cos = Math.cos(spread), sin = Math.sin(spread);
            const dx = dir.x * cos - dir.y * sin;
            const dy = dir.x * sin + dir.y * cos;
            if (bullets.length < CFG.MAX_BULLETS) {
              bullets.push({
                x: this.owner.x,
                y: this.owner.y,
                vx: dx * 280,
                vy: dy * 280,
                w: 6,
                h: 4,
                dmg: this.applyDmg(this.dmg),
                life: 1.8,
                color: "#ff6d00",
                pierce: this.pierce,
                hit: /* @__PURE__ */ new Set(),
                burnDmg: this.applyDmg(this.burnDps),
                burnDur: this.burnDur
              });
            }
          }
        }
      }
    }
  };
  var HolyDomain = class extends Weapon {
    constructor(owner) {
      super("holydomain", owner);
      this.angle = 0;
      this.pulseTimer = 0;
      this.pulseEffects = [];
    }
    get maxLevel() {
      return 1;
    }
    get radius() {
      return 130;
    }
    get orbCount() {
      return 4;
    }
    get orbDps() {
      return 2.5;
    }
    get pulseInterval() {
      return 4;
    }
    get pulseDmg() {
      return 12;
    }
    get pulseRadius() {
      return 200;
    }
    update(dt, enemies, sfx, playerCritsFn) {
      this.angle += dt * 4;
      for (let i = 0; i < this.orbCount; i++) {
        const a = this.angle + Math.PI * 2 / this.orbCount * i;
        const bx = this.owner.x + Math.cos(a) * this.radius;
        const by = this.owner.y + Math.sin(a) * this.radius;
        for (const e of enemies) {
          if (Math.abs(bx - e.x) < 14 + e.w / 2 && Math.abs(by - e.y) < 14 + e.h / 2) {
            e.hurt(this.applyDmg(this.orbDps * dt));
          }
        }
      }
      this.pulseTimer -= dt;
      for (let i = this.pulseEffects.length - 1; i >= 0; i--) {
        this.pulseEffects[i].t -= dt;
        if (this.pulseEffects[i].t <= 0) this.pulseEffects.splice(i, 1);
      }
      if (this.pulseTimer <= 0) {
        this.pulseTimer = this.pulseInterval;
        for (const e of enemies) {
          const d = dist(this.owner, e);
          if (d < this.pulseRadius) {
            e.hurt(this.applyDmg(this.pulseDmg), playerCritsFn ? playerCritsFn() : false);
          }
        }
        this.pulseEffects.push({ x: this.owner.x, y: this.owner.y, t: 0.5, r: this.pulseRadius });
      }
    }
    draw(ctx2, cam, canvas2) {
      const s = cam.w2s(this.owner.x, this.owner.y, canvas2);
      const pulse = Math.sin(Date.now() * 4e-3) * 0.15 + 0.35;
      ctx2.strokeStyle = `rgba(255,215,0,${pulse})`;
      ctx2.lineWidth = 2;
      ctx2.beginPath();
      ctx2.arc(s.x, s.y, this.radius + 10, 0, Math.PI * 2);
      ctx2.stroke();
      for (let i = 0; i < this.orbCount; i++) {
        const a = this.angle + Math.PI * 2 / this.orbCount * i;
        const bx = this.owner.x + Math.cos(a) * this.radius;
        const by = this.owner.y + Math.sin(a) * this.radius;
        const os = cam.w2s(bx, by, canvas2);
        ctx2.fillStyle = "rgba(255,255,255,0.3)";
        ctx2.fillRect(os.x - 10, os.y - 10, 20, 20);
        ctx2.fillStyle = "#e0e0ff";
        ctx2.fillRect(os.x - 6, os.y - 6, 12, 12);
        ctx2.fillStyle = "#bbdefb";
        ctx2.fillRect(os.x - 4, os.y - 4, 8, 8);
        ctx2.fillStyle = "#fff";
        ctx2.fillRect(os.x - 2, os.y - 2, 4, 4);
      }
      for (const p of this.pulseEffects) {
        const ps = cam.w2s(p.x, p.y, canvas2);
        const alpha = p.t * 2;
        ctx2.strokeStyle = `rgba(255,255,255,${alpha})`;
        ctx2.lineWidth = 3;
        ctx2.beginPath();
        ctx2.arc(ps.x, ps.y, p.r * (1 - p.t * 0.5), 0, Math.PI * 2);
        ctx2.stroke();
        ctx2.fillStyle = `rgba(255,255,200,${alpha * 0.15})`;
        ctx2.beginPath();
        ctx2.arc(ps.x, ps.y, p.r * (1 - p.t * 0.5), 0, Math.PI * 2);
        ctx2.fill();
      }
    }
  };
  var FrostKnife = class extends Weapon {
    constructor(owner) {
      super("frostknife", owner);
      this.timer = 0;
    }
    get maxLevel() {
      return 1;
    }
    get count() {
      return 5;
    }
    get dmg() {
      return 2.5;
    }
    get pierce() {
      return 2;
    }
    get cd() {
      return 0.6;
    }
    get slowAmount() {
      return 0.4;
    }
    get slowDur() {
      return 1.5;
    }
    get freezeChance() {
      return 0.05;
    }
    get freezeDur() {
      return 1;
    }
    update(dt, enemies, bullets, sfx) {
      this.timer -= dt;
      if (this.timer <= 0) {
        this.timer = this.cd;
        let nearest = null, nd = Infinity;
        for (const e of enemies) {
          const d = dist(this.owner, e);
          if (d < nd) {
            nd = d;
            nearest = e;
          }
        }
        if (nearest) {
          if (sfx) sfx("knife");
          for (let i = 0; i < this.count; i++) {
            const dir = new V(nearest.x - this.owner.x, nearest.y - this.owner.y).norm();
            const spread = i > 0 ? (i % 2 === 1 ? 0.12 : -0.12) * Math.ceil(i / 2) : 0;
            const cos = Math.cos(spread), sin = Math.sin(spread);
            const dx = dir.x * cos - dir.y * sin;
            const dy = dir.x * sin + dir.y * cos;
            if (bullets.length < CFG.MAX_BULLETS) {
              bullets.push({
                x: this.owner.x,
                y: this.owner.y,
                vx: dx * 260,
                vy: dy * 260,
                w: 6,
                h: 4,
                dmg: this.applyDmg(this.dmg),
                life: 1.8,
                color: "#4fc3f7",
                pierce: this.pierce,
                hit: /* @__PURE__ */ new Set(),
                frostSlow: this.slowAmount,
                frostSlowDur: this.slowDur,
                frostFreezeChance: this.freezeChance,
                frostFreezeDur: this.freezeDur
              });
            }
          }
        }
      }
    }
  };
  var FlameBible = class extends Weapon {
    constructor(owner) {
      super("flamebible", owner);
      this.angle = 0;
      this.hitTimers = /* @__PURE__ */ new Map();
      this.pulseTimer = 0;
      this.pulseEffects = [];
    }
    get maxLevel() {
      return 1;
    }
    get radius() {
      return 140;
    }
    get speed() {
      return 4;
    }
    get dps() {
      return 5;
    }
    get burnDps() {
      return 3;
    }
    get burnDur() {
      return 2;
    }
    get pulseCD() {
      return 3;
    }
    get pulseDmg() {
      return 8;
    }
    get pulseRadius() {
      return 100;
    }
    update(dt, enemies, sfx) {
      this.angle += dt * this.speed;
      for (const e of enemies) {
        const d = dist(this.owner, e);
        if (d < this.radius) {
          if (!this.hitTimers.has(e)) this.hitTimers.set(e, 0);
          const ht = this.hitTimers.get(e);
          if (ht <= 0) {
            e.hurt(this.applyDmg(this.dps));
            if (!e._burn) e._burn = { dmg: 0, t: 0 };
            e._burn.dmg = this.applyDmg(this.burnDps);
            e._burn.t = this.burnDur;
            this.hitTimers.set(e, 0.3);
          } else {
            this.hitTimers.set(e, ht - dt);
          }
        }
      }
      for (const [e] of this.hitTimers) {
        if (!enemies.includes(e)) this.hitTimers.delete(e);
      }
      this.pulseTimer -= dt;
      for (let i = this.pulseEffects.length - 1; i >= 0; i--) {
        this.pulseEffects[i].t -= dt;
        if (this.pulseEffects[i].t <= 0) this.pulseEffects.splice(i, 1);
      }
      if (this.pulseTimer <= 0) {
        this.pulseTimer = this.pulseCD;
        for (const e of enemies) {
          const d = dist(this.owner, e);
          if (d < this.pulseRadius) {
            e.hurt(this.applyDmg(this.pulseDmg));
            if (!e._burn) e._burn = { dmg: 0, t: 0 };
            e._burn.dmg = this.applyDmg(this.burnDps);
            e._burn.t = this.burnDur;
          }
        }
        this.pulseEffects.push({ x: this.owner.x, y: this.owner.y, t: 0.4, r: this.pulseRadius });
        if (sfx) sfx("lightning");
      }
    }
    draw(ctx2, cam, canvas2) {
      const s = cam.w2s(this.owner.x, this.owner.y, canvas2);
      const r = this.radius;
      const pulse = Math.sin(this.angle * 2) * 0.15 + 0.5;
      ctx2.strokeStyle = `rgba(255,87,34,${pulse})`;
      ctx2.lineWidth = 4;
      ctx2.beginPath();
      ctx2.arc(s.x, s.y, r, 0, Math.PI * 2);
      ctx2.stroke();
      const grad = ctx2.createRadialGradient(s.x, s.y, 10, s.x, s.y, r);
      grad.addColorStop(0, "rgba(255,152,0,0.15)");
      grad.addColorStop(0.6, "rgba(255,87,34,0.08)");
      grad.addColorStop(1, "rgba(255,87,34,0)");
      ctx2.fillStyle = grad;
      ctx2.beginPath();
      ctx2.arc(s.x, s.y, r, 0, Math.PI * 2);
      ctx2.fill();
      for (let i = 0; i < 4; i++) {
        const a = this.angle + Math.PI / 2 * i;
        const cx = s.x + Math.cos(a) * r * 0.6;
        const cy = s.y + Math.sin(a) * r * 0.6;
        ctx2.save();
        ctx2.translate(cx, cy);
        ctx2.rotate(a + Math.PI / 2);
        ctx2.fillStyle = "#ff6d00";
        ctx2.fillRect(-14, -5, 28, 10);
        ctx2.fillStyle = "#ff9100";
        ctx2.fillRect(-14, -5, 28, 2);
        ctx2.fillRect(-14, 3, 28, 2);
        ctx2.fillStyle = "#ffeb3b";
        ctx2.fillRect(-10, -1, 20, 1);
        ctx2.fillRect(-10, 1, 16, 1);
        ctx2.restore();
      }
      for (let i = 0; i < 6; i++) {
        const a = this.angle * 1.5 + Math.PI * 2 / 6 * i;
        const pr = r * 0.8;
        const px = s.x + Math.cos(a) * pr;
        const py = s.y + Math.sin(a) * pr;
        ctx2.fillStyle = `rgba(255,${Math.floor(rand(100, 200))},0,${0.4 + Math.sin(this.angle * 3 + i) * 0.2})`;
        ctx2.fillRect(px - 2, py - 2, 4, 4);
        ctx2.fillStyle = `rgba(255,235,59,${0.3 + Math.sin(this.angle * 3 + i) * 0.15})`;
        ctx2.fillRect(px - 1, py - 1, 2, 2);
      }
      for (const p of this.pulseEffects) {
        const ps = cam.w2s(p.x, p.y, canvas2);
        const alpha = p.t * 2.5;
        const expandR = p.r * (1.3 - p.t * 0.8);
        ctx2.strokeStyle = `rgba(255,87,34,${alpha})`;
        ctx2.lineWidth = 3;
        ctx2.beginPath();
        ctx2.arc(ps.x, ps.y, expandR, 0, Math.PI * 2);
        ctx2.stroke();
        ctx2.fillStyle = `rgba(255,152,0,${alpha * 0.1})`;
        ctx2.beginPath();
        ctx2.arc(ps.x, ps.y, expandR, 0, Math.PI * 2);
        ctx2.fill();
      }
    }
  };
  var Boomerang = class extends Weapon {
    constructor(owner) {
      super("boomerang", owner);
      this.projectiles = [];
    }
    getLevelData() {
      return CFG.BOOMERANG.levels[this.level] || CFG.BOOMERANG.levels[1];
    }
    update(dt, enemies) {
      const data = this.getLevelData();
      this.timer -= dt;
      if (this.timer <= 0) {
        this.timer = data.cd;
        const bonus = this.owner.getWeaponBonus ? this.owner.getWeaponBonus("boomerang") : {};
        const count = data.count + (bonus.extraCount || 0);
        for (let i = 0; i < count; i++) {
          const target = this.findNearestEnemy(enemies, this.owner.x, this.owner.y, data.maxDist * 2);
          let angle;
          if (target) {
            angle = Math.atan2(target.y - this.owner.y, target.x - this.owner.x);
          } else {
            angle = Math.random() * Math.PI * 2;
          }
          this.projectiles.push({
            x: this.owner.x,
            y: this.owner.y,
            vx: Math.cos(angle) * data.speed,
            vy: Math.sin(angle) * data.speed,
            returning: false,
            dist: 0,
            hit: /* @__PURE__ */ new Set(),
            angle,
            rotAngle: 0,
            trail: []
          });
        }
      }
      for (let i = this.projectiles.length - 1; i >= 0; i--) {
        const p = this.projectiles[i];
        p.rotAngle += dt * 12;
        if (!p.returning) {
          const trackRad = data.trackAngle * dt;
          const tgt = this.findNearestEnemy(enemies, p.x, p.y, 200);
          if (tgt) {
            const desired = Math.atan2(tgt.y - p.y, tgt.x - p.x);
            let diff = desired - Math.atan2(p.vy, p.vx);
            while (diff > Math.PI) diff -= Math.PI * 2;
            while (diff < -Math.PI) diff += Math.PI * 2;
            const turn = Math.sign(diff) * Math.min(Math.abs(diff), trackRad);
            const curAngle = Math.atan2(p.vy, p.vx) + turn;
            const spd = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
            p.vx = Math.cos(curAngle) * spd;
            p.vy = Math.sin(curAngle) * spd;
          }
          const perpX = -p.vy * data.curvature * dt;
          const perpY = p.vx * data.curvature * dt;
          p.x += (p.vx + perpX) * dt;
          p.y += (p.vy + perpY) * dt;
          p.dist += Math.sqrt(p.vx * p.vx + p.vy * p.vy) * dt;
          if (p.dist >= data.maxDist) {
            p.returning = true;
          }
          const bonus = this.owner.getWeaponBonus ? this.owner.getWeaponBonus("boomerang") : {};
          for (const e of enemies) {
            if (e.hp <= 0 || p.hit.has(e)) continue;
            if (Math.abs(p.x - e.x) < 8 + e.w / 2 && Math.abs(p.y - e.y) < 8 + e.h / 2) {
              const hasCritSynergy = bonus.canCrit;
              let isCrit = false;
              if (hasCritSynergy && Math.random() < (this.owner.critChance || 0)) isCrit = true;
              e.hurt(this.applyDmg(data.dmg), isCrit);
              p.hit.add(e);
              if (data.pierce > 0 && p.hit.size <= data.pierce) continue;
              if (!data.pierce) {
                p.returning = true;
                break;
              }
            }
          }
          if (this.owner.hasSynergy("boomerang_magnet") && window.game && window.game.gems) {
            const pullRange = CFG.SYNERGIES.boomerang_magnet.weaponBonus.flightPullRange;
            for (const gem of window.game.gems) {
              const gdx = p.x - gem.x, gdy = p.y - gem.y;
              const gds = gdx * gdx + gdy * gdy;
              if (gds < pullRange * pullRange) {
                const gInv = 1 / Math.sqrt(gds);
                gem.x -= gdx * gInv * 60 * dt;
                gem.y -= gdy * gInv * 60 * dt;
              }
            }
          }
        } else {
          const dx = this.owner.x - p.x, dy = this.owner.y - p.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 15) {
            this.projectiles.splice(i, 1);
            continue;
          }
          const retSpd = data.returnSpeed || data.speed * 1.15;
          p.vx = dx / d * retSpd;
          p.vy = dy / d * retSpd;
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          for (const e of enemies) {
            if (e.hp <= 0 || p.hit.has(e)) continue;
            if (Math.abs(p.x - e.x) < 8 + e.w / 2 && Math.abs(p.y - e.y) < 8 + e.h / 2) {
              e.hurt(this.applyDmg(data.dmg));
              p.hit.add(e);
            }
          }
        }
      }
    }
    draw(ctx2, cam, canvas2) {
      for (const p of this.projectiles) {
        const s = cam.w2s(p.x, p.y, canvas2);
        ctx2.save();
        ctx2.translate(s.x, s.y);
        ctx2.rotate(p.rotAngle);
        ctx2.fillStyle = "#ffc107";
        ctx2.fillRect(-6, -1, 5, 2);
        ctx2.fillRect(1, -1, 5, 2);
        ctx2.fillRect(-6, -3, 2, 2);
        ctx2.fillRect(4, -3, 2, 2);
        ctx2.fillStyle = "#795548";
        ctx2.fillRect(-4, 0, 3, 1);
        ctx2.fillRect(1, 0, 3, 1);
        ctx2.fillStyle = "#fff8e1";
        ctx2.fillRect(-3, -2, 1, 1);
        ctx2.fillRect(3, -2, 1, 1);
        ctx2.restore();
      }
    }
  };
  var Thunderang = class extends Weapon {
    constructor(owner) {
      super("thunderang", owner);
      this.projectiles = [];
      this.effects = [];
    }
    get maxLevel() {
      return 1;
    }
    triggerLightningChain(sourceX, sourceY, enemies, excludeHit) {
      const cfg = CFG.BOOMERANG.thunderang.lightning;
      if (Math.random() > cfg.chance) return;
      const chainHitSet = new Set(excludeHit);
      let prev = { x: sourceX, y: sourceY };
      for (let chain = 0; chain < cfg.chains; chain++) {
        let next = null, nd = Infinity;
        for (const e of enemies) {
          if (e.hp <= 0 || chainHitSet.has(e)) continue;
          const d = (e.x - prev.x) ** 2 + (e.y - prev.y) ** 2;
          if (d < cfg.range * cfg.range && d < nd) {
            nd = d;
            next = e;
          }
        }
        if (next) {
          const dmgMul = chain === 0 ? 1 : cfg.decay ** chain;
          next.hurt(this.applyDmg(cfg.dmg * dmgMul));
          chainHitSet.add(next);
          this.effects.push({ x0: prev.x, y0: prev.y, x1: next.x, y1: next.y, t: 0.2 });
          prev = next;
        } else break;
      }
    }
    update(dt, enemies) {
      const data = CFG.BOOMERANG.thunderang;
      this.timer -= dt;
      for (let i = this.effects.length - 1; i >= 0; i--) {
        this.effects[i].t -= dt;
        if (this.effects[i].t <= 0) this.effects.splice(i, 1);
      }
      if (this.timer <= 0) {
        this.timer = data.cd;
        const targets = [];
        const used = /* @__PURE__ */ new Set();
        for (let i = 0; i < data.count; i++) {
          let best = null, bestD = Infinity;
          for (const e of enemies) {
            if (e.hp <= 0 || used.has(e)) continue;
            const d = (e.x - this.owner.x) ** 2 + (e.y - this.owner.y) ** 2;
            if (d < data.maxDist * 4 * data.maxDist * 4 && d < bestD) {
              bestD = d;
              best = e;
            }
          }
          if (best) {
            targets.push(best);
            used.add(best);
          } else break;
        }
        for (let i = 0; i < data.count; i++) {
          const target = targets[i] || targets[0] || null;
          let angle;
          if (target) {
            angle = Math.atan2(target.y - this.owner.y, target.x - this.owner.x);
          } else {
            angle = Math.random() * Math.PI * 2;
          }
          this.projectiles.push({
            x: this.owner.x,
            y: this.owner.y,
            vx: Math.cos(angle) * data.speed,
            vy: Math.sin(angle) * data.speed,
            returning: false,
            dist: 0,
            hit: /* @__PURE__ */ new Set(),
            returnHit: /* @__PURE__ */ new Set(),
            angle,
            rotAngle: 0
          });
        }
      }
      for (let i = this.projectiles.length - 1; i >= 0; i--) {
        const p = this.projectiles[i];
        p.rotAngle += dt * 12;
        if (!p.returning) {
          const trackRad = data.trackAngle * dt;
          const tgt = this.findNearestEnemy(enemies, p.x, p.y, 200);
          if (tgt) {
            const desired = Math.atan2(tgt.y - p.y, tgt.x - p.x);
            let diff = desired - Math.atan2(p.vy, p.vx);
            while (diff > Math.PI) diff -= Math.PI * 2;
            while (diff < -Math.PI) diff += Math.PI * 2;
            const turn = Math.sign(diff) * Math.min(Math.abs(diff), trackRad);
            const curAngle = Math.atan2(p.vy, p.vx) + turn;
            const spd = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
            p.vx = Math.cos(curAngle) * spd;
            p.vy = Math.sin(curAngle) * spd;
          }
          const perpX = -p.vy * data.curvature * dt;
          const perpY = p.vx * data.curvature * dt;
          p.x += (p.vx + perpX) * dt;
          p.y += (p.vy + perpY) * dt;
          p.dist += Math.sqrt(p.vx * p.vx + p.vy * p.vy) * dt;
          if (p.dist >= data.maxDist) {
            p.returning = true;
          }
          for (const e of enemies) {
            if (e.hp <= 0 || p.hit.has(e)) continue;
            if (Math.abs(p.x - e.x) < 8 + e.w / 2 && Math.abs(p.y - e.y) < 8 + e.h / 2) {
              e.hurt(this.applyDmg(data.dmg));
              p.hit.add(e);
              this.triggerLightningChain(e.x, e.y, enemies, p.hit);
              if (data.pierce > 0 && p.hit.size <= data.pierce) continue;
              if (!data.pierce) {
                p.returning = true;
                break;
              }
            }
          }
        } else {
          const dx = this.owner.x - p.x, dy = this.owner.y - p.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 15) {
            this.projectiles.splice(i, 1);
            continue;
          }
          p.vx = dx / d * data.returnSpeed;
          p.vy = dy / d * data.returnSpeed;
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          for (const e of enemies) {
            if (e.hp <= 0 || p.returnHit.has(e)) continue;
            if (Math.abs(p.x - e.x) < 8 + e.w / 2 && Math.abs(p.y - e.y) < 8 + e.h / 2) {
              e.hurt(this.applyDmg(data.dmg));
              p.returnHit.add(e);
              this.triggerLightningChain(e.x, e.y, enemies, p.returnHit);
            }
          }
        }
      }
    }
    draw(ctx2, cam, canvas2) {
      for (const p of this.projectiles) {
        const s = cam.w2s(p.x, p.y, canvas2);
        ctx2.save();
        ctx2.translate(s.x, s.y);
        ctx2.rotate(p.rotAngle);
        ctx2.fillStyle = "#ffc107";
        ctx2.fillRect(-6, -1, 5, 2);
        ctx2.fillRect(1, -1, 5, 2);
        ctx2.fillRect(-6, -3, 2, 2);
        ctx2.fillRect(4, -3, 2, 2);
        ctx2.fillStyle = "#795548";
        ctx2.fillRect(-4, 0, 3, 1);
        ctx2.fillRect(1, 0, 3, 1);
        ctx2.fillStyle = "#fff8e1";
        ctx2.fillRect(-3, -2, 1, 1);
        ctx2.fillRect(3, -2, 1, 1);
        const flicker = Math.random() * 0.6 + 0.4;
        ctx2.fillStyle = `rgba(255,235,59,${flicker})`;
        ctx2.fillRect(-7, -4 + Math.random() * 2, 2, 1);
        ctx2.fillRect(5, -4 + Math.random() * 2, 2, 1);
        ctx2.fillRect(-2, -5, 4, 1);
        ctx2.restore();
      }
      for (const e of this.effects) {
        const s0 = cam.w2s(e.x0, e.y0, canvas2);
        const s1 = cam.w2s(e.x1, e.y1, canvas2);
        ctx2.strokeStyle = `rgba(255,235,59,${e.t * 5})`;
        ctx2.lineWidth = 2;
        ctx2.beginPath();
        ctx2.moveTo(s0.x, s0.y);
        const steps = 4;
        for (let i = 1; i <= steps; i++) {
          const t = i / steps;
          ctx2.lineTo(
            s0.x + (s1.x - s0.x) * t + (Math.random() - 0.5) * 14,
            s0.y + (s1.y - s0.y) * t + (Math.random() - 0.5) * 14
          );
        }
        ctx2.lineTo(s1.x, s1.y);
        ctx2.stroke();
      }
    }
  };
  var Blazerang = class extends Weapon {
    constructor(owner) {
      super("blazerang", owner);
      this.projectiles = [];
      this.trails = [];
    }
    get maxLevel() {
      return 1;
    }
    update(dt, enemies) {
      const data = CFG.BOOMERANG.blazerang;
      const flame = data.flame;
      this.timer -= dt;
      if (this.timer <= 0) {
        this.timer = data.cd;
        const targets = [];
        const used = /* @__PURE__ */ new Set();
        for (let i = 0; i < data.count; i++) {
          let best = null, bestD = Infinity;
          for (const e of enemies) {
            if (e.hp <= 0 || used.has(e)) continue;
            const d = (e.x - this.owner.x) ** 2 + (e.y - this.owner.y) ** 2;
            if (d < data.maxDist * 4 * data.maxDist * 4 && d < bestD) {
              bestD = d;
              best = e;
            }
          }
          if (best) {
            targets.push(best);
            used.add(best);
          } else break;
        }
        for (let i = 0; i < data.count; i++) {
          const target = targets[i] || targets[0] || null;
          let angle;
          if (target) {
            angle = Math.atan2(target.y - this.owner.y, target.x - this.owner.x);
          } else {
            angle = Math.random() * Math.PI * 2;
          }
          this.projectiles.push({
            x: this.owner.x,
            y: this.owner.y,
            vx: Math.cos(angle) * data.speed,
            vy: Math.sin(angle) * data.speed,
            returning: false,
            dist: 0,
            trailDist: 0,
            hit: /* @__PURE__ */ new Set(),
            returnHit: /* @__PURE__ */ new Set(),
            angle,
            rotAngle: 0
          });
        }
      }
      for (let i = this.projectiles.length - 1; i >= 0; i--) {
        const p = this.projectiles[i];
        p.rotAngle += dt * 12;
        if (!p.returning) {
          const trackRad = data.trackAngle * dt;
          const tgt = this.findNearestEnemy(enemies, p.x, p.y, 200);
          if (tgt) {
            const desired = Math.atan2(tgt.y - p.y, tgt.x - p.x);
            let diff = desired - Math.atan2(p.vy, p.vx);
            while (diff > Math.PI) diff -= Math.PI * 2;
            while (diff < -Math.PI) diff += Math.PI * 2;
            const turn = Math.sign(diff) * Math.min(Math.abs(diff), trackRad);
            const curAngle = Math.atan2(p.vy, p.vx) + turn;
            const spd = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
            p.vx = Math.cos(curAngle) * spd;
            p.vy = Math.sin(curAngle) * spd;
          }
          const perpX = -p.vy * data.curvature * dt;
          const perpY = p.vx * data.curvature * dt;
          const stepX = (p.vx + perpX) * dt;
          const stepY = (p.vy + perpY) * dt;
          p.x += stepX;
          p.y += stepY;
          const stepDist = Math.sqrt(stepX * stepX + stepY * stepY);
          p.dist += stepDist;
          p.trailDist += stepDist;
          if (p.trailDist >= flame.trailInterval) {
            p.trailDist = 0;
            this.trails.push({ x: p.x, y: p.y, life: flame.trailDur, hitCD: /* @__PURE__ */ new Map() });
            if (this.trails.length > flame.maxTrails) this.trails.shift();
          }
          if (p.dist >= data.maxDist) {
            p.returning = true;
          }
          for (const e of enemies) {
            if (e.hp <= 0 || p.hit.has(e)) continue;
            if (Math.abs(p.x - e.x) < 8 + e.w / 2 && Math.abs(p.y - e.y) < 8 + e.h / 2) {
              e.hurt(this.applyDmg(data.dmg));
              p.hit.add(e);
              if (!e._burn) e._burn = { dmg: 0, t: 0 };
              e._burn.dmg = this.applyDmg(flame.burnDps);
              e._burn.t = flame.burnDur;
              if (data.pierce > 0 && p.hit.size <= data.pierce) continue;
              if (!data.pierce) {
                p.returning = true;
                break;
              }
            }
          }
        } else {
          const dx = this.owner.x - p.x, dy = this.owner.y - p.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 15) {
            this.projectiles.splice(i, 1);
            continue;
          }
          p.vx = dx / d * data.returnSpeed;
          p.vy = dy / d * data.returnSpeed;
          const stepX = p.vx * dt;
          const stepY = p.vy * dt;
          p.x += stepX;
          p.y += stepY;
          p.trailDist += Math.sqrt(stepX * stepX + stepY * stepY);
          if (p.trailDist >= flame.trailInterval) {
            p.trailDist = 0;
            this.trails.push({ x: p.x, y: p.y, life: flame.trailDur, hitCD: /* @__PURE__ */ new Map() });
            if (this.trails.length > flame.maxTrails) this.trails.shift();
          }
          for (const e of enemies) {
            if (e.hp <= 0 || p.returnHit.has(e)) continue;
            if (Math.abs(p.x - e.x) < 8 + e.w / 2 && Math.abs(p.y - e.y) < 8 + e.h / 2) {
              e.hurt(this.applyDmg(data.dmg));
              p.returnHit.add(e);
              if (!e._burn) e._burn = { dmg: 0, t: 0 };
              e._burn.dmg = this.applyDmg(flame.burnDps);
              e._burn.t = flame.burnDur;
            }
          }
        }
      }
      for (let i = this.trails.length - 1; i >= 0; i--) {
        const trail = this.trails[i];
        trail.life -= dt;
        if (trail.life <= 0) {
          this.trails.splice(i, 1);
          continue;
        }
        for (const e of enemies) {
          if (e.hp <= 0) continue;
          if (Math.abs(trail.x - e.x) < 12 + e.w / 2 && Math.abs(trail.y - e.y) < 12 + e.h / 2) {
            if (!trail.hitCD.has(e) || trail.hitCD.get(e) <= 0) {
              e.hurt(this.applyDmg(flame.trailDps * 0.5));
              trail.hitCD.set(e, 0.5);
            } else {
              trail.hitCD.set(e, trail.hitCD.get(e) - dt);
            }
          }
        }
      }
    }
    draw(ctx2, cam, canvas2) {
      for (const trail of this.trails) {
        const alpha = trail.life / CFG.BOOMERANG.blazerang.flame.trailDur;
        const s = cam.w2s(trail.x, trail.y, canvas2);
        ctx2.fillStyle = `rgba(255,87,34,${alpha * 0.4})`;
        ctx2.fillRect(s.x - 5, s.y - 5, 10, 10);
        ctx2.fillStyle = `rgba(255,152,0,${alpha * 0.7})`;
        ctx2.fillRect(s.x - 3, s.y - 3, 6, 6);
        ctx2.fillStyle = `rgba(255,235,59,${alpha * 0.5})`;
        ctx2.fillRect(s.x - 1, s.y - 1, 2, 2);
      }
      for (const p of this.projectiles) {
        const s = cam.w2s(p.x, p.y, canvas2);
        ctx2.save();
        ctx2.translate(s.x, s.y);
        ctx2.rotate(p.rotAngle);
        ctx2.fillStyle = "#ff6d00";
        ctx2.fillRect(-6, -1, 5, 2);
        ctx2.fillRect(1, -1, 5, 2);
        ctx2.fillRect(-6, -3, 2, 2);
        ctx2.fillRect(4, -3, 2, 2);
        ctx2.fillStyle = "#bf360c";
        ctx2.fillRect(-4, 0, 3, 1);
        ctx2.fillRect(1, 0, 3, 1);
        ctx2.fillStyle = "#ffeb3b";
        ctx2.fillRect(-3, -2, 1, 1);
        ctx2.fillRect(3, -2, 1, 1);
        ctx2.fillStyle = `rgba(255,87,34,${0.3 + Math.random() * 0.3})`;
        ctx2.fillRect(-7, -2, 1, 1);
        ctx2.fillRect(6, -2, 1, 1);
        ctx2.restore();
      }
    }
  };
  var WEAPON_CLASSES = {
    holywater: HolyWater,
    knife: Knife,
    lightning: Lightning,
    bible: Bible,
    firestaff: FireStaff,
    frostaura: FrostAura,
    boomerang: Boomerang,
    thunderholywater: ThunderHolyWater,
    fireknife: FireKnife,
    holydomain: HolyDomain,
    blizzard: Blizzard,
    frostknife: FrostKnife,
    flamebible: FlameBible,
    thunderang: Thunderang,
    blazerang: Blazerang
  };

  // src/ui/upgrade-generate.js
  function generateUpgrades(player) {
    const pool = [];
    const owned = new Set(player.weapons.map((w) => w.name));
    for (const name of ["holywater", "knife", "lightning", "bible", "firestaff", "frostaura", "boomerang"]) {
      if (!owned.has(name)) {
        const wc = CFG.WEAPONS[name];
        pool.push({
          type: "weapon",
          icon: wc.icon,
          name: wc.name,
          desc: wc.desc,
          badge: "\u65B0\u6B66\u5668",
          badgeColor: "#4fc3f7",
          apply: () => {
            player.weapons.push(new WEAPON_CLASSES[name](player));
          }
        });
      }
    }
    for (const w of player.weapons) {
      if (w.level < w.maxLevel) {
        const wc = CFG.WEAPONS[w.name];
        pool.push({
          type: "upgrade",
          icon: wc.icon,
          name: `${wc.name} Lv.${w.level + 1}`,
          desc: "\u4F24\u5BB3/\u6548\u679C\u63D0\u5347",
          badge: "\u5347\u7EA7",
          badgeColor: "#ffd54f",
          apply: () => {
            w.level++;
          }
        });
      }
    }
    for (const [key, pc] of Object.entries(CFG.PASSIVES)) {
      const stacks = player.passives[key] || 0;
      if (stacks < pc.maxStack) {
        pool.push({
          type: "passive",
          icon: pc.icon,
          name: pc.name,
          desc: pc.desc,
          badge: "\u88AB\u52A8",
          badgeColor: "#66bb6a",
          apply: () => {
            player.passives[key] = (player.passives[key] || 0) + 1;
            if (key === "speedboots") player.speed *= 1.15;
            if (key === "armor") player.armor += 1;
            if (key === "magnet") player.expBonus = (player.expBonus || 0) + 0.3;
            if (key === "crit") player.critChance = (player.critChance || 0) + 0.08;
            if (key === "maxhp") {
              player.maxHp += 2;
              player.hp = Math.min(player.hp + 2, player.maxHp);
            }
            if (key === "regen") {
              player._regenTimer = [5, 4, 3][(player.passives[key] || 1) - 1] || 3;
            }
            if (key === "luckycoin") {
              player.critDmgBonus += CFG.PASSIVES.luckycoin.critDmgBonus;
              player.goldDropBonus += CFG.PASSIVES.luckycoin.goldDropBonus;
            }
          }
        });
      }
    }
    for (const evo of CFG.EVOLUTIONS) {
      const wA = player.weapons.find((w) => w.name === evo.a && w.level >= w.maxLevel);
      const wB = player.weapons.find((w) => w.name === evo.b && w.level >= w.maxLevel);
      if (wA && wB) {
        pool.push({
          type: "evolution",
          icon: evo.icon,
          name: evo.name,
          desc: evo.desc,
          badge: "\u8FDB\u5316",
          badgeColor: "#ff9100",
          apply: () => {
            player.weapons = player.weapons.filter((w) => w !== wA && w !== wB);
            player.weapons.push(new WEAPON_CLASSES[evo.result](player));
            Save.achieveFlag("evolve_weapon");
            if (window.game) {
              if (!window.game.evolutions) window.game.evolutions = [];
              window.game.evolutions.push(evo.result);
            }
          }
        });
      }
    }
    for (let i = pool.length - 1; i > 0; i--) {
      const j = randInt(0, i);
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool.slice(0, 3);
  }

  // src/ui/upgrade-panel.js
  function showUpgrade(choices, game) {
    if (window.autoUpgrade && choices.length > 0) {
      choices[0].apply();
      game.player.checkSynergies();
      updateSkillPanel();
      return;
    }
    const panel = document.getElementById("upgrade-panel");
    const cards = document.getElementById("upg-cards");
    let rerollUsed = false;
    function renderCards(pool) {
      cards.innerHTML = "";
      for (const c of pool) {
        const card = document.createElement("div");
        card.className = "upg-card";
        const bgRgb = c.badgeColor === "#4fc3f7" ? "79,195,247" : c.badgeColor === "#ffd54f" ? "255,213,79" : c.badgeColor === "#ff9100" ? "255,145,0" : "102,187,106";
        card.style.background = `rgba(${bgRgb},0.15)`;
        card.style.border = `2px solid ${c.badgeColor}`;
        card.innerHTML = `<div class="icon">${c.icon}</div><div class="name" style="color:${c.badgeColor}">${c.name}</div><div class="desc">${c.desc}</div><div class="badge" style="background:${c.badgeColor};color:#1a1a2e">${c.badge}</div>`;
        card.onclick = () => {
          c.apply();
          game.player.checkSynergies();
          updateSkillPanel();
          panel.style.display = "none";
          game.paused = false;
        };
        cards.appendChild(card);
      }
      const rerollBtn = document.createElement("button");
      rerollBtn.textContent = "\u{1F504} \u6362\u4E00\u6279";
      rerollBtn.style.cssText = "margin-top:10px;padding:8px 24px;border:1px solid rgba(255,255,255,0.3);border-radius:8px;background:rgba(255,255,255,0.08);color:#ccc;cursor:pointer;font-size:14px;";
      if (rerollUsed) rerollBtn.style.display = "none";
      rerollBtn.onclick = () => {
        rerollUsed = true;
        const newPool = generateUpgrades(game.player);
        renderCards(newPool);
      };
      cards.appendChild(rerollBtn);
    }
    renderCards(choices);
    panel.style.display = "flex";
    game.paused = true;
  }

  // src/ui/hud.js
  function drawHUD(ctx2, W, H, dt, game) {
    const player = game.player;
    if (game.endless) {
      const em = Math.floor(game.elapsed / 60), es = Math.floor(game.elapsed % 60);
      document.getElementById("hud-timer").textContent = `\u267E ${em}:${es.toString().padStart(2, "0")}`;
    } else {
      const remaining = Math.max(0, CFG.GAME_TIME - game.elapsed);
      const rm = Math.floor(remaining / 60), rs = Math.floor(remaining % 60);
      document.getElementById("hud-timer").textContent = `${rm}:${rs.toString().padStart(2, "0")}`;
    }
    document.getElementById("hud-level").textContent = `Lv.${player.level}`;
    document.getElementById("hud-gold").textContent = `\u{1F4B0} ${player.gold}`;
    let hpHtml = "";
    for (let i = 0; i < player.maxHp; i++) {
      hpHtml += i < player.hp ? '<span style="color:#ef5350">\u2765</span>' : '<span style="color:#555">\u2764</span>';
    }
    document.getElementById("hud-hp").innerHTML = hpHtml;
    const syns = player.activeSynergies;
    if (syns && syns.size > 0) {
      const synArr = [...syns].map((id) => CFG.SYNERGIES[id]);
      const synText = synArr.map((s) => s.icon + s.name).join(" ");
      ctx2.font = "9px monospace";
      ctx2.fillStyle = "rgba(255,215,0,0.6)";
      ctx2.textAlign = "center";
      ctx2.fillText(synText.trim(), W / 2, H - 70);
    }
    const cp = CFG.CHARACTERS[player.charId];
    if (cp && cp.classPassive) {
      ctx2.font = "9px monospace";
      ctx2.fillStyle = "rgba(200,200,255,0.5)";
      ctx2.textAlign = "left";
      ctx2.fillText(`${cp.classPassive.icon}${cp.classPassive.name}`, 10, H - 30);
    }
    const nextExp = player.level < CFG.EXP_TABLE.length ? CFG.EXP_TABLE[player.level] : 999;
    document.getElementById("exp-bar").style.width = `${(player.exp / nextExp * 100).toFixed(1)}%`;
  }

  // src/ui/quest-panel.js
  function showQuestPanel() {
    const d = Save.load();
    const completed = d.completedQuests || [];
    const list = document.getElementById("quest-list");
    list.innerHTML = "";
    for (const q of CFG.QUESTS) {
      const done = completed.includes(q.id);
      const card = document.createElement("div");
      card.style.cssText = `padding:10px 14px;border-radius:8px;font-family:monospace;display:flex;align-items:center;gap:10px;${done ? "background:rgba(102,187,106,0.15);border:1px solid rgba(102,187,106,0.4)" : "background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.15)"}`;
      card.innerHTML = `
      <span style="font-size:24px">${q.icon}</span>
      <div style="flex:1">
        <div style="font-size:13px;font-weight:bold;color:${done ? "#66bb6a" : "#ccc"}">${q.name} ${done ? "\u2705" : ""}</div>
        <div style="font-size:11px;color:#999;margin-top:2px">${q.desc}</div>
      </div>
      <div style="font-size:11px;color:#ffd54f">${q.reward}\u{1F4B0}</div>`;
      list.appendChild(card);
    }
    document.getElementById("quest-panel").style.display = "flex";
  }
  function hideQuestPanel() {
    document.getElementById("quest-panel").style.display = "none";
  }

  // src/ui/shop-panel.js
  function showShopPanel() {
    const d = Save.load();
    const sf = d.soulFragments || 0;
    const su = d.shopUpgrades || {};
    const list = document.getElementById("shop-list");
    list.innerHTML = "";
    for (const [key, u] of Object.entries(CFG.SHOP.upgrades)) {
      const level = su[key] || 0;
      const maxed = level >= u.maxLevel;
      const cost = maxed ? 0 : u.costs[level];
      const canBuy = !maxed && sf >= cost;
      const card = document.createElement("div");
      card.style.cssText = `padding:10px 14px;border-radius:8px;font-family:monospace;display:flex;align-items:center;gap:10px;${maxed ? "background:rgba(102,187,106,0.15);border:1px solid rgba(102,187,106,0.4)" : canBuy ? "background:rgba(79,195,247,0.15);border:1px solid rgba(79,195,247,0.4);cursor:pointer" : "background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.15);opacity:0.7"}`;
      let effectText = "";
      const eff = u.effects[level > 0 ? level - 1 : 0];
      if (eff) {
        if (eff.hp) effectText = `HP+${eff.hp}`;
        else if (eff.speedMul) effectText = `speed x${eff.speedMul}`;
        else if (eff.range) effectText = `range+${eff.range}px`;
        else if (eff.mul) effectText = `x${eff.mul}`;
      }
      card.innerHTML = `
      <span style="font-size:24px">${u.icon}</span>
      <div style="flex:1">
        <div style="font-size:13px;font-weight:bold;color:${maxed ? "#66bb6a" : "#ccc"}">${u.name} ${maxed ? "MAX" : "Lv." + level + "/" + u.maxLevel}</div>
        <div style="font-size:11px;color:#999;margin-top:2px">${effectText}</div>
      </div>
      <div style="font-size:12px;color:${maxed ? "#66bb6a" : canBuy ? "#ffd54f" : "#666"}">${maxed ? "Done" : cost + " SF"}</div>`;
      if (canBuy) {
        card.onclick = () => {
          if (Save.buyShopUpgrade(key)) {
            Save.achieveFlag("shop_first");
            const d2 = Save.load();
            const su2 = d2.shopUpgrades || {};
            const u2 = CFG.SHOP.upgrades[key];
            if (su2[key] >= u2.maxLevel) {
              Save.achieveFlag("shop_max_one");
            }
            const allMaxed = Object.entries(CFG.SHOP.upgrades).every(([k, v]) => (su2[k] || 0) >= v.maxLevel);
            if (allMaxed) {
              Save.achieveFlag("shop_max_all");
            }
            showShopPanel();
          }
        };
      }
      list.appendChild(card);
    }
    document.getElementById("shop-sf").textContent = sf;
    document.getElementById("shop-panel").style.display = "flex";
  }
  function hideShopPanel() {
    document.getElementById("shop-panel").style.display = "none";
  }

  // src/ui/achievement-panel.js
  function showAchievementPanel() {
    const d = Save.load();
    const completed = d.completedAchievements || [];
    const list = document.getElementById("achieve-list");
    list.innerHTML = "";
    let totalCount = 0;
    let doneCount = 0;
    for (const [id, ach] of Object.entries(CFG.ACHIEVEMENTS)) {
      if (ach.hidden) continue;
      totalCount++;
      const isDone = completed.includes(id);
      if (isDone) doneCount++;
      const card = document.createElement("div");
      const bgColor = isDone ? "background:rgba(255,213,79,0.12);border:1px solid rgba(255,213,79,0.4)" : "background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.15)";
      card.style.cssText = "padding:10px 14px;border-radius:8px;font-family:monospace;display:flex;align-items:center;gap:10px;" + bgColor;
      let progressHtml = "";
      const prog = Save.getAchievementProgress(id);
      if (!isDone && (ach.type === "milestone" || ach.type === "multi")) {
        const pct = prog.target > 0 ? Math.min(100, Math.floor(prog.current / prog.target * 100)) : 0;
        progressHtml = '<div style="margin-top:4px"><div style="width:100%;height:4px;background:rgba(255,255,255,0.1);border-radius:2px;overflow:hidden"><div style="width:' + pct + '%;height:100%;background:#ffd54f;border-radius:2px"></div></div><div style="font-size:10px;color:#888;margin-top:2px">' + prog.current + "/" + prog.target + "</div></div>";
      }
      const iconText = ach.icon || "?";
      const checkMark = isDone ? ' <span style="color:#ffd54f">\u2605</span>' : "";
      const rewardColor = isDone ? "#66bb6a" : "#ffd54f";
      const nameColor = isDone ? "#ffd54f" : "#ccc";
      card.innerHTML = '<span style="font-size:24px">' + iconText + '</span><div style="flex:1"><div style="font-size:13px;font-weight:bold;color:' + nameColor + '">' + ach.name + checkMark + '</div><div style="font-size:11px;color:#999;margin-top:2px">' + (ach.desc || "") + "</div>" + progressHtml + '</div><div style="font-size:11px;color:' + rewardColor + '">' + (ach.reward || 0) + "\u{1F48E}</div>";
      list.appendChild(card);
    }
    document.getElementById("achieve-summary").textContent = doneCount + "/" + totalCount;
    document.getElementById("achievement-panel").style.display = "flex";
  }
  function hideAchievementPanel() {
    document.getElementById("achievement-panel").style.display = "none";
  }

  // src/game.js
  function spawnEndlessBoss(hpScale, spdScale) {
    const bd = CFG.DIFFICULTY[window.game.difficulty];
    window.game.screenFlash = 0.5;
    screenShake("boss", window.game);
    SFX.play("boss");
    const bw = document.getElementById("boss-warning");
    if (bw) {
      bw.style.display = "block";
      setTimeout(() => {
        if (bw) bw.style.display = "none";
      }, 3e3);
    }
    const angle = Math.random() * Math.PI * 2;
    const hpMul = (bd.bossHpMul || 1) * hpScale;
    const spdMul = (bd.bossSpeedMul || 1) * spdScale;
    window.game.enemies.push(new Enemy(
      "boss",
      window.game.player.x + Math.cos(angle) * 300,
      window.game.player.y + Math.sin(angle) * 300,
      hpMul,
      spdMul
    ));
  }
  window.game = null;
  function getGame() {
    return window.game;
  }
  var canvas = document.getElementById("c");
  var ctx = canvas.getContext("2d");
  var mmCanvas = document.getElementById("minimap");
  var mmCtx = mmCanvas.getContext("2d");
  var selectedChar = null;
  var selectedDiff = "normal";
  window.autoUpgrade = false;
  var _W = window.innerWidth;
  var _H = window.innerHeight;
  function resize() {
    const dpr = window.devicePixelRatio || 1;
    _W = window.innerWidth;
    _H = window.innerHeight;
    canvas.width = _W * dpr;
    canvas.height = _H * dpr;
    canvas.style.width = _W + "px";
    canvas.style.height = _H + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  window.addEventListener("resize", resize);
  resize();
  var pauseMenuEl = document.getElementById("pause-menu");
  var soundBtnEl = document.getElementById("sound-btn");
  var confirmEl = document.getElementById("pause-confirm");
  function togglePause() {
    if (!window.game || window.game.over) return;
    if (window.game.paused && pauseMenuEl.style.display === "flex") {
      resumeGame();
    } else if (!window.game.paused) {
      window.game.paused = true;
      pauseMenuEl.style.display = "flex";
      updateSoundBtn();
    }
  }
  window.togglePause = togglePause;
  window.resumeGame = resumeGame;
  function resumeGame() {
    if (!window.game) return;
    window.game.paused = false;
    pauseMenuEl.style.display = "none";
    confirmEl.style.display = "none";
  }
  window.resumeGame = resumeGame;
  function updateSoundBtn() {
    soundBtnEl.textContent = SFX.enabled ? "\u{1F50A} \u97F3\u6548\uFF1A\u5173" : "\u{1F507} \u97F3\u6548\uFF1A\u5173";
  }
  window.updateSoundBtn = updateSoundBtn;
  function toggleSound() {
    SFX.enabled = !SFX.enabled;
    updateSoundBtn();
    const d = Save.load();
    d.sfxEnabled = SFX.enabled;
    Save.save(d);
  }
  window.toggleSound = toggleSound;
  function confirmQuit() {
    confirmEl.style.display = "flex";
  }
  window.confirmQuit = confirmQuit;
  function cancelQuit() {
    confirmEl.style.display = "none";
  }
  window.cancelQuit = cancelQuit;
  function quitToTitle() {
    window.game = null;
    pauseMenuEl.style.display = "none";
    confirmEl.style.display = "none";
    showScene("title-screen");
    updateTitleStats();
  }
  window.quitToTitle = quitToTitle;
  (function() {
    const d = Save.load();
    if (d.sfxEnabled === false) SFX.enabled = false;
  })();
  window.startGame = function startGame2() {
    SFX.init();
    showScene("char-select");
  };
  window.startGame = startGame;
  window.pickDiff = function pickDiff2(diff) {
    selectedDiff = diff;
    if (selectedChar._autoWeapon) {
      beginGame(selectedChar._autoWeapon);
    } else {
      showScene("weapon-select");
    }
  };
  window.pickDiff = pickDiff;
  function updateEndlessUnlock() {
    const d = Save.load();
    const card = document.getElementById("endless-card");
    if (!card) return;
    if (d.endlessUnlocked) {
      card.style.opacity = "1";
      card.style.pointerEvents = "auto";
    }
  }
  window.updateEndlessUnlock = updateEndlessUnlock;
  window.pickChar = function pickChar2(charId) {
    const ch = CFG.CHARACTERS[charId];
    selectedChar = { id: charId, ...ch };
    updateEndlessUnlock();
    if (ch.chooseWeapon) {
      showScene("diff-select");
    } else {
      showScene("diff-select");
      selectedChar._autoWeapon = ch.startWeapon;
    }
  };
  window.pickChar = pickChar;
  window.pickWeapon = function pickWeapon2(name) {
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
    const shopData = Save.load().shopUpgrades || {};
    const pu = CFG.SHOP.upgrades;
    if (shopData.maxhp > 0) {
      const eff = pu.maxhp.effects[shopData.maxhp - 1];
      p.maxHp += eff.hp;
      p.hp += eff.hp;
    }
    if (shopData.speed > 0) {
      p.speed = Math.round(p.speed * pu.speed.effects[shopData.speed - 1].speedMul);
    }
    if (shopData.pickup > 0) {
      p.pickupRange += pu.pickup.effects[shopData.pickup - 1].range;
    }
    if (shopData.expbonus > 0) {
      p.expBonus += pu.expbonus.effects[shopData.expbonus - 1].mul - 1;
    }
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
      endless: selectedDiff === "endless",
      bossCycleIndex: 0,
      bossKillCount: 0,
      waveToast: null,
      waveToastTimer: 0,
      prevWaveStage: -1,
      weaponDmgMul: shopData.weaponDmg > 0 ? pu.weaponDmg.effects[shopData.weaponDmg - 1].mul : 1,
      goldMul: shopData.gold > 0 ? pu.gold.effects[shopData.gold - 1].mul : 1,
      evolutions: [],
      killsAt60: 0
    };
    showScene(null);
    document.getElementById("hud").style.display = "flex";
    document.getElementById("exp-bar-wrap").style.display = "block";
    document.getElementById("minimap").style.display = "block";
    showSkillToggle();
    if (isMobile) showJoystick(true);
    if (isMobile) showJoystick(true);
  }
  window.beginGame = beginGame;
  function restartGame() {
    showScene("title-screen");
    updateTitleStats();
  }
  window.restartGame = restartGame;
  window.showQuestPanel = showQuestPanel;
  window.hideQuestPanel = hideQuestPanel;
  window.showShopPanel = showShopPanel;
  window.hideShopPanel = hideShopPanel;
  window.showAchievementPanel = showAchievementPanel;
  window.hideAchievementPanel = hideAchievementPanel;
  window.toggleAutoUpgrade = function toggleAutoUpgrade2() {
    window.autoUpgrade = !window.autoUpgrade;
    const btn = document.getElementById("hud-auto");
    if (autoUpgrade) {
      btn.style.background = "rgba(79,195,247,0.25)";
      btn.style.borderColor = "#4fc3f7";
      btn.style.color = "#4fc3f7";
      btn.textContent = "AUTO\u2713";
    } else {
      btn.style.background = "rgba(255,255,255,0.08)";
      btn.style.borderColor = "rgba(255,255,255,0.2)";
      btn.style.color = "#888";
      btn.textContent = "AUTO";
    }
  };
  window.toggleAutoUpgrade = toggleAutoUpgrade;
  function updateTitleStats() {
    const d = Save.load();
    const el = document.getElementById("title-stats");
    if (!el) return;
    if (d.gamesPlayed === 0) {
      el.textContent = "";
      return;
    }
    const bm = Math.floor(d.bestTime / 60), bs = Math.floor(d.bestTime % 60);
    const sf = d.soulFragments || 0;
    el.innerHTML = `\u{1F3C6} ${d.bestScore}\u6740 | \u23F1 ${bm}:${bs.toString().padStart(2, "0")} | \u{1F3AE} ${d.gamesPlayed}\u5C40 | \u{1F48E} ${sf}`;
  }
  window.updateTitleStats = updateTitleStats;
  function endGame(won) {
    window.game.over = true;
    window.game.won = won;
    hideSkillToggle();
    pauseMenuEl.style.display = "none";
    confirmEl.style.display = "none";
    SFX.play(won ? "victory" : "gameover");
    const saveResult = Save.record(window.game.player.kills, window.game.elapsed, window.game.player.charId, window.game.player._bestCombo);
    if (won && !window.game.endless) {
      const sd = Save.load();
      if (!sd.endlessUnlocked) {
        sd.endlessUnlocked = true;
        Save.save(sd);
      }
    }
    if (window.game.endless) {
      const sd = Save.load();
      if (window.game.elapsed > (sd.bestEndlessTime || 0)) sd.bestEndlessTime = window.game.elapsed;
      if (window.game.player.kills > (sd.bestEndlessKills || 0)) sd.bestEndlessKills = window.game.player.kills;
      if ((window.game.bossKillCount || 0) > (sd.bestEndlessBossKills || 0)) sd.bestEndlessBossKills = window.game.bossKillCount || 0;
      Save.save(sd);
    }
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
    const newlyCompleted = CFG.QUESTS.filter((q) => q.check(stats)).map((q) => q.id);
    const questResult = newlyCompleted.length > 0 ? Save.recordQuests(newlyCompleted) : { firstTime: [] };
    if (window.game.endless) {
      document.getElementById("result-title").textContent = "\u{1F480} \u65E0\u5C3D\u6A21\u5F0F\u7ED3\u675F";
      document.getElementById("result-title").style.color = "#ce93d8";
    } else {
      document.getElementById("result-title").textContent = won ? "\u{1F3C6} \u80DC\u5229! \u{1F3C6}" : "\u{1F480} \u5931\u8D25";
      document.getElementById("result-title").style.color = won ? "#ffd54f" : "#ef5350";
    }
    const m = Math.floor(window.game.elapsed / 60), s = Math.floor(window.game.elapsed % 60);
    const bestM = Math.floor(saveResult.data.bestTime / 60), bestS = Math.floor(saveResult.data.bestTime % 60);
    const newTag = saveResult.newBest ? " \u{1F195}\u65B0\u7EAA\u5F55!" : "";
    let questHtml = "";
    let questReward = 0;
    if (questResult.firstTime.length > 0) {
      const questNames = questResult.firstTime.map((id) => {
        const q = CFG.QUESTS.find((qq) => qq.id === id);
        if (q) questReward += q.reward;
        return q ? `${q.icon} ${q.name} (+${q.reward}SF)` : id;
      }).join("<br>");
      questHtml = "<br><br>--- \u{1F4DC} \u65B0\u4EFB\u52A1\u5B8C\u6210 ---<br>" + questNames;
    }
    const completedQuestsCount = (Save.load().completedQuests || []).length;
    stats.completedQuestsCount = completedQuestsCount;
    const achieveResult = Save.checkAchievements(stats);
    let achieveHtml = "";
    if (achieveResult.newlyCompleted.length > 0) {
      const achieveNames = achieveResult.newlyCompleted.map((aid) => {
        const ach = CFG.ACHIEVEMENTS[aid];
        return ach ? `${ach.icon} ${ach.name} (+${ach.reward}SF)` : aid;
      }).join("<br>");
      achieveHtml = "<br><br>--- \u2605 \u6210\u5C31\u8FBE\u6210 ---<br>" + achieveNames;
    }
    const goldRate = window.game.goldMul || 1;
    const earnedSF = Math.floor(window.game.player.gold * CFG.SHOP.soulFragmentRate * goldRate) + questReward + achieveResult.rewardTotal;
    Save.addSoulFragments(earnedSF);
    document.getElementById("result-stats").innerHTML = (window.game.endless ? "\u267E \u65E0\u5C3D\u6A21\u5F0F<br>\u51FB\u6740: " + window.game.player.kills + "&nbsp;&nbsp;\u5B58\u6D3B: " + m + ":" + s.toString().padStart(2, "0") + "&nbsp;&nbsp;\u8FDE\u51FB: " + window.game.player._bestCombo + "<br>Boss\u51FB\u6740: " + (window.game.bossKillCount || 0) + "&nbsp;&nbsp;\u91D1\u5E01: " + window.game.player.gold : "\u51FB\u6740: " + window.game.player.kills + newTag + "&nbsp;&nbsp;\u5B58\u6D3B: " + m + ":" + s.toString().padStart(2, "0") + "&nbsp;&nbsp;\u8FDE\u51FB: " + window.game.player._bestCombo) + "<br>\u91D1\u5E01: " + window.game.player.gold + "&nbsp;&nbsp;\u{1F48E} +" + earnedSF + " \u7075\u9B42\u788E\u7247" + questHtml + achieveHtml;
    setTimeout(() => showScene("result-screen"), 500);
  }
  window.endGame = endGame;
  var lastTime = 0;
  function loop(time) {
    requestAnimationFrame(loop);
    if (!window.game || window.game.over) {
      if (!window.game) {
        ctx.fillStyle = "#1a1a2e";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      lastTime = time;
      return;
    }
    const dt = Math.min((time - lastTime) / 1e3, 0.05);
    lastTime = time;
    if (!window.game.paused) {
      window.game.elapsed += dt;
      if (!window.game.endless && window.game.elapsed >= CFG.GAME_TIME && !window.game.won) {
        endGame(false);
        return;
      }
      if (!window.game.endless) {
        if (window.game.elapsed >= 270 && !window.game.bossSpawned) {
          window.game.bossSpawned = true;
          window.game.screenFlash = 0.5;
          screenShake("boss", window.game);
          SFX.play("boss");
          const bw = document.getElementById("boss-warning");
          bw.style.display = "block";
          setTimeout(() => {
            bw.style.display = "none";
          }, 3e3);
          const angle = Math.random() * Math.PI * 2;
          const bd = CFG.DIFFICULTY[window.game.difficulty];
          window.game.enemies.push(new Enemy(
            "boss",
            window.game.player.x + Math.cos(angle) * 300,
            window.game.player.y + Math.sin(angle) * 300,
            bd.bossHpMul,
            bd.bossSpeedMul
          ));
        }
      } else {
        if (window.game.elapsed >= 270 && !window.game.bossSpawned) {
          window.game.bossSpawned = true;
          window.game.bossCycleIndex = 0;
          window.game.bossKilled = false;
          spawnEndlessBoss(1, 1);
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
      const input = getInput();
      window.game.player.update(dt, input);
      window.game.camera.follow(window.game.player);
      window.game.camera.update(dt);
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
          window.game.enemies.push(new Enemy(
            type,
            window.game.player.x + Math.cos(angle) * d,
            window.game.player.y + Math.sin(angle) * d,
            hpMul,
            spdMul
          ));
        }
      }
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
      for (let i = window.game.chests.length - 1; i >= 0; i--) {
        const ch = window.game.chests[i];
        if (!ch.opened) {
          const d = dist(ch, window.game.player);
          if (d < CFG.CHEST.pickupRange) {
            if (window.game.player.gold >= CFG.CHEST.cost) {
              window.game.player.gold -= CFG.CHEST.cost;
              ch.opened = true;
              SFX.play("chest");
              const reward = CFG.CHEST.rewards[randInt(0, CFG.CHEST.rewards.length - 1)];
              if (reward.type === "heal") {
                window.game.player.hp = Math.min(window.game.player.hp + reward.value, window.game.player.maxHp);
                window.game.dmgTexts.push({ x: ch.x, y: ch.y - 10, text: `${reward.icon} ${reward.desc}`, life: 1.2 });
              } else if (reward.type === "speed") {
                window.game.player._speedBoost = reward.value;
                window.game.player._speedBoostTimer = reward.duration;
                window.game.dmgTexts.push({ x: ch.x, y: ch.y - 10, text: `${reward.icon} ${reward.desc}`, life: 1.2 });
              } else if (reward.type === "exp") {
                if (window.game.player.addExp(reward.value)) {
                  SFX.play("levelup");
                  const choices = generateUpgrades(window.game.player);
                  if (choices.length > 0) showUpgrade(choices, window.game);
                }
                window.game.dmgTexts.push({ x: ch.x, y: ch.y - 10, text: `${reward.icon} ${reward.desc}`, life: 1.2 });
              }
              window.game.chests.splice(i, 1);
            } else {
              if (!ch._noGoldShown) {
                ch._noGoldShown = true;
                window.game.dmgTexts.push({ x: ch.x, y: ch.y - 10, text: "\u{1F4B0}\u4E0D\u8DB3", life: 0.8 });
              }
            }
          } else {
            ch._noGoldShown = false;
          }
        }
      }
      for (const e of window.game.enemies) {
        e.update(dt, window.game.player, window.game.bullets);
        if (e.hitCD <= 0 && !(e.type === "ghost" && e.teleportCD > 0)) {
          if (aabbOverlap(e.x, e.y, e.w, e.h, window.game.player.x, window.game.player.y, window.game.player.w, window.game.player.h)) {
            if (window.game.player.takeDamage(e.dmg)) {
              e.hitCD = 1;
              window.game.screenFlash = 0.2;
              if (window.game.player.hp <= 0) {
                endGame(false);
                return;
              }
            }
          }
        }
      }
      for (let i = window.game.enemies.length - 1; i >= 0; i--) {
        const e = window.game.enemies[i];
        if (e.hp <= 0) {
          window.game.player.kills++;
          if (window.game.elapsed < 60) {
            window.game.killsAt60 = window.game.player.kills;
          }
          screenShake(e.type === "elite_skeleton" || e.isBoss ? "killBig" : "kill", window.game);
          window.game.player._combo++;
          window.game.player._comboTimer = CFG.COMBO.timeout;
          if (window.game.player._combo > window.game.player._bestCombo) window.game.player._bestCombo = window.game.player._combo;
          if (CFG.COMBO.milestones.includes(window.game.player._combo)) {
            const m = window.game.player._combo;
            const shakeType = m >= 50 ? "combo50" : m >= 20 ? "combo20" : m >= 10 ? "combo10" : "combo5";
            screenShake(shakeType, window.game);
          }
          const comboGold = window.game.player.comboGold();
          const gemVal = e.isBoss ? 50 : e.type === "skeleton" ? 3 : e.type === "ghost" ? 2 : e.type === "bat" ? 1 : e.type === "elite_skeleton" ? 5 : e.type === "splitter_small" ? 1 : 2;
          const goldFromGem = CFG.GOLD.gemToGold ? gemVal : 0;
          const goldMul = 1 + (window.game.player.goldDropBonus || 0);
          let goldEarned = CFG.GOLD.perKill + comboGold + Math.ceil(goldFromGem * goldMul);
          if (e._lastCrit && window.game.player.hasSynergy("crit_luckycoin")) {
            goldEarned *= 2;
          }
          window.game.player.gold += goldEarned;
          SFX.play("kill");
          window.game.dmgTexts.push({ x: e.x, y: e.y - 10, text: "\u{1F480}", life: 0.8 });
          let gemValExtra = 0;
          if (e._burn && e._burn.t > 0 && window.game.player.hasSynergy("firestaff_luckycoin")) {
            gemValExtra = CFG.SYNERGIES.firestaff_luckycoin.weaponBonus.burnGemBonus;
          }
          let gemValFinal = gemVal + gemValExtra;
          const frozenKilled = !!(e._frozen && e._frozen > 0);
          const count = e.isBoss ? 8 : 1;
          for (let g = 0; g < count; g++) {
            const newGem = new Gem(e.x + rand(-10, 10), e.y + rand(-10, 10), gemValFinal / count | 0 || 1);
            newGem._fromFrozen = frozenKilled;
            if (frozenKilled && window.game.player.hasSynergy("frostaura_luckycoin")) {
              newGem._frozenPullBonus = CFG.SYNERGIES.frostaura_luckycoin.weaponBonus.frozenGemPullBonus;
            }
            window.game.gems.push(newGem);
          }
          if (e._lastCrit && window.game.player.hasSynergy("magnet_crit")) {
            const bv = CFG.SYNERGIES.magnet_crit.bonusGemValue;
            window.game.gems.push(new Gem(e.x + rand(-8, 8), e.y + rand(-8, 8), bv));
          }
          if (window.game.player.hasSynergy("holywater_luckycoin")) {
            const bonus = CFG.SYNERGIES.holywater_luckycoin.weaponBonus.killGoldBonus;
            const hasHolyWater = window.game.player.weapons.some((w) => w.name === "holywater" || w.name === "thunderholywater");
            if (hasHolyWater) {
              window.game.player.gold += bonus;
            }
          }
          if (e._lastCrit && window.game.player.hasSynergy("crit_boots")) {
            const kb = CFG.SYNERGIES.crit_boots.onCritKnife;
            const ang = Math.atan2(e.y - window.game.player.y, e.x - window.game.player.x);
            const dmgMul = window.game.weaponDmgMul || 1;
            window.game.bullets.push({
              x: window.game.player.x,
              y: window.game.player.y,
              w: 6,
              h: 6,
              vx: Math.cos(ang) * kb.speed,
              vy: Math.sin(ang) * kb.speed,
              dmg: Math.ceil(e.dmg * kb.dmgMul * dmgMul) || 1,
              life: kb.life,
              color: "#4fc3f7",
              hit: /* @__PURE__ */ new Set()
            });
          }
          if (window.game.foods.length < CFG.FOOD.maxFood) {
            const fDrop = CFG.FOOD.dropRate * CFG.DIFFICULTY[window.game.difficulty].foodDropMul;
            const foodCount = e.isBoss ? CFG.FOOD.bossDropCount : Math.random() < fDrop ? 1 : 0;
            for (let f = 0; f < foodCount; f++) {
              window.game.foods.push(new Food(e.x + rand(-12, 12), e.y + rand(-12, 12), e.type));
            }
          }
          if (e.isBoss) {
            window.game.bossKilled = true;
            if (window.game.endless) {
              window.game.bossKillCount++;
              window.game.player.gold += CFG.ENDLESS.bossKillReward.gold;
              for (let fi = 0; fi < CFG.ENDLESS.bossKillReward.food; fi++) {
                window.game.foods.push(new Food(e.x + rand(-12, 12), e.y + rand(-12, 12), "boss"));
              }
            } else {
              endGame(true);
              return;
            }
          }
          if (e.splitter && !e.isChild && window.game.enemies.length < CFG.MAX_ENEMIES) {
            const minutes = window.game.elapsed / 60;
            const dc = CFG.DIFFICULTY[window.game.difficulty];
            const hpMul = (1 + minutes * 0.2) * dc.enemyHpMul;
            const spdMul = (1 + minutes * 0.1) * dc.enemySpeedMul;
            for (let s = 0; s < 2 && window.game.enemies.length < CFG.MAX_ENEMIES; s++) {
              const offset = (s === 0 ? -1 : 1) * 12;
              const child = new Enemy("splitter_small", e.x + offset, e.y, hpMul, spdMul);
              window.game.enemies.push(child);
            }
          }
          window.game.enemies.splice(i, 1);
        }
      }
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
      for (let i = window.game.bullets.length - 1; i >= 0; i--) {
        const b = window.game.bullets[i];
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        b.life -= dt;
        if (b.life <= 0 || b.x < 0 || b.x > CFG.MAP_W || b.y < 0 || b.y > CFG.MAP_H) {
          window.game.bullets.splice(i, 1);
          continue;
        }
        if (b.color === "#ffd54f" || b.burnDmg || b.frostSlow) {
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
                  SFX.play("freeze");
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
              if (window.game.player.hp <= 0) {
                endGame(false);
                return;
              }
            }
          }
        }
      }
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
          let pullRange = PR;
          if (g._frozenPullBonus) pullRange += g._frozenPullBonus;
          g.x += nx * CFG.GEM_FLY_SPEED * dt;
          g.y += ny * CFG.GEM_FLY_SPEED * dt;
          dx = _px - g.x;
          dy = _py - g.y;
          ds = dx * dx + dy * dy;
          const pullRangeSq = pullRange * pullRange;
          if (ds < pullRangeSq) {
            const comboBonus = window.game.player.comboExpBonus();
            if (window.game.player.addExp(Math.ceil(g.value * comboBonus))) {
              SFX.play("levelup");
              const choices = generateUpgrades(window.game.player);
              if (choices.length > 0) showUpgrade(choices, window.game);
            }
            if (window.game.player.hasSynergy("magnet_maxhp") && Math.random() < CFG.SYNERGIES.magnet_maxhp.gemHealChance) {
              if (window.game.player.hp < window.game.player.maxHp) {
                window.game.player.hp = Math.min(window.game.player.hp + 1, window.game.player.maxHp);
              }
            }
            SFX.play("pickup");
            window.game.gems.splice(i, 1);
          }
        } else {
          const spd = 40 + 60 * (1 - Math.min(ds / 1e6, 1));
          g.x += nx * spd * dt;
          g.y += ny * spd * dt;
        }
      }
      for (let i = window.game.foods.length - 1; i >= 0; i--) {
        const result = window.game.foods[i].update(dt, window.game.player, window.game);
        if (result === false || result === "picked") {
          window.game.foods.splice(i, 1);
        }
      }
    }
    const W = _W, H = _H;
    ctx.fillStyle = "#1a1a2e";
    ctx.fillRect(0, 0, W, H);
    const cam = window.game.camera;
    const gridSize = 32;
    const gs = cam.w2s(0, 0, canvas);
    const ge = cam.w2s(CFG.MAP_W, CFG.MAP_H, canvas);
    const mapX = gs.x, mapY = gs.y, mapW = ge.x - gs.x, mapH = ge.y - gs.y;
    ctx.fillStyle = "#2e7d32";
    ctx.fillRect(mapX, mapY, mapW, mapH);
    ctx.strokeStyle = "rgba(0,0,0,0.08)";
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    const startX = Math.floor((cam.x - W / 2) / gridSize) * gridSize;
    const startY = Math.floor((cam.y - H / 2) / gridSize) * gridSize;
    for (let gx = startX; gx < cam.x + W / 2 + gridSize; gx += gridSize) {
      if (gx >= 0 && gx <= CFG.MAP_W) {
        const s = cam.w2s(gx, 0, canvas);
        ctx.moveTo(s.x, 0);
        ctx.lineTo(s.x, H);
      }
    }
    for (let gy = startY; gy < cam.y + H / 2 + gridSize; gy += gridSize) {
      if (gy >= 0 && gy <= CFG.MAP_H) {
        const s = cam.w2s(0, gy, canvas);
        ctx.moveTo(0, s.y);
        ctx.lineTo(W, s.y);
      }
    }
    ctx.stroke();
    ctx.strokeStyle = "rgba(255,255,255,0.15)";
    ctx.lineWidth = 2;
    ctx.strokeRect(mapX, mapY, mapW, mapH);
    ctx.imageSmoothingEnabled = false;
    for (const g of window.game.gems) g.draw(ctx, cam, canvas);
    for (const f of window.game.foods) f.draw(ctx, cam, canvas);
    for (const ch of window.game.chests) ch.draw(ctx, cam, canvas);
    for (const e of window.game.enemies) {
      e.draw(ctx, cam, canvas);
      const _hasFx = e._burn && e._burn.t > 0 || e._slow && e._slow > 0 || e._frozen && e._frozen > 0;
      if (_hasFx) {
        const bs = cam.w2s(e.x, e.y, canvas);
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
        if (e._slow && e._slow > 0) {
          ctx.fillStyle = "rgba(144,202,249,0.25)";
          ctx.fillRect(bs.x - e.w / 2, bs.y - e.h / 2, e.w, e.h);
        }
        if (e._frozen && e._frozen > 0) {
          ctx.fillStyle = "rgba(179,229,252,0.5)";
          ctx.fillRect(bs.x - e.w / 2 - 1, bs.y - e.h / 2 - 1, e.w + 2, e.h + 2);
          ctx.fillStyle = "rgba(255,255,255,0.7)";
          ctx.fillRect(bs.x - e.w / 2 - 1, bs.y - e.h / 2 - 2, 3, 2);
          ctx.fillRect(bs.x + e.w / 2 - 2, bs.y - e.h / 2 - 2, 3, 2);
        }
      }
    }
    for (const ai of window.game.player._afterimages) {
      const as = cam.w2s(ai.x, ai.y, canvas);
      ctx.globalAlpha = ai.alpha * 0.5;
      ctx.fillStyle = "#4fc3f7";
      ctx.fillRect(as.x - window.game.player.w / 2, as.y - window.game.player.h / 2, window.game.player.w, window.game.player.h);
      ctx.globalAlpha = 1;
    }
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
    for (const w of window.game.player.weapons) {
      if (w.draw) w.draw(ctx, cam, canvas);
    }
    for (const b of window.game.bullets) {
      const s = cam.w2s(b.x, b.y, canvas);
      if (b.color === "#ffd54f") {
        ctx.fillStyle = "#ffd54f";
        ctx.save();
        const angle = Math.atan2(b.vy, b.vx);
        ctx.translate(s.x, s.y);
        ctx.rotate(angle);
        ctx.fillRect(-6, -1, 12, 3);
        ctx.fillRect(4, -2, 4, 4);
        ctx.restore();
      } else if (b.color === "#ff6d00") {
        ctx.save();
        const angle = Math.atan2(b.vy, b.vx);
        ctx.translate(s.x, s.y);
        ctx.rotate(angle);
        ctx.fillStyle = "rgba(255,87,34,0.5)";
        ctx.fillRect(-12, -2, 8, 4);
        ctx.fillStyle = "rgba(255,152,0,0.4)";
        ctx.fillRect(-10, -1, 6, 2);
        ctx.fillStyle = "#ff6d00";
        ctx.fillRect(-6, -1.5, 12, 3);
        ctx.fillStyle = "#ff9100";
        ctx.fillRect(4, -2.5, 5, 5);
        ctx.fillStyle = "#ffeb3b";
        ctx.fillRect(7, -1, 3, 2);
        ctx.restore();
      } else if (b.color === "#4fc3f7" && b.frostSlow) {
        ctx.save();
        const angle = Math.atan2(b.vy, b.vx);
        ctx.translate(s.x, s.y);
        ctx.rotate(angle);
        ctx.fillStyle = "rgba(179,229,252,0.4)";
        ctx.fillRect(-12, -2, 8, 4);
        ctx.fillStyle = "rgba(144,202,249,0.3)";
        ctx.fillRect(-10, -1, 6, 2);
        ctx.fillStyle = "#4fc3f7";
        ctx.fillRect(-6, -1.5, 12, 3);
        ctx.fillStyle = "#81d4fa";
        ctx.fillRect(4, -2.5, 5, 5);
        ctx.fillStyle = "#e1f5fe";
        ctx.fillRect(7, -1, 3, 2);
        ctx.restore();
      } else {
        ctx.fillStyle = b.color;
        ctx.fillRect(s.x - b.w / 2, s.y - b.h / 2, b.w, b.h);
      }
    }
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    for (let i = window.game.dmgTexts.length - 1; i >= 0; i--) {
      const t = window.game.dmgTexts[i];
      t.y -= 30 * dt;
      t.life -= dt;
      if (t.life <= 0) {
        window.game.dmgTexts.splice(i, 1);
        continue;
      }
      const s = cam.w2s(t.x, t.y, canvas);
      ctx.font = "bold 12px monospace";
      ctx.fillStyle = `rgba(255,82,82,${Math.min(1, t.life * 3)})`;
      ctx.fillText(t.text, s.x, s.y);
    }
    if (window.game.screenFlash > 0) {
      window.game.screenFlash -= dt;
      ctx.fillStyle = `rgba(255,0,0,${window.game.screenFlash * 0.4})`;
      ctx.fillRect(0, 0, W, H);
    }
    if (window.game.shake && window.game.shake.timer > 0) window.game.shake.timer -= dt;
    drawHUD(ctx, W, H, dt, window.game);
  }
  requestAnimationFrame(loop);
  lastTime = 0;
  loop(performance.now());
  initInput();
  showScene("title-screen");
  updateTitleStats();
})();
