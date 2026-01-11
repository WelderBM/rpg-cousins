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
import CLASSES from "../data/classes";

export interface CharacterSummary {
  id: string;
  name: string;
  raceName: string;
  className: string;
  level: number;
  image?: string; // For the race image
  imageUrl?: string;
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

  generationMethod: "points" | "dice";
  setGenerationMethod: (method: "points" | "dice") => void;

  // Escolhas de atributos flexíveis (para raças como Humano que têm "any")

  // Character Name
  name: string;

  // Multi-character support
  userCharacters: CharacterSummary[];
  activeCharacter: Character | null;
  editingCharacterId: string | null;

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
  setActiveCharacter: (char: Character | null) => void;
  updateActiveCharacter: (updates: Partial<Character>) => void;
  clearActiveCharacter: () => void;

  // Wizard Management
  resetWizard: () => void;
  loadCharacterToWizard: (character: any) => void;
  setBaseAttributes: (attributes: Record<Atributo, number>) => void;
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
      bag: (function () {
        const b = new Bag();
        b.addEquipment({
          "Item Geral": [
            {
              nome: "Mochila",
              group: "Item Geral",
              preco: 2,
              spaces: 0,
              description: "Item essencial de aventureiro",
            },
            {
              nome: "Saco de dormir",
              group: "Item Geral",
              preco: 1,
              spaces: 1,
              description: "Item essencial de aventureiro",
            },
            {
              nome: "Pederneira",
              group: "Item Geral",
              preco: 1,
              spaces: 0,
              description: "Item essencial de aventureiro",
            },
            {
              nome: "Tocha",
              group: "Item Geral",
              preco: 0.1,
              spaces: 1,
              quantidade: 2,
              description: "Item essencial de aventureiro",
            },
            {
              nome: "Cantil",
              group: "Item Geral",
              preco: 1,
              spaces: 1,
              description: "Item essencial de aventureiro",
            },
            {
              nome: "Ração de viagem",
              group: "Alimentação",
              preco: 0.5,
              spaces: 1,
              quantidade: 7,
              description: "Item essencial de aventureiro",
            },
            {
              nome: "Corda (10m)",
              group: "Item Geral",
              preco: 1,
              spaces: 1,
              description: "Item essencial de aventureiro",
            },
          ],
          Vestuário: [
            {
              nome: "Traje de viajante",
              group: "Vestuário",
              preco: 10,
              spaces: 0,
              description: "Roupas iniciais",
            },
          ],
        });
        return b;
      })(),
      money: 18, // Default start
      generationMethod: "points",
      baseAttributes: { ...INITIAL_ATTRIBUTES },
      pointsRemaining: INITIAL_POINTS,
      flexibleAttributeChoices: {}, // Inicialmente vazio

      setGenerationMethod: (method) => set({ generationMethod: method }),

      name: "",
      userCharacters: [],
      activeCharacter: null,
      editingCharacterId: null,

      setStep: (step) => set({ step }),

