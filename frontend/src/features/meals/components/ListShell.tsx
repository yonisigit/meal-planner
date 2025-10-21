import type { ReactNode } from "react";

export function ListShell({ children, error = false }: { children: ReactNode; error?: boolean }) {
  return (
    <div
      className={`mt-8 min-h-[240px] rounded-2xl border border-white/60 bg-white/60 p-4 text-sm sm:min-h-[320px] sm:p-5 ${error ? "text-red-500" : "text-[#6f5440]"} backdrop-blur`}
    >
      {children}
    </div>
  );
}
