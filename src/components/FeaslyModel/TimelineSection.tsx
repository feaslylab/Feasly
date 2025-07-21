import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CalendarIcon, Clock, Info, Plus, Trash2 } from "lucide-react";
import { format, addMonths } from "date-fns";
import { cn } from "@/lib/utils";
import type { FeaslyModelFormData, Phase } from "./types";

export function TimelineSection() {
  const { t } = useTranslation('feasly.model');
  const form = useFormContext<FeaslyModelFormData>();
  const [phases, setPhases] = useState<Phase[]>([]);
  
  const watchStartDate = form.watch("start_date");
  const watchDuration = form.watch("duration_months");
  const watchPhasingEnabled = form.watch("phasing_enabled");

  // Calculate completion date based on start date and duration
  const calculatedEndDate = watchStartDate && watchDuration 
    ? addMonths(watchStartDate, watchDuration)
    : null;

  const addPhase = () => {
    const newPhase: Phase = {
      phase_name: `Phase ${phases.length + 1}`,
      phase_start: null,
      phase_end: null,
      gfa_percent: 0,
    };
    setPhases([...phases, newPhase]);
  };

  const removePhase = (index: number) => {
    setPhases(phases.filter((_, i) => i !== index));
  };

  const updatePhase = (index: number, updatedPhase: Partial<Phase>) => {
    setPhases(phases.map((phase, i) => 
      i === index ? { ...phase, ...updatedPhase } : phase
    ));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Clock className="h-5 w-5 text-primary" />
          <CardTitle>{t('timeline_phases')}</CardTitle>
        </div>
        <CardDescription>
          {t('timeline_phases_desc')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FormField
            control={form.control}
            name="start_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>{t('start_date')}</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>{t('select_date')}</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date("1900-01-01")}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="duration_months"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('duration_months')}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
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
            name="completion_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <div className="flex items-center space-x-2">
                  <FormLabel>{t('completion_date')}</FormLabel>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{t('calculated_end_date_tooltip')}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : calculatedEndDate ? (
                          <span className="text-blue-600">
                            {format(calculatedEndDate, "PPP")} (auto)
                          </span>
                        ) : (
                          <span>{t('select_date')}</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value || calculatedEndDate || undefined}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date("1900-01-01")}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="construction_start_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>{t('construction_start')}</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>{t('select_date')}</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date("1900-01-01")}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="stabilization_period_months"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('stabilization_period')}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Phasing Section */}
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="phasing_enabled"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">
                    {t('phasing_enabled')}
                  </FormLabel>
                  <div className="text-sm text-muted-foreground">
                    {t('phasing_enabled_desc')}
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

          {watchPhasingEnabled && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-medium">Project Phases</h4>
                <Button type="button" variant="outline" size="sm" onClick={addPhase}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Phase
                </Button>
              </div>

              {phases.map((phase, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <Input
                      value={phase.phase_name}
                      onChange={(e) => updatePhase(index, { phase_name: e.target.value })}
                      className="font-medium"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removePhase(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium">Phase Start</label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !phase.phase_start && "text-muted-foreground"
                            )}
                          >
                            {phase.phase_start ? (
                              format(phase.phase_start, "PPP")
                            ) : (
                              <span>Select date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={phase.phase_start || undefined}
                            onSelect={(date) => updatePhase(index, { phase_start: date || null })}
                            initialFocus
                            className="p-3 pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Phase End</label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !phase.phase_end && "text-muted-foreground"
                            )}
                          >
                            {phase.phase_end ? (
                              format(phase.phase_end, "PPP")
                            ) : (
                              <span>Select date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={phase.phase_end || undefined}
                            onSelect={(date) => updatePhase(index, { phase_end: date || null })}
                            initialFocus
                            className="p-3 pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div>
                      <label className="text-sm font-medium">GFA Percentage (%)</label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={phase.gfa_percent}
                        onChange={(e) => updatePhase(index, { gfa_percent: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                </div>
              ))}

              {phases.length > 0 && (
                <div className="text-sm text-muted-foreground">
                  Total GFA: {phases.reduce((sum, phase) => sum + phase.gfa_percent, 0)}%
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}