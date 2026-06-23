import type { SupabaseClient } from '@supabase/supabase-js';

export function normalizeUsername(username: string): string {
  return username.trim().replace(/^@+/, '').toLowerCase();
}

export function mapUserDbError(message: string): string {
  if (message.includes('users_campaign_id_username_key')) {
    return 'Bu kullanıcı adı bu kampta zaten kullanılıyor. Farklı bir kullanıcı adı seçin.';
  }
  return message;
}

export async function isUsernameTaken(
  supabase: SupabaseClient,
  campaignId: string,
  username: string,
  excludeUserId?: string
): Promise<boolean> {
  const normalized = normalizeUsername(username);
  if (!normalized) return false;

  let query = supabase
    .from('users')
    .select('id')
    .eq('campaign_id', campaignId)
    .eq('username', normalized);

  if (excludeUserId) {
    query = query.neq('id', excludeUserId);
  }

  const { data } = await query.maybeSingle();
  return Boolean(data);
}
