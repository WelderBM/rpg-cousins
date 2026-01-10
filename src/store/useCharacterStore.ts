import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { cloneDeep } from "lodash";
import { Atributo } from "../data/atributos";
import Race from "../interfaces/Race";
import Origin, { OriginBenefits } from "../interfaces/Origin";
import Divindade from "../interfaces/Divindade";
import { GeneralPower } from "../interfaces/Poderes";
import Bag from "../interfaces/Bag";
import Equipment, { BagEquipments } from "../interfaces/Equipment";
import { Character } from "../interfaces/Character";
import {
  calculateTotalPointsSpent,
  INITIAL_POINTS,
} from "../utils/attributeUtils";
import { ClassDescription, ClassPower } from "../interfaces/Class";
import Skill from "../interfaces/Skills";
import { ArcanistaSubtypes } from "../data/classes/arcanista";

export interface CharacterSummary {
  id: string;
  name: string;
  raceName: string;
  className: string;
  level: number;
  image?: string; // For the race image
  isFavorite?: boolean;
}

interface CharacterWizardState {
  step: number;
  selectedRace: Race | null;
  selectedClass: ClassDescription | null;
  selectedSkills: Skill[];
  selectedClassWeapons: Equipment[];
  selectedOriginWeapons: Equipment[];

  // Draft state for persistence across all wizard steps
  wizardDrafts: {
    race: {
      previewName: string | null;
    };
    role: {
      previewName: string | null;
      basic: Record<number, Skill>;
      classSkills: Skill[];
      generalSkills: Skill[];
      classPowers: ClassPower[];
      localWeapons: Equipment[];
      arcanistConfig: {
        subtype: ArcanistaSubtypes | null;
        lineage: string | null;
        damageType: string | null;
      };
    };
    origin: {
      previewName: string | null;
      localWeapons: Equipment[];
    };
    deity: {
      previewName: string | null;
      localPowers: GeneralPower[];
    };
  };

  selectedOrigin: Origin | null;
  originBenefits: {
    type: "skill" | "power" | "general_power";
    name: string;
    value: any;
  }[];
  selectedDeity: Divindade | null;
  selectedGrantedPowers: GeneralPower[];
  selectedClassPowers: ClassPower[];
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
  setSelectedClassWeapons: (weapons: Equipment[]) => void;
  setSelectedOriginWeapons: (weapons: Equipment[]) => void;
  setWizardDraft: (
    step: "race" | "role" | "origin" | "deity",
    data: any
  ) => void;

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
  selectClassPowers: (powers: ClassPower[]) => void;
  updateBaseAttribute: (attr: Atributo, value: number) => void;
  setFlexibleAttributeChoice: (index: number, attr: Atributo) => void;
  addToBag: (item: Equipment) => void;
  removeFromBag: (item: Equipment) => void;
  updateItemQuantity: (item: Equipment, delta: number) => void;
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
      selectedClassWeapons: [],
      selectedOriginWeapons: [],

      wizardDrafts: {
        race: { previewName: null },
        role: {
          previewName: null,
          basic: {},
          classSkills: [],
          generalSkills: [],
          classPowers: [],
          localWeapons: [],
          arcanistConfig: { subtype: null, lineage: null, damageType: null },
        },
        origin: { previewName: null, localWeapons: [] },
        deity: { previewName: null, localPowers: [] },
      },

      selectedOrigin: null,
      originBenefits: [],
      selectedDeity: null,
      selectedGrantedPowers: [],
      selectedClassPowers: [],
      bag: new Bag(),
      money: 18, // Default start
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

      setSelectedClassWeapons: (weapons) => {
        set({ selectedClassWeapons: weapons });
      },

      setSelectedOriginWeapons: (weapons) => {
        set({ selectedOriginWeapons: weapons });
      },

