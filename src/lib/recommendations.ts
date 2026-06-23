import type { SupabaseClient } from '@supabase/supabase-js';
import {
  DEFAULT_PERSONAL_CHECKLIST,
  DEFAULT_TENT_CHECKLIST,
} from '@/lib/default-checklists';
import { ensureListSections } from '@/lib/list-sections';
import type { ItemListScope } from '@/types';

function toRows(campaignId: string, scope: ItemListScope) {
  const source =
    scope === 'personal' ? DEFAULT_PERSONAL_CHECKLIST : DEFAULT_TENT_CHECKLIST;

  return source.map((entry) => ({
    campaign_id: campaignId,
    name: entry.name,
    quantity: entry.quantity,
    category: entry.category,
    notes: entry.notes,
    list_scope: scope,
    is_recommendation: true,
    is_published: true,
    is_extra: false,
    price: 0,
  }));
}

/** Kamp oluşturulduğunda önerilen kişisel ve çadır listelerini ekler (yoksa). */
export async function ensureCampaignRecommendations(
  supabase: SupabaseClient,
  campaignId: string
): Promise<{ seeded: number }> {
  const { count, error } = await supabase
    .from('items')
    .select('*', { count: 'exact', head: true })
    .eq('campaign_id', campaignId)
    .eq('is_recommendation', true);

  if (error) {
    throw new Error(error.message);
  }

  if (count && count > 0) {
    await ensureListSections(supabase, campaignId, ['personal', 'tent']);
    return { seeded: 0 };
  }

  const rows = [...toRows(campaignId, 'personal'), ...toRows(campaignId, 'tent')];
  const { error: insertErr } = await supabase.from('items').insert(rows);

  if (insertErr) {
    throw new Error(insertErr.message);
  }

  await ensureListSections(supabase, campaignId, ['personal', 'tent']);

  return { seeded: rows.length };
}
