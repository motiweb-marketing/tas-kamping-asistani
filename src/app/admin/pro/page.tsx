import ContactCtaButtons from '@/components/landing/ContactCtaButtons';
import PlanBadge from '@/components/admin/PlanBadge';
import { getCampaignLimits } from '@/lib/campaign-limits';
import { SITE } from '@/lib/site-config';
import { getSession } from '@/lib/session';
import { createServerClient } from '@/lib/supabase/server';
import Link from 'next/link';

export default async function ProPage() {
  const session = await getSession();
  const supabase = createServerClient();
  const campaignId = session.user!.campaign_id;

  const { data: campaign } = await supabase
    .from('campaigns')
    .select('name, plan_tier')
    .eq('id', campaignId)
    .single();

  const limits = await getCampaignLimits(supabase, campaignId);
  const isPro = limits.plan_tier === 'paid';

  return (
    <div className="flex flex-col gap-6">
      <header>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="font-display text-2xl font-bold text-forest-950">Pro sürüm</h1>
          <PlanBadge planTier={limits.plan_tier} />
        </div>
        <p className="mt-1 text-sm text-forest-600">
          {isPro
            ? 'Kampınız tam sürümde. Sınırsız çadır, katılımcı ve AI ile liste/menü özelliği dahil.'
            : 'Deneme sürümündesiniz. Pro ile limitler kalkar ve AI özellikleri açılır.'}
        </p>
      </header>

      {isPro ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
          <p className="font-semibold">Pro aktif</p>
          <p className="mt-1">
            Giriş adresiniz ve kullanıcı adınız aynı:{' '}
            <strong>{SITE.url}/login</strong>
          </p>
        </div>
      ) : (
        <>
          <div className="rounded-xl border border-forest-100 bg-white p-5 text-sm text-forest-800 shadow-sm">
            <h2 className="font-semibold text-forest-950">Nasıl çalışır?</h2>
            <ol className="mt-3 list-decimal space-y-2 pl-5">
              <li>
                <strong>Yeni şifre gerekmez.</strong> Kampı kurarken oluşturduğunuz organizatör
                kullanıcı adı ve şifre ile giriş yapmaya devam edersiniz.
              </li>
              <li>
                Pro satın almak için aşağıdan bize yazın — kamp adınızı (
                <strong>{campaign?.name}</strong>) belirtin.
              </li>
              <li>Ödeme onayından sonra kampınız Pro&apos;ya yükseltilir; limitler ve AI otomatik açılır.</li>
              <li>Aynı adresten giriş yapın — ekstra kurulum gerekmez.</li>
            </ol>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <p className="font-semibold">Mevcut kullanım</p>
            <p className="mt-1">
              {limits.tents_used}/{limits.max_tents} çadır · {limits.users_used}/{limits.max_users}{' '}
              kişi
            </p>
          </div>

          <ContactCtaButtons
            message={`Kamp Asistanı Pro — Kamp: ${campaign?.name || ''}. Mevcut giriş kullanıcı adım: ${session.user?.username || ''}`}
            subject={`Kamp Asistanı Pro — ${campaign?.name || 'Kamp'}`}
          />

          <p className="text-xs text-forest-500">
            Katılımcılar için ayrı Pro hesabı gerekmez — sadece organizatör kampı yönetir.
            Katılımcı giriş bilgilerini{' '}
            <Link href="/admin/paylas" className="underline">
              buradan
            </Link>{' '}
            paylaşırsınız.
          </p>
        </>
      )}
    </div>
  );
}
