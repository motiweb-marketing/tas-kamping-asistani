-- Menü slotları: çoklu öğün girişi (kahvaltı / yemek / ara öğün)

DO $$ BEGIN
  CREATE TYPE menu_entry_kind AS ENUM ('breakfast', 'meal', 'snack');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE meal_period AS ENUM ('breakfast', 'dinner');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE menus
  ADD COLUMN IF NOT EXISTS camp_day_number INTEGER,
  ADD COLUMN IF NOT EXISTS period meal_period,
  ADD COLUMN IF NOT EXISTS entry_kind menu_entry_kind,
  ADD COLUMN IF NOT EXISTS is_departure BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0;

-- Eski kayıtları yeni alanlara taşı
UPDATE menus SET
  period = meal_type::text::meal_period,
  entry_kind = CASE WHEN meal_type = 'breakfast' THEN 'breakfast'::menu_entry_kind ELSE 'meal'::menu_entry_kind END,
  camp_day_number = 1
WHERE period IS NULL;

ALTER TABLE menus DROP CONSTRAINT IF EXISTS menus_campaign_id_day_meal_type_key;

CREATE INDEX IF NOT EXISTS idx_menus_slot ON menus(campaign_id, day, period);

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE menus;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
