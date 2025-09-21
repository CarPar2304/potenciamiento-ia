import React, { createContext, useContext, useState, ReactNode } from 'react';

export type UserRole = 'admin' | 'ejecutivo_ccc' | 'camara_aliada';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  chamber?: string; // For camara_aliada users
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  switchRole: (role: UserRole) => void; // For demo purposes
}

const AuthContext = createContext<AuthContextType | null>(null);

// Mock users for demo
const mockUsers: Record<UserRole, User> = {
  admin: {
    id: '1',
    name: 'María González',
    email: 'maria.gonzalez@ccc.org.co',
    role: 'admin',
  },
  ejecutivo_ccc: {
    id: '2',
    name: 'Carlos Rodríguez',
    email: 'carlos.rodriguez@ccc.org.co',
    role: 'ejecutivo_ccc',
  },
  camara_aliada: {
    id: '3',
    name: 'Ana Martínez',
    email: 'ana.martinez@camarapopayan.org.co',
    role: 'camara_aliada',
    chamber: 'Cámara de Comercio de Popayán',
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(mockUsers.admin); // Start as admin for demo

  const login = async (email: string, password: string) => {
    // Mock login - in real app, this would call your auth API
    const foundUser = Object.values(mockUsers).find(u => u.email === email);
    if (foundUser) {
      setUser(foundUser);
    } else {
      throw new Error('Invalid credentials');
    }
  };

  const logout = () => {
    setUser(null);
  };

  const switchRole = (role: UserRole) => {
    setUser(mockUsers[role]);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function hasPermission(userRole: UserRole, permission: string): boolean {
  const permissions: Record<UserRole, string[]> = {
    admin: ['view_all', 'edit_all', 'crm', 'insights_edit', 'reports_upload', 'user_management'],
    ejecutivo_ccc: ['view_global', 'dashboard_complete', 'crm', 'insights_read'],
    camara_aliada: ['view_own_chamber', 'dashboard_restricted', 'insights_read'],
  };

  return permissions[userRole]?.includes(permission) ?? false;
}