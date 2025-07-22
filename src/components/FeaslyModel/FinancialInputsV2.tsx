import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { INPUT_GROUPS, getInputsByGroup, type InputGroup } from '@/config/financialInputs';
import { DynamicInputRenderer } from './DynamicInputRenderer';
import type { FeaslyModelFormData } from './types';

interface FinancialInputsV2Props {
  projectId?: string;
  scenario?: string;
  className?: string;
}

export function FinancialInputsV2({ projectId, scenario = 'base', className }: FinancialInputsV2Props) {
  const form = useFormContext<FeaslyModelFormData>();
  const currencyCode = form.watch('currency_code') || 'AED';
  const useSegmentedRevenue = form.watch('use_segmented_revenue');
  const enableEscalation = form.watch('enable_escalation');

  // Define which groups should be shown and their default collapsed state
  const groupsConfig: Record<InputGroup, { show: boolean; defaultOpen: boolean }> = {
    land_acquisition: { show: true, defaultOpen: true },
    construction: { show: true, defaultOpen: true },
    soft_costs: { show: true, defaultOpen: true },
    revenue_segments: { show: true, defaultOpen: useSegmentedRevenue },
    escrow_contingency: { show: true, defaultOpen: true },
    debt_financing: { show: true, defaultOpen: false },
    zakat_tax: { show: true, defaultOpen: false },
    escalation: { show: enableEscalation, defaultOpen: enableEscalation }
  };

  const renderInputGroup = (groupKey: InputGroup) => {
    const groupConfig = groupsConfig[groupKey];
    if (!groupConfig.show) return null;

    const group = INPUT_GROUPS[groupKey];
    const inputs = getInputsByGroup(groupKey);
    
    if (inputs.length === 0) return null;

    return (
      <Collapsible key={groupKey} defaultOpen={groupConfig.defaultOpen}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{group.icon}</span>
                  <div>
                    <CardTitle className="text-lg">{group.title}</CardTitle>
                    <CardDescription>{group.description}</CardDescription>
                  </div>
                </div>
                <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {inputs.map((inputConfig) => (
                  <DynamicInputRenderer
                    key={inputConfig.id}
                    config={inputConfig}
                    projectId={projectId}
                    scenario={scenario}
                    currencyCode={currencyCode}
                  />
                ))}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    );
  };

  // Calculate summary for non-segmented revenue
  const calculateSummary = () => {
    if (useSegmentedRevenue) {
      const residentialRevenue = (form.watch('gfa_residential') || 0) * (form.watch('sale_price_residential') || 0);
      const retailRevenue = (form.watch('gfa_retail') || 0) * (form.watch('sale_price_retail') || 0);
      const officeRevenue = (form.watch('gfa_office') || 0) * (form.watch('sale_price_office') || 0);
      const totalSegmentedRevenue = residentialRevenue + retailRevenue + officeRevenue;
      const totalSegmentedGFA = (form.watch('gfa_residential') || 0) + (form.watch('gfa_retail') || 0) + (form.watch('gfa_office') || 0);
      
      return { totalRevenue: totalSegmentedRevenue, totalGFA: totalSegmentedGFA };
    } else {
      const totalRevenue = (form.watch('total_gfa_sqm') || 0) * (form.watch('average_sale_price') || 0);
      return { totalRevenue, totalGFA: form.watch('total_gfa_sqm') || 0 };
    }
  };

  const summary = calculateSummary();

  return (
    <div className={cn('space-y-6', className)}>
      {/* System Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>⚙️</span>
            <span>System Settings</span>
          </CardTitle>
          <CardDescription>Configure units and advanced features</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <DynamicInputRenderer 
              config={getInputsByGroup('revenue_segments').find(i => i.id === 'use_segmented_revenue')!}
            />
            <DynamicInputRenderer 
              config={getInputsByGroup('escalation').find(i => i.id === 'enable_escalation')!}
            />
          </div>
        </CardContent>
      </Card>

      {/* Dynamic Financial Input Groups */}
      {(Object.keys(groupsConfig) as InputGroup[]).map(renderInputGroup)}

      {/* Revenue Summary */}
      {summary.totalRevenue > 0 && (
        <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30">
          <CardHeader>
            <CardTitle className="text-green-800 dark:text-green-200">💰 Revenue Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Total GFA:</span>
                <span className="ml-2 font-medium">{summary.totalGFA.toLocaleString()} sqm</span>
              </div>
              <div>
                <span className="text-muted-foreground">Est. Revenue:</span>
                <span className="ml-2 font-bold text-lg text-green-700 dark:text-green-300">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: currencyCode,
                    minimumFractionDigits: 0,
                  }).format(summary.totalRevenue)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}