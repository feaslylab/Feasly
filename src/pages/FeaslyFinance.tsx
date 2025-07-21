import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from "recharts";
import { DollarSign, PieChart as PieChartIcon, CreditCard, TrendingUp, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Form schema
const financeSchema = z.object({
  // Capital Structure
  equity_amount: z.number().min(0, "Equity amount must be positive"),
  debt_amount: z.number().min(0, "Debt amount must be positive"),
  
  // Debt Details
  interest_rate: z.number().min(0).max(100, "Interest rate must be between 0-100%"),
  loan_term_years: z.number().min(0.1, "Loan term must be positive"),
  grace_period_months: z.number().min(0, "Grace period must be positive"),
  repayment_type: z.enum(["bullet", "amortized"]),
  
  // Waterfall (UI only for now)
  preferred_irr: z.number().min(0).max(100, "Preferred IRR must be between 0-100%"),
  hurdle_irr: z.number().min(0).max(100, "Hurdle IRR must be between 0-100%"),
  
  // Currency
  currency_code: z.string().default("AED"),
});

type FinanceFormData = z.infer<typeof financeSchema>;

export default function FeaslyFinance() {
  const { isRTL } = useLanguage();
  const { t } = useTranslation('feasly.finance');
  const { toast } = useToast();
  
  const form = useForm<FinanceFormData>({
    resolver: zodResolver(financeSchema),
    defaultValues: {
      equity_amount: 0,
      debt_amount: 0,
      interest_rate: 5.0,
      loan_term_years: 10,
      grace_period_months: 0,
      repayment_type: "amortized",
      preferred_irr: 8.0,
      hurdle_irr: 15.0,
      currency_code: "AED",
    },
  });

  // Watch form values for real-time calculations
  const watchEquity = form.watch("equity_amount");
  const watchDebt = form.watch("debt_amount");
  const watchInterestRate = form.watch("interest_rate");
  const watchLoanTerm = form.watch("loan_term_years");
  const watchGracePeriod = form.watch("grace_period_months");
  const watchRepaymentType = form.watch("repayment_type");
  const watchCurrency = form.watch("currency_code");

  // Capital structure calculations
  const totalCapital = watchEquity + watchDebt;
  const equityPercentage = totalCapital > 0 ? (watchEquity / totalCapital) * 100 : 0;
  const debtPercentage = totalCapital > 0 ? (watchDebt / totalCapital) * 100 : 0;

  // Monthly payment calculations
  const monthlyInterestRate = watchInterestRate / 100 / 12;
  const totalPayments = watchLoanTerm * 12;
  
  let monthlyPayment = 0;
  if (watchDebt > 0 && watchInterestRate > 0) {
    if (watchRepaymentType === "amortized") {
      // Standard amortized loan formula
      if (monthlyInterestRate > 0) {
        monthlyPayment = watchDebt * (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, totalPayments)) / 
                         (Math.pow(1 + monthlyInterestRate, totalPayments) - 1);
      }
    } else {
      // Bullet payment - interest only during term
      monthlyPayment = watchDebt * monthlyInterestRate;
    }
  }

  // Pie chart data
  const pieData = [
    { name: t('feasly.finance.equity'), value: watchEquity, color: '#3b82f6' },
    { name: t('feasly.finance.debt'), value: watchDebt, color: '#ef4444' },
  ].filter(item => item.value > 0);

  // Waterfall placeholder data
  const waterfallData = [
    { tier: 1, returnType: t('feasly.finance.preferred_return'), threshold: `${form.watch("preferred_irr")}%`, share: "100%" },
    { tier: 2, returnType: t('feasly.finance.return_of_capital'), threshold: "100%", share: "100%" },
    { tier: 3, returnType: t('feasly.finance.promoted_interest'), threshold: `${form.watch("hurdle_irr")}%`, share: "80% / 20%" },
  ];

  // Prefill logic from localStorage
  useEffect(() => {
    // Check for project data from Feasly Model
    const modelData = localStorage.getItem('feasly_model_data');
    if (modelData) {
      try {
        const data = JSON.parse(modelData);
        
        // Prefill from model data
        if (data.equity_contribution) form.setValue("equity_amount", data.equity_contribution);
        if (data.loan_amount) form.setValue("debt_amount", data.loan_amount);
        if (data.interest_rate) form.setValue("interest_rate", data.interest_rate);
        if (data.loan_term_years) form.setValue("loan_term_years", data.loan_term_years);
        if (data.grace_period_months) form.setValue("grace_period_months", data.grace_period_months);
        if (data.currency_code) form.setValue("currency_code", data.currency_code);
        if (data.loan_repayment_type) {
          form.setValue("repayment_type", data.loan_repayment_type.toLowerCase() === "bullet" ? "bullet" : "amortized");
        }

        toast({
          title: t('feasly.finance.model_data_loaded'),
          description: t('feasly.finance.model_data_loaded_desc'),
        });
      } catch (error) {
        console.error('Error loading model data:', error);
      }
    }
  }, [form, toast, t]);

  const onSubmit = (data: FinanceFormData) => {
    // For now, just log the data
    console.log("Finance data:", data);
    
    toast({
      title: t('feasly.finance.data_saved'),
      description: t('feasly.finance.data_saved_desc'),
    });
  };

  return (
    <div className={cn("p-8 max-w-7xl mx-auto", isRTL && "rtl")} dir={isRTL ? "rtl" : "ltr"}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <DollarSign className="h-8 w-8" />
          {t('feasly.finance.title')}
        </h1>
        <p className="text-muted-foreground">{t('feasly.finance.description')}</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid gap-8 lg:grid-cols-3">
            
            {/* 1. Capital Structure Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5" />
                  {t('feasly.finance.capital_structure')}
                </CardTitle>
                <CardDescription>{t('feasly.finance.capital_structure_desc')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* Equity Input */}
                <FormField
                  control={form.control}
                  name="equity_amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        {t('feasly.finance.equity_amount')}
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{t('feasly.finance.equity_amount_tooltip')}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder={`${watchCurrency} 0`}
                          {...field} 
                          onChange={e => field.onChange(parseFloat(e.target.value) || 0)} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Debt Input */}
                <FormField
                  control={form.control}
                  name="debt_amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        {t('feasly.finance.debt_amount')}
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{t('feasly.finance.debt_amount_tooltip')}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder={`${watchCurrency} 0`}
                          {...field} 
                          onChange={e => field.onChange(parseFloat(e.target.value) || 0)} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Capital Structure Summary */}
                {totalCapital > 0 && (
                  <div className="space-y-3 p-4 bg-muted rounded-lg">
                    <h4 className="font-medium">{t('feasly.finance.capital_summary')}</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t('feasly.finance.equity_percentage')}</span>
                        <span className="font-medium text-blue-600">{equityPercentage.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t('feasly.finance.debt_percentage')}</span>
                        <span className="font-medium text-red-600">{debtPercentage.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span className="text-muted-foreground">{t('feasly.finance.total_capital')}</span>
                        <span className="font-bold">{watchCurrency} {totalCapital.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Pie Chart */}
                {pieData.length > 0 && (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <RechartsTooltip formatter={(value: number) => [`${watchCurrency} ${value.toLocaleString()}`, '']} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 2. Debt Details Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  {t('feasly.finance.debt_details')}
                </CardTitle>
                <CardDescription>{t('feasly.finance.debt_details_desc')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* Interest Rate */}
                <FormField
                  control={form.control}
                  name="interest_rate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('feasly.finance.interest_rate')} (%)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.1"
                          {...field} 
                          onChange={e => field.onChange(parseFloat(e.target.value) || 0)} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Loan Term */}
                <FormField
                  control={form.control}
                  name="loan_term_years"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('feasly.finance.loan_term_years')}</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.5"
                          {...field} 
                          onChange={e => field.onChange(parseFloat(e.target.value) || 0)} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Grace Period */}
                <FormField
                  control={form.control}
                  name="grace_period_months"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('feasly.finance.grace_period_months')}</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field} 
                          onChange={e => field.onChange(parseInt(e.target.value) || 0)} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Repayment Type */}
                <FormField
                  control={form.control}
                  name="repayment_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('feasly.finance.repayment_type')}</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="amortized">{t('feasly.finance.amortized')}</SelectItem>
                          <SelectItem value="bullet">{t('feasly.finance.bullet')}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Monthly Payment Calculation */}
                {watchDebt > 0 && (
                  <div className="space-y-3 p-4 bg-muted rounded-lg">
                    <h4 className="font-medium">{t('feasly.finance.payment_calculation')}</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t('feasly.finance.monthly_payment')}</span>
                        <span className="font-bold">{watchCurrency} {monthlyPayment.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t('feasly.finance.payment_type')}</span>
                        <span className="font-medium">
                          {watchRepaymentType === "bullet" ? t('feasly.finance.interest_only') : t('feasly.finance.principal_interest')}
                        </span>
                      </div>
                      {watchGracePeriod > 0 && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{t('feasly.finance.grace_period')}</span>
                          <span className="font-medium">{watchGracePeriod} {t('feasly.finance.months')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 3. Waterfall Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  {t('feasly.finance.return_waterfall')}
                </CardTitle>
                <CardDescription>{t('feasly.finance.waterfall_desc')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* Preferred IRR */}
                <FormField
                  control={form.control}
                  name="preferred_irr"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('feasly.finance.preferred_irr')} (%)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.1"
                          {...field} 
                          onChange={e => field.onChange(parseFloat(e.target.value) || 0)} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Hurdle IRR */}
                <FormField
                  control={form.control}
                  name="hurdle_irr"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('feasly.finance.hurdle_irr')} (%)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.1"
                          {...field} 
                          onChange={e => field.onChange(parseFloat(e.target.value) || 0)} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Waterfall Table */}
                <div className="space-y-2">
                  <h4 className="font-medium">{t('feasly.finance.distribution_waterfall')}</h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('feasly.finance.tier')}</TableHead>
                        <TableHead>{t('feasly.finance.return_type')}</TableHead>
                        <TableHead>{t('feasly.finance.threshold')}</TableHead>
                        <TableHead>{t('feasly.finance.share')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {waterfallData.map((tier, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{tier.tier}</TableCell>
                          <TableCell>{tier.returnType}</TableCell>
                          <TableCell>{tier.threshold}</TableCell>
                          <TableCell>{tier.share}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="p-3 bg-muted rounded-lg text-sm text-muted-foreground">
                  <p>{t('feasly.finance.waterfall_note')}</p>
                </div>
              </CardContent>
            </Card>

          </div>
        </form>
      </Form>
    </div>
  );
}