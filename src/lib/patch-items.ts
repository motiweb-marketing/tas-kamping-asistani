import type { ItemWithRelations } from '@/types';

export function patchItemById(
  items: ItemWithRelations[],
  id: string,
  patch: Partial<ItemWithRelations>
): ItemWithRelations[] {
  return items.map((item) => (item.id === id ? { ...item, ...patch } : item));
}

export function applyPersonalCheck(
  items: ItemWithRelations[],
  itemId: string,
  checked: boolean
): ItemWithRelations[] {
  return patchItemById(items, itemId, { checked });
}

export function applyTentCheck(
  items: ItemWithRelations[],
  itemId: string,
  checked: boolean
): ItemWithRelations[] {
  return patchItemById(items, itemId, { tent_checked: checked });
}

export function applySharedClaimPatch(
  item: ItemWithRelations,
  quantity: number,
  claimedTotal: number
): ItemWithRelations {
  const needed = item.needed_count ?? 1;
  return {
    ...item,
    my_claim: quantity,
    claimed_total: claimedTotal,
    remaining_count: Math.max(0, needed - claimedTotal),
  };
}

export function applySharedClaimRemoved(item: ItemWithRelations): ItemWithRelations {
  const myClaim = item.my_claim || 0;
  const claimedTotal = Math.max(0, (item.claimed_total ?? 0) - myClaim);
  const needed = item.needed_count ?? 1;
  return {
    ...item,
    my_claim: 0,
    claimed_total: claimedTotal,
    remaining_count: Math.max(0, needed - claimedTotal),
  };
}
