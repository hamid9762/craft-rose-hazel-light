import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  MapPin,
  Pause,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { VILLAGES } from "./villages";

export type Screen = "start" | "playing" | "paused" | "dead";

type HudProps = {
  screen: Screen;
  score: number;
  coins: number;
  distance: number;
  highScore: number;
  village: string;
  villageUrdu: string;
  entering: string | null;
  villagesRun: string[];
  muted: boolean;
  onPlay: () => void;
  onPause: () => void;
  onResume: () => void;
  onMute: () => void;
  onLeft: () => void;
  onRight: () => void;
  onJump: () => void;
  onSlide: () => void;
};

export function Hud(props: HudProps) {
  const {
    screen, score, coins, distance, highScore, village, villageUrdu,
    entering, villagesRun, muted, onPlay, onPause, onResume, onMute,
    onLeft, onRight, onJump, onSlide,
  } = props;

  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex flex-col">
      <p className={cn(
        "pointer-events-none absolute right-3 z-20 font-display text-sm tracking-wide text-fg/80 drop-shadow-sm",
        screen === "playing" || screen === "paused"
          ? "bottom-24 md:bottom-3"
          : "bottom-[max(0.75rem,env(safe-area-inset-bottom))]",
      )}>
        @hamid
      </p>
      {screen === "playing" || screen === "paused" ? (
        <div className="pointer-events-auto flex items-start justify-between gap-3 p-4 pt-[max(1rem,env(safe-area-inset-top))]">
          <div className="rounded-lg bg-bg/70 px-3 py-2 text-fg shadow-sm backdrop-blur-sm">
            <p className="font-display text-xl leading-tight tracking-wide tabular-nums">{score.toLocaleString()}</p>
            <p className="text-xs text-muted">{Math.floor(distance)} m · {coins} coins</p>
          </div>
          <div className="max-w-[55%] text-center">
            <p className="font-display text-lg tracking-wide text-fg drop-shadow-sm">{village}</p>
            <p className="font-urdu text-sm text-fg/90">{villageUrdu}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="icon" onClick={onMute} aria-label={muted ? "Unmute" : "Mute"}>
              {muted ? <VolumeX /> : <Volume2 />}
            </Button>
            <Button variant="secondary" size="icon" onClick={screen === "paused" ? onResume : onPause} aria-label={screen === "paused" ? "Resume" : "Pause"}>
              {screen === "paused" ? <Play /> : <Pause />}
            </Button>
          </div>
        </div>
      ) : null}

      {entering && screen === "playing" ? (
        <div className="mx-auto mt-2 rounded-md bg-primary px-4 py-2 text-primary-fg shadow-sm">
          <p className="font-display text-sm tracking-widest">NOW ENTERING</p>
          <p className="font-display text-2xl leading-tight">{entering}</p>
        </div>
      ) : null}

      {screen === "playing" ? (
        <div className="pointer-events-auto mt-auto flex items-end justify-between gap-4 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] md:hidden">
          <div className="flex gap-2">
            <PadBtn onPress={onLeft} label="Left"><ChevronLeft /></PadBtn>
            <PadBtn onPress={onRight} label="Right"><ChevronRight /></PadBtn>
          </div>
          <div className="flex gap-2">
            <PadBtn onPress={onSlide} label="Slide"><ChevronDown /></PadBtn>
            <PadBtn onPress={onJump} label="Jump"><ChevronUp /></PadBtn>
          </div>
        </div>
      ) : null}

      {screen === "start" ? <StartCard highScore={highScore} onPlay={onPlay} muted={muted} onMute={onMute} /> : null}
      {screen === "paused" ? (
        <Modal>
          <h2 className="font-display text-3xl tracking-wide">Paused</h2>
          <p className="mt-1 text-muted">Hazro Tehsil is waiting.</p>
          <div className="mt-6 flex flex-col gap-3">
            <Button size="lg" onClick={onResume}>Resume</Button>
            <Button variant="secondary" onClick={onPlay}>Restart</Button>
          </div>
        </Modal>
      ) : null}
      {screen === "dead" ? (
        <Modal>
          <p className="text-xs tracking-[0.2em] text-muted">RUN OVER</p>
          <h2 className="mt-1 font-display text-4xl tracking-wide">{score.toLocaleString()}</h2>
          <p className="mt-1 text-muted">{Math.floor(distance)} m · {coins} coins</p>
          <p className="mt-3 flex items-center justify-center gap-2 text-sm text-fg">
            <MapPin className="size-4 text-primary" />
            Last village: {village}
          </p>
          {highScore > 0 ? (
            <p className="mt-1 text-xs text-muted">Best {highScore.toLocaleString()}</p>
          ) : null}
          <div className="mt-4 max-h-28 overflow-y-auto text-center text-xs leading-relaxed text-muted">
            {villagesRun.join(" → ")}
          </div>
          <Button size="lg" className="mt-6 w-full" onClick={onPlay}>
            <RotateCcw /> Run again
          </Button>
        </Modal>
      ) : null}
    </div>
  );
}

