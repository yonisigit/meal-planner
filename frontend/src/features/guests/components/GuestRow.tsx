import { useState } from "react";
import type { Guest } from "../types";
import { GuestDishesModal } from "./GuestDishesModal";
import { GuestShareModal } from "./GuestShareModal";

type GuestRowProps = {
  guest: Guest;
};

export function GuestRow({ guest }: GuestRowProps) {
  const [showDishes, setShowDishes] = useState(false);
  const [showShare, setShowShare] = useState(false);

  return (
    <li className="flex items-center justify-between gap-4 px-1 py-3 transition duration-150 hover:bg-white/40">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#d37655]/80 text-sm font-semibold text-white">
          {guest.name.charAt(0).toUpperCase()}
        </span>
        <span className="text-base font-medium text-[#2b1c12]">{guest.name}</span>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="rounded-full border border-[#d37655]/30 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[#d37655] transition hover:bg-[#fbe0d4]"
          onClick={() => setShowShare(true)}
        >
          Share link
        </button>
        <button
          type="button"
          className="rounded-full border border-[#d37655]/30 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[#d37655] transition hover:bg-[#fbe0d4]"
          onClick={() => setShowDishes(true)}
        >
          View rankings
        </button>
      </div>
      {showDishes ? <GuestDishesModal guest={guest} onClose={() => setShowDishes(false)} /> : null}
      {showShare ? <GuestShareModal guest={guest} onClose={() => setShowShare(false)} /> : null}
    </li>
  );
}
