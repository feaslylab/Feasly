import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { PageHeader } from '@/components/ui/PageHeader';
import { RightRail } from '@/components/ui/RightRail';
import { Button } from '@/components/ui/button';
import { Save, FileText, Send } from 'lucide-react';
import { FeaslyModelV2 } from '@/components/FeaslyModel/FeaslyModelV2';
import { ds } from '@/lib/design-system';
import { cn } from '@/lib/utils';
import { useLocale } from '@/contexts/LocaleContext';

export default function ModelPage() {
  const { t } = useTranslation('common');
  const { locale } = useLocale();
  const [searchParams] = useSearchParams();
  
  const projectId = searchParams.get('project');
  const scenarioId = searchParams.get('scenario');

  // Mock project data - replace with real data in Phase 2
  const projectName = 'Solar Farm Project Alpha';
  const scenarioName = scenarioId ? `Scenario ${scenarioId}` : 'Base Case';

  const validationItems = [
    { id: '1', type: 'warning', message: 'DSCR falls below 1.2 in Year 3', severity: 'medium' },
    { id: '2', type: 'info', message: 'Consider updating inflation assumptions', severity: 'low' },
    { id: '3', type: 'error', message: 'Missing required environmental permits', severity: 'high' },
  ];

  const getValidationIcon = (type: string) => {
    switch (type) {
      case 'error':
        return '🔴';
      case 'warning':
        return '🟡';
      case 'info':
        return '🔵';
      default:
        return '⚪';
    }
  };

  return (
    <div className={cn(ds.container.pad, 'min-h-screen')}>
      <PageHeader
        title={projectName}
        subtitle={`${t('model.scenario')}: ${scenarioName}`}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <FileText className="h-4 w-4 mr-2" />
              {t('model.generateReport')}
            </Button>
            <Button variant="outline" size="sm" disabled>
              <Send className="h-4 w-4 mr-2" />
              {t('model.submitForApproval')}
            </Button>
            <Button size="sm">
              <Save className="h-4 w-4 mr-2" />
              {t('model.save')}
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-12rem)]">
        {/* Main Content */}
        <div className="lg:col-span-3" data-testid="model-content">
          <div className="bg-card rounded-2xl shadow-sm border h-full">
            <FeaslyModelV2 
              projectId={projectId || 'default'}
              onSubmit={async (data) => console.log('Model submitted:', data)}
              onSaveDraft={() => console.log('Draft saved')}
            />
          </div>
        </div>

        {/* Right Rail */}
        <div className="lg:col-span-1 hidden lg:block">
          <div className="bg-card rounded-2xl shadow-sm border h-full">
            <RightRail title={t('model.validation.title')} data-testid="right-rail">
              <div className="space-y-3" data-testid="validation-content">
                {validationItems.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-3">✅</div>
                    <p className={cn(ds.type.small, 'text-muted-foreground')}>
                      {t('model.validation.allGood')}
                    </p>
                  </div>
                ) : (
                  validationItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30"
                    >
                      <span className="text-lg">{getValidationIcon(item.type)}</span>
                      <div className="flex-1 min-w-0">
                        <p className={cn(ds.type.small, 'text-foreground')}>
                          {item.message}
                        </p>
                        <span className={cn(
                          ds.type.small,
                          'text-muted-foreground capitalize'
                        )}>
                          {item.severity} priority
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </RightRail>
          </div>
        </div>
      </div>
    </div>
  );
}