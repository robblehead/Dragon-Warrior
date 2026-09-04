# Dragon Warrior 3D: Echoes of Alefgard 🗡️✨

A browser-native, single-level 3D action RPG reimagining of the original NES foundational classic **Dragon Warrior** (*Dragon Quest*), inspired directly by the original 1989 NES instruction manual and realized with a "Breath of the Wild" cel-shaded visual aesthetic.

Built with **Three.js** and **Vite**.

---

## 🌟 Features

- **Breath-of-the-Wild Caliber Visuals**: Custom Three.js cel-shading, dynamic 24-hour day/night sky with celestial transit and stars, instanced wind-swayed reactive grass (28,000+ blades) with wildflowers, shimmering water, and real-time volumetric lighting.
- **Akira Toriyama Character Art**: Detailed hero model of Erdrick with swept golden casque horns, sapphire crest, layered knight cuirass, dragon buckle, and dynamic combat-ready stances with sword and shield.
- **Seamless Single-Level Open World of Alefgard**:
  - **Tantegel Castle**: Royal throne room with vaulted timber ceiling, fluted marble colonnade, heraldic Erdrick tapestries, 3-tier stepped marble dais, the Golden Dragon Throne, King Lorik, palace guards, and the royal treasury vault.
  - **Town of Brecconary**: Half-timbered Tudor architecture, cobblestone plazas, Slime fountain, Garrick's Weaponsmith, Fiona's Alchemist, and The Travelers' Inn.
  - **Quagmire Poison Marsh & Dark Caverns**: Hazardous swamp, underground mountain caverns, torch lighting, ancient runes, and the Green Dragon holding Princess Gwaelin captive.
  - **Eastern Megaliths & Hot Springs**: Ancient stone henge guarding the Staff of Rain, and hidden Fairy Flute.
  - **Western Cape & Charlock Island**: Summon the celestial Rainbow Bridge with the Rainbow Drop and confront the Dragonlord in his obsidian sanctum!
- **Faithful Turn-Based & Cinematic Combat**:
  - Classic Dragon Warrior commands: `[FIGHT]`, `[SPELL]`, `[ITEM]`, `[RUN]`.
  - Spells: `HEAL`, `HURT`, `SLEEP`, `RADIANT`, `STOPSPELL`, `HEALMORE`, `HURTMORE`.
  - EXP, Gold, Level Progression, and balanced early monster scaling.
- **Interactive Mini-Games & Side Activities**:
  - Slime Archery Range target shooting gallery.
  - Lucky Lotto golden dice betting.
  - Campfire resting and herb alchemy.
  - Playable 5-note Fairy Flute instrument with secret melodies.
- **Procedural Symphonic Synthesizer**: Pure Web Audio API polyphonic retro orchestral arrangements of iconic Dragon Warrior themes.

---

## 🎮 Controls

| Key / Input | Action |
| :--- | :--- |
| **W, A, S, D** / **Arrow Keys** | Move Hero |
| **Mouse Drag** / **Right-Click Drag** | Orbit Camera (360° Free Look) |
| **Mouse Wheel** | Zoom In / Out |
| **Space** | Jump |
| **Shift** | Sprint |
| **[E]** | Interact / Talk / Open Chest / Shop / Play |
| **[F]** | Toggle Torch |
| **[R]** | Draw / Sheathe Erdrick's Sword |
| **[Tab]** or **[M]** | Inventory & Relics Menu |
| **[Escape]** | Close Menus / Step Back in Combat |
| **🔊 Audio Button** | Toggle Procedural Sound / Music |

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- npm

### Installation & Running Locally

```bash
# Clone the repository
git clone https://github.com/robblehead/Dragon-Warrior.git
cd Dragon-Warrior

# Install dependencies
npm install

# Start local dev server
npm run dev
```

Open your browser to `http://localhost:3000/` (or the port specified in terminal).

### Production Build

```bash
npm run build
npm run preview
```

---

## 📜 License
MIT License. Inspired by Dragon Warrior / Dragon Quest © Square Enix.
