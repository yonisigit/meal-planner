import { DISH_CATEGORY_ORDER, type Dish } from "../types";

export type GroupedDishesResult = {
  grouped: Record<string, Dish[]>;
  orderedCategories: string[];
};

export function groupDishesByCategory(dishes: Dish[]): GroupedDishesResult {
  const buckets = dishes.reduce<Record<string, Dish[]>>((acc, dish) => {
    const rawCategory = (dish.category ?? "other").toLowerCase();
    const categoryKey = rawCategory || "other";
    if (!acc[categoryKey]) {
      acc[categoryKey] = [];
    }
    acc[categoryKey].push(dish);
    return acc;
  }, {});

  Object.keys(buckets).forEach((key) => {
    buckets[key] = buckets[key].slice().sort((a, b) => a.name.localeCompare(b.name));
  });

  const extras = Object.keys(buckets).filter(
    (key) => !DISH_CATEGORY_ORDER.includes(key as (typeof DISH_CATEGORY_ORDER)[number]),
  );

  const orderedCategories = [...DISH_CATEGORY_ORDER, ...extras].filter(
    (category, index, array) => (buckets[category]?.length ?? 0) > 0 && array.indexOf(category) === index,
  );

  return { grouped: buckets, orderedCategories };
}