      setWizardDraft: (step, data) => {
        set((state) => ({
          wizardDrafts: {
            ...state.wizardDrafts,
            [step]: { ...state.wizardDrafts[step], ...data },
          },
        }));
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

      selectClassPowers: (powers) => {
        set({ selectedClassPowers: powers });
      },

      addToBag: (item) => {
        const state = get();
        const updates: Partial<CharacterWizardState> = {};
        const group = item.group || "Item Geral";
        const partial: any = {};
        partial[group] = [item];

        // If we have an active character, we are likely in the Market or Character Sheet.
        // We should ONLY update the active character, NOT the wizard draft bag.
        if (state.activeCharacter) {
          const charBag =
            state.activeCharacter.bag instanceof Bag
              ? state.activeCharacter.bag
              : new Bag((state.activeCharacter.bag as any)?.equipments);

          const newCharBag = new Bag(charBag.getEquipments());
          newCharBag.addEquipment(partial);
          updates.activeCharacter = {
            ...state.activeCharacter,
            bag: newCharBag,
          };
        } else {
          // ONLY update Wizard Bag if NO active character is being used
          const currentBag = state.bag;
          const newBag = new Bag(currentBag.getEquipments());
          newBag.addEquipment(partial);
          updates.bag = newBag;
        }

        set(updates);
      },

      removeFromBag: (item) => {
        const state = get();
        const updates: Partial<CharacterWizardState> = {};
        const group = item.group || "Item Geral";
        const groupKey = group as keyof BagEquipments;

        if (state.activeCharacter) {
          const charBag =
            state.activeCharacter.bag instanceof Bag
              ? state.activeCharacter.bag
              : new Bag((state.activeCharacter.bag as any)?.equipments);
          const charEquips = cloneDeep(charBag.getEquipments());

          if (charEquips[groupKey]) {
            const list = charEquips[groupKey];
            const idx = list.findIndex((i) => i.nome === item.nome);
            if (idx > -1) {
              const existing = list[idx];
              if ((existing.quantidade || 1) > 1) {
                existing.quantidade = (existing.quantidade || 1) - 1;
              } else {
                list.splice(idx, 1);
              }
              updates.activeCharacter = {
                ...state.activeCharacter,
                bag: new Bag(charEquips),
              };
            }
          }
        } else {
          // Update Wizard Bag ONLY if NO active character
          const currentBag = state.bag;
          const equips = cloneDeep(currentBag.getEquipments());

          if (equips[groupKey]) {
            const list = equips[groupKey];
            const idx = list.findIndex((i) => i.nome === item.nome);
            if (idx > -1) {
              const existing = list[idx];
              if ((existing.quantidade || 1) > 1) {
                existing.quantidade = (existing.quantidade || 1) - 1;
              } else {
                list.splice(idx, 1);
              }
              updates.bag = new Bag(equips);
            }
          }
        }

        if (Object.keys(updates).length > 0) {
          set(updates);
        }
      },

      updateItemQuantity: (item, delta) => {
        const state = get();
        const updates: Partial<CharacterWizardState> = {};
        const group = item.group || "Item Geral";
        const groupKey = group as keyof BagEquipments;

        if (state.activeCharacter) {
          const charBag =
            state.activeCharacter.bag instanceof Bag
              ? state.activeCharacter.bag
              : new Bag((state.activeCharacter.bag as any)?.equipments);
          const charEquips = cloneDeep(charBag.getEquipments());

          // Ensure group array exists
          if (!charEquips[groupKey]) {
            (charEquips as any)[groupKey] = [];
          }

          if (charEquips[groupKey]) {
            const list = charEquips[groupKey];
            const idx = list.findIndex((i) => i.nome === item.nome);
            if (idx > -1) {
              const existing = list[idx];
              const newQty = (existing.quantidade || 1) + delta;
              if (newQty > 0) {
                existing.quantidade = newQty;
              } else {
                list.splice(idx, 1);
              }
              updates.activeCharacter = {
                ...state.activeCharacter,
                bag: new Bag(charEquips),
              };
            } else if (delta > 0) {
              const newItem = { ...item, quantidade: delta };
              list.push(newItem as any);
              updates.activeCharacter = {
                ...state.activeCharacter,
                bag: new Bag(charEquips),
              };
            }
          }
        } else {
          // Update Wizard Bag ONLY if NO active character
          const currentBag = state.bag;
          const equips = cloneDeep(currentBag.getEquipments());

          if (!equips[groupKey]) {
            (equips as any)[groupKey] = [];
          }

          if (equips[groupKey]) {
            const list = equips[groupKey];
            const idx = list.findIndex((i) => i.nome === item.nome);
            if (idx > -1) {
              const existing = list[idx];
              const newQty = (existing.quantidade || 1) + delta;
              if (newQty > 0) {
                existing.quantidade = newQty;
              } else {
                list.splice(idx, 1);
              }
              updates.bag = new Bag(equips);
            } else if (delta > 0) {
              const newItem = { ...item, quantidade: delta };
              list.push(newItem as any);
              updates.bag = new Bag(equips);
            }
          }
        }

        if (Object.keys(updates).length > 0) {
          set(updates);
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
        if (!char) {
          set({ activeCharacter: null });
          return;
        }
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
          selectedClassWeapons: [],
          selectedOriginWeapons: [],
          wizardDrafts: {
            race: { previewName: null },
            role: {
              previewName: null,
              basic: {},
              classSkills: [],
              generalSkills: [],
              classPowers: [],
              localWeapons: [],
              arcanistConfig: {
                subtype: null,
                lineage: null,
                damageType: null,
              },
            },
            origin: { previewName: null, localWeapons: [] },
            deity: { previewName: null, localPowers: [] },
          },
          selectedOrigin: null,
          originBenefits: [],
          selectedDeity: null,
          selectedGrantedPowers: [],
          selectedClassPowers: [],
          bag: new Bag(),
          money: 18,
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
        selectedClassWeapons: state.selectedClassWeapons,
        selectedOriginWeapons: state.selectedOriginWeapons,
        selectedOrigin: state.selectedOrigin,
        originBenefits: state.originBenefits,
        selectedDeity: state.selectedDeity,
        selectedGrantedPowers: state.selectedGrantedPowers,
        selectedClassPowers: state.selectedClassPowers,
        bag: state.bag,
        money: state.money,
        baseAttributes: state.baseAttributes,
        pointsRemaining: state.pointsRemaining,
        flexibleAttributeChoices: state.flexibleAttributeChoices,
        wizardDrafts: state.wizardDrafts,
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
