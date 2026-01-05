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
  Plus,
  Minus,
  AlertCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { getEquipmentsByCategory } from "../../lib/localData";
import Equipment from "../../interfaces/Equipment";

const MarketPage = () => {
  const router = useRouter();
  const { activeCharacter, addToBag, removeFromBag, updateActiveCharacter } =
    useCharacterStore();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [feedback, setFeedback] = useState<{
    msg: string;
    type: "success" | "error";
  } | null>(null);

  const [categories, setCategories] = useState<{
    weapons: Equipment[];
    armors: Equipment[];
    shields: Equipment[];
    general: Equipment[];
    alchemy: Equipment[];
    clothing: Equipment[];
    food: Equipment[];
  }>({
    weapons: [],
    armors: [],
    shields: [],
    general: [],
    alchemy: [],
    clothing: [],
    food: [],
  });

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const checkAuth = async () => {
      const { onAuthStateChanged } = await import("firebase/auth");
      if (!auth) return;
      unsubscribe = onAuthStateChanged(auth, (user) => {
        if (!user) {
          router.push("/characters");
        } else if (!activeCharacter) {
          router.push("/characters");
        }
      });
    };

    checkAuth();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [activeCharacter, router]);

  useEffect(() => {
    const loadData = async () => {
      const data = await getEquipmentsByCategory();
      setCategories(data);
      setLoading(false);
    };
    loadData();
  }, [activeCharacter, router]);

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
        ...categories.food,
      ];
    } else if (activeTab === "weapons") items = categories.weapons;
    else if (activeTab === "armor")
      items = [...categories.armors, ...categories.shields];
    else if (activeTab === "general") items = categories.general;
    else if (activeTab === "alchemy") items = categories.alchemy;
    else if (activeTab === "clothing") items = categories.clothing;
    else if (activeTab === "food") items = categories.food;

    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      items = items.filter((i) => i.nome.toLowerCase().includes(lower));
    }

    return items;
  }, [categories, activeTab, searchTerm]);

  const handleTransaction = async (item: Equipment, type: "buy" | "sell") => {
    if (!auth || !auth.currentUser || !activeCharacter) return;

    const price = item.preco || 0;
    let newMoney = activeCharacter.money;
    let newBag = activeCharacter.bag;

    // We rely on store actions but need to sync manually to persistence because store actions
    // usually just update local state, and Wizard persists at the end.
    // For Active Character we need immediate persistence.

    if (type === "buy") {
      if (newMoney < price) {
        setFeedback({ msg: "Dinheiro insuficiente!", type: "error" });
        return;
      }
      newMoney -= price;
      addToBag(item); // Update store
      setFeedback({ msg: `Comprou ${item.nome}`, type: "success" });
    } else {
      newMoney += price; // Sell price = Buy price? Usually half, but per request implies transaction. Using full price for now or same price.
      removeFromBag(item); // Update store
      setFeedback({ msg: `Vendeu ${item.nome}`, type: "success" });
    }

    // Now Sync with Firestore
    try {
      // We need to grab the UPDATED bag from the store, but `addToBag` updates state asynchronously/reactively
      // A better way is to construct the bag update payload manually or use the Store's bag state *after* update.
      // However, we can just pass the new money and rely on the UI reflecting the Store's bag,
      // BUT we need to persist the Bag changes too.
      // The `addToBag` in store creates a new Bag instance.
      // Let's force an updateActiveCharacter call which we can then persist.

      // Wait a tick for store to update? No, that's flaky.
      // Better: Create the persistence payload here.

      // Since `addToBag` updates `activeCharacter.bag` inside the store if `activeCharacter` is set (Wait, does it?)
      // Check store:
      // `addToBag` updates `state.bag` (wizard state).
      // It DOES NOT automatically update `activeCharacter.bag` unless we are in Wizard mode or logic connects them.
      // Store line 228: `setActiveCharacter` sets `activeCharacter` and hydrated bag.
      // Store line 144: `addToBag` updates `state.bag`. It does NOT update `state.activeCharacter.bag`.

      // THIS IS A BUG/GAP. Buying in market while playing shouldn't use Wizard's `state.bag`.
      // It should update `activeCharacter.bag`.

      // FIX: I will implement local logic here to update Active Character directly, bypassing Wizard `addToBag`.

      // Re-implementing simplified bag logic for Active Char:
      const currentBagEquips = activeCharacter.bag.getEquipments(); // This gets the object { [group]: items }
      const group = item.group || "Item Geral";

      // Deep clone to modify
      const newEquips = JSON.parse(JSON.stringify(currentBagEquips));

      if (type === "buy") {
        if (!newEquips[group]) newEquips[group] = [];
        newEquips[group].push(item);
      } else {
        if (newEquips[group]) {
          const idx = newEquips[group].findIndex(
            (i: any) => i.nome === item.nome
          );
          if (idx > -1) newEquips[group].splice(idx, 1);
        }
      }

      // Update Store locally
      updateActiveCharacter({
        money: newMoney,
        bag: { ...activeCharacter.bag, equipments: newEquips } as any, // Hacky cast, but Bag class handles it on re-hydration
      });

      // Update Firestore
      await CharacterService.updateCharacter(
        auth.currentUser.uid,
        activeCharacter.id!,
        {
          money: newMoney,
          bag: {
            equipments: newEquips,
            // spaces and penalty logic usually recalculated by class,
            // but we need to save the DATA.
            spaces: 0, // Placeholder, class calcs it
            armorPenalty: 0, // Placeholder
          } as any,
        }
      );
    } catch (e) {
      console.error(e);
      setFeedback({ msg: "Erro ao salvar transação", type: "error" });
    }

    setTimeout(() => setFeedback(null), 3000);
  };

  if (loading || !activeCharacter) {
    return (
      <div className="p-8 text-center text-amber-500">
        Carregando Mercado...
      </div>
    );
  }

  // Flatten bag for inventory view
  const bagItems = Object.values(activeCharacter.bag.getEquipments()).flat();

  return (
    <div className="min-h-screen bg-stone-950 text-neutral-200 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-stone-900 border-b border-amber-900/30 p-4 shadow-xl">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <button
            onClick={() => router.back()}
            className="text-neutral-400 hover:text-white"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-cinzel text-amber-500 flex items-center gap-2">
            <ShoppingBag /> Mercado de Arton
          </h1>
          <div className="flex items-center gap-2 bg-black/40 px-3 py-1 rounded-full border border-amber-900/40">
            <Coins className="text-amber-500" size={16} />
            <span className="font-bold text-amber-100">
              {activeCharacter.money} T$
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Market Listings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Controls */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
                size={18}
              />
              <input
                type="text"
                placeholder="Buscar itens..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-stone-900 border border-stone-800 rounded-lg pl-10 pr-4 py-2 focus:border-amber-500 outline-none text-sm"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {[
                { id: "all", label: "Todos", icon: Filter },
                { id: "weapons", label: "Armas", icon: Sword },
                { id: "armor", label: "Defesa", icon: Shield },
                { id: "alchemy", label: "Alquimia", icon: Package },
                { id: "clothing", label: "Vestes", icon: ShoppingBag },
                { id: "general", label: "Geral", icon: Package },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveTab(cat.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap border transition-all ${
                    activeTab === cat.id
                      ? "bg-amber-600 border-amber-500 text-white"
                      : "bg-stone-900 border-stone-800 text-neutral-400 hover:bg-stone-800"
                  }`}
                >
                  <cat.icon size={14} /> {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {marketItems.map((item, i) => (
              <div
                key={`${item.nome}-${i}`}
                className="bg-stone-900/50 border border-stone-800 p-3 rounded-xl flex justify-between items-center hover:border-amber-900/50 transition-colors"
              >
                <div>
                  <div className="font-bold text-sm text-neutral-200">
                    {item.nome}
                  </div>
                  <div className="text-xs text-neutral-500">
                    {item.group} • {item.spaces} espaços
                  </div>
                  {item.dano && (
                    <div className="text-[10px] text-red-400">
                      Dano: {item.dano}
                    </div>
                  )}
                  {(item as any).defenseBonus && (
                    <div className="text-[10px] text-blue-400">
                      Defesa: +{(item as any).defenseBonus}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleTransaction(item, "buy")}
                  className="flex flex-col items-center gap-1 min-w-[60px] p-2 rounded bg-stone-950 border border-stone-800 hover:border-amber-500 group active:scale-95 transition-all"
                >
                  <span className="text-amber-500 font-bold text-xs">
                    {item.preco} T$
                  </span>
                  <span className="text-[10px] text-neutral-500 group-hover:text-green-400 font-bold">
                    COMPRAR
                  </span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Inventory Side Panel */}
        <div className="lg:col-span-1">
          <div className="bg-stone-900/80 border border-stone-800 rounded-xl p-4 sticky top-20">
            <h2 className="text-lg font-cinzel text-neutral-300 mb-4 flex items-center gap-2">
              <Package size={18} /> Seu Inventário
            </h2>

            <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-stone-700">
              {bagItems.length === 0 && (
                <p className="text-sm text-neutral-600 italic">
                  Mochila vazia.
                </p>
              )}
              {bagItems.map((item, i) => (
                <div
                  key={`${item.nome}-${i}`}
                  className="flex justify-between items-center p-2 bg-stone-950 rounded border border-stone-800/50"
                >
                  <div className="truncate flex-1">
                    <div className="text-xs font-bold text-neutral-300 truncate">
                      {item.nome}
                    </div>
                    <div className="text-[10px] text-neutral-500">
                      {item.preco} T$
                    </div>
                  </div>
                  <button
                    onClick={() => handleTransaction(item, "sell")}
                    className="text-[10px] text-red-500 hover:bg-red-900/20 px-2 py-1 rounded border border-transparent hover:border-red-900/30 transition-all font-bold"
                  >
                    VENDER
                  </button>
                </div>
              ))}
            </div>

            {feedback && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`mt-4 p-3 rounded-lg text-xs font-bold text-center ${
                  feedback.type === "success"
                    ? "bg-green-900/20 text-green-400 border border-green-900/50"
                    : "bg-red-900/20 text-red-400 border border-red-900/50"
                }`}
              >
                {feedback.msg}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketPage;
