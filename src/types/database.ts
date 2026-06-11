/**
 * Supabase PostgreSQL şemasına karşılık gelen ham veri tipleri.
 * Enum'lar veritabanındaki PostgreSQL enum'larıyla birebir eşleşir.
 */

export type UserRole = 'admin' | 'user';
export type MealType = 'breakfast' | 'dinner';
export type MealPeriod = 'breakfast' | 'dinner';
export type MenuEntryKind = 'breakfast' | 'meal' | 'snack';
export type ItemCategory = 'food' | 'equipment';
export type DutyPeriod = 'breakfast' | 'dinner';
export type DutyKind = 'meal_prep' | 'fire' | 'tea' | 'dishes';

export interface Campaign {
  id: string;
  name: string;
  location: string;
  start_date: string; // ISO date: YYYY-MM-DD
  end_date: string;
  admin_id: string | null;
  openrouter_api_key: string | null;
  menu_ai_prompt: string | null;
  published_menu: string | null;
  created_at: string;
}

/** API yanıtlarında anahtar asla düz metin dönmez */
export type SafeCampaign = Omit<Campaign, 'openrouter_api_key'>;

export interface Tent {
  id: string;
  campaign_id: string;
  name: string;
  created_at: string;
}

export interface User {
  id: string;
  campaign_id: string;
  tent_id: string | null;
  name: string;
  age: number;
  role: UserRole;
  username: string;
  password_hash: string;
  created_at: string;
}

/** Oturum / API yanıtlarında şifre hash'i asla dönmez */
export type SafeUser = Omit<User, 'password_hash'>;

export interface Menu {
  id: string;
  campaign_id: string;
  day: string;
  meal_type: MealType;
  description: string;
  camp_day_number: number | null;
  period: MealPeriod | null;
  entry_kind: MenuEntryKind | null;
  is_departure: boolean;
  sort_order: number;
  created_at: string;
}

export interface Item {
  id: string;
  campaign_id: string;
  name: string;
  quantity: string;
  category: ItemCategory;
  added_by: string | null;
  assigned_tent_id: string | null;
  is_extra: boolean;
  is_published: boolean;
  price: number;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  campaign_id: string;
  user_id: string | null;
  message: string;
  is_system: boolean;
  created_at: string;
}

/** OpenRouter AI yanıtından beklenen tek satır formatı */
export interface AiGeneratedItem {
  name: string;
  quantity: string;
  category: ItemCategory;
}

/** AI listesi oluşturma isteği için menü özeti */
export interface MenuSummaryLine {
  day: string;
  meal_type: MealType;
  period?: MealPeriod | null;
  entry_kind?: MenuEntryKind | null;
  description: string;
}

export interface CampDuty {
  id: string;
  campaign_id: string;
  camp_day_number: number;
  slot_date: string;
  period: DutyPeriod;
  duty_kind: DutyKind;
  title: string;
  is_departure: boolean;
  assigned_tent_id: string | null;
  assigned_user_id: string | null;
  release_requested: boolean;
  created_at: string;
}
