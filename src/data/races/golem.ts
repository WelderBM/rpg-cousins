import Race from "../../interfaces/Race";
import { Atributo } from "../atributos";

const GOLEM: Race = {
  name: "Golem",
  description:
    "Construtos dotados de consciência, criados para servir mas capazes de forjar seu próprio destino.",
  appearance:
    "Formas humanoides feitas de pedra, metal, barro ou madeira, com símbolos mágicos gravados em seus corpos e um núcleo pulsante de energia.",
  personality:
    "Lógicos e focados, golens aprendem sobre emoções e individualidade conforme interagem com o mundo, sendo extremamente leais aos seus ideais.",
  commonReligions: "Geralmente nenhuma, ou a de seu criador.",
  attributes: {
    attrs: [
      { attr: Atributo.FORCA, mod: 2 },
      { attr: Atributo.CONSTITUICAO, mod: 1 },
      { attr: Atributo.CARISMA, mod: -1 },
    ],
  },
  faithProbability: {
    AHARADAK: 1,
    TANNATOH: 1,
    WYNNA: 1,
  },
  getDisplacement: () => 6,
  abilities: [
    {
      name: "Canalizar Reparos",
      description:
        "Como uma ação completa, você pode gastar pontos de mana para recuperar pontos de vida, à taxa de 5 PV por PM.",
    },
    {
      name: "Chassi",
      description:
        "Seu corpo artificial é resistente, mas rígido. Você recebe +2 na Defesa, mas possui penalidade de armadura –2 e seu deslocamento é 6m. Você leva um dia para vestir ou remover uma armadura (pois precisa acoplar as peças dela a seu chassi).",
      sheetBonuses: [
        {
          source: {
            type: "power",
            name: "Chassi",
          },
          target: {
            type: "Defense",
          },
          modifier: {
            type: "Fixed",
            value: 2,
          },
        },
        {
          source: {
            type: "power",
            name: "Chassi",
          },
          target: {
            type: "ArmorPenalty",
          },
          modifier: {
            type: "Fixed",
            value: 2,
          },
        },
        {
          source: {
            type: "power",
            name: "Chassi",
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
      name: "Criatura Artificial",
      description:
        "Você é uma criatura do tipo construto. Recebe visão no escuro e imunidade a doenças, fadiga, sangramento, sono e venenos. Além disso, não precisa respirar, alimentar-se ou dormir. Por fim, não recupera pontos de vida por descanso e não se beneficia de habilidades de cura e itens ingeríveis (comidas, poções etc.). Você precisa ficar inerte por oito horas por dia para recarregar sua fonte de energia. Se fizer isso, recupera PM por descanso em condições normais (golens não são afetados por condições boas ou ruins de descanso).",
      sheetActions: [
        {
          source: {
            type: "power",
            name: "Criatura Artificial",
          },
          action: {
            type: "addSense",
            sense: "Visão no escuro",
          },
        },
        {
          source: {
            type: "power",
            name: "Criatura Artificial",
          },
          action: {
            type: "addSense",
            sense: "Imunidade a doenças, fadiga, sangramento, sono e venenos",
          },
        },
      ],
    },
    {
      name: "Espírito Elemental",
      description:
        "Escolha entre água (frio), ar (eletricidade), fogo (fogo) e terra (ácido). Você é imune a dano causado por essa energia. Se fosse sofrer dano mágico dessa energia, em vez disso cura PV em quantidade igual à metade do dano. Por exemplo, se um golem com espírito elemental do fogo é atingido por uma Bola de Fogo que causa 30 pontos de dano, em vez de sofrer esse dano, ele recupera 15 PV.",
    },
  ],
};

export default GOLEM;
