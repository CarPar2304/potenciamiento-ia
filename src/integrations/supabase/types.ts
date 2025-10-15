export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      camaras: {
        Row: {
          created_at: string
          id: string
          licencias_disponibles: number
          nit: string
          nombre: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          licencias_disponibles?: number
          nit: string
          nombre: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          licencias_disponibles?: number
          nit?: string
          nombre?: string
          updated_at?: string
        }
        Relationships: []
      }
      crm_actividades: {
        Row: {
          camara_id: string
          created_at: string
          descripcion: string
          estado: string
          fecha: string
          id: string
          notas: string | null
          tipo_actividad: string
          updated_at: string
          usuario_id: string
        }
        Insert: {
          camara_id: string
          created_at?: string
          descripcion: string
          estado?: string
          fecha?: string
          id?: string
          notas?: string | null
          tipo_actividad: string
          updated_at?: string
          usuario_id: string
        }
        Update: {
          camara_id?: string
          created_at?: string
          descripcion?: string
          estado?: string
          fecha?: string
          id?: string
          notas?: string | null
          tipo_actividad?: string
          updated_at?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_actividades_camara_id_fkey"
            columns: ["camara_id"]
            isOneToOne: false
            referencedRelation: "camaras"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          content: string | null
          embedding: string | null
          id: number
          metadata: Json | null
        }
        Insert: {
          content?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Update: {
          content?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Relationships: []
      }
      empresas: {
        Row: {
          areas_implementacion_ia: string | null
          asigno_recursos_ia: Database["public"]["Enums"]["si_no_enum"] | null
          camara_id: string | null
          colaboradores_capacitados_ia: number | null
          created_at: string
          decision_adoptar_ia: Database["public"]["Enums"]["si_no_enum"] | null
          id: string
          invirtio_ia_2024: Database["public"]["Enums"]["si_no_enum"] | null
          mercado: Database["public"]["Enums"]["mercado_enum"] | null
          monto_inversion_2024: number | null
          monto_invertir_12m: number | null
          mujeres_colaboradoras: number | null
          nit: string
          nombre: string
          num_colaboradores: number | null
          plan_capacitacion_ia: Database["public"]["Enums"]["si_no_enum"] | null
          probabilidad_adopcion_12m: number | null
          probabilidad_inversion_12m: number | null
          productos_servicios: string | null
          razon_no_adopcion: string | null
          sector: string | null
          tipo_cliente: string | null
          tipo_sociedad: string | null
          updated_at: string
          utilidades_2024: number | null
          ventas_2024: number | null
        }
        Insert: {
          areas_implementacion_ia?: string | null
          asigno_recursos_ia?: Database["public"]["Enums"]["si_no_enum"] | null
          camara_id?: string | null
          colaboradores_capacitados_ia?: number | null
          created_at?: string
          decision_adoptar_ia?: Database["public"]["Enums"]["si_no_enum"] | null
          id?: string
          invirtio_ia_2024?: Database["public"]["Enums"]["si_no_enum"] | null
          mercado?: Database["public"]["Enums"]["mercado_enum"] | null
          monto_inversion_2024?: number | null
          monto_invertir_12m?: number | null
          mujeres_colaboradoras?: number | null
          nit: string
          nombre: string
          num_colaboradores?: number | null
          plan_capacitacion_ia?:
            | Database["public"]["Enums"]["si_no_enum"]
            | null
          probabilidad_adopcion_12m?: number | null
          probabilidad_inversion_12m?: number | null
          productos_servicios?: string | null
          razon_no_adopcion?: string | null
          sector?: string | null
          tipo_cliente?: string | null
          tipo_sociedad?: string | null
          updated_at?: string
          utilidades_2024?: number | null
          ventas_2024?: number | null
        }
        Update: {
          areas_implementacion_ia?: string | null
          asigno_recursos_ia?: Database["public"]["Enums"]["si_no_enum"] | null
          camara_id?: string | null
          colaboradores_capacitados_ia?: number | null
          created_at?: string
          decision_adoptar_ia?: Database["public"]["Enums"]["si_no_enum"] | null
          id?: string
          invirtio_ia_2024?: Database["public"]["Enums"]["si_no_enum"] | null
          mercado?: Database["public"]["Enums"]["mercado_enum"] | null
          monto_inversion_2024?: number | null
          monto_invertir_12m?: number | null
          mujeres_colaboradoras?: number | null
          nit?: string
          nombre?: string
          num_colaboradores?: number | null
          plan_capacitacion_ia?:
            | Database["public"]["Enums"]["si_no_enum"]
            | null
          probabilidad_adopcion_12m?: number | null
          probabilidad_inversion_12m?: number | null
          productos_servicios?: string | null
          razon_no_adopcion?: string | null
          sector?: string | null
          tipo_cliente?: string | null
          tipo_sociedad?: string | null
          updated_at?: string
          utilidades_2024?: number | null
          ventas_2024?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "empresas_camara_id_fkey"
            columns: ["camara_id"]
            isOneToOne: false
            referencedRelation: "camaras"
            referencedColumns: ["id"]
          },
        ]
      }
      insights: {
        Row: {
          activo: boolean
          audiencia: string
          autor_id: string
          camaras_especificas: string[] | null
          color: string | null
          contenido: string
          created_at: string
          fecha_publicacion: string
          icono: string | null
          id: string
          titulo: string
          updated_at: string
        }
        Insert: {
          activo?: boolean
          audiencia: string
          autor_id: string
          camaras_especificas?: string[] | null
          color?: string | null
          contenido: string
          created_at?: string
          fecha_publicacion?: string
          icono?: string | null
          id?: string
          titulo: string
          updated_at?: string
        }
        Update: {
          activo?: boolean
          audiencia?: string
          autor_id?: string
          camaras_especificas?: string[] | null
          color?: string | null
          contenido?: string
          created_at?: string
          fecha_publicacion?: string
          icono?: string | null
          id?: string
          titulo?: string
          updated_at?: string
        }
        Relationships: []
      }
      platzi_general: {
        Row: {
          created_at: string
          cursos_totales_certificados: number | null
          cursos_totales_progreso: number | null
          dias_acceso_restantes: number | null
          dias_sin_certificar: number | null
          dias_sin_progreso: number | null
          email: string
          equipos: string | null
          estado_acceso: string | null
          fecha_expiracion_ultima_licencia: string | null
          fecha_inicio_ultima_licencia: string | null
          fecha_primera_activacion: string | null
          id: string
          nombre: string
          progreso_ruta: number | null
          ruta: string | null
          tiempo_total_dedicado: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          cursos_totales_certificados?: number | null
          cursos_totales_progreso?: number | null
          dias_acceso_restantes?: number | null
          dias_sin_certificar?: number | null
          dias_sin_progreso?: number | null
          email: string
          equipos?: string | null
          estado_acceso?: string | null
          fecha_expiracion_ultima_licencia?: string | null
          fecha_inicio_ultima_licencia?: string | null
          fecha_primera_activacion?: string | null
          id?: string
          nombre: string
          progreso_ruta?: number | null
          ruta?: string | null
          tiempo_total_dedicado?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          cursos_totales_certificados?: number | null
          cursos_totales_progreso?: number | null
          dias_acceso_restantes?: number | null
          dias_sin_certificar?: number | null
          dias_sin_progreso?: number | null
          email?: string
          equipos?: string | null
          estado_acceso?: string | null
          fecha_expiracion_ultima_licencia?: string | null
          fecha_inicio_ultima_licencia?: string | null
          fecha_primera_activacion?: string | null
          id?: string
          nombre?: string
          progreso_ruta?: number | null
          ruta?: string | null
          tiempo_total_dedicado?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "platzi_general_email_fkey"
            columns: ["email"]
            isOneToOne: true
            referencedRelation: "solicitudes"
            referencedColumns: ["email"]
          },
        ]
      }
      platzi_seguimiento: {
        Row: {
          created_at: string
          curso: string | null
          email: string
          estado_curso: string | null
          fecha_certificacion: string | null
          id_curso: string
          nombre: string
          porcentaje_avance: number | null
          ruta: string | null
          tiempo_invertido: number | null
        }
        Insert: {
          created_at?: string
          curso?: string | null
          email: string
          estado_curso?: string | null
          fecha_certificacion?: string | null
          id_curso: string
          nombre: string
          porcentaje_avance?: number | null
          ruta?: string | null
          tiempo_invertido?: number | null
        }
        Update: {
          created_at?: string
          curso?: string | null
          email?: string
          estado_curso?: string | null
          fecha_certificacion?: string | null
          id_curso?: string
          nombre?: string
          porcentaje_avance?: number | null
          ruta?: string | null
          tiempo_invertido?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "platzi_seguimiento_email_fkey"
            columns: ["email"]
            isOneToOne: false
            referencedRelation: "solicitudes"
            referencedColumns: ["email"]
          },
        ]
      }
      profiles: {
        Row: {
          camara_id: string | null
          cargo: string | null
          celular: string | null
          created_at: string
          email: string
          id: string
          is_admin: boolean
          nombre: string
          updated_at: string
        }
        Insert: {
          camara_id?: string | null
          cargo?: string | null
          celular?: string | null
          created_at?: string
          email: string
          id: string
          is_admin?: boolean
          nombre: string
          updated_at?: string
        }
        Update: {
          camara_id?: string | null
          cargo?: string | null
          celular?: string | null
          created_at?: string
          email?: string
          id?: string
          is_admin?: boolean
          nombre?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_camara_id_fkey"
            columns: ["camara_id"]
            isOneToOne: false
            referencedRelation: "camaras"
            referencedColumns: ["id"]
          },
        ]
      }
      solicitudes: {
        Row: {
          camara_colaborador_id: string | null
          cargo: string | null
          celular: string | null
          created_at: string
          email: string
          es_colaborador: boolean
          estado: Database["public"]["Enums"]["estado_solicitud_enum"] | null
          fecha_nacimiento: string | null
          fecha_solicitud: string
          genero: Database["public"]["Enums"]["genero_enum"] | null
          grupo_etnico: string | null
          id: string
          nit_empresa: string
          nivel_educativo: string | null
          nombres_apellidos: string
          numero_documento: string
          razon_rechazo: string | null
          tipo_identificacion:
            | Database["public"]["Enums"]["tipo_identificacion_enum"]
            | null
          updated_at: string
        }
        Insert: {
          camara_colaborador_id?: string | null
          cargo?: string | null
          celular?: string | null
          created_at?: string
          email: string
          es_colaborador?: boolean
          estado?: Database["public"]["Enums"]["estado_solicitud_enum"] | null
          fecha_nacimiento?: string | null
          fecha_solicitud?: string
          genero?: Database["public"]["Enums"]["genero_enum"] | null
          grupo_etnico?: string | null
          id?: string
          nit_empresa: string
          nivel_educativo?: string | null
          nombres_apellidos: string
          numero_documento: string
          razon_rechazo?: string | null
          tipo_identificacion?:
            | Database["public"]["Enums"]["tipo_identificacion_enum"]
            | null
          updated_at?: string
        }
        Update: {
          camara_colaborador_id?: string | null
          cargo?: string | null
          celular?: string | null
          created_at?: string
          email?: string
          es_colaborador?: boolean
          estado?: Database["public"]["Enums"]["estado_solicitud_enum"] | null
          fecha_nacimiento?: string | null
          fecha_solicitud?: string
          genero?: Database["public"]["Enums"]["genero_enum"] | null
          grupo_etnico?: string | null
          id?: string
          nit_empresa?: string
          nivel_educativo?: string | null
          nombres_apellidos?: string
          numero_documento?: string
          razon_rechazo?: string | null
          tipo_identificacion?:
            | Database["public"]["Enums"]["tipo_identificacion_enum"]
            | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "solicitudes_camara_colaborador_id_fkey"
            columns: ["camara_colaborador_id"]
            isOneToOne: false
            referencedRelation: "camaras"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_config: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          method: string
          name: string
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          method?: string
          name: string
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          method?: string
          name?: string
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      binary_quantize: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      get_chamber_by_email: {
        Args: { user_email: string }
        Returns: string
      }
      get_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      halfvec_avg: {
        Args: { "": number[] }
        Returns: unknown
      }
      halfvec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      halfvec_send: {
        Args: { "": unknown }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      has_approved_request: {
        Args: { user_email: string }
        Returns: boolean
      }
      hnsw_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnswhandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflathandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      l2_norm: {
        Args: { "": unknown } | { "": unknown }
        Returns: number
      }
      l2_normalize: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: unknown
      }
      match_documents: {
        Args: { filter?: Json; match_count?: number; query_embedding: string }
        Returns: {
          content: string
          id: number
          metadata: Json
          similarity: number
        }[]
      }
      set_user_admin: {
        Args: { admin_status: boolean; user_id: string }
        Returns: undefined
      }
      sparsevec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      sparsevec_send: {
        Args: { "": unknown }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      sync_platzi_with_solicitudes: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      vector_avg: {
        Args: { "": number[] }
        Returns: string
      }
      vector_dims: {
        Args: { "": string } | { "": unknown }
        Returns: number
      }
      vector_norm: {
        Args: { "": string }
        Returns: number
      }
      vector_out: {
        Args: { "": string }
        Returns: unknown
      }
      vector_send: {
        Args: { "": string }
        Returns: string
      }
      vector_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
    }
    Enums: {
      estado_solicitud_enum: "Pendiente" | "Aprobada" | "Rechazada"
      genero_enum: "Hombre" | "Mujer" | "No Binario" | "Prefiero no especificar"
      mercado_enum:
        | "Local (ciudad/municipio)"
        | "Regional (departamento / región del país)"
        | "Nacional"
        | "Internacional"
      si_no_enum: "Sí" | "No"
      tipo_identificacion_enum:
        | "Cédula de Ciudadanía"
        | "Cédula de Extranjería"
        | "Pasaporte"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      estado_solicitud_enum: ["Pendiente", "Aprobada", "Rechazada"],
      genero_enum: ["Hombre", "Mujer", "No Binario", "Prefiero no especificar"],
      mercado_enum: [
        "Local (ciudad/municipio)",
        "Regional (departamento / región del país)",
        "Nacional",
        "Internacional",
      ],
      si_no_enum: ["Sí", "No"],
      tipo_identificacion_enum: [
        "Cédula de Ciudadanía",
        "Cédula de Extranjería",
        "Pasaporte",
      ],
    },
  },
} as const
