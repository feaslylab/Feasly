import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, ArrowLeft, CheckCircle2, FolderPlus, BarChart3, Users } from 'lucide-react';
import { PATHS } from '@/routes/paths';

interface WelcomeWizardProps {
  onComplete?: () => void;
}

type Step = 'welcome' | 'role' | 'project-type' | 'complete';

export const WelcomeWizard = ({ onComplete }: WelcomeWizardProps) => {
  const [currentStep, setCurrentStep] = useState<Step>('welcome');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [selectedProjectType, setSelectedProjectType] = useState<string>('');
  const navigate = useNavigate();

  const roles = [
    { id: 'developer', label: 'Real Estate Developer', description: 'I develop real estate projects' },
    { id: 'investor', label: 'Investor', description: 'I invest in real estate projects' },
    { id: 'analyst', label: 'Financial Analyst', description: 'I analyze financial performance' },
    { id: 'consultant', label: 'Consultant', description: 'I advise on real estate investments' },
  ];

  const projectTypes = [
    { id: 'residential', label: 'Residential Development', description: 'Apartments, villas, townhouses' },
    { id: 'commercial', label: 'Commercial Development', description: 'Office buildings, retail spaces' },
    { id: 'mixed-use', label: 'Mixed-Use Development', description: 'Combination of residential and commercial' },
    { id: 'portfolio', label: 'Investment Portfolio', description: 'Multiple projects and investments' },
  ];

  const handleNext = () => {
    switch (currentStep) {
      case 'welcome':
        setCurrentStep('role');
        break;
      case 'role':
        setCurrentStep('project-type');
        break;
      case 'project-type':
        setCurrentStep('complete');
        break;
      case 'complete':
        handleComplete();
        break;
    }
  };

  const handleBack = () => {
    switch (currentStep) {
      case 'role':
        setCurrentStep('welcome');
        break;
      case 'project-type':
        setCurrentStep('role');
        break;
      case 'complete':
        setCurrentStep('project-type');
        break;
    }
  };

  const handleComplete = () => {
    // Save preferences to localStorage
    localStorage.setItem('user-onboarding', JSON.stringify({
      role: selectedRole,
      projectType: selectedProjectType,
      completedAt: new Date().toISOString(),
    }));
    
    onComplete?.();
    navigate(PATHS.dashboard);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'welcome':
        return true;
      case 'role':
        return selectedRole !== '';
      case 'project-type':
        return selectedProjectType !== '';
      case 'complete':
        return true;
      default:
        return false;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'welcome':
        return (
          <div className="text-center space-y-6">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <BarChart3 className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">Welcome to Feasly!</h2>
              <p className="text-muted-foreground">
                Let's get you set up in just a few steps. This will help us customize your experience.
              </p>
            </div>
            <div className="flex justify-center space-x-2">
              <Badge variant="secondary">Step 1 of 3</Badge>
            </div>
          </div>
        );

      case 'role':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">What's your role?</h2>
              <p className="text-muted-foreground">
                Help us understand how you'll be using Feasly
              </p>
              <Badge variant="secondary" className="mt-2">Step 2 of 3</Badge>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {roles.map((role) => (
                <button
                  key={role.id}
                  onClick={() => setSelectedRole(role.id)}
                  className={`text-left p-4 rounded-lg border transition-colors ${
                    selectedRole === role.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="font-medium">{role.label}</div>
                  <div className="text-sm text-muted-foreground">{role.description}</div>
                </button>
              ))}
            </div>
          </div>
        );

      case 'project-type':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">What type of projects do you work with?</h2>
              <p className="text-muted-foreground">
                This helps us show you relevant templates and examples
              </p>
              <Badge variant="secondary" className="mt-2">Step 3 of 3</Badge>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {projectTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSelectedProjectType(type.id)}
                  className={`text-left p-4 rounded-lg border transition-colors ${
                    selectedProjectType === type.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="font-medium">{type.label}</div>
                  <div className="text-sm text-muted-foreground">{type.description}</div>
                </button>
              ))}
            </div>
          </div>
        );

      case 'complete':
        return (
          <div className="text-center space-y-6">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">You're all set!</h2>
              <p className="text-muted-foreground">
                Welcome to Feasly! You can now start creating projects and managing your portfolio.
              </p>
            </div>
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <div className="text-sm font-medium">Your preferences:</div>
              <div className="text-sm text-muted-foreground">
                Role: {roles.find(r => r.id === selectedRole)?.label}
              </div>
              <div className="text-sm text-muted-foreground">
                Focus: {projectTypes.find(t => t.id === selectedProjectType)?.label}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center pb-4">
          <div className="flex items-center justify-center mb-4">
            <BarChart3 className="h-8 w-8 text-primary mr-2" />
            <span className="text-2xl font-bold">Feasly</span>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {renderStep()}
          
          <div className="flex justify-between mt-8">
            <Button 
              variant="outline" 
              onClick={handleBack}
              disabled={currentStep === 'welcome'}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button 
              onClick={handleNext}
              disabled={!canProceed()}
            >
              {currentStep === 'complete' ? 'Get Started' : 'Next'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};