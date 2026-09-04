// Turn-Based & Cinematic Combat System (Faithful to Dragon Warrior NES Mechanics)
import { soundEngine } from '../audio/synth.js';
import { musicManager } from '../audio/music.js';

export class CombatEngine {
  constructor(game) {
    this.game = game;
    this.inCombat = false;
    this.currentMonster = null;
    this.currentMonsterRef = null;
    this.isPlayerTurn = true;
    this.enemyAsleep = 0; // Sleep turn counter
    this.isBossEncounter = false;
  }

  startEncounter(monsterData, isBoss = false, monsterRef = null) {
    this.inCombat = true;
    this.isBossEncounter = isBoss;
    this.currentMonsterRef = monsterRef;
    this.currentMonster = {
      ...monsterData,
      currentHp: monsterData.hp
    };
    this.isPlayerTurn = true;
    this.enemyAsleep = 0;

    // Switch music to battle theme
    musicManager.playTrack('battle');

    // Draw Erdrick's Sword for battle
    if (this.game.player && typeof this.game.player.setWeaponDrawn === 'function') {
      this.game.player.setWeaponDrawn(true);
    }

    // Trigger Combat UI overlay
    if (this.game.ui) {
      this.game.ui.showCombatUI(this.currentMonster);
      this.game.ui.addCombatLog(`A ${this.currentMonster.name} draws near!`);
    }
  }

  // Action 1: FIGHT (Melee attack)
  executeAttack() {
    if (!this.inCombat || !this.isPlayerTurn) return;
    this.isPlayerTurn = false;

    const player = this.game.player;
    const monster = this.currentMonster;

    // Determine hit, critical hit (1/16 chance), and damage
    const isCritical = Math.random() < 0.08;
    soundEngine.playSFX(isCritical ? 'critical_hit' : 'sword_attack');

    let baseDamage = Math.max(1, Math.floor((player.stats.attack - monster.defense * 0.5) * (0.8 + Math.random() * 0.4)));
    if (isCritical) {
      baseDamage = Math.floor(player.stats.attack * 1.5 + Math.random() * 4);
      this.game.ui?.addCombatLog("A tremendous hit! Excellent move!");
    } else {
      this.game.ui?.addCombatLog(`${player.stats.name} attacks!`);
    }

    monster.currentHp -= baseDamage;
    this.game.ui?.addCombatLog(`The ${monster.name} takes ${baseDamage} points of damage!`);
    this.game.ui?.triggerMonsterHitEffect(isCritical);
    if (this.game.ui?.updateCombatEnemyHP) this.game.ui.updateCombatEnemyHP(monster);
    if (this.game.ui?.showMonsterDamagePopup) this.game.ui.showMonsterDamagePopup(baseDamage, isCritical);

    // Check monster death
    if (monster.currentHp <= 0) {
      this.handleVictory();
      return;
    }

    // Schedule enemy turn
    setTimeout(() => {
      this.executeEnemyTurn();
    }, 1100);
  }

