/**
 * Local Data Provider - Carrega dados estáticos diretamente dos arquivos locais
 * Em vez de buscar no Firestore, usamos os arquivos em src/data/ para performance máxima
 *
 * ✨ OTIMIZAÇÃO: Cache em memória para evitar retrabalho
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

// ============================================
// CACHE EM MEMÓRIA (Module-level singletons)
// ============================================

/**
 * Cache de magias - inicializado lazy (só na primeira chamada)
 */
let cachedSpells: Spell[] | null = null;

/**
 * Cache de equipamentos - inicializado lazy
 */
let cachedEquipments: Equipment[] | null = null;

/**
 * Cache de equipamentos por categoria - inicializado lazy
 */
let cachedEquipmentsByCategory: ReturnType<
  typeof buildEquipmentsByCategory
> | null = null;

/**
 * Constrói objeto de equipamentos por categoria
 * Separado em função para poder cachear
 */
function buildEquipmentsByCategory() {
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

// ============================================
// FUNÇÕES PÚBLICAS COM CACHE
// ============================================

/**
 * Carrega todas as magias dos arquivos locais
 * ✨ CACHE: Retorna a mesma referência em chamadas subsequentes
 *
 * @returns Array de todas as magias (200+ itens)
 */
export function getAllSpells(): Spell[] {
  if (cachedSpells === null) {
    // Primeira chamada: constrói e cacheia
    cachedSpells = [
      ...Object.values(spellsCircle1),
      ...Object.values(spellsCircle2),
      ...Object.values(spellsCircle3),
      ...Object.values(spellsCircle4),
      ...Object.values(spellsCircle5),
    ];

    if (typeof window !== "undefined") {
      console.log(`[Cache] Magias carregadas: ${cachedSpells.length} itens`);
    }
  }

  return cachedSpells;
}

/**
 * Carrega todos os equipamentos dos arquivos locais
 * ✨ CACHE: Retorna a mesma referência em chamadas subsequentes
 *
 * @returns Array de todos os equipamentos
 */
export function getAllEquipments(): Equipment[] {
  if (cachedEquipments === null) {
    // Primeira chamada: constrói e cacheia
    cachedEquipments = [
      ...Object.values(Armas),
      ...Object.values(Armaduras),
      ...Object.values(Escudos),
      ...GENERAL_EQUIPMENT.generalItems,
    ];

    if (typeof window !== "undefined") {
      console.log(
        `[Cache] Equipamentos carregados: ${cachedEquipments.length} itens`
      );
    }
  }

  return cachedEquipments;
}

/**
 * Busca um equipamento específico por nome
 * ✨ OTIMIZADO: Usa cache de getAllEquipments()
 *
 * @param name Nome do equipamento
 * @returns Equipment ou undefined
 */
export function findEquipmentByName(name: string): Equipment | undefined {
  const allEquipments = getAllEquipments(); // Usa cache
  return allEquipments.find(
    (eq) => eq.nome.toLowerCase() === name.toLowerCase()
  );
}

/**
 * Carrega equipamentos agrupados por categoria
 * ✨ CACHE: Retorna a mesma referência em chamadas subsequentes
 *
 * @returns Objeto com arrays por categoria
 */
export function getEquipmentsByCategory() {
  if (cachedEquipmentsByCategory === null) {
    // Primeira chamada: constrói e cacheia
    cachedEquipmentsByCategory = buildEquipmentsByCategory();

    if (typeof window !== "undefined") {
      console.log("[Cache] Equipamentos por categoria carregados");
    }
  }

  return cachedEquipmentsByCategory;
}

/**
 * Limpa todos os caches (útil para testes ou hot reload)
 * ⚠️ Normalmente não é necessário chamar isso em produção
 */
export function clearAllCaches() {
  cachedSpells = null;
  cachedEquipments = null;
  cachedEquipmentsByCategory = null;

  if (typeof window !== "undefined") {
    console.log("[Cache] Todos os caches limpos");
  }
}
