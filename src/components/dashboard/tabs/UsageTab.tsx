import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Award, Calendar, Clock, Eye } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, PieChart, Pie, Cell, ScatterChart, Scatter, ZAxis, Legend } from 'recharts';

interface UsageTabProps {
  data: {
    levelDistribution: Array<{ level: string; companies: number; percentage: number }>;
    averageProgress: number;
    progressTimeline: Array<{ date: string; progress: number }>;
    avgCoursesInProgress: number;
    avgCertifiedCourses: number;
    avgTimeFormatted: string;
    topCourses: Array<{ name: string; views: number; avgProgress: number }>;
    routeAdherenceData: Array<{ name: string; value: number; percentage: number }>;
    userScatterData: Array<{ name: string; progressInRoute: number; certifiedCourses: number }>;
    avgProgressByLevel: Array<{ level: string; avgProgress: number }>;
    dateRange: {
      start: string;
      end: string;
    };
  };
  onDateRangeChange: (range: { start: string; end: string }) => void;
}

export function UsageTab({ data, onDateRangeChange }: UsageTabProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState('all');

  const handleTimeframeChange = (value: string) => {
    setSelectedTimeframe(value);
    const now = new Date();
    let start = '';
    
    switch (value) {
      case '30d':
        start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        break;
      case '90d':
        start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        break;
      case '6m':
        start = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        break;
      case '1y':
        start = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        break;
      default:
        start = '';
    }
    
    onDateRangeChange({ 
      start, 
      end: now.toISOString().split('T')[0] 
    });
  };

  const COLORS = ['hsl(262, 83%, 58%)', 'hsl(221, 83%, 53%)', 'hsl(142, 76%, 36%)', 'hsl(346, 87%, 43%)', 'hsl(35, 91%, 62%)', 'hsl(196, 75%, 88%)'];

  return (
    <div className="space-y-6">
      {/* KPIs de Uso */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progreso Promedio</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.averageProgress.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Progreso en rutas de aprendizaje
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cursos en Progreso</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.avgCoursesInProgress.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">
              Promedio por usuario
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cursos Certificados</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.avgCertifiedCourses.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">
              Promedio por usuario
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tiempo Invertido</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.avgTimeFormatted}</div>
            <p className="text-xs text-muted-foreground">
              Promedio por usuario
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Anillo por Niveles */}
      <Card>
        <CardHeader>
          <CardTitle>Distribución por Niveles de IA</CardTitle>
          <CardDescription>Empresas por nivel de competencia en IA</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={data.levelDistribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                paddingAngle={5}
                dataKey="companies"
                label={({ level, percentage }) => `${level}: ${percentage.toFixed(1)}%`}
              >
                {data.levelDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value, name, props) => [
                  `${value} empresas (${props.payload.percentage.toFixed(1)}%)`,
                  'Empresas'
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Progreso a lo Largo del Tiempo */}
      <Card>
        <CardHeader>
          <CardTitle>Progreso Promedio en el Tiempo</CardTitle>
          <CardDescription>Evolución del progreso en rutas de aprendizaje</CardDescription>
          <div className="flex items-center space-x-4">
            <Label htmlFor="timeframe">Período:</Label>
            <Select value={selectedTimeframe} onValueChange={handleTimeframeChange}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Seleccionar período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todo el tiempo</SelectItem>
                <SelectItem value="30d">Últimos 30 días</SelectItem>
                <SelectItem value="90d">Últimos 90 días</SelectItem>
                <SelectItem value="6m">Últimos 6 meses</SelectItem>
                <SelectItem value="1y">Último año</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.progressTimeline}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 100]} />
              <Tooltip 
                formatter={(value) => [`${Number(value).toFixed(1)}%`, 'Progreso Promedio']}
                labelFormatter={(label) => `Fecha: ${label}`}
              />
              <Line 
                type="monotone" 
                dataKey="progress" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: "hsl(var(--primary))", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top 10 Cursos Más Vistos */}
      <Card>
        <CardHeader>
          <CardTitle>Top 10 Cursos Más Vistos</CardTitle>
          <CardDescription>Cursos con mayor número de visualizaciones</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data.topCourses} margin={{ bottom: 100 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                type="category"
                angle={-45}
                textAnchor="end"
                height={120}
                interval={0}
                tick={{ fontSize: 11 }}
                tickFormatter={(value) => value.length > 30 ? `${value.substring(0, 30)}...` : value}
              />
              <YAxis type="number" />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'views' ? `${value} visualizaciones` : `${Number(value).toFixed(1)}% progreso promedio`,
                  name === 'views' ? 'Visualizaciones' : 'Progreso Promedio'
                ]}
                labelFormatter={(label) => `Curso: ${label}`}
              />
              <Bar 
                dataKey="views" 
                fill="hsl(var(--primary))" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Progreso Promedio por Curso */}
      <Card>
        <CardHeader>
          <CardTitle>Progreso Promedio por Curso</CardTitle>
          <CardDescription>Porcentaje de avance promedio en cada curso del Top 10</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.topCourses.map((course, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium truncate pr-4" title={course.name}>
                    {course.name.length > 60 ? `${course.name.substring(0, 60)}...` : course.name}
                  </span>
                  <span className="text-sm font-bold text-primary whitespace-nowrap">
                    {course.avgProgress.toFixed(1)}%
                  </span>
                </div>
                <Progress value={course.avgProgress} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sección: Adherencia a la Ruta de IA */}
      <div className="col-span-full">
        <h3 className="text-xl font-bold mb-4">Adherencia a la Ruta de IA</h3>
      </div>

      {/* Gráfico 1: Adherencia a la Ruta (Donut Chart) */}
      <Card>
        <CardHeader>
          <CardTitle>Distribución de Estudio: Ruta vs Exploración Libre</CardTitle>
          <CardDescription>Porcentaje del estudio en la ruta recomendada vs cursos fuera de ruta</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={data.routeAdherenceData}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={140}
                paddingAngle={5}
                dataKey="value"
                label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
              >
                <Cell fill="hsl(142, 76%, 36%)" />
                <Cell fill="hsl(35, 91%, 62%)" />
              </Pie>
              <Tooltip 
                formatter={(value, name, props) => [
                  `${value} cursos (${props.payload.percentage.toFixed(1)}%)`,
                  props.payload.name
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Gráfico 2: Evangelizadores vs Exploradores (Scatter Plot) */}
      <Card>
        <CardHeader>
          <CardTitle>Evangelizadores de la Ruta vs Exploradores</CardTitle>
          <CardDescription>
            Usuarios que siguen la ruta y certifican mucho vs usuarios que exploran libremente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={500}>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                type="number" 
                dataKey="progressInRoute" 
                name="Progreso en Ruta" 
                unit="%" 
                label={{ value: 'Progreso en Ruta Asignada (%)', position: 'bottom', offset: 0 }}
              />
              <YAxis 
                type="number" 
                dataKey="certifiedCourses" 
                name="Cursos Certificados"
                label={{ value: 'Cursos Certificados Totales', angle: -90, position: 'left' }}
              />
              <ZAxis range={[60, 400]} />
              <Tooltip 
                cursor={{ strokeDasharray: '3 3' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
                        <p className="font-semibold text-sm mb-1">{data.name}</p>
                        <p className="text-xs">Progreso en Ruta: {data.progressInRoute.toFixed(1)}%</p>
                        <p className="text-xs">Cursos Certificados: {data.certifiedCourses}</p>
                        <p className="text-xs mt-2 text-muted-foreground">
                          {data.progressInRoute > 50 && data.certifiedCourses > 3 
                            ? '✨ Evangelizador de la Ruta' 
                            : data.certifiedCourses > 3 
                            ? '🔍 Explorador Activo' 
                            : '🌱 En Desarrollo'}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Scatter 
                data={data.userScatterData} 
                fill="hsl(262, 83%, 58%)" 
                fillOpacity={0.6}
                shape="circle"
              />
              {/* Reference lines for quadrants */}
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="hsl(var(--border))"
                vertical={false}
              />
            </ScatterChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[hsl(142,76%,36%)]" />
              <span>✨ Evangelizadores: Alto progreso en ruta + Muchos certificados</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[hsl(35,91%,62%)]" />
              <span>🔍 Exploradores: Muchos certificados + Bajo progreso en ruta</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gráfico 3: Avance Promedio por Nivel de IA (Horizontal Bar Chart) */}
      <Card>
        <CardHeader>
          <CardTitle>Avance Promedio por Nivel de IA</CardTitle>
          <CardDescription>
            Progreso promedio de usuarios en cada nivel de la ruta de aprendizaje
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={Math.max(300, data.avgProgressByLevel.length * 60)}>
            <BarChart 
              data={data.avgProgressByLevel} 
              layout="vertical"
              margin={{ top: 5, right: 30, left: 150, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                type="number" 
                domain={[0, 100]}
                label={{ value: 'Progreso Promedio (%)', position: 'bottom', offset: 0 }}
              />
              <YAxis 
                type="category" 
                dataKey="level" 
                width={140}
                tick={{ fontSize: 12 }}
              />
              <Tooltip 
                formatter={(value) => [`${Number(value).toFixed(1)}%`, 'Progreso Promedio']}
                labelFormatter={(label) => `Nivel: ${label}`}
              />
              <Bar 
                dataKey="avgProgress" 
                fill="hsl(262, 83%, 58%)" 
                radius={[0, 4, 4, 0]}
                label={{ 
                  position: 'right', 
                  formatter: (value: number) => `${value.toFixed(1)}%`,
                  fontSize: 11 
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}