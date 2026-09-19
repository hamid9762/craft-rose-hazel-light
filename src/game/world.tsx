import { Sky, useTexture } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { Ent, RunnerSim } from "./sim";
import { landmarkAt, villageAt } from "./villages";

const dummy = new THREE.Object3D();
const signCache = new Map<string, THREE.CanvasTexture>();

function parkInstances(mesh: THREE.InstancedMesh, max: number) {
  dummy.position.set(0, -400, 0);
  dummy.scale.set(0, 0, 0);
  dummy.rotation.set(0, 0, 0);
  dummy.updateMatrix();
  for (let i = 0; i < max; i++) mesh.setMatrixAt(i, dummy.matrix);
}

function makeSign(name: string, urdu: string, major: boolean) {
  const key = `${name}|${urdu}|${major ? 1 : 0}`;
  const hit = signCache.get(key);
  if (hit) return hit;
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 256;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = major ? "#5c2414" : "#1f3d28";
  ctx.fillRect(0, 0, 1024, 256);
  ctx.strokeStyle = "#e8d5a8";
  ctx.lineWidth = 14;
  ctx.strokeRect(18, 18, 988, 220);
  ctx.fillStyle = "#f4ead4";
  ctx.textAlign = "center";
  ctx.font = "700 88px Oswald, sans-serif";
  ctx.fillText(name.toUpperCase(), 512, 128);
  ctx.font = "600 42px 'Noto Nastaliq Urdu', serif";
  ctx.fillText(urdu, 512, 200);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  signCache.set(key, tex);
  return tex;
}

function makeStone(name: string) {
  const key = `stone:${name}`;
  const hit = signCache.get(key);
  if (hit) return hit;
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 384;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#f2efe6";
  ctx.fillRect(0, 0, 256, 384);
  ctx.fillStyle = "#1f6b3a";
  ctx.fillRect(0, 0, 256, 72);
  ctx.fillStyle = "#f2efe6";
  ctx.font = "700 28px Oswald, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("HAZRO", 128, 48);
  ctx.fillStyle = "#1a1712";
  ctx.font = "700 36px Oswald, sans-serif";
  const words = name.toUpperCase().split(" ");
  words.forEach((w, i) => ctx.fillText(w, 128, 160 + i * 44));
  ctx.font = "600 16px Figtree, sans-serif";
  ctx.fillStyle = "#5c5346";
  ctx.fillText("TEHSIL", 128, 340);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  signCache.set(key, tex);
  return tex;
}

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxW: number) {
  const words = text.split(" ");
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const test = cur ? `${cur} ${w}` : w;
    if (cur && ctx.measureText(test).width > maxW) {
      lines.push(cur);
      cur = w;
    } else {
      cur = test;
    }
  }
  if (cur) lines.push(cur);
  return lines.slice(0, 3);
}

function makeBoard(village: string, spot: string, urdu: string) {
  const key = `board3:${village}|${spot}|${urdu}`;
  const hit = signCache.get(key);
  if (hit) return hit;
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 512;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#146c38";
  ctx.fillRect(0, 0, 1024, 512);
  ctx.fillStyle = "#efc453";
  ctx.fillRect(0, 0, 1024, 92);
  ctx.strokeStyle = "#f8f1e6";
  ctx.lineWidth = 18;
  ctx.strokeRect(16, 16, 992, 480);
  ctx.fillStyle = "#1a1712";
  ctx.textAlign = "center";
  ctx.font = "700 40px Oswald, sans-serif";
  ctx.fillText(village.toUpperCase(), 512, 64);
  ctx.fillStyle = "#ffffff";
  ctx.font = "700 76px Oswald, sans-serif";
  const lines = wrapLines(ctx, spot.toUpperCase(), 920);
  const startY = lines.length === 1 ? 255 : 215;
  lines.forEach((line, i) => ctx.fillText(line, 512, startY + i * 82));
  ctx.font = "600 50px 'Noto Nastaliq Urdu', serif";
  ctx.fillText(urdu, 512, 418);
  ctx.fillStyle = "#efe4d2";
  ctx.font = "700 22px Figtree, sans-serif";
  ctx.fillText("POPULAR PLACE", 512, 470);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  signCache.set(key, tex);
  return tex;
}

function wrapMap(tex: THREE.Texture, rx: number, ry: number) {
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(rx, ry);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  tex.needsUpdate = true;
}

