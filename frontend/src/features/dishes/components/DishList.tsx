import { useEffect, useMemo, useState } from "react";
import type { Dish } from "../types";
import { DISH_CATEGORY_LABELS } from "../types";
import { groupDishesByCategory } from "../utils/groupDishesByCategory";
import { ListShell } from "./ListShell";
import { DishCard } from "./DishCard";

type DishListProps = {
  dishes: Dish[];
  loading: boolean;
  error: string | null;
  onRefresh: () => Promise<void>;
};

const formatCategoryLabel = (category: string) =>
  DISH_CATEGORY_LABELS[category as keyof typeof DISH_CATEGORY_LABELS] ?? category.replace(/^[a-z]/, (char) => char.toUpperCase());

export function DishList({ dishes, loading, error, onRefresh }: DishListProps) {
  const { grouped, orderedCategories } = useMemo(() => groupDishesByCategory(dishes), [dishes]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(orderedCategories[0] ?? null);

  useEffect(() => {
    if (orderedCategories.length === 0) {
      if (selectedCategory !== null) {
        setSelectedCategory(null);
      }
      return;
    }

    if (!selectedCategory || !orderedCategories.includes(selectedCategory)) {
      setSelectedCategory(orderedCategories[0]);
    }
  }, [orderedCategories, selectedCategory]);

  const activeCategory = selectedCategory && grouped[selectedCategory] ? selectedCategory : orderedCategories[0] ?? null;
  const visibleDishes = activeCategory ? grouped[activeCategory] ?? [] : [];

  if (loading) {
    return (
      <ListShell>
        <div className="text-sm">Loading dishes...</div>
      </ListShell>
    );
  }

  if (error) {
    return (
      <ListShell>
        <div className="text-sm text-red-500">{error}</div>
      </ListShell>
    );
  }

  if (!dishes || dishes.length === 0) {
    return (
      <ListShell>
        <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-sm">
          <span>No dishes yet.</span>
          <span>Add your first signature recipe to get started.</span>
        </div>
      </ListShell>
    );
  }

  return (
    <ListShell>
      <div className="space-y-6">
        <div className="overflow-x-auto pb-2">
          <div className="flex min-w-max gap-2 sm:flex-wrap sm:min-w-0">
            {orderedCategories.map((category) => {
              const isActive = category === activeCategory;
              const count = grouped[category]?.length ?? 0;
              return (
                <button
                  key={category}
                  type="button"
                  className={`whitespace-nowrap rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.3em] transition ${
                    isActive
                      ? "border-[#d37655] bg-[#d37655] text-white shadow-[0_8px_20px_-10px_rgba(211,118,85,0.7)]"
                      : "border-[#f5d8b4] text-[#a77044] hover:border-[#d37655] hover:text-[#d37655]"
                  }`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {formatCategoryLabel(category)}
                  <span className="ml-2 text-[0.65rem] font-normal tracking-[0.2em]">{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {activeCategory && visibleDishes.length > 0 ? (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-[0.35em] text-[#a77044]">
              {formatCategoryLabel(activeCategory)}
            </h3>
            <ul className="space-y-3">
              {visibleDishes.map((dish) => (
                <DishCard key={dish.id} dish={dish} onRefresh={onRefresh} />
              ))}
            </ul>
          </div>
        ) : (
          <div className="rounded-2xl border border-[#f5d8b4]/60 bg-white/60 p-6 text-sm text-[#6f5440]">
            No dishes in this category yet.
          </div>
        )}
      </div>
    </ListShell>
  );
}
