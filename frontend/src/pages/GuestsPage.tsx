
import { useEffect, useState } from 'react';
import api from '../lib/axios';
import type { AxiosResponse } from 'axios';
import HomeButton from '../components/HomeButton';

const GuestsPage = () => {
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get('/guests/')
      .then((res: AxiosResponse) => {
        setGuests(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load guests');
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading guests...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="relative min-h-screen">
      <HomeButton />
      <div className="max-w-xl mx-auto p-4 pt-12">
        <h2 className="text-2xl font-bold mb-4">Guests</h2>
        <GuestList guests={guests} />
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

const GuestList = ({ guests }: { guests: Guest[] }) => {
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