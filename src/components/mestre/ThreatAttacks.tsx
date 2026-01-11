import React from "react";
import { ThreatSheet, ThreatAttack } from "@/interfaces/ThreatSheet";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Sword, Dice6 } from "lucide-react";
import {
  calculateDiceAverage,
  validateDiceString,
} from "@/functions/threatGenerator";

interface Props {
  formData: Partial<ThreatSheet>;
  setFormData: React.Dispatch<React.SetStateAction<Partial<ThreatSheet>>>;
}

export const ThreatAttacks: React.FC<Props> = ({ formData, setFormData }) => {
  const addAttack = () => {
    setFormData((prev) => ({
      ...prev,
      attacks: [
        ...(prev.attacks || []),
        {
          id: Date.now().toString(),
          name: "Novo Ataque",
          attackBonus: prev.combatStats?.attackValue || 0,
          damageDice: "1d8",
          bonusDamage: 0,
        },
      ],
    }));
  };

  const removeAttack = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      attacks: prev.attacks?.filter((a) => a.id !== id),
    }));
  };

  const updateAttack = (
    index: number,
    field: keyof ThreatAttack,
    value: any
  ) => {
    const newAttacks = [...(formData.attacks || [])];
    (newAttacks[index] as any)[field] = value;

    // Auto-recalculate average if dice or bonus changes
    if (field === "damageDice" || field === "bonusDamage") {
      newAttacks[index].averageDamage = calculateDiceAverage(
        newAttacks[index].damageDice,
        newAttacks[index].bonusDamage
      );
    }

    setFormData((prev) => ({
      ...prev,
      attacks: newAttacks,
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="font-serif text-xl font-bold text-parchment-DEFAULT flex items-center gap-2">
            <Sword className="text-medieval-gold" /> Ataques
          </h3>
          <p className="text-xs text-parchment-dark mt-1">
            Configure os ataques da criatura.
          </p>
        </div>

        <button
          onClick={addAttack}
          className="flex items-center gap-2 px-4 py-2 bg-medieval-gold/10 hover:bg-medieval-gold/20 text-medieval-gold rounded-lg border border-medieval-gold/30 transition-all font-bold text-sm"
        >
          <Plus className="w-4 h-4" /> Adicionar Ataque
        </button>
      </div>

      <div className="space-y-4">
        <AnimatePresence>
          {formData.attacks?.map((attack, index) => (
            <motion.div
              key={attack.id}
              layout
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-black/40 p-4 rounded-xl border border-medieval-iron/30 grid grid-cols-1 md:grid-cols-12 gap-4 items-end relative overflow-visible group"
            >
              {/* Delete Button */}
              <button
                onClick={() => removeAttack(attack.id)}
                className="absolute -top-2 -right-2 p-1.5 bg-medieval-blood text-white rounded-full shadow-lg opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:scale-110"
                title="Remover Ataque"
              >
                <Trash2 className="w-3 h-3" />
              </button>

              <div className="md:col-span-4 space-y-1">
                <label className="text-[10px] font-bold text-parchment-dark uppercase tracking-widest">
                  Nome do Ataque
                </label>
                <input
                  type="text"
                  value={attack.name}
                  onChange={(e) => updateAttack(index, "name", e.target.value)}
                  className="w-full bg-black/40 border border-medieval-iron/50 rounded px-3 py-2 text-sm text-parchment-light font-bold focus:border-medieval-gold outline-none"
                />
              </div>

              <div className="md:col-span-2 space-y-1">
                <label className="text-[10px] font-bold text-parchment-dark uppercase tracking-widest">
                  Acerto
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-medieval-gold font-bold text-xs">
                    +
                  </span>
                  <input
                    type="number"
                    value={attack.attackBonus}
                    onChange={(e) =>
                      updateAttack(index, "attackBonus", Number(e.target.value))
                    }
                    className="w-full bg-black/40 border border-medieval-iron/50 rounded pl-6 pr-2 py-2 text-sm text-parchment-light focus:border-medieval-gold outline-none text-center font-mono"
                  />
                </div>
              </div>

              <div className="md:col-span-3 space-y-1">
                <label className="text-[10px] font-bold text-parchment-dark uppercase tracking-widest flex items-center gap-1">
                  <Dice6 size={10} /> Dados
                </label>
                <input
                  type="text"
                  value={attack.damageDice}
                  onChange={(e) =>
                    updateAttack(index, "damageDice", e.target.value)
                  }
                  className={`w-full bg-black/40 border ${
                    validateDiceString(attack.damageDice)
                      ? "border-medieval-iron/50"
                      : "border-medieval-blood"
                  } rounded px-3 py-2 text-sm text-parchment-light focus:border-medieval-gold outline-none text-center font-mono`}
                  placeholder="Ex: 2d6"
                />
              </div>

              <div className="md:col-span-2 space-y-1">
                <label className="text-[10px] font-bold text-parchment-dark uppercase tracking-widest">
                  Bonus Dano
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-parchment-dark font-bold text-xs">
                    +
                  </span>
                  <input
                    type="number"
                    value={attack.bonusDamage}
                    onChange={(e) =>
                      updateAttack(index, "bonusDamage", Number(e.target.value))
                    }
                    className="w-full bg-black/40 border border-medieval-iron/50 rounded pl-6 pr-2 py-2 text-sm text-parchment-light focus:border-medieval-gold outline-none text-center font-mono"
                  />
                </div>
              </div>

              <div className="md:col-span-1 flex flex-col items-center justify-center h-full pb-2">
                <span className="text-[10px] text-parchment-dark uppercase">
                  Médio
                </span>
                <span className="text-xl font-bold text-medieval-gold">
                  {attack.averageDamage ||
                    calculateDiceAverage(attack.damageDice, attack.bonusDamage)}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {formData.attacks?.length === 0 && (
          <div
            className="text-center py-10 opacity-30 border-2 border-dashed border-medieval-iron/30 rounded-xl hover:border-medieval-gold/50 transition-colors cursor-pointer"
            onClick={addAttack}
          >
            <Sword className="w-12 h-12 mx-auto mb-2 text-medieval-iron" />
            <p className="text-sm font-serif text-parchment-dark">
              Nenhum ataque configurado.
            </p>
            <p className="text-xs text-medieval-gold mt-1">
              Clique para adicionar
            </p>
          </div>
        )}

        <div className="mt-6 p-4 bg-medieval-gold/5 rounded-xl border border-medieval-gold/10 flex justify-between items-center">
          <p className="text-sm text-parchment-dark italic">
            Dano médio sugerido (ND {formData.challengeLevel}):
          </p>
          <span className="text-medieval-gold font-bold text-lg bg-black/20 px-4 py-1 rounded border border-medieval-gold/20">
            {formData.combatStats?.averageDamage}
          </span>
        </div>
      </div>
    </motion.div>
  );
};
