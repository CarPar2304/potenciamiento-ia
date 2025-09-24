import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
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
  Calendar, 
  Edit, 
  Trash2,
  Eye,
  Lightbulb,
  TrendingUp,
  Users,
  Target,
  BarChart3,
  Globe,
  Building,
  Shield,
  Heart,
  Star,
  Zap,
  Rocket,
  Award,
  Briefcase,
  Camera,
  Compass,
  Coffee,
  Book,
  Bookmark
} from 'lucide-react';
import { useInsights, useCamaras } from '@/hooks/useSupabaseData';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const AVAILABLE_ICONS = [
  { name: 'Lightbulb', component: Lightbulb },
  { name: 'TrendingUp', component: TrendingUp },
  { name: 'Users', component: Users },
  { name: 'Target', component: Target },
  { name: 'BarChart3', component: BarChart3 },
  { name: 'Globe', component: Globe },
  { name: 'Building', component: Building },
  { name: 'Shield', component: Shield },
  { name: 'Heart', component: Heart },
  { name: 'Star', component: Star },
  { name: 'Zap', component: Zap },
  { name: 'Rocket', component: Rocket },
  { name: 'Award', component: Award },
  { name: 'Briefcase', component: Briefcase },
  { name: 'Camera', component: Camera },
  { name: 'Compass', component: Compass },
  { name: 'Coffee', component: Coffee },
  { name: 'Book', component: Book },
  { name: 'Bookmark', component: Bookmark },
];

const COLOR_OPTIONS = [
  '#8B5CF6', // Purple (default)
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#EF4444', // Red
  '#EC4899', // Pink
  '#6366F1', // Indigo
  '#8B5A2B', // Brown
  '#6B7280', // Gray
];

