import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// Defensive initialization to prevent hard crash if environment variables are missing in APK
let supabaseInstance;
try {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase initialization failed: Missing environment variables');
    // We export a "fail-safe" proxy or similar, but for now just try-catch the creation
  }
  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });
} catch (error) {
  console.error('CRITICAL: Supabase client creation failed:', error);
  // Create a minimal placeholder to avoid further crashes during module evaluation
  const mockResult = Promise.resolve({ data: [], error: null });
  const mockQueryBuilder: any = {
    select: () => mockQueryBuilder,
    eq: () => mockQueryBuilder,
    single: () => mockResult,
    maybeSingle: () => mockResult,
    then: (cb: any) => mockResult.then(cb),
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
