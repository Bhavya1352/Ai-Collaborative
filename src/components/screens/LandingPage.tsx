import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import {
  ArrowRight,
  Sparkles,
  Zap,
  GitBranch,
  Users,
  Bot,
  Terminal,
  Check,
  Star,
  Command,
  Globe,
  Lock,
  Workflow,
  Cpu,
} from 'lucide-react';
import { Logo } from '@/components/shared/Logo';
import { Button } from '@/components/ui/button';
import type { Screen } from '@/lib/data';

const ease = [0.16, 1, 0.3, 1] as const;

function Nav({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease }}
      className="fixed top-0 inset-x-0 z-50"
    >
      <div className="mx-auto max-w-6xl px-6 mt-4">
        <div className="glass-strong rounded-2xl px-4 sm:px-6 h-14 flex items-center justify-between">
          <Logo />
          <nav className="hidden md:flex items-center gap-1 text-sm text-muted-foreground">
            {['Features', 'AI', 'Pricing', 'Docs', 'Changelog'].map((item) => (
              <a
                key={item}
                href="#"
                className="px-3 py-1.5 rounded-lg hover:text-foreground hover:bg-white/5 transition-colors"
              >
                {item}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="hidden sm:flex text-muted-foreground hover:text-foreground"
              onClick={() => onNavigate('dashboard')}
            >
              Sign in
            </Button>
            <Button
              size="sm"
              className="bg-foreground text-background hover:bg-foreground/90 group"
              onClick={() => onNavigate('dashboard')}
            >
              Get started
              <ArrowRight className="ml-1.5 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Button>
          </div>
        </div>
      </div>
    </motion.header>
  );
}

function Hero({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section ref={ref} className="relative min-h-screen flex items-center justify-center px-6 pt-24">
      <motion.div style={{ y, opacity }} className="relative z-10 max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease }}
          className="inline-flex items-center gap-2 glass rounded-full pl-1.5 pr-3 py-1.5 mb-8 text-xs text-muted-foreground"
        >
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 text-primary px-2 py-0.5 font-medium">
            <Sparkles className="h-3 w-3" />
            New
          </span>
          Lumen 2.0 — agentic refactors across your whole repo
          <ArrowRight className="h-3 w-3" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease, delay: 0.05 }}
          className="text-5xl sm:text-6xl md:text-7xl font-semibold tracking-tight leading-[1.05]"
        >
          The code editor that
          <br />
          <span className="text-gradient-brand">thinks with you.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease, delay: 0.12 }}
          className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
        >
          Lumen pairs a deeply integrated AI copilot with real-time multiplayer editing.
          Ship features, not boilerplate — together, at the speed of thought.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease, delay: 0.2 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <Button
            size="lg"
            className="group h-12 px-6 bg-foreground text-background hover:bg-foreground/90"
            onClick={() => onNavigate('editor')}
          >
            <Command className="mr-2 h-4 w-4" />
            Open the editor
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-12 px-6 glass border-white/10 hover:bg-white/5"
            onClick={() => onNavigate('dashboard')}
          >
            View dashboard
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-8 flex items-center justify-center gap-6 text-xs text-muted-foreground"
        >
          <div className="flex items-center gap-1.5">
            <Check className="h-3.5 w-3.5 text-primary" />
            Free for individuals
          </div>
          <div className="flex items-center gap-1.5">
            <Check className="h-3.5 w-3.5 text-primary" />
            No credit card
          </div>
          <div className="hidden sm:flex items-center gap-1.5">
            <Check className="h-3.5 w-3.5 text-primary" />
            SOC 2 Type II
          </div>
        </motion.div>
      </motion.div>

      {/* Floating editor preview */}
      <motion.div
        initial={{ opacity: 0, y: 60, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1, ease, delay: 0.35 }}
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[92%] max-w-5xl"
      >
        <EditorPreview />
      </motion.div>
    </section>
  );
}

