interface LogoProps {
  size?: number;
  className?: string;
}

export default function Logo({ size = 32, className = '' }: LogoProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 32 32" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="coralGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#4f46e5" />
        </linearGradient>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      
      {/* Central Node */}
      <circle cx="16" cy="16" r="6" fill="url(#coralGrad)" filter="url(#glow)" />
      
      {/* Outer Nodes / Coral Branches */}
      <circle cx="8" cy="10" r="3" fill="#a5b4fc" />
      <circle cx="24" cy="10" r="3" fill="#a5b4fc" />
      <circle cx="16" cy="4" r="2.5" fill="#c7d2fe" />
      <circle cx="8" cy="22" r="3" fill="#a5b4fc" />
      <circle cx="24" cy="22" r="3" fill="#a5b4fc" />
      <circle cx="16" cy="28" r="2.5" fill="#c7d2fe" />

      {/* Connections */}
      <path d="M16 10 L16 6.5" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" />
      <path d="M11 13 L8.5 11" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" />
      <path d="M21 13 L23.5 11" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" />
      <path d="M11 19 L8.5 21" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" />
      <path d="M21 19 L23.5 21" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" />
      <path d="M16 22 L16 25.5" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
