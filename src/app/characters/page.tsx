"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCharacterStore } from "@/store/useCharacterStore";
import { Character } from "@/interfaces/Character";
import { motion } from "framer-motion";
import {
  User,
  Sword,
  ArrowRight,
  Trash2,
  AlertTriangle,
  Heart,
} from "lucide-react";
import { CharacterService } from "@/lib/characterService";

export default function CharacterSelectPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const {
    userCharacters,
    setUserCharacters,
    setActiveCharacter,
    activeCharacter,
    clearActiveCharacter,
  } = useCharacterStore();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [characterToDelete, setCharacterToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [togglingFavorite, setTogglingFavorite] = useState<string | null>(null);

  useEffect(() => {
    let authUnsubscribe: (() => void) | undefined;
    let charsUnsubscribe: (() => void) | undefined;

    (async () => {
      const { onAuthStateChanged } = await import("firebase/auth");
      const { auth } = await import("@/firebaseConfig");
      const { collection, query, onSnapshot } = await import(
        "firebase/firestore"
      );
      const { db } = await import("@/firebaseConfig");

      if (auth && db) {
        authUnsubscribe = onAuthStateChanged(auth, (user) => {
          if (user) {
            setCurrentUser(user);
            setLoading(true);

            if (charsUnsubscribe) charsUnsubscribe();

            const q = query(collection(db, "users", user.uid, "characters"));
            charsUnsubscribe = onSnapshot(
              q,
              (querySnapshot) => {
                const chars: any[] = [];
                querySnapshot.forEach((doc) => {
                  chars.push({ id: doc.id, ...doc.data() });
                });

                const summaryList = chars.map((c) => ({
                  id: c.id,
                  name: c.name,
                  raceName: c.race?.name || "Desconhecido",
                  className: c.class?.name || "Desconhecido",
                  level: c.level || 1,
                  isFavorite: c.isFavorite || false,
                  imageUrl: c.imageUrl,
                }));

                setUserCharacters(summaryList);
                setLoading(false);
              },
              (error) => {
                console.error("Error fetching chars", error);
                setLoading(false);
              }
            );
          } else {
            setCurrentUser(null);
            setUserCharacters([]);
            setLoading(false);
          }
        });
      }
    })();

    return () => {
      if (authUnsubscribe) authUnsubscribe();
      if (charsUnsubscribe) charsUnsubscribe();
    };
  }, [setUserCharacters]);

  const handleToggleFavorite = async (e: React.MouseEvent, char: any) => {
    e.stopPropagation();
    if (!currentUser || togglingFavorite) return;

    setTogglingFavorite(char.id);
    try {
      await CharacterService.setFavoriteCharacter(
        currentUser.uid,
        char.id,
        char.isFavorite
      );
    } catch (e) {
      console.error("Error toggling favorite", e);
    } finally {
      setTogglingFavorite(null);
    }
  };

  const handleSelectCharacter = async (charId: string) => {
    if (!currentUser) return;

    try {
      const { doc, getDoc } = await import("firebase/firestore");
      const { db } = await import("@/firebaseConfig");

      // Finding the character in the DB
      const charRef = doc(
        db as any,
        "users",
        currentUser.uid,
        "characters",
        charId
      );
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

  const handleDeleteCharacter = async () => {
    if (!currentUser || !characterToDelete) return;

    setIsDeleting(true);
    try {
      await CharacterService.deleteCharacter(
        characterToDelete.id,
        "users/" + currentUser.uid + "/characters/" + characterToDelete.id
      );

      // If the deleted character was the active one, clear it
      if (activeCharacter?.id === characterToDelete.id) {
        clearActiveCharacter();
        localStorage.removeItem("rpg_active_char_id");
      }

      setCharacterToDelete(null);
    } catch (error) {
      console.error("Error deleting character:", error);
      alert("Erro ao apagar herói. Tente novamente.");
    } finally {
      setIsDeleting(false);
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
        {!currentUser && !loading && (
          <div className="col-span-full py-8 text-center text-parchment-DEFAULT border border-dashed border-medieval-iron/50 rounded-xl bg-black/20 mb-4">
            <p className="text-xl font-serif text-medieval-gold mb-2">
              Aventureiro Anônimo
            </p>
            <p className="text-sm opacity-70 max-w-md mx-auto">
              Seus heróis não serão salvos na nuvem se você não estiver logado.
              Use o menu lateral para entrar em sua conta.
            </p>
          </div>
        )}
        {userCharacters.map((char) => (
          <motion.div
            key={char.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="group relative bg-[#1e1e1e] border-2 border-medieval-iron rounded-xl overflow-hidden hover:border-medieval-gold transition-all duration-300 shadow-lg cursor-pointer flex flex-col"
            onClick={() => handleSelectCharacter(char.id)}
          >
            {/* Top Buttons: Delete and Favorite */}
            <div className="absolute top-2 right-2 z-20 flex gap-2">
              <button
                onClick={(e) => handleToggleFavorite(e, char)}
                disabled={togglingFavorite === char.id}
                className={`p-2 rounded-full transition-all shadow-lg border backdrop-blur-sm ${
                  char.isFavorite
                    ? "text-red-500 bg-red-500/10 border-red-500/50"
                    : "text-stone-500 bg-black/60 border-stone-800 hover:text-red-400"
                }`}
                title={char.isFavorite ? "Desativar Herói" : "Ativar Herói"}
              >
                <Heart
                  size={18}
                  fill={char.isFavorite ? "currentColor" : "none"}
                />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCharacterToDelete({ id: char.id, name: char.name });
                }}
                className="p-2 text-red-500/70 hover:text-red-400 bg-black/60 rounded-full hover:bg-black/80 transition-colors shadow-lg border border-red-500/20"
                title="Apagar Herói"
              >
                <Trash2 size={18} />
              </button>
            </div>
            {/* Character Card Content */}
            <div className="p-6 flex flex-row items-center gap-4 relative z-10">
              <div
                className={`h-16 w-16 rounded-full border flex items-center justify-center text-2xl transition-colors overflow-hidden ${
                  char.isFavorite
                    ? "bg-amber-500/10 border-amber-500"
                    : "bg-medieval-stone border-medieval-gold/30"
                }`}
              >
                {char.imageUrl ? (
                  <img
                    src={char.imageUrl}
                    alt={char.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User
                    className={
                      char.isFavorite
                        ? "text-amber-500"
                        : "text-medieval-gold opacity-80"
                    }
                  />
                )}
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
          onClick={() => router.push("/herois?tab=novo-heroi")}
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
      {/* Confirmation Modal */}
      {characterToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#1e1e1e] border-2 border-medieval-iron p-8 rounded-2xl max-w-md w-full shadow-2xl"
          >
            <div className="flex items-center gap-4 text-red-500 mb-6 font-serif">
              <AlertTriangle size={32} />
              <h2 className="text-2xl font-bold">Apagar Herói?</h2>
            </div>

            <p className="text-parchment-DEFAULT mb-8 text-lg">
              Tem certeza que deseja apagar{" "}
              <span className="text-medieval-gold font-bold">
                {characterToDelete.name}
              </span>
              ?
              <br />
              <span className="text-sm text-red-400/80 mt-2 block italic">
                Esta ação é permanente e não pode ser desfeita.
              </span>
            </p>

            <div className="flex gap-4">
              <button
                onClick={() => setCharacterToDelete(null)}
                disabled={isDeleting}
                className="flex-1 py-3 px-6 rounded-xl border border-medieval-iron text-parchment-DEFAULT hover:bg-white/5 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteCharacter}
                disabled={isDeleting}
                className="flex-1 py-3 px-6 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition-all shadow-lg shadow-red-900/20 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Trash2 size={18} />
                    Apagar
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
