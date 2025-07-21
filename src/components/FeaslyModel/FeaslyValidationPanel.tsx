import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, DollarSign, Calculator, TrendingDown } from 'lucide-react';
import { useFormContext } from 'react-hook-form';
import { useValidationMessages } from '@/hooks/useTranslationKeys';
import type { FeaslyModelFormData } from './types';

interface ValidationWarning {
  id: string;
  type: 'warning' | 'error';
  icon: React.ReactNode;
  title: string;
  description: string;
}

export function FeaslyValidationPanel() {
  const { watch } = useFormContext<FeaslyModelFormData>();
  const validation = useValidationMessages();
  const formData = watch();

  const warnings: ValidationWarning[] = [];

  // Check for missing construction cost
  if (!formData.construction_cost || formData.construction_cost <= 0) {
    warnings.push({
      id: 'missing-construction-cost',
      type: 'warning',
      icon: <DollarSign className="h-4 w-4" />,
      title: 'Missing Construction Cost',
      description: validation.getConstructionCostWarning(),
    });
  }

  // Check for missing GFA
  if (!formData.total_gfa_sqm || formData.total_gfa_sqm <= 0) {
    warnings.push({
      id: 'missing-gfa',
      type: 'warning',
      icon: <Calculator className="h-4 w-4" />,
      title: 'Missing Total GFA',
      description: validation.getGFAWarning(),
    });
  }

  // Check if revenue is less than total cost
  const totalGfa = formData.total_gfa_sqm || 0;
  const avgSalePrice = formData.average_sale_price || 0;
  const totalRevenue = totalGfa * avgSalePrice;
  const totalCost = (formData.construction_cost || 0) + (formData.land_cost || 0) + (formData.soft_costs || 0);

  if (totalRevenue > 0 && totalCost > 0 && totalRevenue < totalCost) {
    warnings.push({
      id: 'revenue-less-than-cost',
      type: 'error',
      icon: <TrendingDown className="h-4 w-4" />,
      title: 'Revenue Below Total Cost',
      description: validation.getRevenueWarning(),
    });
  }

  // Check for funding gap
  const totalFunding = (formData.loan_amount || 0) + (formData.equity_contribution || 0);
  if (totalCost > 0 && totalFunding > 0 && totalFunding < totalCost) {
    const fundingGap = totalCost - totalFunding;
    warnings.push({
      id: 'funding-gap',
      type: 'warning',
      icon: <AlertTriangle className="h-4 w-4" />,
      title: 'Funding Gap Detected',
      description: `${validation.getFundingGapWarning()}: ${new Intl.NumberFormat('en-AE', { 
        style: 'currency', 
        currency: formData.currency_code || 'AED',
        notation: 'compact',
      }).format(fundingGap)}`,
    });
  }

  // Don't render anything if no warnings
  if (warnings.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {warnings.map((warning) => (
        <Alert 
          key={warning.id} 
          variant={warning.type === 'error' ? 'destructive' : 'default'}
          className={warning.type === 'warning' ? 'border-yellow-200 bg-yellow-50 text-yellow-800' : ''}
        >
          <div className="flex items-center space-x-2">
            {warning.icon}
            <div className="flex-1">
              <div className="font-medium">{warning.title}</div>
              <AlertDescription className="mt-1">
                {warning.description}
              </AlertDescription>
            </div>
          </div>
        </Alert>
      ))}
    </div>
  );
}