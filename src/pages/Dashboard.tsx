import React, { useState, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { mockApplications, mockStats, mockChambers, mockSectors } from '@/data/mockData';
import { DashboardFilters } from '@/components/dashboard/DashboardFilters';
import { OverviewTab } from '@/components/dashboard/tabs/OverviewTab';
import type { DashboardFilters as DashboardFiltersType } from '@/components/dashboard/DashboardFilters';

export default function Dashboard() {
  const { user } = useAuth();
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

  if (!user) return null;

  // Filter data based on user permissions and filters
  const filteredData = useMemo(() => {
    let filtered = mockApplications;

    // Role-based filtering
    if (user.role === 'camara_aliada' && user.chamber) {
      filtered = filtered.filter(app => app.chamber === user.chamber);
    }

    // Apply filters
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(app => 
        app.firstName.toLowerCase().includes(query) ||
        app.lastName.toLowerCase().includes(query) ||
        app.email.toLowerCase().includes(query) ||
        app.company.toLowerCase().includes(query) ||
        app.nit.includes(query)
      );
    }

    // Apply other filters...
    return filtered;
  }, [filters, user]);

  // Generate processed data
  const processedData = useMemo(() => {
    const applications = filteredData;
    const stats = {
      totalLicenses: mockStats.totalLicenses,
      usedLicenses: applications.filter(app => app.testCompleted).length,
      totalApplications: applications.length,
      approvedApplications: applications.filter(app => app.status === 'aprobado').length,
      completedTests: applications.filter(app => app.testCompleted).length,
      averageProgress: Math.round(
        applications.filter(app => app.progress > 0).reduce((sum, app) => sum + app.progress, 0) /
        Math.max(1, applications.filter(app => app.progress > 0).length)
      ),
      totalInvestment: applications.reduce((sum, app) => sum + app.aiInvestment2024, 0),
      chamberStats: mockStats.chamberStats,
    };

    return { applications, stats, companies: [] };
  }, [filteredData]);

  const userChamber = user.role === 'camara_aliada' ? user.chamber : undefined;

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
        userRole={user.role}
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
          <OverviewTab data={processedData} userRole={user.role} />
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