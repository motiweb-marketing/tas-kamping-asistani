import Link from 'next/link';
import { LIST_WORKFLOW_STEPS } from '@/lib/list-config';

export default function ListWorkflowBanner({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <p className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
        Sıra:{' '}
        {LIST_WORKFLOW_STEPS.map((s, i) => (
          <span key={s.step}>
            {i > 0 && ' → '}
            <Link href={s.href} className="font-semibold underline">
              {s.title}
            </Link>
          </span>
        ))}
      </p>
    );
  }

  return (
    <ol className="grid gap-3 sm:grid-cols-2">
      {LIST_WORKFLOW_STEPS.map((s) => (
        <li
          key={s.step}
          className="rounded-xl border border-forest-100 bg-white p-4 shadow-sm"
        >
          <span className="text-xs font-bold text-forest-500">Adım {s.step}</span>
          <p className="mt-1 font-semibold text-forest-950">
            <Link href={s.href} className="hover:underline">
              {s.title}
            </Link>
          </p>
          <p className="mt-1 text-sm text-forest-600">{s.description}</p>
        </li>
      ))}
    </ol>
  );
}
