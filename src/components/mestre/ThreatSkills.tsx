import React from "react";
import {
  ThreatSheet,
  ChallengeLevel,
  TreasureLevel,
} from "@/interfaces/ThreatSheet";
import { Atributo } from "@/data/atributos";
import { calculateAllSkills } from "@/functions/threatGenerator";
import { motion } from "framer-motion";
import { Brain, Dice5, Backpack, Coins, Save, Plus } from "lucide-react";

interface Props {
  formData: Partial<ThreatSheet>;
  setFormData: React.Dispatch<React.SetStateAction<Partial<ThreatSheet>>>;
  onSave: () => void;
  isSaving: boolean;
}

export const ThreatSkills: React.FC<Props> = ({
  formData,
  setFormData,
  onSave,
  isSaving,
}) => {
  const updateAttribute = (attr: Atributo, value: number) => {
    setFormData((prev) => ({
      ...prev,
      attributes: {
        ...prev.attributes!,
        [attr]: value,
      },
    }));
    // Note: Effect in parent should trigger skill recalculation if dependency array is set up correctly,
    // OR we trigger it here. Since the parent effect watches CombatStats, we should probably manually calc relevant updates or let parent handle it.
    // Ideally, parent effect watches attributes too.
  };

  const toggleSkill = (skillName: string, isTrained: boolean) => {
    setFormData((prev) => {
      const newSkills = [...(prev.skills || [])];
      const index = newSkills.findIndex((s) => s.name === skillName);
      if (index !== -1) {
        newSkills[index].trained = isTrained;
        // Recalculate
        const recalculated = calculateAllSkills(
          prev.challengeLevel as ChallengeLevel,
          prev.attributes!,
          newSkills,
          prev.resistanceAssignments!,
          prev.combatStats!
        );
        return { ...prev, skills: recalculated };
      }
      return prev;
    });
  };

  const addCustomSkill = () => {
    const name = prompt("Nome da Perícia (Ex: Diplomacia):");
    if (name) {
      setFormData((prev) => {
        let newSkills = [...(prev.skills || [])];
        // Check if exists
        if (!newSkills.find((s) => s.name === name)) {
          // Ideally we should know the attribute. Defaulting to INT or asking implies complexity.
          // For now, let's assume valid skill or just add it.
          // If calculateAllSkills handles new skills by name lookup, great. If not, we might need a mapping.
          // Assuming the existing system handles it via the provided list or we just add it to the list.
          // The current implementation in MestreClient just checks if it exists in the list.
          // If it's a completely new custom skill, calculateAllSkills might fail if it relies on a fixed list.
          // Let's rely on the previous implementation: find index. If not found, we can't easily add it without knowing its attribute.
          // The previous code only trained EXISTING skills in the list.
          const idx = newSkills.findIndex((s) => s.name === name);
          if (idx !== -1) {
            newSkills[idx].trained = true;
          } else {
            alert(
              "Perícia não encontrada nas regras padrão. Adicione manualmente apenas se for uma perícia padrão do sistema."
            );
            return prev;
          }
        } else {
          const idx = newSkills.findIndex((s) => s.name === name);
          newSkills[idx].trained = true;
        }

        const recalculated = calculateAllSkills(
          prev.challengeLevel as ChallengeLevel,
          prev.attributes!,
          newSkills,
          prev.resistanceAssignments!,
          prev.combatStats!
        );
        return { ...prev, skills: recalculated };
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-8"
    >
      {/* Attributes */}
      <div className="bg-medieval-stone/40 p-6 rounded-2xl border border-medieval-iron/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5">
          <Brain size={100} />
        </div>
        <h3 className="font-serif text-xl font-bold text-parchment-DEFAULT mb-6 flex items-center gap-2 relative z-10">
          <Brain className="w-6 h-6 text-medieval-gold" />
          Atributos (Modificadores)
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 relative z-10">
          {Object.values(Atributo).map((attr) => (
            <div key={attr} className="space-y-2 text-center group">
              <label className="text-xs font-bold text-parchment-dark uppercase group-hover:text-medieval-gold transition-colors">
                {attr.substring(0, 3)}
              </label>
              <input
                type="number"
                value={
                  formData.attributes?.[attr] === "-"
                    ? 0
                    : formData.attributes?.[attr]
                }
                onChange={(e) => updateAttribute(attr, Number(e.target.value))}
                className="w-full bg-black/60 border border-medieval-iron/50 rounded-lg py-3 text-center text-xl font-bold text-medieval-gold focus:border-medieval-gold outline-none focus:ring-1 focus:ring-medieval-gold transition-all"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Skills */}
      <div className="bg-medieval-stone/40 p-6 rounded-2xl border border-medieval-iron/30">
        <h3 className="font-serif text-xl font-bold text-parchment-DEFAULT mb-6 flex items-center gap-2">
          <Dice5 className="w-6 h-6 text-medieval-gold" />
          Treinamento de Perícias
        </h3>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {formData.skills?.map((skill) => {
            const isCombatSkill = [
              "Luta",
              "Pontaria",
              "Fortitude",
              "Reflexos",
              "Vontade",
              "Iniciativa",
              "Percepção",
            ].includes(skill.name);
            if (!isCombatSkill && !skill.trained) return null;

            return (
              <label
                key={skill.name}
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all border ${
                  skill.trained
                    ? "bg-medieval-gold/10 border-medieval-gold/40"
                    : "bg-black/20 border-medieval-iron/20 hover:bg-black/40"
                }`}
              >
                <input
                  type="checkbox"
                  checked={skill.trained}
                  onChange={(e) => toggleSkill(skill.name, e.target.checked)}
                  className="w-5 h-5 rounded border-medieval-iron bg-black/40 text-medieval-gold focus:ring-medieval-gold accent-medieval-gold"
                />
                <div className="flex flex-col">
                  <span
                    className={`text-sm font-bold ${
                      skill.trained
                        ? "text-medieval-gold"
                        : "text-parchment-light"
                    }`}
                  >
                    {skill.name}
                  </span>
                  <span className="text-xs text-parchment-dark font-bold">
                    +{skill.total}
                  </span>
                </div>
              </label>
            );
          })}

          <button
            onClick={addCustomSkill}
            className="flex items-center justify-center gap-2 p-3 border border-dashed border-medieval-iron/50 rounded-lg text-parchment-dark hover:text-parchment-light transition-all text-sm hover:border-medieval-gold/50 hover:bg-medieval-gold/5"
          >
            <Plus className="w-4 h-4" /> Adicionar Outra
          </button>
        </div>
      </div>

      {/* Equipment & Treasure */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-parchment-dark uppercase flex items-center gap-2">
              <Backpack size={16} /> Equipamento
            </label>
            <textarea
              value={formData.equipment}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  equipment: e.target.value,
                }))
              }
              className="w-full bg-black/40 border border-medieval-iron/50 rounded-lg p-3 text-sm text-parchment-light focus:border-medieval-gold outline-none h-32 resize-none"
              placeholder="Itens que a criatura carrega..."
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-parchment-dark uppercase flex items-center gap-2">
              <Coins size={16} /> Nível de Tesouro
            </label>
            <select
              value={formData.treasureLevel}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  treasureLevel: e.target.value as TreasureLevel,
                }))
              }
              className="w-full bg-black/40 border border-medieval-iron/50 rounded-lg px-4 py-3 text-parchment-light focus:border-medieval-gold outline-none cursor-pointer"
            >
              {Object.values(TreasureLevel).map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Save Card */}
        <div className="bg-medieval-gold/5 p-8 rounded-2xl border border-medieval-gold/20 flex flex-col justify-center items-center text-center space-y-6 shadow-lg shadow-medieval-gold/5">
          <div className="p-4 bg-medieval-gold/10 rounded-full border border-medieval-gold/30">
            <Save className="w-10 h-10 text-medieval-gold" />
          </div>
          <div>
            <h4 className="font-serif text-2xl font-bold text-medieval-gold mb-2">
              Finalizar Criação
            </h4>
            <p className="text-parchment-dark text-sm max-w-xs mx-auto">
              Ao salvar, a criatura será adicionada ao seu grimório e poderá ser
              consultada a qualquer momento.
            </p>
          </div>
          <button
            onClick={onSave}
            disabled={isSaving}
            className="w-full bg-medieval-gold hover:bg-amber-500 hover:scale-105 text-black font-bold py-4 rounded-xl transition-all shadow-xl flex items-center justify-center gap-3 disabled:opacity-50 disabled:hover:scale-100"
          >
            {isSaving ? (
              <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></span>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Salvar Monstro
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
};
