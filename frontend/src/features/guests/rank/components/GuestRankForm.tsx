import type { GuestRankData, GuestRankSavingMap } from "../types";

type GuestRankFormProps = {
  data: GuestRankData;
  savingMap: GuestRankSavingMap;
  onRankChange: (dishId: string, rank: number) => void;
  onDone: () => void;
};

export const GuestRankForm = ({ data, savingMap, onRankChange, onDone }: GuestRankFormProps) => {
  const invitationText = data.hostName ? `${data.hostName} has invited you to rank their dishes!` : "You have been invited to share your favorites!";
  const hasNoDishes = data.dishes.length === 0;

  return (
    <div className="w-full max-w-3xl rounded-3xl border border-white/60 bg-white/85 p-6 shadow-[0_35px_80px_-35px_rgba(167,112,68,0.6)] backdrop-blur">
      <header className="mb-6 space-y-2 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#a77044]">Guest ranking</p>
        <h1 className="text-3xl font-semibold text-[#2b1c12] sm:text-4xl">{invitationText}</h1>
        <p className="text-sm leading-relaxed text-[#6f5440]">
          Help {data.hostName || "your host"} plan a menu you will love. Rank each dish from 3 (top choice) to 1 (not your favorite).
        </p>
      </header>

      {hasNoDishes ? (
        <div className="rounded-2xl border border-dashed border-[#f5d8b4] bg-white/70 px-6 py-10 text-center text-sm text-[#6f5440]">
          There are no dishes to rank yet. Check back soon!
        </div>
      ) : (
        <div className="space-y-3">
          {data.dishes.map((dish) => (
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
                  value={dish.rank ? String(dish.rank) : ""}
                  onChange={(event) => {
                    const next = Number(event.target.value);
                    if (!Number.isNaN(next)) {
                        if (dish.rank === next) {
                          return;
                        }
                      onRankChange(dish.dishId, next);
                    }
                  }}
                  disabled={savingMap[dish.dishId] === true}
                  className="rounded-full border border-[#f5d8b4] bg-white/90 px-3 py-1.5 text-sm text-[#3f2a1d] focus:outline-none focus:ring-2 focus:ring-[#d37655]/40 disabled:opacity-60"
                >
                  <option value="" disabled>
                    Select
                  </option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                </select>
                {savingMap[dish.dishId] ? (
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
          onClick={onDone}
          disabled={hasNoDishes}
        >
          Done
        </button>
      </div>
    </div>
  );
};
