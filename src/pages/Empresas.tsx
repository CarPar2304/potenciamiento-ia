import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Building2, 
  Search, 
  Filter, 
  Download, 
  Users, 
  DollarSign,
  TrendingUp,
  Zap,
  Eye,
  MapPin,
  Calendar,
  Phone,
  Mail,
  Building,
  Briefcase,
  Hash,
  Target,
  Globe,
  Coins,
  Brain,
  UserCheck,
} from 'lucide-react';
import { useEmpresas, useCamaras, useSolicitudes } from '@/hooks/useSupabaseData';
import { useAuth, hasPermission } from '@/contexts/AuthContext';

const StatCard = ({ title, value, description, icon: Icon, variant }: {
  title: string;
  value: number | string;
  description: string;
  icon: any;
  variant: 'primary' | 'success' | 'warning' | 'info';
}) => {
  const variants = {
    primary: {
      bg: 'bg-primary/10',
      icon: 'text-primary',
      border: 'border-primary/20'
    },
    success: {
      bg: 'bg-green-500/10',
      icon: 'text-green-600',
      border: 'border-green-500/20'
    },
    warning: {
      bg: 'bg-amber-500/10', 
      icon: 'text-amber-600',
      border: 'border-amber-500/20'
    },
    info: {
      bg: 'bg-blue-500/10',
      icon: 'text-blue-600', 
      border: 'border-blue-500/20'
    }
  };

  const style = variants[variant];

  return (
    <Card className={`relative overflow-hidden group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-l-4 ${style.border}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={`p-2 rounded-lg ${style.bg}`}>
          <Icon className={`h-4 w-4 ${style.icon}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </CardContent>
    </Card>
  );
};

const EmpresaCard = ({ empresa, canViewGlobal, onViewDetails, colaboradores }: {
  empresa: any;
  canViewGlobal: boolean;
  onViewDetails: () => void;
  colaboradores: any[];
}) => {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
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

  const hasAI = empresa.decision_adoptar_ia === 'Sí';
  const empresaColaboradores = colaboradores.filter(col => col.empresas?.nit === empresa.nit);

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-l-4 border-l-primary/20 hover:border-l-primary">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3 min-w-0 flex-1">
            <Avatar className="h-10 w-10 flex-shrink-0">
              <AvatarFallback className="bg-gradient-primary text-white text-sm font-medium">
                {getInitials(empresa.nombre)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-base text-foreground">{empresa.nombre}</h3>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Hash className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{empresa.nit}</span>
              </p>
            </div>
          </div>
          {hasAI && (
            <Badge className="bg-gradient-primary text-white border-none shrink-0 ml-2">
              <Zap className="h-3 w-3 mr-1" />
              IA
            </Badge>
          )}
        </div>

        <div className="space-y-3 mb-4">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Building className="h-4 w-4 text-primary/60" />
              <span className="truncate">{empresa.sector || 'Sin sector'}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4 text-primary/60" />
              <span>{formatNumber(empresa.num_colaboradores || 0)} empleados</span>
            </div>
            {canViewGlobal && (
              <div className="flex items-center gap-2 text-muted-foreground col-span-2">
                <MapPin className="h-4 w-4 text-primary/60" />
                <span className="truncate">{empresa.camaras?.nombre || 'Sin cámara'}</span>
              </div>
            )}
          </div>
        </div>

        {/* Investment and AI indicators */}
        {(empresa.monto_inversion_2024 > 0 || empresa.colaboradores_capacitados_ia > 0) && (
          <div className="bg-muted/20 rounded-lg p-3 mb-4 space-y-2">
            {empresa.monto_inversion_2024 > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  Inversión IA 2024
                </span>
                <span className="font-semibold text-primary">
                  {formatCurrency(empresa.monto_inversion_2024)}
                </span>
              </div>
            )}
            {empresa.colaboradores_capacitados_ia > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Brain className="h-3 w-3" />
                  Capacitados en IA
                </span>
                <span className="font-semibold">{empresa.colaboradores_capacitados_ia}</span>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-muted/20">
          <Badge 
            variant="secondary" 
            className="text-xs bg-blue-100 text-blue-700 border-blue-200"
          >
            {empresaColaboradores.length} colaborador{empresaColaboradores.length !== 1 ? 'es' : ''}
          </Badge>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onViewDetails}
            className="text-primary hover:text-primary/80 hover:bg-primary/10 transition-colors"
          >
            <Eye className="h-4 w-4 mr-1" />
            Ver detalles
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const EmpresaDetailDialog = ({ empresa, isOpen, onClose, colaboradores }: {
  empresa: any;
  isOpen: boolean;
  onClose: () => void;
  colaboradores: any[];
}) => {
  if (!empresa) return null;

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

  const empresaColaboradores = colaboradores.filter(col => col.empresas?.nit === empresa.nit);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Detalles de la Empresa
          </DialogTitle>
          <DialogDescription>
            Información completa de la empresa y sus colaboradores
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Información Básica */}
          <div className="bg-muted/20 rounded-lg p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Building className="h-4 w-4" />
              Información Básica
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <label className="font-medium text-muted-foreground">Nombre</label>
                <p>{empresa.nombre}</p>
              </div>
              <div>
                <label className="font-medium text-muted-foreground">NIT</label>
                <p>{empresa.nit}</p>
              </div>
              <div>
                <label className="font-medium text-muted-foreground">Sector</label>
                <p>{empresa.sector || 'No especificado'}</p>
              </div>
              <div>
                <label className="font-medium text-muted-foreground">Mercado</label>
                <p>{empresa.mercado || 'No especificado'}</p>
              </div>
              <div>
                <label className="font-medium text-muted-foreground">Productos/Servicios</label>
                <p>{empresa.productos_servicios || 'No especificado'}</p>
              </div>
              <div>
                <label className="font-medium text-muted-foreground">Tipo de cliente</label>
                <p>{empresa.tipo_cliente || 'No especificado'}</p>
              </div>
            </div>
          </div>

          {/* Información Financiera y RH */}
          <div className="bg-muted/20 rounded-lg p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Información Financiera y RRHH
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <label className="font-medium text-muted-foreground">Ventas 2024</label>
                <p>{empresa.ventas_2024 ? formatCurrency(empresa.ventas_2024) : 'No reportado'}</p>
              </div>
              <div>
                <label className="font-medium text-muted-foreground">Utilidades 2024</label>
                <p>{empresa.utilidades_2024 ? formatCurrency(empresa.utilidades_2024) : 'No reportado'}</p>
              </div>
              <div>
                <label className="font-medium text-muted-foreground">Total Colaboradores</label>
                <p>{formatNumber(empresa.num_colaboradores || 0)}</p>
              </div>
              <div>
                <label className="font-medium text-muted-foreground">Mujeres Colaboradoras</label>
                <p>{formatNumber(empresa.mujeres_colaboradoras || 0)}</p>
              </div>
            </div>
          </div>

          {/* Información de IA */}
          <div className="bg-muted/20 rounded-lg p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Adopción de Inteligencia Artificial
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <label className="font-medium text-muted-foreground">Decisión de adoptar IA</label>
                <Badge variant={empresa.decision_adoptar_ia === 'Sí' ? 'default' : 'secondary'}>
                  {empresa.decision_adoptar_ia || 'No definido'}
                </Badge>
              </div>
              <div>
                <label className="font-medium text-muted-foreground">Invirtió en IA 2024</label>
                <Badge variant={empresa.invirtio_ia_2024 === 'Sí' ? 'default' : 'secondary'}>
                  {empresa.invirtio_ia_2024 || 'No definido'}
                </Badge>
              </div>
              <div>
                <label className="font-medium text-muted-foreground">Monto inversión 2024</label>
                <p>{empresa.monto_inversion_2024 ? formatCurrency(empresa.monto_inversion_2024) : 'No reportado'}</p>
              </div>
              <div>
                <label className="font-medium text-muted-foreground">Colaboradores capacitados</label>
                <p>{empresa.colaboradores_capacitados_ia || 0}</p>
              </div>
              <div>
                <label className="font-medium text-muted-foreground">Plan de capacitación</label>
                <Badge variant={empresa.plan_capacitacion_ia === 'Sí' ? 'default' : 'secondary'}>
                  {empresa.plan_capacitacion_ia || 'No definido'}
                </Badge>
              </div>
              <div>
                <label className="font-medium text-muted-foreground">Áreas de implementación</label>
                <p>{empresa.areas_implementacion_ia || 'No especificado'}</p>
              </div>
            </div>
          </div>

          {/* Colaboradores */}
          <div className="bg-muted/20 rounded-lg p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Colaboradores ({empresaColaboradores.length})
            </h3>
            {empresaColaboradores.length > 0 ? (
              <div className="space-y-3">
                {empresaColaboradores.map((colaborador, index) => (
                  <div key={index} className="bg-background rounded-lg p-3 border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{colaborador.nombres_apellidos}</p>
                        <p className="text-sm text-muted-foreground">{colaborador.email}</p>
                        {colaborador.cargo && (
                          <p className="text-xs text-muted-foreground">{colaborador.cargo}</p>
                        )}
                      </div>
                      <Badge variant={colaborador.estado === 'Aprobada' ? 'default' : 'secondary'}>
                        {colaborador.estado}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No hay colaboradores registrados para esta empresa</p>
            )}
          </div>

          {/* Cámara */}
          {empresa.camaras && (
            <div className="bg-muted/20 rounded-lg p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Cámara de Comercio
              </h3>
              <div className="text-sm">
                <p>{empresa.camaras.nombre}</p>
                <p className="text-muted-foreground">NIT: {empresa.camaras.nit}</p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default function Empresas() {
  const { profile } = useAuth();
  const { empresas, loading } = useEmpresas();
  const { camaras } = useCamaras();
  const { solicitudes } = useSolicitudes();
  const [searchTerm, setSearchTerm] = useState('');
  const [chamberFilter, setChamberFilter] = useState('todas');
  const [sectorFilter, setSectorFilter] = useState('todos');
  const [aiFilter, setAiFilter] = useState('todos');
  const [selectedEmpresa, setSelectedEmpresa] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

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
      (aiFilter === 'con_ia' && empresa.decision_adoptar_ia === 'Sí') ||
      (aiFilter === 'sin_ia' && empresa.decision_adoptar_ia === 'No');

    return matchesSearch && matchesChamber && matchesSector && matchesAI;
  });

  // Calculate stats
  const stats = {
    total: baseCompanies.length,
    withAI: baseCompanies.filter(empresa => empresa.decision_adoptar_ia === 'Sí').length,
    totalInvestment: baseCompanies.reduce((sum, empresa) => sum + (empresa.monto_inversion_2024 || 0), 0),
    averageEmployees: Math.round(
      baseCompanies.reduce((sum, empresa) => sum + (empresa.num_colaboradores || 0), 0) / Math.max(1, baseCompanies.length)
    ),
  };

  const handleViewDetails = (empresa: any) => {
    setSelectedEmpresa(empresa);
    setShowDetails(true);
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

      {/* Enhanced Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          title="Total Empresas"
          value={stats.total}
          description="Empresas registradas"
          icon={Building2}
          variant="primary"
        />
        <StatCard
          title="Con IA Implementada"
          value={`${stats.withAI} (${Math.round((stats.withAI / Math.max(1, stats.total)) * 100)}%)`}
          description="Ya adoptaron IA"
          icon={Zap}
          variant="success"
        />
        <StatCard
          title="Inversión Total IA"
          value={formatCurrency(stats.totalInvestment)}
          description="Inversión 2024"
          icon={DollarSign}
          variant="warning"
        />
        <StatCard
          title="Empleados Promedio"
          value={stats.averageEmployees}
          description="Por empresa"
          icon={Users}
          variant="info"
        />
      </div>

      {/* Enhanced Filters */}
      <Card className="border-0 shadow-sm bg-gradient-to-r from-background to-muted/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
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
                  className="pl-10 transition-all focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            {canViewGlobal && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Cámara</label>
                <Select value={chamberFilter} onValueChange={setChamberFilter}>
                  <SelectTrigger className="transition-all focus:ring-2 focus:ring-primary/20">
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
                <SelectTrigger className="transition-all focus:ring-2 focus:ring-primary/20">
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
                <SelectTrigger className="transition-all focus:ring-2 focus:ring-primary/20">
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

      {/* Enhanced Companies Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredCompanies.slice(0, 24).map((empresa) => (
          <EmpresaCard
            key={empresa.nit}
            empresa={empresa}
            canViewGlobal={canViewGlobal}
            onViewDetails={() => handleViewDetails(empresa)}
            colaboradores={solicitudes}
          />
        ))}
      </div>

      {filteredCompanies.length === 0 && (
        <Card className="border-0 shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No se encontraron empresas</h3>
            <p className="text-muted-foreground text-center">
              Intenta ajustar los filtros de búsqueda para encontrar las empresas que buscas.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Detail Dialog */}
      <EmpresaDetailDialog
        empresa={selectedEmpresa}
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
        colaboradores={solicitudes}
      />
    </div>
  );
}