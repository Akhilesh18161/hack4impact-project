'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '@/components/auth-provider';
import { UserRole } from '@/lib/auth-client';
import { X, Mail, Lock, User, UserCheck, ShieldAlert, Loader2, Sparkles, Key } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { signIn, signUp, user, signOut } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>('community_user');
  const [mounted, setMounted] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Mount guard for SSR safety
  useEffect(() => { setMounted(true); }, []);

  // Escape key closes modal
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  // Prevent body scroll while modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    if (isSignUp) {
      if (!fullName.trim() || !email.trim() || !password.trim()) {
        setError('Please fill in all fields.');
        setLoading(false);
        return;
      }
      const res = await signUp(email, password, fullName, role);
      if (res.success) {
        setSuccess('Account created successfully! You are now logged in.');
        setTimeout(() => {
          onClose();
          resetForm();
        }, 1500);
      } else {
        setError(res.error || 'Failed to sign up.');
      }
    } else {
      if (!email.trim() || !password.trim()) {
        setError('Please enter your email and password.');
        setLoading(false);
        return;
      }
      const res = await signIn(email, password);
      if (res.success) {
        setSuccess('Logged in successfully!');
        setTimeout(() => {
          onClose();
          resetForm();
        }, 1500);
      } else {
        setError(res.error || 'Failed to sign in.');
      }
    }
    setLoading(false);
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setFullName('');
    setRole('community_user');
    setError(null);
    setSuccess(null);
  };

  const quickFill = (type: 'admin' | 'user') => {
    if (type === 'admin') {
      setEmail('admin@urbanpulse.com');
      setPassword('admin123');
    } else {
      setEmail('citizen@urbanpulse.com');
      setPassword('user123');
    }
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-background/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="relative z-10 w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-card shadow-2xl p-6 md:p-8"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <X className="size-4" />
            </button>

            {/* Header */}
            <div className="text-center mb-6">
              <div className="mx-auto flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary mb-3">
                <Sparkles className="size-5" />
              </div>
              <h2 className="text-xl font-bold tracking-tight text-foreground">
                {isSignUp ? 'Create your Account' : 'Welcome to UrbanPulse'}
              </h2>
              <p className="mt-1.5 text-xs text-muted-foreground">
                {isSignUp
                  ? 'Join the community or register as admin'
                  : 'Access your portal with credentials'}
              </p>
            </div>

            {/* Quick Demo Fills (Only in Sign In mode) */}
            {!isSignUp && (
              <div className="mb-5 rounded-xl border border-primary/20 bg-primary/5 p-3.5">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-primary mb-2 uppercase tracking-wide">
                  <Key className="size-3" />
                  <span>Demo Fast Login Credentials:</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => quickFill('user')}
                    className="flex flex-col items-start rounded-lg border border-border bg-card p-2 text-left hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer"
                  >
                    <span className="text-[10px] font-bold text-foreground">Community Portal</span>
                    <span className="text-[9px] text-muted-foreground">citizen@urbanpulse.com</span>
                  </button>
                  <button
                    onClick={() => quickFill('admin')}
                    className="flex flex-col items-start rounded-lg border border-border bg-card p-2 text-left hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer"
                  >
                    <span className="text-[10px] font-bold text-foreground">Admin Portal</span>
                    <span className="text-[9px] text-muted-foreground">admin@urbanpulse.com</span>
                  </button>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {isSignUp && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-foreground">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Jane Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full rounded-lg border border-border bg-muted/50 py-2 pl-9 pr-4 text-sm outline-none focus:border-primary/50 focus:bg-background transition-all"
                    />
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-foreground">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                  <input
                    type="email"
                    placeholder="email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-lg border border-border bg-muted/50 py-2 pl-9 pr-4 text-sm outline-none focus:border-primary/50 focus:bg-background transition-all"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-foreground">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-lg border border-border bg-muted/50 py-2 pl-9 pr-4 text-sm outline-none focus:border-primary/50 focus:bg-background transition-all"
                  />
                </div>
              </div>

              {/* Portal Selector (Only in Sign Up mode) */}
              {isSignUp && (
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-foreground">Select Portal Access</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRole('community_user')}
                      className={`flex items-center justify-center gap-2 rounded-lg border p-2.5 text-xs font-bold transition-all cursor-pointer ${
                        role === 'community_user'
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      <UserCheck className="size-3.5" />
                      Community Portal
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('admin')}
                      className={`flex items-center justify-center gap-2 rounded-lg border p-2.5 text-xs font-bold transition-all cursor-pointer ${
                        role === 'admin'
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      <ShieldAlert className="size-3.5" />
                      Admin Portal
                    </button>
                  </div>
                </div>
              )}

              {/* Status Notifications */}
              {error && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-2.5 text-xs text-destructive flex items-start gap-2">
                  <span className="font-bold">Error:</span> {error}
                </div>
              )}
              {success && (
                <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-2.5 text-xs text-green-500 flex items-start gap-2">
                  <span className="font-bold">Success:</span> {success}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-primary py-2.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 hover:scale-[1.01] hover:brightness-105 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : isSignUp ? (
                  'Sign Up & Register'
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            {/* Toggle Sign In / Sign Up */}
            <div className="mt-5 text-center text-xs">
              <span className="text-muted-foreground">
                {isSignUp ? 'Already have an account? ' : "Don't have an account yet? "}
              </span>
              <button
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError(null);
                  setSuccess(null);
                }}
                className="font-bold text-primary hover:underline cursor-pointer"
              >
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
