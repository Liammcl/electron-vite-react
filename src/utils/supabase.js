import { createClient } from '@supabase/supabase-js';

let supabaseInstance = null;

export const createSupabase = () => {
  if (!supabaseInstance) {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase environment variables');
    }

    supabaseInstance = createClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: false,
        },
        db: {
          schema: 'limq_dev' 
        }
      }
    );
  }
  return supabaseInstance;
};
export const supabase = createSupabase();
export const clearSupabaseInstance = () => {
  supabaseInstance = null;
};