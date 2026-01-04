import { Atributo } from "../data/atributos";

export const INITIAL_POINTS = 20;

export const ATTRIBUTE_COSTS: Record<number, number> = {
  10: 0,
  11: 1, // 10->11
  12: 1, // 11->12
  13: 2, // 12->13
  14: 2, // 13->14
  15: 5, // 14->15
  16: 5, // Assuming pattern or consistent with 15? User only specified up to 15. I will Cap at 15 for now or assume cost 5 continues? T20 usually goes to 18.
  // User input "Subir para 15: Custo 5". Explicitly didn't mention 16, 17, 18.
  // Standard T20 Jogo do Ano caps simple point buy at 18?
  // Let's assume max buyable is 15 based on the user specifically mentioning it as the last item.
  // If I need to go higher, I'll need clarification. For now, max 15.
};

// Cumulative cost map calculation for performance
const CUMULATIVE_COSTS: Record<number, number> = {
  10: 0,
  11: 1,
  12: 2,
  13: 4,
  14: 6,
  15: 11,
};

export function calculateAttributeCost(value: number): number {
  if (value <= 10) return 0;
  if (CUMULATIVE_COSTS[value] !== undefined) {
    return CUMULATIVE_COSTS[value];
  }
  // Fallback if user somehow goes beyond defined standard without config
  return 0;
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
