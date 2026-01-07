import Divindade from "../../interfaces/Divindade";
import GRANTED_POWERS from "../powers/grantedPowers";

const THWOR: Divindade = {
  name: "Thwor",
  poderes: [
    GRANTED_POWERS.ALMEJAR_O_IMPOSSIVEL,
    GRANTED_POWERS.FURIA_DIVINA,
    GRANTED_POWERS.OLHAR_AMEDRONTADOR,
    GRANTED_POWERS.TROPAS_DUYSHIDAKK,
  ],
  crencasObjetivos:
    "Reverenciar a lealdade, a força e a coragem. Promover a união entre goblins, hobgoblins, bugbears, orcs, ogros e outros povos humanoides. Reverenciar o caos, a mutação, a vida sempre em movimento. Proteger a cultura e o modo de vida goblinoide. Destruir os elfos.",
  simboloSagrado: "Um grande punho fechado.",
  canalizacaoEnergia: "QUALQUER",
  armaPreferida: "Machado de guerra",
  devotos: "Qualquer duyshidakk.",
  obrigacoesRestricoes:
    "Não importando sua raça, o devoto de Thwor deve ser duyshidakk — ou seja, aceito como membro do povo goblinoide. Também deve se esforçar para que o “Mundo Como Deve Ser” tome o continente (veja a página 386). Deve sempre procurar fazer alianças com goblinoides e só lutar contra eles em último caso.",
};

export default THWOR;
