import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AuroraBackground } from '@/components/shared/AuroraBackground';
import { LandingPage } from '@/components/screens/LandingPage';
import { Dashboard } from '@/components/screens/Dashboard';
import { Editor, CommandPalette } from '@/components/screens/Editor';
import type { Screen } from '@/lib/data';
import './App.css';

const ease = [0.16, 1, 0.3, 1] as const;

function App() {
  const [screen, setScreen] = useState<Screen>('landing');
  const [cmdOpen, setCmdOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCmdOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const navigate = (s: Screen) => {
    setScreen(s);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  return (
    <div className="relative min-h-screen text-foreground antialiased">
      <AuroraBackground />
      <AnimatePresence mode="wait">
        <motion.div
          key={screen}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease }}
        >
          {screen === 'landing' && <LandingPage onNavigate={navigate} />}
          {screen === 'dashboard' && (
            <Dashboard onNavigate={navigate} onCommand={() => setCmdOpen(true)} />
          )}
          {screen === 'editor' && (
            <Editor onBack={() => navigate('dashboard')} onCommand={() => setCmdOpen(true)} />
          )}
        </motion.div>
      </AnimatePresence>
      <CommandPalette open={cmdOpen} onOpenChange={setCmdOpen} onNavigate={navigate} />
    </div>
  );
}

export default App;
