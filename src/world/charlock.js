// Charlock Island, Western Cape, and the Legendary Celestial Rainbow Bridge
import * as THREE from 'three';

export class CharlockSanctum {
  constructor(scene, terrain) {
    this.scene = scene;
    this.terrain = terrain;
    this.group = new THREE.Group();
    this.interactiveObjects = [];

    // Cape origin at (-45, y, -45)
    this.capePos = new THREE.Vector3(-45, 4.2, -45);
    // Charlock Isle origin at (-75, y, -75)
    this.islePos = new THREE.Vector3(-75, 6.0, -75);

    this.bridgeBuilt = false;
    this.rainbowBridge = null;

    this.buildCharlockFortress();
    this.buildCapePedestal();
    this.scene.add(this.group);
  }

  buildCharlockFortress() {
    const ix = this.islePos.x;
    const iz = this.islePos.z;
    const iy = this.islePos.y;

    const darkStoneMat = new THREE.MeshToonMaterial({ color: 0x18181b }); // Dark obsidian
    const lavaMat = new THREE.MeshBasicMaterial({ color: 0xff4500 }); // Molten lava

    // Volcanic base crags
    const cragGeo = new THREE.DodecahedronGeometry(18, 1);
    const crags = new THREE.Mesh(cragGeo, darkStoneMat);
    crags.position.set(ix, iy - 2, iz);
    crags.scale.set(1.4, 0.6, 1.4);
    this.group.add(crags);

    // Dark Citadel Spire (Dragonlord's Castle)
    const spireGeo = new THREE.ConeGeometry(5.0, 18.0, 8);
    const spire = new THREE.Mesh(spireGeo, darkStoneMat);
    spire.position.set(ix, iy + 9.0, iz);
    spire.castShadow = true;
    this.group.add(spire);

    // Flanking dark battlements
    for (let s = -1; s <= 1; s += 2) {
      const subSpire = new THREE.Mesh(new THREE.ConeGeometry(3.0, 12.0, 6), darkStoneMat);
      subSpire.position.set(ix + s * 6.5, iy + 6.0, iz + s * 4.0);
      this.group.add(subSpire);
    }

    // Dragonlord's Obsidian Throne Platform atop the fortress
    const thronePlat = new THREE.Mesh(new THREE.BoxGeometry(8, 1.2, 8), darkStoneMat);
    thronePlat.position.set(ix, iy + 1.2, iz + 6);
    this.group.add(thronePlat);

    // Purple dragonlord throne
    const dlThroneMat = new THREE.MeshToonMaterial({ color: 0x581c87 });
    const dlThrone = new THREE.Mesh(new THREE.BoxGeometry(2.0, 3.2, 1.2), dlThroneMat);
    dlThrone.position.set(ix, iy + 3.0, iz + 8.5);
    this.group.add(dlThrone);

    // Ominous purple magical beacon
    const dlLight = new THREE.PointLight(0xa855f7, 2.5, 25);
    dlLight.position.set(ix, iy + 4.5, iz + 6);
    this.group.add(dlLight);

    // Molten lava fissures
    const lavaRing = new THREE.Mesh(new THREE.RingGeometry(8, 13, 16), lavaMat);
    lavaRing.rotation.x = -Math.PI / 2;
    lavaRing.position.set(ix, iy + 0.1, iz);
    this.group.add(lavaRing);
  }

  buildCapePedestal() {
    const cx = this.capePos.x;
    const cz = this.capePos.z;
    const cy = this.capePos.y;

    const stoneMat = new THREE.MeshToonMaterial({ color: 0x64748b });
    const runeMat = new THREE.MeshBasicMaterial({ color: 0xf43f5e });

    // Raised cliff edge stone slab
    const slab = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.6, 3.5), stoneMat);
    slab.position.set(cx, cy + 0.3, cz);
    this.group.add(slab);

    const runeCircle = new THREE.Mesh(new THREE.CircleGeometry(1.2, 16), runeMat);
    runeCircle.rotation.x = -Math.PI / 2;
    runeCircle.position.set(cx, cy + 0.62, cz);
    this.group.add(runeCircle);

    this.interactiveObjects.push({
      type: 'charlock_cape',
      name: 'Western Cape of Charlock',
      position: new THREE.Vector3(cx, cy, cz)
    });
  }

  // Summon the celestial Rainbow Bridge spanning from (-45, 4.2, -45) to (-75, 6.0, -75)
  buildRainbowBridge() {
    if (this.bridgeBuilt) return;
    this.bridgeBuilt = true;
    const start = this.capePos;
    const end = new THREE.Vector3(-68, 6.0, -68);

    const length = start.distanceTo(end);
    const bridgeGeo = new THREE.BoxGeometry(3.2, 0.4, length);
    bridgeGeo.translate(0, 0, length * 0.5);

    // Glowing prismatic rainbow shader
    const bridgeMat = new THREE.ShaderMaterial({
      transparent: true,
      uniforms: {
        time: { value: 0 }
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vPos;
        void main() {
          vUv = uv;
          vPos = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        varying vec2 vUv;
        varying vec3 vPos;

        // Convert hue to RGB
        vec3 rainbow(float h) {
          float r = abs(h * 6.0 - 3.0) - 1.0;
          float g = 2.0 - abs(h * 6.0 - 2.0);
          float b = 2.0 - abs(h * 6.0 - 4.0);
          return clamp(vec3(r, g, b), 0.0, 1.0);
        }

        void main() {
          float hue = fract(vUv.x + vPos.z * 0.04 - time * 0.4);
          vec3 col = rainbow(hue);
          float edge = smoothstep(0.0, 0.15, vUv.x) * smoothstep(1.0, 0.85, vUv.x);
          gl_FragColor = vec4(col + vec3(0.3), 0.78 * edge);
        }
      `
    });

    this.rainbowBridge = new THREE.Mesh(bridgeGeo, bridgeMat);
    this.rainbowBridge.position.copy(start);
    this.rainbowBridge.lookAt(end);
    this.group.add(this.rainbowBridge);

    // Prismatic bridge lights
    for (let i = 0; i < 4; i++) {
      const t = (i + 1) / 5;
      const lightPos = start.clone().lerp(end, t);
      const bridgeLight = new THREE.PointLight(0xff66cc, 1.5, 14);
      bridgeLight.position.set(lightPos.x, lightPos.y + 1.2, lightPos.z);
      this.group.add(bridgeLight);
    }
  }

  update(time) {
    if (this.rainbowBridge && this.rainbowBridge.material.uniforms) {
      this.rainbowBridge.material.uniforms.time.value = time;
    }
  }
}
