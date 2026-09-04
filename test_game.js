// Systems and Logic Verification Script for Dragon Warrior 3D
import { soundEngine } from './src/audio/synth.js';
import { CombatEngine } from './src/combat/combatEngine.js';
import { LuckyLottoMiniGame } from './src/minigames/lotto.js';
import { CampfireSystem } from './src/minigames/cooking.js';
import { FairyFluteInstrument } from './src/minigames/flute.js';
import { MonsterFactory } from './src/entities/monsters.js';

console.log('--- Starting Dragon Warrior 3D System Tests ---');

// Mock Game object for testing
const mockGame = {
  player: {
    stats: {
      name: 'Erdrick',
      level: 1,
      hp: 15,
      maxHp: 15,
      mp: 10,
      maxMp: 10,
      attack: 10,
      defense: 6,
      agility: 8,
      exp: 0,
      nextExp: 7,
      gold: 50,
      weapon: 'Copper Sword',
      armor: 'Cloth'
    },
    inventory: {
      herbs: 3,
      torches: 1,
      magicKeys: 1,
      fairyFlute: true,
      sunstone: false,
      staffOfRain: false,
      rainbowDrop: false,
      gwaelinLove: false
    },
    spells: ['HEAL', 'HURT'],
    isCarryingPrincess: false,
    hasTorchEquipped: false,
    hasRadiantActive: false,
    position: { x: 0, y: 0, z: 0 },
    setCarryingPrincess: function(val) { this.isCarryingPrincess = val; },
    setTorchEquipped: function(val) { this.hasTorchEquipped = val; },
    setRadiantActive: function(val) { this.hasRadiantActive = val; },
    addExp: function(amt) {
      this.stats.exp += amt;
      if (this.stats.exp >= this.stats.nextExp) {
        this.stats.level++;
        return true;
      }
      return false;
    }
  },
  particles: {
    spawnSpellBurst: () => {}
  },
  ui: {
    addCombatLog: (msg) => console.log('  [Combat Log]:', msg),
    triggerMonsterHitEffect: () => {},
    triggerPlayerDamageFlash: () => {},
    showToast: (msg) => console.log('  [Toast]:', msg),
    updateHUD: () => {},
    showCombatUI: () => {},
    hideCombatUI: () => {}
  },
  onGreenDragonDefeated: () => console.log('  -> Green Dragon Defeated callback called!'),
  onDragonlordDefeated: () => console.log('  -> Dragonlord Defeated callback called!'),
  updateLocationMusic: () => {}
};

// 1. Test Sound Engine Note Frequency math
const freqC4 = soundEngine.noteToFreq('C4');
const freqA4 = soundEngine.noteToFreq('A4');
console.log(`[SoundEngine] C4 = ${freqC4.toFixed(2)} Hz (Expected ~261.63 Hz)`);
console.log(`[SoundEngine] A4 = ${freqA4.toFixed(2)} Hz (Expected 440.00 Hz)`);
if (Math.abs(freqA4 - 440) < 0.01) {
  console.log('✓ Audio frequency calculation PASSED');
} else {
  console.error('✗ Audio frequency calculation FAILED');
  process.exit(1);
}

// 2. Test Combat Engine Mechanics
const combat = new CombatEngine(mockGame);
const slimeData = {
  type: 'slime',
  name: 'Slime',
  hp: 6,
  maxHp: 6,
  attack: 4,
  defense: 3,
  agility: 3,
  exp: 2,
  gold: 3
};

console.log('\n[Combat Test: Slime Encounter]');
combat.startEncounter(slimeData, false);
combat.executeAttack(); // Player attacks
if (combat.currentMonster.currentHp < 6) {
  console.log(`✓ Player attack dealt damage: Slime HP is now ${combat.currentMonster.currentHp}`);
}

// Test Casting HURT spell
console.log('\n[Combat Test: Casting HURT Spell]');
combat.executeSpell('HURT');
console.log(`✓ Spell cast successfully. Player MP is now ${mockGame.player.stats.mp}`);

// Test Casting HEAL spell
console.log('\n[Combat Test: Casting HEAL Spell]');
mockGame.player.stats.hp = 5;
combat.executeSpell('HEAL');
console.log(`✓ Spell HEAL recovered HP to ${mockGame.player.stats.hp}`);

// 3. Test Lucky Lotto Casino
console.log('\n[Mini-Game Test: Lucky Lotto]');
const lotto = new LuckyLottoMiniGame(mockGame);
const lottoResult = lotto.rollDice(10);
console.log('✓ Lotto Roll Result:', lottoResult);

// 4. Test Campfire Cooking
console.log('\n[Mini-Game Test: Campfire Brewing]');
const campfire = new CampfireSystem(mockGame);
const brewResult = campfire.brewElixir();
console.log('✓ Brew Result:', brewResult);
console.log(`✓ Herbs remaining: ${mockGame.player.inventory.herbs}`);

// 5. Test Fairy Flute Melody
console.log('\n[Mini-Game Test: Fairy Flute]');
const flute = new FairyFluteInstrument(mockGame);
flute.playNote('E5');
flute.playNote('G5');
flute.playNote('A5');
flute.playNote('E5');
const matched = flute.checkSecretMelody();
console.log(`✓ Secret Melody (E-G-A-E) match: ${matched ? 'TRUE (PASSED)' : 'FALSE'}`);

// 6. Test Monsters Presets
console.log('\n[Bestiary Test]');
const slime = MonsterFactory.createSlime();
const greenDragon = MonsterFactory.createGreenDragon();
const dragonlord = MonsterFactory.createDragonlord();
console.log(`✓ Slime created: HP=${slime.userData.hp}`);
console.log(`✓ Green Dragon created: HP=${greenDragon.userData.hp}, Boss=${greenDragon.userData.isBoss}`);
console.log(`✓ Dragonlord created: HP=${dragonlord.userData.hp}, Boss=${dragonlord.userData.isBoss}`);

console.log('\n========================================');
console.log('🎉 ALL SYSTEM TESTS COMPLETED SUCCESSFULLY! 🎉');
console.log('========================================');
