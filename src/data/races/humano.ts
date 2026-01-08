import Race from "../../interfaces/Race";

const HUMANO: Race = {
  name: "Humano",
  description:
    "A raça mais versátil e ambiciosa de Arton, capaz de grandes feitos em qualquer caminho que escolher.",
  appearance:
    "Extremamente variada em altura, compleição, cor de pele e traços físicos, refletindo sua adaptabilidade a todos os climas e regiões de Arton.",
  personality:
    "Movidos por uma ambição insaciável e curiosidade sem limites, humanos são conhecidos por sua determinação e pela capacidade de se ajustar a qualquer situação.",
  commonReligions:
    "Qualquer divindade do Panteão, com destaque para Valkaria (Deusa da Ambição).",
  attributes: {
    attrs: [
      { attr: "any", mod: 1 },
      { attr: "any", mod: 1 },
      { attr: "any", mod: 1 },
    ],
  },
  faithProbability: {
    AHARADAK: 1,
    VALKARIA: 1,
    THWOR: 1,
  },
  abilities: [
    {
      name: "Versátil",
      description:
        "Você se torna treinado em duas perícias a sua escolha (não precisam ser da sua classe). Você pode trocar uma dessas perícias por um poder geral a sua escolha.",
      sheetActions: [
        {
          source: {
            type: "power",
            name: "Versátil",
          },
          action: {
            type: "special",
            specialAction: "humanoVersatil",
          },
        },
      ],
    },
  ],
};

export default HUMANO;
