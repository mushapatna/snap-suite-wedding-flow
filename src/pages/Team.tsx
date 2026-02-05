import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DashboardHeader } from "@/components/Dashboard/DashboardHeader";
import { AddTeamMemberDialog } from "@/components/ui/AddTeamMemberDialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import {
  Users,
  Plus,
  MoreVertical,
  Send,
  Trash2,
  RefreshCw,
  Mail,
  Phone,
  MessageCircle
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

interface TeamMember {
  id: string;
  name: string;
  role: string;
  phone_number: string | null;
  whatsapp_number: string | null;
  email: string | null;
  status: string;
  created_at: string;
}

const Team = () => {
  const { user, token } = useAuth();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<TeamMember | null>(null);
  const [processingActions, setProcessingActions] = useState<Record<string, boolean>>({});
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (token) {
      fetchTeamMembers();
    }
  }, [token]);

  const fetchTeamMembers = async () => {
    try {
      const data = await api.get('/contacts/', token);
      const members = Array.isArray(data) ? data : (data.results || []);
      setTeamMembers(members);
    } catch (error) {
      console.error("Error fetching team members:", error);
      toast({
        title: "Error",
        description: "Failed to load team members",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddTeamMember = () => {
    fetchTeamMembers();
  };

  const handleResendInvitation = async (member: TeamMember) => {
    setProcessingActions(prev => ({ ...prev, [member.id]: true }));

    try {
      await api.post(`/contacts/${member.id}/resend_invitation/`, {}, token);

      toast({
        title: "Invitation Resent",
        description: `Invitation resent to ${member.name}`,
      });

      fetchTeamMembers();
    } catch (error: any) {
      console.error("Error resending invitation:", error);
      toast({
        title: "Failed to resend invitation",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    } finally {
      setProcessingActions(prev => ({ ...prev, [member.id]: false }));
    }
  };

  const handleDeleteMember = async () => {
    if (!memberToDelete) return;

    try {
      await api.delete(`/contacts/${memberToDelete.id}/`, token);
      toast({
        title: "Team member removed",
        description: `${memberToDelete.name} has been removed from your team`,
      });
      fetchTeamMembers();
    } catch (error) {
      console.error("Error deleting team member:", error);
      toast({
        title: "Error",
        description: "Failed to remove team member",
        variant: "destructive",
      });
    } finally {
      setProcessingActions(prev => ({ ...prev, [memberToDelete.id]: false }));
      setDeleteDialogOpen(false);
      setMemberToDelete(null);
    }



  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "sent":
        return "default";
      case "joined":
        return "secondary";
      case "failed":
        return "destructive";
      case "left":
        return "outline";
      default:
        return "outline";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "Pending";
      case "sent":
        return "Invitation Sent";
      case "joined":
        return "Joined";
      case "failed":
        return "Invitation Failed";
      case "left":
        return "Left Team";
      default:
        return "Unknown";
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role.toLowerCase()) {
      case "photographer":
        return "default";
      case "cinematographer":
        return "secondary";
      case "drone_operator":
        return "outline";
      case "site_manager":
        return "destructive";
      default:
        return "secondary";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader user={user} />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse text-center">Loading team members...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={user} />

      <div className="container mx-auto px-4 py-6 sm:py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col gap-4 mb-8 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-heading font-bold text-foreground mb-2 flex items-center justify-center sm:justify-start gap-2">
                <Users className="h-6 w-6 sm:h-8 sm:w-8" />
                Team Members
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Manage your wedding team and track invitation status.
              </p>
            </div>
            <Button
              onClick={() => setShowAddDialog(true)}
              className="gap-2 w-full sm:w-auto shadow-lg hover:shadow-xl transition-all duration-300"
              size="lg"
            >
              <Plus className="h-4 w-4" />
              Add Team Member
            </Button>
          </div>

          {teamMembers.length === 0 ? (
            <Card className="border-dashed border-2 shadow-lg">
              <CardContent className="p-6 sm:p-8 text-center">
                <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center mx-auto mb-4">
                  <Users className="h-10 w-10 sm:h-12 sm:w-12 text-primary" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2">No team members yet</h3>
                <p className="text-sm sm:text-base text-muted-foreground mb-6 max-w-md mx-auto">
                  Start building your wedding team by adding your first team member.
                </p>
                <Button
                  onClick={() => setShowAddDialog(true)}
                  className="gap-2 shadow-lg hover:shadow-xl transition-all duration-300"
                  size="lg"
                >
                  <Plus className="h-4 w-4" />
                  Add Team Member
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:gap-6">
              {teamMembers.map((member) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-card to-card/50">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center justify-between">
                            <button
                              onClick={() => navigate(`/team/${member.id}`)}
                              className="text-left hover:bg-accent/50 rounded-lg p-1 transition-colors flex-1"
                            >
                              <h3 className="text-lg font-semibold text-foreground hover:text-primary transition-colors cursor-pointer">{member.name}</h3>
                            </button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  disabled={processingActions[member.id]}
                                  className="h-8 w-8 p-0 hover:bg-primary/10"
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                {(member.status === 'pending' || member.status === 'failed') && (
                                  <DropdownMenuItem
                                    onClick={() => handleResendInvitation(member)}
                                    disabled={processingActions[member.id]}
                                    className="gap-2"
                                  >
                                    <RefreshCw className="h-4 w-4" />
                                    {member.status === 'pending' ? 'Send Invitation' : 'Resend Invitation'}
                                  </DropdownMenuItem>
                                )}
                                {member.status === 'sent' && (
                                  <DropdownMenuItem
                                    onClick={() => handleResendInvitation(member)}
                                    disabled={processingActions[member.id]}
                                    className="gap-2"
                                  >
                                    <Send className="h-4 w-4" />
                                    Resend Invitation
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem
                                  onClick={() => {
                                    setMemberToDelete(member);
                                    setDeleteDialogOpen(true);
                                  }}
                                  disabled={processingActions[member.id]}
                                  className="text-destructive gap-2 focus:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  Remove Member
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Badge
                              variant={getRoleBadgeVariant(member.role)}
                              className="text-xs font-medium px-2 py-1"
                            >
                              {member.role.charAt(0).toUpperCase() + member.role.slice(1).replace('_', ' ')}
                            </Badge>
                            <Badge
                              variant={getStatusBadgeVariant(member.status)}
                              className="text-xs font-medium px-2 py-1"
                            >
                              {getStatusLabel(member.status)}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        <div className="grid gap-3">
                          {member.email && (
                            <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                              <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                                <Mail className="h-4 w-4 text-primary" />
                              </div>
                              <span className="text-sm text-foreground font-medium truncate">{member.email}</span>
                            </div>
                          )}
                          {member.phone_number && (
                            <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                              <div className="flex-shrink-0 w-8 h-8 bg-secondary/10 rounded-full flex items-center justify-center">
                                <Phone className="h-4 w-4 text-secondary" />
                              </div>
                              <span className="text-sm text-foreground font-medium">{member.phone_number}</span>
                            </div>
                          )}
                          {member.whatsapp_number && (
                            <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                              <div className="flex-shrink-0 w-8 h-8 bg-green-500/10 rounded-full flex items-center justify-center">
                                <MessageCircle className="h-4 w-4 text-green-600" />
                              </div>
                              <span className="text-sm text-foreground font-medium">{member.whatsapp_number}</span>
                            </div>
                          )}
                        </div>
                        <div className="pt-2 border-t border-border/50">
                          <div className="text-xs text-muted-foreground flex items-center gap-2">
                            <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
                            Added on {new Date(member.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      <AddTeamMemberDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onTeamMemberAdded={handleAddTeamMember}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {memberToDelete?.name} from your team?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteMember}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={memberToDelete ? processingActions[memberToDelete.id] : false}
            >
              {memberToDelete && processingActions[memberToDelete.id] ? "Removing..." : "Remove Member"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Team;
