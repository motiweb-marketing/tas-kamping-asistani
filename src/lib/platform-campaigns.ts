import type { SupabaseClient } from '@supabase/supabase-js';

export interface PlatformCampaignSummary {
  id: string;
  name: string;
  location: string;
  plan_tier: 'trial' | 'paid';
  max_tents: number;
  max_users: number;
  use_platform_ai: boolean;
  platform_notes: string | null;
  owner_contact_name: string | null;
  owner_contact_email: string | null;
  start_date: string;
  end_date: string;
  created_at: string;
  tents_count: number;
  users_count: number;
  last_login_at: string | null;
  admin_username: string | null;
  admin_name: string | null;
}

export async function listPlatformCampaigns(
  supabase: SupabaseClient
): Promise<PlatformCampaignSummary[]> {
  const { data: campaigns, error } = await supabase
    .from('campaigns')
    .select(
      'id, name, location, plan_tier, max_tents, max_users, use_platform_ai, platform_notes, owner_contact_name, owner_contact_email, start_date, end_date, created_at, admin_id'
    )
    .order('created_at', { ascending: false });

  if (error || !campaigns?.length) return [];

  const ids = campaigns.map((c) => c.id);

  const [tentsRes, usersRes, adminsRes] = await Promise.all([
    supabase.from('tents').select('campaign_id').in('campaign_id', ids),
    supabase.from('users').select('campaign_id, last_login_at, role, username, name, id').in('campaign_id', ids),
    supabase
      .from('users')
      .select('id, username, name')
      .in(
        'id',
        campaigns.map((c) => c.admin_id).filter(Boolean) as string[]
      ),
  ]);

  const adminById = new Map((adminsRes.data || []).map((a) => [a.id, a]));
  const tentCounts = new Map<string, number>();
  for (const t of tentsRes.data || []) {
    tentCounts.set(t.campaign_id, (tentCounts.get(t.campaign_id) || 0) + 1);
  }

  const userStats = new Map<string, { count: number; last_login: string | null }>();
  for (const u of usersRes.data || []) {
    const cur = userStats.get(u.campaign_id) || { count: 0, last_login: null };
    cur.count += 1;
    if (u.last_login_at) {
      if (!cur.last_login || u.last_login_at > cur.last_login) {
        cur.last_login = u.last_login_at;
      }
    }
    userStats.set(u.campaign_id, cur);
  }

  return campaigns.map((c) => {
    const admin = c.admin_id ? adminById.get(c.admin_id) : null;
    const stats = userStats.get(c.id);
    return {
      id: c.id,
      name: c.name,
      location: c.location,
      plan_tier: (c.plan_tier as 'trial' | 'paid') || 'trial',
      max_tents: c.max_tents,
      max_users: c.max_users,
      use_platform_ai: !!c.use_platform_ai,
      platform_notes: c.platform_notes ?? null,
      owner_contact_name: c.owner_contact_name ?? null,
      owner_contact_email: c.owner_contact_email ?? null,
      start_date: c.start_date,
      end_date: c.end_date,
      created_at: c.created_at,
      tents_count: tentCounts.get(c.id) || 0,
      users_count: stats?.count || 0,
      last_login_at: stats?.last_login ?? null,
      admin_username: admin?.username ?? null,
      admin_name: admin?.name ?? null,
    };
  });
}
