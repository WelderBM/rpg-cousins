import React from "react";
import { motion } from "framer-motion";
import { Atributo } from "../../../data/atributos";
import { Zap, Activity, Heart, Brain, Eye, Sparkles } from "lucide-react";

const ARCHETYPES = {
  GUERREIRO: {
    name: "Guerreiro",
    icon: Zap,
    color: "from-red-600 to-orange-600",
    description: "Foco em Força e Constituição.",
  },
  MAGO: {
    name: "Arcanista",
    icon: Brain,
    color: "from-blue-600 to-indigo-600",
    description: "Foco em Inteligência.",
  },
  CLERIGO: {
    name: "Clérigo",
    icon: Eye,
    color: "from-amber-400 to-yellow-600",
    description: "Foco em Sabedoria.",
  },
  LADINO: {
    name: "Ladino",
    icon: Activity,
    color: "from-emerald-600 to-teal-600",
    description: "Foco em Destreza.",
  },
  NOBRE: {
    name: "Nobre",
    icon: Sparkles,
    color: "from-purple-600 to-fuchsia-600",
    description: "Foco em Carisma.",
  },
};

export const BuildArchetypeBadge = ({
  attributes,
}: {
  attributes: Record<Atributo, number>;
}) => {
  const getArchetype = () => {
    const sorted = Object.entries(attributes).sort((a, b) => b[1] - a[1]);
    const top = sorted[0][0] as Atributo;

    if (top === Atributo.FORCA || top === Atributo.CONSTITUICAO)
      return ARCHETYPES.GUERREIRO;
    if (top === Atributo.INTELIGENCIA) return ARCHETYPES.MAGO;
    if (top === Atributo.SABEDORIA) return ARCHETYPES.CLERIGO;
    if (top === Atributo.DESTREZA) return ARCHETYPES.LADINO;
    if (top === Atributo.CARISMA) return ARCHETYPES.NOBRE;
    return null;
  };

  const arch = getArchetype();
  if (!arch) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r ${arch.color} text-white text-[10px] font-bold uppercase tracking-wider shadow-lg`}
    >
      <arch.icon className="w-3 h-3" />
      {arch.name}
    </motion.div>
  );
};
