import jsPDF from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { format } from 'date-fns';
import { UserOptions } from 'jspdf-autotable';

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: UserOptions) => jsPDF;
  }
}

export interface ExportData {
  project: {
    id: string;
    name: string;
    description?: string;
    project_ai_summary?: string;
    currency_code?: string;
    created_at: string;
    tags?: string[];
    status: string;
  };
  kpis?: {
    irr: number;
    roi: number;
    totalProfit: number;
    totalRevenue: number;
    totalCost: number;
    paybackPeriod: number;
  };
  scenarios?: Array<{
    name: string;
    type: 'base' | 'optimistic' | 'pessimistic';
    irr: number;
    totalProfit: number;
    riskLevel: 'low' | 'medium' | 'high';
  }>;
  milestones?: Array<{
    label: string;
    target_date: string;
    status: string;
    description?: string;
  }>;
  contractors?: Array<{
    name: string;
    phase: string;
    amount: number;
    risk_rating: string;
    status: string;
  }>;
  insights?: {
    userNotes?: string;
    generatedInsights?: any;
  };
  compliance?: {
    escrow?: {
      enabled: boolean;
      percentage: number;
      triggerType: string;
      releaseThreshold: number;
      triggerDetails?: string;
    };
    zakat?: {
      applicable: boolean;
      rate: number;
      calculationMethod: string;
      excludeLosses: boolean;
    };
    escrowReleases?: Array<{
      releaseDate: string;
      releaseAmount: number;
      releasePercentage: number;
      triggerType: string;
      constructionProgress?: number;
    }>;
  };
  language?: 'en' | 'ar';
  isRTL?: boolean;
}

export interface ExportOptions {
  includeCharts?: boolean;
  includeLogo?: boolean;
  clientLogo?: string;
  watermark?: string;
}

export class FeaslyPDFExporter {
  private doc: jsPDF;
  private currentY: number = 20;
  private pageHeight: number = 297; // A4 height in mm
  private pageWidth: number = 210; // A4 width in mm
  private margin: number = 20;
  private data: ExportData;
  private options: ExportOptions;
  private isRTL: boolean = false;

  // Feasly brand colors
  private colors = {
    primary: '#1E40AF', // Blue
    secondary: '#7C3AED', // Purple
    success: '#059669', // Green
    warning: '#D97706', // Orange
    danger: '#DC2626', // Red
    gray: '#6B7280',
    lightGray: '#F3F4F6',
    text: '#111827',
    lightText: '#6B7280'
  };

  constructor(data: ExportData, options: ExportOptions = {}) {
    this.data = data;
    this.options = options;
    this.isRTL = data.isRTL || false;
    this.doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Set default font
    this.doc.setFont('helvetica');
  }

  private checkPageBreak(requiredHeight: number = 20): void {
    if (this.currentY + requiredHeight > this.pageHeight - this.margin) {
      this.doc.addPage();
      this.currentY = this.margin;
      this.addHeader();
    }
  }

  private addHeader(): void {
    const headerY = 10;
    
    // Feasly logo/title
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(this.colors.primary);
    
    if (this.isRTL) {
      this.doc.text('Feasly', this.pageWidth - this.margin, headerY, { align: 'right' });
    } else {
      this.doc.text('Feasly', this.margin, headerY);
    }

    // Client logo placeholder (if provided)
    if (this.options.clientLogo || this.options.includeLogo) {
      const logoX = this.isRTL ? this.margin : this.pageWidth - this.margin - 30;
      this.doc.setFillColor(this.colors.lightGray);
      this.doc.rect(logoX, 5, 30, 15, 'F');
      this.doc.setFontSize(8);
      this.doc.setTextColor(this.colors.gray);
      this.doc.text('CLIENT LOGO', logoX + 15, 13, { align: 'center' });
    }

    // Header line
    this.doc.setDrawColor(this.colors.lightGray);
    this.doc.line(this.margin, 18, this.pageWidth - this.margin, 18);
    
    this.currentY = 25;
  }

