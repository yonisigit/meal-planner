import type { ReactNode } from "react";

type GuestRankStatusCardProps = {
  title: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
    disabled?: boolean;
  };
  children?: ReactNode;
  tone?: "default" | "error";
};

export const GuestRankStatusCard = ({
  title,
  message,
  action,
  children,
  tone = "default",
}: GuestRankStatusCardProps) => {
  const toneClasses = tone === "error" ? "text-red-500" : "text-[#6f5440]";
  return (
    <div className="space-y-4 rounded-3xl border border-white/60 bg-white/85 px-6 py-10 text-center shadow-glow">
      <p className="text-lg font-semibold text-[#2b1c12]">{title}</p>
      <p className={`text-sm leading-relaxed ${toneClasses}`}>{message}</p>
      {children}
      {action ? (
        <button
          type="button"
          className="rounded-full bg-[#d37655] px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-[#d37655]/30 transition hover:-translate-y-0.5 disabled:opacity-60"
          onClick={action.onClick}
          disabled={action.disabled}
        >
          {action.label}
        </button>
      ) : null}
    </div>
  );
};
