import AGGELUS from "../../data/races/aggelus";
import HUMANO from "../../data/races/humano";
import { modifyAttributesBasedOnRace } from "../general";
import {
  CharacterAttribute,
  CharacterAttributes,
} from "../../interfaces/Character";
import { Atributo } from "../../data/atributos";

const originalAttrs: CharacterAttributes = {
  Força: {
    name: Atributo.FORCA,
    value: { base: 17, bonus: 0, sources: [], total: 17 },
    mod: 3,
  },
  Carisma: {
    name: Atributo.CARISMA,
    value: { base: 12, bonus: 0, sources: [], total: 12 },
    mod: 1,
  },
  Inteligência: {
    name: Atributo.INTELIGENCIA,
    value: { base: 12, bonus: 0, sources: [], total: 12 },
    mod: 1,
  },
  Constituição: {
    name: Atributo.CONSTITUICAO,
    value: { base: 12, bonus: 0, sources: [], total: 12 },
    mod: 1,
  },
  Destreza: {
    name: Atributo.DESTREZA,
    value: { base: 10, bonus: 0, sources: [], total: 10 },
    mod: 0,
  },
  Sabedoria: {
    name: Atributo.SABEDORIA,
    value: { base: 13, bonus: 0, sources: [], total: 13 },
    mod: 1,
  },
};

describe("Testa modificações da raça Aggelus", () => {
  test("Se o Aggelus altera corretamente os atributos", () => {
    const attrNotChanged = {
      Força: {
        name: Atributo.FORCA,
        value: { base: 17, bonus: 0, sources: [], total: 17 },
        mod: 3,
      },
      Constituição: {
        name: Atributo.CONSTITUICAO,
        value: { base: 12, bonus: 0, sources: [], total: 12 },
        mod: 1,
      },
      Inteligência: {
        name: Atributo.INTELIGENCIA,
        value: { base: 12, bonus: 0, sources: [], total: 12 },
        mod: 1,
      },
      Destreza: {
        name: Atributo.DESTREZA,
        value: { base: 10, bonus: 0, sources: [], total: 10 },
        mod: 0,
      },
    };

    const expectedAttrs = {
      ...attrNotChanged,
      Carisma: {
        name: Atributo.CARISMA,
        value: { base: 14, bonus: 0, sources: [], total: 14 },
        mod: 2,
      },
      Sabedoria: {
        name: Atributo.SABEDORIA,
        value: { base: 17, bonus: 0, sources: [], total: 17 },
        mod: 3,
      },
    };

    const received = modifyAttributesBasedOnRace(
      AGGELUS,
      originalAttrs,
      [],
      []
    );

    expect(received).toEqual(expectedAttrs);
  });
});

function countAttrWithPlusOne(attributes: CharacterAttribute[]) {
  return attributes.reduce((acc, attr) => {
    const original = originalAttrs[attr.name];
    return attr.mod === original.mod + 1 ? acc + 1 : acc;
  }, 0);
}

describe("Testa modificações da raça Humano", () => {
  Array(1)
    .fill(0)
    .forEach(() => {
      test("Se o Humano recebe +1 em 3 atributos diferentes", () => {
        const received = modifyAttributesBasedOnRace(
          HUMANO,
          originalAttrs,
          [],
          []
        );
        const qtdOfAttrWithPlusOne = countAttrWithPlusOne(
          Object.values(received)
        );

        expect(qtdOfAttrWithPlusOne).toBe(3);
      });
    });
});
