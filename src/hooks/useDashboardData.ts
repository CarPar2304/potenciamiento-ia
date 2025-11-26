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

// Función helper para obtener el nombre de la semana desde el inicio de semana
const getWeekName = (startOfWeek: Date): string => {
  const day = startOfWeek.getDate();
  const month = startOfWeek.toLocaleDateString('es-ES', { month: 'short' });
  const year = startOfWeek.getFullYear();
  const currentYear = new Date().getFullYear();
  
  // Include year if it's not the current year
  if (year !== currentYear) {
    return `${day} ${month} ${year}`;
  }
  return `${day} ${month}`;
};

// Helper function to format time from seconds
const formatTimeFromSeconds = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
};

export function useDashboardData(filters?: any, dateRange?: { start: string; end: string }, overviewDateRange?: { start: Date | null; end: Date | null }) {
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
    let filteredSeguimiento = seguimientoData;
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
      filteredSeguimiento = seguimientoData.filter(s => chamberEmails.includes(s.email));
    }

    return { 
      solicitudes: filteredSolicitudes, 
      empresas: filteredEmpresas, 
      platziGeneral: filteredPlatzi, 
      seguimientoData: filteredSeguimiento,
      camaras: filteredCamaras 
    };
  }, [solicitudes, empresas, platziData, seguimientoData, camaras, profile]);

  // Overall Vision Tab Data
  const overallVisionData = useMemo(() => {
    const { solicitudes, empresas: filteredEmpresas, platziGeneral: filteredPlatzi, camaras: filteredCamaras } = filteredData;
    
    // Filter by date range if provided
    let filteredSolicitudes = solicitudes;
    if (overviewDateRange?.start && overviewDateRange?.end) {
      filteredSolicitudes = solicitudes.filter(s => {
        const requestDate = new Date(s.fecha_solicitud);
        return requestDate >= overviewDateRange.start! && requestDate <= overviewDateRange.end!;
      });
    }
    
    const totalLicenses = filteredCamaras.reduce((sum, c) => sum + c.licencias_disponibles, 0);
    const licensesUsed = filteredPlatzi.length;
    const licensesPercentage = totalLicenses > 0 ? (licensesUsed / totalLicenses) * 100 : 0;

    // Calculate variance for requests (current month vs previous month)
    const now = new Date();
    const firstDayCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayPreviousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastDayPreviousMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const requestsCurrentMonth = filteredSolicitudes.filter(s => {
      const date = new Date(s.fecha_solicitud);
      return date >= firstDayCurrentMonth;
    }).length;

    const requestsPreviousMonth = filteredSolicitudes.filter(s => {
      const date = new Date(s.fecha_solicitud);
      return date >= firstDayPreviousMonth && date <= lastDayPreviousMonth;
    }).length;

    const requestsVariance = requestsPreviousMonth > 0 
      ? ((requestsCurrentMonth - requestsPreviousMonth) / requestsPreviousMonth) * 100
      : null; // null indica que no hay datos para comparar

    const totalRequests = filteredSolicitudes.length;
    
    // Calculate variance for companies (current month vs previous month)
    const companiesCurrentMonth = filteredEmpresas.filter(e => {
      if (!e.created_at) return false;
      const date = new Date(e.created_at);
      return date >= firstDayCurrentMonth;
    }).length;

    const companiesPreviousMonth = filteredEmpresas.filter(e => {
      if (!e.created_at) return false;
      const date = new Date(e.created_at);
      return date >= firstDayPreviousMonth && date <= lastDayPreviousMonth;
    }).length;

    const companiesVariance = companiesPreviousMonth > 0
      ? ((companiesCurrentMonth - companiesPreviousMonth) / companiesPreviousMonth) * 100
      : null; // null indica que no hay datos para comparar

    const totalCompanies = filteredEmpresas.length;
    const avgRequestsPerCompany = totalCompanies > 0 ? totalRequests / totalCompanies : 0;

    const statusCounts = filteredSolicitudes.reduce((acc, s) => {
      acc[s.estado || 'Pendiente'] = (acc[s.estado || 'Pendiente'] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const requestsStatusData = Object.entries(statusCounts).map(([status, count], index) => ({
      name: status,
      value: parseFloat((totalRequests > 0 ? (count / totalRequests) * 100 : 0).toFixed(2)),
      count: count,
      color: generateColors(Object.keys(statusCounts).length)[index]
    }));

    const collaboratorCount = filteredSolicitudes.filter(s => s.es_colaborador).length;
    const companyCount = filteredSolicitudes.filter(s => !s.es_colaborador).length;
    
    const requestsTypeData = [
      { name: 'Empresariales', value: parseFloat((totalRequests > 0 ? (companyCount / totalRequests) * 100 : 0).toFixed(2)), count: companyCount, color: 'hsl(262, 83%, 58%)' },
      { name: 'Colaboradores', value: parseFloat((totalRequests > 0 ? (collaboratorCount / totalRequests) * 100 : 0).toFixed(2)), count: collaboratorCount, color: 'hsl(221, 83%, 53%)' }
    ];

    const requestsTimelineData = filteredSolicitudes
      .reduce((acc, s) => {
        const date = new Date(s.fecha_solicitud);
        const startOfWeek = new Date(date);
        startOfWeek.setDate(date.getDate() - date.getDay());
        startOfWeek.setHours(0, 0, 0, 0); // Normalize to start of day
        const weekKey = startOfWeek.toISOString();
        
        if (!acc[weekKey]) {
          acc[weekKey] = { week: getWeekName(startOfWeek), count: 0, weekStart: startOfWeek };
        }
        acc[weekKey].count += 1;
        return acc;
      }, {} as Record<string, { week: string; count: number; weekStart: Date }>);

    const timelineArray = Object.entries(requestsTimelineData)
      .map(([key, data]) => ({ week: data.week, solicitudes: data.count, weekStart: data.weekStart }))
      .sort((a, b) => a.weekStart.getTime() - b.weekStart.getTime())
      .map(({ week, solicitudes }) => ({ week, solicitudes }));

    return { licensesUsed, totalLicenses, licensesPercentage, totalRequests, requestsVariance, requestsStatusData, requestsTypeData, totalCompanies, companiesVariance, avgRequestsPerCompany, requestsTimelineData: timelineArray };
  }, [filteredData, overviewDateRange]);

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

    // Calculate time invested using platzi_seguimiento (seconds), aggregated per user and formatted
    const userTimeMap = (filteredData.seguimientoData || []).reduce((acc, rec) => {
      if (!rec?.email) return acc;
      const sec = rec.tiempo_invertido || 0;
      acc[rec.email] = (acc[rec.email] || 0) + sec;
      return acc;
    }, {} as Record<string, number>);

    const userTotals = Object.values(userTimeMap);
    const avgTimeInSeconds = userTotals.length > 0
      ? userTotals.reduce((a, b) => a + b, 0) / userTotals.length
      : 0;

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

    // Gráfico 1: Adherencia a la Ruta (En Ruta vs Exploración Libre)
    const coursesInRoute = seguimientoData.filter(s =>
      s.ruta && s.ruta.trim() !== '' && s.ruta.toLowerCase() !== 'not title'
    ).length;
    const coursesOutOfRoute = seguimientoData.filter(s => 
      !s.ruta || s.ruta.trim() === '' || s.ruta.toLowerCase() === 'not title'
    ).length;
    
    const routeAdherenceData = [
      { name: 'En Ruta Recomendada', value: coursesInRoute, percentage: (coursesInRoute / (coursesInRoute + coursesOutOfRoute)) * 100 || 0 },
      { name: 'Exploración Libre', value: coursesOutOfRoute, percentage: (coursesOutOfRoute / (coursesInRoute + coursesOutOfRoute)) * 100 || 0 }
    ];

    // Gráfico 2: Evangelizadores vs Exploradores (Scatter Plot)
    const userScatterData = timeFilteredPlatzi.map(user => ({
      name: user.nombre || user.email,
      progressInRoute: (user.progreso_ruta || 0) * 100, // Convert to percentage
      certifiedCourses: user.cursos_totales_certificados || 0
    })).filter(u => u.progressInRoute > 0 || u.certifiedCourses > 0); // Only users with some activity

    // Gráfico 3: Distribución del consumo de cursos por tipo de ruta (detallado)
    const totalCourses = seguimientoData.length;
    
    // Agrupar cursos por ruta específica
    const routeCounts = seguimientoData.reduce((acc, s) => {
      // Agrupar solo los "Not title" y vacíos como "Sin ruta"
      if (!s.ruta || s.ruta.trim() === '' || s.ruta.toLowerCase() === 'not title') {
        acc['Sin ruta'] = (acc['Sin ruta'] || 0) + 1;
      } else {
        // Cada ruta específica tiene su propia categoría
        acc[s.ruta] = (acc[s.ruta] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    // Generar colores para cada ruta
    const routeEntries = Object.entries(routeCounts);
    const colors = generateColors(routeEntries.length);
    
    const courseDistributionByRouteType = routeEntries
      .map(([routeName, count], index) => ({
        name: routeName,
        value: count,
        percentage: totalCourses > 0 ? (count / totalCourses) * 100 : 0,
        color: colors[index]
      }))
      .sort((a, b) => b.value - a.value); // Ordenar por cantidad descendente

    // Top 5 cursos por categoría
    // Normalizar espacios extras en las rutas para comparación
    const normalizeRoute = (route: string) => route.replace(/\s+/g, ' ').toLowerCase().trim();
    
    const iaRouteLevels = [
      'nivel 1 adopción ia explorador de ia',
      'nivel 2 adopción ia observador crítico de ia',
      'nivel 3 adopción ia usuario competente herramientas ia',
      'nivel 4 adopción ia promotor de innovación usando ia',
      'nivel 5 adopción ia estratega de ia para el negocio',
      'nivel 6 adopción ia especialista técnico en ia'
    ];

    // 1. Top 5 cursos de rutas de IA
    const iaRouteCourses = seguimientoData.filter(s => {
      if (!s.ruta) return false;
      const normalizedRoute = normalizeRoute(s.ruta);
      return iaRouteLevels.some(level => normalizedRoute.includes(level));
    });

    const iaCourseCounts = iaRouteCourses.reduce((acc, s) => {
      if (!s.curso) return acc;
      if (!acc[s.curso]) {
        acc[s.curso] = { count: 0, route: s.ruta || 'Sin especificar' };
      }
      acc[s.curso].count += 1;
      return acc;
    }, {} as Record<string, { count: number; route: string }>);

    const topIACourses = Object.entries(iaCourseCounts)
      .map(([course, data]) => ({
        name: course,
        count: data.count,
        route: data.route
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // 2. Top 5 cursos de otras rutas (no IA, no sin ruta)
    const otherRouteCourses = seguimientoData.filter(s => {
      if (!s.ruta || s.ruta.trim() === '' || s.ruta.toLowerCase() === 'not title') return false;
      const normalizedRoute = normalizeRoute(s.ruta);
      return !iaRouteLevels.some(level => normalizedRoute.includes(level));
    });

    const otherCourseCounts = otherRouteCourses.reduce((acc, s) => {
      if (!s.curso) return acc;
      if (!acc[s.curso]) {
        acc[s.curso] = { count: 0, route: s.ruta || 'Sin especificar' };
      }
      acc[s.curso].count += 1;
      return acc;
    }, {} as Record<string, { count: number; route: string }>);

    const topOtherCourses = Object.entries(otherCourseCounts)
      .map(([course, data]) => ({
        name: course,
        count: data.count,
        route: data.route
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // 3. Top 5 cursos sin ruta
    const noRouteCourses = seguimientoData.filter(s => 
      !s.ruta || s.ruta.trim() === '' || s.ruta.toLowerCase() === 'not title'
    );

    const noRouteCourseCounts = noRouteCourses.reduce((acc, s) => {
      if (!s.curso) return acc;
      acc[s.curso] = (acc[s.curso] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topNoRouteCourses = Object.entries(noRouteCourseCounts)
      .map(([course, count]) => ({
        name: course,
        count: count
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Top 5 empresas por métricas
    // 1. Top 5 empresas con más usuarios con licencia
    const companiesWithUsers = filteredData.empresas.map(empresa => {
      // Obtener solicitudes aprobadas de esta empresa
      const empresaNits = [empresa.nit];
      const empresaRequests = filteredData.solicitudes.filter(s => 
        empresaNits.includes(s.nit_empresa) && s.estado === 'Aprobada'
      );
      const userEmails = empresaRequests.map(s => s.email);
      
      // Contar usuarios con licencia activa en Platzi
      const usersWithLicense = filteredData.platziGeneral.filter(p => 
        userEmails.includes(p.email)
      ).length;

      return {
        name: empresa.nombre,
        nit: empresa.nit,
        users: usersWithLicense
      };
    }).filter(e => e.users > 0)
      .sort((a, b) => b.users - a.users)
      .slice(0, 5);

    // 2. Top 5 empresas con mayor consumo de cursos en rutas de IA
    const companiesIACourseConsumption = filteredData.empresas.map(empresa => {
      const empresaNits = [empresa.nit];
      const empresaRequests = filteredData.solicitudes.filter(s => 
        empresaNits.includes(s.nit_empresa) && s.estado === 'Aprobada'
      );
      const userEmails = empresaRequests.map(s => s.email);
      
      // Filtrar cursos de rutas de IA para usuarios de esta empresa
      const iaCourses = filteredData.seguimientoData.filter(s => {
        if (!userEmails.includes(s.email) || !s.ruta) return false;
        const normalizedRoute = normalizeRoute(s.ruta);
        return iaRouteLevels.some(level => normalizedRoute.includes(level));
      });

      // Agrupar por ruta y curso
      const routeCourseMap = iaCourses.reduce((acc, s) => {
        if (!s.curso) return acc;
        const route = s.ruta || 'Sin especificar';
        if (!acc[route]) acc[route] = {};
        acc[route][s.curso] = (acc[route][s.curso] || 0) + 1;
        return acc;
      }, {} as Record<string, Record<string, number>>);

      // Encontrar la ruta más consumida
      const routeTotals = Object.entries(routeCourseMap).map(([route, courses]) => ({
        route,
        total: Object.values(courses).reduce((sum, count) => sum + count, 0),
        topCourse: Object.entries(courses).sort((a, b) => b[1] - a[1])[0]
      }));

      const topRoute = routeTotals.sort((a, b) => b.total - a.total)[0];

      return {
        name: empresa.nombre,
        nit: empresa.nit,
        totalCourses: iaCourses.length,
        topRoute: topRoute?.route || 'N/A',
        topCourse: topRoute?.topCourse?.[0] || 'N/A',
        topCourseCount: topRoute?.topCourse?.[1] || 0
      };
    }).filter(e => e.totalCourses > 0)
      .sort((a, b) => b.totalCourses - a.totalCourses)
      .slice(0, 5);

    // 3. Top 5 empresas con mayor consumo de cursos fuera de rutas
    const companiesOutsideRouteConsumption = filteredData.empresas.map(empresa => {
      const empresaNits = [empresa.nit];
      const empresaRequests = filteredData.solicitudes.filter(s => 
        empresaNits.includes(s.nit_empresa) && s.estado === 'Aprobada'
      );
      const userEmails = empresaRequests.map(s => s.email);
      
      // Filtrar cursos fuera de rutas de IA
      const outsideCourses = filteredData.seguimientoData.filter(s => {
        if (!userEmails.includes(s.email)) return false;
        if (!s.ruta || s.ruta.trim() === '' || s.ruta.toLowerCase() === 'not title') return false;
        const normalizedRoute = normalizeRoute(s.ruta);
        return !iaRouteLevels.some(level => normalizedRoute.includes(level));
      });

      // Encontrar el curso más consumido
      const courseCounts = outsideCourses.reduce((acc, s) => {
        if (!s.curso) return acc;
        acc[s.curso] = (acc[s.curso] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const topCourse = Object.entries(courseCounts)
        .sort((a, b) => b[1] - a[1])[0];

      return {
        name: empresa.nombre,
        nit: empresa.nit,
        totalCourses: outsideCourses.length,
        topCourse: topCourse?.[0] || 'N/A',
        topCourseCount: topCourse?.[1] || 0
      };
    }).filter(e => e.totalCourses > 0)
      .sort((a, b) => b.totalCourses - a.totalCourses)
      .slice(0, 5);

    return { 
      levelDistribution, 
      averageProgress: avgProgress, 
      progressTimeline, 
      avgCoursesInProgress, 
      avgCertifiedCourses,
      avgTimeFormatted,
      topCourses,
      routeAdherenceData,
      userScatterData,
      courseDistributionByRouteType,
      topIACourses,
      topOtherCourses,
      topNoRouteCourses,
      companiesWithUsers,
      companiesIACourseConsumption,
      companiesOutsideRouteConsumption,
      dateRange: dateRange || { start: '', end: '' } 
    };
  }, [filteredData, dateRange]);

  // Business Environment Tab Data  
  const businessEnvironmentData = useMemo(() => {
    const { empresas: filteredEmpresas, camaras: filteredCamaras, platziGeneral: filteredPlatzi, solicitudes: filteredSolicitudes } = filteredData;
    const totalCompanies = filteredEmpresas.length;

    // Calculate real chamber ranking based on empresa assignments
    const chamberRanking = filteredCamaras.map(camara => {
      // Count companies assigned to this chamber
      const companiesInChamber = filteredEmpresas.filter(e => e.camara_id === camara.id);
      const companiesCount = companiesInChamber.length;
      
      // Get NITs of companies in this chamber
      const chamberNits = companiesInChamber.map(e => e.nit);
      
      // Get emails of solicitudes from these companies
      const chamberEmails = filteredSolicitudes
        .filter(s => chamberNits.includes(s.nit_empresa))
        .map(s => s.email);
      
      // Calculate average progress for users from this chamber
      const chamberPlatziUsers = filteredPlatzi.filter(p => chamberEmails.includes(p.email));
      const avgProgress = chamberPlatziUsers.length > 0
        ? chamberPlatziUsers
            .filter(p => p.progreso_ruta && p.progreso_ruta > 0)
            .reduce((sum, p) => sum + (p.progreso_ruta || 0), 0) / 
          chamberPlatziUsers.filter(p => p.progreso_ruta && p.progreso_ruta > 0).length
        : 0;
      
      return {
        chamber: camara.nombre,
        companies: companiesCount,
        avgProgress: Math.round(avgProgress)
      };
    }).filter(c => c.companies > 0) // Only show chambers with companies
      .sort((a, b) => b.companies - a.companies); // Sort by number of companies descending

    // Calculate real metrics from empresas data
    const totalEmployees = filteredEmpresas.reduce((sum, e) => sum + (e.num_colaboradores || 0), 0);
    const totalFemaleEmployees = filteredEmpresas.reduce((sum, e) => sum + (e.mujeres_colaboradoras || 0), 0);
    const avgEmployees = filteredEmpresas.length > 0 ? totalEmployees / filteredEmpresas.length : 0;
    const femaleEmployeesPercentage = totalEmployees > 0 ? (totalFemaleEmployees / totalEmployees) * 100 : 0;

    // Calculate average profits from utilidades_2024 (dividido por 100)
    const validProfits = filteredEmpresas.filter(e => e.utilidades_2024 != null);
    const avgProfits = validProfits.length > 0 
      ? validProfits.reduce((sum, e) => sum + ((e.utilidades_2024 || 0) / 100), 0) / validProfits.length 
      : 0;

    // Calculate average sales (dividido por 100)
    const validSales = filteredEmpresas.filter(e => e.ventas_2024 != null);
    const avgSales = validSales.length > 0 
      ? validSales.reduce((sum, e) => sum + ((e.ventas_2024 || 0) / 100), 0) / validSales.length 
      : 0;

    // Calculate AI adoption rate
    const companiesWithAIDecision = filteredEmpresas.filter(e => e.decision_adoptar_ia === 'Sí');
    const aiAdoptionRate = filteredEmpresas.length > 0 
      ? (companiesWithAIDecision.length / filteredEmpresas.length) * 100 
      : 0;

    // Calculate AI investment 2024
    const companiesInvestedIA = filteredEmpresas.filter(e => e.invirtio_ia_2024 === 'Sí' && e.monto_inversion_2024 != null);
    const totalAIInvestment2024 = companiesInvestedIA.reduce((sum, e) => sum + (e.monto_inversion_2024 || 0), 0);
    const avgAIInvestment2024 = companiesInvestedIA.length > 0 
      ? totalAIInvestment2024 / companiesInvestedIA.length 
      : 0;

    // Calculate future outlook (12 months projection)
    const companiesWithAdoptionProb = filteredEmpresas.filter(e => (e as any).probabilidad_adopcion_12m != null);
    const avgAdoptionProbability = companiesWithAdoptionProb.length > 0
      ? companiesWithAdoptionProb.reduce((sum, e) => sum + ((e as any).probabilidad_adopcion_12m || 0), 0) / companiesWithAdoptionProb.length
      : 0;

    const companiesWithInvestmentProb = filteredEmpresas.filter(e => (e as any).probabilidad_inversion_12m != null);
    const avgInvestmentProbability = companiesWithInvestmentProb.length > 0
      ? companiesWithInvestmentProb.reduce((sum, e) => sum + ((e as any).probabilidad_inversion_12m || 0), 0) / companiesWithInvestmentProb.length
      : 0;

    const companiesWithProjectedInvestment = filteredEmpresas.filter(e => (e as any).monto_invertir_12m != null && (e as any).monto_invertir_12m > 0);
    const totalProjectedInvestment = companiesWithProjectedInvestment.reduce((sum, e) => sum + ((e as any).monto_invertir_12m || 0), 0);
    const avgProjectedInvestment = companiesWithProjectedInvestment.length > 0
      ? totalProjectedInvestment / companiesWithProjectedInvestment.length
      : 0;

    // Generate placeholder data for charts (to be calculated from real data later)
    const companiesByType = [{ name: 'SAS', value: 60, color: 'hsl(262, 83%, 58%)' }, { name: 'LTDA', value: 30, color: 'hsl(221, 83%, 53%)' }, { name: 'SA', value: 10, color: 'hsl(142, 76%, 36%)' }];
    const sectorDistribution = [{ name: 'Tecnología', value: 40, color: 'hsl(262, 83%, 58%)' }, { name: 'Comercio', value: 35, color: 'hsl(221, 83%, 53%)' }, { name: 'Servicios', value: 25, color: 'hsl(142, 76%, 36%)' }];
    const clientTypeDistribution = [{ name: 'B2B', value: 60, color: 'hsl(262, 83%, 58%)' }, { name: 'B2C', value: 40, color: 'hsl(221, 83%, 53%)' }];
    const marketReach = [{ market: 'Local', companies: 120 }, { market: 'Nacional', companies: 80 }, { market: 'Internacional', companies: 40 }];

    return {
      totalCompanies, 
      companiesByType, 
      avgEmployees, 
      femaleEmployeesPercentage, 
      chamberRanking, 
      sectorDistribution, 
      clientTypeDistribution, 
      marketReach,
      avgSales, 
      avgProfits,
      aiAdoptionRate,
      aiImplementationAreas: [{ name: 'Atención al Cliente', value: 40, color: 'hsl(262, 83%, 58%)' }, { name: 'Análisis de Datos', value: 35, color: 'hsl(221, 83%, 53%)' }],
      nonAdoptionReasons: [{ name: 'Falta recursos', value: 50, color: 'hsl(346, 87%, 43%)' }, { name: 'No conocimiento', value: 30, color: 'hsl(35, 91%, 62%)' }],
      aiInvestment2024: { 
        average: avgAIInvestment2024, 
        total: totalAIInvestment2024 
      },
      futureOutlook: { 
        avgAdoptionProbability, 
        avgInvestmentProbability, 
        avgProjectedInvestment, 
        totalProjectedInvestment 
      }
    };
  }, [filteredData]);

  return { loading, overallVisionData, usageData, businessEnvironmentData };
}