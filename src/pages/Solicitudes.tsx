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
  Search, 
  Filter, 
  Download, 
  Users, 
  CheckCircle, 
  Clock, 
  XCircle,
  FileText,
  Eye,
  MapPin,
  Calendar,
  Phone,
  Mail,
  Building,
  User,
  Briefcase,
  GraduationCap,
  Hash,
  TrendingUp,
} from 'lucide-react';
import { useSolicitudes, useCamaras } from '@/hooks/useSupabaseData';
import { useAuth, hasPermission } from '@/contexts/AuthContext';

const StatCard = ({ title, value, description, icon: Icon, gradient }: {
  title: string;
  value: number;
  description: string;
  icon: any;
  gradient: string;
}) => (
  <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
    <div className={`absolute inset-0 ${gradient} opacity-5 group-hover:opacity-10 transition-opacity`} />
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      <div className={`p-2 rounded-lg ${gradient} bg-opacity-10`}>
        <Icon className="h-4 w-4 text-primary" />
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">{value}</div>
      <p className="text-xs text-muted-foreground mt-1">{description}</p>
    </CardContent>
  </Card>
);

const SolicitudCard = ({ solicitud, canViewGlobal, onViewDetails }: {
  solicitud: any;
  canViewGlobal: boolean;
  onViewDetails: () => void;
}) => {
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Aprobada': 'text-green-700 bg-green-50 border-green-200',
      'Pendiente': 'text-amber-700 bg-amber-50 border-amber-200',
      'Rechazada': 'text-red-700 bg-red-50 border-red-200',
    };
    return colors[status] || 'text-gray-700 bg-gray-50 border-gray-200';
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <Card className="group hover:shadow-md transition-all duration-200 hover:-translate-y-1 cursor-pointer border-l-4 border-l-primary/20 hover:border-l-primary/60">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-gradient-primary text-white text-sm font-medium">
                {getInitials(solicitud.nombres_apellidos)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-base">{solicitud.nombres_apellidos}</h3>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Mail className="h-3 w-3" />
                {solicitud.email}
              </p>
            </div>
          </div>
          <Badge className={getStatusColor(solicitud.estado)}>
            {solicitud.estado}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Building className="h-4 w-4" />
            <span>{solicitud.empresas?.nombre || 'N/A'}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Hash className="h-4 w-4" />
            <span>{solicitud.empresas?.nit || 'N/A'}</span>
          </div>
          {canViewGlobal && (
            <>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{solicitud.empresas?.camaras?.nombre || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <TrendingUp className="h-4 w-4" />
                <span>{solicitud.empresas?.sector || 'N/A'}</span>
              </div>
            </>
          )}
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{new Date(solicitud.fecha_solicitud).toLocaleDateString('es-CO')}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Briefcase className="h-4 w-4" />
            <span>{solicitud.cargo || 'N/A'}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-muted/20">
          <Badge variant="secondary" className="text-xs">
            Test: Pendiente
          </Badge>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onViewDetails}
            className="text-primary hover:text-primary/80 hover:bg-primary/5"
          >
            <Eye className="h-4 w-4 mr-1" />
            Ver detalles
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const SolicitudDetailDialog = ({ solicitud, isOpen, onClose }: {
  solicitud: any;
  isOpen: boolean;
  onClose: () => void;
}) => {
  if (!solicitud) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Detalles de la Solicitud
          </DialogTitle>
          <DialogDescription>
            Información completa del solicitante y su empresa
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Información Personal */}
          <div className="bg-muted/20 rounded-lg p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <User className="h-4 w-4" />
              Información Personal
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <label className="font-medium text-muted-foreground">Nombre completo</label>
                <p>{solicitud.nombres_apellidos}</p>
              </div>
              <div>
                <label className="font-medium text-muted-foreground">Email</label>
                <p>{solicitud.email}</p>
              </div>
              <div>
                <label className="font-medium text-muted-foreground">Documento</label>
                <p>{solicitud.numero_documento}</p>
              </div>
              <div>
                <label className="font-medium text-muted-foreground">Celular</label>
                <p>{solicitud.celular || 'N/A'}</p>
              </div>
              <div>
                <label className="font-medium text-muted-foreground">Cargo</label>
                <p>{solicitud.cargo || 'N/A'}</p>
              </div>
              <div>
                <label className="font-medium text-muted-foreground">Nivel educativo</label>
                <p>{solicitud.nivel_educativo || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Información de Empresa */}
          {solicitud.empresas && (
            <div className="bg-muted/20 rounded-lg p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Building className="h-4 w-4" />
                Información de Empresa
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="font-medium text-muted-foreground">Empresa</label>
                  <p>{solicitud.empresas.nombre}</p>
                </div>
                <div>
                  <label className="font-medium text-muted-foreground">NIT</label>
                  <p>{solicitud.empresas.nit}</p>
                </div>
                <div>
                  <label className="font-medium text-muted-foreground">Sector</label>
                  <p>{solicitud.empresas.sector || 'N/A'}</p>
                </div>
                <div>
                  <label className="font-medium text-muted-foreground">Mercado</label>
                  <p>{solicitud.empresas.mercado || 'N/A'}</p>
                </div>
                <div>
                  <label className="font-medium text-muted-foreground">Colaboradores</label>
                  <p>{solicitud.empresas.num_colaboradores || 'N/A'}</p>
                </div>
                <div>
                  <label className="font-medium text-muted-foreground">Cámara</label>
                  <p>{solicitud.empresas.camaras?.nombre || 'N/A'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Estado y Fechas */}
          <div className="bg-muted/20 rounded-lg p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Estado y Seguimiento
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <label className="font-medium text-muted-foreground">Estado actual</label>
                <Badge className="mt-1">{solicitud.estado}</Badge>
              </div>
              <div>
                <label className="font-medium text-muted-foreground">Fecha de solicitud</label>
                <p>{new Date(solicitud.fecha_solicitud).toLocaleDateString('es-CO')}</p>
              </div>
              <div>
                <label className="font-medium text-muted-foreground">Test diagnóstico</label>
                <Badge variant="secondary">Pendiente</Badge>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default function Solicitudes() {
  const { profile } = useAuth();
  const { solicitudes, loading } = useSolicitudes();
  const { camaras } = useCamaras();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [chamberFilter, setChamberFilter] = useState('todas');
  const [sectorFilter, setSectorFilter] = useState('todos');
  const [selectedSolicitud, setSelectedSolicitud] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  if (!profile) return null;

  const canViewGlobal = hasPermission(profile.role, 'view_global') || hasPermission(profile.role, 'view_all');

  // Filter applications based on user permissions
  const baseApplications = canViewGlobal 
    ? solicitudes 
    : solicitudes.filter(sol => sol.empresas?.camaras?.nombre === profile.chamber);

  // Apply filters
  const filteredApplications = baseApplications.filter(sol => {
    const matchesSearch = 
      sol.nombres_apellidos.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sol.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sol.empresas?.nombre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      sol.numero_documento.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'todos' || sol.estado.toLowerCase() === statusFilter.toLowerCase();
    const matchesChamber = chamberFilter === 'todas' || sol.empresas?.camaras?.nombre === chamberFilter;
    const matchesSector = sectorFilter === 'todos' || sol.empresas?.sector === sectorFilter;

    return matchesSearch && matchesStatus && matchesChamber && matchesSector;
  });

  // Calculate stats
  const stats = {
    total: baseApplications.length,
    approved: baseApplications.filter(sol => sol.estado === 'Aprobada').length,
    pending: baseApplications.filter(sol => sol.estado === 'Pendiente').length,
    rejected: baseApplications.filter(sol => sol.estado === 'Rechazada').length,
  };

  const handleViewDetails = (solicitud: any) => {
    setSelectedSolicitud(solicitud);
    setShowDetails(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-primary bg-clip-text text-transparent">
            Solicitudes
          </h1>
          <p className="text-muted-foreground mt-1">
            {canViewGlobal 
              ? 'Gestiona todas las solicitudes de licencias Platzi' 
              : `Solicitudes de ${profile?.chamber}`
            }
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2 hover:bg-primary/5">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          title="Total Solicitudes"
          value={stats.total}
          description="Solicitudes registradas"
          icon={Users}
          gradient="bg-gradient-to-br from-blue-500 to-blue-600"
        />
        <StatCard
          title="Aprobadas"
          value={stats.approved}
          description="Licencias otorgadas"
          icon={CheckCircle}
          gradient="bg-gradient-to-br from-green-500 to-green-600"
        />
        <StatCard
          title="Pendientes"
          value={stats.pending}
          description="En revisión"
          icon={Clock}
          gradient="bg-gradient-to-br from-amber-500 to-amber-600"
        />
        <StatCard
          title="Rechazadas"
          value={stats.rejected}
          description="No cumplieron requisitos"
          icon={XCircle}
          gradient="bg-gradient-to-br from-red-500 to-red-600"
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
                  placeholder="Nombre, email, empresa..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 transition-all focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Estado</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="transition-all focus:ring-2 focus:ring-primary/20">
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los estados</SelectItem>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                  <SelectItem value="aprobada">Aprobada</SelectItem>
                  <SelectItem value="rechazada">Rechazada</SelectItem>
                </SelectContent>
              </Select>
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
          </div>
        </CardContent>
      </Card>

      {/* Modern Cards Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Lista de Solicitudes
          </h2>
          <p className="text-sm text-muted-foreground">
            {filteredApplications.length} de {baseApplications.length} solicitudes
          </p>
        </div>

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 bg-muted rounded-full" />
                      <div className="space-y-2">
                        <div className="h-4 bg-muted rounded w-32" />
                        <div className="h-3 bg-muted rounded w-24" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 bg-muted rounded w-20" />
                      <div className="h-3 bg-muted rounded w-16" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredApplications.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No se encontraron solicitudes</h3>
              <p className="text-muted-foreground">
                Intenta ajustar los filtros de búsqueda para encontrar las solicitudes que buscas.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredApplications.slice(0, 50).map((solicitud) => (
              <SolicitudCard
                key={solicitud.id}
                solicitud={solicitud}
                canViewGlobal={canViewGlobal}
                onViewDetails={() => handleViewDetails(solicitud)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Detail Dialog */}
      <SolicitudDetailDialog
        solicitud={selectedSolicitud}
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
      />
    </div>
  );
}