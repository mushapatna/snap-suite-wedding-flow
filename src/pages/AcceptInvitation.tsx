import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';

interface InvitationData {
  id: string;
  email: string;
  role: string;
  invited_by: string;
  expires_at: string;
  status: string;
  inviter_name?: string;
}

export default function AcceptInvitation() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, signUp, signIn } = useAuth();

  const [invitation, setInvitation] = useState<InvitationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isExistingUser, setIsExistingUser] = useState(false);
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
    fullName: ''
  });

  useEffect(() => {
    if (token) {
      validateInvitation();
    }
  }, [token]);

  useEffect(() => {
    if (user && invitation) {
      handleExistingUserInvitation();
    }
  }, [user, invitation]);

  const validateInvitation = async () => {
    if (!token) {
      toast({
        title: "Invalid invitation",
        description: "No invitation token provided.",
        variant: "destructive",
      });
      navigate('/');
      return;
    }

    try {
      const data = await api.get(`/contacts/check_invitation/?token=${token}`);

      if (!data || !data.valid) {
        throw new Error("Invalid invitation");
      }

      setInvitation(data);
    } catch (error) {
      console.error('Error validating invitation:', error);
      toast({
        title: "Error",
        description: "Failed to validate invitation or it has expired.",
        variant: "destructive",
      });
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleExistingUserInvitation = async () => {
    // If user is logged in, just link them
    if (!user || !invitation) return;

    // We can call accept directly with the token?
    // The backend `accept_invitation` updates status to 'joined'.
    // It doesn't explicitly link user yet because TeamMemberContact doesn't have User FK.
    // Ideally we should link it. But for now, just marking as joined is the requirement.

    try {
      await api.post('/contacts/accept_invitation/', { token });
      toast({
        title: "Invitation accepted!",
        description: `You've been added as a ${invitation.role}.`,
      });
      navigate(`/dashboard`); // or welcome
    } catch (error) {
      console.error("Error accepting", error);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invitation) return;

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords don't match.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);

      // Register the user
      const result = await signUp(invitation.email, formData.password, {
        full_name: formData.fullName,
        role: invitation.role,
        invitation_token: token
      });

      if (result.success) {
        // Accept the invitation officially
        await api.post('/contacts/accept_invitation/', { token });

        toast({
          title: "Account created!",
          description: "Your invitation has been accepted.",
        });
        // signUp usually logs them in too or they need to login?
        // useAuth.signUp currently uses AuthProvider.register which hits /register/.
        // If we switched to dj-rest-auth calls, it might differ.
        // Assuming auto-login or redirect.
        navigate('/dashboard');
      } else {
        toast({ title: "Error", description: result.error || "Signup failed", variant: "destructive" });
      }
    } catch (error) {
      console.error('Error creating account:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invitation) return;

    try {
      setSubmitting(true);
      const result = await signIn(invitation.email, formData.password);

      if (result.success) {
        await api.post('/contacts/accept_invitation/', { token });
        toast({ title: "Success", description: "Invitation accepted" });
        navigate('/dashboard');
      } else {
        toast({ title: "Error", description: result.error || "Login failed", variant: "destructive" });
      }
    } catch (error) {
      console.error('Error signing in:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Invalid Invitation</CardTitle>
            <CardDescription>This invitation link is not valid.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Team Invitation</CardTitle>
          <CardDescription>
            You've been invited to join as a {invitation.role}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">Email:</p>
            <p className="font-medium">{invitation.email}</p>
            <p className="text-sm text-muted-foreground mt-2">Role:</p>
            <p className="font-medium capitalize">{invitation.role.replace('_', ' ')}</p>
          </div>

          <div className="flex gap-2">
            <Button
              variant={isExistingUser ? "default" : "outline"}
              onClick={() => setIsExistingUser(true)}
              className="flex-1"
            >
              I have an account
            </Button>
            <Button
              variant={!isExistingUser ? "default" : "outline"}
              onClick={() => setIsExistingUser(false)}
              className="flex-1"
            >
              Create account
            </Button>
          </div>

          <form onSubmit={isExistingUser ? handleSignIn : handleSignUp} className="space-y-4">
            {!isExistingUser && (
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                  required
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                required
              />
            </div>

            {!isExistingUser && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  required
                />
              </div>
            )}

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? (
                <Spinner size="sm" />
              ) : (
                isExistingUser ? "Sign In & Accept" : "Create Account & Accept"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}