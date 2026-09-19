import { create } from "zustand";
import type { Screen } from "./hud";

type HudState = {
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
  setScreen: (screen: Screen) => void;
  patch: (p: Partial<Omit<HudState, "setScreen" | "patch">>) => void;
};

export const useHud = create<HudState>((set) => ({
  screen: "start",
  score: 0,
  coins: 0,
  distance: 0,
  highScore: 0,
  village: "Shinka",
  villageUrdu: "شینکا",
  entering: null,
  villagesRun: ["Shinka"],
  muted: false,
  setScreen: (screen) => set({ screen }),
  patch: (p) => set(p),
}));
