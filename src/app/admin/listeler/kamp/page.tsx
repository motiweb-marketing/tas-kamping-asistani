import ListWorkflowBanner from '@/components/admin/listeler/ListWorkflowBanner';
import AiListReadyBanner from '@/components/admin/listeler/AiListReadyBanner';
import ScopedListEditor from '@/components/admin/listeler/ScopedListEditor';
import ListelerPageShell from '@/components/admin/listeler/ListelerPageShell';
import { getListConfig } from '@/lib/list-config';

export default function KampListePage() {
  const config = getListConfig('kamp')!;

  return (
    <ListelerPageShell config={config}>
      <AiListReadyBanner />
      <div className="mb-6">
        <ListWorkflowBanner compact />
      </div>
      <ScopedListEditor config={config} />
    </ListelerPageShell>
  );
}
