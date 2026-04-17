'use client';

interface SupportAILogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export default function SupportAILogo({ 
  className = '', 
  size = 40,
  showText = true 
}: SupportAILogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Logo Icon - Chat Bubble with AI Sparkle */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        <defs>
          <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#818cf8" />
          </linearGradient>
          <filter id="logo-glow">
            <feGaussianBlur stdDeviation="0.8" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Chat bubble body */}
        <path
          d="M8 8C8 8 8 14 8 18.5C8 22.5 10 25.5 13 25.5C13 25.5 17.5 27 17.5 27L32 32V18C32 8.5 21 4 13 4C8.5 4 5 6.5 4.5 10L8 8Z"
          fill="url(#logo-gradient)"
          filter="url(#logo-glow)"
        />
        
        {/* AI sparkle star */}
        <g fill="#ffffff" filter="url(#logo-glow)">
          <path d="M20 13L20.5 15L22 15.5L21 17L21.5 19L20 18L18.5 19L19 17L18 15.5L19.5 15L20 13Z" />
          <path d="M25 14L25.5 16L27 16.5L26 18.5L26.5 20.5L25 19.5L23.5 20.5L24 18.5L23 16.5L24.5 16L25 14Z" opacity="0.7"/>
          <path d="M15 14L15.5 16L17 16.5L16 18.5L16.5 20.5L15 19.5L13.5 20.5L14 18.5L13 16.5L14.5 16L15 14Z" opacity="0.7"/>
        </g>
      </svg>
      
      {/* Text Label */}
      {showText && (
        <span className="text-xl font-bold gradient-text tracking-tight">
          SupportAI
        </span>
      )}
    </div>
  );
}
