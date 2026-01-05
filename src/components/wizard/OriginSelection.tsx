import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ORIGINS } from "../../data/origins";
import { useCharacterStore } from "../../store/useCharacterStore";
import { ChevronRight, ChevronLeft, Check, Book } from "lucide-react";
import Origin from "../../interfaces/Origin";
import Skill from "../../interfaces/Skills";
import { GeneralPower, OriginPower } from "../../interfaces/Poderes";

const OriginSelection = () => {
  const {
    selectOrigin,
    selectedOrigin,
    originBenefits,
    setOriginBenefits,
    selectedSkills, // From Role/Race
    selectedRace, // To check race skills
    baseAttributes,
    setStep,
  } = useCharacterStore();

  const [selectedPreview, setSelectedPreview] = useState<Origin | null>(null);

  // Combine already known skills to prevent duplicates
  // Note: selectedSkills tracks Role skills. Race skills are inside selectedRace.attributes...
  const knownSkills = useMemo(() => {
    const list: Skill[] = [...selectedSkills];
    // Add race skills if any (usually hardcoded in race abilities or user choice?)
    // Basic races usually don't give "pick skill" in step 1 except Human/etc.
    // We'll trust selectedSkills + checking race logic if needed.
    return list;
  }, [selectedSkills]);

  // Handle Benefit Toggles
  const handleToggleBenefit = (
    type: "skill" | "power",
    item: Skill | OriginPower | GeneralPower
  ) => {
    const name = typeof item === "string" ? item : item.name;
    const existingIndex = originBenefits.findIndex((b) => b.name === name);

    if (existingIndex >= 0) {
      // Remove
      setOriginBenefits(originBenefits.filter((_, i) => i !== existingIndex));
    } else {
      // Add if < 2
      if (originBenefits.length < 2) {
        setOriginBenefits([
          ...originBenefits,
          {
            type: type === "skill" ? "skill" : "power",
            name,
            value: item,
          },
        ]);
      }
    }
  };

  const handleConfirm = () => {
    if (!selectedPreview) return;
    selectOrigin(selectedPreview);
    // Move to next internal step? or parent handles it.
  };

  const isBenefitSelected = (name: string) =>
    originBenefits.some((b) => b.name === name);

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
                onClick={() => setStep(3)}
                className="flex items-center gap-2 px-4 py-2 bg-black/40 backdrop-blur-md border border-amber-700/30 rounded-lg text-neutral-200 hover:text-amber-400 hover:border-amber-500/50 transition-all"
              >
                <ChevronLeft size={20} />
                <span className="hidden sm:inline">Voltar</span>
              </button>
              <h2 className="text-2xl font-cinzel text-amber-500 flex-1 text-center">
                Escolha sua Origem
              </h2>
              <div className="w-[88px] hidden sm:block" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-20">
              {Object.values(ORIGINS)
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((origin) => (
                  <div
                    key={origin.name}
                    onClick={() => {
                      setSelectedPreview(origin);
                      setOriginBenefits([]);
                    }}
                    className="bg-neutral-900/80 border border-neutral-700 hover:border-amber-500/50 p-4 rounded-xl cursor-pointer transition-all hover:bg-neutral-800 flex justify-between items-center group"
                  >
                    <span className="text-lg font-cinzel text-neutral-200 group-hover:text-amber-400">
                      {origin.name}
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
              <div className="bg-neutral-950/40 p-4 rounded border border-neutral-800">
                <p className="text-sm text-neutral-400 italic mb-4">
                  Escolha 2 benefícios entre Perícias e Poderes disponíveis (que
                  você ainda não possua).
                </p>
                <div className="flex justify-between items-center bg-neutral-900 p-2 rounded mb-4">
                  <span className="text-xs uppercase font-bold text-neutral-500">
                    Selecionados
                  </span>
                  <span
                    className={`text-sm font-bold ${
                      originBenefits.length === 2
                        ? "text-green-500"
                        : "text-amber-500"
                    }`}
                  >
                    {originBenefits.length} / 2
                  </span>
                </div>

                {/* Skills */}
                <div className="mb-6">
                  <h3 className="text-sm uppercase tracking-wider text-neutral-500 mb-2 flex items-center gap-2">
                    <Book size={14} /> Perícias da Origem
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedPreview.pericias.map((skill) => {
                      const isKnown = knownSkills.includes(skill);
                      const selected = isBenefitSelected(skill);
                      const disabled =
                        isKnown || (!selected && originBenefits.length >= 2);

                      return (
                        <button
                          key={skill}
                          onClick={() =>
                            !isKnown && handleToggleBenefit("skill", skill)
                          }
                          disabled={disabled && !selected} // Can unselect even if disabled for adding
                          className={`px-3 py-2 rounded text-sm border transition-all
                                        ${
                                          isKnown
                                            ? "bg-neutral-900 text-neutral-600 border-transparent cursor-not-allowed line-through decoration-neutral-600"
                                            : selected
                                            ? "bg-amber-900/30 border-amber-500 text-amber-100"
                                            : "bg-neutral-800 border-neutral-700 hover:border-amber-500/50 text-neutral-300"
                                        }
                                        ${
                                          disabled && !selected && !isKnown
                                            ? "opacity-50 cursor-not-allowed"
                                            : ""
                                        }
                                    `}
                        >
                          {skill}
                          {isKnown && (
                            <span className="text-[10px] ml-1">
                              (Já possui)
                            </span>
                          )}
                        </button>
                      );
                    })}
                    {selectedPreview.pericias.length === 0 && (
                      <span className="text-neutral-600 text-xs">
                        Nenhuma perícia específica.
                      </span>
                    )}
                  </div>
                </div>

                {/* Powers */}
                <div>
                  <h3 className="text-sm uppercase tracking-wider text-neutral-500 mb-2 flex items-center gap-2">
                    <Check size={14} /> Poderes da Origem
                  </h3>
                  <div className="space-y-2">
                    {selectedPreview.poderes.map((power: any) => {
                      const name = power.name;
                      const selected = isBenefitSelected(name);
                      const disabled = !selected && originBenefits.length >= 2;

                      return (
                        <div
                          key={name}
                          onClick={() =>
                            !disabled && handleToggleBenefit("power", power)
                          }
                          className={`p-3 rounded border transition-all cursor-pointer relative
                                        ${
                                          selected
                                            ? "bg-amber-900/20 border-amber-500/80"
                                            : disabled
                                            ? "bg-neutral-900 border-neutral-800 opacity-50 cursor-not-allowed"
                                            : "bg-neutral-900/50 border-neutral-800 hover:border-amber-500/30"
                                        }
                                    `}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <span
                              className={`font-bold ${
                                selected ? "text-amber-400" : "text-neutral-300"
                              }`}
                            >
                              {name}
                            </span>
                            {selected && (
                              <Check size={16} className="text-amber-500" />
                            )}
                          </div>
                          <p className="text-xs text-neutral-400 leading-relaxed">
                            {power.text?.substring(0, 120)}...
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Items Summary (Just visuals) */}
              <div className="bg-neutral-900/50 p-3 rounded">
                <h4 className="text-xs font-bold text-neutral-500 uppercase mb-2">
                  Itens Iniciais
                </h4>
                <ul className="text-xs text-neutral-400 space-y-1 ml-4 list-disc">
                  {selectedPreview.getItems ? (
                    selectedPreview.getItems().map((item, i) => (
                      <li key={i}>
                        {item.qtd ? `${item.qtd}x ` : ""}
                        {typeof item.equipment === "string"
                          ? item.equipment
                          : item.description}
                      </li>
                    ))
                  ) : (
                    <li>Itens padrão da origem.</li>
                  )}
                </ul>
              </div>
            </div>

            {/* Footer Action */}
            <div className="p-4 bg-neutral-950 border-t border-neutral-800 sticky bottom-0 z-20">
              <button
                onClick={handleConfirm}
                disabled={originBenefits.length !== 2}
                className={`w-full py-4 font-bold rounded-lg shadow-lg flex justify-center items-center gap-2 transition-all
                  ${
                    originBenefits.length === 2
                      ? "bg-amber-600 hover:bg-amber-500 text-white shadow-amber-900/20 active:scale-[0.98]"
                      : "bg-neutral-800 text-neutral-500 cursor-not-allowed"
                  }`}
              >
                <Check size={20} />
                Próximo: Divindade
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OriginSelection;
