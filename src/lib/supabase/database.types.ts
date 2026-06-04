export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type Relationship = {
  foreignKeyName: string;
  columns: string[];
  isOneToOne: boolean;
  referencedRelation: string;
  referencedColumns: string[];
};

export type Database = {
  public: {
    Tables: {
      content_items: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          url: string;
          platform: Database["public"]["Enums"]["platform"];
          content_type: Database["public"]["Enums"]["content_type"];
          external_id: string | null;
          thumbnail_url: string | null;
          published_at: string | null;
          topic: string | null;
          hook_text: string | null;
          hook_type: Database["public"]["Enums"]["hook_type"] | null;
          cta_keyword: string | null;
          notes: string | null;
          status: Database["public"]["Enums"]["content_status"];
          source: Database["public"]["Enums"]["content_source"];
          source_account_id: string | null;
          last_synced_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          url: string;
          platform: Database["public"]["Enums"]["platform"];
          content_type: Database["public"]["Enums"]["content_type"];
          external_id?: string | null;
          thumbnail_url?: string | null;
          published_at?: string | null;
          topic?: string | null;
          hook_text?: string | null;
          hook_type?: Database["public"]["Enums"]["hook_type"] | null;
          cta_keyword?: string | null;
          notes?: string | null;
          status?: Database["public"]["Enums"]["content_status"];
          source?: Database["public"]["Enums"]["content_source"];
          source_account_id?: string | null;
          last_synced_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["content_items"]["Insert"]>;
        Relationships: [Relationship];
      };
      content_tags: {
        Row: {
          content_item_id: string;
          tag_id: string;
          created_at: string;
        };
        Insert: {
          content_item_id: string;
          tag_id: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["content_tags"]["Insert"]>;
        Relationships: [Relationship, Relationship];
      };
      platform_accounts: {
        Row: {
          id: string;
          user_id: string;
          provider: Database["public"]["Enums"]["platform_provider"];
          provider_account_id: string | null;
          account_name: string | null;
          scopes: string[] | null;
          access_token_encrypted: string | null;
          refresh_token_encrypted: string | null;
          token_expires_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          provider: Database["public"]["Enums"]["platform_provider"];
          provider_account_id?: string | null;
          account_name?: string | null;
          scopes?: string[] | null;
          access_token_encrypted?: string | null;
          refresh_token_encrypted?: string | null;
          token_expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["platform_accounts"]["Insert"]
        >;
        Relationships: [Relationship];
      };
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
      stat_snapshots: {
        Row: {
          id: string;
          content_item_id: string;
          snapshot_date: string;
          views: number | null;
          likes: number | null;
          comments: number | null;
          shares: number | null;
          saves: number | null;
          followers_or_subscribers_gained: number | null;
          average_view_duration_seconds: number | null;
          watch_time_minutes: number | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          content_item_id: string;
          snapshot_date: string;
          views?: number | null;
          likes?: number | null;
          comments?: number | null;
          shares?: number | null;
          saves?: number | null;
          followers_or_subscribers_gained?: number | null;
          average_view_duration_seconds?: number | null;
          watch_time_minutes?: number | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["stat_snapshots"]["Insert"]
        >;
        Relationships: [Relationship];
      };
      tags: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          slug: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          slug: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["tags"]["Insert"]>;
        Relationships: [Relationship];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      platform: "youtube" | "instagram";
      content_type: "youtube_video" | "youtube_short" | "instagram_reel";
      content_status: "active" | "archived";
      content_source: "manual" | "youtube_sync";
      hook_type:
        | "curiosity"
        | "problem_solution"
        | "story"
        | "listicle"
        | "challenge"
        | "educational"
        | "other";
      platform_provider: "youtube" | "instagram";
    };
    CompositeTypes: Record<string, never>;
  };
};
