import Link from 'next/link';
import ListWorkflowBanner from '@/components/admin/listeler/ListWorkflowBanner';
import ListelerPageShell from '@/components/admin/listeler/ListelerPageShell';
import { LIST_TYPES } from '@/lib/list-config';

export default function ListelerHubPage() {
  return (
    <ListelerPageShell
      title="Listeler"
      description="Kampınız için üç katmanlı liste sistemi. Önce menüyü belirleyin, ardından ihtiyaçları oluşturup yayınlayın."
    >
      <div className="mb-8">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-forest-500">
          Önerilen sıra
        </h2>
        <ListWorkflowBanner />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {LIST_TYPES.map((list) => (
          <Link
            key={list.slug}
            href={list.href}
            className="rounded-2xl border border-forest-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <span className="text-xs font-bold text-forest-500">{list.order}.</span>
            <h3 className="mt-1 font-display font-bold text-forest-950">{list.title}</h3>
            <p className="mt-2 text-sm text-forest-600 line-clamp-4">{list.description}</p>
            <span className="mt-4 inline-block text-sm font-semibold text-forest-800 underline">
              Düzenle →
            </span>
          </Link>
        ))}
      </div>
    </ListelerPageShell>
  );
}
