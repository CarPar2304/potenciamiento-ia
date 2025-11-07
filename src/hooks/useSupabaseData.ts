import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// Types
export interface Solicitud {
  id: string;
  nombres_apellidos: string;
  email: string;
  celular?: string;
  numero_documento: string;
  cargo?: string;
  nivel_educativo?: string;
  fecha_solicitud: string;
  estado: 'Pendiente' | 'Aprobada' | 'Rechazada';
  nit_empresa?: string;
  es_colaborador?: boolean;
  camara_colaborador_id?: string;
  empresas?: {
    id: string;
    nombre: string;
    nit: string;
    sector?: string;
    mercado?: string;
    num_colaboradores?: number;
  ventas_2024?: number;
  decision_adoptar_ia?: 'Sí' | 'No';
  invirtio_ia_2024?: 'Sí' | 'No';
  monto_inversion_2024?: number;
    camara_id?: string;
    camaras?: {
      nombre: string;
      nit: string;
    };
  };
}

export interface Empresa {
  id: string;
  nombre: string;
  nit: string;
  sector?: string;
  mercado?: string;
  num_colaboradores?: number;
  mujeres_colaboradoras?: number;
  ventas_2024?: number;
  utilidades_2024?: number;
  decision_adoptar_ia?: 'Sí' | 'No';
  invirtio_ia_2024?: 'Sí' | 'No';
  monto_inversion_2024?: number;
  areas_implementacion_ia?: string;
  razon_no_adopcion?: string;
  colaboradores_capacitados_ia?: number;
  plan_capacitacion_ia?: 'Sí' | 'No';
  camara_id?: string;
  created_at?: string;
  camaras?: {
    nombre: string;
    nit: string;
  };
}

export interface PlatziGeneral {
  email: string;
  nombre: string;
  estado_acceso?: string;
  dias_acceso_restantes?: number;
  equipos?: string;
  ruta?: string;
  progreso_ruta?: number;
  cursos_totales_progreso?: number;
  cursos_totales_certificados?: number;
  tiempo_total_dedicado?: number;
  dias_sin_progreso?: number;
  dias_sin_certificar?: number;
  fecha_inicio_ultima_licencia?: string;
  fecha_expiracion_ultima_licencia?: string;
  fecha_primera_activacion?: string;
}

export interface PlatziSeguimiento {
  email: string;
  nombre: string;
  id_curso?: string;
  curso?: string;
  porcentaje_avance?: number;
  tiempo_invertido?: number;
  estado_curso?: string;
  fecha_certificacion?: string;
  ruta?: string;
}

export interface Camara {
  id: string;
  nombre: string;
  nit: string;
  licencias_disponibles: number;
}

// Custom hooks
export function useSolicitudes() {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { profile } = useAuth();

  const fetchSolicitudes = async () => {
    try {
      setLoading(true);
      
      // Obtener TODAS las solicitudes (empresariales y colaboradores)
      const { data: solicitudesData, error: solicitudesError } = await supabase
        .from('solicitudes')
        .select(`
          *,
          camaras:camara_colaborador_id (
            id,
            nombre,
            nit
          )
        `)
        .order('fecha_solicitud', { ascending: false });

      if (solicitudesError) throw solicitudesError;

      // Obtener empresas con sus cámaras
      const { data: empresasData, error: empresasError } = await supabase
        .from('empresas')
        .select(`
          *,
          camaras (
            id,
            nombre,
            nit
          )
        `);

      if (empresasError) throw empresasError;

      // Combinar los datos manualmente por NIT para solicitudes empresariales
      const solicitudesWithEmpresas = solicitudesData?.map(solicitud => ({
        ...solicitud,
        empresas: solicitud.es_colaborador ? undefined : empresasData?.find(empresa => empresa.nit === solicitud.nit_empresa)
      })) || [];

      setSolicitudes(solicitudesWithEmpresas);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando solicitudes');
      console.error('Error fetching solicitudes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile) {
      fetchSolicitudes();
    }
  }, [profile]);

  const refetch = async () => {
    await fetchSolicitudes();
  };

  return { solicitudes, loading, error, refetch };
}

