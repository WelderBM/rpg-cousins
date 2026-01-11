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

import { formatAssetName, getRaceImageName } from "../../utils/assetUtils";

/**
 * Componente de Card de Raça Visual
 */
const RaceCard = React.memo(
  ({ race, onClick }: { race: Race; onClick: () => void }) => {
    const [imageLoaded, setImageLoaded] = useState(false);

    // Use the new automated asset path
    // Use the new automated asset path
    const assetName = getRaceImageName(race.name);
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
            <div className="relative p-2 md:p-4 bg-gradient-to-t from-stone-950 to-stone-900/50 border-t border-amber-700/30">
              <h3 className="text-sm md:text-xl font-cinzel text-center text-amber-100 group-hover:text-amber-300 transition-colors duration-300 drop-shadow-lg">
                {race.name}
              </h3>
              <div className="absolute -top-3 right-2 md:right-4 bg-amber-600 rounded-full p-1 md:p-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg shadow-amber-600/50">
                <ChevronRight className="w-3 h-3 md:w-4 md:h-4 text-white" />
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
  const { selectRace, setStep, wizardDrafts, setWizardDraft } =
    useCharacterStore();
  const [selectedPreview, setSelectedPreview] = useState<Race | null>(null);

  // Sync LOCAL state with STORE draft
  React.useEffect(() => {
    const draft = wizardDrafts.race;
    if (draft.previewName) {
      const race = RACAS.find((r) => r.name === draft.previewName);
      if (race) {
        setSelectedPreview(race);
      }
    }
  }, []);

  // Sync draft whenever state changes
  React.useEffect(() => {
    setWizardDraft("race", {
      previewName: selectedPreview?.name || null,
    });
  }, [selectedPreview, setWizardDraft]);

  // Scroll to top when entering preview
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [selectedPreview]);

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
            className="flex flex-col gap-8 p-4 md:p-8 max-w-7xl mx-auto pb-48 md:pb-32"
          >
            <div className="sticky top-0 z-40 bg-stone-950/90 backdrop-blur-md py-4 flex items-center justify-between border-b border-amber-900/20 shadow-lg -mx-8 px-8">
              <button
                onClick={() =>
                  (window.location.href = "/herois?tab=novo-heroi")
                }
                className="p-2 bg-stone-900 border border-amber-700/30 rounded-lg text-neutral-400 hover:text-white transition-all flex items-center gap-2 group text-sm z-10"
              >
                <ChevronLeft
                  size={20}
                  className="group-hover:-translate-x-1 transition-transform"
                />
                <span className="hidden sm:inline uppercase tracking-widest font-bold">
                  Sair
                </span>
              </button>
              <h2 className="text-2xl md:text-4xl font-cinzel text-amber-500 absolute left-0 right-0 text-center pointer-events-none drop-shadow-xl">
                Escolha sua Raça
              </h2>
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-neutral-400 text-center font-cinzel tracking-[0.2em] text-sm md:text-base uppercase -mt-4"
            >
              Sua jornada em Arton começa aqui
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6 w-full"
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
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="max-w-2xl mx-auto w-full p-4 md:p-8 space-y-6 pb-32"
          >
            {/* Sticky Header for Detail View */}
            <div className="sticky top-0 z-50 bg-stone-950/90 backdrop-blur-md py-4 flex items-center justify-between border-b border-amber-900/20 shadow-lg mb-6 -mx-4 px-4 md:-mx-8 md:px-8">
              <button
                onClick={() => {
                  setSelectedPreview(null);
                  setWizardDraft("race", { previewName: null });
                }}
                className="flex items-center gap-2 px-3 py-2 bg-stone-900/80 border border-amber-900/40 rounded-lg text-neutral-300 hover:text-amber-500 hover:border-amber-500 transition-all z-10 text-sm"
              >
                <ChevronLeft size={18} />
                <span className="hidden sm:inline">Voltar</span>
              </button>
              <h2 className="text-xl md:text-2xl font-cinzel text-amber-500 absolute left-0 right-0 text-center pointer-events-none drop-shadow-xl">
                {selectedPreview.name}
              </h2>
            </div>

            {/* Header com imagem de fundo */}
            <div className="relative h-48 md:h-72 overflow-hidden bg-stone-950 rounded-2xl border border-white/5">
              {/* Background Image */}
              <div className="absolute inset-0 flex items-center justify-center bg-stone-950">
                <Image
                  src={`/assets/races/${getRaceImageName(
                    selectedPreview.name
                  )}.webp`}
                  alt={selectedPreview.name}
                  width={600}
                  height={900}
                  className="object-contain opacity-100 h-full w-auto"
                  style={{ maxHeight: "100%" }}
                  priority
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-stone-950" />
              <div className="absolute bottom-4 left-4 md:left-6 z-10">
                <h2 className="text-2xl md:text-4xl font-cinzel text-amber-100 drop-shadow-2xl">
                  {selectedPreview.name}
                </h2>
              </div>
            </div>

            {/* Lore Compacta */}
            <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-4 italic text-sm md:text-base text-stone-300 leading-relaxed">
              {selectedPreview.description}
            </div>

            {/* Atributos Grid */}
            <div className="space-y-3">
              <h3 className="text-[10px] font-black text-amber-500/50 uppercase tracking-[0.2em] flex items-center gap-2">
                <Swords size={12} /> Atributos Raciais
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {selectedPreview.attributes.attrs.map((at, i) => (
                  <div
                    key={i}
                    className="bg-stone-900/50 border border-stone-800 p-3 rounded-xl flex items-center justify-between"
                  >
                    <span className="text-xs font-bold text-stone-500 uppercase">
                      {at.attr}
                    </span>
                    <span
                      className={`text-lg font-cinzel font-bold ${
                        at.mod > 0 ? "text-emerald-500" : "text-red-400"
                      }`}
                    >
                      {at.mod > 0 ? "+" : ""}
                      {at.mod}
                    </span>
                  </div>
                ))}
                <div className="bg-stone-900/50 border border-stone-800 p-3 rounded-xl flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-500 uppercase">
                    Passo
                  </span>
                  <span className="text-lg font-cinzel font-bold text-stone-200">
                    {selectedPreview.getDisplacement?.(selectedPreview) || 9}m
                  </span>
                </div>
              </div>
            </div>

            {/* Habilidades Raciais */}
            <div className="space-y-3">
              <h3 className="text-[10px] font-black text-amber-500/50 uppercase tracking-[0.2em] flex items-center gap-2">
                <Sparkles size={12} /> Habilidades de {selectedPreview.name}
              </h3>
              <div className="space-y-3">
                {selectedPreview.abilities.map((ability, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-stone-900/30 border border-stone-800/50"
                  >
                    <h4 className="font-bold text-amber-200 text-sm mb-1">
                      {ability.name}
                    </h4>
                    <p className="text-xs text-stone-400 leading-relaxed">
                      {ability.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Devoção */}
            <div className="space-y-3">
              <h3 className="text-[10px] font-black text-amber-500/50 uppercase tracking-[0.2em] flex items-center gap-2">
                <Flame size={12} /> Fé & Devoção
              </h3>
              <div className="p-4 rounded-xl bg-black/20 border border-white/5 italic text-xs text-stone-500">
                {selectedPreview.commonReligions || "Variada."}
              </div>
            </div>

            {/* Footer Action */}
            <div className="fixed bottom-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-t from-stone-950 via-stone-950 to-transparent backdrop-blur-md z-50">
              <div className="max-w-2xl mx-auto">
                <button
                  onClick={() => selectRace(selectedPreview)}
                  className="w-full py-4 bg-amber-600 hover:bg-amber-500 text-stone-950 font-black rounded-xl shadow-2xl active:scale-95 transition-all flex justify-center items-center gap-2 group uppercase tracking-widest text-sm"
                >
                  <Check size={20} />
                  Confirmar {selectedPreview.name}
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
