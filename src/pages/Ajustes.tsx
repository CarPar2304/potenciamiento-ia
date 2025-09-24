import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Settings, 
  Upload, 
  FileSpreadsheet, 
  Users, 
  Webhook, 
  CheckCircle,
  AlertCircle,
  Info,
  Shield,
  XCircle,
} from 'lucide-react';
import { useAuth, hasPermission } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import * as XLSX from 'xlsx';

const SettingCard = ({ 
  title, 
  description, 
  icon: Icon, 
  children, 
  variant = 'default' 
}: {
  title: string;
  description: string;
  icon: any;
  children: React.ReactNode;
  variant?: 'default' | 'info' | 'warning';
}) => (
  <Card className={
    variant === 'info' ? 'border-blue-200 bg-blue-50/50' :
    variant === 'warning' ? 'border-yellow-200 bg-yellow-50/50' :
    ''
  }>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Icon className="h-5 w-5" />
        {title}
      </CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
    <CardContent>
      {children}
    </CardContent>
  </Card>
);

export default function Ajustes() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<'sheet1' | 'sheet2' | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isPromotingAdmin, setIsPromotingAdmin] = useState(false);
  const [uploadResults, setUploadResults] = useState<{
    success: number;
    errors: number;
    total: number;
    errorDetails?: string[];
    duplicatesRemoved?: number;
    emailsNotFound?: number;
  } | null>(null);
  
  // Webhook configuration states
  const [webhookConfig, setWebhookConfig] = useState<any>(null);
  const [isLoadingWebhook, setIsLoadingWebhook] = useState(true);
  const [isSavingWebhook, setIsSavingWebhook] = useState(false);
  const [webhookForm, setWebhookForm] = useState({
    name: 'Recordatorio Licencia',
    url: '',
    method: 'POST'
  });

  if (!profile) return null;

  const canManageUsers = hasPermission(profile.role, 'user_management');
  const canUploadReports = hasPermission(profile.role, 'reports_upload');
  const isFromCCC = profile.chamber === 'Cámara de Comercio de Cali';

  // Load webhook configuration
  const loadWebhookConfig = async (webhookName: string) => {
    setIsLoadingWebhook(true);
    try {
      const { data, error } = await supabase
        .from('webhook_config')
        .select('*')
        .eq('name', webhookName)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setWebhookConfig(data);
        setWebhookForm({
          name: data.name,
          url: data.url,
          method: data.method
        });
      } else {
        // No existe configuración para este webhook, resetear el formulario
        setWebhookConfig(null);
        setWebhookForm({
          name: webhookName,
          url: '',
          method: 'POST'
        });
      }
    } catch (error: any) {
      console.error('Error loading webhook config:', error);
      toast({
        title: "Error",
        description: "No se pudo cargar la configuración de webhooks",
        variant: "destructive"
      });
    } finally {
      setIsLoadingWebhook(false);
    }
  };

  // Cargar configuración inicial
  useEffect(() => {
    loadWebhookConfig('Recordatorio Licencia');
  }, []);

  // Recargar configuración cuando cambie el tipo de webhook
  useEffect(() => {
    if (webhookForm.name) {
      loadWebhookConfig(webhookForm.name);
    }
  }, [webhookForm.name]);

  const handleSaveWebhookConfig = async () => {
    setIsSavingWebhook(true);
    try {
      if (webhookConfig) {
        // Update existing
        const { error } = await supabase
          .from('webhook_config')
          .update({
            url: webhookForm.url,
            method: webhookForm.method,
            updated_at: new Date().toISOString()
          })
          .eq('id', webhookConfig.id);

        if (error) throw error;
      } else {
        // Create new
        const { data, error } = await supabase
          .from('webhook_config')
          .insert({
            name: webhookForm.name,
            url: webhookForm.url,
            method: webhookForm.method
          })
          .select()
          .single();

        if (error) throw error;
        setWebhookConfig(data);
      }

      toast({
        title: "Configuración guardada",
        description: "La configuración del webhook se guardó exitosamente.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo guardar la configuración",
        variant: "destructive"
      });
    } finally {
      setIsSavingWebhook(false);
    }
  };

  const handleTestWebhook = async () => {
    if (!webhookForm.url) {
      toast({
        title: "URL requerida",
        description: "Ingresa una URL antes de probar el webhook.",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch(webhookForm.url, {
        method: webhookForm.method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          test: true,
          timestamp: new Date().toISOString(),
          message: 'Prueba de conexión desde el panel de administración'
        }),
      });

      if (response.ok) {
        toast({
          title: "Webhook funcionando",
          description: "La conexión al webhook fue exitosa.",
        });
      } else {
        throw new Error(`Error HTTP: ${response.status}`);
      }
    } catch (error: any) {
      toast({
        title: "Error de conexión",
        description: error.message || "No se pudo conectar al webhook",
        variant: "destructive"
      });
    }
  };

  const handlePromoteToAdmin = async () => {
    if (!profile?.id) return;
    
    setIsPromotingAdmin(true);
    try {
      const { error } = await supabase.rpc('set_user_admin', {
        user_id: profile.id,
        admin_status: true
      });

      if (error) throw error;

      toast({
        title: "¡Permisos actualizados!",
        description: "Ahora tienes permisos de administrador. Recarga la página para ver los cambios.",
      });

      // Recargar la página para actualizar los permisos
      setTimeout(() => {
        window.location.reload();
      }, 2000);

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudieron actualizar los permisos",
        variant: "destructive"
      });
    } finally {
      setIsPromotingAdmin(false);
    }
  };

  const processSheet1Data = async (data: any[]) => {
    const processed = [];
    const errors = [];

    console.log('Procesando sheet1 con', data.length, 'filas');
    console.log('Primera fila de ejemplo:', data[0]);

    // Obtener emails aprobados de solicitudes
    const { data: approvedEmails, error: emailError } = await supabase
      .from('solicitudes')
      .select('email')
      .eq('estado', 'Aprobada');

    if (emailError) {
      console.error('Error obteniendo emails aprobados:', emailError);
      throw new Error(`Error al obtener emails aprobados: ${emailError.message}`);
    }

    const approvedEmailsSet = new Set(approvedEmails?.map(s => s.email.toLowerCase()) || []);
    console.log('Emails aprobados encontrados:', approvedEmailsSet.size);

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      try {
        // Verificar si la fila tiene datos válidos
        if (!row || typeof row !== 'object') {
          continue;
        }

        // Mapear columnas del Excel a campos de la BD
        const processedRow = {
          nombre: row['Nombre'] || row['nombre'] || row['NOMBRE'],
          email: row['Correo'] || row['correo'] || row['CORREO'] || row['Email'] || row['email'],
          estado_acceso: row['Estado de acceso'] || row['estado_acceso'] || row['ESTADO DE ACCESO'] || row['ESTADO_ACCESO'],
          dias_acceso_restantes: parseInt(row['Días de acceso restantes'] || row['dias_acceso_restantes'] || row['DÍAS DE ACCESO RESTANTES'] || row['DIAS_ACCESO_RESTANTES'] || '0'),
          equipos: row['Equipos'] || row['equipos'] || row['EQUIPOS'],
          ruta: row['Ruta'] || row['ruta'] || row['RUTA'],
          progreso_ruta: parseFloat(row['Progreso en ruta'] || row['progreso_ruta'] || row['PROGRESO EN RUTA'] || row['PROGRESO_RUTA'] || '0'),
          cursos_totales_progreso: parseInt(row['Cursos totales en progreso'] || row['cursos_totales_progreso'] || row['CURSOS_TOTALES_PROGRESO'] || '0'),
          cursos_totales_certificados: parseInt(row['Cursos totales certificados'] || row['cursos_totales_certificados'] || row['CURSOS_TOTALES_CERTIFICADOS'] || '0'),
          tiempo_total_dedicado: parseInt(row['Tiempo total dedicado'] || row['tiempo_total_dedicado'] || row['TIEMPO_TOTAL_DEDICADO'] || '0'),
          dias_sin_progreso: parseInt(row['Días sin progreso'] || row['dias_sin_progreso'] || row['DIAS_SIN_PROGRESO'] || '0'),
          dias_sin_certificar: parseInt(row['Días sin certificar cursos'] || row['dias_sin_certificar'] || row['DIAS_SIN_CERTIFICAR'] || '0'),
          fecha_inicio_ultima_licencia: row['Fecha de inicio última licencia activa'] || row['fecha_inicio_ultima_licencia'] ? 
            new Date(row['Fecha de inicio última licencia activa'] || row['fecha_inicio_ultima_licencia']) : null,
          fecha_expiracion_ultima_licencia: row['Fecha de expiración última licencia activa'] || row['fecha_expiracion_ultima_licencia'] ? 
            new Date(row['Fecha de expiración última licencia activa'] || row['fecha_expiracion_ultima_licencia']) : null,
          fecha_primera_activacion: row['Fecha en que activó su primera licencia'] || row['fecha_primera_activacion'] ? 
            new Date(row['Fecha en que activó su primera licencia'] || row['fecha_primera_activacion']) : null,
        };

        // Validar campos esenciales
        if (!processedRow.nombre || !processedRow.email) {
          errors.push(`Fila ${i + 2}: Datos esenciales faltantes - Nombre: "${processedRow.nombre}", Email: "${processedRow.email}"`);
          continue;
        }

        // Limpiar email
        processedRow.email = processedRow.email.toString().trim().toLowerCase();

        // Verificar si el email está en solicitudes aprobadas
        if (!approvedEmailsSet.has(processedRow.email)) {
          errors.push(`Fila ${i + 2}: Email "${processedRow.email}" no tiene solicitud aprobada`);
          continue;
        }

        processed.push(processedRow);
      } catch (error) {
        console.error(`Error procesando fila ${i + 2}:`, error);
        errors.push(`Fila ${i + 2}: Error al procesar - ${error}`);
      }
    }

    // Deduplicar por email + ruta (conservar última ocurrencia)
    const emailMap = new Map();
    let duplicatesRemoved = 0;
    
    processed.forEach(record => {
      const key = `${record.email}|${record.ruta || ''}`;
      if (emailMap.has(key)) {
        duplicatesRemoved++;
      }
      emailMap.set(key, record);
    });

    const deduplicatedProcessed = Array.from(emailMap.values());

    console.log('Procesamiento completado:', {
      total: data.length,
      procesados: processed.length,
      deduplicados: deduplicatedProcessed.length,
      duplicadosRemovedos: duplicatesRemoved,
      errores: errors.length,
      emailsNoAprobados: errors.filter(e => e.includes('no tiene solicitud aprobada')).length
    });

    return { 
      processed: deduplicatedProcessed, 
      errors, 
      stats: {
        duplicatesRemoved,
        emailsNotFound: errors.filter(e => e.includes('no tiene solicitud aprobada')).length
      }
    };
  };

  const processSheet2Data = async (data: any[]) => {
    const processed = [];
    const errors = [];

    console.log('Procesando sheet2 con', data.length, 'filas');
    console.log('Primera fila de ejemplo:', data[0]);

    // Obtener emails aprobados de solicitudes
    const { data: approvedEmails, error: emailError } = await supabase
      .from('solicitudes')
      .select('email')
      .eq('estado', 'Aprobada');

    if (emailError) {
      console.error('Error obteniendo emails aprobados:', emailError);
      throw new Error(`Error al obtener emails aprobados: ${emailError.message}`);
    }

    const approvedEmailsSet = new Set(approvedEmails?.map(s => s.email.toLowerCase()) || []);
    console.log('Emails aprobados encontrados:', approvedEmailsSet.size);

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      try {
        // Verificar si la fila tiene datos válidos
        if (!row || typeof row !== 'object') {
          continue;
        }

        const processedRow = {
          nombre: row['Nombre'] || row['nombre'] || row['NOMBRE'],
          email: row['Correo'] || row['correo'] || row['CORREO'] || row['Email'] || row['email'],
          id_curso: row['ID del curso'] || row['id_curso'] || row['ID CURSO'] || row['ID_CURSO'],
          curso: row['Curso'] || row['curso'] || row['CURSO'],
          porcentaje_avance: parseFloat(row['% Avance'] || row['porcentaje_avance'] || row['PORCENTAJE AVANCE'] || row['%_AVANCE'] || '0'),
          tiempo_invertido: parseInt(row['Tiempo invertido (en segundos)'] || row['tiempo_invertido'] || row['TIEMPO INVERTIDO'] || row['TIEMPO_INVERTIDO'] || '0'),
          estado_curso: row['Estado del curso'] || row['estado_curso'] || row['ESTADO CURSO'] || row['ESTADO_CURSO'],
          fecha_certificacion: row['Fecha de certificación'] || row['fecha_certificacion'] ? 
            new Date(row['Fecha de certificación'] || row['fecha_certificacion']) : null,
          ruta: row['Ruta'] || row['ruta'] || row['RUTA'],
        };

        // Validar campos esenciales
        if (!processedRow.nombre || !processedRow.email || !processedRow.id_curso) {
          errors.push(`Fila ${i + 2}: Datos esenciales faltantes - Nombre: "${processedRow.nombre}", Email: "${processedRow.email}", ID Curso: "${processedRow.id_curso}"`);
          continue;
        }

        // Limpiar email
        processedRow.email = processedRow.email.toString().trim().toLowerCase();

        // Verificar si el email está en solicitudes aprobadas
        if (!approvedEmailsSet.has(processedRow.email)) {
          errors.push(`Fila ${i + 2}: Email "${processedRow.email}" no tiene solicitud aprobada`);
          continue;
        }

        processed.push(processedRow);
      } catch (error) {
        console.error(`Error procesando fila ${i + 2}:`, error);
        errors.push(`Fila ${i + 2}: Error al procesar - ${error}`);
      }
    }

    // Deduplicar por email + id_curso (conservar última ocurrencia)
    const courseMap = new Map();
    let duplicatesRemoved = 0;
    
    processed.forEach(record => {
      const key = `${record.email}|${record.id_curso}`;
      if (courseMap.has(key)) {
        duplicatesRemoved++;
      }
      courseMap.set(key, record);
    });

    const deduplicatedProcessed = Array.from(courseMap.values());

    console.log('Procesamiento completado:', {
      total: data.length,
      procesados: processed.length,
      deduplicados: deduplicatedProcessed.length,
      duplicadosRemovedos: duplicatesRemoved,
      errores: errors.length,
      emailsNoAprobados: errors.filter(e => e.includes('no tiene solicitud aprobada')).length
    });

    return { 
      processed: deduplicatedProcessed, 
      errors, 
      stats: {
        duplicatesRemoved,
        emailsNotFound: errors.filter(e => e.includes('no tiene solicitud aprobada')).length
      }
    };
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedReport) return;

    setIsUploading(true);
    setUploadProgress(0);
    setUploadResults(null);

    try {
      console.log('Iniciando procesamiento de archivo:', file.name, 'Tipo:', selectedReport);
      
      // Leer archivo Excel
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      
      console.log('Hojas disponibles:', workbook.SheetNames);
      
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      console.log('Datos extraídos del Excel:', jsonData.length, 'filas');
      if (jsonData.length > 0) {
        console.log('Ejemplo de primera fila:', jsonData[0]);
      }

      setUploadProgress(25);

      if (jsonData.length === 0) {
        throw new Error('El archivo está vacío o no tiene datos válidos');
      }

      // Procesar datos según el tipo de hoja
      let processResult;

      if (selectedReport === 'sheet1') {
        processResult = await processSheet1Data(jsonData);
        setUploadProgress(40);

        // Borrar todos los registros existentes de platzi_general antes de cargar nuevos datos
        console.log('Borrando registros existentes de platzi_general...');
        const { error: deleteError } = await supabase
          .from('platzi_general')
          .delete()
          .gte('created_at', '1900-01-01'); // Delete all records using a condition that matches all

        if (deleteError) {
          console.error('Error borrando datos existentes:', deleteError);
          throw new Error(`Error al borrar datos existentes: ${deleteError.message}`);
        }

        console.log('Registros de platzi_general eliminados exitosamente');
        setUploadProgress(50);

        // Insertar en platzi_general
        if (processResult.processed.length > 0) {
          const { data: insertData, error } = await supabase
            .from('platzi_general')
            .insert(processResult.processed); // Cambio de upsert a insert ya que borramos todo

          if (error) {
            console.error('Error insertando datos:', error);
            throw new Error(`Error al guardar datos: ${error.message}`);
          }
          setUploadProgress(75);
        }
      } else {
        processResult = await processSheet2Data(jsonData);
        setUploadProgress(40);

        // Borrar todos los registros existentes de platzi_seguimiento antes de cargar nuevos datos
        console.log('Borrando registros existentes de platzi_seguimiento...');
        const { error: deleteError } = await supabase
          .from('platzi_seguimiento')
          .delete()
          .gte('created_at', '1900-01-01'); // Delete all records using a condition that matches all

        if (deleteError) {
          console.error('Error borrando datos existentes:', deleteError);
          throw new Error(`Error al borrar datos existentes: ${deleteError.message}`);
        }

        console.log('Registros de platzi_seguimiento eliminados exitosamente');
        setUploadProgress(50);

        // Insertar en platzi_seguimiento
        if (processResult.processed.length > 0) {
          const { data: insertData, error } = await supabase
            .from('platzi_seguimiento')
            .insert(processResult.processed); // Cambio de upsert a insert ya que borramos todo

          if (error) {
            console.error('Error insertando datos:', error);
            throw new Error(`Error al guardar datos: ${error.message}`);
          }
          setUploadProgress(75);
        }
      }

      // Ejecutar sincronización
      const { error: syncError } = await supabase.rpc('sync_platzi_with_solicitudes');
      if (syncError) {
        console.error('Error en sincronización:', syncError);
      }

      setUploadProgress(100);

      const results = {
        success: processResult.processed.length,
        errors: processResult.errors.length,
        total: jsonData.length,
        errorDetails: processResult.errors,
        duplicatesRemoved: processResult.stats?.duplicatesRemoved || 0,
        emailsNotFound: processResult.stats?.emailsNotFound || 0
      };

      setUploadResults(results);

      const successMessage = selectedReport === 'sheet1' ? 
        `Hoja 1: ${results.success} usuarios cargados` :
        `Hoja 2: ${results.success} registros de cursos cargados`;
      
      const statsMessage = results.duplicatesRemoved > 0 || results.emailsNotFound > 0 ? 
        ` (${results.duplicatesRemoved} duplicados removidos, ${results.emailsNotFound} emails no aprobados)` : '';

      toast({
        title: "Archivo procesado exitosamente",
        description: `${successMessage}${statsMessage}`,
        variant: results.errors > 0 ? "destructive" : "default"
      });

    } catch (error: any) {
      console.error('Error procesando archivo:', error);
      toast({
        title: "Error al procesar archivo",
        description: error.message || "Ocurrió un error inesperado",
        variant: "destructive"
      });

      setUploadResults({
        success: 0,
        errors: 1,
        total: 0,
        errorDetails: [error.message || "Error desconocido"],
        duplicatesRemoved: 0,
        emailsNotFound: 0
      });
    } finally {
      setIsUploading(false);
      // No cerrar el diálogo para mostrar los resultados
    }
  };

  const reportPreview = {
    sheet1: {
      title: 'Hoja 1: Información de Usuarios',
      columns: ['Nombre', 'Correo', 'Estado de acceso', 'Días restantes', 'Ruta', 'Progreso', 'Cursos certificados'],
      expectedRows: '~250 usuarios',
    },
    sheet2: {
      title: 'Hoja 2: Detalle de Cursos',
      columns: ['Nombre', 'Correo', 'ID del curso', 'Curso', '% Avance', 'Estado', 'Fecha certificación'],
      expectedRows: '~1,500 registros',
    },
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-primary bg-clip-text text-transparent">
          Ajustes
        </h1>
        <p className="text-muted-foreground">
          Configuración del sistema y herramientas de administración
        </p>
      </div>

      {/* Integration Cards */}
      <div className="space-y-6">
        {/* Admin Configuration - Solo para usuarios de CCC que no son admin */}
        {isFromCCC && !profile.is_admin && (
          <SettingCard
            title="Configuración de Administrador"
            description="Como usuario de la Cámara de Comercio de Cali, puedes solicitar permisos de administrador"
            icon={Shield}
            variant="info"
          >
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-950/50 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start space-x-3">
                  <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      Permisos de Administrador
                    </p>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                      Los administradores pueden acceder a todas las funciones del sistema, gestionar usuarios, subir reportes y configurar integraciones.
                    </p>
                  </div>
                </div>
              </div>
              
              <Button 
                onClick={handlePromoteToAdmin}
                disabled={isPromotingAdmin}
                className="w-full"
              >
                {isPromotingAdmin ? 'Configurando...' : 'Activar Permisos de Administrador'}
              </Button>
            </div>
          </SettingCard>
        )}

        {/* Status actual */}
        <SettingCard
          title="Estado de la Cuenta"
          description="Información sobre tu cuenta y permisos actuales"
          icon={Info}
        >
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Rol:</span>
              <span className="text-sm font-medium">
                {profile.role === 'admin' ? 'Administrador' : 
                 profile.role === 'ccc' ? 'CCC' : 'Cámara Aliada'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Cámara:</span>
              <span className="text-sm font-medium">{profile.chamber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Admin:</span>
              <span className="text-sm font-medium">
                {profile.is_admin ? '✅ Sí' : '❌ No'}
              </span>
            </div>
          </div>
        </SettingCard>
        {/* Webhooks Configuration */}
        <SettingCard
          title="Configuración de Webhooks"
          description="Gestiona las URLs y métodos para notificaciones automáticas del sistema"
          icon={Webhook}
        >
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="space-y-2">
                <Label>Tipo de Webhook</Label>
                <Select 
                  value={webhookForm.name} 
                  onValueChange={(value) => {
                    // Solo actualizar el nombre sin cargar la config aquí
                    // El useEffect se encargará de cargar la config
                    setWebhookForm({...webhookForm, name: value});
                  }}
                  disabled={isLoadingWebhook}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo de webhook" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Recordatorio Licencia">Recordatorio Licencia</SelectItem>
                    <SelectItem value="Aprobar Solicitud">Aprobar Solicitud</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Método HTTP</Label>
                <Select value={webhookForm.method} onValueChange={(value) => setWebhookForm({...webhookForm, method: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar método" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GET">GET</SelectItem>
                    <SelectItem value="POST">POST</SelectItem>
                    <SelectItem value="PUT">PUT</SelectItem>
                    <SelectItem value="PATCH">PATCH</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>URL del Webhook</Label>
                <Input 
                  placeholder="https://n8n-n8n.5cj84u.easypanel.host/webhook-test/..."
                  value={webhookForm.url}
                  onChange={(e) => setWebhookForm({...webhookForm, url: e.target.value})}
                  disabled={isLoadingWebhook}
                />
              </div>
            </div>
            
            {webhookConfig && (
              <div className="bg-muted/50 p-3 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-green-700">
                  <CheckCircle className="h-4 w-4" />
                  <span>Configuración guardada exitosamente</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Última actualización: {new Date(webhookConfig.updated_at).toLocaleString('es-CO')}
                </p>
              </div>
            )}
            
            <div className="flex gap-2">
              <Button 
                onClick={handleSaveWebhookConfig}
                disabled={isLoadingWebhook || isSavingWebhook || !webhookForm.url}
                className="gap-2"
              >
                {isSavingWebhook ? 'Guardando...' : 'Guardar Configuración'}
              </Button>
              <Button 
                variant="outline" 
                onClick={handleTestWebhook}
                disabled={isLoadingWebhook || !webhookForm.url}
                className="gap-2"
              >
                Probar Conexión
              </Button>
            </div>
          </div>
        </SettingCard>

        {/* Platzi Reports */}
        {canUploadReports && (
          <>
            <SettingCard
              title="Cargar Hoja 1 del Reporte de Platzi"
              description="Sube la información general de usuarios: acceso, progreso, rutas y certificaciones"
              icon={FileSpreadsheet}
            >
              <div className="space-y-4">
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-medium text-sm mb-2">Formato esperado:</h4>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p><strong>Columnas:</strong> Nombre, Correo, Estado de acceso, Días de acceso restantes, Equipos, Ruta, Progreso en ruta</p>
                    <p><strong>Usuarios esperados:</strong> ~250 registros</p>
                  </div>
                </div>
                <Button 
                  className="gap-2"
                  onClick={() => {
                    setSelectedReport('sheet1');
                    setIsDialogOpen(true);
                  }}
                >
                  <Upload className="h-4 w-4" />
                  Cargar Hoja 1
                </Button>
              </div>
            </SettingCard>

            <SettingCard
              title="Cargar Hoja 2 del Reporte de Platzi"
              description="Sube el detalle de cursos: avance por curso, certificaciones y tiempo invertido"
              icon={FileSpreadsheet}
            >
              <div className="space-y-4">
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-medium text-sm mb-2">Formato esperado:</h4>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p><strong>Columnas:</strong> Nombre, Correo, ID del curso, Curso, % Avance, Tiempo invertido, Estado del curso</p>
                    <p><strong>Registros esperados:</strong> ~1,500 entradas</p>
                  </div>
                </div>
                <Button 
                  className="gap-2"
                  onClick={() => {
                    setSelectedReport('sheet2');
                    setIsDialogOpen(true);
                  }}
                >
                  <Upload className="h-4 w-4" />
                  Cargar Hoja 2
                </Button>
              </div>
            </SettingCard>
          </>
        )}

        {/* User Management */}
        {canManageUsers && (
          <SettingCard
            title="Administración de Usuarios"
            description="Gestiona usuarios del sistema, roles y permisos"
            icon={Users}
          >
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="text-center p-3 border rounded-lg">
                  <div className="text-lg font-bold text-primary">3</div>
                  <div className="text-muted-foreground">Administradores</div>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <div className="text-lg font-bold text-primary">8</div>
                  <div className="text-muted-foreground">Ejecutivos CCC</div>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <div className="text-lg font-bold text-primary">11</div>
                  <div className="text-muted-foreground">Cámaras Aliadas</div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline">
                  Gestionar Usuarios
                </Button>
                <Button variant="outline">
                  Configurar Roles
                </Button>
              </div>
            </div>
          </SettingCard>
        )}

        {/* System Status */}
        <SettingCard
          title="Estado del Sistema"
          description="Información general del sistema y próximas integraciones"
          icon={Settings}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Base de datos: Operativa</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Autenticación: Activa</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <AlertCircle className="h-4 w-4 text-yellow-500" />
                <span>Integración Platzi: Pendiente</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <AlertCircle className="h-4 w-4 text-yellow-500" />
                <span>Webhooks: En desarrollo</span>
              </div>
            </div>
            
            <div className="bg-primary-light p-4 rounded-lg">
              <h4 className="font-medium text-sm mb-2">Próximas Funcionalidades</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Sincronización automática con reportes de Platzi</li>
                <li>• Notificaciones push para nuevas solicitudes</li>
                <li>• Dashboard personalizable por usuario</li>
                <li>• Exportación automatizada de reportes</li>
                <li>• API REST para integraciones externas</li>
              </ul>
            </div>
          </div>
        </SettingCard>
      </div>

      {/* Upload Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {selectedReport === 'sheet1' ? 'Cargar Hoja 1' : 'Cargar Hoja 2'} del Reporte
            </DialogTitle>
            <DialogDescription>
              {selectedReport && reportPreview[selectedReport].title}
            </DialogDescription>
          </DialogHeader>
          
          {selectedReport && (
            <div className="space-y-4">
              {/* Preview */}
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-medium text-sm mb-2">Previsualización:</h4>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p><strong>Columnas esperadas:</strong></p>
                  <p className="pl-2">{reportPreview[selectedReport].columns.join(', ')}</p>
                  <p><strong>Registros esperados:</strong> {reportPreview[selectedReport].expectedRows}</p>
                </div>
              </div>

              {/* File Input */}
              <div className="space-y-2">
                <Label htmlFor="file-upload">Seleccionar archivo Excel</Label>
                <Input
                  id="file-upload"
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                />
              </div>

              {/* Upload Progress */}
              {isUploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Procesando archivo...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all" 
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Results */}
              {uploadResults && (
                <div className={`p-4 rounded-lg border ${
                  uploadResults.errors > 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    {uploadResults.errors > 0 ? (
                      <XCircle className="h-4 w-4 text-red-600" />
                    ) : (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    )}
                    <h4 className="font-medium text-sm">Resultados de la Importación</h4>
                  </div>
                  <div className="text-xs space-y-1">
                    <p><strong>Total de registros en Excel:</strong> {uploadResults.total}</p>
                    <p className="text-green-700"><strong>Importados exitosamente:</strong> {uploadResults.success}</p>
                    {uploadResults.duplicatesRemoved > 0 && (
                      <p className="text-blue-700"><strong>Duplicados removidos:</strong> {uploadResults.duplicatesRemoved}</p>
                    )}
                    {uploadResults.emailsNotFound > 0 && (
                      <p className="text-orange-700"><strong>Emails no aprobados:</strong> {uploadResults.emailsNotFound}</p>
                    )}
                    {uploadResults.errors > 0 && (
                      <p className="text-red-700"><strong>Errores:</strong> {uploadResults.errors}</p>
                    )}
                  </div>
                  {uploadResults.errorDetails && uploadResults.errorDetails.length > 0 && (
                    <div className="mt-2 max-h-32 overflow-y-auto">
                      <p className="text-xs font-medium text-red-700 mb-1">Detalles de errores:</p>
                      <ul className="text-xs text-red-600 space-y-1">
                        {uploadResults.errorDetails.slice(0, 5).map((error, index) => (
                          <li key={index}>• {error}</li>
                        ))}
                        {uploadResults.errorDetails.length > 5 && (
                          <li>• ... y {uploadResults.errorDetails.length - 5} errores más</li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Summary */}
              {!uploadResults && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-sm mb-2">Resumen de Importación:</h4>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>• Se validarán automáticamente las columnas requeridas</p>
                    <p>• Los datos se cruzarán con las solicitudes existentes</p>
                    <p>• Se actualizará el progreso y niveles de los usuarios</p>
                    <p>• Se generará un reporte de inconsistencias si las hay</p>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsDialogOpen(false);
                    setUploadResults(null);
                    setUploadProgress(0);
                  }} 
                  disabled={isUploading}
                >
                  {uploadResults ? 'Cerrar' : 'Cancelar'}
                </Button>
                {uploadResults && uploadResults.success > 0 && (
                  <Button 
                    onClick={() => {
                      setIsDialogOpen(false);
                      setUploadResults(null);
                      setUploadProgress(0);
                      // Opcional: recargar página para refrescar datos
                      window.location.reload();
                    }}
                  >
                    Actualizar Vista
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}