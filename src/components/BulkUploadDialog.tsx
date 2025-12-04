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
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2, Loader2, Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface BulkUploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface ExcelRow {
  fecha_solicitud?: string | number;
  nombre_apellidos?: string;
  email?: string;
  estado?: string;
  nit_empresa?: string;
  es_colaborador?: string | boolean;
}

// Función para convertir número serial de Excel a fecha ISO
const excelSerialToDate = (serial: number | string): string => {
  if (typeof serial === 'string') {
    // Si ya es una cadena de fecha válida, devolverla
    const parsed = new Date(serial);
    if (!isNaN(parsed.getTime())) {
      return parsed.toISOString();
    }
    // Si es un número como string, convertirlo
    const num = parseFloat(serial);
    if (!isNaN(num) && num > 10000) {
      // Es un número serial de Excel
      const utcDays = Math.floor(num - 25569);
      const utcValue = utcDays * 86400 * 1000;
      return new Date(utcValue).toISOString();
    }
    return new Date().toISOString();
  }
  if (typeof serial === 'number' && serial > 10000) {
    // Número serial de Excel: días desde el 30 de diciembre de 1899
    const utcDays = Math.floor(serial - 25569);
    const utcValue = utcDays * 86400 * 1000;
    return new Date(utcValue).toISOString();
  }
  return new Date().toISOString();
};

interface AnalysisResult {
  total: number;
  duplicates: number;
  toInsert: number;
  duplicateEmails: string[];
  previewData: ExcelRow[];
}

