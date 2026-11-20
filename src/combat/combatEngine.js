// Authentic NES Dragon Warrior Turn-Based Combat System
import { createMonsterInstance, OVERWORLD_ENCOUNTER_ZONES, DUNGEON_ENCOUNTERS } from '../entities/monsters.js';
import { getOverworldZone } from '../world/maps.js';
import { SPELL_COSTS } from '../entities/player.js';

export class CombatEngine {
  constructor(game) {
    this.game = game;
    this.inCombat = false;
    this.currentMonster = null;
    this.activeBossId = null;
    this.isPlayerTurn = true;
    this.turnLocked = false;
    this.instantMode = false; // For synchronous unit testing

    this.enemyAsleep = 0;
    this.enemyStopspell = false;
    this.playerAsleep = 0;
    this.playerStopspell = false;
  }

  /**
   * Evaluates random step encounters on overworld and dungeon tiles.
   */
  rollRandomEncounter(map, tileType, x, y) {
    const player = this.game.player;
    if (!map || player.inventory.ballOfLight) return null;
    if (!map.isOverworld && !DUNGEON_ENCOUNTERS[map.id]) return null;

    let rate = 0;
    if (tileType === 'SWAMP' || tileType === 'BARRIER_FLOOR') rate = 0.125;
    else if (tileType === 'FOREST' || tileType === 'HILL') rate = 0.095;
    else if (tileType === 'DESERT' || tileType === 'STONE_FLOOR') rate = 0.075;
    else if (tileType === 'GRASS' || tileType === 'BRIDGE') rate = 0.06;
    else return null;

    if (Math.random() >= rate) return null;

    let pool;
    if (map.isOverworld) {
      const zone = getOverworldZone(x, y);
      pool = OVERWORLD_ENCOUNTER_ZONES[zone] || OVERWORLD_ENCOUNTER_ZONES[0];
    } else {
      pool = DUNGEON_ENCOUNTERS[map.id];
    }

    const chosenType = pool[Math.floor(Math.random() * pool.length)];
    const candidate = createMonsterInstance(chosenType);

    // REPEL / Fairy Water wards off weak monsters
    if (player.repelSteps > 0 && candidate.defense < Math.floor(player.getAttackPower() / 2)) {
      return null;
    }

    return chosenType;
  }

  startEncounter(monsterType, bossId = null) {
    this.inCombat = true;
    this.activeBossId = bossId;
    this.currentMonster = createMonsterInstance(monsterType);
    this.isPlayerTurn = true;
    this.turnLocked = false;

    this.enemyAsleep = 0;
    this.enemyStopspell = false;
    this.playerAsleep = 0;
    this.playerStopspell = false;

    const musicTrack = (monsterType === 'dragonlord_1' || monsterType === 'dragonlord_2')
      ? 'dragonlord'
      : 'battle';
    this.game.music?.playTrack(musicTrack);

    this.game.ui?.showCombat(this.currentMonster);
    this.game.ui?.addCombatLog(`A ${this.currentMonster.name} draws near!`);

    // Check if player wakes up or starts awake (standard turn 1 is player's unless ambushed)
  }

  schedule(fn, ms) {
    if (this.instantMode) {
      fn();
    } else {
      setTimeout(fn, ms);
    }
  }

  checkPlayerWakeBeforeAction() {
    if (this.playerAsleep > 0) {
      this.playerAsleep--;
      if (this.playerAsleep === 0 || Math.random() < 0.35) {
        this.playerAsleep = 0;
        this.game.ui?.addCombatLog(`${this.game.player.stats.name} awakens!`);
        return true;
      }
      this.game.ui?.addCombatLog(`${this.game.player.stats.name} is still asleep!`);
      this.turnLocked = true;
      this.isPlayerTurn = false;
      this.schedule(() => this.executeEnemyTurn(), 750);
      return false;
    }
    return true;
  }

