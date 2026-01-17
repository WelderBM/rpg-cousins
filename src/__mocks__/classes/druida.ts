import CharacterSheet from "../../interfaces/CharacterSheet";
import Race from "../../interfaces/Race";
import CLASSE_DRUIDA from "../../data/classes/druida";
import { createMockCharacterSheet } from "../characterSheet";
import { CharacterAttributes } from "@/interfaces/Character";

export const druida = (
  race: Race,
  atributos?: CharacterAttributes
): CharacterSheet => {
  return createMockCharacterSheet({
    raca: race,
    classe: CLASSE_DRUIDA,
    atributos,
  });
};
