import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, FileSpreadsheet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import type { FeaslyModelFormData } from "./types";

export function ExportPanel() {
  const { t } = useTranslation('feasly.model');
  const { toast } = useToast();
  const form = useFormContext<FeaslyModelFormData>();

  const exportToPDF = () => {
    const data = form.getValues();
    const doc = new jsPDF();

    // Title
    doc.setFontSize(20);
    doc.text("Feasibility Model Report", 20, 20);

    // Project Information
    doc.setFontSize(14);
    doc.text("Project Information", 20, 40);
    
    const projectInfo = [
      ["Project Name", data.project_name || "N/A"],
      ["Sponsor", data.sponsor_name || "N/A"],
      ["Location", data.location || "N/A"],
      ["Currency", data.currency_code || "SAR"],
      ["Start Date", data.start_date?.toString() || "N/A"],
      ["Completion Date", data.completion_date?.toString() || "N/A"],
    ];

    autoTable(doc, {
      startY: 45,
      head: [["Field", "Value"]],
      body: projectInfo,
      margin: { left: 20 },
    });

    // Financial Inputs
    let currentY = (doc as any).lastAutoTable?.finalY || 90;
    doc.setFontSize(14);
    doc.text("Financial Inputs", 20, currentY + 20);

    const financialData = [
      ["Land Cost", `${data.land_cost || 0} ${data.currency_code || "SAR"}`],
      ["Construction Cost", `${data.construction_cost || 0} ${data.currency_code || "SAR"}`],
      ["Soft Costs", `${data.soft_costs || 0} ${data.currency_code || "SAR"}`],
      ["Total Investment", `${(data.land_cost || 0) + (data.construction_cost || 0) + (data.soft_costs || 0)} ${data.currency_code || "SAR"}`],
    ];

    autoTable(doc, {
      startY: currentY + 25,
      head: [["Category", "Amount"]],
      body: financialData,
      margin: { left: 20 },
    });

    // Site Metrics
    currentY = (doc as any).lastAutoTable?.finalY || 150;
    doc.setFontSize(14);
    doc.text("Site Metrics", 20, currentY + 20);

    const siteData = [
      ["Site Area (sqm)", `${data.site_area_sqm || 0}`],
      ["Total GFA (sqm)", `${data.total_gfa_sqm || 0}`],
      ["Efficiency Ratio (%)", `${data.efficiency_ratio || 0}`],
      ["FAR Ratio", `${data.far_ratio || 0}`],
      ["Height (Stories)", `${data.height_stories || 0}`],
    ];

    autoTable(doc, {
      startY: currentY + 25,
      head: [["Metric", "Value"]],
      body: siteData,
      margin: { left: 20 },
    });

    // Save PDF
    doc.save("feasly-model-report.pdf");
    
    toast({
      title: "PDF Exported",
      description: "Feasibility model has been exported as PDF.",
    });
  };

  const exportToExcel = () => {
    const data = form.getValues();

    // Create workbook
    const wb = XLSX.utils.book_new();

    // Project Information Sheet
    const projectData = [
      ["Field", "Value"],
      ["Project Name", data.project_name || "N/A"],
      ["Sponsor", data.sponsor_name || "N/A"],
      ["Location", data.location || "N/A"],
      ["Currency", data.currency_code || "SAR"],
      ["Start Date", data.start_date?.toString() || "N/A"],
      ["Completion Date", data.completion_date?.toString() || "N/A"],
    ];
    const projectWS = XLSX.utils.aoa_to_sheet(projectData);
    XLSX.utils.book_append_sheet(wb, projectWS, "Project Info");

    // Financial Data Sheet
    const financialData = [
      ["Category", "Amount", "Currency"],
      ["Land Cost", data.land_cost || 0, data.currency_code || "SAR"],
      ["Construction Cost", data.construction_cost || 0, data.currency_code || "SAR"],
      ["Soft Costs", data.soft_costs || 0, data.currency_code || "SAR"],
      ["Total Investment", (data.land_cost || 0) + (data.construction_cost || 0) + (data.soft_costs || 0), data.currency_code || "SAR"],
    ];
    const financialWS = XLSX.utils.aoa_to_sheet(financialData);
    XLSX.utils.book_append_sheet(wb, financialWS, "Financial Data");

    // Site Metrics Sheet
    const siteData = [
      ["Metric", "Value", "Unit"],
      ["Site Area", data.site_area_sqm || 0, "sqm"],
      ["Total GFA", data.total_gfa_sqm || 0, "sqm"],
      ["Efficiency Ratio", data.efficiency_ratio || 0, "%"],
      ["FAR Ratio", data.far_ratio || 0, "ratio"],
      ["Height", data.height_stories || 0, "stories"],
    ];
    const siteWS = XLSX.utils.aoa_to_sheet(siteData);
    XLSX.utils.book_append_sheet(wb, siteWS, "Site Metrics");

    // Save Excel file
    XLSX.writeFile(wb, "feasly-model-report.xlsx");

    toast({
      title: "Excel Exported",
      description: "Feasibility model has been exported as Excel.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <FileText className="h-5 w-5 text-primary" />
          <CardTitle>{t('export_model')}</CardTitle>
        </div>
        <CardDescription>
          Export your feasibility model as PDF or Excel
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Button onClick={exportToPDF} variant="outline" className="w-full">
            <FileText className="h-4 w-4 mr-2" />
            Export as PDF
          </Button>
          <Button onClick={exportToExcel} variant="outline" className="w-full">
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Export as Excel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}