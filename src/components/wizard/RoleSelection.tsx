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
  Sword,
} from "lucide-react";
import { ClassDescription, ClassPower } from "../../interfaces/Class";
import Skill from "../../interfaces/Skills";
import { Atributo } from "../../data/atributos";
import ARCANISTA, {
  allArcanistaSubtypes,
  feiticeiroPaths,
  draconicDamageTypes,
  ArcanistaSubtypes,
} from "../../data/classes/arcanista";

import EQUIPAMENTOS, { Armas } from "../../data/equipamentos";
import PROFICIENCIAS from "../../data/proficiencias";
import { formatAssetName } from "../../utils/assetUtils";
import { getWeapons } from "@/functions/general";
import Equipment from "@/interfaces/Equipment";

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
            <div className="relative p-2 md:p-4 bg-gradient-to-t from-stone-950 to-stone-900/50 border-t border-amber-700/30">
              <h3 className="text-sm md:text-xl font-cinzel text-center text-amber-100 group-hover:text-amber-300 transition-colors duration-300 drop-shadow-lg">
                {role.name}
              </h3>
              <div className="absolute -top-3 right-2 md:right-4 bg-amber-600 rounded-full p-1 md:p-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg shadow-amber-600/50">
                <ChevronRight className="w-3 h-3 md:w-4 md:h-4 text-white" />
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
    wizardDrafts,
    setWizardDraft,
    selectClassPowers,
    setSelectedClassWeapons,
    selectedClassWeapons,
  } = useCharacterStore();

  const [selectedPreview, setSelectedPreview] =
    useState<ClassDescription | null>(null);

  // --- SELECTION STATES ---
  const [basicSkillChoices, setBasicSkillChoices] = useState<
    Record<number, Skill>
  >({});
  const [classSkillChoices, setClassSkillChoices] = useState<Skill[]>([]);
  const [generalSkillChoices, setGeneralSkillChoices] = useState<Skill[]>([]);
  const [selectedClassPowers, setSelectedClassPowers] = useState<ClassPower[]>(
    []
  );
  const [localWeapons, setLocalWeapons] = useState<Equipment[]>([]);

  // --- CONFIG MODAL STATE ---
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [arcanistConfig, setArcanistConfig] = useState<{
    subtype: ArcanistaSubtypes | null;
    lineage: string | null;
    damageType: string | null;
  }>({ subtype: null, lineage: null, damageType: null });

  // Sync LOCAL state with STORE when initialized or when Store changes
  useEffect(() => {
    const draft = wizardDrafts.role;
    if (draft.previewName) {
      const cls = CLASSES.find((c) => c.name === draft.previewName);
      if (cls) {
        setSelectedPreview(cls);
        setBasicSkillChoices(draft.basic);
        setClassSkillChoices(draft.classSkills);
        setGeneralSkillChoices(draft.generalSkills);
        setSelectedClassPowers(draft.classPowers);
        setLocalWeapons(draft.localWeapons || []);
        setArcanistConfig(draft.arcanistConfig);
      }
    }
  }, []); // Run once on mount

  // Sync STORE with LOCAL state whenever local state changes
  useEffect(() => {
    if (selectedPreview) {
      setWizardDraft("role", {
        previewName: selectedPreview.name,
        basic: basicSkillChoices,
        classSkills: classSkillChoices,
        generalSkills: generalSkillChoices,
        classPowers: selectedClassPowers,
        localWeapons,
        arcanistConfig,
      });
    }
  }, [
    selectedPreview,
    basicSkillChoices,
    classSkillChoices,
    generalSkillChoices,
    selectedClassPowers,
    localWeapons,
    arcanistConfig,
    setWizardDraft,
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
      setSelectedClassPowers([]);
      setLocalWeapons([]);
      setArcanistConfig({ subtype: null, lineage: null, damageType: null });

      // Immediate draft clearing for the new preview
      setWizardDraft("role", {
        previewName: cls.name,
        basic: {},
        classSkills: [],
        generalSkills: [],
        classPowers: [],
        localWeapons: [],
        arcanistConfig: { subtype: null, lineage: null, damageType: null },
      });
    } else if (!cls) {
      // If closing preview, also clear names but keep choices if we want (or clear all)
      setWizardDraft("role", { previewName: null });
    }
    setSelectedPreview(cls);
  };

  // --- CALCULATIONS ---
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

  const stats = useMemo(() => {
    if (!selectedPreview) return null;

    const conMod = getFinalAttr(Atributo.CONSTITUICAO);
    const intMod = getFinalAttr(Atributo.INTELIGENCIA);

    return {
      hp: selectedPreview.pv + conMod,
      pm: selectedPreview.pm,
      intMod,
    };
  }, [selectedPreview, selectedRace, baseAttributes, flexibleAttributeChoices]);

  const limits = useMemo(() => {
    if (!selectedPreview || !stats) return { class: 0, extra: 0, raceBonus: 0 };

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

  const toggleWeapon = (weapon: Equipment, slotIdx: number) => {
    const newWeapons = [...localWeapons];
    newWeapons[slotIdx] = weapon;
    setLocalWeapons(newWeapons);
  };

  const weaponSlots = useMemo(() => {
    if (!selectedPreview) return [];

    // Standard T20 rule: 1 simple weapon, + 1 martial if proficient
    const slots = ["Arma Simples"];
    const hasMartial = selectedPreview.proficiencias.includes(
      PROFICIENCIAS.MARCIAIS
    );
    if (hasMartial) {
      slots.push("Arma Marcial");
    }
    return slots;
  }, [selectedPreview]);

  // Ensure localWeapons array size matches slots
  useEffect(() => {
    if (selectedPreview && localWeapons.length !== weaponSlots.length) {
      // Default to common weapons: Dagger (Simple) and Shortsword/Longsword (Martial)
      const newLocal = weaponSlots.map((slot, i) => {
        if (localWeapons[i]) return localWeapons[i];
        return slot === "Arma Simples" ? Armas.ADAGA : Armas.ESPADACURTA;
      });
      setLocalWeapons(newLocal);
    }
  }, [selectedPreview, weaponSlots]);

  // Helper to check if power requirements are met
  const checkPowerRequirements = (power: ClassPower): boolean => {
    if (!power.requirements || power.requirements.length === 0) return true;

    // At level 1, we only check attribute requirements
    return power.requirements.some((reqGroup) => {
      return reqGroup.every((req) => {
        if (req.type === "ATRIBUTO" && req.name && req.value !== undefined) {
          const attrValue = getFinalAttr(req.name as Atributo);
          return attrValue >= req.value;
        }
        if (req.type === "NIVEL" && req.value !== undefined) {
          return 1 >= req.value; // Level 1 character
        }
        // Other requirements are assumed to be met or not applicable at level 1
        return true;
      });
    });
  };

  const toggleClassPower = (power: ClassPower) => {
    const isSelected = selectedClassPowers.some((p) => p.name === power.name);

    if (isSelected) {
      setSelectedClassPowers(
        selectedClassPowers.filter((p) => p.name !== power.name)
      );
    } else {
      // Level 1 characters get 1 power
      if (selectedClassPowers.length < 1) {
        setSelectedClassPowers([...selectedClassPowers, power]);
      }
    }
  };

  const handleConfirm = () => {
    if (!selectedPreview) return;

    // Check if class requires configuration
    if (selectedPreview.name === "Arcanista") {
      setIsConfigModalOpen(true);
      return;
    }

    // Default fast-path for classes without options
    proceedWithSelection(selectedPreview);
  };

  const proceedWithSelection = (finalClass: ClassDescription) => {
    const finalSkills = [
      ...pickedInBasic,
      ...classSkillChoices,
      ...generalSkillChoices,
    ];

    // If the class has a setup function but we haven't run it (not Arcanist), run it with defaults
    // This covers classes like Cleric that might have a setup but no choices
    if (finalClass.setup && finalClass.name !== "Arcanista") {
      const setupClass = finalClass.setup(finalClass);
      selectClass(setupClass);
    } else {
      selectClass(finalClass);
    }

    updateSkills(finalSkills);
    selectClassPowers(selectedClassPowers);
    setSelectedClassWeapons(localWeapons);
    setStep(4);
  };

  const handleConfigConfirm = () => {
    if (!selectedPreview) return;

    if (selectedPreview?.name === "Arcanista") {
      if (!arcanistConfig.subtype) return; // Should be disabled if not selected

      // Apply setup with options
      const finalClass = ARCANISTA.setup!(selectedPreview, {
        subtype: arcanistConfig.subtype,
        lineage: arcanistConfig.lineage || undefined,
        damageType: arcanistConfig.damageType || undefined,
      });

      proceedWithSelection(finalClass);
      setIsConfigModalOpen(false);
    }
  };

  const isValid = useMemo(() => {
    if (!selectedPreview) return false;
    const basicDone = selectedPreview.periciasbasicas.every((g, i) =>
      g.type === "or" ? !!basicSkillChoices[i] : true
    );
    const classDone = classSkillChoices.length === limits.class;
    const extraDone =
      generalSkillChoices.length === Math.max(0, limits.extra || 0);
    const powersDone = selectedClassPowers.length === 1; // Level 1 = 1 power

    const weaponsDone =
      localWeapons.filter(Boolean).length === weaponSlots.length;

    return basicDone && classDone && extraDone && powersDone && weaponsDone;
  }, [
    selectedPreview,
    basicSkillChoices,
    classSkillChoices,
    generalSkillChoices,
    selectedClassPowers,
    localWeapons,
    weaponSlots,
    limits,
  ]);

  const isConfigValid = useMemo(() => {
    if (selectedPreview?.name === "Arcanista") {
      if (!arcanistConfig.subtype) return false;
      if (arcanistConfig.subtype === "Feiticeiro") {
        if (!arcanistConfig.lineage) return false;
        if (
          arcanistConfig.lineage === "Linhagem Dracônica" &&
          !arcanistConfig.damageType
        )
          return false;
      }
    }
    return true;
  }, [selectedPreview, arcanistConfig]);

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

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
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
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="max-w-2xl mx-auto w-full p-4 md:p-8 space-y-6 pb-32"
          >
            {/* Header & Stats Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-stone-950 border border-white/5">
              <div className="relative h-48 md:h-64 flex items-center justify-center bg-stone-950">
                <Image
                  src={`/assets/classes/${formatAssetName(
                    selectedPreview?.name || ""
                  )}.webp`}
                  alt={selectedPreview?.name || ""}
                  width={600}
                  height={900}
                  className="object-contain opacity-40 h-full w-auto"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 md:left-6">
                  <h2 className="text-2xl md:text-4xl font-cinzel text-amber-100 drop-shadow-2xl">
                    {selectedPreview?.name}
                  </h2>
                </div>
                {/* Discrete Back Button */}
                <button
                  onClick={() => setSelectedPreview(null)}
                  className="absolute top-4 left-4 z-10 p-2 bg-black/40 backdrop-blur-md border border-white/10 text-white rounded-full active:scale-95 transition-all"
                >
                  <ChevronLeft size={20} />
                </button>
              </div>

              {/* Quick Stats Overlay */}
              <div className="grid grid-cols-2 border-t border-white/5 bg-stone-900/40 backdrop-blur-md">
                <div className="p-3 flex flex-col items-center border-r border-white/5">
                  <span className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-1">
                    PV Iniciais
                  </span>
                  <span className="text-2xl font-cinzel text-red-100 font-bold">
                    {stats?.hp}
                  </span>
                </div>
                <div className="p-3 flex flex-col items-center">
                  <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">
                    PM Iniciais
                  </span>
                  <span className="text-2xl font-cinzel text-blue-100 font-bold">
                    {stats?.pm}
                  </span>
                </div>
              </div>
            </div>

            {/* Lore Refined */}
            <div className="bg-stone-900/30 border border-stone-800/50 p-4 rounded-xl italic text-xs md:text-sm text-stone-400 leading-relaxed">
              "{selectedPreview?.description}"
            </div>

            {/* SKILLS - BASIC */}
            <section className="space-y-4 pt-4 border-t border-stone-800 md:col-span-3 w-full">
              <h3 className="text-amber-500 font-cinzel text-lg flex items-center gap-2">
                <Sparkles size={18} /> Habilidades de 1º Nível
              </h3>
              <div className="grid gap-3">
                {selectedPreview?.abilities
                  .filter((a) => a.nivel === 1)
                  .map((ability, idx) => (
                    <div
                      key={idx}
                      className="bg-stone-900/50 p-4 rounded-xl border border-stone-800 space-y-2"
                    >
                      <h4 className="font-ciszel font-bold text-amber-100">
                        {ability.name}
                      </h4>
                      <p className="text-sm text-stone-400 leading-relaxed">
                        {ability.text}
                      </p>
                    </div>
                  ))}
                {selectedPreview?.abilities.filter((a) => a.nivel === 1)
                  .length === 0 && (
                  <p className="text-stone-500 italic">
                    Nenhuma habilidade inicial específica.
                  </p>
                )}
              </div>
            </section>

            {/* SKILLS - BASIC */}
            <section className="space-y-4">
              <h3 className="text-amber-500 font-cinzel text-lg border-b border-amber-900/30 pb-2 flex items-center gap-2">
                <Book size={18} /> Perícias Básicas
              </h3>
              <div className="grid gap-3">
                {selectedPreview?.periciasbasicas.map((group, idx) => (
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
                      !isSelected &&
                      generalSkillChoices.length >= (limits.extra || 0);
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

            {/* CLASS POWERS */}
            <section className="space-y-4">
              <div className="flex justify-between items-end border-b border-amber-900/30 pb-2">
                <h3 className="text-amber-500 font-cinzel text-lg flex items-center gap-2">
                  <Zap size={18} /> Poderes de Classe
                </h3>
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full ${
                    selectedClassPowers.length === 1
                      ? "bg-emerald-950/40 text-emerald-400 border border-emerald-900/50"
                      : "bg-stone-800 text-stone-400 border border-stone-700"
                  }`}
                >
                  {selectedClassPowers.length} / 1
                </span>
              </div>

              <p className="text-xs text-stone-500 italic">
                Escolha 1 poder de classe. Poderes com requisitos não atendidos
                aparecem desabilitados.
              </p>

              <div className="grid gap-3">
                {selectedPreview?.powers.map((power) => {
                  const isSelected = selectedClassPowers.some(
                    (p) => p.name === power.name
                  );
                  const meetsRequirements = checkPowerRequirements(power);
                  const isDisabled =
                    !isSelected &&
                    (!meetsRequirements || selectedClassPowers.length >= 1);

                  return (
                    <button
                      key={power.name}
                      disabled={isDisabled}
                      onClick={() => toggleClassPower(power)}
                      className={`text-left p-4 rounded-xl border transition-all ${
                        isSelected
                          ? "bg-purple-900/30 border-purple-500 text-purple-100"
                          : isDisabled
                          ? "opacity-40 cursor-not-allowed border-stone-800 text-stone-600 bg-stone-900/30"
                          : "bg-stone-900 border-stone-800 text-stone-300 hover:border-purple-900/50 hover:bg-stone-800"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 mt-0.5 ${
                            isSelected
                              ? "bg-purple-500 border-purple-500"
                              : "border-stone-600 bg-black/40"
                          }`}
                        >
                          {isSelected && (
                            <Check size={14} className="text-stone-950" />
                          )}
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-bold text-base">
                              {power.name}
                              {power.canRepeat && (
                                <span className="ml-2 text-[10px] bg-amber-900/40 text-amber-400 px-2 py-0.5 rounded-full">
                                  REPETÍVEL
                                </span>
                              )}
                            </h4>
                            {power.pmCost && (
                              <span className="text-xs bg-blue-900/40 text-blue-400 px-2 py-1 rounded-full whitespace-nowrap">
                                {power.pmCost} PM
                              </span>
                            )}
                          </div>
                          <p className="text-sm leading-relaxed opacity-90">
                            {power.text}
                          </p>
                          {power.requirements &&
                            power.requirements.length > 0 && (
                              <div className="flex flex-wrap gap-1 pt-1">
                                {power.requirements[0].map((req, idx) => {
                                  const reqMet = meetsRequirements;
                                  return (
                                    <span
                                      key={idx}
                                      className={`text-[10px] px-2 py-0.5 rounded-full ${
                                        reqMet
                                          ? "bg-emerald-900/40 text-emerald-400"
                                          : "bg-red-900/40 text-red-400"
                                      }`}
                                    >
                                      {req.type === "ATRIBUTO" &&
                                        `${req.name} ${req.value}+`}
                                      {req.type === "NIVEL" &&
                                        `Nível ${req.value}+`}
                                      {req.type === "PERICIA" &&
                                        `Perícia: ${req.name}`}
                                      {req.type === "PODER" &&
                                        `Poder: ${req.name}`}
                                    </span>
                                  );
                                })}
                              </div>
                            )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* WEAPONS */}
            <section className="space-y-4">
              <div className="flex justify-between items-end border-b border-amber-900/30 pb-2">
                <h3 className="text-amber-500 font-cinzel text-lg flex items-center gap-2">
                  <Sword size={18} /> Armas Iniciais
                </h3>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-950/40 text-emerald-400 border border-emerald-900/50">
                  {localWeapons.filter(Boolean).length} / {weaponSlots.length}
                </span>
              </div>

              <p className="text-xs text-stone-500 italic">
                Você recebe uma arma simples. Se for proficiente em armas
                marciais, recebe uma arma adicional.
              </p>

              <div className="grid gap-4">
                {weaponSlots.map((slot, idx) => {
                  const options =
                    slot === "Arma Simples"
                      ? EQUIPAMENTOS.armasSimples
                      : [
                          ...EQUIPAMENTOS.armasSimples,
                          ...EQUIPAMENTOS.armasMarciais,
                        ];

                  return (
                    <div key={idx} className="space-y-2">
                      <label className="text-[10px] text-stone-500 font-black uppercase tracking-widest pl-1">
                        {slot}
                      </label>
                      <div className="relative group">
                        <select
                          value={localWeapons[idx]?.nome || ""}
                          onChange={(e) => {
                            const weapon = options.find(
                              (w) => w.nome === e.target.value
                            );
                            if (weapon) toggleWeapon(weapon, idx);
                          }}
                          className="w-full bg-stone-900 border border-stone-800 text-stone-200 p-4 rounded-xl outline-none focus:border-amber-500 appearance-none cursor-pointer transition-all hover:bg-stone-800"
                        >
                          {options.map((w) => (
                            <option key={w.nome} value={w.nome}>
                              {w.nome} ({w.dano} | {w.critico})
                            </option>
                          ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-amber-500/50 group-hover:text-amber-500 transition-colors">
                          <Sword size={16} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* ACTION FOOTER */}
            <div className="fixed bottom-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-t from-stone-950 via-stone-950 to-transparent backdrop-blur-md z-50">
              <div className="max-w-2xl mx-auto">
                <button
                  onClick={handleConfirm}
                  disabled={!isValid}
                  className={`w-full py-4 font-bold font-cinzel text-lg rounded-xl shadow-2xl transition-all flex justify-center items-center gap-3 active:scale-95 ${
                    isValid
                      ? "bg-amber-600 text-stone-950 shadow-amber-900/20"
                      : "bg-stone-800 text-stone-500 cursor-not-allowed border border-stone-700 opacity-50 grayscale"
                  }`}
                >
                  <Check size={20} /> Confirmar Classe
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CONFIG MODAL */}
      <AnimatePresence>
        {isConfigModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-stone-900 border border-amber-900/50 rounded-2xl p-8 max-w-xl w-full shadow-2xl space-y-6"
            >
              <h3 className="text-2xl font-cinzel text-amber-500 text-center border-b border-amber-900/30 pb-4">
                Caminho do Arcanista
              </h3>

              <div className="space-y-6">
                {/* SUBTYPE */}
                <div className="space-y-2">
                  <label className="text-xs text-stone-400 uppercase tracking-widest font-bold">
                    Escolha seu Caminho
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {allArcanistaSubtypes.map((sub) => (
                      <button
                        key={sub}
                        onClick={() =>
                          setArcanistConfig({
                            ...arcanistConfig,
                            subtype: sub,
                            // Reset dependent fields if changing main type
                            lineage:
                              sub === "Feiticeiro"
                                ? arcanistConfig.lineage
                                : null,
                            damageType:
                              sub === "Feiticeiro"
                                ? arcanistConfig.damageType
                                : null,
                          })
                        }
                        className={`p-3 rounded-lg border text-sm font-bold transition-all ${
                          arcanistConfig.subtype === sub
                            ? "bg-amber-600 text-stone-950 border-amber-500"
                            : "bg-stone-800 text-stone-400 border-stone-700 hover:border-amber-500/50"
                        }`}
                      >
                        {sub}
                      </button>
                    ))}
                  </div>
                </div>

                {/* LINEAGE (Feiticeiro only) */}
                {arcanistConfig.subtype === "Feiticeiro" && (
                  <div className="space-y-2">
                    <label className="text-xs text-stone-400 uppercase tracking-widest font-bold">
                      Linhagem Sobrenatural
                    </label>
                    <select
                      value={arcanistConfig.lineage || ""}
                      onChange={(e) =>
                        setArcanistConfig({
                          ...arcanistConfig,
                          lineage: e.target.value,
                          // Reset damage if not Draconic
                          damageType:
                            e.target.value === "Linhagem Dracônica"
                              ? arcanistConfig.damageType
                              : null,
                        })
                      }
                      className="w-full bg-black/40 border border-stone-700 text-stone-200 rounded-lg p-3 outline-none focus:border-amber-500"
                    >
                      <option value="" disabled>
                        Selecione uma Linhagem
                      </option>
                      {feiticeiroPaths.map((path) => (
                        <option key={path.name} value={path.name}>
                          {path.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* DAMAGE TYPE (Draconic only) */}
                {arcanistConfig.lineage === "Linhagem Dracônica" && (
                  <div className="space-y-2">
                    <label className="text-xs text-stone-400 uppercase tracking-widest font-bold">
                      Elemento Dracônico
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {draconicDamageTypes.map((type) => (
                        <button
                          key={type}
                          onClick={() =>
                            setArcanistConfig({
                              ...arcanistConfig,
                              damageType: type,
                            })
                          }
                          className={`p-2 rounded border text-xs font-bold transition-all ${
                            arcanistConfig.damageType === type
                              ? "bg-red-500/80 text-white border-red-500"
                              : "bg-stone-800 text-stone-400 border-stone-700 hover:border-red-500/50"
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-8 pt-4 border-t border-stone-800">
                <button
                  onClick={() => setIsConfigModalOpen(false)}
                  className="flex-1 py-3 bg-stone-800 text-stone-400 rounded-xl font-bold hover:bg-stone-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfigConfirm}
                  disabled={!isConfigValid}
                  className={`flex-1 py-3 rounded-xl font-bold transition-all flex justify-center items-center gap-2 ${
                    isConfigValid
                      ? "bg-amber-600 text-stone-950 hover:bg-amber-500 shadow-lg shadow-amber-900/20"
                      : "bg-stone-800 text-stone-600 cursor-not-allowed"
                  }`}
                >
                  Confirmar Escolhas
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RoleSelection;
