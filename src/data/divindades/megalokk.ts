import Divindade from "../../interfaces/Divindade";
import GRANTED_POWERS from "../powers/grantedPowers";

const MEGALOKK: Divindade = {
  name: "Megalokk",
  poderes: [
    GRANTED_POWERS.OLHAR_AMEDRONTADOR,
    GRANTED_POWERS.PRESAS_PRIMORDIAIS,
    GRANTED_POWERS.URRO_DIVINO,
    GRANTED_POWERS.VOZ_DOS_MONSTROS,
  ],
  crencasObjetivos:
    "Praticar a violência, a soberania do mais forte. Jamais reprimir os próprios instintos e desejos. Jamais ser domado, desafiar qualquer forma de controle. Jamais oferecer perdão ou rendição. Eliminar os fracos. Destruir seus inimigos.",
  simboloSagrado: "A garra de um monstro.",
  canalizacaoEnergia: "NEGATIVA",
  armaPreferida: "Maça",
  devotos:
    "Goblins, medusas, minotauros, sulfure, trogs, bárbaros, caçadores, druidas, lutadores.",
  obrigacoesRestricoes:
    "Devotos de Megalokk devem rejeitar os modos civilizados e se entregar à ferocidade, descontrole e impaciência. Você é proibido de usar perícias baseadas em Inteligência ou Carisma (exceto Adestramento e Intimidação) e não pode preparar uma ação, escolher 10 ou 20 em testes e sustentar efeitos (pois são ações que exigem foco e paciência).",
};

export default MEGALOKK;
