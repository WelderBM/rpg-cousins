import React from "react";
import {
  ThreatSheet,
  ThreatType,
  ThreatSize,
  ThreatRole,
  ChallengeLevel,
} from "@/interfaces/ThreatSheet";
import { motion } from "framer-motion";
import { Swords, Shield, Skull, Image as ImageIcon } from "lucide-react";

interface Props {
  formData: Partial<ThreatSheet>;
  setFormData: React.Dispatch<React.SetStateAction<Partial<ThreatSheet>>>;
}

export const ThreatBasicInfo: React.FC<Props> = ({ formData, setFormData }) => {
  const handleImageSearch = () => {
    if (!formData.name) return;
    const query = encodeURIComponent(`${formData.name} fantasy art rpg`);
    window.open(`https://www.google.com/search?q=${query}&tbm=isch`, "_blank");
  };

  return (
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
            value={formData.name || ""}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                name: e.target.value,
              }))
            }
            placeholder="Ex: Dragão de Chifres"
            className="w-full bg-black/40 border border-medieval-iron/50 rounded-lg px-4 py-2 text-parchment-light focus:border-medieval-gold outline-none focus:ring-1 focus:ring-medieval-gold"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-parchment-dark uppercase tracking-wider flex items-center gap-2">
            URL da Imagem{" "}
            <span className="text-xs font-normal normal-case opacity-50">
              (Opcional)
            </span>
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={formData.imageUrl || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  imageUrl: e.target.value,
                }))
              }
              placeholder="https://..."
              className="flex-1 bg-black/40 border border-medieval-iron/50 rounded-lg px-4 py-2 text-parchment-light focus:border-medieval-gold outline-none focus:ring-1 focus:ring-medieval-gold text-sm"
            />
            <button
              onClick={handleImageSearch}
              className="px-3 py-2 bg-medieval-stone border border-medieval-iron/50 rounded-lg text-parchment-light hover:text-medieval-gold hover:border-medieval-gold transition-colors"
              title="Buscar imagem no Google"
              type="button"
            >
              <ImageIcon size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

        <div className="grid grid-cols-2 gap-4">
          {/* ND Selection */}
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
              className="w-full bg-black/40 border border-medieval-gold/30 rounded-lg px-4 py-2 text-parchment-light focus:border-medieval-gold outline-none font-bold"
            >
              {Object.values(ChallengeLevel).map((nd) => (
                <option key={nd} value={nd}>
                  ND {nd}
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-bold text-parchment-dark uppercase tracking-wider">
            Deslocamento
          </label>
          <input
            type="text"
            value={formData.displacement || ""}
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
          <label className="flex items-center gap-2 cursor-pointer text-parchment-light select-none group">
            <input
              type="checkbox"
              checked={formData.hasManaPoints || false}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  hasManaPoints: e.target.checked,
                }))
              }
              className="w-5 h-5 rounded border-medieval-iron bg-black/40 text-medieval-gold focus:ring-medieval-gold cursor-pointer"
            />
            <span className="group-hover:text-medieval-gold transition-colors">
              Usa Pontos de Mana (PM)?
            </span>
          </label>
        </div>
      </div>

      {/* Visual Preview of Choices */}
      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="bg-black/20 p-4 rounded-lg border border-medieval-iron/20 text-center">
          <Swords className="w-8 h-8 mx-auto text-medieval-gold mb-2 opacity-50" />
          <p className="text-xs text-parchment-dark uppercase">Combate</p>
          <p className="text-parchment-light font-bold">{formData.role}</p>
        </div>
        <div className="bg-black/20 p-4 rounded-lg border border-medieval-iron/20 text-center">
          <Skull className="w-8 h-8 mx-auto text-medieval-gold mb-2 opacity-50" />
          <p className="text-xs text-parchment-dark uppercase">Desafio</p>
          <p className="text-parchment-light font-bold">
            ND {formData.challengeLevel}
          </p>
        </div>
        <div className="bg-black/20 p-4 rounded-lg border border-medieval-iron/20 text-center">
          <Shield className="w-8 h-8 mx-auto text-medieval-gold mb-2 opacity-50" />
          <p className="text-xs text-parchment-dark uppercase">Defesa</p>
          <p className="text-parchment-light font-bold">{formData.type}</p>
        </div>
      </div>
    </motion.div>
  );
};
