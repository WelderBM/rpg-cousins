import Divindade from "../../interfaces/Divindade";
import GRANTED_POWERS from "../powers/grantedPowers";

const TANNATOH: Divindade = {
  name: "Tanna-Toh",
  poderes: [
    GRANTED_POWERS.CONHECIMENTO_ENCICLOPEDICO,
    GRANTED_POWERS.MENTE_ANALITICA,
    GRANTED_POWERS.PESQUISA_ABENCOADA,
    GRANTED_POWERS.VOZ_DA_CIVILIZACAO,
  ],
  crencasObjetivos:
    "Reverenciar a mente racional, o conhecimento, a civilização, a verdade. Proteger o progresso, o avanço dos povos civilizados. Promover el ensino e a prática das artes e das ciências. Solucionar todos os mistérios, revelar todas as mentiras. Buscar novo conhecimento. Não tolerar a ignorância.",
  simboloSagrado: "Pergaminho e pena.",
  canalizacaoEnergia: "QUALQUER",
  armaPreferida: "Bordão",
  devotos: "Golens, kliren, arcanistas, bardos, inventores, nobres, paladinos.",
  obrigacoesRestricoes:
    "Devotos de Tanna-Toh jamais podem recusar uma missão que envolva a busca por um novo conhecimento ou informação; investigar rumores sobre um livro perdido, procurar uma aldeia lendária, pesquisar os hábitos de uma criatura desconhecida... Além disso, o devoto sempre deve dizer a verdade e nunca pode se recusar a responder uma pergunta direta, pouco importando as consequências. É proibido para ele esconder qualquer conhecimento.",
};

export default TANNATOH;
