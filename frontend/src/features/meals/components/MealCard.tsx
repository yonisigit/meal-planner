import { useEffect, useMemo, useState } from "react";
import { formatDisplayDate } from "../../../utils/date";
import type { GuestOption, Meal, MealGuest, SuggestedMenuByCategory } from "../types";
import { MENU_CATEGORIES } from "../types";
import { GuestInviteModal } from "./GuestInviteModal";
import { SuggestedMenu } from "./SuggestedMenu";

type ModalGuest = { id: string; name: string; mealId: string };

type MealCardProps = {
  meal: Meal;
  guests: MealGuest[];
  availableGuests: GuestOption[];
  guestOptionsLoading: boolean;
  guestOptionsError: string | null;
  menuItems: SuggestedMenuByCategory;
  menuLoading: boolean;
  menuError: string | null;
  onAddGuests: (mealId: string, guestIds: string[]) => Promise<void>;
  onLoadMenu: (mealId: string) => Promise<SuggestedMenuByCategory>;
  onOpenGuestModal: (guest: ModalGuest) => void;
  onDeleteMeal: (mealId: string) => Promise<void>;
};

type GuestChecklistOption = GuestOption & { alreadyInvited: boolean };

export function MealCard({
  meal,
  guests,
  availableGuests,
  guestOptionsLoading,
  guestOptionsError,
  menuItems,
  menuLoading,
  menuError,
  onAddGuests,
  onLoadMenu,
  onOpenGuestModal,
  onDeleteMeal,
}: MealCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [isInviteModalOpen, setInviteModalOpen] = useState(false);
  const [selectedGuestIds, setSelectedGuestIds] = useState<string[]>([]);
  const [addGuestsError, setAddGuestsError] = useState<string | null>(null);
  const [addingGuests, setAddingGuests] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeletingMeal, setIsDeletingMeal] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const guestChecklistOptions: GuestChecklistOption[] = useMemo(
    () =>
      availableGuests.map((option) => ({
        ...option,
        alreadyInvited: guests.some((existing) => existing.id === option.id),
      })),
    [availableGuests, guests],
  );

  useEffect(() => {
    setSelectedGuestIds((prev) =>
      prev.filter((id) => {
        const option = guestChecklistOptions.find((item) => item.id === id);
        return option && !option.alreadyInvited;
      }),
    );
  }, [guestChecklistOptions]);

  const hasMenuItems = MENU_CATEGORIES.some((category) => menuItems[category]?.length > 0);

  const openInviteModal = () => {
    setSelectedGuestIds([]);
    setAddGuestsError(null);
    setInviteModalOpen(true);
  };

  const closeInviteModal = () => {
    if (addingGuests) {
      return;
    }
    setInviteModalOpen(false);
    setAddGuestsError(null);
    setSelectedGuestIds([]);
  };

  const toggleGuestSelection = (guestId: string) => {
    const option = guestChecklistOptions.find((item) => item.id === guestId);
    if (!option || option.alreadyInvited || addingGuests) {
      return;
    }
    setSelectedGuestIds((prev) => (prev.includes(guestId) ? prev.filter((id) => id !== guestId) : [...prev, guestId]));
  };

  const handleConfirmGuests = async () => {
    if (selectedGuestIds.length === 0) {
      setAddGuestsError("Select at least one guest to invite.");
      return;
    }
    setAddingGuests(true);
    setAddGuestsError(null);
    try {
      await onAddGuests(meal.id, selectedGuestIds);
      setInviteModalOpen(false);
      setSelectedGuestIds([]);
    } catch (err: unknown) {
      let message = "Failed to add guests to the meal.";
      if (err && typeof err === "object" && "message" in err && typeof (err as { message?: string }).message === "string") {
        message = (err as { message?: string }).message ?? message;
      }
      setAddGuestsError(message);
    } finally {
      setAddingGuests(false);
    }
  };

  const selectedCount = selectedGuestIds.length;
  const confirmButtonLabel = addingGuests
    ? "Adding..."
    : selectedCount > 0
      ? `Add ${selectedCount} ${selectedCount === 1 ? "guest" : "guests"}`
      : "Add guests";

  const handleToggleMenu = async () => {
    const willShow = !showMenu;
    setShowMenu(willShow);
    if (willShow) {
      try {
        await onLoadMenu(meal.id);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleRefreshMenu = () => {
    void onLoadMenu(meal.id).catch((err) => {
      console.error(err);
    });
  };

  const handleDeleteMeal = async () => {
    setIsDeletingMeal(true);
    setDeleteError(null);
    try {
      await onDeleteMeal(meal.id);
      setShowDeleteModal(false);
    } catch (err: unknown) {
      let message = "Failed to delete meal.";
      if (err instanceof Error && err.message) {
        message = err.message;
      }
      setDeleteError(message);
    } finally {
      setIsDeletingMeal(false);
    }
  };

  return (
    <li className="rounded-2xl border border-[#f5d8b4]/70 bg-white/80 p-5 shadow-[0_20px_45px_-30px_rgba(167,112,68,0.55)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="text-base font-semibold text-[#2b1c12]">{meal.name}</div>
          {meal.description && <div className="text-sm leading-relaxed text-[#6f5440]">{meal.description}</div>}
        </div>
        <div className="shrink-0 text-right text-xs uppercase tracking-[0.28em] text-[#a77044]">
          <div>{formatDisplayDate(meal.date)}</div>
          <div className="mt-2 flex flex-col items-end gap-1">
            <div className="flex items-center gap-2">
              <button
                type="button"
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-[0.7rem] font-semibold transition focus:outline-none focus:ring-2 focus:ring-[#d37655]/40 sm:text-xs ${showMenu ? "bg-[#d37655] text-white shadow-[0_12px_28px_-18px_rgba(211,118,85,0.85)]" : "border border-[#d37655]/40 bg-white/90 text-[#a15535] hover:-translate-y-0.5 hover:bg-[#fbe0d4]"}`}
                onClick={handleToggleMenu}
              >
                <span className="font-bold tracking-[0.25em]">MENU</span>
                <span className="tracking-normal">{showMenu ? "Hide suggestions" : "Show suggestions"}</span>
                <span aria-hidden>{showMenu ? "▴" : "▾"}</span>
              </button>
              <button
                type="button"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#d37655]/30 text-[#d37655] transition hover:bg-[#fbe0d4]"
                onClick={() => {
                  if (isDeletingMeal) {
                    return;
                  }
                  setDeleteError(null);
                  setShowDeleteModal(true);
                }}
                aria-label={showDeleteModal ? "Cancel delete" : "Delete meal"}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <path d="M3 6h18" />
                  <path d="M8 6V4.5A1.5 1.5 0 0 1 9.5 3h5A1.5 1.5 0 0 1 16 4.5V6" />
                  <path d="M19 6v13a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 19V6" />
                  <path d="M10 11v6" />
                  <path d="M14 11v6" />
                </svg>
              </button>
            </div>
            <span className="text-[0.55rem] normal-case tracking-normal text-[#6f5440]">Based on guest rankings</span>
          </div>
        </div>
      </div>

      {showMenu && (
        <SuggestedMenu
          menuItems={menuItems}
          isLoading={menuLoading}
          error={menuError}
          onRefresh={handleRefreshMenu}
          mealHasItems={hasMenuItems}
        />
      )}

      <div className="mt-5 rounded-2xl border border-[#f5d8b4]/60 bg-white/70 p-4">
        <div className="text-xs font-semibold uppercase tracking-[0.3em] text-[#a77044]">Guests</div>
        {guests.length > 0 ? (
          <ul className="mt-3 flex flex-wrap items-center gap-2 text-sm text-[#6f5440]">
            {guests.map((guest) => (
              <li key={`${meal.id}-${guest.id}`} className="inline-flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="rounded-full bg-[#fbe0d4] px-3 py-1 text-[#5b3d2a]"
                    onClick={() => onOpenGuestModal({ id: guest.id, name: guest.name, mealId: meal.id })}
                  >
                    {guest.name}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-3 text-sm text-[#6f5440]">No guests added yet.</div>
        )}

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-full bg-[#d37655] px-5 py-2 text-sm font-medium text-white transition hover:-translate-y-0.5 disabled:opacity-70"
            onClick={openInviteModal}
            disabled={guestOptionsLoading}
          >
            Invite guests
          </button>
        </div>
        {guestOptionsLoading && <div className="mt-2 text-xs text-[#6f5440]">Loading guest list...</div>}
        {guestOptionsError && <div className="mt-2 text-xs text-red-500">{guestOptionsError}</div>}
        {!guestOptionsLoading && !guestOptionsError && availableGuests.length === 0 && (
          <div className="mt-2 text-xs text-[#6f5440]">You have no guests saved yet. Add guests from the guests page first.</div>
        )}
        {!guestOptionsLoading && !guestOptionsError && availableGuests.length > 0 &&
          availableGuests.every((option) => guests.some((existing) => existing.id === option.id)) && (
            <div className="mt-2 text-xs text-[#6f5440]">All of your guests are already assigned to this meal.</div>
          )}
      </div>

      <GuestInviteModal
        mealName={meal.name}
        isOpen={isInviteModalOpen}
        selectedGuestIds={selectedGuestIds}
        guestChecklistOptions={guestChecklistOptions}
        addingGuests={addingGuests}
        guestOptionsLoading={guestOptionsLoading}
        guestOptionsError={guestOptionsError}
        addGuestsError={addGuestsError}
        confirmButtonLabel={confirmButtonLabel}
        onToggleGuestSelection={toggleGuestSelection}
        onConfirm={handleConfirmGuests}
        onClose={closeInviteModal}
      />
      {showDeleteModal ? (
        <DeleteMealModal
          mealName={meal.name}
          onCancel={() => {
            if (isDeletingMeal) {
              return;
            }
            setShowDeleteModal(false);
            setDeleteError(null);
          }}
          onConfirm={() => {
            if (isDeletingMeal) {
              return;
            }
            void handleDeleteMeal();
          }}
          isDeleting={isDeletingMeal}
          error={deleteError}
        />
      ) : null}
    </li>
  );
}

type DeleteMealModalProps = {
  mealName: string;
  onCancel: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
  error: string | null;
};

function DeleteMealModal({ mealName, onCancel, onConfirm, isDeleting, error }: DeleteMealModalProps) {
  const canDismiss = !isDeleting;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#2b1c12]/40 px-3 py-6 sm:px-4 sm:py-8"
      onClick={() => {
        if (!canDismiss) {
          return;
        }
        onCancel();
      }}
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-white/70 bg-white/95 p-5 shadow-[0_35px_80px_-35px_rgba(167,112,68,0.6)] backdrop-blur-sm sm:rounded-3xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-[#a77044]">Delete meal</h3>
            <button
              type="button"
              className="text-xs font-semibold uppercase tracking-[0.3em] text-[#d37655] underline decoration-dotted disabled:opacity-60"
              onClick={() => {
                if (!canDismiss) {
                  return;
                }
                onCancel();
              }}
              disabled={!canDismiss}
            >
              Close
            </button>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-semibold text-[#2b1c12]">Remove {mealName}?</p>
            <p className="text-xs text-[#6f5440]">
              This deletes the meal and guest assignments. This action cannot be undone.
            </p>
            {error ? <p className="text-xs text-red-500">{error}</p> : null}
          </div>
          <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
            <button
              type="button"
              className="rounded-full border border-[#d37655]/30 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[#d37655] transition hover:bg-[#fbe0d4] disabled:opacity-60"
              onClick={() => {
                if (!canDismiss) {
                  return;
                }
                onCancel();
              }}
              disabled={!canDismiss}
            >
              Cancel
            </button>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-full bg-[#d37655] px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-white transition hover:-translate-y-0.5 disabled:opacity-70"
              onClick={() => {
                if (isDeleting) {
                  return;
                }
                onConfirm();
              }}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
