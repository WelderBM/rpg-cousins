import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  User,
  Check,
  AlertCircle,
  Coins,
  Package,
  ArrowRight,
  Shield,
  Ghost,
} from "lucide-react";
import Equipment from "../../interfaces/Equipment";
import { Character } from "../../interfaces/Character";
import Bag, { calcBagSpaces } from "../../interfaces/Bag";
import { Atributo } from "../../data/atributos";

interface PurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (characterId: string, item: Equipment) => Promise<void>;
  item: Equipment | null;
  characters: Character[];
  activeCharacterId?: string;
}

export const PurchaseModal: React.FC<PurchaseModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  item,
  characters,
  activeCharacterId,
}) => {
  const [selectedCharId, setSelectedCharId] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Set default selected character when opening
  useEffect(() => {
    if (isOpen && characters.length > 0) {
      if (
        activeCharacterId &&
        characters.find((c) => c.id === activeCharacterId)
      ) {
        setSelectedCharId(activeCharacterId);
      } else {
        setSelectedCharId(characters[0].id || "");
      }
    }
  }, [isOpen, characters, activeCharacterId]);

  const selectedChar = useMemo(
    () => characters.find((c) => c.id === selectedCharId),
    [characters, selectedCharId]
  );

  const price = item?.preco || 0;
  const itemSlots = item?.spaces ?? 1; // Default to 1 if undefined, though usually 0 or 1. If 0 it's 0.
  // Wait, if item.spaces is explicitly 0, it should be 0.
  // In AbilityCard: item.spaces !== undefined ? item.spaces : ...
  // Let's use item.spaces ?? 1 safely, but check if 0 is truthy (it is not).
  // Safe: (item?.spaces !== undefined && item?.spaces !== null) ? item.spaces : 1;
  // Actually, standard default for undefined spaces in T20 is usually 1, but "não ocupa espaço" is specific.
  const actualItemSlots =
    item?.spaces !== undefined && item?.spaces !== null ? item.spaces : 1;

  // Analysis of the selected character status
  const status = useMemo(() => {
    if (!selectedChar || !item)
      return {
        canBuy: false,
        msg: "Selecione um personagem",
        currentMoney: 0,
        newMoney: 0,
        currentSlots: 0,
        newSlots: 0,
        maxSlots: 0,
      };

    // Money
    const currentMoney = selectedChar.money || 0;
    const newMoney = currentMoney - price;
    const hasMoney = newMoney >= 0;

    // Slots
    // Handle generic object vs Bag instance
    let bagEquipments: any = {};
    if (selectedChar.bag instanceof Bag) {
      bagEquipments = selectedChar.bag.getEquipments();
    } else if ((selectedChar.bag as any)?.equipments) {
      bagEquipments = (selectedChar.bag as any).equipments;
    }

    const currentSlots = calcBagSpaces(bagEquipments);
    const newSlots = currentSlots + actualItemSlots;

    // Load Limit: 10 + (Str * 3) (Standard T20)
    // Note: Attributes might be mapped by name or key.
    // In Character interface: attributes: Record<Atributo, number>
    // Atributo enum usually has "Força" or similar.
    // Let's safe access.
    const str = selectedChar.attributes?.["Força"] || 0;
    // T20 Jogo do Ano: 3 * Força. If Força <= 0?
    // Let's assume the formula: 10 + (str * 2) based on ImpactPanel?
    // User requested "validate slot".
    // I will use 3 * str as standard, or 10 + 2*str if that's the project norm.
    // Let's stick with the ImpactPanel one (10 + 2*str) to be consistent with their UI.
    const maxSlots = 10 + str * 2;

    const hasSlots = newSlots <= maxSlots;

    let msg = "";
    if (!hasMoney) msg = "Dinheiro insuficiente";
    else if (!hasSlots) msg = "Sem espaço na mochila";
    else msg = "Pronto para comprar";

    return {
      canBuy: hasMoney && hasSlots,
      msg,
      currentMoney,
      newMoney,
      currentSlots,
      newSlots,
      maxSlots,
      hasMoney,
      hasSlots,
    };
  }, [selectedChar, item, price, actualItemSlots]);

  const handleConfirm = async () => {
    if (!status.canBuy || isProcessing) return;
    setIsProcessing(true);
    try {
      await onConfirm(selectedCharId, item!);
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 font-sans">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />

        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative bg-[#111] border border-stone-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
        >
          {/* Header */}
          <div className="bg-[#1a1a1a] p-4 border-b border-white/5 flex items-center justify-between">
            <h3 className="font-serif text-lg text-amber-500 font-bold flex items-center gap-2">
              <Coins size={20} /> Confirmar Compra
            </h3>
            <button
              onClick={onClose}
              className="text-neutral-500 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Item Info */}
            {item && (
              <div className="flex gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-stone-800 to-stone-900 rounded-lg flex items-center justify-center border border-white/5 shrink-0">
                  {/* Generic Icon based on Group/Type could go here */}
                  <Package className="text-stone-500" size={32} />
                </div>
                <div>
                  <h4 className="font-bold text-neutral-200 text-lg leading-tight">
                    {item.nome}
                  </h4>
                  <p className="text-sm text-neutral-500">
                    {item.group || "Item Geral"}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-amber-500 font-bold text-sm">
                      {item.preco} T$
                    </span>
                    <span className="text-xs text-stone-600">•</span>
                    <span className="text-stone-400 text-xs">
                      {actualItemSlots === 0
                        ? "Não ocupa espaço"
                        : `${actualItemSlots} slot(s)`}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <hr className="border-white/5" />

            {/* Character Selection */}
            <div className="space-y-2">
              <label className="text-xs uppercase font-bold text-stone-500">
                Comprador
              </label>
              <div className="relative">
                <select
                  value={selectedCharId}
                  onChange={(e) => setSelectedCharId(e.target.value)}
                  className="w-full bg-[#0c0c0c] border border-white/10 rounded-lg p-3 pr-10 appearance-none text-neutral-200 outline-none focus:border-amber-500/50 transition-colors cursor-pointer"
                >
                  {characters.map((char) => (
                    <option key={char.id} value={char.id}>
                      {char.name} (Nvl {char.level})
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-stone-500">
                  <User size={16} />
                </div>
              </div>
            </div>

            {/* Validation Panel */}
            {selectedChar && (
              <div className="grid grid-cols-2 gap-3">
                {/* Money Validation */}
                <div
                  className={`p-3 rounded-lg border ${
                    status.hasMoney
                      ? "bg-stone-900/50 border-white/5"
                      : "bg-red-950/20 border-red-500/30"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2 text-stone-500 text-xs font-bold uppercase">
                    <Coins size={12} /> Tibares
                  </div>
                  <div className="flex items-center justify-between">
                    <span
                      className={
                        status.hasMoney ? "text-stone-400" : "text-red-400"
                      }
                    >
                      {status.currentMoney}
                    </span>
                    <ArrowRight size={12} className="text-stone-700" />
                    <span
                      className={`font-bold ${
                        status.hasMoney ? "text-amber-500" : "text-red-500"
                      }`}
                    >
                      {status.newMoney}
                    </span>
                  </div>
                </div>

                {/* Slots Validation */}
                <div
                  className={`p-3 rounded-lg border ${
                    status.hasSlots
                      ? "bg-stone-900/50 border-white/5"
                      : "bg-red-950/20 border-red-500/30"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2 text-stone-500 text-xs font-bold uppercase">
                    <Package size={12} /> Carga
                  </div>
                  <div className="flex items-center justify-between">
                    <span
                      className={
                        status.hasSlots ? "text-stone-400" : "text-red-400"
                      }
                    >
                      {status.currentSlots}
                    </span>
                    <ArrowRight size={12} className="text-stone-700" />
                    <span
                      className={`font-bold ${
                        status.hasSlots ? "text-stone-200" : "text-red-500"
                      }`}
                    >
                      {status.newSlots}
                    </span>
                    <span className="text-stone-600 text-xs self-end mb-0.5">
                      /{status.maxSlots}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {!status.canBuy && (
              <div className="flex items-center gap-2 text-red-500 text-sm bg-red-950/20 p-3 rounded-lg border border-red-900/30">
                <AlertCircle size={16} />
                <span>{status.msg}</span>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-4 bg-[#1a1a1a] border-t border-white/5 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-stone-400 hover:text-white transition-colors text-sm font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              disabled={!status.canBuy || isProcessing}
              className={`px-6 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-all ${
                status.canBuy && !isProcessing
                  ? "bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-900/20"
                  : "bg-stone-800 text-stone-500 cursor-not-allowed"
              }`}
            >
              {isProcessing ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Check size={16} />
              )}
              Confirmar Compra
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
