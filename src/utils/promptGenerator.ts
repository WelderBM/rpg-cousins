import { Character } from "../interfaces/Character";
import Race from "../interfaces/Race";
import { ClassDescription } from "../interfaces/Class";

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

  // 2. Base Identity (Race & Class)
  const race = raceLore || character.race;
  const charClass = classLore || character.class;

  let identity = "A hero";
  if (race && charClass) {
    identity = `A ${race.name} ${charClass.name}`;
  } else if (race) {
    identity = `A ${race.name}`;
  } else if (charClass) {
    identity = `A ${charClass.name}`;
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
      parts.push(`Race appearance details: ${race.appearance}`);
    } else if (race.description) {
      parts.push(`Race lore: ${race.description}`);
    }
  }

  // 5. Extracts from Class lore
  if (charClass) {
    if (charClass.description) {
      parts.push(`Class theme: ${charClass.description}`);
    }

    // Add some abilities as flavor if they have good names/text
    const flavors = charClass.abilities
      .slice(0, 2)
      .map((a) => a.name)
      .join(", ");
    if (flavors) {
      parts.push(`Specialty: ${flavors}`);
    }
  }

  return parts.join(". ");
}
