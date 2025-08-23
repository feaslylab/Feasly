import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useToast } from "@/hooks/use-toast";
import type { Portfolio } from "@/hooks/usePortfolioManager";
import type { AssetWithScenarios } from "@/hooks/usePortfolioAssets";
import type { PortfolioKPIs } from "./PortfolioResultsPanel";

interface ExportPortfolioPDFProps {
  portfolio: Portfolio;
  assets: AssetWithScenarios[];
  kpis: PortfolioKPIs;
  onExport?: () => void;
}

export const ExportPortfolioPDF = ({ portfolio, assets, kpis, onExport }: ExportPortfolioPDFProps) => {
  const { toast } = useToast();

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercent = (value: number): string => {
    return `${value.toFixed(1)}%`;
  };

  const generatePDF = () => {
    try {
      const doc = new jsPDF();
      const currentDate = new Date().toLocaleDateString();
      const currentTime = new Date().toLocaleTimeString();

      // Cover Page
      doc.setFontSize(24);
      doc.setFont("helvetica", "bold");
      doc.text("Portfolio Executive Summary", 20, 30);
      
      doc.setFontSize(18);
      doc.setFont("helvetica", "normal");
      doc.text(portfolio.name, 20, 45);

      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      if (portfolio.description) {
        const splitDescription = doc.splitTextToSize(portfolio.description, 170);
        doc.text(splitDescription, 20, 55);
      }

      // Portfolio metadata
      doc.setFontSize(11);
      doc.text(`Generated on: ${currentDate} at ${currentTime}`, 20, 80);
      doc.text(`Weighting Method: ${portfolio.portfolio_settings.weighting_method.replace('_', ' ').toUpperCase()}`, 20, 90);
      doc.text(`Number of Assets: ${assets.length}`, 20, 100);

      // Page 2 - KPI Summary
      doc.addPage();
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text("Portfolio KPIs", 20, 30);

      const kpiData = [
        ["Metric", "Value", "Description"],
        ["Total NPV", formatCurrency(kpis.totalNPV), "Net Present Value of entire portfolio"],
        ["Weighted IRR", formatPercent(kpis.weightedIRR), "Internal Rate of Return (weighted)"],
        ["Weighted ROI", formatPercent(kpis.weightedROI), "Return on Investment (weighted)"],
        ["Equity Multiple", `${kpis.equityMultiple.toFixed(2)}x`, "Total return multiple on invested equity"],
        ["Profit Margin", formatPercent(kpis.profitMargin), "Overall portfolio profitability"],
        ["Total Revenue", formatCurrency(kpis.totalRevenue), "Aggregate revenue across all assets"],
        ["Total Costs", formatCurrency(kpis.totalCosts), "Aggregate costs across all assets"],
        ["Payback Period", kpis.paybackMonths ? `${kpis.paybackMonths} months` : "N/A", "Time to recover initial investment"]
      ];

      autoTable(doc, {
        head: [kpiData[0]],
        body: kpiData.slice(1),
        startY: 40,
        theme: 'grid',
        headStyles: { fillColor: [66, 135, 245] },
        styles: { fontSize: 10 },
        columnStyles: {
          0: { cellWidth: 40 },
          1: { cellWidth: 40, halign: 'right' },
          2: { cellWidth: 90 }
        }
      });

      // Page 3 - Asset Breakdown
      doc.addPage();
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text("Asset Breakdown", 20, 30);

      const assetHeaders = ["Asset Name", "Type", "Scenario", "Weight", "Contribution"];
      const assetData = assets.map(asset => {
        const selectedScenario = asset.scenarios.find(s => s.id === asset.portfolio_scenario_id) || 
                               asset.scenarios.find(s => s.is_base) || 
                               asset.scenarios[0];
        
        return [
          asset.name,
          asset.type.charAt(0).toUpperCase() + asset.type.slice(1),
          selectedScenario?.name || "Base",
          `${(asset.portfolio_weight * 100).toFixed(1)}%`,
          "High" // Placeholder - would calculate actual contribution
        ];
      });

      autoTable(doc, {
        head: [assetHeaders],
        body: assetData,
        startY: 40,
        theme: 'grid',
        headStyles: { fillColor: [66, 135, 245] },
        styles: { fontSize: 9 },
        columnStyles: {
          0: { cellWidth: 50 },
          1: { cellWidth: 30 },
          2: { cellWidth: 30 },
          3: { cellWidth: 25, halign: 'center' },
          4: { cellWidth: 25, halign: 'center' }
        }
      });

      // Page 4 - Portfolio Settings & Notes
      doc.addPage();
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text("Portfolio Configuration", 20, 30);

      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      
      let yPosition = 50;
      
      doc.setFont("helvetica", "bold");
      doc.text("Weighting Method:", 20, yPosition);
      doc.setFont("helvetica", "normal");
      doc.text(portfolio.portfolio_settings.weighting_method.replace('_', ' ').toUpperCase(), 70, yPosition);
      yPosition += 15;

      doc.setFont("helvetica", "bold");
      doc.text("Aggregation Rules:", 20, yPosition);
      yPosition += 10;
      
      const aggRules = portfolio.portfolio_settings.aggregation_rules;
      doc.setFont("helvetica", "normal");
      doc.text(`• IRR: ${aggRules.irr.toUpperCase()}`, 30, yPosition);
      yPosition += 8;
      doc.text(`• NPV: ${aggRules.npv.toUpperCase()}`, 30, yPosition);
      yPosition += 8;
      doc.text(`• ROI: ${aggRules.roi.toUpperCase()}`, 30, yPosition);
      yPosition += 20;

      doc.setFont("helvetica", "bold");
      doc.text("Risk Considerations:", 20, yPosition);
      yPosition += 10;
      doc.setFont("helvetica", "normal");
      doc.text("• Portfolio diversification across asset types", 30, yPosition);
      yPosition += 8;
      doc.text("• Scenario selection impact on overall performance", 30, yPosition);
      yPosition += 8;
      doc.text("• Weighting distribution and concentration risk", 30, yPosition);

      // Footer with Feasly branding
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        
        // Footer line
        doc.setDrawColor(200, 200, 200);
        doc.line(20, 280, 190, 280);
        
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(128, 128, 128);
        doc.text("Generated by Feasly - Portfolio Analytics Platform", 20, 285);
        doc.text(`Page ${i} of ${pageCount}`, 170, 285);
        doc.text(`Export Date: ${currentDate}`, 20, 290);
      }

      // Save the PDF
      const filename = `${portfolio.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_portfolio_summary.pdf`;
      doc.save(filename);

      toast({
        title: "PDF Generated Successfully",
        description: `Portfolio summary has been exported as ${filename}`,
      });

      if (onExport) {
        onExport();
      }

    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "PDF Generation Failed",
        description: "There was an error generating the portfolio PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Button onClick={generatePDF} variant="outline">
      <FileDown className="h-4 w-4 mr-2" />
      📄 Export Portfolio Summary
    </Button>
  );
};