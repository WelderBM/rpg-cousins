import React from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Info,
  Users,
  Feather,
  Brain,
  Swords,
  Flame,
  Scale,
  Star,
  Zap,
  CheckCircle2,
  Copy,
  Shield,
  Target,
  Clock,
  Navigation,
  Crosshair,
  BadgeAlert,
  Coins,
  Weight,
  Layers,
  MapPin,
  Sparkles,
  Search,
  ShoppingBag,
  Book,
} from "lucide-react";
import { ItemBase } from "../types";
import { CATEGORIES } from "../constants";

interface WikiDetailDrawerProps {
  selectedItem: ItemBase | null;
  setSelectedItem: (item: ItemBase | null) => void;
  copiedId: string | null;
  handleCopyLink: (item: ItemBase) => void;
}

// Helper: Stat Card
const StatCard = ({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: any;
  icon?: any;
}) => (
  <div className="p-3 bg-black/30 rounded-lg border border-white/5 group hover:border-amber-500/30 transition-colors">
    <div className="flex items-center gap-2 mb-1">
      {Icon && <Icon size={12} className="text-neutral-500" />}
      <div className="text-[10px] text-neutral-500 uppercase font-black tracking-tight">
        {label}
      </div>
    </div>
    <div className="text-sm text-neutral-200 font-medium truncate">
      {value || "—"}
    </div>
  </div>
);

// Helper: Section Title
const SectionTitle = ({
  title,
  icon: Icon,
  color = "text-amber-500",
}: {
  title: string;
  icon: any;
  color?: string;
}) => (
  <h4 className={`${color} font-cinzel text-lg mb-4 flex items-center gap-3`}>
    <Icon size={20} />
    <span className="translate-y-0.5">{title}</span>
  </h4>
);

