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
    <div className="min-h-screen bg-stone-950 text-neutral-100 pb-32">
      <div className="max-w-2xl mx-auto p-4 sm:p-8 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-cinzel text-amber-500">Resumo Final</h2>
          <p className="text-xs text-stone-500 uppercase tracking-widest font-bold">
            Revise sua ficha antes de começar a aventura
          </p>
        </div>

        <div className="relative border border-white/5 rounded-2xl overflow-hidden bg-stone-900/20 backdrop-blur-md shadow-2xl">
          <div className="p-4 md:p-6">
            <CharacterSheetView
              character={previewCharacter}
              onUpdate={async (updates) => {
                if (updates.name !== undefined) setName(updates.name);
              }}
              isMestre={false}
            />
          </div>

          {!name && (
            <div className="absolute inset-0 z-40 flex items-center justify-center p-6 bg-stone-950/90 backdrop-blur-xl">
              <div className="max-w-xs w-full text-center space-y-6">
                <h2 className="text-2xl font-cinzel text-amber-500">
                  Qual o seu nome?
                </h2>
                <input
                  type="text"
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Valerius"
                  className="w-full bg-transparent border-b-2 border-amber-500/50 p-2 text-2xl font-cinzel text-amber-100 focus:outline-none focus:border-amber-400 transition-colors text-center"
                />
              </div>
            </div>
          )}
        </div>

        {/* Action Footer */}
        <div className="fixed bottom-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-t from-stone-950 via-stone-950 to-transparent backdrop-blur-md z-50">
          <div className="max-w-2xl mx-auto flex flex-col items-center gap-3">
            {!user && (
              <div className="bg-red-900/20 border border-red-500/50 rounded-xl p-3 flex items-center gap-3 w-full backdrop-blur-sm">
                <div className="p-2 bg-red-500/10 rounded-full text-red-400">
                  <User size={16} />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-[10px] text-red-200 font-bold uppercase tracking-widest">
                    Acesso Exigido
                  </p>
                  <p className="text-[10px] text-red-300/70">
                    Faça login para salvar permanentemente.
                  </p>
                </div>
              </div>
            )}
            <button
              onClick={handleFinalize}
              disabled={!user || isFinalizing}
              className="w-full py-4 bg-amber-600 hover:bg-amber-500 text-stone-950 font-black rounded-xl shadow-2xl active:scale-95 transition-all disabled:opacity-50 disabled:grayscale disabled:scale-100 uppercase tracking-widest text-sm flex justify-center items-center gap-2"
            >
              {isFinalizing ? (
                "Forjando Destino..."
              ) : (
                <>
                  <CheckCircle2 size={20} />
                  <span>{user ? "Finalizar Herói" : "Faça Login"}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummarySelection;
