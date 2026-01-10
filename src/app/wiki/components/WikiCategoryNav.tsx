import React, { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { CATEGORIES } from "../constants";
import { Category } from "../types";
import { cn } from "@/lib/utils";

interface WikiCategoryNavProps {
  activeCategory: Category;
  setActiveCategory: (cat: Category) => void;
  isEmbedded?: boolean;
}

export function WikiCategoryNav({
  activeCategory,
  setActiveCategory,
  isEmbedded = false,
}: WikiCategoryNavProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to active item
  useEffect(() => {
    if (containerRef.current) {
      const activeBtn = containerRef.current.querySelector(
        `button[data-active="true"]`
      );
      if (activeBtn) {
        activeBtn.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    }
  }, [activeCategory]);

  return (
    <div
      className={cn(
        "sticky z-20 bg-neutral-900/95 backdrop-blur border-b border-amber-900/10 shadow-lg",
        isEmbedded ? "top-0" : "md:hidden top-[61px]"
      )}
    >
      <div
        ref={containerRef}
        className="flex overflow-x-auto gap-2 py-2 px-3 no-scrollbar items-center"
      >
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            data-active={activeCategory === cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${
              activeCategory === cat.id
                ? "bg-amber-500/10 border-amber-500/50 text-amber-400"
                : "bg-neutral-800/50 border-neutral-800 text-neutral-500 hover:text-neutral-300"
            }`}
          >
            <cat.icon size={16} />
            <span className="font-cinzel text-xs font-bold whitespace-nowrap">
              {cat.label}
            </span>
            {activeCategory === cat.id && (
              <motion.div
                layoutId="mobile-cat-pill"
                className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_5px_rgba(245,158,11,0.5)]"
              />
            )}
          </button>
        ))}
      </div>
      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
