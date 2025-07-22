// Escrow and Zakat calculation utilities for Saudi compliance

export interface EscrowConfig {
  enabled: boolean;
  percentage: number;
  triggerType: 'construction_percent' | 'month_based' | 'milestone_based';
  triggerDetails: string;
  releaseThreshold: number;
}

export interface ZakatConfig {
  applicable: boolean;
  rate: number;
  calculationMethod: 'net_profit' | 'gross_revenue' | 'asset_value';
  excludeLosses: boolean;
}

export interface EscrowRelease {
  id: string;
  projectId: string;
  releaseDate: Date;
  releaseAmount: number;
  releasePercentage: number;
  triggerType: string;
  triggerDetails: string;
  constructionProgress?: number;
  milestoneAchieved?: string;
  isProjected: boolean;
}

export interface ZakatCalculation {
  id: string;
  projectId: string;
  period: string;
  periodStart: Date;
  periodEnd: Date;
  taxableBase: number;
  zakatRate: number;
  zakatAmount: number;
  calculationMethod: string;
  adjustments: Record<string, any>;
  isFinal: boolean;
}

// Escrow calculation engine
export class EscrowCalculator {
  static calculateEscrowAmount(revenue: number, escrowPercentage: number): number {
    return revenue * (escrowPercentage / 100);
  }

  static calculateEscrowRelease(
    totalEscrow: number, 
    config: EscrowConfig,
    currentProgress: {
      constructionPercent?: number;
      currentMonth?: number;
      completedMilestones?: string[];
    }
  ): { releaseAmount: number; releasePercentage: number; canRelease: boolean } {
    let canRelease = false;
    let releasePercentage = 0;

    switch (config.triggerType) {
      case 'construction_percent':
        if (currentProgress.constructionPercent && currentProgress.constructionPercent >= config.releaseThreshold) {
          canRelease = true;
          releasePercentage = Math.min(100, currentProgress.constructionPercent);
        }
        break;
      
      case 'month_based':
        if (currentProgress.currentMonth && currentProgress.currentMonth >= config.releaseThreshold) {
          canRelease = true;
          releasePercentage = 100; // Full release on reaching target month
        }
        break;
      
      case 'milestone_based':
        if (currentProgress.completedMilestones?.includes(config.triggerDetails)) {
          canRelease = true;
          releasePercentage = 100; // Full release on milestone completion
        }
        break;
    }

    const releaseAmount = canRelease ? (totalEscrow * releasePercentage / 100) : 0;

    return {
      releaseAmount,
      releasePercentage,
      canRelease
    };
  }

  static projectEscrowSchedule(
    totalRevenue: number,
    config: EscrowConfig,
    projectTimeline: { startDate: Date; durationMonths: number }
  ): EscrowRelease[] {
    const escrowAmount = this.calculateEscrowAmount(totalRevenue, config.percentage);
    const releases: Partial<EscrowRelease>[] = [];

    switch (config.triggerType) {
      case 'construction_percent':
        // Create releases at 25%, 50%, 75%, 100% construction
        [25, 50, 75, 100].forEach(percent => {
          const estimatedMonth = Math.floor((percent / 100) * projectTimeline.durationMonths);
          const releaseDate = new Date(projectTimeline.startDate);
          releaseDate.setMonth(releaseDate.getMonth() + estimatedMonth);
          
          releases.push({
            releaseDate,
            releaseAmount: escrowAmount * 0.25, // Equal releases
            releasePercentage: 25,
            triggerType: 'construction_percent',
            triggerDetails: `${percent}% construction complete`,
            constructionProgress: percent,
            isProjected: true
          });
        });
        break;

      case 'month_based':
        const releaseMonth = Math.floor(config.releaseThreshold);
        const releaseDate = new Date(projectTimeline.startDate);
        releaseDate.setMonth(releaseDate.getMonth() + releaseMonth);
        
        releases.push({
          releaseDate,
          releaseAmount: escrowAmount,
          releasePercentage: 100,
          triggerType: 'month_based',
          triggerDetails: `Month ${releaseMonth}`,
          isProjected: true
        });
        break;

      case 'milestone_based':
        // Single release on milestone completion (estimated at 75% of project)
        const estimatedMonth = Math.floor(0.75 * projectTimeline.durationMonths);
        const milestoneDate = new Date(projectTimeline.startDate);
        milestoneDate.setMonth(milestoneDate.getMonth() + estimatedMonth);
        
        releases.push({
          releaseDate: milestoneDate,
          releaseAmount: escrowAmount,
          releasePercentage: 100,
          triggerType: 'milestone_based',
          triggerDetails: config.triggerDetails,
          milestoneAchieved: config.triggerDetails,
          isProjected: true
        });
        break;
    }

    return releases as EscrowRelease[];
  }
}

