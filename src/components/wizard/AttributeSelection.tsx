import React, { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCharacterStore } from "../../store/useCharacterStore";
import { Atributo } from "../../data/atributos";
import {
  calculateAttributeCost,
  INITIAL_POINTS,
} from "../../utils/attributeUtils";
import Race from "../../interfaces/Race";
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Check,
} from "lucide-react";

import { BuildArchetypeBadge } from "./AttributeSelection/ArchetypeBadge";
import { AttributeCard } from "./AttributeSelection/AttributeCard";
import { ImpactPanel } from "./AttributeSelection/ImpactPanel";
import { SystemExplanationModal } from "./AttributeSelection/ExplanationModal";

// ============================================
// CONFIGURAÇÕES & CONSTANTES
// ============================================

const ATTRIBUTES_LIST = [
  Atributo.FORCA,
  Atributo.DESTREZA,
  Atributo.CONSTITUICAO,
  Atributo.INTELIGENCIA,
  Atributo.SABEDORIA,
  Atributo.CARISMA,
];

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

const getFlexibleBonuses = (race: Race | null) => {
  if (!race) return [];
  return race.attributes.attrs
    .map((a, index) => ({ attr: a.attr, mod: a.mod, index }))
    .filter((a) => a.attr === "any");
};

const getRacialBonus = (
  race: Race | null,
  attr: Atributo,
  flexibleChoices: Record<number, Atributo>
): number => {
  if (!race) return 0;
  let totalBonus = 0;
  race.attributes.attrs.forEach((a, index) => {
    if (a.attr === attr) totalBonus += a.mod;
  });
  Object.entries(flexibleChoices).forEach(([indexStr, chosenAttr]) => {
    if (chosenAttr === attr) {
      const index = parseInt(indexStr);
      const flexBonus = race.attributes.attrs[index];
      if (flexBonus && flexBonus.attr === "any") totalBonus += flexBonus.mod;
    }
  });
  return totalBonus;
};

// ============================================
// SUB-COMPONENTS
// ============================================

