import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "react-i18next";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { feaslyModelSchema, type FeaslyModelFormData, type ScenarioType } from "./types";
import { ProjectMetadata } from "./ProjectMetadata";
import { TimelineSection } from "./TimelineSection";
import { SiteMetrics } from "./SiteMetrics";
import { FinancialInputsV2 } from "./FinancialInputsV2";
import { ScenariosSection } from "./ScenariosSection";
import { KPIResults } from "./KPIResults";
import { ExportPanel } from "./ExportPanel";
import { AiInsightPanel } from "./AiInsightPanel";
import { PreviewToggle } from "./PreviewToggle";
import { SensitivityAnalysis } from "./SensitivityAnalysis";
import { ScenarioChart } from "./ScenarioChart";
import { TimelineGantt, TimelineSummaryPanel } from "@/components/Timeline";
import { ContractorBreakdown } from "./ContractorBreakdown";
import { VendorRiskSummary } from "./VendorRiskSummary";
import { ContractorWarnings } from "./ContractorWarnings";
import { useMilestones } from "@/hooks/useMilestones";
import { CommentingPanel } from "./CommentingPanel";
import CashflowTable from "./CashflowTable";
import ScenarioComparisonChart from "./ScenarioComparisonChart";
import { SmartExplainerPanel } from "../FeaslyInsights/SmartExplainerPanel";
import { ExportPDF } from "@/components/export/ExportPDF";
import { VersionSelector } from "@/components/versions/VersionSelector";
import { ScenarioComparison } from "@/components/versions/ScenarioComparison";
import { FeaslyValidationPanel } from "./FeaslyValidationPanel";
import { VersionSelector as LegacyVersionSelector } from "./VersionSelector";
import { CashflowVarianceChart } from "./CashflowVarianceChart";
import ScenarioPlayback from "./ScenarioPlayback";
import { useFeaslyVersions } from "@/hooks/useFeaslyVersions";
import { useExportData } from "@/hooks/useExportData";
import { ComplianceStatusPanel } from "./ComplianceStatusPanel";

export default function FeaslyModel() {
  const { isRTL } = useLanguage();
  const { t } = useTranslation('feasly.model');
  const { toast } = useToast();
  const [activeScenario, setActiveScenario] = useState<ScenarioType>("base");
  const [searchParams] = useSearchParams();
  
  // Get project ID from URL params or use compliance demo project
  const projectId = searchParams.get('projectId') || "f47ac10b-58cc-4372-a567-0e02b2c3d479";
  const { milestones } = useMilestones(projectId);
  
  // Get export data to retrieve project name
  const { data: exportData } = useExportData(projectId);
  
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
    // Draft saved automatically
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
    <div className={cn(
      "min-h-[100vh] overflow-auto", 
      "container mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6",
      isRTL && "rtl"
    )}>
      {/* Header */}
      <div className="flex items-center space-x-3 mb-4 sm:mb-6">
        <Building2 className="h-6 w-6 sm:h-8 sm:w-8 text-primary flex-shrink-0" />
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold truncate">{t('title')}</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            {t('description')}
          </p>
        </div>
      </div>

      {/* Version Management */}
      <div className="bg-card border rounded-lg p-3 sm:p-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <VersionSelector 
            projectId={projectId}
            className="flex-1"
          />
          <ScenarioComparison 
            projectId={projectId}
            className="sm:w-auto"
          />
        </div>
      </div>

      {/* Form with Preview Toggle */}
      <FormProvider {...form}>
        <Form {...form}>
          <PreviewToggle>
            {(previewMode) => (
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6 lg:space-y-8">
                
                {/* Editable Sections - Hidden in Preview Mode */}
                {!previewMode && (
                  <>
                    {/* Project Metadata Section */}
                    <ProjectMetadata />
                    
                  {/* Validation Panel */}
                  <FeaslyValidationPanel />
                  
                  {/* Timeline Section */}
                    <TimelineSection />

                    {/* Site Metrics Section */}
                    <SiteMetrics />

                    {/* Financial Inputs Section - Sprint 12 Dynamic System */}
                    <FinancialInputsV2 projectId={projectId} />

                    {/* Scenarios Section */}
                    <ScenariosSection />
                  </>
                )}

                {/* Advanced Analysis - Always Visible */}
                <div className="space-y-4 sm:space-y-6">
                  <h2 className="feasly-title">📊 Advanced Analysis</h2>
                  
                  {/* Timeline Summary Panel */}
                  <TimelineSummaryPanel milestones={milestones} />
                  
                  {/* Cashflow Variance Chart */}
                  <CashflowVarianceChart projectId={projectId} />
                  
                  {/* Timeline Gantt */}
                  <TimelineGantt projectId={projectId} />
                  
                  {/* Sensitivity Analysis */}
                  <SensitivityAnalysis />
                  
                  {/* Scenario Comparison Chart */}
                  <ScenarioChart />
                  
                  {/* NEW: Scenario Comparison Chart */}
                  <ScenarioComparisonChart />
                </div>

                {/* Vendor & Delivery Risk - Always Visible */}
                <div className="space-y-4 sm:space-y-6">
                  <h2 className="feasly-title">👥 Vendor & Delivery Risk</h2>
                  
                  {/* Vendor Risk Summary */}
                  <VendorRiskSummary projectId={projectId} />
                  
                  {/* Contractor Breakdown Table */}
                  <ContractorBreakdown projectId={projectId} />
                  
                  {/* Smart Vendor Warnings */}
                  <ContractorWarnings projectId={projectId} />
                </div>

                {/* Results & Insights - Always Visible */}
                <div className="space-y-4 sm:space-y-6">
                  <h2 className="feasly-title">🎯 Results & Insights</h2>
                  
                  {/* KPI Results */}
                  <KPIResults />
                  
                  {/* Cashflow Table */}
                  <CashflowTable 
                    formData={form.getValues()}
                    onRecalculate={async (formData) => {
                      // This will trigger the calculation engine
                      // Recalculating cashflow...
                      toast({
                        title: "Cashflow Calculated",
                        description: "Monthly cashflow projections have been updated.",
                      });
                    }}
                  />
                  
                  {/* Scenario Timeline Playback */}
                  <ScenarioPlayback projectId={projectId} />
                  
                  {/* Smart Explainer Panel */}
                  <SmartExplainerPanel projectId={projectId} />
                  
                  {/* Export & AI Insights */}
                  <div className="space-y-4 sm:space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <h3 className="text-lg font-semibold">📋 Export & AI Insights</h3>
                      <ExportPDF 
                        projectId={projectId} 
                        projectName={exportData?.project.name || "Feasly Model Project"} 
                        variant="default"
                        size="sm"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <ExportPanel />
                      <AiInsightPanel />
                    </div>
                  </div>
                </div>

                {/* Compliance Panel - Sprint 13 */}
                <ComplianceStatusPanel projectId={projectId} />

                {/* Comments Panel */}
                <CommentingPanel projectId={undefined} />

                {/* Action Buttons - Hidden in Preview Mode */}
                {!previewMode && (
                  <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4 pt-4 sm:pt-6">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={onSaveDraft}
                      className="min-h-[44px] touch-none" // Touch-friendly height
                    >
                      {t('save_draft')}
                    </Button>
                    <Button 
                      type="submit"
                      className="min-h-[44px] touch-none" // Touch-friendly height
                    >
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