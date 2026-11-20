// Authentic NES 8-Bit Pixel Art Generator & Palette Cache
// Native 16x16 tiles/sprites and 32x32–48x48 first-person battle monster portraits

export const NES_PALETTE = {
  '.': null,        // Transparent
  '0': '#000000',   // Pitch Black
  '1': '#fcfcfc',   // Pure White
  '2': '#bcbcbc',   // Light Gray
  '3': '#7c7c7c',   // Dark Gray
  '4': '#3c3c3c',   // Charcoal
  'r': '#f83800',   // Bright Red
  'R': '#a81000',   // Dark Red / Crimson
  'd': '#881400',   // Deep Brick Red
  'o': '#fc9838',   // Orange / Gold
  'y': '#f8b800',   // Bright Yellow-Gold
  'Y': '#ac7c00',   // Dark Ochre / Tan
  's': '#f8d878',   // Sand / Light Skin
  'p': '#f87858',   // Warm Peach / Skin
  'b': '#0058f8',   // Royal Blue
  'B': '#0000bc',   // Deep Blue
  'c': '#3cbcfc',   // Cyan / Sky Blue
  'C': '#008888',   // Teal
  'g': '#00a800',   // Meadow Green
  'G': '#006800',   // Forest Dark Green
  'l': '#58d854',   // Lime Light Green
  'L': '#b8f818',   // Neon Slime Green
  'm': '#bc00bc',   // Magenta / Purple
  'M': '#680068',   // Deep Violet
  'w': '#503000',   // Dark Wood / Brown
  'W': '#ac5000',   // Mid Brown
  'k': '#f8a4c0',   // Princess Pink
  'K': '#d800cc',   // Deep Rose
  't': '#004058',   // Dark Slate / Abyss
};

// Cache for offscreen canvases so every tile/sprite is baked once
const spriteCache = new Map();

function createCanvas(w, h) {
  if (typeof document !== 'undefined') {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    return c;
  }
  return null;
}

/**
 * Renders a string-grid pixel matrix onto a cached HTMLCanvasElement.
 * Each row in `rows` corresponds to Y, each character to X.
 */
