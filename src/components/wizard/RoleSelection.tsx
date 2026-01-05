import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CLASSES from "../../data/classes";
import { useCharacterStore } from "../../store/useCharacterStore";
import {
  ChevronRight,
  ChevronLeft,
  Check,
  Shield,
  Zap,
  Book,
  Info,
} from "lucide-react";
import { ClassDescription } from "../../interfaces/Class";
import Skill from "../../interfaces/Skills";
import { Atributo } from "../../data/atributos";
import { SheetAction } from "../../interfaces/CharacterSheet";

// Helper to get modifier
const getModifier = (val: number) => Math.floor((val - 10) / 2);

const RoleSelection = () => {
  const {
    selectedRace,
    baseAttributes,
    flexibleAttributeChoices,
    selectClass,
    updateSkills,
    setStep,
  } = useCharacterStore();

  const [selectedPreview, setSelectedPreview] =
    useState<ClassDescription | null>(null);

  // State for skill selections
  // For basic skills that have "OR" choices (e.g. Luta OR Pontaria)
  const [basicSkillChoices, setBasicSkillChoices] = useState<
    Record<number, Skill>
  >({});

  // For the pool of remaining skills to choose from
  const [optionalSkillChoices, setOptionalSkillChoices] = useState<Skill[]>([]);

  // Calculate stats based on current race/attributes
  const stats = useMemo(() => {
    if (!selectedPreview) return null;

    // Get final attributes using a robust helper logic
    const getFinalAttr = (attr: Atributo) => {
      let bonus = 0;
      // Fixed bonuses
      if (selectedRace) {
        selectedRace.attributes.attrs.forEach((a, idx) => {
          if (a.attr === attr) bonus += a.mod;
          if (a.attr === "any" && flexibleAttributeChoices[idx] === attr)
            bonus += a.mod;
        });
      }
      return baseAttributes[attr] + bonus;
    };

    const conMod = getFinalAttr(Atributo.CONSTITUICAO); // Store stores mod-based values now
    const intMod = getFinalAttr(Atributo.INTELIGENCIA);

    return {
      hp: selectedPreview.pv + conMod, // PV = Base + CON mod
      pm: selectedPreview.pm,
      intMod,
    };
  }, [selectedPreview, selectedRace, baseAttributes, flexibleAttributeChoices]);

  // Reset choices when preview changes
  useEffect(() => {
    setBasicSkillChoices({});
    setOptionalSkillChoices([]);
  }, [selectedPreview]);

  // Calculate available skills for the optional list (excluding those already picked in basic)
  const availableSkillsPool = useMemo(() => {
    if (!selectedPreview) return [];

    return selectedPreview.periciasrestantes.list.filter((skill) => {
      // Check if already mandatory/picked in basic
      const isPickedInBasic =
        Object.values(basicSkillChoices).includes(skill) ||
        selectedPreview.periciasbasicas.some(
          (g) => g.type === "and" && g.list.includes(skill)
        );

      return !isPickedInBasic;
    });
  }, [selectedPreview, basicSkillChoices]);

  // Determine how many optional skills can be picked
  const maxOptionalSkills = useMemo(() => {
    if (!selectedPreview || !stats) return 0;
    // Base + Int, floor at 0
    const rawTarget = selectedPreview.periciasrestantes.qtd + stats.intMod;
    const target = Math.max(0, rawTarget);

    // Safety: if the pool is smaller than the target, use pool size
    return Math.min(target, availableSkillsPool.length);
  }, [selectedPreview, stats, availableSkillsPool]);

  const handleOptionalSkillToggle = (skill: Skill) => {
    if (optionalSkillChoices.includes(skill)) {
      setOptionalSkillChoices((prev) => prev.filter((s) => s !== skill));
    } else {
      if (optionalSkillChoices.length < maxOptionalSkills) {
        setOptionalSkillChoices((prev) => [...prev, skill]);
      }
    }
  };

  const handleConfirm = () => {
    if (!selectedPreview) return;

    // Aggregate final skills
    const finalSkills: Skill[] = [];

    // Add basic (mandatory and choices)
    selectedPreview.periciasbasicas.forEach((group, idx) => {
      if (group.type === "and") {
        finalSkills.push(...group.list);
      } else if (group.type === "or") {
        if (basicSkillChoices[idx]) {
          finalSkills.push(basicSkillChoices[idx]);
        }
      }
    });

    // Add optional
    finalSkills.push(...optionalSkillChoices);

    selectClass(selectedPreview);
    updateSkills(finalSkills);
    // Proceed to next step (or finish if this is current last step)
    // For now we might just log or alert, but usually we would setStep(4)
    // The prompt implies "Creating Step 3", so user might expect it to handle next.
    // I'll assume step 4 is next.
    setStep(4);
  };

  // Validation
  const isValid = useMemo(() => {
    if (!selectedPreview) return false;

    // Check basic choices
    const allBasicChoicesMade = selectedPreview.periciasbasicas.every(
      (group, idx) => {
        if (group.type === "or") return !!basicSkillChoices[idx];
        return true;
      }
    );

    // Check optional quantity
    // It's strictly equal or just max? Usually you MUST pick all allowed.
    const allOptionalPicked = optionalSkillChoices.length === maxOptionalSkills;

    return allBasicChoicesMade && allOptionalPicked;
  }, [
    selectedPreview,
    basicSkillChoices,
    optionalSkillChoices,
    maxOptionalSkills,
  ]);

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
                onClick={() => setStep(2)}
                className="flex items-center gap-2 px-4 py-2 bg-black/40 backdrop-blur-md border border-amber-700/30 rounded-lg text-neutral-200 hover:text-amber-400 hover:border-amber-500/50 transition-all"
              >
                <ChevronLeft size={20} />
                <span className="hidden sm:inline">Voltar</span>
              </button>
              <h2 className="text-2xl font-cinzel text-amber-500 flex-1 text-center">
                Escolha sua Classe
              </h2>
              <div className="w-[88px] hidden sm:block" />{" "}
              {/* Spacer for centering */}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-20">
              {CLASSES.map((role) => (
                <div
                  key={role.name}
                  onClick={() => setSelectedPreview(role)}
                  className="bg-neutral-900/80 border border-neutral-700 hover:border-amber-500/50 p-4 rounded-xl cursor-pointer transition-all hover:bg-neutral-800 flex justify-between items-center group"
                >
                  <span className="text-lg font-cinzel text-neutral-200 group-hover:text-amber-400">
                    {role.name}
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
              {/* Stats Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-red-950/30 p-4 rounded-lg border border-red-900/30 flex flex-col items-center">
                  <div className="flex items-center gap-2 mb-1 text-red-400">
                    <Shield size={16} />{" "}
                    <span className="text-xs font-bold uppercase">
                      Vida (PV)
                    </span>
                  </div>
                  <span className="text-2xl font-cinzel text-white">
                    {stats?.hp}
                  </span>
                  <span className="text-[10px] text-red-400/60">
                    Base {selectedPreview.pv} + Con
                  </span>
                </div>
                <div className="bg-blue-950/30 p-4 rounded-lg border border-blue-900/30 flex flex-col items-center">
                  <div className="flex items-center gap-2 mb-1 text-blue-400">
                    <Zap size={16} />{" "}
                    <span className="text-xs font-bold uppercase">
                      Mana (PM)
                    </span>
                  </div>
                  <span className="text-2xl font-cinzel text-white">
                    {stats?.pm}
                  </span>
                  <span className="text-[10px] text-blue-400/60">
                    Base {selectedPreview.pm}
                  </span>
                </div>
              </div>

              {/* Proficiencies */}
              <div>
                <h3 className="text-sm uppercase tracking-wider text-neutral-500 mb-2">
                  Proficiências
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedPreview.proficiencias.map((prof, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 bg-neutral-800 text-neutral-300 text-xs rounded border border-neutral-700"
                    >
                      {prof}
                    </span>
                  ))}
                </div>
              </div>

              {/* Skill Selection - Mandatory */}
              <div>
                <h3 className="text-sm uppercase tracking-wider text-neutral-500 mb-3 flex items-center gap-2">
                  <Book size={14} /> Perícias Básicas
                </h3>
                <div className="space-y-3">
                  {selectedPreview.periciasbasicas.map((group, idx) => (
                    <div
                      key={idx}
                      className="bg-neutral-950/50 p-3 rounded border border-neutral-800"
                    >
                      {group.type === "and" ? (
                        <div className="flex flex-wrap gap-2">
                          {group.list.map((skill) => (
                            <span
                              key={skill}
                              className="text-amber-500 font-bold text-sm flex items-center gap-1"
                            >
                              <Check size={12} /> {skill}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <span className="text-xs text-neutral-400 mb-1 block">
                            Escolha uma:
                          </span>
                          {group.list.map((skill) => (
                            <label
                              key={skill}
                              className="flex items-center gap-2 cursor-pointer hover:bg-neutral-800/50 p-1 rounded"
                            >
                              <input
                                type="radio"
                                name={`basic-skill-${idx}`}
                                className="accent-amber-500"
                                checked={basicSkillChoices[idx] === skill}
                                onChange={() =>
                                  setBasicSkillChoices({
                                    ...basicSkillChoices,
                                    [idx]: skill,
                                  })
                                }
                              />
                              <span className="text-sm text-neutral-200">
                                {skill}
                              </span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Skill Selection - Optional */}
              <div className="pb-20">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm uppercase tracking-wider text-neutral-500">
                    Perícias Adicionais
                  </h3>
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded ${
                      optionalSkillChoices.length === maxOptionalSkills
                        ? "bg-green-900/20 text-green-400"
                        : "bg-neutral-800 text-neutral-400"
                    }`}
                  >
                    {optionalSkillChoices.length} / {maxOptionalSkills}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {availableSkillsPool.map((skill) => {
                    const isSelected = optionalSkillChoices.includes(skill);
                    const isDisabled =
                      !isSelected &&
                      optionalSkillChoices.length >= maxOptionalSkills;

                    return (
                      <label
                        key={skill}
                        className={`flex items-center gap-2 p-2 rounded border transition-all cursor-pointer
                           ${
                             isSelected
                               ? "bg-amber-900/20 border-amber-500/50 text-amber-100"
                               : isDisabled
                               ? "opacity-50 cursor-not-allowed border-transparent bg-neutral-900"
                               : "bg-neutral-800 border-neutral-700 hover:bg-neutral-700"
                           }`}
                      >
                        <input
                          type="checkbox"
                          className="accent-amber-500 rounded sm:w-4 sm:h-4"
                          checked={isSelected}
                          disabled={isDisabled}
                          onChange={() => handleOptionalSkillToggle(skill)}
                        />
                        <span className="text-sm truncate" title={skill}>
                          {skill}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer Action */}
            <div className="p-4 bg-neutral-950 border-t border-neutral-800 sticky bottom-0 z-20">
              <button
                onClick={handleConfirm}
                disabled={!isValid}
                className={`w-full py-4 font-bold rounded-lg shadow-lg flex justify-center items-center gap-2 transition-all
                  ${
                    isValid
                      ? "bg-amber-600 hover:bg-amber-500 text-white shadow-amber-900/20 active:scale-[0.98]"
                      : "bg-neutral-800 text-neutral-500 cursor-not-allowed"
                  }`}
              >
                <Check size={20} />
                Confirmar {selectedPreview.name}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RoleSelection;
