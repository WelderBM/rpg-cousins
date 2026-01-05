import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DIVINDADES, standardFaithProbability } from "../../data/divindades";
import { useCharacterStore } from "../../store/useCharacterStore";
import { ChevronRight, ChevronLeft, Check, AlertTriangle } from "lucide-react";
import Divindade, { DivindadeNames } from "../../interfaces/Divindade";
import { GeneralPower } from "../../interfaces/Poderes";

// Restrictions data (Mocked based on T20 common knowledge since not in files)
// This is a minimal set for the demo.
const DEITY_RESTRICTIONS: Record<string, string> = {
  Aharadak:
    "Devotos de Aharadak não podem recusar uma oportunidade de espalhar a Tormenta.",
  Oceano:
    "Devotos de Oceano não podem viver longe do mar. Não podem usar armaduras pesadas.",
  Tenebra:
    "Devotos de Tenebra não podem ser expostos à luz do sol direta por longos períodos. Preferem a noite.",
  Valkaria: "Devotos de Valkaria não podem recusar uma aventura ou desafio.",
  Wynna:
    "Devotos de Wynna devem sempre aprender novas magias quando possível. Não podem negar ensino de magia.",
  Lena: "Devotos de Lena não podem causar dano letal em seres vivos. Apenas cura e proteção.",
  Sszzaas:
    "Devotos de Sszzaas devem sempre tramar e nunca podem ser confiáveis, mas não podem ser descobertos.",
  Thyatis:
    "Devotos de Thyatis não podem matar seres inteligentes, pois todo mundo merece uma segunda chance.",
  Arsenal:
    "Devotos de Arsenal nunca podem recuar de uma batalha ou demonstrar fraqueza.",
  "Tanna-Toh":
    "Devotos de Tanna-Toh não podem mentir. Devem sempre buscar a verdade.",
  Allihanna:
    "Devotos de Allihanna não podem usar armaduras de metal. Devem proteger a natureza.",
  Marah:
    "Devotos de Marah não podem causar qualquer tipo de dano a ninguém (voto de paz absoluta).",
  Kallyadranoch:
    "Devotos de Kally não podem ser submissos. Devem acumular poder e ouro.",
  Khalmyr:
    "Devotos de Khalmyr não podem desobedecer ordens justas ou leis locais, e nunca podem trapacear.",
  Thwor:
    'Devotos de Thwor devem lutar pela união dos goblinoides e destruição da "civilização".',
  Hyninn:
    "Devotos de Hyninn devem trapacear sempre que possível sem serem pegos.",
  Azgher: "Devotos de Azgher devem cobrir o rosto. Devem caçar mortos-vivos.",
  "Lin-Wu":
    "Devotos de Lin-Wu devem seguir o código de honra (Bushido) rigorosamente.",
  Megalokk: "Devotos de Megalokk devem proteger monstros e caçar civilizações.",
  Nimb: "Devotos de Nimb devem confiar na sorte. (Role um dado para decisões importantes).",
};

