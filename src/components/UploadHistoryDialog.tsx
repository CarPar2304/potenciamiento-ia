import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  History, 
  Trash2, 
  FileSpreadsheet, 
  Loader2, 
  AlertCircle,
  Calendar,
  User,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface UploadHistoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  tipo: 'solicitudes' | 'empresas';
  onDeleted: () => void;
}

interface CargaMasiva {
  id: string;
  tipo: string;
  nombre_archivo: string;
  registros_totales: number;
  registros_insertados: number;
  registros_duplicados: number;
  usuario_id: string;
  created_at: string;
}

interface RecordDetail {
  id: string;
  nombre?: string;
  email?: string;
  nit?: string;
  estado?: string;
}

export function UploadHistoryDialog({ isOpen, onClose, tipo, onDeleted }: UploadHistoryDialogProps) {
  const [cargas, setCargas] = useState<CargaMasiva[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [cargaToDelete, setCargaToDelete] = useState<CargaMasiva | null>(null);
  const [expandedCarga, setExpandedCarga] = useState<string | null>(null);
  const [recordsDetail, setRecordsDetail] = useState<Record<string, RecordDetail[]>>({});
  const [loadingDetails, setLoadingDetails] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchCargas();
    }
  }, [isOpen, tipo]);

  const fetchCargas = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('cargas_masivas')
        .select('*')
        .eq('tipo', tipo)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCargas(data || []);
    } catch (error) {
      console.error('Error fetching cargas:', error);
      toast({
        title: "Error",
        description: "No se pudo cargar el historial",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRecordDetails = async (cargaId: string) => {
    if (recordsDetail[cargaId]) {
      setExpandedCarga(expandedCarga === cargaId ? null : cargaId);
      return;
    }

    setLoadingDetails(cargaId);
    try {
      if (tipo === 'solicitudes') {
        const { data, error } = await supabase
          .from('solicitudes')
          .select('id, nombres_apellidos, email, estado')
          .eq('carga_masiva_id', cargaId)
          .limit(50);

        if (error) throw error;
        setRecordsDetail(prev => ({
          ...prev,
          [cargaId]: (data || []).map(r => ({
            id: r.id,
            nombre: r.nombres_apellidos,
            email: r.email,
            estado: r.estado
          }))
        }));
      } else {
        const { data, error } = await supabase
          .from('empresas')
          .select('id, nombre, nit')
          .eq('carga_masiva_id', cargaId)
          .limit(50);

        if (error) throw error;
        setRecordsDetail(prev => ({
          ...prev,
          [cargaId]: (data || []).map(r => ({
            id: r.id,
            nombre: r.nombre,
            nit: r.nit
          }))
        }));
      }
      setExpandedCarga(cargaId);
    } catch (error) {
      console.error('Error fetching record details:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los detalles",
        variant: "destructive"
      });
    } finally {
      setLoadingDetails(null);
    }
  };

  const handleDeleteClick = (carga: CargaMasiva) => {
    setCargaToDelete(carga);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!cargaToDelete) return;

    setDeleting(cargaToDelete.id);
    setDeleteDialogOpen(false);
    
    try {
      // Primero eliminar los registros asociados
      if (tipo === 'solicitudes') {
        const { error: deleteRecordsError } = await supabase
          .from('solicitudes')
          .delete()
          .eq('carga_masiva_id', cargaToDelete.id);
        
        if (deleteRecordsError) throw deleteRecordsError;
      } else {
        const { error: deleteRecordsError } = await supabase
          .from('empresas')
          .delete()
          .eq('carga_masiva_id', cargaToDelete.id);
        
        if (deleteRecordsError) throw deleteRecordsError;
      }

      // Luego eliminar el registro de carga
      const { error: deleteCargaError } = await supabase
        .from('cargas_masivas')
        .delete()
        .eq('id', cargaToDelete.id);

      if (deleteCargaError) throw deleteCargaError;

      toast({
        title: "Carga eliminada",
        description: `Se eliminaron ${cargaToDelete.registros_insertados} registros correctamente`,
      });

      // Actualizar lista local
      setCargas(prev => prev.filter(c => c.id !== cargaToDelete.id));
      onDeleted();
    } catch (error) {
      console.error('Error deleting carga:', error);
      toast({
        title: "Error al eliminar",
        description: "No se pudo eliminar la carga y sus registros",
        variant: "destructive"
      });
    } finally {
      setDeleting(null);
      setCargaToDelete(null);
    }
  };

  const handleDeleteSingleRecord = async (recordId: string, cargaId: string) => {
    try {
      if (tipo === 'solicitudes') {
        const { error } = await supabase
          .from('solicitudes')
          .delete()
          .eq('id', recordId);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('empresas')
          .delete()
          .eq('id', recordId);
        
        if (error) throw error;
      }

      // Actualizar detalle local
      setRecordsDetail(prev => ({
        ...prev,
        [cargaId]: prev[cargaId]?.filter(r => r.id !== recordId) || []
      }));

      // Actualizar contador
      setCargas(prev => prev.map(c => 
        c.id === cargaId 
          ? { ...c, registros_insertados: c.registros_insertados - 1 }
          : c
      ));

      toast({
        title: "Registro eliminado",
        description: "El registro se eliminó correctamente",
      });
      
      onDeleted();
    } catch (error) {
      console.error('Error deleting record:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el registro",
        variant: "destructive"
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5 text-primary" />
              Historial de Cargas - {tipo === 'solicitudes' ? 'Solicitudes' : 'Empresas'}
            </DialogTitle>
            <DialogDescription>
              Visualiza y gestiona las cargas masivas realizadas. Puedes eliminar lotes completos o registros individuales.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : cargas.length === 0 ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No hay cargas masivas registradas para {tipo}.
                </AlertDescription>
              </Alert>
            ) : (
              cargas.map((carga) => (
                <Collapsible 
                  key={carga.id} 
                  open={expandedCarga === carga.id}
                  onOpenChange={() => fetchRecordDetails(carga.id)}
                >
                  <div className="border border-border rounded-lg overflow-hidden">
                    <div className="bg-muted/30 p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <FileSpreadsheet className="h-4 w-4 text-primary" />
                            <span className="font-medium text-sm truncate max-w-[300px]">
                              {carga.nombre_archivo}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(carga.created_at)}
                            </span>
                            <Badge variant="secondary" className="text-xs">
                              {carga.registros_insertados} registros
                            </Badge>
                            {carga.registros_duplicados > 0 && (
                              <Badge variant="outline" className="text-xs">
                                {carga.registros_duplicados} duplicados
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="sm">
                              {loadingDetails === carga.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : expandedCarga === carga.id ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </Button>
                          </CollapsibleTrigger>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteClick(carga)}
                            disabled={deleting === carga.id}
                          >
                            {deleting === carga.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <CollapsibleContent>
                      <div className="border-t border-border">
                        {recordsDetail[carga.id]?.length === 0 ? (
                          <div className="p-4 text-center text-sm text-muted-foreground">
                            No hay registros asociados a esta carga
                          </div>
                        ) : (
                          <div className="max-h-64 overflow-y-auto">
                            <table className="w-full text-sm">
                              <thead className="bg-muted/50 sticky top-0">
                                <tr>
                                  {tipo === 'solicitudes' ? (
                                    <>
                                      <th className="px-3 py-2 text-left font-medium">Nombre</th>
                                      <th className="px-3 py-2 text-left font-medium">Email</th>
                                      <th className="px-3 py-2 text-left font-medium">Estado</th>
                                    </>
                                  ) : (
                                    <>
                                      <th className="px-3 py-2 text-left font-medium">Empresa</th>
                                      <th className="px-3 py-2 text-left font-medium">NIT</th>
                                    </>
                                  )}
                                  <th className="px-3 py-2 text-right font-medium">Acciones</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-border">
                                {recordsDetail[carga.id]?.map((record) => (
                                  <tr key={record.id} className="hover:bg-muted/20">
                                    {tipo === 'solicitudes' ? (
                                      <>
                                        <td className="px-3 py-2 truncate max-w-[150px]">{record.nombre}</td>
                                        <td className="px-3 py-2 truncate max-w-[180px]">{record.email}</td>
                                        <td className="px-3 py-2">
                                          <Badge 
                                            variant={
                                              record.estado === 'Aprobada' ? 'default' :
                                              record.estado === 'Rechazada' ? 'destructive' : 'secondary'
                                            }
                                            className="text-xs"
                                          >
                                            {record.estado}
                                          </Badge>
                                        </td>
                                      </>
                                    ) : (
                                      <>
                                        <td className="px-3 py-2 truncate max-w-[200px]">{record.nombre}</td>
                                        <td className="px-3 py-2">{record.nit}</td>
                                      </>
                                    )}
                                    <td className="px-3 py-2 text-right">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                                        onClick={() => handleDeleteSingleRecord(record.id, carga.id)}
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                            {(recordsDetail[carga.id]?.length || 0) >= 50 && (
                              <div className="p-2 text-center text-xs text-muted-foreground bg-muted/30">
                                Mostrando los primeros 50 registros
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              ))
            )}
          </div>

          <div className="flex justify-end pt-4 border-t border-border flex-shrink-0">
            <Button variant="outline" onClick={onClose}>
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar esta carga?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente <strong>{cargaToDelete?.registros_insertados} registros</strong> de {tipo} que fueron cargados desde el archivo "{cargaToDelete?.nombre_archivo}". Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}