import { supabase } from "@/integrations/supabase/client";
import type { FeaslyModelFormData } from "@/components/FeaslyModel/types";
import type { CashflowGrid, MonthlyCashflow } from "./types";
import { buildScenarioGrid, getScenarioMultipliers } from "./scenarioBuilder";

/**
 * Main function to generate complete cashflow grid for all scenarios
 */
export async function generateCashflowGrid(
  input: FeaslyModelFormData,
  projectId: string,
  versionLabel?: string
): Promise<CashflowGrid> {
  const scenarios = ['base', 'optimistic', 'pessimistic', 'custom'] as const;
  const grid: CashflowGrid = {
    base: [],
    optimistic: [],
    pessimistic: [],
    custom: [],
    version_label: versionLabel || `v${Date.now()}`,
  };
  
  // Generate cashflow for each scenario
  for (const scenario of scenarios) {
    const multipliers = getScenarioMultipliers(scenario);
    grid[scenario] = buildScenarioGrid(input, multipliers, projectId);
  }
  
  // Store in database
  await saveCashflowToDatabase(projectId, grid);
  
  return grid;
}

/**
 * Save cashflow grid to Supabase database
 */
export async function saveCashflowToDatabase(
  projectId: string,
  grid: CashflowGrid
): Promise<void> {
  try {
    const versionLabel = grid.version_label || `v${Date.now()}`;
    
    // Mark all previous versions as not latest
    await supabase
      .from('feasly_cashflows')
      .update({ is_latest: false })
      .eq('project_id', projectId);
    
    // Prepare data for insertion
    const records: any[] = [];
    
    Object.entries(grid).forEach(([scenario, cashflows]) => {
      if (scenario === 'version_label') return; // Skip version_label property
      
      const cashflowArray = cashflows as MonthlyCashflow[];
      cashflowArray.forEach(cashflow => {
        records.push({
          project_id: projectId,
          scenario,
          month: cashflow.month,
          construction_cost: cashflow.constructionCost,
          land_cost: cashflow.landCost,
          soft_costs: cashflow.softCosts,
          loan_drawn: cashflow.loanDrawn,
          loan_interest: cashflow.loanInterest,
          loan_repayment: cashflow.loanRepayment,
          equity_injected: cashflow.equityInjected,
          revenue: cashflow.revenue,
          profit: cashflow.profit,
          net_cashflow: cashflow.netCashflow,
          cash_balance: cashflow.cashBalance,
          zakat_due: cashflow.zakatDue,
          vat_on_costs: cashflow.vatOnCosts,
          vat_recoverable: cashflow.vatRecoverable,
          escrow_reserved: cashflow.escrowReserved,
          escrow_released: cashflow.escrowReleased,
          version_label: versionLabel,
          is_latest: true,
          revenue_residential: cashflow.revenueResidential,
          revenue_retail: cashflow.revenueRetail,
          revenue_office: cashflow.revenueOffice,
        });
      });
    });
    
    // Insert new data
    const { error } = await supabase
      .from('feasly_cashflows')
      .insert(records);
    
    if (error) {
      console.error('Error saving cashflow data:', error);
      throw error;
    }
  } catch (error) {
    console.error('Failed to save cashflow data:', error);
    throw error;
  }
}

/**
 * Load cashflow grid from database
 */
export async function loadCashflowFromDatabase(
  projectId: string,
  versionLabel?: string
): Promise<CashflowGrid | null> {
  try {
    let query = supabase
      .from('feasly_cashflows')
      .select('*')
      .eq('project_id', projectId);
    
    if (versionLabel) {
      query = query.eq('version_label', versionLabel);
    } else {
      query = query.eq('is_latest', true);
    }
    
    const { data, error } = await query.order('month');
    
    if (error) {
      console.error('Error loading cashflow data:', error);
      return null;
    }
    
    if (!data || data.length === 0) {
      return null;
    }
    
    // Group by scenario
    const grid: CashflowGrid = {
      base: [],
      optimistic: [],
      pessimistic: [],
      custom: [],
      version_label: data[0]?.version_label || undefined,
    };
    
    data.forEach(record => {
      const cashflow: MonthlyCashflow = {
        month: record.month,
        constructionCost: Number(record.construction_cost),
        landCost: Number(record.land_cost),
        softCosts: Number(record.soft_costs),
        loanDrawn: Number(record.loan_drawn),
        loanInterest: Number(record.loan_interest),
        loanRepayment: Number(record.loan_repayment),
        equityInjected: Number(record.equity_injected),
        revenue: Number(record.revenue),
        profit: Number(record.profit),
        netCashflow: Number(record.net_cashflow),
        cashBalance: Number(record.cash_balance),
        zakatDue: Number(record.zakat_due),
        vatOnCosts: Number(record.vat_on_costs || 0),
        vatRecoverable: Number(record.vat_recoverable || 0),
        escrowReserved: Number(record.escrow_reserved || 0),
        escrowReleased: Number(record.escrow_released || 0),
        // Revenue breakdown by segment (fallback to 0 if columns don't exist yet)
        revenueResidential: Number((record as any).revenue_residential || 0),
        revenueRetail: Number((record as any).revenue_retail || 0),
        revenueOffice: Number((record as any).revenue_office || 0),
      };
      
      const scenarioKey = record.scenario as 'base' | 'optimistic' | 'pessimistic' | 'custom';
      if (scenarioKey in grid && Array.isArray(grid[scenarioKey])) {
        (grid[scenarioKey] as MonthlyCashflow[]).push(cashflow);
      }
    });
    
    return grid;
  } catch (error) {
    console.error('Failed to load cashflow data:', error);
    return null;
  }
}

/**
 * Get list of available versions for a project
 */
export async function getProjectVersions(projectId: string): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('feasly_cashflows')
      .select('version_label')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error loading project versions:', error);
      return [];
    }
    
    // Get unique version labels
    const versions = [...new Set(data?.map(row => row.version_label).filter(Boolean) || [])];
    return versions;
  } catch (error) {
    console.error('Failed to load project versions:', error);
    return [];
  }
}