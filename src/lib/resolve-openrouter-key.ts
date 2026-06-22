import type { SupabaseClient } from '@supabase/supabase-js';
import { isPlatformAiAvailable } from '@/lib/platform-auth';

interface CampaignAiRow {
  openrouter_api_key: string | null;
  use_platform_ai?: boolean | null;
  plan_tier?: 'trial' | 'paid' | null;
}

/** Pro kamplar platform anahtarını kullanır; müşteri kendi anahtarını girmek zorunda değil */
export function resolveOpenRouterKeyFromRow(campaign: CampaignAiRow | null | undefined): string | null {
  if (!campaign) return null;
  const isPro = campaign.plan_tier === 'paid';
  if ((isPro || campaign.use_platform_ai) && isPlatformAiAvailable()) {
    return process.env.PLATFORM_OPENROUTER_API_KEY!.trim();
  }
  const own = campaign.openrouter_api_key?.trim();
  return own || null;
}

export async function resolveOpenRouterKey(
  supabase: SupabaseClient,
  campaignId: string
): Promise<string | null> {
  const { data } = await supabase
    .from('campaigns')
    .select('openrouter_api_key, use_platform_ai, plan_tier')
    .eq('id', campaignId)
    .single();
  return resolveOpenRouterKeyFromRow(data);
}

export function openRouterKeySource(campaign: CampaignAiRow | null | undefined): 'platform' | 'own' | 'none' {
  if (!resolveOpenRouterKeyFromRow(campaign)) return 'none';
  const isPro = campaign?.plan_tier === 'paid';
  if ((isPro || campaign?.use_platform_ai) && isPlatformAiAvailable()) return 'platform';
  return 'own';
}
