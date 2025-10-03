
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
          <li key={guest.id} className="mb-2">
            {guest.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

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
  await api.post(`/guests/add/${encodeURIComponent(userId)}`, { name, userId });
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