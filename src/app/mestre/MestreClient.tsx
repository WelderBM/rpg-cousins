"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldAlert,
  Plus,
  List,
  Lock,
  Search,
  LayoutGrid,
  Eye,
  Crown,
  Star,
  Swords,
  Trash,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import {
  ThreatSheet,
  ThreatType,
  ThreatSize,
  ThreatRole,
  ChallengeLevel,
  TreasureLevel,
  ResistanceType,
} from "@/interfaces/ThreatSheet";
import {
  calculateCombatStats,
  calculateAllSkills,
  createDefaultAttributes,
} from "@/functions/threatGenerator";

// Import New Components
import { ThreatBasicInfo } from "@/components/mestre/ThreatBasicInfo";
import { ThreatCombatStats } from "@/components/mestre/ThreatCombatStats";
import { ThreatAttacks } from "@/components/mestre/ThreatAttacks";
import { ThreatAbilities } from "@/components/mestre/ThreatAbilities";
import { ThreatSkills } from "@/components/mestre/ThreatSkills";
import { MonsterStatBlock } from "@/components/mestre/MonsterStatBlock";
import { ThreatPreviewCard } from "@/components/mestre/ThreatPreviewCard";
import { CharacterPreviewCard } from "@/components/characters/CharacterPreviewCard";
import { CharacterSheetView } from "@/components/character/CharacterSheetView";
import { Character } from "@/interfaces/Character";
import { CharacterService } from "@/lib/characterService";

// Password for DM area
const MESTRE_PASSWORD = "mestre-cousins";

type Tab = "lista" | "criador" | "herois";

