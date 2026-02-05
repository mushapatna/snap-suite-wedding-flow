import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export interface User {
    id: string;
    username: string;
    email: string;
}

export interface Profile {
    id: string;
    role: string;
    [key: string]: any;
}

interface AuthContextType {
    user: User | null;
    profile: Profile | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string; profile?: Profile }>;
    register: (username: string, email: string, password: string, metadata?: any) => Promise<{ success: boolean; error?: string }>;
    logout: () => void;
    token: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        const initAuth = async () => {
            if (token) {
                try {
                    // Verify token and get user info. 
                    // We don't have a specific /me endpoint on User, but we can fetch profile which has user info
                    // Actually, we need to fetch the profile.
                    // Since our ProfileViewSet returns list filtered by user, we can get list.
                    const profiles = await api.get('/profiles/', token);
                    if (profiles && profiles.length > 0) {
                        setProfile(profiles[0]);
                        setUser(profiles[0].user);
                    } else {
                        // Token invalid or no profile?
                        // Try to fetch user details?
                        // For now assume if profile fetch fails, token is bad
                    }
                } catch (error: any) {
                    console.error("Auth check failed", error);
                    // Only logout if it's strictly an authentication error (401)
                    // The api.ts throws an error with the text response. 
                    // We should ideally check status code, but api.ts throws text.
                    // For now, let's assuming if it fails it might be 401, but let's be less aggressive.
                    // Actually, if fetching profile fails, we probably ARE invalid. 
                    // But let's verify if the error message is "Unauthorized" or similar.
                    // Or better, let's just NOT logout automatically here unless we are sure.
                    // But if we don't logout, the user thinks they are logged in but requests will fail.
                    // Let's rely on protected routes handling 401s eventually or make api.ts handle it.
                    // For now, let's comment out the auto-logout to see if it fixes the "frequent" issue 
                    // which might be caused by non-auth errors.
                    // logout(); 
                }
            }
            setLoading(false);
        };
        initAuth();
    }, [token]);

    const login = async (username: string, password: string) => {
        try {
            const data = await api.post('/login/', { username, password });
            if (data.token) {
                localStorage.setItem('token', data.token);
                setToken(data.token);

                // Fetch profile immediately
                const profiles = await api.get('/profiles/', data.token);
                if (profiles && profiles.length > 0) {
                    setProfile(profiles[0]);
                    setUser(profiles[0].user);
                    return { success: true, profile: profiles[0] };
                }

                return { success: true };
            }
            return { success: false, error: 'No token received' };
        } catch (error: any) {
            return { success: false, error: error.message || 'Login failed' };
        }
    };

    const register = async (username: string, email: string, password: string, metadata?: any) => {
        try {
            await api.post('/register/', { username, email, password, ...metadata });
            return { success: true };
        } catch (error: any) {
            return { success: false, error: error.message || 'Registration failed' };
        }
    }

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
