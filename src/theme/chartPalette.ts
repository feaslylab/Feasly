/**
 * Feasly Chart Color Palette
 * 
 * Color-blind safe palette that integrates with our design system.
 * Provides consistent theming across all chart components.
 * 
 * Based on:
 * - WCAG AA contrast requirements
 * - Deuteranopia/Protanopia accessibility
 * - Design system semantic tokens
 */

// Chart color categories with semantic meaning
export const CHART_CATEGORIES = {
  // Financial performance colors
  REVENUE: 'revenue',
  COST: 'cost', 
  PROFIT: 'profit',
  LOSS: 'loss',
  
  // Status indicators
  SUCCESS: 'success',
  WARNING: 'warning',
  DANGER: 'danger',
  INFO: 'info',
  
  // Neutral/baseline
  NEUTRAL: 'neutral',
  BASELINE: 'baseline',
  
  // Sequential data series
  SERIES_1: 'series-1',
  SERIES_2: 'series-2', 
  SERIES_3: 'series-3',
  SERIES_4: 'series-4',
  SERIES_5: 'series-5',
  SERIES_6: 'series-6',
} as const;

export type ChartCategory = typeof CHART_CATEGORIES[keyof typeof CHART_CATEGORIES];

/**
 * Get HSL color values that work with both light and dark themes
 * Returns colors as HSL strings that can be used in CSS
 */
export function getChartColors(theme: 'light' | 'dark' = 'light') {
  if (theme === 'dark') {
    return {
      // Financial colors - enhanced for dark mode visibility
      [CHART_CATEGORIES.REVENUE]: 'hsl(142, 71%, 55%)',      // Emerald green
      [CHART_CATEGORIES.COST]: 'hsl(0, 84%, 65%)',          // Red
      [CHART_CATEGORIES.PROFIT]: 'hsl(217, 91%, 65%)',      // Primary blue
      [CHART_CATEGORIES.LOSS]: 'hsl(0, 84%, 65%)',          // Red
      
      // Status indicators  
      [CHART_CATEGORIES.SUCCESS]: 'hsl(142, 71%, 55%)',     // Green
      [CHART_CATEGORIES.WARNING]: 'hsl(38, 92%, 60%)',      // Orange
      [CHART_CATEGORIES.DANGER]: 'hsl(0, 84%, 65%)',        // Red
      [CHART_CATEGORIES.INFO]: 'hsl(217, 91%, 65%)',        // Blue
      
      // Neutral colors
      [CHART_CATEGORIES.NEUTRAL]: 'hsl(215, 16%, 75%)',     // Light gray
      [CHART_CATEGORIES.BASELINE]: 'hsl(215, 16%, 65%)',    // Medium gray
      
      // Sequential series - color-blind safe progression
      [CHART_CATEGORIES.SERIES_1]: 'hsl(217, 91%, 65%)',    // Blue
      [CHART_CATEGORIES.SERIES_2]: 'hsl(142, 71%, 55%)',    // Green  
      [CHART_CATEGORIES.SERIES_3]: 'hsl(38, 92%, 60%)',     // Orange
      [CHART_CATEGORIES.SERIES_4]: 'hsl(271, 81%, 65%)',    // Purple
      [CHART_CATEGORIES.SERIES_5]: 'hsl(180, 62%, 55%)',    // Cyan
      [CHART_CATEGORIES.SERIES_6]: 'hsl(0, 84%, 65%)',      // Red
    };
  }
  
  // Light theme colors
  return {
    // Financial colors
    [CHART_CATEGORIES.REVENUE]: 'hsl(142, 71%, 45%)',       // Emerald green
    [CHART_CATEGORIES.COST]: 'hsl(0, 84%, 60%)',           // Red
    [CHART_CATEGORIES.PROFIT]: 'hsl(217, 79%, 53%)',       // Primary blue
    [CHART_CATEGORIES.LOSS]: 'hsl(0, 84%, 60%)',           // Red
    
    // Status indicators
    [CHART_CATEGORIES.SUCCESS]: 'hsl(142, 71%, 45%)',      // Green
    [CHART_CATEGORIES.WARNING]: 'hsl(38, 92%, 50%)',       // Orange
    [CHART_CATEGORIES.DANGER]: 'hsl(0, 84%, 60%)',         // Red
    [CHART_CATEGORIES.INFO]: 'hsl(217, 79%, 53%)',         // Blue
    
    // Neutral colors  
    [CHART_CATEGORIES.NEUTRAL]: 'hsl(213, 19%, 45%)',      // Medium gray
    [CHART_CATEGORIES.BASELINE]: 'hsl(213, 19%, 65%)',     // Light gray
    
    // Sequential series - color-blind safe progression
    [CHART_CATEGORIES.SERIES_1]: 'hsl(217, 79%, 53%)',     // Blue
    [CHART_CATEGORIES.SERIES_2]: 'hsl(142, 71%, 45%)',     // Green
    [CHART_CATEGORIES.SERIES_3]: 'hsl(38, 92%, 50%)',      // Orange  
    [CHART_CATEGORIES.SERIES_4]: 'hsl(271, 81%, 56%)',     // Purple
    [CHART_CATEGORIES.SERIES_5]: 'hsl(180, 62%, 45%)',     // Cyan
    [CHART_CATEGORIES.SERIES_6]: 'hsl(0, 84%, 60%)',       // Red
  };
}

