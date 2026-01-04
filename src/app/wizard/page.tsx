"use client";

import React from "react";
import { useCharacterStore } from "../../store/useCharacterStore";
import RaceSelection from "../../components/wizard/RaceSelection";
import AttributeSelection from "../../components/wizard/AttributeSelection";
import RoleSelection from "../../components/wizard/RoleSelection";
import HistorySelection from "../../components/wizard/HistorySelection";
import EquipmentSelection from "../../components/wizard/EquipmentSelection";

export default function WizardPage() {
  const step = useCharacterStore((state) => state.step);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 pb-20">
      {/* Mobile-first container */}
      <div className="max-w-md mx-auto min-h-screen bg-neutral-900/30 md:border-x md:border-neutral-800 shadow-2xl">
        {step === 1 && <RaceSelection />}
        {step === 2 && <AttributeSelection />}
        {step === 3 && <RoleSelection />}
        {step === 4 && <HistorySelection />}
        {step === 5 && <EquipmentSelection />}

        {/* Placeholder for future steps */}
        {step > 5 && (
          <div className="p-8 text-center">
            <h2 className="text-2xl font-cinzel text-amber-500 mb-4">
              Em Breve
            </h2>
            <p className="text-neutral-400">
              Próximos passos (Classe, Origem, etc.) serão implementados aqui.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