function EditorPreview() {
  return (
    <div className="glass-strong rounded-t-2xl overflow-hidden shadow-2xl">
      {/* Title bar */}
      <div className="h-9 flex items-center gap-2 px-4 border-b border-white/5">
        <div className="flex gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
          <div className="h-2.5 w-2.5 rounded-full bg-yellow-400/70" />
          <div className="h-2.5 w-2.5 rounded-full bg-green-400/70" />
        </div>
        <div className="mx-auto text-[11px] text-muted-foreground font-mono">
          atlas-engine — engine/index.ts
        </div>
      </div>
      <div className="grid grid-cols-12 h-[280px] sm:h-[340px]">
        {/* File explorer */}
        <div className="col-span-3 hidden sm:flex flex-col border-r border-white/5 p-3 text-xs">
          <div className="text-muted-foreground/60 mb-2 uppercase tracking-wider text-[10px]">Explorer</div>
          {['src', '  engine', '    index.ts', '    resolver.ts', '  components', 'tests', 'package.json'].map((f, i) => (
            <div
              key={i}
              className={`px-2 py-1 rounded font-mono ${
                f.includes('index.ts') ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-white/5'
              }`}
            >
              {f.trimStart()}
            </div>
          ))}
        </div>
        {/* Code area */}
        <div className="col-span-12 sm:col-span-9 p-4 font-mono text-[11px] sm:text-xs leading-relaxed overflow-hidden">
          <CodeBlock />
        </div>
      </div>
    </div>
  );
}

function CodeBlock() {
  const lines = [
    { t: 'import { createEngine } from "./core";', c: 'text-muted-foreground' },
    { t: 'import { CRDT } from "./crdt";', c: 'text-muted-foreground' },
    { t: '', c: '' },
    { t: 'export function init(doc: Doc) {', c: 'text-foreground' },
    { t: '  const engine = createEngine({', c: 'text-foreground' },
    { t: '    doc, presence: { throttle: 16 },', c: 'text-sky-300' },
    { t: '    awareness: true,', c: 'text-sky-300' },
    { t: '  });', c: 'text-foreground' },
    { t: '', c: '' },
    { t: '  engine.on("update", (ops) => {', c: 'text-foreground' },
    { t: '    CRDT.merge(doc, ops);', c: 'text-teal-300' },
    { t: '    engine.flush();', c: 'text-teal-300' },
    { t: '  });', c: 'text-foreground' },
    { t: '', c: '' },
    { t: '  return engine;', c: 'text-amber-300' },
    { t: '}', c: 'text-foreground' },
  ];
  return (
    <div className="space-y-0.5">
      {lines.map((l, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 + i * 0.04, duration: 0.3 }}
          className="flex"
        >
          <span className="w-7 text-muted-foreground/30 select-none">{i + 1}</span>
          <span className={l.c}>{l.t || ' '}</span>
        </motion.div>
      ))}
    </div>
  );
}

function BentoGrid() {
  return (
    <section className="relative px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          tag="Capabilities"
          title="Everything you need. Nothing you don't."
          subtitle="A tightly integrated surface where AI, multiplayer, and your codebase live as one."
        />
        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[minmax(0,1fr)]">
          {/* Big card */}
          <BentoCard className="md:col-span-2 md:row-span-2">
            <div className="flex flex-col h-full">
              <FeatureIcon icon={Bot} color="#38bdf8" />
              <h3 className="mt-5 text-xl font-semibold">Agentic refactoring</h3>
              <p className="mt-2 text-sm text-muted-foreground max-w-md">
                Describe a change in plain language. Lumen plans the diff, opens the files,
                and submits a reviewable PR — across your entire repo.
              </p>
              <div className="mt-auto pt-6">
                <AgenticVisual />
              </div>
            </div>
          </BentoCard>

          <BentoCard>
            <FeatureIcon icon={Users} color="#5eead4" />
            <h3 className="mt-5 text-lg font-semibold">Multiplayer editing</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              See cursors, selections, and presence in real time. Conflict-free CRDT sync.
            </p>
          </BentoCard>

          <BentoCard>
            <FeatureIcon icon={Zap} color="#fbbf24" />
            <h3 className="mt-5 text-lg font-semibold">Instant context</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Your whole codebase indexed in &lt;200ms. No copy-paste, no lost threads.
            </p>
          </BentoCard>

          <BentoCard className="md:col-span-2">
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="flex-1">
                <FeatureIcon icon={Workflow} color="#a78bfa" />
                <h3 className="mt-5 text-lg font-semibold">Command palette everywhere</h3>
                <p className="mt-2 text-sm text-muted-foreground max-w-sm">
                  Jump to files, run AI actions, trigger deploys, and search docs — all
                  without leaving the keyboard.
                </p>
              </div>
              <div className="flex-1 flex items-end">
                <PaletteVisual />
              </div>
            </div>
          </BentoCard>

          <BentoCard>
            <FeatureIcon icon={Lock} color="#fb7185" />
            <h3 className="mt-5 text-lg font-semibold">Private by default</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Your code never trains foundation models. SOC 2 Type II, SSO, and audit logs.
            </p>
          </BentoCard>

          <BentoCard>
            <FeatureIcon icon={Globe} color="#38bdf8" />
            <h3 className="mt-5 text-lg font-semibold">Edge-native deploys</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Ship to 14 regions in one click with zero-downtime rollouts.
            </p>
          </BentoCard>
        </div>
      </div>
    </section>
  );
}

function BentoCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, ease }}
      className={`glass rounded-2xl p-6 relative overflow-hidden group hover:bg-white/[0.05] transition-colors ${className}`}
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
      </div>
      <div className="relative h-full">{children}</div>
    </motion.div>
  );
}

function FeatureIcon({ icon: Icon, color }: { icon: React.ElementType; color: string }) {
  return (
    <div className="relative">
      <div
        className="h-11 w-11 rounded-xl flex items-center justify-center border border-white/10"
        style={{ background: `${color}15` }}
      >
        <Icon className="h-5 w-5" style={{ color }} />
      </div>
      <div
        className="absolute inset-0 rounded-xl blur-lg opacity-40"
        style={{ background: color }}
      />
    </div>
  );
}

function AgenticVisual() {
  const steps = ['Analyze repo', 'Plan diff', 'Open files', 'Submit PR'];
  return (
    <div className="glass rounded-xl p-4 space-y-2.5">
      {steps.map((s, i) => (
        <motion.div
          key={s}
          initial={{ opacity: 0, x: -10 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.12, duration: 0.4 }}
          className="flex items-center gap-3 text-xs"
        >
          <div className="h-5 w-5 rounded-full bg-primary/15 flex items-center justify-center">
            <Check className="h-3 w-3 text-primary" />
          </div>
          <span className="text-muted-foreground">{s}</span>
          {i === steps.length - 1 && (
            <span className="ml-auto text-[10px] text-primary font-medium">done</span>
          )}
        </motion.div>
      ))}
    </div>
  );
}

function PaletteVisual() {
  return (
    <div className="glass rounded-xl p-3 w-full text-xs space-y-1.5">
      <div className="flex items-center gap-2 text-muted-foreground pb-1.5 border-b border-white/5">
        <Command className="h-3 w-3" />
        <span className="font-mono">refactor authentication flow</span>
      </div>
      {['Run agent on this file', 'Generate unit tests', 'Explain selection'].map((c, i) => (
        <div
          key={c}
          className={`px-2 py-1.5 rounded-md flex items-center gap-2 ${
            i === 0 ? 'bg-primary/10 text-primary' : 'text-muted-foreground'
          }`}
        >
          <Sparkles className="h-3 w-3" />
          {c}
        </div>
      ))}
    </div>
  );
}

function SectionHeading({ tag, title, subtitle }: { tag: string; title: string; subtitle?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease }}
      className="max-w-2xl"
    >
      <div className="text-xs font-medium text-primary uppercase tracking-widest mb-3">{tag}</div>
      <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight leading-tight">{title}</h2>
      {subtitle && <p className="mt-4 text-lg text-muted-foreground">{subtitle}</p>}
    </motion.div>
  );
}

