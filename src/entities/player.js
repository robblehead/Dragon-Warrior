// Authentic NES Dragon Warrior Hero Stats, Level Table (1-30), Equipment, Spells & Grid State

export const LEVEL_TABLE = [
  null, // 1-indexed
  { level: 1,  exp: 0,     str: 4,   agi: 4,   maxHp: 15,  maxMp: 0,   spell: null },
  { level: 2,  exp: 7,     str: 5,   agi: 4,   maxHp: 22,  maxMp: 0,   spell: null },
  { level: 3,  exp: 23,    str: 7,   agi: 6,   maxHp: 24,  maxMp: 5,   spell: 'HEAL' },
  { level: 4,  exp: 47,    str: 7,   agi: 8,   maxHp: 31,  maxMp: 16,  spell: 'HURT' },
  { level: 5,  exp: 110,   str: 12,  agi: 10,  maxHp: 35,  maxMp: 20,  spell: null },
  { level: 6,  exp: 220,   str: 16,  agi: 10,  maxHp: 38,  maxMp: 24,  spell: null },
  { level: 7,  exp: 450,   str: 18,  agi: 17,  maxHp: 40,  maxMp: 26,  spell: 'SLEEP' },
  { level: 8,  exp: 800,   str: 22,  agi: 20,  maxHp: 46,  maxMp: 29,  spell: null },
  { level: 9,  exp: 1300,  str: 30,  agi: 22,  maxHp: 50,  maxMp: 36,  spell: 'RADIANT' },
  { level: 10, exp: 2000,  str: 35,  agi: 31,  maxHp: 54,  maxMp: 40,  spell: 'STOPSPELL' },
  { level: 11, exp: 2900,  str: 40,  agi: 35,  maxHp: 62,  maxMp: 50,  spell: null },
  { level: 12, exp: 4000,  str: 48,  agi: 40,  maxHp: 63,  maxMp: 58,  spell: 'OUTSIDE' },
  { level: 13, exp: 5500,  str: 52,  agi: 48,  maxHp: 70,  maxMp: 64,  spell: 'RETURN' },
  { level: 14, exp: 7500,  str: 60,  agi: 55,  maxHp: 78,  maxMp: 70,  spell: null },
  { level: 15, exp: 10000, str: 68,  agi: 64,  maxHp: 86,  maxMp: 72,  spell: 'REPEL' },
  { level: 16, exp: 13000, str: 72,  agi: 70,  maxHp: 92,  maxMp: 95,  spell: null },
  { level: 17, exp: 17000, str: 72,  agi: 78,  maxHp: 100, maxMp: 100, spell: 'HEALMORE' },
  { level: 18, exp: 21000, str: 85,  agi: 84,  maxHp: 115, maxMp: 108, spell: null },
  { level: 19, exp: 26000, str: 87,  agi: 86,  maxHp: 130, maxMp: 115, spell: 'HURTMORE' },
  { level: 20, exp: 32000, str: 92,  agi: 88,  maxHp: 138, maxMp: 128, spell: null },
  { level: 21, exp: 38000, str: 95,  agi: 90,  maxHp: 149, maxMp: 135, spell: null },
  { level: 22, exp: 44000, str: 97,  agi: 90,  maxHp: 158, maxMp: 146, spell: null },
  { level: 23, exp: 50000, str: 99,  agi: 94,  maxHp: 165, maxMp: 153, spell: null },
  { level: 24, exp: 55000, str: 103, agi: 98,  maxHp: 170, maxMp: 161, spell: null },
  { level: 25, exp: 60000, str: 113, agi: 100, maxHp: 174, maxMp: 161, spell: null },
  { level: 26, exp: 63000, str: 117, agi: 105, maxHp: 180, maxMp: 168, spell: null },
  { level: 27, exp: 65000, str: 125, agi: 107, maxHp: 189, maxMp: 175, spell: null },
  { level: 28, exp: 67000, str: 130, agi: 115, maxHp: 195, maxMp: 180, spell: null },
  { level: 29, exp: 69000, str: 135, agi: 120, maxHp: 200, maxMp: 190, spell: null },
  { level: 30, exp: 70000, str: 140, agi: 130, maxHp: 210, maxMp: 200, spell: null },
];

