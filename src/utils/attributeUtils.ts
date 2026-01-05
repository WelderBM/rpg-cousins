import { Atributo } from "../data/atributos";

export const INITIAL_POINTS = 20;

/**
 * Tabela de Custos do T20 Original (Versão 20 pontos)
 *
 * Modificador | Custo Total
 * ------------|------------
 *   -1        | -1 pt (ganha 1pt)
 *    0        |  0 pts
 *   +1        |  1 pt
 *   +2        |  2 pts
 *   +3        |  5 pts
 *   +4        |  9 pts
 */

const TOTAL_COSTS: Record<number, number> = {
  [-1]: -1,
  [0]: 0,
  [1]: 1,
  [2]: 2,
  [3]: 5,
  [4]: 9,
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
