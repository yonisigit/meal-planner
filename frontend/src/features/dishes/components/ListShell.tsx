import type { ReactNode } from "react";

export function ListShell({ children }: { children: ReactNode }) {
  return (
    <div className="mt-8 min-h-[220px] rounded-2xl border border-white/60 bg-white/60 p-4 text-sm text-[#6f5440] backdrop-blur sm:min-h-[280px] sm:p-5">
      {children}
    </div>
  );
}
