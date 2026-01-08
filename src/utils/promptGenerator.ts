import { Character } from "../interfaces/Character";
import Race from "../interfaces/Race";
import { ClassDescription } from "../interfaces/Class";

const classFlavor: Record<string, string> = {
  Bárbaro: "a savage warrior driven by primal rage and raw strength",
  Bardo:
    "a versatile performer who weaves magic through music, art, and storytelling",
  Bucaneiro: "a daring swashbuckler, master of the seas and flamboyant combat",
  Caçador:
    "an impeccable tracker and master of survival in the wild, always stalking their prey",
  Cavaleiro:
    "a noble and indomitable armored protector, a master of the duel and challenge",
  Clérigo:
    "a devoted servant and conduit of divine power, wielding the will of their god",
  Druida:
    "a guardian of nature's balance, capable of shapeshifting and wielding primal forces",
  Guerreiro:
    "a disciplined master of martial arts, weaponry, and advanced combat techniques",
  Inventor:
    "a brilliant creator of ingenious gadgets, alchemical concoctions, and mechanical wonders",
  Ladino:
    "a cunning expert in stealth, mechanical traps, and precise, deadly strikes",
  Lutador:
    "a visceral and powerful combatant who uses their own body as a lethal weapon",
  Nobre:
    "a charismatic leader and master of social influence, commanding presence on and off the battlefield",
  Paladino:
    "a holy champion of justice and unbreakable light, a beacon of virtue in the darkness",
  Arcanista:
    "a powerful wielder of arcane mysteries, commanding the very fabric of reality",
};

const raceFlavor: Record<string, string> = {
  Humano: "a versatile and ambitious",
  Anão: "a sturdy and traditionalist",
  Elfo: "an elegant and magically-resonant",
  Goblin: "a scrappy and resourceful",
  Lefou:
    "a mutant touched by the alien corruption of the Tormenta, with strange features",
  Minotauro: "a powerful and disciplined",
  Qareen: "a mystical and charismatic being with genie heritage",
  Golem: "an artificial being animated by elemental forces and ancient magic",
  Hynne: "a small, agile, and incredibly lucky",
  Kliren:
    "a brilliant and inquisitive offspring of gnomes, obsessed with knowledge",
  Medusa: "a dangerous beauty with living venomous snakes for hair",
  Osteon: "an undead skeleton held together by ancient magic and sheer will",
  Sereia: "a graceful aquatic being from the depths, with shimmering scales",
  Silfide: "a tiny and mischievous fey creature of the enchanted forests",
  Sulfure: "a being with demonic heritage, possessing horns or dark features",
  Aggelus: "a being with celestial heritage, radiating a divine aura",
  Dahllan: "a nature-connected being with tree-spirit heritage",
  Trog: "a ferocious and scaly reptilian warrior of the marshes",
};

const deityFlavor: Record<string, string> = {
  AHARADAK: "devoted to the God of Corruption and the Tormenta",
  OCEANO: "blessed by the God of the Seas and the Depths",
  TENEBRA: "shrouded by the Goddess of Night and the Undead",
  VALKARIA: "inspired by the Goddess of Ambition and Freedom",
  WYNNA: "empowered by the Goddess of Magic",
  LENA: "gifted by the Goddess of Life and Healing",
  SSZZAAS: "marked by the God of Treachery and Poison",
  THYATIS: "guided by the God of Resurrection and Prophecy",
  ARSENAL: "hardened by the God of War",
  TANNATOH: "enlightened by the Goddess of Knowledge and Art",
  ALLIHANNA: "connected to the Goddess of Nature and Animals",
  MARAH: "pacified by the Goddess of Peace and Love",
  KALLYADRANOCH: "empowered by the God of Dragons and Power",
  KHALMYR: "bound by the God of Justice and Order",
  THWOR: "driven by the God of the Goblinoids and Victory",
  HYNINN: "tricky like the God of Thieves and Deception",
  AZGHER: "vigilant like the God of the Sun",
  LINWU: "honorable like the God of Honor and the Samurai",
  MEGALOKK: "wild like the God of Monsters",
  NIMB: "unpredictable like the God of Chaos and Luck",
};

