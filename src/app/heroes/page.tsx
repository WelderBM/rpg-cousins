"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CharacterService } from "../../lib/characterService";
import {
  Plus,
  Trash2,
  Shield,
  Sword,
  User,
  Calendar,
  Scroll,
  ChevronRight,
  Loader2,
} from "lucide-react";
import Link from "next/link";

import { auth } from "../../firebaseConfig";

const HeroesPage = () => {
  const [heroes, setHeroes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) return;
    const unsubscribe = auth.onAuthStateChanged((user) => {
      loadHeroes(user);
    });
    return () => unsubscribe?.();
  }, []);

  const loadHeroes = async (user: any) => {
    try {
      setLoading(true);
      const isMestre = localStorage.getItem("mestre_auth") === "true";
      const uid = user?.uid;
      // Fetch characters based on role
      const data = await CharacterService.getCharacters(uid, isMestre);
      setHeroes(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string, path?: string) => {
    if (
      confirm(
        `Tem certeza que deseja deletar ${name}? Esta ação é irreversível.`
      )
    ) {
      try {
        await CharacterService.deleteCharacter(id, path);
        setHeroes((prev) => prev.filter((h) => h.id !== id));
      } catch (error) {
        alert("Erro ao deletar personagem.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 text-neutral-100 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12 border-b border-amber-900/30 pb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-cinzel text-amber-500 mb-2">
              Meus Heróis
            </h1>
            <p className="text-neutral-500 italic">
              Sua guarda pessoal de aventureiros de Arton.
            </p>
          </div>
          <Link
            href="/wizard"
            className="flex items-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-500 text-black font-black font-cinzel rounded-xl transition-all shadow-xl shadow-amber-900/20 active:scale-95 group"
          >
            <Plus
              size={20}
              className="group-hover:rotate-90 transition-transform duration-300"
            />
            Criar Novo Herói
          </Link>
        </div>

        {/* State Handling */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <Loader2 className="w-12 h-12 text-amber-500 animate-spin" />
            <p className="text-amber-500/50 font-cinzel animate-pulse">
              Consultando os pergaminhos...
            </p>
          </div>
        ) : heroes.length === 0 ? (
          <div className="text-center py-32 bg-neutral-900/20 border-2 border-dashed border-neutral-800 rounded-3xl">
            <Scroll size={64} className="mx-auto text-neutral-700 mb-4" />
            <h3 className="text-2xl font-cinzel text-neutral-400 mb-2">
              Salão de Heróis Vazio
            </h3>
            <p className="text-neutral-600 max-w-md mx-auto mb-8">
              Nenhum aventureiro ainda ousou registrar seu nome neste portal.
            </p>
            <Link
              href="/wizard"
              className="text-amber-500 hover:text-amber-400 underline decoration-amber-900/50 underline-offset-8 transition-colors"
            >
              Começar minha primeira jornada &rarr;
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {heroes.map((hero, index) => (
                <motion.div
                  key={hero.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.1 }}
                  className="group relative bg-neutral-900/40 border border-neutral-800 rounded-2xl overflow-hidden hover:border-amber-700/50 transition-all shadow-lg hover:shadow-amber-900/10"
                >
                  {/* Decorative Elements */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 -mr-16 -mt-16 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-colors" />

                  {/* Card Content */}
                  <div className="p-6 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-2xl font-cinzel text-amber-100 group-hover:text-amber-500 transition-colors line-clamp-1">
                          {hero.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded uppercase font-bold tracking-widest">
                            Nível {hero.level || 1}
                          </span>
                          <span className="text-neutral-600">•</span>
                          <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">
                            {hero.raceName} {hero.className}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          handleDelete(hero.id, hero.name, hero.path)
                        }
                        className="p-2 text-neutral-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                        title="Deletar"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    {/* Stats Ribbon */}
                    <div className="grid grid-cols-3 gap-2 py-4 border-y border-neutral-800/50">
                      <div className="text-center">
                        <p className="text-[8px] text-neutral-500 uppercase font-bold">
                          Força
                        </p>
                        <p className="text-lg font-cinzel text-neutral-300">
                          {hero.attributes?.Força >= 0
                            ? `+${hero.attributes.Força}`
                            : hero.attributes?.Força}
                        </p>
                      </div>
                      <div className="text-center border-x border-neutral-800/50">
                        <p className="text-[8px] text-neutral-500 uppercase font-bold">
                          Destreza
                        </p>
                        <p className="text-lg font-cinzel text-neutral-300">
                          {hero.attributes?.Destreza >= 0
                            ? `+${hero.attributes.Destreza}`
                            : hero.attributes?.Destreza}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-[8px] text-neutral-500 uppercase font-bold">
                          Carisma
                        </p>
                        <p className="text-lg font-cinzel text-neutral-300">
                          {hero.attributes?.Carisma >= 0
                            ? `+${hero.attributes.Carisma}`
                            : hero.attributes?.Carisma}
                        </p>
                      </div>
                    </div>

                    {/* Details Info */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-neutral-400">
                        <Shield size={14} className="text-amber-700" />
                        <span className="text-xs">
                          {hero.originName || "Sem Origem"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-neutral-400">
                        <Sword size={14} className="text-amber-700" />
                        <span className="text-xs">
                          {hero.deityName || "Ateu"}
                        </span>
                      </div>
                    </div>

                    {/* View Sheet Button */}
                    <button className="w-full py-3 mt-4 bg-neutral-950 border border-neutral-800 text-neutral-400 flex justify-center items-center gap-2 rounded-xl group-hover:bg-neutral-800 group-hover:text-amber-100 transition-all font-bold text-sm">
                      Ver Ficha Completa
                      <ChevronRight
                        size={16}
                        className="group-hover:translate-x-1 transition-transform"
                      />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default HeroesPage;
