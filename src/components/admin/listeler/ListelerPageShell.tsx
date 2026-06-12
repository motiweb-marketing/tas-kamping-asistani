import ListelerSubNav from './ListelerSubNav';
import type { ListTypeConfig } from '@/lib/list-config';

interface ListelerPageShellProps {
  config?: ListTypeConfig;
  title?: string;
  description?: string;
  children: React.ReactNode;
}

export default function ListelerPageShell({
  config,
  title,
  description,
  children,
}: ListelerPageShellProps) {
  const pageTitle = title || config?.title || 'Listeler';
  const pageDesc = description || config?.description;

  return (
    <div>
      <ListelerSubNav />
      <header className="mb-6">
        <h1 className="font-display text-xl font-bold text-forest-950 sm:text-2xl">{pageTitle}</h1>
        {pageDesc && <p className="mt-2 text-sm leading-relaxed text-forest-600">{pageDesc}</p>}
        {config?.participantHint && (
          <p className="mt-2 text-xs text-forest-500">{config.participantHint}</p>
        )}
      </header>
      {children}
    </div>
  );
}
