-- Supabase SQL Editor'da bir kez çalıştırın (011_tent_capacity ile aynı)

ALTER TABLE tents
  ADD COLUMN IF NOT EXISTS max_capacity INTEGER NOT NULL DEFAULT 4;

ALTER TABLE tents DROP CONSTRAINT IF EXISTS tents_max_capacity_check;
ALTER TABLE tents
  ADD CONSTRAINT tents_max_capacity_check CHECK (max_capacity >= 1 AND max_capacity <= 99);

UPDATE tents t
SET max_capacity = 20
FROM campaigns c
WHERE t.campaign_id = c.id AND c.plan_tier = 'paid';
