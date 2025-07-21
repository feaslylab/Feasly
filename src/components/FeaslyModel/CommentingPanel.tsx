import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, ChevronDown, ChevronRight, Copy, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CommentSection {
  key: string;
  label: string;
  description: string;
}

export function CommentingPanel() {
  const { t } = useLanguage();
  const { toast } = useToast();
  
  const [comments, setComments] = useState<Record<string, string>>({});
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  const sections: CommentSection[] = [
    {
      key: "metadata",
      label: "Project Metadata",
      description: "Comments on project information, sponsor, location"
    },
    {
      key: "timeline",
      label: "Timeline & Phases", 
      description: "Notes on project schedule and milestones"
    },
    {
      key: "site_metrics",
      label: "Site Metrics",
      description: "Comments on GFA, efficiency, and site specifications"
    },
    {
      key: "financials",
      label: "Financial Inputs",
      description: "Notes on costs, funding, and revenue assumptions"
    },
    {
      key: "scenarios",
      label: "Scenarios",
      description: "Comments on scenario analysis and sensitivity"
    },
    {
      key: "kpi",
      label: "KPI Results",
      description: "Analysis notes on financial performance metrics"
    }
  ];

  // Load comments from localStorage on mount
  useEffect(() => {
    const savedComments = localStorage.getItem("feasly_model_comments");
    if (savedComments) {
      try {
        setComments(JSON.parse(savedComments));
      } catch (error) {
        console.error("Failed to load comments:", error);
      }
    }
  }, []);

  // Auto-save to localStorage when comments change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      localStorage.setItem("feasly_model_comments", JSON.stringify(comments));
    }, 1000); // Debounce for 1 second

    return () => clearTimeout(timeoutId);
  }, [comments]);

  const updateComment = (sectionKey: string, value: string) => {
    setComments(prev => ({
      ...prev,
      [sectionKey]: value
    }));
  };

  const toggleSection = (sectionKey: string) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  const copyAllNotes = async () => {
    const allNotes = sections
      .filter(section => comments[section.key]?.trim())
      .map(section => `## ${section.label}\n${comments[section.key]}\n`)
      .join("\n");

    if (!allNotes.trim()) {
      toast({
        title: "No Notes",
        description: "No comments available to copy.",
        variant: "destructive"
      });
      return;
    }

    try {
      await navigator.clipboard.writeText(allNotes);
      toast({
        title: "Notes Copied",
        description: "All project notes have been copied to clipboard."
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy notes to clipboard.",
        variant: "destructive"
      });
    }
  };

  const saveManually = () => {
    localStorage.setItem("feasly_model_comments", JSON.stringify(comments));
    toast({
      title: "Comments Saved",
      description: "Your comments have been saved locally."
    });
  };

  const getTotalComments = () => {
    return sections.filter(section => comments[section.key]?.trim()).length;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            <CardTitle>{t('feasly.model.project_comments')}</CardTitle>
            {getTotalComments() > 0 && (
              <Badge variant="secondary">
                {getTotalComments()} section{getTotalComments() !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Button onClick={saveManually} variant="outline" size="sm">
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
            <Button onClick={copyAllNotes} variant="outline" size="sm">
              <Copy className="h-4 w-4 mr-2" />
              Copy All Notes
            </Button>
          </div>
        </div>
        <CardDescription>
          Add notes and comments for each section of your feasibility model
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {sections.map((section) => {
          const isOpen = openSections[section.key];
          const hasComment = comments[section.key]?.trim();
          
          return (
            <Collapsible 
              key={section.key}
              open={isOpen}
              onOpenChange={() => toggleSection(section.key)}
            >
              <CollapsibleTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="w-full justify-between p-3 h-auto border rounded-lg hover:bg-muted/50"
                >
                  <div className="flex items-center space-x-3">
                    {isOpen ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                    <div className="text-left">
                      <div className="font-medium">{section.label}</div>
                      <div className="text-sm text-muted-foreground">
                        {section.description}
                      </div>
                    </div>
                  </div>
                  {hasComment && (
                    <Badge variant="default" className="text-xs">
                      Has notes
                    </Badge>
                  )}
                </Button>
              </CollapsibleTrigger>
              
              <CollapsibleContent className="pt-3">
                <Textarea
                  placeholder={`Add your notes for ${section.label}...`}
                  value={comments[section.key] || ""}
                  onChange={(e) => updateComment(section.key, e.target.value)}
                  className="min-h-24 resize-none"
                  rows={3}
                />
                {comments[section.key]?.trim() && (
                  <div className="text-xs text-muted-foreground mt-2">
                    {comments[section.key].length} characters • Auto-saved
                  </div>
                )}
              </CollapsibleContent>
            </Collapsible>
          );
        })}

        {getTotalComments() === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No comments yet</p>
            <p className="text-sm">Click on any section above to add notes</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}