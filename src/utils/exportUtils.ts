import * as XLSX from 'xlsx';
import { format } from 'date-fns';

export interface ExportField {
  key: string;
  label: string;
  category: 'minimo' | 'solicitud' | 'empresa';
}

export const MANDATORY_FIELDS: ExportField[] = [
  { key: 'nombres_apellidos', label: 'Nombre', category: 'minimo' },
  { key: 'tipo_identificacion', label: 'Tipo de documento', category: 'minimo' },
  { key: 'numero_documento', label: '# de documento', category: 'minimo' },
  { key: 'email', label: 'Correo', category: 'minimo' },
  { key: 'celular', label: 'Celular', category: 'minimo' },
  { key: 'nit_empresa', label: 'NIT', category: 'minimo' },
  { key: 'empresa_nombre', label: 'Empresa', category: 'minimo' },
  { key: 'camara_nombre', label: 'Cámara', category: 'minimo' },
  { key: 'estado', label: 'Estado Solicitud', category: 'minimo' },
  { key: 'licencia_consumida', label: 'Licencia Consumida', category: 'minimo' },
];

export const SOLICITUD_FIELDS: ExportField[] = [
  { key: 'cargo', label: 'Cargo', category: 'solicitud' },
  { key: 'nivel_educativo', label: 'Nivel educativo', category: 'solicitud' },
  { key: 'genero', label: 'Género', category: 'solicitud' },
  { key: 'grupo_etnico', label: 'Grupo étnico', category: 'solicitud' },
  { key: 'fecha_nacimiento', label: 'Fecha de nacimiento', category: 'solicitud' },
  { key: 'fecha_solicitud', label: 'Fecha de solicitud', category: 'solicitud' },
  { key: 'es_colaborador', label: 'Es colaborador', category: 'solicitud' },
  { key: 'razon_rechazo', label: 'Razón de rechazo', category: 'solicitud' },
];

export const EMPRESA_FIELDS: ExportField[] = [
  { key: 'empresas.sector', label: 'Sector', category: 'empresa' },
  { key: 'empresas.mercado', label: 'Mercado', category: 'empresa' },
  { key: 'empresas.productos_servicios', label: 'Productos/Servicios', category: 'empresa' },
  { key: 'empresas.tipo_cliente', label: 'Tipo de cliente', category: 'empresa' },
  { key: 'empresas.ventas_2024', label: 'Ventas 2024', category: 'empresa' },
  { key: 'empresas.utilidades_2024', label: 'Utilidades 2024', category: 'empresa' },
  { key: 'empresas.num_colaboradores', label: '# Colaboradores', category: 'empresa' },
  { key: 'empresas.mujeres_colaboradoras', label: '# Mujeres colaboradoras', category: 'empresa' },
  { key: 'empresas.decision_adoptar_ia', label: 'Decisión adoptar IA', category: 'empresa' },
  { key: 'empresas.invirtio_ia_2024', label: 'Invirtió en IA 2024', category: 'empresa' },
  { key: 'empresas.monto_inversion_2024', label: 'Monto inversión 2024', category: 'empresa' },
  { key: 'empresas.colaboradores_capacitados_ia', label: 'Colaboradores capacitados en IA', category: 'empresa' },
  { key: 'empresas.plan_capacitacion_ia', label: 'Plan capacitación IA', category: 'empresa' },
  { key: 'empresas.areas_implementacion_ia', label: 'Áreas implementación IA', category: 'empresa' },
  { key: 'empresas.razon_no_adopcion', label: 'Razón no adopción IA', category: 'empresa' },
  { key: 'empresas.probabilidad_adopcion_12m', label: 'Probabilidad adopción 12m', category: 'empresa' },
  { key: 'empresas.probabilidad_inversion_12m', label: 'Probabilidad inversión 12m', category: 'empresa' },
  { key: 'empresas.monto_invertir_12m', label: 'Monto a invertir 12m', category: 'empresa' },
  { key: 'empresas.asigno_recursos_ia', label: 'Asignó recursos IA', category: 'empresa' },
];

export const PLATZI_FIELDS: ExportField[] = [
  { key: 'platzi.ruta', label: 'Ruta Platzi', category: 'solicitud' },
  { key: 'platzi.estado_acceso', label: 'Estado acceso', category: 'solicitud' },
  { key: 'platzi.progreso_ruta', label: 'Progreso ruta (%)', category: 'solicitud' },
  { key: 'platzi.cursos_totales_certificados', label: 'Cursos certificados', category: 'solicitud' },
  { key: 'platzi.cursos_totales_progreso', label: 'Cursos en progreso', category: 'solicitud' },
  { key: 'platzi.tiempo_total_dedicado', label: 'Tiempo dedicado (horas)', category: 'solicitud' },
  { key: 'platzi.dias_sin_progreso', label: 'Días sin progreso', category: 'solicitud' },
];

export const getNestedValue = (obj: any, path: string): any => {
  const keys = path.split('.');
  let value = obj;
  
  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key];
    } else {
      return null;
    }
  }
  
  return value;
};

export const formatDateForExport = (date: string | Date | null): string => {
  if (!date) return '-';
  try {
    return format(new Date(date), 'dd/MM/yyyy');
  } catch {
    return '-';
  }
};

