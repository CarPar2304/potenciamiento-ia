import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
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
    courseDistributionByRouteType: Array<{ name: string; value: number; percentage: number; color: string }>;
    topIACourses: Array<{ name: string; count: number; route: string }>;
    topOtherCourses: Array<{ name: string; count: number; route: string }>;
    topNoRouteCourses: Array<{ name: string; count: number }>;
    companiesWithUsers: Array<{ name: string; nit: string; users: number }>;
    companiesIACourseConsumption: Array<{ name: string; nit: string; totalCourses: number; topRoute: string; topCourse: string; topCourseCount: number }>;
    companiesOutsideRouteConsumption: Array<{ name: string; nit: string; totalCourses: number; topCourse: string; topCourseCount: number }>;
    chamberCourseConsumption: Array<{ chamber: string; totalCourses: number; topCourses: Array<{ curso: string; count: number; totalTime: number }> }>;
    chamberRouteConsumption: Array<{ chamber: string; totalCourses: number; topRoutes: Array<{ ruta: string; count: number; totalTime: number }> }>;
    dateRange: {
      start: string;
      end: string;
    };
    userTypeFilter?: string;
    chamberFilter?: string;
    availableChambers?: Array<{ id: string; nombre: string }>;
  };
  onDateRangeChange: (range: { start: string; end: string; userTypeFilter?: string; chamberFilter?: string }) => void;
}

