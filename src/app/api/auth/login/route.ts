import { NextRequest, NextResponse } from 'next/server';
import { verifyPassword, toSessionUser } from '@/lib/auth';
import { findUsersForLogin } from '@/lib/user-validation';
import { getSession } from '@/lib/session';
import { createServerClient } from '@/lib/supabase/server';
import type { User } from '@/types';

interface CampaignPick {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
}

type UserRow = User & {
  campaigns: { id: string; name: string; start_date: string; end_date: string } | null;
};

function redirectAfterLogin(role: string, requested?: string): string {
  const redirect =
    requested &&
    requested.startsWith('/') &&
    !requested.startsWith('//') &&
    !requested.startsWith('/login')
      ? requested
      : null;

  if (redirect) {
    if (redirect.startsWith('/admin') && role !== 'admin') return '/home';
    return redirect;
  }

  return role === 'admin' ? '/admin' : '/home';
}

async function attachCampaigns(
  supabase: ReturnType<typeof createServerClient>,
  users: User[]
): Promise<UserRow[]> {
  const ids = Array.from(new Set(users.map((u) => u.campaign_id).filter(Boolean)));
  if (!ids.length) return users.map((u) => ({ ...u, campaigns: null }));

  const { data: campaigns } = await supabase
    .from('campaigns')
    .select('id, name, start_date, end_date')
    .in('id', ids);

  const byId = new Map((campaigns || []).map((c) => [c.id, c]));

  return users.map((u) => ({
    ...u,
    campaigns: byId.get(u.campaign_id) || null,
  }));
}

async function completeLogin(user: UserRow, redirect?: string) {
  const supabase = createServerClient();

  await supabase
    .from('users')
    .update({ last_login_at: new Date().toISOString() })
    .eq('id', user.id);

  const session = await getSession();
  session.platformAdmin = false;
  session.user = toSessionUser(user);
  session.isLoggedIn = true;
  await session.save();

  const { password_hash: _, campaigns: __, ...safeUser } = user;
  return NextResponse.json({
    user: safeUser,
    redirectTo: redirectAfterLogin(user.role, redirect),
  });
}

export async function POST(request: NextRequest) {
  try {
    const { username, password, campaign_id, redirect } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Kullanıcı adı ve şifre gerekli' }, { status: 400 });
    }

    const passwordInput = String(password).trim();
    if (!passwordInput) {
      return NextResponse.json({ error: 'Kullanıcı adı ve şifre gerekli' }, { status: 400 });
    }

    const supabase = createServerClient();
    const matchedUsers = await findUsersForLogin(supabase, String(username));

    if (!matchedUsers.length) {
      return NextResponse.json({ error: 'Kullanıcı adı veya şifre hatalı' }, { status: 401 });
    }

    const rows = (await attachCampaigns(supabase, matchedUsers)).filter((u) => u.campaigns);

    if (!rows.length) {
      return NextResponse.json({ error: 'Kullanıcı adı veya şifre hatalı' }, { status: 401 });
    }

    const redirectTo = typeof redirect === 'string' ? redirect : undefined;

    if (campaign_id) {
      const matched = rows.find((u) => u.campaign_id === campaign_id);
      if (!matched) {
        return NextResponse.json({ error: 'Kullanıcı adı veya şifre hatalı' }, { status: 401 });
      }
      const valid = await verifyPassword(passwordInput, matched.password_hash);
      if (!valid) {
        return NextResponse.json({ error: 'Kullanıcı adı veya şifre hatalı' }, { status: 401 });
      }
      return completeLogin(matched, redirectTo);
    }

    const passwordMatches: UserRow[] = [];
    for (const row of rows) {
      if (await verifyPassword(passwordInput, row.password_hash)) {
        passwordMatches.push(row);
      }
    }

    if (!passwordMatches.length) {
      return NextResponse.json({ error: 'Kullanıcı adı veya şifre hatalı' }, { status: 401 });
    }

    if (passwordMatches.length === 1) {
      return completeLogin(passwordMatches[0], redirectTo);
    }

    const pickCampaign: CampaignPick[] = passwordMatches.map((u) => ({
      id: u.campaign_id,
      name: u.campaigns?.name || 'Kamp',
      start_date: u.campaigns?.start_date || '',
      end_date: u.campaigns?.end_date || '',
    }));

    return NextResponse.json(
      {
        pickCampaign,
        message: 'Bu bilgilerle birden fazla kampa giriş yapılabiliyor. Kampınızı seçin.',
      },
      { status: 409 }
    );
  } catch {
    return NextResponse.json({ error: 'Giriş başarısız' }, { status: 500 });
  }
}
