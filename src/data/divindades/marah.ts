import Divindade from "../../interfaces/Divindade";
import GRANTED_POWERS from "../powers/grantedPowers";

const MARAH: Divindade = {
  name: "Marah",
  poderes: [
    GRANTED_POWERS.AURA_DA_PAZ,
    GRANTED_POWERS.DOM_DA_ESPERANCA,
    GRANTED_POWERS.PALAVRAS_DE_BONDADE,
    GRANTED_POWERS.TALENTO_ARTISTICO,
  ],
  crencasObjetivos:
    "Praticar o amor e a gratidão pela vida e pela bondade. Promover a paz, harmonia e felicidade. Aliviar a dor e o sofrimento, trazer conforto aos aflitos. Praticar a caridade e o altruísmo. Oferecer clemência, perdão e redenção.",
  simboloSagrado: "Um coração vermelho.",
  canalizacaoEnergia: "POSITIVA",
  armaPreferida: "Não há",
  devotos: "Aggelus, elfos, hynne, qareen, bardos, nobres, paladinos.",
  obrigacoesRestricoes:
    "Devotos de Marah não podem causar dano, perda de PV e condições a criaturas, exceto enfeitiçado, fascinado e pasmo (fornecer bônus em dano também é proibido). Em combate, só podem recorrer a ações como proteger ou curar — ou fugir, render-se ou aceitar a morte. Um devoto de Marah jamais vai causar violência, nem mesmo para se salvar.",
};

export default MARAH;
