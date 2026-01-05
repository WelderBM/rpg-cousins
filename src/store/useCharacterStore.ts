import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Atributo } from "../data/atributos";
import Race from "../interfaces/Race";
import Origin, { OriginBenefits } from "../interfaces/Origin";
import Divindade from "../interfaces/Divindade";
import { GeneralPower } from "../interfaces/Poderes";
import Bag from "../interfaces/Bag";
import Equipment from "../interfaces/Equipment";
import { Character } from "../interfaces/Character";
import {
  calculateTotalPointsSpent,
  INITIAL_POINTS,
} from "../utils/attributeUtils";
import { ClassDescription } from "../interfaces/Class";
import Skill from "../interfaces/Skills";

export interface CharacterSummary {
  id: string;
  name: string;
  raceName: string;
  className: string;
  level: number;
  image?: string; // For the race image
}

interface CharacterWizardState {
  step: number;
  selectedRace: Race | null;
  selectedClass: ClassDescription | null;
  selectedSkills: Skill[];

  // Draft state for Role Selection persistence
  roleSelectionState: {
    previewName: string | null; // changed to string to avoid complex object nesting issues in persistence if needed, but object is fine
    basic: Record<number, Skill>;
    classSkills: Skill[];
    generalSkills: Skill[];
  };

  selectedOrigin: Origin | null;
  originBenefits: {
    type: "skill" | "power" | "general_power";
    name: string;
    value: any;
  }[];
  selectedDeity: Divindade | null;
  selectedGrantedPowers: GeneralPower[];
  bag: Bag;
  money: number;
  baseAttributes: Record<Atributo, number>;
  pointsRemaining: number;

  // Escolhas de atributos flexíveis (para raças como Humano que têm "any")
  // Mapeia índice do bônus flexível → atributo escolhido
  flexibleAttributeChoices: Record<number, Atributo>;

  // Character Name
  name: string;

  // Multi-character support
  userCharacters: CharacterSummary[];
  activeCharacter: Character | null;

  // Actions
  setStep: (step: number) => void;
  selectRace: (race: Race) => void;
  selectClass: (role: ClassDescription) => void;
  updateSkills: (skills: Skill[]) => void;
  setRoleSelectionState: (state: {
    previewName: string | null;
    basic: Record<number, Skill>;
    classSkills: Skill[];
    generalSkills: Skill[];
  }) => void;

  selectOrigin: (origin: Origin) => void;
  setOriginBenefits: (
    benefits: {
      type: "skill" | "power" | "general_power";
      name: string;
      value: any;
    }[]
  ) => void;
  selectDeity: (deity: Divindade) => void;
  selectGrantedPowers: (powers: GeneralPower[]) => void;
  updateBaseAttribute: (attr: Atributo, value: number) => void;
  setFlexibleAttributeChoice: (index: number, attr: Atributo) => void;
  addToBag: (item: Equipment) => void;
  removeFromBag: (item: Equipment) => void;
  updateMoney: (value: number) => void;
  setName: (name: string) => void;

  // Multi-character Actions
  setUserCharacters: (list: CharacterSummary[]) => void;
  setActiveCharacter: (char: Character) => void;
  updateActiveCharacter: (updates: Partial<Character>) => void;
  clearActiveCharacter: () => void;

  // Wizard Management
  resetWizard: () => void;
}

const INITIAL_ATTRIBUTES: Record<Atributo, number> = {
  [Atributo.FORCA]: 0,
  [Atributo.DESTREZA]: 0,
  [Atributo.CONSTITUICAO]: 0,
  [Atributo.INTELIGENCIA]: 0,
  [Atributo.SABEDORIA]: 0,
  [Atributo.CARISMA]: 0,
};

