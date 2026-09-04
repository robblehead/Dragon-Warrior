// 3D Procedural Dragon Warrior Monsters (Slime, Red Slime, Drakee, Skeleton, Green Dragon, Dragonlord)
import * as THREE from 'three';

export class MonsterFactory {
  // 1. Classic Blue / Red Slime
  static createSlime(color = 0x0284c7, isRed = false) {
    const group = new THREE.Group();
    const slimeMat = new THREE.MeshToonMaterial({
      color
    });
    const eyeWhiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const pupilMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });
    const mouthMat = new THREE.MeshBasicMaterial({ color: 0xbe123c });

    // Teardrop body
    const bodyGeo = new THREE.SphereGeometry(0.7, 24, 20);
    // Pinch top vertex to form teardrop tip
    const pos = bodyGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      let y = pos.getY(i);
      let x = pos.getX(i);
      let z = pos.getZ(i);
      if (y > 0.2) {
        let factor = 1.0 - (y - 0.2) * 0.9;
        pos.setX(i, x * factor);
        pos.setZ(i, z * factor);
        pos.setY(i, y * 1.35); // stretch tip
      }
    }
    bodyGeo.computeVertexNormals();

    const body = new THREE.Mesh(bodyGeo, slimeMat);
    body.position.y = 0.6;
    body.castShadow = true;
    group.add(body);

    // Eyes
    for (let side = -1; side <= 1; side += 2) {
      const eyeWhite = new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 12), eyeWhiteMat);
      eyeWhite.scale.set(1.0, 1.2, 0.4);
      eyeWhite.position.set(side * 0.24, 0.65, 0.58);
      group.add(eyeWhite);

      const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), pupilMat);
      pupil.position.set(side * 0.24, 0.65, 0.68);
      group.add(pupil);
    }

    // Smile
    const mouth = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.02, 8, 12, Math.PI), mouthMat);
    mouth.rotation.x = Math.PI;
    mouth.position.set(0, 0.42, 0.63);
    group.add(mouth);

    group.userData = {
      type: isRed ? 'red_slime' : 'slime',
      name: isRed ? 'Red Slime' : 'Slime',
      hp: isRed ? 8 : 5,
      maxHp: isRed ? 8 : 5,
      attack: isRed ? 5 : 3,
      defense: isRed ? 3 : 2,
      agility: isRed ? 4 : 3,
      exp: isRed ? 4 : 2,
      gold: isRed ? 6 : 3,
      scaleY: 1.0
    };

    return group;
  }

  // 2. Drakee (Bat-demon)
  static createDrakee() {
    const group = new THREE.Group();
    const purpleMat = new THREE.MeshToonMaterial({ color: 0x7c3aed });
    const wingMat = new THREE.MeshToonMaterial({ color: 0x4c1d95, side: THREE.DoubleSide });
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });

    // Round bat body
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.55, 16, 16), purpleMat);
    body.position.y = 1.0;
    body.castShadow = true;
    group.add(body);

    // Large bat ears
    for (let side = -1; side <= 1; side += 2) {
      const ear = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.45, 8), purpleMat);
      ear.rotation.z = side * 0.45;
      ear.position.set(side * 0.35, 1.5, 0);
      group.add(ear);
    }

    // Glowing yellow eyes
    for (let side = -1; side <= 1; side += 2) {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), eyeMat);
      eye.position.set(side * 0.2, 1.05, 0.48);
      group.add(eye);
    }

    // Flapping Wings
    const wingL = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.6), wingMat);
    wingL.position.set(-0.7, 1.1, 0);
    wingL.rotation.y = 0.3;
    group.add(wingL);

    const wingR = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.6), wingMat);
    wingR.position.set(0.7, 1.1, 0);
    wingR.rotation.y = -0.3;
    group.add(wingR);

    group.userData = {
      type: 'drakee',
      name: 'Drakee',
      hp: 9,
      maxHp: 9,
      attack: 7,
      defense: 4,
      agility: 6,
      exp: 6,
      gold: 8,
      wingL,
      wingR
    };

    return group;
  }

  // 3. Skeleton Warrior
  static createSkeleton() {
    const group = new THREE.Group();
    const boneMat = new THREE.MeshToonMaterial({ color: 0xe2e8f0 });
    const metalMat = new THREE.MeshToonMaterial({ color: 0x64748b });

    // Skull
    const skull = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.45, 0.45), boneMat);
    skull.position.y = 1.75;
    skull.castShadow = true;
    group.add(skull);

    // Ribcage
    const ribs = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.25, 0.7, 8), boneMat);
    ribs.position.y = 1.25;
    group.add(ribs);

    // Spine & Pelvis
    const pelvis = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.2, 0.3), boneMat);
    pelvis.position.y = 0.8;
    group.add(pelvis);

    // Legs
    for (let side = -1; side <= 1; side += 2) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.8), boneMat);
      leg.position.set(side * 0.18, 0.4, 0);
      group.add(leg);
    }

    // Rusty Sword
    const sword = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.1, 0.04), metalMat);
    sword.position.set(0.5, 1.2, 0.3);
    sword.rotation.x = 0.3;
    group.add(sword);

    group.userData = {
      type: 'skeleton',
      name: 'Skeleton',
      hp: 28,
      maxHp: 28,
      attack: 16,
      defense: 12,
      agility: 10,
      exp: 14,
      gold: 25
    };

    return group;
  }

  // 4. The Fearsome Green Dragon (Boss guarding Princess Gwaelin)
  static createGreenDragon() {
    const group = new THREE.Group();
    const scaleMat = new THREE.MeshToonMaterial({ color: 0x15803d }); // Emerald dragon scales
    const bellyMat = new THREE.MeshToonMaterial({ color: 0x86efac }); // Pale belly
    const hornMat = new THREE.MeshToonMaterial({ color: 0xd97706 }); // Golden horns
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0xf97316 }); // Fiery orange eyes
    const wingMat = new THREE.MeshToonMaterial({ color: 0x166534, side: THREE.DoubleSide });

    // Main Dragon Body
    const body = new THREE.Mesh(new THREE.SphereGeometry(1.6, 16, 16), scaleMat);
    body.scale.set(1.1, 1.3, 1.6);
    body.position.set(0, 1.8, 0);
    body.castShadow = true;
    group.add(body);

    // Pale Belly Plate
    const belly = new THREE.Mesh(new THREE.SphereGeometry(1.4, 16, 16), bellyMat);
    belly.scale.set(0.9, 1.2, 1.4);
    belly.position.set(0, 1.7, 0.4);
    group.add(belly);

    // Dragon Neck & Head
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 3.2, 1.2);

    const head = new THREE.Mesh(new THREE.ConeGeometry(0.7, 1.8, 12), scaleMat);
    head.rotation.x = Math.PI / 2.3;
    head.position.set(0, 0, 0.6);
    headGroup.add(head);

    // Horns
    for (let side = -1; side <= 1; side += 2) {
      const horn = new THREE.Mesh(new THREE.ConeGeometry(0.18, 1.1, 8), hornMat);
      horn.rotation.set(-0.3, 0, side * 0.5);
      horn.position.set(side * 0.55, 0.5, 0.2);
      headGroup.add(horn);
    }

    // Glowing Eyes
    for (let side = -1; side <= 1; side += 2) {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 8), eyeMat);
      eye.position.set(side * 0.35, 0.25, 0.85);
      headGroup.add(eye);
    }

    group.add(headGroup);

    // Wings
    for (let side = -1; side <= 1; side += 2) {
      const wing = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.8), wingMat);
      wing.position.set(side * 2.0, 2.5, -0.4);
      wing.rotation.y = side * 0.4;
      group.add(wing);
    }

    // Heavy Tail
    const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.8, 3.0, 10), scaleMat);
    tail.rotation.x = -Math.PI / 3;
    tail.position.set(0, 1.1, -1.8);
    group.add(tail);

    group.userData = {
      type: 'green_dragon',
      name: 'Green Dragon',
      isBoss: true,
      hp: 65,
      maxHp: 65,
      attack: 26,
      defense: 18,
      agility: 14,
      exp: 135,
      gold: 150
    };

    return group;
  }

  // 5. The Colossal Dragonlord (True Form)
  static createDragonlord() {
    const group = new THREE.Group();
    const darkPurpleMat = new THREE.MeshToonMaterial({ color: 0x3b0764 });
    const bellyMat = new THREE.MeshToonMaterial({ color: 0x9333ea });
    const hornMat = new THREE.MeshToonMaterial({ color: 0xd97706 });
    const flameMat = new THREE.MeshBasicMaterial({ color: 0xff0055 });

    // Gigantic dragon torso
    const body = new THREE.Mesh(new THREE.SphereGeometry(2.4, 18, 18), darkPurpleMat);
    body.scale.set(1.2, 1.5, 1.8);
    body.position.set(0, 2.8, 0);
    body.castShadow = true;
    group.add(body);

    const belly = new THREE.Mesh(new THREE.SphereGeometry(2.1, 16, 16), bellyMat);
    belly.scale.set(1.0, 1.4, 1.6);
    belly.position.set(0, 2.7, 0.6);
    group.add(belly);

    // Draconic Head with 4 Horns
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 5.2, 1.8);

    const head = new THREE.Mesh(new THREE.ConeGeometry(1.1, 2.6, 12), darkPurpleMat);
    head.rotation.x = Math.PI / 2.3;
    head.position.set(0, 0, 0.9);
    headGroup.add(head);

    for (let side = -1; side <= 1; side += 2) {
      const horn1 = new THREE.Mesh(new THREE.ConeGeometry(0.24, 1.6, 8), hornMat);
      horn1.rotation.set(-0.4, 0, side * 0.6);
      horn1.position.set(side * 0.7, 0.7, 0.2);
      headGroup.add(horn1);

      const horn2 = new THREE.Mesh(new THREE.ConeGeometry(0.18, 1.1, 8), hornMat);
      horn2.rotation.set(-0.6, 0, side * 0.9);
      horn2.position.set(side * 0.9, 0.4, -0.1);
      headGroup.add(horn2);
    }

    // Baleful red eyes
    for (let side = -1; side <= 1; side += 2) {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 8), flameMat);
      eye.position.set(side * 0.5, 0.35, 1.2);
      headGroup.add(eye);
    }
    group.add(headGroup);

    // Massive Wingspan
    for (let side = -1; side <= 1; side += 2) {
      const wing = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 3.2), darkPurpleMat);
      wing.position.set(side * 3.4, 4.2, -0.6);
      wing.rotation.y = side * 0.45;
      group.add(wing);
    }

    group.userData = {
      type: 'dragonlord',
      name: 'The True Dragonlord',
      isBoss: true,
      hp: 130,
      maxHp: 130,
      attack: 38,
      defense: 28,
      agility: 22,
      exp: 500,
      gold: 1000
    };

    return group;
  }
}
