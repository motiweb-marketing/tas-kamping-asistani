import { NextResponse } from 'next/server';
import { listPlatformCampaigns } from '@/lib/platform-campaigns';
import { isPlatformAiConfigured } from '@/lib/platform-settings';
import { requirePlatformAdmin } from '@/lib/platform-auth';
import { createServerClient } from '@/lib/supabase/server';

export async function GET() {
  const auth = await requirePlatformAdmin();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const supabase = createServerClient();
  const campaigns = await listPlatformCampaigns(supabase);

  const trial = campaigns.filter((c) => c.plan_tier === 'trial').length;
  const paid = campaigns.filter((c) => c.plan_tier === 'paid').length;
  const totalUsers = campaigns.reduce((s, c) => s + c.users_count, 0);
  const platformAi = campaigns.filter((c) => c.use_platform_ai).length;

  const platformAiAvailable = await isPlatformAiConfigured(supabase);

  return NextResponse.json({
    campaigns,
    stats: {
      total: campaigns.length,
      trial,
      paid,
      total_users: totalUsers,
      platform_ai: platformAi,
      platform_ai_available: platformAiAvailable,
    },
  });
}
