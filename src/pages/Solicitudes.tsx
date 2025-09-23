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
  BookOpen,
  Award,
  BarChart3,
  Send,
} from 'lucide-react';
import { useSolicitudes, useCamaras, usePlatziGeneral, usePlatziSeguimiento } from '@/hooks/useSupabaseData';
import { useAuth, hasPermission } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const StatCard = ({ title, value, description, icon: Icon, variant }: {
  title: string;
  value: number;
  description: string;
  icon: any;
  variant: 'primary' | 'success' | 'warning' | 'error';
}) => {
  const variants = {
    primary: {
      bg: 'bg-primary/10',
      icon: 'text-primary',
      border: 'border-l-primary'
    },
    success: {
      bg: 'bg-success/10',
      icon: 'text-success',
      border: 'border-l-success'
    },
    warning: {
      bg: 'bg-warning/10', 
      icon: 'text-warning',
      border: 'border-l-warning'
    },
    error: {
      bg: 'bg-destructive/10',
      icon: 'text-destructive', 
      border: 'border-l-destructive'
    }
  };

  const style = variants[variant];

  return (
    <Card className={`relative overflow-hidden group hover:shadow-card transition-all duration-300 hover:-translate-y-1 animate-fade-in border-l-4 ${style.border} backdrop-blur-sm`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={`p-3 rounded-xl ${style.bg} group-hover:scale-110 transition-transform duration-300`}>
          <Icon className={`h-5 w-5 ${style.icon}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300">{value}</div>
        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  );
};

const SolicitudCard = ({ solicitud, canViewGlobal, onViewDetails, platziData, onSendReminder }: {
  solicitud: any;
  canViewGlobal: boolean;
  onViewDetails: () => void;
  platziData: any[];
  onSendReminder: (solicitud: any) => void;
}) => {
  const getStatusConfig = (status: string) => {
    const configs: Record<string, { color: string; bg: string; border: string }> = {
      'Aprobada': { 
        color: 'text-success-foreground', 
        bg: 'bg-success/10 border-success/20', 
        border: 'hover:bg-success/20' 
      },
      'Pendiente': { 
        color: 'text-warning-foreground', 
        bg: 'bg-warning/10 border-warning/20', 
        border: 'hover:bg-warning/20' 
      },
      'Rechazada': { 
        color: 'text-destructive-foreground', 
        bg: 'bg-destructive/10 border-destructive/20', 
        border: 'hover:bg-destructive/20' 
      },
    };
    return configs[status] || { 
      color: 'text-muted-foreground', 
      bg: 'bg-muted/10 border-muted/20', 
      border: 'hover:bg-muted/20' 
    };
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Verificar si ya hizo el test (existe en platzi_general)
  const hasCompletedTest = platziData.some(p => p.email === solicitud.email);
  const isApproved = solicitud.estado === 'Aprobada';

  const statusConfig = getStatusConfig(solicitud.estado);

  return (
    <Card className="group hover:shadow-card transition-all duration-500 hover:-translate-y-2 border-l-4 border-l-primary/30 hover:border-l-primary animate-fade-in backdrop-blur-sm hover:bg-gradient-secondary/5">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-4 min-w-0 flex-1">
            <Avatar className="h-12 w-12 flex-shrink-0 ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all duration-300">
              <AvatarFallback className="bg-gradient-primary text-primary-foreground text-sm font-bold group-hover:scale-110 transition-transform duration-300">
                {getInitials(solicitud.nombres_apellidos)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors duration-300">{solicitud.nombres_apellidos}</h3>
              <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                <Mail className="h-4 w-4 flex-shrink-0 text-primary/60" />
                <span className="truncate">{solicitud.email}</span>
              </p>
            </div>
          </div>
          <Badge className={`${statusConfig.color} ${statusConfig.bg} transition-all duration-300 ${statusConfig.border} border font-medium px-3 py-1 shrink-0 ml-3`}>
            {solicitud.estado}
          </Badge>
        </div>

        <div className="space-y-3 mb-6">
          <div className="grid grid-cols-1 gap-3 text-sm">
            <div className="flex items-center gap-3 text-muted-foreground p-2 rounded-lg bg-muted/5 hover:bg-muted/10 transition-colors">
              <div className="p-1.5 rounded-md bg-primary/10">
                <Building className="h-4 w-4 text-primary" />
              </div>
              <span className="truncate font-medium">{solicitud.empresas?.nombre || 'Sin empresa'}</span>
            </div>
            {solicitud.cargo && (
              <div className="flex items-center gap-3 text-muted-foreground p-2 rounded-lg bg-muted/5 hover:bg-muted/10 transition-colors">
                <div className="p-1.5 rounded-md bg-primary/10">
                  <Briefcase className="h-4 w-4 text-primary" />
                </div>
                <span className="truncate font-medium">{solicitud.cargo}</span>
              </div>
            )}
            <div className="flex items-center gap-3 text-muted-foreground p-2 rounded-lg bg-muted/5 hover:bg-muted/10 transition-colors">
              <div className="p-1.5 rounded-md bg-primary/10">
                <Calendar className="h-4 w-4 text-primary" />
              </div>
              <span className="font-medium">{new Date(solicitud.fecha_solicitud).toLocaleDateString('es-CO')}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gradient-primary/10">
          {isApproved && (
            <Badge 
              variant={hasCompletedTest ? "default" : "secondary"} 
              className={`text-xs font-semibold px-3 py-1.5 ${hasCompletedTest 
                ? 'bg-success/10 text-success border-success/20 hover:bg-success/20' 
                : 'bg-warning/10 text-warning border-warning/20 hover:bg-warning/20'
              } transition-all duration-300`}
            >
              {hasCompletedTest ? 'Licencia consumida' : 'Licencia no consumida'}
            </Badge>
          )}
          {!isApproved && <div />}
          <div className="flex items-center gap-3">
            {isApproved && !hasCompletedTest && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onSendReminder(solicitud)}
                className="text-warning hover:text-warning-foreground hover:bg-warning/10 border-warning/30 hover:border-warning transition-all duration-300 font-medium shadow-sm hover:shadow-md"
              >
                <Send className="h-4 w-4 mr-2" />
                Enviar recordatorio
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onViewDetails}
              className="text-primary hover:text-primary-foreground hover:bg-primary/90 transition-all duration-300 font-medium shadow-sm hover:shadow-md"
            >
              <Eye className="h-4 w-4 mr-2" />
              Ver detalles
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const SolicitudDetailDialog = ({ solicitud, isOpen, onClose, platziSeguimiento }: {
  solicitud: any;
  isOpen: boolean;
  onClose: () => void;
  platziSeguimiento: any[];
}) => {
  if (!solicitud) return null;

  // Filtrar datos de seguimiento por email de la solicitud
  const userCourses = platziSeguimiento.filter(curso => curso.email === solicitud.email);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
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

          {/* Información de Platzi Seguimiento */}
          {userCourses.length > 0 && (
            <div className="bg-muted/20 rounded-lg p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Progreso de Cursos en Platzi ({userCourses.length} cursos)
              </h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {userCourses.map((curso, index) => (
                  <div key={index} className="border rounded-lg p-3 bg-background/50">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm line-clamp-2">{curso.curso || "Curso sin nombre"}</h4>
                        <p className="text-xs text-muted-foreground">
                          <span className="font-medium">Ruta:</span> {curso.ruta || "Sin ruta"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 ml-2">
                        {curso.estado_curso === 'Certificado' && (
                          <Award className="h-4 w-4 text-green-600" />
                        )}
                        <Badge 
                          variant={curso.estado_curso === 'Certificado' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {curso.estado_curso || 'En progreso'}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="font-medium text-muted-foreground">Progreso</label>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 bg-muted rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full transition-all"
                              style={{ width: `${(curso.porcentaje_avance || 0) * 100}%` }}
                            />
                          </div>
                          <span className="font-medium">{Math.round((curso.porcentaje_avance || 0) * 100)}%</span>
                        </div>
                      </div>
                      <div>
                        <label className="font-medium text-muted-foreground">Tiempo invertido</label>
                        <p className="mt-1">
                          {curso.tiempo_invertido 
                            ? `${Math.round(curso.tiempo_invertido / 3600)} horas`
                            : 'N/A'
                          }
                        </p>
                      </div>
                      {curso.fecha_certificacion && (
                        <div className="col-span-2">
                          <label className="font-medium text-muted-foreground">Fecha de certificación</label>
                          <p className="mt-1">{new Date(curso.fecha_certificacion).toLocaleDateString('es-CO')}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mensaje cuando no hay cursos */}
          {userCourses.length === 0 && solicitud.estado === 'Aprobada' && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-amber-700">
                <BarChart3 className="h-4 w-4" />
                <span className="font-medium text-sm">Sin actividad en Platzi</span>
              </div>
              <p className="text-xs text-amber-600 mt-1">
                Esta persona tiene la licencia aprobada pero aún no ha comenzado cursos o no aparece en los reportes.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default function Solicitudes() {
  const { profile } = useAuth();
  const { solicitudes, loading } = useSolicitudes();
  const { camaras } = useCamaras();
  const { platziData } = usePlatziGeneral();
  const { seguimientoData } = usePlatziSeguimiento();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [chamberFilter, setChamberFilter] = useState('todas');
  const [sectorFilter, setSectorFilter] = useState('todos');
  const [selectedSolicitud, setSelectedSolicitud] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [sendingReminder, setSendingReminder] = useState(false);

  if (!profile) return null;

  const canViewGlobal = hasPermission(profile.role, 'view_global') || hasPermission(profile.role, 'view_all');

  const handleSendReminder = async (solicitud: any) => {
    if (!solicitud.celular) {
      toast({
        title: "Error",
        description: "Esta solicitud no tiene número de celular registrado.",
        variant: "destructive"
      });
      return;
    }

    setSendingReminder(true);
    try {
      // Obtener configuración de webhook
      const { data: webhookConfig, error: webhookError } = await supabase
        .from('webhook_config')
        .select('*')
        .eq('name', 'Recordatorio Licencia')
        .eq('is_active', true)
        .single();

      if (webhookError || !webhookConfig) {
        toast({
          title: "Error de configuración",
          description: "No se encontró configuración de webhook activa para recordatorios.",
          variant: "destructive"
        });
        return;
      }

      // Enviar webhook
      const response = await fetch(webhookConfig.url, {
        method: webhookConfig.method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          celular: solicitud.celular,
          nombre: solicitud.nombres_apellidos,
          email: solicitud.email,
          empresa: solicitud.empresas?.nombre,
          timestamp: new Date().toISOString(),
          tipo: 'recordatorio_licencia'
        }),
      });

      if (response.ok) {
        toast({
          title: "Recordatorio enviado",
          description: `Se envió el recordatorio a ${solicitud.nombres_apellidos} (${solicitud.celular}).`,
        });
      } else {
        throw new Error('Error en la respuesta del webhook');
      }
    } catch (error: any) {
      console.error('Error enviando recordatorio:', error);
      toast({
        title: "Error al enviar recordatorio",
        description: error.message || "Ocurrió un error inesperado.",
        variant: "destructive"
      });
    } finally {
      setSendingReminder(false);
    }
  };

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
  const approvedApplications = baseApplications.filter(sol => sol.estado === 'Aprobada');
  const consumedApplications = approvedApplications.filter(sol => 
    platziData.some(p => p.email === sol.email)
  );

  const stats = {
    total: baseApplications.length,
    approved: approvedApplications.length,
    consumed: consumedApplications.length,
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
          variant="primary"
        />
        <StatCard
          title="Aprobadas"
          value={stats.approved}
          description="Licencias otorgadas"
          icon={CheckCircle}
          variant="success"
        />
        <StatCard
          title="Consumidas"
          value={stats.consumed}
          description="Licencias activadas"
          icon={TrendingUp}
          variant="warning"
        />
        <StatCard
          title="Rechazadas"
          value={stats.rejected}
          description="No cumplieron requisitos"
          icon={XCircle}
          variant="error"
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
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
            {filteredApplications.slice(0, 50).map((solicitud) => (
              <SolicitudCard
                key={solicitud.id}
                solicitud={solicitud}
                canViewGlobal={canViewGlobal}
                onViewDetails={() => handleViewDetails(solicitud)}
                onSendReminder={handleSendReminder}
                platziData={platziData}
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
        platziSeguimiento={seguimientoData}
      />
    </div>
  );
}