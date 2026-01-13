import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { useAuth, type User } from "@/hooks/useAuth";
import { AddTeamMemberDialog } from "@/components/ui/AddTeamMemberDialog";
import { Users, Phone, Mail, MessageCircle } from "lucide-react";

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

  const handleAddTeamMember = (name: string, role: string) => {
    // Refresh the team members list
    fetchTeamMembers();
    toast({
      title: "Team member added",
      description: `${name} has been added to your team.`,
    });
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
                  <div className="flex items-start justify-between">
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
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

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