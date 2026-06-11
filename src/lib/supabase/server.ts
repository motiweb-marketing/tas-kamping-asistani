import { createClient, SupabaseClient } from '@supabase/supabase-js';

let _client: SupabaseClient<any> | null = null;

export function createServerClient(): SupabaseClient<any> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error('Supabase URL veya anahtar eksik');
  }

  if (!_client) {
    _client = createClient<any>(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }

  return _client;
}
