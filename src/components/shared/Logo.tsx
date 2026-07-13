import { motion } from 'framer-motion';

export function Logo({ className = '', size = 28 }: { className?: string; size?: number }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg viewBox="0 0 32 32" width={size} height={size} fill="none">
          <defs>
            <linearGradient id="lumen-grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
              <stop stopColor="#5eead4" />
              <stop offset="0.5" stopColor="#38bdf8" />
              <stop offset="1" stopColor="#818cf8" />
            </linearGradient>
          </defs>
          <path
            d="M16 2.5 L27.5 9 V23 L16 29.5 L4.5 23 V9 Z"
            stroke="url(#lumen-grad)"
            strokeWidth="1.5"
            fill="rgba(56,189,248,0.06)"
          />
          <path
            d="M16 9 L21 12 V20 L16 23 L11 20 V12 Z"
            fill="url(#lumen-grad)"
            fillOpacity="0.9"
          />
          <circle cx="16" cy="16" r="2" fill="#0a0a0f" />
        </svg>
        <motion.div
          className="absolute inset-0 rounded-full blur-md"
          style={{ background: 'radial-gradient(circle, rgba(56,189,248,0.4), transparent 70%)' }}
          animate={{ opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>
      <span className="text-[17px] font-semibold tracking-tight text-foreground">
        Lumen
      </span>
    </div>
  );
}
