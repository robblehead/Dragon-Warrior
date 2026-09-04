// Dragon Warrior 3D: Echoes of Alefgard - High-Fidelity BotW / Akira Toriyama Erdrick Model
import * as THREE from 'three';

export class PlayerCharacter {
  constructor(scene, terrain) {
    this.scene = scene;
    this.terrain = terrain;

    // Movement & Physics
    this.position = new THREE.Vector3(0, 3.5, -23); // Starts inside Tantegel Castle courtyard
    this.velocity = new THREE.Vector3();
    this.rotation = 0;
    this.targetRotation = 0;
    this.moveSpeed = 7.5;
    this.sprintMultiplier = 1.5;
    this.isSprinting = false;
    this.isGrounded = true;
    this.verticalVelocity = 0;
    this.gravity = -24.0;
    this.jumpForce = 8.8;

    // Hero Stats (faithful to Dragon Warrior NES manual)
    this.stats = {
      name: 'Erdrick',
      level: 1,
      hp: 15,
      maxHp: 15,
      mp: 0,
      maxMp: 0,
      attack: 4,
      defense: 4,
      agility: 4,
      exp: 0,
      nextExp: 7,
      gold: 0,
      weapon: 'Bamboo Pole',
      armor: 'Cloth',
      shield: 'None'
    };

    // Inventory & Key Items
    this.inventory = {
      herbs: 1,
      torches: 0,
      magicKeys: 0,
      fairyWater: 0,
      fairyFlute: false,
      silverHarp: false,
      sunstone: false,
      staffOfRain: false,
      rainbowDrop: false,
      erdrickRing: false,
      gwaelinLove: false
    };

    // Spells Known
    this.spells = []; // 'HEAL', 'HURT', 'SLEEP', 'RADIANT', 'STOPSPELL', 'HURTMORE'

    // Status Flags
    this.hasTorchEquipped = false;
    this.hasRadiantActive = false;
    this.isCarryingPrincess = false;
    this.isWeaponDrawn = false;

    this.group = new THREE.Group();
    this.buildHeroModel();
    this.scene.add(this.group);
  }

  createMaterials() {
    return {
      // Royal cobalt blue surcoat/tunic
      tunicMat: new THREE.MeshToonMaterial({ color: 0x1d4ed8 }),
      // Polished knight armor steel
      steelMat: new THREE.MeshToonMaterial({ color: 0xc8d0db }),
      // Darkened gunmetal steel for joints/accents
      steelDarkMat: new THREE.MeshToonMaterial({ color: 0x64748b }),
      // Radiant Erdrick gold filigree and horns
      goldMat: new THREE.MeshToonMaterial({ color: 0xf59e0b }),
      goldBrightMat: new THREE.MeshToonMaterial({ color: 0xfde047 }),
      // Rich harness & boot leather
      leatherMat: new THREE.MeshToonMaterial({ color: 0x78350f }),
      leatherDarkMat: new THREE.MeshToonMaterial({ color: 0x451a03 }),
      // Crimson knight trousers
      pantsMat: new THREE.MeshToonMaterial({ color: 0x991b1b }),
      // Fair anime skin tone with warm peach undertone
      skinMat: new THREE.MeshToonMaterial({ color: 0xfde0cf }),
      // Akira Toriyama dark spiky hair
      hairMat: new THREE.MeshToonMaterial({ color: 0x18181b }),
      // Eyes
      eyeWhiteMat: new THREE.MeshToonMaterial({ color: 0xffffff }),
      eyeIrisMat: new THREE.MeshToonMaterial({ color: 0x0284c7 }),
      eyePupilMat: new THREE.MeshToonMaterial({ color: 0x0f172a }),
      // Glowing azure/sapphire jewel
      gemMat: new THREE.MeshToonMaterial({ color: 0x38bdf8 }),
      gemRubyMat: new THREE.MeshToonMaterial({ color: 0xef4444 }),
      // Flowing double-sided crimson cape
      capeMat: new THREE.MeshToonMaterial({ color: 0xdc2626, side: THREE.DoubleSide }),
      // Wood torch handle
      woodMat: new THREE.MeshToonMaterial({ color: 0x854d0e })
    };
  }

  buildHeroModel() {
    this.mats = this.createMaterials();
    this.bodyGroup = new THREE.Group();

    // 1. Torso & Layered Armor
    this.buildTorsoAndArmor();

    // 2. Head, Anime Face & Winged Casque
    this.buildHeadAndHelmet();

    // 3. Articulated Arms, Pauldrons & Gauntlets
    this.buildArmsAndGauntlets();

    // 4. Legs, Greaves & Sabatons
    this.buildLegsAndBoots();

    // 5. Dynamic Billowing Cape
    this.buildCape();

    // 6. Legendary Erdrick's Sword & Scabbard
    this.buildSwordAndScabbard();

    // 7. Legendary Erdrick's Shield with Phoenix Crest
    this.buildShield();

    // 8. Dynamic Torch in Hand
    this.buildTorch();

    // 9. Princess Gwaelin Held in Arms
    this.princessArmsGroup = new THREE.Group();
    this.buildCarriedPrincess();
    this.princessArmsGroup.visible = false;
    this.bodyGroup.add(this.princessArmsGroup);

    this.group.add(this.bodyGroup);
  }

