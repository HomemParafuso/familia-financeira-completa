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
      audit_logs: {
        Row: {
          action: string
          created_at: string
          family_id: string | null
          id: string
          new_data: Json | null
          old_data: Json | null
          record_id: string | null
          table_name: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          family_id?: string | null
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          family_id?: string | null
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          color: string | null
          created_at: string
          expense_group: Database["public"]["Enums"]["expense_group"] | null
          family_id: string
          icon: string | null
          id: string
          is_default: boolean
          name: string
          type: Database["public"]["Enums"]["transaction_type"]
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          expense_group?: Database["public"]["Enums"]["expense_group"] | null
          family_id: string
          icon?: string | null
          id?: string
          is_default?: boolean
          name: string
          type: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          expense_group?: Database["public"]["Enums"]["expense_group"] | null
          family_id?: string
          icon?: string | null
          id?: string
          is_default?: boolean
          name?: string
          type?: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      families: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      family_invites: {
        Row: {
          created_at: string
          email: string
          expires_at: string
          family_id: string
          id: string
          invited_by: string
          role: Database["public"]["Enums"]["app_role"]
          status: Database["public"]["Enums"]["invite_status"]
        }
        Insert: {
          created_at?: string
          email: string
          expires_at?: string
          family_id: string
          id?: string
          invited_by: string
          role?: Database["public"]["Enums"]["app_role"]
          status?: Database["public"]["Enums"]["invite_status"]
        }
        Update: {
          created_at?: string
          email?: string
          expires_at?: string
          family_id?: string
          id?: string
          invited_by?: string
          role?: Database["public"]["Enums"]["app_role"]
          status?: Database["public"]["Enums"]["invite_status"]
        }
        Relationships: [
          {
            foreignKeyName: "family_invites_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      family_member_permissions: {
        Row: {
          can_create_transactions: boolean
          can_delete_own_transactions: boolean
          can_edit_own_transactions: boolean
          can_view_all_transactions: boolean
          created_at: string
          family_id: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          can_create_transactions?: boolean
          can_delete_own_transactions?: boolean
          can_edit_own_transactions?: boolean
          can_view_all_transactions?: boolean
          created_at?: string
          family_id: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          can_create_transactions?: boolean
          can_delete_own_transactions?: boolean
          can_edit_own_transactions?: boolean
          can_view_all_transactions?: boolean
          created_at?: string
          family_id?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "family_member_permissions_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          family_id: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          family_id?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          family_id?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      system_settings: {
        Row: {
          created_at: string
          id: string
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          category_id: string | null
          created_at: string
          description: string | null
          due_date: string
          expense_group: Database["public"]["Enums"]["expense_group"] | null
          family_id: string
          id: string
          is_paid: boolean
          name: string
          notification_sent: boolean
          notify_days_before: number | null
          notify_on_due: boolean
          paid_date: string | null
          parent_transaction_id: string | null
          recurrence_count: number | null
          recurrence_end_date: string | null
          recurrence_index: number | null
          recurrence_interval: number | null
          recurrence_start_date: string | null
          recurrence_type: Database["public"]["Enums"]["recurrence_type"]
          type: Database["public"]["Enums"]["transaction_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          category_id?: string | null
          created_at?: string
          description?: string | null
          due_date: string
          expense_group?: Database["public"]["Enums"]["expense_group"] | null
          family_id: string
          id?: string
          is_paid?: boolean
          name: string
          notification_sent?: boolean
          notify_days_before?: number | null
          notify_on_due?: boolean
          paid_date?: string | null
          parent_transaction_id?: string | null
          recurrence_count?: number | null
          recurrence_end_date?: string | null
          recurrence_index?: number | null
          recurrence_interval?: number | null
          recurrence_start_date?: string | null
          recurrence_type?: Database["public"]["Enums"]["recurrence_type"]
          type: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          category_id?: string | null
          created_at?: string
          description?: string | null
          due_date?: string
          expense_group?: Database["public"]["Enums"]["expense_group"] | null
          family_id?: string
          id?: string
          is_paid?: boolean
          name?: string
          notification_sent?: boolean
          notify_days_before?: number | null
          notify_on_due?: boolean
          paid_date?: string | null
          parent_transaction_id?: string | null
          recurrence_count?: number | null
          recurrence_end_date?: string | null
          recurrence_index?: number | null
          recurrence_interval?: number | null
          recurrence_start_date?: string | null
          recurrence_type?: Database["public"]["Enums"]["recurrence_type"]
          type?: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_parent_transaction_id_fkey"
            columns: ["parent_transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
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
          role: Database["public"]["Enums"]["app_role"]
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_member_permissions: {
        Args: { _family_id: string; _user_id: string }
        Returns: {
          can_create_transactions: boolean
          can_delete_own_transactions: boolean
          can_edit_own_transactions: boolean
          can_view_all_transactions: boolean
          created_at: string
          family_id: string
          id: string
          updated_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "family_member_permissions"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      get_user_family_id: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_family_manager: {
        Args: { _family_id: string; _user_id: string }
        Returns: boolean
      }
      is_family_member: {
        Args: { _family_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "family_manager" | "family_member"
      expense_group: "basic" | "financing" | "eventual"
      invite_status: "pending" | "accepted" | "rejected"
      recurrence_type:
        | "none"
        | "weekly"
        | "biweekly"
        | "monthly"
        | "yearly"
        | "custom"
      transaction_type: "revenue" | "expense"
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
      app_role: ["admin", "family_manager", "family_member"],
      expense_group: ["basic", "financing", "eventual"],
      invite_status: ["pending", "accepted", "rejected"],
      recurrence_type: [
        "none",
        "weekly",
        "biweekly",
        "monthly",
        "yearly",
        "custom",
      ],
      transaction_type: ["revenue", "expense"],
    },
  },
} as const
