import { useState, useEffect, lazy, Suspense } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AuroraBackground } from '@/components/shared/AuroraBackground';
import type { Screen } from '@/lib/data';
import { useAuth } from '@/contexts/AuthContext';
import './App.css';

// Lazy load components for better performance
const LandingPage = lazy(() => import('@/components/screens/LandingPage').then(m => ({ default: m.LandingPage })));
const Dashboard = lazy(() => import('@/components/screens/Dashboard').then(m => ({ default: m.Dashboard })));
const Editor = lazy(() => import('@/components/screens/Editor'));
const CommandPalette = lazy(() => import('@/components/screens/Editor').then(m => ({ default: m.CommandPalette })));

const ease = [0.16, 1, 0.3, 1] as const;

// Loading component for lazy-loaded components
function ScreenLoader() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
    </div>
  );
}

function App() {
  const [screen, setScreen] = useState<Screen>('landing');
  const [cmdOpen, setCmdOpen] = useState(false);
  const [currentProjectId, setCurrentProjectId] = useState<string | undefined>();
  const { loading: authLoading } = useAuth();

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

  const navigate = (s: Screen, projectId?: string) => {
    setScreen(s);
    if (projectId) setCurrentProjectId(projectId);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  if (authLoading) {
    return (
      <div className="relative min-h-screen text-foreground antialiased overflow-x-hidden w-full">
        <AuroraBackground />
        <div className="flex items-center justify-center min-h-screen">
          <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen text-foreground antialiased overflow-x-hidden w-full">
      <AuroraBackground />
      <AnimatePresence mode="wait">
        <motion.div
          key={screen}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease }}
        >
          <Suspense fallback={<ScreenLoader />}>
            {screen === 'landing' && <LandingPage onNavigate={navigate} />}
            {screen === 'dashboard' && (
              <Dashboard onNavigate={navigate} onCommand={() => setCmdOpen(true)} />
            )}
            {screen === 'editor' && (
              <Editor
                onBack={() => navigate('dashboard')}
                onCommand={() => setCmdOpen(true)}
                projectId={currentProjectId}
              />
            )}
          </Suspense>
        </motion.div>
      </AnimatePresence>
      <Suspense fallback={null}>
        <CommandPalette open={cmdOpen} onOpenChange={setCmdOpen} onNavigate={navigate} />
      </Suspense>
    </div>
  );
}

export default App;
