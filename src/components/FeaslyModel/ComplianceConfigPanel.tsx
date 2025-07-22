import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Shield, Scale, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCompliance } from '@/hooks/useCompliance';
import { SAUDI_COMPLIANCE_DEFAULTS } from '@/lib/compliance/calculations';
import type { FeaslyModelFormData } from './types';

interface ComplianceConfigPanelProps {
  projectId: string;
  className?: string;
}

export function ComplianceConfigPanel({ projectId, className }: ComplianceConfigPanelProps) {
  const form = useFormContext<FeaslyModelFormData>();
  const { settings, updateComplianceSettings, isLoading } = useCompliance(projectId);

  // Watch form values for reactive updates
  const escrowEnabled = form.watch('escrow_required');
  const zakatApplicable = form.watch('zakat_applicable');
  const currencyCode = form.watch('currency_code') || 'SAR';

  const triggerTypeOptions = [
    { value: 'construction_percent', label: 'Construction % Complete' },
    { value: 'month_based', label: 'Time-based (Month X)' },
    { value: 'milestone_based', label: 'Milestone Achievement' }
  ];

  const zakatMethodOptions = [
    { value: 'net_profit', label: 'Net Profit (Standard)' },
    { value: 'gross_revenue', label: 'Gross Revenue' },
    { value: 'asset_value', label: 'Asset Value' }
  ];

  const handleEscrowSettingsChange = async (field: string, value: any) => {
    const newEscrowSettings = {
      ...settings.escrow,
      [field]: value
    };
    
    await updateComplianceSettings({
      escrow: newEscrowSettings
    });
  };

  const handleZakatSettingsChange = async (field: string, value: any) => {
    const newZakatSettings = {
      ...settings.zakat,
      [field]: value
    };
    
    await updateComplianceSettings({
      zakat: newZakatSettings
    });
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Escrow Module */}
      <Card className="border-blue-200 bg-blue-50/30 dark:border-blue-800 dark:bg-blue-950/30">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <div>
              <CardTitle className="text-blue-800 dark:text-blue-200">🛡️ Escrow Management</CardTitle>
              <CardDescription>Configure escrow reserves and release triggers (Saudi compliance)</CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Escrow Enable Toggle */}
          <FormField
            control={form.control}
            name="escrow_required"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base font-medium">Enable Escrow Management</FormLabel>
                  <div className="text-sm text-muted-foreground">
                    Hold funds in escrow until project milestones are met
                  </div>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value || settings.escrow.enabled}
                    onCheckedChange={(checked) => {
                      field.onChange(checked);
                      handleEscrowSettingsChange('enabled', checked);
                    }}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {/* Escrow Settings - Show only when enabled */}
          {(escrowEnabled || settings.escrow.enabled) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 p-4 bg-blue-50/50 dark:bg-blue-950/50 rounded-lg border border-blue-200 dark:border-blue-800">
              {/* Escrow Percentage */}
              <FormField
                control={form.control}
                name="escrow_percent"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center space-x-2">
                      <FormLabel>Escrow Percentage</FormLabel>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Percentage of revenue held in escrow (Saudi default: 20%)</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          placeholder={SAUDI_COMPLIANCE_DEFAULTS.ESCROW_PERCENTAGE.toString()}
                          {...field}
                          value={field.value || settings.escrow.percentage}
                          onChange={(e) => {
                            const value = Number(e.target.value);
                            field.onChange(value);
                            handleEscrowSettingsChange('percentage', value);
                          }}
                          className="pr-8"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                          %
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Release Trigger Type */}
              <FormField
                control={form.control}
                name="release_trigger_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Release Trigger</FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        field.onChange(value);
                        handleEscrowSettingsChange('triggerType', value);
                      }}
                      value={field.value || settings.escrow.triggerType}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select release trigger" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {triggerTypeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Release Threshold */}
              <FormField
                control={form.control}
                name="release_threshold"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Release Threshold</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          step="1"
                          placeholder="75"
                          {...field}
                          value={field.value || settings.escrow.releaseThreshold}
                          onChange={(e) => {
                            const value = Number(e.target.value);
                            field.onChange(value);
                            handleEscrowSettingsChange('releaseThreshold', value);
                          }}
                          className="pr-8"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                          {form.watch('release_trigger_type') === 'construction_percent' ? '%' : 
                           form.watch('release_trigger_type') === 'month_based' ? 'M' : ''}
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Release Rule Details */}
              <FormField
                control={form.control}
                name="release_rule_details"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Release Details</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., Foundation completion certificate required"
                        {...field}
                        value={field.value || settings.escrow.triggerDetails}
                        onChange={(e) => {
                          field.onChange(e.target.value);
                          handleEscrowSettingsChange('triggerDetails', e.target.value);
                        }}
                        rows={2}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Zakat Module */}
      <Card className="border-green-200 bg-green-50/30 dark:border-green-800 dark:bg-green-950/30">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <Scale className="h-6 w-6 text-green-600 dark:text-green-400" />
            <div>
              <CardTitle className="text-green-800 dark:text-green-200">🧾 Zakat Calculation</CardTitle>
              <CardDescription>Islamic tax calculation (2.5% on qualifying profits)</CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Zakat Applicable Toggle */}
          <FormField
            control={form.control}
            name="zakat_applicable"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base font-medium">Zakat Applicable</FormLabel>
                  <div className="text-sm text-muted-foreground">
                    Apply Islamic Zakat tax calculations to this project
                  </div>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value || settings.zakat.applicable}
                    onCheckedChange={(checked) => {
                      field.onChange(checked);
                      handleZakatSettingsChange('applicable', checked);
                    }}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {/* Zakat Settings - Show only when applicable */}
          {(zakatApplicable || settings.zakat.applicable) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 p-4 bg-green-50/50 dark:bg-green-950/50 rounded-lg border border-green-200 dark:border-green-800">
              {/* Zakat Rate */}
              <FormField
                control={form.control}
                name="zakat_rate_percent"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center space-x-2">
                      <FormLabel>Zakat Rate</FormLabel>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Standard Islamic Zakat rate is 2.5%</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          placeholder={SAUDI_COMPLIANCE_DEFAULTS.ZAKAT_RATE.toString()}
                          {...field}
                          value={field.value || settings.zakat.rate}
                          onChange={(e) => {
                            const value = Number(e.target.value);
                            field.onChange(value);
                            handleZakatSettingsChange('rate', value);
                          }}
                          className="pr-8"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                          %
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Zakat Calculation Method */}
              <FormField
                control={form.control}
                name="zakat_calculation_method"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Calculation Method</FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        field.onChange(value);
                        handleZakatSettingsChange('calculationMethod', value);
                      }}
                      value={field.value || settings.zakat.calculationMethod}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select calculation method" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {zakatMethodOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Exclude Losses Toggle */}
              <FormField
                control={form.control}
                name="zakat_exclude_losses"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 md:col-span-2">
                    <div className="space-y-0.5">
                      <FormLabel className="text-sm font-medium">Exclude Loss Projects</FormLabel>
                      <div className="text-xs text-muted-foreground">
                        Do not apply Zakat to projects with negative profits
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value !== false && settings.zakat.excludeLosses}
                        onCheckedChange={(checked) => {
                          field.onChange(checked);
                          handleZakatSettingsChange('excludeLosses', checked);
                        }}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Compliance Status Summary */}
      {(escrowEnabled || zakatApplicable || settings.escrow.enabled || settings.zakat.applicable) && (
        <Card className="border-amber-200 bg-amber-50/30 dark:border-amber-800 dark:bg-amber-950/30">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              <CardTitle className="text-amber-800 dark:text-amber-200">Compliance Summary</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Escrow Management:</span>
                <span className={cn(
                  "font-medium",
                  (escrowEnabled || settings.escrow.enabled) ? "text-blue-600 dark:text-blue-400" : "text-muted-foreground"
                )}>
                  {(escrowEnabled || settings.escrow.enabled) ? '✓ Enabled' : '✗ Disabled'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Zakat Applicable:</span>
                <span className={cn(
                  "font-medium",
                  (zakatApplicable || settings.zakat.applicable) ? "text-green-600 dark:text-green-400" : "text-muted-foreground"
                )}>
                  {(zakatApplicable || settings.zakat.applicable) ? '✓ Yes' : '✗ No'}
                </span>
              </div>
              {(escrowEnabled || settings.escrow.enabled) && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Escrow Rate:</span>
                  <span className="font-medium">{settings.escrow.percentage}%</span>
                </div>
              )}
              {(zakatApplicable || settings.zakat.applicable) && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Zakat Rate:</span>
                  <span className="font-medium">{settings.zakat.rate}%</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}