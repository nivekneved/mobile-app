import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

// Custom storage adapter for Supabase to use Expo SecureStore
const ExpoSecureStoreAdapter = {
  getItem: (key: string) => {
    return SecureStore.getItemAsync(key);
  },
  setItem: (key: string, value: string) => {
    return SecureStore.setItemAsync(key, value);
  },
  removeItem: (key: string) => {
    return SecureStore.deleteItemAsync(key);
  },
};

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// Defensive initialization to prevent hard crash if environment variables are missing in APK
let supabaseInstance;
try {
  // Use a placeholder if env vars are missing to prevent createClient from immediate throwing
  const effectiveUrl = supabaseUrl || 'https://placeholder-url.supabase.co';
  const effectiveKey = supabaseAnonKey || 'placeholder-key';

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase initialization using placeholders due to missing environment variables');
  }
  
  supabaseInstance = createClient(effectiveUrl, effectiveKey, {
    auth: {
      storage: ExpoSecureStoreAdapter as any,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });
} catch (error) {
  console.error('CRITICAL: Supabase client creation failed during evaluation:', error);
  // Create a minimal placeholder to avoid further crashes during module evaluation
  const mockResult = Promise.resolve({ data: [], error: null });
  const mockQueryBuilder: any = {
    select: () => mockQueryBuilder,
    eq: () => mockQueryBuilder,
    single: () => mockResult,
    maybeSingle: () => mockResult,
    then: (cb: any) => { cb({ data: [], error: null }); return mockResult; },
    catch: (cb: any) => mockResult.catch(cb),
  };
  
  supabaseInstance = {
    from: () => mockQueryBuilder,
    auth: {
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
    },
    rpc: () => Promise.resolve({ data: null, error: null }),
  } as any;
}

export const supabase = supabaseInstance;
