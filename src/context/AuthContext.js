import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    getInitialSession();
    
    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        // Store session in AsyncStorage for persistence
        await AsyncStorage.setItem('authSession', JSON.stringify(session));
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const getInitialSession = async () => {
    try {
      // Get session from AsyncStorage first
      const sessionStr = await AsyncStorage.getItem('authSession');
      if (sessionStr) {
        const parsedSession = JSON.parse(sessionStr);
        setSession(parsedSession);
      }

      // Then get fresh session from Supabase
      const { data } = await supabase.auth.getSession();
      const currentSession = data?.session;
      
      if (currentSession) {
        setSession(currentSession);
        await AsyncStorage.setItem('authSession', JSON.stringify(currentSession));
      } else {
        // Clear any stored session if not authenticated
        await AsyncStorage.removeItem('authSession');
      }
    } catch (error) {
      console.error('Error getting initial session:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const { error, data } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      throw error;
    }
    
    setSession(data.session);
    await AsyncStorage.setItem('authSession', JSON.stringify(data.session));
    return data;
  };

  const register = async (email, password, name) => {
    const { error, data } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    });
    
    if (error) {
      throw error;
    }
    
    // Automatically sign in after registration
    if (data.session) {
      setSession(data.session);
      await AsyncStorage.setItem('authSession', JSON.stringify(data.session));
    }
    
    return data;
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
    }
    
    setSession(null);
    await AsyncStorage.removeItem('authSession');
  };

  const value = {
    session,
    loading,
    login,
    register,
    logout,  // Changed to logout to match the implementation
    userId: session?.user?.id,
    userEmail: session?.user?.email,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}