import React, { useState, useEffect, useRef } from 'react';
import { X, Mail, User, Check, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface AuthModalProps {
  onClose: () => void;
}

type Step = 'email' | 'sent' | 'handle';

const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
  const { signInWithEmail, updateProfile, profile, loading, clearError, error } = useAuth();

  const [step, setStep] = useState<Step>('email');
  const [emailInput, setEmailInput] = useState('');
  const [handleInput, setHandleInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [settingHandle, setSettingHandle] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const handleRef = useRef<HTMLInputElement>(null);

  // If the user just signed in and has no handle yet, jump to the handle step
  useEffect(() => {
    if (profile && !profile.display_name) {
      setStep('handle');
    }
  }, [profile]);

  // Focus the relevant input when step changes
  useEffect(() => {
    if (step === 'email') emailRef.current?.focus();
    if (step === 'handle') handleRef.current?.focus();
  }, [step]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;
    setSubmitting(true);
    setLocalError(null);
    clearError();
    const { error: err } = await signInWithEmail(emailInput.trim());
    setSubmitting(false);
    if (err) {
      setLocalError(err);
    } else {
      setStep('sent');
    }
  };

  const handleSaveHandle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!handleInput.trim()) return;
    setSettingHandle(true);
    const handle = handleInput.startsWith('@') ? handleInput.trim() : `@${handleInput.trim()}`;
    await updateProfile({ display_name: handle });
    setSettingHandle(false);
    onClose();
  };

  const displayError = localError || error;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-label="Sign in"
      >
        <div
          className="w-full max-w-sm bg-[var(--fs-card-bg)] border-2 border-[var(--fs-border)] shadow-2xl"
          style={{ borderRadius: 'var(--fs-radius)' }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[var(--fs-divider-muted)]">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--fs-nav-active-text)] mb-0.5">
                Four Square
              </p>
              <h2 className="text-lg font-barDisplay font-bold text-[var(--fs-page-text)] leading-tight">
                {step === 'email' && 'Join or sign in'}
                {step === 'sent' && 'Check your inbox'}
                {step === 'handle' && 'Choose your handle'}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center text-[var(--fs-text-muted)] hover:text-[var(--fs-page-text)] transition-colors"
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>

          {/* Body */}
          <div className="px-5 py-5">

            {/* ── Step 1: Email entry ── */}
            {step === 'email' && (
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <p className="text-xs text-[var(--fs-text-muted)] leading-relaxed">
                  Enter your email and we'll send you a magic link — no password needed.
                  Works for new accounts too.
                </p>
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--fs-text-muted)]">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--fs-text-muted)] pointer-events-none" />
                    <input
                      ref={emailRef}
                      type="email"
                      value={emailInput}
                      onChange={e => setEmailInput(e.target.value)}
                      placeholder="you@example.com"
                      required
                      autoComplete="email"
                      className="w-full pl-9 pr-3 py-2.5 text-sm border text-[var(--fs-page-text)] focus:outline-none focus:ring-2 focus:ring-[var(--fs-nav-active-text)]/40 transition-shadow"
                      style={{
                        backgroundColor: 'var(--fs-input-bg)',
                        borderColor: 'var(--fs-input-border)',
                        borderRadius: 'var(--fs-radius)',
                      }}
                    />
                  </div>
                </div>
                {displayError && (
                  <p className="text-xs text-red-500 font-medium">{displayError}</p>
                )}
                <button
                  type="submit"
                  disabled={submitting || !emailInput.trim()}
                  className="w-full flex items-center justify-center gap-2 py-2.5 text-[11px] font-barDisplay font-bold uppercase tracking-widest text-white transition-opacity hover:opacity-85 disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ backgroundColor: 'var(--fs-footer-schedule-bg)', borderRadius: 'var(--fs-radius)' }}
                >
                  {submitting
                    ? <><Loader2 size={13} className="animate-spin" /> Sending…</>
                    : <><ArrowRight size={13} /> Send magic link</>
                  }
                </button>
                <p className="text-[10px] text-center text-[var(--fs-text-muted)]">
                  Chat, leaderboard & game history — all saved to your account.
                </p>
              </form>
            )}

            {/* ── Step 2: Email sent ── */}
            {step === 'sent' && (
              <div className="text-center space-y-4 py-2">
                <div
                  className="w-14 h-14 mx-auto flex items-center justify-center text-white"
                  style={{ backgroundColor: 'var(--fs-footer-schedule-bg)', borderRadius: '50%' }}
                >
                  <Mail size={22} />
                </div>
                <div className="space-y-1.5">
                  <p className="text-sm font-bold text-[var(--fs-page-text)]">Magic link sent!</p>
                  <p className="text-xs text-[var(--fs-text-muted)] leading-relaxed">
                    We sent a link to <span className="font-semibold text-[var(--fs-page-text)]">{emailInput}</span>.
                    Click it to sign in — the link expires in 1 hour.
                  </p>
                </div>
                <p className="text-[10px] text-[var(--fs-text-muted)]">
                  Didn't get it?{' '}
                  <button
                    type="button"
                    onClick={() => { setStep('email'); setLocalError(null); clearError(); }}
                    className="underline hover:no-underline font-semibold"
                    style={{ color: 'var(--fs-nav-active-text)' }}
                  >
                    Try again
                  </button>
                </p>
              </div>
            )}

            {/* ── Step 3: Set @handle (shown after redirect + profile has no display_name) ── */}
            {step === 'handle' && (
              <form onSubmit={handleSaveHandle} className="space-y-4">
                <p className="text-xs text-[var(--fs-text-muted)] leading-relaxed">
                  Pick a handle — this is how you'll appear on the leaderboard and in chat.
                </p>
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--fs-text-muted)]">
                    Your handle
                  </label>
                  <div className="relative">
                    <span
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-[var(--fs-text-muted)] pointer-events-none select-none"
                    >@</span>
                    <input
                      ref={handleRef}
                      type="text"
                      value={handleInput}
                      onChange={e => setHandleInput(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                      placeholder="yourcoolname"
                      maxLength={24}
                      required
                      autoComplete="off"
                      className="w-full pl-7 pr-3 py-2.5 text-sm border text-[var(--fs-page-text)] focus:outline-none focus:ring-2 focus:ring-[var(--fs-nav-active-text)]/40 transition-shadow"
                      style={{
                        backgroundColor: 'var(--fs-input-bg)',
                        borderColor: 'var(--fs-input-border)',
                        borderRadius: 'var(--fs-radius)',
                      }}
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={settingHandle || !handleInput.trim()}
                  className="w-full flex items-center justify-center gap-2 py-2.5 text-[11px] font-barDisplay font-bold uppercase tracking-widest text-white transition-opacity hover:opacity-85 disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ backgroundColor: 'var(--fs-footer-schedule-bg)', borderRadius: 'var(--fs-radius)' }}
                >
                  {settingHandle
                    ? <><Loader2 size={13} className="animate-spin" /> Saving…</>
                    : <><Check size={13} /> Let's go</>
                  }
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full text-[10px] text-[var(--fs-text-muted)] hover:underline"
                >
                  Skip for now
                </button>
              </form>
            )}

          </div>
        </div>
      </div>
    </>
  );
};

export default AuthModal;
