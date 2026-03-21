import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Session, AuthChangeEvent } from '@supabase/supabase-js';

type AuthContextType = {
  session: Session | null;
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
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    getInitialSession();
    
    // Listen for auth changes
    // The Supabase client now handles SecureStore persistence automatically
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, newSession: Session | null) => {
        setSession(newSession);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const getInitialSession = async () => {
    try {
      const { data } = await supabase.auth.getSession();
      setSession(data?.session || null);
    } catch (error) {
      console.error('Error getting initial session:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const { error, data } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    
    setSession(data.session);
    return data;
  };

  const register = async (email: string, password: string, name: string) => {
    const { error, data } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    });
    
    if (error) throw error;
    
    if (data.session) {
      setSession(data.session);
    }
    
    return data;
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
    }
    setSession(null);
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
