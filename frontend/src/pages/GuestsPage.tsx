import type { FormEvent, ReactNode } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import api from '../lib/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

type Guest = {
  id: string;
  name: string;
  created_at?: string;
  updated_at?: string;
};

const GuestsPage = () => {
  const { accessToken } = useAuth();
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
      const res = await api.get('/guests');
      setGuests(res.data || []);
      setError(null);
    } catch (e) {
      setError('Failed to load guests');
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    refresh();
  }, [refresh]);

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
}

const GuestList = ({ guests, loading, error }: { guests: Guest[]; loading: boolean; error: string | null }) => {
  if (loading) return <ListShell>Loading guests...</ListShell>;
  if (error) return <ListShell error>{error}</ListShell>;

  if (!guests || guests.length === 0) return <ListShell>No guests yet. Start by adding the people you host most often.</ListShell>;

  return (
    <ListShell>
      <ul className="divide-y divide-[#f5d8b4]/70">
        {guests.map((guest) => (
          <GuestRow key={guest.id} guest={guest} />
        ))}
      </ul>
    </ListShell>
  );
};

function GuestRow({ guest }: { guest: Guest }){
  const [open, setOpen] = useState(false);

  return (
    <li className="flex items-center justify-between gap-4 px-1 py-3 transition duration-150 hover:bg-white/40">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#d37655]/80 text-sm font-semibold text-white">
          {guest.name.charAt(0).toUpperCase()}
        </span>
        <span className="text-base font-medium text-[#2b1c12]">{guest.name}</span>
      </div>
      <button
        type="button"
        className="rounded-full border border-[#d37655]/30 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[#d37655] transition hover:bg-[#fbe0d4]"
        onClick={() => setOpen(true)}
      >
        View rankings
      </button>
      {open && <GuestDishesModal guest={guest} onClose={() => setOpen(false)} />}
    </li>
  );
}

