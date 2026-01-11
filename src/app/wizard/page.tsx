"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCharacterStore } from "@/store/useCharacterStore";
import { RotateCcw, AlertTriangle, X, Check, ArrowLeft } from "lucide-react";
import { FloatingBackButton } from "@/components/FloatingBackButton";

import RaceSelection from "@/components/wizard/RaceSelection";
import AttributeSelection from "@/components/wizard/AttributeSelection";
import RoleSelection from "@/components/wizard/RoleSelection";
import OriginSelection from "@/components/wizard/OriginSelection";
import DeitySelection from "@/components/wizard/DeitySelection";
import SummarySelection from "@/components/wizard/SummarySelection";
import WizardHub from "@/components/wizard/WizardHub";

export default function WizardPage() {
  const {
    step,
    setStep,
    resetWizard,
    selectedRace,
    selectedOrigin,
    clearActiveCharacter,
    editingCharacterId,
  } = useCharacterStore();
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Decide if we should show the hub initially
  const [showHub, setShowHub] = useState(!editingCharacterId);

  // URL Sync Logic
  const stepsMap = {
    1: "race",
    2: "attributes",
    3: "class",
    4: "origin",
    5: "deity",
    6: "summary",
  };
  const stepsRevMap = {
    race: 1,
    attributes: 2,
    class: 3,
    origin: 4,
    deity: 5,
    summary: 6,
  };

  useEffect(() => {
    // Sync URL on mount or back button
    const params = new URLSearchParams(window.location.search);
    const stepParam = params.get("step");
    if (stepParam === "0") {
      setShowHub(true);
    } else if (stepParam && stepParam in stepsRevMap) {
      const stepNum = stepsRevMap[stepParam as keyof typeof stepsRevMap];
      if (stepNum !== step) {
        setStep(stepNum);
      }
      if (stepNum > 0) setShowHub(false);
    }
  }, []);

  useEffect(() => {
    // Update URL when step changes
    const params = new URLSearchParams(window.location.search);
    const stepName = stepsMap[step as keyof typeof stepsMap];

    if (showHub) {
      if (params.get("step") !== "0") {
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.set("step", "0");
        window.history.pushState({}, "", newUrl);
      }
    } else if (stepName && params.get("step") !== stepName) {
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.set("step", stepName);
      window.history.pushState({}, "", newUrl);
    }
  }, [step, showHub]);

  // Scroll to top on step change
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step, showHub]);

  const handleReset = () => {
    clearActiveCharacter();
    resetWizard();
    setShowResetConfirm(false);
    setShowHub(false); // Go to step 1
    // URL update handled by effect
  };

  const handleNewFromHub = () => {
    clearActiveCharacter();
    resetWizard();
    setShowHub(false);
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      setShowHub(true);
    }
  };

  // Listen to popstate for browser back button
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const stepParam = params.get("step");
      if (stepParam === "0") {
        setShowHub(true);
      } else if (stepParam && stepParam in stepsRevMap) {
        setStep(stepsRevMap[stepParam as keyof typeof stepsRevMap]);
        setShowHub(false);
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  return (
    <div className="bg-neutral-950 text-neutral-200">
      {/* Navigation Controls - Hidden if showing Hub */
      /* Note: We keep the floating back button as an extra convenience/safety, 
         but the UI inside steps will now have their own back buttons too. */}
      {!showHub && (
        <div className="fixed top-4 left-4 right-4 z-[60] flex justify-between items-center pointer-events-none">
          <div className="pointer-events-auto">
            <button
              onClick={handleBack}
              className="p-3 bg-black/60 backdrop-blur-md border border-white/10 text-white rounded-full hover:bg-medieval-gold hover:text-black transition-all shadow-xl"
            >
              <ArrowLeft size={20} />
            </button>
          </div>
          <div className="pointer-events-auto">
            <button
              onClick={() => setShowResetConfirm(true)}
              className="p-3 bg-red-900/20 backdrop-blur-md border border-red-900/50 text-red-500 rounded-full hover:bg-red-900/40 transition-all shadow-xl"
              title="Resetar"
            >
              <RotateCcw size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showResetConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-stone-900 border border-stone-700 rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4"
            >
              <div className="flex flex-col items-center text-center gap-3">
                <div className="p-3 bg-amber-500/10 rounded-full text-amber-500">
                  <AlertTriangle size={32} />
                </div>
                <h3 className="text-xl font-cinzel text-amber-100">
                  Reiniciar Jornada?
                </h3>
                <p className="text-sm text-neutral-400">
                  Tem certeza que deseja apagar todo o progresso atual e começar
                  uma nova ficha do zero?
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="flex items-center justify-center gap-2 py-3 rounded-xl border border-stone-700 hover:bg-stone-800 text-stone-300 font-bold text-sm"
                >
                  <X size={16} /> Cancelar
                </button>
                <button
                  onClick={handleReset}
                  className="flex items-center justify-center gap-2 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm"
                >
                  <RotateCcw size={16} /> Apagar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="mx-auto w-full max-w-7xl relative">
        <AnimatePresence mode="wait">
          {showHub ? (
            <motion.div
              key="hub"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.3 }}
              className="flex items-center justify-center"
            >
              <WizardHub
                onContinue={() => setShowHub(false)}
                onNew={handleNewFromHub}
              />
            </motion.div>
          ) : (
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="min-h-screen"
            >
              <div className="w-full">
                {step === 1 && <RaceSelection />}
                {step === 2 && <AttributeSelection />}
                {step === 3 && <RoleSelection />}
                {step === 4 && <OriginSelection />}
                {step === 5 && <DeitySelection />}
                {step === 6 && <SummarySelection />}
              </div>

              {/* Placeholder for future steps */}
              {step > 6 && (
                <div className="p-8 text-center pt-32">
                  <h2 className="text-2xl font-cinzel text-amber-500 mb-4">
                    Em Breve
                  </h2>
                  <p className="text-neutral-400">
                    A jornada continua em breve...
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