export default function MestreClient() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("lista");
  const [threats, setThreats] = useState<ThreatSheet[]>([]);
  const [heroes, setHeroes] = useState<Character[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedHero, setSelectedHero] = useState<Character | null>(null);

  // Real-time synchronization for active heroes
  useEffect(() => {
    if (!isAuthenticated || activeTab !== "herois") return;

    let unsubscribe: () => void;
    setIsLoading(true);

    const setupHeroSync = async () => {
      try {
        const { collectionGroup, query, where, onSnapshot } = await import(
          "firebase/firestore"
        );
        const { db } = await import("@/firebaseConfig");

        if (!db) return;

        // Query all characters across all users where isFavorite is true
        const q = query(
          collectionGroup(db, "characters"),
          where("isFavorite", "==", true)
        );

        unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            const fetchedHeroes = snapshot.docs.map((doc) => ({
              id: doc.id,
              path: doc.ref.path,
              ...(doc.data() as any),
            })) as Character[];
            setHeroes(fetchedHeroes);
            setIsLoading(false);
          },
          (error) => {
            console.error("Hero sync failed:", error);
            setIsLoading(false);
          }
        );
      } catch (e) {
        console.error("Error setting up hero sync:", e);
        setIsLoading(false);
      }
    };

    setupHeroSync();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [isAuthenticated, activeTab]);

  // Keep selectedHero in sync with heroes list
  useEffect(() => {
    if (selectedHero) {
      const updated = heroes.find((h) => h.id === selectedHero.id);
      if (updated && JSON.stringify(updated) !== JSON.stringify(selectedHero)) {
        setSelectedHero(updated);
      } else if (!updated && heroes.length > 0) {
        // If the favorite was removed, deselect it
        setSelectedHero(null);
      }
    }
  }, [heroes, selectedHero]);

  // Form State
  const [formData, setFormData] = useState<Partial<ThreatSheet>>({
    name: "",
    type: ThreatType.MONSTRO,
    size: ThreatSize.MEDIO,
    role: ThreatRole.SOLO,
    challengeLevel: ChallengeLevel.ONE,
    displacement: "9m",
    hasManaPoints: false,
    attacks: [],
    abilities: [],
    attributes: createDefaultAttributes(),
    resistanceAssignments: {
      Fortitude: ResistanceType.MEDIUM,
      Reflexos: ResistanceType.MEDIUM,
      Vontade: ResistanceType.MEDIUM,
    },
    equipment: "",
    treasureLevel: TreasureLevel.STANDARD,
    imageUrl: "",
  });

  const [step, setStep] = useState(1);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showMobilePreview, setShowMobilePreview] = useState(false);

  // Authentication Check
  useEffect(() => {
    const authStatus = localStorage.getItem("mestre_auth");
    if (authStatus === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === MESTRE_PASSWORD) {
      setIsAuthenticated(true);
      localStorage.setItem("mestre_auth", "true");
    } else {
      alert("Senha incorreta!");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("mestre_auth");
  };

  // Fetch Threats
  const fetchThreats = async () => {
    setIsLoading(true);
    try {
      const { collection, getDocs, query, orderBy } = await import(
        "firebase/firestore"
      );
      const { db } = await import("@/firebaseConfig");

      if (!db) return;

      const q = query(collection(db, "threats"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const fetchedThreats = querySnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as ThreatSheet[];
      setThreats(fetchedThreats);
    } catch (error) {
      console.error("Error fetching threats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchThreats();
    }
  }, [isAuthenticated]);

  // Smooth scroll to top on step or tab change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step, activeTab]);

  // Handle Auto-calculation of Combat Stats
  useEffect(() => {
    if (formData.challengeLevel && formData.role) {
      try {
        const stats = calculateCombatStats(
          formData.role as ThreatRole,
          formData.challengeLevel as ChallengeLevel,
          formData.hasManaPoints
        );

        // Only update if stats changed to avoid infinite loop
        if (JSON.stringify(stats) !== JSON.stringify(formData.combatStats)) {
          setFormData((prev) => ({
            ...prev,
            combatStats: stats,
            // Also recalculate skills when ND/Role changes
            skills: calculateAllSkills(
              prev.challengeLevel as ChallengeLevel,
              prev.attributes!,
              prev.skills || [],
              prev.resistanceAssignments,
              stats
            ),
          }));
        }
      } catch (err) {
        console.error(err);
      }
    }
  }, [
    formData.challengeLevel,
    formData.role,
    formData.hasManaPoints,
    JSON.stringify(formData.attributes),
    JSON.stringify(formData.resistanceAssignments),
  ]);

  const handleSaveThreat = async () => {
    if (!formData.name) {
      alert("Nome é obrigatório!");
      return;
    }

    setIsSaving(true);
    try {
      const { collection, addDoc, updateDoc, doc, Timestamp } = await import(
        "firebase/firestore"
      );
      const { db } = await import("@/firebaseConfig");

      if (!db) {
        alert("Erro ao conectar com o banco de dados.");
        return;
      }

      const dataToSave = {
        ...formData,
        updatedAt: Timestamp.now(),
      };

      if (editingId) {
        await updateDoc(doc(db, "threats", editingId), dataToSave);
      } else {
        await addDoc(collection(db, "threats"), {
          ...dataToSave,
          createdAt: Timestamp.now(),
        });
      }

      alert("Ameaça salva com sucesso!");
      resetForm();
      setActiveTab("lista");
      fetchThreats();
    } catch (error) {
      console.error("Error saving threat:", error);
      alert("Erro ao salvar ameaça.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteThreat = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta ameaça?")) return;

    try {
      const { doc, deleteDoc } = await import("firebase/firestore");
      const { db } = await import("@/firebaseConfig");

      if (!db) return;

      await deleteDoc(doc(db, "threats", id));
      fetchThreats();
    } catch (error) {
      console.error("Error deleting threat:", error);
    }
  };

  const handleEditThreat = (threat: ThreatSheet) => {
    setFormData(threat);
    setEditingId(threat.id);
    setActiveTab("criador");
    setStep(1);
    // Scroll to top
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleDuplicateThreat = (threat: ThreatSheet) => {
    const duplicated = {
      ...threat,
      name: `${threat.name} (Cópia)`,
      id: undefined,
    };
    delete (duplicated as any).id;
    setFormData(duplicated);
    setEditingId(null);
    setActiveTab("criador");
    setStep(1);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      type: ThreatType.MONSTRO,
      size: ThreatSize.MEDIO,
      role: ThreatRole.SOLO,
      challengeLevel: ChallengeLevel.ONE,
      displacement: "9m",
      hasManaPoints: false,
      attacks: [],
      abilities: [],
      attributes: createDefaultAttributes(),
      resistanceAssignments: {
        Fortitude: ResistanceType.MEDIUM,
        Reflexos: ResistanceType.MEDIUM,
        Vontade: ResistanceType.MEDIUM,
      },
      equipment: "",
      treasureLevel: TreasureLevel.STANDARD,
      imageUrl: "",
    });
    setEditingId(null);
    setStep(1);
  };

  const filteredThreats = threats.filter(
    (t) =>
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const favoriteThreats = threats.filter((t) => t.isFavorite);

  const handleToggleFavorite = async (id: string, isFavorite: boolean) => {
    // Update local state first for immediate UI feedback
    setThreats((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isFavorite } : t))
    );

    try {
      const { doc, updateDoc } = await import("firebase/firestore");
      const { db } = await import("@/firebaseConfig");
      if (!db) return;

      await updateDoc(doc(db, "threats", id), {
        isFavorite: isFavorite,
      });
    } catch (e) {
      console.error("Error updating favorite status:", e);
    }
  };

  const handleClearCombat = async () => {
    if (
      !confirm("Deseja encerrar o combate e limpar todos os monstros ativos?")
    )
      return;

    const favoriteIds = favoriteThreats.map((t) => t.id);

    // Update local state
    setThreats((prev) =>
      prev.map((t) =>
        favoriteIds.includes(t.id) ? { ...t, isFavorite: false } : t
      )
    );

    try {
      const { doc, updateDoc, writeBatch } = await import("firebase/firestore");
      const { db } = await import("@/firebaseConfig");
      if (!db) return;

      const batch = writeBatch(db);
      favoriteIds.forEach((id) => {
        batch.update(doc(db, "threats", id), { isFavorite: false });
      });
      await batch.commit();
    } catch (e) {
      console.error("Error clearing combat:", e);
    }
  };

  const handleUpdateHero = async (updates: Partial<Character>) => {
    if (!selectedHero) return;

    // Local update
    const updatedHero = { ...selectedHero, ...updates };
    setSelectedHero(updatedHero);
    setHeroes((prev) =>
      prev.map((h) => (h.id === selectedHero.id ? updatedHero : h))
    );

    try {
      // If we have a path (which getCharacters returns as 'path'), use it
      if ((selectedHero as any).path) {
        await CharacterService.updateCharacterByPath(
          (selectedHero as any).path,
          updates
        );
      } else {
        console.error("No path found for character", selectedHero);
      }
    } catch (e) {
      console.error("Failed to update hero", e);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-medieval-stone/90 p-8 rounded-2xl border border-medieval-iron shadow-2xl w-full max-w-md"
        >
          <div className="flex flex-col items-center mb-6">
            <div className="p-4 bg-medieval-gold/10 rounded-full mb-4">
              <Lock className="w-12 h-12 text-medieval-gold" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-parchment-DEFAULT">
              Sala do Mestre
            </h2>
            <p className="text-parchment-dark text-sm mt-2 text-center">
              Digite a senha para acessar as ferramentas de mestre.
            </p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              placeholder="Senha do Mestre"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/40 border border-medieval-iron/50 rounded-lg px-4 py-3 text-parchment-light focus:border-medieval-gold focus:ring-1 focus:ring-medieval-gold outline-none transition-all"
              autoFocus
            />
            <button
              type="submit"
              className="w-full bg-medieval-gold hover:bg-amber-500 text-black font-bold py-3 rounded-lg transition-colors shadow-lg"
            >
              Entrar
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  // Define steps configuration
  const stepsConfig = [
    { title: "Básico", component: ThreatBasicInfo },
    { title: "Combate", component: ThreatCombatStats },
    { title: "Ataques", component: ThreatAttacks },
    { title: "Habilidades", component: ThreatAbilities },
    { title: "Finalizar", component: ThreatSkills },
  ];

  const CurrentStepComponent = stepsConfig[step - 1].component;

  return (
    <div className="w-full mx-auto space-y-8 min-h-screen pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-medieval-iron/30 pb-6">
        <div>
          <h1 className="font-serif text-3xl font-bold text-medieval-gold flex items-center gap-3">
            <ShieldAlert className="w-8 h-8" />
            Ferramentas do Mestre
          </h1>
          <p className="text-parchment-dark mt-1">
            Gerencie ameaças, balanceie encontros e crie monstros épicos.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleLogout}
            className="px-4 py-2 border border-medieval-blood/30 text-medieval-blood hover:bg-medieval-blood/10 rounded-lg text-sm transition-all"
          >
            Sair
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-medieval-iron/30">
        <button
          onClick={() => {
            setActiveTab("lista");
            setSelectedHero(null);
          }}
          className={`px-6 py-3 font-serif text-lg transition-all border-b-2 flex items-center gap-2 ${
            activeTab === "lista"
              ? "border-medieval-gold text-medieval-gold bg-medieval-gold/5"
              : "border-transparent text-parchment-dark hover:text-parchment-light hover:bg-white/5"
          }`}
        >
          <List className="w-5 h-5" />
          Grimório de Monstros
        </button>
        <button
          onClick={() => {
            setActiveTab("herois");
            setSelectedHero(null);
          }}
          className={`px-6 py-3 font-serif text-lg transition-all border-b-2 flex items-center gap-2 ${
            activeTab === "herois"
              ? "border-medieval-gold text-medieval-gold bg-medieval-gold/5"
              : "border-transparent text-parchment-dark hover:text-parchment-light hover:bg-white/5"
          }`}
        >
          <Crown className="w-5 h-5" />
          Heróis Ativos
        </button>
        <button
          onClick={() => {
            setActiveTab("criador");
            setSelectedHero(null);
          }}
          className={`px-6 py-3 font-serif text-lg transition-all border-b-2 flex items-center gap-2 ${
            activeTab === "criador"
              ? "border-medieval-gold text-medieval-gold bg-medieval-gold/5"
              : "border-transparent text-parchment-dark hover:text-parchment-light hover:bg-white/5"
          }`}
        >
          {editingId ? (
            <LayoutGrid className="w-5 h-5" />
          ) : (
            <Plus className="w-5 h-5" />
          )}
          {editingId ? "Editando Monstros" : "Criar Monstro"}
        </button>
      </div>

      {/* Content */}
      <div className="min-h-[60vh] relative">
        <AnimatePresence mode="wait">
          {activeTab === "lista" ? (
            <motion.div
              key="lista"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              {/* Search and Filters */}
              <div className="flex flex-col md:flex-row gap-4 bg-medieval-stone/40 p-4 rounded-xl border border-medieval-iron/30 shadow-inner">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-medieval-iron" />
                  <input
                    type="text"
                    placeholder="Buscar ameaça por nome, tipo ou ND..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-black/40 border border-medieval-iron/50 rounded-lg pl-10 pr-4 py-2 text-parchment-light focus:border-medieval-gold outline-none transition-all placeholder-medieval-iron"
                  />
                </div>
              </div>

              {/* Combate Ativo (Pinned Stars) */}
              {favoriteThreats.length > 0 && (
                <div className="bg-medieval-blood/5 border border-medieval-blood/20 rounded-2xl p-6 mb-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                    <Swords size={120} />
                  </div>

                  <div className="flex justify-between items-center mb-6 relative z-10">
                    <h2 className="font-serif text-2xl font-bold text-medieval-gold flex items-center gap-3">
                      <Swords className="text-medieval-blood" />
                      Combate Ativo
                    </h2>
                    <button
                      onClick={handleClearCombat}
                      className="flex items-center gap-2 px-4 py-2 bg-medieval-blood/20 hover:bg-medieval-blood/40 text-medieval-blood border border-medieval-blood/30 rounded-lg text-xs font-bold uppercase tracking-widest transition-all"
                    >
                      <Trash size={14} />
                      Limpar Combate
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 gap-6 relative z-10">
                    {favoriteThreats.map((threat) => (
                      <ThreatPreviewCard
                        key={`active-${threat.id}`}
                        threat={threat}
                        onEdit={handleEditThreat}
                        onDuplicate={handleDuplicateThreat}
                        onDelete={handleDeleteThreat}
                        onToggleFavorite={handleToggleFavorite}
                      />
                    ))}
                  </div>
                </div>
              )}

              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 opacity-50">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medieval-gold mb-4"></div>
                  <p className="text-parchment-dark font-serif">
                    Folheando o grimório...
                  </p>
                </div>
              ) : filteredThreats.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 gap-6">
                  {filteredThreats.map((threat) => (
                    <ThreatPreviewCard
                      key={threat.id}
                      threat={threat}
                      onEdit={handleEditThreat}
                      onDuplicate={handleDuplicateThreat}
                      onDelete={handleDeleteThreat}
                      onToggleFavorite={handleToggleFavorite}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 opacity-50 bg-medieval-stone/20 rounded-2xl border border-dashed border-medieval-iron/50">
                  <ShieldAlert className="w-16 h-16 mx-auto mb-4 text-medieval-iron" />
                  <p className="text-xl font-serif text-parchment-dark">
                    Nenhuma ameaça encontrada.
                  </p>
                  <button
                    onClick={() => setActiveTab("criador")}
                    className="mt-4 text-medieval-gold hover:underline font-bold"
                  >
                    Criar primeiro monstro
                  </button>
                </div>
              )}
            </motion.div>
          ) : activeTab === "herois" ? (
            <motion.div
              key="herois"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-8"
            >
              {selectedHero ? (
                <div className="space-y-6">
                  <div className="flex justify-start">
                    <button
                      onClick={() => setSelectedHero(null)}
                      className="flex items-center gap-2 px-4 py-2 bg-stone-800 hover:bg-stone-700 text-parchment-light rounded-lg transition-all"
                    >
                      &larr; Voltar para Lista
                    </button>
                  </div>
                  <CharacterSheetView
                    character={selectedHero}
                    onUpdate={handleUpdateHero}
                    isMestre={true}
                  />
                </div>
              ) : isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 opacity-50">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medieval-gold mb-4"></div>
                  <p className="text-parchment-dark font-serif">
                    Convocando heróis...
                  </p>
                </div>
              ) : heroes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Object.entries(
                    heroes.reduce((acc, hero) => {
                      const owner = hero.ownerNickname || "Desconhecido";
                      if (!acc[owner]) acc[owner] = [];
                      acc[owner].push(hero);
                      return acc;
                    }, {} as Record<string, Character[]>)
                  ).map(([owner, heroList]) => (
                    <div
                      key={owner}
                      className="bg-medieval-stone/40 border border-medieval-iron/30 rounded-xl overflow-hidden"
                    >
                      <div className="bg-black/40 px-4 py-2 border-b border-medieval-iron/30 flex justify-between items-center">
                        <h3 className="font-serif text-medieval-gold font-bold">
                          {owner}
                        </h3>
                        <span className="text-xs text-parchment-dark">
                          {heroList.length} Herói(s)
                        </span>
                      </div>
                      <div className="p-4 space-y-4">
                        {heroList.map((hero) => {
                          // Calc stats
                          const hpBase = hero.class?.pv || 16;
                          const conVal =
                            typeof hero.attributes.Constituição === "object"
                              ? (hero.attributes.Constituição as any).mod ??
                                (hero.attributes.Constituição as any).value
                                  ?.total ??
                                0
                              : hero.attributes.Constituição ?? 0;

                          const hpMax = hpBase + conVal;
                          const currentHp = hero.currentPv ?? hpMax;
                          const hpPercent = Math.min(
                            100,
                            Math.max(0, (currentHp / hpMax) * 100)
                          );

                          const pmBase = hero.class?.pm || 4;
                          const currentPm = hero.currentPm ?? pmBase;
                          const pmPercent = Math.min(
                            100,
                            Math.max(0, (currentPm / pmBase) * 100)
                          );

                          return (
                            <div
                              key={hero.id}
                              onClick={() => setSelectedHero(hero)}
                              className="flex gap-4 items-center bg-black/20 p-3 rounded-lg border border-white/5 hover:border-medieval-gold/30 transition-colors cursor-pointer group"
                            >
                              {/* Avatar */}
                              <div className="flex-shrink-0">
                                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-medieval-iron bg-stone-900 group-hover:border-medieval-gold transition-colors">
                                  {hero.imageUrl ? (
                                    <img
                                      src={hero.imageUrl}
                                      alt={hero.name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-xl">
                                      🧙‍♂️
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Stats */}
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-baseline mb-1">
                                  <h4 className="font-bold text-parchment-light truncate text-sm group-hover:text-medieval-gold transition-colors">
                                    {hero.name}
                                  </h4>
                                  <span className="text-[10px] text-parchment-dark uppercase">
                                    {hero.class?.name} Lv.{hero.level}
                                  </span>
                                </div>

                                {/* HP Bar */}
                                <div className="relative h-2 bg-stone-900 rounded-full mb-1 overflow-hidden">
                                  <div
                                    className="absolute top-0 left-0 h-full bg-red-600 rounded-full transition-all duration-500"
                                    style={{ width: `${hpPercent}%` }}
                                  />
                                </div>

                                {/* PM Bar */}
                                <div className="relative h-1.5 bg-stone-900 rounded-full overflow-hidden">
                                  <div
                                    className="absolute top-0 left-0 h-full bg-blue-500 rounded-full transition-all duration-500"
                                    style={{ width: `${pmPercent}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 opacity-50 bg-medieval-stone/20 rounded-2xl border border-dashed border-medieval-iron/50">
                  <Crown className="w-16 h-16 mx-auto mb-4 text-medieval-iron" />
                  <p className="text-xl font-serif text-parchment-dark">
                    Nenhum herói favorito encontrado.
                  </p>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="criador"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col lg:flex-row gap-8"
            >
              {/* Creator Form Side */}
              <div className="lg:w-1/2 space-y-6">
                <div className="bg-medieval-stone/40 rounded-2xl border border-medieval-iron/30 overflow-hidden shadow-lg">
                  {/* Stepper */}
                  <div className="flex bg-black/40 border-b border-medieval-iron/30 overflow-x-auto no-scrollbar">
                    {stepsConfig.map((s, idx) => (
                      <button
                        key={idx}
                        onClick={() => setStep(idx + 1)}
                        className={`flex-1 min-w-[80px] py-4 text-center text-xs font-bold uppercase tracking-wider relative transition-colors ${
                          step === idx + 1
                            ? "text-medieval-gold bg-medieval-gold/5"
                            : step > idx + 1
                            ? "text-parchment-light hover:text-medieval-gold"
                            : "text-parchment-dark/50 hover:text-parchment-light"
                        }`}
                      >
                        {s.title}
                        {step === idx + 1 && (
                          <motion.div
                            layoutId="stepper-indicator"
                            className="absolute bottom-0 left-0 w-full h-0.5 bg-medieval-gold"
                          />
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="p-6 md:p-8">
                    <CurrentStepComponent
                      formData={formData}
                      setFormData={setFormData}
                      onSave={handleSaveThreat}
                      isSaving={isSaving}
                    />
                  </div>

                  {/* Navigation Buttons */}
                  <div className="p-4 bg-black/20 border-t border-medieval-iron/30 flex justify-between">
                    <button
                      onClick={() => setStep((prev) => Math.max(1, prev - 1))}
                      disabled={step === 1}
                      className="px-6 py-2 border border-medieval-iron/50 rounded text-parchment-dark hover:text-parchment-light disabled:opacity-30 transition-all font-serif text-sm"
                    >
                      Anterior
                    </button>

                    {step < 5 ? (
                      <button
                        onClick={() => setStep((prev) => Math.min(5, prev + 1))}
                        className="px-6 py-2 bg-medieval-gold text-black font-bold rounded hover:bg-amber-500 transition-all font-serif text-sm"
                      >
                        Próximo
                      </button>
                    ) : (
                      <div />
                    )}
                  </div>
                </div>
              </div>

              {/* Live Preview Side - Sticky on Desktop */}
              <div className="hidden lg:block lg:w-1/2 relative">
                <div className="sticky top-8">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-xl font-serif text-medieval-gold flex items-center gap-2">
                      <Eye className="w-5 h-5" /> Visualização em Tempo Real
                    </h3>
                  </div>
                  <MonsterStatBlock threat={formData as ThreatSheet} />
                  <div className="mt-4 text-center text-xs text-parchment-dark italic">
                    Esta é a aparência que o monstro terá no compêndio.
                  </div>
                </div>
              </div>

              {/* Mobile Preview Toggle */}
              <div className="fixed bottom-4 right-4 lg:hidden z-50">
                <button
                  onClick={() => setShowMobilePreview(!showMobilePreview)}
                  className="bg-medieval-gold text-black rounded-full p-4 shadow-xl border-2 border-black"
                >
                  <Eye className="w-6 h-6" />
                </button>
              </div>

              {/* Mobile Preview Modal */}
              {showMobilePreview && (
                <div className="fixed inset-0 bg-black/90 z-50 overflow-y-auto p-4 flex items-center justify-center lg:hidden">
                  <div className="w-full max-w-lg relative">
                    <button
                      onClick={() => setShowMobilePreview(false)}
                      className="absolute -top-12 right-0 text-white p-2"
                    >
                      Fechar
                    </button>
                    <MonsterStatBlock threat={formData as ThreatSheet} />
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
