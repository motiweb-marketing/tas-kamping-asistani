import type {
  Campaign,
  ChatMessage,
  Item,
  ItemCategory,
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

/** Ana listede gösterilen zenginleştirilmiş item */
export interface ItemWithRelations extends Item {
  added_by_user?: Pick<SafeUser, 'id' | 'name'> | null;
  assigned_tent?: Pick<Tent, 'id' | 'name'> | null;
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
  expected_contribution: number;
  actual_spent: number;
  balance: number;
  status: 'alacakli' | 'borclu' | 'denk';
}

/** Kamp geneli bütçe özeti */
export interface BudgetSummary {
  campaign: Pick<Campaign, 'id' | 'name'>;
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
  admin_username: string;
  admin_password: string;
  admin_age: number;
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
  added_by?: string;
  is_extra?: boolean;
  is_published?: boolean;
  price?: number;
}

export interface UpdateItemInput {
  name?: string;
  quantity?: string;
  category?: ItemCategory;
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

/** Admin ayarlar sayfası — maskelenmiş API anahtarı durumu */
export interface CampaignSettings {
  configured: boolean;
  masked_key: string;
}