const PointsProgressBar = ({ points }: { points: number }) => {
  const percentage = (points / INITIAL_POINTS) * 100;
  return (
    <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden border border-white/5">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        className={`h-full ${
          points === 0 ? "bg-emerald-500" : "bg-amber-500"
        } transition-colors duration-500`}
      />
    </div>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================

const AttributeSelection = () => {
  const {
    selectedRace,
    baseAttributes,
    pointsRemaining,
    updateBaseAttribute,
    flexibleAttributeChoices,
    setFlexibleAttributeChoice,
    setStep,
  } = useCharacterStore();

  const [showExplanation, setShowExplanation] = useState(false);
  const [shakePoints, setShakePoints] = useState(false);

  // Memoized values
  const flexibleBonuses = useMemo(
    () => getFlexibleBonuses(selectedRace),
    [selectedRace]
  );

  const racialBonuses = useMemo(() => {
    const bonuses: Record<Atributo, number> = {} as any;
    ATTRIBUTES_LIST.forEach((attr) => {
      bonuses[attr] = getRacialBonus(
        selectedRace,
        attr,
        flexibleAttributeChoices
      );
    });
    return bonuses;
  }, [selectedRace, flexibleAttributeChoices]);

  const finalAttributes = useMemo(() => {
    const final: Record<Atributo, number> = {} as any;
    ATTRIBUTES_LIST.forEach((attr) => {
      final[attr] = baseAttributes[attr] + racialBonuses[attr];
    });
    return final;
  }, [baseAttributes, racialBonuses]);

  // Handlers
  const handleIncrement = useCallback(
    (attr: Atributo) => {
      const current = baseAttributes[attr];
      const nextValue = current + 1;
      if (nextValue > 4) return;

      const cost =
        calculateAttributeCost(nextValue) - calculateAttributeCost(current);

      if (pointsRemaining >= cost) {
        updateBaseAttribute(attr, nextValue);
      } else {
        setShakePoints(true);
        setTimeout(() => setShakePoints(false), 400);
      }
    },
    [baseAttributes, pointsRemaining, updateBaseAttribute]
  );

  const handleDecrement = useCallback(
    (attr: Atributo) => {
      const current = baseAttributes[attr];
      if (current <= -1) return;
      updateBaseAttribute(attr, current - 1);
    },
    [baseAttributes, updateBaseAttribute]
  );

  const canProceed = useMemo(() => {
    const allFlexDefined = flexibleBonuses.every(
      (bonus) => flexibleAttributeChoices[bonus.index]
    );
    if (!allFlexDefined) return false;

    const selectedValues = Object.values(flexibleAttributeChoices);
    const uniqueValues = new Set(selectedValues);
    const flexUnique = uniqueValues.size === flexibleBonuses.length;
    if (!flexUnique) return false;

    return pointsRemaining === 0;
  }, [flexibleBonuses, flexibleAttributeChoices, pointsRemaining]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-950 via-neutral-950 to-stone-950 relative overflow-hidden">
      <AnimatePresence>
        {showExplanation && (
          <SystemExplanationModal onClose={() => setShowExplanation(false)} />
        )}
      </AnimatePresence>

      <div className="relative max-w-6xl mx-auto p-4 sm:p-6 min-h-screen flex flex-col pb-32">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setStep(1)}
            className="flex items-center gap-2 px-4 py-2 bg-black/40 backdrop-blur-md border border-amber-700/30 rounded-lg text-neutral-200 hover:text-amber-400"
          >
            <ChevronLeft size={20} />
            <span className="hidden sm:inline">Voltar</span>
          </button>

          <div className="text-center flex-1">
            <h2 className="text-3xl md:text-4xl font-cinzel text-amber-500 drop-shadow-[0_0_30px_rgba(251,191,36,0.3)]">
              Atributos
            </h2>
            <div className="flex justify-center mt-2">
              <BuildArchetypeBadge attributes={finalAttributes} />
            </div>
          </div>

          <button
            onClick={() => setShowExplanation(true)}
            className="flex items-center gap-2 px-4 py-2 bg-amber-900/20 backdrop-blur-md border border-amber-700/30 rounded-lg text-amber-400"
          >
            <HelpCircle size={20} />
            <span className="hidden sm:inline">Ajuda</span>
          </button>
        </div>

        {/* Points Display */}
        <motion.div
          animate={shakePoints ? { x: [-10, 10, -10, 10, 0] } : {}}
          className="sticky top-4 z-20 mb-8 bg-stone-900/90 backdrop-blur-md rounded-2xl p-6 border-2 border-amber-700/30 shadow-2xl"
        >
          <div className="flex justify-between items-center mb-4">
            <div className="text-xs text-neutral-400 uppercase tracking-widest">
              Pontos Disponíveis
            </div>
            <div
              className={`text-3xl font-bold font-cinzel ${
                pointsRemaining === 0 ? "text-emerald-500" : "text-amber-500"
              }`}
            >
              {pointsRemaining}
            </div>
          </div>
          <PointsProgressBar points={pointsRemaining} />
        </motion.div>

        {/* Flexible Bonuses */}
        {flexibleBonuses.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="bg-amber-950/20 border-2 border-amber-700/30 rounded-2xl p-6 mb-8"
          >
            <h3 className="text-xl font-cinzel text-amber-500 mb-4 flex items-center gap-2">
              <Plus size={20} /> Bônus Flexíveis da Raça
            </h3>
            <div className="space-y-6">
              {flexibleBonuses.map((bonus) => (
                <div key={bonus.index} className="space-y-3">
                  <div className="text-sm text-neutral-400">
                    Escolha um atributo para o bônus de{" "}
                    <span className="text-amber-500 font-bold">
                      +{bonus.mod}
                    </span>
                    :
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                    {ATTRIBUTES_LIST.map((attr) => {
                      const isSelected =
                        flexibleAttributeChoices[bonus.index] === attr;
                      const isChosenInAnotherSlot = Object.entries(
                        flexibleAttributeChoices
                      ).some(
                        ([idx, val]) =>
                          parseInt(idx) !== bonus.index && val === attr
                      );

                      return (
                        <button
                          key={attr}
                          disabled={isChosenInAnotherSlot}
                          onClick={() =>
                            setFlexibleAttributeChoice(bonus.index, attr)
                          }
                          className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-1 ${
                            isSelected
                              ? "bg-amber-900/40 border-amber-500 text-amber-100 shadow-[0_0_15px_rgba(251,191,36,0.2)]"
                              : isChosenInAnotherSlot
                              ? "bg-neutral-900/30 border-neutral-800 text-neutral-600 cursor-not-allowed opacity-40"
                              : "bg-black/40 border-neutral-800 text-neutral-400 hover:border-amber-700"
                          }`}
                        >
                          <span className="text-xs font-bold">{attr}</span>
                          {isSelected && (
                            <motion.div layoutId="flex-check">
                              <Check size={14} className="text-amber-500" />
                            </motion.div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        <div className="mb-8">
          <ImpactPanel finalAttributes={finalAttributes} />
        </div>

        {/* Attribute Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 flex-1">
          {ATTRIBUTES_LIST.map((attr, index) => (
            <AttributeCard
              key={attr}
              attr={attr}
              baseValue={baseAttributes[attr]}
              racialBonus={racialBonuses[attr]}
              pointsRemaining={pointsRemaining}
              onIncrement={() => handleIncrement(attr)}
              onDecrement={() => handleDecrement(attr)}
            />
          ))}
        </div>

        {/* Action Button */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-stone-950 via-stone-950/95 to-transparent backdrop-blur-md border-t border-amber-900/20 z-30">
          <div className="max-w-6xl mx-auto flex justify-center">
            <button
              onClick={() => setStep(3)}
              disabled={!canProceed}
              className={`w-full max-w-md py-4 font-bold rounded-xl shadow-2xl transition-all flex justify-center items-center gap-3 active:scale-[0.98] ${
                canProceed
                  ? "bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-black"
                  : "bg-neutral-800 text-neutral-500 opacity-50 cursor-not-allowed"
              }`}
            >
              {canProceed ? "Pronto para a Aventura!" : "Confirme seus Pontos"}
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttributeSelection;
