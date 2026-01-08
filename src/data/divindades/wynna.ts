import Divindade from "../../interfaces/Divindade";
import GRANTED_POWERS from "../powers/grantedPowers";

const WYNNA: Divindade = {
  name: "Wynna",
  poderes: [
    GRANTED_POWERS.BENCAO_DO_MANA,
    GRANTED_POWERS.CENTELHA_MAGICA,
    GRANTED_POWERS.ESCUDO_MAGICO,
    GRANTED_POWERS.TEURGISTA_MISTICO,
  ],
  crencasObjetivos:
    "Reverenciar a magia arcana e seus praticantes. Promover o ensino da magia. Usar a magia para proteger os necessitados e trazer felicidade ao mundo.",
  simboloSagrado: "Um anel metálico.",
  canalizacaoEnergia: "QUALQUER",
  armaPreferida: "Adaga",
  devotos: "Elfos, golens, qareen, sílfides, arcanistas, bardos.",
  obrigacoesRestricoes:
    "Assim como a magia jamais deva ser negada para quem a busca, devotos de Wynna devem praticar a bondade e a generosidade de sua deusa, jamais recusando um pedido de ajuda de alguém inocente. Além disso, devotos de Wynna são proibidos de matar seres mágicos (elfos, qareen, sílfides e outros a critério do mestre) e conjuradores arcanos.",
};

export default WYNNA;