function Ground({ sim }: { sim: RunnerSim }) {
  const road = useTexture("/textures/road.jpg");
  const field = useTexture("/textures/field.jpg");
  const roadRef = useRef<THREE.MeshStandardMaterial>(null);
  const fieldL = useRef<THREE.MeshStandardMaterial>(null);
  const fieldR = useRef<THREE.MeshStandardMaterial>(null);

  useLayoutEffect(() => {
    wrapMap(road, 1.15, 18);
    wrapMap(field, 4, 14);
  }, [road, field]);

  useFrame(() => {
    const v = sim.distance * 0.042;
    if (roadRef.current?.map) roadRef.current.map.offset.y = -v;
    if (fieldL.current?.map) fieldL.current.map.offset.y = -v * 0.92;
    if (fieldR.current?.map) fieldR.current.map.offset.y = -v * 0.92;
  });

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -50]} receiveShadow>
        <planeGeometry args={[9.2, 180]} />
        <meshStandardMaterial ref={roadRef} map={road} roughness={0.92} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-16.5, -0.04, -50]} receiveShadow>
        <planeGeometry args={[24, 180]} />
        <meshStandardMaterial ref={fieldL} map={field} color="#c9c46a" roughness={0.88} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[16.5, -0.04, -50]} receiveShadow>
        <planeGeometry args={[24, 180]} />
        <meshStandardMaterial ref={fieldR} map={field} color="#c9c46a" roughness={0.88} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-11.8, 0.02, -50]}>
        <planeGeometry args={[2.4, 180]} />
        <meshStandardMaterial color="#3d6d7a" roughness={0.18} metalness={0.2} transparent opacity={0.85} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[6.5, 0.03, -50]} receiveShadow>
        <planeGeometry args={[2.3, 180]} />
        <meshStandardMaterial color="#c4a06a" roughness={0.95} />
      </mesh>
    </group>
  );
}

function LaneMarks({ sim }: { sim: RunnerSim }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  useFrame(() => {
    const mesh = ref.current;
    if (!mesh) return;
    parkInstances(mesh, 56);
    let i = 0;
    for (let n = 0; n < 28; n++) {
      const z = -n * 6.5 + ((sim.distance * 1) % 6.5);
      for (const x of [-1.22, 1.22]) {
        dummy.position.set(x, 0.03, z);
        dummy.scale.set(0.08, 1, 1.6);
        dummy.rotation.set(0, 0, 0);
        dummy.updateMatrix();
        mesh.setMatrixAt(i++, dummy.matrix);
      }
    }
    mesh.count = i;
    mesh.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, 56]} frustumCulled={false} count={0}>
      <boxGeometry args={[1, 0.02, 1]} />
      <meshStandardMaterial color="#e8dcc0" roughness={0.8} />
    </instancedMesh>
  );
}

