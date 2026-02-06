import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

// NOTA: Esto es un hook “quirúrgico” para resolver búsquedas que quedan por fuera
// del límite de 1000 filas que puede aplicar PostgREST.
// Solo se activa cuando el usuario escribe algo que parece un email.

export interface RemoteSolicitud {
  id: string;
  email: string;
  nombres_apellidos: string;
  numero_documento: string;
  nit_empresa: string;
  estado: "Pendiente" | "Aprobada" | "Rechazada";
  fecha_solicitud: string;
  celular?: string | null;
  cargo?: string | null;
  es_colaborador?: boolean | null;
  camara_colaborador_id?: string | null;
  genero?: string | null;
  tipo_identificacion?: string | null;
  nivel_educativo?: string | null;
  grupo_etnico?: string | null;
  fecha_nacimiento?: string | null;
  razon_rechazo?: string | null;
  camaras?: {
    id: string;
    nombre: string;
    nit: string;
  } | null;
  empresas?: {
    id: string;
    nit: string;
    nombre: string;
    sector?: string | null;
    mercado?: string | null;
    num_colaboradores?: number | null;
    camara_id?: string | null;
    camaras?: {
      id: string;
      nombre: string;
      nit: string;
    } | null;
  };
}

function looksLikeEmail(term: string) {
  const t = term.trim();
  return t.length >= 4 && t.includes("@") && t.includes(".");
}

export function useRemoteEmailSearch(term: string) {
  const enabled = useMemo(() => looksLikeEmail(term), [term]);
  const [data, setData] = useState<RemoteSolicitud[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    const handle = window.setTimeout(async () => {
      setLoading(true);
      setError(null);

      try {
        const q = term.trim().toLowerCase();

        const { data: solicitudesData, error: solicitudesError } = await supabase
          .from("solicitudes")
          .select(
            `
              id, email, nombres_apellidos, numero_documento, nit_empresa,
              estado, fecha_solicitud, celular, cargo, es_colaborador,
              camara_colaborador_id, genero, tipo_identificacion, nivel_educativo,
              grupo_etnico, fecha_nacimiento, razon_rechazo,
              camaras:camara_colaborador_id (id, nombre, nit)
            `
          )
          .ilike("email", `%${q}%`)
          .order("fecha_solicitud", { ascending: false })
          .limit(50);

        if (solicitudesError) throw solicitudesError;

        const solicitudes = (solicitudesData || []) as RemoteSolicitud[];

        // Adjuntar empresa (cuando aplica) vía consulta por NIT
        const nits = Array.from(
          new Set(
            solicitudes
              .filter((s) => !s.es_colaborador)
              .map((s) => s.nit_empresa)
              .filter(Boolean)
          )
        );

        let empresasMap = new Map<string, RemoteSolicitud["empresas"]>();

        if (nits.length > 0) {
          const { data: empresasData, error: empresasError } = await supabase
            .from("empresas")
            .select(
              `
                id, nit, nombre, sector, mercado, num_colaboradores, camara_id,
                camaras (id, nombre, nit)
              `
            )
            .in("nit", nits);

          if (empresasError) throw empresasError;

          empresasMap = new Map(
            (empresasData || []).map((e: any) => [e.nit, e as any])
          );
        }

        const merged = solicitudes.map((s) => ({
          ...s,
          empresas: s.es_colaborador ? undefined : empresasMap.get(s.nit_empresa),
        }));

        if (!cancelled) setData(merged);
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.message || "Error buscando el email");
          setData([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 350);

    return () => {
      cancelled = true;
      window.clearTimeout(handle);
    };
  }, [enabled, term]);

  return {
    enabled,
    data,
    loading,
    error,
  };
}
