import type { FormEvent } from "react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../../../context/useAuth";
import { createDish } from "../api/dishesApi";
import type { DishCategory } from "../types";

type AddDishButtonProps = {
  onAdded: () => Promise<void>;
};

export function AddDishButton({ onAdded }: AddDishButtonProps) {
  const { accessToken } = useAuth();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<DishCategory>("other");
  const [submitting, setSubmitting] = useState(false);

  const resetForm = () => {
    setName("");
    setDescription("");
    setCategory("other");
  };

  const closeModal = () => {
    resetForm();
    setOpen(false);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter a dish name");
      return;
    }
    if (!accessToken) {
      toast.error("Missing access token. Please login again.");
      return;
    }
    setSubmitting(true);
    try {
      await createDish({
        name: name.trim(),
        description: description.trim() || undefined,
        category,
      });
      toast.success("Dish added");
      closeModal();
      await onAdded();
    } catch (error: unknown) {
      let message = "Failed to add dish";
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

  return (
    <>
      <div className="w-full max-w-xs">
        <button
          type="button"
          className="inline-flex w-full items-center justify-center rounded-full bg-[#d37655] px-5 py-2 text-sm font-medium text-white shadow-lg shadow-[#d37655]/30 transition hover:-translate-y-0.5"
          onClick={() => setOpen(true)}
        >
          Add dish
        </button>
      </div>
      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#2b1c12]/40 px-3 py-6 sm:px-4 sm:py-8"
          onClick={() => {
            if (submitting) return;
            closeModal();
          }}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-white/70 bg-white/90 p-5 shadow-[0_35px_80px_-35px_rgba(167,112,68,0.6)] backdrop-blur sm:rounded-3xl sm:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <form className="space-y-3" onSubmit={handleSubmit}>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-[#a77044]">Add dish</h3>
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
                <label className="text-xs font-semibold uppercase tracking-[0.3em] text-[#a77044]" htmlFor="dish-name">
                  Dish name
                </label>
                <input
                  id="dish-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="w-full rounded-xl border border-[#f5d8b4] bg-white/90 px-4 py-2 text-sm text-[#3f2a1d] focus:outline-none focus:ring-2 focus:ring-[#d37655]/50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-[0.3em] text-[#a77044]" htmlFor="dish-description">
                  Description
                </label>
                <textarea
                  id="dish-description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-[#f5d8b4] bg-white/90 px-4 py-2 text-sm text-[#3f2a1d] focus:outline-none focus:ring-2 focus:ring-[#d37655]/50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-[0.3em] text-[#a77044]" htmlFor="dish-category">
                  Category
                </label>
                <select
                  id="dish-category"
                  value={category}
                  onChange={(event) => setCategory(event.target.value as DishCategory)}
                  className="w-full rounded-xl border border-[#f5d8b4] bg-white/90 px-4 py-2 text-sm text-[#3f2a1d] focus:outline-none focus:ring-2 focus:ring-[#d37655]/50"
                >
                  <option value="main">Main</option>
                  <option value="side">Side</option>
                  <option value="dessert">Dessert</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-full bg-[#d37655] px-5 py-2 text-sm font-medium text-white transition hover:-translate-y-0.5 disabled:opacity-70"
                  disabled={submitting}
                >
                  {submitting ? "Adding..." : "Save dish"}
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
      ) : null}
    </>
  );
}
