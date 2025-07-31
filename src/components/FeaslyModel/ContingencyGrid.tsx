import { useFieldArray, useFormContext } from 'react-hook-form';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, Plus, GripVertical, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { FeaslyModelFormData } from './types';

interface ContingencyItem {
  id: string;
  description: string;
  percentage_of_costs: number;
  applies_to: 'construction' | 'soft_costs' | 'marketing' | 'all';
  trigger_conditions?: string;
}

interface ContingencyGridProps {
  className?: string;
}

const appliesTo = [
  { value: 'construction', label: 'Construction' },
  { value: 'soft_costs', label: 'Soft Costs' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'all', label: 'All Costs' }
];

export function ContingencyGrid({ className }: ContingencyGridProps) {
  const { control, formState: { errors } } = useFormContext<FeaslyModelFormData>();
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "contingency_items"
  });

  const createNewItem = (): ContingencyItem => ({
    id: crypto.randomUUID(),
    description: "General Contingency",
    percentage_of_costs: 5,
    applies_to: 'all',
    trigger_conditions: ''
  });

  const handleAddItem = () => {
    append(createNewItem());
    toast.success("Contingency item added");
  };

  const handleRemoveItem = (index: number) => {
    remove(index);
    toast.success("Contingency item removed");
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

  const hasErrors = errors.contingency_items && Array.isArray(errors.contingency_items);
  const totalPercentage = fields.reduce((sum, field) => sum + (field.percentage_of_costs || 0), 0);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header with stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="h-4 w-4 text-muted-foreground" />
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">{fields.length}</span> contingencies • 
            <span className="font-medium ml-1">
              {totalPercentage.toFixed(1)}%
            </span> total coverage
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
          <div className="col-span-2">Percentage</div>
          <div className="col-span-2">Applies To</div>
          <div className="col-span-3">Trigger Conditions</div>
          <div className="col-span-1">Actions</div>
        </div>

        {/* Rows */}
        {fields.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <Shield className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No contingencies defined yet</p>
            <p className="text-xs mt-1">Add contingencies to manage project risks</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {fields.map((field, index) => {
              const fieldErrors = hasErrors ? errors.contingency_items?.[index] : undefined;
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
                      placeholder="Contingency description"
                      className={cn(
                        "h-8 text-xs",
                        fieldErrors?.description && "border-destructive"
                      )}
                    />
                  </div>

                  {/* Percentage */}
                  <div className="col-span-2">
                    <Input
                      type="number"
                      defaultValue={field.percentage_of_costs}
                      placeholder="5"
                      className={cn(
                        "h-8 text-xs",
                        fieldErrors?.percentage_of_costs && "border-destructive"
                      )}
                      min="0"
                      max="50"
                      step="0.5"
                    />
                  </div>

                  {/* Applies To */}
                  <div className="col-span-2">
                    <Select defaultValue={field.applies_to}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {appliesTo.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Trigger Conditions */}
                  <div className="col-span-3">
                    <Input
                      defaultValue={field.trigger_conditions}
                      placeholder="When to apply..."
                      className={cn(
                        "h-8 text-xs",
                        fieldErrors?.trigger_conditions && "border-destructive"
                      )}
                    />
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
          Add Contingency
        </Button>
      </div>

      {/* Help text */}
      <div className="text-xs text-muted-foreground space-y-1">
        <p><kbd className="kbd">Ctrl + Enter</kbd> Add new contingency • <kbd className="kbd">Ctrl + Del</kbd> Delete contingency</p>
        <p>Drag rows to reorder • Typical range: 5-15% of applicable costs</p>
      </div>
    </div>
  );
}