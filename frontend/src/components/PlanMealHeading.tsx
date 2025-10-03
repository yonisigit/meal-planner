const PlanHeading = ({ className = '' }: { className?: string }) => {
  return (
    <h1 className={`text-4xl font-extrabold mb-6 ${className}`}>Plan your meal.</h1>
  );
}

export default PlanHeading;
