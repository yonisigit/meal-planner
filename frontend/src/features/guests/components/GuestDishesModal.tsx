import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../../../context/useAuth";
import { fetchGuestDishes, saveGuestDishRank } from "../api/guestsApi";
import type { Guest } from "../types";
import type { GuestDishRank } from "../../meals/types";

type GuestDishesModalProps = {
  guest: Guest;
  onClose: () => void;
};

type PendingMap = Record<string, string>;
type SavingMap = Record<string, boolean>;

export function GuestDishesModal({ guest, onClose }: GuestDishesModalProps) {
  const { accessToken } = useAuth();
  const [dishes, setDishes] = useState<GuestDishRank[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingRanks, setPendingRanks] = useState<PendingMap>({});
  const [savingRanks, setSavingRanks] = useState<SavingMap>({});

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        if (!accessToken) throw new Error("Missing access token");
        const data = await fetchGuestDishes(guest.id);
        if (!mounted) return;
        setDishes(data);
        setError(null);
      } catch (error: unknown) {
        if (!mounted) return;
        let message = "Failed to load dishes";
        if (error && typeof error === "object" && "response" in error) {
          const response = (error as { response?: { data?: { message?: string } } }).response;
          message = response?.data?.message ?? message;
        } else if (error instanceof Error && error.message) {
          message = error.message;
        }
        setError(message);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    void load();
    return () => {
      mounted = false;
    };
  }, [accessToken, guest.id]);

  const handleSaveRank = async (dishId: string, rank: number | null) => {
    try {
      if (!accessToken) throw new Error("Missing access token");
      setSavingRanks((prev) => ({ ...prev, [dishId]: true }));
      await saveGuestDishRank(guest.id, dishId, rank);
      toast.success("Rank saved");
      const data = await fetchGuestDishes(guest.id);
      setDishes(data);
    } catch (error: unknown) {
      let message = "Failed to save rank";
      if (error && typeof error === "object" && "response" in error) {
        const response = (error as { response?: { data?: { message?: string } } }).response;
        message = response?.data?.message ?? message;
      } else if (error instanceof Error && error.message) {
        message = error.message;
      }
      toast.error(message);
    } finally {
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
  };

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
          <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-3" style={{ scrollbarGutter: "stable both-edges" }}>
            {dishes.map((dish) => {
              const dishKey = dish.dishId ?? dish.dish_id;
              return (
                <div key={dishKey} className="flex items-start justify-between gap-4 rounded-2xl border border-[#f5d8b4]/70 bg-white/80 p-4">
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-base font-semibold text-[#2b1c12]" title={dish.name}>
                      {dish.name}
                    </div>
                    {dish.description ? (
                      <div className="mt-1 overflow-hidden text-ellipsis text-sm leading-relaxed text-[#6f5440]" title={dish.description}>
                        {dish.description}
                      </div>
                    ) : null}
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <label className="text-xs font-semibold uppercase tracking-[0.3em] text-[#a77044]">Rank</label>
                    <select
                      value={Object.prototype.hasOwnProperty.call(pendingRanks, dishKey)
                        ? pendingRanks[dishKey]
                        : dish.rank != null
                          ? String(dish.rank)
                          : ""}
                      onChange={(event) => {
                        const value = event.target.value;
                        setPendingRanks((prev) => ({ ...prev, [dishKey]: value }));
                        void handleSaveRank(dishKey, value ? Number(value) : null);
                      }}
                      disabled={savingRanks[dishKey] === true}
                      className="rounded-full border border-[#f5d8b4] bg-white/90 px-3 py-1.5 text-sm text-[#3f2a1d] focus:outline-none focus:ring-2 focus:ring-[#d37655]/50 disabled:opacity-60"
                    >
                      <option value="">None</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                    </select>
                    {savingRanks[dishKey] ? (
                      <span className="text-[0.65rem] uppercase tracking-[0.3em] text-[#a77044]">Saving…</span>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
