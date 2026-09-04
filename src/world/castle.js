// Tantegel Castle: Grand Cathedral Keep, Throne Room, Royal Colonnade, Vault, and King Lorik
import * as THREE from 'three';

export class TantegelCastle {
  constructor(scene, terrain) {
    this.scene = scene;
    this.terrain = terrain;
    this.group = new THREE.Group();
    this.interactiveObjects = [];

    this.buildCastleArchitecture();
    this.buildCeilingAndRoof();
    this.buildColonnadeAndTapestries();
    this.buildThroneRoom();
    this.buildVault();
    this.buildPalaceLighting();
    this.scene.add(this.group);
  }

  buildCastleArchitecture() {
    const wallMat = new THREE.MeshToonMaterial({
      color: 0xc4c7cc // Weathered castle ashlar stone
    });
    const roofMat = new THREE.MeshToonMaterial({
      color: 0x881337 // Royal crimson slate tile
    });
    const bannerMat = new THREE.MeshToonMaterial({
      color: 0x1d4ed8, // Royal cobalt blue
      side: THREE.DoubleSide
    });

    const castleBaseY = 3.5;
    const originX = 0;
    const originZ = -28;

    // Main Keep Walls (Outer perimeter: 32m x 26m)
    const wallThick = 1.2;
    const wallHeight = 7.0;

    // North Wall (Behind Throne)
    const northWall = new THREE.Mesh(new THREE.BoxGeometry(32, wallHeight, wallThick), wallMat);
    northWall.position.set(originX, castleBaseY + wallHeight * 0.5, originZ - 13);
    northWall.castShadow = true;
    northWall.receiveShadow = false;
    this.group.add(northWall);

    // East Wall
    const eastWall = new THREE.Mesh(new THREE.BoxGeometry(wallThick, wallHeight, 26), wallMat);
    eastWall.position.set(originX + 16, castleBaseY + wallHeight * 0.5, originZ);
    eastWall.castShadow = true;
    eastWall.receiveShadow = false;
    this.group.add(eastWall);

    // West Wall
    const westWall = new THREE.Mesh(new THREE.BoxGeometry(wallThick, wallHeight, 26), wallMat);
    westWall.position.set(originX - 16, castleBaseY + wallHeight * 0.5, originZ);
    westWall.castShadow = true;
    westWall.receiveShadow = false;
    this.group.add(westWall);

    // South Wall (with Grand Castle Gate Archway)
    const southWallLeft = new THREE.Mesh(new THREE.BoxGeometry(13, wallHeight, wallThick), wallMat);
    southWallLeft.position.set(originX - 9.5, castleBaseY + wallHeight * 0.5, originZ + 13);
    southWallLeft.castShadow = true;
    southWallLeft.receiveShadow = false;
    this.group.add(southWallLeft);

    const southWallRight = new THREE.Mesh(new THREE.BoxGeometry(13, wallHeight, wallThick), wallMat);
    southWallRight.position.set(originX + 9.5, castleBaseY + wallHeight * 0.5, originZ + 13);
    southWallRight.castShadow = true;
    southWallRight.receiveShadow = false;
    this.group.add(southWallRight);

    // Gate Arch top
    const gateArch = new THREE.Mesh(new THREE.BoxGeometry(6, 2.2, wallThick), wallMat);
    gateArch.position.set(originX, castleBaseY + wallHeight - 1.1, originZ + 13);
    gateArch.castShadow = true;
    this.group.add(gateArch);

    // 4 Corner Watchtowers
    const towerRadius = 2.4;
    const towerHeight = 10.5;
    const towerGeo = new THREE.CylinderGeometry(towerRadius, towerRadius * 1.1, towerHeight, 16);
    const roofGeo = new THREE.ConeGeometry(towerRadius * 1.35, 4.2, 16);

    const corners = [
      { x: originX - 16, z: originZ - 13 },
      { x: originX + 16, z: originZ - 13 },
      { x: originX - 16, z: originZ + 13 },
      { x: originX + 16, z: originZ + 13 }
    ];

    corners.forEach(pos => {
      const tower = new THREE.Mesh(towerGeo, wallMat);
      tower.position.set(pos.x, castleBaseY + towerHeight * 0.5, pos.z);
      tower.castShadow = true;
      this.group.add(tower);

      const roof = new THREE.Mesh(roofGeo, roofMat);
      roof.position.set(pos.x, castleBaseY + towerHeight + 2.1, pos.z);
      roof.castShadow = true;
      this.group.add(roof);

      // Flag pole and banner on each tower
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 3.0), new THREE.MeshBasicMaterial({ color: 0xd4af37 }));
      pole.position.set(pos.x, castleBaseY + towerHeight + 4.8, pos.z);
      this.group.add(pole);

      const banner = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.9), bannerMat);
      banner.position.set(pos.x + 0.7, castleBaseY + towerHeight + 5.2, pos.z);
      this.group.add(banner);
    });

    // Castle Courtyard Stone Floor (receiveShadow = false so NO moving outdoor sun shadows hit the floor)
    const courtGeo = new THREE.PlaneGeometry(31.2, 25.2);
    courtGeo.rotateX(-Math.PI / 2);
    const courtMat = new THREE.MeshToonMaterial({ color: 0x94a3b8 });
    const courtMesh = new THREE.Mesh(courtGeo, courtMat);
    courtMesh.position.set(originX, castleBaseY + 0.02, originZ);
    courtMesh.receiveShadow = false; // PREVENTS moving sun shadows inside
    this.group.add(courtMesh);

    // Flagstone perimeter border inlay
    const borderMat = new THREE.MeshToonMaterial({ color: 0x64748b });
    const borderN = new THREE.Mesh(new THREE.BoxGeometry(30.8, 0.04, 1.2), borderMat);
    borderN.position.set(originX, castleBaseY + 0.04, originZ - 12.0);
    this.group.add(borderN);

    const borderS = new THREE.Mesh(new THREE.BoxGeometry(30.8, 0.04, 1.2), borderMat);
    borderS.position.set(originX, castleBaseY + 0.04, originZ + 12.0);
    this.group.add(borderS);

    const borderE = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.04, 24.8), borderMat);
    borderE.position.set(originX + 15.0, castleBaseY + 0.04, originZ);
    this.group.add(borderE);

    const borderW = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.04, 24.8), borderMat);
    borderW.position.set(originX - 15.0, castleBaseY + 0.04, originZ);
    this.group.add(borderW);
  }

  // Vaulted Timber Ceiling & Exterior Keep Roof
  buildCeilingAndRoof() {
    const originX = 0;
    const originZ = -28;
    const baseY = 3.5;
    const ceilingY = baseY + 7.0; // y = 10.5m

    const timberMat = new THREE.MeshToonMaterial({ color: 0x27170c }); // Dark polished oak
    const ceilingPanelMat = new THREE.MeshToonMaterial({ color: 0x1f140e });
    const roofMat = new THREE.MeshToonMaterial({ color: 0x881337 }); // Crimson keep roof

    // 1. Interior Ceiling Under-Panels (fully blocks sky visibility from inside)
    const ceilingGeo = new THREE.PlaneGeometry(31.2, 25.2);
    ceilingGeo.rotateX(Math.PI / 2); // Facing downwards
    const ceilingMesh = new THREE.Mesh(ceilingGeo, ceilingPanelMat);
    ceilingMesh.position.set(originX, ceilingY - 0.05, originZ);
    this.group.add(ceilingMesh);

    // 2. Heavy Timber Tie-Beams spanning East-West across the nave
    const beamPositionsZ = [-38, -33, -28, -23, -18];
    beamPositionsZ.forEach(bz => {
      // Main horizontal transverse beam
      const beam = new THREE.Mesh(new THREE.BoxGeometry(31.0, 0.45, 0.45), timberMat);
      beam.position.set(originX, ceilingY - 0.22, bz);
      beam.castShadow = true;
      this.group.add(beam);

      // Stone corbels supporting the beam at wall edges
      for (let side of [-15.2, 15.2]) {
        const corbel = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.6, 0.5), timberMat);
        corbel.position.set(originX + side, ceilingY - 0.45, bz);
        this.group.add(corbel);
      }
    });

    // 3. Central Ridge Beam spanning North-South
    const ridgeBeam = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 25.2), timberMat);
    ridgeBeam.position.set(originX, ceilingY - 0.22, originZ);
    this.group.add(ridgeBeam);

    // 4. Exterior Pitched Crimson Keep Roof (viewed from outside / hills)
    const roofPitchGeo = new THREE.CylinderGeometry(0.1, 16.5, 25.2, 4, 1, false, Math.PI * 0.25);
    roofPitchGeo.rotateZ(Math.PI * 0.5);
    roofPitchGeo.scale(1.0, 0.35, 1.0);
    const exteriorRoof = new THREE.Mesh(roofPitchGeo, roofMat);
    exteriorRoof.position.set(originX, ceilingY + 2.5, originZ);
    exteriorRoof.castShadow = true;
    this.group.add(exteriorRoof);
  }

  // Fluted Marble Colonnade, Gothic Arches, and Heraldic Tapestries
  buildColonnadeAndTapestries() {
    const originX = 0;
    const originZ = -28;
    const baseY = 3.5;
    const colHeight = 6.8;

    const marbleMat = new THREE.MeshToonMaterial({ color: 0xe2e8f0 });
    const marbleDarkMat = new THREE.MeshToonMaterial({ color: 0x94a3b8 });
    const goldTrimMat = new THREE.MeshToonMaterial({ color: 0xf59e0b });

    // 8 Fluted Marble Pillars lining both sides of the central nave
    const columnPositions = [
      { x: -5.6, z: -18 },
      { x: 5.6, z: -18 },
      { x: -5.6, z: -23 },
      { x: 5.6, z: -23 },
      { x: -5.6, z: -28 },
      { x: 5.6, z: -28 },
      { x: -5.6, z: -33 },
      { x: 5.6, z: -33 }
    ];

    columnPositions.forEach(pos => {
      const colGroup = new THREE.Group();
      colGroup.position.set(pos.x, baseY, pos.z);

      // 1. Plinth (Square stepped stone base)
      const plinthBase = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.4, 1.2), marbleDarkMat);
      plinthBase.position.y = 0.2;
      colGroup.add(plinthBase);

      const plinthMolding = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.25, 1.0), marbleMat);
      plinthMolding.position.y = 0.525;
      colGroup.add(plinthMolding);

      // Gold band at column foot
      const goldFoot = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.48, 0.1, 16), goldTrimMat);
      goldFoot.position.y = 0.7;
      colGroup.add(goldFoot);

      // 2. Fluted Column Shaft
      const shaftGeo = new THREE.CylinderGeometry(0.42, 0.45, colHeight - 1.4, 16);
      const shaft = new THREE.Mesh(shaftGeo, marbleMat);
      shaft.position.y = 0.7 + (colHeight - 1.4) * 0.5;
      colGroup.add(shaft);

      // 3. Classical Capital with Gold Carvings
      const goldTop = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.42, 0.15, 16), goldTrimMat);
      goldTop.position.y = colHeight - 0.65;
      colGroup.add(goldTop);

      const capital = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.45, 1.1), marbleDarkMat);
      capital.position.y = colHeight - 0.35;
      colGroup.add(capital);

      // Torch Sconce on the aisle-facing side of columns
      const sconceX = pos.x > 0 ? -0.48 : 0.48;
      this.addWallSconce(pos.x + sconceX, baseY + 2.8, pos.z, pos.x > 0 ? Math.PI : 0);

      this.group.add(colGroup);
    });

    // Longitudinal Stone Arches connecting the columns along the aisle
    const archMat = new THREE.MeshToonMaterial({ color: 0xc4c7cc });
    for (let side of [-5.6, 5.6]) {
      [-20.5, -25.5, -30.5].forEach(midZ => {
        const arch = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.5, 4.8), archMat);
        arch.position.set(side, baseY + colHeight - 0.25, midZ);
        this.group.add(arch);

        // Decorative arch keystone drop
        const keystone = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.35, 0.6), goldTrimMat);
        keystone.position.set(side, baseY + colHeight - 0.4, midZ);
        this.group.add(keystone);
      });
    }

    // Grand Heraldic Erdrick Wall Tapestries along East & West Walls
    const tapestryPositions = [
      { x: originX - 15.3, z: -20, color: 0x1d4ed8, angle: Math.PI * 0.5 },
      { x: originX - 15.3, z: -27, color: 0x991b1b, angle: Math.PI * 0.5 },
      { x: originX - 15.3, z: -34, color: 0x1d4ed8, angle: Math.PI * 0.5 },
      { x: originX + 15.3, z: -20, color: 0x991b1b, angle: -Math.PI * 0.5 },
      { x: originX + 15.3, z: -27, color: 0x1d4ed8, angle: -Math.PI * 0.5 },
      { x: originX + 15.3, z: -34, color: 0x991b1b, angle: -Math.PI * 0.5 }
    ];

    tapestryPositions.forEach(t => {
      this.createHeraldicTapestry(t.x, baseY + 4.2, t.z, t.color, t.angle);
    });
  }

  createHeraldicTapestry(x, y, z, primaryColor, rotY) {
    const group = new THREE.Group();
    group.position.set(x, y, z);
    group.rotation.y = rotY;

    const rodMat = new THREE.MeshBasicMaterial({ color: 0xd4af37 }); // Brass rod
    const clothMat = new THREE.MeshToonMaterial({ color: primaryColor, side: THREE.DoubleSide });
    const crestMat = new THREE.MeshToonMaterial({ color: 0xfde047 });
    const fringeMat = new THREE.MeshToonMaterial({ color: 0xf59e0b });

    // Hanging Brass Rod & Finials
    const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.2), rodMat);
    rod.rotation.z = Math.PI * 0.5;
    group.add(rod);

    for (let f of [-1.12, 1.12]) {
      const finial = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), rodMat);
      finial.position.set(f, 0, 0);
      group.add(finial);
    }

    // Main Tapestry Banner Cloth
    const banner = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 3.4), clothMat);
    banner.position.set(0, -1.7, 0.02);
    group.add(banner);

    // Gold Phoenix / Firebird Erdrick Crest on Tapestry
    const crestBody = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.03, 8), crestMat);
    crestBody.rotation.x = Math.PI * 0.5;
    crestBody.position.set(0, -1.4, 0.04);
    group.add(crestBody);

    // Crest Wings
    for (let side of [-1, 1]) {
      const wing = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.12, 0.03), crestMat);
      wing.position.set(side * 0.32, -1.35, 0.04);
      wing.rotation.z = side * 0.3;
      group.add(wing);
    }

    // Gold Tassels & Fringe at bottom
    const fringe = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.15, 0.04), fringeMat);
    fringe.position.set(0, -3.45, 0.02);
    group.add(fringe);

    this.group.add(group);
  }

  buildThroneRoom() {
    const originX = 0;
    const originZ = -33;
    const baseY = 3.5;

    // 1. Royal Red Carpet Runner with Gold Embroidered Borders
    // Runs from southern castle entrance (z = -14.5) to the foot of throne dais (z = -30.5)
    const carpetLength = 16.0;
    const carpetWidth = 3.6;
    const carpetCenterZ = -22.5;

    const carpetGeo = new THREE.PlaneGeometry(carpetWidth, carpetLength);
    carpetGeo.rotateX(-Math.PI / 2);
    const carpetMat = new THREE.MeshToonMaterial({ color: 0x991b1b }); // Rich crimson
    const carpet = new THREE.Mesh(carpetGeo, carpetMat);
    carpet.position.set(originX, baseY + 0.05, carpetCenterZ);
    carpet.receiveShadow = false; // PREVENTS moving shadows on carpet
    this.group.add(carpet);

    // Gold braided border stripes on left and right edges
    const goldBorderMat = new THREE.MeshToonMaterial({ color: 0xf59e0b });
    for (let side of [-1, 1]) {
      const bGeo = new THREE.PlaneGeometry(0.2, carpetLength);
      bGeo.rotateX(-Math.PI / 2);
      const stripe = new THREE.Mesh(bGeo, goldBorderMat);
      stripe.position.set(originX + side * (carpetWidth * 0.5 - 0.1), baseY + 0.055, carpetCenterZ);
      stripe.receiveShadow = false;
      this.group.add(stripe);
    }

    // 2. 3-Tier Stepped White Marble Dais
    const marbleMat = new THREE.MeshToonMaterial({ color: 0xf1f5f9 });
    const goldEdgeMat = new THREE.MeshToonMaterial({ color: 0xf59e0b });

    const stepHeight = 0.22;
    const tiers = [
      { w: 7.2, d: 5.8, y: baseY + stepHeight * 0.5, z: originZ - 1.4 },
      { w: 6.0, d: 4.8, y: baseY + stepHeight * 1.5, z: originZ - 1.8 },
      { w: 4.8, d: 3.8, y: baseY + stepHeight * 2.5, z: originZ - 2.2 }
    ];

    tiers.forEach((t) => {
      const stepMesh = new THREE.Mesh(new THREE.BoxGeometry(t.w, stepHeight, t.d), marbleMat);
      stepMesh.position.set(originX, t.y, t.z);
      stepMesh.receiveShadow = false; // PREVENTS moving shadows on throne steps
      this.group.add(stepMesh);

      // Gilded step lip edge
      const edge = new THREE.Mesh(new THREE.BoxGeometry(t.w + 0.04, 0.06, 0.08), goldEdgeMat);
      edge.position.set(originX, t.y + stepHeight * 0.48, t.z + t.d * 0.5);
      this.group.add(edge);
    });

    const daisTopY = baseY + stepHeight * 3.0; // 3.5 + 0.66 = 4.16m

    // 3. The Golden Dragon Throne (Akira Toriyama Royal Style)
    const throneGroup = new THREE.Group();
    const goldMat = new THREE.MeshToonMaterial({ color: 0xfacc15 });
    const goldDarkMat = new THREE.MeshToonMaterial({ color: 0xb45309 });
    const velvetPurpleMat = new THREE.MeshToonMaterial({ color: 0x581c87 }); // Royal tufted purple
    const rubyMat = new THREE.MeshToonMaterial({ color: 0xdc2626 });
    const sapphireMat = new THREE.MeshToonMaterial({ color: 0x0284c7 });

    // Throne Base Plinth
    const thronePlinth = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.35, 1.8), goldDarkMat);
    thronePlinth.position.y = 0.175;
    throneGroup.add(thronePlinth);

    // Throne Seat
    const seat = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.4, 1.5), goldMat);
    seat.position.y = 0.55;
    throneGroup.add(seat);

    // Plush Tufted Purple Velvet Seat Cushion
    const cushion = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.22, 1.3), velvetPurpleMat);
    cushion.position.set(0, 0.82, 0.05);
    throneGroup.add(cushion);

    // High Arched Backrest
    const backrest = new THREE.Mesh(new THREE.BoxGeometry(1.8, 3.2, 0.32), goldMat);
    backrest.position.set(0, 2.3, -0.65);
    throneGroup.add(backrest);

    // Tufted Velvet Inlay on Backrest
    const backVelvet = new THREE.Mesh(new THREE.BoxGeometry(1.4, 2.6, 0.08), velvetPurpleMat);
    backVelvet.position.set(0, 2.2, -0.48);
    throneGroup.add(backVelvet);

    // Carved Golden Dragon Heads on Armrests
    for (let side of [-1, 1]) {
      // Armrest support
      const arm = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.5, 1.3), goldMat);
      arm.position.set(side * 0.9, 1.0, 0.05);
      throneGroup.add(arm);

      // Dragon Head finial at front of armrest
      const dragonHead = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.32, 0.42), goldMat);
      dragonHead.position.set(side * 0.9, 1.3, 0.7);
      throneGroup.add(dragonHead);

      // Dragon Ruby Eyes
      for (let eyeSide of [-1, 1]) {
        const eye = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 6), rubyMat);
        eye.position.set(side * 0.9 + eyeSide * 0.14, 1.36, 0.8);
        throneGroup.add(eye);
      }
    }

    // Crown Finial at top of backrest with glowing sapphire orb
    const crownFinial = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.6, 8), goldMat);
    crownFinial.position.set(0, 4.1, -0.65);
    throneGroup.add(crownFinial);

    const sapphireOrb = new THREE.Mesh(new THREE.SphereGeometry(0.18, 10, 10), sapphireMat);
    sapphireOrb.position.set(0, 4.45, -0.65);
    throneGroup.add(sapphireOrb);

    // Erdrick Phoenix Crest Medallion on Throne
    const crest = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.08, 12), sapphireMat);
    crest.rotation.x = Math.PI * 0.5;
    crest.position.set(0, 2.9, -0.42);
    throneGroup.add(crest);

    const crestBird = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.35, 0.1), goldMat);
    crestBird.position.set(0, 2.9, -0.38);
    throneGroup.add(crestBird);

    throneGroup.position.set(originX, daisTopY, originZ - 2.6);
    this.group.add(throneGroup);

    // 4. Gothic Stained-Glass Lancet Window in North Wall behind throne
    this.buildStainedGlassLancetWindow(originX, baseY + 6.8, originZ - 12.3);
  }

  // Multi-pane Jewel Stained-Glass Window & Radiant Volumetric Beam
  buildStainedGlassLancetWindow(x, y, z) {
    const frameMat = new THREE.MeshToonMaterial({ color: 0x334155 });
    const group = new THREE.Group();
    group.position.set(x, y, z);

    // Outer Stone Arched Frame
    const frameLeft = new THREE.Mesh(new THREE.BoxGeometry(0.4, 4.2, 0.6), frameMat);
    frameLeft.position.set(-1.8, 0, 0);
    group.add(frameLeft);

    const frameRight = new THREE.Mesh(new THREE.BoxGeometry(0.4, 4.2, 0.6), frameMat);
    frameRight.position.set(1.8, 0, 0);
    group.add(frameRight);

    const frameTop = new THREE.Mesh(new THREE.BoxGeometry(4.0, 0.4, 0.6), frameMat);
    frameTop.position.set(0, 2.1, 0);
    group.add(frameTop);

    const frameBot = new THREE.Mesh(new THREE.BoxGeometry(4.0, 0.4, 0.6), frameMat);
    frameBot.position.set(0, -2.1, 0);
    group.add(frameBot);

    // Colored Stained Glass Panes
    const glassColors = [
      0x2563eb, 0xdc2626, 0xf59e0b, 0x16a34a,
      0x9333ea, 0x0284c7, 0xe11d48, 0xfacc15
    ];

    const numCols = 4;
    const numRows = 4;
    const paneW = 0.8;
    const paneH = 0.95;

    for (let r = 0; r < numRows; r++) {
      for (let c = 0; c < numCols; c++) {
        const colIdx = (r * numCols + c) % glassColors.length;
        const paneMat = new THREE.MeshBasicMaterial({
          color: glassColors[colIdx],
          transparent: true,
          opacity: 0.85
        });
        const pane = new THREE.Mesh(new THREE.PlaneGeometry(paneW - 0.08, paneH - 0.08), paneMat);
        pane.position.set(
          (c - (numCols - 1) * 0.5) * paneW,
          (r - (numRows - 1) * 0.5) * paneH,
          0.05
        );
        group.add(pane);
      }
    }

    // Semi-transparent warm radiant volumetric light beam shining down into the throne
    const rayGeo = new THREE.CylinderGeometry(0.6, 3.2, 8.5, 16, 1, true);
    const rayMat = new THREE.MeshBasicMaterial({
      color: 0xfef08a,
      transparent: true,
      opacity: 0.16,
      side: THREE.DoubleSide
    });
    const lightRay = new THREE.Mesh(rayGeo, rayMat);
    lightRay.rotation.x = 0.35;
    lightRay.position.set(0, -2.8, 3.5);
    group.add(lightRay);

    this.group.add(group);
  }

  // Grand Hanging Wrought-Iron Chandeliers & Indoor Palace Illumination
  buildPalaceLighting() {
    const originX = 0;
    const originZ = -28;
    const chandelierY = 8.6; // Suspended from ceiling rafters

    // 2 Grand Wrought-Iron Ring Chandeliers
    this.createChandelier(originX, chandelierY, -21); // Front nave
    this.createChandelier(originX, chandelierY, -31); // Throne area

    // Steady indoor palace fill lights (eliminates shadows and dark patches)
    const palaceFillLight1 = new THREE.PointLight(0xfff3d6, 1.4, 28);
    palaceFillLight1.position.set(originX, 7.5, -23);
    this.group.add(palaceFillLight1);

    const palaceFillLight2 = new THREE.PointLight(0xfff3d6, 1.6, 28);
    palaceFillLight2.position.set(originX, 7.5, -33);
    this.group.add(palaceFillLight2);
  }

  createChandelier(x, y, z) {
    const group = new THREE.Group();
    group.position.set(x, y, z);

    const ironMat = new THREE.MeshToonMaterial({ color: 0x1e293b });
    const candleMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
    const flameMat = new THREE.MeshBasicMaterial({ color: 0xff8800 });

    // 1. Suspension Chains leading up to ceiling rafters
    const ceilingYOffset = 10.5 - y;
    for (let angle of [0, Math.PI * 0.5, Math.PI, Math.PI * 1.5]) {
      const chainGeo = new THREE.CylinderGeometry(0.025, 0.025, ceilingYOffset);
      const chain = new THREE.Mesh(chainGeo, ironMat);
      chain.position.set(Math.cos(angle) * 0.8, ceilingYOffset * 0.5, Math.sin(angle) * 0.8);
      group.add(chain);
    }

    // 2. Main Circular Wrought-Iron Hoop
    const hoop = new THREE.Mesh(new THREE.TorusGeometry(1.6, 0.08, 8, 24), ironMat);
    hoop.rotation.x = Math.PI * 0.5;
    group.add(hoop);

    // Inner scrollwork cross
    const cross1 = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.06, 0.06), ironMat);
    group.add(cross1);
    const cross2 = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 3.2), ironMat);
    group.add(cross2);

    // 3. 8 Candles around the rim
    for (let i = 0; i < 8; i++) {
      const theta = (i / 8) * Math.PI * 2;
      const cx = Math.cos(theta) * 1.6;
      const cz = Math.sin(theta) * 1.6;

      // Candle base holder
      const holder = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 0.12, 8), ironMat);
      holder.position.set(cx, 0.06, cz);
      group.add(holder);

      // Wax Candle
      const candle = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.35, 8), candleMat);
      candle.position.set(cx, 0.28, cz);
      group.add(candle);

      // Flickering Flame
      const flame = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.18, 6), flameMat);
      flame.position.set(cx, 0.52, cz);
      group.add(flame);
    }

    // Warm, steady chandelier light
    const light = new THREE.PointLight(0xffb040, 1.8, 16);
    light.position.set(0, -0.2, 0);
    group.add(light);

    this.group.add(group);
  }

  // Wall / Column Mounted Torch Sconce
  addWallSconce(x, y, z, rotY = 0) {
    const sconceGroup = new THREE.Group();
    sconceGroup.position.set(x, y, z);
    sconceGroup.rotation.y = rotY;

    const ironMat = new THREE.MeshToonMaterial({ color: 0x334155 });
    const brassMat = new THREE.MeshBasicMaterial({ color: 0xd4af37 });
    const flameMat = new THREE.MeshBasicMaterial({ color: 0xff7700 });

    // Wall mounting plate
    const plate = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.5, 0.06), ironMat);
    sconceGroup.add(plate);

    // Curved bracket
    const bracket = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.45), ironMat);
    bracket.rotation.x = Math.PI * 0.35;
    bracket.position.set(0, 0.15, 0.2);
    sconceGroup.add(bracket);

    // Torch Cup
    const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.06, 0.25, 8), brassMat);
    cup.position.set(0, 0.32, 0.35);
    sconceGroup.add(cup);

    // Glowing Ember Flame
    const flame = new THREE.Mesh(new THREE.DodecahedronGeometry(0.14, 1), flameMat);
    flame.position.set(0, 0.52, 0.35);
    sconceGroup.add(flame);

    // Warm local sconce light
    const sconceLight = new THREE.PointLight(0xff9922, 1.2, 10);
    sconceLight.position.set(0, 0.65, 0.4);
    sconceGroup.add(sconceLight);

    this.group.add(sconceGroup);
  }

  buildVault() {
    const originX = -10;
    const originZ = -33;
    const baseY = 3.5;

    // Treasury vault chamber partition wall
    const vaultWallMat = new THREE.MeshToonMaterial({ color: 0x64748b });
    const vaultWall = new THREE.Mesh(new THREE.BoxGeometry(0.8, 6.5, 8.0), vaultWallMat);
    vaultWall.position.set(originX + 4.5, baseY + 3.25, originZ);
    this.group.add(vaultWall);

    // Wrought-iron security portcullis archway entrance
    const ironMat = new THREE.MeshToonMaterial({ color: 0x1e293b });
    const gateArchL = new THREE.Mesh(new THREE.BoxGeometry(0.2, 3.8, 0.2), ironMat);
    gateArchL.position.set(originX + 4.5, baseY + 1.9, originZ + 2.2);
    this.group.add(gateArchL);

    const gateArchR = new THREE.Mesh(new THREE.BoxGeometry(0.2, 3.8, 0.2), ironMat);
    gateArchR.position.set(originX + 4.5, baseY + 1.9, originZ - 2.2);
    this.group.add(gateArchR);

    const gateArchTop = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.25, 4.6), ironMat);
    gateArchTop.position.set(originX + 4.5, baseY + 3.8, originZ);
    this.group.add(gateArchTop);

    // Stone Pedestals for the 3 authentic Dragon Warrior starting treasure chests:
    // Chest 1: 120 Gold
    // Chest 2: Torch
    // Chest 3: Magic Key
    const chestPositions = [
      { x: originX - 1.5, z: originZ - 1.5, id: 'gold_120', name: '120 Gold Coins' },
      { x: originX + 0.5, z: originZ - 1.5, id: 'torch', name: 'Torch' },
      { x: originX + 2.5, z: originZ - 1.5, id: 'magic_key', name: 'Magic Key' }
    ];

    const pedMat = new THREE.MeshToonMaterial({ color: 0x475569 });
    chestPositions.forEach(c => {
      const pedestal = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.2, 1.1), pedMat);
      pedestal.position.set(c.x, baseY + 0.1, c.z);
      this.group.add(pedestal);

      this.createChest(c.x, baseY + 0.2, c.z, c.id, c.name);
    });
  }

  createChest(x, y, z, itemId, itemName) {
    const chestGroup = new THREE.Group();
    chestGroup.position.set(x, y, z);

    // Chest Body (polished dark oak with brass & iron bands)
    const woodMat = new THREE.MeshToonMaterial({ color: 0x78350f });
    const ironMat = new THREE.MeshToonMaterial({ color: 0x334155 });
    const brassMat = new THREE.MeshToonMaterial({ color: 0xf59e0b });

    const base = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.6, 0.75), woodMat);
    base.position.y = 0.3;
    base.castShadow = true;
    chestGroup.add(base);

    // Iron corner straps
    const strap1 = new THREE.Mesh(new THREE.BoxGeometry(1.14, 0.62, 0.08), ironMat);
    strap1.position.y = 0.3;
    chestGroup.add(strap1);

    const strap2 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.62, 0.78), ironMat);
    strap2.position.y = 0.3;
    chestGroup.add(strap2);

    // Lid (interactive opening rotation)
    const lidGroup = new THREE.Group();
    lidGroup.position.set(0, 0.6, -0.375); // hinge at back

    const lidMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 1.1, 14, 1, false, 0, Math.PI), woodMat);
    lidMesh.rotation.z = Math.PI * 0.5;
    lidMesh.position.set(0, 0, 0.375);
    lidGroup.add(lidMesh);

    // Brass Arch Trim on lid
    const brassRib1 = new THREE.Mesh(new THREE.CylinderGeometry(0.39, 0.39, 0.08, 14, 1, false, 0, Math.PI), brassMat);
    brassRib1.rotation.z = Math.PI * 0.5;
    brassRib1.position.set(-0.45, 0, 0.375);
    lidGroup.add(brassRib1);

    const brassRib2 = new THREE.Mesh(new THREE.CylinderGeometry(0.39, 0.39, 0.08, 14, 1, false, 0, Math.PI), brassMat);
    brassRib2.rotation.z = Math.PI * 0.5;
    brassRib2.position.set(0.45, 0, 0.375);
    lidGroup.add(brassRib2);

    // Golden lock hasp
    const lock = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.22, 0.1), brassMat);
    lock.position.set(0, 0.0, 0.76);
    lidGroup.add(lock);

    chestGroup.add(lidGroup);

    const chestData = {
      group: chestGroup,
      lidGroup,
      itemId,
      itemName,
      isOpen: false,
      type: 'chest',
      position: new THREE.Vector3(x, y, z)
    };

    this.group.add(chestGroup);
    this.interactiveObjects.push(chestData);
  }

  addTorch(x, y, z) {
    this.addWallSconce(x, y, z, 0);
  }
}
