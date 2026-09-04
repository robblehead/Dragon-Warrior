// Town of Brecconary: Medieval Cottages, Weaponsmith, Alchemist, Inn, Plaza, and Mini-Games
import * as THREE from 'three';

export class BrecconaryTown {
  constructor(scene, terrain) {
    this.scene = scene;
    this.terrain = terrain;
    this.group = new THREE.Group();
    this.interactiveObjects = [];
    this.townCenter = new THREE.Vector3(45, 1.4, -10);

    this.buildTownPlaza();
    this.buildWeaponsmith();
    this.buildAlchemistShop();
    this.buildInn();
    this.buildCottages();
    this.buildMiniGameStalls();
    this.scene.add(this.group);
  }

  buildTownPlaza() {
    const cx = this.townCenter.x;
    const cz = this.townCenter.z;
    const baseY = this.townCenter.y;

    const stoneMat = new THREE.MeshToonMaterial({ color: 0x94a3b8 }); // Slate cobblestone
    const stoneTrimMat = new THREE.MeshToonMaterial({ color: 0x64748b });

    // Plaza Cobblestone Circle with raised stone curb
    const plazaGeo = new THREE.CircleGeometry(12, 32);
    plazaGeo.rotateX(-Math.PI / 2);
    const plazaMesh = new THREE.Mesh(plazaGeo, stoneMat);
    plazaMesh.position.set(cx, baseY + 0.02, cz);
    plazaMesh.receiveShadow = true;
    this.group.add(plazaMesh);

    // Stone curb ring around plaza
    const curbGeo = new THREE.RingGeometry(11.8, 12.3, 32);
    curbGeo.rotateX(-Math.PI / 2);
    const curbMesh = new THREE.Mesh(curbGeo, stoneTrimMat);
    curbMesh.position.set(cx, baseY + 0.03, cz);
    this.group.add(curbMesh);

    // Radiating Cobblestone Walkways connecting the town
    const paths = [
      // North path toward castle gate
      { w: 4.5, l: 14, x: cx, z: cz - 14, rot: 0 },
      // South path toward market stalls
      { w: 4.5, l: 16, x: cx, z: cz + 14, rot: 0 },
      // West path toward Weaponsmith & Inn
      { w: 4.0, l: 15, x: cx - 12, z: cz, rot: Math.PI / 2 },
      // East path toward Alchemist & Cottage
      { w: 4.0, l: 15, x: cx + 12, z: cz, rot: Math.PI / 2 }
    ];

    paths.forEach(p => {
      const pathGeo = new THREE.PlaneGeometry(p.w, p.l);
      pathGeo.rotateX(-Math.PI / 2);
      pathGeo.rotateY(p.rot);
      const pathMesh = new THREE.Mesh(pathGeo, stoneMat);
      pathMesh.position.set(p.x, baseY + 0.02, p.z);
      pathMesh.receiveShadow = true;
      this.group.add(pathMesh);
    });

    // Central Multi-Tier Stone Fountain
    const fountainGroup = new THREE.Group();
    fountainGroup.position.set(cx, baseY, cz);

    const basinMat = new THREE.MeshToonMaterial({ color: 0x475569 });
    const waterMat = new THREE.MeshToonMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.85 });

    // Outer octagonal stone basin ring
    const basin = new THREE.Mesh(new THREE.CylinderGeometry(2.8, 3.1, 0.75, 16), basinMat);
    basin.position.y = 0.38;
    basin.castShadow = true;
    fountainGroup.add(basin);

    // Fountain water
    const fWater = new THREE.Mesh(new THREE.CylinderGeometry(2.65, 2.65, 0.6, 16), waterMat);
    fWater.position.y = 0.46;
    fountainGroup.add(fWater);

    // Center carved pedestal
    const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.75, 1.8, 12), basinMat);
    pedestal.position.y = 1.0;
    fountainGroup.add(pedestal);

    // Upper tiered bowl
    const topBowl = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 0.45, 0.45, 12), basinMat);
    topBowl.position.y = 1.9;
    fountainGroup.add(topBowl);

    const topWater = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 0.2, 12), waterMat);
    topWater.position.y = 2.05;
    fountainGroup.add(topWater);

    // Polished Dragon Warrior Slime Mascot atop fountain!
    const slimeMat = new THREE.MeshToonMaterial({ color: 0x0284c7 });
    const slimeStatue = new THREE.Mesh(new THREE.SphereGeometry(0.4, 16, 16), slimeMat);
    slimeStatue.scale.set(1.15, 0.85, 1.15);
    slimeStatue.position.y = 2.45;
    fountainGroup.add(slimeStatue);

    const slimeTip = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.35, 12), slimeMat);
    slimeTip.position.y = 2.75;
    fountainGroup.add(slimeTip);

    this.group.add(fountainGroup);

    // Classic carved wooden tavern benches around fountain
    this.addBench(cx - 5.0, baseY, cz, 0);
    this.addBench(cx + 5.0, baseY, cz, Math.PI);
    this.addBench(cx, baseY, cz - 5.0, Math.PI / 2);
    this.addBench(cx, baseY, cz + 5.0, -Math.PI / 2);

    // Charming street lanterns on timber posts
    this.addStreetLantern(cx - 4.5, baseY, cz - 4.5);
    this.addStreetLantern(cx + 4.5, baseY, cz - 4.5);
    this.addStreetLantern(cx - 4.5, baseY, cz + 4.5);
    this.addStreetLantern(cx + 4.5, baseY, cz + 4.5);
  }

  buildWeaponsmith() {
    // Located west of plaza at (cx - 10, cz + 6)
    const x = this.townCenter.x - 10;
    const z = this.townCenter.z + 6;
    const y = this.townCenter.y;

    this.buildHouse(x, y, z, 7.5, 5.0, 5.5, 0x991b1b, 'Weapons & Armor', 'weaponsmith', -Math.PI * 0.15);

    // Outdoor Blacksmith Forge & Anvil
    const forgeGroup = new THREE.Group();
    forgeGroup.position.set(x + 4.6, y, z - 1.2);

    const stoneMat = new THREE.MeshToonMaterial({ color: 0x475569 });
    const fireMat = new THREE.MeshBasicMaterial({ color: 0xff4500 });
    const ironMat = new THREE.MeshToonMaterial({ color: 0x1e293b });

    // Stone furnace & chimney
    const furnace = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.5, 1.8), stoneMat);
    furnace.position.y = 0.75;
    furnace.castShadow = true;
    forgeGroup.add(furnace);

    // Stone chimney exhaust
    const fChim = new THREE.Mesh(new THREE.BoxGeometry(0.9, 2.2, 0.9), stoneMat);
    fChim.position.set(0, 2.4, 0);
    forgeGroup.add(fChim);

    // Glowing coals
    const coals = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.25, 1.2), fireMat);
    coals.position.y = 1.45;
    forgeGroup.add(coals);

    const forgeLight = new THREE.PointLight(0xff6600, 1.8, 10);
    forgeLight.position.y = 1.8;
    forgeGroup.add(forgeLight);

    // Heavy iron anvil on timber log stump
    const log = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.45, 0.5, 10), new THREE.MeshToonMaterial({ color: 0x5c2c16 }));
    log.position.set(-1.8, 0.25, 0.5);
    forgeGroup.add(log);

    const anvil = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.45, 0.35), ironMat);
    anvil.position.set(-1.8, 0.7, 0.5);
    anvil.castShadow = true;
    forgeGroup.add(anvil);

    // Weapon Rack displaying 3D Swords & Shield
    const rack = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.4, 0.2), new THREE.MeshToonMaterial({ color: 0x78350f }));
    rack.position.set(-1.8, 0.7, -1.2);
    forgeGroup.add(rack);

    // Displayed swords on rack
    const swordBlade = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.1, 0.04), new THREE.MeshToonMaterial({ color: 0xd97706 }));
    swordBlade.position.set(-1.8, 0.8, -1.05);
    forgeGroup.add(swordBlade);

    const swordBlade2 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.9, 0.04), new THREE.MeshToonMaterial({ color: 0x94a3b8 }));
    swordBlade2.position.set(-1.4, 0.75, -1.05);
    forgeGroup.add(swordBlade2);

    this.group.add(forgeGroup);

    this.interactiveObjects.push({
      type: 'shop_weapon',
      name: 'Garrick the Weaponsmith',
      position: new THREE.Vector3(x + 2.0, y, z + 1.2)
    });
  }

  buildAlchemistShop() {
    // Located east of plaza at (cx + 10, cz + 6)
    const x = this.townCenter.x + 10;
    const z = this.townCenter.z + 6;
    const y = this.townCenter.y;

    this.buildHouse(x, y, z, 7.2, 5.0, 5.4, 0x15803d, 'Alchemist & Items', 'alchemist', Math.PI * 0.15);

    // Herb drying rack & potion barrels on outdoor patio
    const shopProp = new THREE.Group();
    shopProp.position.set(x - 4.2, y, z - 1.0);

    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.5, 1.0, 12), new THREE.MeshToonMaterial({ color: 0x78350f }));
    barrel.position.y = 0.5;
    barrel.castShadow = true;
    shopProp.add(barrel);

    const barrel2 = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.42, 0.85, 10), new THREE.MeshToonMaterial({ color: 0x5c2c16 }));
    barrel2.position.set(0.65, 0.42, -0.4);
    barrel2.castShadow = true;
    shopProp.add(barrel2);

    // Outdoor potion display table
    const table = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.8, 0.9), new THREE.MeshToonMaterial({ color: 0x92400e }));
    table.position.set(0.2, 0.4, 1.0);
    shopProp.add(table);

    // Glowing alchemical flasks
    const potion1 = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 0.35, 8), new THREE.MeshToonMaterial({ color: 0x22c55e }));
    potion1.position.set(-0.2, 0.95, 1.0);
    shopProp.add(potion1);

    const potion2 = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 0.35, 8), new THREE.MeshToonMaterial({ color: 0x3b82f6 }));
    potion2.position.set(0.3, 0.95, 1.0);
    shopProp.add(potion2);

    const potion3 = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 8), new THREE.MeshToonMaterial({ color: 0xec4899 }));
    potion3.position.set(0.05, 0.95, 0.8);
    shopProp.add(potion3);

    this.group.add(shopProp);

    this.interactiveObjects.push({
      type: 'shop_item',
      name: 'Fiona the Alchemist',
      position: new THREE.Vector3(x - 2.0, y, z + 1.2)
    });
  }

  buildInn() {
    // Located at (cx - 9, cz - 8)
    const x = this.townCenter.x - 9;
    const z = this.townCenter.z - 8;
    const y = this.townCenter.y;

    this.buildHouse(x, y, z, 9.2, 5.4, 6.8, 0x1e40af, "The Travelers' Inn", 'inn', Math.PI * 0.85);

    this.interactiveObjects.push({
      type: 'inn',
      name: "Martha the Innkeeper",
      position: new THREE.Vector3(x + 1.5, y, z - 1.2)
    });
  }

  buildCottages() {
    // Residential cottage at (cx + 9, cz - 8)
    const x = this.townCenter.x + 9;
    const z = this.townCenter.z - 8;
    const y = this.townCenter.y;

    this.buildHouse(x, y, z, 6.8, 4.8, 5.2, 0xa16207, 'Cozy Cottage', 'none', -Math.PI * 0.85);

    // Breakable pots outside cottage doorstep
    this.addBreakablePot(x - 2.6, y + 0.3, z - 3.2, 'herb');
    this.addBreakablePot(x - 1.8, y + 0.3, z - 3.2, 'gold_15');
  }

  buildHouse(x, y, z, width, height, depth, roofColor, signText, signType = 'none', rotY = 0) {
    const house = new THREE.Group();
    house.position.set(x, y, z);
    house.rotation.y = rotY;

    const stoneMat = new THREE.MeshToonMaterial({ color: 0x475569 }); // Weathered fieldstone plinth
    const stoneTrimMat = new THREE.MeshToonMaterial({ color: 0x334155 });
    const plasterMat = new THREE.MeshToonMaterial({ color: 0xfdf6e2 }); // Cream stucco plaster
    const timberMat = new THREE.MeshToonMaterial({ color: 0x3e1f0e }); // Dark Tudor oak timber
    const timberLightMat = new THREE.MeshToonMaterial({ color: 0x5c2c16 });
    const roofMat = new THREE.MeshToonMaterial({ color: roofColor || 0x991b1b }); // Roof tile color
    const roofTrimMat = new THREE.MeshToonMaterial({ color: 0x27272a }); // Ridge & trim dark
    const ironMat = new THREE.MeshToonMaterial({ color: 0x18181b }); // Wrought iron hardware

    const halfW = width * 0.5;
    const halfD = depth * 0.5;

    // 1. Cobblestone Plinth / Stone Foundation (First 0.85m)
    const plinthH = 0.85;
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(width + 0.25, plinthH, depth + 0.25), stoneMat);
    plinth.position.y = plinthH * 0.5;
    plinth.castShadow = true;
    plinth.receiveShadow = true;
    house.add(plinth);

    // Stone water table / drip molding
    const dripMold = new THREE.Mesh(new THREE.BoxGeometry(width + 0.35, 0.12, depth + 0.35), stoneTrimMat);
    dripMold.position.y = plinthH + 0.06;
    house.add(dripMold);

    // 2. Upper Half-Timbered Plaster Walls
    const wallH = height - plinthH;
    const wallCenterY = plinthH + wallH * 0.5;
    const walls = new THREE.Mesh(new THREE.BoxGeometry(width, wallH, depth), plasterMat);
    walls.position.y = wallCenterY;
    walls.castShadow = true;
    walls.receiveShadow = true;
    house.add(walls);

    // 3. Tudor Timber Framework (Vertical Corner Posts, Sill & Wall Plates, and Cross Braces)
    const postThick = 0.32;
    const postGeo = new THREE.BoxGeometry(postThick, wallH, postThick);
    [
      [-halfW, -halfD], [halfW, -halfD],
      [-halfW, halfD], [halfW, halfD]
    ].forEach(([px, pz]) => {
      const post = new THREE.Mesh(postGeo, timberMat);
      post.position.set(px, wallCenterY, pz);
      post.castShadow = true;
      house.add(post);
    });

    // Horizontal timber mid-rail and top plate
    const midRailF = new THREE.Mesh(new THREE.BoxGeometry(width, 0.18, 0.12), timberMat);
    midRailF.position.set(0, plinthH + wallH * 0.52, halfD + 0.04);
    house.add(midRailF);

    const midRailB = new THREE.Mesh(new THREE.BoxGeometry(width, 0.18, 0.12), timberMat);
    midRailB.position.set(0, plinthH + wallH * 0.52, -halfD - 0.04);
    house.add(midRailB);

    const midRailL = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.18, depth), timberMat);
    midRailL.position.set(-halfW - 0.04, plinthH + wallH * 0.52, 0);
    house.add(midRailL);

    const midRailR = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.18, depth), timberMat);
    midRailR.position.set(halfW + 0.04, plinthH + wallH * 0.52, 0);
    house.add(midRailR);

    // Diagonal decorative Tudor cross braces on side walls (X-framing)
    [-halfW - 0.03, halfW + 0.03].forEach(px => {
      const brace1 = new THREE.Mesh(new THREE.BoxGeometry(0.08, Math.hypot(depth * 0.45, wallH * 0.45), 0.14), timberMat);
      brace1.position.set(px, plinthH + wallH * 0.28, 0);
      brace1.rotation.x = Math.PI / 4.2;
      house.add(brace1);

      const brace2 = new THREE.Mesh(new THREE.BoxGeometry(0.08, Math.hypot(depth * 0.45, wallH * 0.45), 0.14), timberMat);
      brace2.position.set(px, plinthH + wallH * 0.28, 0);
      brace2.rotation.x = -Math.PI / 4.2;
      house.add(brace2);
    });

    // 4. True Gabled A-Frame Pitched Roof with Overhangs & Wooden Fascia
    const roofOverhangW = 0.55;
    const roofOverhangD = 0.65;
    const roofSpanW = width + roofOverhangW * 2;
    const roofSpanD = depth + roofOverhangD * 2;
    const roofPitchH = 2.4;
    const roofPeakY = height + roofPitchH;

    // Left and Right Roof Pitch Slopes
    const slopeLen = Math.hypot(roofSpanW * 0.5, roofPitchH) + 0.15;
    const slopeAngle = Math.atan2(roofPitchH, roofSpanW * 0.5);
    const slopeGeo = new THREE.BoxGeometry(slopeLen, 0.16, roofSpanD);

    // Left roof slope
    const leftSlope = new THREE.Mesh(slopeGeo, roofMat);
    leftSlope.position.set(-roofSpanW * 0.25, height + roofPitchH * 0.48, 0);
    leftSlope.rotation.z = slopeAngle;
    leftSlope.castShadow = true;
    house.add(leftSlope);

    // Right roof slope
    const rightSlope = new THREE.Mesh(slopeGeo, roofMat);
    rightSlope.position.set(roofSpanW * 0.25, height + roofPitchH * 0.48, 0);
    rightSlope.rotation.z = -slopeAngle;
    rightSlope.castShadow = true;
    house.add(rightSlope);

    // Ridge cap along the peak
    const ridgeCap = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.22, roofSpanD + 0.1), roofTrimMat);
    ridgeCap.position.set(0, roofPeakY + 0.05, 0);
    house.add(ridgeCap);

    // Front & Back Gable Wall Fillers (Triangles)
    [-halfD, halfD].forEach(gz => {
      const gableGeo = new THREE.BufferGeometry();
      const hw = halfW;
      const gh = roofPitchH;
      const vertices = new Float32Array([
        -hw, 0, 0,
         hw, 0, 0,
          0, gh, 0
      ]);
      gableGeo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
      gableGeo.computeVertexNormals();
      const gableMesh = new THREE.Mesh(gableGeo, plasterMat);
      gableMesh.position.set(0, height, gz);
      house.add(gableMesh);

      // Carved timber bargeboard / verge board along gable edge
      const vergeL = new THREE.Mesh(new THREE.BoxGeometry(slopeLen, 0.22, 0.12), timberMat);
      vergeL.position.set(-roofSpanW * 0.25, height + roofPitchH * 0.48, gz + (gz > 0 ? roofOverhangD : -roofOverhangD));
      vergeL.rotation.z = slopeAngle;
      house.add(vergeL);

      const vergeR = new THREE.Mesh(new THREE.BoxGeometry(slopeLen, 0.22, 0.12), timberMat);
      vergeR.position.set(roofSpanW * 0.25, height + roofPitchH * 0.48, gz + (gz > 0 ? roofOverhangD : -roofOverhangD));
      vergeR.rotation.z = -slopeAngle;
      house.add(vergeR);

      // Peak timber finial
      const finial = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.6, 0.14), timberLightMat);
      finial.position.set(0, roofPeakY + 0.25, gz + (gz > 0 ? roofOverhangD : -roofOverhangD));
      house.add(finial);
    });

    // 5. Authentic Recessed Wooden Plank Door with Stone Surround
    const doorFrame = new THREE.Mesh(new THREE.BoxGeometry(1.65, 2.45, 0.25), stoneTrimMat);
    doorFrame.position.set(0, 1.25, halfD + 0.08);
    house.add(doorFrame);

    const door = new THREE.Mesh(new THREE.BoxGeometry(1.25, 2.2, 0.16), new THREE.MeshToonMaterial({ color: 0x451a03 }));
    door.position.set(0, 1.15, halfD + 0.12);
    door.castShadow = true;
    house.add(door);

    // Iron strap hinges on door
    [0.6, 1.7].forEach(hy => {
      const hinge = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.06, 0.03), ironMat);
      hinge.position.set(-0.15, hy, halfD + 0.21);
      house.add(hinge);
    });

    // Iron ring knocker & handle
    const knocker = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.015, 6, 12), ironMat);
    knocker.position.set(0.35, 1.15, halfD + 0.22);
    house.add(knocker);

    // Stone doorstep
    const step = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.18, 0.6), stoneMat);
    step.position.set(0, 0.09, halfD + 0.4);
    house.add(step);

    // Overhead wooden door canopy hood
    const hood = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.14, 0.75), timberMat);
    hood.position.set(0, 2.55, halfD + 0.42);
    hood.rotation.x = 0.12;
    house.add(hood);

    // 6. Multi-Pane Lattice Windows with Flower Boxes
    this.addCharmingWindow(house, -halfW * 0.55, plinthH + wallH * 0.5, halfD + 0.06, 0);
    if (width > 7.0) {
      this.addCharmingWindow(house, halfW * 0.55, plinthH + wallH * 0.5, halfD + 0.06, 0);
    }
    // Side windows
    this.addCharmingWindow(house, halfW + 0.06, plinthH + wallH * 0.5, 0, Math.PI / 2);

    // 7. Stepped Fieldstone Chimney
    const chimX = halfW * 0.65;
    const chimZ = -halfD - 0.2;
    const chimney = new THREE.Mesh(new THREE.BoxGeometry(1.1, height + 1.6, 1.1), stoneMat);
    chimney.position.set(chimX, (height + 1.6) * 0.5, chimZ);
    chimney.castShadow = true;
    house.add(chimney);

    const chimPot = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.32, 0.75, 8), new THREE.MeshToonMaterial({ color: 0xc2410c }));
    chimPot.position.set(chimX, height + 1.85, chimZ);
    house.add(chimPot);

    // 8. Hanging Wrought-Iron Shop Sign
    if (signType !== 'none') {
      this.addShopSign(house, 1.2, 2.8, halfD + 0.1, signType);
    }

    // 9. Porch Props (Barrels / Crates)
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.4, 0.85, 10), timberLightMat);
    barrel.position.set(-halfW * 0.75, 0.45, halfD + 0.55);
    house.add(barrel);

    this.group.add(house);
    return house;
  }

  addCharmingWindow(parent, x, y, z, rotY) {
    const winGroup = new THREE.Group();
    winGroup.position.set(x, y, z);
    winGroup.rotation.y = rotY;

    const frameMat = new THREE.MeshToonMaterial({ color: 0x3e1f0e });
    const glassMat = new THREE.MeshBasicMaterial({ color: 0xfef08a }); // Warm candlelit glow
    const shutterMat = new THREE.MeshToonMaterial({ color: 0x451a03 });
    const planterMat = new THREE.MeshToonMaterial({ color: 0x78350f });
    const foliageMat = new THREE.MeshToonMaterial({ color: 0x16a34a });
    const flowerMat = new THREE.MeshToonMaterial({ color: 0xef4444 });

    // Outer timber window frame
    const frame = new THREE.Mesh(new THREE.BoxGeometry(1.25, 1.25, 0.12), frameMat);
    winGroup.add(frame);

    // Warm luminous glass pane
    const glass = new THREE.Mesh(new THREE.PlaneGeometry(0.95, 0.95), glassMat);
    glass.position.z = 0.06;
    winGroup.add(glass);

    // Window muntins (+ lattice cross divider)
    const mullionV = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.95, 0.04), frameMat);
    mullionV.position.z = 0.08;
    winGroup.add(mullionV);

    const mullionH = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.06, 0.04), frameMat);
    mullionH.position.z = 0.08;
    winGroup.add(mullionH);

    // Open wooden shutters on left and right
    const shutterL = new THREE.Mesh(new THREE.BoxGeometry(0.45, 1.15, 0.06), shutterMat);
    shutterL.position.set(-0.75, 0, 0.08);
    shutterL.rotation.y = -0.25;
    winGroup.add(shutterL);

    const shutterR = new THREE.Mesh(new THREE.BoxGeometry(0.45, 1.15, 0.06), shutterMat);
    shutterR.position.set(0.75, 0, 0.08);
    shutterR.rotation.y = 0.25;
    winGroup.add(shutterR);

    // Window flower planter box below the sill!
    const planter = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.22, 0.35), planterMat);
    planter.position.set(0, -0.65, 0.2);
    winGroup.add(planter);

    // Foliage & Flower blossoms in planter
    const foliage = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.16, 0.28), foliageMat);
    foliage.position.set(0, -0.54, 0.2);
    winGroup.add(foliage);

    for (let fx of [-0.42, -0.2, 0.05, 0.32]) {
      const fl = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 6), flowerMat);
      fl.position.set(fx, -0.44, 0.2 + (Math.random() - 0.5) * 0.1);
      winGroup.add(fl);
    }

    parent.add(winGroup);
  }

  addShopSign(parent, x, y, z, type) {
    const signGroup = new THREE.Group();
    signGroup.position.set(x, y, z);

    const ironMat = new THREE.MeshToonMaterial({ color: 0x18181b });
    const woodMat = new THREE.MeshToonMaterial({ color: 0x78350f });
    const goldMat = new THREE.MeshToonMaterial({ color: 0xf59e0b });

    // Wrought-iron scrollwork bracket
    const rod = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 0.95), ironMat);
    rod.position.set(0, 0, 0.45);
    signGroup.add(rod);

    const scroll = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.025, 6, 12, Math.PI * 1.3), ironMat);
    scroll.rotation.y = Math.PI / 2;
    scroll.position.set(0, -0.15, 0.3);
    signGroup.add(scroll);

    // Hanging signboard
    const board = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.65, 0.65), woodMat);
    board.position.set(0, -0.42, 0.7);
    board.castShadow = true;
    signGroup.add(board);

    // Emblem on both sides of signboard
    if (type === 'weaponsmith') {
      // Crossed golden swords icon
      [-0.04, 0.04].forEach(sx => {
        const sw1 = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.45, 0.06), goldMat);
        sw1.position.set(sx, -0.42, 0.7);
        sw1.rotation.x = Math.PI / 4;
        signGroup.add(sw1);

        const sw2 = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.45, 0.06), goldMat);
        sw2.position.set(sx, -0.42, 0.7);
        sw2.rotation.x = -Math.PI / 4;
        signGroup.add(sw2);
      });
    } else if (type === 'alchemist') {
      // Green potion bottle icon
      const potionMat = new THREE.MeshToonMaterial({ color: 0x22c55e });
      [-0.04, 0.04].forEach(sx => {
        const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.14, 0.35, 8), potionMat);
        pot.position.set(sx, -0.42, 0.7);
        signGroup.add(pot);
      });
    } else if (type === 'inn') {
      // Golden tavern mug icon
      [-0.04, 0.04].forEach(sx => {
        const mug = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.32, 8), goldMat);
        mug.position.set(sx, -0.42, 0.7);
        signGroup.add(mug);
      });
    }

    parent.add(signGroup);
  }

  buildMiniGameStalls() {
    const baseY = this.townCenter.y;

    // Mini-Game 1: Slime Archery Range at (cx + 2, cz + 13)
    const ax = this.townCenter.x + 2;
    const az = this.townCenter.z + 13;

    const rangeGroup = new THREE.Group();
    rangeGroup.position.set(ax, baseY, az);

    const woodMat = new THREE.MeshToonMaterial({ color: 0x5c2c16 });
    const woodLightMat = new THREE.MeshToonMaterial({ color: 0x78350f });
    const stoneMat = new THREE.MeshToonMaterial({ color: 0x64748b });
    const canopyRedMat = new THREE.MeshToonMaterial({ color: 0xdc2626 });
    const canopyWhiteMat = new THREE.MeshToonMaterial({ color: 0xfef08a });

    // Raised timber deck foundation for stall
    const deck = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.2, 2.8), woodMat);
    deck.position.set(0, 0.1, 0.4);
    rangeGroup.add(deck);

    // 4 Sturdy Turned Timber Corner Pillars (anchoring canopy to deck!)
    const pillarGeo = new THREE.CylinderGeometry(0.09, 0.11, 2.6, 8);
    [
      [-2.1, -0.6], [2.1, -0.6],
      [-2.1, 1.4], [2.1, 1.4]
    ].forEach(([px, pz]) => {
      const pillar = new THREE.Mesh(pillarGeo, woodLightMat);
      pillar.position.set(px, 1.3, pz);
      pillar.castShadow = true;
      rangeGroup.add(pillar);
    });

    // Solid paneled wooden service counter
    const counter = new THREE.Mesh(new THREE.BoxGeometry(4.2, 1.05, 0.9), woodLightMat);
    counter.position.set(0, 0.55, 0.2);
    counter.castShadow = true;
    rangeGroup.add(counter);

    // Quiver of arrows on counter
    const quiver = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.08, 0.65, 8), woodMat);
    quiver.position.set(-1.6, 1.2, 0.2);
    quiver.rotation.z = -0.15;
    rangeGroup.add(quiver);

    // Striped festival awning canopy with 5 pitched alternating color stripes
    const canopyGroup = new THREE.Group();
    canopyGroup.position.set(0, 2.6, 0.4);

    const stripeW = 4.8 / 5;
    for (let i = 0; i < 5; i++) {
      const stripeMesh = new THREE.Mesh(
        new THREE.BoxGeometry(stripeW, 0.14, 2.5),
        i % 2 === 0 ? canopyRedMat : canopyWhiteMat
      );
      stripeMesh.position.set(-2.4 + stripeW * 0.5 + i * stripeW, 0, 0);
      canopyGroup.add(stripeMesh);
    }
    // Scalloped front valance
    const valance = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.35, 0.08), canopyRedMat);
    valance.position.set(0, -0.2, 1.25);
    canopyGroup.add(valance);

    canopyGroup.rotation.x = -0.08;
    rangeGroup.add(canopyGroup);

    // Authentic Target Range in the back: timber target frame stands firmly planted on the ground
    const targetBackZ = 6.8;
    const groundStand = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.2, 1.2), woodMat);
    groundStand.position.set(0, 0.1, targetBackZ);
    rangeGroup.add(groundStand);

    // Target backboard supported by twin timber legs
    for (let lx of [-2.0, 2.0]) {
      const tLeg = new THREE.Mesh(new THREE.BoxGeometry(0.18, 2.6, 0.18), woodMat);
      tLeg.position.set(lx, 1.3, targetBackZ);
      rangeGroup.add(tLeg);
    }

    const backboard = new THREE.Mesh(new THREE.BoxGeometry(4.6, 1.8, 0.18), woodLightMat);
    backboard.position.set(0, 1.6, targetBackZ);
    rangeGroup.add(backboard);

    // 3 Cute Pop-Up Slime Archery Targets mounted to backboard
    const targetMat = new THREE.MeshToonMaterial({ color: 0x0284c7 });

    for (let t = -1; t <= 1; t++) {
      const tGroup = new THREE.Group();
      tGroup.position.set(t * 1.5, 1.6, targetBackZ - 0.15);

      // Straw target disc
      const strawDisc = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.1, 16), new THREE.MeshToonMaterial({ color: 0xd4a373 }));
      strawDisc.rotation.x = Math.PI / 2;
      tGroup.add(strawDisc);

      // Slime shape target
      const slimeTarget = new THREE.Mesh(new THREE.SphereGeometry(0.32, 12, 12), targetMat);
      slimeTarget.scale.set(1.15, 0.85, 1.15);
      slimeTarget.position.z = 0.08;
      tGroup.add(slimeTarget);

      const slimeTip = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.25, 10), targetMat);
      slimeTip.position.set(0, 0.22, 0.08);
      tGroup.add(slimeTip);

      rangeGroup.add(tGroup);
    }

    this.group.add(rangeGroup);

    this.interactiveObjects.push({
      type: 'minigame_archery',
      name: 'Slime Archery Range',
      position: new THREE.Vector3(ax, baseY, az)
    });

    // Mini-Game 2: Lucky Lotto & Dice Pavilion at (cx - 4, cz + 13)
    const lx = this.townCenter.x - 4;
    const lz = this.townCenter.z + 13;

    const lottoGroup = new THREE.Group();
    lottoGroup.position.set(lx, baseY, lz);

    // Octagonal stone pavilion plinth
    const pavPlinth = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.5, 0.25, 8), stoneMat);
    pavPlinth.position.y = 0.12;
    lottoGroup.add(pavPlinth);

    // 4 Corner Timber Pillars
    for (let pa = 0; pa < Math.PI * 2; pa += Math.PI / 2) {
      const pCol = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.1, 2.6, 8), woodLightMat);
      pCol.position.set(Math.cos(pa + Math.PI / 4) * 1.8, 1.3, Math.sin(pa + Math.PI / 4) * 1.8);
      lottoGroup.add(pCol);
    }

    // Peaked pavilion roof
    const pavRoof = new THREE.Mesh(new THREE.ConeGeometry(2.6, 1.4, 8), new THREE.MeshToonMaterial({ color: 0x15803d }));
    pavRoof.position.y = 3.2;
    lottoGroup.add(pavRoof);

    // Hanging Brass Lantern
    const lantern = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.35, 0.24), new THREE.MeshBasicMaterial({ color: 0xfef08a }));
    lantern.position.y = 2.2;
    lottoGroup.add(lantern);

    // Lotto Casino Table with 4 Carved Wooden Trestle Legs
    const tableH = 0.9;
    const tableMat = new THREE.MeshToonMaterial({ color: 0x166534 }); // Rich green felt baize
    const lottoTable = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.4, 0.12, 16), tableMat);
    lottoTable.position.y = tableH;
    lottoGroup.add(lottoTable);

    // Table rim in mahogany
    const tableRim = new THREE.Mesh(new THREE.TorusGeometry(1.4, 0.08, 6, 16), woodMat);
    tableRim.rotation.x = Math.PI / 2;
    tableRim.position.y = tableH + 0.04;
    lottoGroup.add(tableRim);

    // Sturdy central pedestal & 4 carved claw legs
    const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.28, tableH - 0.1, 10), woodMat);
    pedestal.position.y = (tableH - 0.1) * 0.5 + 0.1;
    lottoGroup.add(pedestal);

    for (let la = 0; la < Math.PI * 2; la += Math.PI / 2) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.15, 0.15), woodMat);
      leg.position.set(Math.cos(la) * 0.45, 0.15, Math.sin(la) * 0.45);
      leg.rotation.y = -la;
      lottoGroup.add(leg);
    }

    // Gold dice atop table
    const diceMat = new THREE.MeshToonMaterial({ color: 0xf59e0b });
    const die1 = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.2), diceMat);
    die1.position.set(-0.22, tableH + 0.12, 0.1);
    die1.rotation.set(0.2, 0.5, 0.1);
    lottoGroup.add(die1);

    const die2 = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.2), diceMat);
    die2.position.set(0.22, tableH + 0.12, -0.1);
    die2.rotation.set(-0.3, 0.8, -0.2);
    lottoGroup.add(die2);

    // Brass dice cup
    const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.14, 0.35, 10), new THREE.MeshToonMaterial({ color: 0xd97706 }));
    cup.position.set(0, tableH + 0.2, -0.4);
    lottoGroup.add(cup);

    this.group.add(lottoGroup);

    this.interactiveObjects.push({
      type: 'minigame_lotto',
      name: 'Brecconary Lucky Lotto',
      position: new THREE.Vector3(lx, baseY, lz)
    });
  }

  addBench(x, y, z, rotY) {
    const benchGroup = new THREE.Group();
    benchGroup.position.set(x, y, z);
    benchGroup.rotation.y = rotY;

    const woodMat = new THREE.MeshToonMaterial({ color: 0x78350f });
    const ironMat = new THREE.MeshToonMaterial({ color: 0x1e293b });

    // Cast-iron carved side trestle legs
    [-0.75, 0.75].forEach(lx => {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.5, 0.5), ironMat);
      leg.position.set(lx, 0.25, 0);
      benchGroup.add(leg);

      const backPost = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.8, 0.1), ironMat);
      backPost.position.set(lx, 0.5, -0.22);
      benchGroup.add(backPost);
    });

    // Wood seat slats
    const seat = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.08, 0.52), woodMat);
    seat.position.set(0, 0.48, 0);
    seat.castShadow = true;
    benchGroup.add(seat);

    // Wood backrest slat
    const back = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.35, 0.08), woodMat);
    back.position.set(0, 0.75, -0.22);
    benchGroup.add(back);

    this.group.add(benchGroup);
  }

  addStreetLantern(x, y, z) {
    const lanternGroup = new THREE.Group();
    lanternGroup.position.set(x, y, z);

    const woodMat = new THREE.MeshToonMaterial({ color: 0x451a03 });
    const ironMat = new THREE.MeshToonMaterial({ color: 0x18181b });
    const glowMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });

    // Timber post
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 3.2, 8), woodMat);
    post.position.y = 1.6;
    lanternGroup.add(post);

    // Iron curved bracket
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.6), ironMat);
    arm.position.set(0, 3.1, 0.25);
    lanternGroup.add(arm);

    // Lantern box
    const lantern = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.42, 0.3), glowMat);
    lantern.position.set(0, 2.8, 0.5);
    lanternGroup.add(lantern);

    const lCap = new THREE.Mesh(new THREE.ConeGeometry(0.25, 0.18, 4), ironMat);
    lCap.position.set(0, 3.05, 0.5);
    lCap.rotation.y = Math.PI / 4;
    lanternGroup.add(lCap);

    // Soft point light
    const pLight = new THREE.PointLight(0xffe082, 0.85, 9);
    pLight.position.set(0, 2.8, 0.5);
    lanternGroup.add(pLight);

    this.group.add(lanternGroup);
  }

  addBreakablePot(x, y, z, dropItem) {
    const potMat = new THREE.MeshToonMaterial({ color: 0xc2410c }); // Terracotta
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.35, 0.65, 12), potMat);
    pot.position.set(x, y, z);
    pot.castShadow = true;
    this.group.add(pot);

    this.interactiveObjects.push({
      type: 'pot',
      mesh: pot,
      dropItem,
      isBroken: false,
      position: new THREE.Vector3(x, y, z)
    });
  }
}
