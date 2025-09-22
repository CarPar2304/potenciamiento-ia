import React, { useState, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useSolicitudes, useStats, useCamaras } from '@/hooks/useSupabaseData';
import { DashboardFilters } from '@/components/dashboard/DashboardFilters';
import { OverviewTab } from '@/components/dashboard/tabs/OverviewTab';
import { AIAdoptionTab } from '@/components/dashboard/tabs/AIAdoptionTab';
import { PlatziPerformanceTab } from '@/components/dashboard/tabs/PlatziPerformanceTab';
import { DemographicsTab } from '@/components/dashboard/tabs/DemographicsTab';
import { ChamberPerformanceTab } from '@/components/dashboard/tabs/ChamberPerformanceTab';
import { useDashboardData } from '@/hooks/useDashboardData';
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

  // Use new comprehensive dashboard data
  const { 
    loading: dashboardLoading, 
    executiveKPIs, 
    aiAdoptionData, 
    platziPerformanceData, 
    demographicsData, 
    chamberPerformanceData 
  } = useDashboardData(filters);

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

  if (solicitudesLoading || dashboardLoading) {
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
          {aiAdoptionData && executiveKPIs && (
            <AIAdoptionTab 
              data={aiAdoptionData} 
              kpis={{
                aiAdoptionRate: executiveKPIs.aiAdoptionRate,
                totalInvestment2024: executiveKPIs.totalInvestment2024,
                projectedInvestment: executiveKPIs.projectedInvestment,
                companiesImpacted: executiveKPIs.companiesImpacted
              }} 
            />
          )}
        </TabsContent>

        <TabsContent value="performance" className="mt-6">
          {platziPerformanceData && executiveKPIs && (
            <PlatziPerformanceTab 
              data={platziPerformanceData} 
              kpis={{
                avgProgress: executiveKPIs.avgProgress,
                totalCertificates: executiveKPIs.totalCertificates,
                totalHoursStudied: executiveKPIs.totalHoursStudied,
                activeUsers: executiveKPIs.activeUsers
              }} 
            />
          )}
        </TabsContent>

        <TabsContent value="demographics" className="mt-6">
          {demographicsData && (
            <DemographicsTab 
              data={demographicsData} 
              totalParticipants={solicitudes.length}
            />
          )}
        </TabsContent>

        <TabsContent value="chambers" className="mt-6">
          {chamberPerformanceData && (
            <ChamberPerformanceTab data={chamberPerformanceData} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}