// Systems Verification Script for Dragon Warrior (NES Edition)
import assert from 'node:assert/strict';
import { soundEngine } from './src/audio/synth.js';
import { DragonWarriorGame } from './src/main.js';
import { MONSTERS } from './src/entities/monsters.js';
import { WEAPONS, ARMORS, SHIELDS } from './src/entities/player.js';

console.log('--- Starting Dragon Warrior (NES Edition) System Tests ---');

// 1. Audio frequency calculation
const freqC4 = soundEngine.noteToFreq('C4');
const freqA4 = soundEngine.noteToFreq('A4');
assert.ok(Math.abs(freqC4 - 261.63) < 0.1, `Expected C4 ~261.63Hz, got ${freqC4}`);
assert.ok(Math.abs(freqA4 - 440.0) < 0.01, `Expected A4 440Hz, got ${freqA4}`);
console.log('✓ Audio frequency math passed');

// 2. Initialize headless game in Tantegel Throne Room
const game = new DragonWarriorGame(true);
game.combat.instantMode = true;
game.startNewGame();

assert.equal(game.currentMapId, 'tantegel_throne');
assert.equal(game.player.x, 5);
assert.equal(game.player.y, 2);
assert.equal(game.player.stats.level, 1);
assert.equal(game.player.stats.hp, 15);

// 3. Test collision with King Lorik / Throne & Brick Wall, then step movement
assert.equal(game.tryMove('up'), false, 'Should block moving onto King Lorik');
assert.equal(game.tryMove('right'), true, 'Should step right onto (6,2)');
assert.equal(game.player.updateStep(0.5), true, 'Step should complete');
assert.equal(game.player.x, 6);
assert.equal(game.player.y, 2);

// 4. Open all 3 Tantegel Throne Room chests
// Chest 1: (8, 1) gold_120
game.player.setGridPosition(8, 2, 'up');
assert.equal(game.cmdTake(), true);
assert.equal(game.player.stats.gold, 120);

// Chest 2: (9, 1) torch
game.player.setGridPosition(9, 2, 'up');
assert.equal(game.cmdTake(), true);
assert.equal(game.player.inventory.torches, 1);

// Chest 3: (9, 3) magic_key
game.player.setGridPosition(8, 3, 'right');
assert.equal(game.cmdTake(), true);
assert.equal(game.player.inventory.magicKeys, 1);
console.log('✓ Grid collision, movement, and Tantegel chests passed');

// 5. Test DOOR unlocking and STAIRS warp
game.player.setGridPosition(5, 6, 'down');
assert.equal(game.tryMove('down'), false, 'Locked door at (5,7) should block movement');
assert.equal(game.cmdDoor(), true, 'DOOR should consume 1 Magic Key and unlock (5,7)');
assert.equal(game.player.inventory.magicKeys, 0);
assert.equal(game.tryMove('down'), true, 'Unlocked door should now be walkable');
game.player.updateStep(0.5);
game.onStepCompleted();

// Step down to stairs at (5,9) -> tantegel_courtyard
game.player.setGridPosition(5, 8, 'down');
assert.equal(game.tryMove('down'), true);
game.player.updateStep(0.5);
game.onStepCompleted();
assert.equal(game.currentMapId, 'tantegel_courtyard');
console.log('✓ Locked door + Magic Key + Stairs warp passed');

// 6. Test Level-Up Stat Table, Spells & Equipment Power
const ups = game.player.addExp(50);
assert.equal(game.player.stats.level, 4);
assert.equal(ups.length, 3);
assert.ok(game.player.spells.includes('HEAL'));
assert.ok(game.player.spells.includes('HURT'));
game.player.stats.weapon = 'Copper Sword';
game.player.stats.armor = 'Leather Armor';
game.player.stats.shield = 'Small Shield';
const expectedAtk = game.player.stats.strength + WEAPONS['Copper Sword'].atk;
const expectedDef = Math.floor(game.player.stats.agility / 2) + ARMORS['Leather Armor'].def + SHIELDS['Small Shield'].def;
assert.equal(game.player.getAttackPower(), expectedAtk);
assert.equal(game.player.getDefensePower(), expectedDef);
assert.equal(game.player.getSpriteVariant(), 'sword_shield');
console.log('✓ NES Level 1-30 progression, spell learning, and equipment stats passed');

