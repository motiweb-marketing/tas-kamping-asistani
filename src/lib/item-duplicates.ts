import type { SupabaseClient } from '@supabase/supabase-js';
import { normalizeItemName } from '@/lib/item-names';
import type { ItemListScope } from '@/types';

export async function findDuplicateItem(
  supabase: SupabaseClient,
  campaignId: string,
  name: string,
  listScope: ItemListScope,
  excludeId?: string
): Promise<{ id: string; name: string } | null> {
  const normalized = normalizeItemName(name);
  if (!normalized) return null;

  const { data, error } = await supabase
    .from('items')
    .select('id, name')
    .eq('campaign_id', campaignId)
    .eq('list_scope', listScope);

  if (error) throw new Error(error.message);

  const duplicate = (data || []).find(
    (item) =>
      item.id !== excludeId && normalizeItemName(item.name) === normalized
  );

  return duplicate || null;
}

export function duplicateItemError(existingName: string): string {
  return `"${existingName}" bu listede zaten var. Aynı malzeme ikinci kez eklenemez.`;
}

export async function assertNoDuplicateItem(
  supabase: SupabaseClient,
  campaignId: string,
  name: string,
  listScope: ItemListScope,
  excludeId?: string
): Promise<{ error: string } | null> {
  const duplicate = await findDuplicateItem(
    supabase,
    campaignId,
    name,
    listScope,
    excludeId
  );
  if (duplicate) {
    return { error: duplicateItemError(duplicate.name) };
  }
  return null;
}

/** Katılımcının kişisel veya çadır listesine ekleme — öneriler + kendi maddeleri içinde tekilleştir */
export async function assertNoDuplicateParticipantItem(
  supabase: SupabaseClient,
  campaignId: string,
  name: string,
  listScope: 'personal' | 'tent',
  userId: string,
  tentId: string | null,
  excludeId?: string
): Promise<{ error: string } | null> {
  const normalized = normalizeItemName(name);
  if (!normalized) return null;

  let query = supabase
    .from('items')
    .select('id, name, is_recommendation, added_by, assigned_tent_id')
    .eq('campaign_id', campaignId)
    .eq('list_scope', listScope);

  if (listScope === 'personal') {
    query = query.or(`is_recommendation.eq.true,added_by.eq.${userId}`);
  } else if (tentId) {
    query = query.or(
      `is_recommendation.eq.true,and(assigned_tent_id.eq.${tentId},is_recommendation.eq.false)`
    );
  } else {
    query = query.eq('is_recommendation', true);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  const duplicate = (data || []).find(
    (item) =>
      item.id !== excludeId && normalizeItemName(item.name) === normalized
  );

  return duplicate ? { error: duplicateItemError(duplicate.name) } : null;
}

/** İstemci tarafı hızlı kontrol */
export function clientDuplicateCheck(
  name: string,
  existing: { id: string; name: string }[],
  excludeId?: string
): string | null {
  if (!name.trim()) return null;
  const normalized = normalizeItemName(name);
  const match = existing.find(
    (item) =>
      item.id !== excludeId && normalizeItemName(item.name) === normalized
  );
  return match ? duplicateItemError(match.name) : null;
}
