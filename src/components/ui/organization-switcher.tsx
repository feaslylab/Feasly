import React, { useState } from 'react';
import { ChevronDown, Plus, Building, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useOrganization } from '@/contexts/OrganizationContext';
import { Skeleton } from '@/components/ui/skeleton';

export const OrganizationSwitcher = () => {
  const { 
    currentOrganization, 
    organizations, 
    loading, 
    switchOrganization, 
    createOrganization 
  } = useOrganization();
  
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  const [newOrgSlug, setNewOrgSlug] = useState('');
  const [creating, setCreating] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center space-x-2">
        <Skeleton className="h-8 w-8 rounded" />
        <Skeleton className="h-4 w-32" />
      </div>
    );
  }

  const handleCreateOrganization = async () => {
    if (!newOrgName.trim()) return;

    setCreating(true);
    try {
      await createOrganization(newOrgName.trim(), newOrgSlug.trim() || undefined);
      setNewOrgName('');
      setNewOrgSlug('');
      setShowCreateDialog(false);
    } finally {
      setCreating(false);
    }
  };

  // Generate slug suggestion from name
  const handleNameChange = (value: string) => {
    setNewOrgName(value);
    if (!newOrgSlug && value) {
      const suggestedSlug = value
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/^-+|-+$/g, '');
      setNewOrgSlug(suggestedSlug);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full justify-between">
            <div className="flex items-center space-x-2 min-w-0">
              <Building className="h-4 w-4 flex-shrink-0" />
              <span className="truncate text-sm">
                {currentOrganization?.name || 'Select Organization'}
              </span>
            </div>
            <ChevronDown className="h-4 w-4 flex-shrink-0" />
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent className="w-64" align="start">
          <DropdownMenuLabel>Organizations</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {organizations.map((org) => (
            <DropdownMenuItem
              key={org.id}
              onClick={() => switchOrganization(org.id)}
              className="flex items-center justify-between"
            >
              <div className="flex items-center space-x-2 min-w-0">
                <Building className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{org.name}</span>
              </div>
              {currentOrganization?.id === org.id && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </DropdownMenuItem>
          ))}
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Organization
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Organization</DialogTitle>
            <DialogDescription>
              Create a new organization to manage projects and team members.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="org-name">Organization Name</Label>
              <Input
                id="org-name"
                placeholder="Acme Corporation"
                value={newOrgName}
                onChange={(e) => handleNameChange(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="org-slug">
                Slug (optional)
                <span className="text-sm text-muted-foreground ml-1">
                  - Used in URLs
                </span>
              </Label>
              <Input
                id="org-slug"
                placeholder="acme-corp"
                value={newOrgSlug}
                onChange={(e) => setNewOrgSlug(e.target.value)}
              />
              {newOrgSlug && (
                <p className="text-xs text-muted-foreground">
                  URL: /org/{newOrgSlug}
                </p>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateDialog(false)}
              disabled={creating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateOrganization}
              disabled={!newOrgName.trim() || creating}
            >
              {creating ? 'Creating...' : 'Create Organization'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};