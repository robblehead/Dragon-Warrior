// Authentic NES Dragon Warrior World Maps, Towns, Castles, Shrines & Dungeons
// Legend:
// . = GRASS, f = FOREST, h = HILL, M = MOUNTAIN, ~ = WATER, s = SWAMP, d = DESERT, = = BRIDGE
// C = CASTLE_TILE, T = TOWN_TILE, v = CAVE_TILE, H = SHRINE_TILE
// # = BRICK_WALL, _ = STONE_FLOOR, r = ROYAL_CARPET, B = BARRIER_FLOOR
// D = LOCKED_DOOR, c = CHEST, u = STAIRS_UP, n = STAIRS_DOWN, k = COUNTER, t = THRONE, W = WATER_FOUNTAIN, ' ' = VOID

export const CHAR_TO_TILE = {
  '.': 'GRASS',
  'f': 'FOREST',
  'h': 'HILL',
  'M': 'MOUNTAIN',
  '~': 'WATER',
  's': 'SWAMP',
  'd': 'DESERT',
  '=': 'BRIDGE',
  'C': 'CASTLE_TILE',
  'T': 'TOWN_TILE',
  'v': 'CAVE_TILE',
  'H': 'SHRINE_TILE',
  '#': 'BRICK_WALL',
  '_': 'STONE_FLOOR',
  'r': 'ROYAL_CARPET',
  'B': 'BARRIER_FLOOR',
  'D': 'LOCKED_DOOR',
  'c': 'CHEST',
  'u': 'STAIRS_UP',
  'n': 'STAIRS_DOWN',
  'k': 'COUNTER',
  't': 'THRONE',
  'W': 'WATER_FOUNTAIN',
  ' ': 'VOID',
};

export const SOLID_TILES = new Set([
  'MOUNTAIN', 'WATER', 'BRICK_WALL', 'LOCKED_DOOR', 'COUNTER', 'WATER_FOUNTAIN', 'VOID'
]);

export function buildOverworldGrid() {
  const size = 64;
  const grid = Array.from({ length: size }, () => Array(size).fill('~'));

  const fillRect = (x0, y0, x1, y1, ch) => {
    for (let y = Math.max(2, y0); y <= Math.min(size - 3, y1); y++) {
      for (let x = Math.max(2, x0); x <= Math.min(size - 3, x1); x++) {
        grid[y][x] = ch;
      }
    }
  };

  // 1. Main Northern & Central Continent (Tantegel, Brecconary, Garinham)
  fillRect(6, 5, 36, 35, '.');
  // Trim ocean bay in center-west for Charlock Island
  fillRect(14, 24, 24, 37, '~');
  // Western Cape extending toward Charlock
  fillRect(23, 28, 26, 33, '.');
  // Charlock Island
  fillRect(16, 27, 21, 33, 'h');
  fillRect(17, 28, 20, 32, 'd');
  grid[30][21] = '.'; // Charlock landing shore facing Rainbow Bridge at (22, 30)
  grid[30][19] = 'C'; // Charlock Castle

  // Northwest mountains & forests around Garinham
  fillRect(5, 5, 16, 15, 'h');
  fillRect(7, 7, 13, 13, '.');
  fillRect(14, 6, 21, 14, 'f');
  fillRect(18, 12, 23, 18, 'M');
  grid[18][21] = 'h';
  grid[18][22] = '='; // Northern bridge toward Tantegel central plains
  grid[10][10] = 'T'; // Garinham

  // Mountain Cave peninsula in NW-center
  fillRect(11, 18, 17, 23, 'h');
  fillRect(12, 19, 16, 22, '.');
  grid[20][14] = 'v'; // Mountain Cave

  // Central Tantegel & Brecconary plains
  fillRect(25, 22, 35, 33, '.');
  fillRect(26, 23, 27, 25, 'f');
  fillRect(31, 22, 34, 25, 'f');
  fillRect(29, 31, 34, 34, 'h');
  grid[28][28] = 'C'; // Tantegel Castle
  grid[27][34] = 'T'; // Brecconary

  // River dividing central plains from Eastern Kol/Swamp continent
  fillRect(36, 5, 39, 44, '~');
  grid[24][36] = '='; grid[24][37] = '='; grid[24][38] = '='; grid[24][39] = '=';

  // 2. Eastern Continent: Kol (North), Swamp Cave & Rimuldar (Mid-East), Rainbow Shrine (SE)
  fillRect(40, 4, 58, 59, '.');
  // Kol northern forest & hills
  fillRect(42, 6, 56, 16, 'f');
  fillRect(45, 9, 52, 14, '.');
  grid[12][48] = 'T'; // Town of Kol

  // Rain Shrine on northeast headland
  fillRect(51, 4, 57, 8, 'h');
  grid[6][54] = 'H'; // Shrine of Rain

  // Mountain ridge dividing North Kol from Rimuldar/Swamp (forces passage via Swamp Cave!)
  fillRect(40, 31, 58, 33, 'M');
  // Poison Swamp above & below Swamp Cave
  fillRect(44, 25, 52, 30, 's');
  grid[28][48] = 'v'; // Swamp Cave North Entrance
  fillRect(45, 34, 53, 39, 's');
  grid[36][48] = 'v'; // Swamp Cave South Exit

  // Rimuldar Island / Peninsula surrounded by water moat with bridges
  fillRect(49, 41, 56, 48, '~');
  fillRect(50, 42, 55, 47, '.');
  grid[44][49] = '=';
  grid[44][52] = 'T'; // Town of Rimuldar

  // Southern Poison Marsh & Sacred Shrine of the Rainbow
  fillRect(42, 50, 56, 58, 's');
  fillRect(52, 54, 57, 58, '.');
  grid[56][54] = 'H'; // Shrine of the Rainbow
  // Note: (44, 54) is toxic swamp holding Erdrick's Token via SEARCH!

  // 3. Southern Continent: Cantlin & Damdara Desert
  fillRect(10, 42, 41, 59, '.');
  // Ocean channel separating Cantlin from Tantegel, bridged at x=34
  fillRect(24, 38, 39, 46, '~');
  fillRect(32, 36, 36, 51, '.');
  grid[42][34] = '='; // Northern bridge toward Cantlin
  fillRect(29, 48, 39, 52, 'M');
  grid[49][34] = '.';
  grid[50][34] = '='; // Golem Guard Pass
  grid[51][34] = '.';
  fillRect(30, 52, 38, 58, '.');
  grid[55][34] = 'T'; // Fortress Town of Cantlin

  // Southwest Damdara Desert
  fillRect(10, 44, 23, 56, 'd');
  fillRect(13, 46, 20, 51, 'd');
  grid[48][16] = 'T'; // Damdara Ruins

  // Ensure shore border around continent edges looks crisp
  return grid.map(row => row.join(''));
}