  // Command 1: FIGHT
  executeAttack() {
    if (!this.inCombat || !this.isPlayerTurn || this.turnLocked) return;
    if (!this.checkPlayerWakeBeforeAction()) return;

    this.isPlayerTurn = false;
    this.turnLocked = true;

    const player = this.game.player;
    const monster = this.currentMonster;

    const isCrit = Math.random() < (1 / 32);
    const atk = player.getAttackPower();
    let dmg;

    if (isCrit) {
      dmg = Math.max(1, Math.floor(atk * (0.55 + Math.random() * 0.45)));
      this.game.sound?.playSFX('critical_hit');
      this.game.ui?.addCombatLog("Excellent move!");
    } else {
      const diff = atk - Math.floor(monster.defense / 2);
      dmg = Math.max(1, Math.floor(Math.max(1, diff) * (0.5 + Math.random() * 0.5)));
      this.game.sound?.playSFX('attack_hit');
      this.game.ui?.addCombatLog(`${player.stats.name} attacks!`);
    }

    monster.currentHp -= dmg;
    this.game.renderer?.triggerMonsterBlink(420);
    this.game.ui?.addCombatLog(`The ${monster.name}'s Hit Points have been reduced by ${dmg}!`);

    if (monster.currentHp <= 0) {
      this.schedule(() => this.handleEnemyDefeated(), 700);
      return;
    }

    this.schedule(() => this.executeEnemyTurn(), 850);
  }

  // Command 2: SPELL
  executeSpell(spellName) {
    if (!this.inCombat || !this.isPlayerTurn || this.turnLocked) return;
    if (!this.checkPlayerWakeBeforeAction()) return;

    const player = this.game.player;
    const monster = this.currentMonster;

    if (this.playerStopspell) {
      this.game.ui?.addCombatLog("Thy spell hath been blocked!");
      this.isPlayerTurn = false;
      this.turnLocked = true;
      this.schedule(() => this.executeEnemyTurn(), 800);
      return;
    }

    const cost = SPELL_COSTS[spellName] || 0;
    if (player.stats.mp < cost) {
      this.game.ui?.addCombatLog("Thy MP is too low!");
      return;
    }

    player.stats.mp -= cost;
    this.isPlayerTurn = false;
    this.turnLocked = true;
    this.game.sound?.playSFX('spell_cast');
    this.game.renderer?.triggerFlash('#fcfcfc', 240);
    this.game.ui?.updateStatusWindow();

    if (spellName === 'HEAL') {
      const heal = 15 + Math.floor(Math.random() * 8);
      player.stats.hp = Math.min(player.stats.maxHp, player.stats.hp + heal);
      this.game.sound?.playSFX('heal');
      this.game.ui?.addCombatLog(`${player.stats.name} chants the spell of HEAL!`);
      this.game.ui?.addCombatLog(`Thy Hit Points increase by ${heal}!`);
      this.game.ui?.updateStatusWindow();
    } else if (spellName === 'HEALMORE') {
      const heal = 85 + Math.floor(Math.random() * 16);
      player.stats.hp = Math.min(player.stats.maxHp, player.stats.hp + heal);
      this.game.sound?.playSFX('heal');
      this.game.ui?.addCombatLog(`${player.stats.name} chants the spell of HEALMORE!`);
      this.game.ui?.addCombatLog(`Thy Hit Points are restored by ${heal}!`);
      this.game.ui?.updateStatusWindow();
    } else if (spellName === 'HURT') {
      this.game.ui?.addCombatLog(`${player.stats.name} chants the spell of HURT!`);
      if (Math.random() < monster.hurtResist) {
        this.game.ui?.addCombatLog(`But the spell hath no effect on the ${monster.name}!`);
      } else {
        const dmg = 8 + Math.floor(Math.random() * 6);
        monster.currentHp -= dmg;
        this.game.renderer?.triggerMonsterBlink(420);
        this.game.ui?.addCombatLog(`The ${monster.name} takes ${dmg} points of damage!`);
      }
    } else if (spellName === 'HURTMORE') {
      this.game.ui?.addCombatLog(`${player.stats.name} chants the spell of HURTMORE!`);
      if (Math.random() < monster.hurtResist) {
        this.game.ui?.addCombatLog(`But the spell hath no effect on the ${monster.name}!`);
      } else {
        const dmg = 58 + Math.floor(Math.random() * 9);
        monster.currentHp -= dmg;
        this.game.renderer?.triggerMonsterBlink(420);
        this.game.ui?.addCombatLog(`Blazing fire engulfs the ${monster.name} for ${dmg} damage!`);
      }
    } else if (spellName === 'SLEEP') {
      this.game.ui?.addCombatLog(`${player.stats.name} chants the spell of SLEEP!`);
      if (Math.random() > monster.sleepResist) {
        this.enemyAsleep = 3;
        this.game.ui?.addCombatLog(`The ${monster.name} falls asleep!`);
      } else {
        this.game.ui?.addCombatLog(`But the spell failed!`);
      }
    } else if (spellName === 'STOPSPELL') {
      this.game.ui?.addCombatLog(`${player.stats.name} chants STOPSPELL!`);
      if (Math.random() > monster.stopspellResist) {
        this.enemyStopspell = true;
        this.game.ui?.addCombatLog(`The ${monster.name}'s spell hath been sealed!`);
      } else {
        this.game.ui?.addCombatLog(`But it hath no effect!`);
      }
    } else {
      this.game.ui?.addCombatLog(`Nothing happened.`);
    }

    if (monster.currentHp <= 0) {
      this.schedule(() => this.handleEnemyDefeated(), 750);
      return;
    }

    this.schedule(() => this.executeEnemyTurn(), 900);
  }

