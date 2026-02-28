import React, { createContext, useContext, useEffect, useState } from 'react';
import { api, getApiErrorMessage, normalizeListResponse } from '@/lib/api';
import type {
  ApiListResponse,
  LoginResponseDTO,
  ProfileDTO,
  UserDTO,
} from '@/lib/api-types';

export type User = UserDTO;
export type Profile = ProfileDTO;

type AuthResult = { success: boolean; error?: string; profile?: Profile };
type RegisterMetadata = Record<string, unknown>;

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  register: (
    username: string,
    email: string,
    password: string,
    metadata?: RegisterMetadata
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  token: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const getPrimaryProfile = (profilesResponse: ApiListResponse<Profile>) => {
  const profiles = normalizeListResponse(profilesResponse);
  return profiles.length > 0 ? profiles[0] : null;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const profilesResponse = await api.get<ApiListResponse<Profile>>('/profiles/', token);
          const primaryProfile = getPrimaryProfile(profilesResponse);
          setProfile(primaryProfile);
          setUser(primaryProfile?.user ?? null);
        } catch (error: unknown) {
          console.error('Auth check failed', error);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [token]);

  const login = async (username: string, password: string): Promise<AuthResult> => {
    try {
      const data = await api.post<LoginResponseDTO, { username: string; password: string }>(
        '/login/',
        { username, password }
      );

      if (data.token) {
        localStorage.setItem('token', data.token);
        setToken(data.token);

        const profilesResponse = await api.get<ApiListResponse<Profile>>('/profiles/', data.token);
        const primaryProfile = getPrimaryProfile(profilesResponse);

        setProfile(primaryProfile);
        setUser(primaryProfile?.user ?? null);

        return primaryProfile ? { success: true, profile: primaryProfile } : { success: true };
      }

      return { success: false, error: 'No token received' };
    } catch (error: unknown) {
      return { success: false, error: getApiErrorMessage(error, 'Login failed') };
    }
  };

  const register = async (
    username: string,
    email: string,
    password: string,
    metadata: RegisterMetadata = {}
  ) => {
    try {
      await api.post<Profile, { username: string; email: string; password: string } & RegisterMetadata>(
        '/register/',
        { username, email, password, ...metadata }
      );
      return { success: true };
    } catch (error: unknown) {
      return { success: false, error: getApiErrorMessage(error, 'Registration failed') };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, register, logout, token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};
