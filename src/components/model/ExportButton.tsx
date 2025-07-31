import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Download, FileText, Copy } from 'lucide-react';
import { toast } from 'sonner';

interface ExportButtonProps {
  cashflow: number[];
}

export function ExportButton({ cashflow }: ExportButtonProps) {
  const formatCurrency = (value: number) => {
    return value.toLocaleString('en-US', {
      style: 'currency',
      currency: 'AED',
      maximumFractionDigits: 0
    });
  };

  const generateCSVData = () => {
    const cumulativeCashflow = cashflow.reduce((acc, curr, index) => {
      const cumulative = index === 0 ? curr : acc[index - 1] + curr;
      acc.push(cumulative);
      return acc;
    }, [] as number[]);

    const headers = ['Month', 'Monthly Cash Flow', 'Cumulative Cash Flow'];
    const rows = cashflow.map((value, index) => [
      `M${index + 1}`,
      value.toString(),
      cumulativeCashflow[index].toString()
    ]);

    return [headers, ...rows]
      .map(row => row.join(','))
      .join('\n');
  };

  const exportToCSV = () => {
    if (cashflow.length === 0) {
      toast.error('No data to export');
      return;
    }

    const csvData = generateCSVData();
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `cashflow_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Cash flow data exported to CSV');
    }
  };

  const copyToClipboard = async () => {
    if (cashflow.length === 0) {
      toast.error('No data to copy');
      return;
    }

    try {
      const cumulativeCashflow = cashflow.reduce((acc, curr, index) => {
        const cumulative = index === 0 ? curr : acc[index - 1] + curr;
        acc.push(cumulative);
        return acc;
      }, [] as number[]);

      // Create tab-separated values for Excel compatibility
      const headers = ['Month', 'Monthly Cash Flow', 'Cumulative Cash Flow'];
      const rows = cashflow.map((value, index) => [
        `M${index + 1}`,
        formatCurrency(value),
        formatCurrency(cumulativeCashflow[index])
      ]);

      const tsvData = [headers, ...rows]
        .map(row => row.join('\t'))
        .join('\n');

      await navigator.clipboard.writeText(tsvData);
      toast.success('Cash flow data copied to clipboard - paste into Excel');
    } catch (error) {
      toast.error('Failed to copy data to clipboard');
    }
  };

  const exportToPDF = () => {
    // This would typically use jsPDF or similar
    toast.info('PDF export feature coming soon');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportToCSV}>
          <FileText className="h-4 w-4 mr-2" />
          Export CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={copyToClipboard}>
          <Copy className="h-4 w-4 mr-2" />
          Copy to Excel
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToPDF}>
          <FileText className="h-4 w-4 mr-2" />
          Export PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}