function Player({ sim }: { sim: RunnerSim }) {
  const group = useRef<THREE.Group>(null);
  const lLeg = useRef<THREE.Group>(null);
  const rLeg = useRef<THREE.Group>(null);
  const lArm = useRef<THREE.Group>(null);
  const rArm = useRef<THREE.Group>(null);
  const torso = useRef<THREE.Group>(null);

  useFrame((_, dt) => {
    const g = group.current;
    if (!g) return;
    g.position.set(sim.x, sim.y, 0);
    const crouch = sim.sliding > 0 ? 0.58 : 1;
    const k = 1 - Math.exp(-18 * dt);
    g.scale.y += (crouch - g.scale.y) * k;
    g.scale.x += (1 / Math.sqrt(crouch) - g.scale.x) * k;
    g.scale.z += (1 / Math.sqrt(crouch) - g.scale.z) * k;
    const run = sim.running && !sim.dead && sim.grounded && sim.sliding <= 0 ? 1 : 0;
    const swing = Math.sin(sim.distance * 2.05) * 1.05 * run;
    if (lLeg.current) lLeg.current.rotation.x = swing;
    if (rLeg.current) rLeg.current.rotation.x = -swing;
    if (lArm.current) lArm.current.rotation.x = -swing * 0.75;
    if (rArm.current) rArm.current.rotation.x = swing * 0.75;
    if (torso.current) torso.current.rotation.z = -sim.x * 0.04;
    if (!sim.grounded) {
      if (lLeg.current) lLeg.current.rotation.x = 0.55;
      if (rLeg.current) rLeg.current.rotation.x = -0.35;
      if (lArm.current) lArm.current.rotation.x = -0.8;
      if (rArm.current) rArm.current.rotation.x = 0.5;
    }
  });

  const skin = "#c9956c";
  const kameez = "#efe4d2";
  const sadri = "#8b3d24";
  const shalwar = "#e8dcc6";
  const kufi = "#f8f1e6";
  const hair = "#1a1410";
  const chappal = "#3a2c22";

  return (
    <group ref={group} rotation={[0, Math.PI, 0]} castShadow>
      <group ref={torso} position={[0, 1.02, 0]}>
        {/* long kameez */}
        <mesh position={[0, 0.02, 0]} castShadow>
          <capsuleGeometry args={[0.3, 0.78, 6, 12]} />
          <meshStandardMaterial color={kameez} roughness={0.78} />
        </mesh>
        {/* kameez skirt flare */}
        <mesh position={[0, -0.38, 0]} castShadow>
          <cylinderGeometry args={[0.36, 0.3, 0.38, 10]} />
          <meshStandardMaterial color={kameez} roughness={0.8} />
        </mesh>
        {/* sadri / waistcoat */}
        <mesh position={[0, 0.18, 0.05]} castShadow>
          <boxGeometry args={[0.48, 0.58, 0.16]} />
          <meshStandardMaterial color={sadri} roughness={0.68} />
        </mesh>
        <mesh position={[0, 0.18, 0.13]}>
          <boxGeometry args={[0.06, 0.5, 0.02]} />
          <meshStandardMaterial color="#d8c4a0" />
        </mesh>
        {/* neck */}
        <mesh position={[0, 0.52, 0]} castShadow>
          <cylinderGeometry args={[0.09, 0.11, 0.16, 8]} />
          <meshStandardMaterial color={skin} roughness={0.55} />
        </mesh>
        {/* head */}
        <mesh position={[0, 0.78, 0]} castShadow>
          <sphereGeometry args={[0.22, 14, 12]} />
          <meshStandardMaterial color={skin} roughness={0.55} />
        </mesh>
        <mesh position={[0, 0.9, 0]} castShadow>
          <sphereGeometry args={[0.23, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.45]} />
          <meshStandardMaterial color={hair} roughness={0.9} />
        </mesh>
        {/* kufi */}
        <mesh position={[0, 1.0, 0]} castShadow>
          <cylinderGeometry args={[0.2, 0.21, 0.12, 12]} />
          <meshStandardMaterial color={kufi} roughness={0.7} />
        </mesh>
        <mesh position={[0, 1.07, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 0.04, 12]} />
          <meshStandardMaterial color={kufi} roughness={0.65} />
        </mesh>
      </group>
      <group ref={lArm} position={[-0.4, 1.32, 0]}>
        <mesh position={[0, -0.3, 0]} rotation={[0, 0, 0.2]} castShadow>
          <capsuleGeometry args={[0.075, 0.52, 4, 8]} />
          <meshStandardMaterial color={kameez} />
        </mesh>
        <mesh position={[-0.04, -0.58, 0]} castShadow>
          <sphereGeometry args={[0.055, 8, 8]} />
          <meshStandardMaterial color={skin} />
        </mesh>
      </group>
      <group ref={rArm} position={[0.4, 1.32, 0]}>
        <mesh position={[0, -0.3, 0]} rotation={[0, 0, -0.2]} castShadow>
          <capsuleGeometry args={[0.075, 0.52, 4, 8]} />
          <meshStandardMaterial color={kameez} />
        </mesh>
        <mesh position={[0.04, -0.58, 0]} castShadow>
          <sphereGeometry args={[0.055, 8, 8]} />
          <meshStandardMaterial color={skin} />
        </mesh>
      </group>
      {/* baggy shalwar */}
      <group ref={lLeg} position={[-0.16, 0.62, 0]}>
        <mesh position={[0, -0.28, 0]} castShadow>
          <capsuleGeometry args={[0.14, 0.42, 4, 8]} />
          <meshStandardMaterial color={shalwar} roughness={0.82} />
        </mesh>
        <mesh position={[0, -0.62, 0.07]} castShadow>
          <boxGeometry args={[0.18, 0.07, 0.32]} />
          <meshStandardMaterial color={chappal} />
        </mesh>
      </group>
      <group ref={rLeg} position={[0.16, 0.62, 0]}>
        <mesh position={[0, -0.28, 0]} castShadow>
          <capsuleGeometry args={[0.14, 0.42, 4, 8]} />
          <meshStandardMaterial color={shalwar} roughness={0.82} />
        </mesh>
        <mesh position={[0, -0.62, 0.07]} castShadow>
          <boxGeometry args={[0.18, 0.07, 0.32]} />
          <meshStandardMaterial color={chappal} />
        </mesh>
      </group>
    </group>
  );
}

function Hay() {
  return (
    <group>
      <mesh position={[0, 0.55, 0]} castShadow>
        <cylinderGeometry args={[0.7, 0.78, 1.1, 10]} />
        <meshStandardMaterial color="#c9a44a" roughness={0.95} />
      </mesh>
      <mesh position={[0, 1.12, 0]} rotation={[0, 0.4, 0]} castShadow>
        <torusGeometry args={[0.52, 0.05, 6, 10]} />
        <meshStandardMaterial color="#8a6230" />
      </mesh>
    </group>
  );
}

