import type { ItemClaimWithTent, ItemWithRelations, Tent } from '@/types';

type RawClaim = ItemClaimWithTent & {
  tent?: Pick<Tent, 'id' | 'name'> | Pick<Tent, 'id' | 'name'>[] | null;
};

export function normalizeClaims(rows: RawClaim[]): ItemClaimWithTent[] {
  return rows.map((row) => {
    const tent = Array.isArray(row.tent) ? row.tent[0] : row.tent;
    return { ...row, tent: tent ?? null };
  });
}

export function sumClaims(claims: ItemClaimWithTent[] | undefined): number {
  return (claims || []).reduce((s, c) => s + c.quantity, 0);
}

export function enrichItemWithClaims(
  item: ItemWithRelations,
  claims: ItemClaimWithTent[],
  myTentId: string | null
): ItemWithRelations {
  const itemClaims = claims.filter((c) => c.item_id === item.id);
  const claimed_total = sumClaims(itemClaims);
  const needed = item.needed_count ?? 1;
  const myClaim = myTentId
    ? itemClaims.find((c) => c.tent_id === myTentId)?.quantity ?? 0
    : 0;

  return {
    ...item,
    claims: itemClaims,
    claimed_total,
    remaining_count: Math.max(0, needed - claimed_total),
    my_claim: myClaim,
  };
}
