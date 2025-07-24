import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/OrganizationContext';
import { Mail, Clock, X, RotateCcw } from 'lucide-react';

interface PendingInvitation {
  id: string;
  email: string;
  role: string;
  invited_at: string;
  expires_at: string;
  status: string;
}

export const PendingInvitations: React.FC = () => {
  const { currentOrganization } = useOrganization();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: invitations, isLoading } = useQuery({
    queryKey: ['organization-invitations', currentOrganization?.id],
    queryFn: async () => {
      if (!currentOrganization) return [];
      
      const { data, error } = await supabase
        .from('organization_invitations' as any)
        .select('id, email, role, invited_at, expires_at, status')
        .eq('organization_id', currentOrganization.id)
        .eq('status', 'pending')
        .order('invited_at', { ascending: false });

      if (error) throw error;
      return (data as any) as PendingInvitation[];
    },
    enabled: !!currentOrganization
  });

  const cancelInvitationMutation = useMutation({
    mutationFn: async (invitationId: string) => {
      const { error } = await supabase
        .from('organization_invitations' as any)
        .update({ status: 'cancelled' })
        .eq('id', invitationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization-invitations'] });
      toast({
        title: "Invitation Cancelled",
        description: "The invitation has been cancelled.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to cancel invitation.",
        variant: "destructive"
      });
    }
  });

  const resendInvitationMutation = useMutation({
    mutationFn: async (invitationId: string) => {
      // For now, just update the expires_at date
      const newExpiryDate = new Date();
      newExpiryDate.setDate(newExpiryDate.getDate() + 7);
      
      const { error } = await supabase
        .from('organization_invitations' as any)
        .update({ expires_at: newExpiryDate.toISOString() })
        .eq('id', invitationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization-invitations'] });
      toast({
        title: "Invitation Renewed",
        description: "The invitation has been renewed for 7 more days.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to resend invitation.",
        variant: "destructive"
      });
    }
  });

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Pending Invitations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 border rounded-lg animate-pulse">
                <div className="space-y-2">
                  <div className="w-48 h-4 bg-muted rounded"></div>
                  <div className="w-32 h-3 bg-muted rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="w-5 h-5" />
          Pending Invitations ({invitations?.length || 0})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!invitations || invitations.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Mail className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
            <p>No pending invitations</p>
          </div>
        ) : (
          <div className="space-y-4">
            {invitations.map((invitation) => {
              const expired = isExpired(invitation.expires_at);
              
              return (
                <div key={invitation.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <p className="font-medium">{invitation.email}</p>
                      <Badge variant="outline">{invitation.role}</Badge>
                      {expired && (
                        <Badge variant="destructive" className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Expired
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Invited {new Date(invitation.invited_at).toLocaleDateString()}
                      {!expired && (
                        <span> • Expires {new Date(invitation.expires_at).toLocaleDateString()}</span>
                      )}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => resendInvitationMutation.mutate(invitation.id)}
                      disabled={resendInvitationMutation.isPending}
                    >
                      <RotateCcw className="w-4 h-4 mr-1" />
                      {expired ? 'Renew' : 'Resend'}
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <X className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Cancel Invitation</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to cancel the invitation for {invitation.email}? 
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => cancelInvitationMutation.mutate(invitation.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Cancel Invitation
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};