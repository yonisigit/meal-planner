
import { useEffect, useState } from 'react';
import HomeButton from '../components/HomeButton';
import api from '../lib/axios';

const GuestsPage = () => {
  // Guests are loaded inside the GuestList component so the page shell
  // (HomeButton, header) can render independently of the list's loading/error state.

  return (
    <div className="relative min-h-screen">
      <HomeButton />
      <div className="max-w-xl mx-auto p-4 pt-12">
        <h2 className="text-2xl font-bold mb-4">Guests</h2>
  <GuestList />
      </div>
    </div>
  );
}

type Guest = {
  id: string;
  name: string;
  created_at?: string;
  updated_at?: string;
};

const GuestList = () => {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    api.get('/guests/')
      .then((res: any) => {
        if (!mounted) return;
        setGuests(res.data || []);
        setLoading(false);
      })
      .catch(() => {
        if (!mounted) return;
        setError('Failed to load guests');
        setLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  if (loading) return <div>Loading guests...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  if (!guests || guests.length === 0) {
    return <div>No guests found.</div>;
  }

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