import type { GuestOption, Meal, MealGuest, SuggestedMenuByCategory } from "../types";
import { createEmptyMenuByCategory } from "../utils/menu";
import { ListShell } from "./ListShell";
import { MealCard } from "./MealCard";

type ModalGuest = { id: string; name: string; mealId: string };

type MealListProps = {
  meals: Meal[];
  mealGuests: Record<string, MealGuest[]>;
  availableGuests: GuestOption[];
  guestOptionsLoading: boolean;
  guestOptionsError: string | null;
  onAddGuests: (mealId: string, guestIds: string[]) => Promise<void>;
  onLoadMenu: (mealId: string) => Promise<SuggestedMenuByCategory>;
  menuByMeal: Record<string, SuggestedMenuByCategory>;
  menuLoading: Record<string, boolean>;
  menuError: Record<string, string | null>;
  onOpenGuestModal: (guest: ModalGuest) => void;
};

export function MealList({
  meals,
  mealGuests,
  availableGuests,
  guestOptionsLoading,
  guestOptionsError,
  onAddGuests,
  onLoadMenu,
  menuByMeal,
  menuLoading,
  menuError,
  onOpenGuestModal,
}: MealListProps) {
  if (!meals || meals.length === 0) {
    return (
      <ListShell>
        <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
          <span className="text-sm text-[#6f5440]">There are no meals to display.</span>
          <span className="text-sm text-[#6f5440]">Create your first gathering to see it listed here.</span>
        </div>
      </ListShell>
    );
  }

  return (
    <ListShell>
      <ul className="space-y-3">
        {meals.map((meal) => (
          <MealCard
            key={meal.id}
            meal={meal}
            guests={mealGuests[meal.id] ?? []}
            availableGuests={availableGuests}
            guestOptionsLoading={guestOptionsLoading}
            guestOptionsError={guestOptionsError}
            onAddGuests={onAddGuests}
            onLoadMenu={onLoadMenu}
            menuItems={menuByMeal?.[meal.id] ?? createEmptyMenuByCategory()}
            menuLoading={menuLoading?.[meal.id] ?? false}
            menuError={menuError?.[meal.id] ?? null}
            onOpenGuestModal={onOpenGuestModal}
          />
        ))}
      </ul>
    </ListShell>
  );
}
