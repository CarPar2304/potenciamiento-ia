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
    { stage: 'Con Inversión 2024', count: data.investmentData.length, percentage: (data.investmentData.length / kpis.companiesImpacted) * 100 }
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
          trend="neutral"
          trendValue=""
          subtitle="Del total de empresas"
        />
        <ExecutiveKPI
          title="Inversión Movilizada 2024"
          value={kpis.totalInvestment2024}
          format="currency"
          icon={DollarSign}
          trend="neutral"
          trendValue=""
          subtitle="Millones invertidos en IA"
        />
        <ExecutiveKPI
          title="Proyección 12 Meses"
          value={kpis.projectedInvestment}
          format="currency"
          icon={TrendingUp}
          trend="neutral"
          trendValue=""
          subtitle="Inversión proyectada"
        />
        <ExecutiveKPI
          title="Empresas Impactadas"
          value={kpis.companiesImpacted}
          format="number"
          icon={Building2}
          trend="neutral"
          trendValue=""
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

        {/* Investment Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-success" />
              Resumen de Inversión
            </CardTitle>
            <CardDescription>
              Inversión total movilizada en IA
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">
                ${(data.totalInvestment / 1000000).toFixed(1)}M
              </div>
              <p className="text-sm text-muted-foreground">
                Inversión total 2024
              </p>
              <div className="mt-4">
                <p className="text-xs text-muted-foreground">
                  {data.investmentData.length} empresas han invertido en IA
                </p>
              </div>
            </div>
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