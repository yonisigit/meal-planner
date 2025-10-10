import { useNavigate } from 'react-router-dom';

type ActionCard = {
  title: string;
  description: string;
  to: string;
  badge: string;
  accent: string;
};

const actionCards: ActionCard[] = [
  {
    title: 'Curate your dishes',
    description: 'Capture your go-to recipes and the stories behind them so you always know what to serve.',
    to: '/dishes',
    badge: 'DI',
    accent: 'from-[#f9c784]/80 via-[#fde0b2]/60 to-transparent'
  },
  {
    title: 'Invite the right guests',
    description: 'Keep track of who loves what, from family favorites to dietary must-haves.',
    to: '/guests',
    badge: 'GU',
    accent: 'from-[#f4978e]/70 via-[#f8b88b]/50 to-transparent'
  }
];

type QuickLink = {
  label: string;
  to: string;
  helper: string;
};

const quickLinks: QuickLink[] = [
  {
    label: 'Go to dishes',
    to: '/dishes',
    helper: 'Capture recipes and notes'
  },
  {
    label: 'Manage guests',
    to: '/guests',
    helper: 'Track preferences and quirks'
  },
  {
    label: 'Plan a meal',
    to: '/meals',
    helper: 'Build menus with confidence'
  }
];

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#fdf4e3] text-[#3f2a1d]">
      <div className="pointer-events-none absolute -top-32 -right-20 h-80 w-80 rounded-full bg-[#f9c784] opacity-40 blur-3xl"></div>
      <div className="pointer-events-none absolute -bottom-24 -left-32 h-96 w-96 rounded-full bg-[#f4978e] opacity-40 blur-3xl"></div>
      <div className="pointer-events-none absolute top-1/3 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[#d88c9a] opacity-30 blur-3xl"></div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-12 sm:py-16 lg:px-12 lg:py-20">
        <header className="mb-16 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/70 text-lg font-semibold tracking-wide shadow-lg shadow-[#f9c784]/40">
              MP
            </div>
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.35em] text-[#a77044]">Meal planner</p>
              <p className="text-sm text-[#6f5440]">Host with confidence, cook with heart.</p>
            </div>
          </div>
          <button
            type="button"
            className="self-start rounded-full border border-[#d37655]/30 px-5 py-2 text-sm font-medium text-[#d37655] transition-colors duration-150 hover:bg-[#fbe0d4]"
            onClick={() => navigate('/login')}
          >
            Switch account
          </button>
        </header>

        <main className="flex flex-1 flex-col gap-16">
          <div className="flex flex-col justify-center gap-12">
            <div className="space-y-6 max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[#a77044]">Welcome back</p>
              <h1 className="text-4xl font-semibold leading-tight tracking-tight text-[#2b1c12] sm:text-5xl">
                Gather the people you love around meals they will remember.
              </h1>
              <p className="max-w-xl text-base leading-relaxed text-[#6f5440]">
                Select the guests, see their preferences, and let the menu almost choose itself.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <button
                type="button"
                className="rounded-full bg-[#d37655] px-6 py-3 text-base font-medium text-white shadow-lg shadow-[#d37655]/30 transition duration-150 hover:-translate-y-0.5 hover:shadow-xl"
                onClick={() => navigate('/meals')}
              >
                Start planning a meal
              </button>
            </div>
          </div>

          <section className="grid gap-6 sm:grid-cols-2">
            {actionCards.map((card) => (
            <button
              type="button"
              key={card.title}
              className="group relative overflow-hidden rounded-3xl border border-white/60 bg-white/70 p-6 text-left shadow-lg transition duration-200 hover:-translate-y-1 hover:shadow-xl"
              onClick={() => navigate(card.to)}
            >
              <div className={`absolute inset-x-0 top-0 h-2/3 bg-gradient-to-br ${card.accent} opacity-80 blur-2xl transition duration-200 group-hover:opacity-100`}></div>
              <div className="relative flex h-full flex-col gap-4">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/80 text-sm font-semibold tracking-widest text-[#a15a38]">
                  {card.badge}
                </span>
                <div>
                  <h3 className="text-xl font-semibold text-[#2b1c12]">{card.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#6f5440]">{card.description}</p>
                </div>
                <span className="mt-auto text-sm font-semibold text-[#a15a38]">View details &gt;</span>
              </div>
            </button>
            ))}
          </section>

          <section className="mt-16 rounded-3xl border border-white/60 bg-white/60 p-6 backdrop-blur">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#a77044]">Quick links</p>
                <h3 className="mt-2 text-xl font-semibold text-[#2b1c12]">Jump straight into the details.</h3>
              </div>
              <div className="flex flex-wrap gap-3">
                {quickLinks.map((link) => (
                  <button
                    type="button"
                    key={link.to}
                    className="group flex min-w-[180px] flex-col rounded-2xl border border-[#f5d8b4]/70 bg-white/80 px-4 py-3 text-left shadow-[0_20px_45px_-30px_rgba(167,112,68,0.55)] transition duration-200 hover:-translate-y-1"
                    onClick={() => navigate(link.to)}
                  >
                    <span className="text-sm font-semibold text-[#2b1c12]">{link.label}</span>
                    <span className="mt-1 text-xs text-[#6f5440]">{link.helper}</span>
                    <span className="mt-3 text-xs font-semibold uppercase tracking-[0.3em] text-[#a77044]">Open &gt;</span>
                  </button>
                ))}
              </div>
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