export const MAPS = {
  tantegel_throne: {
    id: 'tantegel_throne',
    name: 'Tantegel Castle 2F',
    music: 'castle',
    isDark: false,
    allowOutside: false,
    allowReturn: false,
    grid: [
      '###########',
      '#___rtr_cc#',
      '#___rrr___#',
      '#___rrr__c#',
      '#____r____#',
      '#____r____#',
      '#____r____#',
      '#####D#####',
      '#_________#',
      '#____n____#',
      '###########',
    ],
    warps: [
      { x: 5, y: 9, targetMap: 'tantegel_courtyard', targetX: 15, targetY: 4, dir: 'down' },
    ],
    chests: [
      { id: 'throne_gold', x: 8, y: 1, item: 'gold', amount: 120, label: '120 Gold' },
      { id: 'throne_torch', x: 9, y: 1, item: 'torch', amount: 1, label: 'a Torch' },
      { id: 'throne_key', x: 9, y: 3, item: 'magic_key', amount: 1, label: 'a Magic Key' },
    ],
    npcs: [
      {
        id: 'king_lorik',
        name: 'King Lorik',
        sprite: 'king',
        x: 5,
        y: 1,
        dialogue: (game) => {
          if (game.player.inventory.ballOfLight) {
            return [
              "O brave descendant of Erdrick! Thou hast vanquished the Dragonlord and recovered the Ball of Light!",
              "Peace and light return to Alefgard forever! May thy legend shine across eternity!"
            ];
          }
          if (game.player.isCarryingPrincess) {
            return [
              "O, brave Erdrick! Thou hast rescued my beloved daughter, Princess Gwaelin!",
              "Accept Gwaelin's Love—it will guide thee in darkness and show thy strength to the next level.",
              "Now seek the Sunstone, the Staff of Rain, and Erdrick's Token to cross to Charlock and defeat the Dragonlord!"
            ];
          }
          if (game.player.inventory.gwaelinLove) {
            return [
              "Alefgard's hopes rest upon thy blade, Erdrick.",
              "Remember: seek the Sunstone beneath this castle, the Staff of Rain to the northeast, and Erdrick's Token in the southern marsh."
            ];
          }
          return [
            "Descendant of Erdrick! Listen to my words!",
            "The Dragonlord hath stolen the Ball of Light and holds Princess Gwaelin captive in the Swamp Cave to the east.",
            "Take the treasures from the three chests here, unlock the door with the DOOR command, and descend the stairs!",
            "Whenever thy HP drops or thou fallest in battle, return to me."
          ];
        },
        onTalkEnd: (game) => {
          if (game.player.isCarryingPrincess) {
            game.player.isCarryingPrincess = false;
            game.player.inventory.gwaelinLove = true;
            game.player.stats.gold += 300;
            const lvUps = game.player.addExp(200);
            game.sound.playSFX('level_up');
            game.ui.queueMessages([
              "King Lorik rewards thee with 300 Gold and 200 EXP!",
              "Princess Gwaelin grants thee Gwaelin's Love!",
              ...(lvUps.length ? lvUps.map(l => `Thy level hath risen to ${l.level}!`) : [])
            ]);
          } else {
            // King Lorik restores HP for free when you talk to him
            if (game.player.stats.hp < game.player.stats.maxHp) {
              game.player.stats.hp = game.player.stats.maxHp;
              game.sound.playSFX('heal');
            }
          }
        }
      },
      {
        id: 'throne_guard_l',
        name: 'Royal Guard',
        sprite: 'guard',
        x: 3,
        y: 3,
        dialogue: () => [
          "To open locked doors, face the door and choose DOOR from the COMMAND menu.",
          "To open treasure chests, stand atop or before them and choose TAKE."
        ]
      },
      {
        id: 'throne_guard_r',
        name: 'Royal Guard',
        sprite: 'guard',
        x: 7,
        y: 3,
        dialogue: () => [
          "If thou dost run low on Magic Keys, merchants in Rimuldar sell them."
        ]
      }
    ],
  },

  tantegel_courtyard: {
    id: 'tantegel_courtyard',
    name: 'Tantegel Castle 1F',
    music: 'castle',
    isDark: false,
    allowOutside: false,
    allowReturn: false,
    grid: [
      '####################',
      '#______#______#__n_#',
      '#_WWWW_#_u____##D###',
      '#_WWWW_#______#____#',
      '#______D______#____#',
      '#_____________#____#',
      '#____rrrrrr________#',
      '#____rrrrrr________#',
      '#_####rrrr####_____#',
      '#_#c_#rrrr#_c#_____#',
      '#_##D#rrrr#D##_____#',
      '#____rrrrrr________#',
      '#____rrrrrr________#',
      '#__________________#',
      '#_______rr_________#',
      '#_______rr_________#',
      '#_______rr_________#',
      '########..##########',
    ],
    warps: [
      { x: 9, y: 2, targetMap: 'tantegel_throne', targetX: 5, targetY: 8, dir: 'up' },
      { x: 17, y: 1, targetMap: 'tantegel_vault', targetX: 4, targetY: 1, dir: 'down' },
      { x: 8, y: 17, targetMap: 'overworld', targetX: 28, targetY: 28, dir: 'down' },
      { x: 9, y: 17, targetMap: 'overworld', targetX: 28, targetY: 28, dir: 'down' },
    ],
    chests: [
      { id: 'castle_herb_1', x: 3, y: 9, item: 'herb', amount: 1, label: 'a Medicinal Herb' },
      { id: 'castle_gold_1', x: 12, y: 9, item: 'gold', amount: 50, label: '50 Gold' },
    ],
    npcs: [
      {
        id: 'tantegel_mp_sage',
        name: 'Court Wizard',
        sprite: 'sage',
        x: 16,
        y: 5,
        dialogue: (game) => {
          game.player.stats.mp = game.player.stats.maxMp;
          game.sound.playSFX('heal');
          return [
            "May the ancient light replenish thy spirit!",
            "Thy Magic Power hath been completely restored!"
          ];
        }
      },
      {
        id: 'tantegel_courtyard_guard',
        name: 'Castle Sentinel',
        sprite: 'guard',
        x: 7,
        y: 13,
        dialogue: () => [
          "Brecconary lies just east across the bridge. Spend thy starting gold on a weapon and armor there!",
          "Rumour speaks of hidden stairs behind the northern outer wall of Tantegel."
        ]
      }
    ],
  },

  tantegel_vault: {
    id: 'tantegel_vault',
    name: 'Tantegel Treasury Basement',
    music: 'cave',
    isDark: false,
    allowOutside: false,
    allowReturn: false,
    grid: [
      '#########',
      '#___u___#',
      '#_______#',
      '#___c___#',
      '#_______#',
      '#########',
    ],
    warps: [
      { x: 4, y: 1, targetMap: 'tantegel_courtyard', targetX: 16, targetY: 1, dir: 'down' },
    ],
    chests: [
      { id: 'vault_sunstone', x: 4, y: 3, item: 'sunstone', amount: 1, label: 'the Sunstone' },
    ],
    npcs: [
      {
        id: 'vault_keeper',
        name: 'Guardian Spirit',
        sprite: 'sage',
        x: 2,
        y: 3,
        dialogue: () => [
          "Thou hast discovered the Sunstone of Tantegel! Guard it well until thou meetest the Staff of Rain."
        ]
      }
    ],
  },

  overworld: {
    id: 'overworld',
    name: 'Alefgard',
    music: 'overworld',
    isDark: false,
    allowOutside: false,
    allowReturn: false,
    isOverworld: true,
    grid: buildOverworldGrid(),
    warps: [
      { x: 28, y: 28, targetMap: 'tantegel_courtyard', targetX: 8, targetY: 16, dir: 'up' },
      { x: 34, y: 27, targetMap: 'brecconary', targetX: 1, targetY: 8, dir: 'right' },
      { x: 10, y: 10, targetMap: 'garinham', targetX: 1, targetY: 7, dir: 'right' },
      { x: 14, y: 20, targetMap: 'mountain_cave', targetX: 7, targetY: 13, dir: 'up' },
      { x: 48, y: 12, targetMap: 'kol_town', targetX: 1, targetY: 7, dir: 'right' },
      { x: 54, y: 6,  targetMap: 'rain_shrine', targetX: 5, targetY: 8, dir: 'up' },
      { x: 48, y: 28, targetMap: 'swamp_cave', targetX: 4, targetY: 2, dir: 'down' },
      { x: 48, y: 36, targetMap: 'swamp_cave', targetX: 4, targetY: 21, dir: 'up' },
      { x: 52, y: 44, targetMap: 'rimuldar', targetX: 1, targetY: 7, dir: 'right' },
      { x: 54, y: 56, targetMap: 'rainbow_shrine', targetX: 5, targetY: 8, dir: 'up' },
      { x: 34, y: 55, targetMap: 'cantlin', targetX: 7, targetY: 1, dir: 'down' },
      { x: 16, y: 48, targetMap: 'damdara', targetX: 1, targetY: 7, dir: 'right' },
      { x: 19, y: 30, targetMap: 'charlock_castle', targetX: 9, targetY: 17, dir: 'up' },
    ],
    bosses: [
      {
        id: 'cantlin_golem',
        monsterType: 'golem',
        mapSprite: 'guard',
        x: 34,
        y: 50,
        preMessage: "A massive Stone Golem blocks the pass to Cantlin!",
      }
    ],
    searchSpots: [
      {
        id: 'erdrick_token',
        x: 44,
        y: 54,
        flag: 'erdrickToken',
        foundMsg: "Erdrick searches the noxious mire... Thou hast unearthed Erdrick's Token!",
      }
    ],
  },

  brecconary: {
    id: 'brecconary',
    name: 'Town of Brecconary',
    music: 'town',
    isDark: false,
    allowOutside: false,
    allowReturn: false,
    grid: [
      '################',
      '#______#_______#',
      '#_kkkk_#_kkkkk_#',
      '#______#_______#',
      '#__##__#__##___#',
      '#______________#',
      '#___WW_________#',
      '#___WW_________#',
      '.______________#',
      '#______#_______#',
      '#_kkkk_#__###__#',
      '#______#_______#',
      '#______#_______#',
      '################',
    ],
    warps: [
      { x: 0, y: 8, targetMap: 'overworld', targetX: 34, targetY: 27, dir: 'down' },
    ],
    npcs: [
      {
        id: 'brecconary_weapon_npc',
        name: 'Weapon Merchant',
        sprite: 'merchant',
        x: 3,
        y: 1,
        shop: {
          title: "WEAPON & ARMOR SHOP",
          items: [
            { kind: 'weapon', id: 'Bamboo Pole', price: 10 },
            { kind: 'weapon', id: 'Club', price: 60 },
            { kind: 'weapon', id: 'Copper Sword', price: 180 },
            { kind: 'armor', id: 'Clothes', price: 20 },
            { kind: 'armor', id: 'Leather Armor', price: 70 },
            { kind: 'shield', id: 'Small Shield', price: 90 },
          ]
        }
      },
      {
        id: 'brecconary_item_npc',
        name: 'Tool Merchant',
        sprite: 'merchant',
        x: 11,
        y: 1,
        shop: {
          title: "TOOL SHOP",
          items: [
            { kind: 'item', id: 'herb', name: 'Medicinal Herb', price: 24 },
            { kind: 'item', id: 'torch', name: 'Torch', price: 8 },
            { kind: 'accessory', id: 'dragonScale', name: "Dragon's Scale", price: 20 },
          ]
        }
      },
      {
        id: 'brecconary_inn_npc',
        name: 'Innkeeper',
        sprite: 'maiden',
        x: 3,
        y: 9,
        innPrice: 6
      },
      {
        id: 'brecconary_elder',
        name: 'Town Elder',
        sprite: 'sage',
        x: 6,
        y: 6,
        dialogue: () => [
          "Welcome to Brecconary! Fight Slimes outside Tantegel first until thou reachest Level 3 and learnest HEAL.",
          "Princess Gwaelin was taken into the Swamp Cave far to the east."
        ]
      },
      {
        id: 'brecconary_maiden',
        name: 'Villager',
        sprite: 'townsman',
        x: 10,
        y: 7,
        dialogue: () => [
          "In Kol to the northeast, a Fairy Flute is said to be buried four steps south of the bathhouse.",
          "It can lull even a Stone Golem to sleep!"
        ]
      }
    ],
  },

  garinham: {
    id: 'garinham',
    name: 'Town of Garinham',
    music: 'town',
    isDark: false,
    allowOutside: false,
    allowReturn: false,
    grid: [
      '################',
      '#______#_______#',
      '#_kkkk_#_kkkkk_#',
      '#______#_______#',
      '#______#_______#',
      '#______________#',
      '#______________#',
      '.______________#',
      '#______#_______#',
      '#_D____#_______#',
      '#_c__c_#_______#',
      '#______#_______#',
      '################',
    ],
    warps: [
      { x: 0, y: 7, targetMap: 'overworld', targetX: 10, targetY: 10, dir: 'down' },
    ],
    chests: [
      { id: 'garinham_gold', x: 2, y: 10, item: 'gold', amount: 300, label: '300 Gold' },
      { id: 'garinham_torch', x: 5, y: 10, item: 'torch', amount: 2, label: '2 Torches' },
    ],
    npcs: [
      {
        id: 'garinham_weapon',
        name: 'Armorer',
        sprite: 'merchant',
        x: 3,
        y: 1,
        shop: {
          title: "GARINHAM ARMORY",
          items: [
            { kind: 'weapon', id: 'Club', price: 60 },
            { kind: 'weapon', id: 'Copper Sword', price: 180 },
            { kind: 'weapon', id: 'Hand Axe', price: 560 },
            { kind: 'armor', id: 'Chain Mail', price: 300 },
            { kind: 'shield', id: 'Large Shield', price: 800 },
          ]
        }
      },
      {
        id: 'garinham_inn',
        name: 'Innkeeper',
        sprite: 'maiden',
        x: 11,
        y: 1,
        innPrice: 25
      },
      {
        id: 'garinham_sage',
        name: 'Historian',
        sprite: 'sage',
        x: 11,
        y: 6,
        dialogue: () => [
          "Garin's Silver Harp rests deep inside the Mountain Cave to the south.",
          "Bring the Silver Harp to the Shrine of Rain in the northeast!"
        ]
      }
    ],
  },

  kol_town: {
    id: 'kol_town',
    name: 'Village of Kol',
    music: 'town',
    isDark: false,
    allowOutside: false,
    allowReturn: false,
    grid: [
      '################',
      '#______#___WW__#',
      '#_kkkk_#___WW__#',
      '#______#_______#',
      '#______#_______#',
      '#______________#',
      '#______________#',
      '.______________#',
      '#______________#',
      '#_kkkk_________#',
      '#______________#',
      '#______________#',
      '################',
    ],
    warps: [
      { x: 0, y: 7, targetMap: 'overworld', targetX: 48, targetY: 12, dir: 'down' },
    ],
    searchSpots: [
      {
        id: 'kol_fairy_flute',
        x: 11,
        y: 6, // 4 steps south of the bath (11,2)
        flag: 'fairyFlute',
        foundMsg: "Erdrick searches the warm earth south of the bath... Thou hast found the Fairy Flute!",
      }
    ],
    npcs: [
      {
        id: 'kol_shop',
        name: 'Kol Merchant',
        sprite: 'merchant',
        x: 3,
        y: 1,
        shop: {
          title: "KOL TRADING POST",
          items: [
            { kind: 'weapon', id: 'Hand Axe', price: 560 },
            { kind: 'armor', id: 'Half Plate', price: 1000 },
            { kind: 'shield', id: 'Large Shield', price: 800 },
            { kind: 'item', id: 'herb', name: 'Medicinal Herb', price: 24 },
            { kind: 'item', id: 'fairyWater', name: 'Fairy Water', price: 38 },
            { kind: 'item', id: 'wings', name: 'Wyvern Wing', price: 70 },
          ]
        }
      },
      {
        id: 'kol_inn',
        name: 'Innkeeper',
        sprite: 'maiden',
        x: 3,
        y: 8,
        innPrice: 20
      },
      {
        id: 'kol_bather',
        name: 'Hot Spring Bather',
        sprite: 'townsman',
        x: 9,
        y: 2,
        dialogue: () => [
          "Ah, the steaming waters of Kol! Stand four steps south of this bath and SEARCH the ground!"
        ]
      }
    ],
  },

  rimuldar: {
    id: 'rimuldar',
    name: 'Town of Rimuldar',
    music: 'town',
    isDark: false,
    allowOutside: false,
    allowReturn: false,
    grid: [
      '################',
      '#______#_______#',
      '#_kkkk_#_kkkkk_#',
      '#______#_______#',
      '#______#_______#',
      '#______________#',
      '#___WW_________#',
      '.______________#',
      '#______#_______#',
      '#_kkkk_#_______#',
      '#______#_______#',
      '#______________#',
      '################',
    ],
    warps: [
      { x: 0, y: 7, targetMap: 'overworld', targetX: 52, targetY: 44, dir: 'down' },
    ],
    npcs: [
      {
        id: 'rimuldar_keys',
        name: 'Key Peddler',
        sprite: 'merchant',
        x: 3,
        y: 1,
        shop: {
          title: "RIMULDAR KEYS & TOOLS",
          items: [
            { kind: 'item', id: 'magicKey', name: 'Magic Key', price: 53 },
            { kind: 'item', id: 'herb', name: 'Medicinal Herb', price: 24 },
            { kind: 'item', id: 'fairyWater', name: 'Fairy Water', price: 38 },
            { kind: 'item', id: 'wings', name: 'Wyvern Wing', price: 70 },
          ]
        }
      },
      {
        id: 'rimuldar_armory',
        name: 'Weaponsmith',
        sprite: 'merchant',
        x: 11,
        y: 1,
        shop: {
          title: "RIMULDAR ARMORY",
          items: [
            { kind: 'weapon', id: 'Broad Sword', price: 1500 },
            { kind: 'armor', id: 'Half Plate', price: 1000 },
            { kind: 'armor', id: 'Full Plate', price: 3000 },
            { kind: 'shield', id: 'Large Shield', price: 800 },
          ]
        }
      },
      {
        id: 'rimuldar_inn',
        name: 'Innkeeper',
        sprite: 'maiden',
        x: 3,
        y: 8,
        innPrice: 55
      },
      {
        id: 'rimuldar_scholar',
        name: 'Scholar',
        sprite: 'sage',
        x: 11,
        y: 7,
        dialogue: () => [
          "Erdrick's Token lies hidden in the poison swamp southwest of Rimuldar (10 steps west, 10 steps south of here).",
          "Bring the Sunstone, Staff of Rain, and Erdrick's Token to the Shrine to the southeast!"
        ]
      }
    ],
  },

  cantlin: {
    id: 'cantlin',
    name: 'Fortress of Cantlin',
    music: 'town',
    isDark: false,
    allowOutside: false,
    allowReturn: false,
    grid: [
      '#######..#######',
      '#______________#',
      '#_kkkk__kkkkkk_#',
      '#______________#',
      '#__B________B__#',
      '#__B__WWWW__B__#',
      '#_____WWWW_____#',
      '#______________#',
      '#_kkkk_________#',
      '#______________#',
      '#______________#',
      '################',
    ],
    warps: [
      { x: 7, y: 0, targetMap: 'overworld', targetX: 34, targetY: 55, dir: 'up' },
      { x: 8, y: 0, targetMap: 'overworld', targetX: 34, targetY: 55, dir: 'up' },
    ],
    npcs: [
      {
        id: 'cantlin_armory',
        name: 'Master Smith',
        sprite: 'merchant',
        x: 11,
        y: 1,
        shop: {
          title: "CANTLIN ROYAL ARMORY",
          items: [
            { kind: 'weapon', id: 'Flame Sword', price: 9800 },
            { kind: 'armor', id: 'Full Plate', price: 3000 },
            { kind: 'armor', id: 'Magic Armor', price: 7700 },
            { kind: 'shield', id: 'Silver Shield', price: 14800 },
          ]
        }
      },
      {
        id: 'cantlin_tools',
        name: 'Apothecary',
        sprite: 'merchant',
        x: 3,
        y: 1,
        shop: {
          title: "CANTLIN SUPPLIES",
          items: [
            { kind: 'item', id: 'herb', name: 'Medicinal Herb', price: 24 },
            { kind: 'item', id: 'magicKey', name: 'Magic Key', price: 53 },
            { kind: 'item', id: 'fairyWater', name: 'Fairy Water', price: 38 },
          ]
        }
      },
      {
        id: 'cantlin_inn',
        name: 'Innkeeper',
        sprite: 'maiden',
        x: 3,
        y: 7,
        innPrice: 100
      },
      {
        id: 'cantlin_old_man',
        name: 'Old Knight',
        sprite: 'sage',
        x: 11,
        y: 8,
        dialogue: () => [
          "Erdrick's Armor was buried beneath a tree in the ruined desert town of Damdara to the northwest!",
          "Beware the dread Axe Knight that guards it!"
        ]
      }
    ],
  },

  damdara: {
    id: 'damdara',
    name: 'Ruins of Damdara',
    music: 'cave',
    isDark: false,
    allowOutside: false,
    allowReturn: false,
    grid: [
      '################',
      '#dddddddddd#ddd#',
      '#dd##dddddd#ddd#',
      '#dd#dddddd##ddd#',
      '#ddddBBBBdddddd#',
      '#ddddBddBdddddd#',
      '#ddddBddBdddddd#',
      '.dddddddddddddd#',
      '#dddddddddddddd#',
      '#dd##dddddd#ddd#',
      '#dddddddddd#dB.#',
      '#dddddddddddddd#',
      '################',
    ],
    warps: [
      { x: 0, y: 7, targetMap: 'overworld', targetX: 16, targetY: 48, dir: 'down' },
    ],
    bosses: [
      {
        id: 'damdara_axe_knight',
        monsterType: 'axe_knight',
        mapSprite: 'guard',
        x: 13,
        y: 10,
        preMessage: "An Axe Knight leaps from the desert shadows to guard Erdrick's legacy!",
      }
    ],
    searchSpots: [
      {
        id: 'erdrick_armor_spot',
        x: 13,
        y: 10,
        requiresBoss: 'damdara_axe_knight',
        flag: 'erdrickArmor',
        foundMsg: "Erdrick digs beneath the scorched sand... Thou hast uncovered Erdrick's Armor! Equipped automatically!",
      }
    ],
  },

  mountain_cave: {
    id: 'mountain_cave',
    name: 'Mountain Cave',
    music: 'cave',
    isDark: true,
    allowOutside: true,
    allowReturn: false,
    grid: [
      '###############',
      '#c____#___c___#',
      '#_###_#_#####_#',
      '#___#_#_______#',
      '###_#_#######_#',
      '#___#_______#_#',
      '#_#########_#_#',
      '#_#_______#_#_#',
      '#_#_#####_#_#_#',
      '#___#___#_#___#',
      '#####_#_#_###_#',
      '#c____#_#_____#',
      '#_______#_____#',
      '#______u______#',
      '###############',
    ],
    warps: [
      { x: 7, y: 13, targetMap: 'overworld', targetX: 14, targetY: 20, dir: 'down' },
    ],
    chests: [
      { id: 'mtn_ring', x: 1, y: 1, item: 'fighterRing', amount: 1, label: "the Fighter's Ring" },
      { id: 'mtn_harp', x: 10, y: 1, item: 'silverHarp', amount: 1, label: 'the Silver Harp' },
      { id: 'mtn_gold', x: 1, y: 11, item: 'gold', amount: 250, label: '250 Gold' },
    ],
  },

  swamp_cave: {
    id: 'swamp_cave',
    name: 'Swamp Cave',
    music: 'cave',
    isDark: true,
    allowOutside: true,
    allowReturn: false,
    grid: [
      '###############',
      '#____#________#',
      '#__u_#__####__#',
      '#____#__#__#__#',
      '#_####__#__#__#',
      '#_______#_____#',
      '#######_#####_#',
      '#_______#___#_#',
      '#_#######_D_#_#',
      '#_#_____#___#_#',
      '#_#_###_#___#_#',
      '#_#_#_#_#_____#',
      '#_#_#_#_#####_#',
      '#_#_#_____#___#',
      '#___#####_#___#',
      '#_________#___#',
      '#_#########___#',
      '#_______#_____#',
      '#_#####_#_____#',
      '#_____#_______#',
      '#_____#_______#',
      '#___u_#_______#',
      '###############',
    ],
    warps: [
      { x: 3, y: 2, targetMap: 'overworld', targetX: 48, targetY: 28, dir: 'up' },
      { x: 4, y: 21, targetMap: 'overworld', targetX: 48, targetY: 36, dir: 'down' },
    ],
    bosses: [
      {
        id: 'swamp_green_dragon',
        monsterType: 'green_dragon',
        mapSprite: 'guard',
        x: 10,
        y: 11,
        preMessage: "A fearsome Green Dragon blocks the chamber of Princess Gwaelin!",
      }
    ],
    npcs: [
      {
        id: 'princess_gwaelin',
        name: 'Princess Gwaelin',
        sprite: 'princess',
        x: 12,
        y: 11,
        isVisible: (game) => !game.player.isCarryingPrincess && !game.player.inventory.gwaelinLove,
        dialogue: (game) => {
          if (!game.defeatedBosses.has('swamp_green_dragon')) {
            return ["Please defeat the Green Dragon first!"];
          }
          return [
            "Thou hast slain the dread dragon! Art thou truly Erdrick's descendant?",
            "Please carry me safely home to Tantegel Castle!"
          ];
        },
        onTalkEnd: (game) => {
          if (game.defeatedBosses.has('swamp_green_dragon') && !game.player.isCarryingPrincess) {
            game.player.isCarryingPrincess = true;
            game.sound.playSFX('chest_open');
          }
        }
      }
    ],
  },

  rain_shrine: {
    id: 'rain_shrine',
    name: 'Shrine of Rain',
    music: 'castle',
    isDark: false,
    allowOutside: false,
    allowReturn: false,
    grid: [
      '###########',
      '#_________#',
      '#__#####__#',
      '#__#___#__#',
      '#__#_t_#__#',
      '#__#___#__#',
      '#__##_##__#',
      '#_________#',
      '#____u____#',
      '###########',
    ],
    warps: [
      { x: 5, y: 8, targetMap: 'overworld', targetX: 54, targetY: 6, dir: 'down' },
    ],
    npcs: [
      {
        id: 'rain_sage',
        name: 'High Sage',
        sprite: 'sage',
        x: 5,
        y: 4,
        dialogue: (game) => {
          if (game.player.inventory.staffOfRain) {
            return ["Seek now the Shrine of the Rainbow far to the south with the Sunstone and Erdrick's Token!"];
          }
          if (game.player.inventory.silverHarp) {
            game.player.inventory.staffOfRain = true;
            game.sound.playSFX('level_up');
            return [
              "Ah! Thou carryest the Silver Harp of Garin!",
              "In exchange for thy noble music, receive the sacred Staff of Rain!"
            ];
          }
          return [
            "Only one who brings the Silver Harp from Mountain Cave is worthy of the Staff of Rain."
          ];
        }
      }
    ],
  },

  rainbow_shrine: {
    id: 'rainbow_shrine',
    name: 'Shrine of the Rainbow',
    music: 'castle',
    isDark: false,
    allowOutside: false,
    allowReturn: false,
    grid: [
      '###########',
      '#_________#',
      '#__#####__#',
      '#__#___#__#',
      '#__#_t_#__#',
      '#__#___#__#',
      '#__##_##__#',
      '#_________#',
      '#____u____#',
      '###########',
    ],
    warps: [
      { x: 5, y: 8, targetMap: 'overworld', targetX: 54, targetY: 56, dir: 'down' },
    ],
    npcs: [
      {
        id: 'rainbow_sage',
        name: 'Shrine Keeper',
        sprite: 'sage',
        x: 5,
        y: 4,
        dialogue: (game) => {
          const inv = game.player.inventory;
          if (inv.rainbowDrop) {
            return [
              "Stand upon the Western Cape across from Charlock Island and use the Rainbow Drop from ITEM!"
            ];
          }
          if (inv.sunstone && inv.staffOfRain && inv.erdrickToken) {
            inv.rainbowDrop = true;
            game.sound.playSFX('level_up');
            return [
              "The Sunstone, Staff of Rain, and Erdrick's Token shine as one!",
              "Behold! The Rainbow Drop is thine! Go to the Western Cape and raise it over the sea!"
            ];
          }
          const missing = [];
          if (!inv.sunstone) missing.push('Sunstone (Tantegel)');
          if (!inv.staffOfRain) missing.push('Staff of Rain (Rain Shrine)');
          if (!inv.erdrickToken) missing.push("Erdrick's Token (Southern Marsh)");
          return [
            "To forge the Rainbow Drop, thou must still gather: " + missing.join(', ') + "."
          ];
        }
      }
    ],
  },

  charlock_castle: {
    id: 'charlock_castle',
    name: 'Charlock Castle',
    music: 'cave',
    isDark: true,
    allowOutside: true,
    allowReturn: false,
    grid: [
      '###################',
      '#_______#_________#',
      '#_#####_#_#######_#',
      '#_#___#_#_#__t__#_#',
      '#_#_c_#_#_#_____#_#',
      '#_#___#_#_#_____#_#',
      '#_##D##_#_###D###_#',
      '#_______#_________#',
      '####D####_#########',
      '#_________________#',
      '#_BBBBB_____BBBBB_#',
      '#_B___B_____B___B_#',
      '#_BBBBB_____BBBBB_#',
      '#_________________#',
      '#____#########____#',
      '#_________________#',
      '#________r________#',
      '#________u________#',
      '###################',
    ],
    warps: [
      { x: 9, y: 17, targetMap: 'overworld', targetX: 19, targetY: 30, dir: 'down' },
    ],
    chests: [
      { id: 'charlock_erdrick_sword', x: 4, y: 4, item: 'erdrickSword', amount: 1, label: "Erdrick's Sword" },
    ],
    npcs: [
      {
        id: 'dragonlord_npc',
        name: 'Dragonlord',
        sprite: 'sage',
        x: 13,
        y: 3,
        isVisible: (game) => !game.defeatedBosses.has('dragonlord_final'),
        dialogue: () => [], // Handled directly by Dragonlord offer choice in game controller!
        isDragonlord: true
      }
    ],
  },
};

export function getOverworldZone(x, y) {
  const dTantegel = Math.hypot(x - 28, y - 28);
  if (dTantegel <= 7) return 0; // Slimes & Red Slimes
  if (x <= 22 && y >= 26 && y <= 34) return 5; // Charlock Island
  if (y >= 44 && x <= 24) return 5; // Damdara Desert
  if (y >= 40) return 4; // Rimuldar / Cantlin South
  if (x >= 40) return 3; // Kol / Swamp East
  if (x <= 24 && y <= 24) return 2; // Garinham / Mountain NW
  return 1; // Central Outskirts
}
