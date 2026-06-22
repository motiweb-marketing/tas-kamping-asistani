import type { SupabaseClient } from '@supabase/supabase-js';
import { getPlatformOpenRouterKey } from '@/lib/platform-settings';

interface CampaignAiRow {
  openrouter_api_key: string | null;
  use_platform_ai?: boolean | null;
  plan_tier?: 'trial' | 'paid' | null;
}

/** Pro kamplar platform anahtarını kullanır; müşteri kendi anahtarını girmek zorunda değil */
export function resolveOpenRouterKeyFromRow(
  campaign: CampaignAiRow | null | undefined,
  platformKey: string | null
): string | null {
  if (!campaign) return null;
  const isPro = campaign.plan_tier === 'paid';
  if ((isPro || campaign.use_platform_ai) && platformKey) {
    return platformKey;
  }
  const own = campaign.openrouter_api_key?.trim();
  return own || null;
}

export async function resolveOpenRouterKey(
  supabase: SupabaseClient,
  campaignId: string
): Promise<string | null> {
  const [campaignRes, platformKey] = await Promise.all([
    supabase
      .from('campaigns')
      .select('openrouter_api_key, use_platform_ai, plan_tier')
      .eq('id', campaignId)
      .single(),
    getPlatformOpenRouterKey(supabase),
  ]);
  return resolveOpenRouterKeyFromRow(campaignRes.data, platformKey);
}

export function openRouterKeySource(
  campaign: CampaignAiRow | null | undefined,
  platformKey: string | null
): 'platform' | 'own' | 'none' {
  if (!resolveOpenRouterKeyFromRow(campaign, platformKey)) return 'none';
  const isPro = campaign?.plan_tier === 'paid';
  if ((isPro || campaign?.use_platform_ai) && platformKey) return 'platform';
  return 'own';
}
