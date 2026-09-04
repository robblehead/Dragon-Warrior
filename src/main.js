// Dragon Warrior 3D: Echoes of Alefgard - Master Game Orchestrator
import * as THREE from 'three';
import { soundEngine } from './audio/synth.js';
import { musicManager } from './audio/music.js';
import { DynamicSky } from './graphics/sky.js';
import { WindGrassField } from './graphics/grass.js';
import { StylizedWater } from './graphics/water.js';
import { ParticleSystem } from './graphics/particles.js';
import { AlefgardTerrain } from './world/terrain.js';
import { TantegelCastle } from './world/castle.js';
import { BrecconaryTown } from './world/town.js';
import { QuagmireCave } from './world/cave.js';
import { AlefgardShrines } from './world/shrine.js';
import { CharlockSanctum } from './world/charlock.js';
import { PlayerCharacter } from './entities/player.js';
import { NPCManager } from './entities/npcs.js';
import { MonsterFactory } from './entities/monsters.js';
import { CombatEngine } from './combat/combatEngine.js';
import { SlimeArcheryMiniGame } from './minigames/archery.js';
import { LuckyLottoMiniGame } from './minigames/lotto.js';
import { CampfireSystem } from './minigames/cooking.js';
import { FairyFluteInstrument } from './minigames/flute.js';
import { GameUI } from './ui/hud.js';

export class DragonWarriorGame {
  constructor() {
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.timer = new THREE.Timer();
    this.clock = this.timer;

    // Input state
    this.input = {
      horizontal: 0,
      vertical: 0,
      jump: false,
      sprint: false
    };

    // Camera Orbit State
    this.cameraYaw = 0;
    this.cameraPitch = 0.38;
    this.cameraDistance = 7.0;
    this.cameraInitialized = false;
    this.isDraggingMouse = false;
    this.previousMousePosition = { x: 0, y: 0 };

    this.activeInteraction = null;
    this.roamingMonsters = [];
    this.combatCooldown = 0;
    this.lastSwampDamageTime = 0;
    this.currentZone = 'castle';

    this.initEngine();
    this.initWorld();
    this.initInput();
    this.initMonsters();
    this.initUI();
    this.startLoop();
  }

  initEngine() {
    this.container = document.getElementById('canvas-container');
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x9bd4ff, 0.0075);

