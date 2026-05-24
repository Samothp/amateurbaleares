import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
let supabase;

export function getSupabase() {
  if (supabase) return supabase;
  if (!supabaseUrl || !supabaseAnonKey) return null;
  supabase = createClient(supabaseUrl, supabaseAnonKey);
  return supabase;
}
