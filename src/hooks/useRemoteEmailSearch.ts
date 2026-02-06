// Archivo de compatibilidad - redirige a useRemoteSearch
// Este hook se activa para búsquedas por email, nombre, apellido o documento

import { useRemoteSearch } from './useRemoteSearch';

export function useRemoteEmailSearch(term: string) {
  // Usamos 0 como localFilteredCount para que siempre busque cuando hay 4+ chars
  return useRemoteSearch(term, 0);
}

export type { RemoteSolicitud } from './useRemoteSearch';