const originFlavor: Record<string, string> = {
  Acólito: "a former acolyte of a temple",
  "Amigo dos Animais": "a friend of all animals",
  Amnésico: "with a mysterious and forgotten past",
  Aristocrata: "born of noble blood and high society",
  Artesão: "a skilled craftsperson",
  Artista: "a talented performer and entertainer",
  "Assistente de Laboratório": "a lab assistant for alchemists",
  Batedor: "a scout accustomed to the frontiers",
  Capanga: "a former street thug or enforcer",
  Charlatão: "a master of deceit and quick talk",
  Circense: "a former circus performer",
  Criminoso: "with a dark past in the criminal underworld",
  Curandeiro: "a healer of common folk",
  Eremita: "who lived in isolation seeking wisdom",
  Escravo: "who escaped the chains of servitude",
  Estudioso: "a researcher of ancient lore",
  Fazendeiro: "from a humble agricultural background",
  Forasteiro: "a stranger from distant lands",
  Gladiador: "a veteran of the arena and public combat",
  Guarda: "a former member of the city watch",
  Herdeiro: "who inherited a mysterious legacy",
  "Herói Camponês": "a simple peasant who rose to heroics",
  Marujo: "a sailor who knows the secrets of the sea",
  Mateiro: "a woodsman and expert of the forest",
  "Membro de Guilda": "connected to powerful trade or craft guilds",
  Mercador: "a merchant who knows the value of everything",
  Minerador: "hardened by work in the deep mines",
  Nômade: "a wanderer who calls no single place home",
  Pivete: "a street urchin who grew up in the city's alleys",
  Refugiado: "who fled from war or catastrophe",
  Seguidor: "a dedicated follower of a leader or cause",
  Selvagem: "who grew up far from civilization",
  Soldado: "a trained veteran of many battles",
  Taverneiro: "who knows every rumor and story of the inn",
  Trabalhador: "a simple worker with strong hands",
};

export function generateCharacterPrompt(
  character: Character,
  raceLore?: Race | null,
  classLore?: ClassDescription | null
): string {
  const parts: string[] = [];

  // 1. Art Style & Quality
  parts.push(
    "High-quality digital fantasy art, detailed character portrait, full body illustration, epic lighting, cinematic atmosphere, Tormenta20 RPG style"
  );

  // 2. Base Identity (Race & Class & Deity & Origin)
  const race = raceLore || character.race;
  const charClass = classLore || character.class;
  const deity = character.deity;
  const origin = character.origin;

  const raceName = race?.name || "";
  const className = charClass?.name || "";
  const deityName = deity?.name?.toUpperCase() || "";
  const originName = origin?.name || "";

  const fRace = raceFlavor[raceName] || (raceName ? `a ${raceName}` : "a");
  const fClass =
    classFlavor[className] || (className ? `${className}` : "hero");
  const fDeity = deityFlavor[deityName] || "";
  const fOrigin = originFlavor[originName] || "";

  let identity = `A character who is ${fRace} ${fClass}`;

  if (fOrigin) {
    identity += `, ${fOrigin}`;
  }

  if (fDeity) {
    identity += `, ${fDeity}`;
  }

  parts.push(identity);

  // 3. Physical Traits (User Input)
  if (character.physicalTraits) {
    const { gender, hair, eyes, skin, scars, height, extra } =
      character.physicalTraits;
    const traits = [];
    if (gender) traits.push(`gender: ${gender}`);
    if (height) traits.push(`height: ${height}`);
    if (hair) traits.push(`${hair} hair`);
    if (eyes) traits.push(`${eyes} eyes`);
    if (skin) traits.push(`${skin} skin`);
    if (scars) traits.push(`scars: ${scars}`);
    if (extra) traits.push(`details: ${extra}`);

    if (traits.length > 0) {
      parts.push(`Physical features: ${traits.join(", ")}`);
    }
  }

  // 4. Extracts from Race lore
  if (race) {
    if (race.appearance) {
      parts.push(`Appearance details: ${race.appearance}`);
    } else if (race.description) {
      parts.push(`Legacy: ${race.description}`);
    }
  }

  // 5. Extracts from Class/Deity lore
  if (charClass && charClass.description) {
    parts.push(`Vibe: ${charClass.description}`);
  }

  if (deity && deity.crencasObjetivos) {
    parts.push(`Divine philosophy: ${deity.crencasObjetivos}`);
  }

  // 6. Specialty Flavor
  if (charClass && charClass.abilities) {
    const flavors = charClass.abilities
      .slice(0, 2)
      .map((a) => a.name)
      .join(", ");
    if (flavors) {
      parts.push(`Abilities: ${flavors}`);
    }
  }

  return parts.join(". ");
}
