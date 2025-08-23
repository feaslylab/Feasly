import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileDown, FileSpreadsheet, FileText } from "lucide-react";

export const PortfolioExportPanel = () => {
  const handleExportPDF = () => {
    console.log('Exporting portfolio report to PDF...');
  };

  const handleExportExcel = () => {
    console.log('Exporting portfolio data to Excel...');
  };

  const handleExportCSV = () => {
    console.log('Exporting portfolio data to CSV...');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileDown className="h-5 w-5" />
          Export Portfolio
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={handleExportPDF}
          >
            <FileText className="h-4 w-4 mr-2" />
            Executive Report (PDF)
          </Button>

          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={handleExportExcel}
          >
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Portfolio Data (Excel)
          </Button>

          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={handleExportCSV}
          >
            <FileDown className="h-4 w-4 mr-2" />
            Portfolio Data (CSV)
          </Button>
        </div>

        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground">
            Export your portfolio analysis for presentations and reporting.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};