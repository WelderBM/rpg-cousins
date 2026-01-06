"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useCharacterStore } from "../../store/useCharacterStore";
import { CharacterService } from "../../lib/characterService";
import { auth } from "../../firebaseConfig";
import {
  Coins,
  Search,
  ShoppingBag,
  ArrowLeft,
  Filter,
  Package,
  Shield,
  Sword,
  FlaskConical,
  Shirt,
  Utensils,
  Scroll,
  X,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  ArrowDownUp,
  Check,
  User,
  LogOut,
  AlertCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { getEquipmentsByCategory } from "../../lib/localData";
import Equipment from "../../interfaces/Equipment";
import { getInitialMoney } from "../../functions/general";
import Bag, { calcBagSpaces } from "../../interfaces/Bag";
import { PurchaseModal } from "./PurchaseModal";

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const ITEMS_PER_PAGE = 12;

type SortOrder = "name-asc" | "name-desc" | "price-asc" | "price-desc";

const MarketPage = () => {
  const router = useRouter();
  const {
    activeCharacter,
    addToBag,
    removeFromBag,
    updateActiveCharacter,
    setActiveCharacter,
    clearActiveCharacter,
  } = useCharacterStore();
  const [loading, setLoading] = useState(true);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  // Advanced Filters
  const [sortOrder, setSortOrder] = useState<SortOrder>("name-asc");
  const [priceRange, setPriceRange] = useState<{ min: string; max: string }>({
    min: "",
    max: "",
  });
  const [selectedSubGroups, setSelectedSubGroups] = useState<string[]>([]);
  const [selectedDamageTypes, setSelectedDamageTypes] = useState<string[]>([]);

  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showMobileCart, setShowMobileCart] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);

  const [feedback, setFeedback] = useState<{
    msg: string;
    type: "success" | "error";
  } | null>(null);

  const [categories, setCategories] = useState<any>({});

  const [myCharacters, setMyCharacters] = useState<any[]>([]);
  const [loadingChars, setLoadingChars] = useState(false);

  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [purchasingItem, setPurchasingItem] = useState<Equipment | null>(null);

  // --- HOOKS REGISTRATION ---

  // Auth Check
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const checkAuth = async () => {
      const { onAuthStateChanged } = await import("firebase/auth");
      if (!auth) return;
      unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (!user) {
          router.push("/characters");
        } else {
          // User is logged in
          setLoading(false);
        }
      });
    };

    checkAuth();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [activeCharacter, router]);

  // Fetch Characters
  useEffect(() => {
    const fetchMyCharacters = async () => {
      if (!loading && auth?.currentUser) {
        // Fetch if empty to populate the selection list
        if (myCharacters.length === 0) {
          setLoadingChars(true);
          try {
            const chars = await CharacterService.getCharacters(
              auth.currentUser.uid
            );
            setMyCharacters(chars);
          } catch (error) {
            console.error("Failed to fetch characters", error);
          } finally {
            setLoadingChars(false);
          }
        }
      }
    };
    fetchMyCharacters();
  }, [loading, auth?.currentUser, myCharacters.length]);

  // Load Data
  useEffect(() => {
    const loadData = async () => {
      // Mock loading or real loading if async
      const cats = await getEquipmentsByCategory();
      setCategories(cats);
    };
    loadData();
  }, []);

  // --- MEMOS ---

  // Bag Items
  const bagItems = useMemo(() => {
    if (!activeCharacter?.bag) return [];
    if (activeCharacter.bag instanceof Bag) {
      return Object.values(activeCharacter.bag.getEquipments()).flat();
    }
    // Fallback if bag is atomic object (hydration issue or raw data)
    if ((activeCharacter.bag as any).equipments) {
      return Object.values((activeCharacter.bag as any).equipments).flat();
    }
    return [];
  }, [activeCharacter]);

  // All Items
  const allItems = useMemo(() => {
    if (!categories) return [];
    return Object.values(categories).flat() as Equipment[];
  }, [categories]);

  console.log(allItems);

  // Internal helper for dynamic filter calculation logic (used inside useMemo to avoid duplication or circular deps if we were to separate it too much, but essentially part of filtering)
  const relevantItemsForFilters = useMemo(() => {
    let relevantItems = allItems;
    if (activeTab !== "all") {
      // Filter base items by tab only to show available filters for this tab
      relevantItems = relevantItems.filter((item) => {
        const group = item.group;
        switch (activeTab) {
          case "weapons":
            return group === "Arma";
          case "defense":
            return group === "Armadura" || group === "Escudo";
          case "general":
            return group === "Item Geral";
          case "alchemy":
            return group === "Alquimía";
          case "clothing":
            return group === "Vestuário";
          case "food":
            return group === "Alimentação";
          default:
            return true;
        }
      });
    }
    return relevantItems;
  }, [allItems, activeTab]);

  // Derived State: Filtering & Sorting
  const displayedItems = useMemo(() => {
    let items = [...allItems];

    // 1. Tab Filter
    if (activeTab !== "all") {
      items = items.filter((item) => {
        const group = item.group;
        // Mapping tab IDs to groups
        switch (activeTab) {
          case "weapons":
            return group === "Arma";
          case "defense":
            return group === "Armadura" || group === "Escudo";
          case "general":
            return group === "Item Geral";
          case "alchemy":
            return group === "Alquimía";
          case "clothing":
            return group === "Vestuário";
          case "food":
            return group === "Alimentação";
          default:
            return true;
        }
      });
    }

    // 2. Search Filter
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      items = items.filter((item) => item.nome.toLowerCase().includes(lower));
    }

    // 3. Price Filter
    if (priceRange.min !== "") {
      items = items.filter(
        (item) => (item.preco || 0) >= Number(priceRange.min)
      );
    }
    if (priceRange.max !== "") {
      items = items.filter(
        (item) => (item.preco || 0) <= Number(priceRange.max)
      );
    }

    // 4. SubGroup Filter
    if (selectedSubGroups.length > 0) {
      items = items.filter((item) =>
        selectedSubGroups.includes(item.subGroup || item.group)
      );
    }

    // 5. Damage Type Filter
    if (selectedDamageTypes.length > 0) {
      items = items.filter(
        (item) => item.dano && selectedDamageTypes.includes(item.tipo || "")
      );
    }

    // 6. Sorting
    items.sort((a, b) => {
      switch (sortOrder) {
        case "name-asc":
          return a.nome.localeCompare(b.nome);
        case "name-desc":
          return b.nome.localeCompare(a.nome);
        case "price-asc":
          return (a.preco || 0) - (b.preco || 0);
        case "price-desc":
          return (b.preco || 0) - (a.preco || 0);
        default:
          return 0;
      }
    });

    return items;
  }, [
    allItems,
    activeTab,
    searchTerm,
    priceRange,
    selectedSubGroups,
    selectedDamageTypes,
    sortOrder,
  ]);

  const totalPages = Math.ceil(displayedItems.length / ITEMS_PER_PAGE);

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return displayedItems.slice(start, start + ITEMS_PER_PAGE);
  }, [displayedItems, currentPage]);

  const dynamicFilters = useMemo(() => {
    const subGroups = Array.from(
      new Set(relevantItemsForFilters.map((i) => i.subGroup || i.group))
    )
      .filter(Boolean)
      .sort();

    const damageTypes = Array.from(
      new Set(relevantItemsForFilters.filter((i) => i.dano).map((i) => i.tipo))
    ).filter(Boolean) as string[];

    return { subGroups, damageTypes };
  }, [relevantItemsForFilters]);

  // --- ACTIONS ---

  const handleTransaction = async (item: Equipment, type: "buy" | "sell") => {
    if (!auth || !auth.currentUser || !activeCharacter) return;

    if (type === "buy") {
      setPurchasingItem(item);
      setIsPurchaseModalOpen(true);
      return;
    }

    // Sell Logic (Existing, slightly modified to ensure safety)
    const price = item.preco || 0;
    let newMoney = activeCharacter.money + price;

    // Optimistic Update
    removeFromBag(item);
    updateActiveCharacter({ money: newMoney });
    setFeedback({ msg: `Vendeu ${item.nome}`, type: "success" });

    // Persist
    try {
      const currentBagEquips = activeCharacter.bag.getEquipments();
      const group = item.group || "Item Geral";
      const newEquips = JSON.parse(JSON.stringify(currentBagEquips));

      // Remove item logic (Mirroring store)
      if (newEquips[group]) {
        const idx = newEquips[group].findIndex(
          (i: any) => i.nome === item.nome
        );
        if (idx > -1) {
          const existing = newEquips[group][idx];
          if ((existing.quantidade || 1) > 1) {
            existing.quantidade = (existing.quantidade || 1) - 1;
          } else {
            newEquips[group].splice(idx, 1);
          }
        }
      }

      await CharacterService.updateCharacter(
        auth.currentUser.uid,
        activeCharacter.id!,
        {
          money: newMoney,
          bag: {
            equipments: newEquips,
            // We should ideally calculate spaces here too if the DB relies on it,
            // but the Bag class handles it on load.
            spaces: calcBagSpaces(newEquips),
            armorPenalty: 0, // Should calculate too but simplifying
          } as any,
        }
      );
    } catch (e) {
      console.error(e);
      setFeedback({ msg: "Erro ao salvar transação", type: "error" });
    }

    setTimeout(() => setFeedback(null), 2000);
  };

  const handleConfirmPurchase = async (charId: string, item: Equipment) => {
    if (!auth?.currentUser) return;

    const targetChar = myCharacters.find((c) => c.id === charId);
    if (!targetChar) return;

    const price = item.preco || 0;
    const newMoney = (targetChar.money || 0) - price;
    const itemSlots = item.spaces ?? 1;

    try {
      // Calculate new Bag
      let currentEquips: any = {};
      if (targetChar.bag instanceof Bag) {
        // Should not happen for myCharacters list items usually?
        currentEquips = targetChar.bag.getEquipments();
      } else if (targetChar.bag?.equipments) {
        currentEquips = targetChar.bag.equipments;
      } else {
        // Fallback if empty
        currentEquips = new Bag().getEquipments();
      }

      const newEquips = JSON.parse(JSON.stringify(currentEquips));
      const group = item.group || "Item Geral";

      if (!newEquips[group]) newEquips[group] = [];
      const existing = newEquips[group].find((i: any) => i.nome === item.nome);

      if (existing) {
        existing.quantidade = (existing.quantidade || 1) + 1;
      } else {
        newEquips[group].push({ ...item, quantidade: 1 });
      }

      // Update Firebase
      await CharacterService.updateCharacter(auth.currentUser.uid, charId, {
        money: newMoney,
        bag: {
          equipments: newEquips,
          spaces: calcBagSpaces(newEquips),
          armorPenalty: 0, // logic for penalty needed?
        } as any,
      });

      // Refresh MyCharacters list to reflect changes
      // We can optimistically update the list
      setMyCharacters((prev) =>
        prev.map((c) => {
          if (c.id === charId) {
            return {
              ...c,
              money: newMoney,
              bag: { ...c.bag, equipments: newEquips },
            };
          }
          return c;
        })
      );

      // If active character, update store
      if (activeCharacter?.id === charId) {
        updateActiveCharacter({
          money: newMoney,
        });
        addToBag(item);
      }

      setFeedback({
        msg: `Compra realizada para ${targetChar.name}!`,
        type: "success",
      });
    } catch (e) {
      console.error(e);
      setFeedback({ msg: "Erro ao processar compra", type: "error" });
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const toggleSubGroup = (group: string) => {
    setSelectedSubGroups((prev) =>
      prev.includes(group) ? prev.filter((g) => g !== group) : [...prev, group]
    );
    setCurrentPage(1);
  };

  const toggleDamageType = (type: string) => {
    setSelectedDamageTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
    setCurrentPage(1);
  };

  // --- RENDER HELPERS ---

  const FilterPanelContent = () => (
    <div className="space-y-6">
      {/* Search (Sidebar version) */}
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
          size={16}
        />
        <input
          type="text"
          placeholder="Buscar..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm focus:border-amber-500/50 outline-none text-neutral-300"
        />
      </div>

      {/* Sort */}
      <div>
        <h3 className="text-xs font-bold text-neutral-500 uppercase mb-3 flex items-center gap-2">
          <ArrowDownUp size={14} /> Ordenar
        </h3>
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value as SortOrder)}
          className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg p-2 text-sm text-neutral-300 outline-none focus:border-amber-500/50"
        >
          <option value="name-asc">Nome (A-Z)</option>
          <option value="name-desc">Nome (Z-A)</option>
          <option value="price-asc">Preço (Menor)</option>
          <option value="price-desc">Preço (Maior)</option>
        </select>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="text-xs font-bold text-neutral-500 uppercase mb-3 flex items-center gap-2">
          <Coins size={14} /> Preço (T$)
        </h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={priceRange.min}
            onChange={(e) =>
              setPriceRange({ ...priceRange, min: e.target.value })
            }
            className="w-1/2 bg-[#1a1a1a] border border-white/10 rounded-lg p-2 text-sm text-neutral-300 outline-none focus:border-amber-500/50"
          />
          <span className="text-neutral-600">-</span>
          <input
            type="number"
            placeholder="Max"
            value={priceRange.max}
            onChange={(e) =>
              setPriceRange({ ...priceRange, max: e.target.value })
            }
            className="w-1/2 bg-[#1a1a1a] border border-white/10 rounded-lg p-2 text-sm text-neutral-300 outline-none focus:border-amber-500/50"
          />
        </div>
      </div>

      {/* Dynamic Filters */}
      {dynamicFilters.subGroups.length > 0 && (
        <div>
          <h3 className="text-xs font-bold text-neutral-500 uppercase mb-3 flex items-center gap-2">
            <Filter size={14} /> Categorias
          </h3>
          <div className="space-y-1">
            {dynamicFilters.subGroups.map((group) => (
              <label
                key={group}
                className="flex items-center gap-2 p-1.5 rounded hover:bg-white/5 cursor-pointer group/label"
              >
                <div
                  className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                    selectedSubGroups.includes(group)
                      ? "bg-amber-600 border-amber-500"
                      : "border-neutral-700 group-hover/label:border-neutral-500"
                  }`}
                >
                  {selectedSubGroups.includes(group) && (
                    <Check size={10} className="text-white" />
                  )}
                </div>
                <input
                  type="checkbox"
                  className="hidden"
                  checked={selectedSubGroups.includes(group)}
                  onChange={() => toggleSubGroup(group)}
                />
                <span
                  className={`text-sm ${
                    selectedSubGroups.includes(group)
                      ? "text-amber-500 font-medium"
                      : "text-neutral-400"
                  }`}
                >
                  {group}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {dynamicFilters.damageTypes.length > 0 && (
        <div>
          <h3 className="text-xs font-bold text-neutral-500 uppercase mb-3 flex items-center gap-2">
            <Sword size={14} /> Tipo de Dano
          </h3>
          <div className="space-y-1">
            {dynamicFilters.damageTypes.map((type) => (
              <label
                key={type}
                className="flex items-center gap-2 p-1.5 rounded hover:bg-white/5 cursor-pointer group/label"
              >
                <div
                  className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                    selectedDamageTypes.includes(type)
                      ? "bg-amber-600 border-amber-500"
                      : "border-neutral-700 group-hover/label:border-neutral-500"
                  }`}
                >
                  {selectedDamageTypes.includes(type) && (
                    <Check size={10} className="text-white" />
                  )}
                </div>
                <input
                  type="checkbox"
                  className="hidden"
                  checked={selectedDamageTypes.includes(type)}
                  onChange={() => toggleDamageType(type)}
                />
                <span
                  className={`text-sm ${
                    selectedDamageTypes.includes(type)
                      ? "text-amber-500 font-medium"
                      : "text-neutral-400"
                  }`}
                >
                  {type}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // --- CONDITIONAL RENDERING ---

  let content;

  if (loading) {
    content = (
      <div className="min-h-screen flex items-center justify-center bg-stone-950 text-amber-500">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1 }}
        >
          <Coins size={48} />
        </motion.div>
      </div>
    );
  } else if (!activeCharacter) {
    // Character Selection Screen
    content = (
      <div className="min-h-screen bg-[#0c0c0c] text-neutral-200 font-sans selection:bg-amber-900/30 flex flex-col items-center justify-center p-6 relative overflow-hidden pb-20">
        <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-900/20 via-[#0c0c0c] to-[#0c0c0c] z-0" />

        <div className="relative z-10 w-full max-w-5xl">
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-3 text-amber-500 mb-4"
            >
              <ShoppingBag size={32} />
              <h1 className="text-4xl md:text-5xl font-cinzel font-bold tracking-wider">
                MERCADO
              </h1>
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-neutral-400 text-lg max-w-lg mx-auto"
            >
              Selecione qual herói irá às compras hoje. Seus fundos e inventário
              serão atualizados automaticamente.
            </motion.p>
          </div>

          {loadingChars ? (
            <div className="flex justify-center text-amber-500">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1 }}
              >
                <Coins size={32} />
              </motion.div>
            </div>
          ) : (
            <div className="w-full">
              <motion.h2
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-2xl font-cinzel text-amber-500 mb-8 text-center font-bold tracking-wide"
              >
                Quem vai às compras?
              </motion.h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {myCharacters.map((char, idx) => (
                  <motion.button
                    key={char.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    onClick={() => {
                      setLoading(true); // Artificial visual feedback or ensuring state updates
                      setActiveCharacter(char);
                      // Small timeout to allow state propagation/animation if needed,
                      // or just letting the next render cycle handle it.
                      setTimeout(() => setLoading(false), 500);
                    }}
                    className="group relative bg-[#1a1a1a] border border-white/5 hover:border-amber-500/50 rounded-xl p-6 text-left transition-all duration-300 hover:shadow-[0_0_30px_-5px_rgba(245,158,11,0.15)] overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div className="relative z-10 flex items-start justify-between mb-4">
                      <div className="p-3 bg-amber-900/20 rounded-lg text-amber-500 group-hover:scale-110 transition-transform duration-300">
                        <User size={24} />
                      </div>
                      <div className="text-right">
                        <span className="block text-xs text-neutral-500 uppercase tracking-widest font-bold">
                          Nível
                        </span>
                        <span className="text-xl font-cinzel font-bold text-white">
                          {char.level || 1}
                        </span>
                      </div>
                    </div>

                    <div className="relative z-10">
                      <h3 className="text-xl font-bold text-neutral-200 group-hover:text-amber-400 transition-colors mb-1 font-cinzel">
                        {char.name}
                      </h3>
                      <p className="text-sm text-neutral-500 mb-4">
                        {char.race?.name} — {char.class?.name}
                      </p>

                      <div className="flex items-center gap-2 text-amber-500/80 bg-black/40 p-2 rounded-lg border border-white/5">
                        <Coins size={14} />
                        <span className="font-bold">{char.money} T$</span>
                      </div>
                    </div>
                  </motion.button>
                ))}

                {myCharacters.length === 0 && (
                  <div className="col-span-full text-center py-12 border border-dashed border-white/10 rounded-xl">
                    <p className="text-neutral-500 mb-4">
                      Você ainda não tem personagens.
                    </p>
                    <button
                      onClick={() => router.push("/wizard")}
                      className="px-6 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-bold transition-colors"
                    >
                      Criar Personagem
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  } else {
    // --- MARKET CONTENT ---
    content = (
      <div className="min-h-screen bg-[#0c0c0c] text-neutral-200 font-sans selection:bg-amber-900/30">
        <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-900/10 via-[#0c0c0c] to-[#0c0c0c] z-0" />

        {/* Toast Feedback */}
        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: -50, x: "-50%" }}
              animate={{ opacity: 1, y: 0, x: "-50%" }}
              exit={{ opacity: 0, y: -50, x: "-50%" }}
              className={`fixed top-6 left-1/2 z-50 px-6 py-3 rounded-full shadow-2xl backdrop-blur-md border flex items-center gap-3 ${
                feedback.type === "success"
                  ? "bg-green-950/80 border-green-500/50 text-green-200"
                  : "bg-red-950/80 border-red-500/50 text-red-200"
              }`}
            >
              {feedback.type === "success" ? (
                <Coins size={18} />
              ) : (
                <AlertCircle size={18} />
              )}
              <span className="font-bold text-sm tracking-wide">
                {feedback.msg}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative z-10 flex">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:flex w-72 h-screen sticky top-0 flex-col bg-[#111] border-r border-white/5 p-4 overflow-y-auto scrollbar-thin">
            <div className="space-y-6 mb-8">
              <div className="flex items-center gap-3 px-2">
                <button
                  onClick={() => router.back()}
                  className="text-neutral-400 hover:text-white transition-colors"
                >
                  <ArrowLeft size={20} />
                </button>
                <h1 className="text-xl font-cinzel text-amber-500 tracking-wider">
                  MERCADO
                </h1>
              </div>

              {/* Character Info Card */}
              <div className="bg-[#1a1a1a] rounded-xl p-4 border border-white/5 shadow-inner">
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/5">
                  <div>
                    <h2 className="text-sm font-bold text-neutral-300 line-clamp-1">
                      {activeCharacter?.name}
                    </h2>
                    <p className="text-xs text-neutral-500">
                      {activeCharacter?.race?.name} • Nvl{" "}
                      {activeCharacter?.level || 1}
                    </p>
                  </div>
                  <button
                    onClick={() => clearActiveCharacter()}
                    className="p-1.5 hover:bg-white/5 rounded-lg text-neutral-500 hover:text-red-400 transition-colors"
                    title="Trocar Personagem"
                  >
                    <ArrowLeft size={14} />
                  </button>
                </div>

                <div className="flex items-center gap-2 mb-2 text-neutral-400 text-xs uppercase tracking-wider font-bold">
                  <Coins size={12} /> Seus Fundos
                </div>
                <div className="text-2xl font-bold text-amber-500 font-cinzel">
                  {activeCharacter?.money}{" "}
                  <span className="text-sm text-amber-700">T$</span>
                </div>
              </div>

              {/* Tabs */}
              <nav className="grid grid-cols-2 gap-2">
                {[
                  { id: "all", label: "Tudo", icon: Package },
                  { id: "weapons", label: "Armas", icon: Sword },
                  { id: "defense", label: "Defesa", icon: Shield },
                  { id: "general", label: "Geral", icon: Scroll },
                  { id: "alchemy", label: "Alquimia", icon: FlaskConical },
                  { id: "clothing", label: "Vestes", icon: Shirt },
                  { id: "food", label: "Comida", icon: Utensils },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveTab(cat.id)}
                    className={`flex flex-col items-center justify-center gap-2 py-3 rounded-lg transition-all duration-300 border ${
                      activeTab === cat.id
                        ? "bg-amber-900/20 border-amber-500/50 text-amber-500"
                        : "bg-[#1a1a1a] border-transparent text-neutral-400 hover:bg-[#222] hover:text-neutral-200"
                    }`}
                  >
                    <cat.icon size={18} />
                    <span className="text-xs font-bold">{cat.label}</span>
                  </button>
                ))}
              </nav>
            </div>

            <div className="border-t border-white/10 pt-6">
              <FilterPanelContent />
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 p-4 md:p-8 overflow-x-hidden min-h-screen flex flex-col">
            {/* Mobile Header */}
            <div className="flex flex-col gap-4 mb-6 lg:hidden">
              {/* Mobile Character Info Card */}
              <div className="bg-[#1a1a1a] rounded-xl p-4 border border-white/5 shadow-inner mb-4">
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-900/20 rounded-lg text-amber-500">
                      <User size={20} />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-neutral-300 line-clamp-1">
                        {activeCharacter?.name}
                      </h2>
                      <p className="text-xs text-neutral-500">
                        {activeCharacter?.race?.name} • Nvl{" "}
                        {activeCharacter?.level || 1}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowMobileCart(true)}
                      className="p-2 bg-stone-800 rounded-lg text-neutral-400 relative"
                    >
                      <ShoppingBag size={20} />
                      {bagItems.length > 0 && (
                        <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                      )}
                    </button>
                    <button
                      onClick={() => clearActiveCharacter()}
                      className="p-2 bg-stone-800 rounded-lg text-neutral-400 hover:text-red-400 transition-colors"
                      title="Trocar Personagem"
                    >
                      <LogOut size={20} />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-neutral-400 text-xs uppercase tracking-wider font-bold">
                    <Coins size={14} className="text-amber-500" />
                    Fundos Disponíveis
                  </div>
                  <div className="text-xl font-bold text-amber-500 font-cinzel">
                    {activeCharacter?.money}{" "}
                    <span className="text-xs text-amber-700">T$</span>
                  </div>
                </div>
              </div>

              {/* Mobile Search & Filter Row */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
                    size={16}
                  />
                  <input
                    type="text"
                    placeholder="Buscar..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-[#111] border border-white/10 rounded-lg pl-9 pr-3 py-2.5 text-sm focus:border-amber-500/50 outline-none"
                  />
                </div>
                <button
                  onClick={() => setShowMobileFilters(true)}
                  className="px-3 bg-[#111] border border-white/10 rounded-lg text-neutral-300 hover:border-amber-500/50 transition-colors"
                >
                  <SlidersHorizontal size={18} />
                </button>
              </div>

              {/* Mobile Horizontal Tabs */}
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                {[
                  { id: "all", label: "Tudo" },
                  { id: "weapons", label: "Armas" },
                  { id: "defense", label: "Defesa" },
                  { id: "general", label: "Geral" },
                  { id: "alchemy", label: "Alquimia" },
                  { id: "clothing", label: "Vestuário" },
                  { id: "food", label: "Comida" },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveTab(cat.id)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap border transition-all ${
                      activeTab === cat.id
                        ? "bg-amber-600 border-amber-500 text-white"
                        : "bg-[#111] border-white/10 text-neutral-400"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Results Header */}
            <div className="flex justify-between items-end mb-4 border-b border-white/5 pb-2">
              <div>
                <h2 className="text-2xl font-cinzel text-white">
                  {activeTab === "all"
                    ? "Todos os Itens"
                    : activeTab === "weapons"
                    ? "Arsenal"
                    : activeTab === "defense"
                    ? "Armaduras & Escudos"
                    : activeTab === "general"
                    ? "Equipamentos Gerais"
                    : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                </h2>
                <p className="text-xs text-neutral-500 mt-1">
                  Mostrando {paginatedItems.length} de {displayedItems.length}{" "}
                  resultados
                </p>
              </div>
            </div>

            {/* Items Grid */}
            <motion.div
              key={
                currentPage + activeTab + sortOrder + selectedSubGroups.join()
              }
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 flex-1 content-start"
            >
              {paginatedItems.length === 0 ? (
                <div className="col-span-full py-20 text-center text-neutral-600 flex flex-col items-center">
                  <Package size={48} className="mb-4 opacity-20" />
                  <p className="text-lg font-medium">Nenhum item encontrado.</p>
                  <p className="text-sm">
                    Tente ajustar seus filtros de busca.
                  </p>
                </div>
              ) : (
                paginatedItems.map((item, idx) => (
                  <motion.div
                    key={`${item.nome}-${idx}`}
                    variants={itemVariants}
                    className="bg-[#111] border border-white/5 rounded-xl p-4 hover:border-amber-500/30 hover:bg-[#161616] transition-all duration-300 relative group overflow-hidden"
                  >
                    {/* Hover Action Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                    <div className="flex justify-between items-start mb-2 relative z-10">
                      <div>
                        <h3 className="font-bold text-neutral-200 group-hover:text-amber-400 transition-colors line-clamp-1">
                          {item.nome}
                        </h3>
                        <span className="text-[10px] text-amber-500/70 uppercase tracking-widest font-bold">
                          {item.subGroup || item.group}
                        </span>
                      </div>
                      <div className="bg-[#0c0c0c] px-2 py-1 rounded text-[10px] text-neutral-400 border border-white/5 whitespace-nowrap">
                        {item.spaces} {item.spaces === 1 ? "espaço" : "espaços"}
                      </div>
                    </div>

                    {/* Tags/Stats */}
                    <div className="flex flex-wrap gap-2 mb-8 relative z-10">
                      {(item as any).defenseBonus && (
                        <span className="text-[10px] bg-blue-950/30 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/20 flex items-center gap-1">
                          <Shield size={10} /> +{(item as any).defenseBonus} Def
                        </span>
                      )}
                      {item.dano && (
                        <span className="text-[10px] bg-red-950/30 text-red-400 px-1.5 py-0.5 rounded border border-red-500/20 flex items-center gap-1">
                          <Sword size={10} /> {item.dano}
                        </span>
                      )}
                      {item.tipo && !item.tipo.includes("-") && (
                        <span className="text-[10px] text-neutral-500 px-1.5 py-0.5">
                          {item.tipo}
                        </span>
                      )}
                    </div>

                    {/* Bottom Action */}
                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between z-10">
                      <span className="font-cinzel font-bold text-amber-500 text-lg">
                        {item.preco === undefined ||
                        item.preco === null ? null : item.preco === 0 ? (
                          <span className="text-emerald-500 uppercase text-sm tracking-tighter">
                            Grátis
                          </span>
                        ) : (
                          <>
                            {item.preco} <span className="text-xs">T$</span>
                          </>
                        )}
                      </span>
                      <button
                        onClick={() => handleTransaction(item, "buy")}
                        className="bg-neutral-800 hover:bg-amber-600 text-white p-2 rounded-lg transition-all shadow-lg hover:shadow-amber-500/20 active:scale-95"
                      >
                        <span className="text-xs font-bold uppercase px-2">
                          Comprar
                        </span>
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center items-center gap-4 py-4">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg bg-[#111] border border-white/10 text-neutral-400 hover:text-amber-500 hover:border-amber-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft size={20} />
                </button>

                <div className="text-sm font-bold text-neutral-400">
                  <span className="text-amber-500">{currentPage}</span> /{" "}
                  {totalPages}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg bg-[#111] border border-white/10 text-neutral-400 hover:text-amber-500 hover:border-amber-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </main>

          {/* Right Inventory Panel (Desktop) */}
          <aside className="hidden 2xl:block w-72 h-screen sticky top-0 bg-[#111]/50 border-l border-white/5 p-6 backdrop-blur-sm">
            <h2 className="font-cinzel text-lg text-neutral-300 mb-6 flex items-center gap-2">
              <ShoppingBag className="text-amber-500" size={18} /> Inventário
            </h2>
            <div className="space-y-2 h-[calc(100vh-120px)] overflow-y-auto pr-2 custom-scrollbar">
              {bagItems.length === 0 ? (
                <p className="text-sm text-neutral-600 text-center mt-10">
                  Vazio.
                </p>
              ) : (
                bagItems.map((item, i) => (
                  <div
                    key={`${item.nome}-${i}-inv`}
                    className="group relative bg-[#0c0c0c] border border-white/5 p-3 rounded-xl hover:border-amber-500/30 transition-all flex flex-col gap-2"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-neutral-200 truncate group-hover:text-amber-400">
                          {item.nome}
                        </div>
                        <div className="text-[10px] text-neutral-500 font-medium">
                          {item.preco === undefined ||
                          item.preco === null ? null : item.preco === 0 ? (
                            <span className="text-emerald-500 font-bold">
                              Grátis
                            </span>
                          ) : (
                            `${item.preco} T$ cada`
                          )}
                        </div>
                      </div>
                      <div className="text-amber-500 font-bold font-cinzel text-sm">
                        x{item.quantidade || 1}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-1">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleTransaction(item, "sell")}
                          className="w-7 h-7 flex items-center justify-center rounded-lg bg-red-950/20 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all active:scale-90"
                          title="Remover um"
                        >
                          -
                        </button>
                        <button
                          onClick={() => handleTransaction(item, "buy")}
                          className="w-7 h-7 flex items-center justify-center rounded-lg bg-emerald-950/20 border border-emerald-500/20 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all active:scale-90"
                          title="Adicionar mais um"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={async () => {
                          const qty = item.quantidade || 1;
                          for (let k = 0; k < qty; k++) {
                            await handleTransaction(item, "sell");
                          }
                        }}
                        className="text-[10px] font-bold text-neutral-500 hover:text-red-400 transition-colors px-2 py-1"
                      >
                        LIMPAR
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </aside>
        </div>

        {/* Mobile Filters Drawer */}
        <AnimatePresence>
          {showMobileFilters && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowMobileFilters(false)}
                className="fixed inset-0 bg-black/80 z-40 lg:hidden backdrop-blur-sm"
              />
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                className="fixed left-0 top-0 bottom-0 w-[80%] max-w-sm bg-[#111] z-50 p-6 border-r border-white/10 lg:hidden shadow-2xl"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="font-cinzel text-xl text-amber-500">
                    Filtros
                  </h2>
                  <button onClick={() => setShowMobileFilters(false)}>
                    <X size={24} className="text-neutral-400" />
                  </button>
                </div>
                <FilterPanelContent />
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="mt-8 w-full bg-amber-600 text-white font-bold py-3 rounded-lg hover:bg-amber-500"
                >
                  Ver Resultados
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Mobile Cart Drawer */}
        <AnimatePresence>
          {showMobileCart && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowMobileCart(false)}
                className="fixed inset-0 bg-black/80 z-40 lg:hidden backdrop-blur-sm"
              />
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                className="fixed right-0 top-0 bottom-0 w-[85%] max-w-sm bg-[#111] z-50 p-6 border-l border-white/10 lg:hidden"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="font-cinzel text-xl text-amber-500">
                    Mochila
                  </h2>
                  <button onClick={() => setShowMobileCart(false)}>
                    <X size={24} className="text-neutral-400" />
                  </button>
                </div>
                <div className="space-y-3 overflow-y-auto h-[calc(100vh-100px)] pb-10">
                  {bagItems.map((item, i) => (
                    <div
                      key={`${item.nome}-${i}-mob`}
                      className="bg-[#0c0c0c] border border-white/5 p-4 rounded-xl flex flex-col gap-3"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-neutral-200">
                            {item.nome}
                          </p>
                          <p className="text-xs text-amber-500/70">
                            {item.preco === undefined ||
                            item.preco === null ? null : item.preco === 0 ? (
                              <span className="text-emerald-500 font-bold">
                                Grátis
                              </span>
                            ) : (
                              `${item.preco} T$ cada`
                            )}
                          </p>
                        </div>
                        <div className="bg-amber-900/20 px-2 py-1 rounded text-amber-500 font-bold text-sm">
                          x{item.quantidade || 1}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleTransaction(item, "sell")}
                            className="w-10 h-10 flex items-center justify-center rounded-lg bg-red-950/20 border border-red-500/30 text-red-500 active:scale-95"
                          >
                            -
                          </button>
                          <button
                            onClick={() => handleTransaction(item, "buy")}
                            className="w-10 h-10 flex items-center justify-center rounded-lg bg-emerald-950/20 border border-emerald-500/30 text-emerald-500 active:scale-95"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={async () => {
                            const qty = item.quantidade || 1;
                            for (let k = 0; k < qty; k++) {
                              await handleTransaction(item, "sell");
                            }
                          }}
                          className="text-xs font-bold text-neutral-500 px-3 py-2"
                        >
                          REMOVER TODOS
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
        <PurchaseModal
          isOpen={isPurchaseModalOpen}
          onClose={() => setIsPurchaseModalOpen(false)}
          onConfirm={handleConfirmPurchase}
          item={purchasingItem}
          characters={myCharacters}
          activeCharacterId={activeCharacter?.id}
        />
      </div>
    );
  }

  return content;
};

export default MarketPage;
