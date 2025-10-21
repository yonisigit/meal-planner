export type DishCategory = "main" | "side" | "dessert" | "other";

export type Dish = {
  id: string;
  name: string;
  description?: string;
  category?: DishCategory;
  created_at?: string;
  updated_at?: string;
};

export const DISH_CATEGORY_ORDER: DishCategory[] = ["main", "side", "dessert", "other"];

export const DISH_CATEGORY_LABELS: Record<DishCategory, string> = {
  main: "Main dishes",
  side: "Side dishes",
  dessert: "Desserts",
  other: "Other",
};
