function Flourish({ flip = false }: { flip?: boolean }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 400 40"
      className={`h-4 w-[68vw] max-w-[420px] ${flip ? "rotate-180" : ""}`}
    >
      <defs>
        <linearGradient id="pa-gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F7E7A1" />
          <stop offset="45%" stopColor="#D4AF37" />
          <stop offset="100%" stopColor="#8A6A16" />
        </linearGradient>
      </defs>
      <g fill="none" stroke="url(#pa-gold)" strokeLinecap="round">
        <path d="M8 26 C 70 26, 120 22, 175 14" strokeWidth="2.2" />
        <path d="M392 26 C 330 26, 280 22, 225 14" strokeWidth="2.2" />
        <path d="M150 22 C 168 30, 186 30, 200 20 C 214 30, 232 30, 250 22" strokeWidth="2.6" />
        <path d="M120 20 C 130 12, 142 12, 150 20" strokeWidth="1.4" />
        <path d="M280 20 C 270 12, 258 12, 250 20" strokeWidth="1.4" />
      </g>
      <path d="M200 6 L206 18 L200 30 L194 18 Z" fill="url(#pa-gold)" />
    </svg>
  );
}

export function ParkAmbassadorsTitle() {
  return (
    <div className="flex flex-col items-center justify-center select-none">
      <Flourish />
      <h2
        className="-my-1 text-center font-serif leading-[0.9] tracking-[0.02em]"
        style={{
          color: "oklch(0.14 0 0)",
          WebkitTextStroke: "0.9px var(--gold)",
          textShadow: "0 1px 0 rgba(212,175,55,0.35), 0 6px 18px rgba(0,0,0,0.7)",
        }}
      >
        <span className="block text-[7vw]">Park</span>
        <span className="block text-[10vw]">Ambassadors</span>
      </h2>
      <Flourish flip />
    </div>
  );
}
