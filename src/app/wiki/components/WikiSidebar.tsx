import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { CATEGORIES } from "../constants";
import { Category } from "../types";

interface WikiSidebarProps {
  activeCategory: Category;
  setActiveCategory: (cat: Category) => void;
}

export function WikiSidebar({
  activeCategory,
  setActiveCategory,
}: WikiSidebarProps) {
  return (
    <nav className="hidden md:flex w-64 lg:w-72 bg-neutral-900/50 backdrop-blur-xl border-r border-amber-900/20 flex-col z-20 h-screen sticky top-0">
      <div className="p-6">
        {/* <Link href="/" className="flex items-center gap-3 group mb-8">
          <div className="p-2 bg-amber-500/10 rounded-lg border border-amber-500/20 group-hover:border-amber-500/50 transition-all">
            <ArrowLeft className="w-5 h-5 text-amber-500" />
          </div>
          <span className="font-cinzel text-lg text-amber-100 group-hover:text-amber-400 transition-colors">
            Voltar ao Início
          </span>
        </Link> */}

        <h1 className="text-3xl font-cinzel text-amber-500 mb-2 drop-shadow-[0_0_15px_rgba(251,191,36,0.2)]">
          Compêndio
        </h1>
        <p className="text-xs text-neutral-500 uppercase tracking-widest font-bold">
          Enciclopédia de Arton
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-1 custom-scrollbar">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group ${
              activeCategory === cat.id
                ? "bg-amber-500/10 border border-amber-500/30 text-amber-400"
                : "text-neutral-500 hover:text-neutral-200 hover:bg-white/5"
            }`}
          >
            <div
              className={`p-2 rounded-lg ${
                activeCategory === cat.id
                  ? "bg-amber-500/20 text-amber-400"
                  : "bg-neutral-800 text-neutral-600 group-hover:text-neutral-400"
              }`}
            >
              <cat.icon size={20} />
            </div>
            <span className={`font-cinzel text-sm font-bold tracking-wide`}>
              {cat.label}
            </span>
            {activeCategory === cat.id && (
              <motion.div
                layoutId="active-pill"
                className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"
              />
            )}
          </button>
        ))}
      </div>

      <div className="p-6 border-t border-amber-900/10 bg-black/20">
        <div className="flex items-center gap-2 text-[10px] text-neutral-600 uppercase tracking-widest font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Sistema Sincronizado
        </div>
      </div>
    </nav>
  );
}
