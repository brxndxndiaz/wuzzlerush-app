import { create } from "zustand";

import { createJSONStorage, persist } from "zustand/middleware";

interface GameStore {
  soundEnabled: boolean;
  setSoundEnabled: (v: boolean) => void;
  soundVolume: number;
  setSoundVolume: (v: number) => void;
  musicEnabled: boolean;
  setMusicEnabled: (v: boolean) => void;
  musicVolume: number;
  setMusicVolume: (v: number) => void;
}

export const useGameStore = create<GameStore>((set) => ({
  soundEnabled: true,
  setSoundEnabled: (v) => set({ soundEnabled: v }),
  soundVolume: 30,
  setSoundVolume: (v) => set({ soundVolume: v }),
  musicEnabled: true,
  setMusicEnabled: (v) => set({ musicEnabled: v }),
  musicVolume: 10,
  setMusicVolume: (v) => set({ musicVolume: v }),

  
}));