function GuestDishesModal({ guest, onClose }: { guest: Guest; onClose: () => void }){
  const { accessToken } = useAuth();
  const [dishes, setDishes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingRanks, setPendingRanks] = useState<Record<string, string>>({});
  const [savingRanks, setSavingRanks] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let mounted = true;
    async function load(){
      setLoading(true);
      try{
        if (!accessToken) throw new Error('Missing access token');
        const res = await api.get(`/guests/${encodeURIComponent(guest.id)}/dishes`);
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
  }, [accessToken, guest.id]);

  async function saveRank(dishId: string, rank: number | null){
    try{
      if (!accessToken) throw new Error('Missing access token');
      setSavingRanks((prev) => ({ ...prev, [dishId]: true }));
      await api.post(`/guests/${encodeURIComponent(guest.id)}/dishes/${encodeURIComponent(dishId)}`, { rank });
      toast.success('Rank saved');
      const res = await api.get(`/guests/${encodeURIComponent(guest.id)}/dishes`);
      setDishes(res.data || []);
    }catch(e:any){
      toast.error(e?.response?.data?.message || 'Failed to save rank');
    }finally{
      setSavingRanks((prev) => {
        const next = { ...prev };
        delete next[dishId];
        return next;
      });
      setPendingRanks((prev) => {
        const next = { ...prev };
        delete next[dishId];
        return next;
      });
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2b1c12]/40 px-3 py-6 sm:px-4 sm:py-8">
      <div className="w-full max-w-3xl rounded-2xl border border-white/60 bg-white/90 p-5 shadow-[0_35px_80px_-35px_rgba(167,112,68,0.6)] backdrop-blur sm:rounded-3xl sm:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-xl font-semibold text-[#2b1c12]">{guest.name} dish preferences</h3>
          <button
            type="button"
            className="rounded-full border border-[#d37655]/30 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[#d37655] hover:bg-[#fbe0d4]"
            onClick={onClose}
          >
            Close
          </button>
        </div>
        {loading && <div className="text-sm text-[#6f5440]">Loading dishes...</div>}
        {error && <div className="text-sm text-red-500">{error}</div>}
        {!loading && !error && (
          <div
            className="max-h-[60vh] space-y-3 overflow-y-auto pr-3"
            style={{ scrollbarGutter: 'stable both-edges' }}
          >
            {dishes.map(d => (
              <div key={d.dishId} className="flex items-start justify-between gap-4 rounded-2xl border border-[#f5d8b4]/70 bg-white/80 p-4">
                <div className="min-w-0 flex-1">
                  <div className="truncate text-base font-semibold text-[#2b1c12]" title={d.name}>{d.name}</div>
                  {d.description && <div className="mt-1 overflow-hidden text-ellipsis text-sm leading-relaxed text-[#6f5440]" title={d.description}>{d.description}</div>}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.3em] text-[#a77044]">Rank</label>
                  <select
                    value={Object.prototype.hasOwnProperty.call(pendingRanks, d.dishId)
                      ? pendingRanks[d.dishId]
                      : (d.rank != null ? String(d.rank) : '')}
                    onChange={e => {
                      const value = e.target.value;
                      setPendingRanks((prev) => ({ ...prev, [d.dishId]: value }));
                      void saveRank(d.dishId, value ? Number(value) : null);
                    }}
                    disabled={savingRanks[d.dishId] === true}
                    className="rounded-full border border-[#f5d8b4] bg-white/90 px-3 py-1.5 text-sm text-[#3f2a1d] focus:outline-none focus:ring-2 focus:ring-[#d37655]/50 disabled:opacity-60"
                  >
                    <option value="">None</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                  </select>
                  {savingRanks[d.dishId] ? (
                    <span className="text-[0.65rem] uppercase tracking-[0.3em] text-[#a77044]">Saving…</span>
                  ) : null}
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
  const { accessToken } = useAuth();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const resetForm = () => {
    setName('');
  };

  const closeModal = () => {
    resetForm();
    setOpen(false);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim()) {
      toast.error('Please enter a guest name');
      return;
    }
    if (!accessToken) {
      toast.error('Missing access token. Please login again.');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/guests', { name: name.trim() });
      toast.success('Guest added');
      closeModal();
      await onAdded();
    } catch (e: any) {
      const msg = e?.response?.data?.message || 'Failed to add guest';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="w-full max-w-xs">
        <button
          type="button"
          className="inline-flex w-full items-center justify-center rounded-full bg-[#d37655] px-5 py-2 text-sm font-medium text-white shadow-lg shadow-[#d37655]/30 transition hover:-translate-y-0.5"
          onClick={() => setOpen(true)}
        >
          Add guest
        </button>
      </div>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#2b1c12]/40 px-3 py-6 sm:px-4 sm:py-8"
          onClick={() => {
            if (submitting) return;
            closeModal();
          }}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-white/70 bg-white/90 p-5 shadow-[0_35px_80px_-35px_rgba(167,112,68,0.6)] backdrop-blur sm:rounded-3xl"
            onClick={(event) => event.stopPropagation()}
          >
            <form className="space-y-3" onSubmit={handleSubmit}>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-[#a77044]">Add guest</h3>
                <button
                  type="button"
                  className="text-xs font-semibold uppercase tracking-[0.3em] text-[#d37655] underline decoration-dotted disabled:opacity-60"
                  onClick={() => closeModal()}
                  disabled={submitting}
                >
                  Close
                </button>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-[0.3em] text-[#a77044]" htmlFor="guest-name">Guest name</label>
                <input
                  id="guest-name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full rounded-xl border border-[#f5d8b4] bg-white/90 px-4 py-2 text-sm text-[#3f2a1d] focus:outline-none focus:ring-2 focus:ring-[#d37655]/50"
                />
              </div>
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-full bg-[#d37655] px-5 py-2 text-sm font-medium text-white transition hover:-translate-y-0.5 disabled:opacity-70"
                  disabled={submitting}
                >
                  {submitting ? 'Adding...' : 'Save guest'}
                </button>
                <button
                  type="button"
                  className="text-sm font-medium text-[#a15a38] underline decoration-[#f5d8b4] underline-offset-4 transition hover:text-[#d37655] disabled:opacity-60"
                  onClick={() => closeModal()}
                  disabled={submitting}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

const ListShell = ({ children, error = false }: { children: ReactNode; error?: boolean }) => {
  return (
    <div
      className={`mt-8 min-h-[240px] rounded-3xl border border-white/60 bg-white/60 px-1 py-2 text-sm sm:min-h-[320px] ${error ? 'text-red-500' : 'text-[#6f5440]'} backdrop-blur`}
      style={{ scrollbarGutter: 'stable both-edges' }}
    >
      {children}
    </div>
  );
};