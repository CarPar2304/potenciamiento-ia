import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

export type UserRole = 'admin' | 'ccc' | 'camara_aliada';

export interface UserProfile {
  id: string;
  nombre: string;
  email: string;
  cargo?: string;
  celular?: string;
  camara_id?: string;
  is_admin: boolean;
  role: UserRole;
  chamber?: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, nombre: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const getUserRole = async (camaraId?: string, isAdmin?: boolean): Promise<UserRole> => {
    if (isAdmin) return 'admin';
    if (!camaraId) return 'ccc';
    
    try {
      const { data: camara } = await supabase
        .from('camaras')
        .select('nit')
        .eq('id', camaraId)
        .single();

      // CCC (Cali) tiene permisos de CCC
      if (camara?.nit === '890399001') {
        return 'ccc';
      }
      return 'camara_aliada';
    } catch (error) {
      console.error('Error getting user role:', error);
      return 'ccc';
    }
  };

  const fetchProfile = async (userId: string) => {
    try {
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select(`
          *,
          camaras (
            nombre,
            nit
          )
        `)
        .eq('id', userId)
        .single();

      if (error) throw error;

      if (profileData) {
        const role = await getUserRole(profileData.camara_id, profileData.is_admin);
        const userProfile: UserProfile = {
          id: profileData.id,
          nombre: profileData.nombre,
          email: profileData.email,
          cargo: profileData.cargo,
          celular: profileData.celular,
          camara_id: profileData.camara_id,
          is_admin: profileData.is_admin,
          role,
          chamber: profileData.camaras?.nombre
        };
        setProfile(userProfile);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  useEffect(() => {
    // Configurar listener de cambios de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch profile after session is established
          setTimeout(() => {
            fetchProfile(session.user.id);
          }, 0);
        } else {
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    // Verificar sesión existente
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        setTimeout(() => {
          fetchProfile(session.user.id);
        }, 0);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, nombre: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          nombre: nombre
        }
      }
    });
    
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      session,
      loading,
      signUp,
      signIn,
      signOut
    }}>
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
    admin: [
      'view_all', 'edit_all', 'crm_edit', 'insights_edit', 'reports_upload', 
      'user_management', 'ajustes', 'dashboard', 'insights_read', 'solicitudes', 
      'empresas', 'colaboradores', 'crm_view'
    ],
    ccc: [
      'view_global', 'dashboard', 'crm_view', 'insights_read', 'solicitudes', 
      'empresas', 'colaboradores_cali', 'colaboradores'
    ],
    camara_aliada: [
      'view_own_chamber', 'dashboard', 'insights_read', 'solicitudes_own', 
      'empresas_own', 'colaboradores_own', 'solicitudes', 'empresas', 'colaboradores'
    ],
  };

  return permissions[userRole]?.includes(permission) ?? false;
}