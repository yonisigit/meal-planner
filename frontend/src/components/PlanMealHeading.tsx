const PlanHeading = ({ className = '' }: { className?: string }) => {
  return (
    <div className={`space-y-1 ${className}`}>
      <span className="text-xs font-semibold uppercase tracking-[0.4em] text-[#a77044]">Host toolkit</span>
      <h2 className="text-3xl font-semibold tracking-tight text-[#2b1c12]">Plan your meal</h2>
    </div>
  );
};

export default PlanHeading;
