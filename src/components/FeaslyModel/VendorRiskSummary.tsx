import { useFormContext } from "react-hook-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, CheckCircle2, Clock, DollarSign, Users, TrendingUp } from "lucide-react";
import type { FeaslyModelFormData } from "./types";
import { useContractors } from "@/hooks/useContractors";

interface VendorRiskSummaryProps {
  projectId: string;
}

export function VendorRiskSummary({ projectId }: VendorRiskSummaryProps) {
  const form = useFormContext<FeaslyModelFormData>();
  const { contractors, getContractorStats } = useContractors(projectId);
  
  const stats = getContractorStats();
  const currencyCode = form.watch("currency_code") || "AED";

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' };
      case 'medium': return { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' };
      case 'high': return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' };
      default: return { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' };
    }
  };

  if (contractors.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-primary" />
            <CardTitle>Vendor Risk Summary</CardTitle>
          </div>
          <CardDescription>
            Overview of contractor costs and delivery risk exposure
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No contractors added yet</p>
            <p className="text-sm">Add contractors to track costs and delivery risk</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Users className="h-5 w-5 text-primary" />
          <CardTitle>Vendor Risk Summary</CardTitle>
        </div>
        <CardDescription>
          Overview of contractor costs and delivery risk exposure
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Total Vendors</p>
            </div>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Total Value</p>
            </div>
            <p className="text-2xl font-bold">{formatCurrency(stats.totalValue)}</p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">% Complete</p>
            </div>
            <div className="flex items-center space-x-2">
              <p className="text-2xl font-bold text-green-600">{stats.completionPercentage}%</p>
            </div>
            <Progress value={stats.completionPercentage} className="h-2" />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">% In Progress</p>
            </div>
            <div className="flex items-center space-x-2">
              <p className="text-2xl font-bold text-blue-600">{stats.progressPercentage}%</p>
            </div>
            <Progress value={stats.progressPercentage} className="h-2" />
          </div>
        </div>

        {/* Risk Exposure */}
        <div className="space-y-4">
          <h4 className="font-medium flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4" />
            <span>Risk Exposure</span>
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {['high', 'medium', 'low'].map((risk) => {
              const riskData = stats.byRisk[risk];
              const colors = getRiskColor(risk);
              
              return (
                <div 
                  key={risk} 
                  className={`p-4 rounded-lg border ${colors.bg} ${colors.border}`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className={`${colors.text} ${colors.border}`}>
                        {risk.charAt(0).toUpperCase() + risk.slice(1)} Risk
                      </Badge>
                      <span className={`text-sm font-medium ${colors.text}`}>
                        {riskData?.count || 0} vendors
                      </span>
                    </div>
                    
                    <div className="space-y-1">
                      <p className={`text-lg font-bold ${colors.text}`}>
                        {formatCurrency(riskData?.value || 0)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {stats.totalValue > 0 
                          ? `${(((riskData?.value || 0) / stats.totalValue) * 100).toFixed(1)}% of total value`
                          : '0% of total value'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="space-y-4">
          <h4 className="font-medium flex items-center space-x-2">
            <Clock className="h-4 w-4" />
            <span>Status Breakdown</span>
          </h4>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { key: 'planned', label: 'Planned', color: 'bg-gray-500' },
              { key: 'in_progress', label: 'In Progress', color: 'bg-blue-500' },
              { key: 'completed', label: 'Completed', color: 'bg-green-500' },
              { key: 'on_hold', label: 'On Hold', color: 'bg-yellow-500' },
              { key: 'cancelled', label: 'Cancelled', color: 'bg-red-500' },
            ].map((status) => (
              <div key={status.key} className="text-center space-y-2">
                <div className={`w-4 h-4 rounded-full ${status.color} mx-auto`}></div>
                <p className="text-xs text-muted-foreground">{status.label}</p>
                <p className="text-sm font-medium">{stats.byStatus[status.key] || 0}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Phase Distribution */}
        <div className="space-y-4">
          <h4 className="font-medium">Value by Phase</h4>
          
          <div className="space-y-2">
            {Object.entries(stats.byPhase)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 5)
              .map(([phase, value]) => {
                const percentage = stats.totalValue > 0 ? (value / stats.totalValue) * 100 : 0;
                return (
                  <div key={phase} className="flex items-center justify-between text-sm">
                    <span className="capitalize">{phase.replace('_', ' ')}</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{formatCurrency(value)}</span>
                      <span className="text-muted-foreground">({percentage.toFixed(1)}%)</span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}