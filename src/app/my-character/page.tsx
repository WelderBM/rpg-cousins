"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCharacterStore } from "@/store/useCharacterStore";
import { Character } from "@/interfaces/Character";
import { Shield } from "lucide-react";
import { doc, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/firebaseConfig";
import { motion } from "framer-motion";
import { CharacterService } from "@/lib/characterService";
import { getRaceByName } from "@/data/racas";
import CLASSES from "@/data/classes";
import { CharacterSheetView } from "@/components/character/CharacterSheetView";

export default function MyCharacterPage() {
  const router = useRouter();
  const { activeCharacter, updateActiveCharacter } = useCharacterStore();
  const [initializing, setInitializing] = useState(true);

  // Authentication and Character Check
  useEffect(() => {
    if (!auth) return;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/");
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

    return () => unsubscribeAuth();
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

        // Hydration Logic
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
              data.class = JSON.parse(JSON.stringify(foundClass));
            }
          } catch (e) {
            console.error("Failed to hydrate class:", e);
          }
        }

        updateActiveCharacter(data);
      }
    });

    return () => unsubscribeSnapshot();
  }, [activeCharacter?.id, updateActiveCharacter]);

  const handleUpdate = async (updates: Partial<Character>) => {
    if (!auth?.currentUser || !activeCharacter) return;

    // Optimistic UI update
    updateActiveCharacter(updates);

    try {
      await CharacterService.updateCharacter(
        auth.currentUser.uid,
        activeCharacter.id!,
        updates
      );
    } catch (e) {
      console.error("Failed to update character", e);
      alert("Erro ao sincronizar com o servidor.");
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

  return (
    <CharacterSheetView
      character={activeCharacter}
      onUpdate={handleUpdate}
      isMestre={false}
    />
  );
}
