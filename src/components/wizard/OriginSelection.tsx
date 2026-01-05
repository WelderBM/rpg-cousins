import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { ORIGINS } from "../../data/origins";
import { useCharacterStore } from "../../store/useCharacterStore";
import {
  ChevronRight,
  ChevronLeft,
  Check,
  Book,
  Sparkles,
  AlertTriangle,
} from "lucide-react";
import Origin from "../../interfaces/Origin";
import Skill from "../../interfaces/Skills";
import { GeneralPower, OriginPower } from "../../interfaces/Poderes";

import { formatAssetName } from "../../utils/assetUtils";

/**
 * Componente de Card de Origem Visual
 */
const OriginCard = React.memo(
  ({ origin, onClick }: { origin: Origin; onClick: () => void }) => {
    const [imageLoaded, setImageLoaded] = useState(false);

    const assetName = formatAssetName(origin.name);
    const imagePath = `/assets/origins/${assetName}.webp`;

    return (
      <motion.div
        onClick={onClick}
        whileHover={{ scale: 1.05, y: -5 }}
        whileTap={{ scale: 0.98 }}
        className="group relative cursor-pointer"
      >
        <div className="relative bg-gradient-to-br from-amber-900/40 via-amber-700/20 to-amber-900/40 p-[2px] rounded-2xl overflow-hidden shadow-2xl shadow-black/50 hover:shadow-amber-900/50 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-amber-500/0 to-transparent group-hover:via-amber-400/20 transition-all duration-500 opacity-0 group-hover:opacity-100" />
          <div className="relative bg-stone-900/90 backdrop-blur-md rounded-2xl overflow-hidden">
            <div className="relative aspect-[3/4] overflow-hidden">
              {!imageLoaded && (
                <div className="absolute inset-0 bg-gradient-to-br from-neutral-800 via-neutral-700 to-neutral-800 animate-pulse">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-amber-500/30 animate-spin" />
                  </div>
                </div>
              )}
              <Image
                src={imagePath}
                alt={origin.name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className={`object-cover transition-all duration-700 ${
                  imageLoaded
                    ? "opacity-100 scale-100 group-hover:scale-110"
                    : "opacity-0 scale-105"
                }`}
                onLoad={() => setImageLoaded(true)}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-900/20 to-transparent opacity-60 group-hover:opacity-30 transition-opacity duration-300" />
            </div>
            <div className="relative p-4 bg-gradient-to-t from-stone-950 to-stone-900/50 border-t border-amber-700/30">
              <h3 className="text-xl font-cinzel text-center text-amber-100 group-hover:text-amber-300 transition-colors duration-300 drop-shadow-lg">
                {origin.name}
              </h3>
              <div className="absolute -top-3 right-4 bg-amber-600 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg shadow-amber-600/50">
                <ChevronRight className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }
);
OriginCard.displayName = "OriginCard";

const OriginSelection = () => {
  const {
    selectOrigin,
    selectedOrigin,
    originBenefits,
    setOriginBenefits,
    selectedSkills,
    selectedRace,
    setStep,
  } = useCharacterStore();

  const [selectedPreview, setSelectedPreview] = useState<Origin | null>(null);

  // Combine already known skills to prevent duplicates
  const knownSkills = useMemo(() => {
    return [...selectedSkills];
  }, [selectedSkills]);

  // Handle Selection of Origin for Preview
  const handleSelectPreview = (origin: Origin) => {
    setSelectedPreview(origin);

    // AUTO-SELECT ALL BENEFITS (Mestre Rule: Receive everything available)
    const allBenefits = [
      ...origin.pericias.map((skill) => ({
        type: "skill" as const,
        name: skill,
        value: skill,
      })),
      ...origin.poderes.map((power) => ({
        type: "power" as const, // using 'power' generic type for visuals
        name: power.name,
        value: power,
      })),
    ];
    setOriginBenefits(allBenefits);
  };

  const handleConfirm = () => {
    if (!selectedPreview) return;
    selectOrigin(selectedPreview);
  };

  return (
    <div className="w-full min-h-screen relative bg-stone-950 pb-32">
      <AnimatePresence mode="wait">
        {!selectedPreview ? (
          <motion.div
            key="list"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col gap-8 p-4 md:p-8 max-w-7xl mx-auto pb-48 md:pb-32"
          >
            <div className="flex items-center justify-between mt-4">
              <button
                onClick={() => setStep(3)}
                className="flex items-center gap-2 px-4 py-2 bg-stone-900 border border-amber-900/40 rounded-lg text-neutral-300 hover:text-amber-500 hover:border-amber-500 transition-all z-10"
              >
                <ChevronLeft size={20} />
                <span className="hidden sm:inline">Voltar</span>
              </button>
              <h2 className="text-3xl md:text-5xl font-cinzel text-amber-500 absolute left-0 right-0 text-center pointer-events-none drop-shadow-xl">
                Escolha sua Origem
              </h2>
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-neutral-400 text-center font-cinzel tracking-[0.2em] text-sm md:text-base uppercase -mt-4 opacity-70"
            >
              Cada origem concede{" "}
              <span className="text-amber-500 font-bold">todos</span> os
              benefícios listados.
            </motion.p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {Object.values(ORIGINS)
                // Filter to ensure we only have valid origin objects with unique names
                .filter(
                  (origin, index, self) =>
                    origin &&
                    typeof origin.name === "string" &&
                    self.findIndex((o) => o.name === origin.name) === index
                )
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((origin, index) => (
                  <motion.div
                    key={origin.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <OriginCard
                      origin={origin}
                      onClick={() => handleSelectPreview(origin)}
                    />
                  </motion.div>
                ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="detail"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ duration: 0.3 }}
            className="max-w-4xl mx-auto p-4 md:p-8 space-y-8 pb-48 md:pb-32"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-stone-800 pb-4">
              <button
                onClick={() => setSelectedPreview(null)}
                className="flex items-center text-neutral-400 hover:text-white transition-colors"
                aria-label="Voltar"
              >
                <ChevronLeft size={24} />
                <span className="ml-1 font-bold uppercase tracking-wider text-xs">
                  Voltar
                </span>
              </button>
              <h2 className="text-3xl md:text-4xl font-cinzel text-amber-500 drop-shadow-lg">
                {selectedPreview.name}
              </h2>
              <div className="w-8" />
            </div>

            {/* Selection Area */}
            <div className="bg-stone-900/30 rounded-2xl border border-stone-800 overflow-hidden">
              {/* Image Header Banner */}
              <div className="relative min-h-[250px] flex items-center justify-center p-6">
                <div className="absolute inset-0">
                  <Image
                    src={`/assets/origins/${formatAssetName(
                      selectedPreview.name
                    )}.webp`}
                    alt={selectedPreview.name}
                    fill
                    className="object-cover object-top opacity-40 grayscale-[30%]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-stone-950/80 via-stone-900/60 to-stone-900/90" />
                </div>

                <div className="relative z-10 w-full flex flex-col items-center gap-4">
                  <p className="text-sm text-amber-100/90 italic text-center drop-shadow-md">
                    Todos os benefícios abaixo serão seus.
                  </p>
                  <span className="text-sm font-bold px-4 py-2 rounded-full border bg-emerald-900/60 text-emerald-300 border-emerald-500/50 shadow-xl backdrop-blur-sm">
                    {originBenefits.length} Benefícios Incluídos
                  </span>
                </div>
              </div>

              <div className="p-6 pt-2">
                {/* Skills */}
                <div className="mb-8">
                  <h3 className="text-stone-500 uppercase tracking-widest font-bold text-xs mb-3 flex items-center gap-2">
                    <Book size={14} /> Perícias Incluídas
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedPreview.pericias.map((skill) => {
                      const isKnown = knownSkills.includes(skill);

                      return (
                        <div key={skill} className="group/skill relative">
                          <div
                            className={`px-4 py-2 rounded-lg text-sm font-bold border transition-all flex items-center gap-2 cursor-default
                                      ${
                                        isKnown
                                          ? "bg-amber-950/40 text-amber-200 border-amber-500/50 shadow-[0_0_10px_-5px_var(--color-amber-500)]"
                                          : "bg-emerald-900/20 text-emerald-100 border-emerald-500/30"
                                      }
                                  `}
                          >
                            {skill}
                            {!isKnown && (
                              <Check size={14} className="text-emerald-500" />
                            )}
                            {isKnown && (
                              <AlertTriangle
                                size={14}
                                className="text-amber-500"
                              />
                            )}
                          </div>

                          {/* Tooltip for Known Skills */}
                          {isKnown && (
                            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-64 p-3 bg-stone-950 border border-amber-500/30 rounded-xl text-xs text-amber-100 shadow-2xl opacity-0 group-hover/skill:opacity-100 transition-opacity pointer-events-none z-50 text-center backdrop-blur-md">
                              <p className="font-bold mb-1 text-amber-500">
                                Atenção!
                              </p>
                              Você já possui treinamento nesta perícia (via Raça
                              ou Classe). Considere escolher outra Origem para
                              maximizar seus benefícios.
                              <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-stone-950"></div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                    {selectedPreview.pericias.length === 0 && (
                      <span className="text-stone-600 text-sm italic">
                        Nenhuma perícia específica.
                      </span>
                    )}
                  </div>
                </div>

                {/* Powers */}
                <div>
                  <h3 className="text-stone-500 uppercase tracking-widest font-bold text-xs mb-3 flex items-center gap-2">
                    <Check size={14} /> Poderes Incluídos
                  </h3>
                  <div className="grid gap-3">
                    {selectedPreview.poderes.map((power: any, idx: number) => {
                      const name = power.name;
                      return (
                        <div
                          key={idx}
                          className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-900/10 transition-all relative group"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-bold font-cinzel text-lg text-emerald-100">
                              {name}
                            </span>
                            <div className="bg-emerald-500/20 text-emerald-400 p-1 rounded-full">
                              <Check size={14} />
                            </div>
                          </div>
                          <p className="text-sm text-stone-400 leading-relaxed">
                            {(power as any).text ||
                              (power as any).description ||
                              "Descrição indisponível."}
                          </p>
                        </div>
                      );
                    })}
                    {selectedPreview.poderes.length === 0 && (
                      <span className="text-stone-600 text-sm italic">
                        Nenhum poder específico.
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Items Summary (Just visuals) */}
            <div className="bg-black/20 p-6 rounded-xl border border-stone-800/50">
              <h4 className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-3">
                Itens Iniciais (Automáticos)
              </h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-stone-400">
                {selectedPreview.getItems ? (
                  selectedPreview.getItems().map((item, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-stone-700 rounded-full" />
                      {item.qtd ? `${item.qtd}x ` : ""}
                      {typeof item.equipment === "string"
                        ? item.equipment
                        : item.description}
                    </li>
                  ))
                ) : (
                  <li className="italic opacity-50">Itens padrão da origem.</li>
                )}
              </ul>
            </div>

            {/* ACTION FOOTER */}
            <div className="fixed bottom-24 md:bottom-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-t from-stone-950 via-stone-950/95 to-transparent backdrop-blur-md z-30 border-t border-amber-900/20">
              <div className="max-w-4xl mx-auto">
                <button
                  onClick={handleConfirm}
                  className="w-full py-4 font-bold font-cinzel text-lg rounded-xl shadow-2xl transition-all flex justify-center items-center gap-3 active:scale-[0.99] bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-stone-950 shadow-amber-900/20 hover:scale-[1.01]"
                >
                  <Check size={24} /> Confirmar Origem
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OriginSelection;
