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

export function normalizeSectionName(name: string): string {
  return name.trim().toLowerCase();
}

/** AI listesi yeniden oluşturulunca shared bölümleri sıfırlar ve hint'lere göre yeniden kurar. */
export async function rebuildSharedSectionsFromHints(
  supabase: SupabaseClient,
  campaignId: string,
  hints: string[]
): Promise<Map<string, string>> {
  await supabase
    .from('items')
    .update({ section_id: null })
    .eq('campaign_id', campaignId)
    .eq('list_scope', 'shared');

  await supabase
    .from('list_sections')
    .delete()
    .eq('campaign_id', campaignId)
    .eq('list_scope', 'shared');

  const seen = new Set<string>();
  const sectionNames: string[] = [];
  for (const raw of hints) {
    const name = raw.trim() || DEFAULT_SECTION_NAME;
    const key = normalizeSectionName(name);
    if (seen.has(key)) continue;
    seen.add(key);
    sectionNames.push(name);
  }
  if (!sectionNames.length) sectionNames.push(DEFAULT_SECTION_NAME);

  const nameToId = new Map<string, string>();
  for (let i = 0; i < sectionNames.length; i++) {
    const name = sectionNames[i];
    const { data, error } = await supabase
      .from('list_sections')
      .insert({
        campaign_id: campaignId,
        list_scope: 'shared',
        name,
        sort_order: i,
      })
      .select('id')
      .single();

    if (!error && data) {
      nameToId.set(normalizeSectionName(name), data.id);
    }
  }

  if (!nameToId.has(normalizeSectionName(DEFAULT_SECTION_NAME))) {
    const id = await getOrCreateDefaultSection(supabase, campaignId, 'shared');
    if (id) nameToId.set(normalizeSectionName(DEFAULT_SECTION_NAME), id);
  }

  return nameToId;
}

export function resolveSectionId(
  sectionMap: Map<string, string>,
  hint?: string | null
): string | null {
  if (!hint?.trim()) {
    return sectionMap.get(normalizeSectionName(DEFAULT_SECTION_NAME)) ?? null;
  }
  const key = normalizeSectionName(hint);
  return sectionMap.get(key) ?? sectionMap.get(normalizeSectionName(DEFAULT_SECTION_NAME)) ?? null;
}
