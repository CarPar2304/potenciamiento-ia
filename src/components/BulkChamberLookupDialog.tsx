import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Search, 
  Loader2, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Edit2,
  Check,
  X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

// Mapeo de nombres de cámara de la API RUES a IDs del sistema
const CAMARA_API_TO_ID: Record<string, string> = {
  'CALI': '7f567c19-8963-4910-a033-36689f29f9d7',
  'TULUA': '9592810c-00df-4911-9609-fc786aeda0ee',
  'PALMIRA': '4c4fbdea-3e85-4b0b-9510-d25127642e5d',
  'SEVILLA': 'a8b4724b-bc0f-4cfb-9e92-46f91c1a26ba',
  'BUENAVENTURA': '53ee279d-16e6-40c2-8f6f-16e0755285b2',
  'PASTO': '26803edf-b616-452b-99b2-4d5acdf5b3a0',
  'TUMACO': '0c80faa8-d6c6-42d8-902a-6f32aadf6040',
  'PUTUMAYO': 'a7efd2bb-4ce3-4bf7-9e01-d4503ffbd4c9',
  'BUGA': 'b5b431a7-a47f-4f4e-a48d-ec5e509c29d7',
  'IPIALES': '774c338b-703f-46fc-86d5-bf5fdcb2ea32',
  'CARTAGO': 'f2559589-feb3-405e-8ac2-f8a7551b8568',
  'CAUCA': '5a78633d-c13d-41d8-9ce1-bcfd162706cb',
};

interface BulkLookupItem {
  solicitud: any;
  selected: boolean;
  status: 'idle' | 'searching' | 'found' | 'not_found' | 'invalid_chamber' | 'error';
  foundChamber?: string;
  editingNit: boolean;
  tempNit: string;
}

interface BulkChamberLookupDialogProps {
  isOpen: boolean;
  onClose: () => void;
  solicitudes: any[];
  camaras: any[];
  onSuccess: () => void;
}

