import { NextRequest, NextResponse } from 'next/server';
import { verifyPassword, toSessionUser } from '@/lib/auth';
import { getSession } from '@/lib/session';
import { createServerClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { username, password, campaign_id } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Kullanıcı adı ve şifre gerekli' }, { status: 400 });
    }

    const supabase = createServerClient();
    let query = supabase.from('users').select('*').eq('username', username);

    if (campaign_id) {
      query = query.eq('campaign_id', campaign_id);
    }

    const { data: users, error } = await query;

    if (error || !users?.length) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 401 });
    }

    const user = users[0];
    const valid = await verifyPassword(password, user.password_hash);

    if (!valid) {
      return NextResponse.json({ error: 'Şifre hatalı' }, { status: 401 });
    }

    const session = await getSession();
    session.user = toSessionUser(user);
    session.isLoggedIn = true;
    await session.save();

    const { password_hash: _, ...safeUser } = user;
    return NextResponse.json({ user: safeUser });
  } catch {
    return NextResponse.json({ error: 'Giriş başarısız' }, { status: 500 });
  }
}
