import type { FormEvent, ReactNode } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../lib/axios';
import type { AxiosResponse } from 'axios';
import { useAuth } from '../context/AuthContext';

type Meal = {
  id: string;
  name: string;
  description?: string;
  date: string;
  created_at?: string;
  updated_at?: string;
};

type MealGuest = {
  id: string;
  name: string;
};

type SuggestedMenuItem = {
  id: string;
  dishId: string;
  name?: string;
  note?: string;
  avgRank?: number | null;
  category?: string;
  description?: string;
};

const MENU_CATEGORIES = ['main', 'side', 'dessert', 'other'] as const;
type MenuCategory = typeof MENU_CATEGORIES[number];

const MENU_CATEGORY_LABELS: Record<MenuCategory, string> = {
  main: 'Main dishes',
  side: 'Side dishes',
  dessert: 'Desserts',
  other: 'Other',
};

type SuggestedMenuByCategory = Record<MenuCategory, SuggestedMenuItem[]>;

type SuggestedMenuResponse = Partial<Record<MenuCategory, SuggestedMenuItem[]>>;

const groupMenuItemsByCategory = (input: SuggestedMenuResponse | SuggestedMenuItem[] | undefined): SuggestedMenuByCategory => {
  const grouped = createEmptyMenuByCategory();
  if (!input) {
    return grouped;
  }

  if (Array.isArray(input)) {
    input.forEach((item) => {
      const fallbackCategory: MenuCategory = 'other';
      const normalizedCategory = typeof item.category === 'string' ? item.category.toLowerCase() : '';
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
    const fallbackCategory: MenuCategory = 'other';
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

const createEmptyMenuByCategory = (): SuggestedMenuByCategory => ({
  main: [],
  side: [],
  dessert: [],
  other: [],
});

type GuestDishRank = {
  id: string;
  dish_id: string;
  rank: number;
  name?: string;
};

type GuestOption = MealGuest;

const MealsPage = () => {
  const { accessToken, isInitializing } = useAuth();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mealGuests, setMealGuests] = useState<Record<string, MealGuest[]>>({});
  const [menuByMeal, setMenuByMeal] = useState<Record<string, SuggestedMenuByCategory>>({});
  const [menuLoading, setMenuLoading] = useState<Record<string, boolean>>({});
  const [menuError, setMenuError] = useState<Record<string, string | null>>({});
  const [guestRanks, setGuestRanks] = useState<Record<string, GuestDishRank[]>>({});
  const [guestRanksLoading, setGuestRanksLoading] = useState<Record<string, boolean>>({});
  const [guestRanksError, setGuestRanksError] = useState<Record<string, string | null>>({});
  const [availableGuests, setAvailableGuests] = useState<GuestOption[]>([]);
  const [guestOptionsLoading, setGuestOptionsLoading] = useState(false);
  const [guestOptionsError, setGuestOptionsError] = useState<string | null>(null);
  const [modalGuest, setModalGuest] = useState<{ id: string; name: string; mealId: string } | null>(null);

  const loadAvailableGuests = useCallback(async () => {
    setGuestOptionsLoading(true);
    try {
      const res: AxiosResponse<GuestOption[]> = await api.get('/guests');
      const data = Array.isArray(res.data) ? res.data : [];
      setAvailableGuests(data);
      setGuestOptionsError(null);
    } catch (err) {
      console.error(err);
      setGuestOptionsError('Failed to load guests.');
    } finally {
      setGuestOptionsLoading(false);
    }
  }, []);

  const refreshMeals = useCallback(async () => {
    setLoading(true);
    try {
      const res: AxiosResponse<Meal[]> = await api.get('/meals');
      const data = Array.isArray(res.data) ? res.data : [];
      const sortedMeals = [...data].sort((a, b) => {
        const aTime = new Date(a.date ?? '').getTime();
        const bTime = new Date(b.date ?? '').getTime();
        if (Number.isNaN(aTime) || Number.isNaN(bTime)) {
          return (b.created_at ? new Date(b.created_at).getTime() : 0) - (a.created_at ? new Date(a.created_at).getTime() : 0);
        }
        return bTime - aTime;
      });
      const guestsMap: Record<string, MealGuest[]> = {};
      await Promise.all(sortedMeals.map(async (meal) => {
        try {
          const guestRes: AxiosResponse<MealGuest[]> = await api.get(`/meals/${meal.id}`);
          guestsMap[meal.id] = Array.isArray(guestRes.data) ? guestRes.data : [];
        } catch (guestErr) {
          console.error(guestErr);
          guestsMap[meal.id] = [];
        }
      }));
      setMealGuests(guestsMap);
      setMeals(sortedMeals);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Failed to load meals.');
      setMealGuests({});
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!accessToken || isInitializing) {
      return;
    }
    void refreshMeals();
  }, [accessToken, isInitializing, refreshMeals]);

  useEffect(() => {
    if (!accessToken || isInitializing) {
      return;
    }
    void loadAvailableGuests();
  }, [accessToken, isInitializing, loadAvailableGuests]);

  useEffect(() => {
    if (!isInitializing && !accessToken) {
      setMeals([]);
      setMealGuests({});
      setAvailableGuests([]);
      setGuestOptionsError(null);
    }
  }, [accessToken, isInitializing]);

  const loadMealGuests = useCallback(async (mealId: string, { silent = false }: { silent?: boolean } = {}) => {
    try {
      const res: AxiosResponse<MealGuest[]> = await api.get(`/meals/${mealId}`);
      const guests = Array.isArray(res.data) ? res.data : [];
      setMealGuests((prev) => ({ ...prev, [mealId]: guests }));
      return guests;
    } catch (err) {
      console.error(err);
      if (!silent) {
        toast.error('Failed to load meal guests.');
      }
      throw err;  
    }
  }, []);

  const loadSuggestedMenu = useCallback(async (mealId: string) => {
    console.debug('[MealsPage] loadSuggestedMenu called for', mealId);
    setMenuLoading((s) => ({ ...s, [mealId]: true }));
    try {
      const res: AxiosResponse<SuggestedMenuResponse | SuggestedMenuItem[] | undefined> = await api.get(`/meals/${mealId}/menu`);
      console.debug('[MealsPage] loadSuggestedMenu response', res?.data);
      const normalized = groupMenuItemsByCategory(res?.data);

      setMenuByMeal((prev) => ({ ...prev, [mealId]: normalized }));
      setMenuError((s) => ({ ...s, [mealId]: null }));
      return normalized;
    } catch (err) {
      console.error(err);
      setMenuError((s) => ({ ...s, [mealId]: 'Failed to load suggested menu.' }));
      throw err;
    } finally {
      setMenuLoading((s) => ({ ...s, [mealId]: false }));
    }
  }, []);

  const loadGuestDishRanks = useCallback(async (guestId: string) => {
    console.debug('[MealsPage] loadGuestDishRanks called for', guestId);
    setGuestRanksLoading((s) => ({ ...s, [guestId]: true }));
    try {
      const res: AxiosResponse<GuestDishRank[]> = await api.get(`/guests/${guestId}/dishes`);
      console.debug('[MealsPage] loadGuestDishRanks response', res?.data);
      const data = Array.isArray(res.data) ? res.data : [];
      setGuestRanks((prev) => ({ ...prev, [guestId]: data }));
      setGuestRanksError((s) => ({ ...s, [guestId]: null }));
      return data;
    } catch (err) {
      console.error(err);
      setGuestRanksError((s) => ({ ...s, [guestId]: 'Failed to load guest dish rankings.' }));
      throw err;
    } finally {
      setGuestRanksLoading((s) => ({ ...s, [guestId]: false }));
    }
  }, []);

  const handleAddGuestsToMeal = useCallback(async (mealId: string, guestIds: string[]) => {
    const uniqueGuestIds = Array.from(new Set(guestIds.filter(Boolean)));
    if (uniqueGuestIds.length === 0) {
      return;
    }

    try {
      await api.post(`/meals/${mealId}`, { guestIds: uniqueGuestIds });
      await loadMealGuests(mealId, { silent: true });
      toast.success(uniqueGuestIds.length === 1 ? 'Guest added to meal' : 'Guests added to meal');
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Failed to add guests to meal.';
      toast.error(message);
      throw new Error(message);
    }
  }, [loadMealGuests]);

  const handleRemoveGuestFromMeal = useCallback(async (mealId: string, guestId: string) => {
    try {
      await api.delete(`/meals/${mealId}/guests/${guestId}`);
      toast.success('Guest removed from meal');
      await loadMealGuests(mealId, { silent: true });
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Failed to remove guest from meal.';
      toast.error(message);
      throw new Error(message);
    }
  }, [loadMealGuests]);

  const headline = useMemo(() => {
    if (meals.length === 0) return 'Start by crafting a menu for your next gathering.';
    if (meals.length <= 3) return 'A handful of thoughtful menus ready to impress.';
    return `${meals.length} curated meals ready for your guests.`;
  }, [meals.length]);

  if (isInitializing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fdf4e3] text-[#6f5440]">
        Preparing your meals...
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#fdf4e3] text-[#3f2a1d]">
      <div className="pointer-events-none absolute -top-32 right-[-120px] h-96 w-96 rounded-full bg-[#f9c784] opacity-35 blur-3xl"></div>
      <div className="pointer-events-none absolute bottom-[-180px] left-[-100px] h-96 w-96 rounded-full bg-[#d88c9a] opacity-30 blur-3xl"></div>
  <div className="relative z-10 mx-auto flex min-h-screen max-w-5xl flex-col px-4 py-16 sm:px-6 sm:py-20 lg:px-12 lg:py-24">
        <header className="mb-12 max-w-3xl">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-[#a77044] sm:text-xs sm:tracking-[0.35em]">Meal plans</p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-[#2b1c12] sm:text-4xl">Design gatherings that feel effortless.</h1>
          <p className="mt-3 text-sm text-[#6f5440] sm:text-base">Pair the perfect guests with the dishes they adore. Add meals, jot down the essentials, and see exactly who is joining each table.</p>
        </header>

        <section className="rounded-3xl border border-white/60 bg-white/70 p-5 shadow-glow backdrop-blur sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-[#2b1c12]">Upcoming meals</h2>
              <p className="text-sm text-[#6f5440]">{headline}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <CreateMealButton onCreated={refreshMeals} />
            </div>
          </div>

          {loading && <ListShell>Loading meals...</ListShell>}
          {error && <ListShell error>{error}</ListShell>}
          {!loading && !error && (
            <MealList
              meals={meals}
              mealGuests={mealGuests}
              availableGuests={availableGuests}
              onAddGuests={handleAddGuestsToMeal}
              guestOptionsLoading={guestOptionsLoading}
              guestOptionsError={guestOptionsError}
              loadSuggestedMenu={loadSuggestedMenu}
              loadGuestDishRanks={loadGuestDishRanks}
              menuByMeal={menuByMeal}
              menuLoading={menuLoading}
              menuError={menuError}
              guestRanks={guestRanks}
              guestRanksLoading={guestRanksLoading}
              guestRanksError={guestRanksError}
              onOpenGuestModal={setModalGuest}
            />
          )}
          {modalGuest && (
            <GuestDishesModal
              guestId={modalGuest.id}
              guestName={modalGuest.name}
              mealId={modalGuest.mealId}
              onRemoveGuest={handleRemoveGuestFromMeal}
              onClose={() => setModalGuest(null)}
            />
          )}
        </section>
      </div>
    </div>
  );
}

const MealList = ({
  meals,
  mealGuests,
  availableGuests,
  onAddGuests,
  guestOptionsLoading,
  guestOptionsError,
  loadSuggestedMenu,
  loadGuestDishRanks,
  menuByMeal,
  menuLoading,
  menuError,
  guestRanks,
  guestRanksLoading,
  guestRanksError,
  onOpenGuestModal,
}: {
  meals: Meal[];
  mealGuests: Record<string, MealGuest[]>;
  availableGuests: GuestOption[];
  onAddGuests: (mealId: string, guestIds: string[]) => Promise<void>;
  guestOptionsLoading: boolean;
  guestOptionsError: string | null;
  loadSuggestedMenu: (mealId: string) => Promise<SuggestedMenuByCategory>;
  loadGuestDishRanks: (guestId: string) => Promise<GuestDishRank[]>;
  menuByMeal: Record<string, SuggestedMenuByCategory>;
  menuLoading: Record<string, boolean>;
  menuError: Record<string, string | null>;
  guestRanks: Record<string, GuestDishRank[]>;
  guestRanksLoading: Record<string, boolean>;
  guestRanksError: Record<string, string | null>;
  onOpenGuestModal: (g: { id: string; name: string; mealId: string } | null) => void;
}) => {
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
        {meals.map(meal => (
          <MealCard
            key={meal.id}
            itemKey={meal.id}
            meal={meal}
            guests={mealGuests[meal.id] ?? []}
            availableGuests={availableGuests}
            onAddGuests={onAddGuests}
            guestOptionsLoading={guestOptionsLoading}
            guestOptionsError={guestOptionsError}
            loadSuggestedMenu={loadSuggestedMenu}
            loadGuestDishRanks={loadGuestDishRanks}
            menuByMeal={menuByMeal}
            menuLoading={menuLoading}
            menuError={menuError}
            guestRanks={guestRanks}
            guestRanksLoading={guestRanksLoading}
            guestRanksError={guestRanksError}
            onOpenGuestModal={onOpenGuestModal}
          />
        ))}
      </ul>
    </ListShell>
  );
};

const MealCard = ({
  meal,
  guests,
  availableGuests,
  onAddGuests,
  guestOptionsLoading,
  guestOptionsError,
  loadSuggestedMenu,
  menuByMeal,
  menuLoading,
  menuError,
  itemKey,
  onOpenGuestModal,
}: {
  meal: Meal;
  guests: MealGuest[];
  availableGuests: GuestOption[];
  onAddGuests: (mealId: string, guestIds: string[]) => Promise<void>;
  guestOptionsLoading: boolean;
  guestOptionsError: string | null;
  loadSuggestedMenu: (mealId: string) => Promise<SuggestedMenuByCategory>;
  loadGuestDishRanks: (guestId: string) => Promise<GuestDishRank[]>;
  menuByMeal: Record<string, SuggestedMenuByCategory>;
  menuLoading: Record<string, boolean>;
  menuError: Record<string, string | null>;
  guestRanks: Record<string, GuestDishRank[]>;
  guestRanksLoading: Record<string, boolean>;
  guestRanksError: Record<string, string | null>;
  itemKey: string;
  onOpenGuestModal: (g: { id: string; name: string; mealId: string } | null) => void;
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isInviteModalOpen, setInviteModalOpen] = useState(false);
  const [selectedGuestIds, setSelectedGuestIds] = useState<string[]>([]);
  const [addGuestsError, setAddGuestsError] = useState<string | null>(null);
  const [addingGuests, setAddingGuests] = useState(false);

  const selectableGuests = useMemo(() => (
    availableGuests.filter((option) => !guests.some((existing) => existing.id === option.id))
  ), [availableGuests, guests]);

  const guestChecklistOptions = useMemo(() => (
    availableGuests.map((option) => ({
      ...option,
      alreadyInvited: guests.some((existing) => existing.id === option.id),
    }))
  ), [availableGuests, guests]);

  useEffect(() => {
    setSelectedGuestIds((prev) => prev.filter((id) => {
      const option = guestChecklistOptions.find((item) => item.id === id);
      return option && !option.alreadyInvited;
    }));
  }, [guestChecklistOptions]);

  // defensive locals in case props are temporarily undefined during HMR
  const menuItems = menuByMeal?.[meal.id] ?? createEmptyMenuByCategory();
  const isMenuLoading = menuLoading?.[meal.id] ?? false;
  const menuLoadError = menuError?.[meal.id] ?? null;
  const hasMenuItems = MENU_CATEGORIES.some((category) => menuItems[category]?.length > 0);

  const openInviteModal = () => {
    setSelectedGuestIds([]);
    setAddGuestsError(null);
    setInviteModalOpen(true);
  };

  const closeInviteModal = () => {
    if (addingGuests) {
      return;
    }
    setInviteModalOpen(false);
    setAddGuestsError(null);
    setSelectedGuestIds([]);
  };

  const toggleGuestSelection = (guestId: string) => {
    const option = guestChecklistOptions.find((item) => item.id === guestId);
    if (!option || option.alreadyInvited || addingGuests) {
      return;
    }
    setSelectedGuestIds((prev) => (
      prev.includes(guestId)
        ? prev.filter((id) => id !== guestId)
        : [...prev, guestId]
    ));
  };

  const handleConfirmGuests = async () => {
    if (selectedGuestIds.length === 0) {
      setAddGuestsError('Select at least one guest to invite.');
      return;
    }
    setAddingGuests(true);
    setAddGuestsError(null);
    try {
      await onAddGuests(meal.id, selectedGuestIds);
      setInviteModalOpen(false);
      setSelectedGuestIds([]);
    } catch (err: any) {
      setAddGuestsError(err?.message || 'Failed to add guests to the meal.');
    } finally {
      setAddingGuests(false);
    }
  };

  const selectedCount = selectedGuestIds.length;
  const confirmButtonLabel = addingGuests
    ? 'Adding...'
    : selectedCount > 0
      ? `Add ${selectedCount} ${selectedCount === 1 ? 'guest' : 'guests'}`
      : 'Add guests';

  return (
    <li key={itemKey} className="rounded-2xl border border-[#f5d8b4]/70 bg-white/80 p-5 shadow-[0_20px_45px_-30px_rgba(167,112,68,0.55)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="text-base font-semibold text-[#2b1c12]">{meal.name}</div>
          {meal.description && <div className="text-sm leading-relaxed text-[#6f5440]">{meal.description}</div>}
        </div>
        <div className="shrink-0 text-right text-xs uppercase tracking-[0.28em] text-[#a77044]">
          <div>{formatDisplayDate(meal.date)}</div>
          <div className="mt-2 flex flex-col items-end gap-1">
            <button
              type="button"
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-[0.7rem] font-semibold transition focus:outline-none focus:ring-2 focus:ring-[#d37655]/40 sm:text-xs ${showMenu ? 'bg-[#d37655] text-white shadow-[0_12px_28px_-18px_rgba(211,118,85,0.85)]' : 'border border-[#d37655]/40 bg-white/90 text-[#a15535] hover:-translate-y-0.5 hover:bg-[#fbe0d4]'}`}
              onClick={async () => {
                console.debug('[MealsPage] View suggested menu toggle', meal.id);
                const willShow = !showMenu;
                setShowMenu(willShow);
                if (willShow) {
                  try {
                    await loadSuggestedMenu(meal.id);
                  } catch (err) {
                    console.error(err);
                  }
                }
              }}
            >
              <span className="font-bold tracking-[0.25em]">MENU</span>
              <span className="tracking-normal">{showMenu ? 'Hide suggestions' : 'Show suggestions'}</span>
              <span aria-hidden>{showMenu ? '▴' : '▾'}</span>
            </button>
            <span className="text-[0.55rem] normal-case tracking-normal text-[#6f5440]">Based on guest rankings</span>
          </div>
        </div>
      </div>

      {showMenu && (
        <div className="mt-4 rounded-xl border border-[#eee] bg-white p-3 text-sm text-[#3f2a1d]">
          <div className="mb-2 flex items-center justify-between gap-3">
            <div className="font-semibold">Suggested menu</div>
            <button
              type="button"
              className="text-xs font-medium text-[#d37655] underline decoration-dotted underline-offset-2 disabled:opacity-60"
              onClick={() => {
                console.debug('[MealsPage] refresh suggested menu', meal.id);
                void loadSuggestedMenu(meal.id).catch((err) => {
                  console.error(err);
                });
              }}
              disabled={isMenuLoading}
            >
              {isMenuLoading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
          <div className="mb-3 text-xs text-[#6f5440]">Suggestions are based on dishes your guests have ranked.</div>
          {isMenuLoading ? (
            <div className="text-xs text-[#6f5440]">Loading suggested menu...</div>
          ) : menuLoadError ? (
            <div className="text-xs text-red-500">{menuLoadError}</div>
          ) : hasMenuItems ? (
            <div className="space-y-3">
              {MENU_CATEGORIES.map((category) => {
                const categoryItems = menuItems?.[category] ?? [];
                if (categoryItems.length === 0) return null;
                return (
                  <div key={`${meal.id}-${category}`}>
                    <div className="text-xs font-semibold uppercase tracking-[0.3em] text-[#a77044]">
                      {MENU_CATEGORY_LABELS[category]}
                    </div>
                    <ul className="mt-1 space-y-1">
                      {categoryItems.map((it) => (
                        <li key={it.id ?? `${category}-${it.dishId}`} className="text-sm">
                          <span className="font-medium">{it.name ?? it.dishId}</span>
                          {typeof it.avgRank === 'number' ? (
                            <span className="ml-2 text-xs text-[#6f5440]">Avg: {it.avgRank.toFixed(1)}</span>
                          ) : (
                            <span className="ml-2 text-xs text-[#6f5440]">Avg: —</span>
                          )}
                          {it.note ? <span className="ml-2 text-xs text-[#6f5440]">— {it.note}</span> : null}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-xs text-[#6f5440]">No suggested items.</div>
          )}
        </div>
      )}

      <div className="mt-5 rounded-2xl border border-[#f5d8b4]/60 bg-white/70 p-4">
        <div className="text-xs font-semibold uppercase tracking-[0.3em] text-[#a77044]">Guests</div>
        {guests.length > 0 ? (
          <ul className="mt-3 flex flex-wrap items-center gap-2 text-sm text-[#6f5440]">
            {guests.map((guest) => (
              <li key={`${meal.id}-${guest.id}`} className="inline-flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="rounded-full bg-[#fbe0d4] px-3 py-1 text-[#5b3d2a]"
                    onClick={() => {
                      console.debug('[MealsPage] guest clicked', guest.id, guest.name);
                      if (onOpenGuestModal) onOpenGuestModal({ id: guest.id, name: guest.name, mealId: meal.id });
                    }}
                  >
                    {guest.name}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-3 text-sm text-[#6f5440]">No guests added yet.</div>
        )}

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-full bg-[#d37655] px-5 py-2 text-sm font-medium text-white transition hover:-translate-y-0.5 disabled:opacity-70"
            onClick={openInviteModal}
            disabled={guestOptionsLoading}
          >
            Invite guests
          </button>
        </div>
        {guestOptionsLoading && (
          <div className="mt-2 text-xs text-[#6f5440]">Loading guest list...</div>
        )}
        {guestOptionsError && (
          <div className="mt-2 text-xs text-red-500">{guestOptionsError}</div>
        )}
        {!guestOptionsLoading && !guestOptionsError && availableGuests.length === 0 && (
          <div className="mt-2 text-xs text-[#6f5440]">
            You have no guests saved yet. Add guests from the guests page first.
          </div>
        )}
        {!guestOptionsLoading && !guestOptionsError && availableGuests.length > 0 && selectableGuests.length === 0 && (
          <div className="mt-2 text-xs text-[#6f5440]">
            All of your guests are already assigned to this meal.
          </div>
        )}
      </div>
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2b1c12]/40 px-3 py-6 sm:px-4 sm:py-8">
          <div className="w-full max-w-md rounded-2xl border border-white/60 bg-white/95 p-5 shadow-[0_35px_80px_-35px_rgba(167,112,68,0.6)] backdrop-blur sm:rounded-3xl">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-[#2b1c12]">Invite guests to {meal.name}</h3>
              <button
                type="button"
                className="text-xs font-semibold uppercase tracking-[0.3em] text-[#d37655] underline decoration-dotted underline-offset-2 disabled:opacity-60"
                onClick={closeInviteModal}
                disabled={addingGuests}
              >
                Close
              </button>
            </div>
            {guestOptionsLoading ? (
              <div className="text-sm text-[#6f5440]">Loading guest list...</div>
            ) : guestOptionsError ? (
              <div className="text-sm text-red-500">{guestOptionsError}</div>
            ) : guestChecklistOptions.length === 0 ? (
              <div className="text-sm text-[#6f5440]">You have no guests saved yet. Add guests from the guests page first.</div>
            ) : (
              <ul className="max-h-64 space-y-2 overflow-y-auto pr-1">
                {guestChecklistOptions.map((guestOption) => (
                  <li key={`${meal.id}-option-${guestOption.id}`}>
                    <label className={`flex items-center gap-3 rounded-xl border border-[#f5d8b4]/60 bg-white/80 px-3 py-2 text-sm text-[#3f2a1d] ${guestOption.alreadyInvited ? 'opacity-60' : ''}`}>
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-[#d37655] text-[#d37655] focus:ring-[#d37655]"
                        checked={selectedGuestIds.includes(guestOption.id)}
                        onChange={() => toggleGuestSelection(guestOption.id)}
                        disabled={guestOption.alreadyInvited || addingGuests}
                      />
                      <span className="flex-1 truncate">{guestOption.name}</span>
                      {guestOption.alreadyInvited ? (
                        <span className="text-[0.65rem] uppercase tracking-[0.28em] text-[#a77044]">Invited</span>
                      ) : null}
                    </label>
                  </li>
                ))}
              </ul>
            )}
            {addGuestsError && (
              <div className="mt-3 text-xs text-red-500">{addGuestsError}</div>
            )}
            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                className="rounded-full border border-[#d37655]/30 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.3em] text-[#d37655] hover:bg-[#fbe0d4] disabled:opacity-70"
                onClick={closeInviteModal}
                disabled={addingGuests}
              >
                Cancel
              </button>
              <button
                type="button"
                className="rounded-full bg-[#d37655] px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white shadow-[0_12px_28px_-18px_rgba(211,118,85,0.85)] transition disabled:opacity-60"
                onClick={handleConfirmGuests}
                disabled={addingGuests || selectedGuestIds.length === 0}
              >
                {confirmButtonLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </li>
  );
};

export default MealsPage;

function GuestDishesModal({ guestId, guestName, mealId, onRemoveGuest, onClose }: {
  guestId: string;
  guestName: string;
  mealId: string;
  onRemoveGuest: (mealId: string, guestId: string) => Promise<void>;
  onClose: () => void;
}){
  const { accessToken } = useAuth();
  const [dishes, setDishes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removing, setRemoving] = useState(false);
  const [pendingRanks, setPendingRanks] = useState<Record<string, string>>({});
  const [savingRanks, setSavingRanks] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let mounted = true;
    async function load(){
      setLoading(true);
      try{
        if (!accessToken) throw new Error('Missing access token');
        const res = await api.get(`/guests/${encodeURIComponent(guestId)}/dishes`);
        if (!mounted) return;
        setDishes(res.data || []);
        setError(null);
      }catch(e:any){
        setError(e?.response?.data?.message || 'Failed to load dishes');
      }finally{
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [accessToken, guestId]);

  async function saveRank(dishId: string, rank: number | null){
    try{
      if (!accessToken) throw new Error('Missing access token');
      setSavingRanks((prev) => ({ ...prev, [dishId]: true }));
      await api.post(`/guests/${encodeURIComponent(guestId)}/dishes/${encodeURIComponent(dishId)}`, { rank });
      toast.success('Rank saved');
      const res = await api.get(`/guests/${encodeURIComponent(guestId)}/dishes`);
      setDishes(res.data || []);
    }catch(e:any){
      toast.error(e?.response?.data?.message || 'Failed to save rank');
    }finally{
      setSavingRanks((prev) => {
        const next = { ...prev };
        delete next[dishId];
        return next;
      });
      setPendingRanks((prev) => {
        const next = { ...prev };
        delete next[dishId];
        return next;
      });
    }
  }

  const handleRemoveFromMeal = useCallback(async () => {
    if (!onRemoveGuest) return;
    setRemoving(true);
    try {
      await onRemoveGuest(mealId, guestId);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setRemoving(false);
    }
  }, [guestId, mealId, onRemoveGuest, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2b1c12]/40 px-3 py-6 sm:px-4 sm:py-8">
      <div className="w-full max-w-3xl rounded-2xl border border-white/60 bg-white/90 p-5 shadow-[0_35px_80px_-35px_rgba(167,112,68,0.6)] backdrop-blur sm:rounded-3xl sm:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-xl font-semibold text-[#2b1c12]">{guestName} dish preferences</h3>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded-full border border-[#d37655]/30 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[#d37655] hover:bg-[#fbe0d4] disabled:opacity-70"
              onClick={handleRemoveFromMeal}
              disabled={removing}
            >
              {removing ? 'Removing...' : 'Remove from meal'}
            </button>
            <button
              type="button"
              className="rounded-full border border-[#d37655]/30 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[#d37655] hover:bg-[#fbe0d4]"
              onClick={onClose}
              disabled={removing}
            >
              Close
            </button>
          </div>
        </div>
        {loading && <div className="text-sm text-[#6f5440]">Loading dishes...</div>}
        {error && <div className="text-sm text-red-500">{error}</div>}
        {!loading && !error && (
          <div
            className="max-h-[60vh] space-y-3 overflow-y-auto pr-3"
            style={{ scrollbarGutter: 'stable both-edges' }}
          >
            {dishes.map(d => (
              <div key={d.dishId} className="flex items-start justify-between gap-4 rounded-2xl border border-[#f5d8b4]/70 bg-white/80 p-4">
                <div className="min-w-0 flex-1">
                  <div className="truncate text-base font-semibold text-[#2b1c12]" title={d.name}>{d.name}</div>
                  {d.description && <div className="mt-1 overflow-hidden text-ellipsis text-sm leading-relaxed text-[#6f5440]" title={d.description}>{d.description}</div>}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.3em] text-[#a77044]">Rank</label>
                  <select
                    value={Object.prototype.hasOwnProperty.call(pendingRanks, d.dishId)
                      ? pendingRanks[d.dishId]
                      : (d.rank != null ? String(d.rank) : '')}
                    onChange={e => {
                      const value = e.target.value;
                      setPendingRanks((prev) => ({ ...prev, [d.dishId]: value }));
                      void saveRank(d.dishId, value ? Number(value) : null);
                    }}
                    disabled={savingRanks[d.dishId] === true}
                    className="rounded-full border border-[#f5d8b4] bg-white/90 px-3 py-1.5 text-sm text-[#3f2a1d] focus:outline-none focus:ring-2 focus:ring-[#d37655]/50 disabled:opacity-60"
                  >
                    <option value="">None</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                  </select>
                  {savingRanks[d.dishId] ? (
                    <span className="text-[0.65rem] uppercase tracking-[0.3em] text-[#a77044]">Saving…</span>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const ListShell = ({ children, error = false }: { children: ReactNode; error?: boolean }) => {
  return (
    <div className={`mt-8 min-h-[240px] rounded-2xl border border-white/60 bg-white/60 p-4 text-sm sm:min-h-[320px] sm:p-5 ${error ? 'text-red-500' : 'text-[#6f5440]'} backdrop-blur`}>
      {children}
    </div>
  );
};

const CreateMealButton = ({ onCreated }: { onCreated: () => Promise<void> }) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const resetForm = () => {
    setName('');
    setDescription('');
    setDate(new Date().toISOString().slice(0, 10));
    setFormError(null);
  };

  const closeModal = () => {
    resetForm();
    setOpen(false);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setFormError('Please enter a meal name.');
      return;
    }
    if (!date) {
      setFormError('Please choose a date.');
      return;
    }

    setSubmitting(true);
    setFormError(null);
    try {
      await api.post('/meals', {
        name: trimmedName,
        description: description.trim() || undefined,
        date
      });
      toast.success('Meal created');
      closeModal();
      await onCreated();
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Failed to create meal';
      setFormError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        className="inline-flex items-center justify-center rounded-full bg-[#d37655] px-5 py-2 text-sm font-medium text-white shadow-lg shadow-[#d37655]/30 transition hover:-translate-y-0.5"
        onClick={() => setOpen(true)}
      >
        New meal
      </button>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#2b1c12]/40 px-3 py-6 sm:px-4 sm:py-8"
          onClick={() => {
            if (submitting) return;
            closeModal();
          }}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-white/70 bg-white/90 p-5 shadow-[0_35px_80px_-35px_rgba(167,112,68,0.6)] backdrop-blur sm:rounded-3xl"
            onClick={(event) => event.stopPropagation()}
          >
            <form className="space-y-3" onSubmit={handleSubmit}>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-[0.3em] text-[#a77044]" htmlFor="meal-name">Meal name</label>
                  <button
                    type="button"
                    className="text-xs font-semibold uppercase tracking-[0.3em] text-[#d37655] underline decoration-dotted disabled:opacity-60"
                    onClick={() => closeModal()}
                    disabled={submitting}
                  >
                    Close
                  </button>
                </div>
                <input
                  id="meal-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="w-full rounded-xl border border-[#f5d8b4] bg-white/95 px-4 py-2 text-sm text-[#3f2a1d] focus:outline-none focus:ring-2 focus:ring-[#d37655]/50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-[0.3em] text-[#a77044]" htmlFor="meal-date">Meal date</label>
                <input
                  id="meal-date"
                  type="date"
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                  className="w-full rounded-xl border border-[#f5d8b4] bg-white/95 px-4 py-2 text-sm text-[#3f2a1d] focus:outline-none focus:ring-2 focus:ring-[#d37655]/50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-[0.3em] text-[#a77044]" htmlFor="meal-description">Description</label>
                <textarea
                  id="meal-description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-[#f5d8b4] bg-white/95 px-4 py-2 text-sm text-[#3f2a1d] focus:outline-none focus:ring-2 focus:ring-[#d37655]/50"
                />
              </div>
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-full bg-[#d37655] px-5 py-2 text-sm font-medium text-white transition hover:-translate-y-0.5 disabled:opacity-70"
                  disabled={submitting}
                >
                  {submitting ? 'Creating...' : 'Save meal'}
                </button>
                <button
                  type="button"
                  className="text-sm font-semibold text-[#a15a38] underline decoration-[#f5d8b4] underline-offset-4 transition hover:text-[#d37655] disabled:opacity-60"
                  onClick={() => closeModal()}
                  disabled={submitting}
                >
                  Cancel
                </button>
              </div>
              {formError && <p className="text-xs text-red-500">{formError}</p>}
            </form>
          </div>
        </div>
      )}
    </>
  );
};

function formatDisplayDate(date?: string) {
  if (!date) return 'Date TBD';
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) {
    return date;
  }
  return parsed.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}