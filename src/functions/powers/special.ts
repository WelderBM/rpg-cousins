import CharacterSheet, { SubStep } from "@/interfaces/CharacterSheet";
import Skill from "@/interfaces/Skills";
import tormentaPowers from "@/data/powers/tormentaPowers";
import HUMANO from "@/data/races/humano";
import {
  getNotRepeatedRandom,
  getRandomItemFromArray,
  pickFromArray,
} from "../randomUtils";
import { getPowersAllowedByRequirements } from "../powers";
import { addOtherBonusToSkill } from "../skills/general";
import { applyPower } from "../general";

export function applyHumanoVersatil(sheet: CharacterSheet): SubStep[] {
  const substeps: SubStep[] = [];

  // Check if we already have a record for Versátil in the history
  const historyEntry = sheet.sheetActionHistory.find(
    (entry) => entry.source.type === "power" && entry.source.name === "Versátil"
  );

  if (historyEntry) {
    // Re-apply sub-steps based on history
    historyEntry.changes.forEach((change) => {
      if (change.type === "SkillsAdded") {
        change.skills.forEach((skill) => {
          substeps.push({
            name: "Versátil",
            value: `Perícia treinada (${skill})`,
          });
        });
      } else if (change.type === "PowerAdded") {
        substeps.push({
          name: "Versátil",
          value: `Poder geral recebido (${change.powerName})`,
        });
      }
    });
    return substeps;
  }

  const randomSkill = getNotRepeatedRandom(sheet.skills, Object.values(Skill));
  sheet.skills.push(randomSkill);

  const historyChanges: any[] = [
    { type: "SkillsAdded", skills: [randomSkill] },
  ];
  substeps.push({
    name: "Versátil",
    value: `Perícia treinada (${randomSkill})`,
  });

  const shouldGetSkill = Math.random() > 0.5;

  if (shouldGetSkill) {
    const randomSecondSkill = getNotRepeatedRandom(
      sheet.skills,
      Object.values(Skill)
    );
    sheet.skills.push(randomSecondSkill);
    substeps.push({
      name: "Versátil",
      value: `Perícia treinada (${randomSecondSkill})`,
    });
    historyChanges[0].skills.push(randomSecondSkill);
  } else {
    const allowedPowers = getPowersAllowedByRequirements(sheet);
    const randomPower = getNotRepeatedRandom(
      sheet.generalPowers,
      allowedPowers
    );
    sheet.generalPowers.push(randomPower);
    substeps.push({
      name: "Versátil",
      value: `Poder geral recebido (${randomPower.name})`,
    });
    historyChanges.push({ type: "PowerAdded", powerName: randomPower.name });
  }

  sheet.sheetActionHistory.push({
    source: { type: "power", name: "Versátil" },
    changes: historyChanges,
  });

  return substeps;
}

export function applyLefouDeformidade(sheet: CharacterSheet): SubStep[] {
  const subSteps: SubStep[] = [];
  const randomNumber = Math.random();

  const allSkills = Object.values(Skill);
  const shouldGetSkill = randomNumber < 0.5;

  const pickedSkills = pickFromArray(allSkills, shouldGetSkill ? 2 : 1);
  pickedSkills.forEach((randomSkill) => {
    addOtherBonusToSkill(sheet, randomSkill, 2);
    subSteps.push({
      name: "Deformidade",
      value: `+2 em Perícia (${randomSkill})`,
    });
  });

  if (!shouldGetSkill) {
    const allowedPowers = Object.values(tormentaPowers);
    const randomPower = getNotRepeatedRandom(
      sheet.generalPowers,
      allowedPowers
    );
    sheet.generalPowers.push(randomPower);

    subSteps.push({
      name: "Deformidade",
      value: `Poder da Tormenta recebido (${randomPower.name})`,
    });
  }

  return subSteps;
}

export function applyOsteonMemoriaPostuma(_sheet: CharacterSheet): SubStep[] {
  function addSkillOrGeneralPower(sheet: CharacterSheet, substeps: SubStep[]) {
    const shouldGetSkill = Math.random() > 0.5;

    if (shouldGetSkill) {
      const randomSkill = getNotRepeatedRandom(
        sheet.skills,
        Object.values(Skill)
      );
      sheet.skills.push(randomSkill);
      substeps.push({
        name: "Memória Póstuma",
        value: `Perícia treinada (${randomSkill})`,
      });
    } else {
      const allowedPowers = getPowersAllowedByRequirements(sheet);
      const randomPower = getNotRepeatedRandom(
        sheet.generalPowers,
        allowedPowers
      );
      sheet.generalPowers.push(randomPower);
      substeps.push({
        name: "Memória Póstuma",
        value: `Poder geral recebido (${randomPower.name})`,
      });
    }
  }

  function getAndApplyRandomOldRaceAbility(
    sheet: CharacterSheet,
    substeps: SubStep[]
  ) {
    if (sheet.raca.oldRace?.abilities) {
      const randomAbility = getRandomItemFromArray(
        sheet.raca.oldRace.abilities
      );
      sheet.raca.abilities?.push(randomAbility);
      substeps.push({
        name: "Memória Póstuma",
        value: `${sheet.raca.oldRace.name} (${randomAbility.name})`,
      });

      applyPower(sheet, randomAbility);
    }

    return sheet;
  }

  const subSteps: SubStep[] = [];

  if (_sheet.raca.oldRace) {
    if (_sheet.raca.oldRace.name === HUMANO.name) {
      addSkillOrGeneralPower(_sheet, subSteps);
    } else if (_sheet.raca.oldRace.abilities) {
      _sheet = getAndApplyRandomOldRaceAbility(_sheet, subSteps);
    }
  }

  return subSteps;
}