export function useEmpresas() {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { profile } = useAuth();

  const fetchEmpresas = async () => {
    try {
      setLoading(true);
      
      // Obtener todas las empresas
      const { data: empresasData, error: empresasError } = await supabase
        .from('empresas')
        .select(`
          *,
          camaras (
            nombre,
            nit
          )
        `)
        .order('nombre');

      if (empresasError) throw empresasError;

      // Obtener solicitudes empresariales (no colaboradores) para filtrar empresas
      const { data: solicitudesEmpresariales, error: solicitudesError } = await supabase
        .from('solicitudes')
        .select('nit_empresa')
        .eq('es_colaborador', false);

      if (solicitudesError) throw solicitudesError;

      // Filtrar empresas que tienen solicitudes empresariales reales
      const nitsConSolicitudesEmpresariales = new Set(
        solicitudesEmpresariales?.map(s => s.nit_empresa) || []
      );

      const empresasFiltradas = empresasData?.filter(empresa => 
        nitsConSolicitudesEmpresariales.has(empresa.nit)
      ) || [];

      setEmpresas(empresasFiltradas);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando empresas');
      console.error('Error fetching empresas:', err);
    } finally {
      setLoading(false);
    }
  };

  const refetch = async () => {
    await fetchEmpresas();
  };

  useEffect(() => {
    if (profile) {
      fetchEmpresas();
    }
  }, [profile]);

  return { empresas, loading, error, refetch };
}

export function usePlatziGeneral() {
  const [platziData, setPlatziData] = useState<PlatziGeneral[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { profile } = useAuth();

  useEffect(() => {
    const fetchPlatziData = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('platzi_general')
          .select('*')
          .order('nombre');

        if (error) throw error;
        setPlatziData(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error cargando datos Platzi');
        console.error('Error fetching platzi data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (profile) {
      fetchPlatziData();
    }
  }, [profile]);

  return { platziData, loading, error };
}

export function usePlatziSeguimiento() {
  const [seguimientoData, setSeguimientoData] = useState<PlatziSeguimiento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { profile } = useAuth();

  useEffect(() => {
    const fetchSeguimientoData = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('platzi_seguimiento')
          .select('*')
          .order('nombre');

        if (error) throw error;
        setSeguimientoData(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error cargando seguimiento Platzi');
        console.error('Error fetching platzi seguimiento:', err);
      } finally {
        setLoading(false);
      }
    };

    if (profile) {
      fetchSeguimientoData();
    }
  }, [profile]);

  return { seguimientoData, loading, error };
}

export function useCamaras() {
  const [camaras, setCamaras] = useState<Camara[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCamaras = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('camaras')
          .select('*')
          .order('nombre');

        if (error) throw error;
        setCamaras(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error cargando cámaras');
        console.error('Error fetching camaras:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCamaras();
  }, []);

  return { camaras, loading, error };
}

// Hook para colaboradores
export function useColaboradores() {
  const [colaboradores, setColaboradores] = useState<Solicitud[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { profile } = useAuth();

  const fetchColaboradores = async () => {
    try {
      setLoading(true);
      
      // Obtener colaboradores con información de su cámara
      const { data: colaboradoresData, error: colaboradoresError } = await supabase
        .from('solicitudes')
        .select(`
          *,
          camaras!solicitudes_camara_colaborador_id_fkey (
            id,
            nombre,
            nit
          )
        `)
        .eq('es_colaborador', true)
        .order('fecha_solicitud', { ascending: false });

      if (colaboradoresError) throw colaboradoresError;

      setColaboradores(colaboradoresData || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando colaboradores');
      console.error('Error fetching colaboradores:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile) {
      fetchColaboradores();
    }
  }, [profile]);

  return { colaboradores, loading, error, refetch: fetchColaboradores };
}

// Insights types and hooks
export interface Insight {
  id: string;
  titulo: string;
  contenido: string;
  autor_id: string;
  audiencia: string;
  fecha_publicacion: string;
  activo: boolean;
  icono?: string;
  color?: string;
  camaras_especificas?: string[];
  created_at: string;
  updated_at: string;
}

export function useInsights() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { profile } = useAuth();

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('insights')
          .select('*')
          .order('fecha_publicacion', { ascending: false });

        if (error) throw error;
        setInsights(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error cargando insights');
        console.error('Error fetching insights:', err);
      } finally {
        setLoading(false);
      }
    };

    if (profile) {
      fetchInsights();
    }
  }, [profile]);

  const createInsight = async (insight: Omit<Insight, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('insights')
      .insert(insight)
      .select()
      .single();
    
    if (error) throw error;
    setInsights(prev => [data, ...prev]);
    return data;
  };

  const updateInsight = async (id: string, updates: Partial<Insight>) => {
    const { data, error } = await supabase
      .from('insights')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    setInsights(prev => prev.map(i => i.id === id ? data : i));
    return data;
  };

  const deleteInsight = async (id: string) => {
    const { error } = await supabase
      .from('insights')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    setInsights(prev => prev.filter(i => i.id !== id));
  };

  return { insights, loading, error, createInsight, updateInsight, deleteInsight };
}

