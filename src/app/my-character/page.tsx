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
} from "lucide-react";
import { doc, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/firebaseConfig";
import { motion, AnimatePresence } from "framer-motion";
import { Atributo } from "@/data/atributos";
import Link from "next/link";
import { CharacterService } from "@/lib/characterService";

// Utility for attribute modifier
const getMod = (val: number) => Math.floor((val - 10) / 2);
const formatMod = (val: number) => (val >= 0 ? `+${val}` : val);

export default function MyCharacterPage() {
  const router = useRouter();
  const { activeCharacter, updateActiveCharacter } = useCharacterStore();
  const [initializing, setInitializing] = useState(true);

  // States for Money Management
  const [isEditingMoney, setIsEditingMoney] = useState(false);
  const [tempMoney, setTempMoney] = useState(0);

  // Authentication and Character Check
  useEffect(() => {
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
      }
    });

    return () => unsubscribeAuth?.();
  }, [activeCharacter, router]);

  // Real-time Synchronization
  useEffect(() => {
    if (!activeCharacter?.id || !auth.currentUser) return;

    const charRef = doc(
      db,
      "users",
      auth.currentUser.uid,
      "characters",
      activeCharacter.id
    );

    const unsubscribeSnapshot = onSnapshot(charRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as Partial<Character>;
        updateActiveCharacter(data);
        if (!isEditingMoney) {
          setTempMoney(data.money || 0);
        }
      }
    });

    return () => unsubscribeSnapshot();
  }, [activeCharacter?.id, updateActiveCharacter]);

  const handleSaveMoney = async () => {
    if (!activeCharacter || !auth.currentUser) return;

    try {
      // Optimistic update
      updateActiveCharacter({ money: tempMoney });
      setIsEditingMoney(false);

      // Persist
      await CharacterService.updateCharacter(
        auth.currentUser.uid,
        activeCharacter.id!,
        {
          money: tempMoney,
        }
      );
    } catch (e) {
      console.error(e);
      alert("Erro ao salvar Tibares.");
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
  const conMod = getMod(activeCharacter.attributes.Constituição);
  const hpBase = activeCharacter.class?.pv || 16;
  const hpMax = hpBase + conMod;

  const pmBase = activeCharacter.class?.pm || 4;
  const pmMax = pmBase;

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
                  <span className="text-xs font-bold text-red-400/80 uppercase tracking-widest mb-1">
                    Vida (PV)
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-red-100">
                      {hpMax}
                    </span>
                    <span className="text-xs text-red-500/60 font-medium">
                      / {hpMax}
                    </span>
                  </div>
                </div>
              </div>

              {/* Mana Box */}
              <div className="flex-1 md:flex-none relative group min-w-[120px]">
                <div className="absolute inset-x-4 bottom-0 h-10 bg-blue-500/20 blur-xl group-hover:bg-blue-500/30 transition-all" />
                <div className="bg-gradient-to-br from-blue-950/80 to-stone-900 border border-blue-900/50 rounded-2xl p-4 flex flex-col items-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-2 opacity-10">
                    <Zap size={40} />
                  </div>
                  <span className="text-xs font-bold text-blue-400/80 uppercase tracking-widest mb-1">
                    Mana (PM)
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-blue-100">
                      {pmMax}
                    </span>
                    <span className="text-xs text-blue-500/60 font-medium">
                      / {pmMax}
                    </span>
                  </div>
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
            const mod = getMod(value);
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
                <span className="text-3xl font-serif font-bold text-neutral-200">
                  {value}
                </span>
                <span
                  className={`absolute -bottom-3 px-2 py-0.5 rounded textxs font-bold border ${
                    mod >= 0
                      ? "bg-stone-800 border-stone-700 text-amber-500"
                      : "bg-red-950/50 border-red-900/30 text-red-400"
                  }`}
                >
                  {formatMod(mod)}
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
                    src={`https://source.unsplash.com/featured/?fantasy,${activeCharacter.class.name}`}
                    alt={activeCharacter.class.name}
                    className="w-full h-full object-cover grayscale mix-blend-overlay"
                  />
                </div>
              )}

              <div className="relative z-10">
                <div className="absolute top-0 left-0 w-1 h-full bg-amber-600/50" />
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

            {/* Abilities & Powers */}
            <section aria-label="Habilidades e Poderes" className="space-y-4">
              <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                <h3 className="text-amber-500 font-serif text-xl flex items-center gap-2">
                  <Zap size={20} /> Habilidades de Classe
                </h3>
                <span className="text-xs text-stone-500 uppercase font-bold">
                  Nível {activeCharacter.level}
                </span>
              </div>

              <div className="grid gap-4">
                {activeCharacter.class?.abilities?.map((ability: any) => (
                  <div
                    key={ability.name}
                    className="group bg-stone-900/80 border border-stone-800 hover:border-amber-900/40 p-5 rounded-xl transition-all"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-amber-100 font-serif font-bold text-lg group-hover:text-amber-400 transition-colors">
                        {ability.name}
                      </h4>
                      <span className="px-2 py-0.5 bg-stone-950 rounded text-[10px] items-center text-stone-600 font-bold uppercase border border-stone-800">
                        Passiva
                      </span>
                    </div>
                    {ability.text && (
                      <p className="text-sm text-neutral-400 leading-relaxed">
                        {ability.text}
                      </p>
                    )}
                  </div>
                ))}
                {(activeCharacter.class?.powers || []).map((power: any) => (
                  <div
                    key={power.name}
                    className="group bg-stone-900/80 border border-stone-800 hover:border-amber-900/40 p-5 rounded-xl transition-all"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-amber-100 font-serif font-bold text-lg group-hover:text-amber-400 transition-colors">
                        {power.name}
                      </h4>
                      <span className="px-2 py-0.5 bg-violet-950/20 text-violet-400 rounded text-[10px] items-center font-bold uppercase border border-violet-900/30">
                        Poder
                      </span>
                    </div>
                    {power.text && (
                      <p className="text-sm text-neutral-400 leading-relaxed">
                        {power.text}
                      </p>
                    )}
                  </div>
                ))}

                {(!activeCharacter.class?.abilities ||
                  activeCharacter.class.abilities.length === 0) &&
                  (!activeCharacter.class?.powers ||
                    activeCharacter.class.powers.length === 0) && (
                    <div className="text-center p-8 bg-stone-900/30 rounded-xl border border-dashed border-stone-800 text-stone-600">
                      Nenhuma habilidade desbloqueada ainda.
                    </div>
                  )}
              </div>
            </section>
          </motion.div>

          {/* --- RIGHT COLUMN: SIDEBAR --- */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            {/* Money Pouch - REDESIGNED */}
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

            {/* Selected Skills */}
            <div className="bg-stone-900/80 border border-stone-800 p-6 rounded-2xl">
              <h3 className="text-amber-500 font-serif text-lg mb-4 flex items-center gap-2">
                <BookOpen size={18} /> Perícias Treinadas
              </h3>
              <ul className="space-y-2">
                {(activeCharacter.skills || []).map((skill) => (
                  <li
                    key={skill}
                    className="flex items-center justify-between p-2 rounded-lg bg-stone-950/50 border border-stone-800/50"
                  >
                    <span className="text-sm font-medium text-neutral-300">
                      {skill}
                    </span>
                    <span className="text-xs font-bold text-amber-500 bg-amber-950/20 px-2 py-0.5 rounded">
                      Treinado
                    </span>
                  </li>
                ))}
                {(!activeCharacter.skills ||
                  activeCharacter.skills.length === 0) && (
                  <li className="text-xs text-stone-600 italic">
                    Nenhuma perícia treinada.
                  </li>
                )}
              </ul>
            </div>

            {/* Inventory / Bag */}
            <div className="bg-stone-900/80 border border-stone-800 p-6 rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-amber-500 font-serif text-lg flex items-center gap-2">
                  <Backpack size={18} /> Inventário
                </h3>
                {activeCharacter.bag &&
                  typeof activeCharacter.bag.getSpaces === "function" && (
                    <span className="text-xs text-stone-500">
                      {activeCharacter.bag.getSpaces()} slots
                    </span>
                  )}
              </div>

              <div className="space-y-2">
                {(() => {
                  // Defensive coding for bag format
                  const equipments =
                    activeCharacter.bag &&
                    typeof activeCharacter.bag.getEquipments === "function"
                      ? Object.values(
                          activeCharacter.bag.getEquipments()
                        ).flat()
                      : (activeCharacter.bag as any)?.equipments // Fallback for plain object structure
                      ? Object.values(
                          (activeCharacter.bag as any).equipments
                        ).flat()
                      : [];

                  if (equipments.length === 0)
                    return (
                      <p className="text-xs text-stone-600 italic">
                        Mochila vazia.
                      </p>
                    );

                  return equipments
                    .slice(0, 8)
                    .map((item: any, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 p-2 bg-stone-950/30 rounded border border-stone-800/50"
                      >
                        <div className="w-8 h-8 rounded bg-stone-900 flex items-center justify-center border border-stone-800">
                          {/* Icon placeholder logic */}
                          <Shield size={14} className="text-stone-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-neutral-300 truncate">
                            {item.nome}
                          </p>
                          <p className="text-[10px] text-stone-500 capitalize">
                            {item.tipo || "Item"}
                          </p>
                        </div>
                      </div>
                    ));
                })()}
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
