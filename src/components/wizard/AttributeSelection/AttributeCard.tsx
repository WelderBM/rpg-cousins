import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Atributo } from "../../../data/atributos";
import { calculateAttributeCost } from "../../../utils/attributeUtils";
import {
  Plus,
  Minus,
  Info,
  Zap,
  Activity,
  Heart,
  Brain,
  Eye,
  Sparkles,
} from "lucide-react";

const ATTRIBUTE_ICONS: Record<Atributo, React.ComponentType<any>> = {
  [Atributo.FORCA]: Zap,
  [Atributo.DESTREZA]: Activity,
  [Atributo.CONSTITUICAO]: Heart,
  [Atributo.INTELIGENCIA]: Brain,
  [Atributo.SABEDORIA]: Eye,
  [Atributo.CARISMA]: Sparkles,
};

const ATTRIBUTE_DESCRIPTIONS: Record<Atributo, string> = {
  [Atributo.FORCA]:
    "Força física bruta. Afeta dano corpo-a-corpo, carga máxima e testes de Atletismo.",
  [Atributo.DESTREZA]:
    "Agilidade e reflexos. Afeta Defesa, ataques à distância e testes de Acrobacia/Furtividade.",
  [Atributo.CONSTITUICAO]:
    "Resistência física. Determina seus Pontos de Vida e testes de Fortitude.",
  [Atributo.INTELIGENCIA]:
    "Raciocínio lógico. Afeta conhecimentos, magias arcanas e perícias técnicas.",
  [Atributo.SABEDORIA]:
    "Percepção e intuição. Afeta magias divinas, Vontade e testes de Percepção/Intuição.",
  [Atributo.CARISMA]:
    "Força de personalidade. Afeta liderança, Diplomacia, Enganação e algumas magias.",
};

const getCostToUpgrade = (currentValue: number): number | null => {
  const nextValue = currentValue + 1;
  if (nextValue > 4) return null;
  return (
    calculateAttributeCost(nextValue) - calculateAttributeCost(currentValue)
  );
};

export const AttributeCard = React.memo(
  ({
    attr,
    baseValue,
    racialBonus,
    pointsRemaining,
    onIncrement,
    onDecrement,
    isDiceMethod,
    rolls = [],
    assignedIndex = null,
    allAssignments = {} as Record<Atributo, number | null>,
    onAssign,
  }: {
    attr: Atributo;
    baseValue: number;
    racialBonus: number;
    pointsRemaining: number;
    onIncrement: () => void;
    onDecrement: () => void;
    isDiceMethod?: boolean;
    rolls?: number[];
    assignedIndex?: number | null;
    allAssignments?: Record<Atributo, number | null>;
    onAssign?: (idx: number | null) => void;
  }) => {
    const [showTooltip, setShowTooltip] = useState(false);
    const Icon = ATTRIBUTE_ICONS[attr];
    const finalValue = baseValue + racialBonus;
    const costToUpgrade = getCostToUpgrade(baseValue);

    const canUpgrade =
      costToUpgrade !== null && pointsRemaining >= costToUpgrade;
    const canDowngrade = baseValue > -1;

    // Check if a roll is already used by ANOTHER attribute
    const isRollUsedByOther = (idx: number) => {
      return Object.entries(allAssignments).some(
        ([a, val]) => a !== attr && val === idx
      );
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        layout
        transition={{ duration: 0.2 }}
        className="relative bg-gradient-to-br from-stone-900/90 via-stone-800/80 to-stone-900/90 backdrop-blur-sm rounded-xl border-2 border-amber-900/30 overflow-hidden group hover:border-amber-700/50"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-amber-900/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <div className="relative p-3 sm:p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-900/20 rounded-lg border border-amber-700/30">
                <Icon className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <h3 className="font-cinzel text-base md:text-lg font-bold text-amber-100 leading-none mb-1">
                  {attr}
                </h3>
                {racialBonus !== 0 && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full border ${
                      racialBonus > 0
                        ? "bg-amber-600/10 text-amber-400 border-amber-600/30"
                        : "bg-red-900/10 text-red-400 border-red-600/30"
                    }`}
                  >
                    {racialBonus > 0 ? `+${racialBonus}` : racialBonus} Raça
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={() => setShowTooltip(!showTooltip)}
              className="p-1.5 rounded-full hover:bg-white/5 transition-colors"
            >
              <Info className="w-4 h-4 text-neutral-500" />
            </button>
          </div>

          <AnimatePresence>
            {showTooltip && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 overflow-hidden"
              >
                <div className="p-3 bg-black/40 rounded-lg border border-white/5 text-xs text-neutral-400 leading-relaxed">
                  {ATTRIBUTE_DESCRIPTIONS[attr]}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="bg-gradient-to-r from-amber-600/10 to-amber-900/10 rounded-lg p-3 md:p-4 border border-amber-700/20 flex items-center justify-between mb-4">
            <div className="text-[10px] text-amber-500/70 uppercase font-bold tracking-tighter md:tracking-widest">
              Atributo Final
            </div>
            <motion.div
              key={finalValue}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              className="text-2xl md:text-4xl font-bold font-cinzel text-amber-100"
            >
              {finalValue >= 0 ? `+${finalValue}` : finalValue}
            </motion.div>
          </div>

          {!isDiceMethod ? (
            <div className="flex items-center gap-2 md:gap-3">
              <button
                onClick={onDecrement}
                disabled={!canDowngrade}
                className="flex-1 h-10 md:h-12 bg-stone-900 border border-neutral-800 rounded-lg md:rounded-xl flex items-center justify-center hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
              >
                <Minus size={16} className="text-neutral-400 md:w-5 md:h-5" />
              </button>

              <div className="flex-1 text-center">
                {costToUpgrade !== null ? (
                  <div className="text-[8px] md:text-[10px] uppercase text-neutral-500">
                    Custo{" "}
                    <span className="text-amber-500 font-bold">
                      {costToUpgrade}pt
                    </span>
                  </div>
                ) : (
                  <div className="text-[8px] md:text-[10px] uppercase text-neutral-600">
                    Limite
                  </div>
                )}
              </div>

              <button
                onClick={onIncrement}
                disabled={!canUpgrade}
                className="flex-1 h-10 md:h-12 bg-amber-600 border border-amber-500 rounded-lg md:rounded-xl flex items-center justify-center hover:bg-amber-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95 shadow-lg shadow-amber-900/20"
              >
                <Plus size={16} className="text-white md:w-5 md:h-5" />
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-[10px] text-stone-500 uppercase font-black tracking-widest">
                Dado Escolhido
              </label>
              <select
                value={assignedIndex === null ? "" : assignedIndex}
                onChange={(e) => {
                  const val = e.target.value;
                  onAssign?.(val === "" ? null : parseInt(val));
                }}
                className="w-full bg-stone-950 border border-amber-700/30 rounded-lg py-2.5 px-3 text-xs text-amber-100 focus:border-amber-500 outline-none transition-all appearance-none cursor-pointer"
              >
                <option value="">Selecione um dado...</option>
                {rolls.map((roll, idx) => {
                  const used = isRollUsedByOther(idx);
                  return (
                    <option key={idx} value={idx} disabled={used}>
                      Dado #{idx + 1} ({roll}) {used ? "(Ocupado)" : ""}
                    </option>
                  );
                })}
              </select>
            </div>
          )}
        </div>
      </motion.div>
    );
  }
);
