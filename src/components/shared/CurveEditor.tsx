import { useState, useMemo, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { RotateCcw, TrendingUp, Calendar, Percent } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export interface CurveData {
  meaning: "sell_through" | "occupancy" | "drawdown" | "phasing";
  values: number[];
}

export interface CurveEditorProps {
  id: string;
  label: string;
  totalAmount: number;
  curve: CurveData;
  totalPeriods: number;
  currency?: string;
  onChange: (newValues: number[]) => void;
}

type PresetType = "linear" | "ramp_up" | "one_time" | "delayed_start" | "custom";

const presetOptions = [
  { value: "linear", label: "🔁 Linear", description: "Evenly distributed" },
  { value: "ramp_up", label: "🪜 Ramp Up", description: "S-curve distribution" },
  { value: "one_time", label: "⏳ One-time", description: "Single month" },
  { value: "delayed_start", label: "💤 Delayed Start", description: "Start after delay" },
  { value: "custom", label: "🧮 Custom", description: "Manual values" },
];

function generatePresetCurve(
  preset: PresetType,
  totalPeriods: number,
  meaning: CurveData["meaning"],
  totalAmount: number,
  delayMonths: number = 6,
  oneTimeMonth: number = 12
): number[] {
  const values = new Array(totalPeriods).fill(0);
  
  switch (preset) {
    case "linear": {
      const isPercentage = meaning === "sell_through" || meaning === "occupancy";
      const target = isPercentage ? 1.0 : totalAmount;
      const monthlyValue = target / totalPeriods;
      return values.fill(monthlyValue);
    }
    
    case "ramp_up": {
      // S-curve: slow start, fast middle, slow end
      const isPercentage = meaning === "sell_through" || meaning === "occupancy";
      const target = isPercentage ? 1.0 : totalAmount;
      
      for (let i = 0; i < totalPeriods; i++) {
        const progress = (i + 1) / totalPeriods;
        // S-curve formula: 3*t^2 - 2*t^3
        const sCurve = 3 * Math.pow(progress, 2) - 2 * Math.pow(progress, 3);
        values[i] = target * (sCurve - (i > 0 ? (3 * Math.pow(i / totalPeriods, 2) - 2 * Math.pow(i / totalPeriods, 3)) : 0));
      }
      
      // Normalize to ensure exact total
      const sum = values.reduce((a, b) => a + b, 0);
      return values.map(v => v * target / sum);
    }
    
    case "one_time": {
      const monthIndex = Math.min(oneTimeMonth, totalPeriods - 1);
      const isPercentage = meaning === "sell_through" || meaning === "occupancy";
      const target = isPercentage ? 1.0 : totalAmount;
      values[monthIndex] = target;
      return values;
    }
    
    case "delayed_start": {
      const isPercentage = meaning === "sell_through" || meaning === "occupancy";
      const target = isPercentage ? 1.0 : totalAmount;
      const activeMonths = totalPeriods - delayMonths;
      const monthlyValue = activeMonths > 0 ? target / activeMonths : 0;
      
      for (let i = delayMonths; i < totalPeriods; i++) {
        values[i] = monthlyValue;
      }
      return values;
    }
    
    default:
      return values;
  }
}

export default function CurveEditor({
  id,
  label,
  totalAmount,
  curve,
  totalPeriods,
  currency = "AED",
  onChange
}: CurveEditorProps) {
  const [selectedPreset, setSelectedPreset] = useState<PresetType>("custom");
  const [editingCell, setEditingCell] = useState<number | null>(null);
  const [tempValue, setTempValue] = useState<string>("");
  const [oneTimeMonth, setOneTimeMonth] = useState(12);
  const [delayMonths, setDelayMonths] = useState(6);
  const { toast } = useToast();

  // Calculate metrics
  const metrics = useMemo(() => {
    const sum = curve.values.reduce((a, b) => a + b, 0);
    const avg = sum / totalPeriods;
    const nonZeroValues = curve.values.filter(v => v > 0);
    const activeMonths = nonZeroValues.length;
    
    const isPercentage = curve.meaning === "sell_through" || curve.meaning === "occupancy";
    const expectedTotal = isPercentage ? 1.0 : totalAmount;
    const completion = expectedTotal > 0 ? (sum / expectedTotal) * 100 : 0;
    
    return {
      sum,
      avg,
      activeMonths,
      completion,
      isValid: Math.abs(sum - expectedTotal) < 0.01
    };
  }, [curve.values, totalPeriods, totalAmount, curve.meaning]);

  const applyPreset = useCallback((preset: PresetType) => {
    const newValues = generatePresetCurve(
      preset,
      totalPeriods,
      curve.meaning,
      totalAmount,
      delayMonths,
      oneTimeMonth
    );
    onChange(newValues);
    setSelectedPreset(preset);
    
    toast({
      title: "Preset Applied",
      description: `${presetOptions.find(p => p.value === preset)?.label} curve applied`,
    });
  }, [totalPeriods, curve.meaning, totalAmount, delayMonths, oneTimeMonth, onChange, toast]);

  const handleCellClick = useCallback((index: number) => {
    setEditingCell(index);
    setTempValue(curve.values[index]?.toString() || "0");
  }, [curve.values]);

  const handleCellSave = useCallback(() => {
    if (editingCell === null) return;
    
    const newValue = parseFloat(tempValue) || 0;
    if (newValue < 0) {
      toast({
        title: "Invalid Value",
        description: "Values cannot be negative",
        variant: "destructive",
      });
      return;
    }
    
    const newValues = [...curve.values];
    newValues[editingCell] = newValue;
    
    // Auto-normalize for percentage-based curves
    if (curve.meaning === "sell_through" || curve.meaning === "occupancy") {
      const sum = newValues.reduce((a, b) => a + b, 0);
      if (sum > 1.01) {
        // If sum exceeds 100%, proportionally reduce other values
        const excess = sum - 1.0;
        const otherIndices = newValues.map((_, i) => i).filter(i => i !== editingCell);
        const otherSum = otherIndices.reduce((sum, i) => sum + newValues[i], 0);
        
        if (otherSum > excess) {
          otherIndices.forEach(i => {
            newValues[i] = Math.max(0, newValues[i] - (excess * newValues[i] / otherSum));
          });
        }
      }
    }
    
    onChange(newValues);
    setEditingCell(null);
    setSelectedPreset("custom");
  }, [editingCell, tempValue, curve.values, curve.meaning, onChange, toast]);

  const handleCellCancel = useCallback(() => {
    setEditingCell(null);
    setTempValue("");
  }, []);

  const formatValue = useCallback((value: number) => {
    const isPercentage = curve.meaning === "sell_through" || curve.meaning === "occupancy";
    if (isPercentage) {
      return `${(value * 100).toFixed(1)}%`;
    }
    return value.toLocaleString();
  }, [curve.meaning]);

  const getMonthLabel = useCallback((index: number) => {
    return `M${index + 1}`;
  }, []);

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            {label} - Curve Editor
          </h3>
          <p className="text-xs text-muted-foreground">
            Adjust monthly distribution for {curve.meaning.replace('_', ' ')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={() => applyPreset(selectedPreset)}>
            <RotateCcw className="h-4 w-4 mr-1" />
            Reset
          </Button>
        </div>
      </div>

      {/* Preset Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="preset-select">Preset Distribution</Label>
          <Select value={selectedPreset} onValueChange={(value: PresetType) => applyPreset(value)}>
            <SelectTrigger id="preset-select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {presetOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex flex-col">
                    <span>{option.label}</span>
                    <span className="text-xs text-muted-foreground">{option.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedPreset === "one_time" && (
          <div className="space-y-2">
            <Label htmlFor="one-time-month">Target Month</Label>
            <Input
              id="one-time-month"
              type="number"
              min={1}
              max={totalPeriods}
              value={oneTimeMonth}
              onChange={(e) => setOneTimeMonth(Number(e.target.value))}
            />
          </div>
        )}

        {selectedPreset === "delayed_start" && (
          <div className="space-y-2">
            <Label htmlFor="delay-months">Delay Months</Label>
            <Input
              id="delay-months"
              type="number"
              min={0}
              max={totalPeriods - 1}
              value={delayMonths}
              onChange={(e) => setDelayMonths(Number(e.target.value))}
            />
          </div>
        )}
      </div>

      {/* Metrics Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-3 bg-muted/50 rounded-lg">
        <div className="text-center">
          <div className="text-xs text-muted-foreground">Total</div>
          <div className="font-semibold">{formatValue(metrics.sum)}</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-muted-foreground">Average</div>
          <div className="font-semibold">{formatValue(metrics.avg)}</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-muted-foreground">Active Months</div>
          <div className="font-semibold">{metrics.activeMonths}</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-muted-foreground">Completion</div>
          <div className={`font-semibold ${metrics.isValid ? 'text-green-600' : 'text-yellow-600'}`}>
            {metrics.completion.toFixed(1)}%
          </div>
        </div>
      </div>

      {!metrics.isValid && (
        <div className="p-3 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
            <Percent className="h-4 w-4" />
            <span className="text-sm font-medium">Distribution Warning</span>
          </div>
          <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
            Total distribution does not equal expected amount. 
            {curve.meaning === "sell_through" || curve.meaning === "occupancy" 
              ? " Values should sum to 100%." 
              : ` Values should sum to ${totalAmount.toLocaleString()} ${currency}.`}
          </p>
        </div>
      )}

      {/* Gantt Grid */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          <h4 className="text-sm font-semibold">Monthly Distribution Grid</h4>
        </div>
        
        <div className="border rounded-lg overflow-x-auto">
          <div className="min-w-max">
            {/* Header */}
            <div className="grid grid-cols-12 gap-0 bg-muted/50 border-b">
              {Array.from({ length: Math.min(12, totalPeriods) }, (_, i) => (
                <div key={i} className="p-2 text-xs font-medium text-center border-r last:border-r-0">
                  {getMonthLabel(i)}
                </div>
              ))}
            </div>
            
            {/* Values Grid - Show first 12 months primarily, then provide scroll for more */}
            <div className="grid grid-cols-12 gap-0">
              {Array.from({ length: Math.min(12, totalPeriods) }, (_, i) => (
                <div
                  key={i}
                  className="p-2 border-r last:border-r-0 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleCellClick(i)}
                >
                  {editingCell === i ? (
                    <Input
                      value={tempValue}
                      onChange={(e) => setTempValue(e.target.value)}
                      onBlur={handleCellSave}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleCellSave();
                        if (e.key === 'Escape') handleCellCancel();
                      }}
                      className="h-6 text-xs p-1"
                      autoFocus
                    />
                  ) : (
                    <div className="text-xs">
                      {formatValue(curve.values[i] || 0)}
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {/* Show remaining months if more than 12 */}
            {totalPeriods > 12 && (
              <>
                <div className="grid grid-cols-12 gap-0 bg-muted/30 border-t">
                  {Array.from({ length: Math.min(12, totalPeriods - 12) }, (_, i) => (
                    <div key={i + 12} className="p-2 text-xs font-medium text-center border-r last:border-r-0">
                      {getMonthLabel(i + 12)}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-12 gap-0">
                  {Array.from({ length: Math.min(12, totalPeriods - 12) }, (_, i) => {
                    const index = i + 12;
                    return (
                      <div
                        key={index}
                        className="p-2 border-r last:border-r-0 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => handleCellClick(index)}
                      >
                        {editingCell === index ? (
                          <Input
                            value={tempValue}
                            onChange={(e) => setTempValue(e.target.value)}
                            onBlur={handleCellSave}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleCellSave();
                              if (e.key === 'Escape') handleCellCancel();
                            }}
                            className="h-6 text-xs p-1"
                            autoFocus
                          />
                        ) : (
                          <div className="text-xs">
                            {formatValue(curve.values[index] || 0)}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
        
        {totalPeriods > 24 && (
          <p className="text-xs text-muted-foreground text-center">
            Showing first 24 months. Remaining {totalPeriods - 24} months available for editing.
          </p>
        )}
      </div>

      {/* Visual Preview Bar */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold">Distribution Preview</h4>
        <div className="h-8 bg-muted rounded-lg overflow-hidden flex">
          {curve.values.slice(0, Math.min(totalPeriods, 60)).map((value, index) => {
            const maxValue = Math.max(...curve.values);
            const height = maxValue > 0 ? (value / maxValue) * 100 : 0;
            const opacity = value > 0 ? 0.7 + (value / maxValue) * 0.3 : 0.1;
            
            return (
              <div
                key={index}
                className="flex-1 bg-primary transition-all duration-200 hover:opacity-90 cursor-pointer"
                style={{ 
                  height: `${height}%`,
                  opacity,
                  minWidth: '2px'
                }}
                onClick={() => handleCellClick(index)}
                title={`${getMonthLabel(index)}: ${formatValue(value)}`}
              />
            );
          })}
        </div>
      </div>
    </Card>
  );
}