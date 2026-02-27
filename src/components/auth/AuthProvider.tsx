import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '@/lib/api';

export interface User {
  id: string;
  username: string;
  email: string;
}

export interface Profile {
  id: string;
  role: string;
  user?: User;
  full_name?: string | null;
  company_name?: string | null;
  plan_type?: string | null;
  [key: string]: unknown;
}

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

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
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
          const profiles = await api.get('/profiles/', token);
          if (Array.isArray(profiles) && profiles.length > 0) {
            const firstProfile = profiles[0] as Profile;
            setProfile(firstProfile);
            setUser((firstProfile.user as User | undefined) ?? null);
          }
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
      const data = await api.post('/login/', { username, password });
      if (data.token) {
        localStorage.setItem('token', data.token as string);
        setToken(data.token as string);

        const profiles = await api.get('/profiles/', data.token as string);
        if (Array.isArray(profiles) && profiles.length > 0) {
          const firstProfile = profiles[0] as Profile;
          setProfile(firstProfile);
          setUser((firstProfile.user as User | undefined) ?? null);
          return { success: true, profile: firstProfile };
        }

        return { success: true };
      }

      return { success: false, error: 'No token received' };
    } catch (error: unknown) {
      return { success: false, error: getErrorMessage(error, 'Login failed') };
    }
  };

  const register = async (
    username: string,
    email: string,
    password: string,
    metadata: RegisterMetadata = {}
  ) => {
    try {
      await api.post('/register/', { username, email, password, ...metadata });
      return { success: true };
    } catch (error: unknown) {
      return { success: false, error: getErrorMessage(error, 'Registration failed') };
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
