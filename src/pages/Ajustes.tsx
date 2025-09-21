import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
} from 'lucide-react';
import { useAuth, hasPermission } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

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

  if (!profile) return null;

  const canManageUsers = hasPermission(profile.role, 'user_management');
  const canUploadReports = hasPermission(profile.role, 'reports_upload');

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedReport) return;

    setIsUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          toast({
            title: "Reporte cargado exitosamente",
            description: `La ${selectedReport === 'sheet1' ? 'Hoja 1' : 'Hoja 2'} del reporte de Platzi ha sido procesada.`,
          });
          setIsDialogOpen(false);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
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
        {/* Webhooks */}
        <SettingCard
          title="Administrador de Webhooks"
          description="Configura webhooks para recibir notificaciones automáticas de eventos del sistema"
          icon={Webhook}
          variant="info"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-blue-600">
              <Info className="h-4 w-4" />
              <span>Próximamente: Integración automática con formularios externos</span>
            </div>
            <div className="space-y-2">
              <Label>URL del Webhook</Label>
              <Input 
                placeholder="https://tu-sistema.com/webhook/adopcion-ia"
                disabled
                className="bg-muted"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" disabled>
                Configurar
              </Button>
              <Button variant="outline" disabled>
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

              {/* Summary */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-sm mb-2">Resumen de Importación:</h4>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>• Se validarán automáticamente las columnas requeridas</p>
                  <p>• Los datos se cruzarán con las solicitudes existentes</p>
                  <p>• Se actualizará el progreso y niveles de los usuarios</p>
                  <p>• Se generará un reporte de inconsistencias si las hay</p>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isUploading}>
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}