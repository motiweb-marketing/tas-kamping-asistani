import { NextResponse } from 'next/server';
import { getPlatformOpenRouterKey, isPlatformAiConfigured } from '@/lib/platform-settings';
import { openRouterKeySource } from '@/lib/resolve-openrouter-key';
import { getSession } from '@/lib/session';
import { createServerClient } from '@/lib/supabase/server';

/** Kampın AI kullanılabilirlik durumu (anahtar girişi artık müşteride değil) */
export async function GET() {
  const session = await getSession();
  if (!session.isLoggedIn || session.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 });
  }

  const supabase = createServerClient();
  const [campaignRes, platformKey] = await Promise.all([
    supabase
      .from('campaigns')
      .select('openrouter_api_key, use_platform_ai, plan_tier')
      .eq('id', session.user.campaign_id)
      .single(),
    getPlatformOpenRouterKey(supabase),
  ]);

  if (campaignRes.error) {
    return NextResponse.json({ error: campaignRes.error.message }, { status: 500 });
  }

  const data = campaignRes.data;
  const isPro = data?.plan_tier === 'paid';
  const source = openRouterKeySource(data, platformKey);
  const configured = source !== 'none';

  return NextResponse.json({
    configured,
    is_pro: isPro,
    masked_key: source === 'platform' ? 'Pro — AI dahil' : source === 'own' ? 'Eski anahtar' : '',
    ai_source: source,
    platform_ai_available: await isPlatformAiConfigured(supabase),
  });
}
