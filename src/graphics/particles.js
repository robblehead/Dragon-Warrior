// Atmospheric & Combat Particle FX (BotW / Dragon Warrior Caliber)
import * as THREE from 'three';

export class ParticleSystem {
  constructor(scene) {
    this.scene = scene;
    this.activeEmitters = [];
    // Ambient floating untextured point cubes removed per user request
  }

  // Spawn dynamic transient burst (magic, sparks, hits)
  spawnSpellBurst(position, type = 'heal') {
    const count = type === 'radiant' ? 120 : 60;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const velocities = [];

    let color = 0x66ff88; // Heal green
    if (type === 'hurt') color = 0xff5511; // Fireball red-orange
    if (type === 'hurtmore') color = 0x33ccff; // Lightning blue
    if (type === 'sleep') color = 0xffdd88; // Stardust gold
    if (type === 'radiant') color = 0xffffff; // Pure radiant white

    for (let i = 0; i < count; i++) {
      positions[i * 3] = position.x;
      positions[i * 3 + 1] = position.y + 0.8;
      positions[i * 3 + 2] = position.z;

      const speed = 2.0 + Math.random() * 4.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      velocities.push({
        x: Math.sin(phi) * Math.cos(theta) * speed,
        y: Math.cos(phi) * speed + 1.2,
        z: Math.sin(phi) * Math.sin(theta) * speed
      });
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
      color,
      size: type === 'radiant' ? 0.6 : 0.35,
      transparent: true,
      opacity: 1.0,
      blending: THREE.AdditiveBlending
    });
    const points = new THREE.Points(geo, mat);
    this.scene.add(points);

    this.activeEmitters.push({
      points,
      velocities,
      positions,
      geo,
      mat,
      life: 0.9,
      maxLife: 0.9
    });
  }

  update(delta, time, playerPos, isNight) {
    // Update active spell transient emitters
    for (let i = this.activeEmitters.length - 1; i >= 0; i--) {
      const em = this.activeEmitters[i];
      em.life -= delta;
      if (em.life <= 0) {
        this.scene.remove(em.points);
        em.geo.dispose();
        em.mat.dispose();
        this.activeEmitters.splice(i, 1);
        continue;
      }

      const progress = 1.0 - (em.life / em.maxLife);
      em.mat.opacity = 1.0 - progress;

      const posAttr = em.geo.attributes.position;
      for (let k = 0; k < posAttr.count; k++) {
        let x = posAttr.getX(k) + em.velocities[k].x * delta;
        let y = posAttr.getY(k) + em.velocities[k].y * delta;
        let z = posAttr.getZ(k) + em.velocities[k].z * delta;
        em.velocities[k].y -= 4.5 * delta; // Gravity

        posAttr.setXYZ(k, x, y, z);
      }
      posAttr.needsUpdate = true;
    }
  }
}
