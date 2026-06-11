-- Üç katmanlı liste: kişisel, çadır, ortak alışveriş

DO $$ BEGIN
  CREATE TYPE item_list_scope AS ENUM ('shared', 'tent', 'personal');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE items
  ADD COLUMN IF NOT EXISTS list_scope item_list_scope NOT NULL DEFAULT 'shared',
  ADD COLUMN IF NOT EXISTS is_recommendation BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS notes TEXT DEFAULT '';

CREATE TABLE IF NOT EXISTS item_checks (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id    UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tent_id    UUID REFERENCES tents(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(item_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_items_campaign_scope ON items(campaign_id, list_scope);
CREATE INDEX IF NOT EXISTS idx_item_checks_item ON item_checks(item_id);
CREATE INDEX IF NOT EXISTS idx_item_checks_tent ON item_checks(tent_id);
