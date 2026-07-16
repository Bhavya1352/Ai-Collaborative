import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultMode?: 'login' | 'signup';
}

export function AuthModal({ open, onOpenChange }: AuthModalProps) {
  const [loading, setLoading] = useState(false);
  const { signInWithGoogle, error, clearError } = useAuth();

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
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="auth-modal-title"
            className="bg-[#fbfaf7] rounded-2xl p-8 w-full max-w-sm border border-[#e5e2db] shadow-[0_24px_60px_-15px_rgba(0,0,0,0.15)] text-[#1c1d22] relative"
          >
            {/* Close */}
            <button
              onClick={() => onOpenChange(false)}
              className="absolute top-4 right-4 h-8 w-8 flex items-center justify-center border border-[#e5e2db] hover:bg-black/5 transition-all rounded-lg"
              aria-label="Close modal"
            >
              <X className="h-3.5 w-3.5 text-[#5e5f62]" />
            </button>

            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-[#e9dcf8] border-2 border-[#18181b] shadow-[2px_2px_0px_0px_#18181b] mb-4">
                <Sparkles className="h-5 w-5 text-[#18181b]" />
              </div>
              <h2 id="auth-modal-title" className="text-xl font-serif italic font-semibold text-[#1c1d22]">
                Welcome to Lumen
              </h2>
              <p className="text-xs font-mono text-[#5e5f62] mt-1.5">
                Sign in to start building together
              </p>
            </div>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs font-mono text-[#e07a74] bg-[#e07a74]/5 border border-[#e07a74]/20 rounded-lg p-3 mb-4 text-center"
              >
                {error}
              </motion.div>
            )}

            {/* Google Sign In Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full h-12 border-2 border-[#1c1d22] bg-white hover:bg-[#e9dcf8] text-[#1c1d22] rounded-xl font-mono text-sm font-bold flex items-center justify-center gap-3 transition-all shadow-[3px_3px_0px_0px_#18181b] hover:shadow-[5px_5px_0px_0px_#18181b] hover:-translate-x-0.5 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              )}
              {loading ? 'Signing in...' : 'Continue with Google'}
            </button>

            <p className="text-center text-[10px] font-mono text-[#5e5f62] mt-5 leading-relaxed">
              By continuing, you agree to our Terms of Service.<br />
              Your data is safe and never shared.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
