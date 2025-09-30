import HomeButton from '../components/HomeButton';
import api from '../lib/axios';
import { useEffect, useState } from 'react';
import type { AxiosResponse } from 'axios';

type Meal = {
  id: string;
  name: string;
  description?: string;
};

const MealsPage = () => {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get('/meals')
      .then((res: AxiosResponse) => {
        setMeals(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError('Error fetching meals');
        setLoading(false);
      });
  }, []);

  return (
    <div className="relative min-h-screen">
      <HomeButton />
      <div className="pt-12">
        <h2 className="text-2xl font-bold mb-4">Meals</h2>
        {loading && <div>Loading meals...</div>}
        {error && <div className="text-red-500">{error}</div>}
        {!loading && !error && <MealList meals={meals} />}
      </div>
    </div>
  );
}

const MealList = ({ meals }: { meals: Meal[] }) => {
  if (!meals || meals.length === 0) {
    return <div>No meals found.</div>;
  }
  return (
    <ul className="list-disc pl-6">
      {meals.map(meal => (
        <li key={meal.id} className="mb-2">
          <span className="font-semibold">{meal.name}</span>
          {meal.description && <span className="ml-2 text-gray-500">{meal.description}</span>}
        </li>
      ))}
    </ul>
  );
};

export default MealsPage;