export function BulkUploadDialog({ isOpen, onClose, onSuccess }: BulkUploadDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
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
      const jsonData = XLSX.utils.sheet_to_json<ExcelRow>(worksheet);

      // Extraer todos los emails del Excel
      const excelEmails = jsonData
        .map(row => row.email?.trim().toLowerCase())
        .filter(email => email);

      // Verificar duplicados en la base de datos
      const { data: existingEmails, error } = await supabase
        .from('solicitudes')
        .select('email')
        .in('email', excelEmails);

      if (error) throw error;

      const existingEmailSet = new Set(
        existingEmails?.map(e => e.email.toLowerCase()) || []
      );

      const duplicateEmails = excelEmails.filter(email => 
        email && existingEmailSet.has(email)
      );

      // Obtener los primeros 5 registros para preview
      const previewData = jsonData.slice(0, 5);

      setAnalysis({
        total: jsonData.length,
        duplicates: duplicateEmails.length,
        toInsert: jsonData.length - duplicateEmails.length,
        duplicateEmails: [...new Set(duplicateEmails)],
        previewData
      });

      toast({
        title: "Análisis completado",
        description: `${jsonData.length - duplicateEmails.length} registros nuevos listos para cargar`,
      });
    } catch (error) {
      console.error('Error analyzing file:', error);
      toast({
        title: "Error al analizar archivo",
        description: "Verifica que el archivo tenga el formato correcto",
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

      // Obtener emails existentes
      const excelEmails = jsonData
        .map(row => row.email?.trim().toLowerCase())
        .filter(email => email);

      const { data: existingEmails } = await supabase
        .from('solicitudes')
        .select('email')
        .in('email', excelEmails);

      const existingEmailSet = new Set(
        existingEmails?.map(e => e.email.toLowerCase()) || []
      );

      // Obtener usuario actual
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      // Crear registro de carga masiva
      const { data: cargaData, error: cargaError } = await supabase
        .from('cargas_masivas')
        .insert({
          tipo: 'solicitudes',
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
          const email = row.email?.trim().toLowerCase();
          return email && !existingEmailSet.has(email);
        })
        .map(row => {
          // Convertir es_colaborador a boolean
          let esColaborador = false;
          if (typeof row.es_colaborador === 'string') {
            esColaborador = row.es_colaborador.toLowerCase() === 'true' || 
                           row.es_colaborador.toLowerCase() === 'sí' ||
                           row.es_colaborador.toLowerCase() === 'si' ||
                           row.es_colaborador === '1';
          } else if (typeof row.es_colaborador === 'boolean') {
            esColaborador = row.es_colaborador;
          }

          return {
            nombres_apellidos: row.nombre_apellidos || '',
            email: row.email?.trim() || '',
            nit_empresa: row.nit_empresa || '',
            es_colaborador: esColaborador,
            estado: row.estado as any || 'Pendiente',
            fecha_solicitud: row.fecha_solicitud ? excelSerialToDate(row.fecha_solicitud) : new Date().toISOString(),
            numero_documento: '', // Campo requerido pero no está en el Excel
            carga_masiva_id: cargaData.id, // Asociar con la carga
          };
        });

      if (recordsToInsert.length === 0) {
        // Eliminar el registro de carga si no hay registros
        await supabase.from('cargas_masivas').delete().eq('id', cargaData.id);
        toast({
          title: "Sin registros para cargar",
          description: "Todos los emails ya existen en la base de datos",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from('solicitudes')
        .insert(recordsToInsert);

      if (error) throw error;

      toast({
        title: "Carga exitosa",
        description: `${recordsToInsert.length} solicitudes cargadas correctamente`,
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
    onClose();
  };

  const handleDownloadTemplate = () => {
    // Crear datos de ejemplo para la plantilla
    const templateData = [
      {
        fecha_solicitud: '2024-01-15',
        nombre_apellidos: 'Juan Pérez García',
        email: 'juan.perez@ejemplo.com',
        estado: 'Pendiente',
        nit_empresa: '900123456',
        es_colaborador: 'false'
      },
      {
        fecha_solicitud: '2024-01-16',
        nombre_apellidos: 'María López Rodríguez',
        email: 'maria.lopez@ejemplo.com',
        estado: 'Aprobada',
        nit_empresa: '900654321',
        es_colaborador: 'true'
      }
    ];

    // Crear libro de trabajo
    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Solicitudes');

    // Ajustar ancho de columnas
    const columnWidths = [
      { wch: 15 }, // fecha_solicitud
      { wch: 30 }, // nombre_apellidos
      { wch: 30 }, // email
      { wch: 12 }, // estado
      { wch: 15 }, // nit_empresa
      { wch: 15 }  // es_colaborador
    ];
    worksheet['!cols'] = columnWidths;

    // Descargar archivo
    XLSX.writeFile(workbook, 'plantilla_solicitudes.xlsx');

    toast({
      title: "Plantilla descargada",
      description: "Usa este archivo como referencia para cargar tus datos",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-primary" />
            Carga Masiva de Solicitudes
          </DialogTitle>
          <DialogDescription>
            Sube un archivo Excel (.xlsx) con las columnas: fecha_solicitud, nombre_apellidos, email, estado, nit_empresa, es_colaborador
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
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

              {analysis.duplicateEmails.length > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <p className="font-semibold mb-2">Emails duplicados (no se cargarán):</p>
                    <div className="max-h-32 overflow-y-auto text-sm">
                      <ul className="list-disc list-inside">
                        {analysis.duplicateEmails.slice(0, 10).map((email, index) => (
                          <li key={index}>{email}</li>
                        ))}
                        {analysis.duplicateEmails.length > 10 && (
                          <li>... y {analysis.duplicateEmails.length - 10} más</li>
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
                        <th className="px-3 py-2 text-left font-medium text-muted-foreground whitespace-nowrap">Fecha</th>
                        <th className="px-3 py-2 text-left font-medium text-muted-foreground whitespace-nowrap">Nombre</th>
                        <th className="px-3 py-2 text-left font-medium text-muted-foreground whitespace-nowrap">Email</th>
                        <th className="px-3 py-2 text-left font-medium text-muted-foreground whitespace-nowrap">Estado</th>
                        <th className="px-3 py-2 text-left font-medium text-muted-foreground whitespace-nowrap">NIT</th>
                        <th className="px-3 py-2 text-left font-medium text-muted-foreground whitespace-nowrap">Colaborador</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {analysis.previewData.map((row, index) => (
                        <tr key={index} className="hover:bg-muted/30">
                          <td className="px-3 py-2 whitespace-nowrap text-xs">
                            {row.fecha_solicitud 
                              ? new Date(excelSerialToDate(row.fecha_solicitud)).toLocaleDateString('es-CO')
                              : '-'}
                          </td>
                          <td className="px-3 py-2 text-xs max-w-[150px] truncate">{row.nombre_apellidos || '-'}</td>
                          <td className="px-3 py-2 text-xs max-w-[180px] truncate">{row.email || '-'}</td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
                              row.estado === 'Aprobada' ? 'bg-green-100 text-green-700' :
                              row.estado === 'Rechazada' ? 'bg-red-100 text-red-700' :
                              'bg-amber-100 text-amber-700'
                            }`}>
                              {row.estado || 'Pendiente'}
                            </span>
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-xs">{row.nit_empresa || '-'}</td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
                              (typeof row.es_colaborador === 'string' 
                                ? row.es_colaborador.toLowerCase() === 'true' || row.es_colaborador.toLowerCase() === 'sí'
                                : row.es_colaborador)
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}>
                              {(typeof row.es_colaborador === 'string' 
                                ? row.es_colaborador.toLowerCase() === 'true' || row.es_colaborador.toLowerCase() === 'sí'
                                : row.es_colaborador) ? 'Sí' : 'No'}
                            </span>
                          </td>
                        </tr>
                      ))}
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
                  Cargar {analysis.toInsert} solicitudes
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
