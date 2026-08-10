import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import type { Screen } from '@/lib/data';
import {
  Sparkles,
  Menu,
  X,
  RefreshCw,
  FileCode,
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
            <div className="bg-[#18181b] text-[#faf8f5] px-2 py-0.5 sm:px-2.5 sm:py-1 rounded font-mono font-bold text-xs sm:text-sm tracking-wide border border-[#18181b]">
              L✦
            </div>
            <span className="font-serif italic text-xl sm:text-2xl font-bold tracking-tight text-[#18181b]">
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
              className="absolute top-20 left-3 right-3 sm:left-4 sm:right-4 bg-[#faf8f5] border-2 border-[#18181b] shadow-[4px_4px_0px_0px_#18181b] rounded-xl p-4 sm:p-5 flex flex-col gap-3 sm:gap-4 z-40"
            >
              <a href="#demo" onClick={() => setMobileMenuOpen(false)} className="font-mono text-xs sm:text-xs font-bold uppercase tracking-wider text-[#18181b] hover:underline underline-offset-4 decoration-2 py-1">TRY DEMO</a>
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="font-mono text-xs sm:text-xs font-bold uppercase tracking-wider text-[#18181b] hover:underline underline-offset-4 decoration-2 py-1">FEATURES</a>
              <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="font-mono text-xs sm:text-xs font-bold uppercase tracking-wider text-[#18181b] hover:underline underline-offset-4 decoration-2 py-1">HOW IT WORKS</a>
              <div className="flex flex-col gap-2 pt-2 border-t-2 border-[#18181b]/10">
                <button
                  className="w-full py-2.5 sm:py-2 bg-[#e9dcf8] text-[#18181b] border-2 border-[#18181b] shadow-[2px_2px_0px_0px_#18181b] rounded-lg font-mono text-xs font-bold"
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
    <section className="relative bg-[#faf8f5] min-h-[85vh] flex flex-col justify-center px-3 sm:px-4 md:px-6 lg:px-8 pt-24 sm:pt-28 md:pt-32 pb-12 sm:pb-16 overflow-hidden">
      <div className="mx-auto max-w-5xl w-full text-center space-y-6 sm:space-y-8 z-10">
        <div className="space-y-3 sm:space-y-4 max-w-4xl mx-auto px-2">
          <div className="inline-flex items-center gap-1.5 border-2 border-[#18181b] px-2.5 py-1 sm:px-3 sm:py-1.5 bg-[#e9dcf8] rounded-full text-[9px] sm:text-[10px] font-mono font-bold tracking-wider text-[#18181b] uppercase shadow-[2px_2px_0px_0px_#18181b]">
            <span>⚡</span>
            <span className="hidden xs:inline">AI-ASSISTED CODING WORKSPACE</span>
            <span className="xs:hidden">AI WORKSPACE</span>
          </div>

          <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-light tracking-tight text-[#18181b] leading-[1.1] sm:leading-[1.05] font-serif">
            Your code. Your AI. <br />
            <span className="font-serif italic text-zinc-600 font-normal">
              One workspace.
            </span>
          </h1>

          <p className="text-[10px] xs:text-xs sm:text-sm md:text-base lg:text-lg text-zinc-600 max-w-2xl mx-auto leading-relaxed font-mono px-2">
            Lumen is a browser-based coding workspace with an AI assistant, multi-file editor, and instant code execution — built to help you write, understand, and improve code faster.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-2 sm:pt-4 max-w-md mx-auto sm:max-w-none px-4">
          <button
            className="w-full sm:w-auto h-11 sm:h-12 px-6 sm:px-8 bg-[#18181b] text-[#faf8f5] hover:bg-zinc-800 border-2 border-[#18181b] font-mono text-[10px] sm:text-xs font-bold rounded-xl shadow-[4px_4px_0px_0px_#e9dcf8] hover:shadow-[2px_2px_0px_0px_#e9dcf8] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all"
            onClick={() => onNavigate('dashboard')}
          >
            Open Workspace
          </button>
          <a
            href="#demo"
            className="w-full sm:w-auto h-11 sm:h-12 px-6 sm:px-8 bg-[#faf8f5] text-[#18181b] hover:bg-[#e9dcf8]/10 border-2 border-[#18181b] font-mono text-[10px] sm:text-xs font-bold rounded-xl flex items-center justify-center shadow-[4px_4px_0px_0px_#18181b] hover:shadow-[2px_2px_0px_0px_#18181b] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all"
          >
            Try AI Assistant
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

  const fileData = fileSnippets[selectedFile];
  const activeLines = isRefactored ? fileData.refactored : fileData.lines;

  return (
    <section id="demo" className="relative bg-[#faf8f5] border-t-2 border-[#18181b] px-3 sm:px-4 md:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
      <div className="mx-auto max-w-4xl space-y-8 sm:space-y-12">
        <div className="text-center space-y-2 sm:space-y-3 px-2">
          <span className="text-[10px] sm:text-xs font-mono font-bold text-[#18181b] uppercase tracking-widest border-2 border-[#18181b] px-2.5 py-1 sm:px-3 sm:py-1.5 bg-[#e9dcf8] rounded-full inline-block shadow-[2px_2px_0px_0px_#18181b]">
            ⚡ Try it out
          </span>
          <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-[#18181b] font-serif">
            Code. Run. Improve.
          </h2>
          <p className="text-[10px] xs:text-xs sm:text-sm md:text-base font-mono text-zinc-600 max-w-lg mx-auto px-2">
            Write code in the editor, run it instantly, and use AI to explain, review, fix, or refactor your code.
          </p>
        </div>

        <div className="border-2 border-[#18181b] bg-white rounded-xl sm:rounded-2xl shadow-[4px_4px_0px_0px_#18181b] sm:shadow-[6px_6px_0px_0px_#18181b] overflow-hidden flex flex-col">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between border-b-2 border-[#18181b] bg-[#faf8f5] px-3 sm:px-4 py-2 gap-2">
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar w-full sm:w-auto">
              {(Object.keys(fileSnippets) as Array<keyof typeof fileSnippets>).map((fileName) => (
                <button
                  key={fileName}
                  onClick={() => setSelectedFile(fileName)}
                  className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-lg font-mono text-[10px] sm:text-xs font-bold text-left transition-all border shrink-0 ${
                    selectedFile === fileName
                      ? 'bg-[#e9dcf8] text-[#18181b] border-[#18181b]'
                      : 'text-zinc-500 hover:bg-zinc-100 border-transparent'
                  }`}
                >
                  <FileCode size={11} className="sm:size-13" />
                  <span>{fileName}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
              <button
                onClick={handleRefactorSim}
                disabled={isTyping || isCompiling}
                className="py-1.5 px-2.5 sm:px-3 bg-[#e9dcf8] hover:bg-[#ebd3f8] disabled:opacity-50 text-[#18181b] border-2 border-[#18181b] shadow-[2px_2px_0px_0px_#18181b] hover:shadow-[1px_1px_0px_0px_#18181b] hover:translate-x-[0.5px] hover:translate-y-[0.5px] rounded-lg font-mono text-[9px] sm:text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition-all"
              >
                <Sparkles size={10} className="sm:size-11 text-[#18181b]" />
                <span className="hidden xs:inline">{isTyping ? 'Writing...' : isCompiling ? 'Validating...' : 'AI Refactor'}</span>
                <span className="xs:inline">{isTyping ? '...' : isCompiling ? '...' : 'AI'}</span>
              </button>
            </div>
          </div>

          <div className="flex-1 bg-[#faf8f5] p-3 sm:p-4 md:p-6 font-mono text-[10px] xs:text-xs sm:text-sm md:text-base text-zinc-700 flex flex-col justify-between min-h-[200px] sm:min-h-[250px] relative">
            <div className="space-y-1">
              <div className="flex items-center justify-between pb-2 sm:pb-3 border-b border-[#18181b]/10 mb-2 sm:mb-3 text-[9px] sm:text-[10px] text-zinc-500">
                <span className="flex items-center gap-1.5 text-[#18181b] font-bold truncate">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  {selectedFile}
                </span>
                <span className="text-[8px] sm:text-[9px] uppercase font-bold text-[#18181b] bg-[#e9dcf8] px-1 sm:px-1.5 py-0.5 rounded border border-[#18181b] shrink-0">
                  Sandbox mode
                </span>
              </div>

              <div className="relative font-mono leading-relaxed space-y-0.5">
                {activeLines.map((line, idx) => (
                  <div
                    key={idx}
                    className={`relative flex items-center pl-1 rounded hover:bg-[#e9dcf8]/10 ${
                      isTyping && idx === 3 ? 'bg-[#e9dcf8]/35 text-[#18181b]' : ''
                    }`}
                  >
                    <span className="w-6 sm:w-8 shrink-0 text-zinc-400 text-[9px] sm:text-[10px] text-right pr-1.5 sm:pr-2 select-none font-bold">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <span className="text-[#18181b] font-semibold whitespace-pre text-[10px] xs:text-xs sm:text-sm md:text-base">{line}</span>
                  </div>
                ))}

                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 bg-white/95 backdrop-blur-[1px] flex flex-col items-center justify-center border-2 border-dashed border-[#18181b] rounded-lg"
                  >
                    <RefreshCw className="h-4 w-4 sm:h-5 sm:w-5 text-[#18181b] animate-spin mb-1.5 sm:mb-2" />
                    <span className="text-[9px] sm:text-[10px] text-[#18181b] uppercase tracking-widest font-mono font-bold text-center px-2">
                      Refactoring validation logic...
                    </span>
                  </motion.div>
                )}
              </div>
            </div>

            <div className="mt-6 sm:mt-8 border-t border-[#18181b]/10 pt-3 sm:pt-4 flex items-center justify-between text-[9px] sm:text-[10px] text-[#18181b] font-mono font-bold">
              <span className="flex items-center gap-1.5">
                {isCompiling ? (
                  <span className="h-1.5 w-1.5 rounded-full bg-yellow-500 animate-ping" />
                ) : (
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                )}
                <span className="hidden xs:inline">{isCompiling ? 'Validating schema changes...' : 'Workspace compiling successful'}</span>
                <span className="xs:inline">{isCompiling ? 'Validating...' : 'Compiling successful'}</span>
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
    { title: '🤖 AI Code Assistant', desc: 'Explain, generate, review, fix and refactor code with AI.' },
    { title: '⌨️ Multi-File Editor', desc: 'Work across files with a familiar browser-based coding workspace.' },
    { title: '▶️ Instant Code Execution', desc: 'Run your code and see output and errors directly in the workspace.' },
    { title: '🛠️ Developer Workspace', desc: 'Editor, files, terminal output and AI assistance in one interface.' }
  ];

  return (
    <section id="features" className="bg-[#faf8f5] border-t-2 border-[#18181b] px-3 sm:px-4 md:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
      <div className="mx-auto max-w-5xl space-y-8 sm:space-y-12">
        <h2 className="text-2xl xs:text-3xl sm:text-4xl font-light text-[#18181b] font-serif text-center px-2">Everything You Need to Code</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          {pillars.map((p, idx) => (
            <div key={idx} className="bg-white border-2 border-[#18181b] p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl shadow-[3px_3px_0px_0px_#18181b] sm:shadow-[4px_4px_0px_0px_#18181b]">
              <h3 className="font-serif font-bold text-base sm:text-lg text-[#18181b] mb-2 sm:mb-3">{p.title}</h3>
              <p className="text-[10px] xs:text-xs sm:text-xs font-mono text-zinc-600 leading-relaxed">{p.desc}</p>
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
    <section className="bg-[#e9dcf8] border-t-2 border-[#18181b] px-3 sm:px-4 md:px-6 lg:px-8 py-12 sm:py-16 md:py-20 text-center relative overflow-hidden">
      <div className="mx-auto max-w-4xl space-y-4 sm:space-y-6 relative z-10 px-2">
        <h2 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light text-[#18181b] tracking-tight leading-snug max-w-3xl mx-auto font-serif">
          "Write less boilerplate. Understand more code."
        </h2>
        <div className="pt-3 sm:pt-4">
          <button
            onClick={() => onNavigate('dashboard')}
            className="h-11 sm:h-12 px-6 sm:px-8 bg-[#18181b] hover:bg-zinc-800 text-[#faf8f5] border-2 border-[#18181b] shadow-[4px_4px_0px_0px_#faf8f5] hover:shadow-[2px_2px_0px_0px_#faf8f5] hover:-translate-x-0.5 hover:-translate-y-0.5 font-mono text-[10px] sm:text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 mx-auto"
          >
            Open Lumen Workspace →
          </button>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-[#faf8f5] border-t-2 border-[#18181b] py-6 sm:py-8 px-3 sm:px-4 md:px-6 lg:px-8 font-mono text-[9px] sm:text-[10px] text-[#18181b] font-bold">
      <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-2">
          <span className="font-serif italic text-lg sm:text-xl font-bold text-[#18181b]">Lumen</span>
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

