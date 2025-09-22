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
      campaigns: {
        Row: {
          created_at: string | null
          created_by: string
          description: string | null
          failed_sends: number | null
          id: string
          name: string
          scheduled_at: string | null
          sent_at: string | null
          status: string | null
          successful_sends: number | null
          target_clients: string[] | null
          template_id: string | null
          total_recipients: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          description?: string | null
          failed_sends?: number | null
          id?: string
          name: string
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string | null
          successful_sends?: number | null
          target_clients?: string[] | null
          template_id?: string | null
          total_recipients?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          description?: string | null
          failed_sends?: number | null
          id?: string
          name?: string
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string | null
          successful_sends?: number | null
          target_clients?: string[] | null
          template_id?: string | null
          total_recipients?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "message_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          company_name: string | null
          contact_email: string | null
          created_at: string | null
          id: string
          industry: string | null
          notes: string | null
          onboarded_at: string | null
          onboarding_status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          company_name?: string | null
          contact_email?: string | null
          created_at?: string | null
          id?: string
          industry?: string | null
          notes?: string | null
          onboarded_at?: string | null
          onboarding_status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          company_name?: string | null
          contact_email?: string | null
          created_at?: string | null
          id?: string
          industry?: string | null
          notes?: string | null
          onboarded_at?: string | null
          onboarding_status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      message_templates: {
        Row: {
          category: string | null
          content: string
          created_at: string | null
          created_by: string
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
          variables: Json | null
        }
        Insert: {
          category?: string | null
          content: string
          created_at?: string | null
          created_by: string
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
          variables?: Json | null
        }
        Update: {
          category?: string | null
          content?: string
          created_at?: string | null
          created_by?: string
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
          variables?: Json | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          created_at: string | null
          delivered_at: string | null
          from_user_id: string
          id: string
          message_type: string | null
          read_at: string | null
          sent_at: string | null
          status: string | null
          to_client_id: string
          whatsapp_connection_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          delivered_at?: string | null
          from_user_id: string
          id?: string
          message_type?: string | null
          read_at?: string | null
          sent_at?: string | null
          status?: string | null
          to_client_id: string
          whatsapp_connection_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          delivered_at?: string | null
          from_user_id?: string
          id?: string
          message_type?: string | null
          read_at?: string | null
          sent_at?: string | null
          status?: string | null
          to_client_id?: string
          whatsapp_connection_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_to_client_id_fkey"
            columns: ["to_client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_whatsapp_connection_id_fkey"
            columns: ["whatsapp_connection_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_tokens: {
        Row: {
          client_data: Json | null
          client_id: string | null
          created_at: string
          created_by: string
          expires_at: string
          id: string
          token: string
          updated_at: string
          used_at: string | null
        }
        Insert: {
          client_data?: Json | null
          client_id?: string | null
          created_at?: string
          created_by: string
          expires_at: string
          id?: string
          token: string
          updated_at?: string
          used_at?: string | null
        }
        Update: {
          client_data?: Json | null
          client_id?: string | null
          created_at?: string
          created_by?: string
          expires_at?: string
          id?: string
          token?: string
          updated_at?: string
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_tokens_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          full_name: string | null
          id: string
          phone_number: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          full_name?: string | null
          id?: string
          phone_number?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          full_name?: string | null
          id?: string
          phone_number?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      whatsapp_connections: {
        Row: {
          client_id: string | null
          connected_at: string | null
          created_at: string | null
          disconnected_at: string | null
          id: string
          is_active: boolean | null
          phone_number: string
          session_data: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          client_id?: string | null
          connected_at?: string | null
          created_at?: string | null
          disconnected_at?: string | null
          id?: string
          is_active?: boolean | null
          phone_number: string
          session_data?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          client_id?: string | null
          connected_at?: string | null
          created_at?: string | null
          disconnected_at?: string | null
          id?: string
          is_active?: boolean | null
          phone_number?: string
          session_data?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_connections_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_onboarding_token: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_role: {
        Args: { user_uuid: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      use_onboarding_token: {
        Args: { token_input: string }
        Returns: string
      }
    }
    Enums: {
      app_role: "admin" | "client"
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
      app_role: ["admin", "client"],
    },
  },
} as const
