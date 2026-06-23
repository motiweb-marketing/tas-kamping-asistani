import type { SupabaseClient } from '@supabase/supabase-js';
import type { ItemListScope } from '@/types';

export const DEFAULT_SECTION_NAME = 'Genel';

export interface ListSectionRow {
  id: string;
  campaign_id: string;
  list_scope: ItemListScope;
  name: string;
  sort_order: number;
  created_at: string;
}

/** Her scope için varsayılan "Genel" bölümü; mevcut öğeleri oraya atar. */
export async function ensureListSections(
  supabase: SupabaseClient,
  campaignId: string,
  scopes: ItemListScope[] = ['personal', 'tent', 'shared']
): Promise<void> {
  for (const list_scope of scopes) {
    const { data: existing } = await supabase
      .from('list_sections')
      .select('id')
      .eq('campaign_id', campaignId)
      .eq('list_scope', list_scope)
      .eq('name', DEFAULT_SECTION_NAME)
      .maybeSingle();

    let sectionId = existing?.id;

    if (!sectionId) {
      const { data: created, error } = await supabase
        .from('list_sections')
        .insert({
          campaign_id: campaignId,
          list_scope,
          name: DEFAULT_SECTION_NAME,
          sort_order: 0,
        })
        .select('id')
        .single();

      if (error || !created) continue;
      sectionId = created.id;
    }

    await supabase
      .from('items')
      .update({ section_id: sectionId })
      .eq('campaign_id', campaignId)
      .eq('list_scope', list_scope)
      .is('section_id', null);
  }
}

export async function getOrCreateDefaultSection(
  supabase: SupabaseClient,
  campaignId: string,
  list_scope: ItemListScope
): Promise<string | null> {
  const { data } = await supabase
    .from('list_sections')
    .select('id')
    .eq('campaign_id', campaignId)
    .eq('list_scope', list_scope)
    .eq('name', DEFAULT_SECTION_NAME)
    .maybeSingle();

  if (data?.id) return data.id;

  const { data: created } = await supabase
    .from('list_sections')
    .insert({
      campaign_id: campaignId,
      list_scope,
      name: DEFAULT_SECTION_NAME,
      sort_order: 0,
    })
    .select('id')
    .single();

  return created?.id ?? null;
}
