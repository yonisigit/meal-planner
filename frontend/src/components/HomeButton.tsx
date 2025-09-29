import { useNavigate } from 'react-router-dom';

type Props = {
  className?: string;
  size?: number; // px
  ariaLabel?: string;
};

export default function HomeButton({ className = '', size = 56, ariaLabel = 'Go to home' }: Props) {
  const navigate = useNavigate();
  const style = { width: size, height: size } as React.CSSProperties;

  return (
    <button
      className={`btn btn-circle btn-ghost absolute top-4 right-4 text-brown-dark ${className}`}
      style={style}
      onClick={() => navigate('/')}
      aria-label={ariaLabel}
      title={ariaLabel}
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
        <path d="M12 3l8 8h-3v7h-10v-7h-3l8-8zm-1 10h2v5h-2v-5z" />
      </svg>
    </button>
  );
}
