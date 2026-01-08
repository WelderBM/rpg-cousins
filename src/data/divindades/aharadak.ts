import Divindade from "../../interfaces/Divindade";
import grantedPowers from "../powers/grantedPowers";

const AHARADAK: Divindade = {
  name: "Aharadak",
  poderes: [
    grantedPowers.AFINIDADE_COM_A_TORMENTA,
    grantedPowers.EXTASE_DA_LOUCURA,
    grantedPowers.PERCEPCAO_TEMPORAL,
    grantedPowers.REJEICAO_DIVINA,
  ],
  crencasObjetivos:
    "Reverenciar a Tormenta, apregoar a inevitabilidade de sua chegada ao mundo. Praticar a devassidão e a perversão. Deturpar tudo que é correto, desfigurar tudo que é normal. Abraçar a agonia, crueldade e loucura.",
  simboloSagrado: "Um olho macabro de pupila vertical e cercado de espinhos.",
  canalizacaoEnergia: "NEGATIVA",
  armaPreferida: "Corrente de espinhos",
  devotos: "Quaisquer. A Tormenta aceita tudo e todos.",
  obrigacoesRestricoes:
    "Quase todos os cultistas de Aharadak são maníacos insanos, compelidos a praticar os atos mais abomináveis. No entanto, talvez devido à natureza alienígena e incompreensível deste deus, alguns devotos conseguem se resguardar. Preservam sua humanidade, abstendo-se de cometer crimes ou profanações. Ainda assim, o devoto paga um preço. No início de qualquer cena de ação, role 1d6. Com um resultado ímpar, você fica fascinado na primeira rodada, perdido em devaneios sobre a futilidade da vida (mesmo que seja imune a esta condição).",
};

export default AHARADAK;
