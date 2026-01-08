import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
import { CharacterService } from "../../lib/characterService";
import { CharacterSheetView } from "../character/CharacterSheetView";
import { Character } from "@/interfaces/Character";
import { Atributo } from "../../data/atributos";

import { formatAssetName, getRaceImageName } from "../../utils/assetUtils";
import { getAttributeTotal } from "../../utils/attributeUtils";
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
  const router = useRouter();
  const { user } = useStore();

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

  const [isFinalizing, setIsFinalizing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const previewCharacter = React.useMemo<Character>(() => {
    const mappedAttributes: any = {};
    ATTRIBUTES_LIST.forEach((attr) => {
      const base = baseAttributes[attr];
      const total = getAttributeTotal(
        attr,
        baseAttributes,
        selectedRace,
        flexibleAttributeChoices
      );
      const racial = total - base;

      mappedAttributes[attr] = {
        name: attr,
        value: {
          base,
          bonus: racial,
          sources: ["Base", racial !== 0 ? "Raça" : ""].filter(Boolean),
          total,
        },
        mod: Math.floor(total / 2) - 5,
      };
    });

    const hpBase = selectedClass?.pv || 16;
    const pmBase = selectedClass?.pm || 4;
    const conMod = mappedAttributes[Atributo.CONSTITUICAO].mod;

    return {
      name: name || "Sem Nome",
      race: selectedRace,
      class: selectedClass,
      level: 1,
      attributes: mappedAttributes,
      skills: selectedSkills,
      origin: selectedOrigin,
      originBenefits: originBenefits,
      deity: selectedDeity,
      grantedPowers: selectedGrantedPowers,
      bag: bag,
      money,
      currentPv: hpBase + conMod,
      currentPm: pmBase,
    };
  }, [
    name,
    selectedRace,
    selectedClass,
    baseAttributes,
    flexibleAttributeChoices,
    selectedSkills,
    selectedOrigin,
    originBenefits,
    selectedDeity,
    selectedGrantedPowers,
    bag,
    money,
  ]);

  const handleFinalize = async () => {
    if (!name.trim()) {
      alert("Por favor, dê um nome ao seu herói!");
      return;
    }

    try {
      setIsFinalizing(true);
      setError(null);

      const mappedAttributes: any = {};
      ATTRIBUTES_LIST.forEach((attr) => {
        const base = baseAttributes[attr];
        const total = getAttributeTotal(
          attr,
          baseAttributes,
          selectedRace,
          flexibleAttributeChoices
        );
        const racial = total - base;
        const attrSources = [];
        if (base !== 0) attrSources.push("Base");
        if (racial !== 0) attrSources.push("Raça");

        mappedAttributes[attr] = {
          name: attr,
          value: { base, bonus: racial, sources: attrSources, total },
          mod: total,
        };
      });

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

      const finalBag = new Bag();

      if (selectedClass) {
        const classEquips = getClassEquipments(
          selectedClass,
          finalBag,
          selectedClassWeapons
        );
        finalBag.addEquipment(classEquips);
      }

      if (selectedOrigin?.getItems) {
        const originItems = selectedOrigin.getItems();
        let choiceIdx = 0;
        originItems.forEach((item) => {
          let equipmentToAdd: any = null;
          if (item.choice && selectedOriginWeapons[choiceIdx]) {
            equipmentToAdd = { ...selectedOriginWeapons[choiceIdx] };
            choiceIdx++;
          } else if (typeof item.equipment === "string") {
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
              equipmentToAdd = {
                nome: item.equipment,
                description: item.description || "Item de Origem",
                spaces: 1,
                group: "Item Geral",
              };
            }
          } else {
            equipmentToAdd = { ...(item.equipment as any) };
          }

          if (equipmentToAdd) {
            equipmentToAdd.quantidade = item.qtd || 1;
            if (item.description) equipmentToAdd.description = item.description;
            const payload: any = {};
            payload[equipmentToAdd.group || "Item Geral"] = [equipmentToAdd];
            finalBag.addEquipment(payload);
          }
        });
      }

      const characterData = {
        name,
        raceName: selectedRace?.name || "",
        className: selectedClass?.name || "",
        attributes: mappedAttributes,
        baseAttributes,
        flexibleAttributeChoices,
        race: selectedRace ? JSON.parse(JSON.stringify(selectedRace)) : null,
        class: selectedClass ? JSON.parse(JSON.stringify(selectedClass)) : null,
        skills: selectedSkills,
        originName: selectedOrigin?.name || null,
        originBenefits: originBenefits,
        deityName: selectedDeity?.name || null,
        grantedPowers: selectedGrantedPowers.map((p) => ({
          name: p.name,
          description: p.description || (p as any).text || "",
        })),
        money,
        bag: {
          equipments: finalBag.getEquipments(),
          spaces: finalBag.getSpaces(),
          armorPenalty: finalBag.getArmorPenalty(),
        },
        level: 1,
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

      const savedId = await CharacterService.saveCharacter(
        sanitizeForFirestore(characterData)
      );

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
        bag: finalBag,
        money: money,
        currentPv: hpBase + conMod,
        currentPm: pmBase,
      };

      setActiveCharacter(newActiveChar);

      setTimeout(() => {
        router.push("/market");
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
      <div className="max-w-7xl mx-auto p-4 sm:p-8">
        <div className="relative border-2 border-amber-900/20 rounded-3xl overflow-hidden bg-stone-950/50 shadow-2xl mb-20 min-h-[600px]">
          <div className="absolute top-4 left-4 z-[100] flex gap-2">
            <button
              onClick={() => setStep(4)}
              className="p-3 bg-stone-900/80 backdrop-blur-md border border-white/10 rounded-xl text-neutral-400 hover:text-amber-500 transition-all flex items-center gap-2 text-sm font-bold shadow-lg"
            >
              <ChevronLeft size={18} /> Voltar
            </button>
            <div className="px-4 py-3 bg-amber-900/20 backdrop-blur-md border border-amber-500/20 rounded-xl text-amber-500 text-sm font-black uppercase tracking-widest shadow-lg">
              Resumo Final
            </div>
          </div>

          <div className="pt-20">
            <CharacterSheetView
              character={previewCharacter}
              onUpdate={async (updates) => {
                if (updates.name !== undefined) setName(updates.name);
              }}
              isMestre={false}
            />
          </div>

          {!name && (
            <div className="absolute top-40 inset-x-0 mx-auto max-w-md z-[110] p-8 bg-stone-900/90 backdrop-blur-xl border border-amber-500/30 rounded-3xl shadow-2xl text-center space-y-4">
              <h2 className="text-2xl font-cinzel text-amber-500">
                Como seu herói se chama?
              </h2>
              <input
                type="text"
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Valerius de Valkaria"
                className="w-full bg-black/40 border-b-2 border-amber-500/50 p-3 text-2xl font-cinzel text-amber-100 focus:outline-none focus:border-amber-400 transition-colors text-center"
              />
            </div>
          )}
        </div>

        <div className="fixed bottom-24 md:bottom-0 left-0 md:left-64 right-0 p-6 bg-gradient-to-t from-stone-950 via-stone-950 to-transparent backdrop-blur-md z-30 border-t border-amber-900/10">
          <div className="max-w-5xl mx-auto flex flex-col items-center gap-3">
            {!user && (
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
            )}
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
