import React from "react";
import { motion } from "framer-motion";
import { X, HelpCircle } from "lucide-react";

export const SystemExplanationModal = React.memo(
  ({ onClose }: { onClose: () => void }) => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-stone-900 border-2 border-amber-700/50 rounded-2xl w-full max-w-2xl overflow-hidden shadow-[0_0_50px_rgba(251,191,36,0.15)]"
      >
        {/* Header */}
        <div className="p-6 border-b border-amber-900/30 flex items-center justify-between bg-gradient-to-r from-amber-900/20 to-transparent">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 rounded-lg">
              <HelpCircle className="w-6 h-6 text-amber-500" />
            </div>
            <h2 className="text-2xl font-cinzel text-amber-100 italic">
              Como distribuir seus pontos?
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors group"
          >
            <X className="w-6 h-6 text-neutral-500 group-hover:text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {/* Atributo Base */}
          <section>
            <h3 className="text-amber-500 font-cinzel text-lg mb-3">
              1. O Valor Base
            </h3>
            <p className="text-neutral-300 leading-relaxed italic">
              Nesse sistema Artoniano, você distribui seus atributos diretamente
              como modificadores. Todos os atributos começam em{" "}
              <span className="text-white font-bold">0</span>.
            </p>
          </section>

          {/* Tabela de Custos */}
          <section>
            <h3 className="text-amber-500 font-cinzel text-lg mb-4">
              2. Tabela de Custos
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { val: "-1", cost: "Ganha +2pts" },
                { val: "0", cost: "Custo 0" },
                { val: "+1", cost: "Custo 1" },
                { val: "+2", cost: "Custo 2" },
                { val: "+3", cost: "Custo 4" },
                { val: "+4", cost: "Custo 7" },
              ].map((item) => (
                <div
                  key={item.val}
                  className="bg-black/40 border border-amber-900/30 rounded-xl p-3 text-center"
                >
                  <div className="text-2xl font-bold font-cinzel text-white">
                    {item.val}
                  </div>
                  <div className="text-[10px] text-amber-400/70 uppercase tracking-widest mt-1">
                    {item.cost}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-neutral-500 mt-4 italic">
              * Reduzir um atributo para -1 libera 2 pontos extras para gastar
              em outro lugar.
            </p>
          </section>

          {/* Bônus de Raça */}
          <section className="bg-amber-900/10 border border-amber-500/20 rounded-xl p-4">
            <h3 className="text-amber-200 font-cinzel mb-2">
              3. Bônus de Raça
            </h3>
            <p className="text-sm text-neutral-400">
              Os bônus de sua raça são aplicados{" "}
              <span className="text-amber-400 font-bold underline">após</span> a
              compra manual. Eles não aumentam o custo de compra dos atributos.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="p-6 bg-black/40 border-t border-amber-900/30 text-center">
          <button
            onClick={onClose}
            className="px-8 py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl transition-all shadow-xl shadow-amber-900/20 active:scale-95"
          >
            Entendido, Mestre!
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
);
