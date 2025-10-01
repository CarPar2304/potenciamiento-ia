import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Users, DollarSign, TrendingUp, Brain } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

interface BusinessEnvironmentTabProps {
  data: {
    totalCompanies: number;
    companiesByType: Array<{ name: string; value: number; color: string }>;
    avgEmployees: number;
    femaleEmployeesPercentage: number;
    chamberRanking: Array<{ chamber: string; companies: number; avgProgress: number }>;
    sectorDistribution: Array<{ name: string; value: number; color: string }>;
    clientTypeDistribution: Array<{ name: string; value: number; color: string }>;
    marketReach: Array<{ market: string; companies: number }>;
    avgSales: number;
    avgProfits: number;
    aiAdoptionRate: number;
    aiImplementationAreas: Array<{ name: string; value: number; color: string }>;
    nonAdoptionReasons: Array<{ name: string; value: number; color: string }>;
    aiInvestment2024: {
      average: number;
      total: number;
    };
    futureOutlook: {
      avgAdoptionProbability: number;
      avgInvestmentProbability: number;
      avgProjectedInvestment: number;
      totalProjectedInvestment: number;
    };
  };
  userRole: string;
}

export function BusinessEnvironmentTab({ data, userRole }: BusinessEnvironmentTabProps) {
  const formatCurrency = (value: number) => {
    return `$${(value / 10000).toFixed(1)}M COP`;
  };

  const isAdminOrCCC = userRole === 'admin' || userRole === 'ccc';

  return (
    <div className="space-y-6">
      {/* KPIs Principales - Reorganizados estratégicamente */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Empresas Registradas</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalCompanies.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Total en el programa
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ventas Promedio</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.avgSales)}</div>
            <p className="text-xs text-muted-foreground">
              2024
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilidades Promedio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.avgProfits)}</div>
            <p className="text-xs text-muted-foreground">
              2024
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Colaboradores Promedio</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(data.avgEmployees).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Por empresa
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">% Mujeres Colaboradoras</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.femaleEmployeesPercentage.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Del total de colaboradores
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Adopción de IA</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.aiAdoptionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Empresas que adoptaron IA
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Distribuciones por Tipo y Sector */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Distribución por Tipo Societario</CardTitle>
            <CardDescription>Participación por tipo de empresa</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={data.companiesByType}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                >
                  {data.companiesByType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-2 mt-4">
              {data.companiesByType.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm">{item.name}: {item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribución por Sector</CardTitle>
            <CardDescription>Participación por sector económico</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={data.sectorDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  dataKey="value"
                >
                  {data.sectorDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {data.sectorDistribution.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-xs">{item.name}: {item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ranking por Cámara (solo para Admin y CCC) */}
      {isAdminOrCCC && (
        <Card>
          <CardHeader>
            <CardTitle>Ranking de Empresas por Cámara</CardTitle>
            <CardDescription>Desempeño por cámara de comercio</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.chamberRanking}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="chamber" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="companies" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Tipo de Cliente y Mercado */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Tipo de Cliente</CardTitle>
            <CardDescription>Distribución por tipo de cliente</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={data.clientTypeDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  dataKey="value"
                >
                  {data.clientTypeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-2 mt-4">
              {data.clientTypeDistribution.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm">{item.name}: {item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alcance de Mercado</CardTitle>
            <CardDescription>Empresas por tipo de mercado</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data.marketReach}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="market" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="companies">
                  {data.marketReach.map((entry, index) => {
                    const colors = ['hsl(262, 83%, 58%)', 'hsl(280, 65%, 60%)', 'hsl(330, 75%, 65%)'];
                    return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>


      {/* Adopción de IA */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Áreas de Implementación IA</CardTitle>
            <CardDescription>Donde se ha implementado IA</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={data.aiImplementationAreas}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                >
                  {data.aiImplementationAreas.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-1 gap-1 mt-4">
              {data.aiImplementationAreas.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-xs">{item.name}: {item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Razones de No Adopción</CardTitle>
            <CardDescription>Por qué no han adoptado IA</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={data.nonAdoptionReasons}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                >
                  {data.nonAdoptionReasons.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-1 gap-1 mt-4">
              {data.nonAdoptionReasons.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-xs">{item.name.substring(0, 20)}...: {item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Inversión en IA */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Inversión en IA 2024</CardTitle>
            <CardDescription>Inversión realizada en el año</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Promedio:</span>
                <span className="text-lg font-bold">{formatCurrency(data.aiInvestment2024.average)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Total:</span>
                <span className="text-lg font-bold">{formatCurrency(data.aiInvestment2024.total)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Proyección 12 Meses</CardTitle>
            <CardDescription>Expectativas futuras</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-xs">Prob. Adopción:</span>
                <span className="text-sm font-bold">{data.futureOutlook.avgAdoptionProbability.toFixed(1)}/5</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs">Prob. Inversión:</span>
                <span className="text-sm font-bold">{data.futureOutlook.avgInvestmentProbability.toFixed(1)}/5</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs">Inversión Prom.:</span>
                <span className="text-sm font-bold">{formatCurrency(data.futureOutlook.avgProjectedInvestment)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs">Inversión Total:</span>
                <span className="text-sm font-bold">{formatCurrency(data.futureOutlook.totalProjectedInvestment)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}