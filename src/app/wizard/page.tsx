"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCharacterStore } from "../../store/useCharacterStore";

import RaceSelection from "../../components/wizard/RaceSelection";
import AttributeSelection from "../../components/wizard/AttributeSelection";
import RoleSelection from "../../components/wizard/RoleSelection";
import HistorySelection from "../../components/wizard/HistorySelection";
import EquipmentSelection from "../../components/wizard/EquipmentSelection";
import SummarySelection from "../../components/wizard/SummarySelection";

export default function WizardPage() {
  const step = useCharacterStore((state) => state.step);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200">
      {/* Mobile-first container */}
      <div className="mx-auto min-h-screen bg-neutral-900/10 md:border-x md:border-neutral-800/50 shadow-2xl relative">
        <AnimatePresence mode="wait">
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
            {step === 5 && <EquipmentSelection />}
            {step === 6 && <SummarySelection />}

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
        </AnimatePresence>
      </div>
    </div>
  );
}