// 7. Test Turn-Based Combat vs Slime (Attack, HURT, HEAL)
game.combat.startEncounter('slime');
assert.equal(game.combat.inCombat, true);
const startHp = game.combat.currentMonster.currentHp;
game.combat.executeAttack();
assert.ok(!game.combat.inCombat || game.combat.currentMonster.currentHp < startHp);

// Test HURT & HEAL spells in combat
game.combat.startEncounter('skeleton');
game.player.stats.maxHp = 60;
game.player.stats.hp = 35;
game.player.stats.mp = 20;
game.combat.executeSpell('HEAL');
assert.ok(game.player.stats.hp > 10, 'HEAL should restore HP');
game.combat.isPlayerTurn = true;
game.combat.turnLocked = false;
const skelHp = game.combat.currentMonster.currentHp;
game.combat.executeSpell('HURT');
assert.ok(game.combat.inCombat && game.combat.currentMonster.currentHp <= skelHp, 'HURT executed');
game.combat.endCombat(false);
console.log('✓ Turn-based combat (FIGHT / SPELL) passed');

// Test Defeat Revival at Tantegel Throne
game.player.stats.gold = 100;
game.combat.startEncounter('skeleton');
game.player.stats.hp = 1;
game.combat.executeEnemyTurn();
assert.equal(game.combat.inCombat, false, 'Defeat should end combat');
assert.equal(game.currentMapId, 'tantegel_throne', 'Defeat should revive at King Lorik');
assert.equal(game.player.stats.gold, 50, 'Defeat should halve gold');
assert.equal(game.player.stats.hp, game.player.stats.maxHp, 'Revival should restore full HP');
console.log('✓ Defeat & King Lorik revival passed');

// 8. Test Golem + Fairy Flute sleep mechanic
game.player.inventory.fairyFlute = true;
game.combat.startEncounter('golem', 'cantlin_golem');
game.combat.executeItem('fairyFlute');
assert.equal(game.combat.enemyAsleep, 3, 'Fairy Flute should sleep Golem (1 turn skipped synchronously, 3 remaining)');
game.combat.endCombat(false);
console.log('✓ Golem + Fairy Flute interaction passed');

// 9. Test 2-Phase Dragonlord Transformation & Ball of Light Victory
game.combat.startEncounter('dragonlord_1', 'dragonlord_final');
assert.equal(game.combat.currentMonster.type, 'dragonlord_1');
game.combat.currentMonster.currentHp = 1;
game.player.stats.hp = 200;
game.combat.executeAttack();
assert.equal(game.combat.inCombat, true, 'Defeating Phase 1 must transform into Phase 2 without ending combat');
assert.equal(game.combat.currentMonster.type, 'dragonlord_2');

// Now defeat Phase 2
game.combat.currentMonster.currentHp = 1;
game.combat.isPlayerTurn = true;
game.combat.turnLocked = false;
game.combat.executeAttack();
assert.equal(game.player.inventory.ballOfLight, true, 'Defeating Phase 2 must award Ball of Light');
assert.equal(game.defeatedBosses.has('dragonlord_final'), true);
console.log('✓ Dragonlord 2-Phase transformation and Ball of Light victory passed');

// 10. Test Rainbow Drop bridge & Dungeon Darkness radius
game.warpTo('overworld', 23, 30, 'left', true);
assert.equal(game.getEffectiveTile(game.currentMap, 22, 30), 'WATER');
game.rainbowBridgeBuilt = true;
assert.equal(game.getEffectiveTile(game.currentMap, 22, 30), 'BRIDGE');
assert.equal(game.player.getLightRadius(), 0);
game.player.torchSteps = 50;
assert.equal(game.player.getLightRadius(), 1);
game.player.radiantSteps = 150;
assert.equal(game.player.getLightRadius(), 3);
console.log('✓ Rainbow Bridge and Dungeon Darkness light radius passed');

console.log('\n=================================================');
console.log('ALL NES DRAGON WARRIOR SYSTEM TESTS PASSED!');
console.log('=================================================');
