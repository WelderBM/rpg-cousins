import React from "react";
import { Search, X, Filter, ChevronUp, ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { CATEGORIES } from "../constants";
import { Category } from "../types";

interface WikiControlsProps {
  activeCategory: Category;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  isFiltersOpen: boolean;
  setIsFiltersOpen: (isOpen: boolean) => void;
  filteredCount: number;

  // Magias Filters
  spellCircle: number | "all";
  setSpellCircle: (v: number | "all") => void;
  spellSchool: string | "all";
  setSpellSchool: (v: string | "all") => void;
  spellExecution: string | "all";
  setSpellExecution: (v: string | "all") => void;
  spellRange: string | "all";
  setSpellRange: (v: string | "all") => void;
  spellDuration: string | "all";
  setSpellDuration: (v: string | "all") => void;
  spellTarget: string;
  setSpellTarget: (v: string) => void;

  // Equip/Mercado Filters
  equipGroup: string | "all";
  setEquipGroup: (v: string | "all") => void;
  equipSubGroup: string | "all";
  setEquipSubGroup: (v: string | "all") => void;
  maxPrice: number | "";
  setMaxPrice: (v: number | "") => void;

  // Power Filters
  powerType: string | "all";
  setPowerType: (v: string | "all") => void;

  resetFilters: () => void;
  isEmbedded?: boolean;
}

export function WikiControls(props: WikiControlsProps) {
  const {
    activeCategory,
    searchQuery,
    setSearchQuery,
    isFiltersOpen,
    setIsFiltersOpen,
    filteredCount,
    spellCircle,
    setSpellCircle,
    spellSchool,
    setSpellSchool,
    spellExecution,
    setSpellExecution,
    spellRange,
    setSpellRange,
    spellDuration,
    setSpellDuration,
    spellTarget,
    setSpellTarget,
    equipGroup,
    setEquipGroup,
    equipSubGroup,
    setEquipSubGroup,
    maxPrice,
    setMaxPrice,
    powerType,
    setPowerType,
    resetFilters,
    isEmbedded = false,
  } = props;

  const isAnyFilterActive =
    spellCircle !== "all" ||
    spellSchool !== "all" ||
    spellExecution !== "all" ||
    spellRange !== "all" ||
    spellDuration !== "all" ||
    spellTarget !== "" ||
    equipGroup !== "all" ||
    equipSubGroup !== "all" ||
    powerType !== "all" ||
    maxPrice !== "";

  return (
    <header
      className={cn(
        "bg-gradient-to-b from-stone-900/50 to-transparent z-40 backdrop-blur-sm transition-all duration-300",
        isEmbedded
          ? "sticky top-[48px] p-3 pt-1"
          : "p-4 md:p-8 md:sticky md:top-0"
      )}
    >
      <div className="max-w-5xl mx-auto flex flex-col gap-4 md:gap-6">
        {/* Search Bar */}
        <div className="relative group">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-amber-500 transition-colors"
            size={20}
          />
          <input
            type="text"
            placeholder={`Buscar em ${
              CATEGORIES.find((c) => c.id === activeCategory)?.label
            }...`}
            className="w-full bg-neutral-900/80 border-2 border-neutral-800 rounded-2xl py-3 md:py-4 pl-12 pr-4 text-neutral-100 focus:outline-none focus:border-amber-500/50 focus:bg-neutral-900 transition-all shadow-xl placeholder:text-neutral-600 text-sm md:text-base"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-full text-neutral-500"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Status Bar & Filter Toggle */}
        <div className="flex items-center justify-between text-xs text-neutral-500">
          <div className="flex gap-4">
            <span>
              Encontrados: <b className="text-amber-500">{filteredCount}</b>
            </span>
            <span className="hidden sm:inline">|</span>
            <span className="hidden sm:inline">
              Fonte: <b className="text-neutral-400 italic">Tormenta20 JDA</b>
            </span>
          </div>
          <button
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            className={`flex items-center gap-2 transition-colors cursor-pointer px-3 py-1.5 rounded-lg border ${
              isFiltersOpen || isAnyFilterActive
                ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                : "border-transparent hover:text-amber-400"
            }`}
          >
            <Filter size={14} />
            <span>Filtros</span>
            {isFiltersOpen ? (
              <ChevronUp size={14} />
            ) : (
              <ChevronDown size={14} />
            )}
          </button>
        </div>

        {/* Filter Panel */}
        <AnimatePresence>
          {isFiltersOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-neutral-900/50 border border-amber-900/20 rounded-2xl p-4 md:p-6 space-y-4">
                {/* Magias Filters */}
                {activeCategory === "magias" && (
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    <FilterSelect
                      label="Círculo"
                      value={spellCircle}
                      onChange={(v) =>
                        setSpellCircle(v === "all" ? "all" : Number(v))
                      }
                      options={[
                        { value: "all", label: "Todos" },
                        { value: "1", label: "1º Círculo" },
                        { value: "2", label: "2º Círculo" },
                        { value: "3", label: "3º Círculo" },
                        { value: "4", label: "4º Círculo" },
                        { value: "5", label: "5º Círculo" },
                      ]}
                    />
                    <FilterSelect
                      label="Escola"
                      value={spellSchool}
                      onChange={setSpellSchool}
                      options={[
                        { value: "all", label: "Todas" },
                        { value: "Abjur", label: "Abjuração" },
                        { value: "Adiv", label: "Adivinhação" },
                        { value: "Conv", label: "Convocação" },
                        { value: "Encan", label: "Encantamento" },
                        { value: "Evoc", label: "Evocação" },
                        { value: "Ilusão", label: "Ilusão" },
                        { value: "Necro", label: "Necromancia" },
                        { value: "Trans", label: "Transmutação" },
                      ]}
                    />
                    <FilterSelect
                      label="Execução"
                      value={spellExecution}
                      onChange={setSpellExecution}
                      options={[
                        { value: "all", label: "Qualquer" },
                        { value: "Padrão", label: "Padrão" },
                        { value: "Movimento", label: "Movimento" },
                        { value: "Completa", label: "Completa" },
                        { value: "Livre", label: "Livre" },
                        { value: "Reação", label: "Reação" },
                      ]}
                    />
                    <FilterSelect
                      label="Alcance"
                      value={spellRange}
                      onChange={setSpellRange}
                      options={[
                        { value: "all", label: "Qualquer" },
                        { value: "Pessoal", label: "Pessoal" },
                        { value: "Toque", label: "Toque" },
                        { value: "Curto", label: "Curto" },
                        { value: "Médio", label: "Médio" },
                        { value: "Longo", label: "Longo" },
                        { value: "Ilimitado", label: "Ilimitado" },
                      ]}
                    />
                    <FilterSelect
                      label="Duração"
                      value={spellDuration}
                      onChange={setSpellDuration}
                      options={[
                        { value: "all", label: "Qualquer" },
                        { value: "Instantânea", label: "Instantânea" },
                        { value: "Cena", label: "Cena" },
                        { value: "Sustentada", label: "Sustentada" },
                        { value: "1 dia", label: "1 Dia" },
                        { value: "Permanente", label: "Permanente" },
                      ]}
                    />

                    <div>
                      <label className="block text-[10px] uppercase font-bold text-neutral-500 mb-2">
                        Alvo/Área
                      </label>
                      <input
                        type="text"
                        value={spellTarget}
                        onChange={(e) => setSpellTarget(e.target.value)}
                        placeholder="Ex: Criatura"
                        className="w-full bg-black/40 border border-neutral-800 rounded-lg p-2 text-xs text-neutral-300 outline-none focus:border-amber-500/50"
                      />
                    </div>
                  </div>
                )}

                {/* Equipment / Mercado Filters */}
                {(activeCategory === "equipamentos" ||
                  activeCategory === "mercado") && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <FilterSelect
                      label="Grupo"
                      value={equipGroup}
                      onChange={(v) => {
                        setEquipGroup(v);
                        setEquipSubGroup("all"); // Reset sub-group when group changes
                      }}
                      options={[
                        { value: "all", label: "Todos" },
                        { value: "Arma", label: "Armas" },
                        { value: "Armadura", label: "Armaduras" },
                        { value: "Escudo", label: "Escudos" },
                        { value: "Item Geral", label: "Itens Gerais" },
                        { value: "Vestuário", label: "Vestuário" },
                        { value: "Alquimía", label: "Alquimía" },
                        { value: "Alimentação", label: "Alimentação" },
                      ]}
                    />

                    {/* Dynamic SubGroup Filter */}
                    {equipGroup !== "all" && (
                      <FilterSelect
                        label="Sub-Categoria"
                        value={equipSubGroup}
                        onChange={setEquipSubGroup}
                        options={[
                          { value: "all", label: "Todas" },
                          ...(equipGroup === "Arma"
                            ? [
                                {
                                  value: "Armas Simples",
                                  label: "Armas Simples",
                                },
                                {
                                  value: "Armas Marciais",
                                  label: "Armas Marciais",
                                },
                                {
                                  value: "Armas Exóticas",
                                  label: "Armas Exóticas",
                                },
                                {
                                  value: "Armas de Fogo",
                                  label: "Armas de Fogo",
                                },
                              ]
                            : []),
                          ...(equipGroup === "Armadura"
                            ? [
                                {
                                  value: "Armadura Leve",
                                  label: "Armadura Leve",
                                },
                                {
                                  value: "Armadura Pesada",
                                  label: "Armadura Pesada",
                                },
                              ]
                            : []),
                          ...(equipGroup === "Item Geral"
                            ? [
                                { value: "Aventureiro", label: "Aventureiro" },
                                { value: "Ferramentas", label: "Ferramentas" },
                                { value: "Esotérico", label: "Esotéricos" },
                              ]
                            : []),
                          ...(equipGroup === "Alquimía"
                            ? [
                                {
                                  value: "Alquimia (Preparados)",
                                  label: "Preparados",
                                },
                                {
                                  value: "Alquimia (Catalisadores)",
                                  label: "Catalisadores",
                                },
                                {
                                  value: "Alquimia (Venenos)",
                                  label: "Venenos",
                                },
                              ]
                            : []),
                        ]}
                      />
                    )}

                    <div>
                      <label className="block text-[10px] uppercase font-bold text-neutral-500 mb-2">
                        Preço Máximo (T$)
                      </label>
                      <input
                        type="number"
                        value={maxPrice}
                        onChange={(e) =>
                          setMaxPrice(
                            e.target.value === "" ? "" : Number(e.target.value)
                          )
                        }
                        placeholder="Ex: 100"
                        className="w-full bg-black/40 border border-neutral-800 rounded-lg p-2 text-xs text-neutral-300 outline-none focus:border-amber-500/50"
                      />
                    </div>
                  </div>
                )}

                {/* Power Filters */}
                {activeCategory === "poderes" && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <FilterSelect
                      label="Tipo"
                      value={powerType}
                      onChange={setPowerType}
                      options={[
                        { value: "all", label: "Todos" },
                        { value: "COMBATE", label: "Combate" },
                        { value: "DESTINO", label: "Destino" },
                        { value: "MAGIA", label: "Magia" },
                        { value: "CONCEDIDOS", label: "Concedido" },
                        { value: "TORMENTA", label: "Tormenta" },
                      ]}
                    />
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <button
                    onClick={resetFilters}
                    className="text-[10px] uppercase font-bold text-neutral-500 hover:text-red-400 transition-colors flex items-center gap-1"
                  >
                    <X size={12} /> Limpar Filtros
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: any;
  onChange: (v: any) => void;
  options: { value: string | number; label: string }[];
}) {
  return (
    <div>
      <label className="block text-[10px] uppercase font-bold text-neutral-500 mb-2">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-black/40 border border-neutral-800 rounded-lg p-2 text-xs text-neutral-300 outline-none focus:border-amber-500/50"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
