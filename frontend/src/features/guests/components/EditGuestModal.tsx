import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import toast from "react-hot-toast";
import type { Guest } from "../types";
import { updateGuest } from "../api/guestsApi";

type EditGuestModalProps = {
  guest: Guest;
  onClose: () => void;
  onUpdated: () => Promise<void>;
};

export function EditGuestModal({ guest, onClose, onUpdated }: EditGuestModalProps) {
  const [name, setName] = useState(guest.name);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setName(guest.name);
  }, [guest]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      toast.error("Please enter a guest name");
      return;
    }
    setSubmitting(true);
    try {
      await updateGuest(guest.id, { name: trimmedName });
      toast.success("Guest updated");
      onClose();
      await onUpdated();
    } catch (error: unknown) {
      let message = "Failed to update guest";
      if (error && typeof error === "object" && "response" in error) {
        const response = (error as { response?: { data?: { message?: string } } }).response;
        message = response?.data?.message ?? message;
      } else if (error instanceof Error && error.message) {
        message = error.message;
      }
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const canDismiss = !submitting;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#2b1c12]/40 px-3 py-6 sm:px-4 sm:py-8"
      onClick={() => {
        if (!canDismiss) return;
        onClose();
      }}
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-white/70 bg-white/90 p-5 shadow-[0_35px_80px_-35px_rgba(167,112,68,0.6)] backdrop-blur sm:rounded-3xl"
        onClick={(event) => event.stopPropagation()}
      >
        <form className="space-y-3" onSubmit={handleSubmit}>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-[#a77044]">Edit guest</h3>
            <button
              type="button"
              className="text-xs font-semibold uppercase tracking-[0.3em] text-[#d37655] underline decoration-dotted disabled:opacity-60"
              onClick={() => {
                if (!canDismiss) return;
                onClose();
              }}
              disabled={!canDismiss}
            >
              Close
            </button>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.3em] text-[#a77044]" htmlFor="guest-name">
              Guest name
            </label>
            <input
              id="guest-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full rounded-xl border border-[#f5d8b4] bg-white/90 px-4 py-2 text-sm text-[#3f2a1d] focus:outline-none focus:ring-2 focus:ring-[#d37655]/50"
              disabled={submitting}
            />
          </div>
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-full bg-[#d37655] px-5 py-2 text-sm font-medium text-white transition hover:-translate-y-0.5 disabled:opacity-70"
              disabled={submitting}
            >
              {submitting ? "Saving..." : "Save changes"}
            </button>
            <button
              type="button"
              className="text-sm font-medium text-[#a15a38] underline decoration-[#f5d8b4] underline-offset-4 transition hover:text-[#d37655] disabled:opacity-60"
              onClick={() => {
                if (!canDismiss) return;
                onClose();
              }}
              disabled={!canDismiss}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
