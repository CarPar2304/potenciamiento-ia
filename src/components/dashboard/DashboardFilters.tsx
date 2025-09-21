import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Separator } from '@/components/ui/separator';
import { CalendarIcon, FilterIcon, X, Search } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useCamaras } from '@/hooks/useSupabaseData';

export interface DashboardFilters {
  dateRange: { from?: Date; to?: Date };
  chambers: string[];
  sectors: string[];
  companySize: string;
  aiAdoptionLevel: string;
  platziLevel: string;
  searchQuery: string;
}

interface DashboardFiltersProps {
  filters: DashboardFilters;
  onFiltersChange: (filters: DashboardFilters) => void;
  userRole: string;
  userChamber?: string;
}

export function DashboardFilters({ filters, onFiltersChange, userRole, userChamber }: DashboardFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);

  const handleFilterChange = (key: keyof DashboardFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({
      dateRange: {},
      chambers: [],
      sectors: [],
      companySize: '',
      aiAdoptionLevel: '',
      platziLevel: '',
      searchQuery: ''
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.dateRange.from || filters.dateRange.to) count++;
    if (filters.chambers.length > 0) count++;
    if (filters.sectors.length > 0) count++;
    if (filters.companySize) count++;
    if (filters.aiAdoptionLevel) count++;
    if (filters.platziLevel) count++;
    return count;
  };

  const availableChambers = userRole === 'camara_aliada' && userChamber ? [userChamber] : mockChambers;

  return (
    <Card className="p-4 mb-6">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Búsqueda Global */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar empresas, personas, NITs..."
            value={filters.searchQuery}
            onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Botón de Filtros */}
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="relative"
        >
          <FilterIcon className="w-4 h-4 mr-2" />
          Filtros
          {getActiveFiltersCount() > 0 && (
            <Badge variant="secondary" className="ml-2 px-1.5 py-0.5 text-xs">
              {getActiveFiltersCount()}
            </Badge>
          )}
        </Button>

        {getActiveFiltersCount() > 0 && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="w-4 h-4 mr-1" />
            Limpiar
          </Button>
        )}
      </div>

      {/* Panel de Filtros Expandido */}
      {showFilters && (
        <div className="mt-4 pt-4 border-t">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Rango de Fechas */}
            <div className="space-y-2">
              <Label>Rango de Fechas</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.dateRange.from ? (
                      filters.dateRange.to ? (
                        <>
                          {format(filters.dateRange.from, "dd MMM", { locale: es })} -{" "}
                          {format(filters.dateRange.to, "dd MMM yyyy", { locale: es })}
                        </>
                      ) : (
                        format(filters.dateRange.from, "dd MMM yyyy", { locale: es })
                      )
                    ) : (
                      "Seleccionar fechas"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={filters.dateRange.from}
                    selected={filters.dateRange.from && filters.dateRange.to ? { from: filters.dateRange.from, to: filters.dateRange.to } : undefined}
                    onSelect={(range) => handleFilterChange('dateRange', range || {})}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Cámaras */}
            {userRole !== 'camara_aliada' && (
              <div className="space-y-2">
                <Label>Cámaras</Label>
                <Select
                  value={filters.chambers.length === 1 ? filters.chambers[0] : ''}
                  onValueChange={(value) => handleFilterChange('chambers', value ? [value] : [])}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todas las cámaras" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todas las cámaras</SelectItem>
                    {availableChambers.map((chamber) => (
                      <SelectItem key={chamber} value={chamber}>
                        {chamber.replace('Cámara de Comercio de ', '').replace('Cámara de Comercio del ', '')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Sectores */}
            <div className="space-y-2">
              <Label>Sector</Label>
              <Select
                value={filters.sectors.length === 1 ? filters.sectors[0] : ''}
                onValueChange={(value) => handleFilterChange('sectors', value ? [value] : [])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos los sectores" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos los sectores</SelectItem>
                  {mockSectors.map((sector) => (
                    <SelectItem key={sector} value={sector}>
                      {sector}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tamaño de Empresa */}
            <div className="space-y-2">
              <Label>Tamaño de Empresa</Label>
              <Select
                value={filters.companySize}
                onValueChange={(value) => handleFilterChange('companySize', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos los tamaños" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos los tamaños</SelectItem>
                  <SelectItem value="micro">Microempresa (1-10)</SelectItem>
                  <SelectItem value="pequena">Pequeña (11-50)</SelectItem>
                  <SelectItem value="mediana">Mediana (51-200)</SelectItem>
                  <SelectItem value="grande">Grande (+200)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Nivel de Adopción IA */}
            <div className="space-y-2">
              <Label>Adopción de IA</Label>
              <Select
                value={filters.aiAdoptionLevel}
                onValueChange={(value) => handleFilterChange('aiAdoptionLevel', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos los niveles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos los niveles</SelectItem>
                  <SelectItem value="no_adopted">No adoptado</SelectItem>
                  <SelectItem value="basic">Básico</SelectItem>
                  <SelectItem value="intermediate">Intermedio</SelectItem>
                  <SelectItem value="advanced">Avanzado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Nivel Platzi */}
            <div className="space-y-2">
              <Label>Nivel Platzi</Label>
              <Select
                value={filters.platziLevel}
                onValueChange={(value) => handleFilterChange('platziLevel', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos los niveles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos los niveles</SelectItem>
                  <SelectItem value="sin_test">Sin test</SelectItem>
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

          {/* Filtros Activos */}
          {getActiveFiltersCount() > 0 && (
            <div className="mt-4 pt-4 border-t">
              <div className="flex flex-wrap gap-2">
                <span className="text-sm text-muted-foreground">Filtros activos:</span>
                {(filters.dateRange.from || filters.dateRange.to) && (
                  <Badge variant="secondary">
                    Fecha: {filters.dateRange.from && format(filters.dateRange.from, "dd/MM", { locale: es })}
                    {filters.dateRange.to && ` - ${format(filters.dateRange.to, "dd/MM/yy", { locale: es })}`}
                  </Badge>
                )}
                {filters.chambers.map((chamber) => (
                  <Badge key={chamber} variant="secondary">
                    {chamber.replace('Cámara de Comercio de ', '').replace('Cámara de Comercio del ', '')}
                  </Badge>
                ))}
                {filters.sectors.map((sector) => (
                  <Badge key={sector} variant="secondary">{sector}</Badge>
                ))}
                {filters.companySize && (
                  <Badge variant="secondary">
                    {filters.companySize === 'micro' && 'Microempresa'}
                    {filters.companySize === 'pequena' && 'Pequeña'}
                    {filters.companySize === 'mediana' && 'Mediana'}
                    {filters.companySize === 'grande' && 'Grande'}
                  </Badge>
                )}
                {filters.aiAdoptionLevel && (
                  <Badge variant="secondary">
                    IA: {filters.aiAdoptionLevel === 'no_adopted' && 'No adoptado'}
                    {filters.aiAdoptionLevel === 'basic' && 'Básico'}
                    {filters.aiAdoptionLevel === 'intermediate' && 'Intermedio'}
                    {filters.aiAdoptionLevel === 'advanced' && 'Avanzado'}
                  </Badge>
                )}
                {filters.platziLevel && (
                  <Badge variant="secondary">
                    {filters.platziLevel === 'sin_test' ? 'Sin test' : `Nivel ${filters.platziLevel}`}
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}