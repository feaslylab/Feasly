import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { toast } from 'sonner';

interface Organization {
  id: string;
  name: string;
  slug: string | null;
  created_by_user_id: string | null;
  created_at: string;
  updated_at: string;
}

interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: 'admin' | 'member' | 'viewer';
  created_at: string;
  updated_at: string;
  organization?: Organization;
}

interface OrganizationContextType {
  currentOrganization: Organization | null;
  organizations: Organization[];
  userRole: string | null;
  loading: boolean;
  switchOrganization: (orgId: string) => void;
  createOrganization: (name: string, slug?: string) => Promise<Organization | null>;
  updateOrganization: (orgId: string, updates: Partial<Organization>) => Promise<void>;
  refreshOrganizations: () => Promise<void>;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

interface OrganizationProviderProps {
  children: ReactNode;
}

export const OrganizationProvider = ({ children }: OrganizationProviderProps) => {
  const { user } = useAuth();
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load organizations when user changes
  useEffect(() => {
    if (user) {
      loadUserOrganizations();
    } else {
      setCurrentOrganization(null);
      setOrganizations([]);
      setUserRole(null);
      setLoading(false);
    }
  }, [user]);

  // Load saved organization preference from localStorage
  useEffect(() => {
    if (organizations.length > 0) {
      const savedOrgId = localStorage.getItem('feasly_current_org_id');
      if (savedOrgId) {
        const savedOrg = organizations.find(org => org.id === savedOrgId);
        if (savedOrg) {
          setCurrentOrganization(savedOrg);
          loadUserRole(savedOrgId);
          return;
        }
      }
      
      // Default to first organization if no saved preference
      if (organizations[0]) {
        setCurrentOrganization(organizations[0]);
        loadUserRole(organizations[0].id);
        localStorage.setItem('feasly_current_org_id', organizations[0].id);
      }
    }
  }, [organizations]);

  const loadUserOrganizations = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data: memberships, error } = await supabase
        .from('organization_members')
        .select(`
          *,
          organization:organizations(*)
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      const userOrgs = memberships?.map(m => m.organization).filter(Boolean) as Organization[] || [];
      setOrganizations(userOrgs);
    } catch (error) {
      console.error('Error loading organizations:', error);
      toast.error('Failed to load organizations');
    } finally {
      setLoading(false);
    }
  };

  const loadUserRole = async (orgId: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('organization_members')
        .select('role')
        .eq('organization_id', orgId)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setUserRole(data?.role || null);
    } catch (error) {
      console.error('Error loading user role:', error);
      setUserRole(null);
    }
  };

  const switchOrganization = (orgId: string) => {
    const org = organizations.find(o => o.id === orgId);
    if (org) {
      setCurrentOrganization(org);
      loadUserRole(orgId);
      localStorage.setItem('feasly_current_org_id', orgId);
      toast.success(`Switched to ${org.name}`);
    }
  };

  const createOrganization = async (name: string, slug?: string): Promise<Organization | null> => {
    if (!user) return null;

    try {
      // Create organization
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name,
          slug: slug || null,
          created_by_user_id: user.id
        })
        .select()
        .single();

      if (orgError) throw orgError;

      // Add current user as admin
      const { error: memberError } = await supabase
        .from('organization_members')
        .insert({
          organization_id: orgData.id,
          user_id: user.id,
          role: 'admin'
        });

      if (memberError) throw memberError;

      // Refresh organizations list
      await refreshOrganizations();
      
      // Switch to new organization
      switchOrganization(orgData.id);
      
      toast.success(`Created organization: ${name}`);
      return orgData;
    } catch (error) {
      console.error('Error creating organization:', error);
      toast.error('Failed to create organization');
      return null;
    }
  };

  const updateOrganization = async (orgId: string, updates: Partial<Organization>) => {
    try {
      const { error } = await supabase
        .from('organizations')
        .update(updates)
        .eq('id', orgId);

      if (error) throw error;

      // Update local state
      setOrganizations(prev => 
        prev.map(org => org.id === orgId ? { ...org, ...updates } : org)
      );

      if (currentOrganization?.id === orgId) {
        setCurrentOrganization(prev => prev ? { ...prev, ...updates } : null);
      }

      toast.success('Organization updated successfully');
    } catch (error) {
      console.error('Error updating organization:', error);
      toast.error('Failed to update organization');
    }
  };

  const refreshOrganizations = async () => {
    await loadUserOrganizations();
  };

  return (
    <OrganizationContext.Provider
      value={{
        currentOrganization,
        organizations,
        userRole,
        loading,
        switchOrganization,
        createOrganization,
        updateOrganization,
        refreshOrganizations,
      }}
    >
      {children}
    </OrganizationContext.Provider>
  );
};

export const useOrganization = () => {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error('useOrganization must be used within an OrganizationProvider');
  }
  return context;
};

// Convenience hook for easier usage
export const useOrg = useOrganization;