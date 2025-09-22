import { InteractiveChart } from '../InteractiveChart';
import { ExecutiveKPI } from '../ExecutiveKPI';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  TrendingUp, 
  DollarSign, 
  Building2, 
  AlertTriangle,
  Target,
  BarChart3
} from 'lucide-react';

interface AIAdoptionTabProps {
  data: {
    sectorChart: any[];
    chamberChart: any[];
    investmentData: any[];
    probabilityData: any[];
    totalInvestment: number;
    avgProbability: number;
  };
  kpis: {
    aiAdoptionRate: number;
    totalInvestment2024: number;
    projectedInvestment: number;
    companiesImpacted: number;
  };
}

export function AIAdoptionTab({ data, kpis }: AIAdoptionTabProps) {
  const chartConfig = {
    adopted: { label: "Con IA", color: "hsl(var(--success))" },
    notAdopted: { label: "Sin IA", color: "hsl(var(--muted))" },
    investment: { label: "Inversión", color: "hsl(var(--primary))" },
    probability: { label: "Probabilidad", color: "hsl(var(--warning))" },
    value: { label: "Empresas", color: "hsl(var(--primary))" }
  };

  const adoptionFunnel = [
    { stage: 'Empresas Registradas', count: kpis.companiesImpacted, percentage: 100 },
    { stage: 'Con Decisión de Adoptar', count: Math.round(kpis.companiesImpacted * (kpis.aiAdoptionRate / 100)), percentage: kpis.aiAdoptionRate },
    { stage: 'Con Inversión 2024', count: data.investmentData.length, percentage: (data.investmentData.length / kpis.companiesImpacted) * 100 },
    { stage: 'Alta Probabilidad Futura', count: data.probabilityData.filter(p => p.level >= 4).reduce((sum, p) => sum + p.value, 0), percentage: ((data.probabilityData.filter(p => p.level >= 4).reduce((sum, p) => sum + p.value, 0)) / kpis.companiesImpacted) * 100 }
  ];

  const barrierAnalysis = [
    { barrier: 'Falta de conocimiento', percentage: 35, description: 'Principal barrera identificada' },
    { barrier: 'Costos elevados', percentage: 28, description: 'Segunda preocupación más común' },
    { barrier: 'Falta de personal capacitado', percentage: 22, description: 'Necesidad de formación' },
    { barrier: 'Incertidumbre tecnológica', percentage: 15, description: 'Dudas sobre implementación' }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Executive KPIs Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <ExecutiveKPI
          title="Tasa de Adopción IA"
          value={kpis.aiAdoptionRate}
          format="percentage"
          icon={Brain}
          trend="up"
          trendValue="+5.2%"
          subtitle="Del total de empresas"
        />
        <ExecutiveKPI
          title="Inversión Movilizada 2024"
          value={kpis.totalInvestment2024}
          format="currency"
          icon={DollarSign}
          trend="up"
          trendValue="+12.8%"
          subtitle="Millones invertidos en IA"
        />
        <ExecutiveKPI
          title="Proyección 12 Meses"
          value={kpis.projectedInvestment}
          format="currency"
          icon={TrendingUp}
          trend="up"
          trendValue="+45%"
          subtitle="Inversión proyectada"
        />
        <ExecutiveKPI
          title="Empresas Impactadas"
          value={kpis.companiesImpacted}
          format="number"
          icon={Building2}
          trend="up"
          trendValue="+18"
          subtitle="Empresas en el programa"
        />
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InteractiveChart
          title="Adopción de IA por Sector"
          description="Distribución de empresas con y sin adopción de IA por sector empresarial"
          data={data.sectorChart}
          type="bar"
          config={chartConfig}
          xAxisKey="name"
          yAxisKey={['adopted', 'notAdopted']}
          onDataPointClick={(data) => console.log('Sector selected:', data)}
        />

        <InteractiveChart
          title="Probabilidad de Adopción Futura"
          description="Escala 1-5 de probabilidad de adoptar IA en los próximos 12 meses"
          data={data.probabilityData}
          type="pie"
          config={chartConfig}
          onDataPointClick={(data) => console.log('Probability selected:', data)}
        />
      </div>

      {/* Secondary Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InteractiveChart
          title="Top 10 Inversiones en IA 2024"
          description="Empresas con mayor inversión en inteligencia artificial"
          data={data.investmentData}
          type="bar"
          config={chartConfig}
          xAxisKey="name"
          yAxisKey="investment"
          onDataPointClick={(data) => console.log('Investment selected:', data)}
        />

        <InteractiveChart
          title="Adopción por Cámara"
          description="Comparativo de adopción de IA entre cámaras de comercio"
          data={data.chamberChart}
          type="bar"
          config={chartConfig}
          xAxisKey="name"
          yAxisKey={['adopted', 'notAdopted']}
          onDataPointClick={(data) => console.log('Chamber selected:', data)}
        />
      </div>

      {/* Analysis Cards Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Adoption Funnel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Embudo de Adopción de IA
            </CardTitle>
            <CardDescription>
              Progresión de empresas en el proceso de adopción de IA
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {adoptionFunnel.map((stage, index) => (
              <div key={stage.stage} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{stage.stage}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{stage.count}</Badge>
                    <span className="text-sm text-muted-foreground">
                      {stage.percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <Progress 
                  value={stage.percentage} 
                  className="h-2"
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Barriers Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Barreras de Adopción
            </CardTitle>
            <CardDescription>
              Principales obstáculos identificados para la adopción de IA
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {barrierAnalysis.map((barrier, index) => (
              <div key={barrier.barrier} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{barrier.barrier}</span>
                  <span className="text-sm text-muted-foreground">
                    {barrier.percentage}%
                  </span>
                </div>
                <Progress 
                  value={barrier.percentage} 
                  className="h-2"
                />
                <p className="text-xs text-muted-foreground">
                  {barrier.description}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Key Insights */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Insights Clave de Adopción IA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary mb-1">
                {data.avgProbability.toFixed(1)}/5
              </div>
              <p className="text-sm text-muted-foreground">
                Probabilidad promedio de adopción futura
              </p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary mb-1">
                {((kpis.projectedInvestment / kpis.totalInvestment2024 - 1) * 100).toFixed(0)}%
              </div>
              <p className="text-sm text-muted-foreground">
                Crecimiento proyectado en inversión
              </p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary mb-1">
                {data.sectorChart.length}
              </div>
              <p className="text-sm text-muted-foreground">
                Sectores con participación activa
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}