import { useAuthContext, type User, type Profile } from '@/components/auth/AuthProvider';
import { useNavigate } from 'react-router-dom';

type AppRole =
  | 'studio_owner'
  | 'project_manager'
  | 'photographer'
  | 'cinematographer'
  | 'drone_operator'
  | 'assistant'
  | 'client'
  | 'photo_editor'
  | 'video_editor';

export interface UserRole {
  role: AppRole;
}

type SignupMetadata = Record<string, unknown>;

type PortalProfile = Pick<Profile, 'role'>;

export type { User, Profile };

const roleToAppRole = (role: string): AppRole | null => {
  if (role === 'admin') {
    return 'studio_owner';
  }

  const validRoles: AppRole[] = [
    'studio_owner',
    'project_manager',
    'photographer',
    'cinematographer',
    'drone_operator',
    'assistant',
    'client',
    'photo_editor',
    'video_editor',
  ];

  return validRoles.includes(role as AppRole) ? (role as AppRole) : null;
};

export const useAuth = () => {
  const { user, profile, loading, login, register, logout, token } = useAuthContext();
  const navigate = useNavigate();

  const userRoles: UserRole[] = [];
  if (profile?.role) {
    const mappedRole = roleToAppRole(profile.role);
    if (mappedRole) {
      userRoles.push({ role: mappedRole });
    }
  }

  const signIn = async (email: string, password: string) => {
    return login(email, password);
  };

  const signUp = async (email: string, password: string, metadata?: SignupMetadata) => {
    const username = email;
    return register(username, email, password, metadata);
  };

  const signOut = async () => {
    logout();
    navigate('/');
  };

  const hasRole = (role: AppRole) => userRoles.some((userRole) => userRole.role === role);

  const isStudioOwner = () => hasRole('studio_owner');
  const isProjectManager = () => hasRole('project_manager') || isStudioOwner();
  const isTeamMember = () => userRoles.length > 0 && !hasRole('client');
  const isClient = () => hasRole('client');
  const isPhotoEditor = () => hasRole('photo_editor');
  const isVideoEditor = () => hasRole('video_editor');

  const getDefaultPortal = (currentProfile?: PortalProfile) => {
    const effectiveRole = currentProfile?.role ?? profile?.role;
    const mappedRole = effectiveRole ? roleToAppRole(effectiveRole) : null;

    switch (mappedRole) {
      case 'client':
        return '/client-portal';
      case 'studio_owner':
        return '/admin-dashboard';
      case 'photographer':
        return '/photographer-dashboard';
      case 'cinematographer':
        return '/cinematographer-dashboard';
      case 'photo_editor':
        return '/photo-editor-dashboard';
      case 'video_editor':
        return '/video-editor-dashboard';
      case 'drone_operator':
        return '/drone-dashboard';
      default:
        return '/dashboard';
    }
  };

  return {
    user,
    session: null,
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