  // Action 2: SPELL
  executeSpell(spellName) {
    if (!this.inCombat || !this.isPlayerTurn) return;
    const player = this.game.player;
    const monster = this.currentMonster;

    const spellCosts = {
      HEAL: 3,
      HURT: 2,
      SLEEP: 2,
      RADIANT: 3,
      STOPSPELL: 2,
      HEALMORE: 8,
      HURTMORE: 5
    };

    const cost = spellCosts[spellName] || 0;
    if (player.stats.mp < cost) {
      this.game.ui?.addCombatLog("Thy MP is insufficient to cast that spell!");
      return;
    }

    player.stats.mp -= cost;
    this.isPlayerTurn = false;
    soundEngine.playSFX('spell_cast');

    if (spellName === 'HEAL') {
      const recovered = Math.floor(20 + Math.random() * 12);
      player.stats.hp = Math.min(player.stats.maxHp, player.stats.hp + recovered);
      soundEngine.playSFX('heal_spell');
      this.game.particles?.spawnSpellBurst(player.position, 'heal');
      this.game.ui?.addCombatLog(`${player.stats.name} chants HEAL! Restored ${recovered} HP!`);
      this.game.ui?.updateHUD();
      if (this.game.ui?.showPlayerDamagePopup) this.game.ui.showPlayerDamagePopup(`+${recovered}`, true);
    } else if (spellName === 'HEALMORE') {
      const recovered = Math.floor(85 + Math.random() * 15);
      player.stats.hp = Math.min(player.stats.maxHp, player.stats.hp + recovered);
      soundEngine.playSFX('heal_spell');
      this.game.particles?.spawnSpellBurst(player.position, 'heal');
      this.game.ui?.addCombatLog(`${player.stats.name} chants HEALMORE! Restored ${recovered} HP!`);
      this.game.ui?.updateHUD();
      if (this.game.ui?.showPlayerDamagePopup) this.game.ui.showPlayerDamagePopup(`+${recovered}`, true);
    } else if (spellName === 'HURT') {
      const dmg = Math.floor(8 + Math.random() * 7);
      monster.currentHp -= dmg;
      soundEngine.playSFX('hurt_spell');
      this.game.particles?.spawnSpellBurst(player.position, 'hurt');
      this.game.ui?.addCombatLog(`${player.stats.name} chants HURT! Fireball strikes for ${dmg} damage!`);
      this.game.ui?.triggerMonsterHitEffect(false);
      if (this.game.ui?.updateCombatEnemyHP) this.game.ui.updateCombatEnemyHP(monster);
      if (this.game.ui?.showMonsterDamagePopup) this.game.ui.showMonsterDamagePopup(dmg, false);
    } else if (spellName === 'HURTMORE') {
      const dmg = Math.floor(48 + Math.random() * 18);
      monster.currentHp -= dmg;
      soundEngine.playSFX('hurt_spell');
      this.game.particles?.spawnSpellBurst(player.position, 'hurtmore');
      this.game.ui?.addCombatLog(`${player.stats.name} chants HURTMORE! Lightning tears into the ${monster.name} for ${dmg} damage!`);
      this.game.ui?.triggerMonsterHitEffect(true);
      if (this.game.ui?.updateCombatEnemyHP) this.game.ui.updateCombatEnemyHP(monster);
      if (this.game.ui?.showMonsterDamagePopup) this.game.ui.showMonsterDamagePopup(dmg, true);
    } else if (spellName === 'SLEEP') {
      soundEngine.playSFX('spell_cast');
      this.game.particles?.spawnSpellBurst(player.position, 'sleep');
      if (Math.random() < 0.7) {
        this.enemyAsleep = 3;
        this.game.ui?.addCombatLog(`The ${monster.name} falls into a deep slumber!`);
      } else {
        this.game.ui?.addCombatLog(`The spell had no effect upon the ${monster.name}!`);
      }
    } else if (spellName === 'RADIANT') {
      soundEngine.playSFX('spell_cast');
      this.game.particles?.spawnSpellBurst(player.position, 'radiant');
      player.setRadiantActive(true);
      this.game.ui?.addCombatLog("A radiant burst illuminates the cavern and dazzles the foe!");
    }

    this.game.ui?.updateHUD();

    if (monster.currentHp <= 0) {
      this.handleVictory();
      return;
    }

    setTimeout(() => {
      this.executeEnemyTurn();
    }, 1200);
  }

