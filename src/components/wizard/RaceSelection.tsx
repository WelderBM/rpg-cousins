import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import RACAS from "../../data/racas";
import Race from "../../interfaces/Race";
import { useCharacterStore } from "../../store/useCharacterStore";
import {
  ChevronRight,
  ChevronLeft,
  Check,
  Sparkles,
  Swords,
  Brain,
  Feather,
  Info,
  Scale,
  Star,
  Flame,
  Users,
} from "lucide-react";

import { formatAssetName } from "../../utils/assetUtils";

/**
 * Componente de Card de Raça Visual
 */
const RaceCard = React.memo(
  ({ race, onClick }: { race: Race; onClick: () => void }) => {
    const [imageLoaded, setImageLoaded] = useState(false);

    // Use the new automated asset path
    const assetName = formatAssetName(race.name);
    const imagePath = `/assets/races/${assetName}.webp`;

    return (
      <motion.div
        onClick={onClick}
        whileHover={{ scale: 1.05, y: -5 }}
        whileTap={{ scale: 0.98 }}
        className="group relative cursor-pointer"
      >
        <div className="relative bg-gradient-to-br from-amber-900/40 via-amber-700/20 to-amber-900/40 p-[3px] rounded-2xl overflow-hidden shadow-2xl shadow-black/50 hover:shadow-amber-900/50 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-amber-500/0 to-transparent group-hover:via-amber-400/20 transition-all duration-500 opacity-0 group-hover:opacity-100" />
          <div className="relative bg-stone-900/90 backdrop-blur-md rounded-2xl overflow-hidden">
            <div className="relative aspect-square overflow-hidden">
              {!imageLoaded && (
                <div className="absolute inset-0 bg-gradient-to-br from-neutral-800 via-neutral-700 to-neutral-800 animate-pulse">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles className="w-12 h-12 text-amber-500/30 animate-spin" />
                  </div>
                </div>
              )}
              <Image
                src={imagePath}
                alt={race.name}
                fill
                className={`object-cover object-top transition-all duration-700 ${
                  imageLoaded
                    ? "opacity-100 scale-100 group-hover:scale-110"
                    : "opacity-0 scale-105"
                }`}
                onLoad={() => setImageLoaded(true)}
                priority={false}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-300" />
            </div>
            <div className="relative p-4 bg-gradient-to-t from-stone-950 to-stone-900/50 border-t border-amber-700/30">
              <h3 className="text-xl font-cinzel text-center text-amber-100 group-hover:text-amber-300 transition-colors duration-300 drop-shadow-lg">
                {race.name}
              </h3>
              <div className="absolute -top-3 right-4 bg-amber-600 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg shadow-amber-600/50">
                <ChevronRight className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        </div>
      </motion.div>
    );
  }
);
RaceCard.displayName = "RaceCard";

