import { motion } from 'framer-motion';

export function AuroraBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {}
      <div className="absolute inset-0 bg-background" />

      {}
      <div className="absolute inset-0 bg-grid mask-fade-b opacity-40" />

      {}
      <motion.div
        className="absolute -top-40 left-1/4 h-[36rem] w-[36rem] rounded-full blur-[120px]"
        style={{ background: 'radial-gradient(circle, rgba(56,189,248,0.18), transparent 70%)' }}
        animate={{ x: [0, 80, 0], y: [0, 40, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute top-1/3 -right-40 h-[40rem] w-[40rem] rounded-full blur-[140px]"
        style={{ background: 'radial-gradient(circle, rgba(94,234,212,0.14), transparent 70%)' }}
        animate={{ x: [0, -60, 0], y: [0, 60, 0], scale: [1, 1.15, 1] }}
        transition={{ duration: 24, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-0 left-1/3 h-[32rem] w-[32rem] rounded-full blur-[120px]"
        style={{ background: 'radial-gradient(circle, rgba(129,140,248,0.12), transparent 70%)' }}
        animate={{ x: [0, 50, 0], y: [0, -30, 0], scale: [1, 1.08, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />

      {}
      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(56,189,248,0.5), transparent)' }}
      />

      {}
      <div
        className="absolute inset-0 opacity-[0.015] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' /%3E%3C/svg%3E\")",
        }}
      />
    </div>
  );
}