// Zakat calculation engine
export class ZakatCalculator {
  static calculateZakatAmount(
    taxableBase: number, 
    config: ZakatConfig,
    projectFinancials: {
      totalRevenue: number;
      totalCosts: number;
      netProfit: number;
      assetValue: number;
    }
  ): { zakatAmount: number; taxableBase: number; effectiveRate: number } {
    if (!config.applicable) {
      return { zakatAmount: 0, taxableBase: 0, effectiveRate: 0 };
    }

    let calculatedTaxableBase = 0;

    switch (config.calculationMethod) {
      case 'net_profit':
        calculatedTaxableBase = Math.max(0, projectFinancials.netProfit);
        if (config.excludeLosses && projectFinancials.netProfit < 0) {
          calculatedTaxableBase = 0;
        }
        break;
      
      case 'gross_revenue':
        calculatedTaxableBase = projectFinancials.totalRevenue;
        break;
      
      case 'asset_value':
        calculatedTaxableBase = projectFinancials.assetValue;
        break;
    }

    const zakatAmount = calculatedTaxableBase * (config.rate / 100);

    return {
      zakatAmount,
      taxableBase: calculatedTaxableBase,
      effectiveRate: config.rate
    };
  }

  static calculateMonthlyZakat(
    monthlyProfit: number,
    config: ZakatConfig
  ): number {
    if (!config.applicable || monthlyProfit <= 0) return 0;
    return monthlyProfit * (config.rate / 100);
  }

  static getZakatSummary(
    projectFinancials: {
      totalRevenue: number;
      totalCosts: number;
      netProfit: number;
      assetValue: number;
    },
    config: ZakatConfig
  ): {
    isApplicable: boolean;
    calculationMethod: string;
    taxableBase: number;
    zakatRate: number;
    zakatAmount: number;
    netProfitAfterZakat: number;
    effectiveImpact: number; // percentage impact on profit
  } {
    const calculation = this.calculateZakatAmount(0, config, projectFinancials);
    
    return {
      isApplicable: config.applicable,
      calculationMethod: config.calculationMethod,
      taxableBase: calculation.taxableBase,
      zakatRate: config.rate,
      zakatAmount: calculation.zakatAmount,
      netProfitAfterZakat: projectFinancials.netProfit - calculation.zakatAmount,
      effectiveImpact: projectFinancials.netProfit > 0 
        ? (calculation.zakatAmount / projectFinancials.netProfit) * 100 
        : 0
    };
  }
}

// Utility functions for compliance reporting
export const formatComplianceAmount = (amount: number, currency: string = 'SAR'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const getComplianceStatus = (
  escrowConfig: EscrowConfig,
  zakatConfig: ZakatConfig
): {
  escrowStatus: 'enabled' | 'disabled';
  zakatStatus: 'applicable' | 'not_applicable';
  complianceLevel: 'full' | 'partial' | 'none';
} => {
  const escrowStatus = escrowConfig.enabled ? 'enabled' : 'disabled';
  const zakatStatus = zakatConfig.applicable ? 'applicable' : 'not_applicable';
  
  let complianceLevel: 'full' | 'partial' | 'none' = 'none';
  if (escrowConfig.enabled && zakatConfig.applicable) {
    complianceLevel = 'full';
  } else if (escrowConfig.enabled || zakatConfig.applicable) {
    complianceLevel = 'partial';
  }

  return { escrowStatus, zakatStatus, complianceLevel };
};

// Saudi-specific compliance constants
export const SAUDI_COMPLIANCE_DEFAULTS = {
  ZAKAT_RATE: 2.5,
  ESCROW_PERCENTAGE: 20.0,
  MINIMUM_PROJECT_VALUE_FOR_ESCROW: 10000000, // 10M SAR
  ZAKAT_NISAB_THRESHOLD: 85000, // SAR (approximate)
} as const;