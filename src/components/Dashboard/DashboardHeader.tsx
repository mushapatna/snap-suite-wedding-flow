import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth, type User } from "@/hooks/useAuth";

interface DashboardHeaderProps {
  user: User | null;
}

const getRoleDisplayName = (roles: any[]) => {
  if (!roles.length) return "User";
  const role = roles[0].role;
  return role.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
};

const getRoleNavigation = (roles: any[]) => {
  if (!roles.length) return [];

  const role = roles[0].role;
  const baseNav = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Tasks', path: '/tasks' }
  ];

  switch (role) {
    case 'studio_owner':
      return [
        { name: 'Admin Dashboard', path: '/admin-dashboard' },
        { name: 'Projects', path: '/projects' },
        { name: 'Tasks', path: '/tasks' },
        { name: 'Team', path: '/team' },
        { name: 'Settings', path: '/settings' }
      ];
    case 'project_manager':
      return [
        { name: 'Dashboard', path: '/dashboard' },
        { name: 'Projects', path: '/projects' },
        { name: 'Tasks', path: '/tasks' },
        { name: 'Team', path: '/team' },
        { name: 'Settings', path: '/settings' }
      ];
    case 'photographer':
      return [
        { name: 'Dashboard', path: '/photographer-dashboard' },
        { name: 'Tasks', path: '/tasks' },
        { name: 'Work History', path: '/work-history' },
        { name: 'Calendar', path: '/calendar' }
      ];
    case 'cinematographer':
      return [
        { name: 'Dashboard', path: '/cinematographer-dashboard' },
        { name: 'Tasks', path: '/tasks' },
        { name: 'Work History', path: '/work-history' },
        { name: 'Calendar', path: '/calendar' }
      ];
    case 'photo_editor':
      return [
        { name: 'Dashboard', path: '/photo-editor-dashboard' },
        { name: 'Tasks', path: '/tasks' },
        { name: 'Work History', path: '/work-history' }
      ];
    case 'video_editor':
      return [
        { name: 'Dashboard', path: '/video-editor-dashboard' },
        { name: 'Tasks', path: '/tasks' },
        { name: 'Work History', path: '/work-history' }
      ];
    case 'drone_operator':
      return [
        { name: 'Dashboard', path: '/drone-dashboard' },
        { name: 'Tasks', path: '/tasks' },
        { name: 'Work History', path: '/work-history' },
        { name: 'Calendar', path: '/calendar' }
      ];
    case 'client':
      return [
        { name: 'Portal', path: '/client-portal' },
        { name: 'Gallery', path: '/gallery' }
      ];
    default:
      return baseNav;
  }
};

export const DashboardHeader = ({ user }: DashboardHeaderProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { userRoles, signOut } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const navigationItems = getRoleNavigation(userRoles);
  const roleDisplayName = getRoleDisplayName(userRoles);

  const isActiveRoute = (path: string) => {
    return location.pathname === path;
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();

      toast({
        title: "Logged out successfully",
        description: "See you next time!",
      });
      // signOut handles state clear, maybe navigate if needed, but App router usually handles protected routes
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Error",
        description: "Failed to log out",
        variant: "destructive",
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  const getInitials = (email: string) => {
    return email.split('@')[0].slice(0, 2).toUpperCase();
  };

  return (
    <header className="border-b bg-card shadow-soft">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and App Name */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">S</span>
            </div>
            <h1 className="text-xl font-heading font-bold text-foreground">Snap-Suites</h1>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navigationItems.map((item) => (
              <Button
                key={item.path}
                variant="ghost"
                onClick={() => navigate(item.path)}
                className={`font-medium ${isActiveRoute(item.path) ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {item.name}
              </Button>
            ))}
          </nav>

          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {user?.email ? getInitials(user.email) : "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <div className="flex flex-col space-y-1 p-2">
                <p className="text-sm font-medium leading-none">{user?.email}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {roleDisplayName}
                </p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/settings')}>
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/settings')}>
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? "Logging out..." : "Log out"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};