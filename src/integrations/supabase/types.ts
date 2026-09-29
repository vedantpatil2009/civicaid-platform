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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      city_alerts: {
        Row: {
          created_at: string
          ends_at: string | null
          id: string
          is_active: boolean
          message: string
          severity: string
          starts_at: string
          title: string
          ward_number: number | null
        }
        Insert: {
          created_at?: string
          ends_at?: string | null
          id?: string
          is_active?: boolean
          message: string
          severity?: string
          starts_at?: string
          title: string
          ward_number?: number | null
        }
        Update: {
          created_at?: string
          ends_at?: string | null
          id?: string
          is_active?: boolean
          message?: string
          severity?: string
          starts_at?: string
          title?: string
          ward_number?: number | null
        }
        Relationships: []
      }
      complaint_updates: {
        Row: {
          complaint_id: string
          created_at: string
          created_by: string | null
          id: string
          note: string | null
          status: Database["public"]["Enums"]["complaint_status"]
        }
        Insert: {
          complaint_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          note?: string | null
          status: Database["public"]["Enums"]["complaint_status"]
        }
        Update: {
          complaint_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          note?: string | null
          status?: Database["public"]["Enums"]["complaint_status"]
        }
        Relationships: [
          {
            foreignKeyName: "complaint_updates_complaint_id_fkey"
            columns: ["complaint_id"]
            isOneToOne: false
            referencedRelation: "complaint_map_points"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "complaint_updates_complaint_id_fkey"
            columns: ["complaint_id"]
            isOneToOne: false
            referencedRelation: "complaints"
            referencedColumns: ["id"]
          },
        ]
      }
      complaints: {
        Row: {
          address: string | null
          category: string
          citizen_id: string | null
          created_at: string
          department_id: string | null
          description: string
          id: string
          latitude: number | null
          longitude: number | null
          photo_url: string | null
          priority: Database["public"]["Enums"]["complaint_priority"]
          reference_code: string
          resolution_notes: string | null
          resolved_at: string | null
          status: Database["public"]["Enums"]["complaint_status"]
          title: string
          updated_at: string
          upvotes: number
          ward_number: number | null
        }
        Insert: {
          address?: string | null
          category: string
          citizen_id?: string | null
          created_at?: string
          department_id?: string | null
          description: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          photo_url?: string | null
          priority?: Database["public"]["Enums"]["complaint_priority"]
          reference_code?: string
          resolution_notes?: string | null
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["complaint_status"]
          title: string
          updated_at?: string
          upvotes?: number
          ward_number?: number | null
        }
        Update: {
          address?: string | null
          category?: string
          citizen_id?: string | null
          created_at?: string
          department_id?: string | null
          description?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          photo_url?: string | null
          priority?: Database["public"]["Enums"]["complaint_priority"]
          reference_code?: string
          resolution_notes?: string | null
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["complaint_status"]
          title?: string
          updated_at?: string
          upvotes?: number
          ward_number?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "complaints_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          code: string
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          target_hours: number
        }
        Insert: {
          code: string
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          target_hours?: number
        }
        Update: {
          code?: string
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          target_hours?: number
        }
        Relationships: []
      }
      facilities: {
        Row: {
          id: string
          latitude: number
          longitude: number
          name: string
          phone: string | null
          type: string
          ward_number: number | null
        }
        Insert: {
          id?: string
          latitude: number
          longitude: number
          name: string
          phone?: string | null
          type: string
          ward_number?: number | null
        }
        Update: {
          id?: string
          latitude?: number
          longitude?: number
          name?: string
          phone?: string | null
          type?: string
          ward_number?: number | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          complaint_id: string | null
          created_at: string
          id: string
          is_read: boolean
          message: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          complaint_id?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          title: string
          type?: string
          user_id: string
        }
        Update: {
          complaint_id?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_complaint_id_fkey"
            columns: ["complaint_id"]
            isOneToOne: false
            referencedRelation: "complaint_map_points"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_complaint_id_fkey"
            columns: ["complaint_id"]
            isOneToOne: false
            referencedRelation: "complaints"
            referencedColumns: ["id"]
          },
        ]
      }
      pollution: {
        Row: {
          aqi: number
          co: number | null
          id: string
          latitude: number | null
          longitude: number | null
          no2: number | null
          pm10: number | null
          pm25: number | null
          recorded_at: string
          so2: number | null
          station: string
          ward_number: number | null
        }
        Insert: {
          aqi: number
          co?: number | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          no2?: number | null
          pm10?: number | null
          pm25?: number | null
          recorded_at?: string
          so2?: number | null
          station: string
          ward_number?: number | null
        }
        Update: {
          aqi?: number
          co?: number | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          no2?: number | null
          pm10?: number | null
          pm25?: number | null
          recorded_at?: string
          so2?: number | null
          station?: string
          ward_number?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string
          id: string
          phone: string | null
          updated_at: string
          ward_number: number | null
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id: string
          phone?: string | null
          updated_at?: string
          ward_number?: number | null
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          phone?: string | null
          updated_at?: string
          ward_number?: number | null
        }
        Relationships: []
      }
      traffic: {
        Row: {
          avg_speed_kph: number
          capacity: number
          corridor: string
          id: string
          incident_count: number
          latitude: number | null
          longitude: number | null
          recorded_at: string
          vehicle_count: number
          ward_number: number | null
        }
        Insert: {
          avg_speed_kph?: number
          capacity?: number
          corridor: string
          id?: string
          incident_count?: number
          latitude?: number | null
          longitude?: number | null
          recorded_at?: string
          vehicle_count?: number
          ward_number?: number | null
        }
        Update: {
          avg_speed_kph?: number
          capacity?: number
          corridor?: string
          id?: string
          incident_count?: number
          latitude?: number | null
          longitude?: number | null
          recorded_at?: string
          vehicle_count?: number
          ward_number?: number | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      ward_information: {
        Row: {
          area_sq_km: number | null
          councillor_name: string | null
          created_at: string
          households: number | null
          id: string
          latitude: number
          longitude: number
          office_email: string | null
          office_phone: string | null
          population: number | null
          ward_name: string
          ward_number: number
          zone: string | null
        }
        Insert: {
          area_sq_km?: number | null
          councillor_name?: string | null
          created_at?: string
          households?: number | null
          id?: string
          latitude: number
          longitude: number
          office_email?: string | null
          office_phone?: string | null
          population?: number | null
          ward_name: string
          ward_number: number
          zone?: string | null
        }
        Update: {
          area_sq_km?: number | null
          councillor_name?: string | null
          created_at?: string
          households?: number | null
          id?: string
          latitude?: number
          longitude?: number
          office_email?: string | null
          office_phone?: string | null
          population?: number | null
          ward_name?: string
          ward_number?: number
          zone?: string | null
        }
        Relationships: []
      }
      weather: {
        Row: {
          condition: string
          feels_like_c: number | null
          humidity: number | null
          id: string
          rainfall_mm: number
          recorded_at: string
          temperature_c: number
          ward_number: number | null
          wind_kph: number | null
        }
        Insert: {
          condition?: string
          feels_like_c?: number | null
          humidity?: number | null
          id?: string
          rainfall_mm?: number
          recorded_at?: string
          temperature_c: number
          ward_number?: number | null
          wind_kph?: number | null
        }
        Update: {
          condition?: string
          feels_like_c?: number | null
          humidity?: number | null
          id?: string
          rainfall_mm?: number
          recorded_at?: string
          temperature_c?: number
          ward_number?: number | null
          wind_kph?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      complaint_map_points: {
        Row: {
          category: string | null
          created_at: string | null
          id: string | null
          latitude: number | null
          longitude: number | null
          priority: Database["public"]["Enums"]["complaint_priority"] | null
          reference_code: string | null
          status: Database["public"]["Enums"]["complaint_status"] | null
          ward_number: number | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          id?: string | null
          latitude?: number | null
          longitude?: number | null
          priority?: Database["public"]["Enums"]["complaint_priority"] | null
          reference_code?: string | null
          status?: Database["public"]["Enums"]["complaint_status"] | null
          ward_number?: number | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          id?: string | null
          latitude?: number | null
          longitude?: number | null
          priority?: Database["public"]["Enums"]["complaint_priority"] | null
          reference_code?: string | null
          status?: Database["public"]["Enums"]["complaint_status"] | null
          ward_number?: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "citizen" | "staff" | "admin"
      complaint_priority: "low" | "medium" | "high" | "critical"
      complaint_status:
        | "pending"
        | "assigned"
        | "in_progress"
        | "resolved"
        | "rejected"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["citizen", "staff", "admin"],
      complaint_priority: ["low", "medium", "high", "critical"],
      complaint_status: [
        "pending",
        "assigned",
        "in_progress",
        "resolved",
        "rejected",
      ],
    },
  },
} as const
