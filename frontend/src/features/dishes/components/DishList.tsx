import { useEffect, useMemo, useState } from "react";
import type { Dish } from "../types";
import { DISH_CATEGORY_LABELS } from "../types";
import { groupDishesByCategory } from "../utils/groupDishesByCategory";
import { ListShell } from "./ListShell";

type DishListProps = {
  dishes: Dish[];
  loading: boolean;
  error: string | null;
};

const formatCategoryLabel = (category: string) =>
  DISH_CATEGORY_LABELS[category as keyof typeof DISH_CATEGORY_LABELS] ?? category.replace(/^[a-z]/, (char) => char.toUpperCase());

export function DishList({ dishes, loading, error }: DishListProps) {
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
                <li
                  key={dish.id}
                  className="rounded-2xl border border-[#f5d8b4]/70 bg-white/80 p-5 shadow-[0_20px_45px_-30px_rgba(167,112,68,0.55)] transition duration-150 hover:-translate-y-0.5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2">
                      <div className="text-base font-semibold text-[#2b1c12]">{dish.name}</div>
                      {dish.description ? <div className="text-sm leading-relaxed text-[#6f5440]">{dish.description}</div> : null}
                    </div>
                    <div className="flex flex-col items-end gap-2 text-xs uppercase tracking-widest text-[#a77044]/90">
                      {dish.created_at ? <span>Added {new Date(dish.created_at).toLocaleDateString()}</span> : null}
                      {dish.updated_at ? <span>Updated {new Date(dish.updated_at).toLocaleDateString()}</span> : null}
                    </div>
                  </div>
                </li>
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
