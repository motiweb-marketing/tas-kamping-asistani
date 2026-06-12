import { Resend } from 'resend';
import { SITE } from '@/lib/site-config';

const DEFAULT_NOTIFY_EMAIL = 'qa.omerkacar@gmail.com';

export interface NewTrialPayload {
  campaignId: string;
  campaignName: string;
  location: string;
  startDate: string;
  endDate: string;
  adminName: string;
  adminUsername: string;
  adminTentName: string;
}

function notifyEmail(): string {
  return (
    process.env.PLATFORM_NOTIFY_EMAIL?.trim() ||
    process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() ||
    DEFAULT_NOTIFY_EMAIL
  );
}

function fromAddress(): string {
  return (
    process.env.NOTIFY_FROM_EMAIL?.trim() ||
    `${SITE.name} <onboarding@resend.dev>`
  );
}

function buildTrialEmailHtml(p: NewTrialPayload): string {
  const platformUrl = `${SITE.url}/platform/campaigns/${p.campaignId}`;
  return `
    <div style="font-family:system-ui,sans-serif;max-width:560px;color:#1e293b">
      <h2 style="color:#059669;margin:0 0 16px">Yeni deneme kaydı</h2>
      <p style="margin:0 0 12px"><strong>Kamp:</strong> ${escapeHtml(p.campaignName)}</p>
      <p style="margin:0 0 12px"><strong>Konum:</strong> ${escapeHtml(p.location)}</p>
      <p style="margin:0 0 12px"><strong>Tarih:</strong> ${p.startDate} — ${p.endDate}</p>
      <hr style="border:none;border-top:1px solid #e2e8f0;margin:16px 0" />
      <p style="margin:0 0 8px"><strong>Organizatör:</strong> ${escapeHtml(p.adminName)}</p>
      <p style="margin:0 0 8px"><strong>Kullanıcı adı:</strong> @${escapeHtml(p.adminUsername)}</p>
      <p style="margin:0 0 16px"><strong>Çadır:</strong> ${escapeHtml(p.adminTentName)}</p>
      <p style="margin:0 0 16px;font-size:13px;color:#64748b">
        Plan: <strong>Deneme</strong> (1 çadır, 2 kişi)
      </p>
      <a href="${platformUrl}" style="display:inline-block;background:#4f46e5;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600">
        Platform panelinde yönet →
      </a>
    </div>
  `;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Yeni deneme kampı oluşturulunca platform sahibine e-posta gönderir (fire-and-forget). */
export async function notifyNewTrialRegistration(payload: NewTrialPayload): Promise<void> {
  const to = notifyEmail();
  const subject = `Yeni deneme kaydı: ${payload.campaignName}`;
  const html = buildTrialEmailHtml(payload);

  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    console.warn('[notify] RESEND_API_KEY tanımlı değil — e-posta gönderilmedi:', subject, '→', to);
    return;
  }

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from: fromAddress(),
    to: [to],
    subject,
    html,
  });

  if (error) {
    console.error('[notify] Resend hatası:', error.message);
    throw new Error(error.message);
  }

  console.info('[notify] Deneme bildirimi gönderildi:', to);
}
