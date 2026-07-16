import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import type { Screen } from '@/lib/data';
import {
  Sparkles,
  Menu,
  X,
  Users,
  RefreshCw,
  FileCode,
  ArrowRight,
} from 'lucide-react';

const ease = [0.16, 1, 0.3, 1] as const;

// Friendly, simple code snippets database for the editor simulator
const fileSnippets = {
  'hello.ts': {
    lang: 'typescript',
    lines: [
      `// hello.ts - Say hi to your team`,
      `export function greetUser(name: string) {`,
      `  return "Hello, " + name + "!";`,
      `}`
    ],
    refactored: [
      `// hello.ts - Say hi to your team (AI Cleaned)`,
      `export function greetUser(name: string) {`,
      `  // Welcomes teammate names with a friendly wave emoji`,
      `  return \`Welcome to Lumen, \${name}! 👋\`;`,
      `}`
    ]
  },
  'math.js': {
    lang: 'javascript',
    lines: [
      `// math.js - Add numbers`,
      `function sumValues(a, b) {`,
      `  return a + b;`,
      `}`
    ],
    refactored: [
      `// math.js - Add numbers (AI Cleaned)`,
      `function sumValues(a, b) {`,
      `  // Automatically ensures inputs are parsed as numbers`,
      `  return (Number(a) || 0) + (Number(b) || 0);`,
      `}`
    ]
  },
  'main.py': {
    lang: 'python',
    lines: [
      `# main.py - Access check`,
      `def check_status(user):`,
      `    if user == 'admin':`,
      `        return 'Access granted'`,
      `    return 'Access denied'`
    ],
    refactored: [
      `# main.py - Access check (Refactored)`,
      `def check_status(user):`,
      `    # Simplified into a modern inline check statement`,
      `    return 'Access granted' if user == 'admin' else 'Access denied'`
    ]
  }
};

function Nav({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <motion.header
        initial={{ y: -8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease }}
        className="fixed top-0 inset-x-0 z-50 px-4 sm:px-6 lg:px-8 py-4 bg-[#faf8f5]/90 backdrop-blur-md border-b-2 border-[#18181b]"
      >
        <div className="mx-auto max-w-6xl flex items-center justify-between">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => onNavigate('landing')}
          >
            <div className="bg-[#18181b] text-[#faf8f5] px-2.5 py-1 rounded font-mono font-bold text-sm tracking-wide border border-[#18181b]">
              L✦
            </div>
            <span className="font-serif italic text-2xl font-bold tracking-tight text-[#18181b]">
              Lumen
            </span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-6 font-mono text-[11px] text-zinc-600 font-bold uppercase tracking-wider">
            <a href="#demo" className="hover:text-[#18181b] hover:underline underline-offset-4 decoration-2 decoration-[#18181b] transition-all">
              Try Demo
            </a>
            <a href="#features" className="hover:text-[#18181b] hover:underline underline-offset-4 decoration-2 decoration-[#18181b] transition-all">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-[#18181b] hover:underline underline-offset-4 decoration-2 decoration-[#18181b] transition-all">
              How it works
            </a>
          </nav>

          <div className="hidden lg:flex items-center gap-4">
            <button
              className="px-4 py-2 bg-[#e9dcf8] text-[#18181b] border-2 border-[#18181b] shadow-[2px_2px_0px_0px_#18181b] hover:shadow-[4px_4px_0px_0px_#18181b] hover:-translate-x-0.5 hover:-translate-y-0.5 text-xs font-mono font-bold rounded-lg transition-all"
              onClick={() => onNavigate('dashboard')}
            >
              Open Workspace
            </button>
          </div>

          {/* Mobile menu toggle */}
          <button
            className="lg:hidden border-2 border-[#18181b] p-1.5 rounded-lg bg-white shadow-[2px_2px_0px_0px_#18181b]"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={16} className="text-[#18181b]" /> : <Menu size={16} className="text-[#18181b]" />}
          </button>
        </div>

        {/* Mobile menu dropdown */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="absolute top-18 left-4 right-4 bg-[#faf8f5] border-2 border-[#18181b] shadow-[4px_4px_0px_0px_#18181b] rounded-xl p-5 flex flex-col gap-4 z-40"
            >
              <a href="#demo" onClick={() => setMobileMenuOpen(false)} className="font-mono text-xs font-bold uppercase tracking-wider text-[#18181b] hover:underline underline-offset-4 decoration-2">TRY DEMO</a>
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="font-mono text-xs font-bold uppercase tracking-wider text-[#18181b] hover:underline underline-offset-4 decoration-2">FEATURES</a>
              <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="font-mono text-xs font-bold uppercase tracking-wider text-[#18181b] hover:underline underline-offset-4 decoration-2">HOW IT WORKS</a>
              <div className="flex flex-col gap-2 pt-2 border-t-2 border-[#18181b]/10">
                <button
                  className="w-full py-2 bg-[#e9dcf8] text-[#18181b] border-2 border-[#18181b] shadow-[2px_2px_0px_0px_#18181b] rounded-lg font-mono text-xs font-bold"
                  onClick={() => { setMobileMenuOpen(false); onNavigate('dashboard'); }}
                >
                  Open Workspace
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>
    </>
  );
}


