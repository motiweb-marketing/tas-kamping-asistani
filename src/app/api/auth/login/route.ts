import { NextRequest, NextResponse } from 'next/server';
import { verifyPassword, toSessionUser } from '@/lib/auth';
import { normalizeUsername } from '@/lib/user-validation';
import { getSession } from '@/lib/session';
import { createServerClient } from '@/lib/supabase/server';

function redirectForRole(role: string): string {
  return '/home';
}

export async function POST(request: NextRequest) {
  try {
    const { username, password, campaign_id } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Kullanıcı adı ve şifre gerekli' }, { status: 400 });
    }

    const loginUsername = normalizeUsername(String(username));
    const supabase = createServerClient();

    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', loginUsername);

    if (error || !users?.length) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 401 });
    }

    let user = users[0];
    if (campaign_id) {
      const matched = users.find((u) => u.campaign_id === campaign_id);
      if (!matched) {
        return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 401 });
      }
      user = matched;
    } else if (users.length > 1) {
      return NextResponse.json(
        { error: 'Bu kullanıcı adı birden fazla kampta kayıtlı. Organizatörle iletişime geçin.' },
        { status: 400 }
      );
    }

    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) {
      return NextResponse.json({ error: 'Şifre hatalı' }, { status: 401 });
    }

    await supabase
      .from('users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', user.id);

    const session = await getSession();
    session.platformAdmin = false;
    session.user = toSessionUser(user);
    session.isLoggedIn = true;
    await session.save();

    const { password_hash: _, ...safeUser } = user;
    return NextResponse.json({
      user: safeUser,
      redirectTo: redirectForRole(user.role),
    });
  } catch {
    return NextResponse.json({ error: 'Giriş başarısız' }, { status: 500 });
  }
}
