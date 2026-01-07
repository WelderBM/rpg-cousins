import Divindade from "../../interfaces/Divindade";
import GRANTED_POWERS from "../powers/grantedPowers";

const LINWU: Divindade = {
  name: "Lin-Wu",
  poderes: [
    GRANTED_POWERS.CORAGEM_TOTAL,
    GRANTED_POWERS.KIAI_DIVINO,
    GRANTED_POWERS.MENTE_VAZIA,
    GRANTED_POWERS.TRADICAO_DE_LIN_WU,
  ],
  crencasObjetivos:
    "Promover a honra acima de tudo. Proteger Tamu-ra e o Reinado de Arton. Praticar honestidade, coragem, cortesia e compaixão. Demonstrar integridade e dignidade. Ser leal a seus companheiros. Buscar redenção após cometer desonra.",
  simboloSagrado:
    "Placa de metal com a silhueta de um dragão-serpente celestial.",
  canalizacaoEnergia: "QUALQUER",
  armaPreferida: "Katana",
  devotos: "Anões, cavaleiros, guerreiros, nobres, paladinos.",
  obrigacoesRestricoes:
    "Antigas proibições quanto a devotos estrangeiros ou do gênero feminino não mais se aplicam. No entanto, devotos de Lin-Wu ainda devem demonstrar comportamento honrado, jamais recorrendo a mentiras e subterfúgios. Em termos de jogo, são proibidos de tentar qualquer ação que exigiria um teste de Enganação, Furtividade ou Ladinagem.",
};

export default LINWU;
