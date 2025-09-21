import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
  Lightbulb, 
  Plus, 
  Search, 
  Calendar, 
  User, 
  Eye,
  Edit,
  Star,
  BookOpen,
} from 'lucide-react';
import { mockInsights } from '@/data/mockData';
import { useAuth, hasPermission } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const categoryColors = {
  'tendencias': 'bg-blue-100 text-blue-800 border-blue-200',
  'casos-exito': 'bg-green-100 text-green-800 border-green-200',
  'guias': 'bg-purple-100 text-purple-800 border-purple-200',
  'noticias': 'bg-orange-100 text-orange-800 border-orange-200',
};

const categoryLabels = {
  'tendencias': 'Tendencias',
  'casos-exito': 'Casos de Éxito',
  'guias': 'Guías',
  'noticias': 'Noticias',
};

export default function Insights() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('todas');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [insightData, setInsightData] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: '',
    featured: false,
  });

  if (!user) return null;

  const canEditInsights = hasPermission(user.role, 'insights_edit');

  // Filter insights
  const filteredInsights = mockInsights.filter(insight => {
    const matchesSearch = 
      insight.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      insight.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      insight.author.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'todas' || insight.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const handleAddInsight = () => {
    if (!insightData.title || !insightData.excerpt || !insightData.content || !insightData.category) {
      return;
    }

    // Mock insight save
    toast({
      title: "Insight publicado",
      description: `Se ha publicado "${insightData.title}" exitosamente`,
    });

    setIsDialogOpen(false);
    setInsightData({
      title: '',
      excerpt: '',
      content: '',
      category: '',
      featured: false,
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-primary bg-clip-text text-transparent">
            Insights
          </h1>
          <p className="text-muted-foreground">
            Contenido educativo y noticias sobre adopción de IA
          </p>
        </div>
        {canEditInsights && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Nuevo Insight
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Nuevo Insight</DialogTitle>
                <DialogDescription>
                  Crea un nuevo contenido educativo para compartir
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 max-h-[500px] overflow-y-auto">
                <div className="space-y-2">
                  <Label htmlFor="title">Título</Label>
                  <Input
                    id="title"
                    value={insightData.title}
                    onChange={(e) => setInsightData({...insightData, title: e.target.value})}
                    placeholder="Título del insight"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Categoría</Label>
                  <Select 
                    value={insightData.category} 
                    onValueChange={(value) => setInsightData({...insightData, category: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(categoryLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="excerpt">Resumen</Label>
                  <Textarea
                    id="excerpt"
                    value={insightData.excerpt}
                    onChange={(e) => setInsightData({...insightData, excerpt: e.target.value})}
                    placeholder="Breve descripción del contenido..."
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Contenido</Label>
                  <Textarea
                    id="content"
                    value={insightData.content}
                    onChange={(e) => setInsightData({...insightData, content: e.target.value})}
                    placeholder="Contenido completo del insight..."
                    rows={8}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={insightData.featured}
                    onChange={(e) => setInsightData({...insightData, featured: e.target.checked})}
                    className="rounded border border-input bg-background"
                  />
                  <Label htmlFor="featured">Marcar como destacado</Label>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleAddInsight}>
                    Publicar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar insights..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Todas las categorías" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas las categorías</SelectItem>
            {Object.entries(categoryLabels).map(([key, label]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Featured Insights */}
      {filteredInsights.some(insight => insight.featured) && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Insights Destacados
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {filteredInsights
              .filter(insight => insight.featured)
              .slice(0, 2)
              .map((insight) => (
                <Card key={insight.id} className="group hover:shadow-lg transition-shadow cursor-pointer border-primary/20 bg-primary-light">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <Badge className={`${categoryColors[insight.category as keyof typeof categoryColors]} flex items-center gap-1`}>
                          <Star className="h-3 w-3" />
                          {categoryLabels[insight.category as keyof typeof categoryLabels]}
                        </Badge>
                        <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">
                          {insight.title}
                        </CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground line-clamp-3 mb-4">
                      {insight.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          <span>{insight.author}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(insight.publishedAt).toLocaleDateString('es-CO')}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" className="gap-1 h-8">
                          <Eye className="h-3 w-3" />
                          Ver
                        </Button>
                        {canEditInsights && (
                          <Button variant="ghost" size="sm" className="gap-1 h-8">
                            <Edit className="h-3 w-3" />
                            Editar
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      )}

      {/* All Insights */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Todos los Insights
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredInsights.map((insight) => (
            <Card key={insight.id} className="group hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <Badge className={categoryColors[insight.category as keyof typeof categoryColors]}>
                      {categoryLabels[insight.category as keyof typeof categoryLabels]}
                    </Badge>
                    <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">
                      {insight.title}
                    </CardTitle>
                  </div>
                  {insight.featured && (
                    <Star className="h-4 w-4 text-yellow-500" />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground line-clamp-3 mb-4">
                  {insight.excerpt}
                </p>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <span>{insight.author}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(insight.publishedAt).toLocaleDateString('es-CO')}</span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" className="gap-1 h-8">
                      <Eye className="h-3 w-3" />
                      Ver
                    </Button>
                    {canEditInsights && (
                      <Button variant="ghost" size="sm" className="gap-1 h-8">
                        <Edit className="h-3 w-3" />
                        Editar
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {filteredInsights.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Lightbulb className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No se encontraron insights</h3>
            <p className="text-muted-foreground text-center">
              Intenta ajustar los filtros de búsqueda para encontrar el contenido que buscas.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}