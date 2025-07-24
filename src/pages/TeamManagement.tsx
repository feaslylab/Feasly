import React from 'react';
import { TeamInviteForm } from '@/components/teams/TeamInviteForm';
import { TeamMembersList } from '@/components/teams/TeamMembersList';
import { PendingInvitations } from '@/components/teams/PendingInvitations';
import { useOrganization } from '@/contexts/OrganizationContext';
import { Users } from 'lucide-react';

export default function TeamManagement() {
  const { currentOrganization, userRole } = useOrganization();

  if (!currentOrganization) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Team Management</h1>
          <p className="text-muted-foreground">Please select an organization to manage your team.</p>
        </div>
      </div>
    );
  }

  const canInviteMembers = userRole === 'Admin' || userRole === 'Editor';

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="w-8 h-8" />
            Team Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage team members and invitations for {currentOrganization.name}
          </p>
        </div>
        
        {canInviteMembers && (
          <TeamInviteForm 
            onInviteSuccess={() => {
              // Refresh will happen automatically via react-query
            }}
          />
        )}
      </div>

      <div className="grid gap-8">
        <TeamMembersList />
        
        {canInviteMembers && <PendingInvitations />}
      </div>
    </div>
  );
}