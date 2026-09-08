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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      ambassador_applications: {
        Row: {
          apparel_photo_url: string | null
          day_job_photo_url: string | null
          day_job_title: string
          display_name: string | null
          id: string
          is_fictional: boolean
          park: string
          park_id: string | null
          reviewed_at: string | null
          reviewer_note: string | null
          status: string
          submitted_at: string
          user_id: string | null
          why_trust_me_text: string | null
          why_trust_me_video_url: string | null
        }
        Insert: {
          apparel_photo_url?: string | null
          day_job_photo_url?: string | null
          day_job_title: string
          display_name?: string | null
          id?: string
          is_fictional?: boolean
          park: string
          park_id?: string | null
          reviewed_at?: string | null
          reviewer_note?: string | null
          status?: string
          submitted_at?: string
          user_id?: string | null
          why_trust_me_text?: string | null
          why_trust_me_video_url?: string | null
        }
        Update: {
          apparel_photo_url?: string | null
          day_job_photo_url?: string | null
          day_job_title?: string
          display_name?: string | null
          id?: string
          is_fictional?: boolean
          park?: string
          park_id?: string | null
          reviewed_at?: string | null
          reviewer_note?: string | null
          status?: string
          submitted_at?: string
          user_id?: string | null
          why_trust_me_text?: string | null
          why_trust_me_video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ambassador_applications_park_id_fkey"
            columns: ["park_id"]
            isOneToOne: false
            referencedRelation: "parks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ambassador_applications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      legends: {
        Row: {
          achievement_text: string | null
          created_at: string
          id: string
          is_fictional: boolean
          monument_image_url: string | null
          name: string
          park_id: string
          position: string
        }
        Insert: {
          achievement_text?: string | null
          created_at?: string
          id?: string
          is_fictional?: boolean
          monument_image_url?: string | null
          name: string
          park_id: string
          position: string
        }
        Update: {
          achievement_text?: string | null
          created_at?: string
          id?: string
          is_fictional?: boolean
          monument_image_url?: string | null
          name?: string
          park_id?: string
          position?: string
        }
        Relationships: [
          {
            foreignKeyName: "legends_park_id_fkey"
            columns: ["park_id"]
            isOneToOne: false
            referencedRelation: "parks"
            referencedColumns: ["id"]
          },
        ]
      }
      parks: {
        Row: {
          created_at: string
          crest_image_url: string | null
          display_name: string
          id: string
          mascot_name: string | null
          primary_color: string | null
          secondary_color: string | null
          slug: string
          state: string | null
          status: string
          text_color: string | null
        }
        Insert: {
          created_at?: string
          crest_image_url?: string | null
          display_name: string
          id?: string
          mascot_name?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          slug: string
          state?: string | null
          status?: string
          text_color?: string | null
        }
        Update: {
          created_at?: string
          crest_image_url?: string | null
          display_name?: string
          id?: string
          mascot_name?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          slug?: string
          state?: string | null
          status?: string
          text_color?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          chosen_park: Database["public"]["Enums"]["park_choice"] | null
          created_at: string
          display_name: string
          fan_tier: string | null
          favorite_park: string | null
          id: string
          is_admin: boolean
          role: Database["public"]["Enums"]["member_role"] | null
        }
        Insert: {
          chosen_park?: Database["public"]["Enums"]["park_choice"] | null
          created_at?: string
          display_name?: string
          fan_tier?: string | null
          favorite_park?: string | null
          id: string
          is_admin?: boolean
          role?: Database["public"]["Enums"]["member_role"] | null
        }
        Update: {
          chosen_park?: Database["public"]["Enums"]["park_choice"] | null
          created_at?: string
          display_name?: string
          fan_tier?: string | null
          favorite_park?: string | null
          id?: string
          is_admin?: boolean
          role?: Database["public"]["Enums"]["member_role"] | null
        }
        Relationships: []
      }
      roster_players: {
        Row: {
          created_at: string
          id: string
          is_fictional: boolean
          jersey_number: number | null
          name: string
          park_id: string
          portrait_image_url: string | null
          position: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_fictional?: boolean
          jersey_number?: number | null
          name: string
          park_id: string
          portrait_image_url?: string | null
          position: string
        }
        Update: {
          created_at?: string
          id?: string
          is_fictional?: boolean
          jersey_number?: number | null
          name?: string
          park_id?: string
          portrait_image_url?: string | null
          position?: string
        }
        Relationships: [
          {
            foreignKeyName: "roster_players_park_id_fkey"
            columns: ["park_id"]
            isOneToOne: false
            referencedRelation: "parks"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          environment: string
          id: string
          price_id: string
          product_id: string
          status: string
          stripe_customer_id: string
          stripe_subscription_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          environment?: string
          id?: string
          price_id: string
          product_id: string
          status?: string
          stripe_customer_id: string
          stripe_subscription_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          environment?: string
          id?: string
          price_id?: string
          product_id?: string
          status?: string
          stripe_customer_id?: string
          stripe_subscription_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_active_subscription: {
        Args: { check_env?: string; user_uuid: string }
        Returns: boolean
      }
    }
    Enums: {
      member_role: "player" | "ambassador" | "fan"
      park_choice: "lorenzi_park_lyons" | "paseo_verde_park_panthers"
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
      member_role: ["player", "ambassador", "fan"],
      park_choice: ["lorenzi_park_lyons", "paseo_verde_park_panthers"],
    },
  },
} as const
