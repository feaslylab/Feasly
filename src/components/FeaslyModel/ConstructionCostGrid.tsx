import { useFieldArray, useFormContext } from 'react-hook-form';
import { LineItemGrid } from './grids/LineItemGrid';
import { type FeaslyModelFormData } from './types';
import { type GridColumn, type LineItemBase } from './grids/types';

// Create a compatible interface that extends LineItemBase
interface ConstructionLineItem extends LineItemBase {
  amount: number;
  phase?: string;
  contractor?: string;
  retention_percent?: number;
  retention_release_lag?: number;
}

const constructionColumns: GridColumn<ConstructionLineItem>[] = [
  { key: 'description', title: 'Description', type: 'text', required: true, width: 200 },
  { key: 'amount', title: 'Amount', type: 'currency', required: true, width: 120 },
  { key: 'start_month', title: 'Start Mo', type: 'number', width: 80 },
  { key: 'end_month', title: 'End Mo', type: 'number', width: 80 },
  { key: 'escalation_percent', title: 'Esc %', type: 'percent', width: 80 },
  { key: 'retention_percent', title: 'Ret %', type: 'percent', width: 80 },
  { key: 'retention_release_lag', title: 'Lag Mo', type: 'number', width: 80 },
];

interface ConstructionCostGridProps {
  className?: string;
}

export function ConstructionCostGrid({ className }: ConstructionCostGridProps) {
  const { control } = useFormContext<FeaslyModelFormData>();
  
  const { fields, append, remove, update } = useFieldArray({
    control,
    name: "construction_items"
  });

  const handleChange = (data: ConstructionLineItem[]) => {
    // Update the form array - this is a simplified approach
    data.forEach((item, index) => {
      if (index < fields.length) {
        update(index, item);
      } else {
        append(item);
      }
    });
    
    // Remove extra items if the new data is shorter
    if (data.length < fields.length) {
      for (let i = fields.length - 1; i >= data.length; i--) {
        remove(i);
      }
    }
  };

  // Convert fields to proper ConstructionLineItem format
  const constructionItems: ConstructionLineItem[] = fields.map((field) => ({
    id: field.id || crypto.randomUUID(),
    description: field.description || '',
    amount: field.amount || 0,
    start_month: field.start_month || 0,
    end_month: field.end_month || 0,
    escalation_percent: field.escalation_percent || 0,
    phase: field.phase,
    contractor: field.contractor,
    retention_percent: field.retention_percent,
    retention_release_lag: field.retention_release_lag,
  }));

  return (
    <LineItemGrid
      data={constructionItems}
      config={{
        columns: constructionColumns,
        allowAdd: true,
        allowDelete: true,
        allowReorder: true,
        allowBulkEdit: true,
        allowImport: true,
        allowExport: true,
        virtualized: true,
        maxRows: 1000
      }}
      onChange={handleChange}
      className={className}
      placeholder="No construction items yet. Add your first item to begin."
      maxHeight={600}
      fieldName="construction_items"
    />
  );
}