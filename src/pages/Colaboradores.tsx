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
  UserCheck, 
  Clock, 
  Award,
} from 'lucide-react';
import { mockApplications, mockChambers } from '@/data/mockData';
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

export default function Colaboradores() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [chamberFilter, setChamberFilter] = useState('todas');
  const [levelFilter, setLevelFilter] = useState('todos');

  if (!user) return null;

  const canViewGlobal = hasPermission(user.role, 'view_all');
  const canViewCCC = hasPermission(user.role, 'colaboradores_cali');
  const canViewOwn = hasPermission(user.role, 'colaboradores_own');

  // Filter applications to only show chamber employees (example criteria)
  const chamberEmployees = mockApplications.filter(app => {
    // Mock condition: employees with company names containing "Cámara" are chamber employees
    const isChamberEmployee = app.company.toLowerCase().includes('cámara');
    
    let matchesPermission = false;
    
    if (canViewGlobal) {
      matchesPermission = true; // Admin can see all
    } else if (canViewCCC) {
      matchesPermission = app.chamber === 'Cámara de Comercio de Cali'; // CCC can only see Cali
    } else if (canViewOwn && user.chamber) {
      matchesPermission = app.chamber === user.chamber; // Chamber users see their own
    }
    
    return isChamberEmployee && matchesPermission;
  });

  // Apply additional filters
  const filteredEmployees = chamberEmployees.filter(employee => {
    const matchesSearch = 
      `${employee.firstName} ${employee.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.company.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesChamber = chamberFilter === 'todas' || employee.chamber === chamberFilter;
    const matchesLevel = levelFilter === 'todos' || 
      (levelFilter === 'sin_nivel' && !employee.platziLevel) ||
      (levelFilter !== 'sin_nivel' && employee.platziLevel === parseInt(levelFilter));

    return matchesSearch && matchesChamber && matchesLevel;
  });

  // Calculate stats
  const stats = {
    total: chamberEmployees.length,
    withLevel: chamberEmployees.filter(emp => emp.platziLevel).length,
    completedTests: chamberEmployees.filter(emp => emp.testCompleted).length,
    highPerformers: chamberEmployees.filter(emp => emp.progress >= 80).length,
  };

  const getLevelBadge = (level: number | null) => {
    if (!level) return <Badge variant="secondary">Sin Nivel</Badge>;
    
    const colors: Record<number, string> = {
      1: 'bg-red-100 text-red-800 border-red-200',
      2: 'bg-orange-100 text-orange-800 border-orange-200',
      3: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      4: 'bg-blue-100 text-blue-800 border-blue-200',
      5: 'bg-green-100 text-green-800 border-green-200',
      6: 'bg-purple-100 text-purple-800 border-purple-200',
    };

    return (
      <Badge className={colors[level] || 'default'}>
        Nivel {level}
      </Badge>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-primary bg-clip-text text-transparent">
            Colaboradores de Cámaras
          </h1>
          <p className="text-muted-foreground">
            {canViewGlobal 
              ? 'Personal de todas las cámaras aliadas participando en el programa'
              : canViewCCC 
              ? 'Colaboradores de la Cámara de Comercio de Cali'
              : `Colaboradores de ${user.chamber}`
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
          title="Total Colaboradores"
          value={stats.total}
          description="Personal de cámaras"
          icon={Users}
        />
        <StatCard
          title="Con Nivel Asignado"
          value={stats.withLevel}
          description="Han completado diagnóstico"
          icon={Award}
        />
        <StatCard
          title="Tests Completados"
          value={stats.completedTests}
          description="Diagnósticos finalizados"
          icon={UserCheck}
        />
        <StatCard
          title="Alto Rendimiento"
          value={stats.highPerformers}
          description="+80% de progreso"
          icon={Clock}
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
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Nombre, email, cámara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
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
                    {mockChambers.map(chamber => (
                      <SelectItem key={chamber} value={chamber}>{chamber}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Nivel IA</label>
              <Select value={levelFilter} onValueChange={setLevelFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los niveles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los niveles</SelectItem>
                  <SelectItem value="sin_nivel">Sin Nivel</SelectItem>
                  <SelectItem value="1">Nivel 1</SelectItem>
                  <SelectItem value="2">Nivel 2</SelectItem>
                  <SelectItem value="3">Nivel 3</SelectItem>
                  <SelectItem value="4">Nivel 4</SelectItem>
                  <SelectItem value="5">Nivel 5</SelectItem>
                  <SelectItem value="6">Nivel 6</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Employees Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Lista de Colaboradores
          </CardTitle>
          <CardDescription>
            {filteredEmployees.length} de {chamberEmployees.length} colaboradores
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Colaborador</TableHead>
                  <TableHead>Cámara</TableHead>
                  <TableHead>Nivel IA</TableHead>
                  <TableHead>Progreso</TableHead>
                  <TableHead>Test</TableHead>
                  <TableHead>Fecha Registro</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.slice(0, 50).map((employee) => (
                  <TableRow key={employee.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium">{employee.firstName} {employee.lastName}</p>
                        <p className="text-xs text-muted-foreground">{employee.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm font-medium">{employee.chamber}</p>
                    </TableCell>
                    <TableCell>
                      {getLevelBadge(employee.platziLevel)}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{employee.progress}%</p>
                        <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary transition-all" 
                            style={{ width: `${employee.progress}%` }}
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {employee.testCompleted ? (
                        <Badge className="bg-green-100 text-green-800 border-green-200">
                          Completado
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Pendiente</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">
                        {new Date(employee.createdAt).toLocaleDateString('es-CO')}
                      </p>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {filteredEmployees.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No se encontraron colaboradores</h3>
            <p className="text-muted-foreground text-center">
              Intenta ajustar los filtros de búsqueda para encontrar los colaboradores que buscas.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}