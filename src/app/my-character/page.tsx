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
  Package,
  FlaskRound,
  Shirt,
  Utensils,
  Hammer,
  User,
  Wand2,
  Star,
  Upload,
  Apple,
  Crosshair,
} from "lucide-react";
import { generateCharacterPrompt } from "@/utils/promptGenerator";
import { compressImage } from "@/utils/imageCompression";
import { doc, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/firebaseConfig";
import { motion, AnimatePresence } from "framer-motion";
import { Atributo } from "@/data/atributos";
import Link from "next/link";
import { CharacterService } from "@/lib/characterService";
import { getRaceByName } from "@/data/racas";
import CLASSES from "@/data/classes";
import { formatAssetName } from "@/utils/assetUtils";
import { calculateCarryCapacity } from "@/utils/inventoryUtils";

// --- SUB-COMPONENTS ---

// Helper to get specialized icons for items
const getItemSymbol = (item: any, size = 18) => {
  const group = (item.group || "").toLowerCase();
  const name = (item.nome || item.name || "").toLowerCase();

  if (
    group.includes("armadura") ||
    group.includes("escudo") ||
    item.defenseBonus
  ) {
    return <Shield size={size} />;
  }

  if (group.includes("arma")) {
    const isRanged =
      item.alcance &&
      item.alcance !== "-" &&
      item.alcance.toLowerCase() !== "corpo a corpo";
    if (
      isRanged ||
      name.includes("arco") ||
      name.includes("besta") ||
      name.includes("tiro") ||
      name.includes("disparo")
    )
      return <Crosshair size={size} />;
    if (name.includes("machado"))
      return <Hammer size={size} className="rotate-45" />;
    if (name.includes("adaga") || name.includes("faca"))
      return <Sword size={size - 2} />;
    return <Swords size={size} />;
  }

  if (
    group.includes("alquimia") ||
    group.includes("poção") ||
    group.includes("elixir") ||
    group.includes("mágico")
  )
    return <FlaskRound size={size} />;
  if (
    group.includes("vestuário") ||
    group.includes("veste") ||
    group.includes("capa")
  )
    return <Shirt size={size} />;
  if (group.includes("alimento") || group.includes("comida"))
    return <Apple size={size} />;
  if (
    group.includes("ferramenta") ||
    group.includes("ofício") ||
    name.includes("kit") ||
    name.includes("instrumento")
  )
    return <Hammer size={size} />;
  if (
    group.includes("mochila") ||
    group.includes("saco") ||
    group.includes("carga")
  )
    return <Backpack size={size} />;

  return <Package size={size} />;
};

const DetailRow = ({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) => (
  <div className="flex justify-between items-center text-xs py-1 border-b border-white/5 last:border-0">
    <span className="text-amber-600/80 font-black uppercase tracking-widest text-[10px]">
      {label}
    </span>
    <span className="text-stone-100 font-bold text-right">{value}</span>
  </div>
);

const ItemList = ({ title, items, icon: Icon }: any) => {
  if (!items || items.length === 0) return null;
  return (
    <div className="mb-8">
      <h3 className="text-xs font-black text-amber-600/80 uppercase tracking-[0.2em] mb-4 flex items-center gap-2 border-b border-stone-800/50 pb-2">
        {Icon && <Icon size={14} />} {title}
      </h3>
      <div className="space-y-3">
        {items.map((item: any, idx: number) => {
          return (
            <div
              key={idx}
              className="bg-stone-900/90 border border-stone-800/50 rounded-lg p-4 hover:border-amber-500/30 transition-all shadow-xl"
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-stone-100 text-sm flex items-center gap-2">
                  <span className="text-amber-500/60">
                    {getItemSymbol(item, 16)}
                  </span>
                  {item.name || item.nome}
                </h4>
                <div className="flex items-center gap-2">
                  {item.quantidade > 1 && (
                    <span className="text-[10px] bg-stone-800 text-stone-300 px-1.5 py-0.5 rounded border border-stone-700 font-bold">
                      x{item.quantidade}
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-1 mb-2">
                {item.dano && (
                  <DetailRow
                    label="Dano"
                    value={`${item.dano} ${
                      item.critico ? `/ ${item.critico}` : ""
                    }`}
                  />
                )}
                {item.defenseBonus > 0 && (
                  <DetailRow
                    label="Bônus Defesa"
                    value={`+${item.defenseBonus}`}
                  />
                )}
                {item.armorPenalty > 0 && (
                  <DetailRow
                    label="Penalidade"
                    value={`-${item.armorPenalty}`}
                  />
                )}
                {item.alcance && item.alcance !== "-" && (
                  <DetailRow label="Alcance" value={item.alcance} />
                )}
                {item.spaces !== undefined && item.spaces !== null && (
                  <DetailRow
                    label="Espaço"
                    value={
                      item.spaces === 0 ? (
                        <span className="text-emerald-400 font-bold">
                          Grátis
                        </span>
                      ) : (
                        item.spaces
                      )
                    }
                  />
                )}
                {item.preco !== undefined && (
                  <DetailRow
                    label="Valor"
                    value={item.preco === 0 ? "Grátis" : `${item.preco} T$`}
                  />
                )}
              </div>

              {(item.description || item.text || item.effect) && (
                <p className="text-xs text-stone-400 line-clamp-4 italic border-t border-white/5 pt-3 mt-3 leading-relaxed">
                  {item.description || item.text || item.effect}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const SimpleList = ({ title, items, icon: Icon }: any) => {
  if (!items || items.length === 0) return null;
  return (
    <div className="mb-8">
      <h3 className="text-xs font-black text-amber-600/80 uppercase tracking-[0.2em] mb-4 flex items-center gap-2 border-b border-stone-800/50 pb-2">
        {Icon && <Icon size={14} />} {title}
      </h3>
      <ul className="space-y-2">
        {items.map((item: any, idx: number) => {
          const name = typeof item === "string" ? item : item.name || item.nome;
          const desc =
            typeof item === "string"
              ? null
              : item.text || item.description || item.effect;

          return (
            <li
              key={idx}
              className="bg-stone-900/90 border border-stone-800/50 rounded-lg px-4 py-3 text-sm text-stone-200 flex items-start gap-3 shadow-md"
            >
              <div className="mt-2 min-w-[6px] h-[6px] bg-amber-500 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
              <div className="flex-1">
                <span className="font-bold block text-stone-100 mb-1">
                  {name}
                </span>
                {desc && (
                  <span className="text-xs text-stone-400 block leading-relaxed italic">
                    {desc}
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

const SectionSlider = ({ title, items, icon: Icon }: any) => {
  if (!items || items.length === 0) return null;
  return (
    <div className="mb-10 group">
      <div className="flex items-center justify-between mb-4 px-1">
        <h3 className="text-xs font-black text-amber-600/80 uppercase tracking-[0.2em] flex items-center gap-2">
          {Icon && <Icon size={14} />} {title}
        </h3>
        <span className="text-[10px] text-stone-600 font-bold uppercase tracking-wider animate-pulse">
          Deslize &rarr;
        </span>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-6 -mx-4 px-4 scrollbar-none snap-x cursor-grab active:cursor-grabbing">
        {items.map((item: any, idx: number) => {
          const name = typeof item === "string" ? item : item.name || item.nome;
          const desc =
            typeof item === "string"
              ? null
              : item.text || item.description || item.effect;
          return (
            <div
              key={idx}
              className="min-w-[300px] md:min-w-[350px] bg-gradient-to-br from-stone-900 to-stone-950 border border-stone-800 rounded-xl p-6 snap-start shadow-2xl hover:border-amber-900/50 transition-all flex flex-col border-white/5"
            >
              <span className="font-serif font-bold text-amber-500 text-xl mb-4 block border-b border-white/5 pb-2">
                {name}
              </span>
              {desc && (
                <p className="text-sm text-stone-300 leading-relaxed italic line-clamp-6">
                  {desc}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default function MyCharacterPage() {
  const router = useRouter();
  const { activeCharacter, updateActiveCharacter } = useCharacterStore();
  const [initializing, setInitializing] = useState(true);

  // States for Money Management
  const [isEditingMoney, setIsEditingMoney] = useState(false);
  const [tempMoney, setTempMoney] = useState(0);

  // States for Resources (PV/PM)
  const [isEditingPv, setIsEditingPv] = useState(false);
  const [tempPv, setTempPv] = useState(0);
  const [isEditingPm, setIsEditingPm] = useState(false);
  const [tempPm, setTempPm] = useState(0);

  // States for Traits & Image
  const [isEditingTraits, setIsEditingTraits] = useState(false);
  const [tempTraits, setTempTraits] = useState<{
    gender: string;
    hair: string;
    eyes: string;
    skin: string;
    scars: string;
    extra: string;
    height: string;
  }>({
    gender: "",
    hair: "",
    eyes: "",
    skin: "",
    extra: "",
    scars: "",
    height: "",
  });
  const [isUploading, setIsUploading] = useState(false);

  // Load existing traits when opening modal
  useEffect(() => {
    if (activeCharacter?.physicalTraits) {
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
  }, [activeCharacter, isEditingTraits]);

  const saveTraits = async () => {
    if (!auth?.currentUser || !activeCharacter) return;

    // Optimistic update
    const updatedChar = { ...activeCharacter, physicalTraits: tempTraits };
    updateActiveCharacter(updatedChar);
    setIsEditingTraits(false);

    try {
      await CharacterService.updateCharacter(
        auth.currentUser.uid,
        activeCharacter.id!,
        {
          physicalTraits: tempTraits,
        }
      );
    } catch (error) {
      console.error("Failed to save traits", error);
      alert("Erro ao salvar características.");
    }
  };

  const copyPromptToClipboard = () => {
    if (!activeCharacter) return;

    const prompt = generateCharacterPrompt({
      ...activeCharacter,
      physicalTraits: tempTraits,
    });
    navigator.clipboard.writeText(prompt);
    alert("Prompt copiado!");
  };

  const toggleFavorite = async () => {
    if (!auth?.currentUser || !activeCharacter) return;
    const char = activeCharacter;
    const newVal = !char.isFavorite;

    // Optimistic UI
    updateActiveCharacter({ isFavorite: newVal });

    try {
      if (newVal) {
        // Use the Master Favorite System service to ensure exclusivity
        await CharacterService.setFavoriteCharacter(
          auth.currentUser.uid,
          char.id!
        );
      } else {
        // Just untoggle
        await CharacterService.updateCharacter(auth.currentUser.uid, char.id!, {
          isFavorite: false,
        });
      }
    } catch (e) {
      console.error(e);
      // Revert on error
      updateActiveCharacter({ isFavorite: !newVal });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !activeCharacter)
      return;
    const file = e.target.files[0];

    setIsUploading(true);
    try {
      const compressed = await compressImage(file);
      const { ref, uploadBytes, getDownloadURL } = await import(
        "firebase/storage"
      );
      const { storage } = await import("@/firebaseConfig");

      if (!storage || !auth?.currentUser)
        throw new Error("Storage/Auth not ready");

      const storageRef = ref(
        storage,
        `character-images/${auth.currentUser.uid}/${activeCharacter.id}/${file.name}`
      );
      await uploadBytes(storageRef, compressed);
      const url = await getDownloadURL(storageRef);

      // Update DB
      await CharacterService.updateCharacter(
        auth.currentUser.uid,
        activeCharacter.id!,
        { imageUrl: url }
      );
      updateActiveCharacter({ imageUrl: url });
    } catch (error) {
      console.error("Upload failed", error);
      alert("Erro ao enviar imagem.");
    } finally {
      setIsUploading(false);
    }
  };

  // Authentication and Character Check
  useEffect(() => {
    if (!auth) return;

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

        // Derive max values first to safeguard defaults
        const conAttr = (activeCharacter.attributes as any).Constituição;
        const conMod = conAttr?.mod ?? conAttr ?? 0;
        const hpBase = activeCharacter.class?.pv || 16;
        const hpMax = hpBase + conMod;
        const pmBase = activeCharacter.class?.pm || 4;
        const pmMax = pmBase;

        setTempPv(activeCharacter.currentPv ?? hpMax);
        setTempPm(activeCharacter.currentPm ?? pmMax);
      }
    });

    return () => unsubscribeAuth?.();
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

        // Hydration Logic for Legacy/Missing Data
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
              // Clone to avoid reference issues
              data.class = JSON.parse(JSON.stringify(foundClass));
            }
          } catch (e) {
            console.error("Failed to hydrate class:", e);
          }
        }

        updateActiveCharacter(data);

        // Recalculate maxes for defaults
        const rawCon = (data.attributes as any)?.Constituição;
        const conMod = typeof rawCon === "number" ? rawCon : rawCon?.mod || 0;
        const hpBase = data.class?.pv || 16;
        const hpMax = hpBase + conMod;
        const pmBase = data.class?.pm || 4;
        const pmMax = pmBase;

        if (!isEditingMoney) setTempMoney(data.money || 0);
        if (!isEditingPv) setTempPv(data.currentPv ?? hpMax);
        if (!isEditingPm) setTempPm(data.currentPm ?? pmMax);
      }
    });

    return () => unsubscribeSnapshot();
  }, [
    activeCharacter?.id,
    updateActiveCharacter,
    isEditingMoney,
    isEditingPv,
    isEditingPm,
  ]);

  const handleSaveMoney = async () => {
    if (!auth || !activeCharacter || !auth.currentUser) return;

    try {
      updateActiveCharacter({ money: tempMoney });
      setIsEditingMoney(false);
      await CharacterService.updateCharacter(
        auth.currentUser.uid,
        activeCharacter.id!,
        { money: tempMoney }
      );
    } catch (e) {
      console.error(e);
      alert("Erro ao salvar Tibares.");
    }
  };

  const handleSavePv = async () => {
    if (!auth || !activeCharacter || !auth.currentUser) return;
    try {
      updateActiveCharacter({ currentPv: tempPv });
      setIsEditingPv(false);
      await CharacterService.updateCharacter(
        auth.currentUser.uid,
        activeCharacter.id!,
        { currentPv: tempPv }
      );
    } catch (e) {
      console.error(e);
      alert("Erro ao salvar PV.");
    }
  };

  const handleSavePm = async () => {
    if (!auth || !activeCharacter || !auth.currentUser) return;
    try {
      updateActiveCharacter({ currentPm: tempPm });
      setIsEditingPm(false);
      await CharacterService.updateCharacter(
        auth.currentUser.uid,
        activeCharacter.id!,
        { currentPm: tempPm }
      );
    } catch (e) {
      console.error(e);
      alert("Erro ao salvar PM.");
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
  const getAttrMod = (attr: any) => attr?.mod ?? attr ?? 0;
  const conMod = getAttrMod(activeCharacter.attributes.Constituição);
  const hpBase = activeCharacter.class?.pv || 16;
  const hpMax = hpBase + conMod;
  const currentHp = activeCharacter.currentPv ?? hpMax;

  const pmBase = activeCharacter.class?.pm || 4;
  const pmMax = pmBase;
  const currentPm = activeCharacter.currentPm ?? pmMax;

  const attributesList: { key: Atributo; label: string; icon: any }[] = [
    { key: Atributo.FORCA, label: "Força", icon: Swords },
    { key: Atributo.DESTREZA, label: "Destreza", icon: Ghost },
    { key: Atributo.CONSTITUICAO, label: "Constituição", icon: Heart },
    { key: Atributo.INTELIGENCIA, label: "Inteligência", icon: Brain },
    { key: Atributo.SABEDORIA, label: "Sabedoria", icon: Scroll },
    { key: Atributo.CARISMA, label: "Carisma", icon: Crown },
  ];

  return (
    <div className="text-neutral-200 pb-20 font-sans selection:bg-amber-900 selection:text-white">
      {/* Full Page Background Image */}
      {activeCharacter.imageUrl && (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-stone-950/80 via-stone-950/95 to-stone-950 z-10" />
          <div className="absolute inset-0 bg-stone-950/60 z-[5]" />
          <img
            src={activeCharacter.imageUrl}
            alt="Background"
            className="w-full h-full object-cover opacity-15 scale-110 blur-[3px] transform-gpu"
          />
        </div>
      )}
      {/* --- HERO HEADER --- */}
      <header className="relative w-full border-b border-stone-800 pb-8 pt-6 px-4 md:px-8 overflow-hidden z-10 bg-stone-950/40 backdrop-blur-sm">
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
            <div
              className="relative group perspective cursor-pointer"
              onClick={() => setIsEditingTraits(true)}
            >
              <div className="w-28 h-28 md:w-32 md:h-32 rounded-full border-4 border-stone-800/80 bg-stone-900 flex items-center justify-center shadow-[0_0_30px_rgba(0,0,0,0.5)] relative z-10 group-hover:border-amber-700/80 transition-all overflow-hidden">
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
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Edit className="text-white" size={24} />
                </div>
              </div>
              <div className="absolute inset-0 bg-amber-500/20 rounded-full blur-xl group-hover:bg-amber-500/30 transition-all" />
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-stone-800 border border-stone-700 rounded-full text-[10px] font-bold uppercase tracking-wider text-amber-500 whitespace-nowrap z-20 shadow-lg">
                Nível {activeCharacter.level}
              </div>
            </div>

            {/* Character Info */}
            <div className="flex-1 text-center md:text-left space-y-2 relative z-20">
              <div className="flex items-center justify-center md:justify-start gap-4">
                <h1 className="text-4xl md:text-5xl font-serif font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-500 to-amber-700 drop-shadow-sm">
                  {activeCharacter.name}
                </h1>
                <button
                  onClick={() => setIsEditingTraits(true)}
                  className="p-2 text-stone-500 hover:text-amber-500 transition-colors"
                  title="Editar Aparência e Avatar"
                >
                  <Edit size={20} />
                </button>
                <button
                  onClick={toggleFavorite}
                  className={`p-2 transition-colors ${
                    activeCharacter.isFavorite
                      ? "text-yellow-400 hover:text-yellow-200"
                      : "text-stone-600 hover:text-stone-400"
                  }`}
                  title={
                    activeCharacter.isFavorite
                      ? "Remover dos Favoritos"
                      : "Marcar como Favorito"
                  }
                >
                  <Star
                    size={24}
                    fill={activeCharacter.isFavorite ? "currentColor" : "none"}
                  />
                </button>
              </div>

              <div className="flex flex-wrap gap-2 justify-center md:justify-start items-center text-sm text-stone-100 font-serif">
                <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-900/10 rounded-lg border border-amber-900/30 hover:bg-amber-900/20 hover:text-amber-200 transition-colors cursor-help">
                  <Dna size={14} className="text-amber-500" />
                  {activeCharacter.race?.name || "Raça Desconhecida"}
                </span>
                <span className="w-1 h-1 bg-stone-700 rounded-full" />
                <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-900/10 rounded-lg border border-amber-900/30 hover:bg-amber-900/20 hover:text-amber-200 transition-colors cursor-help">
                  <Swords size={14} className="text-amber-500" />
                  {activeCharacter.class?.name || "Classe Desconhecida"}
                </span>
                {activeCharacter.origin && (
                  <>
                    <span className="w-1 h-1 bg-stone-700 rounded-full" />
                    <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-900/10 rounded-lg border border-amber-900/30 hover:bg-amber-900/20 hover:text-amber-200 transition-colors cursor-help">
                      <BookOpen size={14} className="text-amber-500" />
                      {activeCharacter.origin.name}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Resources (HP/MP) */}
            <div className="flex gap-4 w-full md:w-auto mt-4 md:mt-0 relative z-20">
              {/* HP Box */}
              <div className="flex-1 md:flex-none relative group min-w-[120px]">
                <div className="absolute inset-x-4 bottom-0 h-10 bg-red-500/20 blur-xl group-hover:bg-red-500/30 transition-all" />
                <div className="bg-gradient-to-br from-red-950/90 to-stone-900/90 backdrop-blur-md border border-red-900/50 rounded-2xl p-4 flex flex-col items-center relative overflow-hidden shadow-2xl">
                  <div className="absolute top-0 right-0 p-2 opacity-10">
                    <Heart size={40} />
                  </div>
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
                    <div className="flex items-center gap-1 animate-in fade-in zoom-in">
                      <div className="flex items-baseline gap-1">
                        <input
                          type="number"
                          value={tempPv}
                          onChange={(e) => setTempPv(Number(e.target.value))}
                          className="w-16 bg-black/40 border border-red-500/50 rounded text-center font-bold text-red-100 outline-none focus:ring-1 focus:ring-red-500/30"
                          autoFocus
                        />
                        <span className="text-xs text-red-500/60 font-medium whitespace-nowrap">
                          / {hpMax}
                        </span>
                      </div>
                      <div className="flex gap-1 ml-1">
                        <button
                          onClick={handleSavePv}
                          className="p-1 bg-green-900/20 text-green-500 hover:bg-green-900/40 rounded"
                        >
                          <Check size={14} />
                        </button>
                        <button
                          onClick={() => setIsEditingPv(false)}
                          className="p-1 bg-red-900/20 text-red-500 hover:bg-red-900/40 rounded"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="flex items-baseline gap-1 cursor-pointer group/value"
                      onClick={() => setIsEditingPv(true)}
                    >
                      <span className="text-3xl font-black text-red-100 group-hover/value:text-red-400 transition-colors">
                        {currentHp}
                      </span>
                      <span className="text-xs text-red-500/60 font-medium">
                        / {hpMax}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Mana Box */}
              <div className="flex-1 md:flex-none relative group min-w-[120px]">
                <div className="absolute inset-x-4 bottom-0 h-10 bg-blue-500/20 blur-xl group-hover:bg-blue-500/30 transition-all" />
                <div className="bg-gradient-to-br from-blue-950/90 to-stone-900/90 backdrop-blur-md border border-blue-900/50 rounded-2xl p-4 flex flex-col items-center relative overflow-hidden shadow-2xl">
                  <div className="absolute top-0 right-0 p-2 opacity-10">
                    <Zap size={40} />
                  </div>
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="text-xs font-bold text-blue-400/80 uppercase tracking-widest">
                      Mana (PM)
                    </span>
                    {!isEditingPm && (
                      <button
                        onClick={() => setIsEditingPm(true)}
                        className="p-1 text-blue-400/50 hover:text-blue-300 transition-colors"
                      >
                        <Edit size={12} />
                      </button>
                    )}
                  </div>

                  {isEditingPm ? (
                    <div className="flex items-center gap-1 animate-in fade-in zoom-in">
                      <div className="flex items-baseline gap-1">
                        <input
                          type="number"
                          value={tempPm}
                          onChange={(e) => setTempPm(Number(e.target.value))}
                          className="w-16 bg-black/40 border border-blue-500/50 rounded text-center font-bold text-blue-100 outline-none focus:ring-1 focus:ring-blue-500/30"
                          autoFocus
                        />
                        <span className="text-xs text-blue-500/60 font-medium whitespace-nowrap">
                          / {pmMax}
                        </span>
                      </div>
                      <div className="flex gap-1 ml-1">
                        <button
                          onClick={handleSavePm}
                          className="p-1 bg-green-900/20 text-green-500 hover:bg-green-900/40 rounded"
                        >
                          <Check size={14} />
                        </button>
                        <button
                          onClick={() => setIsEditingPm(false)}
                          className="p-1 bg-red-900/20 text-red-500 hover:bg-red-900/40 rounded"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="flex items-baseline gap-1 cursor-pointer group/value"
                      onClick={() => setIsEditingPm(true)}
                    >
                      <span className="text-3xl font-black text-blue-100 group-hover/value:text-blue-400 transition-colors">
                        {currentPm}
                      </span>
                      <span className="text-xs text-blue-500/60 font-medium">
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

      {/* --- TRAITS & IMAGE MODAL --- */}
      <AnimatePresence>
        {isEditingTraits && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-stone-900 border border-amber-900/50 rounded-2xl p-6 w-full max-w-2xl shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <div className="flex justify-between items-center mb-6 border-b border-stone-800 pb-4">
                <h3 className="text-xl font-serif text-amber-500 flex items-center gap-2">
                  <User size={24} /> Aparência do Personagem
                </h3>
                <button
                  onClick={() => setIsEditingTraits(false)}
                  className="text-stone-500 hover:text-white"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-6">
                {/* Image Upload Section */}
                <div className="flex flex-col items-center gap-4 p-4 bg-stone-950/50 rounded-xl border border-stone-800">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-stone-800 relative bg-stone-900">
                    {activeCharacter.imageUrl ? (
                      <img
                        src={activeCharacter.imageUrl}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-4xl absolute inset-0 flex items-center justify-center">
                        🧙‍♂️
                      </span>
                    )}
                    {isUploading && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-center gap-2">
                    <label className="cursor-pointer bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors flex items-center gap-2">
                      <Upload size={16} />
                      Carregar Imagem
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                        disabled={isUploading}
                      />
                    </label>
                    <p className="text-xs text-stone-500">
                      A imagem será comprimida automaticamente.
                    </p>
                  </div>
                </div>

                {/* Traits Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs uppercase font-bold text-stone-500">
                      Gênero
                    </label>
                    <input
                      value={tempTraits.gender}
                      onChange={(e) =>
                        setTempTraits({ ...tempTraits, gender: e.target.value })
                      }
                      placeholder="Ex: Masculino, Feminino, Fluido..."
                      className="w-full bg-black/40 border border-stone-800 rounded p-2 text-stone-200 focus:border-amber-500 outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs uppercase font-bold text-stone-500">
                      Altura
                    </label>
                    <input
                      value={tempTraits.height}
                      onChange={(e) =>
                        setTempTraits({ ...tempTraits, height: e.target.value })
                      }
                      placeholder="Ex: 1.75m"
                      className="w-full bg-black/40 border border-stone-800 rounded p-2 text-stone-200 focus:border-amber-500 outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs uppercase font-bold text-stone-500">
                      Cabelo
                    </label>
                    <input
                      value={tempTraits.hair}
                      onChange={(e) =>
                        setTempTraits({ ...tempTraits, hair: e.target.value })
                      }
                      placeholder="Ex: Longo, prateado..."
                      className="w-full bg-black/40 border border-stone-800 rounded p-2 text-stone-200 focus:border-amber-500 outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs uppercase font-bold text-stone-500">
                      Olhos
                    </label>
                    <input
                      value={tempTraits.eyes}
                      onChange={(e) =>
                        setTempTraits({ ...tempTraits, eyes: e.target.value })
                      }
                      placeholder="Ex: Castanhos, brilhantes..."
                      className="w-full bg-black/40 border border-stone-800 rounded p-2 text-stone-200 focus:border-amber-500 outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs uppercase font-bold text-stone-500">
                      Pele
                    </label>
                    <input
                      value={tempTraits.skin}
                      onChange={(e) =>
                        setTempTraits({ ...tempTraits, skin: e.target.value })
                      }
                      placeholder="Ex: Pálida, esverdeada..."
                      className="w-full bg-black/40 border border-stone-800 rounded p-2 text-stone-200 focus:border-amber-500 outline-none"
                    />
                  </div>
                  <div className="col-span-1 md:col-span-2 space-y-2">
                    <label className="text-xs uppercase font-bold text-stone-500">
                      Cicatrizes / Marcas
                    </label>
                    <input
                      value={tempTraits.scars}
                      onChange={(e) =>
                        setTempTraits({ ...tempTraits, scars: e.target.value })
                      }
                      placeholder="Ex: Cicatriz no olho esquerdo, tatuagem de dragão..."
                      className="w-full bg-black/40 border border-stone-800 rounded p-2 text-stone-200 focus:border-amber-500 outline-none"
                    />
                  </div>
                  <div className="col-span-1 md:col-span-2 space-y-2">
                    <label className="text-xs uppercase font-bold text-stone-500">
                      Características Extras
                    </label>
                    <textarea
                      value={tempTraits.extra}
                      onChange={(e) =>
                        setTempTraits({ ...tempTraits, extra: e.target.value })
                      }
                      placeholder="Cicatrizes, tatuagens, chifres..."
                      className="w-full bg-black/40 border border-stone-800 rounded p-2 text-stone-200 focus:border-amber-500 outline-none h-20 resize-none"
                    />
                  </div>
                </div>

                {/* Prompt Generator */}
                <div className="bg-stone-950/50 p-4 rounded-xl border border-stone-800">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-bold text-amber-500 text-sm flex items-center gap-2">
                      <Wand2 size={16} /> Gerador de Prompt AI
                    </h4>
                    {(tempTraits.gender ||
                      tempTraits.hair ||
                      tempTraits.eyes ||
                      tempTraits.skin) && (
                      <button
                        onClick={copyPromptToClipboard}
                        className="text-xs bg-stone-800 hover:bg-stone-700 px-2 py-1 rounded text-stone-300 transition-colors flex items-center gap-1.5"
                      >
                        <Edit size={12} />
                        Copiar Prompt
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-stone-400 italic bg-black/40 p-2 rounded border border-stone-800/50 min-h-[60px]">
                    {generateCharacterPrompt({
                      ...activeCharacter,
                      physicalTraits: tempTraits,
                    })}
                  </p>
                  <p className="text-[10px] text-stone-600 mt-2">
                    Use este prompt em ferramentas como Midjourney ou DALL-E
                    para gerar o avatar do seu personagem.
                  </p>
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-3">
                <button
                  onClick={() => setIsEditingTraits(false)}
                  className="px-4 py-2 text-stone-400 hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={saveTraits}
                  className="px-6 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg shadow-lg hover:shadow-amber-500/20 transition-all"
                >
                  Salvar Alterações
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="container mx-auto max-w-6xl px-4 md:px-8 mt-6">
        {/* --- ATTRIBUTES ROW --- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8"
        >
          {attributesList.map(({ key, label, icon: Icon }) => {
            const attrData = activeCharacter.attributes?.[key];
            if (attrData === undefined || attrData === null) return null;

            // Handle both new object structure and legacy number structure
            const isComplex =
              typeof attrData === "object" && "value" in attrData;

            const val = isComplex ? (attrData as any).value : attrData;
            const isObject = typeof val === "object" && val !== null;

            const total = isObject ? val.total : val;
            const bonus = isObject ? val.bonus : 0;
            const sources = isObject ? val.sources || [] : [];

            return (
              <div
                key={key}
                title={
                  sources.length > 0 ? `Fontes: ${sources.join(", ")}` : ""
                }
                className={`bg-stone-900/60 backdrop-blur-md border ${
                  bonus > 0 ? "border-amber-500/40" : "border-stone-800"
                } p-4 rounded-xl flex flex-col items-center justify-center relative group hover:border-amber-700/50 transition-all shadow-2xl cursor-help`}
              >
                <div className="absolute top-2 left-2 text-stone-700 group-hover:text-amber-900/40 transition-colors">
                  <Icon size={16} />
                </div>
                <span className="text-xs text-stone-500 uppercase font-bold tracking-wider mb-2">
                  {label.slice(0, 3)}
                </span>
                <div className="flex items-baseline gap-1">
                  <span
                    className={`text-4xl font-serif font-bold ${
                      bonus > 0 ? "text-amber-400" : "text-neutral-200"
                    }`}
                  >
                    {total ?? 0}
                  </span>
                  {bonus > 0 && (
                    <span className="text-sm font-bold text-amber-600/80">
                      (+{bonus})
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </motion.div>

        {/* --- 2. DEFENSE & MONEY --- */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {/* Defense Card */}
          <div className="bg-stone-900/60 backdrop-blur-md border border-stone-800/50 p-4 rounded-xl flex items-center justify-between shadow-xl">
            <div className="flex items-center gap-4">
              <Shield size={24} className="text-blue-500" />
              <div>
                <h4 className="text-xs uppercase font-bold text-stone-500">
                  Defesa
                </h4>
                <span className="text-3xl font-bold text-stone-200">
                  {10 +
                    getAttrMod(activeCharacter.attributes?.Destreza) +
                    (activeCharacter.bag?.armorPenalty || 0)}
                </span>
              </div>
            </div>
            <div className="h-8 w-px bg-stone-800 mx-2"></div>
            <div className="flex items-center gap-4 text-right">
              <div>
                <h4 className="text-xs uppercase font-bold text-stone-500">
                  Deslocamento
                </h4>
                <span className="text-xl font-bold text-stone-200">
                  9m <span className="text-sm text-stone-500">(6q)</span>
                </span>
              </div>
            </div>
          </div>

          {/* Money Card */}
          <div className="bg-stone-900/60 backdrop-blur-md border border-stone-800/50 p-4 rounded-xl flex items-center justify-between relative overflow-hidden shadow-xl">
            <div className="flex items-center gap-4 relative z-10 w-full">
              <Coins size={24} className="text-amber-500" />
              <div className="flex-1">
                <h4 className="text-xs uppercase font-bold text-stone-500 flex items-center gap-2">
                  Tibares
                  {!isEditingMoney && (
                    <button
                      onClick={() => setIsEditingMoney(true)}
                      className="text-stone-600 hover:text-amber-500"
                    >
                      <Edit size={12} />
                    </button>
                  )}
                </h4>
                {isEditingMoney ? (
                  <div className="flex items-center gap-2 mt-1 w-full text-right h-8">
                    <input
                      type="number"
                      value={tempMoney}
                      onChange={(e) => setTempMoney(Number(e.target.value))}
                      className="w-full bg-black/40 border border-amber-500/50 rounded px-2 py-1 text-sm font-bold text-amber-100 outline-none"
                      autoFocus
                    />
                    <button
                      onClick={handleSaveMoney}
                      className="text-green-500 p-1"
                    >
                      <Check size={16} />
                    </button>
                    <button
                      onClick={() => setIsEditingMoney(false)}
                      className="text-red-500 p-1"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="flex justify-between items-center w-full">
                    <span className="text-2xl font-bold text-amber-100">
                      {activeCharacter.money} T$
                    </span>
                    <Link
                      href="/market"
                      className="px-3 py-1 bg-amber-900/20 hover:bg-amber-900/40 text-amber-500 text-[10px] font-bold uppercase rounded border border-amber-900/30 transition-colors"
                    >
                      COMPRAR
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* --- 3. SKILLS --- */}
        <SimpleList
          title="Perícias"
          icon={Brain}
          items={activeCharacter.skills || []}
        />

        {/* Class Proficiencies (Bonus) */}
        {(activeCharacter.class?.proficiencias?.length ?? 0) > 0 && (
          <div className="mb-6 px-1">
            <h4 className="text-xs font-bold text-stone-500 uppercase mb-2">
              Proficiências de Classe
            </h4>
            <div className="flex flex-wrap gap-2">
              {(activeCharacter.class?.proficiencias ?? []).map(
                (p: string, i: number) => (
                  <span
                    key={i}
                    className="px-2 py-1 bg-stone-900 border border-stone-800 rounded text-xs text-stone-400"
                  >
                    {p}
                  </span>
                )
              )}
            </div>
          </div>
        )}

        {/* --- 4. WEAPONS --- */}
        {(() => {
          const bag = activeCharacter.bag;
          const equips =
            bag && typeof bag.getEquipments === "function"
              ? bag.getEquipments()
              : (bag as any)?.equipments || {};
          return (
            <ItemList
              title="Armas & Ofensiva"
              icon={Swords}
              items={equips["Arma"]}
            />
          );
        })()}

        {/* --- 5. BACKPACK (Other Items) --- */}
        {(() => {
          const bag = activeCharacter.bag;
          const equips =
            bag && typeof bag.getEquipments === "function"
              ? bag.getEquipments()
              : (bag as any)?.equipments || {};

          // Combine other categories
          const defenseItems = [
            ...(equips["Armadura"] || []),
            ...(equips["Escudo"] || []),
          ];
          const generalItems = equips["Item Geral"];
          const alchemyItems = equips["Alquimía"];
          const clothingItems = equips["Vestuário"];
          const foodItems = equips["Alimentação"];

          return (
            <div className="space-y-1">
              <ItemList
                title="Defesa & Escudos"
                icon={Shield}
                items={defenseItems}
              />
              <ItemList
                title="Itens Gerais"
                icon={Package}
                items={generalItems}
              />
              <ItemList
                title="Alquimia & Poções"
                icon={FlaskRound}
                items={alchemyItems}
              />
              <ItemList
                title="Vestuário & Acessórios"
                icon={Shirt}
                items={clothingItems}
              />
              <ItemList title="Alimentação" icon={Apple} items={foodItems} />
            </div>
          );
        })()}

        {/* --- 6. ABILITIES & POWERS --- */}
        <div className="pt-10 border-t border-stone-900">
          <h2 className="text-xs font-black text-stone-500 mb-8 font-serif uppercase tracking-[0.3em] text-center">
            Poderes & Habilidades
          </h2>

          <SectionSlider
            title="Benefícios de Origem"
            icon={BookOpen}
            items={activeCharacter.originBenefits}
          />

          <SectionSlider
            title="Habilidades de Classe"
            icon={Zap}
            items={activeCharacter.class?.abilities}
          />

          <SectionSlider
            title="Poderes de Classe"
            icon={Swords}
            items={activeCharacter.class?.powers}
          />

          <SimpleList
            title="Habilidades de Raça"
            icon={Dna}
            items={activeCharacter.race?.abilities}
          />

          {activeCharacter.grantedPower && (
            <SimpleList
              title="Poder Concedido"
              icon={Crown}
              items={[activeCharacter.grantedPower]}
            />
          )}
        </div>
      </main>
    </div>
  );
}
