import { InteractiveChart } from '../InteractiveChart';
import { ExecutiveKPI } from '../ExecutiveKPI';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  GraduationCap, 
  Clock, 
  Award, 
  Users, 
  TrendingUp,
  BookOpen,
  Target,
  Star
} from 'lucide-react';

interface PlatziPerformanceTabProps {
  data: {
    levelChart: any[];
    chamberProgress: any[];
    engagementData: any[];
    timelineData: any[];
    totalUsers: number;
    activeUsers: number;
    avgProgressOverall: number;
  };
  kpis: {
    avgProgress: number;
    totalCertificates: number;
    totalHoursStudied: number;
    activeUsers: number;
  };
}

export function PlatziPerformanceTab({ data, kpis }: PlatziPerformanceTabProps) {
  const chartConfig = {
    level1: { label: "Nivel 1", color: "hsl(var(--destructive))" },
    level2: { label: "Nivel 2", color: "hsl(var(--warning))" },
    level3: { label: "Nivel 3", color: "hsl(var(--muted))" },
    level4: { label: "Nivel 4", color: "hsl(var(--primary))" },
    level5: { label: "Nivel 5", color: "hsl(var(--success))" },
    level6: { label: "Nivel 6", color: "hsl(280 73% 62%)" },
    progress: { label: "Progreso", color: "hsl(var(--primary))" },
    timeSpent: { label: "Tiempo (hrs)", color: "hsl(var(--success))" },
    certificates: { label: "Certificados", color: "hsl(var(--warning))" },
    newUsers: { label: "Nuevos usuarios", color: "hsl(var(--accent-foreground))" },
    count: { label: "Usuarios", color: "hsl(var(--primary))" },
    users: { label: "Usuarios", color: "hsl(var(--muted))" }
  };

  const topPerformers = data.chamberProgress
    .sort((a, b) => b.progress - a.progress)
    .slice(0, 5);

  const graduationProjections = [
    { month: '3 meses', users: Math.floor(data.totalUsers * 0.15), percentage: 15 },
    { month: '6 meses', users: Math.floor(data.totalUsers * 0.35), percentage: 35 },
    { month: '9 meses', users: Math.floor(data.totalUsers * 0.65), percentage: 65 },
    { month: '12 meses', users: Math.floor(data.totalUsers * 0.85), percentage: 85 }
  ];

  const engagementInsights = [
    {
      metric: 'Retención semanal',
      value: '78%',
      trend: 'up',
      description: 'Usuarios activos por semana'
    },
    {
      metric: 'Tiempo promedio por sesión',
      value: '45min',
      trend: 'up',
      description: 'Duración promedio de estudio'
    },
    {
      metric: 'Tasa de certificación',
      value: '62%',
      trend: 'up',
      description: 'Cursos completados exitosamente'
    },
    {
      metric: 'Abandono temprano',
      value: '12%',
      trend: 'down',
      description: 'Usuarios que abandonan en la primera semana'
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Executive KPIs Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <ExecutiveKPI
          title="Progreso Promedio"
          value={kpis.avgProgress}
          format="percentage"
          icon={TrendingUp}
          trend="up"
          trendValue="+8.5%"
          subtitle="En rutas de aprendizaje"
        />
        <ExecutiveKPI
          title="Certificados Obtenidos"
          value={kpis.totalCertificates}
          format="number"
          icon={Award}
          trend="up"
          trendValue="+127"
          subtitle="Cursos completados"
        />
        <ExecutiveKPI
          title="Horas de Estudio"
          value={Math.round(kpis.totalHoursStudied)}
          format="number"
          icon={Clock}
          trend="up"
          trendValue="+456h"
          subtitle="Tiempo total dedicado"
        />
        <ExecutiveKPI
          title="Usuarios Activos"
          value={kpis.activeUsers}
          format="number"
          icon={Users}
          trend="up"
          trendValue="+23"
          subtitle="Con licencias activas"
        />
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InteractiveChart
          title="Distribución por Niveles de IA"
          description="Número de empresarios por cada nivel de IA asignado (1-6)"
          data={data.levelChart}
          type="bar"
          config={chartConfig}
          xAxisKey="level"
          yAxisKey="count"
          onDataPointClick={(data) => console.log('Level selected:', data)}
        />

        <InteractiveChart
          title="Evolución Temporal del Programa"
          description="Progreso acumulado y nuevos usuarios a lo largo del tiempo"
          data={data.timelineData}
          type="area"
          config={chartConfig}
          xAxisKey="month"
          yAxisKey="progress"
          onDataPointClick={(data) => console.log('Timeline selected:', data)}
        />
      </div>

      {/* Performance Analysis Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InteractiveChart
          title="Progreso por Cámara"
          description="Porcentaje de progreso promedio en las rutas de aprendizaje"
          data={data.chamberProgress}
          type="bar"
          config={chartConfig}
          xAxisKey="name"
          yAxisKey="progress"
          onDataPointClick={(data) => console.log('Chamber progress selected:', data)}
        />

        <InteractiveChart
          title="Métricas de Participación por Nivel"
          description="Tiempo dedicado y certificaciones obtenidas por nivel"
          data={data.engagementData}
          type="bar"
          config={chartConfig}
          xAxisKey="level"
          yAxisKey={['timeSpent', 'certificates']}
          onDataPointClick={(data) => console.log('Engagement selected:', data)}
        />
      </div>

      {/* Analysis Cards Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Performers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-warning" />
              Top 5 Cámaras
            </CardTitle>
            <CardDescription>
              Ranking por progreso promedio
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {topPerformers.map((chamber, index) => (
              <div key={chamber.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      #{index + 1}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium line-clamp-1">
                      {chamber.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {chamber.users} usuarios
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant={index === 0 ? 'default' : 'secondary'}>
                    {chamber.progress}%
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Graduation Projections */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" />
              Proyección de Graduación
            </CardTitle>
            <CardDescription>
              Estimación de completar rutas por período
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {graduationProjections.map((projection) => (
              <div key={projection.month} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{projection.month}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{projection.users}</Badge>
                    <span className="text-sm text-muted-foreground">
                      {projection.percentage}%
                    </span>
                  </div>
                </div>
                <Progress 
                  value={projection.percentage} 
                  className="h-2"
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Engagement Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-success" />
              Métricas de Engagement
            </CardTitle>
            <CardDescription>
              Indicadores clave de participación
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {engagementInsights.map((insight) => (
              <div key={insight.metric} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{insight.metric}</p>
                  <p className="text-xs text-muted-foreground">
                    {insight.description}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-primary">
                    {insight.value}
                  </div>
                  <Badge 
                    variant="outline" 
                    className={
                      insight.trend === 'up' 
                        ? 'text-success border-success/20 bg-success/10' 
                        : 'text-destructive border-destructive/20 bg-destructive/10'
                    }
                  >
                    {insight.trend === 'up' ? '↗' : '↘'}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Performance Summary */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Resumen de Rendimiento Académico
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary mb-1">
                {((kpis.totalCertificates / data.totalUsers) || 0).toFixed(1)}
              </div>
              <p className="text-sm text-muted-foreground">
                Certificados promedio por usuario
              </p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary mb-1">
                {((kpis.totalHoursStudied / data.totalUsers) || 0).toFixed(0)}h
              </div>
              <p className="text-sm text-muted-foreground">
                Horas promedio por usuario
              </p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary mb-1">
                {Math.round((kpis.activeUsers / data.totalUsers) * 100)}%
              </div>
              <p className="text-sm text-muted-foreground">
                Tasa de usuarios activos
              </p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary mb-1">
                {data.levelChart.length}
              </div>
              <p className="text-sm text-muted-foreground">
                Niveles IA diferentes activos
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}