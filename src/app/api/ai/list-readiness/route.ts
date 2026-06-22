import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { createServerClient } from '@/lib/supabase/server';
import { dayMenuToFlat, rowsToDayMap } from '@/lib/menu-storage';
import { snapshotHeadcount } from '@/lib/sync-ai-list-quantities';

const MIN_PARTICIPANTS = 2;

export async function GET() {
  const session = await getSession();
  if (!session.isLoggedIn || session.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 });
  }

  const campaignId = session.user.campaign_id;
  const supabase = createServerClient();

  const [usersRes, tentsRes, menusRes, campaignRes] = await Promise.all([
    supabase.from('users').select('id, age, tent_id, role').eq('campaign_id', campaignId),
    supabase.from('tents').select('id').eq('campaign_id', campaignId),
    supabase.from('menus').select('id, day, meal_type, description').eq('campaign_id', campaignId),
    supabase
      .from('campaigns')
      .select('list_baseline_headcount, list_generated_at')
      .eq('id', campaignId)
      .single(),
  ]);

  const users = usersRes.data || [];
  const tents = tentsRes.data || [];
  const headcount = snapshotHeadcount(users);
  const usersWithoutTent = users.filter((u) => !u.tent_id).length;

  const dayMap = rowsToDayMap(menusRes.data || []);
  const flatMenus = Array.from(dayMap.entries()).flatMap(([day, { content }]) =>
    dayMenuToFlat(day, content)
  );
  const hasMenu = flatMenus.some((m) => m.description?.trim());

  const errors: string[] = [];

  if (headcount.total < MIN_PARTICIPANTS) {
    errors.push(
      `En az ${MIN_PARTICIPANTS} kişi kayıtlı olmalı. Şu an ${headcount.total} kişi var — önce Kişiler bölümünden ekleyin.`
    );
  }
  if (!tents.length) {
    errors.push('En az bir çadır tanımlanmalı.');
  }
  if (usersWithoutTent > 0) {
    errors.push(`${usersWithoutTent} kişinin çadırı atanmamış — önce çadır atayın.`);
  }
  if (!hasMenu) {
    errors.push('Önce menü tariflerini girin.');
  }

  return NextResponse.json({
    ready: errors.length === 0,
    errors,
    participantCount: headcount.total,
    adultCount: headcount.adults,
    childCount: headcount.children,
    tentCount: tents.length,
    usersWithoutTent,
    hasMenu,
    listBaselineHeadcount: campaignRes.data?.list_baseline_headcount ?? null,
    listGeneratedAt: campaignRes.data?.list_generated_at ?? null,
    minParticipants: MIN_PARTICIPANTS,
  });
}
