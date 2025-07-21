import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, ChevronDown, ChevronRight, Copy, Save, User, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useComments } from "@/hooks/useComments";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface CommentSection {
  key: string;
  label: string;
  description: string;
}

interface CommentingPanelProps {
  projectId?: string;
}

export function CommentingPanel({ projectId }: CommentingPanelProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [currentUser, setCurrentUser] = useState<{ id: string; email?: string } | null>(null);
  const [tempComments, setTempComments] = useState<Record<string, string>>({});

  const { 
    comments, 
    isLoading, 
    upsertComment, 
    deleteComment, 
    getCommentBySection,
    isUpsertingComment 
  } = useComments(projectId);

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

  // Get current user
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUser({ id: user.id, email: user.email });
      }
    };
    getCurrentUser();
  }, []);

  // Initialize temp comments from database
  useEffect(() => {
    if (comments.length > 0) {
      const tempCommentsFromDB: Record<string, string> = {};
      comments.forEach(comment => {
        if (comment.user_id === currentUser?.id) {
          tempCommentsFromDB[comment.section_key] = comment.comment;
        }
      });
      setTempComments(tempCommentsFromDB);
    }
  }, [comments, currentUser?.id]);

  const updateTempComment = (sectionKey: string, value: string) => {
    setTempComments(prev => ({
      ...prev,
      [sectionKey]: value
    }));
  };

  const saveComment = async (sectionKey: string) => {
    if (!currentUser || !projectId) {
      toast({
        title: "Authentication Required",
        description: "Please log in to save comments.",
        variant: "destructive"
      });
      return;
    }

    const commentText = tempComments[sectionKey]?.trim();
    
    try {
      if (commentText) {
        await upsertComment(sectionKey, commentText, currentUser.id);
        toast({
          title: "Comment Saved",
          description: "Your comment has been saved successfully."
        });
      } else {
        await deleteComment(sectionKey, currentUser.id);
        toast({
          title: "Comment Deleted",
          description: "Your comment has been deleted."
        });
      }
    } catch (error) {
      console.error('Failed to save comment:', error);
    }
  };

  const toggleSection = (sectionKey: string) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  const copyAllNotes = async () => {
    const userComments = comments.filter(c => c.user_id === currentUser?.id);
    const allNotes = sections
      .filter(section => {
        const comment = userComments.find(c => c.section_key === section.key);
        return comment?.comment?.trim();
      })
      .map(section => {
        const comment = userComments.find(c => c.section_key === section.key);
        return `## ${section.label}\n${comment?.comment}\n`;
      })
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

  const getTotalComments = () => {
    return comments.filter(c => c.user_id === currentUser?.id).length;
  };

  const formatLastUpdated = (timestamp: string) => {
    try {
      return format(new Date(timestamp), "MMM d, yyyy 'at' h:mm a");
    } catch {
      return "Unknown";
    }
  };

  const getLastUpdatedInfo = (sectionKey: string) => {
    const allSectionComments = comments.filter(c => c.section_key === sectionKey);
    const latestComment = allSectionComments.sort((a, b) => 
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    )[0];

    if (!latestComment) return null;

    const isCurrentUser = latestComment.user_id === currentUser?.id;
    const userLabel = isCurrentUser ? "You" : (latestComment.user_id || "Another user");
    
    return {
      user: userLabel,
      timestamp: formatLastUpdated(latestComment.updated_at),
      isCurrentUser
    };
  };

  if (!currentUser) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            <CardTitle>Project Comments</CardTitle>
          </div>
          <CardDescription>
            Please log in to add comments and collaborate with your team
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Authentication required</p>
            <p className="text-sm">Log in to view and add project comments</p>
          </div>
        </CardContent>
      </Card>
    );
  }

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
            <Button onClick={copyAllNotes} variant="outline" size="sm">
              <Copy className="h-4 w-4 mr-2" />
              Copy All Notes
            </Button>
          </div>
        </div>
        <CardDescription>
          Add notes and comments for each section of your feasibility model. Changes are saved automatically.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50 animate-pulse" />
            <p>Loading comments...</p>
          </div>
        ) : (
          <>
            {sections.map((section) => {
              const isOpen = openSections[section.key];
              const userComment = getCommentBySection(section.key);
              const tempComment = tempComments[section.key] || "";
              const hasUserComment = userComment?.user_id === currentUser?.id;
              const lastUpdatedInfo = getLastUpdatedInfo(section.key);
              const hasAnyComments = comments.some(c => c.section_key === section.key);
              
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
                      <div className="flex items-center space-x-2">
                        {hasUserComment && (
                          <Badge variant="default" className="text-xs">
                            Your note
                          </Badge>
                        )}
                        {hasAnyComments && !hasUserComment && (
                          <Badge variant="outline" className="text-xs">
                            {comments.filter(c => c.section_key === section.key).length} comment{comments.filter(c => c.section_key === section.key).length !== 1 ? 's' : ''}
                          </Badge>
                        )}
                      </div>
                    </Button>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent className="pt-3 space-y-3">
                    <div className="space-y-2">
                      <Textarea
                        placeholder={`Add your notes for ${section.label}...`}
                        value={tempComment}
                        onChange={(e) => updateTempComment(section.key, e.target.value)}
                        className="min-h-24 resize-none"
                        rows={3}
                      />
                      
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-muted-foreground">
                          {tempComment.length} characters
                        </div>
                        
                        <Button
                          onClick={() => saveComment(section.key)}
                          disabled={isUpsertingComment}
                          size="sm"
                          variant="outline"
                        >
                          <Save className="h-3 w-3 mr-1" />
                          {isUpsertingComment ? "Saving..." : "Save"}
                        </Button>
                      </div>
                    </div>

                    {/* Display other users' comments */}
                    {comments
                      .filter(c => c.section_key === section.key && c.user_id !== currentUser?.id)
                      .map(comment => (
                        <div key={comment.id} className="border-l-2 border-muted pl-3 py-2 bg-muted/30 rounded-r">
                          <div className="flex items-center space-x-2 mb-1">
                            <User className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs font-medium">Team member</span>
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {formatLastUpdated(comment.updated_at)}
                            </span>
                          </div>
                          <p className="text-sm">{comment.comment}</p>
                        </div>
                      ))}

                    {lastUpdatedInfo && (
                      <div className="text-xs text-muted-foreground flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>
                          Last updated by {lastUpdatedInfo.user} on {lastUpdatedInfo.timestamp}
                        </span>
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
          </>
        )}
      </CardContent>
    </Card>
  );
}