import { Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import DishesPage from './pages/DishesPage';
import GuestsPage from './pages/GuestsPage';
import MealsPage from './pages/MealsPage';

const App = () => {
  return (
    <div data-theme="retro">
      <Routes>
        <Route path="/" element={<HomePage />}/>
        <Route path="/dishes" element={<DishesPage />}/>
        <Route path="/guests" element={<GuestsPage />}/>
        <Route path="/meals" element={<MealsPage />}/>
      </Routes>
    </div>
  )
}

export default App