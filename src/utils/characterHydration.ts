import { Character } from "@/interfaces/Character";
import { getRaceByName } from "@/data/racas";
import CLASSES from "@/data/classes";
import { ORIGINS, origins } from "@/data/origins";
import DIVINDADES from "@/data/divindades";

export function hydrateCharacter(
  data: Partial<Character> & {
    raceName?: string;
    className?: string;
    originName?: string;
    deityName?: string;
  }
): Character {
  // Hydrate Race
  if (!data.race && data.raceName) {
    try {
      data.race = getRaceByName(data.raceName);
    } catch (e) {
      console.error("Failed to hydrate race:", e);
    }
  }

  // Hydrate Class
  if (!data.class && data.className) {
    try {
      const foundClass = CLASSES.find((c) => c.name === data.className);
      if (foundClass) {
        data.class = JSON.parse(JSON.stringify(foundClass));
      }
    } catch (e) {
      console.error("Failed to hydrate class:", e);
    }
  }

  // Hydrate Origin
  if (!data.origin && data.originName) {
    try {
      if (data.originName in ORIGINS) {
        data.origin = ORIGINS[data.originName as origins];
      }
    } catch (e) {
      console.error("Failed to hydrate origin:", e);
    }
  }

  // Hydrate Deity
  if (!data.deity && data.deityName) {
    try {
      const foundDeity = DIVINDADES.find((d) => d.name === data.deityName);
      if (foundDeity) {
        data.deity = foundDeity;
      }
    } catch (e) {
      console.error("Failed to hydrate deity:", e);
    }
  }

  return data as Character;
}
