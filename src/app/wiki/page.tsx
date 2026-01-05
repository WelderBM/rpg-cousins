"use client";

import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Book,
  Shield,
  Zap,
  Users,
  X,
  ChevronRight,
  Info,
  Copy,
  CheckCircle2,
  Filter,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import {
  getAllSpells,
  getAllEquipments,
  getAllRaces,
  getAllPowers,
} from "@/lib/localData";
import { Spell } from "@/interfaces/Spells";
import Equipment from "@/interfaces/Equipment";
import Race from "@/interfaces/Race";
import { GeneralPower } from "@/interfaces/Poderes";

// ============================================
// TYPES
// ============================================

type Category = "magias" | "equipamentos" | "poderes" | "racas";

interface ItemBase {
  id: string;
  name: string;
  category: Category;
  type?: string;
  description?: string;
  raw: any;
}

// ============================================
// COMPONENTS
// ============================================

const CATEGORIES = [
  {
    id: "magias",
    label: "Magias",
    icon: Zap,
    color: "text-blue-400",
    bg: "bg-blue-400/10",
  },
  {
    id: "equipamentos",
    label: "Equipamentos",
    icon: Shield,
    color: "text-amber-400",
    bg: "bg-amber-400/10",
  },
  {
    id: "poderes",
    label: "Poderes",
    icon: Book,
    color: "text-purple-400",
    bg: "bg-purple-400/10",
  },
  {
    id: "racas",
    label: "Raças",
    icon: Users,
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
  },
];

const ITEMS_PER_PAGE = 24;

