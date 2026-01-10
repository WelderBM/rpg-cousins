import React, { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCharacterStore } from "../../../store/useCharacterStore";
import { Atributo } from "../../../data/atributos";
import {
  calculateAttributeCost,
  INITIAL_POINTS,
} from "../../../utils/attributeUtils";
import Race from "../../../interfaces/Race";
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Check,
} from "lucide-react";

import { BuildArchetypeBadge } from "./ArchetypeBadge";
import { AttributeCard } from "./AttributeCard";
import { ImpactPanel } from "./ImpactPanel";
import { SystemExplanationModal } from "./ExplanationModal";

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
    <div className="min-h-screen bg-stone-950 text-neutral-100 pb-32">
      <AnimatePresence>
        {showExplanation && (
          <SystemExplanationModal onClose={() => setShowExplanation(false)} />
        )}
      </AnimatePresence>

      <div className="relative max-w-2xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Header Compacto */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-xl md:text-3xl font-cinzel text-amber-500">
              Atributos
            </h1>
            <div className="mt-1">
              <BuildArchetypeBadge attributes={finalAttributes} />
            </div>
          </div>

          <button
            onClick={() => setShowExplanation(true)}
            className="p-3 bg-amber-900/20 backdrop-blur-md border border-amber-700/30 rounded-xl text-amber-400 active:scale-95 transition-all"
          >
            <HelpCircle size={20} />
          </button>
        </div>

        {/* Points Display - More Compact */}
        <motion.div
          animate={shakePoints ? { x: [-10, 10, -10, 10, 0] } : {}}
          className="sticky top-4 z-20 bg-stone-900/40 backdrop-blur-md rounded-xl p-4 border border-white/5 shadow-2xl"
        >
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] font-black text-stone-500 uppercase tracking-widest">
              Pontos Disponíveis
            </span>
            <span
              className={`text-2xl font-cinzel font-bold ${
                pointsRemaining === 0 ? "text-emerald-500" : "text-amber-500"
              }`}
            >
              {pointsRemaining}
            </span>
          </div>
          <PointsProgressBar points={pointsRemaining} />
        </motion.div>

        {/* Flexible Bonuses - Refined */}
        {flexibleBonuses.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-4 space-y-4"
          >
            <h3 className="text-xs font-black text-amber-500/50 uppercase tracking-[0.2em] flex items-center gap-2">
              <Plus size={14} /> Bônus Flexíveis da Raça
            </h3>
            <div className="space-y-4">
              {flexibleBonuses.map((bonus) => (
                <div key={bonus.index} className="space-y-2">
                  <div className="text-[10px] text-stone-500">
                    Escolha um atributo (+{bonus.mod}):
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
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
                          className={`py-2 rounded-lg border text-[10px] font-bold transition-all uppercase ${
                            isSelected
                              ? "bg-amber-600 text-stone-950 border-amber-500"
                              : isChosenInAnotherSlot
                              ? "bg-stone-900 border-stone-800 text-stone-700 opacity-30"
                              : "bg-black/20 border-white/5 text-stone-400"
                          } active:scale-95`}
                        >
                          {attr.substring(0, 3)}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        <ImpactPanel finalAttributes={finalAttributes} />

        {/* Attribute Grid - Forced 1 col on mobile, 2 on tablet */}
        <div className="grid grid-cols-2 md:grid-cols-2 gap-3 md:gap-4">
          {ATTRIBUTES_LIST.map((attr) => (
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

        {/* Action Footer */}
        <div className="fixed bottom-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-t from-stone-950 via-stone-950 to-transparent backdrop-blur-md z-50">
          <div className="max-w-2xl mx-auto">
            <button
              onClick={() => setStep(3)}
              disabled={!canProceed}
              className={`w-full py-4 font-bold font-cinzel text-lg rounded-xl shadow-2xl transition-all flex justify-center items-center gap-3 active:scale-95 ${
                canProceed
                  ? "bg-amber-600 text-stone-950"
                  : "bg-stone-800 text-stone-500 cursor-not-allowed border border-stone-700 opacity-50 grayscale"
              }`}
            >
              {canProceed ? (
                <>
                  <Check size={20} /> Atributos Definidos
                </>
              ) : (
                "Distribua os Pontos"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttributeSelection;
