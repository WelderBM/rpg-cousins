import CharacterSheet from "../interfaces/CharacterSheet";
import HUMANO from "../data/races/humano";
import CLASS_GUERREIRO from "../data/classes/guerreiro";
import attributes from "./attributes";
import Bag from "../interfaces/Bag";
import { getClassBaseSkills, getRemainingSkills } from "../data/pericias";
import { getAttributesSkills, applyRaceAbilities } from "../functions/general";

export const createMockCharacterSheet = (
  overrides: Partial<CharacterSheet> = {}
): CharacterSheet => {
  const raca = overrides.raca || { ...HUMANO };
  const classe = overrides.classe || { ...CLASS_GUERREIRO };
  const attrs = overrides.atributos || { ...attributes };

  const baseSkills = getClassBaseSkills(classe);
  const remainingSkills = getRemainingSkills(baseSkills, classe);
  const attrSkills = getAttributesSkills(attrs, [
    ...baseSkills,
    ...remainingSkills,
  ]);
  const initialSkills = [...baseSkills, ...remainingSkills, ...attrSkills];

  return {
    ...overrides,
    id: "mock-id",
    nome: "Mock Character",
    sexo: "Homem",
    nivel: 1,
    raca,
    classe,
    skills: initialSkills,
    pv: 20,
    pm: 3,
    sheetBonuses: [],
    sheetActionHistory: [],
    defesa: 10,
    displacement: 9,
    size: "Médio",
    maxSpaces: 10,
    generalPowers: [],
    classPowers: [],
    steps: [],
    spells: [],
    bag: new Bag(),
    origin: undefined,
    atributos: attrs,
  };
};
