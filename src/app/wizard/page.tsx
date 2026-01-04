"use client";

import React from "react";
import dynamic from "next/dynamic";
import { useCharacterStore } from "../../store/useCharacterStore";

/**
 * OTIMIZAÇÃO DE PERFORMANCE CRÍTICA - LAZY LOADING
 *
 * Cada etapa do wizard é carregada sob demanda usando next/dynamic.
 * Isso significa que o navegador só processa o 'Passo 3' quando o usuário termina o 'Passo 2'.
 *
 * Benefícios:
 * - Carregamento inicial muito mais rápido
 * - Menos JavaScript para parsear inicialmente
 * - Menor uso de memória
 * - Melhor experiência em dispositivos móveis
 *
 * O loading: () => null evita flash de conteúdo durante carregamento
 */
const RaceSelection = dynamic(
  () => import("../../components/wizard/RaceSelection"),
  {
    loading: () => null,
    ssr: false, // Wizard é client-only, não precisa de SSR
  }
);

const AttributeSelection = dynamic(
  () => import("../../components/wizard/AttributeSelection"),
  {
    loading: () => null,
    ssr: false,
  }
);

const RoleSelection = dynamic(
  () => import("../../components/wizard/RoleSelection"),
  {
    loading: () => null,
    ssr: false,
  }
);

const HistorySelection = dynamic(
  () => import("../../components/wizard/HistorySelection"),
  {
    loading: () => null,
    ssr: false,
  }
);

const DeitySelection = dynamic(
  () => import("../../components/wizard/DeitySelection"),
  {
    loading: () => null,
    ssr: false,
  }
);

const EquipmentSelection = dynamic(
  () => import("../../components/wizard/EquipmentSelection"),
  {
    loading: () => null,
    ssr: false,
  }
);

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
