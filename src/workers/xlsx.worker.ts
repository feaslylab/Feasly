// XLSX Export Worker for scenario comparison data
import * as XLSX from 'xlsx';

interface ComparisonData {
  projectName: string;
  comparisons: Array<{
    scenarioId: string;
    scenarioName: string;
    kpis: any;
    error?: string;
  }>;
}

interface WorkerMessage {
  type: 'generate';
  data: ComparisonData;
}

self.onmessage = (event: MessageEvent<WorkerMessage>) => {
  try {
    const { type, data } = event.data;
    
    if (type === 'generate') {
      console.log('Worker: Starting XLSX generation');
      
      const workbook = XLSX.utils.book_new();
      
      // Summary Sheet
      const summaryData = [
        ['Project', data.projectName],
        ['Generated', new Date().toISOString()],
        ['Scenarios Compared', data.comparisons.length],
        [],
        ['Scenario', 'NPV (AED)', 'IRR (%)', 'Equity Multiple', 'Payback (months)', 'Peak Funding (AED)']
      ];
      
      // Add each scenario's KPIs
      data.comparisons.forEach(comp => {
        if (comp.error) {
          summaryData.push([
            comp.scenarioName,
            'ERROR',
            'ERROR', 
            'ERROR',
            'ERROR',
            'ERROR'
          ]);
        } else {
          summaryData.push([
            comp.scenarioName,
            comp.kpis?.npv || 0,
            ((comp.kpis?.projectIRR || 0) * 100).toFixed(2),
            (comp.kpis?.equityMultiple || 0).toFixed(2),
            comp.kpis?.paybackMonths || 0,
            comp.kpis?.peakFunding || 0
          ]);
        }
      });
      
      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
      
      // Style the header row
      if (!summarySheet['!cols']) summarySheet['!cols'] = [];
      summarySheet['!cols'][0] = { width: 20 };
      summarySheet['!cols'][1] = { width: 15 };
      summarySheet['!cols'][2] = { width: 15 };
      summarySheet['!cols'][3] = { width: 15 };
      summarySheet['!cols'][4] = { width: 18 };
      summarySheet['!cols'][5] = { width: 20 };
      
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
      
      // Delta Analysis Sheet (if more than one scenario)
      if (data.comparisons.length > 1) {
        const baseScenario = data.comparisons[0];
        const deltaData = [
          ['Delta Analysis (vs Base Scenario: ' + baseScenario.scenarioName + ')'],
          [],
          ['Scenario', 'NPV Δ (AED)', 'NPV Δ (%)', 'IRR Δ (%)', 'Equity Multiple Δ', 'Payback Δ (months)']
        ];
        
        data.comparisons.slice(1).forEach(comp => {
          if (!comp.error && !baseScenario.error) {
            const npvDelta = (comp.kpis?.npv || 0) - (baseScenario.kpis?.npv || 0);
            const npvDeltaPct = baseScenario.kpis?.npv ? (npvDelta / baseScenario.kpis.npv * 100) : 0;
            const irrDelta = ((comp.kpis?.projectIRR || 0) - (baseScenario.kpis?.projectIRR || 0)) * 100;
            const equityDelta = (comp.kpis?.equityMultiple || 0) - (baseScenario.kpis?.equityMultiple || 0);
            const paybackDelta = (comp.kpis?.paybackMonths || 0) - (baseScenario.kpis?.paybackMonths || 0);
            
            deltaData.push([
              comp.scenarioName,
              npvDelta.toFixed(0),
              npvDeltaPct.toFixed(2) + '%',
              irrDelta.toFixed(2) + '%',
              equityDelta.toFixed(2),
              paybackDelta.toFixed(0)
            ]);
          } else {
            deltaData.push([
              comp.scenarioName,
              'ERROR',
              'ERROR',
              'ERROR', 
              'ERROR',
              'ERROR'
            ]);
          }
        });
        
        const deltaSheet = XLSX.utils.aoa_to_sheet(deltaData);
        
        // Style columns
        if (!deltaSheet['!cols']) deltaSheet['!cols'] = [];
        deltaSheet['!cols'][0] = { width: 20 };
        deltaSheet['!cols'][1] = { width: 15 };
        deltaSheet['!cols'][2] = { width: 15 };
        deltaSheet['!cols'][3] = { width: 15 };
        deltaSheet['!cols'][4] = { width: 18 };
        deltaSheet['!cols'][5] = { width: 18 };
        
        XLSX.utils.book_append_sheet(workbook, deltaSheet, 'Delta Analysis');
      }
      
      // Generate the file
      const excelBuffer = XLSX.write(workbook, { 
        bookType: 'xlsx', 
        type: 'array' 
      });
      
      console.log('Worker: XLSX generation complete');
      
      // Send back the file data
      self.postMessage({
        type: 'success',
        data: excelBuffer,
        filename: `${data.projectName.replace(/[^a-zA-Z0-9]/g, '_')}_comparison_${new Date().toISOString().split('T')[0]}.xlsx`
      });
      
    }
  } catch (error) {
    console.error('Worker: Error generating XLSX:', error);
    self.postMessage({
      type: 'error',
      error: error.message
    });
  }
};