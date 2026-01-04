import { create } from "zustand";
import { Atributo } from "../data/atributos";
import Race from "../interfaces/Race";
import {
  calculateTotalPointsSpent,
  INITIAL_POINTS,
} from "../utils/attributeUtils";

interface CharacterWizardState {
  step: number;
  selectedRace: Race | null;
  selectedClass: ClassDescription | null;
  selectedSkills: Skill[];
  baseAttributes: Record<Atributo, number>;
  pointsRemaining: number;

  // Actions
  setStep: (step: number) => void;
  selectRace: (race: Race) => void;
  selectClass: (role: ClassDescription) => void;
  updateSkills: (skills: Skill[]) => void;
  updateBaseAttribute: (attr: Atributo, value: number) => void;
}

import { ClassDescription } from "../interfaces/Class";
import Skill from "../interfaces/Skills";

const INITIAL_ATTRIBUTES: Record<Atributo, number> = {
  [Atributo.FORCA]: 10,
  [Atributo.DESTREZA]: 10,
  [Atributo.CONSTITUICAO]: 10,
  [Atributo.INTELIGENCIA]: 10,
  [Atributo.SABEDORIA]: 10,
  [Atributo.CARISMA]: 10,
};

export const useCharacterStore = create<CharacterWizardState>((set, get) => ({
  step: 1,
  selectedRace: null,
  selectedClass: null,
  selectedSkills: [],
  baseAttributes: { ...INITIAL_ATTRIBUTES },
  pointsRemaining: INITIAL_POINTS,

  setStep: (step) => set({ step }),

  selectRace: (race) => {
    set({ selectedRace: race, step: 2 });
  },

  selectClass: (role) => {
    set({ selectedClass: role });
  },

  updateSkills: (skills) => {
    set({ selectedSkills: skills });
  },

  updateBaseAttribute: (attr, value) => {
    const currentBase = get().baseAttributes;

    // Create hypothetical new state
    const newBase = { ...currentBase, [attr]: value };

    // Check cost
    const totalSpent = calculateTotalPointsSpent(newBase);

    // We allow update if totalSpent <= INITIAL_POINTS
    if (totalSpent <= INITIAL_POINTS) {
      set({
        baseAttributes: newBase,
        pointsRemaining: INITIAL_POINTS - totalSpent,
      });
    }
  },
}));
