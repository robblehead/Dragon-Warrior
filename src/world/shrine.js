// Rain Shrine, Sacred Altar, Kol Hot Spring, and Wilderness Campfires
import * as THREE from 'three';

export class AlefgardShrines {
  constructor(scene, terrain) {
    this.scene = scene;
    this.terrain = terrain;
    this.group = new THREE.Group();
    this.interactiveObjects = [];

    this.buildRainShrine();
    this.buildHotSpring();
    this.buildCampfires();
    this.scene.add(this.group);
  }

  buildRainShrine() {
    const sx = -42;
    const sz = 20;
    const sy = this.terrain.getHeight(sx, sz);

    const stoneMat = new THREE.MeshToonMaterial({ color: 0x94a3b8 });
    const runeMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });

    // Megalithic circular platform
    const platGeo = new THREE.CylinderGeometry(8, 8.5, 0.8, 24);
    const platform = new THREE.Mesh(platGeo, stoneMat);
    platform.position.set(sx, sy + 0.4, sz);
    platform.receiveShadow = true;
    this.group.add(platform);

    // 6 Ancient Runestone Pillars in a ring
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const px = sx + Math.cos(angle) * 6.2;
      const pz = sz + Math.sin(angle) * 6.2;

      const pillar = new THREE.Mesh(new THREE.BoxGeometry(1.2, 5.0, 1.2), stoneMat);
      pillar.position.set(px, sy + 2.5, pz);
      pillar.castShadow = true;
      this.group.add(pillar);

      // Glowing rune gem on each pillar
      const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.35), runeMat);
      gem.position.set(px, sy + 4.2, pz);
      this.group.add(gem);
    }

    // Central Sacred Pedestal holding the Staff of Rain
    const altar = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.3, 1.4, 12), stoneMat);
    altar.position.set(sx, sy + 1.1, sz);
    this.group.add(altar);

    // Staff of Rain 3D model
    const staffGroup = new THREE.Group();
    staffGroup.position.set(sx, sy + 2.2, sz);

    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.6), new THREE.MeshToonMaterial({ color: 0x1e3a8a }));
    staffGroup.add(shaft);

    const rainOrb = new THREE.Mesh(new THREE.SphereGeometry(0.28, 16, 16), new THREE.MeshBasicMaterial({ color: 0x60a5fa }));
    rainOrb.position.y = 0.9;
    staffGroup.add(rainOrb);

    const shrineLight = new THREE.PointLight(0x3b82f6, 1.8, 12);
    shrineLight.position.set(0, 1.0, 0);
    staffGroup.add(shrineLight);

    this.staffGroup = staffGroup;
    this.group.add(staffGroup);

    this.interactiveObjects.push({
      type: 'shrine_rain',
      name: 'Shrine of Rain Altar',
      staffGroup,
      isTaken: false,
      position: new THREE.Vector3(sx, sy, sz)
    });
  }

  buildHotSpring() {
    // Hidden spring in eastern meadow at (35, y, -28)
    const hx = 35;
    const hz = -28;
    const hy = this.terrain.getHeight(hx, hz);

    const springGroup = new THREE.Group();
    springGroup.position.set(hx, hy, hz);

    // Stone rim
    const rimMat = new THREE.MeshToonMaterial({ color: 0x64748b });
    const waterMat = new THREE.MeshToonMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.85 });

    const rim = new THREE.Mesh(new THREE.CylinderGeometry(3.6, 4.0, 0.6, 16), rimMat);
    rim.position.y = 0.3;
    springGroup.add(rim);

    const water = new THREE.Mesh(new THREE.CylinderGeometry(3.4, 3.4, 0.5, 16), waterMat);
    water.position.y = 0.32;
    springGroup.add(water);

    // Steam particles / light
    const steamLight = new THREE.PointLight(0xbae6fd, 1.0, 8);
    steamLight.position.y = 1.0;
    springGroup.add(steamLight);

    // Soft mound of dirt next to spring (Kol digging spot for Fairy Flute!)
    const moundMat = new THREE.MeshToonMaterial({ color: 0x78350f });
    const dirtMound = new THREE.Mesh(new THREE.SphereGeometry(0.8, 12, 8), moundMat);
    dirtMound.scale.set(1.4, 0.4, 1.4);
    dirtMound.position.set(3.8, 0.2, 0.5);
    springGroup.add(dirtMound);

    this.group.add(springGroup);

    this.interactiveObjects.push({
      type: 'dig_flute',
      name: 'Suspicious Soft Earth',
      isDug: false,
      position: new THREE.Vector3(hx + 3.8, hy, hz + 0.5)
    });
  }

  buildCampfires() {
    // Wilderness Campfire 1: Whispering Hills at (-15, y, 12)
    this.addCampfire(-15, 12);
    // Wilderness Campfire 2: Near the Cape at (-35, -30)
    this.addCampfire(-35, -30);
  }

  addCampfire(x, z) {
    const y = this.terrain.getHeight(x, z);
    const fireGroup = new THREE.Group();
    fireGroup.position.set(x, y, z);

    // Stone ring
    const stoneMat = new THREE.MeshToonMaterial({ color: 0x475569 });
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(0.24, 0), stoneMat);
      rock.position.set(Math.cos(angle) * 0.9, 0.15, Math.sin(angle) * 0.9);
      fireGroup.add(rock);
    }

    // Burning Logs
    const woodMat = new THREE.MeshToonMaterial({ color: 0x3f1d0b });
    const flameMat = new THREE.MeshBasicMaterial({ color: 0xff5500 });

    const log1 = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 1.1), woodMat);
    log1.rotation.set(0.3, 0.4, 0.8);
    log1.position.y = 0.2;
    fireGroup.add(log1);

    const log2 = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 1.1), woodMat);
    log2.rotation.set(-0.3, -0.6, 0.7);
    log2.position.y = 0.2;
    fireGroup.add(log2);

    // Flame mesh
    const flame = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.9, 8), flameMat);
    flame.position.y = 0.6;
    fireGroup.add(flame);

    const fireLight = new THREE.PointLight(0xff7711, 2.0, 14);
    fireLight.position.y = 0.9;
    fireGroup.add(fireLight);

    // Log seats around fire
    const seatLog = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 2.0), woodMat);
    seatLog.rotation.z = Math.PI / 2;
    seatLog.position.set(0, 0.25, -1.8);
    fireGroup.add(seatLog);

    this.group.add(fireGroup);

    this.interactiveObjects.push({
      type: 'campfire',
      name: 'Wilderness Campfire',
      position: new THREE.Vector3(x, y, z)
    });
  }
}
