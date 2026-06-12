import { createServerClient } from '@/lib/supabase/server';
import {
  getStepCompletion,
  requiredStepsDone,
  type SetupProgressInput,
} from './admin-setup';

export async function fetchSetupProgress(campaignId: string) {
  const supabase = createServerClient();

  const { data: campaign } = await supabase
    .from('campaigns')
    .select('name, start_date, end_date, published_menu')
    .eq('id', campaignId)
    .single();

  const [tents, users, menus, publishedItems] = await Promise.all([
    supabase
      .from('tents')
      .select('id', { count: 'exact', head: true })
      .eq('campaign_id', campaignId),
    supabase
      .from('users')
      .select('id', { count: 'exact', head: true })
      .eq('campaign_id', campaignId),
    supabase
      .from('menus')
      .select('id', { count: 'exact', head: true })
      .eq('campaign_id', campaignId),
    supabase
      .from('items')
      .select('id', { count: 'exact', head: true })
      .eq('campaign_id', campaignId)
      .eq('is_published', true)
      .eq('list_scope', 'shared'),
  ]);

  const input: SetupProgressInput = {
    campaignName: campaign?.name || '',
    hasDates: !!(campaign?.start_date && campaign?.end_date),
    tentCount: tents.count || 0,
    userCount: users.count || 0,
    menuCount: menus.count || 0,
    itemCount: publishedItems.count || 0,
    isMenuPublished: !!campaign?.published_menu,
    hasPublishedItems: (publishedItems.count || 0) > 0,
  };

  const completed = getStepCompletion(input);

  return {
    input,
    completed,
    allRequiredDone: requiredStepsDone(completed),
  };
}
