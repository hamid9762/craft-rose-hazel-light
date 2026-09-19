import { playCoin, playHit, playJump, playSlide, playVillage } from "./audio";
import { villageAt, VILLAGES, type Village } from "./villages";

export const LANE_X = [-2.45, 0, 2.45] as const;
export const START_SPEED = 8.8;
export const MAX_SPEED = 26;
export const JUMP_V = 9.4;
export const GRAVITY = 26;
export const LANE_TIME = 0.16;
export const HS_KEY = "hazro-run-best-v1";

export type Kind = "hay" | "cart" | "rock" | "bar" | "log" | "coin" | "gate" | "stone" | "tree" | "house" | "mosque" | "fence" | "hill" | "board" | "walker";

export type Ent = {
  active: boolean;
  kind: Kind;
  x: number;
  y: number;
  z: number;
  hw: number;
  hh: number;
  hd: number;
  lane: number;
  scale: number;
  rot: number;
  variant: number;
  village: number;
  passed: boolean;
};

export type HudSnap = {
  score: number;
  coins: number;
  distance: number;
  speed: number;
  village: Village;
  villagesRun: string[];
  entering: string | null;
  dead: boolean;
  shake: number;
};

function makePool(n: number, kind: Kind): Ent[] {
  return Array.from({ length: n }, () => ({
    active: false,
    kind,
    x: 0,
    y: 0,
    z: 0,
    hw: 0.5,
    hh: 0.5,
    hd: 0.5,
    lane: 1,
    scale: 1,
    rot: 0,
    variant: 0,
    village: 0,
    passed: false,
  }));
}

function grab(pool: Ent[]): Ent | null {
  for (const e of pool) if (!e.active) return e;
  return null;
}

function aabbOverlap(
  ax: number, ay: number, az: number, ahx: number, ahy: number, ahz: number,
  bx: number, by: number, bz: number, bhx: number, bhy: number, bhz: number,
) {
  return Math.abs(ax - bx) < ahx + bhx && Math.abs(ay - by) < ahy + bhy && Math.abs(az - bz) < ahz + bhz;
}

export class RunnerSim {
  running = false;
  paused = false;
  dead = false;
  distance = 0;
  speed = START_SPEED;
  coins = 0;
  score = 0;
  highScore = 0;

  lane = 1;
  targetLane = 1;
  x = 0;
  y = 0;
  vy = 0;
  grounded = true;
  coyote = 0;
  jumpBuf = 0;
  sliding = 0;
  laneT = 1;
  laneFrom = 0;
  laneTo = 0;

  villageIndex = 0;
  currentVillage = 0;
  nextVillageAt = 48;
  villagesRun: number[] = [0];
  enterPulse = 0;
  enteringName: string | null = null;
  spokenLandmarks = new Set<string>();

  nextPatternAt = 22;
  nextTreeAt = 4;
  nextHouseAt = 10;
  nextFenceAt = 2;
  nextWalkerAt = 6;

  shake = 0;
  hitstop = 0;
  lastStep = 0;

  keys = new Set<string>();
  injected = new Set<string>();

  obstacles = makePool(22, "rock");
  coinsP = makePool(28, "coin");
  gates = makePool(4, "gate");
  stones = makePool(6, "stone");
  trees = makePool(56, "tree");
  houses = makePool(36, "house");
  mosques = makePool(6, "mosque");
  fences = makePool(48, "fence");
  hills = makePool(10, "hill");
  boards = makePool(20, "board");
  walkers = makePool(16, "walker");

  constructor() {
    if (typeof window !== "undefined") {
      const raw = window.localStorage.getItem(HS_KEY);
      const n = raw ? Number(raw) : 0;
      this.highScore = Number.isFinite(n) ? n : 0;
    }
    this.seedHills();
    this.seedPreview();
  }

  setInjected(codes: string[]) {
    this.injected = new Set(codes);
  }

