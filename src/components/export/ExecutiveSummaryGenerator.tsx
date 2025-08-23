import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useEngine, useEngineNumbers } from '@/lib/engine/EngineContext';
import { validateFeasibility, type FeasibilityResult } from '@/utils/validateFeasibility';
import { fmtCurrency, fmtPct, fmtMult } from '@/lib/formatters';
import { ConsolidatedResult } from '@/types/consolidation';
import { KPIMetrics } from '@/components/results/KPIOverviewPanel';
import { useToast } from '@/hooks/use-toast';
import { useMemo } from 'react';

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

interface ExecutiveSummaryProps {
  project?: any;
  inputs?: any;
  kpis?: KPIMetrics;
  feasibility?: FeasibilityResult;
  consolidatedResult?: ConsolidatedResult;
}

export function useExecutiveSummaryGenerator(props?: ExecutiveSummaryProps) {
  const { inputs } = useEngine();
  const numbers = useEngineNumbers();
  const feasibility = useMemo(() => validateFeasibility(inputs), [inputs]);
  const { toast } = useToast();

  const generateExecutiveSummaryPDF = (customProps?: ExecutiveSummaryProps) => {
    // Use provided props or fallback to defaults
    const effectiveProps = customProps || props || {};
    const {
      project: customProject,
      inputs: customInputs,
      kpis: customKpis,
      consolidatedResult
    } = effectiveProps;

    // Access the raw form data from the engine inputs or custom inputs
    const rawInputs = customInputs || (inputs as any);
    
    // Early exit if consolidation project but no result
    if (rawInputs.project?.project_type === 'consolidation' && !consolidatedResult) {
      toast({
        title: 'Missing Data',
        description: 'No consolidated result found for portfolio project.',
        variant: 'destructive'
      });
      return;
    }

    // Use consolidated metrics if available, otherwise fall back to regular metrics
    const effectiveKPIs = consolidatedResult?.totals ?? customKpis ?? numbers?.equity?.kpis;
    const effectiveWarnings = consolidatedResult?.warnings ?? feasibility?.warnings ?? [];
    const isConsolidated = Boolean(consolidatedResult);
    
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    let yPosition = 20;

    // Helper functions
    const addNewPageIf = (requiredHeight: number) => {
      if (yPosition + requiredHeight > pageHeight - 20) {
        doc.addPage();
        yPosition = 20;
      }
    };

    const addSection = (title: string, spacing = 10) => {
      addNewPageIf(30);
      yPosition += spacing;
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text(title, 20, yPosition);
      doc.setLineWidth(0.5);
      doc.line(20, yPosition + 2, pageWidth - 20, yPosition + 2);
      yPosition += 15;
      doc.setFont(undefined, 'normal');
    };

    // COVER PAGE
    doc.setFontSize(24);
    doc.setFont(undefined, 'bold');
    const projectName = rawInputs.project?.developer_name || 
      (isConsolidated ? 'Consolidated Portfolio Analysis' : 'Real Estate Development Project');
    doc.text(projectName, 20, 40);

    doc.setFontSize(16);
    doc.setFont(undefined, 'normal');
    if (rawInputs.project?.project_location) {
      doc.text(`Location: ${rawInputs.project.project_location}`, 20, 60);
    }
    if (rawInputs.project?.developer_name) {
      doc.text(`Developer: ${rawInputs.project.developer_name}`, 20, 75);
    }

    doc.setFontSize(12);
    const today = new Date().toLocaleDateString();
    const reportType = isConsolidated ? 'Consolidated Portfolio Report' : 'Executive Summary Report';
    doc.text(reportType, 20, 100);
    doc.text(`Generated: ${today}`, 20, 115);
    if (isConsolidated && consolidatedResult) {
      doc.text(`Projects: ${consolidatedResult.children.length}`, 20, 130);
      doc.text(`Weighting: ${consolidatedResult.consolidationSettings.weightingMethod}`, 20, 145);
    }

    // Feasibility Grade Badge (skip for consolidated)
    if (!isConsolidated) {
      const grade = feasibility.grade;
      const gradeColors: Record<string, [number, number, number]> = {
        A: [34, 197, 94],   // green
        B: [59, 130, 246],  // blue  
        C: [245, 158, 11],  // yellow
        D: [239, 68, 68]    // red
      };
      
      const gradeColor = gradeColors[grade] || [156, 163, 175];
      doc.setFillColor(gradeColor[0], gradeColor[1], gradeColor[2]);
      doc.roundedRect(20, 160, 40, 15, 3, 3, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text(`Grade ${grade}`, 22, 170);
      doc.setTextColor(0, 0, 0);
      doc.setFont(undefined, 'normal');
    }

    // Footer
    doc.setFontSize(10);
    doc.text('Generated using Feasly - Professional Real Estate Analysis', 20, pageHeight - 20);

    // EXECUTIVE KPIS
    const kpiTitle = isConsolidated ? 'Portfolio KPIs' : 'Executive KPIs';
    addSection(kpiTitle, 20);

    // Use effective KPIs for the table
    const kpiData = [
      ['Metric', 'Value'],
      ['NPV', fmtCurrency(effectiveKPIs?.npv || 0, rawInputs.project?.currency || 'AED')],
      ['IRR', fmtPct(effectiveKPIs?.irr_pa || 0)],
      ['Equity Multiple', fmtMult(effectiveKPIs?.equity_multiple || 0)],
      ['ROI', fmtPct(effectiveKPIs?.roi || 0)],
      ['Profit Margin', fmtPct(effectiveKPIs?.profit_pct || 0)],
      ['Total Cost', fmtCurrency(effectiveKPIs?.total_cost || 0, rawInputs.project?.currency || 'AED')],
      ['Project Value', fmtCurrency(effectiveKPIs?.project_value || 0, rawInputs.project?.currency || 'AED')]
    ];

    doc.autoTable({
      startY: yPosition,
      head: [kpiData[0]],
      body: kpiData.slice(1),
      theme: 'grid',
      headStyles: { fillColor: [71, 85, 105] },
      margin: { left: 20, right: 20 }
    });

    yPosition = (doc as any).lastAutoTable.finalY + 20;

    // PORTFOLIO BREAKDOWN (only for consolidated projects)
    if (consolidatedResult) {
      addSection('Portfolio Breakdown');

      const breakdown = [
        ['Project', 'NPV', 'IRR', 'Equity', 'Revenue', 'GFA (sqm)', 'Weight'],
        ...consolidatedResult.children.map(child => [
          child.name,
          fmtCurrency(child.metrics.npv, rawInputs.project?.currency || 'AED'),
          fmtPct(child.metrics.irr_pa || 0),
          fmtCurrency(child.contribution.equity, rawInputs.project?.currency || 'AED'),
          fmtCurrency(child.contribution.revenue, rawInputs.project?.currency || 'AED'),
          `${child.contribution.gfa?.toLocaleString() || 'N/A'}`,
          fmtPct(child.weight || 0)
        ])
      ];

      doc.autoTable({
        startY: yPosition,
        head: [breakdown[0]],
        body: breakdown.slice(1),
        theme: 'striped',
        headStyles: { fillColor: [71, 85, 105] },
        margin: { left: 20, right: 20 }
      });

      yPosition = (doc as any).lastAutoTable.finalY + 20;
      
      // Portfolio Summary
      addNewPageIf(80);
      doc.setFontSize(11);
      doc.setFont(undefined, 'bold');
      doc.text('Portfolio Summary:', 20, yPosition);
      yPosition += 10;
      doc.setFont(undefined, 'normal');
      doc.text(`Total Projects: ${consolidatedResult.children.length}`, 25, yPosition);
      yPosition += 8;
      doc.text(`Weighting Method: ${consolidatedResult.consolidationSettings.weightingMethod}`, 25, yPosition);
      yPosition += 8;
      doc.text(`Total Revenue: ${fmtCurrency(consolidatedResult.aggregationBreakdown.totalRevenue, rawInputs.project?.currency || 'AED')}`, 25, yPosition);
      yPosition += 8;
      doc.text(`Total Equity: ${fmtCurrency(consolidatedResult.aggregationBreakdown.totalEquity, rawInputs.project?.currency || 'AED')}`, 25, yPosition);
      yPosition += 8;
      if (consolidatedResult.aggregationBreakdown.totalGFA) {
        doc.text(`Total GFA: ${consolidatedResult.aggregationBreakdown.totalGFA.toLocaleString()} sqm`, 25, yPosition);
        yPosition += 8;
      }
      yPosition += 20;
    }

    // FEASIBILITY ASSESSMENT (skip detailed assessment for consolidated)
    if (!isConsolidated) {
      addSection('Feasibility Assessment');

      const grade = feasibility.grade;
      doc.setFontSize(12);
      doc.text(`Overall Grade: ${grade}`, 20, yPosition);
      yPosition += 10;
      doc.text(`Assessment: ${feasibility.summary}`, 20, yPosition);
      yPosition += 15;

      const errorCount = feasibility.warnings.filter(w => w.severity === 'error').length;
      const warningCount = feasibility.warnings.filter(w => w.severity === 'warning').length;
      
      doc.text(`Issues Identified: ${errorCount} errors, ${warningCount} warnings`, 20, yPosition);
      yPosition += 20;
    }

    // DETAILED SECTIONS (skip for consolidated projects)
    if (!isConsolidated) {
      // COST SUMMARY
      addSection('Cost Summary');

      const costItems = inputs.cost_items || [];
      const costSummaryData = [
        ['Item', 'Category', 'Amount', 'Duration (mo)', 'Start (mo)']
      ];

      costItems.forEach((item: any) => {
        costSummaryData.push([
          item.key || item.label || 'Unnamed',
          'cost',
          fmtCurrency(item.base_amount || 0, rawInputs.project?.currency),
          'N/A',
          'N/A'
        ]);
      });

      if (costSummaryData.length > 1) {
        doc.autoTable({
          startY: yPosition,
          head: [costSummaryData[0]],
          body: costSummaryData.slice(1),
          theme: 'striped',
          headStyles: { fillColor: [71, 85, 105] },
          margin: { left: 20, right: 20 }
        });

        yPosition = (doc as any).lastAutoTable.finalY + 10;
      }

      // Cost totals by category - simplified for engine data
      const totalCost = costItems.reduce((sum: number, item: any) => sum + (item.base_amount || 0), 0);

      if (totalCost > 0) {
        addNewPageIf(40);
        doc.setFontSize(11);
        doc.setFont(undefined, 'bold');
        doc.text(`Total Project Cost: ${fmtCurrency(totalCost, rawInputs.project?.currency)}`, 20, yPosition);
        yPosition += 20;
      }

      // UNIT MIX & REVENUE
      addSection('Unit Mix & Revenue');

      const unitTypes = inputs.unit_types || [];
      const unitData = [
        ['Name', 'Units', 'Area (sqm)', 'Mode', 'Price/Rent', 'Total Revenue']
      ];

      let totalGFA = 0;
      let totalRevenue = 0;

      unitTypes.forEach((unit: any) => {
        const gfa = (unit.count || 0) * (unit.sellable_area_sqm || 0);
        totalGFA += gfa;

        let revenue = 0;
        let priceDisplay = '';

        // Estimate revenue from unit data
        revenue = (unit.initial_price_sqm_sale || 0) * gfa + (unit.initial_rent_sqm_m || 0) * gfa * 12;
        priceDisplay = unit.initial_price_sqm_sale > 0 ? 
          fmtCurrency(unit.initial_price_sqm_sale, rawInputs.project?.currency) + '/sqm' :
          fmtCurrency(unit.initial_rent_sqm_m || 0, rawInputs.project?.currency) + '/sqm/mo';

        totalRevenue += revenue;

        unitData.push([
          unit.key || 'Unnamed',
          (unit.count || 0).toString(),
          (unit.sellable_area_sqm || 0).toLocaleString(),
          unit.category || 'residential',
          priceDisplay,
          fmtCurrency(revenue, rawInputs.project?.currency)
        ]);
      });

      if (unitData.length > 1) {
        doc.autoTable({
          startY: yPosition,
          head: [unitData[0]],
          body: unitData.slice(1),
          theme: 'striped',
          headStyles: { fillColor: [71, 85, 105] },
          margin: { left: 20, right: 20 }
        });

        yPosition = (doc as any).lastAutoTable.finalY + 10;
      }

      // Unit summary
      addNewPageIf(40);
      doc.setFontSize(11);
      doc.setFont(undefined, 'bold');
      doc.text('Summary:', 20, yPosition);
      yPosition += 10;
      doc.setFont(undefined, 'normal');
      doc.text(`Total GFA: ${totalGFA.toLocaleString()} sqm`, 25, yPosition);
      yPosition += 8;
      doc.text(`Gross Revenue: ${fmtCurrency(totalRevenue, rawInputs.project?.currency)}`, 25, yPosition);
      yPosition += 8;
      if (totalGFA > 0) {
        doc.text(`Avg Price/sqm: ${fmtCurrency(totalRevenue / totalGFA, rawInputs.project?.currency)}`, 25, yPosition);
      }
      yPosition += 20;

      // CAPITAL STACK
      addSection('Capital Stack');

      const financingSlices = inputs.financing_slices || [];
      const capitalData = [
        ['Type', 'Label', 'Amount', 'Interest %', 'Tenor (mo)', 'DSCR']
      ];

      let totalDebt = 0;
      let totalEquity = 0;

      financingSlices.forEach((slice: any) => {
        const amount = slice.amount || 0;
        if (slice.type === 'equity') {
          totalEquity += amount;
        } else {
          totalDebt += amount;
        }

        capitalData.push([
          slice.type?.replace('_', ' ') || 'Unknown',
          slice.label || 'Unnamed',
          fmtCurrency(amount, rawInputs.project?.currency),
          slice.interest_rate ? fmtPct(slice.interest_rate) : '—',
          slice.tenor_months?.toString() || '—',
          slice.dscr_min?.toFixed(2) || '—'
        ]);
      });

      if (capitalData.length > 1) {
        doc.autoTable({
          startY: yPosition,
          head: [capitalData[0]],
          body: capitalData.slice(1),
          theme: 'striped',
          headStyles: { fillColor: [71, 85, 105] },
          margin: { left: 20, right: 20 }
        });

        yPosition = (doc as any).lastAutoTable.finalY + 10;
      }

      // Capital stack summary
      const totalCapital = totalDebt + totalEquity;
      if (totalCapital > 0) {
        addNewPageIf(60);
        doc.setFontSize(11);
        doc.setFont(undefined, 'bold');
        doc.text('Capital Structure:', 20, yPosition);
        yPosition += 10;
        doc.setFont(undefined, 'normal');
        doc.text(`Total Debt: ${fmtCurrency(totalDebt, rawInputs.project?.currency)} (${fmtPct(totalDebt / totalCapital)})`, 25, yPosition);
        yPosition += 8;
        doc.text(`Total Equity: ${fmtCurrency(totalEquity, rawInputs.project?.currency)} (${fmtPct(totalEquity / totalCapital)})`, 25, yPosition);
        yPosition += 8;
        doc.text(`Total Capital: ${fmtCurrency(totalCapital, rawInputs.project?.currency)}`, 25, yPosition);
        yPosition += 20;
      }
    } // End of non-consolidated sections

    // WARNINGS & VALIDATION ISSUES
    if (effectiveWarnings.length > 0) {
      const sectionTitle = isConsolidated ? 'Portfolio Issues & Recommendations' : 'Issues & Recommendations';
      addSection(sectionTitle);

      if (isConsolidated && consolidatedResult) {
        // Group warnings by project for consolidated reports
        const projectWarnings = consolidatedResult.children.reduce((acc, child) => {
          if (child.warnings && child.warnings.length > 0) {
            acc[child.name] = child.warnings;
          }
          return acc;
        }, {} as Record<string, any[]>);

        // Add portfolio-level warnings
        if (consolidatedResult.warnings.length > 0) {
          projectWarnings['Portfolio'] = consolidatedResult.warnings;
        }

        Object.entries(projectWarnings).forEach(([projectName, warnings]) => {
          addNewPageIf(30 + warnings.length * 10);
          
          doc.setFontSize(12);
          doc.setFont(undefined, 'bold');
          doc.text(projectName, 20, yPosition);
          yPosition += 10;
          doc.setFont(undefined, 'normal');
          doc.setFontSize(10);

          warnings.forEach(warning => {
            const icon = warning.type === 'error' ? '✗' : warning.type === 'warning' ? '⚠' : 'ℹ';
            const color: [number, number, number] = warning.type === 'error' ? [239, 68, 68] : warning.type === 'warning' ? [245, 158, 11] : [59, 130, 246];
            
            doc.setTextColor(color[0], color[1], color[2]);
            doc.text(icon, 25, yPosition);
            doc.setTextColor(0, 0, 0);
            doc.text(warning.message, 35, yPosition);
            yPosition += 8;
          });
          yPosition += 10;
        });
      } else {
        // Regular warnings for single projects
        const warningsByLocation = effectiveWarnings.reduce((acc, warning) => {
          const location = warning.location || 'general';
          if (!acc[location]) acc[location] = [];
          acc[location].push(warning);
          return acc;
        }, {} as Record<string, typeof effectiveWarnings>);

        Object.entries(warningsByLocation).forEach(([location, warnings]) => {
          addNewPageIf(30 + warnings.length * 10);
          
          const locationLabel = {
            project: 'Project Setup',
            costs: 'Cost Items', 
            revenue: 'Revenue & Units',
            financing: 'Financing',
            general: 'General'
          }[location] || location;

          doc.setFontSize(12);
          doc.setFont(undefined, 'bold');
          doc.text(locationLabel, 20, yPosition);
          yPosition += 10;
          doc.setFont(undefined, 'normal');
          doc.setFontSize(10);

          warnings.forEach(warning => {
            const icon = warning.severity === 'error' ? '✗' : warning.severity === 'warning' ? '⚠' : 'ℹ';
            const color: [number, number, number] = warning.severity === 'error' ? [239, 68, 68] : warning.severity === 'warning' ? [245, 158, 11] : [59, 130, 246];
            
            doc.setTextColor(color[0], color[1], color[2]);
            doc.text(icon, 25, yPosition);
            doc.setTextColor(0, 0, 0);
            doc.text(warning.message, 35, yPosition);
            yPosition += 8;
          });
          yPosition += 10;
        });
      }
    }

    // APPENDIX
    addSection('Technical Assumptions');

    doc.setFontSize(10);
    const assumptions = [
      `Project Duration: ${rawInputs.project?.duration_months || rawInputs.project?.periods || 'N/A'} months`,
      `Currency: ${rawInputs.project?.currency || 'AED'}`,
      `Periodicity: ${rawInputs.project?.periodicity || 'Monthly'}`,
      `Project Type: ${rawInputs.project?.project_type || 'Not specified'}`,
      `Analysis Date: ${today}`,
      'VAT: As configured per item',
      'All figures are estimates based on current inputs'
    ];

    if (isConsolidated && consolidatedResult) {
      assumptions.push(`Portfolio Projects: ${consolidatedResult.children.length}`);
      assumptions.push(`Weighting Method: ${consolidatedResult.consolidationSettings.weightingMethod}`);
    }

    assumptions.forEach(assumption => {
      addNewPageIf(10);
      doc.text(`• ${assumption}`, 25, yPosition);
      yPosition += 8;
    });

    // Generate filename and download
    const projectNameForFile = (rawInputs.project?.developer_name || 
      (isConsolidated ? 'Portfolio' : 'Project')).replace(/[^a-zA-Z0-9]/g, '_');
    const dateStr = today.replace(/\//g, '-');
    const reportPrefix = isConsolidated ? 'Portfolio_Report' : 'Feasly_Report';
    const filename = `${reportPrefix}_${projectNameForFile}_${dateStr}.pdf`;

    doc.save(filename);
  };

  return {
    generateExecutiveSummaryPDF,
    feasibility,
    isDataAvailable: Boolean(inputs.project || inputs.unit_types?.length || inputs.cost_items?.length)
  };
}