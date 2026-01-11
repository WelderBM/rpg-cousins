import React, { useState } from "react";
import {
  Shield,
  Swords,
  Crosshair,
  Hammer,
  FlaskRound,
  Shirt,
  Apple,
  Backpack,
  Package,
  Search,
  Dice6,
  Brain,
  MapPin,
  ChevronDown,
  ChevronUp,
  X,
} from "lucide-react";
import { CalculatedSkill } from "@/utils/skillUtils";

export const getItemSymbol = (item: any, size = 18) => {
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

export const Sword = ({
  size,
  className,
}: {
  size: number;
  className?: string;
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5" />
    <line x1="13" y1="19" x2="19" y2="13" />
    <line x1="16" y1="16" x2="20" y2="20" />
    <line x1="19" y1="21" x2="20" y2="20" />
  </svg>
);

export const DetailRow = ({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) => (
  <div className="flex justify-between items-center text-xs py-1 border-b border-white/5 last:border-0">
    <span className="text-amber-500/90 font-black uppercase tracking-widest text-[10px]">
      {label}
    </span>
    <span className="text-stone-100 font-bold text-right">{value}</span>
  </div>
);

export const ItemList = ({ title, items, icon: Icon }: any) => {
  if (!items || items.length === 0) return null;

  const handleGoogleSearch = (item: any) => {
    const itemName = item.name || item.nome;
    const searchQuery = `"${itemName}" medieval fantasy`;
    const encodedQuery = encodeURIComponent(searchQuery);
    const googleUrl = `https://www.google.com/search?tbm=isch&q=${encodedQuery}`;
    window.open(googleUrl, "_blank");
  };

  return (
    <div className="mb-8">
      <h3 className="text-xs font-black text-amber-500/90 uppercase tracking-[0.2em] mb-4 flex items-center gap-2 border-b border-stone-800/50 pb-2">
        {Icon && <Icon size={14} />} {title}
      </h3>
      <div className="space-y-3">
        {items.map((item: any, idx: number) => (
          <div
            key={idx}
            className="bg-stone-900/95 backdrop-blur-sm border border-stone-800/70 rounded-lg p-4 hover:border-amber-500/30 transition-all shadow-xl"
          >
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-bold text-stone-100 text-xs md:text-sm flex items-center gap-2 flex-1">
                <span className="text-amber-500/60">
                  {getItemSymbol(item, 14)}
                </span>
                {item.name || item.nome}
              </h4>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleGoogleSearch(item)}
                  className="flex-shrink-0 w-7 h-7 rounded-md bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 hover:border-blue-500/60 flex items-center justify-center transition-all group/search"
                  title="Pesquisar no Google"
                >
                  <Search
                    size={14}
                    className="text-blue-400 group-hover/search:text-blue-300"
                  />
                </button>
                {item.quantidade > 1 && (
                  <span className="text-[10px] bg-stone-800 text-stone-300 px-1.5 py-0.5 rounded border border-stone-700 font-bold">
                    x{item.quantidade}
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-1 mb-2">
              {item.dano && (
                <>
                  <DetailRow label="Dano" value={item.dano} />
                  {item.critico && item.critico !== "-" && (
                    <DetailRow
                      label=""
                      value={
                        <div className="flex items-center gap-1.5 justify-end">
                          {item.critico
                            .split("/")
                            .map((part: string, i: number) => (
                              <React.Fragment key={i}>
                                {i > 0 && <span>/</span>}
                                {part.includes("x") ? (
                                  <span>{part}</span>
                                ) : (
                                  <span className="flex items-center gap-1">
                                    <Dice6
                                      size={10}
                                      className="text-amber-500/60"
                                    />
                                    {part}
                                  </span>
                                )}
                              </React.Fragment>
                            ))}
                        </div>
                      }
                    />
                  )}
                  {item.tipo && (
                    <DetailRow label="Tipo de Dano" value={item.tipo} />
                  )}
                </>
              )}
              {item.weaponTags && item.weaponTags.length > 0 && (
                <DetailRow
                  label="Propriedades"
                  value={item.weaponTags.join(", ")}
                />
              )}
              {item.defenseBonus > 0 && (
                <DetailRow
                  label="Bônus Defesa"
                  value={`+${item.defenseBonus}`}
                />
              )}
              {item.armorPenalty > 0 && (
                <DetailRow label="Penalidade" value={`-${item.armorPenalty}`} />
              )}
              {item.alcance && item.alcance !== "-" && (
                <DetailRow label="Alcance" value={item.alcance} />
              )}
              {item.spaces !== undefined && item.spaces !== null && (
                <DetailRow
                  label="Espaço"
                  value={
                    item.spaces === 0 ? (
                      <span className="text-emerald-400 font-bold">Grátis</span>
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
        ))}
      </div>
    </div>
  );
};

export const SimpleList = ({
  title,
  items,
  icon: Icon,
  highlightedItems,
  highlightIcon: HighlightIcon,
  useIconAsBullet = false,
}: any) => {
  if (!items || items.length === 0) return null;
  return (
    <div className="mb-8">
      <h3 className="text-xs font-black text-amber-500/90 uppercase tracking-[0.2em] mb-4 flex items-center gap-2 border-b border-stone-800/50 pb-2">
        {Icon && <Icon size={14} />} {title}
      </h3>
      <ul className="space-y-4">
        {items.map((item: any, idx: number) => {
          const name = typeof item === "string" ? item : item.name || item.nome;
          let desc =
            typeof item === "string"
              ? null
              : item.text ||
                item.description ||
                item.effect ||
                item.desc ||
                item.value?.text ||
                item.value?.description ||
                item.value?.effect ||
                item.value?.desc;

          const isHighlighted =
            highlightedItems && highlightedItems.includes(name);

          return (
            <li
              key={idx}
              className="bg-stone-900/40 backdrop-blur-sm border border-white/5 rounded-xl px-4 py-3 text-sm text-stone-200 flex items-start gap-4 shadow-lg hover:border-amber-500/20 transition-all"
            >
              {useIconAsBullet && Icon ? (
                <Icon size={20} className="text-amber-500 mt-0.5 shrink-0" />
              ) : (
                <div className="mt-2.5 min-w-[6px] h-[6px] bg-amber-500 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.5)] shrink-0" />
              )}
              <div className="flex-1">
                <span className="font-cinzel font-bold block text-amber-100 text-base md:text-lg mb-1 flex items-center gap-2">
                  {name}
                  {isHighlighted && HighlightIcon && (
                    <HighlightIcon size={12} className="text-amber-500" />
                  )}
                </span>
                {desc && (
                  <span className="text-xs text-stone-400 block leading-relaxed italic pr-4">
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

export const SectionSlider = ({ title, items, icon: Icon }: any) => {
  if (!items || items.length === 0) return null;
  return (
    <div className="mb-10 group">
      <div className="flex items-center justify-between mb-4 px-1">
        <h3 className="text-xs font-black text-amber-500/90 uppercase tracking-[0.2em] flex items-center gap-2">
          {Icon && <Icon size={14} />} {title}
        </h3>
        <span className="text-[10px] text-stone-600 font-bold uppercase tracking-wider animate-pulse">
          Deslize &rarr;
        </span>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-6 -mx-4 px-4 scrollbar-none snap-x cursor-grab active:cursor-grabbing">
        {items.map((item: any, idx: number) => {
          const name = typeof item === "string" ? item : item.name || item.nome;
          let desc =
            typeof item === "string"
              ? null
              : item.description ||
                item.text ||
                item.effect ||
                item.desc ||
                item.value?.description ||
                item.value?.text ||
                item.value?.effect ||
                item.value?.desc;

          return (
            <div
              key={idx}
              className="min-w-[300px] md:min-w-[350px] bg-gradient-to-br from-stone-900 to-stone-950 border border-stone-800 rounded-xl p-6 snap-start shadow-2xl hover:border-amber-900/50 transition-all flex flex-col border-white/5"
            >
              <span className="font-serif font-bold text-amber-500 text-lg md:text-xl mb-4 block border-b border-white/5 pb-2">
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

export const SkillsDisplay = ({
  skills,
  originSkills,
}: {
  skills: CalculatedSkill[];
  originSkills: string[];
}) => {
  const [expandedSkill, setExpandedSkill] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  if (!skills || skills.length === 0) return null;

  const filteredSkills = skills.filter((skill) =>
    skill.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="mb-8 select-none">
      <div className="flex items-center justify-between mb-4 border-b border-stone-800/50 pb-2">
        <h3 className="text-xs font-black text-amber-500/90 uppercase tracking-[0.2em] flex items-center gap-2">
          <Brain size={14} /> Perícias
        </h3>
        <div className="relative group/search">
          <Search
            size={12}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-500 group-focus-within/search:text-amber-500 transition-colors pointer-events-none"
          />
          <input
            type="text"
            placeholder="Buscar..."
            className="bg-stone-950/40 border border-white/5 rounded-full py-1 pl-8 pr-8 text-[10px] text-stone-300 outline-none focus:border-amber-500/30 focus:bg-stone-900/60 transition-all w-24 sm:w-32 placeholder:text-stone-600"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-500 hover:text-amber-500 transition-colors"
            >
              <X size={10} />
            </button>
          )}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {filteredSkills.map((skill) => {
          const isOrigin = originSkills && originSkills.includes(skill.name);
          const isExpanded = expandedSkill === skill.name;

          return (
            <div
              key={skill.name}
              className={`bg-stone-900/40 backdrop-blur-sm border ${
                isOrigin ? "border-amber-500/30" : "border-white/5"
              } rounded-md overflow-hidden transition-all hover:border-amber-500/20`}
            >
              <div
                className="flex items-center justify-between p-2 cursor-pointer"
                onClick={() => setExpandedSkill(isExpanded ? null : skill.name)}
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <div className="relative shrink-0">
                    <div className="w-6 h-6 rounded bg-stone-800 flex items-center justify-center border border-white/5 group-hover:border-amber-500/50 transition-colors">
                      <span className="font-bold text-xs text-amber-100">
                        {skill.total >= 0 ? `+${skill.total}` : skill.total}
                      </span>
                    </div>
                  </div>
                  <div className="min-w-0">
                    <span className="font-bold text-stone-300 block text-[10px] sm:text-xs truncate flex items-center gap-1">
                      {skill.name}
                      {isOrigin && (
                        <MapPin
                          size={8}
                          className="text-amber-500 shrink-0"
                          title="Benefício de Origem"
                        />
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Compact Breakdown */}
              {isExpanded && (
                <div className="bg-black/20 p-2 border-t border-white/5 grid grid-cols-4 gap-1 text-center animate-in slide-in-from-top-1 duration-150">
                  <div className="flex flex-col items-center">
                    <span className="text-[7px] text-stone-500 uppercase font-black">
                      Nv/2
                    </span>
                    <span className="text-[9px] text-stone-300 font-bold">
                      +{skill.halfLevel}
                    </span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-[7px] text-stone-500 uppercase font-black">
                      {skill.modAttr.substring(0, 3)}
                    </span>
                    <span className="text-[9px] text-stone-300 font-bold">
                      {skill.attrMod >= 0 ? `+${skill.attrMod}` : skill.attrMod}
                    </span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-[7px] text-stone-500 uppercase font-black">
                      Tr
                    </span>
                    <span className="text-[9px] text-stone-300 font-bold">
                      +{skill.training}
                    </span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-[7px] text-stone-500 uppercase font-black">
                      Out
                    </span>
                    <span
                      className={`text-[9px] font-bold ${
                        skill.others < 0 ? "text-red-400" : "text-stone-300"
                      }`}
                    >
                      {skill.others >= 0 ? `+${skill.others}` : skill.others}
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
