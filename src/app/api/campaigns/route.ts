import { NextRequest, NextResponse } from 'next/server';
import { hashPassword } from '@/lib/auth';
import { formatPersonName, formatTitleCase } from '@/lib/format';
import { getSession } from '@/lib/session';
import { createServerClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      location = 'Taş Kamping',
      start_date,
      end_date,
      admin_name,
      admin_username,
      admin_password,
      admin_age,
    } = body;

    if (!name || !start_date || !end_date || !admin_name || !admin_username || !admin_password) {
      return NextResponse.json({ error: 'Eksik alanlar var' }, { status: 400 });
    }

    const supabase = createServerClient();
    const password_hash = await hashPassword(admin_password);

    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .insert({
        name: formatTitleCase(name),
        location: formatTitleCase(location),
        start_date,
        end_date,
        admin_id: null,
      })
      .select()
      .single();

    if (campaignError || !campaign) {
      return NextResponse.json({ error: campaignError?.message || 'Kamp oluşturulamadı' }, { status: 500 });
    }

    const { data: admin, error: adminError } = await supabase
      .from('users')
      .insert({
        campaign_id: campaign.id,
        name: formatPersonName(admin_name),
        age: admin_age || 30,
        role: 'admin',
        username: admin_username,
        password_hash,
        tent_id: null,
      })
      .select()
      .single();

    if (adminError || !admin) {
      await supabase.from('campaigns').delete().eq('id', campaign.id);
      return NextResponse.json({ error: adminError?.message || 'Admin oluşturulamadı' }, { status: 500 });
    }

    await supabase.from('campaigns').update({ admin_id: admin.id }).eq('id', campaign.id);

    const session = await getSession();
    session.user = {
      id: admin.id,
      campaign_id: campaign.id,
      tent_id: null,
      name: admin.name,
      age: admin.age,
      role: 'admin',
      username: admin.username,
    };
    session.isLoggedIn = true;
    await session.save();

    const { password_hash: _, ...safeAdmin } = admin;
    return NextResponse.json({ campaign, admin: safeAdmin });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Kamp oluşturulamadı';
    console.error('POST /api/campaigns:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('campaigns')
    .select('id, name, location, start_date, end_date')
    .order('start_date', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ campaigns: data });
}
