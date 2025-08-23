/**
 * Child Project Manager - Add, edit, and remove child projects in consolidation mode
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Trash2, Building2, Calendar } from "lucide-react";
import { useConsolidation } from "@/hooks/useConsolidation";

interface ChildProjectManagerProps {
  parentProjectId: string;
}

export function ChildProjectManager({ parentProjectId }: ChildProjectManagerProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newProjectData, setNewProjectData] = useState({
    name: '',
    description: '',
    start_date: '',
    end_date: ''
  });

  const {
    childProjects,
    addChildProject,
    removeChildProject,
    isAddingChild,
    isRemovingChild
  } = useConsolidation({ projectId: parentProjectId });

  const handleAddProject = () => {
    if (!newProjectData.name.trim()) return;
    
    addChildProject(newProjectData);
    setNewProjectData({ name: '', description: '', start_date: '', end_date: '' });
    setIsAddDialogOpen(false);
  };

  const handleRemoveProject = (projectId: string) => {
    removeChildProject(projectId);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Building2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle>Child Projects</CardTitle>
            <p className="text-sm text-muted-foreground">
              Manage projects in this consolidation
            </p>
          </div>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Project
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Child Project</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Project Name *</Label>
                <Input
                  id="name"
                  value={newProjectData.name}
                  onChange={(e) => setNewProjectData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter project name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newProjectData.description}
                  onChange={(e) => setNewProjectData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief project description"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Start Date</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={newProjectData.start_date}
                    onChange={(e) => setNewProjectData(prev => ({ ...prev, start_date: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_date">End Date</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={newProjectData.end_date}
                    onChange={(e) => setNewProjectData(prev => ({ ...prev, end_date: e.target.value }))}
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddProject} disabled={isAddingChild || !newProjectData.name.trim()}>
                {isAddingChild ? 'Adding...' : 'Add Project'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      
      <CardContent>
        {childProjects.length === 0 ? (
          <div className="text-center py-8">
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">No child projects yet</p>
            <p className="text-sm text-muted-foreground">
              Add projects to start building your consolidated model
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {childProjects.map((project) => (
              <div key={project.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-muted rounded">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-medium">{project.name}</h4>
                    {project.description && (
                      <p className="text-sm text-muted-foreground">{project.description}</p>
                    )}
                    {(project.start_date || project.end_date) && (
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {project.start_date && new Date(project.start_date).toLocaleDateString()}
                          {project.start_date && project.end_date && ' - '}
                          {project.end_date && new Date(project.end_date).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Child Project</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{project.name}"? This action cannot be undone.
                        All project data will be permanently removed.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleRemoveProject(project.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        disabled={isRemovingChild}
                      >
                        {isRemovingChild ? 'Deleting...' : 'Delete'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}