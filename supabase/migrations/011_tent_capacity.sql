-- Çadır başına kişi kapasitesi (organizatör düzenleyebilir)
ALTER TABLE tents
  ADD COLUMN IF NOT EXISTS max_capacity INTEGER NOT NULL DEFAULT 4;

ALTER TABLE tents
  ADD CONSTRAINT tents_max_capacity_check CHECK (max_capacity >= 1 AND max_capacity <= 99);

COMMENT ON COLUMN tents.max_capacity IS 'Bu çadırda en fazla kaç kişi olabilir';

-- Pro kampanyalarda mevcut çadırları plan üst sınırına yaklaştır
UPDATE tents t
SET max_capacity = 20
FROM campaigns c
WHERE t.campaign_id = c.id AND c.plan_tier = 'paid';
