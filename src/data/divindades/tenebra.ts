import Divindade from "../../interfaces/Divindade";
import GRANTED_POWERS from "../powers/grantedPowers";

const TENEBRA: Divindade = {
  name: "Tenebra",
  poderes: [
    GRANTED_POWERS.CARICIA_SOMBRIA,
    GRANTED_POWERS.MANTO_DA_PENUMBRA,
    GRANTED_POWERS.VISAO_NAS_TREVAS,
    GRANTED_POWERS.ZUMBIFICAR,
  ],
  crencasObjetivos:
    "Reverenciar a noite, a escuridão, a lua e as estrelas. Proteger segredos e mistérios, proteger tudo que é oculto e invisível. Reverenciar a não vida e os mortos-vivos, propagar a prática da necromancia. Rejeitar o sol e a luz.",
  simboloSagrado: "Estrela negra de cinco pontas.",
  canalizacaoEnergia: "NEGATIVA",
  armaPreferida: "Adaga",
  devotos:
    "Anões, medusas, qareen, osteon, sulfure, trogs, arcanistas, bardos, ladinos.",
  obrigacoesRestricoes:
    "Tenebra proíbe que seus devotos sejam tocados por Azgher, o odiado rival. O devoto deve se cobrir inteiramente durante o dia, sem expor ao sol nenhum pedaço de pele.",
};

export default TENEBRA;
