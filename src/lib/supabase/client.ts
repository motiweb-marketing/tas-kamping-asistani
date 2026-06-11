import { createClient, SupabaseClient } from '@supabase/supabase-js';

export function createBrowserClient(): SupabaseClient<any> {
  return createClient<any>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