export default function WikiPage() {
  const [activeCategory, setActiveCategory] = useState<Category>("magias");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<ItemBase | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [displayLimit, setDisplayLimit] = useState(ITEMS_PER_PAGE);

  // Reset limit when category or search changes
  useEffect(() => {
    setDisplayLimit(ITEMS_PER_PAGE);
  }, [activeCategory, searchQuery]);

  // Data Loading
  const data = useMemo(() => {
    const magias = getAllSpells().map((s) => ({
      id: `spell-${s.nome}`,
      name: s.nome,
      category: "magias" as Category,
      type: `${s.escola} • ${s.circulo}º Círculo`,
      description: s.execucao + " | " + s.alcance,
      raw: s,
    }));

    const equipamentos = getAllEquipments().map((e) => ({
      id: `equip-${e.nome}`,
      name: e.nome,
      category: "equipamentos" as Category,
      type: e.group,
      description: `T$ ${e.preco} • ${e.spaces} esp.`,
      raw: e,
    }));

    const racas = getAllRaces().map((r) => {
      const attrs = r.attributes.attrs
        .map((a) => `${a.mod > 0 ? "+" : ""}${a.mod} ${a.attr}`)
        .join(", ");
      return {
        id: `race-${r.name}`,
        name: r.name,
        category: "racas" as Category,
        type: "Raça Jogável",
        description: `Bônus: ${attrs}`,
        raw: r,
      };
    });

    const poderes = getAllPowers().map((p) => ({
      id: `power-${p.name}`,
      name: p.name,
      category: "poderes" as Category,
      type: p.type,
      description: p.description,
      raw: p,
    }));

    return { magias, equipamentos, racas, poderes };
  }, []);

  // Filtering
  const filteredItems = useMemo(() => {
    const items = data[activeCategory];
    if (!searchQuery) return items;

    const query = searchQuery.toLowerCase();
    return items.filter(
      (i) =>
        i.name.toLowerCase().includes(query) ||
        i.type?.toLowerCase().includes(query) ||
        (i.description && i.description.toLowerCase().includes(query))
    );
  }, [data, activeCategory, searchQuery]);

  // Handlers
  const handleCopyLink = (item: ItemBase) => {
    const url = `${window.location.origin}/wiki?cat=${item.category}&id=${item.id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-stone-950 text-neutral-200 font-sans selection:bg-amber-500/30">
      {/* --- Sidebar (Desktop) / Topbar (Mobile) --- */}
      <div className="flex flex-col md:flex-row h-screen overflow-hidden">
        {/* Navigation Sidebar */}
        <nav className="w-full md:w-64 lg:w-72 bg-neutral-900/50 backdrop-blur-xl border-b md:border-b-0 md:border-r border-amber-900/20 flex flex-col z-20">
          <div className="p-6">
            <Link href="/" className="flex items-center gap-3 group mb-8">
              <div className="p-2 bg-amber-500/10 rounded-lg border border-amber-500/20 group-hover:border-amber-500/50 transition-all">
                <ArrowLeft className="w-5 h-5 text-amber-500" />
              </div>
              <span className="font-cinzel text-lg text-amber-100 group-hover:text-amber-400 transition-colors">
                Voltar ao Início
              </span>
            </Link>

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
                onClick={() => setActiveCategory(cat.id as Category)}
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

        {/* --- Main Content Area --- */}
        <main className="flex-1 flex flex-col overflow-hidden relative">
          {/* Header & Search */}
          <header className="p-4 md:p-8 bg-gradient-to-b from-stone-900/50 to-transparent sticky top-0 z-10 backdrop-blur-sm">
            <div className="max-w-5xl mx-auto flex flex-col gap-6">
              <div className="relative group">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-amber-500 transition-colors"
                  size={20}
                />
                <input
                  type="text"
                  placeholder={`Buscar em ${
                    CATEGORIES.find((c) => c.id === activeCategory)?.label
                  }...`}
                  className="w-full bg-neutral-900/80 border-2 border-neutral-800 rounded-2xl py-4 pl-12 pr-4 text-neutral-100 focus:outline-none focus:border-amber-500/50 focus:bg-neutral-900 transition-all shadow-xl placeholder:text-neutral-600"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-full text-neutral-500"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              <div className="flex items-center justify-between text-xs text-neutral-500">
                <div className="flex gap-4">
                  <span>
                    Encontrados:{" "}
                    <b className="text-amber-500">{filteredItems.length}</b>
                  </span>
                  <span className="hidden sm:inline">|</span>
                  <span className="hidden sm:inline">
                    Fonte:{" "}
                    <b className="text-neutral-400 italic">Tormenta20 JDA</b>
                  </span>
                </div>
                <div className="flex items-center gap-2 hover:text-amber-400 transition-colors cursor-pointer">
                  <Filter size={14} />
                  Filtros Avançados
                </div>
              </div>
            </div>
          </header>

          {/* Grid Layout */}
          <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar pb-32">
            <div className="max-w-5xl mx-auto">
              <motion.div
                layout
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                <AnimatePresence mode="popLayout">
                  {filteredItems.slice(0, displayLimit).map((item, idx) => {
                    const CategoryIcon =
                      CATEGORIES.find((c) => c.id === item.category)?.icon ||
                      Info;
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
                          <div
                            className={`p-2 rounded-lg bg-white/5 text-neutral-400 group-hover:text-amber-500 transition-colors`}
                          >
                            <CategoryIcon size={18} />
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyLink(item);
                            }}
                            className="p-2 text-neutral-600 hover:text-amber-400 hover:bg-white/5 rounded-lg transition-colors"
                          >
                            {copiedId === item.id ? (
                              <CheckCircle2
                                size={16}
                                className="text-emerald-500"
                              />
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
                    onClick={() =>
                      setDisplayLimit((prev) => prev + ITEMS_PER_PAGE)
                    }
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

          {/* Lateral Drawer / Detail View */}
          <AnimatePresence>
            {selectedItem && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setSelectedItem(null)}
                  className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
                />
                <motion.div
                  initial={{ x: "100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "100%" }}
                  transition={{ type: "spring", damping: 25, stiffness: 200 }}
                  className="fixed right-0 top-0 bottom-0 w-full max-w-xl bg-stone-900 border-l-2 border-amber-700/30 z-[101] flex flex-col shadow-[-20px_0_50px_rgba(0,0,0,0.5)]"
                >
                  {/* Drawer Header */}
                  <div className="p-6 border-b border-white/5 flex items-center justify-between bg-black/20">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-amber-500/20 rounded-xl border border-amber-500/30">
                        {React.createElement(
                          CATEGORIES.find((c) => c.id === selectedItem.category)
                            ?.icon || Info,
                          { className: "text-amber-500" }
                        )}
                      </div>
                      <div>
                        <h2 className="text-2xl font-cinzel text-amber-100">
                          {selectedItem.name}
                        </h2>
                        <span className="text-xs text-amber-500 uppercase tracking-widest font-bold">
                          {selectedItem.type}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedItem(null)}
                      className="p-2 hover:bg-white/5 rounded-lg text-neutral-500 hover:text-white transition-colors"
                    >
                      <X size={24} />
                    </button>
                  </div>

                  {/* Drawer Content */}
                  <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    <div className="space-y-8">
                      {/* Description Rendering based on Category */}
                      {selectedItem.category === "magias" && (
                        <div className="space-y-6">
                          <div className="grid grid-cols-2 gap-4">
                            {[
                              {
                                label: "Execução",
                                value: selectedItem.raw.execucao,
                              },
                              {
                                label: "Alcance",
                                value: selectedItem.raw.alcance,
                              },
                              {
                                label: "Duração",
                                value: selectedItem.raw.duracao,
                              },
                              {
                                label: "Alvo",
                                value:
                                  selectedItem.raw.alvo ||
                                  selectedItem.raw.area,
                              },
                            ].map((at) => (
                              <div
                                key={at.label}
                                className="p-3 bg-black/30 rounded-lg border border-white/5"
                              >
                                <div className="text-[10px] text-neutral-500 uppercase font-black">
                                  {at.label}
                                </div>
                                <div className="text-sm text-neutral-200 mt-1">
                                  {at.value || "—"}
                                </div>
                              </div>
                            ))}
                          </div>

                          <section>
                            <h4 className="text-amber-500 font-cinzel text-lg mb-3">
                              Efeito
                            </h4>
                            <p className="text-neutral-300 leading-relaxed italic whitespace-pre-wrap">
                              {selectedItem.raw.descricao}
                            </p>
                          </section>

                          {selectedItem.raw.aprimoramentos && (
                            <section>
                              <h4 className="text-amber-500 font-cinzel text-lg mb-3">
                                Aprimoramentos
                              </h4>
                              <div className="space-y-2">
                                {selectedItem.raw.aprimoramentos.map(
                                  (ap: any, i: number) => (
                                    <div
                                      key={i}
                                      className="p-4 bg-amber-900/10 border border-amber-900/30 rounded-xl text-sm italic text-neutral-400"
                                    >
                                      {ap.text}
                                    </div>
                                  )
                                )}
                              </div>
                            </section>
                          )}
                        </div>
                      )}

                      {selectedItem.category === "equipamentos" && (
                        <div className="space-y-6">
                          <div className="grid grid-cols-2 gap-4">
                            {[
                              {
                                label: "Preço",
                                value: `T$ ${selectedItem.raw.preco}`,
                              },
                              {
                                label: "Espaços",
                                value: selectedItem.raw.spaces,
                              },
                              { label: "Grupo", value: selectedItem.raw.group },
                              { label: "Dano", value: selectedItem.raw.damage },
                            ].map((at) => (
                              <div
                                key={at.label}
                                className="p-3 bg-black/30 rounded-lg border border-white/5"
                              >
                                <div className="text-[10px] text-neutral-500 uppercase font-black">
                                  {at.label}
                                </div>
                                <div className="text-sm text-neutral-200 mt-1">
                                  {at.value || "—"}
                                </div>
                              </div>
                            ))}
                          </div>
                          <section>
                            <h4 className="text-amber-500 font-cinzel text-lg mb-3">
                              Descrição
                            </h4>
                            <p className="text-neutral-300 leading-relaxed italic">
                              {selectedItem.raw.description ||
                                "Item padrão do sistema Tormenta20."}
                            </p>
                          </section>
                        </div>
                      )}

                      {selectedItem.category === "racas" && (
                        <div className="space-y-6">
                          <section>
                            <h4 className="text-amber-500 font-cinzel text-lg mb-3">
                              Ficha da Raça
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="p-3 bg-black/30 rounded-lg border border-white/5">
                                <div className="text-[10px] text-neutral-500 uppercase font-black">
                                  Tamanho
                                </div>
                                <div className="text-sm text-neutral-200 mt-1">
                                  {selectedItem.raw.size?.name || "Médio"}
                                </div>
                              </div>
                              <div className="p-3 bg-black/30 rounded-lg border border-white/5">
                                <div className="text-[10px] text-neutral-500 uppercase font-black">
                                  Deslocamento
                                </div>
                                <div className="text-sm text-neutral-200 mt-1">
                                  {selectedItem.raw.getDisplacement?.(
                                    selectedItem.raw
                                  ) || 9}
                                  m
                                </div>
                              </div>
                            </div>
                          </section>

                          <section>
                            <h4 className="text-amber-500 font-cinzel text-lg mb-3">
                              Habilidades de Raça
                            </h4>
                            <div className="space-y-4">
                              {selectedItem.raw.abilities?.map(
                                (ab: any, i: number) => (
                                  <div
                                    key={i}
                                    className="p-4 bg-black/30 border border-white/5 rounded-xl"
                                  >
                                    <div className="text-amber-400 font-bold mb-1">
                                      {ab.name}
                                    </div>
                                    <p className="text-sm text-neutral-400 italic line-clamp-3 hover:line-clamp-none transition-all">
                                      {ab.description}
                                    </p>
                                  </div>
                                )
                              )}
                            </div>
                          </section>
                        </div>
                      )}

                      {selectedItem.category === "poderes" && (
                        <div className="space-y-6">
                          <section>
                            <h4 className="text-amber-500 font-cinzel text-lg mb-3">
                              Efeito
                            </h4>
                            <p className="text-neutral-300 leading-relaxed italic">
                              {selectedItem.raw.description}
                            </p>
                          </section>
                          {selectedItem.raw.requirements &&
                            selectedItem.raw.requirements.length > 0 && (
                              <section>
                                <h4 className="text-red-500/70 font-cinzel text-lg mb-3">
                                  Pré-requisitos
                                </h4>
                                <div className="space-y-3">
                                  {selectedItem.raw.requirements.map(
                                    (andGroup: any, i: number) => (
                                      <div
                                        key={i}
                                        className="flex flex-wrap gap-2 items-center"
                                      >
                                        {andGroup.map((req: any, j: number) => (
                                          <span
                                            key={j}
                                            className="px-3 py-1 bg-red-950/20 border border-red-900/30 text-red-400 text-xs rounded-full"
                                          >
                                            {req.description || req.name || req}
                                          </span>
                                        ))}
                                        {i <
                                          selectedItem.raw.requirements.length -
                                            1 && (
                                          <span className="text-[10px] text-neutral-600 font-black uppercase">
                                            e
                                          </span>
                                        )}
                                      </div>
                                    )
                                  )}
                                </div>
                              </section>
                            )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Drawer Footer */}
                  <div className="p-6 bg-black/40 border-t border-white/5 flex gap-4">
                    <button
                      onClick={() => handleCopyLink(selectedItem)}
                      className="flex-1 flex items-center justify-center gap-2 py-4 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold rounded-xl transition-all active:scale-95"
                    >
                      {copiedId === selectedItem.id ? (
                        <>
                          <CheckCircle2 size={20} /> Copiado!
                        </>
                      ) : (
                        <>
                          <Copy size={20} /> Copiar Link
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => setSelectedItem(null)}
                      className="flex-1 py-4 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl transition-all shadow-xl shadow-amber-900/20 active:scale-95"
                    >
                      Fechar
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Mobile Category Navigation (Floating at bottom) */}
          <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 bg-neutral-900/90 backdrop-blur-md border border-amber-900/30 rounded-2xl p-2 flex gap-1 shadow-2xl z-40">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id as Category)}
                className={`p-3 rounded-xl transition-all ${
                  activeCategory === cat.id
                    ? "bg-amber-500 text-black"
                    : "text-neutral-500"
                }`}
                title={cat.label}
              >
                <cat.icon size={20} />
              </button>
            ))}
          </div>
        </main>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(251, 191, 36, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(251, 191, 36, 0.2);
        }
        .font-cinzel {
          font-family: "Cinzel", serif;
        }
      `}</style>
    </div>
  );
}