  // Action 3: ITEM
  executeItem(itemType) {
    if (!this.inCombat || !this.isPlayerTurn) return;
    const player = this.game.player;
    const monster = this.currentMonster;

    if (itemType === 'herb') {
      if (player.inventory.herbs <= 0) {
        this.game.ui?.addCombatLog("Thou hast no herbs left!");
        return;
      }
      player.inventory.herbs--;
      const heal = Math.floor(25 + Math.random() * 10);
      player.stats.hp = Math.min(player.stats.maxHp, player.stats.hp + heal);
      soundEngine.playSFX('heal_spell');
      this.game.ui?.addCombatLog(`${player.stats.name} uses a Medicinal Herb! Restored ${heal} HP!`);
      this.game.ui?.updateHUD();
      if (this.game.ui?.showPlayerDamagePopup) this.game.ui.showPlayerDamagePopup(`+${heal}`, true);
      this.game.ui?.renderCombatItemList();
    } else if (itemType === 'flute') {
      if (!player.inventory.fairyFlute) {
        this.game.ui?.addCombatLog("Thou dost not possess the Fairy Flute!");
        return;
      }
      soundEngine.playSFX('flute_note');
      this.enemyAsleep = 4;
      this.game.ui?.addCombatLog(`${player.stats.name} plays the sweet Fairy Flute! The ${monster.name} is lulled to sleep!`);
    } else if (itemType === 'torch') {
      if (player.inventory.torches <= 0) {
        this.game.ui?.addCombatLog("Thou hast no torches left!");
        return;
      }
      player.inventory.torches--;
      const torchDmg = Math.floor(5 + Math.random() * 5);
      monster.currentHp -= torchDmg;
      soundEngine.playSFX('hurt_spell');
      this.game.ui?.addCombatLog(`${player.stats.name} hurls a blazing torch! Scorches the ${monster.name} for ${torchDmg} damage!`);
      this.game.ui?.triggerMonsterHitEffect(false);
      if (this.game.ui?.updateCombatEnemyHP) this.game.ui.updateCombatEnemyHP(monster);
      if (this.game.ui?.showMonsterDamagePopup) this.game.ui.showMonsterDamagePopup(torchDmg, false);
      this.game.ui?.renderCombatItemList();

      if (monster.currentHp <= 0) {
        this.handleVictory();
        return;
      }
    }

    this.isPlayerTurn = false;
    setTimeout(() => {
      this.executeEnemyTurn();
    }, 1100);
  }

  // Action 4: RUN
  executeRun() {
    if (!this.inCombat || !this.isPlayerTurn) return;
    if (this.isBossEncounter) {
      this.game.ui?.addCombatLog("Thou cannot run from this fateful destiny!");
      return;
    }

    const player = this.game.player;
    const monster = this.currentMonster;
    // Classic DW escape formula: agility check
    const canEscape = player.stats.agility * Math.random() >= monster.agility * Math.random() * 0.65;

    if (canEscape) {
      this.isPlayerTurn = false;
      this.game.ui?.addCombatLog(`${player.stats.name} escaped successfully!`);
      soundEngine.playSFX('stairs');

      // 1. Move escaped monster back towards patrol zone
      if (this.currentMonsterRef && this.currentMonsterRef.mesh) {
        this.currentMonsterRef.mesh.position.x = this.currentMonsterRef.originX + (Math.random() - 0.5) * 8;
        this.currentMonsterRef.mesh.position.z = this.currentMonsterRef.originZ + (Math.random() - 0.5) * 8;
        this.currentMonsterRef.patrolTimer = 0;
      }

      // 2. Set encounter grace period (4.5s) so the player has time to walk away
      if (this.game) {
        this.game.combatCooldown = 4.5;
      }

      setTimeout(() => {
        this.endCombat(false);
      }, 750);
    } else {
      this.game.ui?.addCombatLog("The enemy blocked the path!");
      this.isPlayerTurn = false;
      setTimeout(() => {
        this.executeEnemyTurn();
      }, 1000);
    }
  }

