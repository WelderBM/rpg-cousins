import React from "react";
import { useCharacterStore } from "../../store/useCharacterStore";
import { Atributo } from "../../data/atributos";
import { calculateAttributeCost } from "../../utils/attributeUtils";
import { Plus, Minus, ArrowLeft } from "lucide-react";
import Race from "../../interfaces/Race";

const ATTRIBUTES_LIST = [
  Atributo.FORCA,
  Atributo.DESTREZA,
  Atributo.CONSTITUICAO,
  Atributo.INTELIGENCIA,
  Atributo.SABEDORIA,
  Atributo.CARISMA,
];

const getRacialBonus = (race: Race | null, attr: Atributo) => {
  if (!race) return 0;
  const found = race.attributes.attrs.find((a) => a.attr === attr);
  return found ? found.mod : 0;
};

// Modifiers in T20: (Value - 10) / 2
// With our Base 0 representing 10: (0 + Bonus - 0) / 2 = Bonus / 2?
// Effectively, calculating from the Final Total Score (10 + Base + Race).
const getModifier = (basePts: number, raceBonus: number) => {
  const totalScore = 10 + basePts + raceBonus;
  return Math.floor((totalScore - 10) / 2);
};

const AttributeSelection = () => {
  const {
    baseAttributes,
    pointsRemaining,
    selectedRace,
    updateBaseAttribute,
    setStep,
  } = useCharacterStore();

  const handleIncrement = (attr: Atributo) => {
    const currentValue = baseAttributes[attr];
    if (currentValue >= 4) return; // Cap at +4 as requested (Real 14)

    const nextValue = currentValue + 1;

    // Calculate cost difference for the step
    // Note: We recalculate total cost in the store, but here we peek to disable button
    const currentCost = calculateAttributeCost(currentValue);
    const nextCost = calculateAttributeCost(nextValue);
    const costDiff = nextCost - currentCost;

    if (pointsRemaining >= costDiff) {
      updateBaseAttribute(attr, nextValue);
    }
  };

  const handleDecrement = (attr: Atributo) => {
    const currentValue = baseAttributes[attr];
    if (currentValue <= -2) return; // Cap min at -2 (Real 8)

    const prevValue = currentValue - 1;
    // Decreasing always refunds or costs negative, so we can always do it unless hit limit
    updateBaseAttribute(attr, prevValue);
  };

  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto p-4 animate-in fade-in zoom-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => setStep(1)}
          className="p-2 -ml-2 text-neutral-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-2xl font-cinzel text-amber-500">Atributos</h2>
        <div className="w-6" />
      </div>

      {/* Points Counter */}
      <div className="bg-neutral-900 rounded-xl p-6 text-center shadow-lg border border-neutral-800 mb-8 sticky top-2 z-10 backdrop-blur-md bg-neutral-900/90">
        <span className="text-neutral-400 uppercase tracking-widest text-xs font-bold">
          Pontos Restantes
        </span>
        <div className="text-5xl font-bold text-amber-500 mt-2 font-cinzel">
          {pointsRemaining}
        </div>
        <p className="text-xs text-neutral-500 mt-2">
          Saldo Inicial: 10 Pontos
        </p>

        {selectedRace?.attributes.attrs.some((a) => a.attr === "any") && (
          <div className="mt-3 text-amber-400 text-xs bg-amber-900/20 p-2 rounded border border-amber-900/30">
            Nota: Bônus flexíveis ({selectedRace.name}) devem ser anotados
            manualmente por enquanto.
          </div>
        )}
      </div>

      {/* Attributes List */}
      <div className="space-y-4 pb-20">
        {ATTRIBUTES_LIST.map((attr) => {
          const racialBonus = getRacialBonus(selectedRace, attr);
          const baseValue = baseAttributes[attr];

          // Display Values
          const purchaseValue = baseValue; // -2 to +4
          const totalScore = 10 + purchaseValue + racialBonus;
          const modifier = getModifier(purchaseValue, racialBonus);
          const modString = modifier >= 0 ? `+${modifier}` : `${modifier}`;

          // Cost Logic for UI
          const nextValue = purchaseValue + 1;
          const costToUpgrade =
            nextValue <= 4
              ? calculateAttributeCost(nextValue) -
                calculateAttributeCost(purchaseValue)
              : null;

          const canUpgrade =
            nextValue <= 4 &&
            costToUpgrade !== null &&
            pointsRemaining >= costToUpgrade;
          const canDowngrade = purchaseValue > -2;

          return (
            <div
              key={attr}
              className="bg-neutral-800/50 rounded-lg p-4 border border-neutral-700/50 hover:border-amber-500/30 transition-all flex items-center justify-between"
            >
              {/* Info */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-neutral-200">{attr}</h3>
                  {racialBonus !== 0 && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded ${
                        racialBonus > 0
                          ? "bg-green-900/50 text-green-400"
                          : "bg-red-900/50 text-red-400"
                      }`}
                    >
                      {racialBonus > 0 ? `+${racialBonus}` : racialBonus} Raça
                    </span>
                  )}
                </div>
                <div className="text-xs text-neutral-500">
                  Modificador:{" "}
                  <span className="text-amber-400 font-bold">{modString}</span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-4 bg-neutral-900 rounded-lg p-1.5">
                <button
                  onClick={() => handleDecrement(attr)}
                  disabled={!canDowngrade}
                  className="w-8 h-8 flex items-center justify-center rounded bg-neutral-800 text-neutral-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-neutral-700 transition-colors"
                >
                  <Minus size={16} />
                </button>

                <div className="flex flex-col items-center w-12">
                  <span className="font-cinzel text-xl font-bold text-white leading-none">
                    {totalScore}
                  </span>
                  <span className="text-[10px] text-neutral-500 font-mono">
                    ({purchaseValue > 0 ? `+${purchaseValue}` : purchaseValue})
                  </span>
                </div>

                <button
                  onClick={() => handleIncrement(attr)}
                  disabled={!canUpgrade}
                  className="w-8 h-8 flex items-center justify-center rounded bg-neutral-800 text-neutral-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-neutral-700 transition-colors relative group"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AttributeSelection;
