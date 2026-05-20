/**
 * 이 파일은 supabase CLI로 자동 생성될 예정:
 *   pnpm supabase:gen-types
 *
 * 지금은 마이그레이션 SQL과 일치하는 수동 정의.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          nickname: string | null;
          selected_hammer_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          nickname?: string | null;
          selected_hammer_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          nickname?: string | null;
          selected_hammer_id?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      items: {
        Row: {
          id: string;
          user_id: string | null;
          label: string;
          sub_text: string | null;
          emoji: string;
          category: string | null;
          is_default: boolean;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          label: string;
          sub_text?: string | null;
          emoji: string;
          category?: string | null;
          is_default?: boolean;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          label?: string;
          sub_text?: string | null;
          emoji?: string;
          category?: string | null;
          sort_order?: number;
        };
        Relationships: [];
      };
      press_records: {
        Row: {
          id: string;
          user_id: string;
          item_id: string | null;
          item_label_snapshot: string;
          item_emoji_snapshot: string;
          duration_ms: number;
          message_id: string | null;
          message_content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          item_id?: string | null;
          item_label_snapshot: string;
          item_emoji_snapshot: string;
          duration_ms: number;
          message_id?: string | null;
          message_content: string;
          created_at?: string;
        };
        Update: never;
        Relationships: [];
      };
      collected_messages: {
        Row: {
          id: string;
          user_id: string;
          message_id: string;
          message_content: string;
          first_collected_at: string;
          collect_count: number;
        };
        Insert: {
          id?: string;
          user_id: string;
          message_id: string;
          message_content: string;
          first_collected_at?: string;
          collect_count?: number;
        };
        Update: {
          collect_count?: number;
        };
        Relationships: [];
      };
      hammers: {
        Row: {
          id: string;
          name: string;
          image_url: string;
          sort_order: number;
          is_default: boolean;
          created_at: string;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      email_account_status: {
        Args: { p_email: string };
        Returns: string;
      };
    };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
}

// 편의 타입
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Item = Database['public']['Tables']['items']['Row'];
export type PressRecord = Database['public']['Tables']['press_records']['Row'];
export type CollectedMessage =
  Database['public']['Tables']['collected_messages']['Row'];
export type Hammer = Database['public']['Tables']['hammers']['Row'];
