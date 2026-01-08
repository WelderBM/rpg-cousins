import Divindade from "../../interfaces/Divindade";
import GRANTED_POWERS from "../powers/grantedPowers";

const SSZZAAS: Divindade = {
  name: "Sszzaas",
  poderes: [
    GRANTED_POWERS.ASTUCIA_DA_SERPENTE,
    GRANTED_POWERS.FAMILIAR_OFIDICO,
    GRANTED_POWERS.PRESAS_VENENOSAS,
    GRANTED_POWERS.SANGUE_OFIDICO,
  ],
  crencasObjetivos:
    "Praticar a mentira e a trapaça. Buscar sempre a solução mais inteligente. Demonstrar que lealdade e confiança são fraquezas, devem ser eliminadas. Promover competição, rivalidade, desconfiança. Usar os recursos do inimigo para alcançar seus objetivos. Levar outros a se sacrificarem em seu lugar.",
  simboloSagrado: "Uma naja vertendo veneno pelas presas.",
  canalizacaoEnergia: "NEGATIVA",
  armaPreferida: "Adaga",
  devotos:
    "Medusas, arcanistas, bardos, bucaneiros, inventores, ladinos, nobres.",
  obrigacoesRestricoes:
    "O devoto deve fazer um ato de traição, intriga ou corrupção por dia (ou por sessão de jogo, o que demorar mais) como oferenda a Sszzaas. Pouco importa se o alvo é aliado ou inimigo — uns poucos sszzaazitas usam seus métodos torpes para ajudar colegas aventureiros em suas missões, às vezes sem que eles próprios saibam. Sugerir a alguém que foi traído pelo cônjuge, influenciar um guarda a aceitar suborno, instruir um mercador a roubar nos preços, incriminar alguém por um crime que não cometeu, enganar um guerreiro para que mate um oponente rendido e inofensivo... Em termos de jogo, uma ação exigindo um teste de Enganação com CD mínima 15 + metade do seu nível.",
};

export default SSZZAAS;