/**
 * Get colors that integrate with CSS custom properties
 * Returns colors as hsl(var(--token)) format for design system integration
 */
export function getChartTokenColors() {
  return {
    // Use design system tokens where available
    [CHART_CATEGORIES.REVENUE]: 'hsl(var(--success))',
    [CHART_CATEGORIES.COST]: 'hsl(var(--destructive))',
    [CHART_CATEGORIES.PROFIT]: 'hsl(var(--primary))',
    [CHART_CATEGORIES.LOSS]: 'hsl(var(--destructive))',
    
    [CHART_CATEGORIES.SUCCESS]: 'hsl(var(--success))',
    [CHART_CATEGORIES.WARNING]: 'hsl(var(--warning))',
    [CHART_CATEGORIES.DANGER]: 'hsl(var(--destructive))',
    [CHART_CATEGORIES.INFO]: 'hsl(var(--primary))',
    
    [CHART_CATEGORIES.NEUTRAL]: 'hsl(var(--muted-foreground))',
    [CHART_CATEGORIES.BASELINE]: 'hsl(var(--muted-foreground) / 0.7)',
    
    // Fallback to explicit colors for series
    [CHART_CATEGORIES.SERIES_1]: 'hsl(var(--primary))',
    [CHART_CATEGORIES.SERIES_2]: 'hsl(var(--success))',
    [CHART_CATEGORIES.SERIES_3]: 'hsl(var(--warning))',
    [CHART_CATEGORIES.SERIES_4]: 'hsl(271, 81%, 56%)',
    [CHART_CATEGORIES.SERIES_5]: 'hsl(180, 62%, 45%)',
    [CHART_CATEGORIES.SERIES_6]: 'hsl(var(--destructive))',
  };
}

/**
 * Generate color array for multi-series charts
 * @param count Number of colors needed
 * @param theme Current theme
 * @returns Array of HSL color strings
 */
export function generateSeriesColors(count: number, theme: 'light' | 'dark' = 'light'): string[] {
  const colors = getChartColors(theme);
  const seriesKeys = [
    CHART_CATEGORIES.SERIES_1,
    CHART_CATEGORIES.SERIES_2, 
    CHART_CATEGORIES.SERIES_3,
    CHART_CATEGORIES.SERIES_4,
    CHART_CATEGORIES.SERIES_5,
    CHART_CATEGORIES.SERIES_6,
  ];
  
  const result: string[] = [];
  for (let i = 0; i < count; i++) {
    const colorKey = seriesKeys[i % seriesKeys.length];
    result.push(colors[colorKey]);
  }
  
  return result;
}

/**
 * Get opacity variants for stacked/layered charts
 * @param baseColor HSL color string
 * @param opacity Opacity value 0-1
 * @returns HSL color with alpha
 */
export function withOpacity(baseColor: string, opacity: number): string {
  // Convert HSL to HSLA
  if (baseColor.startsWith('hsl(')) {
    return baseColor.replace('hsl(', `hsla(`).replace(')', `, ${opacity})`);
  }
  return baseColor;
}

/**
 * Chart-specific color helpers
 */
export const chartHelpers = {
  /**
   * Get financial colors (revenue, cost, profit/loss)
   */
  getFinancialColors: (theme: 'light' | 'dark' = 'light') => {
    const colors = getChartColors(theme);
    return {
      revenue: colors[CHART_CATEGORIES.REVENUE],
      cost: colors[CHART_CATEGORIES.COST], 
      profit: colors[CHART_CATEGORIES.PROFIT],
      loss: colors[CHART_CATEGORIES.LOSS],
    };
  },
  
  /**
   * Get cash flow specific colors (inflow, outflow, net)
   */
  getCashFlowColors: (theme: 'light' | 'dark' = 'light') => {
    const colors = getChartColors(theme);
    return {
      inflow: colors[CHART_CATEGORIES.REVENUE],   // Green for money coming in
      outflow: colors[CHART_CATEGORIES.COST],     // Red for money going out  
      net: colors[CHART_CATEGORIES.PROFIT],       // Blue for net result
    };
  },
  
  /**
   * Get risk assessment colors
   */
  getRiskColors: (theme: 'light' | 'dark' = 'light') => {
    const colors = getChartColors(theme);
    return {
      low: colors[CHART_CATEGORIES.SUCCESS],
      medium: colors[CHART_CATEGORIES.WARNING],
      high: colors[CHART_CATEGORIES.DANGER],
      baseline: colors[CHART_CATEGORIES.BASELINE],
    };
  },
};

// Re-export for convenience
export { getChartColors as default };