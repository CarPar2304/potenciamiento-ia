import { createContext, useContext, useState, useEffect } from 'react';
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
  signUp: (email: string, password: string, nombre: string, camara_id: string, celular: string, cargo: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);

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
    if (profileLoading) return; // Evitar múltiples llamadas
    
    setProfileLoading(true);
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
      setProfile(null);
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    // Configurar listener de cambios de auth PRIMERO
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!isMounted) return;
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Defer profile fetching to avoid blocking
          if (!profileLoading) {
            fetchProfile(session.user.id);
          }
        } else {
          setProfile(null);
          setProfileLoading(false);
        }
        
        // Solo establecer loading false una vez
        if (loading) {
          setLoading(false);
        }
      }
    );

    // LUEGO verificar sesión existente
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!isMounted) return;
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      
      setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (
    email: string, 
    password: string, 
    nombre: string,
    camara_id: string,
    celular: string,
    cargo: string
  ) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          nombre: nombre,
          camara_id: camara_id,
          celular: celular,
          cargo: cargo
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
      'empresas', 'colaboradores', 'crm_view', 'admin_actions'
    ],
    ccc: [
      'view_all', 'dashboard', 'crm_view', 'insights_read', 'solicitudes', 
      'empresas', 'colaboradores_cali', 'colaboradores'
    ],
    camara_aliada: [
      'view_own_chamber', 'dashboard', 'insights_read', 'solicitudes_own', 
      'empresas_own', 'colaboradores_own', 'solicitudes', 'empresas', 'colaboradores'
    ],
  };

  return permissions[userRole]?.includes(permission) ?? false;
}