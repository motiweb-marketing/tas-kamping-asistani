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
    <div className={`flex flex-col gap-3 sm:flex-row sm:flex-wrap ${className}`}>
      {wa && (
        <a
          href={wa}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-[48px] w-full items-center justify-center rounded-xl bg-green-600 px-6 font-semibold text-white sm:w-auto"
        >
          WhatsApp ile yaz
        </a>
      )}
      {mail && (
        <a
          href={mail}
          className="inline-flex min-h-[48px] w-full items-center justify-center rounded-xl border-2 border-emerald-600 px-6 font-semibold text-emerald-700 sm:w-auto"
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
