import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import { MobileNeonQueryBuilder } from './neonFailover';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

const rawSupabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});

// Route all database queries to our live Neon Lakebase Postgres via https://travellounge.mu/api/db/query
const neonClient: any = Object.create(rawSupabase);
neonClient.from = (table: string) => new MobileNeonQueryBuilder(table);
neonClient.auth = rawSupabase.auth;
neonClient.storage = rawSupabase.storage;

export const supabase = neonClient;
