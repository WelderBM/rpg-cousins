import Race from "../../interfaces/Race";
import { Atributo } from "../atributos";

// const DWARF_WEAPONS = [
//   Armas.MACHADO_DE_BATALHA.nome,
//   Armas.MACHADO_DE_GUERRA.nome,
//   Armas.MACHADO_ANAO.nome,
//   Armas.MACHADO_TAURICO.nome,
//   Armas.MARTELO_DE_GUERRA.nome,
//   Armas.PICARETA.nome,
// ];

const ANAO: Race = {
  name: "Anão",
  description:
    "Criaturas robustas e leais, moldadas pelas rochas e pela tradição.",
  appearance:
    "Robustos e baixos (entre 1,20m e 1,50m), com pele em tons de terra e olhos escuros. Homens ostentam barbas longas e trançadas que são fonte de imenso orgulho; mulheres usam cabelos igualmente ornamentados.",
  personality:
    "Teimosos como a rocha e leais como o aço, anões valorizam tradição, honra e trabalho duro. São conhecidos por sua paciência lendária para o artesanato e memória implacável para ofensas.",
  commonReligions:
    "Khalmyr (Justiça), Tenebra (Trevas e Artesanato) e Arsenal (Guerra).",
  attributes: {
    attrs: [
      { attr: Atributo.CONSTITUICAO, mod: 2 },
      { attr: Atributo.SABEDORIA, mod: 1 },
      { attr: Atributo.DESTREZA, mod: -1 },
    ],
  },
  faithProbability: {
    AHARADAK: 1,
    ARSENAL: 1,
    KHALMYR: 1,
    LINWU: 1,
    THWOR: 1,
    TENEBRA: 1,
  },
  getDisplacement: () => 6,
  abilities: [
    {
      name: "Conhecimento das Rochas",
      description:
        "Você recebe visão no escuro e +2 em testes de Percepção e Sobrevivência realizados no subterrâneo.",
      sheetActions: [
        {
          source: {
            type: "power",
            name: "Conhecimento das Rochas",
          },
          action: {
            type: "addSense",
            sense: "Visão no Escuro",
          },
        },
      ],
    },
    {
      name: "Devagar e Sempre",
      description:
        "Seu deslocamento é 6m (em vez de 9m). Porém, seu deslocamento não é reduzido por uso de armadura ou excesso de carga.",
      sheetBonuses: [
        {
          source: {
            type: "power",
            name: "Devagar e Sempre",
          },
          target: {
            type: "Displacement",
          },
          modifier: {
            type: "Fixed",
            value: -3,
          },
        },
      ],
    },
    {
      name: "Tradição de Heredrimm",
      description:
        "Você é perito nas armas tradicionais anãs, seja por ter treinado com elas, seja por usá-las como ferramentas de ofício. Para você, todos os machados, martelos, marretas e picaretas são armas simples. Você recebe +2 em ataques com essas armas.",
      sheetBonuses: [
        {
          source: {
            type: "race",
            raceName: "Anão",
          },
          target: {
            type: "WeaponAttack",
            weaponTags: ["heredrimm"],
          },
          modifier: {
            type: "Fixed",
            value: 2,
          },
        },
      ],
      // action(sheet: CharacterSheet, substeps: SubStep[]): CharacterSheet {
      //   const cloneSheet = _.cloneDeep(sheet);

      //   cloneSheet.bag.equipments.Arma = cloneSheet.bag.equipments.Arma.map(
      //     (equipment) => {
      //       if (DWARF_WEAPONS.includes(equipment.nome)) {
      //         return {
      //           ...equipment,
      //           tipo: 'Simples',
      //           atkBonus: (equipment.atkBonus || 0) + 2,
      //         };
      //       }
      //       return equipment;
      //     }
      //   );

      //   substeps.push({
      //     name: 'Tradição de Heredrimm',
      //     value: `+2 em ataques com armas simples anãs`,
      //   });

      //   return cloneSheet;
      // },
    },
    {
      name: "Duro com Pedra",
      description:
        "Você recebe +3 pontos de vida no 1º nível e +1 por nível seguinte.",
      sheetBonuses: [
        {
          source: {
            type: "power",
            name: "Duro com Pedra",
          },
          target: {
            type: "PV",
          },
          modifier: {
            type: "LevelCalc",
            formula: "{level} + 2",
          },
        },
      ],
    },
  ],
};

export default ANAO;
