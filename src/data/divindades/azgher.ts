import Divindade from "../../interfaces/Divindade";
import GRANTED_POWERS from "../powers/grantedPowers";

const AZGUER: Divindade = {
  name: "Azgher",
  poderes: [
    GRANTED_POWERS.ESPADA_SOLAR,
    GRANTED_POWERS.FULGOR_SOLAR,
    GRANTED_POWERS.HABITANTE_DO_DESERTO,
    GRANTED_POWERS.INIMIGO_DE_TENEBRA,
  ],
  crencasObjetivos:
    "Praticar a gratidão pela proteção e generosidade do sol. Promover a honestidade, expor embustes e mentiras. Praticar a caridade e o altruísmo. Proteger os necessitados. Oferecer clemência, perdão e redenção. Combater o mal.",
  simboloSagrado: "Um sol dourado.",
  canalizacaoEnergia: "POSITIVA",
  armaPreferida: "Cimitarra",
  devotos:
    "Aggelus, qareen, arcanistas, bárbaros, caçadores, cavaleiros, guerreiros, nobres, paladinos.",
  obrigacoesRestricoes:
    "O devoto de Azgher deve manter o rosto sempre coberto (com uma máscara, capuz ou trapos). Sua face pode ser revelada apenas ao sumo-sacerdote ou em seu funeral. Devotos do Sol também devem doar para a igreja de Azgher 20% de qualquer tesouro obtido. Essa doação deve ser feita em ouro, seja na forma de moedas ou itens.",
};

export default AZGUER;
