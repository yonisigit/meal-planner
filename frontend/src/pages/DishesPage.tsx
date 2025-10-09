
import { useEffect, useState } from 'react';
import HomeButton from '../components/HomeButton';
import api from '../lib/axios';
import toast from 'react-hot-toast';

type Dish = {
  id: string;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
};

const DishesPage = () => {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    setLoading(true);
    try {
      const userId = (() => {
        try { return localStorage.getItem('userId'); } catch { return null; }
      })();
      const url = userId ? `/dishes/${encodeURIComponent(userId)}` : '/dishes/';
      const res = await api.get(url);
      setDishes(res.data || []);
      setError(null);
    } catch (e) {
      setError('Failed to load dishes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative min-h-screen">
      <HomeButton />
      <div className="max-w-xl mx-auto p-4 pt-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Dishes</h2>
          <AddDishButton onAdded={refresh} />
        </div>
        <DishList dishes={dishes} loading={loading} error={error} />
      </div>
    </div>
  );
}

const DishList = ({ dishes, loading, error }: { dishes: Dish[]; loading: boolean; error: string | null }) => {
  if (loading) return <div>Loading dishes...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  if (!dishes || dishes.length === 0) return <div>No dishes found.</div>;

  return (
    <div className="h-64 overflow-y-scroll border rounded bg-brown-dark/30 p-2">
      <ul className="list-disc pl-6">
        {dishes.map((dish) => (
          <li key={dish.id} className="mb-2">
            <div className="font-semibold">{dish.name}</div>
            {dish.description && <div className="text-sm text-base-content/70">{dish.description}</div>}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DishesPage;

function AddDishButton({ onAdded }: { onAdded: () => Promise<void> }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    if (!name) return toast.error('Please enter a dish name');
    const userId = (() => {
      try { return localStorage.getItem('userId'); } catch { return null; }
    })();
    if (!userId) {
      toast.error('No userId found. Please login first.');
      return;
    }
    setSubmitting(true);
    try {
      await api.post(`/dishes/${encodeURIComponent(userId)}`, { name, description, userId });
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
    <div>
      {!open ? (
        <button className="btn btn-sm btn-primary" onClick={() => setOpen(true)}>Add Dish</button>
      ) : (
        <div className="card p-3 shadow">
          <label className="label"><span className="label-text">Dish name</span></label>
          <input value={name} onChange={e => setName(e.target.value)} className="input input-bordered w-64 mb-2" />
          <label className="label"><span className="label-text">Description</span></label>
          <input value={description} onChange={e => setDescription(e.target.value)} className="input input-bordered w-64 mb-2" />
          <div className="flex gap-2">
            <button className="btn btn-primary btn-sm" onClick={() => submit()} disabled={submitting}>{submitting ? 'Adding...' : 'Submit'}</button>
            <button className="btn btn-ghost btn-sm" onClick={() => { setOpen(false); setName(''); setDescription(''); }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}