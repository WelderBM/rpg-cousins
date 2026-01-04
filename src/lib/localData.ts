/**
 * Local Data Provider - Carrega dados estáticos diretamente dos arquivos locais
 * Em vez de buscar no Firestore, usamos os arquivos em src/data/ para performance máxima
 */

import { Spell } from "@/interfaces/Spells";
import Equipment from "@/interfaces/Equipment";
import {
  spellsCircle1,
  spellsCircle2,
  spellsCircle3,
  spellsCircle4,
  spellsCircle5,
} from "@/data/magias/generalSpells";
import EQUIPAMENTOS, { Armas, Armaduras, Escudos } from "@/data/equipamentos";
import { GENERAL_EQUIPMENT } from "@/data/equipamentos-gerais";

/**
 * Carrega todas as magias dos arquivos locais
 * Esta função retorna dados estáticos instantaneamente, sem latência de rede
 */
export function getAllSpells(): Spell[] {
  const allSpells: Spell[] = [
    ...Object.values(spellsCircle1),
    ...Object.values(spellsCircle2),
    ...Object.values(spellsCircle3),
    ...Object.values(spellsCircle4),
    ...Object.values(spellsCircle5),
  ];

  return allSpells;
}

/**
 * Carrega todos os equipamentos dos arquivos locais
 * Combina armas, armaduras, escudos e itens gerais em uma única lista
 */
export function getAllEquipments(): Equipment[] {
  const allEquipments: Equipment[] = [
    ...Object.values(Armas),
    ...Object.values(Armaduras),
    ...Object.values(Escudos),
    ...GENERAL_EQUIPMENT.generalItems,
  ];

  return allEquipments;
}

/**
 * Busca um equipamento específico por nome
 * Útil para resolver strings de equipamentos em objetos Equipment completos
 */
export function findEquipmentByName(name: string): Equipment | undefined {
  const allEquipments = getAllEquipments();
  return allEquipments.find(
    (eq) => eq.nome.toLowerCase() === name.toLowerCase()
  );
}

/**
 * Carrega equipamentos agrupados por categoria
 * Útil para o wizard de seleção de equipamentos
 */
export function getEquipmentsByCategory() {
  return {
    weapons: [
      ...EQUIPAMENTOS.armasSimples,
      ...EQUIPAMENTOS.armasMarciais,
      ...EQUIPAMENTOS.armasExoticas,
      ...EQUIPAMENTOS.armasDeFogo,
    ],
    armors: [...EQUIPAMENTOS.armadurasLeves, ...EQUIPAMENTOS.armaduraPesada],
    shields: EQUIPAMENTOS.escudos,
    general: GENERAL_EQUIPMENT.generalItems,
  };
}
