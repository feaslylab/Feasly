import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Layers, Info } from "lucide-react";
import type { FeaslyModelFormData } from "./types";

export function SiteMetrics() {
  const { t } = useTranslation('feasly.model');
  const form = useFormContext<FeaslyModelFormData>();

  // Watch values for dynamic calculations
  const watchSiteArea = form.watch("site_area_sqm");
  const watchTotalGFA = form.watch("total_gfa_sqm");

  // Calculate efficiency ratio dynamically
  const calculatedEfficiencyRatio = watchSiteArea && watchTotalGFA 
    ? Math.round((watchTotalGFA / watchSiteArea) * 100 * 100) / 100 
    : null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Layers className="h-5 w-5 text-primary" />
          <CardTitle>{t('feasly.model.site_area_metrics')}</CardTitle>
        </div>
        <CardDescription>
          {t('feasly.model.site_area_metrics_desc')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FormField
            control={form.control}
            name="site_area_sqm"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('feasly.model.site_area_sqm')}</FormLabel>
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
            name="total_gfa_sqm"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('feasly.model.total_gfa_sqm')}</FormLabel>
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
            name="efficiency_ratio"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center space-x-2">
                  <FormLabel>{t('feasly.model.efficiency_ratio')}</FormLabel>
                  {calculatedEfficiencyRatio && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Calculated: {calculatedEfficiencyRatio}%</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    max="1000"
                    step="0.01"
                    placeholder={calculatedEfficiencyRatio?.toString() || "0.00"}
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
            name="far_ratio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('feasly.model.far_ratio')}</FormLabel>
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
            name="height_stories"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('feasly.model.height_stories')}</FormLabel>
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
            name="buildable_ratio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('feasly.model.buildable_ratio')}</FormLabel>
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

        {/* Auto-calculated metrics display */}
        {calculatedEfficiencyRatio && (
          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="text-sm font-medium mb-2">Auto-calculated Metrics</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Efficiency Ratio:</span>
                <span className="ml-2 font-medium">{calculatedEfficiencyRatio}%</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}