    this.camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 800);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.setClearColor(0x9bd4ff, 1.0);

    this.container.appendChild(this.renderer.domElement);

    window.addEventListener('resize', () => this.onWindowResize());
  }

  initWorld() {
    // 1. Sky & Lighting
    this.sky = new DynamicSky(this.scene);

    // 2. Open-World Terrain
    this.terrain = new AlefgardTerrain(this.scene);

    // 3. Instanced Wind-Swayed Grass & Wildflowers
    this.grass = new WindGrassField(this.scene, (x, z) => this.terrain.getHeight(x, z));

    // 4. Stylized Water
    this.water = new StylizedWater(this.scene);

    // 5. Atmospheric Particles
    this.particles = new ParticleSystem(this.scene);

    // 6. World Landmarks & Structures
    this.castle = new TantegelCastle(this.scene, this.terrain);
    this.town = new BrecconaryTown(this.scene, this.terrain);
    this.cave = new QuagmireCave(this.scene);
    this.shrines = new AlefgardShrines(this.scene, this.terrain);
    this.charlock = new CharlockSanctum(this.scene, this.terrain);

    // 7. Player Character
    this.player = new PlayerCharacter(this.scene, this.terrain);

    // 8. NPCs
    this.npcs = new NPCManager(this.scene, this.terrain);

    // 9. Combat Engine & Mini-Games
    this.combat = new CombatEngine(this);
    this.archeryGame = new SlimeArcheryMiniGame(this);
    this.lottoGame = new LuckyLottoMiniGame(this);
    this.campfireSystem = new CampfireSystem(this);
    this.fairyFlute = new FairyFluteInstrument(this);
  }

  initMonsters() {
    // Spawn roaming 3D monsters in the wild fields of Alefgard
    const spawns = [
      // Gentle Slimes right outside Tantegel Castle perimeter
      { type: 'slime', x: -6, z: -8 },
      { type: 'slime', x: 6, z: -8 },
      { type: 'slime', x: -14, z: 2 },
      { type: 'slime', x: 12, z: 4 },
      // Red Slimes in the outer fields
      { type: 'red_slime', x: -26, z: 12 },
      { type: 'red_slime', x: 32, z: 6 },
      // Drakees further south in the forest groves and crags
      { type: 'drakee', x: -22, z: 26 },
      { type: 'drakee', x: 12, z: 32 },
      // Skeletons patrolling near the swamp
      { type: 'skeleton', x: 34, z: 32 },
      { type: 'skeleton', x: 26, z: 40 }
    ];

    spawns.forEach(s => {
      let mMesh;
      if (s.type === 'slime') mMesh = MonsterFactory.createSlime(0x0284c7, false);
      else if (s.type === 'red_slime') mMesh = MonsterFactory.createSlime(0xdc2626, true);
      else if (s.type === 'drakee') mMesh = MonsterFactory.createDrakee();
      else if (s.type === 'skeleton') mMesh = MonsterFactory.createSkeleton();

      const groundY = this.terrain.getHeight(s.x, s.z);
      mMesh.position.set(s.x, groundY, s.z);
      this.scene.add(mMesh);

      this.roamingMonsters.push({
        mesh: mMesh,
        originX: s.x,
        originZ: s.z,
        data: mMesh.userData,
        patrolTimer: Math.random() * 10,
        respawnTimer: 0
      });
    });

    // 10. The Legendary Green Dragon in Quagmire Cave!
    this.greenDragonMesh = MonsterFactory.createGreenDragon();
    this.greenDragonMesh.position.set(65, 1.2, 51);
    this.greenDragonMesh.rotation.y = -Math.PI / 2.5;
    this.scene.add(this.greenDragonMesh);
    this.greenDragonDefeated = false;

    // 11. The Dragonlord atop Charlock Island!
    this.dragonlordMesh = MonsterFactory.createDragonlord();
    this.dragonlordMesh.position.set(-75, 7.2, -69);
    this.scene.add(this.dragonlordMesh);
    this.dragonlordDefeated = false;
  }

  initUI() {
    this.ui = new GameUI(this);
    window.gameInstance = this; // for HTML onclick helpers

    // Play starting Tantegel Castle theme
    musicManager.playTrack('castle');
    this.ui.updateHUD();

    // Welcome lore introduction toast
    setTimeout(() => {
      this.ui.showToast("Welcome to Alefgard, descendant of Erdrick! Speak with King Lorik in Tantegel Castle.");
    }, 1200);
  }

  initInput() {
    window.addEventListener('keydown', (e) => {
      soundEngine.init();
      soundEngine.resume();

      switch (e.code) {
        case 'KeyW': case 'ArrowUp': this.input.vertical = -1; break;
        case 'KeyS': case 'ArrowDown': this.input.vertical = 1; break;
        case 'KeyA': case 'ArrowLeft': this.input.horizontal = -1; break;
        case 'KeyD': case 'ArrowRight': this.input.horizontal = 1; break;
        case 'Space':
          this.input.jump = true;
          soundEngine.playSFX('jump');
          break;
        case 'ShiftLeft': case 'ShiftRight':
          this.input.sprint = true;
          break;
        case 'KeyE':
          this.triggerActiveInteraction();
          break;
        case 'KeyF':
          // Toggle Torch
          this.player.setTorchEquipped(!this.player.hasTorchEquipped);
          soundEngine.playSFX('menu_select');
          this.ui.showToast(this.player.hasTorchEquipped ? "Equipped blazing Torch!" : "Extinguished Torch.");
          break;
        case 'KeyR':
          // Draw or Sheathe Erdrick's Sword
          this.player.setWeaponDrawn(!this.player.isWeaponDrawn);
          soundEngine.playSFX('sword_attack');
          this.ui.showToast(this.player.isWeaponDrawn ? "Unsheathed Erdrick's Sword!" : "Sheathed Sword in Scabbard.");
          break;
        case 'Escape':
          if (this.combat.inCombat) {
            this.ui.closeCombatSubmenus();
          } else {
            this.ui.closeAllModals();
          }
          break;
      }
    });

    window.addEventListener('keyup', (e) => {
      switch (e.code) {
        case 'KeyW': case 'ArrowUp': if (this.input.vertical === -1) this.input.vertical = 0; break;
        case 'KeyS': case 'ArrowDown': if (this.input.vertical === 1) this.input.vertical = 0; break;
        case 'KeyA': case 'ArrowLeft': if (this.input.horizontal === -1) this.input.horizontal = 0; break;
        case 'KeyD': case 'ArrowRight': if (this.input.horizontal === 1) this.input.horizontal = 0; break;
        case 'Space': this.input.jump = false; break;
        case 'ShiftLeft': case 'ShiftRight': this.input.sprint = false; break;
      }
    });

    // Mouse Orbit Controls
    window.addEventListener('mousedown', (e) => {
      if (e.target.closest('button, input, select, textarea, .retro-panel, .modal-backdrop, .modal-card, .shop-row, .lotto-btn, .flute-btn, #combat-overlay')) return;
      this.isDraggingMouse = true;
      this.previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.isDraggingMouse) return;
      const deltaX = e.clientX - this.previousMousePosition.x;
      const deltaY = e.clientY - this.previousMousePosition.y;

      this.cameraYaw -= deltaX * 0.005;
      this.cameraPitch = Math.max(0.1, Math.min(1.2, this.cameraPitch + deltaY * 0.005));

      this.previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mouseup', () => {
      this.isDraggingMouse = false;
    });

    window.addEventListener('wheel', (e) => {
      this.cameraDistance = Math.max(4.5, Math.min(18.0, this.cameraDistance + e.deltaY * 0.01));
    });
  }

  startLoop() {
    const loop = () => {
      requestAnimationFrame(loop);
      if (this.timer && typeof this.timer.update === 'function') {
        this.timer.update();
      }
      const delta = (this.timer && typeof this.timer.getDelta === 'function') 
        ? Math.min(0.1, this.timer.getDelta()) 
        : 0.016;
      const time = (this.timer && typeof this.timer.getElapsed === 'function') 
        ? this.timer.getElapsed() 
        : performance.now() * 0.001;

      try {
        this.update(delta, time);
      } catch (err) {
        console.error("Game update error:", err);
      }
      try {
        this.render();
      } catch (err) {
        console.error("Game render error:", err);
      }
    };
    loop();
  }

  update(delta, time) {
    if (this.combat.inCombat) {
      // In combat: keep sky, grass, water, particles alive in background, and update HUD!
      this.sky.update(delta, this.player.position);
      this.grass.update(time, this.player.position, this.sky.sunDir);
      this.water.update(time, this.sky.sunDir);
      this.particles.update(delta, time, this.player.position, this.sky.timeOfDay < 0.22 || this.sky.timeOfDay > 0.78);
      this.ui.updateHUD();
      return;
    }

    // 1. Update Player
    this.player.update(delta, this.input, this.camera);

    // 2. Camera Follow & Orbit
    this.updateCamera();

    // 3. Update Sky & Day/Night
    this.sky.update(delta, this.player.position);

    // 4. Update Grass Wind
    this.grass.update(time, this.player.position, this.sky.sunDir);

    // 5. Update Water
    this.water.update(time, this.sky.sunDir);

    // 6. Update Particles
    const isNight = this.sky.timeOfDay < 0.22 || this.sky.timeOfDay > 0.78;
    this.particles.update(delta, time, this.player.position, isNight);

    // 7. Update Charlock & Rainbow Bridge
    this.charlock.update(time);

    // 8. Update Roaming Monsters
    this.updateMonsters(delta, time);

    // 9. Check Poison Swamp Hazard
    this.checkSwampHazard(time);

    // 10. Check Interactivity & Proximity
    this.checkInteractions();

    // 11. Zone detection & background music
    this.checkZoneAudio();

    // 12. Update UI
    this.ui.updateHUD();
  }

  updateCamera() {
    const p = this.player.position;
    const targetY = p.y + 1.6;

    // Calculate orbital position
    const offsetX = Math.sin(this.cameraYaw) * Math.cos(this.cameraPitch) * this.cameraDistance;
    const offsetY = Math.sin(this.cameraPitch) * this.cameraDistance;
    const offsetZ = Math.cos(this.cameraYaw) * Math.cos(this.cameraPitch) * this.cameraDistance;

    const desiredCamPos = new THREE.Vector3(p.x + offsetX, targetY + offsetY, p.z + offsetZ);

    // Smooth camera interpolation (instant on first frame)
    if (!this.cameraInitialized) {
      this.camera.position.copy(desiredCamPos);
      this.cameraInitialized = true;
    } else {
      this.camera.position.lerp(desiredCamPos, 0.14);
    }
    this.camera.lookAt(p.x, targetY, p.z);
  }

  updateMonsters(delta, time) {
    const pPos = this.player.position;

    // Decrement combat cooldown grace period
    if (this.combatCooldown > 0) {
      this.combatCooldown -= delta;
    }

    // 1. Roaming Field Monsters
    this.roamingMonsters.forEach(m => {
      // Handle respawn if defeated
      if (m.respawnTimer > 0) {
        m.respawnTimer -= delta;
        if (m.respawnTimer <= 0) {
          m.mesh.visible = true;
          m.mesh.position.set(m.originX, this.terrain.getHeight(m.originX, m.originZ), m.originZ);
        } else {
          m.mesh.visible = false;
          return;
        }
      }

      m.patrolTimer += delta;
      // Gentle patrol hop / wander
      const wanderAngle = m.patrolTimer * 0.4;
      const targetX = m.originX + Math.cos(wanderAngle) * 3.5;
      const targetZ = m.originZ + Math.sin(wanderAngle) * 3.5;

      m.mesh.position.x = THREE.MathUtils.lerp(m.mesh.position.x, targetX, delta * 1.2);
      m.mesh.position.z = THREE.MathUtils.lerp(m.mesh.position.z, targetZ, delta * 1.2);
      m.mesh.position.y = this.terrain.getHeight(m.mesh.position.x, m.mesh.position.z) + Math.abs(Math.sin(time * 3.0)) * 0.35;

      // Drakee wing flapping
      if (m.data.wingL) {
        m.data.wingL.rotation.z = Math.sin(time * 12) * 0.4;
        m.data.wingR.rotation.z = -Math.sin(time * 12) * 0.4;
      }

      // Check encounter collision with player
      const dist = Math.hypot(pPos.x - m.mesh.position.x, pPos.z - m.mesh.position.z);
      if (dist < 1.8 && this.combatCooldown <= 0 && !this.combat.inCombat && !this.ui.isDialogueActive()) {
        this.combat.startEncounter(m.data, false, m);
      }
    });

    // 2. Boss: Green Dragon in Cave
    if (!this.greenDragonDefeated && this.greenDragonMesh) {
      const distDragon = pPos.distanceTo(this.greenDragonMesh.position);
      if (distDragon < 4.5 && this.combatCooldown <= 0 && !this.combat.inCombat && !this.ui.isDialogueActive()) {
        this.combat.startEncounter(this.greenDragonMesh.userData, true);
      }
    }

    // 3. Final Boss: Dragonlord
    if (!this.dragonlordDefeated && this.dragonlordMesh) {
      const distDL = pPos.distanceTo(this.dragonlordMesh.position);
      if (distDL < 6.5 && this.combatCooldown <= 0 && !this.combat.inCombat && !this.ui.isDialogueActive()) {
        this.combat.startEncounter(this.dragonlordMesh.userData, true);
      }
    }
  }

  checkSwampHazard(time) {
    const p = this.player.position;
    const distToSwamp = Math.hypot(p.x - 45, p.z - 35);

    if (distToSwamp < 16.0) {
      // In the deadly poison swamp!
      if (time - this.lastSwampDamageTime > 1.4) {
        this.lastSwampDamageTime = time;
        soundEngine.playSFX('swamp_damage');
        this.player.stats.hp = Math.max(1, this.player.stats.hp - 2);
        this.ui.triggerPlayerDamageFlash();
        this.ui.showToast("The noxious swamp burns thy flesh! -2 HP!");
      }
    }
  }

  checkZoneAudio() {
    const p = this.player.position;
    let newZone = 'overworld';

    const dCastle = Math.hypot(p.x - 0, p.z - (-28));
    const dTown = Math.hypot(p.x - 45, p.z - (-10));
    const dCave = Math.hypot(p.x - 68, p.z - 48);

    if (dCastle < 17) newZone = 'castle';
    else if (dTown < 16) newZone = 'town';
    else if (dCave < 18 || p.x > 56) newZone = 'cave';
    else newZone = 'overworld';

    if (newZone !== this.currentZone) {
      this.currentZone = newZone;
      this.updateLocationMusic();
    }
  }

  updateLocationMusic() {
    if (this.combat.inCombat) return;
    musicManager.playTrack(this.currentZone);
  }

  checkInteractions() {
    const p = this.player.position;
    let nearest = null;
    let minDist = 3.2;

    // Check all interactive objects: Castle chests, NPCs, shops, cave tablet, shrines, campfires
    const candidateList = [
      ...this.castle.interactiveObjects,
      ...this.town.interactiveObjects,
      ...this.cave.interactiveObjects,
      ...this.shrines.interactiveObjects,
      ...this.charlock.interactiveObjects,
      ...this.npcs.npcs
    ];

    candidateList.forEach(obj => {
      const d = p.distanceTo(obj.position);
      if (d < minDist) {
        minDist = d;
        nearest = obj;
      }
    });

    this.activeInteraction = nearest;
    if (nearest) {
      let promptText = 'Interact';
      if (nearest.type === 'chest') promptText = nearest.isOpen ? 'Opened Chest' : `Open Chest (${nearest.itemName})`;
      else if (nearest.type === 'shop_weapon') promptText = 'Talk to Weaponsmith';
      else if (nearest.type === 'shop_item') promptText = 'Talk to Alchemist';
      else if (nearest.type === 'inn') promptText = 'Rest at the Inn';
      else if (nearest.type === 'minigame_archery') promptText = 'Play Slime Archery';
      else if (nearest.type === 'minigame_lotto') promptText = 'Play Lucky Lotto';
      else if (nearest.type === 'campfire') promptText = 'Rest / Cook at Campfire';
      else if (nearest.type === 'shrine_rain') promptText = nearest.isTaken ? 'Rain Shrine Altar' : 'Claim Staff of Rain';
      else if (nearest.type === 'dig_flute') promptText = nearest.isDug ? 'Dug Soft Earth' : 'Dig in Soft Earth';
      else if (nearest.type === 'tablet') promptText = "Read Erdrick's Tablet";
      else if (nearest.type === 'charlock_cape') promptText = this.charlock.bridgeBuilt ? 'Rainbow Bridge' : 'Raise Rainbow Drop';
      else if (nearest.name) promptText = `Speak to ${nearest.name}`;

      this.ui.showInteractionPrompt(promptText);
    } else {
      this.ui.hideInteractionPrompt();
    }
  }

  triggerActiveInteraction() {
    if (!this.activeInteraction) return;
    const item = this.activeInteraction;

    // 1. Treasure Chest
    if (item.type === 'chest') {
      if (!item.isOpen) {
        item.isOpen = true;
        if (item.lidGroup) item.lidGroup.rotation.x = -Math.PI / 2.2;
        soundEngine.playSFX('chest_open');

        if (item.itemId === 'gold_120') {
          this.player.stats.gold += 120;
          this.ui.showToast("Thou hast discovered 120 Gold Coins!");
        } else if (item.itemId === 'torch') {
          this.player.inventory.torches += 2;
          this.player.setTorchEquipped(true);
          this.ui.showToast("Discovered 2 Torches! Equipped torch to light dark caves.");
        } else if (item.itemId === 'magic_key') {
          this.player.inventory.magicKeys += 1;
          this.player.inventory.sunstone = true; // Also unlocks Sunstone in Tantegel!
          this.ui.showToast("Found a Magic Key and the radiant Sunstone of Tantegel!");
        } else if (item.itemId === 'erdrick_ring') {
          this.player.inventory.erdrickRing = true;
          this.player.stats.defense += 6;
          this.ui.showToast("Discovered Erdrick's Ring! Defense increased by +6!");
        }
        this.ui.updateHUD();
      } else {
        this.ui.showToast("The chest is empty.");
      }
    }

    // 2. NPC Dialogue
    else if (item.getDialogue) {
      soundEngine.playSFX('menu_select');
      const lines = item.getDialogue(this.player);

      this.ui.showDialogue(item.name, lines, () => {
        // Dialogue end triggers
        if (item.id === 'king_lorik' && this.player.isCarryingPrincess) {
          // Delivered Princess to King Lorik!
          this.player.setCarryingPrincess(false);
          this.player.inventory.gwaelinLove = true;
          this.player.stats.gold += 300;
          this.player.addExp(200);
          soundEngine.playSFX('level_up');
          this.ui.showToast("King Lorik bestowed royal favor and Gwaelin's Love upon thee!");
          this.ui.updateHUD();
        } else if (item.id === 'princess_gwaelin' && !this.npcs.princessGwaelin.isRescued) {
          // Rescued Princess from cave!
          this.npcs.princessGwaelin.isRescued = true;
          this.npcs.princessGwaelin.group.visible = false;
          this.player.setCarryingPrincess(true);
          soundEngine.playSFX('chest_open');
          this.ui.showToast("Thou art now carrying Princess Gwaelin in thy arms! Bring her home to King Lorik!");
        }
      });
    }

    // 3. Shops & Inn
    else if (item.type === 'shop_weapon') {
      soundEngine.playSFX('menu_select');
      this.ui.showShopModal('weapon');
    } else if (item.type === 'shop_item') {
      soundEngine.playSFX('menu_select');
      this.ui.showShopModal('item');
    } else if (item.type === 'inn') {
      soundEngine.playSFX('menu_select');
      this.ui.showInnModal();
    }

    // 4. Mini-Games
    else if (item.type === 'minigame_archery') {
      this.archeryGame.start();
    } else if (item.type === 'minigame_lotto') {
      this.ui.showLottoModal();
    } else if (item.type === 'campfire') {
      this.ui.showCampfireModal();
    }

    // 5. Rain Shrine Altar
    else if (item.type === 'shrine_rain') {
      if (!item.isTaken) {
        item.isTaken = true;
        if (item.staffGroup) item.staffGroup.visible = false;
        this.player.inventory.staffOfRain = true;
        soundEngine.playSFX('level_up');
        this.particles.spawnSpellBurst(item.position, 'radiant');
        this.ui.showToast("Thou hast acquired the sacred Staff of Rain!");
        this.checkRainbowDropCraft();
      }
    }

    // 6. Kol Hot Spring Digging
    else if (item.type === 'dig_flute') {
      if (!item.isDug) {
        item.isDug = true;
        this.player.inventory.fairyFlute = true;
        soundEngine.playSFX('chest_open');
        this.ui.showToast("Dug beneath the hot springs... Discovered the ancient Fairy Flute!");
        this.ui.showFluteModal();
      }
    }

    // 7. Erdrick's Tablet
    else if (item.type === 'tablet') {
      soundEngine.playSFX('menu_select');
      this.ui.showDialogue(item.name, [item.text]);
    }

    // 8. Western Cape & Rainbow Drop
    else if (item.type === 'charlock_cape') {
      if (this.charlock.bridgeBuilt) {
        this.ui.showToast("The Rainbow Bridge shines brilliantly across the abyss to Charlock!");
      } else if (this.player.inventory.rainbowDrop) {
        // Epic Rainbow Bridge Cutscene!
        soundEngine.playSFX('level_up');
        this.particles.spawnSpellBurst(item.position, 'radiant');
        this.charlock.buildRainbowBridge();
        this.ui.showToast("The Rainbow Drop shines with celestial light! A shimmering rainbow bridge spans the strait!");
      } else {
        this.ui.showToast("The dark volcanic isle of Charlock looms across the foggy water. Thou needst the Rainbow Drop to span the sea!");
      }
    }
  }

  checkRainbowDropCraft() {
    const inv = this.player.inventory;
    if (inv.sunstone && inv.staffOfRain && !inv.rainbowDrop) {
      inv.rainbowDrop = true;
      setTimeout(() => {
        soundEngine.playSFX('level_up');
        this.ui.showToast("✨ The Sunstone and Staff of Rain resonate! The legendary RAINBOW DROP is forged! ✨");
        this.ui.updateHUD();
      }, 1500);
    }
  }

  onGreenDragonDefeated() {
    this.greenDragonDefeated = true;
    if (this.greenDragonMesh) this.greenDragonMesh.visible = false;
    this.cave.unlockPrincessBarrier();
    this.ui.showToast("The Green Dragon has collapsed! Princess Gwaelin is freed from her crystal prison!");
  }

  onDragonlordDefeated() {
    this.dragonlordDefeated = true;
    if (this.dragonlordMesh) this.dragonlordMesh.visible = false;
    soundEngine.playSFX('level_up');
    this.ui.showDialogue("Victory Over Darkness", [
      "The colossal True Dragonlord roars as ancient light pierces his obsidian heart!",
      "The stolen Ball of Light returns to thy hands, casting glorious golden dawn across Alefgard!",
      "Peace has returned to the kingdom. Erdrick's legacy shall shine forevermore!"
    ]);
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  onWindowResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }
}

// Boot game on window load
if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', () => {
    new DragonWarriorGame();
  });
} else {
  new DragonWarriorGame();
}