const RaceSelection = () => {
  const selectRace = useCharacterStore((state) => state.selectRace);
  const [selectedPreview, setSelectedPreview] = useState<Race | null>(null);

  return (
    <div className="w-full h-full min-h-screen relative overflow-hidden bg-gradient-to-br from-neutral-950 via-stone-950 to-neutral-950">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(251,191,36,0.1),transparent_50%)]" />
      </div>

      <AnimatePresence mode="wait">
        {!selectedPreview ? (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="relative flex flex-col gap-6 p-4 md:p-8 pb-48 md:pb-32"
          >
            <div className="flex flex-col items-center gap-4 mb-12">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => (window.location.href = "/")}
                  className="p-2 bg-black/40 backdrop-blur-md border border-amber-700/30 rounded-lg text-neutral-400 hover:text-white transition-all flex items-center gap-2 group"
                >
                  <ChevronLeft
                    size={20}
                    className="group-hover:-translate-x-1 transition-transform"
                  />
                  <span className="text-xs uppercase tracking-widest font-bold">
                    Sair
                  </span>
                </button>
                <motion.h2
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-4xl md:text-5xl lg:text-6xl font-cinzel text-amber-500 text-center drop-shadow-[0_0_15px_rgba(251,191,36,0.3)]"
                >
                  Escolha sua Raça
                </motion.h2>
              </div>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-neutral-400 text-center font-cinzel tracking-[0.2em] text-sm md:text-base uppercase"
              >
                Sua jornada em Arton começa aqui
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-5xl mx-auto w-full"
            >
              {RACAS.map((race, index) => (
                <motion.div
                  key={race.name}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: Math.min(0.05 * index, 0.4),
                    duration: 0.2,
                  }}
                  layout
                >
                  <RaceCard
                    race={race}
                    onClick={() => setSelectedPreview(race)}
                  />
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="detail"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="relative flex flex-col h-full min-h-screen max-w-5xl mx-auto w-full"
          >
            {/* Header com imagem de fundo */}
            <div className="relative h-72 md:h-[500px] overflow-hidden">
              <Image
                src={`/assets/races/${formatAssetName(
                  selectedPreview.name
                )}.webp`}
                alt={selectedPreview.name}
                fill
                className="object-cover object-top"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-stone-950" />
              <button
                onClick={() => setSelectedPreview(null)}
                className="absolute top-4 left-4 z-10 flex items-center gap-2 px-4 py-2 bg-black/60 backdrop-blur-md border border-amber-700/30 rounded-lg text-neutral-200 hover:text-amber-400 hover:border-amber-500/50 transition-all"
              >
                <ChevronLeft size={20} />
                <span className="hidden sm:inline">Voltar</span>
              </button>
              <div className="absolute bottom-4 left-4 right-4">
                <h2 className="text-3xl md:text-4xl font-cinzel text-amber-100 drop-shadow-2xl">
                  {selectedPreview.name}
                </h2>
              </div>
            </div>

            {/* Conteúdo scrollável com largura controlada */}
            <div className="flex-1 overflow-y-auto bg-stone-950 p-6 md:p-8 space-y-10 scrollbar-thin scrollbar-thumb-amber-900/30 scrollbar-track-transparent">
              {/* 1. Visão Geral (Lore) */}
              <div className="space-y-6">
                <div className="p-6 bg-amber-500/5 border border-amber-500/10 rounded-2xl relative overflow-hidden group">
                  <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:opacity-10 transition-opacity">
                    <Users size={120} />
                  </div>
                  <h4 className="text-amber-500 font-cinzel text-xl mb-3 flex items-center gap-2">
                    <Info size={18} /> Visão Geral
                  </h4>
                  <p className="text-neutral-300 leading-relaxed italic text-lg border-l-2 border-amber-500/20 pl-4">
                    {selectedPreview.description ||
                      "Uma raça única habitando as terras de Arton."}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3 bg-black/20 p-4 rounded-xl border border-white/5">
                    <h5 className="text-amber-400 font-cinzel flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-bold">
                      <Feather size={14} /> Aparência
                    </h5>
                    <p className="text-sm text-neutral-400 leading-relaxed italic">
                      {selectedPreview.appearance ||
                        "Aparência variada conforme a linhagem."}
                    </p>
                  </div>
                  <div className="space-y-3 bg-black/20 p-4 rounded-xl border border-white/5">
                    <h5 className="text-amber-400 font-cinzel flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-bold">
                      <Brain size={14} /> Personalidade
                    </h5>
                    <p className="text-sm text-neutral-400 leading-relaxed italic">
                      {selectedPreview.personality ||
                        "Traços comportamentais distintos."}
                    </p>
                  </div>
                </div>
              </div>

              {/* 2. Atributos Mecânicos (Visual) */}
              <div className="space-y-6">
                <h3 className="text-lg font-cinzel text-amber-500 flex items-center gap-2">
                  <Swords size={20} />
                  Atributos & Modificadores
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {selectedPreview.attributes.attrs.map(
                    (at: any, i: number) => (
                      <div
                        key={i}
                        className="p-4 bg-black/30 border border-white/5 rounded-xl text-center group hover:border-amber-500/30 transition-all"
                      >
                        <div className="text-[10px] text-neutral-500 uppercase font-bold mb-1 group-hover:text-amber-500/70 transition-colors">
                          {at.attr}
                        </div>
                        <div
                          className={`text-2xl font-cinzel ${
                            at.mod > 0 ? "text-emerald-400" : "text-red-400"
                          }`}
                        >
                          {at.mod > 0 ? "+" : ""}
                          {at.mod}
                        </div>
                      </div>
                    )
                  )}
                  <div className="p-4 bg-black/30 border border-white/5 rounded-xl text-center">
                    <div className="text-[10px] text-neutral-500 uppercase font-bold mb-1">
                      Desloc.
                    </div>
                    <div className="text-2xl font-cinzel text-neutral-200">
                      {selectedPreview.getDisplacement?.(selectedPreview) || 9}m
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Fé & Devoção */}
              <div className="space-y-6">
                <h3 className="text-lg font-cinzel text-amber-500 flex items-center gap-2">
                  <Flame size={20} />
                  Fé & Devoção
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h5 className="text-amber-400 font-cinzel text-[10px] uppercase tracking-wider flex items-center gap-2 font-bold">
                      <Scale size={14} /> Religiões Comuns
                    </h5>
                    <p className="text-sm text-neutral-400 italic bg-black/20 p-4 rounded-xl border border-white/5">
                      {selectedPreview.commonReligions ||
                        "Variada entre o Panteão."}
                    </p>
                  </div>

                  {selectedPreview.faithProbability && (
                    <div className="space-y-4">
                      <h5 className="text-amber-400 font-cinzel text-[10px] uppercase tracking-wider flex items-center gap-2 font-bold">
                        <Star size={14} /> Afinidade Divina
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(selectedPreview.faithProbability).map(
                          ([deus, prob]: [any, any]) => (
                            <div
                              key={deus}
                              className="px-3 py-2 bg-neutral-900/50 border border-neutral-800 rounded-lg flex items-center gap-3"
                            >
                              <span className="text-[10px] font-bold text-neutral-300 uppercase letter-spacing-1">
                                {deus}
                              </span>
                              <div className="flex gap-0.5">
                                {Array.from({ length: 3 }).map((_, i) => (
                                  <div
                                    key={i}
                                    className={`w-1 h-3 rounded-full ${
                                      i < (prob as number)
                                        ? "bg-amber-500 shadow-[0_0_5px_rgba(245,158,11,0.5)]"
                                        : "bg-white/5"
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Habilidades de Raça */}
              <div className="bg-stone-900/50 backdrop-blur-sm border border-amber-900/20 p-6 rounded-xl space-y-6">
                <h3 className="text-lg font-cinzel text-amber-500 mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Habilidades Raciais
                </h3>
                <ul className="space-y-6">
                  {selectedPreview.abilities.map((ability, idx) => (
                    <motion.li
                      key={ability.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="border-l-2 border-amber-700/40 pl-6 group"
                    >
                      <span className="font-cinzel font-bold text-amber-400 text-xl group-hover:text-amber-300 transition-colors">
                        {ability.name}
                      </span>
                      <p className="text-sm text-neutral-300 leading-relaxed mt-3 italic opacity-80 group-hover:opacity-100 transition-opacity">
                        {ability.description}
                      </p>
                    </motion.li>
                  ))}
                </ul>
              </div>

              {/* Dica */}
              <div className="text-center text-[10px] text-neutral-600 uppercase tracking-widest bg-black/40 p-6 rounded-xl border border-neutral-900 select-none pb-32">
                Ao selecionar esta raça, atributos e deslocamento serão
                ajustados automaticamente em sua ficha de personagem.
              </div>
            </div>

            {/* Footer Action - Sticky/Fixed */}
            <div className="fixed bottom-24 md:bottom-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-t from-stone-950 via-stone-950 to-stone-950/90 border-t border-amber-900/20 backdrop-blur-md">
              <div className="max-w-5xl mx-auto">
                <button
                  onClick={() => selectRace(selectedPreview)}
                  className="w-full block py-4 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:via-amber-400 hover:to-amber-500 text-white font-bold rounded-xl shadow-2xl shadow-amber-900/50 hover:shadow-amber-600/50 active:scale-[0.98] transition-all flex justify-center items-center gap-3 group"
                >
                  <Check
                    size={24}
                    className="group-hover:rotate-12 transition-transform"
                  />
                  <span className="text-lg">
                    Confirmar {selectedPreview.name}
                  </span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RaceSelection;
