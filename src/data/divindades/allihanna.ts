import Divindade from "../../interfaces/Divindade";
import GRANTED_POWERS from "../powers/grantedPowers";

const ALLIHANNA: Divindade = {
  name: "Allihanna",
  poderes: [
    GRANTED_POWERS.COMPREENDER_OS_ERMOS,
    GRANTED_POWERS.DEDO_VERDE,
    GRANTED_POWERS.DESCANSO_NATURAL,
    GRANTED_POWERS.VOZ_DA_NATUREZA,
  ],
  crencasObjetivos:
    "Reverenciar os seres da natureza. Proteger a vida selvagem. Promover harmonia entre a natureza e a civilização. Combater monstros, mortos-vivos e outras criaturas que perturbam o equilíbrio natural.",
  simboloSagrado:
    "Para bárbaros e outros adoradores de animais, o símbolo corresponde ao respectivo animal. Para outros, uma pequena árvore.",
  canalizacaoEnergia: "POSITIVA",
  armaPreferida: "Bordão",
  devotos: "Dahllan, elfos, sílfides, bárbaros, caçadores, druidas.",
  obrigacoesRestricoes:
    "Devotos de Allihanna não podem usar armaduras e escudos feitos de metal. Assim, você só pode usar armadura acolchoada, de couro, gibão de peles e escudo leve, ou itens feitos de materiais especiais não metálicos. Devotos de Allihanna não podem descansar em nenhuma comunidade maior que uma aldeia (não perdem seus poderes, mas também não recuperam pontos de vida ou mana). Por isso, sempre preferem o relento a um quarto de estalagem.",
};

export default ALLIHANNA;
