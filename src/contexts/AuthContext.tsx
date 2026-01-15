import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, role: User['role']) => Promise<boolean>;
  logout: () => void;
  register: (name: string, email: string, password: string, vehicleNumber?: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Simulated user database
const mockUsers: Record<string, { password: string; user: User }> = {
  'traveller@nhms.gov': {
    password: 'password123',
    user: {
      id: '1',
      name: 'Rajesh Kumar',
      email: 'traveller@nhms.gov',
      role: 'traveller',
      vehicleNumber: 'MH-01-AB-1234',
    },
  },
  'admin@nhms.gov': {
    password: 'password123',
    user: {
      id: '2',
      name: 'Admin User',
      email: 'admin@nhms.gov',
      role: 'admin',
    },
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('nhms_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = useCallback(async (email: string, password: string, role: User['role']): Promise<boolean> => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    const mockUser = mockUsers[email];
    if (mockUser && mockUser.password === password && mockUser.user.role === role) {
      setUser(mockUser.user);
      localStorage.setItem('nhms_user', JSON.stringify(mockUser.user));
      return true;
    }

    // For demo purposes, allow any login with matching role
    const demoUser: User = {
      id: Date.now().toString(),
      name: email.split('@')[0],
      email,
      role,
      vehicleNumber: role === 'traveller' ? 'XX-00-YY-0000' : undefined,
    };
    setUser(demoUser);
    localStorage.setItem('nhms_user', JSON.stringify(demoUser));
    return true;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('nhms_user');
    localStorage.removeItem('nhms_chat_history');
  }, []);

  const register = useCallback(async (name: string, email: string, password: string, vehicleNumber?: string): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 800));

    const newUser: User = {
      id: Date.now().toString(),
      name,
      email,
      role: 'traveller',
      vehicleNumber,
    };

    setUser(newUser);
    localStorage.setItem('nhms_user', JSON.stringify(newUser));
    return true;
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
