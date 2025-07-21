import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useFeaslyInsights, InsightItem } from '@/hooks/useFeaslyInsights';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { 
  TrendingUp, 
  AlertTriangle, 
  AlertCircle, 
  Pin,
  RefreshCw,
  Save
} from 'lucide-react';

interface SmartExplainerPanelProps {
  projectId?: string;
  scenarios?: string[];
}

const getInsightIcon = (type: InsightItem['type']) => {
  switch (type) {
    case 'opportunity':
      return <TrendingUp className="h-4 w-4 text-green-600" />;
    case 'risk':
      return <AlertTriangle className="h-4 w-4 text-red-600" />;
    case 'caution':
      return <AlertCircle className="h-4 w-4 text-yellow-600" />;
    case 'note':
      return <Pin className="h-4 w-4 text-blue-600" />;
    default:
      return <Pin className="h-4 w-4" />;
  }
};

const getInsightBadgeVariant = (type: InsightItem['type']) => {
  switch (type) {
    case 'opportunity':
      return 'default' as const;
    case 'risk':
      return 'destructive' as const;
    case 'caution':
      return 'secondary' as const;
    case 'note':
      return 'outline' as const;
    default:
      return 'outline' as const;
  }
};

export const SmartExplainerPanel: React.FC<SmartExplainerPanelProps> = ({
  projectId,
  scenarios = ['Base', 'Optimistic', 'Pessimistic']
}) => {
  const { t } = useTranslation('feasly.model');
  const { watch } = useFormContext();
  const formData = watch();
  
  const { 
    insights, 
    isLoading, 
    saveInsights, 
    isSaving, 
    generateInsights 
  } = useFeaslyInsights(projectId);

  const [generatedInsights, setGeneratedInsights] = useState<Record<string, InsightItem[]>>({});
  const [userNotes, setUserNotes] = useState<Record<string, string>>({});
  const [activeScenario, setActiveScenario] = useState(scenarios[0]);

  // Initialize user notes from saved insights
  useEffect(() => {
    if (insights.length > 0) {
      const notesMap: Record<string, string> = {};
      insights.forEach(insight => {
        if (insight.user_notes) {
          notesMap[insight.scenario] = insight.user_notes;
        }
      });
      setUserNotes(notesMap);
    }
  }, [insights]);

  // Auto-generate insights when form data changes
  useEffect(() => {
    if (formData && Object.keys(formData).length > 0) {
      const newInsights = generateInsights(formData, scenarios);
      setGeneratedInsights(newInsights);
    }
  }, [formData, scenarios, generateInsights]);

  const handleRegenerateInsights = () => {
    if (formData) {
      const newInsights = generateInsights(formData, scenarios);
      setGeneratedInsights(newInsights);
    }
  };

  const handleSaveNotes = async (scenario: string) => {
    if (!projectId) return;
    
    await saveInsights({
      projectId,
      scenario,
      generatedInsights: generatedInsights[scenario] || [],
      userNotes: userNotes[scenario] || ''
    });
  };

  const handleUserNotesChange = (scenario: string, notes: string) => {
    setUserNotes(prev => ({
      ...prev,
      [scenario]: notes
    }));
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Smart Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-4 bg-muted animate-pulse rounded" />
            <div className="h-4 bg-muted animate-pulse rounded" />
            <div className="h-4 bg-muted animate-pulse rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          {t('smart_insights')}
        </CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRegenerateInsights}
          disabled={isSaving}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isSaving ? 'animate-spin' : ''}`} />
          {t('regenerate_insights')}
        </Button>
      </CardHeader>
      <CardContent>
        <Tabs value={activeScenario} onValueChange={setActiveScenario}>
          <TabsList className="grid w-full grid-cols-3">
            {scenarios.map(scenario => (
              <TabsTrigger key={scenario} value={scenario}>
                {scenario}
              </TabsTrigger>
            ))}
          </TabsList>

          {scenarios.map(scenario => (
            <TabsContent key={scenario} value={scenario} className="space-y-4">
              {/* Generated Insights */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground">
                  {t('ai_generated_insights')}
                </h4>
                
                {generatedInsights[scenario]?.length > 0 ? (
                  <div className="space-y-3">
                    {generatedInsights[scenario].map((insight, index) => (
                      <div key={insight.id || index} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                        <div className="flex-shrink-0 mt-0.5">
                          {getInsightIcon(insight.type)}
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <h5 className="text-sm font-medium">{insight.title}</h5>
                            <Badge variant={getInsightBadgeVariant(insight.type)} className="text-xs">
                              {insight.type}
                            </Badge>
                            {insight.value && (
                              <Badge variant="outline" className="text-xs">
                                {insight.value}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {insight.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>{t('no_insights_yet')}</p>
                  </div>
                )}
              </div>

              <Separator />

              {/* User Notes */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Pin className="h-4 w-4" />
                    {t('user_notes')}
                  </h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSaveNotes(scenario)}
                    disabled={isSaving || !projectId}
                    className="flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {t('save_notes')}
                  </Button>
                </div>
                
                <Textarea
                  placeholder={t('notes_placeholder')}
                  value={userNotes[scenario] || ''}
                  onChange={(e) => handleUserNotesChange(scenario, e.target.value)}
                  className="min-h-[100px]"
                />
                
                <p className="text-xs text-muted-foreground">
                  {t('notes_markdown_help')}
                </p>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};