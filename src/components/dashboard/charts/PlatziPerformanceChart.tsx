import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line, Area, AreaChart } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

interface PlatziPerformanceChartProps {
  data: any[];
  type: 'levels' | 'progress' | 'engagement' | 'timeline';
}

export function PlatziPerformanceChart({ data, type }: PlatziPerformanceChartProps) {
  const chartConfig = {
    level1: { label: "Nivel 1", color: "hsl(var(--destructive))" },
    level2: { label: "Nivel 2", color: "hsl(var(--warning))" },
    level3: { label: "Nivel 3", color: "hsl(var(--muted))" },
    level4: { label: "Nivel 4", color: "hsl(var(--primary))" },
    level5: { label: "Nivel 5", color: "hsl(var(--success))" },
    level6: { label: "Nivel 6", color: "hsl(261 73% 72%)" },
    progress: { label: "Progreso", color: "hsl(var(--primary))" },
    timeSpent: { label: "Tiempo (hrs)", color: "hsl(var(--success))" },
    certificates: { label: "Certificados", color: "hsl(var(--warning))" },
  };

  const renderTitle = () => {
    switch (type) {
      case 'levels':
        return 'Distribución por Niveles de IA';
      case 'progress':
        return 'Progreso Promedio por Cámara';
      case 'engagement':
        return 'Métricas de Participación';
      case 'timeline':
        return 'Evolución Temporal del Progreso';
      default:
        return 'Rendimiento Platzi';
    }
  };

  const renderDescription = () => {
    switch (type) {
      case 'levels':
        return 'Número de empresarios por cada nivel de IA asignado (1-6)';
      case 'progress':
        return 'Porcentaje de progreso promedio en las rutas de aprendizaje por cámara';
      case 'engagement':
        return 'Tiempo dedicado y certificaciones obtenidas por nivel';
      case 'timeline':
        return 'Progreso acumulado en el programa a lo largo del tiempo';
      default:
        return '';
    }
  };

  if (type === 'levels') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{renderTitle()}</CardTitle>
          <CardDescription>{renderDescription()}</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="level" 
                  className="text-xs fill-muted-foreground"
                />
                <YAxis className="text-xs fill-muted-foreground" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar 
                  dataKey="count" 
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    );
  }

  if (type === 'engagement') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{renderTitle()}</CardTitle>
          <CardDescription>{renderDescription()}</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="level" 
                  className="text-xs fill-muted-foreground"
                />
                <YAxis 
                  yAxisId="left"
                  className="text-xs fill-muted-foreground" 
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right"
                  className="text-xs fill-muted-foreground"
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar 
                  yAxisId="left"
                  dataKey="timeSpent" 
                  fill="var(--color-timeSpent)"
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  yAxisId="right"
                  dataKey="certificates" 
                  fill="var(--color-certificates)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    );
  }

  if (type === 'timeline') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{renderTitle()}</CardTitle>
          <CardDescription>{renderDescription()}</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="month" 
                  className="text-xs fill-muted-foreground"
                />
                <YAxis className="text-xs fill-muted-foreground" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="progress"
                  stroke="var(--color-progress)"
                  fill="var(--color-progress)"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{renderTitle()}</CardTitle>
        <CardDescription>{renderDescription()}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="name" 
                className="text-xs fill-muted-foreground"
                angle={-45}
                textAnchor="end"
                height={100}
              />
              <YAxis 
                className="text-xs fill-muted-foreground"
                tickFormatter={(value) => `${value}%`}
              />
              <ChartTooltip 
                content={<ChartTooltipContent 
                  formatter={(value: any) => [`${value}%`, 'Progreso']}
                />} 
              />
              <Bar 
                dataKey="progress" 
                fill="var(--color-progress)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}