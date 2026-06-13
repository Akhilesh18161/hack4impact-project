'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authClient, UserProfile, UserRole } from '@/lib/auth-client';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error: string | null }>;
  signUp: (email: string, password: string, fullName: string, username: string, role: UserRole) => Promise<{ success: boolean; error: string | null }>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  isCommunityUser: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let subscription: any = null;

    const initSession = async () => {
      const session = await authClient.getSessionAsync();
      if (session) setUser(session.user);
      setLoading(false);

      const { supabase } = await import('@/lib/supabase');
      const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session) {
          const s = await authClient.getSessionAsync();
          setUser(s?.user || null);
        } else {
          setUser(null);
        }
      });
      subscription = data.subscription;
    };

    initSession();
    return () => { if (subscription) subscription.unsubscribe(); };
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    const { session, error } = await authClient.signIn(email, password);
    if (session) {
      setUser(session.user);
      setLoading(false);
      return { success: true, error: null };
    }
    setLoading(false);
    return { success: false, error };
  };

  const signUp = async (email: string, password: string, fullName: string, username: string, role: UserRole) => {
    setLoading(true);
    const { user: newUser, error } = await authClient.signUp(email, password, fullName, username, role);
    if (newUser) {
      setUser(newUser);
      setLoading(false);
      return { success: true, error: null };
    }
    setLoading(false);
    return { success: false, error };
  };

  const signOut = async () => {
    setLoading(true);
    await authClient.signOut();
    setUser(null);
    setLoading(false);
  };

  const isAdmin = user?.role === 'admin';
  const isCommunityUser = user?.role === 'community_user';

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, isAdmin, isCommunityUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
