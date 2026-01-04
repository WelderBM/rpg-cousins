"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCharacterStore, Character } from "@/store/useCharacterStore";
import { motion } from "framer-motion";
import { User, Sword, ArrowRight } from "lucide-react";

export default function CharacterSelectPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const { userCharacters, setUserCharacters, setActiveCharacter } =
    useCharacterStore();
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    (async () => {
      const { onAuthStateChanged } = await import("firebase/auth");
      const { auth } = await import("@/firebaseConfig");

      unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          setCurrentUser(user);
          fetchCharacters(user.uid);
        } else {
          setLoading(false);
        }
      });
    })();

    return () => unsubscribe?.();
  }, [setUserCharacters]);

  const fetchCharacters = async (uid: string) => {
    try {
      setLoading(true);
      const { collection, query, onSnapshot } = await import(
        "firebase/firestore"
      );
      const { db } = await import("@/firebaseConfig");

      const q = query(collection(db, "users", uid, "characters"));
      // Using onSnapshot for real-time list updates
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const chars: any[] = [];
        querySnapshot.forEach((doc) => {
          chars.push({ id: doc.id, ...doc.data() });
        });

        // Map to summary for the list
        const summaryList = chars.map((c) => ({
          id: c.id,
          name: c.name,
          raceName: c.race?.name || "Desconhecido",
          className: c.class?.name || "Desconhecido",
          level: c.level || 1,
        }));

        setUserCharacters(summaryList);
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (error) {
      console.error("Error fetching characters:", error);
      setLoading(false);
    }
  };

  const handleSelectCharacter = async (charId: string) => {
    if (!currentUser) return;

    // In a real app we might fetch the full details here if list only had summary
    // But for now, we'll fetch single doc to be sure we have everything
    // Actually, we can just get it from the store if we loaded full data,
    // but the list state is 'CharacterSummary'.
    // Let's fetch the full document to be safe and robust.

    try {
      // We will navigate to dashboard, and dashboard will handle loading/subscribing?
      // OR we load it here.
      // The prompt says: "Atualize o selectedCharacter no Zustand store com os dados desse herói."
      // So we load it here.

      // However, for the 'sync' feature, the dashboard should probably subscribe.
      // Let's just set the ID or basic info, and let dashboard subscribe?
      // No, user said: "Ao clicar: Atualize o selectedCharacter... Redirecione..."

      // We'll read the doc once here to set initial state, then redirect.
      // The dashboard can then set up the listener.

      // Wait, if I read it here, and then redirect, the dashboard will mount.
      // If I want real-time sync while playing, the dashboard needs the listener.

      // Let's implement a 'load' function that fetches and sets.
      // We'll assume the characters collection has the full data.

      // Finding the character in the DB
      const { doc, getDoc } = await import("firebase/firestore");
      const charRef = doc(db, "users", currentUser.uid, "characters", charId);
      const charSnap = await getDoc(charRef);

      if (charSnap.exists()) {
        const charData = { id: charSnap.id, ...charSnap.data() } as Character;
        setActiveCharacter(charData);

        // Store ID in localStorage for persistence
        localStorage.setItem("rpg_active_char_id", charId);

        router.push("/my-character");
      }
    } catch (e) {
      console.error("Error selecting character", e);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-medieval-gold">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medieval-gold"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-serif text-medieval-gold mb-8 text-center drop-shadow-lg">
        Meus Heróis
      </h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {userCharacters.map((char) => (
          <motion.div
            key={char.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="group relative bg-[#1e1e1e] border-2 border-medieval-iron rounded-xl overflow-hidden hover:border-medieval-gold transition-all duration-300 shadow-lg cursor-pointer flex flex-col"
            onClick={() => handleSelectCharacter(char.id)}
          >
            {/* Character Card Content */}
            <div className="p-6 flex flex-row items-center gap-4 relative z-10">
              <div className="h-16 w-16 bg-medieval-stone rounded-full border border-medieval-gold/30 flex items-center justify-center text-2xl">
                {/* Placeholder Avatar based on Race or Class */}
                <User className="text-medieval-gold opacity-80" />
              </div>

              <div className="flex-1">
                <h3 className="text-xl font-bold text-parchment-light group-hover:text-medieval-gold transition-colors">
                  {char.name}
                </h3>
                <div className="text-sm text-parchment-dark flex flex-col">
                  <span>
                    {char.raceName} • {char.className}
                  </span>
                  <span className="text-xs mt-1 text-medieval-iron">
                    Nível {char.level}
                  </span>
                </div>
              </div>

              <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute right-4">
                <ArrowRight className="text-medieval-gold w-6 h-6" />
              </div>
            </div>

            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="bg-black/40 p-3 border-t border-medieval-iron/30 flex justify-between items-center px-6">
              <span className="text-xs text-parchment-dark/70 uppercase tracking-widest">
                Clique para jogar
              </span>
              <span className="text-xs text-medieval-gold font-bold">
                Selecionar
              </span>
            </div>
          </motion.div>
        ))}

        {/* Add New Character Card */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push("/wizard")}
          className="min-h-[140px] bg-medieval-stone/30 border-2 border-dashed border-medieval-iron/50 rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-medieval-gold/5 hover:border-medieval-gold/50 transition-all group"
        >
          <div className="p-3 rounded-full bg-black/20 group-hover:bg-medieval-gold/20 transition-colors">
            <Sword className="w-6 h-6 text-medieval-iron group-hover:text-medieval-gold transition-colors" />
          </div>
          <span className="font-serif text-parchment-dark group-hover:text-medieval-gold transition-colors">
            Criar Novo Herói
          </span>
        </motion.div>
      </div>
    </div>
  );
}
