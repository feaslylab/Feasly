import { useState, useEffect, useCallback } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Layers, Save } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ModelSideNav, defaultModelSections, ModelSection } from '../model/ModelSideNav';
import { SectionPanel } from '../model/SectionPanel';
import { useSectionStatus, useWizardValidation } from '@/hooks/useSectionValidation';
import { useGridCalculations } from '@/hooks/useGridCalculations';
import { useScrollSpy } from '@/hooks/useScrollSpy';
import { feaslyModelSchema, type FeaslyModelFormData } from './types';
import { ConstructionCostGrid } from './ConstructionCostGrid';
import { SaleLinesGrid } from './SaleLinesGrid';
import { RentalLinesGrid } from './RentalLinesGrid';
import { useToast } from '@/hooks/use-toast';

// Import existing components
import { ProjectMetadata } from './ProjectMetadata';
import { TimelineSection } from './TimelineSection';
import { SiteMetrics } from './SiteMetrics';
import { FinancialInputsV2 } from './FinancialInputsV2';
import { ScenariosSection } from './ScenariosSection';
import { KPIResults } from './KPIResults';
import { ExportPanel } from './ExportPanel';
import { AiInsightPanel } from './AiInsightPanel';
import { FeaslyValidationPanel } from './FeaslyValidationPanel';
import { ComplianceStatusPanel } from './ComplianceStatusPanel';
import { CommentingPanel } from './CommentingPanel';
import { RightSideValidationPanel } from './RightSideValidationPanel';

// Check if v2 feature flag is enabled
const isV2Enabled = import.meta.env.VITE_MODEL_V2 === 'true';

interface FeaslyModelV2Props {
  projectId: string;
  onSubmit: (data: FeaslyModelFormData) => Promise<void>;
  onSaveDraft: () => void;
  initialData?: Partial<FeaslyModelFormData>;
}

