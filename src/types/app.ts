import type {
  CampDuty,
  CampExpense,
  Campaign,
  ChatMessage,
  Item,
  ItemCategory,
  ItemDisposition,
  ItemListScope,
  MealType,
  SafeUser,
  Tent,
  UserRole,
} from './database';

/** Cookie / JWT oturumunda tutulan kullanıcı bilgisi */
export interface SessionUser {
  id: string;
  campaign_id: string;
  tent_id: string | null;
  name: string;
  age: number;
  role: UserRole;
  username: string;
}

export interface ItemClaimWithTent {
  id: string;
  item_id: string;
  tent_id: string;
  quantity: number;
  tent?: Pick<Tent, 'id' | 'name'> | null;
}

/** Ana listede gösterilen zenginleştirilmiş item */
export interface ItemWithRelations extends Item {
  added_by_user?: Pick<SafeUser, 'id' | 'name'> | null;
  assigned_tent?: Pick<Tent, 'id' | 'name'> | null;
  claims?: ItemClaimWithTent[];
  claimed_total?: number;
  remaining_count?: number;
  my_claim?: number;
  /** Kişisel listede: kullanıcı işaretledi mi */
  checked?: boolean;
  /** Çadır listesinde: çadırda biri işaretledi mi */
  tent_checked?: boolean;
}

export interface CampExpenseWithRelations extends CampExpense {
  tent?: Pick<Tent, 'id' | 'name'> | null;
  item?: Pick<Item, 'id' | 'name'> | null;
  created_by_user?: Pick<SafeUser, 'id' | 'name'> | null;
}

export interface SummaryClaimLine {
  item_id: string;
  item_name: string;
  needed_count: number;
  unit_label: string;
  disposition: ItemDisposition;
  is_standard: boolean;
  claims: { tent_id: string; tent_name: string; quantity: number }[];
  claimed_total: number;
  remaining: number;
}

/** Chat balonlarında gösterilen mesaj */
export interface ChatMessageWithUser extends ChatMessage {
  user?: Pick<SafeUser, 'id' | 'name'> | null;
}

/** Çadır + üyeleri */
export interface TentWithMembers extends Tent {
  members: SafeUser[];
}

/** Bütçe hesaplama — çadır bazlı bakiye */
export interface BudgetTentBalance {
  tent: Pick<Tent, 'id' | 'name'>;
  member_count: number;
  total_shares: number;
  share_cost: number;
  accommodation_owed: number;
  grocery_expected: number;
  expected_contribution: number;
  actual_spent: number;
  balance: number;
  status: 'alacakli' | 'borclu' | 'denk';
}

/** Kamp geneli bütçe özeti */
export type AccommodationPricingMode = 'flat' | 'age_split';

export interface BudgetSummary {
  campaign: Pick<Campaign, 'id' | 'name'>;
  accommodation_use_age_pricing: boolean;
  accommodation_child_age_max: number;
  adult_accommodation_fee: number;
  child_accommodation_fee: number;
  total_accommodation_cost: number;
  total_grocery_cost: number;
  total_cost: number;
  total_shares: number;
  cost_per_share: number;
  adult_count: number;
  child_count: number;
  tent_balances: BudgetTentBalance[];
}

// ---------------------------------------------------------------------------
// Form / API girdi tipleri
// ---------------------------------------------------------------------------

export interface CreateCampaignInput {
  name: string;
  location?: string;
  start_date: string;
  end_date: string;
  admin_name: string;
  admin_tent_name: string;
  admin_username: string;
  admin_password: string;
  admin_age: number;
}

export interface CampDutyWithRelations extends CampDuty {
  assigned_tent?: Pick<Tent, 'id' | 'name'> | null;
  assigned_user?: Pick<SafeUser, 'id' | 'name' | 'role'> | null;
}

export interface CreateUserInput {
  campaign_id: string;
  tent_id: string;
  name: string;
  age: number;
  role?: UserRole;
  username: string;
  password: string;
}

export interface CreateItemInput {
  campaign_id: string;
  name: string;
  quantity: string;
  category: ItemCategory;
  list_scope?: ItemListScope;
  is_recommendation?: boolean;
  notes?: string;
  added_by?: string;
  is_extra?: boolean;
  is_published?: boolean;
  price?: number;
}

export interface UpdateItemInput {
  name?: string;
  quantity?: string;
  category?: ItemCategory;
  list_scope?: ItemListScope;
  notes?: string;
  assigned_tent_id?: string | null;
  price?: number;
  is_published?: boolean;
}

export interface CreateMenuInput {
  campaign_id: string;
  day: string;
  meal_type: MealType;
  description: string;
}

export interface LoginInput {
  username: string;
  password: string;
  campaign_id?: string;
}

/** Kamp AI durumu — müşteri API anahtarı girmez */
export interface CampaignSettings {
  configured: boolean;
  is_pro?: boolean;
  masked_key: string;
}
