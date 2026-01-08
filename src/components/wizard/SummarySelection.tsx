import React, { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useCharacterStore } from "../../store/useCharacterStore";
import { useStore } from "../../store";
import {
  Shield,
  Zap,
  User,
  MapPin,
  Heart,
  Brain,
  Sparkles,
  ChevronLeft,
  CheckCircle2,
  Sword,
  Scroll,
  Copy,
  Flame,
} from "lucide-react";
import { SimpleList } from "../character/DisplayComponents";
import { Atributo } from "../../data/atributos";
import { CharacterService } from "../../lib/characterService";

import { formatAssetName, getRaceImageName } from "../../utils/assetUtils";
import { sanitizeForFirestore } from "../../utils/firestoreUtils";
import Bag from "../../interfaces/Bag";
import { Armas, Armaduras, Escudos } from "../../data/equipamentos";
import { GENERAL_EQUIPMENT } from "../../data/equipamentos-gerais";
import { getClassEquipments } from "../../functions/general";

const ATTRIBUTES_LIST = [
  Atributo.FORCA,
  Atributo.DESTREZA,
  Atributo.CONSTITUICAO,
  Atributo.INTELIGENCIA,
  Atributo.SABEDORIA,
  Atributo.CARISMA,
];

const SummarySelection = () => {
  const {
    name,
    setName,
    selectedRace,
    selectedClass,
    baseAttributes,
    flexibleAttributeChoices,
    selectedOrigin,
    originBenefits,
    selectedDeity,
    selectedGrantedPowers,
    selectedClassPowers,
    bag,
    selectedClassWeapons,
    selectedOriginWeapons,
    money,
    selectedSkills,
    setStep,
    resetWizard,
    setActiveCharacter,
  } = useCharacterStore();

  const { user } = useStore();
  const router = useRouter();

  const [isFinalizing, setIsFinalizing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Helper to get final attribute value
  const getFinalAttr = (attr: Atributo) => {
    let bonus = 0;
    if (selectedRace) {
      selectedRace.attributes.attrs.forEach((a, idx) => {
        if (a.attr === attr) bonus += a.mod;
        if (a.attr === "any" && flexibleAttributeChoices[idx] === attr)
          bonus += a.mod;
      });
    }
    return baseAttributes[attr] + bonus;
  };

  const finalAttributes = {
    [Atributo.FORCA]: getFinalAttr(Atributo.FORCA),
    [Atributo.DESTREZA]: getFinalAttr(Atributo.DESTREZA),
    [Atributo.CONSTITUICAO]: getFinalAttr(Atributo.CONSTITUICAO),
    [Atributo.INTELIGENCIA]: getFinalAttr(Atributo.INTELIGENCIA),
    [Atributo.SABEDORIA]: getFinalAttr(Atributo.SABEDORIA),
    [Atributo.CARISMA]: getFinalAttr(Atributo.CARISMA),
  };

  // Generate IA Prompt
  const aiPrompt = `Portrayal of a ${
    selectedRace?.name || "Fantasy Character"
  } ${selectedClass?.name || "Warrior"}.
  
Character Details:
- Name: ${name || "Unknown"}
- Race: ${selectedRace?.name || "Unknown"} (Typical features of this race)
- Class: ${selectedClass?.name || "Unknown"} (Wearing typical class gear)
- Origin: ${selectedOrigin?.name || "Unknown Origin"}
- Deity: ${selectedDeity?.name || "No Deity"}

Attributes & Stats:
- Strength: ${finalAttributes[Atributo.FORCA]}
- Dexterity: ${finalAttributes[Atributo.DESTREZA]}
- Constitution: ${finalAttributes[Atributo.CONSTITUICAO]}
- Intelligence: ${finalAttributes[Atributo.INTELIGENCIA]}
- Wisdom: ${finalAttributes[Atributo.SABEDORIA]}
- Charisma: ${finalAttributes[Atributo.CARISMA]}

Skills & Abilities:
- Trained Skills: ${selectedSkills.join(", ")}
${
  selectedGrantedPowers.length > 0
    ? `- Special Powers: ${selectedGrantedPowers.map((p) => p.name).join(", ")}`
    : ""
}

Equipment & Gear:
- Weapons/Items: ${Object.values(bag.getEquipments())
    .flat()
    .map((i) => i.nome)
    .join(", ")}

Style:
Epic medieval fantasy art style, hyper-realistic, dynamic lighting, cinematic composition, detailed texture, 8k resolution, trending on ArtStation, Unreal Engine 5 render.`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(aiPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFinalize = async () => {
    if (!name.trim()) {
      alert("Por favor, dê um nome ao seu herói!");
      return;
    }

    try {
      setIsFinalizing(true);
      setError(null);

      // Map final attributes to the complex interface structure
      const mappedAttributes: any = {};

      ATTRIBUTES_LIST.forEach((attr) => {
        const base = baseAttributes[attr];

        // Calculate racial bonus on the fly
        let racial = 0;
        if (selectedRace) {
          selectedRace.attributes.attrs.forEach((a, idx) => {
            if (a.attr === attr) racial += a.mod;
            if (a.attr === "any" && flexibleAttributeChoices[idx] === attr)
              racial += a.mod;
          });
        }

        const total = base + racial;
        const attrSources = [];
        if (base !== 0) attrSources.push("Base");
        if (racial !== 0) attrSources.push("Raça");

        mappedAttributes[attr] = {
          name: attr,
          value: {
            base,
            bonus: racial,
            sources: attrSources,
            total,
          },
          mod: total,
        };
      });

      // Process Origin Items
      // Get all available items into a flat list for searching
      const allGeneralItems = [
        ...GENERAL_EQUIPMENT.adventurerEquipment,
        ...GENERAL_EQUIPMENT.tools,
        ...GENERAL_EQUIPMENT.esoteric,
        ...GENERAL_EQUIPMENT.clothing,
        ...GENERAL_EQUIPMENT.alchemyPrepared,
        ...GENERAL_EQUIPMENT.alchemyCatalysts,
        ...GENERAL_EQUIPMENT.alchemyPoisons,
        ...GENERAL_EQUIPMENT.food,
      ];

      const finalBag = new Bag(); // Start with a fresh bag to ensure no pollution from previous states

      // Add Class Equipments
      if (selectedClass) {
        const classEquipments = getClassEquipments(
          selectedClass,
          finalBag,
          selectedClassWeapons
        );
        finalBag.addEquipment(classEquipments);
      }

      if (selectedOrigin?.getItems) {
        const originItems = selectedOrigin.getItems();

        let choiceIdx = 0;
        originItems.forEach((item) => {
          let equipmentToAdd: any = null;

          // Se for uma escolha e o usuário selecionou algo, use a seleção
          if (item.choice && selectedOriginWeapons[choiceIdx]) {
            equipmentToAdd = { ...selectedOriginWeapons[choiceIdx] };
            choiceIdx++;
          } else if (typeof item.equipment === "string") {
            // Try to find in all databases
            const found =
              Object.values(Armas).find(
                (a) =>
                  a.nome.toLowerCase() ===
                  (item.equipment as string).toLowerCase()
              ) ||
              Object.values(Armaduras).find(
                (a) =>
                  a.nome.toLowerCase() ===
                  (item.equipment as string).toLowerCase()
              ) ||
              Object.values(Escudos).find(
                (a) =>
                  a.nome.toLowerCase() ===
                  (item.equipment as string).toLowerCase()
              ) ||
              allGeneralItems.find(
                (a) =>
                  a.nome.toLowerCase() ===
                  (item.equipment as string).toLowerCase()
              );

            if (found) {
              equipmentToAdd = { ...found };
            } else {
              // Generic item if not found
              equipmentToAdd = {
                nome: item.equipment,
                description: item.description || "Item de Origem",
                spaces: 1, // Default to 1 if unknown
                group: "Item Geral",
              };
            }
          } else {
            // It's already an object
            equipmentToAdd = { ...(item.equipment as any) };
          }

          if (equipmentToAdd) {
            equipmentToAdd.quantidade = item.qtd || 1;
            if (item.description) equipmentToAdd.description = item.description;

            const group = equipmentToAdd.group || "Item Geral";
            const payload: any = {};
            payload[group] = [equipmentToAdd];
            finalBag.addEquipment(payload);
          }
        });
      }

      const characterData = {
        name,
        raceName: selectedRace?.name || "",
        className: selectedClass?.name || "",
        attributes: mappedAttributes,
        baseAttributes, // Original points
        flexibleAttributeChoices,
        race: selectedRace ? JSON.parse(JSON.stringify(selectedRace)) : null,
        class: selectedClass ? JSON.parse(JSON.stringify(selectedClass)) : null,
        skills: selectedSkills,
        originName: selectedOrigin?.name || null,
        originBenefits: originBenefits, // Persist benefits
        deityName: selectedDeity?.name || null,
        grantedPowers: selectedGrantedPowers.map((p) => ({
          name: p.name,
          description: p.description || (p as any).text || "",
        })),
        money,
        // Convert class instance to plain object
        bag: {
          equipments: finalBag.getEquipments(),
          spaces: finalBag.getSpaces(),
          armorPenalty: finalBag.getArmorPenalty(),
        },
        level: 1,
        // Initialize physical traits with empty values
        physicalTraits: {
          gender: "",
          hair: "",
          eyes: "",
          skin: "",
          scars: "",
          height: "",
          extra: "",
        },
        classPowers: selectedClassPowers,
      };

      const sanitizedData = sanitizeForFirestore(characterData);

      const savedId = await CharacterService.saveCharacter(sanitizedData);

      // Set as active character immediately
      const hpBase = selectedClass?.pv || 16;
      const pmBase = selectedClass?.pm || 4;
      const conMod = mappedAttributes[Atributo.CONSTITUICAO].mod;

      const newActiveChar: any = {
        id: savedId,
        name,
        race: selectedRace,
        class: selectedClass,
        level: 1,
        attributes: mappedAttributes,
        skills: selectedSkills,
        origin: selectedOrigin,
        originBenefits,
        deity: selectedDeity,
        grantedPowers: selectedGrantedPowers,
        bag: finalBag, // Use finalBag which contains origin items
        money: money,
        currentPv: hpBase + conMod,
        currentPm: pmBase,
      };

      setActiveCharacter(newActiveChar);

      // Success redirect after animation
      setTimeout(() => {
        router.push("/market");
        // Delay reset to prevent UI flash before navigation
        setTimeout(() => resetWizard(), 100);
      }, 2000);
    } catch (err) {
      console.error(err);
      setError("Falha ao salvar o personagem. Tente novamente.");
      setIsFinalizing(false);
    }
  };

  if (isFinalizing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-stone-950 p-6 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center gap-6"
        >
          <div className="relative">
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute inset-0 bg-amber-500 rounded-full blur-2xl"
            />
            <CheckCircle2 size={120} className="text-amber-500 relative z-10" />
          </div>
          <h2 className="text-4xl font-cinzel text-amber-100">
            Personagem Criado!
          </h2>
          <p className="text-neutral-400 font-cinzel tracking-widest uppercase text-sm">
            Sua lenda começa em Arton...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-950 text-neutral-100 pb-48 md:pb-40">
      <div className="max-w-5xl mx-auto p-4 sm:p-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-12">
          <button
            onClick={() => setStep(4)}
            className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-500 hover:text-amber-500 transition-all"
          >
            <ChevronLeft size={24} />
          </button>
          <div className="flex-1">
            <h1 className="text-3xl md:text-5xl font-cinzel text-amber-500">
              Resumo Final
            </h1>
            <p className="text-xs text-neutral-500 uppercase tracking-widest mt-1">
              Revise sua ficha de personagem
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column: Identity & Attributes */}
          <div className="md:col-span-1 space-y-6">
            {/* Visual Identity Preview */}
            <div className="relative aspect-[3/4] bg-stone-900 rounded-2xl overflow-hidden border-2 border-amber-900/30 group shadow-2xl">
              {/* Race Background */}
              {selectedRace && (
                <Image
                  src={`/assets/races/${getRaceImageName(
                    selectedRace.name
                  )}.webp`}
                  alt={selectedRace.name}
                  fill
                  className="object-cover object-top opacity-30 grayscale-[50%]"
                />
              )}
              {/* Class Overlay */}
              {selectedClass && (
                <div className="absolute inset-0 flex items-center justify-center p-8">
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="relative w-full h-full"
                  >
                    <Image
                      src={`/assets/classes/${formatAssetName(
                        selectedClass.name
                      )}.webp`}
                      alt={selectedClass.name}
                      fill
                      className="object-contain drop-shadow-[0_0_30px_rgba(251,191,36,0.4)]"
                    />
                  </motion.div>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <div className="text-[10px] text-amber-500 font-bold uppercase tracking-[0.2em] mb-1">
                  Retrato Estimado
                </div>
                <div className="text-xl font-cinzel text-amber-100 truncate">
                  {name || "Sem Nome"}
                </div>
              </div>
            </div>

            {/* Character Name Input */}
            <div className="bg-neutral-900/50 border border-amber-900/30 rounded-2xl p-6 shadow-xl space-y-2">
              <label className="text-[10px] text-amber-500/70 uppercase font-black tracking-[0.2em]">
                O Nome do Herói
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Valerius de Valkaria"
                className="w-full bg-black/40 border-b border-amber-900/50 p-2 text-xl font-cinzel text-amber-100 focus:outline-none focus:border-amber-500 transition-colors placeholder:text-neutral-700"
              />
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "FOR", attr: Atributo.FORCA },
                { label: "DES", attr: Atributo.DESTREZA },
                { label: "CON", attr: Atributo.CONSTITUICAO },
                { label: "INT", attr: Atributo.INTELIGENCIA },
                { label: "SAB", attr: Atributo.SABEDORIA },
                { label: "CAR", attr: Atributo.CARISMA },
              ].map(({ label, attr }) => {
                const val = finalAttributes[attr];
                return (
                  <div
                    key={attr}
                    className="bg-stone-900/60 backdrop-blur-sm border border-white/10 rounded-2xl p-4 flex flex-col items-center group transition-all hover:border-amber-500/30 shadow-lg"
                  >
                    <span className="text-[10px] font-black text-stone-500 uppercase tracking-widest mb-1">
                      {label}
                    </span>
                    <div className="text-3xl font-black text-stone-100 tabular-nums font-cinzel">
                      {val >= 0 ? `+${val}` : val}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* HP/PM Quick View */}
            <div className="grid grid-cols-1 gap-4 pt-4 border-t border-white/5">
              <div className="bg-gradient-to-br from-red-950/90 to-stone-900/90 backdrop-blur-md border border-red-900/50 rounded-2xl p-5 flex flex-col items-center relative overflow-hidden shadow-2xl">
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="text-[10px] font-black text-red-400/80 uppercase tracking-widest">
                    Vida (PV) Inicial
                  </span>
                  <Heart size={14} className="text-red-500" />
                </div>
                <div className="text-4xl font-black text-red-100 tabular-nums font-cinzel">
                  {(selectedClass?.pv || 20) +
                    finalAttributes[Atributo.CONSTITUICAO]}
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-950/90 to-stone-900/90 backdrop-blur-md border border-blue-900/50 rounded-2xl p-5 flex flex-col items-center relative overflow-hidden shadow-2xl">
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="text-[10px] font-black text-blue-400/80 uppercase tracking-widest">
                    Mana (PM) Inicial
                  </span>
                  <Brain size={14} className="text-blue-500" />
                </div>
                <div className="text-4xl font-black text-blue-100 tabular-nums font-cinzel">
                  {selectedClass?.pm || 0}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Choices Summary */}
          <div className="md:col-span-2 space-y-6">
            {/* Identity Card */}
            <div className="bg-gradient-to-br from-stone-900 to-stone-950 border border-amber-900/20 rounded-2xl p-8 relative overflow-hidden group shadow-2xl">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <Scroll size={200} />
              </div>

              <div className="relative z-10 space-y-8">
                {/* Race & Class Block */}
                <div className="flex flex-col sm:flex-row gap-8">
                  <div className="space-y-1">
                    <h4 className="text-[10px] text-neutral-500 uppercase tracking-widest">
                      Raça
                    </h4>
                    <div className="flex items-center gap-3">
                      <User className="text-amber-500" size={18} />
                      <span className="text-2xl font-cinzel text-amber-100">
                        {selectedRace?.name || "Nenhuma"}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-[10px] text-neutral-500 uppercase tracking-widest">
                      Classe
                    </h4>
                    <div className="flex items-center gap-3">
                      <Sword className="text-amber-500" size={18} />
                      <span className="text-2xl font-cinzel text-amber-100">
                        {selectedClass?.name || "Nenhuma"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Origin & Deity Block */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-8 border-t border-white/5">
                  <div className="space-y-1">
                    <h4 className="text-[10px] text-neutral-500 uppercase tracking-widest">
                      Origem
                    </h4>
                    <div className="flex items-center gap-3">
                      <MapPin className="text-amber-500" size={18} />
                      <span className="text-xl font-cinzel text-amber-100">
                        {selectedOrigin?.name || "Sem Origem"}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-[10px] text-neutral-500 uppercase tracking-widest">
                      Divindade
                    </h4>
                    <div className="flex items-center gap-3">
                      <Sparkles className="text-amber-500" size={18} />
                      <span className="text-xl font-cinzel text-amber-100">
                        {selectedDeity?.name || "Ateu / Sem Divindade"}
                      </span>
                    </div>
                    {selectedDeity && (
                      <div className="mt-4 space-y-3">
                        <div className="bg-black/20 p-3 rounded-lg border border-white/5">
                          <p className="text-[10px] text-amber-500/60 uppercase font-bold mb-1">
                            Crenças & Objetivos
                          </p>
                          <p className="text-xs text-stone-400 italic leading-relaxed">
                            {selectedDeity.crencasObjetivos}
                          </p>
                        </div>
                        <div className="bg-red-950/10 p-3 rounded-lg border border-red-900/20">
                          <p className="text-[10px] text-red-500/60 uppercase font-bold mb-1">
                            Obrigações & Restrições
                          </p>
                          <p className="text-xs text-stone-400 italic leading-relaxed">
                            {selectedDeity.obrigacoesRestricoes}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Special Perks Block */}
                <SimpleList
                  title="Poderes Concedidos"
                  items={selectedGrantedPowers}
                  icon={Zap}
                  useIconAsBullet={true}
                />

                {/* Class Powers Block */}
                <SimpleList
                  title="Poderes de Classe"
                  items={selectedClassPowers}
                  icon={Sparkles}
                  useIconAsBullet={true}
                />
              </div>
            </div>

            {/* AI Prompt Section */}
            <div className="bg-stone-950/50 p-6 rounded-2xl border border-stone-800 shadow-xl overflow-hidden group">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-amber-500 font-cinzel text-sm flex items-center gap-2">
                  <Sparkles size={16} /> Prompt para IA (Retrato)
                </h3>
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-2 px-3 py-1.5 bg-amber-900/40 border border-amber-600/30 rounded-lg text-[10px] font-bold text-amber-100 hover:bg-amber-600 hover:text-black transition-all"
                >
                  {copied ? (
                    "Copiado!"
                  ) : (
                    <>
                      <Copy size={12} /> Copiar Prompt
                    </>
                  )}
                </button>
              </div>
              <p className="text-xs text-stone-400 leading-relaxed italic pr-12 whitespace-pre-wrap">
                "{aiPrompt}"
              </p>
              <div className="mt-4 pt-4 border-t border-stone-800">
                <p className="text-[10px] text-stone-500/70 uppercase tracking-[0.2em] leading-tight">
                  Dica: Use este texto em IAs como Midjourney ou DALL-E. Você
                  pode adicionar detalhes para personalizar ainda mais.
                </p>
              </div>
            </div>

            {/* Inventory Quick View */}
            <div className="bg-neutral-900/30 border border-neutral-800 rounded-2xl p-6">
              <h3 className="text-neutral-400 font-cinzel text-sm mb-4 flex items-center gap-2">
                <Shield size={16} /> Equipamento Selecionado
              </h3>
              <div className="flex flex-wrap gap-2">
                {(() => {
                  let items =
                    bag && typeof bag.getEquipments === "function"
                      ? Object.values(bag.getEquipments()).flat()
                      : [];

                  // Add preview of class equipments if not already in bag
                  if (selectedClass) {
                    const classEquips = getClassEquipments(
                      selectedClass,
                      undefined,
                      selectedClassWeapons
                    );
                    const classItems = Object.values(classEquips).flat();
                    // Avoid duplicates in preview if they were already added (though they usually aren't yet)
                    const existingNames = new Set(items.map((i) => i.nome));
                    const newClassItems = classItems.filter(
                      (i) => !existingNames.has(i.nome)
                    );
                    items = [...items, ...newClassItems];
                  }

                  return (
                    <>
                      {items.slice(0, 10).map((item, i) => (
                        <span
                          key={i}
                          className="text-[10px] bg-neutral-800 text-neutral-400 border border-neutral-700 px-3 py-1 rounded-full uppercase tracking-tighter"
                        >
                          {item.nome}
                        </span>
                      ))}
                      {items.length > 10 && (
                        <span className="text-[10px] text-neutral-600 italic">
                          + {items.length - 10} itens
                        </span>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>

        {/* Final Action Button */}
        <div className="fixed bottom-24 md:bottom-0 left-0 md:left-64 right-0 p-6 bg-gradient-to-t from-stone-950 via-stone-950 to-transparent backdrop-blur-md z-30 border-t border-amber-900/10">
          <div className="max-w-5xl mx-auto flex flex-col items-center gap-3">
            {!user ? (
              <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-3 flex items-center gap-3 max-w-lg w-full">
                <div className="p-2 bg-red-500/10 rounded-full text-red-400">
                  <User size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-red-200 font-bold">
                    Autenticação Necessária
                  </p>
                  <p className="text-xs text-red-300/70">
                    Você precisa estar logado para salvar seu herói.
                  </p>
                </div>
              </div>
            ) : null}
            <button
              onClick={handleFinalize}
              disabled={!user || isFinalizing}
              className="w-full py-5 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-black font-black font-cinzel uppercase tracking-[0.3em] rounded-2xl shadow-2xl shadow-amber-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
            >
              {isFinalizing
                ? "Salvando..."
                : user
                ? "Finalizar Personagem"
                : "Faça Login para Salvar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummarySelection;
