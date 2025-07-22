import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from 'react-i18next';
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
  List
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
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { format } from 'date-fns';

const newProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  description: z.string().optional(),
  status: z.enum(['draft', 'active', 'archived']),
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
  created_at: string;
  updated_at: string;
}

export default function Projects() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<NewProjectFormData>({
    resolver: zodResolver(newProjectSchema),
    defaultValues: {
      name: '',
      description: '',
      status: 'draft',
      tags: '',
    },
  });

  // Fetch projects
  const { data: projects = [], isLoading, error } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Project[];
    },
  });

  // Create project mutation
  const createProjectMutation = useMutation({
    mutationFn: async (formData: NewProjectFormData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const tags = formData.tags 
        ? formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
        : [];

      const { data, error } = await supabase
        .from('projects')
        .insert({
          name: formData.name,
          description: formData.description || null,
          status: formData.status,
          tags,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Project created successfully');
      setIsDialogOpen(false);
      form.reset();
      // Navigate to the new project
      navigate(`/feasly-model?projectId=${data.id}`);
    },
    onError: (error) => {
      console.error('Failed to create project:', error);
      toast.error('Failed to create project');
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
      toast.error('Failed to update project');
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
      toast.success('Project updated successfully');
    },
    onError: (error) => {
      console.error('Failed to update project:', error);
      toast.error('Failed to update project');
    },
  });

  // Filter projects
  const filteredProjects = projects.filter(project => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm || 
                         project.name.toLowerCase().includes(searchLower) ||
                         project.description?.toLowerCase().includes(searchLower) ||
                         project.tags.some(tag => tag.toLowerCase().includes(searchLower));
    
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const onSubmit = (data: NewProjectFormData) => {
    createProjectMutation.mutate(data);
  };

  const handleProjectClick = (projectId: string) => {
    navigate(`/feasly-model?projectId=${projectId}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'active': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'archived': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
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
                    {project.tags.slice(0, 2).map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {project.tags.length > 2 && (
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
        <Card 
          key={project.id} 
          className="feasly-card cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => handleProjectClick(project.id)}
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg mb-1">{project.name}</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(project.status)}>
                    {project.status}
                  </Badge>
                  {project.is_pinned && (
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  )}
                </div>
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
            {project.description && (
              <CardDescription className="mt-2">
                {project.description}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {project.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {project.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      <Tag className="mr-1 h-3 w-3" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="mr-1 h-4 w-4" />
                Created {format(new Date(project.created_at), 'MMM dd, yyyy')}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  if (error) {
    return (
      <div className="feasly-container">
        <div className="feasly-section text-center">
          <p className="text-red-600">Failed to load projects. Please try again.</p>
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
            <DialogContent>
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
                            placeholder="Enter tags separated by commas (e.g., Mixed Use, Retail)"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
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
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search projects by name, description, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
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
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filters.' 
                : 'Get started by creating your first Feasly model project.'
              }
            </p>
            {!searchTerm && statusFilter === 'all' && (
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