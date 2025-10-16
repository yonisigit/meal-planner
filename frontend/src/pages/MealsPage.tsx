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

const MealsPage = () => {
  const { accessToken, isInitializing } = useAuth();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      setMeals(sortedMeals);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Failed to load meals.');
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
    if (!isInitializing && !accessToken) {
      setMeals([]);
    }
  }, [accessToken, isInitializing]);

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
                 <CreateMealButton onCreated={refreshMeals} />
                 <button
                   type="button"
                   className="inline-flex items-center justify-center rounded-full border border-[#d37655]/30 px-5 py-2 text-sm font-medium text-[#d37655] transition hover:bg-[#fbe0d4]"
                   disabled
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
          <li key={meal.id} className="rounded-2xl border border-[#f5d8b4]/70 bg-white/80 p-5 shadow-[0_20px_45px_-30px_rgba(167,112,68,0.55)]">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-2">
                <div className="text-base font-semibold text-[#2b1c12]">{meal.name}</div>
                {meal.description && <div className="text-sm leading-relaxed text-[#6f5440]">{meal.description}</div>}
              </div>
              <div className="shrink-0 text-right text-xs uppercase tracking-[0.28em] text-[#a77044]">
                {formatDisplayDate(meal.date)}
              </div>
            </div>
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
      resetForm();
      setOpen(false);
      await onCreated();
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Failed to create meal';
      setFormError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) {
    return (
      <button
        type="button"
        className="inline-flex items-center justify-center rounded-full bg-[#d37655] px-5 py-2 text-sm font-medium text-white shadow-lg shadow-[#d37655]/30 transition hover:-translate-y-0.5"
        onClick={() => setOpen(true)}
      >
        New meal
      </button>
    );
  }

  return (
    <div className="w-full max-w-sm rounded-2xl border border-white/70 bg-white/90 p-5 shadow-[0_20px_45px_-30px_rgba(167,112,68,0.55)]">
      <form className="space-y-3" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.3em] text-[#a77044]" htmlFor="meal-name">Meal name</label>
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
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-full bg-[#d37655] px-5 py-2 text-sm font-medium text-white transition hover:-translate-y-0.5 disabled:opacity-70"
            disabled={submitting}
          >
            {submitting ? 'Creating...' : 'Save meal'}
          </button>
          <button
            type="button"
            className="text-sm font-semibold text-[#a15a38] underline decoration-[#f5d8b4] underline-offset-4 transition hover:text-[#d37655]"
            onClick={() => {
              resetForm();
              setOpen(false);
            }}
            disabled={submitting}
          >
            Cancel
          </button>
        </div>
        {formError && <p className="text-xs text-red-500">{formError}</p>}
      </form>
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