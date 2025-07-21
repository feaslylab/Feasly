import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Plus } from "lucide-react";

const assetSchema = z.object({
  name: z.string().min(1, "Asset name is required"),
  type: z.enum(["Residential", "Mixed Use", "Retail", "Hospitality", "Infrastructure"]),
  gfa_sqm: z.number().min(1, "GFA must be greater than 0"),
  construction_cost_aed: z.number().min(1, "Construction cost must be greater than 0"),
  annual_revenue_potential_aed: z.number().min(0, "Annual revenue potential must be 0 or greater"),
  annual_operating_cost_aed: z.number().min(0, "Operating cost must be 0 or greater"),
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
      type: "Residential",
      gfa_sqm: 0,
      construction_cost_aed: 0,
      annual_revenue_potential_aed: 0,
      annual_operating_cost_aed: 0,
      occupancy_rate_percent: 0,
      cap_rate_percent: 0,
      development_timeline_months: 0,
      stabilization_period_months: 0,
    },
  });

  const createAssetMutation = useMutation({
    mutationFn: async (data: AssetFormData) => {
      const { error } = await supabase
        .from("assets")
        .insert({
          project_id: projectId,
          ...data,
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
                name="type"
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
                name="gfa_sqm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gross Floor Area (sqm)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter GFA in square meters"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
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
                  name="annual_revenue_potential_aed"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Annual Revenue Potential (AED/year)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter annual revenue potential"
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
                  name="annual_operating_cost_aed"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Operating Cost (AED/year)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter annual operating cost"
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
                  name="development_timeline_months"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Development Timeline (months)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter development timeline"
                          min="1"
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
                  name="stabilization_period_months"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stabilization Period (months)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter stabilization period"
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