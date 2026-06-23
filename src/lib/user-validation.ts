import type { SupabaseClient } from '@supabase/supabase-js';
import type { User } from '@/types';

export function normalizeUsername(username: string): string {
  return username.trim().replace(/^@+/, '').toLowerCase();
}

/** Giriş için kullanıcı ara — PostgREST .or() ile @ karakteri güvenilir değil */
export async function findUsersForLogin(
  supabase: SupabaseClient,
  loginUsername: string
): Promise<User[]> {
  const normalized = normalizeUsername(loginUsername);
  if (!normalized) return [];

  const found = new Map<string, User>();

  const collect = (rows: User[] | null | undefined) => {
    for (const row of rows || []) {
      if (normalizeUsername(row.username) === normalized) {
        found.set(row.id, row);
      }
    }
  };

  const exact = await supabase.from('users').select('*').eq('username', normalized);
  if (!exact.error) collect(exact.data as User[]);

  if (!found.size) {
    const legacy = await supabase.from('users').select('*').eq('username', `@${normalized}`);
    if (!legacy.error) collect(legacy.data as User[]);
  }

  if (!found.size) {
    const ilike = await supabase.from('users').select('*').ilike('username', normalized);
    if (!ilike.error) collect(ilike.data as User[]);
  }

  return Array.from(found.values());
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
