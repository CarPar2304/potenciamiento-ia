import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Search, 
  Filter, 
  Download, 
  Users, 
  CheckCircle, 
  Clock, 
  XCircle,
  FileText,
} from 'lucide-react';
import { useSolicitudes, useCamaras } from '@/hooks/useSupabaseData';
import { useAuth, hasPermission } from '@/contexts/AuthContext';

const StatCard = ({ title, value, description, icon: Icon }: {
  title: string;
  value: number;
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

export default function Solicitudes() {
  const { profile } = useAuth();
  const { solicitudes, loading } = useSolicitudes();
  const { camaras } = useCamaras();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [chamberFilter, setChamberFilter] = useState('todas');
  const [sectorFilter, setSectorFilter] = useState('todos');

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

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      'Aprobada': 'text-green-600 bg-green-50 border-green-200',
      'Pendiente': 'text-yellow-600 bg-yellow-50 border-yellow-200',
      'Rechazada': 'text-red-600 bg-red-50 border-red-200',
    };
    
    return (
      <Badge className={colors[status] || 'default'}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-primary bg-clip-text text-transparent">
            Solicitudes
          </h1>
          <p className="text-muted-foreground">
            {canViewGlobal 
              ? 'Gestiona todas las solicitudes de licencias Platzi' 
              : `Solicitudes de ${profile?.chamber}`
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
          title="Total Solicitudes"
          value={stats.total}
          description="Solicitudes registradas"
          icon={Users}
        />
        <StatCard
          title="Aprobadas"
          value={stats.approved}
          description="Licencias otorgadas"
          icon={CheckCircle}
        />
        <StatCard
          title="Pendientes"
          value={stats.pending}
          description="En revisión"
          icon={Clock}
        />
        <StatCard
          title="Rechazadas"
          value={stats.rejected}
          description="No cumplieron requisitos"
          icon={XCircle}
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
                  placeholder="Nombre, email, empresa..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Estado</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
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
          </div>
        </CardContent>
      </Card>

      {/* Applications Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Lista de Solicitudes
          </CardTitle>
          <CardDescription>
            {filteredApplications.length} de {baseApplications.length} solicitudes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Solicitante</TableHead>
                  <TableHead>Empresa</TableHead>
                  {canViewGlobal && <TableHead>Cámara</TableHead>}
                  <TableHead>Sector</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Test</TableHead>
                  <TableHead>Fecha</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                 {loading ? (
                  <TableRow>
                    <TableCell colSpan={canViewGlobal ? 7 : 6} className="text-center py-6">
                      Cargando solicitudes...
                    </TableCell>
                  </TableRow>
                ) : filteredApplications.slice(0, 50).map((sol) => (
                  <TableRow key={sol.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium">{sol.nombres_apellidos}</p>
                        <p className="text-xs text-muted-foreground">{sol.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium">{sol.empresas?.nombre || 'N/A'}</p>
                        <p className="text-xs text-muted-foreground">{sol.empresas?.nit || 'N/A'}</p>
                      </div>
                    </TableCell>
                    {canViewGlobal && (
                      <TableCell>
                        <p className="text-sm">{sol.empresas?.camaras?.nombre || 'N/A'}</p>
                      </TableCell>
                    )}
                    <TableCell>
                      <Badge variant="outline">{sol.empresas?.sector || 'N/A'}</Badge>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(sol.estado)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">Pendiente</Badge>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">
                        {new Date(sol.fecha_solicitud).toLocaleDateString('es-CO')}
                      </p>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}