import React, { useMemo } from "react";
import { Atributo } from "../../../data/atributos";
import { Heart, Brain, Shield, Weight } from "lucide-react";

/**
 * Painel de Impacto Estimado
 */
export const ImpactPanel = React.memo(
  ({ finalAttributes }: { finalAttributes: Record<Atributo, number> }) => {
    const stats = useMemo(() => {
      const con = finalAttributes[Atributo.CONSTITUICAO];
      const dex = finalAttributes[Atributo.DESTREZA];
      const str = finalAttributes[Atributo.FORCA];
      const int = finalAttributes[Atributo.INTELIGENCIA];

      return [
        {
          label: "PV Iniciais",
          value: 20 + con,
          icon: Heart,
          color: "text-red-500",
          desc: "Pontos de Vida",
        },
        {
          label: "PM Iniciais",
          value: (finalAttributes[Atributo.FORCA] > 0 ? 3 : 3) + 0, // Simplificado, idealmente viria da classe
          icon: Brain,
          color: "text-blue-500",
          desc: "Pontos de Mana",
        },
        {
          label: "Defesa Base",
          value: 10 + dex,
          icon: Shield,
          color: "text-amber-500",
          desc: "Iniciando sem armadura",
        },
        {
          label: "Carga Max.",
          value: 10 + str * 2,
          icon: Weight,
          color: "text-neutral-500",
          desc: "Espaços de inventário",
        },
      ];
    }, [finalAttributes]);

    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-black/40 p-4 rounded-xl border border-neutral-800/50">
        {stats.map((stat) => (
          <div key={stat.label} className="text-center group">
            <stat.icon
              className={`w-5 h-5 mx-auto mb-2 ${stat.color} opacity-70 group-hover:opacity-100 transition-opacity`}
            />
            <div className="text-2xl font-bold font-cinzel text-neutral-100">
              {stat.value}
            </div>
            <div className="text-[10px] text-neutral-500 uppercase tracking-tighter">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    );
  }
);
