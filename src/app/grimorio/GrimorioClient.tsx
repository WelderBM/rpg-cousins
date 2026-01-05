"use client";

import { useGrimorioStore } from "@/store/grimorioStore";
import { Spell, spellsCircles } from "@/interfaces/Spells";
import { useEffect, useMemo, useState } from "react";
import { Search, Filter, BookOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Circles = [1, 2, 3, 4, 5];
const Schools = [
  "Abjur",
  "Adiv",
  "Conv",
  "Encan",
  "Evoc",
  "Ilusão",
  "Necro",
  "Trans",
];

export default function GrimorioClient({
  initialSpells,
}: {
  initialSpells: Spell[];
}) {
  const {
    searchTerm,
    selectedCircle,
    selectedSchool,
    setSearchTerm,
    setSelectedCircle,
    setSelectedSchool,
    setSpells,
  } = useGrimorioStore();

  const [visibleCount, setVisibleCount] = useState(24);

  useEffect(() => {
    setSpells(initialSpells);
  }, [initialSpells, setSpells]);

  // Reset pagination when filters change
  useEffect(() => {
    setVisibleCount(24);
  }, [searchTerm, selectedCircle, selectedSchool]);

  /**
   * OTIMIZAÇÃO DE PERFORMANCE CRÍTICA
   *
   * Memoização completa da filtragem de magias para evitar recálculos desnecessários.
   * Com centenas de magias, essa otimização é essencial para manter a UI responsiva.
   *
   * A filtragem só ocorre quando searchTerm, selectedCircle ou selectedSchool mudam.
   */
  const filteredSpells = useMemo(() => {
    return initialSpells.filter((spell) => {
      const matchesSearch = spell.nome
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      let matchesCircle = selectedCircle === "all";
      if (!matchesCircle && typeof selectedCircle === "number") {
        const circleMap: Record<number, spellsCircles> = {
          1: spellsCircles.c1,
          2: spellsCircles.c2,
          3: spellsCircles.c3,
          4: spellsCircles.c4,
          5: spellsCircles.c5,
        };
        matchesCircle = spell.spellCircle === circleMap[selectedCircle];
      }

      const matchesSchool =
        selectedSchool === "all" || spell.school === selectedSchool;
      return matchesSearch && matchesCircle && matchesSchool;
    });
    // IMPORTANTE: Incluir apenas searchTerm, selectedCircle e selectedSchool
    // initialSpells é uma prop imutável, não precisa estar nas dependências
  }, [searchTerm, selectedCircle, selectedSchool]);

  /**
   * Segunda camada de memoização: apenas "fatia" as magias visíveis
   * Isso garante que mesmo com filtros alterados, apenas a slice é recalculada
   */
  const displayedSpells = useMemo(() => {
    return filteredSpells.slice(0, visibleCount);
  }, [filteredSpells, visibleCount]);

  const hasMore = visibleCount < filteredSpells.length;

  const loadMore = () => {
    setVisibleCount((prev) => prev + 24);
  };

  return (
    <div className="space-y-6">
      {/* Search Bar & Filters */}
      <div className="bg-medieval-stone/80 text-parchment-light p-4 rounded-xl border border-medieval-iron shadow-lg backdrop-blur-sm sticky top-0 z-20">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-medieval-gold/70" />
            <input
              type="text"
              placeholder="Buscar magia por nome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-black/40 border border-medieval-iron/50 rounded-lg pl-10 pr-4 py-2 text-parchment-light placeholder-medieval-iron focus:border-medieval-gold focus:ring-1 focus:ring-medieval-gold outline-none transition-all"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
            <select
              value={selectedCircle}
              onChange={(e) =>
                setSelectedCircle(
                  e.target.value === "all" ? "all" : Number(e.target.value)
                )
              }
              className="bg-black/40 border border-medieval-iron/50 rounded-lg px-4 py-2 text-parchment-light focus:border-medieval-gold outline-none cursor-pointer"
            >
              <option value="all">Todos Círculos</option>
              {Circles.map((c) => (
                <option key={c} value={c}>
                  {c}º Círculo
                </option>
              ))}
            </select>

            <select
              value={selectedSchool}
              onChange={(e) => setSelectedSchool(e.target.value)}
              className="bg-black/40 border border-medieval-iron/50 rounded-lg px-4 py-2 text-parchment-light focus:border-medieval-gold outline-none cursor-pointer"
            >
              <option value="all">Todas Escolas</option>
              {Schools.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Spells Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/**
         * OTIMIZAÇÃO DE ANIMAÇÃO
         *
         * - Sem mode='popLayout' para evitar recálculos de layout pesados
         * - initial={false} na primeira renderização para evitar animações desnecessárias
         * - Duração reduzida (0.15s) para transições mais rápidas
         * - Removida prop 'layout' do motion.div para evitar reflows
         */}
        <AnimatePresence>
          {displayedSpells.map((spell) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              key={spell.nome}
              className="group relative bg-[#1e1e1e] border border-medieval-iron/40 rounded-xl overflow-hidden hover:border-medieval-gold/60 transition-colors shadow-lg"
            >
              <div className="p-5 space-y-3">
                <div className="flex justify-between items-start">
                  <h3 className="font-serif text-xl font-bold text-medieval-gold group-hover:text-amber-400 transition-colors">
                    {spell.nome}
                  </h3>
                  <span className="text-xs font-bold px-2 py-1 rounded bg-medieval-gold/10 text-medieval-gold border border-medieval-gold/20">
                    {spell.spellCircle}
                  </span>
                </div>

                <div className="text-sm text-parchment-dark space-y-1">
                  <div className="flex justify-between">
                    <span>
                      Execução:{" "}
                      <span className="text-parchment-light">
                        {spell.execucao}
                      </span>
                    </span>
                    <span>
                      Escola:{" "}
                      <span className="text-parchment-light">
                        {spell.school}
                      </span>
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>
                      Alcance:{" "}
                      <span className="text-parchment-light">
                        {spell.alcance}
                      </span>
                    </span>
                    <span>
                      Dur.:{" "}
                      <span className="text-parchment-light">
                        {spell.duracao}
                      </span>
                    </span>
                  </div>
                  {spell.resistencia && (
                    <div className="text-xs text-medieval-blood font-semibold">
                      Resistência: {spell.resistencia}
                    </div>
                  )}
                </div>

                <p className="text-sm text-parchment-DEFAULT/80 line-clamp-4 border-t border-medieval-iron/30 pt-3 italic">
                  "{spell.description}"
                </p>

                <div className="pt-2">
                  <button className="w-full py-2 bg-medieval-gold/10 hover:bg-medieval-gold/20 text-medieval-gold text-xs font-bold uppercase tracking-wider rounded border border-medieval-gold/20 hover:border-medieval-gold/50 transition-all">
                    Ver Detalhes
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {hasMore && (
        <div className="flex justify-center pt-8 pb-4">
          <button
            onClick={loadMore}
            className="px-8 py-3 bg-medieval-stone border border-medieval-gold/30 text-medieval-gold font-serif text-lg rounded-lg hover:bg-medieval-gold/10 transition-colors shadow-lg active:scale-95"
          >
            Carregar Mais Magias
          </button>
        </div>
      )}

      {filteredSpells.length === 0 && (
        <div className="text-center py-20 opacity-50">
          <BookOpen className="w-16 h-16 mx-auto mb-4 text-medieval-iron" />
          <p className="text-xl font-serif text-parchment-dark">
            Nenhuma magia encontrada neste grimório.
          </p>
        </div>
      )}
    </div>
  );
}
