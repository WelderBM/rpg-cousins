import CharacterSheet from "../../interfaces/CharacterSheet";
import Race from "../../interfaces/Race";
import CLASSE_INVENTOR from "../../data/classes/inventor";
import { createMockCharacterSheet } from "../characterSheet";
import { CharacterAttributes } from "@/interfaces/Character";

export const inventor = (
  race: Race,
  atributos?: CharacterAttributes
): CharacterSheet => {
  return createMockCharacterSheet({
    raca: race,
    classe: CLASSE_INVENTOR,
    atributos,
  });
};
