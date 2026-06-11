import type { BudgetSummary, BudgetTentBalance, SafeUser, Tent } from '@/types';
import type { CampExpense, Item } from '@/types/database';

const CHILD_AGE_THRESHOLD = 15;
const CHILD_SHARE = 0.5;
const ADULT_SHARE = 1;

export function getUserShare(age: number): number {
  return age < CHILD_AGE_THRESHOLD ? CHILD_SHARE : ADULT_SHARE;
}

export function getAccommodationFee(
  age: number,
  adultFee: number,
  childFee: number
): number {
  return age < CHILD_AGE_THRESHOLD ? childFee : adultFee;
}

export function calculateBudget(
  campaign: {
    id: string;
    name: string;
    adult_accommodation_fee?: number;
    child_accommodation_fee?: number;
  },
  users: SafeUser[],
  tents: Tent[],
  items: Item[],
  expenses: CampExpense[] = []
): BudgetSummary {
  const adultFee = Number(campaign.adult_accommodation_fee ?? 0);
  const childFee = Number(campaign.child_accommodation_fee ?? 0);

  const sharedPublished = items.filter(
    (item) =>
      item.is_published &&
      item.list_scope === 'shared' &&
      !item.is_recommendation
  );

  const expenseTotal = expenses.reduce((sum, e) => sum + Number(e.amount ?? 0), 0);
  const itemPriceTotal = sharedPublished.reduce(
    (sum, item) => sum + Number(item.price ?? 0),
    0
  );
  const totalGroceryCost = expenseTotal > 0 ? expenseTotal : itemPriceTotal;

  const totalAccommodationCost = users.reduce(
    (sum, user) => sum + getAccommodationFee(user.age, adultFee, childFee),
    0
  );
  const totalCost = totalGroceryCost + totalAccommodationCost;

  const adultCount = users.filter((u) => u.age >= CHILD_AGE_THRESHOLD).length;
  const childCount = users.filter((u) => u.age < CHILD_AGE_THRESHOLD).length;
  const totalShares = users.reduce((sum, u) => sum + getUserShare(u.age), 0);
  const costPerShare = totalShares > 0 ? totalGroceryCost / totalShares : 0;

  const tentBalances: BudgetTentBalance[] = tents.map((tent) => {
    const members = users.filter((u) => u.tent_id === tent.id);
    const tentShares = members.reduce((sum, u) => sum + getUserShare(u.age), 0);
    const accommodationOwed = members.reduce(
      (sum, user) => sum + getAccommodationFee(user.age, adultFee, childFee),
      0
    );
    const groceryExpected = tentShares * costPerShare;
    const expectedContribution = accommodationOwed + groceryExpected;

    const tentExpenses = expenses
      .filter((e) => e.tent_id === tent.id)
      .reduce((sum, e) => sum + Number(e.amount ?? 0), 0);

    const tentItemPrices =
      expenseTotal > 0
        ? 0
        : sharedPublished
            .filter((item) => item.assigned_tent_id === tent.id)
            .reduce((sum, item) => sum + Number(item.price ?? 0), 0);

    const actualSpent = tentExpenses > 0 ? tentExpenses : tentItemPrices;
    const balance = actualSpent - expectedContribution;

    let status: BudgetTentBalance['status'] = 'denk';
    if (balance > 0.01) status = 'alacakli';
    else if (balance < -0.01) status = 'borclu';

    return {
      tent: { id: tent.id, name: tent.name },
      member_count: members.length,
      total_shares: tentShares,
      share_cost: costPerShare,
      accommodation_owed: accommodationOwed,
      grocery_expected: groceryExpected,
      expected_contribution: expectedContribution,
      actual_spent: actualSpent,
      balance,
      status,
    };
  });

  return {
    campaign: { id: campaign.id, name: campaign.name },
    adult_accommodation_fee: adultFee,
    child_accommodation_fee: childFee,
    total_accommodation_cost: totalAccommodationCost,
    total_grocery_cost: totalGroceryCost,
    total_cost: totalCost,
    total_shares: totalShares,
    cost_per_share: costPerShare,
    adult_count: adultCount,
    child_count: childCount,
    tent_balances: tentBalances,
  };
}
