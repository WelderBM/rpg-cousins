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
} from "lucide-react";
import Equipment from "../../interfaces/Equipment";
import { Character } from "../../interfaces/Character";

interface SellModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (characterId: string, item: Equipment) => Promise<void>;
  item: Equipment | null;
  characters: Character[];
  activeCharacterId?: string;
}

export const SellModal: React.FC<SellModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  item,
  characters,
  activeCharacterId,
}) => {
  const [selectedCharId, setSelectedCharId] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Reset processing state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setIsProcessing(false);
    }
  }, [isOpen]);

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
  const itemSlots = item?.spaces ?? 1;
  const actualItemSlots =
    item?.spaces !== undefined && item?.spaces !== null ? item.spaces : 1;

  // Analysis of the selected character status
  const status = useMemo(() => {
    if (!selectedChar || !item)
      return {
        canSell: false,
        msg: "Selecione um personagem",
        currentMoney: 0,
        newMoney: 0,
      };

    // Money
    const currentMoney = selectedChar.money || 0;
    const newMoney = currentMoney + price;

    return {
      canSell: true,
      msg: "Pronto para vender",
      currentMoney,
      newMoney,
    };
  }, [selectedChar, item, price]);

  const handleConfirm = async () => {
    if (!status.canSell || isProcessing || !selectedCharId || !item) return;

    setIsProcessing(true);
    try {
      await onConfirm(selectedCharId, item);
      // Modal will be closed by parent component after successful sale
    } catch (e) {
      console.error("Sale error:", e);
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
              <Coins size={20} /> Confirmar Venda
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
                    <span className="text-emerald-500 font-bold text-sm">
                      +{item.preco} T$
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
                Vendedor
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
              <div className="grid grid-cols-1 gap-3">
                {/* Money Validation */}
                <div className="p-3 rounded-lg border bg-emerald-950/20 border-emerald-500/30">
                  <div className="flex items-center gap-2 mb-2 text-stone-500 text-xs font-bold uppercase">
                    <Coins size={12} /> Tibares
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-stone-400">
                      {status.currentMoney}
                    </span>
                    <ArrowRight size={12} className="text-stone-700" />
                    <span className="font-bold text-emerald-500">
                      {status.newMoney}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-4 bg-[#1a1a1a] border-t border-white/5 flex justify-end gap-3">
            <button
              onClick={onClose}
              disabled={isProcessing}
              className={`px-4 py-2 text-stone-400 hover:text-white transition-colors text-sm font-medium ${
                isProcessing ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              disabled={!status.canSell || isProcessing}
              className={`px-6 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-all ${
                status.canSell && !isProcessing
                  ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20"
                  : "bg-stone-800 text-stone-500 cursor-not-allowed"
              }`}
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <Check size={16} />
                  Confirmar Venda
                </>
              )}
            </button>
          </div>

          {/* Processing Overlay */}
          {isProcessing && (
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-10 rounded-2xl">
              <div className="bg-[#111] p-6 rounded-xl border border-emerald-500/30 shadow-2xl">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
                  <p className="text-emerald-500 font-bold">
                    Processando venda...
                  </p>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
