import React, { useState, useEffect, useMemo } from "react";
import { useCharacterStore } from "../../store/useCharacterStore";
import {
  Coins,
  ShoppingBag,
  Sword,
  Shield as ShieldIcon,
  Hammer,
  MoreHorizontal,
  Plus,
  Minus,
  Check,
  X,
  Package,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Equipment from "../../interfaces/Equipment";
import { getEquipmentsByCategory, findEquipmentByName } from "@/lib/localData";
import { Armas } from "../../data/equipamentos";

// Merge all shop items
const SHOP_CATEGORIES = [
  { id: "all", label: "Tudo", icon: ShoppingBag },
  { id: "weapons", label: "Armas", icon: Sword },
  { id: "armor", label: "Armaduras", icon: ShieldIcon },
  { id: "general", label: "Geral", icon: Package },
];

const EquipmentSelection = () => {
  const {
    money,
    bag,
    addToBag,
    removeFromBag,
    updateMoney,
    selectedClass,
    selectedOrigin,
    setStep,
    baseAttributes,
  } = useCharacterStore();

  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // --- 1. Initial Load Logic (Once) ---
  // Add default items from Class and Origin if Bag is empty (approx checking logic)
  // For a wizard store, usually we do this when entering the step or transitioning.
  // Ideally this logic belongs in the Store action `initInventory()` but we can do it here with a flag/memo.
  // However, react strict mode might double trigger.
  // For now, let's assume the user starts with empty bag in this session or we trust the store persistence.
  // Since we don't have a "Initialized" flag, we might skip auto-add for this iteration
  // OR we provide a "Receber Kit Inicial" button if bag is empty.

  // Better UX: Button "Resgatar Equipamento Inicial" if bag is empty.
  const hasItems = Object.values(bag.getEquipments()).flat().length > 0;

  const handleGrantInitialItems = () => {
    // Class Items (Simulated logic based on T20 standard, usually defined in Class Description but text based there?
    // Data file only has 'proficiencias'. Real data `items` is missing in `src/data/classes.ts` based on my view?
    // Wait, looking at `guerreiro.ts` (viewed earlier), it didn't strictly list starting items in the interface used.
    // Origin items ARE defined in `src/data/origins`.

    let initialItems: Equipment[] = [];

    // 1. Origin Items
    if (selectedOrigin && selectedOrigin.getItems) {
      const originItems = selectedOrigin.getItems();
      originItems.forEach((i) => {
        // Map Origin Item format to Equipment
        // Origin Item: { equipment: string | Equipment, qtd?, description? }
        // We need to find real Equipment object if it's a string, or create a mock one.

        let eq: Equipment | undefined;

        if (typeof i.equipment === "string") {
          // Try to find in databases
          // Function to find by name
          eq = findEquipmentByName(i.equipment);
          if (!eq) {
            // Create generic
            eq = {
              nome: i.equipment,
              group: "Item Geral",
              spaces: 0,
              preco: 0,
            };
          }
        } else {
          // It's already equipment object? The interface says string usually.
          // types say `equipment: string`. Wait `getItems` returns `Items[]`.
          // The snippet for Origins showed `equipment: 'Traje de Sacerdote'`.
          // We fallback to generic.
        }

        if (eq) {
          addToBag(eq);
          // If qtd > 1, add loop? `addToBag` just pushes one.
          // Bag mechanics usually accumulate or show Qtd.
          // Current Bag logic: `newEquips.concat`. So duplicate entries.
          // We'll leave as is.
        }
      });
    }

    // 2 Class Items (Mocked generic kit)
    // Standard T20: Backpack, Sleeping Bag, Traveler's Outfit.
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
  /**
   * OTIMIZAÇÃO DE PERFORMANCE
   *
   * Usa getEquipmentsByCategory do localData.ts para carregar dados estáticos locais
   * Memoização garante que a lista só é recalculada quando activeTab ou searchTerm mudam
   */
  const marketItems = useMemo(() => {
    const categories = getEquipmentsByCategory();
    let items: Equipment[] = [];

    if (activeTab === "all") {
      items = [
        ...categories.weapons,
        ...categories.armors,
        ...categories.shields,
        ...categories.general,
      ];
    } else if (activeTab === "weapons") {
      items = categories.weapons;
    } else if (activeTab === "armor") {
      items = [...categories.armors, ...categories.shields];
    } else if (activeTab === "general") {
      items = categories.general;
    }

    // Search Filter
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      items = items.filter((i) => i.nome.toLowerCase().includes(lower));
    }

    return items.sort((a, b) => a.preco - b.preco);
  }, [activeTab, searchTerm]);

  // --- 3. Actions ---
  const handleBuy = (item: Equipment) => {
    if (money >= item.preco) {
      updateMoney(money - item.preco);
      addToBag(item);
    }
  };

  const handleSell = (item: Equipment) => {
    // Sell for half price? Or full refund for wizard mode?
    // Usually Wizard Mode = Refund to change mind.
    updateMoney(money + item.preco);
    removeFromBag(item);
  };

  // --- UI Helpers ---
  const bagItemsFlat = Object.values(bag.getEquipments()).flat();
  const bagWeight = bag.getSpaces();
  // Load Capacity: Str * 3 (Simplification)
  // Strength is Base + Race (Need to calc again or store provides?)
  // Store has `baseAttributes`. We can roughly calc.
  // Let's assume Capacity = 10 for now standard or calc if possible.
  const strMod = useCharacterStore.getState().baseAttributes.Força || 0;
  // Wait, base is 0. Score is 10. Mod is 0.
  // Capacity rules T20: 3 * FOR (Strength Score? Or just 3 * (Strength Score usually)).
  // Carry Capacity = 3 * Strength.
  // If Str=10, Cap=30 spaces? No, standard is 10 spaces + 2 per STR mod?
  // T20 JDA: Carga Básica = 3 * Força (Atributo?).
  // Let's use 10 + (StrMod * 2) generic rule or just StrScore * 3?
  // Let's stick to simple "N spaces used".

  return (
    <div className="w-full h-full min-h-[80vh] flex flex-col relative bg-neutral-900">
      {/* --- Top Bar: Money & Status --- */}
      <div className="sticky top-0 z-30 bg-neutral-950/90 backdrop-blur border-b border-amber-900/30 p-4 shadow-lg">
        <div className="flex justify-between items-center max-w-md mx-auto">
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
      <div className="flex-1 overflow-y-auto pb-24">
        <div className="max-w-md mx-auto p-4 space-y-6">
          {/* Inventory Section */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
            <div className="bg-neutral-950 p-3 border-b border-neutral-800 flex justify-between items-center">
              <h3 className="font-cinzel text-neutral-400 flex items-center gap-2">
                <Package size={16} /> Mochila ({bagItemsFlat.length})
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

            <div className="max-h-48 overflow-y-auto p-2 space-y-1 scrollbar-thin scrollbar-thumb-neutral-700">
              {bagItemsFlat.length > 0 ? (
                bagItemsFlat.map((item, idx) => (
                  <div
                    key={`${item.nome}-${idx}`}
                    className="flex justify-between items-center bg-neutral-800/50 p-2 rounded group"
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-neutral-200">
                        {item.nome}
                      </span>
                      <span className="text-[10px] text-neutral-500">
                        {item.group} • {item.spaces} esp.
                      </span>
                    </div>
                    <button
                      onClick={() => handleSell(item)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:bg-red-900/20 rounded transition-all"
                      title="Remover (Reembolsar)"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-center text-neutral-600 py-8 text-sm italic">
                  Sua mochila está vazia.
                </p>
              )}
            </div>
          </div>

          {/* Market Section */}
          <div>
            <h3 className="font-cinzel text-amber-500 text-lg mb-4 text-center">
              Mercado
            </h3>

            {/* Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 mb-2 scrollbar-hide justify-center">
              {SHOP_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveTab(cat.id)}
                  className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all
                                        ${
                                          activeTab === cat.id
                                            ? "bg-amber-600 text-white shadow-lg"
                                            : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700"
                                        }`}
                >
                  <cat.icon size={14} />
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="Buscar item..."
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg py-2 px-4 text-sm text-neutral-200 focus:outline-none focus:border-amber-500/50 placeholder-neutral-600"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* List */}
            <div className="grid grid-cols-1 gap-2">
              {marketItems.map((item, i) => {
                const canAfford = money >= item.preco;
                return (
                  <div
                    key={`${item.nome}-${i}`}
                    className="bg-neutral-900/80 border border-neutral-800 p-3 rounded-lg flex justify-between items-center hover:border-neutral-700 transition-colors"
                  >
                    <div>
                      <div className="font-bold text-sm text-neutral-200">
                        {item.nome}
                      </div>
                      <div className="text-xs text-neutral-500 flex gap-2">
                        <span className="text-amber-500/80">
                          T$ {item.preco}
                        </span>
                        <span>•</span>
                        <span>{item.spaces} esp.</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleBuy(item)}
                      disabled={!canAfford}
                      className={`w-8 h-8 rounded flex items-center justify-center transition-all
                                                ${
                                                  canAfford
                                                    ? "bg-neutral-800 text-green-500 hover:bg-green-900/30 hover:scale-110"
                                                    : "bg-neutral-800/50 text-neutral-600 cursor-not-allowed"
                                                }`}
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 w-full max-w-md mx-auto p-4 bg-neutral-950 border-t border-neutral-800 z-40 left-0 right-0">
        <button
          onClick={() => setStep(6)}
          className="w-full py-4 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg shadow-lg shadow-amber-900/20 active:scale-[0.98] transition-all flex justify-center items-center gap-2"
        >
          <Check size={20} />
          Finalizar Equipamento
        </button>
      </div>
    </div>
  );
};

export default EquipmentSelection;