  // Command 3: ITEM
  executeItem(itemId) {
    if (!this.inCombat || !this.isPlayerTurn || this.turnLocked) return;
    if (!this.checkPlayerWakeBeforeAction()) return;

    const player = this.game.player;
    const monster = this.currentMonster;

    if (itemId === 'herb') {
      if (player.inventory.herbs <= 0) {
        this.game.ui?.addCombatLog("Thou hast no Medicinal Herbs!");
        return;
      }
      player.inventory.herbs--;
      const heal = 23 + Math.floor(Math.random() * 8);
      player.stats.hp = Math.min(player.stats.maxHp, player.stats.hp + heal);
      this.game.sound?.playSFX('heal');
      this.game.ui?.addCombatLog(`${player.stats.name} uses a Medicinal Herb!`);
      this.game.ui?.addCombatLog(`Restored ${heal} Hit Points!`);
      this.game.ui?.updateStatusWindow();
    } else if (itemId === 'fairyFlute') {
      if (!player.inventory.fairyFlute) return;
      this.game.sound?.playSFX('flute');
      this.game.ui?.addCombatLog(`${player.stats.name} blows upon the Fairy Flute!`);
      if (monster.weakToFlute) {
        this.enemyAsleep = 4;
        this.game.ui?.addCombatLog(`Hearing the melody, the ${monster.name} falls into a deep sleep!`);
      } else {
        this.game.ui?.addCombatLog(`The sweet melody echoes, yet the ${monster.name} stirs not.`);
      }
    } else {
      this.game.ui?.addCombatLog("Thou cannot use that here!");
      return;
    }

    this.isPlayerTurn = false;
    this.turnLocked = true;
    this.schedule(() => this.executeEnemyTurn(), 900);
  }

  // Command 4: RUN
  executeRun() {
    if (!this.inCombat || !this.isPlayerTurn || this.turnLocked) return;
    if (!this.checkPlayerWakeBeforeAction()) return;

    const player = this.game.player;
    const monster = this.currentMonster;

    this.game.ui?.addCombatLog(`${player.stats.name} started to run away!`);
    this.isPlayerTurn = false;
    this.turnLocked = true;

    if (monster.runBlocked || monster.isBoss) {
      this.game.ui?.addCombatLog("Thou cannot escape from this foe!");
      this.schedule(() => this.executeEnemyTurn(), 800);
      return;
    }

    const escaped = player.stats.agility * Math.random() >= monster.agility * Math.random() * 0.5;
    if (escaped) {
      this.game.sound?.playSFX('stairs');
      this.schedule(() => this.endCombat(false), 600);
    } else {
      this.game.ui?.addCombatLog("But the path was blocked!");
      this.schedule(() => this.executeEnemyTurn(), 800);
    }
  }

