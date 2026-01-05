"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCharacterStore } from "@/store/useCharacterStore";
import { Character } from "@/interfaces/Character";
import { Coins, Heart, Shield, Zap } from "lucide-react";
import { doc, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/firebaseConfig";

export default function MyCharacterPage() {
  const router = useRouter();
  const { activeCharacter, updateActiveCharacter, setActiveCharacter } =
    useCharacterStore();
  const [initializing, setInitializing] = useState(true);

  // Authentication and Character Check
  useEffect(() => {
    let unsubscribeAuth: (() => void) | undefined;

    unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/"); // Redirect to home/login if not authenticated
        return;
      }

      if (!activeCharacter) {
        const storedId = localStorage.getItem("rpg_active_char_id");
        if (storedId) {
          router.push("/characters");
        } else {
          router.push("/characters");
        }
      } else {
        setInitializing(false);
      }
    });

    return () => unsubscribeAuth?.();
  }, [activeCharacter, router]);

  // Real-time Synchronization
  useEffect(() => {
    if (!activeCharacter?.id) return;

    let unsubscribeSnapshot: (() => void) | undefined;

    if (!auth.currentUser) return;

    const charRef = doc(
      db,
      "users",
      auth.currentUser.uid,
      "characters",
      activeCharacter.id
    );

    unsubscribeSnapshot = onSnapshot(charRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as Partial<Character>;
        updateActiveCharacter(data);
      }
    });

    return () => unsubscribeSnapshot?.();
  }, [activeCharacter?.id, updateActiveCharacter]);

  if (initializing || !activeCharacter) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-medieval-stone text-medieval-gold">
        Loading Grimoire...
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header / Identity */}
      <header className="bg-medieval-stone/90 border border-medieval-iron/50 p-6 rounded-2xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Shield className="w-32 h-32" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row gap-6 items-center md:items-start">
          <div className="w-24 h-24 bg-black/40 rounded-full border-2 border-medieval-gold flex items-center justify-center shrink-0">
            <span className="text-4xl">🧙‍♂️</span>
          </div>

          <div className="text-center md:text-left flex-1">
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-medieval-gold mb-2">
              {activeCharacter.name}
            </h1>
            <div className="flex flex-wrap gap-3 justify-center md:justify-start text-parchment-light">
              <span className="bg-white/5 px-3 py-1 rounded-full border border-white/10">
                {activeCharacter.race?.name}
              </span>
              <span className="bg-white/5 px-3 py-1 rounded-full border border-white/10">
                {activeCharacter.class?.name}
              </span>
              <span className="bg-medieval-gold/10 px-3 py-1 rounded-full border border-medieval-gold/30 text-medieval-gold">
                Nível {activeCharacter.level}
              </span>
            </div>
          </div>

          {/* Resources / Stats Snapshot */}
          <div className="flex gap-4 shrink-0">
            <div className="flex flex-col items-center p-3 bg-black/30 rounded-lg border border-medieval-iron/30 min-w-[80px]">
              <Coins className="text-yellow-500 mb-1 w-5 h-5" />
              <span className="text-lg font-bold text-parchment-light">
                {activeCharacter.money}
              </span>
              <span className="text-xs text-parchment-dark">Tibares</span>
            </div>
            <div className="flex flex-col items-center p-3 bg-black/30 rounded-lg border border-medieval-iron/30 min-w-[80px]">
              <Heart className="text-red-500 mb-1 w-5 h-5" />
              {/* Placeholder logic for HP */}
              <span className="text-lg font-bold text-parchment-light">
                {10 + (activeCharacter.attributes?.Constituição || 0)}
              </span>
              <span className="text-xs text-parchment-dark">PV</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Attributes Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {Object.entries(activeCharacter.attributes || {}).map(([attr, val]) => (
          <div
            key={attr}
            className="bg-[#1a1a1a] p-3 rounded-xl border border-medieval-iron/30 flex flex-col items-center justify-center aspect-square"
          >
            <span className="text-3xl font-bold text-medieval-gold mb-1">
              {val}
            </span>
            <span className="text-xs text-parchment-dark uppercase tracking-wider">
              {attr}
            </span>
          </div>
        ))}
      </div>

      {/* Detailed Sections Placeholder */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="p-5 bg-medieval-stone/50 border border-medieval-iron/40 rounded-xl min-h-[200px]">
          <h3 className="text-xl font-serif text-parchment-light mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-medieval-gold" /> Habilidades & Poderes
          </h3>
          <ul className="space-y-2">
            {activeCharacter.class?.abilities?.map((ability: any) => (
              <li
                key={ability.name}
                className="text-sm text-parchment-DEFAULT border-b border-medieval-iron/20 pb-2"
              >
                {ability.name}
              </li>
            ))}
            {/* Fallback if class structure is different */}
            {!activeCharacter.class?.abilities && (
              <p className="text-parchment-dark italic">
                Nenhuma habilidade listada.
              </p>
            )}
          </ul>
        </div>
        <div className="p-5 bg-medieval-stone/50 border border-medieval-iron/40 rounded-xl min-h-[200px]">
          <h3 className="text-xl font-serif text-parchment-light mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-medieval-gold" /> Equipamento
          </h3>
          {/* Simplified Bag View */}
          <div className="text-sm text-parchment-DEFAULT">
            Itens na mochila:{" "}
            {activeCharacter.bag?.getSpaces
              ? activeCharacter.bag.getSpaces()
              : 0}{" "}
            Espaços
          </div>
        </div>
      </div>
    </div>
  );
}
