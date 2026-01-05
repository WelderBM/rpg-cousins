import Skill from "@/interfaces/Skills";
import Race from "../../interfaces/Race";
import { Atributo } from "../atributos";
import PROFICIENCIAS from "../proficiencias";
import { SKILLS_WITHOUT_OFICIO_QUALQUER } from "../pericias";

const KLIREN: Race = {
  name: "Kliren",
  description:
    "Seres curiosos e inventivos, frutos da união entre gnomos e humanos, sempre em busca de inovação.",
  appearance:
    "Possuem a estatura humana, mas traços gnomicos como orelhas pontudas, cabelos de cores vibrantes e um brilho de curiosidade nos olhos.",
  personality:
    "Inteligentes, criativos e muitas vezes excêntricos, os kliren veem o mundo como um quebra-cabeça a ser resolvido ou melhorado.",
  commonReligions:
    "Tannatoh (Conhecimento), Valkaria (Ambição) e Hyninn (Trapaça).",
  attributes: {
    attrs: [
      { attr: Atributo.INTELIGENCIA, mod: 2 },
      { attr: "any", mod: 1 },
      { attr: "any", mod: 1 },
    ],
  },
  faithProbability: {
    AHARADAK: 1,
    TANNATOH: 1,
    THWOR: 1,
  },
  abilities: [
    {
      name: "Híbrido",
      description:
        "Sua natureza multifacetada fez com que você aprendesse conhecimentos variados. Você se torna treinado em uma perícia a sua escolha (não precisa ser da sua classe).",
      sheetActions: [
        {
          source: {
            type: "power",
            name: "Híbrido",
          },
          action: {
            type: "learnSkill",
            availableSkills: SKILLS_WITHOUT_OFICIO_QUALQUER,
            pick: 1,
          },
        },
      ],
    },
    {
      name: "Engenhosidade",
      description:
        "Quando faz um teste de perícia, você pode gastar 2 PM para somar sua Inteligência no teste. Você não pode usar esta habilidade em testes de ataque. Caso receba esta habilidade novamente, seu custo é reduzido em –1 PM.",
    },
    {
      name: "Vanguardista",
      description:
        "Você recebe proficiência em armas de fogo e +2 em testes de Ofício (um qualquer, a sua escolha).",
      sheetActions: [
        {
          source: {
            type: "power",
            name: "Vanguardista",
          },
          action: {
            type: "addProficiency",
            availableProficiencies: [PROFICIENCIAS.FOGO],
            pick: 1,
          },
        },
      ],
      sheetBonuses: [
        {
          source: {
            type: "power",
            name: "Vanguardista",
          },
          target: {
            type: "Skill",
            name: Skill.OFICIO,
          },
          modifier: {
            type: "Fixed",
            value: 2,
          },
        },
      ],
    },
  ],
};

export default KLIREN;
