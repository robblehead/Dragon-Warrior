// Authentic NES 256x240 PPU-Style Tile & Sprite Renderer
import { getTileCanvas, getHeroSprite, getNPCSprite, getMonsterCanvas } from './pixelArt.js';

export const NES_WIDTH = 256;
export const NES_HEIGHT = 240;
export const TILE_SIZE = 16;

export class NESRenderer {
  constructor(canvasId = 'nes-canvas') {
    this.canvas = typeof document !== 'undefined' ? document.getElementById(canvasId) : null;
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    if (this.ctx) {
      this.ctx.imageSmoothingEnabled = false;
    }

    this.animTimer = 0;
    this.animFrame = 0;

    // PPU screen flash overlay state
    this.flashColor = null;
    this.flashTimer = 0;
    this.flashInterval = 0;
    this.rainbowFlash = false;

    // Monster combat blink state
    this.monsterBlinkTimer = 0;
  }

  triggerFlash(color = '#fcfcfc', durationMs = 260, isRainbow = false) {
    this.flashColor = color;
    this.flashTimer = durationMs / 1000;
    this.flashInterval = 0;
    this.rainbowFlash = isRainbow;
  }

  triggerMonsterBlink(durationMs = 420) {
    this.monsterBlinkTimer = durationMs / 1000;
  }

  update(dt) {
    this.animTimer += dt;
    if (this.animTimer >= 0.35) {
      this.animTimer -= 0.35;
      this.animFrame = (this.animFrame + 1) % 2;
    }

    if (this.flashTimer > 0) {
      this.flashTimer -= dt;
      this.flashInterval += dt;
      if (this.flashTimer <= 0) {
        this.flashTimer = 0;
        this.flashColor = null;
        this.rainbowFlash = false;
      }
    }

    if (this.monsterBlinkTimer > 0) {
      this.monsterBlinkTimer = Math.max(0, this.monsterBlinkTimer - dt);
    }
  }

  /**
   * Renders the active tilemap, NPCs, bosses, Hero, dungeon darkness mask, and PPU flashes.
   */
  renderWorld(game) {
    const ctx = this.ctx;
    if (!ctx || !game || !game.currentMap) return;

    const map = game.currentMap;
    const player = game.player;

    ctx.imageSmoothingEnabled = false;

    // Clear with map default background (WATER for overworld, black VOID indoors)
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, NES_WIDTH, NES_HEIGHT);

    // Hero pixel coordinates (including smooth step interpolation)
    const heroPxX = player.renderX * TILE_SIZE;
    const heroPxY = player.renderY * TILE_SIZE;

    // Center hero sprite at (120, 112) in 256x240 viewport
    const camX = Math.round(heroPxX - (NES_WIDTH / 2 - TILE_SIZE / 2));
    const camY = Math.round(heroPxY - (NES_HEIGHT / 2 - TILE_SIZE / 2));

    const startCol = Math.floor(camX / TILE_SIZE);
    const endCol = startCol + Math.ceil(NES_WIDTH / TILE_SIZE) + 1;
    const startRow = Math.floor(camY / TILE_SIZE);
    const endRow = startRow + Math.ceil(NES_HEIGHT / TILE_SIZE) + 1;

    // 1. Draw visible tile grid
    for (let row = startRow; row <= endRow; row++) {
      for (let col = startCol; col <= endCol; col++) {
        const screenX = col * TILE_SIZE - camX;
        const screenY = row * TILE_SIZE - camY;
        const tileId = game.getEffectiveTile(map, col, row);
        const tileCanvas = getTileCanvas(tileId, this.animFrame);
        if (tileCanvas) {
          ctx.drawImage(tileCanvas, screenX, screenY);
        }
      }
    }

    // 2. Draw NPCs on this map
    if (map.npcs) {
      for (const npc of map.npcs) {
        if (npc.isVisible && !npc.isVisible(game)) continue;
        const nx = npc.x * TILE_SIZE - camX;
        const ny = npc.y * TILE_SIZE - camY;
        if (nx > -TILE_SIZE && nx < NES_WIDTH && ny > -TILE_SIZE && ny < NES_HEIGHT) {
          const sprite = getNPCSprite(npc.sprite || 'townsman', this.animFrame);
          if (sprite) ctx.drawImage(sprite, nx, ny);
        }
      }
    }

    // 3. Draw Fixed Boss Encounters on map (e.g. Green Dragon, Golem, Axe Knight, Dragonlord)
    if (map.bosses) {
      for (const boss of map.bosses) {
        if (game.defeatedBosses.has(boss.id)) continue;
        const bx = boss.x * TILE_SIZE - camX;
        const by = boss.y * TILE_SIZE - camY;
        if (bx > -TILE_SIZE && bx < NES_WIDTH && by > -TILE_SIZE && by < NES_HEIGHT) {
          // On the map, bosses appear as menacing NPC/monster icons
          const sprite = getNPCSprite(boss.mapSprite || 'guard', this.animFrame);
          if (sprite) ctx.drawImage(sprite, bx, by);
        }
      }
    }

