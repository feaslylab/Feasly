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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CalendarIcon, Building2, Calendar as CalendarIconLucide, DollarSign, TrendingUp, MapPin, Clock, Info, Layers } from "lucide-react";
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
  
  // Scenario state management
  const [activeScenario, setActiveScenario] = useState<string>("base");
  const [scenarioOverrides, setScenarioOverrides] = useState<Record<string, Record<string, number>>>({
    base: {},
    optimistic: {},
    pessimistic: {},
    custom: {}
  });

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

  // Helper function to get scenario-aware values
  const getScenarioValue = (baseValue: number | undefined, overrideKey: string): number => {
    const override = scenarioOverrides[activeScenario]?.[overrideKey];
    return override !== undefined ? override : (baseValue || 0);
  };

  // Calculate KPIs based on active scenario
  const scenarioLandCost = getScenarioValue(watchLandCost, 'land_cost');
  const scenarioConstructionCost = getScenarioValue(watchConstructionCost, 'construction_cost');
  const scenarioAverageSalePrice = getScenarioValue(form.watch("average_sale_price"), 'average_sale_price');
  const scenarioYieldEstimate = getScenarioValue(form.watch("yield_estimate"), 'yield_estimate');
  const scenarioTargetIRR = getScenarioValue(form.watch("target_irr"), 'target_irr');
  const scenarioLeaseRate = getScenarioValue(form.watch("expected_lease_rate"), 'expected_lease_rate');

  // KPI Calculations
  const scenarioTotalCost = scenarioLandCost + scenarioConstructionCost + (watchSoftCosts || 0) + (watchMarketingCost || 0) + contingencyValue;
  const scenarioTotalRevenue = scenarioAverageSalePrice * (watchTotalGfa || 0);
  const scenarioProfit = scenarioTotalRevenue - scenarioTotalCost;
  const scenarioProfitMargin = scenarioTotalRevenue > 0 ? (scenarioProfit / scenarioTotalRevenue) * 100 : 0;
  const scenarioROI = scenarioTotalCost > 0 ? (scenarioProfit / scenarioTotalCost) * 100 : 0;
  const paybackPeriod = scenarioLeaseRate > 0 && watchTotalGfa ? (scenarioTotalCost / (scenarioLeaseRate * watchTotalGfa * 12)) : 0;
  
  // Zakat calculation
  const zakatDue = watchZakat && watchContingencyPercent ? scenarioProfit * ((form.watch("zakat_rate_percent") || 2.5) / 100) : 0;

  // Helper function for KPI color coding
  const getKPIColor = (value: number, type: 'irr' | 'roi' | 'margin' | 'payback') => {
    switch (type) {
      case 'irr':
      case 'roi':
        return value >= 15 ? 'text-green-600' : value >= 10 ? 'text-yellow-600' : 'text-red-600';
      case 'margin':
        return value >= 20 ? 'text-green-600' : value >= 10 ? 'text-yellow-600' : 'text-red-600';
      case 'payback':
        return value <= 5 ? 'text-green-600' : value <= 10 ? 'text-yellow-600' : 'text-red-600';
      default:
        return 'text-foreground';
    }
  };

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

          {/* 8. KPI Results Section */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                {t('feasly.model.scenario_results')}
              </CardTitle>
              <CardDescription>
                {t('feasly.model.scenario_results_desc')} {
                  activeScenario === 'base' ? t('feasly.model.scenario_base') :
                  activeScenario === 'optimistic' ? t('feasly.model.scenario_optimistic') :
                  activeScenario === 'pessimistic' ? t('feasly.model.scenario_pessimistic') :
                  t('feasly.model.scenario_custom')
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                
                {/* IRR Card */}
                <Card className="animate-fade-in">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      {t('feasly.model.kpi_irr')}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-4 w-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{t('feasly.model.kpi_irr_tooltip')}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className={cn("text-2xl font-bold", getKPIColor(scenarioTargetIRR, 'irr'))}>
                      {scenarioTargetIRR.toFixed(1)}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {scenarioTargetIRR >= 15 ? t('feasly.model.excellent') : 
                       scenarioTargetIRR >= 10 ? t('feasly.model.good') : t('feasly.model.needs_improvement')}
                    </p>
                  </CardContent>
                </Card>

                {/* Payback Period Card */}
                <Card className="animate-fade-in">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      {t('feasly.model.kpi_payback_period')}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-4 w-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{t('feasly.model.kpi_payback_period_tooltip')}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className={cn("text-2xl font-bold", getKPIColor(paybackPeriod, 'payback'))}>
                      {paybackPeriod > 0 ? `${paybackPeriod.toFixed(1)}` : '--'}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {paybackPeriod > 0 ? `${t('feasly.model.years')}` : t('feasly.model.insufficient_data')}
                    </p>
                  </CardContent>
                </Card>

                {/* Total Revenue Card */}
                <Card className="animate-fade-in">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      {t('feasly.model.kpi_total_revenue')}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-4 w-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{t('feasly.model.kpi_total_revenue_tooltip')}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="text-2xl font-bold text-blue-600">
                      {watchCurrencyCode || 'AED'} {scenarioTotalRevenue.toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {scenarioAverageSalePrice.toLocaleString()} × {(watchTotalGfa || 0).toLocaleString()} sqm
                    </p>
                  </CardContent>
                </Card>

                {/* Total Cost Card */}
                <Card className="animate-fade-in">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      {t('feasly.model.kpi_total_cost')}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-4 w-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{t('feasly.model.kpi_total_cost_tooltip')}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="text-2xl font-bold text-red-600">
                      {watchCurrencyCode || 'AED'} {scenarioTotalCost.toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {t('feasly.model.includes_contingency')}
                    </p>
                  </CardContent>
                </Card>

                {/* Profit Margin Card */}
                <Card className="animate-fade-in">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      {t('feasly.model.kpi_profit_margin')}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-4 w-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{t('feasly.model.kpi_profit_margin_tooltip')}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className={cn("text-2xl font-bold", getKPIColor(scenarioProfitMargin, 'margin'))}>
                      {scenarioProfitMargin.toFixed(1)}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {scenarioProfitMargin >= 20 ? t('feasly.model.excellent') : 
                       scenarioProfitMargin >= 10 ? t('feasly.model.good') : t('feasly.model.needs_improvement')}
                    </p>
                  </CardContent>
                </Card>

                {/* ROI Card */}
                <Card className="animate-fade-in">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      {t('feasly.model.kpi_roi')}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-4 w-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{t('feasly.model.kpi_roi_tooltip')}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className={cn("text-2xl font-bold", getKPIColor(scenarioROI, 'roi'))}>
                      {scenarioROI.toFixed(1)}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {scenarioROI >= 15 ? t('feasly.model.excellent') : 
                       scenarioROI >= 10 ? t('feasly.model.good') : t('feasly.model.needs_improvement')}
                    </p>
                  </CardContent>
                </Card>

                {/* Net Profit Card */}
                <Card className="animate-fade-in">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      {t('feasly.model.kpi_net_profit')}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-4 w-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{t('feasly.model.kpi_net_profit_tooltip')}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className={cn("text-2xl font-bold", scenarioProfit >= 0 ? "text-green-600" : "text-red-600")}>
                      {watchCurrencyCode || 'AED'} {scenarioProfit.toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {scenarioProfit >= 0 ? t('feasly.model.profitable') : t('feasly.model.loss')}
                    </p>
                  </CardContent>
                </Card>

                {/* Zakat Card (only if enabled) */}
                {watchZakat && zakatDue > 0 && (
                  <Card className="animate-fade-in">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        {t('feasly.model.kpi_zakat_payable')}
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{t('feasly.model.kpi_zakat_payable_tooltip')}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="text-2xl font-bold text-purple-600">
                        {watchCurrencyCode || 'AED'} {zakatDue.toLocaleString()}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {(form.watch("zakat_rate_percent") || 2.5)}% {t('feasly.model.of_profit')}
                      </p>
                    </CardContent>
                  </Card>
                )}

              </div>

              {/* Scenario Comparison Summary */}
              {(scenarioTotalRevenue > 0 || scenarioTotalCost > 0) && (
                <div className="mt-6 p-4 bg-muted rounded-lg animate-fade-in">
                  <h4 className="font-medium mb-3">{t('feasly.model.financial_summary')}</h4>
                  <div className="grid gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('feasly.model.total_investment')}:</span>
                      <span className="font-medium">{watchCurrencyCode || 'AED'} {scenarioTotalCost.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('feasly.model.expected_revenue')}:</span>
                      <span className="font-medium">{watchCurrencyCode || 'AED'} {scenarioTotalRevenue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-muted-foreground">{t('feasly.model.net_profit')}:</span>
                      <span className={cn("font-bold", scenarioProfit >= 0 ? "text-green-600" : "text-red-600")}>
                        {watchCurrencyCode || 'AED'} {scenarioProfit.toLocaleString()}
                      </span>
                    </div>
                    {watchZakat && zakatDue > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t('feasly.model.zakat_due')}:</span>
                        <span className="font-medium text-purple-600">{watchCurrencyCode || 'AED'} {zakatDue.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          </div>

          {/* 7. Scenario Toggle Section */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="h-5 w-5" />
                {t('feasly.model.scenarios')}
              </CardTitle>
              <CardDescription>{t('feasly.model.scenarios_desc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeScenario} onValueChange={setActiveScenario} className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger 
                    value="base" 
                    className="data-[state=active]:bg-blue-500 data-[state=active]:text-white"
                  >
                    {t('feasly.model.scenario_base')}
                  </TabsTrigger>
                  <TabsTrigger 
                    value="optimistic"
                    className="data-[state=active]:bg-green-500 data-[state=active]:text-white"
                  >
                    {t('feasly.model.scenario_optimistic')}
                  </TabsTrigger>
                  <TabsTrigger 
                    value="pessimistic"
                    className="data-[state=active]:bg-red-500 data-[state=active]:text-white"
                  >
                    {t('feasly.model.scenario_pessimistic')}
                  </TabsTrigger>
                  <TabsTrigger 
                    value="custom"
                    className="data-[state=active]:bg-purple-500 data-[state=active]:text-white"
                  >
                    {t('feasly.model.scenario_custom')}
                  </TabsTrigger>
                </TabsList>

                <div className="mt-6">
                  <div className="mb-4 p-3 bg-muted rounded-lg">
                    <p className="text-sm font-medium">
                      {t('feasly.model.editing_scenario')}: {
                        activeScenario === 'base' ? t('feasly.model.scenario_base') :
                        activeScenario === 'optimistic' ? t('feasly.model.scenario_optimistic') :
                        activeScenario === 'pessimistic' ? t('feasly.model.scenario_pessimistic') :
                        t('feasly.model.scenario_custom')
                      }
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t('feasly.model.scenario_override_note')}
                    </p>
                  </div>

                  <TabsContent value={activeScenario} className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      
                      {/* Construction Cost Override */}
                      <div className="space-y-2">
                        <FormLabel className="flex items-center gap-2">
                          {t('feasly.model.override_construction_cost')}
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <Info className="h-4 w-4 text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{t('feasly.model.override_construction_cost_tooltip')}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </FormLabel>
                        <Input
                          type="number"
                          placeholder={`${t('feasly.model.base_value')}: ${watchCurrencyCode || 'AED'} ${(watchConstructionCost || 0).toLocaleString()}`}
                          value={scenarioOverrides[activeScenario]?.construction_cost || ''}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value);
                            setScenarioOverrides(prev => ({
                              ...prev,
                              [activeScenario]: {
                                ...prev[activeScenario],
                                construction_cost: isNaN(value) ? undefined : value
                              }
                            }));
                          }}
                        />
                        {scenarioOverrides[activeScenario]?.construction_cost && (
                          <div className="text-xs text-muted-foreground">
                            {t('feasly.model.override_active')}: {watchCurrencyCode || 'AED'} {scenarioOverrides[activeScenario].construction_cost.toLocaleString()}
                          </div>
                        )}
                      </div>

                      {/* Land Cost Override */}
                      <div className="space-y-2">
                        <FormLabel className="flex items-center gap-2">
                          {t('feasly.model.override_land_cost')}
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <Info className="h-4 w-4 text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{t('feasly.model.override_land_cost_tooltip')}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </FormLabel>
                        <Input
                          type="number"
                          placeholder={`${t('feasly.model.base_value')}: ${watchCurrencyCode || 'AED'} ${(watchLandCost || 0).toLocaleString()}`}
                          value={scenarioOverrides[activeScenario]?.land_cost || ''}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value);
                            setScenarioOverrides(prev => ({
                              ...prev,
                              [activeScenario]: {
                                ...prev[activeScenario],
                                land_cost: isNaN(value) ? undefined : value
                              }
                            }));
                          }}
                        />
                        {scenarioOverrides[activeScenario]?.land_cost && (
                          <div className="text-xs text-muted-foreground">
                            {t('feasly.model.override_active')}: {watchCurrencyCode || 'AED'} {scenarioOverrides[activeScenario].land_cost.toLocaleString()}
                          </div>
                        )}
                      </div>

                      {/* Revenue Override (Average Sale Price) */}
                      <div className="space-y-2">
                        <FormLabel className="flex items-center gap-2">
                          {t('feasly.model.override_revenue')}
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <Info className="h-4 w-4 text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{t('feasly.model.override_revenue_tooltip')}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </FormLabel>
                        <Input
                          type="number"
                          placeholder={`${t('feasly.model.base_value')}: ${watchCurrencyCode || 'AED'} ${(form.watch("average_sale_price") || 0).toLocaleString()}`}
                          value={scenarioOverrides[activeScenario]?.average_sale_price || ''}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value);
                            setScenarioOverrides(prev => ({
                              ...prev,
                              [activeScenario]: {
                                ...prev[activeScenario],
                                average_sale_price: isNaN(value) ? undefined : value
                              }
                            }));
                          }}
                        />
                        {scenarioOverrides[activeScenario]?.average_sale_price && (
                          <div className="text-xs text-muted-foreground">
                            {t('feasly.model.override_active')}: {watchCurrencyCode || 'AED'} {scenarioOverrides[activeScenario].average_sale_price.toLocaleString()}
                          </div>
                        )}
                      </div>

                      {/* Yield Estimate Override */}
                      <div className="space-y-2">
                        <FormLabel className="flex items-center gap-2">
                          {t('feasly.model.override_yield_estimate')}
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <Info className="h-4 w-4 text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{t('feasly.model.override_yield_estimate_tooltip')}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </FormLabel>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder={`${t('feasly.model.base_value')}: ${(form.watch("yield_estimate") || 0)}%`}
                          value={scenarioOverrides[activeScenario]?.yield_estimate || ''}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value);
                            setScenarioOverrides(prev => ({
                              ...prev,
                              [activeScenario]: {
                                ...prev[activeScenario],
                                yield_estimate: isNaN(value) ? undefined : value
                              }
                            }));
                          }}
                        />
                        {scenarioOverrides[activeScenario]?.yield_estimate && (
                          <div className="text-xs text-muted-foreground">
                            {t('feasly.model.override_active')}: {scenarioOverrides[activeScenario].yield_estimate}%
                          </div>
                        )}
                      </div>

                      {/* Target IRR Override */}
                      <div className="space-y-2">
                        <FormLabel className="flex items-center gap-2">
                          {t('feasly.model.override_target_irr')}
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <Info className="h-4 w-4 text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{t('feasly.model.override_target_irr_tooltip')}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </FormLabel>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder={`${t('feasly.model.base_value')}: ${(form.watch("target_irr") || 0)}%`}
                          value={scenarioOverrides[activeScenario]?.target_irr || ''}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value);
                            setScenarioOverrides(prev => ({
                              ...prev,
                              [activeScenario]: {
                                ...prev[activeScenario],
                                target_irr: isNaN(value) ? undefined : value
                              }
                            }));
                          }}
                        />
                        {scenarioOverrides[activeScenario]?.target_irr && (
                          <div className="text-xs text-muted-foreground">
                            {t('feasly.model.override_active')}: {scenarioOverrides[activeScenario].target_irr}%
                          </div>
                        )}
                      </div>

                      {/* Expected Lease Rate Override */}
                      <div className="space-y-2">
                        <FormLabel className="flex items-center gap-2">
                          {t('feasly.model.override_lease_rate')}
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <Info className="h-4 w-4 text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{t('feasly.model.override_lease_rate_tooltip')}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </FormLabel>
                        <Input
                          type="number"
                          placeholder={`${t('feasly.model.base_value')}: ${watchCurrencyCode || 'AED'} ${(form.watch("expected_lease_rate") || 0).toLocaleString()}`}
                          value={scenarioOverrides[activeScenario]?.expected_lease_rate || ''}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value);
                            setScenarioOverrides(prev => ({
                              ...prev,
                              [activeScenario]: {
                                ...prev[activeScenario],
                                expected_lease_rate: isNaN(value) ? undefined : value
                              }
                            }));
                          }}
                        />
                        {scenarioOverrides[activeScenario]?.expected_lease_rate && (
                          <div className="text-xs text-muted-foreground">
                            {t('feasly.model.override_active')}: {watchCurrencyCode || 'AED'} {scenarioOverrides[activeScenario].expected_lease_rate.toLocaleString()}
                          </div>
                        )}
                      </div>

                    </div>

                    {/* Scenario Summary */}
                    {Object.keys(scenarioOverrides[activeScenario] || {}).length > 0 && (
                      <div className="mt-6 p-4 bg-muted rounded-lg">
                        <h4 className="font-medium mb-2">{t('feasly.model.scenario_summary')}</h4>
                        <div className="space-y-1 text-sm">
                          {Object.entries(scenarioOverrides[activeScenario] || {}).map(([key, value]) => {
                            if (value !== undefined) {
                              const isPercentage = key.includes('yield') || key.includes('irr');
                              const displayValue = isPercentage ? `${value}%` : `${watchCurrencyCode || 'AED'} ${value.toLocaleString()}`;
                              return (
                                <p key={key} className="text-muted-foreground">
                                  • {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}: {displayValue}
                                </p>
                              );
                            }
                            return null;
                          })}
                        </div>
                      </div>
                    )}

                  </TabsContent>
                </div>
              </Tabs>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-4 pt-6">
            <Button type="button" variant="outline">{t('feasly.model.save_draft')}</Button>
            <Button type="submit">{t('feasly.model.generate_model')}</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}