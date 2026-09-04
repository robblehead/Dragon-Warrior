// Cel-Shaded Stylized Water with Foam and Wave Displacement
import * as THREE from 'three';

export class StylizedWater {
  constructor(scene) {
    this.scene = scene;
    this.waterMesh = null;
    this.initWater();
  }

  initWater() {
    const geo = new THREE.PlaneGeometry(280, 280, 48, 48);
    geo.rotateX(-Math.PI / 2);

    this.material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: {
        time: { value: 0 },
        shallowColor: { value: new THREE.Color(0x38bdf8) }, // Turquoise
        deepColor: { value: new THREE.Color(0x0369a1) },    // Deep royal blue
        foamColor: { value: new THREE.Color(0xffffff) },
        sunDir: { value: new THREE.Vector3(0.5, 0.8, 0.3).normalize() }
      },
      vertexShader: `
        uniform float time;
        varying vec2 vUv;
        varying vec3 vWorldPos;

        void main() {
          vUv = uv;
          vec3 pos = position;
          // Gentle undulating waves
          float wave1 = sin(pos.x * 0.18 + time * 1.6) * 0.12;
          float wave2 = cos(pos.z * 0.14 + time * 1.2) * 0.10;
          pos.y += wave1 + wave2;

          vec4 worldPos = modelMatrix * vec4(pos, 1.0);
          vWorldPos = worldPos.xyz;
          gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec3 shallowColor;
        uniform vec3 deepColor;
        uniform vec3 foamColor;
        uniform vec3 sunDir;
        varying vec2 vUv;
        varying vec3 vWorldPos;

        void main() {
          // Dynamic water surface ripples
          float ripple = sin(vWorldPos.x * 1.5 + time * 2.5) * cos(vWorldPos.z * 1.5 + time * 2.0);
          float foamMask = smoothstep(0.72, 0.95, ripple);

          // Deep/shallow gradient
          vec3 waterCol = mix(deepColor, shallowColor, 0.45 + ripple * 0.15);
          vec3 finalCol = mix(waterCol, foamColor, foamMask * 0.65);

          // Sun specular glint
          vec3 viewDir = normalize(cameraPosition - vWorldPos);
          vec3 halfDir = normalize(sunDir + viewDir);
          float spec = pow(max(dot(vec3(0.0, 1.0, 0.0), halfDir), 0.0), 32.0);
          if (spec > 0.4) {
            finalCol += vec3(1.0, 0.98, 0.9) * 0.45;
          }

          gl_FragColor = vec4(finalCol, 0.82);
        }
      `
    });

    this.waterMesh = new THREE.Mesh(geo, this.material);
    this.waterMesh.position.y = -0.05; // Base water level
    this.scene.add(this.waterMesh);
  }

  update(time, sunDir) {
    if (this.material) {
      this.material.uniforms.time.value = time;
      if (sunDir) this.material.uniforms.sunDir.value.copy(sunDir);
    }
  }
}
