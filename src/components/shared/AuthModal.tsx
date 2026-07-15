import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultMode?: 'login' | 'signup';
}

export function AuthModal({ open, onOpenChange, defaultMode = 'login' }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup'>(defaultMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, signInWithGoogle, error, clearError } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    clearError();
    try {
      if (mode === 'login') {
        await signIn(email, password);
      } else {
        await signUp(email, password, name);
      }
      onOpenChange(false);
    } catch {
      // Ignored
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    clearError();
    try {
      await signInWithGoogle();
      onOpenChange(false);
    } catch {
      // Ignored
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    clearError();
    setEmail('');
    setPassword('');
    setName('');
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px]"
          onClick={() => onOpenChange(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 8 }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="auth-modal-title"
            className="bg-[#fbfaf7] rounded-none p-8 w-full max-w-md border border-[#e5e2db] shadow-[0_24px_60px_-15px_rgba(0,0,0,0.12)] text-[#1c1d22] relative"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 id="auth-modal-title" className="text-xl font-serif italic text-[#1c1d22] font-semibold">
                {mode === 'login' ? 'Welcome back' : 'Create account'}
              </h2>
              <button
                onClick={() => onOpenChange(false)}
                className="h-8 w-8 flex items-center justify-center border border-[#e5e2db] hover:bg-black/5 transition-all rounded-none"
                aria-label="Close modal"
              >
                <X className="h-3.5 w-3.5 text-[#5e5f62]" />
              </button>
            </div>

            {/* Google — Primary Option */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full h-11 border-2 border-[#1c1d22] bg-white hover:bg-[#e9dcf8] text-[#1c1d22] rounded-none font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors font-bold shadow-[2px_2px_0px_0px_rgba(24,24,27,0.10)] hover:shadow-[4px_4px_0px_0px_rgba(24,24,27,0.15)] hover:-translate-x-0.5 hover:-translate-y-0.5 mb-6"
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

            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-[#e5e2db]" />
              </div>
              <div className="relative flex justify-center text-[9px] uppercase font-mono tracking-wider">
                <span className="bg-[#fbfaf7] px-3 text-[#5e5f62]">Or continue with email</span>
              </div>
            </div>

            {/* Email / Password — Secondary */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-[10px] font-mono uppercase tracking-wider text-[#5e5f62]">Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-3.5 w-3.5 text-[#5e5f62]" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-9 h-10 border-[#e5e2db] bg-white text-[#1c1d22] focus:ring-[#e07a74] focus:border-[#e07a74] rounded-none font-mono text-xs placeholder:text-zinc-400"
                      required
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-[10px] font-mono uppercase tracking-wider text-[#5e5f62]">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-3.5 w-3.5 text-[#5e5f62]" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9 h-10 border-[#e5e2db] bg-white text-[#1c1d22] focus:ring-[#e07a74] focus:border-[#e07a74] rounded-none font-mono text-xs placeholder:text-zinc-400"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-[10px] font-mono uppercase tracking-wider text-[#5e5f62]">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-3.5 w-3.5 text-[#5e5f62]" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 h-10 border-[#e5e2db] bg-white text-[#1c1d22] focus:ring-[#e07a74] focus:border-[#e07a74] rounded-none font-mono text-xs placeholder:text-zinc-400"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs font-mono text-[#e07a74] bg-[#e07a74]/5 border border-[#e07a74]/20 rounded-none p-3"
                >
                  {error}
                </motion.div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full h-10 bg-[#18181b] hover:bg-zinc-800 text-[#faf8f5] border-2 border-[#18181b] shadow-[2px_2px_0px_0px_rgba(24,24,27,0.15)] hover:shadow-[4px_4px_0px_0px_rgba(24,24,27,0.2)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all rounded-none font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2 font-bold"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : mode === 'login' ? (
                  'Sign in'
                ) : (
                  'Create account'
                )}
              </button>
            </form>

            <div className="mt-6 text-center text-xs font-mono text-[#5e5f62]">
              {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <button
                type="button"
                onClick={switchMode}
                className="text-[#e07a74] hover:underline focus-ring rounded px-1"
              >
                {mode === 'login' ? 'Sign up' : 'Sign in'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
