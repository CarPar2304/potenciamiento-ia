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
  Edit,
  Trash2,
  CalendarIcon,
} from 'lucide-react';
import { useEmpresas, useCamaras, useSolicitudes, usePlatziGeneral } from '@/hooks/useSupabaseData';
import { useAuth, hasPermission } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExportModal } from '@/components/export/ExportModal';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

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

const EmpresaCard = ({ empresa, canViewGlobal, onViewDetails, colaboradores, onEditEmpresa, onDeleteEmpresa, isAdmin }: {
  empresa: any;
  canViewGlobal: boolean;
  onViewDetails: () => void;
  colaboradores: any[];
  onEditEmpresa: (empresa: any) => void;
  onDeleteEmpresa: (empresa: any) => void;
  isAdmin: boolean;
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
          <div className="flex items-center gap-2">
            {/* Botón de edición solo para administradores */}
            {isAdmin && (
              <Button
                variant="outline" 
                size="sm" 
                onClick={() => onEditEmpresa(empresa)}
                className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 border-amber-200 hover:border-amber-400 transition-colors"
              >
                <Edit className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Editar</span>
              </Button>
            )}
            
            {/* Botón de eliminación solo para administradores */}
            {isAdmin && (
              <Button
                variant="outline" 
                size="sm" 
                onClick={() => onDeleteEmpresa(empresa)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-400 transition-colors"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Eliminar</span>
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
            </Button>
          </div>
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
                <p>{empresa.ventas_2024 ? formatCurrency(empresa.ventas_2024 / 100) : 'No reportado'}</p>
              </div>
              <div>
                <label className="font-medium text-muted-foreground">Utilidades 2024</label>
                <p>{empresa.utilidades_2024 ? formatCurrency(empresa.utilidades_2024 / 100) : 'No reportado'}</p>
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

const EmpresaEditDialog = ({ empresa, isOpen, onClose, onSave }: {
  empresa: any;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedEmpresa: any) => void;
}) => {
  const { camaras } = useCamaras();
  const [formData, setFormData] = useState({
    nombre: '',
    nit: '',
    sector: '',
    mercado: '',
    num_colaboradores: '',
    mujeres_colaboradoras: '',
    ventas_2024: '',
    utilidades_2024: '',
    productos_servicios: '',
    tipo_cliente: '',
    decision_adoptar_ia: '',
    areas_implementacion_ia: '',
    razon_no_adopcion: '',
    invirtio_ia_2024: '',
    monto_inversion_2024: '',
    asigno_recursos_ia: '',
    probabilidad_adopcion_12m: '',
    probabilidad_inversion_12m: '',
    monto_invertir_12m: '',
    colaboradores_capacitados_ia: '',
    plan_capacitacion_ia: '',
    camara_id: '',
  });
  
  const [saving, setSaving] = useState(false);

  // Inicializar form data cuando cambia la empresa
  useEffect(() => {
    if (empresa) {
      setFormData({
        nombre: empresa.nombre || '',
        nit: empresa.nit || '',
        sector: empresa.sector || '',
        mercado: empresa.mercado || '',
        num_colaboradores: empresa.num_colaboradores?.toString() || '',
        mujeres_colaboradoras: empresa.mujeres_colaboradoras?.toString() || '',
        ventas_2024: empresa.ventas_2024?.toString() || '',
        utilidades_2024: empresa.utilidades_2024?.toString() || '',
        productos_servicios: empresa.productos_servicios || '',
        tipo_cliente: empresa.tipo_cliente || '',
        decision_adoptar_ia: empresa.decision_adoptar_ia || '',
        areas_implementacion_ia: empresa.areas_implementacion_ia || '',
        razon_no_adopcion: empresa.razon_no_adopcion || '',
        invirtio_ia_2024: empresa.invirtio_ia_2024 || '',
        monto_inversion_2024: empresa.monto_inversion_2024?.toString() || '',
        asigno_recursos_ia: empresa.asigno_recursos_ia || '',
        probabilidad_adopcion_12m: empresa.probabilidad_adopcion_12m?.toString() || '',
        probabilidad_inversion_12m: empresa.probabilidad_inversion_12m?.toString() || '',
        monto_invertir_12m: empresa.monto_invertir_12m?.toString() || '',
        colaboradores_capacitados_ia: empresa.colaboradores_capacitados_ia?.toString() || '',
        plan_capacitacion_ia: empresa.plan_capacitacion_ia || '',
        camara_id: empresa.camara_id || '',
      });
    }
  }, [empresa]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const updatedEmpresa = {
        nombre: formData.nombre,
        nit: formData.nit,
        sector: formData.sector,
        mercado: formData.mercado,
        num_colaboradores: formData.num_colaboradores ? parseInt(formData.num_colaboradores) : null,
        mujeres_colaboradoras: formData.mujeres_colaboradoras ? parseInt(formData.mujeres_colaboradoras) : null,
        ventas_2024: formData.ventas_2024 ? parseFloat(formData.ventas_2024) : null,
        utilidades_2024: formData.utilidades_2024 ? parseFloat(formData.utilidades_2024) : null,
        productos_servicios: formData.productos_servicios,
        tipo_cliente: formData.tipo_cliente,
        decision_adoptar_ia: formData.decision_adoptar_ia,
        areas_implementacion_ia: formData.areas_implementacion_ia,
        razon_no_adopcion: formData.razon_no_adopcion,
        invirtio_ia_2024: formData.invirtio_ia_2024,
        monto_inversion_2024: formData.monto_inversion_2024 ? parseFloat(formData.monto_inversion_2024) : null,
        asigno_recursos_ia: formData.asigno_recursos_ia,
        probabilidad_adopcion_12m: formData.probabilidad_adopcion_12m ? parseInt(formData.probabilidad_adopcion_12m) : null,
        probabilidad_inversion_12m: formData.probabilidad_inversion_12m ? parseInt(formData.probabilidad_inversion_12m) : null,
        monto_invertir_12m: formData.monto_invertir_12m ? parseFloat(formData.monto_invertir_12m) : null,
        colaboradores_capacitados_ia: formData.colaboradores_capacitados_ia ? parseInt(formData.colaboradores_capacitados_ia) : null,
        plan_capacitacion_ia: formData.plan_capacitacion_ia,
        camara_id: formData.camara_id || null,
      };

      await onSave(updatedEmpresa);
    } finally {
      setSaving(false);
    }
  };

  if (!empresa) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Editar Empresa
          </DialogTitle>
          <DialogDescription>
            Modifica la información de la empresa
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nombre">Nombre de la Empresa</Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => handleInputChange('nombre', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="nit">NIT</Label>
              <Input
                id="nit"
                value={formData.nit}
                onChange={(e) => handleInputChange('nit', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="camara_id">Cámara de Comercio</Label>
              <Select 
                value={formData.camara_id || "sin_camara"} 
                onValueChange={(value) => handleInputChange('camara_id', value === "sin_camara" ? "" : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar cámara" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sin_camara">Sin cámara vinculada</SelectItem>
                  {camaras.map((camara) => (
                    <SelectItem key={camara.id} value={camara.id}>
                      {camara.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="sector">Sector</Label>
              <Input
                id="sector"
                value={formData.sector}
                onChange={(e) => handleInputChange('sector', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="mercado">Mercado</Label>
              <Select value={formData.mercado} onValueChange={(value) => handleInputChange('mercado', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar mercado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Local">Local</SelectItem>
                  <SelectItem value="Nacional">Nacional</SelectItem>
                  <SelectItem value="Internacional">Internacional</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="tipo_cliente">Tipo de Cliente</Label>
              <Input
                id="tipo_cliente"
                value={formData.tipo_cliente}
                onChange={(e) => handleInputChange('tipo_cliente', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="num_colaboradores">Número de Colaboradores</Label>
              <Input
                id="num_colaboradores"
                type="number"
                value={formData.num_colaboradores}
                onChange={(e) => handleInputChange('num_colaboradores', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="mujeres_colaboradoras">Mujeres Colaboradoras</Label>
              <Input
                id="mujeres_colaboradoras"
                type="number"
                value={formData.mujeres_colaboradoras}
                onChange={(e) => handleInputChange('mujeres_colaboradoras', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="ventas_2024">Ventas 2024</Label>
              <Input
                id="ventas_2024"
                type="number"
                step="0.01"
                value={formData.ventas_2024}
                onChange={(e) => handleInputChange('ventas_2024', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="utilidades_2024">Utilidades 2024</Label>
              <Input
                id="utilidades_2024"
                type="number"
                step="0.01"
                value={formData.utilidades_2024}
                onChange={(e) => handleInputChange('utilidades_2024', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="decision_adoptar_ia">¿Decidió adoptar IA?</Label>
              <Select value={formData.decision_adoptar_ia} onValueChange={(value) => handleInputChange('decision_adoptar_ia', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Si">Si</SelectItem>
                  <SelectItem value="No">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="invirtio_ia_2024">¿Invirtió en IA en 2024?</Label>
              <Select value={formData.invirtio_ia_2024} onValueChange={(value) => handleInputChange('invirtio_ia_2024', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Si">Si</SelectItem>
                  <SelectItem value="No">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="monto_inversion_2024">Monto Inversión 2024</Label>
              <Input
                id="monto_inversion_2024"
                type="number"
                step="0.01"
                value={formData.monto_inversion_2024}
                onChange={(e) => handleInputChange('monto_inversion_2024', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="asigno_recursos_ia">¿Asignó recursos para IA?</Label>
              <Select value={formData.asigno_recursos_ia} onValueChange={(value) => handleInputChange('asigno_recursos_ia', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Si">Si</SelectItem>
                  <SelectItem value="No">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="probabilidad_adopcion_12m">Probabilidad Adopción 12m (1-5)</Label>
              <Input
                id="probabilidad_adopcion_12m"
                type="number"
                min="1"
                max="5"
                value={formData.probabilidad_adopcion_12m}
                onChange={(e) => handleInputChange('probabilidad_adopcion_12m', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="probabilidad_inversion_12m">Probabilidad Inversión 12m (1-5)</Label>
              <Input
                id="probabilidad_inversion_12m"
                type="number"
                min="1"
                max="5"
                value={formData.probabilidad_inversion_12m}
                onChange={(e) => handleInputChange('probabilidad_inversion_12m', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="monto_invertir_12m">Monto a Invertir 12m</Label>
              <Input
                id="monto_invertir_12m"
                type="number"
                step="0.01"
                value={formData.monto_invertir_12m}
                onChange={(e) => handleInputChange('monto_invertir_12m', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="colaboradores_capacitados_ia">Colaboradores Capacitados en IA</Label>
              <Input
                id="colaboradores_capacitados_ia"
                type="number"
                value={formData.colaboradores_capacitados_ia}
                onChange={(e) => handleInputChange('colaboradores_capacitados_ia', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="plan_capacitacion_ia">¿Tiene plan de capacitación en IA?</Label>
              <Select value={formData.plan_capacitacion_ia} onValueChange={(value) => handleInputChange('plan_capacitacion_ia', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Si">Si</SelectItem>
                  <SelectItem value="No">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <Label htmlFor="productos_servicios">Productos o Servicios</Label>
              <Textarea
                id="productos_servicios"
                value={formData.productos_servicios}
                onChange={(e) => handleInputChange('productos_servicios', e.target.value)}
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="areas_implementacion_ia">Áreas de Implementación de IA</Label>
              <Textarea
                id="areas_implementacion_ia"
                value={formData.areas_implementacion_ia}
                onChange={(e) => handleInputChange('areas_implementacion_ia', e.target.value)}
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="razon_no_adopcion">Razón para No Adoptar IA</Label>
              <Textarea
                id="razon_no_adopcion"
                value={formData.razon_no_adopcion}
                onChange={(e) => handleInputChange('razon_no_adopcion', e.target.value)}
              />
            </div>
          </div>
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

const EmpresaCreateDialog = ({ isOpen, onClose, onSave }: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newEmpresa: any) => void;
}) => {
  const { camaras } = useCamaras();
  const [formData, setFormData] = useState({
    nombre: '',
    nit: '',
    sector: '',
    mercado: '',
    num_colaboradores: '',
    mujeres_colaboradoras: '',
    ventas_2024: '',
    utilidades_2024: '',
    productos_servicios: '',
    tipo_cliente: '',
    decision_adoptar_ia: '',
    areas_implementacion_ia: '',
    razon_no_adopcion: '',
    invirtio_ia_2024: '',
    monto_inversion_2024: '',
    asigno_recursos_ia: '',
    probabilidad_adopcion_12m: '',
    probabilidad_inversion_12m: '',
    monto_invertir_12m: '',
    colaboradores_capacitados_ia: '',
    plan_capacitacion_ia: '',
    camara_id: '',
  });
  
  const [saving, setSaving] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    // Validar campos requeridos
    if (!formData.nombre || !formData.nit) {
      return;
    }

    setSaving(true);
    try {
      const newEmpresa = {
        nombre: formData.nombre,
        nit: formData.nit,
        sector: formData.sector || null,
        mercado: formData.mercado || null,
        num_colaboradores: formData.num_colaboradores ? parseInt(formData.num_colaboradores) : null,
        mujeres_colaboradoras: formData.mujeres_colaboradoras ? parseInt(formData.mujeres_colaboradoras) : null,
        ventas_2024: formData.ventas_2024 ? parseFloat(formData.ventas_2024) : null,
        utilidades_2024: formData.utilidades_2024 ? parseFloat(formData.utilidades_2024) : null,
        productos_servicios: formData.productos_servicios || null,
        tipo_cliente: formData.tipo_cliente || null,
        decision_adoptar_ia: formData.decision_adoptar_ia || null,
        areas_implementacion_ia: formData.areas_implementacion_ia || null,
        razon_no_adopcion: formData.razon_no_adopcion || null,
        invirtio_ia_2024: formData.invirtio_ia_2024 || null,
        monto_inversion_2024: formData.monto_inversion_2024 ? parseFloat(formData.monto_inversion_2024) : null,
        asigno_recursos_ia: formData.asigno_recursos_ia || null,
        probabilidad_adopcion_12m: formData.probabilidad_adopcion_12m ? parseInt(formData.probabilidad_adopcion_12m) : null,
        probabilidad_inversion_12m: formData.probabilidad_inversion_12m ? parseInt(formData.probabilidad_inversion_12m) : null,
        monto_invertir_12m: formData.monto_invertir_12m ? parseFloat(formData.monto_invertir_12m) : null,
        colaboradores_capacitados_ia: formData.colaboradores_capacitados_ia ? parseInt(formData.colaboradores_capacitados_ia) : null,
        plan_capacitacion_ia: formData.plan_capacitacion_ia || null,
        camara_id: formData.camara_id || null,
      };

      await onSave(newEmpresa);
      
      // Reset form
      setFormData({
        nombre: '',
        nit: '',
        sector: '',
        mercado: '',
        num_colaboradores: '',
        mujeres_colaboradoras: '',
        ventas_2024: '',
        utilidades_2024: '',
        productos_servicios: '',
        tipo_cliente: '',
        decision_adoptar_ia: '',
        areas_implementacion_ia: '',
        razon_no_adopcion: '',
        invirtio_ia_2024: '',
        monto_inversion_2024: '',
        asigno_recursos_ia: '',
        probabilidad_adopcion_12m: '',
        probabilidad_inversion_12m: '',
        monto_invertir_12m: '',
        colaboradores_capacitados_ia: '',
        plan_capacitacion_ia: '',
        camara_id: '',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Crear Nueva Empresa
          </DialogTitle>
          <DialogDescription>
            Completa la información para crear una nueva empresa
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nombre">Nombre de la Empresa <span className="text-destructive">*</span></Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => handleInputChange('nombre', e.target.value)}
                placeholder="Nombre completo de la empresa"
                required
              />
            </div>
            <div>
              <Label htmlFor="nit">NIT <span className="text-destructive">*</span></Label>
              <Input
                id="nit"
                value={formData.nit}
                onChange={(e) => handleInputChange('nit', e.target.value)}
                placeholder="Número de identificación tributaria"
                required
              />
            </div>
            <div>
              <Label htmlFor="camara_id">Cámara de Comercio</Label>
              <Select 
                value={formData.camara_id || "sin_camara"} 
                onValueChange={(value) => handleInputChange('camara_id', value === "sin_camara" ? "" : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar cámara" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sin_camara">Sin cámara vinculada</SelectItem>
                  {camaras.map((camara) => (
                    <SelectItem key={camara.id} value={camara.id}>
                      {camara.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="sector">Sector</Label>
              <Input
                id="sector"
                value={formData.sector}
                onChange={(e) => handleInputChange('sector', e.target.value)}
                placeholder="Sector empresarial"
              />
            </div>
            <div>
              <Label htmlFor="mercado">Mercado</Label>
              <Select value={formData.mercado} onValueChange={(value) => handleInputChange('mercado', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar mercado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Local">Local</SelectItem>
                  <SelectItem value="Nacional">Nacional</SelectItem>
                  <SelectItem value="Internacional">Internacional</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="tipo_cliente">Tipo de Cliente</Label>
              <Input
                id="tipo_cliente"
                value={formData.tipo_cliente}
                onChange={(e) => handleInputChange('tipo_cliente', e.target.value)}
                placeholder="Tipo de cliente objetivo"
              />
            </div>
            <div>
              <Label htmlFor="num_colaboradores">Número de Colaboradores</Label>
              <Input
                id="num_colaboradores"
                type="number"
                value={formData.num_colaboradores}
                onChange={(e) => handleInputChange('num_colaboradores', e.target.value)}
                placeholder="0"
              />
            </div>
            <div>
              <Label htmlFor="mujeres_colaboradoras">Mujeres Colaboradoras</Label>
              <Input
                id="mujeres_colaboradoras"
                type="number"
                value={formData.mujeres_colaboradoras}
                onChange={(e) => handleInputChange('mujeres_colaboradoras', e.target.value)}
                placeholder="0"
              />
            </div>
            <div>
              <Label htmlFor="ventas_2024">Ventas 2024</Label>
              <Input
                id="ventas_2024"
                type="number"
                step="0.01"
                value={formData.ventas_2024}
                onChange={(e) => handleInputChange('ventas_2024', e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="utilidades_2024">Utilidades 2024</Label>
              <Input
                id="utilidades_2024"
                type="number"
                step="0.01"
                value={formData.utilidades_2024}
                onChange={(e) => handleInputChange('utilidades_2024', e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="decision_adoptar_ia">¿Decidió adoptar IA?</Label>
              <Select value={formData.decision_adoptar_ia} onValueChange={(value) => handleInputChange('decision_adoptar_ia', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Si">Si</SelectItem>
                  <SelectItem value="No">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="invirtio_ia_2024">¿Invirtió en IA en 2024?</Label>
              <Select value={formData.invirtio_ia_2024} onValueChange={(value) => handleInputChange('invirtio_ia_2024', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Si">Si</SelectItem>
                  <SelectItem value="No">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="monto_inversion_2024">Monto Inversión 2024</Label>
              <Input
                id="monto_inversion_2024"
                type="number"
                step="0.01"
                value={formData.monto_inversion_2024}
                onChange={(e) => handleInputChange('monto_inversion_2024', e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="asigno_recursos_ia">¿Asignó recursos para IA?</Label>
              <Select value={formData.asigno_recursos_ia} onValueChange={(value) => handleInputChange('asigno_recursos_ia', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Si">Si</SelectItem>
                  <SelectItem value="No">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="probabilidad_adopcion_12m">Probabilidad Adopción 12m (1-5)</Label>
              <Input
                id="probabilidad_adopcion_12m"
                type="number"
                min="1"
                max="5"
                value={formData.probabilidad_adopcion_12m}
                onChange={(e) => handleInputChange('probabilidad_adopcion_12m', e.target.value)}
                placeholder="1-5"
              />
            </div>
            <div>
              <Label htmlFor="probabilidad_inversion_12m">Probabilidad Inversión 12m (1-5)</Label>
              <Input
                id="probabilidad_inversion_12m"
                type="number"
                min="1"
                max="5"
                value={formData.probabilidad_inversion_12m}
                onChange={(e) => handleInputChange('probabilidad_inversion_12m', e.target.value)}
                placeholder="1-5"
              />
            </div>
            <div>
              <Label htmlFor="monto_invertir_12m">Monto a Invertir 12m</Label>
              <Input
                id="monto_invertir_12m"
                type="number"
                step="0.01"
                value={formData.monto_invertir_12m}
                onChange={(e) => handleInputChange('monto_invertir_12m', e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="colaboradores_capacitados_ia">Colaboradores Capacitados en IA</Label>
              <Input
                id="colaboradores_capacitados_ia"
                type="number"
                value={formData.colaboradores_capacitados_ia}
                onChange={(e) => handleInputChange('colaboradores_capacitados_ia', e.target.value)}
                placeholder="0"
              />
            </div>
            <div>
              <Label htmlFor="plan_capacitacion_ia">¿Tiene plan de capacitación en IA?</Label>
              <Select value={formData.plan_capacitacion_ia} onValueChange={(value) => handleInputChange('plan_capacitacion_ia', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Si">Si</SelectItem>
                  <SelectItem value="No">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <Label htmlFor="productos_servicios">Productos o Servicios</Label>
              <Textarea
                id="productos_servicios"
                value={formData.productos_servicios}
                onChange={(e) => handleInputChange('productos_servicios', e.target.value)}
                placeholder="Describe los productos o servicios que ofrece la empresa"
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="areas_implementacion_ia">Áreas de Implementación de IA</Label>
              <Textarea
                id="areas_implementacion_ia"
                value={formData.areas_implementacion_ia}
                onChange={(e) => handleInputChange('areas_implementacion_ia', e.target.value)}
                placeholder="Áreas donde se ha implementado IA"
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="razon_no_adopcion">Razón para No Adoptar IA</Label>
              <Textarea
                id="razon_no_adopcion"
                value={formData.razon_no_adopcion}
                onChange={(e) => handleInputChange('razon_no_adopcion', e.target.value)}
                placeholder="Razones por las cuales no se ha adoptado IA"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={saving || !formData.nombre || !formData.nit}
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 mr-2 border-b-2 border-white" />
                Creando...
              </>
            ) : (
              'Crear Empresa'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default function Empresas() {
  const { profile } = useAuth();
  const { empresas, loading, refetch } = useEmpresas();
  const { camaras } = useCamaras();
  const { solicitudes } = useSolicitudes();
  const { platziData } = usePlatziGeneral();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [chamberFilter, setChamberFilter] = useState('todas');
  const [sectorFilter, setSectorFilter] = useState('todos');
  const [aiFilter, setAiFilter] = useState('todos');
  const [selectedEmpresa, setSelectedEmpresa] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingEmpresa, setEditingEmpresa] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingEmpresa, setDeletingEmpresa] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  if (!profile) return null;

  const canViewGlobal = hasPermission(profile.role, 'view_global') || hasPermission(profile.role, 'view_all');
  const isAdmin = hasPermission(profile.role, 'admin_actions');

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

  const handleEditEmpresa = (empresa: any) => {
    setEditingEmpresa(empresa);
    setShowEditDialog(true);
  };

  const handleDeleteEmpresa = (empresa: any) => {
    setDeletingEmpresa(empresa);
    setShowDeleteDialog(true);
  };

  const handleSaveEdit = async (updatedEmpresa: any) => {
    try {
      const { error } = await supabase
        .from('empresas')
        .update(updatedEmpresa)
        .eq('id', editingEmpresa.id);

      if (error) throw error;

      // Refrescar datos para ver cambios inmediatamente
      await refetch();

      toast({
        title: "Empresa actualizada",
        description: "Los cambios se han guardado correctamente.",
      });

      setShowEditDialog(false);
      setEditingEmpresa(null);
    } catch (error: any) {
      console.error('Error updating company:', error);
      toast({
        title: "Error al actualizar",
        description: error.message || "Ocurrió un error inesperado.",
        variant: "destructive"
      });
    }
  };

  const handleCreateEmpresa = async (newEmpresa: any) => {
    try {
      const { error } = await supabase
        .from('empresas')
        .insert([newEmpresa]);

      if (error) throw error;

      // Refrescar datos para ver cambios inmediatamente
      await refetch();

      toast({
        title: "Empresa creada",
        description: "La nueva empresa se ha creado correctamente.",
      });

      setShowCreateDialog(false);
    } catch (error: any) {
      console.error('Error creating company:', error);
      toast({
        title: "Error al crear empresa",
        description: error.message || "Ocurrió un error inesperado.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      const { error } = await supabase
        .from('empresas')
        .delete()
        .eq('id', deletingEmpresa.id);

      if (error) throw error;

      toast({
        title: "Empresa eliminada",
        description: "La empresa ha sido eliminada correctamente.",
      });

      setShowDeleteDialog(false);
      setDeletingEmpresa(null);
      
      // Recargar datos
      window.location.reload();
    } catch (error: any) {
      console.error('Error deleting company:', error);
      toast({
        title: "Error al eliminar",
        description: error.message || "Ocurrió un error inesperado.",
        variant: "destructive"
      });
    } finally {
      setDeleting(false);
    }
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
          {isAdmin && (
            <Button 
              className="gap-2 bg-gradient-primary text-primary-foreground hover:opacity-90"
              onClick={() => setShowCreateDialog(true)}
            >
              <Building2 className="h-4 w-4" />
              Crear Nueva Empresa
            </Button>
          )}
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={() => setShowExportModal(true)}
          >
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

      {/* Results Counter */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">
          Mostrando <span className="font-semibold text-foreground">{filteredCompanies.length}</span> de <span className="font-semibold text-foreground">{baseCompanies.length}</span> empresas
        </p>
      </div>

      {/* Enhanced Companies Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredCompanies.slice(0, 24).map((empresa) => (
          <EmpresaCard
            key={empresa.nit}
            empresa={empresa}
            canViewGlobal={canViewGlobal}
            onViewDetails={() => handleViewDetails(empresa)}
            onEditEmpresa={handleEditEmpresa}
            onDeleteEmpresa={handleDeleteEmpresa}
            isAdmin={isAdmin}
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

      {/* Edit Dialog */}
      <EmpresaEditDialog
        empresa={editingEmpresa}
        isOpen={showEditDialog}
        onClose={() => {
          setShowEditDialog(false);
          setEditingEmpresa(null);
        }}
        onSave={handleSaveEdit}
      />

      {/* Create Dialog */}
      <EmpresaCreateDialog
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onSave={handleCreateEmpresa}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar empresa?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente la empresa 
              <strong> {deletingEmpresa?.nombre}</strong> y todos sus datos asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 mr-2 border-b-2 border-white" />
                  Eliminando...
                </>
              ) : (
                'Eliminar'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Export Modal */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        data={filteredCompanies}
        type="empresas"
        platziEmails={new Set(platziData?.map(p => p.email?.toLowerCase() || '') || [])}
        platziData={platziData}
      />
    </div>
  );
}