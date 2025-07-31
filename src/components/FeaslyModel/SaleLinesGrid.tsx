import { useFieldArray, useFormContext } from 'react-hook-form';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, GripVertical, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { FeaslyModelFormData } from './types';

interface SaleLine {
  id: string;
  product_type: string;
  units: number;
  price_per_unit: number;
  start_month: number;
  end_month: number;
  annual_escalation_percent: number;
}

interface SaleLinesGridProps {
  className?: string;
}

export function SaleLinesGrid({ className }: SaleLinesGridProps) {
  const { control, formState: { errors } } = useFormContext<FeaslyModelFormData>();
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "sale_lines"
  });

  const createNewLine = (): SaleLine => ({
    id: crypto.randomUUID(),
    product_type: "Residential Units",
    units: 1,
    price_per_unit: 0,
    start_month: 24,
    end_month: 36,
    annual_escalation_percent: 3
  });

  const handleAddLine = () => {
    append(createNewLine());
    toast.success("Sale line added");
  };

  const handleRemoveLine = (index: number) => {
    if (fields.length <= 1) {
      toast.error("At least one sale line is required");
      return;
    }
    remove(index);
    toast.success("Sale line removed");
  };

  const handleKeyDown = (e: React.KeyboardEvent, index?: number) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      handleAddLine();
    } else if (e.key === 'Delete' && e.ctrlKey && index !== undefined) {
      e.preventDefault();
      handleRemoveLine(index);
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

  const hasErrors = errors.sale_lines && Array.isArray(errors.sale_lines);
  const totalRevenue = fields.reduce((sum, field) => 
    sum + ((field.units || 0) * (field.price_per_unit || 0)), 0
  );

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header with stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">{fields.length}</span> lines • 
            <span className="font-medium ml-1">
              {new Intl.NumberFormat().format(totalRevenue)}
            </span> total revenue
          </div>
        </div>
        <Badge variant={fields.length > 0 ? "secondary" : "outline"}>
          {fields.length} {fields.length === 1 ? 'Line' : 'Lines'}
        </Badge>
      </div>

      {/* Grid container */}
      <div className="border rounded-lg overflow-hidden">
        {/* Header */}
        <div className="bg-muted/50 border-b grid grid-cols-12 gap-2 p-3 text-xs font-medium text-muted-foreground">
          <div className="col-span-1"></div> {/* Drag handle */}
          <div className="col-span-3">Product / Unit Type</div>
          <div className="col-span-2">Units</div>
          <div className="col-span-2">Price/Unit</div>
          <div className="col-span-1">Start Mo</div>
          <div className="col-span-1">End Mo</div>
          <div className="col-span-1">Esc %</div>
          <div className="col-span-1">Actions</div>
        </div>

        {/* Rows */}
        {fields.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No sale lines yet</p>
            <p className="text-xs mt-1">Add your first line to begin</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {fields.map((field, index) => {
              const fieldErrors = hasErrors ? errors.sale_lines?.[index] : undefined;
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

                  {/* Product Type */}
                  <div className="col-span-3">
                    <Input
                      defaultValue={field.product_type}
                      placeholder="Product type"
                      className={cn(
                        "h-8 text-xs",
                        fieldErrors?.product_type && "border-destructive"
                      )}
                    />
                  </div>

                  {/* Units */}
                  <div className="col-span-2">
                    <Input
                      type="number"
                      defaultValue={field.units}
                      placeholder="1"
                      className={cn(
                        "h-8 text-xs",
                        fieldErrors?.units && "border-destructive"
                      )}
                      min="1"
                      step="1"
                    />
                  </div>

                  {/* Price per Unit */}
                  <div className="col-span-2">
                    <Input
                      type="number"
                      defaultValue={field.price_per_unit}
                      placeholder="0"
                      className={cn(
                        "h-8 text-xs",
                        fieldErrors?.price_per_unit && "border-destructive"
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
                      placeholder="24"
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
                      placeholder="36"
                      className={cn(
                        "h-8 text-xs",
                        fieldErrors?.end_month && "border-destructive"
                      )}
                      min="0"
                      step="1"
                    />
                  </div>

                  {/* Annual Escalation % */}
                  <div className="col-span-1">
                    <Input
                      type="number"
                      defaultValue={field.annual_escalation_percent}
                      placeholder="3"
                      className={cn(
                        "h-8 text-xs",
                        fieldErrors?.annual_escalation_percent && "border-destructive",
                        field.annual_escalation_percent > 10 && "border-warning"
                      )}
                      min="0"
                      max="50"
                      step="0.5"
                    />
                  </div>

                  {/* Actions */}
                  <div className="col-span-1 flex items-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                      onClick={() => handleRemoveLine(index)}
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
          onClick={handleAddLine}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Sale Line
        </Button>
      </div>

      {/* Help text */}
      <div className="text-xs text-muted-foreground space-y-1">
        <p><kbd className="kbd">Ctrl + Enter</kbd> Add new line • <kbd className="kbd">Ctrl + Del</kbd> Delete line</p>
        <p>Drag rows to reorder • Escalation over 10% shows warning</p>
      </div>
    </div>
  );
}