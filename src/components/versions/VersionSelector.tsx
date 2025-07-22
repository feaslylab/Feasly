import React, { useState } from 'react';
import { format } from 'date-fns';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  useLatestVersion, 
  useVersionRestore,
  type ProjectVersion 
} from '@/hooks/useProjectVersions';
import { 
  History, 
  Clock, 
  User, 
  FileText, 
  RotateCcw, 
  Loader2, 
  TrendingUp, 
  TrendingDown, 
  Crown,
  Calendar,
  ArrowRight
} from 'lucide-react';

interface VersionSelectorProps {
  projectId: string;
  onVersionChange?: (version: ProjectVersion) => void;
  className?: string;
}

export function VersionSelector({ 
  projectId, 
  onVersionChange, 
  className 
}: VersionSelectorProps) {
  const { toast } = useToast();
  const [selectedVersionId, setSelectedVersionId] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const { data: versions = [], isLoading } = useProjectVersions(projectId);
  const { data: latestVersion } = useLatestVersion(projectId);
  const restoreVersionMutation = useVersionRestore();

  const handleVersionSelect = (versionId: string) => {
    setSelectedVersionId(versionId);
    const version = versions.find(v => v.id === versionId);
    if (version && onVersionChange) {
      onVersionChange(version);
    }
  };

  const handleRestoreVersion = async (version: ProjectVersion) => {
    const newVersionLabel = `v${Date.now()}`;
    
    try {
      await restoreVersionMutation.mutateAsync({
        projectId,
        versionId: version.id,
        newVersionLabel
      });
      
      toast({
        title: "Version restored successfully",
        description: `${version.version_label} has been restored as ${newVersionLabel}`,
      });
      
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error restoring version:', error);
      toast({
        title: "Restore failed",
        description: "Could not restore the selected version. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-3 w-3 text-green-600" />;
    if (change < 0) return <TrendingDown className="h-3 w-3 text-red-600" />;
    return null;
  };

  const formatCurrency = (amount: number) => {
    return `${(amount / 1000000).toFixed(1)}M AED`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 animate-pulse">
        <div className="h-4 w-4 bg-muted rounded" />
        <div className="h-8 w-32 bg-muted rounded" />
      </div>
    );
  }

  if (!versions.length) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <History className="h-4 w-4" />
        <span className="text-sm">No versions available</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <History className="h-4 w-4 text-muted-foreground" />
      
      <Select 
        value={selectedVersionId || latestVersion?.id || ''} 
        onValueChange={handleVersionSelect}
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Select version" />
        </SelectTrigger>
        <SelectContent>
          {versions.map((version) => (
            <SelectItem key={version.id} value={version.id}>
              <div className="flex items-center gap-2">
                <span>{version.version_label}</span>
                {version.is_latest && (
                  <Crown className="h-3 w-3 text-yellow-500" />
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Clock className="h-4 w-4 mr-1" />
            History
          </Button>
        </DialogTrigger>
        
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Version History
            </DialogTitle>
            <DialogDescription>
              View and manage different versions of your project model.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 max-h-96 overflow-y-auto">
            {versions.map((version, index) => (
              <div key={version.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{version.version_label}</h4>
                        {version.is_latest && (
                          <Badge variant="default" className="text-xs">
                            <Crown className="h-3 w-3 mr-1" />
                            Latest
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(version.created_at), 'MMM dd, yyyy HH:mm')}
                      </div>
                    </div>
                  </div>
                  
                  {!version.is_latest && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRestoreVersion(version)}
                      disabled={restoreVersionMutation.isPending}
                    >
                      {restoreVersionMutation.isPending ? (
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      ) : (
                        <RotateCcw className="h-4 w-4 mr-1" />
                      )}
                      Restore
                    </Button>
                  )}
                </div>

                {version.version_notes && (
                  <div className="flex items-start gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <p className="text-sm text-muted-foreground">{version.version_notes}</p>
                  </div>
                )}

                {/* Scenario Types */}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Scenarios:</span>
                  <div className="flex gap-1">
                    {version.scenario_types.map((scenario) => (
                      <Badge key={scenario} variant="secondary" className="text-xs">
                        {scenario}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* KPI Summary */}
                {version.kpi_snapshot && (
                  <div className="bg-muted/50 rounded-lg p-3">
                    <h5 className="text-sm font-medium mb-2">KPI Snapshot</h5>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex justify-between">
                        <span>IRR:</span>
                        <span className="font-medium">{version.kpi_snapshot.irr.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>ROI:</span>
                        <span className="font-medium">{version.kpi_snapshot.roi.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Profit:</span>
                        <span className="font-medium">{formatCurrency(version.kpi_snapshot.totalProfit)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Revenue:</span>
                        <span className="font-medium">{formatCurrency(version.kpi_snapshot.totalRevenue)}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Version Comparison */}
                {index > 0 && versions[index - 1].kpi_snapshot && version.kpi_snapshot && (
                  <div className="pt-2 border-t">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <ArrowRight className="h-3 w-3" />
                      <span>vs {versions[index - 1].version_label}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {Object.entries({
                        IRR: version.kpi_snapshot.irr - (versions[index - 1].kpi_snapshot?.irr || 0),
                        Profit: version.kpi_snapshot.totalProfit - (versions[index - 1].kpi_snapshot?.totalProfit || 0)
                      }).map(([key, change]) => (
                        <div key={key} className="flex items-center justify-between">
                          <span>{key}:</span>
                          <div className="flex items-center gap-1">
                            {getChangeIcon(change)}
                            <span className={change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-muted-foreground'}>
                              {key === 'IRR' ? `${change.toFixed(1)}%` : formatCurrency(Math.abs(change))}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}