import { useLanguage } from "@/contexts/LanguageContext";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { feaslyModelSchema, type FeaslyModelFormData, type ScenarioType } from "./types";
import { ProjectMetadata } from "./ProjectMetadata";
import { TimelineSection } from "./TimelineSection";
import { SiteMetrics } from "./SiteMetrics";
import { FinancialInputs } from "./FinancialInputs";
import { ScenariosSection } from "./ScenariosSection";
import { KPIResults } from "./KPIResults";
import { ExportPanel } from "./ExportPanel";
import { AiInsightPanel } from "./AiInsightPanel";

export default function FeaslyModel() {
  const { t, isRTL } = useLanguage();
  const { toast } = useToast();
  const [activeScenario, setActiveScenario] = useState<ScenarioType>("base");

  // Initialize form with default values
  const form = useForm<FeaslyModelFormData>({
    resolver: zodResolver(feaslyModelSchema),
    defaultValues: {
      phasing_enabled: false,
      zakat_applicable: false,
      escrow_required: false,
      currency_code: "SAR",
    },
  });

  const onSubmit = async (data: FeaslyModelFormData) => {
    try {
      console.log("Form submitted:", data);
      toast({
        title: "Model Generated",
        description: "Your feasibility model has been generated successfully.",
      });
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Error",
        description: "Failed to generate model. Please try again.",
        variant: "destructive",
      });
    }
  };

  const onSaveDraft = () => {
    const currentData = form.getValues();
    console.log("Saving draft:", currentData);
    toast({
      title: "Draft Saved",
      description: "Your project draft has been saved.",
    });
  };

  return (
    <div className={cn("container mx-auto p-6 space-y-6", isRTL && "rtl")}>
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <Building2 className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">{t('feasly.model.title')}</h1>
          <p className="text-muted-foreground">
            {t('feasly.model.description')}
          </p>
        </div>
      </div>

      {/* Form */}
      <FormProvider {...form}>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            
            {/* Project Metadata Section */}
            <ProjectMetadata />
            
            {/* Timeline Section */}
            <TimelineSection />

            {/* Site Metrics Section */}
            <SiteMetrics />

            {/* Financial Inputs Section */}
            <FinancialInputs />

            {/* Scenarios Section */}
            <ScenariosSection />

            {/* KPI Results Section */}
            <KPIResults />

            {/* Export & Insights Section */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">📤 Export & Insights</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ExportPanel />
                <AiInsightPanel />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onSaveDraft}
              >
                {t('feasly.model.save_draft')}
              </Button>
              <Button type="submit">
                {t('feasly.model.generate_model')}
              </Button>
            </div>
          </form>
        </Form>
      </FormProvider>
    </div>
  );
}