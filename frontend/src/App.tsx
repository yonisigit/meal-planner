import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import AppNavBar from './components/AppNavBar';
import HomePage from './pages/HomePage';
import DishesPage from './pages/DishesPage';
import GuestsPage from './pages/GuestsPage';
import MealsPage from './pages/MealsPage';
import LoginPage from './pages/LoginPage';

const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={(
          <ProtectedRoute>
            <PageShell>
              <HomePage />
            </PageShell>
          </ProtectedRoute>
        )}
      />
      <Route
        path="/home"
        element={<Navigate to="/" replace />}
      />
      <Route
        path="/dishes"
        element={(
          <ProtectedRoute>
            <PageShell>
              <DishesPage />
            </PageShell>
          </ProtectedRoute>
        )}
      />
      <Route
        path="/guests"
        element={(
          <ProtectedRoute>
            <PageShell>
              <GuestsPage />
            </PageShell>
          </ProtectedRoute>
        )}
      />
      <Route
        path="/meals"
        element={(
          <ProtectedRoute>
            <PageShell>
              <MealsPage />
            </PageShell>
          </ProtectedRoute>
        )}
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { accessToken, isInitializing } = useAuth();
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    if (isInitializing) {
      setShouldRedirect(false);
      return;
    }
    // debounce redirects to avoid brief flicker when tokens refresh
    if (!accessToken) {
      const t = setTimeout(() => setShouldRedirect(true), 300);
      return () => clearTimeout(t);
    }
    setShouldRedirect(false);
  }, [accessToken, isInitializing]);

  if (isInitializing) {
    return null;
  }
  if (!accessToken && shouldRedirect) {
    return <Navigate to="/login" replace />;
  }
  if (!accessToken) {
    // still waiting on debounce; render nothing to avoid mounting protected UI
    return null;
  }
  return <>{children}</>;
};

const PageShell = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen bg-[#fdf4e3]">
      <AppNavBar />
      <main>{children}</main>
    </div>
  );
};