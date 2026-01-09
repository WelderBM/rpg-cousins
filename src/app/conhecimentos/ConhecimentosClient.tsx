"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Scroll, BookOpen, Shield, Sparkles } from "lucide-react";
import { WikiContent } from "../wiki/page";
import GrimorioClient from "../grimorio/GrimorioClient";
import { Spell } from "@/interfaces/Spells";
import { cn } from "@/lib/utils";

type TabType = "compendio" | "grimorio";

export default function ConhecimentosClient({
  initialSpells,
}: {
  initialSpells: Spell[];
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeTabParam = searchParams.get("tab") as TabType;
  const [activeTab, setActiveTab] = useState<TabType>(
    activeTabParam || "compendio"
  );

  useEffect(() => {
    if (activeTabParam && activeTabParam !== activeTab) {
      setActiveTab(activeTabParam);
    }
  }, [activeTabParam]);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.replace(`/conhecimentos?${params.toString()}`);
  };

  const tabs = [
    {
      id: "compendio" as TabType,
      label: "Compêndio",
      icon: Scroll,
      description: "Enciclopédia Geral",
    },
    {
      id: "grimorio" as TabType,
      label: "Grimório",
      icon: BookOpen,
      description: "Círculos de Magia",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-medieval-stone/30">
      {/* Tabs Header */}
      <div className="sticky top-0 z-[60] bg-medieval-stone/95 backdrop-blur-xl border-b border-medieval-iron/30 px-4 pt-4 shadow-xl">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-3 bg-medieval-gold/10 rounded-2xl border border-medieval-gold/20">
              <Scroll className="w-6 h-6 text-medieval-gold" />
            </div>
            <div>
              <h1 className="text-2xl font-serif font-bold text-parchment-light tracking-wide">
                <span className="text-medieval-gold">Conhecer</span>
              </h1>
              <p className="text-[10px] text-parchment-dark uppercase tracking-[0.2em] font-bold opacity-60">
                Saberes e Mistérios de Arton
              </p>
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-0">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;

              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={cn(
                    "group relative flex items-center gap-3 px-6 py-4 transition-all duration-300 rounded-t-2xl border-t border-x",
                    isActive
                      ? "bg-medieval-gold/10 border-medieval-gold/30 text-medieval-gold shadow-[0_-4px_20px_rgba(245,158,11,0.1)]"
                      : "bg-transparent border-transparent text-parchment-dark hover:text-parchment-light"
                  )}
                >
                  <Icon
                    className={cn(
                      "w-5 h-5 transition-transform duration-300",
                      isActive && "scale-110"
                    )}
                  />
                  <div className="text-left">
                    <span
                      className={cn(
                        "block text-sm font-serif font-bold tracking-wide leading-none mb-0.5",
                        isActive
                          ? "text-medieval-gold"
                          : "text-parchment-DEFAULT"
                      )}
                    >
                      {tab.label}
                    </span>
                    <span className="block text-[9px] uppercase tracking-tighter opacity-50 font-bold">
                      {tab.description}
                    </span>
                  </div>

                  {isActive && (
                    <motion.div
                      layoutId="active-tab-indicator-conhecimentos"
                      className="absolute bottom-0 left-0 right-0 h-1 bg-medieval-gold rounded-t-full shadow-[0_0_15px_rgba(245,158,11,0.5)]"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            {activeTab === "compendio" && (
              <div className="h-full relative [&_.sticky]:top-[128px] [&_.h-screen]:h-[calc(100vh-128px)]">
                <WikiContent isEmbedded={true} />
              </div>
            )}
            {activeTab === "grimorio" && (
              <div className="container mx-auto max-w-7xl p-6">
                <div className="mb-8 border-b border-medieval-iron/30 pb-4">
                  <h1 className="text-4xl md:text-5xl font-serif font-bold text-medieval-gold drop-shadow-lg mb-2">
                    Grimório Arcano
                  </h1>
                  <p className="text-parchment-DEFAULT text-lg">
                    Consulte o acervo completo de magias conhecidas em Arton.
                  </p>
                </div>
                <GrimorioClient initialSpells={initialSpells} />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
