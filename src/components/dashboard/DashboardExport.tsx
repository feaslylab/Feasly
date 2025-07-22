import { useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { utils as XLSXUtils, writeFile } from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileDown, FileSpreadsheet } from "lucide-react";

interface FilterState {
  projectId: string | null;
  dateRange: 30 | 90 | 365 | null;
}

interface DashboardExportProps {
  filters: FilterState;
  stats: {
    totalProjects: number;
    totalAssets: number;
    totalValue: number;
    totalRevenue: number;
    avgIRR: number;
  };
  projects: Array<{ id: string; name: string; }>;
}

export const DashboardExport = ({ filters, stats, projects }: DashboardExportProps) => {
  const [isExporting, setIsExporting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const getFilteredData = async () => {
    try {
      // Build query based on filters
      let projectsQuery = supabase
        .from('projects')
        .select(`
          id,
          name,
          description,
          created_at,
          updated_at,
          currency_code,
          assets (
            id,
            name,
            type,
            gfa_sqm,
            construction_cost_aed,
            annual_revenue_aed,
            annual_operating_cost_aed,
            occupancy_rate_percent,
            cap_rate_percent,
            development_timeline_months,
            stabilization_period_months,
            created_at
          )
        `)
        .eq('user_id', user?.id);

      // Apply project filter
      if (filters.projectId) {
        projectsQuery = projectsQuery.eq('id', filters.projectId);
      }

      // Apply date filter
      if (filters.dateRange) {
        const daysAgo = new Date();
        daysAgo.setDate(daysAgo.getDate() - filters.dateRange);
        projectsQuery = projectsQuery.gte('created_at', daysAgo.toISOString());
      }

      const { data: projectsData, error } = await projectsQuery.order('created_at', { ascending: false });

      if (error) throw error;
      return projectsData || [];
    } catch (error) {
      console.error('Error fetching filtered data:', error);
      return [];
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getExportFileName = (type: 'excel' | 'pdf') => {
    const timestamp = new Date().toISOString().split('T')[0];
    let filterSuffix = '';
    
    if (filters.projectId) {
      const project = projects.find(p => p.id === filters.projectId);
      filterSuffix += `_${project?.name.replace(/[^a-zA-Z0-9]/g, '_') || 'Project'}`;
    } else {
      filterSuffix += '_All_Projects';
    }
    
    if (filters.dateRange) {
      filterSuffix += `_${filters.dateRange}days`;
    }
    
    return `Dashboard_Export${filterSuffix}_${timestamp}.${type === 'excel' ? 'xlsx' : 'pdf'}`;
  };

  const exportToExcel = async () => {
    setIsExporting(true);
    try {
      const filteredData = await getFilteredData();
      
      // Create workbook
      const wb = XLSXUtils.book_new();
      
      // Summary sheet
      const summaryData = [
        ['Dashboard Summary', ''],
        ['Filter:', filters.projectId ? projects.find(p => p.id === filters.projectId)?.name || 'Selected Project' : 'All Projects'],
        ['Date Range:', filters.dateRange ? `Last ${filters.dateRange} days` : 'All Time'],
        ['Export Date:', new Date().toLocaleDateString()],
        [''],
        ['Metric', 'Value'],
        ['Total Projects', stats.totalProjects],
        ['Total Assets', stats.totalAssets],
        ['Portfolio Value', formatCurrency(stats.totalValue)],
        ['Estimated Revenue', formatCurrency(stats.totalRevenue)],
        ['Average IRR', `${stats.avgIRR}%`],
      ];
      
      const summaryWs = XLSXUtils.aoa_to_sheet(summaryData);
      XLSXUtils.book_append_sheet(wb, summaryWs, 'Summary');
      
      // Projects sheet
      const projectsData = [
        ['Project Name', 'Description', 'Currency', 'Asset Count', 'Total Construction Cost', 'Total Revenue Potential', 'Created Date']
      ];
      
      filteredData.forEach(project => {
        const assetCount = project.assets?.length || 0;
        const totalCost = project.assets?.reduce((sum: number, asset: any) => sum + (asset.construction_cost_aed || 0), 0) || 0;
        const totalRevenue = project.assets?.reduce((sum: number, asset: any) => sum + (asset.annual_revenue_aed || 0), 0) || 0;
        const currency = (project as any).currency_code || 'AED';
        
        projectsData.push([
          project.name,
          project.description || '',
          currency,
          assetCount,
          `${currency} ${totalCost.toLocaleString()}`,
          `${currency} ${totalRevenue.toLocaleString()}`,
          new Date(project.created_at).toLocaleDateString()
        ]);
      });
      
      const projectsWs = XLSXUtils.aoa_to_sheet(projectsData);
      XLSXUtils.book_append_sheet(wb, projectsWs, 'Projects');
      
      // Assets sheet
      const assetsData = [
        ['Project', 'Currency', 'Asset Name', 'Type', 'GFA (sqm)', 'Construction Cost', 'Annual Revenue', 'Operating Cost', 'Occupancy Rate (%)', 'Cap Rate (%)']
      ];
      
      filteredData.forEach(project => {
        const currency = (project as any).currency_code || 'AED';
        project.assets?.forEach((asset: any) => {
          assetsData.push([
            project.name,
            currency,
            asset.name,
            asset.type,
            asset.gfa_sqm || 0,
            `${currency} ${(asset.construction_cost_aed || 0).toLocaleString()}`,
            `${currency} ${(asset.annual_revenue_aed || 0).toLocaleString()}`,
            `${currency} ${(asset.annual_operating_cost_aed || 0).toLocaleString()}`,
            asset.occupancy_rate_percent || 0,
            asset.cap_rate_percent || 0
          ]);
        });
      });
      
      const assetsWs = XLSXUtils.aoa_to_sheet(assetsData);
      XLSXUtils.book_append_sheet(wb, assetsWs, 'Assets');
      
      // Save file
      const filename = getExportFileName('excel');
      writeFile(wb, filename);
      
      toast({
        title: "Export Successful",
        description: `Dashboard data exported to ${filename}`,
      });
      
    } catch (error: any) {
      toast({
        title: "Export Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const exportToPDF = async () => {
    setIsExporting(true);
    try {
      const filteredData = await getFilteredData();
      
      // Create PDF
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      let yPosition = 20;
      
      // Title
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('Portfolio Dashboard Report', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 20;
      
      // Filters info
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      const filterText = `Filter: ${filters.projectId ? projects.find(p => p.id === filters.projectId)?.name || 'Selected Project' : 'All Projects'}`;
      const dateText = `Date Range: ${filters.dateRange ? `Last ${filters.dateRange} days` : 'All Time'}`;
      const exportDate = `Export Date: ${new Date().toLocaleDateString()}`;
      
      doc.text(filterText, 20, yPosition);
      yPosition += 10;
      doc.text(dateText, 20, yPosition);
      yPosition += 10;
      doc.text(exportDate, 20, yPosition);
      yPosition += 20;
      
      // Summary section
      doc.setFont('helvetica', 'bold');
      doc.text('Portfolio Summary', 20, yPosition);
      yPosition += 10;
      
      doc.setFont('helvetica', 'normal');
      const summaryText = [
        `Total Projects: ${stats.totalProjects}`,
        `Total Assets: ${stats.totalAssets}`,
        `Note: Financial values shown in each project's native currency`,
        `Portfolio contains mixed currencies - see detailed breakdown below`,
        `Average IRR: ${stats.avgIRR}%`
      ];
      
      summaryText.forEach(text => {
        doc.text(text, 20, yPosition);
        yPosition += 8;
      });
      
      yPosition += 10;
      
      // Projects table
      if (filteredData.length > 0) {
        doc.setFont('helvetica', 'bold');
        doc.text('Projects Overview', 20, yPosition);
        yPosition += 10;
        
        const projectsTableData = filteredData.map(project => {
          const currency = (project as any).currency_code || 'AED';
          return [
            project.name,
            project.assets?.length || 0,
            `${currency} ${(project.assets?.reduce((sum: number, asset: any) => sum + (asset.construction_cost_aed || 0), 0) || 0).toLocaleString()}`,
            `${currency} ${(project.assets?.reduce((sum: number, asset: any) => sum + (asset.annual_revenue_aed || 0), 0) || 0).toLocaleString()}`
          ];
        });
        
        (doc as any).autoTable({
          head: [['Project Name', 'Assets', 'Construction Cost', 'Revenue Potential']],
          body: projectsTableData,
          startY: yPosition,
          theme: 'grid',
          headStyles: { fillColor: [41, 128, 185] },
          margin: { left: 20, right: 20 }
        });
      }
      
      // Save PDF
      const filename = getExportFileName('pdf');
      doc.save(filename);
      
      toast({
        title: "Export Successful", 
        description: `Dashboard report exported to ${filename}`,
      });
      
    } catch (error: any) {
      toast({
        title: "Export Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={isExporting} className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          {isExporting ? "Exporting..." : "Export"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 bg-background border border-border shadow-lg z-50">
        <DropdownMenuItem onClick={exportToExcel} className="cursor-pointer">
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Export to Excel
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToPDF} className="cursor-pointer">
          <FileDown className="mr-2 h-4 w-4" />
          Export to PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};