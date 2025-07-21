import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "react-i18next";
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
import { PreviewToggle } from "./PreviewToggle";
import { SensitivityAnalysis } from "./SensitivityAnalysis";
import { ScenarioChart } from "./ScenarioChart";
import { TimelineGantt } from "./TimelineGantt";
import { CommentingPanel } from "./CommentingPanel";
import CashflowTable from "./CashflowTable";
import ScenarioComparisonChart from "./ScenarioComparisonChart";
import SmartInsightsPanel from "./SmartInsightsPanel";
import ExportPDFReport from "./ExportPDFReport";
import { VersionSelector } from "./VersionSelector";
import { CashflowVarianceChart } from "./CashflowVarianceChart";
import { useFeaslyVersions } from "@/hooks/useFeaslyVersions";

export default function FeaslyModel() {
  const { isRTL } = useLanguage();
  const { t } = useTranslation('feasly.model');
  const { toast } = useToast();
  const [activeScenario, setActiveScenario] = useState<ScenarioType>("base");
  
  // For demo purposes, using a mock project ID
  const projectId = "demo-project-123";
  
  // Use versioning hook instead of the old calculation hook
  const {
    cashflowGrid,
    availableVersions,
    selectedVersion,
    currentVersionLabel,
    isLoadingCashflow,
    isCalculating,
    calculateCashflow,
    switchToVersion,
    getScenarioData,
    getScenarioSummary,
    hasData
  } = useFeaslyVersions(projectId);

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
      await calculateCashflow(data);
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

  const handleCalculateWithVersion = async (versionLabel: string) => {
    const formData = form.getValues();
    await calculateCashflow(formData, versionLabel);
  };

  return (
    <div className={cn("container mx-auto p-6 space-y-6", isRTL && "rtl")}>
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <Building2 className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">
            {t('description')}
          </p>
        </div>
      </div>

      {/* Version Selector */}
      <div className="bg-card border rounded-lg p-4">
        <VersionSelector
          availableVersions={availableVersions}
          selectedVersion={selectedVersion}
          currentVersionLabel={currentVersionLabel}
          isLoading={isLoadingCashflow || isCalculating}
          onVersionSelect={switchToVersion}
          onCalculateWithVersion={handleCalculateWithVersion}
        />
      </div>

      {/* Form with Preview Toggle */}
      <FormProvider {...form}>
        <Form {...form}>
          <PreviewToggle>
            {(previewMode) => (
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                
                {/* Editable Sections - Hidden in Preview Mode */}
                {!previewMode && (
                  <>
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
                  </>
                )}

                {/* Advanced Analysis - Always Visible */}
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold">📊 Advanced Analysis</h2>
                  
                  {/* Cashflow Variance Chart */}
                  <CashflowVarianceChart projectId={projectId} />
                  
                  {/* Timeline Gantt */}
                  <TimelineGantt />
                  
                  {/* Sensitivity Analysis */}
                  <SensitivityAnalysis />
                  
                  {/* Scenario Comparison Chart */}
                  <ScenarioChart />
                  
                  {/* NEW: Scenario Comparison Chart */}
                  <ScenarioComparisonChart />
                </div>

                {/* Results & Insights - Always Visible */}
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold">🎯 Results & Insights</h2>
                  
                  {/* KPI Results */}
                  <KPIResults />
                  
                  {/* Cashflow Table */}
                  <CashflowTable 
                    formData={form.getValues()}
                    onRecalculate={async (formData) => {
                      // This will trigger the calculation engine
                      console.log("Recalculating cashflow with:", formData);
                      toast({
                        title: "Cashflow Calculated",
                        description: "Monthly cashflow projections have been updated.",
                      });
                    }}
                  />
                  
                  {/* Smart Insights Panel */}
                  <SmartInsightsPanel />
                  
                  {/* Export & AI Insights */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <ExportPanel />
                    <AiInsightPanel />
                    <ExportPDFReport formData={form.getValues()} />
                  </div>
                </div>

                {/* Comments Panel */}
                <CommentingPanel projectId={undefined} />

                {/* Action Buttons - Hidden in Preview Mode */}
                {!previewMode && (
                  <div className="flex justify-end space-x-4 pt-6">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={onSaveDraft}
                    >
                      {t('save_draft')}
                    </Button>
                    <Button type="submit">
                      {t('generate_model')}
                    </Button>
                  </div>
                )}
              </form>
            )}
          </PreviewToggle>
        </Form>
      </FormProvider>
    </div>
  );
}