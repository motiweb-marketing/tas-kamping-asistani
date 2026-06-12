import ListWorkflowBanner from '@/components/admin/listeler/ListWorkflowBanner';
import KampListEditor from '@/components/admin/listeler/KampListEditor';
import ListelerPageShell from '@/components/admin/listeler/ListelerPageShell';
import { getListConfig } from '@/lib/list-config';

export default function KampListePage() {
  const config = getListConfig('kamp')!;

  return (
    <ListelerPageShell config={config}>
      <div className="mb-6">
        <ListWorkflowBanner compact />
      </div>
      <KampListEditor />
    </ListelerPageShell>
  );
}
