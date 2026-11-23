import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserProfile,
  UserRole,
  LoginCredentials,
  AdminLoginCredentials,
  FarmerRegistrationData,
  BuyerRegistrationData,
  AuthResponse,
} from '../types/auth';
import { authService } from '../services/authService';

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  adminLogin: (credentials: AdminLoginCredentials) => Promise<AuthResponse>;
  registerFarmer: (data: FarmerRegistrationData) => Promise<AuthResponse>;
  registerBuyer: (data: BuyerRegistrationData) => Promise<AuthResponse>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<AuthResponse>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Restore existing session on mount
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const session = await authService.getCurrentSession();
        if (session) {
          setUser(session);
        }
      } catch (e) {
        console.error('Failed to restore auth session:', e);
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      const res = await authService.login(credentials);
      if (res.success && res.user) {
        setUser(res.user);
      }
      return res;
    } finally {
      setIsLoading(false);
    }
  };

  const adminLogin = async (credentials: AdminLoginCredentials): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      const res = await authService.adminLogin(credentials);
      if (res.success && res.user) {
        setUser(res.user);
      }
      return res;
    } finally {
      setIsLoading(false);
    }
  };

  const registerFarmer = async (data: FarmerRegistrationData): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      const res = await authService.registerFarmer(data);
      if (res.success && res.user) {
        setUser(res.user);
      }
      return res;
    } finally {
      setIsLoading(false);
    }
  };

  const registerBuyer = async (data: BuyerRegistrationData): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      const res = await authService.registerBuyer(data);
      if (res.success && res.user) {
        setUser(res.user);
      }
      return res;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>): Promise<AuthResponse> => {
    if (!user) {
      return { success: false, message: 'No active session' };
    }
    setIsLoading(true);
    try {
      const res = await authService.updateProfile(user.id, updates);
      if (res.success && res.user) {
        setUser(res.user);
      }
      return res;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await authService.logout();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const requestPasswordReset = async (email: string): Promise<AuthResponse> => {
    return authService.requestPasswordReset(email);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user ? user.role : null,
        isAuthenticated: !!user,
        isLoading,
        login,
        adminLogin,
        registerFarmer,
        registerBuyer,
        updateProfile,
        logout,
        requestPasswordReset,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
