import Divindade from "../../interfaces/Divindade";
import GRANTED_POWERS from "../powers/grantedPowers";

const NIMB: Divindade = {
  name: "Nimb",
  poderes: [
    GRANTED_POWERS.EXTASE_DA_LOUCURA,
    GRANTED_POWERS.PODER_OCULTO,
    GRANTED_POWERS.SORTE_DOS_LOUCOS,
    GRANTED_POWERS.TRANSMISSAO_DA_LOUCURA,
  ],
  crencasObjetivos:
    "Reverenciar o caos, a aleatoriedade, a sorte e o azar. Praticar a ousadia e a rebeldia, desafiar regras e leis. Rejeitar o bom senso. Tornar o mundo mais interessante. Ou divertido. Ou terrível. Ou não.",
  simboloSagrado: "Um dado de seis faces.",
  canalizacaoEnergia: "QUALQUER",
  armaPreferida:
    "Nenhuma e todas! Ao usar um efeito que dependa de arma preferida, qualquer arma (ou outro objeto!) pode aparecer, de acordo com o mestre.",
  devotos:
    "Goblins, qareen, sílfides, arcanistas, bárbaros, bardos, bucaneiros, inventores, ladinos.",
  obrigacoesRestricoes:
    "Por serem incapazes de seguir regras, estes devotos não têm “obrigações” verdadeiras (portanto, nunca perdem PM por descumprirem suas O&R). No entanto, sofrem certas restrições que não podem ignorar. Devotos de Nimb são loucos (ou agem como se fossem), não conseguindo convencer ninguém de coisa alguma. Você sofre –5 em testes de perícias baseadas em Carisma. Além disso, no início de cada cena de ação, role 1d6. Com um resultado 1, você fica confuso (mesmo que seja imune a esta condição).",
};

export default NIMB;
