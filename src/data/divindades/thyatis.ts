import Divindade from "../../interfaces/Divindade";
import GRANTED_POWERS from "../powers/grantedPowers";

const THYATIS: Divindade = {
  name: "Thyatis",
  poderes: [
    GRANTED_POWERS.ATAQUE_PIEDOSO,
    GRANTED_POWERS.DOM_DA_IMORTALIDADE,
    GRANTED_POWERS.DOM_DA_PROFECIA,
    GRANTED_POWERS.DOM_DA_RESSUREICAO,
  ],
  crencasObjetivos:
    "Proteger a vida e aqueles necessitados de novas chances. Renegar a morte e a mentira. Ajudar os perdidos a encontrar seus caminhos e alcançar seus destinos. Oferecer clemência, perdão e redenção.",
  simboloSagrado: "Uma ave fênix.",
  canalizacaoEnergia: "POSITIVA",
  armaPreferida: "Espada longa",
  devotos: "Aggelus, cavaleiros, guerreiros, inventores, lutadores, paladinos.",
  obrigacoesRestricoes:
    "Devotos de Thyatis são proibidos de matar criaturas inteligentes (Int –3 ou maior). Podem atacar e causar dano, mas jamais levar à morte. Por esse motivo, devotos de Thyatis preferem armas e ataques que apenas incapacitam seus oponentes ou causam dano não letal.",
};

export default THYATIS;
