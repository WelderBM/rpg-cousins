/**
 * Local Data Provider - Carrega dados estáticos diretamente dos arquivos locais
 * Em vez de buscar no Firestore, usamos os arquivos em src/data/ para performance máxima
 *
 * ✨ OTIMIZAÇÃO: Cache em memória e Lazy Loading com Code Splitting
 */

import { Spell } from "@/interfaces/Spells";
import Equipment from "@/interfaces/Equipment";
import Race from "@/interfaces/Race";
import { GeneralPower } from "@/interfaces/Poderes";

// ============================================
// CACHE EM MEMÓRIA (Module-level singletons)
// ============================================

/**
 * Cache de magias - inicializado lazy
 */
let cachedSpells: Spell[] | null = null;

/**
 * Cache de equipamentos - inicializado lazy
 */
let cachedEquipments: Equipment[] | null = null;

/**
 * Cache de equipamentos por categoria - inicializado lazy
 */
let cachedEquipmentsByCategory: any | null = null;

let cachedRaces: Race[] | null = null;
let cachedPowers: GeneralPower[] | null = null;

// ============================================
// FUNÇÕES PÚBLICAS COM CACHE E ASYNC
// ============================================

/**
 * Carrega todas as magias dos arquivos locais
 * ✨ ALTA PERFORMANCE: Usa dynamic input para Code Splitting
 *
 * @returns Promise<Array> de todas as magias
 */
export async function getAllSpells(): Promise<Spell[]> {
  if (cachedSpells) return cachedSpells;

  try {
    const {
      spellsCircle1,
      spellsCircle2,
      spellsCircle3,
      spellsCircle4,
      spellsCircle5,
    } = await import("@/data/magias/generalSpells");

    cachedSpells = [
      ...Object.values(spellsCircle1),
      ...Object.values(spellsCircle2),
      ...Object.values(spellsCircle3),
      ...Object.values(spellsCircle4),
      ...Object.values(spellsCircle5),
    ];

    if (typeof window !== "undefined") {
      console.log(`[LazyLoad] Magias carregadas: ${cachedSpells.length} itens`);
    }

    return cachedSpells;
  } catch (error) {
    console.error("Erro ao carregar magias:", error);
    return [];
  }
}

/**
 * Carrega todos os equipamentos dos arquivos locais
 *
 * @returns Promise<Array> de todos os equipamentos
 */
export async function getAllEquipments(): Promise<Equipment[]> {
  if (cachedEquipments) return cachedEquipments;

  try {
    // Importação dinâmica dos arquivos de equipamentos
    const {
      default: EQUIPAMENTOS,
      Armas,
      Armaduras,
      Escudos,
    } = await import("@/data/equipamentos");
    const { GENERAL_EQUIPMENT } = await import("@/data/equipamentos-gerais");

    cachedEquipments = [
      ...Object.values(Armas),
      ...Object.values(Armaduras),
      ...Object.values(Escudos),
      ...GENERAL_EQUIPMENT.generalItems,
    ];

    if (typeof window !== "undefined") {
      console.log(
        `[LazyLoad] Equipamentos carregados: ${cachedEquipments.length} itens`
      );
    }

    return cachedEquipments;
  } catch (error) {
    console.error("Erro ao carregar equipamentos:", error);
    return [];
  }
}

/**
 * Busca um equipamento específico por nome
 *
 * @param name Nome do equipamento
 * @returns Promise<Equipment | undefined>
 */
export async function findEquipmentByName(
  name: string
): Promise<Equipment | undefined> {
  const allEquipments = await getAllEquipments(); // Usa cache async
  return allEquipments.find(
    (eq) => eq.nome.toLowerCase() === name.toLowerCase()
  );
}

/**
 * Carrega equipamentos agrupados por categoria
 *
 * @returns Promise<Objeto> com arrays por categoria
 */
export async function getEquipmentsByCategory() {
  if (cachedEquipmentsByCategory) return cachedEquipmentsByCategory;

  try {
    const { default: EQUIPAMENTOS } = await import("@/data/equipamentos");
    const { GENERAL_EQUIPMENT } = await import("@/data/equipamentos-gerais");

    cachedEquipmentsByCategory = {
      weapons: [
        ...EQUIPAMENTOS.armasSimples,
        ...EQUIPAMENTOS.armasMarciais,
        ...EQUIPAMENTOS.armasExoticas,
        ...EQUIPAMENTOS.armasDeFogo,
      ],
      armors: [...EQUIPAMENTOS.armadurasLeves, ...EQUIPAMENTOS.armaduraPesada],
      shields: EQUIPAMENTOS.escudos,
      general: GENERAL_EQUIPMENT.generalItems,
      alchemy: GENERAL_EQUIPMENT.alchemyItems,
      clothing: GENERAL_EQUIPMENT.clothingItems,
      food: GENERAL_EQUIPMENT.foodItems,
    };

    if (typeof window !== "undefined") {
      console.log("[LazyLoad] Equipamentos por categoria carregados");
    }

    return cachedEquipmentsByCategory;
  } catch (error) {
    console.error("Erro ao carregar equipamentos por categoria:", error);
    return {
      weapons: [],
      armors: [],
      shields: [],
      general: [],
      alchemy: [],
      clothing: [],
      food: [],
    };
  }
}

/**
 * Carrega todas as raças
 */
export async function getAllRaces(): Promise<Race[]> {
  if (cachedRaces) return cachedRaces;

  try {
    const { default: RACAS } = await import("@/data/racas");
    cachedRaces = RACAS;
    if (typeof window !== "undefined") {
      console.log(`[LazyLoad] Raças carregadas: ${cachedRaces.length}`);
    }
    return cachedRaces;
  } catch (error) {
    console.error("Erro ao carregar raças:", error);
    return [];
  }
}

/**
 * Carrega todos os poderes gerais
 */
export async function getAllPowers(): Promise<GeneralPower[]> {
  if (cachedPowers) return cachedPowers;

  try {
    const { default: generalPowers } = await import("@/data/poderes");
    cachedPowers = [
      ...generalPowers.COMBATE,
      ...generalPowers.CONCEDIDOS,
      ...generalPowers.DESTINO,
      ...generalPowers.MAGIA,
      ...generalPowers.TORMENTA,
    ];
    if (typeof window !== "undefined") {
      console.log(`[LazyLoad] Poderes carregados: ${cachedPowers.length}`);
    }
    return cachedPowers;
  } catch (error) {
    console.error("Erro ao carregar poderes:", error);
    return [];
  }
}

/**
 * Limpa todos os caches
 */
export function clearAllCaches() {
  cachedSpells = null;
  cachedEquipments = null;
  cachedEquipmentsByCategory = null;
  cachedRaces = null;
  cachedPowers = null;

  if (typeof window !== "undefined") {
    console.log("[Cache] Todos os caches limpos");
  }
}
