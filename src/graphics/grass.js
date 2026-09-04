// Instanced Wind-Swayed Reactive Grass System (BotW Caliber Aesthetic)
import * as THREE from 'three';

export class WindGrassField {
  constructor(scene, terrainHeightFunc, bounds = { minX: -110, maxX: 110, minZ: -110, maxZ: 110 }) {
    this.scene = scene;
    this.terrainHeightFunc = terrainHeightFunc;
    this.bounds = bounds;

    this.grassMesh = null;
    this.flowerMesh = null;
    this.material = null;
    this.flowerMat = null;

    this.initGrass();
    this.initWildflowers();
  }

  initGrass() {
    const bladeWidth = 0.16;
    const bladeHeight = 1.0;
    const bladeSegments = 3;

    // Curved tapered blade geometry
    const bladeGeo = new THREE.PlaneGeometry(bladeWidth, bladeHeight, 1, bladeSegments);
    bladeGeo.translate(0, bladeHeight * 0.5, 0); // pivot at base

    // Custom shader material for instanced wind + player interaction
    this.material = new THREE.ShaderMaterial({
      side: THREE.DoubleSide,
      uniforms: {
        time: { value: 0 },
        playerPos: { value: new THREE.Vector3(0, 0, 0) },
        windDir: { value: new THREE.Vector2(0.8, 0.6).normalize() },
        baseColor: { value: new THREE.Color(0x2f6b27) }, // Deep emerald
        tipColor: { value: new THREE.Color(0x9bd838) },  // Vibrant sunlit chartreuse
        sunDir: { value: new THREE.Vector3(0.5, 0.8, 0.3).normalize() }
      },
      vertexShader: `
        uniform float time;
        uniform vec3 playerPos;
        uniform vec2 windDir;
        varying vec2 vUv;
        varying vec3 vNormal;
        varying float vHeightFactor;

        void main() {
          vUv = uv;
          vNormal = normalize(normalMatrix * normal);
          vHeightFactor = uv.y;

          vec4 instancePos = instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
          vec3 bladeOrigin = instancePos.xyz;

          // Multi-octave wind waving
          float wave1 = sin(time * 2.4 + bladeOrigin.x * 0.15 + bladeOrigin.z * 0.2) * 0.35;
          float wave2 = cos(time * 3.8 + bladeOrigin.x * 0.35 + bladeOrigin.z * 0.1) * 0.15;
          float wind = (wave1 + wave2) * uv.y * uv.y;

          // Wind displacement
          vec3 localOffset = vec3(windDir.x * wind, 0.0, windDir.y * wind);

          // Reactive player push-back (grass bends away as hero walks through)
          vec3 toPlayer = bladeOrigin - playerPos;
          float distToPlayer = length(toPlayer.xz);
          if (distToPlayer < 2.5 && uv.y > 0.1) {
            float pushFactor = (1.0 - smoothstep(0.0, 2.5, distToPlayer)) * 0.85 * uv.y;
            vec2 pushDir = normalize(toPlayer.xz + vec2(0.001, 0.001));
            localOffset.x += pushDir.x * pushFactor;
            localOffset.z += pushDir.y * pushFactor;
            localOffset.y -= pushFactor * 0.2;
          }

          vec4 finalPos = instanceMatrix * vec4(position, 1.0);
          finalPos.xyz += localOffset;

          vec4 outWorldPos = modelMatrix * finalPos;
          gl_Position = projectionMatrix * viewMatrix * outWorldPos;
        }
      `,
      fragmentShader: `
        uniform vec3 baseColor;
        uniform vec3 tipColor;
        uniform vec3 sunDir;
        varying vec2 vUv;
        varying vec3 vNormal;
        varying float vHeightFactor;

        void main() {
          // Color gradient from root to sunlit tip
          vec3 col = mix(baseColor, tipColor, pow(vHeightFactor, 1.2));

          // Soft cel-shaded lighting
          float NdotL = max(dot(vNormal, sunDir), 0.0);
          float light = mix(0.7, 1.15, smoothstep(0.1, 0.6, NdotL));
          col *= light;

          gl_FragColor = vec4(col, 1.0);
        }
      `
    });

    const instanceCount = 28000;
    this.grassMesh = new THREE.InstancedMesh(bladeGeo, this.material, instanceCount);
    this.grassMesh.castShadow = false;
    this.grassMesh.receiveShadow = false;

    const dummy = new THREE.Object3D();
    let count = 0;

    for (let i = 0; i < instanceCount; i++) {
      const x = THREE.MathUtils.lerp(this.bounds.minX, this.bounds.maxX, Math.random());
      const z = THREE.MathUtils.lerp(this.bounds.minZ, this.bounds.maxZ, Math.random());
      const y = this.terrainHeightFunc(x, z);

      // Check if location is suitable for grass (avoid water, castle interior, cave depths)
      if (y > 0.4 && y < 14.0) {
        // Exclude castle zone, town zone, and swamp
        const distToCastle = Math.hypot(x - 0, z - (-25));
        const distToTown = Math.hypot(x - 45, z - (-10));
        const distToSwamp = Math.hypot(x - 45, z - 35);
        if (distToCastle > 24 && distToTown > 18 && distToSwamp > 20) {
          dummy.position.set(x, y, z);
          dummy.rotation.y = Math.random() * Math.PI * 2;
          dummy.rotation.z = (Math.random() - 0.5) * 0.2;
          const s = 0.75 + Math.random() * 0.55;
          dummy.scale.set(s, s * (0.8 + Math.random() * 0.5), s);
          dummy.updateMatrix();

          this.grassMesh.setMatrixAt(count, dummy.matrix);
          count++;
        }
      }
    }

    this.grassMesh.count = count;
    this.grassMesh.instanceMatrix.needsUpdate = true;
    this.scene.add(this.grassMesh);
  }

