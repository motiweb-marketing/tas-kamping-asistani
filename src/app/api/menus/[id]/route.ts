import { NextRequest, NextResponse } from 'next/server';
import {
  parseCompositeId,
  removeEntry,
  rowToFlatMenus,
  updateEntryText,
} from '@/lib/menu-storage';
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

  const { description } = await request.json();
  if (description === undefined) {
    return NextResponse.json({ error: 'Açıklama gerekli' }, { status: 400 });
  }

  const { rowId, entryId } = parseCompositeId(params.id);
  const supabase = createServerClient();

  const { data: row, error: fetchErr } = await supabase
    .from('menus')
    .select('*')
    .eq('id', rowId)
    .eq('campaign_id', session.user.campaign_id)
    .single();

  if (fetchErr || !row) {
    return NextResponse.json({ error: 'Kayıt bulunamadı' }, { status: 404 });
  }

  const newDescription = updateEntryText(
    row.description,
    entryId,
    String(description).trim()
  );

  if (!newDescription) {
    const { data, error } = await supabase
      .from('menus')
      .update({ description: String(description).trim() })
      .eq('id', rowId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const menus = rowToFlatMenus(data);
    return NextResponse.json({ menu: menus[0] });
  }

  const { data, error } = await supabase
    .from('menus')
    .update({ description: newDescription })
    .eq('id', rowId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const menus = rowToFlatMenus(data);
  const updated = menus.find((m) => m.id === params.id) || menus[0];
  return NextResponse.json({ menu: updated });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session.isLoggedIn || session.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 });
  }

  const { rowId, entryId } = parseCompositeId(params.id);
  const supabase = createServerClient();

  const { data: row, error: fetchErr } = await supabase
    .from('menus')
    .select('*')
    .eq('id', rowId)
    .eq('campaign_id', session.user.campaign_id)
    .single();

  if (fetchErr || !row) {
    return NextResponse.json({ error: 'Kayıt bulunamadı' }, { status: 404 });
  }

  const newDescription = removeEntry(row.description, entryId);

  if (!newDescription) {
    const { error } = await supabase.from('menus').delete().eq('id', rowId);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  }

  const parsed = JSON.parse(newDescription) as { entries: unknown[] };
  if (parsed.entries.length === 0) {
    await supabase.from('menus').delete().eq('id', rowId);
    return NextResponse.json({ ok: true });
  }

  const { error } = await supabase
    .from('menus')
    .update({ description: newDescription })
    .eq('id', rowId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
