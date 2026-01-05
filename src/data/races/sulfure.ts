import Skill from "@/interfaces/Skills";
import Race from "../../interfaces/Race";
import { Atributo } from "../atributos";
import { spellsCircle1 } from "../magias/generalSpells";

const SULFURE: Race = {
  name: "Suraggel (Sulfure)",
  description:
    "Herdeiros de entidades abissais, os sulfure possuem uma beleza sombria e uma astúcia natural.",
  appearance:
    "Traços afiados, olhos de cores intensas (vermelho, violeta ou amarelo), chifres pequenos e, às vezes, caudas ou asas membranosas.",
  personality:
    "Independentes e pragmáticos, valorizam a liberdade e o poder pessoal. Muitas vezes são incompreendidos, mas leais àqueles que ganham seu respeito.",
  commonReligions:
    "Tenebra (Trevas), Kallyadranoch (Dragões) e Hyninn (Trapaça).",
  attributes: {
    attrs: [
      { attr: Atributo.DESTREZA, mod: 2 },
      { attr: Atributo.INTELIGENCIA, mod: 1 },
    ],
  },
  faithProbability: {
    AHARADAK: 1,
    KALLYADRANOCH: 1,
    TENEBRA: 1,
  },
  abilities: [
    {
      name: "Herança Divina",
      description:
        "Você é uma criatura do tipo espírito e recebe visão no escuro.",
      sheetActions: [
        {
          source: {
            type: "power",
            name: "Herança Divina",
          },
          action: {
            type: "addSense",
            sense: "Visão no Escuro",
          },
        },
      ],
    },
    {
      name: "Sombras Profanas",
      description:
        "Você recebe +2 em Enganação e Furtividade. Além disso, pode lançar Escuridão (como uma magia divina; atributo-chave Inteligência). Caso aprenda novamente essa magia, o custo para lançá-la diminui em –1 PM.",
      sheetActions: [
        {
          source: {
            type: "power",
            name: "Sombras Profanas",
          },
          action: {
            type: "learnSpell",
            availableSpells: [spellsCircle1.escuridao],
            pick: 1,
            customAttribute: Atributo.INTELIGENCIA,
          },
        },
      ],
      sheetBonuses: [
        {
          source: {
            type: "power",
            name: "Sombras Profanas",
          },
          target: {
            type: "Skill",
            name: Skill.ENGANACAO,
          },
          modifier: {
            type: "Fixed",
            value: 2,
          },
        },

        {
          source: {
            type: "power",
            name: "Sombras Profanas",
          },
          target: {
            type: "Skill",
            name: Skill.FURTIVIDADE,
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

export default SULFURE;
