import React from "react";
import Image from "next/image";
import { useCharacterStore } from "../../store/useCharacterStore";
import { Scroll, Plus, Trash2, User, Sword, ArrowRight } from "lucide-react";
import { Atributo } from "../../data/atributos";
import { motion } from "framer-motion";

interface WizardHubProps {
  onContinue: () => void;
  onNew: () => void;
}

import { formatAssetName, getRaceImageName } from "../../utils/assetUtils";
import { getAttributeTotal } from "../../utils/attributeUtils";

const WizardHub = ({ onContinue, onNew }: WizardHubProps) => {
  const {
    step,
    selectedRace,
    selectedClass,
    name,
    resetWizard,
    baseAttributes,
    flexibleAttributeChoices,
  } = useCharacterStore();

  const hasDraft = step > 1 || !!selectedRace;

  const getFinalAttr = (attr: Atributo) =>
    getAttributeTotal(
      attr,
      baseAttributes,
      selectedRace,
      flexibleAttributeChoices
    );

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] w-full p-6">
      <div className="text-center mb-10 space-y-3">
        <h1 className="text-2xl md:text-6xl font-black font-cinzel text-amber-500 drop-shadow-lg">
          Criação de Personagem
        </h1>
        <p className="text-neutral-400 max-w-lg mx-auto font-serif text-sm md:text-lg">
          Inicie uma nova lenda ou continue escrevendo o destino de heróis
          esquecidos.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        {/* Card: New Character */}
        <button
          onClick={onNew}
          className="group relative flex flex-col items-center justify-center p-6 md:p-12 bg-stone-900/50 border-2 border-dashed border-stone-800 rounded-3xl hover:border-amber-500/50 hover:bg-stone-900/80 transition-all duration-300"
        >
          <div className="mb-4 p-4 md:p-6 bg-stone-950 rounded-full group-hover:scale-110 transition-transform duration-300 border border-stone-800 group-hover:border-amber-500/30">
            <Plus className="w-8 h-8 md:w-12 md:h-12 text-stone-600 group-hover:text-amber-500 transition-colors" />
          </div>
          <h2 className="text-lg md:text-2xl font-cinzel text-stone-300 group-hover:text-amber-100 mb-2">
            Novo Herói
          </h2>
          <p className="text-sm text-stone-500 group-hover:text-stone-400 text-center">
            Forje um novo destino do zero
          </p>
        </button>

        {/* Card: Continue Draft */}
        {hasDraft ? (
          <div className="relative group bg-gradient-to-br from-stone-900 to-stone-950 border border-stone-800 rounded-3xl p-6 md:p-8 flex flex-col justify-between hover:border-amber-900/50 transition-all duration-300 shadow-xl overflow-hidden">
            {/* Background Preview */}
            {selectedRace && (
              <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity">
                <Image
                  src={`/assets/races/${getRaceImageName(
                    selectedRace.name
                  )}.webp`}
                  alt={selectedRace.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-stone-900/40" />
              </div>
            )}

            <div className="absolute top-4 right-4">
              <span className="px-3 py-1 bg-amber-900/20 text-amber-500 text-[10px] font-bold uppercase tracking-widest rounded-full border border-amber-900/30 backdrop-blur-sm">
                Rascunho
              </span>
            </div>

            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-stone-800 border-2 border-amber-900/40 flex items-center justify-center overflow-hidden shadow-2xl">
                  {selectedRace ? (
                    <Image
                      src={`/assets/races/${getRaceImageName(
                        selectedRace.name
                      )}.webp`}
                      alt={selectedRace.name}
                      width={80}
                      height={80}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <User className="w-8 h-8 md:w-10 md:h-10 text-stone-600" />
                  )}
                </div>
                <div>
                  <h3 className="text-xl md:text-2xl font-cinzel text-amber-100 font-bold drop-shadow-md">
                    {name || "Herói Sem Nome"}
                  </h3>
                  <div className="flex flex-wrap gap-2 mt-1">
                    <span className="text-xs text-stone-300 flex items-center gap-1 bg-stone-900/80 px-2 py-0.5 rounded border border-white/5">
                      {selectedRace?.name || "Raça?"}
                    </span>
                    <span className="text-xs text-stone-300 flex items-center gap-1 bg-stone-900/80 px-2 py-0.5 rounded border border-white/5">
                      {selectedClass?.name || "Classe?"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 py-3 md:py-4 border-y border-stone-800/50">
                <div className="text-center">
                  <span className="block text-lg md:text-xl font-bold text-amber-100/80">
                    {getFinalAttr(Atributo.FORCA)}
                  </span>
                  <span className="text-[9px] md:text-[10px] text-stone-500 uppercase font-black">
                    FOR
                  </span>
                </div>
                <div className="text-center">
                  <span className="block text-lg md:text-xl font-bold text-amber-100/80">
                    {getFinalAttr(Atributo.DESTREZA)}
                  </span>
                  <span className="text-[9px] md:text-[10px] text-stone-500 uppercase font-black">
                    DES
                  </span>
                </div>
                <div className="text-center">
                  <span className="block text-lg md:text-xl font-bold text-amber-100/80">
                    {getFinalAttr(Atributo.INTELIGENCIA)}
                  </span>
                  <span className="text-[9px] md:text-[10px] text-stone-500 uppercase font-black">
                    INT
                  </span>
                </div>
              </div>
            </div>

            <div className="relative z-10 flex gap-3 mt-6">
              <button
                onClick={() => {
                  if (
                    confirm("Tem certeza que deseja excluir este rascunho?")
                  ) {
                    resetWizard();
                  }
                }}
                className="p-3 bg-red-950/20 hover:bg-red-900/40 text-red-500/50 hover:text-red-500 rounded-xl transition-colors border border-transparent hover:border-red-900/30"
                title="Descartar Rascunho"
              >
                <Trash2 size={20} />
              </button>
              <button
                onClick={onContinue}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-bold py-3 rounded-xl transition-all shadow-lg shadow-amber-900/40 active:scale-[0.98]"
              >
                Continuar Jornada <ArrowRight size={18} />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 bg-stone-900/20 border border-stone-800 rounded-3xl opacity-50">
            <Scroll size={48} className="text-stone-700 mb-4" />
            <p className="text-stone-500 font-serif italic">
              Nenhum rascunho encontrado
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WizardHub;
