import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format, addMonths, addDays } from "date-fns";
import { CalendarIcon, ArrowLeft, Calendar as CalendarLucide } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { useOrganization } from "@/contexts/OrganizationContext";
import { SUPPORTED_CURRENCIES } from "@/lib/currencyConversion";
import { ProjectType } from "@/types/consolidation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const formSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  description: z.string().optional(),
  start_date: z.date().optional(),
  span_months: z.number().min(1, "Span must be at least 1 month").max(600, "Span cannot exceed 50 years").optional(),
  periodicity: z.enum(["monthly", "quarterly", "annually"]).default("monthly"),
  currency_code: z.string().default("AED"),
});

type FormData = z.infer<typeof formSchema>;

export const NewProjectForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { currentOrganization } = useOrganization();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [projectType, setProjectType] = useState<ProjectType>('normal');

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      currency_code: "AED",
      periodicity: "monthly",
      span_months: 60,
    },
  });

  // Calculate end date based on start date and span
  const calculateEndDate = (startDate: Date | undefined, spanMonths: number | undefined) => {
    if (!startDate || !spanMonths) return undefined;
    return addDays(addMonths(startDate, spanMonths), -1);
  };

  // Watch for changes in start date and span to auto-calculate end date
  const watchedStartDate = form.watch("start_date");
  const watchedSpan = form.watch("span_months");
  const calculatedEndDate = calculateEndDate(watchedStartDate, watchedSpan);

  const onSubmit = async (data: FormData) => {
    console.log('Form submission started', { data, user: user?.id, currentOrganization });
    
    if (!user) {
      console.error('No user found - authentication required');
      toast({
        title: "Error",
        description: "You must be logged in to create a project",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const projectData = {
        name: data.name,
        description: data.description || null,
        start_date: data.start_date ? format(data.start_date, "yyyy-MM-dd") : null,
        end_date: calculatedEndDate ? format(calculatedEndDate, "yyyy-MM-dd") : null,
        currency_code: data.currency_code,
        project_type: projectType,
        user_id: user.id,
        organization_id: currentOrganization?.id || null,
      };
      
      console.log('Attempting to create project with data:', projectData);
      
      const { data: project, error } = await supabase
        .from("projects")
        .insert(projectData)
        .select()
        .single();

      console.log('Supabase response:', { project, error });

      if (error) {
        console.error('Supabase insert error:', error);
        throw error;
      }

      console.log('Project created successfully:', project);
      
      toast({
        title: "Success",
        description: "Project created successfully",
      });

      // Refresh project lists and go back to dashboard
      queryClient.invalidateQueries({ queryKey: ["organization-projects"] });
      navigate("/projects");
    } catch (error) {
      console.error("Error creating project:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create project. Please try again.",
        variant: "destructive",
      });
    } finally {
      console.log('Setting loading to false');
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/projects")}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Projects
        </Button>
        
        <Card>
          <CardHeader>
            <CardTitle>Create New Project</CardTitle>
            <CardDescription>
              Fill in the details below to create a new project
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Name *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter project name"
                          {...field}
                          className="h-11"
                        />
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
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter project description (optional)"
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Optional description of the project
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormItem>
                  <FormLabel>Project Type</FormLabel>
                  <FormControl>
                    <RadioGroup 
                      value={projectType} 
                      onValueChange={(value) => setProjectType(value as ProjectType)}
                      className="space-y-3"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="normal" id="normal" />
                        <Label htmlFor="normal" className="text-sm">
                          Feasibility Project
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="consolidation" id="consolidation" />
                        <Label htmlFor="consolidation" className="text-sm">
                          Consolidated Portfolio
                        </Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormDescription>
                    Choose whether this is a single project analysis or a consolidated portfolio of projects
                  </FormDescription>
                </FormItem>

                <FormField
                  control={form.control}
                  name="currency_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currency</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {SUPPORTED_CURRENCIES.map((currency) => (
                            <SelectItem key={currency} value={currency}>
                              {currency}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        The currency for this project's financial data
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-6">
                  {/* Project Timeline Section */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-3">
                      <CalendarLucide className="h-4 w-4 text-primary" />
                      <h3 className="text-sm font-medium text-foreground">Project Timeline</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="start_date"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Start Date</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    className={cn(
                                      "w-full pl-3 text-left font-normal h-11",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {field.value ? (
                                      format(field.value, "MMM dd, yyyy")
                                    ) : (
                                      <span>Pick start date</span>
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
                                  initialFocus
                                  className={cn("p-3 pointer-events-auto")}
                                  disabled={(date) => date < new Date("1900-01-01")}
                                />
                              </PopoverContent>
                            </Popover>
                            <FormDescription className="text-xs">
                              When the project begins
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="span_months"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Duration (Months)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="60"
                                min="1"
                                max="600"
                                className="h-11"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormDescription className="text-xs">
                              Project duration in months
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="periodicity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cash Flow Frequency</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="h-11">
                                  <SelectValue placeholder="Select frequency" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="monthly">Monthly</SelectItem>
                                <SelectItem value="quarterly">Quarterly</SelectItem>
                                <SelectItem value="annually">Annually</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription className="text-xs">
                              How often cash flows occur
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Calculated End Date Display */}
                    {calculatedEndDate && (
                      <div className="bg-muted/50 border rounded-lg p-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Calculated End Date:</span>
                          <span className="font-medium text-foreground">
                            {format(calculatedEndDate, "MMM dd, yyyy")}
                          </span>
                        </div>
                        {watchedSpan && (
                          <div className="flex items-center justify-between text-xs mt-1">
                            <span className="text-muted-foreground">Total Periods:</span>
                            <span className="text-muted-foreground">
                              {form.watch("periodicity") === "monthly" ? watchedSpan 
                               : form.watch("periodicity") === "quarterly" ? Math.ceil(watchedSpan / 3)
                               : Math.ceil(watchedSpan / 12)} periods
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/projects")}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isLoading}
                    className="flex-1"
                    onClick={() => console.log('Submit button clicked', { isLoading, formValid: form.formState.isValid, errors: form.formState.errors })}
                  >
                    {isLoading ? "Creating..." : "Create Project"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};