export const useCharacterStore = create<CharacterWizardState>()(
  persist(
    (set, get) => ({
      step: 1,
      selectedRace: null,
      selectedClass: null,
      selectedSkills: [],

      roleSelectionState: {
        previewName: null,
        basic: {},
        classSkills: [],
        generalSkills: [],
      },

      selectedOrigin: null,
      originBenefits: [],
      selectedDeity: null,
      selectedGrantedPowers: [],
      bag: new Bag(),
      money: 100, // Default start
      baseAttributes: { ...INITIAL_ATTRIBUTES },
      pointsRemaining: INITIAL_POINTS,
      flexibleAttributeChoices: {}, // Inicialmente vazio

      name: "",
      userCharacters: [],
      activeCharacter: null,

      setStep: (step) => set({ step }),

      selectRace: (race) => {
        // Limpa escolhas flexíveis ao trocar de raça
        set({ selectedRace: race, step: 2, flexibleAttributeChoices: {} });
      },

      selectClass: (role) => {
        set({ selectedClass: role });
      },

      updateSkills: (skills) => {
        set({ selectedSkills: skills });
      },

      setRoleSelectionState: (state) => {
        set({ roleSelectionState: state });
      },

      selectOrigin: (origin) => {
        // Fixed: Do NOT clear originBenefits here, as they are part of the selection process
        set({ selectedOrigin: origin });
      },

      setOriginBenefits: (benefits) => {
        set({ originBenefits: benefits });
      },

      selectDeity: (deity) => {
        set({ selectedDeity: deity, selectedGrantedPowers: [] });
      },

      selectGrantedPowers: (powers) => {
        set({ selectedGrantedPowers: powers });
      },

      addToBag: (item) => {
        const currentBag = get().bag;
        const newBag = new Bag(currentBag.getEquipments());
        const group = item.group || "Item Geral";
        const partial: any = {};
        partial[group] = [item];
        newBag.addEquipment(partial);
        set({ bag: newBag });
      },

      removeFromBag: (item) => {
        const currentBag = get().bag;
        const equips = { ...currentBag.getEquipments() };
        const group = item.group || "Item Geral";

        if (equips[group as keyof typeof equips]) {
          const list = equips[group as keyof typeof equips];
          const idx = list.findIndex((i) => i.nome === item.nome);
          if (idx > -1) {
            list.splice(idx, 1);
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
        const newBase = { ...currentBase, [attr]: value };
        const totalSpent = calculateTotalPointsSpent(newBase);

        if (totalSpent <= INITIAL_POINTS) {
          set({
            baseAttributes: newBase,
            pointsRemaining: INITIAL_POINTS - totalSpent,
          });
        }
      },

      setFlexibleAttributeChoice: (index, attr) => {
        set((state) => ({
          flexibleAttributeChoices: {
            ...state.flexibleAttributeChoices,
            [index]: attr,
          },
        }));
      },

      setName: (name) => set({ name }),

      setUserCharacters: (list) => set({ userCharacters: list }),

      setActiveCharacter: (char) => {
        let bagInstance = char.bag;
        if (char.bag && !(char.bag instanceof Bag)) {
          bagInstance = new Bag();
          if ((char.bag as any).equipments) {
            bagInstance.setEquipments((char.bag as any).equipments);
          }
        }
        set({ activeCharacter: { ...char, bag: bagInstance } });
      },

      updateActiveCharacter: (updates) => {
        set((state) => {
          if (!state.activeCharacter) return {};
          let updatedChar = { ...state.activeCharacter, ...updates };
          if (updates.bag && !(updates.bag instanceof Bag)) {
            const newBag = new Bag();
            if ((updates.bag as any).equipments) {
              newBag.setEquipments((updates.bag as any).equipments);
            }
            updatedChar.bag = newBag;
          }
          return { activeCharacter: updatedChar };
        });
      },

      clearActiveCharacter: () => set({ activeCharacter: null }),

      resetWizard: () => {
        set({
          step: 1,
          selectedRace: null,
          selectedClass: null,
          selectedSkills: [],
          roleSelectionState: {
            previewName: null,
            basic: {},
            classSkills: [],
            generalSkills: [],
          },
          selectedOrigin: null,
          originBenefits: [],
          selectedDeity: null,
          selectedGrantedPowers: [],
          bag: new Bag(),
          money: 100,
          baseAttributes: { ...INITIAL_ATTRIBUTES },
          pointsRemaining: INITIAL_POINTS,
          flexibleAttributeChoices: {},
          name: "",
        });
      },
    }),
    {
      name: "rpg-wizard-storage",
      partialize: (state) => ({
        step: state.step,
        selectedRace: state.selectedRace,
        selectedClass: state.selectedClass,
        selectedSkills: state.selectedSkills,
        roleSelectionState: state.roleSelectionState,
        selectedOrigin: state.selectedOrigin,
        originBenefits: state.originBenefits,
        selectedDeity: state.selectedDeity,
        selectedGrantedPowers: state.selectedGrantedPowers,
        bag: state.bag,
        money: state.money,
        baseAttributes: state.baseAttributes,
        pointsRemaining: state.pointsRemaining,
        flexibleAttributeChoices: state.flexibleAttributeChoices,
        name: state.name,
        activeCharacter: state.activeCharacter,
        userCharacters: state.userCharacters,
      }),
      onRehydrateStorage: () => (state) => {
        if (state && state.bag && !(state.bag instanceof Bag)) {
          const newBag = new Bag();
          if ((state.bag as any).equipments) {
            newBag.setEquipments((state.bag as any).equipments);
          }
          state.bag = newBag;
        }

        // Rehydrate Active Character Bag
        if (
          state &&
          state.activeCharacter &&
          state.activeCharacter.bag &&
          !(state.activeCharacter.bag instanceof Bag)
        ) {
          const newCharBag = new Bag();
          const charBagData = state.activeCharacter.bag as any;
          if (charBagData.equipments) {
            newCharBag.setEquipments(charBagData.equipments);
          }
          state.activeCharacter.bag = newCharBag;
        }
      },
    }
  )
);
