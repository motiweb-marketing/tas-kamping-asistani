import { NextRequest, NextResponse } from 'next/server';
import { computeListReadiness, type ReadinessScope } from '@/lib/list-readiness';
import { getSession } from '@/lib/session';
import { createServerClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session.isLoggedIn || session.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 });
  }

  const scopeParam = request.nextUrl.searchParams.get('scope');
  const scope: ReadinessScope = scopeParam === 'headcount' ? 'headcount' : 'list';

  const supabase = createServerClient();
  const result = await computeListReadiness(supabase, session.user.campaign_id, scope);

  return NextResponse.json(result);
}
