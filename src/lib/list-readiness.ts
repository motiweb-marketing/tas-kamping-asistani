import type { SupabaseClient } from '@supabase/supabase-js';
import { dayMenuToFlat, rowsToDayMap } from '@/lib/menu-storage';
import { snapshotHeadcount } from '@/lib/sync-ai-list-quantities';

export const MIN_PARTICIPANTS = 2;

export type ReadinessScope = 'headcount' | 'list';

export interface ReadinessResult {
  ready: boolean;
  errors: string[];
  participantCount: number;
  adultCount: number;
  childCount: number;
  tentCount: number;
  usersWithoutTent: number;
  hasMenu: boolean;
  listBaselineHeadcount: number | null;
  listGeneratedAt: string | null;
  minParticipants: number;
  scope: ReadinessScope;
}

export async function computeListReadiness(
  supabase: SupabaseClient,
  campaignId: string,
  scope: ReadinessScope = 'list'
): Promise<ReadinessResult> {
  const [usersRes, tentsRes, menusRes, campaignRes] = await Promise.all([
    supabase.from('users').select('id, age, tent_id, role').eq('campaign_id', campaignId),
    supabase.from('tents').select('id').eq('campaign_id', campaignId),
    supabase.from('menus').select('id, day, meal_type, description').eq('campaign_id', campaignId),
    supabase
      .from('campaigns')
      .select('list_baseline_headcount, list_generated_at')
      .eq('id', campaignId)
      .single(),
  ]);

  const users = usersRes.data || [];
  const tents = tentsRes.data || [];
  const headcount = snapshotHeadcount(users);
  const usersWithoutTent = users.filter((u) => !u.tent_id).length;

  const dayMap = rowsToDayMap(menusRes.data || []);
  const flatMenus = Array.from(dayMap.entries()).flatMap(([day, { content }]) =>
    dayMenuToFlat(day, content)
  );
  const hasMenu = flatMenus.some((m) => m.description?.trim());

  const errors: string[] = [];

  if (headcount.total < MIN_PARTICIPANTS) {
    errors.push(
      `En az ${MIN_PARTICIPANTS} kişi kayıtlı olmalı. Şu an ${headcount.total} kişi var.`
    );
  }
  if (!tents.length) {
    errors.push('En az bir çadır tanımlanmalı.');
  }
  if (usersWithoutTent > 0) {
    errors.push(`${usersWithoutTent} kişinin çadırı atanmamış.`);
  }
  if (scope === 'list' && !hasMenu) {
    errors.push('Önce menü tariflerini girin.');
  }

  return {
    ready: errors.length === 0,
    errors,
    participantCount: headcount.total,
    adultCount: headcount.adults,
    childCount: headcount.children,
    tentCount: tents.length,
    usersWithoutTent,
    hasMenu,
    listBaselineHeadcount: campaignRes.data?.list_baseline_headcount ?? null,
    listGeneratedAt: campaignRes.data?.list_generated_at ?? null,
    minParticipants: MIN_PARTICIPANTS,
    scope,
  };
}