  initWildflowers() {
    const flowerGeo = new THREE.TetrahedronGeometry(0.18, 0);
    this.flowerMat = new THREE.MeshToonMaterial();

    const flowerCount = 1800;
    this.flowerMesh = new THREE.InstancedMesh(flowerGeo, this.flowerMat, flowerCount);

    const colors = [
      new THREE.Color(0xff4757), // Poppy Red
      new THREE.Color(0xffa502), // Marigold Orange
      new THREE.Color(0xeccc68), // Buttercup Yellow
      new THREE.Color(0x70a1ff), // Bluebell
      new THREE.Color(0xffffff)  // White Daisy
    ];

    const dummy = new THREE.Object3D();
    let fCount = 0;

    for (let i = 0; i < flowerCount; i++) {
      const x = THREE.MathUtils.lerp(this.bounds.minX, this.bounds.maxX, Math.random());
      const z = THREE.MathUtils.lerp(this.bounds.minZ, this.bounds.maxZ, Math.random());
      const y = this.terrainHeightFunc(x, z);

      if (y > 0.6 && y < 12.0) {
        const distToCastle = Math.hypot(x - 0, z - (-25));
        const distToTown = Math.hypot(x - 45, z - (-10));
        const distToSwamp = Math.hypot(x - 45, z - 35);
        if (distToCastle > 24 && distToTown > 18 && distToSwamp > 20) {
          dummy.position.set(x, y + 0.35 + Math.random() * 0.25, z);
          dummy.rotation.set(Math.random() * 0.5, Math.random() * Math.PI * 2, Math.random() * 0.5);
          const s = 0.8 + Math.random() * 0.6;
          dummy.scale.set(s, s, s);
          dummy.updateMatrix();

          this.flowerMesh.setMatrixAt(fCount, dummy.matrix);
          const col = colors[Math.floor(Math.random() * colors.length)];
          this.flowerMesh.setColorAt(fCount, col);
          fCount++;
        }
      }
    }

    this.flowerMesh.count = fCount;
    this.flowerMesh.instanceMatrix.needsUpdate = true;
    if (this.flowerMesh.instanceColor) this.flowerMesh.instanceColor.needsUpdate = true;
    this.scene.add(this.flowerMesh);
  }

  update(time, playerPos, sunDir) {
    if (this.material) {
      this.material.uniforms.time.value = time;
      if (playerPos) this.material.uniforms.playerPos.value.copy(playerPos);
      if (sunDir) this.material.uniforms.sunDir.value.copy(sunDir);
    }
  }
}
