import { useMemo } from "react";
import { useEngine } from "@/lib/engine/EngineContext";
import { calculateRevenue } from "@/lib/engine/calculateRevenue";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { ChartErrorBoundary } from "@/components/charts/ChartErrorBoundary";
import { DollarSign, TrendingUp, Building2, Percent } from "lucide-react";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-AE', {
    style: 'currency',
    currency: 'AED',
    notation: 'compact',
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

export default function RevenuePreviewPanel() {
  const { inputs } = useEngine();

  const revenueData = useMemo(() => {
    if (!inputs?.unit_types || !Array.isArray(inputs.unit_types)) {
      return null;
    }
    // Transform to UnitTypeInput format first
    const unitTypes = inputs.unit_types.map((unit: any) => ({
      id: unit.id || unit.key || crypto.randomUUID(),
      name: unit.name || 'Unknown Unit',
      units: unit.units || unit.count || 0,
      revenue_mode: unit.revenue_mode || (unit.initial_price_sqm_sale > 0 ? 'sale' : 'rent') as 'sale' | 'rent',
      price: unit.price || unit.initial_price_sqm_sale || 0,
      rent_per_month: unit.rent_per_month || unit.initial_rent_sqm_m || 0,
      occupancy_rate: unit.occupancy_rate || 0.8,
      lease_term_months: unit.lease_term_months || 12,
      start_month: unit.start_month || unit.delivery_month || 0,
      duration_months: unit.duration_months || 1,
    }));
    return { 
      ...calculateRevenue(unitTypes, 60),
      transformedUnits: unitTypes
    };
  }, [inputs]);

  // Prepare chart data
  const monthlyChartData = useMemo(() => {
    if (!revenueData) return [];
    
    return revenueData.monthlyRevenue.map((revenue, index) => {
      // Split into sales and rental revenue for stacked chart
      let salesRevenue = 0;
      let rentalRevenue = 0;
      
      revenueData.unitBreakdown.forEach(unit => {
        const monthlyUnitRevenue = unit.monthlyRevenue[index] || 0;
        if (unit.mode === 'sale') {
          salesRevenue += monthlyUnitRevenue;
        } else {
          rentalRevenue += monthlyUnitRevenue;
        }
      });
      
      return {
        month: `M${index + 1}`,
        monthIndex: index,
        salesRevenue,
        rentalRevenue,
        totalRevenue: revenue,
      };
    }).filter(item => item.totalRevenue > 0); // Only show months with revenue
  }, [revenueData]);

  const pieChartData = useMemo(() => {
    if (!revenueData) return [];
    
    const total = revenueData.totalRevenue;
    if (total === 0) return [];
    
    return [
      {
        name: 'Sales Revenue',
        value: revenueData.breakdown.sales,
        percentage: (revenueData.breakdown.sales / total) * 100,
        color: 'hsl(var(--chart-1))',
      },
      {
        name: 'Rental Revenue',
        value: revenueData.breakdown.rental,
        percentage: (revenueData.breakdown.rental / total) * 100,
        color: 'hsl(var(--chart-2))',
      },
    ].filter(item => item.value > 0);
  }, [revenueData]);

  if (!revenueData) {
    return (
      <div className="space-y-4" data-section="preview_revenue">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Revenue Preview</h2>
            <p className="text-sm text-muted-foreground">Projected revenue analysis and breakdown</p>
          </div>
        </div>
        
        <Card>
          <CardContent className="flex items-center justify-center h-48">
            <div className="text-center space-y-2">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto" />
              <h3 className="text-lg font-medium">No Revenue Data</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Configure unit types in the Inputs tab to see revenue projections and analytics.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full" data-section="preview_revenue">
      <div className="space-y-6 p-1">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Revenue Preview</h2>
            <p className="text-sm text-muted-foreground">Projected revenue analysis and breakdown</p>
          </div>
        </div>

        {/* Revenue KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sales Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(revenueData.breakdown.sales)}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Rental Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(revenueData.breakdown.rental)}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Combined Total</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(revenueData.totalRevenue)}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Months</CardTitle>
              <Percent className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{monthlyChartData.length}</div>
              <p className="text-xs text-muted-foreground">months with revenue</p>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Breakdown Table */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Breakdown by Unit Type</CardTitle>
            <CardDescription>Detailed breakdown of revenue by each unit configuration</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-3">Unit Type</th>
                    <th className="text-center p-3">Mode</th>
                    <th className="text-right p-3">Units</th>
                    <th className="text-right p-3">Revenue/Month</th>
                    <th className="text-right p-3">Total Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {revenueData.unitBreakdown.map((unit) => (
                    <tr key={unit.unitId} className="border-t">
                      <td className="p-3 font-medium">{unit.name}</td>
                      <td className="p-3 text-center">
                        <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                          unit.mode === 'sale' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {unit.mode === 'sale' ? 'Sale' : 'Rent'}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        {revenueData.transformedUnits.find(u => u.id === unit.unitId)?.units || 0}
                      </td>
                      <td className="p-3 text-right">
                        {unit.mode === 'rent' 
                          ? formatCurrency(unit.monthlyRevenue.find(r => r > 0) || 0)
                          : '—'
                        }
                      </td>
                      <td className="p-3 text-right font-semibold">
                        {formatCurrency(unit.revenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Stacked Bar Chart - Revenue Over Time */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue Over Time</CardTitle>
              <CardDescription>Monthly revenue breakdown by sales and rental income</CardDescription>
            </CardHeader>
            <CardContent>
              {monthlyChartData.length > 0 ? (
                <ChartErrorBoundary>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={monthlyChartData.slice(0, 24)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" opacity={0.3} />
                      <XAxis 
                        dataKey="month" 
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                      />
                      <YAxis 
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickFormatter={formatCurrency}
                      />
                      <Tooltip
                        formatter={(value: number, name: string) => [
                          formatCurrency(value),
                          name === 'salesRevenue' ? 'Sales Revenue' : 'Rental Revenue'
                        ]}
                        contentStyle={{
                          backgroundColor: 'hsl(var(--background))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '6px'
                        }}
                      />
                      <Bar dataKey="salesRevenue" stackId="a" fill="hsl(var(--chart-1))" name="Sales Revenue" />
                      <Bar dataKey="rentalRevenue" stackId="a" fill="hsl(var(--chart-2))" name="Rental Revenue" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartErrorBoundary>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  No revenue data to display
                </div>
              )}
            </CardContent>
          </Card>

          {/* Donut Chart - Revenue Mix */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue Mix</CardTitle>
              <CardDescription>Proportion of sales vs rental revenue</CardDescription>
            </CardHeader>
            <CardContent>
              {pieChartData.length > 0 ? (
                <ChartErrorBoundary>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => formatCurrency(value)}
                        contentStyle={{
                          backgroundColor: 'hsl(var(--background))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '6px'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-4 space-y-2">
                    {pieChartData.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-sm font-medium">{item.name}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatPercentage(item.percentage)}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t text-center">
                    <div className="text-2xl font-bold">{formatCurrency(revenueData.totalRevenue)}</div>
                    <div className="text-sm text-muted-foreground">Total Revenue</div>
                  </div>
                </ChartErrorBoundary>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  No revenue mix to display
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ScrollArea>
  );
}