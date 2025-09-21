import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Building2, 
  Award, 
  TrendingUp, 
  Target,
  BookOpen,
  DollarSign,
  BarChart3
} from 'lucide-react';
import { mockStats, mockApplications } from '@/data/mockData';
import { useAuth, hasPermission } from '@/contexts/AuthContext';

const StatCard = ({ title, value, description, icon: Icon, trend, variant = 'default' }: {
  title: string;
  value: string | number;
  description: string;
  icon: any;
  trend?: string;
  variant?: 'default' | 'primary' | 'success';
}) => (
  <Card className={`${variant === 'primary' ? 'bg-gradient-primary text-white border-none' : ''}`}>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className={`h-4 w-4 ${variant === 'primary' ? 'text-white/80' : 'text-muted-foreground'}`} />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className={`text-xs ${variant === 'primary' ? 'text-white/80' : 'text-muted-foreground'}`}>
        {description}
        {trend && <span className="ml-1 text-green-500">{trend}</span>}
      </p>
    </CardContent>
  </Card>
);

export default function Dashboard() {
  const { user } = useAuth();
  
  if (!user) return null;

  const canViewGlobal = hasPermission(user.role, 'view_global') || hasPermission(user.role, 'view_all');
  const userChamberData = user.chamber ? 
    mockStats.chamberStats.find(stat => stat.name === user.chamber) : null;

  const displayStats = canViewGlobal ? mockStats : {
    totalLicenses: 100, // Simulated chamber limit
    usedLicenses: userChamberData?.approved || 0,
    totalApplications: userChamberData?.applications || 0,
    approvedApplications: userChamberData?.approved || 0,
    completedTests: userChamberData?.completed || 0,
    averageProgress: userChamberData?.averageProgress || 0,
  };

  const recentApplications = mockApplications
    .filter(app => canViewGlobal || app.chamber === user.chamber)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      'aprobado': 'default',
      'pendiente': 'secondary',
      'rechazado': 'destructive',
      'en_proceso': 'outline',
    };
    const labels: Record<string, string> = {
      'aprobado': 'Aprobado',
      'pendiente': 'Pendiente',
      'rechazado': 'Rechazado',
      'en_proceso': 'En Proceso',
    };
    return (
      <Badge variant={variants[status] || 'default'}>
        {labels[status] || status}
      </Badge>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-primary bg-clip-text text-transparent">
          Dashboard
        </h1>
        <p className="text-muted-foreground">
          {canViewGlobal 
            ? 'Visión general del programa de Adopción de IA' 
            : `Panel de ${user.chamber}`
          }
        </p>
      </div>

      {/* License Usage (Priority for CCC) */}
      {canViewGlobal && (
        <Card className="border-primary/20 bg-primary-light">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Consumo de Licencias Platzi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">
                  {mockStats.usedLicenses} de {mockStats.totalLicenses} licencias utilizadas
                </span>
                <span className="text-sm text-muted-foreground">
                  {Math.round((mockStats.usedLicenses / mockStats.totalLicenses) * 100)}%
                </span>
              </div>
              <Progress 
                value={(mockStats.usedLicenses / mockStats.totalLicenses) * 100} 
                className="h-3"
              />
              <p className="text-xs text-muted-foreground">
                {mockStats.totalLicenses - mockStats.usedLicenses} licencias disponibles
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Solicitudes"
          value={displayStats.totalApplications}
          description="Empresarios registrados"
          icon={Users}
          variant="primary"
        />
        <StatCard
          title="Solicitudes Aprobadas"
          value={displayStats.approvedApplications}
          description={`${Math.round((displayStats.approvedApplications / displayStats.totalApplications) * 100)}% del total`}
          icon={Award}
          trend="+12%"
        />
        <StatCard
          title="Tests Completados"
          value={displayStats.completedTests}
          description="Diagnósticos finalizados"
          icon={BookOpen}
        />
        <StatCard
          title="Progreso Promedio"
          value={`${displayStats.averageProgress}%`}
          description="En rutas de aprendizaje"
          icon={TrendingUp}
        />
      </div>

      {/* Chamber Stats (Only for global view) */}
      {canViewGlobal && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Rendimiento por Cámara
            </CardTitle>
            <CardDescription>
              Estado de adopción en cada cámara aliada
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockStats.chamberStats.slice(0, 6).map((chamber, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{chamber.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {chamber.applications} solicitudes • {chamber.completed} tests completados
                    </p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-sm font-medium">{chamber.averageProgress}%</p>
                    <p className="text-xs text-muted-foreground">progreso</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Applications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Solicitudes Recientes
          </CardTitle>
          <CardDescription>
            Últimas solicitudes de licencias procesadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentApplications.map((app) => (
              <div key={app.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                <div className="space-y-1">
                  <p className="text-sm font-medium">
                    {app.firstName} {app.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {app.company} • {app.chamber}
                  </p>
                </div>
                <div className="text-right space-y-1">
                  {getStatusBadge(app.status)}
                  <p className="text-xs text-muted-foreground">
                    {new Date(app.createdAt).toLocaleDateString('es-CO')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}