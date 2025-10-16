import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
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
  User,
  Briefcase,
  GraduationCap,
  Hash,
  TrendingUp,
  BookOpen,
  Award,
  BarChart3,
  Building2,
  Send,
  Edit,
} from 'lucide-react';
import { useColaboradores, useCamaras, usePlatziGeneral, usePlatziSeguimiento } from '@/hooks/useSupabaseData';
import { useAuth, hasPermission } from '@/contexts/AuthContext';
import { ExportModal } from '@/components/export/ExportModal';
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
    error: {
      bg: 'bg-red-500/10',
      icon: 'text-red-600', 
      border: 'border-red-500/20'
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

const ColaboradorCard = ({ colaborador, onViewDetails, platziData, onSendReminder, sendingReminder, isSent, canExecuteActions, onEditColaborador, isAdmin }: {
  colaborador: any;
  onViewDetails: () => void;
  platziData: any[];
  onSendReminder: (colaborador: any) => void;
  sendingReminder: boolean;
  isSent: boolean;
  canExecuteActions: boolean;
  onEditColaborador: (colaborador: any) => void;
  isAdmin: boolean;
}) => {
  const getStatusConfig = (status: string) => {
    const configs: Record<string, { color: string; bg: string; border: string }> = {
      'Aprobada': { 
        color: 'text-green-700', 
        bg: 'bg-green-50', 
        border: 'border-green-200' 
      },
      'Pendiente': { 
        color: 'text-amber-700', 
        bg: 'bg-amber-50', 
        border: 'border-amber-200' 
      },
      'Rechazada': { 
        color: 'text-red-700', 
        bg: 'bg-red-50', 
        border: 'border-red-200' 
      },
    };
    return configs[status] || configs['Pendiente'];
  };

  const statusConfig = getStatusConfig(colaborador.estado);
  const userPlatziData = platziData.find(p => p.email === colaborador.email);
  const hasConsumedLicense = !!userPlatziData;

  return (
    <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-background to-background/50 backdrop-blur-sm border-l-4 border-l-primary/30">
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-center space-x-4">
            <Avatar className="h-14 w-14 ring-2 ring-primary/20">
              <AvatarFallback className="bg-gradient-primary text-primary-foreground font-semibold text-lg">
                {colaborador.nombres_apellidos.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-xl font-semibold line-clamp-2 mb-2">
                {colaborador.nombres_apellidos}
              </CardTitle>
              <CardDescription className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <span className="truncate text-base">{colaborador.email}</span>
              </CardDescription>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <Badge className={`${statusConfig.bg} ${statusConfig.color} ${statusConfig.border} border px-3 py-1 text-sm font-medium`}>
              {colaborador.estado}
            </Badge>
            {hasConsumedLicense ? (
              <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50 px-3 py-1 text-sm">
                <Award className="h-4 w-4 mr-2" />
                Licencia consumida
              </Badge>
            ) : colaborador.estado === 'Aprobada' ? (
              <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50 px-3 py-1 text-sm">
                <Clock className="h-4 w-4 mr-2" />
                Licencia no consumida
              </Badge>
            ) : null}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="grid gap-4 text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 text-muted-foreground p-2 rounded-lg bg-muted/20">
              <Hash className="h-4 w-4 flex-shrink-0" />
              <div>
                <span className="font-medium block">Documento</span>
                <span className="text-foreground">{colaborador.numero_documento}</span>
              </div>
            </div>
            
            {colaborador.celular && (
              <div className="flex items-center gap-3 text-muted-foreground p-2 rounded-lg bg-muted/20">
                <Phone className="h-4 w-4 flex-shrink-0" />
                <div>
                  <span className="font-medium block">Celular</span>
                  <span className="text-foreground">{colaborador.celular}</span>
                </div>
              </div>
            )}
          </div>
          
          {colaborador.cargo && (
            <div className="flex items-center gap-3 text-muted-foreground p-2 rounded-lg bg-muted/20">
              <Briefcase className="h-4 w-4 flex-shrink-0" />
              <div>
                <span className="font-medium block">Cargo</span>
                <span className="text-foreground">{colaborador.cargo}</span>
              </div>
            </div>
          )}
          
          {colaborador.camaras && (
            <div className="flex items-center gap-3 text-muted-foreground p-2 rounded-lg bg-muted/20">
              <Building2 className="h-4 w-4 flex-shrink-0" />
              <div>
                <span className="font-medium block">Cámara</span>
                <span className="text-foreground">{colaborador.camaras.nombre}</span>
              </div>
            </div>
          )}
          
          {colaborador.nivel_educativo && (
            <div className="flex items-center gap-3 text-muted-foreground p-2 rounded-lg bg-muted/20">
              <GraduationCap className="h-4 w-4 flex-shrink-0" />
              <div>
                <span className="font-medium block">Nivel educativo</span>
                <span className="text-foreground">{colaborador.nivel_educativo}</span>
              </div>
            </div>
          )}
          
          <div className="flex items-center gap-3 text-muted-foreground p-2 rounded-lg bg-muted/20">
            <Calendar className="h-4 w-4 flex-shrink-0" />
            <div>
              <span className="font-medium block">Fecha de solicitud</span>
              <span className="text-foreground">{new Date(colaborador.fecha_solicitud).toLocaleDateString('es-CO')}</span>
            </div>
          </div>
        </div>

        {userPlatziData && (
          <div className="bg-muted/30 rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Progreso en Platzi</span>
              <Badge variant="outline" className="text-xs">
                {userPlatziData.ruta || 'Sin ruta'}
              </Badge>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm text-muted-foreground">
                <span>Progreso: {Math.round((userPlatziData.progreso_ruta || 0) * 100)}%</span>
                <span>Cursos certificados: {userPlatziData.cursos_totales_certificados || 0}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${(userPlatziData.progreso_ruta || 0) * 100}%` }}
                />
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            Colaborador de <span className="font-medium text-foreground">{colaborador.camaras?.nombre || 'Cámara no especificada'}</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {/* Botón para enviar recordatorio (solo para aprobadas sin licencia consumida) */}
            {canExecuteActions && colaborador.estado === 'Aprobada' && !hasConsumedLicense && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onSendReminder(colaborador)}
                disabled={sendingReminder || isSent}
                className={`transition-all duration-500 font-medium shadow-sm hover:shadow-md ${
                  isSent 
                    ? 'text-success bg-success/10 border-success/30 animate-pulse-subtle' 
                    : 'text-primary hover:text-primary hover:bg-primary/10 border-primary/30 hover:border-primary'
                } ${sendingReminder ? 'animate-pulse' : ''}`}
              >
                {sendingReminder ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 mr-2 border-b-2 border-primary" />
                    <span className="hidden sm:inline">Enviando...</span>
                    <span className="sm:hidden">Enviando</span>
                  </>
                ) : isSent ? (
                  <>
                    <div className="animate-bounce mr-2">✓</div>
                    <span className="hidden sm:inline">Recordatorio enviado</span>
                    <span className="sm:hidden">Enviado</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">Enviar recordatorio</span>
                    <span className="sm:hidden">Recordatorio</span>
                  </>
                )}
              </Button>
            )}
            
            {/* Botón de edición solo para administradores */}
            {isAdmin && (
              <Button
                variant="outline" 
                size="sm" 
                onClick={() => onEditColaborador(colaborador)}
                className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 border-amber-200 hover:border-amber-400 transition-colors"
              >
                <Edit className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Editar</span>
                <span className="sm:hidden">Editar</span>
              </Button>
            )}
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={onViewDetails}
              className="hover:bg-primary hover:text-primary-foreground px-4 py-2"
            >
              <Eye className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Ver detalles</span>
              <span className="sm:hidden">Detalles</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function Colaboradores() {
  const { profile } = useAuth();
  const { colaboradores, loading, refetch } = useColaboradores();
  const { camaras } = useCamaras();
  const { platziData } = usePlatziGeneral();
  const { seguimientoData } = usePlatziSeguimiento();
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [camaraFilter, setCamaraFilter] = useState<string>('todas');
  const [selectedColaborador, setSelectedColaborador] = useState<any>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [sendingReminderId, setSendingReminderId] = useState<string | null>(null);
  const [sentReminders, setSentReminders] = useState<Set<string>>(new Set());
  const [editingColaborador, setEditingColaborador] = useState<any>(null);

  if (!profile) return null;

  const canViewGlobal = hasPermission(profile.role, 'view_global') || hasPermission(profile.role, 'view_all');
  const canExecuteActions = hasPermission(profile.role, 'admin_actions');
  const isAdmin = profile.role === 'admin';

  const handleSendReminder = async (colaborador: any) => {
    if (!colaborador.celular) {
      toast({
        title: "Error",
        description: "Este colaborador no tiene número de celular registrado.",
        variant: "destructive"
      });
      return;
    }

    setSendingReminderId(colaborador.id);
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
          celular: colaborador.celular,
          nombre: colaborador.nombres_apellidos,
          email: colaborador.email,
          camara: colaborador.camaras?.nombre,
          timestamp: new Date().toISOString(),
          tipo: 'recordatorio_licencia'
        }),
      });

      if (response.ok) {
        // Marcar como enviado
        setSentReminders(prev => new Set(prev).add(colaborador.id));
        
        toast({
          title: "Recordatorio enviado",
          description: `Se envió el recordatorio a ${colaborador.nombres_apellidos} (${colaborador.celular}).`,
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
      setSendingReminderId(null);
    }
  };

  const handleEditColaborador = async (updatedData: any) => {
    try {
      // Extraer solo los campos que se pueden actualizar en solicitudes
      const updatePayload = {
        nombres_apellidos: updatedData.nombres_apellidos,
        email: updatedData.email,
        numero_documento: updatedData.numero_documento,
        celular: updatedData.celular,
        cargo: updatedData.cargo,
        nivel_educativo: updatedData.nivel_educativo,
      };

      const { error } = await supabase
        .from('solicitudes')
        .update(updatePayload)
        .eq('id', editingColaborador.id)
        .select();

      if (error) throw error;

      toast({
        title: "Colaborador actualizado",
        description: "Los cambios se guardaron correctamente.",
      });

      setEditingColaborador(null);
      
      // Recargar datos para mostrar cambios inmediatamente
      await refetch();
    } catch (error: any) {
      console.error('Error actualizando colaborador:', error);
      toast({
        title: "Error al actualizar",
        description: error.message || "Ocurrió un error inesperado.",
        variant: "destructive"
      });
    }
  };

  // Filtrar colaboradores
  const filteredColaboradores = colaboradores.filter(colaborador => {
    const matchesSearch = colaborador.nombres_apellidos.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         colaborador.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         colaborador.numero_documento.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'todos' || colaborador.estado === statusFilter;
    
    const matchesCamara = camaraFilter === 'todas' || colaborador.camara_colaborador_id === camaraFilter;

    return matchesSearch && matchesStatus && matchesCamara;
  });

  // Calcular estadísticas
  const totalColaboradores = colaboradores.length;
  const colaboradoresAprobados = colaboradores.filter(c => c.estado === 'Aprobada').length;
  const colaboradoresConLicencia = colaboradores.filter(c => 
    platziData.some(p => p.email === c.email)
  ).length;
  const promedioProgreso = platziData.length > 0 
    ? Math.round(
        platziData
          .filter(p => p.progreso_ruta && p.progreso_ruta > 0)
          .reduce((sum, p) => sum + (p.progreso_ruta || 0), 0) / 
        platziData.filter(p => p.progreso_ruta && p.progreso_ruta > 0).length * 100
      )
    : 0;

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-primary bg-clip-text text-transparent">
            Colaboradores
          </h1>
          <p className="text-muted-foreground">Cargando datos de colaboradores...</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-muted rounded w-24"></div>
                <div className="h-8 w-8 bg-muted rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-16 mb-2"></div>
                <div className="h-3 bg-muted rounded w-32"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-primary bg-clip-text text-transparent">
            Colaboradores
          </h1>
          <p className="text-muted-foreground">
            Gestión de colaboradores de las cámaras de comercio
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowExportModal(true)}
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Colaboradores"
          value={totalColaboradores}
          description="Colaboradores registrados"
          icon={Users}
          variant="primary"
        />
        <StatCard
          title="Colaboradores Aprobados"
          value={colaboradoresAprobados}
          description="Con acceso autorizado"
          icon={CheckCircle}
          variant="success"
        />
        <StatCard
          title="Licencias Consumidas"
          value={colaboradoresConLicencia}
          description="Han iniciado cursos"
          icon={Award}
          variant="warning"
        />
        <StatCard
          title="Progreso Promedio"
          value={promedioProgreso}
          description="% de avance en rutas"
          icon={TrendingUp}
          variant="error"
        />
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Buscar colaborador</label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Nombre, email o documento..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Estado</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los estados</SelectItem>
                  <SelectItem value="Pendiente">Pendiente</SelectItem>
                  <SelectItem value="Aprobada">Aprobada</SelectItem>
                  <SelectItem value="Rechazada">Rechazada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {canViewGlobal && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Cámara</label>
                <Select value={camaraFilter} onValueChange={setCamaraFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas las cámaras</SelectItem>
                    {camaras.map((camara) => (
                      <SelectItem key={camara.id} value={camara.id}>
                        {camara.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Lista de colaboradores */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            Lista de Colaboradores ({filteredColaboradores.length})
          </h2>
        </div>

        {filteredColaboradores.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No se encontraron colaboradores</h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== 'todos' || camaraFilter !== 'todas'
                  ? 'Intenta ajustar los filtros de búsqueda'
                  : 'Aún no hay colaboradores registrados'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3">
            {filteredColaboradores.map((colaborador) => (
              <ColaboradorCard
                key={colaborador.id}
                colaborador={colaborador}
                onViewDetails={() => setSelectedColaborador(colaborador)}
                platziData={platziData}
                onSendReminder={handleSendReminder}
                sendingReminder={sendingReminderId === colaborador.id}
                isSent={sentReminders.has(colaborador.id)}
                canExecuteActions={canExecuteActions}
                onEditColaborador={setEditingColaborador}
                isAdmin={isAdmin}
              />
            ))}
          </div>
        )}
      </div>

      {/* Dialog de detalles */}
      <Dialog open={!!selectedColaborador} onOpenChange={() => setSelectedColaborador(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedColaborador && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Detalles del Colaborador
                </DialogTitle>
                <DialogDescription>
                  Información completa de {selectedColaborador.nombres_apellidos}
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-6 py-4">
                {/* Información personal */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Información Personal</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Nombre completo</label>
                        <p className="font-medium">{selectedColaborador.nombres_apellidos}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Email</label>
                        <p className="font-medium">{selectedColaborador.email}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Documento</label>
                        <p className="font-medium">{selectedColaborador.numero_documento}</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {selectedColaborador.celular && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Celular</label>
                          <p className="font-medium">{selectedColaborador.celular}</p>
                        </div>
                      )}
                      {selectedColaborador.cargo && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Cargo</label>
                          <p className="font-medium">{selectedColaborador.cargo}</p>
                        </div>
                      )}
                      {selectedColaborador.nivel_educativo && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Nivel educativo</label>
                          <p className="font-medium">{selectedColaborador.nivel_educativo}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Información de la cámara */}
                {selectedColaborador.camaras && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Información de la Cámara</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Cámara</label>
                          <p className="font-medium">{selectedColaborador.camaras.nombre}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">NIT Cámara</label>
                          <p className="font-medium">{selectedColaborador.camaras.nit}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Información de Platzi */}
                {(() => {
                  const userPlatziData = platziData.find(p => p.email === selectedColaborador.email);
                  const userSeguimiento = seguimientoData.filter(s => s.email === selectedColaborador.email);
                  
                  if (!userPlatziData) {
                    return selectedColaborador.estado === 'Aprobada' ? (
                      <Card>
                        <CardContent className="text-center py-6">
                          <Clock className="h-12 w-12 text-amber-500 mx-auto mb-4" />
                          <h3 className="text-lg font-medium mb-2">Licencia no consumida</h3>
                          <p className="text-muted-foreground">
                            El colaborador tiene una licencia aprobada pero aún no ha iniciado sus cursos en Platzi.
                          </p>
                        </CardContent>
                      </Card>
                    ) : null;
                  }

                  return (
                    <>
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Progreso General en Platzi</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid gap-4 md:grid-cols-3">
                            <div>
                              <label className="text-sm font-medium text-muted-foreground">Ruta asignada</label>
                              <p className="font-medium">{userPlatziData.ruta || 'Sin ruta'}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-muted-foreground">Estado de acceso</label>
                              <p className="font-medium">{userPlatziData.estado_acceso || 'No especificado'}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-muted-foreground">Días restantes</label>
                              <p className="font-medium">{userPlatziData.dias_acceso_restantes || 0} días</p>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Progreso en ruta</span>
                              <span>{Math.round((userPlatziData.progreso_ruta || 0) * 100)}%</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-3">
                              <div 
                                className="bg-primary h-3 rounded-full transition-all"
                                style={{ width: `${(userPlatziData.progreso_ruta || 0) * 100}%` }}
                              />
                            </div>
                          </div>

                          <div className="grid gap-4 md:grid-cols-3 pt-4 border-t">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-primary">{userPlatziData.cursos_totales_certificados || 0}</div>
                              <div className="text-sm text-muted-foreground">Cursos certificados</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-primary">{userPlatziData.cursos_totales_progreso || 0}</div>
                              <div className="text-sm text-muted-foreground">Cursos en progreso</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-primary">
                                {userPlatziData.tiempo_total_dedicado ? Math.round(userPlatziData.tiempo_total_dedicado / 3600) : 0}h
                              </div>
                              <div className="text-sm text-muted-foreground">Tiempo dedicado</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {userSeguimiento.length > 0 && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Detalle de Cursos</CardTitle>
                            <CardDescription>
                              Progreso detallado por curso ({userSeguimiento.length} cursos)
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              {userSeguimiento.map((curso, index) => (
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
                                        <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                                          <Award className="h-3 w-3 mr-1" />
                                          Certificado
                                        </Badge>
                                      )}
                                      {curso.fecha_certificacion && (
                                        <span className="text-xs text-muted-foreground">
                                          {new Date(curso.fecha_certificacion).toLocaleDateString('es-CO')}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    <div>
                                      <div className="flex justify-between text-xs mb-1">
                                        <span>Progreso</span>
                                        <span className="font-medium">{Math.round((curso.porcentaje_avance || 0) * 100)}%</span>
                                      </div>
                                      <div className="flex-1 bg-muted rounded-full h-2">
                                        <div 
                                          className="bg-primary h-2 rounded-full transition-all"
                                          style={{ width: `${(curso.porcentaje_avance || 0) * 100}%` }}
                                        />
                                      </div>
                                    </div>
                                    <div>
                                      <span className="text-xs text-muted-foreground">
                                        Tiempo invertido: {curso.tiempo_invertido ? Math.round(curso.tiempo_invertido / 3600) : 0} horas
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </>
                  );
                })()}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      {editingColaborador && (
        <Dialog open={!!editingColaborador} onOpenChange={() => setEditingColaborador(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Edit className="h-5 w-5" />
                Editar Colaborador
              </DialogTitle>
              <DialogDescription>
                Actualiza la información de {editingColaborador.nombres_apellidos}
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="edit-nombre">Nombre completo</Label>
                  <Input
                    id="edit-nombre"
                    defaultValue={editingColaborador.nombres_apellidos}
                    onChange={(e) => {
                      setEditingColaborador({
                        ...editingColaborador,
                        nombres_apellidos: e.target.value
                      });
                    }}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    defaultValue={editingColaborador.email}
                    onChange={(e) => {
                      setEditingColaborador({
                        ...editingColaborador,
                        email: e.target.value
                      });
                    }}
                  />
                </div>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="edit-documento">Número de documento</Label>
                  <Input
                    id="edit-documento"
                    defaultValue={editingColaborador.numero_documento}
                    onChange={(e) => {
                      setEditingColaborador({
                        ...editingColaborador,
                        numero_documento: e.target.value
                      });
                    }}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-celular">Celular</Label>
                  <Input
                    id="edit-celular"
                    defaultValue={editingColaborador.celular}
                    onChange={(e) => {
                      setEditingColaborador({
                        ...editingColaborador,
                        celular: e.target.value
                      });
                    }}
                  />
                </div>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="edit-cargo">Cargo</Label>
                  <Input
                    id="edit-cargo"
                    defaultValue={editingColaborador.cargo}
                    onChange={(e) => {
                      setEditingColaborador({
                        ...editingColaborador,
                        cargo: e.target.value
                      });
                    }}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-nivel">Nivel educativo</Label>
                  <Input
                    id="edit-nivel"
                    defaultValue={editingColaborador.nivel_educativo}
                    onChange={(e) => {
                      setEditingColaborador({
                        ...editingColaborador,
                        nivel_educativo: e.target.value
                      });
                    }}
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setEditingColaborador(null)}
              >
                Cancelar
              </Button>
              <Button
                onClick={() => handleEditColaborador(editingColaborador)}
              >
                Guardar cambios
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Export Modal */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        data={filteredColaboradores}
        type="colaboradores"
        platziEmails={new Set(platziData?.map(p => p.email?.toLowerCase() || '') || [])}
        platziData={platziData}
      />
    </div>
  );
}