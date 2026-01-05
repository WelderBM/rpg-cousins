import { Atributo } from "../data/atributos";
import Divindade from "./Divindade";
import { GeneralPower } from "./Poderes";
import Race from "./Race";
import { ClassDescription } from "./Class";
import Skill from "./Skills";
import Origin from "./Origin";
import Bag from "./Bag";

export interface CharacterAttribute {
  name: Atributo;
  value: number;
  mod: number;
}

export type CharacterAttributes = {
  [key in Atributo]: CharacterAttribute;
};

export interface CharacterReligion {
  divindade: Divindade;
  poderes: GeneralPower[];
}

export interface Character {
  id?: string;
  name: string;
  race: Race | null;
  class: ClassDescription | null;
  level: number;
  attributes: Record<Atributo, number>;
  skills: Skill[];
  origin: Origin | null;
  originBenefits: {
    type: "skill" | "power" | "general_power";
    name: string;
    value: any;
  }[];
  deity: Divindade | null;
  prohibitedObligations?: string[];
  grantedPower: GeneralPower | null;
  bag: Bag; // Note: Bag class might need serialization handling for Firestore
  money: number;
  currentPv?: number;
  currentPm?: number;
  spells?: any[]; // Placeholder if needed
}
