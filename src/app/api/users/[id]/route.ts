import { NextRequest, NextResponse } from 'next/server';
import { hashPassword } from '@/lib/auth';
import { formatPersonName } from '@/lib/format';
import { getSession } from '@/lib/session';
import { createServerClient } from '@/lib/supabase/server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session.isLoggedIn || session.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 });
  }

  const body = await request.json();
  const updates: Record<string, unknown> = {};

  if (body.name !== undefined) {
    const name = formatPersonName(String(body.name));
    if (!name) {
      return NextResponse.json({ error: 'Ad gerekli' }, { status: 400 });
    }
    updates.name = name;
  }
  if (body.age !== undefined) updates.age = Number(body.age);
  if (body.tent_id !== undefined) updates.tent_id = body.tent_id || null;
  if (body.username !== undefined) updates.username = String(body.username).trim();
  if (body.password) {
    updates.password_hash = await hashPassword(String(body.password));
  }

  if (!Object.keys(updates).length) {
    return NextResponse.json({ error: 'Güncellenecek alan yok' }, { status: 400 });
  }

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', params.id)
    .eq('campaign_id', session.user.campaign_id)
    .select('id, campaign_id, tent_id, name, age, role, username, created_at')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ user: data });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session.isLoggedIn || session.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 });
  }

  if (params.id === session.user.id) {
    return NextResponse.json({ error: 'Kendi hesabınızı silemezsiniz' }, { status: 400 });
  }

  const supabase = createServerClient();
  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', params.id)
    .eq('campaign_id', session.user.campaign_id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
