import type { SupabaseClient } from '@supabase/supabase-js';

const SETTINGS_ID = 'default';

export async function getPlatformOpenRouterKey(
  supabase: SupabaseClient
): Promise<string | null> {
  const { data } = await supabase
    .from('platform_settings')
    .select('openrouter_api_key')
    .eq('id', SETTINGS_ID)
    .maybeSingle();

  const dbKey = data?.openrouter_api_key?.trim();
  if (dbKey) return dbKey;

  return process.env.PLATFORM_OPENROUTER_API_KEY?.trim() || null;
}

export async function isPlatformAiConfigured(supabase: SupabaseClient): Promise<boolean> {
  const key = await getPlatformOpenRouterKey(supabase);
  return Boolean(key);
}

export async function savePlatformOpenRouterKey(
  supabase: SupabaseClient,
  openrouterApiKey: string
): Promise<{ error?: string }> {
  const trimmed = openrouterApiKey.trim();
  if (!trimmed) {
    return { error: 'Geçerli bir API anahtarı girin' };
  }

  const { error } = await supabase.from('platform_settings').upsert(
    {
      id: SETTINGS_ID,
      openrouter_api_key: trimmed,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'id' }
  );

  if (error) return { error: error.message };
  return {};
}
