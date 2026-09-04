// Procedural Day/Night Sky Dome with Volumetric Stylized Clouds, Sun/Moon, and Stars
import * as THREE from 'three';

export class DynamicSky {
  constructor(scene) {
    this.scene = scene;
    this.timeOfDay = 0.32; // 0.0 = midnight, 0.25 = dawn, 0.35 = morning, 0.5 = noon, 0.75 = sunset, 0.85 = dusk
    this.timeSpeed = 0.0008; // Realistic, majestic RPG day progression speed (prevents rapid shadow sweeping)
    this.isPaused = false;

    // Sun & Moon Directional Lights
    this.sunLight = new THREE.DirectionalLight(0xfffaed, 2.2);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    this.sunLight.shadow.camera.near = 0.5;
    this.sunLight.shadow.camera.far = 180;
    const d = 55;
    this.sunLight.shadow.camera.left = -d;
    this.sunLight.shadow.camera.right = d;
    this.sunLight.shadow.camera.top = d;
    this.sunLight.shadow.camera.bottom = -d;
    this.sunLight.shadow.bias = -0.0004;
    this.sunLight.shadow.normalBias = 0.04;
    this.scene.add(this.sunLight);

    this.moonLight = new THREE.DirectionalLight(0x7c96d6, 0.4);
    this.moonLight.castShadow = false;
    this.scene.add(this.moonLight);
    this.scene.add(this.moonLight.target);

    this.hemiLight = new THREE.HemisphereLight(0x9bd4ff, 0x3b582b, 1.2);
    this.scene.add(this.hemiLight);
    this.scene.add(this.sunLight.target);

    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.35);
    this.scene.add(this.ambientLight);

    // Sun Direction
    this.sunDir = new THREE.Vector3(0.5, 0.8, 0.3).normalize();

