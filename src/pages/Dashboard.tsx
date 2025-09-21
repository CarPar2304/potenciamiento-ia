import React, { useState, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useSolicitudes, useStats, useCamaras } from '@/hooks/useSupabaseData';
import { DashboardFilters } from '@/components/dashboard/DashboardFilters';
import { OverviewTab } from '@/components/dashboard/tabs/OverviewTab';
import type { DashboardFilters as DashboardFiltersType } from '@/components/dashboard/DashboardFilters';

export default function Dashboard() {
  const { profile } = useAuth();
  const { solicitudes, loading: solicitudesLoading } = useSolicitudes();
  const stats = useStats();
  const { camaras } = useCamaras();
  const [activeTab, setActiveTab] = useState('overview');
  const [filters, setFilters] = useState<DashboardFiltersType>({
    dateRange: {},
    chambers: [],
    sectors: [],
    companySize: '',
    aiAdoptionLevel: '',
    platziLevel: '',
    searchQuery: ''
  });

  if (!profile) return null;

  // Filter data based on user permissions and filters
  const filteredData = useMemo(() => {
    let filtered = solicitudes;

    // Role-based filtering
    if (profile?.role === 'camara_aliada' && profile?.chamber) {
      filtered = filtered.filter(sol => sol.empresas?.camaras?.nombre === profile.chamber);
    }

    // Apply filters
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(sol => 
        sol.nombres_apellidos.toLowerCase().includes(query) ||
        sol.email.toLowerCase().includes(query) ||
        (sol.empresas?.nombre || '').toLowerCase().includes(query) ||
        (sol.empresas?.nit || '').includes(query)
      );
    }

    // Apply other filters...
    return filtered;
  }, [filters, solicitudes, profile]);

  // Generate processed data
  const processedData = useMemo(() => {
    const applications = filteredData;
    
    return { 
      applications, 
      stats: {
        ...stats,
        totalApplications: applications.length,
        approvedApplications: applications.filter(app => app.estado === 'Aprobada').length,
      }, 
      companies: [] 
    };
  }, [filteredData, stats]);

  const userChamber = profile?.role === 'camara_aliada' ? profile?.chamber : undefined;

  if (solicitudesLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard Analítico</h2>
          <p className="text-muted-foreground">Cargando datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard Analítico</h2>
        <p className="text-muted-foreground">
          Panel de control integral del programa de adopción de IA
        </p>
      </div>

      {/* Filtros */}
      <DashboardFilters
        filters={filters}
        onFiltersChange={setFilters}
        userRole={profile?.role || 'camara_aliada'}
        userChamber={userChamber}
      />

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Visión General</TabsTrigger>
          <TabsTrigger value="ai-adoption">Adopción IA</TabsTrigger>
          <TabsTrigger value="performance">Rendimiento</TabsTrigger>
          <TabsTrigger value="demographics">Demografía</TabsTrigger>
          <TabsTrigger value="chambers">Por Cámara</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <OverviewTab data={processedData} userRole={profile?.role || 'camara_aliada'} />
        </TabsContent>

        <TabsContent value="ai-adoption" className="mt-6">
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold mb-2">Análisis de Adopción IA</h3>
            <p className="text-muted-foreground">Próximamente: Gráficos detallados de adopción de IA</p>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="mt-6">
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold mb-2">Rendimiento Académico</h3>
            <p className="text-muted-foreground">Próximamente: Análisis de métricas Platzi</p>
          </div>
        </TabsContent>

        <TabsContent value="demographics" className="mt-6">
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold mb-2">Perfil Demográfico</h3>
            <p className="text-muted-foreground">Próximamente: Análisis demográfico detallado</p>
          </div>
        </TabsContent>

        <TabsContent value="chambers" className="mt-6">
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold mb-2">Rendimiento por Cámara</h3>
            <p className="text-muted-foreground">Próximamente: Vista detallada por cámara</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}