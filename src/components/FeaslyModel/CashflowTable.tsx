import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Download, RefreshCw, Calculator } from "lucide-react";
import { useFeaslyCalculation } from "@/hooks/useFeaslyCalculation";
import { formatCurrency } from "@/lib/currencyUtils";
import type { FeaslyModelFormData } from "./types";
import type { MonthlyCashflow } from "@/lib/feaslyCalculationEngine";

interface CashflowTableProps {
  projectId?: string;
  formData?: FeaslyModelFormData;
  onRecalculate?: (formData: FeaslyModelFormData) => void;
}

const SCENARIO_LABELS = {
  base: "Base Case",
  optimistic: "Optimistic",
  pessimistic: "Pessimistic", 
  custom: "Custom"
} as const;

const SCENARIO_COLORS = {
  base: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  optimistic: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  pessimistic: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  custom: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
} as const;

export default function CashflowTable({ projectId, formData, onRecalculate }: CashflowTableProps) {
  const [activeScenario, setActiveScenario] = useState<keyof typeof SCENARIO_LABELS>("base");
  const [expandedCategories, setExpandedCategories] = useState(new Set(["costs", "funding", "revenue"]));

  // Watch currency code from form context
  const form = useFormContext<FeaslyModelFormData>();
  const currencyCode = form?.watch("currency_code") || "SAR";

  const {
    compareScenarios,
    isLoadingCashflow,
    isCalculating,
    calculateCashflow,
    hasData,
    isEmpty,
    getScenarioSummary
  } = useFeaslyCalculation(projectId);

  const scenarios = compareScenarios();
  const activeScenarioData = scenarios.find(s => s.scenario === activeScenario);
  const summary = getScenarioSummary(activeScenario);

  // Use currency utility with dynamic currency code
  const formatAmount = (amount: number) => {
    return formatCurrency(amount, { currencyCode });
  };

  // Format percentage
  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  // Handle recalculate
  const handleRecalculate = async () => {
    if (formData) {
      if (onRecalculate) {
        onRecalculate(formData);
      } else {
        await calculateCashflow(formData);
      }
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    if (!activeScenarioData?.data.length) return;

    const headers = [
      "Month",
      "Revenue",
      "Construction Cost",
      "Land Cost", 
      "Soft Costs",
      "Loan Drawn",
      "Loan Interest",
      "Loan Repayment",
      "Equity Injected",
      "Zakat Due",
      "Net Cashflow",
      "Cash Balance"
    ];

    const rows = activeScenarioData.data.map(month => [
      month.month,
      month.revenue,
      month.constructionCost,
      month.landCost,
      month.softCosts,
      month.loanDrawn,
      month.loanInterest,
      month.loanRepayment,
      month.equityInjected,
      month.zakatDue,
      month.netCashflow,
      month.cashBalance
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cashflow-${activeScenario}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Toggle category expansion
  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  // Group table rows by category
  const getRowsByCategory = (data: MonthlyCashflow[]) => {
    return {
      costs: [
        { label: "Construction Cost", key: "constructionCost" as keyof MonthlyCashflow },
        { label: "Land Cost", key: "landCost" as keyof MonthlyCashflow },
        { label: "Soft Costs", key: "softCosts" as keyof MonthlyCashflow },
      ],
      funding: [
        { label: "Loan Drawn", key: "loanDrawn" as keyof MonthlyCashflow },
        { label: "Loan Interest", key: "loanInterest" as keyof MonthlyCashflow },
        { label: "Loan Repayment", key: "loanRepayment" as keyof MonthlyCashflow },
        { label: "Equity Injected", key: "equityInjected" as keyof MonthlyCashflow },
      ],
      vat: [
        { label: "VAT on Costs", key: "vatOnCosts" as keyof MonthlyCashflow },
        { label: "VAT Recovered", key: "vatRecoverable" as keyof MonthlyCashflow },
      ],
      escrow: [
        { label: "Held in Escrow", key: "escrowReserved" as keyof MonthlyCashflow },
        { label: "Released Funds", key: "escrowReleased" as keyof MonthlyCashflow },
      ],
      revenue: [
        { label: "Revenue", key: "revenue" as keyof MonthlyCashflow },
        { label: "Zakat Due", key: "zakatDue" as keyof MonthlyCashflow },
      ],
      summary: [
        { label: "Net Cashflow", key: "netCashflow" as keyof MonthlyCashflow },
        { label: "Cash Balance", key: "cashBalance" as keyof MonthlyCashflow },
      ]
    };
  };

  // Loading state
  if (isLoadingCashflow || isCalculating) {
    return (
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 animate-spin" />
            <CardTitle>Monthly Cashflow Analysis</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Empty state
  if (!hasData || isEmpty) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Monthly Cashflow Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Calculator className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No cashflow data available</h3>
            <p className="text-muted-foreground mb-4">
              Generate a financial model first to see monthly cashflow projections.
            </p>
            {formData && (
              <Button onClick={handleRecalculate} disabled={isCalculating}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Generate Cashflow
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  const rowsByCategory = activeScenarioData ? getRowsByCategory(activeScenarioData.data) : null;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Monthly Cashflow Analysis
          </CardTitle>
          <div className="flex items-center gap-2">
            {hasData && (
              <Button variant="outline" size="sm" onClick={exportToCSV}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            )}
            {formData && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRecalculate}
                disabled={isCalculating}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isCalculating ? 'animate-spin' : ''}`} />
                Recalculate
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeScenario} onValueChange={(value) => setActiveScenario(value as keyof typeof SCENARIO_LABELS)}>
          <TabsList className="grid w-full grid-cols-4">
            {Object.entries(SCENARIO_LABELS).map(([key, label]) => (
              <TabsTrigger key={key} value={key} className="flex items-center gap-2">
                <Badge variant="secondary" className={SCENARIO_COLORS[key as keyof typeof SCENARIO_COLORS]}>
                  {label}
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>

          {Object.entries(SCENARIO_LABELS).map(([scenarioKey, scenarioLabel]) => {
            const scenario = scenarios.find(s => s.scenario === scenarioKey);
            const scenarioSummary = getScenarioSummary(scenarioKey as keyof typeof SCENARIO_LABELS);
            
            return (
              <TabsContent key={scenarioKey} value={scenarioKey}>
                {scenarioSummary && (
                  <>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <div className="text-sm text-muted-foreground">Total Revenue</div>
                        <div className="text-lg font-semibold">{formatAmount(scenarioSummary.totalRevenue)}</div>
                      </div>
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <div className="text-sm text-muted-foreground">Total Costs</div>
                        <div className="text-lg font-semibold">{formatAmount(scenarioSummary.totalCosts)}</div>
                      </div>
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <div className="text-sm text-muted-foreground">Total Profit</div>
                        <div className={`text-lg font-semibold ${scenarioSummary.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatAmount(scenarioSummary.totalProfit)}
                        </div>
                      </div>
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <div className="text-sm text-muted-foreground">Profit Margin</div>
                        <div className={`text-lg font-semibold ${scenarioSummary.profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatPercentage(scenarioSummary.profitMargin)}
                        </div>
                      </div>
                    </div>
                    {((scenarioSummary as any).totalVatPaid > 0 || (scenarioSummary as any).totalVatRecovered > 0) && (
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="text-center p-3 bg-orange-50 border border-orange-200 rounded-lg">
                          <div className="text-sm text-muted-foreground">Total VAT Paid</div>
                          <div className="text-lg font-semibold text-orange-700">{formatAmount((scenarioSummary as any).totalVatPaid)}</div>
                        </div>
                        <div className="text-center p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="text-sm text-muted-foreground">Total VAT Recovered</div>
                          <div className="text-lg font-semibold text-green-700">{formatAmount((scenarioSummary as any).totalVatRecovered)}</div>
                        </div>
                      </div>
                    )}
                    {/* Add Escrow Summary if applicable */}
                    {((scenarioSummary as any).totalEscrowReserved > 0 || (scenarioSummary as any).totalEscrowReleased > 0) && (
                      <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="text-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="text-sm text-muted-foreground">Escrow Reserved</div>
                          <div className="text-lg font-semibold text-blue-700">{formatAmount((scenarioSummary as any).totalEscrowReserved)}</div>
                        </div>
                        <div className="text-center p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="text-sm text-muted-foreground">Escrow Released</div>
                          <div className="text-lg font-semibold text-green-700">{formatAmount((scenarioSummary as any).totalEscrowReleased)}</div>
                        </div>
                        <div className="text-center p-3 bg-gray-50 border border-gray-200 rounded-lg">
                          <div className="text-sm text-muted-foreground">Escrow Balance</div>
                          <div className={`text-lg font-semibold ${(scenarioSummary as any).totalEscrowReserved - (scenarioSummary as any).totalEscrowReleased >= 0 ? 'text-blue-700' : 'text-red-700'}`}>
                            {formatAmount((scenarioSummary as any).totalEscrowReserved - (scenarioSummary as any).totalEscrowReleased)}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Add Zakat Summary if applicable */}
                    {((scenarioSummary as any).totalZakatDue > 0) && (
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="text-center p-3 bg-purple-50 border border-purple-200 rounded-lg">
                          <div className="text-sm text-muted-foreground">Total Zakat Due</div>
                          <div className="text-lg font-semibold text-purple-700">{formatAmount((scenarioSummary as any).totalZakatDue)}</div>
                        </div>
                        <div className="text-center p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="text-sm text-muted-foreground">Net Profit After Zakat</div>
                          <div className="text-lg font-semibold text-green-700">{formatAmount(scenarioSummary.totalProfit - ((scenarioSummary as any).totalZakatDue || 0))}</div>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {scenario?.data && (
                  <ScrollArea className="w-full overflow-auto">
                    <div className="min-w-[800px]">
                      <Table>
                        <TableHeader className="sticky top-0 bg-background z-10">
                          <TableRow>
                            <TableHead className="font-semibold">Month</TableHead>
                            {scenario.data.map((month) => (
                              <TableHead key={month.month} className="text-center min-w-24">
                                {month.month}
                              </TableHead>
                            ))}
                            <TableHead className="text-center font-semibold bg-muted">Total</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {rowsByCategory && Object.entries(rowsByCategory).map(([category, rows]) => (
                            <>
                              <TableRow key={`${category}-header`} className="bg-muted/30">
                                <TableCell 
                                  className="font-semibold cursor-pointer hover:bg-muted/50"
                                  onClick={() => toggleCategory(category)}
                                >
                                  <div className="flex items-center gap-2">
                                    <span className={`transition-transform ${expandedCategories.has(category) ? 'rotate-90' : ''}`}>
                                      ▶
                                    </span>
                                    {category.charAt(0).toUpperCase() + category.slice(1)}
                                  </div>
                                </TableCell>
                                <TableCell colSpan={scenario.data.length + 1} />
                              </TableRow>
                              {expandedCategories.has(category) && rows.map((row) => {
                                const total = scenario.data.reduce((sum, month) => sum + (month[row.key] as number), 0);
                                return (
                                  <TableRow key={row.key}>
                                    <TableCell className="pl-8 font-medium">{row.label}</TableCell>
                                    {scenario.data.map((month) => (
                                      <TableCell key={month.month} className="text-right">
                                        {formatAmount(month[row.key] as number)}
                                      </TableCell>
                                    ))}
                                    <TableCell className="text-right font-semibold bg-muted">
                                      {formatAmount(total)}
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            </>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </ScrollArea>
                )}
              </TabsContent>
            );
          })}
        </Tabs>
      </CardContent>
    </Card>
  );
}