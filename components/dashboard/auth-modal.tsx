'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '@/components/auth-provider';
import { authClient, UserRole } from '@/lib/auth-client';
import {
  X, Mail, Lock, User, UserCheck, ShieldAlert, Loader2, Sparkles,
  AtSign, Eye, EyeOff, CheckCircle2, XCircle, AlertCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// ── Username validation ───────────────────────────────────────────────────────
const USERNAME_REGEX = /^[a-z0-9._@#$]+$/
const SPECIAL_CHARS = new Set(['.', '_', '@', '#', '$'])

function validateUsername(u: string): string | null {
  if (!u) return 'Username is required.'
  if (u.length < 3) return 'Must be at least 3 characters.'
  if (u.length > 20) return 'Must be 20 characters or fewer.'
  if (!USERNAME_REGEX.test(u)) return 'Only lowercase letters, numbers, and . _ @ # $ are allowed.'
  // Count special chars (each unique position)
  const specials = u.split('').filter(c => SPECIAL_CHARS.has(c))
  if (specials.length > 3) return 'Too many special characters (max 3).'
  return null
}

// ── Password strength ─────────────────────────────────────────────────────────
type Strength = 'too-short' | 'weak' | 'fair' | 'good' | 'strong'

function getPasswordStrength(p: string): { level: Strength; label: string; color: string; pct: number } {
  if (p.length < 8) return { level: 'too-short', label: 'Too short (min 8)', color: 'bg-rose-500', pct: 15 }
  const hasLetter = /[a-zA-Z]/.test(p)
  const hasNumber = /[0-9]/.test(p)
  const hasSpecial = /[^a-zA-Z0-9]/.test(p)
  if (!hasLetter || !hasNumber) return { level: 'weak', label: 'Weak — needs letters & numbers', color: 'bg-orange-500', pct: 30 }
  if (p.length >= 8 && hasLetter && hasNumber && !hasSpecial)
    return { level: 'fair', label: 'Fair', color: 'bg-yellow-500', pct: 55 }
  if (p.length >= 10 && hasSpecial)
    return { level: 'strong', label: 'Strong', color: 'bg-emerald-500', pct: 100 }
  return { level: 'good', label: 'Good', color: 'bg-green-500', pct: 80 }
}

function validatePassword(p: string): string | null {
  const s = getPasswordStrength(p)
  if (s.level === 'too-short') return 'Password must be at least 8 characters.'
  if (s.level === 'weak') return 'Password must contain at least one letter AND one number.'
  return null
}

// ── Component ─────────────────────────────────────────────────────────────────
export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { signIn, signUp } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState<UserRole>('community_user');

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Username availability
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle');
  const [usernameError, setUsernameError] = useState<string | null>(null);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Debounced username availability check
  useEffect(() => {
    if (!isSignUp || !username) {
      setUsernameStatus('idle');
      setUsernameError(null);
      return;
    }
    const validationError = validateUsername(username);
    if (validationError) {
      setUsernameStatus('invalid');
      setUsernameError(validationError);
      return;
    }
    setUsernameStatus('checking');
    setUsernameError(null);
    const timer = setTimeout(async () => {
      const available = await authClient.isUsernameAvailable(username);
      setUsernameStatus(available ? 'available' : 'taken');
      if (!available) setUsernameError('This username is already taken.');
    }, 500);
    return () => clearTimeout(timer);
  }, [username, isSignUp]);

  const passwordStrength = getPasswordStrength(password);
  const passwordsMatch = confirmPassword === '' || password === confirmPassword;

  const resetForm = () => {
    setEmail(''); setPassword(''); setConfirmPassword('');
    setFullName(''); setUsername(''); setRole('community_user');
    setError(null); setSuccess(null);
    setUsernameStatus('idle'); setUsernameError(null);
    setShowPassword(false); setShowConfirm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (isSignUp) {
      if (!fullName.trim() || !email.trim() || !password || !confirmPassword || !username.trim()) {
        setError('Please fill in all fields.');
        return;
      }
      const usernameValidationErr = validateUsername(username);
      if (usernameValidationErr) { setError(usernameValidationErr); return; }
      if (usernameStatus === 'taken') { setError('That username is already taken.'); return; }
      if (usernameStatus === 'checking') { setError('Still checking username availability, please wait.'); return; }
      const pwErr = validatePassword(password);
      if (pwErr) { setError(pwErr); return; }
      if (password !== confirmPassword) { setError('Passwords do not match.'); return; }

      setLoading(true);
      const res = await signUp(email, password, fullName, username.toLowerCase(), role);
      setLoading(false);
      if (res.success) {
        setSuccess('Account created! Welcome aboard.');
        setTimeout(() => { onClose(); resetForm(); }, 1500);
      } else {
        setError(res.error || 'Failed to sign up.');
      }
    } else {
      if (!email.trim() || !password) { setError('Please enter your email and password.'); return; }
      setLoading(true);
      const res = await signIn(email, password);
      setLoading(false);
      if (res.success) {
        setSuccess('Logged in successfully!');
        setTimeout(() => { onClose(); resetForm(); }, 1200);
      } else {
        setError(res.error || 'Failed to sign in.');
      }
    }
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-background/80 backdrop-blur-md"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="relative z-10 w-full max-w-md max-h-[92vh] overflow-y-auto rounded-2xl border border-border bg-card shadow-2xl p-6 md:p-8"
          >
            {/* Close */}
            <button onClick={onClose} className="absolute right-4 top-4 rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
              <X className="size-4" />
            </button>

            {/* Header */}
            <div className="text-center mb-6">
              <div className="mx-auto flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary mb-3">
                <Sparkles className="size-5" />
              </div>
              <h2 className="text-xl font-bold tracking-tight">
                {isSignUp ? 'Create your Account' : 'Welcome to UrbanPulse'}
              </h2>
              <p className="mt-1.5 text-xs text-muted-foreground">
                {isSignUp ? 'Join the community or register as admin' : 'Sign in to your account'}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">

              {/* ── Sign Up only fields ─── */}
              {isSignUp && (
                <>
                  {/* Full Name */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-foreground">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                      <input
                        type="text" placeholder="Jane Doe" value={fullName}
                        onChange={e => setFullName(e.target.value)}
                        className="w-full rounded-lg border border-border bg-muted/50 py-2 pl-9 pr-4 text-sm outline-none focus:border-primary/50 focus:bg-background transition-all"
                      />
                    </div>
                  </div>

                  {/* Username */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-foreground">Username</label>
                    <div className="relative">
                      <AtSign className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="jane_doe123"
                        value={username}
                        onChange={e => setUsername(e.target.value.toLowerCase())}
                        maxLength={20}
                        className={`w-full rounded-lg border py-2 pl-9 pr-10 text-sm outline-none transition-all bg-muted/50 focus:bg-background ${
                          usernameStatus === 'available' ? 'border-emerald-500 focus:border-emerald-500' :
                          usernameStatus === 'taken' || usernameStatus === 'invalid' ? 'border-rose-500 focus:border-rose-500' :
                          'border-border focus:border-primary/50'
                        }`}
                      />
                      {/* Status icon */}
                      <div className="absolute right-3 top-2.5">
                        {usernameStatus === 'checking' && <Loader2 className="size-4 text-muted-foreground animate-spin" />}
                        {usernameStatus === 'available' && <CheckCircle2 className="size-4 text-emerald-500" />}
                        {(usernameStatus === 'taken' || usernameStatus === 'invalid') && <XCircle className="size-4 text-rose-500" />}
                      </div>
                    </div>
                    {usernameError && (
                      <p className="text-[11px] text-rose-500 flex items-center gap-1">
                        <XCircle className="size-3 shrink-0" /> {usernameError}
                      </p>
                    )}
                    {usernameStatus === 'available' && (
                      <p className="text-[11px] text-emerald-500 flex items-center gap-1">
                        <CheckCircle2 className="size-3 shrink-0" /> @{username} is available!
                      </p>
                    )}
                    <p className="text-[10px] text-muted-foreground">Lowercase letters, numbers and . _ @ # $ only. 3–20 chars.</p>
                  </div>
                </>
              )}

              {/* Email / Username */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-foreground">
                  {isSignUp ? 'Email Address' : 'Email or Username'}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                  <input
                    type={isSignUp ? 'email' : 'text'}
                    placeholder={isSignUp ? 'email@example.com' : 'email@example.com or @username'}
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full rounded-lg border border-border bg-muted/50 py-2 pl-9 pr-4 text-sm outline-none focus:border-primary/50 focus:bg-background transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-foreground">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••" value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full rounded-lg border border-border bg-muted/50 py-2 pl-9 pr-10 text-sm outline-none focus:border-primary/50 focus:bg-background transition-all"
                  />
                  <button type="button" onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors">
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>

                {/* Password strength bar (sign up only) */}
                {isSignUp && password.length > 0 && (
                  <div className="mt-1 space-y-1">
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${passwordStrength.color} transition-all`}
                        animate={{ width: `${passwordStrength.pct}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                    <p className={`text-[11px] font-medium ${
                      passwordStrength.level === 'strong' ? 'text-emerald-500' :
                      passwordStrength.level === 'good' ? 'text-green-500' :
                      passwordStrength.level === 'fair' ? 'text-yellow-500' :
                      'text-rose-500'
                    }`}>{passwordStrength.label}</p>
                  </div>
                )}
              </div>

              {/* Confirm Password (sign up only) */}
              {isSignUp && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-foreground">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      placeholder="••••••••" value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      className={`w-full rounded-lg border py-2 pl-9 pr-10 text-sm outline-none transition-all bg-muted/50 focus:bg-background ${
                        confirmPassword && !passwordsMatch
                          ? 'border-rose-500 focus:border-rose-500'
                          : confirmPassword && passwordsMatch
                          ? 'border-emerald-500 focus:border-emerald-500'
                          : 'border-border focus:border-primary/50'
                      }`}
                    />
                    <button type="button" onClick={() => setShowConfirm(v => !v)}
                      className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors">
                      {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                  {confirmPassword && !passwordsMatch && (
                    <p className="text-[11px] text-rose-500 flex items-center gap-1">
                      <XCircle className="size-3" /> Passwords do not match.
                    </p>
                  )}
                  {confirmPassword && passwordsMatch && (
                    <p className="text-[11px] text-emerald-500 flex items-center gap-1">
                      <CheckCircle2 className="size-3" /> Passwords match!
                    </p>
                  )}
                </div>
              )}

              {/* Portal selector (sign up only) */}
              {isSignUp && (
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-foreground">Select Portal Access</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button type="button" onClick={() => setRole('community_user')}
                      className={`flex items-center justify-center gap-2 rounded-lg border p-2.5 text-xs font-bold transition-all cursor-pointer ${
                        role === 'community_user'
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}>
                      <UserCheck className="size-3.5" /> Community Portal
                    </button>
                    <button type="button" onClick={() => setRole('admin')}
                      className={`flex items-center justify-center gap-2 rounded-lg border p-2.5 text-xs font-bold transition-all cursor-pointer ${
                        role === 'admin'
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}>
                      <ShieldAlert className="size-3.5" /> Admin Portal
                    </button>
                  </div>
                </div>
              )}

              {/* Status messages */}
              {error && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-2.5 text-xs text-destructive flex items-start gap-2">
                  <AlertCircle className="size-3.5 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}
              {success && (
                <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-2.5 text-xs text-green-500 flex items-start gap-2">
                  <CheckCircle2 className="size-3.5 shrink-0 mt-0.5" />
                  <span>{success}</span>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit" disabled={loading}
                className="w-full rounded-lg bg-primary py-2.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 hover:scale-[1.01] hover:brightness-105 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? <Loader2 className="size-4 animate-spin" /> : isSignUp ? 'Create Account' : 'Sign In'}
              </button>
            </form>

            {/* Toggle */}
            <div className="mt-5 text-center text-xs">
              <span className="text-muted-foreground">
                {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
              </span>
              <button onClick={() => { setIsSignUp(!isSignUp); setError(null); setSuccess(null); resetForm(); }}
                className="font-bold text-primary hover:underline cursor-pointer">
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
