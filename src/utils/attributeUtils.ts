import { Atributo } from "../data/atributos";
import Race from "../interfaces/Race";

export const INITIAL_POINTS = 10;

/**
 * Calcula o valor total de um atributo somando base + raça + escolhas flexíveis
 */
export function getAttributeTotal(
  attr: Atributo,
  baseAttributes: Record<Atributo, number>,
  selectedRace: Race | null,
  flexibleAttributeChoices: Record<number, Atributo> = {}
): number {
  let bonus = 0;
  if (selectedRace) {
    selectedRace.attributes.attrs.forEach((a, idx) => {
      if (a.attr === attr) bonus += a.mod;
      if (a.attr === "any" && flexibleAttributeChoices?.[idx] === attr)
        bonus += a.mod;
    });
  }
  return (baseAttributes[attr] || 0) + bonus;
}

/**
 * Tabela de Custos do T20 Original (Página 17 do Livro Básico)
 * Sistema de Compra de Pontos - 10 pontos iniciais
 *
 * Modificador | Custo Total
 * ------------|------------
 *   -1        | -1 pt (ganha 1pt)
 *    0        |  0 pts
 *   +1        |  1 pt
 *   +2        |  2 pts
 *   +3        |  4 pts  ← CORRIGIDO (era 5)
 *   +4        |  7 pts  ← CORRIGIDO (era 9)
 */

const TOTAL_COSTS: Record<number, number> = {
  [-1]: -1,
  [0]: 0,
  [1]: 1,
  [2]: 2,
  [3]: 4, // FIXED: Era 5, agora é 4 conforme livro oficial
  [4]: 7, // FIXED: Era 9, agora é 7 conforme livro oficial
};

/**
 * Calcula o custo TOTAL de um valor de atributo
 */
export function calculateAttributeCost(value: number): number {
  // Ajuste para o novo limite de redução (-1)
  if (value <= -1) return TOTAL_COSTS[-1];

  // Cap máximo (+4)
  if (value >= 4) return TOTAL_COSTS[4];

  return TOTAL_COSTS[value] || 0;
}

export function calculateTotalPointsSpent(
  baseAttributes: Record<Atributo, number>
): number {
  let total = 0;
  Object.values(baseAttributes).forEach((val) => {
    total += calculateAttributeCost(val);
  });
  return total;
}
