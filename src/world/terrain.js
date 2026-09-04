// Alefgard Seamless Open-World Terrain System
import * as THREE from 'three';

export class AlefgardTerrain {
  constructor(scene) {
    this.scene = scene;
    this.size = 260;
    this.segments = 140;
    this.terrainMesh = null;
    this.poisonSwampMesh = null;

    this.initHeightmap();
    this.buildTerrainMesh();
    this.buildSwampPlane();
  }

  initHeightmap() {
    // Height calculation function for physics and rendering
    this.getHeight = (x, z) => {
      // 1. Water boundary & ocean shelf
      const distFromCenter = Math.hypot(x, z);
      if (distFromCenter > 115) {
        return -3.0; // Deep sea
      }

      let h = 1.0;

      // 2. Tantegel Castle Plateau (x: -8 to 8, z: -38 to -18)
      const dCastle = Math.hypot(x - 0, z - (-28));
      if (dCastle < 18) {
        h = 3.5;
        return h;
      } else if (dCastle < 26) {
        // Sloping ramp up to castle gate
        const rampZ = z - (-28);
        if (Math.abs(x) < 4.0 && rampZ > 12) {
          // Gatehouse pathway
          return THREE.MathUtils.lerp(3.5, 1.2, (dCastle - 18) / 8);
        }
        return THREE.MathUtils.lerp(3.5, 1.2, (dCastle - 18) / 8);
      }

      // 3. Town of Brecconary flat clearing (x: 45, z: -10)
      const dTown = Math.hypot(x - 45, z - (-10));
      if (dTown < 18) {
        return 1.4;
      }

      // 4. Poison Swamp basin (x: 45, z: 35)
      const dSwamp = Math.hypot(x - 45, z - 35);
      if (dSwamp < 18) {
        return 0.25; // Sunk slightly below ground
      }

      // 5. Quagmire Cave Mountain Ridge (x: 55 to 80, z: 35 to 65)
      if (x > 50 && z > 30) {
        const mountainH = Math.min(18.0, Math.sin((x - 50) * 0.15) * 8.0 + (x - 50) * 0.35 + 2.0);
        // Cave entrance notch at (58, 42)
        const dCaveEnt = Math.hypot(x - 58, z - 42);
        if (dCaveEnt < 4.5) {
          return 0.8;
        }
        return mountainH;
      }

      // 6. Rain Shrine hill (x: -42, z: 20)
      const dShrine = Math.hypot(x - (-42), z - 20);
      if (dShrine < 14) {
        return 2.8;
      }

      // 7. Seaside Cliff overlooking Charlock (x: -45, z: -45)
      const dCape = Math.hypot(x - (-45), z - (-45));
      if (dCape < 16) {
        return 4.2;
      }

      // 8. Charlock Island in the distance (x: -75, z: -75)
      const dCharlock = Math.hypot(x - (-75), z - (-75));
      if (dCharlock < 22) {
        return 6.0 + Math.sin(x * 0.5) * 3.0;
      }

      // Gentle natural rolling hills & valleys
      const wave1 = Math.sin(x * 0.05 + 1.2) * Math.cos(z * 0.05 + 0.8) * 2.2;
      const wave2 = Math.sin(x * 0.12 - z * 0.08) * 0.8;
      h += Math.max(0.2, wave1 + wave2 + 0.8);

      // Coastline falloff
      if (distFromCenter > 85) {
        const falloff = (distFromCenter - 85) / 30;
        h = THREE.MathUtils.lerp(h, -2.5, Math.min(1.0, falloff));
      }

      return h;
    };
  }

