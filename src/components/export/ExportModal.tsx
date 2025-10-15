import { useState } from 'react';
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
import { FileSpreadsheet, Calendar, Settings, Download } from 'lucide-react';
import { FieldSelector } from './FieldSelector';
import { DateRangeFilter } from './DateRangeFilter';
import { useToast } from '@/hooks/use-toast';
import {
  MANDATORY_FIELDS,
  SOLICITUD_FIELDS,
  EMPRESA_FIELDS,
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
}

export const ExportModal = ({ isOpen, onClose, data, type, platziEmails, platziData }: ExportModalProps) => {
  const { toast } = useToast();
  const [selectedFields, setSelectedFields] = useState<string[]>(
    MANDATORY_FIELDS.map(f => f.key)
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

  const handleFieldToggle = (fieldKey: string) => {
    // No permitir deseleccionar campos mínimos
    if (MANDATORY_FIELDS.some(f => f.key === fieldKey)) {
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
      const fieldLabels = createFieldLabelsMap();
      const result = exportToExcel(
        data,
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

  const totalRecords = data.length;
  const selectedFieldsCount = selectedFields.length;

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
                fields={MANDATORY_FIELDS}
                selectedFields={selectedFields}
                onFieldToggle={handleFieldToggle}
                disabled={true}
                title="Campos mínimos (obligatorios)"
                description="Estos campos siempre se incluyen en la exportación"
              />

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
                  <span className="font-semibold text-foreground">{totalRecords}</span> registros totales
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
                    <span className="text-muted-foreground">Campos seleccionados:</span>
                    <span className="font-semibold">{selectedFieldsCount}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Registros totales:</span>
                    <span className="font-semibold">{totalRecords}</span>
                  </div>
                </div>

                <Button
                  onClick={handleExport}
                  disabled={isExporting || !fileName.trim()}
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
                      Exportar a Excel
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
