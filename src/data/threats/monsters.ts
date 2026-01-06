import {
  ChallengeLevel,
  ThreatRole,
  ThreatType,
  ThreatSize,
} from "../../interfaces/ThreatSheet";
import { Atributo } from "../atributos";

// Real Monster Data
export const THREATS_DB = [
  {
    name: "Lobo Caçador",
    type: ThreatType.ANIMAL,
    size: ThreatSize.MEDIO,
    role: ThreatRole.SOLO,
    nd: ChallengeLevel.HALF,
    displacement: "12m",
    attributes: {
      [Atributo.FORCA]: 2,
      [Atributo.DESTREZA]: 3,
      [Atributo.CONSTITUICAO]: 2,
      [Atributo.INTELIGENCIA]: -4,
      [Atributo.SABEDORIA]: 2,
      [Atributo.CARISMA]: -2,
    },
    skills: {
      Iniciativa: 6,
      Percepção: 4,
      Sobrevivência: 4,
    },
    resistanceAssignments: {
      Fortitude: "strong",
      Reflexos: "medium",
      Vontade: "weak",
    },
  },
  {
    name: "Zumbi de Sangue",
    type: ThreatType.MORTO_VIVO,
    size: ThreatSize.MEDIO,
    role: ThreatRole.LACAIO,
    nd: ChallengeLevel.ONE,
    displacement: "6m",
    attributes: {
      [Atributo.FORCA]: 4,
      [Atributo.DESTREZA]: 0,
      [Atributo.CONSTITUICAO]: 3,
      [Atributo.INTELIGENCIA]: -5,
      [Atributo.SABEDORIA]: 0,
      [Atributo.CARISMA]: -4,
    },
    skills: {
      Iniciativa: 2,
      Fortitude: 8,
    },
    resistanceAssignments: {
      Fortitude: "strong",
      Reflexos: "weak",
      Vontade: "medium",
    },
  },
  {
    name: "Verme do Deserto",
    type: ThreatType.MONSTRO,
    size: ThreatSize.GRANDE,
    role: ThreatRole.SOLO,
    nd: ChallengeLevel.FIVE,
    displacement: "9m, escavar 9m",
    attributes: {
      [Atributo.FORCA]: 6,
      [Atributo.DESTREZA]: 1,
      [Atributo.CONSTITUICAO]: 5,
      [Atributo.INTELIGENCIA]: -4,
      [Atributo.SABEDORIA]: 1,
      [Atributo.CARISMA]: -4,
    },
    skills: {
      Iniciativa: 5,
      Percepção: 8,
      Fortitude: 12,
    },
    resistanceAssignments: {
      Fortitude: "strong",
      Reflexos: "weak",
      Vontade: "medium",
    },
  },
];
