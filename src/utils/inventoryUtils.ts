import { Character } from "@/interfaces/Character";
import { Atributo } from "@/data/atributos";
import { BagEquipments } from "@/interfaces/Equipment";

/**
 * Calculates the maximum carrying capacity (in slots/spaces) for a character.
 * Based on Tormenta20 Jogo do Ano rules:
 * - Base capacity: 10 spaces
 * - Strength modifier: +2 spaces per Strength point
 * - Backpacks (non-stacking):
 *   - Mochila: +2 spaces
 *   - Mochila de aventureiro: +5 spaces
 *
 * @param character The character to calculate capacity for
 * @returns The maximum number of spaces the character can carry without penalty
 */
export function calculateCarryCapacity(character: Character): number {
  if (!character) return 10; // Fallback base

  // Base Rule: 10 + 2 * Strength
  // Handle attributes that can be objects with mod/value or just numbers
  const forcaAttr = character.attributes[Atributo.FORCA];
  let strMod = 0;
  if (typeof forcaAttr === "object" && forcaAttr !== null) {
    strMod = (forcaAttr as any).mod ?? (forcaAttr as any).value?.total ?? 0;
  } else if (typeof forcaAttr === "number") {
    strMod = forcaAttr;
  }
  const baseCapacity = 10 + strMod * 2;

  // Bag Inspection
  let bagEquipments: BagEquipments | null = null;

  // Handle potentially non-hydrated Bag instance (plain object from Firestore) or class instance
  if (
    character.bag &&
    typeof (character.bag as any).getEquipments === "function"
  ) {
    bagEquipments = (character.bag as any).getEquipments();
  } else if (character.bag && (character.bag as any).equipments) {
    bagEquipments = (character.bag as any).equipments;
  }

  // Backpack Bonuses (Non-stacking, take the highest)
  let backpackBonus = 0;

  if (bagEquipments) {
    const generalItems = bagEquipments["Item Geral"] || [];

    const hasMochilaAventureiro = generalItems.some(
      (i) => i.nome === "Mochila de aventureiro"
    );
    const hasMochila = generalItems.some((i) => i.nome === "Mochila");

    if (hasMochilaAventureiro) {
      backpackBonus = 5;
    } else if (hasMochila) {
      backpackBonus = 2;
    }
  }

  // TODO: Add Race/Power bonuses if implemented (e.g. Centaur, Costas Largas)

  // Ensure capacity doesn't go below 0 (though practically uncommon)
  return Math.max(0, baseCapacity + backpackBonus);
}
