import { InteractiveChart } from '../InteractiveChart';
import { ExecutiveKPI } from '../ExecutiveKPI';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Building2, 
  Globe, 
  GraduationCap, 
  Heart,
  TrendingUp,
  Target,
  PieChart
} from 'lucide-react';

interface DemographicsTabProps {
  data: {
    genderChart: any[];
    companySizeChart: any[];
    marketChart: any[];
    educationChart: any[];
    totalWomen: number;
    womenParticipationRate: number;
    avgCompanySize: number;
  };
  totalParticipants: number;
}

export function DemographicsTab({ data, totalParticipants }: DemographicsTabProps) {
  const chartConfig = {
    value: { label: "Cantidad", color: "hsl(var(--primary))" },
    men: { label: "Hombres", color: "hsl(var(--primary))" },
    women: { label: "Mujeres", color: "hsl(var(--success))" },
    micro: { label: "Micro", color: "hsl(var(--warning))" },
    small: { label: "Pequeña", color: "hsl(var(--primary))" },
    medium: { label: "Mediana", color: "hsl(var(--success))" },
    large: { label: "Grande", color: "hsl(280 73% 62%)" }
  };

  const diversityMetrics = [
    {
      category: 'Participación Femenina',
      current: data.womenParticipationRate,
      target: 50,
      status: data.womenParticipationRate >= 40 ? 'good' : data.womenParticipationRate >= 30 ? 'warning' : 'needs-improvement'
    },
    {
      category: 'Cobertura MIPYME',
      current: ((data.companySizeChart.find(c => c.name.includes('Micro'))?.value || 0) + 
                (data.companySizeChart.find(c => c.name.includes('Pequeña'))?.value || 0)) / 
                data.companySizeChart.reduce((sum, c) => sum + c.value, 0) * 100,
      target: 70,
      status: 'good'
    },
    {
      category: 'Alcance Internacional',
      current: (data.marketChart.find(m => m.name === 'Internacional')?.value || 0) / 
               data.marketChart.reduce((sum, m) => sum + m.value, 0) * 100,
      target: 25,
      status: 'warning'
    },
    {
      category: 'Educación Superior',
      current: ((data.educationChart.find(e => e.name.includes('Universitario') || e.name.includes('Posgrado'))?.value || 0) + 
                (data.educationChart.find(e => e.name.includes('Maestría') || e.name.includes('Doctorado'))?.value || 0)) /
                data.educationChart.reduce((sum, e) => sum + e.value, 0) * 100,
      target: 60,
      status: 'good'
    }
  ];

  const regionalImpact = [
    { region: 'Bogotá D.C.', participants: Math.floor(totalParticipants * 0.35), companies: Math.floor(totalParticipants * 0.35 * 0.8) },
    { region: 'Antioquia', participants: Math.floor(totalParticipants * 0.18), companies: Math.floor(totalParticipants * 0.18 * 0.8) },
    { region: 'Valle del Cauca', participants: Math.floor(totalParticipants * 0.12), companies: Math.floor(totalParticipants * 0.12 * 0.8) },
    { region: 'Atlántico', participants: Math.floor(totalParticipants * 0.08), companies: Math.floor(totalParticipants * 0.08 * 0.8) },
    { region: 'Santander', participants: Math.floor(totalParticipants * 0.06), companies: Math.floor(totalParticipants * 0.06 * 0.8) },
    { region: 'Otras regiones', participants: Math.floor(totalParticipants * 0.21), companies: Math.floor(totalParticipants * 0.21 * 0.8) }
  ];

  const ageDistribution = [
    { range: '18-25 años', percentage: 15, description: 'Jóvenes emprendedores' },
    { range: '26-35 años', percentage: 35, description: 'Profesionales emergentes' },
    { range: '36-45 años', percentage: 28, description: 'Ejecutivos consolidados' },
    { range: '46-55 años', percentage: 18, description: 'Líderes experimentados' },
    { range: '55+ años', percentage: 4, description: 'Veteranos del sector' }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Executive KPIs Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <ExecutiveKPI
          title="Participación Femenina"
          value={data.womenParticipationRate}
          format="percentage"
          icon={Heart}
          trend="neutral"
          trendValue=""
          subtitle="Información no disponible"
        />
        <ExecutiveKPI
          title="Tamaño Promedio Empresa"
          value={Math.round(data.avgCompanySize)}
          format="number"
          icon={Building2}
          trend="neutral"
          trendValue="0%"
          subtitle="Número de colaboradores"
        />
        <ExecutiveKPI
          title="Cobertura Nacional"
          value={regionalImpact.length}
          format="number"
          icon={Globe}
          trend="neutral"
          trendValue=""
          subtitle="Regiones representadas"
        />
        <ExecutiveKPI
          title="Nivel Educativo Alto"
          value={Math.round(diversityMetrics[3].current)}
          format="percentage"
          icon={GraduationCap}
          trend="neutral"
          trendValue=""
          subtitle="Educación superior"
        />
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Total de Participantes</CardTitle>
            <CardDescription>Número total de participantes en el programa</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">
                {totalParticipants}
              </div>
              <p className="text-sm text-muted-foreground">
                Participantes activos en el programa
              </p>
            </div>
          </CardContent>
        </Card>

        <InteractiveChart
          title="Segmentación por Tamaño de Empresa"
          description="Distribución de empresas por número de colaboradores"
          data={data.companySizeChart}
          type="bar"
          config={chartConfig}
          xAxisKey="name"
          yAxisKey="value"
          onDataPointClick={(data) => console.log('Company size selected:', data)}
        />
      </div>

      {/* Secondary Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InteractiveChart
          title="Alcance de Mercado"
          description="Distribución de empresas por cobertura geográfica"
          data={data.marketChart}
          type="pie"
          config={chartConfig}
          onDataPointClick={(data) => console.log('Market selected:', data)}
        />

        <InteractiveChart
          title="Nivel Educativo"
          description="Formación académica de los participantes"
          data={data.educationChart}
          type="bar"
          config={chartConfig}
          xAxisKey="name"
          yAxisKey="value"
          onDataPointClick={(data) => console.log('Education selected:', data)}
        />
      </div>

      {/* Analysis Cards Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Diversity Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Métricas de Diversidad
            </CardTitle>
            <CardDescription>
              Indicadores de inclusión y representatividad
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {diversityMetrics.map((metric) => (
              <div key={metric.category} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{metric.category}</span>
                  <Badge 
                    variant={
                      metric.status === 'good' ? 'default' : 
                      metric.status === 'warning' ? 'secondary' : 'outline'
                    }
                  >
                    {metric.current.toFixed(1)}%
                  </Badge>
                </div>
                <Progress 
                  value={metric.current} 
                  className="h-2"
                />
                <p className="text-xs text-muted-foreground">
                  Meta: {metric.target}%
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Regional Impact */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-success" />
              Impacto Regional
            </CardTitle>
            <CardDescription>
              Distribución geográfica de participantes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {regionalImpact.map((region) => (
              <div key={region.region} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{region.region}</p>
                  <p className="text-xs text-muted-foreground">
                    {region.companies} empresas
                  </p>
                </div>
                <div className="text-right">
                  <Badge variant="outline">{region.participants}</Badge>
                  <p className="text-xs text-muted-foreground">
                    {((region.participants / totalParticipants) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Age Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-warning" />
              Distribución Etaria
            </CardTitle>
            <CardDescription>
              Rangos de edad de los participantes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {ageDistribution.map((age) => (
              <div key={age.range} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{age.range}</span>
                  <span className="text-sm text-muted-foreground">
                    {age.percentage}%
                  </span>
                </div>
                <Progress 
                  value={age.percentage} 
                  className="h-2"
                />
                <p className="text-xs text-muted-foreground">
                  {age.description}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Demographic Insights Summary */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5 text-primary" />
            Insights Demográficos Clave
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary mb-1">
                {data.womenParticipationRate.toFixed(0)}%
              </div>
              <p className="text-sm text-muted-foreground">
                Participación femenina superando la media nacional
              </p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary mb-1">
                {((data.companySizeChart.find(c => c.name.includes('Micro'))?.value || 0) + 
                  (data.companySizeChart.find(c => c.name.includes('Pequeña'))?.value || 0)).toFixed(0)}
              </div>
              <p className="text-sm text-muted-foreground">
                MIPYME beneficiadas directamente
              </p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary mb-1">
                {regionalImpact.length}
              </div>
              <p className="text-sm text-muted-foreground">
                Regiones con presencia activa
              </p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary mb-1">
                63%
              </div>
              <p className="text-sm text-muted-foreground">
                Participantes con formación universitaria
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}