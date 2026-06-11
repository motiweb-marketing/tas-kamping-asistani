-- Kısmi üstlenme, standart malzemeler, harcama kaydı

ALTER TABLE items
  ADD COLUMN IF NOT EXISTS needed_count INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS unit_label TEXT NOT NULL DEFAULT 'adet',
  ADD COLUMN IF NOT EXISTS is_standard BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS disposition TEXT NOT NULL DEFAULT 'consumable'
    CHECK (disposition IN ('consumable', 'returnable'));

CREATE TABLE IF NOT EXISTS item_claims (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id    UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  tent_id    UUID NOT NULL REFERENCES tents(id) ON DELETE CASCADE,
  quantity   INTEGER NOT NULL CHECK (quantity > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(item_id, tent_id)
);

CREATE TABLE IF NOT EXISTS camp_expenses (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  item_id     UUID REFERENCES items(id) ON DELETE SET NULL,
  tent_id     UUID NOT NULL REFERENCES tents(id) ON DELETE CASCADE,
  amount      NUMERIC(10, 2) NOT NULL CHECK (amount >= 0),
  description TEXT DEFAULT '',
  created_by  UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_item_claims_item ON item_claims(item_id);
CREATE INDEX IF NOT EXISTS idx_item_claims_tent ON item_claims(tent_id);
CREATE INDEX IF NOT EXISTS idx_camp_expenses_campaign ON camp_expenses(campaign_id);
CREATE INDEX IF NOT EXISTS idx_camp_expenses_tent ON camp_expenses(tent_id);
