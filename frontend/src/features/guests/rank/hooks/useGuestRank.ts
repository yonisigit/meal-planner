import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { fetchGuestRankData, saveGuestRankSelection } from "../api/guestRankApi";
import type { GuestRankData, GuestRankSavingMap } from "../types";

export function useGuestRank(rankToken?: string) {
  const [data, setData] = useState<GuestRankData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingMap, setSavingMap] = useState<GuestRankSavingMap>({});

  const load = useCallback(async () => {
    if (!rankToken) {
      setError("Missing ranking link.");
      setLoading(false);
      setData(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const payload = await fetchGuestRankData(rankToken);
      setData(payload);
    } catch (err: unknown) {
      let message = "We could not load the dishes for this link.";
      if (err && typeof err === "object" && "response" in err) {
        const response = (err as { response?: { data?: { message?: string } } }).response;
        message = response?.data?.message ?? message;
      } else if (err instanceof Error && err.message) {
        message = err.message;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [rankToken]);

  useEffect(() => {
    void load();
  }, [load]);

  const saveRank = useCallback(
    async (dishId: string, rank: number) => {
      if (!rankToken) return;

      setSavingMap((prev) => ({ ...prev, [dishId]: true }));
      try {
        await saveGuestRankSelection(rankToken, dishId, rank);
        setData((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            dishes: prev.dishes.map((dish) =>
              dish.dishId === dishId
                ? {
                    ...dish,
                    rank,
                  }
                : dish,
            ),
          };
        });
        toast.success("Rank saved");
      } catch (err: unknown) {
        let message = "We could not save that rank.";
        if (err && typeof err === "object" && "response" in err) {
          const response = (err as { response?: { data?: { message?: string } } }).response;
          message = response?.data?.message ?? message;
        } else if (err instanceof Error && err.message) {
          message = err.message;
        }
        toast.error(message);
      } finally {
        setSavingMap((prev) => {
          const next = { ...prev };
          delete next[dishId];
          return next;
        });
      }
    },
    [rankToken],
  );

  return {
    data,
    loading,
    error,
    refresh: load,
    setError,
    saveRank,
    savingMap,
  } as const;
}
