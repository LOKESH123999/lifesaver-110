import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { type User, type AuthContextType } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<'DONOR' | 'HOSPITAL' | 'ADMIN' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing auth data on mount
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    const storedRole = localStorage.getItem('role');

    if (storedToken && storedUser && storedRole) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      setRole(storedRole as 'DONOR' | 'HOSPITAL' | 'ADMIN');
    }
    setLoading(false);
  }, []);

  const login = async (token: string, user: User) => {
    setToken(token);
    setUser(user);
    setRole(user.role);
    
    // Store in localStorage
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('role', user.role);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setRole(null);
    
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
  };

  const value: AuthContextType = {
    user,
    token,
    role,
    isAuthenticated: !!token && !!user,
    login,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
