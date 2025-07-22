import { KPIResult } from "@/lib/forecast/engine";

export interface ProjectAlert {
  id?: string;
  project_id: string;
  alert_type: string;
  title: string;
  body: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  triggered_at: Date;
  resolved: boolean;
  metadata?: Record<string, any>;
}

export interface ComplianceSettings {
  escrow_enabled: boolean;
  escrow_percent: number;
  zakat_applicable: boolean;
  zakat_rate_percent: number;
}

/**
 * Generate project alerts based on KPIs and compliance status
 */
export function generateProjectAlerts(
  project: any, // Project from Supabase
  kpis: KPIResult,
  compliance: ComplianceSettings
): ProjectAlert[] {
  const alerts: ProjectAlert[] = [];
  const now = new Date();

  // Financial Performance Alerts
  if (kpis.irr < 8) {
    alerts.push({
      project_id: project.id,
      alert_type: 'financial_risk',
      title: 'Low IRR Warning',
      body: `Project IRR (${kpis.irr.toFixed(1)}%) is below 8% threshold. Consider reviewing revenue projections or cost optimization.`,
      severity: kpis.irr < 5 ? 'critical' : 'high',
      triggered_at: now,
      resolved: false,
      metadata: { current_irr: kpis.irr, threshold: 8 }
    });
  }

  if (kpis.profit < 0) {
    alerts.push({
      project_id: project.id,
      alert_type: 'financial_risk',
      title: 'Negative Profit Alert',
      body: `Project is showing negative profit of ${Math.abs(kpis.profit).toLocaleString()} ${project.currency_code || 'AED'}. Immediate attention required.`,
      severity: 'critical',
      triggered_at: now,
      resolved: false,
      metadata: { current_profit: kpis.profit }
    });
  }

  if (kpis.roi < 10) {
    alerts.push({
      project_id: project.id,
      alert_type: 'financial_performance',
      title: 'Low ROI Warning',
      body: `Project ROI (${kpis.roi.toFixed(1)}%) is below recommended 10% minimum for real estate investments.`,
      severity: kpis.roi < 5 ? 'high' : 'medium',
      triggered_at: now,
      resolved: false,
      metadata: { current_roi: kpis.roi, threshold: 10 }
    });
  }

  if (kpis.payback_period > 60) {
    alerts.push({
      project_id: project.id,
      alert_type: 'financial_performance',
      title: 'Extended Payback Period',
      body: `Payback period of ${kpis.payback_period} months exceeds recommended 60-month threshold.`,
      severity: kpis.payback_period > 120 ? 'high' : 'medium',
      triggered_at: now,
      resolved: false,
      metadata: { payback_period: kpis.payback_period, threshold: 60 }
    });
  }

  // Compliance Alerts
  const totalCost = kpis.total_cost;
  const projectValueSAR = project.currency_code === 'SAR' ? totalCost : totalCost * 3.75; // Rough conversion

  if (!compliance.zakat_applicable && kpis.profit > 0) {
    alerts.push({
      project_id: project.id,
      alert_type: 'compliance_zakat',
      title: 'Zakat Not Enabled on Profitable Project',
      body: `Project is profitable but Zakat is not enabled. Consider Islamic compliance requirements.`,
      severity: 'medium',
      triggered_at: now,
      resolved: false,
      metadata: { profit: kpis.profit, zakat_required: true }
    });
  }

  if (!compliance.escrow_enabled && projectValueSAR > 10_000_000) {
    alerts.push({
      project_id: project.id,
      alert_type: 'compliance_escrow',
      title: 'Escrow Required for Large Project',
      body: `Project value exceeds 10M SAR threshold. Escrow account may be required per Saudi regulations.`,
      severity: 'high',
      triggered_at: now,
      resolved: false,
      metadata: { project_value_sar: projectValueSAR, threshold: 10_000_000 }
    });
  }

  if (compliance.escrow_enabled && compliance.escrow_percent < 10) {
    alerts.push({
      project_id: project.id,
      alert_type: 'compliance_escrow',
      title: 'Low Escrow Percentage',
      body: `Escrow percentage (${compliance.escrow_percent}%) may be below regulatory requirements. Consider increasing to 15-20%.`,
      severity: 'medium',
      triggered_at: now,
      resolved: false,
      metadata: { current_escrow_percent: compliance.escrow_percent, recommended_min: 15 }
    });
  }

  // Market Risk Alerts
  if (kpis.profit_margin < 20 && kpis.profit > 0) {
    alerts.push({
      project_id: project.id,
      alert_type: 'market_risk',
      title: 'Thin Profit Margins',
      body: `Profit margin of ${kpis.profit_margin.toFixed(1)}% leaves little buffer for market volatility or cost overruns.`,
      severity: 'medium',
      triggered_at: now,
      resolved: false,
      metadata: { profit_margin: kpis.profit_margin, threshold: 20 }
    });
  }

  return alerts;
}

/**
 * Filter alerts by severity
 */
export function filterAlertsBySeverity(alerts: ProjectAlert[], severity: string[]): ProjectAlert[] {
  return alerts.filter(alert => severity.includes(alert.severity));
}

/**
 * Get alert count by severity
 */
export function getAlertCountBySeverity(alerts: ProjectAlert[]): Record<string, number> {
  return alerts.reduce((acc, alert) => {
    acc[alert.severity] = (acc[alert.severity] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}

/**
 * Get the most critical alert
 */
export function getMostCriticalAlert(alerts: ProjectAlert[]): ProjectAlert | null {
  if (alerts.length === 0) return null;
  
  const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
  
  return alerts.reduce((mostCritical, alert) => {
    if (severityOrder[alert.severity] > severityOrder[mostCritical.severity]) {
      return alert;
    }
    return mostCritical;
  });
}

/**
 * Generate alert summary text
 */
export function generateAlertSummary(alerts: ProjectAlert[]): string {
  const counts = getAlertCountBySeverity(alerts);
  const criticalCount = counts.critical || 0;
  const highCount = counts.high || 0;
  const mediumCount = counts.medium || 0;

  if (criticalCount > 0) {
    return `${criticalCount} critical alert${criticalCount > 1 ? 's' : ''} require immediate attention`;
  }
  
  if (highCount > 0) {
    return `${highCount} high-priority alert${highCount > 1 ? 's' : ''} need review`;
  }
  
  if (mediumCount > 0) {
    return `${mediumCount} medium-priority alert${mediumCount > 1 ? 's' : ''} to consider`;
  }
  
  return 'No active alerts';
}