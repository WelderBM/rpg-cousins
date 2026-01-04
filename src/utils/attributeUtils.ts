import { Atributo } from "../data/atributos";

export const INITIAL_POINTS = 10;

// Marginal costs for increasing from (N-1) to N
const POSITIVE_COSTS: Record<number, number> = {
  1: 1, // 0 -> 1: Costs 1
  2: 1, // 1 -> 2: Costs 1
  3: 2, // 2 -> 3: Costs 2
  4: 3, // 3 -> 4: Costs 3
  5: 4, // 4 -> 5: Costs 4 (Extrapolated / T20 Standard for 15 usually expensive)
};

// Marginal gain for decreasing from (N+1) to N
// For negatives: -1 costs -1 (gains 1).
const NEGATIVE_COSTS: Record<number, number> = {
  0: -1, // -1 -> 0: Costs -1 (meaning 0 costs 1 more than -1) -> Wait, logic is usually absolute cost from 0.
  // We want to calculate Total Cost of a value relative to 0.
};

export function calculateAttributeCost(value: number): number {
  if (value === 0) return 0;

  let totalCost = 0;

  if (value > 0) {
    for (let i = 1; i <= value; i++) {
      totalCost += POSITIVE_COSTS[i] || 5; // Default to 5 or strictly limit?
    }
  } else {
    // Value is negative e.g., -1, -2
    // Cost should be negative (refunding points)
    // Typically -1 grants 1 point => Cost is -1.
    // -2 grants 2 points => Cost is -2.
    // Assuming linear -1 per step for negatives as requested ("ganhar pontos extras").
    totalCost = value * 1; // Direct linear relation for negatives usually.
    // If user meant complex sell logic, they would say. "reduzir para -1 ou -2" usually implies simple linear buyback.
  }

  return totalCost;
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
