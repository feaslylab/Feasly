import { useFieldArray, useFormContext } from 'react-hook-form';
import { LineItemGrid } from './grids/LineItemGrid';
import { type FeaslyModelFormData } from './types';
import { type GridColumn, type LineItemBase } from './grids/types';

// Create a compatible interface that extends LineItemBase  
interface ContingencyLineItem extends LineItemBase {
  percentage_of_costs: number;
  applies_to: 'construction' | 'soft_costs' | 'marketing' | 'all';
  trigger_conditions?: string;
}

const contingencyColumns: GridColumn<ContingencyLineItem>[] = [
  { key: 'description', title: 'Description', type: 'text', required: true, width: 200 },
  { key: 'percentage_of_costs', title: '% of Costs', type: 'percent', required: true, width: 120 },
  { 
    key: 'applies_to', 
    title: 'Applies to', 
    type: 'select',
    width: 120,
    options: [
      { value: 'construction', label: 'Construction' },
      { value: 'soft_costs', label: 'Soft Costs' },
      { value: 'marketing', label: 'Marketing' },
      { value: 'all', label: 'All' }
    ]
  },
  { key: 'trigger_conditions', title: 'Trigger', type: 'text', width: 200 },
];

interface ContingencyGridProps {
  className?: string;
}

export function ContingencyGrid({ className }: ContingencyGridProps) {
  const { control } = useFormContext<FeaslyModelFormData>();
  
  const { fields, append, remove, update } = useFieldArray({
    control,
    name: "contingency_items"
  });

  const handleChange = (data: ContingencyLineItem[]) => {
    data.forEach((item, index) => {
      if (index < fields.length) {
        update(index, item);
      } else {
        append(item);
      }
    });
    
    if (data.length < fields.length) {
      for (let i = fields.length - 1; i >= data.length; i--) {
        remove(i);
      }
    }
  };

  // Convert fields to proper ContingencyLineItem format
  const contingencyItems: ContingencyLineItem[] = fields.map((field) => ({
    id: field.id || crypto.randomUUID(),
    description: field.description || '',
    start_month: 0, // Not used for contingencies
    end_month: 0,   // Not used for contingencies
    escalation_percent: 0, // Not used for contingencies
    percentage_of_costs: field.percentage_of_costs || 5,
    applies_to: (field.applies_to as any) || 'all',
    trigger_conditions: field.trigger_conditions,
  }));

  return (
    <LineItemGrid
      data={contingencyItems}
      config={{
        columns: contingencyColumns,
        allowAdd: true,
        allowDelete: true,
        allowReorder: true,
        allowBulkEdit: false, // Bulk actions don't make as much sense for contingencies
        allowImport: false,   // Usually hand-crafted
        allowExport: true,
        virtualized: false,   // Usually small number of contingencies
        maxRows: 20
      }}
      onChange={handleChange}
      className={className}
      placeholder="No contingencies defined yet. Add contingencies to manage project risks."
      maxHeight={400}
      fieldName="contingency_items"
    />
  );
}