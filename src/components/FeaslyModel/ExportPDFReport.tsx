import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { FileText, Download } from "lucide-react";
import { useFeaslyCalculation } from "@/hooks/useFeaslyCalculation";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "sonner";
import type { FeaslyModelFormData } from "./types";

interface ExportPDFReportProps {
  projectId?: string;
  formData?: FeaslyModelFormData;
}

interface ExportOptions {
  includeMetadata: boolean;
  includeKPISummary: boolean;
  includeScenarioTable: boolean;
  includeCashflowTotals: boolean;
  includeInsights: boolean;
}

export default function ExportPDFReport({ projectId, formData }: ExportPDFReportProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    includeMetadata: true,
    includeKPISummary: true,
    includeScenarioTable: true,
    includeCashflowTotals: true,
    includeInsights: false,
  });

  const { compareScenarios, getScenarioSummary, hasData } = useFeaslyCalculation(projectId);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const generatePDFReport = async () => {
    if (!hasData) {
      toast.error("No data available to export");
      return;
    }

    setIsExporting(true);

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      let yPosition = 20;

      // Header
      doc.setFontSize(20);
      doc.setTextColor(40, 40, 40);
      doc.text("Feasly Financial Model Report", pageWidth / 2, yPosition, { align: "center" });
      yPosition += 15;

      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, yPosition, { align: "center" });
      yPosition += 20;

      // Project Metadata
      if (exportOptions.includeMetadata && formData) {
        doc.setFontSize(16);
        doc.setTextColor(40, 40, 40);
        doc.text("Project Metadata", 20, yPosition);
        yPosition += 10;

        const metadata = [
          ["Project Name", formData.project_name || "N/A"],
          ["Location", formData.location || "N/A"],
          ["Currency", formData.currency_code || "SAR"],
          ["Planning Stage", formData.planning_stage || "N/A"],
          ["Start Date", formData.start_date?.toLocaleDateString() || "N/A"],
          ["Completion Date", formData.completion_date?.toLocaleDateString() || "N/A"],
        ];

        autoTable(doc, {
          startY: yPosition,
          head: [["Field", "Value"]],
          body: metadata,
          theme: "grid",
          styles: { fontSize: 10 },
          headStyles: { fillColor: [41, 128, 185] },
        });

        yPosition = (doc as any).lastAutoTable.finalY + 20;
      }

      // KPI Summary
      if (exportOptions.includeKPISummary) {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }

        doc.setFontSize(16);
        doc.setTextColor(40, 40, 40);
        doc.text("KPI Summary by Scenario", 20, yPosition);
        yPosition += 10;

        const scenarios = compareScenarios();
        const kpiData = scenarios.map(({ scenario, summary }) => [
          scenario.charAt(0).toUpperCase() + scenario.slice(1),
          formatCurrency(summary?.totalRevenue || 0),
          formatCurrency(summary?.totalCosts || 0),
          formatCurrency(summary?.totalProfit || 0),
          `${(summary?.profitMargin || 0).toFixed(1)}%`,
          formatCurrency(summary?.finalCashBalance || 0),
        ]);

        autoTable(doc, {
          startY: yPosition,
          head: [["Scenario", "Revenue", "Costs", "Profit", "Margin", "Final Balance"]],
          body: kpiData,
          theme: "grid",
          styles: { fontSize: 9 },
          headStyles: { fillColor: [41, 128, 185] },
        });

        yPosition = (doc as any).lastAutoTable.finalY + 20;
      }

      // Scenario Comparison Table
      if (exportOptions.includeScenarioTable) {
        if (yPosition > 200) {
          doc.addPage();
          yPosition = 20;
        }

        doc.setFontSize(16);
        doc.setTextColor(40, 40, 40);
        doc.text("Detailed Scenario Analysis", 20, yPosition);
        yPosition += 10;

        const scenarios = compareScenarios();
        const detailedData = scenarios.map(({ scenario, summary }) => {
          const roi = summary ? ((summary.totalProfit / summary.totalCosts) * 100) : 0;
          return [
            scenario.charAt(0).toUpperCase() + scenario.slice(1),
            formatCurrency(summary?.totalRevenue || 0),
            formatCurrency(summary?.totalCosts || 0),
            formatCurrency(summary?.totalProfit || 0),
            `${roi.toFixed(1)}%`,
            `${(summary?.profitMargin || 0).toFixed(1)}%`,
            `${Math.round((summary?.timelineMonths || 0) / 12)} years`,
            formatCurrency(summary?.totalZakat || 0),
          ];
        });

        autoTable(doc, {
          startY: yPosition,
          head: [["Scenario", "Revenue", "Costs", "Profit", "ROI", "Margin", "Timeline", "Zakat"]],
          body: detailedData,
          theme: "grid",
          styles: { fontSize: 8 },
          headStyles: { fillColor: [41, 128, 185] },
        });

        yPosition = (doc as any).lastAutoTable.finalY + 20;
      }

      // Cashflow Totals
      if (exportOptions.includeCashflowTotals) {
        if (yPosition > 200) {
          doc.addPage();
          yPosition = 20;
        }

        doc.setFontSize(16);
        doc.setTextColor(40, 40, 40);
        doc.text("Cashflow Summary", 20, yPosition);
        yPosition += 10;

        const scenarios = compareScenarios();
        const cashflowData = scenarios.map(({ scenario, data }) => {
          const totalRevenue = data.reduce((sum, month) => sum + month.revenue, 0);
          const totalCosts = data.reduce((sum, month) => 
            sum + month.constructionCost + month.landCost + month.softCosts, 0);
          const totalNetCashflow = data.reduce((sum, month) => sum + month.netCashflow, 0);
          const finalBalance = data.length > 0 ? data[data.length - 1].cashBalance : 0;

          return [
            scenario.charAt(0).toUpperCase() + scenario.slice(1),
            formatCurrency(totalRevenue),
            formatCurrency(totalCosts),
            formatCurrency(totalNetCashflow),
            formatCurrency(finalBalance),
          ];
        });

        autoTable(doc, {
          startY: yPosition,
          head: [["Scenario", "Total Revenue", "Total Costs", "Net Cashflow", "Final Balance"]],
          body: cashflowData,
          theme: "grid",
          styles: { fontSize: 10 },
          headStyles: { fillColor: [41, 128, 185] },
        });

        yPosition = (doc as any).lastAutoTable.finalY + 20;
      }

      // Smart Insights (if enabled)
      if (exportOptions.includeInsights) {
        if (yPosition > 220) {
          doc.addPage();
          yPosition = 20;
        }

        doc.setFontSize(16);
        doc.setTextColor(40, 40, 40);
        doc.text("Key Insights & Recommendations", 20, yPosition);
        yPosition += 15;

        doc.setFontSize(10);
        doc.setTextColor(60, 60, 60);

        const bestScenario = compareScenarios().reduce((best, current) => 
          (current.summary?.totalProfit || 0) > (best.summary?.totalProfit || 0) ? current : best
        );

        const insights = [
          `• Best performing scenario: ${bestScenario.scenario.charAt(0).toUpperCase() + bestScenario.scenario.slice(1)}`,
          `• Projected profit: ${formatCurrency(bestScenario.summary?.totalProfit || 0)}`,
          `• Estimated timeline: ${Math.round((bestScenario.summary?.timelineMonths || 0) / 12)} years`,
          `• Key risks: Monitor cashflow during construction phase`,
          `• Recommendation: Consider scenario sensitivity for final decision`,
        ];

        insights.forEach(insight => {
          doc.text(insight, 20, yPosition);
          yPosition += 7;
        });
      }

      // Footer
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(
          `Page ${i} of ${pageCount} - Feasly Financial Model Report`,
          pageWidth / 2,
          doc.internal.pageSize.height - 10,
          { align: "center" }
        );
      }

      // Save the PDF
      const projectName = formData?.project_name || "feasly-project";
      const date = new Date().toISOString().split('T')[0];
      const filename = `feasly-report-${projectName.replace(/\s+/g, '-').toLowerCase()}-${date}.pdf`;
      
      doc.save(filename);
      toast.success("PDF report exported successfully");

    } catch (error) {
      console.error("PDF export failed:", error);
      toast.error("Failed to export PDF report");
    } finally {
      setIsExporting(false);
    }
  };

  const updateExportOption = (key: keyof ExportOptions, value: boolean) => {
    setExportOptions(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Export PDF Report
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Generate a comprehensive PDF report with selected sections:
          </div>

          <div className="space-y-3">
            {Object.entries({
              includeMetadata: "Project Metadata",
              includeKPISummary: "KPI Summary Table", 
              includeScenarioTable: "Scenario Comparison",
              includeCashflowTotals: "Cashflow Totals",
              includeInsights: "Smart Insights",
            }).map(([key, label]) => (
              <div key={key} className="flex items-center space-x-2">
                <Checkbox
                  id={key}
                  checked={exportOptions[key as keyof ExportOptions]}
                  onCheckedChange={(checked) => 
                    updateExportOption(key as keyof ExportOptions, !!checked)
                  }
                />
                <label htmlFor={key} className="text-sm font-medium">
                  {label}
                </label>
              </div>
            ))}
          </div>

          <Button 
            onClick={generatePDFReport}
            disabled={!hasData || isExporting}
            className="w-full"
          >
            <Download className="h-4 w-4 mr-2" />
            {isExporting ? "Generating Report..." : "Export PDF Report"}
          </Button>

          {!hasData && (
            <p className="text-sm text-muted-foreground text-center">
              Generate cashflow data first to enable PDF export
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}