export const formatCurrencyForExport = (amount: number | null): string => {
  if (amount === null || amount === undefined) return '-';
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(amount);
};

export const formatNumberForExport = (num: number | null): string => {
  if (num === null || num === undefined) return '-';
  return new Intl.NumberFormat('es-CO').format(num);
};

export const formatDataForExport = (
  items: any[],
  selectedFields: string[],
  fieldLabels: Record<string, string>,
  dateRange?: { from: Date; to: Date },
  platziEmails?: Set<string>,
  platziData?: any[]
) => {
  let filteredItems = [...items];

  // Filtrar por rango de fechas si está definido
  if (dateRange?.from && dateRange?.to) {
    filteredItems = filteredItems.filter(item => {
      const itemDate = new Date(item.fecha_solicitud || item.created_at);
      return itemDate >= dateRange.from && itemDate <= dateRange.to;
    });
  }

  // Mapear datos según campos seleccionados
  return filteredItems.map(item => {
    const exportRow: Record<string, any> = {};

    selectedFields.forEach(field => {
      const label = fieldLabels[field] || field;
      let value;
      
      // Campos especiales que necesitan lógica personalizada
      if (field === 'empresa_nombre') {
        value = item.empresas?.nombre || item.empresa?.nombre || '-';
      } else if (field === 'camara_nombre') {
        // Para colaboradores, usar camaras directamente
        // Para empresariales, usar empresas.camaras
        value = item.camaras?.nombre || item.empresas?.camaras?.nombre || '-';
      } else if (field === 'licencia_consumida') {
        // Verificar si el email existe en platzi_general
        const email = item.email;
        if (platziEmails && email) {
          value = platziEmails.has(email.toLowerCase()) ? 'Sí' : 'No';
        } else {
          value = 'No';
        }
      } else if (field.startsWith('platzi.')) {
        // Obtener datos de Platzi para este usuario
        const email = item.email;
        if (platziData && email) {
          const userPlatziData = platziData.find(p => p.email.toLowerCase() === email.toLowerCase());
          if (userPlatziData) {
            const platziField = field.replace('platzi.', '');
            value = userPlatziData[platziField];
          } else {
            value = null;
          }
        } else {
          value = null;
        }
      } else {
        value = getNestedValue(item, field);
      }

      // Formatear según el tipo de campo
      if (field.includes('fecha_') || field.includes('_at')) {
        value = formatDateForExport(value);
      } else if (field === 'empresas.ventas_2024' || field === 'empresas.utilidades_2024') {
        // Dividir entre 100 para valores financieros almacenados multiplicados
        value = value ? formatCurrencyForExport(value / 100) : '-';
      } else if (field.includes('monto_') || field.includes('ventas_') || field.includes('utilidades_')) {
        value = formatCurrencyForExport(value);
      } else if (field.includes('num_') || field.includes('colaboradores') || field.includes('probabilidad_')) {
        value = formatNumberForExport(value);
      } else if (field === 'es_colaborador') {
        value = value ? 'Sí' : 'No';
      } else if (field === 'platzi.progreso_ruta') {
        // Convertir progreso a porcentaje
        value = value ? `${Math.round(value * 100)}%` : '-';
      } else if (field === 'platzi.tiempo_total_dedicado') {
        // Convertir segundos a horas
        value = value ? Math.round(value / 3600) : '-';
      } else if (value === null || value === undefined) {
        value = '-';
      }

      exportRow[label] = value;
    });

    return exportRow;
  });
};

export const exportToExcel = (
  data: any[],
  selectedFields: string[],
  fileName: string,
  fieldLabels: Record<string, string>,
  dateRange?: { from: Date; to: Date },
  platziEmails?: Set<string>,
  platziData?: any[]
) => {
  try {
    // Formatear datos para exportación
    const formattedData = formatDataForExport(data, selectedFields, fieldLabels, dateRange, platziEmails, platziData);

    if (formattedData.length === 0) {
      throw new Error('No hay datos para exportar con los filtros seleccionados');
    }

    // Crear workbook y worksheet
    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Datos');

    // Ajustar ancho de columnas
    const colWidths = Object.keys(formattedData[0]).map(key => ({
      wch: Math.max(key.length, 15)
    }));
    worksheet['!cols'] = colWidths;

    // Generar archivo y descargar
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName}_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    return { success: true, count: formattedData.length };
  } catch (error) {
    console.error('Error al exportar:', error);
    throw error;
  }
};

export const createFieldLabelsMap = (): Record<string, string> => {
  const map: Record<string, string> = {};
  
  [...MANDATORY_FIELDS, ...SOLICITUD_FIELDS, ...EMPRESA_FIELDS, ...PLATZI_FIELDS].forEach(field => {
    map[field.key] = field.label;
  });
  
  // Agregar mapeos adicionales para campos nested
  map['empresas.nombre'] = 'Empresa';
  map['empresa.nombre'] = 'Empresa';
  map['camaras.nombre'] = 'Cámara';
  map['empresas.camaras.nombre'] = 'Cámara';
  map['licencia_consumida'] = 'Licencia Consumida';
  
  return map;
};
