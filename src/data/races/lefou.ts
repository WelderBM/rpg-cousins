import Race from "../../interfaces/Race";
import { Atributo } from "../atributos";

const LEFOU: Race = {
  name: "Lefou",
  description:
    "Seres marcados pela influência da Tormenta, carregando deformidades que lhes conferem poderes terríveis e um fardo de preconceito.",
  appearance:
    "Humanoides com distorções físicas visíveis como carapaças quitinosas, tentáculos, olhos extras ou outras máculas aberrantes da Tormenta.",
  personality:
    "Frequentemente marginalizados, variam entre o isolamento amargo e a determinação feroz de provar seu valor, muitas vezes lutando contra a própria Tormenta.",
  commonReligions:
    "Aharadak (Tormenta) ou divindades que valorizam a força e a superação.",
  attributes: {
    attrs: [
      { attr: Atributo.CARISMA, mod: -1 },
      { attr: "any", mod: 1 },
      { attr: "any", mod: 1 },
      { attr: "any", mod: 1 },
    ],
  },
  faithProbability: {
    AHARADAK: 2,
    THWOR: 1,
  },
  abilities: [
    {
      name: "Cria da Tormenta",
      description:
        "Você é uma criatura do tipo monstro e recebe +5 em testes de resistência contra efeitos causados por lefeu e pela Tormenta.",
    },
    {
      name: "Deformidade",
      description:
        "Você recebe +2 em duas perícias a sua escolha. Você pode substituir uma dessas perícias por um poder da Tormenta a sua escolha.",
      sheetActions: [
        {
          source: {
            type: "power",
            name: "Deformidade",
          },
          action: {
            type: "special",
            specialAction: "lefouDeformidade",
          },
        },
      ],
      // action(sheet, subSteps) {
      //   const sheetClone = cloneDeep(sheet);
      //   const randomNumber = Math.random();

      //   if (randomNumber < 0.7) {
      //     for (let i = 0; i < 2; i += 1) {
      //       const randomSkill = getNotRepeatedRandom(
      //         sheetClone.skills,
      //         'skill'
      //       );
      //       sheetClone.skills.push(randomSkill);

      //       // If the skill is not in the completeSkills, add it
      //       if (
      //         !sheetClone.completeSkills?.some(
      //           (skill) => skill.name === randomSkill
      //         )
      //       ) {
      //         sheetClone.completeSkills = [
      //           ...(sheetClone.completeSkills || []),
      //           { name: randomSkill, others: 2, countAsTormentaPower: true },
      //         ];
      //       } else {
      //         sheetClone.completeSkills = Object.values(
      //           sheetClone.completeSkills || {}
      //         ).map((skill) => {
      //           if (skill.name === randomSkill) {
      //             return {
      //               ...skill,
      //               others: (skill.others || 0) + 2,
      //               countAsTormentaPower: true,
      //             };
      //           }
      //           return skill;
      //         });
      //       }

      //       subSteps.push({
      //         name: 'Deformidade',
      //         value: `+2 em Perícia (${randomSkill})`,
      //       });
      //     }
      //   } else {
      //     const allowedPowers = Object.values(tormentaPowers);
      //     const randomPower = getNotRepeatedRandom(
      //       sheetClone.generalPowers,
      //       'power',
      //       allowedPowers
      //     );
      //     sheetClone.generalPowers.push(randomPower);

      //     subSteps.push({
      //       name: 'Deformidade',
      //       value: `Poder da Tormenta recebido (${randomPower.name})`,
      //     });
      //   }

      //   return sheetClone;
      // },
    },
  ],
};

export default LEFOU;
