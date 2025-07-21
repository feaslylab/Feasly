import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CalendarIcon, Plus, Trash2, Clock, BarChart3, Calculator, Info, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format, addMonths, isAfter, isBefore } from "date-fns";

// Phase data structure
interface Phase {
  id: string;
  name: string;
  startDate: Date | null;
  duration: number;
  endDate: Date | null;
  gfa: number;
  landArea: number;
  phaseCost: number;
  startsAfter?: string;
}

// Form schema for individual phase
const phaseSchema = z.object({
  name: z.string().min(1, "Phase name is required"),
  startDate: z.date().optional(),
  duration: z.number().min(0.1, "Duration must be positive"),
  gfa: z.number().min(0, "GFA must be positive"),
  landArea: z.number().min(0, "Land area must be positive"),
  phaseCost: z.number().min(0, "Phase cost must be positive"),
  startsAfter: z.string().optional(),
});

type PhaseFormData = z.infer<typeof phaseSchema>;

export default function FeaslyFlow() {
  const { isRTL } = useLanguage();
  const { t } = useTranslation('feasly.flow');
  const { toast } = useToast();
  const [phases, setPhases] = useState<Phase[]>([]);
  const [editingPhase, setEditingPhase] = useState<string | null>(null);
  const [currency] = useState("AED"); // This could come from project settings

  const form = useForm<PhaseFormData>({
    resolver: zodResolver(phaseSchema),
    defaultValues: {
      name: "",
      duration: 6,
      gfa: 0,
      landArea: 0,
      phaseCost: 0,
    },
  });

  // Watch form values for reactive calculations
  const watchStartDate = form.watch("startDate");
  const watchDuration = form.watch("duration");
  const watchStartsAfter = form.watch("startsAfter");

  // Calculate end date reactively
  const calculatedEndDate = watchStartDate && watchDuration 
    ? addMonths(watchStartDate, Math.floor(watchDuration))
    : null;

  // Update start date when "starts after" changes
  const handleStartsAfterChange = (phaseId: string) => {
    if (phaseId && phaseId !== "none") {
      const precedingPhase = phases.find(p => p.id === phaseId);
      if (precedingPhase?.endDate) {
        form.setValue("startDate", precedingPhase.endDate);
      }
    }
  };

  // Add new phase
  const addPhase = (data: PhaseFormData) => {
    const newPhase: Phase = {
      id: `phase-${Date.now()}`,
      name: data.name,
      startDate: data.startDate || null,
      duration: data.duration,
      endDate: calculatedEndDate,
      gfa: data.gfa,
      landArea: data.landArea,
      phaseCost: data.phaseCost,
      startsAfter: data.startsAfter === "none" ? undefined : data.startsAfter,
    };

    setPhases(prev => [...prev, newPhase]);
    form.reset();
  };

  // Edit existing phase
  const editPhase = (phaseId: string) => {
    const phase = phases.find(p => p.id === phaseId);
    if (phase) {
      setEditingPhase(phaseId);
      form.setValue("name", phase.name);
      form.setValue("startDate", phase.startDate);
      form.setValue("duration", phase.duration);
      form.setValue("gfa", phase.gfa);
      form.setValue("landArea", phase.landArea);
      form.setValue("phaseCost", phase.phaseCost);
      form.setValue("startsAfter", phase.startsAfter || "none");
    }
  };

  // Update phase
  const updatePhase = (data: PhaseFormData) => {
    if (editingPhase) {
      setPhases(prev => prev.map(phase => 
        phase.id === editingPhase 
          ? {
              ...phase,
              name: data.name,
              startDate: data.startDate || null,
              duration: data.duration,
              endDate: calculatedEndDate,
              gfa: data.gfa,
              landArea: data.landArea,
              phaseCost: data.phaseCost,
              startsAfter: data.startsAfter === "none" ? undefined : data.startsAfter,
            }
          : phase
      ));
      setEditingPhase(null);
      form.reset();
    }
  };

  // Delete phase
  const deletePhase = (phaseId: string) => {
    setPhases(prev => prev.filter(p => p.id !== phaseId));
    if (editingPhase === phaseId) {
      setEditingPhase(null);
      form.reset();
    }
  };

  // Validation functions
  const validatePhases = () => {
    const issues: string[] = [];
    
    phases.forEach((phase, index) => {
      // Check for phases with no dates
      if (!phase.startDate || !phase.endDate) {
        issues.push(`${phase.name}: Missing start or end date`);
      }
      
      // Check for overlapping phases
      phases.forEach((otherPhase, otherIndex) => {
        if (index !== otherIndex && phase.startDate && phase.endDate && otherPhase.startDate && otherPhase.endDate) {
          if (
            (isAfter(phase.startDate, otherPhase.startDate) && isBefore(phase.startDate, otherPhase.endDate)) ||
            (isAfter(phase.endDate, otherPhase.startDate) && isBefore(phase.endDate, otherPhase.endDate))
          ) {
            issues.push(`${phase.name} overlaps with ${otherPhase.name}`);
          }
        }
      });
    });
    
    return issues;
  };

  // Calculate summary metrics
  const totalGFA = phases.reduce((sum, phase) => sum + phase.gfa, 0);
  const totalCost = phases.reduce((sum, phase) => sum + phase.phaseCost, 0);
  const totalDuration = phases.reduce((sum, phase) => sum + phase.duration, 0);
  const validationIssues = validatePhases();

  // Sync to Feasly Model function
  const syncToFeaslyModel = () => {
    if (phases.length === 0) {
      toast({
        title: t('feasly.flow.sync_error'),
        description: t('feasly.flow.no_phases_to_sync'),
        variant: "destructive",
      });
      return;
    }

    // Calculate sync data
    const totalSiteArea = phases.reduce((sum, phase) => sum + phase.landArea, 0);
    const startDates = phases.filter(p => p.startDate).map(p => p.startDate!);
    const endDates = phases.filter(p => p.endDate).map(p => p.endDate!);
    
    const earliestStart = startDates.length > 0 ? new Date(Math.min(...startDates.map(d => d.getTime()))) : null;
    const latestEnd = endDates.length > 0 ? new Date(Math.max(...endDates.map(d => d.getTime()))) : null;

    const syncData = {
      total_gfa_sqm: totalGFA,
      site_area_sqm: totalSiteArea,
      construction_cost: totalCost,
      start_date: earliestStart ? earliestStart.toISOString() : null,
      completion_date: latestEnd ? latestEnd.toISOString() : null,
      duration_months: totalDuration,
      currency_code: currency,
      synced_at: new Date().toISOString(),
    };

    try {
      localStorage.setItem('feasly_model_from_flow', JSON.stringify(syncData));
      
      toast({
        title: t('feasly.flow.sync_success'),
        description: t('feasly.flow.sync_success_desc'),
      });
    } catch (error) {
      toast({
        title: t('feasly.flow.sync_error'),
        description: t('feasly.flow.sync_error_desc'),
        variant: "destructive",
      });
    }
  };

  // DatePicker component
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

  const onSubmit = (data: PhaseFormData) => {
    if (editingPhase) {
      updatePhase(data);
    } else {
      addPhase(data);
    }
  };

  return (
    <div className={cn("p-8 max-w-7xl mx-auto", isRTL && "rtl")} dir={isRTL ? "rtl" : "ltr"}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Clock className="h-8 w-8" />
          {t('feasly.flow.title')}
        </h1>
        <p className="text-muted-foreground">{t('feasly.flow.description')}</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        
        {/* Section 1: Phase Entry Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                {editingPhase ? t('feasly.flow.edit_phase') : t('feasly.flow.add_phase')}
              </CardTitle>
              <CardDescription>{t('feasly.flow.phase_form_desc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  
                  {/* Phase Name */}
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('feasly.flow.phase_name')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('feasly.flow.phase_name_placeholder')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Starts After (optional) */}
                  <FormField
                    control={form.control}
                    name="startsAfter"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          {t('feasly.flow.starts_after')}
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <Info className="h-4 w-4 text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{t('feasly.flow.starts_after_tooltip')}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </FormLabel>
                        <Select 
                          onValueChange={(value) => {
                            field.onChange(value);
                            handleStartsAfterChange(value);
                          }} 
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('feasly.flow.select_preceding_phase')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">{t('feasly.flow.no_dependency')}</SelectItem>
                            {phases.filter(p => p.id !== editingPhase).map((phase) => (
                              <SelectItem key={phase.id} value={phase.id}>
                                {phase.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Date and Duration Row */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>{t('feasly.flow.start_date')}</FormLabel>
                          <DatePickerField field={field} placeholder={t('feasly.flow.select_date')} />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="duration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('feasly.flow.duration_months')}</FormLabel>
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

                    {/* Calculated End Date */}
                    <div className="space-y-2">
                      <FormLabel>{t('feasly.flow.calculated_end_date')}</FormLabel>
                      <Input 
                        value={calculatedEndDate ? format(calculatedEndDate, "PPP") : ""} 
                        disabled
                        className="bg-muted"
                        placeholder={t('feasly.flow.auto_calculated')}
                      />
                    </div>
                  </div>

                  {/* Areas and Cost Row */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="gfa"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('feasly.flow.gfa_sqm')}</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field} 
                              onChange={e => field.onChange(parseFloat(e.target.value) || 0)} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="landArea"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('feasly.flow.land_area_sqm')}</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field} 
                              onChange={e => field.onChange(parseFloat(e.target.value) || 0)} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="phaseCost"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('feasly.flow.phase_cost')} ({currency})</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field} 
                              onChange={e => field.onChange(parseFloat(e.target.value) || 0)} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Form Actions */}
                  <div className="flex gap-2">
                    <Button type="submit">
                      {editingPhase ? t('feasly.flow.update_phase') : t('feasly.flow.add_phase')}
                    </Button>
                    {editingPhase && (
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => {
                          setEditingPhase(null);
                          form.reset();
                        }}
                      >
                        {t('feasly.flow.cancel')}
                      </Button>
                    )}
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Phases List */}
          {phases.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>{t('feasly.flow.project_phases')}</CardTitle>
                <CardDescription>{t('feasly.flow.phases_list_desc')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {phases.map((phase) => (
                    <div 
                      key={phase.id} 
                      className={cn(
                        "p-4 border rounded-lg",
                        editingPhase === phase.id && "border-primary bg-primary/5"
                      )}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{phase.name}</h4>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => editPhase(phase.id)}
                          >
                            {t('feasly.flow.edit')}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deletePhase(phase.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                        <div>
                          <p className="font-medium">{t('feasly.flow.duration')}</p>
                          <p>{phase.duration} {t('feasly.flow.months')}</p>
                        </div>
                        <div>
                          <p className="font-medium">{t('feasly.flow.gfa')}</p>
                          <p>{phase.gfa.toLocaleString()} sqm</p>
                        </div>
                        <div>
                          <p className="font-medium">{t('feasly.flow.cost')}</p>
                          <p>{currency} {phase.phaseCost.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="font-medium">{t('feasly.flow.dates')}</p>
                          <p>
                            {phase.startDate ? format(phase.startDate, "MMM dd") : "--"} → {" "}
                            {phase.endDate ? format(phase.endDate, "MMM dd") : "--"}
                          </p>
                        </div>
                      </div>

                      {phase.startsAfter && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          <p>{t('feasly.flow.depends_on')}: {phases.find(p => p.id === phase.startsAfter)?.name}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Section 3: Summary Metrics */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                {t('feasly.flow.summary_metrics')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">{t('feasly.flow.total_phases')}</span>
                  <span className="font-medium">{phases.length}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">{t('feasly.flow.total_gfa')}</span>
                  <span className="font-medium">{totalGFA.toLocaleString()} sqm</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">{t('feasly.flow.total_cost')}</span>
                  <span className="font-medium">{currency} {totalCost.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">{t('feasly.flow.total_duration')}</span>
                  <span className="font-medium">{totalDuration} {t('feasly.flow.months')}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Validation Issues */}
          {validationIssues.length > 0 && (
            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="text-destructive flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  {t('feasly.flow.validation_issues')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1 text-sm text-destructive">
                  {validationIssues.map((issue, index) => (
                    <li key={index}>• {issue}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Summary Card */}
          {phases.length > 0 && validationIssues.length === 0 && (
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="text-green-700 flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  {t('feasly.flow.project_summary')}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-green-700">
                <p>{phases.length} {t('feasly.flow.phases_configured')}</p>
                <p>{t('feasly.flow.ready_for_timeline')}</p>
              </CardContent>
            </Card>
          )}

          {/* Sync to Feasly Model Button */}
          {phases.length > 0 && validationIssues.length === 0 && (
            <Button 
              onClick={syncToFeaslyModel}
              className="w-full"
              size="lg"
            >
              <ArrowRight className="mr-2 h-4 w-4" />
              {t('feasly.flow.use_in_model')}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}