function Cart() {
  return (
    <group>
      <mesh position={[0, 0.72, 0]} castShadow>
        <boxGeometry args={[1.15, 0.55, 1.55]} />
        <meshStandardMaterial color="#6b3e22" roughness={0.8} />
      </mesh>
      <mesh position={[-0.55, 0.32, 0.45]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.28, 0.28, 0.12, 10]} />
        <meshStandardMaterial color="#2c241c" />
      </mesh>
      <mesh position={[0.55, 0.32, 0.45]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.28, 0.28, 0.12, 10]} />
        <meshStandardMaterial color="#2c241c" />
      </mesh>
      <mesh position={[-0.55, 0.32, -0.45]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.28, 0.28, 0.12, 10]} />
        <meshStandardMaterial color="#2c241c" />
      </mesh>
      <mesh position={[0.55, 0.32, -0.45]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.28, 0.28, 0.12, 10]} />
        <meshStandardMaterial color="#2c241c" />
      </mesh>
    </group>
  );
}

function Rock() {
  return (
    <mesh position={[0, 0.42, 0]} rotation={[0.3, 0.5, 0.1]} castShadow>
      <icosahedronGeometry args={[0.62, 0]} />
      <meshStandardMaterial color="#7a6a58" roughness={0.95} />
    </mesh>
  );
}

function Bar() {
  return (
    <group>
      <mesh position={[-4.2, 0.7, 0]} castShadow>
        <boxGeometry args={[0.18, 1.4, 0.18]} />
        <meshStandardMaterial color="#5c4030" />
      </mesh>
      <mesh position={[4.2, 0.7, 0]} castShadow>
        <boxGeometry args={[0.18, 1.4, 0.18]} />
        <meshStandardMaterial color="#5c4030" />
      </mesh>
      <mesh position={[0, 1.28, 0]} castShadow>
        <boxGeometry args={[8.5, 0.16, 0.16]} />
        <meshStandardMaterial color="#c45c32" />
      </mesh>
      <mesh position={[0, 1.42, 0]}>
        <boxGeometry args={[8.5, 0.55, 0.04]} />
        <meshStandardMaterial color="#d8c49a" transparent opacity={0.7} />
      </mesh>
    </group>
  );
}

