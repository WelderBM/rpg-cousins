import * as admin from "firebase-admin";
import path from "path";

// Initialize Firebase Admin
const serviceAccount = require("../serviceAccountKey.json");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

// Imports
import roles from "../src/data/roles";
import racas from "../src/data/racas";
import classes from "../src/data/classes";
import divindades from "../src/data/divindades";
import { Armas, Armaduras, Escudos } from "../src/data/equipamentos";
import { ORIGINS } from "../src/data/origins";
import generalPowers from "../src/data/poderes";
import * as spellsModule from "../src/data/magias/generalSpells";

async function uploadCollection(
  collectionName: string,
  data: any[],
  idField?: string
) {
  console.log(`Uploading ${data.length} items to ${collectionName}...`);
  let batch = db.batch();
  let count = 0;
  let batchCount = 0;

  for (const item of data) {
    const docRef =
      idField && item[idField]
        ? db.collection(collectionName).doc(String(item[idField]))
        : db.collection(collectionName).doc();

    // Recursive sanitization to handle nested arrays (Firestore doesn't support array of arrays)
    const sanitize = (obj: any): any => {
      if (Array.isArray(obj)) {
        // If array contains arrays, wrap inner arrays
        if (obj.some(Array.isArray)) {
          return obj.map((item) => {
            if (Array.isArray(item)) {
              return { _wrapped: true, list: sanitize(item) };
            }
            return sanitize(item);
          });
        }
        return obj.map(sanitize);
      } else if (obj !== null && typeof obj === "object") {
        const newObj: any = {};
        for (const [key, value] of Object.entries(obj)) {
          if (value !== undefined) {
            newObj[key] = sanitize(value);
          }
        }
        return newObj;
      }
      return obj;
    };

    const cleanItem = sanitize(JSON.parse(JSON.stringify(item)));

    batch.set(docRef, cleanItem);
    count++;

    if (count % 400 === 0) {
      await batch.commit();
      console.log(`Committed batch ${++batchCount}`);
      batch = db.batch();
    }
  }

  if (count % 400 !== 0) {
    await batch.commit();
    console.log(`Committed final batch ${++batchCount}`);
  }
  console.log(`Finished ${collectionName}.`);
}

async function uploadMap(
  collectionName: string,
  mapData: Record<string, any>,
  idIsKey = true
) {
  const list = Object.entries(mapData).map(([key, value]) => {
    if (idIsKey) return { ...value, id: key };
    return value;
  });
  await uploadCollection(collectionName, list, "id");
}

async function main() {
  console.log("Starting data seed...");

  try {
    // 1. Roles
    await db.collection("general").doc("roles").set(roles);
    console.log("Uploaded roles.");

    // 2. Races
    await uploadCollection("races", racas, "name");

    // 3. Classes
    await uploadCollection("classes", classes, "name");

    // 4. Divinities
    await uploadCollection("divinities", divindades, "name");

    // 5. Equipments
    const allEquipments = [
      ...Object.values(Armas).map((e) => ({ ...e, type: "weapon" })),
      ...Object.values(Armaduras).map((e) => ({ ...e, type: "armor" })),
      ...Object.values(Escudos).map((e) => ({ ...e, type: "shield" })),
    ];
    await uploadCollection("equipments", allEquipments, "nome");

    // 6. Origins
    await uploadMap("origins", ORIGINS);

    // 7. Powers
    const allPowers = [
      ...generalPowers.COMBATE.map((p) => ({ ...p, category: "COMBATE" })),
      ...generalPowers.DESTINO.map((p) => ({ ...p, category: "DESTINO" })),
      ...generalPowers.MAGIA.map((p) => ({ ...p, category: "MAGIA" })),
      ...generalPowers.CONCEDIDOS.map((p) => ({
        ...p,
        category: "CONCEDIDOS",
      })),
      ...generalPowers.TORMENTA.map((p) => ({ ...p, category: "TORMENTA" })),
    ];
    await uploadCollection("powers", allPowers, "name");

    // 8. Spells
    const allSpells: any[] = [];
    for (const key in spellsModule) {
      if (key.startsWith("spellsCircle") && !key.endsWith("Names")) {
        const circleSpells = (spellsModule as any)[key];
        if (typeof circleSpells === "object") {
          allSpells.push(...Object.values(circleSpells));
        }
      }
    }
    await uploadCollection("spells", allSpells, "nome");
  } catch (error) {
    console.error("Error importing data:", error);
  }
}

main();