export function bakePixelMatrix(key, rows, paletteOverrides = null) {
  if (spriteCache.has(key)) return spriteCache.get(key);
  const h = rows.length;
  const w = rows[0].length;
  const canvas = createCanvas(w, h);
  if (!canvas) return null;

  const ctx = canvas.getContext('2d');
  for (let y = 0; y < h; y++) {
    const row = rows[y];
    for (let x = 0; x < w; x++) {
      const ch = row[x];
      const color = (paletteOverrides && paletteOverrides[ch] !== undefined)
        ? paletteOverrides[ch]
        : NES_PALETTE[ch];
      if (color) {
        ctx.fillStyle = color;
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }
  spriteCache.set(key, canvas);
  return canvas;
}

// ============================================================================
// 1. 16x16 WORLD & INTERIOR TILES
// ============================================================================

const TILE_MATRICES = {
  GRASS: [
    'gggggggggggggggg',
    'gglgggggggglgggg',
    'glglgggggglglggg',
    'gggggggggggggggg',
    'gggggglggggggggg',
    'ggggglglgggggglg',
    'ggggggggggggglgl',
    'gggggggggggggggg',
    'gglggggggggggggg',
    'glglgggggglggggg',
    'ggggggggglglgggg',
    'gggggggggggggggg',
    'ggggglgggggggglg',
    'gggglglgggggglgl',
    'gggggggggggggggg',
    'gggggggggggggggg',
  ],

  FOREST: [
    'ggGGGGGGGGGGGGgg',
    'gGGllGGGGllGGGGg',
    'GGllGGGGGlllGGGG',
    'GGgGGGGGGgGGGGGG',
    'GGGgGGGGGGGGgGGG',
    'gGGGGGGGGGGGGGGg',
    'gGGlllGGGGlllGGg',
    'GGllGllGGllGllGG',
    'GGgGGGgGGgGGGgGG',
    'gGGGGGGGGGGGGGGg',
    'ggGGGGwGGwGGGGgg',
    'gggggGwwwwGggggg',
    'ggggggwwwwgggggg',
    'ggGGGGwwwwGGGGgg',
    'gggggGwwwwGggggg',
    'gggggggggggggggg',
  ],

  HILL: [
    'gggggggggggggggg',
    'ggggggGGGGgggggg',
    'ggggGGllllGGgggg',
    'gggGllgGGgllGggg',
    'ggGlgGGGGGGglGgg',
    'gGlgGGWWWWGGglGg',
    'GgGGWWssssWWGGgG',
    'GGGWssGGGGssWGGG',
    'ggGggggggggggGgg',
    'gggggGGGGGGggggg',
    'gggGGllllllGGggg',
    'ggGllGGGGGGllGgg',
    'gGlgGWWWWWWGglGg',
    'GgGGWssssssWGGgG',
    'gggggggggggggggg',
    'gggggggggggggggg',
  ],

  MOUNTAIN: [
    'ggggggg00ggggggg',
    'gggggg0110gggggg',
    'ggggg011220ggggg',
    'gggg01222WW0gggg',
    'ggg0222WWwWW0ggg',
    'gg022WWwWssWW0gg',
    'gg0WWwWWssssW0gg',
    'g0WwWWssssssWW0g',
    'g0WWssssWWwWWw0g',
    '0WssssWWwWWwWWw0',
    '0sssWWwWWwWWwWW0',
    '0sWWwWWwWWwWWwW0',
    '0WwWWwWWwWWwWWw0',
    '0WWwWWwWWwWWwWW0',
    '0000000000000000',
    'gggggggggggggggg',
  ],

  WATER_0: [
    'bbbbbbbbbbbbbbbb',
    'bbbccbbbbcbbbbbb',
    'bb11ccbb11cbbbbb',
    'bbbbbbbbbbbbbbbb',
    'bbbbbbbbbbbbccbb',
    'bbbbbbccbbb11cbb',
    'bbbbb11cbbbbbbbb',
    'bbbbbbbbbbbbbbbb',
    'bbccbbbbbbbbbbbb',
    'b11cbbbbbbbccbbb',
    'bbbbbbbbbb11cbbb',
    'bbbbbbbbbbbbbbbb',
    'bbbbccbbbbbbbbbb',
    'bbb11cbbbbbbccbb',
    'bbbbbbbbbbb11cbb',
    'bbbbbbbbbbbbbbbb',
  ],

  WATER_1: [
    'bbbbbbbbbbbbbbbb',
    'bbbbccbbbbbcbbbb',
    'bbb11ccbbb11cbbb',
    'bbbbbbbbbbbbbbbb',
    'bbbbbbbbbbbccbbb',
    'bbbbbbbccbb11cbb',
    'bbbbbb11cbbbbbbb',
    'bbbbbbbbbbbbbbbb',
    'bbbccbbbbbbbbbbb',
    'bb11cbbbbbbccbbb',
    'bbbbbbbbbb11cbbb',
    'bbbbbbbbbbbbbbbb',
    'bbbbbccbbbbbbbbb',
    'bbbb11cbbbbccbbb',
    'bbbbbbbbbb11cbbb',
    'bbbbbbbbbbbbbbbb',
  ],

  SWAMP: [
    'GGGGGGGGGGGGGGGG',
    'GGmGG0GGGGmGGG0G',
    'Gm1mGGGGGGmGGGGg',
    'GGmGGGG0GGGGmGGG',
    'GGGGGGGGGGGm1mGG',
    'G0GGmGGGGGGGmGGG',
    'GGGm1mGGGGGGGG0G',
    'GGGGmGGGmGGGGGGG',
    'GGGGGGGGmGGG0GGG',
    'GG0GGGGGGGGGGGGG',
    'GGGGGmGGGGmGGGGG',
    'GmGGm1mGGm1mGG0G',
    'GGGGGmGGGGmGGGGG',
    'GGG0GGGGGGGGmGGG',
    'GGGGGGGmGGGGGGGG',
    'GGGGGGGGGGGGGGGG',
  ],

  DESERT: [
    'ssssssssssssssss',
    'ssYssysssssYssys',
    'ssssssssssssssss',
    'sssssYssysssssss',
    'ssssssssssssYsss',
    'ysssssssssssssss',
    'sssYsssssYssysss',
    'ssssssssssssssss',
    'ssssssysssssssss',
    'sYssssssssssYsss',
    'ssssssssssssssss',
    'ssssYssyssssssss',
    'sssssssssssYssys',
    'ssysssssssssssss',
    'ssssssssYsssssss',
    'ssssssssssssssss',
  ],

  BRIDGE: [
    'bbbbbbbbbbbbbbbb',
    '0000000000000000',
    'yyyyyyyyyyyyyyyy',
    '0000000000000000',
    'WYYwWYYwWYYwWYYw',
    'WYYwWYYwWYYwWYYw',
    'WYYwWYYwWYYwWYYw',
    'WYYwWYYwWYYwWYYw',
    'WYYwWYYwWYYwWYYw',
    'WYYwWYYwWYYwWYYw',
    'WYYwWYYwWYYwWYYw',
    'WYYwWYYwWYYwWYYw',
    '0000000000000000',
    'yyyyyyyyyyyyyyyy',
    '0000000000000000',
    'bbbbbbbbbbbbbbbb',
  ],

  CASTLE_TILE: [
    'gggg010gg010gggg',
    'gggg02000020gggg',
    'gggg01111110gggg',
    'gggg02222220gggg',
    'g01001100110010g',
    'g02002200220020g',
    'g01111111111110g',
    'g02222222222220g',
    'g01111000011110g',
    'g022220dd022220g',
    'g011110dd011110g',
    'g022220dd022220g',
    'g011110dd011110g',
    'g022220dd022220g',
    'g00000000000000g',
    'gggggggggggggggg',
  ],

  TOWN_TILE: [
    'gggggggggggggggg',
    'gg0000gggg0000gg',
    'g0rrrr0gg0rrrr0g',
    '0r1111r00r1111r0',
    '0RRRRRR00RRRRRR0',
    'g011110gg011110g',
    'g010010gg010010g',
    'g010010gg010010g',
    'g000000gg000000g',
    'ggggg000000ggggg',
    'gggg0rrrrrr0gggg',
    'ggg0r111111r0ggg',
    'ggg0RRRRRRRR0ggg',
    'gggg01100110gggg',
    'gggg01100110gggg',
    'gggg00000000gggg',
  ],

  CAVE_TILE: [
    'gggggg0000gggggg',
    'gggg00WWWW00gggg',
    'ggg0WWssssWW0ggg',
    'gg0WssWWWWssW0gg',
    'g0WsWW0000WWsW0g',
    'g0WW00000000WW0g',
    '0WW0000000000WW0',
    '0W000000000000W0',
    '0W000000000000W0',
    '0W000000000000W0',
    '0W000000000000W0',
    '0W000000000000W0',
    '0W000000000000W0',
    '0000000000000000',
    'gggggggggggggggg',
    'gggggggggggggggg',
  ],

  SHRINE_TILE: [
    'gggggggggggggggg',
    'ggg0000000000ggg',
    'gg0yyyyyyyyyy0gg',
    'gg000000000000gg',
    'ggg0110110110ggg',
    'ggg0110110110ggg',
    'ggg0110110110ggg',
    'ggg0110110110ggg',
    'ggg0110110110ggg',
    'ggg0110000110ggg',
    'ggg0110000110ggg',
    'ggg0110000110ggg',
    'gg022200002220gg',
    'g02222222222220g',
    'g00000000000000g',
    'gggggggggggggggg',
  ],

  BRICK_WALL: [
    '0000000000000000',
    '2222222022222220',
    '2111112021111120',
    '2333333023333330',
    '0000000000000000',
    '2220222222202222',
    '1120211111202111',
    '3330233333302333',
    '0000000000000000',
    '2222222022222220',
    '2111112021111120',
    '2333333023333330',
    '0000000000000000',
    '2220222222202222',
    '1120211111202111',
    '3330233333302333',
  ],

  STONE_FLOOR: [
    '3222222232222222',
    '2111111221111112',
    '2112211221122112',
    '2112211221122112',
    '2111111221111112',
    '2222222322222223',
    '3333333333333333',
    '2222322222223222',
    '1112211111122111',
    '2112211221122112',
    '2112211221122112',
    '1112211111122111',
    '2223222222232222',
    '3333333333333333',
    '2222222232222222',
    '2111111221111112',
  ],

  ROYAL_CARPET: [
    'RRRRRRRRRRRRRRRR',
    'RyyyyyyyyyyyyyyR',
    'RyRRRRRRRRRRRRYR',
    'RyRRRRRRRRRRRRyR',
    'RyRRrrRRRRrrRRyR',
    'RyRRr1RRRR1rRRyR',
    'RyRRRRRRRRRRRRyR',
    'RyRRRRRRRRRRRRyR',
    'RyRRRRRRRRRRRRyR',
    'RyRRRRRRRRRRRRyR',
    'RyRRrrRRRRrrRRyR',
    'RyRRr1RRRR1rRRyR',
    'RyRRRRRRRRRRRRyR',
    'RyRRRRRRRRRRRRyR',
    'RyyyyyyyyyyyyyyR',
    'RRRRRRRRRRRRRRRR',
  ],

  BARRIER_FLOOR: [
    'm0m0m0m0m0m0m0m0',
    '0r0r0r0r0r0r0r0r',
    'm0r0m0r0m0r0m0r0',
    '0r0m0r0m0r0m0r0m',
    'm0m0r0m0m0r0m0m0',
    '0r0r0m0r0r0m0r0r',
    'm0r0m0r0m0r0m0r0',
    '0r0m0r0m0r0m0r0m',
    'm0m0m0m0m0m0m0m0',
    '0r0r0r0r0r0r0r0r',
    'm0r0m0r0m0r0m0r0',
    '0r0m0r0m0r0m0r0m',
    'm0m0r0m0m0r0m0m0',
    '0r0r0m0r0r0m0r0r',
    'm0r0m0r0m0r0m0r0',
    '0r0m0r0m0r0m0r0m',
  ],

  LOCKED_DOOR: [
    '0000000000000000',
    '0yyyyyyyyyyyyyy0',
    '0yWWWWWWWWWWWWy0',
    '0yWyyyyyyyyyyWy0',
    '0yWyWWWWWWWWyWy0',
    '0yWyW000000WyWy0',
    '0yWyW0yyyy0WyWy0',
    '0yWyW0y00y0WyWy0',
    '0yWyW0y00y0WyWy0',
    '0yWyW0y00y0WyWy0',
    '0yWyW0yyyy0WyWy0',
    '0yWyW000000WyWy0',
    '0yWyWWWWWWWWyWy0',
    '0yWyyyyyyyyyyWy0',
    '0yWWWWWWWWWWWWy0',
    '0000000000000000',
  ],

  CHEST: [
    '2222222222222222',
    '2000000000000002',
    '20yyyyyyyyyyyy02',
    '20yWWWWWWWWWWy02',
    '20yWyyyyyyyyWy02',
    '20yyyyy00yyyyy02',
    '2000000yy0000002',
    '20yyyyyyyyyyyy02',
    '20yWWWW00WWWWy02',
    '20yWWWW00WWWWy02',
    '20yWWWWWWWWWWy02',
    '20yWWWWWWWWWWy02',
    '20yyyyyyyyyyyy02',
    '2000000000000002',
    '2222222222222222',
    '2222222222222222',
  ],

  STAIRS_UP: [
    '0000000000000000',
    '0111111111111110',
    '0111111111111220',
    '0000000000001220',
    '0222222222201220',
    '0222222222201220',
    '0000000000001220',
    '0333333333301220',
    '0333333333301220',
    '0000000000001220',
    '0444444444401220',
    '0444444444401220',
    '0000000000001220',
    '0000000000001220',
    '0000000000000000',
    '0000000000000000',
  ],

  STAIRS_DOWN: [
    '0000000000000000',
    '0222222222222220',
    '0222200000000000',
    '0222201111111110',
    '0222200000000000',
    '0222202222222220',
    '0222200000000000',
    '0222203333333330',
    '0222200000000000',
    '0222204444444440',
    '0222200000000000',
    '0222200000000000',
    '0222200000000000',
    '0222200000000000',
    '0222200000000000',
    '0000000000000000',
  ],

  COUNTER: [
    '0000000000000000',
    '0yyyyyyyyyyyyyy0',
    '0yWWWWWWWWWWWWy0',
    '0yWWWWWWWWWWWWy0',
    '0yWWWWWWWWWWWWy0',
    '0yyyyyyyyyyyyyy0',
    '0wwwwwwwwwwwwww0',
    '0wWWWWwWWwWWWWw0',
    '0wWWWWwWWwWWWWw0',
    '0wWWWWwWWwWWWWw0',
    '0wWWWWwWWwWWWWw0',
    '0wWWWWwWWwWWWWw0',
    '0wwwwwwwwwwwwww0',
    '0000000000000000',
    '3333333333333333',
    '2222222222222222',
  ],

  THRONE: [
    'RRRR00yyyy00RRRR',
    'RRR0yyYYYYyy0RRR',
    'RR0yYYRRRRYYy0RR',
    'RR0yYRRRRRRYy0RR',
    'RR0yYRRyyRRYy0RR',
    'RR0yYRRyyRRYy0RR',
    'RR0yYRRRRRRYy0RR',
    'RR0yyyyyyyyyy0RR',
    'RR0yYYYYYYYYy0RR',
    'RR0yYRRRRRRYy0RR',
    'RR0yYRRRRRRYy0RR',
    'RR0yyyyyyyyyy0RR',
    'RR0yYY0000YYy0RR',
    'RR0yYY0000YYy0RR',
    'RR000000000000RR',
    'RRRRRRRRRRRRRRRR',
  ],

  WATER_FOUNTAIN: [
    '2222200000022222',
    '22200bbbbbb00222',
    '220bbccccccbb022',
    '20bbcc1111ccbb02',
    '20bc11bbbb11cb02',
    '0bbc1bbccbb1cbb0',
    '0bc1bbc11cbb1cb0',
    '0bc1bc1bb1cb1cb0',
    '0bc1bc1bb1cb1cb0',
    '0bc1bbc11cbb1cb0',
    '0bbc1bbccbb1cbb0',
    '20bc11bbbb11cb02',
    '20bbcc1111ccbb02',
    '220bbccccccbb022',
    '22200bbbbbb00222',
    '2222200000022222',
  ],

  VOID: [
    '0000000000000000',
    '0000000000000000',
    '0000000000000000',
    '0000000000000000',
    '0000000000000000',
    '0000000000000000',
    '0000000000000000',
    '0000000000000000',
    '0000000000000000',
    '0000000000000000',
    '0000000000000000',
    '0000000000000000',
    '0000000000000000',
    '0000000000000000',
    '0000000000000000',
    '0000000000000000',
  ],
};

export function getTileCanvas(tileId, animFrame = 0) {
  if (tileId === 'WATER') {
    const key = animFrame % 2 === 0 ? 'WATER_0' : 'WATER_1';
    return bakePixelMatrix(`tile_${key}`, TILE_MATRICES[key]);
  }
  const matrix = TILE_MATRICES[tileId] || TILE_MATRICES.GRASS;
  return bakePixelMatrix(`tile_${tileId}`, matrix);
}

// ============================================================================
// 2. 16x16 CHARACTER & NPC SPRITES (4 Directions x 2 Step Frames)
// ============================================================================

// Hero base sprites facing DOWN (frame 0 & frame 1), UP, LEFT (mirrored for RIGHT)
// Variant overlays add sword / shield or Princess Gwaelin!
const HERO_DOWN_0 = [
  '....00....00....',
  '...0yy0000yy0...',
  '...0ybbbbbb0....',
  '..0ybbbbbbbby0..',
  '..00bbbbbbbb00..',
  '...0pp0pp0pp0...',
  '...0pppppppp0...',
  '....0ppRRpp0....',
  '..000bbbbbb000..',
  '.0bbbbyyyybbbb0.',
  '.0bb0bbbbbb0bb0.',
  '.0pp0bbbbbb0pp0.',
  '..00.0bbbb0.00..',
  '.....0b00b0.....',
  '....0yy00yy0....',
  '....000..000....',
];

const HERO_DOWN_1 = [
  '....00....00....',
  '...0yy0000yy0...',
  '...0ybbbbbb0....',
  '..0ybbbbbbbby0..',
  '..00bbbbbbbb00..',
  '...0pp0pp0pp0...',
  '...0pppppppp0...',
  '....0ppRRpp0....',
  '..000bbbbbb000..',
  '.0bbbbyyyybbbb0.',
  '.0pp0bbbbbb0bb0.',
  '..00.0bbbb00pp0.',
  '.....0b00b0.00..',
  '....0yy00b0.....',
  '....000.0yy0....',
  '........000.....',
];

const HERO_UP_0 = [
  '....00....00....',
  '...0yy0000yy0...',
  '...0ybbbbbb0....',
  '..0ybbbbbbbby0..',
  '..00bbbbbbbb00..',
  '...0bbbbbbbb0...',
  '...0bbbbbbbb0...',
  '....00000000....',
  '..000bbbbbb000..',
  '.0bbbbbbbbbbbb0.',
  '.0bb0bbbbbb0bb0.',
  '.0pp0bbbbbb0pp0.',
  '..00.0bbbb0.00..',
  '.....0b00b0.....',
  '....0yy00yy0....',
  '....000..000....',
];

const HERO_UP_1 = [
  '....00....00....',
  '...0yy0000yy0...',
  '...0ybbbbbb0....',
  '..0ybbbbbbbby0..',
  '..00bbbbbbbb00..',
  '...0bbbbbbbb0...',
  '...0bbbbbbbb0...',
  '....00000000....',
  '..000bbbbbb000..',
  '.0bbbbbbbbbbbb0.',
  '.0bb0bbbbbb0pp0.',
  '.0pp0bbbbbb000..',
  '..00.0bbbb0.....',
  '.....0b00yy0....',
  '....0yy0000.....',
  '....000.........',
];

const HERO_LEFT_0 = [
  '.....00..00.....',
  '....0yy00yy0....',
  '....0bbbbbb0....',
  '...0bbbbbbbby0..',
  '...00bbbbbb00...',
  '...000pppp0.....',
  '...0pppppp0.....',
  '....0RRppp0.....',
  '....0bbbbbb0....',
  '...0bbbyybbb0...',
  '...0bbbbbbbb0...',
  '...0ppbbbb00....',
  '....00bbbb0.....',
  '.....0b00b0.....',
  '....0yy0.0yy0...',
  '....000...000...',
];

const HERO_LEFT_1 = [
  '.....00..00.....',
  '....0yy00yy0....',
  '....0bbbbbb0....',
  '...0bbbbbbbby0..',
  '...00bbbbbb00...',
  '...000pppp0.....',
  '...0pppppp0.....',
  '....0RRppp0.....',
  '....0bbbbbb0....',
  '...0bbbyybbb0...',
  '...0bbbbbbbb0...',
  '....0ppbbb0.....',
  '.....0bbbb0.....',
  '....0bb00bb0....',
  '...0yy0..0yy0...',
  '...000....000...',
];

// Carrying Princess Gwaelin (Down/Left/Up)
const HERO_PRINCESS_DOWN = [
  '..0000....00....',
  '.0yyyy0..0yy0...',
  '.0yppkk0.0ybb0..',
  '0ypp0ppk0ybbbby0',
  '0kkkkkkk00bbbb00',
  '0kkkkkkkkpp0pp0.',
  '.0kkkkkkpppppp0.',
  '..00kkkk0ppRRp0.',
  '...0kkkkkbbbb00.',
  '..0kkkkkkkkbb0..',
  '..0kkkkkkkkpp0..',
  '...0000000000...',
  '.....0b00b0.....',
  '....0yy00yy0....',
  '....000..000....',
  '................',
];

function flipHorizontal(rows) {
  return rows.map(r => r.split('').reverse().join(''));
}

function addEquipmentOverlay(baseRows, dir, variant) {
  if (variant === 'carrying_princess') {
    if (dir === 'up') return HERO_UP_0;
    if (dir === 'right') return flipHorizontal(HERO_PRINCESS_DOWN);
    return HERO_PRINCESS_DOWN;
  }

  const grid = baseRows.map(r => r.split(''));

  const hasSword = variant === 'sword' || variant === 'sword_shield';
  const hasShield = variant === 'sword_shield';

  if (dir === 'down') {
    if (hasSword) {
      // Sword held vertically on left-screen (hero's right hand)
      grid[5][0] = '1'; grid[6][0] = '1'; grid[7][0] = '1'; grid[8][0] = '1';
      grid[9][0] = 'y'; grid[10][0] = 'w';
    }
    if (hasShield) {
      // Red/gold shield on right-screen (hero's left arm)
      for (let y = 9; y <= 13; y++) {
        for (let x = 12; x <= 15; x++) {
          if (y === 9 || y === 13 || x === 12 || x === 15) grid[y][x] = '0';
          else grid[y][x] = (y === 11 && x === 13) ? 'y' : 'r';
        }
      }
    }
  } else if (dir === 'up') {
    if (hasSword) {
      grid[4][15] = '1'; grid[5][15] = '1'; grid[6][15] = '1'; grid[7][15] = '1';
      grid[8][15] = 'y';
    }
    if (hasShield) {
      for (let y = 9; y <= 12; y++) {
        grid[y][0] = '0'; grid[y][1] = 'r'; grid[y][2] = '0';
      }
    }
  } else if (dir === 'left') {
    if (hasSword) {
      grid[7][0] = '1'; grid[8][0] = '1'; grid[9][0] = '1'; grid[10][0] = 'y';
    }
    if (hasShield) {
      for (let y = 9; y <= 13; y++) {
        grid[y][6] = '0'; grid[y][7] = 'r'; grid[y][8] = 'y'; grid[y][9] = '0';
      }
    }
  } else if (dir === 'right') {
    if (hasSword) {
      grid[7][15] = '1'; grid[8][15] = '1'; grid[9][15] = '1'; grid[10][15] = 'y';
    }
    if (hasShield) {
      for (let y = 9; y <= 13; y++) {
        grid[y][6] = '0'; grid[y][7] = 'y'; grid[y][8] = 'r'; grid[y][9] = '0';
      }
    }
  }

  return grid.map(r => r.join(''));
}

export function getHeroSprite(dir = 'down', frame = 0, variant = 'unarmed') {
  const key = `hero_${dir}_${frame % 2}_${variant}`;
  if (spriteCache.has(key)) return spriteCache.get(key);

  let base;
  if (dir === 'up') base = (frame % 2 === 0) ? HERO_UP_0 : HERO_UP_1;
  else if (dir === 'left') base = (frame % 2 === 0) ? HERO_LEFT_0 : HERO_LEFT_1;
  else if (dir === 'right') base = flipHorizontal((frame % 2 === 0) ? HERO_LEFT_0 : HERO_LEFT_1);
  else base = (frame % 2 === 0) ? HERO_DOWN_0 : HERO_DOWN_1;

  const finalRows = addEquipmentOverlay(base, dir, variant);
  return bakePixelMatrix(key, finalRows);
}

// NPC Sprites
const NPC_MATRICES = {
  king: [
    '....00000000....',
    '...0y0y00y0y0...',
    '...0yyyyyyyy0...',
    '...0RRRRRRRR0...',
    '..01pppppppp10..',
    '..01pp0pp0pp10..',
    '..011111111110..',
    '...0111111110...',
    '.000rrrrrrrr000.',
    '0rrrrryyyyrrrrr0',
    '0rr0rmmmmmmr0rr0',
    '0pp0rmmmmmmr0pp0',
    '.00.0rmmmmr0.00.',
    '....0rrrrrr0....',
    '....0yy00yy0....',
    '....000..000....',
  ],
  princess: [
    '.....000000.....',
    '....0yyyyyy0....',
    '...0yyyyyyyy0...',
    '...0ypp0pp0y0...',
    '...0yppppppy0...',
    '....0ypRRpy0....',
    '....00kkkk00....',
    '...0kkkkkkkk0...',
    '..0kk1kkkk1kk0..',
    '..0ppkkkkkkpp0..',
    '...0kkkkkkkk0...',
    '..0kkkkkkkkkk0..',
    '..0kkkkkkkkkk0..',
    '..011111111110..',
    '...0000000000...',
    '................',
  ],
  guard: [
    '.......00.......',
    '......0rr0......',
    '....00bbbb00....',
    '...0bbbbbbbb0...',
    '...0bb0000bb0...',
    '...0bbppppbb0...',
    '....00pppp00....',
    '..000bbbbbb000.1',
    '.0bbbbyyyybbbb01',
    '.0bb0bbbbbb0bb01',
    '.0pp0bbbbbb0pp01',
    '..00.0bbbb0.00.W',
    '.....0b00b0....W',
    '....02200220...W',
    '....000..000...W',
    '...............W',
  ],
  sage: [
    '.....000000.....',
    '....01111110....',
    '...01pppppp10...',
    '...01p0pp0p10...',
    '...0111111110...',
    '....01111110....',
    '....00111100....',
    '...00mmmmmm00...',
    '..0mmmm11mmmm0..',
    '..0mm0mmmm0mm0..',
    '..0pp0mmmm0pp0..',
    '...000mmmm000...',
    '....0mmmmmm0....',
    '....0mmmmmm0....',
    '....0WW00WW0....',
    '....000..000....',
  ],
  merchant: [
    '....00000000....',
    '...0gggggggg0...',
    '...0gppppppg0...',
    '...0pp0pp0pp0...',
    '...0pppppppp0...',
    '....0ppRRpp0....',
    '..000gggggg000..',
    '.0gggyyyyyyggg0.',
    '.0gg0gggggg0gg0.',
    '.0pp0gggggg0pp0.',
    '..00.0gggg0.00..',
    '.....0g00g0.....',
    '....0WW00WW0....',
    '....000..000....',
    '................',
    '................',
  ],
  maiden: [
    '....00000000....',
    '...0rrrrrrrr0...',
    '...0rppppppo0...',
    '...0pp0pp0pp0...',
    '...0pppppppp0...',
    '....0ppRRpp0....',
    '...00rrrrrr00...',
    '..0rrr1111rrr0..',
    '..0pp0rrrr0pp0..',
    '...00.0rr0.00...',
    '....0rrrrrr0....',
    '...0rrrrrrrr0...',
    '...0111111110...',
    '....0pp00pp0....',
    '....000..000....',
    '................',
  ],
  townsman: [
    '....00000000....',
    '...0WWWWWWWW0...',
    '...0WppppppW0...',
    '...0pp0pp0pp0...',
    '...0pppppppp0...',
    '....0ppRRpp0....',
    '..000bbbbbb000..',
    '.0bbbbyyyybbbb0.',
    '.0bb0bbbbbb0bb0.',
    '.0pp0bbbbbb0pp0.',
    '..00.0bbbb0.00..',
    '.....0b00b0.....',
    '....0WW00WW0....',
    '....000..000....',
    '................',
    '................',
  ],
};

export function getNPCSprite(npcType = 'townsman', animFrame = 0) {
  const mat = NPC_MATRICES[npcType] || NPC_MATRICES.townsman;
  const rows = animFrame % 2 === 1 ? flipHorizontal(mat) : mat;
  return bakePixelMatrix(`npc_${npcType}_${animFrame % 2}`, rows);
}

// ============================================================================
// 3. FIRST-PERSON BATTLE MONSTER SPRITES (Crisp 8-bit Pixel Art)
// ============================================================================

const MONSTER_MATRICES = {
  slime: [
    '................................',
    '................................',
    '................................',
    '................................',
    '...............00...............',
    '..............0cc0..............',
    '.............0cbcc0.............',
    '............0ccbbbc0............',
    '...........0ccbbbbbc0...........',
    '..........0ccbbbbbbbc0..........',
    '........00cbbbbbbbbbbc00........',
    '......00ccbbbbbbbbbbbbcc00......',
    '.....0ccbbbbbbbbbbbbbbbbcc0.....',
    '....0cbbbb111bbbbbb111bbbbc0....',
    '...0cbbbb11011bbbb11011bbbbc0...',
    '...0cbbbb11011bbbb11011bbbbc0...',
    '...0cbbbb11011bbbb11011bbbbc0...',
    '..0cbbbbbb111bbbbbb111bbbbbbc0..',
    '..0cbbbbbbbbbbbbbbbbbbbbbbbbc0..',
    '..0cbbbbbbbbbbbbbbbbbbbbbbbbc0..',
    '..0cbbbbbb0bbbbbbbbbb0bbbbbbc0..',
    '..0cbbbbbbb0000000000bbbbbbbc0..',
    '...0cbbbbbbbrrrrrrrrbbbbbbbc0...',
    '...00bbbbbbbbbbbbbbbbbbbbbb00...',
    '....00BBBBBBBBBBBBBBBBBBBB00....',
    '......00000000000000000000......',
    '................................',
    '................................',
    '................................',
    '................................',
    '................................',
    '................................',
  ],

  drakee: [
    '................................',
    '................................',
    '....00....................00....',
    '...0mm0..................0mm0...',
    '..0mMMm0.....00..00.....0mMMm0..',
    '..0mMMM0....0mm00mm0....0MMMm0..',
    '.0mMMMMm0..0mMMMMMMm0..0mMMMMm0.',
    '.0mMMMm0000mMMMMMMMMm0000mMMMm0.',
    '0mMMm00mmmmMMMMMMMMMMmmmm00mMMm0',
    '0mMm0mMMMMMM11MMMM11MMMMMMm0mMm0',
    '0mm0mMMMMMM101MMMM101MMMMMMm0mm0',
    '0mm0mMMMMMM101MMMM101MMMMMMm0mm0',
    '0000mMMMMMMM11MMMM11MMMMMMMm0000',
    '...0mMMMMMMMMMMMMMMMMMMMMMMm0...',
    '...0mMMMMMM0100000010MMMMMMm0...',
    '....0MMMMMM0rrrrrrrr0MMMMMM0....',
    '....0mMMMMMM00000000MMMMMMm0....',
    '.....0mMMMMMMMMMMMMMMMMMMm0.....',
    '.....0mMMMMMMMMMMMMMMMMMMm0.....',
    '......00mmmmMMMMMMMMmmmm00......',
    '........00mm00000000mm00........',
    '.........0yy0......0yy0.........',
    '.........0yy0......0yy0.........',
    '........0y00y0....0y00y0........',
    '........0....0....0....0........',
    '................................',
    '................................',
    '................................',
    '................................',
    '................................',
    '................................',
    '................................',
  ],

  ghost: [
    '................................',
    '...........0000000000...........',
    '........000cccccccccc000........',
    '......00cc111111111111cc00......',
    '.....0cc1111111111111111cc0.....',
    '....0c11111111111111111111c0....',
    '...0c1111110011111100111111c0...',
    '...0c111110rr011110rr011111c0...',
    '..0c1111110rr011110rr0111111c0..',
    '..0c1111110rr011110rr0111111c0..',
    '..0c111111100111111001111111c0..',
    '..0c111111111111111111111111c0..',
    '..0c111110000000000000011111c0..',
    '..0c111101101101101101101111c0..',
    '..0c111101101101101101101111c0..',
    '..0c111110000000000000011111c0..',
    '..0c111111111111111111111111c0..',
    '..0c111111111111111111111111c0..',
    '...0c1111111111111111111111c0...',
    '...0c11cc11111cccc11111cc11c0...',
    '..0c110..0c110....011c0..011c0..',
    '..0c110..0c110....011c0..011c0..',
    '..0100....010......010....0010..',
    '..00.......0........0.......00..',
    '................................',
    '................................',
    '................................',
    '................................',
    '................................',
    '................................',
    '................................',
    '................................',
  ],

  magician: [
    '............00000000............',
    '..........00mmmmmmmm00..........',
    '.........0mmmmmmmmmmmm0.........',
    '........0mmmmmmmmmmmmmm0........',
    '.......0mmmmmmm00mmmmmmm0.......',
    '......0mmmmm00pppp00mmmmm0......',
    '......0mmmm0py0000yp0mmmm0......',
    '......0mmmm0p0rr0rr0p0mmm0......',
    '......0mmmm0p0rr0rr0p0mmm0......',
    '......0mmmm0pppppppp0mmmm0......',
    '.....00mmmmmm000000mmmmmm00.....',
    '....0mMMMMmmmmmmmmmmmmMMMMm0....',
    '...0mMMMMMmmmm1111mmmmMMMMMm0...',
    '..0mMM0MMMmmm1y11y1mmmMMM0MMm0..',
    '..0mm00MMMmmmm1111mmmmMMM00mm0..',
    '..0yy00MMMMMMMMMMMMMMMMMM00yy0..',
    '..0y0.0MMMMMMMMMMMMMMMMMM0.0y0..',
    '..0y0.0MMMMMMMMMMMMMMMMMM0.0y0..',
    '..0y0.0MMMMMMMMMMMMMMMMMM0.0y0..',
    '..0W0.0MMMMMMMMMMMMMMMMMM0.0W0..',
    '..0W0.0MMMMMMMMMMMMMMMMMM0.0W0..',
    '..0W0.0MMMMMMMMMMMMMMMMMM0.0W0..',
    '..0W0.0MMMMMMMMMMMMMMMMMM0.0W0..',
    '..0W0.0mMMMMMMMMMMMMMMMMm0.0W0..',
    '..0W0.0mMMMMMMMMMMMMMMMMm0.0W0..',
    '..0W0.00000000000000000000.0W0..',
    '..000..0WW0..........0WW0..000..',
    '.......0WW0..........0WW0.......',
    '......00000..........00000......',
    '................................',
    '................................',
    '................................',
  ],

  scorpion: [
    '................................',
    '........000..........000........',
    '......00ooo0........0ooo00......',
    '.....0oo00oo0......0oo00oo0.....',
    '.....0o0..0o0......0o0..0o0.....',
    '....0oo0..0oo0....0oo0..0oo0....',
    '....0oo0...0o000000o0...0oo0....',
    '.....000..0oooooooooo0..000.....',
    '......00.0oRRRRooRRRRo0.00......',
    '....00oo0oRoo00oo00ooRo0oo00....',
    '...0oo000oR0100oo0010Ro000oo0...',
    '...0oo000oR0100oo0010Ro000oo0...',
    '..0oo0...0oRRRRRRRRRRo0...0oo0..',
    '.0oo0..00.0oooooooooo0.00..0oo0.',
    '.000..0o0..0RRRRRRRR0..0o0..000.',
    '.....0o0...0oooooooo0...0o0.....',
    '....0o0....0oRRRRRRo0....0o0....',
    '....00......0oooooo0......00....',
    '.............0oRR0o0............',
    '.............0oRR0o0............',
    '..............0oo00o0...........',
    '...............0000yo0..........',
    '..................0yy0..........',
    '...................00...........',
    '................................',
    '................................',
    '................................',
    '................................',
    '................................',
    '................................',
    '................................',
    '................................',
  ],

  skeleton: [
    '...........0000000000...........',
    '.........00111111111100.........',
    '........0111111111111110........',
    '.......011111111111111110.......',
    '.......011000111111000110.......',
    '.......011000110011000110.......',
    '.......011000110011000110.......',
    '........0111111001111110........',
    '.........01101010101010.........',
    '..........000000000000..........',
    '...010....011011110110....000...',
    '...010..0011111111111100.01110..',
    '...010.01100111111110011011110..',
    '...010.010..01111110..0101100...',
    '...010.010..01011010..01000.....',
    '..0yyy0010..01111110..010.......',
    '...0w0.00...01011010...00.......',
    '...0w0......01111110............',
    '...000.....0110000110...........',
    '...........0110..0110...........',
    '..........0110....0110..........',
    '..........0110....0110..........',
    '.........0110......0110.........',
    '.........0110......0110.........',
    '........01110......01110........',
    '........00000......00000........',
    '................................',
    '................................',
    '................................',
    '................................',
    '................................',
    '................................',
  ],

  warlock: [
    '............00000000............',
    '..........00RRRRRRRR00..........',
    '.........0RRRRRRRRRRRR0.........',
    '........0RRRRRRRRRRRRRR0........',
    '.......0RRRRRRR00RRRRRRR0.......',
    '......0RRRRR00pppp00RRRRR0......',
    '......0RRRR0p00yy00p0RRRR0......',
    '......0RRRR0p0rr0rr0p0RRR0......',
    '......0RRRR0p0rr0rr0p0RRR0......',
    '......0RRRR0pppppppp0RRRR0......',
    '.....00RRRRRR000000RRRRRR00.....',
    '....0RddddRRRRRRRRRRRRddddR0....',
    '...0RdddddRRRRyyyyRRRRdddddR0...',
    '..0Rdd0dddRRRyyyyyyRRRddd0ddR0..',
    '..0dd00dddRRRRyyyyRRRRddd00dd0..',
    '..0cc00dddddddddddddddddd00cc0..',
    '..0c0.0dddddddddddddddddd0.0c0..',
    '..0W0.0dddddddddddddddddd0.0W0..',
    '..0W0.0dddddddddddddddddd0.0W0..',
    '..0W0.0dddddddddddddddddd0.0W0..',
    '..0W0.0dddddddddddddddddd0.0W0..',
    '..0W0.0RddddddddddddddddR0.0W0..',
    '..0W0.0RddddddddddddddddR0.0W0..',
    '..0W0.00000000000000000000.0W0..',
    '..000..0WW0..........0WW0..000..',
    '.......0WW0..........0WW0.......',
    '......00000..........00000......',
    '................................',
    '................................',
    '................................',
    '................................',
    '................................',
  ],

  goldman: [
    '..........000000000000..........',
    '........00yyyyyyyyyyyy00........',
    '.......0yyyy1111yyyyyyyy0.......',
    '......0yyy11yyyyyyyyyyyyy0......',
    '......0yy000yyyyyyyy000yy0......',
    '......0yy0r0yyyyyyyy0r0yy0......',
    '......0yy0r0yyyyyyyy0r0yy0......',
    '......0yyyyyyyy00yyyyyyyy0......',
    '....000yyyy0000000000yyyy000....',
    '..00yyyyyyyyyyyyyyyyyyyyyyyy00..',
    '.0yyy11yyyyyyyyYYYYyyyyyyyyyyy0.',
    '0yyy11yyyyyyyYYYYYYYYyyyyyyyyyy0',
    '0yyyyyyyyyyyYYYY11YYYYyyyyyyyyy0',
    '0yyyyyyyyyyyYYYY11YYYYyyyyyyyyy0',
    '0yyyy00yyyyyyYYYYYYYYyyyy00yyyy0',
    '0yyy0..0yyyyyyYYYYYYyyyy0..0yyy0',
    '0yy0....0yyyyyyyyyyyyyy0....0yy0',
    '0yy0....0yyyyyyyyyyyyyy0....0yy0',
    '000.....0yyyy000000yyyy0.....000',
    '........0yyy0......0yyy0........',
    '........0yyy0......0yyy0........',
    '.......0yyyy0......0yyyy0.......',
    '.......0yyyy0......0yyyy0.......',
    '.......0YYYY0......0YYYY0.......',
    '.......000000......000000.......',
    '................................',
    '................................',
    '................................',
    '................................',
    '................................',
    '................................',
    '................................',
  ],

  knight: [
    '...........0000000000...........',
    '.........00222222222200.........',
    '........0221111111111220........',
    '.......022112222222211220.......',
    '.......022200000000002220.......',
    '.......02220rr0220rr02220.......',
    '.......02220rr0220rr02220.......',
    '........0222222222222220........',
    '..010....00222222222200....000..',
    '..010..002222bbbbbb222200.02220.',
    '..010.02222bbbbbbbbbb22220211120',
    '..010.0220bbbbbyybbbbb022021y120',
    '..010.0220bbbbbyybbbbb022021y120',
    '..010.020.0bbbbbbbbbb0.020211120',
    '.0yyy000..0bbbbbbbbbb0..0002220.',
    '..0w0.....022220022220.....000..',
    '..0w0.....022220022220..........',
    '..000....02220....02220.........',
    '.........02220....02220.........',
    '.........0220......0220.........',
    '........02220......02220........',
    '........02220......02220........',
    '........03330......03330........',
    '........00000......00000........',
    '................................',
    '................................',
    '................................',
    '................................',
    '................................',
    '................................',
    '................................',
    '................................',
  ],

  green_dragon: [
    '........0000............0000............',
    '.......0gggg0..........0gggg0...........',
    '......0ggllgg0..0000..0ggllgg0..........',
    '.....0gglGGGlgg0yyyy0gglGGGlg0..........',
    '....0gglGGGGGGg0GGGG0gGGGGGGlg0.........',
    '....0gGGGGGGGGgGllllGgGGGGGGGGg0........',
    '...0gGGG00GGG0GGGGGGGG0GGG00GGGg0.......',
    '...0gGG0rr0G0GG11GG11GG0G0rr0GGg0.......',
    '...0gGG0rr0G0GG11GG11GG0G0rr0GGg0.......',
    '...0gGGG00GGG0G0GGGG0G0GGG00GGGg0.......',
    '....0GGGGGGGGGGG0000GGGGGGGGGGG0........',
    '.....00GGGGGG1111111111GGGGGG00.........',
    '......0gGGGG1RRRRRRRRRR1GGGGg0..........',
    '.....0ggGGG01111111111110GGGgg0.........',
    '....0ggGGGG00ssssssssss00GGGGgg0........',
    '...0ggGGGGGG0ssGGGGGGss0GGGGGGgg0.......',
    '...0gGGGGGGG0ssGGGGGGss0GGGGGGGg0.......',
    '...0gGGGGGGG0ssssssssss0GGGGGGGg0.......',
    '....00GGGGGG0ssGGGGGGss0GGGGGG00........',
    '......00GGGG0ssssssssss0GGGG00..........',
    '.......0ggG00ssssssssss00Ggg0...........',
    '......0ggGG0.0000000000.0GGgg0..........',
    '.....011110..............011110.........',
    '........................................',
    '........................................',
    '........................................',
    '........................................',
    '........................................',
    '........................................',
    '........................................',
    '........................................',
    '........................................',
    '........................................',
    '........................................',
    '........................................',
    '........................................',
    '........................................',
    '........................................',
    '........................................',
    '........................................',
  ],

  golem: [
    '.........00000000000000.........',
    '.......00WWWWWWWWWWWWWW00.......',
    '......0WWssssWWssssWWssss0......',
    '.....0WssWWWWssWWWWssWWWWs0.....',
    '.....0W0000WWssssssWW0000W0.....',
    '.....0W0rr0WWssssssWW0rr0W0.....',
    '.....0W0rr0WWssssssWW0rr0W0.....',
    '.....0WssssWWWW00WWWWssssW0.....',
    '....000WWWWWW000000WWWWWW000....',
    '..00WWWWWWssssssssssssWWWWWW00..',
    '.0WWssssWWssWWWWWWWWssWWssssWW0.',
    '0WWsWWWWWWssWWWWWWWWssWWWWWWsWW0',
    '0WWsWWWWWWssssssssssssWWWWWWsWW0',
    '0WWsWWWWWWssssssssssssWWWWWWsWW0',
    '0WWs00WWWWWWssssssssWWWWWW00sWW0',
    '0WW0..0WWWWW00000000WWWWW0..0WW0',
    '0WW0..0WWsss0......0sssWW0..0WW0',
    '000...0Wssss0......0ssssW0...000',
    '......0WWsss0......0sssWW0......',
    '.....0WWssss0......0ssssWW0.....',
    '.....0WWssss0......0ssssWW0.....',
    '.....0WWWWWW0......0WWWWWW0.....',
    '.....00000000......00000000.....',
    '................................',
    '................................',
    '................................',
    '................................',
    '................................',
    '................................',
    '................................',
    '................................',
    '................................',
  ],

  dragonlord_1: [
    '..........0000....0000..........',
    '.........0yyyy0000yyyy0.........',
    '........0yMMMMmMMmMMMMy0........',
    '.......0mmMMMMMMMMMMMMmm0.......',
    '......0mmMM00pppppp00MMmm0......',
    '......0mmM0p0rr00rr0p0Mmm0......',
    '......0mmM0p0rr00rr0p0Mmm0......',
    '......0mmM0pppp00pppp0Mmm0......',
    '.....00mmMM00pppppp00MMmm00.....',
    '....0mMMMMm0000000000mMMMMm0....',
    '...0mMMMMMMmmmyyyyymmMMMMMMm0...',
    '..0mMM0MMMMmmyyyyyymmmMMMM0MMm0.',
    '..0mm00MMMMmmyyrrryymmMMMM00mm0.',
    '..010.0MMMMMMMMMMMMMMMMMM0.010..',
    '..0y0.0MMMMMMMMMMMMMMMMMM0.0y0..',
    '..0y0.0mMMMMMMMMMMMMMMMMm0.0y0..',
    '..0y0.0mMMMMMMMMMMMMMMMMm0.0y0..',
    '..0y0.0mMMMMMMMMMMMMMMMMm0.0y0..',
    '..0y0.0mMMMMMMMMMMMMMMMMm0.0y0..',
    '..0W0.0mMMMMMMMMMMMMMMMMm0.0W0..',
    '..0W0.0mMMMMMMMMMMMMMMMMm0.0W0..',
    '..0W0.0mMMMMMMMMMMMMMMMMm0.0W0..',
    '..0W0.00000000000000000000.0W0..',
    '..000..0WW0..........0WW0..000..',
    '.......0WW0..........0WW0.......',
    '......00000..........00000......',
    '................................',
    '................................',
    '................................',
    '................................',
    '................................',
    '................................',
  ],

  dragonlord_2: [
    '........00....................00........',
    '.......0yy0...000......000...0yy0.......',
    '......0yyMM0.0yy0..00..0yy0.0MMyy0......',
    '.....0MMmmMM00yMM00mm00MMy00MMmmMM0.....',
    '....0mMMmmMMMmmMMmmMMmmMMmmMMMmmMMm0....',
    '...0mMMm0mmMMMMMMMMMMMMMMMMMMmm0mMMm0...',
    '..0mMMm0mMMMMM00MMMMMMMM00MMMMMm0mMMm0..',
    '..0mmM0mMMMM0rr0MMMMMM0rr0MMMMm0Mmmm0...',
    '..0mmM0mMMMM0rr0MMMMMM0rr0MMMMm0Mmmm0...',
    '..00000mMMMMM00MMMMMMMM00MMMMMm000000...',
    '.......0mMMMMMMMMMM00MMMMMMMMMMm0.......',
    '......0mmMMMMM111111111111MMMMMmm0......',
    '.....0mMMMMMM01rrrrrrrrrr10MMMMMMm0.....',
    '.....0mMMMMMM01111111111110MMMMMMm0.....',
    '......0mMMMMM00mmmmmmmmmm00MMMMMm0......',
    '......0mMMMMMM0mmMMMMMMmm0MMMMMMm0......',
    '......0mMMMMMM0mmMMMMMMmm0MMMMMMm0......',
    '.......0mMMMMM0mmMMMMMMmm0MMMMMm0.......',
    '.......0mMMMMM00mmmmmmmm00MMMMMm0.......',
    '........00MMMM0mmMMMMMMmm0MMMM00........',
    '.........0mMMM00mmmmmmmm00MMMm0.........',
    '.........0mMM0..00000000..0MMm0.........',
    '........011110............011110........',
    '........................................',
    '........................................',
    '........................................',
    '........................................',
    '........................................',
    '........................................',
    '........................................',
    '........................................',
    '........................................',
    '........................................',
    '........................................',
    '........................................',
    '........................................',
    '........................................',
    '........................................',
    '........................................',
    '........................................',
  ],
};

// Palette overrides for variant monsters that share silhouettes
const MONSTER_OVERRIDES = {
  red_slime: { base: 'slime', map: { 'b': '#f83800', 'B': '#a81000', 'c': '#f87858' } },
  axe_knight: { base: 'knight', map: { 'b': '#a81000', '2': '#7c7c7c', '1': '#bcbcbc' } },
  blue_dragon: { base: 'green_dragon', map: { 'g': '#0058f8', 'G': '#0000bc', 'l': '#3cbcfc' } },
};

export function getMonsterCanvas(type = 'slime') {
  const key = `monster_${type}`;
  if (spriteCache.has(key)) return spriteCache.get(key);

  const override = MONSTER_OVERRIDES[type];
  if (override) {
    const matrix = MONSTER_MATRICES[override.base];
    return bakePixelMatrix(key, matrix, override.map);
  }

  const matrix = MONSTER_MATRICES[type] || MONSTER_MATRICES.slime;
  return bakePixelMatrix(key, matrix);
}