  reset() {
    this.running = true;
    this.paused = false;
    this.dead = false;
    this.distance = 0;
    this.speed = START_SPEED;
    this.coins = 0;
    this.score = 0;
    this.lane = 1;
    this.targetLane = 1;
    this.x = 0;
    this.y = 0;
    this.vy = 0;
    this.grounded = true;
    this.coyote = 0;
    this.jumpBuf = 0;
    this.sliding = 0;
    this.laneT = 1;
    this.laneFrom = 0;
    this.laneTo = 0;
    this.villageIndex = 0;
    this.currentVillage = 0;
    this.nextVillageAt = 110;
    this.villagesRun = [0];
    this.enterPulse = 2.2;
    this.enteringName = villageAt(0).name;
    this.spokenLandmarks.clear();
    this.nextPatternAt = 32;
    this.nextTreeAt = 3;
    this.nextHouseAt = 8;
    this.nextFenceAt = 1;
    this.nextWalkerAt = 4;
    this.shake = 0;
    this.hitstop = 0;
    this.lastStep = 0;
    for (const pool of [
      this.obstacles, this.coinsP, this.gates, this.stones,
      this.trees, this.houses, this.mosques, this.fences, this.hills, this.boards, this.walkers,
    ]) {
      for (const e of pool) e.active = false;
    }
    this.seedHills();
    this.spawnVillage(-30);
    playVillage(villageAt(0).name, true);
  }

  seedHills() {
    for (let i = 0; i < 8; i++) {
      const e = grab(this.hills);
      if (!e) break;
      e.active = true;
      e.kind = "hill";
      const side = i % 2 === 0 ? -1 : 1;
      e.x = side * (34 + (i % 3) * 5);
      e.y = 0;
      e.z = -20 - i * 22;
      e.scale = 5 + (i % 4) * 2;
      e.rot = 0.2 * i;
      e.variant = i % 3;
    }
  }

  seedPreview() {
    for (let i = 0; i < 18; i++) {
      const t = grab(this.trees);
      if (!t) break;
      const side = i % 2 === 0 ? -1 : 1;
      this.occupy(t, "tree", side * (8.4 + (i % 5) * 2.2), 0, -12 - i * 7, 0.6, 2, 0.6);
      t.scale = 0.9 + (i % 4) * 0.18;
      t.rot = i * 0.4;
    }
    for (let i = 0; i < 8; i++) {
      const h = grab(this.houses);
      if (!h) break;
      const side = i % 2 === 0 ? -1 : 1;
      this.occupy(h, "house", side * (8.5 + (i % 3)), 0, -16 - i * 11, 1.2, 1.3, 1.2);
      h.scale = 0.95 + (i % 3) * 0.12;
      h.rot = (i % 2 === 0 ? -0.1 : 0.12);
      h.variant = i % 4;
    }
    const gate = grab(this.gates);
    if (gate) {
      this.occupy(gate, "gate", 0, 0, -22, 0.4, 2, 0.4);
      gate.village = 0;
    }
    const m = grab(this.mosques);
    if (m) {
      this.occupy(m, "mosque", -10.5, 0, -28, 1.4, 3, 1.4);
      m.scale = 1.15;
    }
    const previewSpots = villageAt(0).landmarks;
    for (let i = 0; i < previewSpots.length; i++) {
      const b = grab(this.boards);
      if (!b) break;
      const side = i % 2 === 0 ? 1 : -1;
      this.occupy(b, "board", side * (i === 0 ? 6.55 : 6.05), 0, -8 - i * 16, 0.6, 1.4, 0.12);
      b.village = 0;
      b.variant = i;
      b.scale = i === 0 ? 1.28 : 1.12;
    }
    for (let i = 0; i < 6; i++) {
      const w = grab(this.walkers);
      if (!w) break;
      this.occupy(w, "walker", 6.45 + (i % 3) * 0.35, 0, -10 - i * 9, 0.25, 0.8, 0.25);
      w.scale = 0.88 + (i % 3) * 0.1;
      w.variant = i % 4;
    }
  }

  private held(code: string) {
    return this.keys.has(code) || this.injected.has(code);
  }

  private spawnZ() {
    return -(38 + this.speed * 1.25);
  }

  private occupy(e: Ent, kind: Kind, x: number, y: number, z: number, hw: number, hh: number, hd: number) {
    e.active = true;
    e.kind = kind;
    e.x = x;
    e.y = y;
    e.z = z;
    e.hw = hw;
    e.hh = hh;
    e.hd = hd;
    e.passed = false;
  }

