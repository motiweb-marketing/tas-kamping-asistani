/**
 * Supabase PostgreSQL şemasına karşılık gelen ham veri tipleri.
 * Enum'lar veritabanındaki PostgreSQL enum'larıyla birebir eşleşir.
 */

export type UserRole = 'admin' | 'user';
export type MealType = 'breakfast' | 'dinner';
export type MealPeriod = 'breakfast' | 'dinner';
export type MenuEntryKind = 'breakfast' | 'meal' | 'snack';
export type ItemCategory = 'food' | 'equipment';
export type ItemListScope = 'shared' | 'tent' | 'personal';
export type ItemDisposition = 'consumable' | 'returnable';
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
  adult_accommodation_fee: number;
  child_accommodation_fee: number;
  accommodation_use_age_pricing: boolean;
  accommodation_child_age_max: number;
  plan_tier: 'trial' | 'paid';
  max_tents: number;
  max_users: number;
  use_platform_ai?: boolean;
  platform_notes?: string | null;
  owner_contact_name?: string | null;
  owner_contact_email?: string | null;
  list_generation_context?: Record<string, unknown> | null;
  list_baseline_headcount?: number | null;
  list_baseline_adults?: number | null;
  list_baseline_children?: number | null;
  list_generated_at?: string | null;
  camp_setup_profile?: Record<string, unknown> | null;
  created_at: string;
}

/** API yanıtlarında anahtar asla düz metin dönmez */
export type SafeCampaign = Omit<Campaign, 'openrouter_api_key'>;

export interface Tent {
  id: string;
  campaign_id: string;
  name: string;
  max_capacity: number;
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
  last_login_at?: string | null;
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
  needed_count: number;
  unit_label: string;
  category: ItemCategory;
  list_scope: ItemListScope;
  is_recommendation: boolean;
  is_standard: boolean;
  disposition: ItemDisposition;
  notes: string | null;
  added_by: string | null;
  assigned_tent_id: string | null;
  is_extra: boolean;
  is_published: boolean;
  price: number;
  scales_with_people?: boolean;
  quantity_amount?: number | null;
  quantity_unit_text?: string | null;
  baseline_headcount?: number | null;
  section_id?: string | null;
  created_at: string;
}

export interface ListSection {
  id: string;
  campaign_id: string;
  list_scope: ItemListScope;
  name: string;
  sort_order: number;
  created_at: string;
  item_count?: number;
}

export interface ItemClaim {
  id: string;
  item_id: string;
  tent_id: string;
  quantity: number;
  created_at: string;
}

export interface CampExpense {
  id: string;
  campaign_id: string;
  item_id: string | null;
  tent_id: string;
  amount: number;
  description: string;
  created_by: string | null;
  created_at: string;
}

export interface ItemCheck {
  id: string;
  item_id: string;
  user_id: string;
  tent_id: string | null;
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