export function BulkChamberLookupDialog({
  isOpen,
  onClose,
  solicitudes,
  camaras,
  onSuccess,
}: BulkChamberLookupDialogProps) {
  const { toast } = useToast();
  const [items, setItems] = useState<BulkLookupItem[]>([]);
  const [statusFilter, setStatusFilter] = useState('todos');
  const [chamberFilter, setChamberFilter] = useState('sin_camara');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  // Inicializar items cuando cambian las solicitudes o filtros
  useEffect(() => {
    if (isOpen) {
      const filteredSolicitudes = solicitudes.filter((sol) => {
        const matchesStatus = statusFilter === 'todos' || sol.estado === statusFilter;
        const hasChamber = sol.empresas?.camaras?.nombre;
        const matchesChamber = 
          chamberFilter === 'todas' ||
          (chamberFilter === 'sin_camara' && !hasChamber) ||
          sol.empresas?.camaras?.nombre === chamberFilter;
        
        return matchesStatus && matchesChamber;
      });

      setItems(
        filteredSolicitudes.map((sol) => ({
          solicitud: sol,
          selected: false,
          status: 'idle',
          editingNit: false,
          tempNit: sol.nit_empresa,
        }))
      );
    }
  }, [isOpen, solicitudes, statusFilter, chamberFilter]);

  // Reset state when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setItems([]);
      setStatusFilter('todos');
      setChamberFilter('sin_camara');
      setIsProcessing(false);
      setProgress({ current: 0, total: 0 });
    }
  }, [isOpen]);

  const selectedCount = items.filter((item) => item.selected).length;
  const allSelected = items.length > 0 && items.every((item) => item.selected);

  const handleSelectAll = (checked: boolean) => {
    setItems((prev) =>
      prev.map((item) => ({
        ...item,
        selected: checked && item.status !== 'searching',
      }))
    );
  };

  const handleSelectItem = (id: string, checked: boolean) => {
    setItems((prev) =>
      prev.map((item) =>
        item.solicitud.id === id ? { ...item, selected: checked } : item
      )
    );
  };

  const handleEditNit = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.solicitud.id === id ? { ...item, editingNit: true } : item
      )
    );
  };

  const handleNitChange = (id: string, value: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.solicitud.id === id ? { ...item, tempNit: value } : item
      )
    );
  };

  const handleSaveNit = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.solicitud.id === id
          ? { ...item, editingNit: false, status: 'idle' }
          : item
      )
    );
  };

  const handleCancelNit = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.solicitud.id === id
          ? { ...item, editingNit: false, tempNit: item.solicitud.nit_empresa }
          : item
      )
    );
  };

  const updateItemStatus = (
    id: string,
    status: BulkLookupItem['status'],
    foundChamber?: string
  ) => {
    setItems((prev) =>
      prev.map((item) =>
        item.solicitud.id === id
          ? { ...item, status, foundChamber, selected: false }
          : item
      )
    );
  };

  const handleBulkSearch = async () => {
    const selectedItems = items.filter((item) => item.selected);
    if (selectedItems.length === 0) return;

    setIsProcessing(true);
    setProgress({ current: 0, total: selectedItems.length });

    let successCount = 0;
    let notFoundCount = 0;
    let invalidCount = 0;

    for (let i = 0; i < selectedItems.length; i++) {
      const item = selectedItems[i];

      // Actualizar estado a "buscando"
      updateItemStatus(item.solicitud.id, 'searching');

      try {
        // Consultar API RUES
        const response = await fetch(
          `https://www.datos.gov.co/resource/c82u-588k.json?` +
            `nit=${item.tempNit}` +
            `&$select=camara_comercio,razon_social,nit` +
            `&$limit=1`
        );

        const data = await response.json();

        if (!data || data.length === 0) {
          updateItemStatus(item.solicitud.id, 'not_found');
          notFoundCount++;
          setProgress({ current: i + 1, total: selectedItems.length });
          await new Promise((resolve) => setTimeout(resolve, 300));
          continue;
        }

        const camaraAPI = data[0].camara_comercio;
        const camaraId = CAMARA_API_TO_ID[camaraAPI];

        if (!camaraId) {
          updateItemStatus(item.solicitud.id, 'invalid_chamber', camaraAPI);
          invalidCount++;
          setProgress({ current: i + 1, total: selectedItems.length });
          await new Promise((resolve) => setTimeout(resolve, 300));
          continue;
        }

        // Si el NIT fue editado, actualizar en ambas tablas
        if (item.tempNit !== item.solicitud.nit_empresa) {
          // Actualizar NIT en solicitudes
          await supabase
            .from('solicitudes')
            .update({ nit_empresa: item.tempNit })
            .eq('id', item.solicitud.id);

          // Actualizar NIT en empresas
          await supabase
            .from('empresas')
            .update({ nit: item.tempNit, camara_id: camaraId })
            .eq('nit', item.solicitud.nit_empresa);
        } else {
          // Solo actualizar cámara en empresas
          await supabase
            .from('empresas')
            .update({ camara_id: camaraId })
            .eq('nit', item.solicitud.nit_empresa);
        }

        const camaraInfo = camaras.find((c) => c.id === camaraId);
        updateItemStatus(
          item.solicitud.id,
          'found',
          camaraInfo?.nombre || camaraAPI
        );
        successCount++;
      } catch (err) {
        console.error('Error en búsqueda:', err);
        updateItemStatus(item.solicitud.id, 'error');
      }

      // Actualizar progreso
      setProgress({ current: i + 1, total: selectedItems.length });

      // Pequeña pausa entre consultas para evitar saturar la API
      await new Promise((resolve) => setTimeout(resolve, 300));
    }

    setIsProcessing(false);

    // Mostrar resumen
    toast({
      title: 'Búsqueda completada',
      description: `Encontradas: ${successCount} | No encontradas: ${notFoundCount} | Cámara no aliada: ${invalidCount}`,
    });

    // Refrescar datos
    onSuccess();
  };

  const getStatusBadge = (item: BulkLookupItem) => {
    switch (item.status) {
      case 'searching':
        return (
          <Badge variant="outline" className="gap-1">
            <Loader2 className="h-3 w-3 animate-spin" />
            Buscando...
          </Badge>
        );
      case 'found':
        return (
          <Badge className="bg-success/20 text-success border-success/30 gap-1">
            <CheckCircle className="h-3 w-3" />
            {item.foundChamber}
          </Badge>
        );
      case 'not_found':
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" />
            No encontrado
          </Badge>
        );
      case 'invalid_chamber':
        return (
          <Badge className="bg-warning/20 text-warning border-warning/30 gap-1">
            <AlertTriangle className="h-3 w-3" />
            {item.foundChamber} (no aliada)
          </Badge>
        );
      case 'error':
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" />
            Error
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-muted-foreground">
            Pendiente
          </Badge>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Búsqueda Masiva de Cámaras
          </DialogTitle>
          <DialogDescription>
            Busca y asigna cámaras de comercio a múltiples solicitudes usando datos públicos del RUES.
          </DialogDescription>
        </DialogHeader>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Select
            value={statusFilter}
            onValueChange={setStatusFilter}
            disabled={isProcessing}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los estados</SelectItem>
              <SelectItem value="Pendiente">Pendiente</SelectItem>
              <SelectItem value="Aprobada">Aprobada</SelectItem>
              <SelectItem value="Rechazada">Rechazada</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={chamberFilter}
            onValueChange={setChamberFilter}
            disabled={isProcessing}
          >
            <SelectTrigger className="w-full sm:w-[220px]">
              <SelectValue placeholder="Cámara vinculada" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sin_camara">Sin cámara vinculada</SelectItem>
              <SelectItem value="todas">Todas las solicitudes</SelectItem>
              {camaras.map((camara) => (
                <SelectItem key={camara.id} value={camara.nombre}>
                  {camara.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Select All */}
        <div className="flex items-center gap-2 py-2 border-b">
          <Checkbox
            id="select-all"
            checked={allSelected}
            onCheckedChange={handleSelectAll}
            disabled={isProcessing || items.length === 0}
          />
          <label
            htmlFor="select-all"
            className="text-sm font-medium cursor-pointer"
          >
            Seleccionar todo ({items.length} solicitudes)
          </label>
        </div>

        {/* Tabla */}
        <ScrollArea className="flex-1 min-h-0 border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead className="w-[180px]">NIT</TableHead>
                <TableHead className="w-[180px]">Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    <p className="text-muted-foreground">
                      No hay solicitudes que coincidan con los filtros.
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item) => (
                  <TableRow key={item.solicitud.id}>
                    <TableCell>
                      <Checkbox
                        checked={item.selected}
                        onCheckedChange={(checked) =>
                          handleSelectItem(item.solicitud.id, checked as boolean)
                        }
                        disabled={isProcessing || item.status === 'searching'}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      {item.solicitud.nombres_apellidos}
                    </TableCell>
                    <TableCell>
                      {item.editingNit ? (
                        <div className="flex items-center gap-1">
                          <Input
                            value={item.tempNit}
                            onChange={(e) =>
                              handleNitChange(item.solicitud.id, e.target.value)
                            }
                            className="h-8 w-28"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleSaveNit(item.solicitud.id);
                              } else if (e.key === 'Escape') {
                                handleCancelNit(item.solicitud.id);
                              }
                            }}
                          />
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            onClick={() => handleSaveNit(item.solicitud.id)}
                          >
                            <Check className="h-4 w-4 text-success" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            onClick={() => handleCancelNit(item.solicitud.id)}
                          >
                            <X className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <span
                            className={
                              item.tempNit !== item.solicitud.nit_empresa
                                ? 'text-primary font-medium'
                                : ''
                            }
                          >
                            {item.tempNit}
                          </span>
                          {(item.status === 'not_found' ||
                            item.status === 'idle') && (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-6 w-6"
                              onClick={() => handleEditNit(item.solicitud.id)}
                              disabled={isProcessing}
                            >
                              <Edit2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(item)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </ScrollArea>

        {/* Progress Bar */}
        {isProcessing && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Progreso</span>
              <span>
                {progress.current}/{progress.total} completados
              </span>
            </div>
            <Progress
              value={(progress.current / progress.total) * 100}
              className="h-2"
            />
          </div>
        )}

        {/* Footer */}
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-4 border-t">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isProcessing}
          >
            {isProcessing ? 'Procesando...' : 'Cerrar'}
          </Button>
          <Button
            onClick={handleBulkSearch}
            disabled={selectedCount === 0 || isProcessing}
            className="gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Buscando...
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                Buscar Seleccionados ({selectedCount})
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
