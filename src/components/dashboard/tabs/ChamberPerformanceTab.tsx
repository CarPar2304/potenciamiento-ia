import { InteractiveChart } from '../InteractiveChart';
import { ExecutiveKPI } from '../ExecutiveKPI';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { 
  Building, 
  TrendingUp, 
  Award, 
  Users, 
  DollarSign,
  Target,
  Crown,
  BarChart3,
  ArrowUpRight,
  AlertCircle
} from 'lucide-react';

interface ChamberPerformanceTabProps {
  data: {
    chamberStats: any[];
    topPerformers: any[];
    utilizationData: any[];
  };
}

export function ChamberPerformanceTab({ data }: ChamberPerformanceTabProps) {
  const chartConfig = {
    avgProgress: { label: "Progreso Promedio", color: "hsl(var(--primary))" },
    utilization: { label: "Utilización", color: "hsl(var(--success))" },
    investment: { label: "Inversión", color: "hsl(var(--warning))" },
    companies: { label: "Empresas", color: "hsl(var(--muted))" },
    applications: { label: "Solicitudes", color: "hsl(var(--primary))" },
    certificates: { label: "Certificados", color: "hsl(var(--success))" },
    available: { label: "Disponibles", color: "hsl(var(--muted))" },
    used: { label: "Utilizadas", color: "hsl(var(--primary))" }
  };

  const performanceRanking = data.chamberStats.map((chamber, index) => ({
    ...chamber,
    rank: index + 1,
    performanceScore: Math.round(
      (chamber.avgProgress * 0.4) + 
      (chamber.licenseUtilization * 0.3) + 
      ((chamber.approvedApplications / chamber.applications) * 100 * 0.3)
    )
  }));

  const benchmarkData = data.chamberStats.map(chamber => ({
    name: chamber.name,
    avgProgress: chamber.avgProgress,
    utilization: chamber.licenseUtilization,
    companies: chamber.companies,
    investment: chamber.totalInvestment / 1000000 // Convert to millions
  }));

  const alertsAndOpportunities = [
    {
      type: 'alert',
      chamber: data.chamberStats.find(c => c.licenseUtilization < 30)?.name || 'N/A',
      issue: 'Baja utilización de licencias',
      value: `${data.chamberStats.find(c => c.licenseUtilization < 30)?.licenseUtilization || 0}%`,
      action: 'Requiere campaña de activación'
    },
    {
      type: 'opportunity',
      chamber: data.topPerformers[0]?.name || 'N/A',
      issue: 'Mejor práctica identificada',
      value: `${data.topPerformers[0]?.avgProgress || 0}% progreso`,
      action: 'Replicar metodología'
    },
    {
      type: 'alert',
      chamber: data.chamberStats.find(c => c.applications > 0 && (c.approvedApplications / c.applications) < 0.5)?.name || 'N/A',
      issue: 'Tasa de aprobación baja',
      value: `${Math.round(((data.chamberStats.find(c => c.applications > 0 && (c.approvedApplications / c.applications) < 0.5)?.approvedApplications || 0) / (data.chamberStats.find(c => c.applications > 0 && (c.approvedApplications / c.applications) < 0.5)?.applications || 1)) * 100)}%`,
      action: 'Revisar criterios de selección'
    }
  ];

  const roi_analysis = data.chamberStats.map(chamber => ({
    name: chamber.name,
    investment: chamber.totalInvestment,
    companies_impacted: chamber.companies,
    roi_per_company: chamber.companies > 0 ? chamber.totalInvestment / chamber.companies : 0,
    efficiency_score: chamber.companies > 0 && chamber.licensesAvailable > 0 
      ? (chamber.companies / chamber.licensesAvailable) * 100 
      : 0
  })).sort((a, b) => b.efficiency_score - a.efficiency_score);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Executive KPIs Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <ExecutiveKPI
          title="Cámaras Activas"
          value={data.chamberStats.length}
          format="number"
          icon={Building}
          trend="neutral"
          trendValue="0"
          subtitle="Participando en el programa"
        />
        <ExecutiveKPI
          title="Promedio de Progreso"
          value={Math.round(data.chamberStats.reduce((sum, c) => sum + c.avgProgress, 0) / data.chamberStats.length)}
          format="percentage"
          icon={TrendingUp}
          trend="neutral"
          trendValue=""
          subtitle="Promedio entre todas las cámaras"
        />
        <ExecutiveKPI
          title="Utilización Promedio"
          value={Math.round(data.chamberStats.reduce((sum, c) => sum + c.licenseUtilization, 0) / data.chamberStats.length)}
          format="percentage"
          icon={Target}
          trend="neutral"
          trendValue=""
          subtitle="De licencias disponibles"
        />
        <ExecutiveKPI
          title="Inversión Total"
          value={data.chamberStats.reduce((sum, c) => sum + c.totalInvestment, 0)}
          format="currency"
          icon={DollarSign}
          trend="neutral"
          trendValue=""
          subtitle="Movilizada por cámaras"
        />
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InteractiveChart
          title="Benchmark de Rendimiento"
          description="Comparación de progreso promedio entre cámaras"
          data={benchmarkData}
          type="bar"
          config={chartConfig}
          xAxisKey="name"
          yAxisKey="avgProgress"
          onDataPointClick={(data) => console.log('Chamber selected:', data)}
        />

        <InteractiveChart
          title="Utilización de Licencias"
          description="Licencias utilizadas vs disponibles por cámara"
          data={data.utilizationData}
          type="bar"
          config={chartConfig}
          xAxisKey="name"
          yAxisKey={['used', 'available']}
          onDataPointClick={(data) => console.log('License data selected:', data)}
        />
      </div>

      {/* Performance Analysis Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InteractiveChart
          title="Inversión Movilizada por Cámara"
          description="Monto total de inversión en IA generada por cada cámara (millones USD)"
          data={benchmarkData}
          type="bar"
          config={chartConfig}
          xAxisKey="name"
          yAxisKey="investment"
          onDataPointClick={(data) => console.log('Investment selected:', data)}
        />

        <InteractiveChart
          title="Impacto Empresarial"
          description="Número de empresas impactadas por cámara"
          data={benchmarkData}
          type="bar"
          config={chartConfig}
          xAxisKey="name"
          yAxisKey="companies"
          onDataPointClick={(data) => console.log('Company impact selected:', data)}
        />
      </div>

      {/* Performance Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chamber Ranking */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-warning" />
              Ranking General de Cámaras
            </CardTitle>
            <CardDescription>
              Clasificación basada en progreso, utilización y aprobaciones
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {performanceRanking.slice(0, 8).map((chamber) => (
              <div key={chamber.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs font-bold">
                      #{chamber.rank}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm line-clamp-1">
                      {chamber.name}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{chamber.companies} empresas</span>
                      <span>•</span>
                      <span>{chamber.licensesUsed}/{chamber.licensesAvailable} licencias</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <Badge 
                    variant={chamber.rank <= 3 ? 'default' : 'secondary'}
                    className="mb-1"
                  >
                    {chamber.performanceScore}
                  </Badge>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-muted-foreground">
                      {chamber.avgProgress}% progreso
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* ROI Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Análisis de Eficiencia
            </CardTitle>
            <CardDescription>
              ROI y eficiencia por cámara
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {roi_analysis.slice(0, 8).map((chamber, index) => (
              <div key={chamber.name} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div>
                  <p className="font-medium text-sm line-clamp-1">
                    {chamber.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {chamber.companies_impacted} empresas impactadas
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">
                    ${(chamber.roi_per_company / 1000000).toFixed(1)}M
                  </div>
                  <div className="text-xs text-muted-foreground">
                    por empresa
                  </div>
                  <Badge 
                    variant="outline" 
                    className="mt-1 text-xs"
                  >
                    {chamber.efficiency_score.toFixed(0)}% eficiencia
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Alerts and Opportunities */}
      <Card className="border-warning/50 bg-gradient-to-r from-warning/5 to-warning/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-warning" />
            Alertas y Oportunidades de Mejora
          </CardTitle>
          <CardDescription>
            Identificación de áreas críticas y mejores prácticas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {alertsAndOpportunities.map((item, index) => (
              <div 
                key={index} 
                className={`p-4 rounded-lg border ${
                  item.type === 'alert' 
                    ? 'border-destructive/20 bg-destructive/5' 
                    : 'border-success/20 bg-success/5'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {item.type === 'alert' ? (
                    <AlertCircle className="h-4 w-4 text-destructive" />
                  ) : (
                    <ArrowUpRight className="h-4 w-4 text-success" />
                  )}
                  <Badge variant={item.type === 'alert' ? 'destructive' : 'default'}>
                    {item.type === 'alert' ? 'Alerta' : 'Oportunidad'}
                  </Badge>
                </div>
                <h4 className="font-medium text-sm mb-1">{item.chamber}</h4>
                <p className="text-xs text-muted-foreground mb-2">{item.issue}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{item.value}</span>
                  <Button size="sm" variant="outline" className="h-6 text-xs">
                    Acción
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{item.action}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Chamber Performance Summary */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Resumen de Rendimiento por Cámaras
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary mb-1">
                {data.topPerformers[0]?.avgProgress || 0}%
              </div>
              <p className="text-sm text-muted-foreground">
                Mejor progreso promedio ({data.topPerformers[0]?.name})
              </p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary mb-1">
                {Math.max(...data.chamberStats.map(c => c.licenseUtilization))}%
              </div>
              <p className="text-sm text-muted-foreground">
                Mayor utilización de licencias
              </p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary mb-1">
                {data.chamberStats.reduce((sum, c) => sum + c.companies, 0)}
              </div>
              <p className="text-sm text-muted-foreground">
                Total empresas impactadas
              </p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary mb-1">
                {data.chamberStats.reduce((sum, c) => sum + c.totalCertificates, 0)}
              </div>
              <p className="text-sm text-muted-foreground">
                Certificados obtenidos totales
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}