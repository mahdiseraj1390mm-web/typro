'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GameMode, GameDifficulty } from '@/components/games/TypingGameArena';

export interface Interactive3DTarget {
  id: number;
  word: string;
  x: number;
  y: number;
  z: number;
  screenX: number;
  screenY: number;
  scale: number;
}

interface GameCanvas3DProps {
  mode: GameMode;
  difficulty: GameDifficulty;
  isPlaying: boolean;
  score: number;
  combo: number;
  lives: number;
  actionTrigger?: { type: string; payload?: any; id: number } | null;
  onTargetPositionsUpdate?: (positions: Interactive3DTarget[]) => void;
  onTargetBreached?: (id: number) => void;
  balloonsData?: Array<{ id: number; word: string; x: number; y: number; color: string }>;
  meteorsData?: Array<{ id: number; word: string; x: number; y: number }>;
  dronesData?: Array<{ id: number; word: string; distance: number; lane: number }>;
}

// Helper to generate a 3D Sprite with crystal-clear Persian text directly attached to 3D objects
function createTextSprite(text: string, isMeteor: boolean = false, accentColor: string = '#ffffff') {
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 180;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.Group();

  ctx.clearRect(0, 0, 640, 180);

  // Background aura & solid high-contrast dark pill
  ctx.shadowColor = isMeteor ? '#f59e0b' : accentColor;
  ctx.shadowBlur = 20;

  ctx.fillStyle = isMeteor ? 'rgba(18, 10, 4, 0.92)' : 'rgba(8, 12, 24, 0.92)';
  ctx.beginPath();
  if (typeof (ctx as any).roundRect === 'function') {
    (ctx as any).roundRect(24, 18, 592, 144, 72);
  } else {
    ctx.rect(24, 18, 592, 144);
  }
  ctx.fill();

  ctx.strokeStyle = isMeteor ? '#fbbf24' : accentColor;
  ctx.lineWidth = 6;
  ctx.stroke();

  // High contrast text with dark outline and bold crisp font
  ctx.font = 'bold 58px Vazirmatn, Tahoma, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 8;
  ctx.strokeText(text, 320, 90);

  ctx.fillStyle = '#ffffff';
  ctx.fillText(text, 320, 90);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  const mat = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: false,
  });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(4.4, 1.25, 1);
  return sprite;
}

