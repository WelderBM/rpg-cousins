"use client";

import React, { useEffect, useState } from "react";
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
  Package,
  FlaskRound,
  Shirt,
  Apple,
  Hammer,
  Crosshair,
  Star,
  Upload,
  Link as LinkIcon,
  Wand2,
  Trash2,
  Download,
  Search,
  MapPin,
  Dices,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Atributo } from "@/data/atributos";
import { generateCharacterPrompt } from "@/utils/promptGenerator";
import { compressImage } from "@/utils/imageCompression";
import { exportCharacterToPDF } from "@/utils/pdfExport";
import Link from "next/link";
import Skill from "@/interfaces/Skills";
import { calculateCarryCapacity } from "@/utils/inventoryUtils";
import Bag, { calcBagSpaces } from "@/interfaces/Bag";

// --- SUB-COMPONENTS ---

import {
  getItemSymbol,
  Sword,
  DetailRow,
  ItemList,
  SimpleList,
  SectionSlider,
} from "./DisplayComponents";

interface CharacterSheetViewProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => Promise<void>;
  isMestre?: boolean;
}

export function CharacterSheetView({
  character: activeCharacter,
  onUpdate,
  isMestre = false,
}: CharacterSheetViewProps) {
  // --- STATES ---

  // Money
  const [isEditingMoney, setIsEditingMoney] = useState(false);
  const [tempMoney, setTempMoney] = useState(0);

  // PV/PM
  const [isEditingPv, setIsEditingPv] = useState(false);
  const [tempPv, setTempPv] = useState(0);
  const [isEditingPm, setIsEditingPm] = useState(false);
  const [tempPm, setTempPm] = useState(0);

  // Traits
  const [isEditingTraits, setIsEditingTraits] = useState(false);
  const [tempTraits, setTempTraits] = useState({
    gender: "",
    hair: "",
    eyes: "",
    skin: "",
    scars: "",
    extra: "",
    height: "",
  });
  const [tempName, setTempName] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);

  // Sync temp states when character changes
  useEffect(() => {
    if (activeCharacter) {
      if (!isEditingMoney) setTempMoney(activeCharacter.money || 0);
      if (!isEditingTraits) setTempName(activeCharacter.name || "");

      const getAttrMod = (attr: any) => {
        if (typeof attr === "object" && attr !== null) {
          return attr.mod ?? attr.value?.total ?? 0;
        }
        return attr ?? 0;
      };

      const conMod = getAttrMod(activeCharacter.attributes.Constituição);
      const hpBase = activeCharacter.class?.pv || 16;
      const hpMax = hpBase + conMod;
      const pmBase = activeCharacter.class?.pm || 4;
      const pmMax = pmBase;

      if (!isEditingPv) setTempPv(activeCharacter.currentPv ?? hpMax);
      if (!isEditingPm) setTempPm(activeCharacter.currentPm ?? pmMax);

      if (activeCharacter.physicalTraits && !isEditingTraits) {
        setTempTraits({
          gender: activeCharacter.physicalTraits.gender || "",
          hair: activeCharacter.physicalTraits.hair || "",
          eyes: activeCharacter.physicalTraits.eyes || "",
          skin: activeCharacter.physicalTraits.skin || "",
          scars: activeCharacter.physicalTraits.scars || "",
          extra: activeCharacter.physicalTraits.extra || "",
          height: activeCharacter.physicalTraits.height || "",
        });
      }
    }
  }, [
    activeCharacter,
    isEditingMoney,
    isEditingPv,
    isEditingPm,
    isEditingTraits,
  ]);

  const saveTraits = async () => {
    await onUpdate({
      physicalTraits: tempTraits,
      name: tempName || activeCharacter.name,
    });
    setIsEditingTraits(false);
  };

  const copyPromptToClipboard = () => {
    const prompt = generateCharacterPrompt({
      ...activeCharacter,
      physicalTraits: tempTraits,
    });
    navigator.clipboard.writeText(prompt);
    alert("Prompt copiado!");
  };

  const toggleFavorite = async () => {
    await onUpdate({ isFavorite: !activeCharacter.isFavorite });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    setIsUploading(true);
    try {
      const compressed = await compressImage(file);
      const { ref, uploadBytes, getDownloadURL } = await import(
        "firebase/storage"
      );
      const { storage, auth } = await import("@/firebaseConfig");

      if (!storage) throw new Error("Storage not ready");

      let userId = (activeCharacter as any).userId;
      if (!userId && (activeCharacter as any).path) {
        userId = (activeCharacter as any).path.split("/")[1];
      }
      if (!userId && auth?.currentUser) {
        userId = auth.currentUser.uid;
      }

      const storageRef = ref(
        storage,
        `character-images/${userId}/${activeCharacter.id}/${file.name}`
      );
      await uploadBytes(storageRef, compressed);
      const url = await getDownloadURL(storageRef);

      await onUpdate({ imageUrl: url });
    } catch (error) {
      console.error("Upload failed", error);
      alert("Erro ao enviar imagem.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteImage = async () => {
    if (!activeCharacter.imageUrl) return;

    const confirmed = confirm(
      "Tem certeza que deseja apagar a imagem do personagem?"
    );
    if (!confirmed) return;

    try {
      await onUpdate({ imageUrl: "" });
    } catch (error) {
      console.error("Failed to delete image", error);
      alert("Erro ao deletar imagem.");
    }
  };

  const handleExportPDF = async () => {
    setIsExportingPDF(true);
    try {
      await exportCharacterToPDF(activeCharacter);
    } catch (error) {
      console.error("Failed to export PDF", error);
      alert("Erro ao exportar PDF. Tente novamente.");
    } finally {
      setIsExportingPDF(false);
    }
  };

  const handleSaveMoney = async () => {
    await onUpdate({ money: tempMoney });
    setIsEditingMoney(false);
  };

  const handleSavePv = async () => {
    await onUpdate({ currentPv: tempPv });
    setIsEditingPv(false);
  };

  const handleSavePm = async () => {
    await onUpdate({ currentPm: tempPm });
    setIsEditingPm(false);
  };

  // Helper calculations
  const getAttrMod = (attr: any) => {
    if (typeof attr === "object" && attr !== null) {
      return attr.mod ?? attr.value?.total ?? 0;
    }
    return attr ?? 0;
  };

  const conMod = getAttrMod(activeCharacter.attributes.Constituição);
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

  // Process Origin Benefits logic
  const rawBenefits = (activeCharacter as any).originBenefits || [];
  let originPowers: any[] = [];
  let originSkillsList: string[] = [];

  if (rawBenefits.skills || rawBenefits.powers) {
    if (Array.isArray(rawBenefits.powers?.origin)) {
      originPowers = [...rawBenefits.powers.origin];
    }
    if (Array.isArray(rawBenefits.skills)) {
      originSkillsList = rawBenefits.skills.map((s: any) =>
        typeof s === "string" ? s : s.name
      );
    }
  } else if (Array.isArray(rawBenefits)) {
    rawBenefits.forEach((item: any) => {
      const name = typeof item === "string" ? item : item.name;
      const isSkill =
        Object.values(Skill).includes(name as Skill) || item.type === "skill";
      if (isSkill) {
        originSkillsList.push(name);
      } else {
        originPowers.push(item);
      }
    });
  }

  // --- INVENTORY & SPACE CALCULATIONS ---
  const bag = (activeCharacter as any).bag;
  const inventory = (activeCharacter as any).inventory || [];
  const equips =
    bag && typeof bag.getEquipments === "function"
      ? bag.getEquipments()
      : bag?.equipments || {};

  const weapons =
    equips["Arma"] ||
    inventory.filter((i: any) => i.group?.toLowerCase().includes("arma"));

  let others = [];
  if (Object.keys(equips).length > 0) {
    others = Object.entries(equips)
      .filter(([group]) => group !== "Arma")
      .map(([_, items]) => items)
      .flat();
  } else {
    others = inventory.filter(
      (i: any) => !i.group?.toLowerCase().includes("arma")
    );
  }

  // Calculate used spaces - use Bag method if available, otherwise calculate manually
  let usedSpaces = 0;
  if (bag && typeof bag.getSpaces === "function") {
    usedSpaces = bag.getSpaces();
  } else if (bag && bag.equipments) {
    usedSpaces = calcBagSpaces(bag.equipments);
  } else {
    // Fallback: manual calculation
    usedSpaces = [...(weapons || []), ...others].reduce(
      (acc: number, item: any) =>
        acc + (item.spaces || 0) * (item.quantidade || 1),
      0
    );
  }

  // Calculate max spaces using the proper function that considers backpacks
  const maxSpaces = calculateCarryCapacity(activeCharacter);

  return (
    <div className="text-neutral-200 pb-20 font-sans selection:bg-amber-900 selection:text-white relative min-h-screen">
      {/* Background Image */}
      {activeCharacter.imageUrl && (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-stone-950/90 via-stone-950/95 to-stone-950 z-10" />
          <div className="absolute inset-0 bg-stone-950/40 z-[5]" />
          <img
            src={activeCharacter.imageUrl}
            alt="Background"
            className="w-full h-full object-cover opacity-12 scale-110 blur-[3px] transform-gpu"
          />
        </div>
      )}

      <div className="relative z-10">
        <header className="relative w-full border-b border-stone-800 pb-8 pt-6 px-4 md:px-8 overflow-hidden bg-stone-950/40 backdrop-blur-sm">
          <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
            <Shield className="w-96 h-96 transform rotate-12" />
          </div>
          <div className="container mx-auto max-w-6xl relative z-10">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col md:flex-row items-center gap-6"
            >
              {/* Avatar */}
              <div
                className="relative group perspective cursor-pointer"
                onClick={() => setIsEditingTraits(true)}
              >
                <div className="w-28 h-28 md:w-32 md:h-32 rounded-full border-4 border-stone-800/80 bg-stone-900 flex items-center justify-center shadow-2xl relative z-10 group-hover:border-amber-700/80 transition-all overflow-hidden">
                  {activeCharacter.imageUrl ? (
                    <img
                      src={activeCharacter.imageUrl}
                      alt={activeCharacter.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-5xl md:text-6xl filter drop-shadow-lg">
                      🧙‍♂️
                    </span>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Edit className="text-white" size={24} />
                  </div>
                </div>
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-stone-800 border border-stone-700 rounded-full text-[10px] font-bold uppercase tracking-wider text-amber-500 whitespace-nowrap z-20 shadow-lg">
                  Nível {activeCharacter.level}
                </div>
              </div>

              {/* Name & Basic Info */}
              <div className="flex-1 text-center md:text-left space-y-2 relative z-20">
                <div className="flex items-center justify-center md:justify-start gap-4">
                  <h1
                    className="text-4xl md:text-5xl font-serif font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-500 to-amber-700 drop-shadow-sm cursor-pointer hover:opacity-80 transition-opacity flex items-center gap-3 group/name"
                    onClick={() => setIsEditingTraits(true)}
                  >
                    {activeCharacter.name}
                    <Edit
                      size={20}
                      className="text-amber-500/0 group-hover/name:text-amber-500/50 transition-all"
                    />
                  </h1>
                  {!isMestre && (
                    <button
                      onClick={toggleFavorite}
                      className={`p-2 transition-colors ${
                        activeCharacter.isFavorite
                          ? "text-yellow-400"
                          : "text-stone-600"
                      }`}
                    >
                      <Star
                        size={24}
                        fill={
                          activeCharacter.isFavorite ? "currentColor" : "none"
                        }
                      />
                    </button>
                  )}
                  <button
                    onClick={handleExportPDF}
                    disabled={isExportingPDF}
                    className="p-2 transition-colors text-amber-500 hover:text-amber-400 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Exportar ficha em PDF"
                  >
                    {isExportingPDF ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          repeat: Infinity,
                          duration: 1,
                          ease: "linear",
                        }}
                      >
                        <Download size={24} />
                      </motion.div>
                    ) : (
                      <Download size={24} />
                    )}
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 justify-center md:justify-start items-center text-sm text-stone-100 font-serif">
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-900/10 rounded-lg border border-amber-900/30">
                    <Dna size={14} className="text-amber-500" />
                    {activeCharacter.race?.name}
                  </span>
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-900/10 rounded-lg border border-amber-900/30">
                    <Swords size={14} className="text-amber-500" />
                    {activeCharacter.class?.name}
                  </span>
                  {activeCharacter.origin && (
                    <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-900/10 rounded-lg border border-amber-900/30">
                      <BookOpen size={14} className="text-amber-500" />
                      {activeCharacter.origin.name}
                    </span>
                  )}
                  {activeCharacter.deity && (
                    <>
                      <span
                        className="flex items-center gap-1.5 px-3 py-1 bg-cyan-900/10 rounded-lg border border-cyan-900/30 text-cyan-100"
                        title={`Símbolo: ${activeCharacter.deity.simboloSagrado}`}
                      >
                        <Star size={14} className="text-cyan-500" />
                        {activeCharacter.deity.name}
                      </span>
                      {activeCharacter.deity.canalizacaoEnergia && (
                        <span
                          className="flex items-center gap-1.5 px-3 py-1 bg-purple-900/10 rounded-lg border border-purple-900/30 text-purple-100"
                          title="Canalização de Energia"
                        >
                          <Zap size={14} className="text-purple-500" />
                          {activeCharacter.deity.canalizacaoEnergia}
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* PV & PM */}
              <div className="flex gap-4 w-full md:w-auto mt-4 md:mt-0 relative z-20">
                {/* PV */}
                <div className="flex-1 md:flex-none relative group min-w-[120px]">
                  <div className="bg-gradient-to-br from-red-950/90 to-stone-900/90 backdrop-blur-md border border-red-900/50 rounded-2xl p-4 flex flex-col items-center relative overflow-hidden shadow-2xl">
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
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={tempPv}
                          onChange={(e) => setTempPv(Number(e.target.value))}
                          className="w-16 bg-black/40 border border-red-500/50 rounded text-center font-bold text-red-100 outline-none"
                          autoFocus
                        />
                        <button
                          onClick={handleSavePv}
                          className="p-1 bg-green-900/20 text-green-500 rounded"
                        >
                          <Check size={14} />
                        </button>
                      </div>
                    ) : (
                      <div
                        className="text-2xl font-black text-red-100 tabular-nums"
                        onClick={() => setIsEditingPv(true)}
                      >
                        {activeCharacter.currentPv ?? hpMax}
                        <span className="text-sm text-red-500/60 ml-1 font-medium">
                          / {hpMax}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                {/* PM */}
                <div className="flex-1 md:flex-none relative group min-w-[120px]">
                  <div className="bg-gradient-to-br from-blue-950/90 to-stone-900/90 backdrop-blur-md border border-blue-900/50 rounded-2xl p-4 flex flex-col items-center relative overflow-hidden shadow-2xl">
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="text-xs font-bold text-blue-400/80 uppercase tracking-widest">
                        Mana (PM)
                      </span>
                      {!isEditingPm && (
                        <button
                          onClick={() => setIsEditingPm(true)}
                          className="p-1 text-blue-400/50 hover:text-blue-300"
                        >
                          <Edit size={12} />
                        </button>
                      )}
                    </div>
                    {isEditingPm ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={tempPm}
                          onChange={(e) => setTempPm(Number(e.target.value))}
                          className="w-16 bg-black/40 border border-blue-500/50 rounded text-center font-bold text-blue-100 outline-none"
                          autoFocus
                        />
                        <button
                          onClick={handleSavePm}
                          className="p-1 bg-green-900/20 text-green-500 rounded"
                        >
                          <Check size={14} />
                        </button>
                      </div>
                    ) : (
                      <div
                        className="text-2xl font-black text-blue-100 tabular-nums"
                        onClick={() => setIsEditingPm(true)}
                      >
                        {activeCharacter.currentPm ?? pmMax}
                        <span className="text-sm text-blue-500/60 ml-1 font-medium">
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

        <main className="container mx-auto max-w-6xl px-4 md:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left - Attributes & Basic Stats */}
            <div className="lg:col-span-4 space-y-8">
              {/* Attributes */}
              <section className="bg-stone-900/90 backdrop-blur-md border border-stone-800/70 rounded-3xl p-6 shadow-2xl">
                <h3 className="text-xs font-black text-amber-600/80 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                  <Swords size={16} /> Atributos
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {attributesList.map((attr) => {
                    const value = activeCharacter.attributes[attr.key];
                    const mod = getAttrMod(value);
                    const bonus =
                      typeof value === "object" && value !== null
                        ? (value as any).bonus || 0
                        : 0;
                    return (
                      <div
                        key={attr.key}
                        className={`bg-black/60 backdrop-blur-sm border ${
                          bonus > 0 ? "border-amber-500/40" : "border-white/10"
                        } rounded-2xl p-4 flex flex-col items-center group transition-all`}
                      >
                        <span className="text-[10px] font-black text-stone-500 uppercase tracking-widest mb-1">
                          {attr.label}
                        </span>
                        <div className="text-3xl font-black text-stone-100 tabular-nums">
                          {mod >= 0 ? `+${mod}` : mod}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Defense & Money */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-stone-900/90 backdrop-blur-md border border-stone-800/70 rounded-3xl p-6 shadow-2xl flex flex-col items-center">
                  <Shield size={24} className="text-amber-500 mb-2" />
                  <span className="text-[10px] font-black text-stone-500 uppercase tracking-widest mb-1">
                    Defesa
                  </span>
                  <div className="text-3xl font-black text-stone-100">
                    {10 +
                      getAttrMod(activeCharacter.attributes?.Destreza) +
                      ((activeCharacter as any).bag?.armorPenalty || 0)}
                  </div>
                </div>
                <div className="bg-stone-900/90 backdrop-blur-md border border-stone-800/70 rounded-3xl p-6 shadow-2xl flex flex-col items-center group">
                  <Coins size={24} className="text-amber-500 mb-2" />
                  <span className="text-[10px] font-black text-stone-500 uppercase tracking-widest mb-1">
                    Tibares
                  </span>
                  {isEditingMoney ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        value={tempMoney}
                        onChange={(e) => setTempMoney(Number(e.target.value))}
                        className="w-full bg-black/40 border border-amber-500/50 rounded text-center text-sm font-bold text-amber-100 outline-none"
                        autoFocus
                      />
                      <button
                        onClick={handleSaveMoney}
                        className="text-green-500"
                      >
                        <Check size={14} />
                      </button>
                    </div>
                  ) : (
                    <div
                      className="text-2xl font-black text-stone-100 flex items-center gap-2 cursor-pointer"
                      onClick={() => setIsEditingMoney(true)}
                    >
                      {activeCharacter.money || 0}
                      <Link
                        href="/market"
                        className="ml-2 bg-amber-900/20 hover:bg-amber-900/40 p-1 rounded transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <LinkIcon size={12} className="text-amber-500" />
                      </Link>
                    </div>
                  )}
                </div>

                {/* Espaço (Carga) */}
                <div className="col-span-2 bg-stone-900/90 backdrop-blur-md border border-stone-800/70 rounded-3xl p-5 shadow-2xl flex flex-col hover:border-amber-500/30 transition-all border-white/5">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2 text-amber-500/90">
                      <Backpack size={16} className="text-amber-500" />
                      <span className="text-[10px] font-black text-stone-500 uppercase tracking-widest">
                        Espaço na Mochila
                      </span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span
                        className={`text-lg font-black tabular-nums ${
                          usedSpaces > maxSpaces
                            ? "text-red-500"
                            : "text-stone-100"
                        }`}
                      >
                        {usedSpaces}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase ${
                          usedSpaces > maxSpaces
                            ? "text-red-500"
                            : "text-stone-500"
                        }`}
                      >
                        / {maxSpaces}
                      </span>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden border border-white/5 relative">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${Math.min(
                          100,
                          maxSpaces > 0 ? (usedSpaces / maxSpaces) * 100 : 0
                        )}%`,
                      }}
                      className={`h-full relative z-10 ${
                        usedSpaces > maxSpaces
                          ? "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                          : "bg-gradient-to-r from-amber-600 to-amber-400"
                      }`}
                    />
                    {usedSpaces > maxSpaces && (
                      <div className="absolute inset-0 bg-red-500/20 animate-pulse" />
                    )}
                  </div>
                  {usedSpaces > maxSpaces && (
                    <p className="text-[9px] text-red-400 mt-2 font-black uppercase tracking-tighter animate-pulse">
                      ⚠️ Você está sobrecarregado!
                    </p>
                  )}
                </div>
              </div>

              {/* Skills */}
              <SimpleList
                title="Perícias"
                items={activeCharacter.skills || []}
                icon={Brain}
                highlightedItems={originSkillsList}
                highlightIcon={MapPin}
              />
            </div>

            {/* Right - Abilities & Inventory */}
            <div className="lg:col-span-8 space-y-12">
              <div className="pt-2">
                <SectionSlider
                  title="Benefícios de Origem"
                  items={originPowers}
                  icon={BookOpen}
                />
                <SectionSlider
                  title="Habilidades de Classe"
                  items={activeCharacter.class?.abilities?.filter(
                    (a: any) =>
                      // Se não tiver nível definido, assume 1. Se tiver, respeita o nível do personagem.
                      (a.nivel || 1) <= (activeCharacter.level || 1)
                  )}
                  icon={Zap}
                />
                <SectionSlider
                  title="Poderes de Classe"
                  items={(activeCharacter as any).classPowers || []}
                  icon={Star}
                />
                <SimpleList
                  title="Habilidades de Raça"
                  items={activeCharacter.race?.abilities}
                  icon={Dna}
                />
                {activeCharacter.deity && (
                  <div className="mb-10">
                    <h3 className="text-xs font-black text-amber-500/90 uppercase tracking-[0.2em] mb-4 flex items-center gap-2 border-b border-stone-800/50 pb-2">
                      <Sparkles size={14} /> Devoção:{" "}
                      {activeCharacter.deity.name}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="bg-stone-900/40 p-3 rounded-xl border border-stone-800/50">
                        <span className="text-[9px] font-black text-amber-600/60 uppercase tracking-widest block mb-1">
                          Crenças
                        </span>
                        <p className="text-xs text-stone-300 leading-relaxed italic line-clamp-3">
                          {activeCharacter.deity.crencasObjetivos}
                        </p>
                      </div>
                      <div className="bg-stone-900/40 p-3 rounded-xl border border-stone-800/50">
                        <span className="text-[9px] font-black text-amber-600/60 uppercase tracking-widest block mb-1">
                          Restrições
                        </span>
                        <p className="text-xs text-red-300/80 leading-relaxed italic line-clamp-3">
                          {activeCharacter.deity.obrigacoesRestricoes}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                {/* Poderes Concedidos */}
                {((activeCharacter.grantedPowers &&
                  activeCharacter.grantedPowers.length > 0) ||
                  (activeCharacter as any).grantedPower) && (
                  <SimpleList
                    title="Poderes Concedidos"
                    items={
                      activeCharacter.grantedPowers &&
                      activeCharacter.grantedPowers.length > 0
                        ? activeCharacter.grantedPowers
                        : [(activeCharacter as any).grantedPower]
                    }
                    icon={Zap}
                    useIconAsBullet={true}
                  />
                )}
              </div>

              {/* Inventory Split */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <ItemList
                  title="Armas & Ataques"
                  items={weapons || []}
                  icon={Swords}
                />
                <ItemList title="Mochila" items={others} icon={Backpack} />
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Traits Modal */}
      <AnimatePresence>
        {isEditingTraits && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditingTraits(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-2xl bg-stone-900 border border-stone-800 rounded-3xl overflow-hidden shadow-2xl"
            >
              <div className="bg-stone-950 p-6 border-b border-stone-800 flex justify-between items-center">
                <h2 className="text-2xl font-serif font-black text-amber-500">
                  Estética do Herói
                </h2>
                <button
                  onClick={() => setIsEditingTraits(false)}
                  className="p-2 hover:bg-stone-800 rounded-full transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar space-y-8">
                {/* Image */}
                <div className="flex flex-col items-center p-6 bg-black/40 rounded-3xl border border-dashed border-stone-800 group">
                  <div className="w-32 h-32 rounded-full border-4 border-stone-800 bg-stone-900 overflow-hidden mb-4 relative">
                    {isUploading ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                        <Upload className="animate-bounce" />
                      </div>
                    ) : activeCharacter.imageUrl ? (
                      <img
                        src={activeCharacter.imageUrl}
                        className="w-full h-full object-cover"
                        alt="Avatar"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl">
                        🧙‍♂️
                      </div>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <label className="cursor-pointer bg-amber-600 hover:bg-amber-500 text-black font-black px-6 py-2 rounded-xl transition-all shadow-lg text-sm uppercase tracking-widest flex items-center gap-2">
                      <Upload size={16} /> Carregar Imagem
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={isUploading}
                      />
                    </label>
                    {activeCharacter.imageUrl && (
                      <button
                        onClick={handleDeleteImage}
                        className="bg-red-600 hover:bg-red-500 text-white font-black px-6 py-2 rounded-xl transition-all shadow-lg text-sm uppercase tracking-widest flex items-center gap-2"
                      >
                        <Trash2 size={16} /> Apagar
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div className="md:col-span-2">
                    <label className="text-[10px] font-black text-amber-500 uppercase tracking-widest block mb-1">
                      O Nome do Herói
                    </label>
                    <input
                      type="text"
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      placeholder="Ex: Valerius de Valkaria"
                      className="w-full bg-black/40 border border-stone-800 rounded-xl px-4 py-3 text-xl font-cinzel text-amber-100 focus:border-amber-500/50 outline-none"
                    />
                  </div>
                  {/* Fields */}
                  {["gender", "hair", "eyes", "skin", "height", "scars"].map(
                    (field) => (
                      <div key={field}>
                        <label className="text-[10px] font-black text-amber-600/60 uppercase tracking-widest block mb-1">
                          {field}
                        </label>
                        <input
                          type="text"
                          value={(tempTraits as any)[field]}
                          onChange={(e) =>
                            setTempTraits({
                              ...tempTraits,
                              [field]: e.target.value,
                            })
                          }
                          className="w-full bg-black/40 border border-stone-800 rounded-xl px-4 py-2 focus:border-amber-500/50 outline-none"
                        />
                      </div>
                    )
                  )}
                  <div className="md:col-span-2">
                    <label className="text-[10px] font-black text-amber-600/60 uppercase tracking-widest block mb-1">
                      Outros Detalhes
                    </label>
                    <textarea
                      value={tempTraits.extra}
                      onChange={(e) =>
                        setTempTraits({ ...tempTraits, extra: e.target.value })
                      }
                      className="w-full bg-black/40 border border-stone-800 rounded-xl px-4 py-3 focus:border-amber-500/50 outline-none min-h-[80px]"
                    />
                  </div>
                </div>

                <div className="bg-stone-950/50 p-4 rounded-xl border border-stone-800">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-bold text-amber-500 text-xs flex items-center gap-2">
                      <Wand2 size={14} /> Gerador de Prompt IA
                    </h4>
                    <button
                      onClick={copyPromptToClipboard}
                      className="text-[10px] bg-stone-800 hover:bg-stone-700 px-2 py-1 rounded text-stone-300 transition-colors"
                    >
                      Copiar Prompt
                    </button>
                  </div>
                  <p className="text-[10px] text-stone-400 italic">
                    {generateCharacterPrompt({
                      ...activeCharacter,
                      physicalTraits: tempTraits,
                    })}
                  </p>
                </div>

                <button
                  onClick={saveTraits}
                  className="w-full bg-amber-600 hover:bg-amber-500 text-black font-black py-4 rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 uppercase tracking-widest text-sm"
                >
                  <Check size={20} /> Salvar Alterações
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
