import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#fdf4e3] text-[#3f2a1d]">
      <div className="pointer-events-none absolute -top-32 -right-20 h-80 w-80 rounded-full bg-[#f9c784] opacity-40 blur-3xl"></div>
      <div className="pointer-events-none absolute -bottom-24 -left-32 h-96 w-96 rounded-full bg-[#f4978e] opacity-40 blur-3xl"></div>
      <div className="pointer-events-none absolute top-1/3 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[#d88c9a] opacity-30 blur-3xl"></div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-12 sm:py-16 lg:px-12 lg:py-20">
        <header className="mb-16 flex flex-col items-center gap-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[#a77044]">Welcome back</p>
          <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-[#2b1c12] sm:text-5xl">
            Gather the people you love around meals they will remember.
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-[#6f5440]">
            Select the guests, see their preferences, and let the menu almost choose itself. Ready to keep planning? Pick up where you left off below.
          </p>
          <button
            type="button"
            className="rounded-full bg-[#d37655] px-6 py-3 text-base font-medium text-white shadow-lg shadow-[#d37655]/30 transition duration-150 hover:-translate-y-0.5 hover:shadow-xl"
            onClick={() => navigate('/meals')}
          >
            Plan your next meal
          </button>
        </header>

        <main className="flex flex-1 flex-col gap-12">
          <section className="rounded-3xl border border-white/60 bg-white/70 p-8 shadow-lg backdrop-blur">
            <div className="max-w-xl space-y-2">
              <h2 className="text-2xl font-semibold text-[#2b1c12]">Everything you need to host with heart.</h2>
              <p className="text-sm text-[#6f5440]">Keep tabs on dishes, guests, and meal plans from one cozy hub.</p>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <HomeCard
                title="Curate your dishes"
                description="Capture your go-to recipes and the stories behind them."
                actionLabel="Open dishes"
                onClick={() => navigate('/dishes')}
              />
              <HomeCard
                title="Invite the right guests"
                description="Keep track of everyone you host and the dishes they enjoy."
                actionLabel="Open guests"
                onClick={() => navigate('/guests')}
              />
              <HomeCard
                title="Design your meals"
                description="Build thoughtful menus, add notes, and manage your guest list."
                actionLabel="Open meals"
                onClick={() => navigate('/meals')}
              />
            </div>
          </section>

        </main>

        <footer className="mt-20 border-t border-white/60 pt-8 text-sm text-[#6f5440]">
          Crafted for home cooks who treat every gathering like a special occasion.
        </footer>
      </div>
    </div>
  );
};

export default HomePage;

const HomeCard = ({ title, description, actionLabel, onClick }: { title: string; description: string; actionLabel: string; onClick: () => void }) => (
  <button
    type="button"
    className="group relative flex h-full flex-col justify-between overflow-hidden rounded-3xl border border-[#f5d8b4]/70 bg-white/80 p-6 text-left shadow-[0_20px_45px_-30px_rgba(167,112,68,0.55)] transition duration-200 hover:-translate-y-1"
    onClick={onClick}
  >
    <div>
      <h3 className="text-lg font-semibold text-[#2b1c12]">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-[#6f5440]">{description}</p>
    </div>
    <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#a15a38]">
      {actionLabel}
      <span className="transition duration-200 group-hover:translate-x-1">&gt;</span>
    </span>
  </button>
);