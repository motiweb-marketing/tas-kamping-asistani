import { getSession } from '@/lib/session';
import { createServerClient } from '@/lib/supabase/server';
import type { Campaign } from '@/types';

export default async function AdminPage() {
  const session = await getSession();
  const supabase = createServerClient();

  const campaignId = session.user!.campaign_id;

  const { data: campaignData } = (await supabase
    .from('campaigns')
    .select('*')
    .eq('id', campaignId)
    .single()) as { data: Campaign | null };

  const [tents, users, items, menus] = await Promise.all([
    supabase.from('tents').select('id', { count: 'exact', head: true }).eq('campaign_id', campaignId),
    supabase.from('users').select('id', { count: 'exact', head: true }).eq('campaign_id', campaignId),
    supabase.from('items').select('id', { count: 'exact', head: true }).eq('campaign_id', campaignId),
    supabase.from('menus').select('id', { count: 'exact', head: true }).eq('campaign_id', campaignId),
  ]);

  const stats = [
    { label: 'Çadır', value: tents.count || 0 },
    { label: 'Kişi', value: users.count || 0 },
    { label: 'Menü Günü', value: menus.count || 0 },
    { label: 'Malzeme', value: items.count || 0 },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-bold">{campaignData?.name}</h2>
        <p className="text-lg text-gray-600">{campaignData?.location}</p>
        <p className="text-base text-gray-500">
          {campaignData?.start_date} — {campaignData?.end_date}
        </p>
        <p className="mt-2 rounded-lg bg-gray-100 p-3 text-sm">
          Kamp ID: <strong>{campaignId}</strong>
          <br />
          Bu kodu katılımcılarla paylaşın.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border-2 border-emerald-200 bg-emerald-50 p-4 text-center">
            <p className="text-3xl font-bold text-emerald-800">{s.value}</p>
            <p className="text-lg">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
