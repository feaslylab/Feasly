import { useFieldArray, useFormContext } from 'react-hook-form';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Plus, GripVertical, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { FeaslyModelFormData } from './types';

interface SoftCostItem {
  id: string;
  description: string;
  amount: number;
  start_month: number;
  end_month: number;
  escalation_percent: number;
  category: 'professional_fees' | 'permits' | 'insurance' | 'financing' | 'other';
  percentage_of_construction?: number;
}

interface SoftCostGridProps {
  className?: string;
}

const categoryOptions = [
  { value: 'professional_fees', label: 'Professional Fees' },
  { value: 'permits', label: 'Permits' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'financing', label: 'Financing' },
  { value: 'other', label: 'Other' }
];

export function SoftCostGrid({ className }: SoftCostGridProps) {
  const { control, formState: { errors } } = useFormContext<FeaslyModelFormData>();
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "soft_cost_items"
  });

  const createNewItem = (): SoftCostItem => ({
    id: crypto.randomUUID(),
    description: "New Soft Cost Item",
    amount: 0,
    start_month: 0,
    end_month: 12,
    escalation_percent: 0,
    category: 'other',
    percentage_of_construction: 0
  });

  const handleAddItem = () => {
    append(createNewItem());
    toast.success("Soft cost item added");
  };

  const handleRemoveItem = (index: number) => {
    remove(index);
    toast.success("Soft cost item removed");
  };

  const handleKeyDown = (e: React.KeyboardEvent, index?: number) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      handleAddItem();
    } else if (e.key === 'Delete' && e.ctrlKey && index !== undefined) {
      e.preventDefault();
      handleRemoveItem(index);
    }
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      move(draggedIndex, dropIndex);
      toast.success("Item reordered");
    }
    setDraggedIndex(null);
  };

  const hasErrors = errors.soft_cost_items && Array.isArray(errors.soft_cost_items);
  const totalCost = fields.reduce((sum, field) => sum + (field.amount || 0), 0);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header with stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">{fields.length}</span> items • 
            <span className="font-medium ml-1">
              {new Intl.NumberFormat().format(totalCost)}
            </span> total cost
          </div>
        </div>
        <Badge variant={fields.length > 0 ? "secondary" : "outline"}>
          {fields.length} {fields.length === 1 ? 'Item' : 'Items'}
        </Badge>
      </div>

      {/* Grid container */}
      <div className="border rounded-lg overflow-hidden">
        {/* Header */}
        <div className="bg-muted/50 border-b grid grid-cols-12 gap-2 p-3 text-xs font-medium text-muted-foreground">
          <div className="col-span-1"></div> {/* Drag handle */}
          <div className="col-span-3">Description</div>
          <div className="col-span-2">Amount</div>
          <div className="col-span-1">Start Mo</div>
          <div className="col-span-1">End Mo</div>
          <div className="col-span-1">Esc %</div>
          <div className="col-span-2">Category</div>
          <div className="col-span-1">Actions</div>
        </div>

        {/* Rows */}
        {fields.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No soft cost items yet</p>
            <p className="text-xs mt-1">Add your first item to begin</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {fields.map((field, index) => {
              const fieldErrors = hasErrors ? errors.soft_cost_items?.[index] : undefined;
              const hasRowErrors = fieldErrors && Object.keys(fieldErrors).length > 0;
              
              return (
                <div
                  key={field.id}
                  className={cn(
                    "grid grid-cols-12 gap-2 p-3 hover:bg-muted/30 transition-colors",
                    hasRowErrors && "bg-destructive/5",
                    draggedIndex === index && "opacity-50"
                  )}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                >
                  {/* Drag handle */}
                  <div className="col-span-1 flex items-center">
                    <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab hover:text-foreground" />
                  </div>

                  {/* Description */}
                  <div className="col-span-3">
                    <Input
                      defaultValue={field.description}
                      placeholder="Item description"
                      className={cn(
                        "h-8 text-xs",
                        fieldErrors?.description && "border-destructive"
                      )}
                    />
                  </div>

                  {/* Amount */}
                  <div className="col-span-2">
                    <Input
                      type="number"
                      defaultValue={field.amount}
                      placeholder="0"
                      className={cn(
                        "h-8 text-xs",
                        fieldErrors?.amount && "border-destructive"
                      )}
                      min="0"
                      step="1000"
                    />
                  </div>

                  {/* Start Month */}
                  <div className="col-span-1">
                    <Input
                      type="number"
                      defaultValue={field.start_month}
                      placeholder="0"
                      className={cn(
                        "h-8 text-xs",
                        fieldErrors?.start_month && "border-destructive"
                      )}
                      min="0"
                      step="1"
                    />
                  </div>

                  {/* End Month */}
                  <div className="col-span-1">
                    <Input
                      type="number"
                      defaultValue={field.end_month}
                      placeholder="12"
                      className={cn(
                        "h-8 text-xs",
                        fieldErrors?.end_month && "border-destructive"
                      )}
                      min="0"
                      step="1"
                    />
                  </div>

                  {/* Escalation % */}
                  <div className="col-span-1">
                    <Input
                      type="number"
                      defaultValue={field.escalation_percent}
                      placeholder="0"
                      className={cn(
                        "h-8 text-xs",
                        fieldErrors?.escalation_percent && "border-destructive"
                      )}
                      min="0"
                      max="50"
                      step="0.5"
                    />
                  </div>

                  {/* Category */}
                  <div className="col-span-2">
                    <Select defaultValue={field.category}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categoryOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Actions */}
                  <div className="col-span-1 flex items-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                      onClick={() => handleRemoveItem(index)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add button */}
      <div className="flex justify-start">
        <Button
          variant="outline"
          size="sm"
          onClick={handleAddItem}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Soft Cost Item
        </Button>
      </div>

      {/* Help text */}
      <div className="text-xs text-muted-foreground space-y-1">
        <p><kbd className="kbd">Ctrl + Enter</kbd> Add new item • <kbd className="kbd">Ctrl + Del</kbd> Delete item</p>
        <p>Drag rows to reorder • Professional fees, permits, insurance, etc.</p>
      </div>
    </div>
  );
}