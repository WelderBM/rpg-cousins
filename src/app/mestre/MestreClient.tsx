"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  ShieldAlert,
  Plus,
  List,
  Save,
  Trash2,
  ChevronRight,
  ChevronLeft,
  Sword,
  Shield,
  Brain,
  Zap,
  Lock,
  Search,
  Dice5,
  Eye,
  Edit2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/firebaseConfig";
import {
  ThreatSheet,
  ThreatType,
  ThreatSize,
  ThreatRole,
  ChallengeLevel,
  TreasureLevel,
  ResistanceType,
  ThreatAttack,
  ThreatAbility,
} from "@/interfaces/ThreatSheet";
import { Atributo } from "@/data/atributos";
import {
  calculateCombatStats,
  calculateAllSkills,
  createDefaultAttributes,
  calculateDiceAverage,
  validateDiceString,
  generateThreatId,
} from "@/functions/threatGenerator";
import {
  ABILITY_SUGGESTIONS,
  ABILITY_CATEGORIES,
} from "@/data/threats/abilitySuggestions";
import { COMBAT_TABLES } from "@/data/threats/combatTables";

// Password for DM area
const MESTRE_PASSWORD = "mestre-cousins";

type Tab = "lista" | "criador";

export default function MestreClient() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("lista");
  const [threats, setThreats] = useState<ThreatSheet[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

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
  });

  const [step, setStep] = useState(1);
  const [editingId, setEditingId] = useState<string | null>(null);

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
  }, [formData.challengeLevel, formData.role, formData.hasManaPoints]);

  const handleSaveThreat = async () => {
    if (!formData.name) {
      alert("Nome é obrigatório!");
      return;
    }

    setIsSaving(true);
    try {
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
    });
    setEditingId(null);
    setStep(1);
  };

  const filteredThreats = threats.filter(
    (t) =>
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-medieval-iron/30 pb-6">
        <div>
          <h1 className="font-serif text-3xl font-bold text-medieval-gold flex items-center gap-3">
            <ShieldAlert className="w-8 h-8" />
            Ferramentas do Mestre
          </h1>
          <p className="text-parchment-dark mt-1">
            Gerencie ameaças e monstros da sua campanha.
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
          onClick={() => setActiveTab("lista")}
          className={`px-6 py-3 font-serif text-lg transition-all border-b-2 ${
            activeTab === "lista"
              ? "border-medieval-gold text-medieval-gold bg-medieval-gold/5"
              : "border-transparent text-parchment-dark hover:text-parchment-light hover:bg-white/5"
          }`}
        >
          <div className="flex items-center gap-2">
            <List className="w-5 h-5" />
            Lista de Monstros
          </div>
        </button>
        <button
          onClick={() => setActiveTab("criador")}
          className={`px-6 py-3 font-serif text-lg transition-all border-b-2 ${
            activeTab === "criador"
              ? "border-medieval-gold text-medieval-gold bg-medieval-gold/5"
              : "border-transparent text-parchment-dark hover:text-parchment-light hover:bg-white/5"
          }`}
        >
          <div className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            {editingId ? "Editando Monstro" : "Criar Novo Monstro"}
          </div>
        </button>
      </div>

      {/* Content */}
      <div className="min-h-[60vh]">
        {activeTab === "lista" ? (
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4 bg-medieval-stone/40 p-4 rounded-xl border border-medieval-iron/30">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-medieval-iron" />
                <input
                  type="text"
                  placeholder="Buscar ameaça por nome ou tipo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-black/40 border border-medieval-iron/50 rounded-lg pl-10 pr-4 py-2 text-parchment-light focus:border-medieval-gold outline-none transition-all"
                />
              </div>
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 opacity-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medieval-gold mb-4"></div>
                <p className="text-parchment-dark font-serif">
                  Consultando grimório de ameaças...
                </p>
              </div>
            ) : filteredThreats.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredThreats.map((threat) => (
                  <motion.div
                    key={threat.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-medieval-stone/80 border border-medieval-iron/50 rounded-xl overflow-hidden hover:border-medieval-gold/50 transition-all group relative shadow-lg"
                  >
                    <div className="p-5 space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-serif text-xl font-bold text-medieval-gold">
                            {threat.name}
                          </h3>
                          <p className="text-xs text-parchment-dark uppercase tracking-widest">
                            {threat.type} • {threat.size}
                          </p>
                        </div>
                        <div className="bg-medieval-gold/10 text-medieval-gold px-2 py-1 rounded text-xs font-bold border border-medieval-gold/20">
                          ND {threat.challengeLevel}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[10px] uppercase font-bold text-parchment-dark">
                        <div className="bg-black/20 p-2 rounded flex justify-between">
                          <span>Papel</span>
                          <span className="text-parchment-light">
                            {threat.role}
                          </span>
                        </div>
                        <div className="bg-black/20 p-2 rounded flex justify-between">
                          <span>Vida</span>
                          <span className="text-parchment-light">
                            {threat.combatStats.hitPoints}
                          </span>
                        </div>
                        <div className="bg-black/20 p-2 rounded flex justify-between">
                          <span>Defesa</span>
                          <span className="text-parchment-light">
                            {threat.combatStats.defense}
                          </span>
                        </div>
                        <div className="bg-black/20 p-2 rounded flex justify-between">
                          <span>Ataque</span>
                          <span className="text-parchment-light">
                            +{threat.combatStats.attackValue}
                          </span>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-2 border-t border-medieval-iron/20">
                        <button
                          onClick={() => handleDuplicateThreat(threat)}
                          className="p-2 text-parchment-dark hover:text-medieval-gold hover:bg-medieval-gold/5 rounded transition-all"
                          title="Duplicar"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditThreat(threat)}
                          className="p-2 text-parchment-dark hover:text-medieval-gold hover:bg-medieval-gold/5 rounded transition-all"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteThreat(threat.id)}
                          className="p-2 text-parchment-dark hover:text-medieval-blood hover:bg-medieval-blood/5 rounded transition-all"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
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
                  className="mt-4 text-medieval-gold hover:underline"
                >
                  Criar primeiro monstro
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-medieval-stone/40 rounded-2xl border border-medieval-iron/30 overflow-hidden">
            {/* Step Indicator */}
            <div className="flex bg-black/20 p-4 border-b border-medieval-iron/30">
              {[1, 2, 3, 4, 5].map((s) => (
                <div key={s} className="flex-1 flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      step === s
                        ? "bg-medieval-gold text-black"
                        : step > s
                        ? "bg-medieval-gold/40 text-medieval-gold"
                        : "bg-medieval-iron/30 text-parchment-dark"
                    }`}
                  >
                    {s}
                  </div>
                  {s < 5 && (
                    <div
                      className={`flex-1 h-[2px] mx-2 ${
                        step > s ? "bg-medieval-gold/40" : "bg-medieval-iron/30"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="p-8 space-y-8">
              {/* Step 1: Base Info */}
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-parchment-dark uppercase tracking-wider">
                        Nome da Ameaça
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        placeholder="Ex: Dragão de Chifres"
                        className="w-full bg-black/40 border border-medieval-iron/50 rounded-lg px-4 py-2 text-parchment-light focus:border-medieval-gold outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-parchment-dark uppercase tracking-wider">
                          Tipo
                        </label>
                        <select
                          value={formData.type}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              type: e.target.value as ThreatType,
                            }))
                          }
                          className="w-full bg-black/40 border border-medieval-iron/50 rounded-lg px-4 py-2 text-parchment-light focus:border-medieval-gold outline-none"
                        >
                          {Object.values(ThreatType).map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-parchment-dark uppercase tracking-wider">
                          Tamanho
                        </label>
                        <select
                          value={formData.size}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              size: e.target.value as ThreatSize,
                            }))
                          }
                          className="w-full bg-black/40 border border-medieval-iron/50 rounded-lg px-4 py-2 text-parchment-light focus:border-medieval-gold outline-none"
                        >
                          {Object.values(ThreatSize).map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-parchment-dark uppercase tracking-wider text-medieval-gold">
                          Nível de Desafio (ND)
                        </label>
                        <select
                          value={formData.challengeLevel}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              challengeLevel: e.target.value as ChallengeLevel,
                            }))
                          }
                          className="w-full bg-black/40 border border-medieval-gold/30 rounded-lg px-4 py-2 text-parchment-light focus:border-medieval-gold outline-none"
                        >
                          {Object.values(ChallengeLevel).map((nd) => (
                            <option key={nd} value={nd}>
                              {nd}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-parchment-dark uppercase tracking-wider text-medieval-gold">
                          Papel
                        </label>
                        <select
                          value={formData.role}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              role: e.target.value as ThreatRole,
                            }))
                          }
                          className="w-full bg-black/40 border border-medieval-gold/30 rounded-lg px-4 py-2 text-parchment-light focus:border-medieval-gold outline-none"
                        >
                          {Object.values(ThreatRole).map((r) => (
                            <option key={r} value={r}>
                              {r}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-parchment-dark uppercase tracking-wider">
                          Deslocamento
                        </label>
                        <input
                          type="text"
                          value={formData.displacement}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              displacement: e.target.value,
                            }))
                          }
                          placeholder="Ex: 9m, Voo 18m"
                          className="w-full bg-black/40 border border-medieval-iron/50 rounded-lg px-4 py-2 text-parchment-light focus:border-medieval-gold outline-none"
                        />
                      </div>
                      <div className="flex flex-col justify-end pb-3">
                        <label className="flex items-center gap-2 cursor-pointer text-parchment-light">
                          <input
                            type="checkbox"
                            checked={formData.hasManaPoints}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                hasManaPoints: e.target.checked,
                              }))
                            }
                            className="w-4 h-4 rounded border-medieval-iron bg-black/40 text-medieval-gold focus:ring-medieval-gold"
                          />
                          Usa Pontos de Mana (PM)?
                        </label>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Combat Stats (Auto-calculated) */}
              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div className="bg-medieval-gold/5 p-4 rounded-xl border border-medieval-gold/20 mb-6">
                    <p className="text-sm text-medieval-gold flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      Os valores abaixo foram calculados automaticamente baseado
                      no ND e Papel selecionados. Você pode ajustá-los
                      livremente se desejar uma criatura atípica.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-parchment-dark uppercase">
                        Pontos de Vida (PV)
                      </label>
                      <input
                        type="number"
                        value={formData.combatStats?.hitPoints}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            combatStats: {
                              ...prev.combatStats!,
                              hitPoints: Number(e.target.value),
                            },
                          }))
                        }
                        className="w-full bg-black/40 border border-medieval-iron/50 rounded-lg px-4 py-2 text-parchment-light focus:border-medieval-gold outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-parchment-dark uppercase">
                        Defesa
                      </label>
                      <input
                        type="number"
                        value={formData.combatStats?.defense}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            combatStats: {
                              ...prev.combatStats!,
                              defense: Number(e.target.value),
                            },
                          }))
                        }
                        className="w-full bg-black/40 border border-medieval-iron/50 rounded-lg px-4 py-2 text-parchment-light focus:border-medieval-gold outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-parchment-dark uppercase">
                        Bônus de Ataque
                      </label>
                      <input
                        type="number"
                        value={formData.combatStats?.attackValue}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            combatStats: {
                              ...prev.combatStats!,
                              attackValue: Number(e.target.value),
                            },
                          }))
                        }
                        className="w-full bg-black/40 border border-medieval-iron/50 rounded-lg px-4 py-2 text-parchment-light focus:border-medieval-gold outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-parchment-dark uppercase">
                        CD de Efeitos
                      </label>
                      <input
                        type="number"
                        value={formData.combatStats?.standardEffectDC}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            combatStats: {
                              ...prev.combatStats!,
                              standardEffectDC: Number(e.target.value),
                            },
                          }))
                        }
                        className="w-full bg-black/40 border border-medieval-iron/50 rounded-lg px-4 py-2 text-parchment-light focus:border-medieval-gold outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-medieval-iron/20">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-parchment-dark uppercase">
                        Resistência Forte (80%)
                      </label>
                      <input
                        type="number"
                        value={formData.combatStats?.strongSave}
                        disabled
                        className="w-full bg-medieval-stone/20 border border-medieval-iron/20 rounded-lg px-4 py-2 text-parchment-dark"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-parchment-dark uppercase">
                        Resistência Média (50%)
                      </label>
                      <input
                        type="number"
                        value={formData.combatStats?.mediumSave}
                        disabled
                        className="w-full bg-medieval-stone/20 border border-medieval-iron/20 rounded-lg px-4 py-2 text-parchment-dark"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-parchment-dark uppercase">
                        Resistência Fraca (20%)
                      </label>
                      <input
                        type="number"
                        value={formData.combatStats?.weakSave}
                        disabled
                        className="w-full bg-medieval-stone/20 border border-medieval-iron/20 rounded-lg px-4 py-2 text-parchment-dark"
                      />
                    </div>
                  </div>

                  <div className="bg-medieval-stone/30 p-6 rounded-xl border border-medieval-iron/30 mt-6">
                    <h4 className="font-serif text-lg font-bold text-parchment-DEFAULT mb-4">
                      Escolha os tipos de resistência:
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {["Fortitude", "Reflexos", "Vontade"].map((save) => (
                        <div key={save} className="space-y-2">
                          <label className="text-xs font-bold text-parchment-dark uppercase">
                            {save}
                          </label>
                          <select
                            value={
                              formData.resistanceAssignments?.[
                                save as keyof typeof formData.resistanceAssignments
                              ]
                            }
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                resistanceAssignments: {
                                  ...prev.resistanceAssignments!,
                                  [save]: e.target.value,
                                },
                              }))
                            }
                            className="w-full bg-black/40 border border-medieval-iron/50 rounded-lg px-3 py-2 text-parchment-light focus:border-medieval-gold outline-none text-sm"
                          >
                            <option value={ResistanceType.STRONG}>
                              Forte (+{formData.combatStats?.strongSave})
                            </option>
                            <option value={ResistanceType.MEDIUM}>
                              Média (+{formData.combatStats?.mediumSave})
                            </option>
                            <option value={ResistanceType.WEAK}>
                              Fraca (+{formData.combatStats?.weakSave})
                            </option>
                          </select>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Attacks */}
              {step === 3 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div className="flex justify-between items-center">
                    <h3 className="font-serif text-xl font-bold text-parchment-DEFAULT">
                      Ataques
                    </h3>
                    <button
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          attacks: [
                            ...prev.attacks!,
                            {
                              id: Date.now().toString(),
                              name: "Novo Ataque",
                              attackBonus: prev.combatStats!.attackValue,
                              damageDice: "1d8",
                              bonusDamage: 0,
                            },
                          ],
                        }))
                      }
                      className="flex items-center gap-2 text-sm text-medieval-gold hover:text-amber-400 transition-all"
                    >
                      <Plus className="w-4 h-4" /> Adicionar Ataque
                    </button>
                  </div>

                  <div className="space-y-4">
                    {formData.attacks?.map((attack, index) => (
                      <div
                        key={attack.id}
                        className="bg-black/20 p-4 rounded-xl border border-medieval-iron/30 grid grid-cols-1 md:grid-cols-12 gap-4 items-end"
                      >
                        <div className="md:col-span-4 space-y-1">
                          <label className="text-[10px] font-bold text-parchment-dark uppercase tracking-widest">
                            Nome do Ataque
                          </label>
                          <input
                            type="text"
                            value={attack.name}
                            onChange={(e) => {
                              const newAttacks = [...formData.attacks!];
                              newAttacks[index].name = e.target.value;
                              setFormData((prev) => ({
                                ...prev,
                                attacks: newAttacks,
                              }));
                            }}
                            className="w-full bg-black/40 border border-medieval-iron/50 rounded px-3 py-1 text-sm text-parchment-light"
                          />
                        </div>
                        <div className="md:col-span-2 space-y-1">
                          <label className="text-[10px] font-bold text-parchment-dark uppercase tracking-widest">
                            Bônus
                          </label>
                          <input
                            type="number"
                            value={attack.attackBonus}
                            onChange={(e) => {
                              const newAttacks = [...formData.attacks!];
                              newAttacks[index].attackBonus = Number(
                                e.target.value
                              );
                              setFormData((prev) => ({
                                ...prev,
                                attacks: newAttacks,
                              }));
                            }}
                            className="w-full bg-black/40 border border-medieval-iron/50 rounded px-3 py-1 text-sm text-parchment-light"
                          />
                        </div>
                        <div className="md:col-span-2 space-y-1">
                          <label className="text-[10px] font-bold text-parchment-dark uppercase tracking-widest">
                            Dados
                          </label>
                          <input
                            type="text"
                            value={attack.damageDice}
                            onChange={(e) => {
                              const newAttacks = [...formData.attacks!];
                              newAttacks[index].damageDice = e.target.value;
                              newAttacks[index].averageDamage =
                                calculateDiceAverage(
                                  e.target.value,
                                  attack.bonusDamage
                                );
                              setFormData((prev) => ({
                                ...prev,
                                attacks: newAttacks,
                              }));
                            }}
                            className={`w-full bg-black/40 border ${
                              validateDiceString(attack.damageDice)
                                ? "border-medieval-iron/50"
                                : "border-medieval-blood"
                            } rounded px-3 py-1 text-sm text-parchment-light`}
                          />
                        </div>
                        <div className="md:col-span-2 space-y-1">
                          <label className="text-[10px] font-bold text-parchment-dark uppercase tracking-widest">
                            Bônus Dano
                          </label>
                          <input
                            type="number"
                            value={attack.bonusDamage}
                            onChange={(e) => {
                              const newAttacks = [...formData.attacks!];
                              newAttacks[index].bonusDamage = Number(
                                e.target.value
                              );
                              newAttacks[index].averageDamage =
                                calculateDiceAverage(
                                  attack.damageDice,
                                  Number(e.target.value)
                                );
                              setFormData((prev) => ({
                                ...prev,
                                attacks: newAttacks,
                              }));
                            }}
                            className="w-full bg-black/40 border border-medieval-iron/50 rounded px-3 py-1 text-sm text-parchment-light"
                          />
                        </div>
                        <div className="md:col-span-2 flex justify-end gap-2">
                          <div className="text-center px-2">
                            <span className="text-[10px] text-parchment-dark block uppercase">
                              Médio
                            </span>
                            <span className="text-medieval-gold font-bold">
                              {attack.averageDamage ||
                                calculateDiceAverage(
                                  attack.damageDice,
                                  attack.bonusDamage
                                )}
                            </span>
                          </div>
                          <button
                            onClick={() => {
                              const newAttacks = formData.attacks?.filter(
                                (_, i) => i !== index
                              );
                              setFormData((prev) => ({
                                ...prev,
                                attacks: newAttacks,
                              }));
                            }}
                            className="p-2 text-parchment-dark hover:text-medieval-blood"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}

                    {formData.attacks?.length === 0 && (
                      <div className="text-center py-10 opacity-30 border border-dashed border-medieval-iron/50 rounded-xl">
                        Nenhum ataque adicionado.
                      </div>
                    )}

                    <div className="mt-6 p-4 bg-medieval-gold/5 rounded-xl border border-medieval-gold/10">
                      <p className="text-sm text-parchment-dark italic">
                        Dano médio recomendado para este ND:{" "}
                        <span className="text-medieval-gold font-bold">
                          {formData.combatStats?.averageDamage}
                        </span>
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 4: Abilities */}
              {step === 4 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div className="flex justify-between items-center">
                    <h3 className="font-serif text-xl font-bold text-parchment-DEFAULT">
                      Habilidades
                    </h3>
                    <button
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          abilities: [
                            ...prev.abilities!,
                            {
                              id: Date.now().toString(),
                              name: "Nova Habilidade",
                              description: "",
                            },
                          ],
                        }))
                      }
                      className="flex items-center gap-2 text-sm text-medieval-gold hover:text-amber-400 transition-all"
                    >
                      <Plus className="w-4 h-4" /> Adicionar Manual
                    </button>
                  </div>

                  {/* Suggestions */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-parchment-dark uppercase">
                      Sugestões Rápidas
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {ABILITY_SUGGESTIONS.slice(0, 10).map((suggestion) => (
                        <button
                          key={suggestion.name}
                          onClick={() => {
                            if (
                              formData.abilities?.some(
                                (a) => a.name === suggestion.name
                              )
                            )
                              return;
                            setFormData((prev) => ({
                              ...prev,
                              abilities: [
                                ...prev.abilities!,
                                { id: Date.now().toString(), ...suggestion },
                              ],
                            }));
                          }}
                          className="px-3 py-1 bg-black/40 border border-medieval-iron/30 rounded-full text-xs text-parchment-light hover:border-medieval-gold/50 transition-all"
                        >
                          + {suggestion.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-medieval-iron/20">
                    {formData.abilities?.map((ability, index) => (
                      <div
                        key={ability.id}
                        className="bg-black/20 p-4 rounded-xl border border-medieval-iron/30 space-y-3"
                      >
                        <div className="flex justify-between items-start">
                          <input
                            type="text"
                            value={ability.name}
                            onChange={(e) => {
                              const newAbilities = [...formData.abilities!];
                              newAbilities[index].name = e.target.value;
                              setFormData((prev) => ({
                                ...prev,
                                abilities: newAbilities,
                              }));
                            }}
                            className="bg-transparent border-b border-medieval-iron/30 focus:border-medieval-gold outline-none text-medieval-gold font-bold font-serif text-lg w-full max-w-md"
                            placeholder="Nome da Habilidade"
                          />
                          <button
                            onClick={() => {
                              const newAbilities = formData.abilities?.filter(
                                (_, i) => i !== index
                              );
                              setFormData((prev) => ({
                                ...prev,
                                abilities: newAbilities,
                              }));
                            }}
                            className="p-1 text-parchment-dark hover:text-medieval-blood"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <textarea
                          value={ability.description}
                          onChange={(e) => {
                            const newAbilities = [...formData.abilities!];
                            newAbilities[index].description = e.target.value;
                            setFormData((prev) => ({
                              ...prev,
                              abilities: newAbilities,
                            }));
                          }}
                          className="w-full bg-black/40 border border-medieval-iron/20 rounded p-2 text-sm text-parchment-light focus:border-medieval-gold outline-none h-20"
                          placeholder="Descrição detalhada da habilidade..."
                        />
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Step 5: Attributes & Skills */}
              {step === 5 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-8"
                >
                  <div className="bg-medieval-stone/40 p-6 rounded-2xl border border-medieval-iron/30">
                    <h3 className="font-serif text-xl font-bold text-parchment-DEFAULT mb-6 flex items-center gap-2">
                      <Brain className="w-6 h-6 text-medieval-gold" />
                      Atributos (Modificadores)
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                      {Object.values(Atributo).map((attr) => (
                        <div key={attr} className="space-y-2 text-center">
                          <label className="text-xs font-bold text-parchment-dark uppercase">
                            {attr.substring(0, 3)}
                          </label>
                          <input
                            type="number"
                            value={
                              formData.attributes?.[attr] === "-"
                                ? 0
                                : formData.attributes?.[attr]
                            }
                            onChange={(e) => {
                              const val =
                                e.target.value === ""
                                  ? 0
                                  : Number(e.target.value);
                              setFormData((prev) => ({
                                ...prev,
                                attributes: {
                                  ...prev.attributes!,
                                  [attr]: val,
                                },
                              }));
                            }}
                            className="w-full bg-black/60 border border-medieval-iron/50 rounded-lg py-3 text-center text-xl font-bold text-medieval-gold focus:border-medieval-gold outline-none"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-medieval-stone/40 p-6 rounded-2xl border border-medieval-iron/30">
                    <h3 className="font-serif text-xl font-bold text-parchment-DEFAULT mb-6 flex items-center gap-2">
                      <Dice5 className="w-6 h-6 text-medieval-gold" />
                      Treinamento de Perícias
                    </h3>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      {formData.skills?.map((skill, index) => {
                        const isCombatSkill = [
                          "Luta",
                          "Pontaria",
                          "Fortitude",
                          "Reflexos",
                          "Vontade",
                          "Iniciativa",
                          "Percepção",
                        ].includes(skill.name);
                        if (!isCombatSkill && !skill.trained) return null;

                        return (
                          <label
                            key={skill.name}
                            className="flex items-center gap-3 p-3 bg-black/20 rounded-lg cursor-pointer hover:bg-black/40 transition-colors border border-medieval-iron/20"
                          >
                            <input
                              type="checkbox"
                              checked={skill.trained}
                              onChange={(e) => {
                                const newSkills = [...formData.skills!];
                                newSkills[index].trained = e.target.checked;
                                setFormData((prev) => ({
                                  ...prev,
                                  skills: calculateAllSkills(
                                    prev.challengeLevel as ChallengeLevel,
                                    prev.attributes!,
                                    newSkills,
                                    prev.resistanceAssignments,
                                    prev.combatStats as any
                                  ),
                                }));
                              }}
                              className="w-5 h-5 rounded border-medieval-iron bg-black/40 text-medieval-gold focus:ring-medieval-gold"
                            />
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-parchment-light">
                                {skill.name}
                              </span>
                              <span className="text-xs text-medieval-gold font-bold">
                                +{skill.total}
                              </span>
                            </div>
                          </label>
                        );
                      })}
                      <button
                        onClick={() => {
                          const name = prompt(
                            "Nome da Perícia (Ex: Diplomacia):"
                          );
                          if (name) {
                            const newSkills = [...formData.skills!];
                            const idx = newSkills.findIndex(
                              (s) => s.name === name
                            );
                            if (idx !== -1) {
                              newSkills[idx].trained = true;
                              setFormData((prev) => ({
                                ...prev,
                                skills: calculateAllSkills(
                                  prev.challengeLevel as any,
                                  prev.attributes!,
                                  newSkills,
                                  prev.resistanceAssignments,
                                  prev.combatStats as any
                                ),
                              }));
                            }
                          }
                        }}
                        className="flex items-center justify-center gap-2 p-3 border border-dashed border-medieval-iron/50 rounded-lg text-parchment-dark hover:text-parchment-light transition-all text-sm"
                      >
                        <Plus className="w-4 h-4" /> Adicionar Perícia
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-parchment-dark uppercase">
                          Equipamento
                        </label>
                        <textarea
                          value={formData.equipment}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              equipment: e.target.value,
                            }))
                          }
                          className="w-full bg-black/40 border border-medieval-iron/50 rounded-lg p-3 text-sm text-parchment-light focus:border-medieval-gold outline-none h-24"
                          placeholder="Itens que a criatura carrega..."
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-parchment-dark uppercase">
                          Nível de Tesouro
                        </label>
                        <select
                          value={formData.treasureLevel}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              treasureLevel: e.target.value as TreasureLevel,
                            }))
                          }
                          className="w-full bg-black/40 border border-medieval-iron/50 rounded-lg px-4 py-2 text-parchment-light focus:border-medieval-gold outline-none"
                        >
                          {Object.values(TreasureLevel).map((v) => (
                            <option key={v} value={v}>
                              {v}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="bg-medieval-gold/5 p-6 rounded-2xl border border-medieval-gold/20 flex flex-col justify-center items-center text-center space-y-4">
                      <div className="p-4 bg-medieval-gold/10 rounded-full">
                        <Shield className="w-12 h-12 text-medieval-gold" />
                      </div>
                      <h4 className="font-serif text-2xl font-bold text-medieval-gold">
                        Tudo Pronto!
                      </h4>
                      <p className="text-parchment-dark text-sm">
                        Revise os dados nos passos anteriores se necessário. Ao
                        clicar abaixo, a ameaça será salva permanentemente no
                        seu grimório pessoal.
                      </p>
                      <button
                        onClick={handleSaveThreat}
                        disabled={isSaving}
                        className="w-full bg-medieval-gold hover:bg-amber-500 text-black font-bold py-3 rounded-xl transition-all shadow-xl flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {isSaving ? (
                          <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></span>
                        ) : (
                          <>
                            <Save className="w-5 h-5" />
                            Salvar Monstro
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="p-4 bg-black/20 border-t border-medieval-iron/30 flex justify-between">
              <button
                onClick={() => setStep((prev) => Math.max(1, prev - 1))}
                disabled={step === 1}
                className="flex items-center gap-2 px-6 py-2 border border-medieval-iron/50 rounded text-parchment-dark hover:text-parchment-light disabled:opacity-30 transition-all font-serif"
              >
                <ChevronLeft className="w-4 h-4" /> Anterior
              </button>

              {step < 5 ? (
                <button
                  onClick={() => setStep((prev) => Math.min(5, prev + 1))}
                  className="flex items-center gap-2 px-6 py-2 bg-medieval-gold/10 border border-medieval-gold/30 text-medieval-gold rounded hover:bg-medieval-gold/20 transition-all font-serif"
                >
                  Próximo <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <div className="w-32"></div> // Spacer
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
