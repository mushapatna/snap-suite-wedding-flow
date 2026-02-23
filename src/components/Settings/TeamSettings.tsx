import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { useAuth, type User } from "@/hooks/useAuth";
import { AddTeamMemberDialog } from "@/components/ui/AddTeamMemberDialog";
import { Users, Phone, Mail, MessageCircle, Trash2, KeyRound, Copy, Check } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Profile {
  id: string;
}

interface TeamSettingsProps {
  user: User | null;
  profile: Profile | null;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  phone_number: string | null;
  whatsapp_number: string | null;
  email: string | null;
  created_at: string;
}

export const TeamSettings = ({ user, profile }: TeamSettingsProps) => {
  const { toast } = useToast();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Delete State
  const [memberToDelete, setMemberToDelete] = useState<TeamMember | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Reset Password State
  const [memberToReset, setMemberToReset] = useState<TeamMember | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [newPassword, setNewPassword] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const { token } = useAuth();

  useEffect(() => {
    if (token) {
      fetchTeamMembers();
    }
  }, [token]);

  const fetchTeamMembers = async () => {
    if (!token) return;
    try {
      setIsLoading(true);
      const data = await api.get("/contacts/", token);
      setTeamMembers(data?.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) || []);
    } catch (error) {
      console.error("Error fetching team members:", error);
      toast({
        title: "Error",
        description: "Failed to load team members.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTeamMember = async () => {
    if (!memberToDelete || !token) return;

    try {
      setIsDeleting(true);
      await api.delete(`/contacts/${memberToDelete.id}/`, token);

      toast({
        title: "Team member removed",
        description: `${memberToDelete.name} has been removed from your team.`,
      });

      fetchTeamMembers();
      setMemberToDelete(null);
    } catch (error: any) {
      console.error("Error deleting member:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to remove team member.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleResetPassword = async () => {
    if (!memberToReset || !token) return;

    try {
      setIsResetting(true);
      const response = await api.post(`/contacts/${memberToReset.id}/reset_password/`, {}, token);

      setNewPassword(response.password);
      // Don't close memberToReset yet, we need it to show the success dialog

      toast({
        title: "Password Reset",
        description: "New password generated successfully.",
      });
    } catch (error: any) {
      console.error("Error resetting password:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to reset password.",
        variant: "destructive",
      });
      setMemberToReset(null); // Close on error
    } finally {
      setIsResetting(false);
    }
  };

  const copyToClipboard = () => {
    if (newPassword) {
      navigator.clipboard.writeText(newPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Copied",
        description: "Password copied to clipboard",
      });
    }
  };

  const closeResetDialog = () => {
    setMemberToReset(null);
    setNewPassword(null);
    setCopied(false);
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role.toLowerCase()) {
      case "photographer":
        return "default";
      case "videographer":
        return "secondary";
      case "drone_operator":
        return "outline";
      case "site_manager":
        return "destructive";
      default:
        return "secondary";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse text-center">Loading team members...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Team Members
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your team contacts and their roles.
            </p>
          </div>
          <AddTeamMemberDialog
            open={false}
            onOpenChange={() => { }}
            onTeamMemberAdded={fetchTeamMembers}
          />
        </CardHeader>
        <CardContent>
          {teamMembers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No team members added yet.</p>
              <p className="text-sm text-muted-foreground">
                Add team members to start collaborating on projects.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {teamMembers.map((member) => (
                <div
                  key={member.id}
                  className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h4 className="font-medium">{member.name}</h4>
                        <Badge variant={getRoleBadgeVariant(member.role)}>
                          {member.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        {member.phone_number && (
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {member.phone_number}
                          </div>
                        )}
                        {member.email && (
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {member.email}
                          </div>
                        )}
                        {member.whatsapp_number && (
                          <div className="flex items-center gap-1">
                            <MessageCircle className="h-3 w-3" />
                            WhatsApp: {member.whatsapp_number}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        title="Reset Password"
                        onClick={() => setMemberToReset(member)}
                      >
                        <KeyRound className="h-4 w-4 mr-2" />
                        Reset Pwd
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        title="Delete Member"
                        onClick={() => setMemberToDelete(member)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!memberToDelete} onOpenChange={(open) => !open && setMemberToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove <b>{memberToDelete?.name}</b> from your team. This action cannot be undone.
              They will lose access to all assigned projects immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDeleteTeamMember();
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? "Removing..." : "Remove Member"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reset Password Confirmation / Result Dialog */}
      <Dialog open={!!memberToReset} onOpenChange={(open) => !open && closeResetDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {newPassword ? "Password Reset Successful" : "Reset Password"}
            </DialogTitle>
            <DialogDescription>
              {newPassword
                ? `A new password has been generated for ${memberToReset?.name}.`
                : `Are you sure you want to reset the password for ${memberToReset?.name}? This will invalidate their current password.`}
            </DialogDescription>
          </DialogHeader>

          {!newPassword ? (
            <DialogFooter>
              <Button variant="outline" onClick={closeResetDialog} disabled={isResetting}>Cancel</Button>
              <Button onClick={handleResetPassword} disabled={isResetting}>
                {isResetting ? "Resetting..." : "Confirm Reset"}
              </Button>
            </DialogFooter>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>New Password</Label>
                <div className="flex items-center space-x-2">
                  <Input value={newPassword} readOnly />
                  <Button size="icon" onClick={copyToClipboard}>
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground bg-yellow-50 text-yellow-800 p-2 rounded border border-yellow-200 mt-2">
                  ⚠️ Copy this password now. It will not be shown again.
                </p>
              </div>
              <DialogFooter>
                <Button onClick={closeResetDialog} className="w-full">Done</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>Team Permissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Role Permissions</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Photographer</span>
                  <span className="text-muted-foreground">View & edit assigned events</span>
                </div>
                <div className="flex justify-between">
                  <span>Videographer</span>
                  <span className="text-muted-foreground">View & edit assigned events</span>
                </div>
                <div className="flex justify-between">
                  <span>Drone Operator</span>
                  <span className="text-muted-foreground">View assigned events</span>
                </div>
                <div className="flex justify-between">
                  <span>Site Manager</span>
                  <span className="text-muted-foreground">Full project access</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};