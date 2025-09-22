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
      empresas: {
        Row: {
          areas_implementacion_ia: string | null
          asigno_recursos_ia: boolean | null
          camara_id: string | null
          colaboradores_capacitados_ia: number | null
          created_at: string
          decision_adoptar_ia: boolean | null
          id: string
          invirtio_ia_2024: boolean | null
          mercado: Database["public"]["Enums"]["mercado_enum"] | null
          monto_inversion_2024: number | null
          monto_invertir_12m: number | null
          mujeres_colaboradoras: number | null
          nit: string
          nombre: string
          num_colaboradores: number | null
          plan_capacitacion_ia: boolean | null
          probabilidad_adopcion_12m: number | null
          probabilidad_inversion_12m: number | null
          productos_servicios: string | null
          razon_no_adopcion: string | null
          sector: string | null
          tipo_cliente: string | null
          updated_at: string
          utilidades_2024: number | null
          ventas_2024: number | null
        }
        Insert: {
          areas_implementacion_ia?: string | null
          asigno_recursos_ia?: boolean | null
          camara_id?: string | null
          colaboradores_capacitados_ia?: number | null
          created_at?: string
          decision_adoptar_ia?: boolean | null
          id?: string
          invirtio_ia_2024?: boolean | null
          mercado?: Database["public"]["Enums"]["mercado_enum"] | null
          monto_inversion_2024?: number | null
          monto_invertir_12m?: number | null
          mujeres_colaboradoras?: number | null
          nit: string
          nombre: string
          num_colaboradores?: number | null
          plan_capacitacion_ia?: boolean | null
          probabilidad_adopcion_12m?: number | null
          probabilidad_inversion_12m?: number | null
          productos_servicios?: string | null
          razon_no_adopcion?: string | null
          sector?: string | null
          tipo_cliente?: string | null
          updated_at?: string
          utilidades_2024?: number | null
          ventas_2024?: number | null
        }
        Update: {
          areas_implementacion_ia?: string | null
          asigno_recursos_ia?: boolean | null
          camara_id?: string | null
          colaboradores_capacitados_ia?: number | null
          created_at?: string
          decision_adoptar_ia?: boolean | null
          id?: string
          invirtio_ia_2024?: boolean | null
          mercado?: Database["public"]["Enums"]["mercado_enum"] | null
          monto_inversion_2024?: number | null
          monto_invertir_12m?: number | null
          mujeres_colaboradoras?: number | null
          nit?: string
          nombre?: string
          num_colaboradores?: number | null
          plan_capacitacion_ia?: boolean | null
          probabilidad_adopcion_12m?: number | null
          probabilidad_inversion_12m?: number | null
          productos_servicios?: string | null
          razon_no_adopcion?: string | null
          sector?: string | null
          tipo_cliente?: string | null
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
          estado_curso: Database["public"]["Enums"]["estado_curso_enum"] | null
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
          estado_curso?: Database["public"]["Enums"]["estado_curso_enum"] | null
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
          estado_curso?: Database["public"]["Enums"]["estado_curso_enum"] | null
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
          autorizacion_datos: boolean
          cargo: string | null
          celular: string | null
          created_at: string
          email: string
          estado: Database["public"]["Enums"]["estado_solicitud_enum"] | null
          fecha_nacimiento: string | null
          fecha_solicitud: string
          genero: Database["public"]["Enums"]["genero_enum"] | null
          grupo_etnico: Database["public"]["Enums"]["grupo_etnico_enum"] | null
          id: string
          nit_empresa: string
          nivel_educativo: string | null
          nombres_apellidos: string
          numero_documento: string
          tipo_identificacion:
            | Database["public"]["Enums"]["tipo_identificacion_enum"]
            | null
          updated_at: string
        }
        Insert: {
          autorizacion_datos?: boolean
          cargo?: string | null
          celular?: string | null
          created_at?: string
          email: string
          estado?: Database["public"]["Enums"]["estado_solicitud_enum"] | null
          fecha_nacimiento?: string | null
          fecha_solicitud?: string
          genero?: Database["public"]["Enums"]["genero_enum"] | null
          grupo_etnico?: Database["public"]["Enums"]["grupo_etnico_enum"] | null
          id?: string
          nit_empresa: string
          nivel_educativo?: string | null
          nombres_apellidos: string
          numero_documento: string
          tipo_identificacion?:
            | Database["public"]["Enums"]["tipo_identificacion_enum"]
            | null
          updated_at?: string
        }
        Update: {
          autorizacion_datos?: boolean
          cargo?: string | null
          celular?: string | null
          created_at?: string
          email?: string
          estado?: Database["public"]["Enums"]["estado_solicitud_enum"] | null
          fecha_nacimiento?: string | null
          fecha_solicitud?: string
          genero?: Database["public"]["Enums"]["genero_enum"] | null
          grupo_etnico?: Database["public"]["Enums"]["grupo_etnico_enum"] | null
          id?: string
          nit_empresa?: string
          nivel_educativo?: string | null
          nombres_apellidos?: string
          numero_documento?: string
          tipo_identificacion?:
            | Database["public"]["Enums"]["tipo_identificacion_enum"]
            | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_chamber_by_email: {
        Args: { user_email: string }
        Returns: string
      }
      get_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      has_approved_request: {
        Args: { user_email: string }
        Returns: boolean
      }
      set_user_admin: {
        Args: { admin_status: boolean; user_id: string }
        Returns: undefined
      }
      sync_platzi_with_solicitudes: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      estado_curso_enum: "En_progreso" | "Completado" | "Certificado"
      estado_solicitud_enum: "Pendiente" | "Aprobada" | "Rechazada"
      genero_enum: "Hombre" | "Mujer" | "No Binario"
      grupo_etnico_enum:
        | "Indígena"
        | "Gitano(a) o Rrom"
        | "Raizal de San Andrés y Providencia"
        | "Palenquero(a) de San Basilio"
        | "Negro(a), mulato(a), afrodescendiente, afrocolombiano(a)"
        | "Ningún grupo étnico"
      mercado_enum: "Local" | "Nacional" | "Internacional"
      tipo_identificacion_enum:
        | "Tarjeta_Identidad"
        | "Cedula_Ciudadania"
        | "Cedula_Extranjeria"
        | "Pasaporte"
        | "Permiso_Permanencia_Temporal"
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
      estado_curso_enum: ["En_progreso", "Completado", "Certificado"],
      estado_solicitud_enum: ["Pendiente", "Aprobada", "Rechazada"],
      genero_enum: ["Hombre", "Mujer", "No Binario"],
      grupo_etnico_enum: [
        "Indígena",
        "Gitano(a) o Rrom",
        "Raizal de San Andrés y Providencia",
        "Palenquero(a) de San Basilio",
        "Negro(a), mulato(a), afrodescendiente, afrocolombiano(a)",
        "Ningún grupo étnico",
      ],
      mercado_enum: ["Local", "Nacional", "Internacional"],
      tipo_identificacion_enum: [
        "Tarjeta_Identidad",
        "Cedula_Ciudadania",
        "Cedula_Extranjeria",
        "Pasaporte",
        "Permiso_Permanencia_Temporal",
      ],
    },
  },
} as const
