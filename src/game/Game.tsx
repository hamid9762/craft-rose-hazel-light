import { Canvas, useFrame } from "@react-three/fiber";
import { Suspense, useCallback, useEffect, useRef } from "react";
import * as THREE from "three";
import { isMuted, pauseAnnounce, resumeAnnounce, resumeAudio, setMuted, startMusic, unlockAudio } from "./audio";
import { Hud } from "./hud";
import { loadHighScore, RunnerSim } from "./sim";
import { useHud } from "./store";
import { GameWorld } from "./world";

const GAME_CODES = new Set([
  "KeyA", "KeyD", "KeyS", "KeyW", "Space",
  "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "ControlLeft", "Escape",
]);

export function Game() {
  const simRef = useRef<RunnerSim | null>(null);
  if (!simRef.current) simRef.current = new RunnerSim();
  const sim = simRef.current;

  const muted = useHud((s) => s.muted);
  const swipe = useRef<{ x: number; y: number; id: number } | null>(null);
  const uiAcc = useRef(0);

  useEffect(() => {
    useHud.getState().patch({ highScore: loadHighScore() });
  }, []);

  const play = useCallback(() => {
    unlockAudio();
    startMusic();
    sim.reset();
    useHud.getState().setScreen("playing");
    useHud.getState().patch({
      score: 0,
      coins: 0,
      distance: 0,
      village: "Shinka",
      villageUrdu: "شینکا",
      entering: "Shinka",
      villagesRun: ["Shinka"],
    });
  }, [sim]);

  const pause = useCallback(() => {
    if (sim.dead || !sim.running) return;
    sim.paused = true;
    pauseAnnounce();
    useHud.getState().setScreen("paused");
  }, [sim]);

  const resume = useCallback(() => {
    sim.paused = false;
    useHud.getState().setScreen("playing");
    resumeAudio();
    resumeAnnounce();
  }, [sim]);

  const tapLeft = useCallback(() => {
    sim.keys.add("KeyA");
    window.setTimeout(() => sim.keys.delete("KeyA"), 90);
  }, [sim]);
  const tapRight = useCallback(() => {
    sim.keys.add("KeyD");
    window.setTimeout(() => sim.keys.delete("KeyD"), 90);
  }, [sim]);
  const tapJump = useCallback(() => {
    sim.keys.add("Space");
    window.setTimeout(() => sim.keys.delete("Space"), 90);
  }, [sim]);
  const tapSlide = useCallback(() => {
    sim.keys.add("KeyS");
    window.setTimeout(() => sim.keys.delete("KeyS"), 90);
  }, [sim]);

  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      if (GAME_CODES.has(e.code)) e.preventDefault();
      const sc = useHud.getState().screen;
      if (e.code === "Escape") {
        if (sc === "playing") pause();
        else if (sc === "paused") resume();
        return;
      }
      sim.keys.add(e.code);
    };
    const onUp = (e: KeyboardEvent) => {
      sim.keys.delete(e.code);
    };
    const clear = () => sim.keys.clear();
    const vis = () => {
      if (document.hidden && useHud.getState().screen === "playing") pause();
      else resumeAudio();
    };
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    window.addEventListener("blur", clear);
    document.addEventListener("visibilitychange", vis);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
      window.removeEventListener("blur", clear);
      document.removeEventListener("visibilitychange", vis);
    };
  }, [pause, resume, sim]);

  useEffect(() => {
    const w = window as Window & {
      __controlsTest?: {
        getYaw: () => number;
        getSpeed: () => number;
        getX: () => number;
        getLane: () => number;
        setKeys: (codes: string[]) => void;
        setSteer: (v: number) => void;
      };
    };
    w.__controlsTest = {
      getYaw: () => -sim.x,
      getSpeed: () => (sim.running && !sim.paused ? sim.speed : 0),
      getX: () => sim.x,
      getLane: () => sim.lane,
      setKeys: (codes: string[]) => {
        sim.setInjected(codes);
        if ((codes.includes("KeyW") || codes.includes("KeyA") || codes.includes("KeyD")) && !sim.running) {
          sim.reset();
          useHud.getState().setScreen("playing");
        }
      },
      setSteer: (v: number) => {
        if (v > 0.2) sim.setInjected(["KeyA"]);
        else if (v < -0.2) sim.setInjected(["KeyD"]);
        else sim.setInjected([]);
      },
    };
    return () => {
      delete w.__controlsTest;
    };
  }, [sim]);

  const onPointerDown = (e: React.PointerEvent) => {
    if (useHud.getState().screen !== "playing") return;
    swipe.current = { x: e.clientX, y: e.clientY, id: e.pointerId };
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const s = swipe.current;
    swipe.current = null;
    if (!s || s.id !== e.pointerId || useHud.getState().screen !== "playing") return;
    const dx = e.clientX - s.x;
    const dy = e.clientY - s.y;
    if (Math.hypot(dx, dy) < 28) return;
    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) tapLeft();
      else tapRight();
    } else if (dy < 0) tapJump();
    else tapSlide();
  };

  return (
    <div
      className="relative h-dvh w-full overflow-hidden bg-bg text-fg"
      style={{ touchAction: "none" }}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={() => {
        swipe.current = null;
      }}
    >
      <Canvas
        shadows="percentage"
        dpr={[1, 1.5]}
        camera={{ fov: 64, position: [0, 2.75, 5.6], near: 0.1, far: 220 }}
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.12;
          gl.setClearColor("#b99262");
        }}
      >
        <SimLoop sim={sim} uiAcc={uiAcc} />
        <Suspense fallback={null}>
          <GameWorld sim={sim} />
        </Suspense>
      </Canvas>
      <HudBridge
        muted={muted}
        onPlay={play}
        onPause={pause}
        onResume={resume}
        onMute={() => {
          const next = !isMuted();
          setMuted(next);
          useHud.getState().patch({ muted: next });
        }}
        onLeft={tapLeft}
        onRight={tapRight}
        onJump={tapJump}
        onSlide={tapSlide}
      />
    </div>
  );
}

function HudBridge(
  props: Omit<
    React.ComponentProps<typeof Hud>,
    | "screen"
    | "score"
    | "coins"
    | "distance"
    | "highScore"
    | "village"
    | "villageUrdu"
    | "entering"
    | "villagesRun"
  >,
) {
  const hud = useHud();
  return (
    <Hud
      screen={hud.screen}
      score={hud.score}
      coins={hud.coins}
      distance={hud.distance}
      highScore={hud.highScore}
      village={hud.village}
      villageUrdu={hud.villageUrdu}
      entering={hud.entering}
      villagesRun={hud.villagesRun}
      {...props}
    />
  );
}

function SimLoop({
  sim,
  uiAcc,
}: {
  sim: RunnerSim;
  uiAcc: React.MutableRefObject<number>;
}) {
  useFrame((_, dt) => {
    if (useHud.getState().screen === "playing") sim.step(dt);
    uiAcc.current += dt;
    if (uiAcc.current > 0.08 || sim.dead || sim.enterPulse > 1.5) {
      uiAcc.current = 0;
      const s = sim.snap();
      useHud.getState().patch({
        score: s.score,
        coins: s.coins,
        distance: s.distance,
        highScore: sim.highScore,
        village: s.village.name,
        villageUrdu: s.village.urdu,
        entering: s.entering,
        villagesRun: s.villagesRun,
      });
      if (s.dead && useHud.getState().screen === "playing") {
        useHud.getState().setScreen("dead");
      }
    }
  });
  return null;
}
