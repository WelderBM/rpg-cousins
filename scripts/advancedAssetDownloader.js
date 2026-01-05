const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const sharp = require("sharp");
const { GOOGLE_IMG_SCRAP } = require("google-img-scrap");

/**
 * Advanced Asset Downloader Script (CommonJS Version)
 * Automatically searches, downloads, and converts RPG character art for Races, Classes, and Origins.
 */

const ASSETS_DIR = path.join(process.cwd(), "public", "assets");
const DATA_DIR = path.join(process.cwd(), "src", "data");
const DOWNLOADED_URLS = new Set(); // Global tracker to avoid duplicate images in one session

// Mapeamento Épico (Portuguese Name -> English Search Logic)
const SEARCH_MAPPING = {
  // Classes
  Arcanista:
    "Wizard Arcanist mage RPG character art digital painting ArtStation",
  Bárbaro: "Barbarian warrior RPG character art digital painting ArtStation",
  Bardo: "Bard musician RPG character art digital painting ArtStation",
  Bucaneiro: "Buccaneer pirate RPG character art digital painting ArtStation",
  Caçador: "Ranger hunter RPG character art digital painting ArtStation",
  Cavaleiro:
    "Knight armored warrior RPG character art digital painting ArtStation",
  Clérigo: "Cleric priest RPG character art digital painting ArtStation",
  Druida: "Druid nature mage RPG character art digital painting ArtStation",
  Guerreiro: "Warrior fighter RPG character art digital painting ArtStation",
  Inventor:
    "Steampunk inventor engineer RPG character art digital painting ArtStation",
  Ladino: "Rogue thief RPG character art digital painting ArtStation",
  Lutador: "Fighter monk brawler RPG character art digital painting ArtStation",
  Nobre: "Noble aristocrat RPG character art digital painting ArtStation",
  Paladino:
    "Paladin holy warrior RPG character art digital painting ArtStation",

  // Races
  "Suraggel (Aggelus)": "Aasimar angel-kin RPG character art digital painting ArtStation",
  "Suraggel (Sulfure)": "Tiefling devil-kin RPG character art digital painting ArtStation",
  Anão: "Dwarf RPG character art digital painting ArtStation",
  Dahllan: "Dryad-kin nature race RPG character art digital painting ArtStation",
  Elfo: "Elf RPG character art digital painting ArtStation",
  Goblin: "Goblin RPG character art digital painting ArtStation",
  Lefeu: "Eldritch monster character art ArtStation",
  Minotauro: "Minotaur RPG character art digital painting ArtStation",
  Qareen: "Genie-kin half-genie RPG character art digital painting ArtStation",
  Golem: "Golem construct RPG character art digital painting ArtStation",
  Hynne: "Halfling RPG character art digital painting ArtStation",
  Humano: "Human RPG character art digital painting ArtStation",
  Kliren: "Gnome steampunk character art ArtStation",
  Medusa: "Medusa character art digital painting ArtStation",
  Osteon: "Skeleton undead character art digital painting ArtStation",
  Sereia: "Mermaid character art digital painting ArtStation",
  Sílfide: "Fairy character art digital painting ArtStation",
  Trog: "Lizardfolk character art digital painting ArtStation",

  // Origins
  Acólito: "Acolyte priest religious servant fantasy character art",
  "Amigo dos Animais": "Druid animal companion friend fantasy character art",
  Amnésico: "Mysterious hooded figure no face lost memory dark fantasy art",
  Aristocrata: "Rich noble aristocrat elegant clothes fantasy character art",
  Artesão: "Blacksmith artisan crafts worker fantasy character art",
  Artista: "Bard musician performer stage fantasy character art",
  "Assistente de Laboratório": "Alchemist assistant laboratory student fantasy character art",
  Batedor: "Male fantasy ranger scout bow character art",
  Capanga: "Thug criminal brute muscle mercenary fantasy character art",
  Charlatão: "Con artist charlatan trickster salesman fantasy character art",
  Circense: "Circus performer acrobat juggler fantasy character art",
  Criminoso: "Criminal thief outlaw bandit fantasy character art",
  Curandeiro: "Healer doctor herbalist with medicine fantasy character art",
  Eremita: "Hermit mountaintop monk old wise man fantasy character art",
  Escravo: "Escaped slave prisoner chains grit fantasy character art",
  Estudioso: "Scholar researcher student library books fantasy character art",
  Fazendeiro: "Farmer peasant countryside tools fantasy character art",
  Forasteiro: "Foreigner traveler from distant land exotic fantasy character art",
  Gladiador: "Gladiator arena combatant warrior fantasy character art",
  Guarda: "City guard soldier plate armor fantasy character art",
  Herdeiro: "Young noble heir family legacy fantasy character art",
  "Herói Camponês": "Peasant hero simple clothes sword fantasy character art",
  Marujo: "Sailor mariner sea traveler pirate fantasy character art",
  Mateiro: "Woodsman forest hunter survivalist fantasy character art",
  "Membro de Guilda": "Guild member artisan merchant society fantasy character art",
  Mercador: "Wealthy merchant trader bazaar goods fantasy character art",
  Minerador: "Miner pickaxe cave worker underground fantasy character art",
  Nômade: "Nomad desert wanderer tribal traveler fantasy character art",
  Pivete: "Street urchin orphan kid thief alley fantasy character art",
  Refugiado: "Grit war refugee survivor escapee fantasy character art",
  Seguidor: "Fantasy squire apprentice armored page character art",
  Selvagem: "Wild man primal barbarian nature fantasy character art",
  Soldado: "Army soldier infantry recruit fantasy character art",
  Taverneiro: "Innkeeper bartender tavern owner fantasy character art",
  Trabalhador: "Common worker laborer manual tools fantasy character art",

  // Deities
  Aharadak: "Eldritch horror god monster RPG art ArtStation",
  Allihanna: "Goddess of nature animals RPG art ArtStation",
  Arsenal: "God of war giant golem armor RPG art ArtStation",
  Azgher: "Sun god desert warrior RPG art ArtStation",
  Hynnin: "God of thieves trickery RPG art ArtStation",
  Kallyadranoch: "God of dragons power RPG art ArtStation",
  Khalmyr: "God of justice knight RPG art ArtStation",
  Lena: "Goddess of life birth RPG art ArtStation",
  "Lin-Wu": "Samurai god honor RPG art ArtStation",
  Marah: "Goddess of peace love RPG art ArtStation",
  Megalokk: "God of monsters beasts RPG art ArtStation",
  Nimb: "God of chaos luck RPG art ArtStation",
  Oceano: "God of sea ocean RPG art ArtStation",
  Sszzaas: "God of betrayal snakes RPG art ArtStation",
  "Tanna-Toh": "Goddess of knowledge scroll RPG art ArtStation",
  Tenebra: "Goddess of night undead RPG art ArtStation",
  Thwor: "God of goblins war RPG art ArtStation",
  Thyatis: "God of resurrection phoenix RPG art ArtStation",
  Valkaria: "Goddess of adventure humans RPG art ArtStation",
  Wynna: "Goddess of magic arcane RPG art ArtStation",
};

