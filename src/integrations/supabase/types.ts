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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      chatbot_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          metadata: Json | null
          role: string
          session_id: string
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          metadata?: Json | null
          role: string
          session_id: string
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          role?: string
          session_id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      emergency_alerts: {
        Row: {
          alert_type: string
          authority_notified: boolean | null
          coordinates: Json | null
          created_at: string
          driver_name: string
          helpline_notified: boolean | null
          id: string
          location: string
          notes: string | null
          resolved_at: string | null
          resolved_by: string | null
          speed_data: Json | null
          status: string | null
          user_id: string | null
          vehicle_number: string
          warning_count: number | null
        }
        Insert: {
          alert_type: string
          authority_notified?: boolean | null
          coordinates?: Json | null
          created_at?: string
          driver_name: string
          helpline_notified?: boolean | null
          id?: string
          location: string
          notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          speed_data?: Json | null
          status?: string | null
          user_id?: string | null
          vehicle_number: string
          warning_count?: number | null
        }
        Update: {
          alert_type?: string
          authority_notified?: boolean | null
          coordinates?: Json | null
          created_at?: string
          driver_name?: string
          helpline_notified?: boolean | null
          id?: string
          location?: string
          notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          speed_data?: Json | null
          status?: string | null
          user_id?: string | null
          vehicle_number?: string
          warning_count?: number | null
        }
        Relationships: []
      }
      emergency_centers: {
        Row: {
          address: string
          coordinates: Json | null
          created_at: string
          id: string
          is_active: boolean | null
          name: string
          phone: string
          type: string
        }
        Insert: {
          address: string
          coordinates?: Json | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          name: string
          phone: string
          type: string
        }
        Update: {
          address?: string
          coordinates?: Json | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          name?: string
          phone?: string
          type?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          phone: string | null
          updated_at: string
          user_id: string
          vehicle_number: string | null
          vehicle_type: string | null
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
          vehicle_number?: string | null
          vehicle_type?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
          vehicle_number?: string | null
          vehicle_type?: string | null
        }
        Relationships: []
      }
      route_emergency_centers: {
        Row: {
          distance_km: number
          emergency_center_id: string
          id: string
          route_id: string
        }
        Insert: {
          distance_km?: number
          emergency_center_id: string
          id?: string
          route_id: string
        }
        Update: {
          distance_km?: number
          emergency_center_id?: string
          id?: string
          route_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "route_emergency_centers_emergency_center_id_fkey"
            columns: ["emergency_center_id"]
            isOneToOne: false
            referencedRelation: "emergency_centers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "route_emergency_centers_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
        ]
      }
      route_toll_plazas: {
        Row: {
          id: string
          route_id: string
          sequence_order: number
          toll_plaza_id: string
        }
        Insert: {
          id?: string
          route_id: string
          sequence_order?: number
          toll_plaza_id: string
        }
        Update: {
          id?: string
          route_id?: string
          sequence_order?: number
          toll_plaza_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "route_toll_plazas_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "route_toll_plazas_toll_plaza_id_fkey"
            columns: ["toll_plaza_id"]
            isOneToOne: false
            referencedRelation: "toll_plazas"
            referencedColumns: ["id"]
          },
        ]
      }
      routes: {
        Row: {
          created_at: string
          destination: string
          distance_km: number
          estimated_time_mins: number
          id: string
          is_active: boolean | null
          name: string
          route_coordinates: Json | null
          source: string
          traffic_level: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          destination: string
          distance_km: number
          estimated_time_mins: number
          id?: string
          is_active?: boolean | null
          name: string
          route_coordinates?: Json | null
          source: string
          traffic_level?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          destination?: string
          distance_km?: number
          estimated_time_mins?: number
          id?: string
          is_active?: boolean | null
          name?: string
          route_coordinates?: Json | null
          source?: string
          traffic_level?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      speed_logs: {
        Row: {
          coordinates: Json | null
          current_speed: number
          id: string
          is_overspeeding: boolean | null
          location: string
          recorded_at: string
          road_type: string
          speed_limit: number
          user_id: string
          vehicle_number: string
          warning_issued: boolean | null
        }
        Insert: {
          coordinates?: Json | null
          current_speed: number
          id?: string
          is_overspeeding?: boolean | null
          location: string
          recorded_at?: string
          road_type: string
          speed_limit: number
          user_id: string
          vehicle_number: string
          warning_issued?: boolean | null
        }
        Update: {
          coordinates?: Json | null
          current_speed?: number
          id?: string
          is_overspeeding?: boolean | null
          location?: string
          recorded_at?: string
          road_type?: string
          speed_limit?: number
          user_id?: string
          vehicle_number?: string
          warning_issued?: boolean | null
        }
        Relationships: []
      }
      toll_plazas: {
        Row: {
          coordinates: Json | null
          cost_bus: number
          cost_car: number
          cost_motorcycle: number
          cost_truck: number
          created_at: string
          id: string
          is_active: boolean | null
          location: string
          name: string
        }
        Insert: {
          coordinates?: Json | null
          cost_bus?: number
          cost_car?: number
          cost_motorcycle?: number
          cost_truck?: number
          created_at?: string
          id?: string
          is_active?: boolean | null
          location: string
          name: string
        }
        Update: {
          coordinates?: Json | null
          cost_bus?: number
          cost_car?: number
          cost_motorcycle?: number
          cost_truck?: number
          created_at?: string
          id?: string
          is_active?: boolean | null
          location?: string
          name?: string
        }
        Relationships: []
      }
      traffic_data: {
        Row: {
          alert_type: string | null
          created_at: string
          delay_minutes: number | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          location: string
          message: string | null
          route_id: string | null
          severity: string | null
          traffic_level: string
        }
        Insert: {
          alert_type?: string | null
          created_at?: string
          delay_minutes?: number | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          location: string
          message?: string | null
          route_id?: string | null
          severity?: string | null
          traffic_level: string
        }
        Update: {
          alert_type?: string | null
          created_at?: string
          delay_minutes?: number | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          location?: string
          message?: string | null
          route_id?: string | null
          severity?: string | null
          traffic_level?: string
        }
        Relationships: [
          {
            foreignKeyName: "traffic_data_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          assigned_at: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          assigned_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          assigned_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          ip_address: string | null
          is_active: boolean | null
          last_activity: string | null
          session_token: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          ip_address?: string | null
          is_active?: boolean | null
          last_activity?: string | null
          session_token: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          ip_address?: string | null
          is_active?: boolean | null
          last_activity?: string | null
          session_token?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      weather_data: {
        Row: {
          advisory: string | null
          condition: string
          id: string
          is_current: boolean | null
          location: string
          recorded_at: string
          route_id: string | null
          temperature: number | null
          visibility: string | null
        }
        Insert: {
          advisory?: string | null
          condition: string
          id?: string
          is_current?: boolean | null
          location: string
          recorded_at?: string
          route_id?: string | null
          temperature?: number | null
          visibility?: string | null
        }
        Update: {
          advisory?: string | null
          condition?: string
          id?: string
          is_current?: boolean | null
          location?: string
          recorded_at?: string
          route_id?: string | null
          temperature?: number | null
          visibility?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "weather_data_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["user_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      user_role:
        | "traveller"
        | "traffic_authority"
        | "emergency_authority"
        | "admin"
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
      user_role: [
        "traveller",
        "traffic_authority",
        "emergency_authority",
        "admin",
      ],
    },
  },
} as const
