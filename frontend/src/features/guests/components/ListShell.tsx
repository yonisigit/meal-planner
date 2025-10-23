import type { ReactNode } from "react";

export function ListShell({ children, error = false }: { children: ReactNode; error?: boolean }) {
  return (
    <div
      className={`mt-8 min-h-[240px] rounded-3xl border border-white/60 bg-white/60 px-1 py-2 text-sm sm:min-h-[320px] ${
        error ? "text-red-500" : "text-[#6f5440]"
      } backdrop-blur`}
      style={{ scrollbarGutter: "stable both-edges" }}
    >
      {children}
    </div>
  );
}
