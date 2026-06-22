import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// True only when both env vars are present. The UI checks this before using auth/db.
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

// Use safe placeholders when unconfigured so `createClient` doesn't throw at
// import-time (which would white-screen the app on Vercel). Calls will still
// fail at runtime, but the UI gates them behind `isSupabaseConfigured`.
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
);