function AISection() {
  const features = [
    { icon: Cpu, title: 'Repo-wide understanding', body: 'Lumen builds a semantic graph of your entire codebase, so suggestions account for every dependency.' },
    { icon: Terminal, title: 'Inline completions', body: 'Tab to accept multi-line edits that match your style guide. Ghost text that actually finishes your thought.' },
    { icon: GitBranch, title: 'Review-aware', body: 'AI comments on PRs with the context of your architecture decisions, not generic platitudes.' },
  ];
  return (
    <section className="relative px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <SectionHeading
            tag="AI, done right"
            title="An assistant that knows your codebase."
            subtitle="Not a chatbot bolted on. Lumen's AI is woven into every surface — the editor, the palette, the review."
          />
          <div className="mt-10 space-y-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1, ease }}
                className="flex gap-4"
              >
                <div className="h-10 w-10 shrink-0 rounded-xl glass flex items-center justify-center">
                  <f.icon className="h-4.5 w-4.5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">{f.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{f.body}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease }}
          className="glass-strong rounded-2xl p-5 relative"
        >
          <div className="absolute -top-20 -right-20 h-48 w-48 rounded-full bg-primary/15 blur-3xl" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center">
                <Sparkles className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="text-sm font-medium">Lumen Assistant</span>
              <span className="ml-auto text-[10px] text-muted-foreground">thinking…</span>
            </div>
            <div className="space-y-3 text-sm">
              <div className="glass rounded-lg p-3 text-muted-foreground">
                Refactor the auth middleware to use passkeys and add tests.
              </div>
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="rounded-lg p-3 bg-primary/5 border border-primary/20"
              >
                <div className="text-xs text-primary mb-2 font-medium">Plan · 4 steps</div>
                {[
                  'Extract session validation to /lib/auth',
                  'Add WebAuthn registration handler',
                  'Wire passkey challenge endpoint',
                  'Generate 12 integration tests',
                ].map((s, i) => (
                  <motion.div
                    key={s}
                    initial={{ opacity: 0, x: -8 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                    className="flex items-center gap-2 text-xs py-1"
                  >
                    <Check className="h-3 w-3 text-primary" />
                    <span className="text-foreground/80">{s}</span>
                  </motion.div>
                ))}
              </motion.div>
              <div className="flex gap-2">
                <Button size="sm" className="h-8 text-xs bg-primary text-primary-foreground hover:bg-primary/90">
                  Apply changes
                </Button>
                <Button size="sm" variant="ghost" className="h-8 text-xs text-muted-foreground">
                  Open in editor
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Stats() {
  const stats = [
    { value: '2.4M+', label: 'Developers' },
    { value: '180ms', label: 'Avg. index time' },
    { value: '99.99%', label: 'Uptime' },
    { value: '14', label: 'Edge regions' },
  ];
  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-5xl glass rounded-2xl px-8 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            className="text-center"
          >
            <div className="text-3xl sm:text-4xl font-semibold tracking-tight text-gradient-brand">{s.value}</div>
            <div className="mt-1 text-xs text-muted-foreground uppercase tracking-wider">{s.label}</div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function Testimonials() {
  const items = [
    { quote: 'It replaced three tools and an internal script. Our PR cycle dropped from days to hours.', name: 'Aria Mehta', role: 'Staff Eng, Vercel' },
    { quote: 'The multiplayer editing is the first that actually feels native, not bolted on.', name: 'Jonas Weber', role: 'Tech Lead, Linear' },
    { quote: 'Agentic refactors across our 400k-line monorepo — and it opens a reviewable PR. Wild.', name: 'Priya Nair', role: 'Principal, Razorpay' },
  ];
  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <SectionHeading tag="Loved by builders" title="Trusted by teams who ship." />
        <div className="mt-12 grid md:grid-cols-3 gap-4">
          {items.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="glass rounded-2xl p-6 flex flex-col"
            >
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star key={j} className="h-3.5 w-3.5 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-sm text-foreground/90 leading-relaxed flex-1">"{t.quote}"</p>
              <div className="mt-5 pt-4 border-t border-white/5">
                <div className="text-sm font-medium">{t.name}</div>
                <div className="text-xs text-muted-foreground">{t.role}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  return (
    <section className="px-6 py-24 sm:py-32">
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease }}
        className="mx-auto max-w-4xl glass-strong rounded-3xl px-8 py-16 sm:py-20 text-center relative overflow-hidden"
      >
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-64 w-96 rounded-full bg-primary/20 blur-[100px]" />
        <div className="relative">
          <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight">
            Start building in <span className="text-gradient-brand">seconds.</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-md mx-auto">
            Pull in a repo, invite your team, and let Lumen handle the rest.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              size="lg"
              className="h-12 px-7 bg-foreground text-background hover:bg-foreground/90 group"
              onClick={() => onNavigate('editor')}
            >
              Open the editor
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 px-7 glass border-white/10"
              onClick={() => onNavigate('dashboard')}
            >
              Go to dashboard
            </Button>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

function Footer() {
  const cols = [
    { title: 'Product', links: ['Features', 'AI', 'Pricing', 'Changelog', 'Roadmap'] },
    { title: 'Company', links: ['About', 'Blog', 'Careers', 'Press', 'Contact'] },
    { title: 'Resources', links: ['Docs', 'API', 'Community', 'Status', 'Security'] },
    { title: 'Legal', links: ['Privacy', 'Terms', 'DPA', 'Sub-processors'] },
  ];
  return (
    <footer className="px-6 pb-10 pt-16 border-t border-white/5">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8">
          <div className="col-span-2">
            <Logo />
            <p className="mt-4 text-sm text-muted-foreground max-w-xs">
              The AI-native code editor for teams who ship at the speed of thought.
            </p>
          </div>
          {cols.map((c) => (
            <div key={c.title}>
              <div className="text-xs font-medium text-foreground mb-3">{c.title}</div>
              <ul className="space-y-2">
                {c.links.map((l) => (
                  <li key={l}>
                    <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">© 2026 Lumen Labs, Inc. All rights reserved.</p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              All systems operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export function LandingPage({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  return (
    <div className="relative">
      <Nav onNavigate={onNavigate} />
      <Hero onNavigate={onNavigate} />
      <BentoGrid />
      <AISection />
      <Stats />
      <Testimonials />
      <CTA onNavigate={onNavigate} />
      <Footer />
    </div>
  );
}
