import Link from 'next/link';
import PlanBadge from '@/components/admin/PlanBadge';
import { getCampaignLimits } from '@/lib/campaign-limits';
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

  const limits = await getCampaignLimits(supabase, campaignId);

  const [tents, users, items, menus] = await Promise.all([
    supabase.from('tents').select('id', { count: 'exact', head: true }).eq('campaign_id', campaignId),
    supabase.from('users').select('id', { count: 'exact', head: true }).eq('campaign_id', campaignId),
    supabase.from('items').select('id', { count: 'exact', head: true }).eq('campaign_id', campaignId),
    supabase.from('menus').select('id', { count: 'exact', head: true }).eq('campaign_id', campaignId),
  ]);

  const stats = [
    { label: 'Çadır', value: tents.count || 0 },
    { label: 'Kişi', value: users.count || 0 },
    { label: 'Öğün kaydı', value: menus.count || 0 },
    { label: 'Malzeme', value: items.count || 0 },
  ];

  const quickLinks = [
    { href: '/admin/kurulum', label: 'Program tanıtımı' },
    { href: '/summary', label: 'Kamp özeti — kim ne getiriyor?' },
    { href: '/admin/hazir-listeler', label: 'Hazır listeler (kişisel & çadır)' },
    { href: '/admin/liste', label: 'Ortak alışveriş listesi' },
    { href: '/admin/paylas', label: 'Giriş bilgisini paylaş' },
  ];

  const planTier = campaignData?.plan_tier || limits.plan_tier;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="font-display text-2xl font-bold text-forest-950">{campaignData?.name}</h1>
          <PlanBadge planTier={planTier} />
        </div>
        <p className="text-base text-forest-600">{campaignData?.location}</p>
        <p className="text-sm text-forest-500">
          {campaignData?.start_date} — {campaignData?.end_date}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-forest-100 bg-white p-4 text-center shadow-sm"
          >
            <p className="text-3xl font-bold text-forest-800">{s.value}</p>
            <p className="text-sm text-forest-600">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-forest-100 bg-white p-4 shadow-sm">
        <h3 className="mb-3 font-semibold text-forest-900">Hızlı erişim</h3>
        <ul className="flex flex-col gap-2">
          {quickLinks.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="text-sm font-medium text-forest-800 underline">
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <p className="text-sm text-forest-500">
        Sol menüden kamp bilgilerini, çadırları, menüyü ve listeleri istediğiniz zaman düzenleyebilirsiniz.
      </p>
    </div>
  );
}
