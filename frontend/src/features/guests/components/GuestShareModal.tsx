import { useMemo } from "react";
import toast from "react-hot-toast";
import type { Guest } from "../types";

type GuestShareModalProps = {
  guest: Guest;
  onClose: () => void;
};

export function GuestShareModal({ guest, onClose }: GuestShareModalProps) {
  const shareUrl = useMemo(() => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    return origin ? `${origin}/guests/${guest.rankToken}` : `/guests/${guest.rankToken}`;
  }, [guest.rankToken]);

  const copyLink = async () => {
    if (!navigator.clipboard || typeof navigator.clipboard.writeText !== "function") {
      toast.error("Clipboard unavailable. Select and copy the link manually.");
      return;
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied to clipboard");
    } catch (error) {
      console.error(error);
      toast.error("Unable to copy link. Please copy it manually.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2b1c12]/40 px-3 py-6 sm:px-4 sm:py-8" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-2xl border border-white/60 bg-white/90 p-5 shadow-[0_35px_80px_-35px_rgba(167,112,68,0.6)] backdrop-blur sm:rounded-3xl sm:p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-lg font-semibold text-[#2b1c12]">Share ranking link</h3>
          <button
            type="button"
            className="text-xs font-semibold uppercase tracking-[0.3em] text-[#d37655] underline decoration-dotted"
            onClick={onClose}
          >
            Close
          </button>
        </div>
        <p className="mb-4 text-sm leading-relaxed text-[#6f5440]">
          Send this link to {guest.name} so they can rank dishes in their browser. Anyone with the link can update their rankings.
        </p>
        <div className="space-y-3">
          <div className="rounded-2xl border border-[#f5d8b4]/80 bg-white/95 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#a77044]">Guest link</p>
            <textarea
              readOnly
              value={shareUrl}
              className="mt-2 w-full resize-none rounded-xl border border-[#f5d8b4] bg-white/90 px-3 py-2 text-sm text-[#3f2a1d] focus:outline-none"
              rows={3}
              onFocus={(event) => event.currentTarget.select()}
            />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              className="rounded-full bg-[#d37655] px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-[#d37655]/30 transition hover:-translate-y-0.5"
              onClick={copyLink}
            >
              Copy link
            </button>
            <button
              type="button"
              className="text-sm font-semibold text-[#a15a38] underline decoration-[#f5d8b4] underline-offset-4 transition hover:text-[#d37655]"
              onClick={onClose}
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
