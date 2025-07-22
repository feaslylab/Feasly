import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { useExportData } from '@/hooks/useExportData';
import { FeaslyPDFExporter, type ExportOptions } from '@/lib/pdfExporter';
import { 
  Download, 
  FileText, 
  Settings, 
  Loader2, 
  CheckCircle,
  Image,
  Palette,
  Globe
} from 'lucide-react';

interface ExportPDFProps {
  projectId: string;
  projectName: string;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
}

export function ExportPDF({ 
  projectId, 
  projectName, 
  className, 
  variant = 'default',
  size = 'default'
}: ExportPDFProps) {
  const { toast } = useToast();
  const { t, i18n } = useTranslation();
  const { data: exportData, isLoading: isLoadingData, error } = useExportData(projectId);
  
  const [isExporting, setIsExporting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    includeCharts: true,
    includeLogo: true,
    clientLogo: '',
    watermark: ''
  });

  const handleQuickExport = async () => {
    if (!exportData) {
      toast({
        title: "Export Error",
        description: "Project data is not available for export.",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);
    
    try {
      const exporter = new FeaslyPDFExporter(exportData, exportOptions);
      await exporter.downloadPDF();
      
      toast({
        title: "Export generated successfully",
        description: `${projectName} has been exported as PDF.`,
        action: (
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium">Ready for download</span>
          </div>
        ),
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export failed",
        description: "There was an error generating the PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleCustomExport = async () => {
    if (!exportData) return;
    
    setIsExporting(true);
    
    try {
      const exporter = new FeaslyPDFExporter(exportData, exportOptions);
      await exporter.downloadPDF();
      
      setIsDialogOpen(false);
      toast({
        title: "Custom export generated successfully",
        description: `${projectName} has been exported with your preferences.`,
        action: (
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium">Ready for download</span>
          </div>
        ),
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export failed",
        description: "There was an error generating the PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  if (error) {
    return (
      <Button variant="outline" disabled className={className}>
        <FileText className="h-4 w-4 mr-2" />
        Export Unavailable
      </Button>
    );
  }

  const ExportButton = ({ onClick, children, ...props }: any) => (
    <Button
      onClick={onClick}
      disabled={isExporting || isLoadingData}
      variant={variant}
      size={size}
      className={className}
      {...props}
    >
      {isExporting ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <Download className="h-4 w-4 mr-2" />
      )}
      {children}
    </Button>
  );

  return (
    <div className="flex items-center gap-2">
      {/* Quick Export Button */}
      <ExportButton onClick={handleQuickExport}>
        {isExporting ? 'Exporting...' : 'Export as PDF'}
      </ExportButton>

      {/* Custom Export Options */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" disabled={isExporting || isLoadingData}>
              <Settings className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={handleQuickExport}>
              <Download className="h-4 w-4 mr-2" />
              Quick Export
            </DropdownMenuItem>
            <DialogTrigger asChild>
              <DropdownMenuItem>
                <Settings className="h-4 w-4 mr-2" />
                Custom Export
              </DropdownMenuItem>
            </DialogTrigger>
          </DropdownMenuContent>
        </DropdownMenu>

        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Custom PDF Export
            </DialogTitle>
            <DialogDescription>
              Configure your export settings for a personalized report.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Project Info */}
            <div>
              <h4 className="text-sm font-medium mb-2">Project Information</h4>
              <div className="p-3 bg-muted rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{projectName}</span>
                  <Badge variant="outline">
                    {exportData?.project.status.toUpperCase()}
                  </Badge>
                </div>
                {exportData?.project.project_ai_summary && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {exportData.project.project_ai_summary.substring(0, 100)}...
                  </p>
                )}
              </div>
            </div>

            {/* Export Options */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Export Options
              </h4>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-charts"
                    checked={exportOptions.includeCharts}
                    onCheckedChange={(checked) =>
                      setExportOptions(prev => ({ ...prev, includeCharts: checked as boolean }))
                    }
                  />
                  <Label htmlFor="include-charts" className="text-sm">
                    Include charts and visualizations
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-logo"
                    checked={exportOptions.includeLogo}
                    onCheckedChange={(checked) =>
                      setExportOptions(prev => ({ ...prev, includeLogo: checked as boolean }))
                    }
                  />
                  <Label htmlFor="include-logo" className="text-sm">
                    Include client logo placeholder
                  </Label>
                </div>
              </div>

              {/* Client Logo URL */}
              {exportOptions.includeLogo && (
                <div>
                  <Label htmlFor="client-logo" className="text-sm flex items-center gap-2">
                    <Image className="h-3 w-3" />
                    Client Logo URL (optional)
                  </Label>
                  <Input
                    id="client-logo"
                    placeholder="https://example.com/logo.png"
                    value={exportOptions.clientLogo}
                    onChange={(e) =>
                      setExportOptions(prev => ({ ...prev, clientLogo: e.target.value }))
                    }
                    className="mt-1"
                  />
                </div>
              )}

              {/* Watermark */}
              <div>
                <Label htmlFor="watermark" className="text-sm">
                  Watermark text (optional)
                </Label>
                <Input
                  id="watermark"
                  placeholder="CONFIDENTIAL"
                  value={exportOptions.watermark}
                  onChange={(e) =>
                    setExportOptions(prev => ({ ...prev, watermark: e.target.value }))
                  }
                  className="mt-1"
                />
              </div>
            </div>

            {/* Language Info */}
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center gap-2 text-sm">
                <Globe className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="font-medium">Export Language:</span>
                <Badge variant="secondary">
                  {i18n.language === 'ar' ? 'Arabic (RTL)' : 'English'}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                The PDF will be generated in your current language setting.
              </p>
            </div>

            {/* Export Summary */}
            {exportData && (
              <div className="text-xs text-muted-foreground">
                <p>Export will include:</p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Project overview and AI summary</li>
                  {exportData.kpis && <li>Key Performance Indicators</li>}
                  {exportData.scenarios && exportData.scenarios.length > 0 && <li>Scenario analysis</li>}
                  {exportData.milestones && exportData.milestones.length > 0 && <li>Project timeline ({exportData.milestones.length} milestones)</li>}
                  {exportData.contractors && exportData.contractors.length > 0 && <li>Vendor risk summary ({exportData.contractors.length} contractors)</li>}
                  {exportData.insights && <li>AI insights and notes</li>}
                </ul>
              </div>
            )}

            {/* Export Button */}
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <ExportButton onClick={handleCustomExport}>
                {isExporting ? 'Generating...' : 'Generate PDF'}
              </ExportButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}