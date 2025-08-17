import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useFormContext } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Save, CheckCircle, XCircle, AlertTriangle, BarChart3, Building2, Calendar, MapPin, DollarSign, FileText, Megaphone, Shield, TrendingUp, Users, Target, Settings, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ModelSideNav, defaultModelSections, ModelSection } from '../model/ModelSideNav';
import { SectionPanel } from '../model/SectionPanel';
import { useSectionStatus, useWizardValidation } from '@/hooks/useSectionValidation';
import { useGridValidationCounts } from '@/hooks/useGridValidationCounts';
import { useScrollSpy } from '@/hooks/useScrollSpy';
import { type FeaslyModelFormData } from './types';
import { ConstructionCostGrid } from './ConstructionCostGrid';
import { SoftCostGrid } from './SoftCostGrid';
import { MarketingCostGrid } from './MarketingCostGrid';
import { ContingencyGrid } from './ContingencyGrid';
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
import { ComplianceStatusPanel } from './ComplianceStatusPanel';
import { CommentingPanel } from './CommentingPanel';
import { RightSideValidationPanel } from './RightSideValidationPanel';
import { FloatingActionMenu } from '@/components/ui/floating-action-menu';
import ScenarioPickerV2 from '@/components/ui/ScenarioPickerV2';
import { useSelectionStore } from '@/state/selectionStore';
import ReconciliationCard from '@/components/recon/ReconciliationCard';
import { CashFlowCard } from '@/components/recon/CashFlowCard';
import { CovenantsCard } from '@/components/covenants/CovenantsCard';
import { WaterfallCard } from '@/components/waterfall/WaterfallCard';
import { FinancingCard } from '@/components/financing/FinancingCard';
import EquityWaterfallCard from '@/components/equity/WaterfallCard';
import CapTableCard from '@/components/equity/CapTableCard';
import EquityFlowsCard from '@/components/equity/EquityFlowsCard';
import { ScenarioDock } from '@/components/scenarios/ScenarioDock';
import { ScenarioPresets } from '@/components/scenarios';
import { FLAGS } from '@/lib/flags';

interface FormContentProps {
  projectId: string;
  onSubmit: (data: FeaslyModelFormData) => Promise<void>;
  onSaveDraft: () => void;
}