      loadCharacterToWizard: (character: any) => {
        // Ensure bag is a proper Bag instance
        let bagInstance = new Bag();
        if (character.bag) {
          if (character.bag instanceof Bag) {
            bagInstance = character.bag;
          } else if (character.bag.equipments) {
            bagInstance.setEquipments(character.bag.equipments);
          }
        }

        // Reconstruct Wizard Drafts
        const drafts = {
          race: { previewName: character.race?.name || null },
          role: {
            previewName: character.class?.name || null,
            basic: {} as Record<number, Skill>,
            classSkills: [] as Skill[],
            generalSkills: [] as Skill[],
            classPowers: character.classPowers || [],
            localWeapons: [] as Equipment[], // Keeping empty to avoid money calc issues for now
            arcanistConfig: { subtype: null, lineage: null, damageType: null },
          },
          origin: {
            previewName: character.origin?.name || null,
            localWeapons: [] as Equipment[],
          },
          deity: {
            previewName: character.deity?.name || null,
            localPowers: character.grantedPowers || [],
          },
        };

        // Reconstruct Role Skills & Config
        if (character.class && character.skills) {
          const roleDef = CLASSES.find((c) => c.name === character.class.name);
          if (roleDef) {
            const allSkills = new Set<Skill>(character.skills);

            // 1. Remove Fixed Basic Skills (AND)
            roleDef.periciasbasicas.forEach((group) => {
              if (group.type === "and") {
                group.list.forEach((s) => allSkills.delete(s));
              }
            });

            // 2. Identify Chosen Basic Skills (OR)
            roleDef.periciasbasicas.forEach((group, idx) => {
              if (group.type === "or") {
                const found = group.list.find((s) => allSkills.has(s));
                if (found) {
                  drafts.role.basic[idx] = found;
                  allSkills.delete(found);
                }
              }
            });

            // 3. Identify Class Skills
            const availableForClass = roleDef.periciasrestantes.list;
            const classChoices = Array.from(allSkills).filter((s) =>
              availableForClass.includes(s)
            );
            drafts.role.classSkills = classChoices;
            classChoices.forEach((s) => allSkills.delete(s));

            // 4. Identify General Skills (Remaining)
            drafts.role.generalSkills = Array.from(allSkills);

            // 5. Arcanista Configuration Reconstruction (Heuristic)
            if (character.class.name === "Arcanista") {
              // Try to find subtype in features/abilities
              // This is tricky without explicit storage, but we can try to infer from abilities
              // For now, leaving as null might force user to re-select if they open the config
              // but at least skills are saved.
            }
          }
        }

        // Calculate points remaining based on loaded attributes
        const loadedBaseAttributes = character.baseAttributes || {
          ...INITIAL_ATTRIBUTES,
        };
        const totalSpent = calculateTotalPointsSpent(loadedBaseAttributes);
        const calculatedPointsRemaining = INITIAL_POINTS - totalSpent;

        set({
          editingCharacterId: character.id,
          step: 1, // Start at Race Selection
          name: character.name || "",
          selectedRace: character.race || null,
          selectedClass: character.class || null,
          selectedSkills: character.skills || [],
          selectedOrigin: character.origin || null,
          originBenefits: character.originBenefits || [],
          selectedDeity: character.deity || null,
          selectedGrantedPowers: character.grantedPowers || [],
          selectedClassPowers: character.classPowers || [],
          bag: bagInstance,
          money: character.money ?? 0,
          baseAttributes: loadedBaseAttributes,
          pointsRemaining: calculatedPointsRemaining,
          flexibleAttributeChoices: character.flexibleAttributeChoices || {},
          selectedClassWeapons: [],
          selectedOriginWeapons: [],
          wizardDrafts: drafts,
        });
      },

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

        // For point buy, we still want to keep pointsRemaining updated
        const totalSpent = calculateTotalPointsSpent(newBase);
        set({
          baseAttributes: newBase,
          pointsRemaining: INITIAL_POINTS - totalSpent,
        });
      },

      setBaseAttributes: (attributes) => {
        const totalSpent = calculateTotalPointsSpent(attributes);
        set({
          baseAttributes: attributes,
          pointsRemaining: INITIAL_POINTS - totalSpent,
        });
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
          editingCharacterId: null,
          step: 1,
          generationMethod: "points",
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
          money: 18,
          baseAttributes: { ...INITIAL_ATTRIBUTES },
          pointsRemaining: INITIAL_POINTS,
          flexibleAttributeChoices: {},
          name: "",
          bag: (function () {
            const b = new Bag();
            b.addEquipment({
              "Item Geral": [
                {
                  nome: "Mochila",
                  group: "Item Geral",
                  preco: 2,
                  spaces: 0,
                  description: "Item essencial de aventureiro",
                },
                {
                  nome: "Saco de dormir",
                  group: "Item Geral",
                  preco: 1,
                  spaces: 1,
                  description: "Item essencial de aventureiro",
                },
                {
                  nome: "Pederneira",
                  group: "Item Geral",
                  preco: 1,
                  spaces: 0,
                  description: "Item essencial de aventureiro",
                },
                {
                  nome: "Tocha",
                  group: "Item Geral",
                  preco: 0.1,
                  spaces: 1,
                  quantidade: 2,
                  description: "Item essencial de aventureiro",
                },
                {
                  nome: "Cantil",
                  group: "Item Geral",
                  preco: 1,
                  spaces: 1,
                  description: "Item essencial de aventureiro",
                },
                {
                  nome: "Ração de viagem",
                  group: "Alimentação",
                  preco: 0.5,
                  spaces: 1,
                  quantidade: 7,
                  description: "Item essencial de aventureiro",
                },
                {
                  nome: "Corda (10m)",
                  group: "Item Geral",
                  preco: 1,
                  spaces: 1,
                  description: "Item essencial de aventureiro",
                },
              ],
              Vestuário: [
                {
                  nome: "Traje de viajante",
                  group: "Vestuário",
                  preco: 10,
                  spaces: 0,
                  description: "Roupas iniciais",
                },
              ],
            });
            return b;
          })(),
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
        generationMethod: state.generationMethod,
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