const getSearchTerm = (name) => {
  return (
    SEARCH_MAPPING[name] || `${name} RPG character art high fantasy ArtStation`
  );
};

const QUALITY_FILTERS = [
  "artstation",
  "deviantart",
  "charahub",
  "pinterest",
  "worldanvil",
];

const BANNED_SOURCES = ["instagram.com", "facebook.com", "lookaside.instagram.com"];

async function downloadAndProcessImage(url, targetPath) {
  try {
    const response = await axios({
      url,
      method: "GET",
      responseType: "arraybuffer",
      timeout: 15000,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });

    await sharp(response.data)
      .resize(800, 1200, { fit: "cover", position: "top" })
      .webp({ quality: 85 })
      .toFile(targetPath);

    return true;
  } catch (error) {
    console.error(`  [!] Error downloading ${url}: ${error.message}`);
    return false;
  }
}

async function saveFallbackImage(targetPath) {
  try {
    await sharp({
      create: {
        width: 800,
        height: 1200,
        channels: 4,
        background: { r: 45, g: 35, b: 25, alpha: 1 },
      },
    })
      .webp()
      .toFile(targetPath);
  } catch (err) {
    console.error("  [!] Error creating fallback:", err.message);
  }
}

async function processItem(name, folderName) {
  const fileName = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "");

  const targetPath = path.join(ASSETS_DIR, folderName, `${fileName}.webp`);

  if (fs.existsSync(targetPath)) {
    console.log(`[PASS] ${name} already exists.`);
    return;
  }

  const searchTerm = getSearchTerm(name);
  console.log(`[PROCESS] ${name} -> Search: "${searchTerm}"`);

  try {
    const results = await GOOGLE_IMG_SCRAP({
      search: searchTerm,
      limit: 10,
    });
    const images = results.result || [];
    if (images.length > 0) {
      // Filter out banned sources and already used URLs
      const filtered = images.filter((img) => {
        const isBanned = BANNED_SOURCES.some((s) => img.url.toLowerCase().includes(s));
        return !isBanned && !DOWNLOADED_URLS.has(img.url);
      });
      
      const sorted = (filtered.length > 0 ? filtered : images).sort((a, b) => {
        const aScore = QUALITY_FILTERS.some((f) =>
          a.url.toLowerCase().includes(f)
        )
          ? 1
          : 0;
        const bScore = QUALITY_FILTERS.some((f) =>
          b.url.toLowerCase().includes(f)
        )
          ? 1
          : 0;
        return bScore - aScore;
      });

      const bestUrl = sorted[0].url;
      DOWNLOADED_URLS.add(bestUrl);
      
      console.log(`  [+] Downloading from: ${bestUrl}`);
      const success = await downloadAndProcessImage(bestUrl, targetPath);

      if (!success) {
        console.log(`  [-] Failed to download ${bestUrl}, trying next...`);
        // Basic second attempt
        if (sorted.length > 1) {
            const secondBest = sorted[1].url;
            DOWNLOADED_URLS.add(secondBest);
            const secondSuccess = await downloadAndProcessImage(secondBest, targetPath);
            if (!secondSuccess) await saveFallbackImage(targetPath);
        } else {
            await saveFallbackImage(targetPath);
        }
      }
    } else {
      console.log(`  [?] No images found, using fallback.`);
      await saveFallbackImage(targetPath);
    }
  } catch (err) {
    console.error(`  [!] Search error for ${name}:`, err.message);
    await saveFallbackImage(targetPath);
  }

  await new Promise((r) => setTimeout(r, 1000));
}

