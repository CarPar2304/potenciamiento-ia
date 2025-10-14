import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
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
} from '@/components/ui/dialog';
import { 
  Plus, 
  Users, 
  TrendingUp, 
  Calendar, 
  Edit, 
  Trash2,
  Phone,
  Mail,
  Video,
  BookOpen,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  Building2,
  Activity,
  Award,
  Target
} from 'lucide-react';
import { useCRMActividades, useCamaras, useSolicitudes, usePlatziGeneral } from '@/hooks/useSupabaseData';
import { useAuth, hasPermission } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const ActivityCard = ({ actividad, onEdit, onDelete, canEdit }: {
  actividad: any;
  onEdit: () => void;
  onDelete: () => void;
  canEdit: boolean;
}) => {
  const getActivityIcon = (tipo: string) => {
    const icons = {
      reunion: Video,
      llamada: Phone,
      email: Mail,
      capacitacion: BookOpen,
      seguimiento: Eye,
      asignacion_licencias: Award,
      otro: Activity
    };
    return icons[tipo] || Activity;
  };

  const getStatusConfig = (estado: string) => {
    const configs = {
      pendiente: { color: 'text-yellow-600', bg: 'bg-yellow-100', icon: Clock, border: 'border-yellow-200' },
      en_progreso: { color: 'text-blue-600', bg: 'bg-blue-100', icon: Activity, border: 'border-blue-200' },
      completado: { color: 'text-green-600', bg: 'bg-green-100', icon: CheckCircle, border: 'border-green-200' },
      cancelado: { color: 'text-red-600', bg: 'bg-red-100', icon: XCircle, border: 'border-red-200' }
    };
    return configs[estado] || configs.pendiente;
  };

  const IconComponent = getActivityIcon(actividad.tipo_actividad);
  const statusConfig = getStatusConfig(actividad.estado);
  const StatusIcon = statusConfig.icon;

  return (
    <Card className={`group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-l-4 ${statusConfig.border}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${statusConfig.bg}`}>
              <IconComponent className={`h-4 w-4 ${statusConfig.color}`} />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">
                {actividad.camaras?.nombre}
              </CardTitle>
              <CardDescription className="flex items-center gap-2">
                <Calendar className="h-3 w-3" />
                {new Date(actividad.fecha).toLocaleDateString('es-CO')}
              </CardDescription>
            </div>
          </div>
          <Badge variant="secondary" className={`${statusConfig.bg} ${statusConfig.color} border-none`}>
            <StatusIcon className="h-3 w-3 mr-1" />
            {actividad.estado.replace('_', ' ')}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {actividad.tipo_actividad.replace('_', ' ')}
            </span>
            <p className="text-sm mt-1">{actividad.descripcion}</p>
          </div>
          {actividad.notas && (
            <div>
              <span className="text-xs font-medium text-muted-foreground">Notas:</span>
              <p className="text-xs text-muted-foreground mt-1">{actividad.notas}</p>
            </div>
          )}
        </div>
        {canEdit && (
          <div className="flex justify-end gap-1 mt-4 pt-3 border-t">
            <Button
              variant="ghost"
              size="sm"
              onClick={onEdit}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const ActivityDialog = ({ actividad, isOpen, onClose, mode, onSave, camaras }: {
  actividad?: any;
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'edit';
  onSave: (data: any) => void;
  camaras: any[];
}) => {
  const { profile } = useAuth();
  const [formData, setFormData] = useState({
    camara_id: actividad?.camara_id || '',
    tipo_actividad: actividad?.tipo_actividad || 'reunion',
    descripcion: actividad?.descripcion || '',
    estado: actividad?.estado || 'pendiente',
    notas: actividad?.notas || '',
    fecha: actividad?.fecha ? actividad.fecha.split('T')[0] : new Date().toISOString().split('T')[0]
  });

  const handleSave = () => {
    if (formData.camara_id && formData.descripcion.trim()) {
      onSave({
        ...formData,
        fecha: new Date(formData.fecha).toISOString(),
        usuario_id: profile?.id
      });
      onClose();
      if (mode === 'create') {
        setFormData({
          camara_id: '',
          tipo_actividad: 'reunion',
          descripcion: '',
          estado: 'pendiente',
          notas: '',
          fecha: new Date().toISOString().split('T')[0]
        });
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Nueva Actividad CRM' : 'Editar Actividad'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Registra una nueva interacción con una cámara aliada'
              : 'Modifica los detalles de la actividad'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Cámara</label>
            <Select 
              value={formData.camara_id} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, camara_id: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una cámara" />
              </SelectTrigger>
              <SelectContent>
                {camaras.map(camara => (
                  <SelectItem key={camara.id} value={camara.id}>
                    {camara.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Tipo de Actividad</label>
              <Select 
                value={formData.tipo_actividad} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, tipo_actividad: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="reunion">Reunión</SelectItem>
                  <SelectItem value="llamada">Llamada</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="capacitacion">Capacitación</SelectItem>
                  <SelectItem value="seguimiento">Seguimiento</SelectItem>
                  <SelectItem value="asignacion_licencias">Asignación de Licencias</SelectItem>
                  <SelectItem value="otro">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Estado</label>
              <Select 
                value={formData.estado} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, estado: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                  <SelectItem value="en_progreso">En Progreso</SelectItem>
                  <SelectItem value="completado">Completado</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Fecha</label>
            <Input
              type="date"
              value={formData.fecha}
              onChange={(e) => setFormData(prev => ({ ...prev, fecha: e.target.value }))}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Descripción</label>
            <Textarea
              value={formData.descripcion}
              onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
              placeholder="Describe la actividad realizada..."
              rows={3}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Notas (opcional)</label>
            <Textarea
              value={formData.notas}
              onChange={(e) => setFormData(prev => ({ ...prev, notas: e.target.value }))}
              placeholder="Notas adicionales..."
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              {mode === 'create' ? 'Crear Actividad' : 'Guardar Cambios'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default function CRM() {
  const { profile } = useAuth();
  const { camaras } = useCamaras();
  const { actividades, loading, createActividad, updateActividad, deleteActividad } = useCRMActividades();
  const { solicitudes } = useSolicitudes();
  const { platziData } = usePlatziGeneral();
  const { toast } = useToast();
  const [showDialog, setShowDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [selectedActividad, setSelectedActividad] = useState(null);
  const [statusFilter, setStatusFilter] = useState('todos');
  const [camaraFilter, setCamaraFilter] = useState('todas');

  if (!profile) return null;

  const canViewGlobal = hasPermission(profile.role, 'view_all');
  const canEdit = hasPermission(profile.role, 'crm_edit');

  if (!canViewGlobal) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <h3 className="text-lg font-semibold mb-2">Acceso restringido</h3>
            <p className="text-muted-foreground text-center">
              Esta sección está disponible solo para administradores y CCC.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate chamber metrics
  const chamberMetrics = camaras.map(camara => {
    const camaraActividades = actividades.filter(a => a.camara_id === camara.id);
    const camaraSolicitudes = solicitudes.filter(s => s.empresas?.camara_id === camara.id && !s.es_colaborador && s.estado === 'Aprobada');
    const camaraColaboradores = solicitudes.filter(s => s.camara_colaborador_id === camara.id && s.es_colaborador);
    const camaraPlatziUsers = platziData.filter(p => {
      const solicitud = solicitudes.find(s => s.email === p.email);
      return solicitud?.empresas?.camara_id === camara.id || solicitud?.camara_colaborador_id === camara.id;
    });

    const licenciasAsignadas = camaraPlatziUsers.length;
    const utilizacionPorcentaje = Math.round((licenciasAsignadas / Math.max(1, camara.licencias_disponibles)) * 100);

    return {
      ...camara,
      actividades: camaraActividades.length,
      solicitudes: camaraSolicitudes.length,
      colaboradores: camaraColaboradores.length,
      licenciasAsignadas,
      utilizacionPorcentaje,
      ultimaActividad: camaraActividades.length > 0 ? 
        new Date(Math.max(...camaraActividades.map(a => new Date(a.fecha).getTime()))) : null
    };
  });

  // Filter activities
  const filteredActividades = actividades.filter(actividad => {
    const matchesStatus = statusFilter === 'todos' || actividad.estado === statusFilter;
    const matchesCamara = camaraFilter === 'todas' || actividad.camara_id === camaraFilter;
    return matchesStatus && matchesCamara;
  });

  const handleCreate = () => {
    setSelectedActividad(null);
    setDialogMode('create');
    setShowDialog(true);
  };

  const handleEdit = (actividad: any) => {
    setSelectedActividad(actividad);
    setDialogMode('edit');
    setShowDialog(true);
  };

  const handleSave = async (data: any) => {
    try {
      if (dialogMode === 'create') {
        await createActividad(data);
        toast({
          title: "Actividad creada",
          description: "La actividad CRM ha sido registrada exitosamente.",
        });
      } else if (dialogMode === 'edit' && selectedActividad) {
        await updateActividad(selectedActividad.id, data);
        toast({
          title: "Actividad actualizada",
          description: "Los cambios han sido guardados exitosamente.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar la actividad. Inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (actividad: any) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta actividad?')) {
      try {
        await deleteActividad(actividad.id);
        toast({
          title: "Actividad eliminada",
          description: "La actividad ha sido eliminada exitosamente.",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudo eliminar la actividad. Inténtalo de nuevo.",
          variant: "destructive",
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="h-12 bg-muted animate-pulse rounded" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  const totalActividades = actividades.length;
  const actividadesCompletadas = actividades.filter(a => a.estado === 'completado').length;
  const utilizacionPromedio = Math.round(
    chamberMetrics.reduce((sum, c) => sum + c.utilizacionPorcentaje, 0) / Math.max(1, chamberMetrics.length)
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-primary bg-clip-text text-transparent">
            CRM Cámaras
          </h1>
          <p className="text-muted-foreground">
            Gestión de relaciones con {camaras.length} cámaras aliadas
          </p>
        </div>
        {canEdit && (
          <Button onClick={handleCreate} className="bg-gradient-primary text-white border-none hover:opacity-90">
            <Plus className="h-4 w-4 mr-2" />
            Nueva Actividad
          </Button>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Actividades</CardTitle>
            <Activity className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalActividades}</div>
            <p className="text-xs text-muted-foreground">Interacciones registradas</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completadas</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{actividadesCompletadas}</div>
            <p className="text-xs text-muted-foreground">
              {totalActividades > 0 ? Math.round((actividadesCompletadas / totalActividades) * 100) : 0}% del total
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cámaras Activas</CardTitle>
            <Building2 className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{camaras.length}</div>
            <p className="text-xs text-muted-foreground">Alianzas estratégicas</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilización Promedio</CardTitle>
            <Target className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{utilizacionPromedio}%</div>
            <p className="text-xs text-muted-foreground">De licencias asignadas</p>
          </CardContent>
        </Card>
      </div>

      {/* Chamber Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Métricas por Cámara
          </CardTitle>
          <CardDescription>
            Rendimiento y utilización de licencias por cámara aliada
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {chamberMetrics.map(camara => (
              <Card key={camara.id} className="border-l-4 border-l-primary/20">
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold">{camara.nombre}</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Consumo:</span>
                        <p className="font-medium">{camara.licenciasAsignadas} licencias</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Solicitudes Aprobadas:</span>
                        <p className="font-medium">{camara.solicitudes}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Utilización:</span>
                        <p className="font-medium">{camara.utilizacionPorcentaje}%</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Actividades:</span>
                        <p className="font-medium">{camara.actividades}</p>
                      </div>
                    </div>
                    {camara.ultimaActividad && (
                      <p className="text-xs text-muted-foreground">
                        Última actividad: {camara.ultimaActividad.toLocaleDateString('es-CO')}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex gap-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los estados</SelectItem>
            <SelectItem value="pendiente">Pendiente</SelectItem>
            <SelectItem value="en_progreso">En progreso</SelectItem>
            <SelectItem value="completado">Completado</SelectItem>
            <SelectItem value="cancelado">Cancelado</SelectItem>
          </SelectContent>
        </Select>

        <Select value={camaraFilter} onValueChange={setCamaraFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por cámara" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas las cámaras</SelectItem>
            {camaras.map(camara => (
              <SelectItem key={camara.id} value={camara.id}>
                {camara.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Activities Grid */}
      {filteredActividades.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredActividades.map((actividad) => (
            <ActivityCard
              key={actividad.id}
              actividad={actividad}
              canEdit={canEdit}
              onEdit={() => handleEdit(actividad)}
              onDelete={() => handleDelete(actividad)}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Activity className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay actividades</h3>
            <p className="text-muted-foreground text-center mb-4">
              Comienza registrando las interacciones con las cámaras aliadas.
            </p>
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Crear Primera Actividad
            </Button>
          </CardContent>
        </Card>
      )}

      <ActivityDialog
        actividad={selectedActividad}
        isOpen={showDialog}
        onClose={() => setShowDialog(false)}
        mode={dialogMode}
        onSave={handleSave}
        camaras={camaras}
      />
    </div>
  );
}