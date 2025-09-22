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
  User,
  Briefcase,
  GraduationCap,
  Hash,
  TrendingUp,
  BookOpen,
  Award,
  BarChart3,
  Building2,
} from 'lucide-react';
import { useColaboradores, useCamaras, usePlatziGeneral, usePlatziSeguimiento } from '@/hooks/useSupabaseData';
import { useAuth, hasPermission } from '@/contexts/AuthContext';

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

const ColaboradorCard = ({ colaborador, onViewDetails, platziData }: {
  colaborador: any;
  onViewDetails: () => void;
  platziData: any[];
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
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div className="flex items-center space-x-3 flex-1">
            <Avatar className="h-12 w-12 ring-2 ring-primary/20">
              <AvatarFallback className="bg-gradient-primary text-primary-foreground font-semibold">
                {colaborador.nombres_apellidos.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-lg font-semibold line-clamp-1">
                {colaborador.nombres_apellidos}
              </CardTitle>
              <CardDescription className="flex items-center gap-2 text-sm truncate">
                <Mail className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{colaborador.email}</span>
              </CardDescription>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-start sm:justify-end gap-2 w-full sm:w-auto">
            <Badge className={`${statusConfig.bg} ${statusConfig.color} ${statusConfig.border} border whitespace-nowrap`}>
              {colaborador.estado}
            </Badge>
            {hasConsumedLicense ? (
              <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50 whitespace-nowrap">
                <Award className="h-3 w-3 mr-1" />
                Licencia consumida
              </Badge>
            ) : colaborador.estado === 'Aprobada' ? (
              <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">
                <Clock className="h-3 w-3 mr-1" />
                Licencia no consumida
              </Badge>
            ) : null}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Hash className="h-3 w-3 flex-shrink-0" />
            <span className="font-medium">Documento:</span>
            <span className="truncate">{colaborador.numero_documento}</span>
          </div>
          
          {colaborador.celular && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-3 w-3 flex-shrink-0" />
              <span className="font-medium">Celular:</span>
              <span className="truncate">{colaborador.celular}</span>
            </div>
          )}
          
          {colaborador.cargo && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Briefcase className="h-3 w-3 flex-shrink-0" />
              <span className="font-medium">Cargo:</span>
              <span className="truncate">{colaborador.cargo}</span>
            </div>
          )}
          
          {colaborador.camaras && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Building2 className="h-3 w-3 flex-shrink-0" />
              <span className="font-medium">Cámara:</span>
              <span className="truncate">{colaborador.camaras.nombre}</span>
            </div>
          )}
          
          {colaborador.nivel_educativo && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <GraduationCap className="h-3 w-3 flex-shrink-0" />
              <span className="font-medium">Nivel educativo:</span>
              <span className="truncate">{colaborador.nivel_educativo}</span>
            </div>
          )}
          
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-3 w-3 flex-shrink-0" />
            <span className="font-medium">Fecha:</span>
            <span>{new Date(colaborador.fecha_solicitud).toLocaleDateString('es-CO')}</span>
          </div>
        </div>

        {userPlatziData && (
          <div className="bg-muted/30 rounded-lg p-3 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Progreso en Platzi</span>
              <Badge variant="outline" className="text-xs">
                {userPlatziData.ruta || 'Sin ruta'}
              </Badge>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs text-muted-foreground">
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

        <div className="flex items-center justify-between pt-2 border-t">
          <div className="text-xs text-muted-foreground">
            Colaborador de {colaborador.camaras?.nombre || 'Cámara no especificada'}
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={onViewDetails}
            className="hover:bg-primary hover:text-primary-foreground"
          >
            <Eye className="h-3 w-3 mr-1" />
            Ver detalles
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default function Colaboradores() {
  const { profile } = useAuth();
  const { colaboradores, loading } = useColaboradores();
  const { camaras } = useCamaras();
  const { platziData } = usePlatziGeneral();
  const { seguimientoData } = usePlatziSeguimiento();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [camaraFilter, setCamaraFilter] = useState<string>('todas');
  const [selectedColaborador, setSelectedColaborador] = useState<any>(null);

  if (!profile) return null;

  const canViewGlobal = hasPermission(profile.role, 'view_global') || hasPermission(profile.role, 'view_all');

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
          <Button variant="outline" size="sm">
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
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredColaboradores.map((colaborador) => (
              <ColaboradorCard
                key={colaborador.id}
                colaborador={colaborador}
                onViewDetails={() => setSelectedColaborador(colaborador)}
                platziData={platziData}
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
    </div>
  );
}