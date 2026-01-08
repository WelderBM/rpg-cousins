import Divindade from "../../interfaces/Divindade";
import GRANTED_POWERS from "../powers/grantedPowers";

const HYNINN: Divindade = {
  name: "Hyninn",
  poderes: [
    GRANTED_POWERS.APOSTAR_COM_O_TRAPACEIRO,
    GRANTED_POWERS.FARSA_DO_FINGIDOR,
    GRANTED_POWERS.FORMA_DE_MACACO,
    GRANTED_POWERS.GOLPISTA_DIVINO,
  ],
  crencasObjetivos:
    "Praticar a astúcia e a esperteza. Demonstrar que honestidade e sinceridade levam ao fracasso. Desafiar a lei e a ordem. Ser vitorioso sem seguir regras. Fazer aos outros antes que façam a você. Levar vantagem em tudo.",
  simboloSagrado: "Uma adaga atravessando uma máscara, ou uma raposa.",
  canalizacaoEnergia: "QUALQUER",
  armaPreferida: "Adaga",
  devotos:
    "Hynne, goblins, sílfides, bardos, bucaneiros, ladinos, inventores, nobres.",
  obrigacoesRestricoes:
    "Um devoto de Hyninn não recusa participação em um golpe, trapaça ou artimanha (o que muitas vezes inclui missões para roubar... hã, resgatar tesouros), exceto quando prejudica seus próprios aliados. O devoto também deve fazer um ato furtivo, ousado ou proibido por dia (ou por sessão de jogo, o que demorar mais), como oferenda a Hyninn. Roubar uma bolsa, enganar um miliciano, invadir o quarto de um nobre... Em termos de jogo, uma ação exigindo um teste de Enganação ou Ladinagem com CD mínima 15 + metade do seu nível.",
};

export default HYNINN;