// CRM types and hooks
export interface CRMActividad {
  id: string;
  camara_id: string;
  tipo_actividad: string;
  descripcion: string;
  fecha: string;
  usuario_id: string;
  estado: string;
  notas?: string;
  created_at: string;
  updated_at: string;
  camaras?: {
    nombre: string;
    nit: string;
  };
}

export function useCRMActividades() {
  const [actividades, setActividades] = useState<CRMActividad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { profile } = useAuth();

  useEffect(() => {
    const fetchActividades = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('crm_actividades')
          .select(`
            *,
            camaras (
              nombre,
              nit
            )
          `)
          .order('fecha', { ascending: false });

        if (error) throw error;
        setActividades(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error cargando actividades CRM');
        console.error('Error fetching CRM activities:', err);
      } finally {
        setLoading(false);
      }
    };

    if (profile) {
      fetchActividades();
    }
  }, [profile]);

  const createActividad = async (actividad: Omit<CRMActividad, 'id' | 'created_at' | 'updated_at' | 'camaras'>) => {
    const { data, error } = await supabase
      .from('crm_actividades')
      .insert(actividad)
      .select(`
        *,
        camaras (
          nombre,
          nit
        )
      `)
      .single();
    
    if (error) throw error;
    setActividades(prev => [data, ...prev]);
    return data;
  };

  const updateActividad = async (id: string, updates: Partial<CRMActividad>) => {
    const { data, error } = await supabase
      .from('crm_actividades')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        camaras (
          nombre,
          nit
        )
      `)
      .single();
    
    if (error) throw error;
    setActividades(prev => prev.map(a => a.id === id ? data : a));
    return data;
  };

  const deleteActividad = async (id: string) => {
    const { error } = await supabase
      .from('crm_actividades')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    setActividades(prev => prev.filter(a => a.id !== id));
  };

  return { actividades, loading, error, createActividad, updateActividad, deleteActividad };
}

// Stats hook
export function useStats() {
  const { solicitudes } = useSolicitudes();
  const { empresas } = useEmpresas();
  const { platziData } = usePlatziGeneral();

  const stats = {
    totalLicenses: 1200, // Este valor debería venir de configuración
    usedLicenses: platziData.length,
    totalApplications: solicitudes.length,
    approvedApplications: solicitudes.filter(s => s.estado === 'Aprobada').length,
    completedTests: platziData.length,
    averageProgress: platziData.length > 0 
      ? Math.round(
          platziData
            .filter(p => p.progreso_ruta && p.progreso_ruta > 0)
            .reduce((sum, p) => sum + (p.progreso_ruta || 0), 0) / 
          platziData.filter(p => p.progreso_ruta && p.progreso_ruta > 0).length
        )
      : 0,
    totalInvestment: empresas.reduce((sum, e) => sum + (e.monto_inversion_2024 || 0), 0),
  };

  return stats;
}