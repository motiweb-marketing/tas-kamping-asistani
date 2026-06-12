-- Deneme / tam sürüm plan limitleri

ALTER TABLE campaigns
  ADD COLUMN IF NOT EXISTS plan_tier TEXT NOT NULL DEFAULT 'trial',
  ADD COLUMN IF NOT EXISTS max_tents INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS max_users INTEGER NOT NULL DEFAULT 2;

ALTER TABLE campaigns DROP CONSTRAINT IF EXISTS campaigns_plan_tier_check;
ALTER TABLE campaigns
  ADD CONSTRAINT campaigns_plan_tier_check CHECK (plan_tier IN ('trial', 'paid'));

COMMENT ON COLUMN campaigns.plan_tier IS 'trial: deneme; paid: tam sürüm';
COMMENT ON COLUMN campaigns.max_tents IS 'Maksimum çadır sayısı';
COMMENT ON COLUMN campaigns.max_users IS 'Maksimum kullanıcı sayısı (admin dahil)';

-- Mevcut kamplar tam sürüm (grandfather)
UPDATE campaigns
SET plan_tier = 'paid', max_tents = 99, max_users = 99
WHERE plan_tier = 'trial' OR plan_tier IS NULL;
