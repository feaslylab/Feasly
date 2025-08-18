import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { PATHS } from "@/routes/paths";
import { NewProjectModal } from "@/components/projects/NewProjectModal";
import { Plus, Search, Building2, Calendar, FolderOpen } from "lucide-react";

interface Project {
  id: string;
  name: string;
  description: string | null;
  status: string;
  created_at: string;
  currency_code: string;
  is_pinned: boolean;
}

export default function Projects() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "created">("created");
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('projects')
        .select('id, name, description, status, created_at, currency_code, is_pinned')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading projects",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProjectClick = (projectId: string) => {
    navigate(`${PATHS.model}?project=${projectId}&scenario=baseline`);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'active': { variant: 'default' as const, label: 'Active' },
      'completed': { variant: 'secondary' as const, label: 'Completed' },
      'draft': { variant: 'outline' as const, label: 'Draft' },
      'planning': { variant: 'outline' as const, label: 'Planning' },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || { variant: 'outline' as const, label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const filteredAndSortedProjects = projects
    .filter(project => 
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (project.description || "").toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      } else {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

  if (loading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        
        <div className="flex gap-4 mb-6">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>

        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Projects</h1>
        <p className="text-muted-foreground">
          Manage your modeling projects and scenarios
        </p>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={sortBy} onValueChange={(value: "name" | "created") => setSortBy(value)}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="created">Recently Created</SelectItem>
            <SelectItem value="name">Name A-Z</SelectItem>
          </SelectContent>
        </Select>

        <Button onClick={() => setShowNewProjectModal(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Project
        </Button>
      </div>

      {filteredAndSortedProjects.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <Building2 className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  {projects.length === 0 ? "Create your first project" : "No projects found"}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {projects.length === 0 
                    ? "Projects organize your scenarios, KPIs and alerts."
                    : "Try adjusting your search criteria."
                  }
                </p>
                {projects.length === 0 && (
                  <Button onClick={() => setShowNewProjectModal(true)} className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    New Project
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredAndSortedProjects.map((project) => (
            <Card 
              key={project.id} 
              className="cursor-pointer hover:bg-accent/50 transition-colors"
              onClick={() => handleProjectClick(project.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <FolderOpen className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <h3 className="font-semibold truncate">{project.name}</h3>
                      {project.is_pinned && (
                        <Badge variant="secondary" className="text-xs">Pinned</Badge>
                      )}
                    </div>
                    {project.description && (
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {project.description}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 flex-shrink-0 ml-4">
                    {getStatusBadge(project.status)}
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(project.created_at).toLocaleDateString()}
                      </div>
                      {project.currency_code && (
                        <div className="text-xs text-muted-foreground">
                          {project.currency_code}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <NewProjectModal 
        open={showNewProjectModal}
        onOpenChange={setShowNewProjectModal}
        onSuccess={fetchProjects}
      />
    </div>
  );
}