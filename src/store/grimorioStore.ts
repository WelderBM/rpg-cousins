import { create } from "zustand";
import { Spell } from "@/interfaces/Spells";

interface GrimorioState {
  searchTerm: string;
  selectedCircle: number | "all";
  selectedSchool: string | "all";
  spells: Spell[];
  setSearchTerm: (term: string) => void;
  setSelectedCircle: (circle: number | "all") => void;
  setSelectedSchool: (school: string | "all") => void;
  setSpells: (spells: Spell[]) => void;
}

export const useGrimorioStore = create<GrimorioState>((set) => ({
  searchTerm: "",
  selectedCircle: "all",
  selectedSchool: "all",
  spells: [],
  setSearchTerm: (searchTerm) => set({ searchTerm }),
  setSelectedCircle: (selectedCircle) => set({ selectedCircle }),
  setSelectedSchool: (selectedSchool) => set({ selectedSchool }),
  setSpells: (spells) => set({ spells }),
}));
