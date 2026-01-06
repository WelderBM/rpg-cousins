"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCharacterStore } from "@/store/useCharacterStore";
import { RotateCcw, AlertTriangle, X, Check } from "lucide-react";

import RaceSelection from "@/components/wizard/RaceSelection";
import AttributeSelection from "@/components/wizard/AttributeSelection";
import RoleSelection from "@/components/wizard/RoleSelection";
import HistorySelection from "@/components/wizard/HistorySelection";
import SummarySelection from "@/components/wizard/SummarySelection";
import WizardHub from "@/components/wizard/WizardHub";

export default function WizardPage() {
  const { step, resetWizard, selectedRace, selectedOrigin } =
    useCharacterStore();
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Decide if we should show the hub initially
  // We default to showing Hub so user can choose "Continue" (if data exists) or "New".
  const [showHub, setShowHub] = useState(true);

  // Scroll to top on step change
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step, showHub]);

  const handleReset = () => {
    resetWizard();
    setShowResetConfirm(false);
    setShowHub(false); // Go to step 1
  };

  const handleNewFromHub = () => {
    resetWizard();
    setShowHub(false);
  };

  return (
    <div className="min-h-screen b'g-neutral-950 text-neutral-200">
      {/* Reset Controls - Show only if NOT in Hub and NOT in Step 1 */}
      {!showHub && step > 1 && (
        <div className="fixed top-4 right-4 z-50">
          <button
            onClick={() => setShowResetConfirm(true)}
            className="flex items-center gap-2 px-3 py-2 bg-red-900/20 hover:bg-red-900/40 border border-red-900/50 text-red-500 rounded-lg text-xs font-bold uppercase tracking-wider backdrop-blur-sm transition-all shadow-lg"
            title="Começar do zero"
          >
            <RotateCcw size={14} /> Resetar
          </button>
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
                  uma nova ficha do zero? Esta ação é irreversível.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="flex items-center justify-center gap-2 py-3 rounded-xl border border-stone-700 hover:bg-stone-800 text-stone-300 font-bold text-sm transition-colors"
                >
                  <X size={16} /> Cancelar
                </button>
                <button
                  onClick={handleReset}
                  className="flex items-center justify-center gap-2 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm shadow-lg shadow-red-900/20 transition-colors"
                >
                  <RotateCcw size={16} /> Apagar Tudo
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="mx-auto w-full max-w-7xl 2xl:max-w-[90vw] min-h-screen bg-stone-900/10 md:border-x md:border-stone-800/30 shadow-2xl relative">
        <AnimatePresence mode="wait">
          {showHub ? (
            <motion.div
              key="hub"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.3 }}
              className="min-h-screen flex items-center justify-center"
            >
              <WizardHub
                onContinue={() => setShowHub(false)}
                onNew={handleNewFromHub}
              />
            </motion.div>
          ) : (
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="min-h-screen"
            >
              {step === 1 && <RaceSelection />}
              {step === 2 && <AttributeSelection />}
              {step === 3 && <RoleSelection />}
              {step === 4 && <HistorySelection />}
              {step === 5 && <SummarySelection />}

              {/* Placeholder for future steps */}
              {step > 5 && (
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
