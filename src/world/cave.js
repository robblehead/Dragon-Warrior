// Quagmire Cave (Subterranean Dungeon) & Princess Gwaelin's Prison Chamber
import * as THREE from 'three';

export class QuagmireCave {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.interactiveObjects = [];

    // Cave mountain coordinates: (68, y, 48)
    this.caveOrigin = new THREE.Vector3(68, 1.2, 48);

    this.buildCaveExteriorEntrance();
    this.buildSubterraneanCavern();
    this.buildErdrickTablet();
    this.buildPrincessSanctum();
    this.scene.add(this.group);
  }

  buildCaveExteriorEntrance() {
    // Rocky cave archway carved into the cliff face at (58, 1.2, 42)
    const stoneMat = new THREE.MeshToonMaterial({ color: 0x475569 });
    const darkMat = new THREE.MeshBasicMaterial({ color: 0x050508 });

    const archGroup = new THREE.Group();
    archGroup.position.set(58, 1.2, 42);

    // Left & Right pillar rocks
    const pillarL = new THREE.Mesh(new THREE.DodecahedronGeometry(2.2, 1), stoneMat);
    pillarL.scale.set(1.0, 1.8, 1.0);
    pillarL.position.set(-2.4, 1.8, 0);
    archGroup.add(pillarL);

    const pillarR = new THREE.Mesh(new THREE.DodecahedronGeometry(2.2, 1), stoneMat);
    pillarR.scale.set(1.0, 1.8, 1.0);
    pillarR.position.set(2.4, 1.8, 0);
    archGroup.add(pillarR);

    // Lintel rock
    const lintel = new THREE.Mesh(new THREE.DodecahedronGeometry(2.6, 1), stoneMat);
    lintel.scale.set(1.8, 0.9, 1.2);
    lintel.position.set(0, 3.8, 0);
    archGroup.add(lintel);

    // Dark void inside cave mouth
    const voidMesh = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 3.8), darkMat);
    voidMesh.position.set(0, 1.8, 0.5);
    archGroup.add(voidMesh);

    // Torch on outside entrance
    const torch = new THREE.PointLight(0xff8822, 1.2, 8);
    torch.position.set(2.6, 2.5, -0.6);
    archGroup.add(torch);

    this.group.add(archGroup);
  }

  buildSubterraneanCavern() {
    const ox = this.caveOrigin.x;
    const oz = this.caveOrigin.z;
    const oy = this.caveOrigin.y;

    const rockMat = new THREE.MeshToonMaterial({ color: 0x334155 });
    const crystalMat = new THREE.MeshToonMaterial({ color: 0x06b6d4 });

    // Cavern Floor
    const floorGeo = new THREE.BoxGeometry(22, 0.4, 22);
    const floor = new THREE.Mesh(floorGeo, rockMat);
    floor.position.set(ox, oy - 0.2, oz);
    floor.receiveShadow = true;
    this.group.add(floor);

    // Cavern Ceiling & Walls
    const ceilingGeo = new THREE.BoxGeometry(24, 0.8, 24);
    const ceiling = new THREE.Mesh(ceilingGeo, rockMat);
    ceiling.position.set(ox, oy + 7.5, oz);
    this.group.add(ceiling);

    // Stalactites hanging from ceiling
    const coneGeo = new THREE.ConeGeometry(0.5, 2.2, 8);
    coneGeo.rotateX(Math.PI); // point downward

    const stalactitePositions = [
      [-5, -4], [4, -5], [-3, 4], [5, 3], [0, -2], [-6, 2]
    ];
    stalactitePositions.forEach(([sx, sz]) => {
      const stalactite = new THREE.Mesh(coneGeo, rockMat);
      stalactite.position.set(ox + sx, oy + 6.2, oz + sz);
      this.group.add(stalactite);
    });

    // Glowing Cyan Crystal clusters
    const crystalGeo = new THREE.ConeGeometry(0.3, 1.4, 6);
    for (let c = 0; c < 5; c++) {
      const crystal = new THREE.Mesh(crystalGeo, crystalMat);
      crystal.position.set(ox - 7 + c * 3.2, oy + 0.7, oz - 8);
      crystal.rotation.set((Math.random() - 0.5) * 0.4, 0, (Math.random() - 0.5) * 0.4);
      this.group.add(crystal);
    }

    // Cyan crystal light
    const crystalLight = new THREE.PointLight(0x06b6d4, 1.2, 14);
    crystalLight.position.set(ox - 3, oy + 2.0, oz - 7);
    this.group.add(crystalLight);

    // Subterranean Pool
    const poolGeo = new THREE.CircleGeometry(4.0, 16);
    poolGeo.rotateX(-Math.PI / 2);
    const poolMat = new THREE.MeshToonMaterial({ color: 0x0e7490, transparent: true, opacity: 0.8 });
    const pool = new THREE.Mesh(poolGeo, poolMat);
    pool.position.set(ox - 4, oy + 0.05, oz + 3);
    this.group.add(pool);

    // Treasure Chest in Cave
    this.createCaveChest(ox + 7, oy, oz - 6, 'erdrick_ring', "Erdrick's Ring");
  }

  buildErdrickTablet() {
    const ox = this.caveOrigin.x;
    const oz = this.caveOrigin.z;
    const oy = this.caveOrigin.y;

    const tabletMat = new THREE.MeshToonMaterial({ color: 0xd97706 }); // Runic gold stone
    const tabletGroup = new THREE.Group();
    tabletGroup.position.set(ox - 6, oy, oz - 4);

    const stoneSlab = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.2, 0.4), tabletMat);
    stoneSlab.position.y = 1.1;
    tabletGroup.add(stoneSlab);

    // Glowing rune etching
    const runeLight = new THREE.PointLight(0xf59e0b, 1.0, 6);
    runeLight.position.set(0, 1.2, 0.4);
    tabletGroup.add(runeLight);

    this.group.add(tabletGroup);

    this.interactiveObjects.push({
      type: 'tablet',
      name: "Erdrick's Ancient Tablet",
      text: "I, Erdrick, leave this sacred message for my descendant: The Ball of Light was taken across the sea to Charlock. Seek the Sunstone from Tantegel and the Staff of Rain from the northwestern shrine. Combine them with my token at the Sacred Altar to forge the Rainbow Drop and bridge the dark abyss!",
      position: new THREE.Vector3(ox - 6, oy, oz - 4)
    });
  }

  buildPrincessSanctum() {
    const ox = this.caveOrigin.x + 4;
    const oz = this.caveOrigin.z + 5;
    const oy = this.caveOrigin.y;

    // Boss Chamber: Crystal Cage holding Princess Gwaelin
    const cageMat = new THREE.MeshBasicMaterial({
      color: 0xec4899, // Glowing pink barrier
      wireframe: true,
      transparent: true,
      opacity: 0.75
    });

    this.crystalBarrier = new THREE.Mesh(new THREE.CylinderGeometry(2.0, 2.0, 3.5, 12), cageMat);
    this.crystalBarrier.position.set(ox, oy + 1.75, oz);
    this.group.add(this.crystalBarrier);

    // Barrier light
    this.barrierLight = new THREE.PointLight(0xf472b6, 1.5, 10);
    this.barrierLight.position.set(ox, oy + 2.0, oz);
    this.group.add(this.barrierLight);

    this.sanctumCoords = { x: ox, y: oy, z: oz };
  }

  unlockPrincessBarrier() {
    if (this.crystalBarrier) {
      this.crystalBarrier.visible = false;
    }
    if (this.barrierLight) {
      this.barrierLight.color.set(0x22c55e); // Turn green/cleared
    }
  }

  createCaveChest(x, y, z, itemId, itemName) {
    const chestMat = new THREE.MeshToonMaterial({ color: 0x92400e });
    const chest = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.6, 0.7), chestMat);
    chest.position.set(x, y + 0.3, z);
    this.group.add(chest);

    this.interactiveObjects.push({
      type: 'chest',
      itemId,
      itemName,
      isOpen: false,
      position: new THREE.Vector3(x, y, z)
    });
  }
}
