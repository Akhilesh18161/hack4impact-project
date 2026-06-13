import { supabase } from './supabase';

export type UserRole = 'admin' | 'community_user';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  avatarUrl?: string;
}

export interface AuthSession {
  user: UserProfile;
  token: string;
}

export const authClient = {
  // Sign Up new user
  signUp: async (email: string, password: string, fullName: string, role: UserRole): Promise<{ user: UserProfile | null; error: string | null }> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: role,
          }
        }
      });

      if (error) return { user: null, error: error.message };
      
      if (data.user) {
        // Create profile in public.profiles table
        const profileData = {
          id: data.user.id,
          email: data.user.email!,
          full_name: fullName,
          role: role,
        };
        
        const { error: profileError } = await supabase.from('profiles').insert([profileData]);
        
        if (profileError) {
          console.error("Profile creation error:", profileError);
          // If we fail to create the profile, we should probably still return the auth user, but it might cause issues later.
          // In a real app we might want to handle this more gracefully.
        }

        const profile: UserProfile = {
          id: profileData.id,
          email: profileData.email,
          fullName: profileData.full_name,
          role: profileData.role as UserRole,
        };

        return { user: profile, error: null };
      }
      
      return { user: null, error: 'Unknown error during sign up' };
    } catch (err: any) {
      return { user: null, error: err.message };
    }
  },

  // Sign In existing user
  signIn: async (email: string, password: string): Promise<{ session: AuthSession | null; error: string | null }> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) return { session: null, error: error.message };

      if (data.session && data.user) {
        // Fetch user profile from public.profiles
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();
          
        if (profileError) {
          console.error("Error fetching profile:", profileError);
          return { session: null, error: 'Could not load user profile' };
        }

        const profile: UserProfile = {
          id: profileData.id,
          email: profileData.email,
          fullName: profileData.full_name,
          role: profileData.role as UserRole,
          avatarUrl: profileData.avatar_url,
        };

        const authSession: AuthSession = {
          user: profile,
          token: data.session.access_token,
        };

        return { session: authSession, error: null };
      }
      
      return { session: null, error: 'Unknown error during sign in' };
    } catch (err: any) {
      return { session: null, error: err.message };
    }
  },

  // Sign Out
  signOut: async (): Promise<{ error: string | null }> => {
    const { error } = await supabase.auth.signOut();
    return { error: error ? error.message : null };
  },

  // Get current active session
  // Note: Since we need this synchronously in AuthProvider initial render but Supabase is async,
  // we will have to return null and let the components fetch session via supabase.auth.getSession() or similar.
  // We'll update the AuthProvider to handle this.
  getSession: (): AuthSession | null => {
    // This is a synchronous mock return, for real implementation AuthProvider needs to use await authClient.getSessionAsync()
    return null;
  },

  getSessionAsync: async (): Promise<AuthSession | null> => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || !session.user) return null;

    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (!profileData) return null;

    const profile: UserProfile = {
      id: profileData.id,
      email: profileData.email,
      fullName: profileData.full_name,
      role: profileData.role as UserRole,
      avatarUrl: profileData.avatar_url,
    };

    return {
      user: profile,
      token: session.access_token,
    };
  },

  // Get all registered users
  getAllUsers: async (): Promise<UserProfile[]> => {
    const { data, error } = await supabase.from('profiles').select('*');
    if (error) return [];
    
    return data.map(u => ({
      id: u.id,
      email: u.email,
      fullName: u.full_name,
      role: u.role as UserRole,
      avatarUrl: u.avatar_url
    }));
  }
};

