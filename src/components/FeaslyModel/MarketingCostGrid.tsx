import { useFieldArray, useFormContext } from 'react-hook-form';
import { LineItemGrid } from './grids/LineItemGrid';
import { type FeaslyModelFormData } from './types';
import { type GridColumn, type LineItemBase } from './grids/types';

// Create a compatible interface that extends LineItemBase
interface MarketingCostLineItem extends LineItemBase {
  amount: number;
  campaign_type: 'digital' | 'print' | 'outdoor' | 'events' | 'other';
  target_demographic?: string;
}

const marketingCostColumns: GridColumn<MarketingCostLineItem>[] = [
  { key: 'description', title: 'Description', type: 'text', required: true, width: 200 },
  { key: 'amount', title: 'Amount', type: 'currency', required: true, width: 120 },
  { 
    key: 'campaign_type', 
    title: 'Channel', 
    type: 'select',
    width: 120,
    options: [
      { value: 'digital', label: 'Digital' },
      { value: 'print', label: 'Print' },
      { value: 'outdoor', label: 'Outdoor' },
      { value: 'events', label: 'Events' },
      { value: 'other', label: 'Other' }
    ]
  },
  { key: 'target_demographic', title: 'Persona', type: 'text', width: 120 },
  { key: 'start_month', title: 'Start Mo', type: 'number', width: 80 },
  { key: 'end_month', title: 'End Mo', type: 'number', width: 80 },
  { key: 'escalation_percent', title: 'Esc %', type: 'percent', width: 80 },
];

interface MarketingCostGridProps {
  className?: string;
}

export function MarketingCostGrid({ className }: MarketingCostGridProps) {
  const { control } = useFormContext<FeaslyModelFormData>();
  
  const { fields, append, remove, update } = useFieldArray({
    control,
    name: "marketing_cost_items"
  });

  const handleChange = (data: MarketingCostLineItem[]) => {
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

  // Convert fields to proper MarketingCostLineItem format
  const marketingCostItems: MarketingCostLineItem[] = fields.map((field) => ({
    id: field.id || crypto.randomUUID(),
    description: field.description || '',
    amount: field.amount || 0,
    start_month: field.start_month || 0,
    end_month: field.end_month || 0,
    escalation_percent: field.escalation_percent || 0,
    campaign_type: (field.campaign_type as any) || 'digital',
    target_demographic: field.target_demographic,
  }));

  return (
    <LineItemGrid
      data={marketingCostItems}
      config={{
        columns: marketingCostColumns,
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
      placeholder="No marketing campaigns yet. Add digital, print, outdoor campaigns, etc."
      maxHeight={600}
    />
  );
}