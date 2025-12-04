import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2, Loader2, Download, Building2, Info } from 'lucide-react';
import * as XLSX from 'xlsx';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';

interface BulkUploadEmpresasDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  camaras: Array<{ id: string; nombre: string; nit: string }>;
}

interface ExcelRow {
  nombre?: string;
  nit?: string;
  camara_id?: string;
}

interface AnalysisResult {
  total: number;
  duplicates: number;
  toInsert: number;
  duplicateNits: string[];
  previewData: ExcelRow[];
}

export function BulkUploadEmpresasDialog({ isOpen, onClose, onSuccess, camaras }: BulkUploadEmpresasDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [showCamarasHelp, setShowCamarasHelp] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setAnalysis(null);
    }
  };

  const analyzeFile = async () => {
    if (!file) return;

    setAnalyzing(true);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Obtener los headers del archivo
      const rawData = XLSX.utils.sheet_to_json<unknown[]>(worksheet, { header: 1 });
      const firstRow = rawData[0] as unknown[] || [];
      const headers = firstRow.map(h => String(h || '').toLowerCase().trim());
      
      // Validar columnas requeridas
      const requiredColumns = ['nombre', 'nit'];
      const missingColumns = requiredColumns.filter(col => !headers.includes(col));
      
      if (missingColumns.length > 0) {
        toast({
          title: "Columnas faltantes",
          description: `El archivo debe tener las columnas: ${missingColumns.join(', ')}. Columnas encontradas: ${headers.join(', ') || 'ninguna'}`,
          variant: "destructive"
        });
        setAnalyzing(false);
        return;
      }

      const jsonData = XLSX.utils.sheet_to_json<ExcelRow>(worksheet);
      
      if (jsonData.length === 0) {
        toast({
          title: "Archivo vacío",
          description: "El archivo no contiene datos para cargar",
          variant: "destructive"
        });
        setAnalyzing(false);
        return;
      }

      // Extraer todos los NITs del Excel
      const excelNits = jsonData
        .map(row => String(row.nit || '').trim())
        .filter(nit => nit);

      // Verificar duplicados en la base de datos
      const { data: existingNits, error } = await supabase
        .from('empresas')
        .select('nit')
        .in('nit', excelNits);

      if (error) throw error;

      const existingNitSet = new Set(
        existingNits?.map(e => e.nit) || []
      );

      const duplicateNits = excelNits.filter(nit => 
        nit && existingNitSet.has(nit)
      );

      // Obtener los primeros 5 registros para preview
      const previewData = jsonData.slice(0, 5);

      setAnalysis({
        total: jsonData.length,
        duplicates: duplicateNits.length,
        toInsert: jsonData.length - duplicateNits.length,
        duplicateNits: [...new Set(duplicateNits)],
        previewData
      });

      toast({
        title: "Análisis completado",
        description: `${jsonData.length - duplicateNits.length} empresas nuevas listas para cargar`,
      });
    } catch (error) {
      console.error('Error analyzing file:', error);
      toast({
        title: "Error al analizar archivo",
        description: "Verifica que el archivo sea un Excel válido (.xlsx o .xls)",
        variant: "destructive"
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleUpload = async () => {
    if (!file || !analysis) return;

    setLoading(true);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json<ExcelRow>(worksheet);

      // Obtener NITs existentes
      const excelNits = jsonData
        .map(row => row.nit?.trim())
        .filter(nit => nit);

      const { data: existingNits } = await supabase
        .from('empresas')
        .select('nit')
        .in('nit', excelNits);

      const existingNitSet = new Set(
        existingNits?.map(e => e.nit) || []
      );

      // Obtener usuario actual
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      // Crear registro de carga masiva
      const { data: cargaData, error: cargaError } = await supabase
        .from('cargas_masivas')
        .insert({
          tipo: 'empresas',
          nombre_archivo: file.name,
          registros_totales: analysis.total,
          registros_insertados: analysis.toInsert,
          registros_duplicados: analysis.duplicates,
          usuario_id: user.id
        })
        .select('id')
        .single();

      if (cargaError) throw cargaError;

      // Filtrar solo los que no existen
      const recordsToInsert = jsonData
        .filter(row => {
          const nit = row.nit?.trim();
          return nit && !existingNitSet.has(nit);
        })
        .map(row => ({
          nombre: row.nombre?.trim() || '',
          nit: row.nit?.trim() || '',
          camara_id: row.camara_id?.trim() || null,
          carga_masiva_id: cargaData.id, // Asociar con la carga
        }));

      if (recordsToInsert.length === 0) {
        // Eliminar el registro de carga si no hay registros
        await supabase.from('cargas_masivas').delete().eq('id', cargaData.id);
        toast({
          title: "Sin registros para cargar",
          description: "Todos los NITs ya existen en la base de datos",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from('empresas')
        .insert(recordsToInsert);

      if (error) throw error;

      toast({
        title: "Carga exitosa",
        description: `${recordsToInsert.length} empresas cargadas correctamente`,
      });

      onSuccess();
      handleClose();
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Error al cargar archivo",
        description: "Ocurrió un error al procesar los datos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setAnalysis(null);
    setLoading(false);
    setAnalyzing(false);
    setShowCamarasHelp(false);
    onClose();
  };

  const handleDownloadTemplate = () => {
    // Crear datos de ejemplo para la plantilla
    const templateData = [
      {
        nombre: 'Ejemplo Empresa S.A.S.',
        nit: '900123456',
        camara_id: camaras[0]?.id || 'UUID-de-camara-aqui'
      },
      {
        nombre: 'Otra Empresa Ltda.',
        nit: '900654321',
        camara_id: camaras[1]?.id || 'UUID-de-camara-aqui'
      }
    ];

    // Crear libro de trabajo
    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Empresas');

    // Ajustar ancho de columnas
    const columnWidths = [
      { wch: 35 }, // nombre
      { wch: 15 }, // nit
      { wch: 40 }  // camara_id
    ];
    worksheet['!cols'] = columnWidths;

    // Descargar archivo
    XLSX.writeFile(workbook, 'plantilla_empresas.xlsx');

    toast({
      title: "Plantilla descargada",
      description: "Usa este archivo como referencia para cargar tus datos",
    });
  };

  const handleCopyCamaraId = (id: string) => {
    navigator.clipboard.writeText(id);
    toast({
      title: "ID copiado",
      description: "El ID de la cámara se copió al portapapeles",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Carga Masiva de Empresas
          </DialogTitle>
          <DialogDescription>
            Sube un archivo Excel (.xlsx) con las columnas: nombre, nit, camara_id
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {/* Ayuda de IDs de cámaras */}
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-sm mb-2">IDs de Cámaras Disponibles</h4>
                  <p className="text-xs text-muted-foreground mb-3">
                    Usa estos IDs en la columna camara_id de tu archivo Excel. Haz clic para copiar.
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCamarasHelp(!showCamarasHelp)}
                    className="mb-2"
                  >
                    {showCamarasHelp ? 'Ocultar IDs' : 'Mostrar IDs de Cámaras'}
                  </Button>
                  {showCamarasHelp && (
                    <div className="space-y-2 mt-3 max-h-48 overflow-y-auto">
                      {camaras.map((camara) => (
                        <div 
                          key={camara.id}
                          className="flex items-center justify-between gap-2 p-2 bg-background rounded border border-border hover:border-primary/50 transition-colors cursor-pointer"
                          onClick={() => handleCopyCamaraId(camara.id)}
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{camara.nombre}</p>
                            <p className="text-xs text-muted-foreground">NIT: {camara.nit}</p>
                          </div>
                          <div className="flex-shrink-0">
                            <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                              {camara.id.substring(0, 8)}...
                            </code>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sección de plantilla */}
          <div className="bg-muted/50 border border-border rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <Download className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-sm mb-1">¿Primera vez cargando datos?</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Descarga nuestra plantilla con ejemplos y las columnas correctas
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadTemplate}
                  disabled={loading || analyzing}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Descargar plantilla Excel
                </Button>
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="file-upload">Archivo Excel</Label>
            <div className="mt-2">
              <Input
                id="file-upload"
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                disabled={loading || analyzing}
              />
            </div>
          </div>

          {file && !analysis && (
            <Button
              onClick={analyzeFile}
              disabled={analyzing}
              className="w-full"
            >
              {analyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analizando archivo...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Analizar archivo
                </>
              )}
            </Button>
          )}

          {analysis && (
            <>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2 mt-2">
                    <p><strong>Total de registros en el archivo:</strong> {analysis.total}</p>
                    <p><strong>Registros duplicados (ya existen):</strong> {analysis.duplicates}</p>
                    <p className="text-green-600 font-semibold">
                      <CheckCircle2 className="inline h-4 w-4 mr-1" />
                      Registros que se cargarán: {analysis.toInsert}
                    </p>
                  </div>
                </AlertDescription>
              </Alert>

              {analysis.duplicateNits.length > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <p className="font-semibold mb-2">NITs duplicados (no se cargarán):</p>
                    <div className="max-h-32 overflow-y-auto text-sm">
                      <ul className="list-disc list-inside">
                        {analysis.duplicateNits.slice(0, 10).map((nit, index) => (
                          <li key={index}>{nit}</li>
                        ))}
                        {analysis.duplicateNits.length > 10 && (
                          <li>... y {analysis.duplicateNits.length - 10} más</li>
                        )}
                      </ul>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {/* Preview de datos */}
              <div className="border border-border rounded-lg overflow-hidden">
                <div className="bg-muted px-4 py-2 border-b border-border">
                  <h4 className="font-medium text-sm flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4 text-primary" />
                    Vista previa (primeros 5 registros)
                  </h4>
                </div>
                <div className="overflow-x-auto max-w-full">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-3 py-2 text-left font-medium text-muted-foreground whitespace-nowrap">Nombre</th>
                        <th className="px-3 py-2 text-left font-medium text-muted-foreground whitespace-nowrap">NIT</th>
                        <th className="px-3 py-2 text-left font-medium text-muted-foreground whitespace-nowrap">Cámara ID</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {analysis.previewData.map((row, index) => {
                        const camara = camaras.find(c => c.id === row.camara_id);
                        return (
                          <tr key={index} className="hover:bg-muted/30">
                            <td className="px-3 py-2 text-xs max-w-[250px] truncate">{row.nombre || '-'}</td>
                            <td className="px-3 py-2 whitespace-nowrap text-xs">{row.nit || '-'}</td>
                            <td className="px-3 py-2 text-xs">
                              {row.camara_id ? (
                                <div className="flex flex-col gap-1">
                                  <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                                    {row.camara_id.substring(0, 12)}...
                                  </code>
                                  {camara && (
                                    <span className="text-xs text-muted-foreground">
                                      {camara.nombre}
                                    </span>
                                  )}
                                </div>
                              ) : (
                                '-'
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {analysis.total > 5 && (
                  <div className="bg-muted/30 px-4 py-2 text-xs text-muted-foreground text-center border-t border-border">
                    Mostrando 5 de {analysis.total} registros totales
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {analysis && (
          <div className="flex gap-2 pt-4 border-t border-border flex-shrink-0">
            <Button
              onClick={handleUpload}
              disabled={loading || analysis.toInsert === 0}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cargando...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Cargar {analysis.toInsert} empresas
                </>
              )}
            </Button>
            <Button variant="outline" onClick={handleClose} disabled={loading}>
              Cancelar
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
