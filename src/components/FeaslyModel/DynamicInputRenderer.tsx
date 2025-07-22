import React from 'react';
import { useFormContext } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FinancialInputConfig, formatCurrency, formatUnit } from '@/config/financialInputs';
import { useScenarioOverrides } from '@/hooks/useScenarioOverrides';
import type { FeaslyModelFormData } from './types';

interface DynamicInputRendererProps {
  config: FinancialInputConfig;
  projectId?: string;
  scenario?: string;
  currencyCode?: string;
  className?: string;
}

export const DynamicInputRenderer: React.FC<DynamicInputRendererProps> = ({
  config,
  projectId,
  scenario = 'base',
  currencyCode = 'AED',
  className
}) => {
  const form = useFormContext<FeaslyModelFormData>();
  const { isFieldOverridden, getOverrideValue } = useScenarioOverrides(projectId || '', scenario);

  // Check if field should be shown based on dependencies
  const shouldShow = () => {
    if (!config.dependsOn) return true;
    const dependentValue = form.watch(config.dependsOn as keyof FeaslyModelFormData);
    return Boolean(dependentValue);
  };

  // Get the appropriate placeholder based on type
  const getPlaceholder = () => {
    if (config.placeholder) return config.placeholder;
    switch (config.type) {
      case 'currency':
        return '0.00';
      case 'percentage':
        return '0.0';
      case 'number':
        return '0';
      default:
        return '';
    }
  };

  // Format display unit
  const getDisplayUnit = () => {
    if (config.unit) {
      if (config.unit === 'sqm' && form.watch('unit_system') === 'sqft') {
        return 'sqft';
      }
      return config.unit;
    }
    return '';
  };

  const isOverridden = projectId ? isFieldOverridden(config.id) : false;

  if (!shouldShow()) return null;

  return (
    <FormField
      control={form.control}
      name={config.id as keyof FeaslyModelFormData}
      render={({ field }) => (
        <FormItem className={cn('space-y-2', className)}>
          <div className="flex items-center space-x-2">
            <FormLabel className={cn(
              'text-sm font-medium',
              isOverridden && 'text-orange-600 dark:text-orange-400'
            )}>
              {config.label}
              {getDisplayUnit() && (
                <span className="text-muted-foreground text-xs ml-1">
                  ({getDisplayUnit()})
                </span>
              )}
            </FormLabel>
            
            {config.tooltip && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs">
                    <p>{config.tooltip}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            
            {isOverridden && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <RotateCcw className="h-4 w-4 text-orange-500 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>This value is overridden in the {scenario} scenario</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>

          <FormControl>
            {config.type === 'switch' ? (
              <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <div className="text-sm text-muted-foreground">
                    {config.tooltip}
                  </div>
                </div>
                <Switch
                  checked={field.value || config.defaultValue}
                  onCheckedChange={field.onChange}
                />
              </div>
            ) : config.type === 'select' ? (
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value || config.defaultValue}
              >
                <SelectTrigger className={cn(isOverridden && 'border-orange-400')}>
                  <SelectValue placeholder={`Select ${config.label.toLowerCase()}`} />
                </SelectTrigger>
                <SelectContent>
                  {config.options?.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="relative">
                <Input
                  type={config.type === 'currency' || config.type === 'percentage' || config.type === 'number' ? 'number' : 'text'}
                  min={config.min}
                  max={config.max}
                  step={config.step}
                  placeholder={getPlaceholder()}
                  className={cn(
                    isOverridden && 'border-orange-400',
                    (config.type === 'currency' || config.type === 'percentage') && 'pr-12'
                  )}
                  {...field}
                  value={projectId ? getOverrideValue(config.id, field.value) : field.value}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (config.type === 'number' || config.type === 'currency' || config.type === 'percentage') {
                      field.onChange(value === '' ? undefined : Number(value));
                    } else {
                      field.onChange(value);
                    }
                  }}
                />
                
                {/* Unit display for currency and percentage */}
                {config.type === 'currency' && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
                    {currencyCode}
                  </div>
                )}
                
                {config.type === 'percentage' && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
                    %
                  </div>
                )}
              </div>
            )}
          </FormControl>
          
          <FormMessage />
          
          {/* Show formatted value for better readability */}
          {field.value && (config.type === 'currency' || config.type === 'number') && typeof field.value === 'number' && field.value > 0 && (
            <div className="text-xs text-muted-foreground">
              {config.type === 'currency' 
                ? formatCurrency(field.value, currencyCode)
                : config.unit 
                ? formatUnit(field.value, getDisplayUnit())
                : field.value.toLocaleString()
              }
            </div>
          )}
        </FormItem>
      )}
    />
  );
};