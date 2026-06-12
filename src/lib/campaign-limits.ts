import type { SupabaseClient } from '@supabase/supabase-js';
import { SITE } from '@/lib/site-config';

export type PlanTier = 'trial' | 'paid';

export interface CampaignLimits {
  plan_tier: PlanTier;
  max_tents: number;
  max_users: number;
  tents_used: number;
  users_used: number;
  can_add_tent: boolean;
  can_add_user: boolean;
}

export function limitErrorMessage(kind: 'tent' | 'user', limits: CampaignLimits): string {
  const base =
    kind === 'tent'
      ? `Deneme sürümünde en fazla ${limits.max_tents} çadır ekleyebilirsiniz.`
      : `Deneme sürümünde en fazla ${limits.max_users} kişi ekleyebilirsiniz.`;
  return `${base} Tam sürüm için iletişime geçin.`;
}

export async function getCampaignLimits(
  supabase: SupabaseClient,
  campaignId: string
): Promise<CampaignLimits> {
  const [campaignRes, tentsRes, usersRes] = await Promise.all([
    supabase
      .from('campaigns')
      .select('plan_tier, max_tents, max_users')
      .eq('id', campaignId)
      .single(),
    supabase
      .from('tents')
      .select('id', { count: 'exact', head: true })
      .eq('campaign_id', campaignId),
    supabase
      .from('users')
      .select('id', { count: 'exact', head: true })
      .eq('campaign_id', campaignId),
  ]);

  const plan_tier = (campaignRes.data?.plan_tier as PlanTier) || 'trial';
  const max_tents = Number(campaignRes.data?.max_tents ?? 1);
  const max_users = Number(campaignRes.data?.max_users ?? 2);
  const tents_used = tentsRes.count ?? 0;
  const users_used = usersRes.count ?? 0;

  return {
    plan_tier,
    max_tents,
    max_users,
    tents_used,
    users_used,
    can_add_tent: tents_used < max_tents,
    can_add_user: users_used < max_users,
  };
}

export function upgradeHint(): { site_url: string } {
  return { site_url: SITE.url };
}
