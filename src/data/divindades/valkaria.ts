import Divindade from "../../interfaces/Divindade";
import GRANTED_POWERS from "../powers/grantedPowers";

const VALKARIA: Divindade = {
  name: "Valkaria",
  poderes: [
    GRANTED_POWERS.ALMEJAR_O_IMPOSSIVEL,
    GRANTED_POWERS.ARMAS_DA_AMBICAO,
    GRANTED_POWERS.CORAGEM_TOTAL,
    GRANTED_POWERS.LIBERDADE_DIVINA,
  ],
  crencasObjetivos:
    "Praticar o otimismo, a evolução, a rebeldia. Desafiar limites, almejar o impossível. Combater o mal, a opressão e a tirania. Proteger a liberdade. Aceitar o novo e diferente e adaptar-se a ele. Demonstrar ambição, paixão e coragem. Desfrutar e amar a vida.",
  simboloSagrado: "A Estátua de Valkaria ou seis faixas entrelaçadas.",
  canalizacaoEnergia: "POSITIVA",
  armaPreferida: "Mangual",
  devotos:
    "Aventureiros; membros de todas as classes podem ser devotos de Valkaria.",
  obrigacoesRestricoes:
    "Valkaria odeia o conformismo. Seus devotos são proibidos de fixar moradia em um mesmo lugar, não podendo permanecer mais de 2d10+10 dias na mesma cidade (ou vila, aldeia, povoado...) ou 1d4+2 meses no mesmo reino. Devotos de Valkaria também são proibidos de se casar ou formar qualquer união estável.",
};

export default VALKARIA;
