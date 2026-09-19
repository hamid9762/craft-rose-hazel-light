import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useState } from "react";

const loadGame = () => import("@/game/Game").then((m) => ({ default: m.Game }));
const Game = lazy(loadGame);
if (typeof document !== "undefined") void loadGame();

export const Route = createFileRoute("/")({
  component: Home,
});

function Shell() {
  return (
    <div className="flex h-dvh w-full items-end bg-bg p-6 text-fg">
      <div>
        <p className="text-xs tracking-[0.28em] text-muted">SHINKA · CHHACHH</p>
        <h1 className="font-display text-5xl tracking-wide">HAZRO RUN</h1>
        <p className="mt-2 font-display text-sm tracking-[0.18em] text-primary">BY HAMID</p>
        <p className="mt-2 max-w-sm text-sm text-muted">
          Start in Shinka. Run Hazro Tehsil village by village.
        </p>
      </div>
    </div>
  );
}

function Home() {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  if (!ready) return <Shell />;
  return (
    <Suspense fallback={<Shell />}>
      <Game />
    </Suspense>
  );
}