  private addFooter(): void {
    const footerY = this.pageHeight - 10;
    
    // Footer line
    this.doc.setDrawColor(this.colors.lightGray);
    this.doc.line(this.margin, footerY - 5, this.pageWidth - this.margin, footerY - 5);
    
    // Export timestamp
    this.doc.setFontSize(8);
    this.doc.setTextColor(this.colors.lightText);
    const timestamp = format(new Date(), 'PPpp');
    
    if (this.isRTL) {
      this.doc.text(`Exported on ${timestamp}`, this.pageWidth - this.margin, footerY, { align: 'right' });
      this.doc.text('Powered by Feasly', this.margin, footerY);
    } else {
      this.doc.text(`Exported on ${timestamp}`, this.margin, footerY);
      this.doc.text('Powered by Feasly', this.pageWidth - this.margin, footerY, { align: 'right' });
    }
  }

  private addTitle(): void {
    this.checkPageBreak(30);
    
    // Project name
    this.doc.setFontSize(24);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(this.colors.text);
    
    const textAlign = this.isRTL ? 'right' : 'left';
    const textX = this.isRTL ? this.pageWidth - this.margin : this.margin;
    
    this.doc.text(this.data.project.name, textX, this.currentY, { align: textAlign });
    this.currentY += 12;

    // Export date and status
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(this.colors.gray);
    
    const exportDate = format(new Date(), 'MMMM dd, yyyy');
    this.doc.text(`Export Date: ${exportDate}`, textX, this.currentY, { align: textAlign });
    this.currentY += 8;
    
    // Status badge
    const statusText = `Status: ${this.data.project.status.toUpperCase()}`;
    this.doc.text(statusText, textX, this.currentY, { align: textAlign });
    this.currentY += 15;

    // AI Summary
    if (this.data.project.project_ai_summary) {
      this.addSectionTitle('Executive Summary');
      this.doc.setFontSize(11);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(this.colors.text);
      
      const summaryLines = this.doc.splitTextToSize(
        this.data.project.project_ai_summary, 
        this.pageWidth - 2 * this.margin
      );
      
      summaryLines.forEach((line: string) => {
        this.checkPageBreak(8);
        this.doc.text(line, textX, this.currentY, { align: textAlign });
        this.currentY += 6;
      });
    } else {
      // Fallback summary
      this.addSectionTitle('Executive Summary');
      this.doc.setFontSize(11);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(this.colors.text);
      
      const fallbackText = `This is a feasibility model generated via Feasly. Exported on ${exportDate}.`;
      this.doc.text(fallbackText, textX, this.currentY, { align: textAlign });
    }
    
    this.currentY += 15;
  }

