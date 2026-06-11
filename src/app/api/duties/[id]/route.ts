import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { createServerClient } from '@/lib/supabase/server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session.isLoggedIn || !session.user) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  }

  const body = await request.json();
  const supabase = createServerClient();

  const { data: duty, error: fetchErr } = await supabase
    .from('camp_duties')
    .select('*')
    .eq('id', params.id)
    .eq('campaign_id', session.user.campaign_id)
    .single();

  if (fetchErr || !duty) {
    return NextResponse.json({ error: 'Görev bulunamadı' }, { status: 404 });
  }

  const isAdmin = session.user.role === 'admin';
  const updates: Record<string, unknown> = {};

  if (body.action === 'take') {
    if (!session.user.tent_id) {
      return NextResponse.json({ error: 'Bir çadıra atanmış olmalısınız' }, { status: 400 });
    }
    if (duty.assigned_tent_id && duty.assigned_tent_id !== session.user.tent_id) {
      return NextResponse.json({ error: 'Bu görev başka çadıra atanmış' }, { status: 400 });
    }
    updates.assigned_tent_id = session.user.tent_id;
    updates.assigned_user_id = session.user.id;
    updates.release_requested = false;
  } else if (body.action === 'request_release') {
    if (duty.assigned_user_id !== session.user.id && duty.assigned_tent_id !== session.user.tent_id) {
      return NextResponse.json({ error: 'Bu görev size ait değil' }, { status: 400 });
    }
    updates.release_requested = true;
  } else if (body.action === 'approve_release' && isAdmin) {
    updates.assigned_tent_id = null;
    updates.assigned_user_id = null;
    updates.release_requested = false;
  } else if (body.action === 'admin_assign' && isAdmin) {
    updates.assigned_tent_id = body.tent_id || null;
    updates.assigned_user_id = body.user_id || null;
    updates.release_requested = false;
  } else if (body.action === 'admin_unassign' && isAdmin) {
    updates.assigned_tent_id = null;
    updates.assigned_user_id = null;
    updates.release_requested = false;
  } else {
    return NextResponse.json({ error: 'Geçersiz işlem' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('camp_duties')
    .update(updates)
    .eq('id', params.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (body.action === 'take' || body.action === 'request_release') {
    const msg =
      body.action === 'take'
        ? `${session.user.name} "${duty.title}" görevini üstlendi`
        : `${session.user.name} "${duty.title}" görevini bırakmak istiyor (admin onayı bekleniyor)`;

    await supabase.from('chat_messages').insert({
      campaign_id: session.user.campaign_id,
      user_id: session.user.id,
      message: msg,
      is_system: true,
    });
  }

  return NextResponse.json({ duty: data });
}
