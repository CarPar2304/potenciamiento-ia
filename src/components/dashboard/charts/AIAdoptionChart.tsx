import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

interface AIAdoptionChartProps {
  data: any[];
  type: 'sector' | 'chamber' | 'investment' | 'probability';
}

export function AIAdoptionChart({ data, type }: AIAdoptionChartProps) {
  const chartConfig = {
    adopted: {
      label: "Con IA",
      color: "hsl(var(--primary))",
    },
    notAdopted: {
      label: "Sin IA",
      color: "hsl(var(--muted))",
    },
    investment: {
      label: "Inversión",
      color: "hsl(var(--primary))",
    },
    probability: {
      label: "Probabilidad",
      color: "hsl(var(--primary))",
    },
  };

  const renderTitle = () => {
    switch (type) {
      case 'sector':
        return 'Adopción de IA por Sector';
      case 'chamber':
        return 'Adopción de IA por Cámara';
      case 'investment':
        return 'Inversión en IA 2024';
      case 'probability':
        return 'Probabilidad de Adopción Futura';
      default:
        return 'Adopción de IA';
    }
  };

  const renderDescription = () => {
    switch (type) {
      case 'sector':
        return 'Distribución de empresas con y sin adopción de IA por sector empresarial';
      case 'chamber':
        return 'Comparativo de adopción de IA entre las diferentes cámaras de comercio';
      case 'investment':
        return 'Monto total invertido en inteligencia artificial durante 2024';
      case 'probability':
        return 'Escala 1-5 de probabilidad de adoptar IA en los próximos 12 meses';
      default:
        return '';
    }
  };

  if (type === 'investment') {
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
                  tickFormatter={(value) => `$${(value / 1000000).toFixed(0)}M`}
                />
                <ChartTooltip 
                  content={<ChartTooltipContent 
                    formatter={(value: any) => [`$${(value / 1000000).toFixed(1)}M`, 'Inversión']}
                  />} 
                />
                <Bar 
                  dataKey="investment" 
                  fill="var(--color-investment)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    );
  }

  if (type === 'probability') {
    const COLORS = [
      'hsl(var(--destructive))',
      'hsl(var(--warning))',
      'hsl(var(--muted))',
      'hsl(var(--primary))',
      'hsl(var(--success))'
    ];

    return (
      <Card>
        <CardHeader>
          <CardTitle>{renderTitle()}</CardTitle>
          <CardDescription>{renderDescription()}</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
              </PieChart>
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
              <YAxis className="text-xs fill-muted-foreground" />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              <Bar dataKey="adopted" stackId="a" fill="var(--color-adopted)" radius={[0, 0, 0, 0]} />
              <Bar dataKey="notAdopted" stackId="a" fill="var(--color-notAdopted)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}