async function main() {
  console.log("--- ADVANCED ASSET DOWNLOADER ---");

  await fs.ensureDir(path.join(ASSETS_DIR, "races"));
  await fs.ensureDir(path.join(ASSETS_DIR, "classes"));
  await fs.ensureDir(path.join(ASSETS_DIR, "origins"));
  await fs.ensureDir(path.join(ASSETS_DIR, "deities"));

  // Discover Classes
  const classFiles = fs
    .readdirSync(path.join(DATA_DIR, "classes"))
    .filter((f) => f.endsWith(".ts"));
  const classes = classFiles.map((f) => {
    const content = fs.readFileSync(path.join(DATA_DIR, "classes", f), "utf8");
    const match = content.match(/name:\s*["'](.+?)["']/);
    return match ? match[1] : f.replace(".ts", "");
  });

  // Discover Races
  const raceFiles = fs
    .readdirSync(path.join(DATA_DIR, "races"))
    .filter((f) => f.endsWith(".ts"));
  const races = raceFiles.map((f) => {
    const content = fs.readFileSync(path.join(DATA_DIR, "races", f), "utf8");
    const match = content.match(/name:\s*["'](.+?)["']/);
    return match ? match[1] : f.replace(".ts", "");
  });

  // Discover Origins
  const originsContent = fs.readFileSync(
    path.join(DATA_DIR, "origins.ts"),
    "utf8"
  );
  // Extract only names from the 'origins' type definition for accuracy
  const originsMatch = originsContent.match(/export type origins =([\s\S]+?);/);
  const origins = [];
  if (originsMatch) {
    const typeContent = originsMatch[1];
    const matches = typeContent.matchAll(/['"](.+?)['"]/g);
    for (const match of matches) {
      if (!origins.includes(match[1])) {
        origins.push(match[1]);
      }
    }
  }

  // Discover Deities
  const deityFiles = fs
    .readdirSync(path.join(DATA_DIR, "divindades"))
    .filter((f) => f.endsWith(".ts") && f !== "index.ts");
  const deities = deityFiles.map((f) => {
    const content = fs.readFileSync(
      path.join(DATA_DIR, "divindades", f),
      "utf8"
    );
    const match = content.match(/name:\s*['"](.+?)['"]/);
    return match ? match[1] : f.replace(".ts", "");
  });

  console.log(`Discovered ${classes.length} classes, ${races.length} races, ${origins.length} origins, and ${deities.length} deities.`);

  const allTasks = [
    { items: classes, folder: "classes" },
    { items: races, folder: "races" },
    { items: origins, folder: "origins" },
    { items: deities, folder: "deities" },
  ];

  for (const task of allTasks) {
    for (const item of task.items) {
      await processItem(item, task.folder);
    }
  }

  console.log("\n--- ASSET SYNC COMPLETE ---");
}

main().catch(console.error);
