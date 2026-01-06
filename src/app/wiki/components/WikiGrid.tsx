import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  Info,
  CheckCircle2,
  Copy,
  ChevronRight,
  Search,
} from "lucide-react";
import { ItemBase } from "../types";
import { CATEGORIES } from "../constants";

interface WikiGridProps {
  isLoading: boolean;
  filteredItems: ItemBase[];
  displayLimit: number;
  setDisplayLimit: React.Dispatch<React.SetStateAction<number>>;
  setSelectedItem: (item: ItemBase) => void;
  copiedId: string | null;
  handleCopyLink: (item: ItemBase) => void;
}

export function WikiGrid({
  isLoading,
  filteredItems,
  displayLimit,
  setDisplayLimit,
  setSelectedItem,
  copiedId,
  handleCopyLink,
}: WikiGridProps) {
  const itemsToShow = filteredItems.slice(0, displayLimit);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-amber-900/30 border-t-amber-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Zap size={20} className="text-amber-500 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:px-16 custom-scrollbar pb-32">
      <div className="w-full mx-auto">
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 gap-4"
        >
          <AnimatePresence mode="popLayout">
            {itemsToShow.map((item, idx) => {
              const CategoryIcon =
                CATEGORIES.find((c) => c.id === item.category)?.icon || Info;
              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: Math.min(idx * 0.02, 0.3) }}
                  onClick={() => setSelectedItem(item)}
                  className="group relative bg-neutral-900/40 border border-neutral-800 rounded-2xl p-5 cursor-pointer hover:bg-neutral-800/60 hover:border-amber-700/50 hover:shadow-2xl hover:shadow-amber-500/5 transition-all active:scale-[0.98]"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2 rounded-lg bg-white/5 text-neutral-400 group-hover:text-amber-500 transition-colors">
                      <CategoryIcon size={18} />
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyLink(item);
                      }}
                      className="p-2 text-neutral-600 hover:text-amber-400 hover:bg-white/5 rounded-lg transition-colors z-10"
                    >
                      {copiedId === item.id ? (
                        <CheckCircle2 size={16} className="text-emerald-500" />
                      ) : (
                        <Copy size={16} />
                      )}
                    </button>
                  </div>

                  <h3 className="font-cinzel text-lg text-neutral-200 group-hover:text-amber-100 mb-1 line-clamp-1">
                    {item.name}
                  </h3>
                  <p className="text-[10px] text-amber-500/70 font-bold uppercase tracking-widest mb-3">
                    {item.type}
                  </p>

                  <p className="text-xs text-neutral-500 line-clamp-2 italic leading-relaxed">
                    {item.description ||
                      "Nenhuma descrição detalhada disponível."}
                  </p>

                  <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                    <ChevronRight size={18} className="text-amber-500" />
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>

        {filteredItems.length > displayLimit && (
          <div className="mt-12 flex justify-center">
            <button
              onClick={() => setDisplayLimit((prev) => prev + 24)}
              className="px-8 py-3 bg-neutral-900 border border-amber-900/30 text-amber-500 font-bold font-cinzel rounded-xl hover:bg-amber-500 hover:text-black transition-all shadow-xl shadow-amber-900/5 active:scale-95"
            >
              Carregar Mais Sabedoria...
            </button>
          </div>
        )}

        {filteredItems.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="p-4 bg-neutral-900 rounded-full mb-4 border border-neutral-800">
              <Search size={48} className="text-neutral-700" />
            </div>
            <h3 className="text-xl font-cinzel text-neutral-400">
              Nenhum resultado encontrado
            </h3>
            <p className="text-sm text-neutral-600 mt-2">
              Tente ajustar sua busca ou mudar de categoria.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
