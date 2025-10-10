import { useNavigate } from 'react-router-dom';

type Props = {
  className?: string;
  ariaLabel?: string;
};

export default function HomeButton({ className = '', ariaLabel = 'Go to home' }: Props) {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      className={`absolute top-6 right-6 inline-flex items-center gap-2 rounded-full border border-white/50 bg-white/70 px-5 py-2 text-sm font-medium text-[#a15a38] shadow-glow transition duration-200 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d37655]/60 ${className}`}
      onClick={() => navigate('/home')}
      aria-label={ariaLabel}
      title={ariaLabel}
    >
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#d37655]/90 text-white">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
          <path d="M3 11.5 12 4l9 7.5" />
          <path d="M5 10.5V20h14v-9.5" />
        </svg>
      </span>
      Home
    </button>
  );
}
