import { useFieldArray, useFormContext } from 'react-hook-form';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, GripVertical, Calculator } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { FeaslyModelFormData } from './types';

interface ConstructionItem {
  id: string;
  description: string;
  base_cost: number;
  start_month: number;
  end_month: number;
  escalation_percent: number;
  retention_percent: number;
  retention_release_lag: number;
}

interface ConstructionCostGridProps {
  className?: string;
}

export function ConstructionCostGrid({ className }: ConstructionCostGridProps) {
  const { control, formState: { errors } } = useFormContext<FeaslyModelFormData>();
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "construction_items"
  });

  const createNewItem = (): ConstructionItem => ({
    id: crypto.randomUUID(),
    description: "New Construction Item",
    base_cost: 0,
    start_month: 0,
    end_month: 12,
    escalation_percent: 0,
    retention_percent: 5,
    retention_release_lag: 6
  });

  const handleAddItem = () => {
    append(createNewItem());
    toast.success("Construction item added");
  };

  const handleRemoveItem = (index: number) => {
    if (fields.length <= 1) {
      toast.error("At least one construction item is required");
      return;
    }
    remove(index);
    toast.success("Construction item removed");
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

  const hasErrors = errors.construction_items && Array.isArray(errors.construction_items);
  const totalCost = fields.reduce((sum, field) => sum + (field.base_cost || 0), 0);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header with stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Calculator className="h-4 w-4 text-muted-foreground" />
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
          <div className="col-span-2">Base Cost</div>
          <div className="col-span-1">Start Mo</div>
          <div className="col-span-1">End Mo</div>
          <div className="col-span-1">Esc %</div>
          <div className="col-span-1">Ret %</div>
          <div className="col-span-1">Lag Mo</div>
          <div className="col-span-1">Actions</div>
        </div>

        {/* Rows */}
        {fields.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <Calculator className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No construction items yet</p>
            <p className="text-xs mt-1">Add your first item to begin</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {fields.map((field, index) => {
              const fieldErrors = hasErrors ? errors.construction_items?.[index] : undefined;
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
                      onChange={(e) => {
                        // Update through form control
                        const event = new Event('input', { bubbles: true });
                        Object.defineProperty(event, 'target', {
                          writable: false,
                          value: e.target
                        });
                      }}
                    />
                  </div>

                  {/* Base Cost */}
                  <div className="col-span-2">
                    <Input
                      type="number"
                      defaultValue={field.base_cost}
                      placeholder="0"
                      className={cn(
                        "h-8 text-xs",
                        fieldErrors?.base_cost && "border-destructive"
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
                        fieldErrors?.escalation_percent && "border-destructive",
                        field.escalation_percent > 10 && "border-warning"
                      )}
                      min="0"
                      max="50"
                      step="0.5"
                    />
                  </div>

                  {/* Retention % */}
                  <div className="col-span-1">
                    <Input
                      type="number"
                      defaultValue={field.retention_percent}
                      placeholder="5"
                      className={cn(
                        "h-8 text-xs",
                        fieldErrors?.retention_percent && "border-destructive"
                      )}
                      min="0"
                      max="100"
                      step="1"
                    />
                  </div>

                  {/* Release Lag */}
                  <div className="col-span-1">
                    <Input
                      type="number"
                      defaultValue={field.retention_release_lag}
                      placeholder="6"
                      className={cn(
                        "h-8 text-xs",
                        fieldErrors?.retention_release_lag && "border-destructive"
                      )}
                      min="0"
                      step="1"
                    />
                  </div>

                  {/* Actions */}
                  <div className="col-span-1 flex items-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                      onClick={() => handleRemoveItem(index)}
                      disabled={fields.length <= 1}
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
          Add Construction Item
        </Button>
      </div>

      {/* Help text */}
      <div className="text-xs text-muted-foreground space-y-1">
        <p><kbd className="kbd">Ctrl + Enter</kbd> Add new item • <kbd className="kbd">Ctrl + Del</kbd> Delete item</p>
        <p>Drag rows to reorder • Escalation over 10% shows warning</p>
      </div>
    </div>
  );
}