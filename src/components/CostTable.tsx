import EditableNumber from './EditableNumber';
import { useConstructionStore } from '@/hooks/useConstructionStore';
import { useSelectionStore }   from '@/state/selectionStore';

export default function CostTable() {
  const { projectId, scenarioId } = useSelectionStore();
  
  if(!projectId || !scenarioId) return null;
  
  // For now, return a placeholder since the actual construction store structure is different
  return (
    <div className="w-full text-sm p-4 border rounded">
      <p className="text-muted-foreground">Construction cost editing will be available soon.</p>
    </div>
  );
}