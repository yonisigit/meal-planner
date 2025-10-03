import React from 'react';
import { useNavigate } from 'react-router-dom';

type Props = {
  label: string;
  to: string;
  className?: string;
  'aria-label'?: string;
};

const NavButton: React.FC<Props> = ({ label, to, className = '', ...rest }) => {
  const navigate = useNavigate();
  return (
    <button
      className={`w-full h-40 text-2xl font-semibold rounded-lg btn btn-primary ${className}`}
      onClick={() => navigate(to)}
      {...rest}
    >
      {label}
    </button>
  );
};

export default NavButton;
