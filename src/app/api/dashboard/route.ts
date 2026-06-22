import { NextResponse } from 'next/server';
import { enrichItemWithClaims, normalizeClaims } from '@/lib/item-claims';
import { syncStandardSharedItems } from '@/lib/sync-standard-items';
import { getSession } from '@/lib/session';
import { createServerClient } from '@/lib/supabase/server';
import type { CampDutyWithRelations, ItemWithRelations } from '@/types';

export async function GET() {
  const session = await getSession();
  if (!session.isLoggedIn || !session.user) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  }

  const supabase = createServerClient();
  const campaignId = session.user.campaign_id;
  const tentId = session.user.tent_id;

  try {
    await syncStandardSharedItems(supabase, campaignId);
  } catch {
    /* migration pending */
  }

  const [
    campaignRes,
    itemsRes,
    claimsRes,
    personalRes,
    tentRes,
    dutiesRes,
    expensesRes,
    checksRes,
  ] = await Promise.all([
    supabase.from('campaigns').select('*').eq('id', campaignId).single(),
    supabase
      .from('items')
      .select('*')
      .eq('campaign_id', campaignId)
      .eq('list_scope', 'shared')
      .eq('is_published', true)
      .eq('is_recommendation', false),
    supabase.from('item_claims').select('id, item_id, tent_id, quantity, tent:tents(id, name)'),
    supabase
      .from('items')
      .select('*')
      .eq('campaign_id', campaignId)
      .eq('list_scope', 'personal')
      .eq('is_recommendation', true),
    supabase
      .from('items')
      .select('*')
      .eq('campaign_id', campaignId)
      .eq('list_scope', 'tent')
      .eq('is_recommendation', true),
    supabase
      .from('camp_duties')
      .select(`
        *,
        assigned_tent:tents!assigned_tent_id(id, name),
        assigned_user:users!assigned_user_id(id, name, role)
      `)
      .eq('campaign_id', campaignId)
      .order('slot_date'),
    supabase
      .from('camp_expenses')
      .select('id', { count: 'exact', head: true })
      .eq('campaign_id', campaignId),
    supabase
      .from('item_checks')
      .select('item_id, user_id, tent_id')
      .eq('campaign_id', campaignId),
  ]);

  const claims = normalizeClaims((claimsRes.data || []) as Parameters<typeof normalizeClaims>[0]);
  const sharedItems = ((itemsRes.data || []) as ItemWithRelations[]).map((item) =>
    enrichItemWithClaims(item, claims, tentId)
  );

  const openShared = sharedItems.filter((i) => (i.remaining_count ?? 0) > 0).length;
  const mySharedClaims = sharedItems.filter((i) => (i.my_claim || 0) > 0);

  const personalItems = (personalRes.data || []) as ItemWithRelations[];
  const tentItems = (tentRes.data || []) as ItemWithRelations[];
  const checks = checksRes.data || [];
  const userId = session.user.id;

  const personalWithChecks = personalItems.map((item) => ({
    ...item,
    checked: checks.some((c) => c.item_id === item.id && c.user_id === userId),
  }));
  const tentWithChecks = tentItems.map((item) => ({
    ...item,
    tent_checked: tentId
      ? checks.some((c) => c.item_id === item.id && c.tent_id === tentId)
      : false,
  }));

  const myPersonalUnchecked = personalWithChecks.filter((i) => !i.checked).length;
  const myTentUnchecked = tentWithChecks.filter((i) => !i.tent_checked).length;

  const duties = (dutiesRes.data || []) as CampDutyWithRelations[];
  const myDuties = duties.filter(
    (d) => d.assigned_tent_id === tentId || d.assigned_user_id === session.user!.id
  );
  const openDuties = duties.filter((d) => !d.assigned_tent_id).length;

  const campaign = campaignRes.data;
  const today = new Date().toISOString().slice(0, 10);
  const daysUntilStart = campaign?.start_date
    ? Math.ceil(
        (new Date(campaign.start_date).getTime() - new Date(today).getTime()) / (1000 * 60 * 60 * 24)
      )
    : null;

  const checklistTotal =
    mySharedClaims.length + personalWithChecks.length + tentWithChecks.length + myDuties.length;
  const checklistDone =
    personalWithChecks.filter((i) => i.checked).length +
    tentWithChecks.filter((i) => i.tent_checked).length;

  return NextResponse.json({
    campaign: campaign
      ? {
          name: campaign.name,
          location: campaign.location,
          start_date: campaign.start_date,
          end_date: campaign.end_date,
        }
      : null,
    user: {
      name: session.user.name,
      tent_id: tentId,
    },
    stats: {
      days_until_start: daysUntilStart,
      open_shared_items: openShared,
      my_shared_claims: mySharedClaims.length,
      my_personal_unchecked: myPersonalUnchecked,
      my_tent_unchecked: myTentUnchecked,
      my_duties: myDuties.length,
      open_duties: openDuties,
      expense_count: expensesRes.count || 0,
      checklist_total: checklistTotal,
      checklist_done: checklistDone,
    },
  });
}
