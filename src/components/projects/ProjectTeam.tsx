import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Users, UserPlus, Mail, Trash2, Crown } from "lucide-react";

interface TeamMember {
  id: string;
  user_id: string;
  project_id: string;
  role: 'Owner' | 'Editor' | 'Viewer';
  created_at: string;
  profiles: {
    email: string;
    full_name?: string;
  };
}

interface ProjectTeamProps {
  projectId: string;
  projectOwnerId: string;
  userRole?: 'Owner' | 'Editor' | 'Viewer' | null;
}

export const ProjectTeam = ({ projectId, projectOwnerId, userRole }: ProjectTeamProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<'Editor' | 'Viewer'>('Viewer');
  const [isInviting, setIsInviting] = useState(false);

  const isOwner = userRole === 'Owner';

  // Fetch team members
  const { data: teamMembers, isLoading } = useQuery({
    queryKey: ["project-team", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_team")
        .select(`
          *,
          profiles!inner(email, full_name)
        `)
        .eq("project_id", projectId)
        .order("role", { ascending: true }); // Owner first

      if (error) throw error;
      return data as TeamMember[];
    },
    enabled: !!projectId,
  });

  const inviteUser = async () => {
    if (!inviteEmail.trim() || !isOwner) return;

    try {
      setIsInviting(true);

      // Look up user by email in auth.users via profiles table
      const { data: userProfile, error: userError } = await supabase
        .from("profiles")
        .select("id, email")
        .eq("email", inviteEmail.trim().toLowerCase())
        .single();

      if (userError || !userProfile) {
        toast({
          title: "User Not Found",
          description: "No user found with this email address.",
          variant: "destructive",
        });
        return;
      }

      // Check if user is already a team member
      const existingMember = teamMembers?.find(member => member.user_id === userProfile.id);
      if (existingMember) {
        toast({
          title: "User Already Added",
          description: "This user is already a member of the project team.",
          variant: "destructive",
        });
        return;
      }

      // Add to project team
      const { error: insertError } = await supabase
        .from("project_team")
        .insert({
          project_id: projectId,
          user_id: userProfile.id,
          role: inviteRole,
        });

      if (insertError) throw insertError;

      // Refresh team members
      await queryClient.invalidateQueries({ queryKey: ["project-team", projectId] });

      toast({
        title: "User Invited",
        description: `${inviteEmail} has been added to the project as ${inviteRole}.`,
      });

      // Reset form
      setInviteEmail("");
      setInviteRole('Viewer');
      setIsInviteDialogOpen(false);

    } catch (error) {
      console.error("Error inviting user:", error);
      toast({
        title: "Error",
        description: "Failed to invite user. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsInviting(false);
    }
  };

  const updateUserRole = async (memberId: string, newRole: 'Editor' | 'Viewer') => {
    if (!isOwner) return;

    try {
      const { error } = await supabase
        .from("project_team")
        .update({ role: newRole })
        .eq("id", memberId);

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ["project-team", projectId] });

      toast({
        title: "Role Updated",
        description: `User role has been updated to ${newRole}.`,
      });

    } catch (error) {
      console.error("Error updating role:", error);
      toast({
        title: "Error",
        description: "Failed to update user role. Please try again.",
        variant: "destructive",
      });
    }
  };

  const removeTeamMember = async (memberId: string, memberEmail: string) => {
    if (!isOwner) return;

    try {
      const { error } = await supabase
        .from("project_team")
        .delete()
        .eq("id", memberId);

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ["project-team", projectId] });

      toast({
        title: "Member Removed",
        description: `${memberEmail} has been removed from the project.`,
      });

    } catch (error) {
      console.error("Error removing team member:", error);
      toast({
        title: "Error",
        description: "Failed to remove team member. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'Owner':
        return 'default';
      case 'Editor':
        return 'secondary';
      case 'Viewer':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'Owner':
        return <Crown className="w-4 h-4" />;
      case 'Editor':
        return <Mail className="w-4 h-4" />;
      case 'Viewer':
        return <Users className="w-4 h-4" />;
      default:
        return <Users className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Team Members
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-muted rounded-full animate-pulse" />
                  <div className="space-y-1">
                    <div className="w-32 h-4 bg-muted rounded animate-pulse" />
                    <div className="w-20 h-3 bg-muted rounded animate-pulse" />
                  </div>
                </div>
                <div className="w-16 h-6 bg-muted rounded animate-pulse" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Team Members
        </CardTitle>
        {isOwner && (
          <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <UserPlus className="w-4 h-4 mr-2" />
                Invite Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite Team Member</DialogTitle>
                <DialogDescription>
                  Invite a user to collaborate on this project by entering their email address.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="user@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select value={inviteRole} onValueChange={(value: 'Editor' | 'Viewer') => setInviteRole(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Viewer">Viewer - Can view project data</SelectItem>
                      <SelectItem value="Editor">Editor - Can edit project data</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsInviteDialogOpen(false)}
                  disabled={isInviting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={inviteUser}
                  disabled={!inviteEmail.trim() || isInviting}
                >
                  {isInviting ? "Inviting..." : "Send Invite"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </CardHeader>
      <CardContent>
        {teamMembers && teamMembers.length > 0 ? (
          <div className="space-y-3">
            {teamMembers.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    {getRoleIcon(member.role)}
                  </div>
                  <div>
                    <p className="font-medium">{member.profiles.full_name || member.profiles.email}</p>
                    <p className="text-sm text-muted-foreground">{member.profiles.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {member.role === 'Owner' ? (
                    <Badge variant={getRoleBadgeVariant(member.role)}>
                      {member.role}
                    </Badge>
                  ) : (
                    <>
                      {isOwner ? (
                        <Select
                          value={member.role}
                          onValueChange={(newRole: 'Editor' | 'Viewer') => updateUserRole(member.id, newRole)}
                        >
                          <SelectTrigger className="w-28 h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Viewer">Viewer</SelectItem>
                            <SelectItem value="Editor">Editor</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge variant={getRoleBadgeVariant(member.role)}>
                          {member.role}
                        </Badge>
                      )}
                      {isOwner && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to remove {member.profiles.email} from this project? 
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => removeTeamMember(member.id, member.profiles.email)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Remove
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Team Members</h3>
            <p className="text-muted-foreground mb-4">
              {isOwner ? "Invite team members to collaborate on this project." : "No team members have been added yet."}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};