import { Character } from "@/interfaces/Character";
import Skill, {
  CompleteSkill,
  SkillsAttrs,
  SkillsWithArmorPenalty,
} from "@/interfaces/Skills";
import Bag from "@/interfaces/Bag";
import { Atributo } from "@/data/atributos";

// Helper type that includes the total
export interface CalculatedSkill extends CompleteSkill {
  total: number;
  attrMod: number;
  penalty: number;
}

export function calculateSkillBonuses(character: Character): CalculatedSkill[] {
  const level = character.level || 1;
  const halfLevel = Math.floor(level / 2);

  // Handle Bag to get armor penalty
  let armorPenalty = 0;
  try {
    const bag =
      character.bag instanceof Bag
        ? character.bag
        : new Bag((character.bag as any)?.equipments);
    armorPenalty = bag.getArmorPenalty
      ? bag.getArmorPenalty()
      : (bag as any).armorPenalty || 0;
  } catch (e) {
    console.error("Error calculating bag penalty", e);
  }

  // Get all skills (enum values)
  const allSkills = Object.values(Skill);

  return allSkills
    .map((skillName) => {
      const isTrained = character.skills.includes(skillName);

      // Training bonus based on level
      let training = 0;
      if (isTrained) {
        if (level >= 15) training = 6;
        else if (level >= 7) training = 4;
        else training = 2;
      }

      // Attribute Modifier
      const attrKey = SkillsAttrs[skillName];
      // Attribute in character.attributes might be object or number?
      // Based on CharacterSheetView, it seems to be an object with .mod
      const attrObj = character.attributes[attrKey as Atributo];

      let attrMod = 0;
      if (attrObj) {
        if (typeof attrObj === "number") attrMod = attrObj;
        else if (typeof attrObj === "object") {
          attrMod = attrObj.mod ?? (attrObj as any).value?.total ?? 0; // Fallback
        }
      }

      // Armor Penalty
      const isAffectedByArmor = SkillsWithArmorPenalty.includes(skillName);
      const penalty = isAffectedByArmor ? armorPenalty : 0;

      // Others
      // TODO: Add logic for other bonuses (race, origin benefits, items) if possible.
      // For now, we mainly focus on the core mechanic and armor penalty.
      // If character.originBenefits has skills, usually it just gives training (handled by isTrained check if it was added to skills list).
      // Some origins give bonus numbers (e.g. +2). This is harder to track without full sheet recalculation.
      // We will check originBenefits for direct bonuses if possible, but that's complex.
      // For MVP of "showing the math", Level/2 + Attr + Training - Penalty is the core.

      const others = -penalty; // We can add positive bonuses here later

      const total = halfLevel + attrMod + training + others;

      return {
        name: skillName,
        halfLevel,
        modAttr: attrKey,
        training,
        others,
        penalty,
        attrMod,
        total,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}
