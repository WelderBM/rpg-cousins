import React from "react";
import { ThreatSheet } from "@/interfaces/ThreatSheet";
import { Shield, Heart, Swords, Zap, Wind } from "lucide-react";

interface Props {
  threat: ThreatSheet;
}

export const MonsterStatBlock: React.FC<Props> = ({ threat }) => {
  return (
    <div className="bg-[#fcf5e5] text-black font-sans border-2 border-[#e69a28] p-1 shadow-2xl max-w-2xl mx-auto rounded-sm overflow-hidden transform hover:scale-[1.01] transition-transform duration-300">
      <div className="border border-[#e69a28] p-4 h-full relative">
        {/* Background Texture Effect */}
        <div className="absolute inset-0 bg-[url('/assets/paper-texture.png')] opacity-20 pointer-events-none mix-blend-multiply"></div>

        {/* Header */}
        <div className="flex justify-between items-start border-b-2 border-[#e69a28] pb-2 mb-2">
          <div>
            <h2 className="font-serif text-3xl font-bold text-[#5c1c1c] uppercase tracking-wide leading-none">
              {threat.name}
            </h2>
            <p className="italic text-sm text-black/70 mt-1 capitalize font-serif">
              {threat.size} {threat.type}, {threat.role} (ND{" "}
              {threat.challengeLevel})
            </p>
          </div>
          {threat.imageUrl && (
            <div className="w-20 h-20 rounded-full border-2 border-[#e69a28] overflow-hidden -mt-2 -mr-2 shadow-lg bg-black">
              <img
                src={threat.imageUrl}
                alt={threat.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>

        {/* Core Stats */}
        <div className="space-y-1 text-[#5c1c1c] mb-3">
          <div className="flex items-center gap-2">
            <Shield className="fill-[#e69a28] text-[#5c1c1c] w-4 h-4" />
            <span className="font-bold">Defesa</span>{" "}
            {threat.combatStats.defense}
          </div>
          <div className="flex items-center gap-2">
            <Heart className="fill-[#e69a28] text-[#5c1c1c] w-4 h-4" />
            <span className="font-bold">Pontos de Vida</span>{" "}
            {threat.combatStats.hitPoints}
          </div>
          <div className="flex items-center gap-2">
            <Wind className="fill-[#e69a28] text-[#5c1c1c] w-4 h-4" />
            <span className="font-bold">Deslocamento</span>{" "}
            {threat.displacement}
          </div>
          {threat.hasManaPoints && (
            <div className="flex items-center gap-2">
              <Zap className="fill-[#e69a28] text-[#5c1c1c] w-4 h-4" />
              <span className="font-bold">Pontos de Mana</span>{" "}
              {threat.combatStats.manaPoints || "N/A"}
            </div>
          )}
        </div>

        {/* Ability Scores */}
        <div className="border-y-2 border-[#e69a28] py-2 mb-3">
          <div className="flex justify-between px-2 text-center text-[#5c1c1c]">
            {Object.entries(threat.attributes).map(([key, val]) => (
              <div key={key} className="flex flex-col">
                <span className="font-bold text-xs uppercase">
                  {key.substring(0, 3)}
                </span>
                <span className="font-serif text-lg">{val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Skills & Saves */}
        <div className="text-sm mb-3 space-y-1 text-black">
          <p>
            <span className="font-bold text-[#5c1c1c]">Perícias:</span>{" "}
            {threat.skills
              .filter((s) => s.trained)
              .map((s) => `${s.name} +${s.total}`)
              .join(", ") || "Nenhuma"}
          </p>
          <p className="flex gap-4">
            <span>
              <span className="font-bold text-[#5c1c1c]">Fort</span> +
              {threat.combatStats.strongSave}
            </span>
            <span>
              <span className="font-bold text-[#5c1c1c]">Ref</span> +
              {threat.combatStats.mediumSave}
            </span>
            <span>
              <span className="font-bold text-[#5c1c1c]">Von</span> +
              {threat.combatStats.weakSave}
            </span>
          </p>
        </div>

        {/* Divider */}
        <div className="h-px bg-[#e69a28] mb-3" />

        {/* Attacks */}
        <div className="mb-3">
          <h3 className="font-serif font-bold text-xl text-[#5c1c1c] border-b border-[#e69a28] mb-2">
            Ataques
          </h3>
          {threat.attacks && threat.attacks.length > 0 ? (
            <div className="space-y-2">
              {threat.attacks.map((attack) => (
                <div key={attack.id} className="text-sm">
                  <span className="font-bold italic text-black">
                    {attack.name}.
                  </span>{" "}
                  <span className="text-black">
                    <Swords className="inline w-3 h-3 mr-1 text-[#5c1c1c]" />+
                    {attack.attackBonus} ({attack.damageDice}
                    {attack.bonusDamage > 0 ? `+${attack.bonusDamage}` : ""}).
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm italic text-gray-600">
              Nenhum ataque registrado.
            </p>
          )}
        </div>

        {/* Abilities */}
        {threat.abilities && threat.abilities.length > 0 && (
          <div className="mb-3">
            <h3 className="font-serif font-bold text-xl text-[#5c1c1c] border-b border-[#e69a28] mb-2">
              Habilidades
            </h3>
            <div className="space-y-3">
              {threat.abilities.map((ability) => (
                <div key={ability.id} className="text-sm">
                  <span className="font-bold italic text-black">
                    {ability.name}.
                  </span>{" "}
                  <span className="text-black">{ability.description}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer info */}
        <div className="mt-4 pt-2 border-t border-[#e69a28] flex justify-between text-xs text-gray-500 font-serif">
          <span>Tesouro: {threat.treasureLevel}</span>
          <span>Equipamento: {threat.equipment || "-"}</span>
        </div>
      </div>
    </div>
  );
};
