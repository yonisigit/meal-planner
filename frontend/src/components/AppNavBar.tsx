import { useNavigate, useLocation } from 'react-router-dom';
import api from '../lib/axios';
import { useAuth } from '../context/useAuth';

const navLinks = [
  { label: 'Home', to: '/home' },
  { label: 'Dishes', to: '/dishes' },
  { label: 'Guests', to: '/guests' },
  { label: 'Meals', to: '/meals' }
];

const AppNavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { clearAuth } = useAuth();

  function logout() {
    clearAuth();
    api.post('/auth/revoke').catch(() => {
      // ignore network errors during logout
    }).finally(() => {
      navigate('/login');
    });
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/60 bg-[#fdf4e3]/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 text-[#3f2a1d] lg:px-12">
        <button
          type="button"
          onClick={() => navigate('/home')}
          className="text-xs font-semibold uppercase tracking-[0.35em] text-[#a77044] transition hover:text-[#2b1c12]"
        >
          Meal planner
        </button>

        <nav className="hidden items-center gap-6 text-sm font-medium text-[#6f5440] lg:flex">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <button
                type="button"
                key={link.to}
                onClick={() => navigate(link.to)}
                className={`relative transition hover:text-[#2b1c12] ${isActive ? 'text-[#2b1c12]' : ''}`}
              >
                {link.label}
                {isActive && <span className="absolute -bottom-1 left-1/2 h-[2px] w-6 -translate-x-1/2 rounded-full bg-[#d37655]"></span>}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center gap-2 rounded-full border border-[#d37655]/30 px-4 py-2 text-sm font-semibold text-[#d37655] transition hover:bg-[#fbe0d4]"
          >
            Log out
          </button>
        </div>
      </div>
    </header>
  );
};

export default AppNavBar;