const InsightCard = ({ insight, canEdit, onEdit, onDelete, onView }: {
  insight: any;
  canEdit: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onView: () => void;
}) => {
  const getIcon = (iconName?: string) => {
    const icon = AVAILABLE_ICONS.find(i => i.name === iconName);
    return icon ? icon.component : Lightbulb;
  };

  const IconComponent = getIcon(insight.icono);
  const cardColor = insight.color || '#8B5CF6';

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 relative overflow-hidden h-full flex flex-col">
      {/* Color accent bar */}
      <div 
        className="absolute top-0 left-0 right-0 h-1"
        style={{ backgroundColor: cardColor }}
      />
      
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div 
              className="p-2 rounded-lg flex-shrink-0 mt-0.5"
              style={{ backgroundColor: `${cardColor}15`, color: cardColor }}
            >
              <IconComponent className="h-5 w-5" />
            </div>
            <div className="space-y-1 flex-1 min-w-0">
              <CardTitle 
                className="text-lg font-semibold leading-tight group-hover:text-primary transition-colors"
                title={insight.titulo}
              >
                <div className="break-words line-clamp-2">
                  {insight.titulo}
                </div>
              </CardTitle>
              <CardDescription className="flex items-center gap-2 text-xs">
                <Calendar className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">
                  {new Date(insight.fecha_publicacion).toLocaleDateString('es-CO', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </span>
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col">
        <div className="flex-1">
          <p className="text-muted-foreground mb-4 line-clamp-4 text-sm leading-relaxed break-words">
            {insight.contenido}
          </p>
          
          {/* Audience badge */}
          {insight.audiencia === 'camara_aliada' && insight.camaras_especificas?.length > 0 && (
            <Badge variant="outline" className="mb-3 text-xs">
              <Users className="h-3 w-3 mr-1" />
              {insight.camaras_especificas.length} cámara{insight.camaras_especificas.length !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center justify-between pt-2 mt-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={onView}
            style={{ color: cardColor }}
            className="hover:bg-background/80 text-xs px-2"
          >
            <Eye className="h-3 w-3 mr-1" />
            Ver completo
          </Button>
          {canEdit && (
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={onEdit}
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-1"
                title="Editar insight"
              >
                <Edit className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onDelete}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1"
                title="Eliminar insight"
              >
                <Trash2 className="h-3 w-3" />
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
  const { camaras } = useCamaras();
  const [formData, setFormData] = useState({
    titulo: insight?.titulo || '',
    contenido: insight?.contenido || '',
    audiencia: insight?.audiencia || 'todos',
    icono: insight?.icono || 'Lightbulb',
    color: insight?.color || '#8B5CF6',
    camaras_especificas: insight?.camaras_especificas || []
  });

  useEffect(() => {
    if (insight) {
      setFormData({
        titulo: insight.titulo || '',
        contenido: insight.contenido || '',
        audiencia: insight.audiencia || 'todos',
        icono: insight.icono || 'Lightbulb',
        color: insight.color || '#8B5CF6',
        camaras_especificas: insight.camaras_especificas || []
      });
    }
  }, [insight]);

  const handleSave = () => {
    if (formData.titulo.trim() && formData.contenido.trim()) {
      onSave(formData);
      onClose();
      if (mode === 'create') {
        setFormData({ 
          titulo: '', 
          contenido: '', 
          audiencia: 'todos',
          icono: 'Lightbulb',
          color: '#8B5CF6',
          camaras_especificas: []
        });
      }
    }
  };

  const handleCamaraToggle = (camaraId: string) => {
    setFormData(prev => ({
      ...prev,
      camaras_especificas: prev.camaras_especificas.includes(camaraId)
        ? prev.camaras_especificas.filter(id => id !== camaraId)
        : [...prev.camaras_especificas, camaraId]
    }));
  };

  const getSelectedIcon = () => {
    const icon = AVAILABLE_ICONS.find(i => i.name === formData.icono);
    return icon ? icon.component : Lightbulb;
  };

  const SelectedIcon = getSelectedIcon();
  const isReadOnly = mode === 'view';
  const showCamaraSelection = formData.audiencia === 'camara_aliada' && !isReadOnly;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {!isReadOnly && (
              <div 
                className="p-2 rounded-lg"
                style={{ backgroundColor: `${formData.color}15`, color: formData.color }}
              >
                <SelectedIcon className="h-5 w-5" />
              </div>
            )}
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left column - Form */}
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
                rows={6}
                disabled={isReadOnly}
              />
            </div>

            {!isReadOnly && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Ícono</label>
                    <Select 
                      value={formData.icono} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, icono: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {AVAILABLE_ICONS.map((icon) => {
                          const IconComp = icon.component;
                          return (
                            <SelectItem key={icon.name} value={icon.name}>
                              <div className="flex items-center gap-2">
                                <IconComp className="h-4 w-4" />
                                {icon.name}
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Color</label>
                    <div className="flex gap-2 mt-1">
                      {COLOR_OPTIONS.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, color }))}
                          className={`w-8 h-8 rounded-full border-2 transition-all ${
                            formData.color === color ? 'border-foreground' : 'border-muted'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Audiencia</label>
                  <Select 
                    value={formData.audiencia} 
                    onValueChange={(value) => setFormData(prev => ({ 
                      ...prev, 
                      audiencia: value,
                      camaras_especificas: value === 'camara_aliada' ? prev.camaras_especificas : []
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona la audiencia" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">General</SelectItem>
                      <SelectItem value="camara_aliada">Cámaras Aliadas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {showCamaraSelection && (
                  <div>
                    <label className="text-sm font-medium">Cámaras específicas (opcional)</label>
                    <p className="text-xs text-muted-foreground mb-2">
                      Si no seleccionas ninguna, se mostrará a todas las cámaras aliadas
                    </p>
                    <div className="space-y-2 max-h-32 overflow-y-auto border rounded-md p-2">
                      {camaras.map((camara) => (
                        <div key={camara.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={camara.id}
                            checked={formData.camaras_especificas.includes(camara.id)}
                            onCheckedChange={() => handleCamaraToggle(camara.id)}
                          />
                          <label htmlFor={camara.id} className="text-sm">
                            {camara.nombre}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Right column - Preview */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Vista previa</label>
              <Card className="mt-2">
                <div 
                  className="h-1"
                  style={{ backgroundColor: formData.color }}
                />
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div 
                      className="p-2 rounded-lg"
                      style={{ backgroundColor: `${formData.color}15`, color: formData.color }}
                    >
                      <SelectedIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base">
                        {formData.titulo || 'Título del insight'}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Hoy
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {formData.contenido || 'El contenido aparecerá aquí...'}
                  </p>
                </CardContent>
              </Card>
            </div>

            {formData.audiencia === 'camara_aliada' && formData.camaras_especificas.length > 0 && (
              <div>
                <label className="text-sm font-medium">Cámaras seleccionadas</label>
                <div className="mt-1 space-y-1">
                  {formData.camaras_especificas.map(camaraId => {
                    const camara = camaras.find(c => c.id === camaraId);
                    return (
                      <Badge key={camaraId} variant="secondary">
                        {camara?.nombre}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {!isReadOnly && (
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSave}
              style={{ backgroundColor: formData.color }}
              className="text-white hover:opacity-90"
            >
              {mode === 'create' ? 'Publicar Insight' : 'Guardar Cambios'}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default function Insights() {
  const { profile } = useAuth();
  const { insights, loading, createInsight, updateInsight, deleteInsight } = useInsights();
  const { camaras } = useCamaras();
  const { toast } = useToast();
  const [showDialog, setShowDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedInsight, setSelectedInsight] = useState(null);
  const [audienceFilter, setAudienceFilter] = useState('todos');
  const [selectedCamara, setSelectedCamara] = useState('todas');

  if (!profile) return null;

  const isAdmin = profile.role === 'admin';
  const isCCC = profile.role === 'ccc' || isAdmin;
  const canCreate = isAdmin; // Only admin can create/edit/delete

  // Filter insights based on user role and filters
  const filteredInsights = insights.filter(insight => {
    // Role-based filtering (RLS handles this but we add UI logic)
    let canView = false;
    
    if (isAdmin) {
      canView = true; // Admin sees everything
    } else if (profile.role === 'ccc') {
      canView = true; // CCC sees everything but can't edit
    } else if (profile.role === 'camara_aliada') {
      // Allied chambers see general + content for their chamber
      canView = insight.audiencia === 'todos' || 
               (insight.audiencia === 'camara_aliada' && 
                (!insight.camaras_especificas?.length || 
                 insight.camaras_especificas.includes(profile.camara_id)));
    }

    // Apply UI filters (only for admin/CCC)
    if (!canView) return false;

    if (audienceFilter !== 'todos') {
      if (audienceFilter === 'general') {
        return insight.audiencia === 'todos';
      } else if (audienceFilter === 'camara_aliada') {
        if (selectedCamara === 'todas') {
          return insight.audiencia === 'camara_aliada';
        } else {
          return insight.audiencia === 'camara_aliada' && 
                 (!insight.camaras_especificas?.length || 
                  insight.camaras_especificas.includes(selectedCamara));
        }
      }
    }

    return true;
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
          title: "Insight publicado",
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
        {canCreate && (
          <Button onClick={handleCreate} className="bg-gradient-primary text-white border-none hover:opacity-90">
            <Plus className="h-4 w-4 mr-2" />
            Publicar Insight
          </Button>
        )}
      </div>

      {/* Filters - Only for Admin and CCC */}
      {isCCC && (
        <div className="flex gap-4">
          <Select value={audienceFilter} onValueChange={setAudienceFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrar por audiencia" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todas las audiencias</SelectItem>
              <SelectItem value="general">General</SelectItem>
              <SelectItem value="camara_aliada">Cámaras Aliadas</SelectItem>
            </SelectContent>
          </Select>

          {audienceFilter === 'camara_aliada' && (
            <Select value={selectedCamara} onValueChange={setSelectedCamara}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Seleccionar cámara" />
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
          )}
        </div>
      )}

      {/* Insights Grid */}
      {filteredInsights.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInsights.map((insight) => (
            <InsightCard
              key={insight.id}
              insight={insight}
              canEdit={canCreate}
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
              {canCreate ? (
                "Comienza publicando el primer insight para compartir análisis y tendencias."
              ) : (
                "Aún no hay insights publicados para tu perfil."
              )}
            </p>
            {canCreate && (
              <Button className="mt-4" onClick={handleCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Publicar Primer Insight
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