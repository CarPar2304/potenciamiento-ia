import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  HeartHandshake, 
  Plus, 
  Building2, 
  Calendar, 
  User, 
  TrendingUp,
  Mail,
  Phone,
  FileText,
  Users,
} from 'lucide-react';
import { mockChambers, mockStats, mockInteractions } from '@/data/mockData';
import { useAuth, hasPermission } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const statusColors = {
  'no_contactada': 'bg-gray-100 text-gray-800 border-gray-200',
  'socializada': 'bg-blue-100 text-blue-800 border-blue-200',
  'informe_entregado': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'en_ejecucion': 'bg-green-100 text-green-800 border-green-200',
};

const statusLabels = {
  'no_contactada': 'No Contactada',
  'socializada': 'Socializada',
  'informe_entregado': 'Informe Entregado',
  'en_ejecucion': 'En Ejecución',
};

const interactionTypes = {
  'reunion': 'Reunión',
  'correo': 'Correo',
  'llamada': 'Llamada',
  'reporte': 'Reporte',
  'otro': 'Otro',
};

export default function CRM() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedChamber, setSelectedChamber] = useState<string>('');
  const [interactionData, setInteractionData] = useState({
    type: '',
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    responsible: user?.name || '',
  });

  if (!user) return null;

  const canAccessCRM = hasPermission(user.role, 'crm_edit') || hasPermission(user.role, 'crm_view');
  const canEditCRM = hasPermission(user.role, 'crm_edit');

  if (!canAccessCRM) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] animate-fade-in">
        <HeartHandshake className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Acceso Restringido</h2>
        <p className="text-muted-foreground text-center">
          No tienes permisos para acceder al CRM de Cámaras Aliadas.
        </p>
      </div>
    );
  }

  // Mock chamber status data
  const chamberStatuses = mockChambers.map((chamber, index) => {
    const statuses = ['no_contactada', 'socializada', 'informe_entregado', 'en_ejecucion'];
    const status = statuses[index % statuses.length] as keyof typeof statusColors;
    const chamberStat = mockStats.chamberStats.find(stat => stat.name === chamber);
    
    return {
      name: chamber,
      status,
      licensesUsed: chamberStat?.approved || 0,
      totalApplications: chamberStat?.applications || 0,
      lastInteraction: `2024-01-${(index % 28) + 1}`,
      responsible: ['María González', 'Carlos Rodríguez', 'Ana Martínez'][index % 3],
      progress: Math.floor(Math.random() * 100),
    };
  });

  const handleAddInteraction = () => {
    if (!canEditCRM) {
      toast({
        title: "Sin permisos",
        description: "No tienes permisos para registrar interacciones",
        variant: "destructive",
      });
      return;
    }

    if (!selectedChamber || !interactionData.type || !interactionData.title) {
      return;
    }

    // Mock interaction save
    toast({
      title: "Interacción registrada",
      description: `Se ha registrado la interacción con ${selectedChamber}`,
    });

    setIsDialogOpen(false);
    setSelectedChamber('');
    setInteractionData({
      type: '',
      title: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      responsible: user?.name || '',
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-primary bg-clip-text text-transparent">
            CRM Cámaras Aliadas
          </h1>
          <p className="text-muted-foreground">
            Gestión de relaciones y seguimiento del ciclo de alianzas
            {!canEditCRM && (
              <span className="ml-2 text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded">
                Solo lectura
              </span>
            )}
          </p>
        </div>
        {canEditCRM && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Registrar Interacción
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Nueva Interacción</DialogTitle>
                <DialogDescription>
                  Registra una nueva interacción con una cámara aliada
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="chamber">Cámara</Label>
                  <Select value={selectedChamber} onValueChange={setSelectedChamber}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una cámara" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockChambers.map(chamber => (
                        <SelectItem key={chamber} value={chamber}>{chamber}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Tipo de Interacción</Label>
                  <Select 
                    value={interactionData.type} 
                    onValueChange={(value) => setInteractionData({...interactionData, type: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona el tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(interactionTypes).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Título</Label>
                  <Input
                    id="title"
                    value={interactionData.title}
                    onChange={(e) => setInteractionData({...interactionData, title: e.target.value})}
                    placeholder="Ej: Reunión de seguimiento mensual"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Fecha</Label>
                  <Input
                    id="date"
                    type="date"
                    value={interactionData.date}
                    onChange={(e) => setInteractionData({...interactionData, date: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Notas</Label>
                  <Textarea
                    id="description"
                    value={interactionData.description}
                    onChange={(e) => setInteractionData({...interactionData, description: e.target.value})}
                    placeholder="Detalles de la interacción, acuerdos, próximos pasos..."
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleAddInteraction}>
                    Registrar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Statistics Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cámaras</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{chamberStatuses.length}</div>
            <p className="text-xs text-muted-foreground">Cámaras aliadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Ejecución</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {chamberStatuses.filter(c => c.status === 'en_ejecucion').length}
            </div>
            <p className="text-xs text-muted-foreground">Alianzas activas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Licencias Consumidas</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {chamberStatuses.reduce((sum, c) => sum + c.licensesUsed, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Total por cámaras</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progreso Promedio</CardTitle>
            <HeartHandshake className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(chamberStatuses.reduce((sum, c) => sum + c.progress, 0) / chamberStatuses.length)}%
            </div>
            <p className="text-xs text-muted-foreground">De alianzas</p>
          </CardContent>
        </Card>
      </div>

      {/* Chamber Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {chamberStatuses.map((chamber) => (
          <Card key={chamber.name} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg line-clamp-2">{chamber.name}</CardTitle>
                  <Badge className={statusColors[chamber.status]}>
                    {statusLabels[chamber.status]}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Progress */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Progreso de alianza</span>
                  <span className="font-medium">{chamber.progress}%</span>
                </div>
                <Progress value={chamber.progress} className="h-2" />
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Licencias</p>
                  <p className="font-medium">{chamber.licensesUsed}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Solicitudes</p>
                  <p className="font-medium">{chamber.totalApplications}</p>
                </div>
              </div>

              {/* Last Interaction */}
              <div className="bg-muted/50 p-3 rounded-lg space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Última interacción</span>
                </div>
                <p className="text-sm font-medium">
                  {new Date(chamber.lastInteraction).toLocaleDateString('es-CO')}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <User className="h-3 w-3" />
                  <span>{chamber.responsible}</span>
                </div>
              </div>

              {/* Action Button */}
              {canEditCRM && (
                <Button 
                  variant="outline" 
                  className="w-full gap-2"
                  onClick={() => {
                    setSelectedChamber(chamber.name);
                    setIsDialogOpen(true);
                  }}
                >
                  <Plus className="h-4 w-4" />
                  Registrar Interacción
                </Button>
              )}
              {!canEditCRM && (
                <div className="w-full p-2 text-center text-xs text-muted-foreground bg-muted rounded">
                  Solo lectura - Sin permisos de edición
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Interactions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Interacciones Recientes
          </CardTitle>
          <CardDescription>
            Últimas actividades registradas con las cámaras
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockInteractions.map((interaction) => (
              <div key={interaction.id} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="p-2 rounded-lg bg-primary/10">
                  {interaction.type === 'reunion' && <Users className="h-4 w-4 text-primary" />}
                  {interaction.type === 'correo' && <Mail className="h-4 w-4 text-primary" />}
                  {interaction.type === 'llamada' && <Phone className="h-4 w-4 text-primary" />}
                  {interaction.type === 'reporte' && <FileText className="h-4 w-4 text-primary" />}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{interaction.title}</h4>
                    <Badge variant="outline">{interactionTypes[interaction.type as keyof typeof interactionTypes]}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{interaction.chamber}</p>
                  <p className="text-sm">{interaction.description}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{new Date(interaction.date).toLocaleDateString('es-CO')}</span>
                    <span>• {interaction.responsible}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}