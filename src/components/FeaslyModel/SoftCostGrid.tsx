import { useFieldArray, useFormContext } from 'react-hook-form';
import { LineItemGrid } from './grids/LineItemGrid';
import { type FeaslyModelFormData } from './types';
import { type GridColumn, type LineItemBase } from './grids/types';

// Create a compatible interface that extends LineItemBase
interface SoftCostLineItem extends LineItemBase {
  amount: number;
  category: 'professional_fees' | 'permits' | 'insurance' | 'financing' | 'other';
  percentage_of_construction?: number;
}

const softCostColumns: GridColumn<SoftCostLineItem>[] = [
  { key: 'description', title: 'Description', type: 'text', required: true, width: 200 },
  { key: 'amount', title: 'Amount', type: 'currency', required: true, width: 120 },
  { 
    key: 'category', 
    title: 'Category', 
    type: 'select',
    width: 120,
    options: [
      { value: 'professional_fees', label: 'Professional Fees' },
      { value: 'permits', label: 'Permits' },
      { value: 'insurance', label: 'Insurance' },
      { value: 'financing', label: 'Financing' },
      { value: 'other', label: 'Other' }
    ]
  },
  { key: 'percentage_of_construction', title: '% of Constr.', type: 'percent', width: 100 },
  { key: 'start_month', title: 'Start Mo', type: 'number', width: 80 },
  { key: 'end_month', title: 'End Mo', type: 'number', width: 80 },
  { key: 'escalation_percent', title: 'Esc %', type: 'percent', width: 80 },
];

interface SoftCostGridProps {
  className?: string;
}

export function SoftCostGrid({ className }: SoftCostGridProps) {
  const { control } = useFormContext<FeaslyModelFormData>();
  
  const { fields, append, remove, update } = useFieldArray({
    control,
    name: "soft_cost_items"
  });

  const handleChange = (data: SoftCostLineItem[]) => {
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

  // Convert fields to proper SoftCostLineItem format
  const softCostItems: SoftCostLineItem[] = fields.map((field) => ({
    id: field.id || crypto.randomUUID(),
    description: field.description || '',
    amount: field.amount || 0,
    start_month: field.start_month || 0,
    end_month: field.end_month || 0,
    escalation_percent: field.escalation_percent || 0,
    category: (field.category as any) || 'other',
    percentage_of_construction: field.percentage_of_construction,
  }));

  return (
    <LineItemGrid
      data={softCostItems}
      config={{
        columns: softCostColumns,
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
      placeholder="No soft cost items yet. Add professional fees, permits, insurance, etc."
      maxHeight={600}
    />
  );
}