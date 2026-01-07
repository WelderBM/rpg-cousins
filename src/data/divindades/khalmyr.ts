import Divindade from "../../interfaces/Divindade";
import GRANTED_POWERS from "../powers/grantedPowers";

const KHALMYR: Divindade = {
  name: "Khalmyr",
  poderes: [
    GRANTED_POWERS.CORAGEM_TOTAL,
    GRANTED_POWERS.DOM_DA_VERDADE,
    GRANTED_POWERS.ESPADA_JUSTICEIRA,
    GRANTED_POWERS.REPARAR_INJUSTICA,
  ],
  crencasObjetivos:
    "Praticar a caridade e o altruísmo. Defender a lei, a ordem e os necessitados. Combater a mentira, o crime e o mal. Oferecer clemência, perdão e redenção. Lutar o bom combate.",
  simboloSagrado: "Espada sobreposta a uma balança.",
  canalizacaoEnergia: "POSITIVA",
  armaPreferida: "Espada longa",
  devotos: "Aggelus, anões, cavaleiros, guerreiros, nobres, paladinos.",
  obrigacoesRestricoes:
    "Devotos de Khalmyr não podem recusar pedidos de ajuda de pessoas inocentes. Também devem cumprir as ordens de superiores na hierarquia da igreja (devotos do Deus da Justiça de nível maior) e só podem usar itens mágicos permanentes criados por devotos do mesmo deus.",
};

export default KHALMYR;
