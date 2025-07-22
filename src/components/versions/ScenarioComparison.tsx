import React, { useState } from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  useProjectVersions, 
  useVersionComparison,
  type ProjectVersion,
  type VersionComparison 
} from '@/hooks/useProjectVersions';
import { 
  GitCompare, 
  TrendingUp, 
  TrendingDown, 
  ArrowRight, 
  Loader2,
  BarChart3,
  DollarSign,
  Percent,
  Calendar,
  Crown,
  Minus
} from 'lucide-react';

interface ScenarioComparisonProps {
  projectId: string;
  className?: string;
}

export function ScenarioComparison({ projectId, className }: ScenarioComparisonProps) {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [baseVersionId, setBaseVersionId] = useState<string>('');
  const [compareVersionId, setCompareVersionId] = useState<string>('');
  const [comparisonResult, setComparisonResult] = useState<VersionComparison | null>(null);

  const { data: versions = [], isLoading } = useProjectVersions(projectId);
  const comparisonMutation = useVersionComparison();

  const handleCompare = async () => {
    if (!baseVersionId || !compareVersionId) {
      toast({
        title: "Selection required",
        description: "Please select both base and compare versions.",
        variant: "destructive",
      });
      return;
    }

    if (baseVersionId === compareVersionId) {
      toast({
        title: "Invalid selection",
        description: "Please select different versions to compare.",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await comparisonMutation.mutateAsync({
        baseVersionId,
        compareVersionId
      });
      setComparisonResult(result);
    } catch (error) {
      console.error('Comparison error:', error);
      toast({
        title: "Comparison failed",
        description: "Could not compare the selected versions. Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return `${(amount / 1000000).toFixed(1)}M AED`;
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getChangeIndicator = (change: number, changePercent: number) => {
    if (Math.abs(change) < 0.01) {
      return {
        icon: <Minus className="h-4 w-4 text-gray-500" />,
        color: 'text-gray-500',
        bgColor: 'bg-gray-50'
      };
    }
    
    if (change > 0) {
      return {
        icon: <TrendingUp className="h-4 w-4 text-green-600" />,
        color: 'text-green-600',
        bgColor: 'bg-green-50'
      };
    }
    
    return {
      icon: <TrendingDown className="h-4 w-4 text-red-600" />,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    };
  };

  const MetricRow = ({ 
    label, 
    baseValue, 
    compareValue, 
    change, 
    changePercent,
    formatter 
  }: {
    label: string;
    baseValue: number;
    compareValue: number;
    change: number;
    changePercent: number;
    formatter: (val: number) => string;
  }) => {
    const indicator = getChangeIndicator(change, changePercent);
    
    return (
      <div className="grid grid-cols-5 gap-4 items-center py-3 border-b last:border-b-0">
        <div className="font-medium">{label}</div>
        <div className="text-center">{formatter(baseValue)}</div>
        <div className="text-center">{formatter(compareValue)}</div>
        <div className={`flex items-center justify-center gap-1 ${indicator.color}`}>
          {indicator.icon}
          <span className="font-medium">{formatter(Math.abs(change))}</span>
        </div>
        <div className={`text-center font-medium ${indicator.color}`}>
          {changePercent > 0 ? '+' : ''}{changePercent.toFixed(1)}%
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 animate-pulse">
        <div className="h-4 w-4 bg-muted rounded" />
        <div className="h-8 w-32 bg-muted rounded" />
      </div>
    );
  }

  return (
    <div className={className}>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full sm:w-auto">
            <GitCompare className="h-4 w-4 mr-2" />
            Compare Versions
          </Button>
        </DialogTrigger>
        
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GitCompare className="h-5 w-5" />
              Version Comparison
            </DialogTitle>
            <DialogDescription>
              Compare KPIs and performance metrics between different project versions.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Version Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Base Version</label>
                <Select value={baseVersionId} onValueChange={setBaseVersionId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select base version" />
                  </SelectTrigger>
                  <SelectContent>
                    {versions.map((version) => (
                      <SelectItem key={version.id} value={version.id}>
                        <div className="flex items-center gap-2">
                          <span>{version.version_label}</span>
                          {version.is_latest && <Crown className="h-3 w-3 text-yellow-500" />}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Compare Version</label>
                <Select value={compareVersionId} onValueChange={setCompareVersionId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select compare version" />
                  </SelectTrigger>
                  <SelectContent>
                    {versions.map((version) => (
                      <SelectItem key={version.id} value={version.id}>
                        <div className="flex items-center gap-2">
                          <span>{version.version_label}</span>
                          {version.is_latest && <Crown className="h-3 w-3 text-yellow-500" />}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button 
              onClick={handleCompare}
              disabled={!baseVersionId || !compareVersionId || comparisonMutation.isPending}
              className="w-full"
            >
              {comparisonMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <BarChart3 className="h-4 w-4 mr-2" />
              )}
              {comparisonMutation.isPending ? 'Comparing...' : 'Compare Versions'}
            </Button>

            {/* Comparison Results */}
            {comparisonResult && (
              <div className="space-y-4 animate-fade-in">
                <Separator />
                
                {/* Version Headers */}
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {comparisonResult.baseVersion.version_label}
                        {comparisonResult.baseVersion.is_latest && (
                          <Crown className="h-4 w-4 text-yellow-500" />
                        )}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(comparisonResult.baseVersion.created_at), 'MMM dd, yyyy')}
                      </CardDescription>
                    </CardHeader>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {comparisonResult.compareVersion.version_label}
                        {comparisonResult.compareVersion.is_latest && (
                          <Crown className="h-4 w-4 text-yellow-500" />
                        )}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(comparisonResult.compareVersion.created_at), 'MMM dd, yyyy')}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </div>

                {/* Metrics Comparison Table */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">KPI Comparison</CardTitle>
                    <CardDescription>
                      Financial performance comparison between selected versions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1">
                      {/* Table Header */}
                      <div className="grid grid-cols-5 gap-4 items-center py-3 border-b font-medium text-sm text-muted-foreground">
                        <div>Metric</div>
                        <div className="text-center">Base</div>
                        <div className="text-center">Compare</div>
                        <div className="text-center">Change</div>
                        <div className="text-center">% Change</div>
                      </div>

                      {/* Metrics */}
                      <MetricRow
                        label="IRR"
                        baseValue={comparisonResult.differences.irr.base}
                        compareValue={comparisonResult.differences.irr.compare}
                        change={comparisonResult.differences.irr.change}
                        changePercent={comparisonResult.differences.irr.changePercent}
                        formatter={formatPercentage}
                      />

                      <MetricRow
                        label="ROI"
                        baseValue={comparisonResult.differences.roi.base}
                        compareValue={comparisonResult.differences.roi.compare}
                        change={comparisonResult.differences.roi.change}
                        changePercent={comparisonResult.differences.roi.changePercent}
                        formatter={formatPercentage}
                      />

                      <MetricRow
                        label="Net Profit"
                        baseValue={comparisonResult.differences.totalProfit.base}
                        compareValue={comparisonResult.differences.totalProfit.compare}
                        change={comparisonResult.differences.totalProfit.change}
                        changePercent={comparisonResult.differences.totalProfit.changePercent}
                        formatter={formatCurrency}
                      />

                      <MetricRow
                        label="Total Revenue"
                        baseValue={comparisonResult.differences.totalRevenue.base}
                        compareValue={comparisonResult.differences.totalRevenue.compare}
                        change={comparisonResult.differences.totalRevenue.change}
                        changePercent={comparisonResult.differences.totalRevenue.changePercent}
                        formatter={formatCurrency}
                      />

                      <MetricRow
                        label="Total Cost"
                        baseValue={comparisonResult.differences.totalCost.base}
                        compareValue={comparisonResult.differences.totalCost.compare}
                        change={comparisonResult.differences.totalCost.change}
                        changePercent={comparisonResult.differences.totalCost.changePercent}
                        formatter={formatCurrency}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Summary Insights */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Summary Insights</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      {comparisonResult.differences.irr.change > 0 ? (
                        <p className="text-green-600">
                          📈 IRR improved by {comparisonResult.differences.irr.changePercent.toFixed(1)}% 
                          ({comparisonResult.differences.irr.change.toFixed(1)} percentage points)
                        </p>
                      ) : comparisonResult.differences.irr.change < 0 ? (
                        <p className="text-red-600">
                          📉 IRR decreased by {Math.abs(comparisonResult.differences.irr.changePercent).toFixed(1)}% 
                          ({Math.abs(comparisonResult.differences.irr.change).toFixed(1)} percentage points)
                        </p>
                      ) : (
                        <p className="text-gray-600">➡️ IRR remained unchanged</p>
                      )}

                      {comparisonResult.differences.totalProfit.change > 0 ? (
                        <p className="text-green-600">
                          💰 Net profit increased by {formatCurrency(comparisonResult.differences.totalProfit.change)}
                        </p>
                      ) : comparisonResult.differences.totalProfit.change < 0 ? (
                        <p className="text-red-600">
                          💸 Net profit decreased by {formatCurrency(Math.abs(comparisonResult.differences.totalProfit.change))}
                        </p>
                      ) : (
                        <p className="text-gray-600">➡️ Net profit remained unchanged</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}