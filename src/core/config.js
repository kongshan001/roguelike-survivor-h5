// ===== Game Configuration =====
export const CFG = {
  MAP_W: 2400, MAP_H: 2400,
  GAME_TIME: 300,
  PLAYER_SPEED: 160, PLAYER_HP: 8, PLAYER_SIZE: 16,
  PICKUP_RANGE: 35, GEM_FLY_SPEED: 250,
  INVINCIBLE_TIME: 1.0,
  MAX_ENEMIES: 50, MAX_BULLETS: 100,
  EXP_TABLE: [0,10,15,22,30,40,52,66,82,100,120,144,172,206,246],
  ENEMY_TYPES: {
    zombie:   { w:16, h:16, hp:3, speed:40, dmg:1, color:'#4caf50' },
    bat:      { w:14, h:14, hp:1, speed:80, dmg:1, color:'#ab47bc' },
    skeleton: { w:14, h:14, hp:5, speed:20, dmg:1, color:'#e0e0e0', ranged:true, shootCD:2 },
    elite_skeleton: { w:18, h:18, hp:12, speed:15, dmg:2, color:'#b71c1c', ranged:true, shootCD:1.2, elite:true },
    boss:     { w:32, h:32, hp:200, speed:30, dmg:2, color:'#f44336', isBoss:true },
    ghost:    { w:12, h:12, hp:2, speed:55, dmg:1, color:'#b0bec5', phaseShift:true, teleport:true }
  },
  WEAPONS: {
    holywater: { name:'圣水', icon:'💧', desc:'环绕旋转' },
    knife:     { name:'飞刀', icon:'🗡', desc:'自动投掷' },
    lightning: { name:'闪电', icon:'⚡', desc:'随机电击' },
    bible:     { name:'圣经', icon:'📖', desc:'范围旋转' },
    firestaff: { name:'火焰法杖', icon:'🔥', desc:'锥形火焰' },
    frostaura: { name:'冰冻光环', icon:'❄️', desc:'范围减速' },
    blizzard: { name:'暴风雪', icon:'❄️⚡', desc:'大范围暴风雪+闪电链', evolved:true },
    thunderholywater: { name:'雷暴圣水', icon:'⚡💧', desc:'旋转+链式闪电', evolved:true },
    fireknife: { name:'火焰飞刀', icon:'🔥🗡', desc:'燃烧穿透飞刀', evolved:true },
    holydomain: { name:'圣光领域', icon:'📖💧', desc:'超大范围+圣光脉冲', evolved:true }
  },
  EVOLUTIONS: [
    { a:'holywater', b:'lightning', result:'thunderholywater', name:'雷暴圣水', icon:'⚡💧', desc:'旋转+链式闪电' },
    { a:'knife', b:'firestaff', result:'fireknife', name:'火焰飞刀', icon:'🔥🗡', desc:'燃烧穿透飞刀' },
    { a:'bible', b:'holywater', result:'holydomain', name:'圣光领域', icon:'📖💧', desc:'超大范围+圣光脉冲' },
    { a:'frostaura', b:'lightning', result:'blizzard', name:'暴风雪', icon:'❄️⚡', desc:'大范围暴风雪+闪电链' }
  ],
  PASSIVES: {
    speedboots: { name:'疾风靴', icon:'👢', desc:'移动速度+15%', maxStack:3 },
    armor:      { name:'护甲',   icon:'🛡', desc:'受伤减少+1', maxStack:3 },
    magnet:     { name:'磁铁',   icon:'🧲', desc:'经验获取+30%', maxStack:3 },
    crit:       { name:'暴击戒指', icon:'💍', desc:'暴击率+8%', maxStack:3 },
    maxhp:      { name:'生命结晶', icon:'❤️', desc:'最大HP+2', maxStack:3 },
    regen:      { name:'再生护符', icon:'♻️', desc:'每5秒回复1HP', maxStack:3 }
  },
  FOOD: {
    dropRate: 0.1, healAmount: 1, maxFood: 8, lifetime: 15, bossDropCount: 3,
    types: {
      zombie:   { icon:'🍖', color:'#8d6e63' },
      bat:      { icon:'🍇', color:'#ab47bc' },
      skeleton: { icon:'🧀', color:'#ffd54f' },
      boss:     { icon:'🍖', color:'#8d6e63' },
      ghost:    { icon:'🍞', color:'#e0e0e0' },
      elite_skeleton: { icon:'🧀', color:'#ffd54f' }
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
      weaponBonus:{freezeBonus:0.05,freezeDurBonus:0.5} }
  },
  UPGRADE_REROLL: {
    maxReroll: 1
  }
};
