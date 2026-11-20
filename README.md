# Dragon Warrior (NES Edition)

An authentic 8-bit recreation of the 1989 NES classic **Dragon Warrior** (*Dragon Quest*), built with a native 256×240 pixel-art HTML5 Canvas renderer and a Web Audio 2A03 APU chiptune synthesizer.

---

## Features

- **Authentic 256×240 NES Pixel Art Engine**:
  - 54-color NES hardware palette, 16×16 world & interior tiles, animated 2-frame water waves, and 2-frame directional character stepping sprites.
  - Dynamic Hero sprite states: unarmed, sword, sword & shield, and carrying Princess Gwaelin in arms.
  - True dungeon darkness mask: pitch-black caverns illuminated by a 3×3 `Torch` radius or decaying 7×7 `RADIANT` spell radius.
- **Classic NES Windowed Interface & Command Menu**:
  - Double-bordered black/white NES windows with low-HP red alert indicator.
  - Left Status window (`LV`, `HP`, `MP`, `G`, `E`), 2×4 `COMMAND` menu (`TALK`, `SPELL`, `STATUS`, `ITEM`, `STAIRS`, `DOOR`, `SEARCH`, `TAKE`), typewriter message box, and full `STATUS` sheet.
- **Faithful Alefgard World & Progression**:
  - Interconnected maps: Tantegel Castle (2F, 1F, Treasury Basement), Brecconary, Garinham, Kol, Rimuldar, Cantlin, Damdara Ruins, Mountain Cave, Swamp Cave, Shrine of Rain, Shrine of the Rainbow, and Charlock Castle.
  - Exact Level 1–30 stat curve, 10 classic spells (`HEAL` through `HURTMORE`), locked doors requiring Magic Keys, buried search relics (`Fairy Flute`, `Erdrick's Token`, `Erdrick's Armor`), and forging the `Rainbow Drop` to bridge Charlock Island.
- **First-Person Turn-Based NES Combat**:
  - Random terrain-weighted step encounters (`REPEL` and `Fairy Water` ward off weak foes).
  - First-person monster portrait frame with NES hit-blink and PPU screen flash effects.
  - Special boss mechanics: put the **Golem** to sleep with the `Fairy Flute`, defeat the **Green Dragon** to rescue Princess Gwaelin, and confront the **2-Phase Dragonlord** (Sorcerer offer -> True Dragon transformation).
- **2A03 Chiptune Audio**:
  - Dual Pulse (Square) + Triangle + Noise synthesizer playing chiptune scores and 8-bit sound effects.

---

## Controls

| Key / Input | Action |
| :--- | :--- |
| **Arrow Keys** / **W A S D** | Move Hero (tile-by-tile) / Navigate menu cursor |
| **Enter** / **Space** / **Z** / **E** | Open `COMMAND` menu / Confirm selection / Advance text |
| **Escape** / **X** / **Backspace** | Close menu / Step back |
| **M** | Mute / Unmute audio |
| **Mouse Click** | Click any menu option or message box directly |
| **SAVE Button** | Save progress to `localStorage` (`CONTINUE A QUEST` on title screen) |

---

## Getting Started

```bash
npm install
npm run dev
```

Run system tests and production build:

```bash
node test_game.js
npm run build
```
