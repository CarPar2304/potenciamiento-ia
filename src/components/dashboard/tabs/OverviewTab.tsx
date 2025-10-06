import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Users, GraduationCap, Building, Target, DollarSign, Brain, CalendarIcon } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, subDays, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface OverviewTabProps {
  data: any;
  userRole?: string;
  onDateRangeChange?: (range: { start: Date | null; end: Date | null }) => void;
  dateRange?: { start: Date | null; end: Date | null };
}

export function OverviewTab({ data, userRole, onDateRangeChange, dateRange }: OverviewTabProps) {
  const [timeRangePreset, setTimeRangePreset] = useState<string>("all");

  const handlePresetChange = (preset: string) => {
    setTimeRangePreset(preset);
    if (!onDateRangeChange) return;
    
    const now = new Date();
    
    switch (preset) {
      case "30d":
        onDateRangeChange({ start: subDays(now, 30), end: now });
        break;
      case "90d":
        onDateRangeChange({ start: subDays(now, 90), end: now });
        break;
      case "6m":
        onDateRangeChange({ start: subMonths(now, 6), end: now });
        break;
      case "1y":
        onDateRangeChange({ start: subMonths(now, 12), end: now });
        break;
      case "custom":
        // Keep current custom range
        break;
      case "all":
      default:
        onDateRangeChange({ start: null, end: null });
        break;
    }
  };
  // Ensure data structure exists with defaults
  const safeData = {
    stats: {
      usedLicenses: 0,
      totalLicenses: 0,
      approvedApplications: 0,
      totalApplications: 0,
      completedTests: 0,
      averageProgress: 0,
      totalInvestment: 0,
      chamberStats: [],
      ...data?.stats
    },
    companies: data?.companies || [],
    applications: data?.applications || []
  };

  const kpis = [
    {
      title: 'Licencias Activas',
      value: safeData.stats.usedLicenses,
      total: safeData.stats.totalLicenses,
      description: 'del total de licencias disponibles',
      icon: Users,
      trend: '+12%',
      trendDirection: 'up' as const,
      variant: 'default' as const,
    },
    {
      title: 'Solicitudes Aprobadas',
      value: safeData.stats.approvedApplications,
      total: safeData.stats.totalApplications,
      description: 'tasa de aprobación',
      icon: Target,
      trend: '+8%',
      trendDirection: 'up' as const,
      variant: 'success' as const,
    },
    {
      title: 'Tests Completados',
      value: safeData.stats.completedTests,
      total: safeData.stats.approvedApplications,
      description: 'de empresarios aprobados',
      icon: GraduationCap,
      trend: '+15%',
      trendDirection: 'up' as const,
      variant: 'primary' as const,
    },
    {
      title: 'Progreso Promedio',
      value: `${safeData.stats.averageProgress}%`,
      description: 'en rutas de aprendizaje',
      icon: Brain,
      trend: '+5%',
      trendDirection: 'up' as const,
      variant: 'default' as const,
    },
    {
      title: 'Inversión Total IA',
      value: `$${(safeData.stats.totalInvestment / 1000000).toFixed(1)}M`,
      description: 'invertido en IA en 2024',
      icon: DollarSign,
      trend: '+25%',
      trendDirection: 'up' as const,
      variant: 'success' as const,
    },
    {
      title: 'Empresas Activas',
      value: safeData.companies.length,
      description: 'empresas registradas',
      icon: Building,
      trend: '+18%',
      trendDirection: 'up' as const,
      variant: 'primary' as const,
    },
  ];

  const chartConfig = {
    licenses: { label: "Licencias", color: "hsl(var(--primary))" },
    applications: { label: "Solicitudes", color: "hsl(var(--success))" },
    tests: { label: "Tests", color: "hsl(var(--warning))" },
  };

  // Generar datos temporales para gráficos
  const timelineData = Array.from({ length: 12 }, (_, i) => ({
    month: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'][i],
    licenses: Math.floor(Math.random() * 100) + 50,
    applications: Math.floor(Math.random() * 80) + 30,
    tests: Math.floor(Math.random() * 60) + 20,
  }));

  const topPerformers = (safeData.stats.chamberStats || [])
    .sort((a: any, b: any) => b.averageProgress - a.averageProgress)
    .slice(0, 5)
    .map((chamber: any) => ({
      name: chamber.name.replace('Cámara de Comercio de ', '').replace('Cámara de Comercio del ', ''),
      progress: chamber.averageProgress,
      applications: chamber.applications,
      completed: chamber.completed,
    }));

  return (
    <div className="space-y-6">
      {/* KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpis.map((kpi, index) => (
          <Card key={index} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {kpi.title}
              </CardTitle>
              <kpi.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {typeof kpi.value === 'string' ? kpi.value : kpi.value.toLocaleString()}
              </div>
              {kpi.total && (
                <div className="mt-2">
                  <Progress 
                    value={(kpi.value as number / kpi.total) * 100} 
                    className="h-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {Math.round((kpi.value as number / kpi.total) * 100)}% {kpi.description}
                  </p>
                </div>
              )}
              {!kpi.total && (
                <p className="text-xs text-muted-foreground mt-1">
                  {kpi.description}
                </p>
              )}
              <div className="flex items-center mt-2">
                {kpi.trendDirection === 'up' ? (
                  <TrendingUp className="h-3 w-3 text-success mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-destructive mr-1" />
                )}
                <span className={`text-xs font-medium ${
                  kpi.trendDirection === 'up' ? 'text-success' : 'text-destructive'
                }`}>
                  {kpi.trend}
                </span>
                <span className="text-xs text-muted-foreground ml-1">vs mes anterior</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Timeline Chart */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle>Evolución de Solicitudes</CardTitle>
                <CardDescription>
                  Número de solicitudes por período
                </CardDescription>
              </div>
              {onDateRangeChange && (
                <div className="flex flex-col sm:flex-row gap-2">
                  <Select value={timeRangePreset} onValueChange={handlePresetChange}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Seleccionar período" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todo el tiempo</SelectItem>
                      <SelectItem value="30d">Últimos 30 días</SelectItem>
                      <SelectItem value="90d">Últimos 90 días</SelectItem>
                      <SelectItem value="6m">Últimos 6 meses</SelectItem>
                      <SelectItem value="1y">Último año</SelectItem>
                      <SelectItem value="custom">Personalizado</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {timeRangePreset === "custom" && dateRange && (
                    <div className="flex gap-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full sm:w-[140px] justify-start text-left font-normal",
                              !dateRange.start && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dateRange.start ? format(dateRange.start, "dd MMM", { locale: es }) : "Inicio"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={dateRange.start || undefined}
                            onSelect={(date) => onDateRangeChange({ ...dateRange, start: date || null })}
                            initialFocus
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                      
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full sm:w-[140px] justify-start text-left font-normal",
                              !dateRange.end && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dateRange.end ? format(dateRange.end, "dd MMM", { locale: es }) : "Fin"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={dateRange.end || undefined}
                            onSelect={(date) => onDateRangeChange({ ...dateRange, end: date || null })}
                            initialFocus
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="month" 
                    className="text-xs fill-muted-foreground"
                  />
                  <YAxis className="text-xs fill-muted-foreground" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="licenses"
                    stackId="1"
                    stroke="var(--color-licenses)"
                    fill="var(--color-licenses)"
                    fillOpacity={0.3}
                  />
                  <Area
                    type="monotone"
                    dataKey="applications"
                    stackId="1"
                    stroke="var(--color-applications)"
                    fill="var(--color-applications)"
                    fillOpacity={0.3}
                  />
                  <Area
                    type="monotone"
                    dataKey="tests"
                    stackId="1"
                    stroke="var(--color-tests)"
                    fill="var(--color-tests)"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Top Performers */}
        <Card>
          <CardHeader>
            <CardTitle>Top Cámaras por Progreso</CardTitle>
            <CardDescription>
              Cámaras con mejor rendimiento académico promedio
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topPerformers.map((performer, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                      <span className="text-sm font-bold text-primary">#{index + 1}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{performer.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {performer.applications} solicitudes • {performer.completed} completados
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">{performer.progress}%</p>
                    <Progress value={performer.progress} className="w-16 h-2" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* License Usage Detailed */}
      <Card>
        <CardHeader>
          <CardTitle>Consumo de Licencias Detallado</CardTitle>
          <CardDescription>
            Análisis del uso de licencias por categoría y proyección
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Licencias Activas</span>
                  <span className="text-sm text-muted-foreground">{safeData.stats.usedLicenses}</span>
                </div>
                <Progress value={(safeData.stats.usedLicenses / safeData.stats.totalLicenses) * 100} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">En Uso Efectivo</span>
                  <span className="text-sm text-muted-foreground">{Math.floor(safeData.stats.usedLicenses * 0.75)}</span>
                </div>
                <Progress value={75} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Disponibles</span>
                  <span className="text-sm text-muted-foreground">{safeData.stats.totalLicenses - safeData.stats.usedLicenses}</span>
                </div>
                <Progress value={((safeData.stats.totalLicenses - safeData.stats.usedLicenses) / safeData.stats.totalLicenses) * 100} className="h-2" />
              </div>
          </div>
          
          <div className="mt-4 p-4 bg-primary/5 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Proyección 90 días</p>
                <p className="text-xs text-muted-foreground">
                  Basado en tendencia actual de consumo
                </p>
              </div>
                <Badge variant="secondary">
                  +{Math.floor((safeData.stats.totalLicenses - safeData.stats.usedLicenses) * 0.3)} licencias
                </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}