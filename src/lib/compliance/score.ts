import { KPIResult } from "@/lib/forecast/engine";

export interface ProjectHealthScore {
  score: number; // 0-100
  riskLevel: 'low' | 'medium' | 'high';
  factors: HealthFactor[];
  recommendations: string[];
}

export interface HealthFactor {
  factor: string;
  impact: number; // positive or negative points
  description: string;
  category: 'financial' | 'compliance' | 'market' | 'operational';
}

export interface ComplianceSettings {
  escrow_enabled: boolean;
  escrow_percent: number;
  zakat_applicable: boolean;
  zakat_rate_percent: number;
}

export interface ProjectBasics {
  currency_code?: string;
  duration_months?: number;
}

/**
 * Calculate comprehensive project health score
 */
export function getProjectHealthScore(
  project: ProjectBasics,
  kpis: KPIResult,
  compliance: ComplianceSettings
): ProjectHealthScore {
  let score = 50; // Base score
  const factors: HealthFactor[] = [];
  const recommendations: string[] = [];

  // Financial Health Factors
  
  // IRR Assessment
  if (kpis.irr >= 15) {
    const impact = 20;
    score += impact;
    factors.push({
      factor: 'Strong IRR',
      impact,
      description: `IRR of ${kpis.irr.toFixed(1)}% is excellent`,
      category: 'financial'
    });
  } else if (kpis.irr >= 10) {
    const impact = 10;
    score += impact;
    factors.push({
      factor: 'Good IRR',
      impact,
      description: `IRR of ${kpis.irr.toFixed(1)}% meets standards`,
      category: 'financial'
    });
  } else if (kpis.irr < 8) {
    const impact = -20;
    score += impact;
    factors.push({
      factor: 'Poor IRR',
      impact,
      description: `IRR of ${kpis.irr.toFixed(1)}% is below acceptable threshold`,
      category: 'financial'
    });
    recommendations.push('Review revenue projections and cost optimization opportunities');
  }

  // Profitability
  if (kpis.profit <= 0) {
    const impact = -25;
    score += impact;
    factors.push({
      factor: 'Negative Profit',
      impact,
      description: 'Project shows negative profitability',
      category: 'financial'
    });
    recommendations.push('Urgent review of project viability required');
  } else if (kpis.profit_margin >= 25) {
    const impact = 15;
    score += impact;
    factors.push({
      factor: 'Healthy Margins',
      impact,
      description: `Profit margin of ${kpis.profit_margin.toFixed(1)}% provides good buffer`,
      category: 'financial'
    });
  } else if (kpis.profit_margin < 15) {
    const impact = -10;
    score += impact;
    factors.push({
      factor: 'Thin Margins',
      impact,
      description: `Profit margin of ${kpis.profit_margin.toFixed(1)}% leaves little buffer`,
      category: 'financial'
    });
    recommendations.push('Consider ways to improve profit margins');
  }

  // ROI Assessment
  if (kpis.roi >= 25) {
    const impact = 15;
    score += impact;
    factors.push({
      factor: 'Strong ROI',
      impact,
      description: `ROI of ${kpis.roi.toFixed(1)}% is excellent`,
      category: 'financial'
    });
  } else if (kpis.roi < 10) {
    const impact = -15;
    score += impact;
    factors.push({
      factor: 'Low ROI',
      impact,
      description: `ROI of ${kpis.roi.toFixed(1)}% is below market expectations`,
      category: 'financial'
    });
    recommendations.push('Evaluate if returns justify investment risk');
  }

  // Payback Period
  if (kpis.payback_period <= 36) {
    const impact = 10;
    score += impact;
    factors.push({
      factor: 'Quick Payback',
      impact,
      description: `${kpis.payback_period}-month payback period is attractive`,
      category: 'financial'
    });
  } else if (kpis.payback_period > 60) {
    const impact = -10;
    score += impact;
    factors.push({
      factor: 'Extended Payback',
      impact,
      description: `${kpis.payback_period}-month payback period is lengthy`,
      category: 'financial'
    });
    recommendations.push('Consider ways to accelerate cash flow generation');
  }

  // Compliance Factors

  // Zakat Compliance
  if (compliance.zakat_applicable && kpis.profit > 0) {
    const impact = 5;
    score += impact;
    factors.push({
      factor: 'Zakat Compliant',
      impact,
      description: 'Islamic compliance enabled',
      category: 'compliance'
    });
  } else if (!compliance.zakat_applicable && kpis.profit > 0) {
    const impact = -5;
    score += impact;
    factors.push({
      factor: 'Zakat Not Enabled',
      impact,
      description: 'Islamic compliance not configured for profitable project',
      category: 'compliance'
    });
    recommendations.push('Consider enabling Zakat for Islamic compliance');
  }

  // Escrow Management
  if (compliance.escrow_enabled) {
    const impact = 5;
    score += impact;
    factors.push({
      factor: 'Escrow Enabled',
      impact,
      description: `${compliance.escrow_percent}% escrow provides security`,
      category: 'compliance'
    });
  } else {
    // Check if project size warrants escrow
    const totalCost = kpis.total_cost;
    const projectValueSAR = project.currency_code === 'SAR' ? totalCost : totalCost * 3.75;
    
    if (projectValueSAR > 10_000_000) {
      const impact = -10;
      score += impact;
      factors.push({
        factor: 'Escrow Required',
        impact,
        description: 'Large project may require escrow per regulations',
        category: 'compliance'
      });
      recommendations.push('Consider implementing escrow for regulatory compliance');
    }
  }

  // Market Risk Factors
  const duration_months = project.duration_months || 12;
  if (duration_months > 36) {
    const impact = -5;
    score += impact;
    factors.push({
      factor: 'Extended Timeline',
      impact,
      description: `${duration_months}-month timeline increases market risk`,
      category: 'market'
    });
    recommendations.push('Monitor market conditions closely given extended timeline');
  }

  // Ensure score stays within bounds
  score = Math.max(0, Math.min(100, score));

  // Determine risk level
  let riskLevel: 'low' | 'medium' | 'high';
  if (score >= 75) {
    riskLevel = 'low';
  } else if (score >= 50) {
    riskLevel = 'medium';
  } else {
    riskLevel = 'high';
  }

  return {
    score: Math.round(score),
    riskLevel,
    factors,
    recommendations
  };
}