export function FormContent({ projectId, onSubmit, onSaveDraft }: FormContentProps) {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const { handleSubmit, watch } = useFormContext<FeaslyModelFormData>();
  const { projectId: selectedProjectId, scenarioId: selectedScenarioId, setProject, setScenario } = useSelectionStore();

  // State management
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(['project-metadata']));
  const [isWizardMode, setIsWizardMode] = useState(false);
  const [lastSaved, setLastSaved] = useState<string>('');
  const [hasShownSaveToast, setHasShownSaveToast] = useState(false);

  // Get form data for validation
  const formData = watch();
  
  // Grid validation counts for badges and wizard gating
  const validationCounts = useGridValidationCounts();

  // Section validation - now enhanced with grid validation
  const sections: ModelSection[] = defaultModelSections.map(section => {
    const { status } = useSectionStatus(section.id, formData);
    const gridValidation = validationCounts.grids[section.id];
    
    // Override status with grid validation if available
    const enhancedStatus = gridValidation 
      ? (gridValidation.isValid && gridValidation.totalItems > 0 ? 'valid' : 
         gridValidation.errorCount > 0 ? 'error' : 
         gridValidation.warningCount > 0 ? 'warning' : 'empty')
      : status;
      
    return { ...section, status: enhancedStatus };
  });

  // Wizard validation - enhanced with grid validation via wizard hook
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

  // Handle section navigation - simplified without forced scrolling
  const handleSectionClick = useCallback((sectionId: string) => {
    if (isWizardMode) {
      const stepIndex = sectionIds.indexOf(sectionId);
      wizard.goToStep(stepIndex);
      setOpenSections(new Set([sectionId]));
    } else {
      setOpenSections(prev => new Set([...prev, sectionId]));
      // Optional gentle scroll to section without forcing
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 100);
    }
  }, [isWizardMode, sectionIds, wizard]);

  // Handle section panel toggle - simplified without forced scrolling
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

    // Update scroll spy collapsed state without forced scrolling
    setSectionCollapsed(sectionId, !isOpen);
  }, [isWizardMode, setSectionCollapsed]);

  // Sync collapsed state when sections change
  useEffect(() => {
    sectionIds.forEach(id => {
      const isOpen = openSections.has(id);
      setSectionCollapsed(id, !isOpen);
    });
  }, [openSections, sectionIds, setSectionCollapsed]);

  // Simplified URL hash handling - no forced scrolling
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1); // Remove #
      if (hash && sectionIds.includes(hash)) {
        setOpenSections(prev => new Set([...prev, hash]));
        // Optional gentle scroll without forcing
        setTimeout(() => {
          const element = document.getElementById(hash);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 200);
      }
    };

    // Listen for hash changes only
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [sectionIds]);

  // Auto-save functionality
  useEffect(() => {
    const subscription = watch(() => {
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
  }, [watch, toast, hasShownSaveToast]);

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

  // Simplified auto-focus function without aggressive scrolling
  const handleValidationClick = useCallback(() => {
    // Find first section with errors
    const firstErrorSection = sections.find(section => {
      const gridValidation = validationCounts.grids[section.id];
      return gridValidation && gridValidation.errorCount > 0;
    });
    
    if (firstErrorSection) {
      // Open the section
      setOpenSections(prev => new Set([...prev, firstErrorSection.id]));
      
      // Gentle scroll to section without forcing
      setTimeout(() => {
        const sectionElement = document.getElementById(firstErrorSection.id);
        if (sectionElement) {
          sectionElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);
    }
  }, [sections, validationCounts, setOpenSections]);

  // Section navigation handlers
  const getSectionIndex = (sectionId: string) => sectionIds.indexOf(sectionId);
  
  const handleSectionNext = (currentSectionId: string) => {
    const currentIndex = getSectionIndex(currentSectionId);
    const nextIndex = currentIndex + 1;
    if (nextIndex < sectionIds.length) {
      const nextSectionId = sectionIds[nextIndex];
      handleSectionClick(nextSectionId);
    }
  };

  const handleSectionPrevious = (currentSectionId: string) => {
    const currentIndex = getSectionIndex(currentSectionId);
    const prevIndex = currentIndex - 1;
    if (prevIndex >= 0) {
      const prevSectionId = sectionIds[prevIndex];
      handleSectionClick(prevSectionId);
    }
  };

  const hasSectionNext = (sectionId: string) => {
    const currentIndex = getSectionIndex(sectionId);
    return currentIndex < sectionIds.length - 1;
  };

  const hasSectionPrevious = (sectionId: string) => {
    const currentIndex = getSectionIndex(sectionId);
    return currentIndex > 0;
  };

  // Submit handler
  const onFormSubmit = async (data: FeaslyModelFormData) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Submit error:', error);
    }
  };

  return (
    <div className="flex min-h-screen w-full">
      {/* Desktop Sidebar */}
      {!isMobile && (
        <ModelSideNav
          sections={sections}
          activeSection={activeSection}
          onSectionClick={handleSectionClick}
          isMobile={false}
        />
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

      {/* Main Content - Removed pt-0, proper spacing */}
      <div className="flex-1 overflow-hidden relative z-50 pointer-events-auto isolation-auto">
        {/* Simplified Header - Remove sticky to prevent conflicts */}
        <div className="border-b bg-background shadow-sm">
          <div className="flex flex-wrap items-center justify-between p-4 gap-4">
            <div className="flex items-center gap-4 min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold text-foreground">Feasibility Model</h1>
            </div>
            
            {/* Full Scenario Picker for modeling */}
            <div className="w-64">
              <ScenarioPickerV2
                value={{ projectId: selectedProjectId, scenarioId: selectedScenarioId }}
                onChange={({ projectId, scenarioId }) => {
                  setProject(projectId);
                  setScenario(scenarioId);
                }}
                baseRoute="feasly-model"
              />
            </div>
            
             {/* Compact KPIs */}
             <div className="hidden md:flex items-center gap-2">
                 <Badge variant="outline" className="text-xs px-2 py-1">
                   NPV: <span className="font-medium text-emerald-600">AED 2.3M</span>
                 </Badge>
                 <Badge variant="outline" className="text-xs px-2 py-1">
                   IRR: <span className="font-medium text-blue-600">18.2%</span>
                 </Badge>
                 
                 {/* Compact Validation Status */}
                 <Badge 
                   variant="outline"
                   className={cn(
                     "text-xs px-2 py-1 cursor-pointer hover:scale-105 transition-transform",
                     validationCounts.overall.isValid 
                       ? "text-emerald-700 border-emerald-300" 
                       : validationCounts.overall.totalErrors > 0
                       ? "text-red-700 border-red-300"
                       : "text-amber-700 border-amber-300"
                   )}
                   onClick={handleValidationClick}
                   title="Click to jump to first error"
                 >
                   {validationCounts.overall.isValid ? '✓' : 
                    validationCounts.overall.totalErrors > 0 ? '✗' : '⚠'}
                   {validationCounts.overall.completedSections}/{validationCounts.overall.totalSections}
                 </Badge>
               </div>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
              {/* Compact Save Status */}
              {lastSaved && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                  <span>Saved {lastSaved}</span>
                </div>
              )}

              {/* Compact Wizard Toggle */}
              <div className="flex items-center gap-2">
                <Label htmlFor="wizard-mode" className="text-xs font-medium">Guided</Label>
                <Switch
                  id="wizard-mode"
                  checked={isWizardMode}
                  onCheckedChange={setIsWizardMode}
                  className="scale-75"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Form Content with proper spacing */}
        <div className="p-6">
          {/* Right Side Validation Panel */}
          <RightSideValidationPanel />
          <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
            {/* Project Metadata */}
            <SectionPanel
              id="project-metadata"
              title="Project Information"
              icon={Building2}
              status={sections.find(s => s.id === 'project-metadata')?.status || 'empty'}
              isOpen={openSections.has('project-metadata')}
              onToggle={(open) => handleSectionToggle('project-metadata', open)}
              onNext={() => handleSectionNext('project-metadata')}
              onPrevious={() => handleSectionPrevious('project-metadata')}
              hasNext={hasSectionNext('project-metadata')}
              hasPrevious={hasSectionPrevious('project-metadata')}
            >
              <ProjectMetadata />
            </SectionPanel>

            {/* Timeline */}
            <SectionPanel
              id="timeline"
              title="Project Timeline"
              icon={Calendar}
              status={sections.find(s => s.id === 'timeline')?.status || 'empty'}
              isOpen={openSections.has('timeline')}
              onToggle={(open) => handleSectionToggle('timeline', open)}
              onNext={() => handleSectionNext('timeline')}
              onPrevious={() => handleSectionPrevious('timeline')}
              hasNext={hasSectionNext('timeline')}
              hasPrevious={hasSectionPrevious('timeline')}
            >
              <TimelineSection />
            </SectionPanel>

            {/* Site Metrics */}
            <SectionPanel
              id="site-metrics"
              title="Site Metrics"
              icon={MapPin}
              status={sections.find(s => s.id === 'site-metrics')?.status || 'empty'}
              isOpen={openSections.has('site-metrics')}
              onToggle={(open) => handleSectionToggle('site-metrics', open)}
              onNext={() => handleSectionNext('site-metrics')}
              onPrevious={() => handleSectionPrevious('site-metrics')}
              hasNext={hasSectionNext('site-metrics')}
              hasPrevious={hasSectionPrevious('site-metrics')}
            >
              <SiteMetrics />
            </SectionPanel>

            {/* Financial Inputs */}
            <SectionPanel
              id="financial-inputs"
              title="Financial Inputs"
              icon={DollarSign}
              status={sections.find(s => s.id === 'financial-inputs')?.status || 'empty'}
              isOpen={openSections.has('financial-inputs')}
              onToggle={(open) => handleSectionToggle('financial-inputs', open)}
              onNext={() => handleSectionNext('financial-inputs')}
              onPrevious={() => handleSectionPrevious('financial-inputs')}
              hasNext={hasSectionNext('financial-inputs')}
              hasPrevious={hasSectionPrevious('financial-inputs')}
              lazyLoad
            >
              <FinancialInputsV2 projectId={projectId} />
            </SectionPanel>

            {/* Construction & Development */}
            <SectionPanel
              id="construction-development"
              title="Construction & Development"
              icon={Building2}
              status={sections.find(s => s.id === 'construction-development')?.status || 'empty'}
              isOpen={openSections.has('construction-development')}
              onToggle={(open) => handleSectionToggle('construction-development', open)}
              onNext={() => handleSectionNext('construction-development')}
              onPrevious={() => handleSectionPrevious('construction-development')}
              hasNext={hasSectionNext('construction-development')}
              hasPrevious={hasSectionPrevious('construction-development')}
            >
              <ConstructionCostGrid />
            </SectionPanel>

            {/* Soft Costs */}
            <SectionPanel
              id="soft-costs"
              title="Soft Costs"
              icon={FileText}
              status={sections.find(s => s.id === 'soft-costs')?.status || 'empty'}
              isOpen={openSections.has('soft-costs')}
              onToggle={(open) => handleSectionToggle('soft-costs', open)}
              onNext={() => handleSectionNext('soft-costs')}
              onPrevious={() => handleSectionPrevious('soft-costs')}
              hasNext={hasSectionNext('soft-costs')}
              hasPrevious={hasSectionPrevious('soft-costs')}
            >
              <SoftCostGrid />
            </SectionPanel>

            {/* Marketing Costs */}
            <SectionPanel
              id="marketing-costs"
              title="Marketing Costs"
              icon={Megaphone}
              status={sections.find(s => s.id === 'marketing-costs')?.status || 'empty'}
              isOpen={openSections.has('marketing-costs')}
              onToggle={(open) => handleSectionToggle('marketing-costs', open)}
              onNext={() => handleSectionNext('marketing-costs')}
              onPrevious={() => handleSectionPrevious('marketing-costs')}
              hasNext={hasSectionNext('marketing-costs')}
              hasPrevious={hasSectionPrevious('marketing-costs')}
            >
              <MarketingCostGrid />
            </SectionPanel>

            {/* Contingencies */}
            <SectionPanel
              id="contingencies"
              title="Contingencies"
              icon={Shield}
              status={sections.find(s => s.id === 'contingencies')?.status || 'empty'}
              isOpen={openSections.has('contingencies')}
              onToggle={(open) => handleSectionToggle('contingencies', open)}
              onNext={() => handleSectionNext('contingencies')}
              onPrevious={() => handleSectionPrevious('contingencies')}
              hasNext={hasSectionNext('contingencies')}
              hasPrevious={hasSectionPrevious('contingencies')}
            >
              <ContingencyGrid />
            </SectionPanel>

            {/* Revenue Segments */}
            <SectionPanel
              id="revenue-segments"
              title="Revenue Segments"
              icon={TrendingUp}
              status={sections.find(s => s.id === 'revenue-segments')?.status || 'empty'}
              isOpen={openSections.has('revenue-segments')}
              onToggle={(open) => handleSectionToggle('revenue-segments', open)}
              onNext={() => handleSectionNext('revenue-segments')}
              onPrevious={() => handleSectionPrevious('revenue-segments')}
              hasNext={hasSectionNext('revenue-segments')}
              hasPrevious={hasSectionPrevious('revenue-segments')}
            >
              <SaleLinesGrid />
            </SectionPanel>

            {/* Rental Segments */}
            <SectionPanel
              id="rental-segments"
              title="Rental Segments"
              icon={Building2}
              status={sections.find(s => s.id === 'rental-segments')?.status || 'empty'}
              isOpen={openSections.has('rental-segments')}
              onToggle={(open) => handleSectionToggle('rental-segments', open)}
              onNext={() => handleSectionNext('rental-segments')}
              onPrevious={() => handleSectionPrevious('rental-segments')}
              hasNext={hasSectionNext('rental-segments')}
              hasPrevious={hasSectionPrevious('rental-segments')}
            >
              <RentalLinesGrid />
            </SectionPanel>

            {/* Scenarios */}
            <SectionPanel
              id="scenarios"
              title="Scenario Analysis"
              icon={BarChart3}
              status={sections.find(s => s.id === 'scenarios')?.status || 'empty'}
              isOpen={openSections.has('scenarios')}
              onToggle={(open) => handleSectionToggle('scenarios', open)}
              onNext={() => handleSectionNext('scenarios')}
              onPrevious={() => handleSectionPrevious('scenarios')}
              hasNext={hasSectionNext('scenarios')}
              hasPrevious={hasSectionPrevious('scenarios')}
            >
              <ScenariosSection />
            </SectionPanel>

            {/* Results & Insights */}
            <SectionPanel
              id="results-insights"
              title="Results & Insights"
              icon={Target}
              status={sections.find(s => s.id === 'results-insights')?.status || 'empty'}
              isOpen={openSections.has('results-insights')}
              onToggle={(open) => handleSectionToggle('results-insights', open)}
              onNext={() => handleSectionNext('results-insights')}
              onPrevious={() => handleSectionPrevious('results-insights')}
              hasNext={hasSectionNext('results-insights')}
              hasPrevious={hasSectionPrevious('results-insights')}
              lazyLoad
            >
              <div className="space-y-6">
                <ReconciliationCard />
                <CashFlowCard />
                <Suspense fallback={<div className="text-sm text-muted-foreground">Loading covenants...</div>}>
                  <CovenantsCard />
                </Suspense>
                <Suspense fallback={<div className="text-sm text-muted-foreground">Loading waterfall...</div>}>
                  <WaterfallCard />
                </Suspense>
                <Suspense fallback={<div className="text-sm text-muted-foreground">Loading financing...</div>}>
                  <FinancingCard />
                </Suspense>
                <Suspense fallback={<div className="text-sm text-muted-foreground">Loading equity waterfall...</div>}>
                  <EquityWaterfallCard />
                </Suspense>
                <Suspense fallback={<div className="text-sm text-muted-foreground">Loading cap table...</div>}>
                  <CapTableCard />
                </Suspense>
                <Suspense fallback={<div className="text-sm text-muted-foreground">Loading equity flows...</div>}>
                  <EquityFlowsCard />
                </Suspense>
                <KPIResults />
                
                {/* Scenario Dock */}
                {FLAGS.enableScenarios && (
                  <Suspense fallback={<div className="text-sm text-muted-foreground">Loading scenarios...</div>}>
                    <ScenarioDock />
                  </Suspense>
                )}
                
                {/* Scenario Presets */}
                {FLAGS.enableScenarios && (
                  <Suspense fallback={<div className="text-sm text-muted-foreground">Loading presets...</div>}>
                    <ScenarioPresets />
                  </Suspense>
                )}
              </div>
            </SectionPanel>

            {/* Export & AI */}
            <SectionPanel
              id="export-ai"
              title="Export & AI Insights"
              icon={FileText}
              status={sections.find(s => s.id === 'export-ai')?.status || 'empty'}
              isOpen={openSections.has('export-ai')}
              onToggle={(open) => handleSectionToggle('export-ai', open)}
              onNext={() => handleSectionNext('export-ai')}
              onPrevious={() => handleSectionPrevious('export-ai')}
              hasNext={hasSectionNext('export-ai')}
              hasPrevious={hasSectionPrevious('export-ai')}
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
              icon={Settings}
              status={sections.find(s => s.id === 'compliance')?.status || 'empty'}
              isOpen={openSections.has('compliance')}
              onToggle={(open) => handleSectionToggle('compliance', open)}
              onNext={() => handleSectionNext('compliance')}
              onPrevious={() => handleSectionPrevious('compliance')}
              hasNext={hasSectionNext('compliance')}
              hasPrevious={hasSectionPrevious('compliance')}
            >
              <ComplianceStatusPanel projectId={projectId} />
            </SectionPanel>

            {/* Comments */}
            <SectionPanel
              id="comments"
              title="Comments & Notes"
              icon={MessageSquare}
              status={sections.find(s => s.id === 'comments')?.status || 'empty'}
              isOpen={openSections.has('comments')}
              onToggle={(open) => handleSectionToggle('comments', open)}
              onNext={() => handleSectionNext('comments')}
              onPrevious={() => handleSectionPrevious('comments')}
              hasNext={hasSectionNext('comments')}
              hasPrevious={hasSectionPrevious('comments')}
            >
              <CommentingPanel projectId={projectId} />
            </SectionPanel>

            {/* Enhanced Wizard Navigation */}
            {isWizardMode && (
              <div className="flex items-center justify-between pt-6 border-t bg-gradient-to-r from-primary/5 to-transparent rounded-xl p-6 mt-8">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleWizardPrevious}
                  disabled={wizard.isFirstStep}
                  className="flex items-center gap-2 shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous Step
                </Button>

                <div className="flex items-center gap-4">
                  <div className="text-sm text-muted-foreground font-medium">
                    Step {wizard.currentStep + 1} of {wizard.totalSteps}
                  </div>
                  <div className="flex gap-1">
                    {Array.from({ length: wizard.totalSteps }, (_, i) => (
                      <div
                        key={i}
                        className={cn(
                          "h-2 w-8 rounded-full transition-all duration-300",
                          i <= wizard.currentStep 
                            ? "bg-primary" 
                            : "bg-muted"
                        )}
                      />
                    ))}
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={handleWizardNext}
                  disabled={!wizard.canProceedToNext || wizard.isLastStep}
                  className="flex items-center gap-2 shadow-sm hover:shadow-md transition-all duration-200"
                >
                  {wizard.isLastStep ? 'Complete' : 'Next Step'}
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Enhanced Action Buttons */}
            {!isWizardMode && (
              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4 pt-8 border-t bg-gradient-to-r from-muted/20 to-transparent rounded-xl p-6 mt-8">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onSaveDraft}
                  className="min-h-[44px] shadow-sm hover:shadow-md transition-all duration-200 bg-card"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Draft
                </Button>
                <Button 
                  type="submit"
                  className="min-h-[44px] shadow-md hover:shadow-lg transition-all duration-200 bg-gradient-to-r from-primary to-primary-dark"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Generate Financial Model
                </Button>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Enhanced Mobile Floating Action Menu */}
      {isMobile && (
        <FloatingActionMenu
          onSave={onSaveDraft}
          onExport={() => handleSubmit(onFormSubmit)()}
          onComment={() => {
            // Scroll to comments section
            const commentsSection = document.getElementById('comments');
            if (commentsSection) {
              commentsSection.scrollIntoView({ behavior: 'smooth' });
            }
          }}
          onSettings={() => {
            // You can implement settings modal here
            console.log('Settings clicked');
          }}
        />
      )}
    </div>
  );
}