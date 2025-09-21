import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Building2, 
  Search, 
  Filter, 
  Download, 
  Users, 
  DollarSign,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { useEmpresas, useCamaras } from '@/hooks/useSupabaseData';
import { useAuth, hasPermission } from '@/contexts/AuthContext';

const StatCard = ({ title, value, description, icon: Icon }: {
  title: string;
  value: number | string;
  description: string;
  icon: any;
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

export default function Empresas() {
  const { profile } = useAuth();
  const { empresas, loading } = useEmpresas();
  const { camaras } = useCamaras();
  const [searchTerm, setSearchTerm] = useState('');
  const [chamberFilter, setChamberFilter] = useState('todas');
  const [sectorFilter, setSectorFilter] = useState('todos');
  const [aiFilter, setAiFilter] = useState('todos');

  if (!profile) return null;

  const canViewGlobal = hasPermission(profile.role, 'view_global') || hasPermission(profile.role, 'view_all');

  // Filter companies based on user permissions
  const baseCompanies = canViewGlobal 
    ? empresas 
    : empresas.filter(empresa => empresa.camaras?.nombre === profile.chamber);

  // Apply filters
  const filteredCompanies = baseCompanies.filter(empresa => {
    const matchesSearch = 
      empresa.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      empresa.nit.includes(searchTerm);
    
    const matchesChamber = chamberFilter === 'todas' || empresa.camaras?.nombre === chamberFilter;
    const matchesSector = sectorFilter === 'todos' || empresa.sector === sectorFilter;
    const matchesAI = aiFilter === 'todos' || 
      (aiFilter === 'con_ia' && empresa.decision_adoptar_ia) ||
      (aiFilter === 'sin_ia' && !empresa.decision_adoptar_ia);

    return matchesSearch && matchesChamber && matchesSector && matchesAI;
  });

  // Calculate stats
  const stats = {
    total: baseCompanies.length,
    withAI: baseCompanies.filter(empresa => empresa.decision_adoptar_ia).length,
    totalInvestment: baseCompanies.reduce((sum, empresa) => sum + (empresa.monto_inversion_2024 || 0), 0),
    averageEmployees: Math.round(
      baseCompanies.reduce((sum, empresa) => sum + (empresa.num_colaboradores || 0), 0) / Math.max(1, baseCompanies.length)
    ),
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('es-CO').format(num);
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-primary bg-clip-text text-transparent">
            Empresas
          </h1>
          <p className="text-muted-foreground">Cargando datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-primary bg-clip-text text-transparent">
            Empresas
          </h1>
          <p className="text-muted-foreground">
            {canViewGlobal 
              ? 'Directorio completo de empresas participantes' 
              : `Empresas de ${profile?.chamber}`
            }
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          title="Total Empresas"
          value={stats.total}
          description="Empresas registradas"
          icon={Building2}
        />
        <StatCard
          title="Con IA Implementada"
          value={`${stats.withAI} (${Math.round((stats.withAI / stats.total) * 100)}%)`}
          description="Ya adoptaron IA"
          icon={Zap}
        />
        <StatCard
          title="Inversión Total IA"
          value={formatCurrency(stats.totalInvestment)}
          description="Inversión 2024"
          icon={DollarSign}
        />
        <StatCard
          title="Empleados Promedio"
          value={stats.averageEmployees}
          description="Por empresa"
          icon={Users}
        />
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros de Búsqueda
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Nombre empresa, NIT..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {canViewGlobal && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Cámara</label>
                <Select value={chamberFilter} onValueChange={setChamberFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas las cámaras" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas las cámaras</SelectItem>
                    {camaras.map(camara => (
                      <SelectItem key={camara.id} value={camara.nombre}>{camara.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Sector</label>
              <Select value={sectorFilter} onValueChange={setSectorFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los sectores" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los sectores</SelectItem>
                  {['Tecnología', 'Comercio', 'Manufactura', 'Servicios', 'Agricultura', 'Turismo', 'Construcción', 'Transporte', 'Educación', 'Salud'].map(sector => (
                    <SelectItem key={sector} value={sector}>{sector}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Estado IA</label>
              <Select value={aiFilter} onValueChange={setAiFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="con_ia">Con IA</SelectItem>
                  <SelectItem value="sin_ia">Sin IA</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Companies Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredCompanies.slice(0, 24).map((empresa) => (
          <Card key={empresa.nit} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg line-clamp-1">{empresa.nombre}</CardTitle>
                  <CardDescription>{empresa.nit}</CardDescription>
                </div>
                {empresa.decision_adoptar_ia && (
                  <Badge className="bg-gradient-primary text-white border-none">
                    <Zap className="h-3 w-3 mr-1" />
                    IA
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Sector</p>
                  <p className="font-medium">{empresa.sector || 'No especificado'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Empleados</p>
                  <p className="font-medium">{formatNumber(empresa.num_colaboradores || 0)}</p>
                </div>
              </div>

              {/* Chamber */}
              {canViewGlobal && (
                <div>
                  <p className="text-muted-foreground text-sm">Cámara</p>
                  <p className="text-sm font-medium line-clamp-2">{empresa.camaras?.nombre || 'No especificada'}</p>
                </div>
              )}

              {/* AI Investment */}
              {empresa.monto_inversion_2024 && empresa.monto_inversion_2024 > 0 && (
                <div className="bg-muted/50 p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground">Inversión IA 2024</p>
                  <p className="font-semibold text-primary">
                    {formatCurrency(empresa.monto_inversion_2024)}
                  </p>
                </div>
              )}

              {/* Capacitación */}
              {empresa.colaboradores_capacitados_ia && empresa.colaboradores_capacitados_ia > 0 && (
                <div className="text-sm">
                  <p className="text-muted-foreground">Colaboradores capacitados en IA</p>
                  <p className="font-medium">{empresa.colaboradores_capacitados_ia}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCompanies.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No se encontraron empresas</h3>
            <p className="text-muted-foreground text-center">
              Intenta ajustar los filtros de búsqueda para encontrar las empresas que buscas.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}