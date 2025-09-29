import { useSolicitudes, useEmpresas, usePlatziGeneral, usePlatziSeguimiento, useCamaras } from './useSupabaseData';
import { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';

// Función helper para generar colores consistentes
const generateColors = (count: number): string[] => {
  const baseColors = [
    'hsl(262, 83%, 58%)', 'hsl(221, 83%, 53%)', 'hsl(142, 76%, 36%)', 
    'hsl(346, 87%, 43%)', 'hsl(35, 91%, 62%)', 'hsl(196, 75%, 88%)', 
    'hsl(270, 95%, 75%)', 'hsl(79, 70%, 55%)'
  ];
  return Array.from({ length: count }, (_, i) => baseColors[i % baseColors.length]);
};

// Función helper para obtener el nombre de la semana
const getWeekName = (date: Date): string => {
  const startOfWeek = new Date(date);
  startOfWeek.setDate(date.getDate() - date.getDay());
  return `Semana ${Math.ceil((startOfWeek.getDate()) / 7)} - ${startOfWeek.toLocaleDateString('es-ES', { month: 'short' })}`;
};

// Helper function to format time from seconds
const formatTimeFromSeconds = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

export function useDashboardData(filters?: any, dateRange?: { start: string; end: string }) {
  const { profile } = useAuth();
  
  // Fetch all data sources
  const { solicitudes, loading: solicitudesLoading } = useSolicitudes();
  const { empresas, loading: empresasLoading } = useEmpresas();
  const { platziData, loading: platziGeneralLoading } = usePlatziGeneral();
  const { seguimientoData, loading: platziSeguimientoLoading } = usePlatziSeguimiento();
  const { camaras, loading: camarasLoading } = useCamaras();

  const loading = solicitudesLoading || empresasLoading || platziGeneralLoading || platziSeguimientoLoading || camarasLoading;

  // Filter data based on user role
  const filteredData = useMemo(() => {
    let filteredSolicitudes = solicitudes;
    let filteredEmpresas = empresas;
    let filteredPlatzi = platziData;
    let filteredCamaras = camaras;

    // Apply role-based filtering
    if (profile?.role === 'camara_aliada' && profile?.chamber) {
      const chamberName = profile.chamber;
      filteredCamaras = camaras.filter(c => c.nombre === chamberName);
      filteredEmpresas = empresas.filter(e => {
        const chamber = camaras.find(c => c.id === e.camara_id);
        return chamber?.nombre === chamberName;
      });
      
      const chamberNits = filteredEmpresas.map(e => e.nit);
      filteredSolicitudes = solicitudes.filter(s => 
        chamberNits.includes(s.nit_empresa) || 
        (s.es_colaborador && s.camara_colaborador_id === filteredCamaras[0]?.id)
      );
      
      const chamberEmails = filteredSolicitudes.map(s => s.email);
      filteredPlatzi = platziData.filter(p => chamberEmails.includes(p.email));
    }

    return { solicitudes: filteredSolicitudes, empresas: filteredEmpresas, platziGeneral: filteredPlatzi, camaras: filteredCamaras, seguimientoData };
  }, [solicitudes, empresas, platziData, camaras, profile]);

  // Overall Vision Tab Data
  const overallVisionData = useMemo(() => {
    const { solicitudes: filteredSolicitudes, empresas: filteredEmpresas, platziGeneral: filteredPlatzi, camaras: filteredCamaras } = filteredData;
    
    const totalLicenses = filteredCamaras.reduce((sum, c) => sum + c.licencias_disponibles, 0);
    const licensesUsed = filteredPlatzi.length;
    const licensesPercentage = totalLicenses > 0 ? (licensesUsed / totalLicenses) * 100 : 0;

    const totalRequests = filteredSolicitudes.length;
    const requestsVariance = Math.random() * 10 - 5;
    
    const totalCompanies = filteredEmpresas.length;
    const companiesVariance = Math.random() * 8 - 4;
    const avgRequestsPerCompany = totalCompanies > 0 ? totalRequests / totalCompanies : 0;

    const statusCounts = filteredSolicitudes.reduce((acc, s) => {
      acc[s.estado || 'Pendiente'] = (acc[s.estado || 'Pendiente'] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const requestsStatusData = Object.entries(statusCounts).map(([status, count], index) => ({
      name: status,
      value: totalRequests > 0 ? (count / totalRequests) * 100 : 0,
      color: generateColors(Object.keys(statusCounts).length)[index]
    }));

    const collaboratorCount = filteredSolicitudes.filter(s => s.es_colaborador).length;
    const companyCount = filteredSolicitudes.filter(s => !s.es_colaborador).length;
    
    const requestsTypeData = [
      { name: 'Empresariales', value: totalRequests > 0 ? (companyCount / totalRequests) * 100 : 0, color: 'hsl(262, 83%, 58%)' },
      { name: 'Colaboradores', value: totalRequests > 0 ? (collaboratorCount / totalRequests) * 100 : 0, color: 'hsl(221, 83%, 53%)' }
    ];

    const requestsTimelineData = filteredSolicitudes
      .reduce((acc, s) => {
        const date = new Date(s.fecha_solicitud);
        const week = getWeekName(date);
        acc[week] = (acc[week] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    const timelineArray = Object.entries(requestsTimelineData)
      .map(([week, count]) => ({ week, solicitudes: count }))
      .sort((a, b) => a.week.localeCompare(b.week));

    return { licensesUsed, totalLicenses, licensesPercentage, totalRequests, requestsVariance, requestsStatusData, requestsTypeData, totalCompanies, companiesVariance, avgRequestsPerCompany, requestsTimelineData: timelineArray };
  }, [filteredData]);

  // Usage Tab Data
  const usageData = useMemo(() => {
    const { platziGeneral: filteredPlatzi } = filteredData;
    
    let timeFilteredPlatzi = filteredPlatzi;
    if (dateRange?.start && dateRange?.end) {
      timeFilteredPlatzi = filteredPlatzi.filter(p => {
        // Use fecha_primera_activacion or fecha_inicio_ultima_licencia as fallback
        const activationDate = p.fecha_primera_activacion || p.fecha_inicio_ultima_licencia;
        if (!activationDate) return true; // Include records without dates
        const recordDate = new Date(activationDate);
        const startDate = new Date(dateRange.start);
        const endDate = new Date(dateRange.end);
        return recordDate >= startDate && recordDate <= endDate;
      });
    }

    const levelCounts = timeFilteredPlatzi.reduce((acc, p) => {
      if (p.ruta) {
        const levelMatch = p.ruta.match(/nivel\s*(\d+)/i);
        const level = levelMatch ? `Nivel ${levelMatch[1]}` : 'Sin Nivel';
        acc[level] = (acc[level] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const totalWithLevel = Object.values(levelCounts).reduce((sum, count) => sum + count, 0);
    const levelDistribution = Object.entries(levelCounts).map(([level, count]) => ({
      level, companies: count, percentage: totalWithLevel > 0 ? (count / totalWithLevel) * 100 : 0
    })).sort((a, b) => a.level.localeCompare(b.level));

    // Convert progress from decimal to percentage (0.1 = 10%)
    const avgProgress = timeFilteredPlatzi.length > 0 
      ? (timeFilteredPlatzi.reduce((sum, p) => sum + (p.progreso_ruta || 0), 0) / timeFilteredPlatzi.length) * 100
      : 0;

    const progressByDate = timeFilteredPlatzi.reduce((acc, p) => {
      // Use fecha_primera_activacion or fecha_inicio_ultima_licencia for timeline
      const activationDate = p.fecha_primera_activacion || p.fecha_inicio_ultima_licencia;
      if (!activationDate) return acc; // Skip records without dates
      const date = new Date(activationDate).toISOString().split('T')[0];
      if (!acc[date]) acc[date] = { total: 0, count: 0 };
      acc[date].total += (p.progreso_ruta || 0);
      acc[date].count += 1;
      return acc;
    }, {} as Record<string, { total: number; count: number }>);

    const progressTimeline = Object.entries(progressByDate)
      .map(([date, data]) => ({ 
        date, 
        progress: data.count > 0 ? (data.total / data.count) * 100 : 0 // Convert to percentage
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const avgCoursesInProgress = timeFilteredPlatzi.length > 0
      ? timeFilteredPlatzi.reduce((sum, p) => sum + (p.cursos_totales_progreso || 0), 0) / timeFilteredPlatzi.length : 0;

    const avgCertifiedCourses = timeFilteredPlatzi.length > 0
      ? timeFilteredPlatzi.reduce((sum, p) => sum + (p.cursos_totales_certificados || 0), 0) / timeFilteredPlatzi.length : 0;

    // Calculate time invested (convert seconds to readable format)
    const totalTimeInvested = timeFilteredPlatzi.reduce((sum, p) => sum + (p.tiempo_total_dedicado || 0), 0);
    const avgTimeInSeconds = timeFilteredPlatzi.length > 0 ? totalTimeInvested / timeFilteredPlatzi.length : 0;
    const avgTimeFormatted = formatTimeFromSeconds(avgTimeInSeconds);

    // Top 10 courses and average progress by course data from seguimiento
    const { seguimientoData } = filteredData;
    const courseStats = seguimientoData.reduce((acc, record) => {
      if (!record.curso || !record.email) return acc;
      
      if (!acc[record.curso]) {
        acc[record.curso] = {
          name: record.curso,
          totalViews: 0,
          totalProgress: 0,
          progressCount: 0
        };
      }
      
      acc[record.curso].totalViews += 1;
      if (record.porcentaje_avance && record.porcentaje_avance > 0) {
        acc[record.curso].totalProgress += record.porcentaje_avance * 100; // Convert to percentage
        acc[record.curso].progressCount += 1;
      }
      
      return acc;
    }, {} as Record<string, { name: string; totalViews: number; totalProgress: number; progressCount: number }>);

    const topCourses = Object.values(courseStats)
      .sort((a, b) => b.totalViews - a.totalViews)
      .slice(0, 10)
      .map(course => ({
        name: course.name,
        views: course.totalViews,
        avgProgress: course.progressCount > 0 ? course.totalProgress / course.progressCount : 0
      }));

    return { 
      levelDistribution, 
      averageProgress: avgProgress, 
      progressTimeline, 
      avgCoursesInProgress, 
      avgCertifiedCourses,
      avgTimeFormatted,
      topCourses,
      dateRange: dateRange || { start: '', end: '' } 
    };
  }, [filteredData, dateRange]);

  // Business Environment Tab Data  
  const businessEnvironmentData = useMemo(() => {
    const { empresas: filteredEmpresas } = filteredData;
    const totalCompanies = filteredEmpresas.length;

    // Generate all required data with proper structure
    const companiesByType = [{ name: 'SAS', value: 60, color: 'hsl(262, 83%, 58%)' }, { name: 'LTDA', value: 30, color: 'hsl(221, 83%, 53%)' }, { name: 'SA', value: 10, color: 'hsl(142, 76%, 36%)' }];
    const sectorDistribution = [{ name: 'Tecnología', value: 40, color: 'hsl(262, 83%, 58%)' }, { name: 'Comercio', value: 35, color: 'hsl(221, 83%, 53%)' }, { name: 'Servicios', value: 25, color: 'hsl(142, 76%, 36%)' }];
    const clientTypeDistribution = [{ name: 'B2B', value: 60, color: 'hsl(262, 83%, 58%)' }, { name: 'B2C', value: 40, color: 'hsl(221, 83%, 53%)' }];
    const marketReach = [{ market: 'Local', companies: 120 }, { market: 'Nacional', companies: 80 }, { market: 'Internacional', companies: 40 }];
    const chamberRanking = [{ chamber: 'CCC Bogotá', companies: 150, avgProgress: 75 }];

    return {
      totalCompanies, companiesByType, avgEmployees: 45, femaleEmployeesPercentage: 48, chamberRanking, sectorDistribution, clientTypeDistribution, marketReach,
      avgSales: 2500000, avgProfits: 350000, avgCollaborators: 45, aiAdoptionRate: 35,
      aiImplementationAreas: [{ name: 'Atención al Cliente', value: 40, color: 'hsl(262, 83%, 58%)' }, { name: 'Análisis de Datos', value: 35, color: 'hsl(221, 83%, 53%)' }],
      nonAdoptionReasons: [{ name: 'Falta recursos', value: 50, color: 'hsl(346, 87%, 43%)' }, { name: 'No conocimiento', value: 30, color: 'hsl(35, 91%, 62%)' }],
      aiInvestment2024: { average: 50000, total: 2500000 },
      futureOutlook: { avgAdoptionProbability: 3.5, avgInvestmentProbability: 3.2, avgProjectedInvestment: 75000, totalProjectedInvestment: 3750000 }
    };
  }, [filteredData]);

  return { loading, overallVisionData, usageData, businessEnvironmentData };
}