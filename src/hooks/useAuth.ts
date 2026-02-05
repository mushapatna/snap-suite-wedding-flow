import { useAuthContext, type User, type Profile } from '@/components/auth/AuthProvider';
import { useNavigate } from 'react-router-dom';

export interface UserRole {
  role: 'studio_owner' | 'project_manager' | 'photographer' | 'cinematographer' | 'drone_operator' | 'assistant' | 'client' | 'photo_editor' | 'video_editor';
}

export type { User, Profile };

export const useAuth = () => {
  const { user, profile, loading, login, register, logout, token } = useAuthContext();
  const navigate = useNavigate();

  // Map profile.role to UserRole[]
  const userRoles: UserRole[] = [];
  if (profile?.role) {
    // Map legacy/backend 'admin' role to frontend 'studio_owner' role
    if (profile.role === 'admin') {
      userRoles.push({ role: 'studio_owner' });
    } else {
      userRoles.push({ role: profile.role as UserRole['role'] });
    }
  }

  // Consumbers expect 'user' object.


  const signIn = async (email: string, password: string) => {
    const result = await login(email, password); // Note: LoginView expects username/password usually? user/pass. 
    // My AuthProvider.login sends {username, password}. 
    // Current Login page sends {email, password}.
    // I should probably support email login on backend or change login call to send email as username if I use email as username.
    // Django default is username. I should probably adjust AuthProvider to expect username or handle email on backend.
    // For now, let's assume username=email or adjust Login page.
    return result;
  };

  const signUp = async (email: string, password: string, metadata?: any) => {
    // Map to register(username, email, password)
    // Map to register(username, email, password)
    const username = email; // Use email as username to ensure uniqueness and consistency
    return await register(username, email, password, metadata);
  };

  const signOut = async () => {
    logout();
    navigate('/');
  };

  const hasRole = (role: UserRole['role']) => {
    return userRoles.some(userRole => userRole.role === role);
  };

  const isStudioOwner = () => hasRole('studio_owner');
  const isProjectManager = () => hasRole('project_manager') || isStudioOwner();
  const isTeamMember = () => userRoles.length > 0 && !hasRole('client');
  const isClient = () => hasRole('client');
  const isPhotoEditor = () => hasRole('photo_editor');
  const isVideoEditor = () => hasRole('video_editor');

  const getDefaultPortal = (currentProfile?: any) => {
    // If a profile is strictly provided, use it to check roles. 
    // Otherwise fall back to the hook's state 'userRoles'

    // Helper to check role on provided profile
    const checkRole = (role: string) => {
      if (currentProfile) {
        return currentProfile.role === role;
      }
      return hasRole(role as UserRole['role']);
    };

    const isOwner = currentProfile ? (currentProfile.role === 'studio_owner' || currentProfile.role === 'admin') : isStudioOwner();
    const isClientRole = currentProfile ? currentProfile.role === 'client' : isClient();

    if (isClientRole) return '/client-portal';
    if (isOwner) return '/admin-dashboard';
    if (checkRole('photographer')) return '/photographer-dashboard';
    if (checkRole('cinematographer')) return '/cinematographer-dashboard';
    if (checkRole('photo_editor')) return '/photo-editor-dashboard';
    if (checkRole('video_editor')) return '/video-editor-dashboard';
    if (checkRole('drone_operator')) return '/drone-dashboard';

    // Team member check
    const isTeam = currentProfile ? (currentProfile.role && currentProfile.role !== 'client') : isTeamMember();
    if (isTeam) return '/dashboard';

    return '/dashboard';
  };

  return {
    user,
    session: null, // Legacy support
    userRoles,
    loading,
    signIn,
    signUp,
    signOut,
    hasRole,
    isStudioOwner,
    isProjectManager,
    isTeamMember,
    isClient,
    isPhotoEditor,
    isVideoEditor,
    getDefaultPortal,
    token,
    profile,
  };
};