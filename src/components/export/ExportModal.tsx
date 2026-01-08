import { useState, useMemo, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FileSpreadsheet, Calendar, Settings, Download, Building2 } from 'lucide-react';
import { FieldSelector } from './FieldSelector';
import { DateRangeFilter } from './DateRangeFilter';
import { useToast } from '@/hooks/use-toast';
import {
  MANDATORY_FIELDS,
  MANDATORY_EMPRESA_FIELDS,
  SOLICITUD_FIELDS,
  EMPRESA_FIELDS,
  EMPRESA_EXPORT_FIELDS,
  PLATZI_FIELDS,
  exportToExcel,
  createFieldLabelsMap,
} from '@/utils/exportUtils';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any[];
  type: 'solicitudes' | 'empresas' | 'colaboradores';
  platziEmails?: Set<string>;
  platziData?: any[];
  camaras?: { id: string; nombre: string }[];
}

export const ExportModal = ({ isOpen, onClose, data, type, platziEmails, platziData, camaras = [] }: ExportModalProps) => {
  const { toast } = useToast();
  
  // Determinar campos iniciales según el tipo
  const getMandatoryFields = () => {
    if (type === 'empresas') {
      return MANDATORY_EMPRESA_FIELDS;
    }
    return MANDATORY_FIELDS;
  };

  const [selectedFields, setSelectedFields] = useState<string[]>(
    getMandatoryFields().map(f => f.key)
  );
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({ from: undefined, to: undefined });
  const [fileName, setFileName] = useState(() => {
    const typeNames = {
      solicitudes: 'Solicitudes',
      empresas: 'Empresas',
      colaboradores: 'Colaboradores',
    };
    return typeNames[type];
  });
  const [isExporting, setIsExporting] = useState(false);
  const [selectedCamara, setSelectedCamara] = useState<string>('todas');

  // Reset fields when type changes
  useEffect(() => {
    setSelectedFields(getMandatoryFields().map(f => f.key));
  }, [type]);

  // Extraer cámaras únicas de los datos si no se pasan como prop
  const availableCamaras = useMemo(() => {
    if (camaras && camaras.length > 0) {
      return camaras;
    }
    // Extraer cámaras de los datos
    const camaraMap = new Map<string, string>();
    data.forEach(item => {
      const camaraNombre = item.camaras?.nombre || item.empresas?.camaras?.nombre;
      if (camaraNombre) {
        camaraMap.set(camaraNombre, camaraNombre);
      }
    });
    return Array.from(camaraMap.keys()).map(nombre => ({ id: nombre, nombre }));
  }, [data, camaras]);

  // Filtrar datos por cámara seleccionada
  const filteredData = useMemo(() => {
    if (selectedCamara === 'todas') {
      return data;
    }
    return data.filter(item => {
      const camaraNombre = item.camaras?.nombre || item.empresas?.camaras?.nombre;
      return camaraNombre === selectedCamara;
    });
  }, [data, selectedCamara]);

  const handleFieldToggle = (fieldKey: string) => {
    // No permitir deseleccionar campos mínimos
    const mandatoryFields = getMandatoryFields();
    if (mandatoryFields.some(f => f.key === fieldKey)) {
      return;
    }

    setSelectedFields(prev =>
      prev.includes(fieldKey)
        ? prev.filter(f => f !== fieldKey)
        : [...prev, fieldKey]
    );
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const fieldLabels = createFieldLabelsMap(type);
      const result = exportToExcel(
        filteredData,
        selectedFields,
        fileName,
        fieldLabels,
        dateRange.from && dateRange.to ? { from: dateRange.from, to: dateRange.to } : undefined,
        platziEmails,
        platziData
      );

      toast({
        title: 'Exportación exitosa',
        description: `Se exportaron ${result.count} registros correctamente`,
      });

      onClose();
    } catch (error: any) {
      toast({
        title: 'Error al exportar',
        description: error.message || 'No se pudo generar el archivo',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const totalRecords = filteredData.length;
  const selectedFieldsCount = selectedFields.length;
  const mandatoryFields = getMandatoryFields();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Exportar datos
          </DialogTitle>
          <DialogDescription>
            Configura los campos y filtros para exportar los datos a Excel
          </DialogDescription>
        </DialogHeader>

        {/* Filtro de cámara siempre visible */}
        {availableCamaras.length > 0 && (
          <div className="bg-muted/30 rounded-lg p-4 space-y-2">
            <Label className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Filtrar por Cámara
            </Label>
            <Select value={selectedCamara} onValueChange={setSelectedCamara}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar cámara" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas las cámaras ({data.length} registros)</SelectItem>
                {availableCamaras.map((camara) => {
                  const count = data.filter(item => {
                    const camaraNombre = item.camaras?.nombre || item.empresas?.camaras?.nombre;
                    return camaraNombre === camara.nombre;
                  }).length;
                  return (
                    <SelectItem key={camara.id || camara.nombre} value={camara.nombre}>
                      {camara.nombre} ({count} registros)
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            {selectedCamara !== 'todas' && (
              <p className="text-sm text-primary font-medium">
                Se exportarán {totalRecords} registros de "{selectedCamara}"
              </p>
            )}
          </div>
        )}

        <Tabs defaultValue="fields" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="fields" className="flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              <span className="hidden sm:inline">Campos</span>
            </TabsTrigger>
            <TabsTrigger value="dates" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Fechas</span>
            </TabsTrigger>
            <TabsTrigger value="format" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Formato</span>
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto mt-4">
            <TabsContent value="fields" className="space-y-6 mt-0">
              {/* Campos mínimos */}
              <FieldSelector
                fields={mandatoryFields}
                selectedFields={selectedFields}
                onFieldToggle={handleFieldToggle}
                disabled={true}
                title="Campos mínimos (obligatorios)"
                description="Estos campos siempre se incluyen en la exportación"
              />

              {/* Campos adicionales según tipo */}
              {type === 'empresas' ? (
                <FieldSelector
                  fields={EMPRESA_EXPORT_FIELDS}
                  selectedFields={selectedFields}
                  onFieldToggle={handleFieldToggle}
                  title="Campos adicionales - Empresas"
                  description="Selecciona campos adicionales de información de empresas"
                />
              ) : (
                <>
                  {/* Campos de solicitud */}
                  <FieldSelector
                    fields={SOLICITUD_FIELDS}
                    selectedFields={selectedFields}
                    onFieldToggle={handleFieldToggle}
                    title="Campos adicionales - Solicitudes"
                    description="Selecciona campos adicionales de información de solicitudes"
                  />

                  {/* Campos de empresa */}
                  <FieldSelector
                    fields={EMPRESA_FIELDS}
                    selectedFields={selectedFields}
                    onFieldToggle={handleFieldToggle}
                    title="Campos adicionales - Empresas"
                    description="Selecciona campos adicionales de información de empresas"
                  />

                  {/* Campos de Platzi */}
                  <FieldSelector
                    fields={PLATZI_FIELDS}
                    selectedFields={selectedFields}
                    onFieldToggle={handleFieldToggle}
                    title="Campos adicionales - Platzi"
                    description="Selecciona campos de progreso y cursos en Platzi"
                  />
                </>
              )}

              <div className="bg-muted/30 rounded-lg p-3 text-sm">
                <p className="text-muted-foreground">
                  <span className="font-semibold text-foreground">{selectedFieldsCount}</span> campos seleccionados
                </p>
              </div>
            </TabsContent>

            <TabsContent value="dates" className="space-y-4 mt-0">
              <DateRangeFilter
                dateRange={dateRange}
                onDateRangeChange={setDateRange}
              />

              <div className="bg-muted/30 rounded-lg p-4 text-sm space-y-2">
                <p className="text-muted-foreground">
                  <span className="font-semibold text-foreground">{totalRecords}</span> registros a exportar
                </p>
                {dateRange.from && dateRange.to && (
                  <p className="text-xs text-muted-foreground">
                    El filtro se aplicará durante la exportación
                  </p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="format" className="space-y-6 mt-0">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fileName">Nombre del archivo</Label>
                  <Input
                    id="fileName"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    placeholder="Nombre del archivo"
                  />
                  <p className="text-xs text-muted-foreground">
                    Se añadirá automáticamente la fecha y hora actual
                  </p>
                </div>

                <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Formato:</span>
                    <span className="font-semibold">Excel (.xlsx)</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Cámara:</span>
                    <span className="font-semibold">{selectedCamara === 'todas' ? 'Todas' : selectedCamara}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Campos seleccionados:</span>
                    <span className="font-semibold">{selectedFieldsCount}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Registros a exportar:</span>
                    <span className="font-semibold">{totalRecords}</span>
                  </div>
                </div>

                <Button
                  onClick={handleExport}
                  disabled={isExporting || !fileName.trim() || totalRecords === 0}
                  className="w-full"
                  size="lg"
                >
                  {isExporting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 mr-2 border-b-2 border-white" />
                      Exportando...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Exportar a Excel ({totalRecords} registros)
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};