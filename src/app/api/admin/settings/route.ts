import { NextRequest, NextResponse } from 'next/server';
import { maskApiKey, isApiKeyConfigured } from '@/lib/api-key';
import { isPlatformAiAvailable } from '@/lib/platform-auth';
import { openRouterKeySource } from '@/lib/resolve-openrouter-key';
import { getSession } from '@/lib/session';
import { createServerClient } from '@/lib/supabase/server';

export async function GET() {
  const session = await getSession();
  if (!session.isLoggedIn || session.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 });
  }

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('campaigns')
    .select('openrouter_api_key, use_platform_ai')
    .eq('id', session.user.campaign_id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const key = data?.openrouter_api_key ?? null;
  const source = openRouterKeySource(data);
  const configured = source === 'platform' || isApiKeyConfigured(key);

  return NextResponse.json({
    configured,
    masked_key: source === 'platform' ? 'Platform AI (satıcı)' : maskApiKey(key),
    ai_source: source,
    use_platform_ai: !!data?.use_platform_ai,
    platform_ai_available: isPlatformAiAvailable(),
  });
}

export async function PUT(request: NextRequest) {
  const session = await getSession();
  if (!session.isLoggedIn || session.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 });
  }

  const { openrouter_api_key } = await request.json();

  if (!openrouter_api_key || typeof openrouter_api_key !== 'string' || !openrouter_api_key.trim()) {
    return NextResponse.json({ error: 'Geçerli bir API anahtarı girin' }, { status: 400 });
  }

  const trimmed = openrouter_api_key.trim();

  const supabase = createServerClient();
  const { error } = await supabase
    .from('campaigns')
    .update({ openrouter_api_key: trimmed })
    .eq('id', session.user.campaign_id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    configured: true,
    masked_key: maskApiKey(trimmed),
  });
}
