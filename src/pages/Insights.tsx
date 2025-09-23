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
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Plus, 
  TrendingUp, 
  Users, 
  Calendar, 
  Edit, 
  Trash2,
  Eye,
  Lightbulb,
  Target,
  BarChart3
} from 'lucide-react';
import { useInsights } from '@/hooks/useSupabaseData';
import { useAuth, hasPermission } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const InsightCard = ({ insight, canEdit, onEdit, onDelete, onView }: {
  insight: any;
  canEdit: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onView: () => void;
}) => {
  const getAudienceBadge = (audiencia: string) => {
    const badges = {
      admin: { label: 'Administradores', variant: 'default' as const },
      ccc: { label: 'CCC', variant: 'secondary' as const },
      camara_aliada: { label: 'Cámaras Aliadas', variant: 'outline' as const },
      todos: { label: 'Todos', variant: 'default' as const }
    };
    return badges[audiencia] || badges.todos;
  };

  const audienceBadge = getAudienceBadge(insight.audiencia);

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <CardTitle className="text-lg font-semibold leading-tight">
              {insight.titulo}
            </CardTitle>
            <CardDescription className="flex items-center gap-2">
              <Calendar className="h-3 w-3" />
              {new Date(insight.fecha_publicacion).toLocaleDateString('es-CO')}
            </CardDescription>
          </div>
          <Badge variant={audienceBadge.variant}>
            {audienceBadge.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4 line-clamp-3">
          {insight.contenido}
        </p>
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={onView}
            className="text-primary hover:text-primary/80"
          >
            <Eye className="h-4 w-4 mr-1" />
            Ver completo
          </Button>
          {canEdit && (
            <div className="flex gap-1">
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
        </div>
      </CardContent>
    </Card>
  );
};

const InsightDialog = ({ insight, isOpen, onClose, mode, onSave }: {
  insight?: any;
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'edit' | 'view';
  onSave: (data: any) => void;
}) => {
  const [formData, setFormData] = useState({
    titulo: insight?.titulo || '',
    contenido: insight?.contenido || '',
    audiencia: insight?.audiencia || 'todos'
  });

  const handleSave = () => {
    if (formData.titulo.trim() && formData.contenido.trim()) {
      onSave(formData);
      onClose();
      if (mode === 'create') {
        setFormData({ titulo: '', contenido: '', audiencia: 'todos' });
      }
    }
  };

  const isReadOnly = mode === 'view';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' && 'Crear Nuevo Insight'}
            {mode === 'edit' && 'Editar Insight'}
            {mode === 'view' && insight?.titulo}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' && 'Comparte análisis, tendencias y casos de éxito con tu audiencia'}
            {mode === 'edit' && 'Modifica la información del insight'}
            {mode === 'view' && (
              <div className="flex items-center gap-2">
                <Calendar className="h-3 w-3" />
                Publicado el {new Date(insight?.fecha_publicacion).toLocaleDateString('es-CO')}
              </div>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Título</label>
            <Input
              value={formData.titulo}
              onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
              placeholder="Título del insight..."
              disabled={isReadOnly}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Contenido</label>
            <Textarea
              value={formData.contenido}
              onChange={(e) => setFormData(prev => ({ ...prev, contenido: e.target.value }))}
              placeholder="Escribe el contenido completo del insight..."
              rows={8}
              disabled={isReadOnly}
            />
          </div>

          {!isReadOnly && (
            <div>
              <label className="text-sm font-medium">Audiencia</label>
              <Select 
                value={formData.audiencia} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, audiencia: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona la audiencia" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="admin">Solo Administradores</SelectItem>
                  <SelectItem value="ccc">CCC y Administradores</SelectItem>
                  <SelectItem value="camara_aliada">Cámaras Aliadas y CCC</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {!isReadOnly && (
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button onClick={handleSave}>
                {mode === 'create' ? 'Crear Insight' : 'Guardar Cambios'}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default function Insights() {
  const { profile } = useAuth();
  const { insights, loading, createInsight, updateInsight, deleteInsight } = useInsights();
  const { toast } = useToast();
  const [showDialog, setShowDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedInsight, setSelectedInsight] = useState(null);
  const [audienceFilter, setAudienceFilter] = useState('todos');

  if (!profile) return null;

  const isAdmin = hasPermission(profile.role, 'admin');
  
  // Filter insights based on user role and filter
  const filteredInsights = insights.filter(insight => {
    // First apply role-based filtering
    const canView = insight.audiencia === 'todos' ||
                   (insight.audiencia === 'admin' && profile.role === 'admin') ||
                   (insight.audiencia === 'ccc' && ['admin', 'ccc'].includes(profile.role)) ||
                   (insight.audiencia === 'camara_aliada' && ['admin', 'ccc', 'camara_aliada'].includes(profile.role));
    
    // Then apply audience filter
    const matchesFilter = audienceFilter === 'todos' || insight.audiencia === audienceFilter;
    
    return canView && matchesFilter;
  });

  const handleCreate = () => {
    setSelectedInsight(null);
    setDialogMode('create');
    setShowDialog(true);
  };

  const handleEdit = (insight: any) => {
    setSelectedInsight(insight);
    setDialogMode('edit');
    setShowDialog(true);
  };

  const handleView = (insight: any) => {
    setSelectedInsight(insight);
    setDialogMode('view');
    setShowDialog(true);
  };

  const handleSave = async (data: any) => {
    try {
      if (dialogMode === 'create') {
        await createInsight({
          ...data,
          autor_id: profile.id,
          fecha_publicacion: new Date().toISOString(),
          activo: true
        });
        toast({
          title: "Insight creado",
          description: "El insight ha sido publicado exitosamente.",
        });
      } else if (dialogMode === 'edit' && selectedInsight) {
        await updateInsight(selectedInsight.id, data);
        toast({
          title: "Insight actualizado",
          description: "Los cambios han sido guardados exitosamente.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar el insight. Inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (insight: any) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este insight?')) {
      try {
        await deleteInsight(insight.id);
        toast({
          title: "Insight eliminado",
          description: "El insight ha sido eliminado exitosamente.",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudo eliminar el insight. Inténtalo de nuevo.",
          variant: "destructive",
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="h-12 bg-muted animate-pulse rounded" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-64 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-primary bg-clip-text text-transparent">
            Insights & Tendencias
          </h1>
          <p className="text-muted-foreground">
            Análisis, tendencias y casos de éxito en adopción de IA
          </p>
        </div>
        {isAdmin && (
          <Button onClick={handleCreate} className="bg-gradient-primary text-white border-none hover:opacity-90">
            <Plus className="h-4 w-4 mr-2" />
            Crear Insight
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Insights</CardTitle>
            <Lightbulb className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{insights.length}</div>
            <p className="text-xs text-muted-foreground">Contenido disponible</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Visibles para ti</CardTitle>
            <Target className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{filteredInsights.length}</div>
            <p className="text-xs text-muted-foreground">Según tu rol</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Este mes</CardTitle>
            <BarChart3 className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {insights.filter(i => {
                const insightDate = new Date(i.fecha_publicacion);
                const now = new Date();
                return insightDate.getMonth() === now.getMonth() && 
                       insightDate.getFullYear() === now.getFullYear();
              }).length}
            </div>
            <p className="text-xs text-muted-foreground">Nuevos insights</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <Select value={audienceFilter} onValueChange={setAudienceFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por audiencia" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todas las audiencias</SelectItem>
            <SelectItem value="admin">Solo Administradores</SelectItem>
            <SelectItem value="ccc">CCC</SelectItem>
            <SelectItem value="camara_aliada">Cámaras Aliadas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Insights Grid */}
      {filteredInsights.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInsights.map((insight) => (
            <InsightCard
              key={insight.id}
              insight={insight}
              canEdit={isAdmin}
              onEdit={() => handleEdit(insight)}
              onDelete={() => handleDelete(insight)}
              onView={() => handleView(insight)}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Lightbulb className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay insights disponibles</h3>
            <p className="text-muted-foreground text-center">
              {isAdmin ? (
                "Comienza creando el primer insight para compartir análisis y tendencias."
              ) : (
                "Aún no hay insights publicados para tu perfil."
              )}
            </p>
            {isAdmin && (
              <Button className="mt-4" onClick={handleCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Crear Primer Insight
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      <InsightDialog
        insight={selectedInsight}
        isOpen={showDialog}
        onClose={() => setShowDialog(false)}
        mode={dialogMode}
        onSave={handleSave}
      />
    </div>
  );
}