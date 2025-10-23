import type { ReactNode } from "react";

export const GuestRankShell = ({ children }: { children: ReactNode }) => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#fdf4e3] text-[#3f2a1d]">
      <div className="pointer-events-none absolute -top-36 left-[-80px] h-96 w-96 rounded-full bg-[#fde4c6] opacity-60 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-160px] right-[-120px] h-96 w-96 rounded-full bg-[#d88c9a]/70 opacity-35 blur-3xl" />
      <div className="relative z-10 mx-auto flex min-h-screen max-w-5xl items-center justify-center px-4 py-16 sm:px-6 lg:px-12">
        {children}
      </div>
    </div>
  );
};
