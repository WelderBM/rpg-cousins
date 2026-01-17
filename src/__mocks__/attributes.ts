import { Atributo } from "../data/atributos";
import { CharacterAttributes } from "../interfaces/Character";

const attributes: CharacterAttributes = {
  Força: {
    name: Atributo.FORCA,
    value: { base: 10, bonus: 0, sources: [], total: 10 },
    mod: 0,
  },
  Destreza: {
    name: Atributo.DESTREZA,
    value: { base: 10, bonus: 0, sources: [], total: 10 },
    mod: 0,
  },
  Constituição: {
    name: Atributo.CONSTITUICAO,
    value: { base: 10, bonus: 0, sources: [], total: 10 },
    mod: 0,
  },
  Inteligência: {
    name: Atributo.INTELIGENCIA,
    value: { base: 10, bonus: 0, sources: [], total: 10 },
    mod: 0,
  },
  Sabedoria: {
    name: Atributo.SABEDORIA,
    value: { base: 10, bonus: 0, sources: [], total: 10 },
    mod: 0,
  },
  Carisma: {
    name: Atributo.CARISMA,
    value: { base: 10, bonus: 0, sources: [], total: 10 },
    mod: 0,
  },
};

export default attributes;
