import { supabase } from './supabase';

export type UserRole = 'admin' | 'community_user';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  username: string;
  phone?: string;
  role: UserRole;
  avatarUrl?: string;
}

export interface AuthSession {
  user: UserProfile;
  token: string;
}

/** Map a profiles row to UserProfile */
function mapProfile(p: any): UserProfile {
  return {
    id: p.id,
    email: p.email,
    fullName: p.full_name,
    username: p.username || '',
    phone: p.phone,
    role: p.role as UserRole,
    avatarUrl: p.avatar_url,
  };
}

export const authClient = {
  // ── Check username availability ───────────────────────────────────────────
  isUsernameAvailable: async (username: string): Promise<boolean> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username.toLowerCase())
      .maybeSingle();
    if (error) return false;
    return data === null; // null → not found → available
  },

  // ── Sign Up ───────────────────────────────────────────────────────────────
  signUp: async (
    email: string,
    password: string,
    fullName: string,
    username: string,
    role: UserRole,
  ): Promise<{ user: UserProfile | null; error: string | null }> => {
    try {
      // Final uniqueness guard (race-safe because DB has UNIQUE index)
      const available = await authClient.isUsernameAvailable(username);
      if (!available) {
        return { user: null, error: 'That username is already taken. Please choose another.' };
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName, username: username.toLowerCase(), role },
        },
      });

      if (error) return { user: null, error: error.message };

      if (data.user) {
        // Upsert the profile row (the DB trigger may create it; we add username on top)
        await supabase.from('profiles').upsert({
          id: data.user.id,
          email,
          full_name: fullName,
          username: username.toLowerCase(),
          role,
        });

        const profile: UserProfile = {
          id: data.user.id,
          email,
          fullName,
          username: username.toLowerCase(),
          role,
        };
        return { user: profile, error: null };
      }

      return { user: null, error: 'Unknown error during sign up' };
    } catch (err: any) {
      return { user: null, error: err.message };
    }
  },

  // ── Sign In (accepts email OR username) ────────────────────────────────────
  signIn: async (
    identifier: string,
    password: string,
  ): Promise<{ session: AuthSession | null; error: string | null }> => {
    try {
      // Resolve username → email if the input doesn't look like an email
      let email = identifier.trim()
      const looksLikeEmail = /^[^@]+@[^@]+\.[^@]+$/.test(email)

      if (!looksLikeEmail) {
        // Treat as username: look up the email in profiles
        const { data: profileRow, error: lookupError } = await supabase
          .from('profiles')
          .select('email')
          .eq('username', email.toLowerCase())
          .maybeSingle()

        if (lookupError || !profileRow) {
          return { session: null, error: 'No account found with that username.' }
        }
        email = profileRow.email
      }

      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { session: null, error: error.message };

      if (data.session && data.user) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileError) {
          return { session: null, error: 'Could not load user profile' };
        }

        return {
          session: { user: mapProfile(profileData), token: data.session.access_token },
          error: null,
        };
      }

      return { session: null, error: 'Unknown error during sign in' };
    } catch (err: any) {
      return { session: null, error: err.message };
    }
  },

  // ── Sign Out ──────────────────────────────────────────────────────────────
  signOut: async (): Promise<{ error: string | null }> => {
    const { error } = await supabase.auth.signOut();
    return { error: error ? error.message : null };
  },

  // ── Session helpers ───────────────────────────────────────────────────────
  getSession: (): AuthSession | null => null,

  getSessionAsync: async (): Promise<AuthSession | null> => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || !session.user) return null;

    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (!profileData) return null;

    return { user: mapProfile(profileData), token: session.access_token };
  },

  // ── Profile Updates ───────────────────────────────────────────────────────
  updateProfile: async (
    userId: string,
    updates: { fullName?: string; username?: string; phone?: string; avatarUrl?: string }
  ): Promise<{ error: string | null }> => {
    try {
      const payload: any = {}
      if (updates.fullName !== undefined) payload.full_name = updates.fullName
      if (updates.username !== undefined) payload.username = updates.username.toLowerCase()
      if (updates.phone !== undefined) payload.phone = updates.phone
      if (updates.avatarUrl !== undefined) payload.avatar_url = updates.avatarUrl

      const { error } = await supabase
        .from('profiles')
        .update(payload)
        .eq('id', userId)

      return { error: error ? error.message : null }
    } catch (err: any) {
      return { error: err.message }
    }
  },

  updatePassword: async (newPassword: string): Promise<{ error: string | null }> => {
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      return { error: error ? error.message : null }
    } catch (err: any) {
      return { error: err.message }
    }
  },

  // ── Admin helpers ─────────────────────────────────────────────────────────
  getAllUsers: async (): Promise<UserProfile[]> => {
    const { data, error } = await supabase.from('profiles').select('*');
    if (error) return [];
    return data.map(mapProfile);
  },
};
