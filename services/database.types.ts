import { Language, ActivityCategory, AntimethodStage, AppTheme, FeedItemType } from '../types';

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | any[]

export interface Database {
  public: {
    Tables: {
      activity_logs: {
        Row: {
          category: ActivityCategory
          created_at: string
          custom_title: string | null
          date: string
          duration_seconds: number
          id: string
          language: Language
          notes: string | null
          start_time: string | null
          sub_activity: string
          user_id: string
        }
        Insert: {
          category: ActivityCategory
          created_at?: string
          custom_title?: string | null
          date: string
          duration_seconds: number
          id?: string
          language: Language
          notes?: string | null
          start_time?: string | null
          sub_activity: string
          user_id: string
        }
        Update: {
          category?: ActivityCategory
          created_at?: string
          custom_title?: string | null
          date?: string
          duration_seconds?: number
          id?: string
          language?: Language
          notes?: string | null
          start_time?: string | null
          sub_activity?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      feed_item_likes: {
        Row: {
          created_at: string
          feed_item_id: number
          user_id: string
        }
        Insert: {
          created_at?: string
          feed_item_id: number
          user_id: string
        }
        Update: {
          created_at?: string
          feed_item_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feed_item_likes_feed_item_id_fkey"
            columns: ["feed_item_id"]
            referencedRelation: "feed_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feed_item_likes_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      feed_items: {
        Row: {
          content: Json
          created_at: string
          id: number
          type: FeedItemType
          user_id: string
        }
        Insert: {
          content: Json
          created_at?: string
          id?: number
          type: FeedItemType
          user_id: string
        }
        Update: {
          content?: Json
          created_at?: string
          id?: number
          type?: FeedItemType
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feed_items_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          current_stage: AntimethodStage
          display_name: string
          focus_points: number
          id: string
          email: string
          learning_days_count: number
          learning_languages: string[]
          profile_flair_id: string | null
          theme: AppTheme | null
          username: string
        }
        Insert: {
          avatar_url?: string | null
          current_stage?: AntimethodStage
          display_name: string
          email: string
          focus_points?: number
          id: string
          learning_days_count?: number
          learning_languages?: string[]
          profile_flair_id?: string | null
          theme?: AppTheme | null
          username: string
        }
        Update: {
          avatar_url?: string | null
          current_stage?: AntimethodStage
          display_name?: string
          email?: string
          focus_points?: number
          id?: string
          learning_days_count?: number
          learning_languages?: string[]
          profile_flair_id?: string | null
          theme?: AppTheme | null
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      relationships: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "relationships_follower_id_fkey"
            columns: ["follower_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "relationships_following_id_fkey"
            columns: ["following_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_feed_with_likes: {
        Args: {
          requesting_user_id: string
        }
        Returns: {
          id: number
          user_id: string
          type: FeedItemType
          content: Json
          created_at: string
          profiles: { username: string; display_name: string; avatar_url: string | null } | null
          like_count: number
          user_has_liked: boolean
        }[]
      }
      get_friends_leaderboard: {
        Args: {
          p_user_id: string
          period: string
        }
        Returns: {
          rank: number
          user_id: string
          username: string
          display_name: string
          avatar_url: string | null
          total_seconds: number
        }[]
      }
      get_leaderboard: {
        Args: {
          period: string
        }
        Returns: {
          rank: number
          user_id: string
          username: string
          display_name: string
          avatar_url: string | null
          total_seconds: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}