export function UsageTab({ data, onDateRangeChange }: UsageTabProps) {
  // Estados para controlar visibilidad de detalles
  const [showIACoursesDetails, setShowIACoursesDetails] = useState(false);
  const [showOtherCoursesDetails, setShowOtherCoursesDetails] = useState(false);
  const [showNoRouteCoursesDetails, setShowNoRouteCoursesDetails] = useState(false);
  const [showCompaniesUsersDetails, setShowCompaniesUsersDetails] = useState(false);
  const [showCompaniesIADetails, setShowCompaniesIADetails] = useState(false);
  const [showCompaniesOutsideDetails, setShowCompaniesOutsideDetails] = useState(false);
  const [showChamberCoursesDetails, setShowChamberCoursesDetails] = useState(false);
  const [showChamberRoutesDetails, setShowChamberRoutesDetails] = useState(false);
  
  // Calculate initial and dynamic max for Y axis
  const calculateMaxYAxis = () => {
    if (data.userScatterData.length === 0) return 20;
    const maxCertified = Math.max(...data.userScatterData.map(u => u.certifiedCourses), 10);
    return Math.ceil(maxCertified * 1.2); // 20% more than max value
  };
  
  const [maxYAxis, setMaxYAxis] = useState(calculateMaxYAxis());

  // Update max Y axis when data changes
  useEffect(() => {
    const newMax = calculateMaxYAxis();
    setMaxYAxis(newMax);
  }, [data.userScatterData]);

  const COLORS = ['hsl(262, 83%, 58%)', 'hsl(221, 83%, 53%)', 'hsl(142, 76%, 36%)', 'hsl(346, 87%, 43%)', 'hsl(35, 91%, 62%)', 'hsl(196, 75%, 88%)'];

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="chamber">Cámara de Comercio</Label>
              <Select 
                value={data.chamberFilter || 'all'} 
                onValueChange={(value) => onDateRangeChange({ 
                  start: data.dateRange.start,
                  end: data.dateRange.end,
                  userTypeFilter: data.userTypeFilter || 'all',
                  chamberFilter: value 
                })}
              >
                <SelectTrigger id="chamber">
                  <SelectValue placeholder="Seleccionar cámara" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las cámaras</SelectItem>
                  {data.availableChambers?.map((chamber) => (
                    <SelectItem key={chamber.id} value={chamber.id}>
                      {chamber.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="userType">Tipo de usuario</Label>
              <Select 
                value={data.userTypeFilter || 'all'} 
                onValueChange={(value) => onDateRangeChange({ 
                  start: data.dateRange.start,
                  end: data.dateRange.end,
                  userTypeFilter: value,
                  chamberFilter: data.chamberFilter || 'all'
                })}
              >
                <SelectTrigger id="userType">
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los usuarios</SelectItem>
                  <SelectItem value="empresarios">Solo Empresarios</SelectItem>
                  <SelectItem value="colaboradores">Solo Colaboradores</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
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

      {/* Distribución de Estudio: Ruta vs Exploración Libre */}
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

      {/* Progreso a lo Largo del Tiempo */}
      <Card>
        <CardHeader>
          <CardTitle>Progreso Promedio en el Tiempo</CardTitle>
          <CardDescription>Evolución del progreso en rutas de aprendizaje</CardDescription>
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

      {/* Evangelizadores vs Exploradores (Scatter Plot) */}
      <Card>
        <CardHeader>
          <CardTitle>Evangelizadores de la Ruta vs Exploradores</CardTitle>
          <CardDescription>
            Usuarios que siguen la ruta y certifican mucho vs usuarios que exploran libremente
          </CardDescription>
          <div className="flex items-center gap-4 mt-4">
            <Label htmlFor="max-y-axis" className="whitespace-nowrap">
              Máximo Eje Y (cursos):
            </Label>
            <Input
              id="max-y-axis"
              type="number"
              min={5}
              max={100}
              value={maxYAxis}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '') {
                  setMaxYAxis(5);
                } else {
                  const numValue = parseInt(value);
                  if (!isNaN(numValue) && numValue >= 5) {
                    setMaxYAxis(numValue);
                  }
                }
              }}
              className="w-24"
            />
          </div>
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
                domain={[0, maxYAxis]}
                allowDataOverflow={true}
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

      {/* Gráfico 3: Distribución del Consumo de Cursos por Tipo de Ruta */}
      <Card>
        <CardHeader>
          <CardTitle>Distribución del Consumo de Cursos por Tipo de Ruta</CardTitle>
          <CardDescription>
            Detalle del consumo por cada ruta específica de aprendizaje
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={500}>
            <PieChart>
              <Pie
                data={data.courseDistributionByRouteType}
                cx="50%"
                cy="50%"
                innerRadius={100}
                outerRadius={180}
                paddingAngle={2}
                dataKey="value"
                label={({ percentage }) => percentage > 3 ? `${percentage.toFixed(1)}%` : ''}
              >
                {data.courseDistributionByRouteType.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value, name, props) => [
                  `${value} cursos (${props.payload.percentage.toFixed(1)}%)`,
                  props.payload.name
                ]}
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Legend 
                layout="vertical" 
                align="right" 
                verticalAlign="middle"
                iconType="circle"
                wrapperStyle={{ maxHeight: '400px', overflowY: 'auto', paddingLeft: '20px' }}
              />
            </PieChart>
          </ResponsiveContainer>
          
          {/* Tabla resumen de rutas */}
          <div className="mt-6 space-y-2">
            <h4 className="font-semibold text-sm mb-3">Detalle por Ruta:</h4>
            <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto">
              {data.courseDistributionByRouteType.map((route, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-2 rounded-md border border-border/50 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div 
                      className="w-3 h-3 rounded-full flex-shrink-0" 
                      style={{ backgroundColor: route.color }}
                    />
                    <span className="text-sm truncate" title={route.name}>
                      {route.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <span className="text-sm font-medium">
                      {route.value} cursos
                    </span>
                    <span className="text-sm font-bold text-primary min-w-[50px] text-right">
                      {route.percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top 5 Cursos por Categoría */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top 5 Cursos de Rutas de IA */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top 5 Cursos - Rutas de IA</CardTitle>
            <CardDescription>Cursos más consumidos de niveles 1-6 de IA</CardDescription>
          </CardHeader>
          <CardContent>
            {data.topIACourses.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart 
                  data={data.topIACourses} 
                  layout="vertical"
                  margin={{ top: 5, right: 10, left: 5, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    width={0}
                    tick={false}
                  />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-background border border-border rounded-lg p-3 shadow-lg max-w-xs">
                            <p className="font-semibold text-sm mb-1">{data.name}</p>
                            <p className="text-xs text-muted-foreground mb-1">Ruta: {data.route}</p>
                            <p className="text-xs">Consumos: {data.count}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="count" fill="hsl(262, 83%, 58%)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground text-sm">
                No hay datos disponibles
              </div>
            )}
            
            <div className="mt-4 flex justify-center">
              <button
                onClick={() => setShowIACoursesDetails(!showIACoursesDetails)}
                className="text-xs text-primary hover:underline font-medium"
              >
                {showIACoursesDetails ? 'Ocultar detalles' : 'Ver detalles'}
              </button>
            </div>
            
            {showIACoursesDetails && (
              <div className="mt-4 space-y-2">
                {data.topIACourses.map((course, index) => (
                  <div key={index} className="text-xs space-y-1 p-2 rounded-md bg-accent/50">
                    <div className="font-medium truncate" title={course.name}>
                      {index + 1}. {course.name}
                    </div>
                    <div className="text-muted-foreground truncate" title={course.route}>
                      {course.route}
                    </div>
                    <div className="font-semibold text-primary">
                      {course.count} consumos
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top 5 Cursos de Otras Rutas */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top 5 Cursos - Otras Rutas</CardTitle>
            <CardDescription>Cursos más consumidos fuera de rutas de IA</CardDescription>
          </CardHeader>
          <CardContent>
            {data.topOtherCourses.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart 
                  data={data.topOtherCourses} 
                  layout="vertical"
                  margin={{ top: 5, right: 10, left: 5, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    width={0}
                    tick={false}
                  />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-background border border-border rounded-lg p-3 shadow-lg max-w-xs">
                            <p className="font-semibold text-sm mb-1">{data.name}</p>
                            <p className="text-xs text-muted-foreground mb-1">Ruta: {data.route}</p>
                            <p className="text-xs">Consumos: {data.count}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="count" fill="hsl(221, 83%, 53%)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground text-sm">
                No hay datos disponibles
              </div>
            )}
            
            <div className="mt-4 flex justify-center">
              <button
                onClick={() => setShowOtherCoursesDetails(!showOtherCoursesDetails)}
                className="text-xs text-primary hover:underline font-medium"
              >
                {showOtherCoursesDetails ? 'Ocultar detalles' : 'Ver detalles'}
              </button>
            </div>
            
            {showOtherCoursesDetails && (
              <div className="mt-4 space-y-2">
                {data.topOtherCourses.map((course, index) => (
                  <div key={index} className="text-xs space-y-1 p-2 rounded-md bg-accent/50">
                    <div className="font-medium truncate" title={course.name}>
                      {index + 1}. {course.name}
                    </div>
                    <div className="text-muted-foreground truncate" title={course.route}>
                      {course.route}
                    </div>
                    <div className="font-semibold text-primary">
                      {course.count} consumos
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top 5 Cursos Sin Ruta */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top 5 Cursos - Sin Ruta</CardTitle>
            <CardDescription>Cursos sueltos más consumidos</CardDescription>
          </CardHeader>
          <CardContent>
            {data.topNoRouteCourses.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart 
                  data={data.topNoRouteCourses} 
                  layout="vertical"
                  margin={{ top: 5, right: 10, left: 5, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    width={0}
                    tick={false}
                  />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-background border border-border rounded-lg p-3 shadow-lg max-w-xs">
                            <p className="font-semibold text-sm mb-1">{data.name}</p>
                            <p className="text-xs">Consumos: {data.count}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="count" fill="hsl(35, 91%, 62%)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground text-sm">
                No hay datos disponibles
              </div>
            )}
            
            <div className="mt-4 flex justify-center">
              <button
                onClick={() => setShowNoRouteCoursesDetails(!showNoRouteCoursesDetails)}
                className="text-xs text-primary hover:underline font-medium"
              >
                {showNoRouteCoursesDetails ? 'Ocultar detalles' : 'Ver detalles'}
              </button>
            </div>
            
            {showNoRouteCoursesDetails && (
              <div className="mt-4 space-y-2">
                {data.topNoRouteCourses.map((course, index) => (
                  <div key={index} className="text-xs space-y-1 p-2 rounded-md bg-accent/50">
                    <div className="font-medium truncate" title={course.name}>
                      {index + 1}. {course.name}
                    </div>
                    <div className="font-semibold text-primary">
                      {course.count} consumos
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top 5 Empresas por Consumo */}
      <div className="col-span-full mt-6">
        <h3 className="text-xl font-bold mb-4">Análisis por Empresa</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top 5 Empresas con más Usuarios con Licencia */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top 5 Empresas - Usuarios con Licencia</CardTitle>
            <CardDescription>Empresas con más licencias activas consumidas</CardDescription>
          </CardHeader>
          <CardContent>
            {data.companiesWithUsers.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart 
                  data={data.companiesWithUsers} 
                  layout="vertical"
                  margin={{ top: 5, right: 10, left: 5, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    width={0}
                    tick={false}
                  />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-background border border-border rounded-lg p-3 shadow-lg max-w-xs">
                            <p className="font-semibold text-sm mb-1">{data.name}</p>
                            <p className="text-xs text-muted-foreground mb-1">NIT: {data.nit}</p>
                            <p className="text-xs">Usuarios con licencia: {data.users}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="users" fill="hsl(262, 83%, 58%)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground text-sm">
                No hay datos disponibles
              </div>
            )}
            
            <div className="mt-4 flex justify-center">
              <button
                onClick={() => setShowCompaniesUsersDetails(!showCompaniesUsersDetails)}
                className="text-xs text-primary hover:underline font-medium"
              >
                {showCompaniesUsersDetails ? 'Ocultar detalles' : 'Ver detalles'}
              </button>
            </div>
            
            {showCompaniesUsersDetails && (
              <div className="mt-4 space-y-2">
                {data.companiesWithUsers.map((company, index) => (
                  <div key={index} className="text-xs space-y-1 p-2 rounded-md bg-accent/50">
                    <div className="font-medium truncate" title={company.name}>
                      {index + 1}. {company.name}
                    </div>
                    <div className="font-semibold text-primary">
                      {company.users} usuarios
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top 5 Empresas - Consumo en Rutas de IA */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top 5 Empresas - Consumo en Rutas IA</CardTitle>
            <CardDescription>Mayor consumo de cursos en rutas de IA</CardDescription>
          </CardHeader>
          <CardContent>
            {data.companiesIACourseConsumption.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart 
                  data={data.companiesIACourseConsumption} 
                  layout="vertical"
                  margin={{ top: 5, right: 10, left: 5, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    width={0}
                    tick={false}
                  />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-background border border-border rounded-lg p-3 shadow-lg max-w-xs">
                            <p className="font-semibold text-sm mb-1">{data.name}</p>
                            <p className="text-xs text-muted-foreground mb-1">Ruta principal: {data.topRoute}</p>
                            <p className="text-xs text-muted-foreground mb-1">Curso top: {data.topCourse}</p>
                            <p className="text-xs">Total cursos: {data.totalCourses}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="totalCourses" fill="hsl(221, 83%, 53%)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground text-sm">
                No hay datos disponibles
              </div>
            )}
            
            <div className="mt-4 flex justify-center">
              <button
                onClick={() => setShowCompaniesIADetails(!showCompaniesIADetails)}
                className="text-xs text-primary hover:underline font-medium"
              >
                {showCompaniesIADetails ? 'Ocultar detalles' : 'Ver detalles'}
              </button>
            </div>
            
            {showCompaniesIADetails && (
              <div className="mt-4 space-y-2">
                {data.companiesIACourseConsumption.map((company, index) => (
                  <div key={index} className="text-xs space-y-1 p-2 rounded-md bg-accent/50">
                    <div className="font-medium truncate" title={company.name}>
                      {index + 1}. {company.name}
                    </div>
                    <div className="text-muted-foreground truncate" title={company.topRoute}>
                      Ruta: {company.topRoute}
                    </div>
                    <div className="text-muted-foreground truncate text-[10px]" title={company.topCourse}>
                      Top: {company.topCourse}
                    </div>
                    <div className="font-semibold text-primary">
                      {company.totalCourses} cursos
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top 5 Empresas - Consumo Fuera de Rutas */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top 5 Empresas - Consumo Fuera de Rutas</CardTitle>
            <CardDescription>Mayor consumo de cursos fuera de rutas IA</CardDescription>
          </CardHeader>
          <CardContent>
            {data.companiesOutsideRouteConsumption.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart 
                  data={data.companiesOutsideRouteConsumption} 
                  layout="vertical"
                  margin={{ top: 5, right: 10, left: 5, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    width={0}
                    tick={false}
                  />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-background border border-border rounded-lg p-3 shadow-lg max-w-xs">
                            <p className="font-semibold text-sm mb-1">{data.name}</p>
                            <p className="text-xs text-muted-foreground mb-1">Curso top: {data.topCourse}</p>
                            <p className="text-xs">Total cursos: {data.totalCourses}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="totalCourses" fill="hsl(35, 91%, 62%)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground text-sm">
                No hay datos disponibles
              </div>
            )}
            
            <div className="mt-4 flex justify-center">
              <button
                onClick={() => setShowCompaniesOutsideDetails(!showCompaniesOutsideDetails)}
                className="text-xs text-primary hover:underline font-medium"
              >
                {showCompaniesOutsideDetails ? 'Ocultar detalles' : 'Ver detalles'}
              </button>
            </div>
            
            {showCompaniesOutsideDetails && (
              <div className="mt-4 space-y-2">
                {data.companiesOutsideRouteConsumption.map((company, index) => (
                  <div key={index} className="text-xs space-y-1 p-2 rounded-md bg-accent/50">
                    <div className="font-medium truncate" title={company.name}>
                      {index + 1}. {company.name}
                    </div>
                    <div className="text-muted-foreground truncate text-[10px]" title={company.topCourse}>
                      Top: {company.topCourse}
                    </div>
                    <div className="font-semibold text-primary">
                      {company.totalCourses} cursos
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Análisis por Cámara de Comercio */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold">Análisis por Cámara de Comercio</h3>
        <p className="text-sm text-muted-foreground">Consumo de cursos por empresas asociadas a cada cámara</p>
        
        <div className="grid gap-6 md:grid-cols-2">
          {/* Consumo de Cursos por Cámara */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Consumo de Cursos por Cámara</CardTitle>
              <CardDescription>Top cursos consumidos por empresas de cada cámara</CardDescription>
            </CardHeader>
            <CardContent>
              {data.chamberCourseConsumption && data.chamberCourseConsumption.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart
                      data={data.chamberCourseConsumption}
                      layout="vertical"
                      margin={{ top: 5, right: 10, left: 5, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis 
                        type="category" 
                        dataKey="chamber" 
                        width={0}
                        tick={false}
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-background border border-border rounded-lg p-3 shadow-lg max-w-md">
                                <p className="font-bold text-sm mb-2">{data.chamber}</p>
                                <p className="text-xs mb-2">
                                  Total cursos: <span className="font-semibold">{data.totalCourses}</span>
                                </p>
                                {data.topCourses && data.topCourses.length > 0 && (
                                  <>
                                    <p className="text-xs font-semibold mb-1">Top cursos:</p>
                                    <ul className="text-[10px] space-y-1">
                                      {data.topCourses.slice(0, 3).map((course: any, idx: number) => (
                                        <li key={idx} className="text-muted-foreground truncate">
                                          {idx + 1}. {course.curso} ({course.count} veces)
                                        </li>
                                      ))}
                                    </ul>
                                  </>
                                )}
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar dataKey="totalCourses" fill="hsl(262, 83%, 58%)" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                  
                  <div className="mt-4 flex justify-center">
                    <button
                      onClick={() => setShowChamberCoursesDetails(!showChamberCoursesDetails)}
                      className="text-xs text-primary hover:underline font-medium"
                    >
                      {showChamberCoursesDetails ? 'Ocultar detalles' : 'Ver detalles'}
                    </button>
                  </div>
                  
                  {showChamberCoursesDetails && (
                    <div className="mt-4 space-y-2">
                      {data.chamberCourseConsumption.map((chamber, index) => (
                        <div key={index} className="text-xs space-y-1 p-2 rounded-md bg-accent/50">
                          <div className="font-medium">{chamber.chamber}</div>
                          <div className="text-muted-foreground">
                            {chamber.totalCourses} cursos consumidos
                          </div>
                          {chamber.topCourses && chamber.topCourses.length > 0 && (
                            <div className="text-[10px] text-muted-foreground space-y-0.5 mt-1">
                              <div className="font-semibold">Top cursos:</div>
                              {chamber.topCourses.slice(0, 3).map((course, idx) => (
                                <div key={idx} className="truncate" title={course.curso}>
                                  {idx + 1}. {course.curso} ({course.count})
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-center justify-center h-[400px] text-muted-foreground text-sm">
                  No hay datos disponibles
                </div>
              )}
            </CardContent>
          </Card>

          {/* Consumo de Rutas por Cámara */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Consumo de Rutas por Cámara</CardTitle>
              <CardDescription>Top rutas de IA consumidas por empresas de cada cámara</CardDescription>
            </CardHeader>
            <CardContent>
              {data.chamberRouteConsumption && data.chamberRouteConsumption.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart
                      data={data.chamberRouteConsumption}
                      layout="vertical"
                      margin={{ top: 5, right: 10, left: 5, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis 
                        type="category" 
                        dataKey="chamber" 
                        width={0}
                        tick={false}
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-background border border-border rounded-lg p-3 shadow-lg max-w-md">
                                <p className="font-bold text-sm mb-2">{data.chamber}</p>
                                <p className="text-xs mb-2">
                                  Total cursos en rutas: <span className="font-semibold">{data.totalCourses}</span>
                                </p>
                                {data.topRoutes && data.topRoutes.length > 0 && (
                                  <>
                                    <p className="text-xs font-semibold mb-1">Top rutas:</p>
                                    <ul className="text-[10px] space-y-1">
                                      {data.topRoutes.slice(0, 3).map((route: any, idx: number) => (
                                        <li key={idx} className="text-muted-foreground truncate">
                                          {idx + 1}. {route.ruta.substring(0, 40)}... ({route.count})
                                        </li>
                                      ))}
                                    </ul>
                                  </>
                                )}
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar dataKey="totalCourses" fill="hsl(221, 83%, 53%)" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                  
                  <div className="mt-4 flex justify-center">
                    <button
                      onClick={() => setShowChamberRoutesDetails(!showChamberRoutesDetails)}
                      className="text-xs text-primary hover:underline font-medium"
                    >
                      {showChamberRoutesDetails ? 'Ocultar detalles' : 'Ver detalles'}
                    </button>
                  </div>
                  
                  {showChamberRoutesDetails && (
                    <div className="mt-4 space-y-2">
                      {data.chamberRouteConsumption.map((chamber, index) => (
                        <div key={index} className="text-xs space-y-1 p-2 rounded-md bg-accent/50">
                          <div className="font-medium">{chamber.chamber}</div>
                          <div className="text-muted-foreground">
                            {chamber.totalCourses} cursos en rutas
                          </div>
                          {chamber.topRoutes && chamber.topRoutes.length > 0 && (
                            <div className="text-[10px] text-muted-foreground space-y-0.5 mt-1">
                              <div className="font-semibold">Top rutas:</div>
                              {chamber.topRoutes.slice(0, 3).map((route, idx) => (
                                <div key={idx} className="truncate" title={route.ruta}>
                                  {idx + 1}. {route.ruta.substring(0, 45)}... ({route.count})
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-center justify-center h-[400px] text-muted-foreground text-sm">
                  No hay datos disponibles
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}