import { NextRequest, NextResponse } from 'next/server';
import { verifyPassword, toSessionUser } from '@/lib/auth';
import { getSession } from '@/lib/session';
import { createServerClient } from '@/lib/supabase/server';

type LoginMode = 'admin' | 'tent';

function redirectForRole(role: string): string {
  return role === 'admin' ? '/admin' : '/items';
}

export async function POST(request: NextRequest) {
  try {
    const { username, password, campaign_id, mode = 'tent' } = await request.json();
    const loginMode = mode as LoginMode;

    if (!username || !password) {
      return NextResponse.json({ error: 'Kullanıcı adı ve şifre gerekli' }, { status: 400 });
    }

    const supabase = createServerClient();

    if (loginMode === 'tent') {
      const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .eq('role', 'user');

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

      const session = await getSession();
      session.user = toSessionUser(user);
      session.isLoggedIn = true;
      await session.save();

      const { password_hash: _, ...safeUser } = user;
      return NextResponse.json({
        user: safeUser,
        redirectTo: redirectForRole(user.role),
      });
    }

    // Admin login
    const { data: admins, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .eq('role', 'admin');

    if (error || !admins?.length) {
      return NextResponse.json({ error: 'Admin bulunamadı' }, { status: 401 });
    }

    const user = campaign_id
      ? admins.find((a) => a.campaign_id === campaign_id) || null
      : admins.length === 1
        ? admins[0]
        : null;

    if (!user && admins.length > 1) {
      return NextResponse.json(
        { error: 'Birden fazla admin hesabı var. Doğru kamp için giriş yapın.' },
        { status: 400 }
      );
    }

    if (!user) {
      return NextResponse.json({ error: 'Admin bulunamadı' }, { status: 401 });
    }

    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) {
      return NextResponse.json({ error: 'Şifre hatalı' }, { status: 401 });
    }

    const session = await getSession();
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
