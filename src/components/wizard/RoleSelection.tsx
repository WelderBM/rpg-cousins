import React, { useState, useMemo, useEffect, useRef } from "react";
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

import { formatAssetName } from "../../utils/assetUtils";
import { getWeapons } from "@/functions/general";
import Equipment from "@/interfaces/Equipment";

import { Info } from "lucide-react";
import EQUIPAMENTOS from "../../data/equipamentos";

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
    updateMoney,
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

  // --- REFS FOR AUTO-SCROLL ---
  const basicRef = useRef<HTMLDivElement>(null);
  const classRef = useRef<HTMLDivElement>(null);
  const generalRef = useRef<HTMLDivElement>(null);
  const powersRef = useRef<HTMLDivElement>(null);

  // Store previous completion states to detect transitions
  const prevCompletion = useRef({
    basic: false,
    class: false,
    general: false,
    powers: false,
  });

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

  const STARTING_MONEY = 18;

  const currentMoney = useMemo(() => {
    const spent = localWeapons.reduce(
      (acc, item) => acc + (item.preco || 0),
      0
    );
    return STARTING_MONEY - spent;
  }, [localWeapons]);

  const STANDARD_KIT: Equipment[] = [
    {
      nome: "Mochila",
      group: "Item Geral",
      preco: 0,
      spaces: 0,
      description: "Conteúdo do Kit de Aventureiro",
    },
    {
      nome: "Saco de dormir",
      group: "Item Geral",
      preco: 0,
      spaces: 1,
      description: "Conteúdo do Kit de Aventureiro",
    },
    {
      nome: "Traje de viajante",
      group: "Vestuário",
      preco: 0,
      spaces: 0, // Usually worn, doesn't count for space? Keeping 0 for free kit logic simplicity or 1 based on rules
      description: "Conteúdo do Kit de Aventureiro",
    },
    {
      nome: "Pederneira",
      group: "Item Geral",
      preco: 0,
      spaces: 0,
      description: "Conteúdo do Kit de Aventureiro",
    },
  ];

  // Initialize Standard Kit if empty
  useEffect(() => {
    if (selectedPreview && localWeapons.length === 0) {
      setLocalWeapons([...STANDARD_KIT]);
    }
  }, [selectedPreview]);

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
    // Powers are only for Level 2+
    return;
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
    selectClassPowers([]);
    setSelectedClassWeapons(localWeapons);
    updateMoney(currentMoney);
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
    const powersDone = true; // Level 1 = 0 powers (Unlocked at Lvl 2)

    const shopDone = currentMoney >= 0;

    return basicDone && classDone && extraDone && powersDone && shopDone;
  }, [
    selectedPreview,
    basicSkillChoices,
    classSkillChoices,
    generalSkillChoices,
    selectedClassPowers,
    localWeapons,
    currentMoney,
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

  // --- AUTO-SCROLL LOGIC ---
  useEffect(() => {
    if (!selectedPreview) return;

    // Calculate current completion states
    const isBasicComplete = selectedPreview.periciasbasicas.every((g, i) =>
      g.type === "or" ? !!basicSkillChoices[i] : true
    );
    const isClassComplete = classSkillChoices.length === limits.class;
    const isGeneralComplete =
      generalSkillChoices.length === Math.max(0, limits.extra || 0);
    const isPowersComplete = true;

    const currentStates = {
      basic: isBasicComplete,
      class: isClassComplete,
      general: isGeneralComplete,
      powers: isPowersComplete,
    };

    const prev = prevCompletion.current;

    // Helper to scroll to a ref
    const scrollToRef = (ref: React.RefObject<HTMLDivElement>) => {
      ref.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    };

    // Determine if we need to scroll
    // Check transitions from Incomplete -> Complete
    // Priority: Basic -> Class -> General -> Powers -> Shop

    // 1. Basic Finished
    if (!prev.basic && currentStates.basic) {
      if (!currentStates.class) scrollToRef(classRef);
      else if (!currentStates.general && limits.extra > 0)
        scrollToRef(generalRef);
      // else if (!currentStates.powers) scrollToRef(powersRef);
    }

    // Update previous state
    prevCompletion.current = currentStates;
  }, [
    selectedPreview,
    basicSkillChoices,
    classSkillChoices,
    generalSkillChoices,
    selectedClassPowers,
    localWeapons,
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
            <div className="sticky top-0 z-40 bg-stone-950/90 backdrop-blur-md py-4 flex items-center justify-between border-b border-amber-900/20 shadow-lg -mx-8 px-8">
              <button
                onClick={() => setStep(2)}
                className="flex items-center gap-2 px-4 py-2 bg-stone-900 border border-amber-900/40 rounded-lg text-neutral-300 hover:text-amber-500 hover:border-amber-500 transition-all z-10"
              >
                <ChevronLeft size={20} />
                <span className="hidden sm:inline">Voltar</span>
              </button>
              <h2 className="text-2xl md:text-4xl font-cinzel text-amber-500 absolute left-0 right-0 text-center pointer-events-none drop-shadow-xl">
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
            {/* Sticky Header for Detail View */}
            <div className="sticky top-0 z-50 bg-stone-950/90 backdrop-blur-md py-4 flex items-center justify-between border-b border-amber-900/20 shadow-lg mb-6 -mx-4 px-4 md:-mx-8 md:px-8">
              <button
                onClick={() => setSelectedPreview(null)}
                className="flex items-center gap-2 px-3 py-2 bg-stone-900/80 border border-amber-900/40 rounded-lg text-neutral-300 hover:text-amber-500 hover:border-amber-500 transition-all z-10 text-sm"
              >
                <ChevronLeft size={18} />
                <span className="hidden sm:inline">Voltar</span>
              </button>
              <h2 className="text-xl md:text-2xl font-cinzel text-amber-500 absolute left-0 right-0 text-center pointer-events-none drop-shadow-xl">
                {selectedPreview?.name}
              </h2>
            </div>

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
                  {/* Title removed from here as it is now in the sticky header, or we can keep it for impact? 
                      Keeping it for impact but maybe smaller or relying on the header. 
                      Actually, keeping it here looks good for the 'Hero' section feel. */}
                  <h2 className="text-2xl md:text-4xl font-cinzel text-amber-100 drop-shadow-2xl">
                    {selectedPreview?.name}
                  </h2>
                </div>
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
            <section ref={basicRef} className="space-y-4">
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
            <section ref={classRef} className="space-y-4">
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
              <section ref={generalRef} className="space-y-4">
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
            <section ref={powersRef} className="space-y-4 opacity-60">
              <div className="flex justify-between items-end border-b border-amber-900/30 pb-2">
                <h3 className="text-amber-500 font-cinzel text-lg flex items-center gap-2">
                  <Zap size={18} /> Poderes de Classe (Nível 2+)
                </h3>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-stone-800 text-stone-500 border border-stone-700">
                  0 / 0
                </span>
              </div>

              <p className="text-xs text-stone-500 italic">
                Poderes de classe tornam-se disponíveis a partir do 2º nível.
              </p>

              <div className="grid gap-3 pointer-events-none grayscale">
                {selectedPreview?.powers.map((power) => {
                  const isSelected = false;
                  const meetsRequirements = checkPowerRequirements(power);
                  // Always disabled visually
                  const isDisabled = true;

                  return (
                    <button
                      key={power.name}
                      disabled={isDisabled}
                      className={`text-left p-4 rounded-xl border transition-all ${
                        isDisabled
                          ? "opacity-40 cursor-not-allowed border-stone-800 text-stone-600 bg-stone-900/30"
                          : "bg-stone-900 border-stone-800 text-stone-300 hover:border-purple-900/50 hover:bg-stone-800"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 mt-0.5 border-stone-600 bg-black/40`}
                        ></div>
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
                                  // const reqMet = meetsRequirements;
                                  // Visualizing requirements as "not met" or just informative since whole section disabled
                                  // Keeping calculation for info
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

            {/* WEAPON SHOP */}
            <section className="space-y-4 pt-4 border-t border-stone-800">
              <div className="flex justify-between items-end border-b border-amber-900/30 pb-2">
                <h3 className="text-amber-500 font-cinzel text-lg flex items-center gap-2">
                  <Sword size={18} /> Equipamento Inicial
                </h3>
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full border ${
                    currentMoney >= 0
                      ? "bg-amber-900/30 text-amber-500 border-amber-900/50"
                      : "bg-red-900/30 text-red-500 border-red-900/50"
                  }`}
                >
                  T$ {currentMoney} Restantes
                </span>
              </div>

              {/* Standard Kit Info */}
              <div className="bg-stone-900/50 p-4 rounded-xl border border-stone-800">
                <h4 className="font-bold text-stone-300 text-sm mb-2 flex items-center gap-2">
                  <Book size={14} /> Kit de Aventureiro (Grátis)
                </h4>
                <p className="text-xs text-stone-500">
                  Inclui: Mochila, Saco de dormir, Traje de viajante e
                  Pederneira.
                </p>
              </div>

              {/* Weapon List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  ...EQUIPAMENTOS.armasSimples,
                  ...EQUIPAMENTOS.armasMarciais,
                  ...EQUIPAMENTOS.escudos,
                ]
                  .filter((w) => (w.preco || 0) <= 200) // Show affordable-ish items
                  .map((weapon) => {
                    // Check if we own this specific item (not just same name, but bought from shop)
                    // We identify shop items by having price > 0 (Standard kit is 0)
                    const ownedCount = localWeapons.filter(
                      (w) => w.nome === weapon.nome && (w.preco || 0) > 0
                    ).length;

                    return (
                      <button
                        key={weapon.nome}
                        onClick={() => {
                          if (ownedCount > 0) {
                            // Specify to remove one instance
                            const idx = localWeapons.findIndex(
                              (w) =>
                                w.nome === weapon.nome && (w.preco || 0) > 0
                            );
                            if (idx > -1) {
                              const next = [...localWeapons];
                              next.splice(idx, 1);
                              setLocalWeapons(next);
                            }
                          } else {
                            setLocalWeapons([...localWeapons, weapon]);
                          }
                        }}
                        className={`text-left p-3 rounded-lg border transition-all flex justify-between items-center ${
                          ownedCount > 0
                            ? "bg-amber-900/20 border-amber-500/50"
                            : "bg-stone-900 border-stone-800 hover:border-stone-600"
                        }`}
                      >
                        <div>
                          <div className="font-bold text-sm text-stone-200">
                            {weapon.nome}
                          </div>
                          <div className="text-[10px] text-stone-500">
                            {weapon.dano} | Crít: {weapon.critico}
                          </div>
                        </div>
                        <div className="text-right">
                          <div
                            className={`text-xs font-bold ${
                              ownedCount > 0
                                ? "text-amber-500"
                                : "text-stone-400"
                            }`}
                          >
                            T$ {weapon.preco}
                          </div>
                          {ownedCount > 0 && (
                            <div className="text-[10px] text-emerald-500 flex items-center justify-end gap-1">
                              <Check size={10} /> Comprado
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
              </div>

              {currentMoney < 0 && (
                <div className="mt-4 p-3 bg-red-900/20 border border-red-500/50 rounded-xl text-red-200 text-xs text-center font-bold animate-pulse">
                  Você gastou mais dinheiro do que possui! Remova itens para
                  continuar.
                </div>
              )}
            </section>

            {/* ACTION FOOTER */}
            <div className="fixed bottom-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-t from-stone-950 via-stone-950 to-transparent backdrop-blur-md z-50">
              <div className="max-w-2xl mx-auto">
                <button
                  onClick={handleConfirm}
                  disabled={!isValid}
                  className={`w-full py-4 font-black rounded-xl shadow-2xl transition-all flex justify-center items-center gap-2 uppercase tracking-widest text-sm active:scale-95 ${
                    isValid
                      ? "bg-amber-600 hover:bg-amber-500 text-stone-950 shadow-amber-900/20 group"
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