  executeEnemyTurn() {
    if (!this.inCombat) return;

    const player = this.game.player;
    const monster = this.currentMonster;

    // Sleep check
    if (this.enemyAsleep > 0) {
      this.enemyAsleep--;
      // Golem sleeps deeply from Fairy Flute; regular sleep may wake early
      if (!monster.weakToFlute && this.enemyAsleep > 0 && Math.random() < 0.33) {
        this.enemyAsleep = 0;
        this.game.ui?.addCombatLog(`The ${monster.name} awakes!`);
      } else {
        this.game.ui?.addCombatLog(`The ${monster.name} is fast asleep!`);
        this.isPlayerTurn = true;
        this.turnLocked = false;
        return;
      }
    }

    // Choose AI move
    const moves = monster.moves || ['attack'];
    let move = moves[Math.floor(Math.random() * moves.length)];
    if ((move === 'hurt' || move === 'hurtmore' || move === 'sleep' || move === 'stopspell') && this.enemyStopspell) {
      move = 'attack';
    }
    if (move === 'stopspell' && this.playerStopspell) move = 'attack';
    if (move === 'sleep' && this.playerAsleep > 0) move = 'attack';

    if (move === 'fire_breath') {
      const raw = 16 + Math.floor(Math.random() * 8);
      const dmg = player.hasMagicResist() ? Math.floor(raw * 0.67) : raw;
      player.stats.hp -= dmg;
      this.game.sound?.playSFX('hurt_spell');
      this.game.renderer?.triggerFlash('#f83800', 260);
      this.game.ui?.addCombatLog(`The ${monster.name} breathes scorching fire!`);
      this.game.ui?.addCombatLog(`Thy Hit Points decreased by ${dmg}!`);
    } else if (move === 'strong_fire_breath') {
      const raw = 65 + Math.floor(Math.random() * 8);
      const dmg = player.hasMagicResist() ? Math.floor(raw * 0.67) : raw;
      player.stats.hp -= dmg;
      this.game.sound?.playSFX('hurt_spell');
      this.game.renderer?.triggerFlash('#f83800', 300);
      this.game.ui?.addCombatLog(`The ${monster.name} unleashes an inferno of flame!`);
      this.game.ui?.addCombatLog(`Thy Hit Points decreased by ${dmg}!`);
    } else if (move === 'hurt') {
      const raw = 5 + Math.floor(Math.random() * 8);
      const dmg = player.hasMagicResist() ? Math.floor(raw * 0.67) : raw;
      player.stats.hp -= dmg;
      this.game.sound?.playSFX('hurt_spell');
      this.game.renderer?.triggerFlash('#f83800', 240);
      this.game.ui?.addCombatLog(`The ${monster.name} chants HURT!`);
      this.game.ui?.addCombatLog(`Thy Hit Points decreased by ${dmg}!`);
    } else if (move === 'hurtmore') {
      const raw = 30 + Math.floor(Math.random() * 14);
      const dmg = player.hasMagicResist() ? Math.floor(raw * 0.67) : raw;
      player.stats.hp -= dmg;
      this.game.sound?.playSFX('hurt_spell');
      this.game.renderer?.triggerFlash('#f83800', 260);
      this.game.ui?.addCombatLog(`The ${monster.name} chants HURTMORE!`);
      this.game.ui?.addCombatLog(`Thy Hit Points decreased by ${dmg}!`);
    } else if (move === 'sleep') {
      this.game.sound?.playSFX('spell_cast');
      this.game.ui?.addCombatLog(`The ${monster.name} chants SLEEP!`);
      if (!player.hasMagicResist() || Math.random() < 0.35) {
        this.playerAsleep = 2;
        this.game.ui?.addCombatLog(`${player.stats.name} falls asleep!`);
      } else {
        this.game.ui?.addCombatLog(`But ${player.stats.name} resists the spell!`);
      }
    } else if (move === 'stopspell') {
      this.game.sound?.playSFX('spell_cast');
      this.game.ui?.addCombatLog(`The ${monster.name} chants STOPSPELL!`);
      if (!player.hasMagicResist() && Math.random() < 0.5) {
        this.playerStopspell = true;
        this.game.ui?.addCombatLog(`${player.stats.name}'s spells are sealed!`);
      } else {
        this.game.ui?.addCombatLog(`But the spell failed!`);
      }
    } else {
      // Physical attack
      const def = player.getDefensePower();
      const diff = monster.attack - Math.floor(def / 2);
      const dmg = diff <= 0
        ? (Math.random() < 0.5 ? 1 : 0)
        : Math.max(1, Math.floor(diff * (0.5 + Math.random() * 0.5)));

      player.stats.hp -= dmg;
      this.game.sound?.playSFX('receive_damage');
      if (dmg > 0) this.game.renderer?.triggerFlash('#f83800', 200);
      this.game.ui?.addCombatLog(`The ${monster.name} attacks!`);
      if (dmg === 0) {
        this.game.ui?.addCombatLog(`A miss! No damage to ${player.stats.name}!`);
      } else {
        this.game.ui?.addCombatLog(`Thy Hit Points decreased by ${dmg}!`);
      }
    }

    this.game.ui?.updateStatusWindow();

    if (player.stats.hp <= 0) {
      player.stats.hp = 0;
      this.game.ui?.updateStatusWindow();
      this.schedule(() => this.handleDefeat(), 800);
      return;
    }

    this.isPlayerTurn = true;
    this.turnLocked = false;
  }

