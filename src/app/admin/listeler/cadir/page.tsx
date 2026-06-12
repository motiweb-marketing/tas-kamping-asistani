import ListWorkflowBanner from '@/components/admin/listeler/ListWorkflowBanner';
import ListelerPageShell from '@/components/admin/listeler/ListelerPageShell';
import RecommendationListEditor from '@/components/admin/listeler/RecommendationListEditor';
import { getListConfig } from '@/lib/list-config';

export default function CadirListePage() {
  const config = getListConfig('cadir')!;

  return (
    <ListelerPageShell config={config}>
      <div className="mb-6">
        <ListWorkflowBanner compact />
      </div>
      <RecommendationListEditor config={config} />
    </ListelerPageShell>
  );
}
