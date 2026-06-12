import type { Metadata } from 'next';
import { SITE } from '@/lib/site-config';

export const metadata: Metadata = {
  title: 'Ücretsiz Dene',
  description:
    'Kamp Asistanı ile ücretsiz deneme kampı oluşturun: 1 çadır, 2 kişi, tüm özellikler.',
};

export default function SetupLayout({ children }: { children: React.ReactNode }) {
  return children;
}
