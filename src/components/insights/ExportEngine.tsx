import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileDown, FileSpreadsheet, FileText } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import html2canvas from "html2canvas";

interface Project {
  id: string;
  name: string;
  totalGFA: number;
  constructionCost: number;
  estimatedRevenue: number;
  irr: number;
  roi: number;
  profitMargin: number;
  netProfit: number;
  status: string;
  currency: string;
  createdAt: Date;
  scenario: string;
  country?: string;
  city?: string;
}

interface ExportEngineProps {
  projects: Project[];
  kpiMetrics: any;
  currencyFormat: string;
  formatCurrency: (amount: number) => string;
}

export const ExportEngine = ({ projects, kpiMetrics, currencyFormat, formatCurrency }: ExportEngineProps) => {
  const [exporting, setExporting] = useState<string | null>(null);

  const exportToPDF = async () => {
    setExporting('pdf');
    toast("Generating PDF export...");
    
    try {
      const pdf = new jsPDF();
      
      // Title
      pdf.setFontSize(20);
      pdf.text('Feasly Insights Report', 20, 20);
      
      // Date
      pdf.setFontSize(10);
      pdf.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 30);
      
      // KPI Summary
      pdf.setFontSize(14);
      pdf.text('Key Performance Indicators', 20, 45);
      
      const kpiData = [
        ['Total Projects', kpiMetrics.totalProjects.toString()],
        ['Total GFA', `${kpiMetrics.totalGFA.toLocaleString()} sqm`],
        ['Construction Cost', formatCurrency(kpiMetrics.totalConstructionCost)],
        ['Estimated Revenue', formatCurrency(kpiMetrics.totalEstimatedRevenue)],
        ['Net Profit', formatCurrency(kpiMetrics.totalNetProfit)],
        ['Average IRR', `${kpiMetrics.avgIRR.toFixed(1)}%`],
        ['Average ROI', `${kpiMetrics.avgROI.toFixed(1)}%`],
        ['Portfolio Profit Margin', `${kpiMetrics.portfolioProfitMargin.toFixed(1)}%`],
        ['Risk Level', kpiMetrics.riskLevel]
      ];
      
      autoTable(pdf, {
        startY: 50,
        head: [['Metric', 'Value']],
        body: kpiData,
        theme: 'grid',
        styles: { fontSize: 10 }
      });
      
      // Projects Table
      const projectsTableY = (pdf as any).lastAutoTable.finalY + 20;
      pdf.setFontSize(14);
      pdf.text('Projects Summary', 20, projectsTableY);
      
      const projectData = projects.map(p => [
        p.name,
        p.scenario,
        p.status,
        `${p.totalGFA.toLocaleString()} sqm`,
        formatCurrency(p.constructionCost),
        formatCurrency(p.estimatedRevenue),
        formatCurrency(p.netProfit),
        `${p.irr.toFixed(1)}%`,
        `${p.roi.toFixed(1)}%`
      ]);
      
      autoTable(pdf, {
        startY: projectsTableY + 5,
        head: [['Project', 'Scenario', 'Status', 'GFA', 'Cost', 'Revenue', 'Net Profit', 'IRR', 'ROI']],
        body: projectData,
        theme: 'grid',
        styles: { fontSize: 8 },
        columnStyles: {
          0: { cellWidth: 30 },
          1: { cellWidth: 20 },
          2: { cellWidth: 20 }
        }
      });
      
      pdf.save('feasly-insights-report.pdf');
      toast("PDF export completed!");
    } catch (error) {
      toast("Failed to export PDF");
      console.error('PDF export error:', error);
    } finally {
      setExporting(null);
    }
  };

  const exportToCSV = () => {
    setExporting('csv');
    toast("Generating CSV export...");
    
    try {
      const csvData = projects.map(p => ({
        'Project Name': p.name,
        'Scenario': p.scenario,
        'Status': p.status,
        'Country': p.country || '',
        'City': p.city || '',
        'GFA (sqm)': p.totalGFA,
        'Construction Cost': p.constructionCost,
        'Estimated Revenue': p.estimatedRevenue,
        'Net Profit': p.netProfit,
        'IRR (%)': p.irr,
        'ROI (%)': p.roi,
        'Profit Margin (%)': p.profitMargin,
        'Currency': p.currency,
        'Created Date': p.createdAt.toISOString().split('T')[0]
      }));
      
      const worksheet = XLSX.utils.json_to_sheet(csvData);
      const csvOutput = XLSX.utils.sheet_to_csv(worksheet);
      
      const blob = new Blob([csvOutput], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'feasly-insights-data.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast("CSV export completed!");
    } catch (error) {
      toast("Failed to export CSV");
      console.error('CSV export error:', error);
    } finally {
      setExporting(null);
    }
  };

  const exportToExcel = () => {
    setExporting('excel');
    toast("Generating Excel export...");
    
    try {
      const workbook = XLSX.utils.book_new();
      
      // KPI Sheet
      const kpiData = [
        ['Metric', 'Value'],
        ['Total Projects', kpiMetrics.totalProjects],
        ['Total GFA (sqm)', kpiMetrics.totalGFA],
        ['Construction Cost', kpiMetrics.totalConstructionCost],
        ['Estimated Revenue', kpiMetrics.totalEstimatedRevenue],
        ['Net Profit', kpiMetrics.totalNetProfit],
        ['Average IRR (%)', kpiMetrics.avgIRR],
        ['Average ROI (%)', kpiMetrics.avgROI],
        ['Portfolio Profit Margin (%)', kpiMetrics.portfolioProfitMargin],
        ['Risk Level', kpiMetrics.riskLevel]
      ];
      
      const kpiSheet = XLSX.utils.aoa_to_sheet(kpiData);
      XLSX.utils.book_append_sheet(workbook, kpiSheet, 'KPI Summary');
      
      // Projects Sheet
      const projectData = projects.map(p => ({
        'Project Name': p.name,
        'Scenario': p.scenario,
        'Status': p.status,
        'Country': p.country || '',
        'City': p.city || '',
        'GFA (sqm)': p.totalGFA,
        'Construction Cost': p.constructionCost,
        'Estimated Revenue': p.estimatedRevenue,
        'Net Profit': p.netProfit,
        'IRR (%)': p.irr,
        'ROI (%)': p.roi,
        'Profit Margin (%)': p.profitMargin,
        'Currency': p.currency,
        'Created Date': p.createdAt.toISOString().split('T')[0]
      }));
      
      const projectSheet = XLSX.utils.json_to_sheet(projectData);
      XLSX.utils.book_append_sheet(workbook, projectSheet, 'Projects Data');
      
      XLSX.writeFile(workbook, 'feasly-insights-report.xlsx');
      toast("Excel export completed!");
    } catch (error) {
      toast("Failed to export Excel");
      console.error('Excel export error:', error);
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={exportToPDF}
        disabled={exporting === 'pdf' || projects.length === 0}
      >
        <FileText className="h-4 w-4 mr-2" />
        {exporting === 'pdf' ? 'Exporting...' : 'Export PDF'}
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={exportToCSV}
        disabled={exporting === 'csv' || projects.length === 0}
      >
        <FileDown className="h-4 w-4 mr-2" />
        {exporting === 'csv' ? 'Exporting...' : 'Export CSV'}
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={exportToExcel}
        disabled={exporting === 'excel' || projects.length === 0}
      >
        <FileSpreadsheet className="h-4 w-4 mr-2" />
        {exporting === 'excel' ? 'Exporting...' : 'Export Excel'}
      </Button>
    </div>
  );
};