function StartCard({
  highScore, onPlay, muted, onMute,
}: {
  highScore: number;
  onPlay: () => void;
  muted: boolean;
  onMute: () => void;
}) {
  return (
    <div className="pointer-events-auto flex flex-1 flex-col justify-end bg-gradient-to-t from-bg via-bg/80 to-transparent p-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:justify-center sm:bg-none">
      <div className="mx-auto w-full max-w-md rounded-xl border border-border bg-bg/80 p-6 shadow-sm backdrop-blur-md sm:p-8">
        <p className="text-xs tracking-[0.28em] text-muted">SHINKA · CHHACHH</p>
        <h1 className="mt-2 font-display text-5xl leading-none tracking-wide text-fg sm:text-6xl">HAZRO RUN</h1>
        <p className="mt-2 font-display text-sm tracking-[0.18em] text-primary">BY HAMID</p>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted">
          Start pe voice: “Shinka gaon se game start ho rahi hai”. Har gaon pe naam bolega — “Yaseen aa gaya”. Welfare board silent.
        </p>
        <p className="font-urdu mt-2 text-base text-fg/90">شینکا سے دوڑ شروع کرو</p>
        {highScore > 0 ? (
          <p className="mt-3 text-xs text-muted">Best {highScore.toLocaleString()}</p>
        ) : null}
        <div className="mt-6 flex flex-col gap-3">
          <Button size="lg" onClick={onPlay} className="w-full">
            <Play /> Start run
          </Button>
          <Button variant="secondary" onClick={onMute} className="w-full">
            {muted ? <VolumeX /> : <Volume2 />} {muted ? "Sound off" : "Sound on"}
          </Button>
        </div>
        <p className="mt-5 text-xs leading-relaxed text-muted">
          A / D or arrows to switch lanes · Space / swipe up to jump · S / swipe down to slide
        </p>
        <p className="mt-3 max-h-16 overflow-hidden text-[11px] leading-5 text-muted/80">
          {VILLAGES.map((v) => v.name).join(" · ")}
        </p>
      </div>
    </div>
  );
}

function Modal({ children }: { children: React.ReactNode }) {
  return (
    <div className="pointer-events-auto absolute inset-0 flex items-center justify-center bg-bg/55 p-5 backdrop-blur-[2px]">
      <div className="w-full max-w-sm rounded-xl border border-border bg-surface p-6 text-center shadow-sm">
        {children}
      </div>
    </div>
  );
}

function PadBtn({
  onPress, label, children,
}: {
  onPress: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      className={cn(
        "flex size-14 items-center justify-center rounded-lg border border-border bg-bg/70 text-fg shadow-sm backdrop-blur-sm",
        "active:scale-[0.98]",
      )}
      onPointerDown={(e) => {
        e.preventDefault();
        onPress();
      }}
    >
      {children}
    </button>
  );
}