  // Enemy Turn
  executeEnemyTurn() {
    if (!this.inCombat) return;
    const player = this.game.player;
    const monster = this.currentMonster;

    // Check if monster is sleeping
    if (this.enemyAsleep > 0) {
      this.enemyAsleep--;
      this.game.ui?.addCombatLog(`The ${monster.name} is still fast asleep...`);
      this.isPlayerTurn = true;
      return;
    }

    // Boss special attack (Flame Breath / Inferno)
    let isFireBreath = false;
    if (monster.type === 'green_dragon' || monster.type === 'dragonlord') {
      if (Math.random() < 0.45) isFireBreath = true;
    }

    if (isFireBreath) {
      soundEngine.playSFX('hurt_spell');
      const breathDmg = Math.floor(monster.attack * 1.1 + Math.random() * 6);
      player.stats.hp -= breathDmg;
      this.game.ui?.addCombatLog(`The ${monster.name} spews a torrent of scorching flame!`);
      this.game.ui?.addCombatLog(`${player.stats.name} takes ${breathDmg} points of damage!`);
      this.game.ui?.updateHUD();
      if (this.game.ui?.showPlayerDamagePopup) this.game.ui.showPlayerDamagePopup(`-${breathDmg}`, false);
    } else {
      soundEngine.playSFX('sword_attack');
      let dmg = Math.max(1, Math.floor((monster.attack - player.stats.defense * 0.5) * (0.8 + Math.random() * 0.4)));
      // Beginner protection: prevent early sudden deaths so player has time to learn, heal, and fight back
      if (!this.isBossEncounter) {
        if (player.stats.level === 1) {
          dmg = Math.min(dmg, 3); // Max 3 dmg at Lv1 (~20% of 15 HP), ensuring at least 5 hits of survival
        } else if (player.stats.level === 2) {
          dmg = Math.min(dmg, 5);
        }
      }
      player.stats.hp -= dmg;
      this.game.ui?.addCombatLog(`The ${monster.name} attacks!`);
      this.game.ui?.addCombatLog(`${player.stats.name} takes ${dmg} points of damage!`);
      this.game.ui?.updateHUD();
      if (this.game.ui?.showPlayerDamagePopup) this.game.ui.showPlayerDamagePopup(`-${dmg}`, false);
    }

    this.game.ui?.triggerPlayerDamageFlash();

    // Check Player Death
    if (player.stats.hp <= 0) {
      this.handleDefeat();
      return;
    }

    this.isPlayerTurn = true;
  }

  handleVictory() {
    const player = this.game.player;
    const monster = this.currentMonster;

    soundEngine.playSFX('victory');
    this.game.ui?.addCombatLog(`Thou hast defeated the ${monster.name}!`);
    this.game.ui?.addCombatLog(`Thou gained ${monster.exp} EXP and ${monster.gold} Gold Coins!`);

    player.stats.gold += monster.gold;
    const leveledUp = player.addExp(monster.exp);
    this.game.ui?.updateHUD();

    // Defeated roaming monster disappears and respawns later
    if (this.currentMonsterRef && this.currentMonsterRef.mesh) {
      this.currentMonsterRef.mesh.visible = false;
      this.currentMonsterRef.respawnTimer = 25.0; // 25s respawn
    }
    if (this.game) {
      this.game.combatCooldown = 4.0;
    }

    if (leveledUp) {
      setTimeout(() => {
        soundEngine.playSFX('level_up');
        this.game.ui?.addCombatLog(`Courage and strength surged! ${player.stats.name} has advanced to Level ${player.stats.level}!`);
        this.game.ui?.updateHUD();
      }, 700);
    }

    // Boss specific triggers
    if (monster.type === 'green_dragon') {
      setTimeout(() => {
        this.game.onGreenDragonDefeated?.();
      }, 1400);
    } else if (monster.type === 'dragonlord') {
      setTimeout(() => {
        this.game.onDragonlordDefeated?.();
      }, 1500);
    }

    setTimeout(() => {
      this.endCombat(true);
    }, 2200);
  }

  handleDefeat() {
    this.game.ui?.addCombatLog("Thou art vanquished in battle...");
    setTimeout(() => {
      // Revival by King Lorik
      const player = this.game.player;
      player.stats.hp = player.stats.maxHp;
      player.stats.mp = player.stats.maxMp;
      player.position.set(0, 3.5, -28); // Back at castle
      this.endCombat(false);
      this.game.ui?.showToast("King Lorik hath revived thee in Tantegel Castle!");
      this.game.ui?.updateHUD();
    }, 2000);
  }

  endCombat(won) {
    this.inCombat = false;
    this.currentMonster = null;
    this.currentMonsterRef = null;
    this.isPlayerTurn = true;

    // Sheathe sword back into scabbard
    if (this.game.player && typeof this.game.player.setWeaponDrawn === 'function') {
      this.game.player.setWeaponDrawn(false);
    }

    // Return music to appropriate location theme
    this.game.updateLocationMusic?.();

    if (this.game.ui) {
      this.game.ui.hideCombatUI();
    }
  }
}
