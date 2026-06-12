export const SITE = {
  name: 'Kamp Asistanı',
  tagline: 'Kampınızı tek uygulamada yönetin',
  description:
    'Malzeme listesi, nöbet planı, harcama ve bütçe paylaşımı — kamp organizasyonu için akıllı asistan.',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://tas-kamping-hesaplayici.vercel.app',
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? '',
  contactWhatsApp: process.env.NEXT_PUBLIC_CONTACT_WHATSAPP ?? '',
} as const;

export function whatsAppUrl(message?: string): string | null {
  const phone = SITE.contactWhatsApp.replace(/\D/g, '');
  if (!phone) return null;
  const text = message ? `?text=${encodeURIComponent(message)}` : '';
  return `https://wa.me/${phone}${text}`;
}

export function mailtoUrl(subject?: string): string | null {
  if (!SITE.contactEmail) return null;
  const q = subject ? `?subject=${encodeURIComponent(subject)}` : '';
  return `mailto:${SITE.contactEmail}${q}`;
}
