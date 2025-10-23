import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/useAuth';
import { AddGuestButton } from '../features/guests/components/AddGuestButton';
import { GuestList } from '../features/guests/components/GuestList';
import type { Guest } from '../features/guests/types';
import { fetchGuests } from '../features/guests/api/guestsApi';

const GuestsPage = () => {
  const { accessToken, isInitializing } = useAuth();
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      if (!accessToken) {
        setError('Please log in to view guests.');
        setGuests([]);
        return;
      }
      const data = await fetchGuests();
      setGuests(data);
      setError(null);
    } catch (error: unknown) {
      console.error(error);
      setError('Failed to load guests');
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (isInitializing) {
      return;
    }
    void refresh();
  }, [isInitializing, refresh]);

  useEffect(() => {
    if (!isInitializing && !accessToken) {
      setGuests([]);
    }
  }, [accessToken, isInitializing]);

  const totalGuests = guests.length;
  const highlightText = useMemo(() => {
    if (totalGuests === 0) return 'Your guest list is waiting to be written.';
    if (totalGuests === 1) return 'You have one guest who loves your cooking.';
    if (totalGuests < 6) return `Planning for ${totalGuests} special guest${totalGuests === 1 ? '' : 's'}.`;
    return `Hosting repertoire ready for ${totalGuests}+ guests.`;
  }, [totalGuests]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#fdf4e3] text-[#3f2a1d]">
      <div className="pointer-events-none absolute -top-36 left-[-80px] h-96 w-96 rounded-full bg-[#fde4c6] opacity-60 blur-3xl"></div>
      <div className="pointer-events-none absolute top-2/3 right-[-120px] h-96 w-96 -translate-y-1/2 rounded-full bg-[#d88c9a]/70 opacity-35 blur-3xl"></div>
      <div className="relative z-10 mx-auto flex min-h-screen max-w-5xl flex-col px-4 py-16 sm:px-6 sm:py-20 lg:px-12 lg:py-24">
        <header className="mb-10 max-w-3xl">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-[#a77044] sm:text-xs sm:tracking-[0.35em]">Guest profiles</p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-[#2b1c12] sm:text-4xl">Know what every guest loves before they arrive.</h1>
          <p className="mt-3 text-sm text-[#6f5440] sm:text-base">Capture who you are inviting and record the dishes that spark conversation. Turn casual dinners into thoughtful gatherings.</p>
        </header>

        <section className="rounded-3xl border border-white/60 bg-white/70 p-5 shadow-glow backdrop-blur sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-[#2b1c12]">Guest roster</h2>
              <p className="text-sm text-[#6f5440]">{highlightText}</p>
            </div>
            <AddGuestButton onAdded={refresh} />
          </div>

          <GuestList guests={guests} loading={loading} error={error} />
        </section>
      </div>
    </div>
  );
};

export default GuestsPage;