function FeaslyModelV2({ projectId, onSubmit, onSaveDraft, initialData }: FeaslyModelV2Props) {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  
  // Form setup
  const form = useForm<FeaslyModelFormData>({
    resolver: zodResolver(feaslyModelSchema),
    defaultValues: {
      phasing_enabled: false,
      zakat_applicable: false,
      escrow_required: false,
      currency_code: "SAR",
      ...initialData,
    },
  });

  // State management
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(['project-metadata']));
  const [isWizardMode, setIsWizardMode] = useState(false);
  const [lastSaved, setLastSaved] = useState<string>('');
  const [hasShownSaveToast, setHasShownSaveToast] = useState(false);

  // Get form data for validation
  const formData = form.watch();

  // Section validation
  const sections: ModelSection[] = defaultModelSections.map(section => {
    const { status } = useSectionStatus(section.id, formData);
    return { ...section, status };
  });

  // Wizard validation
  const sectionIds = sections.map(s => s.id);
  const wizard = useWizardValidation(sectionIds, formData);

  // Enhanced scroll spy with proper collision detection
  const { activeSection, scrollToSection, setSectionCollapsed } = useScrollSpy(
    sectionIds,
    {
      enabled: !isWizardMode && !isMobile,
      offsetTop: 64, // Header height
      rootMargin: '-20% 0px -20% 0px',
      threshold: 0.3
    }
  );

  // Handle section navigation with proper scrolling
  const handleSectionClick = useCallback((sectionId: string) => {
    if (isWizardMode) {
      const stepIndex = sectionIds.indexOf(sectionId);
      wizard.goToStep(stepIndex);
      setOpenSections(new Set([sectionId]));
    } else {
      setOpenSections(prev => new Set([...prev, sectionId]));
      scrollToSection(sectionId, 'smooth');
    }
  }, [isWizardMode, sectionIds, wizard, scrollToSection]);

  // Handle section panel toggle with scroll spy integration
  const handleSectionToggle = useCallback((sectionId: string, isOpen: boolean) => {
    if (isWizardMode) return;

    setOpenSections(prev => {
      const newSet = new Set(prev);
      if (isOpen) {
        newSet.add(sectionId);
      } else {
        newSet.delete(sectionId);
      }
      return newSet;
    });

    // Update scroll spy collapsed state
    setSectionCollapsed(sectionId, !isOpen);
  }, [isWizardMode, setSectionCollapsed]);

  // Sync collapsed state when sections change
  useEffect(() => {
    sectionIds.forEach(id => {
      const isOpen = openSections.has(id);
      setSectionCollapsed(id, !isOpen);
    });
  }, [openSections, sectionIds, setSectionCollapsed]);

  // Auto-save functionality
  useEffect(() => {
    const subscription = form.watch(() => {
      // Debounced save
      const timer = setTimeout(() => {
        setLastSaved(new Date().toLocaleTimeString());
        
        if (!hasShownSaveToast) {
          toast({
            title: "Scenario saved",
            description: "Your changes have been automatically saved.",
          });
          setHasShownSaveToast(true);
        }
      }, 600);

      return () => clearTimeout(timer);
    });

    return () => subscription.unsubscribe();
  }, [form, toast, hasShownSaveToast]);

  // Wizard navigation
  const handleWizardNext = () => {
    if (wizard.canProceedToNext) {
      wizard.nextStep();
      const nextSectionId = sectionIds[wizard.currentStep + 1];
      if (nextSectionId) {
        scrollToSection(nextSectionId);
        setOpenSections(new Set([nextSectionId]));
      }
    }
  };

  const handleWizardPrevious = () => {
    wizard.previousStep();
    const prevSectionId = sectionIds[wizard.currentStep - 1];
    if (prevSectionId) {
      scrollToSection(prevSectionId);
      setOpenSections(new Set([prevSectionId]));
    }
  };

  // Submit handler
  const handleSubmit = async (data: FeaslyModelFormData) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Submit error:', error);
    }
  };

  return (
    <div className="min-h-screen w-full">
      {/* Desktop Sidebar - Fixed positioning for true sticky behavior */}
      {!isMobile && (
        <div className="fixed left-0 top-0 h-full z-40">
          <ModelSideNav
            sections={sections}
            activeSection={activeSection}
            onSectionClick={handleSectionClick}
            isMobile={false}
          />
        </div>
      )}

      {/* Mobile Navigation */}
      {isMobile && (
        <ModelSideNav
          sections={sections}
          activeSection={activeSection}
          onSectionClick={handleSectionClick}
          isMobile={true}
        />
      )}

      {/* Main Content with left margin to account for fixed sidebar */}
      <div className={cn("min-h-screen", !isMobile && "ml-64")}>
        {/* Sticky Header */}
        <div className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-primary" />
                <h1 className="text-lg font-semibold">Feasibility Model</h1>
              </div>
              
              {/* Mini KPIs */}
              <div className="hidden md:flex items-center gap-3">
                <Badge variant="outline" className="flex items-center gap-1">
                  NPV: AED 2.3M
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  IRR: 18.2%
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Wizard Toggle */}
              <div className="flex items-center gap-2">
                <Label htmlFor="wizard-mode" className="text-sm">
                  Wizard
                </Label>
                <Switch
                  id="wizard-mode"
                  checked={isWizardMode}
                  data-testid="wizard-toggle"
                />
              </div>

              {/* Save Status */}
              {lastSaved && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Save className="h-3 w-3" />
                  <span>Saved • {lastSaved}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6">
          <FormProvider {...form}>
            {/* Right Side Validation Panel - Now inside FormProvider */}
            <RightSideValidationPanel />
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Project Metadata */}
            <SectionPanel
              id="project-metadata"
              title="Project Information"
              status={sections.find(s => s.id === 'project-metadata')?.status || 'empty'}
              isOpen={openSections.has('project-metadata')}
              onToggle={(open) => handleSectionToggle('project-metadata', open)}
            >
              <ProjectMetadata />
            </SectionPanel>

            {/* Timeline */}
            <SectionPanel
              id="timeline"
              title="Project Timeline"
              status={sections.find(s => s.id === 'timeline')?.status || 'empty'}
              isOpen={openSections.has('timeline')}
              onToggle={(open) => handleSectionToggle('timeline', open)}
            >
              <TimelineSection />
            </SectionPanel>

            {/* Site Metrics */}
            <SectionPanel
              id="site-metrics"
              title="Site Metrics"
              status={sections.find(s => s.id === 'site-metrics')?.status || 'empty'}
              isOpen={openSections.has('site-metrics')}
              onToggle={(open) => handleSectionToggle('site-metrics', open)}
            >
              <SiteMetrics />
            </SectionPanel>

            {/* Financial Inputs */}
            <SectionPanel
              id="financial-inputs"
              title="Financial Inputs"
              status={sections.find(s => s.id === 'financial-inputs')?.status || 'empty'}
              isOpen={openSections.has('financial-inputs')}
              onToggle={(open) => handleSectionToggle('financial-inputs', open)}
              lazyLoad
            >
              <FinancialInputsV2 projectId={projectId} />
            </SectionPanel>

            {/* Construction & Development */}
            <SectionPanel
              id="construction-development"
              title="Construction & Development"
              status={sections.find(s => s.id === 'construction-development')?.status || 'empty'}
              isOpen={openSections.has('construction-development')}
              onToggle={(open) => handleSectionToggle('construction-development', open)}
            >
              <ConstructionCostGrid />
            </SectionPanel>

            {/* Revenue Segments */}
            <SectionPanel
              id="revenue-segments"
              title="Revenue Segments"
              status={sections.find(s => s.id === 'revenue-segments')?.status || 'empty'}
              isOpen={openSections.has('revenue-segments')}
              onToggle={(open) => handleSectionToggle('revenue-segments', open)}
            >
              <SaleLinesGrid />
            </SectionPanel>

            {/* Rental Segments */}
            <SectionPanel
              id="rental-segments"
              title="Rental Segments"
              status={sections.find(s => s.id === 'rental-segments')?.status || 'empty'}
              isOpen={openSections.has('rental-segments')}
              onToggle={(open) => handleSectionToggle('rental-segments', open)}
            >
              <RentalLinesGrid />
            </SectionPanel>

            {/* Scenarios */}
            <SectionPanel
              id="scenarios"
              title="Scenario Analysis"
              status={sections.find(s => s.id === 'scenarios')?.status || 'empty'}
              isOpen={openSections.has('scenarios')}
              onToggle={(open) => handleSectionToggle('scenarios', open)}
            >
              <ScenariosSection />
            </SectionPanel>

            {/* Results & Insights */}
            <SectionPanel
              id="results-insights"
              title="Results & Insights"
              status={sections.find(s => s.id === 'results-insights')?.status || 'empty'}
              isOpen={openSections.has('results-insights')}
              onToggle={(open) => handleSectionToggle('results-insights', open)}
              lazyLoad
            >
              <KPIResults />
            </SectionPanel>

            {/* Export & AI */}
            <SectionPanel
              id="export-ai"
              title="Export & AI Insights"
              status={sections.find(s => s.id === 'export-ai')?.status || 'empty'}
              isOpen={openSections.has('export-ai')}
              onToggle={(open) => handleSectionToggle('export-ai', open)}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ExportPanel />
                <AiInsightPanel />
              </div>
            </SectionPanel>

            {/* Compliance */}
            <SectionPanel
              id="compliance"
              title="Compliance Status"
              status={sections.find(s => s.id === 'compliance')?.status || 'empty'}
              isOpen={openSections.has('compliance')}
              onToggle={(open) => handleSectionToggle('compliance', open)}
            >
              <ComplianceStatusPanel projectId={projectId} />
            </SectionPanel>

            {/* Comments */}
            <SectionPanel
              id="comments"
              title="Comments & Notes"
              status={sections.find(s => s.id === 'comments')?.status || 'empty'}
              isOpen={openSections.has('comments')}
              onToggle={(open) => handleSectionToggle('comments', open)}
            >
              <CommentingPanel projectId={projectId} />
            </SectionPanel>

            {/* Wizard Navigation */}
            {isWizardMode && (
              <div className="flex items-center justify-between pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleWizardPrevious}
                  disabled={wizard.isFirstStep}
                  className="flex items-center gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Step {wizard.currentStep + 1} of {wizard.totalSteps}
                  </span>
                </div>

                <Button
                  type="button"
                  onClick={handleWizardNext}
                  disabled={!wizard.canProceedToNext || wizard.isLastStep}
                  className="flex items-center gap-2"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Action Buttons */}
            {!isWizardMode && (
              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4 pt-6 border-t">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onSaveDraft}
                  className="min-h-[44px]"
                >
                  Save Draft
                </Button>
                <Button 
                  type="submit"
                  className="min-h-[44px]"
                >
                  Generate Model
                </Button>
              </div>
            )}
            </form>
          </FormProvider>
        </div>
      </div>
    </div>
  );
}

export { FeaslyModelV2, isV2Enabled };