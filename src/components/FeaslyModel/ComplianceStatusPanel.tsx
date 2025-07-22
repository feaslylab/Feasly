import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Scale, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCompliance } from '@/hooks/useCompliance';
import { SAUDI_COMPLIANCE_DEFAULTS, formatComplianceAmount } from '@/lib/compliance/calculations';

interface ComplianceStatusPanelProps {
  projectId: string;
  className?: string;
}

export function ComplianceStatusPanel({ projectId, className }: ComplianceStatusPanelProps) {
  const { settings, isLoading } = useCompliance(projectId);

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

  const hasAnyCompliance = settings.escrow.enabled || settings.zakat.applicable;

  if (!hasAnyCompliance) {
    return (
      <Card className={cn('border-muted', className)}>
        <CardHeader>
          <CardTitle className="text-muted-foreground">Saudi Compliance</CardTitle>
          <CardDescription>No compliance features are currently enabled</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Escrow Status */}
      {settings.escrow.enabled && (
        <Card className="border-blue-200 bg-blue-50/30 dark:border-blue-800 dark:bg-blue-950/30">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <CardTitle className="text-blue-800 dark:text-blue-200 text-lg">🛡️ Escrow Management</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Escrow Rate:</span>
                <span className="ml-2 font-medium">{settings.escrow.percentage}%</span>
              </div>
              <div>
                <span className="text-muted-foreground">Release Trigger:</span>
                <span className="ml-2 font-medium capitalize">
                  {settings.escrow.triggerType.replace('_', ' ')}
                </span>
              </div>
              {settings.escrow.triggerDetails && (
                <div className="col-span-2">
                  <span className="text-muted-foreground">Details:</span>
                  <span className="ml-2 font-medium">{settings.escrow.triggerDetails}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Zakat Status */}
      {settings.zakat.applicable && (
        <Card className="border-green-200 bg-green-50/30 dark:border-green-800 dark:bg-green-950/30">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <Scale className="h-5 w-5 text-green-600 dark:text-green-400" />
              <CardTitle className="text-green-800 dark:text-green-200 text-lg">🧾 Zakat Calculation</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Zakat Rate:</span>
                <span className="ml-2 font-medium">{settings.zakat.rate}%</span>
              </div>
              <div>
                <span className="text-muted-foreground">Method:</span>
                <span className="ml-2 font-medium capitalize">
                  {settings.zakat.calculationMethod.replace('_', ' ')}
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-muted-foreground">Exclude Losses:</span>
                <span className="ml-2 font-medium">
                  {settings.zakat.excludeLosses ? '✓ Yes' : '✗ No'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Overall Compliance Summary */}
      <Card className="border-amber-200 bg-amber-50/30 dark:border-amber-800 dark:bg-amber-950/30">
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            <CardTitle className="text-amber-800 dark:text-amber-200 text-lg">📋 Compliance Status</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Escrow:</span>
              <span className={cn(
                "font-medium",
                settings.escrow.enabled ? "text-blue-600 dark:text-blue-400" : "text-muted-foreground"
              )}>
                {settings.escrow.enabled ? '✓ Active' : '✗ Disabled'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Zakat:</span>
              <span className={cn(
                "font-medium",
                settings.zakat.applicable ? "text-green-600 dark:text-green-400" : "text-muted-foreground"
              )}>
                {settings.zakat.applicable ? '✓ Applicable' : '✗ Not Applicable'}
              </span>
            </div>
          </div>
          
          <div className="mt-3 pt-3 border-t border-amber-200 dark:border-amber-800">
            <div className="text-xs text-amber-700 dark:text-amber-300">
              <span className="font-medium">Compliance Level:</span>
              <span className="ml-2">
                {settings.escrow.enabled && settings.zakat.applicable 
                  ? '🟢 Full Saudi Compliance' 
                  : settings.escrow.enabled || settings.zakat.applicable 
                  ? '🟡 Partial Compliance' 
                  : '🔴 No Compliance Features'
                }
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}