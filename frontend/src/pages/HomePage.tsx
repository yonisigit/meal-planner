import React from 'react';
import PlanHeading from '../components/PlanMealHeading';
import NavButton from '../components/HomePageNavButton';

const HomePage: React.FC = () => {
    return (  
    <div className="min-h-screen flex flex-col justify-center items-center p-6 gap-8 bg-base-200">
      <div className="mb-2 text-center">
        <PlanHeading />
      </div>
      <div className="grid grid-cols-2 gap-8 w-full max-w-2xl mt-2">
          <NavButton label="Dishes" to="/dishes" aria-label="Go to Dishes" />
          <NavButton label="Guests" to="/guests" aria-label="Go to Guests" />
      </div>
      <div className="flex w-full max-w-2xl justify-center mt-4">
        <div className="w-1/2">
          <NavButton label="Meals" to="/meals" aria-label="Go to Meals" />
        </div>
      </div>
    </div>
  );
};

export default HomePage;