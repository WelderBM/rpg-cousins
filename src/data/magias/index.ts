import {
  manaExpenseByCircle,
  spellsCircle1,
  spellsCircle2,
  spellsCircle3,
  spellsCircle4,
  spellsCircle5,
} from "./generalSpells";

export const MAGIC_RULES = {
  manaCosts: manaExpenseByCircle,
  labels: {
    [1]: "1º Círculo",
    [2]: "2º Círculo",
    [3]: "3º Círculo",
    [4]: "4º Círculo",
    [5]: "5º Círculo",
  },
};

export const allSpells = {
  ...spellsCircle1,
  ...spellsCircle2,
  ...spellsCircle3,
  ...spellsCircle4,
  ...spellsCircle5,
};
