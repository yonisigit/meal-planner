
import type { ReactNode } from 'react';
import { useCallback, useEffect, useState } from 'react';
import api from '../lib/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

type Dish = {
  id: string;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
};

const DishesPage = () => {
  const { accessToken } = useAuth();
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      if (!accessToken) {
        setError('Please log in to view dishes.');
        setDishes([]);
        return;
      }
      const res = await api.get('/dishes');
      setDishes(res.data || []);
      setError(null);
    } catch (e) {
      setError('Failed to load dishes');
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#fdf4e3] text-[#3f2a1d]">
      <div className="pointer-events-none absolute -top-32 -right-20 h-96 w-96 rounded-full bg-[#fde4c6] opacity-60 blur-3xl"></div>
      <div className="pointer-events-none absolute top-1/2 -left-24 h-96 w-96 -translate-y-1/2 rounded-full bg-[#f4978e]/70 opacity-30 blur-3xl"></div>
      <div className="relative z-10 mx-auto flex min-h-screen max-w-5xl flex-col px-6 py-24 lg:px-12">
        <header className="mb-10 max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[#a77044]">Your pantry of favorites</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-[#2b1c12]">Keep your best dishes ready to share.</h1>
          <p className="mt-3 text-sm text-[#6f5440]">Document the meals you love to cook, along with the little details that make them memorable. When it is time to host, your ideas are already waiting.</p>
        </header>

        <section className="rounded-3xl border border-white/60 bg-white/70 p-8 shadow-glow backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-[#2b1c12]">Dish library</h2>
              <p className="text-sm text-[#6f5440]">Browse and fine tune your collection.</p>
            </div>
            <AddDishButton onAdded={refresh} />
          </div>

          <DishList dishes={dishes} loading={loading} error={error} />
        </section>
      </div>
    </div>
  );
}

const DishList = ({ dishes, loading, error }: { dishes: Dish[]; loading: boolean; error: string | null }) => {
  if (loading) return <ListShell><div className="text-sm text-[#6f5440]">Loading dishes...</div></ListShell>;
  if (error) return <ListShell><div className="text-sm text-red-500">{error}</div></ListShell>;

  if (!dishes || dishes.length === 0) {
    return (
      <ListShell>
        <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-sm text-[#6f5440]">
          <span>No dishes yet.</span>
          <span>Add your first signature recipe to get started.</span>
        </div>
      </ListShell>
    );
  }

  return (
    <ListShell>
      <ul className="space-y-3">
        {dishes.map((dish) => (
          <li key={dish.id} className="rounded-2xl border border-[#f5d8b4]/70 bg-white/80 p-5 shadow-[0_20px_45px_-30px_rgba(167,112,68,0.55)] transition duration-150 hover:-translate-y-0.5">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="text-base font-semibold text-[#2b1c12]">{dish.name}</div>
                {dish.description && <div className="text-sm leading-relaxed text-[#6f5440]">{dish.description}</div>}
              </div>
              <div className="flex flex-col items-end gap-2 text-xs uppercase tracking-widest text-[#a77044]/90">
                {dish.created_at && <span>Added {new Date(dish.created_at).toLocaleDateString()}</span>}
                {dish.updated_at && <span>Updated {new Date(dish.updated_at).toLocaleDateString()}</span>}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </ListShell>
  );
};

export default DishesPage;

function AddDishButton({ onAdded }: { onAdded: () => Promise<void> }) {
  const { accessToken } = useAuth();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    if (!name) return toast.error('Please enter a dish name');
    if (!accessToken) {
      toast.error('Missing access token. Please login again.');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/dishes', { name, description });
      toast.success('Dish added');
      setName('');
      setDescription('');
      setOpen(false);
      await onAdded();
    } catch (e: any) {
      const msg = e?.response?.data?.message || 'Failed to add dish';
      toast.error(msg);
    } finally {
      setSubmitting(false); 
    }
  }

  return (
    <div className="w-full max-w-xs">
      {!open ? (
        <button
          type="button"
          className="inline-flex w-full items-center justify-center rounded-full bg-[#d37655] px-5 py-2 text-sm font-medium text-white shadow-lg shadow-[#d37655]/30 transition hover:-translate-y-0.5"
          onClick={() => setOpen(true)}
        >
          Add dish
        </button>
      ) : (
        <div className="w-full rounded-2xl border border-white/70 bg-white/80 p-5 shadow-[0_20px_45px_-25px_rgba(167,112,68,0.5)]">
          <div className="space-y-3">
            <label className="text-xs font-semibold uppercase tracking-[0.3em] text-[#a77044]">Dish name</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full rounded-xl border border-[#f5d8b4] bg-white/90 px-4 py-2 text-sm text-[#3f2a1d] focus:outline-none focus:ring-2 focus:ring-[#d37655]/50"
            />
            <label className="text-xs font-semibold uppercase tracking-[0.3em] text-[#a77044]">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-[#f5d8b4] bg-white/90 px-4 py-2 text-sm text-[#3f2a1d] focus:outline-none focus:ring-2 focus:ring-[#d37655]/50"
            />
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-full bg-[#d37655] px-5 py-2 text-sm font-medium text-white transition hover:-translate-y-0.5"
                onClick={() => submit()}
                disabled={submitting}
              >
                {submitting ? 'Adding...' : 'Save dish'}
              </button>
              <button
                type="button"
                className="text-sm font-medium text-[#a15a38] underline decoration-[#f5d8b4] underline-offset-4 transition hover:text-[#d37655]"
                onClick={() => { setOpen(false); setName(''); setDescription(''); }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const ListShell = ({ children }: { children: ReactNode }) => {
  return (
    <div className="mt-8 min-h-[280px] rounded-2xl border border-white/60 bg-white/60 p-4 backdrop-blur">
      {children}
    </div>
  );
};