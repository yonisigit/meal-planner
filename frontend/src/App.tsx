import type { ReactNode } from 'react';
import { Route, Routes } from 'react-router-dom';
import AppNavBar from './components/AppNavBar';
import HomePage from './pages/HomePage';
import DishesPage from './pages/DishesPage';
import GuestsPage from './pages/GuestsPage';
import MealsPage from './pages/MealsPage';
import LoginPage from './pages/LoginPage';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/home"
        element={(
          <PageShell>
            <HomePage />
          </PageShell>
        )}
      />
      <Route
        path="/dishes"
        element={(
          <PageShell>
            <DishesPage />
          </PageShell>
        )}
      />
      <Route
        path="/guests"
        element={(
          <PageShell>
            <GuestsPage />
          </PageShell>
        )}
      />
      <Route
        path="/meals"
        element={(
          <PageShell>
            <MealsPage />
          </PageShell>
        )}
      />
    </Routes>
  );
};

export default App;

const PageShell = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen bg-[#fdf4e3]">
      <AppNavBar />
      <main>{children}</main>
    </div>
  );
};