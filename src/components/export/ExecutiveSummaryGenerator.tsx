import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useEngine, useEngineNumbers } from '@/lib/engine/EngineContext';
import { validateFeasibility, type FeasibilityResult } from '@/utils/validateFeasibility';
import { fmtCurrency, fmtPct, fmtMult } from '@/lib/formatters';
import { useMemo } from 'react';

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export function useExecutiveSummaryGenerator() {
  const { inputs } = useEngine();
  const numbers = useEngineNumbers();
  const feasibility = useMemo(() => validateFeasibility(inputs), [inputs]);

  const generateExecutiveSummaryPDF = () => {
    // Access the raw form data from the engine inputs
    const rawInputs = (inputs as any);
    
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
    const projectName = rawInputs.project?.developer_name || 'Real Estate Development Project';
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
    doc.text(`Executive Summary Report`, 20, 100);
    doc.text(`Generated: ${today}`, 20, 115);

    // Feasibility Grade Badge
    const grade = feasibility.grade;
    const gradeColors: Record<string, [number, number, number]> = {
      A: [34, 197, 94],   // green
      B: [59, 130, 246],  // blue  
      C: [245, 158, 11],  // yellow
      D: [239, 68, 68]    // red
    };
    
    const gradeColor = gradeColors[grade] || [156, 163, 175];
    doc.setFillColor(gradeColor[0], gradeColor[1], gradeColor[2]);
    doc.roundedRect(20, 130, 40, 15, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text(`Grade ${grade}`, 22, 140);
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, 'normal');

    // Footer
    doc.setFontSize(10);
    doc.text('Generated using Feasly - Professional Real Estate Analysis', 20, pageHeight - 20);

    // EXECUTIVE KPIS
    addSection('Executive KPIs', 20);

    const eq = numbers?.equity;
    const kpiData = [
      ['Metric', 'Value', 'Status'],
      ['IRR (Annual)', fmtPct(eq?.kpis?.irr_pa || 0), eq?.kpis?.irr_pa > 0.15 ? '✓ Good' : '⚠ Review'],
      ['NPV', fmtCurrency(eq?.kpis?.npv || 0, rawInputs.project?.currency), eq?.kpis?.npv > 0 ? '✓ Positive' : '✗ Negative'],
      ['Equity Multiple', fmtMult(eq?.kpis?.equity_multiple || 0), eq?.kpis?.equity_multiple > 1.5 ? '✓ Good' : '⚠ Review'],
      ['Total Project Value', fmtCurrency(eq?.kpis?.project_value || 0, rawInputs.project?.currency), '—'],
      ['Total Cost', fmtCurrency(eq?.kpis?.total_cost || 0, rawInputs.project?.currency), '—'],
      ['Profit Margin', fmtPct(eq?.kpis?.profit_pct || 0), eq?.kpis?.profit_pct > 0.2 ? '✓ Healthy' : '⚠ Review']
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

    // FEASIBILITY ASSESSMENT
    addSection('Feasibility Assessment');

    doc.setFontSize(12);
    doc.text(`Overall Grade: ${grade}`, 20, yPosition);
    yPosition += 10;
    doc.text(`Assessment: ${feasibility.summary}`, 20, yPosition);
    yPosition += 15;

    const errorCount = feasibility.warnings.filter(w => w.severity === 'error').length;
    const warningCount = feasibility.warnings.filter(w => w.severity === 'warning').length;
    
    doc.text(`Issues Identified: ${errorCount} errors, ${warningCount} warnings`, 20, yPosition);
    yPosition += 20;

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

    // WARNINGS & VALIDATION ISSUES
    if (feasibility.warnings.length > 0) {
      addSection('Issues & Recommendations');

      const warningsByLocation = feasibility.warnings.reduce((acc, warning) => {
        const location = warning.location || 'general';
        if (!acc[location]) acc[location] = [];
        acc[location].push(warning);
        return acc;
      }, {} as Record<string, typeof feasibility.warnings>);

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

    assumptions.forEach(assumption => {
      addNewPageIf(10);
      doc.text(`• ${assumption}`, 25, yPosition);
      yPosition += 8;
    });

    // Generate filename and download
    const projectNameForFile = (rawInputs.project?.developer_name || 'Project').replace(/[^a-zA-Z0-9]/g, '_');
    const dateStr = today.replace(/\//g, '-');
    const filename = `Feasly_Report_${projectNameForFile}_${dateStr}.pdf`;

    doc.save(filename);
  };

  return {
    generateExecutiveSummaryPDF,
    feasibility,
    isDataAvailable: Boolean(inputs.project || inputs.unit_types?.length || inputs.cost_items?.length)
  };
}