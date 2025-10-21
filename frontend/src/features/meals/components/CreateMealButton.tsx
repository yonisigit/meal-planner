import type { FormEvent } from "react";
import { useState } from "react";
import toast from "react-hot-toast";
import { createMeal } from "../api/mealsApi";

export function CreateMealButton({ onCreated }: { onCreated: () => Promise<void> }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const resetForm = () => {
    setName("");
    setDescription("");
    setDate(new Date().toISOString().slice(0, 10));
    setFormError(null);
  };

  const closeModal = () => {
    resetForm();
    setOpen(false);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setFormError("Please enter a meal name.");
      return;
    }
    if (!date) {
      setFormError("Please choose a date.");
      return;
    }

    setSubmitting(true);
    setFormError(null);
    try {
      await createMeal({
        name: trimmedName,
        description: description.trim() || undefined,
        date,
      });
      toast.success("Meal created");
      closeModal();
      await onCreated();
    } catch (err: unknown) {
      let message = "Failed to create meal";
      if (err && typeof err === "object" && "response" in err) {
        const response = (err as { response?: { data?: { message?: string } } }).response;
        message = response?.data?.message ?? message;
      } else if (err instanceof Error && err.message) {
        message = err.message;
      }
      setFormError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        className="inline-flex items-center justify-center rounded-full bg-[#d37655] px-5 py-2 text-sm font-medium text-white shadow-lg shadow-[#d37655]/30 transition hover:-translate-y-0.5"
        onClick={() => setOpen(true)}
      >
        New meal
      </button>
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
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-[0.3em] text-[#a77044]" htmlFor="meal-name">
                    Meal name
                  </label>
                  <button
                    type="button"
                    className="text-xs font-semibold uppercase tracking-[0.3em] text-[#d37655] underline decoration-dotted disabled:opacity-60"
                    onClick={() => closeModal()}
                    disabled={submitting}
                  >
                    Close
                  </button>
                </div>
                <input
                  id="meal-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="w-full rounded-xl border border-[#f5d8b4] bg-white/95 px-4 py-2 text-sm text-[#3f2a1d] focus:outline-none focus:ring-2 focus:ring-[#d37655]/50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-[0.3em] text-[#a77044]" htmlFor="meal-date">
                  Meal date
                </label>
                <input
                  id="meal-date"
                  type="date"
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                  className="w-full rounded-xl border border-[#f5d8b4] bg-white/95 px-4 py-2 text-sm text-[#3f2a1d] focus:outline-none focus:ring-2 focus:ring-[#d37655]/50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-[0.3em] text-[#a77044]" htmlFor="meal-description">
                  Description
                </label>
                <textarea
                  id="meal-description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-[#f5d8b4] bg-white/95 px-4 py-2 text-sm text-[#3f2a1d] focus:outline-none focus:ring-2 focus:ring-[#d37655]/50"
                />
              </div>
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-full bg-[#d37655] px-5 py-2 text-sm font-medium text-white transition hover:-translate-y-0.5 disabled:opacity-70"
                  disabled={submitting}
                >
                  {submitting ? "Creating..." : "Save meal"}
                </button>
                <button
                  type="button"
                  className="text-sm font-semibold text-[#a15a38] underline decoration-[#f5d8b4] underline-offset-4 transition hover:text-[#d37655] disabled:opacity-60"
                  onClick={() => closeModal()}
                  disabled={submitting}
                >
                  Cancel
                </button>
              </div>
              {formError && <p className="text-xs text-red-500">{formError}</p>}
            </form>
          </div>
        </div>
      )}
    </>
  );
}
