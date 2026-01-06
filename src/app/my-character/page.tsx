"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCharacterStore } from "@/store/useCharacterStore";
import { Character } from "@/interfaces/Character";
import {
  Coins,
  Heart,
  Shield,
  Zap,
  Swords,
  Brain,
  Backpack,
  Scroll,
  Crown,
  Ghost,
  BookOpen,
  Dna,
  Edit,
  Check,
  X,
  ShoppingBag,
  Package,
  FlaskConical,
  Shirt,
  Utensils,
  Hammer,
} from "lucide-react";
import { doc, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/firebaseConfig";
import { motion, AnimatePresence } from "framer-motion";
import { Atributo } from "@/data/atributos";
import Link from "next/link";
import { CharacterService } from "@/lib/characterService";
import { getRaceByName } from "@/data/racas";
import CLASSES from "@/data/classes";
import { formatAssetName } from "@/utils/assetUtils";
import { calculateCarryCapacity } from "@/utils/inventoryUtils";
import { FloatingBackButton } from "@/components/FloatingBackButton";

// --- SUB-COMPONENTS ---

const AbilityCard = ({
  title,
  type,
  description,
  icon: Icon,
  colorClass = "amber",
  quantity,
  item,
}: any) => {
  const colors: any = {
    amber: "amber",
    blue: "blue",
    red: "red",
    emerald: "emerald",
    violet: "violet",
    stone: "stone",
    orange: "orange",
    indigo: "indigo",
    pink: "pink",
    teal: "teal",
  };
  const c = colors[colorClass] || "amber";

  // Helper to render stats if they exist
  const hasStats =
    item?.dano ||
    item?.defenseBonus ||
    item?.armorPenalty ||
    item?.alcance ||
    (item?.spaces !== undefined && item?.spaces !== null);

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className={`flex-shrink-0 w-72 h-[320px] bg-stone-900 border border-stone-800 hover:border-${c}-500/50 p-5 rounded-2xl transition-all flex flex-col shadow-xl relative overflow-hidden group`}
    >
      <div
        className={`absolute top-0 right-0 p-3 opacity-[0.03] group-hover:opacity-10 transition-opacity text-${c}-500`}
      >
        {Icon && <Icon size={80} />}
      </div>

      {/* Header */}
      <div className="flex justify-between items-start mb-3 relative z-10 shrink-0">
        <div className="flex-1 min-w-0 pr-2">
          <h4
            className={`text-${c}-100 font-serif font-bold text-lg leading-tight group-hover:text-${c}-400 transition-colors truncate`}
          >
            {title}
          </h4>
          <span
            className={`text-[10px] uppercase tracking-widest font-bold text-${c}-500/70 block truncate`}
          >
            {type}
          </span>
        </div>
        {quantity && quantity > 1 && (
          <div
            className={`bg-${c}-500/20 text-${c}-500 px-2 py-1 rounded text-xs font-bold border border-${c}-500/30 shrink-0`}
          >
            x{quantity}
          </div>
        )}
      </div>

      {/* Stats Row */}
      {hasStats && (
        <div className="flex flex-wrap gap-1.5 mb-3 relative z-10 shrink-0">
          {item.dano && (
            <span className="text-[10px] bg-red-950/40 text-red-400 px-1.5 py-0.5 rounded border border-red-500/20 font-mono">
              {item.dano} {item.critico ? `/ ${item.critico}` : ""}
            </span>
          )}
          {item.defenseBonus > 0 && (
            <span className="text-[10px] bg-blue-950/40 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/20 font-mono">
              +{item.defenseBonus} Def
            </span>
          )}
          {item.armorPenalty > 0 && (
            <span className="text-[10px] bg-stone-950/40 text-stone-400 px-1.5 py-0.5 rounded border border-stone-500/20 font-mono">
              -{item.armorPenalty} Pen
            </span>
          )}
          {item.alcance && item.alcance !== "-" && (
            <span className="text-[10px] bg-emerald-950/40 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/20 font-mono">
              {item.alcance}
            </span>
          )}
          {item.spaces !== undefined &&
            item.spaces !== null &&
            (item.spaces === 0 ? (
              <span className="text-[10px] bg-emerald-950/40 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/20 font-mono">
                (não ocupa espaço)
              </span>
            ) : (
              <span className="text-[10px] bg-amber-950/40 text-amber-500 px-1.5 py-0.5 rounded border border-amber-500/20 font-mono">
                {item.spaces} {item.spaces === 1 ? "slot" : "slots"}
              </span>
            ))}
        </div>
      )}

      {/* Description */}
      <div className="flex-1 relative z-10 min-h-0">
        <p className="text-sm text-neutral-400 leading-relaxed overflow-hidden text-ellipsis line-clamp-[6]">
          {description}
        </p>
      </div>

      {/* Footer Price/Extra */}
      {item?.preco !== undefined && (
        <div className="mt-3 pt-3 border-t border-white/5 relative z-10 flex justify-between items-center shrink-0">
          <span className="text-xs text-stone-500 font-bold uppercase tracking-wider">
            Valor
          </span>
          <span className={`text-sm font-cinzel font-bold text-${c}-500/90`}>
            {item.preco === 0 ? "Grátis" : `${item.preco} T$`}
          </span>
        </div>
      )}

      <div
        className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r from-transparent via-${c}-500/20 to-transparent w-full opacity-0 group-hover:opacity-100 transition-opacity`}
      />
    </motion.div>
  );
};

const SectionSlider = ({
  title,
  items,
  icon: Icon,
  colorClass = "amber",
}: any) => {
  if (!items || items.length === 0) return null;

  return (
    <div className="mb-10 last:mb-0">
      <div className="flex items-center justify-between border-b border-stone-800 pb-3 mb-5">
        <h3
          className={`text-${colorClass}-500 font-serif text-xl flex items-center gap-3`}
        >
          {Icon && <Icon size={22} className={`text-${colorClass}-500`} />}
          {title}
        </h3>
        <span className="text-[10px] text-stone-500 font-bold uppercase tracking-widest bg-stone-900/50 px-3 py-1 rounded-full border border-stone-800 flex items-center gap-2">
          <span
            className={`w-1.5 h-1.5 rounded-full bg-${colorClass}-500 animate-pulse`}
          />
          {items.length} {items.length === 1 ? "Item" : "Itens"}
        </span>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-6 pt-2 px-2 -mx-2 scrollbar-thin scrollbar-thumb-stone-800 scrollbar-track-transparent snap-x mask-fade-edges">
        {items.map((item: any, idx: number) => (
          <AbilityCard
            key={idx}
            type={item.subGroup || item.tipo || title.split(" ").pop()}
            title={item.name || item.nome}
            // Use logical ORs to find the best description available
            description={
              item.text ||
              item.description ||
              item.effect ||
              (item.dano
                ? `Dano: ${item.dano} ${
                    item.critico ? `(Crit: ${item.critico})` : ""
                  }`
                : null) ||
              (typeof item.value === "object"
                ? item.value?.description || item.value?.name
                : item.value) ||
              "Sem descrição detalhada."
            }
            quantity={item.quantidade}
            icon={Icon}
            colorClass={colorClass}
            item={item} // Pass full item for advanced stats rendering
          />
        ))}
      </div>
    </div>
  );
};

export default function MyCharacterPage() {
  const router = useRouter();
  const { activeCharacter, updateActiveCharacter } = useCharacterStore();
  const [initializing, setInitializing] = useState(true);

  // States for Money Management
  const [isEditingMoney, setIsEditingMoney] = useState(false);
  const [tempMoney, setTempMoney] = useState(0);

  // States for Resources (PV/PM)
  const [isEditingPv, setIsEditingPv] = useState(false);
  const [tempPv, setTempPv] = useState(0);
  const [isEditingPm, setIsEditingPm] = useState(false);
  const [tempPm, setTempPm] = useState(0);

  // Authentication and Character Check
  useEffect(() => {
    if (!auth) return;

    let unsubscribeAuth: (() => void) | undefined;

    unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/");
        return;
      }

      if (!activeCharacter) {
        // Try to recover from local storage or redirect
        const storedId = localStorage.getItem("rpg_active_char_id");
        if (storedId) {
          router.push("/characters");
        } else {
          router.push("/characters");
        }
      } else {
        setInitializing(false);
        setTempMoney(activeCharacter.money);

        // Derive max values first to safeguard defaults
        const conMod = activeCharacter.attributes.Constituição;
        const hpBase = activeCharacter.class?.pv || 16;
        const hpMax = hpBase + conMod;
        const pmBase = activeCharacter.class?.pm || 4;
        const pmMax = pmBase;

        setTempPv(activeCharacter.currentPv ?? hpMax);
        setTempPm(activeCharacter.currentPm ?? pmMax);
      }
    });

    return () => unsubscribeAuth?.();
  }, [activeCharacter, router]);

  // Real-time Synchronization
  useEffect(() => {
    if (!auth || !db || !activeCharacter?.id || !auth.currentUser) return;

    const charRef = doc(
      db,
      "users",
      auth.currentUser.uid,
      "characters",
      activeCharacter.id
    );

    const unsubscribeSnapshot = onSnapshot(charRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as Partial<Character> & {
          raceName?: string;
          className?: string;
        };

        // Hydration Logic for Legacy/Missing Data
        if (!data.race && data.raceName) {
          try {
            data.race = getRaceByName(data.raceName);
          } catch (e) {
            console.error("Failed to hydrate race:", e);
          }
        }

        if (!data.class && data.className) {
          try {
            const foundClass = CLASSES.find((c) => c.name === data.className);
            if (foundClass) {
              // Clone to avoid reference issues
              data.class = JSON.parse(JSON.stringify(foundClass));
            }
          } catch (e) {
            console.error("Failed to hydrate class:", e);
          }
        }

        updateActiveCharacter(data);

        // Recalculate maxes for defaults
        const conMod = (data.attributes as any)?.Constituição || 0;
        const hpBase = data.class?.pv || 16;
        const hpMax = hpBase + conMod;
        const pmBase = data.class?.pm || 4;
        const pmMax = pmBase;

        if (!isEditingMoney) setTempMoney(data.money || 0);
        if (!isEditingPv) setTempPv(data.currentPv ?? hpMax);
        if (!isEditingPm) setTempPm(data.currentPm ?? pmMax);
      }
    });

    return () => unsubscribeSnapshot();
  }, [
    activeCharacter?.id,
    updateActiveCharacter,
    isEditingMoney,
    isEditingPv,
    isEditingPm,
  ]);

  const handleSaveMoney = async () => {
    if (!auth || !activeCharacter || !auth.currentUser) return;

    try {
      updateActiveCharacter({ money: tempMoney });
      setIsEditingMoney(false);
      await CharacterService.updateCharacter(
        auth.currentUser.uid,
        activeCharacter.id!,
        { money: tempMoney }
      );
    } catch (e) {
      console.error(e);
      alert("Erro ao salvar Tibares.");
    }
  };

  const handleSavePv = async () => {
    if (!auth || !activeCharacter || !auth.currentUser) return;
    try {
      updateActiveCharacter({ currentPv: tempPv });
      setIsEditingPv(false);
      await CharacterService.updateCharacter(
        auth.currentUser.uid,
        activeCharacter.id!,
        { currentPv: tempPv }
      );
    } catch (e) {
      console.error(e);
      alert("Erro ao salvar PV.");
    }
  };

  const handleSavePm = async () => {
    if (!auth || !activeCharacter || !auth.currentUser) return;
    try {
      updateActiveCharacter({ currentPm: tempPm });
      setIsEditingPm(false);
      await CharacterService.updateCharacter(
        auth.currentUser.uid,
        activeCharacter.id!,
        { currentPm: tempPm }
      );
    } catch (e) {
      console.error(e);
      alert("Erro ao salvar PM.");
    }
  };

  if (initializing || !activeCharacter) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-stone-950 text-amber-500 font-serif">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
        >
          <Shield className="w-16 h-16 mb-4 opacity-50" />
        </motion.div>
        <p className="tracking-widest animate-pulse">CARREGANDO GRIMÓRIO...</p>
      </div>
    );
  }

  // Calculate generic HP/MP if not stored explicitly (fallback)
  const conMod = activeCharacter.attributes.Constituição;
  const hpBase = activeCharacter.class?.pv || 16;
  const hpMax = hpBase + conMod;
  const currentHp = activeCharacter.currentPv ?? hpMax;

  const pmBase = activeCharacter.class?.pm || 4;
  const pmMax = pmBase;
  const currentPm = activeCharacter.currentPm ?? pmMax;

  const attributesList: { key: Atributo; label: string; icon: any }[] = [
    { key: Atributo.FORCA, label: "Força", icon: Swords },
    { key: Atributo.DESTREZA, label: "Destreza", icon: Ghost },
    { key: Atributo.CONSTITUICAO, label: "Constituição", icon: Heart },
    { key: Atributo.INTELIGENCIA, label: "Inteligência", icon: Brain },
    { key: Atributo.SABEDORIA, label: "Sabedoria", icon: Scroll },
    { key: Atributo.CARISMA, label: "Carisma", icon: Crown },
  ];

  return (
    <div className="min-h-screen bg-stone-950 text-neutral-200 pb-20 font-sans selection:bg-amber-900 selection:text-white">
      <FloatingBackButton />
      {/* --- HERO HEADER --- */}
      <header className="relative w-full bg-gradient-to-b from-stone-900 to-stone-950 border-b border-stone-800 pb-8 pt-6 px-4 md:px-8 overflow-hidden">
        {/* Background Accents */}
        <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
          <Shield className="w-96 h-96 transform rotate-12" />
        </div>
        <div className="absolute top-10 left-10 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto max-w-6xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row items-center gap-6"
          >
            {/* Avatar */}
            <div className="relative group perspective">
              <div className="w-28 h-28 md:w-32 md:h-32 rounded-full border-4 border-stone-800 bg-stone-900 flex items-center justify-center shadow-2xl relative z-10 group-hover:border-amber-700 transition-colors">
                <span className="text-5xl md:text-6xl filter drop-shadow-lg">
                  🧙‍♂️
                </span>
              </div>
              <div className="absolute inset-0 bg-amber-500/20 rounded-full blur-xl group-hover:bg-amber-500/30 transition-all" />
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-stone-800 border border-stone-700 rounded-full text-[10px] font-bold uppercase tracking-wider text-amber-500 whitespace-nowrap z-20 shadow-lg">
                Nível {activeCharacter.level}
              </div>
            </div>

            {/* Character Info */}
            <div className="flex-1 text-center md:text-left space-y-2">
              <h1 className="text-4xl md:text-5xl font-serif font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-500 to-amber-700 drop-shadow-sm">
                {activeCharacter.name}
              </h1>
              <div className="flex flex-wrap gap-2 justify-center md:justify-start items-center text-sm text-neutral-400 font-serif">
                <span className="flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-lg border border-white/5 hover:border-amber-500/30 hover:text-amber-200 transition-colors cursor-help">
                  <Dna size={14} className="text-amber-500" />
                  {activeCharacter.race?.name || "Raça Desconhecida"}
                </span>
                <span className="w-1 h-1 bg-stone-700 rounded-full" />
                <span className="flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-lg border border-white/5 hover:border-amber-500/30 hover:text-amber-200 transition-colors cursor-help">
                  <Swords size={14} className="text-amber-500" />
                  {activeCharacter.class?.name || "Classe Desconhecida"}
                </span>
                {activeCharacter.origin && (
                  <>
                    <span className="w-1 h-1 bg-stone-700 rounded-full" />
                    <span className="flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-lg border border-white/5 hover:border-amber-500/30 hover:text-amber-200 transition-colors cursor-help">
                      <BookOpen size={14} className="text-amber-500" />
                      {activeCharacter.origin.name}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Resources (HP/MP) */}
            <div className="flex gap-4 w-full md:w-auto mt-4 md:mt-0">
              {/* HP Box */}
              <div className="flex-1 md:flex-none relative group min-w-[120px]">
                <div className="absolute inset-x-4 bottom-0 h-10 bg-red-500/20 blur-xl group-hover:bg-red-500/30 transition-all" />
                <div className="bg-gradient-to-br from-red-950/80 to-stone-900 border border-red-900/50 rounded-2xl p-4 flex flex-col items-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-2 opacity-10">
                    <Heart size={40} />
                  </div>
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="text-xs font-bold text-red-400/80 uppercase tracking-widest">
                      Vida (PV)
                    </span>
                    {!isEditingPv && (
                      <button
                        onClick={() => setIsEditingPv(true)}
                        className="p-1 text-red-400/50 hover:text-red-300"
                      >
                        <Edit size={12} />
                      </button>
                    )}
                  </div>

                  {isEditingPv ? (
                    <div className="flex items-center gap-1 animate-in fade-in zoom-in">
                      <div className="flex items-baseline gap-1">
                        <input
                          type="number"
                          value={tempPv}
                          onChange={(e) => setTempPv(Number(e.target.value))}
                          className="w-16 bg-black/40 border border-red-500/50 rounded text-center font-bold text-red-100 outline-none focus:ring-1 focus:ring-red-500/30"
                          autoFocus
                        />
                        <span className="text-xs text-red-500/60 font-medium whitespace-nowrap">
                          / {hpMax}
                        </span>
                      </div>
                      <div className="flex gap-1 ml-1">
                        <button
                          onClick={handleSavePv}
                          className="p-1 bg-green-900/20 text-green-500 hover:bg-green-900/40 rounded"
                        >
                          <Check size={14} />
                        </button>
                        <button
                          onClick={() => setIsEditingPv(false)}
                          className="p-1 bg-red-900/20 text-red-500 hover:bg-red-900/40 rounded"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="flex items-baseline gap-1 cursor-pointer group/value"
                      onClick={() => setIsEditingPv(true)}
                    >
                      <span className="text-3xl font-black text-red-100 group-hover/value:text-red-400 transition-colors">
                        {currentHp}
                      </span>
                      <span className="text-xs text-red-500/60 font-medium">
                        / {hpMax}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Mana Box */}
              <div className="flex-1 md:flex-none relative group min-w-[120px]">
                <div className="absolute inset-x-4 bottom-0 h-10 bg-blue-500/20 blur-xl group-hover:bg-blue-500/30 transition-all" />
                <div className="bg-gradient-to-br from-blue-950/80 to-stone-900 border border-blue-900/50 rounded-2xl p-4 flex flex-col items-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-2 opacity-10">
                    <Zap size={40} />
                  </div>
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="text-xs font-bold text-blue-400/80 uppercase tracking-widest">
                      Mana (PM)
                    </span>
                    {!isEditingPm && (
                      <button
                        onClick={() => setIsEditingPm(true)}
                        className="p-1 text-blue-400/50 hover:text-blue-300 transition-colors"
                      >
                        <Edit size={12} />
                      </button>
                    )}
                  </div>

                  {isEditingPm ? (
                    <div className="flex items-center gap-1 animate-in fade-in zoom-in">
                      <div className="flex items-baseline gap-1">
                        <input
                          type="number"
                          value={tempPm}
                          onChange={(e) => setTempPm(Number(e.target.value))}
                          className="w-16 bg-black/40 border border-blue-500/50 rounded text-center font-bold text-blue-100 outline-none focus:ring-1 focus:ring-blue-500/30"
                          autoFocus
                        />
                        <span className="text-xs text-blue-500/60 font-medium whitespace-nowrap">
                          / {pmMax}
                        </span>
                      </div>
                      <div className="flex gap-1 ml-1">
                        <button
                          onClick={handleSavePm}
                          className="p-1 bg-green-900/20 text-green-500 hover:bg-green-900/40 rounded"
                        >
                          <Check size={14} />
                        </button>
                        <button
                          onClick={() => setIsEditingPm(false)}
                          className="p-1 bg-red-900/20 text-red-500 hover:bg-red-900/40 rounded"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="flex items-baseline gap-1 cursor-pointer group/value"
                      onClick={() => setIsEditingPm(true)}
                    >
                      <span className="text-3xl font-black text-blue-100 group-hover/value:text-blue-400 transition-colors">
                        {currentPm}
                      </span>
                      <span className="text-xs text-blue-500/60 font-medium">
                        / {pmMax}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </header>

      <main className="container mx-auto max-w-6xl px-4 md:px-8 -mt-6">
        {/* --- ATTRIBUTES ROW --- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8"
        >
          {attributesList.map(({ key, label, icon: Icon }) => {
            const value = activeCharacter.attributes[key];
            return (
              <div
                key={key}
                className="bg-stone-900/90 border border-stone-800 p-4 rounded-xl flex flex-col items-center justify-center relative group hover:border-amber-900/50 transition-colors shadow-lg"
              >
                <div className="absolute top-2 left-2 text-stone-700 group-hover:text-amber-900/40 transition-colors">
                  <Icon size={16} />
                </div>
                <span className="text-xs text-stone-500 uppercase font-bold tracking-wider mb-2">
                  {label.slice(0, 3)}
                </span>
                <span className="text-4xl font-serif font-bold text-neutral-200">
                  {value}
                </span>
              </div>
            );
          })}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* --- LEFT COLUMN: CORE INFO --- */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6 lg:col-span-2"
          >
            {/* Class Essence */}
            <section
              aria-label="Essência da Classe"
              className="bg-stone-900/50 border border-amber-900/20 rounded-2xl p-6 relative overflow-hidden group"
            >
              {activeCharacter.class?.name && (
                <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity">
                  <img
                    src={`/assets/classes/${formatAssetName(
                      activeCharacter.class.name
                    )}.webp`}
                    alt={activeCharacter.class.name}
                    className="w-full h-full object-cover grayscale mix-blend-overlay"
                  />
                </div>
              )}

              <div className="relative z-10">
                <h3 className="text-amber-500 font-serif text-lg mb-3 flex items-center gap-2">
                  <Scroll size={18} /> Essência da Classe
                </h3>
                <p className="text-neutral-400 italic leading-relaxed text-sm md:text-base">
                  {activeCharacter.class?.description ||
                    "Aventureiros variam, mas cada classe possui uma centelha única que define sua jornada, seus poderes e seu destino no mundo."}
                </p>
              </div>
            </section>

            {/* Origin Essence */}
            {activeCharacter.origin && (
              <section
                aria-label="Sua Origem"
                className="bg-stone-900/50 border border-stone-800 rounded-2xl p-6 relative overflow-hidden group"
              >
                <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity">
                  <img
                    src={`https://source.unsplash.com/featured/?fantasy,${activeCharacter.origin.name}`}
                    alt={activeCharacter.origin.name}
                    className="w-full h-full object-cover grayscale mix-blend-overlay"
                  />
                </div>

                <div className="relative z-10">
                  <h3 className="text-amber-500 font-serif text-lg mb-3 flex items-center gap-2">
                    <BookOpen size={18} /> Origem: {activeCharacter.origin.name}
                  </h3>
                  <p className="text-neutral-400 italic leading-relaxed text-sm md:text-base mb-3">
                    {/* Placeholder description if none exists in model */}
                    As raízes de um herói definem até onde seus galhos podem
                    alcançar.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {activeCharacter.originBenefits?.map((benefit, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 bg-stone-950/80 border border-stone-700 rounded text-xs text-stone-300 shadow-sm"
                      >
                        {benefit.name}
                      </span>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* Proficiencies */}
            <section
              aria-label="Treinamento e Equipamento"
              className="bg-stone-900/50 border border-stone-800 rounded-2xl p-6"
            >
              <h3 className="text-amber-500 font-serif text-lg mb-4 flex items-center gap-2">
                <Swords size={18} /> Treinamento & Proficiências
              </h3>
              <div className="flex flex-wrap text-sm text-neutral-400 gap-y-2">
                <p className="w-full mb-3">
                  {activeCharacter.class?.detailedProficiencies ||
                    (activeCharacter.class?.proficiencias?.length
                      ? activeCharacter.class.proficiencias.join(", ")
                      : "Nenhuma proficiência registrada.")}
                </p>
                <div className="flex gap-2 flex-wrap">
                  {activeCharacter.class?.proficiencias?.map((prof) => (
                    <span
                      key={prof}
                      className="px-3 py-1 bg-stone-800 rounded-md border border-stone-700 text-xs font-medium uppercase tracking-wide text-neutral-300"
                    >
                      {prof}
                    </span>
                  ))}
                </div>
              </div>
            </section>

            {/* Abilities & Powers Sliders */}
            <section aria-label="Habilidades e Poderes" className="space-y-2">
              <SectionSlider
                title="Habilidades de Raça"
                items={activeCharacter.race?.abilities}
                icon={Ghost}
                colorClass="blue"
              />

              <SectionSlider
                title="Habilidades de Classe"
                items={activeCharacter.class?.abilities}
                icon={Zap}
                colorClass="amber"
              />

              <SectionSlider
                title="Poderes de Classe"
                items={activeCharacter.class?.powers}
                icon={Swords}
                colorClass="red"
              />

              <SectionSlider
                title="Habilidades de Origem"
                items={activeCharacter.originBenefits}
                icon={BookOpen}
                colorClass="emerald"
              />

              {activeCharacter.grantedPower && (
                <SectionSlider
                  title="Poderes Concedidos"
                  items={[activeCharacter.grantedPower]}
                  icon={Crown}
                  colorClass="violet"
                />
              )}

              {/* Empty State if no abilities */}
              {!activeCharacter.class?.abilities?.length &&
                !activeCharacter.class?.powers?.length &&
                !activeCharacter.race?.abilities?.length &&
                !activeCharacter.originBenefits?.length && (
                  <div className="text-center p-12 bg-stone-900/30 rounded-2xl border border-dashed border-stone-800 text-stone-600 flex flex-col items-center gap-3">
                    <Ghost size={40} className="opacity-20" />
                    <p className="font-serif">
                      Nenhuma habilidade manifestada ainda.
                    </p>
                  </div>
                )}
            </section>

            {/* --- INVENTORY SLIDERS --- */}
            <section
              aria-label="Inventário Detalhado"
              className="space-y-2 pt-8 border-t border-stone-900"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-serif text-amber-500 flex items-center gap-3">
                  <Backpack size={26} /> Seu Inventário
                </h2>
                <div className="flex items-center gap-4 text-xs text-stone-500 font-bold uppercase tracking-widest">
                  {(() => {
                    const bag = activeCharacter.bag;
                    if (!bag) return null;

                    const currentSpaces =
                      typeof bag.getSpaces === "function"
                        ? bag.getSpaces()
                        : (bag as any).spaces || 0;

                    const maxCapacity = calculateCarryCapacity(activeCharacter);
                    const isOverloaded = currentSpaces > maxCapacity;

                    return (
                      <span
                        className={`flex items-center gap-2 ${
                          isOverloaded ? "text-red-500 animate-pulse" : ""
                        }`}
                      >
                        <Package
                          size={14}
                          className={
                            isOverloaded ? "text-red-500" : "text-stone-700"
                          }
                        />
                        Ocupado: {currentSpaces} / {maxCapacity} espaços
                      </span>
                    );
                  })()}
                </div>
              </div>

              {(() => {
                const bag = activeCharacter.bag;
                if (!bag) return null;

                const equips =
                  typeof bag.getEquipments === "function"
                    ? bag.getEquipments()
                    : (bag as any).equipments || {};

                return (
                  <>
                    <SectionSlider
                      title="Armas"
                      items={equips["Arma"]}
                      icon={Swords}
                      colorClass="orange"
                    />
                    <SectionSlider
                      title="Defesa"
                      items={[
                        ...(equips["Armadura"] || []),
                        ...(equips["Escudo"] || []),
                      ]}
                      icon={Shield}
                      colorClass="blue"
                    />
                    <SectionSlider
                      title="Itens Gerais"
                      items={equips["Item Geral"]}
                      icon={Package}
                      colorClass="stone"
                    />
                    <SectionSlider
                      title="Alquimia"
                      items={equips["Alquimía"]}
                      icon={FlaskConical}
                      colorClass="emerald"
                    />
                    <SectionSlider
                      title="Vestuário"
                      items={equips["Vestuário"]}
                      icon={Shirt}
                      colorClass="amber"
                    />
                    <SectionSlider
                      title="Alimentação"
                      items={equips["Alimentação"]}
                      icon={Utensils}
                      colorClass="orange"
                    />
                  </>
                );
              })()}

              {/* Trained Skills Slider */}
              <SectionSlider
                title="Perícias Treinadas"
                items={(activeCharacter.skills || []).map((s) => ({
                  name: s,
                  text: "Perícia treinada que concede bônus em testes relacionados.",
                }))}
                icon={Brain}
                colorClass="indigo"
              />
            </section>
          </motion.div>

          {/* --- RIGHT COLUMN: SIDEBAR --- */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            {/* Money Pouch */}
            <div className="bg-gradient-to-br from-stone-900 to-stone-950 border border-amber-900/30 p-5 rounded-2xl shadow-lg relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <Coins size={80} />
              </div>

              <div className="relative z-10">
                <h4 className="text-xs uppercase font-bold text-stone-500 mb-2 flex justify-between items-center">
                  <span>Tibares (T$)</span>
                  {!isEditingMoney && (
                    <button
                      onClick={() => setIsEditingMoney(true)}
                      className="text-stone-600 hover:text-amber-500 transition-colors bg-stone-800/50 p-1.5 rounded-lg"
                      title="Editar Dinheiro"
                    >
                      <Edit size={14} />
                    </button>
                  )}
                </h4>

                {isEditingMoney ? (
                  <div className="flex items-center gap-2 animate-in fade-in zoom-in duration-200">
                    <input
                      type="number"
                      value={tempMoney}
                      onChange={(e) => setTempMoney(Number(e.target.value))}
                      className="w-full bg-black/40 border border-amber-500/50 rounded-lg p-2 text-xl font-bold text-amber-100 font-cinzel outline-none focus:ring-2 focus:ring-amber-500/30"
                      autoFocus
                    />
                    <button
                      onClick={handleSaveMoney}
                      className="p-2 bg-green-900/20 text-green-500 hover:bg-green-900/40 rounded-lg"
                    >
                      <Check size={20} />
                    </button>
                    <button
                      onClick={() => setIsEditingMoney(false)}
                      className="p-2 bg-red-900/20 text-red-500 hover:bg-red-900/40 rounded-lg"
                    >
                      <X size={20} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500">
                        <Coins size={24} />
                      </div>
                      <span className="text-2xl font-black font-cinzel text-amber-100">
                        {activeCharacter.money}
                      </span>
                    </div>
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-white/5">
                  <Link
                    href="/market"
                    className="flex items-center justify-center gap-2 w-full py-2 bg-amber-900/20 hover:bg-amber-900/40 text-amber-500 font-bold rounded-lg transition-all text-xs uppercase tracking-wider border border-amber-900/30 hover:border-amber-500/50"
                  >
                    <ShoppingBag size={14} /> Ir para o Mercado
                  </Link>
                </div>
              </div>
            </div>

            {/* Quick Stats / Mini Cards for Sidebar */}
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-stone-900/50 border border-stone-800 p-4 rounded-xl flex items-center gap-4">
                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                  <Shield size={20} />
                </div>
                <div>
                  <h5 className="text-[10px] uppercase font-bold text-stone-500">
                    Defesa Total
                  </h5>
                  <p className="text-xl font-bold text-stone-200">
                    {10 +
                      (activeCharacter.attributes?.Destreza || 0) +
                      (activeCharacter.bag?.armorPenalty || 0)}
                  </p>
                </div>
              </div>

              <div className="bg-stone-900/50 border border-stone-800 p-4 rounded-xl flex items-center gap-4">
                <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500">
                  <Ghost size={20} />
                </div>
                <div>
                  <h5 className="text-[10px] uppercase font-bold text-stone-500">
                    Deslocamento
                  </h5>
                  <p className="text-xl font-bold text-stone-200">
                    9m <span className="text-xs text-stone-500">(6q)</span>
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
