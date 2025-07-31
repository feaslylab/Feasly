import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { useToast } from '@/hooks/use-toast';
import { useAllProjectsKPIs } from '@/hooks/useProjectKPIs';
import { 
  Plus, 
  Search, 
  Filter, 
  Star, 
  StarOff, 
  Archive, 
  ArchiveRestore,
  Calendar,
  Tag,
  Grid3X3,
  List,
  X,
  ChevronDown,
  ChevronUp,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { 
  generateAndSaveProjectSummary, 
  suggestTagsFromText, 
  logTagSuggestions, 
  getProjectSearchText, 
  truncateText 
} from '@/lib/projectAI';

const newProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(100, 'Name too long'),
  description: z.string().max(500, 'Description too long').optional(),
  status: z.enum(['draft', 'active', 'archived']).default('draft'),
  tags: z.string().optional(),
});

type NewProjectFormData = z.infer<typeof newProjectSchema>;

interface Project {
  id: string;
  name: string;
  description: string | null;
  status: 'draft' | 'active' | 'archived';
  tags: string[];
  is_pinned: boolean;
  project_ai_summary: string | null;
  created_at: string;
  updated_at: string;
  currency_code: string;
  user_id: string;
}

export default function Projects() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // State for filters and UI
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);

  const form = useForm<NewProjectFormData>({
    resolver: zodResolver(newProjectSchema),
    defaultValues: {
      name: '',
      description: '',
      status: 'draft',
      tags: '',
    },
  });

  // Watch form fields for smart tag suggestions
  const watchedName = form.watch('name');
  const watchedDescription = form.watch('description');

  // Generate smart tag suggestions
  useEffect(() => {
    const combinedText = `${watchedName || ''} ${watchedDescription || ''}`.trim();
    if (combinedText.length > 3) {
      const suggestions = suggestTagsFromText(combinedText);
      setSuggestedTags(suggestions);
    } else {
      setSuggestedTags([]);
    }
  }, [watchedName, watchedDescription]);

  // Fetch projects
  const { data: projects = [], isLoading, error } = useQuery({
    queryKey: ['projects', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('is_pinned', { ascending: false })
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data as Project[];
    },
    enabled: !!user?.id,
  });

  // Get unique tags for filter dropdown
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    projects.forEach(project => {
      project.tags?.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [projects]);

  // Enhanced filtering logic
  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      // Status filter
      if (statusFilter !== 'all' && project.status !== statusFilter) {
        return false;
      }
      
      // Tag filter
      if (selectedTags.length > 0) {
        const hasSelectedTag = selectedTags.some(tag => 
          project.tags?.includes(tag)
        );
        if (!hasSelectedTag) return false;
      }
      
      // Enhanced search filter (includes AI summary)
      if (searchTerm) {
        const searchText = getProjectSearchText(project);
        if (!searchText.includes(searchTerm.toLowerCase())) {
          return false;
        }
      }
      
      return true;
    });
  }, [projects, searchTerm, statusFilter, selectedTags]);

  // Create project mutation with AI summary generation
  const createProjectMutation = useMutation({
    mutationFn: async (formData: NewProjectFormData) => {
      if (!user?.id) throw new Error('User not authenticated');

      const tags = formData.tags 
        ? formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
        : [];

      const projectData = {
        name: formData.name,
        description: formData.description || null,
        status: formData.status,
        tags,
        user_id: user.id,
        currency_code: 'AED',
      };

      const { data: project, error } = await supabase
        .from('projects')
        .insert(projectData)
        .select()
        .single();

      if (error) throw error;

      // Generate AI summary
      const summary = await generateAndSaveProjectSummary(project, undefined);
      
      // Generate and log tag suggestions
      const combinedText = `${project.name} ${project.description || ''}`;
      const suggestedTagsList = suggestTagsFromText(combinedText);
      if (suggestedTagsList.length > 0) {
        await logTagSuggestions(project.id, suggestedTagsList);
      }

      return { ...project, project_ai_summary: summary };
    },
    onSuccess: (project) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      form.reset();
      setIsDialogOpen(false);
      setSuggestedTags([]);
      toast({
        title: "Project created successfully",
        description: `${project.name} has been created with AI summary generated.`,
      });
      navigate(`/feasly-model?projectId=${project.id}`);
    },
    onError: (error) => {
      console.error('Failed to create project:', error);
      toast({
        title: "Error creating project",
        description: "Please try again.",
        variant: "destructive",
      });
    },
  });

  // Toggle pin mutation
  const togglePinMutation = useMutation({
    mutationFn: async ({ projectId, isPinned }: { projectId: string; isPinned: boolean }) => {
      const { error } = await supabase
        .from('projects')
        .update({ is_pinned: !isPinned, updated_at: new Date().toISOString() })
        .eq('id', projectId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
    onError: (error) => {
      console.error('Failed to toggle pin:', error);
      toast({
        title: "Error updating project",
        description: "Please try again.",
        variant: "destructive",
      });
    },
  });

  // Archive/restore mutation
  const archiveMutation = useMutation({
    mutationFn: async ({ projectId, status }: { projectId: string; status: 'active' | 'archived' }) => {
      const { error } = await supabase
        .from('projects')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', projectId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast({
        title: "Project updated successfully",
      });
    },
    onError: (error) => {
      console.error('Failed to update project:', error);
      toast({
        title: "Error updating project",
        description: "Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: NewProjectFormData) => {
    createProjectMutation.mutate(data);
  };

  const handleProjectClick = (projectId: string) => {
    navigate(`/feasly-model?projectId=${projectId}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-50 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-300';
      case 'active': return 'bg-primary/10 text-primary border-primary/20 dark:bg-primary/20 dark:text-primary-light';
      case 'archived': return 'bg-destructive/10 text-destructive border-destructive/20 dark:bg-destructive/20 dark:text-destructive-foreground';
      default: return 'bg-gray-50 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const addSuggestedTag = (tag: string) => {
    const currentTags = form.getValues('tags');
    const tagsArray = currentTags ? currentTags.split(',').map(t => t.trim()).filter(Boolean) : [];
    
    if (!tagsArray.includes(tag)) {
      const newTags = [...tagsArray, tag].join(', ');
      form.setValue('tags', newTags);
    }
  };

  const removeSelectedTag = (tagToRemove: string) => {
    setSelectedTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  const TagBadge = ({ tag, onRemove }: { tag: string; onRemove?: () => void }) => {
    const displayTag = truncateText(tag, 16);
    const needsTooltip = tag.length > 16;
    
    const badge = (
      <Badge className="bg-blue-50 text-blue-800 text-xs px-2 py-1 rounded-md border border-blue-200 dark:bg-blue-900 dark:text-blue-300">
        {displayTag}
        {onRemove && (
          <X 
            className="ml-1 h-3 w-3 cursor-pointer hover:text-blue-600" 
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
          />
        )}
      </Badge>
    );

    if (needsTooltip) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>{badge}</TooltipTrigger>
            <TooltipContent>{tag}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return badge;
  };

  const ProjectCard = ({ project }: { project: Project }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    
    return (
      <Card 
        className="feasly-card cursor-pointer hover:shadow-lg transition-all duration-200"
        onClick={() => handleProjectClick(project.id)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg mb-2 flex items-center gap-2">
                {project.name}
                {project.is_pinned && (
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                )}
              </CardTitle>
              <Badge className={getStatusColor(project.status)}>
                {project.status}
              </Badge>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="sm">
                  •••
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePinMutation.mutate({ projectId: project.id, isPinned: project.is_pinned });
                  }}
                >
                  {project.is_pinned ? (
                    <>
                      <StarOff className="mr-2 h-4 w-4" />
                      Unpin
                    </>
                  ) : (
                    <>
                      <Star className="mr-2 h-4 w-4" />
                      Pin
                    </>
                  )}
                </DropdownMenuItem>
                {project.status === 'archived' ? (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      archiveMutation.mutate({ projectId: project.id, status: 'active' });
                    }}
                  >
                    <ArchiveRestore className="mr-2 h-4 w-4" />
                    Restore
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      archiveMutation.mutate({ projectId: project.id, status: 'archived' });
                    }}
                  >
                    <Archive className="mr-2 h-4 w-4" />
                    Archive
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-3">
            {/* AI Summary */}
            {project.project_ai_summary && (
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 p-3 rounded-lg border border-purple-200 dark:border-purple-800">
                <div className="flex items-start gap-2">
                  <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
                      <div className="text-sm text-purple-800 dark:text-purple-200">
                        {project.project_ai_summary.length > 100 && !isExpanded ? (
                          <>
                            {project.project_ai_summary.substring(0, 100)}...
                            <CollapsibleTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="p-0 h-auto text-purple-600 dark:text-purple-400 ml-1"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <ChevronDown className="h-3 w-3" />
                              </Button>
                            </CollapsibleTrigger>
                          </>
                        ) : (
                          <>
                            {project.project_ai_summary}
                            {project.project_ai_summary.length > 100 && (
                              <CollapsibleTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="p-0 h-auto text-purple-600 dark:text-purple-400 ml-1"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <ChevronUp className="h-3 w-3" />
                                </Button>
                              </CollapsibleTrigger>
                            )}
                          </>
                        )}
                      </div>
                    </Collapsible>
                  </div>
                </div>
              </div>
            )}

            {/* Description */}
            {project.description && (
              <CardDescription className="line-clamp-2">
                {project.description}
              </CardDescription>
            )}
            
            {/* Tags */}
            {project.tags && project.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag, index) => (
                  <TagBadge key={index} tag={tag} />
                ))}
              </div>
            )}
            
            {/* Date info */}
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="mr-1 h-4 w-4" />
              Updated {format(new Date(project.updated_at), 'MMM dd, yyyy')}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderTableView = () => (
    <div className="feasly-section">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead>Project Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProjects.map((project) => (
              <TableRow 
                key={project.id} 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleProjectClick(project.id)}
              >
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePinMutation.mutate({ projectId: project.id, isPinned: project.is_pinned });
                    }}
                  >
                    {project.is_pinned ? (
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ) : (
                      <StarOff className="h-4 w-4" />
                    )}
                  </Button>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{project.name}</div>
                    {project.project_ai_summary && (
                      <div className="text-sm text-purple-600 dark:text-purple-400 truncate max-w-md flex items-center gap-1">
                        <Sparkles className="h-3 w-3" />
                        {project.project_ai_summary}
                      </div>
                    )}
                    {project.description && (
                      <div className="text-sm text-muted-foreground truncate max-w-xs">
                        {project.description}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(project.status)}>
                    {project.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {project.tags?.slice(0, 2).map((tag, index) => (
                      <TagBadge key={index} tag={tag} />
                    ))}
                    {project.tags && project.tags.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{project.tags.length - 2}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm text-muted-foreground">
                    {format(new Date(project.created_at), 'MMM dd, yyyy')}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm text-muted-foreground">
                    {format(new Date(project.updated_at), 'MMM dd, yyyy')}
                  </div>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="sm">
                        •••
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {project.status === 'archived' ? (
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            archiveMutation.mutate({ projectId: project.id, status: 'active' });
                          }}
                        >
                          <ArchiveRestore className="mr-2 h-4 w-4" />
                          Restore
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            archiveMutation.mutate({ projectId: project.id, status: 'archived' });
                          }}
                        >
                          <Archive className="mr-2 h-4 w-4" />
                          Archive
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredProjects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );

  if (error) {
    return (
      <div className="feasly-container">
        <div className="feasly-section text-center">
          <p className="text-red-600 dark:text-red-400">Failed to load projects. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="feasly-container">
      {/* Header */}
      <div className="feasly-section">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="feasly-title">Projects</h1>
            <p className="text-muted-foreground">
              Manage all your Feasly models and financial analyses
            </p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                New Project
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
                <DialogDescription>
                  Create a new Feasly model project to start your financial analysis.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter project name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe your project..."
                            rows={3}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="archived">Archived</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="tags"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tags</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter tags separated by commas"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                        
                        {/* Smart tag suggestions */}
                        {suggestedTags.length > 0 && (
                          <div className="mt-2">
                            <p className="text-sm text-muted-foreground mb-2">Suggested tags:</p>
                            <div className="flex flex-wrap gap-1">
                              {suggestedTags.map((tag) => (
                                <Button
                                  key={tag}
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="h-6 text-xs"
                                  onClick={() => addSuggestedTag(tag)}
                                >
                                  + {tag}
                                </Button>
                              ))}
                            </div>
                          </div>
                        )}
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end gap-3 pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={createProjectMutation.isPending}
                    >
                      {createProjectMutation.isPending ? 'Creating...' : 'Create Project'}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="feasly-section">
        <div className="flex flex-col gap-4">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search projects by name, description, tags, or AI summary..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Status filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>

            {/* Tag filter */}
            {allTags.length > 0 && (
              <div className="flex-1">
                <div className="flex flex-wrap gap-2">
                  {selectedTags.map((tag) => (
                    <TagBadge 
                      key={tag} 
                      tag={tag} 
                      onRemove={() => removeSelectedTag(tag)} 
                    />
                  ))}
                  <Select 
                    value="" 
                    onValueChange={(value) => {
                      if (value && !selectedTags.includes(value)) {
                        setSelectedTags(prev => [...prev, value]);
                      }
                    }}
                  >
                    <SelectTrigger className="w-40">
                      <Tag className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Filter by tag" />
                    </SelectTrigger>
                    <SelectContent>
                      {allTags
                        .filter(tag => !selectedTags.includes(tag))
                        .map((tag) => (
                          <SelectItem key={tag} value={tag}>
                            {tag}
                          </SelectItem>
                        ))
                      }
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            
            {/* View mode toggle */}
            <div className="hidden sm:flex border rounded-md">
              <Button
                variant={viewMode === 'table' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('table')}
                className="rounded-r-none"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-l-none"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Projects List */}
      {isLoading ? (
        <div className="feasly-section text-center">
          <p className="text-muted-foreground">Loading projects...</p>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="feasly-section text-center py-12">
          <div className="max-w-md mx-auto">
            <h3 className="text-lg font-medium mb-2">No projects found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || statusFilter !== 'all' || selectedTags.length > 0
                ? 'Try adjusting your search or filters.' 
                : 'Get started by creating your first Feasly model project.'
              }
            </p>
            {!searchTerm && statusFilter === 'all' && selectedTags.length === 0 && (
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Project
              </Button>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Mobile always shows grid, desktop shows selected view */}
          <div className="sm:hidden">
            {renderGridView()}
          </div>
          <div className="hidden sm:block">
            {viewMode === 'table' ? renderTableView() : renderGridView()}
          </div>
        </>
      )}
    </div>
  );
}