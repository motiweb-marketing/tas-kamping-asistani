import type { SupabaseClient } from '@supabase/supabase-js';
import {
  computeNeededCountFromQuantity,
  formatQuantityDisplay,
  scaleQuantityAmount,
} from '@/lib/quantity-parser';

export interface HeadcountSnapshot {
  total: number;
  adults: number;
  children: number;
}

export function snapshotHeadcount(users: { age: number }[]): HeadcountSnapshot {
  const adults = users.filter((u) => u.age >= 15).length;
  const children = users.length - adults;
  return { total: users.length, adults, children };
}

/** Kişi sayısı değişince AI üretimi ortak listeyi ölçekler. */
export async function syncAiListQuantities(
  supabase: SupabaseClient,
  campaignId: string
): Promise<{ updated: number; headcount: number }> {
  const { data: campaign, error: campErr } = await supabase
    .from('campaigns')
    .select('list_baseline_headcount')
    .eq('id', campaignId)
    .single();

  if (campErr) throw new Error(campErr.message);

  const baseline = campaign?.list_baseline_headcount;
  if (!baseline || baseline <= 0) {
    return { updated: 0, headcount: 0 };
  }

  const { data: users, error: userErr } = await supabase
    .from('users')
    .select('age')
    .eq('campaign_id', campaignId);

  if (userErr) throw new Error(userErr.message);

  const headcount = snapshotHeadcount(users || []);
  if (headcount.total === 0) return { updated: 0, headcount: 0 };
  if (headcount.total === baseline) return { updated: 0, headcount: headcount.total };

  const { data: items, error: itemErr } = await supabase
    .from('items')
    .select(
      'id, quantity_amount, quantity_unit_text, scales_with_people, baseline_headcount, assigned_tent_id'
    )
    .eq('campaign_id', campaignId)
    .eq('list_scope', 'shared')
    .eq('is_standard', false)
    .eq('is_extra', false)
    .eq('scales_with_people', true)
    .not('quantity_amount', 'is', null)
    .not('baseline_headcount', 'is', null);

  if (itemErr) throw new Error(itemErr.message);

  let updated = 0;

  for (const item of items || []) {
    const itemBaseline = item.baseline_headcount || baseline;
    if (!item.quantity_amount || !item.quantity_unit_text) continue;
    if (item.assigned_tent_id) continue;

    const newAmount = scaleQuantityAmount(
      Number(item.quantity_amount),
      item.quantity_unit_text,
      itemBaseline,
      headcount.total
    );

    const quantity = formatQuantityDisplay(newAmount, item.quantity_unit_text);
    const needed_count = computeNeededCountFromQuantity(newAmount, item.quantity_unit_text);

    const { error } = await supabase
      .from('items')
      .update({
        quantity_amount: newAmount,
        quantity,
        needed_count,
        baseline_headcount: headcount.total,
      })
      .eq('id', item.id);

    if (!error) updated += 1;
  }

  await supabase
    .from('campaigns')
    .update({
      list_baseline_headcount: headcount.total,
      list_baseline_adults: headcount.adults,
      list_baseline_children: headcount.children,
    })
    .eq('id', campaignId);

  return { updated, headcount: headcount.total };
}

export async function syncAllListQuantities(
  supabase: SupabaseClient,
  campaignId: string
): Promise<void> {
  const { syncStandardSharedItems } = await import('@/lib/sync-standard-items');
  await syncStandardSharedItems(supabase, campaignId);
  await syncAiListQuantities(supabase, campaignId);
}