export const WEAPONS = {
  'None': { name: 'None', atk: 0, price: 0, sprite: 'unarmed' },
  'Bamboo Pole': { name: 'Bamboo Pole', atk: 2, price: 10, sprite: 'unarmed' },
  'Club': { name: 'Club', atk: 4, price: 60, sprite: 'unarmed' },
  'Copper Sword': { name: 'Copper Sword', atk: 10, price: 180, sprite: 'sword' },
  'Hand Axe': { name: 'Hand Axe', atk: 15, price: 560, sprite: 'sword' },
  'Broad Sword': { name: 'Broad Sword', atk: 20, price: 1500, sprite: 'sword' },
  'Flame Sword': { name: 'Flame Sword', atk: 28, price: 9800, sprite: 'sword' },
  "Erdrick's Sword": { name: "Erdrick's Sword", atk: 40, price: 0, sprite: 'sword' },
};

export const ARMORS = {
  'None': { name: 'None', def: 0, price: 0 },
  'Clothes': { name: 'Clothes', def: 2, price: 20 },
  'Leather Armor': { name: 'Leather Armor', def: 4, price: 70 },
  'Chain Mail': { name: 'Chain Mail', def: 10, price: 300 },
  'Half Plate': { name: 'Half Plate', def: 16, price: 1000 },
  'Full Plate': { name: 'Full Plate', def: 24, price: 3000 },
  'Magic Armor': { name: 'Magic Armor', def: 24, price: 7700, regen: true },
  "Erdrick's Armor": { name: "Erdrick's Armor", def: 28, price: 0, regen: true, magicResist: true, tileImmunity: true },
};

export const SHIELDS = {
  'None': { name: 'None', def: 0, price: 0 },
  'Small Shield': { name: 'Small Shield', def: 4, price: 90 },
  'Large Shield': { name: 'Large Shield', def: 10, price: 800 },
  'Silver Shield': { name: 'Silver Shield', def: 20, price: 14800 },
};

export const SPELL_COSTS = {
  HEAL: 4,
  HURT: 2,
  SLEEP: 2,
  RADIANT: 3,
  STOPSPELL: 2,
  OUTSIDE: 6,
  RETURN: 8,
  REPEL: 2,
  HEALMORE: 10,
  HURTMORE: 5,
};

export class PlayerCharacter {
  constructor(name = 'ERDRICK') {
    // Grid position & smooth interpolation
    this.x = 4;
    this.y = 4;
    this.renderX = 4;
    this.renderY = 4;
    this.dir = 'up';
    this.stepFrame = 0;

    // Step animation state
    this.isMoving = false;
    this.moveStartX = 4;
    this.moveStartY = 4;
    this.moveTargetX = 4;
    this.moveTargetY = 4;
    this.moveProgress = 0;
    this.moveDuration = 0.19; // ~190ms per tile (classic NES stride cadence)

    // Core Stats
    const lv1 = LEVEL_TABLE[1];
    this.stats = {
      name,
      level: 1,
      hp: lv1.maxHp,
      maxHp: lv1.maxHp,
      mp: lv1.maxMp,
      maxMp: lv1.maxMp,
      strength: lv1.str,
      agility: lv1.agi,
      exp: 0,
      nextExp: LEVEL_TABLE[2].exp,
      gold: 0,
      weapon: 'None',
      armor: 'None',
      shield: 'None',
    };

    // Spells & Inventory
    this.spells = [];
    this.inventory = {
      herbs: 0,         // max 6
      magicKeys: 0,     // max 6
      torches: 0,
      fairyWater: 0,
      wings: 0,
      dragonScale: false,
      fighterRing: false,
      fairyFlute: false,
      silverHarp: false,
      gwaelinLove: false,
      erdrickToken: false,
      sunstone: false,
      staffOfRain: false,
      rainbowDrop: false,
      ballOfLight: false,
    };

    // Active status counters (measured in steps)
    this.torchSteps = 0;
    this.radiantSteps = 0;
    this.repelSteps = 0;
    this.isCarryingPrincess = false;
  }

  getAttackPower() {
    const wAtk = (WEAPONS[this.stats.weapon] || WEAPONS.None).atk;
    const ringBonus = this.inventory.fighterRing ? 2 : 0;
    return this.stats.strength + wAtk + ringBonus;
  }

  getDefensePower() {
    const aDef = (ARMORS[this.stats.armor] || ARMORS.None).def;
    const sDef = (SHIELDS[this.stats.shield] || SHIELDS.None).def;
    const scaleBonus = this.inventory.dragonScale ? 2 : 0;
    return Math.floor(this.stats.agility / 2) + aDef + sDef + scaleBonus;
  }

  hasTileImmunity() {
    return Boolean((ARMORS[this.stats.armor] || ARMORS.None).tileImmunity);
  }

