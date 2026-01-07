import Divindade from "../../interfaces/Divindade";
import GRANTED_POWERS from "../powers/grantedPowers";

const KALLYADRANOCH: Divindade = {
  name: "Kallyadranoch",
  poderes: [
    GRANTED_POWERS.AURA_DE_MEDO,
    GRANTED_POWERS.ESCAMAS_DRACONICAS,
    GRANTED_POWERS.PRESAS_PRIMORDIAIS,
    GRANTED_POWERS.SERVOS_DO_DRAGAO,
  ],
  crencasObjetivos:
    "Praticar a soberania. Demonstrar orgulho, superioridade, majestade. Praticar o acúmulo de riquezas. Proteger suas posses e sua dignidade. Ser implacável with seus inimigos. Reverenciar os dragões e suas crias.",
  simboloSagrado: "Escamas de cinco cores diferentes.",
  canalizacaoEnergia: "NEGATIVA",
  armaPreferida: "Lança",
  devotos:
    "Elfos, medusas, sulfure, arcanistas, cavaleiros, guerreiros, lutadores, nobres.",
  obrigacoesRestricoes:
    "Para subir de nível, além de acumular XP suficiente, o devoto de Kally deve realizar uma oferenda em tesouro. O valor é igual à 20% da diferença do dinheiro inicial do nível que vai alcançar para o nível atual (por exemplo, T$ 80 para subir para o 4° nível). Sabe-se, também, de devotos malignos que sacrificam vítimas a Kally (não permitido para personagens jogadores).",
};

export default KALLYADRANOCH;