  private spawnObstacle(kind: Kind, lane: number, z: number) {
    const e = grab(this.obstacles);
    if (!e) return;
    const x = LANE_X[lane] ?? 0;
    e.lane = lane;
    e.variant = (Math.random() * 3) | 0;
    e.rot = Math.random() * Math.PI;
    e.scale = 1;
    if (kind === "hay") this.occupy(e, kind, x, 0.62, z, 0.62, 0.62, 0.62);
    else if (kind === "cart") this.occupy(e, kind, x, 0.7, z, 0.78, 0.7, 0.95);
    else if (kind === "rock") this.occupy(e, kind, x, 0.48, z, 0.58, 0.48, 0.58);
    else if (kind === "bar") this.occupy(e, kind, 0, 1.28, z, 4.4, 0.22, 0.22);
    else this.occupy(e, kind, 0, 0.38, z, 4.4, 0.38, 0.4);
  }

  private spawnCoins(lane: number, z: number, count: number, arc = false) {
    for (let i = 0; i < count; i++) {
      const e = grab(this.coinsP);
      if (!e) return;
      const x = LANE_X[lane] ?? 0;
      const y = arc ? 1.15 + Math.sin((i / (count - 1)) * Math.PI) * 1.1 : 0.95;
      this.occupy(e, "coin", x, y, z - i * 2.1, 0.32, 0.32, 0.32);
      e.lane = lane;
    }
  }

  private spawnPattern() {
    const z = this.spawnZ();
    const t = Math.random();
    const dens = Math.min(1, this.distance / 1600);
    const block = (["hay", "cart", "rock"] as const)[(Math.random() * 3) | 0] ?? "hay";

    if (t < 0.3) {
      const lane = (Math.random() * 3) | 0;
      this.spawnObstacle(block, lane, z);
      const coinLane = (lane + 1 + ((Math.random() * 2) | 0)) % 3;
      if (Math.random() < 0.7) this.spawnCoins(coinLane, z + 2, 4);
    } else if (t < 0.52 + dens * 0.08) {
      const safe = (Math.random() * 3) | 0;
      for (let l = 0; l < 3; l++) if (l !== safe) this.spawnObstacle(block, l, z);
      this.spawnCoins(safe, z + 1, 3);
    } else if (t < 0.7) {
      this.spawnObstacle("log", 1, z);
      const lane = (Math.random() * 3) | 0;
      this.spawnCoins(lane, z + 1.2, 5, true);
    } else if (t < 0.86) {
      this.spawnObstacle("bar", 1, z);
      this.spawnCoins((Math.random() * 3) | 0, z + 2, 4);
    } else {
      this.spawnCoins((Math.random() * 3) | 0, z, 6);
    }
  }

  private spawnVillage(atZ?: number) {
    const idx = this.villageIndex % VILLAGES.length;
    const v = villageAt(idx);
    const z = atZ ?? this.spawnZ();
    this.villageIndex += 1;

    if (v.major) {
      const g = grab(this.gates);
      if (g) {
        this.occupy(g, "gate", 0, 0, z - 6, 0.4, 2, 0.4);
        g.village = idx;
      }
      const m = grab(this.mosques);
      if (m) {
        const side = Math.random() < 0.5 ? -1 : 1;
        this.occupy(m, "mosque", side * (9.5 + Math.random() * 2), 0, z - 14, 1.4, 3, 1.4);
        m.scale = 1.1 + Math.random() * 0.3;
        m.rot = Math.random() * 0.4;
      }
    }

    const houseCount = v.major ? 8 : 5;
    for (let i = 0; i < houseCount; i++) {
      const h = grab(this.houses);
      if (!h) break;
      const side = i % 2 === 0 ? -1 : 1;
      const x = side * (8.4 + (i % 3) * 2.2 + Math.random());
      this.occupy(h, "house", x, 0, z - 8 - i * 5.5, 1.2, 1.3, 1.2);
      h.scale = 0.9 + Math.random() * 0.45;
      h.rot = (Math.random() - 0.5) * 0.25;
      h.variant = (Math.random() * 4) | 0;
    }

    const spots = v.landmarks;
    const boardGap = idx === 0 ? 18 : 13;
    const boardBase = atZ !== undefined ? -12 : z - 4;
    for (let i = 0; i < spots.length; i++) {
      const b = grab(this.boards);
      if (!b) break;
      const side = i % 2 === 0 ? 1 : -1;
      const big = idx === 0 && i === 0;
      this.occupy(b, "board", side * (big ? 6.55 : 6.05), 0, boardBase - i * boardGap, 0.6, 1.4, 0.12);
      b.village = idx;
      b.variant = i;
      b.scale = big ? 1.28 : 1.12;
    }
  }

