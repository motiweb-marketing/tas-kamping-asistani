import type { SupabaseClient } from '@supabase/supabase-js';
import {
  STANDARD_SHARED_ITEMS,
  computeNeededCount,
  formatQuantity,
} from '@/lib/standard-shared-items';

/** Kişi sayısına göre standart ortak malzemeleri oluşturur veya günceller. */
export async function syncStandardSharedItems(
  supabase: SupabaseClient,
  campaignId: string
): Promise<{ updated: number }> {
  const { data: users, error: userErr } = await supabase
    .from('users')
    .select('id')
    .eq('campaign_id', campaignId);

  if (userErr) throw new Error(userErr.message);

  const totalPeople = users?.length || 0;
  if (totalPeople === 0) return { updated: 0 };

  const { data: existing } = await supabase
    .from('items')
    .select('id, name')
    .eq('campaign_id', campaignId)
    .eq('is_standard', true);

  const byName = new Map((existing || []).map((r) => [r.name, r.id]));
  let updated = 0;

  for (const template of STANDARD_SHARED_ITEMS) {
    const needed_count = computeNeededCount(template.per_person, totalPeople);
    const quantity = formatQuantity(needed_count, template.unit_label);
    const row = {
      campaign_id: campaignId,
      name: template.name,
      quantity,
      needed_count,
      unit_label: template.unit_label,
      category: template.category,
      disposition: template.disposition,
      notes: template.notes,
      list_scope: 'shared' as const,
      is_standard: true,
      is_recommendation: false,
      is_extra: false,
      is_published: true,
      price: 0,
    };

    const existingId = byName.get(template.name);
    if (existingId) {
      const { error } = await supabase
        .from('items')
        .update({
          quantity,
          needed_count,
          unit_label: template.unit_label,
          notes: template.notes,
          disposition: template.disposition,
        })
        .eq('id', existingId);
      if (!error) updated += 1;
    } else {
      const { error } = await supabase.from('items').insert(row);
      if (!error) updated += 1;
    }
  }

  return { updated };
}
