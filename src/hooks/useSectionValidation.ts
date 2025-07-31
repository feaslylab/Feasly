import { useState, useEffect } from 'react';
import { SectionStatus } from '@/components/model/SectionPanel';

interface SectionValidation {
  isValid: boolean;
  hasWarnings: boolean;
  hasErrors: boolean;
  completionRatio: number;
  requiredFields: string[];
  missingFields: string[];
}

// Mock validation logic - in real implementation this would integrate with existing Zod schemas
const mockValidateSection = (sectionId: string, formData?: any): SectionValidation => {
  // Simulate validation based on section
  switch (sectionId) {
    case 'project-metadata':
      return {
        isValid: formData?.project_name && formData?.country && formData?.currency_code,
        hasWarnings: false,
        hasErrors: !formData?.project_name,
        completionRatio: formData?.project_name ? 0.8 : 0.2,
        requiredFields: ['project_name', 'country', 'currency_code'],
        missingFields: formData?.project_name ? [] : ['project_name']
      };
    
    case 'timeline':
      return {
        isValid: formData?.project_duration && formData?.start_date,
        hasWarnings: false,
        hasErrors: false,
        completionRatio: formData?.project_duration ? 0.9 : 0.1,
        requiredFields: ['project_duration', 'start_date'],
        missingFields: []
      };
    
    case 'site-metrics':
      return {
        isValid: formData?.total_gfa && formData?.site_area,
        hasWarnings: formData?.total_gfa && formData?.total_gfa < 1000,
        hasErrors: false,
        completionRatio: formData?.total_gfa ? 0.7 : 0.0,
        requiredFields: ['total_gfa', 'site_area'],
        missingFields: formData?.total_gfa ? [] : ['total_gfa']
      };
    
    case 'financial-inputs':
      return {
        isValid: formData?.total_construction_cost && formData?.land_cost,
        hasWarnings: false,
        hasErrors: false,
        completionRatio: formData?.total_construction_cost ? 0.6 : 0.0,
        requiredFields: ['total_construction_cost', 'land_cost'],
        missingFields: []
      };
    
    default:
      return {
        isValid: false,
        hasWarnings: false,
        hasErrors: false,
        completionRatio: 0,
        requiredFields: [],
        missingFields: []
      };
  }
};

export function useSectionStatus(sectionId: string, formData?: any) {
  const [validation, setValidation] = useState<SectionValidation>(() => 
    mockValidateSection(sectionId, formData)
  );

  useEffect(() => {
    // Re-validate when form data changes
    const newValidation = mockValidateSection(sectionId, formData);
    setValidation(newValidation);
  }, [sectionId, formData]);

  // Calculate status based on validation
  const status: SectionStatus = (() => {
    if (validation.hasErrors) return 'error';
    if (validation.hasWarnings) return 'warning';
    if (validation.isValid) return 'valid';
    return 'empty';
  })();

  return {
    status,
    validation,
    completionRatio: validation.completionRatio,
    isComplete: validation.isValid,
    hasIssues: validation.hasErrors || validation.hasWarnings,
    requiredFields: validation.requiredFields,
    missingFields: validation.missingFields
  };
}

// Hook for wizard flow validation
export function useWizardValidation(sections: string[], formData?: any) {
  const [currentStep, setCurrentStep] = useState(0);
  
  const sectionStatuses = sections.map(sectionId => {
    const { status, validation } = useSectionStatus(sectionId, formData);
    return {
      sectionId,
      status,
      validation,
      canProceed: validation.isValid || !validation.requiredFields.length
    };
  });

  const canProceedToNext = sectionStatuses[currentStep]?.canProceed ?? false;
  const isLastStep = currentStep >= sections.length - 1;
  const isFirstStep = currentStep === 0;

  const nextStep = () => {
    if (canProceedToNext && !isLastStep) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const previousStep = () => {
    if (!isFirstStep) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const goToStep = (stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < sections.length) {
      setCurrentStep(stepIndex);
    }
  };

  return {
    currentStep,
    currentSection: sections[currentStep],
    canProceedToNext,
    isLastStep,
    isFirstStep,
    sectionStatuses,
    nextStep,
    previousStep,
    goToStep,
    totalSteps: sections.length
  };
}