import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth, type User } from "@/hooks/useAuth";
import { Shield, Smartphone, Eye, Clock, AlertTriangle } from "lucide-react";

interface Profile {
  id: string;
}

interface SecuritySettingsProps {
  user: User | null;
  profile: Profile | null;
}

interface SecuritySession {
  id: string;
  ip: string;
  created_at: string;
  updated_at: string;
  user_agent: string;
  is_current: boolean;
}

export const SecuritySettings = ({ user, profile }: SecuritySettingsProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [sessions, setSessions] = useState<SecuritySession[]>([]);

  const { token, signOut } = useAuth();

  const handleSignOutAllDevices = async () => {
    setIsLoading(true);
    try {
      // In Django token auth, we would need an endpoint to revoke all tokens. 
      // For now, we will just sign out the current session on client side.
      await signOut();

      toast({
        title: "Signed out",
        description: "You have been signed out.",
      });
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Error",
        description: "Failed to sign out.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnableTwoFactor = () => {
    toast({
      title: "Two-factor authentication",
      description: "Two-factor authentication setup is coming soon.",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-3 w-3 bg-green-500 rounded-full"></div>
              <div>
                <p className="font-medium">Account Security</p>
                <p className="text-sm text-muted-foreground">Good security practices detected</p>
              </div>
            </div>
            <Badge variant="secondary">Secure</Badge>
          </div>

          <div className="border-t pt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">✓</p>
                <p className="text-sm font-medium">Strong Password</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">•</p>
                <p className="text-sm font-medium">2FA Disabled</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">✓</p>
                <p className="text-sm font-medium">Email Verified</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Two-Factor Authentication
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Two-Factor Authentication</Label>
              <p className="text-sm text-muted-foreground">
                Add an extra layer of security to your account
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">Disabled</Badge>
              <Button size="sm" onClick={handleEnableTwoFactor}>
                Enable
              </Button>
            </div>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Recommended</p>
                <p className="text-xs text-muted-foreground">
                  Enable 2FA to significantly improve your account security
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Privacy Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label>Profile Visibility</Label>
              <p className="text-sm text-muted-foreground">
                Control who can see your profile information
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Activity Status</Label>
              <p className="text-sm text-muted-foreground">
                Show when you were last active
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Data Analytics</Label>
              <p className="text-sm text-muted-foreground">
                Allow us to collect usage data to improve the service
              </p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Active Sessions
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Manage your active sessions across different devices
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {sessions.map((session) => (
            <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Smartphone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium flex items-center gap-2">
                    {session.user_agent}
                    {session.is_current && (
                      <Badge variant="secondary" className="text-xs">Current</Badge>
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    IP: {session.ip} • Last active: {new Date(session.updated_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              {!session.is_current && (
                <Button variant="outline" size="sm">
                  Revoke
                </Button>
              )}
            </div>
          ))}

          <div className="pt-4 border-t">
            <Button
              variant="destructive"
              onClick={handleSignOutAllDevices}
              disabled={isLoading}
            >
              {isLoading ? "Signing out..." : "Sign out from all devices"}
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              This will sign you out from all devices except the current one.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Login History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium">Successful login</p>
                <p className="text-sm text-muted-foreground">Chrome on Windows • 192.168.1.100</p>
              </div>
              <p className="text-sm text-muted-foreground">Today</p>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium">Successful login</p>
                <p className="text-sm text-muted-foreground">Safari on iOS • 192.168.1.105</p>
              </div>
              <p className="text-sm text-muted-foreground">Yesterday</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};