import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CalendarIcon, Building2, Calendar as CalendarIconLucide, DollarSign, TrendingUp, MapPin, Clock, Info } from "lucide-react";
import { format, addMonths } from "date-fns";
import { useState } from "react";

const formSchema = z.object({
  // Project Metadata
  project_name: z.string().min(1, "Project name is required"),
  description: z.string().optional(),
  location: z.string().optional(),
  sponsor_name: z.string().optional(),
  land_owner: z.string().optional(),
  country: z.string().optional(),
  city: z.string().optional(),
  planning_stage: z.string().optional(),
  currency_code: z.string().optional(),
  language: z.string().optional(),
  
  // Timeline & Phases
  start_date: z.date().optional(),
  duration_months: z.number().min(0).optional(),
  construction_start_date: z.date().optional(),
  completion_date: z.date().optional(),
  stabilization_period_months: z.number().min(0).optional(),
  phasing_enabled: z.boolean().default(false),
  
  // Site & Area Metrics
  site_area_sqm: z.number().min(0).optional(),
  total_gfa_sqm: z.number().min(0).optional(),
  efficiency_ratio: z.number().min(0).max(100).optional(),
  far_ratio: z.number().min(0).optional(),
  height_stories: z.number().min(0).optional(),
  plot_number: z.string().optional(),
  masterplan_url: z.string().optional(),
  
  // Financial Inputs
  land_cost: z.number().min(0).optional(),
  construction_cost: z.number().min(0).optional(),
  soft_costs: z.number().min(0).optional(),
  marketing_cost: z.number().min(0).optional(),
  contingency_percent: z.number().min(0).max(100).optional(),
  zakat_applicable: z.boolean().default(false),
  zakat_rate_percent: z.number().min(0).max(100).optional(),
  escrow_required: z.boolean().default(false),
  
  // Funding & Capital
  funding_type: z.string().optional(),
  total_funding: z.number().min(0).optional(),
  equity_contribution: z.number().min(0).optional(),
  loan_amount: z.number().min(0).optional(),
  interest_rate: z.number().min(0).max(100).optional(),
  loan_term_years: z.number().min(0).optional(),
  grace_period_months: z.number().min(0).optional(),
  loan_repayment_type: z.string().optional(),
  
  // Revenue Projections
  average_sale_price: z.number().min(0).optional(),
  expected_sale_rate_sqm_per_month: z.number().min(0).optional(),
  expected_lease_rate: z.number().min(0).optional(),
  yield_estimate: z.number().min(0).max(100).optional(),
  target_irr: z.number().min(0).max(100).optional(),
  target_roi: z.number().min(0).max(100).optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function FeaslyModel() {
  const { t, isRTL } = useLanguage();
  const [phases, setPhases] = useState<Array<{ phase_name: string; phase_start: Date | null; phase_end: Date | null; gfa_percent: number }>>([]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      phasing_enabled: false,
      zakat_applicable: false,
      escrow_required: false,
      currency_code: "AED",
      language: "English",
      country: "UAE",
      planning_stage: "Feasibility",
      funding_type: "Mix",
      loan_repayment_type: "Amortized",
    },
  });

  const watchPhasing = form.watch("phasing_enabled");
  const watchZakat = form.watch("zakat_applicable");
  const watchSiteArea = form.watch("site_area_sqm");
  const watchTotalGfa = form.watch("total_gfa_sqm");
  
  // Watch for calculated fields
  const watchStartDate = form.watch("start_date");
  const watchDurationMonths = form.watch("duration_months");
  const watchLandCost = form.watch("land_cost");
  const watchConstructionCost = form.watch("construction_cost");
  const watchSoftCosts = form.watch("soft_costs");
  const watchMarketingCost = form.watch("marketing_cost");
  const watchContingencyPercent = form.watch("contingency_percent");
  const watchTotalFunding = form.watch("total_funding");
  const watchEquityContribution = form.watch("equity_contribution");
  const watchLoanAmount = form.watch("loan_amount");
  const watchCurrencyCode = form.watch("currency_code");

  // Calculate buildable ratio
  const buildableRatio = watchSiteArea && watchTotalGfa ? (watchTotalGfa / watchSiteArea).toFixed(2) : null;

  // Calculate end date
  const calculatedEndDate = watchStartDate && watchDurationMonths 
    ? addMonths(watchStartDate, watchDurationMonths)
    : null;

  // Calculate contingency value and total investment
  const nonLandCosts = (watchConstructionCost || 0) + (watchSoftCosts || 0) + (watchMarketingCost || 0);
  const contingencyValue = nonLandCosts * ((watchContingencyPercent || 0) / 100);
  const totalInvestment = (watchLandCost || 0) + nonLandCosts + contingencyValue;

  // Calculate funding gap
  const totalFundingSources = (watchEquityContribution || 0) + (watchLoanAmount || 0);
  const fundingGap = (watchTotalFunding || 0) - totalFundingSources;

  const onSubmit = (data: FormData) => {
    console.log("Form submitted:", data);
    // Handle form submission here
  };

  const DatePickerField = ({ field, placeholder }: { field: any; placeholder: string }) => (
    <Popover>
      <PopoverTrigger asChild>
        <FormControl>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !field.value && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {field.value ? format(field.value, "PPP") : <span>{placeholder}</span>}
          </Button>
        </FormControl>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={field.value}
          onSelect={field.onChange}
          initialFocus
          className="pointer-events-auto"
        />
      </PopoverContent>
    </Popover>
  );

  return (
    <div className={cn("p-8 max-w-7xl mx-auto", isRTL && "rtl")} dir={isRTL ? "rtl" : "ltr"}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{t('feasly.model.title')}</h1>
        <p className="text-muted-foreground">{t('feasly.model.description')}</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid gap-8 lg:grid-cols-2">
            
            {/* 1. Project Metadata */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  {t('feasly.model.project_metadata')}
                </CardTitle>
                <CardDescription>{t('feasly.model.project_metadata_desc')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="project_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('feasly.model.project_name')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('feasly.model.project_name_placeholder')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('feasly.model.description')}</FormLabel>
                      <FormControl>
                        <Textarea placeholder={t('feasly.model.description_placeholder')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="sponsor_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('feasly.model.sponsor_name')}</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="land_owner"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('feasly.model.land_owner')}</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('feasly.model.country')}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('feasly.model.select_country')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="UAE">United Arab Emirates</SelectItem>
                            <SelectItem value="KSA">Kingdom of Saudi Arabia</SelectItem>
                            <SelectItem value="QAT">Qatar</SelectItem>
                            <SelectItem value="KWT">Kuwait</SelectItem>
                            <SelectItem value="BHR">Bahrain</SelectItem>
                            <SelectItem value="OMN">Oman</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('feasly.model.city')}</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="planning_stage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('feasly.model.planning_stage')}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Idea">Idea</SelectItem>
                            <SelectItem value="Pre-concept">Pre-concept</SelectItem>
                            <SelectItem value="Feasibility">Feasibility</SelectItem>
                            <SelectItem value="Design">Design</SelectItem>
                            <SelectItem value="Construction">Construction</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="currency_code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('feasly.model.currency')}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="AED">AED - UAE Dirham</SelectItem>
                            <SelectItem value="SAR">SAR - Saudi Riyal</SelectItem>
                            <SelectItem value="USD">USD - US Dollar</SelectItem>
                            <SelectItem value="QAR">QAR - Qatari Riyal</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* 2. Timeline & Phases */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  {t('feasly.model.timeline_phases')}
                </CardTitle>
                <CardDescription>{t('feasly.model.timeline_phases_desc')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="start_date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>{t('feasly.model.start_date')}</FormLabel>
                        <DatePickerField field={field} placeholder={t('feasly.model.select_date')} />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="duration_months"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('feasly.model.duration_months')}</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Calculated End Date */}
                {calculatedEndDate && (
                  <div className="space-y-2">
                    <FormLabel className="flex items-center gap-2">
                      {t('feasly.model.calculated_end_date')}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-4 w-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{t('feasly.model.calculated_end_date_tooltip')}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </FormLabel>
                    <Input 
                      value={format(calculatedEndDate, "PPP")} 
                      disabled
                      className="bg-muted"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="construction_start_date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>{t('feasly.model.construction_start')}</FormLabel>
                        <DatePickerField field={field} placeholder={t('feasly.model.select_date')} />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="completion_date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>{t('feasly.model.completion_date')}</FormLabel>
                        <DatePickerField field={field} placeholder={t('feasly.model.select_date')} />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="stabilization_period_months"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('feasly.model.stabilization_period')}</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phasing_enabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">{t('feasly.model.phasing_enabled')}</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          {t('feasly.model.phasing_enabled_desc')}
                        </div>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* 3. Site & Area Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  {t('feasly.model.site_area_metrics')}
                </CardTitle>
                <CardDescription>{t('feasly.model.site_area_metrics_desc')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="site_area_sqm"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('feasly.model.site_area_sqm')}</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="total_gfa_sqm"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('feasly.model.total_gfa_sqm')}</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {buildableRatio && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm font-medium">{t('feasly.model.buildable_ratio')}: {buildableRatio}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="efficiency_ratio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('feasly.model.efficiency_ratio')} (%)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="far_ratio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('feasly.model.far_ratio')}</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.1" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="height_stories"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('feasly.model.height_stories')}</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="plot_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('feasly.model.plot_number')}</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* 4. Financial Inputs */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  {t('feasly.model.financial_inputs')}
                </CardTitle>
                <CardDescription>{t('feasly.model.financial_inputs_desc')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="land_cost"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('feasly.model.land_cost')}</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
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
                          <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="soft_costs"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('feasly.model.soft_costs')}</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
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
                          <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="contingency_percent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('feasly.model.contingency_percent')} (%)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Total Investment Calculation */}
                {totalInvestment > 0 && (
                  <div className="space-y-2">
                    <FormLabel className="flex items-center gap-2">
                      {t('feasly.model.total_investment')}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-4 w-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{t('feasly.model.total_investment_tooltip')}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </FormLabel>
                    <Input 
                      value={`${watchCurrencyCode || 'AED'} ${totalInvestment.toLocaleString()}`}
                      disabled
                      className="bg-muted font-medium"
                    />
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>• Land Cost: {watchCurrencyCode || 'AED'} {(watchLandCost || 0).toLocaleString()}</p>
                      <p>• Construction: {watchCurrencyCode || 'AED'} {(watchConstructionCost || 0).toLocaleString()}</p>
                      <p>• Soft Costs: {watchCurrencyCode || 'AED'} {(watchSoftCosts || 0).toLocaleString()}</p>
                      <p>• Marketing: {watchCurrencyCode || 'AED'} {(watchMarketingCost || 0).toLocaleString()}</p>
                      <p>• Contingency ({watchContingencyPercent || 0}%): {watchCurrencyCode || 'AED'} {contingencyValue.toLocaleString()}</p>
                    </div>
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="zakat_applicable"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">{t('feasly.model.zakat_applicable')}</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          {t('feasly.model.zakat_applicable_desc')}
                        </div>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {watchZakat && (
                  <FormField
                    control={form.control}
                    name="zakat_rate_percent"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('feasly.model.zakat_rate_percent')} (%)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="escrow_required"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">{t('feasly.model.escrow_required')}</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          {t('feasly.model.escrow_required_desc')}
                        </div>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* 5. Funding & Capital */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  {t('feasly.model.funding_capital')}
                </CardTitle>
                <CardDescription>{t('feasly.model.funding_capital_desc')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="funding_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('feasly.model.funding_type')}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Equity">Equity</SelectItem>
                          <SelectItem value="Debt">Debt</SelectItem>
                          <SelectItem value="Mix">Mixed Funding</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="total_funding"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('feasly.model.total_funding')}</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
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
                          <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="loan_amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('feasly.model.loan_amount')}</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
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
                        <FormLabel>{t('feasly.model.interest_rate')} (%)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.1" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="loan_term_years"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('feasly.model.loan_term_years')}</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
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
                          <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="loan_repayment_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('feasly.model.loan_repayment_type')}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Bullet">Bullet Payment</SelectItem>
                          <SelectItem value="Amortized">Amortized</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Funding Gap Calculation */}
                {(watchTotalFunding || watchEquityContribution || watchLoanAmount) && (
                  <div className="space-y-2">
                    <FormLabel className="flex items-center gap-2">
                      {t('feasly.model.funding_gap')}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-4 w-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{t('feasly.model.funding_gap_tooltip')}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </FormLabel>
                    <Input 
                      value={`${watchCurrencyCode || 'AED'} ${fundingGap.toLocaleString()}`}
                      disabled
                      className={cn(
                        "bg-muted font-medium",
                        fundingGap > 0 ? "text-destructive" : "text-green-600"
                      )}
                    />
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>• Total Funding Required: {watchCurrencyCode || 'AED'} {(watchTotalFunding || 0).toLocaleString()}</p>
                      <p>• Equity Contribution: {watchCurrencyCode || 'AED'} {(watchEquityContribution || 0).toLocaleString()}</p>
                      <p>• Loan Amount: {watchCurrencyCode || 'AED'} {(watchLoanAmount || 0).toLocaleString()}</p>
                      <p className={cn(
                        "font-medium",
                        fundingGap > 0 ? "text-destructive" : "text-green-600"
                      )}>
                        • {fundingGap > 0 ? 'Funding Shortfall' : 'Funding Surplus'}: {watchCurrencyCode || 'AED'} {Math.abs(fundingGap).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 6. Revenue Projections */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  {t('feasly.model.revenue_projections')}
                </CardTitle>
                <CardDescription>{t('feasly.model.revenue_projections_desc')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="average_sale_price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('feasly.model.average_sale_price')}</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
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
                          <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="expected_lease_rate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('feasly.model.expected_lease_rate')}</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
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
                        <FormLabel>{t('feasly.model.yield_estimate')} (%)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.1" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="target_irr"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('feasly.model.target_irr')} (%)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.1" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
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
                        <FormLabel>{t('feasly.model.target_roi')} (%)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.1" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

          </div>

          <div className="flex justify-end space-x-4 pt-6">
            <Button type="button" variant="outline">{t('feasly.model.save_draft')}</Button>
            <Button type="submit">{t('feasly.model.generate_model')}</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}