export function WikiDetailDrawer({
  selectedItem,
  setSelectedItem,
  copiedId,
  handleCopyLink,
}: WikiDetailDrawerProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {selectedItem && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedItem(null)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-xl bg-stone-900 border-l-2 border-amber-700/30 z-[101] flex flex-col shadow-[-20px_0_50px_rgba(0,0,0,0.5)]"
          >
            {/* Drawer Header */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-black/20">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-500/20 rounded-xl border border-amber-500/30">
                  {React.createElement(
                    CATEGORIES.find((c) => c.id === selectedItem.category)
                      ?.icon || Info,
                    { className: "text-amber-500", size: 24 }
                  )}
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-cinzel text-amber-100 line-clamp-1">
                    {selectedItem.name}
                  </h2>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-amber-500 uppercase tracking-widest font-bold bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                      {selectedItem.type}
                    </span>
                    {selectedItem.subType && (
                      <span className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold">
                        • {selectedItem.subType}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-2 hover:bg-white/5 rounded-lg text-neutral-500 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
              <div className="space-y-8">
                {/* 1. MAGIAS */}
                {selectedItem.category === "magias" && (
                  <div className="space-y-8">
                    <div className="grid grid-cols-2 gap-4">
                      <StatCard
                        label="Execução"
                        value={selectedItem.raw.execucao}
                        icon={Zap}
                      />
                      <StatCard
                        label="Alcance"
                        value={selectedItem.raw.alcance}
                        icon={Navigation}
                      />
                      <StatCard
                        label="Duração"
                        value={selectedItem.raw.duracao}
                        icon={Clock}
                      />
                      <StatCard
                        label="Alvo/Área"
                        value={selectedItem.raw.alvo || selectedItem.raw.area}
                        icon={Target}
                      />
                      <StatCard
                        label="Resistência"
                        value={selectedItem.raw.resistencia}
                        icon={Shield}
                      />
                      <StatCard
                        label="Gasto Mana"
                        value={
                          selectedItem.raw.manaExpense
                            ? `${selectedItem.raw.manaExpense} PM`
                            : "Círculo"
                        }
                        icon={Flame}
                      />
                    </div>

                    <section>
                      <SectionTitle title="Efeito da Magia" icon={Sparkles} />
                      <div className="text-neutral-300 leading-relaxed italic whitespace-pre-wrap bg-white/5 p-4 rounded-xl border border-white/5 border-l-4 border-l-amber-500/50">
                        {selectedItem.raw.description ||
                          selectedItem.raw.descricao}
                      </div>
                    </section>

                    {selectedItem.raw.aprimoramentos &&
                      selectedItem.raw.aprimoramentos.length > 0 && (
                        <section>
                          <SectionTitle
                            title="Aprimoramentos"
                            icon={BadgeAlert}
                            color="text-amber-400"
                          />
                          <div className="space-y-3">
                            {selectedItem.raw.aprimoramentos.map(
                              (ap: any, i: number) => (
                                <div
                                  key={i}
                                  className="p-4 bg-amber-900/10 border border-amber-900/30 rounded-xl relative overflow-hidden group"
                                >
                                  <div className="absolute top-0 right-0 px-2 py-0.5 bg-amber-500 text-black text-[10px] font-black uppercase tracking-tighter rounded-bl-lg">
                                    +{ap.addPm} PM
                                  </div>
                                  <p className="text-sm italic text-neutral-400 pr-12 leading-relaxed">
                                    {ap.text}
                                  </p>
                                </div>
                              )
                            )}
                          </div>
                        </section>
                      )}
                  </div>
                )}

                {/* 2. EQUIPAMENTOS / MERCADO */}
                {(selectedItem.category === "equipamentos" ||
                  selectedItem.category === "mercado") && (
                  <div className="space-y-8">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      <StatCard
                        label="Preço"
                        value={`T$ ${selectedItem.raw.preco}`}
                        icon={Coins}
                      />
                      <StatCard
                        label="Espaços"
                        value={selectedItem.raw.spaces}
                        icon={Weight}
                      />
                      <StatCard
                        label="Grupo"
                        value={selectedItem.raw.group}
                        icon={Layers}
                      />

                      {/* Weapon Stats */}
                      {selectedItem.raw.group === "Arma" && (
                        <>
                          <StatCard
                            label="Dano"
                            value={
                              selectedItem.raw.dano || selectedItem.raw.damage
                            }
                            icon={Swords}
                          />
                          <StatCard
                            label="Crítico"
                            value={selectedItem.raw.critico}
                            icon={Target}
                          />
                          <StatCard
                            label="Tipo"
                            value={selectedItem.raw.tipo}
                            icon={BadgeAlert}
                          />
                          {selectedItem.raw.alcance &&
                            selectedItem.raw.alcance !== "-" && (
                              <StatCard
                                label="Alcance"
                                value={selectedItem.raw.alcance}
                                icon={Navigation}
                              />
                            )}
                        </>
                      )}

                      {/* Armor Stats */}
                      {(selectedItem.raw.group === "Armadura" ||
                        selectedItem.raw.group === "Escudo") && (
                        <>
                          <StatCard
                            label="Defesa"
                            value={`+${selectedItem.raw.defenseBonus}`}
                            icon={Shield}
                          />
                          <StatCard
                            label="Penalidade"
                            value={selectedItem.raw.armorPenalty}
                            icon={Clock}
                          />
                        </>
                      )}
                    </div>

                    {selectedItem.raw.weaponTags &&
                      selectedItem.raw.weaponTags.length > 0 && (
                        <section>
                          <SectionTitle
                            title="Propriedades"
                            icon={BadgeAlert}
                          />
                          <div className="flex flex-wrap gap-2">
                            {selectedItem.raw.weaponTags.map((tag: string) => (
                              <span
                                key={tag}
                                className="px-3 py-1 bg-amber-500/10 text-amber-500 text-xs border border-amber-500/20 rounded-full font-bold uppercase tracking-wider"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </section>
                      )}

                    <section>
                      <SectionTitle title="Descrição" icon={Info} />
                      <p className="text-neutral-300 leading-relaxed italic bg-black/40 p-4 rounded-xl border border-white/5">
                        {selectedItem.raw.description ||
                          "Item padrão do sistema Tormenta20."}
                      </p>
                    </section>
                  </div>
                )}

                {/* 3. RACAS */}
                {selectedItem.category === "racas" && (
                  <div className="space-y-10">
                    <section className="space-y-6">
                      <div className="p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl relative overflow-hidden group">
                        <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
                          <Users size={120} />
                        </div>
                        <SectionTitle
                          title="Visão Geral"
                          icon={Info}
                          color="text-emerald-500"
                        />
                        <p className="text-neutral-300 leading-relaxed italic text-lg border-l-2 border-emerald-500/30 pl-4">
                          {selectedItem.raw.description ||
                            "Uma raça única habitando as terras de Arton."}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <h5 className="text-emerald-400 font-cinzel flex items-center gap-2 text-sm uppercase tracking-wider">
                            <Feather size={16} /> Aparência
                          </h5>
                          <p className="text-sm text-neutral-400 leading-relaxed">
                            {selectedItem.raw.appearance ||
                              "Aparência variada conforme a linhagem."}
                          </p>
                        </div>
                        <div className="space-y-3">
                          <h5 className="text-emerald-400 font-cinzel flex items-center gap-2 text-sm uppercase tracking-wider">
                            <Brain size={16} /> Personalidade
                          </h5>
                          <p className="text-sm text-neutral-400 leading-relaxed">
                            {selectedItem.raw.personality ||
                              "Traços comportamentais distintos."}
                          </p>
                        </div>
                      </div>
                    </section>

                    <section className="space-y-6">
                      <SectionTitle
                        title="Atributos & Físico"
                        icon={Swords}
                        color="text-emerald-500"
                      />
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <StatCard
                          label="Tamanho"
                          value={selectedItem.raw.size?.name || "Médio"}
                          icon={Layers}
                        />
                        <StatCard
                          label="Deslocamento"
                          value={`${
                            selectedItem.raw.getDisplacement?.(
                              selectedItem.raw
                            ) || 9
                          }m`}
                          icon={Navigation}
                        />
                        <div className="col-span-2 p-4 bg-black/40 rounded-xl border border-white/5 group hover:border-emerald-500/30 transition-colors">
                          <div className="text-[10px] text-neutral-500 uppercase font-bold mb-2">
                            Bônus de Atributos
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {selectedItem.raw.attributes.attrs.map(
                              (at: any, i: number) => (
                                <span
                                  key={i}
                                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                                    at.mod > 0
                                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                      : "bg-red-500/10 text-red-400 border border-red-500/20"
                                  }`}
                                >
                                  {at.mod > 0 ? "+" : ""}
                                  {at.mod}{" "}
                                  {at.attr === "any" ? "Qualquer" : at.attr}
                                </span>
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    </section>

                    <section className="space-y-6">
                      <SectionTitle
                        title="Habilidades de Raça"
                        icon={Zap}
                        color="text-emerald-500"
                      />
                      <div className="space-y-4">
                        {selectedItem.raw.abilities?.map(
                          (ab: any, i: number) => (
                            <div
                              key={i}
                              className="p-5 bg-neutral-900/50 border border-white/5 rounded-2xl hover:bg-neutral-800/50 transition-colors group"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div className="text-emerald-400 font-cinzel font-bold text-lg">
                                  {ab.name}
                                </div>
                                <div className="p-1 px-2 bg-emerald-500/10 text-emerald-500 text-[10px] font-bold rounded uppercase">
                                  Passiva
                                </div>
                              </div>
                              <p className="text-sm text-neutral-400 leading-relaxed italic">
                                {ab.description}
                              </p>
                            </div>
                          )
                        )}
                      </div>
                    </section>
                  </div>
                )}

                {/* 4. PODERES */}
                {selectedItem.category === "poderes" && (
                  <div className="space-y-8">
                    <section>
                      <SectionTitle
                        title="Efeito do Poder"
                        icon={Sparkles}
                        color="text-purple-500"
                      />
                      <div className="text-neutral-300 leading-relaxed italic bg-purple-500/5 p-6 rounded-2xl border border-purple-500/20 border-l-4 border-l-purple-500">
                        {selectedItem.raw.description}
                      </div>

                      {selectedItem.raw.canRepeat && (
                        <div className="mt-4 flex gap-2">
                          <span className="px-3 py-1 bg-purple-500/10 text-purple-400 text-[10px] font-black uppercase rounded border border-purple-500/20">
                            Pode ser escolhido várias vezes
                          </span>
                        </div>
                      )}
                    </section>

                    {selectedItem.raw.requirements &&
                      selectedItem.raw.requirements.length > 0 && (
                        <section>
                          <SectionTitle
                            title="Pré-requisitos"
                            icon={BadgeAlert}
                            color="text-red-500"
                          />
                          <div className="space-y-3">
                            {selectedItem.raw.requirements.map(
                              (andGroup: any, i: number) => (
                                <div
                                  key={i}
                                  className="flex flex-wrap gap-2 items-center p-3 bg-red-950/10 border border-red-950/30 rounded-xl"
                                >
                                  {andGroup.map((req: any, j: number) => (
                                    <span
                                      key={j}
                                      className="px-3 py-1.5 bg-red-950/30 border border-red-500/30 text-red-400 text-xs rounded-lg font-bold"
                                    >
                                      {req.description ||
                                        req.name ||
                                        (typeof req === "object"
                                          ? req.value || "Requisito"
                                          : req)}
                                    </span>
                                  ))}
                                  {i <
                                    selectedItem.raw.requirements.length -
                                      1 && (
                                    <span className="text-[10px] text-neutral-600 font-black uppercase mx-1">
                                      e
                                    </span>
                                  )}
                                </div>
                              )
                            )}
                          </div>
                        </section>
                      )}
                  </div>
                )}

                {/* 5. ORIGENS */}
                {selectedItem.category === "origens" && (
                  <div className="space-y-8">
                    <section>
                      <SectionTitle
                        title="Benefícios da Origem"
                        icon={Sparkles}
                        color="text-rose-500"
                      />
                      <div className="space-y-6">
                        <div className="p-4 bg-rose-500/5 border border-rose-500/20 rounded-xl">
                          <h5 className="text-rose-400 font-cinzel text-xs uppercase mb-3 font-bold">
                            Perícias Disponíveis
                          </h5>
                          <div className="flex flex-wrap gap-2">
                            {selectedItem.raw.pericias.map((p: string) => (
                              <span
                                key={p}
                                className="px-3 py-1 bg-rose-500/10 text-rose-400 text-xs rounded-full border border-rose-500/20 font-medium"
                              >
                                {p}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h5 className="text-rose-400 font-cinzel text-xs uppercase font-bold">
                            Poderes de Origem
                          </h5>
                          <div className="space-y-3">
                            {selectedItem.raw.poderes.map((p: any) => (
                              <div
                                key={p.name}
                                className="p-4 bg-black/40 border border-white/5 rounded-xl"
                              >
                                <div className="text-rose-400 font-cinzel font-bold mb-1">
                                  {p.name}
                                </div>
                                <p className="text-xs text-neutral-400 leading-relaxed italic">
                                  {p.description}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </section>

                    {selectedItem.raw.getItems && (
                      <section>
                        <SectionTitle
                          title="Itens Iniciais"
                          icon={ShoppingBag}
                          color="text-rose-500"
                        />
                        <div className="grid grid-cols-1 gap-2">
                          {selectedItem.raw
                            .getItems()
                            .map((item: any, i: number) => (
                              <div
                                key={i}
                                className="flex items-center gap-3 p-3 bg-black/30 rounded-lg border border-white/5"
                              >
                                <div className="p-2 bg-rose-500/10 rounded-lg">
                                  <ShoppingBag
                                    size={14}
                                    className="text-rose-500"
                                  />
                                </div>
                                <div>
                                  <div className="text-sm text-neutral-200">
                                    {typeof item.equipment === "string"
                                      ? item.equipment
                                      : item.equipment.nome}
                                  </div>
                                  {item.description && (
                                    <div className="text-[10px] text-neutral-500">
                                      {item.description}
                                    </div>
                                  )}
                                  {item.qtd && (
                                    <div className="text-[10px] text-amber-500">
                                      Quantidade: {item.qtd}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                        </div>
                      </section>
                    )}
                  </div>
                )}

                {/* 6. DIVINDADES */}
                {selectedItem.category === "divindades" && (
                  <div className="space-y-8">
                    <section>
                      <SectionTitle
                        title="Poderes Concedidos"
                        icon={Sparkles}
                        color="text-cyan-500"
                      />
                      <div className="space-y-4">
                        {selectedItem.raw.poderes.map((p: any) => (
                          <div
                            key={p.name}
                            className="p-5 bg-cyan-500/5 border border-cyan-500/20 rounded-2xl hover:bg-cyan-500/10 transition-colors border-l-4 border-l-cyan-500"
                          >
                            <div className="text-cyan-400 font-cinzel font-bold text-lg mb-2">
                              {p.name}
                            </div>
                            <p className="text-sm text-neutral-400 leading-relaxed italic">
                              {p.description}
                            </p>

                            {p.requirements && p.requirements.length > 0 && (
                              <div className="mt-4 flex flex-wrap gap-2">
                                <span className="text-[10px] text-neutral-500 uppercase font-black py-1">
                                  Requisitos:
                                </span>
                                {p.requirements
                                  .flat()
                                  .map((req: any, idx: number) => (
                                    <span
                                      key={idx}
                                      className="px-2 py-0.5 bg-cyan-950/30 border border-cyan-500/20 text-cyan-400 text-[10px] rounded font-bold uppercase"
                                    >
                                      {req.name ||
                                        (typeof req === "object"
                                          ? req.value || "Requisito"
                                          : req)}
                                    </span>
                                  ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </section>

                    <div className="p-6 bg-cyan-500/5 border border-cyan-500/20 rounded-2xl">
                      <p className="text-neutral-400 text-sm italic leading-relaxed text-center">
                        \"O panteão de Arton é vasto e misterioso. Seguir os
                        preceitos de uma divindade concede dons únicos, mas
                        exige devoção total.\"
                      </p>
                    </div>
                  </div>
                )}

                {/* 7. CLASSES */}
                {selectedItem.category === "classes" && (
                  <div className="space-y-10">
                    <section>
                      <SectionTitle
                        title="Sobre a Classe"
                        icon={Info}
                        color="text-orange-500"
                      />
                      <div className="text-neutral-300 leading-relaxed italic text-lg bg-orange-500/5 p-6 rounded-2xl border border-orange-500/20 border-l-4 border-l-orange-500">
                        {selectedItem.raw.description}
                      </div>
                    </section>

                    <section className="space-y-6">
                      <SectionTitle
                        title="Atributos de Classe"
                        icon={Shield}
                        color="text-orange-500"
                      />
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <StatCard
                          label="PV Inicial"
                          value={selectedItem.raw.pv}
                          icon={Flame}
                        />
                        <StatCard
                          label="PV/Nível"
                          value={selectedItem.raw.addpv}
                          icon={Flame}
                        />
                        <StatCard
                          label="PM Inicial"
                          value={selectedItem.raw.pm}
                          icon={Zap}
                        />
                        <StatCard
                          label="PM/Nível"
                          value={selectedItem.raw.addpm}
                          icon={Zap}
                        />
                      </div>

                      <div className="p-4 bg-black/40 rounded-xl border border-white/5">
                        <div className="text-[10px] text-neutral-500 uppercase font-bold mb-2">
                          Proficiências
                        </div>
                        <div className="text-sm text-neutral-300">
                          {selectedItem.raw.detailedProficiencies}
                        </div>
                      </div>
                    </section>

                    <section className="space-y-6">
                      <SectionTitle
                        title="Habilidades de Classe"
                        icon={Zap}
                        color="text-orange-500"
                      />
                      <div className="space-y-4">
                        {selectedItem.raw.abilities?.map(
                          (ab: any, i: number) => (
                            <div
                              key={i}
                              className="p-5 bg-neutral-900/50 border border-white/5 rounded-2xl hover:bg-neutral-800/50 transition-colors group"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div className="text-orange-400 font-cinzel font-bold text-lg">
                                  {ab.name}
                                </div>
                                <div className="p-1 px-2 bg-orange-500/10 text-orange-500 text-[10px] font-bold rounded uppercase">
                                  Nível {ab.nivel}
                                </div>
                              </div>
                              <p className="text-sm text-neutral-400 leading-relaxed italic">
                                {ab.text}
                              </p>
                            </div>
                          )
                        )}
                      </div>
                    </section>

                    {selectedItem.raw.powers &&
                      selectedItem.raw.powers.length > 0 && (
                        <section className="space-y-6">
                          <SectionTitle
                            title="Poderes de Classe"
                            icon={Book}
                            color="text-orange-500"
                          />
                          <div className="space-y-4">
                            {selectedItem.raw.powers.map(
                              (p: any, i: number) => (
                                <div
                                  key={i}
                                  className="p-5 bg-neutral-900/50 border border-white/5 rounded-2xl hover:bg-neutral-800/50 transition-colors group"
                                >
                                  <div className="text-orange-400 font-cinzel font-bold text-lg mb-2">
                                    {p.name}
                                  </div>
                                  <p className="text-sm text-neutral-400 leading-relaxed italic">
                                    {p.text}
                                  </p>

                                  {p.requirements &&
                                    p.requirements.length > 0 && (
                                      <div className="mt-4 flex flex-wrap gap-2">
                                        {p.requirements
                                          .flat()
                                          .map((req: any, idx: number) => (
                                            <span
                                              key={idx}
                                              className="px-2 py-0.5 bg-orange-950/30 border border-orange-500/20 text-orange-400 text-[10px] rounded font-bold uppercase"
                                            >
                                              {req.description ||
                                                req.name ||
                                                (typeof req === "object"
                                                  ? req.value || "Requisito"
                                                  : req)}
                                            </span>
                                          ))}
                                      </div>
                                    )}
                                </div>
                              )
                            )}
                          </div>
                        </section>
                      )}
                  </div>
                )}
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-6 bg-black/40 border-t border-white/5 flex gap-4">
              <button
                onClick={() => handleCopyLink(selectedItem)}
                className="flex-1 flex items-center justify-center gap-2 py-4 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold rounded-xl transition-all active:scale-95"
              >
                {copiedId === selectedItem.id ? (
                  <>
                    <CheckCircle2 size={20} /> Copiado!
                  </>
                ) : (
                  <>
                    <Copy size={20} /> Copiar Link
                  </>
                )}
              </button>
              <button
                onClick={() => setSelectedItem(null)}
                className="flex-1 py-4 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl transition-all shadow-xl shadow-amber-900/20 active:scale-95"
              >
                Fechar
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
