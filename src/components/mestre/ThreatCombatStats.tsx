import React from "react";
import { ThreatSheet, ResistanceType } from "@/interfaces/ThreatSheet";
import { motion } from "framer-motion";
import { Zap, Shield, Heart, Swords, Target } from "lucide-react";

interface Props {
  formData: Partial<ThreatSheet>;
  setFormData: React.Dispatch<React.SetStateAction<Partial<ThreatSheet>>>;
}

export const ThreatCombatStats: React.FC<Props> = ({
  formData,
  setFormData,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div className="bg-medieval-gold/5 p-4 rounded-xl border border-medieval-gold/20 mb-6 flex gap-3 text-sm text-medieval-gold">
        <Zap className="w-5 h-5 flex-shrink-0" />
        <p>
          Os valores abaixo foram calculados automaticamente baseados no ND e
          Papel selecionados. Você pode ajustá-los livremente se desejar uma
          criatura atípica ou "quebrada".
        </p>
      </div>

      {/* Primary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="space-y-2 group">
          <label className="text-[10px] font-bold text-parchment-dark uppercase flex items-center gap-1 group-hover:text-red-400 transition-colors">
            <Heart size={12} /> Pontos de Vida
          </label>
          <input
            type="number"
            value={formData.combatStats?.hitPoints}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                combatStats: {
                  ...prev.combatStats!,
                  hitPoints: Number(e.target.value),
                },
              }))
            }
            className="w-full bg-black/40 border border-medieval-iron/50 rounded-lg px-4 py-2 text-parchment-light focus:border-red-500/50 outline-none text-center font-bold text-lg"
          />
        </div>

        <div className="space-y-2 group">
          <label className="text-[10px] font-bold text-parchment-dark uppercase flex items-center gap-1 group-hover:text-blue-400 transition-colors">
            <Shield size={12} /> Defesa
          </label>
          <input
            type="number"
            value={formData.combatStats?.defense}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                combatStats: {
                  ...prev.combatStats!,
                  defense: Number(e.target.value),
                },
              }))
            }
            className="w-full bg-black/40 border border-medieval-iron/50 rounded-lg px-4 py-2 text-parchment-light focus:border-blue-500/50 outline-none text-center font-bold text-lg"
          />
        </div>

        <div className="space-y-2 group">
          <label className="text-[10px] font-bold text-parchment-dark uppercase flex items-center gap-1 group-hover:text-amber-400 transition-colors">
            <Swords size={12} /> Bônus de Ataque
          </label>
          <input
            type="number"
            value={formData.combatStats?.attackValue}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                combatStats: {
                  ...prev.combatStats!,
                  attackValue: Number(e.target.value),
                },
              }))
            }
            className="w-full bg-black/40 border border-medieval-iron/50 rounded-lg px-4 py-2 text-parchment-light focus:border-amber-500/50 outline-none text-center font-bold text-lg"
          />
        </div>

        <div className="space-y-2 group">
          <label className="text-[10px] font-bold text-parchment-dark uppercase flex items-center gap-1 group-hover:text-purple-400 transition-colors">
            <Target size={12} /> CD Efeitos
          </label>
          <input
            type="number"
            value={formData.combatStats?.standardEffectDC}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                combatStats: {
                  ...prev.combatStats!,
                  standardEffectDC: Number(e.target.value),
                },
              }))
            }
            className="w-full bg-black/40 border border-medieval-iron/50 rounded-lg px-4 py-2 text-parchment-light focus:border-purple-500/50 outline-none text-center font-bold text-lg"
          />
        </div>
      </div>

      {/* Resistances */}
      <div className="bg-medieval-stone/30 p-6 rounded-xl border border-medieval-iron/30 mt-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5">
          <Shield size={100} />
        </div>

        <h4 className="font-serif text-lg font-bold text-parchment-DEFAULT mb-4 relative z-10">
          Resistências (Testes de Atributo)
        </h4>

        {/* Informative Display of Savings */}
        <div className="grid grid-cols-3 md:grid-cols-3 gap-6 mb-6 relative z-10 border-b border-medieval-iron/20 pb-4">
          <div className="text-center">
            <p className="text-[10px] uppercase text-parchment-dark font-bold">
              Resistência Forte (80%)
            </p>
            <p className="text-2xl font-bold text-green-400">
              +{formData.combatStats?.strongSave}
            </p>
          </div>
          <div className="text-center">
            <p className="text-[10px] uppercase text-parchment-dark font-bold">
              Resistência Média (50%)
            </p>
            <p className="text-2xl font-bold text-amber-400">
              +{formData.combatStats?.mediumSave}
            </p>
          </div>
          <div className="text-center">
            <p className="text-[10px] uppercase text-parchment-dark font-bold">
              Resistência Fraca (20%)
            </p>
            <p className="text-2xl font-bold text-red-400">
              +{formData.combatStats?.weakSave}
            </p>
          </div>
        </div>

        {/* Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
          {["Fortitude", "Reflexos", "Vontade"].map((save) => (
            <div key={save} className="space-y-2">
              <label className="text-xs font-bold text-parchment-dark uppercase">
                {save}
              </label>
              <select
                value={
                  formData.resistanceAssignments?.[
                    save as keyof typeof formData.resistanceAssignments
                  ]
                }
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    resistanceAssignments: {
                      ...prev.resistanceAssignments!,
                      [save]: e.target.value,
                    },
                  }))
                }
                className="w-full bg-black/40 border border-medieval-iron/50 rounded-lg px-3 py-2 text-parchment-light focus:border-medieval-gold outline-none text-sm hover:bg-black/60 transition-colors cursor-pointer"
              >
                <option value={ResistanceType.STRONG}>
                  Forte (+{formData.combatStats?.strongSave})
                </option>
                <option value={ResistanceType.MEDIUM}>
                  Média (+{formData.combatStats?.mediumSave})
                </option>
                <option value={ResistanceType.WEAK}>
                  Fraca (+{formData.combatStats?.weakSave})
                </option>
              </select>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
