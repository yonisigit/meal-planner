import React from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-6 gap-8 bg-base-200">
      <div className="grid grid-cols-2 gap-8 w-full max-w-2xl">
        <button
          className="w-full h-40 text-2xl font-semibold rounded-lg bg-brown-dark text-white shadow-md"
          onClick={() => navigate('/dishes')}
          aria-label="Go to Dishes"
        >
          Dishes
        </button>
        <button
          className="w-full h-40 text-2xl font-semibold rounded-lg bg-brown-dark text-white shadow-md"
          onClick={() => navigate('/guests')}
          aria-label="Go to Guests"
        >
          Guests
        </button>
      </div>
  <div className="flex w-full max-w-2xl justify-center mt-4">
        <button
          className="w-1/2 h-40 text-2xl font-semibold rounded-lg bg-brown-dark text-white shadow-md"
          onClick={() => navigate('/meals')}
          aria-label="Go to Meals"
        >
          Meals
        </button>
      </div>
    </div>
  );
};

export default HomePage;