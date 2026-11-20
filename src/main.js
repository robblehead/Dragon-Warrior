// Dragon Warrior (NES Edition) - Master Game Orchestrator
import { soundEngine } from './audio/synth.js';
import { musicManager } from './audio/music.js';
import { NESRenderer } from './graphics/renderer.js';
import { PlayerCharacter, ARMORS, WEAPONS } from './entities/player.js';
import { MAPS, CHAR_TO_TILE, SOLID_TILES } from './world/maps.js';
import { CombatEngine } from './combat/combatEngine.js';
import { GameUI } from './ui/hud.js';

const SAVE_KEY = 'dragon_warrior_nes_save_v1';

const DIR_DELTAS = {
  up:    { dx: 0, dy: -1 },
  down:  { dx: 0, dy: 1 },
  left:  { dx: -1, dy: 0 },
  right: { dx: 1, dy: 0 },
};

export class DragonWarriorGame {
  constructor(headless = false) {
    this.headless = headless;
    this.sound = soundEngine;
    this.music = musicManager;
    this.renderer = headless ? null : new NESRenderer('nes-canvas');
    this.player = new PlayerCharacter('ERDRICK');
    this.combat = new CombatEngine(this);
    this.ui = headless ? null : new GameUI(this);

    this.currentMapId = 'tantegel_throne';
    this.currentMap = MAPS.tantegel_throne;

    // Persistent world flags
    this.openedChests = new Set();
    this.openedDoors = new Set();
    this.defeatedBosses = new Set();
    this.rainbowBridgeBuilt = false;

    // Movement input held state
    this.heldDirs = new Set();
    this.lastTime = 0;

    if (!headless && typeof window !== 'undefined') {
      window.gameInstance = this;
      this.bindGlobalInput();
      this.ui.showTitleScreen(this.hasSavedGame());
      this.startLoop();
    }
  }

  hasSavedGame() {
    try {
      return Boolean(localStorage.getItem(SAVE_KEY));
    } catch {
      return false;
    }
  }

  saveGame() {
    try {
      const payload = {
        mapId: this.currentMapId,
        x: this.player.x,
        y: this.player.y,
        dir: this.player.dir,
        stats: this.player.stats,
        spells: this.player.spells,
        inventory: this.player.inventory,
        torchSteps: this.player.torchSteps,
        radiantSteps: this.player.radiantSteps,
        repelSteps: this.player.repelSteps,
        isCarryingPrincess: this.player.isCarryingPrincess,
        openedChests: [...this.openedChests],
        openedDoors: [...this.openedDoors],
        defeatedBosses: [...this.defeatedBosses],
        rainbowBridgeBuilt: this.rainbowBridgeBuilt,
      };
      localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
      soundEngine.playSFX('menu_select');
      if (this.ui && this.ui.mode === 'none' && !this.combat.inCombat) {
        this.ui.queueMessages(["Thy deeds have been recorded in the Imperial Scrolls!"]);
      }
    } catch {
      // Ignore storage failures
    }
  }

  loadSavedGame() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return this.startNewGame();
      const data = JSON.parse(raw);

      this.player = new PlayerCharacter(data.stats?.name || 'ERDRICK');
      Object.assign(this.player.stats, data.stats || {});
      this.player.spells = Array.isArray(data.spells) ? [...data.spells] : [];
      Object.assign(this.player.inventory, data.inventory || {});
      this.player.torchSteps = data.torchSteps || 0;
      this.player.radiantSteps = data.radiantSteps || 0;
      this.player.repelSteps = data.repelSteps || 0;
      this.player.isCarryingPrincess = Boolean(data.isCarryingPrincess);

      this.openedChests = new Set(data.openedChests || []);
      this.openedDoors = new Set(data.openedDoors || []);
      this.defeatedBosses = new Set(data.defeatedBosses || []);
      this.rainbowBridgeBuilt = Boolean(data.rainbowBridgeBuilt);

