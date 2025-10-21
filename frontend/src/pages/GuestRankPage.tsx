import { type ReactNode, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../lib/axios';

type ApiDish = {
  dishId: string;
  name: string;
  description?: string | null;
  rank: number | null;
  dishRankId?: string | null;
};

type RankedDish = {
  dishId: string;
  name: string;
  description?: string | null;
  rank: number | null;
};

type GuestResponse = {
  guest: {
    id: string;
    name: string;
  };
  hostName?: string | null;
  dishes: ApiDish[];
};

const GuestRankPage = () => {
  const { rankToken } = useParams<{ rankToken: string }>();
  const [guest, setGuest] = useState<GuestResponse['guest'] | null>(null);
  const [hostName, setHostName] = useState<string>('');
  const [dishes, setDishes] = useState<RankedDish[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!rankToken) {
        setError('Missing ranking link.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const res = await api.get<GuestResponse>(`/guests/token/${encodeURIComponent(rankToken)}`);
        if (!mounted) return;

        setGuest(res.data.guest);
        setHostName(res.data.hostName?.trim?.() || 'Your host');
        setDishes((res.data.dishes || []).map((dish) => ({
          dishId: dish.dishId,
          name: dish.name,
          description: dish.description ?? undefined,
          rank: typeof dish.rank === 'number' ? dish.rank : null,
        })));
        setIsDone(false);
      } catch (err: unknown) {
        let message = 'We could not load the dishes for this link.';
        if (err && typeof err === 'object' && 'response' in err) {
          const response = (err as { response?: { data?: { message?: string } } }).response;
          message = response?.data?.message ?? message;
        } else if (err instanceof Error && err.message) {
          message = err.message;
        }
        setError(message);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [rankToken]);

  const invitationText = useMemo(() => {
    if (!hostName) return 'You have been invited to share your favorites!';
    return `${hostName} has invited you to rank their dishes!`;
  }, [hostName]);

  async function handleRankChange(dishId: string, nextRankValue: string) {
    if (!rankToken) return;

    const parsedRank = nextRankValue ? Number(nextRankValue) : null;
    if (parsedRank == null || Number.isNaN(parsedRank)) {
      toast.error('Please choose a rank between 1 and 3.');
      return;
    }

    setSaving((prev) => ({ ...prev, [dishId]: true }));
    try {
      await api.post(`/guests/token/${encodeURIComponent(rankToken)}/dishes/${encodeURIComponent(dishId)}`, {
        rank: parsedRank,
      });

      setDishes((prev) =>
        prev.map((dish) =>
          dish.dishId === dishId
            ? {
                ...dish,
                rank: parsedRank,
              }
            : dish,
        ),
      );
      toast.success('Rank saved');
    } catch (err: unknown) {
      let message = 'We could not save that rank.';
      if (err && typeof err === 'object' && 'response' in err) {
        const response = (err as { response?: { data?: { message?: string } } }).response;
        message = response?.data?.message ?? message;
      } else if (err instanceof Error && err.message) {
        message = err.message;
      }
      toast.error(message);
    } finally {
      setSaving((prev) => {
        const next = { ...prev };
        delete next[dishId];
        return next;
      });
    }
  }

  if (loading) {
    return (
      <BareShell>
        <div className="rounded-3xl border border-white/60 bg-white/80 px-6 py-10 text-center text-[#6f5440] shadow-glow">
          Loading dishes...
        </div>
      </BareShell>
    );
  }

  if (error || !guest) {
    return (
      <BareShell>
        <div className="space-y-4 rounded-3xl border border-white/60 bg-white/80 px-6 py-10 text-center shadow-glow">
          <p className="text-lg font-semibold text-[#2b1c12]">Oops!</p>
          <p className="text-sm leading-relaxed text-[#6f5440]">{error ?? 'We could not find any dishes to rank for this link.'}</p>
          <button
            type="button"
            className="rounded-full bg-[#d37655] px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-[#d37655]/30 transition hover:-translate-y-0.5"
            onClick={() => window.location.reload()}
          >
            Try again
          </button>
        </div>
      </BareShell>
    );
  }

  if (isDone) {
    return (
      <BareShell>
        <div className="space-y-4 rounded-3xl border border-white/60 bg-white/85 px-6 py-12 text-center shadow-glow">
          <h1 className="text-3xl font-semibold text-[#2b1c12]">Thank you!</h1>
          <p className="text-sm leading-relaxed text-[#6f5440]">
            Your preferences are saved. You can return to the ranking page anytime using this link.
          </p>
          <button
            type="button"
            className="rounded-full bg-[#d37655] px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-[#d37655]/30 transition hover:-translate-y-0.5"
            onClick={() => setIsDone(false)}
          >
            Back to rankings
          </button>
        </div>
      </BareShell>
    );
  }

  const hasNoDishes = dishes.length === 0;

  return (
    <BareShell>
      <div className="w-full max-w-3xl rounded-3xl border border-white/60 bg-white/85 p-6 shadow-[0_35px_80px_-35px_rgba(167,112,68,0.6)] backdrop-blur">
        <header className="mb-6 space-y-2 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#a77044]">Guest ranking</p>
          <h1 className="text-3xl font-semibold text-[#2b1c12] sm:text-4xl">{invitationText}</h1>
          <p className="text-sm leading-relaxed text-[#6f5440]">
            Help {hostName || 'your host'} plan a menu you will love. Rank each dish from 3 (top choice) to 1 (not your favorite).
          </p>
        </header>

        {hasNoDishes ? (
          <div className="rounded-2xl border border-dashed border-[#f5d8b4] bg-white/70 px-6 py-10 text-center text-sm text-[#6f5440]">
            There are no dishes to rank yet. Check back soon!
          </div>
        ) : (
          <div className="space-y-3">
            {dishes.map((dish) => (
              <div
                key={dish.dishId}
                className="flex flex-col gap-3 rounded-2xl border border-[#f5d8b4]/70 bg-white/90 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate text-base font-semibold text-[#2b1c12]" title={dish.name}>
                    {dish.name}
                  </div>
                  {dish.description ? (
                    <div className="mt-1 text-sm leading-relaxed text-[#6f5440]" title={dish.description}>
                      {dish.description}
                    </div>
                  ) : null}
                </div>
                <div className="flex items-center gap-3">
                  <label className="text-xs font-semibold uppercase tracking-[0.3em] text-[#a77044]">Rank</label>
                  <select
                    value={dish.rank ? String(dish.rank) : ''}
                    onChange={(event) => handleRankChange(dish.dishId, event.target.value)}
                    disabled={saving[dish.dishId] === true}
                    className="rounded-full border border-[#f5d8b4] bg-white/90 px-3 py-1.5 text-sm text-[#3f2a1d] focus:outline-none focus:ring-2 focus:ring-[#d37655]/40 disabled:opacity-60"
                  >
                    <option value="" disabled>
                      Select
                    </option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                  </select>
                  {saving[dish.dishId] ? (
                    <span className="text-[0.65rem] uppercase tracking-[0.3em] text-[#a77044]">Saving…</span>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 flex justify-center">
          <button
            type="button"
            className="rounded-full bg-[#d37655] px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-[#d37655]/30 transition hover:-translate-y-0.5 disabled:opacity-60"
            onClick={() => setIsDone(true)}
            disabled={hasNoDishes}
          >
            Done
          </button>
        </div>
      </div>
    </BareShell>
  );
};

export default GuestRankPage;

const BareShell = ({ children }: { children: ReactNode }) => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#fdf4e3] text-[#3f2a1d]">
      <div className="pointer-events-none absolute -top-36 left-[-80px] h-96 w-96 rounded-full bg-[#fde4c6] opacity-60 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-160px] right-[-120px] h-96 w-96 rounded-full bg-[#d88c9a]/70 opacity-35 blur-3xl" />
      <div className="relative z-10 mx-auto flex min-h-screen max-w-5xl items-center justify-center px-4 py-16 sm:px-6 lg:px-12">
        {children}
      </div>
    </div>
  );
};
