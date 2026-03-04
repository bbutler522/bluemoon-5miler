'use client';

export function Moon({ className = '' }: { className?: string }) {
  return (
    <div className={`relative ${className}`}>
      {/* Outer glow */}
      <div className="absolute inset-0 rounded-full bg-gradient-radial from-lunar-300/20 via-lunar-400/5 to-transparent scale-150 animate-pulse-glow" />

      {/* Moon body */}
      <svg viewBox="0 0 200 200" className="w-full h-full relative z-10">
        <defs>
          <radialGradient id="moonGradient" cx="40%" cy="35%" r="50%">
            <stop offset="0%" stopColor="#f0f2fa" />
            <stop offset="60%" stopColor="#d8ddf0" />
            <stop offset="100%" stopColor="#b8c0d8" />
          </radialGradient>
          <radialGradient id="craterGradient" cx="45%" cy="40%" r="50%">
            <stop offset="0%" stopColor="#c8ccdd" />
            <stop offset="100%" stopColor="#b0b8d0" />
          </radialGradient>
          <filter id="moonGlow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Moon circle */}
        <circle cx="100" cy="100" r="88" fill="url(#moonGradient)" filter="url(#moonGlow)" />

        {/* Craters */}
        <circle cx="70" cy="65" r="12" fill="url(#craterGradient)" opacity="0.3" />
        <circle cx="120" cy="85" r="8" fill="url(#craterGradient)" opacity="0.25" />
        <circle cx="85" cy="120" r="15" fill="url(#craterGradient)" opacity="0.2" />
        <circle cx="130" cy="55" r="6" fill="url(#craterGradient)" opacity="0.2" />
        <circle cx="60" cy="100" r="9" fill="url(#craterGradient)" opacity="0.15" />
        <circle cx="110" cy="130" r="10" fill="url(#craterGradient)" opacity="0.2" />
      </svg>
    </div>
  );
}