  buildTorsoAndArmor() {
    this.torsoGroup = new THREE.Group();
    this.torsoGroup.position.y = 1.15;

    // A. Contoured Royal Blue Tunic (tapered chest to waist)
    const tunicGeo = new THREE.CylinderGeometry(0.38, 0.28, 0.76, 16);
    tunicGeo.scale(1.15, 1.0, 0.78); // wider at shoulders, flatter depth
    this.torso = new THREE.Mesh(tunicGeo, this.mats.tunicMat);
    this.torso.castShadow = true;
    this.torso.receiveShadow = true;
    this.torsoGroup.add(this.torso);

    // Tunic gold embroidered collar & hem
    const collar = new THREE.Mesh(
      new THREE.TorusGeometry(0.24, 0.035, 8, 16),
      this.mats.goldBrightMat
    );
    collar.rotation.x = Math.PI / 2;
    collar.position.set(0, 0.36, 0.02);
    this.torsoGroup.add(collar);

    // B. Sculpted Steel Cuirass / Breastplate over upper chest
    const chestPlateGeo = new THREE.SphereGeometry(0.34, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.5);
    chestPlateGeo.scale(1.18, 0.85, 0.85);
    const chestPlate = new THREE.Mesh(chestPlateGeo, this.mats.steelMat);
    chestPlate.position.set(0, 0.12, 0.08);
    chestPlate.castShadow = true;
    this.torsoGroup.add(chestPlate);

    // Gold sternum carina ridge down center of breastplate
    const sternum = new THREE.Mesh(
      new THREE.BoxGeometry(0.04, 0.38, 0.06),
      this.mats.goldMat
    );
    sternum.position.set(0, 0.14, 0.32);
    this.torsoGroup.add(sternum);

    // Gold piping along bottom edge of breastplate
    const chestRim = new THREE.Mesh(
      new THREE.TorusGeometry(0.35, 0.025, 6, 20, Math.PI * 0.9),
      this.mats.goldMat
    );
    chestRim.rotation.x = Math.PI / 2.3;
    chestRim.position.set(0, -0.04, 0.08);
    this.torsoGroup.add(chestRim);

    // C. Steel Backplate with Harness Anchors
    const backPlate = new THREE.Mesh(
      new THREE.BoxGeometry(0.55, 0.44, 0.08),
      this.mats.steelDarkMat
    );
    backPlate.position.set(0, 0.12, -0.22);
    this.torsoGroup.add(backPlate);

    // D. Diagonal Leather Baldric / Scabbard Harness
    const strap = new THREE.Mesh(
      new THREE.BoxGeometry(0.10, 0.82, 0.04),
      this.mats.leatherMat
    );
    strap.rotation.z = -0.58;
    strap.position.set(0.02, 0.10, 0.22);
    this.torsoGroup.add(strap);

    const strapBack = new THREE.Mesh(
      new THREE.BoxGeometry(0.10, 0.82, 0.04),
      this.mats.leatherDarkMat
    );
    strapBack.rotation.z = -0.58;
    strapBack.position.set(0.02, 0.10, -0.23);
    this.torsoGroup.add(strapBack);

    const baldricBuckle = new THREE.Mesh(
      new THREE.BoxGeometry(0.13, 0.12, 0.06),
      this.mats.goldBrightMat
    );
    baldricBuckle.rotation.z = -0.58;
    baldricBuckle.position.set(0.12, 0.22, 0.24);
    this.torsoGroup.add(baldricBuckle);

    // E. Broad Knight Waist Belt & Ornate Medallion Buckle
    const belt = new THREE.Mesh(
      new THREE.CylinderGeometry(0.32, 0.32, 0.15, 16),
      this.mats.leatherDarkMat
    );
    belt.scale.set(1.15, 1.0, 0.85);
    belt.position.y = -0.34;
    this.torsoGroup.add(belt);

    // Gold trim rings on belt
    for (let dy of [-0.07, 0.07]) {
      const bTrim = new THREE.Mesh(
        new THREE.TorusGeometry(0.33, 0.015, 6, 20),
        this.mats.goldBrightMat
      );
      bTrim.rotation.x = Math.PI / 2;
      bTrim.scale.set(1.15, 0.85, 1.0);
      bTrim.position.set(0, -0.34 + dy, 0);
      this.torsoGroup.add(bTrim);
    }

    // Legendary Dragon Buckle with Ruby Core
    const buckle = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 0.18, 0.08),
      this.mats.goldMat
    );
    buckle.position.set(0, -0.34, 0.28);
    this.torsoGroup.add(buckle);

    const buckleRuby = new THREE.Mesh(
      new THREE.SphereGeometry(0.05, 8, 8),
      this.mats.gemRubyMat
    );
    buckleRuby.position.set(0, -0.34, 0.32);
    this.torsoGroup.add(buckleRuby);

    // Leather adventurer pouch on right hip
    const pouch = new THREE.Mesh(
      new THREE.BoxGeometry(0.14, 0.16, 0.12),
      this.mats.leatherMat
    );
    pouch.position.set(0.34, -0.36, 0.05);
    pouch.rotation.z = -0.15;
    this.torsoGroup.add(pouch);

    // F. Hanging Chainmail Fauld / Tassets (protecting thighs)
    for (let i = -1; i <= 1; i += 2) {
      const tasset = new THREE.Mesh(
        new THREE.BoxGeometry(0.24, 0.22, 0.05),
        this.mats.steelDarkMat
      );
      tasset.position.set(i * 0.22, -0.46, 0.12);
      tasset.rotation.x = 0.2;
      tasset.rotation.y = i * 0.15;
      this.torsoGroup.add(tasset);

      const tassetRim = new THREE.Mesh(
        new THREE.BoxGeometry(0.24, 0.03, 0.06),
        this.mats.goldMat
      );
      tassetRim.position.set(i * 0.22, -0.56, 0.14);
      tassetRim.rotation.x = 0.2;
      this.torsoGroup.add(tassetRim);
    }

    this.bodyGroup.add(this.torsoGroup);
  }

  buildHeadAndHelmet() {
    this.headGroup = new THREE.Group();
    this.headGroup.position.set(0, 1.86, 0);

    // A. Sculpted Head & Anime Jawline
    const headGeo = new THREE.SphereGeometry(0.29, 20, 20);
    headGeo.scale(0.96, 1.05, 0.98);
    const head = new THREE.Mesh(headGeo, this.mats.skinMat);
    this.headGroup.add(head);

    // Tapered anime chin
    const chinGeo = new THREE.ConeGeometry(0.12, 0.18, 6);
    chinGeo.rotateX(Math.PI);
    const chin = new THREE.Mesh(chinGeo, this.mats.skinMat);
    chin.position.set(0, -0.22, 0.11);
    this.headGroup.add(chin);

    // Ears
    for (let side = -1; side <= 1; side += 2) {
      const ear = new THREE.Mesh(
        new THREE.SphereGeometry(0.07, 8, 8),
        this.mats.skinMat
      );
      ear.scale.set(0.4, 1.0, 0.6);
      ear.position.set(side * 0.29, -0.02, -0.02);
      this.headGroup.add(ear);
    }

    // B. Cel-Shaded Anime Eyes & Expression
    this.buildFace();

    // C. Akira Toriyama Spiky Hair Tufts peeking under helmet
    this.buildToriyamaHair();

    // D. The Iconic Erdrick Winged Casque / Helmet
    // Steel skull dome
    const domeGeo = new THREE.SphereGeometry(0.33, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.58);
    domeGeo.scale(1.02, 1.05, 1.06);
    const helmetDome = new THREE.Mesh(domeGeo, this.mats.steelMat);
    helmetDome.position.set(0, 0.05, -0.01);
    helmetDome.castShadow = true;
    this.headGroup.add(helmetDome);

    // Helmet golden brow band encircling temples
    const browBand = new THREE.Mesh(
      new THREE.TorusGeometry(0.32, 0.028, 8, 24),
      this.mats.goldBrightMat
    );
    browBand.rotation.x = Math.PI / 2.08;
    browBand.position.set(0, 0.08, 0.01);
    this.headGroup.add(browBand);

    // Steel cheek guards (paragnathides) flanking jaw
    for (let side = -1; side <= 1; side += 2) {
      const cheek = new THREE.Mesh(
        new THREE.BoxGeometry(0.06, 0.24, 0.18),
        this.mats.steelMat
      );
      cheek.position.set(side * 0.30, -0.08, 0.10);
      cheek.rotation.y = side * 0.2;
      this.headGroup.add(cheek);
    }

    // Golden Forehead Crest Diadem with Glowing Sapphire Gem
    const crestBase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.12, 0.04, 12),
      this.mats.goldMat
    );
    crestBase.rotation.x = Math.PI / 2;
    crestBase.position.set(0, 0.17, 0.32);
    this.headGroup.add(crestBase);

    // Radiant blue sapphire cabochon
    const crestGem = new THREE.Mesh(
      new THREE.SphereGeometry(0.06, 12, 12),
      this.mats.gemMat
    );
    crestGem.scale.set(1.0, 1.2, 0.6);
    crestGem.position.set(0, 0.17, 0.34);
    this.headGroup.add(crestGem);

    // Crest mini wings flanking the diadem
    for (let side = -1; side <= 1; side += 2) {
      const crestWing = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, 0.04, 0.02),
        this.mats.goldBrightMat
      );
      crestWing.rotation.z = side * 0.4;
      crestWing.position.set(side * 0.14, 0.19, 0.30);
      this.headGroup.add(crestWing);
    }

    // E. The Majestic Swept-Back Curved Golden Horns / Wings
    this.buildSweptHorns();

    this.bodyGroup.add(this.headGroup);
  }

  buildFace() {
    for (let side = -1; side <= 1; side += 2) {
      const eyeGroup = new THREE.Group();
      eyeGroup.position.set(side * 0.11, -0.01, 0.27);
      eyeGroup.rotation.y = side * 0.18;

      // Almond eye sclera
      const sclera = new THREE.Mesh(
        new THREE.PlaneGeometry(0.085, 0.065),
        this.mats.eyeWhiteMat
      );
      eyeGroup.add(sclera);

      // Deep blue anime iris
      const iris = new THREE.Mesh(
        new THREE.PlaneGeometry(0.052, 0.056),
        this.mats.eyeIrisMat
      );
      iris.position.z = 0.002;
      eyeGroup.add(iris);

      // Black pupil
      const pupil = new THREE.Mesh(
        new THREE.PlaneGeometry(0.026, 0.032),
        this.mats.eyePupilMat
      );
      pupil.position.z = 0.003;
      eyeGroup.add(pupil);

      // White catchlight highlight glint
      const glint = new THREE.Mesh(
        new THREE.PlaneGeometry(0.014, 0.014),
        this.mats.eyeWhiteMat
      );
      glint.position.set(-0.012, 0.012, 0.004);
      eyeGroup.add(glint);

      // Heroic determined black eyebrow
      const brow = new THREE.Mesh(
        new THREE.BoxGeometry(0.10, 0.022, 0.015),
        this.mats.hairMat
      );
      brow.rotation.z = side * -0.22; // angled inward
      brow.position.set(0, 0.052, 0.01);
      eyeGroup.add(brow);

      this.headGroup.add(eyeGroup);
    }

    // Sculpted anime nose tip
    const nose = new THREE.Mesh(
      new THREE.ConeGeometry(0.025, 0.06, 4),
      this.mats.skinMat
    );
    nose.rotation.x = -Math.PI / 2.4;
    nose.position.set(0, -0.07, 0.31);
    this.headGroup.add(nose);

    // Determined mouth line
    const mouth = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.014, 0.02),
      this.mats.leatherDarkMat
    );
    mouth.position.set(0, -0.15, 0.27);
    this.headGroup.add(mouth);
  }

  buildToriyamaHair() {
    // Spiky clumps at nape of neck
    const hairSpikes = [
      { x: -0.18, y: -0.24, z: -0.22, rx: -0.4, ry: -0.3, rz: -0.2, s: 0.18 },
      { x: 0.0, y: -0.28, z: -0.26, rx: -0.5, ry: 0, rz: 0, s: 0.22 },
      { x: 0.18, y: -0.24, z: -0.22, rx: -0.4, ry: 0.3, rz: 0.2, s: 0.18 },
      // Sideburn clumps framing jaw
      { x: -0.28, y: -0.18, z: 0.08, rx: 0.1, ry: -0.4, rz: 0.3, s: 0.15 },
      { x: 0.28, y: -0.18, z: 0.08, rx: 0.1, ry: 0.4, rz: -0.3, s: 0.15 }
    ];

    hairSpikes.forEach(h => {
      const spike = new THREE.Mesh(
        new THREE.ConeGeometry(0.08, 0.30, 4),
        this.mats.hairMat
      );
      spike.scale.set(h.s / 0.2, h.s / 0.2, h.s / 0.2);
      spike.rotation.set(h.rx, h.ry, h.rz);
      spike.position.set(h.x, h.y, h.z);
      this.headGroup.add(spike);
    });
  }

  buildSweptHorns() {
    // Elegant swept-back wings/horns using tapered mathematical tubes
    for (let side = -1; side <= 1; side += 2) {
      const hornGroup = new THREE.Group();
      hornGroup.position.set(side * 0.32, 0.12, 0.02);

      // Base ferrule socket ring
      const baseRing = new THREE.Mesh(
        new THREE.CylinderGeometry(0.09, 0.09, 0.06, 12),
        this.mats.goldBrightMat
      );
      baseRing.rotation.z = side * -0.6;
      hornGroup.add(baseRing);

      // Sweeping 3D spline curve: curves outward, backward, and then arcs upward!
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(side * 0.18, 0.12, -0.06),
        new THREE.Vector3(side * 0.32, 0.26, -0.16),
        new THREE.Vector3(side * 0.26, 0.48, -0.22)
      ]);

      const tubularSegments = 16;
      const radialSegments = 10;
      const tubeGeo = new THREE.TubeGeometry(curve, tubularSegments, 0.075, radialSegments, false);
      const pos = tubeGeo.attributes.position;

      // Mathematically taper each ring toward the sharp tip
      for (let i = 0; i <= tubularSegments; i++) {
        const t = i / tubularSegments;
        const taper = Math.max(0.12, 1.0 - t * 0.88);
        const center = curve.getPointAt(t);
        for (let j = 0; j <= radialSegments; j++) {
          const idx = i * (radialSegments + 1) + j;
          const vx = pos.getX(idx);
          const vy = pos.getY(idx);
          const vz = pos.getZ(idx);
          pos.setXYZ(
            idx,
            center.x + (vx - center.x) * taper,
            center.y + (vy - center.y) * taper,
            center.z + (vz - center.z) * taper
          );
        }
      }
      tubeGeo.computeVertexNormals();

      const hornMesh = new THREE.Mesh(tubeGeo, this.mats.goldMat);
      hornMesh.castShadow = true;
      hornGroup.add(hornMesh);

      // Sharp golden horn tip cap
      const tipPoint = curve.getPointAt(1.0);
      const tip = new THREE.Mesh(
        new THREE.ConeGeometry(0.02, 0.08, 8),
        this.mats.goldBrightMat
      );
      tip.position.copy(tipPoint);
      tip.rotation.x = -0.3;
      tip.rotation.z = side * 0.2;
      hornGroup.add(tip);

      this.headGroup.add(hornGroup);
    }
  }

  buildArmsAndGauntlets() {
    // Left Arm (Shield / Torch Arm)
    this.leftArm = new THREE.Group();
    this.leftArm.position.set(-0.46, 1.45, 0);
    this.buildSingleArm(this.leftArm, -1);
    this.bodyGroup.add(this.leftArm);

    // Right Arm (Sword Arm)
    this.rightArm = new THREE.Group();
    this.rightArm.position.set(0.46, 1.45, 0);
    this.buildSingleArm(this.rightArm, 1);
    this.bodyGroup.add(this.rightArm);
  }

  buildSingleArm(armGroup, side) {
    // A. Shoulder Pauldron (Articulated with arm motion)
    const pauldronGroup = new THREE.Group();
    pauldronGroup.position.set(0, 0.05, 0);

    // Upper convex steel plate
    const pGeo = new THREE.SphereGeometry(0.24, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.55);
    pGeo.scale(1.1, 0.75, 1.1);
    const pMesh = new THREE.Mesh(pGeo, this.mats.steelMat);
    pMesh.rotation.z = side * -0.4;
    pMesh.castShadow = true;
    pauldronGroup.add(pMesh);

    // Gold decorative pauldron rim
    const pRim = new THREE.Mesh(
      new THREE.TorusGeometry(0.23, 0.025, 6, 16, Math.PI),
      this.mats.goldMat
    );
    pRim.rotation.x = Math.PI / 2;
    pRim.rotation.y = side * -0.4;
    pRim.position.y = -0.05;
    pauldronGroup.add(pRim);

    // Golden lion/star brooch securing cape
    const brooch = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.06, 0.03, 8),
      this.mats.goldBrightMat
    );
    brooch.position.set(side * 0.02, 0.16, 0.02);
    pauldronGroup.add(brooch);

    armGroup.add(pauldronGroup);

    // B. Upper Arm: Royal Blue Tunic Sleeve
    const sleeve = new THREE.Mesh(
      new THREE.CylinderGeometry(0.14, 0.13, 0.32, 12),
      this.mats.tunicMat
    );
    sleeve.position.y = -0.16;
    armGroup.add(sleeve);

    // Gold rolled sleeve cuff
    const cuff = new THREE.Mesh(
      new THREE.TorusGeometry(0.135, 0.018, 6, 16),
      this.mats.goldBrightMat
    );
    cuff.rotation.x = Math.PI / 2;
    cuff.position.y = -0.32;
    armGroup.add(cuff);

    // C. Forearm: Segmented Plate Vambrace & Leather Bracer
    const bracer = new THREE.Mesh(
      new THREE.CylinderGeometry(0.125, 0.10, 0.34, 12),
      this.mats.leatherMat
    );
    bracer.position.y = -0.48;
    armGroup.add(bracer);

    // Steel vambrace guard on outer forearm
    const vambrace = new THREE.Mesh(
      new THREE.BoxGeometry(0.06, 0.30, 0.16),
      this.mats.steelMat
    );
    vambrace.position.set(side * 0.08, -0.48, 0.01);
    armGroup.add(vambrace);

    // Gold rivet studs along vambrace
    for (let dy of [-0.08, 0, 0.08]) {
      const stud = new THREE.Mesh(
        new THREE.SphereGeometry(0.016, 6, 6),
        this.mats.goldBrightMat
      );
      stud.position.set(side * 0.11, -0.48 + dy, 0.01);
      armGroup.add(stud);
    }

    // D. Articulated Leather Gauntlet Hand
    const hand = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.14, 0.12),
      this.mats.leatherDarkMat
    );
    hand.position.y = -0.70;
    armGroup.add(hand);

    // Thumb & fingers contour
    const thumb = new THREE.Mesh(
      new THREE.BoxGeometry(0.05, 0.08, 0.05),
      this.mats.leatherDarkMat
    );
    thumb.position.set(side * -0.06, -0.68, 0.05);
    armGroup.add(thumb);
  }

  buildLegsAndBoots() {
    // Left Leg
    this.leftLeg = new THREE.Group();
    this.leftLeg.position.set(-0.20, 0.72, 0);
    this.buildSingleLeg(this.leftLeg, -1);
    this.bodyGroup.add(this.leftLeg);

    // Right Leg
    this.rightLeg = new THREE.Group();
    this.rightLeg.position.set(0.20, 0.72, 0);
    this.buildSingleLeg(this.rightLeg, 1);
    this.bodyGroup.add(this.rightLeg);
  }

  buildSingleLeg(legGroup, side) {
    // A. Thigh: Tailored Crimson Trousers
    const thigh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.17, 0.14, 0.36, 12),
      this.mats.pantsMat
    );
    thigh.position.y = -0.18;
    thigh.castShadow = true;
    legGroup.add(thigh);

    // B. Knee: Sculpted Steel Poleyn (Knee Guard)
    const poleyn = new THREE.Mesh(
      new THREE.SphereGeometry(0.13, 10, 8),
      this.mats.steelMat
    );
    poleyn.scale.set(1.0, 1.2, 0.7);
    poleyn.position.set(0, -0.36, 0.10);
    legGroup.add(poleyn);

    // Gold diamond boss on knee
    const kneeBoss = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.04),
      this.mats.goldBrightMat
    );
    kneeBoss.position.set(0, -0.36, 0.18);
    legGroup.add(kneeBoss);

    // C. Shin: Folded Leather Boot & Steel Greave
    const shin = new THREE.Mesh(
      new THREE.CylinderGeometry(0.14, 0.11, 0.36, 12),
      this.mats.leatherMat
    );
    shin.position.y = -0.54;
    legGroup.add(shin);

    // Folded down leather boot cuff
    const bootCuff = new THREE.Mesh(
      new THREE.TorusGeometry(0.14, 0.03, 6, 16),
      this.mats.leatherDarkMat
    );
    bootCuff.rotation.x = Math.PI / 2;
    bootCuff.position.y = -0.40;
    legGroup.add(bootCuff);

    // Steel plate greave along the front shin
    const greave = new THREE.Mesh(
      new THREE.BoxGeometry(0.10, 0.28, 0.05),
      this.mats.steelMat
    );
    greave.position.set(0, -0.55, 0.10);
    legGroup.add(greave);

    // D. Knight Sabaton (Armored Pointed Boot)
    const sabaton = new THREE.Mesh(
      new THREE.BoxGeometry(0.15, 0.12, 0.32),
      this.mats.leatherDarkMat
    );
    sabaton.position.set(0, -0.74, 0.05);
    legGroup.add(sabaton);

    // Pointed upturned toe box
    const toeCap = new THREE.Mesh(
      new THREE.ConeGeometry(0.08, 0.14, 6),
      this.mats.steelMat
    );
    toeCap.rotation.x = -Math.PI / 2.3;
    toeCap.position.set(0, -0.74, 0.22);
    legGroup.add(toeCap);

    // Sturdy leather sole plate
    const sole = new THREE.Mesh(
      new THREE.BoxGeometry(0.16, 0.03, 0.34),
      new THREE.MeshBasicMaterial({ color: 0x1c1917 })
    );
    sole.position.set(0, -0.80, 0.05);
    legGroup.add(sole);
  }

  buildCape() {
    // Stationary heroic crimson cape with subtle sculpted cloth folds
    const capeGeo = new THREE.PlaneGeometry(0.85, 1.35, 6, 10);
    capeGeo.translate(0, -0.675, 0); // anchor at shoulders

    // Add subtle static Toriyama-style fabric fold curves
    const pos = capeGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const fold = Math.sin(x * 12.0) * 0.015;
      const drapeBack = (y * -1.0) * 0.05;
      pos.setZ(i, fold - drapeBack);
    }
    capeGeo.computeVertexNormals();

    this.cape = new THREE.Mesh(capeGeo, this.mats.capeMat);
    this.cape.position.set(0, 1.48, -0.25);
    this.cape.rotation.x = 0.06; // clean, stationary resting drape
    this.cape.castShadow = true;
    this.bodyGroup.add(this.cape);
  }

  buildSwordAndScabbard() {
    this.sword = new THREE.Group();

    // A. Legendary Erdrick Double-Edged Blade
    const bladeGeo = new THREE.BoxGeometry(0.085, 0.95, 0.024);
    // Taper the blade slightly toward the point
    const bPos = bladeGeo.attributes.position;
    for (let i = 0; i < bPos.count; i++) {
      const y = bPos.getY(i);
      if (y > 0.2) {
        const taper = 1.0 - (y - 0.2) / 0.75 * 0.45;
        bPos.setX(i, bPos.getX(i) * taper);
      }
    }
    bladeGeo.computeVertexNormals();

    const blade = new THREE.Mesh(bladeGeo, this.mats.steelMat);
    blade.position.y = 0.54;
    blade.castShadow = true;
    this.sword.add(blade);

    // Sharp diamond blade tip
    const tip = new THREE.Mesh(
      new THREE.ConeGeometry(0.045, 0.16, 4),
      this.mats.steelMat
    );
    tip.position.y = 1.06;
    tip.rotation.y = Math.PI / 4;
    this.sword.add(tip);

    // Central fuller (blood groove) down the blade
    const fuller = new THREE.Mesh(
      new THREE.BoxGeometry(0.018, 0.72, 0.026),
      this.mats.steelDarkMat
    );
    fuller.position.y = 0.45;
    this.sword.add(fuller);

    // B. Winged Golden Crossguard with Sapphire Jewel
    const guard = new THREE.Mesh(
      new THREE.BoxGeometry(0.34, 0.06, 0.08),
      this.mats.goldMat
    );
    guard.position.y = 0.06;
    this.sword.add(guard);

    // Swept-up golden quillons
    for (let side = -1; side <= 1; side += 2) {
      const quillon = new THREE.Mesh(
        new THREE.ConeGeometry(0.035, 0.09, 6),
        this.mats.goldBrightMat
      );
      quillon.rotation.z = side * -0.7;
      quillon.position.set(side * 0.18, 0.08, 0);
      this.sword.add(quillon);
    }

    // Central crossguard sapphire cabochon
    for (let sideZ of [-0.042, 0.042]) {
      const guardGem = new THREE.Mesh(
        new THREE.SphereGeometry(0.03, 8, 8),
        this.mats.gemMat
      );
      guardGem.position.set(0, 0.06, sideZ);
      this.sword.add(guardGem);
    }

    // C. Ribbed Leather Grip & Golden Pommel
    const grip = new THREE.Mesh(
      new THREE.CylinderGeometry(0.032, 0.035, 0.22, 12),
      this.mats.leatherDarkMat
    );
    grip.position.y = -0.06;
    this.sword.add(grip);

    // Gold wire ribs on grip
    for (let dy of [-0.10, -0.05, 0.0, 0.05]) {
      const rib = new THREE.Mesh(
        new THREE.TorusGeometry(0.036, 0.006, 6, 12),
        this.mats.goldBrightMat
      );
      rib.rotation.x = Math.PI / 2;
      rib.position.y = dy;
      this.sword.add(rib);
    }

    // Solid golden sunburst pommel
    const pommel = new THREE.Mesh(
      new THREE.CylinderGeometry(0.065, 0.065, 0.038, 12),
      this.mats.goldMat
    );
    pommel.position.y = -0.18;
    this.sword.add(pommel);

    // D. Back Scabbard
    this.scabbard = new THREE.Group();
    // Sheath body
    const sheath = new THREE.Mesh(
      new THREE.BoxGeometry(0.10, 1.05, 0.05),
      this.mats.tunicMat // Royal blue lacquered sheath
    );
    sheath.position.y = -0.45;
    this.scabbard.add(sheath);

    // Gold locket (mouth)
    const locket = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.08, 0.07),
      this.mats.goldBrightMat
    );
    locket.position.y = 0.06;
    this.scabbard.add(locket);

    // Gold chape (tip)
    const chape = new THREE.Mesh(
      new THREE.ConeGeometry(0.055, 0.14, 4),
      this.mats.goldBrightMat
    );
    chape.rotation.x = Math.PI;
    chape.position.y = -1.0;
    this.scabbard.add(chape);

    // Mount scabbard diagonally on hero's back
    this.scabbard.position.set(-0.14, 1.32, -0.24);
    this.scabbard.rotation.set(0.18, -0.10, -0.60);
    this.bodyGroup.add(this.scabbard);

    // Initial state: sword sheathed in back scabbard
    this.setWeaponDrawn(false);
  }

  buildShield() {
    this.shield = new THREE.Group();

    // A. Curved Convex Heater Shield
    const w = 0.52, h = 0.72;
    const shieldGeo = new THREE.PlaneGeometry(w, h, 12, 16);
    const pos = shieldGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      // Taper toward pointed bottom
      const taper = y < 0 ? 1.0 - Math.pow(Math.abs(y) / (h * 0.5), 1.6) * 0.45 : 1.0;
      pos.setX(i, x * taper);
      // 3D convex forward bulge
      const normX = x / (w * 0.5);
      const normY = y / (h * 0.5);
      const curveZ = (1.0 - normX * normX) * 0.07 + (1.0 - normY * normY) * 0.03;
      pos.setZ(i, curveZ);
    }
    shieldGeo.computeVertexNormals();

    const shieldFace = new THREE.Mesh(shieldGeo, this.mats.tunicMat);
    shieldFace.castShadow = true;
    this.shield.add(shieldFace);

    // B. Raised Golden Rim & Rivets
    const rimGeo = new THREE.PlaneGeometry(w * 1.06, h * 1.04, 12, 16);
    const rPos = rimGeo.attributes.position;
    for (let i = 0; i < rPos.count; i++) {
      const x = rPos.getX(i);
      const y = rPos.getY(i);
      const taper = y < 0 ? 1.0 - Math.pow(Math.abs(y) / ((h * 1.04) * 0.5), 1.6) * 0.45 : 1.0;
      rPos.setX(i, x * taper);
      const normX = x / (w * 0.53);
      const normY = y / (h * 0.52);
      rPos.setZ(i, (1.0 - normX * normX) * 0.065 + (1.0 - normY * normY) * 0.025 - 0.012);
    }
    rimGeo.computeVertexNormals();
    const shieldRim = new THREE.Mesh(rimGeo, this.mats.goldMat);
    this.shield.add(shieldRim);

    // Perimeter golden rivets
    for (let a = 0; a < 14; a++) {
      const angle = (a / 14) * Math.PI * 2;
      const rx = Math.cos(angle) * (w * 0.46);
      const ry = Math.sin(angle) * (h * 0.44);
      const rivet = new THREE.Mesh(
        new THREE.SphereGeometry(0.016, 6, 6),
        this.mats.goldBrightMat
      );
      rivet.position.set(rx, ry, 0.03);
      this.shield.add(rivet);
    }

    // C. The Legendary Phoenix / Firebird Erdrick Crest on Shield Face
    const crestGroup = new THREE.Group();
    crestGroup.position.set(0, 0.04, 0.045);

    // Center ruby heart medallion
    const heart = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.055),
      this.mats.gemRubyMat
    );
    crestGroup.add(heart);

    // Crowned head of Phoenix
    const pHead = new THREE.Mesh(
      new THREE.ConeGeometry(0.04, 0.12, 4),
      this.mats.goldBrightMat
    );
    pHead.position.set(0, 0.15, 0);
    crestGroup.add(pHead);

    // Golden Phoenix Wings sweeping left and right
    for (let side = -1; side <= 1; side += 2) {
      const wing = new THREE.Mesh(
        new THREE.BoxGeometry(0.18, 0.05, 0.02),
        this.mats.goldBrightMat
      );
      wing.rotation.z = side * 0.35;
      wing.position.set(side * 0.12, 0.08, 0);
      crestGroup.add(wing);

      const wingTip = new THREE.Mesh(
        new THREE.ConeGeometry(0.03, 0.12, 4),
        this.mats.goldBrightMat
      );
      wingTip.rotation.z = side * -0.65;
      wingTip.position.set(side * 0.22, 0.14, 0);
      crestGroup.add(wingTip);
    }

    // Three golden tail feathers
    for (let f = -1; f <= 1; f++) {
      const feather = new THREE.Mesh(
        new THREE.BoxGeometry(0.035, 0.18, 0.015),
        this.mats.goldBrightMat
      );
      feather.rotation.z = f * 0.22;
      feather.position.set(f * 0.05, -0.16, 0);
      crestGroup.add(feather);
    }

    this.shield.add(crestGroup);

    // Mounted to left forearm gauntlet (facing outward-forward with slight upward tilt)
    this.shield.position.set(-0.12, -0.48, 0.08);
    this.shield.rotation.set(0.08, -0.42, 0.14);
    this.leftArm.add(this.shield);
  }

  buildTorch() {
    this.torchHand = new THREE.Group();
    this.torchHand.position.set(0.08, -0.55, 0.25);

    // Carved wooden shaft
    const torchWood = new THREE.Mesh(
      new THREE.CylinderGeometry(0.035, 0.025, 0.65, 8),
      this.mats.woodMat
    );
    torchWood.rotation.x = 0.3;
    this.torchHand.add(torchWood);

    // Brass basket / brazier
    const basket = new THREE.Mesh(
      new THREE.CylinderGeometry(0.07, 0.04, 0.10, 8),
      this.mats.goldMat
    );
    basket.position.set(0, 0.30, -0.09);
    basket.rotation.x = 0.3;
    this.torchHand.add(basket);

    // Outer fiery flame
    const flameOuter = new THREE.Mesh(
      new THREE.ConeGeometry(0.12, 0.32, 8),
      new THREE.MeshBasicMaterial({ color: 0xff4500 })
    );
    flameOuter.position.set(0, 0.44, -0.13);
    flameOuter.rotation.x = 0.3;
    this.torchHand.add(flameOuter);

    // Inner bright yellow core
    const flameInner = new THREE.Mesh(
      new THREE.ConeGeometry(0.07, 0.22, 8),
      new THREE.MeshBasicMaterial({ color: 0xffea00 })
    );
    flameInner.position.set(0, 0.42, -0.13);
    flameInner.rotation.x = 0.3;
    this.torchHand.add(flameInner);

    // Dynamic light
    this.playerLight = new THREE.PointLight(0xff9933, 0.0, 18, 1.2);
    this.playerLight.position.set(0, 0.48, -0.13);
    this.torchHand.add(this.playerLight);

    this.torchHand.visible = false;
    this.leftArm.add(this.torchHand);
  }

  buildCarriedPrincess() {
    // Princess Gwaelin in flowing royal gown
    const gownMat = new THREE.MeshToonMaterial({ color: 0xf472b6 }); // Royal Rose Pink
    const gownLaceMat = new THREE.MeshToonMaterial({ color: 0xffffff });
    const hairMat = new THREE.MeshToonMaterial({ color: 0xfde047 }); // Radiant blonde
    const skinMat = new THREE.MeshToonMaterial({ color: 0xfde0cf });
    const tiaraMat = new THREE.MeshToonMaterial({ color: 0xfbbf24 });

    this.princessArmsGroup.position.set(0.1, 1.15, 0.48);
    this.princessArmsGroup.rotation.set(0.12, 0.18, 0.14);

    // Contoured gown
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.20, 0.34, 1.05, 14), gownMat);
    body.rotation.z = Math.PI / 2.15;
    this.princessArmsGroup.add(body);

    // White lace collar & gold embroidery
    const lace = new THREE.Mesh(new THREE.TorusGeometry(0.21, 0.03, 6, 16), gownLaceMat);
    lace.rotation.y = Math.PI / 2;
    lace.position.set(-0.35, 0, 0);
    this.princessArmsGroup.add(lace);

    // Princess Head
    const pHead = new THREE.Mesh(new THREE.SphereGeometry(0.21, 14, 14), skinMat);
    pHead.position.set(-0.62, 0.12, 0);
    this.princessArmsGroup.add(pHead);

    // Flowing golden blonde locks
    const hair = new THREE.Mesh(new THREE.SphereGeometry(0.24, 14, 14), hairMat);
    hair.position.set(-0.65, 0.14, -0.06);
    this.princessArmsGroup.add(hair);

    const hairTress = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.45, 6), hairMat);
    hairTress.rotation.z = -0.4;
    hairTress.position.set(-0.72, -0.12, -0.05);
    this.princessArmsGroup.add(hairTress);

    // Golden Royal Tiara with Ruby
    const tiara = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.06, 8), tiaraMat);
    tiara.position.set(-0.62, 0.33, 0);
    this.princessArmsGroup.add(tiara);

    const tiaraRuby = new THREE.Mesh(new THREE.SphereGeometry(0.035, 6, 6), this.mats.gemRubyMat);
    tiaraRuby.position.set(-0.62, 0.37, 0.10);
    this.princessArmsGroup.add(tiaraRuby);
  }

  setCarryingPrincess(carrying) {
    this.isCarryingPrincess = carrying;
    this.princessArmsGroup.visible = carrying;

    // Adjust arms to hold position
    if (carrying) {
      this.leftArm.rotation.x = -Math.PI / 2.3;
      this.rightArm.rotation.x = -Math.PI / 2.3;
      this.shield.visible = false;
    } else {
      this.leftArm.rotation.x = 0;
      this.rightArm.rotation.x = 0;
      this.shield.visible = true;
    }
  }

  setTorchEquipped(equipped) {
    this.hasTorchEquipped = equipped;
    this.torchHand.visible = equipped || this.hasRadiantActive;
    this.playerLight.intensity = (equipped || this.hasRadiantActive) ? 2.5 : 0.0;
  }

  setRadiantActive(active) {
    this.hasRadiantActive = active;
    this.playerLight.intensity = active ? 3.5 : (this.hasTorchEquipped ? 2.5 : 0.0);
    this.playerLight.color.set(active ? 0xffffff : 0xff9933);
  }

  setWeaponDrawn(drawn) {
    this.isWeaponDrawn = drawn;
    if (!this.sword || !this.scabbard) return;
    if (drawn) {
      this.rightArm.add(this.sword);
      // Sword grip firmly in gauntlet hand, blade extending forward and angled upward ready to fight
      this.sword.position.set(0.01, -0.68, 0.05);
      this.sword.rotation.set(Math.PI * 0.55, 0.0, 0.05);
    } else {
      this.scabbard.add(this.sword);
      this.sword.position.set(0, 0.06, 0);
      this.sword.rotation.set(Math.PI, 0, 0);
    }
  }

  update(delta, input, camera) {
    // 1. Movement vector relative to camera yaw
    const moveX = input.horizontal || 0;
    const moveZ = input.vertical || 0;
    const isMoving = Math.abs(moveX) > 0.05 || Math.abs(moveZ) > 0.05;

    let speed = this.moveSpeed;
    if (input.sprint) speed *= this.sprintMultiplier;

    if (isMoving && camera) {
      // Calculate camera forward & right projected onto XZ plane
      const camForward = new THREE.Vector3();
      camera.getWorldDirection(camForward);
      camForward.y = 0;
      camForward.normalize();

      const camRight = new THREE.Vector3(-camForward.z, 0, camForward.x);

      const moveDir = new THREE.Vector3()
        .addScaledVector(camRight, moveX)
        .addScaledVector(camForward, -moveZ)
        .normalize();

      this.velocity.x = moveDir.x * speed;
      this.velocity.z = moveDir.z * speed;

      // Smooth character rotation
      this.targetRotation = Math.atan2(moveDir.x, moveDir.z);
      const angleDiff = this.targetRotation - this.rotation;
      const normalizedDiff = Math.atan2(Math.sin(angleDiff), Math.cos(angleDiff));
      this.rotation += normalizedDiff * Math.min(1.0, delta * 12.0);
    } else {
      this.velocity.x *= 0.6;
      this.velocity.z *= 0.6;
    }

    // 2. Jump & Gravity
    if (input.jump && this.isGrounded) {
      this.verticalVelocity = this.jumpForce;
      this.isGrounded = false;
    }

    if (!this.isGrounded) {
      this.verticalVelocity += this.gravity * delta;
    }

    // Apply movement
    this.position.x += this.velocity.x * delta;
    this.position.z += this.velocity.z * delta;
    this.position.y += this.verticalVelocity * delta;

    // Ground clamping & terrain collision
    const groundY = this.terrain.getHeight(this.position.x, this.position.z);
    if (this.position.y <= groundY) {
      this.position.y = groundY;
      this.verticalVelocity = 0;
      this.isGrounded = true;
    } else {
      this.isGrounded = false;
    }

    // Update group transform
    this.group.position.copy(this.position);
    this.group.rotation.y = this.rotation;

    // 3. Procedural Heroic Walk / Run Animation
    this.animateHero(delta, isMoving);
  }

  animateHero(delta, isMoving) {
    const time = performance.now() * 0.006;

    // Leg & Arm kinematic swings
    if (isMoving && this.isGrounded) {
      const legAngle = Math.sin(time * 2.2) * 0.65;
      this.leftLeg.rotation.x = legAngle;
      this.rightLeg.rotation.x = -legAngle;

      if (!this.isCarryingPrincess) {
        if (this.isWeaponDrawn) {
          // Combat ready pose while moving: sword held forward, shield raised defensively
          this.rightArm.rotation.x = -0.85 + Math.sin(time * 3.5) * 0.05;
          this.rightArm.rotation.y = -0.22;
          this.rightArm.rotation.z = 0.15;

          this.leftArm.rotation.x = -0.55 + Math.sin(time * 3.5 + Math.PI) * 0.04;
          this.leftArm.rotation.y = 0.28;
          this.leftArm.rotation.z = -0.12;
        } else {
          this.leftArm.rotation.x = -legAngle * 0.55;
          this.leftArm.rotation.z = -0.15;
          this.rightArm.rotation.x = legAngle * 0.55;
          this.rightArm.rotation.y = 0;
          this.rightArm.rotation.z = 0.15;
        }
      }
    } else {
      this.leftLeg.rotation.x *= 0.8;
      this.rightLeg.rotation.x *= 0.8;
      if (!this.isCarryingPrincess) {
        if (this.isWeaponDrawn) {
          // Idle battle stance: hero holds sword out in front ready to fight
          this.rightArm.rotation.x = -0.90;
          this.rightArm.rotation.y = -0.20;
          this.rightArm.rotation.z = 0.15;

          this.leftArm.rotation.x = -0.60;
          this.leftArm.rotation.y = 0.28;
          this.leftArm.rotation.z = -0.12;
        } else {
          this.leftArm.rotation.x *= 0.8;
          this.leftArm.rotation.z = -0.08;
          this.rightArm.rotation.x *= 0.8;
          this.rightArm.rotation.y = 0;
          this.rightArm.rotation.z = 0.08;
        }
      }
    }

    // Subtle heroic breathing bounce
    const breath = Math.sin(time * 0.6) * 0.035;
    this.bodyGroup.position.y = breath;

    // Torso subtle counter-twist during movement
    if (isMoving) {
      this.torsoGroup.rotation.y = Math.sin(time * 2.2) * 0.08;
    } else {
      this.torsoGroup.rotation.y *= 0.8;
    }

    // Cape is stationary (no distracting flapping)
    if (this.cape) {
      this.cape.rotation.x = 0.06;
      this.cape.rotation.z = 0;
    }

    // Torch flicker
    if (this.hasTorchEquipped && this.playerLight) {
      this.playerLight.intensity = 2.4 + Math.sin(time * 18) * 0.35 + Math.cos(time * 26) * 0.2;
    }
  }

  addExp(amount) {
    this.stats.exp += amount;
    if (this.stats.exp >= this.stats.nextExp) {
      this.levelUp();
      return true; // leveled up
    }
    return false;
  }

  levelUp() {
    this.stats.level++;
    this.stats.maxHp += 4 + Math.floor(Math.random() * 3);
    this.stats.hp = this.stats.maxHp;
    this.stats.maxMp += 3 + Math.floor(Math.random() * 3);
    this.stats.mp = this.stats.maxMp;
    this.stats.attack += 2 + Math.floor(Math.random() * 2);
    this.stats.defense += 2;
    this.stats.agility += 2;
    this.stats.nextExp = Math.floor(this.stats.nextExp * 2.1 + 10);

    // Spells unlocked by level (authentic Dragon Warrior progression)
    if (this.stats.level === 3 && !this.spells.includes('HEAL')) this.spells.push('HEAL');
    if (this.stats.level === 4 && !this.spells.includes('HURT')) this.spells.push('HURT');
    if (this.stats.level === 7 && !this.spells.includes('SLEEP')) this.spells.push('SLEEP');
    if (this.stats.level === 9 && !this.spells.includes('RADIANT')) this.spells.push('RADIANT');
    if (this.stats.level === 10 && !this.spells.includes('STOPSPELL')) this.spells.push('STOPSPELL');
    if (this.stats.level === 12 && !this.spells.includes('HEALMORE')) this.spells.push('HEALMORE');
    if (this.stats.level === 15 && !this.spells.includes('HURTMORE')) this.spells.push('HURTMORE');
  }
}
