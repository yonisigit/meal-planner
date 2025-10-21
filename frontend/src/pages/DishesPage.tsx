import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/useAuth";
import { fetchDishes } from "../features/dishes/api/dishesApi";
import { AddDishButton } from "../features/dishes/components/AddDishButton";
import { DishList } from "../features/dishes/components/DishList";
import type { Dish } from "../features/dishes/types";

const DishesPage = () => {
  const { accessToken, isInitializing } = useAuth();
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshDishes = useCallback(async () => {
    setLoading(true);
    try {
      if (!accessToken) {
        setError("Please log in to view dishes.");
        setDishes([]);
        return;
      }
      const data = await fetchDishes();
      setDishes(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to load dishes");
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (isInitializing) {
      return;
    }
    void refreshDishes();
  }, [isInitializing, refreshDishes]);

  useEffect(() => {
    if (!isInitializing && !accessToken) {
      setDishes([]);
    }
  }, [accessToken, isInitializing]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#fdf4e3] text-[#3f2a1d]">
      <div className="pointer-events-none absolute -top-32 -right-20 h-96 w-96 rounded-full bg-[#fde4c6] opacity-60 blur-3xl"></div>
      <div className="pointer-events-none absolute top-1/2 -left-24 h-96 w-96 -translate-y-1/2 rounded-full bg-[#f4978e]/70 opacity-30 blur-3xl"></div>
      <div className="relative z-10 mx-auto flex min-h-screen max-w-5xl flex-col px-4 py-16 sm:px-6 sm:py-20 lg:px-12 lg:py-24">
        <header className="mb-10 max-w-3xl">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-[#a77044] sm:text-xs sm:tracking-[0.35em]">Your pantry of favorites</p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-[#2b1c12] sm:text-4xl">Keep your best dishes ready to share.</h1>
          <p className="mt-3 text-sm text-[#6f5440] sm:text-base">Document the meals you love to cook, along with the little details that make them memorable. When it is time to host, your ideas are already waiting.</p>
        </header>

        <section className="rounded-3xl border border-white/60 bg-white/70 p-5 shadow-glow backdrop-blur sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-[#2b1c12]">Dish library</h2>
              <p className="text-sm text-[#6f5440]">Browse and fine tune your collection.</p>
            </div>
            <AddDishButton onAdded={refreshDishes} />
          </div>

          <DishList dishes={dishes} loading={loading} error={error} />
        </section>
      </div>
    </div>
  );
};

export default DishesPage;