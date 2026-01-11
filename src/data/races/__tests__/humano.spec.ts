import _ from "lodash";
import { applyRaceAbilities } from "../../../functions/general";
import { druida } from "../../../__mocks__/classes/druida";
import HUMANO from "../humano";
import { Atributo } from "../../atributos";
import attributes from "../../../__mocks__/attributes";

describe("Testa habilidades da raça Humano", () => {
  test("Versátil: soma uma pericia e um poder geral, ou duas perícias", () => {
    Array(20)
      .fill(0)
      .forEach(() => {
        const attrs = _.cloneDeep(attributes);
        attrs.Inteligência = {
          name: Atributo.INTELIGENCIA,
          value: { base: 14, bonus: 0, sources: [], total: 14 },
          mod: 2,
        };

        const sheet = druida(HUMANO, attrs);
        const received = applyRaceAbilities(sheet);

        expect(received.skills.length).toBeGreaterThan(8);
        expect(received.skills.length).toBeLessThan(11);
        expect(received.skills).toHaveUniqueElements();

        if (received.skills.length > 10) {
          // This should not happen
        } else if (received.skills.length > 9) {
          // 8 (base) + 2 from Versatil
          expect(received.skills[received.skills.length - 1]).not.toBe(
            received.skills[received.skills.length - 2]
          );
        } else {
          // 8 (base) + 1 from Versatil
          expect(received.generalPowers).toHaveLength(1);
        }
      });
  });
});
