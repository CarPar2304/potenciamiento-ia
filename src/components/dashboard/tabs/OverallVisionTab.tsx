import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Minus, Users, Building2, FileText, CalendarIcon } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, subDays, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface OverallVisionTabProps {
  data: {
    licensesUsed: number;
    totalLicenses: number;
    licensesPercentage: number;
    totalRequests: number;
    requestsVariance: number | null;
    requestsStatusData: Array<{ name: string; value: number; count: number; color: string }>;
    requestsTypeData: Array<{ name: string; value: number; count: number; color: string }>;
    totalCompanies: number;
    companiesVariance: number | null;
    avgRequestsPerCompany: number;
    requestsTimelineData: Array<{ week: string; solicitudes: number }>;
  };
  onDateRangeChange?: (range: { start: Date | null; end: Date | null }) => void;
  dateRange?: { start: Date | null; end: Date | null };
}

export function OverallVisionTab({ data, onDateRangeChange, dateRange }: OverallVisionTabProps) {
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

  const getTrendIcon = (variance: number) => {
    if (variance > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (variance < 0) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const getTrendColor = (variance: number) => {
    if (variance > 0) return "text-green-500";
    if (variance < 0) return "text-red-500";
    return "text-muted-foreground";
  };

  return (
    <div className="space-y-6">
      {/* Licencias KPI */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold">Licencias Platzi</CardTitle>
          <CardDescription>Uso de licencias del programa</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Licencias consumidas</span>
              <span className="text-2xl font-bold">{data.licensesUsed.toLocaleString()}</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Progreso</span>
                <span className="font-medium">{data.licensesPercentage.toFixed(1)}%</span>
              </div>
              <Progress value={data.licensesPercentage} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {data.licensesUsed.toLocaleString()} de {data.totalLicenses.toLocaleString()} licencias disponibles
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Solicitudes Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Solicitudes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Solicitudes</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalRequests.toLocaleString()}</div>
            <div className="flex items-center space-x-1 text-xs">
              {data.requestsVariance !== null ? (
                <>
                  {getTrendIcon(data.requestsVariance)}
                  <span className={getTrendColor(data.requestsVariance)}>
                    {Math.abs(data.requestsVariance).toFixed(1)}% vs mes anterior
                  </span>
                </>
              ) : (
                <span className="text-muted-foreground">
                  Falta de data para comparar
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Total Empresas */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Empresas</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalCompanies.toLocaleString()}</div>
            <div className="flex items-center space-x-1 text-xs">
              {data.companiesVariance !== null ? (
                <>
                  {getTrendIcon(data.companiesVariance)}
                  <span className={getTrendColor(data.companiesVariance)}>
                    {Math.abs(data.companiesVariance).toFixed(1)}% vs mes anterior
                  </span>
                </>
              ) : (
                <span className="text-muted-foreground">
                  Falta de data para comparar
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Promedio Solicitudes por Empresa */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Solicitudes/Empresa</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.avgRequestsPerCompany.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">
              Promedio por empresa
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos de Solicitudes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Estado de Solicitudes */}
        <Card>
          <CardHeader>
            <CardTitle>Estado de Solicitudes</CardTitle>
            <CardDescription>Distribución por estado</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={data.requestsStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.requestsStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-2 mt-4">
              {data.requestsStatusData.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm">{item.name}: {item.count} ({item.value}%)</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tipo de Solicitudes */}
        <Card>
          <CardHeader>
            <CardTitle>Tipo de Solicitudes</CardTitle>
            <CardDescription>Empresariales vs Colaboradores</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={data.requestsTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.requestsTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-2 mt-4">
              {data.requestsTypeData.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm">{item.name}: {item.count} ({item.value}%)</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timeline de Solicitudes */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Evolución de Solicitudes</CardTitle>
              <CardDescription>Solicitudes por semana</CardDescription>
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
          {data.requestsTimelineData.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <LineChart 
                data={data.requestsTimelineData}
                margin={{ top: 5, right: 30, left: 20, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="week"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  interval={data.requestsTimelineData.length > 20 ? 'preserveStartEnd' : 0}
                  tick={{ fontSize: 12 }}
                  className="text-xs"
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  className="text-xs"
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="solicitudes" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--primary))", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[350px] flex items-center justify-center text-muted-foreground">
              No hay datos disponibles para el período seleccionado
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}