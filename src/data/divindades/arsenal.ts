import Divindade from "../../interfaces/Divindade";
import GRANTED_POWERS from "../powers/grantedPowers";

const ARSENAL: Divindade = {
  name: "Arsenal",
  poderes: [
    GRANTED_POWERS.CONJURAR_ARMA,
    GRANTED_POWERS.CORAGEM_TOTAL,
    GRANTED_POWERS.FE_GUERREIRA,
    GRANTED_POWERS.SANGUE_DE_FERRO,
  ],
  crencasObjetivos:
    "Promover a guerra e o conflito. Vencer a qualquer custo, pela força ou estratégia. Jamais oferecer ou aceitar rendição. Eliminar as próprias fraquezas. Conhecer o inimigo como a si mesmo. Sempre encontrar condições de vitória; quando não existirem, criá-las.",
  simboloSagrado:
    "Um martelo de guerra e uma espada longa cruzados sobre um escudo.",
  canalizacaoEnergia: "QUALQUER",
  armaPreferida: "Martelo de guerra",
  devotos: "Anões, minotauros, bárbaros, cavaleiros, guerreiros, lutadores.",
  obrigacoesRestricoes:
    "Um devoto de Arsenal é proibido de ser derrotado em qualquer tipo de combate ou disputa (como um teste oposto para ver quem é mais forte). Caso seu grupo seja derrotado, isso também constitui uma violação das obrigações.",
};

export default ARSENAL;