function Log() {
  return (
    <mesh position={[0, 0.38, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
      <cylinderGeometry args={[0.38, 0.4, 8.6, 8]} />
      <meshStandardMaterial color="#5a3a22" roughness={0.9} />
    </mesh>
  );
}

function ObstacleSlot({ ent }: { ent: Ent }) {
  const g = useRef<THREE.Group>(null);
  const hay = useRef<THREE.Group>(null);
  const cart = useRef<THREE.Group>(null);
  const rock = useRef<THREE.Group>(null);
  const bar = useRef<THREE.Group>(null);
  const log = useRef<THREE.Group>(null);
  useFrame(() => {
    const n = g.current;
    if (!n) return;
    n.visible = ent.active;
    if (!ent.active) return;
    n.position.set(ent.kind === "bar" || ent.kind === "log" ? 0 : ent.x, 0, ent.z);
    if (hay.current) hay.current.visible = ent.kind === "hay";
    if (cart.current) cart.current.visible = ent.kind === "cart";
    if (rock.current) rock.current.visible = ent.kind === "rock";
    if (bar.current) bar.current.visible = ent.kind === "bar";
    if (log.current) log.current.visible = ent.kind === "log";
  });
  return (
    <group ref={g} visible={false}>
      <group ref={hay} visible={false}><Hay /></group>
      <group ref={cart} visible={false}><Cart /></group>
      <group ref={rock} visible={false}><Rock /></group>
      <group ref={bar} visible={false}><Bar /></group>
      <group ref={log} visible={false}><Log /></group>
    </group>
  );
}

function Coins({ sim }: { sim: RunnerSim }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  useFrame(({ clock }) => {
    const mesh = ref.current;
    if (!mesh) return;
    parkInstances(mesh, 28);
    let i = 0;
    const t = clock.elapsedTime;
    for (const e of sim.coinsP) {
      if (!e.active) continue;
      dummy.position.set(e.x, e.y, e.z);
      dummy.rotation.set(0, t * 3 + i, 0.4);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      mesh.setMatrixAt(i++, dummy.matrix);
    }
    mesh.count = i;
    mesh.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, 28]} frustumCulled={false} count={0}>
      <cylinderGeometry args={[0.28, 0.28, 0.06, 12]} />
      <meshStandardMaterial color="#c9a15b" metalness={0.7} roughness={0.28} />
    </instancedMesh>
  );
}

function Trees({ sim }: { sim: RunnerSim }) {
  const trunk = useRef<THREE.InstancedMesh>(null);
  const leaf = useRef<THREE.InstancedMesh>(null);
  useFrame(({ clock }) => {
    const sway = Math.sin(clock.elapsedTime * 0.7) * 0.04;
    if (trunk.current) parkInstances(trunk.current, 56);
    if (leaf.current) parkInstances(leaf.current, 56);
    let i = 0;
    for (const e of sim.trees) {
      if (!e.active) continue;
      dummy.position.set(e.x, 1.55 * e.scale, e.z);
      dummy.scale.set(0.12 * e.scale, 3.1 * e.scale, 0.12 * e.scale);
      dummy.rotation.set(0, e.rot, sway);
      dummy.updateMatrix();
      trunk.current?.setMatrixAt(i, dummy.matrix);
      dummy.position.set(e.x, 3.85 * e.scale, e.z);
      dummy.scale.set(0.72 * e.scale, 2.15 * e.scale, 0.72 * e.scale);
      dummy.rotation.set(0, e.rot + 0.4, sway);
      dummy.updateMatrix();
      leaf.current?.setMatrixAt(i, dummy.matrix);
      i++;
    }
    if (trunk.current) {
      trunk.current.count = i;
      trunk.current.instanceMatrix.needsUpdate = true;
    }
    if (leaf.current) {
      leaf.current.count = i;
      leaf.current.instanceMatrix.needsUpdate = true;
    }
  });
  return (
    <>
      <instancedMesh ref={trunk} args={[undefined, undefined, 56]} castShadow frustumCulled={false} count={0}>
        <cylinderGeometry args={[1, 1.15, 1, 5]} />
        <meshStandardMaterial color="#4a3424" />
      </instancedMesh>
      <instancedMesh ref={leaf} args={[undefined, undefined, 56]} castShadow frustumCulled={false} count={0}>
        <sphereGeometry args={[1, 8, 6]} />
        <meshStandardMaterial color="#4a6b38" />
      </instancedMesh>
    </>
  );
}

function Houses({ sim }: { sim: RunnerSim }) {
  const brick = useTexture("/textures/brick.jpg");
  const body = useRef<THREE.InstancedMesh>(null);
  const roof = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    brick.colorSpace = THREE.SRGBColorSpace;
    brick.wrapS = brick.wrapT = THREE.RepeatWrapping;
    brick.repeat.set(1.4, 1.1);
  }, [brick]);
  useFrame(() => {
    if (body.current) parkInstances(body.current, 36);
    if (roof.current) parkInstances(roof.current, 36);
    let i = 0;
    for (const e of sim.houses) {
      if (!e.active) continue;
      dummy.position.set(e.x, 1.05 * e.scale, e.z);
      dummy.scale.set(2.35 * e.scale, 2.1 * e.scale, 2.5 * e.scale);
      dummy.rotation.set(0, e.rot, 0);
      dummy.updateMatrix();
      body.current?.setMatrixAt(i, dummy.matrix);
      dummy.position.set(e.x, 2.18 * e.scale, e.z);
      dummy.scale.set(2.55 * e.scale, 0.18 * e.scale, 2.7 * e.scale);
      dummy.rotation.set(0, e.rot, 0);
      dummy.updateMatrix();
      roof.current?.setMatrixAt(i, dummy.matrix);
      i++;
    }
    if (body.current) {
      body.current.count = i;
      body.current.instanceMatrix.needsUpdate = true;
    }
    if (roof.current) {
      roof.current.count = i;
      roof.current.instanceMatrix.needsUpdate = true;
    }
  });
  return (
    <>
      <instancedMesh ref={body} args={[undefined, undefined, 36]} castShadow frustumCulled={false} count={0}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial map={brick} roughness={0.9} />
      </instancedMesh>
      <instancedMesh ref={roof} args={[undefined, undefined, 36]} castShadow frustumCulled={false} count={0}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#b88968" roughness={0.92} />
      </instancedMesh>
    </>
  );
}

function Fences({ sim }: { sim: RunnerSim }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  useFrame(() => {
    const mesh = ref.current;
    if (!mesh) return;
    parkInstances(mesh, 48);
    let i = 0;
    for (const e of sim.fences) {
      if (!e.active) continue;
      dummy.position.set(e.x, 0.55, e.z);
      dummy.scale.set(1, 1, 1);
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();
      mesh.setMatrixAt(i++, dummy.matrix);
    }
    mesh.count = i;
    mesh.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, 48]} frustumCulled={false} count={0}>
      <boxGeometry args={[0.1, 1.1, 0.1]} />
      <meshStandardMaterial color="#8a6a44" />
    </instancedMesh>
  );
}