  private spawnAmbience() {
    const z = this.spawnZ() - 8;
    while (this.distance > this.nextTreeAt) {
      this.nextTreeAt += 5 + Math.random() * 6;
      const t = grab(this.trees);
      if (!t) break;
      const side = Math.random() < 0.5 ? -1 : 1;
      this.occupy(t, "tree", side * (6.8 + Math.random() * 10), 0, z - Math.random() * 20, 0.6, 2, 0.6);
      t.scale = 0.85 + Math.random() * 0.7;
      t.rot = Math.random() * Math.PI;
      t.variant = (Math.random() * 3) | 0;
    }
    while (this.distance > this.nextHouseAt) {
      this.nextHouseAt += 18 + Math.random() * 22;
      if (this.distance + 20 > this.nextVillageAt) continue;
      const h = grab(this.houses);
      if (!h) break;
      const side = Math.random() < 0.5 ? -1 : 1;
      this.occupy(h, "house", side * (8 + Math.random() * 4), 0, z, 1.2, 1.3, 1.2);
      h.scale = 0.85 + Math.random() * 0.4;
      h.rot = (Math.random() - 0.5) * 0.3;
      h.variant = (Math.random() * 4) | 0;
    }
    while (this.distance > this.nextFenceAt) {
      this.nextFenceAt += 5.5;
      for (const side of [-1, 1] as const) {
        const f = grab(this.fences);
        if (!f) continue;
        this.occupy(f, "fence", side * 4.65, 0, z + Math.random() * 4, 0.08, 0.55, 0.08);
        f.variant = side > 0 ? 1 : 0;
      }
    }
    while (this.distance > this.nextWalkerAt) {
      this.nextWalkerAt += 7 + Math.random() * 8;
      const w = grab(this.walkers);
      if (!w) break;
      this.occupy(w, "walker", 6.35 + Math.random() * 0.7, 0, z - Math.random() * 12, 0.25, 0.8, 0.25);
      w.scale = 0.85 + Math.random() * 0.25;
      w.variant = (Math.random() * 4) | 0;
    }
  }

  private die() {
    if (this.dead) return;
    this.dead = true;
    this.running = false;
    this.shake = 1;
    this.hitstop = 0.14;
    playHit();
    if (this.score > this.highScore) {
      this.highScore = this.score;
      try {
        window.localStorage.setItem(HS_KEY, String(this.highScore));
      } catch {
        /* ignore */
      }
    }
  }

  private playerBox() {
    const sliding = this.sliding > 0;
    const hh = sliding ? 0.36 : 0.82;
    const cy = this.y + hh;
    return { x: this.x, y: cy, z: 0, hx: 0.32, hy: hh, hz: 0.3 };
  }

  private collideHazards() {
    const p = this.playerBox();
    const dz = this.speed * (1 / 60) + 0.15;
    for (const e of this.obstacles) {
      if (!e.active) continue;
      if (e.z > 8) continue;
      const hz = e.hd + dz;
      if (!aabbOverlap(p.x, p.y, p.z, p.hx, p.hy, p.hz, e.x, e.y, e.z, e.hw, e.hh, hz)) continue;
      this.die();
      return;
    }
    for (const e of this.coinsP) {
      if (!e.active) continue;
      if (!aabbOverlap(p.x, p.y, p.z, p.hx, p.hy, p.hz + 0.2, e.x, e.y, e.z, e.hw, e.hh, e.hd)) continue;
      e.active = false;
      this.coins += 1;
      playCoin();
    }
  }

  private markPassed(pool: Ent[]) {
    for (const e of pool) {
      if (!e.active || e.passed) continue;
      if (e.z < 0.6) continue;
      e.passed = true;
      const v = villageAt(e.village);
      if (this.currentVillage !== e.village) {
        this.currentVillage = e.village;
        if (!this.villagesRun.includes(e.village)) this.villagesRun.push(e.village);
        this.enterPulse = 1.8;
        this.enteringName = v.name;
        playVillage(v.name);
      }
    }
  }

