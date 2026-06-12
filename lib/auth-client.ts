// Mock Authentication Client for Local Testing
// This mimics the Supabase Auth API so it can be easily swapped for production later.

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

const STORAGE_USERS_KEY = 'urbanpulse_mock_users';
const STORAGE_SESSION_KEY = 'urbanpulse_mock_session';

// Helper to get all registered users
function getRegisteredUsers(): UserProfile[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STORAGE_USERS_KEY);
  if (!stored) {
    // Seed default admin and community user for testing
    const defaultUsers: (UserProfile & { passwordHash: string })[] = [
      {
        id: 'admin-1',
        email: 'admin@urbanpulse.com',
        fullName: 'System Administrator',
        role: 'admin',
        passwordHash: 'admin123', // In mock, we keep it simple
      },
      {
        id: 'user-1',
        email: 'citizen@urbanpulse.com',
        fullName: 'Aayush Kumar',
        role: 'community_user',
        passwordHash: 'user123',
      }
    ];
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(defaultUsers));
    return defaultUsers;
  }
  return JSON.parse(stored);
}

export const authClient = {
  // Sign Up new user
  signUp: async (email: string, password: string, fullName: string, role: UserRole): Promise<{ user: UserProfile | null; error: string | null }> => {
    await new Promise((resolve) => setTimeout(resolve, 800)); // Simulate network latency

    const users = getRegisteredUsers() as (UserProfile & { passwordHash: string })[];
    const exists = users.some(u => u.email.toLowerCase() === email.toLowerCase());

    if (exists) {
      return { user: null, error: 'A user with this email address already exists.' };
    }

    const newUser: UserProfile & { passwordHash: string } = {
      id: Math.random().toString(36).substr(2, 9),
      email: email.toLowerCase(),
      fullName,
      role,
      passwordHash: password, // In mock, simple plain-text check
    };

    users.push(newUser);
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));

    // Auto sign-in on sign-up
    const profile: UserProfile = {
      id: newUser.id,
      email: newUser.email,
      fullName: newUser.fullName,
      role: newUser.role,
    };

    authClient.setSession(profile);

    return { user: profile, error: null };
  },

  // Sign In existing user
  signIn: async (email: string, password: string): Promise<{ session: AuthSession | null; error: string | null }> => {
    await new Promise((resolve) => setTimeout(resolve, 800)); // Simulate network latency

    const users = getRegisteredUsers() as (UserProfile & { passwordHash: string })[];
    const matchedUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!matchedUser) {
      return { session: null, error: 'No user found with this email address.' };
    }

    if (matchedUser.passwordHash !== password) {
      return { session: null, error: 'Incorrect password. Please try again.' };
    }

    const profile: UserProfile = {
      id: matchedUser.id,
      email: matchedUser.email,
      fullName: matchedUser.fullName,
      role: matchedUser.role,
    };

    const session: AuthSession = {
      user: profile,
      token: 'mock-jwt-token-' + profile.id,
    };

    authClient.setSession(profile);

    return { session, error: null };
  },

  // Sign Out
  signOut: async (): Promise<{ error: string | null }> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_SESSION_KEY);
    }
    return { error: null };
  },

  // Get current active session
  getSession: (): AuthSession | null => {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem(STORAGE_SESSION_KEY);
    if (!stored) return null;
    try {
      const user = JSON.parse(stored) as UserProfile;
      return {
        user,
        token: 'mock-jwt-token-' + user.id,
      };
    } catch {
      return null;
    }
  },

  // Set session helper
  setSession: (user: UserProfile) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(user));
    }
  },
  
  // Get all registered users
  getAllUsers: async (): Promise<UserProfile[]> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return getRegisteredUsers().map(u => ({
      id: u.id,
      email: u.email,
      fullName: u.fullName,
      role: u.role,
      avatarUrl: u.avatarUrl
    }));
  }
};
