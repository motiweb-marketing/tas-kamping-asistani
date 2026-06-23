import ListWorkflowBanner from '@/components/admin/listeler/ListWorkflowBanner';
import ListelerPageShell from '@/components/admin/listeler/ListelerPageShell';
import ScopedListEditor from '@/components/admin/listeler/ScopedListEditor';
import { getListConfig } from '@/lib/list-config';

export default function KisiselListePage() {
  const config = getListConfig('kisisel')!;

  return (
    <ListelerPageShell config={config}>
      <div className="mb-6">
        <ListWorkflowBanner compact />
      </div>
      <ScopedListEditor config={config} />
    </ListelerPageShell>
  );
}