  step(dt: number) {
    const d = Math.min(dt, 0.08);
    this.shake = Math.max(0, this.shake - d * 2.4);
    if (this.enterPulse > 0) this.enterPulse = Math.max(0, this.enterPulse - d);
    if (this.enterPulse <= 0) this.enteringName = null;

    if (this.hitstop > 0) {
      this.hitstop -= d;
      return;
    }
    if (!this.running || this.paused || this.dead) return;

    const left = this.held("KeyA") || this.held("ArrowLeft");
    const right = this.held("KeyD") || this.held("ArrowRight");
    const jump = this.held("Space") || this.held("ArrowUp") || this.held("KeyW");
    const slide = this.held("KeyS") || this.held("ArrowDown") || this.held("ControlLeft");

    if (left && this.laneT >= 1 && this.targetLane > 0) {
      this.laneFrom = LANE_X[this.targetLane] ?? this.x;
      this.targetLane -= 1;
      this.laneTo = LANE_X[this.targetLane] ?? this.x;
      this.laneT = 0;
    } else if (right && this.laneT >= 1 && this.targetLane < 2) {
      this.laneFrom = LANE_X[this.targetLane] ?? this.x;
      this.targetLane += 1;
      this.laneTo = LANE_X[this.targetLane] ?? this.x;
      this.laneT = 0;
    }

    if (jump) this.jumpBuf = 0.13;
    this.jumpBuf -= d;
    if (slide && this.grounded) {
      if (this.sliding <= 0) playSlide();
      this.sliding = 0.62;
    }

    if (this.jumpBuf > 0 && (this.grounded || this.coyote > 0)) {
      this.vy = JUMP_V;
      this.grounded = false;
      this.coyote = 0;
      this.jumpBuf = 0;
      this.sliding = 0;
      playJump();
    }

    if (this.laneT < 1) {
      this.laneT = Math.min(1, this.laneT + d / LANE_TIME);
      const t = 1 - Math.pow(1 - this.laneT, 3);
      this.x = this.laneFrom + (this.laneTo - this.laneFrom) * t;
      if (this.laneT >= 1) this.lane = this.targetLane;
    }

    if (this.grounded) this.coyote = 0.09;
    else this.coyote -= d;

    if (!this.grounded || this.vy > 0) {
      this.vy -= GRAVITY * d;
      this.y += this.vy * d;
      if (this.y <= 0) {
        this.y = 0;
        this.vy = 0;
        this.grounded = true;
      } else {
        this.grounded = false;
      }
    }

    if (this.sliding > 0) this.sliding -= d;

    const n = this.villagesRun.length;
    const base = n >= 6 ? 16.2 : n >= 3 ? 12.4 : START_SPEED;
    const ramp = n >= 6 ? 0.0052 : n >= 3 ? 0.0038 : 0.0026;
    this.speed = Math.min(MAX_SPEED, base + this.distance * ramp);
    this.distance += this.speed * d;
    this.score = Math.floor(this.distance) + this.coins * 12;

    const move = this.speed * d;
    const recycle = (e: Ent) => {
      if (!e.active) return;
      e.z += move;
      if (e.z > 16) e.active = false;
    };
    for (const pool of [
      this.obstacles, this.coinsP, this.gates,
      this.trees, this.houses, this.mosques, this.fences, this.boards,
    ]) {
      for (const e of pool) recycle(e);
    }
    for (const e of this.walkers) {
      if (!e.active) continue;
      e.z += move + 2.6 * d;
      if (e.z > 16) e.active = false;
    }
    for (const e of this.hills) {
      if (!e.active) continue;
      e.z += move * 0.22;
      if (e.z > 30) e.z -= 180;
    }

    if (this.distance >= this.nextPatternAt) {
      this.spawnPattern();
      const gap = Math.max(13.5, 17 + this.speed * 0.55 - Math.min(5.5, this.distance / 900));
      this.nextPatternAt = this.distance + gap;
    }
    if (this.distance >= this.nextVillageAt) {
      this.spawnVillage();
      this.nextVillageAt = this.distance + 88 + Math.random() * 22;
    }
    this.spawnAmbience();
    this.markPassed(this.boards);
    this.markPassed(this.gates);
    this.collideHazards();
  }

  snap(): HudSnap {
    return {
      score: this.score,
      coins: this.coins,
      distance: this.distance,
      speed: this.speed,
      village: villageAt(this.currentVillage),
      villagesRun: this.villagesRun.map((i) => villageAt(i).name),
      entering: this.enteringName,
      dead: this.dead,
      shake: this.shake,
    };
  }
}

export function loadHighScore() {
  if (typeof window === "undefined") return 0;
  const n = Number(window.localStorage.getItem(HS_KEY) ?? 0);
  return Number.isFinite(n) ? n : 0;
}