function Hero({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  return (
    <section className="relative bg-[#faf8f5] min-h-[85vh] flex flex-col justify-center px-4 sm:px-6 lg:px-8 pt-32 pb-16 overflow-hidden">
      <div className="mx-auto max-w-5xl w-full text-center space-y-8 z-10">
        <div className="space-y-4 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-1.5 border-2 border-[#18181b] px-3 py-1.5 bg-[#e9dcf8] rounded-full text-[10px] font-mono font-bold tracking-wider text-[#18181b] uppercase shadow-[2px_2px_0px_0px_#18181b]">
            <span>⚡</span>
            <span>Write Code Together, Assisted by AI</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-light tracking-tight text-[#18181b] leading-[1.05] font-serif">
            A simple collaborative <br />
            <span className="font-serif italic text-zinc-600 font-normal">
              web code editor.
            </span>
          </h1>

          <p className="text-xs sm:text-sm md:text-base lg:text-lg text-zinc-600 max-w-2xl mx-auto leading-relaxed font-mono">
            Lumen is a fast web editor where you can write code with your friends in real-time, get instant help from a smart AI assistant, and manage all your projects easily in one place.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 max-w-md mx-auto sm:max-w-none">
          <button
            className="w-full sm:w-auto h-12 px-8 bg-[#18181b] text-[#faf8f5] hover:bg-zinc-800 border-2 border-[#18181b] font-mono text-xs font-bold rounded-xl shadow-[4px_4px_0px_0px_#e9dcf8] hover:shadow-[2px_2px_0px_0px_#e9dcf8] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all"
            onClick={() => onNavigate('dashboard')}
          >
            Launch Free Workspace
          </button>
          <a
            href="#demo"
            className="w-full sm:w-auto h-12 px-8 bg-[#faf8f5] text-[#18181b] hover:bg-[#e9dcf8]/10 border-2 border-[#18181b] font-mono text-xs font-bold rounded-xl flex items-center justify-center shadow-[4px_4px_0px_0px_#18181b] hover:shadow-[2px_2px_0px_0px_#18181b] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all"
          >
            Try IDE Simulator
          </a>
        </div>
      </div>
    </section>
  );
}

// INTERACTIVE SIMULATED IDE DEMO
function EditorSimulator() {
  const [selectedFile, setSelectedFile] = useState<keyof typeof fileSnippets>('hello.ts');
  const [isRefactored, setIsRefactored] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isCompiling, setIsCompiling] = useState(false);
  const [collaboratorsJoined, setCollaboratorsJoined] = useState(false);
  const [cursors, setCursors] = useState<{ name: string; line: number; color: string }[]>([]);

  useEffect(() => {
    setIsRefactored(false);
    setIsTyping(false);
    setIsCompiling(false);
  }, [selectedFile]);

  const handleRefactorSim = () => {
    if (isTyping || isCompiling) return;
    setIsTyping(true);
    
    setTimeout(() => {
      setIsTyping(false);
      setIsRefactored(true);
      setIsCompiling(true);

      setTimeout(() => {
        setIsCompiling(false);
      }, 1500);
    }, 1800);
  };

  const handleMultiplayerSim = () => {
    if (collaboratorsJoined) {
      setCollaboratorsJoined(false);
      setCursors([]);
      return;
    }
    setCollaboratorsJoined(true);
    setCursors([
      { name: 'Sarah (typing)', line: 3, color: '#a855f7' },
      { name: 'Alex', line: 4, color: '#10b981' }
    ]);
  };

  const fileData = fileSnippets[selectedFile];
  const activeLines = isRefactored ? fileData.refactored : fileData.lines;

  return (
    <section id="demo" className="relative bg-[#faf8f5] border-t-2 border-[#18181b] px-4 sm:px-6 lg:px-8 py-20">
      <div className="mx-auto max-w-4xl space-y-12">
        <div className="text-center space-y-3">
          <span className="text-xs font-mono font-bold text-[#18181b] uppercase tracking-widest border-2 border-[#18181b] px-3 py-1.5 bg-[#e9dcf8] rounded-full inline-block shadow-[2px_2px_0px_0px_#18181b]">
            ⚡ Try it out
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-[#18181b] font-serif">
            Test the Editor
          </h2>
          <p className="text-xs sm:text-sm md:text-base font-mono text-zinc-600 max-w-lg mx-auto">
            Click the tabs to change files. Click "AI Refactor" to see the AI assistant instantly edit code.
          </p>
        </div>

        <div className="border-2 border-[#18181b] bg-white rounded-2xl shadow-[6px_6px_0px_0px_#18181b] overflow-hidden flex flex-col">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between border-b-2 border-[#18181b] bg-[#faf8f5] px-4 py-2 gap-2">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {(Object.keys(fileSnippets) as Array<keyof typeof fileSnippets>).map((fileName) => (
                <button
                  key={fileName}
                  onClick={() => setSelectedFile(fileName)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono text-xs font-bold text-left transition-all border ${
                    selectedFile === fileName
                      ? 'bg-[#e9dcf8] text-[#18181b] border-[#18181b]'
                      : 'text-zinc-500 hover:bg-zinc-100 border-transparent'
                  }`}
                >
                  <FileCode size={13} />
                  <span>{fileName}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                onClick={handleRefactorSim}
                disabled={isTyping || isCompiling}
                className="py-1.5 px-3 bg-[#e9dcf8] hover:bg-[#ebd3f8] disabled:opacity-50 text-[#18181b] border-2 border-[#18181b] shadow-[2px_2px_0px_0px_#18181b] hover:shadow-[1px_1px_0px_0px_#18181b] hover:translate-x-[0.5px] hover:translate-y-[0.5px] rounded-lg font-mono text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition-all"
              >
                <Sparkles size={11} className="text-[#18181b]" />
                {isTyping ? 'Writing...' : isCompiling ? 'Validating...' : 'AI Refactor'}
              </button>
              <button
                onClick={handleMultiplayerSim}
                className={`py-1.5 px-3 border-2 border-[#18181b] rounded-lg font-mono text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition-all ${
                  collaboratorsJoined
                    ? 'bg-[#e9dcf8] text-[#18181b] shadow-[1px_1px_0px_0px_#18181b] translate-x-[1px] translate-y-[1px]'
                    : 'bg-white text-zinc-700 hover:bg-zinc-50 shadow-[2px_2px_0px_0px_#18181b]'
                }`}
              >
                <Users size={11} />
                {collaboratorsJoined ? 'Leave Session' : 'Invite Peers'}
              </button>
            </div>
          </div>

          <div className="flex-1 bg-[#faf8f5] p-4 sm:p-6 font-mono text-xs sm:text-sm md:text-base text-zinc-700 flex flex-col justify-between min-h-[250px] relative">
            <div className="space-y-1">
              <div className="flex items-center justify-between pb-3 border-b border-[#18181b]/10 mb-3 text-[10px] text-zinc-500">
                <span className="flex items-center gap-1.5 text-[#18181b] font-bold">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {selectedFile}
                </span>
                <span className="text-[9px] uppercase font-bold text-[#18181b] bg-[#e9dcf8] px-1.5 py-0.5 rounded border border-[#18181b]">
                  {collaboratorsJoined ? '2 peers online' : 'Sandbox mode'}
                </span>
              </div>

              <div className="relative font-mono leading-relaxed space-y-0.5">
                {activeLines.map((line, idx) => {
                  const matchingCursor = cursors.find((c) => c.line === idx + 1);
                  return (
                    <div
                      key={idx}
                      className={`relative flex items-center pl-1 rounded hover:bg-[#e9dcf8]/10 ${
                        isTyping && idx === 3 ? 'bg-[#e9dcf8]/35 text-[#18181b]' : ''
                      }`}
                    >
                      <span className="w-8 shrink-0 text-zinc-400 text-[10px] text-right pr-2 select-none font-bold">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <span className="text-[#18181b] font-semibold whitespace-pre">{line}</span>

                      {matchingCursor && (
                        <div
                          className="absolute left-32 px-1.5 py-0.5 text-[8px] font-sans font-bold border-2 border-[#18181b] rounded flex items-center gap-1 select-none animate-bounce bg-white"
                          style={{
                            color: matchingCursor.color
                          }}
                        >
                          <span className="h-1 w-1 rounded-full bg-current animate-ping" />
                          {matchingCursor.name}
                        </div>
                      )}
                    </div>
                  );
                })}

                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 bg-white/95 backdrop-blur-[1px] flex flex-col items-center justify-center border-2 border-dashed border-[#18181b] rounded-lg"
                  >
                    <RefreshCw className="h-5 w-5 text-[#18181b] animate-spin mb-2" />
                    <span className="text-[10px] text-[#18181b] uppercase tracking-widest font-mono font-bold">
                      Refactoring validation logic...
                    </span>
                  </motion.div>
                )}
              </div>
            </div>

            <div className="mt-8 border-t border-[#18181b]/10 pt-4 flex items-center justify-between text-[10px] text-[#18181b] font-mono font-bold">
              <span className="flex items-center gap-1.5">
                {isCompiling ? (
                  <span className="h-1.5 w-1.5 rounded-full bg-yellow-500 animate-ping" />
                ) : (
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                )}
                {isCompiling ? 'Validating schema changes...' : 'Workspace compiling successful'}
              </span>
              <span>UTF-8</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// KEY FEATURES PILLARS
function KeyFeatures() {
  const pillars = [
    { title: '🤖 Smart AI Assistant', desc: 'Explains complex code, suggests bug fixes, and refactors files instantly.' },
    { title: '👥 Real-Time Sync', desc: 'Multiple users can edit files simultaneously with live cursor tracking.' },
    { title: '💻 Clean IDE', desc: 'Organized file browser and editor tabs built for speed.' },
    { title: '⚡ Fast Terminal', desc: 'Run dev scripts and see compiler output in one place.' }
  ];

  return (
    <section id="features" className="bg-[#faf8f5] border-t-2 border-[#18181b] px-4 sm:px-6 lg:px-8 py-20">
      <div className="mx-auto max-w-5xl space-y-12">
        <h2 className="text-4xl font-light text-[#18181b] font-serif text-center">Built for Productivity</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {pillars.map((p, idx) => (
            <div key={idx} className="bg-white border-2 border-[#18181b] p-6 rounded-2xl shadow-[4px_4px_0px_0px_#18181b]">
              <h3 className="font-serif font-bold text-lg text-[#18181b] mb-3">{p.title}</h3>
              <p className="text-xs font-mono text-zinc-600">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// RESUME DESCRIPTION CALLOUT
function ResumeCallout({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  return (
    <section className="bg-[#e9dcf8] border-t-2 border-[#18181b] px-4 sm:px-6 lg:px-8 py-20 text-center relative overflow-hidden">
      <div className="mx-auto max-w-4xl space-y-6 relative z-10">
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light text-[#18181b] tracking-tight leading-snug max-w-3xl mx-auto font-serif">
          "Build faster with collaborative tools."
        </h2>
        <div className="pt-4">
          <button
            onClick={() => onNavigate('dashboard')}
            className="h-12 px-8 bg-[#18181b] hover:bg-zinc-800 text-[#faf8f5] border-2 border-[#18181b] shadow-[4px_4px_0px_0px_#faf8f5] hover:shadow-[2px_2px_0px_0px_#faf8f5] hover:-translate-x-0.5 hover:-translate-y-0.5 font-mono text-xs font-bold rounded-xl transition-all flex items-center gap-2 mx-auto"
          >
            Launch Free Workspace <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-[#faf8f5] border-t-2 border-[#18181b] py-8 px-4 sm:px-6 lg:px-8 font-mono text-[10px] text-[#18181b] font-bold">
      <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="font-serif italic text-xl font-bold text-[#18181b]">Lumen</span>
          <span>© 2026 Lumen Labs.</span>
        </div>
      </div>
    </footer>
  );
}

export function LandingPage({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  return (
    <div className="relative bg-[#faf8f5] text-[#18181b] min-h-screen selection:bg-[#e9dcf8]/70 select-none pb-0">
      <Nav onNavigate={onNavigate} />
      <Hero onNavigate={onNavigate} />
      <EditorSimulator />
      <KeyFeatures />
      <ResumeCallout onNavigate={onNavigate} />
      <Footer />
    </div>
  );
}

