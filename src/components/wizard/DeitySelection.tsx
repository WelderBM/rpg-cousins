import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { DIVINDADES } from "../../data/divindades";
import { useCharacterStore } from "../../store/useCharacterStore";
import {
  ChevronRight,
  ChevronLeft,
  Check,
  AlertTriangle,
  Sparkles,
  Flame,
  Target,
  Users,
  Sword,
  Zap,
  Award,
  BookOpen,
  ShieldAlert,
} from "lucide-react";
import Divindade from "../../interfaces/Divindade";
import { GeneralPower } from "../../interfaces/Poderes";

// DEITY_RESTRICTIONS removed as it is now part of the Divindade interface

import { formatAssetName } from "../../utils/assetUtils";

const DeitySelection = () => {
  const {
    selectDeity,
    selectGrantedPowers,
    selectedClass,
    setStep,
    selectOrigin,
  } = useCharacterStore();

  const isMandatory = useMemo(() => {
    if (!selectedClass) return false;
    const name = selectedClass.name.toLowerCase();
    return (
      name.includes("clerigo") ||
      name.includes("paladino") ||
      name.includes("druida")
    );
  }, [selectedClass]);

  const powerLimit = useMemo(() => {
    if (!selectedClass) return 1;
    if (selectedClass.qtdPoderesConcedidos === "all") return 99; // Represents 'all'
    return Number(selectedClass.qtdPoderesConcedidos || 1);
  }, [selectedClass]);

  const [selectedPreview, setSelectedPreview] = useState<Divindade | null>(
    null
  );
  const [localSelectedPowers, setLocalSelectedPowers] = useState<
    GeneralPower[]
  >([]);

  // Scroll to top when entering/leaving preview
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [selectedPreview]);

  const availableDeities = useMemo(() => {
    return [...DIVINDADES].sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  const handleSelectDeityReview = (deity: Divindade) => {
    setSelectedPreview(deity);
    if (powerLimit >= 99) {
      // Clerics/Paladins receive all directly
      setLocalSelectedPowers(deity.poderes);
    } else {
      setLocalSelectedPowers([]);
    }
  };

  const togglePower = (power: GeneralPower) => {
    if (powerLimit >= 99) return; // Cannot toggle if receiving all

    const isSelected = localSelectedPowers.some((p) => p.name === power.name);
    if (isSelected) {
      setLocalSelectedPowers(
        localSelectedPowers.filter((p) => p.name !== power.name)
      );
    } else {
      if (localSelectedPowers.length < powerLimit) {
        setLocalSelectedPowers([...localSelectedPowers, power]);
      }
    }
  };

  const handleConfirm = () => {
    if (!selectedPreview) return;

    // Check if limit is reached (unless receiving all)
    if (powerLimit < 99 && localSelectedPowers.length < powerLimit) {
      alert(`Você deve escolher ${powerLimit} poder(es) concedido(s).`);
      return;
    }

    selectDeity(selectedPreview);
    selectGrantedPowers(localSelectedPowers);
    setStep(5); // Go to SummarySelection
  };

  const handleSkip = () => {
    selectDeity(null as any);
    selectGrantedPowers([]);
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
            <div className="flex items-center justify-between mt-4">
              <button
                onClick={() => selectOrigin(null as any)}
                className="flex items-center gap-2 px-4 py-2 bg-stone-900 border border-amber-900/40 rounded-lg text-neutral-300 hover:text-amber-500 hover:border-amber-500 transition-all z-10"
              >
                <ChevronLeft size={20} />
                <span className="hidden sm:inline">Voltar</span>
              </button>
              <h2 className="text-3xl md:text-5xl font-cinzel text-amber-500 absolute left-0 right-0 text-center pointer-events-none drop-shadow-xl">
                Escolha sua Divindade
              </h2>
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-neutral-400 text-center font-cinzel tracking-[0.2em] text-sm md:text-base uppercase -mt-4 opacity-70"
            >
              {powerLimit >= 99 ? (
                <>
                  Você receberá{" "}
                  <span className="text-amber-500 font-bold">todos</span> os
                  poderes concedidos.
                </>
              ) : (
                <>
                  Escolha{" "}
                  <span className="text-amber-500 font-bold">{powerLimit}</span>{" "}
                  poder(es) concedido(s).
                </>
              )}
            </motion.p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {!isMandatory && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={handleSkip}
                  className="group relative cursor-pointer"
                >
                  <div className="relative h-full bg-gradient-to-br from-stone-800 via-stone-700 to-stone-800 p-[2px] rounded-2xl overflow-hidden shadow-2xl hover:shadow-stone-500/20 transition-all duration-300">
                    <div className="relative h-full bg-stone-900/90 backdrop-blur-md rounded-2xl overflow-hidden flex flex-col items-center justify-center p-8 text-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-stone-800 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                        👤
                      </div>
                      <div>
                        <h3 className="text-xl font-cinzel text-white mb-2">
                          Sem Divindade
                        </h3>
                        <p className="text-sm text-stone-500">
                          Siga seu próprio caminho sem obrigações divinas.
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {availableDeities.map((deity, index) => {
                const assetName = formatAssetName(deity.name);
                const imagePath = `/assets/deities/${assetName}.webp`;

                return (
                  <motion.div
                    key={deity.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    onClick={() => handleSelectDeityReview(deity)}
                    className="group relative cursor-pointer"
                  >
                    <div className="relative bg-gradient-to-br from-amber-900/40 via-amber-700/20 to-amber-900/40 p-[2px] rounded-2xl overflow-hidden shadow-2xl shadow-black/50 hover:shadow-amber-900/50 transition-all duration-300">
                      <div className="relative bg-stone-900/90 backdrop-blur-md rounded-2xl overflow-hidden aspect-[16/10]">
                        <Image
                          src={imagePath}
                          alt={deity.name}
                          fill
                          className="object-cover object-top opacity-40 group-hover:opacity-60 transition-all duration-700 scale-100 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-900/20 to-transparent" />
                        <div className="absolute inset-0 p-6 flex flex-col justify-end">
                          <h3 className="text-2xl font-cinzel text-amber-100 drop-shadow-lg group-hover:text-amber-400 transition-colors">
                            {deity.name}
                          </h3>
                          <p className="text-xs text-stone-400 uppercase tracking-widest font-bold mt-1">
                            {deity.poderes.length} Poderes Concedidos
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
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
                  Voltar para lista
                </span>
              </button>
              <h2 className="text-3xl md:text-4xl font-cinzel text-amber-500 drop-shadow-lg">
                {selectedPreview.name}
              </h2>
              <div className="w-8" />
            </div>

            {/* Banner Area */}
            <div className="bg-stone-900/30 rounded-2xl border border-stone-800 overflow-hidden">
              <div className="relative min-h-[300px] md:min-h-[500px] flex items-center justify-center p-6">
                <div className="absolute inset-0">
                  <Image
                    src={`/assets/deities/${formatAssetName(
                      selectedPreview.name
                    )}.webp`}
                    alt={selectedPreview.name}
                    fill
                    className="object-cover object-top opacity-30 grayscale-[20%]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-stone-950/80 via-stone-900/60 to-stone-900/90" />
                </div>

                <div className="relative z-10 w-full flex flex-col items-center">
                  <span
                    className={`text-sm font-bold px-4 py-2 rounded-full border backdrop-blur-sm shadow-xl ${
                      powerLimit >= 99
                        ? "bg-emerald-900/60 text-emerald-300 border-emerald-500/50"
                        : "bg-amber-900/60 text-amber-300 border-amber-500/50"
                    }`}
                  >
                    {powerLimit >= 99
                      ? `${selectedPreview.poderes.length} Poderes Incluídos Automáticamente`
                      : `Selecione ${powerLimit} poder(es) de ${selectedPreview.poderes.length}`}
                  </span>
                </div>
              </div>

              <div className="p-6 space-y-8">
                {/* Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-stone-900/40 p-4 rounded-xl border border-stone-800">
                    <div className="flex items-center gap-2 text-amber-500 font-bold text-xs uppercase tracking-widest mb-2">
                      <Target size={16} /> Crenças e Objetivos
                    </div>
                    <p className="text-stone-300 text-sm leading-relaxed">
                      {selectedPreview.crencasObjetivos}
                    </p>
                  </div>

                  <div className="bg-stone-900/40 p-4 rounded-xl border border-stone-800">
                    <div className="flex items-center gap-2 text-amber-500 font-bold text-xs uppercase tracking-widest mb-2">
                      <Award size={16} /> Símbolo Sagrado
                    </div>
                    <p className="text-stone-300 text-sm leading-relaxed">
                      {selectedPreview.simboloSagrado}
                    </p>
                  </div>

                  <div className="bg-stone-900/40 p-4 rounded-xl border border-stone-800">
                    <div className="flex items-center gap-2 text-amber-500 font-bold text-xs uppercase tracking-widest mb-2">
                      <Zap size={16} /> Canalização de Energia
                    </div>
                    <p className="text-stone-300 text-sm leading-relaxed">
                      {selectedPreview.canalizacaoEnergia}
                    </p>
                  </div>

                  <div className="bg-stone-900/40 p-4 rounded-xl border border-stone-800">
                    <div className="flex items-center gap-2 text-amber-500 font-bold text-xs uppercase tracking-widest mb-2">
                      <Sword size={16} /> Arma Preferida
                    </div>
                    <p className="text-stone-300 text-sm leading-relaxed">
                      {selectedPreview.armaPreferida}
                    </p>
                  </div>

                  <div className="bg-stone-900/40 p-4 rounded-xl border border-stone-800 md:col-span-2">
                    <div className="flex items-center gap-2 text-amber-500 font-bold text-xs uppercase tracking-widest mb-2">
                      <Users size={16} /> Devotos Permitidos
                    </div>
                    <p className="text-stone-300 text-sm leading-relaxed">
                      {selectedPreview.devotos}
                    </p>
                  </div>
                </div>

                {/* Restrictions Section */}
                <div className="bg-red-950/20 border border-red-900/30 p-6 rounded-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <ShieldAlert size={80} />
                  </div>
                  <h3 className="text-red-400 font-bold text-sm uppercase mb-3 flex items-center gap-2 tracking-widest">
                    <AlertTriangle size={20} /> Obrigações & Restrições
                  </h3>
                  <p className="text-neutral-300 text-sm leading-relaxed relative z-10">
                    {selectedPreview.obrigacoesRestricoes}
                  </p>
                </div>

                <div>
                  <h3 className="text-stone-500 lowercase tracking-widest font-bold text-xs mb-4 flex items-center gap-2">
                    <Flame size={16} className="text-amber-600" /> PODERES
                    CONCEDIDOS{" "}
                    {powerLimit < 99 && (
                      <span className="text-amber-500 ml-2">
                        ({localSelectedPowers.length} / {powerLimit})
                      </span>
                    )}
                  </h3>
                  <div className="grid gap-3">
                    {selectedPreview.poderes.map((power) => {
                      const isSelected = localSelectedPowers.some(
                        (p) => p.name === power.name
                      );
                      const canSelectMore =
                        localSelectedPowers.length < powerLimit;
                      const isDisabled =
                        powerLimit < 99 && !isSelected && !canSelectMore;

                      return (
                        <div
                          key={power.name}
                          onClick={() => togglePower(power)}
                          className={`p-5 rounded-xl border transition-all relative group cursor-pointer ${
                            isSelected
                              ? "border-emerald-500/50 bg-emerald-900/20"
                              : isDisabled
                              ? "border-stone-800 bg-stone-900/50 opacity-50 grayscale cursor-not-allowed"
                              : "border-stone-800 bg-stone-900/40 hover:border-amber-500/30"
                          }`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <span
                              className={`font-bold font-cinzel text-lg ${
                                isSelected
                                  ? "text-emerald-100"
                                  : "text-stone-200"
                              }`}
                            >
                              {power.name}
                            </span>
                            {isSelected ? (
                              <div className="bg-emerald-500/20 text-emerald-400 p-1 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                                <Check size={16} />
                              </div>
                            ) : (
                              powerLimit < 99 && (
                                <div className="w-6 h-6 rounded-full border-2 border-stone-700" />
                              )
                            )}
                          </div>
                          <p className="text-sm text-stone-400 leading-relaxed font-light">
                            {(power as any).text ||
                              (power as any).description ||
                              "Descrição indisponível."}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* ACTION FOOTER */}
            <div className="sticky bottom-24 md:bottom-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-t from-stone-950 via-stone-950/95 to-transparent backdrop-blur-md z-30 border-t border-amber-900/20">
              <div className="max-w-4xl mx-auto flex gap-4">
                {!isMandatory && (
                  <button
                    onClick={handleSkip}
                    className="flex-1 py-4 font-bold font-cinzel text-lg rounded-xl border border-stone-700 text-stone-400 hover:bg-stone-900 transition-all"
                  >
                    Pular Devoção
                  </button>
                )}
                <button
                  onClick={handleConfirm}
                  disabled={
                    powerLimit < 99 && localSelectedPowers.length < powerLimit
                  }
                  className={`flex-[2] py-4 font-bold font-cinzel text-lg rounded-xl shadow-2xl transition-all flex justify-center items-center gap-3 active:scale-[0.99] ${
                    powerLimit < 99 && localSelectedPowers.length < powerLimit
                      ? "bg-stone-800 text-stone-600 cursor-not-allowed opacity-50"
                      : "bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-stone-950 shadow-amber-900/20 hover:scale-[1.01]"
                  }`}
                >
                  <Check size={24} />
                  {powerLimit < 99 && localSelectedPowers.length < powerLimit
                    ? `Escolha mais ${powerLimit - localSelectedPowers.length}`
                    : "Confirmar Fé"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DeitySelection;
