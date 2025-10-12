import { useNavigate, useLocation } from 'react-router-dom';
import api from '../lib/axios';
import { useAuth } from '../context/AuthContext';

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

  function goHome() {
    navigate('/home');
  }

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
          onClick={goHome}
          className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/80 px-4 py-2 text-sm font-semibold text-[#a15a38] shadow-[0_12px_30px_-18px_rgba(167,112,68,0.65)] transition hover:-translate-y-0.5"
        >
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#d37655]/80 text-white">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <path d="M3 11.5 12 4l9 7.5" />
              <path d="M5 10.5V20h14v-9.5" />
            </svg>
          </span>
          Home
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