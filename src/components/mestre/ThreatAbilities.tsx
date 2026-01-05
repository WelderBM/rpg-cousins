import React from "react";
import { ThreatSheet, ThreatAbility } from "@/interfaces/ThreatSheet";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Zap, Sparkles, BookOpen } from "lucide-react";
import { ABILITY_SUGGESTIONS } from "@/data/threats/abilitySuggestions";

interface Props {
  formData: Partial<ThreatSheet>;
  setFormData: React.Dispatch<React.SetStateAction<Partial<ThreatSheet>>>;
}

export const ThreatAbilities: React.FC<Props> = ({ formData, setFormData }) => {
  const addAbility = () => {
    setFormData((prev) => ({
      ...prev,
      abilities: [
        ...(prev.abilities || []),
        {
          id: Date.now().toString(),
          name: "Nova Habilidade",
          description: "",
        },
      ],
    }));
  };

  const addSuggestion = (suggestion: any) => {
    if (formData.abilities?.some((a) => a.name === suggestion.name)) return;
    setFormData((prev) => ({
      ...prev,
      abilities: [
        ...(prev.abilities || []),
        { id: Date.now().toString(), ...suggestion },
      ],
    }));
  };

  const removeAbility = (index: number) => {
    const newAbilities = formData.abilities?.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, abilities: newAbilities }));
  };

  const updateAbility = (
    index: number,
    field: keyof ThreatAbility,
    value: string
  ) => {
    const newAbilities = [...(formData.abilities || [])];
    (newAbilities[index] as any)[field] = value;
    setFormData((prev) => ({ ...prev, abilities: newAbilities }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-serif text-xl font-bold text-parchment-DEFAULT flex items-center gap-2">
            <Sparkles className="text-medieval-gold" /> Habilidades Especiais
          </h3>
        </div>
        <button
          onClick={addAbility}
          className="flex items-center gap-2 px-4 py-2 bg-medieval-gold/10 hover:bg-medieval-gold/20 text-medieval-gold rounded-lg border border-medieval-gold/30 transition-all font-bold text-sm"
        >
          <Plus className="w-4 h-4" /> Adicionar Manual
        </button>
      </div>

      {/* Suggestions */}
      <div className="bg-medieval-stone/30 p-4 rounded-xl border border-medieval-iron/30">
        <label className="text-xs font-bold text-parchment-dark uppercase flex items-center gap-2 mb-3">
          <BookOpen size={14} /> Sugestões Rápidas de Habilidades Comuns
        </label>
        <div className="flex flex-wrap gap-2">
          {ABILITY_SUGGESTIONS.slice(0, 10).map((suggestion) => (
            <button
              key={suggestion.name}
              onClick={() => addSuggestion(suggestion)}
              className="px-3 py-1.5 bg-black/40 border border-medieval-iron/30 rounded-full text-xs text-parchment-light hover:border-medieval-gold/50 hover:text-medieval-gold hover:bg-medieval-gold/5 transition-all flex items-center gap-1"
            >
              <Plus size={10} /> {suggestion.name}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <AnimatePresence>
          {formData.abilities?.map((ability, index) => (
            <motion.div
              key={ability.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-black/20 p-5 rounded-xl border border-medieval-iron/30 group relative hover:border-medieval-gold/30 transition-colors"
            >
              <button
                onClick={() => removeAbility(index)}
                className="absolute top-4 right-4 text-parchment-dark hover:text-medieval-blood hover:bg-medieval-blood/10 p-1.5 rounded transition-colors"
                title="Remover Habilidade"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <div className="space-y-3">
                <input
                  type="text"
                  value={ability.name}
                  onChange={(e) => updateAbility(index, "name", e.target.value)}
                  className="bg-transparent border-b-2 border-transparent hover:border-medieval-iron/30 focus:border-medieval-gold outline-none text-medieval-gold font-bold font-serif text-lg w-full max-w-md placeholder-medieval-gold/30 transition-colors px-1"
                  placeholder="Nome da Habilidade..."
                />
                <textarea
                  value={ability.description}
                  onChange={(e) =>
                    updateAbility(index, "description", e.target.value)
                  }
                  className="w-full bg-black/30 border border-medieval-iron/20 rounded-lg p-3 text-sm text-parchment-light focus:border-medieval-gold/50 outline-none min-h-[5rem] resize-y placeholder-parchment-dark/50"
                  placeholder="Descrição detalhada do efeito da habilidade. Inclua testes, danos e condições."
                />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {formData.abilities?.length === 0 && (
          <div
            className="text-center py-10 opacity-30 border-2 border-dashed border-medieval-iron/30 rounded-xl hover:border-medieval-gold/50 transition-colors cursor-pointer"
            onClick={addAbility}
          >
            <Zap className="w-12 h-12 mx-auto mb-2 text-medieval-iron" />
            <p className="text-sm font-serif text-parchment-dark">
              Nenhuma habilidade adicionada.
            </p>
            <p className="text-xs text-medieval-gold mt-1">
              Adicione manualmente ou use as sugestões
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};
