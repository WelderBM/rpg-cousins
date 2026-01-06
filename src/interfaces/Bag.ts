import { cloneDeep, differenceBy, isArray, merge, mergeWith } from "lodash";
import Equipment, { BagEquipments } from "./Equipment";

const defaultEquipments: BagEquipments = {
  "Item Geral": [
    {
      nome: "Mochila",
      group: "Item Geral",
      spaces: 0,
    },
    {
      nome: "Saco de dormir",
      group: "Item Geral",
      spaces: 1,
    },
    {
      nome: "Traje de viajante",
      group: "Item Geral",
      spaces: 0,
    },
  ],
  Alimentação: [],
  Alquimía: [],
  Animal: [],
  Arma: [],
  Armadura: [],
  Escudo: [],
  Hospedagem: [],
  Serviço: [],
  Vestuário: [],
  Veículo: [],
};

export function calcBagSpaces(bagEquipments: BagEquipments): number {
  const equipments = Object.values(bagEquipments).flat();

  let spaces = 0;

  equipments.forEach((equipment: Equipment) => {
    const equipamentSpaces = equipment.spaces || 0;
    const quantity = equipment.quantidade || 1;
    spaces += equipamentSpaces * quantity;
  });

  return spaces;
}

export function calcArmorPenalty(equipments: BagEquipments): number {
  const armorPenalty = equipments.Armadura.reduce(
    (acc, armor) => acc + armor.armorPenalty,
    0
  );

  const shieldPenalty = equipments.Escudo.reduce(
    (acc, armor) => acc + armor.armorPenalty,
    0
  );

  return armorPenalty + shieldPenalty;
}

export default class Bag {
  public equipments: BagEquipments;

  public spaces: number;

  public armorPenalty: number;

  constructor(equipments?: Partial<BagEquipments>) {
    if (equipments && Object.keys(equipments).length > 0) {
      // Use provided equipments, but ensure all groups exist
      const keys = Object.keys(defaultEquipments) as Array<keyof BagEquipments>;
      const baseStructure: any = {};
      keys.forEach((k) => (baseStructure[k] = []));

      this.equipments = merge(baseStructure, equipments);
    } else {
      this.equipments = cloneDeep(defaultEquipments);
    }

    this.spaces = calcBagSpaces(this.equipments);
    this.armorPenalty = calcArmorPenalty(this.equipments);
  }

  public setEquipments(equipments: BagEquipments): void {
    this.equipments = equipments;
    this.spaces = calcBagSpaces(this.equipments);
    this.armorPenalty = calcArmorPenalty(this.equipments);
  }

  public getEquipments(): BagEquipments {
    return this.equipments;
  }

  public getSpaces(): number {
    return this.spaces;
  }

  public getArmorPenalty(): number {
    return this.armorPenalty;
  }

  public addEquipment(equipments: Partial<BagEquipments>): void {
    const newEquipments = cloneDeep(this.equipments);

    Object.entries(equipments).forEach(([group, items]) => {
      const g = group as keyof BagEquipments;
      if (items && Array.isArray(items)) {
        items.forEach((newItem) => {
          const existing = newEquipments[g].find(
            (i) => i.nome === newItem.nome
          );
          if (existing) {
            existing.quantidade =
              (existing.quantidade || 1) + (newItem.quantidade || 1);
          } else {
            (newEquipments[g] as any).push({
              ...newItem,
              quantidade: newItem.quantidade || 1,
            });
          }
        });
      }
    });

    this.setEquipments(newEquipments);
  }
}
