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
  const [dateRange, setDateRange] = useState<{ start: string; end: string; userTypeFilter?: string; chamberFilter?: string }>({ 
    start: '', 
    end: '', 
    userTypeFilter: 'all',
    chamberFilter: 'all'
  });
  const [overviewDateRange, setOverviewDateRange] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null,
  });

  // Use new comprehensive dashboard data
  const { 
    loading: dashboardLoading, 
    overallVisionData,
    usageData,
    businessEnvironmentData
  } = useDashboardData(undefined, dateRange, overviewDateRange);

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

        <TabsContent value="vision-general" className="mt-6">
          <OverallVisionTab 
            data={overallVisionData}
            onDateRangeChange={setOverviewDateRange}
            dateRange={overviewDateRange}
          />
        </TabsContent>

        <TabsContent value="uso" className="mt-6">
          <UsageTab 
            data={usageData} 
            onDateRangeChange={setDateRange}
            userRole={profile?.role}
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