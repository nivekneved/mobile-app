import React, { createContext, useContext, useState, useEffect } from 'react';

type AuthContextType = {
  session: any | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<any>;
  register: (email: string, password: string, name: string) => Promise<any>;
  logout: () => Promise<void>;
  signOut: () => Promise<void>;
  userId: string | undefined;
  userEmail: string | undefined;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Mock session for guest access
  const [session, setSession] = useState<any | null>({
    user: {
      id: 'mock-user-id',
      email: 'guest@example.com',
      user_metadata: { name: 'Guest' }
    }
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // No-op - immediately ready with guest session
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    console.log('Login called - bypassing in auth-free mode');
    return { success: true };
  };

  const register = async (email: string, password: string, name: string) => {
    console.log('Register called - bypassing in auth-free mode');
    return { success: true };
  };

  const logout = async () => {
    console.log('Logout called - bypassing in auth-free mode');
  };

  const signOut = logout;

  const value = {
    session,
    loading,
    login,
    register,
    logout,
    signOut,
    userId: session?.user?.id,
    userEmail: session?.user?.email,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

