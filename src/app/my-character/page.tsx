"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCharacterStore } from "@/store/useCharacterStore";
import { Character } from "@/interfaces/Character";
import { Shield, User } from "lucide-react";
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
  const { activeCharacter, setActiveCharacter, updateActiveCharacter } =
    useCharacterStore();
  const [initializing, setInitializing] = useState(true);
  const [noFavorite, setNoFavorite] = useState(false);

  // Authentication and Character Check
  useEffect(() => {
    if (!auth) return;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/");
        return;
      }

      // Prioritize the last selected character from localStorage
      const storedCharId = localStorage.getItem("rpg_active_char_id");

      try {
        const { doc, getDoc, collection, query, where, getDocs } = await import(
          "firebase/firestore"
        );
        const { db } = await import("@/firebaseConfig");

        let charData: Character | null = null;

        // 1. Try to load the selected character
        if (storedCharId) {
          const charRef = doc(
            db!,
            "users",
            user.uid,
            "characters",
            storedCharId
          );
          const charSnap = await getDoc(charRef);
          if (charSnap.exists()) {
            charData = { id: charSnap.id, ...charSnap.data() } as Character;
          }
        }

        // 2. If no selected character (or invalid ID), fallback to Favorite as a default
        if (!charData) {
          const q = query(
            collection(db!, "users", user.uid, "characters"),
            where("isFavorite", "==", true)
          );
          const snapshot = await getDocs(q);
          if (!snapshot.empty) {
            const charDoc = snapshot.docs[0];
            charData = { id: charDoc.id, ...charDoc.data() } as Character;
            // Update storage to remember this default
            localStorage.setItem("rpg_active_char_id", charDoc.id);
          }
        }

        if (charData) {
          setActiveCharacter(charData);
          setInitializing(false);
          setNoFavorite(false);
        } else {
          // No character selected and no favorite found
          setNoFavorite(true);
          setInitializing(false);
        }
      } catch (e) {
        console.error("Error fetching character:", e);
        setInitializing(false);
        setNoFavorite(true);
      }
    });

    return () => unsubscribeAuth();
  }, [router, setActiveCharacter]); // Only run on mount or auth change

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

  if (initializing) {
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

  if (noFavorite && !activeCharacter) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center p-6 font-sans">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl w-full text-center space-y-12"
        >
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-amber-500/10 blur-3xl rounded-full" />
            <div className="relative bg-stone-900 border border-stone-800 p-8 rounded-full shadow-2xl">
              <User className="w-16 h-16 text-amber-500 animate-pulse" />
            </div>
          </div>

          <div>
            <h1 className="text-4xl md:text-5xl font-serif text-amber-500 mb-4 drop-shadow-sm">
              Nenhum Herói Selecionado
            </h1>
            <p className="text-stone-400 text-lg max-w-lg mx-auto leading-relaxed">
              Para visualizar os detalhes do seu herói aqui, você precisa
              selecioná-lo na lista de personagens.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                step: "1",
                title: "Acesse",
                desc: "Vá para a lista de 'Meus Heróis'",
              },
              {
                step: "2",
                title: "Escolha",
                desc: "Clique no card do personagem que deseja jogar",
              },
              {
                step: "3",
                title: "Pronto!",
                desc: "Os detalhes do seu herói aparecerão aqui",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-stone-900/50 backdrop-blur-sm p-6 border border-stone-800 rounded-2xl relative overflow-hidden group hover:border-amber-500/50 transition-colors"
              >
                <div className="absolute -top-2 -right-2 text-6xl font-black text-stone-800/30 group-hover:text-amber-500/10 transition-colors">
                  {item.step}
                </div>
                <span className="text-amber-500 font-bold block mb-2 text-xl font-serif">
                  {item.title}
                </span>
                <p className="text-stone-400 text-sm leading-snug">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>

          <div className="bg-amber-900/10 border border-amber-900/30 p-6 rounded-2xl flex items-start gap-4 text-left max-w-xl mx-auto shadow-inner">
            <div className="bg-amber-500/10 p-2 rounded-lg">
              <Shield className="text-amber-500 shrink-0" size={24} />
            </div>
            <div>
              <p className="text-stone-300 leading-relaxed">
                <strong className="text-amber-500 block mb-1">Dica:</strong>
                Você pode selecionar qualquer herói para jogar. Apenas heróis
                marcados como{" "}
                <span className="text-amber-400 font-semibold italic">
                  Favorito
                </span>{" "}
                (na criação ou edição) aparecem para o Mestre.
              </p>
            </div>
          </div>

          <button
            onClick={() => router.push("/characters")}
            className="px-10 py-4 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold rounded-xl transition-all shadow-lg hover:shadow-amber-500/20 active:scale-95 text-lg"
          >
            Ver meus personagens
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <CharacterSheetView
      character={activeCharacter!}
      onUpdate={handleUpdate}
      isMestre={false}
    />
  );
}
