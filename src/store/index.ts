import { create } from "zustand";

interface AppState {
  user: any | null;
  setUser: (user: any) => void;
  // Placeholder for future state
}

export const useStore = create<AppState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));
