import { memo, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Eye,
  MapPin,
  Calendar,
  Phone,
  Mail,
  Building,
  User,
  Send,
  Edit,
  CheckCircle,
  BookOpen,
  Award,
  TrendingUp,
} from 'lucide-react';

interface SolicitudCardProps {
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
  onLookupChamber: (solicitud: any) => void;
  lookingUpChamber: boolean;
}

const statusConfig: Record<string, { color: string; bg: string; border: string }> = {
  'Aprobada': { 
    color: 'text-success', 
    bg: 'bg-success/10', 
    border: 'border-success/20' 
  },
  'Rechazada': { 
    color: 'text-destructive', 
    bg: 'bg-destructive/10', 
    border: 'border-destructive/20' 
  },
  'Pendiente': { 
    color: 'text-warning', 
    bg: 'bg-warning/10', 
    border: 'border-warning/20' 
  }
};

export const SolicitudCard = memo(function SolicitudCard({
  solicitud,
  canViewGlobal,
  onViewDetails,
  platziData,
  onSendReminder,
  onApproveRequest,
  sendingReminder,
  approvingRequest,
  isSent,
  canExecuteActions,
  onEditRequest,
  isAdmin,
  onLookupChamber,
  lookingUpChamber
}: SolicitudCardProps) {
  const statusStyle = useMemo(() => 
    statusConfig[solicitud.estado] || statusConfig['Pendiente'],
    [solicitud.estado]
  );

  const isApprovedStatus = solicitud.estado === 'Aprobada';
  const isRejectedStatus = solicitud.estado === 'Rechazada';
  
  const personPlatziData = useMemo(() => 
    platziData.find(p => p.email.toLowerCase() === solicitud.email.toLowerCase()),
    [platziData, solicitud.email]
  );
  
  const hasCompletedTest = personPlatziData?.ruta && personPlatziData.ruta !== '';

  const initials = useMemo(() => 
    solicitud.nombres_apellidos
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase(),
    [solicitud.nombres_apellidos]
  );

  const formattedDate = useMemo(() => {
    try {
      return new Date(solicitud.fecha_solicitud).toLocaleDateString('es-CO', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return 'Fecha no disponible';
    }
  }, [solicitud.fecha_solicitud]);

  return (
    <Card className={`group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-fade-in border ${statusStyle.border} ${statusStyle.bg}/30 backdrop-blur-sm overflow-hidden`}>
      <CardContent className="p-4 sm:p-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 ring-2 ring-offset-2 ring-offset-background ring-primary/20">
              <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/40 text-primary font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                {solicitud.nombres_apellidos}
              </h3>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>{formattedDate}</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className={`${statusStyle.color} ${statusStyle.bg} ${statusStyle.border} font-medium`}>
              {solicitud.estado}
            </Badge>
            {solicitud.es_colaborador && (
              <Badge variant="secondary" className="text-xs">
                <User className="h-3 w-3 mr-1" />
                Colaborador
              </Badge>
            )}
            {hasCompletedTest && (
              <Badge variant="default" className="bg-success/20 text-success border-success/30 text-xs">
                <CheckCircle className="h-3 w-3 mr-1" />
                Licencia consumida
              </Badge>
            )}
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm mb-4">
          <div className="flex items-center gap-2 text-muted-foreground truncate">
            <Mail className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="truncate">{solicitud.email}</span>
          </div>
          {solicitud.celular && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-3.5 w-3.5 flex-shrink-0" />
              <span>{solicitud.celular}</span>
            </div>
          )}
          
          {/* Empresa o Cámara */}
          {solicitud.es_colaborador ? (
            <div className="flex items-center gap-2 text-muted-foreground sm:col-span-2">
              <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="truncate">
                {solicitud.camaras?.nombre || 'Sin cámara asignada'}
              </span>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 text-muted-foreground sm:col-span-2">
                <Building className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="truncate">
                  {solicitud.empresas?.nombre || 'Sin empresa'} 
                  {solicitud.nit_empresa && <span className="text-xs opacity-75 ml-1">({solicitud.nit_empresa})</span>}
                </span>
              </div>
              {solicitud.empresas?.camaras?.nombre && (
                <div className="flex items-center gap-2 text-muted-foreground sm:col-span-2">
                  <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                  <span className="truncate">{solicitud.empresas.camaras.nombre}</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Platzi Progress (if approved and has data) */}
        {isApprovedStatus && personPlatziData && (
          <div className="bg-muted/50 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Progreso Platzi</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="text-center">
                <div className="font-bold text-primary">{Math.round(personPlatziData.progreso_ruta || 0)}%</div>
                <div className="text-muted-foreground">Ruta</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-success flex items-center justify-center gap-1">
                  <Award className="h-3 w-3" />
                  {personPlatziData.cursos_totales_certificados || 0}
                </div>
                <div className="text-muted-foreground">Certificados</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-warning flex items-center justify-center gap-1">
                  <BookOpen className="h-3 w-3" />
                  {personPlatziData.cursos_totales_progreso || 0}
                </div>
                <div className="text-muted-foreground">En progreso</div>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Botón para enviar recordatorio (solo para aprobadas sin licencia consumida) */}
          {canExecuteActions && isApprovedStatus && !hasCompletedTest && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onSendReminder(solicitud)}
              disabled={sendingReminder || isSent}
              className={`transition-colors ${isSent ? 'bg-success/10 text-success border-success/30' : 'text-primary hover:text-primary-foreground hover:bg-primary'}`}
            >
              {sendingReminder ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 mr-1 border-b-2 border-current" />
                  <span className="hidden sm:inline">Enviando...</span>
                  <span className="sm:hidden">...</span>
                </>
              ) : isSent ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Enviado</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Recordatorio</span>
                  <span className="sm:hidden">Enviar</span>
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
              className="text-success hover:text-success-foreground hover:bg-success border-success/30 transition-colors"
            >
              {approvingRequest ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 mr-1 border-b-2 border-current" />
                  <span className="hidden sm:inline">Aprobando...</span>
                  <span className="sm:hidden">...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Aprobar</span>
                </>
              )}
            </Button>
          )}

          {/* Botón para editar solicitud (solo admins) */}
          {canExecuteActions && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEditRequest(solicitud)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <Edit className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Editar</span>
              <span className="sm:hidden">Editar</span>
            </Button>
          )}
          
          {/* Botón para buscar cámara en RUES (solo si no tiene cámara asignada y no es colaborador) */}
          {isAdmin && !solicitud.es_colaborador && solicitud.empresas && !solicitud.empresas.camara_id && (
            <Button
              variant="outline" 
              size="sm" 
              onClick={() => onLookupChamber(solicitud)}
              disabled={lookingUpChamber}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200 hover:border-blue-400 transition-colors"
            >
              {lookingUpChamber ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 mr-1 border-b-2 border-blue-600" />
                  <span className="hidden sm:inline">Buscando...</span>
                  <span className="sm:hidden">...</span>
                </>
              ) : (
                <>
                  <MapPin className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Buscar Cámara</span>
                  <span className="sm:hidden">Cámara</span>
                </>
              )}
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={onViewDetails}
            className="ml-auto text-muted-foreground hover:text-primary"
          >
            <Eye className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Ver detalles</span>
            <span className="sm:hidden">Ver</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});
