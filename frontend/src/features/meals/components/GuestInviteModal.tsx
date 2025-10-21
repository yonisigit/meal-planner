type GuestChecklistOption = {
  id: string;
  name: string;
  alreadyInvited: boolean;
};

interface GuestInviteModalProps {
  mealName: string;
  isOpen: boolean;
  selectedGuestIds: string[];
  guestChecklistOptions: GuestChecklistOption[];
  addingGuests: boolean;
  guestOptionsLoading: boolean;
  guestOptionsError: string | null;
  addGuestsError: string | null;
  confirmButtonLabel: string;
  onToggleGuestSelection: (guestId: string) => void;
  onConfirm: () => void;
  onClose: () => void;
}

export function GuestInviteModal({
  mealName,
  isOpen,
  selectedGuestIds,
  guestChecklistOptions,
  addingGuests,
  guestOptionsLoading,
  guestOptionsError,
  addGuestsError,
  confirmButtonLabel,
  onToggleGuestSelection,
  onConfirm,
  onClose,
}: GuestInviteModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2b1c12]/40 px-3 py-6 sm:px-4 sm:py-8">
      <div className="w-full max-w-md rounded-2xl border border-white/60 bg-white/95 p-5 shadow-[0_35px_80px_-35px_rgba(167,112,68,0.6)] backdrop-blur sm:rounded-3xl">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-[#2b1c12]">Invite guests to {mealName}</h3>
          <button
            type="button"
            className="text-xs font-semibold uppercase tracking-[0.3em] text-[#d37655] underline decoration-dotted underline-offset-2 disabled:opacity-60"
            onClick={onClose}
            disabled={addingGuests}
          >
            Close
          </button>
        </div>
        {guestOptionsLoading ? (
          <div className="text-sm text-[#6f5440]">Loading guest list...</div>
        ) : guestOptionsError ? (
          <div className="text-sm text-red-500">{guestOptionsError}</div>
        ) : guestChecklistOptions.length === 0 ? (
          <div className="text-sm text-[#6f5440]">
            You have no guests saved yet. Add guests from the guests page first.
          </div>
        ) : (
          <ul className="max-h-64 space-y-2 overflow-y-auto pr-1">
            {guestChecklistOptions.map((guestOption) => (
              <li key={guestOption.id}>
                <label
                  className={`flex items-center gap-3 rounded-xl border border-[#f5d8b4]/60 bg-white/80 px-3 py-2 text-sm text-[#3f2a1d] ${guestOption.alreadyInvited ? "opacity-60" : ""}`}
                >
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-[#d37655] text-[#d37655] focus:ring-[#d37655]"
                    checked={selectedGuestIds.includes(guestOption.id)}
                    onChange={() => onToggleGuestSelection(guestOption.id)}
                    disabled={guestOption.alreadyInvited || addingGuests}
                  />
                  <span className="flex-1 truncate">{guestOption.name}</span>
                  {guestOption.alreadyInvited ? (
                    <span className="text-[0.65rem] uppercase tracking-[0.28em] text-[#a77044]">Invited</span>
                  ) : null}
                </label>
              </li>
            ))}
          </ul>
        )}
        {addGuestsError && <div className="mt-3 text-xs text-red-500">{addGuestsError}</div>}
        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            className="rounded-full border border-[#d37655]/30 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.3em] text-[#d37655] hover:bg-[#fbe0d4] disabled:opacity-70"
            onClick={onClose}
            disabled={addingGuests}
          >
            Cancel
          </button>
          <button
            type="button"
            className="rounded-full bg-[#d37655] px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white shadow-[0_12px_28px_-18px_rgba(211,118,85,0.85)] transition disabled:opacity-60"
            onClick={onConfirm}
            disabled={addingGuests || selectedGuestIds.length === 0}
          >
            {confirmButtonLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