function Hills({ sim }: { sim: RunnerSim }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  useFrame(() => {
    const mesh = ref.current;
    if (!mesh) return;
    parkInstances(mesh, 10);
    let i = 0;
    for (const e of sim.hills) {
      if (!e.active) continue;
      dummy.position.set(e.x, e.scale * 0.35, e.z);
      dummy.scale.set(e.scale * 1.6, e.scale * 0.7, e.scale * 1.1);
      dummy.rotation.set(0, e.rot, 0);
      dummy.updateMatrix();
      mesh.setMatrixAt(i++, dummy.matrix);
    }
    mesh.count = i;
    mesh.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, 10]} frustumCulled={false} count={0}>
      <sphereGeometry args={[1, 8, 6]} />
      <meshStandardMaterial color="#7a8a6a" roughness={1} />
    </instancedMesh>
  );
}

function Mosques({ sim }: { sim: RunnerSim }) {
  const refs = useRef<(THREE.Group | null)[]>([]);
  useFrame(() => {
    sim.mosques.forEach((e, i) => {
      const g = refs.current[i];
      if (!g) return;
      g.visible = e.active;
      if (!e.active) return;
      g.position.set(e.x, 0, e.z);
      g.scale.setScalar(e.scale);
      g.rotation.y = e.rot;
    });
  });
  return (
    <>
      {sim.mosques.map((_, i) => (
        <group key={i} ref={(el) => { refs.current[i] = el; }} visible={false}>
          <mesh position={[0, 1.4, 0]} castShadow>
            <boxGeometry args={[2.4, 2.8, 2.4]} />
            <meshStandardMaterial color="#d8c4a0" />
          </mesh>
          <mesh position={[0, 3.15, 0]}>
            <sphereGeometry args={[1.05, 12, 10]} />
            <meshStandardMaterial color="#c45c32" roughness={0.45} />
          </mesh>
          <mesh position={[1.35, 2.6, 1.35]} castShadow>
            <cylinderGeometry args={[0.16, 0.2, 3.4, 8]} />
            <meshStandardMaterial color="#d8c4a0" />
          </mesh>
          <mesh position={[1.35, 4.4, 1.35]}>
            <coneGeometry args={[0.22, 0.5, 8]} />
            <meshStandardMaterial color="#c45c32" />
          </mesh>
        </group>
      ))}
    </>
  );
}

function GateVisual({ ent }: { ent: Ent }) {
  const g = useRef<THREE.Group>(null);
  const mat = useRef<THREE.MeshStandardMaterial>(null);
  const last = useRef(-1);
  useFrame(() => {
    const n = g.current;
    if (!n) return;
    n.visible = ent.active;
    if (!ent.active) return;
    n.position.set(0, 0, ent.z);
    if (last.current !== ent.village) {
      last.current = ent.village;
      const v = villageAt(ent.village);
      const tex = makeSign(v.name, v.urdu, true);
      if (mat.current) {
        mat.current.map = tex;
        mat.current.needsUpdate = true;
      }
    }
  });
  return (
    <group ref={g} visible={false}>
      <mesh position={[-4.4, 1.7, 0]} castShadow>
        <boxGeometry args={[0.45, 3.4, 0.45]} />
        <meshStandardMaterial color="#5c2414" />
      </mesh>
      <mesh position={[4.4, 1.7, 0]} castShadow>
        <boxGeometry args={[0.45, 3.4, 0.45]} />
        <meshStandardMaterial color="#5c2414" />
      </mesh>
      <mesh position={[0, 3.35, 0]} castShadow>
        <boxGeometry args={[9.2, 0.35, 0.45]} />
        <meshStandardMaterial color="#5c2414" />
      </mesh>
      <mesh position={[0, 2.72, 0.12]}>
        <planeGeometry args={[7.2, 1.55]} />
        <meshStandardMaterial ref={mat} color="#ffffff" roughness={0.6} />
      </mesh>
    </group>
  );
}

function StoneVisual({ ent }: { ent: Ent }) {
  const g = useRef<THREE.Group>(null);
  const mat = useRef<THREE.MeshStandardMaterial>(null);
  const last = useRef(-1);
  useFrame(() => {
    const n = g.current;
    if (!n) return;
    n.visible = ent.active;
    if (!ent.active) return;
    n.position.set(ent.x, 0, ent.z);
    if (last.current !== ent.village) {
      last.current = ent.village;
      const v = villageAt(ent.village);
      const tex = makeStone(v.name);
      if (mat.current) {
        mat.current.map = tex;
        mat.current.needsUpdate = true;
      }
    }
  });
  return (
    <group ref={g} visible={false}>
      <mesh position={[0, 0.85, 0]} castShadow>
        <boxGeometry args={[0.7, 1.7, 0.18]} />
        <meshStandardMaterial ref={mat} color="#f2efe6" roughness={0.7} />
      </mesh>
    </group>
  );
}

