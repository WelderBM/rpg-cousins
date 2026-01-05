import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCharacterStore } from "../../store/useCharacterStore";
import {
  Coins,
  ShoppingBag,
  Sword,
  Shield as ShieldIcon,
  Plus,
  X,
  Package,
  ChevronLeft,
  Check,
} from "lucide-react";
import Equipment from "../../interfaces/Equipment";
import { getEquipmentsByCategory, findEquipmentByName } from "@/lib/localData";
import { Armas } from "../../data/equipamentos";

// Merge all shop items
const SHOP_CATEGORIES = [
  { id: "all", label: "Tudo", icon: ShoppingBag },
  { id: "weapons", label: "Armas", icon: Sword },
  { id: "armor", label: "Defesa", icon: ShieldIcon },
  { id: "alchemy", label: "Alquimia", icon: Package },
  { id: "clothing", label: "Vestuário", icon: Package },
  { id: "general", label: "Geral", icon: Package },
];

const EquipmentSelection = () => {
  const {
    money,
    bag,
    addToBag,
    removeFromBag,
    updateMoney,
    selectedOrigin,
    setStep,
  } = useCharacterStore();

  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeView, setActiveView] = useState<"bag" | "market">("bag");

  // --- Data Loading State ---
  const [categories, setCategories] = useState<{
    weapons: Equipment[];
    armors: Equipment[];
    shields: Equipment[];
    general: Equipment[];
    alchemy: Equipment[];
    clothing: Equipment[];
  }>({
    weapons: [],
    armors: [],
    shields: [],
    general: [],
    alchemy: [],
    clothing: [],
  });

  useEffect(() => {
    const loadData = async () => {
      const data = await getEquipmentsByCategory();
      setCategories(data);
    };
    loadData();
  }, []);

  // --- 1. Initial Load Logic (Once) ---
  const hasItems = Object.values(bag.getEquipments()).flat().length > 0;

  const handleGrantInitialItems = async () => {
    // 1. Origin Items
    if (selectedOrigin && selectedOrigin.getItems) {
      const originItems = selectedOrigin.getItems();
      for (const i of originItems) {
        let eq: Equipment | undefined;
        if (typeof i.equipment === "string") {
          eq = await findEquipmentByName(i.equipment);
          if (!eq) {
            eq = {
              nome: i.equipment,
              group: "Item Geral",
              spaces: 0,
              preco: 0,
            };
          }
        }
        if (eq) {
          addToBag(eq);
        }
      }
    }

    // 2 Class Items (Mocked generic kit)
    addToBag({ nome: "Mochila", group: "Item Geral", spaces: 0, preco: 0 });
    addToBag({
      nome: "Saco de dormir",
      group: "Item Geral",
      spaces: 1,
      preco: 0,
    });
    addToBag({
      nome: "Traje de viajante",
      group: "Vestuário",
      spaces: 0,
      preco: 0,
    });

    // Weapon? Just give a dagger for safety.
    addToBag(Armas.ADAGA);
  };

  // --- 2. Market Data ---
  const marketItems = useMemo(() => {
    let items: Equipment[] = [];

    if (activeTab === "all") {
      items = [
        ...categories.weapons,
        ...categories.armors,
        ...categories.shields,
        ...categories.general,
        ...categories.alchemy,
        ...categories.clothing,
      ];
    } else if (activeTab === "weapons") {
      items = categories.weapons;
    } else if (activeTab === "armor") {
      items = [...categories.armors, ...categories.shields];
    } else if (activeTab === "general") {
      items = categories.general;
    } else if (activeTab === "alchemy") {
      items = categories.alchemy;
    } else if (activeTab === "clothing") {
      items = categories.clothing;
    }

    // Search Filter
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      items = items.filter((i) => i.nome.toLowerCase().includes(lower));
    }

    return items.sort((a, b) => (a.preco ?? 0) - (b.preco ?? 0));
  }, [categories, activeTab, searchTerm]);

  // --- 3. Actions ---
  const handleBuy = (item: Equipment) => {
    const itemPrice = item.preco ?? 0;
    if (money >= itemPrice) {
      updateMoney(money - itemPrice);
      addToBag(item);
    }
  };

  const handleSell = (item: Equipment) => {
    updateMoney(money + (item.preco ?? 0));
    removeFromBag(item);
  };

  // --- UI Helpers ---
  const bagItemsFlat = Object.values(bag.getEquipments()).flat();
  const bagWeight = bag.getSpaces();

  return (
    <div className="w-full h-full min-h-[80vh] flex flex-col relative bg-neutral-900">
      {/* --- Top Bar: Money & Status --- */}
      <div className="sticky top-0 z-30 bg-neutral-950/90 backdrop-blur border-b border-amber-900/30 p-4 shadow-lg">
        <div className="flex justify-between items-center mx-auto max-w-5xl">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setStep(4)}
              className="p-2 bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-400 hover:text-white transition-all"
              title="Voltar"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="flex items-center gap-3">
              <div className="bg-amber-500/10 p-2 rounded-full border border-amber-500/20">
                <Coins className="text-amber-400" size={24} />
              </div>
              <div>
                <p className="text-xs text-neutral-400 uppercase tracking-widest">
                  Dinheiro
                </p>
                <p className="text-2xl font-cinzel text-amber-100 font-bold">
                  T$ {money}
                </p>
              </div>
            </div>
          </div>

          <div className="text-right">
            <p className="text-xs text-neutral-500 uppercase">Carga</p>
            <p className="text-sm font-bold text-neutral-300">
              {bagWeight.toFixed(1)}{" "}
              <span className="text-[10px] font-normal text-neutral-500">
                espaços
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* --- Main Content --- */}
      <div className="flex-1 overflow-y-auto pb-48 md:pb-32">
        <div className="mx-auto p-4 space-y-6 max-w-5xl">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 md:p-10 shadow-2xl">
            {/* Tabs Navigation */}
            <div className="flex border-b border-stone-800 mb-8">
              <button
                onClick={() => setActiveView("bag")}
                className={`px-6 py-3 font-cinzel text-lg transition-all border-b-2 ${
                  activeView === "bag"
                    ? "border-amber-500 text-amber-500 bg-amber-500/5"
                    : "border-transparent text-stone-500 hover:text-stone-300 hover:bg-white/5"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Package size={18} />
                  Mochila
                </div>
              </button>
              <button
                onClick={() => setActiveView("market")}
                className={`px-6 py-3 font-cinzel text-lg transition-all border-b-2 ${
                  activeView === "market"
                    ? "border-amber-500 text-amber-500 bg-amber-500/5"
                    : "border-transparent text-stone-500 hover:text-stone-300 hover:bg-white/5"
                }`}
              >
                <div className="flex items-center gap-2">
                  <ShoppingBag size={18} />
                  Mercado
                </div>
              </button>
            </div>

            <AnimatePresence mode="wait">
              {activeView === "bag" ? (
                <motion.div
                  key="bag"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-6"
                >
                  <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
                    <div className="bg-neutral-950 p-3 border-b border-neutral-800 flex justify-between items-center">
                      <h3 className="font-cinzel text-neutral-400 flex items-center gap-2">
                        <Package size={16} /> Sua Mochila ({bagItemsFlat.length}
                        )
                      </h3>
                      {!hasItems && (
                        <button
                          onClick={handleGrantInitialItems}
                          className="text-xs bg-amber-900/30 text-amber-500 px-2 py-1 rounded border border-amber-900/50 hover:bg-amber-900/50 transition-colors"
                        >
                          Resgatar Kit Inicial
                        </button>
                      )}
                    </div>

                    <div className="max-h-96 overflow-y-auto p-4 space-y-2 scrollbar-thin scrollbar-thumb-neutral-700">
                      {bagItemsFlat.length > 0 ? (
                        bagItemsFlat.map((item, idx) => (
                          <div
                            key={`${item.nome}-${idx}`}
                            className="flex justify-between items-center bg-neutral-800/50 border border-neutral-700/50 p-3 rounded-lg group"
                          >
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-neutral-200">
                                {item.nome}
                              </span>
                              <span className="text-xs text-neutral-500 uppercase tracking-tighter">
                                {item.group} • {item.spaces} esp.
                              </span>
                            </div>
                            <button
                              onClick={() => handleSell(item)}
                              className="p-2 text-neutral-500 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-all"
                              title="Remover (Reembolsar)"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-12">
                          <Package className="w-12 h-12 text-neutral-800 mx-auto mb-3" />
                          <p className="text-neutral-500 italic">
                            Sua mochila está vazia. Explore o mercado para se
                            equipar!
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="market"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-6"
                >
                  {/* Market Categories */}
                  <div className="flex gap-2 overflow-x-auto pb-4 justify-center no-scrollbar">
                    {SHOP_CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setActiveTab(cat.id)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all
                          ${
                            activeTab === cat.id
                              ? "bg-amber-600 text-white shadow-lg shadow-amber-900/20 scale-105"
                              : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700"
                          }`}
                      >
                        <cat.icon size={16} />
                        {cat.label}
                      </button>
                    ))}
                  </div>

                  {/* Market Search */}
                  <div className="relative group">
                    <input
                      type="text"
                      placeholder="Buscar no mercado..."
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl py-3 px-5 text-neutral-200 focus:outline-none focus:border-amber-500/50 placeholder-neutral-600 transition-all shadow-inner"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  {/* Market List */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                    {marketItems.map((item, i) => {
                      const canAfford = money >= (item.preco ?? 0);
                      return (
                        <div
                          key={`${item.nome}-${i}`}
                          className="bg-neutral-900/40 border border-neutral-800/60 p-4 rounded-2xl flex justify-between items-center hover:border-amber-500/30 transition-all group"
                        >
                          <div>
                            <div className="font-bold text-neutral-200 group-hover:text-amber-500 transition-colors">
                              {item.nome}
                            </div>
                            <div className="text-xs text-neutral-500 mt-1 flex items-center gap-2">
                              <span className="text-amber-500 font-bold">
                                T$ {item.preco}
                              </span>
                              <span className="w-1 h-1 rounded-full bg-neutral-700" />
                              <span className="uppercase tracking-tighter">
                                {item.spaces} esp.
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleBuy(item)}
                            disabled={!canAfford}
                            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-lg
                              ${
                                canAfford
                                  ? "bg-neutral-800 text-green-500 hover:bg-green-500 hover:text-white hover:scale-110 active:scale-90"
                                  : "bg-neutral-800/30 text-neutral-700 cursor-not-allowed opacity-50"
                              }`}
                            title={
                              canAfford
                                ? "Comprar item"
                                : "Dinheiro insuficiente"
                            }
                          >
                            <Plus size={20} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="fixed bottom-24 md:bottom-0 w-full mx-auto p-4 bg-black/80 backdrop-blur-md border-t border-neutral-800 z-40 left-0 right-0">
        <div className="max-w-5xl mx-auto flex gap-4">
          <button
            onClick={() => setStep(4)}
            className="px-6 py-4 bg-neutral-800 hover:bg-neutral-700 text-neutral-400 font-bold rounded-2xl transition-all"
          >
            Voltar
          </button>
          <button
            onClick={() => setStep(6)}
            className="flex-1 py-4 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-2xl shadow-xl shadow-amber-900/20 active:scale-[0.98] transition-all flex justify-center items-center gap-2"
          >
            <Check size={20} />
            Revisar Ficha
          </button>
        </div>
      </div>
    </div>
  );
};

export default EquipmentSelection;