    // 4. Dungeon Darkness Mask (pitch black except light radius around hero)
    if (map.isDark) {
      const lightRadius = player.getLightRadius();
      const heroScreenX = Math.round(heroPxX - camX);
      const heroScreenY = Math.round(heroPxY - camY);

      if (lightRadius <= 0) {
        // Pitch black everywhere except Hero's 1x1 square
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, NES_WIDTH, heroScreenY);
        ctx.fillRect(0, heroScreenY + TILE_SIZE, NES_WIDTH, NES_HEIGHT - (heroScreenY + TILE_SIZE));
        ctx.fillRect(0, heroScreenY, heroScreenX, TILE_SIZE);
        ctx.fillRect(heroScreenX + TILE_SIZE, heroScreenY, NES_WIDTH - (heroScreenX + TILE_SIZE), TILE_SIZE);
      } else {
        const boxSize = (lightRadius * 2 + 1) * TILE_SIZE;
        const boxLeft = heroScreenX - lightRadius * TILE_SIZE;
        const boxTop = heroScreenY - lightRadius * TILE_SIZE;
        const boxRight = boxLeft + boxSize;
        const boxBottom = boxTop + boxSize;

        ctx.fillStyle = '#000000';
        // Top, bottom, left, right blackout rectangles framing the lit square
        if (boxTop > 0) ctx.fillRect(0, 0, NES_WIDTH, boxTop);
        if (boxBottom < NES_HEIGHT) ctx.fillRect(0, boxBottom, NES_WIDTH, NES_HEIGHT - boxBottom);
        if (boxLeft > 0) ctx.fillRect(0, Math.max(0, boxTop), boxLeft, boxSize);
        if (boxRight < NES_WIDTH) ctx.fillRect(boxRight, Math.max(0, boxTop), NES_WIDTH - boxRight, boxSize);
      }
    }

    // 5. Draw Hero Sprite at centered screen position
    const heroScreenX = Math.round(heroPxX - camX);
    const heroScreenY = Math.round(heroPxY - camY);
    const heroVariant = player.getSpriteVariant();
    const heroSprite = getHeroSprite(player.dir, player.stepFrame, heroVariant);
    if (heroSprite) {
      ctx.drawImage(heroSprite, heroScreenX, heroScreenY);
    }

    // 6. NES PPU Screen Flash Effect (alternating frames for authentic hardware flicker)
    if (this.flashTimer > 0) {
      const blinkOn = Math.floor(this.flashInterval * 24) % 2 === 0;
      if (blinkOn) {
        if (this.rainbowFlash) {
          const colors = ['#f83800', '#f8b800', '#00a800', '#3cbcfc', '#bc00bc', '#fcfcfc'];
          const idx = Math.floor(this.flashInterval * 18) % colors.length;
          ctx.fillStyle = colors[idx];
          ctx.globalAlpha = 0.55;
        } else {
          ctx.fillStyle = this.flashColor || '#fcfcfc';
          ctx.globalAlpha = 0.6;
        }
        ctx.fillRect(0, 0, NES_WIDTH, NES_HEIGHT);
        ctx.globalAlpha = 1.0;
      }
    }
  }

  /**
   * Renders the first-person monster pixel art into the combat portrait canvas.
   */
  renderCombatMonster(monsterType) {
    if (typeof document === 'undefined') return;
    const portraitCanvas = document.getElementById('combat-monster-canvas');
    if (!portraitCanvas) return;

    const pCtx = portraitCanvas.getContext('2d');
    pCtx.imageSmoothingEnabled = false;
    pCtx.fillStyle = '#000000';
    pCtx.fillRect(0, 0, portraitCanvas.width, portraitCanvas.height);

    // Blink off on alternate frames during hit effect
    if (this.monsterBlinkTimer > 0 && Math.floor(this.monsterBlinkTimer * 28) % 2 === 0) {
      return;
    }

    const sprite = getMonsterCanvas(monsterType);
    if (!sprite) return;

    // Integer scale 2x or 3x depending on sprite size so pixels stay razor-sharp
    const scale = sprite.width >= 40 ? 2 : 3;
    const drawW = sprite.width * scale;
    const drawH = sprite.height * scale;
    const dx = Math.floor((portraitCanvas.width - drawW) / 2);
    const dy = Math.floor((portraitCanvas.height - drawH) / 2);

    pCtx.drawImage(sprite, dx, dy, drawW, drawH);
  }
}
