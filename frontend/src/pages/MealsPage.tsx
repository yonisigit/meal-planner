import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import api from '../lib/axios';
import type { AxiosResponse } from 'axios';

type Meal = {
  id: string;
  name: string;
  description?: string;
};

const MealsPage = () => {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get('/meals')
      .then((res: AxiosResponse) => {
        setMeals(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError('Error fetching meals');
        setLoading(false);
      });
  }, []);

  const headline = useMemo(() => {
    if (meals.length === 0) return 'Start by crafting a menu for your next gathering.';
    if (meals.length <= 3) return 'A handful of thoughtful menus ready to impress.';
    return `${meals.length} curated meals ready for your guests.`;
  }, [meals.length]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#fdf4e3] text-[#3f2a1d]">
      <div className="pointer-events-none absolute -top-32 right-[-120px] h-96 w-96 rounded-full bg-[#f9c784] opacity-35 blur-3xl"></div>
      <div className="pointer-events-none absolute bottom-[-180px] left-[-100px] h-96 w-96 rounded-full bg-[#d88c9a] opacity-30 blur-3xl"></div>
      <div className="relative z-10 mx-auto flex min-h-screen max-w-5xl flex-col px-6 py-24 lg:px-12">
        <header className="mb-12 max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[#a77044]">Meal plans</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-[#2b1c12]">Design gatherings that feel effortless.</h1>
          <p className="mt-3 text-sm text-[#6f5440]">Pair the perfect guests with the dishes they adore. Each meal plan can hold multiple courses, notes for prep, and reminders for timing.</p>
        </header>

        <section className="mb-10 flex flex-wrap gap-3">
          <StatCard label="Meal plans" value={meals.length} helper="ready to host" />
          <StatCard label="Mood" value={headline} wide />
          <StatCard label="Action" value="Invite guests, suggest dishes" helper="coming soon" />
        </section>

        <section className="grid gap-8 lg:grid-cols-[1.1fr,0.9fr]">
          <div className="rounded-3xl border border-white/60 bg-white/70 p-8 shadow-glow backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-[#2b1c12]">Upcoming meals</h2>
                <p className="text-sm text-[#6f5440]">Keep track of who is coming and what they will be served.</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-full bg-[#d37655] px-5 py-2 text-sm font-medium text-white shadow-lg shadow-[#d37655]/30 transition hover:-translate-y-0.5"
                >
                  Create a meal
                </button>
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-full border border-[#d37655]/30 px-5 py-2 text-sm font-medium text-[#d37655] transition hover:bg-[#fbe0d4]"
                >
                  Export grocery list
                </button>
              </div>
            </div>

            {loading && <ListShell>Loading meals...</ListShell>}
            {error && <ListShell error>{error}</ListShell>}
            {!loading && !error && <MealList meals={meals} />}
          </div>

          <div className="flex flex-col gap-6">
            <div className="rounded-3xl border border-white/60 bg-white/55 p-8 backdrop-blur">
              <h3 className="text-lg font-semibold text-[#2b1c12]">What is coming next</h3>
              <p className="mt-3 text-sm leading-relaxed text-[#6f5440]">
                Soon you will be able to auto-suggest menus based on which guests RSVP, and generate shopping lists that align with your plan.
              </p>
              <div className="mt-6 space-y-3 text-sm text-[#6f5440]">
                <div className="rounded-2xl bg-white/80 p-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.35em] text-[#a77044]">Idea spotlight</div>
                  <p className="mt-2">Try creating themed menus like "Sunday Comfort" or "Citrus Brunch" to keep planning fresh.</p>
                </div>
                <div className="rounded-2xl bg-[#fbe0d4] p-4 text-[#5b3d2a]">
                  Turn on reminders to prep desserts or chill beverages hours before guests arrive.
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-white/60 bg-white/55 p-6 backdrop-blur">
              <h4 className="text-sm font-semibold uppercase tracking-[0.3em] text-[#a77044]">Recently planned</h4>
              {meals.length > 0 ? (
                <ul className="mt-4 space-y-3 text-sm text-[#6f5440]">
                  {meals.slice(0, 3).map((meal) => (
                    <li key={`recent-meal-${meal.id}`} className="rounded-2xl border border-[#f5d8b4]/60 bg-white/80 px-4 py-3">
                      <div className="text-base font-semibold text-[#2b1c12]">{meal.name}</div>
                      {meal.description && <div className="mt-1 text-xs uppercase tracking-widest text-[#a77044]/90">{meal.description}</div>}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="mt-4 rounded-2xl border border-dashed border-[#f5d8b4] px-4 py-3 text-xs text-[#6f5440]">Plan your first menu to see it highlighted here.</div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

const MealList = ({ meals }: { meals: Meal[] }) => {
  if (!meals || meals.length === 0) {
    return (
      <ListShell>
        <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
          <span className="text-sm text-[#6f5440]">No meals planned yet.</span>
          <span className="text-sm text-[#6f5440]">Create your first gathering to see suggestions tailored to your guests.</span>
        </div>
      </ListShell>
    );
  }
  return (
    <ListShell>
      <ul className="space-y-3">
        {meals.map(meal => (
          <li key={meal.id} className="rounded-2xl border border-[#f5d8b4]/70 bg-white/80 p-4 shadow-[0_15px_35px_-25px_rgba(167,112,68,0.45)]">
            <div className="text-base font-semibold text-[#2b1c12]">{meal.name}</div>
            {meal.description && <div className="mt-1 text-sm text-[#6f5440]">{meal.description}</div>}
          </li>
        ))}
      </ul>
    </ListShell>
  );
};

export default MealsPage;

const ListShell = ({ children, error = false }: { children: ReactNode; error?: boolean }) => {
  return (
    <div className={`mt-8 min-h-[320px] rounded-2xl border border-white/60 bg-white/60 p-5 text-sm ${error ? 'text-red-500' : 'text-[#6f5440]'} backdrop-blur`}>
      {children}
    </div>
  );
};

const StatCard = ({ label, value, helper, wide = false }: { label: string; value: number | string; helper?: string; wide?: boolean }) => (
  <div className={`flex ${wide ? 'flex-1 min-w-[260px]' : 'min-w-[180px]'} flex-col gap-1 rounded-2xl border border-[#f5d8b4]/70 bg-white/70 px-4 py-3 text-sm text-[#6f5440] shadow-[0_20px_45px_-30px_rgba(167,112,68,0.55)]`}>
    <span className="text-xs font-semibold uppercase tracking-[0.3em] text-[#a77044]">{label}</span>
    <span className={`text-base font-semibold text-[#2b1c12] ${typeof value === 'string' && value.length > 18 ? 'leading-normal' : ''}`}>{value}</span>
    {helper && <span className="text-xs text-[#6f5440]">{helper}</span>}
  </div>
);