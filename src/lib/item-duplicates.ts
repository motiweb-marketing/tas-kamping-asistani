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