  private addSectionTitle(title: string): void {
    this.checkPageBreak(15);
    
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(this.colors.primary);
    
    const textX = this.isRTL ? this.pageWidth - this.margin : this.margin;
    const textAlign = this.isRTL ? 'right' : 'left';
    
    this.doc.text(title, textX, this.currentY, { align: textAlign });
    this.currentY += 10;
    
    // Section underline
    this.doc.setDrawColor(this.colors.primary);
    this.doc.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY);
    this.currentY += 8;
  }

  private addKPISection(): void {
    if (!this.data.kpis) return;

    this.addSectionTitle('Key Performance Indicators');

    const kpiData = [
      ['Metric', 'Value', 'Description'],
      [
        'Internal Rate of Return (IRR)', 
        `${this.data.kpis.irr.toFixed(1)}%`,
        'Expected annual return rate'
      ],
      [
        'Return on Investment (ROI)', 
        `${this.data.kpis.roi.toFixed(1)}%`,
        'Total return percentage'
      ],
      [
        'Net Profit', 
        `${(this.data.kpis.totalProfit / 1000000).toFixed(1)}M ${this.data.project.currency_code || 'AED'}`,
        'Total profit after costs'
      ],
      [
        'Total Revenue', 
        `${(this.data.kpis.totalRevenue / 1000000).toFixed(1)}M ${this.data.project.currency_code || 'AED'}`,
        'Projected total income'
      ],
      [
        'Total Cost', 
        `${(this.data.kpis.totalCost / 1000000).toFixed(1)}M ${this.data.project.currency_code || 'AED'}`,
        'Total project expenses'
      ],
      [
        'Payback Period', 
        `${this.data.kpis.paybackPeriod} months`,
        'Time to recover investment'
      ]
    ];

    this.doc.autoTable({
      startY: this.currentY,
      head: [kpiData[0]],
      body: kpiData.slice(1),
      theme: 'grid',
      headStyles: {
        fillColor: this.colors.primary,
        textColor: 255,
        fontSize: 11,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 10,
        textColor: this.colors.text
      },
      alternateRowStyles: {
        fillColor: this.colors.lightGray
      },
      margin: { left: this.margin, right: this.margin },
      tableWidth: 'auto',
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 60 },
        1: { halign: 'center', cellWidth: 30 },
        2: { cellWidth: 80 }
      }
    });

    this.currentY = (this.doc as any).lastAutoTable.finalY + 15;
  }

  private addScenarioSection(): void {
    if (!this.data.scenarios || this.data.scenarios.length === 0) return;

    this.addSectionTitle('Scenario Analysis');

    const scenarioData = [
      ['Scenario', 'IRR', 'Net Profit', 'Risk Level']
    ];

    this.data.scenarios.forEach(scenario => {
      const riskEmoji = scenario.riskLevel === 'low' ? '🟢' : 
                      scenario.riskLevel === 'medium' ? '🟡' : '🔴';
      
      scenarioData.push([
        scenario.name,
        `${scenario.irr.toFixed(1)}%`,
        `${(scenario.totalProfit / 1000000).toFixed(1)}M ${this.data.project.currency_code || 'AED'}`,
        `${riskEmoji} ${scenario.riskLevel.toUpperCase()}`
      ]);
    });

    this.doc.autoTable({
      startY: this.currentY,
      head: [scenarioData[0]],
      body: scenarioData.slice(1),
      theme: 'grid',
      headStyles: {
        fillColor: this.colors.secondary,
        textColor: 255,
        fontSize: 11,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 10,
        textColor: this.colors.text
      },
      margin: { left: this.margin, right: this.margin }
    });

    this.currentY = (this.doc as any).lastAutoTable.finalY + 15;
  }

  private addTimelineSection(): void {
    if (!this.data.milestones || this.data.milestones.length === 0) return;

    this.addSectionTitle('Project Timeline & Milestones');

    const timelineData = [
      ['Milestone', 'Target Date', 'Status', 'Description']
    ];

    this.data.milestones.forEach(milestone => {
      const statusEmoji = milestone.status === 'completed' ? '✅' : 
                         milestone.status === 'in-progress' ? '🔄' : '⏳';
      
      timelineData.push([
        milestone.label,
        format(new Date(milestone.target_date), 'MMM dd, yyyy'),
        `${statusEmoji} ${milestone.status}`,
        milestone.description || '-'
      ]);
    });

    this.doc.autoTable({
      startY: this.currentY,
      head: [timelineData[0]],
      body: timelineData.slice(1),
      theme: 'grid',
      headStyles: {
        fillColor: this.colors.success,
        textColor: 255,
        fontSize: 11,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 10,
        textColor: this.colors.text
      },
      margin: { left: this.margin, right: this.margin },
      columnStyles: {
        3: { cellWidth: 60 }
      }
    });

    this.currentY = (this.doc as any).lastAutoTable.finalY + 15;
  }

  private addContractorSection(): void {
    if (!this.data.contractors || this.data.contractors.length === 0) return;

    this.addSectionTitle('Vendor Risk Summary');

    const contractorData = [
      ['Contractor', 'Phase', 'Amount', 'Risk Rating', 'Status']
    ];

    this.data.contractors.forEach(contractor => {
      const riskEmoji = contractor.risk_rating === 'low' ? '🟢' : 
                       contractor.risk_rating === 'medium' ? '🟡' : '🔴';
      
      contractorData.push([
        contractor.name,
        contractor.phase,
        `${(contractor.amount / 1000000).toFixed(1)}M ${this.data.project.currency_code || 'AED'}`,
        `${riskEmoji} ${contractor.risk_rating.toUpperCase()}`,
        contractor.status
      ]);
    });

    this.doc.autoTable({
      startY: this.currentY,
      head: [contractorData[0]],
      body: contractorData.slice(1),
      theme: 'grid',
      headStyles: {
        fillColor: this.colors.warning,
        textColor: 255,
        fontSize: 11,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 10,
        textColor: this.colors.text
      },
      margin: { left: this.margin, right: this.margin }
    });

    this.currentY = (this.doc as any).lastAutoTable.finalY + 15;
  }

  private addComplianceSection(): void {
    if (!this.data.compliance) return;

    this.addSectionTitle('Compliance Summary');

    const textX = this.isRTL ? this.pageWidth - this.margin : this.margin;
    const textAlign = this.isRTL ? 'right' : 'left';

    // Escrow Settings
    if (this.data.compliance.escrow) {
      this.doc.setFontSize(12);
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(this.colors.text);
      this.doc.text('Escrow Configuration:', textX, this.currentY, { align: textAlign });
      this.currentY += 8;

      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'normal');
      
      const escrowData = [
        ['Setting', 'Value'],
        ['Status', this.data.compliance.escrow.enabled ? '✅ Enabled' : '❌ Disabled'],
        ['Escrow Percentage', `${this.data.compliance.escrow.percentage}%`],
        ['Release Trigger', this.data.compliance.escrow.triggerType.replace(/_/g, ' ').toUpperCase()],
        ['Release Threshold', `${this.data.compliance.escrow.releaseThreshold}%`],
        ['Trigger Details', this.data.compliance.escrow.triggerDetails || 'Standard release conditions']
      ];

      this.doc.autoTable({
        startY: this.currentY,
        head: [escrowData[0]],
        body: escrowData.slice(1),
        theme: 'grid',
        headStyles: {
          fillColor: '#3B82F6', // Blue
          textColor: 255,
          fontSize: 10,
          fontStyle: 'bold'
        },
        bodyStyles: {
          fontSize: 9,
          textColor: this.colors.text
        },
        margin: { left: this.margin, right: this.margin },
        tableWidth: 'auto',
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 50 },
          1: { cellWidth: 120 }
        }
      });

      this.currentY = (this.doc as any).lastAutoTable.finalY + 10;
    }

    // Zakat Settings
    if (this.data.compliance.zakat) {
      this.doc.setFontSize(12);
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(this.colors.text);
      this.doc.text('Zakat Configuration:', textX, this.currentY, { align: textAlign });
      this.currentY += 8;

      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'normal');
      
      const zakatData = [
        ['Setting', 'Value'],
        ['Status', this.data.compliance.zakat.applicable ? '✅ Applicable' : '❌ Not Applicable'],
        ['Zakat Rate', `${this.data.compliance.zakat.rate}%`],
        ['Calculation Method', this.data.compliance.zakat.calculationMethod.replace(/_/g, ' ').toUpperCase()],
        ['Exclude Losses', this.data.compliance.zakat.excludeLosses ? '✅ Yes' : '❌ No']
      ];

      this.doc.autoTable({
        startY: this.currentY,
        head: [zakatData[0]],
        body: zakatData.slice(1),
        theme: 'grid',
        headStyles: {
          fillColor: '#7C3AED', // Purple
          textColor: 255,
          fontSize: 10,
          fontStyle: 'bold'
        },
        bodyStyles: {
          fontSize: 9,
          textColor: this.colors.text
        },
        margin: { left: this.margin, right: this.margin },
        tableWidth: 'auto',
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 50 },
          1: { cellWidth: 120 }
        }
      });

      this.currentY = (this.doc as any).lastAutoTable.finalY + 10;
    }

    // Escrow Schedule
    if (this.data.compliance.escrowReleases && this.data.compliance.escrowReleases.length > 0) {
      this.checkPageBreak(40);
      
      this.doc.setFontSize(12);
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(this.colors.text);
      this.doc.text('Escrow Release Schedule:', textX, this.currentY, { align: textAlign });
      this.currentY += 8;

      const escrowScheduleData = [
        ['Release Date', 'Amount', 'Percentage', 'Trigger', 'Progress']
      ];

      this.data.compliance.escrowReleases.forEach(release => {
        escrowScheduleData.push([
          format(new Date(release.releaseDate), 'MMM dd, yyyy'),
          `${(release.releaseAmount / 1000000).toFixed(1)}M ${this.data.project.currency_code || 'AED'}`,
          `${release.releasePercentage}%`,
          release.triggerType.replace(/_/g, ' ').toUpperCase(),
          release.constructionProgress ? `${release.constructionProgress}%` : '-'
        ]);
      });

      this.doc.autoTable({
        startY: this.currentY,
        head: [escrowScheduleData[0]],
        body: escrowScheduleData.slice(1),
        theme: 'grid',
        headStyles: {
          fillColor: this.colors.success,
          textColor: 255,
          fontSize: 10,
          fontStyle: 'bold'
        },
        bodyStyles: {
          fontSize: 9,
          textColor: this.colors.text
        },
        margin: { left: this.margin, right: this.margin }
      });

      this.currentY = (this.doc as any).lastAutoTable.finalY + 15;
    }
  }

  private addInsightsSection(): void {
    if (!this.data.insights) return;

    this.addSectionTitle('AI Insights & Notes');

    if (this.data.insights.userNotes) {
      this.doc.setFontSize(12);
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(this.colors.text);
      
      const textX = this.isRTL ? this.pageWidth - this.margin : this.margin;
      const textAlign = this.isRTL ? 'right' : 'left';
      
      this.doc.text('User Notes:', textX, this.currentY, { align: textAlign });
      this.currentY += 8;

      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'normal');
      
      const notesLines = this.doc.splitTextToSize(
        this.data.insights.userNotes, 
        this.pageWidth - 2 * this.margin
      );
      
      notesLines.forEach((line: string) => {
        this.checkPageBreak(6);
        this.doc.text(line, textX, this.currentY, { align: textAlign });
        this.currentY += 5;
      });
      
      this.currentY += 10;
    }

    if (this.data.insights.generatedInsights) {
      this.doc.setFontSize(12);
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(this.colors.text);
      
      const textX = this.isRTL ? this.pageWidth - this.margin : this.margin;
      const textAlign = this.isRTL ? 'right' : 'left';
      
      this.doc.text('Generated Insights:', textX, this.currentY, { align: textAlign });
      this.currentY += 8;

      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'normal');
      
      const insightsText = JSON.stringify(this.data.insights.generatedInsights, null, 2);
      const insightsLines = this.doc.splitTextToSize(
        insightsText, 
        this.pageWidth - 2 * this.margin
      );
      
      insightsLines.forEach((line: string) => {
        this.checkPageBreak(6);
        this.doc.text(line, textX, this.currentY, { align: textAlign });
        this.currentY += 5;
      });
    }
  }

  public async generatePDF(): Promise<Blob> {
    // Add header to first page
    this.addHeader();
    
    // Add all sections
    this.addTitle();
    this.addKPISection();
    this.addScenarioSection();
    this.addTimelineSection();
    this.addContractorSection();
    this.addComplianceSection();
    this.addInsightsSection();
    
    // Add footer to all pages
    const pageCount = this.doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i);
      this.addFooter();
    }

    // Generate and return PDF blob
    return this.doc.output('blob');
  }

  public async downloadPDF(): Promise<void> {
    const blob = await this.generatePDF();
    const url = URL.createObjectURL(blob);
    
    // Create filename
    const timestamp = format(new Date(), 'yyyyMMdd_HHmm');
    const projectName = this.data.project.name.replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `feasly_export_${projectName}_${timestamp}.pdf`;
    
    // Download file
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}