  handleEnemyDefeated() {
    const monster = this.currentMonster;
    const player = this.game.player;

    // 2-Phase Dragonlord Transformation!
    if (monster.type === 'dragonlord_1') {
      this.game.sound?.playSFX('critical_hit');
      this.game.renderer?.triggerFlash('#bc00bc', 550);
      this.currentMonster = createMonsterInstance('dragonlord_2');
      this.enemyAsleep = 0;
      this.enemyStopspell = false;
      this.game.ui?.updateCombatMonster(this.currentMonster);
      this.game.ui?.addCombatLog("The Dragonlord casts off his disguise and reveals his true form!");
      this.isPlayerTurn = true;
      this.turnLocked = false;
      return;
    }

    this.game.sound?.playSFX('victory');
    this.game.ui?.addCombatLog(`Thou hast done well in defeating the ${monster.name}!`);

    if (monster.exp > 0 || monster.gold > 0) {
      this.game.ui?.addCombatLog(`Thy Experience increases by ${monster.exp}.`);
      this.game.ui?.addCombatLog(`Thy Gold increases by ${monster.gold}.`);
      player.stats.gold += monster.gold;
      const levelUps = player.addExp(monster.exp);
      this.game.ui?.updateStatusWindow();

      if (levelUps.length > 0) {
        this.game.sound?.playSFX('level_up');
        for (const lu of levelUps) {
          this.game.ui?.addCombatLog(`Courage and wit have served thee well! Thou hast been promoted to Level ${lu.level}!`);
          if (lu.newSpell) {
            this.game.ui?.addCombatLog(`Thou hast learned the spell of ${lu.newSpell}!`);
          }
        }
      }
    }

    if (this.activeBossId) {
      this.game.defeatedBosses.add(this.activeBossId);
    }

    if (monster.type === 'dragonlord_2') {
      this.game.defeatedBosses.add('dragonlord_final');
      player.inventory.ballOfLight = true;
      this.game.renderer?.triggerFlash('#fcfcfc', 700, true);
      this.game.ui?.addCombatLog("Thou hast recovered the Ball of Light! Peace returns to Alefgard!");
      this.schedule(() => this.endCombat(true, true), 1800);
      return;
    }

    this.schedule(() => this.endCombat(true), 1200);
  }

  handleDefeat() {
    this.game.sound?.playSFX('curse');
    this.game.ui?.addCombatLog("Thou art dead.");
    this.schedule(() => {
      const player = this.game.player;
      player.stats.gold = Math.floor(player.stats.gold / 2);
      player.stats.hp = player.stats.maxHp;
      player.stats.mp = player.stats.maxMp;
      player.isCarryingPrincess = false;
      this.endCombat(false);
      this.game.warpTo('tantegel_throne', 5, 2, 'up');
      this.game.ui?.queueMessages([
        "King Lorik: \"Welcome back, brave Erdrick!\"",
        "\"May the light restore thy life—go forth once more!\""
      ]);
    }, 1400);
  }

  endCombat(won, isDragonlordVictory = false) {
    this.inCombat = false;
    this.currentMonster = null;
    this.activeBossId = null;
    this.isPlayerTurn = true;
    this.turnLocked = false;
    this.game.ui?.hideCombat();
    this.game.updateLocationMusic?.();

    if (isDragonlordVictory) {
      this.game.ui?.queueMessages([
        "The dark clouds over Alefgard scatter before the radiant Ball of Light!",
        "Return to King Lorik at Tantegel Castle to celebrate thy eternal victory!"
      ]);
    }
  }
}
