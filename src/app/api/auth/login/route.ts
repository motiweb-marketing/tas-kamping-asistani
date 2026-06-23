import { NextRequest, NextResponse } from 'next/server';
import { verifyPassword, toSessionUser } from '@/lib/auth';
import { normalizeUsername } from '@/lib/user-validation';
import { getSession } from '@/lib/session';
import { createServerClient } from '@/lib/supabase/server';
import type { User } from '@/types';

function redirectForRole(_role: string): string {
  return '/home';
}

interface CampaignPick {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
}

type UserRow = User & {
  campaigns: { id: string; name: string; start_date: string; end_date: string } | null;
};

async function completeLogin(user: UserRow) {
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
    redirectTo: redirectForRole(user.role),
  });
}

export async function POST(request: NextRequest) {
  try {
    const { username, password, campaign_id } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Kullanıcı adı ve şifre gerekli' }, { status: 400 });
    }

    const loginUsername = normalizeUsername(String(username));
    const passwordInput = String(password).trim();
    if (!loginUsername || !passwordInput) {
      return NextResponse.json({ error: 'Kullanıcı adı ve şifre gerekli' }, { status: 400 });
    }

    const supabase = createServerClient();

    const { data: rawUsers, error } = await supabase
      .from('users')
      .select(
        `
        *,
        campaigns!inner(id, name, start_date, end_date)
      `
      )
      .or(`username.ilike.${loginUsername},username.ilike.@${loginUsername}`);

    const users = (rawUsers || []).filter(
      (u) => normalizeUsername(u.username) === loginUsername
    );

    if (error || !users.length) {
      return NextResponse.json({ error: 'Kullanıcı adı veya şifre hatalı' }, { status: 401 });
    }

    const rows = users as UserRow[];

    if (campaign_id) {
      const matched = rows.find((u) => u.campaign_id === campaign_id);
      if (!matched) {
        return NextResponse.json({ error: 'Kullanıcı adı veya şifre hatalı' }, { status: 401 });
      }
      const valid = await verifyPassword(passwordInput, matched.password_hash);
      if (!valid) {
        return NextResponse.json({ error: 'Kullanıcı adı veya şifre hatalı' }, { status: 401 });
      }
      return completeLogin(matched);
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
      return completeLogin(passwordMatches[0]);
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
