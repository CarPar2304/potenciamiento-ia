import React, { useState, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { OverallVisionTab } from '@/components/dashboard/tabs/OverallVisionTab';
import { UsageTab } from '@/components/dashboard/tabs/UsageTab';
import { BusinessEnvironmentTab } from '@/components/dashboard/tabs/BusinessEnvironmentTab';
import { useDashboardData } from '@/hooks/useDashboardData';

export default function Dashboard() {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState('vision-general');
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: '', end: '' });

  // Use new comprehensive dashboard data
  const { 
    loading: dashboardLoading, 
    overallVisionData,
    usageData,
    businessEnvironmentData
  } = useDashboardData(undefined, dateRange);

  if (!profile) return null;

  if (dashboardLoading) {
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
          Panel de control integral del programa Potenciamiento IA
        </p>
      </div>

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="vision-general">Visión General</TabsTrigger>
          <TabsTrigger value="uso">Uso</TabsTrigger>
          <TabsTrigger value="entorno-empresarial">Entorno Empresarial</TabsTrigger>
        </TabsList>

        {/* Utilidades KPI - Solo visible en pestaña de Entorno Empresarial */}
        {activeTab === 'entorno-empresarial' && businessEnvironmentData && (
          <div className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-card rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Empresas Registradas</p>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg>
                </div>
                <div className="mt-2">
                  <div className="text-2xl font-bold">{businessEnvironmentData.totalCompanies.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground mt-1">Total en el programa</p>
                </div>
              </div>

              <div className="bg-card rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Colaboradores Promedio</p>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                </div>
                <div className="mt-2">
                  <div className="text-2xl font-bold">{Math.round(businessEnvironmentData.avgEmployees).toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground mt-1">{businessEnvironmentData.femaleEmployeesPercentage.toFixed(1)}% son mujeres</p>
                </div>
              </div>
              
              <div className="bg-card rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">% Mujeres Colaboradoras</p>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                </div>
                <div className="mt-2">
                  <div className="text-2xl font-bold">{businessEnvironmentData.femaleEmployeesPercentage.toFixed(1)}%</div>
                  <p className="text-xs text-muted-foreground mt-1">Del total de colaboradores</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <TabsContent value="vision-general" className="mt-6">
          <OverallVisionTab data={overallVisionData} />
        </TabsContent>

        <TabsContent value="uso" className="mt-6">
          <UsageTab 
            data={usageData} 
            onDateRangeChange={setDateRange}
          />
        </TabsContent>

        <TabsContent value="entorno-empresarial" className="mt-6">
          <BusinessEnvironmentTab 
            data={businessEnvironmentData} 
            userRole={profile?.role || 'camara_aliada'}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}