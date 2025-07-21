import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Plus, CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const assetSchema = z.object({
  name: z.string().min(1, "Asset name is required"),
  asset_type: z.enum(["Residential", "Mixed Use", "Retail", "Hospitality", "Infrastructure"]),
  start_date: z.date().optional(),
  gfa_sqm: z.number().min(1, "GFA must be greater than 0"),
  construction_cost_aed: z.number().min(1, "Construction cost must be greater than 0"),
  annual_revenue_aed: z.number().min(0, "Annual revenue potential must be 0 or greater"),
  operating_cost_aed: z.number().min(0, "Operating cost must be 0 or greater"),
  occupancy_rate_percent: z.number().min(0).max(100, "Occupancy rate must be between 0 and 100"),
  cap_rate_percent: z.number().min(0).max(100, "Cap rate must be between 0 and 100"),
  development_timeline_months: z.number().min(1, "Development timeline must be at least 1 month"),
  stabilization_period_months: z.number().min(0, "Stabilization period must be 0 or greater"),
});

type AssetFormData = z.infer<typeof assetSchema>;

interface AddAssetFormProps {
  projectId: string;
  trigger?: React.ReactNode;
}

export const AddAssetForm = ({ projectId, trigger }: AddAssetFormProps) => {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<AssetFormData>({
    resolver: zodResolver(assetSchema),
    defaultValues: {
      name: "",
      asset_type: "Residential",
      start_date: undefined,
      gfa_sqm: undefined,
      construction_cost_aed: undefined,
      annual_revenue_aed: undefined,
      operating_cost_aed: undefined,
      occupancy_rate_percent: undefined,
      cap_rate_percent: undefined,
      development_timeline_months: undefined,
      stabilization_period_months: undefined,
    },
  });

  const createAssetMutation = useMutation({
    mutationFn: async (data: AssetFormData) => {
      const { error } = await supabase
        .from("assets")
        .insert({
          project_id: projectId,
          ...data,
          start_date: data.start_date?.toISOString().split('T')[0], // Convert to YYYY-MM-DD
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Asset added successfully",
      });
      form.reset();
      setOpen(false);
      // Invalidate project queries to refresh the assets list
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
      queryClient.invalidateQueries({ queryKey: ["assets", projectId] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add asset. Please try again.",
        variant: "destructive",
      });
      console.error("Error creating asset:", error);
    },
  });

  // Calculate end date based on start date and timeline
  const watchedFields = form.watch(["start_date", "development_timeline_months"]);
  const [startDate, timelineMonths] = watchedFields;
  
  const calculateEndDate = () => {
    if (startDate && timelineMonths) {
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + timelineMonths);
      return endDate;
    }
    return null;
  };

  const onSubmit = (data: AssetFormData) => {
    createAssetMutation.mutate(data);
  };

  const defaultTrigger = (
    <Button>
      <Plus className="w-4 h-4 mr-2" />
      Add Asset
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Asset</DialogTitle>
          <DialogDescription>
            Add a new asset to your project with detailed financial information.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Basic Information</h3>
              
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Asset Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter asset name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="asset_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Asset Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select asset type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Residential">Residential</SelectItem>
                        <SelectItem value="Mixed Use">Mixed Use</SelectItem>
                        <SelectItem value="Retail">Retail</SelectItem>
                        <SelectItem value="Hospitality">Hospitality</SelectItem>
                        <SelectItem value="Infrastructure">Infrastructure</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Project Start Date</FormLabel>
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
                              <span>Pick a start date</span>
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
                          disabled={(date) => date < new Date()}
                          initialFocus
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gfa_sqm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gross Floor Area (sqm)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter GFA in square meters"
                        value={field.value === undefined ? '' : field.value}
                        onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Financial Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Financial Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="construction_cost_aed"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Construction Cost (AED)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter construction cost"
                          value={field.value === undefined ? '' : field.value}
                          onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="annual_revenue_aed"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Annual Revenue Potential (AED/year)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter annual revenue potential"
                          value={field.value === undefined ? '' : field.value}
                          onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="operating_cost_aed"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Operating Cost (AED/year)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter annual operating cost"
                          value={field.value === undefined ? '' : field.value}
                          onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="occupancy_rate_percent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Occupancy Rate (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter occupancy rate"
                          min="0"
                          max="100"
                          value={field.value === undefined ? '' : field.value}
                          onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cap_rate_percent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cap Rate (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter cap rate"
                          min="0"
                          max="100"
                          value={field.value === undefined ? '' : field.value}
                          onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="development_timeline_months"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Development Timeline (months)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter development timeline"
                          min="1"
                          value={field.value === undefined ? '' : field.value}
                          onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="stabilization_period_months"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stabilization Period (months)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter stabilization period"
                          min="0"
                          value={field.value === undefined ? '' : field.value}
                          onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Auto-calculated End Date */}
              {calculateEndDate() && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <Label className="text-sm font-medium text-muted-foreground">
                    Calculated Project End Date
                  </Label>
                  <div className="text-lg font-semibold mt-1">
                    {format(calculateEndDate()!, "PPP")}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Based on start date + {timelineMonths} months timeline
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={createAssetMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createAssetMutation.isPending}>
                {createAssetMutation.isPending ? "Adding..." : "Add Asset"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};