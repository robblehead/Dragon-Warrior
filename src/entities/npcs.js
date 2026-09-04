// NPCs: King Lorik, Princess Gwaelin, Shopkeepers, Innkeeper, and Royal Guards
import * as THREE from 'three';

export class NPCManager {
  constructor(scene, terrain) {
    this.scene = scene;
    this.terrain = terrain;
    this.group = new THREE.Group();
    this.npcs = [];

    this.initKingLorik();
    this.initPrincessGwaelin();
    this.initGuards();
    this.initVillagers();
    this.scene.add(this.group);
  }

  initKingLorik() {
    // King Lorik sitting on the throne in Tantegel Castle atop the royal dais
    const kingGroup = new THREE.Group();
    kingGroup.position.set(0, 4.95, -35.4);

    const robeMat = new THREE.MeshToonMaterial({ color: 0x6b21a8 }); // Royal purple velvet
    const capeMat = new THREE.MeshToonMaterial({ color: 0x991b1b }); // Royal crimson mantle
    const ermineMat = new THREE.MeshToonMaterial({ color: 0xf8fafc }); // White ermine fur trim
    const ermineSpotMat = new THREE.MeshToonMaterial({ color: 0x0f172a }); // Ermine black tail spots
    const beardMat = new THREE.MeshToonMaterial({ color: 0xf1f5f9 }); // Pure white royal beard
    const skinMat = new THREE.MeshToonMaterial({ color: 0xfde0cf }); // Warm anime skin tone
    const goldMat = new THREE.MeshToonMaterial({ color: 0xfacc15 }); // Burnished gold crown and trim
    const rubyMat = new THREE.MeshToonMaterial({ color: 0xdc2626 });
    const sapphireMat = new THREE.MeshToonMaterial({ color: 0x0284c7 });

    // 1. Seated Torso & Robes
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.95, 1.05, 0.75), robeMat);
    torso.position.y = 0.52;
    kingGroup.add(torso);

    // Gold embroidered chest brocade
    const brocade = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.8, 0.08), goldMat);
    brocade.position.set(0, 0.55, 0.38);
    kingGroup.add(brocade);

    // Seated Robe skirt draping forward
    const robeSkirt = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.5, 0.85), robeMat);
    robeSkirt.position.set(0, 0.15, 0.25);
    kingGroup.add(robeSkirt);

    // Royal Golden Slippers
    for (let side of [-0.26, 0.26]) {
      const slipper = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.18, 0.38), goldMat);
      slipper.position.set(side, -0.05, 0.62);
      kingGroup.add(slipper);
    }

    // 2. Royal Ermine Mantle (Cape over shoulders)
    const mantle = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.9, 0.8), capeMat);
    mantle.position.set(0, 0.52, -0.05);
    kingGroup.add(mantle);

    // Fluffy white ermine fur collar
    const ermineCollar = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.25, 0.85), ermineMat);
    ermineCollar.position.set(0, 0.98, 0);
    kingGroup.add(ermineCollar);

    // Black ermine spots on collar
    for (let xOffset of [-0.45, -0.18, 0.18, 0.45]) {
      const spot = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.14, 0.06), ermineSpotMat);
      spot.position.set(xOffset, 0.98, 0.43);
      kingGroup.add(spot);
    }

    // 3. Head & Toriyama Royal Facial Features
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.32, 14, 14), skinMat);
    head.position.set(0, 1.3, 0.1);
    kingGroup.add(head);

    // Regal White Mustache
    const mustacheL = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.32, 6), beardMat);
    mustacheL.rotation.z = Math.PI * 0.4;
    mustacheL.rotation.x = -0.3;
    mustacheL.position.set(-0.16, 1.22, 0.38);
    kingGroup.add(mustacheL);

    const mustacheR = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.32, 6), beardMat);
    mustacheR.rotation.z = -Math.PI * 0.4;
    mustacheR.rotation.x = -0.3;
    mustacheR.position.set(0.16, 1.22, 0.38);
    kingGroup.add(mustacheR);

    // Flowing White Spade Beard
    const beard = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.75, 10), beardMat);
    beard.rotation.x = -Math.PI * 0.95;
    beard.position.set(0, 0.92, 0.32);
    kingGroup.add(beard);

    // Royal White Hair Back
    const hairBack = new THREE.Mesh(new THREE.SphereGeometry(0.35, 12, 12), beardMat);
    hairBack.position.set(0, 1.3, -0.05);
    kingGroup.add(hairBack);

    // 4. Five-Point Jewel-Encrusted Golden Crown
    const crownBase = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.32, 0.22, 16), goldMat);
    crownBase.position.set(0, 1.58, 0.1);
    kingGroup.add(crownBase);

    // 5 Crown Points
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2;
      const px = Math.cos(angle) * 0.34;
      const pz = Math.sin(angle) * 0.34 + 0.1;
      const pt = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.24, 6), goldMat);
      pt.position.set(px, 1.76, pz);
      kingGroup.add(pt);

      // Inset jewel on crown point
      const jewelMat = (i % 2 === 0) ? rubyMat : sapphireMat;
      const jewel = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 6), jewelMat);
      jewel.position.set(px * 1.05, 1.62, pz * 1.05);
      kingGroup.add(jewel);
    }

    // 5. Golden Royal Scepter in Hand
    const scepter = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.03, 1.3, 8), goldMat);
    scepter.position.set(0.55, 0.75, 0.42);
    scepter.rotation.z = -0.15;
    kingGroup.add(scepter);

    const scepterHead = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 10), sapphireMat);
    scepterHead.position.set(0.65, 1.42, 0.42);
    kingGroup.add(scepterHead);

    const scepterCrest = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.03, 6, 16), goldMat);
    scepterCrest.position.set(0.65, 1.42, 0.42);
    kingGroup.add(scepterCrest);

    this.group.add(kingGroup);

    this.kingLorik = {
      id: 'king_lorik',
      name: 'King Lorik',
      group: kingGroup,
      position: new THREE.Vector3(0, 4.95, -35.4),
      getDialogue: (player) => {
        if (player.isCarryingPrincess) {
          return [
            "O, brave Erdrick! Thou hast rescued my beloved daughter, Princess Gwaelin!",
            "Words cannot describe the joy of our kingdom! Please accept Gwaelin's Love—it shall guide thy compass wherever thou wanderest!",
            "Now, go forth to the western cape with the Sunstone and Staff of Rain. Defeat the Dragonlord and restore peace to Alefgard!"
          ];
        } else if (player.inventory.gwaelinLove) {
          return [
            "Erdrick! Alefgard's hopes rest upon thy shoulders.",
            "Cross the rainbow bridge into Charlock and vanquish the Dragonlord!"
          ];
        } else {
          return [
            "Descendant of Erdrick! Listen to my words!",
            "The evil Dragonlord hath stolen the Ball of Light and locked away our beloved daughter Princess Gwaelin.",
            "Take the gold, the torch, and the key from my treasury vault. Seek Princess Gwaelin in the dark Quagmire Cave to the east, and slay the monster that guards her!"
          ];
        }
      }
    };
    this.npcs.push(this.kingLorik);
  }

  initPrincessGwaelin() {
    // Princess in Quagmire Cave at (72, 1.2, 53)
    const pGroup = new THREE.Group();
    pGroup.position.set(72, 1.2, 53);

    const gownMat = new THREE.MeshToonMaterial({ color: 0xf472b6 });
    const hairMat = new THREE.MeshToonMaterial({ color: 0xfde047 });
    const skinMat = new THREE.MeshToonMaterial({ color: 0xfbcfe8 });
    const tiaraMat = new THREE.MeshToonMaterial({ color: 0xf59e0b });

    const gown = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.65, 1.2, 12), gownMat);
    gown.position.y = 0.6;
    pGroup.add(gown);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.26, 12, 12), skinMat);
    head.position.y = 1.35;
    pGroup.add(head);

    const hair = new THREE.Mesh(new THREE.SphereGeometry(0.3, 12, 12), hairMat);
    hair.position.set(0, 1.36, -0.05);
    pGroup.add(hair);

    const tiara = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.08, 6), tiaraMat);
    tiara.position.y = 1.58;
    pGroup.add(tiara);

    this.group.add(pGroup);

    this.princessGwaelin = {
      id: 'princess_gwaelin',
      name: 'Princess Gwaelin',
      group: pGroup,
      isRescued: false,
      position: new THREE.Vector3(72, 1.2, 53),
      getDialogue: (player) => {
        if (!this.princessGwaelin.isRescued) {
          return [
            "Thou hast slain the dread green dragon! Art thou truly the descendant of Erdrick?",
            "I knew in my heart thou wouldst come for me! Please, carry me safely home to my father, King Lorik, at Tantegel Castle!"
          ];
        } else {
          return [
            "Erdrick, wherever thou goest, my heart is always beside thee."
          ];
        }
      }
    };
    this.npcs.push(this.princessGwaelin);
  }

  initGuards() {
    // Castle Royal Guards standing at attention
    const guardPositions = [
      { x: -3.5, z: -16, rot: 0 },
      { x: 3.5, z: -16, rot: 0 },
      { x: -2.8, z: -30, rot: Math.PI / 4 },
      { x: 2.8, z: -30, rot: -Math.PI / 4 }
    ];

    guardPositions.forEach((pos, idx) => {
      const g = this.createSoldierMesh(0x3b82f6, 0x94a3b8);
      g.position.set(pos.x, 3.5, pos.z);
      g.rotation.y = pos.rot;
      this.group.add(g);

      this.npcs.push({
        id: `guard_${idx}`,
        name: 'Royal Guard',
        group: g,
        position: new THREE.Vector3(pos.x, 3.5, pos.z),
        getDialogue: () => [
          "Hail, descendant of Erdrick! May the blessing of King Lorik protect thee in the wilds."
        ]
      });
    });
  }

  initVillagers() {
    // Villagers in Brecconary Plaza (town center at 45, 1.4, -10)
    // 1. Old Lore Master by fountain
    const oldMan = this.createCivilianMesh(0x78350f, 0xf1f5f9);
    oldMan.position.set(42, 1.4, -9);
    this.group.add(oldMan);

    this.npcs.push({
      id: 'villager_old_man',
      name: 'Elder Torvald',
      group: oldMan,
      position: new THREE.Vector3(42, 1.4, -9),
      getDialogue: () => [
        "Greetings, young warrior. Didst thou know?",
        "Legend tells of a Fairy Flute that can lull even the mightiest Golem into a peaceful slumber. It is buried beneath the steaming waters of the hot springs!"
      ]
    });

    // 2. Village Maiden
    const maiden = this.createCivilianMesh(0xec4899, 0xd97706);
    maiden.position.set(48, 1.4, -11);
    this.group.add(maiden);

    this.npcs.push({
      id: 'villager_maiden',
      name: 'Lady Claire',
      group: maiden,
      position: new THREE.Vector3(48, 1.4, -11),
      getDialogue: () => [
        "Our poor Princess Gwaelin... The dreadful dragon flew off toward the eastern marsh!",
        "Take care near the swamp, for its foul mire harms all who tread upon it!"
      ]
    });
  }

  createSoldierMesh(tunicColor, armorColor) {
    const group = new THREE.Group();
    const steelMat = new THREE.MeshToonMaterial({ color: 0xcbd5e1 }); // Polished plate steel
    const steelDarkMat = new THREE.MeshToonMaterial({ color: 0x64748b });
    const surcoatMat = new THREE.MeshToonMaterial({ color: tunicColor || 0x1d4ed8 }); // Royal blue
    const goldTrimMat = new THREE.MeshToonMaterial({ color: 0xf59e0b });
    const visorMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });
    const plumeMat = new THREE.MeshToonMaterial({ color: 0xdc2626 });
    const woodMat = new THREE.MeshToonMaterial({ color: 0x3e2723 });

    // 1. Armored Legs & Sabatons
    for (let side of [-0.22, 0.22]) {
      // Greave (shin armor)
      const greave = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.1, 0.75, 8), steelDarkMat);
      greave.position.set(side, 0.4, 0);
      group.add(greave);

      // Sabaton (armored boot)
      const sabaton = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.16, 0.35), steelMat);
      sabaton.position.set(side, 0.08, 0.08);
      group.add(sabaton);
    }

    // 2. Surcoat & Steel Cuirass (Torso)
    const surcoat = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.9, 0.44), surcoatMat);
    surcoat.position.y = 1.15;
    group.add(surcoat);

    // Gold hem along surcoat skirt
    const surcoatHem = new THREE.Mesh(new THREE.BoxGeometry(0.74, 0.1, 0.46), goldTrimMat);
    surcoatHem.position.y = 0.75;
    group.add(surcoatHem);

    // Contoured Steel Breastplate
    const breastplate = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.62, 0.35), steelMat);
    breastplate.position.set(0, 1.25, 0.1);
    group.add(breastplate);

    // Steel Gorget Collar
    const gorget = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.28, 0.15, 8), steelMat);
    gorget.position.set(0, 1.62, 0);
    group.add(gorget);

    // 3. Pauldrons (Shoulder Armor) & Gauntlets
    for (let side of [-1, 1]) {
      const pauldron = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 8), steelMat);
      pauldron.scale.set(1.0, 0.7, 1.1);
      pauldron.position.set(side * 0.48, 1.5, 0);
      group.add(pauldron);

      const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.09, 0.65, 8), steelDarkMat);
      arm.position.set(side * 0.46, 1.15, 0.05);
      group.add(arm);
    }

    // 4. Winged Sallet Knight Helmet
    const helm = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.28, 0.42, 12), steelMat);
    helm.position.set(0, 1.88, 0);
    group.add(helm);

    const dome = new THREE.Mesh(new THREE.SphereGeometry(0.27, 12, 10), steelMat);
    dome.position.set(0, 2.05, 0);
    group.add(dome);

    // Visor eye slit
    const visor = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.07, 0.1), visorMat);
    visor.position.set(0, 1.9, 0.23);
    group.add(visor);

    // Winged Crests on Helmet sides
    for (let side of [-1, 1]) {
      const wing = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.35, 0.18), steelMat);
      wing.position.set(side * 0.32, 2.1, -0.05);
      wing.rotation.z = side * 0.35;
      wing.rotation.y = side * 0.2;
      group.add(wing);

      // Gold wing rivet
      const rivet = new THREE.Mesh(new THREE.SphereGeometry(0.035, 6, 6), goldTrimMat);
      rivet.position.set(side * 0.3, 1.95, 0);
      group.add(rivet);
    }

    // Crimson Plume Feather atop helmet
    const plume = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.38, 6), plumeMat);
    plume.rotation.x = -0.4;
    plume.position.set(0, 2.36, -0.1);
    group.add(plume);

    // 5. Authentic 3D Steel Halberd (Held proudly at attention)
    const halberdGroup = new THREE.Group();
    halberdGroup.position.set(0.5, 0, 0.25);

    // Ash Pole
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 2.7, 8), woodMat);
    shaft.position.y = 1.35;
    halberdGroup.add(shaft);

    // Brass socket collar
    const socket = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.04, 0.2, 8), goldTrimMat);
    socket.position.y = 2.45;
    halberdGroup.add(socket);

    // Axe Blade
    const axe = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.45, 0.04), steelMat);
    axe.position.set(0.22, 2.52, 0);
    halberdGroup.add(axe);

    // Top Spear Pike
    const pike = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.55, 6), steelMat);
    pike.position.set(0, 2.9, 0);
    halberdGroup.add(pike);

    // Rear Hook Spike
    const beak = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.25, 6), steelMat);
    beak.rotation.z = -Math.PI * 0.5;
    beak.position.set(-0.16, 2.52, 0);
    halberdGroup.add(beak);

    group.add(halberdGroup);

    return group;
  }

  createCivilianMesh(coatColor, hairColor) {
    const group = new THREE.Group();
    const coatMat = new THREE.MeshToonMaterial({ color: coatColor });
    const hairMat = new THREE.MeshToonMaterial({ color: hairColor });
    const skinMat = new THREE.MeshToonMaterial({ color: 0xfbcfe8 });

    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.45, 1.1, 10), coatMat);
    body.position.y = 0.55;
    group.add(body);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.25, 12, 12), skinMat);
    head.position.y = 1.3;
    group.add(head);

    const hair = new THREE.Mesh(new THREE.SphereGeometry(0.28, 12, 12), hairMat);
    hair.position.set(0, 1.34, -0.04);
    group.add(hair);

    return group;
  }
}
