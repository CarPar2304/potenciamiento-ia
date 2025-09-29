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
  Edit,
  CalendarIcon,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';
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

const SolicitudCard = ({ solicitud, canViewGlobal, onViewDetails, platziData, onSendReminder, onApproveRequest, sendingReminder, approvingRequest, isSent, canExecuteActions, onEditRequest, isAdmin }: {
  solicitud: any;
  canViewGlobal: boolean;
  onViewDetails: () => void;
  platziData: any[];
  onSendReminder: (solicitud: any) => void;
  onApproveRequest: (solicitud: any) => void;
  sendingReminder: boolean;
  approvingRequest: boolean;
  isSent: boolean;
  canExecuteActions: boolean;
  onEditRequest: (solicitud: any) => void;
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
    return configs[status] || { 
      color: 'text-muted-foreground', 
      bg: 'bg-muted/50', 
      border: 'border-muted' 
    };
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Verificar si ya hizo el test (existe en platzi_general)
  const hasCompletedTest = platziData.some(p => p.email === solicitud.email);
  const isApprovedStatus = solicitud.estado === 'Aprobada';
  const isRejectedStatus = solicitud.estado === 'Rechazada';

  const statusConfig = getStatusConfig(solicitud.estado);

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-fade-in">
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
          <div className="flex items-center space-x-3 min-w-0 flex-1">
            <Avatar className="h-10 w-10 flex-shrink-0">
              <AvatarFallback className="bg-gradient-primary text-primary-foreground text-sm font-medium">
                {getInitials(solicitud.nombres_apellidos)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-base text-foreground">{solicitud.nombres_apellidos}</h3>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Mail className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{solicitud.email}</span>
              </p>
            </div>
          </div>
          <Badge className={`${statusConfig.color} ${statusConfig.bg} ${statusConfig.border} border shrink-0`}>
            {solicitud.estado}
          </Badge>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Building className="h-4 w-4 text-primary/60" />
            <span className="truncate text-sm">{solicitud.empresas?.nombre || 'Sin empresa'}</span>
          </div>
          {solicitud.cargo && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Briefcase className="h-4 w-4 text-primary/60" />
              <span className="truncate text-sm">{solicitud.cargo}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4 text-primary/60" />
            <span className="text-sm">{new Date(solicitud.fecha_solicitud).toLocaleDateString('es-CO')}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3 border-t border-muted/20">
          {isApprovedStatus && (
            <Badge 
              variant={hasCompletedTest ? "default" : "secondary"} 
              className={`text-xs w-fit ${hasCompletedTest 
                ? 'bg-green-100 text-green-700 border-green-200' 
                : 'bg-amber-100 text-amber-700 border-amber-200'
              }`}
            >
              {hasCompletedTest ? 'Licencia consumida' : 'Licencia no consumida'}
            </Badge>
          )}
          {!isApprovedStatus && <div />}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Botón para enviar recordatorio (solo para aprobadas sin licencia consumida) */}
            {canExecuteActions && isApprovedStatus && !hasCompletedTest && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onSendReminder(solicitud)}
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
            
            {/* Botón para aprobar solicitud (solo para rechazadas) */}
            {canExecuteActions && isRejectedStatus && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onApproveRequest(solicitud)}
                disabled={approvingRequest}
                className={`transition-all duration-500 font-medium shadow-sm hover:shadow-md text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200 hover:border-green-400 ${approvingRequest ? 'animate-pulse' : ''}`}
              >
                {approvingRequest ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 mr-2 border-b-2 border-green-600" />
                    <span className="hidden sm:inline">Enviando...</span>
                    <span className="sm:hidden">Enviando</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">Aprobar solicitud</span>
                    <span className="sm:hidden">Aprobar</span>
                  </>
                )}
               </Button>
            )}
            
            {/* Botón de edición solo para administradores */}
            {isAdmin && (
              <Button
                variant="outline" 
                size="sm" 
                onClick={() => onEditRequest(solicitud)}
                className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 border-amber-200 hover:border-amber-400 transition-colors"
              >
                <Edit className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Editar</span>
                <span className="sm:hidden">Editar</span>
              </Button>
            )}
            
            <Button
              variant="ghost" 
              size="sm" 
              onClick={onViewDetails}
              className="text-primary hover:text-primary/80 hover:bg-primary/10 transition-colors"
            >
              <Eye className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Ver detalles</span>
              <span className="sm:hidden">Detalles</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const SolicitudEditDialog = ({ solicitud, isOpen, onClose, onSave, camaras }: {
  solicitud: any;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedSolicitud: any) => void;
  camaras: any[];
}) => {
  const [formData, setFormData] = useState({
    // Solo datos de solicitud
    nombres_apellidos: '',
    email: '',
    numero_documento: '',
    celular: '',
    cargo: '',
    nivel_educativo: '',
    tipo_identificacion: '',
    genero: '',
    grupo_etnico: '',
    fecha_nacimiento: '',
    estado: '',
    razon_rechazo: '',
    nit_empresa: '',
    es_colaborador: false,
    camara_colaborador_id: '',
  });
  
  const [saving, setSaving] = useState(false);

  // Inicializar form data cuando cambia la solicitud
  useEffect(() => {
    if (solicitud) {
      setFormData({
        nombres_apellidos: solicitud.nombres_apellidos || '',
        email: solicitud.email || '',
        numero_documento: solicitud.numero_documento || '',
        celular: solicitud.celular || '',
        cargo: solicitud.cargo || '',
        nivel_educativo: solicitud.nivel_educativo || '',
        tipo_identificacion: solicitud.tipo_identificacion || '',
        genero: solicitud.genero || '',
        grupo_etnico: solicitud.grupo_etnico || '',
        fecha_nacimiento: solicitud.fecha_nacimiento || '',
        estado: solicitud.estado || '',
        razon_rechazo: solicitud.razon_rechazo || '',
        nit_empresa: solicitud.nit_empresa || '',
        es_colaborador: solicitud.es_colaborador || false,
        camara_colaborador_id: solicitud.camara_colaborador_id || '',
      });
    }
  }, [solicitud]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const updatedSolicitud = {
        nombres_apellidos: formData.nombres_apellidos,
        email: formData.email,
        numero_documento: formData.numero_documento,
        celular: formData.celular,
        cargo: formData.cargo,
        nivel_educativo: formData.nivel_educativo,
        tipo_identificacion: formData.tipo_identificacion,
        genero: formData.genero,
        grupo_etnico: formData.grupo_etnico,
        fecha_nacimiento: formData.fecha_nacimiento,
        estado: formData.estado,
        razon_rechazo: formData.razon_rechazo,
        nit_empresa: formData.nit_empresa,
        es_colaborador: formData.es_colaborador,
        camara_colaborador_id: formData.es_colaborador ? formData.camara_colaborador_id : null,
      };

      await onSave(updatedSolicitud);
    } finally {
      setSaving(false);
    }
  };

  if (!solicitud) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Editar Solicitud
          </DialogTitle>
          <DialogDescription>
            Modifica la información de la solicitud
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nombres_apellidos">Nombres y Apellidos</Label>
                <Input
                  id="nombres_apellidos"
                  value={formData.nombres_apellidos}
                  onChange={(e) => handleInputChange('nombres_apellidos', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="numero_documento">Número de Documento</Label>
                <Input
                  id="numero_documento"
                  value={formData.numero_documento}
                  onChange={(e) => handleInputChange('numero_documento', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="tipo_identificacion">Tipo de Identificación</Label>
                <Select value={formData.tipo_identificacion} onValueChange={(value) => handleInputChange('tipo_identificacion', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Tarjeta de Identidad">Tarjeta de Identidad</SelectItem>
                    <SelectItem value="Cédula de Ciudadanía">Cédula de Ciudadanía</SelectItem>
                    <SelectItem value="Cédula de Extranjería">Cédula de Extranjería</SelectItem>
                    <SelectItem value="Pasaporte">Pasaporte</SelectItem>
                    <SelectItem value="Permiso de Permanencia Temporal">Permiso de Permanencia Temporal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="celular">Celular</Label>
                <Input
                  id="celular"
                  value={formData.celular}
                  onChange={(e) => handleInputChange('celular', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="cargo">Cargo</Label>
                <Input
                  id="cargo"
                  value={formData.cargo}
                  onChange={(e) => handleInputChange('cargo', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="nivel_educativo">Nivel Educativo</Label>
                <Input
                  id="nivel_educativo"
                  value={formData.nivel_educativo}
                  onChange={(e) => handleInputChange('nivel_educativo', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="genero">Género</Label>
                <Select value={formData.genero} onValueChange={(value) => handleInputChange('genero', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar género" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Masculino">Masculino</SelectItem>
                    <SelectItem value="Femenino">Femenino</SelectItem>
                    <SelectItem value="Otro">Otro</SelectItem>
                    <SelectItem value="Prefiero no decir">Prefiero no decir</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="grupo_etnico">Grupo Étnico</Label>
                <Input
                  id="grupo_etnico"
                  value={formData.grupo_etnico}
                  onChange={(e) => handleInputChange('grupo_etnico', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="fecha_nacimiento">Fecha de Nacimiento</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.fecha_nacimiento && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.fecha_nacimiento ? format(new Date(formData.fecha_nacimiento), "dd/MM/yyyy") : "Seleccionar fecha"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={formData.fecha_nacimiento ? new Date(formData.fecha_nacimiento) : undefined}
                      onSelect={(date) => handleInputChange('fecha_nacimiento', date ? date.toISOString().split('T')[0] : '')}
                      disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label htmlFor="estado">Estado</Label>
                <Select value={formData.estado} onValueChange={(value) => handleInputChange('estado', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pendiente">Pendiente</SelectItem>
                    <SelectItem value="Aprobada">Aprobada</SelectItem>
                    <SelectItem value="Rechazada">Rechazada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="nit_empresa">NIT de la Empresa</Label>
                <Input
                  id="nit_empresa"
                  value={formData.nit_empresa}
                  onChange={(e) => handleInputChange('nit_empresa', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="es_colaborador">¿Es Colaborador?</Label>
                <Select 
                  value={formData.es_colaborador ? 'true' : 'false'} 
                  onValueChange={(value) => handleInputChange('es_colaborador', value === 'true')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="false">No</SelectItem>
                    <SelectItem value="true">Sí</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {formData.es_colaborador && (
                <div className="col-span-2">
                  <Label htmlFor="camara_colaborador_id">Cámara de Comercio del Colaborador</Label>
                  <Select 
                    value={formData.camara_colaborador_id} 
                    onValueChange={(value) => handleInputChange('camara_colaborador_id', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar cámara" />
                    </SelectTrigger>
                    <SelectContent>
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
            {formData.estado === 'Rechazada' && (
              <div>
                <Label htmlFor="razon_rechazo">Razón de Rechazo</Label>
                <Select 
                  value={formData.razon_rechazo || "sin_especificar"} 
                  onValueChange={(value) => handleInputChange('razon_rechazo', value === "sin_especificar" ? "" : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar razón (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sin_especificar">Sin especificar</SelectItem>
                    <SelectItem value="Fuera de Jurisdicción">Fuera de Jurisdicción</SelectItem>
                    <SelectItem value="No existe NIT">No existe NIT</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 mr-2 border-b-2 border-white" />
                Guardando...
              </>
            ) : (
              'Guardar Cambios'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
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
  const [licenseFilter, setLicenseFilter] = useState('todas');
  const [selectedSolicitud, setSelectedSolicitud] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [sendingReminder, setSendingReminder] = useState(false);
  const [sentReminders, setSentReminders] = useState<Set<string>>(new Set());
  const [approvingRequest, setApprovingRequest] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingSolicitud, setEditingSolicitud] = useState(null);

  if (!profile) return null;

  const canViewGlobal = hasPermission(profile.role, 'view_all');
  const canExecuteActions = hasPermission(profile.role, 'admin_actions');

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
        // Marcar como enviado y añadir a la lista de recordatorios enviados
        setSentReminders(prev => new Set(prev).add(solicitud.id));
        
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

  const handleApproveRequest = async (solicitud: any) => {
    if (!solicitud.celular) {
      toast({
        title: "Error",
        description: "Esta solicitud no tiene número de celular registrado.",
        variant: "destructive"
      });
      return;
    }

    setApprovingRequest(true);
    try {
      // Obtener configuración de webhook
      const { data: webhookConfig, error: webhookError } = await supabase
        .from('webhook_config')
        .select('*')
        .eq('name', 'Aprobar Solicitud')
        .eq('is_active', true)
        .single();

      if (webhookError || !webhookConfig) {
        toast({
          title: "Error de configuración",
          description: "No se encontró configuración de webhook activa para aprobación.",
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
          nit: solicitud.nit_empresa,
          nit_empresa: solicitud.nit_empresa,
          timestamp: new Date().toISOString(),
          tipo: 'aprobar_solicitud'
        }),
      });

      if (response.ok) {
        toast({
          title: "Notificación enviada",
          description: `Se envió la notificación para ${solicitud.nombres_apellidos}.`,
        });
      } else {
        throw new Error('Error en la respuesta del webhook');
      }
    } catch (error: any) {
      console.error('Error aprobando solicitud:', error);
      toast({
        title: "Error al aprobar solicitud",
        description: error.message || "Ocurrió un error inesperado.",
        variant: "destructive"
      });
    } finally {
      setApprovingRequest(false);
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
    
    const matchesStatus = statusFilter === 'todos' || sol.estado === statusFilter;
    const matchesChamber = chamberFilter === 'todas' || sol.empresas?.camaras?.nombre === chamberFilter;
    const matchesSector = sectorFilter === 'todos' || sol.empresas?.sector === sectorFilter;
    
    // Nuevo filtro para licencias consumidas/no consumidas
    const hasConsummed = platziData.some(p => p.email === sol.email);
    const matchesLicense = licenseFilter === 'todas' ||
      (licenseFilter === 'consumidas' && hasConsummed) ||
      (licenseFilter === 'no_consumidas' && !hasConsummed);

    return matchesSearch && matchesStatus && matchesChamber && matchesSector && matchesLicense;
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

  const handleEditRequest = (solicitud: any) => {
    setEditingSolicitud(solicitud);
    setShowEditDialog(true);
  };

  const handleSaveEdit = async (updatedSolicitud: any) => {
    try {
      // Solo actualizar solicitud
      const { error: solicitudError } = await supabase
        .from('solicitudes')
        .update(updatedSolicitud)
        .eq('id', editingSolicitud.id);

      if (solicitudError) throw solicitudError;

      toast({
        title: "Solicitud actualizada",
        description: "Los cambios se han guardado correctamente.",
      });

      setShowEditDialog(false);
      setEditingSolicitud(null);
      
      // Recargar datos
      window.location.reload();
    } catch (error: any) {
      console.error('Error updating request:', error);
      toast({
        title: "Error al actualizar",
        description: error.message || "Ocurrió un error inesperado.",
        variant: "destructive"
      });
    }
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
              ? `Panel global: todas las solicitudes del programa` 
              : `Solicitudes de ${profile.chamber}`
            }
          </p>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
          title="Licencias Activas"
          value={stats.consumed}
          description="Usuarios con progreso"
          icon={TrendingUp}
          variant="warning"
        />
        <StatCard
          title="Rechazadas"
          value={stats.rejected}
          description="Solicitudes no aprobadas"
          icon={XCircle}
          variant="error"
        />
      </div>

      {/* Enhanced Filters */}
      <Card className="border-0 shadow-sm bg-gradient-to-r from-background to-muted/20">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre, email, empresa o documento..."
                  className="pl-9 bg-background/50 border-muted-foreground/20"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[160px] bg-background/50 border-muted-foreground/20">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los estados</SelectItem>
                  <SelectItem value="Pendiente">Pendiente</SelectItem>
                  <SelectItem value="Aprobada">Aprobada</SelectItem>
                  <SelectItem value="Rechazada">Rechazada</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={licenseFilter} onValueChange={setLicenseFilter}>
                <SelectTrigger className="w-[180px] bg-background/50 border-muted-foreground/20">
                  <SelectValue placeholder="Licencias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas las licencias</SelectItem>
                  <SelectItem value="consumidas">Licencias consumidas</SelectItem>
                  <SelectItem value="no_consumidas">Licencias no consumidas</SelectItem>
                </SelectContent>
              </Select>
              
              {canViewGlobal && (
                <Select value={chamberFilter} onValueChange={setChamberFilter}>
                  <SelectTrigger className="w-[200px] bg-background/50 border-muted-foreground/20">
                    <SelectValue placeholder="Todas las cámaras" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas las cámaras</SelectItem>
                    {camaras.map(camara => (
                      <SelectItem key={camara.id} value={camara.nombre}>
                        {camara.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modern Cards Grid */}
      <div className="space-y-4">
        {loading ? (
          <Card>
            <CardContent className="p-8">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                <span className="ml-2 text-muted-foreground">Cargando solicitudes...</span>
              </div>
            </CardContent>
          </Card>
        ) : filteredApplications.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
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
                canExecuteActions={canExecuteActions}
                onViewDetails={() => handleViewDetails(solicitud)}
                onSendReminder={handleSendReminder}
                onApproveRequest={handleApproveRequest}
                onEditRequest={handleEditRequest}
                isAdmin={canExecuteActions}
                platziData={platziData}
                sendingReminder={sendingReminder}
                approvingRequest={approvingRequest}
                isSent={sentReminders.has(solicitud.id)}
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

      {/* Edit Dialog */}
      <SolicitudEditDialog
        solicitud={editingSolicitud}
        isOpen={showEditDialog}
        onClose={() => {
          setShowEditDialog(false);
          setEditingSolicitud(null);
        }}
        onSave={handleSaveEdit}
        camaras={camaras}
      />
    </div>
  );
}
