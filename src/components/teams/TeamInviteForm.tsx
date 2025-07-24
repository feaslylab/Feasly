import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/OrganizationContext';
import { UserPlus } from 'lucide-react';

interface TeamInviteFormProps {
  onInviteSuccess?: () => void;
}

type InviteRole = 'Admin' | 'Editor' | 'Viewer' | 'Guest';

export const TeamInviteForm: React.FC<TeamInviteFormProps> = ({
  onInviteSuccess
}) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<InviteRole>('Viewer');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const { currentOrganization } = useOrganization();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentOrganization) {
      toast({
        title: "Error",
        description: "No organization selected",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // Check if user already exists in the organization
      const { data: existingMember } = await supabase
        .from('organization_members' as any)
        .select('id')
        .eq('organization_id', currentOrganization.id)
        .eq('email', email.toLowerCase())
        .single();

      if (existingMember) {
        toast({
          title: "Error",
          description: "User is already a member of this organization",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }

      // Check if invitation already exists
      const { data: existingInvite } = await supabase
        .from('organization_invitations' as any)
        .select('id')
        .eq('organization_id', currentOrganization.id)
        .eq('email', email.toLowerCase())
        .eq('status', 'pending')
        .single();

      if (existingInvite) {
        toast({
          title: "Error",
          description: "An invitation is already pending for this email",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }

      // Create invitation
      const { error } = await supabase
        .from('organization_invitations' as any)
        .insert({
          organization_id: currentOrganization.id,
          email: email.toLowerCase(),
          role: role,
          invited_by: (await supabase.auth.getUser()).data.user?.id
        });

      if (error) throw error;

      toast({
        title: "Invitation Sent",
        description: `Invitation sent to ${email}. They will receive an email with instructions to join.`,
      });

      // Reset form
      setEmail('');
      setRole('Viewer');
      setIsOpen(false);
      onInviteSuccess?.();

    } catch (error: any) {
      console.error('Error sending invitation:', error);
      toast({
        title: "Error",
        description: "Failed to send invitation. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="w-4 h-4 mr-2" />
          Invite Member
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite Team Member</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="role">Role</Label>
            <Select value={role} onValueChange={(value: InviteRole) => setRole(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Admin">Admin - Full access</SelectItem>
                <SelectItem value="Editor">Editor - Can edit projects</SelectItem>
                <SelectItem value="Viewer">Viewer - Read-only access</SelectItem>
                <SelectItem value="Guest">Guest - Limited access</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Sending...' : 'Send Invitation'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};