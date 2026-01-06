import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import CLASSES from "../../data/classes";
import { useCharacterStore } from "../../store/useCharacterStore";
import {
  ChevronRight,
  ChevronLeft,
  Check,
  Shield,
  Zap,
  Book,
  Swords,
  Brain,
  Sparkles,
} from "lucide-react";
import { ClassDescription } from "../../interfaces/Class";
import Skill from "../../interfaces/Skills";
import { Atributo } from "../../data/atributos";

import { formatAssetName } from "../../utils/assetUtils";

/**
 * Componente de Card de Classe Visual
 */
const RoleCard = React.memo(
  ({ role, onClick }: { role: ClassDescription; onClick: () => void }) => {
    const [imageLoaded, setImageLoaded] = useState(false);

    const assetName = formatAssetName(role.name);
    const imagePath = `/assets/classes/${assetName}.webp`;

    return (
      <motion.div
        onClick={onClick}
        whileHover={{ scale: 1.05, y: -5 }}
        whileTap={{ scale: 0.98 }}
        className="group relative cursor-pointer"
      >
        <div className="relative bg-gradient-to-br from-amber-900/40 via-amber-700/20 to-amber-900/40 p-[2px] rounded-2xl overflow-hidden shadow-2xl shadow-black/50 hover:shadow-amber-900/50 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-amber-500/0 to-transparent group-hover:via-amber-400/20 transition-all duration-500 opacity-0 group-hover:opacity-100" />
          <div className="relative bg-stone-900/90 backdrop-blur-md rounded-2xl overflow-hidden">
            <div className="relative aspect-[3/4] overflow-hidden">
              {!imageLoaded && (
                <div className="absolute inset-0 bg-gradient-to-br from-neutral-800 via-neutral-700 to-neutral-800 animate-pulse">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-amber-500/30 animate-spin" />
                  </div>
                </div>
              )}
              <Image
                src={imagePath}
                alt={role.name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className={`object-cover object-top transition-all duration-700 ${
                  imageLoaded
                    ? "opacity-100 scale-100 group-hover:scale-110"
                    : "opacity-0 scale-105"
                }`}
                onLoad={() => setImageLoaded(true)}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-900/20 to-transparent opacity-60 group-hover:opacity-30 transition-opacity duration-300" />
            </div>
            <div className="relative p-4 bg-gradient-to-t from-stone-950 to-stone-900/50 border-t border-amber-700/30">
              <h3 className="text-xl font-cinzel text-center text-amber-100 group-hover:text-amber-300 transition-colors duration-300 drop-shadow-lg">
                {role.name}
              </h3>
              <div className="absolute -top-3 right-4 bg-amber-600 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg shadow-amber-600/50">
                <ChevronRight className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }
);
RoleCard.displayName = "RoleCard";

const RoleSelection = () => {
  const {
    selectedRace,
    baseAttributes,
    flexibleAttributeChoices,
    selectClass,
    updateSkills,
    setStep,
    roleSelectionState,
    setRoleSelectionState,
  } = useCharacterStore();

  const [selectedPreview, setSelectedPreview] =
    useState<ClassDescription | null>(null);

  // --- SELECTION STATES ---
  const [basicSkillChoices, setBasicSkillChoices] = useState<
    Record<number, Skill>
  >({});
  const [classSkillChoices, setClassSkillChoices] = useState<Skill[]>([]);
  const [generalSkillChoices, setGeneralSkillChoices] = useState<Skill[]>([]);

  // Sync LOCAL state with STORE when initialized or when Store changes
  useEffect(() => {
    if (roleSelectionState.previewName) {
      const cls = CLASSES.find(
        (c) => c.name === roleSelectionState.previewName
      );
      if (cls) {
        setSelectedPreview(cls);
        setBasicSkillChoices(roleSelectionState.basic);
        setClassSkillChoices(roleSelectionState.classSkills);
        setGeneralSkillChoices(roleSelectionState.generalSkills);
      }
    }
  }, []); // Run once on mount

  // Sync STORE with LOCAL state whenever local state changes
  useEffect(() => {
    if (selectedPreview) {
      setRoleSelectionState({
        previewName: selectedPreview.name,
        basic: basicSkillChoices,
        classSkills: classSkillChoices,
        generalSkills: generalSkillChoices,
      });
    }
  }, [
    selectedPreview,
    basicSkillChoices,
    classSkillChoices,
    generalSkillChoices,
    setRoleSelectionState,
  ]);

  // Scroll to top when entering/leaving preview
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [selectedPreview]);

  const handlePreviewChange = (cls: ClassDescription | null) => {
    if (cls && cls.name !== selectedPreview?.name) {
      // Reset choices for new class
      setBasicSkillChoices({});
      setClassSkillChoices([]);
      setGeneralSkillChoices([]);
    }
    setSelectedPreview(cls);
  };

  // --- CALCULATIONS ---
  const stats = useMemo(() => {
    if (!selectedPreview) return null;

    const getFinalAttr = (attr: Atributo) => {
      let bonus = 0;
      if (selectedRace) {
        selectedRace.attributes.attrs.forEach((a, idx) => {
          if (a.attr === attr) bonus += a.mod;
          if (a.attr === "any" && flexibleAttributeChoices[idx] === attr)
            bonus += a.mod;
        });
      }
      return baseAttributes[attr] + bonus;
    };

    const conMod = getFinalAttr(Atributo.CONSTITUICAO);
    const intMod = getFinalAttr(Atributo.INTELIGENCIA);

    return {
      hp: selectedPreview.pv + conMod,
      pm: selectedPreview.pm,
      intMod,
    };
  }, [selectedPreview, selectedRace, baseAttributes, flexibleAttributeChoices]);

  const limits = useMemo(() => {
    if (!selectedPreview || !stats)
      return { class: 0, general: 0, raceBonus: 0 };

    const classQty = selectedPreview.periciasrestantes.qtd;
    const isHuman = selectedRace?.name === "Humano";
    const raceBonus = isHuman ? 1 : 0;
    return {
      class: classQty,
      extra: stats.intMod,
      raceBonus,
    };
  }, [selectedPreview, selectedRace, stats]);

  // --- POOL CALCULATIONS ---
  const pickedInBasic = useMemo(() => {
    if (!selectedPreview) return [];
    const fixed = selectedPreview.periciasbasicas
      .filter((g) => g.type === "and")
      .flatMap((g) => g.list);
    const choices = Object.values(basicSkillChoices);
    return [...fixed, ...choices];
  }, [selectedPreview, basicSkillChoices]);

  const availableForClass = useMemo(() => {
    if (!selectedPreview) return [];
    return selectedPreview.periciasrestantes.list.filter(
      (s) => !pickedInBasic.includes(s)
    );
  }, [selectedPreview, pickedInBasic]);

  const availableForGeneral = useMemo(() => {
    if (!selectedPreview) return [];
    const allSkills = Object.values(Skill);
    const alreadyPicked = [...pickedInBasic, ...classSkillChoices];
    return allSkills.filter((s) => !alreadyPicked.includes(s)).sort();
  }, [pickedInBasic, classSkillChoices, selectedPreview]);

  // --- HANDLERS ---
  const toggleClassSkill = (skill: Skill) => {
    if (classSkillChoices.includes(skill)) {
      setClassSkillChoices(classSkillChoices.filter((s) => s !== skill));
    } else {
      if (classSkillChoices.length < limits.class) {
        setClassSkillChoices([...classSkillChoices, skill]);
      }
    }
  };

  const toggleGeneralSkill = (skill: Skill) => {
    if (generalSkillChoices.includes(skill)) {
      setGeneralSkillChoices(generalSkillChoices.filter((s) => s !== skill));
    } else {
      if (generalSkillChoices.length < limits.extra) {
        setGeneralSkillChoices([...generalSkillChoices, skill]);
      }
    }
  };

  const handleConfirm = () => {
    if (!selectedPreview) return;
    const finalSkills = [
      ...pickedInBasic,
      ...classSkillChoices,
      ...generalSkillChoices,
    ];
    selectClass(selectedPreview);
    updateSkills(finalSkills);
    setStep(4);
  };

  const isValid = useMemo(() => {
    if (!selectedPreview) return false;
    const basicDone = selectedPreview.periciasbasicas.every((g, i) =>
      g.type === "or" ? !!basicSkillChoices[i] : true
    );
    const classDone = classSkillChoices.length === limits.class;
    const extraDone = generalSkillChoices.length === Math.max(0, limits.extra);
    return basicDone && classDone && extraDone;
  }, [
    selectedPreview,
    basicSkillChoices,
    classSkillChoices,
    generalSkillChoices,
    limits,
  ]);

  return (
    <div className="w-full min-h-screen relative bg-stone-950 pb-32">
      <AnimatePresence mode="wait">
        {!selectedPreview ? (
          <motion.div
            key="list"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col gap-8 p-4 md:p-8 max-w-7xl mx-auto pb-48 md:pb-32"
          >
            <div className="flex items-center justify-between mt-4">
              <button
                onClick={() => setStep(2)}
                className="flex items-center gap-2 px-4 py-2 bg-stone-900 border border-amber-900/40 rounded-lg text-neutral-300 hover:text-amber-500 hover:border-amber-500 transition-all z-10"
              >
                <ChevronLeft size={20} />
                <span className="hidden sm:inline">Voltar</span>
              </button>
              <h2 className="text-3xl md:text-5xl font-cinzel text-amber-500 absolute left-0 right-0 text-center pointer-events-none drop-shadow-xl">
                Escolha sua Classe
              </h2>
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-neutral-400 text-center font-cinzel tracking-[0.2em] text-sm md:text-base uppercase -mt-4"
            >
              Defina seu caminho marcial ou mágico
            </motion.p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {CLASSES.map((role, index) => (
                <motion.div
                  key={role.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <RoleCard
                    role={role}
                    onClick={() => handlePreviewChange(role)}
                  />
                </motion.div>
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
            className="max-w-4xl mx-auto p-4 md:p-8 space-y-8 pb-48 md:pb-32"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-stone-800 pb-4">
              <button
                onClick={() => setSelectedPreview(null)}
                className="flex items-center text-neutral-400 hover:text-white transition-colors"
                aria-label="Voltar"
              >
                <ChevronLeft size={24} />
                <span className="ml-1 font-bold uppercase tracking-wider text-xs">
                  Voltar
                </span>
              </button>
              <h2 className="text-3xl md:text-4xl font-cinzel text-amber-500 drop-shadow-lg">
                {selectedPreview.name}
              </h2>
              <div className="w-8" />
            </div>

            {/* Stats & Description */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Image & Description Banner */}
              <div className="md:col-span-2 relative overflow-hidden flex items-center bg-stone-900/50 rounded-2xl min-h-[300px] md:min-h-[500px]">
                <div className="absolute inset-0">
                  <Image
                    src={`/assets/classes/${formatAssetName(
                      selectedPreview.name
                    )}.webp`}
                    alt={selectedPreview.name}
                    fill
                    className="object-cover object-top opacity-30"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-950/80 to-transparent" />
                </div>
                <div className="relative z-10 p-6">
                  <p className="text-neutral-300 leading-relaxed italic text-sm md:text-base border-l-4 border-amber-600/50 pl-4">
                    "{selectedPreview.description || "Descrição indisponível."}"
                  </p>
                </div>
              </div>

              <div className="flex flex-row md:flex-col gap-4">
                <div className="flex-1 bg-red-950/20 p-4 rounded-xl border border-red-900/30 flex flex-col items-center justify-center">
                  <div className="flex items-center gap-2 mb-1 text-red-400/80">
                    <Shield size={16} />
                    <span className="text-[10px] font-bold uppercase">PV</span>
                  </div>
                  <span className="text-3xl font-cinzel text-red-100 font-bold">
                    {stats?.hp}
                  </span>
                </div>
                <div className="flex-1 bg-blue-950/20 p-4 rounded-xl border border-blue-900/30 flex flex-col items-center justify-center">
                  <div className="flex items-center gap-2 mb-1 text-blue-400/80">
                    <Zap size={16} />
                    <span className="text-[10px] font-bold uppercase">PM</span>
                  </div>
                  <span className="text-3xl font-cinzel text-blue-100 font-bold">
                    {stats?.pm}
                  </span>
                </div>
              </div>
            </div>

            {/* SKILLS - BASIC */}
            <section className="space-y-4">
              <h3 className="text-amber-500 font-cinzel text-lg border-b border-amber-900/30 pb-2 flex items-center gap-2">
                <Book size={18} /> Perícias Básicas
              </h3>
              <div className="grid gap-3">
                {selectedPreview.periciasbasicas.map((group, idx) => (
                  <div
                    key={idx}
                    className="bg-stone-900/50 p-4 rounded-xl border border-stone-800"
                  >
                    {group.type === "and" ? (
                      <div className="flex flex-wrap gap-3">
                        {group.list.map((skill) => (
                          <span
                            key={skill}
                            className="bg-black/40 text-amber-200 px-3 py-1 rounded text-sm font-bold flex items-center gap-2 border border-amber-900/20"
                          >
                            <Check size={14} className="text-amber-500" />{" "}
                            {skill}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <span className="text-xs text-stone-500 uppercase font-black tracking-widest block">
                          Escolha uma opção:
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {group.list.map((skill) => {
                            const selected = basicSkillChoices[idx] === skill;
                            return (
                              <button
                                key={skill}
                                onClick={() =>
                                  setBasicSkillChoices({
                                    ...basicSkillChoices,
                                    [idx]: skill,
                                  })
                                }
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all border ${
                                  selected
                                    ? "bg-amber-600 text-stone-950 border-amber-500 shadow-lg shadow-amber-900/40"
                                    : "bg-stone-800 text-stone-400 border-stone-700 hover:border-stone-500"
                                }`}
                              >
                                {skill}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* SKILLS - CLASS */}
            <section className="space-y-4">
              <div className="flex justify-between items-end border-b border-amber-900/30 pb-2">
                <h3 className="text-amber-500 font-cinzel text-lg flex items-center gap-2">
                  <Swords size={18} /> Treinamento de Classe
                </h3>
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full ${
                    classSkillChoices.length === limits.class
                      ? "bg-emerald-950/40 text-emerald-400 border border-emerald-900/50"
                      : "bg-stone-800 text-stone-400 border border-stone-700"
                  }`}
                >
                  {classSkillChoices.length} / {limits.class}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {availableForClass.map((skill) => {
                  const isSelected = classSkillChoices.includes(skill);
                  const isDisabled =
                    !isSelected && classSkillChoices.length >= limits.class;
                  return (
                    <button
                      key={skill}
                      disabled={isDisabled}
                      onClick={() => toggleClassSkill(skill)}
                      className={`text-left px-3 py-3 rounded-lg border transition-all text-sm flex items-center gap-2 ${
                        isSelected
                          ? "bg-amber-900/30 border-amber-500 text-amber-100"
                          : isDisabled
                          ? "opacity-30 cursor-not-allowed border-transparent text-stone-600 bg-stone-900"
                          : "bg-stone-900 border-stone-800 text-stone-400 hover:border-amber-900/50 hover:bg-stone-800"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center ${
                          isSelected
                            ? "bg-amber-500 border-amber-500"
                            : "border-stone-600 bg-black/40"
                        }`}
                      >
                        {isSelected && (
                          <Check size={12} className="text-stone-950" />
                        )}
                      </div>
                      {skill}
                    </button>
                  );
                })}
              </div>
            </section>

            {/* SKILLS - EXTRA (INT) */}
            {limits.extra > 0 && (
              <section className="space-y-4">
                <div className="flex justify-between items-end border-b border-amber-900/30 pb-2">
                  <h3 className="text-amber-500 font-cinzel text-lg flex items-center gap-2">
                    <Sparkles size={18} /> Perícias Extras (Inteligência)
                  </h3>
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full ${
                      generalSkillChoices.length === limits.extra
                        ? "bg-emerald-950/40 text-emerald-400 border border-emerald-900/50"
                        : "bg-stone-800 text-stone-400 border border-stone-700"
                    }`}
                  >
                    {generalSkillChoices.length} / {limits.extra}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {availableForGeneral.map((skill) => {
                    const isSelected = generalSkillChoices.includes(skill);
                    const isDisabled =
                      !isSelected && generalSkillChoices.length >= limits.extra;
                    return (
                      <button
                        key={skill}
                        disabled={isDisabled}
                        onClick={() => toggleGeneralSkill(skill)}
                        className={`text-left px-3 py-3 rounded-lg border transition-all text-sm flex items-center gap-2 ${
                          isSelected
                            ? "bg-teal-900/30 border-teal-500 text-teal-100"
                            : isDisabled
                            ? "opacity-30 cursor-not-allowed border-transparent text-stone-600 bg-stone-900"
                            : "bg-stone-900 border-stone-800 text-stone-400 hover:border-amber-900/50 hover:bg-stone-800"
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center ${
                            isSelected
                              ? "bg-teal-500 border-teal-500"
                              : "border-stone-600 bg-black/40"
                          }`}
                        >
                          {isSelected && (
                            <Check size={12} className="text-stone-950" />
                          )}
                        </div>
                        {skill}
                      </button>
                    );
                  })}
                </div>
              </section>
            )}

            {/* ACTION FOOTER */}
            <div className="sticky bottom-24 md:bottom-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-t from-stone-950 via-stone-950/95 to-transparent backdrop-blur-md z-30 border-t border-amber-900/20">
              <div className="max-w-4xl mx-auto">
                <button
                  onClick={handleConfirm}
                  disabled={!isValid}
                  className={`w-full py-4 font-bold font-cinzel text-lg rounded-xl shadow-2xl transition-all flex justify-center items-center gap-3 active:scale-[0.99] ${
                    isValid
                      ? "bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-stone-950 shadow-amber-900/20"
                      : "bg-stone-800 text-stone-500 cursor-not-allowed border border-stone-700"
                  }`}
                >
                  <Check size={24} /> Confirmar Classe
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RoleSelection;
