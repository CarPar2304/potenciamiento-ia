import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { BookOpen, Award, Calendar, Clock, Eye } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

interface UsageTabProps {
  data: {
    levelDistribution: Array<{ level: string; companies: number; percentage: number }>;
    averageProgress: number;
    progressTimeline: Array<{ date: string; progress: number }>;
    avgCoursesInProgress: number;
    avgCertifiedCourses: number;
    avgTimeFormatted: string;
    topCourses: Array<{ name: string; views: number; avgProgress: number }>;
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
            <BarChart data={data.topCourses} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis 
                dataKey="name" 
                type="category" 
                width={200} 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => value.length > 25 ? `${value.substring(0, 25)}...` : value}
              />
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
                radius={[0, 4, 4, 0]}
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
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data.topCourses}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                angle={-45}
                textAnchor="end"
                height={100}
                interval={0}
                tick={{ fontSize: 10 }}
                tickFormatter={(value) => value.length > 20 ? `${value.substring(0, 20)}...` : value}
              />
              <YAxis domain={[0, 100]} />
              <Tooltip 
                formatter={(value) => [`${Number(value).toFixed(1)}%`, 'Progreso Promedio']}
                labelFormatter={(label) => `Curso: ${label}`}
              />
              <Bar 
                dataKey="avgProgress" 
                fill="hsl(262, 83%, 58%)" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}