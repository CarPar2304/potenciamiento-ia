import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Users, GraduationCap, Building, Target, DollarSign, Brain } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

interface OverviewTabProps {
  data: any;
  userRole: string;
}

export function OverviewTab({ data, userRole }: OverviewTabProps) {
  const kpis = [
    {
      title: 'Licencias Activas',
      value: data.stats.usedLicenses,
      total: data.stats.totalLicenses,
      description: 'del total de licencias disponibles',
      icon: Users,
      trend: '+12%',
      trendDirection: 'up' as const,
      variant: 'default' as const,
    },
    {
      title: 'Solicitudes Aprobadas',
      value: data.stats.approvedApplications,
      total: data.stats.totalApplications,
      description: 'tasa de aprobación',
      icon: Target,
      trend: '+8%',
      trendDirection: 'up' as const,
      variant: 'success' as const,
    },
    {
      title: 'Tests Completados',
      value: data.stats.completedTests,
      total: data.stats.approvedApplications,
      description: 'de empresarios aprobados',
      icon: GraduationCap,
      trend: '+15%',
      trendDirection: 'up' as const,
      variant: 'primary' as const,
    },
    {
      title: 'Progreso Promedio',
      value: `${data.stats.averageProgress}%`,
      description: 'en rutas de aprendizaje',
      icon: Brain,
      trend: '+5%',
      trendDirection: 'up' as const,
      variant: 'default' as const,
    },
    {
      title: 'Inversión Total IA',
      value: `$${(data.stats.totalInvestment / 1000000).toFixed(1)}M`,
      description: 'invertido en IA en 2024',
      icon: DollarSign,
      trend: '+25%',
      trendDirection: 'up' as const,
      variant: 'success' as const,
    },
    {
      title: 'Empresas Activas',
      value: data.companies.length,
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

  const topPerformers = data.stats.chamberStats
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
            <CardTitle>Evolución Mensual</CardTitle>
            <CardDescription>
              Progreso del programa a lo largo del año
            </CardDescription>
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
                <span className="text-sm text-muted-foreground">{data.stats.usedLicenses}</span>
              </div>
              <Progress value={(data.stats.usedLicenses / data.stats.totalLicenses) * 100} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">En Uso Efectivo</span>
                <span className="text-sm text-muted-foreground">{Math.floor(data.stats.usedLicenses * 0.75)}</span>
              </div>
              <Progress value={75} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Disponibles</span>
                <span className="text-sm text-muted-foreground">{data.stats.totalLicenses - data.stats.usedLicenses}</span>
              </div>
              <Progress value={((data.stats.totalLicenses - data.stats.usedLicenses) / data.stats.totalLicenses) * 100} className="h-2" />
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
                +{Math.floor((data.stats.totalLicenses - data.stats.usedLicenses) * 0.3)} licencias
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}