  hasMagicResist() {
    return Boolean((ARMORS[this.stats.armor] || ARMORS.None).magicResist);
  }

  hasArmorRegen() {
    return Boolean((ARMORS[this.stats.armor] || ARMORS.None).regen);
  }

  getLightRadius() {
    if (this.radiantSteps > 100) return 3;
    if (this.radiantSteps > 40) return 2;
    if (this.radiantSteps > 0 || this.torchSteps > 0) return 1;
    return 0;
  }

  getSpriteVariant() {
    if (this.isCarryingPrincess) return 'carrying_princess';
    const hasSword = (WEAPONS[this.stats.weapon] || WEAPONS.None).sprite === 'sword';
    const hasShield = this.stats.shield !== 'None';
    if (hasSword && hasShield) return 'sword_shield';
    if (hasSword) return 'sword';
    return 'unarmed';
  }

  /**
   * Awards EXP and processes multi-level ups up to Lv 30.
   * Returns an array of level-up summary objects.
   */
  addExp(amount) {
    this.stats.exp = Math.min(99999, this.stats.exp + amount);
    const levelUps = [];

    while (this.stats.level < 30) {
      const nextLv = LEVEL_TABLE[this.stats.level + 1];
      if (!nextLv || this.stats.exp < nextLv.exp) break;

      const prevStr = this.stats.strength;
      const prevAgi = this.stats.agility;
      const prevHp = this.stats.maxHp;
      const prevMp = this.stats.maxMp;

      this.stats.level = nextLv.level;
      this.stats.strength = nextLv.str;
      this.stats.agility = nextLv.agi;
      this.stats.maxHp = nextLv.maxHp;
      this.stats.maxMp = nextLv.maxMp;
      // In NES DW, HP/MP do not auto-refill completely on level up? Actually in NES DW they increase by the gained delta (or stay current + delta)! Let's add the gained delta so it feels authentic!
      this.stats.hp = Math.min(this.stats.maxHp, this.stats.hp + Math.max(0, nextLv.maxHp - prevHp));
      this.stats.mp = Math.min(this.stats.maxMp, this.stats.mp + Math.max(0, nextLv.maxMp - prevMp));

      if (nextLv.spell && !this.spells.includes(nextLv.spell)) {
        this.spells.push(nextLv.spell);
      }

      levelUps.push({
        level: nextLv.level,
        strGain: nextLv.str - prevStr,
        agiGain: nextLv.agi - prevAgi,
        hpGain: nextLv.maxHp - prevHp,
        mpGain: nextLv.maxMp - prevMp,
        newSpell: nextLv.spell,
      });
    }

    this.stats.nextExp = this.stats.level < 30 ? LEVEL_TABLE[this.stats.level + 1].exp : 0;
    return levelUps;
  }

  /**
   * Decrement step timers and apply Magic/Erdrick Armor regen.
   */
  onStepTaken(isDarkMap) {
    if (isDarkMap) {
      if (this.radiantSteps > 0) this.radiantSteps--;
      else if (this.torchSteps > 0) this.torchSteps--;
    }
    if (this.repelSteps > 0) this.repelSteps--;
    if (this.hasArmorRegen() && this.stats.hp < this.stats.maxHp && this.stats.hp > 0) {
      this.stats.hp = Math.min(this.stats.maxHp, this.stats.hp + 1);
    }
  }

  setGridPosition(x, y, dir = null) {
    this.x = x;
    this.y = y;
    this.renderX = x;
    this.renderY = y;
    this.isMoving = false;
    this.moveProgress = 0;
    if (dir) this.dir = dir;
  }

  startStep(targetX, targetY, dir) {
    this.dir = dir;
    this.isMoving = true;
    this.moveStartX = this.x;
    this.moveStartY = this.y;
    this.moveTargetX = targetX;
    this.moveTargetY = targetY;
    this.moveProgress = 0;
    this.stepFrame = (this.stepFrame + 1) % 2;
  }

  updateStep(dt) {
    if (!this.isMoving) return false;
    this.moveProgress += dt / this.moveDuration;
    if (this.moveProgress >= 1) {
      this.x = this.moveTargetX;
      this.y = this.moveTargetY;
      this.renderX = this.x;
      this.renderY = this.y;
      this.isMoving = false;
      this.moveProgress = 0;
      return true; // Step completed
    }
    this.renderX = this.moveStartX + (this.moveTargetX - this.moveStartX) * this.moveProgress;
    this.renderY = this.moveStartY + (this.moveTargetY - this.moveStartY) * this.moveProgress;
    return false;
  }
}