      this.warpTo(data.mapId || 'tantegel_throne', data.x ?? 5, data.y ?? 2, data.dir || 'up', true);
      this.ui?.updateStatusWindow();
      this.ui?.queueMessages([`Welcome back, ${this.player.stats.name}!`]);
    } catch {
      this.startNewGame();
    }
  }

  startNewGame() {
    this.player = new PlayerCharacter('ERDRICK');
    this.openedChests = new Set();
    this.openedDoors = new Set();
    this.defeatedBosses = new Set();
    this.rainbowBridgeBuilt = false;

    this.warpTo('tantegel_throne', 5, 2, 'up', true);
    this.ui?.updateStatusWindow();
    this.ui?.queueMessages([
      "King Lorik: \"Descendant of Erdrick! Listen to my words!\"",
      "\"The Dragonlord hath stolen the Ball of Light and holds Princess Gwaelin in the eastern Swamp Cave.\"",
      "\"Take the treasures in the three chests, use DOOR with a Magic Key, and descend the stairs to begin thy quest!\""
    ]);
  }

  // ==========================================================================
  // TILE QUERIES, COLLISION & WARPS
  // ==========================================================================
  getEffectiveTile(map, x, y) {
    if (!map) return 'VOID';
    if (y < 0 || y >= map.grid.length || x < 0 || x >= map.grid[0].length) {
      return map.isOverworld ? 'WATER' : 'VOID';
    }

    // Dynamic Rainbow Bridge over strait to Charlock
    if (map.id === 'overworld' && this.rainbowBridgeBuilt && x === 22 && y === 30) {
      return 'BRIDGE';
    }

    const ch = map.grid[y][x];
    const baseTile = CHAR_TO_TILE[ch] || 'VOID';

    if (baseTile === 'LOCKED_DOOR' && this.openedDoors.has(`${map.id}:${x}:${y}`)) {
      return 'STONE_FLOOR';
    }
    if (baseTile === 'CHEST') {
      const chest = (map.chests || []).find(c => c.x === x && c.y === y);
      if (chest && this.openedChests.has(chest.id)) {
        return 'STONE_FLOOR';
      }
    }

    return baseTile;
  }

  isTileBlocked(map, x, y) {
    const tile = this.getEffectiveTile(map, x, y);
    if (SOLID_TILES.has(tile)) return true;

    // Check blocking NPCs
    const npc = this.getNPCAt(map, x, y);
    if (npc) return true;

    return false;
  }

  getNPCAt(map, x, y) {
    if (!map || !map.npcs) return null;
    for (const npc of map.npcs) {
      if (npc.x === x && npc.y === y) {
        if (npc.isVisible && !npc.isVisible(this)) continue;
        return npc;
      }
    }
    return null;
  }

  getBossAt(map, x, y) {
    if (!map || !map.bosses) return null;
    for (const boss of map.bosses) {
      if (boss.x === x && boss.y === y && !this.defeatedBosses.has(boss.id)) {
        return boss;
      }
    }
    return null;
  }

  warpTo(mapId, x, y, dir = 'down', silent = false) {
    const target = MAPS[mapId];
    if (!target) return;
    this.currentMapId = mapId;
    this.currentMap = target;
    this.player.setGridPosition(x, y, dir);
    if (!silent) {
      this.sound?.playSFX('stairs');
    }
    this.updateLocationMusic();
    this.ui?.updateStatusWindow();
  }

  updateLocationMusic() {
    if (this.combat.inCombat || this.headless) return;
    if (this.player.inventory.ballOfLight && this.currentMapId === 'tantegel_throne') {
      this.music.playTrack('victory');
      return;
    }
    if (this.currentMap && this.currentMap.music) {
      this.music.playTrack(this.currentMap.music);
    }
  }

  // ==========================================================================
  // MOVEMENT & STEP PROCESSING
  // ==========================================================================
  tryMove(dir) {
    if (this.player.isMoving) return false;
    if (this.combat.inCombat) return false;
    if (this.ui && (this.ui.mode !== 'none' || this.ui.isMessageActive())) return false;

    const delta = DIR_DELTAS[dir];
    if (!delta) return false;

    this.player.dir = dir;
    const nx = this.player.x + delta.dx;
    const ny = this.player.y + delta.dy;

    // Check if stepping into a fixed boss tile (triggers boss battle immediately)
    const boss = this.getBossAt(this.currentMap, nx, ny);
    if (boss) {
      this.triggerBossEncounter(boss);
      return false;
    }

    if (this.isTileBlocked(this.currentMap, nx, ny)) {
      soundEngine.playSFX('bump');
      return false;
    }

    this.player.startStep(nx, ny, dir);
    return true;
  }

  onStepCompleted() {
    const map = this.currentMap;
    const x = this.player.x;
    const y = this.player.y;
    const tile = this.getEffectiveTile(map, x, y);

    this.player.onStepTaken(map.isDark);

    // 1. Check warps (Castle/Town/Cave/Shrine entrances, Stairs, Town borders)
    const warp = (map.warps || []).find(w => w.x === x && w.y === y);
    if (warp) {
      this.warpTo(warp.targetMap, warp.targetX, warp.targetY, warp.dir || this.player.dir);
      return;
    }

    // 2. Check fixed boss tile if stepped onto
    const boss = this.getBossAt(map, x, y);
    if (boss) {
      this.triggerBossEncounter(boss);
      return;
    }

    // 3. Check hazard tiles (Swamp / Barrier)
    if (!this.player.hasTileImmunity() && !this.player.inventory.ballOfLight) {
      if (tile === 'SWAMP') {
        this.player.stats.hp -= 2;
        soundEngine.playSFX('swamp_step');
        this.renderer?.triggerFlash('#f83800', 180);
        this.ui?.updateStatusWindow();
        if (this.player.stats.hp <= 0) {
          this.player.stats.hp = 0;
          this.ui?.updateStatusWindow();
          this.combat.handleDefeat();
          return;
        }
      } else if (tile === 'BARRIER_FLOOR') {
        this.player.stats.hp -= 15;
        soundEngine.playSFX('swamp_step');
        this.renderer?.triggerFlash('#f83800', 220);
        this.ui?.updateStatusWindow();
        if (this.player.stats.hp <= 0) {
          this.player.stats.hp = 0;
          this.ui?.updateStatusWindow();
          this.combat.handleDefeat();
          return;
        }
      }
    }

    this.ui?.updateStatusWindow();

    // 4. Roll random encounter
    const monsterType = this.combat.rollRandomEncounter(map, tile, x, y);
    if (monsterType) {
      this.combat.startEncounter(monsterType);
    }
  }

  triggerBossEncounter(boss) {
    if (this.ui) {
      this.ui.queueMessages([boss.preMessage], () => {
        this.combat.startEncounter(boss.monsterType, boss.id);
      });
    } else {
      this.combat.startEncounter(boss.monsterType, boss.id);
    }
  }

  // ==========================================================================
  // CONTEXTUAL SHORTCUT & 8 NES FIELD COMMANDS
  // ==========================================================================
  getContextualCommandId() {
    const { dx, dy } = DIR_DELTAS[this.player.dir];
    const tx = this.player.x + dx;
    const ty = this.player.y + dy;
    const map = this.currentMap;
    const frontTile = this.getEffectiveTile(map, tx, ty);
    const curTile = this.getEffectiveTile(map, this.player.x, this.player.y);

    if (frontTile === 'LOCKED_DOOR') return 'door';
    if (curTile === 'CHEST' || frontTile === 'CHEST') return 'take';
    if (this.getNPCAt(map, tx, ty) || (frontTile === 'COUNTER' && this.getNPCAt(map, tx + dx, ty + dy))) {
      return 'talk';
    }
    if ((map.warps || []).some(w => w.x === this.player.x && w.y === this.player.y)) return 'stairs';
    return 'talk';
  }

  executeFieldCommand(cmdId) {
    switch (cmdId) {
      case 'talk':   return this.cmdTalk();
      case 'spell':  return this.cmdSpell();
      case 'status': return this.ui.openStatusDetail();
      case 'item':   return this.cmdItem();
      case 'stairs': return this.cmdStairs();
      case 'door':   return this.cmdDoor();
      case 'search': return this.cmdSearch();
      case 'take':   return this.cmdTake();
    }
  }

  cmdTalk() {
    const { dx, dy } = DIR_DELTAS[this.player.dir];
    const tx = this.player.x + dx;
    const ty = this.player.y + dy;
    const map = this.currentMap;

    let npc = this.getNPCAt(map, tx, ty);
    if (!npc && this.getEffectiveTile(map, tx, ty) === 'COUNTER') {
      npc = this.getNPCAt(map, tx + dx, ty + dy);
    }

    if (!npc) {
      this.ui.queueMessages(["There is no one there."]);
      return;
    }

    // Dragonlord iconic offer
    if (npc.isDragonlord) {
      this.music.playTrack('dragonlord');
      this.ui.queueMessages([
        "Dragonlord: \"Welcome, Erdrick's descendant. I have been waiting for thee.\"",
        "\"I offer thee a deal. Side with me, and I will give thee half of the world!\"",
        "\"Dost thou accept my offer?\""
      ], () => {
        this.ui.openChoiceMenu(
          "ACCEPT OFFER?",
          "YES",
          "NO",
          () => {
            this.sound.playSFX('curse');
            this.renderer?.triggerFlash('#f83800', 400);
            this.ui.queueMessages([
              "Dragonlord: \"Foolish mortal! Those who kneel before darkness surrender their soul!\"",
              "A crushing blackness engulfs Erdrick..."
            ], () => {
              this.player.stats.hp = this.player.stats.maxHp;
              this.player.stats.mp = this.player.stats.maxMp;
              this.warpTo('tantegel_throne', 5, 2, 'up');
              this.ui.queueMessages([
                "King Lorik: \"What a dreadful nightmare! Take heart, Erdrick, and never yield to darkness!\""
              ]);
            });
          },
          () => {
            this.ui.queueMessages([
              "Dragonlord: \"So be it! Then taste the wrath of the Dragonlord!\""
            ], () => {
              this.combat.startEncounter('dragonlord_1', 'dragonlord_final');
            });
          }
        );
      });
      return;
    }

    // Shopkeeper
    if (npc.shop) {
      this.ui.queueMessages([`${npc.name}: "Welcome! What wouldst thou like?"`], () => {
        this.ui.openShopMenu(npc.shop);
      });
      return;
    }

    // Innkeeper
    if (npc.innPrice) {
      this.ui.queueMessages([
        `${npc.name}: "Welcome to the Travelers' Inn! Room and board is ${npc.innPrice} Gold."`,
        `"Dost thou wish to rest for the night?"`
      ], () => {
        this.ui.openChoiceMenu(
          `STAY (${npc.innPrice}G)?`,
          "YES",
          "NO",
          () => {
            if (this.player.stats.gold < npc.innPrice) {
              soundEngine.playSFX('bump');
              this.ui.queueMessages(["\"Thou dost not have enough Gold!\""]);
              return;
            }
            this.player.stats.gold -= npc.innPrice;
            this.player.stats.hp = this.player.stats.maxHp;
            this.player.stats.mp = this.player.stats.maxMp;
            this.ui.updateStatusWindow();
            soundEngine.playSFX('inn_sleep');
            this.renderer?.triggerFlash('#000000', 450);
            this.ui.queueMessages(["Good morning! Thou hast had a restful night. Thy HP and MP are restored!"]);
          },
          () => {
            this.ui.queueMessages(["\"Please come again!\""]);
          }
        );
      });
      return;
    }

    // Standard NPC dialogue
    const lines = typeof npc.dialogue === 'function' ? npc.dialogue(this) : (npc.dialogue || []);
    this.ui.queueMessages(lines, () => {
      npc.onTalkEnd?.(this);
      this.ui.updateStatusWindow();
    });
  }

  cmdSpell() {
    const p = this.player;
    const fieldSpells = ['HEAL', 'RADIANT', 'OUTSIDE', 'RETURN', 'REPEL', 'HEALMORE'];
    const learned = p.spells.filter(s => fieldSpells.includes(s));

    const items = learned.map(spell => {
      const costs = { HEAL: 4, RADIANT: 3, OUTSIDE: 6, RETURN: 8, REPEL: 2, HEALMORE: 10 };
      const cost = costs[spell] || 0;
      return {
        label: spell,
        rightText: `${cost}`,
        disabled: p.stats.mp < cost,
        onSelect: () => {
          this.ui.closeMenusToField();
          this.castFieldSpell(spell, cost);
        },
      };
    });

    this.ui.openSubMenu('SPELL', items, 'command');
  }

  castFieldSpell(spell, cost) {
    const p = this.player;
    if (p.stats.mp < cost) return;
    p.stats.mp -= cost;
    soundEngine.playSFX('spell_cast');
    this.renderer?.triggerFlash('#fcfcfc', 240);
    this.ui?.updateStatusWindow();

    if (spell === 'HEAL') {
      const heal = 15 + Math.floor(Math.random() * 8);
      p.stats.hp = Math.min(p.stats.maxHp, p.stats.hp + heal);
      soundEngine.playSFX('heal');
      this.ui?.updateStatusWindow();
      this.ui?.queueMessages([`${p.stats.name} chants HEAL! Recovered ${heal} HP!`]);
    } else if (spell === 'HEALMORE') {
      const heal = 85 + Math.floor(Math.random() * 16);
      p.stats.hp = Math.min(p.stats.maxHp, p.stats.hp + heal);
      soundEngine.playSFX('heal');
      this.ui?.updateStatusWindow();
      this.ui?.queueMessages([`${p.stats.name} chants HEALMORE! Recovered ${heal} HP!`]);
    } else if (spell === 'RADIANT') {
      if (!this.currentMap.isDark) {
        this.ui?.queueMessages(["A blinding glow illuminates the sky, yet fades away."]);
      } else {
        p.radiantSteps = 180;
        this.ui?.queueMessages(["A brilliant light surrounds Erdrick and drives back the cavern gloom!"]);
      }
    } else if (spell === 'OUTSIDE') {
      if (this.currentMap.allowOutside && this.currentMap.warps && this.currentMap.warps.length > 0) {
        const w = this.currentMap.warps[0];
        this.warpTo(w.targetMap, w.targetX, w.targetY, 'down');
      } else {
        this.ui?.queueMessages(["Thou cannot cast OUTSIDE here!"]);
      }
    } else if (spell === 'RETURN') {
      if (this.currentMap.isOverworld) {
        this.warpTo('overworld', 28, 28, 'down');
        this.ui?.queueMessages(["Erdrick is borne upon mystic winds back to Tantegel Castle!"]);
      } else {
        this.ui?.queueMessages(["RETURN may only be cast outdoors!"]);
      }
    } else if (spell === 'REPEL') {
      p.repelSteps = 128;
      this.ui?.queueMessages(["An aura of protection repels weak monsters from thy path!"]);
    }
  }

  cmdItem() {
    const p = this.player;
    const inv = p.inventory;
    const items = [];

    if (inv.herbs > 0) {
      items.push({
        label: 'HERB',
        rightText: `x${inv.herbs}`,
        onSelect: () => {
          this.ui.closeMenusToField();
          inv.herbs--;
          const heal = 23 + Math.floor(Math.random() * 8);
          p.stats.hp = Math.min(p.stats.maxHp, p.stats.hp + heal);
          soundEngine.playSFX('heal');
          this.ui.updateStatusWindow();
          this.ui.queueMessages([`${p.stats.name} used a Medicinal Herb! Restored ${heal} HP!`]);
        },
      });
    }
    if (inv.torches > 0) {
      items.push({
        label: 'TORCH',
        rightText: `x${inv.torches}`,
        onSelect: () => {
          this.ui.closeMenusToField();
          if (!this.currentMap.isDark) {
            this.ui.queueMessages(["A Torch can only be lit inside dark dungeons!"]);
            return;
          }
          inv.torches--;
          p.torchSteps = 100;
          soundEngine.playSFX('spell_cast');
          this.ui.queueMessages(["Erdrick lights a blazing Torch!"]);
        },
      });
    }
    if (inv.fairyWater > 0) {
      items.push({
        label: 'FAIRY WATER',
        rightText: `x${inv.fairyWater}`,
        onSelect: () => {
          this.ui.closeMenusToField();
          inv.fairyWater--;
          p.repelSteps = 128;
          soundEngine.playSFX('spell_cast');
          this.ui.queueMessages(["Erdrick sprinkled Fairy Water! Weak foes stay afar."]);
        },
      });
    }
    if (inv.wings > 0) {
      items.push({
        label: 'WYVERN WING',
        rightText: `x${inv.wings}`,
        onSelect: () => {
          this.ui.closeMenusToField();
          if (!this.currentMap.isOverworld) {
            this.ui.queueMessages(["A Wyvern Wing cannot be used indoors!"]);
            return;
          }
          inv.wings--;
          this.warpTo('overworld', 28, 28, 'down');
          this.ui.queueMessages(["The Wyvern Wing lifts Erdrick swiftly back to Tantegel Castle!"]);
        },
      });
    }
    if (inv.fairyFlute) {
      items.push({
        label: 'FAIRY FLUTE',
        onSelect: () => {
          this.ui.closeMenusToField();
          soundEngine.playSFX('flute');
          this.ui.queueMessages(["Erdrick plays a gentle melody upon the Fairy Flute."]);
        },
      });
    }
    if (inv.gwaelinLove) {
      items.push({
        label: "GWAELIN'S LOVE",
        onSelect: () => {
          this.ui.closeMenusToField();
          const nextReq = p.stats.level >= 30 ? 0 : Math.max(0, p.stats.nextExp - p.stats.exp);
          const lines = [`"Thou needst ${nextReq} more Experience Points to attain the next Level."`];
          if (this.currentMap.isOverworld) {
            const dx = 28 - p.x;
            const dy = 28 - p.y;
            const ns = dy === 0 ? '' : (dy < 0 ? `${Math.abs(dy)} North` : `${dy} South`);
            const ew = dx === 0 ? '' : (dx < 0 ? `${Math.abs(dx)} West` : `${dx} East`);
            const distDesc = [ns, ew].filter(Boolean).join(', ') || '0 steps';
            lines.push(`"From where thou standest, Tantegel Castle lies ${distDesc}."`);
          }
          this.ui.queueMessages(lines);
        },
      });
    }
    if (inv.rainbowDrop) {
      items.push({
        label: 'RAINBOW DROP',
        onSelect: () => {
          this.ui.closeMenusToField();
          if (this.currentMapId === 'overworld' && !this.rainbowBridgeBuilt && Math.hypot(p.x - 23, p.y - 30) <= 1.5) {
            this.rainbowBridgeBuilt = true;
            soundEngine.playSFX('level_up');
            this.renderer?.triggerFlash('#fcfcfc', 750, true);
            this.ui.queueMessages([
              "Erdrick holds the Rainbow Drop high!",
              "A dazzling Rainbow Bridge spans the dark sea to Charlock Island!"
            ]);
          } else {
            this.ui.queueMessages(["Erdrick held up the Rainbow Drop, yet nothing happened here."]);
          }
        },
      });
    }

    this.ui.openSubMenu('ITEM', items, 'command');
  }

  cmdStairs() {
    this.ui?.closeMenusToField();
    const warp = (this.currentMap.warps || []).find(w => w.x === this.player.x && w.y === this.player.y);
    if (warp) {
      this.warpTo(warp.targetMap, warp.targetX, warp.targetY, warp.dir || this.player.dir);
      return true;
    } else {
      this.ui?.queueMessages(["There are no stairs here."]);
      return false;
    }
  }

  cmdDoor() {
    this.ui?.closeMenusToField();
    const { dx, dy } = DIR_DELTAS[this.player.dir];
    const tx = this.player.x + dx;
    const ty = this.player.y + dy;
    const tile = this.getEffectiveTile(this.currentMap, tx, ty);

    if (tile !== 'LOCKED_DOOR') {
      this.ui?.queueMessages(["There is no door here."]);
      return false;
    }

    if (this.player.inventory.magicKeys <= 0) {
      this.sound?.playSFX('bump');
      this.ui?.queueMessages(["Thou hast no Magic Key!"]);
      return false;
    }

    this.player.inventory.magicKeys--;
    this.openedDoors.add(`${this.currentMap.id}:${tx}:${ty}`);
    this.sound?.playSFX('door_open');
    this.ui?.updateStatusWindow();
    this.ui?.queueMessages(["Erdrick unlocked the door!"]);
    return true;
  }

  cmdSearch() {
    this.ui?.closeMenusToField();
    const map = this.currentMap;
    const x = this.player.x;
    const y = this.player.y;

    const spot = (map.searchSpots || []).find(s => s.x === x && s.y === y);
    if (spot) {
      if (spot.requiresBoss && !this.defeatedBosses.has(spot.requiresBoss)) {
        this.ui?.queueMessages(["A menacing presence prevents searching here!"]);
        return false;
      }
      if (!this.player.inventory[spot.flag]) {
        this.player.inventory[spot.flag] = true;
        if (spot.flag === 'erdrickArmor') {
          this.player.stats.armor = "Erdrick's Armor";
        }
        this.sound?.playSFX('chest_open');
        this.ui?.updateStatusWindow();
        this.ui?.queueMessages([spot.foundMsg]);
        return true;
      }
    }

    const chest = (map.chests || []).find(c => c.x === x && c.y === y && !this.openedChests.has(c.id));
    if (chest) {
      this.ui?.queueMessages(["There is a treasure chest at thy feet! Use TAKE to open it."]);
      return false;
    }

    this.ui?.queueMessages(["Erdrick searches the ground all about... But nothing is found."]);
    return false;
  }

  cmdTake() {
    this.ui?.closeMenusToField();
    const map = this.currentMap;
    const { dx, dy } = DIR_DELTAS[this.player.dir];
    const candidates = [
      { x: this.player.x, y: this.player.y },
      { x: this.player.x + dx, y: this.player.y + dy },
    ];

    for (const pos of candidates) {
      const chest = (map.chests || []).find(c => c.x === pos.x && c.y === pos.y && !this.openedChests.has(c.id));
      if (chest) {
        this.openChest(chest);
        return true;
      }
    }

    this.ui?.queueMessages(["There is nothing to take here."]);
    return false;
  }

  openChest(chest) {
    this.openedChests.add(chest.id);
    soundEngine.playSFX('chest_open');

    const p = this.player;
    if (chest.item === 'gold') p.stats.gold += chest.amount || 0;
    else if (chest.item === 'herb') p.inventory.herbs = Math.min(6, p.inventory.herbs + (chest.amount || 1));
    else if (chest.item === 'torch') p.inventory.torches += chest.amount || 1;
    else if (chest.item === 'magic_key') p.inventory.magicKeys = Math.min(6, p.inventory.magicKeys + (chest.amount || 1));
    else if (chest.item === 'sunstone') p.inventory.sunstone = true;
    else if (chest.item === 'fighterRing') p.inventory.fighterRing = true;
    else if (chest.item === 'silverHarp') p.inventory.silverHarp = true;
    else if (chest.item === 'erdrickSword') p.stats.weapon = "Erdrick's Sword";

    this.ui?.updateStatusWindow();
    this.ui?.queueMessages([`Erdrick opens the chest and finds ${chest.label}!`]);
  }

  // ==========================================================================
  // INPUT & GAME LOOP
  // ==========================================================================
  bindGlobalInput() {
    window.addEventListener('keydown', (e) => {
      const navKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'Enter', 'Escape', 'Backspace'];
      if (navKeys.includes(e.code)) {
        e.preventDefault();
      }

      soundEngine.init();
      soundEngine.resume();

      if (e.code === 'KeyM') {
        const muted = soundEngine.toggleMute();
        const btn = document.getElementById('btn-audio-toggle');
        if (btn) btn.textContent = muted ? 'AUDIO: OFF' : 'AUDIO: ON';
        return;
      }

      if (this.ui && this.ui.mode === 'none' && !this.ui.isMessageActive() && !this.combat.inCombat) {
        let dir = null;
        if (e.code === 'KeyW' || e.code === 'ArrowUp') dir = 'up';
        else if (e.code === 'KeyS' || e.code === 'ArrowDown') dir = 'down';
        else if (e.code === 'KeyA' || e.code === 'ArrowLeft') dir = 'left';
        else if (e.code === 'KeyD' || e.code === 'ArrowRight') dir = 'right';

        if (dir) {
          this.heldDirs.add(dir);
          // Respond immediately to single-tile key taps even if released before next frame
          if (!this.player.isMoving) {
            this.tryMove(dir);
          } else {
            this.queuedTapDir = dir;
          }
        }
      }

      this.ui?.handleKeyDown(e.code);
    });

    window.addEventListener('keyup', (e) => {
      if (e.code === 'KeyW' || e.code === 'ArrowUp') this.heldDirs.delete('up');
      if (e.code === 'KeyS' || e.code === 'ArrowDown') this.heldDirs.delete('down');
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') this.heldDirs.delete('left');
      if (e.code === 'KeyD' || e.code === 'ArrowRight') this.heldDirs.delete('right');
    });

    window.addEventListener('blur', () => {
      this.heldDirs.clear();
    });
  }

  startLoop() {
    this.lastTime = performance.now();
    const tick = (now) => {
      requestAnimationFrame(tick);
      const dt = Math.min(0.05, Math.max(0.001, (now - this.lastTime) / 1000));
      this.lastTime = now;

      this.update(dt);
      this.render();
    };
    requestAnimationFrame(tick);
  }

  update(dt) {
    this.renderer?.update(dt);

    if (this.combat.inCombat) {
      // Keep monster canvas blinking/updated on hit
      if (this.ui?.currentCombatMonster) {
        this.renderer?.renderCombatMonster(this.ui.currentCombatMonster.type);
      }
      return;
    }

    if (this.ui && (this.ui.mode !== 'none' || this.ui.isMessageActive())) {
      this.heldDirs.clear();
      this.queuedTapDir = null;
      return;
    }

    if (this.player.isMoving) {
      const done = this.player.updateStep(dt);
      if (done) {
        this.onStepCompleted();
      }
    } else if (this.queuedTapDir) {
      const d = this.queuedTapDir;
      this.queuedTapDir = null;
      this.tryMove(d);
    } else if (this.heldDirs.size > 0) {
      // Move in most recently held direction
      const dirs = [...this.heldDirs];
      this.tryMove(dirs[dirs.length - 1]);
    }
  }

  render() {
    if (!this.renderer) return;
    if (this.ui?.mode === 'title') return;
    this.renderer.renderWorld(this);
  }
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', () => new DragonWarriorGame(false));
  } else {
    new DragonWarriorGame(false);
  }
}
