import React, { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { ORIGINS } from "../../data/origins";
import { useCharacterStore } from "../../store/useCharacterStore";
import {
  ChevronRight,
  ChevronLeft,
  Check,
  Book,
  Sparkles,
  AlertTriangle,
  Sword,
  ChevronDown,
} from "lucide-react";
import Origin from "../../interfaces/Origin";
import Skill from "../../interfaces/Skills";
import { GeneralPower, OriginPower } from "../../interfaces/Poderes";
import EQUIPAMENTOS, { Armas } from "../../data/equipamentos";
import Equipment from "../../interfaces/Equipment";

import { formatAssetName } from "../../utils/assetUtils";

/**
 * Componente de Card de Origem Visual
 */
const OriginCard = React.memo(
  ({ origin, onClick }: { origin: Origin; onClick: () => void }) => {
    const [imageLoaded, setImageLoaded] = useState(false);

    const assetName = formatAssetName(origin.name);
    const imagePath = `/assets/origins/${assetName}.webp`;

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
                alt={origin.name}
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
                {origin.name}
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
OriginCard.displayName = "OriginCard";

const OriginSelection = () => {
  const {
    selectOrigin,
    selectedOrigin,
    originBenefits,
    setOriginBenefits,
    selectedSkills,
    selectedRace,
    setStep,
    selectedOriginWeapons,
    setSelectedOriginWeapons,
    wizardDrafts,
    setWizardDraft,
  } = useCharacterStore();

  const [selectedPreview, setSelectedPreview] = useState<Origin | null>(null);
  const [localOriginWeapons, setLocalOriginWeapons] = useState<Equipment[]>([]);

  // Sync LOCAL state with STORE draft
  React.useEffect(() => {
    const draft = wizardDrafts.origin;
    if (draft.previewName) {
      const origin = Object.values(ORIGINS).find(
        (o) => o.name === draft.previewName
      );
      if (origin) {
        setSelectedPreview(origin);
        setLocalOriginWeapons(draft.localWeapons);
      }
    }
  }, []); // Run once on mount

  // Sync draft whenever state changes
  React.useEffect(() => {
    if (selectedPreview) {
      setWizardDraft("origin", {
        previewName: selectedPreview.name,
        localWeapons: localOriginWeapons,
      });
    }
  }, [selectedPreview, localOriginWeapons, setWizardDraft]);

  // Scroll to top when entering/leaving preview
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [selectedPreview]);

  // --- AUTO-SCROLL LOGIC ---
  const benefitsRef = useRef<HTMLDivElement>(null);
  const weaponsRef = useRef<HTMLDivElement>(null);
  const prevCompletion = useRef({
    benefits: false,
    weapons: false,
  });

  useEffect(() => {
    if (!selectedPreview) return;

    // Check completion status
    const isBenefitsComplete = originBenefits.length === 2;

    const weaponChoicesNeeded =
      selectedPreview.getItems?.().filter((i) => !!i.choice).length || 0;
    const isWeaponsComplete =
      weaponChoicesNeeded === 0 ||
      localOriginWeapons.filter(Boolean).length === weaponChoicesNeeded;

    const current = {
      benefits: isBenefitsComplete,
      weapons: isWeaponsComplete,
    };
    const prev = prevCompletion.current;

    const scrollToRef = (ref: React.RefObject<HTMLDivElement>) => {
      ref.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    };

    // Transitions
    if (!prev.benefits && current.benefits) {
      if (!current.weapons) scrollToRef(weaponsRef);
    } else if (!prev.weapons && current.weapons) {
      if (!current.benefits) scrollToRef(benefitsRef);
    }

    prevCompletion.current = current;
  }, [originBenefits, localOriginWeapons, selectedPreview]);

  // Combine already known skills to prevent duplicates
  const knownSkills = useMemo(() => {
    return [...selectedSkills];
  }, [selectedSkills]);

  // Handle Selection of Origin for Preview
  const handleSelectPreview = (origin: Origin) => {
    setSelectedPreview(origin);

    // If it's a different origin than before, reset benefits and internal weapons
    if (selectedOrigin?.name !== origin.name) {
      setOriginBenefits([]);
      setLocalOriginWeapons([]);
      setWizardDraft("origin", {
        previewName: origin.name,
        localWeapons: [],
      });
    }

    // Initialize weapon choices
    if (origin.getItems) {
      const items = origin.getItems();
      const choices = items.filter((i) => !!i.choice);
      if (choices.length > 0) {
        // If we already have selections in store for this origin, use them
        if (
          selectedOrigin?.name === origin.name &&
          selectedOriginWeapons.length > 0
        ) {
          setLocalOriginWeapons(selectedOriginWeapons);
        } else {
          // Default to whatever getItems() returns, but ensure it respects the 30 gold limit
          const defaults = choices
            .map((c) => {
              const available = (
                c.choice === "Armas Marciais"
                  ? [
                      ...EQUIPAMENTOS.armasSimples,
                      ...EQUIPAMENTOS.armasMarciais,
                    ]
                  : EQUIPAMENTOS.armasSimples
              ).filter((arm) => (arm.preco ?? 0) <= 30);

              if (
                typeof c.equipment !== "string" &&
                (c.equipment.preco ?? 0) <= 30
              ) {
                return c.equipment;
              }

              return available[0];
            })
            .filter(Boolean) as Equipment[];
          setLocalOriginWeapons(defaults);
        }
      }
    }
  };

  const toggleBenefit = (benefitObj: any) => {
    const isSelected = originBenefits.some(
      (b) => b.name === benefitObj.name && b.type === benefitObj.type
    );

    if (isSelected) {
      setOriginBenefits(
        originBenefits.filter(
          (b) => !(b.name === benefitObj.name && b.type === benefitObj.type)
        )
      );
    } else {
      if (originBenefits.length < 2) {
        setOriginBenefits([...originBenefits, benefitObj]);
      }
    }
  };

  const handleConfirm = () => {
    if (!selectedPreview) return;
    selectOrigin(selectedPreview);
    setSelectedOriginWeapons(localOriginWeapons);
    setStep(5);
  };

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
            <div className="sticky top-14 bg-stone-950/90 backdrop-blur-md py-4 flex items-center justify-between border-b border-amber-900/20 shadow-lg -mx-8 px-8 z-40">
              <button
                onClick={() => setStep(3)}
                className="flex items-center gap-2 px-4 py-2 bg-stone-900 border border-amber-900/40 rounded-lg text-neutral-300 hover:text-amber-500 hover:border-amber-500 transition-all z-10"
              >
                <ChevronLeft size={20} />
                <span className="hidden sm:inline">Voltar</span>
              </button>
              <h2 className="text-2xl md:text-4xl font-cinzel text-amber-500 absolute left-0 right-0 text-center pointer-events-none drop-shadow-xl">
                Origem
              </h2>
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-neutral-400 text-center font-cinzel tracking-[0.2em] text-sm md:text-base uppercase -mt-4 opacity-70"
            >
              Cada origem permite escolher{" "}
              <span className="text-amber-500 font-bold">2 benefícios</span>{" "}
              (perícias ou poderes).
            </motion.p>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
              {Object.values(ORIGINS)
                // Filter to ensure we only have valid origin objects with unique names
                .filter(
                  (origin, index, self) =>
                    origin &&
                    typeof origin.name === "string" &&
                    self.findIndex((o) => o.name === origin.name) === index
                )
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((origin, index) => (
                  <motion.div
                    key={origin.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <OriginCard
                      origin={origin}
                      onClick={() => handleSelectPreview(origin)}
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
            <div className="sticky top-14 z-50 bg-stone-950/90 backdrop-blur-md py-4 flex items-center justify-between border-b border-amber-900/20 shadow-lg mb-6 -mx-4 px-4 md:-mx-8 md:px-8">
              <button
                onClick={() => {
                  setSelectedPreview(null);
                  setWizardDraft("origin", { previewName: null });
                }}
                className="flex items-center gap-2 px-3 py-2 bg-stone-900/80 border border-amber-900/40 rounded-lg text-neutral-300 hover:text-amber-500 hover:border-amber-500 transition-all z-10 text-sm"
              >
                <ChevronLeft size={18} />
                <span className="hidden sm:inline">Voltar</span>
              </button>
              <h2 className="text-xl md:text-2xl font-cinzel text-amber-500 absolute left-0 right-0 text-center pointer-events-none drop-shadow-xl">
                {selectedPreview?.name}
              </h2>
            </div>

            {/* Header & Image Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-stone-950 border border-white/5 h-48 md:h-64">
              <Image
                src={`/assets/origins/${formatAssetName(
                  selectedPreview?.name || ""
                )}.webp`}
                alt={selectedPreview?.name || ""}
                fill
                className="object-cover object-top opacity-30 grayscale-[20%]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent" />
              <div className="absolute bottom-4 left-4 md:left-6">
                <h2 className="text-2xl md:text-4xl font-cinzel text-amber-100 drop-shadow-2xl">
                  {selectedPreview?.name}
                </h2>
              </div>
            </div>

            {/* Selection Progress Overlay */}
            <div className="bg-stone-900/40 backdrop-blur-md border border-white/5 p-4 rounded-xl flex items-center justify-between">
              <span className="text-[10px] font-black text-stone-500 uppercase tracking-widest">
                Benefícios da Origem
              </span>
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full ${
                  originBenefits.length === 2
                    ? "bg-emerald-950/40 text-emerald-400 border border-emerald-900/50"
                    : "bg-amber-900/40 text-amber-500 border border-amber-900/50"
                }`}
              >
                {originBenefits.length} / 2
              </span>
            </div>

            <div className="space-y-6" ref={benefitsRef}>
              {/* Skills */}
              <div className="mb-8">
                <h3 className="text-stone-500 uppercase tracking-widest font-bold text-xs mb-3 flex items-center gap-2">
                  <Book size={14} /> Perícias Disponíveis
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedPreview?.pericias.map((skill) => {
                    const isKnown = knownSkills.includes(skill);
                    const isSelected = originBenefits.some(
                      (b) => b.name === skill && b.type === "skill"
                    );
                    const isLimitReached = originBenefits.length >= 2;

                    return (
                      <div key={skill} className="group/skill relative">
                        <button
                          disabled={isLimitReached && !isSelected}
                          onClick={() =>
                            toggleBenefit({
                              type: "skill",
                              name: skill,
                              value: skill,
                            })
                          }
                          className={`px-4 py-2 rounded-lg text-sm font-bold border transition-all flex items-center gap-2
                                      ${
                                        isSelected
                                          ? "bg-emerald-900/40 text-emerald-200 border-emerald-500 shadow-[0_0_15px_-5px_var(--color-emerald-500)]"
                                          : isKnown
                                          ? "bg-amber-950/20 text-stone-500 border-amber-900/30 opacity-60"
                                          : isLimitReached
                                          ? "bg-stone-900/50 text-stone-600 border-stone-800 cursor-not-allowed"
                                          : "bg-stone-900 border-stone-700 text-stone-300 hover:border-amber-500/50"
                                      }
                                  `}
                        >
                          {skill}
                          {isSelected && (
                            <Check size={14} className="text-emerald-500" />
                          )}
                          {isKnown && !isSelected && (
                            <AlertTriangle
                              size={14}
                              className="text-amber-900/50"
                            />
                          )}
                        </button>

                        {/* Tooltip for Known Skills */}
                        {isKnown && (
                          <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-64 p-3 bg-stone-950 border border-amber-500/30 rounded-xl text-xs text-amber-100 shadow-2xl opacity-0 group-hover/skill:opacity-100 transition-opacity pointer-events-none z-50 text-center backdrop-blur-md">
                            <p className="font-bold mb-1 text-amber-500">
                              Perícia já treinada
                            </p>
                            Você já possui treinamento nesta perícia via Raça ou
                            Classe. Se escolher ela aqui, não receberá benefício
                            extra.
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-stone-950"></div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Powers */}
              <div>
                <h3 className="text-stone-500 uppercase tracking-widest font-bold text-xs mb-3 flex items-center gap-2">
                  <Sparkles size={14} /> Poderes Disponíveis
                </h3>
                <div className="grid gap-3">
                  {selectedPreview?.poderes.map((power: any, idx: number) => {
                    const isSelected = originBenefits.some(
                      (b) => b.name === power.name && b.type === "power"
                    );
                    const isLimitReached = originBenefits.length >= 2;

                    return (
                      <button
                        key={idx}
                        disabled={isLimitReached && !isSelected}
                        onClick={() =>
                          toggleBenefit({
                            type: "power",
                            name: power.name,
                            value: power,
                          })
                        }
                        className={`p-4 rounded-xl border transition-all relative text-left group
                                    ${
                                      isSelected
                                        ? "bg-emerald-900/20 border-emerald-500 shadow-[0_0_15px_-5px_var(--color-emerald-500)]"
                                        : isLimitReached
                                        ? "bg-stone-900/50 border-stone-800 opacity-60 cursor-not-allowed"
                                        : "bg-stone-900 border-stone-800 hover:border-amber-500/40"
                                    }
                                  `}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span
                            className={`font-bold font-cinzel text-lg ${
                              isSelected ? "text-emerald-100" : "text-stone-200"
                            }`}
                          >
                            {power.name}
                          </span>
                          {isSelected && (
                            <div className="bg-emerald-500/20 text-emerald-400 p-1 rounded-full">
                              <Check size={14} />
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-stone-400 leading-relaxed group-hover:text-stone-300">
                          {(power as any).text ||
                            (power as any).description ||
                            "Descrição indisponível."}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Weapon Choice if Applicable */}
            {selectedPreview?.getItems?.()?.some((i) => !!i.choice) && (
              <div
                ref={weaponsRef}
                className="bg-amber-900/10 p-6 rounded-xl border border-amber-900/30 space-y-4"
              >
                <div className="flex items-center gap-2">
                  <Sword className="text-amber-500" size={20} />
                  <h4 className="text-sm font-bold text-amber-200 uppercase tracking-widest">
                    Escolha seu Equipamento de Origem
                  </h4>
                </div>
                <p className="text-xs text-stone-400">
                  Sua origem permite que você escolha uma arma específica de um
                  grupo.
                </p>

                <div className="grid gap-4">
                  {selectedPreview
                    ?.getItems()
                    .filter((i) => !!i.choice)
                    .map((item, idx) => {
                      const available = (
                        item.choice === "Armas Marciais"
                          ? [
                              ...EQUIPAMENTOS.armasSimples,
                              ...EQUIPAMENTOS.armasMarciais,
                            ]
                          : EQUIPAMENTOS.armasSimples
                      ).filter((arm) => (arm.preco ?? 0) <= 30);

                      return (
                        <div key={idx} className="space-y-2">
                          <label className="text-[10px] text-stone-500 font-bold uppercase tracking-tighter">
                            {item.description || "Escolha uma arma"}
                          </label>
                          <div className="relative group">
                            <select
                              value={localOriginWeapons[idx]?.nome || ""}
                              onChange={(e) => {
                                const w = available.find(
                                  (arm) => arm.nome === e.target.value
                                );
                                if (w) {
                                  const next = [...localOriginWeapons];
                                  next[idx] = w;
                                  setLocalOriginWeapons(next);
                                }
                              }}
                              className="w-full bg-black/40 border border-stone-800 text-stone-200 p-4 rounded-xl outline-none focus:border-amber-500 appearance-none cursor-pointer transition-all"
                            >
                              {available.map((arm) => (
                                <option key={arm.nome} value={arm.nome}>
                                  {arm.nome} ({arm.dano} | {arm.critico})
                                </option>
                              ))}
                            </select>
                            <ChevronDown
                              size={18}
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-amber-500/50 group-hover:text-amber-500 pointer-events-none transition-colors"
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Items Summary (Just visuals) */}
            <div className="bg-black/20 p-6 rounded-xl border border-stone-800/50">
              <h4 className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-3">
                Itens Iniciais (Automáticos)
              </h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-stone-400">
                {selectedPreview?.getItems ? (
                  selectedPreview?.getItems().map((item, i) => {
                    // Check if this is a choice item
                    const isChoice = !!item.choice;
                    const choiceIdx =
                      selectedPreview
                        ?.getItems()
                        ?.filter((x, prevIdx) => !!x.choice && prevIdx < i)
                        .length || 0;

                    return (
                      <li key={i} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-stone-700 rounded-full" />
                        {item.qtd ? `${item.qtd}x ` : ""}
                        {isChoice && localOriginWeapons[choiceIdx] ? (
                          <span className="text-amber-500 font-medium">
                            {localOriginWeapons[choiceIdx].nome}
                          </span>
                        ) : typeof item.equipment === "string" ? (
                          item.equipment
                        ) : (
                          item.equipment.nome
                        )}
                        {isChoice && (
                          <span className="text-[10px] bg-amber-900/30 text-amber-500 px-1.5 py-0.5 rounded ml-1">
                            ESCOLHIDO
                          </span>
                        )}
                      </li>
                    );
                  })
                ) : (
                  <li className="italic opacity-50">Itens padrão da origem.</li>
                )}
              </ul>
            </div>

            {/* Footer Action */}
            <div className="fixed bottom-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-t from-stone-950 via-stone-950 to-transparent backdrop-blur-md z-50">
              <div className="max-w-2xl mx-auto">
                <button
                  onClick={handleConfirm}
                  disabled={originBenefits.length !== 2}
                  className={`w-full py-4 font-black rounded-xl shadow-2xl transition-all flex justify-center items-center gap-2 uppercase tracking-widest text-sm active:scale-95 ${
                    originBenefits.length === 2
                      ? "bg-amber-600 hover:bg-amber-500 text-stone-950 shadow-amber-900/20 group"
                      : "bg-stone-800 text-stone-500 cursor-not-allowed border border-stone-700 opacity-50 grayscale"
                  }`}
                >
                  {originBenefits.length === 2 ? (
                    <>
                      <Check size={20} /> Confirmar Origem
                    </>
                  ) : (
                    `Escolha mais ${2 - originBenefits.length} benefício${
                      2 - originBenefits.length > 1 ? "s" : ""
                    }`
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OriginSelection;
