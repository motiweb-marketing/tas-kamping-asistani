import { NextRequest, NextResponse } from 'next/server';
import { maskApiKey, isApiKeyConfigured } from '@/lib/api-key';
import {
  getPlatformOpenRouterKey,
  isPlatformAiConfigured,
  savePlatformOpenRouterKey,
} from '@/lib/platform-settings';
import { requirePlatformAdmin } from '@/lib/platform-auth';
import { createServerClient } from '@/lib/supabase/server';

export async function GET() {
  const auth = await requirePlatformAdmin();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const supabase = createServerClient();
  const key = await getPlatformOpenRouterKey(supabase);
  const configured = await isPlatformAiConfigured(supabase);

  return NextResponse.json({
    configured,
    masked_key: configured ? maskApiKey(key) : '',
  });
}

export async function PUT(request: NextRequest) {
  const auth = await requirePlatformAdmin();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { openrouter_api_key } = await request.json();
  if (!openrouter_api_key || typeof openrouter_api_key !== 'string') {
    return NextResponse.json({ error: 'openrouter_api_key gerekli' }, { status: 400 });
  }

  const supabase = createServerClient();
  const result = await savePlatformOpenRouterKey(supabase, openrouter_api_key);
  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  const key = await getPlatformOpenRouterKey(supabase);
  return NextResponse.json({
    configured: isApiKeyConfigured(key),
    masked_key: maskApiKey(key),
  });
}
