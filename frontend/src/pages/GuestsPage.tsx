
import { useEffect, useState } from 'react';
import HomeButton from '../components/HomeButton';
import api from '../lib/axios';
import toast from 'react-hot-toast';

type Guest = {
  id: string;
  name: string;
  created_at?: string;
  updated_at?: string;
};

const GuestsPage = () => {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    setLoading(true);
    try {
      const userId = (() => {
        try { return localStorage.getItem('userId'); } catch { return null; }
      })();
      const url = userId ? `/guests/${encodeURIComponent(userId)}` : '/guests/';
      const res = await api.get(url);
      setGuests(res.data || []);
      setError(null);
    } catch (e) {
      setError('Failed to load guests');
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
          <h2 className="text-2xl font-bold">Guests</h2>
          <AddGuestButton onAdded={refresh} />
        </div>
        <GuestList guests={guests} loading={loading} error={error} />
      </div>
    </div>
  );
}

const GuestList = ({ guests, loading, error }: { guests: Guest[]; loading: boolean; error: string | null }) => {
  if (loading) return <div>Loading guests...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  if (!guests || guests.length === 0) return <div>No guests found.</div>;

  return (
    <div className="h-64 overflow-y-scroll border rounded bg-brown-dark/30 p-2">
      <ul className="list-disc pl-6">
        {guests.map((guest) => (
          <GuestRow key={guest.id} guest={guest} />
        ))}
      </ul>
    </div>
  );
};

function GuestRow({ guest }: { guest: Guest }){
  const [open, setOpen] = useState(false);

  return (
    <li className="mb-2 flex items-center justify-between">
      <span>{guest.name}</span>
      <div className="flex gap-2">
        <button className="btn btn-sm" onClick={() => setOpen(true)}>Show dish rankings</button>
      </div>
      {open && <GuestDishesModal guest={guest} onClose={() => setOpen(false)} />}
    </li>
  );
}

function GuestDishesModal({ guest, onClose }: { guest: Guest; onClose: () => void }){
  const [dishes, setDishes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load(){
      setLoading(true);
      try{
        const userId = (() => { try { return localStorage.getItem('userId'); } catch { return null; } })();
        if (!userId) throw new Error('Missing userId');
        const res = await api.get(`/guests/${encodeURIComponent(guest.id)}/dishes`, { params: { userId } });
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
  }, [guest.id]);

  async function saveRank(dishId: string, rank: number | null){
    try{
      const userId = (() => { try { return localStorage.getItem('userId'); } catch { return null; } })();
      if (!userId) throw new Error('Missing userId');
      await api.post(`/guests/${encodeURIComponent(guest.id)}/dishes/${encodeURIComponent(dishId)}`, { guestId: guest.id, dishId, rank });
      toast.success('Rank saved');
      const res = await api.get(`/guests/${encodeURIComponent(guest.id)}/dishes`);
      setDishes(res.data || []);
    }catch(e:any){
      toast.error(e?.response?.data?.message || 'Failed to save rank');
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-base-100 p-4 rounded w-11/12 max-w-2xl">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-bold">{guest.name} — Dish rankings</h3>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>Close</button>
        </div>
        {loading ? <div>Loading...</div> : null}
        {error ? <div className="text-red-500">{error}</div> : null}
        {!loading && !error && (
          <div className="space-y-2">
            {dishes.map(d => (
              <div key={d.dishId} className="flex items-center justify-between border p-2 rounded">
                <div>
                  <div className="font-medium">{d.name}</div>
                  <div className="text-sm text-muted">{d.description}</div>
                </div>
                <div className="flex items-center gap-2">
                  <select value={d.rank ?? ''} onChange={e => saveRank(d.dishId, e.target.value ? Number(e.target.value) : null)} className="select select-sm">
                    <option value="">No rank</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default GuestsPage;

function AddGuestButton({ onAdded }: { onAdded: () => Promise<void> }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    if (!name) return toast.error('Please enter a guest name');
    const userId = (() => {
      try { return localStorage.getItem('userId'); } catch { return null; }
    })();
    if (!userId) {
      toast.error('No userId found. Please login first.');
      return;
    }
    setSubmitting(true);
    try {
      // POST to /guests/add/{userId} with required body
  await api.post(`/guests/${encodeURIComponent(userId)}`, { name, userId });
      toast.success('Guest added');
      setName('');
      setOpen(false);
      await onAdded();
    } catch (e: any) {
      const msg = e?.response?.data?.message || 'Failed to add guest';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      {!open ? (
        <button className="btn btn-sm btn-primary" onClick={() => setOpen(true)}>Add Guest</button>
      ) : (
        <div className="card p-3 shadow">
          <label className="label"><span className="label-text">Guest name</span></label>
          <input value={name} onChange={e => setName(e.target.value)} className="input input-bordered w-64 mb-2" />
          <div className="flex gap-2">
            <button className="btn btn-primary btn-sm" onClick={() => submit()} disabled={submitting}>{submitting ? 'Adding...' : 'Submit'}</button>
            <button className="btn btn-ghost btn-sm" onClick={() => { setOpen(false); setName(''); }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}