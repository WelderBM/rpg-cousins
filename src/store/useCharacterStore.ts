import { create } from "zustand";
import { Atributo } from "../data/atributos";
import Race from "../interfaces/Race";
import Origin, { OriginBenefits } from "../interfaces/Origin";
import Divindade from "../interfaces/Divindade";
import { GeneralPower } from "../interfaces/Poderes";
import Bag from "../interfaces/Bag";
import Equipment from "../interfaces/Equipment";
import {
  calculateTotalPointsSpent,
  INITIAL_POINTS,
} from "../utils/attributeUtils";

interface CharacterWizardState {
  step: number;
  selectedRace: Race | null;
  selectedClass: ClassDescription | null;
  selectedSkills: Skill[];
  selectedOrigin: Origin | null;
  originBenefits: {
    type: "skill" | "power" | "general_power";
    name: string;
    value: any;
  }[];
  selectedDeity: Divindade | null;
  selectedGrantedPower: GeneralPower | null;
  bag: Bag;
  money: number;
  baseAttributes: Record<Atributo, number>;
  pointsRemaining: number;

  // Actions
  setStep: (step: number) => void;
  selectRace: (race: Race) => void;
  selectClass: (role: ClassDescription) => void;
  updateSkills: (skills: Skill[]) => void;
  selectOrigin: (origin: Origin) => void;
  setOriginBenefits: (
    benefits: {
      type: "skill" | "power" | "general_power";
      name: string;
      value: any;
    }[]
  ) => void;
  selectDeity: (deity: Divindade) => void;
  selectGrantedPower: (power: GeneralPower) => void;
  updateBaseAttribute: (attr: Atributo, value: number) => void;
  addToBag: (item: Equipment) => void;
  removeFromBag: (item: Equipment) => void;
  updateMoney: (value: number) => void;
}

import { ClassDescription } from "../interfaces/Class";
import Skill from "../interfaces/Skills";

const INITIAL_ATTRIBUTES: Record<Atributo, number> = {
  [Atributo.FORCA]: 0,
  [Atributo.DESTREZA]: 0,
  [Atributo.CONSTITUICAO]: 0,
  [Atributo.INTELIGENCIA]: 0,
  [Atributo.SABEDORIA]: 0,
  [Atributo.CARISMA]: 0,
};

export const useCharacterStore = create<CharacterWizardState>((set, get) => ({
  step: 1,
  selectedRace: null,
  selectedClass: null,
  selectedSkills: [],
  selectedOrigin: null,
  originBenefits: [],
  selectedDeity: null,
  selectedGrantedPower: null,
  bag: new Bag(),
  money: 100, // Default start
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

  selectOrigin: (origin) => {
    set({ selectedOrigin: origin, originBenefits: [] });
  },

  setOriginBenefits: (benefits) => {
    set({ originBenefits: benefits });
  },

  selectDeity: (deity) => {
    set({ selectedDeity: deity, selectedGrantedPower: null });
  },

  selectGrantedPower: (power) => {
    set({ selectedGrantedPower: power });
  },

  addToBag: (item) => {
    const currentBag = get().bag;
    // We need to clone or create new because it's a class with mutation methods
    // However, Bag class mutation might not trigger reactivity if we don't set new instance
    // Or we use Immer. Zustand works with immutability.

    // Bag.addEquipment merges. Let's create a new bag from current
    const newBag = new Bag(currentBag.getEquipments());

    // Need to format item for addEquipment.
    // addEquipment takes Partial<BagEquipments> which is { [Group]: Equipment[] }
    // Item has 'group' property.

    // Map internal 'group' names like 'Arma', 'Armadura', 'Item Geral' to Bag keys if different?
    // Bag keys: 'Item Geral', 'Arma', 'Armadura', 'Escudo', 'Alimentação', etc.
    // They seem to match.

    // Logic to add:
    const group = item.group || "Item Geral";
    // TS might complain about dynamic key if not cast
    const partial: any = {};
    partial[group] = [item];

    newBag.addEquipment(partial);
    set({ bag: newBag });
  },

  removeFromBag: (item) => {
    // Current Bag class doesn't have explicit remove single item method exposed in snippet?
    // Snippet shows addEquipment merge logic.
    // We might need to manually filter Equipments.

    const currentBag = get().bag;
    const equips = { ...currentBag.getEquipments() };
    const group = item.group || "Item Geral";

    if (equips[group as keyof typeof equips]) {
      const list = equips[group as keyof typeof equips];
      const idx = list.findIndex((i) => i.nome === item.nome);
      if (idx > -1) {
        list.splice(idx, 1);
        // Re-instantiate
        const newBag = new Bag(equips);
        set({ bag: newBag });
      }
    }
  },

  updateMoney: (val) => {
    set({ money: val });
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
