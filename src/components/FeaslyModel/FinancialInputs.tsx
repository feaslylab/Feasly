import { useFormContext } from "react-hook-form";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DollarSign, Info } from "lucide-react";
import type { FeaslyModelFormData } from "./types";

export function FinancialInputs() {
  const { t } = useLanguage();
  const form = useFormContext<FeaslyModelFormData>();

  // Watch values for dynamic calculations
  const watchLandCost = form.watch("land_cost") || 0;
  const watchConstructionCost = form.watch("construction_cost") || 0;
  const watchSoftCosts = form.watch("soft_costs") || 0;
  const watchMarketingCost = form.watch("marketing_cost") || 0;
  const watchContingencyPercent = form.watch("contingency_percent") || 0;
  const watchZakatApplicable = form.watch("zakat_applicable");
  const watchEscrowRequired = form.watch("escrow_required");

  // Calculate totals
  const subtotal = watchLandCost + watchConstructionCost + watchSoftCosts + watchMarketingCost;
  const contingencyValue = subtotal * (watchContingencyPercent / 100);
  const totalInvestment = subtotal + contingencyValue;

  const fundingTypes = [
    { value: "equity", label: "100% Equity" },
    { value: "debt", label: "100% Debt" },
    { value: "mixed", label: "Mixed (Equity + Debt)" },
    { value: "islamic", label: "Islamic Financing" },
  ];

  const repaymentTypes = [
    { value: "equal_installments", label: "Equal Installments" },
    { value: "bullet", label: "Bullet Payment" },
    { value: "interest_only", label: "Interest Only" },
    { value: "graduated", label: "Graduated Payment" },
  ];

  return (
    <div className="space-y-6">
      {/* Financial Inputs */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5 text-primary" />
            <CardTitle>{t('feasly.model.financial_inputs')}</CardTitle>
          </div>
          <CardDescription>
            {t('feasly.model.financial_inputs_desc')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="land_cost"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('feasly.model.land_cost')}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="construction_cost"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('feasly.model.construction_cost')}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="soft_costs"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('feasly.model.soft_costs')}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="marketing_cost"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('feasly.model.marketing_cost')}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contingency_percent"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center space-x-2">
                    <FormLabel>{t('feasly.model.contingency_percent')}</FormLabel>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{t('feasly.model.contingency_value')}: {contingencyValue.toLocaleString()}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Cost Summary */}
          {subtotal > 0 && (
            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="text-sm font-medium mb-2">Cost Summary</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span className="ml-2 font-medium">{subtotal.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Contingency:</span>
                  <span className="ml-2 font-medium">{contingencyValue.toLocaleString()}</span>
                </div>
                <div className="md:col-span-2 pt-2 border-t">
                  <span className="text-muted-foreground">Total Investment:</span>
                  <span className="ml-2 font-bold text-lg">{totalInvestment.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

          {/* Islamic Finance Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="zakat_applicable"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      {t('feasly.model.zakat_applicable')}
                    </FormLabel>
                    <div className="text-sm text-muted-foreground">
                      {t('feasly.model.zakat_applicable_desc')}
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="escrow_required"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      {t('feasly.model.escrow_required')}
                    </FormLabel>
                    <div className="text-sm text-muted-foreground">
                      {t('feasly.model.escrow_required_desc')}
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          {watchZakatApplicable && (
            <FormField
              control={form.control}
              name="zakat_rate_percent"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('feasly.model.zakat_rate_percent')}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      placeholder="2.5"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </CardContent>
      </Card>

      {/* Funding & Capital */}
      <Card>
        <CardHeader>
          <CardTitle>{t('feasly.model.funding_capital')}</CardTitle>
          <CardDescription>
            {t('feasly.model.funding_capital_desc')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="funding_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('feasly.model.funding_type')}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select funding type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {fundingTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="total_funding"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('feasly.model.total_funding')}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="equity_contribution"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('feasly.model.equity_contribution')}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="loan_amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('feasly.model.loan_amount')}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="interest_rate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('feasly.model.interest_rate')}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="loan_term_years"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('feasly.model.loan_term_years')}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      step="1"
                      placeholder="0"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="grace_period_months"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('feasly.model.grace_period_months')}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      step="1"
                      placeholder="0"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="loan_repayment_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('feasly.model.loan_repayment_type')}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select repayment type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {repaymentTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* Revenue Projections */}
      <Card>
        <CardHeader>
          <CardTitle>{t('feasly.model.revenue_projections')}</CardTitle>
          <CardDescription>
            {t('feasly.model.revenue_projections_desc')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FormField
              control={form.control}
              name="average_sale_price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('feasly.model.average_sale_price')}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="expected_sale_rate_sqm_per_month"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('feasly.model.expected_sale_rate')}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="expected_lease_rate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('feasly.model.expected_lease_rate')}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="yield_estimate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('feasly.model.yield_estimate')}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="target_irr"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('feasly.model.target_irr')}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="target_roi"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('feasly.model.target_roi')}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}