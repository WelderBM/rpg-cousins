import Divindade from "../../interfaces/Divindade";
import GRANTED_POWERS from "../powers/grantedPowers";

const LENA: Divindade = {
  name: "Lena",
  poderes: [
    GRANTED_POWERS.ATAQUE_PIEDOSO,
    GRANTED_POWERS.AURA_RESTAURADORA,
    GRANTED_POWERS.CURA_GENTIL,
    GRANTED_POWERS.CURANDEIRA_PERFEITA,
  ],
  crencasObjetivos:
    "Reverenciar e proteger a vida em todas as suas formas. Reverenciar a fertilidade, a fecundidade, a maternidade e a infância. Praticar a caridade e o altruísmo. Oferecer clemência, perdão e redenção. Aliviar a dor e o sofrimento físico, mental ou espiritual.",
  simboloSagrado: "Lua crescente prateada.",
  canalizacaoEnergia: "POSITIVA",
  armaPreferida: "Não há",
  devotos: "Dahllan, qareen, nobres, paladinos.",
  obrigacoesRestricoes:
    "Devotos de Lena não podem causar dano letal ou perda de PV a criaturas vivas (fornecer bônus em dano letal também é proibido). Podem causar dano não letal e prejudicar seus inimigos (em termos de jogo, impondo condições), desde que não causem dano letal ou perda de PV. Para um devoto de Lena, é preferível perder a própria vida a tirá-la de outros. Apenas mulheres podem ser devotas de Lena. Uma clériga precisa dar à luz pelo menos uma vez antes de receber seus poderes divinos. A fecundação é um mistério bem guardado pelas sacerdotisas; conta-se que a própria deusa vem semear suas discípulas. Paladinos de Lena podem ser homens (são os raros “escolhidos de Lena”).",
};

export default LENA;
