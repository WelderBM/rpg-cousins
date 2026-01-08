import Equipment from "./Equipment";
import { OriginPower, GeneralPower, PowerGetter } from "./Poderes";
import Skill from "./Skills";

export interface OriginBenefits {
  powers: {
    origin: OriginPower[];
    general: PowerGetter[];
  };
  skills: Skill[];
}

export interface Items {
  equipment: Equipment | string;
  qtd?: number;
  description?: string;
  choice?: string; // Para indicar que o item pode ser escolhido de um grupo (ex: "Armas Marciais")
}

interface Origin {
  name: string;
  pericias: Skill[];
  poderes: (OriginPower | GeneralPower)[];
  getPowersAndSkills?: (usedSkills: Skill[], origin: Origin) => OriginBenefits;
  getItems: () => Items[];
}

export default Origin;