/**
 * Get color class for health score
 */
export function getHealthScoreColor(score: number): string {
  if (score >= 75) return 'text-emerald-600';
  if (score >= 50) return 'text-amber-600';
  return 'text-red-600';
}

/**
 * Get risk level badge variant
 */
export function getRiskLevelVariant(riskLevel: string): string {
  switch (riskLevel) {
    case 'low': return 'success';
    case 'medium': return 'warning';
    case 'high': return 'destructive';
    default: return 'secondary';
  }
}

/**
 * Generate health score summary text
 */
export function generateHealthSummary(healthScore: ProjectHealthScore): string {
  const { score, riskLevel, factors } = healthScore;
  
  const positiveFactors = factors.filter(f => f.impact > 0).length;
  const negativeFactors = factors.filter(f => f.impact < 0).length;
  
  let summary = `Project health score: ${score}/100 (${riskLevel} risk). `;
  
  if (positiveFactors > 0) {
    summary += `${positiveFactors} positive factor${positiveFactors > 1 ? 's' : ''}`;
  }
  
  if (negativeFactors > 0) {
    if (positiveFactors > 0) summary += ', ';
    summary += `${negativeFactors} concern${negativeFactors > 1 ? 's' : ''}`;
  }
  
  if (positiveFactors === 0 && negativeFactors === 0) {
    summary += 'No significant factors identified';
  }
  
  return summary + '.';
}