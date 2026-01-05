import React from "react";
import { ThreatSheet } from "@/interfaces/ThreatSheet";
import { motion } from "framer-motion";
import { Edit2, Copy, Trash2, Shield, Heart, Sword } from "lucide-react";

interface Props {
  threat: ThreatSheet;
  onEdit: (threat: ThreatSheet) => void;
  onDuplicate: (threat: ThreatSheet) => void;
  onDelete: (id: string) => void;
}

export const ThreatPreviewCard: React.FC<Props> = ({
  threat,
  onEdit,
  onDuplicate,
  onDelete,
}) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-medieval-stone/80 border border-medieval-iron/50 rounded-xl overflow-hidden hover:border-medieval-gold/50 transition-all group relative shadow-lg flex flex-col h-full"
    >
      {/* Background Image / Gradient */}
      <div className="h-32 bg-black/50 relative overflow-hidden">
        {threat.imageUrl ? (
          <>
            <img
              src={threat.imageUrl}
              alt={threat.name}
              className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-medieval-stone/90 to-transparent" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-medieval-iron/20 to-black/40 flex items-center justify-center">
            <Shield className="w-16 h-16 text-medieval-iron/10" />
          </div>
        )}

        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm border border-medieval-gold/30 text-medieval-gold px-2 py-1 rounded text-xs font-bold shadow-sm">
          ND {threat.challengeLevel}
        </div>

        <div className="absolute bottom-2 left-4">
          <h3
            className="font-serif text-xl font-bold text-medieval-gold drop-shadow-md truncate max-w-[200px]"
            title={threat.name}
          >
            {threat.name}
          </h3>
          <p className="text-xs text-parchment-light/80 uppercase tracking-widest drop-shadow-sm font-bold">
            {threat.type} • {threat.size}
          </p>
        </div>
      </div>

      <div className="p-4 space-y-4 flex-1">
        <div className="grid grid-cols-3 gap-2 text-[10px] uppercase font-bold text-parchment-dark">
          <div className="bg-black/20 p-2 rounded flex flex-col items-center">
            <Heart className="w-4 h-4 text-red-500/70 mb-1" />
            <span className="text-parchment-light">
              {threat.combatStats.hitPoints} PV
            </span>
          </div>
          <div className="bg-black/20 p-2 rounded flex flex-col items-center">
            <Shield className="w-4 h-4 text-blue-500/70 mb-1" />
            <span className="text-parchment-light">
              {threat.combatStats.defense} DEF
            </span>
          </div>
          <div className="bg-black/20 p-2 rounded flex flex-col items-center">
            <Sword className="w-4 h-4 text-amber-500/70 mb-1" />
            <span className="text-parchment-light">
              +{threat.combatStats.attackValue} ATK
            </span>
          </div>
        </div>

        <p className="text-xs text-parchment-dark line-clamp-2 italic text-center">
          "{threat.role}"
        </p>
      </div>

      <div className="flex justify-between items-center p-3 border-t border-medieval-iron/20 bg-black/10">
        <span className="text-[10px] text-parchment-dark">
          {new Date(threat.updatedAt).toLocaleDateString()}
        </span>
        <div className="flex gap-1">
          <button
            onClick={() => onDuplicate(threat)}
            className="p-1.5 text-parchment-dark hover:text-medieval-gold hover:bg-medieval-gold/5 rounded transition-all"
            title="Duplicar"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEdit(threat)}
            className="p-1.5 text-parchment-dark hover:text-medieval-gold hover:bg-medieval-gold/5 rounded transition-all"
            title="Editar"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(threat.id)}
            className="p-1.5 text-parchment-dark hover:text-medieval-blood hover:bg-medieval-blood/5 rounded transition-all"
            title="Excluir"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
