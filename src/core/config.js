// ===== Game Configuration =====
export const CFG = {
  MAP_W: 2400, MAP_H: 2400,
  GAME_TIME: 300,
  PLAYER_SPEED: 160, PLAYER_HP: 8, PLAYER_SIZE: 16,
  PICKUP_RANGE: 35, GEM_FLY_SPEED: 250,
  INVINCIBLE_TIME: 1.0,
  GOLD: {
    perKill: 3,
    gemToGold: true,
  },
  MAX_ENEMIES: 70, MAX_BULLETS: 100,
  EXP_TABLE: [0,8,12,18,24,32,42,55,70,88,108,132,160,195,240],
  ENEMY_TYPES: {
    zombie:   { w:16, h:16, hp:3, speed:40, dmg:1, color:'#4caf50' },
    bat:      { w:14, h:14, hp:1, speed:80, dmg:1, color:'#ab47bc' },
    skeleton: { w:14, h:14, hp:5, speed:20, dmg:1, color:'#e0e0e0', ranged:true, shootCD:2 },
    elite_skeleton: { w:18, h:18, hp:12, speed:15, dmg:2, color:'#b71c1c', ranged:true, shootCD:1.2, elite:true },
    boss:     { w:32, h:32, hp:200, speed:30, dmg:2, color:'#f44336', isBoss:true },
    ghost:    { w:12, h:12, hp:2, speed:55, dmg:1, color:'#b0bec5', phaseShift:true, teleport:true },
    splitter: { w:16, h:16, hp:4, speed:50, dmg:1, color:'#00897b', splitter:true },
    splitter_small: { w:8, h:8, hp:1, speed:70, dmg:1, color:'#4db6ac', isChild:true }
  },
  WEAPONS: {
    holywater: { name:'圣水', icon:'💧', desc:'环绕旋转' },
    knife:     { name:'飞刀', icon:'🗡', desc:'自动投掷' },
    lightning: { name:'闪电', icon:'⚡', desc:'随机电击' },
    bible:     { name:'圣经', icon:'📖', desc:'范围旋转' },
    firestaff: { name:'火焰法杖', icon:'🔥', desc:'锥形火焰' },
    frostaura: { name:'冰冻光环', icon:'❄️', desc:'范围减速' },
    boomerang: { name:'回旋镖', icon:'🪃', desc:'追踪回旋' },
    blizzard: { name:'暴风雪', icon:'❄️⚡', desc:'大范围暴风雪+闪电链', evolved:true },
    thunderholywater: { name:'雷暴圣水', icon:'⚡💧', desc:'旋转+链式闪电', evolved:true },
    fireknife: { name:'火焰飞刀', icon:'🔥🗡', desc:'燃烧穿透飞刀', evolved:true },
    holydomain: { name:'圣光领域', icon:'📖💧', desc:'超大范围+圣光脉冲', evolved:true },
    frostknife: { name:'冰霜飞刀', icon:'❄️🗡', desc:'减速穿透飞刀', evolved:true },
    flamebible: { name:'烈焰经文', icon:'🔥📖', desc:'旋转灼烧+火焰脉冲', evolved:true },
    thunderang: { name:'雷霆回旋', icon:'🪃⚡', desc:'追踪+闪电链', evolved:true },
    blazerang:  { name:'烈焰回旋', icon:'🪃🔥', desc:'追踪+火焰轨迹', evolved:true }
  },
  EVOLUTIONS: [
    { a:'holywater', b:'lightning', result:'thunderholywater', name:'雷暴圣水', icon:'⚡💧', desc:'旋转+链式闪电' },
    { a:'knife', b:'firestaff', result:'fireknife', name:'火焰飞刀', icon:'🔥🗡', desc:'燃烧穿透飞刀' },
    { a:'bible', b:'holywater', result:'holydomain', name:'圣光领域', icon:'📖💧', desc:'超大范围+圣光脉冲' },
    { a:'frostaura', b:'lightning', result:'blizzard', name:'暴风雪', icon:'❄️⚡', desc:'大范围暴风雪+闪电链' },
    { a:'knife', b:'frostaura', result:'frostknife', name:'冰霜飞刀', icon:'❄️🗡', desc:'减速穿透飞刀' },
    { a:'bible', b:'firestaff', result:'flamebible', name:'烈焰经文', icon:'🔥📖', desc:'旋转灼烧+火焰脉冲' },
    { a:'boomerang', b:'lightning', result:'thunderang', name:'雷霆回旋', icon:'🪃⚡', desc:'追踪+闪电链' },
    { a:'boomerang', b:'firestaff', result:'blazerang', name:'烈焰回旋', icon:'🪃🔥', desc:'追踪+火焰轨迹' }
  ],
  PASSIVES: {
    speedboots: { name:'疾风靴', icon:'👢', desc:'移动速度+15%', maxStack:3 },
    armor:      { name:'护甲',   icon:'🛡', desc:'受伤减少+1', maxStack:3 },
    magnet:     { name:'磁铁',   icon:'🧲', desc:'经验获取+30%', maxStack:3 },
    crit:       { name:'暴击戒指', icon:'💍', desc:'暴击率+8%', maxStack:3 },
    maxhp:      { name:'生命结晶', icon:'❤️', desc:'最大HP+2', maxStack:3 },
    regen:      { name:'再生护符', icon:'♻️', desc:'每5秒回复1HP', maxStack:3 },
    luckycoin:  { name:'幸运硬币', icon:'🪙', desc:'暴击伤害+50%，金币+15%', maxStack:3,
                  critDmgBonus: 0.5, goldDropBonus: 0.15 }
  },
  FOOD: {
    dropRate: 0.1, healAmount: 1, maxFood: 8, lifetime: 15, bossDropCount: 3,
    types: {
      zombie:   { icon:'🍖', color:'#8d6e63' },
      bat:      { icon:'🍇', color:'#ab47bc' },
      skeleton: { icon:'🧀', color:'#ffd54f' },
      boss:     { icon:'🍖', color:'#8d6e63' },
      ghost:    { icon:'🍞', color:'#e0e0e0' },
      elite_skeleton: { icon:'🧀', color:'#ffd54f' },
      splitter: { icon:'🍖', color:'#8d6e63' }
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
      { type:'heal', icon:'💊', value:3, desc:'回复3HP' },
      { type:'speed', icon:'⚡', value:0.5, duration:10, desc:'移速+50% 10秒' },
      { type:'exp', icon:'💎', value:20, desc:'+20经验' }
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
    kill:    {intensity:2, duration:0.08},
    killBig: {intensity:4, duration:0.12},
    hurt:   {intensity:6, duration:0.15},
    boss:    {intensity:8, duration:0.3},
    combo5:  {intensity:3, duration:0.1},
    combo10: {intensity:5, duration:0.15},
    combo20: {intensity:7, duration:0.2},
    combo50: {intensity:10, duration:0.25}
  },
  DIFFICULTY: {
    easy:   {name:'休闲',icon:'🌿',desc:'敌人更弱，适合新手',color:'#66bb6a',
             playerHpMul:1.25,playerSpeedMul:1.0,enemyHpMul:0.7,enemySpeedMul:0.8,enemyDmgMul:0.75,
             spawnIntervalMul:1.4,spawnCountMod:-1,bossHpMul:0.6,bossSpeedMul:0.8,expMul:1.3,foodDropMul:1.5},
    normal: {name:'标准',icon:'⚔️',desc:'标准难度，平衡体验',color:'#ffd54f',
             playerHpMul:1.0,playerSpeedMul:1.0,enemyHpMul:1.0,enemySpeedMul:1.0,enemyDmgMul:1.0,
             spawnIntervalMul:1.0,spawnCountMod:0,bossHpMul:1.0,bossSpeedMul:1.0,expMul:1.0,foodDropMul:1.0},
    hard:   {name:'噩梦',icon:'💀',desc:'极限挑战，真正的考验',color:'#ef5350',
             playerHpMul:0.75,playerSpeedMul:0.9,enemyHpMul:1.5,enemySpeedMul:1.3,enemyDmgMul:1.5,
             spawnIntervalMul:0.7,spawnCountMod:1,bossHpMul:2.0,bossSpeedMul:1.3,expMul:0.8,foodDropMul:0.6}
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
    key: 'roguelike_survivor_save',
    version: 1
  },
  CHARACTERS: {
    mage:    { name:'魔法师', icon:'🧙', hp:8, speed:160, desc:'均衡型，自选初始武器', chooseWeapon:true, colors:{hat:'#1a237e',body:'#1565c0',skin:'#ffe0b2',staff:'#795548',gem:'#ffd54f'} },
    warrior: { name:'战士',   icon:'🛡', hp:12,speed:140, desc:'高血量坦克，初始飞刀', startWeapon:'knife', colors:{hat:'#b71c1c',body:'#d32f2f',skin:'#ffe0b2',sword:'#9e9e9e',hilt:'#5d4037'} },
    ranger:  { name:'游侠',   icon:'🏹', hp:6, speed:190, desc:'高速低血，初始圣水', startWeapon:'holywater', colors:{hood:'#1b5e20',body:'#2e7d32',skin:'#ffe0b2',bow:'#795548',string:'#bdbdbd'} }
  },
  WAVE_PROGRESS: {
    stages: [
      { time:0,   name:'开局',  icon:'🟢', color:'#4caf50', enemies:['僵尸'] },
      { time:120, name:'中期',  icon:'🟡', color:'#ffd54f', enemies:['蝙蝠'] },
      { time:180, name:'后期',  icon:'🟠', color:'#ff9100', enemies:['骷髅','幽灵'] },
      { time:210, name:'精英期',icon:'🔴', color:'#ef5350', enemies:['精英骷髅'] },
      { time:270, name:'Boss期',icon:'💀', color:'#ff1744', enemies:['💀 Boss!'] }
    ],
    warningTime: 15,
    toastDuration: 2.5,
    barHeight: 4
  },
  SYNERGIES: {
    // 被动+被动
    crit_boots: { name:'风之锋刃', icon:'🔪', req:{passives:['crit','speedboots']}, desc:'暴击时发射飞刀',
      onCritKnife:{dmgMul:0.5,speed:250,life:1.0} },
    armor_maxhp: { name:'铁壁之心', icon:'🛡', req:{passives:['armor','maxhp']}, desc:'护甲效果翻倍',
      armorDouble:true },
    magnet_crit: { name:'贪婪之魂', icon:'💎', req:{passives:['magnet','crit']}, desc:'暴击额外掉落宝石',
      bonusGemValue:2 },
    boots_regen: { name:'生命奔流', icon:'🏃', req:{passives:['speedboots','regen']}, desc:'移动时再生速度翻倍',
      movingRegenSpeedMul:2 },
    armor_regen: { name:'钢铁堡垒', icon:'💪', req:{passives:['armor','regen']}, desc:'低HP时护甲+3',
      lowHpThreshold:0.3, tempArmorBonus:3 },
    magnet_maxhp: { name:'命运齿轮', icon:'🔮', req:{passives:['magnet','maxhp']}, desc:'拾取宝石2%回复1HP',
      gemHealChance:0.02 },
    // 武器+被动
    holywater_maxhp: { name:'圣水膨胀', icon:'⛪', req:{weapon:'holywater',passive:'maxhp'}, desc:'圣水球体半径+30%',
      weaponBonus:{radiusMul:1.3} },
    knife_crit: { name:'致命飞刀', icon:'🗡', req:{weapon:'knife',passive:'crit'}, desc:'飞刀可暴击',
      weaponBonus:{canCrit:true} },
    lightning_magnet: { name:'过载闪电', icon:'⚡', req:{weapon:'lightning',passive:'magnet'}, desc:'闪电链+1，射程+50',
      weaponBonus:{extraChains:1,rangeBonus:50} },
    bible_boots: { name:'烈焰圣经', icon:'🔥', req:{weapon:'bible',passive:'speedboots'}, desc:'圣经速度×1.5，范围+20',
      weaponBonus:{speedMul:1.5,radiusBonus:20} },
    firestaff_armor: { name:'熔岩法杖', icon:'🌋', req:{weapon:'firestaff',passive:'armor'}, desc:'锥形范围+40px，点燃+1s',
      weaponBonus:{coneBonus:40,burnDurBonus:1} },
    frost_regen: { name:'极寒光环', icon:'❄️', req:{weapon:'frostaura',passive:'regen'}, desc:'冰冻概率+5%/s，冰冻+0.5s',
      weaponBonus:{freezeBonus:0.05,freezeDurBonus:0.5} },
    // Lucky coin synergies (Drive #23)
    crit_luckycoin: { name:'命运赌徒', icon:'🎲', req:{passives:['crit','luckycoin']}, desc:'暴击时金币掉落翻倍',
      critGoldDouble:true },
    holywater_luckycoin: { name:'圣水炼金', icon:'🧪', req:{weapon:'holywater',passive:'luckycoin'}, desc:'圣水击杀额外掉落1金币',
      weaponBonus:{killGoldBonus:1} },
    firestaff_luckycoin: { name:'炼金烈焰', icon:'🔑', req:{weapon:'firestaff',passive:'luckycoin'}, desc:'点燃敌人宝石价值+1',
      weaponBonus:{burnGemBonus:1} },
    frostaura_luckycoin: { name:'冰霜拾荒', icon:'❄️', req:{weapon:'frostaura',passive:'luckycoin'}, desc:'冰冻敌人宝石吸引范围+30px',
      weaponBonus:{frozenGemPullBonus:30} },
    // Boomerang synergies (Drive #23)
    boomerang_magnet: { name:'磁力回旋', icon:'🪃🧲', req:{weapon:'boomerang',passive:'magnet'}, desc:'回旋镖飞行路径吸引宝石',
      weaponBonus:{flightPullRange:30} },
    boomerang_crit: { name:'致命回旋', icon:'🪃💍', req:{weapon:'boomerang',passive:'crit'}, desc:'回旋镖可暴击',
      weaponBonus:{canCrit:true,critSizeBonus:1.2,critPierceBonus:1} }
  },
  SHOP: {
    soulFragmentRate: 0.3,
    upgrades: {
      maxhp:     { name:'生命强化', icon:'❤️', maxLevel:3, costs:[20,40,80],   effects:[{hp:1},{hp:2},{hp:3}] },
      speed:     { name:'速度训练', icon:'👟', maxLevel:3, costs:[20,40,80],   effects:[{speedMul:1.05},{speedMul:1.10},{speedMul:1.15}] },
      pickup:    { name:'拾取精通', icon:'📡', maxLevel:3, costs:[15,30,60],   effects:[{range:5},{range:10},{range:15}] },
      expbonus:  { name:'知识汲取', icon:'📚', maxLevel:3, costs:[25,50,100],  effects:[{mul:1.05},{mul:1.10},{mul:1.15}] },
      weaponDmg: { name:'武器精通', icon:'⚔️', maxLevel:3, costs:[30,60,120],  effects:[{mul:1.03},{mul:1.06},{mul:1.10}] },
      gold:      { name:'贪婪之心', icon:'💰', maxLevel:3, costs:[15,30,60],   effects:[{mul:1.10},{mul:1.20},{mul:1.30}] },
    }
  },
  UPGRADE_REROLL: {
    maxReroll: 1
  },
  QUESTS: [
    { id:'warrior_30', name:'战士之道', icon:'🛡', desc:'用战士击杀30只敌人', check:s=>s.charId==='warrior'&&s.kills>=30, reward:50 },
    { id:'ranger_30',  name:'箭无虚发', icon:'🏹', desc:'用游侠击杀30只敌人', check:s=>s.charId==='ranger'&&s.kills>=30, reward:50 },
    { id:'hard_survive',name:'勇者无惧', icon:'💀', desc:'噩梦难度存活2分钟', check:s=>s.difficulty==='hard'&&s.elapsed>=120, reward:100 },
    { id:'hard_boss',   name:'噩梦征服者',icon:'👑',desc:'噩梦难度击败Boss', check:s=>s.difficulty==='hard'&&s.bossKilled, reward:200 },
    { id:'kill_50',     name:'屠戮者',   icon:'⚔️',desc:'单局击杀50个敌人', check:s=>s.kills>=50, reward:75 },
    { id:'kill_100',    name:'百人斩',   icon:'💯',desc:'单局击杀100个敌人',check:s=>s.kills>=100, reward:150 },
    { id:'kill_boss',   name:'屠龙者',   icon:'🐲',desc:'击败骨龙Boss',     check:s=>s.bossKilled, reward:100 },
    { id:'no_damage',   name:'完美闪避', icon:'✨',desc:'不受伤存活1分钟',   check:s=>s.elapsed>=60&&s.damageTaken===0, reward:120 },
    { id:'combo_20',    name:'连击大师', icon:'🔥',desc:'达成20连击',       check:s=>s.bestCombo>=20, reward:100 },
    { id:'combo_50',    name:'连击之王', icon:'💥',desc:'达成50连击',       check:s=>s.bestCombo>=50, reward:200 },
    // Endless mode quests
    { id:'endless_5min',  name:'无尽征途', icon:'♾', desc:'无尽模式存活5分钟',    check:s=>s.endless&&s.elapsed>=300, reward:150 },
    { id:'endless_10min', name:'不朽传说', icon:'⏱', desc:'无尽模式存活10分钟',   check:s=>s.endless&&s.elapsed>=600, reward:300 },
    { id:'endless_boss3', name:'连斩三龙', icon:'🐲', desc:'单局无尽击杀3个Boss',  check:s=>s.endless&&s.bossKillCount>=3, reward:400 },
    { id:'endless_kill200',name:'无尽屠戮', icon:'💀', desc:'单局无尽击杀200敌人', check:s=>s.endless&&s.kills>=200, reward:250 },
  ],
  ACHIEVEMENTS: {
    // === Milestone ===
    total_kills_100:   { name:'百战之士',   icon:'⚔️',  desc:'累计击杀100只敌人',     type:'milestone', check:{stat:'totalKills',target:100},   reward:30 },
    total_kills_500:   { name:'屠戮先锋',   icon:'💀',  desc:'累计击杀500只敌人',     type:'milestone', check:{stat:'totalKills',target:500},   reward:80 },
    total_kills_2000:  { name:'杀戮之王',   icon:'👑',  desc:'累计击杀2000只敌人',    type:'milestone', check:{stat:'totalKills',target:2000},  reward:200 },
    games_10:          { name:'初出茅庐',   icon:'🎮',  desc:'游玩10局',             type:'milestone', check:{stat:'gamesPlayed',target:10},    reward:20 },
    games_50:          { name:'身经百战',   icon:'🏆',  desc:'游玩50局',             type:'milestone', check:{stat:'gamesPlayed',target:50},    reward:60 },
    // === Survival ===
    survive_3min:      { name:'三分钟幸存者', icon:'⏱', desc:'标准难度存活3分钟',     type:'condition', reward:30,
      check: s => s.difficulty === 'normal' && s.elapsed >= 180 },
    survive_5min:      { name:'五分钟大师',  icon:'🌟',  desc:'标准难度存活5分钟(通关)', type:'condition', reward:80,
      check: s => s.difficulty === 'normal' && s.elapsed >= 300 },
    survive_hard_5min: { name:'噩梦幸存者',  icon:'💀',  desc:'噩梦难度存活5分钟',     type:'condition', reward:150,
      check: s => s.difficulty === 'hard' && s.elapsed >= 300 },
    // === Character (multi) ===
    all_chars:         { name:'全能冒险者',  icon:'🎭',  desc:'使用全部3个角色通关',   type:'multi',     reward:100,
      parts: ['char_mage','char_warrior','char_ranger'] },
    char_mage:         { hidden:true, check: s => s.charId === 'mage'    && s.elapsed >= 300 },
    char_warrior:      { hidden:true, check: s => s.charId === 'warrior' && s.elapsed >= 300 },
    char_ranger:       { hidden:true, check: s => s.charId === 'ranger'  && s.elapsed >= 300 },
    // === Kill/Challenge ===
    boss_kill:         { name:'屠龙者',     icon:'🐲',  desc:'击败Boss',            type:'condition', reward:50,
      check: s => s.bossKilled },
    boss_kill_hard:    { name:'噩梦征服者',  icon:'🔥',  desc:'噩梦难度击败Boss',     type:'condition', reward:150,
      check: s => s.difficulty === 'hard' && s.bossKilled },
    combo_30:          { name:'连击风暴',    icon:'🌪',  desc:'单局达成30连击',       type:'condition', reward:60,
      check: s => s.bestCombo >= 30 },
    combo_50:          { name:'连击之神',    icon:'⚡',  desc:'单局达成50连击',       type:'condition', reward:120,
      check: s => s.bestCombo >= 50 },
    no_damage_2min:    { name:'完美闪避',    icon:'✨',  desc:'不受伤存活2分钟',      type:'condition', reward:100,
      check: s => s.elapsed >= 120 && s.damageTaken === 0 },
    kill_100_single:   { name:'百人斩',     icon:'💯',  desc:'单局击杀100只敌人',     type:'condition', reward:80,
      check: s => s.kills >= 100 },
    // === Evolution/Synergy ===
    evolve_weapon:     { name:'第一次进化',  icon:'🧬',  desc:'首次进化武器',         type:'flag', reward:40 },
    synergy_first:     { name:'协同发现',    icon:'🔗',  desc:'首次触发协同效果',      type:'flag', reward:40 },
    all_evolutions:    { name:'进化大师',    icon:'💎',  desc:'完成全部8种武器进化',   type:'multi', reward:300,
      parts: ['evo_thunderholywater','evo_fireknife','evo_holydomain','evo_blizzard','evo_frostknife','evo_flamebible','evo_thunderang','evo_blazerang'] },
    evo_thunderholywater: { hidden:true, check: s => s.evolutions && s.evolutions.includes('thunderholywater') },
    evo_fireknife:        { hidden:true, check: s => s.evolutions && s.evolutions.includes('fireknife') },
    evo_holydomain:       { hidden:true, check: s => s.evolutions && s.evolutions.includes('holydomain') },
    evo_blizzard:         { hidden:true, check: s => s.evolutions && s.evolutions.includes('blizzard') },
    evo_frostknife:       { hidden:true, check: s => s.evolutions && s.evolutions.includes('frostknife') },
    evo_flamebible:       { hidden:true, check: s => s.evolutions && s.evolutions.includes('flamebible') },
    evo_thunderang:       { hidden:true, check: s => s.evolutions && s.evolutions.includes('thunderang') },
    evo_blazerang:        { hidden:true, check: s => s.evolutions && s.evolutions.includes('blazerang') },
    // === Shop/Economy ===
    shop_first:        { name:'初次投资',    icon:'🏪',  desc:'首次购买商店升级',      type:'flag', reward:20 },
    shop_max_one:      { name:'专精之路',    icon:'📈',  desc:'将任一商店升级买满3级', type:'flag', reward:60 },
    shop_max_all:      { name:'全面发展',    icon:'🌟',  desc:'将全部6种商店升级买满', type:'flag', reward:300 },
    // === Quest ===
    quests_half:       { name:'挑战新星',    icon:'🌟',  desc:'完成一半Quest(7个)',    type:'condition', reward:50,
      check: s => (s.completedQuestsCount || 0) >= 7 },
    quests_all:        { name:'挑战大师',    icon:'👑',  desc:'完成全部Quest',        type:'condition', reward:150,
      check: s => (s.completedQuestsCount || 0) >= 14 },
    // === Hidden ===
    speed_clear:       { name:'速度与激情',  icon:'🏎',  desc:'在3分钟内击败Boss',     type:'condition', reward:100,
      check: s => s.bossKilled && s.elapsed <= 180, hidden:true },
    pacifist_1min:     { name:'和平主义者',  icon:'🕊',  desc:'前1分钟不击杀任何敌人存活', type:'condition', reward:80,
      check: s => s.elapsed >= 60 && s.killsAt60 === 0, hidden:true },
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
    bossKillReward: { gold: 50, exp: 30, food: 5 },
  },
  BOOMERANG: {
    levels: {
      1: { count:1, speed:280, returnSpeed:320, dmg:3, maxDist:250, cd:1.8, pierce:0, trackAngle:0.52, curvature:0.3 },
      2: { count:2, speed:280, returnSpeed:320, dmg:4, maxDist:300, cd:1.4, pierce:1, trackAngle:0.79, curvature:0.3 },
      3: { count:3, speed:320, returnSpeed:360, dmg:5, maxDist:350, cd:1.0, pierce:2, trackAngle:1.05, curvature:0.2 },
    },
    thunderang: { count:4, speed:350, returnSpeed:380, dmg:7, maxDist:400, cd:0.8, pierce:3, trackAngle:1.31, curvature:0.15,
      lightning:{ chance:0.4, range:120, targets:2, dmg:8, chains:2, decay:0.5 } },
    blazerang:  { count:3, speed:330, returnSpeed:360, dmg:6, maxDist:380, cd:0.8, pierce:3, trackAngle:1.05, curvature:0.2,
      flame:{ trailInterval:20, trailDur:1.5, trailDps:2, maxTrails:20, burnDur:2.5, burnDps:3 } },
  }
};
