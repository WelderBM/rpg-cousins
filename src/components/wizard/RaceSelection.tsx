import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import RACAS from "../../data/racas"; // Assuming relative path
import Race from "../../interfaces/Race";
import { useCharacterStore } from "../../store/useCharacterStore";
import { ChevronRight, ChevronLeft, Check } from "lucide-react";

const RaceSelection = () => {
  const selectRace = useCharacterStore((state) => state.selectRace);
  const [selectedPreview, setSelectedPreview] = useState<Race | null>(null);

  return (
    <div className="w-full h-full min-h-[60vh] relative overflow-hidden">
      <AnimatePresence mode="wait">
        {!selectedPreview ? (
          <motion.div
            key="list"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col gap-4 p-4"
          >
            <h2 className="text-2xl font-cinzel text-amber-500 mb-4 text-center">
              Escolha sua Raça
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-20">
              {RACAS.map((race) => (
                <div
                  key={race.name}
                  onClick={() => setSelectedPreview(race)}
                  className="bg-neutral-900/80 border border-neutral-700 hover:border-amber-500/50 p-4 rounded-xl cursor-pointer transition-all hover:bg-neutral-800 flex justify-between items-center group"
                >
                  <span className="text-lg font-cinzel text-neutral-200 group-hover:text-amber-400">
                    {race.name}
                  </span>
                  <ChevronRight className="text-neutral-500 group-hover:text-amber-500" />
                </div>
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
            className="flex flex-col h-full bg-neutral-900 rounded-lg overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 bg-neutral-950 flex items-center justify-between border-b border-neutral-800">
              <button
                onClick={() => setSelectedPreview(null)}
                className="flex items-center text-neutral-400 hover:text-white transition-colors"
                aria-label="Voltar"
              >
                <ChevronLeft size={24} />
                <span className="ml-1">Voltar</span>
              </button>
              <h2 className="text-xl font-cinzel text-amber-500">
                {selectedPreview.name}
              </h2>
              <div className="w-8" /> {/* Spacer for centering */}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-transparent">
              {/* Stats Summary - Simplified for now, showing ability names */}
              <div className="bg-neutral-950/50 p-4 rounded-lg border border-neutral-800">
                <h3 className="text-sm uppercase tracking-wider text-neutral-500 mb-2">
                  Habilidades de Raça
                </h3>
                <ul className="space-y-4">
                  {selectedPreview.abilities.map((ability) => (
                    <li key={ability.name} className="flex flex-col">
                      <span className="font-bold text-amber-500/90">
                        {ability.name}
                      </span>
                      <p className="text-sm text-neutral-300 leading-relaxed mt-1">
                        {ability.description}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Modifiers Hint */}
              <div className="text-xs text-neutral-500 italic text-center">
                Ao selecionar esta raça, atributos e deslocamento serão
                ajustados automaticamente.
              </div>
            </div>

            {/* Footer Action */}
            <div className="p-4 bg-neutral-950 border-t border-neutral-800 sticky bottom-0">
              <button
                onClick={() => selectRace(selectedPreview)}
                className="w-full py-4 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg shadow-lg shadow-amber-900/20 active:scale-[0.98] transition-all flex justify-center items-center gap-2"
              >
                <Check size={20} />
                Confirmar {selectedPreview.name}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RaceSelection;