export default function GameCanvas3D({
  mode,
  difficulty,
  isPlaying,
  score,
  combo,
  lives,
  actionTrigger,
  onTargetPositionsUpdate,
  onTargetBreached,
  balloonsData,
  meteorsData,
  dronesData,
}: GameCanvas3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const animFrameIdRef = useRef<number>(0);

  // References for live 3D game states
  const stateRef = useRef<{
    scene?: THREE.Scene;
    camera?: THREE.PerspectiveCamera;
    renderer?: THREE.WebGLRenderer;
    flashLight?: THREE.PointLight;
    ambientLight?: THREE.AmbientLight;
    cameraShake: number;

    // Debris & Lasers
    debrisList: Array<{
      mesh: THREE.Mesh | THREE.Group;
      velocity: THREE.Vector3;
      rotSpeed: THREE.Vector3;
      life: number;
    }>;
    lasersList: Array<{
      mesh: THREE.Mesh;
      velocity: THREE.Vector3;
      targetPos: THREE.Vector3;
      life: number;
    }>;

    // Racer (Chaser)
    playerCar?: THREE.Group;
    rivalCars?: THREE.Group[];
    roadDashes?: THREE.Mesh[];
    carSteerX: number;
    nitroFlames?: THREE.Points;
    nitroActiveTime: number;

    // Defense (Air / Turret Defense)
    turretBase?: THREE.Group;
    turretHead?: THREE.Group;
    turretAimAngle: number;
    turretElevation: number;
    activeDroneTargetPos?: THREE.Vector3;
    enemyDrones: Map<number, THREE.Group>;

    // Mining
    pickaxe?: THREE.Group;
    pickaxeSwingTime: number;
    miningRock?: THREE.Group;
    rockOreType: number;

    // Penalty Shootout
    soccerBall?: THREE.Mesh;
    ballVelocity?: THREE.Vector3;
    ballInFlight: boolean;
    goalkeeper?: THREE.Group;
    goalNet?: THREE.Group;
    strikerLeg?: THREE.Group;
    strikerKickTime: number;
    goalkeeperDiveTime: number;
    goalkeeperTargetX: number;

    // Boxer
    opponentBoxer?: THREE.Group;
    playerGloves?: THREE.Group;
    gloveLeft?: THREE.Mesh;
    gloveRight?: THREE.Mesh;
    punchAnimTime: number;
    opponentHitTime: number;
    opponentHealth: number;

    // Bomb Defusal
    bombSuitcase?: THREE.Group;
    pliersTool?: THREE.Group;
    bombWires?: THREE.Mesh[];
    pliersCutAnimTime: number;

    // Parkour Runner
    parkourRunner?: THREE.Group;
    parkourObstacles?: THREE.Group[];
    runnerJumpTime: number;

    // Cyber Hacker
    cyberCore?: THREE.Group;
    firewallRings?: THREE.Mesh[];
    hackerStreams?: THREE.Points;

    // Wordfall (Meteors)
    meteorMeshes: Map<number, THREE.Group>;

    // Balloon Mode
    balloonMeshes: Map<number, THREE.Group>;
  }>({
    cameraShake: 0,
    debrisList: [],
    lasersList: [],
    carSteerX: 0,
    nitroActiveTime: 0,
    turretAimAngle: 0,
    turretElevation: 0,
    enemyDrones: new Map(),
    pickaxeSwingTime: 0,
    rockOreType: 0,
    ballInFlight: false,
    strikerKickTime: 0,
    goalkeeperDiveTime: 0,
    goalkeeperTargetX: 0,
    punchAnimTime: 0,
    opponentHitTime: 0,
    opponentHealth: 100,
    pliersCutAnimTime: 0,
    runnerJumpTime: 0,
    meteorMeshes: new Map(),
    balloonMeshes: new Map(),
  });

  // ══════════════════════════════════════════════════════════════
  // DYNAMIC 3D TARGET SYNCHRONIZATION (Balloons, Meteors, Drones)
  // ══════════════════════════════════════════════════════════════

  // 1. Sync 3D Balloons
  useEffect(() => {
    if (mode !== 'balloon') return;
    const st = stateRef.current;
    const scene = st.scene;
    if (!scene) return;

    const currentIds = new Set((balloonsData || []).map((b) => b.id));

    // Remove deleted balloons
    st.balloonMeshes.forEach((mesh, id) => {
      if (!currentIds.has(id)) {
        scene.remove(mesh);
        st.balloonMeshes.delete(id);
      }
    });

    // Add or update balloons
    (balloonsData || []).forEach((b) => {
      const posX = ((b.x - 50) / 50) * 8.5;
      const posY = 10 - (b.y / 100) * 12;
      const posZ = -1.5;

      if (!st.balloonMeshes.has(b.id)) {
        const bGroup = new THREE.Group();

        // 3D Balloon Body
        const bBodyGeo = new THREE.SphereGeometry(1.2, 16, 16);
        const bBodyMat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(b.color),
          roughness: 0.25,
          metalness: 0.2,
        });
        const bBody = new THREE.Mesh(bBodyGeo, bBodyMat);
        bBody.scale.set(1.0, 1.35, 1.0);
        bGroup.add(bBody);

        // Hanging Wicker Basket
        const basket = new THREE.Mesh(
          new THREE.CylinderGeometry(0.35, 0.28, 0.4, 8),
          new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.85 })
        );
        basket.position.y = -1.5;
        bGroup.add(basket);

        // 4 Connecting ropes
        const ropeMat = new THREE.MeshBasicMaterial({ color: 0x451a03 });
        [-0.25, 0.25].forEach((rx) => {
          [-0.25, 0.25].forEach((rz) => {
            const rope = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.7, 4), ropeMat);
            rope.position.set(rx, -1.15, rz);
            bGroup.add(rope);
          });
        });

        // Crystal-clear Persian Word Sprite directly on the balloon!
        const textSprite = createTextSprite(b.word, false, b.color);
        textSprite.position.set(0, 0.1, 1.3);
        bGroup.add(textSprite);

        bGroup.position.set(posX, posY, posZ);
        scene.add(bGroup);
        st.balloonMeshes.set(b.id, bGroup);
      } else {
        const mesh = st.balloonMeshes.get(b.id)!;
        mesh.position.set(posX, posY, posZ);
      }
    });
  }, [balloonsData, mode]);

  // 2. Sync 3D Meteors
  useEffect(() => {
    if (mode !== 'wordfall') return;
    const st = stateRef.current;
    const scene = st.scene;
    if (!scene) return;

    const currentIds = new Set((meteorsData || []).map((m) => m.id));

    // Remove destroyed meteors
    st.meteorMeshes.forEach((mesh, id) => {
      if (!currentIds.has(id)) {
        scene.remove(mesh);
        st.meteorMeshes.delete(id);
      }
    });

    // Add or update meteors
    (meteorsData || []).forEach((m) => {
      const posX = ((m.x - 50) / 50) * 8.5;
      const posY = 8.5 - (m.y / 100) * 11;
      const posZ = -3.5;

      if (!st.meteorMeshes.has(m.id)) {
        const mGroup = new THREE.Group();

        // 3D Craggy Meteor Rock
        const mGeo = new THREE.DodecahedronGeometry(1.3, 1);
        const mMat = new THREE.MeshStandardMaterial({
          color: 0x3f3f46,
          roughness: 0.85,
          metalness: 0.3,
          emissive: 0xd97706,
          emissiveIntensity: 0.5,
          flatShading: true,
        });
        const mRock = new THREE.Mesh(mGeo, mMat);
        mGroup.add(mRock);

        // Fiery Core Glow
        const glow = new THREE.PointLight(0xf59e0b, 2.5, 6);
        mGroup.add(glow);

        // Text Sprite directly on the Meteor!
        const textSprite = createTextSprite(m.word, true, '#f59e0b');
        textSprite.position.set(0, 0, 1.45);
        mGroup.add(textSprite);

        mGroup.position.set(posX, posY, posZ);
        scene.add(mGroup);
        st.meteorMeshes.set(m.id, mGroup);
      } else {
        const mesh = st.meteorMeshes.get(m.id)!;
        mesh.position.set(posX, posY, posZ);
        mesh.rotation.y += 0.02;
        mesh.rotation.x += 0.01;
      }
    });
  }, [meteorsData, mode]);

  // 3. Sync 3D Air Defense Drones
  useEffect(() => {
    if (mode !== 'defense') return;
    const st = stateRef.current;
    const scene = st.scene;
    if (!scene) return;

    const currentIds = new Set((dronesData || []).map((d) => d.id));

    // Remove destroyed drones
    st.enemyDrones.forEach((mesh, id) => {
      if (!currentIds.has(id)) {
        scene.remove(mesh);
        st.enemyDrones.delete(id);
      }
    });

    // Add or update drones
    (dronesData || []).forEach((d) => {
      const laneX = (d.lane - 1) * 4.6;
      // Bring drones closer to camera (Z: -24 to +2 instead of -42)
      const posZ = -24 + ((100 - d.distance) / 100) * 24;
      const posY = 2.4;

      if (!st.enemyDrones.has(d.id)) {
        const dGroup = new THREE.Group();

        // Sci-Fi Invader Spaceship Fuselage
        const bodyGeo = new THREE.BoxGeometry(1.4, 0.5, 2.6);
        const bodyMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9, roughness: 0.2 });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        dGroup.add(body);

        // Swept Wings
        const wingGeo = new THREE.BoxGeometry(4.0, 0.12, 1.2);
        const wingMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, metalness: 0.7 });
        const wings = new THREE.Mesh(wingGeo, wingMat);
        wings.position.set(0, 0.1, 0.3);
        dGroup.add(wings);

        // Twin Red Plasma Engines
        const thrusterGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.45, 8);
        const thrusterMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
        const t1 = new THREE.Mesh(thrusterGeo, thrusterMat);
        t1.rotation.x = Math.PI / 2;
        t1.position.set(-0.5, 0, 1.4);
        const t2 = new THREE.Mesh(thrusterGeo, thrusterMat);
        t2.rotation.x = Math.PI / 2;
        t2.position.set(0.5, 0, 1.4);
        dGroup.add(t1, t2);

        // Word Sprite directly attached to Drone with high visibility scaling!
        const textSprite = createTextSprite(d.word, false, '#ef4444');
        const scaleFactor = 6.0 + (d.distance / 100) * 4.0;
        textSprite.scale.set(scaleFactor, scaleFactor * 0.28, 1);
        textSprite.position.set(0, 1.6 + (d.distance / 100) * 0.6, 0);
        dGroup.add(textSprite);

        dGroup.position.set(laneX, posY, posZ);
        scene.add(dGroup);
        st.enemyDrones.set(d.id, dGroup);
      } else {
        const mesh = st.enemyDrones.get(d.id)!;
        mesh.position.set(laneX, posY, posZ);
        const spriteChild = mesh.children.find((c) => c instanceof THREE.Sprite) as THREE.Sprite;
        if (spriteChild) {
          const scaleFactor = 6.0 + (d.distance / 100) * 4.0;
          spriteChild.scale.set(scaleFactor, scaleFactor * 0.28, 1);
          spriteChild.position.set(0, 1.6 + (d.distance / 100) * 0.6, 0);
        }
      }
    });

    // Closest drone for turret aim
    if ((dronesData || []).length > 0) {
      const closest = [...dronesData!].sort((a, b) => a.distance - b.distance)[0];
      const targetX = (closest.lane - 1) * 4.6;
      const targetZ = -42 + ((100 - closest.distance) / 100) * 38;
      st.activeDroneTargetPos = new THREE.Vector3(targetX, 2.4, targetZ);
    }
  }, [dronesData, mode]);

  // ══════════════════════════════════════════════════════════════
  // ACTION TRIGGERS (Live physical reactions)
  // ══════════════════════════════════════════════════════════════
  useEffect(() => {
    if (!actionTrigger) return;
    const { type, payload } = actionTrigger;
    const st = stateRef.current;
    if (!st.scene || !st.camera) return;

    // 1. Destroy Target (Defense Drone or Meteor Explosion)
    if (type === 'destroy_target' && payload) {
      st.cameraShake = 0.35;
      if (st.flashLight) {
        st.flashLight.intensity = 5;
        st.flashLight.color.setHex(0x38bdf8);
      }

      let originPos = new THREE.Vector3(0, 2, -10);

      if (st.enemyDrones.has(payload.id)) {
        const drone = st.enemyDrones.get(payload.id);
        if (drone) {
          originPos.copy(drone.position);
          st.scene.remove(drone);
          st.enemyDrones.delete(payload.id);
        }
      }

      if (st.meteorMeshes.has(payload.id)) {
        const meteor = st.meteorMeshes.get(payload.id);
        if (meteor) {
          originPos.copy(meteor.position);
          st.scene.remove(meteor);
          st.meteorMeshes.delete(payload.id);
        }
      }

      // Spawn 3D Fragment Debris
      const fragGeo = new THREE.DodecahedronGeometry(0.35, 0);
      const fragMat = new THREE.MeshStandardMaterial({
        color: mode === 'wordfall' ? 0xf59e0b : mode === 'defense' ? 0xef4444 : 0x06b6d4,
        roughness: 0.3,
        metalness: 0.8,
        emissive: mode === 'wordfall' ? 0xd97706 : 0x991b1b,
      });

      for (let i = 0; i < 22; i++) {
        const frag = new THREE.Mesh(fragGeo, fragMat);
        frag.position.copy(originPos);
        st.scene.add(frag);
        st.debrisList.push({
          mesh: frag,
          velocity: new THREE.Vector3(
            (Math.random() - 0.5) * 12,
            (Math.random() - 0.2) * 10,
            (Math.random() - 0.5) * 12
          ),
          rotSpeed: new THREE.Vector3(Math.random() * 12, Math.random() * 12, Math.random() * 12),
          life: 1.2,
        });
      }
    }

    // 2. Turret Fire (Direct Pinpoint Tracer Laser towards drone!)
    else if (type === 'fire_defense_laser') {
      st.cameraShake = 0.25;
      const targetLane = payload?.lane ?? 1;
      const targetDrone = st.enemyDrones.get(payload?.id);
      const targetPos = targetDrone
        ? targetDrone.position.clone()
        : new THREE.Vector3((targetLane - 1) * 4.6, 2.4, -20);

      // Aim turret directly at drone!
      const turretPos = new THREE.Vector3(0, 1.4, 4);
      const aimDir = targetPos.clone().sub(turretPos).normalize();
      st.turretAimAngle = Math.atan2(aimDir.x, aimDir.z);

      // Fire twin laser tracer bolts directly at the drone's coordinates
      [-0.45, 0.45].forEach((bx) => {
        const boltGeo = new THREE.CylinderGeometry(0.09, 0.09, 2.4, 8);
        const boltMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
        const bolt = new THREE.Mesh(boltGeo, boltMat);
        bolt.position.set(bx, 1.4, 3.5);
        bolt.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), aimDir);
        st.scene?.add(bolt);

        st.lasersList.push({
          mesh: bolt,
          velocity: aimDir.clone().multiplyScalar(75),
          targetPos: targetPos.clone(),
          life: 0.65,
        });
      });
    }

    // 3. Nitro Boost (Chaser Racer)
    else if (type === 'nitro_boost') {
      st.cameraShake = 0.28;
      st.nitroActiveTime = 1.0;
      st.carSteerX = (Math.random() - 0.5) * 3.5;
      if (st.camera) {
        st.camera.fov = 72;
        st.camera.updateProjectionMatrix();
      }
    }

    // 4. Mining Pickaxe Strike
    else if (type === 'strike_rock') {
      st.cameraShake = 0.22;
      st.pickaxeSwingTime = 0.35;

      if (st.miningRock) {
        st.miningRock.scale.set(1.18, 1.18, 1.18);
        setTimeout(() => st.miningRock?.scale.set(1, 1, 1), 90);
      }

      const gemColors = [0x38bdf8, 0xfacc15, 0x10b981, 0xec4899];
      const sparkGeo = new THREE.OctahedronGeometry(0.2, 0);
      const sparkMat = new THREE.MeshStandardMaterial({
        color: gemColors[st.rockOreType % gemColors.length],
        emissive: 0xffffff,
        emissiveIntensity: 0.6,
      });

      for (let i = 0; i < 14; i++) {
        const s = new THREE.Mesh(sparkGeo, sparkMat);
        s.position.set(0, 0.6, 0);
        st.scene.add(s);
        st.debrisList.push({
          mesh: s,
          velocity: new THREE.Vector3(
            (Math.random() - 0.5) * 8,
            Math.random() * 6 + 2,
            (Math.random() - 0.5) * 8
          ),
          rotSpeed: new THREE.Vector3(8, 8, 8),
          life: 0.9,
        });
      }
    }

    // 5. Soccer Penalty Kick
    else if (type === 'kick_penalty') {
      st.cameraShake = 0.3;
      st.strikerKickTime = 0.3;
      st.ballInFlight = true;

      const targetCornerX = (Math.random() > 0.5 ? 1 : -1) * (2.2 + Math.random() * 1.0);
      const targetCornerY = 1.2 + Math.random() * 1.4;

      if (st.soccerBall) {
        st.soccerBall.position.set(0, 0.35, 2.8);
        st.ballVelocity = new THREE.Vector3(targetCornerX * 0.9, targetCornerY * 0.9, -15);
      }

      st.goalkeeperDiveTime = 0.7;
      st.goalkeeperTargetX = targetCornerX * 0.65;
    }

    // 6. Boxing Punch Combo
    else if (type === 'boxing_punch') {
      st.cameraShake = 0.25;
      st.punchAnimTime = 0.3;
      st.opponentHitTime = 0.35;
      st.opponentHealth = Math.max(0, st.opponentHealth - 12);

      const sparkGeo = new THREE.SphereGeometry(0.08, 6, 6);
      const sparkMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
      for (let i = 0; i < 10; i++) {
        const sp = new THREE.Mesh(sparkGeo, sparkMat);
        sp.position.set(0, 1.8, -1.2);
        st.scene.add(sp);
        st.debrisList.push({
          mesh: sp,
          velocity: new THREE.Vector3(
            (Math.random() - 0.5) * 6,
            Math.random() * 4 + 1,
            (Math.random() - 0.5) * 5
          ),
          rotSpeed: new THREE.Vector3(4, 4, 4),
          life: 0.6,
        });
      }
    }

    // 7. Bomb Wire Snip
    else if (type === 'cut_wire') {
      st.cameraShake = 0.15;
      st.pliersCutAnimTime = 0.4;
      if (st.flashLight) {
        st.flashLight.intensity = 4.5;
        st.flashLight.color.setHex(0xfacc15);
      }

      const pGeo = new THREE.DodecahedronGeometry(0.12, 0);
      const pMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
      for (let i = 0; i < 12; i++) {
        const p = new THREE.Mesh(pGeo, pMat);
        p.position.set(0, 0.8, 1.5);
        st.scene.add(p);
        st.debrisList.push({
          mesh: p,
          velocity: new THREE.Vector3(
            (Math.random() - 0.5) * 5,
            Math.random() * 4 + 1,
            (Math.random() - 0.5) * 5
          ),
          rotSpeed: new THREE.Vector3(6, 6, 6),
          life: 0.5,
        });
      }
    }

    // 8. Parkour Leap / Vault
    else if (type === 'parkour_jump') {
      st.cameraShake = 0.18;
      st.runnerJumpTime = 0.6;
    }

    // 9. Pop 3D Balloon
    else if (type === 'pop_balloon') {
      st.cameraShake = 0.22;
      if (st.flashLight) {
        st.flashLight.intensity = 5;
        st.flashLight.color.setHex(0xec4899);
      }

      const shredGeo = new THREE.DodecahedronGeometry(0.18, 0);
      const sColors = [0xec4899, 0x8b5cf6, 0x06b6d4, 0xfacc15, 0x10b981];
      for (let i = 0; i < 22; i++) {
        const mat = new THREE.MeshStandardMaterial({
          color: sColors[i % sColors.length],
          roughness: 0.3,
        });
        const shred = new THREE.Mesh(shredGeo, mat);
        shred.position.set((Math.random() - 0.5) * 4, 3 + (Math.random() - 0.5) * 3, 0);
        st.scene.add(shred);
        st.debrisList.push({
          mesh: shred,
          velocity: new THREE.Vector3(
            (Math.random() - 0.5) * 9,
            Math.random() * 6 + 1,
            (Math.random() - 0.5) * 9
          ),
          rotSpeed: new THREE.Vector3(8, 8, 8),
          life: 0.9,
        });
      }
    }

    // 10. Base Breached / Damage Impact
    else if (type === 'base_breached') {
      st.cameraShake = 0.55;
      if (st.flashLight) {
        st.flashLight.intensity = 6;
        st.flashLight.color.setHex(0xef4444);
      }
    }
  }, [actionTrigger, mode]);

  // ══════════════════════════════════════════════════════════════
  // MAIN THREE.JS 3D SCENE SETUP
  // ══════════════════════════════════════════════════════════════
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 580;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(54, width / height, 0.1, 1000);
    camera.position.set(0, 3, 10);
    camera.lookAt(0, 1, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Dynamic Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.6);
    dirLight.position.set(8, 16, 10);
    scene.add(dirLight);

    const flashLight = new THREE.PointLight(0x38bdf8, 1, 40);
    flashLight.position.set(0, 4, 6);
    scene.add(flashLight);

    const st = stateRef.current;
    st.scene = scene;
    st.camera = camera;
    st.renderer = renderer;
    st.flashLight = flashLight;
    st.ambientLight = ambientLight;
    st.debrisList = [];
    st.lasersList = [];
    st.enemyDrones.clear();
    st.meteorMeshes.clear();
    st.balloonMeshes.clear();

    // Mode-specific scene setups
    if (mode === 'chaser') {
      camera.position.set(0, 2.5, 7.2);
      camera.lookAt(0, 0.9, -22);

      const road = new THREE.Mesh(
        new THREE.PlaneGeometry(18, 120),
        new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.8 })
      );
      road.rotation.x = -Math.PI / 2;
      road.position.z = -50;
      scene.add(road);

      const dashes: THREE.Mesh[] = [];
      const dashGeo = new THREE.PlaneGeometry(0.35, 4.0);
      const dashMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
      for (let i = 0; i < 22; i++) {
        const d1 = new THREE.Mesh(dashGeo, dashMat);
        d1.rotation.x = -Math.PI / 2;
        d1.position.set(-2.8, 0.02, -i * 5.5);
        const d2 = new THREE.Mesh(dashGeo, dashMat);
        d2.rotation.x = -Math.PI / 2;
        d2.position.set(2.8, 0.02, -i * 5.5);
        scene.add(d1, d2);
        dashes.push(d1, d2);
      }
      st.roadDashes = dashes;

      const carGroup = new THREE.Group();
      const body = new THREE.Mesh(
        new THREE.BoxGeometry(2.3, 0.7, 4.3),
        new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.9, roughness: 0.15 })
      );
      body.position.y = 0.55;
      carGroup.add(body);

      const glass = new THREE.Mesh(
        new THREE.BoxGeometry(1.8, 0.65, 2.2),
        new THREE.MeshStandardMaterial({ color: 0x020617, metalness: 0.95, roughness: 0.05 })
      );
      glass.position.set(0, 0.95, -0.3);
      carGroup.add(glass);

      const pGeo = new THREE.BufferGeometry();
      const pCount = 60;
      const positions = new Float32Array(pCount * 3);
      for (let i = 0; i < pCount * 3; i++) positions[i] = (Math.random() - 0.5) * 0.8;
      pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      const flames = new THREE.Points(
        pGeo,
        new THREE.PointsMaterial({ color: 0x06b6d4, size: 0.35, transparent: true, opacity: 0.9 })
      );
      flames.position.set(0, 0.45, 2.2);
      carGroup.add(flames);
      st.nitroFlames = flames;

      carGroup.position.set(0, 0, 2.5);
      scene.add(carGroup);
      st.playerCar = carGroup;

      const rivals: THREE.Group[] = [];
      [-3.2, 3.2].forEach((xPos, idx) => {
        const rc = new THREE.Group();
        const rBody = new THREE.Mesh(
          new THREE.BoxGeometry(2.2, 0.7, 4.0),
          new THREE.MeshStandardMaterial({ color: idx === 0 ? 0xd97706 : 0xdc2626, metalness: 0.8, roughness: 0.2 })
        );
        rBody.position.y = 0.55;
        rc.add(rBody);
        rc.position.set(xPos, 0, -18 - idx * 12);
        scene.add(rc);
        rivals.push(rc);
      });
      st.rivalCars = rivals;
    } else if (mode === 'defense') {
      camera.position.set(0, 2.6, 9.5);
      camera.lookAt(0, 1.4, -25);

      const bunker = new THREE.Group();
      const baseMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(2.2, 3.0, 1.2, 16),
        new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9, roughness: 0.25 })
      );
      baseMesh.position.y = 0.6;
      bunker.add(baseMesh);

      const headGroup = new THREE.Group();
      headGroup.position.y = 1.3;
      const headDome = new THREE.Mesh(
        new THREE.SphereGeometry(1.1, 16, 16),
        new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.9 })
      );
      headDome.position.y = 0.4;
      headGroup.add(headDome);

      const barrelGeo = new THREE.CylinderGeometry(0.12, 0.12, 3.6, 12);
      const barrelMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.95 });
      const b1 = new THREE.Mesh(barrelGeo, barrelMat);
      b1.rotation.x = Math.PI / 2;
      b1.position.set(-0.45, 0.4, 1.8);
      const b2 = new THREE.Mesh(barrelGeo, barrelMat);
      b2.rotation.x = Math.PI / 2;
      b2.position.set(0.45, 0.4, 1.8);
      headGroup.add(b1, b2);
      bunker.add(headGroup);

      bunker.position.set(0, 0, 4);
      scene.add(bunker);
      st.turretBase = bunker;
      st.turretHead = headGroup;
    } else if (mode === 'boxing') {
      camera.position.set(0, 2.0, 4.4);
      camera.lookAt(0, 1.8, -1.5);

      const ring = new THREE.Mesh(
        new THREE.BoxGeometry(10, 0.4, 10),
        new THREE.MeshStandardMaterial({ color: 0x1e1b4b, roughness: 0.7 })
      );
      ring.position.y = 0;
      scene.add(ring);

      const postGeo = new THREE.CylinderGeometry(0.12, 0.12, 3.0, 12);
      const postMat = new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.9 });
      [-4.5, 4.5].forEach((px) => {
        [-4.5, 4.5].forEach((pz) => {
          const post = new THREE.Mesh(postGeo, postMat);
          post.position.set(px, 1.5, pz);
          scene.add(post);
        });
      });

      const opp = new THREE.Group();
      const oppBody = new THREE.Mesh(
        new THREE.BoxGeometry(1.2, 1.4, 0.7),
        new THREE.MeshStandardMaterial({ color: 0x7c2d12, roughness: 0.5 })
      );
      oppBody.position.y = 1.9;
      opp.add(oppBody);

      const oppHead = new THREE.Mesh(
        new THREE.SphereGeometry(0.45, 16, 16),
        new THREE.MeshStandardMaterial({ color: 0x9a3412, roughness: 0.4 })
      );
      oppHead.position.set(0, 2.9, 0);
      opp.add(oppHead);

      const gloveGeo = new THREE.SphereGeometry(0.32, 12, 12);
      const oppGloveMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.3 });
      const gL = new THREE.Mesh(gloveGeo, oppGloveMat);
      gL.position.set(-0.7, 2.2, 0.5);
      const gR = new THREE.Mesh(gloveGeo, oppGloveMat);
      gR.position.set(0.7, 2.2, 0.5);
      opp.add(gL, gR);

      opp.position.set(0, 0, -1.8);
      scene.add(opp);
      st.opponentBoxer = opp;

      const playerGlovesGroup = new THREE.Group();
      const pGloveMat = new THREE.MeshStandardMaterial({ color: 0x2563eb, metalness: 0.7, roughness: 0.25 });
      const pGl = new THREE.Mesh(gloveGeo, pGloveMat);
      pGl.position.set(-0.8, 1.4, 3.0);
      const pGr = new THREE.Mesh(gloveGeo, pGloveMat);
      pGr.position.set(0.8, 1.4, 3.0);
      playerGlovesGroup.add(pGl, pGr);
      scene.add(playerGlovesGroup);
      st.playerGloves = playerGlovesGroup;
      st.gloveLeft = pGl;
      st.gloveRight = pGr;
    } else if (mode === 'penalty') {
      camera.position.set(0, 2.1, 6.2);
      camera.lookAt(0, 1.5, -9);

      const pitch = new THREE.Mesh(
        new THREE.PlaneGeometry(28, 28),
        new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.85 })
      );
      pitch.rotation.x = -Math.PI / 2;
      scene.add(pitch);

      const goalGroup = new THREE.Group();
      const postMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, metalness: 0.8, roughness: 0.2 });
      const p1 = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 3.2, 12), postMat);
      p1.position.set(-3.5, 1.6, -9);
      const p2 = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 3.2, 12), postMat);
      p2.position.set(3.5, 1.6, -9);
      const crossbar = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 7.2, 12), postMat);
      crossbar.rotation.z = Math.PI / 2;
      crossbar.position.set(0, 3.2, -9);
      goalGroup.add(p1, p2, crossbar);

      const net = new THREE.Mesh(
        new THREE.PlaneGeometry(7.0, 3.0),
        new THREE.MeshStandardMaterial({ color: 0xe2e8f0, wireframe: true })
      );
      net.position.set(0, 1.6, -9.6);
      goalGroup.add(net);
      scene.add(goalGroup);
      st.goalNet = goalGroup;

      const gk = new THREE.Group();
      const gkBody = new THREE.Mesh(
        new THREE.BoxGeometry(0.9, 1.4, 0.5),
        new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.5 })
      );
      gkBody.position.y = 1.6;
      const gkHead = new THREE.Mesh(
        new THREE.SphereGeometry(0.35, 12, 12),
        new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.4 })
      );
      gkHead.position.set(0, 2.5, 0);
      gk.add(gkBody, gkHead);
      gk.position.set(0, 0, -8.5);
      scene.add(gk);
      st.goalkeeper = gk;

      const ball = new THREE.Mesh(
        new THREE.SphereGeometry(0.38, 20, 20),
        new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.35 })
      );
      ball.position.set(0, 0.38, 2.8);
      scene.add(ball);
      st.soccerBall = ball;
    } else if (mode === 'bomb') {
      camera.position.set(0, 2.8, 4.6);
      camera.lookAt(0, 0.7, 0);

      const desk = new THREE.Mesh(
        new THREE.BoxGeometry(7, 0.4, 5),
        new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.7 })
      );
      desk.position.y = 0;
      scene.add(desk);

      const bombGroup = new THREE.Group();
      const caseMesh = new THREE.Mesh(
        new THREE.BoxGeometry(4.2, 0.6, 2.8),
        new THREE.MeshStandardMaterial({ color: 0x27272a, metalness: 0.85, roughness: 0.3 })
      );
      caseMesh.position.y = 0.5;
      bombGroup.add(caseMesh);

      for (let i = 0; i < 3; i++) {
        const brick = new THREE.Mesh(
          new THREE.CylinderGeometry(0.35, 0.35, 3.2, 12),
          new THREE.MeshStandardMaterial({ color: 0xa8a29e, roughness: 0.7 })
        );
        brick.rotation.z = Math.PI / 2;
        brick.position.set(0, 0.95, -0.7 + i * 0.7);
        bombGroup.add(brick);
      }

      const wireColorsHex = [0xef4444, 0x06b6d4, 0xf59e0b, 0x10b981, 0xa855f7];
      const wiresList: THREE.Mesh[] = [];
      wireColorsHex.forEach((col, idx) => {
        const curve = new THREE.QuadraticBezierCurve3(
          new THREE.Vector3(-1.6, 1.0, -0.8 + idx * 0.4),
          new THREE.Vector3(0, 1.6 + idx * 0.1, -0.8 + idx * 0.4),
          new THREE.Vector3(1.6, 1.0, -0.8 + idx * 0.4)
        );
        const wMesh = new THREE.Mesh(
          new THREE.TubeGeometry(curve, 16, 0.07, 8, false),
          new THREE.MeshStandardMaterial({ color: col, roughness: 0.4 })
        );
        bombGroup.add(wMesh);
        wiresList.push(wMesh);
      });
      st.bombWires = wiresList;

      scene.add(bombGroup);
      st.bombSuitcase = bombGroup;

      const pliers = new THREE.Group();
      const pHandle1 = new THREE.Mesh(
        new THREE.CylinderGeometry(0.09, 0.09, 1.4, 8),
        new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.4 })
      );
      pHandle1.position.set(-0.3, 0, 0);
      const pHandle2 = new THREE.Mesh(
        new THREE.CylinderGeometry(0.09, 0.09, 1.4, 8),
        new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.4 })
      );
      pHandle2.position.set(0.3, 0, 0);
      const pJaw = new THREE.Mesh(
        new THREE.BoxGeometry(0.6, 0.4, 0.2),
        new THREE.MeshStandardMaterial({ color: 0xd4d4d8, metalness: 0.95 })
      );
      pJaw.position.set(0, 0.7, 0);
      pliers.add(pHandle1, pHandle2, pJaw);
      pliers.position.set(0.6, 1.6, 2.2);
      pliers.rotation.x = -Math.PI / 4;
      scene.add(pliers);
      st.pliersTool = pliers;
    } else if (mode === 'mining') {
      camera.position.set(0, 2.2, 5.2);
      camera.lookAt(0, 0.8, 0);

      const cave = new THREE.Mesh(
        new THREE.CylinderGeometry(8, 8, 12, 16, 1, true),
        new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.95, side: THREE.BackSide })
      );
      cave.rotation.x = Math.PI / 2;
      scene.add(cave);

      const rockGroup = new THREE.Group();
      const rockMesh = new THREE.Mesh(
        new THREE.DodecahedronGeometry(1.6, 1),
        new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.8, flatShading: true })
      );
      rockMesh.position.y = 0.8;
      rockGroup.add(rockMesh);

      const gemGeo = new THREE.OctahedronGeometry(0.35, 0);
      const gemMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, roughness: 0.2 });
      [
        [0.8, 1.4, 0.8],
        [-0.8, 1.2, 0.7],
        [0.2, 1.8, -0.6],
        [-0.4, 0.5, 1.1],
      ].forEach(([gx, gy, gz]) => {
        const gm = new THREE.Mesh(gemGeo, gemMat);
        gm.position.set(gx, gy, gz);
        rockGroup.add(gm);
      });

      scene.add(rockGroup);
      st.miningRock = rockGroup;

      const pickGroup = new THREE.Group();
      const handle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.08, 2.4, 8),
        new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.7 })
      );
      const headCurved = new THREE.Mesh(
        new THREE.TorusGeometry(0.7, 0.12, 8, 16, Math.PI / 1.4),
        new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.95, roughness: 0.2 })
      );
      headCurved.position.set(0, 1.1, 0);
      headCurved.rotation.z = Math.PI / 4;
      pickGroup.add(handle, headCurved);

      pickGroup.position.set(1.4, 1.8, 2.0);
      pickGroup.rotation.z = -Math.PI / 6;
      scene.add(pickGroup);
      st.pickaxe = pickGroup;
    } else if (mode === 'parkour') {
      camera.position.set(0, 2.5, 6.5);
      camera.lookAt(0, 1.2, -12);

      const roof = new THREE.Mesh(
        new THREE.BoxGeometry(14, 0.5, 60),
        new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.85 })
      );
      roof.position.set(0, 0, -25);
      scene.add(roof);

      const runner = new THREE.Group();
      const rTorso = new THREE.Mesh(
        new THREE.BoxGeometry(0.8, 1.2, 0.5),
        new THREE.MeshStandardMaterial({ color: 0xec4899, roughness: 0.4 })
      );
      rTorso.position.y = 1.4;
      const rHead = new THREE.Mesh(
        new THREE.SphereGeometry(0.32, 12, 12),
        new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.3 })
      );
      rHead.position.set(0, 2.2, 0);
      runner.add(rTorso, rHead);
      runner.position.set(0, 0, 1.5);
      scene.add(runner);
      st.parkourRunner = runner;

      const obsList: THREE.Group[] = [];
      [-8, -18, -28].forEach((zPos) => {
        const obs = new THREE.Group();
        const box = new THREE.Mesh(
          new THREE.BoxGeometry(3.5, 1.2, 1.2),
          new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.7 })
        );
        box.position.y = 0.6;
        obs.add(box);
        obs.position.set(0, 0, zPos);
        scene.add(obs);
        obsList.push(obs);
      });
      st.parkourObstacles = obsList;
    } else if (mode === 'hacker') {
      camera.position.set(0, 2.0, 7.5);
      camera.lookAt(0, 1.2, 0);

      const coreGroup = new THREE.Group();
      const innerCore = new THREE.Mesh(
        new THREE.IcosahedronGeometry(1.4, 2),
        new THREE.MeshStandardMaterial({ color: 0x10b981, wireframe: true })
      );
      innerCore.position.y = 1.2;
      coreGroup.add(innerCore);

      const rings: THREE.Mesh[] = [];
      [2.2, 2.9, 3.6].forEach((radius, idx) => {
        const ringMesh = new THREE.Mesh(
          new THREE.TorusGeometry(radius, 0.08, 12, 40),
          new THREE.MeshBasicMaterial({ color: idx === 0 ? 0xef4444 : 0x06b6d4, wireframe: true })
        );
        ringMesh.position.y = 1.2;
        coreGroup.add(ringMesh);
        rings.push(ringMesh);
      });
      st.firewallRings = rings;

      scene.add(coreGroup);
      st.cyberCore = coreGroup;
    } else if (mode === 'balloon') {
      camera.position.set(0, 4.0, 11);
      camera.lookAt(0, 4.5, 0);

      // Fluffy 3D Clouds
      for (let i = 0; i < 7; i++) {
        const cloud = new THREE.Group();
        const cloudMat = new THREE.MeshStandardMaterial({
          color: 0xffffff,
          roughness: 0.9,
          transparent: true,
          opacity: 0.85,
        });
        for (let j = 0; j < 5; j++) {
          const sphere = new THREE.Mesh(
            new THREE.SphereGeometry(1.2 + Math.random() * 0.8, 12, 12),
            cloudMat
          );
          sphere.position.set(
            (j - 2) * 1.1 + (Math.random() - 0.5) * 0.5,
            (Math.random() - 0.5) * 0.6,
            (Math.random() - 0.5) * 0.8
          );
          cloud.add(sphere);
        }
        cloud.position.set(
          (Math.random() - 0.5) * 32,
          2 + Math.random() * 8,
          -10 - Math.random() * 15
        );
        scene.add(cloud);
      }
    } else {
      camera.position.set(0, 3, 11);
      camera.lookAt(0, 1, -15);

      const starGeo = new THREE.BufferGeometry();
      const starCount = 300;
      const starPos = new Float32Array(starCount * 3);
      for (let i = 0; i < starCount * 3; i++) starPos[i] = (Math.random() - 0.5) * 80;
      starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
      scene.add(
        new THREE.Points(
          starGeo,
          new THREE.PointsMaterial({ color: 0xffffff, size: 0.35, transparent: true, opacity: 0.8 })
        )
      );
    }

    // ══════════════════════════════════════════════════════════════
    // 60 FPS MAIN RENDER & ANIMATION LOOP
    // ══════════════════════════════════════════════════════════════
    const clock = new THREE.Clock();

    const renderLoop = () => {
      animFrameIdRef.current = requestAnimationFrame(renderLoop);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();
      const speedMult = difficulty === 'hard' ? 2.0 : difficulty === 'easy' ? 0.6 : 1.0;

      // Camera Shake decay
      if (st.cameraShake > 0) {
        camera.position.x += (Math.random() - 0.5) * st.cameraShake;
        camera.position.y += (Math.random() - 0.5) * st.cameraShake;
        st.cameraShake = Math.max(0, st.cameraShake - delta * 3.0);
      }

      // Light flash decay
      if (st.flashLight && st.flashLight.intensity > 1) {
        st.flashLight.intensity = Math.max(1, st.flashLight.intensity - delta * 9);
      }

      // Camera FOV reset
      if (camera.fov > 54) {
        camera.fov = Math.max(54, camera.fov - delta * 25);
        camera.updateProjectionMatrix();
      }

      // Chaser animations
      if (mode === 'chaser') {
        if (st.roadDashes) {
          st.roadDashes.forEach((dash) => {
            dash.position.z += (0.55 + (st.nitroActiveTime > 0 ? 0.4 : 0)) * speedMult;
            if (dash.position.z > 6) dash.position.z = -110;
          });
        }
        if (st.playerCar) {
          st.playerCar.position.x += (st.carSteerX - st.playerCar.position.x) * 0.12;
          st.playerCar.position.y = 0.05 + Math.sin(elapsed * 25) * 0.02;
          st.playerCar.rotation.z = -st.playerCar.position.x * 0.04;
        }
        if (st.rivalCars) {
          st.rivalCars.forEach((rc, i) => {
            rc.position.z += (0.2 - (st.nitroActiveTime > 0 ? 0.5 : 0)) * speedMult;
            if (rc.position.z > 8) rc.position.z = -40 - i * 15;
          });
        }
        if (st.nitroActiveTime > 0) st.nitroActiveTime -= delta;
      }

      // Air Defense Turret tracking
      if (mode === 'defense') {
        if (st.turretHead) {
          if (st.activeDroneTargetPos) {
            const turretPos = new THREE.Vector3(0, 1.4, 4);
            const aimDir = st.activeDroneTargetPos.clone().sub(turretPos).normalize();
            st.turretAimAngle = Math.atan2(aimDir.x, aimDir.z);
          }
          st.turretHead.rotation.y += (st.turretAimAngle - st.turretHead.rotation.y) * 0.2;
        }
      }

      // Boxing animations
      if (mode === 'boxing') {
        if (st.opponentBoxer) {
          if (st.opponentHitTime > 0) {
            st.opponentHitTime -= delta;
            st.opponentBoxer.position.z = -2.2;
            st.opponentBoxer.rotation.x = -0.15;
          } else {
            st.opponentBoxer.position.z = -1.8;
            st.opponentBoxer.position.x = Math.sin(elapsed * 3) * 0.3;
            st.opponentBoxer.position.y = Math.abs(Math.sin(elapsed * 6)) * 0.1;
            st.opponentBoxer.rotation.x = 0;
          }
        }
        if (st.punchAnimTime > 0) {
          st.punchAnimTime -= delta;
          if (st.gloveRight) st.gloveRight.position.z = 1.8;
        } else {
          if (st.gloveRight) st.gloveRight.position.z = 3.0;
        }
      }

      // Penalty animations
      if (mode === 'penalty') {
        if (st.ballInFlight && st.soccerBall && st.ballVelocity) {
          st.soccerBall.position.addScaledVector(st.ballVelocity, delta);
          st.soccerBall.rotation.x += delta * 20;
          st.soccerBall.rotation.y += delta * 20;
          if (st.soccerBall.position.z < -9.2) {
            st.ballInFlight = false;
            st.ballVelocity = undefined;
          }
        }
        if (st.goalkeeper && st.goalkeeperDiveTime > 0) {
          st.goalkeeperDiveTime -= delta;
          st.goalkeeper.position.x += (st.goalkeeperTargetX - st.goalkeeper.position.x) * 0.15;
          st.goalkeeper.rotation.z = -st.goalkeeperTargetX * 0.2;
        }
      }

      // Mining animations
      if (mode === 'mining') {
        if (st.miningRock) st.miningRock.rotation.y += 0.008 * speedMult;
        if (st.pickaxe) {
          if (st.pickaxeSwingTime > 0) {
            st.pickaxeSwingTime -= delta;
            st.pickaxe.rotation.z = -Math.PI / 2.2;
            st.pickaxe.position.set(0.6, 1.2, 1.2);
          } else {
            st.pickaxe.rotation.z = -Math.PI / 6;
            st.pickaxe.position.set(1.4, 1.8, 2.0);
          }
        }
      }

      // Parkour animations
      if (mode === 'parkour') {
        if (st.parkourRunner) {
          if (st.runnerJumpTime > 0) {
            st.runnerJumpTime -= delta;
            st.parkourRunner.position.y = 1.2 + Math.sin(st.runnerJumpTime * Math.PI) * 1.4;
            st.parkourRunner.rotation.x = Math.sin(st.runnerJumpTime * Math.PI) * 0.5;
          } else {
            st.parkourRunner.position.y = Math.abs(Math.sin(elapsed * 12)) * 0.15;
            st.parkourRunner.rotation.x = 0;
          }
        }
        if (st.parkourObstacles) {
          st.parkourObstacles.forEach((obs) => {
            obs.position.z += 0.45 * speedMult;
            if (obs.position.z > 6) obs.position.z = -35;
          });
        }
      }

      // Cyber Hacker animations
      if (mode === 'hacker') {
        if (st.cyberCore) {
          st.cyberCore.rotation.y += 0.015 * speedMult;
          st.cyberCore.rotation.x = Math.sin(elapsed * 1.5) * 0.1;
        }
        if (st.firewallRings) {
          st.firewallRings.forEach((r, idx) => {
            r.rotation.z += (idx % 2 === 0 ? 0.02 : -0.02) * speedMult;
          });
        }
      }

      // Balloon bobbing
      if (mode === 'balloon') {
        st.balloonMeshes.forEach((mesh) => {
          mesh.rotation.z = Math.sin(elapsed * 2 + mesh.id) * 0.08;
        });
      }

      // Bomb tool animation
      if (mode === 'bomb') {
        if (st.pliersTool) {
          if (st.pliersCutAnimTime > 0) {
            st.pliersCutAnimTime -= delta;
            st.pliersTool.position.set(0.2, 1.3, 1.6);
          } else {
            st.pliersTool.position.set(0.6, 1.6, 2.2);
          }
        }
      }

      // Update active laser bolts
      for (let i = st.lasersList.length - 1; i >= 0; i--) {
        const l = st.lasersList[i];
        l.mesh.position.addScaledVector(l.velocity, delta);
        l.life -= delta;
        if (l.life <= 0) {
          scene.remove(l.mesh);
          st.lasersList.splice(i, 1);
        }
      }

      // Update debris particles
      for (let i = st.debrisList.length - 1; i >= 0; i--) {
        const d = st.debrisList[i];
        d.mesh.position.addScaledVector(d.velocity, delta);
        d.mesh.rotation.x += d.rotSpeed.x * delta;
        d.mesh.rotation.y += d.rotSpeed.y * delta;
        d.velocity.y -= 9.8 * delta;
        d.life -= delta * 1.1;
        if (d.life <= 0) {
          scene.remove(d.mesh);
          st.debrisList.splice(i, 1);
        }
      }

      renderer.render(scene, camera);
    };

    renderLoop();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 800;
      const h = container.clientHeight || 580;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animFrameIdRef.current);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [mode, difficulty]);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden select-none"
      style={{ zIndex: 0 }}
    />
  );
}
