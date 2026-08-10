import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  defaultMode?: 'login' | 'signup';
}

export function AuthModal({ open, onOpenChange, onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, signInWithGoogle, error, clearError } = useAuth();

  const reset = () => {
    setEmail('');
    setPassword('');
    setName('');
    clearError();
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    clearError();
    try {
      if (mode === 'login') {
        console.log('[AuthModal] Attempting email sign-in for:', email);
        await signIn(email, password);
        console.log('[AuthModal] Email sign-in SUCCESS');
      } else {
        console.log('[AuthModal] Attempting sign-up for:', email);
        await signUp(email, password, name);
        console.log('[AuthModal] Sign-up SUCCESS');
      }
      reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (err: any) {
      console.error('[AuthModal] Auth error:', err.code, err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    clearError();
    try {
      console.log('[AuthModal] Attempting Google sign-in');
      await signInWithGoogle();
      console.log('[AuthModal] Google sign-in SUCCESS');
      reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (err: any) {
      console.error('[AuthModal] Google auth error:', err.code, err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/30 backdrop-blur-[2px]"
          onClick={() => { onOpenChange(false); reset(); }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="auth-modal-title"
            className="bg-card rounded-2xl p-8 w-full max-w-sm border border-border/40 shadow-lg text-foreground relative"
          >
            <button
              onClick={() => { onOpenChange(false); reset(); }}
              className="absolute top-4 right-4 h-8 w-8 flex items-center justify-center border border-border/40 hover:bg-border/20 transition-all rounded-lg"
              aria-label="Close modal"
            >
              <X className="h-3.5 w-3.5 text-muted-foreground" />
            </button>

            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-primary border-2 border-foreground shadow-sm mb-4">
                <Sparkles className="h-5 w-5 text-foreground" />
              </div>
              <h2 id="auth-modal-title" className="text-xl font-serif italic font-semibold text-foreground">
                Welcome to Lumen
              </h2>
              <p className="text-xs font-mono text-muted-foreground mt-1.5">
                {mode === 'login' ? 'Sign in to your account' : 'Create a new account'}
              </p>
            </div>

            {/* Mode toggle */}
            <div className="flex rounded-lg border border-border/40 overflow-hidden mb-5">
              <button
                type="button"
                onClick={() => { setMode('login'); clearError(); }}
                className={`flex-1 py-2 text-xs font-mono font-bold transition-colors ${mode === 'login' ? 'bg-foreground text-background' : 'bg-card text-muted-foreground hover:bg-background-soft'}`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setMode('signup'); clearError(); }}
                className={`flex-1 py-2 text-xs font-mono font-bold transition-colors ${mode === 'signup' ? 'bg-foreground text-background' : 'bg-card text-muted-foreground hover:bg-background-soft'}`}
              >
                Sign Up
              </button>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs font-mono text-red-600 bg-red-100 border border-red-200 rounded-lg p-3 mb-4 text-center"
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={handleEmailSubmit} className="space-y-3 mb-4">
              {mode === 'signup' && (
                <input
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-10 px-3 border border-border/40 rounded-lg text-sm font-mono bg-background-soft focus:outline-none focus:border-primary text-foreground"
                />
              )}
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full h-10 px-3 border border-border/40 rounded-lg text-sm font-mono bg-background-soft focus:outline-none focus:border-primary text-foreground"
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full h-10 px-3 border border-border/40 rounded-lg text-sm font-mono bg-background-soft focus:outline-none focus:border-primary text-foreground"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-foreground text-background rounded-xl font-mono text-sm font-bold flex items-center justify-center gap-2 border-2 border-foreground shadow-sm hover:shadow-md transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-border/40" />
              <span className="text-[10px] font-mono text-muted-foreground">or</span>
              <div className="flex-1 h-px bg-border/40" />
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full h-11 border-2 border-border/40 bg-background-soft hover:bg-primary text-foreground rounded-xl font-mono text-sm font-bold flex items-center justify-center gap-3 transition-all shadow-sm hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              )}
              Continue with Google
            </button>

            <p className="text-center text-[10px] font-mono text-[#5e5f62] mt-4 leading-relaxed">
              By continuing, you agree to our Terms of Service.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
