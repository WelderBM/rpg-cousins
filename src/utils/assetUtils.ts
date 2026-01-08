export const formatAssetName = (name: string) => {
  // Remove text inside parentheses first (e.g. " (3m)")
  name = name.replace(/\([^)]*\)/g, "");

  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "")
    .replace(/-+/g, "-") // Remove duplicate hyphens
    .replace(/^-|-$/g, ""); // Remove trailing/leading hyphens
};

export const getRaceImageName = (raceName: string) => {
  // Special case for Suraggel variants (Aggelus/Sulfure)
  // We want to use the inner name: "Suraggel (Aggelus)" -> "aggelus"
  if (raceName.includes("Suraggel") && raceName.includes("(")) {
    const match = raceName.match(/\(([^)]+)\)/);
    if (match) {
      return formatAssetName(match[1]);
    }
  }
  return formatAssetName(raceName);
};

/**
 * Returns the path to the item's icon.
 * Note: In a client-side environment, checking for file existence synchronously is not possible.
 * Use the getFallbackIcon function in the onError handler of the image element.
 */
export const getItemIcon = (
  itemName: string,
  group: string = "Item Geral"
): string => {
  const sanitized = formatAssetName(itemName);
  return `/assets/items/${sanitized}.webp`;
};

export const getFallbackIcon = (group: string): string => {
  const formattedGroup = (group || "").toLowerCase();

  if (formattedGroup.includes("arma")) return "/assets/icons/weapon.png";
  if (formattedGroup.includes("armadura") || formattedGroup.includes("escudo"))
    return "/assets/icons/armor.png";
  if (formattedGroup.includes("alquimia") || formattedGroup.includes("poção"))
    return "/assets/icons/potion.png";
  if (formattedGroup.includes("alimento") || formattedGroup.includes("comida"))
    return "/assets/icons/food.png";
  if (formattedGroup.includes("vestuário") || formattedGroup.includes("veste"))
    return "/assets/icons/clothing.png";
  if (
    formattedGroup.includes("ferramenta") ||
    formattedGroup.includes("ofício")
  )
    return "/assets/icons/tool.png";
  if (formattedGroup.includes("geral") || formattedGroup.includes("mochila"))
    return "/assets/icons/gear.png";

  // Default fallback
  return "/assets/icons/monster.png";
};
