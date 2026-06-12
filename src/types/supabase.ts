import type {
  Campaign,
  ChatMessage,
  Item,
  ItemCategory,
  MealType,
  Menu,
  Tent,
  User,
  UserRole,
} from './database';

export type Database = {
  public: {
    Tables: {
      campaigns: {
        Row: Campaign;
        Insert: {
          id?: string;
          name: string;
          location?: string;
          start_date: string;
          end_date: string;
          admin_id?: string | null;
          openrouter_api_key?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          location?: string;
          start_date?: string;
          end_date?: string;
          admin_id?: string | null;
          openrouter_api_key?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      tents: {
        Row: Tent;
        Insert: {
          id?: string;
          campaign_id: string;
          name: string;
          max_capacity?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          campaign_id?: string;
          name?: string;
          max_capacity?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      users: {
        Row: User;
        Insert: {
          id?: string;
          campaign_id: string;
          tent_id?: string | null;
          name: string;
          age: number;
          role?: UserRole;
          username: string;
          password_hash: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          campaign_id?: string;
          tent_id?: string | null;
          name?: string;
          age?: number;
          role?: UserRole;
          username?: string;
          password_hash?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      menus: {
        Row: Menu;
        Insert: {
          id?: string;
          campaign_id: string;
          day: string;
          meal_type: MealType;
          description: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          campaign_id?: string;
          day?: string;
          meal_type?: MealType;
          description?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      items: {
        Row: Item;
        Insert: {
          id?: string;
          campaign_id: string;
          name: string;
          quantity?: string;
          category: ItemCategory;
          added_by?: string | null;
          assigned_tent_id?: string | null;
          is_extra?: boolean;
          is_published?: boolean;
          price?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          campaign_id?: string;
          name?: string;
          quantity?: string;
          category?: ItemCategory;
          added_by?: string | null;
          assigned_tent_id?: string | null;
          is_extra?: boolean;
          is_published?: boolean;
          price?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      chat_messages: {
        Row: ChatMessage;
        Insert: {
          id?: string;
          campaign_id: string;
          user_id?: string | null;
          message: string;
          is_system?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          campaign_id?: string;
          user_id?: string | null;
          message?: string;
          is_system?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      user_role: UserRole;
      meal_type: MealType;
      item_category: ItemCategory;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
