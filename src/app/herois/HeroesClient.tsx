"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { User, Users, Wand2, Shield } from "lucide-react";
import { useCharacterStore } from "@/store/useCharacterStore";
import MyCharacterClient from "../my-character/MyCharacterClient";
import CharacterSelectPage from "../characters/page";
import WizardPage from "../wizard/page";
import { cn } from "@/lib/utils";

type TabType = "meu-heroi" | "meus-herois" | "novo-heroi";

export default function HeroesClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeTabParam = searchParams.get("tab") as TabType;
  const [activeTab, setActiveTab] = useState<TabType>(
    activeTabParam || "meus-herois"
  );
  const { activeCharacter } = useCharacterStore();

  useEffect(() => {
    if (activeTabParam && activeTabParam !== activeTab) {
      setActiveTab(activeTabParam);
    }
  }, [activeTabParam]);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.replace(`/herois?${params.toString()}`);
  };

  const tabs = [
    {
      id: "meu-heroi" as TabType,
      label: "Ficha ativa",
      icon: User,
      color: "amber",
    },
    {
      id: "meus-herois" as TabType,
      label: "Coleção",
      icon: Users,
      color: "blue",
    },
    {
      id: "novo-heroi" as TabType,
      label: "Criar",
      icon: Wand2,
      color: "orange",
    },
  ];

  return (
    <div className="flex flex-col bg-medieval-stone/30">
      {/* Tabs Header */}
      <div className="sticky top-0 z-40 bg-medieval-stone/95 backdrop-blur-xl border-b border-medieval-iron/30 px-4 pt-4 shadow-xl">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-3 bg-medieval-gold/10 rounded-2xl border border-medieval-gold/20">
              <Shield className="w-6 h-6 text-medieval-gold" />
            </div>
            <div>
              <h1 className="text-2xl font-serif font-bold text-parchment-light tracking-wide">
                Salão de <span className="text-medieval-gold">Heróis</span>
              </h1>
              <p className="text-[10px] text-parchment-dark uppercase tracking-[0.2em] font-bold opacity-60">
                Gerencie sua jornada em Arton
              </p>
            </div>
          </div>

          <div className="flex gap-2 overflow-x-hidden no-scrollbar pb-0">
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
                  </div>

                  {isActive && (
                    <motion.div
                      layoutId="active-tab-indicator"
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
            {activeTab === "meu-heroi" && <MyCharacterClient />}
            {activeTab === "meus-herois" && <CharacterSelectPage />}
            {activeTab === "novo-heroi" && <WizardPage />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
