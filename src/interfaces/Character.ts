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
  value: {
    base: number;
    bonus: number;
    sources: string[];
    total: number;
  };
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
  ownerNickname?: string; // For Master View grouping
  isFavorite?: boolean; // For Master View filtering
  imageUrl?: string; // Custom character art
  physicalTraits?: {
    gender?: string;
    hair?: string;
    eyes?: string;
    skin?: string;
    scars?: string;
    height?: string;
    extra?: string;
  };
  name: string;
  race: Race | null;
  class: ClassDescription | null;
  level: number;
  attributes: CharacterAttributes;
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
  classPowers?: any[];
}
