import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Giriş sayfasında kamp adını göstermek için (hassas veri yok). */
export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get('id')?.trim();
  if (!id || !UUID_RE.test(id)) {
    return NextResponse.json({ error: 'Geçersiz kamp' }, { status: 400 });
  }

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('campaigns')
    .select('id, name, start_date, end_date')
    .eq('id', id)
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json({ error: 'Kamp bulunamadı' }, { status: 404 });
  }

  return NextResponse.json({ campaign: data });
}
