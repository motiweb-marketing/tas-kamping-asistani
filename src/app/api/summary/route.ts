import { NextResponse } from 'next/server';
import { enrichItemWithClaims, normalizeClaims } from '@/lib/item-claims';
import { syncStandardSharedItems } from '@/lib/sync-standard-items';
import { getSession } from '@/lib/session';
import { createServerClient } from '@/lib/supabase/server';
import type { ItemWithRelations, SummaryClaimLine } from '@/types';

export async function GET() {
  const session = await getSession();
  if (!session.isLoggedIn || !session.user) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  }

  const supabase = createServerClient();
  const campaignId = session.user.campaign_id;

  try {
    await syncStandardSharedItems(supabase, campaignId);
  } catch {
    /* migration pending */
  }

  const [itemsRes, claimsRes, tentsRes, expensesRes, usersRes] = await Promise.all([
    supabase
      .from('items')
      .select('*')
      .eq('campaign_id', campaignId)
      .eq('list_scope', 'shared')
      .eq('is_published', true)
      .eq('is_recommendation', false)
      .order('is_standard', { ascending: false })
      .order('name'),
    supabase
      .from('item_claims')
      .select('id, item_id, tent_id, quantity, tent:tents(id, name)'),
    supabase.from('tents').select('id, name').eq('campaign_id', campaignId),
    supabase
      .from('camp_expenses')
      .select('id, tent_id, item_id, amount, description, tent:tents(id, name), item:items(id, name)')
      .eq('campaign_id', campaignId)
      .order('created_at', { ascending: false })
      .limit(50),
    supabase.from('users').select('id', { count: 'exact', head: true }).eq('campaign_id', campaignId),
  ]);

  if (itemsRes.error) {
    return NextResponse.json({ error: itemsRes.error.message }, { status: 500 });
  }

  const claims = normalizeClaims((claimsRes.data || []) as Parameters<typeof normalizeClaims>[0]);
  const items = (itemsRes.data || []) as ItemWithRelations[];

  const lines: SummaryClaimLine[] = items.map((item) => {
    const enriched = enrichItemWithClaims(item, claims, null);
    return {
      item_id: item.id,
      item_name: item.name,
      needed_count: item.needed_count ?? 1,
      unit_label: item.unit_label || 'adet',
      disposition: item.disposition || 'consumable',
      is_standard: !!item.is_standard,
      claims: (enriched.claims || []).map((c) => ({
        tent_id: c.tent_id,
        tent_name: c.tent?.name || 'Çadır',
        quantity: c.quantity,
      })),
      claimed_total: enriched.claimed_total ?? 0,
      remaining: enriched.remaining_count ?? 0,
    };
  });

  const standardLines = lines.filter((l) => l.is_standard);
  const foodLines = lines.filter((l) => !l.is_standard);

  const completeCount = lines.filter((l) => l.remaining === 0).length;

  return NextResponse.json({
    total_people: usersRes.count || 0,
    tents: tentsRes.data || [],
    standard: standardLines,
    shared_food: foodLines,
    expenses: expensesRes.data || [],
    stats: {
      total_items: lines.length,
      fully_claimed: completeCount,
      open_items: lines.length - completeCount,
    },
  });
}
