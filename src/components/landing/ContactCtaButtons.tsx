'use client';

import { mailtoUrl, SITE, whatsAppUrl } from '@/lib/site-config';

interface ContactCtaButtonsProps {
  message?: string;
  subject?: string;
  className?: string;
}

export default function ContactCtaButtons({
  message = 'Kamp Asistanı tam sürüm hakkında bilgi almak istiyorum.',
  subject = 'Kamp Asistanı — Tam sürüm',
  className = '',
}: ContactCtaButtonsProps) {
  const wa = whatsAppUrl(message);
  const mail = mailtoUrl(subject);

  if (!wa && !mail) {
    return (
      <p className={`text-sm text-gray-500 ${className}`}>
        İletişim bilgileri yakında eklenecek.
      </p>
    );
  }

  return (
    <div className={`flex flex-wrap gap-3 ${className}`}>
      {wa && (
        <a
          href={wa}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-[48px] items-center justify-center rounded-xl bg-green-600 px-6 font-semibold text-white"
        >
          WhatsApp ile yaz
        </a>
      )}
      {mail && (
        <a
          href={mail}
          className="inline-flex min-h-[48px] items-center justify-center rounded-xl border-2 border-emerald-600 px-6 font-semibold text-emerald-700"
        >
          E-posta gönder
        </a>
      )}
    </div>
  );
}

export function ContactCtaInline() {
  if (!SITE.contactEmail && !SITE.contactWhatsApp) return null;
  return <ContactCtaButtons className="mt-4" />;
}
