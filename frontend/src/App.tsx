import { Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import DishesPage from './pages/DishesPage';
import GuestsPage from './pages/GuestsPage';
import MealsPage from './pages/MealsPage';
import LoginPage from './pages/LoginPage';

const App = () => {
  return (
    <div data-theme="retro">
      <Routes>
  <Route path="/" element={<LoginPage />}/>
  <Route path="/home" element={<HomePage />}/>
        <Route path="/dishes" element={<DishesPage />}/>
        <Route path="/guests" element={<GuestsPage />}/>
        <Route path="/meals" element={<MealsPage />}/>
  <Route path="/login" element={<LoginPage />}/>
      </Routes>
    </div>
  )
}

export default App