function BoardVisual({ ent }: { ent: Ent }) {
  const g = useRef<THREE.Group>(null);
  const mat = useRef<THREE.MeshStandardMaterial>(null);
  const last = useRef(-1);
  useFrame(() => {
    const n = g.current;
    if (!n) return;
    n.visible = ent.active;
    if (!ent.active) return;
    n.position.set(ent.x, 0, ent.z);
    const s = ent.scale || 1;
    n.scale.setScalar(s);
    n.rotation.y = ent.x > 0 ? -0.12 : 0.12;
    const id = ent.village * 10 + ent.variant;
    if (last.current !== id) {
      last.current = id;
      const v = villageAt(ent.village);
      const spot = landmarkAt(ent.village, ent.variant);
      const tex = makeBoard(v.name, spot.name, spot.urdu);
      if (mat.current) {
        mat.current.map = tex;
        mat.current.needsUpdate = true;
      }
    }
  });
  return (
    <group ref={g} visible={false}>
      <mesh position={[0, 1.55, 0]} castShadow>
        <boxGeometry args={[0.24, 3.1, 0.24]} />
        <meshStandardMaterial color="#3d4a36" />
      </mesh>
      <mesh position={[0, 3.25, 0]} castShadow>
        <boxGeometry args={[5.4, 2.55, 0.14]} />
        <meshStandardMaterial color="#146c38" />
      </mesh>
      <mesh position={[0, 3.25, 0.09]}>
        <planeGeometry args={[5.1, 2.35]} />
        <meshStandardMaterial ref={mat} color="#ffffff" roughness={0.45} />
      </mesh>
    </group>
  );
}

function Walkers({ sim }: { sim: RunnerSim }) {
  const body = useRef<THREE.InstancedMesh>(null);
  const lLeg = useRef<THREE.InstancedMesh>(null);
  const rLeg = useRef<THREE.InstancedMesh>(null);
  const head = useRef<THREE.InstancedMesh>(null);
  useFrame(() => {
    if (body.current) parkInstances(body.current, 16);
    if (lLeg.current) parkInstances(lLeg.current, 16);
    if (rLeg.current) parkInstances(rLeg.current, 16);
    if (head.current) parkInstances(head.current, 16);
    let i = 0;
    for (const e of sim.walkers) {
      if (!e.active) continue;
      const s = e.scale;
      const swing = Math.sin(e.z * 2.4) * 0.55;
      dummy.position.set(e.x, 0.95 * s, e.z);
      dummy.scale.set(s, s, s);
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();
      body.current?.setMatrixAt(i, dummy.matrix);
      dummy.position.set(e.x, 1.42 * s, e.z);
      dummy.scale.set(s, s, s);
      dummy.updateMatrix();
      head.current?.setMatrixAt(i, dummy.matrix);
      dummy.position.set(e.x - 0.1 * s, 0.42 * s, e.z);
      dummy.rotation.set(swing, 0, 0);
      dummy.scale.set(s, s, s);
      dummy.updateMatrix();
      lLeg.current?.setMatrixAt(i, dummy.matrix);
      dummy.position.set(e.x + 0.1 * s, 0.42 * s, e.z);
      dummy.rotation.set(-swing, 0, 0);
      dummy.updateMatrix();
      rLeg.current?.setMatrixAt(i, dummy.matrix);
      i++;
    }
    for (const mesh of [body.current, lLeg.current, rLeg.current, head.current]) {
      if (!mesh) continue;
      mesh.count = i;
      mesh.instanceMatrix.needsUpdate = true;
    }
  });
  return (
    <>
      <instancedMesh ref={body} args={[undefined, undefined, 16]} castShadow frustumCulled={false} count={0}>
        <capsuleGeometry args={[0.22, 0.55, 4, 8]} />
        <meshStandardMaterial color="#efe4d2" roughness={0.8} />
      </instancedMesh>
      <instancedMesh ref={head} args={[undefined, undefined, 16]} castShadow frustumCulled={false} count={0}>
        <sphereGeometry args={[0.16, 8, 8]} />
        <meshStandardMaterial color="#c9956c" roughness={0.6} />
      </instancedMesh>
      <instancedMesh ref={lLeg} args={[undefined, undefined, 16]} frustumCulled={false} count={0}>
        <capsuleGeometry args={[0.09, 0.38, 3, 6]} />
        <meshStandardMaterial color="#e8dcc6" />
      </instancedMesh>
      <instancedMesh ref={rLeg} args={[undefined, undefined, 16]} frustumCulled={false} count={0}>
        <capsuleGeometry args={[0.09, 0.38, 3, 6]} />
        <meshStandardMaterial color="#e8dcc6" />
      </instancedMesh>
    </>
  );
}

