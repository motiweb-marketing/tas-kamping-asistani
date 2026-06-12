import ContactCtaButtons from './ContactCtaButtons';
import { SITE } from '@/lib/site-config';

export default function ContactCtaSection() {
  return (
    <section className="border-t border-gray-200 bg-emerald-50 py-12 lg:py-16" id="iletisim">
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
        <h2 className="text-2xl font-bold text-gray-900">Tam sürüm veya sorularınız mı var?</h2>
        <p className="mt-3 text-lg text-gray-600">
          {SITE.name} ile kampınızı kolaylaştırın. Denemeyi beğendiyseniz tam sürüm için
          bizimle iletişime geçin.
        </p>
        <ContactCtaButtons className="mt-8 justify-center" />
      </div>
    </section>
  );
}