const DeitySelection = () => {
  const {
    selectDeity,
    selectGrantedPower,
    selectOrigin,
    selectedDeity,
    selectedGrantedPower,
    selectedClass,
    selectedRace,
    setStep,
  } = useCharacterStore();

  const [selectedPreview, setSelectedPreview] = useState<Divindade | null>(
    null
  );

  // Filter Deities logic
  const availableDeities = useMemo(() => {
    return DIVINDADES.filter((deity) => {
      // 1. Check Class Restrictions
      if (selectedClass?.faithProbability) {
        // Usually this object contains allowed ones with value 1.
        // If the deity name matches a key with 1.
        // Need to normalized names. Data uses specific Enum Keys "AHARADAK".

        // Map display name to key (Usually upper case first word)
        // Or loop keys.
        const keys = Object.keys(selectedClass.faithProbability);
        // This is loose matching because names can vary (Lin-Wu vs LINWU).
        const normalizedDeityName = deity.name
          .toUpperCase()
          .replace(/[^A-Z]/g, "");

        // If the class has specific faith probs, we treat it as an Allow List?
        // Or effectively probabilities? T20 usually says "Only X, Y, Z".
        // If the property exists and is not empty, usually it restricts.

        // Let's assume strict allow list if the object is populated.
        // We search if any key loose matches deity name.
        const isAllowed = keys.some(
          (k) => k.replace(/[^A-Z]/g, "") === normalizedDeityName
        );
        if (!isAllowed) return false;
      }

      // 2. Check Race Restrictions (Race.faithProbability) - same logic
      if (selectedRace?.faithProbability) {
        const keys = Object.keys(selectedRace.faithProbability);
        const normalizedDeityName = deity.name
          .toUpperCase()
          .replace(/[^A-Z]/g, "");
        const isAllowed = keys.some(
          (k) => k.replace(/[^A-Z]/g, "") === normalizedDeityName
        );
        if (!isAllowed) return false;
      }

      return true;
    });
  }, [selectedClass, selectedRace]);

  const handlePowerSelect = (power: GeneralPower) => {
    selectGrantedPower(power);
  };

  const handleConfirm = () => {
    if (!selectedPreview) return;
    if (!selectedGrantedPower) return; // Must pick a power
    selectDeity(selectedPreview);

    // Finish Step 4 -> Go to next or Finish.
    // Assuming next step exists or we alert success.
    setStep(5);
  };

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
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => selectOrigin(null as any)} // Will cause HistorySelection to show OriginSelection
                className="flex items-center gap-2 px-4 py-2 bg-black/40 backdrop-blur-md border border-amber-700/30 rounded-lg text-neutral-200 hover:text-amber-400 hover:border-amber-500/50 transition-all"
              >
                <ChevronLeft size={20} />
                <span className="hidden sm:inline">Voltar</span>
              </button>
              <h2 className="text-2xl font-cinzel text-amber-500 flex-1 text-center">
                Escolha sua Divindade
              </h2>
              <div className="w-[88px] hidden sm:block" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-20">
              {availableDeities.map((deity) => (
                <div
                  key={deity.name}
                  onClick={() => {
                    setSelectedPreview(deity);
                    selectGrantedPower(null as any);
                  }} // Reset power on switch
                  className="bg-neutral-900/80 border border-neutral-700 hover:border-amber-500/50 p-4 rounded-xl cursor-pointer transition-all hover:bg-neutral-800 flex justify-between items-center group"
                >
                  <span className="text-lg font-cinzel text-neutral-200 group-hover:text-amber-400">
                    {deity.name}
                  </span>
                  <ChevronRight className="text-neutral-500 group-hover:text-amber-500" />
                </div>
              ))}
              {availableDeities.length === 0 && (
                <div className="col-span-full text-center text-neutral-400 p-8">
                  Nenhuma divindade compatível com sua Raça/Classe encontrada
                  (ou todos são permitidos e o filtro falhou).
                </div>
              )}
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
              <div className="w-8" />
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-neutral-700">
              {/* Restrictions Alert */}
              <div className="bg-red-950/20 border border-red-900/40 p-4 rounded-lg flex gap-3">
                <AlertTriangle
                  className="text-red-500 flex-shrink-0"
                  size={20}
                />
                <div>
                  <h4 className="text-red-400 font-bold text-sm uppercase mb-1">
                    Obrigações e Restrições
                  </h4>
                  <p className="text-neutral-300 text-sm leading-relaxed">
                    {DEITY_RESTRICTIONS[selectedPreview.name] ||
                      DEITY_RESTRICTIONS[
                        selectedPreview.name.replace("-", " ")
                      ] ||
                      "Sem restrições específicas cadastradas."}
                  </p>
                </div>
              </div>

              {/* Powers Selection */}
              <div>
                <h3 className="text-sm uppercase tracking-wider text-neutral-500 mb-3 flex items-center gap-2">
                  Poder Concedido (Escolha 1)
                </h3>
                <div className="space-y-3">
                  {selectedPreview.poderes.map((power) => {
                    const isSelected =
                      selectedGrantedPower?.name === power.name;
                    return (
                      <div
                        key={power.name}
                        onClick={() => handlePowerSelect(power)}
                        className={`p-4 rounded border transition-all cursor-pointer relative
                                        ${
                                          isSelected
                                            ? "bg-amber-900/20 border-amber-500/80 shadow-[0_0_15px_-5px_var(--color-amber-500)]"
                                            : "bg-neutral-900/50 border-neutral-800 hover:border-amber-500/30"
                                        }
                                   `}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span
                            className={`font-bold ${
                              isSelected ? "text-amber-400" : "text-neutral-200"
                            }`}
                          >
                            {power.name}
                          </span>
                          {isSelected && (
                            <Check size={18} className="text-amber-500" />
                          )}
                        </div>
                        <p className="text-sm text-neutral-400 leading-relaxed">
                          {/* Usually 'text' is simpler here */}
                          {/* Assuming general power structure with 'text' */}
                          {(power as any).text ||
                            (power as any).description ||
                            "Descrição indisponível."}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer Action */}
            <div className="p-4 bg-neutral-950 border-t border-neutral-800 sticky bottom-0 z-20">
              <button
                onClick={handleConfirm}
                disabled={!selectedGrantedPower}
                className={`w-full py-4 font-bold rounded-lg shadow-lg flex justify-center items-center gap-2 transition-all
                  ${
                    selectedGrantedPower
                      ? "bg-amber-600 hover:bg-amber-500 text-white shadow-amber-900/20 active:scale-[0.98]"
                      : "bg-neutral-800 text-neutral-500 cursor-not-allowed"
                  }`}
              >
                <Check size={20} />
                Confirmar Fé
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DeitySelection;