function Dust({ sim }: { sim: RunnerSim }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const ages = useMemo(() => new Float32Array(40).fill(0), []);
  useFrame((_, dt) => {
    const mesh = ref.current;
    if (!mesh) return;
    if (!sim.running || sim.dead || sim.paused) {
      mesh.visible = false;
      return;
    }
    mesh.visible = true;
    mesh.count = 40;
    for (let i = 0; i < 40; i++) {
      ages[i] += dt * (1.6 + (i % 5) * 0.2);
      if (ages[i]! > 1) ages[i] = 0;
      const a = ages[i]!;
      dummy.position.set(
        sim.x + ((i % 7) - 3) * 0.07,
        0.08 + a * 0.35,
        0.55 + a * 1.8 + (i % 4) * 0.08,
      );
      dummy.scale.set(1, 1, 1);
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, 40]} frustumCulled={false} count={0}>
      <sphereGeometry args={[0.07, 5, 4]} />
      <meshStandardMaterial color="#c4a882" transparent opacity={0.35} depthWrite={false} />
    </instancedMesh>
  );
}

function CameraRig({ sim }: { sim: RunnerSim }) {
  const { camera } = useThree();
  useFrame((_, dt) => {
    const k = 1 - Math.exp(-8 * dt);
    const run = sim.running && !sim.dead && sim.grounded ? 1 : 0;
    const bob = Math.abs(Math.sin(sim.distance * 2.05)) * 0.07 * run;
    const tx = sim.x * 0.38;
    const ty = 2.72 + sim.y * 0.22 + bob;
    const tz = 5.55;
    camera.position.x += (tx - camera.position.x) * k;
    camera.position.y += (ty - camera.position.y) * k;
    camera.position.z += (tz - camera.position.z) * k;
    if (sim.shake > 0) {
      const s = sim.shake * sim.shake;
      camera.position.x += (Math.random() - 0.5) * s * 0.45;
      camera.position.y += (Math.random() - 0.5) * s * 0.25;
    }
    camera.lookAt(sim.x * 0.55, 1.05 + sim.y * 0.28, -10.5);
    camera.rotation.z += (-sim.x * 0.03 - camera.rotation.z) * k;
    const cam = camera as THREE.PerspectiveCamera;
    if (cam.isPerspectiveCamera) {
      const fov = 62 + Math.min(10, Math.max(0, sim.speed - 13) * 0.5);
      cam.fov += (fov - cam.fov) * k;
      cam.updateProjectionMatrix();
    }
  });
  return null;
}

export function GameWorld({ sim }: { sim: RunnerSim }) {
  return (
    <>
      <color attach="background" args={["#b99262"]} />
      <fog attach="fog" args={["#c5c48a", 18, 120]} />
      <Sky sunPosition={[90, 16, 35]} turbidity={7} rayleigh={0.7} mieCoefficient={0.006} mieDirectionalG={0.82} />
      <hemisphereLight args={["#f0d8b0", "#5c6b3a", 0.72]} />
      <ambientLight intensity={0.28} />
      <directionalLight
        castShadow
        position={[22, 30, 10]}
        intensity={1.55}
        color="#ffd4a0"
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={2}
        shadow-camera-far={70}
        shadow-camera-left={-18}
        shadow-camera-right={18}
        shadow-camera-top={18}
        shadow-camera-bottom={-18}
      />
      <CameraRig sim={sim} />
      <Ground sim={sim} />
      <LaneMarks sim={sim} />
      <Hills sim={sim} />
      <Trees sim={sim} />
      <Houses sim={sim} />
      <Fences sim={sim} />
      <Mosques sim={sim} />
      <Walkers sim={sim} />
      <Player sim={sim} />
      <Dust sim={sim} />
      <Coins sim={sim} />
      {sim.obstacles.map((e, i) => (
        <ObstacleSlot key={i} ent={e} />
      ))}
      {sim.gates.map((e, i) => (
        <GateVisual key={`g${i}`} ent={e} />
      ))}
      {sim.boards.map((e, i) => (
        <BoardVisual key={`b${i}`} ent={e} />
      ))}
    </>
  );
}