  buildTerrainMesh() {
    const geo = new THREE.PlaneGeometry(this.size, this.size, this.segments, this.segments);
    geo.rotateX(-Math.PI / 2);

    const posAttr = geo.attributes.position;
    const colors = new Float32Array(posAttr.count * 3);

    // Color definitions
    const cGrass = new THREE.Color(0x56ab2f); // Vibrant meadow green
    const cGrassLight = new THREE.Color(0xa8e063); // Sunlit grass
    const cRock = new THREE.Color(0x8a929a);  // Mountain stone
    const cPath = new THREE.Color(0xcdab82);  // Packed dirt trail
    const cSand = new THREE.Color(0xf2e394);  // Coastal sand
    const cSwamp = new THREE.Color(0x4a2e5d); // Toxic dark purple marsh
    const cCastleCobble = new THREE.Color(0x9ca3af); // Castle paving

    for (let i = 0; i < posAttr.count; i++) {
      const x = posAttr.getX(i);
      const z = posAttr.getZ(i);
      const y = this.getHeight(x, z);
      posAttr.setY(i, y);

      // Determine biome color
      let col = cGrass.clone();

      // Slopes get rocky
      const slopeTest = (this.getHeight(x + 1, z) - this.getHeight(x - 1, z));
      const slope = Math.abs(slopeTest);

      const dCastle = Math.hypot(x - 0, z - (-28));
      const dTown = Math.hypot(x - 22, z - (-10));
      const dSwamp = Math.hypot(x - 45, z - 35);
      const dCoast = Math.hypot(x, z);

      if (dCastle < 17) {
        col.lerp(cCastleCobble, 0.9);
      } else if (dTown < 14) {
        col.lerp(cPath, 0.7);
      } else if (dSwamp < 18) {
        const swampF = 1.0 - (dSwamp / 18);
        col.lerp(cSwamp, swampF * 0.95);
      } else if (y < 0.6 && dCoast > 75) {
        col.lerp(cSand, 0.9);
      } else if (slope > 0.8 || y > 10.0) {
        col.lerp(cRock, 0.85);
      } else {
        // Natural grass variation
        const noise = (Math.sin(x * 0.2) + Math.cos(z * 0.2)) * 0.5 + 0.5;
        col.lerp(cGrassLight, noise * 0.35);
      }

      // Check if on road / path connecting Tantegel to Brecconary and Swamp
      const onMainRoad = this.isRoad(x, z);
      if (onMainRoad > 0.1) {
        col.lerp(cPath, onMainRoad * 0.85);
      }

      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }

    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.computeVertexNormals();

    const mat = new THREE.MeshToonMaterial({
      vertexColors: true
    });

    this.terrainMesh = new THREE.Mesh(geo, mat);
    this.terrainMesh.receiveShadow = true;
    this.scene.add(this.terrainMesh);
  }

  buildSwampPlane() {
    // Glowing toxic purple bubbling marsh water
    const swampGeo = new THREE.CircleGeometry(16.5, 32);
    swampGeo.rotateX(-Math.PI / 2);

    const swampMat = new THREE.MeshToonMaterial({
      color: 0x6b21a8, // Rich toxic violet
      transparent: true,
      opacity: 0.88
    });

    this.poisonSwampMesh = new THREE.Mesh(swampGeo, swampMat);
    this.poisonSwampMesh.position.set(45, 0.32, 35);
    this.poisonSwampMesh.receiveShadow = true;
    this.scene.add(this.poisonSwampMesh);
  }

  isRoad(x, z) {
    // Road 1: Tantegel Castle (0, -18) to Brecconary (22, -10)
    const t1 = THREE.MathUtils.clamp((x - 0) / 22, 0, 1);
    const road1Z = THREE.MathUtils.lerp(-18, -10, t1);
    const dist1 = Math.abs(z - road1Z);
    if (x >= -2 && x <= 24 && dist1 < 2.2) {
      return 1.0 - (dist1 / 2.2);
    }

    // Road 2: Brecconary (22, -10) to Quagmire Cave / Swamp (45, 35)
    const t2 = THREE.MathUtils.clamp((z - (-10)) / 45, 0, 1);
    const road2X = THREE.MathUtils.lerp(22, 45, t2);
    const dist2 = Math.abs(x - road2X);
    if (z >= -10 && z <= 36 && dist2 < 2.0) {
      return 1.0 - (dist2 / 2.0);
    }

    // Road 3: Tantegel to Rain Shrine (-42, 20)
    const t3 = THREE.MathUtils.clamp((x - 0) / -42, 0, 1);
    const road3Z = THREE.MathUtils.lerp(-18, 20, t3);
    const dist3 = Math.abs(z - road3Z);
    if (x <= 2 && x >= -42 && dist3 < 2.0) {
      return 1.0 - (dist3 / 2.0);
    }

    return 0.0;
  }

  // Check surface type for footstep sounds & effects
  getSurfaceType(x, z) {
    const dCastle = Math.hypot(x - 0, z - (-28));
    if (dCastle < 17) return 'stone';

    const dTown = Math.hypot(x - 22, z - (-10));
    if (dTown < 14) return 'wood';

    const dSwamp = Math.hypot(x - 45, z - 35);
    if (dSwamp < 16.5) return 'swamp';

    const y = this.getHeight(x, z);
    if (y <= 0.2) return 'water';
    if (this.isRoad(x, z) > 0.4) return 'dirt';

    return 'grass';
  }
}