    // Sky Dome Mesh with Custom Shader
    this.initSkyDome();
    this.initStylizedClouds();
    this.initStars();
    this.applyDayNightPalette();
  }

  initSkyDome() {
    const skyGeo = new THREE.SphereGeometry(300, 32, 24);
    const skyMat = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      uniforms: {
        topColor: { value: new THREE.Color(0x3a88e9) },
        horizonColor: { value: new THREE.Color(0xd6efff) },
        bottomColor: { value: new THREE.Color(0x567b45) },
        sunPosition: { value: new THREE.Vector3() },
        sunColor: { value: new THREE.Color(0xfff5dd) },
        time: { value: 0 }
      },
      vertexShader: `
        varying vec3 vLocalPosition;
        void main() {
          vLocalPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 topColor;
        uniform vec3 horizonColor;
        uniform vec3 bottomColor;
        uniform vec3 sunPosition;
        uniform vec3 sunColor;
        varying vec3 vLocalPosition;

        void main() {
          vec3 dir = normalize(vLocalPosition);
          float h = dir.y;

          // Sky gradient
          vec3 col;
          if (h > 0.0) {
            float t = pow(h, 0.45);
            col = mix(horizonColor, topColor, t);
          } else {
            float t = clamp(-h * 4.0, 0.0, 1.0);
            col = mix(horizonColor, bottomColor, t);
          }

          // Cel-shaded sun disc & halo
          vec3 sDir = length(sunPosition) > 0.001 ? normalize(sunPosition) : vec3(0.0, 1.0, 0.0);
          float sunCos = dot(dir, sDir);
          if (sunCos > 0.998) {
            col = mix(col, vec3(1.0, 0.98, 0.85), 0.95);
          } else if (sunCos > 0.992) {
            float halo = smoothstep(0.992, 0.998, sunCos);
            col = mix(col, sunColor, halo * 0.7);
          }

          gl_FragColor = vec4(col, 1.0);
        }
      `
    });

    this.skyMesh = new THREE.Mesh(skyGeo, skyMat);
    this.scene.add(this.skyMesh);
  }

  initStylizedClouds() {
    // Fluffy BotW-style cumulus cloud puff cluster
    this.cloudsGroup = new THREE.Group();
    const cloudMat = new THREE.MeshToonMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.92
    });

    const cloudPuffGeo = new THREE.DodecahedronGeometry(1, 1);

    // Create 18 distinct cloud clusters drifting in the sky
    this.cloudClusters = [];
    for (let i = 0; i < 20; i++) {
      const cluster = new THREE.Group();
      const numPuffs = 6 + Math.floor(Math.random() * 6);
      const scaleBase = 6 + Math.random() * 8;

      for (let p = 0; p < numPuffs; p++) {
        const puff = new THREE.Mesh(cloudPuffGeo, cloudMat);
        puff.position.set(
          (Math.random() - 0.5) * scaleBase * 2.2,
          (Math.random() - 0.2) * scaleBase * 0.8,
          (Math.random() - 0.5) * scaleBase * 1.8
        );
        const pScale = scaleBase * (0.6 + Math.random() * 0.7);
        puff.scale.set(pScale, pScale * 0.7, pScale);
        cluster.add(puff);
      }

      const angle = (i / 20) * Math.PI * 2 + Math.random() * 0.2;
      const radius = 120 + Math.random() * 90;
      cluster.position.set(
        Math.cos(angle) * radius,
        55 + Math.random() * 30,
        Math.sin(angle) * radius
      );

      this.cloudClusters.push({
        group: cluster,
        speed: 0.8 + Math.random() * 0.6,
        baseY: cluster.position.y
      });
      this.cloudsGroup.add(cluster);
    }
    this.scene.add(this.cloudsGroup);
  }

  initStars() {
    const starCount = 600;
    const starGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 0.9 + 0.1); // upper hemisphere
      const r = 290;
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.cos(phi);
      positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }

    starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.starMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 1.8,
      transparent: true,
      opacity: 0.0
    });
    this.stars = new THREE.Points(starGeo, this.starMat);
    this.scene.add(this.stars);
  }

  update(delta, playerPos) {
    if (!this.isPaused) {
      this.timeOfDay = (this.timeOfDay + delta * this.timeSpeed) % 1.0;
    }

    this.applyDayNightPalette();

    // Keep sky dome centered on player
    if (playerPos) {
      this.skyMesh.position.copy(playerPos);
      this.cloudsGroup.position.x = playerPos.x;
      this.cloudsGroup.position.z = playerPos.z;
      this.stars.position.copy(playerPos);
      this.sunLight.position.set(playerPos.x + this.sunDir.x * 60, playerPos.y + this.sunDir.y * 60, playerPos.z + this.sunDir.z * 60);
      this.sunLight.target.position.copy(playerPos);
      this.sunLight.target.updateMatrixWorld();
    }

    // Move clouds slowly with wind
    this.cloudClusters.forEach(c => {
      c.group.position.x += delta * c.speed * 2.2;
      if (c.group.position.x > 250) c.group.position.x = -250;
    });
  }

  applyDayNightPalette() {
    const t = this.timeOfDay;
    // Calculate sun and moon orbital angles
    const angle = t * Math.PI * 2;
    const sunY = Math.sin(angle);
    const sunX = Math.cos(angle);
    const sunZ = Math.sin(angle * 0.7) * 0.3;

    this.sunDir = new THREE.Vector3(sunX, sunY, sunZ).normalize();
    const moonDir = this.sunDir.clone().negate();

    const skyMat = this.skyMesh.material;
    skyMat.uniforms.sunPosition.value.copy(this.sunDir);

    // Color states: Dawn (0.23-0.28), Day (0.28-0.70), Sunset (0.70-0.78), Night (0.78-0.23)
    let topCol, horizCol, bottomCol, sunCol, sunIntensity, hemiSky, hemiGround, starAlpha;

    if (t >= 0.22 && t < 0.28) {
      // Dawn / Sunrise: Soft rose, gold and peach
      const f = (t - 0.22) / 0.06;
      topCol = new THREE.Color(0x283256).lerp(new THREE.Color(0x3a88e9), f);
      horizCol = new THREE.Color(0xff8c55).lerp(new THREE.Color(0xffde94), f);
      bottomCol = new THREE.Color(0x403020).lerp(new THREE.Color(0x4e6b3b), f);
      sunCol = new THREE.Color(0xffaa66).lerp(new THREE.Color(0xfffae0), f);
      sunIntensity = 0.2 + f * 1.8;
      hemiSky = new THREE.Color(0xffb595).lerp(new THREE.Color(0x9bd4ff), f);
      hemiGround = new THREE.Color(0x382c20).lerp(new THREE.Color(0x3b582b), f);
      starAlpha = 1.0 - f;
    } else if (t >= 0.28 && t < 0.70) {
      // Full Day (Crisp Ghibli / BotW Azure Sky)
      topCol = new THREE.Color(0x2e86de);
      horizCol = new THREE.Color(0xcdf0ff);
      bottomCol = new THREE.Color(0x50753a);
      sunCol = new THREE.Color(0xfffae8);
      sunIntensity = 2.2;
      hemiSky = new THREE.Color(0xcaebff);
      hemiGround = new THREE.Color(0x476332);
      starAlpha = 0.0;
    } else if (t >= 0.70 && t < 0.78) {
      // Golden Hour & Sunset: Fiery amber, coral, violet
      const f = (t - 0.70) / 0.08;
      topCol = new THREE.Color(0x2e86de).lerp(new THREE.Color(0x432454), f);
      horizCol = new THREE.Color(0xcdf0ff).lerp(new THREE.Color(0xff6e38), f);
      bottomCol = new THREE.Color(0x50753a).lerp(new THREE.Color(0x2c1f24), f);
      sunCol = new THREE.Color(0xfffae8).lerp(new THREE.Color(0xff5522), f);
      sunIntensity = 2.2 * (1.0 - f * 0.85);
      hemiSky = new THREE.Color(0xcaebff).lerp(new THREE.Color(0xff8866), f);
      hemiGround = new THREE.Color(0x476332).lerp(new THREE.Color(0x2d1d22), f);
      starAlpha = f * 0.7;
    } else {
      // Nighttime: Deep indigo, midnight starlight, glowing moon
      topCol = new THREE.Color(0x060b1e);
      horizCol = new THREE.Color(0x131a38);
      bottomCol = new THREE.Color(0x090d19);
      sunCol = new THREE.Color(0x7788aa);
      sunIntensity = 0.05;
      hemiSky = new THREE.Color(0x182442);
      hemiGround = new THREE.Color(0x0b121c);
      starAlpha = 0.95;
    }

    skyMat.uniforms.topColor.value.copy(topCol);
    skyMat.uniforms.horizonColor.value.copy(horizCol);
    skyMat.uniforms.bottomColor.value.copy(bottomCol);
    skyMat.uniforms.sunColor.value.copy(sunCol);

    this.sunLight.color.copy(sunCol);
    this.sunLight.intensity = Math.max(0.02, sunIntensity);
    this.hemiLight.color.copy(hemiSky);
    this.hemiLight.groundColor.copy(hemiGround);
    this.starMat.opacity = starAlpha;

    // Tint clouds with horizon/sun color
    this.cloudClusters.forEach(c => {
      c.group.children.forEach(puff => {
        puff.material.color.copy(horizCol).lerp(new THREE.Color(0xffffff), 0.6);
      });
    });
  }

  setTime(fraction) {
    this.timeOfDay = fraction % 1.0;
  }
}
