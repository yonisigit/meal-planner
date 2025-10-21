import type { MenuCategory, SuggestedMenuByCategory, SuggestedMenuItem, SuggestedMenuResponse } from "../types";
import { MENU_CATEGORIES } from "../types";

export const createEmptyMenuByCategory = (): SuggestedMenuByCategory => ({
  main: [],
  side: [],
  dessert: [],
  other: [],
});

export const groupMenuItemsByCategory = (
  input: SuggestedMenuResponse | SuggestedMenuItem[] | undefined,
): SuggestedMenuByCategory => {
  const grouped = createEmptyMenuByCategory();
  if (!input) {
    return grouped;
  }

  if (Array.isArray(input)) {
    input.forEach((item) => {
      const fallbackCategory: MenuCategory = "other";
      const normalizedCategory = typeof item.category === "string" ? item.category.toLowerCase() : "";
      const resolvedCategory = MENU_CATEGORIES.find((category) => category === normalizedCategory) ?? fallbackCategory;
      grouped[resolvedCategory].push({
        ...item,
        avgRank: item.avgRank != null ? Number(item.avgRank) : null,
      });
    });
    return grouped;
  }

  Object.entries(input).forEach(([rawKey, value]) => {
    if (!Array.isArray(value)) {
      return;
    }
    const fallbackCategory: MenuCategory = "other";
    const normalizedKey = rawKey.toLowerCase();
    const matchedCategory = MENU_CATEGORIES.find((category) => category === normalizedKey) ?? fallbackCategory;
    grouped[matchedCategory] = value.map((item) => ({
      ...item,
      avgRank: item.avgRank != null ? Number(item.avgRank) : null,
    }));
  });

  MENU_CATEGORIES.forEach((category) => {
    if (!grouped[category]) {
      grouped[category] = [];
    }
  });

  return grouped;
};
