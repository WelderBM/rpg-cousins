import Divindade from "../../interfaces/Divindade";
import GRANTED_POWERS from "../powers/grantedPowers";

const OCEANO: Divindade = {
  name: "Oceano",
  poderes: [
    GRANTED_POWERS.ANFIBIO,
    GRANTED_POWERS.ARSENAL_DAS_PROFUNDEZAS,
    GRANTED_POWERS.MESTRE_DOS_MARES,
    GRANTED_POWERS.SOPRO_DO_MAR,
  ],
  crencasObjetivos:
    "Reverenciar os mares, o oceano e os seres que ali habitam. Promover harmonia entre o oceano e o mundo seco. Proteger os seres marinhos, mas também os seres do mundo seco que se aventuram sobre as ondas. Demandar devido respeito ao mar e seu poder.",
  simboloSagrado: "Uma concha.",
  canalizacaoEnergia: "QUALQUER",
  armaPreferida: "Tridente",
  devotos:
    "Dahllan, hynne, minotauros, sereias/ tritões, bárbaros, bucaneiros, caçadores, druidas.",
  obrigacoesRestricoes:
    "As únicas armas permitidas para devotos do Oceano são a azagaia, a lança, o tridente e a rede. Podem usar apenas armaduras leves. O devoto também não pode se manter afastado do oceano por mais de um mês.",
};

export default OCEANO;
